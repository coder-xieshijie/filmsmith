// rng.js — seeded randomness. Math.random() and Date.now() break frame-by-frame rendering; use these.

export const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Stateless per-index random in [0, 1): hash(i) is the same value whoever asks, in any order.
export const hash = (i, seed = 1) => {
  let x = (Math.imul(i | 0, 0x9e3779b1) ^ Math.imul(seed | 0, 0x85ebca6b)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};

// Smooth 1D and 2D value noise in [0, 1], for drift and organic edges.
const fade = (u) => u * u * (3 - 2 * u);
export const noise1 = (x, seed = 1) => {
  const i = Math.floor(x), f = x - i;
  return hash(i, seed) + (hash(i + 1, seed) - hash(i, seed)) * fade(f);
};
export const noise2 = (x, y, seed = 1) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const h = (a, b) => hash(a * 73856093 ^ b * 19349663, seed);
  const u = fade(xf), v = fade(yf);
  const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u;
  const b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u;
  return a + (b - a) * v;
};
// Fractal noise: octaves of noise2, normalised to [0, 1].
export const fbm = (x, y, seed = 1, octaves = 4) => {
  let v = 0, amp = 0.5, f = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    v += amp * noise2(x * f, y * f, seed + o * 101);
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return v / norm;
};
