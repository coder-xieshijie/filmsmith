// strand-zoom — whole – part – whole on the thread: three glass cards hang on strands from the spine; one card grows in
// place to 1.45 × with its rows arriving, its strand following its left edge, while the others step back (dimmed to 30 %,
// nudged right); handing over, the next card grows as the previous one shrinks, so the zoom never returns to an empty
// frame between parts. `from` and `to` are card indices (-1: the three whole). The cards are neutral placeholders.
// From the stream template: film.js cardGeo and renderCards (io3 over 0.55 s, the zoom target x 900 at 1.45 ×, centred on
// y 600, the strand's ease from the spine), sched.js cards (rows 0.6 beat after the zoom, 0.4 beat apart).
import { palOf, thread, glow, E, seg, lerp, clamp } from '../../prop/glow-thread/draw.js';
import { night, spine, perch, lighter, SPINE } from '../../prop/glow-thread/demo.js';
import { box, shadowOf } from '../../prop/hung-block/blocks.js';

const CARD = { x: 1100, w: 640, ys: [330, 540, 750], h0: 150, h1: 300 }, ZOOM = { x: 900, s: 1.45 }, ZT = 1.1 / 2;
export default {
  id: 'strand-zoom', kind: 'motion',
  tier: 'T1', family: 'zoom-depth', beats: 2,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'glow', 'core', 'panel', 'panel2', 'ink', 'dim'],
  from: 'three cards on strands, card `from` enlarged (or none)', to: 'card `to` enlarged in place, its rows in, the others stepped back',
  interpolates: ['each card\'s zoom z (io3 over 0.55 s): x, y, scale 1 → 1.45, height to its rows', 'the others\' dim: opacity 1 → 0.3, 90 px right', 'the strand from the spine to the card\'s left edge', 'the rows of the card zoomed in (out3 0.3 s each, from 0.6 beat, 0.4 beat apart)'],
  summary: 'A card on its strand grows in place with its rows while the previous one shrinks back, so the zoom never leaves the thread.',
  theory: 'Whole – part – whole (owner, 2026-11-05): detail is shown by enlarging the part in place, so the viewer never loses where it sits in the whole (focus + context, Furnas).',
  defaults: () => ({ palette: 'night', from: -1, to: 0 }),
  prepare: (P) => palOf(P.colors, P.palette),
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: clamp(p) }; },
  zOf(i, p, P) { const q = E.io3(seg(p, 0, ZT)); return (i === P.to ? q : 0) + (i === P.from ? 1 - q : 0); },
  geo(i, p, P) {
    const z = this.zOf(i, p, P), dim = Math.max(0, ...[0, 1, 2].filter((j) => j !== i).map((j) => this.zOf(j, p, P)));
    const h = lerp(CARD.h0, CARD.h1, z), y = lerp(CARD.ys[i], Math.max(260, 600 - (CARD.h1 * ZOOM.s) / 2), z);
    return { x: lerp(CARD.x, ZOOM.x, z) + 90 * dim * (1 - z), y, s: lerp(1, ZOOM.s, z), h, a: lerp(1, 0.3, dim * (1 - z)), z };
  },
  paint(ctx, S, P, D) {
    const p = S.p;
    night(ctx, D.P, 1);
    const gs = [0, 1, 2].map((i) => this.geo(i, p, P));
    lighter(ctx, () => {
      spine(ctx, D.C);
      gs.forEach((g, i) => { const sy = CARD.ys[i] + CARD.h0 / 2, ex = g.x, ey = g.y + (g.h * g.s) / 2, pts = []; for (let j = 0; j <= 30; j++) { const x = lerp(SPINE.x, ex, j / 30); pts.push([x, lerp(sy, ey, E.io2(clamp(((x - SPINE.x) / Math.max(1, ex - SPINE.x)) * 1.4 - 0.4)))]); } thread(ctx, D.C, pts, 0.95 - 0.5 * (1 - g.a), 0.75); glow(ctx, SPINE.x, sy, 18, D.C.glow, 0.6); });
    });
    [...gs.keys()].sort((a, b) => gs[a].z - gs[b].z).forEach((i) => {
      const g = gs[i];
      ctx.save(); ctx.globalAlpha = g.a; ctx.translate(g.x, g.y + g.h / 2); ctx.scale(g.s, g.s); ctx.translate(0, -g.h / 2);
      box(ctx, 0, 0, CARD.w, g.h, 28, D.P.panel, { shadow: shadowOf(0.45), stroke: [2, `rgba(${D.C.line},0.55)`] });
      const fill = `rgba(${D.C.text},0.8)`;
      box(ctx, 36, 34, 220, 26, 8, fill); box(ctx, 36, 78, 320, 14, 7, `rgba(${D.C.text2},0.6)`);
      if (i === P.to) [0, 1].forEach((j) => { const rk = E.out3(seg(p, (0.6 + 0.4 * j) / 2, (0.6 + 0.4 * j) / 2 + 0.3)) * g.z, ry = 112 + j * 78; if (ry + 64 < g.h && rk > 0.001) { ctx.save(); ctx.globalAlpha *= rk; ctx.translate(20 * (1 - rk), 0); box(ctx, 36, ry, CARD.w - 72, 64, 16, D.P.panel2, { stroke: [1.5, `rgba(${D.C.line},0.35)`] }); box(ctx, 56, ry + 25, 260, 14, 7, `rgba(${D.C.text},0.6)`); ctx.restore(); } });
      ctx.restore();
    });
    perch(ctx, D.C);
  },
  track(S, P) { return [0, 1, 2].map((i) => { const g = this.geo(i, S.p, P); return [g.x + CARD.w * g.s, g.y + g.h * g.s]; }); },
};
