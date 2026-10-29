// viewport-push — the window holds still; the asset inside it pushes in and pans to the region to read, one zoom
// about the point both views share (log scale, ease in-out, ~16 frames). The zoom is capped by the asset's own
// resolution: no output px may map to less than 0.75 source px (asset.js MAX_SCALE), so the push never softens the
// evidence; the cap is computed in prepare (D.cap) and the landed zoom is D.zoom. A ring draws round the region as it
// lands. Theory: a fixed frame keeps the viewer in the same place (common region, Palmer 1992) while the camera
// moves; the push makes small source text reach the 25 px floor (principle 1). Sources: a fitness-app film (in-device
// zoom, 16 frames), a paper-figure tool's film (in-window zoom, 15–17 frames ease in-out), a reading-app film.

import { seg, cubicInOut } from './util.js';
import {
  NEUTRAL, MAX_SCALE, assetOf, placeholderPage, fitView, toScreen, windowOf, contentOf, windowBack, windowFront,
  clipWindow, drawAsset, zoomBetween, view, ring, corners,
} from './asset.js';

export default {
  name: 'viewport-push',
  tier: 'T0',
  beats: 4 / 3,                               // 20 frames at 120 BPM: the push takes the first 16
  modes: ['every mode with real assets', 'phosphor'],
  roles: ['ground', 'panel', 'line', 'dim', 'accent'],
  from: 'a real asset shown whole in a still window',
  to: 'the same window, the asset pushed in on one region (zoom capped by source resolution), the region ringed',
  interpolates: ['zoom (log, capped)', 'fixed point shared by both views', 'ring draw-on'],
  summary: 'The window stays still; the asset inside pushes in on the region to read, never past its source resolution.',
  theory: 'A still frame holds the viewer\'s place while the camera moves inside it (common region, Palmer 1992); the push brings source text to the 25 px floor without enlarging it past 0.75 source px per output px (principles 1, 2).',
  defaults: {
    asset: null,
    title: 'example.com',
    window: { x: 310, y: null, w: 1300 },     // content width; height follows the crop
    region: [700, 330, 600, 300],             // image px: what to read
    mark: null,                               // image px box ringed on landing (null: the region)
    ring: true,
    readout: true,                            // the title bar's right side shows the live zoom and its cap
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const A = assetOf(P.asset, () => placeholderPage(2000, 1200));
    const [cx, cy, cw, ch] = A.crop;
    const contentH = (P.window.w * ch) / cw;
    const W = windowOf(P.window.x, P.window.y ?? Math.round((1080 - contentH - 54) / 2), P.window.w, contentH);
    const R = contentOf(W);
    const v0 = fitView(A.crop, R);
    const cap = MAX_SCALE / v0.a;                                  // the zoom at which 1 output px = 0.75 source px
    const [rx, ry, rw, rh] = P.region;
    const zoom = Math.max(1, Math.min(cap, R.w / (v0.a * rw), R.h / (v0.a * rh)));
    const a = v0.a * zoom;
    // centre the region, then keep the view inside the crop (no empty margin)
    let bx = R.x + R.w / 2 - a * (rx + rw / 2), by = R.y + R.h / 2 - a * (ry + rh / 2);
    bx = Math.min(R.x - a * cx, Math.max(R.x + R.w - a * (cx + cw), bx));
    by = Math.min(R.y - a * cy, Math.max(R.y + R.h - a * (cy + ch), by));
    const v1 = view(a, bx, by);
    if (typeof console !== 'undefined') console.log(`viewport-push: fit ${v0.a.toFixed(4)} px/src px, cap ${cap.toFixed(2)}×, landed zoom ${zoom.toFixed(2)}× (${(1 / a).toFixed(2)} src px per output px)`);
    return { A, W, R, v0, v1, cap, zoom };
  },
  rest(side) { return side === 'from' ? { u: 0, ring: 0 } : { u: 1, ring: 1 }; },
  at(p) { return { u: cubicInOut(seg(p, 0, 0.8)), ring: cubicInOut(seg(p, 0.72, 1)) }; },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const v = zoomBetween(D.v0, D.v1, S.u);
    windowBack(ctx, D.W, P);
    ctx.save(); clipWindow(ctx, D.W); drawAsset(ctx, D.A, v, D.R);
    if (P.ring && S.ring > 0) { ctx.beginPath(); ctx.rect(D.R.x, D.R.y, D.R.w, D.R.h); ctx.clip(); ring(ctx, toScreen(v, P.mark || P.region), P, { pad: 10, radius: 12, width: 3, draw: S.ring }); }
    ctx.restore();
    const z = v.a / D.v0.a;
    windowFront(ctx, D.W, P, { title: P.title, right: P.readout ? `${z.toFixed(2)}×  cap ${D.cap.toFixed(2)}×` : '' });
  },
  track: (S, P, D) => corners(toScreen(zoomBetween(D.v0, D.v1, S.u), P.region)),
};
