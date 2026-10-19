// score.mjs — the ink sound: the shared `inkbeat` bed on the film's beat grid, plus one synthesised effect
// for every picture event (slams, full stops, the bloom's drip and surges, the drop, steps, transitions).
// Reads content.js through plan.js (lib/timing.js fit() with ./timing.rules.js), so every sound sits on the same
// beat as its picture and the mix is exactly the fitted length. `npm run audio` runs lib/fit.mjs first, which
// stamps that length onto index.html. Writes assets/audio/mix.wav (−14 LUFS, true peak ≤ −1.5 dBTP) and
// assets/audio/measure.json, whose measured `I` is the {lufs} on screen. The bed is written for 128 BPM and plays
// at the film's fitted tempo (template default 124).
// content.sound.tone: 'v2' (default) is the spectral balance and mastering chain chosen 2026-10-18; 'v1' is the
// earlier mix (blueprint keeps 'v1' by default, see its TEMPLATE.md).
import { mkdir } from 'node:fs/promises';
import film from './content.js';
import { plan, CANVAS } from './plan.js';
import { events } from './lib/timing.js';
import rules, { dropBars } from './timing.rules.js';
import { Score, master, writeMeasure, mulberry32 } from './lib/audio/index.mjs';

const P = plan(film); // throws on content that breaks the registry, the limits, the bar ceiling or the reading time
const { g, B } = P;
const dur = P.duration;

const s = new Score({ duration: dur, grid: g });
const snd = film.sound || {};
const variant = { ...(((snd.tone ?? 'v2') === 'v2') ? { mix: 'v2' } : {}) };

// ---------- music: build without kick until the name, half-bar silence, drop on the name, outro on the closing card ----------
// Sections are whole bars taken from the fitted scenes, so the bed follows any length. A claim gets the second drop:
// the bar before it is a build again (no kick, the riser, its last half bar silent while the frame exposes to
// white), and the drop lands on the whiteout's hit.
const scenes = P.scenes;
const drops = dropBars(P.T.scenes);
const dropBar = drops[0] ?? Math.round(scenes.at(-1).startBar / 2);
const cta = scenes.find((x) => x.type === 'cta');
const endBar = P.bars;
// Energy is a tension curve over the drop: highest on the name, easing through the steps and the numbers, so the
// name stays the loudest moment (the progression runs on across the drop's scenes); a claim's drop, the film's climax,
// sits a little over it.
const TENSION = { name: 0.85, steps: 0.7, ruler: 0.65, counter: 0.65, claim: 0.95, ...(film.tension || {}) };
const sections = [{ from: 0, to: dropBar, kind: 'build', energy: 0.6 }];
const dropEnd = cta && cta.startBar > dropBar ? cta.startBar : endBar;
const rebuild = drops.slice(1).map((b) => [Math.max(dropBar + 1, b - 1), b]).filter(([a, b]) => b > a);
for (const x of scenes) {
  const a = Math.max(x.startBar, dropBar), z = Math.min(x.startBar + x.bars, dropEnd);
  if (z > a) sections.push({ from: a, to: z, kind: 'drop', energy: TENSION[x.type] ?? 0.7 });
}
for (const [a, b] of rebuild) {
  // cut the drop sections round the rebuild bar
  for (let k = sections.length - 1; k >= 1; k--) {
    const x = sections[k];
    if (x.kind !== 'drop' || x.to <= a || x.from >= b) continue;
    const parts = [x.from < a && { ...x, to: a }, x.to > b && { ...x, from: b }].filter(Boolean);
    sections.splice(k, 1, ...parts);
  }
  sections.push({ from: a, to: b, kind: 'build', energy: 0.7 });
}
sections.sort((p, q) => p.from - q.from);
if (dropEnd < endBar) sections.push({ from: dropEnd, to: endBar, kind: 'outro', energy: 0.6 });
if (film.bed?.file) await s.addFile(film.bed.file, 0, { offset: film.bed.offset || 0, gain: film.bed.gain ?? -3 });
else s.beds.inkbeat({ sections, seed: film.seed, ...variant });

// ---------- custom voices ----------
const SR = 48000;
// a drop of ink hitting paper: a fast rising sine blip, a smaller second blip, a soft low body
const drip = (seed = 1) => {
  const n = Math.round(SR * 0.45), out = new Float32Array(n), r = mulberry32(seed);
  const blip = (t0, f0, f1, a, d) => {
    let ph = 0;
    for (let i = Math.round(t0 * SR); i < n; i++) {
      const t = i / SR - t0;
      const f = f0 * Math.pow(f1 / f0, Math.min(1, t / 0.035));
      ph += (2 * Math.PI * f) / SR;
      out[i] += a * Math.sin(ph) * Math.exp(-t / d) * Math.min(1, t / 0.002);
    }
  };
  blip(0, 380, 1500, 1, 0.05);
  blip(0.11, 520, 1900, 0.35, 0.035);
  for (let i = 0; i < n; i++) { const t = i / SR; out[i] += 0.25 * Math.sin(2 * Math.PI * 95 * t) * Math.exp(-t / 0.09) + 0.02 * (r() - 0.5) * Math.exp(-t / 0.02); }
  let m = 0; for (const v of out) m = Math.max(m, Math.abs(v));
  for (let i = 0; i < n; i++) out[i] /= m;
  return out;
};

// ---------- effects on picture events ----------
const typeRun = (t0, n, cps) => {
  const step = Math.max(1, Math.round(cps / 30)); // about 30 keys a second at most
  for (let k = 0; k < n; k += step) s.play('typeKey', t0 + k / cps, { seed: k + 1 }, { gain: -27, pan: 0.15 });
};
const firstHit = P.events.find((e) => e.kind === 'slam')?.t ?? -1;
for (const e of P.events) {
  const t = e.t;
  switch (e.kind) {
    case 'slam': {
      // the film's first hit comes out of near silence, where the render's AAC encode overshoots most (about +2 dB
      // true peak, measured 2026-10-19; the renderer then lowers the whole mix by 1 dB to stay under −1 dBTP): it
      // is 6 dB softer
      const soft = t < firstHit + 1e-6 ? -6 : 0;
      s.play('stamp', t, { freq: 620, to: 110, decay: 0.07, seed: (e.k ?? 0) + 3 }, { gain: -13 + soft });
      s.play('thud', t, { freq: 62, decay: 0.14 }, { gain: -15 + soft });
      if (e.stop) s.play('rim', t + 0.01, { freq: 1550 }, { gain: -17 + soft, pan: 0.2, send: 0.15 });
      break;
    }
    case 'rise': s.play('whoosh', t - 0.12, { dur: 0.35, up: true, lo: 400, hi: 4000 }, { gain: -21, send: 0.2 }); break;
    case 'warble': s.play('glitch', t, { dur: Math.min(1.2, e.dur), rate: 18 }, { gain: -27, pan: -0.2 }); break;
    case 'drip': s.add(drip(film.seed), t, { gain: -10, send: 0.45 }); break;
    case 'surge':
      s.play('whoosh', t - 0.05, { dur: e.dur, up: true, lo: 70, hi: e.big ? 1600 : 1100, q: 0.8, peak: 0.4 }, { gain: e.big ? -12 : -15, send: 0.3 });
      s.play('sub', t, { freq: e.big ? 43.65 : 49, dur: e.dur * 0.7, attack: 0.15, release: 0.4 }, { gain: e.big ? -17 : -20 });
      break;
    case 'drop':
      if (e.soft) { s.play('impact', t, { freq: 46, decay: 0.6 }, { gain: -17 }); break; }
      s.play('impact', t, { freq: 44, decay: 0.9 }, { gain: -11 });
      s.duck(t, { depth: -4, release: 0.5 });
      break;
    case 'jump': s.play('stamp', t, { freq: 1300, to: 420, decay: 0.035 }, { gain: -21, pan: -0.15 }); break;
    case 'step':
      s.play('stamp', t, { freq: 760, to: 140, decay: 0.06, seed: e.k + 9 }, { gain: -15 });
      if (e.streak) s.play('glitch', t, { dur: 0.1, rate: 40, seed: e.k + 1 }, { gain: -25, pan: e.k % 2 ? 0.4 : -0.4 });
      break;
    case 'ruler': for (let k = 0; k < 8; k++) s.play('tick', t + k * 0.055, { freq: 2800 + 90 * k }, { gain: -24, pan: -0.5 + k / 7 }); break;
    case 'roll': for (let k = 0; k < 10; k++) s.play('tick', t + e.dur * (1 - Math.pow(1 - k / 10, 1 / 3)), { freq: 2400 + 60 * k }, { gain: -22 }); break;
    case 'land': s.play('rim', t, { freq: 1550 }, { gain: -17, pan: 0.2, send: 0.15 }); break;
    // the dot lands as the cursor: a stamp under the chime, so the landing has its onset over the outro's first bar
    case 'bell': s.play('chime', t, { freq: 1396.9, decay: 0.9 }, { gain: -19, send: 0.35 }); s.play('stamp', t, { freq: 900, to: 200, decay: 0.05, seed: 5 }, { gain: -14 }); s.play('rim', t, { freq: 1550 }, { gain: -16, pan: 0.2 }); break;
    case 'type': typeRun(t, e.n, e.cps || 60); break;
    case 'whoosh': s.play('whoosh', t, { dur: e.dur, up: true, lo: 250, hi: 6000 }, { gain: -15, send: 0.25 }); break;
    case 'impact': s.play('impact', t, { freq: 50, decay: e.soft ? 0.45 : 0.6 }, { gain: e.soft ? -17 : -13 }); break;
    // swap: the next ground opens from the dot (aperture-swap), a dry tick on the beat over the word's stamp
    case 'aperture': s.play('tick', t, { freq: e.shape === 'circle' ? 3400 : e.shape === 'band' ? 2900 : 2500 }, { gain: -21, pan: e.k % 2 ? 0.3 : -0.3 }); break;
    // burst (collapse-burst): the word drains into the dot (a short reversed swell), silence for the hold, an
    // impact on the burst, a quiet arp as the particles condense into the next word
    case 'collapse': s.play('whoosh', t, { dur: Math.max(0.15, e.dur * 0.6), up: false, lo: 300, hi: 2600 }, { gain: -22, send: 0.2 }); break;
    case 'burst': s.play('impact', t, { freq: 56, decay: 0.5 }, { gain: -14 }); s.play('rim', t, { freq: 2100 }, { gain: -18, send: 0.25 }); break;
    case 'form': for (let k = 0; k < 6; k++) s.play('tick', t + e.dur * (k / 6), { freq: 2200 + 180 * k }, { gain: -26, pan: -0.4 + k * 0.16 }); break;
    // the whiteout's hit (the second drop: the bed's kick and impact land with it)
    case 'whitehit': s.play('impact', t, { freq: 42, decay: 1.0 }, { gain: -11 }); s.duck(t, { depth: -4, release: 0.5 }); break;
    // counter-portal: a rising whoosh through the counter, landing on the beat
    case 'clear': s.play('whoosh', t, { dur: 0.25, up: true, lo: 800, hi: 6000 }, { gain: -24, send: 0.15 }); break;
    case 'portal': s.play('whoosh', t, { dur: e.dur, up: true, lo: 200, hi: 7000 }, { gain: -15, send: 0.3 }); break;
    // anchor-swap scan: a soft tick as the hairline starts, a light whoosh under its sweep
    case 'scan': s.play('tick', t, { freq: 3000 }, { gain: -22 }); s.play('whoosh', t, { dur: e.dur, up: false, lo: 500, hi: 5000 }, { gain: -21, send: 0.2 }); break;
    // the resting dot's in-place bounce lands with a quiet rim tick
    case 'bounce': s.play('rim', t, { freq: 1700 }, { gain: -24, pan: 0.2, send: 0.1 }); break;
  }
}

// A high woodblock on every turn (bloom, name, steps), so each turn has an onset above 1.5 kHz over its low impact.
for (const key of events(P.T, film, rules).keys) if (key.kind === 'turn') s.play('rim', key.t, { freq: 2300, seed: key.scene % 4 }, { gain: -18, pan: -0.15, send: 0.15 });

await mkdir('assets/audio', { recursive: true });
await s.write('assets/audio/mix-raw.wav');
// {lufs} on screen is the master's measured loudness: measure.json, which registry.js imports.
const mastered = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5, ...(((snd.tone ?? 'v2') === 'v2') ? { tone: 'v2' } : {}) });
await writeMeasure('.', mastered, { duration: dur, bpm: P.T.bpm });
console.log(`ink: ${P.scenes.length} scenes, ${P.bars} bars at ${P.T.bpm} bpm = ${dur.toFixed(3)} s, ${P.events.length} sound events, drop at ${P.drop?.toFixed(3) ?? '—'} s, ${CANVAS.width}×${CANVAS.height}`);
