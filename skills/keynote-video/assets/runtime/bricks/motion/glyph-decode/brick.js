// glyph-decode — a line resolves in reading order: every cell flickers 30 times a second through the line's own
// alphabet and locks left to right; hex strings flicker through hex, a digit never flickers through other digits (a
// numeral flickers through symbols), so no still frame shows a wrong number. Chinese cells flicker through the line's
// own Chinese characters and a fixed pool of dense, common characters, never through Latin letters.
// From the phosphor template: film.js scramble, alphabetOf, numberSafe, decodedAt (2026-10-20 model). Not runtime
// scramble-resolve (a hand-off from one text to another) nor symbol-scramble (a value in its digit slots): this is
// a line's own entrance.
import { F, display, decodeAt, ground, post, palOf, zh, clamp, W, fit } from '../../prop/terminal-hud/kit.js';

const DEFAULT = { en: { lines: ['Every failure,', 'replayed exactly.'] }, zh: { lines: ['每一次失败，', '都能原样重放。'] } };
export default {
  id: 'glyph-decode', kind: 'motion',
  tier: 'T0', family: 'mask-type', beats: 2,
  surface: ['canvas'],
  roles: ['ground', 'titleHi', 'titleLo'],
  from: 'nothing (or a line of flickering cells)', to: 'the line, locked',
  interpolates: ['locked cells 0 → n, left to right', 'the flicker alphabet per cell (the line\'s own; hex; symbols for digits; Chinese pool)'],
  summary: 'A line decodes in reading order: each cell flickers through the line\'s own alphabet and locks left to right; digits never flicker through digits; Chinese cells flicker through Chinese.',
  theory: 'Reading order reveal: the eye follows the locking edge, so the line is read as it resolves; keeping digits out of the flicker avoids showing a wrong value (the template\'s 2026-10-20 number rule).',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], screen: 'crt', palette: 'ice', seed: 11 }),
  prepare(P) { return { Pal: palOf(P.colors, P.palette) }; },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: clamp(p) }; },
  paint(ctx, S, P, D) {
    const L = P.lang || 'en', Pal = D.Pal, t = S.p;
    ground(ctx, Pal, 0, {});
    (P.lines || []).forEach((l, i) => {
      let f = { ...F('display', L, 108, 800), spacing: zh(L) ? 0 : -0.045 * 108 }; f = fit(ctx, l, f, 1700, 88);
      const t0 = i * 0.35, dur = 0.55;
      display(ctx, decodeAt(l, t, t0, dur, 61 + i), Math.round((1920 - W(ctx, l, f)) / 2), 380 + i * 120, f, Pal, { screen: P.screen });
    });
    post(ctx, Pal, 0, { screen: P.screen });
  },
  track(S) { return [[360 + 1200 * clamp(S.p / 0.9), 440]]; },
};
