// fx.js — text helpers for the trace template.
// Copy markup: [[kind|words]] colours words by a semantic kind: active, learned, unseen (or dim, text).

export const SERIF = 'Source Serif 4';
export const MONO = 'JetBrains Mono';
export const SANS = 'Inter Tight';
export const font = (weight, size, fam = SANS, style = '') => `${style ? style + ' ' : ''}${weight} ${size}px "${fam}"`;

const cache = new Map();
export const measure = (ctx, text, f, ls = 0) => {
  const key = f + '|' + ls + '|' + text;
  let w = cache.get(key);
  if (w === undefined) {
    ctx.save();
    ctx.font = f;
    ctx.letterSpacing = ls + 'px';
    w = ctx.measureText(text).width;
    ctx.restore();
    cache.set(key, w);
  }
  return w;
};
export const clearMeasure = () => cache.clear();

export const runs = (s) => {
  const out = [];
  const re = /\[\[(\w+)\|([^\]]*)\]\]/g;
  let i = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > i) out.push({ text: s.slice(i, m.index), kind: 'text' });
    out.push({ text: m[2], kind: m[1] });
    i = re.lastIndex;
  }
  if (i < s.length) out.push({ text: s.slice(i), kind: 'text' });
  return out;
};
export const plain = (s) => runs(s).map((r) => r.text).join('');

// st: { size, fam, weight, markWeight, ls, style }; colors: kind → css colour
const fOf = (st, kind) => font(kind === 'text' || kind === 'dim' ? st.weight : st.markWeight ?? st.weight, st.size, st.fam, st.style);
export const measureRich = (ctx, s, st) => runs(s).reduce((w, r) => w + measure(ctx, r.text, fOf(st, r.kind), st.ls || 0), 0);
export const drawRich = (ctx, s, x, y, st, colors, align = 'left') => {
  const w = measureRich(ctx, s, st);
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const r of runs(s)) {
    const f = fOf(st, r.kind);
    ctx.font = f;
    ctx.letterSpacing = (st.ls || 0) + 'px';
    ctx.fillStyle = colors[r.kind] ?? colors.text;
    ctx.fillText(r.text, cx, y);
    cx += measure(ctx, r.text, f, st.ls || 0);
  }
  ctx.letterSpacing = '0px';
  return w;
};
export const fitSize = (ctx, s, st, maxW, min) => {
  let size = st.size;
  while (size > min && measureRich(ctx, s, { ...st, size }) > maxW) size -= 1;
  return size;
};

export const hexRgb = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgba = (hex, a) => { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; };
export const mix = (h1, h2, u) => {
  const a = hexRgb(h1), b = hexRgb(h2);
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * u)},${Math.round(a[1] + (b[1] - a[1]) * u)},${Math.round(a[2] + (b[2] - a[2]) * u)})`;
};
// WCAG contrast of two hex colours, and the smallest opacity at which `fg` drawn over `bg` reaches `ratio`
// (canvas blends in sRGB, so the blended colour is the sRGB mix)
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
export const contrast = (h1, h2) => ratio(hexRgb(h1), hexRgb(h2));
export const alphaFor = (fg, bg, target) => {
  const f = hexRgb(fg), g = hexRgb(bg);
  if (ratio(f, g) < target) return 1;
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (ratio(f.map((v, k) => g[k] + (v - g[k]) * m), g) >= target) hi = m; else lo = m;
  }
  return hi;
};
export const mixHex = (h1, h2, u) => {
  const a = hexRgb(h1), b = hexRgb(h2);
  return '#' + [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * u).toString(16).padStart(2, '0')).join('');
};
