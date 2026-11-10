// re-encode — the same numbers, a new encoding: each bar's top becomes a sample point and its body thins away (left to
// right), then a trend curve draws through the same points. Data never change, only the encoding (distribution → trend).
// Theory: staged animated transitions between chart types help viewers track the data (Heer & Robertson 2007);
// position and length are encodings of one value (Bertin 1967). references/transitions.md#re-encode.

import { seg, settle, cubicInOut, ground } from './util.js';
import { measurePath, spanPath } from './paths.js';

export default {
  name: 're-encode',
  tier: 'T1',
  beats: 2,
  modes: ['tally', 'trace'],
  roles: ['ground', 'base', 'accent', 'rule'],
  from: 'a bar chart',
  to: 'a line chart of the same values (points, then the trend through them)',
  interpolates: ['bar width', 'point radius', 'drawn length of the curve'],
  summary: 'Bar tops become points and the bars thin away; a trend curve then draws through the same points.',
  theory: 'Animated transitions between chart types, in stages, improve tracking (Heer & Robertson 2007); the data stay, the encoding changes (Bertin 1967).',
  defaults: {
    direction: 'curve',                  // 'curve' (bars → curve) or 'bars' (curve → bars)
    values: [18, 21, 20, 24, 27, 26, 31, 34, 33, 38, 41, 44],
    x0: 160, width: 1600, base: 900,
    height: 560, max: null,              // px of `max` (default: largest value / 0.88)
    barWidth: 72, dot: 11, curveWidth: 6,
    axis: true,
    colors: { ground: '#0B111F', base: '#C0C8D0', accent: '#FFB71C', rule: '#2A3550' },
  },
  prepare(P) {
    const n = P.values.length, slot = P.width / n, max = P.max ?? Math.max(...P.values) / 0.88;
    const pts = P.values.map((v, i) => [P.x0 + slot * (i + 0.5), P.base - (v / max) * P.height]);
    // Catmull-Rom through the points, densely sampled, measured for the left-to-right draw
    const out = [];
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      for (let k = 0; k < 24; k++) {
        const u = k / 24, u2 = u * u, u3 = u2 * u;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(pts[n - 1]);
    return { pts, curve: measurePath(out), lag: (i) => (n > 1 ? (0.3 * i) / (n - 1) : 0) };
  },
  rest(side, P, D) {
    const bars = (P.direction === 'bars') === (side === 'to');
    const n = P.values.length;
    return { w: Array(n).fill(bars ? 1 : 0), r: Array(n).fill(bars ? 0 : 1), c: bars ? 0 : 1 };
  },
  at(p, P, D) {
    const q = P.direction === 'bars' ? 1 - p : p;
    const n = P.values.length;
    return {
      w: Array.from({ length: n }, (_, i) => 1 - cubicInOut(seg(q, D.lag(i), D.lag(i) + 0.4))),
      r: Array.from({ length: n }, (_, i) => settle(seg(q, D.lag(i), D.lag(i) + 0.35), 11)),
      c: cubicInOut(seg(q, 0.5, 1)),
    };
  },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    const C = P.colors;
    if (P.axis) { ctx.fillStyle = C.rule; ctx.fillRect(P.x0, P.base, P.width, 3); }
    ctx.fillStyle = C.base;
    D.pts.forEach(([x, y], i) => {
      const w = P.barWidth * S.w[i];
      if (w > 0.3) ctx.fillRect(x - w / 2, y, w, P.base - y);
    });
    if (S.c > 0) {
      spanPath(ctx, D.curve, 0, D.curve.len * S.c);
      ctx.strokeStyle = C.accent; ctx.lineWidth = P.curveWidth; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.fillStyle = C.base;
    D.pts.forEach(([x, y], i) => {
      const r = P.dot * S.r[i];
      if (r > 0.3) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    });
  },
};
