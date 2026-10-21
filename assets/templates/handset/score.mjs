// score.mjs — Handset sound: the `data` bed (lib/audio beds: a soft muted four-on-the-floor, a plucked up-down arpeggio,
// a warm pad, a round bass) on the film's beat grid, and the device's own sounds on the same frames film.js draws
// (choreo.js, scene starts from lib/timing.js fit()).
//
//   node score.mjs        → assets/audio/mix-raw.wav, assets/audio/mix.wav (−14 LUFS, ≤ −1.5 dBTP, AAC-checked), measure.json
//
// The arrangement follows the scenes: an intro under the wake, a build under the pushes, the groove from the first band
// or scroll to the claim (its melodic layer dropped while the claim is read), a build after it and an outro under the
// lock-up. The sounds belong to the device: a tick and a soft low body on each landing, a short sweep and a muted thock
// on a flip's swap frame (moves.js `swap`; device-flip's edge-on frame), a sweep under a page scroll, an impact and a rolled chime on the claim with a duck
// before it, a bell on the lock-up. No whoosh under every move.
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import rules from './timing.rules.js';
import { grid } from './lib/beat.js';
import { fit } from './lib/timing.js';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';
import { plan, movesOf } from './choreo.js';

const T = fit(film, rules);
const g = grid({ bpm: T.bpm });
const B = T.beat, BAR = T.bar, DUR = T.duration;
const S = plan(film, T.scenes, B, BAR).map((x, i) => ({ ...x, start: T.scenes[i].start, end: T.scenes[i].end }));
const s = new Score({ duration: DUR, grid: g });
const snd = film.sound || {};
const M = movesOf(film);

// ---------------------------------------------------------------- the bed (sections in bars, from the fitted scenes)
const KIND = { wake: 'intro', push: 'build', cut: 'build', flip: 'build', band: 'drop', scroll: 'drop', claim: 'drop', lockup: 'outro' };
const ENERGY = { wake: 0.35, push: 0.5, cut: 0.55, flip: 0.62, band: 0.72, scroll: 0.75, claim: 0.9, lockup: 0.5 };
const firstDrop = S.findIndex((x) => KIND[x.type] === 'drop');
const sections = S.map((x, i) => {
  let kind = KIND[x.type];
  // the groove runs from the first band or scroll to the claim; a push or flip inside that stretch keeps it
  const claimAt = S.findIndex((y) => y.type === 'claim');
  if (firstDrop >= 0 && i > firstDrop && (claimAt < 0 || i <= claimAt) && kind === 'build') kind = 'drop';
  if (claimAt >= 0 && i > claimAt && x.type !== 'lockup') kind = 'build';
  return { from: x.start / BAR, to: x.end / BAR, kind, energy: ENERGY[x.type], ...(x.type === 'claim' ? { reading: true } : {}) };
});
s.beds.data({ key: snd.key ?? 'F', seed: film.seed ?? 3, mix: snd.tone === 'v1' ? undefined : 'v2', sections });

// ---------------------------------------------------------------- the device's sounds
const fx = (name, t, vo = {}, mo = {}) => s.play(name, Math.max(0, t), vo, { send: 0.12, ...mo });
fx('thud', 0.02, { freq: 60 }, { gain: -22 });
for (const x of S) {
  const m = x.move;
  if (m && m.dur) {
    const t0 = x.start + m.t;
    if (m.kind === 'flip') {
      fx('whoosh', t0, { dur: 0.42, up: m.variant === 'right', lo: 400, hi: 3800 }, { gain: -20, pan: m.variant === 'right' ? 0.3 : -0.3 });
      fx('thud', t0 + (M.flip.swap ?? 0.5) * m.dur, { freq: 82, decay: 0.1 }, { gain: -13 });
    } else if (m.kind === 'scroll') fx('whoosh', t0 + 0.08, { dur: m.dur * 0.82, up: m.variant === 'up', lo: 500, hi: 6000, peak: 0.5 }, { gain: -19 });
    else fx('whoosh', t0, { dur: m.dur * 0.9, lo: 600, hi: 4200 }, { gain: -27 });
  }
  for (const k of x.keys ?? []) {
    const t = x.start + k.t;
    if (k.kind === 'claim') {
      s.duck(t - 0.12, { depth: -5, hold: 0.1, release: 0.8 });
      fx('impact', t, { freq: 46, decay: 0.8 }, { gain: -9 });
      fx('chime', t, { notes: 3, freq: 1046.5 }, { gain: -17, send: 0.3 });
    } else if (x.type === 'lockup' && k.kind === 'land') {
      fx('bell', t, { freq: 698.5, dur: 2.4 }, { gain: -16, send: 0.35 });
      fx('thud', t, { freq: 70 }, { gain: -14 });
    } else if (x.type === 'wake') {
      fx('chime', t, { freq: 1396.9 }, { gain: -15, send: 0.3 });
      fx('thud', t, { freq: 64 }, { gain: -14 });
    } else {
      fx('tick', t, { freq: k.kind === 'accent' ? 2900 : 2400 }, { gain: -13 });
      fx('thud', t, { freq: 90, decay: 0.08 }, { gain: -19 });
    }
  }
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, tone: snd.tone === 'v1' ? undefined : 'v2' });
await writeMeasure('.', r, { duration: DUR });
