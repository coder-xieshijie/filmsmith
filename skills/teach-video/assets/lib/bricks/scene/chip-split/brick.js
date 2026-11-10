// chip-split — the hook of a run: the input words appear as plain mono text beside their weights, then their letters
// spread apart and each grows its own chip box (the words become units), and the token bar counts in under them,
// one cell per unit, the count running with it. The caption says what the input is.
// From the trace template's `hook` scene (assets/templates/trace/pieces.js, timing.rules.js hook): the split is the
// film's T3 hook; layout and timings are the template's.
import { runOf, rowsAt, geometry, chip, rowLabels, tokenBar, caption, hud, groundOf, loadFonts, kinds, monoF, text, readTime, RUN, smooth, clamp, lerp, expOut, secs } from '../../motion/pair-fuse/board.js';

const DEFAULT = {
  en: { title: 'Code tokenizer', subtitle: 'learning a vocabulary from identifiers', caption: '4 identifiers, 15 uses.' },
  zh: { title: '代码分词器', subtitle: '从标识符里学词表', caption: '4 个标识符，共用 15 次。' },
};
const SPLIT = 1, BAR = 1.5;
export default {
  id: 'chip-split', kind: 'scene',
  fits: ['hook'],
  surface: ['canvas'],
  beats: { min: 4, max: 8 },
  needs: { motions: [], props: ['token-chip', 'token-bar'], roles: ['ground', 'ink', 'dim', 'accent', 'base', 'cell'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } } },
    subtitle: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 14 } } },
    caption: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 40 }, zh: { chars: 16 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent', 'base', 'cell'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], run: RUN }),
  plan(s, ctx) {
    const read = (readTime(s.caption, ctx.lang) * ctx.bpm) / 60, beats = clamp(Math.ceil(BAR + 1.5 + Math.max(0.5, read * 0.5)), 4, 8);
    return { beats, reads: [{ text: s.caption, lang: ctx.lang }], cues: [{ beat: SPLIT, kind: 'accent' }, { beat: BAR + 1.5, kind: 'land' }], motion: 'words split into chips', settled: BAR + 1.5, peakAt: SPLIT, pause: beats - BAR - 1.5 };
  },
  async prepare(s, c) { await loadFonts(c.lang); const run = runOf(s.run); return { run, g: geometry(run) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, { run, g } = D, K = kinds(C);
    groundOf(ctx, s); hud(ctx, s, -1, run, C, L);
    const a0 = smooth(secs(u - 0.1, bpm) / 0.3), sp = smooth(secs(u - SPLIT, bpm) / 0.6);
    rowLabels(ctx, g, run, C, a0);
    rowsAt(run, -1).forEach((toks, r) => {
      const cy = g.rowY(r), xs = g.xsOf(toks);
      toks.forEach((tk, i) => {
        // packed: the letters as one word, set at the chip's text position; split: each letter in its chip
        const xPacked = g.X0 + g.PAD + i * g.CH + g.CH / 2, xChip = xs[i] + g.chipW(tk) / 2, x = lerp(xPacked, xChip, sp);
        if (sp > 0.02) chip(ctx, g, x - (g.chipW(tk) * sp) / 2, cy, g.chipW(tk) * sp, null, K.base, C, { fill: null });
        text(ctx, tk.t, x, cy + g.CS * 0.35, monoF(g.CS), { color: C.ink, align: 'center', alpha: a0 });
      });
    });
    const n = Math.round(run.T0 * expOut(secs(u - BAR, bpm) / 0.9));
    if (u >= BAR) tokenBar(ctx, run.T0, n, C, L, { from: n, count: n });
    caption(ctx, s.caption, u, 0.15, bpm, C, L);
  },
  track(u, s, c, D) { return [[D.g.X0, D.g.rowY(0)]]; },
};
