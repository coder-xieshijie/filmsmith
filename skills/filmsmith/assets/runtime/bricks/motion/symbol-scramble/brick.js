// symbol-scramble — a measured value resolves in place: every digit slot shows a symbol (#&*@) drawn from a seeded hash
// 24 times a second, in the slots of the final string so nothing jitters, and never another digit, so no still frame
// shows a plausible wrong number; then the digits lock left to right. `kind: 'count'` instead counts the value up over
// the move in its own format (separators, decimals, suffix), expo out. Only digits scramble; units, signs and words
// (Chinese too) stand from the first frame.
// From the pulse template (assets/templates/pulse/film.js valueGlyphs, scrambleChar, numFormat; mode card Motion
// "Scramble", 2026-10-20: symbols instead of digits).
import { clamp } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { X0, F, draw, widthOf, fillGround, groundHex, onGround, glyphSlots, scrambleChar, countTo, rise, SZ } from '../../look/query-ramp/kit.js';

const DEFAULT = { en: { value: '0.6 s', label: 'p50 rebuild' }, zh: { value: '0.6 秒', label: '中位重建' } };
export default {
  id: 'symbol-scramble', kind: 'motion',
  tier: 'T0', family: 'mask-type',
  beats: 1, beatsFor: (P) => (P.kind === 'count' ? 1 : 1),
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'r2'],
  from: 'a value slot of symbols (or zero, counting)', to: 'the measured value, resolved, its label beside it',
  interpolates: ['symbol per digit slot (seeded, 24 Hz) until the lock', 'digits locked left to right', 'count: value × expo-out'],
  summary: 'A value resolves in its own digit slots: symbols flicker 24 times a second, never other digits, then the digits lock left to right; or it counts up in its own format.',
  theory: 'Expectation and resolution (Huron 2006): the flicker builds the wait; fixed slots keep the eye still (no layout jitter); symbols rather than digits keep every still frame truthful (principle 2).',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], kind: 'scramble', size: 291, y: 640, ground: 'r2', seed: 20261019, bpm: 120 }),
  rest(side) { return { p: side === 'from' ? 0 : 1 }; },
  at(p) { return { p }; },
  paint(ctx, S, P) {
    const C = P.colors, L = P.lang || 'en', col = onGround(C, P.ground || 'r2'), f = F('display', L, P.size || 291);
    fillGround(ctx, groundHex(C, P.ground || 'r2'));
    const sec = (S.p * 60) / (P.bpm || 120), n = [...String(P.value)].filter((ch) => /\d/.test(ch)).length;
    if (P.kind === 'count') draw(ctx, S.p >= 1 ? P.value : countTo(P.value, expOut(S.p)), X0, P.y, f, col.text, L);
    else {
      // the lock runs over the last 40 % of the move, one digit slot after another
      const locked = S.p >= 1 ? 1e9 : Math.floor(clamp((S.p - 0.6) / 0.4) * (n + 1));
      let d = 0;
      glyphSlots(ctx, P.value, X0, P.y, f, col.text, (i, ch) => { if (!/\d/.test(ch)) return ch; d++; return d <= locked ? ch : scrambleChar(i, Math.floor(sec * 24), P.seed || 1); });
    }
    if (P.label) { const w = (ctx2) => widthOf(ctx2, P.value, f, L); rise(ctx, P.label, X0 + w(ctx) + 48, P.y, sec, (0.75 * 60) / (P.bpm || 120), F('text', L, SZ.line), col.text, L); }
  },
  track(S, P) { return [[X0 + 200, (P.y || 640) - 100]]; },
};
