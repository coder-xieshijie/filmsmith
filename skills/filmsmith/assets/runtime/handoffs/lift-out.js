// lift-out — the ringed cells of a real asset rise in place, grow, and become code: each ring is the edge of a card
// cut from the page; while the card moves its pixels are the asset's (scaled uniformly, never stretched), and on the
// frame it passes `swapAt` × its size (before the bitmap would soften) the value is redrawn in code at the same place
// and height on the cell's own paper; the card then widens to take its label. The asset stays underneath, dimmed.
// With `land` on a cell the card instead flies into the next scene's own place for that value (its rect, its text
// size, font, paper and ink), the ring fading as it lands: the hand-off from an evidence page to its code-drawn
// redraw. With `backdrop: false` the template draws the asset and its window (and dims them) and passes `view`, the
// mapping from image px to film px; the module draws only the cards and rings, as a layer over the template's scene.
// Theory: object constancy across a change of material (Heer & Robertson 2007); a detail view of engineering
// drawing; evidence first, reading second (principle 1). Sources: a reading-app launch film (a table and a formula
// lifted out of a paper page), a clinic-software film (a row lifted out of a schedule).

import { seg, settle, cubicInOut, text, measure, scratch, mix, rgba } from './util.js';
import {
  NEUTRAL, MAX_SCALE, assetOf, placeholderPage, sampleColor, fitView, toScreen, windowOf, contentOf, windowBack,
  windowFront, clipWindow, drawAsset, veil, ring, lerpRect, corners,
} from './asset.js';

// default cells: three rows of the placeholder page (2000 × 1100; rows of 154 px from y = 176)
const phCell = (i, value, label) => {
  const y = 176 + i * 154;
  return { box: [640, y + 8, 340, 138], glyph: [680, y + 46, 200, 62], value, label };
};

// the asset's region drawn into rect r at one uniform scale (fitted, centred): a card never stretches its pixels
const drawUniform = (ctx, A, [sx, sy, sw, sh], r) => {
  const k = Math.min(r.w / sw, r.h / sh), w = sw * k, h = sh * k;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(A.image, sx, sy, sw, sh, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
  ctx.restore();
  return { k, x: r.x + (r.w - w) / 2, y: r.y + (r.h - h) / 2 };
};

export default {
  name: 'lift-out',
  tier: 'T1',
  beats: 2,
  modes: ['blueprint', 'tally', 'phosphor', 'exhibit (at the claim, at most twice)'],
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'paper', 'onPaper'],
  from: 'a real asset in its window with regions ringed in the accent (cells of an official table)',
  to: 'the same asset dimmed, the ringed regions lifted above it as cards with the values redrawn in code; or, with `land`, those values in their place in the next scene',
  interpolates: ['card rect (cell → card or landing place, staggered)', 'bitmap → code text on one frame', 'card width (label area)', 'paper, ink, text size and ring (landing)', 'asset veil'],
  summary: 'The ringed cells of a real asset rise in place and grow; their numbers are redrawn in code; the asset dims beneath (or the numbers land in the next scene).',
  theory: 'One object changes material, not identity (object constancy, Heer & Robertson 2007); the detail view of engineering drawing; the redraw keeps the number sharp past the source resolution (principle 2).',
  defaults: {
    asset: null,                               // { image, crop: [x, y, w, h] } in image px; null draws a placeholder page
    title: 'example.com/report',               // the window's title: the asset's source
    window: { x: 210, y: null, w: 1500 },      // content width; height follows the crop; y null centres the window
    view: null,                                // { a, bx, by }: film px = a · image px + b, when the template places the asset
    backdrop: true,                            // false: the template draws asset, window and veil; the module draws the cards
    cells: [phCell(0, '48.0', 'First benchmark'), phCell(1, '71.5', 'Second benchmark'), phCell(3, '33.2', 'Third benchmark')],
    // a cell may carry `land: { x, y, w, h, cx, baseline, size }` (film px): the card's rect, the value's centre and
    // baseline, and its font size in the next scene; such a cell does not widen and needs no label
    card: { x: null, h: 132, gap: 20, rise: 40, pad: 28, labelSize: 34, margin: 64 },
    land: { font: null, paper: null, paperAlpha: 0, ink: null, ring: false, swapAt: 0.12, turn: [0.5, 1] },   // landing look (null: unchanged); turn: the part of the flight where paper, ink and ring change
    swapAt: 1.2,                               // card scale (× its cell) at which the bitmap becomes code; capped by MAX_SCALE
    dim: 0.55,                                 // veil over the asset once the cards are up (0 none, 1 ground)
    ringPad: 6,
    ringStyle: { width: 3, radius: 10, halo: null, haloWidth: 9, glow: 0 },   // halo: a colour under the ring (holds on white)
    stagger: 0.08,                             // p between the cells' lifts
    font: { family: 'sans-serif', weight: 700 },
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL, paper: null, onPaper: '#111111' },   // paper null: sampled from each cell
  },
  prepare(P) {
    const A = assetOf(P.asset, () => placeholderPage(2000, 1100));
    const [, , cw, ch] = A.crop;
    const contentH = (P.window.w * ch) / cw;
    const W = windowOf(P.window.x, P.window.y ?? Math.round((1080 - contentH - 54) / 2), P.window.w, contentH);
    const v = P.view || fitView(A.crop, contentOf(W));
    const g = scratch();
    const ascOf = (f) => measure(g, '0123456789', { ...f, size: 100 }).actualBoundingBoxAscent / 100;
    const asc = ascOf(P.font), ascL = P.land.font ? ascOf(P.land.font) : asc;
    const C = P.card;
    const cells = P.cells.map((c) => {
      const r0 = toScreen(v, c.box);
      const k = C.h / r0.h;
      const [bx, by, bw, bh] = c.box, [gx, gy, gw, gh] = c.glyph;
      return {
        ...c, r0, k, zoneW: c.land ? r0.w : r0.w * k,
        rel: { x: (gx + gw / 2 - bx) / bw, base: (gy + gh - by) / bh, h: gh / bh },
        labelW: c.land || !c.label ? 0 : measure(g, c.label, { ...P.font, weight: 500, size: C.labelSize }).width,
        paper: P.colors.paper || sampleColor(A.image, bx + bw * 0.08, by + bh * 0.2),
      };
    });
    const free = cells.filter((c) => !c.land);
    const zoneW = Math.max(0, ...free.map((c) => c.zoneW));
    const cardW = zoneW + C.pad + Math.max(0, ...free.map((c) => c.labelW)) + C.pad;
    let x = C.x ?? Math.max(...cells.map((c) => c.r0.x + c.r0.w)) + 40;
    x = Math.min(x, 1920 - C.margin - cardW);
    // targets: each card rises from its row; cards keep `gap` apart and stay inside the frame
    const order = free.map((c) => cells.indexOf(c)).sort((a, b) => cells[a].r0.y - cells[b].r0.y);
    let prev = -Infinity;
    for (const i of order) {
      const c = cells[i];
      const y = Math.max(c.r0.y + c.r0.h / 2 - C.h / 2 - C.rise, prev + C.gap, C.margin);
      c.r1 = { x, y, w: c.zoneW, h: C.h };
      prev = y + C.h;
    }
    const over = prev - (1080 - C.margin);
    if (over > 0) for (const c of free) c.r1.y -= over;
    for (const c of cells) if (c.land) c.r1 = { x: c.land.x, y: c.land.y, w: c.land.w, h: c.land.h };
    const swap = Math.min(P.swapAt, MAX_SCALE / v.a);
    return { A, W, v, cells, cardW, zoneW, asc, ascL, swap };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const n = D.cells.length, st = P.stagger;
    return {
      dim: P.dim * cubicInOut(seg(p, 0, 0.3)),
      lift: D.cells.map((c, i) => settle(seg(p, 0.04 + st * i, 0.5 + st * i), 8)),
      widen: D.cells.map((c, i) => (c.land ? 0 : settle(seg(p, 0.98 - 0.26 - st * 0.75 * (n - 1 - i), 0.98 - st * 0.75 * (n - 1 - i)), 9))),
    };
  },
  paint(ctx, S, P, D) {
    const C = P.colors, W = D.W, content = contentOf(W), RS = P.ringStyle;
    if (P.backdrop !== false) {
      if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
      windowBack(ctx, W, P);
      ctx.save(); clipWindow(ctx, W); drawAsset(ctx, D.A, D.v, content); veil(ctx, content, P, S.dim); ctx.restore();
      windowFront(ctx, W, P, { title: P.title });
    }
    const L = P.land;
    D.cells.forEach((c, i) => {
      const u = S.lift[i], wd = S.widen[i];
      const r = lerpRect(c.r0, c.r1, u);
      const card = { x: r.x, y: r.y, w: r.w + wd * (D.cardW - c.zoneW), h: r.h };
      // landing: past `land.swapAt` of the lift the value is code and moves to its place in the next scene
      const swapped = c.land ? u >= L.swapAt : r.h / c.r0.h >= D.swap;
      const w = c.land ? (u <= L.swapAt ? 0 : (u - L.swapAt) / (1 - L.swapAt)) : 0;
      // the card keeps the asset's paper and ink while it is over the asset, then turns to the next scene's look
      const tw = c.land ? cubicInOut(seg(w, ...(L.turn || [0, 1]))) : 0;
      const paper = L.paper ? mix(c.paper, L.paper, tw) : c.paper;
      const alpha = c.land ? 1 + (L.paperAlpha - 1) * tw : 1;
      ctx.save();
      ctx.beginPath(); ctx.rect(card.x, card.y, card.w, card.h); ctx.clip();
      if (alpha > 0) { ctx.fillStyle = rgba(paper, alpha); ctx.fillRect(card.x, card.y, card.w, card.h); }
      if (!swapped) drawUniform(ctx, D.A, c.box, r);
      else {
        // where the printed value sits in the card (uniform scale, as the bitmap), then toward its landing place
        const k = Math.min(r.w / c.box[2], r.h / c.box[3]), ox = r.x + (r.w - c.box[2] * k) / 2, oy = r.y + (r.h - c.box[3] * k) / 2;
        let cx = ox + c.rel.x * c.box[2] * k, base = oy + c.rel.base * c.box[3] * k, size = (c.rel.h * c.box[3] * k) / (c.land ? D.ascL : D.asc);
        if (c.land) { cx += (c.land.cx - cx) * w; base += (c.land.baseline - base) * w; size += (c.land.size - size) * w; }
        const f = { ...(c.land && L.font ? L.font : P.font), size };
        const ink = c.land && L.ink ? mix(C.onPaper, L.ink, tw) : C.onPaper;
        if (c.land) ctx.restore(), ctx.save();       // a landing value may outgrow the card (its next-scene place)
        text(ctx, c.value, cx, base, f, { color: ink, align: 'center' });
      }
      if (wd > 0) {
        const ls = P.card.labelSize;
        text(ctx, c.label, c.r1.x + D.zoneW + P.card.pad, r.y + r.h / 2 + ls * 0.36, { ...P.font, weight: 500, size: ls }, { color: C.onPaper });
      }
      ctx.restore();
      const ringA = c.land && !L.ring ? 1 - tw : 1;
      if (ringA > 0) {
        ctx.save();
        ctx.globalAlpha *= ringA;
        if (RS.halo) ring(ctx, card, P, { pad: P.ringPad, radius: RS.radius, width: RS.haloWidth, color: RS.halo });
        if (RS.glow) { ctx.shadowColor = rgba(C.accent, 0.6); ctx.shadowBlur = RS.glow; }
        ring(ctx, card, P, { pad: P.ringPad, radius: RS.radius, width: RS.width });
        ctx.restore();
      }
    });
  },
  track: (S, P, D) => D.cells.flatMap((c, i) => corners(lerpRect(c.r0, c.r1, S.lift[i]))),
};
