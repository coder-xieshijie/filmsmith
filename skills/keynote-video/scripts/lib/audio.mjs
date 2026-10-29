// audio.mjs — sound measurements from the film's mixed track (mono 48 kHz).
//   jumps(series, I)        momentary-loudness jumps: M − median(M over the preceding 2 s, floored at I − 20)
//   onsets(pcm)             per video frame: rise in broadband and in 1.5 kHz high-passed energy (dB)
//   octaves(pcm)            octave-band levels 63 Hz–16 kHz relative to total power (Welch, Hann 8192)
//   selfSimilarity(pcm, s)  spectral-frame cosine similarity at a lag of s seconds (median, share > 0.95)
//   limiting(pcm, I)        peak-to-loudness ratio and how much of the film sits at the peak ceiling

export const SR = 48000;

// In-place iterative radix-2 FFT.
const fft = (re, im) => {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
};
const hann = (n) => Float64Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n));
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };

export const jumps = ({ t, M }, I, { window = 2, floor = 20, min = 6 } = {}) => {
  const out = [];
  const step = t.length > 1 ? t[1] - t[0] : 0.1, back = Math.round(window / step), gap = Math.round(0.2 / step);
  for (let i = back; i < M.length; i++) {
    const base = median(M.slice(i - back, i - gap).map((v) => Math.max(v, I - floor)));
    const rise = M[i] - base;
    if (rise > min && M[i] > I - 10) out.push({ t: t[i], rise, M: M[i] });
  }
  // One entry per jump: merge within 1 s, keep the largest rise.
  const merged = [];
  for (const j of out) {
    const last = merged.at(-1);
    if (last && j.t - last.end <= 1) { last.end = j.t; if (j.rise > last.rise) Object.assign(last, { t: j.t, rise: j.rise, M: j.M }); }
    else merged.push({ ...j, end: j.t });
  }
  return merged;
};

// Biquad high-pass (RBJ), q = 0.707.
const highpass = (x, fc) => {
  const w = (2 * Math.PI * fc) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2);
  const b0 = (1 + c) / 2, b1 = -(1 + c), b2 = (1 + c) / 2, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};

// Per video frame: energy (dB) of the whole band and of the band above 1.5 kHz, and each one's onset
// strength, the rise over the lower of the two frames before (so a soft attack that takes two frames
// still counts).
export const onsets = (pcm, fps = 30) => {
  const hp = highpass(pcm, 1500), per = SR / fps, nf = Math.floor(pcm.length / per);
  const eb = new Float64Array(nf), eh = new Float64Array(nf), bb = new Float64Array(nf), hf = new Float64Array(nf);
  for (let f = 0; f < nf; f++) {
    let s = 0, h = 0;
    for (let i = f * per; i < (f + 1) * per; i++) { s += pcm[i] * pcm[i]; h += hp[i] * hp[i]; }
    eb[f] = 10 * Math.log10(1e-12 + s / per); eh[f] = 10 * Math.log10(1e-12 + h / per);
  }
  for (let f = 2; f < nf; f++) { bb[f] = Math.max(0, eb[f] - Math.min(eb[f - 1], eb[f - 2])); hf[f] = Math.max(0, eh[f] - Math.min(eh[f - 1], eh[f - 2])); }
  return { broadband: bb, high: hf };
};

export const OCTAVES = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const octaves = (pcm) => {
  const n = 8192, hop = 4096, win = hann(n), psd = new Float64Array(n / 2 + 1);
  const re = new Float64Array(n), im = new Float64Array(n);
  let frames = 0;
  for (let s = 0; s + n <= pcm.length; s += hop) {
    for (let i = 0; i < n; i++) { re[i] = pcm[s + i] * win[i]; im[i] = 0; }
    fft(re, im);
    for (let k = 0; k <= n / 2; k++) psd[k] += re[k] * re[k] + im[k] * im[k];
    frames++;
  }
  const hz = (k) => (k * SR) / n;
  let total = 0;
  for (let k = 0; k <= n / 2; k++) if (hz(k) >= 20 && hz(k) <= 20000) total += psd[k];
  const level = (lo, hi) => { let p = 0; for (let k = 0; k <= n / 2; k++) if (hz(k) >= lo && hz(k) < hi) p += psd[k]; return 10 * Math.log10((p + 1e-30) / (total + 1e-30)); };
  const bands = Object.fromEntries(OCTAVES.map((c) => [c, level(c / Math.SQRT2, c * Math.SQRT2)]));
  // Slope over third-octave levels 100 Hz–10 kHz (dB per octave), least squares.
  const xs = [], ys = [];
  for (let i = 0; i < 21; i++) { const c = 100 * 2 ** (i / 3); xs.push(Math.log2(c)); ys.push(level(c / 2 ** (1 / 6), c * 2 ** (1 / 6))); }
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  return { bands, slope, frames };
};

// Reference octave profile: mean of the six generated music beds behind the mode source films, measured
// with octaves() in 2026-10. A `draft` reference, not a published target curve. balance() compares shapes:
// the film's offset from the reference minus the mean offset over 125 Hz–8 kHz.
export const REFERENCE = { 63: -2.1, 125: -9.9, 250: -13.6, 500: -13.0, 1000: -15.1, 2000: -19.2, 4000: -19.2, 8000: -22.8, 16000: -29.9 };
export const balance = (bands) => {
  const mid = OCTAVES.filter((c) => c >= 125 && c <= 8000);
  const shift = mid.reduce((a, c) => a + bands[c] - REFERENCE[c], 0) / mid.length;
  return Object.fromEntries(OCTAVES.map((c) => [c, bands[c] - REFERENCE[c] - shift]));
};

// Magnitude spectrogram (Hann 2048, hop 960 = 20 ms) for the self-similarity measure.
const spectrogram = (pcm, n = 2048, hop = 960) => {
  const win = hann(n), re = new Float64Array(n), im = new Float64Array(n), frames = [];
  for (let s = 0; s + n <= pcm.length; s += hop) {
    for (let i = 0; i < n; i++) { re[i] = pcm[s + i] * win[i]; im[i] = 0; }
    fft(re, im);
    const mag = new Float32Array(n / 2 + 1);
    let norm = 0;
    for (let k = 0; k <= n / 2; k++) { mag[k] = Math.hypot(re[k], im[k]); norm += mag[k] * mag[k]; }
    frames.push({ mag, norm: Math.sqrt(norm) });
  }
  return { frames, hop };
};

export const selfSimilarity = (pcm, lagSec) => {
  const { frames, hop } = spectrogram(pcm);
  const maxNorm = Math.max(...frames.map((f) => f.norm));
  const active = frames.map((f) => f.norm > 1e-3 * maxNorm);
  const k0 = (lagSec * SR) / hop;
  let best = null;
  for (const d of [-1, 0, 1]) {
    const k = Math.round(k0) + d;
    if (k <= 0 || k >= frames.length) continue;
    const sims = [];
    for (let i = 0; i + k < frames.length; i++) {
      if (!active[i] || !active[i + k]) continue;
      const a = frames[i], b = frames[i + k];
      let dot = 0;
      for (let j = 0; j < a.mag.length; j++) dot += a.mag[j] * b.mag[j];
      sims.push(dot / (a.norm * b.norm + 1e-12));
    }
    if (sims.length < 50) continue;
    const med = median(sims), share = sims.filter((s) => s > 0.95).length / sims.length;
    if (!best || med > best.median) best = { median: med, share, lag: (k * hop) / SR };
  }
  return best;
};

// Limiting: the master's look-ahead limiter leaves the loudest moments flat at its ceiling. From the
// per-sample stereo peak: the peak-to-loudness ratio (sample peak − I) and the share of 10 ms blocks
// whose peak is within 0.5 dB of the film's highest sample peak. The gain the limiter took cannot be
// read from the master alone; score.mjs writes it to assets/audio/measure.json when it knows it.
export const limiting = (peak, I) => {
  const blk = SR / 100, nb = Math.floor(peak.length / blk), peaks = new Float64Array(nb);
  let top = 0;
  for (let b = 0; b < nb; b++) { let p = 0; for (let i = b * blk; i < (b + 1) * blk; i++) if (peak[i] > p) p = peak[i]; peaks[b] = p; if (p > top) top = p; }
  const topDb = 20 * Math.log10(top + 1e-12);
  let near = 0;
  for (const p of peaks) if (20 * Math.log10(p + 1e-12) >= topDb - 0.5) near++;
  return { samplePeak: topDb, plr: topDb - I, atCeiling: nb ? near / nb : 0 };
};
