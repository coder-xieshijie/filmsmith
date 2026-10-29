// score.mjs — Split sound: the `terminal` bed (lib/audio beds: a pulsing saw figure over an 8-bar progression in A minor:
// the input side is a shell) on the film's beat grid, and the sounds of the keyboard and the seam on the frames film.js
// draws them (choreo.js plan1, scene starts from lib/timing.js fit()).
//
//   node score.mjs        → assets/audio/mix-raw.wav, assets/audio/mix.wav (−14 LUFS, ≤ −1.5 dBTP, AAC-checked), measure.json
//
// The arrangement follows the scenes: an intro under the request, a build through pick, file and render, the drop from
// the diff into its climax (the melodic layer out while the claim is read), an outro under the lock-up. The sounds: a key
// click for every typed character (with a light duck of the pulse), a dry tick and a soft low body when the seam lands,
// a tick per louvre slat, a rim on each tick of a pick, an air sweep under each wipe line, the branch and the slider, an
// impact and a rolled chime with a duck on the climax, a bell on the lock-up's name.
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import rules from './timing.rules.js';
import { grid } from './lib/beat.js';
import { fit } from './lib/timing.js';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';
import { plan1, CPS } from './choreo.js';
import { moveOf } from './moves.js';

const T = fit(film, rules);
const g = grid({ bpm: T.bpm });
const B = T.beat, BAR = T.bar, DUR = T.duration;
const S = film.scenes.map((s, i) => ({ s, start: T.scenes[i].start, end: T.scenes[i].end, P: plan1(film, film.scenes, i, B, T.scenes[i].end - T.scenes[i].start, T.scenes[i].start) }));
const s = new Score({ duration: DUR, grid: g });
const snd = film.sound || {};

// ---------------------------------------------------------------- the bed (sections in bars, from the fitted scenes)
const KIND = { request: 'intro', pick: 'build', file: 'build', render: 'build', diff: 'drop', lockup: 'outro' };
const ENERGY = { request: 0.35, pick: 0.52, file: 0.55, render: 0.62, diff: 0.82, lockup: 0.5 };
const sections = [];
for (const x of S) {
  if (x.s.type === 'diff') {   // the drop, then the claim read with the melody out
    const c = x.start + x.P.slide[1];
    sections.push({ from: x.start / BAR, to: c / BAR, kind: 'drop', energy: ENERGY.diff });
    sections.push({ from: c / BAR, to: x.end / BAR, kind: 'drop', energy: ENERGY.diff + 0.05, reading: true });
  } else sections.push({ from: x.start / BAR, to: x.end / BAR, kind: KIND[x.s.type], energy: ENERGY[x.s.type] });
}
s.beds[snd.bed ?? 'terminal']({ key: snd.key ?? 'A', seed: snd.seed ?? film.seed ?? 5, mix: snd.tone === 'v1' ? undefined : 'v2', sections });

// ---------------------------------------------------------------- the keyboard and the seam
const fx = (name, t, vo = {}, mo = {}) => s.play(name, Math.max(0, t), vo, { send: 0.1, ...mo });
const typing = (str, t0, cps, gain = -27) => {
  for (let i = 0; i < str.length; i++) if (str[i] !== ' ') fx('typeKey', t0 + (i + 0.5) / cps - 0.01, { seed: i }, { gain, pan: -0.15 });
  s.duck(t0, { depth: -2, hold: str.length / cps, release: 0.2, bus: 'pump' });
};
const sweep = (t, dur, up, gain, pan = 0) => fx('whoosh', t + 0.05, { dur: dur * 0.85, up, lo: 350, hi: 5200, peak: 0.5 }, { gain, pan });
for (const x of S) {
  const t0 = x.start, P = x.P, sc = x.s;
  if (sc.type === 'request') {
    typing(sc.prompt, t0 + 0.25 * B, CPS);
    fx('whoosh', t0 + P.open[0], { dur: 0.75 * B, up: true, lo: 600, hi: 5000, peak: 0.8 }, { gain: -24 });
    fx('whoosh', t0 + P.land + 0.02, { dur: 0.5, up: false, lo: 400, hi: 3000, peak: 0.2 }, { gain: -26, pan: 0.35 });
  }
  if (sc.type === 'pick') {
    P.hops.slice(1).forEach((h) => fx('rim', t0 + h, { freq: 1500 }, { gain: -22, pan: -0.3 }));
    P.results.forEach((r) => {
      if (!r.move) return;
      if (r.move.role === 'change') { const m = moveOf(film, 'change'); const n = m.params.n ?? 9; for (let i = 0; i < n; i++) fx('tick', t0 + r.at + i * (m.params.stagger ?? 0.07) * r.move.dur + 0.25, { freq: 2600 + i * 90, decay: 0.008 }, { gain: -22, pan: 0.3 }); }
      else fx('whoosh', t0 + r.at, { dur: 0.36, up: true, lo: 500, hi: 3500 }, { gain: -25, pan: 0.3 });
    });
  }
  if (P.wipe) sweep(t0, P.wipe[1] - P.wipe[0], sc.type === 'lockup', -19, sc.type === 'lockup' ? -0.3 : 0);
  if (sc.type === 'render') {
    fx('whoosh', t0, { dur: 0.45, up: true, lo: 400, hi: 3200, peak: 0.6 }, { gain: -23 });
    fx('whoosh', t0 + P.branch[1] / 2, { dur: 0.45, up: false, lo: 300, hi: 2600, peak: 0.7 }, { gain: -23, pan: 0.3 });
    typing(sc.command, t0 + P.cmdAt, CPS);
    P.lines.forEach((l) => fx('tick', t0 + l + 0.3, { freq: 3400, decay: 0.005 }, { gain: -26, pan: 0.4 }));
  }
  if (sc.type === 'diff') {
    typing(sc.line.after, t0 + P.plusAt, P.plusCps);
    sweep(t0 + P.slide[0], P.slide[1] - P.slide[0], true, -20, -0.2);
  }
  if (sc.type === 'lockup') {
    typing(sc.command, t0 + P.cmdAt, CPS, -29);
    if (P.close) fx('whoosh', t0 + P.close[0], { dur: 0.45, up: true, lo: 500, hi: 3600, peak: 0.7 }, { gain: -23, pan: 0.4 });
  }
  for (const k of P.keys) {
    const t = t0 + k.t;
    if (k.kind === 'claim') {
      s.duck(t - 0.1, { depth: -5, hold: 0.1, release: 0.8 });
      fx('impact', t, { freq: 46, decay: 0.8 }, { gain: -9 });
      fx('chime', t, { notes: 3, freq: 1318.5 }, { gain: -16, send: 0.3 });
    } else if (sc.type === 'lockup' && Math.abs(k.t - (P.nameAt + 0.5 * B)) < 1e-6) {
      fx('bell', t, { freq: 880, dur: 2.4 }, { gain: -16, send: 0.35 });
      fx('thud', t, { freq: 66 }, { gain: -13 });
    } else if (sc.type === 'request') {
      fx('chime', t, { freq: 1760 }, { gain: -15, send: 0.3 });
      fx('thud', t, { freq: 62 }, { gain: -13 });
      fx('tick', t, { freq: 3000 }, { gain: -14 });
    } else {
      fx('tick', t, { freq: k.kind === 'accent' ? 2900 : 2400 }, { gain: -13 });
      fx('thud', t, { freq: 88, decay: 0.08 }, { gain: -18 });
    }
  }
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, tone: snd.tone === 'v1' ? undefined : 'v2' });
await writeMeasure('.', r, { duration: DUR });
