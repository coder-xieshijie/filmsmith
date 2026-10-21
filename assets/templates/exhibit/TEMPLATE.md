# exhibit template

Real assets lie on a desk under a camera looking straight down, as a multiplane: the desk and each print's index
numeral at the back, the prints in their mounts (each bar names its source) on a glass in the middle, and a chip with
the claim each print carries, set in code, on a glass in front. The camera moves between prints in three ways — a
slide along the row in which the three planes move at three rates, a pull back over the whole desk and a hop, or a
cut on one value two prints share — and one pencil ring finds what a claim rests on. At the claim of a print the
ringed regions lift out and become code-drawn readings; a gap can be measured on a print's own axis. At the end the
camera rises over the whole desk and the ring's route ends as the rule under the name. The assets are evidence: the
film crops, scales and veils them, never edits them, and every number it redraws or matches is printed where it says.
Mode card: `references/modes/exhibit.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs exhibit <film-dir>
cd <film-dir>
# capture the assets (tools/capture.mjs), fill PLAN.md, edit content.js
npm run assets        # hashes, what each crop shows, the numbers the film redraws, the zoom cap, no people, the pencil
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time
npm run snapshot -- --at 0.4,4.6,6.0,10.0,15.5,18.5,22.8,35.5
npm run film          # assets → fit → audio → check → render → renders/film.mp4
npm run palettes      # contrast table of every preset, then the pencil against every ringed region
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film: palette, seed, the assets with their manifest, the scenes. The only file edited for an ordinary film. No duration, no bars. Optional `desk` (Variants), `moves` (Moves), `bpm`, `target`, `bed`, `sound`. |
| `assets/real/` | The captured assets, kept as captured (sha256 in content.js). The shipped four are the skill's own outputs (Example content). |
| `palettes.js` | Presets `lightbox` (default), `lightbox-pencil`, `grease`, `pencil`. `npm run palettes` prints every contrast pair and checks the content's pencil against every ringed region (ΔE00 ≥ 20). |
| `layout.js` | The multiplane desk: the one mount every print shares, the three planes and their rates, cameras `{ cx, cy, z }` and each plane's view of them, the views from file px to the desk, the overview for the lock-up. Pure, so Node tools read it too. |
| `choreo.js` | The choreography of every scene type in beats and seconds from the scene's start: one pure function shared by `timing.rules.js` (need, events), `film.js` (the picture) and `score.mjs` (the sound). |
| `moves.js` | The moves, pluggable: one adapter per library hand-off, by role (open, lift, travel, match) (Moves). |
| `timing.rules.js` | Slot limits and `validate(content)`; how long each scene type needs (timing API 3, format `lib/timing.js`), read from `choreo.js`. |
| `film.js` | Renderer: the desk, numerals, mounts, chips, captions, the moves, readings, the dimension, the lock-up. `render(ctx, t)` is a pure function of `t`. |
| `score.mjs` | The `swiss` bed and one synthesised effect per picture event, placed from `choreo.js`; writes `assets/audio/mix.wav` and `assets/audio/measure.json`. |
| `tools/capture.mjs` | Capture an asset: `page` (a live page in headless Chrome), `text` (a text file as printed, in the film's mono face), `file` (a published image as is). Prints the manifest entry. |
| `tools/check-assets.mjs` | `npm run assets` (below); writes `renders/check-assets.txt`. |
| `tools/ocr.swift`, `tools/regions.mjs` | macOS Vision text and face reading; the ΔE00 accent rule (ffmpeg decodes each ringed region). |
| `index.html` | The canvas, the static `__timelines` stub and the pre-registered build hold; `data-duration` is stamped by `npm run fit`. |

## The desk

Every print lies in the same mount: content 1200 × 675 (16:9) under a 54 px bar, at rest centred on x 960 with its top
at y 170; the next print rests one screen (1920 px) to the right, so neighbours are off-frame at rest. A print shows the
16:9 part of its crop round its `focus` (`npm run fit` refuses a box outside that part). One mount for all is what
lets every library move rest on exactly the frame the template draws.

Three planes, at parallax-slide's depths: the back (rate 0.3) carries the desk's texture and each print's index
numeral (`01` …, 220 px, left of the mount, in the mount's edge colour: decoration); the middle (1) the mounts and the
captions under them; the front (1.65) each print's chip (570 × 190 px over the mount's lower right: a 32 px label and
a 76 px value on label stock, a short pencil tick, a shadow). A camera move of Δ moves a plane r · Δ; a camera that
rises to zoom z sees a plane at 1 / (1 + r (1/z − 1)), so near planes slide faster and shrink faster, as planes at
three heights under one rostrum camera. Numerals fade as the camera rises (z < 1) and away from the print in view.

## Assets

Each entry of `content.assets` is the manifest of one file in `assets/real/`:

| Field | What |
|---|---|
| `file` | the file in `assets/real/` (png, webp, jpg) |
| `crop` | `[x, y, w, h]` in the file's pixels; the mount shows its 16:9 part round `focus` |
| `focus` | `[x, y]` file px the shown part centres on, as far as the crop allows (default: the crop's centre) |
| `source` | the line on the mount's bar: where it is from (a domain and path, a tool and what it printed); ≤ 60 characters |
| `chip` | optional `[label, value]`: the claim the print carries, on the front plane; label ≤ 28 characters, ≤ 6 words (glance), value ≤ 10 characters, ≤ 2 words, printed in the shown part (or starting with `~`: read off a chart). Not on the opening print |
| `captured`, `how` | the date and the way it was captured (the line `tools/capture.mjs` prints) |
| `sha256` | the file's hash at capture; `npm run assets` fails when the file changed |
| `claim` | what the film says this asset proves, in one sentence |
| `expect`, `forbid` | strings the crop must show / must not show (an old figure, a currency the copy does not use) |
| `people` | `'none'`: crop people out; faces are detected and fail the check |

Capture larger than the film shows: the opening covers the frame with the first print (its shown part must be
≥ 1440 px wide), and the lift-out and the match cut enlarge a region; the zoom cap is 4/3 output px per source px
(principle 2). A wide table captured as text at 2.6× (`tools/capture.mjs text … --scale 2.6`) gives the mount 0.66 and
a full frame 1.06. Keep each file ≤ 200 KB in a template's shipped example (webp, `--quality`); a film's own assets
have no size limit.

`npm run assets` checks, for every asset: the file and its hash; with macOS Vision, every `expect` and `forbid`
string in the crop and no face; every number the film redraws or matches, where it says (each read cell's value inside
its box, a match's value inside its box in both prints, a measure's two values in the asset unless a point says
`printed: false`, a chip's number in the shown part); the zoom cap for every mount, the opening's full frame and a
lock-up mark; and the accent rule for the content's palette. Off macOS the reads are INFO and the rest still runs.
`npm run film` runs it first and stops on a FAIL.

## Time

Length follows content. `npm run fit` runs `lib/timing.js` `fit(content, rules)` (timing API 3) with
`timing.rules.js`: each scene gets the whole beats its choreography and its copy need. No scene is a turn, so none
waits for a bar line (a pad would be a still frame); the total is rounded up to a 2-bar phrase and the rounding goes
to the lock-up, a rest, whose last move lands on the last downbeat. Tempo 120 bpm (one bar 2.0 s), range 112–128;
`bpm` fixes it, `target: <seconds>` moves it inside the range.

Captions, the claim and the lock-up's line enter word by word at reading pace, 0.3 s a word, so the picture is not
still while they are read; it holds still only after the text has landed, and every still stretch after a landing is
a declared hold (≥ 0.2 s, ≤ 2 beats; the claim's hold is a pause). A reading's value and label, a chip's value, the
name and the address are primary text read as they land; notes and a chip's label are glance text (≤ 6 words, still
≥ 1 s). Exits are placed from the scene's end, so a longer scene lands at the same moments and holds a little longer
before its exit.

### Length table

Beats from the scene's start at the tempo, unless marked s.

| Type | Motion | Primary text (enters from) | Glance | Need |
|---|---|---|---|---|
| `open` | the print covers the frame at the zoom cap for 1 beat; the camera rises 2 beats (`bezel-pullback`), the mount lands on beat 3 | `caption` from 3.5 | — | read + 0.3 s |
| `travel` | `parallax-slide` or `camera-truck` 2 beats, or `grid-hop` 3 (pull back to the whole desk to 36 %, the ring hops to 55 %, the dive lands by 97 %) | the chip's value at the landing, then `caption` (from half a beat after it) | the chip's label | read + 0.3 s |
| `read` | rings start every 0.5 beat and draw in 1.5; the lift-out (`lift-out`, 2 beats) starts on the first whole beat after the last ring; the cards are read one by one as their labels land (the card being read is lit, the others step back) | each card's value and label as it lands, then `caption` | each `note`, a beat into its card's reading | read + 0.3 s + 1.5 beats (the readings go back 1 beat, the rings come off 0.5) |
| `match` | the ring draws round the value 1 beat; `match-cut` 2 beats: the push in, the cut on beat 2 (both sides still), the pull back to the next print, landing on beat 3 with its value ringed | the chip's value at the landing, then `caption` | the chip's label | read + 0.3 s |
| `measure` | the match's ring comes off and a chip in the way steps aside (0.5 beat); the dimension draws from 0.5 to 2; its chip, the computed difference, lands on beat 2 (accent, the reveal) and the rest of the print steps back round it | `caption` (the claim) from 2.5 | — | read + 0.75 s (a pause) |
| `lockup` | the camera rises over the whole desk, 2 beats; the name settles from 1.5 to 2; the address types at 24 characters a second; the rule draws 1 beat, the ring's route 2; the last ring closes round the address on the last downbeat | `name` on 2, `line` from 3, `url` as it types | — | read + route + max(1 bar, 3 s); takes the phrase rounding |

At 120 bpm: an `open` with a five-word caption 2 bars; a `travel` with a chip and a four-word caption 1.75 bars (by
grid-hop, the same with its third beat); a `read` of three cells with notes and a four-word caption 3.25 bars; a
`match` with a chip and a four-word caption 2 bars; a `measure` with a five-word claim 1.75 bars; the lock-up with a
five-word line and a 36-character address 5.5 bars with the rounding.

**Tiers** (`choreo.js`, principle 5): T0 — every word as it enters, every ring, each card's label, the reading
marker's steps, each note, the stages of a move, plus each landing; T1 — every landing composition, and `grid-hop`
(3 beats, too long for a T2); T2 — `parallax-slide`, `camera-truck`, `lift-out`, `match-cut` and the rise (the
opening's pull-back is the first composition, not counted); T3 — the hook (the opening caption), the measured gap
(climax; without a `measure`, a `read` marked `claim: true`), the lock-up. `npm run fit` refuses a film that breaks
them: the measure belongs at 60–85 % of the length (a short film with one read may need a word more before it).

## Global slots

| Slot | Limit | Notes |
|---|---|---|
| `palette` | id | `lightbox` (default), `lightbox-pencil`, `grease`, `pencil`; never a hex value. Pick by `npm run palettes`: only a preset marked `ok` for the content's regions |
| `desk` | id | `plain` (default), `mat` (Variants) |
| `moves` | `{ role: id }` | Moves, below; omit for the defaults |
| `seed` | int | the desk's fibre texture, the sound's variations |
| `meta` | `{ title, url }` | the film's title and address (PLAN.md, the render's metadata) |
| `assets` | object | Assets, above |
| `bed`, `sound` | — | `sound: { bed: 'swiss', seed }` picks another bed preset or seed; `bed` as in every template (CONTRACT.md, Sound) |

## Scene registry

| Type | Purpose | Slots (limit) |
|---|---|---|
| `open` | First scene only (T3 hook): the first print covers the frame at the zoom cap, content first; the camera rises and its mount grows round it | `exhibit` (asset id); `caption` ≤ 5 words |
| `travel` | The camera goes to another print; it lands with that print's chip | `exhibit` (another than the one before); `move`: `'parallax-slide'` (default; to a neighbour in the row), `'camera-truck'` (to a neighbour), `'grid-hop'` (to any print: pull back over the whole desk, hop, dive); `caption` ≤ 5 words |
| `read` | The claim of a print: one to three regions are ringed, lift out and become readings; at most 2 a film | `exhibit` (the one before); `cells` 1–3, each `{ box, glyph, value, label, note }`: `box` the region ringed and lifted, `glyph` the printed value inside it (file px), `value` ≤ 8 characters as printed, `label` ≤ 16 characters, value and label ≤ 3 words, `note` ≤ 6 words (glance); `caption` ≤ 5 words (`claim: true`: ≤ 8, a peak when the film has no `measure`) |
| `match` | One value printed in two prints: the camera pushes in on it, cuts on a still frame to the same value in the next print, and pulls back; the ring does not move across the cut | `exhibit` (another than the one before); `from { box, value }` in the print before (the value as printed in both); `to { box }` in this one; `caption` ≤ 5 words |
| `measure` | The gap between two points on this print's own axis, computed and labelled (T3 reveal, the climax) | `exhibit` (the one before); `a`, `b` = `{ point: [x, y] file px, value: number as printed, printed? }`; `label` with `{diff}` or `{ratio}` (default `{diff}`); `digits` (default 1); `caption` ≤ 8 words with `claim: true` |
| `lockup` | Last scene (T3): the camera rises over the whole desk; the title block under the row | `name` ≤ 16 characters; `line` ≤ 6 words; `url` ≤ 40 characters; `mark` (optional asset id: a captured logo shown 100 px tall above the name); no caption |

The first scene is `open`, the last `lockup`; `read` and `measure` stay on the print before them; `travel` and
`match` go to another. Prints lie on the desk in the order they first appear. `npm run fit` (and the page, as a red
banner) reports every slot that breaks its limit, a box outside the part of its print the mount shows, a slide or
truck to a print that is not a neighbour, a third `read`, and an asset without `people: 'none'`. Rewrite shorter;
never shrink type.

## Moves

Each move is a hand-off from the shared library, through an adapter in `moves.js`; the film changes the axis of
motion from chapter to chapter (transitions.md, Families):

| Role | Adapters (default first) | What it does here | Family |
|---|---|---|---|
| `open` | `bezel-pullback` | the first print at the cover zoom; the camera rises and the mount grows out of its edges | zoom and depth |
| `travel` | `parallax-slide`, `camera-truck`, `grid-hop` | slide to the neighbour with the three planes at three rates; truck to the neighbour on the middle plane alone; pull back until the whole desk is a contact grid, the ring hops to the print, the camera dives in (the module's tiles are drawn onto the mounts, so its grid is the desk) | horizontal advance; zoom and depth |
| `lift` | `lift-out` | the claim's regions rise and become readings; the print is drawn by the template (`backdrop: false`); at most twice a film | lift and flip |
| `match` | `match-cut` | push in on a value, cut on a still frame to the same value in the next print, pull back; never blurred across the cut | edit cut |

`content.moves = { travel: 'camera-truck' }` sets a role's default; a `travel` scene may name its own `move`. The
choreography reads only an adapter's `device`, `beats` and `expressive` (through `moveOf()`), so a swapped move keeps
every timing check. **Swapping a transition:** add the module to `lib/handoffs/` (or keep it in the film), then add an
adapter to `ADAPTERS[role]` in `moves.js`:

```js
'my-move': {
  device: 'my-move', beats: 2, expressive: true,      // device id, length in beats, declared as a T2
  async create(env, use) {                            // env: createHandoff, modules, zoomBetween, measure, PAL, FONT, MONO, assetOf, world …
    const h = await env.createHandoff('my-move', { /* params from use: the scene and its prints */ ground: false });
    return {
      draw: (ctx, p) => h.draw(ctx, p, { blur: false }),   // film.js blurs the whole frame
      camera: (p) => ({ cx, cy, z }),                     // the middle plane's camera (layout.js)
      track: (p) => [[x, y], …],                          // screen points, for the motion blur
      owns: [fromId, toId],                               // the prints whose mount the module draws itself
      draws: { numerals: [], chips: [], shadows: false }, // what else it draws itself; the template draws the rest
    };
  },
},
```

The adapter maps the desk to the module's own frame: at p = 0 and p = 1 it must draw exactly what the template draws
on either side (the same window, view, shadow, numeral and chip), or the move pops. Every print's mount is the rest
window, every print's asset is passed with its shown 16:9 part as the crop, and the planes' rest positions and rates
are parallax-slide's parameters, so the library's asset hand-offs rest on the template's frame as they are.

**Local extensions** (CONTRACT.md, Transitions): the lift adapter paints `lift-out` with its own preparation instead
of `h.draw`, because a reading's note sits under its label and the cards must widen to the longest note, which the
module's parameters cannot express; `grid-hop` is drawn under a scale onto the mounts (its tiles are the prints'
content, the template draws their mounts round them); the module's `at`, `paint` and `track` are used unchanged.

## Variants

Colour: four presets in `palettes.js`; a light desk by default, because most captures are white pages and on a light
desk they sit one step above the ground instead of being the brightest thing in the frame. Pick the pencil by the
assets: red unless the ringed regions use red, pink or orange (then a blue pencil); `npm run palettes` decides.

Form: `desk`. The default `plain` renders exactly as before the field existed.

| `desk` | The desk | Reads as |
|---|---|---|
| `plain` (default) | the ground with a faint fixed fibre texture on the back plane | a clean light table; the prints are the only structure |
| `mat` | adds a cutting mat's grid, 1 px lines every 80 desk px at 22 % of the muted ink, on the back plane | a workbench: measuring and cutting, near the `measure` scene's dimension |

Timing, layout and the moves are the same in both.

## Shortest cut

For a reel or a sting: `open` → `lockup` with the name and the address: 6 bars = 12.0 s at 120 bpm, 11.25 s at 128.
The first frame is already the mode's world (the print at the cover zoom), and the lock-up's last bar holds after its
last ring, so the last half second is settled. With a line under the name, or one `travel` between them: 8 bars =
16.0 s at 120.

## Fixed parts

The mount (content 1200 × 675 at x 360, y 224 at rest; a 54 px bar with the source in IBM Plex Mono 25 px; 12 px
corners; a shadow, blur 30, offset 14, 40 %); prints one screen apart; the planes' rates 0.3 · 1 · 1.65 and rest
positions (numeral 220 px at (48, 330); chip 570 × 190 at (1290, 770), label 32 px, value 76 px); captions in
Instrument Sans 59 px, 76 px under the mount; readings on label stock (lift-out cards 140 px tall, values in Instrument
Sans 700, labels 44 px, notes Plex Mono 25 px); the pencil (3 px rings with 6 px padding round a reading, 12 px round a
matched value, 10 px corners; the dimension 4 px with 14 px ticks; the rule 6 px); the veil of a stepped-back print
(ground at 55 %, 45 % round the measured gap); the light falling off toward the frame's edges; sub-frame motion blur on
every frame whose fastest point moves more than 1 px a frame, except across the match cut.

## Example content (shipped)

Filmsmith measuring one of its own films. Every asset is the skill's own output, so the example ships with no
third-party material: a frame of the phosphor demo, the timing table `npm run fit` printed for it (captured as text at
2.6×), the first 17 lines of the report `check-film` printed for its render, and a chart of that render's short-term
loudness. The chart is a stand-in drawn in code from the measured series and says so on its face and on its mount; a
real film uses captured charts. It fits 18 bars = 36.0 s at 120 bpm, `npm run fit` with no errors:

open on the film's frame, `A film drawn in code.` → grid-hop: the camera pulls back over the whole desk, the ring hops
to the timing table, the camera dives in, `Length follows the copy.` → read (lift-out) `124` bpm, `22` bars,
`42.581` seconds, `Fitted, never typed.` → parallax-slide to the report, its chip `-14.1 LUFS`, `Every render is
measured.` → match: `-14.1` in the report, cut to the chart's own label for it, its chip `-12.1 LUFS`, `The same level,
charted.` → measure the gap on the chart's axis, `+2.0 LU`, `Two under a five-LU limit.` (climax, 63 %) → rise;
`Filmsmith` / `Films drawn and scored in code.` / the repository address.

Tiers: T0 median gap 0.6 beats (max 2.1), T1 13 compositions (median 2.5 s), T2 4 (lift-out, parallax-slide,
match-cut, the rise; grid-hop is T1), T3 3 (hook 2.0 s, the gap 22.5 s = 63 %, climax; lock-up 26 s).
