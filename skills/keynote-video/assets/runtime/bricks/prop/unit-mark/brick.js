// unit-mark — what one item looks like in a counted film, shown as a small block of them: a rounded square (79 % of
// its cell), a dot of the same area, or an Isotype pictogram (a page, a box, a chip) that is the square below 7 px and
// the whole pictogram from 12 px. States are the colours a mark wears: base (the comparison group), marked (the
// protagonist, in the accent), swollen (a reveal or the closing light), rest ("not it"). One mark for the whole film.
// From the tally template (assets/templates/tally/marks.js, squares.js): shapes and rules are the template's.
import { mix } from '../../../handoffs/util.js';
import { drawMark, tones, ROLE } from '../../motion/unit-flight/units.js';

export default {
  id: 'unit-mark', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [240, 160], M: [480, 320], L: [960, 640] },
  states: { base: { accent: 0, rest: 0, swell: 0 }, marked: { accent: 1, rest: 0, swell: 0 }, swollen: { accent: 1, rest: 0, swell: 1 }, rest: { accent: 0, rest: 1, swell: 0 } },
  parts: ['mark'],
  swap: {},
  roles: ['ground', 'base', 'rest', 'accent'],
  defaults: () => ({ mark: 'square', cols: 6, rows: 4, ground: true }),
  draw(ctx, st, P) {
    const C = P.colors, T = tones(C), p = P.w / P.cols, s = Math.round(p * 0.79);
    if (P.ground !== false) { ctx.fillStyle = C.ground; ctx.fillRect(-40, -40, P.w + 80, P.h + 80); }
    for (let r = 0; r < P.rows; r++) for (let c = 0; c < P.cols; c++) {
      const i = r * P.cols + c, lead = i < P.cols, col = mix(mix(T[ROLE.base], T[ROLE.rest], st.rest), T[ROLE.accent], lead ? st.accent : 0);
      const z = s * (1 + (lead ? 0.4 * st.swell : 0));
      ctx.fillStyle = col; drawMark(ctx, P.mark, c * p + (s - z) / 2, r * p * (P.h / (P.rows * p) || 1) + (s - z) / 2, z);
    }
  },
};
