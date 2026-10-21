# Exhibit (`exhibit`)

Real assets lie on one desk, each in a mount whose bar names its source; a camera looking straight down travels over them; one pencil ring finds the region a claim rests on, and the region lifts out of the asset and becomes a code-drawn reading; a value can ride from one asset to its twin in the next, and a gap can be measured on an asset's own axis. At the end the camera rises over the whole desk and the ring's route ends as the rule under the name. Aesthetic anchor: "like a curator's layout table under an overhead rostrum camera — every piece mounted with its provenance, one grease-pencil ring moving from piece to piece, and the wall label written from what the ring found".
Theme: tech-product-launch (launches with official tables, charts and product UI), technical reports · Template: `assets/templates/exhibit/` · tempo 112–128 BPM, default 120 (length follows the copy; the shipped example fits 18 bars = 36.0 s) · timing API 3 · Status: owner-accepted 2026-10-21 (sample film, its sound included); template 2026-10-21. Values are tagged `standard` / `borrowed` / `derived` / `owner` / `draft` as in [foundations](../foundations.md#where-values-come-from).

## Fits / does not fit

Fits: a launch, release or report whose key claims are already printed in **several** real artefacts — a benchmark table, a score-against-cost chart, a pricing page, the product's own UI, a docs page, a tool's report — so the film's argument is a walk from one piece of evidence to the next (two to five exhibits). The relation between exhibits is the content: the same number in two sources, a score here and its cost there. About 25 s (two exhibits, one reading each) to about 60 s (five).

Does not fit:
- a product with no real captures worth showing (a CLI: phosphor; a mechanism: trace; counts: tally);
- one asset carrying the whole story, or an app whose story is a sequence of its own screens;
- a claim argued from one document's words and quotes rather than its numbers;
- assets that would have to be zoomed past their resolution to be read and cannot be recaptured (the zoom cap decides; `npm run assets` checks it);
- a teaser under 20 s whose point is one line (ink): the desk needs time to be walked.

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **Model launch with an official table, a cost chart and a third source** (best fit) | `vela-2`, a model whose release page prints a benchmark table and a score-against-cost chart: three first places lift out of the table; its score is carried to its own point on the chart; the gap to the next model is measured on the chart's axis | `open` → `read` → `read` → `carry` → `measure` → `lockup` |
| **A tool measured by its own reports** (the shipped example) | Filmsmith measuring one of its own renders: the timing table it fitted, the report it measured, the loudness chart of the same render; the gap from the integrated level to the loudest moment, measured on the chart (36 s) | `open` → `read` → `read` → `carry` → `measure` → `lockup` |
| Price or plan change with before and after pages | a database's new tier: the old pricing page and the new one lie side by side; the changed line lifts out; the new price is carried to the calculator's own readout | `open` → `read` → `read` → `carry` → `lockup` |
| Technical report built on published figures | a service's quarterly reliability report: an incident chart, the status-page entry that explains its spike, the summary table | `open` → `read` → `carry` → `measure` → `lockup` |

## Mode principles

1. **One desk, one coordinate system; the camera goes to the evidence.** Every asset lies on the same desk in a row, at its own scale under the zoom cap, and never flies in, flips or tilts; a change of subject is a camera move over the desk (truck, rise), not a replacement of the frame. The desk persists from the first frame to the last, and the closing rise shows all of it. *(Narrows 4: the next state grows out of the current one, here by the camera keeping the world; and 7: a through-line keeps the viewer oriented.)*
2. **The camera looks straight down; depth is height.** Orthographic overhead view, no perspective tilt, no orbit. The only depth is height above the desk: a lifted reading grows by its height (scale 1 → 1.06 about the frame centre) and casts a shadow down-right; a piece lying on the desk has none. *(Narrows 6: shadows only on objects meant to have volume.)*
3. **Content first, then frame and source.** The first exhibit enters as its content at the zoom cap; as the camera rises, the mount grows out of its edges with the source on its bar (`bezel-pullback`). Every exhibit names where it came from. *(Narrows 2: precision — every asset says where it is from.)*
4. **Asset text is evidence; what is read is drawn.** Text inside an asset is never a scene's information text. Every number or claim the viewer reads is code-drawn (≥ 25 px, main ≥ 40 px), and `npm run assets` checks it against the asset: each redrawn value is printed where the film says. The asset is only cropped, scaled and veiled, never edited. *(Narrows 1 and 2.)*
5. **One ring, one meaning.** The accent marks one kind of thing: what the film is pointing at now — a ring round a region, the edge of a lifted reading, the edge of a carried value, the dimension, the route, the rule under the name. It strokes; it never fills or sets type. *(Narrows 7: one accent, one meaning.)*
6. **The reading comes out of the evidence.** A claim makes the trip ring → `lift-out` → reading; the swap from asset pixels to code-drawn type happens in one frame, registered on the asset's own glyph, before the zoom cap is reached; never a dissolve. The readings go back into their cells before the camera moves on, so the evidence is whole again when it is left. *(Narrows 4: the same object throughout, two contents never half-transparent over each other.)*
7. **Out of focus means stepped back.** Exhibits not in play are veiled toward the desk (55 %), never blurred; inside the exhibit in play, everything outside a carried value's ring steps back (45 %). *(Narrows 3: one protagonist per frame.)*

## Rules for real assets

| Rule | Value | Tag |
|---|---|---|
| Zoom cap | output px per source px ≤ 4/3 (an output pixel covers ≥ 0.75 source px): each exhibit on the desk, the opening's full-frame cover, a lock-up mark; the lift-out and the carry swap to code before it | `standard` (principle 2) / `derived` |
| Not changed | assets are only cropped, scaled and veiled; never recoloured, retouched, re-laid out or regenerated; a rebuilt UI never stands in for a capture; a chart drawn in code from measured data is labelled as a stand-in on its face and its mount | `standard` (principle 2) |
| Manifest | every asset in `content.assets`: file, crop, source, date, how, sha256, the claim it proves, `expect` / `forbid` strings | `derived` |
| Number consistency | `npm run assets`: hash unchanged; macOS Vision finds every `expect` and no `forbid` in the crop; each read cell's value inside its box; a carried value in its source box and inside the target's ring; a measure's values printed in the asset | `derived` |
| Colours | an asset's own colours are content, not palette; they do not count toward the accent's area | `derived` |
| Accent against the assets | the pencil differs from every chromatic colour inside each ringed region by **ΔE00 ≥ 20**; `npm run palettes` and `npm run assets` check it with ffmpeg on the content's regions | `owner` (2026-10-20) |
| People | no person in any crop; faces detected fail the check | `standard` |
| Re-fetch | re-capture a source before using a saved copy: published tables change | `derived` |

## Palette presets

The desk, mount, ink and label stock are the mode's; the accent is the only chromatic colour the film draws. Choose the preset by the accent rule.

| id | name | fits | ground (desk) | mat (mount) | ink · muted · dim | stock · sink · smuted | accent |
|---|---|---|---|---|---|---|---|
| `lightbox` | Light desk, red pencil (default) | white pages, product UIs, charts without red | `#ECEBE6` | `#DAD8D2` | `#17181B` · `#4C4E52` · `#5A5C60` | `#FBFAF7` · `#17181B` · `#55575C` | `#D0233D` |
| `lightbox-pencil` | Light desk, blue pencil | the light desk when the ringed regions use red, pink or orange | same | same | same | same | `#677BFE` |
| `grease` | Dark desk, grease-pencil red | dark captures: terminals, dark UIs, dark charts | `#141518` | `#26282C` | `#ECEBE6` · `#A9AAA6` · `#909290` | `#EEECE6` · `#17181B` · `#55575C` | `#E02944` |
| `pencil` | Dark desk, blue pencil | the dark desk with red assets | same as `grease` | same | same | same | `#677BFE` |

**Default: the light desk** (`owner`, 2026-10-20: white captures on a dark desk were the brightest thing in the frame). On the light desk a white page sits one step above the ground, and "out of focus" is a veil toward the desk. Contrast (`standard`, WCAG 2.2, `npm run palettes`): every text pair ≥ 4.5; the pencil ≥ 3 on the desk, on label stock, on a white and on a black capture in every preset (`lightbox-pencil` on stock 3.0: keep its strokes ≥ 3 px). Accents sit between relative luminance 0.12 and 0.30, so one ring clears 3:1 on the desk, on white and on dark captures without a halo (`derived`). Lineage (`derived`): the red china marker photo editors ring a frame with on a contact sheet; the blue editor's pencil for assets that are themselves red.

## Variants

**Colour**: the four presets above, picked by the accent rule.

**Form: `desk`** (content.js; the default renders exactly as before the field existed):

| `desk` | What changes | When | Source |
|---|---|---|---|
| `plain` (default) | the ground with a faint fixed fibre texture that moves with the camera | most films: the assets are the only structure | `derived` |
| `mat` | adds a cutting mat's grid, 1 px lines every 80 desk px at 22 % of the muted ink, moving and scaling with the camera | a film that measures (a `measure` scene): the desk reads as a workbench | `draft` (a self-healing cutting mat's printed grid) |

## Accent role

- **Accent**: what the film is pointing at now — the ring round a region (3 px), the edge of a lifted reading, the edge of a carried value while it travels, the dimension and its ticks, the route over the row, the rule under the name, the last ring round the address. A mark, never a ground; median well under 1 % of the frame.
- **Neutral**: all type, the mount, label stock, the shadow.
- **Status / category / effect**: none drawn by the mode. Colours inside assets are content.

## Type

| Role | Family | Licence | Sizes (px, output) |
|---|---|---|---|
| Captions, readings, the name | Instrument Sans (variable, wdth 75–100, wght 400–700): 700 values, 600 captions and the name, 500 labels and lines | OFL 1.1 (google/fonts `ofl/instrumentsans`) | 140 name · 105 carried value · 59 captions · 44 labels, lines, the chip; lift-out values at the card's scale (about 60–90) |
| Sources, notes, meta, address | IBM Plex Mono 500 | OFL 1.1 | 40 address · 25 source line, notes, meta |

Information text ≥ 25 px wherever it is read; main text ≥ 40 px (`standard`, principle 1). Text lies on the desk in world units, so its output size depends on the camera: each text is set for the zoom at which it is read and is **decoration** at any other. Decoration below 25 px (listed): the mount's source line and the captions in the closing overview (about 9–21 px), the set-down reading in the overview, asset text everywhere.

## Type scale

Ratio 4/3 from the 25 px floor: **25 · 33 · 44 · 59 · 79 · 105 · 140** (`derived`, a modular scale). The address at 40 sits in the 44 level (mono reads larger). Levels per frame: a reading 59 · 44 · 25 (plus the card value); the carry 105 · 44 · 25; the lock-up 140 · 44 · 40. Three at most outside asset text.

## Frame and grid

1920 × 1080; graphics-safe 96 / 54 px (`standard`). No screen-space frame: the desk is the through-line and nothing is pinned to the screen. Desk (world px at zoom 1): exhibits in a row, at most 1500 × 740 px each, 200 px apart, centred on y 540; the mount a 54 px bar with 12 px corners; captions 76 px under the row; the carried reading 660 × 300 px, lifted over the lower right of its exhibit, set down under it at the end. The overview fits the row and the title block (left-aligned under the first exhibit) at zoom ≤ 0.62. The light falls off toward the frame's edges (10 % at the corners on the light desk, 38 % on the dark; `draft`).

## Scenes

| Type | Purpose | Bars at 120 (example) |
|---|---|---|
| `open` | first scene: the first asset at the zoom cap, the camera rises, the mount grows; a caption | 1.75 |
| `read` | 1–3 regions ringed, lifted out and read; a caption; the camera travels first when the exhibit changes | 3.25 (same exhibit) · 4.25 (with the travel) |
| `carry` | a value rides from the previous exhibit to its twin in this one; a code-drawn reading lifts over the exhibit | 2.25 |
| `measure` | the gap between two points on the exhibit's own axis, computed and labelled; the claim (the climax) | 1.75 |
| `lockup` | the camera rises over the whole desk; the name, a line, the address; the route; the last ring | 4.75 (takes the phrase rounding) |

Slots and limits: `assets/templates/exhibit/TEMPLATE.md`.

## Signature transformations

The moves are pluggable (TEMPLATE.md, Moves): each role is an adapter over a shared hand-off module, so a new transition set can replace any of them without touching the choreography.

- **bezel-pullback** (the opening, first composition): the first asset covers the frame at the zoom cap for one beat; the camera rises on a log scale over 2 beats and the mount grows out of the asset's edges. `borrowed` (shared hand-off).
- **lift-out** (T2, the signature): the ringed regions rise with their own pixels, swap to code in one registered frame before the cap, and widen into readings; the asset steps back beneath. Played reversed (one beat) when the readings go back. `borrowed` (shared hand-off); the cards widen to the longest note (a local extension, TEMPLATE.md).
- **camera-truck** (T2): the camera trucks along the row to the next exhibit, cubic in-out, motion-blurred while fast. `borrowed`.
- **value-carry** (T2): a value lifts off one exhibit, waits at the top of the frame while the camera pans, and lands on the same value printed in the next; its ring opens to the label it lands in. `borrowed`.
- **measure** (T3 reveal): the carry's ring comes off; a dimension draws on the exhibit's own axis between two points it prints; a chip of label stock with the computed difference lands on the beat. `derived` (an engineering dimension).
- **rise** (T2, `exhibit-rise`, into the lock-up): the camera rises over the whole desk; the carried reading is set down under its exhibit; the ring's route draws over the row, dropping into each region it visited, and the rule under the name is its end. `derived`.

**Against the nearest references** (principle 10, the mode's fixed grammar, checked once here; 2026-10-20): gallery launch films that lay real assets on one plane or desktop and travel over it. Shared (3): one world the camera travels; content before its frame; motion blur on the travel. Not shared (6): perspective tilt and floating device frames (none here: a mount with the source), soft gradient grounds and glass cards (banned), a cursor clicking through the product, values that rise without registration (here a registered one-frame swap), several highlight colours (here one ring and its route), a logo end card (here the overview, the route ending as the rule). Under half.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Words | every read text enters word by word, 0.3 s a word; each word scales 1.04 → 1 and fades in over 0.15 s (cubic out) | `standard` (principle 1, reading pace) / `draft` |
| Opening | cover for 1 beat at the cap, rise 2 beats (cubic in-out, log zoom), the caption half a beat after the landing | `draft` |
| Rings | 3 px, 6 px padding, 10 px corners; drawn clockwise from the top left in 1.5 beats, half a beat apart (cubic in-out); off in 0.5 beat | `draft` |
| Lift-out | 2 beats from the first whole beat after the last ring; cards 140 px tall; the reading marker steps from card to card as each is read (the others veiled 50 %); notes a beat into their card's reading; back 1 beat from 1.5 beats before the scene's end | `borrowed` (module) / `draft` |
| Travel | 2 beats, cubic in-out | `borrowed` (camera-truck) |
| Carry | ring 1 beat; carry 2 beats; the target steps back from half a beat after the landing (0.5 beat); the reading lifts from beat 4 over 0.75 beat, scale 1 → 1.06, shadow offset (20, 28) px and blur 6 → 28 px at 30 % | `borrowed` (value-carry) / `draft` |
| Measure | dimension 4 px with 14 px ticks, drawn over 1.5 beats on its own axis, offset 44 px to the side, dashed drops to its two points; the chip settles in 0.2 beat onto beat 2 | `derived` / `draft` |
| Lock-up | rise 2 beats (cubic in-out, log zoom); the name settles 1.5 → 2 beats; the line from beat 3; the address types at 40 characters a second and holds ≥ 3 s; the rule 1 beat, the route 1 beat; the last ring in 0.75 beat on the last downbeat | `derived` / `draft` |
| Holds | after each landing the picture holds still only once its text has landed; every such stretch is a declared hold (≥ 0.2 s, ≤ 2 beats; the claim's hold a pause) | `standard` (principle 5) |
| Motion blur | `lib/canvas.js` `subframes` on every frame whose fastest tracked point (the camera, a card, a chip) moves over 1 px a frame; shutter half a frame, exact sum | `borrowed` (system) |
| Ambient | none: the desk holds still between moves | `derived` |
| Easing | no overshoot (paper lands) | `derived` |

## Sound

Bed: the kit's `swiss` preset at 120 BPM with `mix: 'v2'` — marimba, woodblock, shaker: a desk of paper and pencil (`owner`, 2026-10-21: approved on the sample film). The arrangement follows the scenes: the opening is the intro; the readings are the build with the reading drop (the marimba line rests while text is read); the drop starts at the carry (or the bar before the measure), so the measured gap lands inside it; the lock-up is the outro, its home chord ringing to the end. Effects on the same beats: a pencil tap (rim, 1.5–2 kHz, rising) on each ring, a paper lift (short up-whoosh) and a tick on each lift-out, a tick on each swap to code, a soft landing (thud and tick) on each landing, a down-whoosh as the readings go back, a long whoosh under the travel, the carry and the rise, a riser into the measured gap and an impact with a rolled chime on it, an impact and a chime on the name, keystrokes under the address, pencil taps on the rule, the route and the last ring. Every key gets a high onset; inside the drop the music takes a 70 ms −6 dB breath before it. Master −14 LUFS, true peak ≤ −1.5 dBTP after the renderer's AAC.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here: the `lightbox` desk with a red pencil; exhibits in a row with mounts and mono source lines; the opening pull-back on the first exhibit; three readings lifted out of a table; the truck to a second exhibit; a value carried to a chart and its reading lifted; a dimension on the chart; the overview with the route ending as the rule under the name; Instrument Sans with IBM Plex Mono; the `swiss` bed. The example copy: Filmsmith measuring its own render (`Length follows the copy.`, `124` bpm, `-14.1` LUFS, `+2.0 LU`, `Two under a five-LU limit.`).

Banned (the gallery's default look for real assets; a film showing any of these fails P1): pastel gradient blobs or a mesh behind the assets; frosted glass cards; a floating device or browser window tilted in 3D and bobbing; cards dealt in perspective, carousels, device flips; a headline with one word in italic, a second colour or a gradient; tracked uppercase eyebrows and 01 / 02 / 03 numerals that count nothing; crossfades between assets; flash frames; particles; an oversized cursor clicking through the product.

## Don'ts

- Do not cut between exhibits: the camera travels (mode principle 1).
- Do not tilt the camera or the assets; depth is lift height only (mode principle 2).
- Do not fade a reading in over the asset: it rises out of it and swaps in one frame (mode principle 6).
- Do not let the pencil set type or fill an area (Accent role); do not pick a preset that fails the accent rule.
- Do not edit, recolour or rebuild an asset, or show one without its mount; a chart drawn from data says it is a stand-in (Rules for real assets).
- Do not read a value off a chart's line: a `measure` point carries a value the asset prints, or says `printed: false` and comes from the axis (principle 2).
- Do not crop people in; do not zoom past the cap: capture larger instead.
- Do not put a claim in the asset's own text alone: what is read is drawn (mode principle 4).

## Checks

- **P0**: `npm run assets` 0 FAIL (hashes, `expect` / `forbid`, every redrawn number where the film says, the zoom cap, no face, the accent rule); `npm run fit` reports no errors (API 3 tiers: ≤ 5 words a state, the claim ≤ 8 in a pause, T0 gaps ≤ 4 beats, T2 count, 2–3 peaks with the climax at 60–85 %); `npm run palettes` passes; every read text ≥ 25 px at the zoom where it is read, main ≥ 40; no frame mixes asset pixels and code type of the same region; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL.
- **P1**: the banned look absent; one ring on screen except the route at the end; one camera move at a time; every word lands with the picture still moving until it is read; the overview shows every exhibit the film visited; type levels ≤ 3 outside asset text.
- **P2**: shadows only on the lifted reading; the fibre texture visible on the bare desk but not over text; motion blur ends on the landing frame; no move pops at either end (each adapter's rests coincide with the desk).

## Known issues

- **Transitions alike across modes** (`owner`, 2026-10-21: the three sample films' moves felt too similar, lift and flip): the four moves are pluggable (TEMPLATE.md, Moves) so a more varied set can replace them; none is swapped yet.
- **Registered swap**: the lift-out redraws a value in Instrument Sans over the asset's own face; positions and sizes match, letterforms do not, so the swap frame is visible as a change of letterform. Untested remedy: a closer face per film.
- **Blank card**: the carried reading lifts for 0.75 beat before its first words enter; it reads as paper arriving, not yet judged.
- **The overview's text** is decoration (captions about 21 px, the set-down reading smaller); if a film needs the overview read, it needs fewer exhibits.
- `lightbox-pencil`, `grease`, `pencil` and `desk: 'mat'` have been rendered as stills only, not judged; the shipped example has no `mark` asset (the lock-up's optional logo above the name).
- The sound was approved on the sample film; the template's arrangement (sections from the scenes) was verified by levels, onsets and loudness only.
