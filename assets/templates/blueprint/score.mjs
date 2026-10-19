// score.mjs — the film's sound, built on the same beat grid and cue times as the picture (timeline.js, which
// takes scene lengths, tempo and duration from lib/timing.js fit() with timing.rules.js).
// Bed: the kit's `blueprint` preset (soft arpeggio, clock ticks, airy pad). Effects: one sound per drawn event —
// pencil taps for lettering, knocks for boxes, ticks for checks and laps, a paper slide for each camera move,
// a stamp thud (with a duck) on each of the four stamp beats, a hum and a feed whoosh under the checklist's probe run, a box knock on the RELEASED status. Every camera
// arrival and turn (key events of kind land / turn in timing.json) also gets a crisp drafting tick, so each
// arrival has an onset above 1.5 kHz, and a soft set-down thud where nothing but a pencil tap sounds with it.
// Writes assets/audio/mix.wav (−14 LUFS, true peak ≤ −1.5 dBTP) and assets/audio/measure.json.
// content.sound.tone: 'v1' (default for this mode, chosen 2026-10-18: its bright arpeggio needs no extra air);
// 'v2' is the spectral balance and mastering chain the other modes use.
import { mkdir } from 'node:fs/promises';
import content from './content.js';
import { schedule } from './timeline.js';
import { ROUTE_B, FLOOD_B, UNFOLD_B, SLOT_B, SCAN_B } from './choreography.js';
import { events } from './lib/timing.js';
import rules, { MUSIC } from './timing.rules.js';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';

const S = schedule(content);
if (S.errors.length) { console.error('content errors:\n' + S.errors.join('\n')); process.exit(1); }
await mkdir('assets/audio', { recursive: true });

const g = S.g;
const s = new Score({ duration: S.duration, grid: g });
const snd = content.sound || {};
const variant = { ...(snd.tone === 'v2' ? { mix: 'v2' } : {}) };

// ---------- bed: sections follow the fitted scenes (any length, whole-beat steps). The detail sheet (the film's
// heaviest reading) builds instead of dropping (F18); a reading break on the mid overview and the parts list; the
// drop on the section, loop and checklist sheets and on the final overview's claim. Energy is a tension curve
// that rises sheet by sheet and peaks on the claim; a sheet whose primary text takes 60 % or more of its length
// under the groove is a reading drop (the arpeggio rests; clock, kick, pad and sub stay) ----------
const KIND = MUSIC; // timing.rules.js: the same kinds give the keys their drop: true
const TENSION = { problem: 0.4, arrangement: 0.5, interface: 0.52, detail: 0.55, section: 0.6, loop: 0.62, stages: 0.62, checklist: 0.65, overview: 0.55, assembly: 0.55, parts: 0.5, release: 0.5 };
const sections = S.scenes.map((sc) => {
  const kind = sc.music || (sc.type === 'overview' ? (sc.final ? 'drop' : 'break') : KIND[sc.type]);
  const energy = sc.type === 'overview' && sc.final ? 0.9 : TENSION[sc.type] ?? 0.55;
  const reading = kind === 'drop' && !(sc.type === 'overview' && sc.final) && (sc.timing?.reading?.primary ?? 0) / sc.dur >= 0.6;
  return { from: sc.startBar, to: sc.startBar + sc.bars, kind, energy, reading };
});
if (content.bed?.file) s.addFile(content.bed.file, 0, { offset: content.bed.offset || 0, gain: content.bed.gain || 0 });
else s.beds.blueprint({ sections, seed: content.seed, key: content.key || 'E', ...variant });

// ---------- effects ----------
let n = 0;
const rr = () => ++n; // round-robin seed so repeated hits are not identical
for (const ev of S.sounds) {
  const t = ev.t;
  switch (ev.kind) {
    case 'pen': s.play('rim', t, { freq: 1350 + (n % 3) * 90, seed: rr() }, { gain: -22, pan: -0.2 + (n % 5) * 0.1, send: 0.15 }); break;
    case 'box': s.play('rim', t, { freq: 820, seed: rr() }, { gain: -20, send: 0.12 }); s.play('thud', t, { freq: 95, decay: 0.07 }, { gain: -22 }); break;
    case 'mark': s.play('pop', t, { freq: 620, decay: 0.06, sweep: 3 }, { gain: -23, send: 0.2 }); break;
    case 'tick': s.play('tick', t, { freq: 3300 + (n % 7) * 80, decay: 0.008, seed: rr() }, { gain: -18, pan: 0.15, send: 0.1 }); break;
    case 'clack': s.play('tom', t, { freq: 170, decay: 0.12 }, { gain: -16, send: 0.15 }); s.play('rim', t, { freq: 1100, seed: rr() }, { gain: -20 }); break;
    case 'stamp': s.play('stamp', t, { freq: 760, to: 120, decay: 0.09 }, { gain: -9, send: 0.18 }); s.play('impact', t, { freq: 46, decay: 0.5 }, { gain: -19 }); s.duck(t, { depth: -4, release: 0.5 }); break;
    case 'move': s.play('whoosh', t, { dur: 0.6, up: false, lo: 350, hi: 2600, q: 0.9, peak: 0.6 }, { gain: -27, send: 0.2 }); break;
    case 'pullout': s.play('whoosh', t, { dur: 0.95, up: true, lo: 300, hi: 4200, q: 0.8, peak: 0.7 }, { gain: -23, send: 0.3 }); break;
    case 'pushin': s.play('whoosh', t, { dur: 0.95, up: false, lo: 300, hi: 3600, q: 0.8, peak: 0.6 }, { gain: -24, send: 0.3 }); break;
    // the T2 devices (each lands on a beat with its sound) and the stage words
    case 'flood': s.play('whoosh', t, { dur: FLOOD_B * g.beat, up: true, lo: 260, hi: 5200, q: 0.8, peak: 0.85 }, { gain: -20, send: 0.3 }); s.play('chime', t + FLOOD_B * g.beat, { freq: 'E6', notes: 2, decay: 0.4 }, { gain: -26, send: 0.35 }); break;
    case 'reinterpret': for (let k = 0; k < 3; k++) s.play('tick', t + k * 0.1 * g.beat, { freq: 2900 + k * 260, decay: 0.01, seed: rr() }, { gain: -19, pan: -0.2 + k * 0.2, send: 0.12 }); break;
    case 'unfold': s.play('whoosh', t, { dur: 0.5 * UNFOLD_B * g.beat, up: false, lo: 300, hi: 2400, q: 0.9, peak: 0.5 }, { gain: -25, send: 0.25 }); for (let k = 0; k < 6; k++) s.play('rim', t + (0.5 + 0.025 * k) * UNFOLD_B * g.beat + 0.38 * UNFOLD_B * g.beat, { freq: 900 + k * 70, seed: rr() }, { gain: -24, send: 0.1 }); break;
    case 'slot': s.play('tick', t + 0.72 * SLOT_B * g.beat, { freq: 2400, decay: 0.012, seed: rr() }, { gain: -18, send: 0.12 }); s.play('thud', t + 0.72 * SLOT_B * g.beat, { freq: 110, decay: 0.06 }, { gain: -23 }); break;
    // the probe run: the lamp's low hum and a soft feed whoosh across it; each row a short, quiet tick as it is passed
    case 'scan': s.play('whoosh', t, { dur: 0.83 * SCAN_B * g.beat, up: true, lo: 400, hi: 3000, q: 1, peak: 0.55 }, { gain: -24, send: 0.2 }); s.play('swell', t, { freqs: ['E2', 'B2'], dur: 0.83 * SCAN_B * g.beat, cutoff: 500 }, { gain: -27, bus: 'music' }); break;
    case 'probe': s.play('tick', t, { freq: 3000 + (n % 4) * 120, decay: 0.006, seed: rr() }, { gain: -21, pan: 0.15, send: 0.1 }); break;
    case 'rule': s.play('whoosh', t, { dur: g.beat, up: false, lo: 180, hi: 1600, q: 1.1, peak: 0.5 }, { gain: -19, send: 0.15 }); break;
    case 'route': s.play('swell', t, { freqs: ['E3', 'B3', 'D4', 'F#4'], dur: ROUTE_B * g.beat, cutoff: 2000 }, { gain: -21, send: 0.3, bus: 'music' }); s.play('chime', t + ROUTE_B * g.beat, { freq: 'B5', notes: 3, decay: 0.5 }, { gain: -25, send: 0.35 }); break;
    default: break;
  }
}

// ---------- arrivals and turns (timing.json keys) ----------
const { keys } = events(S.fitted, content, rules);
let a = 0;
for (const key of keys) {
  if (!['land', 'turn'].includes(key.kind)) continue;
  if (keys.some((k) => k !== key && ['land', 'turn'].includes(k.kind) && Math.abs(k.t - key.t) < 1e-3 && keys.indexOf(k) < keys.indexOf(key))) continue; // one per moment
  // coming out of a drop the full groove masks a −19 dB tick (batch 3: the assembly's arrival straight after the
  // checklist's drop measured a 1.9 dB rise); there the tick and the thud sit 3 dB higher and the music dips 5 dB for the
  // two frames before the arrival, so the landing stands out (a set-down, like the stamps' −4 dB duck)
  const bar = key.t / g.bar, before = sections.find((x) => bar - 0.02 >= x.from && bar - 0.02 < x.to);
  const lift = before?.kind === 'drop' ? 3 : 0;
  s.play('tick', key.t, { freq: 3600 + 150 * (a % 3), decay: 0.007, noise: 0.35, seed: 900 + a }, { gain: -19 + lift, pan: -0.1 + 0.1 * (a % 3), send: 0.12 });
  if (!S.sounds.some((e) => e.kind !== 'pen' && Math.abs(e.t - key.t) < 0.05)) s.play('thud', key.t, { freq: 90, decay: 0.08, seed: a }, { gain: -20 + lift });
  if (lift) s.duck(key.t - 0.08, { depth: -5, attack: 0.04, hold: 0.06, release: 0.3 }); // the groove draws breath as the sheet lands
  a++;
}

await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(snd.tone === 'v2' ? { tone: 'v2' } : {}) });
await writeMeasure('.', r, { duration: S.duration, bpm: g.bpm });
