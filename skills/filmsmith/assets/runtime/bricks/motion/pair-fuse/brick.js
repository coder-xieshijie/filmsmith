// pair-fuse — the move a merge makes: a pair of neighbouring chips lights in the accent (dashed box), slides together,
// closes into one chip whose outline turns from the accent to `learned` while the two labels slide into the new label,
// and swells ≤ 3.5 % once as it lands; the token bar's cells for the merged pairs shrink away and the count drops.
// Every row of the board fuses the same pair at once. The run is real (board.js runOf): what fuses is what a
// byte-pair merge of the corpus fuses at step k.
// From the trace template (assets/templates/trace/pieces.js drawRow, the `step` fuse; runs/bpe.js): the accepted
// motion of the source film (0.6 s, smootherstep, first half together, second half merged).
import { runOf, rowsAt, totalAt, geometry, row, rowLabels, tokenBar, groundOf, loadFonts, RUN, smooth, clamp } from './board.js';

export default {
  id: 'pair-fuse', kind: 'motion',
  tier: 'T0', family: 'shape',
  beats: 3,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent', 'base', 'learned', 'cell'],
  from: 'a row of chips with one pair lit', to: 'the same row with the pair fused into one learned chip',
  interpolates: ['highlight 0 → 1 (dashed box)', 'pair gap → 0', 'two outlines → one, accent → learned', 'labels → one label', 'bar cells shrink'],
  summary: 'A lit pair of chips slides together and closes into one learned chip; every row fuses the same pair, the token bar shrinks.',
  theory: 'Object constancy (Heer & Robertson 2007): the merged token is made of the two pieces the viewer saw, so the rule is shown, not stated; one change at a time: light, then move, then recolour.',
  defaults: () => ({ run: RUN, step: 0, bar: true, seed: 1 }),
  async prepare(P) { await loadFonts(P.lang || 'en'); const run = runOf(P.run); return { run, g: geometry(run, { probe: false }) }; },
  rest(side) { return { u: side === 'from' ? 0 : 3 }; },
  at(p) { return { u: p * 3 }; },
  paint(ctx, S, P, D) {
    const C = P.colors, { run, g } = D, k = Math.min(P.step, run.steps.length - 1), st = run.steps[k], old = rowsAt(run, k - 1);
    groundOf(ctx, P);
    // light at beat 0.25 → 0.75, fuse over the 0.6 s ending a quarter beat after beat 2 (lands at 75 % on beat 2)
    const hiAmt = smooth((S.u - 0.25) / 0.5), e = clamp((S.u - 1.55) / 0.8);
    rowLabels(ctx, g, run, C);
    old.forEach((toks, r) => row(ctx, g, C, toks, st.rows[r].tokens, st.rows[r].map, e, g.rowY(r), { hi: st.hi.filter(([rr]) => rr === r).map(([, i]) => i), hiAmt: e > 0 ? 0 : hiAmt, landed: e >= 0.75 ? ((S.u - 2.15) * 60) / 120 : -1 }));
    if (P.bar) tokenBar(ctx, run.T0, totalAt(run, k), C, P.lang || 'en', { from: totalAt(run, k - 1), shrink: e, count: e < 0.75 ? totalAt(run, k - 1) : totalAt(run, k) });
  },
  track(S, P, D) { const { g } = D; return [[g.X0, g.rowY(0)]]; },
};
