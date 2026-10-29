// score.mjs — sound for phosphor: the `terminal` bed on the film's beat grid plus one effect for every
// picture event. Scene lengths come from lib/timing.js fit() with timing.rules.js and event times from
// events.js, the same modules the picture uses, so they cannot drift. `npm run audio` runs lib/fit.mjs first
// (which stamps the fitted duration onto index.html). Writes assets/audio/mix.wav at -14 LUFS, true peak
// <= -1.5 dBTP, and assets/audio/measure.json with the measured loudness.
//
// Music sections follow the scenes, in whole or fractional bars of the fitted grid, so any length works. Each
// section carries a kind, a target energy (TENSION: low at the opening, rising by chapter, highest on the
// claim) and a reading flag: a scene whose primary text takes 60 % or more of its length keeps the groove but
// drops the pulse (the bed's reading drop). Intro under the opening, build under the hero, the first chapter
// and its decide, a pad-only break under a chapter card with `musicRest` for as long as the card holds, the
// groove from the second chapter on, except that the flow chapter is a build and the compare chapter drops
// only when its counter lands; a break under the install commands until the bar line where the steps drop, a
// one-bar build under the tagline and the drop on the claim. The progression runs on across sections and
// restarts only at a drop or the outro.
// Effects: one per picture event; the bed's pump bus dips 4 dB while keys are typed (so the keystrokes are
// heard over the 16th pulse); every turn and accent key also gets a short bright tick, so each turn has an
// onset above 1.5 kHz.
// content.bed = { file, offset } replaces the bed with a generated track (keep content.bpm = its tempo).
// content.sound.tone: 'v2' (default) is the spectral balance and mastering chain chosen 2026-10-18; 'v1' is the
// earlier mix (blueprint keeps 'v1' by default, see its TEMPLATE.md).
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import { fit, events } from './lib/timing.js';
import rules, { MUSIC } from './timing.rules.js';
import { plan } from './events.js';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';

const fitted = fit(film, rules);
if (fitted.notes.some((n) => n.level === 'error')) {
  console.error('fit() reports errors; run `npm run fit` and fix content.js first.');
  process.exit(1);
}
const { g, laid, cues } = plan(film, fitted);

const s = new Score({ duration: fitted.duration, grid: g });
const sound = film.sound || {};
const variant = { ...(((sound.tone ?? 'v2') === 'v2') ? { mix: 'v2' } : {}) };

// ---------------------------------------------------------------- music
const BASE = MUSIC; // timing.rules.js: the same sections mark the drops in renders/timing.json
const TENSION = { boot: 0.45, audit: 0.45, hero: 0.5, qa: 0.5, decide: 0.5, run: 0.55, pick: 0.6, scope: 0.65, freeze: 0.6, flow: 0.6, compare: 0.65, ends: 0.6, install: 0.65, 'horizon-tagline': 0.9, 'tunnel-tagline': 0.9, end: 0.5, ...(sound.tension || {}) };
const reads = (sc) => (sc.timing?.reading?.primary ?? 0) / sc.dur >= 0.6;
const atBar = (t) => (t - g.t0) / g.bar;
const sections = [];
for (const sc of laid) {
  const a = sc.startBar, z = sc.startBar + sc.bars;
  const kind = sc.music || BASE[sc.type] || 'build';
  const energy = TENSION[sc.type] ?? sound.energy ?? 0.55, reading = kind === 'drop' && reads(sc);
  let from = a;
  if (sc.T.musicRest) { from = a + sc.T.musicRest / g.bar; sections.push({ from: a, to: from, kind: 'break' }); }
  else if (sc.type.endsWith('tagline')) { sections.push({ from, to: a + 1, kind: 'build', energy: 0.7 }); from = a + 1; }
  else if (sc.type === 'compare' && !sc.music && sc.T.steps?.length) {
    // F18: the counter builds; the groove drops when its last count lands.
    const land = atBar(sc.start + sc.T.steps.at(-1));
    if (land > from && land < z) { sections.push({ from, to: land, kind: 'build', energy }); from = land; }
  }
  if (z > from) sections.push({ from, to: z, kind, energy, reading });
}
if (film.bed?.file) s.addFile(film.bed.file, 0, { offset: film.bed.offset ?? 0, gain: film.bed.gain ?? 0 });
else s.beds.terminal({ sections, key: sound.key ?? 'A', seed: film.seed ?? 1, gain: sound.bedGain ?? 0, ...variant });

// ---------------------------------------------------------------- effects, one per picture event
const dB = (x) => 20 * Math.log10(Math.max(1e-4, x));
let k = 0;
for (const c of cues) {
  const gain = dB(c.gain);
  const seed = ++k;
  switch (c.kind) {
    case 'type': {
      const n = Math.max(1, Math.round(c.dur * 16));
      for (let i = 0; i < n; i++) s.play('typeKey', c.t + (i * c.dur) / n, { seed: seed * 31 + i }, { gain: -27 + gain, pan: ((i % 5) - 2) * 0.06 });
      // D2: under the 16th pulse (build, drop) the keys were masked; dip the pump bus while they type.
      const sec = sections.findLast((x) => atBar(c.t) >= x.from - 1e-9);
      if (sec && ['build', 'drop'].includes(sec.kind) && !sec.reading) s.duck(c.t, { depth: -4, attack: 0.03, hold: Math.max(0, c.dur - 0.03), release: 0.2, bus: 'pump' });
      break;
    }
    case 'tick': s.play('tick', c.t, { freq: 2600, seed }, { gain: -19 + gain, send: 0.15 }); break;
    case 'pop': s.play('pop', c.t, { freq: 520, seed }, { gain: -17 + gain, send: 0.15 }); break;
    case 'count': s.play('tick', c.t, { freq: 1700 + 1400 * (c.gain - 0.5), seed }, { gain: -17, send: 0.1 }); break;
    case 'stamp': s.play('stamp', c.t, { seed }, { gain: -12 + gain, send: 0.2 }); break;
    case 'whoosh': s.play('whoosh', c.t - 0.12, { dur: 0.42, seed }, { gain: -21 + gain, send: 0.25 }); break;
    case 'glitch': s.play('glitch', c.t, { dur: 0.22, seed }, { gain: -21 + gain }); break;
    case 'rise': s.play('riser', c.t, { dur: c.dur, seed }, { gain: -17 + gain, send: 0.3 }); break;
    case 'rush':
      s.play('riser', c.t, { dur: c.dur, lo: 400, hi: 9000, seed }, { gain: -15 + gain, send: 0.3 });
      s.play('whoosh', c.t + c.dur - 0.5, { dur: 0.55, seed: seed + 1 }, { gain: -18 + gain, send: 0.3 });
      break;
    case 'impact':
      s.play('impact', c.t, { seed }, { gain: -9 + gain, send: 0.35 });
      s.duck(c.t, { depth: -5, release: 0.6 });
      break;
    case 'flash': s.play('impact', c.t, { freq: 60, decay: 0.4, seed }, { gain: -18 + gain, send: 0.3 }); break;
    case 'drop': s.play('impact', c.t, { decay: 0.5, seed }, { gain: -13 + gain, send: 0.3 }); break;
    // crt-collapse (T2): the deflection dies with a falling whoosh and a low thud on the dot; the next picture
    // powers on with a rising whoosh and a bright tick as the raster opens
    case 'crtOff':
      s.play('whoosh', c.t, { dur: Math.max(0.2, c.dur), up: false, lo: 200, hi: 4000, seed }, { gain: -19 + gain, send: 0.25 });
      s.play('thud', c.t + 0.86 * c.dur, { freq: 60, seed }, { gain: -15 + gain, send: 0.2 });
      break;
    case 'crtOn':
      s.play('whoosh', c.t, { dur: Math.max(0.2, c.dur), up: true, lo: 300, hi: 6000, seed }, { gain: -21 + gain, send: 0.25 });
      s.play('tick', c.t + 0.3 * c.dur, { freq: 3600, seed }, { gain: -20 + gain, send: 0.15 });
      break;
    case 'smear': s.play('glitch', c.t, { dur: Math.min(0.22, c.dur), seed }, { gain: -24 + gain }); s.play('whoosh', c.t, { dur: Math.max(0.2, c.dur), lo: 800, hi: 7000, seed: seed + 1 }, { gain: -22 + gain, send: 0.2 }); break; // slice-smear: the log's lines slide off
    case 'morph': s.play('whoosh', c.t, { dur: 0.35, lo: 500, hi: 3000, seed }, { gain: -25 + gain, send: 0.2 }); break; // the window reshapes (T1)
    case 'sweep': s.play('riser', c.t, { dur: Math.max(0.2, c.dur), lo: 600, hi: 3000, seed }, { gain: -24 + gain, send: 0.2 }); break; // the beam sweeps
    default: break; // 'rest' (the install break) is handled by the sections above
  }
}

// ---------------------------------------------------------------- key events (timing.json): a bright onset on every turn and accent
const { keys } = events(fitted, film, rules);
const near = (t, kinds, w = 0.05) => cues.some((c) => kinds.includes(c.kind) && Math.abs(c.t - t) <= w);
for (const key of keys) {
  if (!['turn', 'accent'].includes(key.kind)) continue;
  if (key.kind === 'turn' && !near(key.t, ['stamp', 'impact', 'drop'])) s.play('stamp', key.t, { seed: 700 + key.scene }, { gain: -15, send: 0.2 });
  s.play('tick', key.t, { freq: 4200, decay: 0.012, noise: 0.5, seed: 800 + key.scene }, { gain: key.kind === 'turn' ? -18 : -22, send: 0.12 });
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(((sound.tone ?? 'v2') === 'v2') ? { tone: 'v2' } : {}) });
await writeMeasure('.', r, { duration: fitted.duration, bpm: g.bpm });
