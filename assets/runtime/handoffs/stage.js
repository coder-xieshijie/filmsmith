// stage.js — what the later asset hand-offs (scroll-reel … match-cut) share on top of asset.js: cover and contain
// views, a flick (a scroll released with momentum, landing exactly), a card with a cast shadow, tall and frame
// placeholders, a mono caption, a fixed-seed hash. Pure helpers; nothing here keeps frame state (the placeholder cache
// holds tools built once).

import { clamp, rrect, text, rgba, canvasOf } from './util.js';
import { coverRect, fitView, view } from './asset.js';

// ---------------------------------------------------------------------------------------------------------------
// Views

// The view that covers the rect r with the asset's crop (the crop's largest region of r's aspect, centred on `focus`
// in image px as far as the crop allows): a = r.w / region.w.
export const coverView = (A, r, focus) => {
  const [x, y, w] = coverRect(A.crop, r.w / r.h, focus);
  const a = r.w / w;
  return view(a, r.x - x * a, r.y - y * a);
};
// The view that fits the whole crop inside r (contain), centred.
export const containView = (A, r) => {
  const [cx, cy, cw, ch] = A.crop;
  const a = Math.min(r.w / cw, r.h / ch);
  return view(a, r.x + (r.w - cw * a) / 2 - cx * a, r.y + (r.h - ch * a) / 2 - cy * a);
};
export { fitView };

// A view scaled by s about the film point (fx, fy).
export const scaleViewAbout = (v, s, fx, fy) => view(v.a * s, fx - (fx - v.bx) * s, fy - (fy - v.by) * s);

// Draw the asset through a view, clipped to rect r (r in film px), with no clip to its crop beyond the image itself.
export const paintView = (ctx, A, v, r) => {
  const [cx, cy, cw, ch] = A.crop;
  ctx.save();
  ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(A.image, cx, cy, cw, ch, v.bx + cx * v.a, v.by + cy * v.a, cw * v.a, ch * v.a);
  ctx.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The flick: a finger accelerates the content for the first `ramp` of the move (smoothstep velocity), lets go at the
// peak, and the content coasts on exponential friction (k e-foldings over the rest), the decay shifted so the speed
// reaches exactly 0 at u = 1 and the position exactly 1 there. Momentum scrolling decays exponentially per unit time
// (touch scroll views multiply the velocity by a deceleration rate every millisecond, 0.998 normal, 0.99 fast); here
// k is fixed by the landing instead of by the device, so the scroll stops exactly on the target section.
const flickParts = (ramp, k) => {
  const E = Math.exp(-k * (1 - ramp));
  const Ar = ramp / 2;                                  // ∫ smoothstep over [0, ramp]
  const Ad = ((1 - E) / k - E * (1 - ramp)) / (1 - E);  // ∫ (e^{-k(u-ramp)} - E) / (1 - E) over [ramp, 1]
  return { E, A: Ar + Ad };
};
export const flickVel = (u, ramp = 0.1, k = 5) => {           // velocity, 1 at the release (u = ramp)
  u = clamp(u);
  if (u < ramp) { const x = u / ramp; return x * x * (3 - 2 * x); }
  const { E } = flickParts(ramp, k);
  return (Math.exp(-k * (u - ramp)) - E) / (1 - E);
};
export const flick = (u, ramp = 0.1, k = 5) => {              // position, 0 → 1, exact at both ends
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const { E, A } = flickParts(ramp, k);
  if (u < ramp) { const x = u / ramp; return (ramp * (x * x * x - (x * x * x * x) / 2)) / A; }
  const d = u - ramp;
  return (ramp / 2 + ((1 - Math.exp(-k * d)) / k - E * d) / (1 - E)) / A;
};
export const flickPeak = (ramp = 0.1, k = 5) => 1 / flickParts(ramp, k).A;   // d(position)/du at the release

// ---------------------------------------------------------------------------------------------------------------
// Cards and sheets

// A soft shadow under the rect (a lifted card or a sheet on the mat), in the ground colour deepened toward black.
export const castShadow = (ctx, r, { blur = 30, dy = 14, alpha = 0.45, radius = 12, color = '#000000' } = {}) => {
  ctx.save();
  ctx.shadowColor = rgba(color, alpha);
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = dy;
  rrect(ctx, r.x, r.y, r.w, r.h, radius);
  ctx.fillStyle = rgba(color, 1);
  ctx.fill();
  ctx.restore();
};

// A tall neutral page of sections (a heading bar, grey lines, a figure block every other section): the placeholder
// scroll-reel and feed-stack draw without an asset.
const PH = new Map();
export const placeholderLong = (w = 1600, h = 7200, section = 1200) => {
  const key = `long${w}x${h}x${section}`;
  if (PH.has(key)) return PH.get(key);
  const c = canvasOf(w, h), g = c.getContext('2d');
  g.fillStyle = '#F4F4F1'; g.fillRect(0, 0, w, h);
  for (let s = 0, y = 0; y < h; s++, y += section) {
    g.fillStyle = '#2A2A2A'; g.fillRect(w * 0.08, y + 80, w * (0.3 + 0.1 * (s % 3)), 56);
    g.fillStyle = '#B9B9B4';
    for (let i = 0; i < 5; i++) g.fillRect(w * 0.08, y + 190 + i * 52, w * (0.84 - 0.08 * ((s + i) % 4)), 22);
    if (s % 2 === 0) { g.fillStyle = '#E2E2DD'; g.fillRect(w * 0.08, y + 480, w * 0.84, section - 600); g.fillStyle = '#9A9A96'; g.fillRect(w * 0.14, y + 560, w * 0.5, 30); }
    else { g.fillStyle = '#CFCFCA'; for (let i = 0; i < 9; i++) g.fillRect(w * 0.08, y + 480 + i * 64, w * 0.84, 2); }
  }
  PH.set(key, c);
  return c;
};

// A neutral 16:9 frame with one big numeral (placeholder film frames and grid tiles).
export const placeholderFrame = (n = 0, w = 1920, h = 1080) => {
  const key = `frame${n}x${w}x${h}`;
  if (PH.has(key)) return PH.get(key);
  const c = canvasOf(w, h), g = c.getContext('2d');
  const shades = ['#2B2E33', '#E9E9E4', '#3B4BD8', '#1C1F24', '#D9D2C4', '#202A44'];
  g.fillStyle = shades[n % shades.length]; g.fillRect(0, 0, w, h);
  g.fillStyle = n % shades.length === 1 || n % shades.length === 4 ? '#222222' : '#EDEDED';
  g.font = `700 ${Math.round(h * 0.42)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(n + 1).padStart(2, '0'), w / 2, h / 2);
  g.fillRect(w * 0.08, h * 0.1, w * 0.3, h * 0.04);
  PH.set(key, c);
  return c;
};

// One line of mono caption (a source, an edge code), right- or left-aligned.
export const caption = (ctx, s, x, y, P, { color, size = 25, align = 'left', alpha = 1 } = {}) =>
  text(ctx, s, x, y, { ...P.mono, size }, { color: color || P.colors.dim, align, alpha });

// Fixed-seed hash in [0, 1) (stagger jitter without Math.random).
export const hash01 = (i, seed = 1) => {
  let h = (i * 374761393 + seed * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export const rectCorners = (r) => [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]];
