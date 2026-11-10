// sheet-deal — the dossier's ordinary page change: the sheet on the mat slides off downward (900 px, power 2 in,
// 0.35 s) and, half a beat in, the next is dealt onto the file from 800 px below (expo out over one beat), square to
// the reading position. No tilt, no fade: paper being handled on a still camera. One and a half beats.
// From the dossier template's example (the dossier source film film.js dealY, exitY; choreo.js 'deal'). Also
// the index card's arrival and the file leaving before the lock-up (exhibit-ledger, name-strike call the same curves
// through kit.js).
import { measureCtx, X0, Y0, CB, ground, exhibitSpec, loadImage, sheetOf, restState, paintSheet, dealY, exitY, PLACEHOLDER } from '../../look/evidence-mat/kit.js';

export default {
  id: 'sheet-deal', kind: 'motion',
  tier: 'T1', family: 'vertical', beats: 1.5,
  surface: ['canvas'],
  roles: ['ground', 'paper', 'onPaper', 'line', 'accent', 'onAccent'],
  from: 'an exhibit at rest on the mat', to: 'the next exhibit at rest on the mat',
  interpolates: ['the outgoing sheet\'s y, +900 px, power 2 in over 0.35 s', 'the incoming sheet\'s y, +800 → 0 px, expo out over one beat from half a beat'],
  summary: 'The sheet slides off the mat downward and the next is dealt on from below, square to the reading position.',
  theory: 'Exits faster than entrances (the out-move accelerates, the in-move decelerates, Material motion\'s asymmetry); a vertical deal keeps the reading position fixed, so the eye waits where the next claim will be.',
  defaults: () => ({ from: null, to: { band: PLACEHOLDER.band(1), ex: 2, of: 2 } }),
  async prepare(P) {
    const L = P.lang || 'en', a = exhibitSpec(P.from || {}, L), b = exhibitSpec({ ex: 2, of: 2, ...(P.to || {}) }, L), ctx = measureCtx();
    const Ga = sheetOf(ctx, a, L), Gb = sheetOf(ctx, b, L);
    return { a, b, Ga, Gb, ia: await loadImage(a.src), ib: await loadImage(b.src) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) { const B = 60 / (P.bpm || 120), t = p * CB.deal * 1.5 * B; return { p, yOut: exitY(t, 0), yIn: p <= 0 ? Infinity : p >= 1 ? 0 : dealY(t, 0.5 * B, B) }; },
  paint(ctx, S, P, D) {
    const C = P.colors, L = P.lang || 'en';
    ground(ctx, C);
    if (S.yOut < 900) paintSheet(ctx, D.Ga, D.ia, restState(D.Ga, D.a), X0, Y0 + S.yOut, C, L);
    if (Number.isFinite(S.yIn)) paintSheet(ctx, D.Gb, D.ib, restState(D.Gb, D.b), X0, Y0 + S.yIn, C, L);
  },
  track(S) { return [[960, Math.min(800, Number.isFinite(S.yIn) ? S.yIn : 800)], [960, S.yOut]]; },
};
