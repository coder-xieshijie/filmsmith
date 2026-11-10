// pose-fly — cards hang in 3D space, each with its own pose; the camera flies from one card's pose to the next by taking
// the inverse of the target pose, so the card it lands on is square and at 1:1 on screen.
// Adapted from video-shotcraft demos/camera/basic-3d-scene/Basic3DScene.tsx (card references/shots/camera/basic-3d-scene.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and the chapter
// posters removed (each card is a scene painter); one flight per brick (the upstream's three flights, holds and the
// overview plate are the scene space-steps); the poses and the flight curve (0.62, 0, 0.16, 1 with a 30 % hop) are the
// upstream's; the hold-phase creep, light breathing and the temporal-sample blur are left to the film (the runtime's
// CSS blur stands in for the subframes).
import { mix, rgba, rrect } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { el, n } from '../../dom.js';
import { painterOf } from '../../sample.js';

const CW = 1240, CH = (1240 * 1080) / 1920, PERSP = 2600, M = 140;
const FLY = bez(0.62, 0, 0.16, 1), HOP = 0.3;
const POSES = [
  { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 },
  { x: 1690, y: -260, z: -650, rx: 0, ry: -38, rz: 0, s: 1 },
  { x: 2590, y: 830, z: -850, rx: 0, ry: 0, rz: 90, s: 1 },
  { x: 594, y: 480, z: -400, rx: 0, ry: 0, rz: 0, s: 2.7 },   // the overview: no card, the camera pulls back 2.7×
];
const KEYS = ['x', 'y', 'z', 'rx', 'ry', 'rz', 's'];
const hash = (k) => { const x = Math.sin(k * 91.345 + 47.853) * 43758.5453; return x - Math.floor(x); };
const MOTES = Array.from({ length: 70 }, (_, i) => ({ x: -2600 + hash(i * 3.1) * 6800, y: -2000 + hash(i * 5.7 + 1) * 4800, z: -3200 + hash(i * 7.3 + 2) * 3600, r: 3 + hash(i * 11.9 + 3) * 7, a: 0.25 + hash(i * 13.1 + 4) * 0.55 }));

// 4 × 4 column-major matrices, composed in CSS order (the rightmost function applies first to a point)
const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
const I = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const T = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const Sc = (s) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];   // CSS scale(s) is 2D: z is not scaled
const rad = (d) => (d * Math.PI) / 180;
const RX = (d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; };
const RY = (d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; };
const RZ = (d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };
const chain = (...ms) => ms.reduce((a, b) => mul(a, b), I());
const camM = (c) => chain(Sc(1 / c.s), RZ(-c.rz), RY(-c.ry), RX(-c.rx), T(-c.x, -c.y, -c.z));
const poseM = (p, lift = 0) => chain(T(p.x, p.y, p.z), RX(p.rx), RY(p.ry), RZ(p.rz), Sc(p.s), T(0, 0, lift));
const camCSS = (c) => `scale(${n(1 / c.s, 5)}) rotateZ(${n(-c.rz)}deg) rotateY(${n(-c.ry)}deg) rotateX(${n(-c.rx)}deg) translate3d(${n(-c.x, 3)}px,${n(-c.y, 3)}px,${n(-c.z, 3)}px)`;
const poseCSS = (p, lift) => `translate3d(${p.x}px,${p.y}px,${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.s}) translateZ(${n(lift, 2)}px)`;
// screen position of a local point of a card (from its centre) for camera c
const screen = (c, p, lift, x, y) => {
  const m = mul(camM(c), poseM(p, lift));
  const X = m[0] * x + m[4] * y + m[12], Y = m[1] * x + m[5] * y + m[13], Z = m[2] * x + m[6] * y + m[14];
  const k = PERSP / (PERSP - Z);
  return [960 + X * k, 540 + Y * k];
};

export default {
  id: 'pose-fly', kind: 'motion',
  tier: 'T2', family: 'zoom-depth', beats: 2,
  surface: ['dom'],
  roles: ['ground', 'panel', 'ink', 'line'],
  from: 'the camera square on card `from` (1:1 on screen)',
  to: 'the camera square on card `to` (or the overview pose, 2.7× back)',
  interpolates: ['camera pose (position, three angles, scale) from the inverse of one card\'s pose to the inverse of the next', 'a 30 % hop back mid-flight', 'focus: the cards away from the camera blur and dim'],
  summary: 'Cards hang in 3D space, each with its own position, turn and scale; the camera flies from one to the next by taking the inverse of its pose, so the card it lands on is square and at 1:1.',
  theory: 'A camera that moves through one continuous space keeps every card\'s place known (spatial memory, the method of loci; impress.js "camera = step⁻¹"); the hop back mid-flight shows the other cards in space before landing.',
  sceneRest: false,
  defaults: () => ({ cards: [{ scene: 'title' }, { scene: 'grid' }, { scene: 'detail' }], poses: POSES, from: 0, to: 1, motes: true, defocus: null, res: 1 }),
  prepare(P) { return { cards: P.cards.map((s) => painterOf(s, P)) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const u = p <= 0 ? 0 : p >= 1 ? 1 : FLY(p);
    const a = P.poses[P.from], b = P.poses[P.to], cam = {};
    for (const k of KEYS) cam[k] = a[k] + (b[k] - a[k]) * u;
    const overview = P.to >= P.cards.length;
    if (!overview && u > 0 && u < 1) cam.s *= 1 + HOP * Math.sin(Math.PI * u);
    // defocus (CSS blur on the cards) is off by default when the flight changes the camera's scale: Chrome rasterises a
    // blurred 3D layer at a scale that depends on the frames before, so the same p would not give the same pixels
    const defocus = P.defocus ?? (a.s === 1 && b.s === 1);
    return { p, u, cam, af: P.from + (P.to - P.from) * u, over: overview ? u : 0, defocus };
  },
  build(root, P, D) {
    const c = P.colors;
    root.style.background = `radial-gradient(ellipse 70% 60% at 50% -8%, ${mix(c.ground, c.ink, 0.12)} 0%, ${c.ground} 70%)`;
    const stage = el('div', { position: 'absolute', inset: '0', overflow: 'hidden', perspective: `${PERSP}px` }, root);
    const world = el('div', { position: 'absolute', left: '50%', top: '50%', width: '0', height: '0', transformStyle: 'preserve-3d' }, stage);
    // every face in the world is a canvas: a canvas is a texture of fixed resolution, so the compositor samples the same
    // pixels whatever scale the frames before left it at (a CSS shadow, rounded clip or gradient is re-rasterised at a
    // scale Chrome picks from the layer's history, which made the 2.7× overview impure)
    if (P.motes) for (const m of MOTES) {
      const d = el('canvas', { position: 'absolute', left: `${-m.r}px`, top: `${-m.r}px`, width: `${m.r * 2}px`, height: `${m.r * 2}px`, transform: `translate3d(${n(m.x, 2)}px,${n(m.y, 2)}px,${n(m.z, 2)}px)` }, world);
      d.width = d.height = 32; const g = d.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, rgba(c.ink, m.a)); gr.addColorStop(0.7, rgba(c.ink, 0)); g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    }
    const cards = D.cards.map((paint) => {
      // the card with its shadow (the upstream's 0 30px 80px −10px) in a margin around it, its rounded clip and its border
      const d = el('canvas', { position: 'absolute', left: `${-CW / 2 - M}px`, top: `${-CH / 2 - M}px`, width: `${CW + 2 * M}px`, height: `${CH + 2 * M}px` }, world);
      const r = P.res; d.width = Math.round((CW + 2 * M) * r); d.height = Math.round((CH + 2 * M) * r);
      const g = d.getContext('2d'); g.scale(r, r); g.translate(M, M);
      g.save(); g.shadowColor = rgba(mix(c.ground, '#000000', 0.85), 0.7); g.shadowBlur = 80 * r; g.shadowOffsetY = 30 * r;
      rrect(g, 10, 10, CW - 20, CH - 20, 24); g.fillStyle = c.panel; g.fill(); g.restore();
      g.save(); rrect(g, 0, 0, CW, CH, 34); g.clip(); g.fillStyle = c.panel; g.fillRect(0, 0, CW, CH); g.scale(CW / 1920, CH / 1080); paint(g); g.restore();
      rrect(g, 0.75, 0.75, CW - 1.5, CH - 1.5, 33.25); g.strokeStyle = c.line; g.lineWidth = 1.5; g.stroke();
      return d;
    });
    return { root, stage, world, cards, blurTarget: stage };
  },
  pose(R, S, P) {
    R.world.style.transform = camCSS(S.cam);
    R.cards.forEach((d, i) => {
      const focus = Math.max(1 - Math.min(1, Math.abs(S.af - i)), S.over * 0.85), lift = (1 - Math.min(1, Math.abs(S.af - i))) * 18;
      d.style.transform = poseCSS(P.poses[i], lift);
      d.style.opacity = n(0.22 + 0.78 * focus, 4);
      d.style.filter = S.defocus && focus < 0.985 ? `blur(${n((1 - focus) * 7, 2)}px)` : 'none';
    });
  },
  // 0: the destination card's screen box centre; 1–4: its corners (the origin card is left out: once it is off frame
  // and near the eye its projection races, which is not motion anyone sees)
  track(S, P) {
    const box = (i) => {
      const p = P.poses[i], lift = (1 - Math.min(1, Math.abs(S.af - i))) * 18;
      const q = [[-CW / 2, -CH / 2], [CW / 2, -CH / 2], [-CW / 2, CH / 2], [CW / 2, CH / 2]].map(([x, y]) => screen(S.cam, p, lift, x, y));
      const xs = q.map((v) => v[0]), ys = q.map((v) => v[1]);
      return { c: [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2], q };
    };
    const B = box(Math.min(P.to, P.cards.length - 1));
    return [B.c, ...B.q];
  },
};
