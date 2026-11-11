// score.mjs — the Exhibit sound: the `swiss` bed (marimba, woodblock, shaker: a desk of paper and pencil) on the
// film's beat grid, plus one effect for each picture event, all placed from choreo.js plans at the fitted scene
// lengths (the module film.js draws from), so picture and sound cannot drift. `npm run audio` runs lib/fit.mjs first,
// which stamps the fitted length onto index.html. Writes assets/audio/mix.wav (−14 LUFS, true peak ≤ −1.5 dBTP after
// the renderer's AAC; mastered to −2.0, since the hard cut's tick runs the render's encode up to 0.6 dB over the
// master's own estimate) and assets/audio/measure.json.
//
// Arrangement, from the scenes: the opening is the intro; from the first travel the build with the reading drop (the
// marimba line rests while text is read); from the match (or the bar before the measure) the drop, so the measured
// gap, the climax, lands inside it; the lock-up is the outro, its home chord ringing to the end.
// content.sound = { bed: 'swiss', seed } picks another bed preset or seed; content.bed = { file, offset, gain }
// replaces the synthesised bed with a generated one.
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import rules from './timing.rules.js';
import { fit, events } from './lib/timing.js';
import { grid } from './lib/beat.js';
import { plan, C } from './choreo.js';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';

const T = fit(film, rules);
const errs = T.notes.filter((n) => n.level === 'error');
if (errs.length) { console.error(errs.map((n) => n.msg).join('\n')); process.exit(1); }
const g = grid({ bpm: T.bpm, beatsPerBar: T.beatsPerBar });
const B = T.beat, BAR = T.bar, D = T.duration;
const S = T.scenes.map((s, i) => ({ ...s, p: plan(s, { i, scenes: T.scenes, content: film }, B, s.end - s.start, film) }));
const s = new Score({ duration: D, grid: g });
const snd = film.sound || {};

// ---------- the bed ----------
const bar = (t) => t / BAR;
const second = S[1];
const match = S.find((x) => x.type === 'match'), meas = S.find((x) => x.type === 'measure');
const lock = S.at(-1);
const dropAt = match ? match.start : meas ? Math.max(0, meas.start - BAR) : lock.start - 2 * BAR;
const buildAt = second && second !== lock ? Math.min(second.start, dropAt) : Math.min(dropAt, BAR * 2);
if (film.bed?.file) await s.addFile(film.bed.file, 0, { offset: film.bed.offset || 0, gain: film.bed.gain ?? -3 });
else {
  const sections = [
    { from: 0, to: bar(buildAt), kind: 'intro', energy: 0.4 },
    { from: bar(buildAt), to: bar(dropAt), kind: 'build', energy: 0.5, reading: true },
    { from: bar(dropAt), to: bar(lock.start), kind: 'drop', energy: 0.85 },
    { from: bar(lock.start), to: bar(D), kind: 'outro', energy: 0.5 },
  ].filter((x) => x.to - x.from > 1e-6);
  s.beds[snd.bed ?? 'swiss']({ mix: 'v2', seed: snd.seed ?? film.seed ?? 3, sections });
}

// ---------- effects on picture events ----------
const tick = (t, freq = 3200, gain = -17) => s.play('tick', t, { freq }, { gain, send: 0.05 });
const pencil = (t, k = 0) => s.play('rim', t, { freq: 1500 + 120 * k }, { gain: -15, send: 0.1 });
const lift = (t, dur = 0.35) => s.play('whoosh', t, { dur, up: true, lo: 500, hi: 6000, peak: 0.6 }, { gain: -21, send: 0.15 });
const down = (t, dur = 0.3) => s.play('whoosh', t, { dur, up: false, lo: 300, hi: 3500, peak: 0.4 }, { gain: -23, send: 0.1 });
const land = (t) => { s.play('thud', t, { freq: 80, decay: 0.1 }, { gain: -13 }); tick(t, 2800, -16); };
const pop = (t, f = 520) => s.play('pop', t, { freq: f }, { gain: -21, send: 0.1 });
let popK = 0;

for (const sc of S) {
  const P = sc.p, at = (x) => sc.start + x;
  if (sc.type === 'open') {
    s.play('whoosh', at(P.pull[0]) - 0.05, { dur: P.pull[1] - P.pull[0] + 0.05, up: false, lo: 250, hi: 4200, peak: 0.55 }, { gain: -19, send: 0.2 });
    land(at(P.landAt));
    if (P.capAt != null) pop(at(P.capAt), 480);
  }
  if (sc.type === 'travel') {
    const [a0, a1] = P.move, d = a1 - a0;
    tick(at(a0), 3400, -15);
    if (P.moveId === 'grid-hop') {
      s.play('whoosh', at(a0), { dur: 0.36 * d, up: false, lo: 250, hi: 3800, peak: 0.6 }, { gain: -19, send: 0.2 });   // out over the desk
      tick(at(a0 + 0.36 * d), 4200, -16);                                                                            // the ring hops
      s.play('whoosh', at(a0 + 0.55 * d), { dur: 0.42 * d, up: true, lo: 300, hi: 5000, peak: 0.7 }, { gain: -19, send: 0.15 });   // the dive
    } else s.play('whoosh', at(a0), { dur: d - 0.05, up: true, lo: 300, hi: 4500, peak: 0.5 }, { gain: -19, send: 0.15 });
    land(at(P.landAt));
    if (P.capAt != null) pop(at(P.capAt), 560 + 40 * (popK++ % 3));
  }
  if (sc.type === 'read') {
    P.rings.forEach(([a], k) => pencil(at(a), k));
    tick(at(P.lift[0]), 3400, -15); lift(at(P.lift[0]));
    tick(at(P.lift[0] + 0.25 * (P.lift[1] - P.lift[0])), 4200, -19);   // the values turn to code
    land(at(P.landAt));
    if ((sc.cells || []).length > 1) P.reading.forEach(([a], k) => { if (k) tick(at(a), 2600 + 200 * k, -21); });
    if (P.capAt != null) pop(at(P.capAt), 560 + 40 * (popK++ % 3));
    down(at(P.back[0])); pencil(at(P.unring[0]), -2);
  }
  if (sc.type === 'match') {
    pencil(at(0), 2);
    s.play('riser', at(P.move[0]), { dur: P.cut - P.move[0] - 0.02, lo: 400, hi: 3000, tone: 0.2 }, { gain: -27 });   // the push in
    tick(at(P.cut), 3800, -10); s.play('stamp', at(P.cut), { freq: 1100, to: 250, decay: 0.05 }, { gain: -14 });   // the hard cut
    s.play('whoosh', at(P.cut + 0.05), { dur: P.move[1] - P.cut - 0.1, up: false, lo: 300, hi: 3500, peak: 0.4 }, { gain: -22, send: 0.1 });
    land(at(P.landAt));
    if (P.capAt != null) pop(at(P.capAt), 660);
  }
  if (sc.type === 'measure') {
    if (P.unringM) pencil(at(P.unringM[0]), -1);
    s.play('riser', at(P.landAt) - 1.0, { dur: 1.0, lo: 400, hi: 5000 }, { gain: -25 });
    for (let k = 0; k < 4; k++) tick(at(P.dim[0]) + (k * (P.dim[1] - P.dim[0])) / 4, 2400 + 300 * k, -22);
    const t = at(P.landAt);
    s.play('impact', t, {}, { gain: -12 }); s.play('chime', t, { notes: 3 }, { gain: -17, send: 0.35 });
    tick(t, 3800, -10); s.play('stamp', t, { freq: 1200, to: 300 }, { gain: -14 }); s.play('thud', t, { freq: 70, decay: 0.12 }, { gain: -11 });
    s.duck(t + 0.12, { depth: -4, attack: 0.05, hold: 0.3, release: 0.8 });   // after the onset, not on it
  }
  if (sc.type === 'lockup') {
    tick(at(0), 3400, -15);
    s.play('whoosh', at(0), { dur: P.rise[1] - 0.05, up: false, lo: 200, hi: 3000, peak: 0.5 }, { gain: -18, send: 0.25 });
    const t = at(P.landAt);
    s.play('impact', t, { freq: 52 }, { gain: -13 }); tick(t, 3000, -15); s.play('chime', t, {}, { gain: -20, send: 0.4 });
    const url = String(sc.url || '');
    for (let i = 0; i < url.length; i += 2) s.play('typeKey', at(P.urlAt) + (i / url.length) * (P.urlTyped - P.urlAt), { seed: 40 + i }, { gain: -25 });
    pencil(at(P.rule[0]), 3); pencil(at(P.route[0]), 1);
    pencil(at(P.last[0]), 4); tick(at(P.last[0]), 3600, -15);
  }
}
// every key gets a high onset, so check-film finds its broadband attack (≥ 3 dB within a frame); inside the drop the
// music takes a breath just before it (the drop is dense: the hit alone rises < 3 dB)
for (const k of events(T).keys) {
  s.play('rim', k.t, { freq: 2300, seed: (k.scene ?? 0) % 4 }, { gain: -21, pan: -0.15, send: 0.1 });
  if (k.t >= dropAt - 1e-6 && k.t < lock.start + 1e-6) s.duck(k.t - 0.075, { depth: -6, attack: 0.01, hold: 0.055, release: 0.01 });
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const mastered = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -2.0, tone: 'v2' });
await writeMeasure('.', mastered, { duration: D, bpm: T.bpm });
console.log(`exhibit: ${S.length} scenes, ${T.bars} bars at ${T.bpm} bpm = ${D.toFixed(3)} s; build ${buildAt.toFixed(2)} s, drop ${dropAt.toFixed(2)} s, outro ${lock.start.toFixed(2)} s`);
