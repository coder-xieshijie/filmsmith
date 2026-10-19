// voices.mjs — every instrument and sound effect, synthesised in code.
// Each voice takes one options object and returns a mono Float32Array at `sr` (default 48000),
// peak-normalised to 1.0 (0 dBFS) so the gain you pass to Score.add() is the hit's peak level.
// All randomness comes from mulberry32 seeded by the voice name and `seed`, so equal options give equal samples.

import {
  SR, TAU, mulberry32, seedOf, len, white, normalize, declick, adEnv, asrEnv, onepoleLP, onepoleHP,
  biquad, svf, osc, partials, soft, dcBlock, clamp, mixInto,
} from './dsp.mjs';
import { note } from './notes.mjs';

const rngFor = (name, seed = 0) => mulberry32(seedOf(name, seed));
// Frequencies: numbers are Hz, strings are note names ('D4'). Convert MIDI numbers with mtof() first.
const hz = (f, fallback) => (f == null ? fallback : typeof f === 'number' ? f : note(f));
const hzList = (fs, fallback) => (fs ?? fallback).map((f) => hz(f));
const done = (b, sr, inMs = 0.5, outMs = 4) => normalize(declick(dcBlock(b, sr), sr, inMs, outMs));

// Drums -------------------------------------------------------------------------------------------

// kick({ f0, f1, decay, click, drive, muted }) — sine with a pitch drop, a short click, light saturation.
export const kick = ({ sr = SR, seed = 0, f0 = 150, f1 = 54, decay = 0.24, pitchDecay = 0.035, click = 0.3, drive = 1.6, muted = false } = {}) => {
  const n = len(Math.min(1.2, decay * 4.5), sr), b = new Float32Array(n), rnd = rngFor('kick', seed);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, f = f1 + (f0 - f1) * Math.exp(-t / pitchDecay);
    ph += (TAU * f) / sr;
    const amp = t < 0.0006 ? t / 0.0006 : Math.exp(-(t - 0.0006) / decay) * (1 - 0.15 * Math.exp(-t / 0.02));
    b[i] = Math.sin(ph) * amp;
  }
  const cn = len(0.006, sr), c = biquad(biquad(white(cn, rnd), 'hp', 1200, 0.7, 0, sr), 'lp', muted ? 2500 : 6000, 0.7, 0, sr);
  for (let i = 0; i < cn; i++) b[i] += c[i] * (muted ? click * 0.35 : click) * Math.exp(-i / (0.0015 * sr));
  soft(b, drive);
  if (muted) biquad(b, 'lp', 1800, 0.6, 0, sr);
  return done(b, sr, 0.3, 10);
};

// snare({ tone, decay, snappy }) — two-mode body plus bright noise.
export const snare = ({ sr = SR, seed = 0, tone = 190, decay = 0.16, snappy = 0.7 } = {}) => {
  const n = len(decay * 4, sr), rnd = rngFor('snare', seed);
  const body = partials(n, [{ f: tone, a: 1, d: 0.05 }, { f: tone * 1.63, a: 0.5, d: 0.03 }], sr, 0.0008);
  const nz = biquad(biquad(white(n, rnd), 'hp', 1400, 0.7, 0, sr), 'peak', 5200, 0.9, 4, sr);
  const e = adEnv(n, sr, 0.0008, decay);
  for (let i = 0; i < n; i++) body[i] = body[i] * 0.7 + nz[i] * e[i] * snappy;
  return done(body, sr);
};

// clap({ decay, tone }) — three quick noise bursts and a short tail, band-passed.
export const clap = ({ sr = SR, seed = 0, decay = 0.11, tone = 1300 } = {}) => {
  const n = len(0.03 + decay * 5, sr), rnd = rngFor('clap', seed), b = new Float32Array(n);
  const nz = biquad(biquad(white(n, rnd), 'bp', tone, 1.1, 0, sr), 'hp', 700, 0.7, 0, sr);
  for (const [at, d, a] of [[0, 0.006, 1], [0.009, 0.006, 0.9], [0.019, 0.007, 0.85], [0.028, decay, 0.75]]) {
    const s = Math.round(at * sr), k = Math.exp(-1 / (d * sr));
    let e = a;
    for (let i = s; i < n; i++) { b[i] += nz[i] * e; e *= k; }
  }
  return done(b, sr, 0.3);
};

// hat({ open, decay, tone }) — six detuned square partials (the classic metallic set) plus noise.
export const hat = ({ sr = SR, seed = 0, open = false, decay, tone = 9000 } = {}) => {
  const d = decay ?? (open ? 0.24 : 0.035), n = len(d * 6, sr), rnd = rngFor('hat', seed);
  const b = new Float32Array(n);
  for (const f of [205.3, 304.4, 369.6, 522.7, 540, 800]) {
    const o = osc(n, f * 1.8, { wave: 'square', phase: rnd(), sr });
    for (let i = 0; i < n; i++) b[i] += o[i];
  }
  const nz = white(n, rnd);
  for (let i = 0; i < n; i++) b[i] = b[i] * 0.15 + nz[i] * 0.35;
  biquad(biquad(b, 'bp', tone, 0.9, 0, sr), 'hp', 6500, 0.7, 0, sr);
  const e = adEnv(n, sr, 0.0005, d);
  for (let i = 0; i < n; i++) b[i] *= e[i];
  return done(b, sr, 0.2);
};

// rim({ freq }) — short woody click.
export const rim = ({ sr = SR, seed = 0, freq = 1700 } = {}) => {
  const n = len(0.08, sr), rnd = rngFor('rim', seed);
  const b = partials(n, [{ f: freq, a: 1, d: 0.01 }, { f: freq * 0.3, a: 0.6, d: 0.018 }, { f: freq * 2.4, a: 0.25, d: 0.005 }], sr, 0.0003);
  const c = biquad(white(len(0.003, sr), rnd), 'hp', 2500, 0.7, 0, sr);
  mixInto(b, c, 0, 0.4);
  return done(b, sr, 0.1);
};

// tom({ freq, decay }) — pitched membrane with a downward glide.
export const tom = ({ sr = SR, seed = 0, freq = 110, decay = 0.3 } = {}) => {
  const n = len(decay * 4, sr), b = new Float32Array(n), rnd = rngFor('tom', seed);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr; ph += (TAU * freq * (1 + 0.45 * Math.exp(-t / 0.045))) / sr;
    b[i] = Math.sin(ph) * Math.exp(-t / decay);
  }
  const nz = biquad(white(len(0.03, sr), rnd), 'lp', 1500, 0.7, 0, sr);
  for (let i = 0; i < nz.length; i++) b[i] += nz[i] * 0.25 * Math.exp(-i / (0.006 * sr));
  return done(soft(b, 1.2), sr, 0.3);
};

// Pitched voices ----------------------------------------------------------------------------------

// synth({ freq, dur, wave, cutoff, env, decay, res, attack, release, detune, sub, subOct }) — one subtractive note:
// oscillator(s) → resonant lowpass with a decaying filter envelope → amp envelope. Length dur + release.
export const synth = ({ sr = SR, seed = 0, freq = 220, dur = 0.25, wave = 'saw', cutoff = 900, env = 1800, decay = 0.12, res = 0.8, attack = 0.003, release = 0.06, detune = 0, sub = 0, subOct = 1, drive = 1.1 } = {}) => {
  const f = hz(freq), n = len(dur + release, sr), rnd = rngFor('synth', seed);
  const b = osc(n, f, { wave, phase: rnd(), sr });
  if (detune) { const o = osc(n, f * Math.pow(2, detune / 1200), { wave, phase: rnd(), sr }); for (let i = 0; i < n; i++) b[i] = 0.5 * (b[i] + o[i]); }
  if (sub) { const o = osc(n, f / 2 ** subOct, { wave: 'sine', sr }); for (let i = 0; i < n; i++) b[i] += o[i] * sub; }
  const k = Math.exp(-1 / (decay * sr));
  const ce = new Float32Array(n); let e = 1; for (let i = 0; i < n; i++) { ce[i] = cutoff + env * e; e *= k; }
  svf(b, 'lp', (i) => ce[i], res, sr);
  const a = asrEnv(n, sr, attack, dur, release);
  for (let i = 0; i < n; i++) b[i] *= a[i];
  return done(soft(b, drive), sr, 0.2, 3);
};

// bass({ freq, dur, cutoff, env, decay, res }) — round plucky bass: saw + a unison sine through a lowpass.
export const bass = ({ sr = SR, seed = 0, freq = 55, dur = 0.25, cutoff = 380, env = 900, decay = 0.09, res = 0.9, release = 0.04 } = {}) =>
  synth({ sr, seed, freq, dur, wave: 'saw', cutoff, env, decay, res, attack: 0.002, release, sub: 0.7, subOct: 0, drive: 1.3 });

// sub({ freq, dur, attack, release }) — sine sub with a touch of second harmonic so it reads on small speakers.
export const sub = ({ sr = SR, freq = 41.2, dur = 0.5, attack = 0.008, release = 0.08, harmonic = 0.15 } = {}) => {
  const f = hz(freq), n = len(dur + release, sr), b = new Float32Array(n), a = asrEnv(n, sr, attack, dur, release);
  for (let i = 0; i < n; i++) { const p = (TAU * f * i) / sr; b[i] = (Math.sin(p) + harmonic * Math.sin(2 * p)) * a[i]; }
  return done(soft(b, 1.2), sr, 1, 5);
};

// pluck({ freq, dur, bright, decay, pick }) — Karplus-Strong string with fractional-delay tuning.
export const pluck = ({ sr = SR, seed = 0, freq = 440, dur = 1, bright = 0.5, decay, pick = 0.25 } = {}) => {
  const f = hz(freq), n = len(dur, sr), rnd = rngFor('pluck', seed);
  const t60 = decay ?? clamp(1.6 * Math.pow(220 / f, 0.35), 0.25, 4);
  const P = sr / f, D = P - 0.5;
  let Di = Math.floor(D), fr = D - Di;
  if (fr < 0.2) { Di -= 1; fr += 1; }
  const C = (1 - fr) / (1 + fr), rho = Math.pow(10, -3 / (t60 * f));
  const size = Di + 2, buf = new Float64Array(size);
  // Excitation: seeded noise, lowpassed by brightness, combed at the pick position, DC-free.
  const ex = white(Math.max(2, Math.round(P)), rnd);
  onepoleLP(ex, 800 + 9000 * bright * bright, sr);
  const pk = Math.max(1, Math.round(pick * P));
  for (let i = ex.length - 1; i >= pk; i--) ex[i] -= ex[i - pk];
  let mean = 0; for (const v of ex) mean += v; mean /= ex.length;
  const out = new Float32Array(n);
  let w = 0, apx = 0, apy = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const x = i < ex.length ? ex[i] - mean : 0;
    const r = buf[(w - Di + size * 4) % size];
    const lp = 0.5 * (r + prev); prev = r;
    const ap = C * lp + apx - C * apy; apx = lp; apy = ap; // first-order allpass, fractional delay
    const y = x + rho * ap;
    buf[w] = y; w = (w + 1) % size;
    out[i] = y;
  }
  onepoleLP(out, 2000 + 12000 * bright, sr);
  return done(out, sr, 0.5, Math.min(60, dur * 200));
};

// pad({ freqs, dur, attack, release, cutoff, detune, voices, res, motion, air, wave, hp, dip }) — detuned saws
// through two lowpass stages whose cutoff opens with the attack and drifts slowly. Held for dur, then
// releases; length dur + release. Optional tone shaping (off by default): hp = highpass Hz, dip = [Hz, dB] bell.
export const pad = ({ sr = SR, seed = 0, freqs = ['D3', 'F#3', 'A3'], dur = 2, attack = 0.5, release = 1, cutoff = 1600, detune = 9, voices = 3, res = 0.6, motion = 0.2, air = 0, wave = 'saw', hp = 0, dip = null } = {}) => {
  const fs = hzList(freqs), n = len(dur + release, sr), rnd = rngFor('pad', seed), b = new Float32Array(n);
  for (const f of fs) {
    for (let v = 0; v < voices; v++) {
      const cents = voices === 1 ? 0 : -detune + (2 * detune * v) / (voices - 1);
      const o = osc(n, f * Math.pow(2, cents / 1200), { wave, phase: rnd(), sr });
      for (let i = 0; i < n; i++) b[i] += o[i];
    }
  }
  const lfo = rnd() * TAU, rate = 0.11 + rnd() * 0.06, an = attack * sr;
  const cut = (i) => cutoff * (0.55 + 0.45 * Math.min(1, i / an)) * (1 + motion * Math.sin(lfo + (TAU * rate * i) / sr));
  svf(b, 'lp', cut, 0.6, sr);
  svf(b, 'lp', cut, res, sr);
  if (air > 0) {
    const nz = svf(white(n, rnd), 'bp', (i) => 5000 + 2500 * Math.sin(lfo * 0.7 + (TAU * 0.07 * i) / sr), 0.9, sr);
    let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(b[i]));
    for (let i = 0; i < n; i++) b[i] += nz[i] * air * m * 0.25;
  }
  if (hp) biquad(b, 'hp', hp, 0.7, 0, sr);
  if (dip) biquad(b, 'peak', dip[0], 1.0, dip[1], sr);
  const e = asrEnv(n, sr, attack, dur, release);
  for (let i = 0; i < n; i++) b[i] *= e[i];
  return done(b, sr, 2, 20);
};

// keys({ freqs, dur, hardness, release, dip }) — soft felt piano: slightly inharmonic partials with two-stage
// decay, two detuned strings on the low partials, a felt thump, and a damper when the key lifts at dur.
export const keys = ({ sr = SR, seed = 0, freqs = ['D4'], dur = 1.5, hardness = 0.35, release = 0.35, dip = null } = {}) => {
  const fs = hzList(freqs), n = len(dur + release, sr), rnd = rngFor('keys', seed);
  const list = [];
  for (const f of fs) {
    const T1 = clamp(4.2 * Math.pow(130 / f, 0.6), 0.5, 7), B = 0.00035 * Math.pow(f / 260, 0.5);
    for (let k = 1; k <= 14; k++) {
      const fk = f * k * Math.sqrt(1 + B * k * k);
      if (fk > 9000) break;
      const a = Math.pow(k, -1.35) * Math.exp(-(k - 1) * (1.15 - hardness)), d = T1 / (1 + 0.85 * (k - 1));
      list.push({ f: fk, a: a * 0.55, d: d * 0.16, ph: rnd() * TAU }, { f: fk * (k <= 3 ? 1.0007 : 1), a: a * 0.45, d, ph: rnd() * TAU });
    }
  }
  const b = partials(n, list, sr, 0.004 + 0.006 * (1 - hardness));
  const tn = len(0.04, sr), th = biquad(white(tn, rnd), 'lp', 350, 0.7, 0, sr);
  let m = 0; for (let i = 0; i < Math.min(n, sr * 0.05); i++) m = Math.max(m, Math.abs(b[i]));
  for (let i = 0; i < tn; i++) b[i] += th[i] * m * 0.35 * Math.exp(-i / (0.008 * sr));
  onepoleLP(b, 2500 + 7000 * hardness, sr);
  if (dip) biquad(b, 'peak', dip[0], 1.0, dip[1], sr);
  const hn = Math.round(dur * sr), k = Math.exp(-1 / (release * 0.25 * sr));
  let e = 1; for (let i = hn; i < n; i++) { e *= k; b[i] *= e; }
  return done(b, sr, 0.5, 8);
};

// marimba({ freq, dur, hardness }) — wooden bar: tuned modes (1 : 3.93 : 9.2) and a mallet tick.
export const marimba = ({ sr = SR, seed = 0, freq = 440, dur = 1.2, hardness = 0.5 } = {}) => {
  const f = hz(freq), T = clamp(1.3 * Math.pow(220 / f, 0.7), 0.12, 2.2), n = len(Math.min(dur, T * 6), sr), rnd = rngFor('marimba', seed);
  const b = partials(n, [
    { f, a: 1, d: T }, { f: f * 3.93, a: 0.18 + 0.3 * hardness, d: T / 5 }, { f: f * 9.2, a: 0.05 + 0.12 * hardness, d: T / 14 },
  ], sr, 0.0008);
  const mn = len(0.004, sr), ml = biquad(white(mn, rnd), 'lp', 2000 + 4000 * hardness, 0.7, 0, sr);
  mixInto(b, ml, 0, 0.25 * hardness);
  return done(b, sr, 0.2, 10);
};

// bell({ freq, dur, ratio, index, decay }) — two-operator FM bell; the index falls faster than the level.
export const bell = ({ sr = SR, freq = 880, dur = 2.5, ratio = 3.5, index = 1.8, decay } = {}) => {
  const f = hz(freq), n = len(dur, sr), b = new Float32Array(n), d = decay ?? dur / 3.5;
  let pc = 0, pm = 0;
  const wc = (TAU * f) / sr, wm = (TAU * f * ratio) / sr, kc = Math.exp(-1 / (d * sr)), ki = Math.exp(-1 / (d * 0.35 * sr));
  let a = 1, I = index;
  for (let i = 0; i < n; i++) {
    b[i] = Math.sin(pc + I * Math.sin(pm)) * a + 0.25 * Math.sin(pc * 2.0) * a * I / (index || 1);
    pc += wc; pm += wm; a *= kc; I *= ki;
  }
  return done(b, sr, 1, 20);
};

// arp({ freqs, step, steps, pattern, octaves, voice, gate, accent, opts }) — an arpeggio rendered into one
// buffer. pattern: 'up' | 'down' | 'updown' | 'random' (seeded). voice: 'pluck' | 'synth' | 'marimba' | 'keys' | 'bell'.
export const arp = ({ sr = SR, seed = 0, freqs = ['D4', 'F#4', 'A4'], step = 0.125, steps = 8, pattern = 'up', octaves = 1, voice = 'pluck', gate = 0.9, accent = 0.3, opts = {} } = {}) => {
  const base = hzList(freqs), seq = [];
  for (let o = 0; o < octaves; o++) for (const f of base) seq.push(f * 2 ** o);
  const rnd = rngFor('arp', seed);
  const order = pattern === 'down' ? [...seq].reverse() : pattern === 'updown' ? [...seq, ...seq.slice(1, -1).reverse()] : seq;
  const fn = VOICES[voice];
  const notes = [];
  for (let s = 0; s < steps; s++) notes.push(pattern === 'random' ? seq[Math.floor(rnd() * seq.length)] : order[s % order.length]);
  const rendered = notes.map((f, s) => fn({ sr, seed: seed + s, freq: f, freqs: [f], dur: step * gate, ...opts }));
  const tail = Math.max(...rendered.map((r) => r.length));
  const out = new Float32Array(Math.round(step * (steps - 1) * sr) + tail);
  rendered.forEach((r, s) => mixInto(out, r, Math.round(s * step * sr), s % 4 === 0 ? 1 : 1 - accent));
  return normalize(out);
};

// Effects -----------------------------------------------------------------------------------------

// tick({ freq, decay, noise }) — tiny UI tick.
export const tick = ({ sr = SR, seed = 0, freq = 3200, decay = 0.006, noise = 0.3 } = {}) => {
  const n = len(decay * 8, sr), rnd = rngFor('tick', seed);
  const b = partials(n, [{ f: freq, a: 1, d: decay }, { f: freq * 2.01, a: 0.2, d: decay * 0.5 }], sr, 0.0003);
  const nz = biquad(white(n, rnd), 'hp', 4000, 0.7, 0, sr);
  for (let i = 0; i < n; i++) b[i] += nz[i] * noise * Math.exp(-i / (decay * 0.35 * sr));
  return done(b, sr, 0.1, 1);
};

// thud({ freq, decay }) — soft low landing.
export const thud = ({ sr = SR, seed = 0, freq = 70, decay = 0.12 } = {}) => {
  const n = len(decay * 5, sr), b = new Float32Array(n), rnd = rngFor('thud', seed);
  let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / sr; ph += (TAU * freq * (1 + 1.5 * Math.exp(-t / 0.02))) / sr; b[i] = Math.sin(ph) * Math.exp(-t / decay); }
  const c = biquad(white(len(0.01, sr), rnd), 'lp', 3000, 0.7, 0, sr);
  for (let i = 0; i < c.length; i++) b[i] += c[i] * 0.25 * Math.exp(-i / (0.003 * sr));
  return done(soft(b, 1.3), sr, 0.3);
};

// chime({ freq, decay, notes }) — glassy partials; notes > 1 adds a rising triad, 30 ms apart.
export const chime = ({ sr = SR, freq = 1318.5, decay = 0.6, notes = 1 } = {}) => {
  const f = hz(freq), steps = [1, 1.2599, 1.4983, 2].slice(0, Math.max(1, notes)), n = len(decay * 6 + 0.03 * steps.length, sr);
  const b = new Float32Array(n);
  steps.forEach((r, k) => {
    const p = partials(n, [[1, 1], [2, 0.35], [3.01, 0.18], [4.2, 0.08]].map(([m, a]) => ({ f: f * r * m, a, d: decay / Math.sqrt(m) })), sr, 0.002);
    mixInto(b, p, Math.round(k * 0.03 * sr), 1 / Math.sqrt(steps.length));
  });
  return done(b, sr, 0.5, 20);
};

// pop({ freq, decay }) — rising blip.
export const pop = ({ sr = SR, freq = 440, decay = 0.05, sweep = 5 } = {}) => {
  const n = len(decay * 5, sr), b = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / sr; ph += (TAU * freq * (1 + sweep * Math.min(1, t / 0.06))) / sr; b[i] = Math.sin(ph) * (t < 0.002 ? t / 0.002 : Math.exp(-(t - 0.002) / decay)); }
  return done(b, sr, 0.3);
};

// whoosh({ dur, up, lo, hi, q, peak }) — noise through a swept bandpass. up: true sweeps lo→hi.
export const whoosh = ({ sr = SR, seed = 0, dur = 0.6, up = true, lo = 300, hi = 5000, q = 1.1, peak = 0.65 } = {}) => {
  const n = len(dur, sr), rnd = rngFor('whoosh', seed), lnLo = Math.log(lo), lnHi = Math.log(hi);
  const cut = (i) => { const u = i / n, v = up ? u : 1 - u; return Math.exp(lnLo + (lnHi - lnLo) * v); };
  const b = svf(white(n, rnd), 'bp', cut, q, sr);
  const b2 = svf(white(n, rnd), 'lp', (i) => cut(i) * 0.6, 0.7, sr);
  const pn = peak * n;
  for (let i = 0; i < n; i++) {
    const e = i < pn ? Math.pow(i / pn, 2) : Math.exp((-(i - pn) / (n - pn)) * 4);
    b[i] = (b[i] + 0.35 * b2[i]) * e;
  }
  return done(b, sr, 1, 20);
};

// riser({ dur, lo, hi, tone }) — noise and a gliding tone that climb into the next downbeat.
export const riser = ({ sr = SR, seed = 0, dur = 2, lo = 250, hi = 7000, tone = 0.35 } = {}) => {
  const n = len(dur, sr), rnd = rngFor('riser', seed), r = Math.log(hi / lo);
  const nz = svf(white(n, rnd), 'bp', (i) => lo * Math.exp(r * (i / n)), 1.4, sr);
  const b = new Float32Array(n);
  let p1 = 0, p2 = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n, f = 180 * Math.pow(4, u);
    p1 += (TAU * f) / sr; p2 += (TAU * f * 1.006) / sr;
    b[i] = (nz[i] * 2.2 + tone * 0.5 * (Math.sin(p1) + Math.sin(p2 + 1))) * u * u;
  }
  return done(b, sr, 1, 6);
};

// impact({ freq, decay }) — a soft cinematic landing: sub boom, low noise bloom, kick-like transient.
export const impact = ({ sr = SR, seed = 0, freq = 48, decay = 0.7 } = {}) => {
  const n = len(decay * 4, sr), b = new Float32Array(n), rnd = rngFor('impact', seed);
  let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / sr; ph += (TAU * freq * (1 + 1.2 * Math.exp(-t / 0.03))) / sr; b[i] = Math.sin(ph) * Math.exp(-t / decay); }
  const nz = biquad(white(n, rnd), 'lp', 420, 0.7, 0, sr);
  const e = adEnv(n, sr, 0.004, decay * 0.25);
  for (let i = 0; i < n; i++) b[i] += nz[i] * e[i] * 0.9;
  return done(soft(b, 1.5), sr, 0.3, 30);
};

// stamp({ freq, to, decay }) — rubber stamp / plotter hit: a fast falling sine, filtered noise, low thump.
export const stamp = ({ sr = SR, seed = 0, freq = 900, to = 150, decay = 0.08 } = {}) => {
  const n = len(decay * 5 + 0.02, sr), b = new Float32Array(n), rnd = rngFor('stamp', seed);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, f = to + (freq - to) * Math.exp(-t / 0.018);
    ph += (TAU * f) / sr;
    b[i] = Math.sin(ph) * Math.exp(-t / decay) * 0.8 + 0.6 * Math.sin(TAU * 70 * t) * Math.exp(-t / (decay * 1.3));
  }
  const nz = biquad(biquad(white(n, rnd), 'bp', 1800, 0.8, 0, sr), 'lp', 4500, 0.7, 0, sr);
  for (let i = 0; i < n; i++) b[i] += nz[i] * 0.7 * Math.exp(-i / (0.012 * sr));
  return done(soft(b, 1.4), sr, 0.2);
};

// typeKey({ seed, freq }) — one keyboard key: plastic clack plus a small body tone; vary seed per key.
export const typeKey = ({ sr = SR, seed = 0, freq } = {}) => {
  const rnd = rngFor('typeKey', seed), f = freq ?? 160 + rnd() * 70, n = len(0.09, sr);
  const nz = biquad(biquad(white(n, rnd), 'bp', 2200 + rnd() * 1500, 1.2, 0, sr), 'hp', 600, 0.7, 0, sr);
  const body = partials(n, [{ f, a: 0.7, d: 0.02 }, { f: f * 2.7, a: 0.25, d: 0.008 }], sr, 0.0004);
  for (let i = 0; i < n; i++) body[i] += nz[i] * 0.8 * Math.exp(-i / (0.005 * sr));
  // Release click 25-40 ms later, quieter.
  const r = Math.round((0.025 + rnd() * 0.015) * sr);
  for (let i = r; i < n; i++) body[i] += nz[i - r] * 0.25 * Math.exp(-(i - r) / (0.003 * sr));
  return done(body, sr, 0.1);
};

// glitch({ dur, rate }) — short digital stutter: seeded square blips and crushed noise in 1/rate slices.
export const glitch = ({ sr = SR, seed = 0, dur = 0.25, rate = 24 } = {}) => {
  const n = len(dur, sr), b = new Float32Array(n), rnd = rngFor('glitch', seed), sl = Math.max(1, Math.round(sr / rate));
  for (let s = 0; s < n; s += sl) {
    const on = rnd() < 0.7, f = 200 * Math.pow(2, Math.floor(rnd() * 24) / 4), hold = 1 + Math.floor(rnd() * 12), amp = 0.4 + 0.6 * rnd(), kind = rnd();
    let v = 0;
    for (let i = s; i < Math.min(n, s + sl); i++) {
      if (!on) continue;
      if (kind < 0.5) b[i] = (Math.sin((TAU * f * (i - s)) / sr) > 0 ? 1 : -1) * amp * 0.5;
      else { if ((i - s) % hold === 0) v = rnd() * 2 - 1; b[i] = v * amp; }
    }
  }
  biquad(b, 'lp', 7000, 0.7, 0, sr);
  for (let s = 0; s < n; s += sl) declick(b.subarray(s, Math.min(n, s + sl)), sr, 0.3, 0.3);
  return done(b, sr, 0.2);
};

// swell({ freqs, dur, cutoff }) — reversed-feeling crescendo of a soft chord that stops on its end time.
export const swell = ({ sr = SR, seed = 0, freqs = ['A3', 'D4', 'E4'], dur = 1.5, cutoff = 2400 } = {}) => {
  const b = pad({ sr, seed, freqs, dur, attack: dur * 0.95, release: 0.02, cutoff, motion: 0.05, air: 0.6 });
  const n = b.length;
  for (let i = 0; i < n; i++) b[i] *= Math.pow(i / n, 2.2);
  return done(b, sr, 1, 15);
};

export const VOICES = {
  kick, snare, clap, hat, rim, tom, synth, bass, sub, pluck, pad, keys, marimba, bell, arp,
  tick, thud, chime, pop, whoosh, riser, impact, stamp, typeKey, glitch, swell,
};
