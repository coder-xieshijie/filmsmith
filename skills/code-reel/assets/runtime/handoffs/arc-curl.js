// arc-curl — one outline of constant arc length. A straight line curls into a ring with its midpoint fixed (curvature
// 0 → 2π/L), or a closed outline, resampled at equal arc length from the top, morphs into the next while turning
// through the shapes' symmetry angle (ring → node → box, or outlines the template gives). Theory: correspondence before
// interpolation (Sederberg & Greenwood 1992); the symmetry turn hides the in-between. references/transitions.md#arc-curl.

import { settle, ground } from './util.js';
import { resampleClosed, polygonCurve, polyPath } from './paths.js';

const ang = (u) => -Math.PI / 2 - 2 * Math.PI * u;   // start at the top, go left (counter-clockwise on screen)
const SHAPES = {
  ring: (u) => [Math.cos(ang(u)), Math.sin(ang(u))],
  // a circle with four square-ish ports (plateau bumps) at top, left, bottom, right: a router node
  node: (u) => {
    const th = ang(u);
    let d = Math.abs(((th % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2));
    d = Math.min(d, Math.PI / 2 - d);
    const x = Math.min(1, Math.max(0, (0.2 - d) / 0.035));
    const r = 1 + 0.26 * x * x * (3 - 2 * x);
    return [r * Math.cos(th), r * Math.sin(th)];
  },
  // rounded square (squircle, exponent 7): a service box
  box: (u) => {
    const th = ang(u), c = Math.cos(th), s = Math.sin(th);
    const r = 1 / Math.pow(Math.pow(Math.abs(c), 7) + Math.pow(Math.abs(s), 7), 1 / 7);
    return [r * c, r * s];
  },
};
const outlineOf = (spec, n, L) => {
  if (typeof spec === 'string') return resampleClosed(SHAPES[spec] || SHAPES.ring, n, L);
  if (spec.points) return resampleClosed(polygonCurve(spec.points), n, L);
  if (spec.fn) return resampleClosed(spec.fn, n, L);
  throw new Error('arc-curl: a shape is "ring", "node", "box", { points } or { fn }');
};
// the curl: an arc of length L with constant curvature k = 2πe/L, its midpoint fixed at the bottom of the future ring
const curl = (e, n, L) => {
  const r = L / (2 * Math.PI), k = (2 * Math.PI * e) / L, out = [];
  for (let i = 0; i <= n; i++) {
    const s = -L / 2 + (L * i) / n;
    out.push(k < 1e-6 ? [s, r] : [Math.sin(k * s) / k, r - (1 - Math.cos(k * s)) / k]);
  }
  return out;
};
const rot = (pts, a) => {
  if (!a) return pts;
  const c = Math.cos(a), s = Math.sin(a);
  return pts.map(([x, y]) => [x * c - y * s, x * s + y * c]);
};
const lerpPts = (A, B, e) => A.map((a, i) => [a[0] + (B[i][0] - a[0]) * e, a[1] + (B[i][1] - a[1]) * e]);

export default {
  name: 'arc-curl',
  tier: 'T0',
  beats: 1,
  modes: ['morph', 'thread'],
  roles: ['ground', 'accent'],
  from: 'a line, or a closed outline',
  to: 'a ring curled from the line, or the next outline',
  interpolates: ['curvature (line → ring)', 'every outline point, at equal arc length', 'rotation through the symmetry angle'],
  summary: 'A line of fixed length curls into a ring, or one outline morphs into the next while turning through its symmetry angle.',
  theory: 'Shape interpolation needs point correspondence first (Sederberg & Greenwood 1992); a turn through the symmetry angle hides the in-between.',
  defaults: {
    from: 'line',                        // 'line' | 'ring' | 'node' | 'box' | { points: [[x, y], ...] } | { fn: u => [x, y] }
    to: 'ring',
    turn: null,                          // rotation during a morph (rad); default π/2 (the 4-fold shapes' symmetry)
    center: [960, 490],
    length: 1600,                        // arc length of the outline (px)
    samples: 400,
    lineWidth: 10,
    colors: { ground: '#EDEFF2', accent: '#6A3DF0' },
  },
  prepare(P) {
    const n = P.samples, L = P.length;
    const kind = P.from === 'line' ? 'curl' : P.to === 'line' ? 'uncurl' : 'morph';
    if (kind !== 'morph') return { kind, ring: outlineOf('ring', n, L) };
    return { kind, A: outlineOf(P.from, n, L), B: outlineOf(P.to, n, L), turn: P.turn ?? Math.PI / 2 };
  },
  rest(side, P, D) {
    if (D.kind === 'morph') return side === 'from' ? { pts: D.A, closed: true } : { pts: rot(D.B, D.turn), closed: true };
    const straight = (D.kind === 'curl') === (side === 'from');
    return straight ? { pts: curl(0, P.samples, P.length), closed: false } : { pts: D.ring, closed: true };
  },
  at(p, P, D) {
    if (D.kind === 'morph') {
      const e = settle(p, 17);
      return e >= 1 ? { pts: rot(D.B, D.turn), closed: true } : { pts: rot(e > 0 ? lerpPts(D.A, D.B, e) : D.A, D.turn * e), closed: true };
    }
    const s = settle(p, 13), e = D.kind === 'curl' ? s : 1 - s;
    // the last ≤ 10 px gap closes under the round caps; then the ring is the closed outline itself
    if (e >= 0.994) return { pts: D.ring, closed: true };
    return { pts: curl(e, P.samples, P.length), closed: false };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    ctx.translate(P.center[0], P.center[1]);
    polyPath(ctx, S.pts, S.closed);
    ctx.lineWidth = P.lineWidth; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = P.colors.accent;
    ctx.stroke();
  },
  // ends and middle first (an open curl and the ring it closes into agree on these), then the quarter points
  track: (S) => {
    const n = S.pts.length, out = [S.pts[0], S.pts[n - 1], S.pts[n >> 1]];
    if (S.closed) for (let k = 1; k < 8; k++) out.push(S.pts[Math.floor((k * n) / 8)]);
    return out;
  },
};
