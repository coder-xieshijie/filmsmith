// value-carry — a number leaves one asset and lands as the same number in another: the ringed cell lifts off the first
// asset (its pixels first, then the value redrawn in code once it has grown past `swapAt`), waits while the camera
// trucks one screen to the second asset, and drops onto that asset's own printing of the number: on landing the code
// copy matches its position, height, paper and ink, then leaves the asset's glyphs under the ring. Theory: the shared
// element of interface motion; object constancy (Heer & Robertson 2007); a value checked in two official places
// (principle 2). Sources: a finance app's film (an amount rises from a list, rides the pan, lands in the invoice
// table), a shared-element thumbnail-to-hero transition.

import { seg, settle, cubicInOut, text, measure, scratch, mix, canvasOf } from './util.js';
import {
  NEUTRAL, BAR, MAX_SCALE, assetOf, placeholderPage, sampleColor, fitView, toScreen, windowOf, contentOf, windowBack,
  windowFront, clipWindow, drawAsset, drawRegion, shiftView, ring, lerpRect, corners,
} from './asset.js';

// the darkest pixel of an image region (the ink a value is printed in), as #rrggbb
const darkest = (image, [x, y, w, h]) => {
  const c = canvasOf(Math.ceil(w), Math.ceil(h)), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(image, x, y, w, h, 0, 0, Math.ceil(w), Math.ceil(h));
  const d = g.getImageData(0, 0, c.width, c.height).data;
  let best = 1e9, out = [0, 0, 0];
  for (let i = 0; i < d.length; i += 4) { const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; if (l < best) { best = l; out = [d[i], d[i + 1], d[i + 2]]; } }
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
};

export default {
  name: 'value-carry',
  tier: 'T1',
  beats: 2,
  modes: ['ink', 'tally', 'phosphor'],
  roles: ['ground', 'panel', 'line', 'dim', 'accent', 'paper', 'onPaper'],
  from: 'asset 1 in its window, the cell holding the value ringed',
  to: 'asset 2 in its window one screen to the right, the same value ringed where asset 2 prints it',
  interpolates: ['chip rect (cell → carry → target)', 'bitmap → code on one frame', 'camera x (one screen)', 'chip paper and ink (asset 1 → asset 2)'],
  summary: 'A value lifts off one asset, rides a one-screen pan, and lands on the same value printed in a second asset.',
  theory: 'A shared element carries the eye across a change of place (object constancy, Heer & Robertson 2007); the same number found in two official sources is the claim\'s proof (principle 2).',
  defaults: {
    from: { asset: null, title: 'example.com/table', window: { w: 1400 }, box: [640, 340, 340, 138], glyph: [680, 378, 200, 62], value: '71.5', weight: null },
    to: { asset: null, title: 'example.com/chart', window: { w: 1300 }, glyph: [1112, 532, 80, 30], ring: [1100, 520, 140, 54], weight: null },   // ring: the label it lands in; weight: its printing's
    spacing: 1920,                             // world px between the two windows' centres (one screen: a truck)
    cy: 540,
    carry: { cx: 960, cy: 150, h: 150 },       // where the chip waits during the pan (film px) and its height there
    swapAt: 1.2,
    ringPad: 6,
    font: { family: 'sans-serif', weight: 700 },
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL, paper: null, onPaper: null, paper2: null, onPaper2: null },   // null: sampled from the assets
  },
  prepare(P) {
    const A1 = assetOf(P.from.asset, () => placeholderPage(2000, 1100));
    const A2 = assetOf(P.to.asset, () => placeholderPage(2000, 1200));
    const mk = (A, w, cx) => { const h = (w * A.crop[3]) / A.crop[2]; return windowOf(cx - w / 2, Math.round(P.cy - (h + BAR) / 2), w, h); };
    const W1 = mk(A1, P.from.window.w, 960), W2 = mk(A2, P.to.window.w, 960 + P.spacing);
    const v1 = fitView(A1.crop, contentOf(W1)), v2 = fitView(A2.crop, contentOf(W2));
    const chip0 = toScreen(v1, P.from.box), g0 = toScreen(v1, P.from.glyph);
    const sh = (r) => ({ ...r, x: r.x - P.spacing });
    const [tx, ty, tw, th] = P.to.glyph;
    const chip2 = sh(toScreen(v2, [tx - 3, ty - 3, tw + 6, th + 6])), g2 = sh(toScreen(v2, P.to.glyph)), ring2 = sh(toScreen(v2, P.to.ring));
    const k = P.carry.h / chip0.h;
    const chipM = { w: chip0.w * k, h: chip0.h * k, x: P.carry.cx - (chip0.w * k) / 2, y: P.carry.cy - (chip0.h * k) / 2 };
    const gM = { x: chipM.x + (g0.x - chip0.x) * k, y: chipM.y + (g0.y - chip0.y) * k, w: g0.w * k, h: g0.h * k };
    const [bx, by, bw, bh] = P.from.box, [rx, ry, rw, rh] = P.to.ring;
    const C = P.colors;
    return {
      A1, A2, W1, W2, v1, v2, chip0, chipM, chip2, ring2, g0, gM, g2,
      asc: measure(scratch(), '0123456789', { ...P.font, size: 100 }).actualBoundingBoxAscent / 100,
      swap: Math.min(P.swapAt, MAX_SCALE / v1.a),
      paper1: C.paper || sampleColor(A1.image, bx + bw * 0.08, by + bh * 0.2),
      paper2: C.paper2 || sampleColor(A2.image, rx + 2, ry + 2),
      ink1: C.onPaper || darkest(A1.image, P.from.glyph),
      ink2: C.onPaper2 || darkest(A2.image, P.to.glyph),
    };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    return { lift: settle(seg(p, 0, 0.3), 8), pan: cubicInOut(seg(p, 0.18, 0.78)), land: cubicInOut(seg(p, 0.64, 0.92)), chip: p < 0.94 ? 1 : 0 };
  },
  paint(ctx, S, P, D) {
    const C = P.colors, cam = S.pan * P.spacing;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    for (const [A, W0, v0, title] of [[D.A1, D.W1, D.v1, P.from.title], [D.A2, D.W2, D.v2, P.to.title]]) {
      const W = { ...W0, x: W0.x - cam };
      if (W.x > 1920 || W.x + W.w < 0) continue;
      windowBack(ctx, W, P);
      ctx.save(); clipWindow(ctx, W); drawAsset(ctx, A, shiftView(v0, -cam, 0), contentOf(W)); ctx.restore();
      windowFront(ctx, W, P, { title });
    }
    const carried = lerpRect(D.chip0, D.chipM, S.lift), chip = lerpRect(carried, D.chip2, S.land);
    if (S.chip) {
      const g = lerpRect(lerpRect(D.g0, D.gM, S.lift), D.g2, S.land);
      const q = chip.h / D.chip0.h;
      if (q < D.swap && S.land === 0) drawRegion(ctx, D.A1, P.from.box, chip);
      else {
        ctx.fillStyle = mix(D.paper1, D.paper2, S.land);
        ctx.fillRect(chip.x, chip.y, chip.w, chip.h);
        // weight too moves from asset 1's printing to asset 2's (a variable face takes any weight)
        const w0 = P.from.weight ?? P.font.weight, w1 = P.to.weight ?? P.font.weight;
        text(ctx, P.from.value, g.x + g.w / 2, g.y + g.h, { ...P.font, weight: Math.round(w0 + (w1 - w0) * S.land), size: g.h / D.asc }, { color: mix(D.ink1, D.ink2, S.land), align: 'center' });
      }
    }
    // the ring is the chip's edge while it travels; landing, it opens to the label the value lands in
    const grow = (r, d) => ({ x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d });
    ring(ctx, lerpRect(grow(carried, P.ringPad), grow(D.ring2, 8), S.land), P, { pad: 0, radius: 10, width: 3 });
  },
  track: (S, P, D) => {
    const chip = lerpRect(lerpRect(D.chip0, D.chipM, S.lift), D.chip2, S.land), cam = S.pan * P.spacing;
    return [...corners(chip), [D.W1.x - cam, D.W1.y], [D.W2.x - cam, D.W2.y]];
  },
};
