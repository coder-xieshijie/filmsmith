// score.mjs — the film's sound, from the same run and clock as the picture.
// Bed: the shared `diagram` preset (felt keys and a two-bar motif over a warm pad, gentle plucked pulse, soft
// low kick in the drop), or a generated music file via content.bed = { file: 'assets/audio/bed.wav', offset }.
// Effects come from timeline.js events: ticks as rows appear and as each count segment lands, a soft pluck
// chord when the words split into tokens, a pop on each pick, a woody fuse on every merge's contact frame, a
// chime on the summary line's landing and the probe's reveal, a felt-keys chord as the thesis's claim lands, a soft
// bell on the closing second motion (the last downbeat). Each expressive transition (T2) lands with its sound: a
// rising-falling whoosh round path-type's loop, ticks up and down the scale under token-sweep's bars, an airy whoosh
// with trace-flow's front; the probe's letters resolve over a quiet glitch. Each fuse lands with a short woody click over the tom, and
// the music takes a 70 ms breath just before it, so the landing reads as an onset over the groove in the loop and
// the probe. Writes assets/audio/mix.wav (−14 LUFS, true
// peak ≤ −1.5 dBTP) and assets/audio/measure.json.
// content.sound.tone: 'v2' (default) is the spectral balance and mastering chain chosen 2026-10-18; 'v1' is the
// earlier mix (blueprint keeps 'v1' by default, see its TEMPLATE.md).
import film from './content.js';
import { loadRun } from './run.js';
import { plan } from './timeline.js';
import { validate } from './tools/validate.mjs';
import { Score, master, writeMeasure, note } from './lib/audio/index.mjs';
import { mkdir } from 'node:fs/promises';

const errors = await validate(film, { quiet: true });
if (errors.length) {
  console.error('content.js has errors; run `npm run validate`:\n  ' + errors.join('\n  '));
  process.exit(1);
}
const run = await loadRun(film);
const S = plan(film, run);
const s = new Score({ duration: S.T.duration, grid: S.g });
const snd = film.sound || {};
const variant = { ...(((snd.tone ?? 'v2') === 'v2') ? { mix: 'v2' } : {}) };

// Sections follow the fitted scenes, so the bed works for any length; scenes start on beats, not always on bar lines.
// Music: quiet while the board is read, the groove under the compressed loop and the probe, a break under the
// summary number, the outro under the thesis. content.scenes[i].music overrides. The probe builds under its replays
// and drops on its reveal (a drop straight out of the summary break, mid-bar, jumped +6.7 LU); any other drop
// that would start inside a bar after another kind builds to the next bar line first.
// Energy is a tension curve: low on the hook and the count, rising through the steps, highest on the probe.
const KIND = { hook: 'intro', count: 'intro', step: 'build', loop: 'drop', summary: 'break', probe: 'drop', thesis: 'outro' };
const TENSION = { hook: 0.4, count: 0.45, step: 0.5, loop: 0.65, summary: 0.5, probe: 0.75, thesis: 0.5, ...(film.tension || {}) };
const sections = [];
for (const c of S.laid) {
  const kind = c.music ?? KIND[c.type], energy = TENSION[c.type] ?? film.energy ?? 0.5;
  const from = c.startBar, to = c.startBar + c.bars, line = Math.ceil(from - 1e-9);
  const prev = sections[sections.length - 1];
  // The probe replays its merges under a build and drops on the reveal (the chime inside the scene), on its beat.
  const reveal = c.type === 'probe' && !c.music ? S.events.find((e) => e.kind === 'chime' && e.t > c.start && e.t < c.end) : null;
  const at = reveal ? (reveal.t - S.g.t0) / S.g.bar : null;
  // Out of the summary's break the music comes back 3 dB down (reading: 'duck') until its next section: the break is
  // pad only, and the full build right after it jumped +6.5 LU once the summary shrank to one bar (2026-10-18). The
  // probe's build is ducked whole, up to the drop on its reveal (a drop key may jump).
  const push = (x) => {
    const p = sections[sections.length - 1];
    // consecutive builds are one section, so the build keeps rising through both slow steps instead of
    // restarting (a restart drops the pulse and hats, then brings them back: +6.1 LU, 2026-10-18)
    if (p && p.kind === x.kind && x.kind === 'build' && !p.reading && Math.abs(p.to - x.from) < 1e-6) { p.to = x.to; return; }
    sections.push(p?.kind === 'break' && x.kind !== 'break' ? { ...x, reading: 'duck' } : x);
  };
  if (at != null) { push({ from, to: at, kind: 'build', energy: energy - 0.1 }); push({ from: at, to, kind, energy }); }
  else if (kind === 'drop' && prev && prev.kind !== 'drop' && line > from && line < to) { push({ from, to: line, kind: 'build', energy }); push({ from: line, to, kind, energy }); }
  else push({ from, to, kind, energy });
}
if (film.bed?.file) s.addFile(film.bed.file, 0, { offset: film.bed.offset ?? 0, gain: film.bed.gain ?? 0 });
else s.beds.diagram({ sections, seed: film.seed, ...variant });

const EB = ['Eb4', 'G4', 'Bb4', 'D5', 'F5'].map(note);
let fuseN = 0;
for (const e of S.events) {
  const g = e.gain ?? 1;
  if (e.kind === 'tick') s.play('tick', e.t, { freq: 2400, decay: 0.008, noise: 0.15 }, { gain: -21, pan: -0.1 });
  else if (e.kind === 'split') [0, 1, 2].forEach((i) => s.play('pluck', e.t + i * 0.03, { freq: EB[i] * 2, dur: 0.6, bright: 0.4 }, { gain: -20, send: 0.3, pan: -0.2 + i * 0.2 }));
  else if (e.kind === 'pop') s.play('pop', e.t, { freq: 520, sweep: 4 }, { gain: -20, send: 0.15 });
  else if (e.kind === 'fuse') {
    s.play('tom', e.t, { freq: 170 + 12 * (fuseN % 4), decay: 0.12 }, { gain: -13 + 4 * (g - 1), send: 0.12 });
    s.play('rim', e.t, { freq: 1900 + 80 * (fuseN % 3), seed: fuseN % 4 }, { gain: -17 + 3 * (g - 1), pan: 0.1, send: 0.1 });
    // A breath before the landing: the music dips 5 dB over the 70 ms before it and is back by the landing frame.
    s.duck(e.t - 0.035, { depth: -5, attack: 0.04, hold: 0, release: 0.03 });
    s.play('marimba', e.t, { freq: EB[fuseN % EB.length], dur: 0.5, hardness: 0.35 }, { gain: -25 + 4 * (g - 1), send: 0.3, pan: 0.15 });
    fuseN++;
  } else if (e.kind === 'chime') {
    // the summary's single chime with a woody click (2026-10-19: at −19 dB alone it rose only 2.6 dB out of the bed
    // where a token-sweep hands over to it) and the probe's rolled triad
    s.play('chime', e.t, { freq: note('Bb5'), notes: g < 1 ? 1 : 3 }, { gain: -14, send: 0.35 });
    if (g < 1) s.play('rim', e.t, { freq: 2100, seed: 3 }, { gain: -17, send: 0.1 });
    s.duck(e.t, { depth: -3, release: 0.6 });
  } else if (e.kind === 'path') {
    // path-type: a rising then falling whoosh with the sentence's flow round the loop
    s.play('whoosh', e.t, { dur: e.dur * 0.5, up: true, lo: 320, hi: 3000, q: 0.9, peak: 0.75 }, { gain: -25, send: 0.25, pan: -0.15 });
    s.play('whoosh', e.t + e.dur * 0.5, { dur: e.dur * 0.45, up: false, lo: 320, hi: 3000, q: 0.9, peak: 0.35 }, { gain: -27, send: 0.25, pan: 0.15 });
  } else if (e.kind === 'sweep') {
    // token-sweep: ticks up the scale as the bars rise, down as they fall (the bar's cells counting)
    for (let i = 0; i < 8; i++) s.play('tick', e.t + (i * e.dur) / 16, { freq: 1500 * 2 ** (i / 8), decay: 0.01, noise: 0.1 }, { gain: -24, pan: -0.4 + i * 0.1 });
    for (let i = 0; i < 8; i++) s.play('tick', e.t + e.dur / 2 + (i * e.dur) / 16, { freq: 3000 * 2 ** (-i / 8), decay: 0.01, noise: 0.1 }, { gain: -25, pan: -0.4 + i * 0.1 });
  } else if (e.kind === 'flow') {
    // trace-flow: an airy whoosh following the front across the frame
    s.play('whoosh', e.t, { dur: e.dur, up: true, lo: 260, hi: 4200, q: 0.8, peak: 0.5 }, { gain: -23, send: 0.3 });
  } else if (e.kind === 'scramble') {
    // the unseen word resolving: a quiet glitch under it, a tick as its last letter locks
    s.play('glitch', e.t, { dur: e.dur, rate: 24 }, { gain: -33, send: 0.1 });
    s.play('tick', e.t + e.dur, { freq: 2800, decay: 0.008, noise: 0.2 }, { gain: -22 });
  } else if (e.kind === 'chord') {
    s.play('keys', e.t, { freqs: ['Eb3', 'Bb3', 'D4', 'G4', 'F5'].map(note), dur: 3, hardness: 0.3 }, { gain: -14, send: 0.4 });
    s.play('chime', e.t, { freq: note('F6'), decay: 0.5 }, { gain: -23, send: 0.35 }); // a glassy top so the claim's turn has a bright onset
  }
}

// The closing second motion on the last downbeat.
if (S.ending?.t != null) s.play('bell', S.ending.t, { freq: note('Bb5'), dur: 1.6, index: 1.0 }, { gain: -24, send: 0.4 });

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(((snd.tone ?? 'v2') === 'v2') ? { tone: 'v2' } : {}) });
await writeMeasure('.', r, { duration: S.T.duration, bpm: S.g.bpm });
