// seal-stamp — the narrator as a seal: a 64 px rounded vermilion square with an inner frame and one paper glyph (我 by
// default, Me in English), dropped in from 1.6×, hopping over a spot, pressing (0.88 rebound) and leaving a hollow round
// imprint; hollow (paper with a vermilion glyph) while the person is absent. One stamp a film, handed between scenes.
// From teach-video assets/kits/terminal-ledger/starter/components/stamp.js (F.stamp, F.stampIn, F.pressAt, F.imprint,
// F.stampHollow, F.stampSolid); drawn by the kit's drawStamp and drawImprint.
import { drawStamp, drawImprint, clamp, lerp } from '../../look/paper-ledger/kit.js';

// a: shown; s: scale (1.6 dropping in); lift: 0 on the spot, 1 hovering 64 px above it; press: 0–1 of the squash
// (0.88 at 1); imprint: 0–1 of the imprint left beside the spot; hollow: 0 solid, 1 hollow
const STATES = {
  hidden: { a: 0, s: 1.6, lift: 1, press: 0, imprint: 0, hollow: 0 },
  landed: { a: 1, s: 1, lift: 1, press: 0, imprint: 0, hollow: 0 },
  pressed: { a: 1, s: 1, lift: 0, press: 1, imprint: 1, hollow: 0 },
  lifted: { a: 1, s: 1, lift: 1, press: 0, imprint: 1, hollow: 0 },
  hollow: { a: 1, s: 1, lift: 1, press: 0, imprint: 1, hollow: 1 },
};
export default {
  id: 'seal-stamp', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [320, 320], M: [640, 640], L: [960, 960] },
  states: STATES,
  parts: ['square', 'inner frame', 'glyph', 'imprint'],
  swap: { glyph: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 3 }, zh: { chars: 1 } } } },
  roles: ['ground', 'paper', 'accent', 'accentRing'],
  summary: 'The narrator as a seal: a vermilion square with one glyph that drops in, hops over a spot, presses and leaves a round imprint; hollow while the person is away.',
  defaults: (ctx = {}) => ({ glyph: ctx.lang === 'zh' ? '我' : 'Me' }),
  draw(ctx, S, P) {
    const k = P.w / 320, cx = 160, cy = 196, C = P.colors;
    ctx.save(); ctx.scale(k, k);
    if (S.imprint > 0) drawImprint(ctx, C, P.lang, cx - 86, cy, S.imprint * 0.12, 0, P.glyph);
    const press = clamp(S.press);
    drawStamp(ctx, C, P.lang, { x: cx, y: cy - 64 * clamp(S.lift), s: S.s * lerp(1, 0.88, press), a: clamp(S.a), hollow: S.hollow }, P.glyph);
    ctx.restore();
  },
};
