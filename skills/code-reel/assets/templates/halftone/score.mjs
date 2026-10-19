// score.mjs — the halftone sound: a synthesised "press" bed on the film's beat grid, plus one effect for each picture
// event that deserves one. Reads content.js through lib/timing.js fit() with ./timing.rules.js, so every sound sits on
// the same beat as its picture and the mix is exactly the fitted length (`npm run audio` runs lib/fit.mjs first,
// which stamps that length onto index.html). Writes assets/audio/mix.wav (−14 LUFS, true peak ≤ −1.5 dBTP) and
// assets/audio/measure.json.
//
// The bed (built here from lib/audio voices; no kit preset is a print shop): D minor, one chord a bar
// (Dm9 · Bbmaj7 · Gm9 · A7sus4), over a 3-3-2 rim-and-tick ostinato, the rhythm of a sheet-fed press, that runs
// from the first bar. Sections follow the scenes: the hook is the intro (pad and press only), the first chapter
// the build (half-time kick, offbeat hats, bass on 1 and 3), from the first change of ground the drop (four on the
// floor, offbeat bass, a plucked arpeggio on the chord); the claim is a break (pad and press; the arpeggio rests
// for the reading), then the bed drops out for the push-in before the lock-up (sound may drop out 1–2 s before
// it) and comes back with an impact and the home chord on the lock-up's bar line, ringing out to the end.
// content.sound.tone: 'v2' (default) mastering chain, as in the other templates; content.bed = { file, offset }
// replaces the synthesised bed with a generated one.
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import { fit, events } from './lib/timing.js';
import { grid } from './lib/beat.js';
import rules, { C, leadSec, countBeats } from './timing.rules.js';
import { transitionOut, groundOf } from './registry.js';
import { Score, master, writeMeasure, chord, note, mulberry32 } from './lib/audio/index.mjs';

const T = fit(film, rules);
const errs = T.notes.filter((n) => n.level === 'error');
if (errs.length) { console.error(errs.map((n) => n.msg).join('\n')); process.exit(1); }
const g = grid({ bpm: T.bpm, beatsPerBar: T.beatsPerBar });
const B = T.beat, BAR = T.bar, D = T.duration;
const S = T.scenes;
const s = new Score({ duration: D, grid: g });
const snd = film.sound || {};
const v2 = (snd.tone ?? 'v2') === 'v2';
const rnd = mulberry32(film.seed ?? 1);

// ---------- sections, in seconds ----------
const lk = S.at(-1), cl = S.find((x) => x.type === 'claim');
const firstInk = S.find((x, i) => i > 0 && groundOf(x) === 'ink') ?? S.find((x) => x.type === 'count');
const dropAt = firstInk ? firstInk.start : (S[2]?.start ?? D / 3);
const buildAt = S[1]?.start ?? 0;
const restAt = lk.start - Math.max(1.5, (C.pushBeats + C.stillBeats) * B + C.exitSec); // the bed drops out 1.5 s before the lock-up
const breakAt = cl ? cl.start + C.claimLand * B : restAt;
const kindAt = (t) => (t >= lk.start ? 'outro' : t >= restAt ? 'rest' : t >= breakAt ? 'break' : t >= dropAt ? 'drop' : t >= buildAt ? 'build' : 'intro');
const PROG = ['Dm9', 'Bbmaj7', 'Gm9', 'A7sus4'];
const chordAt = (bar) => PROG[((bar % 4) + 4) % 4];

if (film.bed?.file) await s.addFile(film.bed.file, 0, { offset: film.bed.offset || 0, gain: film.bed.gain ?? -3 });
else {
  const bars = Math.ceil(D / BAR);
  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * BAR;
    const kind = kindAt(t0 + 1e-3);
    const sym = kind === 'outro' ? 'D6add9' : chordAt(bar);
    const restBar = kind === 'rest' || (kindAt(t0 + BAR - 1e-3) === 'rest' && kind !== 'outro');
    // pad: every bar but the silent one; the outro's rings to the end
    if (!restBar || t0 < restAt - 0.5) {
      const dur = kind === 'outro' ? D - t0 : Math.min(BAR, restAt - t0 > 0 && restAt < t0 + BAR ? restAt - t0 : BAR);
      if (dur > 0.2) s.add(s.voice('pad', { freqs: chord(sym, { octave: 3 }), dur, attack: kind === 'outro' ? 0.02 : 0.25, release: kind === 'outro' ? 1.2 : 0.35, cutoff: kind === 'drop' ? 1700 : 1300, air: 0.08, hp: v2 ? 150 : 0, seed: bar % 4 + 1 }), t0, { gain: kind === 'outro' ? -14 : -17, send: 0.35, bus: 'pump' });
    }
    for (let k = 0; k < 16; k++) {
      const t = t0 + (k * B) / 4;
      const kk = kindAt(t);
      if (t >= D - 0.05 || kk === 'rest') continue;
      if (kk === 'outro' && t > lk.start + BAR) continue; // the outro: one bar of press, then the chord alone
      // the press: a 3-3-2 figure of rim and tick, one sheet a bar
      const PRESS = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0];
      if (PRESS[k]) s.add(s.vary('rim', { freq: k % 8 === 0 ? 1350 : 1550 }, { vel: k === 0 ? 0.8 : 0.4 }), t, { gain: -23, pan: k % 2 ? 0.25 : -0.25, send: 0.12, bus: 'music' });
      if (k % 2 === 1) s.add(s.vary('tick', { freq: 5200 }, { vel: 0.3 }), t, { gain: -31, pan: 0.35, bus: 'music' });
      const beat = k % 4 === 0, q = k / 4;
      if (kk === 'build' || kk === 'drop') {
        // kick: half time in the build, four on the floor in the drop
        if (beat && (kk === 'drop' || q % 2 === 0)) s.add(s.vary('kick', { f0: 140, f1: 48, decay: 0.24, muted: kk === 'build' }, { vel: q === 0 ? 0.8 : 0.5 }), t, { gain: kk === 'drop' ? -11 : -15, bus: 'music' });
        // hats on the offbeat 8ths; light 16ths in the drop
        if (k % 4 === 2) s.add(s.vary('hat', { decay: 0.04 }, { vel: 0.5 }), t, { gain: -22, pan: -0.2, bus: 'music' });
        if (kk === 'drop' && k % 2 === 1) s.add(s.vary('hat', { decay: 0.02 }, { vel: 0.2 }), t, { gain: -30, pan: 0.3, bus: 'music' });
        // bass: on 1 and 3 in the build, on the offbeat 8ths in the drop
        const root = note(chord(chordAt(bar), { octave: 2 })[0]);
        if ((kk === 'build' && (k === 0 || k === 8)) || (kk === 'drop' && k % 4 === 2)) s.add(s.voice('bass', { freq: root, dur: kk === 'drop' ? B / 2 : B, cutoff: 420 }), t, { gain: -15, bus: 'pump' });
        // the arpeggio: chord tones up, one an 8th, in the drop only (the melodic layer the reading drop removes)
        if (kk === 'drop' && k % 2 === 0) {
          const tones = chord(chordAt(bar), { octave: 4 });
          s.add(s.vary('pluck', { freq: tones[(k / 2) % tones.length], dur: 0.5, bright: 0.45 }, { vel: k % 8 === 0 ? 0.7 : 0.4 }), t, { gain: -24, pan: (k / 8) - 0.5, send: 0.25, bus: 'music' });
        }
      }
      // the intro keeps a soft pulse (a muted kick on 1, the bass on the downbeat), so the build is not a jump
      if (kk === 'intro' && beat && q === 0) {
        s.add(s.vary('kick', { f0: 120, f1: 46, decay: 0.3, muted: true }, { vel: 0.4 }), t, { gain: -17, bus: 'music' });
        s.add(s.voice('bass', { freq: note(chord(chordAt(bar), { octave: 2 })[0]), dur: 2 * B, cutoff: 360 }), t, { gain: -19, bus: 'pump' });
      }
      if (kk === 'break' && beat && q === 0) s.add(s.vary('kick', { f0: 120, f1: 46, decay: 0.3, muted: true }, { vel: 0.4 }), t, { gain: -17, bus: 'music' });
    }
  }
  // energy: the run into the claim (the last two scenes before it) is the loudest stretch of the groove
  const pre = cl ? S[S.indexOf(cl) - 2] : null;
  if (pre && pre.start > dropAt) { s.level(dropAt, pre.start, { gain: -1.5 }); s.level(pre.start, cl.start, { gain: 1 }); }
  s.eq('music', [{ type: 'highshelf', freq: 7000, gain: v2 ? 2 : 0 }]);
  s.fade({ out: 1.2 });
}

// ---------- effects on picture events ----------
S.forEach((sc, i) => {
  const o = i === 0 ? C.firstOffset : 0, st = sc.start;
  const tin = i > 0 ? transitionOut(S, i - 1) : null, tout = transitionOut(S, i);
  if (sc.type === 'hook') {
    const t = st + o * B;
    s.play('stamp', t, { freq: 520, to: 90, decay: 0.09 }, { gain: -12 });
    s.play('thud', t, { freq: 60, decay: 0.16 }, { gain: -14 });
    s.play('whoosh', t - 0.42, { dur: 0.45, up: true, lo: 200, hi: 2400 }, { gain: -22, send: 0.2 });
    if ((sc.lines || []).length > 1) s.play('tick', st + (o + C.hookLine2) * B, { freq: 2600 }, { gain: -21 });
  }
  if (sc.type === 'card' || sc.type === 'count') {
    const t = st + o * B;
    if (tin === 'whip') s.play('whoosh', t - C.whipBeats * B - 0.05, { dur: C.whipBeats * B + 0.06, up: true, lo: 600, hi: 7000, q: 0.8 }, { gain: -19, pan: 0.3, send: 0.1 });
    s.play('stamp', t, { freq: 760, to: 160, decay: 0.06, seed: i + 3 }, { gain: -15 });
    if (sc.line) s.play('tick', st + (o + C.lineAt) * B, { freq: 2900 }, { gain: -22, pan: -0.2 });
  }
  if (sc.type === 'count') {
    const from = sc.from ?? 0, cb = countBeats(sc), t0 = st + o * B;
    let last = from;
    for (let f = 1; f <= 60; f++) { // one tick per value change, on the frame it changes
      const t = t0 + (f / 60) * cb * B, u = f / 60;
      const v = Math.round(from + (sc.value - from) * (1 - (1 - u) * (1 - u)));
      if (v !== last) { s.play('tick', t, { freq: 2200 + 90 * (v - from) }, { gain: -21 }); last = v; }
    }
    s.play('stamp', t0 + cb * B, { freq: 880, to: 140, decay: 0.07 }, { gain: -14 });
  }
  if (tout === 'invert') { s.play('whoosh', sc.end - C.invertBeats * B, { dur: C.invertBeats * B, up: false, lo: 120, hi: 2600, q: 0.9 }, { gain: -17, send: 0.2 }); s.play('thud', sc.end, { freq: 55, decay: 0.2 }, { gain: -15 }); }
  if (tout === 'quantize') {
    s.play('glitch', sc.end - C.quantBeats * B, { dur: C.quantBeats * B, rate: 30, seed: 5 }, { gain: -24 });
    for (let k = 0; k < 10; k++) s.play('tick', sc.end + (k / 10) * C.sortBeats * B, { freq: 3400 - 120 * k }, { gain: -27, pan: rnd() - 0.5 });
  }
  if (tout === 'collapse') {
    const t0 = sc.end - C.collapseBeats * B;
    s.play('whoosh', t0, { dur: 0.5 * B, up: false, lo: 300, hi: 5000 }, { gain: -18 });
    s.duck(t0 + 0.5 * B, { depth: -9, attack: 0.02, hold: sc.end - t0 - 0.5 * B - 0.03, release: 0.05 });
  }
  if (sc.type === 'claim') {
    s.play('impact', st, { freq: 50, decay: 0.6 }, { gain: -12 });
    s.play('stamp', st, { freq: 1100, to: 200, decay: 0.05 }, { gain: -16 });
    for (let k = 0; k < 16; k++) s.play('tick', st + C.claimLand * B * (0.35 + 0.65 * Math.sqrt(k / 15)) - 0.05, { freq: 2400 + 180 * (k % 5) }, { gain: -28, pan: rnd() * 0.8 - 0.4 });
    s.play('rim', st + C.claimLand * B, { freq: 1600 }, { gain: -19 });
  }
  if (tout === 'pull') {
    const pushA = sc.end - (C.pushBeats + C.stillBeats) * B, pushB = sc.end - C.stillBeats * B;
    s.play('riser', pushA, { dur: pushB - pushA, lo: 180, hi: 3200, tone: 0.25 }, { gain: -27, send: 0.3 });
  }
  if (sc.type === 'lockup') {
    s.play('impact', st, { freq: 44, decay: 0.9 }, { gain: -10 });
    s.play('chime', st, { freq: 'D6', decay: 1.1, notes: 3 }, { gain: -19, send: 0.4 });
    s.duck(st + C.nameAt * B - 0.03, { depth: -6, attack: 0.02, hold: 0.02, release: 0.4 });
    s.play('stamp', st + C.nameAt * B, { freq: 760, to: 130, decay: 0.08 }, { gain: -10 });
    if (sc.line) s.play('tick', st + C.lineAtLock * B, { freq: 2700 }, { gain: -22 });
    const tm = sc.end - BAR;
    s.play('stamp', tm, { freq: 520, to: 110, decay: 0.07 }, { gain: -17 });
    s.play('rim', tm, { freq: 1450 }, { gain: -20, send: 0.2 });
  }
});
// every key the plan marks gets a high onset too, so check-film finds its broadband attack (≥ 3 dB within a frame)
for (const k of events(T).keys) if (['land', 'turn', 'claim'].includes(k.kind)) s.play('rim', k.t, { freq: 2300, seed: (k.scene ?? 0) % 4 }, { gain: -21, pan: -0.15, send: 0.1 });

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const mastered = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(v2 ? { tone: 'v2' } : {}) });
await writeMeasure('.', mastered, { duration: D, bpm: T.bpm });
console.log(`halftone: ${S.length} scenes, ${T.bars} bars at ${T.bpm} bpm = ${D.toFixed(3)} s; drop ${dropAt.toFixed(2)} s, break ${breakAt.toFixed(2)} s, silent ${restAt.toFixed(2)}–${lk.start.toFixed(2)} s`);
