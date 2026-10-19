// beds.mjs — one full-length music bed per mode, laid on the score's beat grid.
// beds.<preset>(score, { sections, key, energy, seed, gain, rotate, vary, mix }) — see README.md for each preset.
//
// sections: [{ from: bar, to: bar, kind, energy?, reading?, restart? }] with kind one of
//   intro  sparse: pad and a light pulse
//   build  layers enter; no big drums yet
//   drop   the full groove (put it on the product name)
//   break  pad only, for reading
//   rest   silence from the bed (tails ring out)
//   outro  the groove leaves, a resolving chord rings to the end
// Bars may be fractional (e.g. to: 7.5). Bars not covered take the kind of the section before them.
// Omit sections for the preset's default arrangement over the whole duration.
//   energy   0..1 for this section (overrides opts.energy)
//   reading  true: the "reading drop" — the section keeps its kick, pad and bass but loses the melodic layer that
//            sits in 1–4 kHz (pulse, arpeggio, marimba line, plucks, motif); 'duck': everything stays, the music
//            buses sit 3 dB lower
//   restart  true: start the chord progression again here (it restarts on its own at every drop and outro)
//
// Harmony: one chord per bar, changing on bar lines. The progression runs on across sections and starts again
// only where a drop or the outro begins (or a section says restart), so a drop lands on the home chord. A drop
// that starts inside a bar keeps the home chord to the end of its first full bar. When a run of the progression
// is cut off by the next drop or outro, its last bar plays the progression's last chord (the turnaround), so the
// cadence into the home chord is complete. Every layer (pad, melody, bass) reads the same A.chord().

import { voicing, bassNote, keyShift, mtof } from './notes.mjs';
import { seedOf, mulberry32, clamp } from './dsp.mjs';

export const KINDS = ['intro', 'build', 'drop', 'break', 'rest', 'outro'];

// Arrangement ------------------------------------------------------------------------------------

// shape: [[kind, size]] — size >= 1 is bars, 0 < size < 1 is a fraction of the film, '*' takes the rest.
const defaultSections = (nb, shape) => {
  let fixed = 0;
  const sizes = shape.map(([, z]) => (z === '*' ? 0 : z >= 1 ? z : Math.max(1, Math.round(z * nb))));
  sizes.forEach((z) => { fixed += z; });
  const star = shape.findIndex(([, z]) => z === '*');
  if (fixed > nb || (star >= 0 && fixed > nb - 1)) {
    const k = (nb - (star >= 0 ? 1 : 0)) / fixed;
    let acc = 0;
    sizes.forEach((z, i) => { sizes[i] = Math.max(0, Math.floor(z * k)); acc += sizes[i]; });
    fixed = acc;
  }
  if (star >= 0) sizes[star] = nb - fixed;
  const out = [];
  let b = 0;
  shape.forEach(([kind], i) => { if (sizes[i] > 0) { out.push({ from: b, to: b + sizes[i], kind }); b += sizes[i]; } });
  if (b < nb && out.length) out[out.length - 1].to = nb;
  return out;
};

const EPS = 1e-9;
// Metric level of a beat position: 0 bar downbeat, 1 half bar, 2 beat, 3 off-8th, 4 anything finer.
const metricLevel = (beat, bpb) => {
  const b = beat - Math.floor(beat / bpb + EPS) * bpb, near = (x) => Math.abs(x - Math.round(x)) < 1e-6;
  if (b < 1e-6) return 0;
  if (near(b)) return Math.abs(b - bpb / 2) < 1e-6 ? 1 : 2;
  return near(b * 2) ? 3 : 4;
};
// Velocity (0..1, feeds Score.vary's brightness) and gain accent (dB) per metric level. Accents only soften the
// weaker positions, so they never raise a peak the limiter has to catch.
const VEL = [1, 0.75, 0.5, 0.25, 0];
const ACCENT = [0, -0.2, -0.4, -0.7, -1];
// Energy → bed level: (e − 0.6) × 2.5 dB, so energy 1 sits 1 dB over the reference and 0.2 sits 1 dB under.
const LIFT = 2.5;

const arrange = (s, opts, def) => {
  const g = s.grid, bpb = g.beatsPerBar, nb = Math.max(1, Math.ceil((s.duration - g.t0) / g.bar - 1e-6));
  const curve = typeof opts.energy === 'function' ? opts.energy : null;
  const baseE = curve ? 0.6 : opts.energy ?? 0.6;
  let raw = opts.sections?.length ? opts.sections.map((x) => ({ ...x })) : defaultSections(nb, def.shape);
  raw = raw.filter((x) => x.to > x.from && x.from < nb).sort((a, b) => a.from - b.from);
  for (const x of raw) if (!KINDS.includes(x.kind)) throw new Error(`bed: unknown section kind "${x.kind}" (use ${KINDS.join(', ')})`);
  const secs = [];
  let cur = 0;
  const keep = (x) => ({ kind: x.kind, energy: x.energy, reading: x.reading, restart: x.restart });
  raw.forEach((x) => {
    if (x.from > cur) { if (secs.length) secs[secs.length - 1].to = x.from; else secs.push({ from: 0, to: x.from, ...keep(x) }); }
    secs.push({ from: Math.max(x.from, cur), to: Math.min(x.to, nb), ...keep(x) });
    cur = Math.min(x.to, nb);
  });
  if (!secs.length) secs.push({ from: 0, to: nb, kind: 'drop' });
  secs[secs.length - 1].to = nb;
  const energyAt = (x, bar) => clamp(x.energy ?? (curve ? curve(bar) : baseE), 0, 1);
  secs.forEach((x, i) => {
    x.index = i;
    x.e = energyAt(x, x.from);
    x.reading = x.reading === 'duck' ? 'duck' : x.reading ? 'thin' : null;
  });
  const at = (bar) => { for (let i = secs.length - 1; i >= 0; i--) if (bar >= secs[i].from - EPS) return secs[i]; return secs[0]; };

  // Harmonic runs: the progression starts again at the first section, at every drop or outro that follows
  // another kind, and at a section marked restart. `start` is the first bar line of the run (a run that begins
  // inside a bar holds its first chord through the next full bar); `turn` is where the turnaround chord begins.
  const runs = [];
  secs.forEach((x, i) => {
    const p = secs[i - 1];
    if (!p || x.restart === true || (x.kind === 'drop' && p.kind !== 'drop') || (x.kind === 'outro' && p.kind !== 'outro')) runs.push({ from: x.from, to: x.to, start: Math.ceil(x.from - EPS) });
    else runs[runs.length - 1].to = x.to;
    x.run = runs.length - 1;
  });
  runs.forEach((r, i) => {
    r.index = i;
    r.turn = null;
    const nx = runs[i + 1];
    if (nx) { const tf = Math.floor(nx.from - 1 + EPS); if (tf >= r.start + 1) r.turn = tf; }
  });
  // Blocks: consecutive sections of one kind (the unit for layer rotation and fills).
  const blocks = [];
  secs.forEach((x, i) => {
    const p = secs[i - 1];
    if (!p || p.kind !== x.kind || x.restart === true) blocks.push({ from: x.from, to: x.to, kind: x.kind, start: Math.ceil(x.from - EPS) });
    else blocks[blocks.length - 1].to = x.to;
    x.block = blocks.length - 1;
  });

  const tr = keyShift(def.key, opts.key);
  const rotate = opts.rotate ?? 4;
  const A = {
    g, bpb, nb, secs, runs, blocks, tr, at,
    seed: opts.seed ?? 1,
    gain: opts.gain ?? 0,
    vary: opts.vary !== false,
    v2: opts.mix === 'v2',
    // eg(e): the energy used for gain terms (level, pad, pulse); the climax may sit up to 1 dB over the reference.
    eg: (e) => e,
    kindAt: (bar) => (bar >= nb ? null : at(bar).kind),
    next: (x) => secs[x.index + 1] || null,
    prev: (x) => secs[x.index - 1] || null,
    t: (bar) => g.t0 + bar * g.bar,
    energyAt: (bar) => energyAt(at(bar), bar),
    // harm(bar) → { n, phrase, kind, home, turn, run }: n counts bars from the run's first bar line; kind is the
    // section at the start of the current chord slot (so a chord never changes inside a bar except where a run
    // begins); home is true in the outro (hold the home chord); turn is true in the run's turnaround bar.
    harm(bar) {
      const x = at(bar), r = runs[x.run];
      const slot = Math.max(r.from, Math.floor(bar + EPS));
      const n = Math.max(0, Math.floor(bar + EPS) - r.start);
      const kind = at(slot).kind;
      return { n, phrase: Math.floor(n / 4), kind, home: kind === 'outro', turn: r.turn != null && bar >= r.turn - EPS, run: r };
    },
    // chord(prog, bar) — the chord symbol every layer plays at `bar` (see Harmony above).
    chord(prog, bar) {
      const h = A.harm(bar);
      return h.home ? prog[0] : h.turn ? prog[prog.length - 1] : prog[h.n % prog.length];
    },
    // Back-compatible alias: the chord index used to be counted per section.
    idx: (x, bar) => A.harm(bar).n,
    // Layer rotation and fills, for a bar position: group 'A' | 'B' alternates every `rotate` bars of a block;
    // fill is the last two beats of every 8th bar of a drop block, and of a drop block of 4 bars or more that
    // hands over to another kind. fillStep counts 16ths into the fill (0..7).
    info(barF) {
      const x = at(barF + EPS), bk = blocks[x.block];
      const bb = Math.max(0, Math.floor(barF + EPS) - bk.start);
      const beat = barF * bpb;
      let fillFrom = null;
      if (bk.kind === 'drop') {
        if (bb % 8 === 7) fillFrom = (Math.floor(barF + EPS) + 1) * bpb - 2;
        const endBeat = bk.to * bpb;
        if (bk.to < nb - EPS && bk.to - bk.from >= 4 - EPS && beat >= endBeat - 2 - EPS) fillFrom = endBeat - 2;
      }
      const fill = fillFrom != null && beat >= fillFrom - EPS && beat < fillFrom + 2 - EPS;
      return {
        group: Math.floor(bb / rotate) % 2 ? 'B' : 'A', blockBar: bb, fill,
        fillStep: fill ? Math.round((beat - fillFrom) * 4) : -1,
        reading: x.reading, thin: x.reading === 'thin',
      };
    },
    // Per-bar pieces, split at section boundaries. c.h is the harmony at the piece's start; c.idx = c.h.n.
    chunks() {
      const out = [];
      for (const x of secs) for (let b = Math.floor(x.from); b < Math.ceil(x.to - EPS); b++) {
        const start = Math.max(b, x.from), end = Math.min(b + 1, x.to);
        if (end - start > 1e-6) { const h = A.harm(start); out.push({ start, end, bar: b, sec: x, h, idx: h.n, ...A.info(start) }); }
      }
      return out;
    },
    // Iterate steps (div per beat) over the whole bed.
    steps(div, fn) {
      const total = Math.round(nb * bpb * div), perBar = bpb * div;
      for (let i = 0; i < total; i++) {
        const beat = i / div, bar = beat / bpb, x = at(bar + EPS), nx = A.next(x);
        fn({ i, beat, bar: Math.floor(bar + EPS), barF: bar, pos: i % perBar, t: g.bt(beat), sec: x, kind: x.kind, e: energyAt(x, bar),
          local: bar - x.from, progress: (bar - x.from) / (x.to - x.from), left: x.to - bar, next: nx ? nx.kind : null,
          h: A.harm(bar), ...A.info(bar) });
      }
    },
    // vox(st, name, opts) → [buffer, accent dB]: a voice for a step, with velocity from the step's metric level
    // (brightest on the downbeat; 0.2–1 dB softer and darker down to the 16ths) and four rotating samples.
    // vary: false in the bed options turns this off (plain voice(), no accent).
    vox(st, name, o = {}, { vel } = {}) {
      if (!A.vary) return [s.voice(name, o), 0];
      const lv = metricLevel(st.beat, bpb);
      return [s.vary(name, o, { vel: vel ?? VEL[lv] }), ACCENT[lv]];
    },
    // hit(st, name, opts, mix, t = st.t) — vox() + add().
    hit(st, name, o, mix = {}, t = st.t) {
      const [b, acc] = A.vox(st, name, o);
      s.add(b, t, { ...mix, gain: (mix.gain ?? 0) + acc });
    },
  };

  // Energy curve and reading dips as bus levels ('music' = every bed bus), per bar piece.
  const segs = [];
  for (const x of secs) for (let b = Math.floor(x.from); b < Math.ceil(x.to - EPS); b++) {
    const start = Math.max(b, x.from), end = Math.min(b + 1, x.to);
    if (end - start <= 1e-6 || x.kind === 'rest') continue;
    const gain = Math.round(((A.eg(energyAt(x, start)) - 0.6) * LIFT + (x.reading === 'duck' ? -3 : 0)) * 100) / 100;
    const last = segs[segs.length - 1];
    if (last && last.gain === gain && Math.abs(last.to - start) < 1e-6) last.to = end;
    else segs.push({ from: start, to: end, gain });
  }
  for (const x of segs) s.level(A.t(x.from), A.t(x.to), { gain: x.gain, bus: 'music', ramp: Math.min(0.06, g.beat / 4) });

  // mix: 'v2' — the spectral-balance trial (D3), off by default: reverb lowcut 400 Hz / highcut 12 kHz and a
  // 7 kHz +3 dB shelf on the music buses (presets that are already bright skip the shelf).
  if (A.v2) {
    s.reverbOpts = { lowcut: 400, highcut: 12000, ...s.reverbOpts };
    if (!def.bright) s.eq('music', [{ type: 'highshelf', freq: 7000, q: 0.7, gain: 3 }]);
  }
  return A;
};

// Shared layers ----------------------------------------------------------------------------------

const jitter = (seed, i, amt = 0.8) => (mulberry32(seedOf('j', seed, i))() * 2 - 1) * amt;
const pat = (p, pos) => { const c = p[pos % p.length]; return c === 'X' ? 2 : c === 'x' ? 1 : c === 'o' ? 0.5 : 0; };

// Pads: one chord per bar (merged while the chord and settings repeat), two detuned copies panned apart.
// mix 'v2': 150 Hz highpass, −3 dB at 300 Hz and a little air unless the preset sets its own.
const padLayer = (s, A, { prog, center = 57, table, attack = 0.35, release = 1.2, send = 0.3, air, detune = 9, bus = 'pump', voices = 3, chordFor }) => {
  const pieces = [];
  for (const c of A.chunks()) {
    const cfg = table[c.sec.kind];
    if (!cfg) continue;
    const sym = chordFor ? chordFor(c) : cfg.chord ?? A.chord(prog, c.start);
    const last = pieces[pieces.length - 1];
    if (last && last.sym === sym && last.cfg === cfg && Math.abs(last.end - c.start) < 1e-6) { last.end = c.end; continue; }
    pieces.push({ sym, cfg, start: c.start, end: c.end, sec: c.sec });
  }
  const tone = A.v2 ? { hp: 150, dip: [300, -3] } : {};
  const airOf = (cfg) => cfg.air ?? air ?? (A.v2 ? 0.35 : 0);
  pieces.forEach((p, k) => {
    const notes = voicing(p.sym, { center, transpose: A.tr });
    const nextKind = A.kindAt(p.end + 1e-6);
    const rel = nextKind === 'rest' ? 0.3 : p.cfg.release ?? release;
    const dur = (p.end - p.start) * A.g.bar;
    for (const side of [-1, 1]) {
      const buf = s.voice('pad', { freqs: notes.map(mtof), dur, attack: p.cfg.attack ?? attack, release: rel, cutoff: p.cfg.cutoff, air: airOf(p.cfg), detune, voices, seed: A.seed * 31 + (side > 0 ? 7 : 3) + (k % 4), ...tone });
      s.add(buf, A.t(p.start), { gain: p.cfg.gain + A.gain + (A.eg(p.sec.e) - 0.6) * 2 - 3, pan: side * 0.55, send: p.cfg.send ?? send, bus });
    }
  });
};

// Into every drop that follows another kind: a soft swell (or riser) ending on the downbeat.
const intoDrops = (s, A, { swell = -19, riser = null, bars = 1, center = 64, prog, gap = 0 }) => {
  for (const x of A.secs) {
    const p = A.prev(x);
    if (x.kind !== 'drop' || !p || p.kind === 'drop' || p.kind === 'rest') continue;
    const end = x.from - gap, start = Math.max(p.from, end - bars), dur = (end - start) * A.g.bar;
    if (dur < 0.2) continue;
    if (swell != null) {
      const sym = prog[0];
      s.add(s.voice('swell', { freqs: voicing(sym, { center, transpose: A.tr }).map(mtof), dur, seed: A.seed }), A.t(start), { gain: swell + A.gain, send: 0.4, bus: 'music' });
    }
    if (riser != null) s.add(s.voice('riser', { dur, seed: A.seed }), A.t(start), { gain: riser + A.gain, send: 0.3, bus: 'music' });
  }
};

// Kick on the pattern, with a gentle pump on the 'pump' bus.
const kickAt = (s, A, st, { gain, opts = {}, pump = -3 }) => {
  A.hit(st, 'kick', opts, { gain: gain - 1.5 + A.gain + jitter(A.seed, st.i, 0.3), send: 0.03, bus: 'music' });
  if (pump) s.duck(st.t, { depth: pump * Math.min(1.2, st.e / 0.6), attack: 0.004, release: A.g.beat * 0.75, bus: 'pump' });
};

const lastSec = (A) => A.secs[A.secs.length - 1];

// Final chord: rings from the start of the outro (or the last bar) to the end.
const ending = (s, A, { sym, center = 60, voice = 'keys', gain = -14, bell = null, bellOct = 2 }) => {
  const x = lastSec(A);
  if (x.kind === 'rest') return;
  const start = x.kind === 'outro' ? x.from : Math.max(x.from, A.nb - 1);
  const dur = Math.max(0.5, s.duration - A.t(start));
  const notes = voicing(sym, { center, transpose: A.tr });
  if (voice === 'keys') s.add(s.voice('keys', { freqs: notes.map(mtof), dur, hardness: 0.3, release: 0.3, seed: A.seed, ...(A.v2 ? { dip: [280, -2.5] } : {}) }), A.t(start), { gain: gain + A.gain, send: 0.35, bus: 'music' });
  else if (voice === 'marimba') notes.forEach((m, k) => s.add(s.voice('marimba', { freq: mtof(m + 12), dur: 2.5, hardness: 0.4 }), A.t(start) + k * 0.045, { gain: gain + A.gain - 2, pan: -0.4 + k * 0.25, send: 0.3, bus: 'music' }));
  else notes.forEach((m, k) => s.add(s.voice('pluck', { freq: mtof(m + 12), dur: Math.min(4, dur), bright: 0.45, decay: 3 }), A.t(start) + k * 0.06, { gain: gain + A.gain - 2, pan: -0.4 + k * 0.25, send: 0.35, bus: 'music' }));
  if (bell != null) s.add(s.voice('bell', { freq: mtof(notes[notes.length - 1] + 12 * bellOct), dur: Math.min(4, dur + 0.5), index: 1.2 }), A.t(start) + A.g.beat * 0.5, { gain: bell + A.gain, send: 0.5, bus: 'music' });
};

// Presets ----------------------------------------------------------------------------------------
// In every preset: A.chord() for all harmony, st.thin drops the melodic 1–4 kHz layer (reading drop),
// st.group 'A' / 'B' swaps one layer every `rotate` bars of a drop, st.fill marks the phrase-end fill.

// terminal — 128 BPM, A minor. A steady filtered synth pulse, soft kick, soft pad. No big drop.
// An 8-bar progression whose second half answers the first (Dm9, E7sus4 instead of Cmaj7, Em7), so the loop
// is 8 bars, not 4; the pulse alternates two figures by phrase (A, B); fills drop the last kick and roll 16th hats.
// The figures' +10 is a minor seventh over the chord root; on the maj7 chords (Fmaj7, Cmaj7) it becomes the chord's own
// major seventh (+11), so no pulse note sits a semitone under a chord tone (Eb over E, Bb over B; 2026-10-18).
export const terminal = (s, opts = {}) => {
  const A = arrange(s, opts, { key: 'A', shape: [['intro', 2], ['build', 0.3], ['drop', '*'], ['outro', 2]] });
  const prog = ['Am9', 'Fmaj7', 'Cmaj7', 'Em7', 'Am9', 'Fmaj7', 'Dm9', 'E7sus4'];
  padLayer(s, A, { prog, center: 60, table: {
    intro: { gain: -13, cutoff: 1300 }, build: { gain: -14, cutoff: 1700 }, drop: { gain: -15, cutoff: 2400 },
    break: { gain: -12, cutoff: 1400 }, outro: { gain: -14, cutoff: 1500, release: 2 },
  } });
  const PULSE = { A: [0, 0, 12, 0, 7, 0, 12, 10], B: [0, 12, 7, 12, 0, 7, 10, 12] };
  A.steps(4, (st) => {
    const { kind, pos, e } = st;
    const chord = A.chord(prog, st.barF), root = bassNote(chord, { center: 45, transpose: A.tr });
    // Pulse: 8ths in the intro, 16ths after; the filter opens through the build.
    const sixteenth = kind === 'build' || kind === 'drop';
    if (!st.thin && (kind === 'intro' || sixteenth || (kind === 'outro' && st.local < 1)) && (sixteenth || pos % 2 === 0)) {
      let cut = kind === 'build' ? 450 + 800 * st.progress : kind === 'drop' ? 950 + 400 * e : 500;
      if (st.fill) cut += 40 * st.fillStep;
      if (A.v2) cut *= 1.25;
      let iv = (kind === 'drop' ? PULSE[st.group] : PULSE.A)[pos % 8];
      if (iv === 10 && /maj/.test(chord)) iv = 11;
      const m = root + iv;
      const acc = pos % 4 === 0 ? 0 : -3;
      A.hit(st, 'synth', { freq: mtof(m), dur: A.g.beat / 4 * 0.7, cutoff: Math.round(cut / 50) * 50, env: 1700, decay: 0.05, res: 1, wave: 'saw' },
        { gain: -21 + acc + A.gain + (A.eg(e) - 0.6) * 2, pan: pos % 2 ? 0.2 : -0.2, send: 0.12, bus: 'pump' });
    }
    if (kind === 'drop') {
      if (pos % 4 === 0 && !(st.fill && pos === 12)) kickAt(s, A, st, { gain: -11, opts: { decay: 0.22, click: 0.15, f0: 130 }, pump: -2.5 });
      if (pos % 4 === 2) A.hit(st, 'hat', { seed: pos }, { gain: -22 + A.gain + jitter(A.seed, st.i), pan: 0.3, bus: 'music' });
      if (st.fill) { if (pos % 4 !== 2) A.hit(st, 'hat', { seed: pos, decay: 0.02 }, { gain: -30 + st.fillStep + A.gain, pan: 0.35, bus: 'music' }); }
      else if (e > 0.5 && pos % 2 === 1) A.hit(st, 'hat', { seed: pos, decay: 0.02 }, { gain: -29 + A.gain, pan: 0.35, bus: 'music' });
      if (pos === 4 || pos === 12) A.hit(st, 'rim', { freq: 1500 }, { gain: -26 + A.gain, pan: -0.25, send: 0.15, bus: 'music' });
      if (pos === 0) s.add(s.voice('sub', { freq: mtof(root - 12), dur: A.g.bar * 0.9 }), st.t, { gain: -20 + A.gain, bus: 'pump' });
    }
    if (kind === 'build') {
      if (pos === 0 || (pos === 8 && st.progress > 0.5)) kickAt(s, A, st, { gain: -13, opts: { decay: 0.2, click: 0.1, f0: 125 }, pump: -1.5 });
      if (st.progress > 0.5 && pos % 4 === 2) A.hit(st, 'hat', { seed: pos }, { gain: -25 + A.gain, pan: 0.3, bus: 'music' });
    }
  });
  intoDrops(s, A, { swell: -20, prog, center: 64 });
  ending(s, A, { sym: 'Am9', center: 60, voice: 'keys', gain: -15, bell: -24 });
  s.fade({ out: 0.8 });
  return A;
};

// swiss — 120 BPM, C major. Marimba lines over wooden percussion and a light kick. Three chord parts
// (A and B alternate by 4-bar phrase, C under breaks) and seeded rhythm cells per bar, so long films do not
// loop audibly. Drops alternate bells (group A) and the low counter-line (group B); fills are a falling log-drum run.
export const swiss = (s, opts = {}) => {
  opts = { ...opts, gain: (opts.gain ?? 0) - 3 };
  const A = arrange(s, opts, { key: 'C', shape: [['intro', 2], ['build', 0.25], ['drop', 0.3], ['break', 1], ['drop', '*'], ['outro', 2]] });
  const parts = { A: ['Cmaj7', 'Am7', 'Fmaj7', 'G6'], B: ['Fmaj7', 'Em7', 'Dm7', 'G'], C: ['Am7', 'Fmaj7', 'Dm9', 'Gsus4'] };
  const partOf = (h) => (h.kind === 'break' ? 'C' : h.phrase % 2 ? 'B' : 'A');
  const chordAt = (bar) => A.chord(parts[partOf(A.harm(bar))], bar);
  padLayer(s, A, { prog: parts.A, center: 62, chordFor: (c) => chordAt(c.start), attack: 0.6, release: 1.2, detune: 6, voices: 2, table: {
    intro: { gain: -24, cutoff: 2200 }, build: { gain: -24, cutoff: 2600 }, drop: { gain: -25, cutoff: 3000 },
    break: { gain: -16, cutoff: 2000 }, outro: { gain: -20, cutoff: 2200, release: 2 },
  } });
  const cells = {
    A: ['x.x.xx.x', 'x..x..x.', 'x.x...xx', '.xx.x.x.'],
    B: ['xx.x.x..', 'x..xx.x.', '.x.x.xx.', 'x.xx..x.'],
    C: ['x...x...', 'x.....x.', 'x..x....', '....x.x.'],
  };
  const melody = new Map();
  const pickNote = (bar, step, chord, part) => {
    const key = `${bar}`;
    let st = melody.get(key);
    if (!st) { st = { r: mulberry32(seedOf('swiss', A.seed, bar)), last: 3 }; melody.set(key, st); }
    const tones = voicing(chord, { center: 79, transpose: A.tr });
    const pool = [...tones.map((m) => m - 12), ...tones, ...tones.map((m) => m + 12)].filter((m) => m >= 72 - 2 + A.tr && m <= 91 + A.tr);
    const jump = Math.floor(st.r() * 5) - 2;
    st.last = Math.max(0, Math.min(pool.length - 1, st.last + (jump === 0 ? 1 : jump)));
    return pool[st.last];
  };
  const LOG = [220, 196, 175, 156];
  A.steps(4, (st) => {
    const { kind, pos, e, bar } = st;
    if (kind === 'rest' || kind === 'break') return;
    const part = partOf(st.h), chord = chordAt(st.barF), r = mulberry32(seedOf('cell', A.seed, bar));
    const cell = cells[part][Math.floor(r() * 4)];
    const root = bassNote(chord, { center: 50, transpose: A.tr });
    // Marimba melody on 8ths (the cell picks which 8ths sound).
    const melodic = !st.thin && (kind === 'drop' || kind === 'build' || (kind === 'intro' && bar % 2 === 1));
    if (melodic && pos % 2 === 0 && cell[pos / 2] === 'x') {
      const m = pickNote(bar, pos, chord, part);
      const g = kind === 'intro' ? -15 : kind === 'build' ? -14 : -13;
      A.hit(st, 'marimba', { freq: mtof(m), dur: 1.2, hardness: 0.9 }, { gain: g + A.gain + jitter(A.seed, st.i), pan: ((m % 7) - 3) * 0.1, send: 0.22, bus: 'music' });
      if (kind === 'drop' && st.group === 'A' && (pos === 0 || pos === 8)) s.add(s.voice('bell', { freq: mtof(m + 12), dur: 1.2, ratio: 3.5, index: 0.8 }), st.t, { gain: -25 + A.gain, pan: 0.3, send: 0.35, bus: 'music' });
    }
    // Counter-line in the drop (group B): low marimba on off-8ths.
    if (!st.thin && kind === 'drop' && st.group === 'B' && e > 0.45 && pos % 4 === 2 && r() < 0.8) {
      const tones = voicing(chord, { center: 64, transpose: A.tr });
      A.hit(st, 'marimba', { freq: mtof(tones[(pos / 2 + bar) % tones.length]), dur: 1, hardness: 0.35 }, { gain: -18 + A.gain, pan: -0.35, send: 0.2, bus: 'music' });
    }
    // Marimba bass.
    if (pos === 0 || pos === 8 || (kind === 'drop' && pos === 6)) {
      A.hit(st, 'marimba', { freq: mtof(pos === 6 ? root + 7 : root), dur: 1.5, hardness: 0.4 }, { gain: (kind === 'intro' ? -15 : -13) + A.gain, send: 0.08, bus: 'music' });
    }
    // Wood: woodblock pattern, log-drum accents (a falling run in fills), shaker.
    if (kind === 'build' || kind === 'drop') {
      const wood = part === 'B' ? '..x...x...x.x...' : '..x..x....x...x.';
      if (pat(wood, pos)) A.hit(st, 'rim', { freq: pos % 8 < 4 ? 1150 : 1650 }, { gain: -20 + A.gain + jitter(A.seed, st.i), pan: 0.35, send: 0.15, bus: 'music' });
      if (pos % 2 === 1 || kind === 'drop') A.hit(st, 'hat', { seed: pos % 4, tone: 8500, decay: 0.03 }, { gain: (pos % 4 === 2 ? -21 : -25) + A.gain, pan: -0.3, bus: 'music' });
      if (kind === 'drop' && st.fill) { if (st.fillStep % 2 === 0) A.hit(st, 'tom', { freq: LOG[st.fillStep / 2], decay: 0.12 }, { gain: -20 + A.gain, pan: 0.15 - 0.1 * st.fillStep, send: 0.1, bus: 'music' }); }
      else if (kind === 'drop' && (pos === 14 || (pos === 11 && bar % 2))) A.hit(st, 'tom', { freq: 170, decay: 0.12 }, { gain: -20 + A.gain, pan: 0.15, send: 0.1, bus: 'music' });
    }
    // Light kick.
    if (kind === 'drop' && (pos === 0 || pos === 8 || (pos === 10 && bar % 4 === 3))) kickAt(s, A, st, { gain: -11, opts: { muted: true, decay: 0.2 }, pump: 0 });
    if (kind === 'build' && pos === 0) kickAt(s, A, st, { gain: -14, opts: { muted: true, decay: 0.18 }, pump: 0 });
  });
  // Glissando into each drop.
  for (const x of A.secs) {
    const p = A.prev(x);
    if (x.kind !== 'drop' || !p || p.kind === 'drop' || p.kind === 'rest') continue;
    const tones = voicing('Cmaj7', { center: 76, transpose: A.tr });
    const run = [...tones.map((m) => m - 12), ...tones, ...tones.map((m) => m + 12)];
    run.forEach((m, k) => s.add(s.voice('marimba', { freq: mtof(m), dur: 0.8, hardness: 0.5 }), A.t(x.from) - (run.length - k) * A.g.beat / 8, { gain: -19 + A.gain + k * 0.3, pan: -0.5 + k / run.length, send: 0.25, bus: 'music' }));
  }
  ending(s, A, { sym: 'Cmaj9', center: 67, voice: 'marimba', gain: -12, bell: -24, bellOct: 1 });
  s.fade({ out: 1 });
  return A;
};

// blueprint — 100 BPM, E minor. Soft analog arpeggio (square wave; mix 'v2' uses a triangle) with a ping-pong
// echo, clock-tick percussion, an airy pad; fades out over the last 2 s. Group B plays the arpeggio in a second
// order without the octave lift; fills turn the clock into a 16th roll.
export const blueprint = (s, opts = {}) => {
  const A = arrange(s, opts, { key: 'E', bright: true, shape: [['intro', 2], ['build', 0.25], ['drop', '*'], ['outro', 2]] });
  const prog = ['Em9', 'Cmaj9', 'Gmaj7', 'D6'];
  padLayer(s, A, { prog, center: 59, air: 0.8, attack: 0.9, release: 1.8, send: 0.4, table: {
    intro: { gain: -13, cutoff: 1500 }, build: { gain: -14, cutoff: 1900 }, drop: { gain: -15, cutoff: 2300 },
    break: { gain: -12, cutoff: 1600 }, outro: { gain: -13, cutoff: 1800, release: 2.5 },
  } });
  const ORDER = { A: [0, 1, 2, 3, 2, 1, 3, 2], B: [0, 2, 1, 3, 1, 2, 3, 1] };
  const wave = A.v2 ? 'tri' : 'square';
  A.steps(4, (st) => {
    const { kind, pos, e } = st;
    if (kind === 'rest' || kind === 'break') return;
    const chord = A.chord(prog, st.barF);
    const tones = voicing(chord, { center: 66, transpose: A.tr });
    const root = bassNote(chord, { center: 40, transpose: A.tr });
    const arpOn = !st.thin && (kind === 'drop' || kind === 'build' || (kind === 'intro' && pos % 2 === 0) || (kind === 'outro' && st.local < 1 && pos % 2 === 0));
    if (arpOn) {
      const B = kind === 'drop' && st.group === 'B';
      const m = tones[(B ? ORDER.B : ORDER.A)[pos % 8] % tones.length] + (pos >= 8 && kind === 'drop' && !B ? 12 : 0);
      const cut = kind === 'build' ? 600 + 600 * st.progress : kind === 'drop' ? 1100 + 300 * e : 650;
      const [b, acc] = A.vox(st, 'synth', { freq: mtof(m), dur: A.g.beat / 4 * 0.8, wave, cutoff: Math.round(cut / 50) * 50, env: 1600, decay: 0.08, res: 0.9, detune: 6 });
      const g = (kind === 'drop' ? -17 : -18) + A.gain + (pos % 4 ? -2 : 0) + acc;
      s.add(b, st.t, { gain: g, pan: -0.15, send: 0.3, bus: 'pump' });
      if (kind === 'drop') s.add(b, st.t + (A.g.beat * 3) / 4, { gain: g - 8, pan: 0.6, send: 0.4, bus: 'pump' });
    }
    // Clock: tick-tock on 8ths, accent on the beat; a 16th roll in fills.
    const clock = kind === 'intro' ? pos % 4 === 0 : kind === 'outro' ? pos % 4 === 0 && st.local < 1 : pos % 2 === 0;
    if (st.fill && kind === 'drop') A.hit(st, 'tick', { freq: 1900 + 80 * st.fillStep, decay: 0.005, noise: 0.25 }, { gain: -27 + st.fillStep * 0.6 + A.gain, pan: st.fillStep % 2 ? 0.35 : -0.35, send: 0.1, bus: 'music' });
    else if (clock) A.hit(st, 'tick', { freq: pos % 4 === 0 ? 2500 : 1900, decay: 0.005, noise: 0.25 }, { gain: (pos % 4 === 0 ? -21 : -25) + A.gain, pan: pos % 8 < 4 ? 0.35 : -0.35, send: 0.1, bus: 'music' });
    if (kind === 'drop') {
      if (pos === 0 || pos === 8) kickAt(s, A, st, { gain: -12, opts: { muted: true, decay: 0.24, f0: 120 }, pump: -2 });
      if ((pos === 4 || pos === 12) && !(st.fill && pos === 12)) A.hit(st, 'rim', { freq: 950 }, { gain: -26 + A.gain, pan: 0.2, send: 0.2, bus: 'music' });
      if (pos === 0) s.add(s.voice('sub', { freq: mtof(root), dur: A.g.bar * 0.95 }), st.t, { gain: -19 + A.gain, bus: 'pump' });
    }
  });
  intoDrops(s, A, { swell: -20, prog, center: 64 });
  ending(s, A, { sym: 'Em9', center: 60, voice: 'keys', gain: -15, bell: -25 });
  s.fade({ out: 2 });
  return A;
};

// inkbeat — written at 128 BPM, plays at the film's tempo (the ink template defaults to 124); F minor minimal techno. Build with no kick (hats, perc, a resonant pulse opening,
// a riser), a half-bar gap before each drop, then kick, rolling bass, claps. Group B rolls the bass on a second
// pattern; fills drop the last kick and roll claps.
export const inkbeat = (s, opts = {}) => {
  const A = arrange(s, opts, { key: 'F', shape: [['build', 8], ['drop', '*'], ['outro', 1]] });
  const prog = ['Fm9', 'Fm9', 'Dbmaj7', 'Ebsus2'];
  const gapBars = 0.5;
  const inGap = (st) => st.kind === 'build' && st.next === 'drop' && st.left <= gapBars + 1e-9;
  const chordAt = (bar) => (A.harm(bar).kind === 'build' ? 'Fm9' : A.chord(prog, bar));
  padLayer(s, A, { prog, center: 58, attack: 1.2, release: 1.5, detune: 12, chordFor: (c) => chordAt(c.start), table: {
    intro: { gain: -16, cutoff: 800 }, build: { gain: -16, cutoff: 1000 }, drop: { gain: -19, cutoff: 1300 },
    break: { gain: -15, cutoff: 900 }, outro: { gain: -16, cutoff: 1000, release: 2 },
  } });
  // Silence the pad inside the gaps by ducking the pump bus hard.
  for (const x of A.secs) {
    const n = A.next(x);
    if (x.kind === 'build' && n && n.kind === 'drop') s.duck(A.t(x.to - gapBars) + 0.03, { depth: -30, attack: 0.03, hold: gapBars * A.g.bar - 0.06, release: 0.03, bus: 'pump' });
  }
  const BASS = { A: '..x...x...x...x.', B: '..x..x....x..x..' };
  A.steps(4, (st) => {
    const { kind, pos, e } = st;
    if (kind === 'rest' || inGap(st)) return;
    const chord = chordAt(st.barF);
    const root = bassNote(chord, { center: 36, transpose: A.tr });
    if (kind === 'build' || kind === 'intro') {
      const p = st.progress;
      if (pos % 4 === 2) A.hit(st, 'hat', { seed: pos }, { gain: -21 + A.gain + jitter(A.seed, st.i), pan: 0.25, bus: 'music' });
      if (st.local >= 2 && pos % 2 === 1) A.hit(st, 'hat', { seed: pos, decay: 0.018 }, { gain: -31 + A.gain, pan: 0.3, bus: 'music' });
      if (st.local >= 4 && pat('...x..x....x.x..', pos)) A.hit(st, 'rim', { freq: 1300 }, { gain: -23 + A.gain, pan: -0.3, send: 0.2, bus: 'music' });
      if (st.local >= 4 && (pos === 4 || pos === 12)) A.hit(st, 'clap', {}, { gain: -22 + A.gain, send: 0.25, bus: 'music' });
      const cut = (250 + 1400 * p * p) * (A.v2 ? 1.25 : 1);
      if (!st.thin) A.hit(st, 'synth', { freq: mtof(root + 12 + (pos % 8 === 6 ? 12 : 0)), dur: A.g.beat / 4 * 0.6, cutoff: Math.round(cut / 50) * 50, env: 700, decay: 0.04, res: 1.6, wave: 'saw' },
        { gain: -20 + A.gain + (pos % 4 ? -3 : 0) + p * 2, pan: 0, send: 0.15, bus: 'pump' });
    }
    if (kind === 'drop' || (kind === 'outro' && st.local < 1)) {
      const out = kind === 'outro';
      if (pos % 4 === 0 && !(out && pos > 8) && !(st.fill && pos === 12)) kickAt(s, A, st, { gain: -11, opts: { f0: 160, f1: 52, decay: 0.26, click: 0.3 }, pump: -4 });
      if (!out) {
        if (pat(BASS[st.group], pos) || (e > 0.6 && pat('...x.......x....', pos))) A.hit(st, 'bass', { freq: mtof(root), dur: A.g.beat / 4 * 0.9, cutoff: 260, env: 650, decay: 0.05 }, { gain: -13 + A.gain + (pos % 4 === 3 ? -4 : 0), bus: 'pump' });
        if (pos % 4 === 2) A.hit(st, 'hat', { open: true, decay: 0.12, seed: 1 }, { gain: -25 + A.gain, pan: 0.2, send: 0.1, bus: 'music' });
        if (pos % 2 === 1) A.hit(st, 'hat', { seed: pos, decay: 0.018 }, { gain: -30 + A.gain + jitter(A.seed, st.i), pan: 0.35, bus: 'music' });
        if (st.fill && st.fillStep >= 4) A.hit(st, 'clap', {}, { gain: -24 + 1.5 * (st.fillStep - 4) + A.gain, send: 0.2, bus: 'music' });
        else if (pos === 4 || pos === 12) A.hit(st, 'clap', {}, { gain: -19 + A.gain, send: 0.2, bus: 'music' });
        if (pat('...x..x.....x...', pos)) A.hit(st, 'rim', { freq: 1300 }, { gain: -25 + A.gain, pan: -0.3, send: 0.2, bus: 'music' });
        if (!st.thin) A.hit(st, 'synth', { freq: mtof(root + 12 + (pos % 8 === 6 ? 12 : 0)), dur: A.g.beat / 4 * 0.6, cutoff: A.v2 ? 1600 : 1300, env: 900, decay: 0.04, res: 1.4, wave: 'saw' },
          { gain: -25 + A.gain + (pos % 4 ? -3 : 0), pan: pos % 2 ? 0.25 : -0.25, send: 0.15, bus: 'pump' });
      }
    }
  });
  for (const x of A.secs) {
    const p = A.prev(x);
    if (x.kind !== 'drop' || !p || p.kind === 'drop') continue;
    const gap = p.kind === 'build' ? gapBars : 0;
    const dur = Math.min(2, x.from - gap - p.from) * A.g.bar;
    if (dur > 0.3 && p.kind !== 'rest') s.add(s.voice('riser', { dur, seed: A.seed }), A.t(x.from - gap) - dur, { gain: -18 + A.gain, send: 0.35, bus: 'music' });
    s.add(s.voice('impact', { freq: 44, decay: 0.8 }), A.t(x.from), { gain: -15 + A.gain, send: 0.2, bus: 'music' });
  }
  ending(s, A, { sym: 'Fm9', center: 60, voice: 'keys', gain: -16, bell: null });
  s.fade({ out: 0.6 });
  return A;
};

// thread — 120 BPM, D major, Dmaj7–Bm7–Gmaj7–A. Pad with a single downbeat kick, then four-on-the-floor
// with pluck arpeggios, a pad-only break, a climax with claps and 8th-note bass, resolving on D add9.
// Group B runs the pentatonic plucks downward; fills drop the last kick and roll claps.
export const thread = (s, opts = {}) => {
  const A = arrange(s, opts, { key: 'D', shape: [['intro', 1], ['build', 0.4], ['break', 1], ['drop', '*'], ['outro', 2]] });
  const prog = ['Dmaj7', 'Bm7', 'Gmaj7', 'A'];
  padLayer(s, A, { prog, center: 57, attack: 0.25, release: 0.6, table: {
    intro: { gain: -13, cutoff: 1700 }, build: { gain: -14, cutoff: 2200 }, drop: { gain: -14, cutoff: 3000 },
    break: { gain: -12, cutoff: 1500 }, outro: { gain: -13, cutoff: 2200, release: 2.2, chord: 'Dadd9' },
  } });
  const penta = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86].map((m) => m + A.tr + 12);
  const bright = A.v2 ? 0.1 : 0;
  A.steps(4, (st) => {
    const { kind, pos, e, bar } = st;
    if (kind === 'rest' || kind === 'break') return;
    const chord = kind === 'outro' ? 'Dadd9' : A.chord(prog, st.barF);
    const root = bassNote(chord, { center: 40, transpose: A.tr });
    const tones = voicing(chord, { center: 71, transpose: A.tr });
    if (kind === 'intro' && pos === 0) kickAt(s, A, st, { gain: -12, opts: { decay: 0.3 }, pump: 0 });
    if (kind === 'build') {
      if (pos % 4 === 0) kickAt(s, A, st, { gain: (pos ? -12.5 : -11.5), opts: { decay: 0.3 }, pump: -2 });
      if (pos % 4 === 2) A.hit(st, 'hat', { seed: pos }, { gain: -22 + A.gain + jitter(A.seed, st.i), pan: 0.25, bus: 'music' });
      if (!st.thin && pos % 2 === 0) A.hit(st, 'pluck', { freq: mtof(tones[(pos / 2) % tones.length] + (pos >= 8 ? 12 : 0)), dur: 0.7, bright: 0.6 + bright }, { gain: -19 + A.gain, pan: -0.4 + ((pos / 2) % 4) * 0.27, send: 0.3, bus: 'music' });
      if (st.progress > 0.5 && pos % 4 === 0) A.hit(st, 'bass', { freq: mtof(root), dur: A.g.beat * 0.85 }, { gain: -15 + A.gain, bus: 'pump' });
    }
    if (kind === 'drop') {
      if (pos % 4 === 0 && !(st.fill && pos === 12)) kickAt(s, A, st, { gain: -10.5, opts: { decay: 0.3 }, pump: -3 });
      A.hit(st, 'hat', { seed: pos % 4 }, { gain: (pos % 2 ? -23 : -28) + A.gain + jitter(A.seed, st.i), pan: 0.25, bus: 'music' });
      if (st.fill && st.fillStep >= 4) A.hit(st, 'clap', {}, { gain: -23 + 1.5 * (st.fillStep - 4) + A.gain, pan: -0.1, send: 0.25, bus: 'music' });
      else if (pos === 4 || pos === 12) A.hit(st, 'clap', {}, { gain: -18 + A.gain, pan: -0.1, send: 0.25, bus: 'music' });
      if (pos % 2 === 0) A.hit(st, 'bass', { freq: mtof(root + (pos % 4 ? 12 : 0)), dur: A.g.beat / 2 * 0.85, cutoff: 450 }, { gain: -15 + A.gain, bus: 'pump' });
      const k = (bar * 16 + pos) % 20, j = k < 11 ? k : 20 - k, m = penta[st.group === 'B' ? 10 - j : j];
      if (!st.thin && e > 0.4) A.hit(st, 'pluck', { freq: mtof(m), dur: 0.5, bright: 0.65 + bright }, { gain: -20 + A.gain, pan: -0.6 + (pos % 4) * 0.4, send: 0.3, bus: 'music' });
    }
  });
  intoDrops(s, A, { swell: -19, prog, center: 62 });
  // Resolve: kick + chord + bell + shimmer of plucks.
  const x = lastSec(A);
  if (x.kind === 'outro') {
    const t = A.t(x.from), tones = voicing('Dadd9', { center: 74, transpose: A.tr });
    s.add(s.voice('kick', { decay: 0.35 }), t, { gain: -10 + A.gain, bus: 'music' });
    s.add(s.voice('bell', { freq: mtof(tones[tones.length - 1] + 12), dur: 3.5, index: 1.2 }), t + 0.1, { gain: -22 + A.gain, send: 0.5, bus: 'music' });
    for (let i = 0; i < 9; i++) s.add(s.voice('pluck', { freq: mtof(penta[i % 8]), dur: 0.8, bright: 0.4 }), t + 0.15 + i * 0.04, { gain: -27 + A.gain, pan: -0.6 + i * 0.15, send: 0.4, bus: 'music' });
  }
  s.fade({ out: 0.8 });
  return A;
};

// data — 112 BPM, F major (lydian colour). Soft muted four-on-the-floor, plucked up-down arpeggio,
// warm pad, an occasional bell; curious and steady. Group B plays the arpeggio in a second order and always
// rings the bell; fills roll soft 16th hats.
export const data = (s, opts = {}) => {
  const A = arrange(s, opts, { key: 'F', shape: [['intro', 2], ['build', 0.25], ['drop', '*'], ['outro', 2]] });
  const prog = ['Fmaj9', 'Am7', 'Bbmaj7#11', 'C6'];
  padLayer(s, A, { prog, center: 58, attack: 0.5, release: 1.3, table: {
    intro: { gain: -14, cutoff: 1000 }, build: { gain: -15, cutoff: 1150 }, drop: { gain: -15, cutoff: 1300 },
    break: { gain: -13, cutoff: 1000 }, outro: { gain: -14, cutoff: 1100, release: 2.4, chord: 'Fmaj9' },
  } });
  const ORDER = { A: [0, 1, 2, 3, 4, 3, 2, 1], B: [0, 2, 4, 2, 1, 3, 4, 3] };
  const bright = A.v2 ? 0.1 : 0;
  A.steps(4, (st) => {
    const { kind, pos, e, bar } = st;
    if (kind === 'rest' || kind === 'break') return;
    const chord = A.chord(prog, st.barF);
    const tones = voicing(chord, { center: 67, transpose: A.tr });
    const root = bassNote(chord, { center: 41, transpose: A.tr });
    const arp16 = kind === 'drop';
    const arpOn = !st.thin && (arp16 || (pos % 2 === 0 && (kind === 'intro' || kind === 'build' || (kind === 'outro' && st.local < 1))));
    if (arpOn) {
      const m = tones[(arp16 ? ORDER[st.group] : ORDER.A)[(arp16 ? pos : pos / 2) % 8] % tones.length];
      A.hit(st, 'pluck', { freq: mtof(m), dur: 0.6, bright: 0.35 + bright }, { gain: -17 + A.gain + (pos % 4 ? -2.5 : 0) + jitter(A.seed, st.i, 0.5), pan: pos % 4 < 2 ? -0.3 : 0.3, send: 0.28, bus: 'music' });
    }
    if (kind === 'build' || kind === 'drop') {
      if (pos % 4 === 0) kickAt(s, A, st, { gain: kind === 'drop' ? -11 : -14, opts: { muted: true, decay: 0.2, f0: 115 }, pump: -2 });
      if (pos % 4 === 2) A.hit(st, 'hat', { seed: pos, tone: 8000, decay: 0.03 }, { gain: -25 + A.gain + jitter(A.seed, st.i), pan: 0.3, bus: 'music' });
      else if (kind === 'drop' && st.fill) A.hit(st, 'hat', { seed: pos, tone: 8000, decay: 0.02 }, { gain: -31 + 0.8 * st.fillStep + A.gain, pan: 0.3, bus: 'music' });
    }
    if (kind === 'drop') {
      if (pos === 4 || pos === 12) A.hit(st, 'rim', { freq: 1250 }, { gain: -27 + A.gain, pan: -0.2, send: 0.2, bus: 'music' });
      if (pos === 0 || pos === 6 || pos === 8) A.hit(st, 'bass', { freq: mtof(root), dur: A.g.beat * (pos === 6 ? 0.4 : 0.9), cutoff: 260, env: 400 }, { gain: -16 + A.gain, bus: 'pump' });
      if (!st.thin && (e > 0.5 || st.group === 'B') && pos === 10 && bar % 2 === 1) {
        const m = voicing(chord, { center: 84, transpose: A.tr })[(bar >> 1) % 3];
        s.add(s.voice('bell', { freq: mtof(m), dur: 1.6, index: 1.2 }), st.t, { gain: -25 + A.gain, pan: 0.4, send: 0.45, bus: 'music' });
      }
    }
  });
  intoDrops(s, A, { swell: -21, prog, center: 62 });
  ending(s, A, { sym: 'Fmaj9', center: 62, voice: 'pluck', gain: -15, bell: -25 });
  s.fade({ out: 0.8 });
  return A;
};

// diagram — 96 BPM, Eb major. Felt-keys motif over a warm pad, a gentle plucked pulse, building quietly;
// the drop adds only a soft low kick and sub. Group B lifts the motif's last bar an octave and adds 8th hats;
// fills drop the second kick and roll the hats.
export const diagram = (s, opts = {}) => {
  const A = arrange(s, opts, { key: 'Eb', shape: [['intro', 2], ['build', 0.35], ['drop', '*'], ['outro', 2]] });
  const prog = ['Ebmaj9', 'Cm7', 'Abmaj7', 'Bb6'];
  padLayer(s, A, { prog, center: 55, attack: 0.8, release: 1.6, air: 0.6, table: {
    build: { gain: -17, cutoff: 1900 }, drop: { gain: -16, cutoff: 2300 },
    break: { gain: -14, cutoff: 1700 }, outro: { gain: -16, cutoff: 1900, release: 2.5, chord: 'Ebmaj9' },
  } });
  // The motif: beat positions and chord-tone indices from the top; the second bar of each pair answers.
  const motif = [[[0, 3], [1, 2], [1.5, 3], [2.5, 1]], [[0, 2], [1, 1], [2, 0], [3, 1]]];
  const dip = A.v2 ? { dip: [280, -2.5] } : {};
  for (const c of A.chunks()) {
    const kind = c.sec.kind;
    if (kind === 'rest' || kind === 'break' || kind === 'outro') continue;
    const chord = A.chord(prog, c.start), t0 = A.t(c.bar), n = c.h.n;
    const low = voicing(chord, { center: 55, transpose: A.tr }), top = voicing(chord, { center: 72, transpose: A.tr });
    const g = (kind === 'intro' ? -16 : kind === 'build' ? -15 : -14) + A.gain;
    if (c.start === c.bar) s.add(s.voice('keys', { freqs: low.map(mtof), dur: A.g.bar * 0.95, hardness: 0.25, seed: n % 4, ...dip }), t0, { gain: g - 3, pan: -0.15, send: 0.35, bus: 'music' });
    if (c.thin) continue;
    const lift = kind === 'drop' && (n % 4 === 3 || c.group === 'B') ? 12 : 0;
    for (const [b, k] of motif[n % 2]) {
      const t = t0 + b * A.g.beat;
      if (t < A.t(c.start) - 1e-6 || t >= A.t(c.end) - 1e-6) continue;
      const m = top[Math.max(0, top.length - 1 - k)] + (b === 0 ? lift : 0);
      const st = { beat: (c.bar + b / A.bpb) * A.bpb };
      const [buf, acc] = A.vox(st, 'keys', { freqs: [mtof(m)], dur: A.g.beat * 0.9, hardness: 0.75, seed: k, ...dip });
      s.add(buf, t, { gain: g + acc, pan: 0.15, send: 0.35, bus: 'music' });
    }
  }
  A.steps(2, (st) => {
    const { kind, pos } = st;
    const chord = A.chord(prog, st.barF);
    const root = bassNote(chord, { center: 46, transpose: A.tr });
    const pulse = (kind === 'build' && st.progress >= 0.25) || kind === 'drop';
    if (pulse) A.hit(st, 'pluck', { freq: mtof(root + 12 + (pos % 4 === 3 ? 7 : 0)), dur: 0.5, bright: 0.55 + (A.v2 ? 0.1 : 0), decay: 0.6 }, { gain: (kind === 'drop' ? -19 : -21) + A.gain + (pos % 2 ? -2 : 0), pan: 0.3, send: 0.2, bus: 'pump' });
    if (kind === 'drop') {
      if (pos === 0 || (pos === 4 && !st.fill)) kickAt(s, A, st, { gain: -14, opts: { muted: true, decay: 0.26, f0: 105, f1: 44 }, pump: -1.5 });
      if (pos === 0) s.add(s.voice('sub', { freq: mtof(root - 12), dur: A.g.bar * 0.9 }), st.t, { gain: -18 + A.gain, bus: 'pump' });
    }
    const hats = kind === 'drop' || (kind === 'build' && st.progress >= 0.5);
    const hatOn = hats && (pos % 2 === 1 || (kind === 'drop' && (st.group === 'B' || st.fill)));
    if (hatOn) A.hit(st, 'hat', { seed: pos, tone: 8000, decay: 0.03 }, { gain: (kind === 'drop' ? -26 : -29) + (pos % 2 ? 0 : -3) + (st.fill ? st.fillStep * 0.5 : 0) + A.gain + jitter(A.seed, st.i), pan: 0.3, bus: 'music' });
  });
  intoDrops(s, A, { swell: -22, prog, center: 63 });
  ending(s, A, { sym: 'Ebmaj9', center: 60, voice: 'keys', gain: -13, bell: -26 });
  s.fade({ out: 1.2 });
  return A;
};

export const beds = { terminal, swiss, blueprint, inkbeat, thread, data, diagram };
