// dot-sort — one dot per item, sorted: a heap of identical hand-drawn dots on the ledger page splits into piles, one per
// group, each pile as many dots as its count; the dots of a group set off left to right (0.3 s spread, a little jitter),
// cross on power3.inOut in 0.8 s and take the group's colour on the way (0.6 s), so the eye sees the same items become
// the answer. A group may keep the neutral colour (the rest, still unsorted) and a later group start a beat after.
// From assets/kits/terminal-ledger/starter/components/ledger.js (F.pile, F.assign, F.partition, F.rank,
// toPile) as the approved film uses it (the source film segments/abc.js, 16.7–18 s).
// Timing in seconds at 120 BPM (one beat 0.5 s): a narrated film places it on its anchor, not on a beat grid.
import { W, drawLedgerPage, drawDot, dotColor, pile, assign, partition, rank, hash, tw, E, mix, lerp, clamp } from '../../look/paper-ledger/kit.js';

const SEC = 0.5;   // seconds per beat at 120 BPM
const lastMove = (P) => Math.max(...P.groups.map((g) => g.delay || 0)) + (P.spread ?? 0.3) + (P.jitter ?? 0.08) + (P.d ?? 0.8);
export const sortPlan = (P) => {
  const n = P.groups.reduce((s, g) => s + g.count, 0), heap = pile(n, P.heap.at[0], P.heap.at[1], P.heap.seed ?? 11), grp = partition(n, P.groups.map((g) => g.count), P.seed ?? 20261027);
  const start = heap, target = new Array(n), ts = new Array(n);
  P.groups.forEach((g, gi) => {
    const sub = [...Array(n).keys()].filter((i) => grp[i] === gi), m = assign(sub, pile(g.count, g.at[0], g.at[1], g.seed ?? 23 + gi * 14, g.squash), g.at, (i) => start[i]);
    const rk = rank(sub, (i) => start[i][0]);
    for (const i of sub) { target[i] = m.get(i); ts[i] = (g.delay || 0) + rk.get(i) * (P.spread ?? 0.3) + hash(i, g.seed ?? 7) * (P.jitter ?? 0.08); }
  });
  return { n, start, target, ts, grp };
};
// the dots at t seconds from the sort's start
export const sortDots = (ctx, C, P, D, t, alpha = 1) => {
  const base = dotColor(C, P.heap.color || 'base'), d = P.d ?? 0.8;
  for (let i = 0; i < D.n; i++) {
    const g = P.groups[D.grp[i]], u = tw(t, D.ts[i], d, E.p3io), cu = g.keep ? 0 : tw(t, D.ts[i] + 0.1, 0.6, E.p1io), col = dotColor(C, g.color);
    drawDot(ctx, { x: lerp(D.start[i][0], D.target[i][0], u), y: lerp(D.start[i][1], D.target[i][1], u), s: 1, a: alpha, fill: mix(base.fill, col.fill, cu), stroke: mix(base.stroke, col.stroke, cu) }, i);
  }
};
export default {
  id: 'dot-sort', kind: 'motion',
  tier: 'T1', family: 'shape', beats: 3,
  beatsFor: (P) => Math.ceil(((lastMove(P) + 0.1) / SEC) * 2) / 2,
  surface: ['canvas'],
  roles: ['ground', 'base', 'baseS', 'wait', 'waitS', 'judge', 'judgeS', 'rest', 'restS', 'ruling', 'margin'],
  from: 'one heap of identical dots on the ruled page, one dot per item',
  to: 'the same dots in one pile per group, coloured by the group (or left neutral)',
  interpolates: ['each dot: heap slot → its nearest free slot in its group\'s pile (outer slots first), power3.inOut 0.8 s', 'start: group delay + rank left to right × 0.3 s + jitter ≤ 0.08 s', 'colour: neutral → the group\'s over 0.6 s from 0.1 s after it sets off'],
  summary: 'One dot per item: a heap of identical hand-drawn dots splits into one pile per group, each dot crossing on its own and taking its group\'s colour on the way.',
  theory: 'A unit chart keeps the count literal (one mark, one item; Neurath\'s isotype) and moving the same marks keeps object constancy (Heer & Robertson 2007): the viewer sees the sorting, not a new chart.',
  defaults: (ctx = {}) => ({ heap: { at: [790, 512], seed: 11, color: 'base' }, groups: [{ count: 300, color: 'wait', at: [372, 536], seed: 23 }, { count: 300, color: 'base', at: [1090, 512], seed: 37, delay: 0.12, keep: true }], seed: 20261027, spread: 0.3, jitter: 0.08, d: 0.8, ledger: true }),
  prepare(P) { return sortPlan(P); },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) { return { p, t: p * this.beatsFor(P) * SEC }; },
  paint(ctx, S, P, D) {
    ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, 1920, 1080);
    if (P.ledger !== false) drawLedgerPage(ctx, P.colors, P.lang, { x: 0, y: 0, s: 1 }, { rules: 1 });
    sortDots(ctx, P.colors, P, D, S.t);
  },
  track(S, P, D) { const d = P.d ?? 0.8; return [0, 0.2, 0.4, 0.6, 0.8, 0.99].map((f) => { const i = Math.floor(f * D.n), u = tw(S.t, D.ts[i], d, E.p3io); return [lerp(D.start[i][0], D.target[i][0], u), lerp(D.start[i][1], D.target[i][1], u)]; }); },
  blur: () => false,
};
