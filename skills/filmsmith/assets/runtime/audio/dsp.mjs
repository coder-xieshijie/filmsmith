// dsp.mjs — small deterministic DSP building blocks shared by the voices, the reverb and the limiter.
// Everything is plain Float32Array / Float64Array math; no randomness except the seeded mulberry32 below.

export const SR = 48000;
export const TAU = Math.PI * 2;

// Seeded PRNG (same algorithm as lib/rng.js, kept local so the audio kit has no imports outside its folder).
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

// Hash a string or number into a 32-bit seed, so voices can derive sub-seeds from names.
export const seedOf = (...parts) => {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    h = Math.imul(h ^ 0x9e37, 16777619) >>> 0;
  }
  return h;
};

export const db = (x) => Math.pow(10, x / 20);
export const toDb = (g) => 20 * Math.log10(Math.max(g, 1e-12));
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const len = (sec, sr = SR) => Math.max(1, Math.round(sec * sr));

export const white = (n, rnd) => {
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = rnd() * 2 - 1;
  return b;
};

// Peak-normalise in place to `peak` (default 1). Silent buffers are left alone.
export const normalize = (b, peak = 1) => {
  let m = 0;
  for (let i = 0; i < b.length; i++) { const a = Math.abs(b[i]); if (a > m) m = a; }
  if (m > 1e-9) { const g = peak / m; for (let i = 0; i < b.length; i++) b[i] *= g; }
  return b;
};

export const scale = (b, g) => { for (let i = 0; i < b.length; i++) b[i] *= g; return b; };

// Mix src into dst starting at sample offset `at`, with gain.
export const mixInto = (dst, src, at = 0, g = 1) => {
  const n = Math.min(src.length, dst.length - at);
  for (let i = Math.max(0, -at); i < n; i++) dst[at + i] += src[i] * g;
  return dst;
};

// Short raised-cosine fades at both ends, so no voice ever starts or stops with a click.
export const declick = (b, sr = SR, inMs = 1, outMs = 4) => {
  const a = Math.min(b.length, Math.round((inMs / 1000) * sr));
  const r = Math.min(b.length, Math.round((outMs / 1000) * sr));
  for (let i = 0; i < a; i++) b[i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / a);
  for (let i = 0; i < r; i++) b[b.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / r);
  return b;
};

// Envelopes ---------------------------------------------------------------------------------------

// Attack (linear-ish, raised cosine) then exponential decay with time constant `decay` seconds.
export const adEnv = (n, sr, attack, decay) => {
  const e = new Float32Array(n);
  const an = Math.max(1, Math.round(attack * sr));
  const k = Math.exp(-1 / (decay * sr));
  let v = 1;
  for (let i = 0; i < n; i++) {
    if (i < an) e[i] = 0.5 - 0.5 * Math.cos((Math.PI * i) / an);
    else { v *= k; e[i] = v; }
  }
  return e;
};

// Attack, hold to `hold` seconds, then release (exponential to ~-60 dB over `release`). Length hold+release.
export const asrEnv = (n, sr, attack, hold, release, curve = 1) => {
  const e = new Float32Array(n);
  const an = Math.max(1, Math.round(attack * sr));
  const hn = Math.max(an, Math.round(hold * sr));
  const rn = Math.max(1, Math.round(release * sr));
  for (let i = 0; i < n; i++) {
    let v;
    if (i < an) v = Math.pow(0.5 - 0.5 * Math.cos((Math.PI * i) / an), curve);
    else if (i < hn) v = 1;
    else { const u = (i - hn) / rn; v = u >= 1 ? 0 : Math.exp(-6.9 * u) * (1 - u); }
    e[i] = v;
  }
  return e;
};

// Filters -----------------------------------------------------------------------------------------

// One-pole lowpass / highpass, in place.
export const onepoleLP = (b, fc, sr = SR) => {
  const a = 1 - Math.exp((-TAU * fc) / sr);
  let y = 0;
  for (let i = 0; i < b.length; i++) { y += a * (b[i] - y); b[i] = y; }
  return b;
};
export const onepoleHP = (b, fc, sr = SR) => {
  const a = 1 - Math.exp((-TAU * fc) / sr);
  let y = 0;
  for (let i = 0; i < b.length; i++) { y += a * (b[i] - y); b[i] -= y; }
  return b;
};

// RBJ biquad, in place. type: 'lp' | 'hp' | 'bp' | 'peak' | 'lowshelf' | 'highshelf'.
export const biquad = (b, type, fc, q = 0.707, gainDb = 0, sr = SR) => {
  fc = clamp(fc, 10, sr * 0.49);
  const w = (TAU * fc) / sr, cw = Math.cos(w), sw = Math.sin(w), al = sw / (2 * q), A = Math.pow(10, gainDb / 40);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'lp') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
  else if (type === 'hp') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
  else if (type === 'bp') { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
  else if (type === 'peak') { b0 = 1 + al * A; b1 = -2 * cw; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * cw; a2 = 1 - al / A; }
  else {
    const s = 2 * Math.sqrt(A) * al;
    if (type === 'lowshelf') {
      b0 = A * (A + 1 - (A - 1) * cw + s); b1 = 2 * A * (A - 1 - (A + 1) * cw); b2 = A * (A + 1 - (A - 1) * cw - s);
      a0 = A + 1 + (A - 1) * cw + s; a1 = -2 * (A - 1 + (A + 1) * cw); a2 = A + 1 + (A - 1) * cw - s;
    } else {
      b0 = A * (A + 1 + (A - 1) * cw + s); b1 = -2 * A * (A - 1 + (A + 1) * cw); b2 = A * (A + 1 + (A - 1) * cw - s);
      a0 = A + 1 - (A - 1) * cw + s; a1 = 2 * (A - 1 - (A + 1) * cw); a2 = A + 1 - (A - 1) * cw - s;
    }
  }
  b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < b.length; i++) {
    const x = b[i], y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y; b[i] = y;
  }
  return b;
};

// Topology-preserving state-variable filter with a per-sample cutoff (function of sample index or
// a constant). mode: 'lp' | 'bp' | 'hp'. Coefficients refresh every 8 samples. In place.
export const svf = (b, mode, cutoff, q = 0.707, sr = SR) => {
  const fn = typeof cutoff === 'function' ? cutoff : () => cutoff;
  const k = 1 / q;
  let ic1 = 0, ic2 = 0, a1 = 0, a2 = 0, a3 = 0;
  for (let i = 0; i < b.length; i++) {
    if ((i & 7) === 0) {
      const g = Math.tan((Math.PI * clamp(fn(i), 20, sr * 0.45)) / sr);
      a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2;
    }
    const v0 = b[i], v3 = v0 - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2;
    b[i] = mode === 'lp' ? v2 : mode === 'bp' ? v1 : v0 - k * v1 - v2;
  }
  return b;
};

// Oscillators -------------------------------------------------------------------------------------

const blep = (t, dt) => {
  if (t < dt) { const x = t / dt; return x + x - x * x - 1; }
  if (t > 1 - dt) { const x = (t - 1) / dt; return x * x + x + x + 1; }
  return 0;
};

// Band-limited saw / square / triangle-ish via PolyBLEP. freq may be a function of sample index.
export const osc = (n, freq, { wave = 'saw', phase = 0, sr = SR, pw = 0.5 } = {}) => {
  const out = new Float32Array(n);
  const fn = typeof freq === 'function' ? freq : null;
  let p = phase % 1, tri = 0;
  for (let i = 0; i < n; i++) {
    const dt = (fn ? fn(i) : freq) / sr;
    let v;
    if (wave === 'sine') v = Math.sin(TAU * p);
    else if (wave === 'saw') v = 2 * p - 1 - blep(p, dt);
    else {
      v = (p < pw ? 1 : -1) + blep(p, dt) - blep((p + 1 - pw) % 1, dt);
      if (wave === 'tri') { tri = tri * 0.999 + v * 4 * dt; v = tri; }
    }
    out[i] = v;
    p += dt; if (p >= 1) p -= 1;
  }
  return out;
};

// Sum of decaying sine partials: [{ f, a, d (decay s), ph }]. Uses a rotating phasor (fast, exact enough).
export const partials = (n, list, sr = SR, attack = 0.002) => {
  const out = new Float64Array(n);
  for (const { f, a, d, ph = 0 } of list) {
    if (f <= 0 || f >= sr * 0.45 || a === 0) continue;
    const w = (TAU * f) / sr, c = Math.cos(w), s = Math.sin(w), k = Math.exp(-1 / (d * sr));
    let x = Math.cos(ph), y = Math.sin(ph), e = a;
    const m = Math.min(n, Math.ceil(d * sr * 9)); // stop once below ~-78 dB
    for (let i = 0; i < m; i++) {
      out[i] += y * e;
      const nx = x * c - y * s; y = x * s + y * c; x = nx; e *= k;
    }
  }
  const an = Math.max(1, Math.round(attack * sr));
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) r[i] = i < an ? out[i] * (0.5 - 0.5 * Math.cos((Math.PI * i) / an)) : out[i];
  return r;
};

// Gentle saturation.
export const soft = (b, drive = 1) => {
  const n = Math.tanh(drive);
  for (let i = 0; i < b.length; i++) b[i] = Math.tanh(b[i] * drive) / n;
  return b;
};

// Remove DC with a 15 Hz highpass.
export const dcBlock = (b, sr = SR) => {
  const R = 1 - (TAU * 15) / sr;
  let x1 = 0, y1 = 0;
  for (let i = 0; i < b.length; i++) { const y = b[i] - x1 + R * y1; x1 = b[i]; y1 = y; b[i] = y; }
  return b;
};
