# pulse template

A question played as a query: it is asked one word per beat at a fixed anchor, run over real candidates by a
highlight that hops, locked, answered in the film's one whiteout on the music's drop, explained by its figures,
and landed again on the name. The ground flips along one hue's lightness ramp (plus a near-white and a
near-black) through geometric apertures; amber marks only the answer; a mono query line under the words carries
the real parameters. Mode card: `references/modes/pulse.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs pulse <film-dir> --palette indigo
cd <film-dir>
# fill PLAN.md, then edit content.js
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time
npm run film          # fit → audio → check → render → renders/film.mp4
npm run palettes      # contrast table of every preset, ground by ground
npm run snapshot -- --at 0.6,2.55,7.6,9.42,13.6,19.7,20.03,21.6,23.0,27.6,31.5
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film. The only file edited for an ordinary film. No duration, no bars. Optional `aperture` (form variant). |
| `palettes.js` | Presets `indigo` (default, the owner-accepted sample), `petrol`, `graphite`; `onGround()` decides every text colour on every ground; `npm run palettes` checks each pair. |
| `registry.js` | Scene registry (slot limits, item counts), transitions and their tier, `{fact}` values computed from the searches, validation. |
| `choreo.js` | When everything happens inside each scene type, in seconds from its start: one table for picture, sound, timing and reading. |
| `timeline.js` | The fitted film as moments: key events, holds, the portal hand-off, the four pacing tiers (micro, shots, expressive, peaks) and the sound cues. |
| `timing.rules.js` | `need()` and `steps()` per type from `choreo.js`, `events()` from `timeline.js`; timing API 3. |
| `plan.js` | Validation, `fit()`, the timeline; shared by `film.js` and `score.mjs`. |
| `film.js` | Renderer: measured type, the anchor, cells, figures, the lock-up; the devices come from `lib/transitions` and `lib/handoffs` (Devices, below). |
| `score.mjs` | The pulse bed and one synthesised effect per picture event; writes `assets/audio/mix.wav` and `measure.json`. |

## Time

Length follows content (`lib/timing.js`, timing API 3). Tempo 120 bpm (one beat 0.5 s), range 112–120: a glance
item must stay still a full second and a hold after a landing lasts at most two beats, which is a second only at
120 or slower. `target: <seconds>` moves the tempo inside the range and reports the bars to add or cut.

Turns: `reveal` starts on a bar line (its whiteout is the claim key, on the drop). The time it waits for the bar
line goes to the scene before it, a search, which spends it on extra highlight laps on eighth notes, never on a
held frame. The film is rounded up to a 2-bar phrase: whole bars before the reveal when its segment has room (so
the climax moves later, not the lock-up longer), the rest to the closing `name`, whose ground flips once more on
the downbeat of its last bar.

Per scene type (beats at the tempo unless marked s; values in `choreo.js` `C`, tags on the mode card):

| type | what lands, from the scene start | reading (primary, unless glance) | leaves |
|---|---|---|---|
| `ask` | word k on its beat through an aperture (the film's first word on beat 1, frame 0 is the ground and the prompt typing); a word holds until read plus the next aperture: 1 beat for one word, 2 for two, 3 for three; its query fragment types with it (a beat later when the word holds 3 beats; half a beat later on the last word) | each word in its state (≤ 5 words a state); fragments glance (≤ 6 words, still ≥ 1 s) | the next aperture covers it on the next beat |
| `search` | the row at 0; hops on beats from 1 (known candidates on eighth notes, from ½); a value rises 0.08 s after its hop; the best passing candidate scrambles; lock one beat after the last hop; with no pass, a hop onto the empty slot, then the verdict at the anchor one beat later (a new composition on ramp[1]) and the summary on the next beat | each new value, the resolved answer, the verdict; the restated question and the summary glance | into a reveal: the last beat is the exposure build |
| `data` | figure k at k beats or once the previous figure and label are read, less a beat; a figure scrambles 0.35 s or counts 1 beat; its label rises when the reader reaches it; the query line on the first beat after the first label | each figure, then its label; the query glance | — |
| `reveal` | white for two frames on the bar line, the answer bursting in blurred and scaled (0.45 s) while the ground falls from white (0.3 s); the line on beat 1, the query on beat 2 | the value, then the line (a claim, read in a pause ≤ 2 bars); the query glance | the push through the counter takes the last two beats |
| `name` | name with the version at 0 (smears in after a slice), the line on beat 1, the install command from beat 2 at 50 characters a second; the ground flips on the last downbeat | the name, the line, the command (≥ 3 s once typed) | — (rest, absorbs the phrase rounding) |

A hand `bars` value only lengthens a scene; below its reading need it is reported and overridden.

## Length table: what counts as primary text

Budget copy with this before running `npm run fit`. A state is what enters at one moment; it carries at most five
primary words (the reveal's line is a claim: up to eight). Units: Latin words; `{fact}` counts as one.

| type | primary slots | glance slots | typical length at 120 bpm |
|---|---|---|---|
| `ask` | each `words[k].text` (its own state) | each `words[k].param` | 1 beat a one-word state, 2 for two words; 3–6 states ≈ 2–5 s |
| `search` | each new candidate's `value`, the computed verdict (`0 of 3 pass`) | `line`, `query`, the computed summary, the labels | 3 new candidates and a slot ≈ 4.5 s with the verdict; a re-run over known ones ≈ 2–2.5 s |
| `data` | each `value`, each `label` | `query` | 2 items ≈ 3 s, 3 items ≈ 3.5–4 s |
| `reveal` | `value`, `line` (claim) | `query` | 2 bars (4 s) with the push; 2 bars as a closing reveal |
| `name` | `name` + `version`, `line`, `install` | — | ≥ 4.5 s, takes the phrase rounding |

Composition lengths must have a median of 2–3 s (T1): a question of more than about five states is two `ask`
scenes (two phrases), as in the example.

## Copy rules

- Strings may quote computed values: `{answer}` (the passing candidate's value), `{version}` (its label), `{pass}`
  (`1 of 4`), `{x:<label>}` (how many times better the answer is than that candidate, e.g. `{x:3.7}` → `8.0×`),
  `{bpm}` `{bars}` `{seconds}`. Every number derived from another number on screen comes from these.
- The search's outcome is computed, never typed: candidates pass when their value is under `limit` (`better:
  'higher'` for throughput), the best passing one is the answer, the verdict reads `n of N pass`.
- Character limits are a first filter; `film.js` measures every string once the fonts are in and paints a red banner
  (and raises a page error, so `npm run check` fails) when one still crosses the 160 px margin at its floor.
- Three gates stop the build: `npm run fit` (registry, limits, reading, the four tiers), the margin banner, the font
  banner. Rewrite shorter; never shrink type below its floor.

## Scene registry

| type | ground | purpose | slots (limit) |
|---|---|---|---|
| `ask` | walks the ramp: mid, black, light, deep; a word ending in `?` on white | One word per beat at the fixed anchor; the query line under it types each word's machine form | `words`: 2–6, each a string or `{ text ≤ 14, param ≤ 34 }`. Each state ≤ 5 words |
| `search` | ramp[0]; the verdict on ramp[1] | Candidates in cells; a highlight hops; the answer scrambles and locks in amber, or the verdict says none passes | `line` ≤ 34 (the question restated), `limit` (number), `candidates` 2–5 `{ label ≤ 5, value ≤ 8 }`, optional `better`, `slot: true` (an empty cell for the build that does not exist yet), `query` ≤ 48 |
| `data` | ramp[2] (or `ground: 'r0'`–`'r2'`) | One figure a beat, each with its label; figures scramble or count (`count: true`) in fixed slots | `items` 1–3 `{ value ≤ 9, label ≤ 26, count }`, `query` ≤ 48 |
| `reveal` | white, then ramp[0] | The film's one whiteout: the answer slams in amber on the drop, its line is read as a claim | `value` ≤ 7 (usually `{answer}`), `line` ≤ 30, `query` ≤ 48. At most one per film; not first; a closing reveal needs `rest: true` |
| `name` | ramp[1], ramp[0] on the last downbeat | The lock-up: name, version (amber when it is the answer), line, install command | `name` ≤ 12, `version` ≤ 6, `line` ≤ 34, `install` ≤ 34. Last scene only |

## Transitions (`to` on the outgoing scene)

| to | tier | what happens | when |
|---|---|---|---|
| `aperture` (default) | T1 | the next scene opens in a geometric aperture onto its ground, on the beat, 0.2 s cubic out (`aperture-swap`): `close` (cut) or `circle` (round) | inside a chapter |
| `cut` | T1 | plain cut on the beat | rarely; the aperture is the mode's cut |
| `invert` | T2 | hard flip to the white ground on the downbeat; the first word slams | a change of topic (what changed) |
| `whip` | T2 | `whip-push`: the next card pushes the old one off to the left in 0.15 s with a 64-tap motion streak, landing on the beat | after a verdict, into the evidence |
| `slice` | T2 | `slice-smear`: the old scene leaves in 72 px bands at their own speeds; the next resolves out of a smear in 0.13 s a band | into the lock-up |
| `portal` | T2 | `counter-portal`, from a `reveal` only (its default when the value has a counter): the counter of the answer's first 0, O, D or Q (else its first glyph with a counter) shows the next scene from the first frame, framed on its first figure; the camera pushes through it over the last two beats | after the reveal |
| (into a `reveal`) | T3 | `whiteout-slam`: the camera leans into the locked cell while the frame exposes toward white over one beat, two white frames on the bar line, the answer lands | always |

An expressive device appears at most three times in a film (`npm run fit` refuses a fourth); T2 wants one every
8–12 s.

## Variants

Colour: `indigo` (default), `petrol`, `graphite` (`palettes.js`). Form: `aperture`, the shape of every mark that
opens or holds something.

| `aperture` | ask apertures (in turn) | scene aperture | cells and highlight | lock-up flip |
|---|---|---|---|---|
| `cut` (default) | band, close | close | square | band |
| `round` | circle | circle | 56 px radius | circle |

Choreography, timing, type and colours are the same.

## Devices: the library and two template-local parts

Every transition is a library module, used by its id (`device` in `renders/timing.json`): `aperture-swap` (the
ask apertures, the scene apertures, the verdict, the closing flips), `whip-push`, `slice-smear` and `whiteout-slam`
from `lib/transitions` (WebGL, frame-level: `film.js` paints the two scenes into scratch canvases and the module
mixes them), and `counter-portal` from `lib/handoffs`. Two things stay in `film.js`, each for a reason:

- **The search's roulette and its scrambling value.** `roulette-lock` frames labels on a fixed track and locks one;
  a pulse search also reveals each candidate's measured value under it as the highlight arrives, dims the ones that
  fail the limit, keeps an empty slot, and scrambles the answer's digits in their own proportional slots (the
  library's `scramble-resolve` sets a mono line). The roulette is about 60 lines of cells; the digits use the
  seeded `hash` of `lib/rng.js`.
- **Framing inside the counter.** `counter-portal` centres the far scene's frame centre on the counter; pulse
  shifts it, through the module's own `to` painter and its transform, so that the next scene's first figure sits
  in the counter from the first frame and travels to its own place as the push lands. Without it the counter shows
  an empty ground for most of the reveal (the sample's weakness).

Two parameters differ from the modules' defaults, both on the whiteout: no channel offset (`shift: 0`, the mode's
only colours are its ramp and the amber), and `colors.ground` set to the paper, because the reveal paints its own
ground falling from white (0.3 s, an S-curve): the module's blur then mixes the answer with the ground it is on, so
the answer's edges stay clean on white, and no frame of the fall reads as a cut.

## Shortest cut

For a reel: `ask` → `ask` (`to: 'whip'`) → `search` (the answer passes) → `reveal` with `rest: true`. The reveal
closes the film: after its claim the ground flips around the answer on the last downbeat (the lock-up). 6 bars:
12 s at 120 bpm, 12.9 s at 112. The floor is the reveal's bar line (4 bars of question and search, so the climax
sits at two thirds) plus its two bars; `npm run fit` passes it with two T1/T3 shape warnings (no accelerating run of
three compositions in so short a film).

```js
scenes: [
  { type: 'ask', words: [{ text: 'which', param: '$ quench bench' }, { text: 'build', param: '--builds 3.8,3.9,4.0' }, 'passes'] },
  { type: 'ask', words: [{ text: 'under', param: '--max 1s' }, '1 s?'], to: 'whip' },
  { type: 'search', line: 'under 1 s?', limit: 1, query: 'mono-2400 · warm · median of 5',
    candidates: [{ label: '3.8', value: '3.1 s' }, { label: '3.9', value: '1.9 s' }, { label: '4.0', value: '0.6 s' }] },
  { type: 'reveal', value: '{answer}', line: 'quench {version}', query: 'p50 · {pass} pass', rest: true },
]
```

## Fixed parts

The anchor (left 160, baseline 660), the query line (mono 31 px at 990), the ramp walk of the asks, the cell grid,
the exposure build, the two white frames and their decay, the counter (traced by `counter-portal` from the
rendered glyph), the closing flip, the grain (5 %, seeded) are not slots. Margins 160 px; words 364 px fitted down
to 233; figures 364 / 291 by rows, floor 186; the answer 568 px, floor 455; the name 364, floor 291.

## Example content (shipped)

A made-up subject, `quench` 4.0, an incremental build tool for TypeScript monorepos, and its warm-rebuild benchmark
(illustrative numbers; replace all of it). 16 bars = 32 s at 120 bpm, the whiteout at 20 s (63 %):
`which build rebuilds` / `2,400 files under 1 s?` → search over 3.7, 3.8, 3.9 and an empty slot, `0 of 3 pass` →
whip → `token.ts` one line edited, `2,400` files rechecked, `1.9 s` every time → invert → `in 4.0 an edit
rechecks` / `only its importers` → the re-run, 4.0 locks → whiteout `0.6 s` → through the 0 → `14` files
rechecked, `3.2×` vs 3.9, `8.0×` vs 3.7 → slice → `quench 4.0`, `npm i -D quench@4.0.0`.
