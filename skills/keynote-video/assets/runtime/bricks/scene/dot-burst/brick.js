// dot-burst — a guess turns into the method: a word lands centred with its dot and is read; from the next beat the
// runtime hand-off collapse-burst shrinks it into its dot, the dot swells and squashes, bursts into a crisp ring and
// particles that condense, left to right, onto the next word's glyph cells (2 beats); the next word stands with its
// dot. This scene places the two words and times the hand-off; the burst itself is collapse-burst, unchanged.
// From the ink template's `burst` (assets/templates/ink/film.js drawBurst, plan.js burst; timing.rules.js burstRest 1,
// burstBeats 2). Chinese: collapse-burst samples the next word's glyphs at the face's own width, so a Chinese burst
// sets both words at normal width (no 长体), the particles landing exactly on the word that then stands.
import { canvasOf } from '../../../handoffs/util.js';
import { createBrick } from '../../index.js';
import { ONE, SLAM, SLAM_MIN, MAXW, secs, word, dot, fill, groundHex, inkOn, dotOn, grain, fitSize, stopOf, D as DF, disp, clamp } from '../../look/paper-slam/kit.js';
import { readTime } from '../../lang.js';

const DEFAULT = { en: { word: 'Guess', into: 'Halve' }, zh: { word: '猜', into: '二分' } };
export default {
  id: 'dot-burst', kind: 'scene',
  fits: ['turn'],
  surface: ['canvas'],
  beats: { min: 4, max: 8 },
  needs: { motions: ['collapse-burst', 'glyph-slam'], props: ['ink-dot'], roles: ['ground', 'ink', 'accent', 'mis'], type: ['display'] },
  slots: { word: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 9 }, zh: { chars: 4 } } }, into: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 9 }, zh: { chars: 4 } } } },
  roles: ['ground', 'ink', 'accent', 'mis'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], seed: 20261018 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, rest = Math.max(1, Math.ceil(readTime(s.word, ctx.lang) / B)), t1 = rest + 2;
    const beats = clamp(Math.ceil(t1 + readTime(s.into, ctx.lang) / B + 0.5), 4, 8);
    return { beats, reads: [{ text: s.word, lang: ctx.lang }, { text: s.into, lang: ctx.lang }], cues: [{ beat: 0, kind: 'land' }, { beat: rest + 0.76, kind: 'hit' }, { beat: t1, kind: 'land' }], motion: 'collapse-burst', settled: t1, peakAt: rest + 0.76, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, st = L === 'zh' ? 'normal' : 'extra-condensed', B = 60 / c.bpm;
    const z = Math.min(fitSize(cv, disp(s.word, L), L, SLAM, SLAM_MIN, MAXW - 120, st), fitSize(cv, disp(s.into, L), L, SLAM, SLAM_MIN, MAXW - 120, st));
    const f = DF(z, L, st), rest = Math.max(1, Math.ceil(readTime(s.word, L) / B));
    const burst = await createBrick('collapse-burst', { from: { text: disp(s.word, L) }, to: { text: disp(s.into, L) }, x: 960, baseline: ONE, font: f, seed: s.seed || 11, colors: { ground: groundHex(s.colors, 'paper'), ink: inkOn(s.colors, 'paper'), accent: dotOn(s.colors, 'paper') } }, { lang: L });
    return { z, st, B, rest, burst, a: stopOf(cv, { text: s.word, x: 960, y: ONE, size: z, align: 'center', stretch: st, lang: L }), b: stopOf(cv, { text: s.into, x: 960, y: ONE, size: z, align: 'center', stretch: st, lang: L }) };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang, B = D.B, t0 = D.rest * B, t1 = t0 + 2 * B;
    if (t >= t0 && t < t1) { D.burst.draw(ctx, (t - t0) / (2 * B), { dur: 2 * B }); grain(ctx, s.seed || 1); return; }
    fill(ctx, groundHex(C, 'paper'));
    const w = t < t0 ? { text: s.word, tIn: 0, x: D.a } : { text: s.into, tIn: t1, x: D.b };
    word(ctx, { text: w.text, x: 960, y: ONE, size: D.z, align: 'center', stretch: D.st, lang: L, mode: 'slam', tIn: w.tIn, outMode: 'none', color: inkOn(C, 'paper'), mis: t < t0 }, t, C);
    dot(ctx, w.x.x, w.x.y, w.x.r, dotOn(C, 'paper'), t, w.tIn);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { return [[960, ONE - D.z * 0.35]]; },
  blur() { return false; },
};
