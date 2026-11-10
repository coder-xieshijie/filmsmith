// anchor-mark — the product's mark as a print object: the anchor (the piece printed in the process ink, shaded top to
// bottom in 15° dots, knocked out of the black plate with a 3 px trap) and the mark's black plate (45° dots, darkest
// at the anchor), with the field's rings round it in mark space. States: the anchor alone (as it sits through a
// film), the plate inking up out of it, the whole mark, the mark with its rings. The mark's shapes are swapped for the
// product's (SVG paths in mark units, origin at the anchor's centre).
// From the halftone template (assets/templates/halftone/film.js drawAnchor, drawMark, drawMarkRings; content.js mark).
import { markGeo, MARK, drawAnchor, drawMarkPlate, drawMarkRings, worldColors, clamp } from '../../motion/dot-quantize/press.js';

export default {
  id: 'anchor-mark', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [360, 260], M: [720, 520], L: [1080, 780] },
  states: { anchor: { plate: 0, rings: 0 }, inking: { plate: 0.5, rings: 0.5 }, mark: { plate: 1, rings: 0 }, rings: { plate: 1, rings: 1 } },
  parts: ['anchor', 'plate', 'rings'],
  swap: { mark: { type: 'svg-paths', of: ['accent', 'ink', 'box', 'anchorBox'] } },
  roles: ['ground', 'ink', 'accent'],
  defaults: () => ({ ground: true, dot: 'round', mark: MARK }),
  draw(ctx, st, P) {
    const C = P.colors, wc = worldColors(C, 'paper'), G = markGeo(P.mark?.box && P.mark?.anchorBox ? P.mark : MARK), [bx0, by0, bx1, by1] = G.mark.box;
    if (P.ground !== false) { ctx.fillStyle = wc.ground; ctx.fillRect(-P.w, -P.h, P.w * 3, P.h * 3); }
    // the whole mark with its rings (±0.66 mark units) fits the box; the anchor's centre is the origin
    const span = Math.max(bx1 - bx0, 1.32), Z = Math.min(P.w / (span * G.U), P.h / (Math.max(by1 - by0, 1.32) * G.U)) * 0.92;
    const A = [P.w / 2 - ((bx0 + bx1) / 2) * G.U * Z * (st.rings > 0 ? 0 : 1), P.h / 2];
    drawMarkRings(ctx, G, A, Z, wc.ink, st.rings, P.dot);
    if (st.plate > 0) drawMarkPlate(ctx, G, A, Z, wc.ink, { inked: clamp(st.plate * 1.2), shape: P.dot });
    drawAnchor(ctx, G, A, Z, C, { shape: P.dot });
  },
};
