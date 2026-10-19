// score.mjs — morph sound: a glassy bed on the film's beat grid, plus one sound for every picture event, placed at the
// same times film.js draws them (choreo.js TIMES, scene starts from lib/timing.js fit()).
//
//   node score.mjs        → assets/audio/mix-raw.wav, assets/audio/mix.wav (−14 LUFS, ≤ −1.5 dBTP), measure.json
//
// The bed is written here from lib/audio voices (no preset in lib/audio/beds.mjs fits morph yet): E major, one chord
// a bar (Emaj9 C#m9 Amaj7#11 B7sus4), a soft pad, a plucked eighth-note arpeggio of the chord ("glass"), a muted kick
// and offbeat hats that thicken scene by scene, a pad-only breath under the focus card's code, a riser into the flood,
// the drop (four on the floor, claps, sixteenth hats, bass on every beat) from the flood's bar line to its retract, and
// an outro of felt keys and one bell under the mark. Energy rises with the dimension: line < plane < solid < interface.
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import rules from './timing.rules.js';
import { grid } from './lib/beat.js';
import { fit } from './lib/timing.js';
import { Score, master, writeMeasure, voicing, bassNote, note, mtof } from './lib/audio/index.mjs';
import { timesOf, secondMove, CPS } from './choreo.js';

const T = fit(film, rules);
const g = grid({ bpm: T.bpm });
const B = T.beat, BAR = T.bar, DUR = T.duration;
const S = T.scenes.map((s, i) => ({ ...s, i, dur: s.end - s.start, T: timesOf(T.scenes, i, B, film) }));
const by = (type) => S.filter((s) => s.type === type);
const s = new Score({ duration: DUR, grid: g });
const snd = film.sound || {};

// ---------------------------------------------------------------- the bed
const PROG = ['Emaj9', 'C#m9', 'Amaj7#11', 'B7sus4'];
const chordAt = (bar) => PROG[((bar % PROG.length) + PROG.length) % PROG.length];
const flood = by('flood')[0], mark = by('mark')[0];
const dropFrom = flood ? flood.start + flood.T.flood : Infinity;
const dropTo = flood ? flood.end - flood.T.retractBeats * B : Infinity;
const outroFrom = mark ? mark.start : DUR;
// section kind at time t (beats are whole: scenes start on beats)
const ENERGY = { point: 0.3, line: 0.35, press: 0.45, card: 0.5, solid: 0.6, unfold: 0.65, focus: 0.55, flood: 0.9, mark: 0.4 };
const sceneAt = (t) => { for (let i = S.length - 1; i >= 0; i--) if (t >= S[i].start - 1e-6) return S[i]; return S[0]; };
const kindAt = (t) => {
  if (t >= outroFrom - 1e-6) return 'outro';
  if (t >= dropFrom - 1e-6 && t < dropTo - 1e-6) return 'drop';
  const sc = sceneAt(t);
  if (sc.type === 'point' || sc.type === 'line') return 'intro';
  if (sc.type === 'focus') return 'breath'; // the code is read: the groove stays, the arpeggio rests
  if (sc.type === 'flood') return t < dropFrom ? 'lift' : 'build';
  return 'build';
};
const nBeats = Math.round(DUR / B);
const music = (name, t, vo, mo = {}) => s.play(name, t, vo, { bus: 'music', send: 0.25, ...mo });
let lastPadBar = -1;
for (let n = 0; n < nBeats; n++) {
  const t = n * B, bar = Math.floor(n / 4), beat = n % 4, kind = kindAt(t), e = ENERGY[sceneAt(t).type] ?? 0.5;
  const sym = chordAt(bar);
  const tones = voicing(sym, { center: 64 });
  // pad: one chord a bar (or from the section's first beat), never in the drop's first bar (the drop owns the low end)
  if ((beat === 0 || bar !== lastPadBar) && kind !== 'outro') {
    const left = (4 - beat) * B;
    music('pad', t, { freqs: tones.map(mtof), dur: left, attack: beat === 0 ? 0.25 : 0.08, release: 0.6, cutoff: 1300 + 900 * e, detune: 7, voices: 3, hp: 150 }, { gain: kind === 'drop' ? -24 : -21 + 2 * e, send: 0.35 });
    lastPadBar = bar;
  }
  // glass: a plucked eighth-note arpeggio of the chord, an octave up
  if (kind === 'build' || kind === 'drop' || kind === 'lift' || kind === 'intro') {
    const up = tones.map((m) => m + 12);
    for (let h = 0; h < 2; h++) {
      if (kind === 'intro' && h === 1) continue;
      const m = up[(n * 2 + h) % up.length];
      music('pluck', t + h * B / 2, { freq: mtof(m), dur: 0.5, bright: 0.55 + 0.2 * e }, { gain: (kind === 'drop' ? -24 : -27 + 3 * e) - (h ? 1.5 : 0), pan: h ? 0.25 : -0.25 });
    }
  }
  // drums: a soft pulse in the intro, so the build enters without a jump
  if (kind === 'intro' && sceneAt(t).type !== 'point') {
    if (beat === 0) music('kick', t, { muted: true, decay: 0.2 }, { gain: -23, send: 0 });
    music('hat', t + B / 2, { decay: 0.025 }, { gain: -35, pan: 0.2, send: 0.05 });
  }
  if (kind === 'build' || kind === 'breath' || kind === 'lift') {
    if (beat === 0 || beat === 2) music('kick', t, { muted: true, decay: 0.22 }, { gain: -21 + 5 * e, send: 0 });
    music('hat', t + B / 2, { decay: 0.03 }, { gain: -31 + 3 * e, pan: 0.2, send: 0.05 });
  }
  if (kind === 'drop') {
    music('kick', t, { decay: 0.26 }, { gain: -13, send: 0 });
    if (beat % 2 === 1) music('clap', t, {}, { gain: -21, send: 0.2 });
    for (let q = 0; q < 4; q++) music('hat', t + q * B / 4, { decay: q === 2 ? 0.05 : 0.025, tone: 7000 }, { gain: q === 2 ? -30 : -35, pan: 0.15, send: 0.05 });
    music('bass', t, { freq: mtof(bassNote(sym, { center: 40 })), dur: B * 0.8 }, { gain: -15, send: 0 });
  }
  if (kind === 'build' && beat === 0 && e >= 0.5) music('sub', t, { freq: mtof(bassNote(sym, { center: 34 })), dur: BAR * 0.95 }, { gain: -22 + 2 * e, send: 0 });
}
// the outro: felt keys on the tonic and one bell, under the mark
if (mark) {
  const tones = voicing('Emaj9', { center: 60 });
  music('keys', outroFrom, { freqs: tones.map(mtof), dur: Math.max(2, DUR - outroFrom - 0.5), hardness: 0.3 }, { gain: -18, send: 0.4 });
  music('pad', outroFrom, { freqs: voicing('Emaj9', { center: 64 }).map(mtof), dur: DUR - outroFrom, attack: 0.6, release: 1.2, cutoff: 1500, hp: 150 }, { gain: -25, send: 0.4 });
}
s.fade({ in: 0.02, out: 1.2 });

// ---------------------------------------------------------------- picture events
const fx = (name, t, vo, mo) => s.play(name, t, vo, { send: 0.18, ...mo });
// a key event (timing.json keys): a short broadband click and a soft low body on the exact frame, so check-film hears
// the onset over the bed
// (a 20 ms click, not a 12 ms noise burst: the sharper one overshot AAC's true peak by a full dB in a quiet passage)
const keyHit = (t, g = -16) => { fx('tick', t, { freq: 2600, noise: 0.4, decay: 0.02 }, { gain: g, send: 0.05 }); fx('thud', t, { freq: 85, decay: 0.09 }, { gain: g - 1, send: 0 }); };
const breath = (t) => s.duck(t - 0.035, { depth: -5, attack: 0.04, hold: 0, release: 0.03 }); // 70 ms before a main landing
const PENTA = ['E5', 'F#5', 'G#5', 'B5', 'C#6', 'E6', 'F#6', 'G#6', 'B6'];
for (const sc of S) {
  const t0 = sc.start, T0 = sc.T, at = (u) => t0 + u;
  switch (sc.type) {
    case 'point':
      keyHit(at(T0.land), -18);
      fx('pluck', at(T0.land), { freq: note('E5'), dur: 0.9, bright: 0.5 }, { gain: -17 });
      breath(at(T0.land));
      break;
    case 'line':
      fx('whoosh', at(0.0), { dur: 0.32, lo: 900, hi: 6000, peak: 0.7 }, { gain: -21 });
      fx('pluck', at(T0.rise + 0.2), { freq: note('B5'), dur: 0.6 }, { gain: -20 });
      fx('tick', at(T0.rise + 0.2), { freq: 3200 }, { gain: -24 });
      if (T0.swap != null) {
        keyHit(at(T0.swap), -18);
        fx('pop', at(T0.swap + 0.14), { freq: 760, decay: 0.05, sweep: 3 }, { gain: -19 });
        fx('bell', at(T0.swap + 0.3), { freq: note('E6'), dur: 0.9 }, { gain: -29 });
      }
      break;
    case 'press':
      fx('whoosh', at(0), { dur: 0.36, lo: 300, hi: 2800, peak: 0.8 }, { gain: -20 });
      fx('thud', at(0.34), { freq: 72, decay: 0.12 }, { gain: -18 });
      if (sc.action) {
        fx('pop', at(T0.chip + 0.12), { freq: 640, decay: 0.05, sweep: 4 }, { gain: -18 });
        keyHit(at(T0.press), -15);
      } else fx('tick', at(T0.release), { freq: 2000 }, { gain: -27 });
      break;
    case 'card':
      if (!T0.fromCard) {
        fx('whoosh', at(0.06), { dur: 0.36, lo: 280, hi: 3200, peak: 0.85 }, { gain: -19 });
        fx('impact', at(0.36), { freq: 55, decay: 0.35 }, { gain: -21 });
        keyHit(at(T0.head), -16);
        fx('pluck', at(T0.head), { freq: note('G#5'), dur: 0.7 }, { gain: -19 });
        fx('tick', at(T0.bodyB), { freq: 2600 }, { gain: -24 });
        fx('tick', at(T0.settle), { freq: 1800 }, { gain: -28 });
      } else {
        fx('whoosh', at(0), { dur: 0.22, lo: 1200, hi: 5000, peak: 0.6 }, { gain: -27 });
        (film.product?.body || []).forEach((_, k) => fx('tick', at(T0.chips + k * 0.04), { freq: 2800 + 200 * k }, { gain: -21 }));
        keyHit(at(T0.chips), -17);
        fx('pop', at(T0.chips + 0.05), { freq: 700, decay: 0.05, sweep: 3 }, { gain: -19 });
        fx('bell', at(T0.settle), { freq: note('B5'), dur: 1.1 }, { gain: -26 });
      }
      break;
    case 'solid':
      if (T0.morph != null) fx('whoosh', at(0.1), { dur: 0.38, up: false, lo: 400, hi: 3600, peak: 0.6 }, { gain: -21 });
      keyHit(at(T0.lines), -16);
      [1, 2].forEach((k) => fx('tick', at(T0.lines + k * 0.05), { freq: 3400 + 300 * k }, { gain: -19 }));
      fx('impact', at(T0.lines), { freq: 50, decay: 0.5 }, { gain: -15 });
      fx('chime', at(T0.lines + 0.12), { freq: note('E6'), notes: 3, decay: 0.8 }, { gain: -22 });
      breath(at(T0.lines));
      fx('pluck', at(T0.caption + 0.2), { freq: note('E5'), dur: 0.8 }, { gain: -20 });
      T0.faces.forEach((u, k) => { fx('tick', at(u), { freq: 2600 + 250 * k }, { gain: -23 }); fx('pluck', at(u + 0.1), { freq: note(PENTA[3 + k]), dur: 0.5 }, { gain: -24 }); });
      fx('tick', at(T0.arm), { freq: 1900 }, { gain: -27 });
      break;
    case 'unfold':
      fx('whoosh', at(0), { dur: 0.5, lo: 300, hi: 5200, peak: 0.55 }, { gain: -17 });
      fx('thud', at(T0.slide + 0.4), { freq: 66, decay: 0.14 }, { gain: -16 });
      for (let k = 0; k < 6; k++) fx('tick', at(T0.fillAt + k * 0.04), { freq: 2200 + 180 * k }, { gain: -25, pan: -0.5 + k * 0.2 });
      // the caption's pluck lands 50 ms before the highlight's jump: kept soft so the jump's click still reads as an onset
      fx('pluck', at(T0.caption + 0.2), { freq: note('G#5'), dur: 0.8 }, { gain: -26 });
      keyHit(at(T0.jump), -13);
      breath(at(T0.jump)); // the bar's sub and kick sit under the jump: a short duck lets the click read as an onset
      fx('pop', at(T0.jump + 0.04), { freq: 820, decay: 0.05, sweep: 3 }, { gain: -19 });
      fx('tick', at(T0.settle), { freq: 1800 }, { gain: -28 });
      break;
    case 'focus':
      fx('whoosh', at(0.08), { dur: 0.42, up: false, lo: 300, hi: 3000, peak: 0.6 }, { gain: -19 });
      fx('thud', at(0.42), { freq: 70, decay: 0.12 }, { gain: -18 });
      fx('pluck', at(T0.enter + 0.15), { freq: note('B5'), dur: 0.6 }, { gain: -20 });
      fx('tick', at(T0.code), { freq: 2800 }, { gain: -21 });
      T0.tabs.slice(1).forEach((u, k) => { keyHit(at(u), -15); fx('pluck', at(u + 0.15), { freq: note(PENTA[4 + k]), dur: 0.5 }, { gain: -21 }); });
      fx('pop', at(T0.arm), { freq: 600, decay: 0.05, sweep: 3 }, { gain: -20 });
      break;
    case 'flood': {
      if (T0.pre > 0) { fx('tick', at(0), { freq: 2600, decay: 0.008 }, { gain: -15 }); fx('thud', at(0), { freq: 90, decay: 0.08 }, { gain: -16 }); }
      fx('riser', at(T0.flood - Math.max(0.5, T0.pre)), { dur: Math.max(0.5, T0.pre), lo: 300, hi: 6000 }, { gain: -21 });
      fx('impact', at(T0.flood), { freq: 45, decay: 0.8 }, { gain: -12 });
      fx('clap', at(T0.flood), {}, { gain: -18 });
      fx('whoosh', at(T0.flood), { dur: 0.5, lo: 400, hi: 6000, peak: 0.3 }, { gain: -19 });
      // a soft FM bell (index 0.9): at the default index this one, over the drop's hats, overshot AAC's true peak by 2.5 dB
      fx('bell', at(T0.status + 0.12), { freq: note('E6'), dur: 1.0, index: 0.9 }, { gain: -22 });
      fx('tick', at(T0.status), { freq: 3200 }, { gain: -21 });
      if (T0.n > 0) fx('tick', at(T0.l1), { freq: 2800 }, { gain: -23 });
      if (T0.n > 1) fx('tick', at(T0.l2), { freq: 2600 }, { gain: -23 });
      keyHit(at(T0.claim), -15);
      fx('impact', at(T0.claim), { freq: 52, decay: 0.6 }, { gain: -15 });
      fx('chime', at(T0.claim + 0.1), { freq: note('B5'), notes: 3, decay: 1.0 }, { gain: -20 });
      breath(at(T0.claim));
      fx('whoosh', at(sc.dur - T0.retractBeats * B), { dur: B, up: false, lo: 400, hi: 4000, peak: 0.7 }, { gain: -20 });
      break;
    }
    case 'mark': {
      fx('whoosh', at(0.12), { dur: 0.5, lo: 400, hi: 5000, peak: 0.5 }, { gain: -18 });
      for (let k = 0; k < (film.product?.mark?.parts || []).length; k++) fx('pluck', at(0.55 + k * 0.03), { freq: note(PENTA[k % PENTA.length]), dur: 0.5 }, { gain: -25, pan: -0.4 + k * 0.15 });
      fx('tick', at(T0.ring), { freq: 3000 }, { gain: -25 });
      keyHit(at(T0.land), -18);
      fx('chime', at(T0.land), { freq: note('E6'), notes: 3, decay: 1.2 }, { gain: -21 });
      fx('bell', at(T0.land + 0.05), { freq: note('B6'), dur: 2.4, index: 0.9 }, { gain: -26, send: 0.4 });
      breath(at(T0.land));
      fx('pluck', at(T0.line + 0.2), { freq: note('G#5'), dur: 0.8 }, { gain: -22 });
      if (T0.cmd != null) for (let k = 0; k < sc.cmd.length; k += 2) fx('typeKey', at(T0.cmd + k / CPS), { seed: 200 + k }, { gain: -28, send: 0.05 });
      const u2 = secondMove(sc.dur, BAR, B, T0);
      if (u2 != null) keyHit(at(u2), -22);
      break;
    }
    default:
  }
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const measured = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(((snd.tone ?? 'v2') === 'v2') ? { tone: 'v2' } : {}) });
await writeMeasure('.', measured, { duration: DUR, bpm: T.bpm });
