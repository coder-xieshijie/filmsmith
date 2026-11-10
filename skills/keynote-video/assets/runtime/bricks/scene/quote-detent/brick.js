// quote-detent — one claim of the page read and quoted: the sheet moves (a detent: 1 beat, momentum k 5.5; a reel:
// 2 beats, k 6.5; or no move), headings that reach the top pin as the chapter; half a beat after it lands the accent
// underline draws under the line (half a beat) and the nearest quote band repeats it in code-set type at 69 px, phrase
// by phrase, each rising into its line box once the previous is read; with `replace` the band's previous lines rise
// out on the first beat; the underline retracts on the last half beat (`unmark`). A detent that is the cut into the
// scene runs before its boundary (`lead`).
// From the scroll template (the source film plan.js SPANS detent1, under2, swap2, reel2, under4,
// QUOTES.q2–q4; film.js offsetAt, band, underline): curves and timings the template's.
import { readTime } from '../../lang.js';
import { H, secs, pIn, lerp, momentum, loadSheet, drawSheet, underline, drawOf, minimap, offsetOf, grain, clamp } from '../../look/reading-sheet/kit.js';
import { phraseTimes } from '../sheet-open/brick.js';

const DEFAULT = { en: { mark: 'intro', lines: [['Only what', 'an edit touches,'], ['rebuilt.']] }, zh: { mark: 'intro', lines: [['只重建', '改动碰到的'], ['那部分。']] } };
const MOVES = { detent: { beats: 1, k: 5.5 }, reel: { beats: 2, k: 6.5 }, none: { beats: 0, k: 1 } };
const timing = (s, B, lang) => {
  const M = MOVES[s.move || 'detent'], lead = s.lead ?? 0, moveEnd = M.beats - lead;
  const markAt = s.markAt ?? (M.beats && moveEnd > 0 ? moveEnd + 0.5 : s.move === 'none' ? 0 : 0.5);
  const P = phraseTimes(s.lines, markAt + 0.5, B, lang);
  return { M, lead, moveEnd, markAt, P, beats: clamp(Math.ceil(P.end + (s.unmark ? 0.5 : 0) + 0.25 - 1e-9), 4, 12) };
};
export default {
  id: 'quote-detent', kind: 'scene',
  fits: ['problem', 'turn', 'demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 4, max: 12 },
  needs: { motions: ['scroll-reel', 'section-lock'], props: ['quote-band', 'sheet-minimap'], roles: ['ground', 'paper', 'onPaper', 'accent', 'line'], type: ['display'] },
  slots: {
    lines: { type: 'list', count: [1, 2], of: { type: 'list', count: [1, 4], of: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 20 }, zh: { chars: 6 } } } } },
    mark: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 24 }, zh: { chars: 24 } } },
    sheet: { type: 'object', optional: true },
  },
  roles: ['ground', 'paper', 'onPaper', 'accent', 'line'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], band: 'Q2', from: 'top', to: { piece: 'C2', under: 0 }, move: 'detent', lead: 0, replace: false, prevMark: null, unmark: false, open: 0, seed: 11 }),
  plan(s, ctx) {
    const T0 = timing(s, 60 / ctx.bpm, ctx.lang);
    return { beats: T0.beats, reads: s.lines.flat().map((x) => ({ text: typeof x === 'string' ? x : x.text, lang: ctx.lang })), cues: [...(T0.M.beats ? [{ beat: -T0.lead, kind: 'turn' }, { beat: T0.moveEnd, kind: 'land' }] : []), { beat: T0.markAt, kind: 'accent' }], motion: s.move === 'reel' ? 'scroll-reel' : 'detent', settled: Math.max(0, T0.moveEnd), peakAt: T0.markAt, pause: 0, lead: T0.lead };
  },
  validate() { return []; },
  async prepare(s, c) {
    const G = await loadSheet(s.sheet, c.lang), T0 = timing(s, 60 / c.bpm, c.lang), L = G.layout(s.open || 0);
    return { G, ...T0, o0: offsetOf(G, L, s.from), o1: offsetOf(G, L, s.to) };
  },
  paint(ctx, u, s, c, D) {
    const b = u - D.lead, C = s.colors, Lg = c.lang, G = D.G;
    const off = D.M.beats ? lerp(D.o0, D.o1, momentum(pIn(b, [-D.lead, D.moveEnd]), D.M.k)) : D.o1;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    grain(ctx, s.seed || 1, C);
    const anims = { [s.band]: { lines: D.P.lines, replaceAt: s.replace ? Math.min(0, D.markAt) : Infinity } };
    drawSheet(ctx, G, off, b, C, Lg, { open: s.open || 0, anims, after: (g, Ly) => {
      if (s.prevMark && b < D.markAt) underline(g, G, G.S.marks[s.prevMark], off, Ly, 1, C);
      underline(g, G, G.S.marks[s.mark], off, Ly, drawOf(b, [D.markAt, D.markAt + 0.5], s.unmark ? [D.beats - 0.5, D.beats - 0.25] : null), C);
    } });
    if (s.minimap !== false) minimap(ctx, G, off, C, { open: s.open || 0, bandsOn: { [s.band]: D.P.lines.map((ln) => (b >= ln[0].at ? 0.6 : 0)) } });
  },
  track(u) { return [[700, 540]]; },
  blur() { return false; },
};
