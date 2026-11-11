// score.mjs — the Scroll sound: the `thread` bed (plucks, a pad, a soft four-on-the-floor: one long line that keeps
// moving) on the film's beat grid, plus one effect for each picture event, all placed from choreo.js plans at the
// fitted scene lengths (the module film.js draws from), so picture and sound cannot drift. `npm run audio` runs
// lib/fit.mjs first, which stamps the fitted length onto index.html. Writes assets/audio/mix.wav (−14 LUFS, true peak
// ≤ −1.5 dBTP after the renderer's AAC) and assets/audio/measure.json.
//
// Arrangement, from the scenes: the opening is the intro; quotes before the climax are a build with the reading drop
// (the melody rests while text is read); a ratchet raises the energy; the unfold is the drop (the claim lands inside
// it); quotes after it dip for reading; the lock-up is the outro. Effects: a dry whoosh under each scroll whose sweep
// follows its direction, a soft click on each lock, a wheel-detent tick per ratchet step (rising), a pencil tick on each
// underline, a soft pop per phrase (rising through the film), a paper slide and a swell under the unfold, an impact and
// a chime on the claim and on the lock-up, keystrokes under the address, a click as the roll lands.
// content.sound = { bed: 'thread', seed } picks another bed preset or seed; content.bed = { file, offset, gain }
// replaces the synthesised bed with a generated one.
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import rules from './timing.rules.js';
import { fit } from './lib/timing.js';
import { grid } from './lib/beat.js';
import { plan, C } from './choreo.js';
import { offsets } from './sheet.js';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';

const T = fit(film, rules);
const errs = T.notes.filter((n) => n.level === 'error');
if (errs.length) { console.error(errs.map((n) => n.msg).join('\n')); process.exit(1); }
const g = grid({ bpm: T.bpm, beatsPerBar: T.beatsPerBar });
const B = T.beat, BAR = T.bar, D = T.duration;
const S = T.scenes.map((s, i) => ({ ...s, p: plan(s, { i, scenes: T.scenes, content: film }, B, s.end - s.start, film) }));
const OFFS = offsets(film);
const s = new Score({ duration: D, grid: g });
const snd = film.sound || {};

// ---------- the bed ----------
const bar = (t) => t / BAR;
const climax = S.find((x) => x.type === 'unfold') ?? (S.length > 2 ? S.at(-2) : null);
const lock = S.at(-1);
if (film.bed?.file) await s.addFile(film.bed.file, 0, { offset: film.bed.offset || 0, gain: film.bed.gain ?? -3 });
else {
  const sections = [];
  const add = (from, to, kind, energy, reading) => { if (to > from + 1e-6) sections.push({ from: bar(from), to: bar(to), kind, energy, ...(reading ? { reading } : {}) }); };
  const first = S[1]?.start ?? lock.start;
  add(0, first, 'intro', 0.5);
  if (climax) {
    const rat = S.find((x) => x.type === 'ratchet' && x.start < climax.start);
    add(first, rat ? rat.start : climax.start, 'build', 0.5, true);
    if (rat) add(rat.start, climax.start, 'build', 0.6);
    add(climax.start, climax.end, 'drop', 0.85);
    add(climax.end, lock.start, 'build', 0.55, true);
  }
  add(lock.start, D, 'outro', 0.5);
  s.beds[snd.bed ?? 'thread']({ mix: 'v2', seed: snd.seed ?? film.seed ?? 5, sections });
}

// ---------- effects ----------
const tick = (t, freq = 3200, gain = -17) => s.play('tick', t, { freq }, { gain, send: 0.05 });
const click = (t, gain = -14) => { s.play('rim', t, { freq: 1250 }, { gain, send: 0.08 }); s.play('thud', t, { freq: 85, decay: 0.08 }, { gain: gain + 1 }); };
const pop = (t, f = 520, gain = -21) => s.play('pop', t, { freq: f }, { gain, send: 0.1 });
const pencil = (t, k = 0) => s.play('rim', t, { freq: 1700 + 110 * (k % 5) }, { gain: -18, send: 0.1 });
const whoosh = (t0, dur, up, gain = -19, hi = 4500) => s.play('whoosh', Math.max(0, t0 - 0.02), { dur: dur * 0.8, up, lo: 300, hi, peak: 0.25 }, { gain, send: 0.12 });
let nPop = 0, nMark = 0;
const breaths = [];
S.forEach((x, i) => {
  const t0 = x.start, p = x.p, o = OFFS[i];
  for (const m of p.moves) {
    const a = t0 + m.from, b = t0 + m.to;
    if (m.kind === 'unroll') { s.play('whoosh', a + 0.02, { dur: (b - a) * 0.95, up: false, lo: 200, hi: 3200, peak: 0.2 }, { gain: -18, send: 0.2 }); }
    if (m.kind === 'detent' || m.kind === 'reach') { whoosh(a, b - a, o.to > o.from, -21); click(b, -14); }
    if (m.kind === 'reel') { tick(a, 3400, -13); whoosh(a, b - a, true, -18, 5600); click(b, -15); }
    if (m.kind === 'unfold') { s.play('whoosh', a, { dur: (b - a) * 0.9, up: false, lo: 160, hi: 1800, peak: 0.6 }, { gain: -19, send: 0.15 }); s.play('swell', Math.max(0, b - 0.9), { freqs: [293.7, 370, 440], dur: 0.9 }, { gain: -24, send: 0.3 }); click(b, -12); tick(b, 3000, -15); }
    if (m.kind === 'fling') { tick(a, 3400, -12); s.play('riser', Math.max(0, a - 0.6), { dur: 0.6, lo: 400, hi: 4000 }, { gain: -26 }); s.play('whoosh', a, { dur: b - a, up: false, lo: 200, hi: 6000, peak: 0.2 }, { gain: -16, send: 0.2 }); }
    if (m.kind === 'rollup') { s.play('whoosh', a, { dur: (b - a) * 0.85, up: true, lo: 200, hi: 2600, peak: 0.25 }, { gain: -19, send: 0.15 }); click(b, -11); tick(b, 3600, -14); breaths.push(b); }
  }
  if (p.markAt != null) { pencil(t0 + p.markAt, nMark++); if (x.type === 'open') { click(t0 + p.markAt, -12); tick(t0 + p.markAt, 2600, -16); } }
  for (const ph of p.phrases || []) pop(t0 + ph.t, 480 + 16 * nPop, nPop++ === 0 ? -16 : -21);
  if (x.type === 'open') {
    tick(t0 + (p.phrases[0]?.t ?? 0), 3600, -15);
    if (p.miniAt != null) for (let k = 0; k < 4; k++) tick(t0 + p.miniAt + k * 0.25 * B, 2400 + 260 * k, -24);
  }
  if (x.type === 'quote' && !(x.move && x.move !== 'none')) tick(t0, 3600, -14);
  if (x.type === 'quote' && x.move && x.move !== 'none' && p.phrases[0]) tick(t0 + p.phrases[0].t, 3400, -15);
  if (x.type === 'ratchet') (p.docks || []).forEach((d, k) => { s.play('tick', t0 + d.t, { freq: 2200 + 140 * k, decay: 0.008 }, { gain: -15, send: 0.06 }); s.play('rim', t0 + d.t, { freq: 900 + 40 * k }, { gain: -22 }); });
  if (x.type === 'unfold') {
    tick(t0, 3400, -12);
    const c = t0 + p.captionAt;
    s.play('impact', c, {}, { gain: -12 }); s.play('chime', c, { notes: 3 }, { gain: -18, send: 0.35 }); tick(c, 3800, -11); s.play('thud', c, { freq: 70, decay: 0.12 }, { gain: -12 });
    s.duck(c + 0.12, { depth: -4, attack: 0.05, hold: 0.3, release: 0.8 });
    breaths.push(t0, t0 + p.moves[1].to, c);
  }
  if (x.type === 'lockup') {
    const land = t0 + p.landAt;
    s.play('impact', land, { freq: 52 }, { gain: -13 }); click(land, -12); s.play('chime', land, {}, { gain: -20, send: 0.4 });
    pop(t0 + p.nameAt, 500, -18);
    for (let k = 0; k < x.url.length; k += 2) s.play('typeKey', t0 + p.urlAt + (k / x.url.length) * (p.urlEnd - p.urlAt), { seed: 40 + k }, { gain: -25 });
  }
});
// a breath in the music before the keys that land inside the drop and the groove (a dense bed hides their onset)
for (const t of breaths) s.duck(Math.max(0, t - 0.075), { depth: -6, attack: 0.01, hold: 0.055, release: 0.01 });

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, tone: 'v2' });
await writeMeasure('.', r, { duration: D });
