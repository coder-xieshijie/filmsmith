// thread-line — the one object of a thread film: the line in the line colour that becomes everything, drawn in the
// thread's profile ('rule', an even 6 px line with square ends; 'swell', a swelled rule 12 px in the middle tapering to
// points). Its states are the forms the chain passes it through: the 1400 × 6 line, the 6 × 64 caret, the 4 px
// playhead at full height. And the engine every thread scene imports: kit.js (palette, lineBox, linkScene), chain.js
// (the template's film.js as a factory), fx.js, shots.js, rules.js and gl.js (the spheres and the ink, WebGL).
// From the thread template: film.js threadRect, swellPath, CARET, FLAT; shots.js LINE, SWELL.
import { palOf, lineBox } from './kit.js';

export default {
  id: 'thread-line', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // the line's box (film px, centred) and its profile blend (0 rule, 1 swell)
  states: {
    line: { cx: 960, cy: 540, w: 1400, h: 6, s: 0 },
    caret: { cx: 960, cy: 540, w: 6, h: 64, s: 0 },
    swell: { cx: 960, cy: 540, w: 1400, h: 6, s: 1 },
    playhead: { cx: 960, cy: 540, w: 6, h: 1080, s: 0 },
  },
  parts: ['the line (rule or swell)', 'ground'],
  swap: {},
  roles: ['ground', 'accent'],
  defaults: () => ({ palette: 'cobalt-vermilion', ground: true }),
  prepare: (P) => ({ Pal: palOf(P.colors, P.palette) }),
  draw(ctx, st, P, D) {
    const k = (P.w || 1920) / 1920, Pal = D.Pal;
    ctx.save();
    if (P.ground !== false) { ctx.fillStyle = Pal.ground; ctx.fillRect(0, 0, P.w || 1920, P.h || 1080); }
    ctx.scale(k, k);
    ctx.fillStyle = Pal.line;
    lineBox(ctx, st.cx - st.w / 2, st.cy - st.h / 2, st.w, st.h, st.s > 0 ? 'swell' : 'rule', st.s);
    ctx.fill();
    ctx.restore();
  },
};
