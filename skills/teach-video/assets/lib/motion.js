// motion.js — easing, springs and time windows. Every function is pure: the same t gives the same value.

export const clamp = (x, a = 0, z = 1) => Math.min(z, Math.max(a, x));
export const lerp = (a, z, u) => a + (z - a) * u;
export const unlerp = (a, z, x) => (z === a ? 0 : (x - a) / (z - a));
export const progress = (t, t0, dur) => clamp((t - t0) / dur);

// Critically damped spring from 0 to 1 at angular frequency w (no overshoot).
export const crit = (x, w = 14) => (x <= 0 ? 0 : 1 - (1 + w * x) * Math.exp(-w * x));
// A spring that starts at t0.
export const spring = (t, t0, w = 14) => crit(t - t0, w);
// Under-damped spring for a landing with a visible settle; zeta < 1 overshoots.
export const bounce = (t, t0, w = 18, zeta = 0.45) => {
  const x = t - t0;
  if (x <= 0) return 0;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * x) * (Math.cos(wd * x) + ((zeta * w) / wd) * Math.sin(wd * x));
};
// Sum of springs: a value that steps to each target at its time. steps(t, [[t0, v0], [t1, v1], ...], w)
export const steps = (t, keys, w = 14) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t, keys[i][0], w);
  return v;
};

export const expIn = (u) => (u <= 0 ? 0 : Math.pow(2, 10 * (clamp(u) - 1)));
export const expOut = (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(u)));
export const expInOut = (u) => {
  u = clamp(u);
  if (u === 0 || u === 1) return u;
  return u < 0.5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2;
};
export const cubicOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
export const quintOut = (u) => 1 - Math.pow(1 - clamp(u), 5);
export const cubicInOut = (u) => {
  u = clamp(u);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
};
export const smooth = (u) => {
  u = clamp(u);
  return u * u * u * (u * (u * 6 - 15) + 10);
};

// CSS-style cubic-bezier as a function of u. Material 3 "emphasized decelerate" is bez(0.05, 0.7, 0.1, 1).
export const bez = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (s) => ((ax * s + bx) * s + cx) * s;
  const sy = (s) => ((ay * s + by) * s + cy) * s;
  const dx = (s) => (3 * ax * s + 2 * bx) * s + cx;
  return (u) => {
    u = clamp(u);
    let s = u;
    for (let i = 0; i < 8; i++) {
      const e = sx(s) - u, d = dx(s);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      s -= e / d;
    }
    return sy(clamp(s));
  };
};
export const decelerate = bez(0.05, 0.7, 0.1, 1);
export const accelerate = bez(0.3, 0, 0.8, 0.15);

// Visibility window: 0 before a, fades in over fi, holds, fades out over fo ending at b.
export const win = (t, a, b, fi = 0.2, fo = 0.15) => {
  if (t < a || t > b) return 0;
  return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1);
};
export const fadeIn = (t, t0, d = 0.3) => clamp((t - t0) / d);
export const fadeOut = (t, t0, d = 0.2) => 1 - clamp((t - t0) / d);

export const mixColor = (a, b, u) => {
  const pa = hexToRgb(a), pb = hexToRgb(b);
  return `rgb(${Math.round(lerp(pa[0], pb[0], u))},${Math.round(lerp(pa[1], pb[1], u))},${Math.round(lerp(pa[2], pb[2], u))})`;
};
export const hexToRgb = (h) => {
  const s = h.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
