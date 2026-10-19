// fx.mjs — bus processing: Freeverb-style algorithmic reverb and an offline look-ahead limiter.

import { SR, db, onepoleHP, onepoleLP } from './dsp.mjs';

const COMBS = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
const ALLPASS = [556, 441, 341, 225];

// reverb(mono, { size, damp, width, predelay, lowcut, highcut }) → [L, R] wet signal (Float32Array each).
// Deterministic Schroeder/Freeverb topology: 8 damped feedback combs in parallel, 4 allpasses in series,
// the right channel offset by 23 samples for width. `size` and `damp` are 0..1.
export const reverb = (input, { sr = SR, size = 0.72, damp = 0.35, width = 0.9, predelay = 0.02, lowcut = 220, highcut = 9500 } = {}) => {
  const n = input.length, k = sr / 44100;
  const x = Float32Array.from(input);
  onepoleHP(x, lowcut, sr);
  onepoleHP(x, lowcut, sr);
  const pd = Math.round(predelay * sr);
  const fb = size * 0.28 + 0.7, d1 = damp * 0.4, d2 = 1 - d1;
  const run = (spread) => {
    const out = new Float32Array(n);
    for (const c of COMBS) {
      const L = Math.max(1, Math.round((c + spread) * k)), buf = new Float32Array(L);
      let idx = 0, store = 0;
      for (let i = 0; i < n; i++) {
        const y = buf[idx];
        store = y * d2 + store * d1;
        const inp = i >= pd ? x[i - pd] : 0;
        buf[idx] = inp * 0.015 + store * fb;
        out[i] += y;
        if (++idx >= L) idx = 0;
      }
    }
    for (const a of ALLPASS) {
      const L = Math.max(1, Math.round((a + spread) * k)), buf = new Float32Array(L);
      let idx = 0;
      for (let i = 0; i < n; i++) {
        const b = buf[idx], v = out[i];
        out[i] = b - v;
        buf[idx] = v + b * 0.5;
        if (++idx >= L) idx = 0;
      }
    }
    onepoleLP(out, highcut, sr);
    return out;
  };
  const l = run(0), r = run(23);
  const w1 = width / 2 + 0.5, w2 = (1 - width) / 2, g = 3; // g brings send=1 to a usable wet level
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = (l[i] * w1 + r[i] * w2) * g; R[i] = (r[i] * w1 + l[i] * w2) * g; }
  return [L, R];
};

// limit([L, R], { ceiling, attack, release }) — stereo-linked, offline, zero-latency look-ahead limiter
// (non-causal: the gain starts falling `attack` seconds before a peak). In place. Returns max reduction (dB).
export const limit = (channels, { sr = SR, ceiling = -1, attack = 0.004, release = 0.12 } = {}) => {
  const c = db(ceiling), n = channels[0].length, g = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (const ch of channels) { const a = Math.abs(ch[i]); if (a > m) m = a; }
    g[i] = m > c ? c / m : 1;
  }
  const kr = 1 - Math.exp(-1 / (release * sr)), ka = 1 - Math.exp(-1 / (attack * sr / 3));
  let e = 1;
  for (let i = 0; i < n; i++) { e = Math.min(g[i], e + (1 - e) * kr); g[i] = e; }
  e = 1;
  for (let i = n - 1; i >= 0; i--) { e = Math.min(g[i], e + (1 - e) * ka); g[i] = e; }
  let minG = 1;
  for (let i = 0; i < n; i++) { if (g[i] < minG) minG = g[i]; for (const ch of channels) ch[i] *= g[i]; }
  return -20 * Math.log10(minG);
};
