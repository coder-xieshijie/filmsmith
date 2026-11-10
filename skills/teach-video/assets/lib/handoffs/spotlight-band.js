// spotlight-band — the asset is veiled to about half its brightness except one hard-edged horizontal band, which stays
// as captured; the band moves (position and height, ease in-out, 12 frames) to the next region to read, an accent
// tick at its left end. The asset never moves; the light does. Theory: selective attention follows the one region
// left lit (Posner 1980, a spotlight); hard edges keep the lit region exact (no feathered halo over the data).
// Sources: a fitness-app film (a dimmed chart page, a lit band moving between four charts), ring-and-dim evidence
// pages.

import { cubicInOut, lerp } from './util.js';
import {
  NEUTRAL, assetOf, placeholderPage, fitView, windowOf, contentOf, windowBack, windowFront, clipWindow, drawAsset, veil,
} from './asset.js';

export default {
  name: 'spotlight-band',
  tier: 'T0',
  beats: 0.8,
  modes: ['every mode with real assets', 'tally'],
  roles: ['ground', 'panel', 'line', 'dim', 'accent'],
  from: 'a real asset in its window, veiled except a lit band on one region',
  to: 'the same, the lit band on the next region',
  interpolates: ['band top', 'band height'],
  summary: 'The asset dims to half; one hard-edged band stays lit and moves to the next region to read.',
  theory: 'Attention follows the one lit region (Posner 1980); the asset stays still so its layout is learned once; hard edges keep the lit data exact.',
  defaults: {
    asset: null,
    title: 'example.com',
    window: { x: 160, y: null, w: 1600 },
    from: { band: [0, 176, 0, 154] },          // image px [_, y, _, h]: only y and h are used (the band spans the width)
    to: { band: [0, 638, 0, 154] },
    veil: 0.5,                                 // how far the rest recedes (ground over the asset)
    tick: 6,                                   // accent tick at the band's left end, px wide (0: none)
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const A = assetOf(P.asset, () => placeholderPage(2000, 1100));
    const contentH = (P.window.w * A.crop[3]) / A.crop[2];
    const W = windowOf(P.window.x, P.window.y ?? Math.round((1080 - contentH - 54) / 2), P.window.w, contentH);
    const R = contentOf(W);
    return { A, W, R, v: fitView(A.crop, R) };
  },
  rest(side, P) { const b = (side === 'from' ? P.from : P.to).band; return { y: b[1], h: b[3] }; },
  at(p, P) {
    const u = cubicInOut(p);
    return { y: lerp(P.from.band[1], P.to.band[1], u), h: lerp(P.from.band[3], P.to.band[3], u) };
  },
  paint(ctx, S, P, D) {
    const C = P.colors, R = D.R;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    windowBack(ctx, D.W, P);
    const top = D.v.by + S.y * D.v.a, bot = top + S.h * D.v.a;
    ctx.save();
    clipWindow(ctx, D.W);
    drawAsset(ctx, D.A, D.v, R);
    veil(ctx, { x: R.x, y: R.y, w: R.w, h: Math.max(0, top - R.y) }, P, P.veil);
    veil(ctx, { x: R.x, y: bot, w: R.w, h: Math.max(0, R.y + R.h - bot) }, P, P.veil);
    if (P.tick > 0) { ctx.fillStyle = C.accent; ctx.fillRect(R.x, top, P.tick, bot - top); }
    ctx.restore();
    windowFront(ctx, D.W, P, { title: P.title });
  },
  track: (S, P, D) => { const top = D.v.by + S.y * D.v.a; return [[D.R.x, top], [D.R.x, top + S.h * D.v.a]]; },
};
