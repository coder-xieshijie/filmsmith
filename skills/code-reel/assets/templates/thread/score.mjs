// score.mjs — thread sound: the `thread` bed on the film's beat grid, plus one sound for every picture
// event (≈ 70), placed at the same reference times film.js uses. Two sounds are synthesised here for the
// volume shots: the merge squelch and the ink rumble. Scene starts, bars, bpm and duration come from
// lib/timing.js fit() with ./timing.rules.js, the same call film.js makes; `npm run audio` runs lib/fit.mjs
// first, which stamps the duration into index.html. Times shared with the picture come from shots.js (merge
// contacts, landing and rebound; the squash exit; the open's exit into the caret; each centre name's landing; the
// close's second move; the review's sheet, checks, counter, collapse and card: REVIEW_CUES).
// The bed's energy follows a tension curve (low on the line, rising through the chain, highest on the contact
// sheet); the review's card hold and the ink words are pad-only breaks, and the close returns over a short build.
//
//   node score.mjs        → assets/audio/mix-raw.wav, assets/audio/mix.wav (−14 LUFS, ≤ −1.5 dBTP), measure.json
//
// content.sound.tone: 'v2' (default) is the spectral balance and mastering chain chosen 2026-10-18; 'v1' is the
// earlier mix (blueprint keeps 'v1' by default, see its TEMPLATE.md).
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import rules from './timing.rules.js';
import { grid } from './lib/beat.js';
import { fit } from './lib/timing.js';
import { Score, master, writeMeasure, note } from './lib/audio/index.mjs';
import { mulberry32, len, adEnv, svf, biquad, normalize, soft, declick } from './lib/audio/dsp.mjs';
import { SQUASH_TIME, SQUASH_EXIT, MERGE_CUES, OPEN_OUT, namedLinks, nameAt, nameExit, closeSecondMove, REVIEW_CUES as RC,
  OPEN, openPlan, briefPhrases, PRESS, RIDE, CLOSE, CARD, pressedName } from './shots.js';
import { fill, facts } from './fx.js';

const T = fit(film, rules);
const g = grid({ bpm: T.bpm });
const laid = T.scenes.map((s) => ({ ...s, D: s.bars * 2 })); // D: the link's length in reference seconds
const K = T.bpm / 120; // film.js times are reference seconds at 120 BPM
const DUR = T.duration;
const by = (type) => laid.find((s) => s.type === type);
const at = (S, u) => S.start + u / K; // u after the link's start
const atEnd = (S, u) => S.end - u / K; // u before the link's end (exits)

const s = new Score({ duration: DUR, grid: g });
// A film that opens on a hit (the short chain: the bed's first kick and the storyboard's plucks on sample 0) made the
// AAC encode overshoot the true-peak ceiling by 4–8 dB, and HyperFrames then lowered the whole mix by as much (−17.5
// to −21.6 LUFS rendered, 2026-10-19). A 60 ms fade-in softens the first transient; the open's whoosh is unaffected.
s.fade({ in: 0.06 });
const snd = film.sound || {};
const variant = { ...(((snd.tone ?? 'v2') === 'v2') ? { mix: 'v2' } : {}) };

// ---- bed: intro on the line, build through the chain (half-time under the spheres), a pad-only break under the ink words and the
// gathering particles, 0.4 s of silence, the drop on the contact sheet, rest under the card, outro on the name.
// Every section spans whole links, so the bed works for any number of bars; consecutive links of the same
// kind are merged into one section, so the chord progression (one chord a bar) runs on across them instead
// of restarting on every link. Inside the review the choreography is timed from its start (the sheet and the
// counter take its first four bars); bars past those hold the card for reading, under a pad-only break.
const TENSION = { open: 0.45, word: 0.5, palette: 0.55, storyboard: 0.55, merge: 0.55, curves: 0.6, tracks: 0.6, ink: 0.55, close: 0.4, ...(film.tension || {}) };
const sections = [];
const push = (x) => {
  const last = sections[sections.length - 1];
  if (last && last.kind === x.kind && last.energy === x.energy && Math.abs(last.to - x.from) < 1e-9) last.to = x.to;
  else sections.push({ ...x });
};
for (const S of laid) {
  const b = S.startBar, e = b + S.bars;
  const energy = TENSION[S.type] ?? 0.6;
  if (S.type === 'open') push({ from: b, to: e, kind: 'intro', energy });
  else if (S.type === 'ink') push({ from: b, to: e, kind: 'break', energy });
  else if (S.type === 'merge') push({ from: b, to: e, kind: 'intro', energy }); // half-time under the volume shot
  else if (S.type === 'review') {
    push({ from: b, to: b + 0.8, kind: 'break' }); push({ from: b + 0.8, to: b + 1, kind: 'rest' });
    push({ from: b + 1, to: b + 3.225, kind: 'drop', energy: 0.7 }); push({ from: b + 3.225, to: b + 4, kind: 'rest' });
    // energy 1 (+1 dB of pad, the break's only layer): with tone v2 the pad is high-passed at 150 Hz, which left the card
    // hold quiet enough for the outro's resolving kick to jump 7.9 LU over it (limit 6, principle 1; 2026-10-18)
    if (e > b + 4) push({ from: b + 4, to: e, kind: 'break', energy: 1 });
  } else if (S.type === 'close') push({ from: b, to: e, kind: 'outro', energy });
  else push({ from: b, to: e, kind: 'build', energy });
}
s.beds.thread({ sections, seed: film.seed, gain: -1, ...variant });

// ---- two sounds the volume shots need ----
const SR = s.sr;
const squelch = (seed = 1) => { // rubbery merge: a gliding low tone with a viscous wobble, plus a wet band of noise
  const n = len(0.6, SR), out = new Float32Array(n), rnd = mulberry32(seed);
  let ph = 0;
  const env = adEnv(n, SR, 0.012, 0.16);
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = 92 + 130 * Math.exp(-t / 0.07) + 12 * Math.sin(2 * Math.PI * 15 * t) * Math.exp(-t / 0.2);
    ph += (2 * Math.PI * f) / SR;
    out[i] = (Math.sin(ph) + 0.35 * Math.sin(2 * ph)) * env[i];
  }
  const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) nz[i] = rnd() * 2 - 1;
  svf(nz, 'bp', (i) => 350 + 1100 * Math.exp(-i / SR / 0.08), 4);
  const ne = adEnv(n, SR, 0.004, 0.09);
  for (let i = 0; i < n; i++) out[i] += nz[i] * ne[i] * 0.6;
  return declick(normalize(soft(out, 1.3)), SR);
};
const rumble = (dur = 2.2, swell = 1.65, seed = 2) => { // deep liquid rumble that swells as the ink accelerates, then holds to the flood
  const n = len(dur, SR), out = new Float32Array(n), rnd = mulberry32(seed);
  const lo = new Float32Array(n), mid = new Float32Array(n);
  for (let i = 0; i < n; i++) { lo[i] = rnd() * 2 - 1; mid[i] = rnd() * 2 - 1; }
  biquad(lo, 'lp', 160, 0.9, 0, SR); biquad(lo, 'lp', 160, 0.9, 0, SR);
  svf(mid, 'bp', (i) => 380 + 220 * Math.sin((2 * Math.PI * 0.7 * i) / SR), 2.5);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, sw = Math.pow(Math.min(1, t / swell), 1.6) * Math.min(1, (dur - t) / 0.25);
    ph += (2 * Math.PI * (40 + 4 * Math.sin(2 * Math.PI * 0.5 * t))) / SR;
    out[i] = (lo[i] * 3.0 + mid[i] * 0.25 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 1.3 * t)) + Math.sin(ph) * 0.5) * sw;
  }
  return declick(normalize(soft(out, 1.2)), SR, 5, 30);
};

// ---- picture events (reference times from film.js) ----
const fx = (name, t, opts, mix) => s.play(name, t, opts, { send: 0.2, ...mix });
const PENTA = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6', 'B6', 'D7'];

const O = by('open');
if (O) {
  fx('whoosh', at(O, 0), { dur: 0.45, lo: 600, hi: 4000 }, { gain: -20 });
  fx('pluck', at(O, 0.45), { freq: note('A4'), dur: 0.8 }, { gain: -15 });
  // The brief as shown on screen: placeholders like {seconds} filled with this film's facts; the times are film.js's
  // (shots.js openPlan): the first phrase typed, the caret falling flat, the loop (path-type), the line tightening, the
  // line contracting into the caret.
  const ph = briefPhrases(O.brief).map((x) => fill(x, facts(T, film.fps ?? 30))), P = openPlan(ph, K, O.D);
  for (let i = 0; i < ph[0].length; i += 3) fx('typeKey', at(O, OPEN.type + i / P.cps), { seed: i }, { gain: -24, send: 0.05 });
  fx('tick', at(O, P.flat0 + OPEN.flat * 0.4), { freq: 2600 }, { gain: -23 });
  if (P.two) {
    fx('whoosh', at(O, P.loop0), { dur: OPEN.loop / K, lo: 400, hi: 5000, peak: 0.5 }, { gain: -18 }); // rises, then falls with the flow
    fx('pluck', at(O, P.landed), { freq: note('D5'), dur: 0.8 }, { gain: -16 });
    fx('bell', at(O, P.landed), { freq: note('A5'), dur: 1.2 }, { gain: -25 });
  }
  fx('tick', at(O, P.hug0), { freq: 3200 }, { gain: -24 });
  fx('tick', at(O, P.out0), { freq: 2200 }, { gain: -24 });
  fx('whoosh', atEnd(O, OPEN_OUT), { dur: OPEN_OUT / K, up: false, lo: 900, hi: 4500, peak: 0.8 }, { gain: -24 }); // the letters slide into the caret
}
const Wd = by('word');
if (Wd) {
  ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'].forEach((m, i) => fx('pluck', at(Wd, -0.05 + i * 0.0625), { freq: note(m), dur: 0.7 }, { gain: -18, pan: -0.3 + i * 0.12 }));
  fx('bell', at(Wd, 0.5), { freq: note('A6'), dur: 1.2 }, { gain: -24 });
  fx('bass', at(Wd, 1.0), { freq: note('D2'), dur: 0.3 }, { gain: -14 }); // short, so the bell's landing half a bar later stands out
  fx('bell', at(Wd, 1.5), { freq: note('F#5'), dur: 1.0 }, { gain: -21 });
  fx('pluck', at(Wd, 1.5), { freq: note('F#4'), dur: 0.6 }, { gain: -17, pan: 0.2 });
  s.duck(at(Wd, 1.5) - 0.035, { depth: -5, attack: 0.04, hold: 0, release: 0.03 });
}
const Pa = by('palette'), Sb = by('storyboard');
if (Pa) {
  ['A4', 'C#5', 'E5', 'A5'].forEach((m, k) => fx('pluck', at(Pa, -0.05 + k * 0.0625), { freq: note(m), dur: 0.9 }, { gain: -16, pan: -0.4 + k * 0.27 }));
  for (let k = 0; k < 4; k++) fx('tick', at(Pa, 0.5 + k * 0.125), { freq: 3600 }, { gain: -22 });
  ['D5', 'F#5', 'A5', 'D6'].forEach((m, k) => fx('pluck', at(Pa, 0.95 + k * 0.125), { freq: note(m), dur: 0.6 }, { gain: -19, pan: -0.4 + k * 0.27 }));
  fx('bell', at(Pa, 1.0), { freq: note('D6'), dur: 1.4 }, { gain: -26 });
}
if (Sb) {
  const lead = laid[0] === Sb ? 0 : -0.05; // first link (short chain): the line's segments open from the first frame
  ['D4', 'F#4', 'A4', 'C#5'].forEach((m, k) => fx('pluck', at(Sb, lead + k * 0.0625), { freq: note(m), dur: 0.7 }, { gain: -16 }));
  ['E5', 'B5'].forEach((m, k) => fx('pluck', at(Sb, 0.45 + k * 0.125), { freq: note(m), dur: 0.6 }, { gain: -19 }));
  for (let k = 0; k < 6; k++) fx('tick', at(Sb, 0.6 + k * 0.0625), { freq: 2200 }, { gain: -25 });
  fx('bell', at(Sb, 1.45), { freq: note('A5'), dur: 1.2 }, { gain: -20 });
}
const M = by('merge'), Cv = by('curves');
if (M) {
  fx('whoosh', at(M, 0), { dur: 1.0, lo: 300, hi: 6000, peak: 0.9 }, { gain: -17 });
  fx('impact', at(M, 1.0), { freq: 55, decay: 0.4 }, { gain: -20 });
  const [c1, c2] = MERGE_CUES.contact; // the merge shot starts 1.0u into the link
  s.add(squelch(3), at(M, 1.0 + c1), { gain: -13, send: 0.25, pan: -0.15 }); // first contact, neck forms
  s.add(squelch(5), at(M, 1.0 + c2), { gain: -15, send: 0.25, pan: 0.15 }); // third sphere joins
  fx('thud', at(M, 1.0 + MERGE_CUES.land), { freq: 62, decay: 0.16 }, { gain: -12 }); // lands and squashes
  fx('pop', at(M, 1.0 + MERGE_CUES.rebound), { freq: 160, decay: 0.08, sweep: 2 }, { gain: -22 }); // rebound
  if (!Cv) { // the squash into the line, in the merge's last SQUASH_EXIT
    fx('whoosh', atEnd(M, SQUASH_EXIT), { dur: 0.42, up: false, lo: 300, hi: 5000 }, { gain: -18 });
    fx('bass', atEnd(M, SQUASH_EXIT - SQUASH_TIME), { freq: note('D2'), dur: 0.4 }, { gain: -15 });
  }
}
if (Cv) {
  fx('whoosh', at(Cv, 0), { dur: 0.5, up: false, lo: 300, hi: 5000 }, { gain: -18 });
  fx('bass', at(Cv, 0.05), { freq: note('D2'), dur: 0.4 }, { gain: -15 });
  const ci = laid.indexOf(Cv), sh = ci > 0 && pressedName(laid, ci - 1) ? PRESS.shift : 0;
  if (sh) { // the rod drops over the merge's name and presses it into itself (rail-press): a low thud on the beat
    fx('whoosh', at(Cv, PRESS.drop), { dur: 0.3, up: false, lo: 500, hi: 3000 }, { gain: -24 });
    fx('thud', at(Cv, PRESS.hit), { freq: 58, decay: 0.2 }, { gain: -11 });
    fx('bass', at(Cv, PRESS.hit), { freq: note('D2'), dur: 0.35 }, { gain: -15 });
  }
  for (let i = 0; i < 9; i++) fx('tick', at(Cv, sh + 0.55 + i * 0.03), { freq: 3000 + i * 120 }, { gain: -24 });
  ['A4', 'D5', 'F#5', 'A5'].forEach((m, k) => fx('pluck', at(Cv, sh + 0.75 + k * 0.125), { freq: note(m), dur: 0.7 }, { gain: -19 }));
  ['D6', 'F#6', 'A6', 'D7'].forEach((m, k) => fx('bell', at(Cv, sh + RIDE.to + k * 0.02), { freq: note(m), dur: 1.3 }, { gain: -27 }));
}
const Tr = by('tracks');
if (Tr) {
  fx('whoosh', at(Tr, -0.1), { dur: 0.32, lo: 300, hi: 3000 }, { gain: -18 });
  // clip landings: the same stagger as film.js (only those that land before the playhead moves)
  const counts = [laid.length, (M ? 1 : 0) + (by('ink') ? 1 : 0), 1, null];
  let spans = 0, cur = null; // stage spans, as film.js merges them, plus the closing name
  for (const S of laid) { if (S.type === 'close') continue; const nm = S.stage ? S.stage.name : cur; if (nm && nm !== cur) spans++; cur = nm; }
  counts[3] = spans + (by('close') ? 1 : 0);
  counts.forEach((c, r) => { const stag = Math.min(0.0625, 0.5 / c); for (let i = 0; i < c; i++) { const u = 0.45 + r * 0.125 + i * stag; if (u < Tr.D - 1.0) fx('tick', at(Tr, u), { freq: 1800 + r * 300 }, { gain: -25, pan: -0.5 + r * 0.33 }); } });
  fx('whoosh', atEnd(Tr, 1.0), { dur: 1.0, lo: 800, hi: 5000, peak: 0.85 }, { gain: -18 }); // the playhead sweep
}
const In = by('ink');
if (In) {
  fx('impact', at(In, 0), { freq: 46, decay: 0.7 }, { gain: -13 });
  s.add(rumble((In.D + 0.1) / K, 1.575 / K), at(In, 0), { gain: -12, send: 0.15 });
  const words = String(In.words || '').split(/\s+/).filter(Boolean).slice(0, 3);
  words.forEach((_, i) => fx('bell', at(In, 0.45 + i * 0.55), { freq: note(['F#5', 'A5', 'D6'][i]), dur: 1.6 }, { gain: -21 }));
  fx('riser', atEnd(In, 1.0), { dur: 1.0 / K, lo: 300, hi: 6000 }, { gain: -21 }); // into the flood
}
const Rv = by('review');
if (Rv) {
  fx('impact', at(Rv, 0), { freq: 60, decay: 0.55 }, { gain: -12 });
  fx('clap', at(Rv, 0), {}, { gain: -18 });
  const r2 = mulberry32(9);
  for (let i = 0; i < 70; i++) fx('tick', at(Rv, 0.1 + (i / 70) * 1.45 + r2() * 0.03), { freq: Math.round(2000 + 5000 * i / 70) }, { gain: -30 + 6 * i / 70, pan: r2() * 1.4 - 0.7, send: 0.1 });
  fx('riser', at(Rv, 0.1), { dur: 1.5 / K, lo: 250, hi: 7000 }, { gain: -22 });
  for (let k = 0; k < 16; k++) fx('pluck', at(Rv, RC.sheet + k * RC.tile), { freq: note(PENTA[k < 11 ? k : 20 - k]), dur: 0.5 }, { gain: -21, pan: -0.6 + (k % 4) * 0.4 });
  for (let k = 0; k < 16; k++) fx('tick', at(Rv, RC.checks + k * RC.tile), { freq: 4200 }, { gain: -22, pan: -0.6 + (k % 4) * 0.4 });
  fx('bell', at(Rv, RC.counted), { freq: note('D6'), dur: 1.0 }, { gain: -21 });
  fx('whoosh', at(Rv, RC.collapse), { dur: 0.45, up: false, lo: 500, hi: 4000 }, { gain: -18 });
  fx('kick', at(Rv, RC.card), { decay: 0.3 }, { gain: -14, send: 0 });
  fx('pluck', at(Rv, RC.card), { freq: note('A4'), dur: 0.9 }, { gain: -16 });
  // the card's spec line in three parts, then the export bar along its foot (a rising swell under it)
  for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) fx('typeKey', at(Rv, RC.card + CARD.spec + k * CARD.specStep + j * 0.04), { seed: 300 + 10 * k + j }, { gain: -25, send: 0.05 });
  fx('riser', at(Rv, RC.card + CARD.bar), { dur: CARD.barDur / K, lo: 400, hi: 3000 }, { gain: -27 });
  fx('tick', at(Rv, RC.card + CARD.bar + CARD.barDur), { freq: 3400 }, { gain: -22 });
  fx('whoosh', atEnd(Rv, CARD.squash), { dur: CARD.squash / K, lo: 600, hi: 5000 }, { gain: -19 }); // the card squashes into the line
}
// Centre names: each stage's name springs in once, large, and lands on a beat (shots.js nameAt): a two-note pluck
// and a glassy tick, with a 70 ms breath in the music before it so the landing reads over the bed.
const named = namedLinks(laid);
laid.forEach((S, i) => {
  if (!named.has(i)) return;
  const ex = nameExit(S.type, laid[i + 1]), t = at(S, nameAt(S.type, S.D, ex));
  fx('pluck', t, { freq: note('A5'), dur: 0.6, bright: 0.6 }, { gain: -15, pan: 0.15 });
  fx('pluck', t + 0.03, { freq: note('D6'), dur: 0.6, bright: 0.6 }, { gain: -17, pan: -0.15 });
  fx('tick', t, { freq: 3800, decay: 0.008 }, { gain: -21 });
  // a name moved earlier by the link's exit (the merge right before its squash, short chain) lands in the low tail of
  // the second squelch, where the plucks do not lift the broadband level: a soft kick under it (check-film keys: sound)
  if (ex > 0) fx('kick', t, { decay: 0.2 }, { gain: -17, send: 0 });
  s.duck(t - 0.035, { depth: -5, attack: 0.04, hold: 0, release: 0.03 }); // a 70 ms breath in the music just before it lands
});
const Cl = by('close');
if (Cl) {
  fx('impact', at(Cl, 0), { freq: 49, decay: 0.6 }, { gain: -22 }); // the bed resolves here too (kick, bell): keep the sum under +6 LU (−22 since the card hold shortened, 2026-10-19)
  const u2 = closeSecondMove(Cl.D);
  if (u2 != null) fx('bell', at(Cl, u2), { freq: note('A6'), dur: 1.6, index: 1.0 }, { gain: -23, send: 0.4 }); // the underline's second move, last downbeat
  // the line thickens into a bar (a short swell), the blade cuts it into the name left to right (a pluck per letter as
  // the blade passes, rail-press's cut phase 0.55–0.97 of its beat), the name lands on the beat (a tick and a bell)
  const c0 = CLOSE.cut, cd = CLOSE.cutDur, done = c0 + cd;
  fx('whoosh', at(Cl, c0), { dur: (0.55 * cd) / K, lo: 300, hi: 2500, peak: 0.9 }, { gain: -24 });
  const name = String(Cl.name || '');
  for (let i = 0; i < Math.min(13, name.length); i++) fx('pluck', at(Cl, c0 + cd * (0.6 + (0.36 * i) / Math.max(1, name.length - 1))), { freq: note(PENTA[i % 8]), dur: 0.5 }, { gain: -27, pan: -0.6 + i * 0.1 });
  fx('tick', at(Cl, done), { freq: 3800, decay: 0.01 }, { gain: -19 });
  fx('kick', at(Cl, done), { decay: 0.2 }, { gain: -19, send: 0 }); // the landing must stand out over the outro (check-film keys: sound)
  fx('bell', at(Cl, done), { freq: note('D6'), dur: 3.5 }, { gain: -25, send: 0.4 }); // −25 (was −22): the same loudness jump, 2026-10-18
  fx('bell', at(Cl, CLOSE.line), { freq: note('A5'), dur: 2.5 }, { gain: -24, send: 0.4 });
  const url = String(Cl.url || ''), cps = Math.max(110, url.length / CLOSE.urlDur);
  for (let i = 0; i < url.length; i += 4) fx('typeKey', at(Cl, CLOSE.url + i / cps), { seed: 100 + i }, { gain: -28, send: 0.05 });
}

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const measured = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(((snd.tone ?? 'v2') === 'v2') ? { tone: 'v2' } : {}) });
await writeMeasure('.', measured, { duration: DUR, bpm: T.bpm }); // assets/audio/measure.json (nothing on screen quotes it)
