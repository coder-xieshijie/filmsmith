// cell-count — the number, printed: a huge figure at the left counts from `from` to `value` (ease-out, at most four
// values a beat, over two to four beats, so every value shows) while round the anchor one more cell of rings appears
// per counted step (golden-angle placement, a paper gutter between cells); the line lands a beat after the number, a
// small mono label above. Printed reversed out of ink by default (`ground: 'paper'` to print on paper).
// From the halftone template's `count` scene (assets/templates/halftone/film.js countAt, ready count layout;
// fields.js count; timing.rules.js countPerBeat): sizes [242, 178], places and the count's pace are the template's.
import { P, X0, TEXT_R, secs, worldColors, ground, display, monoF, fitSize, riseText, label, fieldTone, drawField, DEF, markGeo, drawAnchor, loadFonts, clamp, readTime } from '../../motion/dot-quantize/press.js';

const DEFAULT = { en: { value: 12, from: 1, line: 'voices pulled from one mic', label: 'one mic · 41 min' }, zh: { value: 12, from: 1, line: '从一支麦克风里分出的人声', label: '一支麦克风 · 41 分钟' } };
const NUM = 0.5, LINE = 1.5;
const countBeats = (s) => clamp(Math.ceil(Math.abs((s.value ?? 0) - (s.from ?? 0)) / 4), 2, 4);
const countAt = (s, u) => { const from = s.from ?? 0, k = clamp((u - NUM) / countBeats(s)); return Math.round(from + ((s.value ?? 0) - from) * (1 - (1 - k) * (1 - k))); };

export default {
  id: 'cell-count', kind: 'scene',
  fits: ['proof', 'problem'],
  surface: ['canvas'],
  beats: { min: 4, max: 8 },
  needs: { motions: [], props: ['anchor-mark'], roles: ['ground', 'ink', 'dim', 'dimInk', 'accent'], type: ['display', 'mono'] },
  slots: {
    value: { type: 'number', tier: 'primary', claim: true },
    line: { type: 'text', tier: 'primary', limits: { en: { words: 6, chars: 32 }, zh: { chars: 16 } } },
    label: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 5, chars: 30 }, zh: { chars: 16 } } },
  },
  roles: ['ground', 'ink', 'dim', 'dimInk', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], ground: 'ink', dot: 'round' }),
  plan(s, ctx) {
    const cb = countBeats(s), read = (readTime(s.line, ctx.lang) * ctx.bpm) / 60, beats = clamp(Math.ceil(Math.max(NUM + cb + 1, LINE + read + 0.75)), 4, 8);
    return { beats, reads: [{ text: String(s.value), lang: 'en' }, { text: s.line, lang: ctx.lang }], cues: [{ beat: NUM, kind: 'accent' }, ...Array.from({ length: cb }, (_, k) => ({ beat: NUM + k + 1, kind: 'tick' })), { beat: LINE, kind: 'land' }],
      motion: 'the count and one cell per step', settled: NUM + cb, peakAt: NUM + cb, pause: beats - NUM - cb };
  },
  validate(s) { const e = []; if (!Number.isFinite(+s.value)) e.push('value: a number'); if (Math.abs((s.value ?? 0) - (s.from ?? 0)) > 16) e.push('value − from: at most 16 (four a beat over four beats); count a smaller unit'); return e; },
  async prepare(s, c) {
    await loadFonts(c.lang);
    return { G: markGeo(), lay: null };
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, t = secs(u, c.bpm), wc = worldColors(C, s.ground), n = Math.max(1, countAt(s, u));
    ground(ctx, wc);
    drawField(ctx, fieldTone('count', u, { seed: 11, n }), wc.ink, { pitch: DEF.pitch, shape: s.dot });
    if (!D.lay) {
      const mk = (z) => display(L, z, 800), w = fitSize(ctx, String(s.value), mk, [242, 178], TEXT_R - X0);
      D.lay = [{ count: true, x: X0 - 6, y: 610, f: mk(w.size), role: 'ink', land: secs(NUM, c.bpm) },
        ...(s.line ? [{ str: s.line, x: X0, y: 700, f: display(L, 52, 500), role: 'ink', land: secs(LINE, c.bpm) }] : []),
        ...(s.label ? [{ str: label(s.label, L), x: X0 + 4, y: 380, f: monoF(L, 28), role: 'dim', land: secs(NUM, c.bpm) }] : [])];
    }
    for (const e of D.lay) riseText(ctx, e.count ? { ...e, str: String(countAt(s, u)) } : e, t, wc);
    drawAnchor(ctx, D.G, P, D.G.ZA, C, { shape: s.dot });
  },
  track() { return [P]; },
};
