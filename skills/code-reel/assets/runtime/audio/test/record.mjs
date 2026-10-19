// record.mjs — test helper: lay a bed on a Score whose voices are not rendered, and return every placed note
// as { name, opts, t, bus } so tests can check harmony and arrangement without synthesising audio.
// record(dir, preset, { bpm, bars, sections, ... }) — dir is the audio kit folder (so the same helper can load
// an older copy of the kit for before/after comparisons).

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export const record = async (dir, preset, { bpm = 120, bars = 16, t0 = 0, ...opts } = {}) => {
  const kit = await import(pathToFileURL(join(dir, 'index.mjs')).href);
  const { Score } = kit;
  class Rec extends Score {
    constructor(o) { super(o); this.notes = []; }
    voice(name, o = {}) { const b = new Float32Array(1); b.v = { name, opts: o }; return b; }
    add(buf, t, mix = {}) { if (buf?.v) this.notes.push({ ...buf.v, t, bus: mix.bus ?? 'fx', gain: mix.gain ?? 0, pan: mix.pan ?? 0 }); return this; }
  }
  const beat = 60 / bpm, bar = beat * 4;
  const s = new Rec({ duration: t0 + bars * bar, bpm, t0 });
  const A = kit.beds[preset](s, opts);
  return { s, A, notes: s.notes, bar, beat, kit };
};

// Pitch class of a frequency in Hz.
export const pc = (hz) => ((Math.round(12 * Math.log2(hz / 440)) % 12) + 12 + 9) % 12;
const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
export const pcName = (p) => NAMES[p];

// Pad pieces as [{ from, to, pcs: Set }] (seconds), from the recorded 'pad' voices.
export const padSpans = (notes) => {
  const out = [];
  for (const n of notes) if (n.name === 'pad') {
    const last = out[out.length - 1];
    if (last && Math.abs(last.from - n.t) < 1e-9) continue; // the second (other-side) copy
    out.push({ from: n.t, to: n.t + n.opts.dur, pcs: new Set(n.opts.freqs.map(pc)) });
  }
  return out;
};
export const padAt = (spans, t) => spans.find((x) => t >= x.from - 1e-6 && t < x.to - 1e-6) || null;
