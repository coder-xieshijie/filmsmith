// asset.js — what the asset hand-offs share: a real image (an img, ImageBitmap or canvas) with the crop it may show,
// the mapping from image px to film px, the window that carries it, dimming, rings and the zoom cap.
// Pure helpers; nothing here keeps state between frames. An asset is only cropped, scaled and uniformly dimmed (a
// ground-coloured veil over it); it is never recoloured or retouched. Annotations (rings, bands, lines) are code.

import { rrect, text, rgba, canvasOf, lerp, hexToRgb } from './util.js';

// Sharpness gate (principle 2, draft): every output px must map to at least 0.75 source px, so a push never enlarges
// an asset past 1 / 0.75 = 1.33 output px per source px.
export const MIN_SRC_PER_PX = 0.75;
export const MAX_SCALE = 1 / MIN_SRC_PER_PX;
// The largest zoom over a view that shows the asset at `fitScale` output px per source px.
export const zoomCap = (fitScale) => MAX_SCALE / fitScale;

export const BAR = 54;                 // window title bar, film px
export const NEUTRAL = {               // the neutral sample palette every module defaults to
  ground: '#0D0E10', panel: '#17191D', line: '#30343B', ink: '#ECEDEE', dim: '#8E949C', accent: '#FF6452',
};

// ---------------------------------------------------------------------------------------------------------------
// Assets. `{ image, crop: [x, y, w, h] }` in the image's own px; `crop` defaults to the whole image. Without an image
// a module draws a placeholder (a neutral page of grey rows), so its defaults render a sample for the self-test.

const PH = new Map();                  // placeholder cache: a tool built once, not frame state
export const placeholderPage = (w = 2000, h = 1100) => {
  const key = `page${w}x${h}`;
  if (PH.has(key)) return PH.get(key);
  const c = canvasOf(w, h), g = c.getContext('2d');
  g.fillStyle = '#F3F3F0'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#E3E3DF'; g.fillRect(0, 0, w, h * 0.16);
  const rows = 6, rh = (h * 0.84) / rows, lens = [0.62, 0.48, 0.71, 0.36, 0.55, 0.44];
  for (let i = 0; i < rows; i++) {
    const y = h * 0.16 + i * rh;
    if (i % 2) { g.fillStyle = '#EBEBE7'; g.fillRect(0, y, w, rh); }
    g.fillStyle = '#9A9A96'; g.fillRect(w * 0.06, y + rh * 0.38, w * 0.22, rh * 0.24);
    g.fillStyle = '#2A2A2A'; g.fillRect(w * 0.34, y + rh * 0.3, w * 0.12 * lens[i] * 1.6, rh * 0.4);
    g.fillStyle = '#B5B5B0'; g.fillRect(w * 0.56, y + rh * 0.38, w * 0.38 * lens[(i + 2) % rows], rh * 0.24);
  }
  PH.set(key, c);
  return c;
};
export const placeholderMark = () => {
  if (PH.has('mark')) return PH.get('mark');
  const c = canvasOf(1200, 360), g = c.getContext('2d');
  g.fillStyle = '#E8E8E8';
  for (let i = 0; i < 6; i++) { const h = [120, 220, 300, 260, 180, 110][i]; rrect(g, 40 + i * 52, 180 - h / 2, 30, h, 15); g.fill(); }
  g.fillRect(420, 140, 720, 80);
  PH.set('mark', c);
  return c;
};

export const assetOf = (a, fallback = placeholderPage) => {
  const image = a && a.image ? a.image : fallback();
  return { image, crop: (a && a.crop) || [0, 0, image.width, image.height] };
};

// One pixel of an image as #rrggbb (a cell's own paper, so a code-drawn copy of it matches).
export const sampleColor = (image, x, y) => {
  const c = canvasOf(1, 1), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(image, Math.floor(x), Math.floor(y), 1, 1, 0, 0, 1, 1);
  const d = g.getImageData(0, 0, 1, 1).data;
  return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
};

// ---------------------------------------------------------------------------------------------------------------
// Views: a similarity from image px to film px, screen = a · img + b.

export const view = (a, bx, by) => ({ a, bx, by });
// The view that fits `crop` into the rect r (width-fit; the rect's height should follow the crop's aspect).
export const fitView = (crop, r) => view(r.w / crop[2], r.x - crop[0] * (r.w / crop[2]), r.y - crop[1] * (r.w / crop[2]));
export const toScreen = (v, [x, y, w, h]) => ({ x: v.bx + x * v.a, y: v.by + y * v.a, w: w * v.a, h: h * v.a });
export const ptScreen = (v, x, y) => [v.bx + x * v.a, v.by + y * v.a];
export const shiftView = (v, dx, dy) => view(v.a, v.bx + dx, v.by + dy);
// A zoom about a fixed point: the view between v0 and v1 whose scale moves on a log scale and whose fixed point (the
// image point that keeps its film position) is the one both views share, so the push reads as one straight move.
export const zoomBetween = (v0, v1, u) => {
  if (Math.abs(v0.a - v1.a) < 1e-9) return view(v0.a, lerp(v0.bx, v1.bx, u), lerp(v0.by, v1.by, u));
  const fx = (v1.bx - v0.bx) / (v0.a - v1.a), fy = (v1.by - v0.by) / (v0.a - v1.a);
  const sx = v0.a * fx + v0.bx, sy = v0.a * fy + v0.by;
  const a = v0.a * Math.pow(v1.a / v0.a, u);
  return view(a, sx - a * fx, sy - a * fy);
};

// Draw the asset's crop through a view, clipped to the rect `clip` (and to the crop itself).
export const drawAsset = (ctx, A, v, clip) => {
  const [cx, cy, cw, ch] = A.crop;
  ctx.save();
  ctx.beginPath();
  ctx.rect(clip.x, clip.y, clip.w, clip.h);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(A.image, cx, cy, cw, ch, v.bx + cx * v.a, v.by + cy * v.a, cw * v.a, ch * v.a);
  ctx.restore();
};
// Draw an image-px region of the asset into a film-px rect (a lifted cell, a logo).
export const drawRegion = (ctx, A, [sx, sy, sw, sh], r) => {
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(A.image, sx, sy, sw, sh, r.x, r.y, r.w, r.h);
  ctx.restore();
};

// A uniform veil of the ground colour: the asset recedes without changing its colours.
export const veil = (ctx, r, P, alpha) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.fillStyle = rgba(P.colors.ground, Math.min(1, alpha));
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Windows: a neutral browser window whose title bar names the asset's source. W = { x, y, w, h, bar, r }; the content
// rect is everything under the bar. Drawn in two passes around the content: back (panel), front (bar, border).

export const windowOf = (x, y, w, contentH, bar = BAR, r = 12) => ({ x, y, w, h: contentH + bar, bar, r });
export const contentOf = (W) => ({ x: W.x, y: W.y + W.bar, w: W.w, h: W.h - W.bar });

export const windowBack = (ctx, W, P) => {
  ctx.save();
  rrect(ctx, W.x, W.y, W.w, W.h, W.r);
  ctx.fillStyle = P.colors.panel;
  ctx.fill();
  ctx.restore();
};
// Clip to the window's rounded outline (for its content).
export const clipWindow = (ctx, W) => { rrect(ctx, W.x, W.y, W.w, W.h, W.r); ctx.clip(); };

export const windowFront = (ctx, W, P, { title = '', right = '', titleClip = null, alpha = 1, dots = true, titleX = null } = {}) => {
  const C = P.colors, bar = Math.min(W.bar, W.h);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.save();
  clipWindow(ctx, W);
  ctx.beginPath();
  ctx.rect(W.x, W.y, W.w, bar);              // everything of the bar stays inside the bar (it may be growing)
  ctx.clip();
  ctx.fillStyle = C.panel;
  ctx.fillRect(W.x, W.y, W.w, bar);
  ctx.fillStyle = C.line;
  if (W.h > W.bar) ctx.fillRect(W.x, W.y + bar - 2, W.w, 2);
  const cy = W.y + bar / 2;
  if (dots) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(W.x + 28 + i * 22, cy, 6, 0, Math.PI * 2); ctx.fill(); }
  if (title || right) {
    const tc = titleClip || W;
    ctx.beginPath();
    ctx.rect(tc.x, tc.y, tc.w, Math.min(W.bar, tc.h));
    ctx.clip();
    const f = { ...P.mono, size: 25 };
    if (title) text(ctx, title, titleX ?? W.x + 28 + 3 * 22 + 10, cy + 9, f, { color: C.dim });
    if (right) text(ctx, right, W.x + W.w - 24, cy + 9, f, { color: C.dim, align: 'right' });
  }
  ctx.restore();
  rrect(ctx, W.x + 1, W.y + 1, W.w - 2, W.h - 2, Math.max(0, W.r - 1));
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Rings: a rounded rectangle stroked in the accent, drawn on clockwise from its top-left corner (`draw` 0..1).

export const ring = (ctx, r, P, { pad = 8, radius = 10, width = 3, draw = 1, color } = {}) => {
  if (draw <= 0) return;
  const x = r.x - pad, y = r.y - pad, w = r.w + 2 * pad, h = r.h + 2 * pad;
  ctx.save();
  rrect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = color || P.colors.accent;
  ctx.lineWidth = width;
  if (draw < 1) {
    const rr = Math.max(0, Math.min(radius, w / 2, h / 2));
    const per = 2 * (w + h) - 8 * rr + 2 * Math.PI * rr;
    ctx.setLineDash([per * draw, per]);
  }
  ctx.stroke();
  ctx.restore();
};

// The largest source rect of aspect `aspect` inside `crop`, centred on `focus` (image px) as far as the crop allows.
export const coverRect = (crop, aspect, focus) => {
  const [cx, cy, cw, ch] = crop;
  let w = cw, h = cw / aspect;
  if (h > ch) { h = ch; w = ch * aspect; }
  const [fx, fy] = focus || [cx + cw / 2, cy + ch / 2];
  const x = Math.min(cx + cw - w, Math.max(cx, fx - w / 2)), y = Math.min(cy + ch - h, Math.max(cy, fy - h / 2));
  return [x, y, w, h];
};

export const lerpRect = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u), h: lerp(a.h, b.h, u) });
export const corners = (r) => [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]];

// ---------------------------------------------------------------------------------------------------------------
// Accent against the asset. An annotation must read as code over the asset, not as part of it: the accent differs
// from every colour that fills a real share of the ringed region by ΔE00 ≥ 20 (references/transitions.md, "Real
// assets"). ringContrast returns the smallest ΔE00 between the accent and the colours covering ≥ `share` of the box.

const lab = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, y = 0.2126 * r + 0.7152 * g + 0.0722 * b, z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};
// CIEDE2000 (Sharma, Wu & Dalal 2005)
export const deltaE00 = (h1, h2) => {
  const [L1, a1, b1] = lab(h1), [L2, a2, b2] = lab(h2), rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const ap1 = a1 * (1 + G), ap2 = a2 * (1 + G), Cp1 = Math.hypot(ap1, b1), Cp2 = Math.hypot(ap2, b2);
  const hp = (b, a) => { const h = Math.atan2(b, a) / rad; return h < 0 ? h + 360 : h; };
  const hp1 = hp(b1, ap1), hp2 = hp(b2, ap2);
  const dL = L2 - L1, dC = Cp2 - Cp1;
  let dh = 0;
  if (Cp1 * Cp2) { dh = hp2 - hp1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; }
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh / 2) * rad);
  const Lm = (L1 + L2) / 2, Cpm = (Cp1 + Cp2) / 2;
  let hm = hp1 + hp2;
  if (Cp1 * Cp2) hm = Math.abs(hp1 - hp2) <= 180 ? hm / 2 : (hm + (hm < 360 ? 360 : -360)) / 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2), SC = 1 + 0.045 * Cpm, SH = 1 + 0.015 * Cpm * T;
  const RT = -2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hm - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
};
export const ringContrast = (image, [x, y, w, h], accent, share = 0.02) => {
  const W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h));
  const c = canvasOf(W, H), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(image, x, y, w, h, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data, bins = new Map();
  for (let i = 0; i < d.length; i += 4) { const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3); bins.set(k, (bins.get(k) || 0) + 1); }
  let min = Infinity, worst = null;
  for (const [k, n] of bins) {
    if (n < share * W * H) continue;
    const hex = '#' + [(k >> 10) & 31, (k >> 5) & 31, k & 31].map((v) => ((v << 3) | 4).toString(16).padStart(2, '0')).join('');
    const e = deltaE00(accent, hex);
    if (e < min) { min = e; worst = hex; }
  }
  return { min, worst };
};
