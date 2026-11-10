// perspective-fling — a card is flung in from the side in a fish-eye perspective, the lens lengthening as it brakes;
// it snaps flat with a small overshoot, a two-frame shake and a ring of focus lines.
// Adapted from video-shotcraft demos/effects/slam-entrance-moves/KanadaPerspectiveSnap.tsx
// (card references/shots/effects/slam-entrance-moves.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion), dom surface (CSS 3D) with a canvas overlay for the
// streaks and focus lines; the card is the next scene cropped to its rect, the ground is the current scene; colours by
// role (streaks and lines in paper, every fourth in the accent); brand, demo copy, artwork, poster type band and the
// hold push removed; the card's own text follow-through (late slide, skew) is the scene's; motion blur from the tracked
// corners (a CSS blur while fast) instead of a horizontal-only blur.
import { clamp, lerp, mix, rgba } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { EASE, ramp } from '../../ease.js';
import { el, n, plane } from '../../dom.js';
import { painterOf, gridRect } from '../../sample.js';

const F = 36, SNAP = 18;                          // frames: fling 0–18, snap at 18, settled by 36 (upstream 2–38)
const TWIST = bez(0.62, 0, 0.3, 1);               // the pose lands later than the position
const spring = (t, damping, stiffness) => {
  if (t <= 0) return 0;
  const s = t / 30, w0 = Math.sqrt(stiffness), z = damping / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + ((z * w0) / wd) * Math.sin(wd * s));
};
const STREAKS = [-250, -170, -90, -20, 60, 140, 230];

export default {
  id: 'perspective-fling', kind: 'motion',
  tier: 'T2', family: 'horizontal', beats: 2.4,
  surface: ['dom'],
  roles: ['ground', 'ink', 'accent', 'paper'],
  from: 'the scene without the card',
  to: 'the scene with the card in its place',
  interpolates: ['x −1350 → 0 with a small dip (snappy)', 'rotate3d(0.5, 1, 0.1) 62° → 0, scale 1.8 → 1, perspective 260 → 1800 px (later curve)', 'rotateY overshoot +6° → 0 (spring)', 'speed streaks, a 2-frame shake, focus lines for 9 frames'],
  summary: 'A card is flung in from the side in a fish-eye perspective that flattens as it brakes, then snaps flat with an overshoot and focus lines.',
  theory: 'Kanada-style animation: an exaggerated lens on a fast object reads as speed and nearness, and the snap to flat on the overshoot is the accent ("the slap is in the rebound"); a pose that lands later than the position is drag (Thomas & Johnston, follow-through).',
  defaults: () => ({ from: { scene: 'grid', skip: 4, target: 4 }, to: { scene: 'grid', target: 4 }, rect: gridRect(4), dx: -1350, lines: 48, shake: 8 }),
  prepare(P) { return { from: painterOf(P.from, P), to: painterOf(P.to, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const f = p * F, u = ramp(f, 0, SNAP, 'snappy'), tw = ramp(f, 0, SNAP - 2, TWIST);
    const rotY = p >= 1 ? 0 : f < SNAP ? 6 * ramp(f, SNAP - 5, 5, 'swift') : 6 * (1 - spring(f - SNAP, 16, 260));
    const sa = f >= SNAP && f < SNAP + 3 && p < 1 ? P.shake * (1 - (f - SNAP) / 3) : 0, fk = Math.floor(f);
    const v = f < SNAP + 2 ? Math.abs(P.dx) * (ramp(f + 0.5, 0, SNAP, 'snappy') - ramp(f - 0.5, 0, SNAP, 'snappy')) : 0;
    return {
      p, f, tx: lerp(P.dx, 0, u), ty: 120 * Math.sin((1 - u) * Math.PI * 0.5) * (1 - u),
      persp: lerp(260, 1800, tw), angle: lerp(62, 0, tw), scale: lerp(1.8, 1, lerp(u, tw, 0.5)), rotY,
      shake: [sa * (hash(fk * 7 + 1, P.seed) * 2 - 1), sa * (hash(fk * 13 + 2, P.seed) * 2 - 1)],
      streak: clamp((v - 5) / 35), v, focus: (f - SNAP) / 9, alpha: ramp(f, 0, 3, 'out'),
    };
  },
  // the card's transform and the container's perspective, as CSS writes them and as DOMMatrix computes them
  matrices(S, P) {
    const [, , w, h] = P.rect, o = [0.2 * w, 0.5 * h], po = [0.3 * w, 0.5 * h];
    const M = new DOMMatrix().translateSelf(o[0], o[1]).translateSelf(S.tx, S.ty).scaleSelf(S.scale, S.scale)
      .rotateAxisAngleSelf(0.5, 1, 0.1, S.angle).rotateSelf(0, S.rotY, 0).translateSelf(-o[0], -o[1]);
    const Pm = new DOMMatrix().translateSelf(po[0], po[1]); Pm.m34 = 0; const per = new DOMMatrix(); per.m34 = -1 / S.persp;
    return { M, V: Pm.multiply(per).translateSelf(-po[0], -po[1]) };
  },
  build(root, P, D) {
    const [x, y, w, h] = P.rect, c = P.colors;
    const back = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root);
    back.width = 1920; back.height = 1080; D.from(back.getContext('2d'));
    const shake = el('div', { position: 'absolute', inset: '0' }, root);
    const fx = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, shake);
    fx.width = 1920; fx.height = 1080;
    const box = el('div', { position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, perspectiveOrigin: '30% 50%' }, shake);
    const card = plane(box, w, h, (g) => { g.translate(-x, -y); D.to(g); });
    card.style.transformOrigin = '20% 50%';
    card.style.boxShadow = `0 30px 60px -20px ${rgba(mix(c.ink, '#000000', 0.6), 0.35)}`;
    return { back, shake, fx, box, card, blurTarget: card };
  },
  pose(rig, S, P) {
    const [x, y, w, h] = P.rect, c = P.colors;
    rig.shake.style.transform = `translate(${n(S.shake[0])}px, ${n(S.shake[1])}px)`;
    rig.box.style.perspective = `${n(S.persp, 2)}px`;
    rig.card.style.transform = `translate(${n(S.tx)}px, ${n(S.ty)}px) scale(${n(S.scale, 5)}) rotate3d(0.5, 1, 0.1, ${n(S.angle)}deg) rotateY(${n(S.rotY)}deg)`;
    rig.card.style.opacity = n(S.alpha, 4);
    const air = 1 - ramp(S.f, 0, SNAP + 4, 'out');
    rig.card.style.boxShadow = `${n(air * 90, 1)}px ${n(40 + air * 50, 1)}px ${n(90 + air * 40, 1)}px -20px ${rgba(mix(c.ink, '#000000', 0.6), 0.35 + 0.2 * air)}`;
    const g = rig.fx.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080);
    if (S.streak > 0.001) for (const [i, dy] of STREAKS.entries()) {   // speed lines behind the card, length ∝ speed
      const len = Math.min(1400, S.v * 9 * (0.7 + hash(i + 3, P.seed) * 0.6)), wd = 2 + hash(i + 11, P.seed) * 3;
      const x1 = x + S.tx + 120, yy = y + h / 2 + S.ty + dy * lerp(1.5, 1, ramp(S.f, 0, SNAP, 'snappy'));
      const col = i % 3 === 0 ? c.accent : c.paper, gr = g.createLinearGradient(x1 - len, 0, x1, 0);
      gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(1, rgba(col, 0.7 * S.streak));
      g.fillStyle = gr; g.fillRect(x1 - len, yy - wd / 2, len, wd);
    }
    if (S.focus >= 0 && S.focus < 1) {                          // focus lines: their inner ends recede as they fade
      const cx = x + w / 2, cy = y + h / 2;
      g.globalAlpha = (1 - S.focus) * 0.9;
      for (let i = 0; i < P.lines; i++) {
        const a = (i / P.lines) * Math.PI * 2 + (hash(i * 3 + 1, P.seed) - 0.5) * 0.09, wd = 0.006 + hash(i * 5 + 2, P.seed) * 0.014;
        const r0 = 560 + hash(i * 7 + 3, P.seed) * 220 + EASE.out(S.focus) * 420, r1 = 1500;
        g.fillStyle = i % 4 === 0 ? rgba(c.accent, 0.75) : rgba(c.paper, 0.5);
        g.beginPath(); g.moveTo(cx + Math.cos(a - wd) * r1, cy + Math.sin(a - wd) * r1); g.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        g.lineTo(cx + Math.cos(a + wd) * r1, cy + Math.sin(a + wd) * r1); g.closePath(); g.fill();
      }
      g.globalAlpha = 1;
    }
  },
  blur(p) { return p * F < SNAP; },
  track(S, P) {
    const [x, y, w, h] = P.rect, { M, V } = this.matrices(S, P), T = V.multiply(M);
    const at = (px, py) => { const q = T.transformPoint(new DOMPoint(px, py, 0, 1)); return [x + q.x / q.w + S.shake[0], y + q.y / q.w + S.shake[1]]; };
    return [at(0, 0), at(w, 0), at(0, h), at(w, h), at(w / 2, h / 2)];
  },
};
