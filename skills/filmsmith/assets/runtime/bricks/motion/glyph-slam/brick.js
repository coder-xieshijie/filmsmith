// glyph-slam — ink's entrance of a word: each glyph (grapheme cluster) slams in on its own, 28 ms after the one
// before, from 1.5 times its size and a tenth of an em high on a spring (damping 0.62, 30 rad/s, under 8 % overshoot),
// out of a 7 px blur in 0.035 s, a misregistered ghost in the `mis` colour 5 px right and 3 px up for its first 0.1 s;
// the landing beat punches the camera in 5 %. `z: 0.8, w: 44` is the stiff step spring (settled in 0.07 s).
// From the ink template (assets/templates/ink/film.js word() mode 'slam', camera punch; look/paper-slam/kit.js
// word). Chinese: one glyph per character, Noto Sans SC 900 as 长体, the same spring.
import { word, fill, camera, applyCam, X, ONE, SLAM, groundHex, inkOn, dotOn, stopOf, dot } from '../../look/paper-slam/kit.js';
import { canvasOf } from '../../../handoffs/util.js';

const DEFAULT = { en: { text: 'Halve' }, zh: { text: '二分' } };
export default {
  id: 'glyph-slam', kind: 'motion',
  tier: 'T0', family: 'zoom-depth', beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent', 'mis'],
  from: 'the empty ground', to: 'the word at rest on its baseline, its full stop landed',
  interpolates: ['per-glyph scale 1.5 → 1 on a spring', 'per-glyph rise 0.1 em → 0', 'blur 7 px → 0', 'ghost in mis 0.4 → gone at 0.1 s', 'camera punch 5 % decaying e^(−7 t)'],
  summary: 'A word slams in glyph by glyph from one and a half times its size on a spring, a misregistered ghost flashing under it, the camera punching in on the landing.',
  theory: 'Staggered arrival reads as one impact with texture (overlapping action, Thomas & Johnston); the small overshoot and the print ghost carry weight without bounce (the ink mode card: "slam, never bounce").',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], size: SLAM, ground: 'paper', stiff: false, bpm: 124 }),
  prepare(P) { return { stop: stopOf(canvasOf(8, 8).getContext('2d'), { text: P.text, x: X, y: ONE, size: P.size, lang: P.lang || 'en' }) }; },
  rest(side) { return { p: side === 'from' ? 0 : 1 }; },
  at(p) { return { p }; },
  paint(ctx, S, P, D) {
    const C = P.colors, L = P.lang || 'en', sec = (S.p * 60) / (P.bpm || 124), t = S.p >= 1 ? 9 : sec, g = P.ground || 'paper';
    fill(ctx, groundHex(C, g));
    applyCam(ctx, camera(t, [0], { push: false }));
    word(ctx, { text: P.text, x: X, y: ONE, size: P.size, lang: L, mode: 'slam', tIn: 0, outMode: 'none', color: inkOn(C, g), ...(P.stiff ? { z: 0.8, w: 44, stagger: 0.012 } : {}) }, t, C);
    dot(ctx, D.stop.x, D.stop.y, D.stop.r, dotOn(C, g), t, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },
  track(S, P, D) { return [[D.stop.x, D.stop.y]]; },
};
