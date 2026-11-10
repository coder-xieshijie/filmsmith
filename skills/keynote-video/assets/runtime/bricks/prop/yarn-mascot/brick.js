// yarn-mascot — the stream style's mascot slot: an anchor at the top of the thread with four poses (sit, drop, squash on
// landing, wound into a point) and, by default, the style's own ball of thread drawn in code (two eyes, three wound arcs,
// its loose end the thread itself). A film with its own mascot swaps in an image at the same anchor; nothing else changes.
// From the stream template: film.js mascot(), renderOpen (the drop and landing), renderLock (the point).
import { palOf } from '../glow-thread/draw.js';
import { night } from '../glow-thread/demo.js';
import { mascot, POSES } from './mascot.js';

export default {
  id: 'yarn-mascot', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [480, 360], M: [720, 540], L: [960, 720] },
  // y: the anchor's height in the frame (px of a 1080 frame); s the scale; sq the landing squash; a the opacity
  states: {
    sit: { y: 540, s: 1, sq: 0, a: 1 },
    drop: { y: 300, s: 1.6, sq: 0, a: 1 },
    squash: { y: 540, s: 1.6, sq: 0.18, a: 1 },
    point: { y: 540, s: 0.6, sq: 0, a: 0.35 },
  },
  parts: ['halo', 'ball', 'wound arcs', 'eyes', 'highlight'],
  swap: { image: { type: 'image', crop: false, optional: true }, size: { type: 'number', min: 30, max: 160, optional: true, sample: 'default' } },
  roles: ['ground', 'accent', 'glow', 'core', 'onAccent'],
  poses: POSES,
  // size: the box (px) the mascot fills sitting on the spine (60 = the ball; a film's own mascot often wants 90–100)
  defaults: () => ({ palette: 'night', image: null, size: 60 }),
  async prepare(P) {
    const pal = palOf(P.colors, P.palette);
    let img = null;
    if (typeof P.image === 'string' && P.image && typeof Image !== 'undefined') { img = new Image(); img.src = P.image; try { await img.decode(); } catch { img = null; } }
    return { ...pal, img };
  },
  draw(ctx, st, P, D) {
    const w = P.w || 720, h = P.h || 540, k = h / 1080;
    ctx.save(); ctx.scale(w / 1920, h / 1080); night(ctx, D.P, 1); ctx.restore();
    const z = P.size > 0 && P.size !== 60 ? P.size / 60 : 1;
    mascot(ctx, D.C, w / 2, st.y * k, st.s * k * 2.4 * z, st.a, st.sq, D.img);
  },
};
