// step-wipe — a staircase front sweeps in from the left whose steps are exactly the next chart's values; the old bars
// retract toward the front, which swallows what it passes; landed, the staircase is the next bar chart. The template
// takes the old labels out before the wipe and brings the new ones in after it. Theory: form is content: the wipe's
// outline stays as the chart, one object across the cut (Heer & Robertson 2007). references/transitions.md#step-wipe.

import { seg, cubicInOut, ground } from './util.js';

export default {
  name: 'step-wipe',
  tier: 'T2',
  beats: 1,
  modes: ['tally', 'plakat'],
  roles: ['ground', 'base', 'accent', 'rule'],
  from: 'a horizontal bar chart (or any rows of bars)',
  to: 'a column chart whose columns are the wipe\'s steps',
  interpolates: ['front position (the staircase)', 'old bar length (retracting)'],
  summary: 'A staircase front whose steps are the next chart\'s values wipes across; the old bars retract into it; it stays as the chart.',
  theory: 'Form as content: the wipe outline remains as the next chart, one object across the change (Heer & Robertson 2007).',
  defaults: {
    from: { values: [48, 112, 86, 31, 22], anchor: 380, row0: 380, rowDy: 104, thick: 56, scale: 1180 / 112, highlight: 1 },
    to: { values: [46, 30, 16, 11, 6, 3], x0: 96, slot: 288, gap: 16, base: 900, scale: 520 / 46, highlight: null },
    axis: true,
    colors: { ground: '#0B111F', base: '#C0C8D0', accent: '#FFB71C', rule: '#2A3550' },
  },
  rest(side) { return side === 'from' ? { front: 0, r: 0 } : { front: 1, r: 1 }; },
  at(p) { return { front: cubicInOut(p), r: cubicInOut(seg(p, 0.1, 0.54)) }; },
  paint(ctx, S, P) {
    ground(ctx, P);
    const C = P.colors, B = P.to, A = P.from, n = B.values.length;
    const H = B.values.map((v) => v * B.scale), WTOT = n * B.slot + B.x0;
    const ox = S.front >= 1 ? 0 : -(1 - S.front) * WTOT;
    // the staircase: fixed columns, filled to the shifted step function
    for (let k = 0; k < n; k++) {
      const c0 = B.x0 + k * B.slot, c1 = c0 + B.slot - B.gap;
      for (let j = 0; j < n; j++) {
        const s0 = Math.max(c0, B.x0 + j * B.slot + ox), s1 = Math.min(c1, B.x0 + (j + 1) * B.slot + ox);
        if (s1 <= s0) continue;
        ctx.fillStyle = B.highlight === k && j === k ? C.accent : C.base;
        ctx.fillRect(s0, B.base - H[j], s1 - s0, H[j]);
      }
    }
    if (P.axis) { const w = Math.max(0, n * B.slot - B.gap + ox); if (w > 0) { ctx.fillStyle = C.rule; ctx.fillRect(B.x0, B.base, w, 3); } }
    // the old bars: clipped by the front at their row, their ends retracting toward it
    const frontAt = (y) => {
      let j = -1;
      for (let i = 0; i < n; i++) if (H[i] >= B.base - y) j = i;
      return j < 0 ? -1e4 : B.x0 + (j + 1) * B.slot - B.gap + ox;
    };
    A.values.forEach((v, i) => {
      const y = A.row0 + i * A.rowDy, end = A.anchor + v * A.scale * (1 - S.r);
      const x0 = Math.max(A.anchor, frontAt(y));
      if (end <= x0) return;
      ctx.fillStyle = A.highlight === i ? C.accent : C.base;
      ctx.fillRect(x0, y - A.thick / 2, end - x0, A.thick);
    });
  },
};
