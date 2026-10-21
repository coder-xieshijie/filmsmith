// grid-hop — from one asset filling the frame, the camera pulls back until it is one tile of a contact grid of its
// siblings (a reel's films, a run's screens), a ring hops across the grid to the next tile, and the camera dives into
// that tile until it fills the frame. Three stages, one at a time: pull back, hop, dive. Each zoom is one move about
// the point the two views share (log scale, ease in-out); tiles away from the ring step back under a veil while the
// grid is open; labels under the tiles stay at reading size whatever the zoom (they belong to the index, not the
// pictures). Every tile is cover-cropped to 16:9 and never shown above its source resolution at full frame.
// Theory: overview first, zoom and filter, details on demand (Shneiderman 1996); the photo library's pinch from a
// picture to the grid of its neighbours keeps the item's place in the collection (object constancy, Heer & Robertson
// 2007). Sources: zoom-out-to-grid of photo libraries and keynote demos; HyperFrames `parallax-unzoom` / `parallax-zoom`
// (named, not copied: no parallax here, one plane).

import { seg, cubicInOut, bez } from './util.js';

const dive = bez(0.55, 0, 0.08, 1);   // in on a log scale: a long, soft arrival, landed at p = 0.97 (a cubic in-out to p = 1 still moved 4–7 px in its last frame)
import { NEUTRAL, assetOf, view, zoomBetween, ring, veil, lerpRect } from './asset.js';
import { coverView, paintView, placeholderFrame, caption, rectCorners } from './stage.js';

export default {
  name: 'grid-hop',
  tier: 'T1',
  beats: 3,
  modes: ['exhibit (zoom out to the table of prints)', 'tally (one tile = one item)', 'pulse', 'every mode with a set of screens'],
  roles: ['ground', 'line', 'ink', 'dim', 'accent'],
  from: 'one asset (tile) filling the frame',
  to: 'another tile of the same grid filling the frame',
  interpolates: ['camera zoom out (log, about the shared point)', 'ring rect (tile to tile)', 'camera zoom in', 'veil of the other tiles'],
  summary: 'The frame pulls back into a grid of its siblings, a ring hops to the next tile, and the camera dives into it.',
  theory: 'Overview, then detail (Shneiderman 1996); a picture keeps its place in the collection while the camera leaves and returns (Heer & Robertson 2007).',
  defaults: {
    tiles: Array.from({ length: 10 }, (_, i) => ({ asset: null, label: `item ${String(i + 1).padStart(2, '0')}` })),
    cols: 5,
    from: 0, to: 6,
    gutter: { x: 200, y: 380 },                // world px between tiles (a tile is 1920 × 1080 world px)
    margin: 140,                               // film px around the grid when open
    veil: 0.5,
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const n = P.tiles.length, cols = P.cols, rows = Math.ceil(n / cols);
    const tiles = P.tiles.map((t, i) => {
      const A = assetOf(t.asset, () => placeholderFrame(i));
      const c = i % cols, r = Math.floor(i / cols);
      return { A, label: t.label || '', x: c * (1920 + P.gutter.x), y: r * (1080 + P.gutter.y) };
    });
    const gw = cols * 1920 + (cols - 1) * P.gutter.x, gh = rows * 1080 + (rows - 1) * P.gutter.y + P.gutter.y * 0.5;
    const zg = Math.min((1920 - 2 * P.margin) / gw, (1080 - 2 * P.margin) / gh);
    const vGrid = view(zg, 960 - (gw * zg) / 2, 540 - (gh * zg) / 2 + P.gutter.y * 0.25 * zg);
    const vFull = (i) => view(1, -tiles[i].x, -tiles[i].y);
    return { tiles, vGrid, v0: vFull(P.from), v1: vFull(P.to) };
  },
  rest(side) { return side === 'from' ? { out: 0, hop: 0, dive: 0 } : { out: 1, hop: 1, dive: 1 }; },
  at(p) { return { out: cubicInOut(seg(p, 0, 0.36)), hop: cubicInOut(seg(p, 0.35, 0.55)), dive: dive(seg(p, 0.55, 0.97)) }; },
  viewOf(S, D) { return S.dive > 0 ? zoomBetween(D.vGrid, D.v1, S.dive) : zoomBetween(D.v0, D.vGrid, S.out); },
  paint(ctx, S, P, D) {
    const C = P.colors, v = this.viewOf(S, D);
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const open = S.dive > 0 ? 1 - S.dive : S.out;          // how far the grid is open (0 at full frame)
    const rectOf = (t) => ({ x: v.bx + t.x * v.a, y: v.by + t.y * v.a, w: 1920 * v.a, h: 1080 * v.a });
    D.tiles.forEach((t, i) => {
      const r = rectOf(t);
      if (r.x > 1920 || r.y > 1080 || r.x + r.w < 0 || r.y + r.h + 60 < 0) return;
      paintView(ctx, t.A, coverView(t.A, r), r);
      // in play: the from tile until the hop, the to tile after it
      const play = i === P.from ? 1 - S.hop : i === P.to ? S.hop : 0;
      veil(ctx, r, P, P.veil * open * (1 - play));
      if (t.label && r.w < 900) caption(ctx, t.label, r.x, r.y + r.h + 36, P, { size: 25, color: play > 0.5 ? C.ink : C.dim });
    });
    const ra = rectOf(D.tiles[P.from]), rb = rectOf(D.tiles[P.to]);
    const rr = lerpRect(ra, rb, S.hop);
    if (rr.w < 1900) ring(ctx, rr, P, { pad: 10, radius: 8, width: 3 });
  },
  track(S, P, D) {
    // what is on screen: the tile the camera leaves (pulling back), the ring (hop), the tile it enters (diving)
    const v = this.viewOf(S, D);
    const rectOf = (t) => ({ x: v.bx + t.x * v.a, y: v.by + t.y * v.a, w: 1920 * v.a, h: 1080 * v.a });
    const a = rectOf(D.tiles[P.from]), b = rectOf(D.tiles[P.to]);
    return S.dive > 0 ? rectCorners(b) : [...rectCorners(a), ...rectCorners(lerpRect(a, b, S.hop))];
  },
};
