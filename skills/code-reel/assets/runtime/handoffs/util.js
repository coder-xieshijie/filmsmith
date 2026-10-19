// util.js — what every hand-off shares: phase windows, landings that end exactly, text, colour, the ground.
// Pure helpers only; nothing here keeps state between frames.

import { clamp, lerp, crit, hexToRgb } from '../motion.js';

export { clamp, lerp, crit, hexToRgb };
export {
  expIn, expOut, expInOut, cubicOut, cubicInOut, quintOut, smooth, bez, decelerate, accelerate,
} from '../motion.js';

// Local progress of the window [a, b] of p, 0 before and 1 after.
export const seg = (p, a, b) => (b <= a ? (p >= b ? 1 : 0) : clamp((p - a) / (b - a)));

// A critically damped landing over u in [0, 1] that reaches 1 exactly at u = 1 (a raw spring never does, and leaves a
// sub-pixel drift after the hand-off; this one is the spring scaled to end on its target). w = angular frequency per
// unit u: 6 soft, 10 firm, 16 snappy.
export const settle = (u, w = 10) => (u <= 0 ? 0 : u >= 1 ? 1 : crit(u, w) / crit(1, w));

// Exponential decay from 1 at u = 0 to exactly 0 at u = 1; k = e-foldings over the window (4 ≈ phosphor's afterglow).
export const decay = (u, k = 4) => (u <= 0 ? 1 : u >= 1 ? 0 : (Math.exp(-k * u) - Math.exp(-k)) / (1 - Math.exp(-k)));

// ctx.font string from { family, weight, size, style }. A generic family or a list with commas is used as written,
// any other name is quoted.
const GENERIC = /^(serif|sans-serif|monospace|system-ui|cursive|fantasy)$/;
export const fontOf = ({ family = 'sans-serif', weight = 700, size = 96, style = '' } = {}) =>
  `${style} ${weight} ${size}px ${GENERIC.test(family) || family.includes(',') ? family : `"${family}"`}`.trim();

// Draw text with a font spec; { color, align, baseline, alpha, spacing (px letter-spacing) }.
export const text = (ctx, s, x, y, f = {}, { color = '#000', align = 'left', baseline = 'alphabetic', alpha = 1 } = {}) => {
  ctx.save();
  ctx.font = fontOf(f);
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${f.spacing ?? 0}px`;
  if (f.stretch && 'fontStretch' in ctx) ctx.fontStretch = f.stretch;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
};

export const measure = (ctx, s, f = {}) => {
  ctx.save();
  ctx.font = fontOf(f);
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${f.spacing ?? 0}px`;
  if (f.stretch && 'fontStretch' in ctx) ctx.fontStretch = f.stretch;
  const m = ctx.measureText(s);
  ctx.restore();
  return m;
};

// Rounded-rectangle path (radius clamped to the box).
export const rrect = (ctx, x, y, w, h, r) => {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
};

// Mix two colours given as #rrggbb; returns #rrggbb, so mixes chain.
export const mix = (a, b, u) => {
  const pa = hexToRgb(a), pb = hexToRgb(b), k = clamp(u);
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
export const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

// Paint the ground over the whole canvas unless the hand-off is drawn as a layer (params.ground === false).
export const ground = (ctx, P) => {
  if (P.ground === false) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = P.colors.ground;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
};

// Deep merge of plain objects (arrays and functions replace, never merge).
const plain = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
export const merge = (base, over) => {
  if (!plain(base) || !plain(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = v === undefined ? base[k] : merge(base[k], v);
  return out;
};

// Fastest point speed between two lists of tracked points (px per unit of whatever separates them).
export const maxDisp = (a, b) => {
  let m = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) m = Math.max(m, Math.hypot(b[i][0] - a[i][0], b[i][1] - a[i][1]));
  return m;
};

// A small 2D context for measuring text in prepare() (a cache of a tool, not of frame state).
let SCRATCH = null;
export const scratch = () => {
  if (!SCRATCH) {
    const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(16, 16) : document.createElement('canvas');
    SCRATCH = c.getContext('2d');
  }
  return SCRATCH;
};

// A fresh canvas (glyph sampling in prepare()).
export const canvasOf = (w, h) => {
  if (typeof document !== 'undefined') { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  return new OffscreenCanvas(w, h);
};
