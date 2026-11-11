// star-launch — a finished task becomes a star: the task row hung on its beam shrinks into its status ring (the beam
// retracting with it), and from there a star leaves with a short comet tail, arcing up into the sky where it stays, bright
// and twinkling, one more thing the product is keeping track of. The row is a neutral placeholder.
// From the stream template: film.js renderAsk (the row's exit: in3 over 0.35 s towards its ring, the beam's fade) and the
// stars of renderBG (the quadratic arc through a vertex 120 px above, io2 over 0.8 s, the 8-step tail, the size ×1.7 in
// flight); plan.js the ask's star.
import { palOf, thread, glow, star, straight, E, seg, lerp } from '../../prop/glow-thread/draw.js';
import { night, spine, perch, lighter, SPINE } from '../../prop/glow-thread/demo.js';
import { box, ring, shadowOf } from '../../prop/hung-block/blocks.js';

const ROW = [1060, 650, 760, 130], TO = [1520, 330], SHRINK = [0, 0.7 / 3], FLY = [0.1 / 3, 1.7 / 3];
const starAt = (p, from) => {
  const q = E.io2(seg(p, FLY[0], FLY[1])), v = [lerp(from[0], TO[0], 0.5), Math.min(from[1], TO[1]) - 120], r = 1 - q;
  return [r * r * from[0] + 2 * r * q * v[0] + q * q * TO[0], r * r * from[1] + 2 * r * q * v[1] + q * q * TO[1]];
};
export default {
  id: 'star-launch', kind: 'motion',
  tier: 'T1', family: 'shape', beats: 3,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'glow', 'core', 'paper', 'rule', 'accentInk'],
  from: 'a task row hung on a beam from the thread', to: 'a star in the sky where the task went',
  interpolates: ['the row\'s scale 1 → 0 about its ring (in3, 0–0.7 beat)', 'the beam\'s opacity', 'the star along a quadratic arc through a vertex 120 px above (io2, 0.1–1.7 beats), size 1.7 → 1, an 8-step tail'],
  summary: 'A finished task row shrinks into its status ring and leaves as a star with a comet tail, arcing up into the sky.',
  theory: 'A shape change at one point (the row collapses to its ring, the ring becomes the star) keeps one object through two forms (object constancy); the arc and tail give the launch weight and direction (arcs, Thomas & Johnston).',
  defaults: () => ({ palette: 'night' }),
  prepare: (P) => palOf(P.colors, P.palette),
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: Math.min(1, Math.max(0, p)) }; },
  paint(ctx, S, P, D) {
    const p = S.p, [x, y, w, h] = ROW, ringC = [x + 47, y + h / 2], out = E.in3(seg(p, SHRINK[0], SHRINK[1]));
    night(ctx, D.P, 1);
    lighter(ctx, () => {
      spine(ctx, D.C);
      if (out < 1) { thread(ctx, D.C, straight([SPINE.x + 700, y + h / 2], [x, y + h / 2], 12), 0.85 * (1 - out), 0.7); glow(ctx, SPINE.x + 700, y + h / 2, 18, D.C.glow, 0.7 * (1 - out)); }
    });
    if (out < 1) {
      ctx.save(); ctx.globalAlpha = 1 - seg(out, 0.7, 1); ctx.translate(ringC[0], ringC[1]); ctx.scale(1 - out, 1 - out); ctx.translate(-ringC[0], -ringC[1]);
      box(ctx, x, y, w, h, 28, D.P.paper, { shadow: shadowOf(0.42) }); ring(ctx, D.P, ringC[0], ringC[1], 0);
      box(ctx, x + 80, y + 38, 300, 16, 8, D.P.bubble); box(ctx, x + 80, y + 76, 420, 14, 7, D.P.bubble);
      ctx.restore();
    }
    if (p >= FLY[0]) lighter(ctx, () => {
      const fly = seg(p, FLY[0], FLY[1]), fl = fly < 1 ? 1 - fly : 0, a = E.out3(seg(p, FLY[0], FLY[0] + 0.07)), sp = starAt(p, ringC);
      if (fl > 0) for (let k = 8; k >= 1; k--) { const pk = p - (k * 0.03) / 1.5; if (pk >= FLY[0]) { const q = starAt(pk, ringC); glow(ctx, q[0], q[1], 20 - k, D.C.glow, 0.45 * fl * (1 - k / 9)); } }
      star(ctx, D.C, sp[0], sp[1], 1 + 0.7 * fl, a);
    });
    perch(ctx, D.C);
  },
  track(S) { return [S.p >= FLY[0] ? starAt(S.p, [ROW[0] + 47, ROW[1] + ROW[3] / 2]) : [ROW[0] + 47, ROW[1] + ROW[3] / 2]]; },
};
