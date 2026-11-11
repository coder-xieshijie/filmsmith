// score.mjs — the Strip sound: the `thread` bed (plucks over a soft four-on-the-floor: a reel's bed) on the film's
// beat grid, a dry mechanical click on every pull-down, and one effect for each picture event, all placed from the
// choreo.js plans at the fitted scene lengths (the module film.js draws from), so picture and sound cannot drift.
// Writes, in this order:
//   assets/audio/mix.wav       −14 LUFS, true peak ≤ −1.5 dBTP after the renderer's AAC (+ assets/audio/measure.json)
//   assets/audio/track.js      this film's own mix in the second around each intertitle's landing (208 RMS values):
//                              the optical track beside an intertitle on the strip is drawn from it. film.js reads it
//                              when present and draws those tracks blank when not (or when it was written for other
//                              lines), so every npm script that renders runs this file first (TEMPLATE.md, "Order")
//
// Arrangement, from the scenes: the opening run is the intro; the intertitles are the build with the reading drop;
// the frames scene builds harder; the punch is a break; the sheet's readings build again; under the pick the music
// rests while the picked film runs with its own sound (decoded from its `video`, when that file is at hand), or drops
// when it is not; the lock-up is the outro.
// content.sound = { bed, seed } picks another bed preset or seed; content.bed = { file, offset, gain } replaces the
// synthesised bed with a generated one.
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import film from './content.js';
import rules from './timing.rules.js';
import { fit, events } from './lib/timing.js';
import { grid } from './lib/beat.js';
import { build, C } from './choreo.js';
import { Score, master, writeMeasure, readAudio } from './lib/audio/index.mjs';

const T = fit(film, rules);
const errs = T.notes.filter((n) => n.level === 'error');
if (errs.length) { console.error(errs.map((n) => n.msg).join('\n')); process.exit(1); }
const g = grid({ bpm: T.bpm, beatsPerBar: T.beatsPerBar });
const B = T.beat, BAR = T.bar, D = T.duration;
const F = build(film, T);
const S = F.scenes;
const s = new Score({ duration: D, grid: g });
const snd = film.sound || {};
const at = (sc, b) => sc.start + b * B;

// the picked film's own sound, when its video is at hand (beside content.js, or in assets/video/)
const pk = F.pickScene;
const pickVideo = (() => {
  const v = pk && film.films[pk.film]?.video;
  return v ? [v, join('assets/video', v)].find((f) => existsSync(f)) ?? null : null;
})();

// ---------- the bed ----------
const bar = (t) => t / BAR;
const first = S.find((x) => x.type !== 'titles') ?? S.at(-1);
const frames = S.find((x) => x.type === 'frames'), punch = F.punchScene, sheet = S.find((x) => x.type === 'sheet');
const lock = S.at(-1);
const marks = [
  [0, 'intro', 0.55],
  [F.runIn ? F.runIn[1] : 0, 'build', 0.45, true],
  [frames?.start, 'build', 0.6],
  [punch?.start, 'break', 0.5],
  [sheet?.start, 'build', 0.5, true],
  [pk ? at(pk, pk.p.pick[1]) : null, pickVideo ? 'rest' : 'drop', 0.85],
  [pk ? at(pk, pk.p.back[0]) : null, 'build', 0.5],
  [lock.start, 'outro', 0.5],
].filter((m) => m[0] != null).sort((a, b) => a[0] - b[0]);
if (film.bed?.file) await s.addFile(film.bed.file, 0, { offset: film.bed.offset || 0, gain: film.bed.gain ?? -3 });
else {
  const sections = marks.map(([t, kind, energy, reading], k) => ({ from: bar(t), to: bar(marks[k + 1]?.[0] ?? D), kind, energy, ...(reading ? { reading: true } : {}) }))
    .filter((x) => x.to - x.from > 1e-6);
  s.beds[snd.bed ?? 'thread']({ mix: 'v2', seed: snd.seed ?? 5, sections });
}

// ---------- effects ----------
// the effects sit FX dB under their nominal gains: the claws are sharp clicks, and a mix that leans on them for its
// loudness needs a hard limiter, which an AAC encode then overshoots
const FX = snd.fx ?? -4, play = s.play.bind(s);
s.play = (v, t, p, o = {}) => play(v, t, p, { ...o, gain: (o.gain ?? 0) + FX });
const tick = (t, freq = 3200, gain = -17) => s.play('tick', t, { freq }, { gain, send: 0.05 });
// the claw: a dry two-part click (the pin seats, the frame registers)
const claw = (t, k = 0, gain = -15) => { s.play('tick', t, { freq: 2300 + 90 * (k % 5), decay: 0.004, noise: 0.5 }, { gain, send: 0.03 }); s.play('rim', t + 0.012, { freq: 820 }, { gain: gain - 3, send: 0.04 }); };
const land = (t, gn = -13) => { s.play('thud', t, { freq: 78, decay: 0.1 }, { gain: gn }); tick(t, 2800, -16); };
const pop = (t, f = 520, gn = -21) => s.play('pop', t, { freq: f }, { gain: gn, send: 0.1 });
const whoosh = (t, dur, up, gn = -19, lo = 300, hi = 5000) => s.play('whoosh', t, { dur, up, lo, hi, peak: up ? 0.7 : 0.35 }, { gain: gn, send: 0.15 });
const scribble = (t, dur, gn = -24) => s.play('whoosh', t, { dur, up: true, lo: 2200, hi: 7500, q: 2.2, peak: 0.5 }, { gain: gn, send: 0.05 });
const pencil = (t) => { s.play('rim', t, { freq: 1500 }, { gain: -14, send: 0.1 }); };

// the opening run: a projector at speed, braking, one click per frame line crossing the gate
if (F.runIn) {
  const [a, z] = F.runIn, n = C.runInCells;
  whoosh(Math.max(0, a), Math.min(1, z - a), false, -18, 250, 4500);
  for (let c = 1; c <= Math.floor(n); c++) { const x = (c - (n - Math.floor(n))) / n; if (x <= 0) continue; const p = 1 - Math.cbrt(1 - Math.min(1, x)); claw(a + p * (z - a), c, -19); }
  land(z);
}
// every later landing in the gate
const keyAt = new Set(events(T).keys.map((k) => Math.round(k.t * 1000)));
F.stops.forEach(([t], k) => { if (k || !F.runIn) claw(t, k, keyAt.has(Math.round(t * 1000)) ? -12 : -15); });
F.closeStops.forEach(([t], k) => claw(t, k + 2, -14));

for (const sc of S) {
  const p = sc.p, A = (b) => at(sc, b);
  for (const pk2 of p.peaks) if (pk2.kind === 'hook') { s.play('stamp', A(pk2.t), { freq: 1000, to: 260, decay: 0.05 }, { gain: -15 }); pop(A(pk2.t), 600, -19); }
  if (p.track) {
    s.play('swell', A(p.track[1]) - 0.75 * B / 0.5, { freqs: ['D4', 'F#4', 'A4'], dur: 0.75 }, { gain: -31, send: 0.3 });
    for (let i = 0; i < 6; i++) tick(A(p.track[0]) + i * ((p.track[1] - p.track[0]) * B) / 6, 3600 + 200 * i, -29);
  }
  if (sc.type === 'frames') for (const k of p.keys) s.play('thud', A(k.t), { freq: 82, decay: 0.08 }, { gain: -14 });
  if (sc.type === 'punch') {
    whoosh(A(p.punch[0]), 0.45, true, -17, 400, 6000); tick(A(p.punch[0]), 3400, -13);
    s.play('impact', A(p.punch[1]), { freq: 55, decay: 0.4 }, { gain: -15 }); tick(A(p.punch[1]), 3000, -15);
    whoosh(A(p.out[0]), 0.45, false, -19, 250, 4200);
    land(A(p.out[1]), -12);
  }
  if (sc.type === 'sheet') {
    pop(A(1), 560);
    if (p.extend) for (let i = 0; i < 6; i++) tick(A(p.extend[0] + i * (p.extend[1] - p.extend[0]) / 6), 2400 + 160 * i, -22);
    const L2 = p.captions[1]?.from;
    if (L2 != null) { s.play('stamp', A(L2), { freq: 1200, to: 300, decay: 0.05 }, { gain: -15 }); tick(A(L2), 3600, -13); }
    const rows = Object.keys(film.films).length;
    for (let i = 0; i < rows; i++) tick(A(p.lengths[0] + C.rowStep * i), 3000 + 60 * i, -25);
  }
  if (sc.type === 'pick') {
    pop(A(0), 640);
    pencil(A(p.loop[0])); scribble(A(p.loop[0]), C.loop * B);
    s.play('stamp', A(p.loop[1]), { freq: 1400, to: 420, decay: 0.04 }, { gain: -14 }); tick(A(p.loop[1]), 3800, -13);
    whoosh(A(p.stepBack[0]), 0.25, false, -25);
    s.play('riser', A(p.pick[1]) - 0.5, { dur: 0.5, lo: 500, hi: 6000 }, { gain: -23 });
    whoosh(A(p.pick[0]), 0.45, true, -18, 400, 6500);
    s.play('impact', A(p.pick[1]), {}, { gain: -12 }); s.play('chime', A(p.pick[1]), { notes: 3 }, { gain: -18, send: 0.35 }); tick(A(p.pick[1]), 3800, -11);
    const run = film.films[sc.film]?.run;
    if (pickVideo && run) {
      const len = (p.run[1] - p.run[0]) * B;
      const [L, R] = readAudio(pickVideo, { sr: s.sr, offset: run.from, duration: len });
      const n = L.length, fi = Math.round(0.008 * s.sr), fo = Math.round(0.06 * s.sr);
      for (let i = 0; i < n; i++) { const k = Math.min(1, i / fi, (n - 1 - i) / fo); L[i] *= k; R[i] *= k; }
      s.add([L, R], A(p.run[0]), { gain: -3, bus: 'fx' });     // a film mastered at −14 LUFS sits a little under this one
    }
    whoosh(A(p.back[0]), 0.45, false, -19, 250, 4200);
    land(A(p.back[1]), -12);
  }
  if (sc.type === 'lockup') {
    if (p.captions[0]) pop(A(p.captions[0].from), 600);
    // the run-out: clicks speeding up as frame lines cross the gate (p^2.4)
    for (const x of [0.35, 0.62, 0.8, 0.92]) claw(A(p.runOut[0] + Math.pow(x, 1 / 2.4) * C.runOut), 3, -17);
    whoosh(A(p.runOut[0]), 0.7, true, -18, 300, 5000); tick(A(p.runOut[0]), 3400, -14);
    s.play('impact', A(p.name[0]), { freq: 52 }, { gain: -13 }); s.play('chime', A(p.name[0]), {}, { gain: -22, send: 0.4 }); tick(A(p.name[0]), 3000, -14);
    const url = String(sc.url || '');
    for (let i = 0; i < url.length; i += 2) s.play('typeKey', A(p.url[0]) + (i / url.length) * (p.url[1] - p.url[0]) * B, { seed: 40 + i }, { gain: -25 });
    pencil(A(p.underline[0])); scribble(A(p.underline[0]), 0.35); tick(A(p.underline[0]), 3600, -15);
  }
}
// every key gets a high onset, so check-film finds its broadband attack; inside the denser sections the music takes
// a breath just before it
for (const k of events(T).keys) {
  s.play('rim', k.t, { freq: 2300, seed: (k.scene ?? 0) % 4 }, { gain: -21, pan: -0.15, send: 0.1 });
  if (k.t >= (frames?.start ?? D) - 1e-6 && k.t < lock.start - 1e-6) s.duck(k.t - 0.07, { depth: -6, attack: 0.01, hold: 0.05, release: 0.01 });
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const mastered = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, tone: 'v2' });
await writeMeasure('.', mastered, { duration: D, bpm: T.bpm });

// the strip's own optical track: beside each intertitle, this film's mix in the second around its landing (as
// tools/extract.mjs measures the films' sound beside their frames). Keyed by reel cell, with the line it was written
// for, so film.js ignores a stale file.
{
  const sr = 8000, [L, R] = readAudio('assets/audio/mix.wav', { sr });
  const env = (tt) => Array.from({ length: 208 }, (_, i) => {
    const a = Math.round((tt - 0.5 + i / 208) * sr), z = Math.round((tt - 0.5 + (i + 1) / 208) * sr);
    let q = 0; for (let k = Math.max(0, a); k < Math.min(L.length, z); k++) { const m = 0.5 * (L[k] + R[k]); q += m * m; }
    return +Math.sqrt(q / Math.max(1, z - a)).toFixed(3);
  });
  const cells = {};
  for (const [t, cell] of F.stops) if (F.reel[cell]?.kind === 'title') cells[cell] = { text: F.reel[cell].text, env: env(t) };
  await writeFile('assets/audio/track.js', `// track.js — written by score.mjs: this film's mix beside each intertitle on the strip (208 RMS values). Do not edit.\nexport default ${JSON.stringify({ duration: +D.toFixed(3), cells })};\n`);
}
console.log(`strip: ${S.length} scenes, ${T.bars} bars at ${T.bpm} bpm = ${D.toFixed(3)} s; ${!pk ? 'no pick' : pickVideo ? `the pick runs with ${pickVideo}'s sound` : 'the pick runs on the drop (no video for its own sound)'}`);
