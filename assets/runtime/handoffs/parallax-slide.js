// parallax-slide — each exhibit is three layers at three depths: a large index numeral far back, the asset in its
// window in the middle, a caption chip (the claim the asset carries, drawn in code) in front. The camera slides one
// exhibit sideways and every layer moves at its own rate: the numeral drifts, the window travels a screen, the chip
// races. All three reach their rest on the same frame, so the landing is one landing.
// Theory: motion parallax is a depth cue (rate of image motion inversely proportional to distance; Gibson 1950,
// Rogers & Graham 1979); the multiplane camera of 1930s animation gave flat artwork depth by moving layers
// at different speeds; depth separates evidence (middle) from reading (front) without colour (principle 3).
// Sources: multiplane and 2.5D parallax in title design; HyperFrames `camera-rig-depth-stack`, `caption-parallax-
// layers` (named, not copied).

import { cubicInOut, text, rrect } from './util.js';
import { NEUTRAL, assetOf, placeholderPage, windowOf, contentOf, windowBack, windowFront, clipWindow } from './asset.js';
import { coverView, paintView, castShadow } from './stage.js';

export default {
  name: 'parallax-slide',
  tier: 'T1',
  beats: 1.5,
  modes: ['exhibit', 'blueprint (sheet, title block, note)', 'thread', 'plakat'],
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'],
  from: 'one exhibit: index numeral (back), asset window (middle), caption chip (front)',
  to: 'the next exhibit, the same three layers',
  interpolates: ['camera x, applied to each layer × its depth (0.3, 1, 1.65)'],
  summary: 'The camera slides to the next exhibit; numeral, window and caption chip move at three depths and land together.',
  theory: 'Motion parallax as a depth cue (Gibson 1950; Rogers & Graham 1979); the multiplane camera (1930s animation); depth, not colour, separates evidence from reading.',
  defaults: {
    items: [
      { asset: null, title: 'example.com/a', index: '01', chip: ['First benchmark', '48.0'] },
      { asset: null, title: 'example.com/b', index: '02', chip: ['Second benchmark', '71.5'] },
    ],
    from: 0, to: 1,
    window: { x: 600, y: 170, w: 1200, h: 676 },
    chip: { x: 130, y: 690, w: 600, h: 190 },
    numeral: { x: 96, baseline: 560, size: 420 },
    depth: { back: 0.3, mid: 1, front: 1.65 },
    spacing: 1920,
    font: { family: 'sans-serif', weight: 700 },
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const W = windowOf(P.window.x, P.window.y, P.window.w, P.window.h);
    const R = contentOf(W);
    const items = P.items.map((it, i) => {
      const A = assetOf(it.asset, () => placeholderPage(2000, 1125 + 100 * i));
      return { ...it, A, v: coverView(A, R, it.focus) };
    });
    return { W, R, items };
  },
  rest(side, P) { return { c: side === 'from' ? P.from : P.to }; },
  at(p, P) { return { c: P.from + (P.to - P.from) * cubicInOut(p) }; },
  paint(ctx, S, P, D) {
    const C = P.colors, W = D.W, R = D.R, dp = P.depth;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const off = (i, d) => (i - S.c) * P.spacing * d;
    const vis = (i, d, x0, w) => x0 + off(i, d) < 1920 && x0 + w + off(i, d) > 0;
    // back: the numerals
    D.items.forEach((it, i) => {
      if (!vis(i, dp.back, P.numeral.x, P.numeral.size * 1.4)) return;
      text(ctx, it.index, P.numeral.x + off(i, dp.back), P.numeral.baseline, { ...P.font, weight: 800, size: P.numeral.size }, { color: C.line });
    });
    // middle: the windows
    D.items.forEach((it, i) => {
      const dx = off(i, dp.mid);
      if (!vis(i, dp.mid, W.x, W.w)) return;
      const Wi = { ...W, x: W.x + dx }, Ri = { ...R, x: R.x + dx };
      castShadow(ctx, Wi, { radius: W.r, alpha: 0.4 });
      windowBack(ctx, Wi, P);
      ctx.save(); clipWindow(ctx, Wi); paintView(ctx, it.A, { ...it.v, bx: it.v.bx + dx }, Ri); ctx.restore();
      windowFront(ctx, Wi, P, { title: it.title });
    });
    // front: the caption chips
    D.items.forEach((it, i) => {
      const K = P.chip, dx = off(i, dp.front);
      if (!it.chip || !vis(i, dp.front, K.x, K.w)) return;
      const r = { x: K.x + dx, y: K.y, w: K.w, h: K.h };
      castShadow(ctx, r, { radius: 10, alpha: 0.5, blur: 36, dy: 18 });
      ctx.fillStyle = C.panel; rrect(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; rrect(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 9); ctx.stroke();
      ctx.fillStyle = C.accent; ctx.fillRect(r.x + 28, r.y + 34, 6, r.h - 68);
      text(ctx, it.chip[0], r.x + 56, r.y + 66, { ...P.font, weight: 500, size: 32 }, { color: C.dim });
      text(ctx, it.chip[1], r.x + 56, r.y + 150, { ...P.font, weight: 700, size: 76 }, { color: C.ink });
    });
  },
  track: (S, P, D) => [P.from, P.to].flatMap((i) => [[D.W.x + (i - S.c) * P.spacing * P.depth.mid, D.W.y], [P.chip.x + (i - S.c) * P.spacing * P.depth.front, P.chip.y]]),
};
