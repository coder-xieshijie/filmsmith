// sheet-pick — on the contact sheet the grease pencil has ringed one cell (the editor's pick); the ringed cell
// punches to the full frame and the picked film runs on from that frame. The ring stays on the sheet behind it (the
// sheet is paper: the mark does not travel), and the pick is the only cell that leaves the sheet. As gate-punch, a
// log-scale zoom about the shared point, the small end drawn from the sheet's own thumbnail.
// Theory: the contact sheet and the editor's grease-pencil pick (photo editing; the film editor's marked trim); a
// single isolated mark is remembered (von Restorff 1933) and cues where to look before the move (Posner 1980); the
// zoom as in gate-punch. Sources: the contact-sheet edit (a loupe on the picked frame, then the enlargement) fused with
// the trailer's punch-in; the film's own sheet, pencil and frames replace theirs.
import { clamp } from './util.js';
import { punchRect, paintFrame } from './gate-punch.js';
import { pencilLoop } from './strip.js';

export default {
  name: 'sheet-pick',
  tier: 'T2',
  beats: 1,
  modes: ['strip (the pick on the contact sheet)', 'exhibit (a contact sheet on the desk)', 'every mode with a grid of thumbnails'],
  roles: ['ground', 'accent'],
  from: 'the contact sheet with one cell ringed in grease pencil',
  to: 'the ringed cell\'s frame at full size (the film then runs from it)',
  interpolates: ['frame rect (log-scale zoom about the shared point)'],
  summary: 'The cell the grease pencil ringed on the contact sheet punches to the full frame; the ring stays on the sheet.',
  theory: 'The editor\'s pick on a contact sheet; an isolated mark is remembered (von Restorff 1933) and cues the move (Posner 1980).',
  defaults: {
    rect: { x: 432, y: 400, w: 96, h: 54 },    // the ringed cell
    ease: 'out', seed: 3,
    image: null, crop: null, small: null,
    under: null,                               // (ctx) => paints the sheet
    colors: { ground: '#ECEFEE', accent: '#C2185B' },
  },
  rest(side) { return { p: side === 'from' ? 0 : 1 }; },
  at(p) { return { p: clamp(p) }; },
  paint(ctx, St, P) {
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    if (P.under) P.under(ctx);
    pencilLoop(ctx, P.colors, P.rect, 1, { seed: P.seed });
    paintFrame(ctx, { ...P, direction: 'in' }, punchRect({ ...P, direction: 'in' }, St.p));
  },
  track: (St, P) => { const r = punchRect({ ...P, direction: 'in' }, St.p); return [[r.x, r.y], [r.x + r.w, r.y + r.h]]; },
};
