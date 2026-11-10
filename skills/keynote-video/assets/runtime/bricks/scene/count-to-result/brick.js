// count-to-result — the run's result, grown out of the through-line: the board dims, the camera pushes onto the token
// bar (× 1.3), and the bar's own count grows into an enlarged line "78 → 24", its digits becoming the result while
// the rest writes in; the bar's cells light in `learned`; at the end the line shrinks back into the count.
// From the trace template's `summary` scene (assets/templates/trace/pieces.js; push expo-out 0.32 s at 0.1 beat, the
// line growing expo-out 0.6 s to land on beat 1, returning in 0.36 s): the summary and the thesis grow out of objects
// already on screen.
import { runOf, rowsAt, totalAt, geometry, row, rowLabels, tokenBar, hud, groundOf, loadFonts, drawMarked, F, readTime, RUN, smooth, clamp, lerp, expOut, secs } from '../../motion/pair-fuse/board.js';

const DEFAULT = {
  en: { big: '78 → [[learned|24]]', title: 'Code tokenizer', subtitle: 'learning a vocabulary from identifiers' },
  zh: { big: '78 → [[learned|24]]', title: '代码分词器', subtitle: '从标识符里学词表' },
};
export default {
  id: 'count-to-result', kind: 'scene',
  fits: ['proof', 'claim'],
  surface: ['canvas'],
  beats: { min: 3, max: 6 },
  needs: { motions: ['token-sweep'], props: ['token-bar'], roles: ['ground', 'ink', 'dim', 'accent', 'learned', 'cell'], type: ['mono'] },
  slots: {
    big: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 4, chars: 16 }, zh: { chars: 10 } } },
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } } },
    subtitle: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent', 'learned', 'cell'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], run: RUN, returns: true }),
  plan(s, ctx) {
    const read = (readTime(s.big, ctx.lang) * ctx.bpm) / 60, beats = clamp(Math.ceil(1 + Math.max(1.5, read + 0.5) + 0.5), 3, 6);
    return { beats, reads: [{ text: s.big, lang: ctx.lang }], cues: [{ beat: 0.1, kind: 'turn' }, { beat: 1, kind: 'accent' }], motion: 'push onto the bar, count grows into the result', settled: 1, peakAt: 1, pause: beats - 1.5 };
  },
  async prepare(s, c) { await loadFonts(c.lang); const run = runOf(s.run); return { run, g: geometry(run), beats: this.plan(s, c).beats }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, { run, g } = D, k = run.steps.length - 1, beats = D.beats;
    const back = s.returns ? smooth(secs(u - beats, bpm) / 0.36 + 1) : 0;   // the last 0.36 s
    const push = expOut(secs(u - 0.1, bpm) / 0.32) * (1 - back), dim = 1 - 0.85 * smooth(secs(u - 0.1, bpm) / 0.24) * (1 - back);
    groundOf(ctx, s); hud(ctx, s, k, run, C, L);
    ctx.save(); ctx.translate(300, 950); const z = 1 + 0.3 * push; ctx.scale(z, z); ctx.translate(-300, -950);
    ctx.globalAlpha = dim; rowLabels(ctx, g, run, C); rowsAt(run, k).forEach((toks, r) => row(ctx, g, C, toks, null, null, 0, g.rowY(r)));
    ctx.globalAlpha = 1;
    tokenBar(ctx, run.T0, totalAt(run, k), C, L, { lit: smooth(secs(u - 1, bpm) / 0.4) * (1 - back), count: totalAt(run, k) });
    ctx.restore();
    // the line grows out of the count (130, 984, 40 px) to 76 px over the bar, landing on beat 1
    const gr = expOut(secs(u - (1 - 0.6 * bpm / 60), bpm) / 0.6) * (1 - back), size = lerp(40, 76 * 1.0, gr);
    if (gr > 0.01) drawMarked(ctx, s.big, lerp(130, 300, gr), lerp(984, 760, gr), F('mono', 'en', size, 600), C, { alpha: clamp(gr * 2) });
  },
  track(u) { return [[300, 950]]; },
};
