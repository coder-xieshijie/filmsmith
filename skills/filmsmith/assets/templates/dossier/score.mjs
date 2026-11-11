// score.mjs — the dossier sound: a felt-keys bed (lib/audio beds.diagram, E♭, on the film's beat grid) and restrained
// paper sounds on the picture's own moments (plan.js → timeline.js cues), so every sound sits on its frame and the
// mix is exactly the fitted length: the highlighter drawn across paper, a sticker pressed, a page turned over, a sheet
// dealt on or slid off, the slip lifted and laid down, an index tab, the struck claim and the struck name. No
// typewriter, no camera shutter, no ticking clock (references/modes/dossier.md, "Sound").
//
// The bed rises by chapter (one section per exhibit), drops on the result (the climax), and plays out under the
// lockup. content.bed.file replaces it with a licensed track (gain in dB, offset in seconds).
// Writes assets/audio/mix.wav (−14 LUFS, true peak ≤ −1.5 dBTP after AAC) and assets/audio/measure.json.
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import { plan } from './plan.js';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';

const P = plan(film);
const { B, bar } = P;
const dur = P.duration;
const g = { bpm: P.T.bpm, beat: B, bar, beatsPerBar: 4, t0: 0, bt: (n) => n * B, br: (n) => n * bar };
const s = new Score({ duration: dur, grid: g });

// ---------- the bed ----------
const bars = dur / bar;
const exStarts = P.scenes.filter((x) => x.type === 'exhibit').map((x) => x.start / bar);
const res = P.scenes.find((x) => x.type === 'result'), lock = P.scenes.at(-1);
// the drop lands with the result's struck claim (the climax key), not at the scene's start
const climax = P.cues.find((c) => c.kind === 'claim');
const dropAt = climax ? climax.t / bar : res ? Math.round(res.start / bar * 2) / 2 : null, outAt = Math.round(lock.start / bar * 2) / 2;
const sections = [];
const edges = [...exStarts.map((b) => Math.round(b * 2) / 2), dropAt ?? outAt].filter((b, k, a) => b < (dropAt ?? outAt) || k === a.length - 1);
for (let k = 0; k + 1 < edges.length; k++) if (edges[k + 1] > edges[k]) sections.push({ from: edges[k], to: edges[k + 1], kind: 'build', energy: 0.42 + (0.18 * k) / Math.max(1, edges.length - 2) });
if (dropAt != null && outAt > dropAt) sections.push({ from: dropAt, to: outAt, kind: 'drop', energy: 0.85 });
sections.push({ from: outAt, to: bars, kind: 'outro', energy: 0.5 });
if (film.bed?.file) await s.addFile(film.bed.file, 0, { offset: film.bed.offset || 0, gain: film.bed.gain ?? -3 });
else s.beds.diagram({ key: 'Eb', mix: 'v2', seed: film.seed ?? 3, sections });

// ---------- the paper sounds ----------
for (const c of P.cues) {
  const t = c.t, seed = Math.round(t * 10);
  switch (c.kind) {
    case 'stroke': // a felt tip drawn across paper: a narrow band of noise for the stroke's length
      s.play('whoosh', t, { dur: c.dur ?? B, up: true, lo: 2600, hi: 4200, q: 2.2, peak: 0.35, seed }, { gain: -21, pan: 0.15, send: 0.08 });
      break;
    case 'end': // the URL underlined: a short stroke
      s.play('whoosh', t, { dur: 0.4, up: true, lo: 2800, hi: 4400, q: 2.2, peak: 0.35, seed }, { gain: -23, pan: 0.1, send: 0.08 });
      break;
    case 'land': // a light paper press (the first stroke landing, the slip laid on the worksheet)
      s.play('stamp', t, { freq: 640, to: 160, decay: 0.045, seed: 7 }, { gain: -16 });
      s.play('thud', t, { freq: 90, decay: 0.08 }, { gain: -17 });
      s.duck(t, { depth: -3, attack: 0.005, hold: 0.04, release: 0.2 });
      break;
    case 'stamp': // the sticker pressed onto the sheet
      s.play('stamp', t, { freq: 560, to: 120, decay: 0.06, seed: Math.round(t) }, { gain: -13 });
      s.play('thud', t, { freq: 75, decay: 0.1 }, { gain: -15 });
      s.duck(t, { depth: -3, attack: 0.005, hold: 0.05, release: 0.25 });
      break;
    case 'pop': // the stroke pressed again: the softest touch
      s.play('stamp', t, { freq: 820, to: 300, decay: 0.03, seed }, { gain: -26 });
      break;
    case 'move': s.play('whoosh', t, { dur: 0.22, up: true, lo: 2200, hi: 3600, q: 2, peak: 0.4, seed }, { gain: -28, pan: 0.1 }); break;
    case 'turn': // a page turned over: air, then the flick on the beat the page is gone
      s.play('whoosh', t + 0.05, { dur: Math.min(0.45, (c.dur ?? B) * 0.9), up: false, lo: 500, hi: 4200, q: 1.0, peak: 0.85, seed }, { gain: -17, send: 0.15 });
      s.play('rim', t + (c.dur ?? B), { freq: 1500 }, { gain: -19, send: 0.1 });
      s.play('thud', t + (c.dur ?? B), { freq: 95, decay: 0.07 }, { gain: -20 });
      break;
    case 'deal': s.play('whoosh', t, { dur: 0.32, up: true, lo: 350, hi: 2600, q: 0.9, peak: 0.25, seed }, { gain: -23, send: 0.1 }); break;
    case 'shuffle': // sheet-shuffle: paper drawn out, then slid under; a soft tap as the sheet beneath squares up
      s.play('whoosh', t, { dur: (c.dur ?? 2 * B) * 0.46, up: true, lo: 400, hi: 3000, q: 0.9, peak: 0.6, seed }, { gain: -23, pan: 0.3, send: 0.1 });
      s.play('whoosh', t + (c.dur ?? 2 * B) * 0.5, { dur: (c.dur ?? 2 * B) * 0.45, up: false, lo: 300, hi: 2200, q: 0.9, peak: 0.4, seed: seed + 1 }, { gain: -25, pan: 0.15, send: 0.1 });
      s.play('stamp', t + (c.dur ?? 2 * B) * 0.84, { freq: 700, to: 200, decay: 0.03, seed }, { gain: -22 });
      break;
    case 'louvre': // slats cut along the rows: a quick ripple of paper ticks, one per slat, over a soft slide
      for (let k = 0; k < 6; k++) s.play('tick', t + (c.dur ?? 2 * B) * (0.08 + 0.12 * k), { freq: 2200 + 180 * k, decay: 0.02 }, { gain: -28, pan: -0.3 + 0.12 * k });
      s.play('whoosh', t, { dur: (c.dur ?? 2 * B) * 0.9, up: true, lo: 600, hi: 3200, q: 1.1, peak: 0.5, seed }, { gain: -27, send: 0.1 });
      break;
    case 'match': // match-cut: the page slides the value into register; a hard tick on the cut
      s.play('whoosh', t, { dur: (c.dur ?? 2 * B) * 0.44, up: true, lo: 500, hi: 2800, q: 1, peak: 0.8, seed }, { gain: -26, send: 0.08 });
      s.play('rim', t + (c.dur ?? 2 * B) * 0.5, { freq: 1800 }, { gain: -20 });
      s.play('tick', t + (c.dur ?? 2 * B) * 0.5, { freq: 2800, decay: 0.015 }, { gain: -24 });
      break;
    case 'seam': // split-open: a blade-like tick as the seam is cut, then the worksheet slides out of it
      s.play('tick', t, { freq: 3000, decay: 0.015 }, { gain: -24 });
      s.play('whoosh', t + (c.dur ?? 1.5 * B) * 0.26, { dur: (c.dur ?? 1.5 * B) * 0.7, up: true, lo: 350, hi: 2400, q: 0.9, peak: 0.4, seed }, { gain: -24, send: 0.1 });
      break;
    case 'exit': s.play('whoosh', t, { dur: 0.32, up: false, lo: 300, hi: 2200, q: 0.9, peak: 0.7, seed }, { gain: -24, send: 0.1 }); break;
    case 'stack': // the file squared and slid off the mat: the exit, heavier
      s.play('whoosh', t, { dur: Math.min(0.5, c.dur ?? B), up: false, lo: 250, hi: 1900, q: 0.9, peak: 0.75, seed }, { gain: -21, send: 0.12 });
      s.play('thud', t + 0.04, { freq: 70, decay: 0.12 }, { gain: -20 });
      break;
    case 'lift': s.play('pop', t, { freq: 660, decay: 0.04, sweep: 3 }, { gain: -24 }); s.play('whoosh', t + 0.5 * B, { dur: 1.5 * B, up: true, lo: 700, hi: 3000, q: 1.2, peak: 0.5, seed }, { gain: -25, send: 0.15 }); break;
    case 'tab': s.play('stamp', t, { freq: 760, to: 220, decay: 0.035, seed: Math.round(t * 2) }, { gain: -19 }); break;
    case 'claim': // the struck result: an impact, a paper press and a tick, so the key has a broadband onset over the drop
      s.play('impact', t, { freq: 52, decay: 0.6 }, { gain: -12 });
      s.play('stamp', t, { freq: 900, to: 200, decay: 0.04, seed: 11 }, { gain: -15 });
      s.play('tick', t, { freq: 2800, decay: 0.01 }, { gain: -15 });
      s.duck(t - 0.07, { depth: -6, attack: 0.01, hold: 0.06, release: 0.5 });
      break;
    case 'lockup': s.play('impact', t, { freq: 46, decay: 0.8 }, { gain: -13 }); s.play('stamp', t, { freq: 480, to: 110, decay: 0.07 }, { gain: -14 }); s.duck(t, { depth: -4, release: 0.6 }); break;
    default: throw new Error(`score.mjs: no sound for the cue "${c.kind}"`);
  }
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
// The sticker's click is the mix's sharpest transient, and the renderer's AAC encode can overshoot it by more than
// master()'s estimate (its frames fall elsewhere): the estimate is held 0.6 dB under the default ceiling.
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, tone: 'v2', aac: { ceiling: -2.5 } });
await writeMeasure('.', r, { duration: dur });
