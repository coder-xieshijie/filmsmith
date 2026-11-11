// quote-band — a pull quote pasted into the sheet: a band of warm paper stock across the sheet's width (it crosses
// the captured page's edges, so it reads as pasted in), the quoted words in Schibsted Grotesk — 96 px bold in the
// 320 px hook band, 69 px semibold in a 250 px quote band — inset 96 px, two lines, each phrase rising into its own
// line box (expo out, half a beat) and the lines rising out together when the band is re-used. The words are the page's
// own, cut, never added to.
// From the scroll template (the source film film.js band, slotLine, phraseLine).
import { SX, SW, F, drawBand } from '../../look/reading-sheet/kit.js';

const SWAP = { lines: { type: 'list', count: [1, 2], of: { type: 'list', count: [1, 4], of: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 20 }, zh: { chars: 6 } } } } } };
export default {
  id: 'quote-band', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // b: the beat the band is shown at (phrases enter at beats 0, 1, 2 …); hook: the 320 px band at 96 px
  states: { entering: { b: 0.25, hook: false }, quoted: { b: 9, hook: false }, hook: { b: 9, hook: true } },
  parts: ['stock', 'line', 'phrase'],
  swap: SWAP,
  roles: ['ground', 'paper', 'onPaper'],
  defaults: (ctx = {}) => ({ lines: ctx.lang === 'zh' ? [['只重建', '改动碰到的'], ['那部分。']] : [['Only what', 'an edit touches,'], ['rebuilt.']] }),
  draw(ctx, state, P) {
    const k = P.w / 1920, C = P.colors, L = P.lang || 'en', h = state.hook ? 320 : 250;
    ctx.save(); ctx.scale(k, k);
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    let at = 0; const lines = (P.lines || []).map((ln) => ln.map((t) => ({ text: t, at: at++ })));
    drawBand(ctx, 540 - h / 2, h, { size: state.hook ? 96 : 69, weight: state.hook ? 700 : 600, lines: [] }, C, L, state.b, { lines });
    ctx.restore();
  },
};
