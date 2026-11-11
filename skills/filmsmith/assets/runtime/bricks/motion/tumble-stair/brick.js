// tumble-stair — three cards stand edge-on, then tumble in 3D along one smooth path into a staggered stair, sharp all
// the way, and keep turning slowly once they stand.
// Adapted from video-shotcraft demos/transition/card-flock-tumble/CardFlockTumble.tsx (card references/shots/transition/card-flock-tumble.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and the workbench
// UI removed (the cards are any painters, by default the sample's page, grid and detail); the flight only (the word wall,
// the pull into the centre, the core flash, the smoke ring and the slammed title are the scene flock-finale, the pull
// and the ring a collapse-burst preset); the three poses per card, the Catmull-Rom path split at 0.55, the out-cubic
// over the flight, the never-stopping idle turn (0.34°, −0.1°, 0.05° a frame, eased in over 14 frames) and the darker
// back cards are the upstream's; each card, its glow, its shadow and its hairline are one canvas.
import { mix, rgba, rrect } from '../../../handoffs/util.js';
import { el, n } from '../../dom.js';
import { painterOf } from '../../sample.js';

const CW = 560, CH = 400, R = 16, M = 130, PERSP = 1400, CY = 570;   // card size, corner, canvas margin; the flock sits 30 px low
const FLIGHT = [10, 54], END = 62, IDLE0 = 54 * 0.86;                 // upstream frames: the flight, the brick's end, the idle turn's start
const KEYS = ['x', 'y', 'rx', 'ry', 'rz', 's'];
// per card: edge-on, mid-tumble, standing in the stair (back to front)
const POSES = [
  [{ x: -8, y: -16, rx: 9, ry: 88, rz: 12, s: 1.05 }, { x: -135, y: -92, rx: 16, ry: 44, rz: -8, s: 1.38 }, { x: -108, y: -76, rx: 4, ry: 13, rz: -2, s: 1.62 }],
  [{ x: 0, y: 0, rx: 8, ry: 89, rz: 12, s: 1.0 }, { x: -16, y: -7, rx: 13, ry: 38, rz: -7, s: 1.42 }, { x: -5, y: -2, rx: 3, ry: 11, rz: -2, s: 1.68 }],
  [{ x: 8, y: 16, rx: 7, ry: 90, rz: 12, s: 0.95 }, { x: 112, y: 78, rx: 11, ry: 34, rz: -6, s: 1.46 }, { x: 90, y: 70, rx: 2, ry: 9, rz: -1, s: 1.74 }],
];
const outCubic = (u) => 1 - Math.pow(1 - u, 3);
const catmull = (p0, p1, p2, p3, t) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
const spline = (k, u) => {
  const seg = u < 0.55 ? 0 : 1, t = seg === 0 ? u / 0.55 : (u - 0.55) / 0.45, o = {};
  for (const key of KEYS) o[key] = catmull(k[Math.max(0, seg - 1)][key], k[seg][key], k[seg + 1][key], k[Math.min(2, seg + 2)][key], t);
  return o;
};
const idle = (f) => { const t = f - IDLE0; if (t <= 0) return { ry: 0, rx: 0, rz: 0 }; const r = Math.min(1, t / 14) ** 2; return { ry: t * 0.34 * r, rx: t * -0.1 * r, rz: t * 0.05 * r }; };
const rad = (d) => (d * Math.PI) / 180;
// a point (u, v) of a card (from its centre) on screen: scale, rotateZ, rotateY, rotateX, translate, then the perspective
const project = (q, u, v) => {
  let x = u * q.s, y = v * q.s, z = 0;
  [x, y] = [x * Math.cos(rad(q.rz)) - y * Math.sin(rad(q.rz)), x * Math.sin(rad(q.rz)) + y * Math.cos(rad(q.rz))];
  [x, z] = [x * Math.cos(rad(q.ry)) + z * Math.sin(rad(q.ry)), -x * Math.sin(rad(q.ry)) + z * Math.cos(rad(q.ry))];
  [y, z] = [y * Math.cos(rad(q.rx)) - z * Math.sin(rad(q.rx)), y * Math.sin(rad(q.rx)) + z * Math.cos(rad(q.rx))];
  const k = PERSP / (PERSP - z);
  return [960 + (q.x + x) * k, CY + (q.y + y) * k];
};

export default {
  id: 'tumble-stair', kind: 'motion',
  tier: 'T2', family: 'lift-flip', beats: 3.75,
  surface: ['dom'],
  roles: ['ground', 'panel', 'line', 'accent'],
  from: 'three cards standing edge-on near the centre, almost invisible',
  to: 'the three cards standing in a staggered stair, large and square-on, still turning slowly',
  interpolates: ['each card\'s position, three angles and scale along one Catmull-Rom path through three poses (out-cubic over the flight)', 'a slow idle turn that starts as the cards stand and never stops'],
  summary: 'Three cards stand edge-on, then tumble in 3D along one smooth path into a staggered stair, sharp all the way, and keep turning slowly once they stand.',
  theory: 'A card seen edge-on has almost no area, so its turn to face the viewer reads as an appearance out of nothing (the thin-edge reveal); one continuous path through three poses keeps the motion physical, and a stair of overlapping cards shows a set at a glance.',
  sceneRest: false,
  defaults: () => ({ cards: [{ scene: 'page', w: 1512 }, { scene: 'grid' }, { scene: 'detail' }], poses: POSES, idle: true, res: 2 }),
  prepare(P) { return { cards: P.cards.map((s) => painterOf(s, P)) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const f = FLIGHT[0] + Math.min(1, Math.max(0, p)) * (END - FLIGHT[0]);
    const u = outCubic(Math.min(1, (f - FLIGHT[0]) / (FLIGHT[1] - FLIGHT[0]))), d = P.idle ? idle(f) : { ry: 0, rx: 0, rz: 0 };
    return { p, f, poses: P.poses.map((k) => { const q = spline(k, u); return { ...q, ry: q.ry + d.ry, rx: q.rx + d.rx, rz: q.rz + d.rz }; }) };
  },
  build(root, P, D) {
    const c = P.colors, r = P.res;
    root.style.background = `radial-gradient(ellipse 46% 52% at 50% 53%, ${mix(c.ground, c.accent, 0.22)} 0%, ${c.ground} 72%)`;
    const stage = el('div', { position: 'absolute', inset: '0', overflow: 'hidden', perspective: `${PERSP}px`, perspectiveOrigin: `960px ${CY}px` }, root);
    // back to front in document order (no shared 3D space: each card flattens on its own and they stack, as upstream)
    const cards = D.cards.map((paint, i) => {
      const cv = el('canvas', { position: 'absolute', left: `${960 - CW / 2 - M}px`, top: `${CY - CH / 2 - M}px`, width: `${CW + 2 * M}px`, height: `${CH + 2 * M}px` }, stage);
      cv.width = Math.round((CW + 2 * M) * r); cv.height = Math.round((CH + 2 * M) * r);
      const g = cv.getContext('2d'); g.scale(r, r); g.translate(M, M);
      // a glow of the accent around it and a dark shadow below (the upstream's 0 0 70px and 0 26px 70px)
      g.save(); g.shadowColor = rgba(c.accent, 0.32); g.shadowBlur = 70 * r; rrect(g, 0, 0, CW, CH, R); g.fillStyle = c.panel; g.fill(); g.restore();
      g.save(); g.shadowColor = rgba(mix(c.ground, '#000000', 0.8), 0.6); g.shadowBlur = 70 * r; g.shadowOffsetY = 26 * r; rrect(g, 0, 0, CW, CH, R); g.fillStyle = c.panel; g.fill(); g.restore();
      g.save(); rrect(g, 0, 0, CW, CH, R); g.clip(); g.fillStyle = c.panel; g.fillRect(0, 0, CW, CH);
      // the painter's 1920 × 1080 scene covering the card (cropped at the sides)
      const k = CH / 1080; g.translate((CW - 1920 * k) / 2, 0); g.scale(k, k); paint(g); g.restore();
      // the back cards a step darker (depth in the stack)
      const dim = [0.2, 0.1, 0][Math.min(2, D.cards.length - 1 - i)] ?? 0;
      if (dim) { rrect(g, 0, 0, CW, CH, R); g.fillStyle = rgba(mix(c.ground, '#000000', 0.6), dim); g.fill(); }
      rrect(g, 0.5, 0.5, CW - 1, CH - 1, R - 0.5); g.strokeStyle = rgba(mix(c.line, c.accent, 0.4), 0.6); g.lineWidth = 1; g.stroke();
      return cv;
    });
    return { root, stage, cards, blurTarget: null };
  },
  pose(Rg, S) {
    Rg.cards.forEach((cv, i) => { const q = S.poses[i]; cv.style.transform = `translate3d(${n(q.x, 3)}px, ${n(q.y, 3)}px, 0) rotateX(${n(q.rx)}deg) rotateY(${n(q.ry)}deg) rotateZ(${n(q.rz)}deg) scale(${n(q.s, 5)})`; });
  },
  blur: () => false,
  // per card, back to front: the centre of its box on screen, then its left and right edges at that height
  track(S) {
    return S.poses.flatMap((q) => {
      const pts = [[-CW / 2, -CH / 2], [CW / 2, -CH / 2], [-CW / 2, CH / 2], [CW / 2, CH / 2]].map(([u, v]) => project(q, u, v));
      const xs = pts.map((t) => t[0]), ys = pts.map((t) => t[1]), cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      return [[(Math.min(...xs) + Math.max(...xs)) / 2, cy], [Math.min(...xs), cy], [Math.max(...xs), cy]];
    });
  },
};
