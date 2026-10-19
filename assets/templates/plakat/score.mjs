#!/usr/bin/env node
// score.mjs — plakat sound. Builds the marimba / wood bed and one effect per picture landing, from the same
// plan the picture uses (scenes.js planFilm → lib/timing.js fit()), then masters to −14 LUFS, true peak ≤ −1.5 dBTP,
// and writes assets/audio/measure.json with the measured loudness.
//   node score.mjs                → assets/audio/mix.wav
//   node score.mjs --stem fx|bed  → assets/audio/stem-<fx|bed>.wav, unmastered, for checking levels by measurement
// content.sound.tone: 'v2' (default) is the spectral balance and mastering chain chosen 2026-10-18; 'v1' is the
// earlier mix (blueprint keeps 'v1' by default, see its TEMPLATE.md).
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import { planFilm } from './scenes.js';
import { events } from './lib/timing.js';
import rules from './timing.rules.js';
import { Score, master, writeMeasure, mtof } from './lib/audio/index.mjs';

const plan = planFilm(film);
plan.warnings.forEach((w) => console.warn('warn:', w));
if (plan.errors.length) {
  plan.errors.forEach((e) => console.error('error:', e));
  process.exit(1);
}
const { g, laid, cues } = plan;
const s = new Score({ duration: plan.duration, grid: g });
console.log(`${g.bpm} bpm · ${plan.bars} bars · ${plan.duration.toFixed(3)} s`);
const snd = film.sound || {};
const variant = { ...(((snd.tone ?? 'v2') === 'v2') ? { mix: 'v2' } : {}) };
const si = process.argv.indexOf('--stem');
const stem = si > 0 ? process.argv[si + 1] : null;

// ---------- music bed ----------
// Scene type → bed section kind. Consecutive scenes of one kind share a section; the bed's chord parts alternate
// by 4-bar phrase and its progression runs on across chapters (it restarts at a drop that follows another kind).
// Energy is a tension curve: it rises with every chapter (TENSION + 0.04 per chapter) and peaks on the tagline.
// A drop scene whose primary text takes 60 % or more of its length is a reading drop (the marimba line rests,
// wood, bass and kick stay). The install break is the film's one pad-only break; its last bar builds back, so
// the tagline's drop does not return from silence: an intro bar (marimba and its bass), then a build bar (light
// kick and wood), each step at most about 5 LU.
const KIND = { problem: 'build', claim: 'build', figure: 'build', chapter: 'drop', options: 'drop', document: 'drop', matrix: 'drop', verify: 'drop', flow: 'drop', slot: 'drop', bars: 'drop', words: 'drop', install: 'break', tagline: 'drop', end: 'outro', ...(snd.kinds || {}) };
const TENSION = { problem: 0.45, claim: 0.5, chapter: 0.55, options: 0.55, document: 0.55, matrix: 0.55, slot: 0.58, bars: 0.58, verify: 0.6, flow: 0.62, figure: 0.66, words: 0.8, install: 0.55, tagline: 0.85, end: 0.5, ...(snd.energies || {}) };
const sections = [];
let chapters = 0;
for (const sc of laid) {
  const kind = KIND[sc.type] || 'drop';
  if (sc.type === 'chapter') chapters++;
  const energy = Math.min(0.9, (TENSION[sc.type] ?? snd.energy ?? 0.55) + (sc.type === 'tagline' ? 0 : 0.04 * Math.max(0, chapters - 1)));
  const reading = kind === 'drop' && (sc.timing?.reading?.primary ?? 0) / sc.dur >= 0.6;
  let from = sc.startBar;
  const to = sc.startBar + sc.bars;
  if (kind === 'break' && laid[sc.index + 1]?.type === 'tagline' && sc.bars >= 3) {
    sections.push({ from, to: to - 2, kind, energy }, { from: to - 2, to: to - 1, kind: 'intro', energy: 0.4 }, { from: to - 1, to, kind: 'build', energy: 0.6 });
    continue;
  }
  const last = sections[sections.length - 1];
  if (last && last.kind === kind && !!last.reading === reading && Math.abs(last.to - from) < 1e-9) { last.to = to; last.energy = Math.max(last.energy, energy); }
  else sections.push({ from, to, kind, energy, reading });
}
if (stem === 'fx') { /* effects only */ }
else if (film.bed?.file) await s.addFile(film.bed.file, 0, { offset: film.bed.offset || 0, gain: film.bed.gain || 0 });
else s.beds[snd.preset || 'swiss']({ sections, key: snd.key || 'C', seed: film.seed, gain: snd.bedGain ?? -4, ...variant });
console.log('bed sections:', sections.map((x) => `${x.kind}@${x.from}-${x.to}`).join(' '));

// ---------- effects on picture landings ----------
// C major pentatonic, for counters that step upward.
const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91];
// Levels were set by measurement (node score.mjs --stem fx / --stem bed): accent hits peak at or just above the bed,
// counters and ticks 3–6 dB under it, brushes and cursor hops about 8 dB under. S12 (2026-10-18): the block marimba,
// the toms and thuds are 3–4 dB and the full-width wipe 4–7 dB lower than first set, so landings stop jumping 9–13 LU over
// the bed. Ink blocks (cue `ink`, an ink-coloured block that is not a person's decision) keep only the swish: the
// marimba stroke is kept for the accent colour's meaning, a person and their decision.
const fx = {
  land: (t, o) => o.low
    ? (s.play('tom', t, { freq: 98, decay: 0.32 }, { gain: -13, send: 0.15 }), s.play('thud', t, { freq: 62, decay: 0.16 }, { gain: -13 }), s.duck(t, { depth: -4, attack: 0.01, release: 0.3 })) // the music makes room for the low landing (it falls on the bed's downbeat)
    : s.play('thud', t, { freq: 84, decay: 0.1 }, { gain: -13, send: 0.08 }),
  tick: (t, o) => s.play('rim', t, { freq: o.soft ? 1900 : 1550, seed: Math.round(t * 100) % 4 }, { gain: o.soft ? -16 : -12, pan: 0.2, send: 0.12 }),
  count: (t, o) => {
    s.play('marimba', t, { freq: mtof(PENTA[Math.min(PENTA.length - 1, o.i)]), dur: 0.5, hardness: 0.85 }, { gain: -13, pan: -0.2 + 0.08 * o.i, send: 0.18 });
    s.play('tick', t, { freq: 3000, decay: 0.005 }, { gain: -20 });
  },
  // accent block wiping in: a short swish into a bright marimba stroke (the human's decision)
  block: (t, o) => {
    if (o.ink) return s.play('whoosh', t - 0.08, { dur: 0.3, lo: 500, hi: 2500 }, { gain: -16 });
    s.play('whoosh', t - 0.1, { dur: 0.28, lo: 700, hi: 4500 }, { gain: -16, pan: -0.3 });
    s.play('marimba', t + 0.06, { freq: mtof([79, 84, 88, 91][Math.min(3, o.i ?? 0)]), dur: 0.9, hardness: 0.9 }, { gain: -12, send: 0.25 });
  },
  // full-width accent wipe: swept noise that peaks as the block covers the frame, a soft low landing on the cut
  wipe: (t, o) => {
    const d = o.short ? 0.5 : 0.45;
    s.play('whoosh', t - 0.05, { dur: d + 0.15, lo: 250, hi: 5000, q: 1.0 }, { gain: o.short ? -14 : -15, send: 0.2 });
    s.play('thud', t + d, { freq: 64, decay: 0.18 }, { gain: -15 });
  },
  slide: (t) => s.play('whoosh', t, { dur: 0.35, up: false, lo: 400, hi: 3200 }, { gain: -14, pan: 0.2 }),
  draw: (t) => s.play('whoosh', t, { dur: 0.5, lo: 1800, hi: 7000, q: 0.8, peak: 0.5 }, { gain: -20, pan: 0.3 }),
  scan: (t) => s.play('whoosh', t, { dur: 1.0, up: false, lo: 900, hi: 4200, q: 1.4, peak: 0.85 }, { gain: -12, send: 0.2 }),
  stamp: (t) => { s.play('stamp', t, { freq: 760, to: 130, decay: 0.09 }, { gain: -8, send: 0.12 }); s.duck(t, { depth: -5, attack: 0.01, hold: 0.12, release: 0.4 }); },
  type: (t, o) => { const n = Math.round(o.dur * 72); for (let i = 0; i < n; i += 2) s.play('typeKey', t + i / 72, { seed: i + 11 }, { gain: -20 - (i % 4), pan: 0.25 }); },
  step: (t, o) => s.play('rim', t, { freq: 2300, seed: (o.i ?? 0) % 4 }, { gain: -14, pan: -0.25 + 0.1 * ((o.i ?? 0) % 6), send: 0.1 }),
  // the devices (references/transitions.md, Sound): each T2 lands with a sound on its beat
  // plakat-columns: one stamp on the downbeat where the first column starts, a low tick on every third column
  columns: (t, o) => {
    s.play('stamp', t, { freq: 520, to: 110, decay: 0.08 }, { gain: -12, send: 0.1 });
    for (const c of [3, 6, 9]) s.play('rim', t + c * 0.05 * o.dur, { freq: 1300, seed: c }, { gain: -19, pan: -0.4 + c * 0.08 });
  },
  // step-wipe: a tick per step as the front passes, a stamp as it lands
  steps: (t, o) => {
    const n = o.n ?? 4, d = g.beat;
    for (let i = 0; i < n; i++) s.play('rim', t + (d * 0.85 * (i + 1)) / n, { freq: 1800 + 120 * i, seed: i }, { gain: -16, pan: -0.3 + (0.6 * i) / n });
    s.play('stamp', t + d, { freq: 700, to: 140, decay: 0.07 }, { gain: -12 });
  },
  // counter-portal: a rising whoosh landing on the beat where the push ends
  portal: (t, o) => { s.play('whoosh', t, { dur: o.dur, up: true, lo: 250, hi: 6500, q: 0.9, peak: 0.92 }, { gain: -12, send: 0.2 }); s.play('thud', t + o.dur, { freq: 58, decay: 0.2 }, { gain: -12 }); },
  // plakat-reblock: a swept whoosh while the block crosses the cut; an ink block (the tagline's bar) lands with a low
  // thud on the beat, the accent block (the flow's YOU node) with the block cue's marimba stroke on the same beat
  reblock: (t, o) => {
    s.play('whoosh', t - 0.04, { dur: o.dur + 0.04, lo: 300, hi: 4200, q: 1.0, peak: 0.8 }, { gain: -14, send: 0.18 });
    if (o.ink) s.play('thud', t + o.dur, { freq: 66, decay: 0.16 }, { gain: -14 });
  },
  // slot-rails: a soft tick per word through the slot
  rail: (t, o) => s.play('rim', t, { freq: 1650 + 90 * ((o.i ?? 0) % 5), seed: (o.i ?? 0) % 4 }, { gain: -14, pan: 0.15, send: 0.1 }),
  // aperture-swap: a muted kick and a tick per word on the beat (the accent ground, the person, takes the block's marimba)
  ap: (t, o) => { s.play('kick', t, { muted: true, f0: 120, f1: 50, decay: 0.12 }, { gain: -16 }); s.play('tick', t, { freq: 3400 }, { gain: -18 }); },
};
let n = 0;
for (const c of stem === 'bed' ? [] : cues) {
  if (!fx[c.kind]) { console.warn('no sound for cue', c.kind); continue; }
  fx[c.kind](c.t, c);
  n++;
}
console.log(`${n} effects on ${cues.length} cues`);

// ---------- key events (timing.json): a high woodblock on every turn ----------
// Chapter, claim and tagline turns land on a tom / thud or a slide, all under 1.5 kHz; the woodblock gives each turn
// an onset the ear (and check-film) can place.
if (stem !== 'bed') for (const key of events(plan.fit, film, rules).keys) if (key.kind === 'turn') s.play('rim', key.t, { freq: 2600, seed: key.scene % 4 }, { gain: -19, pan: 0.15, send: 0.12 });

await mkdir('assets/audio', { recursive: true });
if (stem) { await s.write(`assets/audio/stem-${stem}.wav`); process.exit(0); }
await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(((snd.tone ?? 'v2') === 'v2') ? { tone: 'v2' } : {}) });
await writeMeasure('.', r, { duration: plan.duration, bpm: g.bpm });
if (!r.ok) { console.error('master: loudness target missed', r); process.exit(1); }
