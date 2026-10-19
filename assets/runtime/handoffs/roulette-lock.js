// roulette-lock — a highlight frame jumps one candidate per step (half a beat), laps the row, slows for the last two
// steps and locks on the answer; the others step back. A wrap from the last cell to the first slides instead of jumping.
// Theory: anticipation and resolution (Huron 2006, ITPRA): every jump is an onset, the lock is the resolution.
// references/transitions.md#roulette-lock.

import { seg, lerp, cubicOut, quintOut, mix, text, ground } from './util.js';

// hop schedule in beats: [{ b, cell }], lock time, total length
const schedule = (P) => {
  const n = P.labels.length, cells = [];
  for (let l = 0; l < P.laps; l++) for (let i = 0; i < n; i++) cells.push(i);
  for (let i = 0; i <= P.answer; i++) cells.push(i);
  const hops = [];
  let b = 0;
  cells.forEach((cell, i) => {
    hops.push({ b, cell });
    b += P.step * (i >= cells.length - 3 ? P.slow : 1);   // the last two intervals are longer
  });
  const lock = hops[hops.length - 1].b;
  return { hops, lock, beats: lock + P.settle };
};

export default {
  name: 'roulette-lock',
  tier: 'T1',
  beats: 5.4,
  beatsFor: (P) => schedule(P).beats,
  modes: ['pulse', 'tally', 'phosphor'],
  roles: ['ground', 'ink', 'cell', 'rule', 'rest', 'accent'],
  from: 'a row of real candidates, none chosen',
  to: 'the answer framed, the other candidates stepped back',
  interpolates: ['frame position (a jump per step; the wrap slides)', 'dimming of the others'],
  summary: 'A frame jumps one candidate per half beat, laps the row, slows and locks on the answer; the others step back.',
  theory: 'Expectation and resolution (Huron 2006, ITPRA): each jump is an onset, the lock resolves it.',
  defaults: {
    labels: ['1B', '3B', '8B', '14B', '32B', '70B'],
    answer: 3,
    laps: 1,
    step: 0.5,                           // beats per jump
    slow: 1.5,                           // the last two intervals, × step
    settle: 0.4,                         // beats for the others to step back after the lock
    cells: { x0: 96, y: 290, w: 268, h: 160, gap: 24, r: 10 },
    font: { family: 'sans-serif', weight: 700, size: 80 },
    colors: { ground: '#0B111F', ink: '#EEF1F5', cell: '#16203A', rule: '#2A3550', rest: '#647187', accent: '#FFB71C' },
  },
  prepare: (P) => schedule(P),
  rest(side, P) {
    return side === 'from' ? { fx: null, pop: 1, dim: 0, slid: 0 } : { fx: P.answer, pop: 1, dim: 1, slid: null };
  },
  at(p, P, D) {
    const b = p * D.beats;
    if (p <= 0) return { fx: null, pop: 1, dim: 0, slid: 0 };
    let k = 0;
    for (let i = 0; i < D.hops.length; i++) if (b >= D.hops[i].b) k = i;
    let fx = D.hops[k].cell, slid = 0;
    for (let i = 1; i <= k; i++) {
      const c0 = D.hops[i - 1].cell, c1 = D.hops[i].cell;
      if (c1 >= c0) continue;
      const u = quintOut(seg(b, D.hops[i].b, D.hops[i].b + 0.3));
      slid += (c0 - c1) * u;
      if (i === k && u < 1) fx = lerp(c0, c1, u);
    }
    return { fx, pop: 1 + 0.12 * (1 - quintOut(seg(b, 0, 0.24))), dim: cubicOut(seg(b, D.lock, D.lock + P.settle)), slid };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    const C = P.colors, L = P.cells, cellX = (i) => L.x0 + i * (L.w + L.gap);
    P.labels.forEach((s, i) => {
      const x = cellX(i), on = i === P.answer, d = S.dim;
      ctx.fillStyle = on ? C.cell : mix(C.cell, C.ground, d * 0.7);
      ctx.strokeStyle = on ? C.rule : mix(C.rule, C.ground, d * 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x, L.y, L.w, L.h, L.r); ctx.fill(); ctx.stroke();
      const col = on ? mix(C.ink, C.accent, d) : mix(C.ink, C.rest, d);
      text(ctx, s, x + L.w / 2, L.y + L.h / 2 + P.font.size * 0.33, P.font, { color: col, align: 'center' });
    });
    if (S.fx == null) return;
    const cx = cellX(S.fx) + L.w / 2, cy = L.y + L.h / 2;
    const w = (L.w + 20) * S.pop, h = (L.h + 20) * S.pop;
    ctx.strokeStyle = C.accent; ctx.lineWidth = 6 + 2 * S.dim;
    ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, L.r + 6); ctx.stroke();
  },
  // only the wraps' slides count as motion (a jump is a cut, not a fast move): the slid distance is continuous
  track: (S, P) => [[(S.slid ?? 0) * (P.cells.w + P.cells.gap), 0]],
};
