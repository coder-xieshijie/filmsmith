// score.mjs — the pulse sound: a bed written for this mode on the film's beat grid, and one synthesised effect for
// every picture event (each word, hop, lock, figure, transition), placed from the same timeline the picture draws
// (plan.js → timeline.js), so every sound sits on its picture's frame and the mix is exactly the fitted length.
//
// The bed (D minor, 120 bpm by default, any tempo in 112–120): a muted kick on every beat from the first word —
// the pulse — with offbeat hats, a rim on 2 and 4 and a sixteenth-note "query" synth whose filter opens across the
// build; one beat of near-silence under the exposure build; then the drop lands with the whiteout: full kick,
// offbeat bass, claps, open hats, the progression lifting to its relative major; the closing card is the outro,
// where the groove leaves and the chord rings out. Reading scenes thin the melodic layer (the groove stays).
// content.sound.tone: 'v2' (default) is the spectral balance and mastering chain of the other templates; 'v1' plain.
// Writes assets/audio/mix.wav (−14 LUFS, true peak ≤ −1.5 dBTP) and assets/audio/measure.json.
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import { plan } from './plan.js';
import { Score, master, writeMeasure, chord, bassNote, mtof } from './lib/audio/index.mjs';

const P = plan(film);
const { B, bar } = P;
const dur = P.duration;
const g = { bpm: P.T.bpm, beat: B, bar, beatsPerBar: 4, t0: 0, bt: (n) => n * B, br: (n) => n * bar };
const s = new Score({ duration: dur, grid: g });
const snd = film.sound || {};
const v2 = (snd.tone ?? 'v2') === 'v2';

// ---------- the bed ----------
const reveal = P.scenes.find((x) => x.type === 'reveal');
const closing = P.scenes.find((x) => x.type === 'name');
const dropT = reveal ? reveal.start : null;
const outroT = closing ? closing.start : dur;
const gapT = dropT != null ? dropT - B : null; // the exposure build: the beat before the drop
const BUILD = ['Dm9', 'Bbmaj7', 'Gm9', 'A7sus4'];
const DROP = ['Dm9', 'Bbmaj9', 'Fmaj9', 'C6'];
const dropBar = dropT != null ? Math.round(dropT / bar) : Infinity;
const chordAt = (barN) => (barN < dropBar ? BUILD[barN % 4] : DROP[(barN - dropBar) % 4]);
const reading = (t) => { const sc = P.scenes.find((x) => t >= x.start && t < x.end); return sc && ['data', 'reveal'].includes(sc.type); };
const totalBeats = Math.round(dur / B);
const v = (name, opts, vel = 0.5) => s.vary(name, opts, { vel });

if (film.bed?.file) await s.addFile(film.bed.file, 0, { offset: film.bed.offset || 0, gain: film.bed.gain ?? -3 });
else {
  for (let n = 0; n < totalBeats; n++) {
    const t = n * B, barN = Math.floor(n / 4), pos = n % 4;
    const sym = chordAt(barN);
    const inGap = gapT != null && t >= gapT - 1e-6 && t < dropT - 1e-6;
    const phase = inGap ? 'gap' : dropT == null || t < dropT - 1e-6 ? 'build' : t < outroT - 1e-6 ? 'drop' : 'outro';
    const p = dropT ? Math.min(1, t / dropT) : 0.5; // build progress: the filter opens, the pulse rises
    const root = bassNote(sym, { center: 38 });
    if (pos === 0 && phase !== 'gap') {
      const bright = phase === 'build' ? 900 + 700 * p : phase === 'drop' ? 1900 : 1300;
      s.play('pad', t, { freqs: chord(sym, { octave: 3 }), dur: bar * (phase === 'outro' ? 3 : 1), attack: 0.2, release: phase === 'outro' ? 2.4 : 0.8, cutoff: bright, detune: 10, voices: 3, air: 0.12, hp: v2 ? 150 : 0, dip: v2 ? [300, -3] : null },
        { gain: phase === 'drop' ? -19 : -21, bus: 'pump', send: 0.35 });
    }
    if (phase === 'build') {
      if (t >= (P.scenes[0].plan.states?.[0]?.land ?? 0) - 1e-6) s.add(v('kick', { muted: true, f0: 120, f1: 48, decay: 0.2 }, pos === 0 ? 0.7 : 0.4), t, { gain: -16 + 3 * p, bus: 'music' });
      if (barN >= 1) s.add(v('hat', { decay: 0.03, seed: n }, 0.4), t + B / 2, { gain: -28 + 2 * p, pan: 0.25, bus: 'music' });
      if (barN >= 2 && (pos === 1 || pos === 3)) s.add(v('rim', { freq: 1350 }), t, { gain: -25, pan: -0.3, send: 0.15, bus: 'music' });
      if (pos === 0) s.play('sub', t, { freq: mtof(root - 12), dur: bar * 0.8, attack: 0.02, release: 0.3 }, { gain: -22, bus: 'pump' });
      if (!reading(t)) {
        const tones = chord(sym, { octave: 4 });
        for (let k = 0; k < 4; k++) {
          const f = tones[(n * 4 + k) % tones.length];
          s.add(v('synth', { freq: f, dur: B / 4 * 0.6, wave: 'saw', cutoff: Math.round((500 + 2600 * p * p) / 50) * 50, env: 900, decay: 0.05, res: 0.9 }, k === 0 ? 0.7 : 0.4), t + (k * B) / 4,
            { gain: -26 + 4 * p + (k ? -3 : 0), pan: k % 2 ? 0.2 : -0.2, send: 0.12, bus: 'pump' });
        }
      }
    }
    if (phase === 'drop') {
      // the reveal scene carries the drop at full energy; after it the groove eases (the release before the lock-up)
      const rel = reveal && t >= reveal.end - 1e-6 ? -2.5 : 0;
      s.add(v('kick', { f0: 155, f1: 50, decay: 0.26, click: 0.35, drive: 1.8 }, pos === 0 ? 0.8 : 0.5), t, { gain: -10 + rel, bus: 'music' });
      s.duck(t, { bus: 'pump', depth: -6, attack: 0.004, hold: 0.02, release: 0.17 });
      if (pos === 1 || pos === 3) s.add(v('clap', {}), t, { gain: -19 + rel, send: 0.2, bus: 'music' });
      s.add(v('hat', { open: true, decay: 0.15, seed: 2 }), t + B / 2, { gain: -25, pan: 0.2, send: 0.1, bus: 'music' });
      for (let k = 1; k < 4; k += 2) s.add(v('hat', { decay: 0.02, seed: n * 4 + k }, 0.3), t + (k * B) / 4, { gain: -31, pan: 0.35, bus: 'music' });
      s.add(v('bass', { freq: mtof(root), dur: B * 0.42, cutoff: 420, env: 700, decay: 0.07 }), t + B / 2, { gain: -14 + rel, bus: 'pump' });
      if (!reading(t)) {
        const tones = chord(sym, { octave: 4 });
        for (let k = 0; k < 4; k++) s.add(v('synth', { freq: tones[(n * 4 + k) % tones.length], dur: B / 4 * 0.6, wave: 'saw', cutoff: 2400, env: 1100, decay: 0.05, res: 0.8 }, 0.5), t + (k * B) / 4, { gain: -27 + (k ? -3 : 0), pan: k % 2 ? 0.25 : -0.25, send: 0.15, bus: 'pump' });
      }
    }
    if (phase === 'outro') {
      // the lock-up keeps a soft pulse under the name, the hats leave after its first bar, the chord rings out
      s.add(v('kick', { muted: true, f0: 130, f1: 48, decay: 0.24 }, pos === 0 ? 0.7 : 0.4), t, { gain: t < outroT + 1e-6 ? -12 : -17, bus: 'music' });
      if (t < outroT + bar - 1e-6) s.add(v('hat', { decay: 0.03, seed: n }, 0.4), t + B / 2, { gain: -29, pan: 0.25, bus: 'music' });
    }
  }
  s.fade({ out: 0.5 });
}

// ---------- effects on picture events ----------
const typeRun = (t0, n, cps) => {
  const step = Math.max(1, Math.round(cps / 28)); // at most about 28 keys a second
  for (let k = 0; k < n; k += step) s.play('typeKey', t0 + k / cps, { seed: k + 1 }, { gain: -30, pan: 0.15 });
};
for (const c of P.cues) {
  const t = c.t;
  switch (c.kind) {
    case 'hook':
      s.play('impact', t, { freq: 50, decay: 0.35 }, { gain: -12 });
      s.play('stamp', t, { freq: 900, to: 160, decay: 0.07 }, { gain: -12 });
      s.play('rim', t, { freq: 2300 }, { gain: -18, send: 0.15 });
      break;
    case 'word':
      s.play('stamp', t, { freq: 760 + 40 * (c.k % 4), to: 150, decay: 0.06, seed: c.k + 3 }, { gain: -13 });
      s.play('thud', t, { freq: 66, decay: 0.1 }, { gain: -18 });
      if (c.ap === 'invert') s.play('rim', t, { freq: 2100 }, { gain: -18, pan: -0.2, send: 0.15 });
      break;
    case 'type': typeRun(t, c.n, c.cps); break;
    case 'aperture':
      s.play('tick', t, { freq: 3200 }, { gain: -22 });
      s.play('thud', t, { freq: 72, decay: 0.1 }, { gain: -18 });
      break;
    case 'hop':
      if (c.known) s.play('tick', t, { freq: 2600 + 150 * (c.k % 5) }, { gain: -21, pan: -0.3 + 0.15 * (c.k % 5) });
      else { s.play('pop', t, { freq: 560 + 110 * c.k, decay: 0.06 }, { gain: -15 }); s.play('tick', t, { freq: 3000 }, { gain: -22 }); }
      break;
    case 'slot': s.play('pop', t, { freq: 330, decay: 0.08 }, { gain: -15 }); s.play('tick', t, { freq: 2200 }, { gain: -22 }); break;
    case 'value': s.play('tick', t, { freq: 2600 }, { gain: -25 }); break;
    case 'scramble': s.play('glitch', t, { dur: Math.min(1.2, Math.max(0.15, c.dur)), rate: 24 }, { gain: -28, pan: 0.2 }); break;
    case 'lock':
      s.play('chime', t, { freq: 1318.5, decay: 0.5 }, { gain: -16, send: 0.3 });
      s.play('stamp', t, { freq: 820, to: 180, decay: 0.07 }, { gain: -13 });
      break;
    case 'fail':
      s.play('thud', t, { freq: 55, decay: 0.25 }, { gain: -12 });
      s.play('stamp', t, { freq: 520, to: 110, decay: 0.08 }, { gain: -15 });
      s.play('bell', t, { freq: 220, ratio: 1.4, dur: 1.2 }, { gain: -24, send: 0.3 });
      break;
    case 'result': s.play('chime', t, { freq: 1046.5 }, { gain: -18, send: 0.3 }); s.play('stamp', t, {}, { gain: -14 }); break;
    case 'whip':
      s.play('whoosh', t - 0.05, { dur: c.dur + 0.1, up: false, lo: 300, hi: 6000, peak: 0.7 }, { gain: -14, send: 0.15 });
      s.play('thud', t + c.dur, { freq: 64, decay: 0.12 }, { gain: -15 });
      break;
    case 'invert':
      s.play('impact', t, { freq: 52, decay: 0.4 }, { gain: -14 });
      s.play('rim', t, { freq: 2400 }, { gain: -17, send: 0.15 });
      break;
    case 'figure-in': s.play('stamp', t, { freq: 700, to: 140, decay: 0.07 }, { gain: -14 }); break;
    case 'figure':
      s.play('stamp', t, { freq: 740 + 60 * c.k, to: 150, decay: 0.06 }, { gain: -14 });
      for (let k = 0; k < 5; k++) s.play('tick', t + 0.07 + k * 0.05, { freq: 2400 + 120 * k }, { gain: -27 });
      break;
    case 'count':
      s.play('stamp', t, { freq: 700, to: 150, decay: 0.06 }, { gain: -14 });
      for (let k = 0; k < 10; k++) s.play('tick', t + c.dur * (1 - Math.pow(1 - k / 10, 1 / 3)), { freq: 2300 + 60 * k }, { gain: -24 });
      break;
    case 'build':
      s.play('riser', t - c.dur, { dur: 2 * c.dur, lo: 250, hi: 7000 }, { gain: -15, send: 0.3 });
      s.play('swell', t, { freqs: chord('A7sus4', { octave: 4 }), dur: c.dur, cutoff: 2800 }, { gain: -20 });
      break;
    case 'whiteout':
      s.play('impact', t, { freq: 44, decay: 1.0 }, { gain: -8 });
      s.play('whoosh', t, { dur: 0.6, up: false, lo: 200, hi: 7000, peak: 0.1 }, { gain: -16, send: 0.3 });
      s.play('rim', t, { freq: 2600 }, { gain: -15, send: 0.2 });
      s.play('chime', t + 0.02, { freq: 1174.7, notes: 3, decay: 0.9 }, { gain: -19, send: 0.4 });
      break;
    case 'rise': s.play('pop', t, { freq: 880, decay: 0.05 }, { gain: -22 }); break;
    case 'portal':
      // under the drop's groove the push stays below the hit: the climax is the loudest moment, not the hand-off
      s.play('whoosh', t, { dur: c.dur, up: true, lo: 300, hi: 6000, peak: 0.85 }, { gain: -19, send: 0.25 });
      s.play('thud', t + c.dur, { freq: 60, decay: 0.15 }, { gain: -16 });
      break;
    case 'slice': s.play('whoosh', t, { dur: c.dur + 0.08, up: false, lo: 400, hi: 7000, peak: 0.6 }, { gain: -18, send: 0.15 }); break;
    case 'name':
      s.play('impact', t, { freq: 50, decay: 0.5 }, { gain: -17 });
      s.play('stamp', t, { freq: 860, to: 170, decay: 0.07 }, { gain: -13 });
      s.play('rim', t, { freq: 2300 }, { gain: -18, send: 0.15 });
      break;
    case 'end':
      s.play('chime', t, { freq: 1174.7, notes: 3, decay: 1.2 }, { gain: -22, send: 0.4 });
      s.play('thud', t, { freq: 62, decay: 0.15 }, { gain: -18 });
      break;
  }
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const mastered = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(v2 ? { tone: 'v2' } : {}) });
await writeMeasure('.', mastered, { duration: dur, bpm: P.T.bpm });
console.log(`pulse: ${P.scenes.length} scenes, ${P.bars} bars at ${P.T.bpm} bpm = ${dur.toFixed(3)} s, ${P.cues.length} sound cues, drop at ${dropT?.toFixed(3) ?? '—'} s`);
