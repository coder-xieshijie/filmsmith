// unit-flight — the same squares move from one chart into the next, mark then fly: the squares that change colour
// change it in place first, a short sweep by rank (half a beat); a beat later they leave, group after group on eighth
// notes (top group first), each on a seeded arc (≤ 30 % of the distance, ≤ 140 px) over 1.4 beats, cubic in-out,
// swelling 10 % and back while it brakes so it lands with one pulse; squares that leave the chart drop 40 px and fade.
// Layouts: grid, sorted, bands, share, periods, axis, rule (units.js). One square is one item, always.
// From the tally template (assets/templates/tally/squares.js, timeline.js FLIGHT, MARK): timings and the arc are
// the template's; here the move is a brick of its own between any two layouts.
import { clamp } from '../../../handoffs/util.js';
import { setup, paintGround, drawUnits, TIME } from './units.js';

const GROUPS = {
  en: [{ name: 'Shipped', count: 238 }, { name: 'Rejected', count: 104 }, { name: 'Draft', count: 92 }, { name: 'Review', count: 76 }, { name: 'Archived', count: 64 }],
  zh: [{ name: '已发布', count: 238 }, { name: '已驳回', count: 104 }, { name: '草稿', count: 92 }, { name: '审阅中', count: 76 }, { name: '已归档', count: 64 }],
};

export default {
  id: 'unit-flight', kind: 'motion',
  tier: 'T1', family: 'shape',
  beats: 5, beatsFor: (P) => Math.ceil(1 + (Math.min(9, (P.groups || []).length) - 1) * TIME.group + TIME.depart + TIME.flight + 0.25),
  surface: ['canvas'],
  roles: ['ground', 'panel', 'base', 'rest', 'accent'],
  from: 'the squares in one chart (grid, bands, sorted grid, periods, share, axis, rule)',
  to: 'the same squares in the next chart',
  interpolates: ['colour in place by rank (mark)', 'position on a seeded arc', 'size', 'opacity for squares that leave'],
  summary: 'The same squares move from one chart into the next: they change colour in place, then fly group by group on arcs and land with one pulse.',
  theory: 'Object constancy across chart changes (Heer & Robertson 2007): the marks never leave, so the viewer reads one set re-sorted, not a new chart; one visual variable at a time (colour, then position).',
  defaults: (ctx = {}) => ({ groups: GROUPS[ctx.lang === 'zh' ? 'zh' : 'en'], accent: 1, from: 'grid', to: 'bands', mark: 'square', seed: 3, grain: 0.05 }),
  async prepare(P) { return setup(P, { lang: P.lang || 'en' }, P.to, { from: P.from }); },
  rest(side, P, D) { return { u: side === 'from' ? 0 : D.S.end }; },
  at(p, P, D) { return { u: p * D.S.end }; },
  paint(ctx, S, P, D) { paintGround(ctx, P, D); drawUnits(ctx, S.u, D.I, D.A, D.B, D.S, P.colors, P.mark); },
  track(S, P, D) {
    const pick = [0, Math.floor(D.I.N / 2), D.I.N - 1];
    return pick.map((k) => { const e = clamp((S.u - D.S.dep[k]) / TIME.flight); return [D.A.L.x[k] + (D.B.L.x[k] - D.A.L.x[k]) * e, D.A.L.y[k] + (D.B.L.y[k] - D.A.L.y[k]) * e]; });
  },
};
