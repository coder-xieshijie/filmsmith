# lib/audio — synthesised film sound

Every sound in a film is made by code: a beat-grid sequencer, a set of voices, one music bed per mode and a loudness master. Pure Node ESM (Node 22+), no npm dependencies; `ffmpeg` on PATH for `master()` and `addFile()`. Same inputs give byte-identical WAVs (all noise is seeded mulberry32). A 60 s bed renders in about a second.

In a film folder this directory is `lib/audio/`; `score.mjs` imports `./lib/audio/index.mjs`.

## Score

```js
import { Score, voices, beds, master, writeMeasure, writeWav, note, chord } from './lib/audio/index.mjs';
const s = new Score({ duration: 30, grid, sr: 48000 });     // grid from lib/beat.js grid({ bpm, t0, beatsPerBar })
s.add(buffer, t, { gain: -6, pan: 0, send: 0.2, bus: 'fx' }); // mono Float32Array or [L, R]; t in seconds
s.beds.thread({ sections, key, energy });                   // or beds.thread(s, opts)
await s.write('assets/audio/mix-raw.wav');                  // stereo 48 kHz 24-bit, limited to -1 dBFS
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5 });
await writeMeasure('.', r);                                  // assets/audio/measure.json: the measured I, TP, LRA
```

| Method | Does |
| --- | --- |
| `new Score({ duration, grid, sr = 48000, reverb, ceiling = -1 })` | Fixed-length stereo timeline. Without `grid`, pass `bpm`, `t0`, `beatsPerBar`. `reverb`: `{ size 0.72, damp 0.35, width 0.9, predelay 0.02 }`. |
| `add(buf, t, { gain, pan, send, bus, label })` | Mix a buffer in. `gain` dB (voices peak at 0 dBFS, so `-12` means a hit peaking at −12), `pan` −1..1, `send` 0..1 to the reverb. `bus`: `'fx'` (default, never ducked), `'music'`, `'pump'` (music that breathes with the bed's kick). |
| `voice(name, opts)` | Render a voice at the score's `sr`, memoised. The returned buffer is shared: do not modify it. |
| `play(name, t, voiceOpts, mixOpts)` | `voice()` + `add()`. |
| `hit(name, beat, voiceOpts, mixOpts)` | Same, at a beat number: `s.hit('stamp', 16, {}, { gain: -8 })`. |
| `bt(n)`, `br(n)` | Time of beat n / bar n (from the grid). |
| `vary(name, opts, { vel = 0.5, rr = true })` | `voice()` for repeated hits: `vel` 0..1 moves the voice's brightness option ±10 % (`bright`, `hardness`, `cutoff`, `click`, `tone`; 0.5 = unchanged), `rr` rotates four seeds per voice name. Timing is never varied. Beds use it for every drum and melodic hit. |
| `duck(t, { depth = -6, attack, hold, release, bus = 'music' })` | Dip the music around t, e.g. under an impact, a voice-over line or a run of typing (`hold` = the run's length). `bus: 'music'` dips every bus except `'fx'`; another name dips that bus only (`'pump'` carries the beds' pads, pulses and sub). Overlapping ducks do not add up: the deepest wins. |
| `level(from, to, { gain, bus = 'music', ramp = 0.03 })` | A gain change in dB between two times, ramped. Levels add up with each other and with ducks. Beds use it for the energy curve and the reading dip. |
| `eq(bus, [{ type, freq, q, gain }])` | Static EQ on a bus before the mix (`'music'` = every bus except `'fx'`); types `peak`, `lowshelf`, `highshelf`, `hp`, `lp`. |
| `fade({ in, out })` | Fades in seconds; the longest request wins (beds request their own end fade). |
| `addFile(path, t, { offset, gain, ... })` | Decode any audio file with ffmpeg and place it on the `'music'` bus (for `bed: { file, offset }` in content.js). |
| `render()` / `write(path, { bits = 24 })` | Mix buses, add the reverb, apply fades and a stereo-linked look-ahead limiter at −1 dBFS. `write` prints peak and limiter reduction; more than 6 dB of reduction prints a warning — lower some gains. |

`master(in, out, { lufs = -14, tp = -1.5, tone })` — two-pass `loudnorm` in linear mode, verified with `ebur128` and trimmed to within 0.1 LU. If a linear gain would push the true peak over, the input is first driven into the kit's look-ahead limiter (ceiling 1.5 dB under the true-peak target) until it reaches the loudness, so the final gain stays linear. True peak always wins: if the target loudness needs more than ~18 dB of limiting, the master stays under the peak limit and reports `ok: false`. Prints and returns `{ I, TP, LRA, Smax, Mmax, limiting, target, tone, normalization, preLimit, ok }`: `Smax` / `Mmax` are the highest short-term (3 s) and momentary loudness in LUFS (EBU R128 s1 asks `Smax ≤ I + 5`), `limiting` the most gain the pre-limiter took off in dB (0 when the master stayed linear). `measure(path)` returns `{ I, TP, LRA, Smax, Mmax }`.

`tone: 'v2'` is the mastering chain every template but blueprint asks for (2026-10-18; `master()` itself defaults to the plain chain): a soft clip of the band under 120 Hz (peaks rounded to at most 9 dB over that band's RMS), a 2:1 glue compressor that takes 1–2 dB off the loudest passages, and a pre-limit ceiling at the true-peak target −0.6 dB with a 150 ms release. On the seven templates it cut pre-limiting by 0.6–2.8 dB at the same −14 LUFS, with the true peak ending at −1.8 to −2.2 dBTP (measured 2026-10). Not yet heard by a person.

`writeMeasure(dir, result, extra)` writes `<dir>/assets/audio/measure.json` = `{ I, TP, LRA, Smax, Mmax, limiting, target, tone, ok, ...extra }` (one decimal). A film that shows its loudness on screen reads `I` from this file instead of typing a number; the file exists only after `npm run audio`, so keep a fallback.

`writeWav(path, channels, sr, { bits: 16 | 24 | 32 })`, `readAudio(path, { sr, offset, duration })` → `[L, R]`.

Pitch: `note('D4')` → Hz (MIDI numbers below 128 are converted too), `midi('F#3')`, `mtof`, `chord('Dmaj7', { octave: 3 })` → Hz[], `chord(['D3', 'F#3'])`, `voicing('Bm7', { center: 57 })` → MIDI notes close to the centre (smooth voice leading), `bassNote(sym)`, `scale('D', 'major', { octave: 4 })`. Chord qualities: `'' m 5 dim aug sus2 sus4 6 m6 7 maj7 m7 m7b5 7sus4 add9 madd9 6add9 9 maj9 m9 maj7#11 m11 11`, slash bass `D/F#`.

## Voices

Each takes one options object (all optional) and returns a mono `Float32Array` peak-normalised to 1.0. Every voice also accepts `sr` and `seed` (vary `seed` for round-robin variation). Frequencies are Hz (numbers) or note names (`'D4'`); convert MIDI numbers with `mtof()`.

| Voice | Options (defaults) | Character |
| --- | --- | --- |
| `kick` | `f0 150, f1 54, decay 0.24, pitchDecay 0.035, click 0.3, drive 1.6, muted false` | Sine with pitch drop; `muted` darkens it for soft four-on-the-floor. |
| `snare` | `tone 190, decay 0.16, snappy 0.7` | Two-mode body plus bright noise. |
| `clap` | `decay 0.11, tone 1300` | Three bursts and a tail. |
| `hat` | `open false, decay (0.035 / 0.24), tone 9000` | Six square partials plus noise. |
| `rim` | `freq 1700` | Woody click; 900–1700 Hz reads as woodblock or pencil tap. |
| `tom` | `freq 110, decay 0.3` | Membrane with a glide; `freq 170, decay 0.12` is a log drum. |
| `synth` | `freq, dur 0.25, wave 'saw' (saw/square/tri/sine), cutoff 900, env 1800, decay 0.12, res 0.8, attack, release 0.06, detune, sub` | One subtractive note; the building block for pulses and arps. |
| `bass` | `freq 55, dur 0.25, cutoff 380, env 900, decay 0.09, res 0.9` | Saw + sub, round and plucky. |
| `sub` | `freq 41.2, dur 0.5, attack, release, harmonic 0.15` | Sine sub with a little 2nd harmonic. |
| `pluck` | `freq 440, dur 1, bright 0.5, decay (T60, pitch-dependent), pick 0.25` | Karplus-Strong string, fractional-delay tuned. |
| `pad` | `freqs, dur 2, attack 0.5, release 1, cutoff 1600, detune 9 (cents), voices 3, res 0.6, motion 0.2, air 0, wave 'saw', hp 0, dip null` | Detuned saws through two lowpass stages; slow drift; `air` adds breathy noise; `hp` (Hz) and `dip` (`[Hz, dB]`) shape the low mids. Length `dur + release`. |
| `keys` | `freqs, dur 1.5, hardness 0.35, release 0.35, dip null` | Felt-piano-like: inharmonic partials, two-stage decay, felt thump, damper at `dur`. |
| `marimba` | `freq 440, dur 1.2, hardness 0.5` | Tuned bar modes 1 : 3.93 : 9.2 plus mallet. |
| `bell` | `freq 880, dur 2.5, ratio 3.5, index 1.8, decay` | Two-operator FM; `ratio 1.4` is a darker, inharmonic bell. |
| `arp` | `freqs, step 0.125, steps 8, pattern 'up' (down/updown/random), octaves 1, voice 'pluck', gate 0.9, accent 0.3, opts` | A whole arpeggio in one buffer. |
| `tick` | `freq 3200, decay 0.006, noise 0.3` | UI tick, counters, clocks. |
| `thud` | `freq 70, decay 0.12` | Soft low landing. |
| `chime` | `freq 1318.5, decay 0.6, notes 1` | Glassy; `notes 3` rolls a rising triad. |
| `pop` | `freq 440, decay 0.05, sweep 5` | Rising blip for an element appearing. |
| `whoosh` | `dur 0.6, up true, lo 300, hi 5000, q 1.1, peak 0.65` | Swept band-passed noise; `up: false` sweeps down. |
| `riser` | `dur 2, lo 250, hi 7000, tone 0.35` | Noise and a gliding tone climbing into a downbeat; place it to end on the beat. |
| `impact` | `freq 48, decay 0.7` | Soft sub boom and low bloom, no bright stab. |
| `stamp` | `freq 900, to 150, decay 0.08` | Falling sine, filtered noise and a low thump — a stamp or plotter hit. |
| `typeKey` | `seed, freq` | One keystroke (clack, body, release click); change `seed` per key. |
| `glitch` | `dur 0.25, rate 24` | Seeded digital stutter. |
| `swell` | `freqs, dur 1.5, cutoff 2400` | Crescendo of a soft chord that stops dead on its end; place it to end on a downbeat. |

`voices` is the name → function map (`voices.kick({ muted: true })`); every voice is also a named export.

## Beds

`beds.<preset>(score, opts)` or `score.beds.<preset>(opts)` lays a bed over the whole duration on the score's grid and returns the arrangement. Options:

- `sections`: `[{ from, to, kind, energy? }]` in bars (fractional allowed, `to` exclusive). Kinds: `intro` (sparse), `build` (layers enter), `drop` (full groove — put it on the product name), `break` (pad only, for reading), `rest` (silence from the bed; tails ring out), `outro` (groove leaves, a resolving chord rings to the end). Bars not covered take the kind before them. Omit for the preset's default arrangement.
- `key`: tonic name (`'D'`, `'F#'`, `'Bb'`); transposes the preset by at most ±6 semitones. Each preset keeps its own mode.
- `energy`: 0..1 (default 0.6) — level and density of the groove; also per section. May be a function of the bar (`(bar) => 0..1`), an energy curve over the film: give the scenes a target tension (low at the opening, rising by chapter, lower under reading, highest on the claim or name). Besides gating layers, energy sets the bed's level, (e − 0.6) × 2.5 dB, so energy 1 sits 1 dB over the reference.
- `reading` per section: `true` is the reading drop — kick, pad and bass stay, the melodic layer in 1–4 kHz goes (terminal pulse, swiss marimba line and bells, blueprint arpeggio, inkbeat stab, thread and data plucks, diagram motif); `'duck'` keeps every layer and sets the music buses 3 dB lower.
- `restart` per section: `true` starts the chord progression again there.
- `rotate` (default 4): bars per layer group. Inside a drop one layer alternates between group A and B every `rotate` bars (terminal: the pulse figure; swiss: bells and counter-line; blueprint: the arpeggio order; inkbeat: the bass pattern; thread: the pluck run's direction; data: the arpeggio order and bell; diagram: the motif's octave and 8th hats). The last two beats of every 8th drop bar, and of a drop of 4 bars or more that hands over to another kind, are a fill (the preset drops its last kick and rolls hats, claps, ticks or a log drum).
- `vary` (default true): every drum and melodic hit goes through `Score.vary()`: four rotating samples, brighter on the downbeat and darker down to the 16ths, and 0.2–1 dB softer on weaker beats. `false` turns this off.
- `mix: 'v2'`: the spectral balance every template but blueprint asks for (off when not passed): pads get a 150 Hz highpass, −3 dB at 300 Hz and a little air; keys −2.5 dB at 280 Hz; the reverb's lowcut moves from 220 Hz to 400 Hz and its highcut from 9.5 to 12 kHz; the music buses get a 7 kHz +3 dB shelf (not blueprint, which is already bright); pulses and plucks open a little; blueprint's arpeggio becomes a triangle wave. Not yet heard by a person.
- `seed` (default 1) for the generated lines, `gain` dB offset for the whole bed.

Harmony: one chord per bar, changing on bar lines, and every layer (pad, melody, bass) reads the same chord function, so sections that start inside a bar never put the pad and the melody on different chords. The progression runs on across sections and starts again only where a drop or the outro begins (or a section says `restart`), so a drop lands on the home chord; a drop that starts inside a bar holds the home chord to the end of its first full bar. When the next drop or the outro cuts a run of the progression short, the run's last bar plays the progression's last chord, so the cadence into the home chord is complete. The outro holds the home chord. Each bed requests its own end fade.

| Preset | BPM to use | Key / progression | What it is | Default arrangement |
| --- | --- | --- | --- | --- |
| `terminal` | 128 | A minor, 8 bars: Am9 Fmaj7 Cmaj7 Em7, Am9 Fmaj7 Dm9 E7sus4 | Steady filtered synth pulse (8ths, then 16ths opening through the build), soft kick, offbeat hats, rim backbeat, sub, soft pad. No big drop. | intro 2, build 30 %, drop, outro 2 |
| `swiss` | 120 | C major, three chord parts | Marimba melody from seeded rhythm cells per bar, marimba bass, low counter-line, woodblock, shaker, log drum, light muted kick; marimba glissando into each drop. | intro 2, build 25 %, drop 30 %, break 1, drop, outro 2 |
| `blueprint` | 100 | E minor: Em9 Cmaj9 Gmaj7 D6 | Soft square-wave arpeggio (`mix: 'v2'`: triangle) with a ping-pong echo, tick-tock clock, airy pad, soft kick on 1 and 3, pencil-tap rim; 2 s fade at the end. | intro 2, build 25 %, drop, outro 2 |
| `inkbeat` | 120–136 (ink template default 124) | F minor: Fm9 drone, then Fm9 Fm9 Dbmaj7 Ebsus2 | Minimal techno. Build has no kick: hats, perc, claps, a resonant pulse opening, riser; the last half bar before a drop is silent; drop adds kick, rolling offbeat bass, open hats, soft impact. | build 8, drop, outro 1 |
| `thread` | 120 | D major: Dmaj7 Bm7 Gmaj7 A | Pad with a single downbeat kick, then four-on-the-floor with pluck arpeggios and bass, pad-only break, climax with claps, 8th bass and a pentatonic pluck run, resolving on D add9 with a bell. | intro 1, build 40 %, break 1, drop, outro 2 |
| `data` | 112 | F major (lydian): Fmaj9 Am7 Bbmaj7#11 C6 | Soft muted four-on-the-floor, up-down plucked arpeggio, warm pad, round bass, occasional bell. | intro 2, build 25 %, drop, outro 2 |
| `diagram` | 96 | Eb major: Ebmaj9 Cm7 Abmaj7 Bb6 | Felt-keys chord and two-bar motif, warm pad entering in the build, gentle plucked pulse, soft low kick and sub in the drop. | intro 2, build 35 %, drop, outro 2 |

## Example `score.mjs`

```js
import film from './content.js';
import { grid, layout } from './lib/beat.js';
import { Score, master, writeMeasure } from './lib/audio/index.mjs';

const g = grid({ bpm: film.bpm, t0: film.t0 ?? 0 });
const laid = layout(film.scenes, g);
const s = new Score({ duration: film.duration, grid: g });

// Music: one section per scene, with its kind, a target energy (the tension curve) and a reading flag.
// The product name gets the drop and the highest energy; a scene read for most of its length keeps the groove
// but loses the melodic layer.
const kindOf = { claim: 'build', steps: 'drop', name: 'drop', end: 'outro' };
const energyOf = { claim: 0.5, steps: 0.6, name: 0.9, end: 0.5 };
const sections = laid.map((sc) => ({
  from: sc.startBar, to: sc.startBar + sc.bars,
  kind: kindOf[sc.type] ?? 'build', energy: energyOf[sc.type], reading: sc.type === 'steps',
}));
s.beds.thread({ sections, seed: film.seed });

// Effects on picture events, on the same grid.
for (const sc of laid) {
  s.play('whoosh', sc.start - 0.3, { dur: 0.35 }, { gain: -18, send: 0.2 });
  if (sc.type === 'name') { s.play('impact', sc.start, {}, { gain: -10 }); s.duck(sc.start, { depth: -4, release: 0.6 }); }
  (sc.items ?? []).forEach((_, i) => s.hit('tick', sc.startBar * g.beatsPerBar + 1 + i, { freq: 2600 + 120 * i }, { gain: -20 }));
}

await s.write('assets/audio/mix-raw.wav');
const r = await master('assets/audio/mix-raw.wav', 'assets/audio/mix.wav', { lufs: -14, tp: -1.5 });
await writeMeasure('.', r, { duration: film.duration });
```

## Sound choices (2026-10-18)

Settled after the batch-2 comparison; the owner accepted the recommendations without listening, so these are **not yet confirmed by ear** and a listening pass may still move them.

| Choice | Now |
| --- | --- |
| Spectral balance and mastering | `content.sound.tone` defaults to `'v2'` in every template's `score.mjs` (bed `mix: 'v2'`, `master(..., { tone: 'v2' })`), except blueprint, which keeps `'v1'` because its square/triangle arpeggio is already bright. Set `tone: 'v1'` to go back. |
| Climax lift | The energy curve raises the bed by (e − 0.6) × 2.5 dB, so the climax sits up to 1 dB over the reference. No switch. |
| Breath before landings | trace, thread and tally dip the music 5 dB for the 70 ms before a fuse, centre name, mark or unmark. No switch. |
| Terminal pulse seventh | On the maj7 chords the pulse plays the chord's own major seventh (+11). No switch. |

plakat's opening keeps a low-energy build (kick on 1 and a woodblock); `content.sound.kinds = { problem: 'intro' }` restores the groove-less opening.

## Tests

`node --test lib/audio/test/*.test.mjs` (in the kit: `node --test test/*.test.mjs`; Node 24 does not take a bare folder) runs without audio rendering: chord tones of every preset sit in the pad's chord with sections starting at 0.25, 0.5 and 0.75 of a bar; chords change only on bar lines; the progression runs on and restarts as described; the reading drop, energy curve, layer rotation, fills, `vary`, `mix: 'v2'`, the climax lift and the terminal pulse's seventh behave as documented.

## Levels

Voices peak at 0 dBFS, so start effects around −10 to −20 dB and let `master()` set the loudness. Beds render at roughly −17 to −20 LUFS raw (2–6 dB of limiting reaches −14) with peaks around −3 to −6 dBFS. If `write()` reports more than a few dB of limiting, the mix is too dense at one moment — lower the loudest hits rather than relying on the limiter.
