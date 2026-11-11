// fx.js — thread drawing helpers: fonts, measured type with letter-spacing, typing, rounded rects,
// colour mixing. Pure: nothing here keeps state between frames except the measurement cache.
import { clamp, hexToRgb, lerp } from './lib/motion.js';

export const W = 1920, H = 1080;
export const FAMILY = { disp: 'Bricolage Grotesque', serif: 'Instrument Serif', mono: 'JetBrains Mono' };
// Specimen names shown by the palette scene (the fonts this template ships); the serif is set 50 for 44, its
// optical match (its glyphs are about 15 % smaller at the same size), still one level on the type scale.
export const SPECIMEN = [['disp', 700, 44, 'Bricolage Grotesque'], ['serif', 400, 50, 'Instrument Serif'], ['mono', 500, 44, 'JetBrains Mono']];
// The type scale (px at 1080, ratio ≈ 1.3 between neighbours; see the mode card's Type section). Display type
// above 98 is fitted to its slot. Sizes below 26 are decoration that carries nothing (panel numbers, tiles).
export const TYPE = { label: 26, note: 34, body: 44, line: 58, name: 76, count: 98 };
// The spring formula the curves link draws (base, superscript); timing.rules.js reads it too.
export const FORMULA = ['x(t) = 1 − (1 + ωt) e', '−ωt'];
export const FONTS_TO_LOAD = [
  { family: FAMILY.disp, weight: 800 }, { family: FAMILY.disp, weight: 200 },
  { family: FAMILY.serif, weight: 400, style: 'italic' }, { family: FAMILY.mono, weight: 500 }, { family: FAMILY.mono, weight: 700 },
];

export const setFont = (ctx, fam, wt, size, ls = 0) => {
  ctx.font = fam === 'serif' ? `italic 400 ${size}px "${FAMILY.serif}"` : `${Math.round(wt)} ${size}px "${FAMILY[fam]}"`;
  ctx.letterSpacing = `${(ls * size).toFixed(2)}px`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
};

// Left edge of every glyph (prefix widths keep kerning). Weight is quantised to 5 so the cache stays small.
const cache = new Map();
let mctx = null;
export const measureCtx = () => mctx || (mctx = document.createElement('canvas').getContext('2d'));
export const clearMeasure = () => cache.clear();
export const adv = (fam, wt, size, ls, text) => {
  const w = Math.round(wt / 5) * 5;
  const key = `${fam}|${w}|${size}|${ls}|${text}`;
  let xs = cache.get(key);
  if (!xs) {
    const c = measureCtx();
    setFont(c, fam, w, size, ls);
    xs = [];
    for (let i = 0; i <= text.length; i++) xs.push(c.measureText(text.slice(0, i)).width);
    cache.set(key, xs);
  }
  return xs;
};
// Ink width of a string (trailing letter-spacing removed).
export const textW = (fam, wt, size, ls, text) => {
  const xs = adv(fam, wt, size, ls, text);
  return xs[xs.length - 1] - (text.length ? ls * size : 0);
};
// Largest size ≤ max at which text fits maxW.
export const fitSize = (fam, wt, ls, text, maxW, max, min = 12) => {
  let lo = min, hi = max;
  if (textW(fam, wt, max, ls, text) <= maxW) return max;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (textW(fam, wt, mid, ls, text) <= maxW) lo = mid;
    else hi = mid;
  }
  return lo;
};

// Characters typed by local time u (typing starts at u0 at cps characters per second).
export const typedCount = (u, u0, cps, n) => (u < u0 ? 0 : Math.min(n, Math.floor((u - u0) * cps) + 1));
export const typed = (ctx, text, x, y, u0, u, o = {}) => {
  const k = typedCount(u, u0, o.cps || 60, text.length);
  if (!k) return 0;
  const size = o.size || 24, ls = o.ls === undefined ? 0.18 : o.ls;
  setFont(ctx, 'mono', o.wt || 500, size, ls);
  const full = textW('mono', o.wt || 500, size, ls, text);
  const x0 = o.align === 'center' ? x - full / 2 : x;
  ctx.save();
  ctx.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
  ctx.fillStyle = o.color;
  ctx.fillText(text.slice(0, k), x0, y);
  ctx.restore();
  return k;
};

export const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.max(0, Math.min(r, w / 2, h / 2)));
};

export const mix = (a, b, u) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  u = clamp(u);
  return `rgb(${Math.round(lerp(A[0], B[0], u))},${Math.round(lerp(A[1], B[1], u))},${Math.round(lerp(A[2], B[2], u))})`;
};
// Darker field for contact shadows: the field colour pulled 55% toward black, in sRGB.
export const shade = (hex, k = 0.45) => {
  const [r, g, b] = hexToRgb(hex).map((v) => Math.round(v * k));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
};

// Shadow side of the line colour on the spheres: the colour darkened linearly (× k in linear light), then its
// hue turned by dh degrees (−4: vermilion's dark side leans to crimson, as in the source shot). sRGB hex out.
export const deepen = (hex, k = 0.45, dh = -4) => {
  const toLin = (v) => Math.pow(v / 255, 2.2), toS = (v) => Math.pow(clamp(v), 1 / 2.2);
  const [r, g, b] = hexToRgb(hex).map((v) => toS(toLin(v) * k));
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d > 0) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (((h * 60 + dh) % 360) + 360) % 360;
  const sat = mx ? d / mx : 0, f = (n) => { const q = (n + h / 60) % 6; return mx - mx * sat * Math.max(0, Math.min(q, 4 - q, 1)); };
  return '#' + [f(5), f(3), f(1)].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
};

// WCAG relative luminance and contrast ratio, used by the palette check.
export const luminance = (hex) => {
  const c = hexToRgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a, b) => {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

// Fill in placeholders in copy: {seconds} {frames} {fps} {width} {height} {bpm} {bars}.
export const fill = (s, vars) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
// Values the copy may quote, from the fitted timing (fit() result) and the frame rate: the length a brief
// asks for, the counter and the card's spec line all read these, so no number on screen can disagree with
// the render. {seconds} is the film's length (a whole number, or one decimal at an odd tempo).
const fmtS = (s) => (Math.abs(s - Math.round(s)) < 1e-6 ? String(Math.round(s)) : s.toFixed(1));
export const facts = (timing, fps = 30) => ({
  seconds: fmtS(timing.duration),
  frames: String(Math.ceil(timing.duration * fps - 1e-6)), // the frame count HyperFrames renders
  fps: String(fps), width: String(W), height: String(H),
  bpm: String(Number(timing.bpm.toFixed(1))), bars: String(timing.bars),
  duration: fmtS(timing.duration), // older name for {seconds}
});
// Stand-ins of the widest likely shape, for sizing copy before the timing exists (timing.rules.js).
export const FACTS_PROVISIONAL = { seconds: '99.5', duration: '99.5', frames: '9999', fps: '30', width: String(W), height: String(H), bpm: '128.5', bars: '99' };
// The card's spec line; every value in it is filled at run time.
export const SPEC = '{width}×{height} · {fps} FPS · {seconds} S';
