// gate-punch — the frame registered in the gate (or one cell of a contact sheet) punches to the full frame: one zoom
// about the point the small and the full rect share, on a log scale; or, `out`, the full frame shrinks into its place
// in the next scene, which was laid underneath while the frame covered the screen. The frame is the one object the eye
// follows; the scene behind it changes only while it is hidden (occlusion), so two scenes are never seen over each
// other. At the small end the frame is drawn from the small picture the scene itself shows (a contact-sheet thumbnail),
// at every larger size from the full-resolution frame, so the zoom never enlarges a source past 4/3 px per px.
// Theory: the punch-in (a cut-in to a detail) as a continuous zoom; a log-scale zoom reads as constant speed
// (van Wijk & Nuij 2003); occlusion lets a change happen out of sight and be accepted (Kanizsa 1979); object constancy
// (Heer & Robertson 2007). Sources: the freeze-frame punch of film trailers and the loupe on a light box, fused; the
// film's own objects (its frames, its gate, its sheet) replace theirs.
import { clamp, cubicInOut, cubicOut } from './util.js';
import { zoomRect, drawCrop, FULL } from './strip.js';
import { placeholderFrame } from './stage.js';

export const EASES = { out: (u) => cubicOut(u), inOut: (u) => cubicInOut(u) };

export const punchRect = (P, p) => {
  const u = (EASES[P.ease] ?? EASES.out)(clamp(p));
  return P.direction === 'out' ? zoomRect(P.rect, FULL, 1 - u) : zoomRect(P.rect, FULL, u);
};
// the picture at a displayed width: the small one (if given) while it is not enlarged past 4/3, else the full frame
export function paintFrame(ctx, P, r) {
  const small = P.small;
  if (small && r.w <= small.crop[2] * (4 / 3) + 1e-6) drawCrop(ctx, small.img, small.crop, r);
  else if (P.image) drawCrop(ctx, P.image, P.crop, r);
  else drawCrop(ctx, placeholderFrame(0), null, r);                  // the defaults' neutral frame
}

export default {
  name: 'gate-punch',
  tier: 'T2',
  beats: 1,
  modes: ['strip (a frame to the full frame and back)', 'exhibit (a print to full frame)', 'every mode with a frame in a gate or a cell of a sheet'],
  roles: ['ground'],
  from: 'a frame in the gate or a cell of the sheet (direction in); the full frame (out)',
  to: 'the full frame (in); the frame in its place in the next scene (out)',
  interpolates: ['frame rect (log-scale zoom about the shared point)'],
  summary: 'A registered frame punches to the full frame, or the full frame shrinks into its place in the next scene.',
  theory: 'A continuous cut-in; log-scale zoom (van Wijk & Nuij 2003); change under occlusion (Kanizsa 1979); object constancy (Heer & Robertson 2007).',
  defaults: {
    rect: { x: 544, y: 252, w: 832, h: 468 },  // the small end: the gate's frame rect, or a sheet cell
    direction: 'in', ease: 'out',
    image: null, crop: null,                   // the full-resolution frame
    small: null,                               // { img, crop }: the picture the scene shows at the small end
    under: null,                               // (ctx) => paints the scene behind the frame (the gate, or the sheet)
    colors: { ground: '#ECEFEE' },
  },
  rest(side, P) { return { p: (side === 'from') ? 0 : 1 }; },
  at(p) { return { p: clamp(p) }; },
  paint(ctx, St, P) {
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    if (P.under) P.under(ctx);
    paintFrame(ctx, P, punchRect(P, St.p));
  },
  track: (St, P) => { const r = punchRect(P, St.p); return [[r.x, r.y], [r.x + r.w, r.y + r.h]]; },
};
