// score.mjs — the film's sound, on the same beat grid as the picture.
// Bed: the shared `data` preset (soft muted four-on-the-floor, plucked arpeggio, warm pad), or a generated
// music file via content.bed = { file: 'assets/audio/bed.wav', offset: <s> } at the same bpm.
// Effects come from timeline.js events: count ticks that thin out with the counter's ease, a thud on every
// landing (band, bar, segment, column, closing number), the accent chime, a whoosh on every regroup, a soft rising
// pluck when squares take the accent colour (mark) and a falling one when they give it back (unmark); the devices'
// own sounds (references/transitions.md): a tick per roulette hop and a stamp on the lock, a braking tick roll for
// the stream, ticks and a swell for the re-encode, a tick per step of the step-wipe and a stamp as it lands, a tick
// roll for tally-flip, a quiet glitch for dither-sweep, the faintest pluck for a glint. The closing
// chime on the last downbeat is softer, because the outro's resolving chord lands under it. Energy is a tension
// curve: quiet on the count, building through the chapters, highest on the surprise (axis). Writes
// assets/audio/mix.wav (−14 LUFS, ≤ −1.5 dBTP) and assets/audio/measure.json.
// content.sound.tone: 'v2' (default) is the spectral balance and mastering chain chosen 2026-10-18; 'v1' is the
// earlier mix (blueprint keeps 'v1' by default, see its TEMPLATE.md).
import film from './content.js';
import { model } from './compute.js';
import { plan } from './timeline.js';
import { fit } from './lib/timing.js';
import rules from './timing.rules.js';
import { validate } from './tools/validate.mjs';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';
import { mkdir } from 'node:fs/promises';

const errors = await validate(film, { quiet: true });
if (errors.length) {
  console.error('content.js has errors; run `npm run validate`:\n  ' + errors.join('\n  '));
  process.exit(1);
}

const m = model(film);
const F = fit(film, rules); // the same fitted scenes, bpm and length as the picture
const P = plan(film, m, F);
const s = new Score({ duration: F.duration, grid: P.g });
const snd = film.sound || {};
const variant = { ...(((snd.tone ?? 'v2') === 'v2') ? { mix: 'v2' } : {}) };

// Music: the first chapter is the intro, the closing chapter the outro; reading chapters get a break and the
// surprise (axis) gets the drop. content.scenes[i].music overrides. Sections follow the fitted bars, so the bed
// fits any whole number of bars; the total is a whole 2-bar phrase.
const KIND = { count: 'intro', columns: 'build', share: 'build', timeline: 'build', trend: 'build', list: 'build', split: 'break', axis: 'drop', close: 'outro' };
const TENSION = { count: 0.45, columns: 0.5, share: 0.55, timeline: 0.55, trend: 0.6, list: 0.7, split: 0.5, axis: 0.85, close: 0.5, ...(film.tension || {}) };
const sections = P.chapters.map((c, i) => ({
  from: c.startBar,
  to: c.startBar + c.bars,
  kind: c.music ?? (i === 0 ? 'intro' : KIND[c.type]),
  energy: i === 0 ? Math.min(TENSION[c.type] ?? 0.45, 0.45) : TENSION[c.type] ?? film.energy ?? 0.55,
}));
if (film.bed?.file) s.addFile(film.bed.file, 0, { offset: film.bed.offset ?? 0, gain: film.bed.gain ?? 0 });
else s.beds.data({ sections, seed: film.seed, ...variant });

// thud pitches walk up the F lydian scale so a run of landings reads as a phrase
const STEP = [0, 2, 4, 6, 7, 9, 11, 12, 14];
for (const e of P.events) {
  if (e.kind === 'tick') s.play('tick', e.t, { freq: 3000 + 140 * (e.gain ?? 1) }, { gain: -19 + 6 * ((e.gain ?? 1) - 1), pan: -0.15 });
  else if (e.kind === 'thud') {
    s.play('thud', e.t, { freq: 62 * Math.pow(2, STEP[(e.pitch ?? 0) % STEP.length] / 24) }, { gain: -13 + 4 * ((e.gain ?? 1) - 1) });
    s.play('pluck', e.t, { freq: 349.23 * Math.pow(2, STEP[(e.pitch ?? 0) % STEP.length] / 12), dur: 0.5, bright: 0.35 }, { gain: -27, send: 0.25, pan: 0.1 });
  } else if (e.kind === 'whoosh') s.play('whoosh', e.t - 0.05, { dur: 0.75, lo: 250, hi: 4200 }, { gain: -21, send: 0.2 });
  else if (e.kind === 'chime') {
    const closing = e.t >= F.duration - F.bar - 1e-6; // the last downbeat
    s.play('chime', e.t, { freq: 1396.9, notes: e.climax ? 3 : 1 }, { gain: closing ? -20 : -15, send: 0.35 });
    if (e.climax) s.play('impact', e.t, { freq: 46, decay: 0.8 }, { gain: -12 }); // the climax's reveal: the film's hit
    s.duck(e.t, { depth: -3, release: 0.5 });
  } else if (e.kind === 'mark') {
    s.play('pluck', e.t, { freq: 698.46, dur: 0.6, bright: 0.55 }, { gain: -15, send: 0.25, pan: 0.15 });
    s.play('pluck', e.t + 0.04, { freq: 1046.5, dur: 0.6, bright: 0.55 }, { gain: -19, send: 0.25, pan: 0.25 });
    s.play('tick', e.t, { freq: 3400, decay: 0.006 }, { gain: -22 });
    s.duck(e.t - 0.035, { depth: -5, attack: 0.04, hold: 0, release: 0.03 }); // a 70 ms breath before it, so it reads over the bed
  } else if (e.kind === 'hop') {
    // the roulette frame: a tick per hop (references/transitions.md roulette-lock), climbing as the lap goes on
    s.play('tick', e.t, { freq: 2600 + 90 * (e.k % 10), decay: 0.008 }, { gain: -21, pan: 0.2 });
  } else if (e.kind === 'stamp') {
    s.play('stamp', e.t, { freq: 760, to: 160, decay: 0.07 }, { gain: -16, send: 0.15 });
  } else if (e.kind === 'stream') {
    // the stream runs and brakes: a falling whoosh and a tick roll that slows with the brake (exponential, k 4.5)
    s.play('whoosh', e.t, { dur: e.dur, up: false, lo: 300, hi: 5200 }, { gain: -22, send: 0.15 });
    for (let j = 0; j < 12; j++) { const u = j / 12; s.play('tick', e.t + e.dur * (-Math.log(1 - u * (1 - Math.exp(-4.5))) / 4.5), { freq: 3300, decay: 0.005 }, { gain: -26 - j, pan: -0.1 }); }
  } else if (e.kind === 'reencode') {
    // bars to points: a short run of ticks with the points; a swell under the curve that stops as it ends
    for (let j = 0; j < Math.min(12, e.n); j++) s.play('tick', e.t + (0.3 * e.dur * j) / Math.max(1, Math.min(12, e.n) - 1), { freq: 2900 + 60 * j, decay: 0.007 }, { gain: -24, pan: -0.3 + (0.6 * j) / 12 });
    s.play('swell', e.t + e.dur * 0.5, { freqs: [349.23, 440, 523.25], dur: e.dur * 0.5, cutoff: 2200 }, { gain: -24, send: 0.3 });
  } else if (e.kind === 'step') {
    // the staircase front: a tick per step as it passes
    for (let j = 0; j < e.n; j++) s.play('tick', e.t + (e.dur * (j + 0.5)) / e.n, { freq: 2400 + 120 * j, decay: 0.006 }, { gain: -23, pan: -0.4 + (0.8 * j) / Math.max(1, e.n - 1) });
  } else if (e.kind === 'flip') {
    // tally-flip: a soft tick roll, one tick per row of tiles as the wave passes
    for (let j = 0; j < 9; j++) s.play('tick', e.t + e.dur * (0.1 + 0.62 * j / 8 + 0.08), { freq: 2200 + 80 * j, decay: 0.006 }, { gain: -25 });
  } else if (e.kind === 'dither') {
    s.play('glitch', e.t + 0.05, { dur: Math.min(0.5, e.dur * 0.6), rate: 24 }, { gain: -28, send: 0.1 });
  } else if (e.kind === 'glint') {
    // a glint: the faintest high pluck, so the eye's change has an ear's too
    s.play('pluck', e.t, { freq: 1396.9, dur: 0.4, bright: 0.3 }, { gain: -31, send: 0.35, pan: 0.3 });
  } else if (e.kind === 'unmark') {
    s.play('pluck', e.t, { freq: 1046.5, dur: 0.5, bright: 0.4 }, { gain: -17, send: 0.25, pan: -0.15 });
    s.duck(e.t - 0.035, { depth: -5, attack: 0.04, hold: 0, release: 0.03 });
    s.play('pluck', e.t + 0.04, { freq: 698.46, dur: 0.5, bright: 0.4 }, { gain: -21, send: 0.25, pan: -0.25 });
  }
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const measured = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(((snd.tone ?? 'v2') === 'v2') ? { tone: 'v2' } : {}) });
await writeMeasure('.', measured, { duration: F.duration, bpm: F.bpm }); // assets/audio/measure.json (nothing on screen quotes it)
