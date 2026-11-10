// word-warp — the problem: an accent word rises through its mask and warps beat by beat (each glyph's width, height and
// shear wobbling, two ghost copies smearing off it, the amplitude ramping over 2.7 beats), while an ink word slams
// under it on beat 2 with the dot as its full stop; an optional label on beat 3. The accent is allowed on the warped
// word because it is itself transforming (the mode's accent role).
// From the ink template's `warp` (assets/templates/ink/film.js layoutScenes warp; plan.js warp; timing.rules.js
// warpWord2 2, warpRamp 3): values the template's.
import { canvasOf } from '../../../handoffs/util.js';
import { X, L1, L2, LABEL, SLAM, SLAM_MIN, MAXW, T, secs, word, label, dot, fill, groundHex, inkOn, dotOn, camera, applyCam, grain, widthOf, stopOf, D as DF, disp, clamp } from '../../look/paper-slam/kit.js';
import { readTime } from '../../lang.js';

const DEFAULT = { en: { word: 'Blame', word2: 'everyone', label: '' }, zh: { word: '甩锅', word2: '给所有人', label: '' } };
export default {
  id: 'word-warp', kind: 'scene',
  fits: ['problem', 'turn'],
  surface: ['canvas'],
  beats: { min: 4, max: 8 },
  needs: { motions: ['glyph-slam'], props: ['ink-dot'], roles: ['ground', 'ink', 'accent', 'mis'], type: ['display', 'mono'] },
  slots: {
    word: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } },
    word2: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } },
    label: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
  },
  roles: ['ground', 'ink', 'accent', 'mis'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], seed: 20261018 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, need = 2 * B + readTime(`${s.word} ${s.word2}`, ctx.lang) + (s.label ? B + readTime(s.label, ctx.lang) : 0);
    return { beats: clamp(Math.max(4, Math.ceil(need / B)), 4, 8), reads: [{ text: s.word, lang: ctx.lang }, { text: s.word2, lang: ctx.lang }], cues: [{ beat: 0, kind: 'accent' }, { beat: 2, kind: 'land' }], motion: 'warp', settled: 2.2, peakAt: 2, pause: 0, lead: 0 };
  },
  validate() { return []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang;
    let z = SLAM; while (z > SLAM_MIN && Math.max(widthOf(cv, disp(s.word, L), DF(z, L), L), widthOf(cv, disp(s.word2, L), DF(z, L), L) + z * 0.174) > MAXW) z -= 2;
    return { z, stop: stopOf(cv, { text: s.word2, x: X, y: L2, size: z, lang: L }), B: 60 / c.bpm, beats: this.plan(s, c).beats };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang, B = D.B, end = D.beats * B, t2 = 2 * B;
    const warp = (tt) => clamp((tt - 0.3 * B) / (2.7 * B)) * (1 + 0.25 * Math.sin(tt * 9));
    fill(ctx, groundHex(C, 'paper'));
    applyCam(ctx, camera(t, [0, t2]));
    word(ctx, { text: s.word, x: X, y: L1, size: D.z, lang: L, mode: 'rise', tIn: 0, tOut: end, outMode: 'up', color: C.accent, warp, mis: false }, t, C);
    word(ctx, { text: s.word2, x: X, y: L2, size: D.z, lang: L, mode: 'slam', tIn: t2, tOut: end, outMode: 'up', color: inkOn(C, 'paper') }, t, C);
    dot(ctx, D.stop.x, D.stop.y, D.stop.r, dotOn(C, 'paper'), t, t2);
    if (s.label) label(ctx, { text: s.label, x: X + 6, y: 190, tIn: 3 * B, tOut: end - T.labelEarlySec, color: inkOn(C, 'paper'), size: LABEL }, t, L);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { return [[D.stop.x, D.stop.y]]; },
  blur() { return false; },
};
