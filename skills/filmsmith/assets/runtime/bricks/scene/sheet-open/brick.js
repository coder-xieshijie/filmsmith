// sheet-open — the first scene of a scroll film: the paper roll drops from the sheet's top edge and leaves the frame
// with a flick's momentum (2 beats, k 4.2), the sheet hanging where it passed; on beat 2 the accent underline draws
// under the line the hook quotes (half a beat); from beat 3 the hook band repeats it phrase by phrase at 96 px, each
// phrase rising into its line box; the minimap prints top to bottom on beats 5.5–6.5; the underline retracts on the
// last beat (`unmark`), when the next scene's detent starts.
// From the scroll template (the source film plan.js SPANS unroll, under1, mini, unUnder1,
// QUOTES.q1; film.js rollAt, band Q1, underline, minimap). The page is the film's capture (`sheet`); without one, a
// placeholder README drawn in code.
import { readTime } from '../../lang.js';
import { H, OFF0, ROLL_TOP, ROLL_OUT, R_ROLL, secs, pIn, lerp, momentum, cubicInOut, loadSheet, drawSheet, underline, drawOf, minimap, roll, grain, clamp } from '../../look/reading-sheet/kit.js';

const DEFAULT = { en: { mark: 'tagline', lines: [['Incremental renders'], ['for big scenes.']] }, zh: { mark: 'tagline', lines: [['大场景的'], ['增量渲染。']] } };
// phrase times (beats): the first at `from`, each next one once the previous is read, on a quarter beat
export const phraseTimes = (lines, from, B, lang) => {
  let t = from; const out = [];
  for (const ln of lines) { const row = []; for (const ph of ln) { const tx = typeof ph === 'string' ? ph : ph.text; const at = typeof ph === 'object' && ph.at != null ? ph.at : t; row.push({ text: tx, at }); t = at + Math.max(1, Math.ceil((readTime(tx, lang) / B) * 4) / 4); } out.push(row); }
  return { lines: out, end: t };
};
export default {
  id: 'sheet-open', kind: 'scene',
  fits: ['hook'],
  surface: ['canvas'],
  beats: { min: 6, max: 12 },
  needs: { motions: ['roll', 'section-lock'], props: ['quote-band', 'sheet-minimap'], roles: ['ground', 'paper', 'onPaper', 'accent', 'line', 'roll'], type: ['display'] },
  slots: {
    lines: { type: 'list', count: [1, 2], of: { type: 'list', count: [1, 3], of: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 20 }, zh: { chars: 6 } } } } },
    mark: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 24 }, zh: { chars: 24 } } },
    sheet: { type: 'object', optional: true },
  },
  roles: ['ground', 'paper', 'onPaper', 'accent', 'line', 'roll', 'rollHi', 'rollShade', 'rollEdge'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], band: 'Q1', minimap: true, unmark: true, seed: 11 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, P = phraseTimes(s.lines, 3, B, ctx.lang);
    return { beats: clamp(Math.ceil(Math.max(P.end + 1.25, 8) - 1e-9), 6, 12), reads: s.lines.flat().map((x) => ({ text: typeof x === 'string' ? x : x.text, lang: ctx.lang })), cues: [{ beat: 2, kind: 'accent' }, { beat: 3, kind: 'accent' }], motion: 'roll', settled: 2, peakAt: 3, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const G = await loadSheet(s.sheet, c.lang), B = 60 / c.bpm, beats = this.plan(s, c).beats;
    return { G, beats, P: phraseTimes(s.lines, 3, B, c.lang) };
  },
  paint(ctx, u, s, c, D) {
    const b = u, C = s.colors, L = c.lang, G = D.G;
    const ry = b < 2 ? lerp(ROLL_TOP, ROLL_OUT, momentum(pIn(b, [0, 2]), 4.2)) : null;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    grain(ctx, s.seed || 1, C);
    const anims = { [s.band || 'Q1']: { lines: D.P.lines } };
    drawSheet(ctx, G, OFF0, b, C, L, { clipBottom: ry == null ? H : ry - R_ROLL * 0.2, anims, after: (g, Ly) => underline(g, G, G.S.marks[s.mark], OFF0, Ly, drawOf(b, [2, 2.5], s.unmark ? [D.beats - 1, D.beats - 0.75] : null), C) });
    if (s.minimap !== false) minimap(ctx, G, OFF0, C, { reveal: cubicInOut(pIn(b, [5.5, 6.5])), bandsOn: { [s.band || 'Q1']: D.P.lines.map((ln) => (b >= ln[0].at ? 0.5 : 0)) } });
    if (ry != null) roll(ctx, ry, C);
  },
  track(u) { return [[700, u < 3 ? 400 : 600]]; },
  blur() { return false; },
};
