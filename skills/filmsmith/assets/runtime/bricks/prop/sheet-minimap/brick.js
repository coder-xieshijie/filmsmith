// sheet-minimap — the whole sheet in miniature in the right gutter (x 1664–1824, the sheet at 0.107, from y 120): the
// captures shrunk, the bands as stock with their lines as bars, the unfold panel dark; the part out of view veiled 50 %
// in the ground and the frame's place bracketed in the accent (3 px, radius 4). It prints top to bottom once, after the
// hook, and grows when a row unfolds. Real information (where the film is on the page); its text is decoration.
// From the scroll template (the source film film.js minimap; mode card form `minimap: 'on'`).
import { loadSheet, minimap, OFF0, MX, MW } from '../../look/reading-sheet/kit.js';

export default {
  id: 'sheet-minimap', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // reveal: printed share; at: the frame's offset as a share of the sheet; open: the unfold panel
  states: { printing: { reveal: 0.5, at: 0, open: 0 }, reading: { reveal: 1, at: 0.3, open: 0 }, unfolded: { reveal: 1, at: 0.45, open: 1 } },
  parts: ['strips', 'bands', 'panel', 'veil', 'bracket'],
  swap: {},
  roles: ['ground', 'paper', 'onPaper', 'panel', 'accent'],
  defaults: () => ({ sheet: null }),
  async prepare(P) { return { G: await loadSheet(P.sheet, P.lang || 'en') }; },
  draw(ctx, state, P, D) {
    const k = P.w / 1920, C = P.colors, G = D?.G;
    ctx.save(); ctx.scale(k, k);
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    if (G) { const L = G.layout(state.open); minimap(ctx, G, OFF0 + state.at * L.length, C, { open: state.open, reveal: state.reveal }); }
    ctx.restore();
  },
};
