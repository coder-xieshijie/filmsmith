// field-card — one feature, printed: a big word (the feature's name) and one line at the left in the text column, an
// optional small mono label above; at the right a procedural field round the anchor that acts the feature out and
// steps one state a beat (rings, interfering sources, cells split apart, rows of a log, a waveform, a grid filling
// in); the anchor sits on its point on top. On paper or printed reversed out of ink (`ground: 'ink'`). `from`: the
// previous card's field kind; the field then changes its function behind a front running out of the anchor (one
// field, new parameters; never a cross-fade). `mono: true` sets the line in the mono (quotes, transcripts).
// From the halftone template's `card` scene (assets/templates/halftone/film.js ready card layout, toneAt, morph
// boundary; fields.js): sizes [178, 131] for the word, 52 for the line, places and the per-beat step are the template's.
import { P, X0, TEXT_R, KINDS, secs, worldColors, ground, display, monoF, fitSize, riseText, label, fieldTone, morphTone, drawField, drawBlocks, binOf, DEF, markGeo, drawAnchor, loadFonts, clamp, cubicInOut, readTime } from '../../motion/dot-quantize/press.js';

const DEFAULT = { en: { word: 'CROSSTALK', line: 'three voices, one channel', label: '' }, zh: { word: '串音', line: '三个人声，挤在一条声道', label: '' } };
const WORD = 0.5, LINE = 1.5;
const layout = (ctx, s, L, bpm) => {
  const mk = (z) => display(L, z, 800), w = fitSize(ctx, s.word, mk, [178, 131], TEXT_R - X0);
  return [{ str: s.word, x: X0 - 4, y: 590, f: mk(w.size), role: 'ink', land: secs(WORD, bpm) },
    ...(s.line ? [{ str: s.line, x: X0, y: 680, f: s.mono ? monoF(L, 52) : display(L, 52, 500), role: 'ink', land: secs(LINE, bpm) }] : []),
    ...(s.label ? [{ str: label(s.label, L), x: X0 + 4, y: 380, f: monoF(L, 28), role: 'dim', land: secs(WORD, bpm) }] : [])];
};

export default {
  id: 'field-card', kind: 'scene',
  fits: ['problem', 'demo', 'proof', 'turn'],
  surface: ['canvas'],
  beats: { min: 3, max: 8 },
  needs: { motions: ['field-morph'], props: ['anchor-mark'], roles: ['ground', 'ink', 'dim', 'dimInk', 'accent'], type: ['display', 'mono'] },
  slots: {
    word: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 2, chars: 11 }, zh: { chars: 6 } } },
    line: { type: 'text', tier: 'primary', limits: { en: { words: 6, chars: 32 }, zh: { chars: 16 } } },
    label: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 5, chars: 30 }, zh: { chars: 16 } } },
  },
  roles: ['ground', 'ink', 'dim', 'dimInk', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], field: 'cross', from: null, ground: 'paper', mono: false, pattern: 1, dot: 'round', print: 'dots' }),
  plan(s, ctx) {
    const read = ((readTime(s.word, ctx.lang) + readTime(s.line, ctx.lang)) * ctx.bpm) / 60, beats = clamp(Math.ceil(LINE + Math.max(1.5, read * 0.75) + 0.5), 3, 8);
    return { beats, reads: [{ text: s.word, lang: ctx.lang }, { text: s.line, lang: ctx.lang }], cues: [{ beat: 0, kind: 'turn' }, { beat: WORD, kind: 'land' }, { beat: LINE, kind: 'land' }, ...Array.from({ length: beats - 1 }, (_, k) => ({ beat: k + 1, kind: 'tick' }))],
      motion: 'the field steps one state a beat', settled: LINE + 0.25, peakAt: WORD, pause: beats - LINE - 0.25 };
  },
  validate(s) { const e = []; if (!KINDS.includes(s.field)) e.push(`field: one of ${KINDS.join(', ')}`); if (s.from && !KINDS.includes(s.from)) e.push('from: a field kind'); if (s.print && !['dots', 'blocks'].includes(s.print)) e.push('print: dots or blocks'); return e; },
  async prepare(s, c) { await loadFonts(c.lang); return { G: markGeo() }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, t = secs(u, c.bpm), wc = worldColors(C, s.ground), seed = 7 + 101 * (s.pattern ?? 1);
    ground(ctx, wc);
    let tone = fieldTone(s.field, u, { seed });
    if (s.from && s.from !== s.field) { const k = clamp((t + secs(0.25, c.bpm)) / secs(0.75, c.bpm)); tone = morphTone(fieldTone(s.from, u, { seed: seed + 3 }), tone, P, k); }
    if (s.print === 'blocks') drawBlocks(ctx, binOf(fieldTone(s.field, u, { seed, quant: true })), wc.ink);
    else if (s.field !== 'none' || (s.from && s.from !== 'none')) drawField(ctx, tone, wc.ink, { pitch: DEF.pitch, shape: s.dot });
    D.T = D.T || layout(ctx, s, L, c.bpm);
    for (const e of D.T) riseText(ctx, e, t, wc);
    drawAnchor(ctx, D.G, P, D.G.ZA, C, { shape: s.dot });
  },
  track() { return [P]; },
};
