// explode-z — a page lying at a three-quarter angle comes apart: its parts rise along the page's normal one after another,
// hang while the camera orbits a little, then drop back in reverse order and land with one damped thud.
// Adapted from video-shotcraft demos/camera/space-camera-moves/ExplodedView.tsx (card references/shots/camera/space-camera-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and the
// workbench UI removed: the parts are rectangles of any page painter (default the sample page, five parts) and the plate
// keeps dashed slots where they were; the camera, the springs (damping 15, stiffness 120, 5 frames apart), the reverse
// ease-in assembly and the thud are the upstream's; the callouts, the sheen and the outro title are left to the scene or
// the film (the callout anchors are in track()).
import { mix, rgba } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { el, n } from '../../dom.js';
import { painterOf } from '../../sample.js';

const W = 1600, H = 900, K = W / 1920, PERSP = 2400, R = 26;
const EXPLODE = 24, STAGGER = 5, ASSEMBLE = 108, BACK = 3, BACK_DUR = 14;
// the sample page's parts (scene px) and their heights, bottom to top
const PARTS = [
  { rect: [130, 380, 1660, 370], z: 150 },   // chart
  { rect: [120, 790, 533, 190], z: 270 },    // first KPI
  { rect: [693, 790, 1107, 190], z: 400 },   // the other two KPIs
  { rect: [100, 150, 1720, 200], z: 520 },   // eyebrow and claim
  { rect: [0, 0, 1920, 104], z: 640 },       // top bar
];
const lerp = (a, b, u) => a + (b - a) * u;
// a damped spring from 0 to 1 starting at frame a (closed form; fps 30, mass 1)
const spring = (f, a, { damping = 15, stiffness = 120 } = {}) => {
  const t = (f - a) / 30;
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness), z = damping / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
};
const camAt = (f) => {
  const orbit = ramp(f, 30, 74, 'smooth'), push = ramp(f, 0, 170, 'smooth'), tall = ramp(f, 22, 40, 'smooth') * (1 - ramp(f, 106, 30, 'smooth'));
  return { rx: lerp(54, 50, orbit), rz: lerp(-34, -32, ramp(f, 0, 30, 'out')) + 10 * orbit, s: lerp(0.56, 0.47, tall) * lerp(1, 1.04, push), cx: -20, cy: lerp(40, 180, tall) };
};
// a point of the plate (px, py from its top left; pz up its normal) on screen, the same matrix as the CSS
const project = (c, px, py, pz) => {
  const X = px - W / 2, Y = py - H / 2, a = (c.rz * Math.PI) / 180, b = (c.rx * Math.PI) / 180;
  const x1 = X * Math.cos(a) - Y * Math.sin(a), y1 = X * Math.sin(a) + Y * Math.cos(a);
  const y2 = y1 * Math.cos(b) - pz * Math.sin(b), z2 = y1 * Math.sin(b) + pz * Math.cos(b);
  const k = PERSP / (PERSP - z2);
  return [960 + (x1 * c.s + c.cx) * k, 540 + (y2 * c.s + c.cy) * k];
};

export default {
  id: 'explode-z', kind: 'motion',
  tier: 'T2', family: 'lift-flip', beats: 9.5,
  surface: ['dom'],
  roles: ['ground', 'panel', 'accent', 'line', 'ink'],
  from: 'the page whole, lying at a three-quarter angle',
  to: 'the page whole again after one thud',
  interpolates: ['each part\'s height along the page normal (spring up, ease-in down, staggered)', 'camera tilt, turn and scale (a small orbit while the parts hang)', 'shadows of the parts on the plate', 'the thud'],
  summary: 'A page lying at a three-quarter angle comes apart: its parts rise along the page\'s normal one after another, hang while the camera turns a little, then drop back in reverse and land with one thud.',
  theory: 'An exploded view shows how a thing is built by separating its parts along one axis while keeping their alignment (technical illustration); the layered parallax while the camera turns makes the depth readable, and reverse-order assembly closes the explanation.',
  sceneRest: false,
  defaults: () => ({ page: { scene: 'page' }, parts: PARTS, slots: true }),
  prepare(P) { return { page: painterOf(P.page, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const f = Math.min(1, Math.max(0, p)) * 142, N = P.parts.length, close = ASSEMBLE + (N - 1) * BACK + BACK_DUR;
    const lift = P.parts.map((_, i) => spring(f, EXPLODE + i * STAGGER) * (1 - ramp(f, ASSEMBLE + (N - 1 - i) * BACK, BACK_DUR, 'exit')));
    const since = f - close;
    const thud = since >= 0 && p < 1 ? 8 * Math.exp(-since / 3) * Math.cos(since * 0.9) : 0;
    const crouch = -6 * (ramp(f, 18, 6, 'out') * (1 - ramp(f, EXPLODE, 6, 'out')));
    const spread = ramp(f, EXPLODE, 30, 'out') * (1 - ramp(f, ASSEMBLE, close - ASSEMBLE, 'exit'));
    return { p, f, cam: camAt(f), lift, thud, crouch, spread };
  },
  build(root, P, D) {
    const c = P.colors, shade = mix(c.ground, '#000000', 0.75);
    root.style.background = `radial-gradient(ellipse 70% 70% at 36% 5%, ${mix(c.ground, '#FFFFFF', 0.25)} 0%, ${c.ground} 70%)`;
    const stage = el('div', { position: 'absolute', inset: '0', perspective: `${PERSP}px`, overflow: 'hidden' }, root);
    const plate = el('div', { position: 'absolute', left: `${960 - W / 2}px`, top: `${540 - H / 2}px`, width: `${W}px`, height: `${H}px`, transformStyle: 'preserve-3d' }, stage);
    const contact = el('div', { position: 'absolute', left: '-20px', top: '10px', width: `${W + 40}px`, height: `${H + 40}px`, borderRadius: `${R + 20}px`, background: shade, transform: 'translateZ(-30px) translate(30px, 40px)' }, plate);
    el('div', { position: 'absolute', inset: '0', borderRadius: `${R}px`, background: mix(c.panel, c.line, 0.7), transform: 'translateZ(-14px)' }, plate);
    const base = el('div', { position: 'absolute', inset: '0', borderRadius: `${R}px`, overflow: 'hidden', boxShadow: `inset 0 0 0 2px ${c.line}` }, plate);
    // the plate: the page with its parts cut out (panel colour) and a dashed slot where each was
    const bc = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${W}px`, height: `${H}px` }, base);
    bc.width = W; bc.height = H;
    const bg = bc.getContext('2d'); bg.save(); bg.scale(K, K); D.page(bg); bg.restore();
    bg.fillStyle = c.panel; for (const pt of P.parts) { const [x, y, w, h] = pt.rect; bg.fillRect(x * K, y * K, w * K, h * K); }
    const slots = P.parts.map((pt) => { const [x, y, w, h] = pt.rect.map((v) => v * K); return el('div', { position: 'absolute', left: `${n(x + 10)}px`, top: `${n(y + 10)}px`, width: `${n(w - 20)}px`, height: `${n(h - 20)}px`, borderRadius: '14px', border: `3px dashed ${rgba(c.accent, 0.28)}`, background: rgba(c.accent, 0.03), boxSizing: 'border-box' }, base); });
    const parts = P.parts.map((pt) => {
      const [x, y, w, h] = pt.rect.map((v) => v * K);
      const box = { position: 'absolute', left: `${n(x)}px`, top: `${n(y)}px`, width: `${n(w)}px`, height: `${n(h)}px` };
      const sh = el('div', { ...box, background: rgba(shade, 0.3), borderRadius: '18px' }, plate);
      const edge = el('div', { ...box, background: mix(c.panel, c.line, 0.8), borderRadius: '6px' }, plate);
      const face = el('div', { ...box, overflow: 'hidden' }, plate);
      const cv = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${n(w)}px`, height: `${n(h)}px` }, face);
      cv.width = Math.ceil(w); cv.height = Math.ceil(h);
      const g = cv.getContext('2d'); g.scale(K, K); g.translate(-pt.rect[0], -pt.rect[1]); D.page(g);
      return { sh, edge, face, z: pt.z, x, y };
    });
    return { root, stage, plate, contact, slots, parts, blurTarget: null };
  },
  pose(R, S, P) {
    const c = S.cam;
    R.plate.style.transform = `translate(${n(c.cx)}px, ${n(c.cy + S.thud)}px) scale(${n(c.s, 5)}) rotateX(${n(c.rx)}deg) rotateZ(${n(c.rz)}deg)`;
    const th = Math.max(0, S.thud / 8);
    R.contact.style.opacity = n(0.28 - 0.08 * S.spread + 0.06 * th, 4);
    R.contact.style.filter = `blur(${n(40 - 10 * th, 2)}px)`;
    R.slots.forEach((s) => { s.style.opacity = n(Math.min(1, S.spread * 2), 4); });
    R.parts.forEach((pt, i) => {
      const p = S.lift[i], z = pt.z * p + 2, lifted = Math.min(1, Math.max(0, p) * 4), hh = pt.z * Math.max(0, p);
      pt.face.style.transform = `translateZ(${n(z + S.crouch, 2)}px)`;
      pt.face.style.boxShadow = lifted > 0.02 ? `0 0 0 2px ${rgba('#FFFFFF', 0.9 * lifted)}` : 'none';
      pt.edge.style.transform = `translateZ(${n(Math.max(2.5, z - 8 + S.crouch), 2)}px)`;
      pt.edge.style.visibility = lifted > 0.02 ? 'visible' : 'hidden';
      pt.sh.style.transform = `translate(${n(hh * 0.18)}px, ${n(hh * 0.26)}px) translateZ(1px)`;
      pt.sh.style.filter = `blur(${n(10 + hh * 0.09, 1)}px)`;
      pt.sh.style.opacity = n(p < 0.01 ? 0 : Math.min(1, p * 1.5) * (0.8 - hh / 1400), 4);
    });
  },
  // 0, 1: the plate's left and right edge middles; 2: [960, the top part's height] (its lift curve); 3…: each part's
  // right-edge middle at its height (the anchors a callout would hang from)
  track(S, P) {
    const c = { ...S.cam, cy: S.cam.cy + S.thud }, top = P.parts.length - 1;
    return [project(c, 0, H / 2, 0), project(c, W, H / 2, 0), [960, P.parts[top].z * S.lift[top] + 2 + S.crouch],
      ...P.parts.map((pt, i) => { const [x, y, w, h] = pt.rect.map((v) => v * K); return project(c, x + w, y + h / 2, pt.z * S.lift[i] + 2 + S.crouch); })];
  },
};
