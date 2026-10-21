// camera-truck — several assets live side by side on one plane; the camera trucks about one screen width from one to
// the next (ease in-out, ~15 frames) with speed-gated motion blur (canvas.js subframes, on only while an edge moves
// more than 1 px per frame), and the assets not in focus recede under a veil that follows their distance from the
// camera. Theory: one world coordinate for all evidence keeps the spatial relation readable as a narrative relation
// (cognitive maps, Tversky 1993); motion streaks record real speed (Geisler 1999). Sources: a design-review tool's launch
// film (one horizontal pan across a comment card, a site and a board, 12 frames), a finance app's film (a camera on
// one tilted surface).

import { cubicInOut, lerp, clamp } from './util.js';
import {
  NEUTRAL, BAR, assetOf, placeholderPage, fitView, windowOf, contentOf, windowBack, windowFront, clipWindow, drawAsset,
  shiftView, veil,
} from './asset.js';

export default {
  name: 'camera-truck',
  tier: 'T1',
  beats: 1,
  modes: ['blueprint', 'plakat', 'thread'],
  roles: ['ground', 'panel', 'line', 'dim'],
  from: 'one asset of a row of assets in focus (the row laid out on one plane)',
  to: 'the next asset of the row in focus',
  interpolates: ['camera x', 'veil per asset (distance from the camera)'],
  summary: 'Assets lie side by side on one plane; the camera trucks about a screen to the next, blurred only while fast.',
  theory: 'All evidence in one world coordinate, so place reads as relation (Tversky 1993); motion blur records speed (Geisler 1999) and is off once settled.',
  defaults: {
    items: [
      { asset: null, title: 'example.com/a', w: 1400 },
      { asset: null, title: 'example.com/b', w: 1400 },
      { asset: null, title: 'example.com/c', w: 1400 },
    ],
    gap: 220,                                  // world px between neighbouring windows
    from: 0, to: 1,                            // indices of the items in focus at either end
    cy: 540,
    veil: 0.55,                                // how far an asset one step away recedes
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    let x = 0;
    const items = P.items.map((it, i) => {
      const A = assetOf(it.asset, () => placeholderPage(2000, 900 + 150 * (i % 3)));
      const h = (it.w * A.crop[3]) / A.crop[2];
      const W = windowOf(x, Math.round(P.cy - (h + BAR) / 2), it.w, h);
      x += it.w + P.gap;
      return { A, W, v: fitView(A.crop, contentOf(W)), title: it.title, cx: W.x + W.w / 2, step: it.w + P.gap };
    });
    const camAt = (i) => items[i].cx - 960;   // camera x that centres item i
    return { items, c0: camAt(P.from), c1: camAt(P.to), unit: Math.abs(camAt(P.to) - camAt(P.from)) || 1 };
  },
  rest(side, P, D) { return { cam: side === 'from' ? D.c0 : D.c1 }; },
  at(p, P, D) { return { cam: lerp(D.c0, D.c1, cubicInOut(p)) }; },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    for (const it of D.items) {
      const W = { ...it.W, x: it.W.x - S.cam };
      if (W.x > 1920 || W.x + W.w < 0) continue;
      const d = clamp(Math.abs(it.cx - S.cam - 960) / D.unit);
      windowBack(ctx, W, P);
      ctx.save(); clipWindow(ctx, W); drawAsset(ctx, it.A, shiftView(it.v, -S.cam, 0), contentOf(W)); ctx.restore();
      windowFront(ctx, W, P, { title: it.title });
      ctx.save(); clipWindow(ctx, { ...W, x: W.x - 2, y: W.y - 2, w: W.w + 4, h: W.h + 4 }); veil(ctx, { x: W.x - 2, y: W.y - 2, w: W.w + 4, h: W.h + 4 }, P, P.veil * d); ctx.restore();
    }
  },
  track: (S, P, D) => D.items.map((it) => [it.W.x - S.cam, it.W.y]),
};
