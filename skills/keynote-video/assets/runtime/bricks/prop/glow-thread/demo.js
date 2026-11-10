// demo.js — the stage every stream motion and prop is shown on when it runs alone: the night sky, the spine down the left
// with the mascot on top, and neutral paper placeholders (two grey lines, no copy) for the things the thread carries.
import { sky } from '../../look/night-sky/texture.js';
import { thread, straight, glow } from './draw.js';
import { mascot } from '../yarn-mascot/mascot.js';
import { box, shadowOf } from '../hung-block/blocks.js';

export const SPINE = { x: 230, top: 236, bottom: 1010, mascot: [230, 156] };
export const night = (ctx, P, t = 0, seed = 7) => sky(ctx, P, t, { seed, duration: 0 });
export const spine = (ctx, C, a = 1, bottom = SPINE.bottom) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; thread(ctx, C, straight([SPINE.x, SPINE.mascot[1] + 34], [SPINE.x, bottom], 60), a); ctx.restore(); };
export const perch = (ctx, C, x = SPINE.mascot[0], y = SPINE.mascot[1], s = 1, a = 1, sq = 0) => mascot(ctx, C, x, y, s, a, sq);
// a neutral paper block w × h at its top left: radius r, the shadow of the hung blocks, two grey lines
export const placeholder = (ctx, P, x, y, w, h, { r = 22, lit = 0, C = null, dark = false } = {}) => {
  box(ctx, x, y, w, h, r, dark ? P.panel : P.paper, { shadow: lit > 0.01 && C ? { color: `rgba(${C.line},${(0.6 * lit).toFixed(2)})`, oy: 0, blur: 40 * lit } : shadowOf(0.42) });
  if (lit > 0.01 && C) box(ctx, x - 1.5 * lit, y - 1.5 * lit, w + 3 * lit, h + 3 * lit, r + 1.5 * lit, null, { stroke: [3 * lit, `rgba(${C.line},${(0.9 * lit).toFixed(2)})`] });
  const fill = dark ? `rgba(${P.rgb.text2},0.25)` : P.bubble;
  box(ctx, x + Math.min(28, w * 0.1), y + h * 0.36, w * 0.56, Math.min(14, h * 0.1), 7, fill);
  box(ctx, x + Math.min(28, w * 0.1), y + h * 0.36 + Math.min(32, h * 0.22), w * 0.36, Math.min(14, h * 0.1), 7, fill);
};
export const lighter = (ctx, fn) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; fn(); ctx.restore(); };
export { glow };
