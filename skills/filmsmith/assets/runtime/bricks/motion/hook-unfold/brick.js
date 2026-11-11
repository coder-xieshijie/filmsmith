// hook-unfold — a block is hung on the thread: a point lights on the spine, a short light reaches right along the hook,
// and the block opens from its left edge along it (its width 0 → full, its content clipped as it widens), staying
// hung off the spine by that hook. Played backwards, the block folds back into the thread.
// From the stream template: film.js renderChat (the hook: a point on the spine 64 px below the block's top, the reach to
// its left edge), plan.js cardAt (the unfold over 0.45 s, ease-in-out cubic, from width 0 at the block's left edge).
import { palOf, thread, glow, E, seg, lerp } from '../../prop/glow-thread/draw.js';
import { night, spine, perch, lighter, SPINE } from '../../prop/glow-thread/demo.js';
import { box, shadowOf } from '../../prop/hung-block/blocks.js';

const BOX = [290, 300, 640, 480];
export default {
  id: 'hook-unfold', kind: 'motion',
  tier: 'T0', family: 'line-path', beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'glow', 'core', 'paper'],
  from: 'the spine alone', to: 'a paper block hung on the spine by a lit hook',
  interpolates: ['the hook point\'s light 0 → 1 over the first 30 %', 'the reach from the spine to the block\'s edge', 'the block\'s width 0 → full from its left edge (io3)'],
  summary: 'A point lights on the spine, a short light reaches right and the block unfolds from its left edge along it.',
  theory: 'An object that grows out of what is already on screen keeps the eye\'s anchor (continuity of the visual field); the hook shows where the block belongs before it is there.',
  defaults: () => ({ palette: 'night', rect: BOX }),
  prepare: (P) => palOf(P.colors, P.palette),
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: Math.min(1, Math.max(0, p)) }; },
  paint(ctx, S, P, D) {
    const [x, y, w, h] = P.rect || BOX, p = S.p, a = seg(p, 0, 0.3), o = E.io3(seg(p, 0.1, 1)), hy = y + 64;
    night(ctx, D.P, 1);
    lighter(ctx, () => {
      ctx.save(); spine(ctx, D.C); ctx.restore();
      if (a > 0) { thread(ctx, D.C, [[SPINE.x, hy], [lerp(SPINE.x, x + 6, Math.min(1, a * 1.4)), hy]], 0.9 * a, 0.7); glow(ctx, SPINE.x, hy, 22, D.C.glow, 0.7 * a); glow(ctx, SPINE.x, hy, 6, D.C.core, a); }
    });
    const ow = o * w;
    if (ow > 1) {
      box(ctx, x, y, ow, h, 34, D.P.paper, { shadow: shadowOf(0.42) });
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, ow, h, Math.min(34, ow / 2)); ctx.clip();
      box(ctx, x + 30, y + 34, w * 0.62, 84, [8, 24, 24, 24], D.P.bubble); box(ctx, x + w * 0.3, y + 136, w * 0.62, 56, [24, 8, 24, 24], D.P.user);
      ctx.restore();
    }
    perch(ctx, D.C);
  },
  track(S, P) { const [x, y, w, h] = P.rect || BOX; return [[x + w * E.io3(seg(S.p, 0.1, 1)), y + h / 2]]; },
};
