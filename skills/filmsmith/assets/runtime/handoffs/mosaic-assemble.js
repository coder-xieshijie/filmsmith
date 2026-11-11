// mosaic-assemble — the next asset arrives as a mosaic: its window is cut into square tiles that grow in place from
// points (a landing spring, no overshoot), in order of distance from the region the next scene is about, so the
// picture assembles outward from the claim and covers the current one. A tile is the next asset's own pixels, scaled
// about the tile's centre and never above 1:1; when the last tile lands the window is exactly the next asset.
// Theory: the order of assembly is a cue: the first tiles land where the viewer should look (Posner 1980); many small
// pieces moving alike group as one surface (common fate, Wertheimer 1923); a mosaic is the oldest image made of
// tiles. Sources: tiled reveals in broadcast graphics; HyperFrames `transitions-grid`, `grid-pixelate-wipe`,
// `wordmark-tiles` (named, not copied: those fade or flip; these tiles grow from points and never blend).

import { seg, settle, clamp, canvasOf } from './util.js';
import { NEUTRAL, assetOf, placeholderPage, windowOf, contentOf, windowBack, windowFront, clipWindow, ptScreen } from './asset.js';
import { coverView, paintView, hash01 } from './stage.js';

export default {
  name: 'mosaic-assemble',
  tier: 'T2',
  beats: 2,
  modes: ['tally (a tile per unit)', 'halftone (logos and UI only)', 'plakat', 'exhibit'],
  roles: ['ground', 'panel', 'line', 'dim'],
  from: 'an asset in a window',
  to: 'the next asset in the same window, assembled tile by tile from the region in play',
  interpolates: ['per-tile scale about its centre (landing spring), started by distance from the origin'],
  summary: 'The next asset assembles over the current one as a mosaic of tiles that grow from points, outward from the claim.',
  theory: 'The assembly order cues the place to look (Posner 1980); tiles moving alike read as one surface (Wertheimer 1923).',
  defaults: {
    window: { x: 240, y: 132, w: 1440, h: 810 },
    from: { asset: null, title: 'example.com/a', focus: null },
    to: { asset: null, title: 'example.com/b', focus: null },
    cols: 12,                                  // rows follow, for near-square tiles over the whole window (bar included)
    origin: null,                              // image px of the next asset where the mosaic starts (null: its centre)
    spread: 0.68, pop: 0.32, jitter: 0.05, seed: 3,
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const W = windowOf(P.window.x, P.window.y, P.window.w, P.window.h);
    const R = contentOf(W);
    const A = assetOf(P.from.asset, () => placeholderPage(2000, 1125));
    const B = assetOf(P.to.asset, () => placeholderPage(2000, 1300));
    const vA = coverView(A, R, P.from.focus), vB = coverView(B, R, P.to.focus);
    // both window states drawn once (tools): tiles copy from the next one
    const face = (X, v, title) => {
      const c = canvasOf(1920, 1080), g = c.getContext('2d');
      windowBack(g, W, P); g.save(); clipWindow(g, W); paintView(g, X, v, R); g.restore(); windowFront(g, W, P, { title });
      return c;
    };
    const fA = face(A, vA, P.from.title), fB = face(B, vB, P.to.title);
    const cols = P.cols, tw = W.w / cols, rows = Math.max(1, Math.round(W.h / tw)), th = W.h / rows;
    const [ox, oy] = P.origin ? ptScreen(vB, P.origin[0], P.origin[1]) : [R.x + R.w / 2, R.y + R.h / 2];
    const tiles = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      // whole-pixel edges, so landed neighbours meet without a seam
      const x = Math.round(W.x + c * tw), y = Math.round(W.y + r * th), w = Math.round(W.x + (c + 1) * tw) - x, h = Math.round(W.y + (r + 1) * th) - y;
      tiles.push({ x, y, w, h, d: Math.hypot(x + w / 2 - ox, y + h / 2 - oy) });
    }
    const dmax = Math.max(...tiles.map((t) => t.d));
    tiles.forEach((t, i) => { t.t0 = clamp(P.spread * (t.d / dmax) + P.jitter * (hash01(i, P.seed) - 0.5), 0, P.spread); });
    return { W, fA, fB, tiles };
  },
  rest(side, P, D) { return { s: D.tiles.map(() => (side === 'from' ? 0 : 1)) }; },
  at(p, P, D) { return { s: D.tiles.map((t) => settle(seg(p, t.t0, t.t0 + P.pop), 9)) }; },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    if (S.s.every((s) => s >= 1)) { ctx.drawImage(D.fB, 0, 0); return; }
    ctx.drawImage(D.fA, 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    D.tiles.forEach((t, i) => {
      const s = S.s[i];
      if (s <= 0) return;
      const w = t.w * s, h = t.h * s, x = t.x + (t.w - w) / 2, y = t.y + (t.h - h) / 2;
      ctx.drawImage(D.fB, t.x, t.y, t.w, t.h, x, y, w, h);
    });
    ctx.restore();
  },
  track: (S, P, D) => {
    const n = D.tiles.length, pick = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1];
    return pick.flatMap((i) => { const t = D.tiles[i], s = S.s[i]; return [[t.x + (t.w * (1 - s)) / 2, t.y + (t.h * (1 - s)) / 2]]; });
  },
};
