// score.mjs — the stream mode's sound, synthesised in code (lib/audio). Reads the same plan as the picture
// (plan.js → sched.js cues), so every sound sits on the frame it belongs to.
// node score.mjs → assets/audio/mix.wav (−14 LUFS, true peak ≤ −1.5 dBTP after the AAC encode) and measure.json.
//
// Bed: `terminal` (filtered synth pulse, soft kick, off-beat hats, sub, pad). Sections come from each scene's
// `music` list in sched.js: build while things pile up, a break on the freeze, a drop on each of the three peaks
// (threaded, constellation, the gathered panel), quieter "reading" passages under copy, an outro under the lock-up.
// One event gets the three-note alert and a duck: the single "needs you" in the closing panel.
import { Score, master, writeMeasure, note } from './lib/audio/index.mjs';
import { rmSync, mkdirSync } from 'node:fs';
import content from './content.js';
import { build } from './plan.js';

const PL = build(content);
const { T, CUES, MUSIC } = PL;
const D = PL.duration, BPM = T.bpm;
const s = new Score({ duration: D, bpm: BPM, t0: 0, beatsPerBar: 4 });

const toBar = (sec) => sec / T.bar;
const sections = MUSIC.map((m, i) => ({ from: toBar(m.at), to: toBar(i + 1 < MUSIC.length ? MUSIC[i + 1].at : D), kind: m.kind, energy: m.energy, ...(m.reading ? { reading: true } : {}) })).filter((x) => x.to - x.from > 1e-3);
s.beds.terminal({ sections, mix: 'v2', seed: (content.seed ?? 1) + 4 });

const scale = ['A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'];
const pan = (i) => -0.5 + ((i * 3) % 7) * 0.16;
const SOUND = {
  pop: (c) => s.play('pop', c.t, { freq: 520 + ((c.i ?? 0) % 3) * 60, decay: 0.06 }, { gain: -19, pan: -0.2 + 0.2 * ((c.i ?? 0) % 3), send: 0.25 }),
  notify: (c) => s.play('chime', c.t, { freq: c.i % 2 ? 1318.5 : 1760, decay: 0.28, notes: 1 }, { gain: -23, pan: 0.6, send: 0.15 }),
  stick: (c) => { s.play('thud', c.t, { freq: 85, decay: 0.14 }, { gain: -15 }); s.play('clap', c.t, { decay: 0.05, tone: 900 }, { gain: -22 }); },
  pile: (c) => { const g = -21 + Math.min(6, c.i * 0.4); s.play('pop', c.t, { freq: 360 + ((c.i * 37) % 180), decay: 0.05, seed: c.i }, { gain: g, pan: pan(c.i) }); s.play('tick', c.t, { freq: 2600 + ((c.i * 53) % 600) }, { gain: g - 8 }); },
  click: (c) => s.play('tick', c.t, { freq: 3000, decay: 0.008 }, { gain: -14 }),
  freeze: (c) => s.play('impact', c.t, { freq: 46, decay: 0.9 }, { gain: -15 }),
  fall: (c) => s.play('whoosh', c.t, { dur: c.dur, up: false, lo: 250, hi: 3000 }, { gain: -19 }),
  land: (c) => { s.play('thud', c.t, { freq: 70, decay: 0.16 }, { gain: -13 }); s.play('pop', c.t, { freq: 260, decay: 0.08, sweep: 3 }, { gain: -16 }); },
  riser: (c) => s.play('riser', c.t, { dur: c.dur, lo: 300, hi: 5200, tone: 0.3 }, { gain: -21, send: 0.3 }),
  hit: (c) => { s.play('impact', c.t, {}, { gain: -13 }); s.play('chime', c.t, { freq: note('E6'), notes: 3, decay: 0.9 }, { gain: -22, send: 0.5 }); s.duck(c.t, { depth: -4, release: 0.6 }); },
  pull: (c) => s.play('whoosh', c.t, { dur: c.dur, up: true, lo: 300, hi: 5500, peak: 0.7 }, { gain: -20, send: 0.25 }),
  thud: (c) => s.play('thud', c.t, { freq: 80, decay: 0.16 }, { gain: -16 }),
  sink: (c) => s.play('whoosh', c.t, { dur: c.dur, up: false, lo: 150, hi: 1800, peak: 0.4 }, { gain: -22, send: 0.4 }),
  settle: (c) => { s.play('pluck', c.t, { freq: note('E5'), dur: 1.4, bright: 0.5 }, { gain: -17, send: 0.45 }); s.play('chime', c.t, { freq: note('A5'), notes: 1, decay: 0.9 }, { gain: -24, send: 0.5 }); },
  unfold: (c) => s.play('whoosh', c.t, { dur: 0.5, lo: 500, hi: 4000, peak: 0.5 }, { gain: -26, pan: -0.3 }),
  send: (c) => s.play('whoosh', c.t - 0.05, { dur: 0.35, lo: 900, hi: 6000, peak: 0.6 }, { gain: -26, pan: 0.3 }),
  tick: (c) => s.play('tick', c.t, { freq: 2400 + ((c.i ?? 0) * 200) }, { gain: -25, pan: 0.3 }),
  done: (c) => s.play('chime', c.t, { freq: note('C6'), notes: 2, decay: 0.6 }, { gain: -23, send: 0.45 }),
  launch: (c) => { s.play('pluck', c.t, { freq: note(scale[(c.i ?? 0) % scale.length]), dur: 1.0, bright: 0.6 }, { gain: -17, pan: pan(c.i ?? 0), send: 0.4 }); s.play('whoosh', c.t - 0.05, { dur: 0.3, lo: 1500, hi: 7000, peak: 0.6, seed: c.i ?? 0 }, { gain: -29, pan: 0.3 }); },
  spark: (c) => s.play('tick', c.t, { freq: 2400 + c.i * 90 }, { gain: -28, pan: pan(c.i), send: 0.25 }),
  queue: (c) => s.play('stamp', c.t, { freq: 300, to: 160, decay: 0.07 }, { gain: -25, pan: 0.3 }),
  return: (c) => s.play('chime', c.t + 0.6, { freq: note(['A5', 'C6', 'E6'][c.i % 3]), notes: 1, decay: 0.45 }, { gain: -22, send: 0.4 }),
  rise: (c) => s.play('whoosh', c.t, { dur: 0.5, lo: 400, hi: 3500, peak: 0.5 }, { gain: -23 }),
  slide: (c) => s.play('whoosh', c.t, { dur: 0.4, lo: 600, hi: 4000, peak: 0.5 }, { gain: -27 }),
  stamp: (c) => s.play('stamp', c.t, { freq: 420, to: 110, decay: 0.09 }, { gain: -16, pan: 0.1 }),
  chime: (c) => s.play('chime', c.t, { freq: note('E6'), notes: 2, decay: 0.55 }, { gain: -21, send: 0.45 }),
  fold: (c) => s.play('whoosh', c.t, { dur: 0.45, up: false, lo: 300, hi: 4000 }, { gain: -24 }),
  sweep: (c) => s.play('whoosh', c.t, { dur: 0.6, lo: 300, hi: 3500, peak: 0.5 }, { gain: -25, pan: -0.3 }),
  pluck: (c) => s.play('pluck', c.t, { freq: note(['A4', 'C5', 'E5'][c.i % 3]), dur: 1.2, bright: 0.55 }, { gain: -16, pan: 0.1 + c.i * 0.15, send: 0.4 }),
  zoom: (c) => s.play('whoosh', c.t, { dur: 0.55, lo: 500, hi: 4500, peak: 0.45 }, { gain: -27, pan: 0.3 }),
  unzoom: () => {},
  alert: (c) => { s.play('chime', c.t, { freq: note('E6'), notes: 3, decay: 0.9 }, { gain: -19, send: 0.5 }); s.duck(c.t, { depth: -6, hold: 1.2, release: 0.8 }); },
  impact: (c) => s.play('impact', c.t, { freq: 52, decay: 0.5 }, { gain: -15 }),
  word: (c) => { s.play('thud', c.t, { freq: 70 }, { gain: -16 }); s.play('pluck', c.t, { freq: note(['A3', 'C4', 'E4'][c.i % 3]) * 2, dur: 1.4, bright: 0.6 }, { gain: -14, pan: -0.3 + c.i * 0.3, send: 0.35 }); },
  catch: (c) => s.play('tick', c.t, { freq: 2200 + (c.i % 9) * 160 }, { gain: -30, pan: pan(c.i), send: 0.3 }),
  pierce: (c) => s.play('tick', c.t, { freq: 2200 + (c.i % 9) * 170 }, { gain: -27, pan: pan(c.i), send: 0.3 }),
  star: () => {},
};
const unknown = new Set();
for (const c of CUES) { if (c.t < 0 || c.t > D) continue; (SOUND[c.kind] ?? (() => unknown.add(c.kind)))(c); }
if (unknown.size) console.warn('no sound for cue kinds: ' + [...unknown].join(', '));

mkdirSync('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -2.5, tone: 'v2' });
await writeMeasure('.', r, { duration: D });
rmSync('assets/audio/mix-raw.wav', { force: true });
console.log(JSON.stringify({ D: +D.toFixed(3), bpm: BPM, I: r.I, TP: r.TP, LRA: r.LRA, Smax: r.Smax, ok: r.ok, aac: r.aac && r.aac.TP }));
