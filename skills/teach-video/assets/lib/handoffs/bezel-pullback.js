// bezel-pullback — the asset first fills the frame; the camera pulls back and, as the asset shrinks, the window that
// carries it grows outward from the asset's own edges: a rim on three sides and the title bar naming the source on
// top thicken from nothing to their full size while the corners round. The content is seen before its frame:
// evidence first, provenance second. One zoom about the point the two views share (log scale, ease in-out), so the
// move is straight. Theory: a reverse reveal (detail before the establishing view); the frame as a label of origin.
// Sources: a phone-app launch film (a full-frame lock screen shrinks while the phone's bezel grows round it) and a
// catalogue "device dive" component, reversed.

import { cubicInOut, rrect } from './util.js';
import {
  NEUTRAL, BAR, assetOf, placeholderPage, fitView, toScreen, windowBack, windowFront, drawAsset, zoomBetween, coverRect,
  corners,
} from './asset.js';

export default {
  name: 'bezel-pullback',
  tier: 'T1',
  beats: 1.25,
  modes: ['every mode with real assets (an asset\'s first appearance)', 'phosphor'],
  roles: ['ground', 'panel', 'line', 'dim'],
  from: 'a real asset filling the frame (covered to 16:9)',
  to: 'the whole asset inside a window whose title bar names its source',
  interpolates: ['camera scale (log)', 'fixed point shared by both views', 'frame growth (rim, title bar, corner radius)'],
  summary: 'The asset fills the frame first; as the camera pulls back, its window grows outward from the asset\'s edges, titled with the source.',
  theory: 'Content before container: the viewer reads the evidence, then learns where it is from; a single zoom about a shared point reads as one camera move (Heer & Robertson 2007).',
  defaults: {
    asset: null,
    title: 'example.com',
    window: { cx: 960, cy: 540, w: 1440 },    // the landed window: centre and content width
    focus: null,                               // image px point the full-frame view is centred on; null: crop centre
    rim: 10,                                   // landed frame width on the sides and bottom, px (the bar is BAR)
    radius: 14,
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const A = assetOf(P.asset, () => placeholderPage(2000, 1000));
    const [, , cw, ch] = A.crop;
    const w = P.window.w, h = (w * ch) / cw;
    // the landed content rect: the whole window (rim + bar + content) centred on window.cx, cy
    const c1 = { x: P.window.cx - w / 2, y: P.window.cy - (h + BAR + P.rim) / 2 + BAR, w, h };
    const v1 = fitView(A.crop, c1);
    const src = coverRect(A.crop, 1920 / 1080, P.focus);
    const a0 = 1920 / src[2];
    const v0 = { a: a0, bx: -src[0] * a0, by: -src[1] * a0 };
    return { A, v0, v1 };
  },
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: cubicInOut(p) }; },
  // the frame around content rect c at growth g: rim on three sides, the bar on top
  frame(c, g, P) {
    const rim = P.rim * g, bar = BAR * g;
    return { x: c.x - rim, y: c.y - bar, w: c.w + 2 * rim, h: c.h + bar + rim, bar, r: P.radius * g };
  },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const v = zoomBetween(D.v0, D.v1, S.u);
    const c = toScreen(v, D.A.crop);
    const W = this.frame(c, S.u, P);
    if (S.u > 0) windowBack(ctx, W, P);
    ctx.save();
    if (S.u > 0) { rrect(ctx, c.x, c.y, c.w, c.h, Math.max(0, W.r - P.rim * S.u)); ctx.clip(); }
    drawAsset(ctx, D.A, v, c);
    ctx.restore();
    if (S.u > 0) windowFront(ctx, W, P, { title: P.title });
  },
  track(S, P, D) { return corners(this.frame(toScreen(zoomBetween(D.v0, D.v1, S.u), D.A.crop), S.u, P)); },
};
