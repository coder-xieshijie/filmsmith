# exhibit template

Real assets lie on one desk, each in a mount whose bar names its source; a camera looking straight down travels over
them. One pencil ring finds the region a claim rests on; the region lifts out of the asset and becomes a code-drawn
reading. A value can be carried from one asset to its twin in the next, and a gap can be measured on an asset's own
axis. At the end the camera rises over the whole desk and the ring's route ends as the rule under the name. The
assets are evidence: the film crops, scales and veils them, never edits them, and every number it redraws is printed
where it says. Mode card: `references/modes/exhibit.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs exhibit <film-dir>
cd <film-dir>
# capture the assets (tools/capture.mjs), fill PLAN.md, edit content.js
npm run assets        # hashes, what each crop shows, the numbers the film redraws, the zoom cap, no people, the pencil
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time
npm run snapshot -- --at 0.4,3.0,9.0,15.0,21.0,24.5,35.5
npm run film          # assets → fit → audio → check → render → renders/film.mp4
npm run palettes      # contrast table of every preset, then the pencil against every ringed region
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film: palette, seed, the assets with their manifest, the scenes. The only file edited for an ordinary film. No duration, no bars. Optional `desk` (Variants), `moves` (Moves), `bpm`, `target`, `bed`, `sound`. |
| `assets/real/` | The captured assets, kept as captured (sha256 in content.js). The shipped three are the skill's own outputs (Example content). |
| `palettes.js` | Presets `lightbox` (default), `lightbox-pencil`, `grease`, `pencil`. `npm run palettes` prints every contrast pair and checks the content's pencil against every ringed region (ΔE00 ≥ 20). |
| `layout.js` | The desk: one world coordinate system in which the exhibits lie in a row, each at its own scale under the zoom cap; the views from file px to world to screen; the overview for the lock-up. Pure, so Node tools read it too. |
| `choreo.js` | The choreography of every scene type in beats and seconds from the scene's start: one pure function shared by `timing.rules.js` (need, events), `film.js` (the picture) and `score.mjs` (the sound). |
| `moves.js` | The four moves, pluggable: one adapter per role (open, lift, travel, carry) over a shared hand-off module (Moves). |
| `timing.rules.js` | Slot limits and `validate(content)`; how long each scene type needs (timing API 3, format `lib/timing.js`), read from `choreo.js`. |
| `film.js` | Renderer: the desk, the mounts, the moves, captions, readings, the carried reading, the dimension, the lock-up. `render(ctx, t)` is a pure function of `t`. |
| `score.mjs` | The `swiss` bed and one synthesised effect per picture event, placed from `choreo.js`; writes `assets/audio/mix.wav` and `assets/audio/measure.json`. |
| `tools/capture.mjs` | Capture an asset: `page` (a live page in headless Chrome), `text` (a text file as printed, in the film's mono face), `file` (a published image as is). Prints the manifest entry. |
| `tools/check-assets.mjs` | `npm run assets` (below); writes `renders/check-assets.txt`. |
| `tools/ocr.swift`, `tools/regions.mjs` | macOS Vision text and face reading; the ΔE00 accent rule (ffmpeg decodes each ringed region). |
| `index.html` | The canvas, the static `__timelines` stub and the pre-registered build hold; `data-duration` is stamped by `npm run fit`. |

## Assets

Each entry of `content.assets` is the manifest of one file in `assets/real/`:

| Field | What |
|---|---|
| `file` | the file in `assets/real/` (png, webp, jpg) |
| `crop` | `[x, y, w, h]` in the file's pixels: what the film shows; every box of every scene lies inside it |
| `source` | the line on the mount's bar: where it is from (a domain and path, a tool and what it printed); ≤ 60 characters |
| `captured`, `how` | the date and the way it was captured (the line `tools/capture.mjs` prints) |
| `sha256` | the file's hash at capture; `npm run assets` fails when the file changed |
| `claim` | what the film says this asset proves, in one sentence |
| `expect`, `forbid` | strings the crop must show / must not show (an old figure, a currency the copy does not use) |
| `people` | `'none'`: crop people out; faces are detected and fail the check |

Capture larger than the film shows: an exhibit lies on the desk at most 1500 × 740 px, but the opening covers the
frame with the first asset and the lift-out enlarges a cell; the zoom cap is 4/3 output px per source px (principle
2). A wide table captured as text at 2.6× (`tools/capture.mjs text … --scale 2.6`) gives the opening 1.06. Keep each
file ≤ 200 KB in a template's shipped example (webp, `--quality`); a film's own assets have no size limit.

`npm run assets` checks, for every asset: the file and its hash; with macOS Vision, every `expect` and `forbid`
string in the crop and no face; every number the film redraws, where it says (each read cell's value inside its box,
a carried value in its source box and inside the target's ring, a measure's two values in the asset unless a point
says `printed: false`); the zoom cap for every exhibit on the desk, the opening's cover and a lock-up mark; and the
accent rule for the content's palette. Off macOS the reads are INFO and the rest still runs. `npm run film` runs it
first and stops on a FAIL.

## Time

Length follows content. `npm run fit` runs `lib/timing.js` `fit(content, rules)` (timing API 3) with
`timing.rules.js`: each scene gets the whole beats its choreography and its copy need. No scene is a turn, so none
waits for a bar line (a pad would be a still frame); the total is rounded up to a 2-bar phrase and the rounding goes
to the lock-up, a rest, whose last move lands on the last downbeat. Tempo 120 bpm (one bar 2.0 s), range 112–128;
`bpm` fixes it, `target: <seconds>` moves it inside the range.

Every text a viewer reads (captions, a reading's value and label, the carried reading's value and line, the claim,
the name, its line, the address) enters word by word at reading pace, 0.3 s a word, so the picture is not still while
it is read; it holds still only after the text has landed, and every still stretch after a landing is a declared
hold (≥ 0.2 s, ≤ 2 beats; the claim's hold is a pause). Notes and the carried reading's meta line are glance text
(≤ 6 words, still ≥ 1 s). Exits are placed from the scene's end, so a longer scene lands at the same moments and
holds a little longer before its exit.

### Length table

Beats from the scene's start at the tempo, unless marked s.

| Type | Motion | Primary text (enters from) | Glance | Need |
|---|---|---|---|---|
| `open` | the asset covers the frame at the zoom cap for 1 beat; the camera rises 2 beats (`bezel-pullback`), the mount lands on beat 3 | `caption` from 3.5 | — | read + 0.3 s |
| `read` | travel 2 beats when the exhibit changes (`camera-truck`); rings start every 0.5 beat and draw in 1.5; the lift-out (`lift-out`, 2 beats) starts on the first whole beat after the last ring; the cards are read one by one as their labels land (the card being read is lit, the others step back) | each card's value and label as it lands, then `caption` | each `note`, a beat into its card's reading | read + 0.3 s + 1.5 beats (the readings go back 1 beat, the rings come off 0.5) |
| `carry` | the ring draws round the value 1 beat; the value lifts and rides the pan to its twin, 2 beats (`value-carry`); the target steps back outside its ring from 3.5; the reading lifts from beat 4 over 0.75 | the reading's `value`, then `line`, from 4.75 | `meta` from 4.75 | read + 0.6 s |
| `measure` | the carry's ring comes off (0.5 beat, after a carry on the same exhibit); the dimension draws from 0.5 to 2; its chip, the computed difference, lands on beat 2 (accent, the reveal) | `caption` (the claim) from 2.5 | — | read + 0.75 s (a pause) |
| `lockup` | the camera rises over the whole desk, 2 beats; the name settles from 1.5 to 2; the address types at 40 characters a second; the rule draws 1 beat, the ring's route 1 beat; the last ring closes round the address on the last downbeat | `name` on 2, `line` from 3, `url` as it types | — | read + route + max(1 bar, 3 s); takes the phrase rounding |

At 120 bpm: an `open` with a four-word caption 1.75 bars; a `read` of three cells with notes and a caption on the
same exhibit 3.25 bars, on a new exhibit (with the travel) 4.25; a `carry` with its reading 2.25 bars; a `measure`
with a five-word claim 1.75 bars; the lock-up with a five-word line and a 36-character address 4.75 bars with the
rounding.

**Tiers** (`choreo.js`, principle 5): T0 — every word as it enters, every ring, each card's label, the reading
marker's steps, each note, the dimension's ticks, plus each landing; T1 — every landing composition; T2 — the travel,
the lift-out, the carry and the rise (the opening's pull-back is the first composition, not counted); T3 — the hook
(the opening caption), the measured gap (climax; without a `measure`, a `read` marked `claim: true`), the lock-up.
`npm run fit` refuses a film that breaks them: the measure belongs at 60–85 % of the length.

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
| `open` | First scene only (T3 hook): the first asset covers the frame at the zoom cap, content first; the camera rises and its mount grows round it | `exhibit` (asset id); `focus` `[x, y]` file px the cover centres on; `caption` ≤ 5 words |
| `read` | One to three regions of one asset are ringed, lift out and become readings; the camera travels first when the exhibit changes | `exhibit`; `cells` 1–3, each `{ box, glyph, value, label, note }`: `box` the region ringed and lifted, `glyph` the printed value inside it (file px), `value` ≤ 8 characters as printed, `label` ≤ 16 characters, value and label ≤ 3 words, `note` ≤ 6 words (glance); `caption` ≤ 5 words (`claim: true`: ≤ 8, a peak when the film has no `measure`) |
| `carry` | A value leaves the previous exhibit and lands on its twin in this one; the region round it is ringed and a code-drawn reading lifts over the exhibit | `exhibit` (another asset than the scene before); `from { box, glyph, value }` in the previous exhibit; `to { glyph, ring }` in this one (`ring` is the label round the twin); `card { meta ≤ 6 words, value, line }`, value and line ≤ 6 words; no caption |
| `measure` | The gap between two points on this exhibit's own axis, computed and labelled (T3 reveal, the climax) | the exhibit before it; `a`, `b` = `{ point: [x, y] file px, value: number as printed, printed? }`; `label` with `{diff}` or `{ratio}` (default `{diff}`); `digits` (default 1); `caption` ≤ 8 words with `claim: true` |
| `lockup` | Last scene (T3): the camera rises over the whole desk; the title block under the row | `name` ≤ 16 characters; `line` ≤ 6 words; `url` ≤ 40 characters; `mark` (optional asset id: a captured logo shown 100 px tall above the name); no caption |

The first scene is `open`, the last `lockup`; a `measure` stays on the exhibit before it; a `carry` goes to another
exhibit. Exhibits lie on the desk in the order they first appear. `npm run fit` (and the page, as a red banner)
reports every slot that breaks its limit, a box outside its asset's crop, and an asset without `people: 'none'`.
Rewrite shorter; never shrink type.

## Moves

Four roles, each filled by one transition from the shared library, through an adapter in `moves.js`:

| Role | Default | What it does here |
|---|---|---|
| `open` | `bezel-pullback` | the first asset at the cover zoom; the camera rises and the mount grows out of its edges |
| `lift` | `lift-out` | the ringed regions rise and become readings; the asset is drawn by the template (`backdrop: false`) |
| `travel` | `camera-truck` | the camera trucks along the row to the next exhibit |
| `carry` | `value-carry` | a value rides the pan from one exhibit to its twin in the next |

`content.moves = { lift: 'other-id' }` picks another adapter for a role. The choreography reads only an adapter's
`device` and `beats` (through `moveOf()`), so a swapped move keeps every timing check. **Swapping a transition:** add
the module to `lib/handoffs/` (or keep it in the film), then add an adapter to `ADAPTERS[role]` in `moves.js`:

```js
'my-move': {
  device: 'my-move', beats: 2,                        // T2 device name and length in beats
  async create(env, use) {                            // env: createHandoff, modules, zoomBetween, measure, PAL, FONT, MONO, assetOf, world …
    const h = await env.createHandoff('my-move', { /* params from use: the scene and its exhibits */ ground: false });
    return {
      draw: (ctx, p) => h.draw(ctx, p, { blur: false }),   // film.js blurs the whole frame
      camera: (p) => ({ x: worldCamX }),                  // open: ({ view }); travel and carry: ({ x }) on the desk
      track: (p) => [[x, y], …],                          // screen points, for the motion blur
      state: (p) => h.state(p),
      owns: [fromId, toId],                               // travel and carry: the exhibits the move draws itself
    };
  },
},
```

The adapter maps the desk to the module's own frame: at p = 0 and p = 1 it must draw exactly what the template draws
on either side (the exhibit in its mount at the same place), or the move pops.

**Local extension** (CONTRACT.md, Transitions): the lift adapter paints `lift-out` with its own preparation instead
of `h.draw`, because a reading's note sits under its label and the cards must widen to the longest note, which the
module's parameters cannot express; the module's `at`, `paint` and `track` are used unchanged.

## Variants

Colour: four presets in `palettes.js`; a light desk by default, because most captures are white pages and on a light
desk they sit one step above the ground instead of being the brightest thing in the frame. Pick the pencil by the
assets: red unless the ringed regions use red, pink or orange (then a blue pencil); `npm run palettes` decides.

Form: `desk`. The default `plain` renders exactly as before the field existed.

| `desk` | The desk | Reads as |
|---|---|---|
| `plain` (default) | the ground with a faint fixed fibre texture that moves with the camera | a clean light table; the assets are the only structure |
| `mat` | adds a cutting mat's grid, 1 px lines every 80 desk px at 22 % of the muted ink, moving and scaling with the camera | a workbench: measuring and cutting, near the `measure` scene's dimension |

Timing, layout and the moves are the same in both.

## Shortest cut

For a reel or a sting: `open` → `lockup` with the name and the address: 6 bars = 12.0 s at 120 bpm, 11.25 s at 128.
The first frame is already the mode's world (the asset at the cover zoom), and the lock-up's last bar holds after its
last ring, so the last half second is settled. With one `read` of one cell between them: 8 bars = 15.0 s at 128.

## Fixed parts

The desk row (exhibits at most 1500 × 740 px, 200 px apart, centred on y 540); the mount (a 54 px bar with the
source in IBM Plex Mono 25 px, 12 px corners); captions in Instrument Sans 59 px 76 px under the row; readings on
label stock (lift-out cards 140 px tall, values in Instrument Sans 700, labels 44 px, notes Plex Mono 25 px; the
carried reading 660 × 300 px with its value 105 px); the pencil (3 px rings with 6 px padding and 10 px corners; the
dimension 4 px with 14 px ticks; the rule 6 px); the veil of a stepped-back exhibit (ground at 55 %, 45 % round a
carried value); the light falling off toward the frame's edges; sub-frame motion blur on every frame whose fastest
point moves more than 1 px a frame.

## Example content (shipped)

Filmsmith measuring one of its own films. Every asset is the skill's own output, so the example ships with no
third-party material: the timing table `npm run fit` printed for the phosphor demo (captured as text at 2.6×), the
first 17 lines of the report `check-film` printed for the same render, and a chart of that render's short-term
loudness. The chart is a stand-in drawn in code from the measured series and says so on its face and on its mount; a
real film uses captured charts. It fits 18 bars = 36.0 s at 120 bpm, `npm run fit` with no errors:

open on the timing table, `Length follows the copy.` → read `124` bpm, `22` bars, `42.581` seconds, `Fitted, never
typed.` → truck to the report; read `-14.1` LUFS, `-2.7` dBTP peak, `18/18` beat-locked keys, `Every render is
measured.` → carry `-14.1` to the chart's own label for it; the reading `-12.1` LUFS at its loudest → measure the gap
on the chart's axis, `+2.0 LU`, `Two under a five-LU limit.` (climax, 67 %) → rise; `Filmsmith` / `Films drawn and
scored in code.` / the repository address.

Tiers: T0 median gap 0.6 beats (max 2.2), T1 12 compositions (median 2.4 s), T2 5 (the truck, two lift-outs, the
carry, the rise), T3 3 (hook 2.0 s, the gap 24 s = 67 %, climax; lock-up 27.5 s).
