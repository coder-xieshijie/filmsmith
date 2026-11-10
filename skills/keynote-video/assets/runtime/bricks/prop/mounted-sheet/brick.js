// mounted-sheet — an exhibit on the mat: the real page cropped and scaled (≤ 4/3 output px per source px) on a paper
// mount with a 24 px margin and a faint tooth, two hard paper edges stacked under it, the rest of the page veiled 50 %
// in the mat outside the lit band, the published claim struck with the highlighter in multiply (a parallelogram,
// slanted 5 px; under the line when the claim is printed in colour), a leader in ink with an accent core from the band
// to the sticker. The page is never recoloured, retouched or rebuilt.
// From the dossier template's example (the dossier source film film.js paper, edges, paintSheet; layout.js
// sheetOf, bandOf, leaderOf).
import { measureCtx, X0, Y0, exhibitSpec, loadImage, sheetOf, bandOf, paintSheet, PLACEHOLDER } from '../../look/evidence-mat/kit.js';

export default {
  id: 'mounted-sheet', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // veil, stroke, leader: 0–1; stamp: the sticker on
  states: { plain: { veil: 0, stroke: 0, leader: 0, stamp: 0 }, veiled: { veil: 1, stroke: 0, leader: 0, stamp: 0 }, struck: { veil: 1, stroke: 1, leader: 1, stamp: 1 } },
  parts: ['mount', 'edges', 'page', 'veil', 'stroke', 'leader', 'sticker'],
  swap: { exhibit: { type: 'object' } },
  roles: ['ground', 'paper', 'onPaper', 'line', 'accent', 'onAccent'],
  defaults: () => ({ exhibit: { band: PLACEHOLDER.band(1) } }),
  async prepare(P) {
    const L = P.lang || 'en', e = exhibitSpec(P.exhibit || {}, L), G = sheetOf(measureCtx(), e, L);
    return { e, G, img: await loadImage(e.src), band: bandOf(G, e.band, e.under) };
  },
  draw(ctx, state, P, D) {
    const k = P.w / 1920, C = P.colors, L = P.lang || 'en';
    ctx.save(); ctx.scale(k, k);
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    if (D) paintSheet(ctx, D.G, D.img, { band: D.band, veil: state.veil, stroke: state.stroke, leader: D.e.leader && state.leader > 0 ? { route: D.e.leader, p: state.leader, dot: 1 } : null, stamp: state.stamp > 0.5 ? { a: 1, s: 1 } : null }, X0, Y0 - 60, C, L);
    ctx.restore();
  },
};
