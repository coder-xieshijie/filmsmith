# ink template

Heavy condensed type slammed onto paper on every beat; an ink dot hops between the words as their full stop, then
transforms: it opens each next ground under a word (aperture), splits into several stops, swallows a word and bursts
into the next one, sinks and blooms into the accent field, holds still while the world is scanned in round it,
stretches into a wipe bar, punches an iris, floods the frame, and ends as the cursor of the closing URL or command.
The claim lands on the film's one whiteout and the camera leaves through a counter of its type. Mode card:
`references/modes/ink.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs ink <film-dir> --palette cobalt
cd <film-dir>
# fill PLAN.md, edit content.js
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time or a tier that fails
npm run film          # fit → audio → check → render → renders/film.mp4
npm run palettes      # contrast table of every preset
npm run snapshot -- --at 1.3,3.2,8.3,12.5,16.6,20.6,26.0,27.6,29.6,33.8
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film. The only file edited for an ordinary film. No duration, no bars. Optional `typeWidth` (see Variants). |
| `palettes.js` | Presets `cobalt` (default, source film), `vermilion`, `forest`, `carbon` (inverted: dark paper, light night). |
| `timing.rules.js` | How long each scene type needs, measured from its choreography (format: `lib/timing.js`, api 3), the choreography constants `C` that `plan.js` uses, and `events()`, which hands `lib/fit.mjs` the four tiers that `plan.js` computes. |
| `registry.js` | Scene registry (ground, slot limits), transitions, `{fact}` values, the reading word count. |
| `plan.js` | Validation, `fit()` → scene starts, beat times inside each scene, text windows, reading-time cross-check, sound events, the resting dot's bounces, and the four tiers (`micro`, `holds`, `shots`, `expressive`, `peaks`). Shared by picture, sound and `npm run fit`. |
| `film.js` | Renderer: layout from measured type, the dot, camera, scenes, transitions, and the glue to the shared library (`lib/transitions`: aperture-swap, whiteout-slam; `lib/handoffs`: collapse-burst, anchor-swap, counter-portal). |
| `bloom.js` | The ink bloom: loads the baked ink and draws the frame at beat b on the CPU (about 20 ms a frame at 1080p), a pure function of the beat; falls back to a plain disc with a red banner when the bake is missing. |
| `inkflow.js` | The bloom's fluid: the simulation (stable fluids; drops are sources whose fronts shed vortices into tendrils) and the drawing (pigment absorbance on paper, tideline, sizing, granulation). Plain JS, used by Node and the browser. |
| `bloom-bake.mjs` | Runs the simulation once for `content.seed` (about 3 s) and writes `assets/bloom/field.inkz` (gzip, about 6 MB) and `field.json`; skipped when they match. `check`, `snapshot` and `render` run it first; `npm run bloom` by hand. Keep `*.inkz` out of Git. |
| `fx.js` | Template-local effects: streak bursts, gooey dots. |
| `score.mjs` | `inkbeat` bed + one synthesised effect per picture event; writes `assets/audio/mix.wav` at the fitted length and `assets/audio/measure.json` (the master's measured loudness). |

## Time

Length follows content. `npm run fit` (`lib/fit.mjs`) runs `lib/timing.js` `fit(content, rules)` (timing API 3, the
four tiers of change of principles 4 and 5) with `timing.rules.js`: each scene gets the whole beats its choreography
and its copy need at the tempo, the turns `bloom`, `name`, `steps` and `claim` start on a bar line (the scene before
takes the wait), the total is rounded up to a 2-bar phrase (one beat at most per scene after the last turn while below
its ceiling, from the back, the rest to the closing `cta`), the length is stamped onto `index.html`, and
`renders/timing.json` records the key events (slam landings, the burst's landing, counter values, the claim's hit on
its bar line, the dot on the cursor, the closing second move, the turns), the bloom's two hand-offs and the four tiers.
`plan.js`, `film.js` and `score.mjs` read the same fit, and `plan.js` re-checks every text window of the fitted film.
The film folder needs a `PLAN.md` (written by `new-film`).

Tempo 124 bpm (one bar 1.935 s, one beat 0.484 s), range 120–136. `bpm` in content.js fixes it; `target: <seconds>`
lets `fit()` move it inside the range to meet a length, and reports the bars to add or cut when the range cannot. More
copy or more scenes make a longer film; the tempo never changes to hide it.

### The four tiers (api 3)

All of them come from `plan.js`, the tables that place the picture and the sound, through `events()` in
`timing.rules.js`; `npm run fit` fails on any of them and `check-film` measures them again on the render.

| Tier | In this template | Limit |
|---|---|---|
| Text per state | slammed and swapped words enter one a beat (word tier); a label types three quarters of a beat after its line is complete, so line and label are two states; a counter value, then its label; the claim enters whole, `claim: true`, ≤ 8 words | ≤ 5 primary words a state, a claim ≤ 8 |
| T0 micro | every word, label, aperture, split, burst, width jump, step, value, ink drop, typed line, the cursor landing; and the resting dot bouncing in place on a beat wherever nothing else would change for more than two beats (after a landing, before the hop, on the last step or value) | median gap ≤ 2 beats, none over 4 (the example: median 1 beat, longest 3.25) |
| Holds | the claim's reading pause (`pause: true`, from the end of its shock to the moment its other glyphs leave). No other hold is declared: the ambient camera push (Motion) runs through every other scene, so no frame of them is pixel-still; their T0 changes, the bounces included, keep every stretch without a change within two beats | pause ≤ 2 bars |
| T1 | scene starts, and the bloom's second composition at its beat 4 (the ink runs past the frame while the camera pushes in) as a `shot` | median 2–3 s, each ≤ 6 s, CV ≥ 0.3, ≥ 2 in the first 5 s |
| T2 | collapse-burst (a `burst`), anchor-swap scan (`to: 'scan'`), whiteout-slam (into a `claim`), counter-portal (`to: 'portal'`), and the dot's own iris and flood onto another ground (the library's `dot-iris`, drawn by the template) | one every 8–12 s, the same device ≤ 3, ≤ 2 beats each |
| T3 | `name` (reveal), `claim` (the climax when it sits at 60–85 %), `cta` (lock-up); a film with no name and no claim marks its first change as the hook | 2–3, one climax |

What the tiers cannot see stays the author's: a T2 every 8–12 s means a 30–40 s film wants three or four of them, so
use a `burst`, a `scan` and a `claim` (or an iris or flood onto another ground) rather than only hops and cuts; a
`swap` is the mode's T0 run (X18), not a T2.

### Per scene type

In beats at the tempo unless marked s (values and tags: `timing.rules.js` `C`, mode card):

| type | text readable at (from the scene start) | exit (before the scene end) | further motion | read while it holds | ceiling |
|---|---|---|---|---|---|
| `swap` | word k lands on beat k (k + 1 in the film's first scene), each on its own ground; the ground opens from the previous word's dot over 0.44 beat | the last word leaves 0.2 s before the end (+ the lead of a dot transition); into a claim nothing leaves | the dot bounces on the last word | each word in its beat; the last one, 0.3 s | 6 s |
| `slam` | word k lands on beat k (k + 1 in the first scene); label types from 0.75 beat after the last word at 90 chars/s | words leave 0.2 s before the end, the label 0.17 s before that; 0.8 beat earlier into a bloom, 1 beat earlier into wipe / iris / flood / scan; into a claim nothing leaves (the frame exposes to white over the last beat) | split: stops merge 0.85 beat after the last word; the dot bounces while it rests | the complete line 0.3 s × its words (word tier), then the label | 6 s |
| `warp` | word on 0, word2 on 2, label on 2.75 | as slam | the warp builds until beat 3 | the pair as a line from beat 2, then the label | 6 s |
| `burst` | word on 0 (1 in the first scene); collapse-burst from the beat after it is read (at least 1), 2 beats: the dot bursts at 38 % and the particles condense into `into` on the next beat; label 0.75 beat after `into` | as slam | — | the word, then `into`, then the label | 6 s |
| `bloom` | fixed: 8 beats | — | — | none | 2 bars |
| `name` | label 1 at 0.5; label 2 at 4.5, or the next half beat after the name and label 1 have been read | 1 beat before wipe / iris / flood / scan | rise on 0, width jumps 2–6, playhead to at least 7 | name, then the labels | 2 bars |
| `steps` | step k on beat k, each shown exactly one beat (after a scan the dot arrives on beat 1) | words stay to the end (the dot leaves 0.9 beat early on a hop); 1 beat early into wipe / iris / flood / scan | streaks on the first beat; the progress dot bounces after the last step | each step in its beat (one word each, except the last); the last step and the final `STEP n / N` (glance, ≥ 1 s) | 3 bars |
| `ruler` | words on 0 and 1, label on 1.75 | as steps | ruler draws in 0.5 s | the pair as a line from beat 1, then the label | 6 s |
| `counter` | value 1 on 0; each next value on the first bar line after the previous value and label are read plus its 0.3 s stop hop; digits roll 1 beat; label 0.75 beat after the value lands | as steps | the stop bounces while it rests | each value, then its label | 6 s |
| `claim` | the whiteout's hit on 0 (a bar line); the claim is still from 0.45 s (the shock decays) | into a portal: its other glyphs and the dot rise out 0.3 s before the push, which starts 1.8 beats before the end and lands half a beat early; else as slam | — | the claim, in a pause (≤ 2 bars) | 6 s |
| `cta` | URL or command at 0.25 (120 chars/s); the dot lands on its cursor on the first beat ≥ 0.15 s after typing; line at 1. After a portal the wordmark is already there | holds to the end | the dot hops in place onto the last bar's downbeat | name; URL or command ≥ 3 s after typing; line (glance, ≥ 1 s) | rest; takes the phrase rounding |

Reading (principle 1, three tiers, `lib/timing.js` reader): slammed and swapped lines are **word** text (once the line
is complete it holds 0.3 s × its words); labels, names, step words, values, the claim and the URL or command are
**primary** (0.3 s a word, added up in order inside a scene: a label is read after its slammed line); the final step
counter and the licence line are **glance** (still ≥ 1 s; at most 6 words). Punctuation alone is not a word. A scene
holds at most 6 s (`steps` three bars, `bloom` and `name` two) and copy that needs more is an error (`npm run fit`
exits 1): shorten it or split the scene. At 124 bpm a slam of up to two words without a label fits 3–4 beats; a label
of two or three words adds one to three beats; `name` label 2 about 3 words; a counter with one value and a label of
about 3 words takes 4–5 beats.

Inside a scene everything is placed in beats from its start (entrances) or its end (exits), so a longer scene
lands at the same moments and holds longer. The slow camera push is ambient, 1.4 %/s of scale at any tempo, easing
from 4.5 % into 6.5 %, so a longer scene settles instead of pushing harder (not on `burst` and `claim`, whose
hand-offs draw in film space).

`bars` on a scene is accepted only to lengthen it deliberately (a rest); a value below the reading need or above the
ceiling is reported and overridden. The shipped example sets none.

The music follows the scenes: every bar before the first `name` is the build (no kick, a riser, the last half bar
silent), the drop lands on the `name` downbeat, the `cta` bars are the outro; a `claim` gets the second drop: the bar
before it is a build again (no kick, the riser, its last half bar silent while the frame exposes to white) and the drop
lands on the whiteout's hit. Sections are whole bars of the fitted scenes, so the bed fits any length. A generated music
file can replace the bed: `bed: { file: 'assets/audio/bed.wav', offset: 0 }` (set `bpm` to its measured tempo, inside
120–136).

## Copy rules

- Slam, swap and burst words, step words, the claim and names are drawn uppercase as typed (names may be lowercase).
- Strings may quote computed values: `{bpm}` `{bars}` `{seconds}` `{width}` `{height}` `{fps}` `{lufs}` `{seed}`.
  Use them instead of typing numbers the film itself defines. `{lufs}` is measured, see Loudness on screen. `{seed}`
  is `content.seed`, the seed the bloom, the hop heights and the grain of this film are drawn from (2026-10-19).
- Limits below are characters, for `typeWidth: 'compressed'`; `'extended'` has its own (see Variants). Three more
  gates stop the build: **timing** (`npm run fit`: every scene readable within its ceiling and the four tiers, see
  Time), **layout** (`npm run fit` through the rules' `validate` hook, and again `npm run audio`: scene types and
  order, word and item counts, slot limits, the claim's portal glyph) and **margin** (`film.js`, once the fonts are
  measured: a display word, a full stop or a counter value that still crosses the 150 px margin at its auto-fit
  floor paints a red banner and raises a page error, so `npm run check` fails). Rewrite shorter; never shrink type
  below the auto-fit floor.

## Loudness on screen

`{lufs}` is the integrated loudness the master measured, not the target. `score.mjs` calls `lib/audio`'s
`writeMeasure()` after `master()`, which writes `assets/audio/measure.json`; `registry.js` imports that file (Node and
browser alike) and prints `I` with one decimal, e.g. `−14.0`. Until the first `npm run audio`, or with a runtime whose
`lib/audio` has no `writeMeasure()`, the file is missing or holds only the target, and `{lufs}` shows the −14 target
without a decimal; `npm run film` always runs the audio step first.

## Scene registry

| type | ground | ceiling | purpose | slots (limit) |
|---|---|---|---|---|
| `swap` | one per word: paper, night, the accent field for the answer | 6 s | **X18 aperture-swap**: one word a beat on the same anchor (left margin, one-line baseline), each on its own ground; the next ground opens from the dot of the word before, as a circle, a band from its line, closing bars, or a cut; the dot is each word's full stop (onAccent on the field) | `words` 2–6, each one word ≤ 10. Optional `grounds` (paper, night, accent; default paper and night alternating; two neighbours never share one), `answer: <index>` (that word on the accent field; only the answer may stand on it), `apertures` (cycled; default circle, band, close) |
| `slam` | paper | 6 s | One phrase, one word per beat; the dot lands as the full stop of the last word | `lines`: 1–2 lines of words, e.g. `[['CODE','DRAWS'],['EVERY FRAME']]`; each line ≤ 14 incl. spaces; 1–4 words, one per beat (first scene of the film: the first word lands on beat 1). `label` ≤ 34. Optional `accent: <word index>` (that word in the accent: only for a word that is itself transforming). Optional `stops: 'each'` (**split**: every word gets a stop budded off the previous one; they merge back). Optional `align: 'center'` |
| `warp` | paper | 6 s | The problem: an accent word rises and warps, smearing more each beat; an ink word slams under it on beat 2 | `word` ≤ 10 (warps), `word2` ≤ 10, `label` ≤ 34 (about 3 words) |
| `burst` | paper | 6 s | **X11 collapse-burst**: a word slams with its dot, is read, shrinks into the dot, which swells, holds, bursts into a ring and particles that condense left to right into the next word and its dot (T2) | `word` ≤ 10, `into` ≤ 10 (a word or two each), `label` ≤ 34 |
| `bloom` | paper → accent | 2 bars | **Fixed choreography** (`inkflow.js`, a baked fluid simulation, v4 approved 2026-10-19). The dot rests (drip), is released on beat 1 like a drop of ink in water and blooms into lobes with curling tendrils, from 2.4 held ink and three drops widen the mass, from 4.2 drops round its rim carry it past the frame while the camera pushes in (from 3.6 to 2.4× at 7.2; a second composition from beat 4); no paper from about beat 6.8, flat by 7.9; the music is silent in the last half bar | none. Opens the film (frame 0 is the dot at rest on paper, centred, r 34: the state a slam hands over) or follows a `slam`, `warp`, `burst` or a `swap` that ends on paper; followed by `name` |
| `name` | accent | 2 bars | The drop: the name rises out of the field, its width jumps on beats 2–6 (Archivo `wdth`), a playhead dot runs under it | `name` ≤ 16, `labels` 1–2 lines ≤ 36 (first ≈ 4 words, second ≈ 3) |
| `steps` | night | 3 bars | A list, one word per beat, `STEP n / N`, progress dots; the current dot is the accent; a streak burst on the first beat, the hand-off into the list (`streaks: 'each'` for one per beat, `false` for none) | `steps` 3–8, each ≤ 11 and one word (the last may be two); at 124 bpm 6 steps fit two bars, 7–8 take three |
| `ruler` | night | 6 s | Two big words and a ruler of the whole film (one tick per beat); the dot sits on it at the film's real position | `words` exactly 2, each ≤ 8; `label` ≤ 40 (≈ 3 words) |
| `counter` | night | 6 s | One value per bar line; digits count up in their final slots, then the dot lands as the full stop | `items`: 1–2 `{ value ≤ 10, label ≤ 40 }`; two values fit only when each is read within a bar (labels ≈ 3 words) |
| `claim` | paper | 6 s | **X21 whiteout-slam** in: the scene before exposes to white over its last beat, the claim lands on the bar line (the music's second drop) and is read in a pause; set like the name at rest (normal width). `to: 'portal'` leaves by **X23 counter-portal**: the other glyphs and the dot rise out, the camera pushes through the counter of its first 0, O, Q or D into the next scene, which has been visible inside it since the claim landed. One a film | `lines` 1–2 strings, each ≤ 14, ≤ 8 words in all; not the first scene; with `to: 'portal'` a line needs a 0, O, Q or D and the next scene must not start on night (the counter would fill solid) |
| `cta` | paper | rest | Last scene: wordmark, the URL or command types on, the dot lands as its cursor, licence line | `name` ≤ 16, `url` ≤ 52 (a URL or a command line), `line` ≤ 46 (≤ 6 words) |

## Transitions (`to` on the outgoing scene)

| to | from → into | what the dot does | tier |
|---|---|---|---|
| `hop` | same ground (default there) | hops in an arc to its next full stop, landing with the word | T0 |
| `wipe` | any → not bloom/name | stretches into a bar across the frame, then the bar opens as a window onto the next scene (last beat) | T1 |
| `iris` | any → not bloom/name | grows into a ring whose hole shows the next scene, already moving; the ring opens past the frame by beat 0.5 (1.5 beats in all) | T2 onto another ground (`dot-iris`, variant `ring`), else T1 |
| `flood` | any → not bloom/name | takes the next ground's colour and floods out as a crisp disc (last half beat) | T2 onto another ground (`dot-iris`, variant `flood`), else T1 |
| `scan` | any but bloom, claim, cta → a slam, swap, warp, burst, steps, ruler or counter on another ground | **X13 anchor-swap** (`lib/handoffs/anchor-swap`, `swap: 'scan'`): holds still as the anchor while a hairline sweeps down over the last beat with the next world already printed above it; takes the next ground's colour as the line passes it, then hops to its place in the next scene over its first beat | T2 |
| `portal` | `claim` → any not starting on night | **X23 counter-portal** (`lib/handoffs/counter-portal`), see `claim` | T2 |
| `cut` | different grounds (default there) | contrast flip on the downbeat; the dot falls in again from above | T1 |
| whiteout | into every `claim` (not a `to`) | **X21 whiteout-slam** (`lib/transitions/whiteout-slam`): the scene's words stay while the frame exposes to white and the camera leans into the claim; the hit on the claim's bar line | T2, the film's T3 climax |
| bloom | scene type | see `bloom` | T1 + a shot |
| aperture | inside a `swap` | **X18 aperture-swap** (`lib/transitions/aperture-swap`): the next ground opens from the dot over 0.44 beat (cubic out), the anchor holds | T0 |
| burst | scene type | **X11 collapse-burst** (`lib/handoffs/collapse-burst`), see `burst` | T2 |
| split | `stops: 'each'` on a slam | one stop per word, budded off the previous one, merged back into one before the dot moves on | T0 |

Scenes before a `bloom`, `wipe`, `iris`, `flood` or `scan` clear their words a beat early so the dot has the stage;
before a claim they stay (the whiteout exposes them).

The five library devices are imported from `lib/transitions` and `lib/handoffs`, not copied. Two small template-local
extensions, both because the module draws one glyph or one word where ink needs its own layout: the claim is laid out
glyph by glyph so its other glyphs can leave before the push while `counter-portal` draws only the counter's glyph
(passed as a one-character `glyph.text` at its measured x); and the `burst` scene draws its slammed word and its
landed word with the module's own layout (`collapseBurst.prepare`), so the hand-off's two rests are exactly the
scene's frames. The dot's own wipe, iris and flood stay this template's drawing (they open onto a scene that is
already moving, which the frame-level `dot-iris` cannot do without a second render of it).

## Shortest film

The shortest chain the registry allows is `bloom` → `name` → `cta`: 2 + 2 + 2 bars, already a whole phrase, so
6 bars = 10.6 s at 136 bpm, 11.6 s at 124 (`target: 10` picks 136); it passes the four tiers (2026-10-19: T0 median
1 beat, T1 four compositions with the bloom's shot, T2 none needed under 12 s, T3 the name and the lock-up; `fit`
warns that no peak is a climax, expected for a sting). Any chain with a scene before the bloom is at least 7 bars
(the bloom is a turn and starts on a bar line, so a slam before it takes a whole bar) and the phrase rounds it to 8:
14.1 s at 136, which then needs one T2 (a `burst` or a `scan`). Each part of that floor is a rule, not a default: the
bloom's 8 beats are its choreography, the name holds its 7 beats of width jumps and playhead plus the beat the wipe
needs, the closing card holds the command 3 s after typing (principle 1), and a film is a whole number of 2-bar
phrases (principle 5). A film that opens on the bloom shows the dot alone on paper on frame 0; its `turn` key at
0.00 s has no frame before it, so `check-film` reports no picture or sound onset there (WARN, expected; the bloom's
first sound, the drip, is at beat 0.08).

## Variants

Colour: the four presets in `palettes.js`. Form: `typeWidth`, which end of Archivo's `wdth` axis carries the
display type (mode card, Variants). Default `'compressed'` renders exactly as before the option existed
(stills compared pixel for pixel, 2026-10-19).

| typeWidth | display words (slam, swap, warp, burst, steps, ruler, counter) | name and wordmark at rest | name width jumps, beats 2–6 | tracking, word space |
|---|---|---|---|---|
| `compressed` (default) | extra-condensed (62.5 %) | normal (100 %), also the claim | 75 → 87.5 → 62.5 → 87.5 → 100 % | −0.02 em (counter −0.01, name and claim −0.035), 0.2 em |
| `extended` | expanded (125 %) | expanded, also the claim | 112.5 → 100 → 75 → 100 → 125 % | 0 (name and claim −0.01), 0.26 em |

Sizes, floors, baselines, the dot, the choreography and the timing are the same. An expanded black capital is
about twice as wide, so `extended` has its own character limits (a first filter; the margin gate decides):

| slot | compressed | extended |
|---|---|---|
| slam `line` | 14 | 8 |
| swap `word` | 10 | 7 |
| warp `word`, `word2` | 10 | 7 |
| burst `word`, `into` | 10 | 6 |
| name `name` | 16 | 11 |
| steps `step` | 11 | 8 |
| ruler `words` (each) | 8 | 4 |
| counter `value` | 10 | 8 |
| claim `line` | 14 | 8 |
| cta `name` | 16 | 12 |

So the shipped example does not run in `extended` as it stands (`CLIPPING`, `INTEGRATE`, `SECONDS` and
`−14.0 LUFS` are too wide). Cut to `CLIPPED`, `K-WEIGHT`, the ruler `{seconds}` `SEC` and the counter value
`{lufs}` with `LUFS` moved into its label, it runs in both widths at the same 18 bars (the scripts' selftest makes
exactly these four edits).

## Fixed parts

The bloom's choreography, the name's width jumps and playhead, the step counter format, the closing cursor dot and
its second move, the resting dot's bounces (placed by `plan.js`), the camera (ambient push 1.4 %/s, 5 % punch-ins
decaying on every landing), the grain and the misregistration ghost (palette `mis`, an effect colour: 40 %, 0.1 s,
slam impact frames only) are not slots. Margins 150 px; slam and swap type 330 px auto-fit down to 220 px; the
claim 260 px down to 160 px; baselines 640 (one line) or 520 / 830 (two lines); labels, step counter and licence line
IBM Plex Mono 28 px, +0.12 em; the closing URL or command 40 px.

## Example content (shipped)

A made-up subject, "loudgate", a CI check that meters the loudness of every media file in a pull request (not the
source film's subject and not its sentence patterns; replace all of it). It fits 18 bars = 34.8 s at 124 bpm (api 2,
2026-10-18: 16 bars = 31.0 s; batch 1: 18 bars):
swap `TOO` / `LOUD` / `AGAIN` (paper, night, paper) → `SHIPPED ANYWAY.` with the label `NOBODY MEASURED` → warp
`CLIPPING LIVE` → burst `GUESS` into `METER` → bloom → `loudgate` → scan → 6 steps (the meter's stages) → ruler
`{seconds} SECONDS` / `THIS FILM` → counter `{lufs} LUFS` / `ITS MIX, MEASURED` → swap `PASS` / `FAIL` (FAIL on the
field) → whiteout → claim `TOO LOUD` / `NO MERGE` → portal through the first O → wordmark, the command
`loudgate check media/` with the dot as its cursor. Tiers (2026-10-19): T0 median 1 beat, longest gap 3.25; T1 13
compositions, median 2.42 s, CV 0.35; T2 collapse-burst, anchor-swap, whiteout-slam, counter-portal; T3 the name, the
claim (climax at 78 %), the lock-up; `check-film` PASS with no WARN.

## Settled options (batch 2, 2026-10-18)

The two batch 2 options are no longer options; `content.variant` is refused by `npm run audio`.

| option | settled | how |
|---|---|---|
| `field` | `'short'`: the change of ground holds about two bars (the bloom covers the frame at about beat 7.5; with the name's 7.5 beats before the wipe opens, 8 beats) | built into the bloom's timing; settled by theory (principle 7), the owner did not object |
| `push` | `'ambient'`: 1.4 %/s of scale at any tempo (13 px/s at the frame edge) | the only push in `film.js`; accepted on the recommendation, the owner did not compare it shot by shot |

## The baked bloom

The bloom's fluid is simulated by `bloom-bake.mjs` in Node (about 3 s on an M4 Pro, deterministic for a seed) and
stored in `assets/bloom/`; the page only loads and draws it, so no frame waits on the solve (HyperFrames gives a
page 15 s to get ready). Drawing is CPU work, about 20 ms a bloom frame at 1080p. Without the baked fields the bloom falls back to a plain growing disc with a red banner and a console error;
the film is not acceptable that way. A new `content.seed` needs a new bake (the scripts redo it).
