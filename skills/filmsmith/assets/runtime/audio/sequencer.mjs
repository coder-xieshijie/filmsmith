// sequencer.mjs — Score: a fixed-length stereo timeline on the film's beat grid.
// Named stereo buses, each with a mono reverb send. 'fx' (default for add) is never ducked; every other bus
// ('music', and 'pump' which beds use for pads that breathe with the kick) counts as music for duck().
// render() mixes dry + reverb, applies fades (a 60 ms fade-in by default) and a gentle limiter; write() saves a 24-bit WAV.

import { SR, db, len, biquad, clamp } from './dsp.mjs';
import { reverb, limit } from './fx.mjs';
import { VOICES } from './voices.mjs';
import { writeWav, readAudio } from './wav.mjs';

// vary(): which option carries each voice's brightness (and its default), and which voices rotate `seed`.
// synth and bass are left out of the rotation: their seed only moves the oscillator's start phase, which is
// inaudible but changes how low-frequency peaks line up with the kick (measured: +1.5 dB of limiting at −14).
const TIMBRE = { pluck: ['bright', 0.5], marimba: ['hardness', 0.5], keys: ['hardness', 0.35], synth: ['cutoff', 900], bass: ['cutoff', 380], kick: ['click', 0.3], hat: ['tone', 9000], clap: ['tone', 1300] };
const SEEDED = new Set(['kick', 'snare', 'clap', 'hat', 'rim', 'tom', 'pluck', 'marimba', 'keys', 'tick', 'thud', 'typeKey']);
const round = (x) => (Math.abs(x) >= 100 ? Math.round(x / 10) * 10 : Math.round(x * 1000) / 1000);
// 'music' addresses every bus except 'fx'; any other name addresses that bus only.
const hits = (target, name) => (target === 'music' ? name !== 'fx' : target === name);

const gridFrom = ({ grid, bpm = 120, t0 = 0, beatsPerBar = 4 }) => {
  if (grid) return grid;
  const beat = 60 / bpm, bar = beat * beatsPerBar;
  return { bpm, t0, beat, bar, beatsPerBar, bt: (n) => t0 + n * beat, br: (n) => t0 + n * bar, snap: (t) => t0 + Math.round((t - t0) / beat) * beat, beatAt: (t) => (t - t0) / beat };
};

export class Score {
  // new Score({ duration, grid, sr, reverb: { size, damp, width, predelay } })
  // grid comes from lib/beat.js grid(); without it, pass bpm / t0 / beatsPerBar.
  constructor({ duration, grid, sr = SR, bpm, t0, beatsPerBar, reverb: rv = {}, ceiling = -1, highpass = 28 } = {}) {
    if (!(duration > 0)) throw new Error('Score: duration (seconds) is required');
    this.duration = duration;
    this.sr = sr;
    this.grid = gridFrom({ grid, bpm, t0, beatsPerBar });
    this.n = len(duration, sr);
    this.buses = new Map();
    this.ducks = [];
    this.levels = [];
    this.eqs = [];
    this._rr = new Map();
    this.reverbOpts = rv;
    this.ceiling = ceiling;
    this.highpass = highpass;
    // 60 ms: a film that opens on a hit (sample 0) made the render's AAC encode overshoot the true peak by 4–8 dB and
    // the renderer lowered the whole mix by as much (thread and ink, 2026-10-19); the fade softens the first transient
    // only. fade({ in }) can lengthen it (the longest request wins), never shorten it.
    this.fadeIn = 0.06;
    this.fadeOut = 0.05;
    this.events = [];
    this._cache = new Map();
    // s.beds.<preset>(opts) or s.beds.<preset>(s, opts) — bound to this score.
    this.beds = new Proxy({}, {
      get: (_, name) => (a, b) => {
        const fn = Score.beds?.[name];
        if (!fn) throw new Error(`unknown bed "${String(name)}"; presets: ${Object.keys(Score.beds || {}).join(', ')}`);
        return a instanceof Score ? fn(a, b) : fn(this, a);
      },
    });
  }

  get bpm() { return this.grid.bpm; }
  bt(n) { return this.grid.bt(n); }
  br(n) { return this.grid.br(n); }

  _bus(name) {
    let b = this.buses.get(name);
    if (!b) { b = { L: new Float64Array(this.n), R: new Float64Array(this.n), S: new Float64Array(this.n) }; this.buses.set(name, b); }
    return b;
  }

  // add(buffer, t, { gain: dB, pan: -1..1, send: 0..1, bus: 'fx' | 'music' | 'pump' | any, label })
  // buffer: mono Float32Array or [L, R]. t in seconds (negative t trims the head). Returns this.
  add(buffer, t, { gain = 0, pan = 0, send = 0, bus = 'fx', label } = {}) {
    if (!buffer) return this;
    const g = db(gain), at = Math.round(t * this.sr), { L, R, S } = this._bus(bus);
    const stereo = Array.isArray(buffer);
    const src = stereo ? buffer : [buffer];
    const len0 = src[0].length;
    const a = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
    const gl = g * (stereo ? Math.min(1, 1 - pan) : Math.cos(a) * Math.SQRT2), gr = g * (stereo ? Math.min(1, 1 + pan) : Math.sin(a) * Math.SQRT2);
    const i0 = Math.max(0, -at), i1 = Math.min(len0, this.n - at);
    const l = src[0], r = stereo ? src[1] : src[0];
    for (let i = i0; i < i1; i++) { L[at + i] += l[i] * gl; R[at + i] += r[i] * gr; }
    if (send > 0) { const sg = g * send; for (let i = i0; i < i1; i++) S[at + i] += (l[i] + r[i]) * 0.5 * sg; }
    if (label) this.events.push({ t, label });
    return this;
  }

  // voice(name, opts) — render a voice at this score's sample rate, memoised (equal opts → same buffer).
  // The returned buffer is shared; do not modify it.
  voice(name, opts = {}) {
    const fn = VOICES[name];
    if (!fn) throw new Error(`unknown voice "${name}"`);
    const key = name + JSON.stringify(opts);
    let b = this._cache.get(key);
    if (!b) { b = fn({ sr: this.sr, ...opts }); this._cache.set(key, b); }
    return b;
  }

  // vary(name, opts, { vel = 0.5, rr = true }) — voice() for repeated hits: `vel` 0..1 (quantised to quarters)
  // moves the voice's brightness option ±10 % around its value (0.5 = unchanged; louder hits are brighter), and
  // `rr` rotates four seeds per voice name, so a run of equal hits is four alternating samples, not one.
  // Timing is never varied. Deterministic: the rotation follows call order.
  vary(name, opts = {}, { vel = 0.5, rr = true } = {}) {
    const o = { ...opts }, tb = TIMBRE[name], q = Math.round(clamp(vel, 0, 1) * 4) / 4;
    if (tb && q !== 0.5) o[tb[0]] = round((o[tb[0]] ?? tb[1]) * (1 + 0.2 * (q - 0.5)));
    if (rr && SEEDED.has(name)) {
      const k = this._rr.get(name) ?? 0;
      this._rr.set(name, k + 1);
      o.seed = (o.seed ?? 0) + 1009 * (k % 4);
    }
    return this.voice(name, o);
  }

  // play(name, t, voiceOpts, mixOpts) — voice() + add().
  play(name, t, opts = {}, mix = {}) { return this.add(this.voice(name, opts), t, mix); }

  // hit(name, beat, voiceOpts, mixOpts) — same as play() but at a beat number on the grid.
  hit(name, beat, opts = {}, mix = {}) { return this.play(name, this.grid.bt(beat), opts, mix); }

  // duck(t, { depth: dB, attack, hold, release, bus }) — dip the music, e.g. under a voice-over line, an
  // impact or a run of typing (hold: the run's length). bus 'music' (default) means every bus except 'fx';
  // any other name ducks only that bus ('pump' carries the beds' pads, pulses and sub). Overlapping ducks on
  // a bus do not add up: the deepest one wins at each sample.
  duck(t, { depth = -6, attack = 0.01, hold = 0, release = 0.25, bus = 'music' } = {}) { this.ducks.push({ t, depth, attack, hold, release, bus }); return this; }

  // level(from, to, { gain: dB, bus = 'music', ramp = 0.03 }) — a gain change between two times, faded in and
  // out over `ramp` seconds. Unlike duck(), levels add up (in dB) with each other and with the ducks. Beds use
  // it for the energy curve and the reading-scene dip.
  level(from, to, { gain = 0, bus = 'music', ramp = 0.03 } = {}) { if (gain && to > from) this.levels.push({ from, to, gain, bus, ramp }); return this; }

  // eq(bus, [{ type: 'peak' | 'lowshelf' | 'highshelf' | 'hp' | 'lp', freq, q, gain }]) — static EQ on a bus's dry
  // signal before the mix ('music' = every bus except 'fx'). Off unless called.
  eq(bus, bands) { this.eqs.push({ bus, bands }); return this; }

  // fade({ in, out }) — seconds; the longest request wins. Defaults: in 0.06, out 0.05.
  fade({ in: fi = 0, out: fo = 0 } = {}) { this.fadeIn = Math.max(this.fadeIn, fi); this.fadeOut = Math.max(this.fadeOut, fo); return this; }

  // addFile(path, t, { offset, gain, pan, send, bus }) — decode any audio file with ffmpeg and place it.
  addFile(path, t = 0, { offset = 0, ...mix } = {}) { return this.add(readAudio(path, { sr: this.sr, offset, duration: this.duration - t + 1 }), t, { bus: 'music', ...mix }); }

  _duckGain(name) {
    const list = this.ducks.filter((d) => hits(d.bus, name));
    const lv = this.levels.filter((d) => hits(d.bus, name));
    if (!list.length && !lv.length) return null;
    const g = new Float32Array(this.n).fill(0), sr = this.sr;
    for (const { t, depth, attack, hold, release } of list) {
      const s = Math.round((t - attack) * sr), a = Math.max(1, Math.round(attack * sr)), h = Math.round(hold * sr), r = Math.max(1, Math.round(release * sr));
      for (let i = 0; i < a + h + r; i++) {
        const k = s + i; if (k < 0 || k >= this.n) continue;
        const u = i < a ? i / a : i < a + h ? 1 : 1 - (i - a - h) / r;
        const d = depth * (0.5 - 0.5 * Math.cos(Math.PI * u));
        if (d < g[k]) g[k] = d;
      }
    }
    for (const { from, to, gain, ramp } of lv) {
      const a = Math.round(from * sr), z = Math.round(to * sr), r = Math.max(1, Math.round(ramp * sr));
      for (let k = Math.max(0, a); k < Math.min(this.n, z + r); k++) {
        const u = Math.min(1, (k - a) / r, k < z ? 1 : 1 - (k - z) / r);
        g[k] += gain * u;
      }
    }
    for (let i = 0; i < this.n; i++) g[i] = db(g[i]);
    return g;
  }

  // render() → { channels: [L, R] Float32Array, reduction: dB of limiting }
  render() {
    const n = this.n, sr = this.sr, L = new Float32Array(n), R = new Float32Array(n), send = new Float32Array(n);
    let anySend = false;
    for (const [name, b] of [...this.buses.entries()].sort(([a], [c]) => (a < c ? -1 : 1))) {
      for (const { bus, bands } of this.eqs) if (hits(bus, name)) for (const ch of [b.L, b.R]) for (const x of bands) biquad(ch, x.type, x.freq, x.q ?? 0.707, x.gain ?? 0, sr);
      const dg = this._duckGain(name);
      for (let i = 0; i < n; i++) {
        const d = dg ? dg[i] : 1;
        L[i] += b.L[i] * d; R[i] += b.R[i] * d;
        if (b.S[i] !== 0) { send[i] += b.S[i] * d; anySend = true; }
      }
    }
    if (anySend) {
      const [wL, wR] = reverb(send, { sr, ...this.reverbOpts });
      for (let i = 0; i < n; i++) { L[i] += wL[i]; R[i] += wR[i]; }
    }
    const fi = Math.round(this.fadeIn * sr), fo = Math.round(this.fadeOut * sr);
    for (let i = 0; i < fi; i++) { const g = Math.sin((Math.PI / 2) * (i / fi)) ** 2; L[i] *= g; R[i] *= g; }
    for (let i = 0; i < fo; i++) { const g = Math.sin((Math.PI / 2) * (i / fo)) ** 2; L[n - 1 - i] *= g; R[n - 1 - i] *= g; }
    if (this.highpass) for (const ch of [L, R]) biquad(biquad(ch, 'hp', this.highpass, 0.54, 0, sr), 'hp', this.highpass, 1.31, 0, sr);
    const reduction = limit([L, R], { sr, ceiling: this.ceiling });
    return { channels: [L, R], reduction };
  }

  // write(path, { bits: 24 | 16 | 32 }) — render and save. Prints peak and limiter reduction.
  async write(path, { bits = 24, quiet = false } = {}) {
    const { channels, reduction } = this.render();
    let pk = 0;
    for (const ch of channels) for (let i = 0; i < ch.length; i++) { const a = Math.abs(ch[i]); if (a > pk) pk = a; }
    await writeWav(path, channels, this.sr, { bits });
    if (!quiet) {
      const warn = reduction > 6 ? '  (heavy limiting: lower some gains)' : '';
      console.log(`score: wrote ${path}  ${this.duration}s  peak ${(20 * Math.log10(pk || 1e-9)).toFixed(1)} dBFS  limiter ${reduction.toFixed(1)} dB${warn}`);
    }
    return { path, peak: pk, reduction };
  }
}
