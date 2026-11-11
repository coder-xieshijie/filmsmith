// thesis-lines — the claim: one to four short serif lines enter one a beat (the first lands on the bar line), the
// words that name the run's colours in those colours; then a stats line enters part by part (split at "·"), half a
// beat apart, every number the run's own; on the last downbeat the dimmed token bar lights up once with a ripple
// along its cells, the closing second move.
// From the trace template's `thesis` scene (assets/templates/trace/pieces.js; lines 82 px fitted ≥ 56, stats 40 px).
import { runOf, tokenBar, hud, groundOf, loadFonts, drawMarked, markWidth, F, monoF, readTime, RUN, smooth, clamp, expOut, secs } from '../../motion/pair-fuse/board.js';

const DEFAULT = {
  en: { lines: ['[[unseen|Unseen]] names', 'are [[learned|learned pieces]].'], stats: '78 → [[learned|24]] tokens · vocabulary 6 → 12 · 6 merges', title: 'Code tokenizer', subtitle: 'learning a vocabulary from identifiers' },
  zh: { lines: ['[[unseen|没见过]]的名字', '也由[[learned|学到的片段]]组成。'], stats: '78 → [[learned|24]] 个词元 · 词表 6 → 12 · 6 次合并', title: '代码分词器', subtitle: '从标识符里学词表' },
};
export default {
  id: 'thesis-lines', kind: 'scene',
  fits: ['claim', 'lockup'],
  surface: ['canvas'],
  beats: { min: 4, max: 12 },
  needs: { motions: [], props: ['token-bar'], roles: ['ground', 'ink', 'dim', 'learned', 'unseen', 'cell'], type: ['display', 'mono'] },
  slots: {
    lines: { type: 'list', count: [1, 4], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 5, chars: 48 }, zh: { chars: 16 } } } },  // [[kind|…]] markup counts toward chars
    stats: { type: 'text', tier: 'primary', limits: { en: { words: 14, chars: 64 }, zh: { chars: 30 } } },
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } } },
    subtitle: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'ink', 'dim', 'learned', 'unseen', 'cell'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], run: RUN }),
  plan(s, ctx) {
    const n = (s.lines || []).length, parts = String(s.stats || '').split('·').length, statsAt = 0.25 + (n - 1) + 0.75;
    const read = (((s.lines || []).reduce((a, l) => a + readTime(l, ctx.lang), 0) + readTime(s.stats || '', ctx.lang)) * ctx.bpm) / 60;
    const beats = clamp(Math.ceil(Math.max(statsAt + parts * 0.5 + 2, read + 1)), 4, 12);
    return { beats, reads: [...(s.lines || []).map((x) => ({ text: x, lang: ctx.lang })), { text: s.stats, lang: ctx.lang }], cues: [{ beat: 0.25, kind: 'claim' }, { beat: beats - 1, kind: 'end' }], motion: 'lines enter, the bar lights', settled: statsAt + parts * 0.5, peakAt: 0.25, pause: beats - statsAt };
  },
  async prepare(s, c) { await loadFonts(c.lang); return { run: runOf(s.run), beats: this.plan(s, c).beats }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, run = D.run, lines = s.lines || [];
    groundOf(ctx, s); hud(ctx, s, run.steps.length - 1, run, C, L);
    let size = 82; while (size > 56 && Math.max(...lines.map((l) => markWidth(ctx, l, F('display', L, size, 600)))) > 1500) size -= 2;
    const f = F('display', L, size, 600), y0 = 470 - ((lines.length - 1) * size * 1.2) / 2;
    lines.forEach((l, i) => { const t = secs(u - 0.25 - i, bpm), a = smooth(t / 0.5); if (a > 0) drawMarked(ctx, l, 960, y0 + i * size * 1.2 + (1 - a) * 10, f, C, { alpha: a, align: 'center' }); });
    const parts = String(s.stats || '').split('·').map((x) => x.trim()), sf = monoF(L === 'zh' ? 34 : 30), gap = 60;
    const ws = parts.map((p) => markWidth(ctx, p, sf)), tot = ws.reduce((a, b) => a + b, 0) + gap * (parts.length - 1);
    let x = 960 - tot / 2; const st0 = 0.25 + (lines.length - 1) + 0.75;
    parts.forEach((p, i) => { const a = smooth(secs(u - st0 - i * 0.5, bpm) / 0.3); if (a > 0) drawMarked(ctx, p, x, 700, sf, C, { alpha: a }); x += ws[i] + gap; });
    // the closing move: the dimmed bar lights on the last downbeat (expo-out 0.4 s) with a ripple along its cells
    const end = D.beats - 1, lit = expOut(secs(u - end, bpm) / 0.4);
    tokenBar(ctx, run.T0, run.TN, C, L, { a: 0.5 + 0.5 * lit, lit, count: run.TN });
  },
  track() { return [[960, 470]]; },
};
