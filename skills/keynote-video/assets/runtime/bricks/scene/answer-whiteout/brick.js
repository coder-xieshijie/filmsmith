// answer-whiteout — the climax of a query film: on the bar line of the music's drop the frame is white for two frames,
// the answer bursts in amber (scale and blur decaying in 0.45 s) while the ground falls from white to ramp[0] in 0.3 s
// on an S-curve; its line lands a beat later and is read as a claim in a pause, the query (with the pass count) a beat
// after. The answer is set in the normal-width Bold, whose 0 opens a counter wide enough for runtime counter-portal to
// push through into the next scene (`answerGlyph()` gives the hand-off its glyph). The exposure build before the hit
// is runtime whiteout-slam over the previous scene's last beat.
// From the pulse template's `reveal` (assets/templates/pulse/film.js paintReveal, choreo.js revealPlan; mode card
// Motion "Whiteout"): values the template's; no channel offset (the mode's colours are its ramp and the amber).
import { clamp, canvasOf } from '../../../handoffs/util.js';
import { smooth } from '../../../motion.js';
import { readTime } from '../../lang.js';
import { SZ, T, X0, W, F, draw, rise, fitSize, widthOf, groundHex, onGround, fillGround, drawQuery, typed, secs, grain } from '../../look/query-ramp/kit.js';
import { mix } from '../../../handoffs/util.js';

const DEFAULT = { en: { value: '0.6 s', line: 'only build under 1 s', query: 'p50 · 1 of 4 pass' }, zh: { value: '0.6 秒', line: '唯一进 1 秒的版本', query: 'p50 · 1 of 4 pass' } };
const BASE = 720, LINE_Y = 870;
export const answerGlyph = (s, ctx, D) => ({ text: s.value, x: X0, y: BASE, font: F('text', ctx.lang, D.size, 700), size: D.size });

export default {
  id: 'answer-whiteout', kind: 'scene',
  fits: ['climax', 'claim'],
  surface: ['canvas'],
  beats: { min: 4, max: 10 },
  needs: { motions: ['whiteout-slam', 'counter-portal'], props: ['query-line'], roles: ['ground', 'ink', 'dim', 'accent', 'white', 'r0'], type: ['text', 'mono'] },
  slots: {
    value: { type: 'text', tier: 'primary', claim: true, limits: { en: { chars: 7 }, zh: { chars: 5 } } },
    line: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 30 }, zh: { chars: 12 } } },
    query: { type: 'code', tier: 'glance', optional: true, limits: { en: { chars: 48 }, zh: { chars: 48 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent', 'white', 'r0'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], seed: 20261019 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, read = readTime(s.value, ctx.lang) + readTime(s.line, ctx.lang);
    const beats = clamp(Math.max(8, Math.ceil((B + read) / B) + 2), 4, 10);
    return { beats, reads: [{ text: s.value, lang: ctx.lang }, { text: s.line, lang: ctx.lang, claim: true }], cues: [{ beat: 0, kind: 'hit' }, { beat: 1, kind: 'land' }],
      motion: 'whiteout slam', settled: T.shockSec / B, peakAt: 0, pause: beats - 2, lead: 0 };
  },
  validate() { return []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), size = fitSize(cv, s.value, 'text', c.lang, SZ.reveal, SZ.revealMin, undefined, 700);
    return { size, width: widthOf(cv, s.value, F('text', c.lang, size, 700), c.lang) };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), B = 60 / c.bpm, L = c.lang, C = s.colors, col = onGround(C, 'r0');
    const white = C.white || C.paper;
    // two white frames on the hit, then the ground falls from white to ramp[0] in 0.3 s (S-curve)
    const fall = t < T.whiteSec ? 0 : smooth(clamp((t - T.whiteSec) / T.fallSec));
    fillGround(ctx, mix(white, groundHex(C, 'r0'), fall));
    if (t >= T.whiteSec) {
      const q = clamp((t - T.whiteSec) / T.shockSec), d = Math.pow(1 - q, 2.2);
      draw(ctx, s.value, X0, BASE, F('text', L, D.size, 700), C.accent, L, { k: 1 + 0.16 * d, blur: 26 * d });
    }
    rise(ctx, s.line, X0, LINE_Y, t, B, F('text', L, SZ.line), col.text, L);
    if (s.query) drawQuery(ctx, typed(s.query, t, 2 * B), col.quiet, L);
    if (fall > 0.9) grain(ctx, s.seed || 1, 0.05);
  },
  track(u, s, c, D) { return [[X0 + D.width / 2, BASE - D.size * 0.36]]; },
  blur() { return false; },
};
