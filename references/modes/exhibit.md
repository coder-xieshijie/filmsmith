# Exhibit (`exhibit`)

Real assets lie on a desk under a camera looking straight down, as a multiplane: the desk and each print's index numeral at the back, the prints in their mounts (each bar names its source) on a glass in the middle, the claim each print carries on a chip on a glass in front. The camera slides along the row with the three planes at three rates, pulls back over the whole desk and hops, or cuts on one value two prints share; one pencil ring finds what a claim rests on, and at the claim the ringed regions lift out as code-drawn readings; a gap can be measured on a print's own axis. At the end the camera rises over the whole desk and the ring's route ends as the rule under the name. Aesthetic anchor: "like a curator's layout table under an overhead rostrum camera with glass planes — every piece mounted with its provenance, its label on the glass above it, one grease-pencil ring moving from piece to piece".
Theme: tech-product-launch (launches with official tables, charts and product UI), technical reports · Template: `assets/templates/exhibit/` · tempo 112–128 BPM, default 120 (length follows the copy; the shipped example fits 18 bars = 36.0 s) · timing API 3 · Status: owner-accepted 2026-10-21 (sample film, its sound included); template 2026-10-21; the same day, after the owner found the asset modes' moves cut from one mould (lift and flip), rebuilt on its own axis of motion — camera travel and depth on the desk — not yet seen by the owner. Values are tagged `standard` / `borrowed` / `derived` / `owner` / `draft` as in [foundations](../foundations.md#where-values-come-from).

## Fits / does not fit

Fits: a launch, release or report whose key claims are already printed in **several** real artefacts — a benchmark table, a score-against-cost chart, a pricing page, the product's own UI, a docs page, a tool's report — so the film's argument is a walk from one piece of evidence to the next (three to six prints). The relation between prints is the content: the same value in two sources, a score here and its cost there. About 25 s (three prints) to about 60 s (six).

Does not fit:
- a product with no real captures worth showing (a CLI: phosphor; a mechanism: trace; counts: tally);
- one asset carrying the whole story, or an app whose story is a sequence of its own screens;
- a claim argued from one document's words and quotes rather than its numbers;
- assets whose evidence cannot be framed 16:9 (a tall page read top to bottom), or that would have to be zoomed past their resolution and cannot be recaptured (`npm run assets` checks the cap);
- a teaser under 20 s whose point is one line (ink): the desk needs time to be walked.

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **Model launch with an official table, a cost chart and the product** (best fit) | `vela-2`, a model whose release page prints a benchmark table and a score-against-cost chart: three first places lift out of the table; the camera slides to the app, whose picker names the model; the name cuts to its own label on the chart; the gap to the next model is measured on the chart's axis | `open` → `read` → `travel` → `match` → `measure` → `lockup` |
| **A tool measured by its own reports** (the shipped example) | Filmsmith measuring one of its own renders: the film's frame; a pull back over the desk to the timing table it fitted (readings lift out); a slide to the report it measured; a cut on the integrated level to the loudness chart; the gap to the loudest moment measured on the chart (36 s) | `open` → `travel` (grid-hop) → `read` → `travel` → `match` → `measure` → `lockup` |
| Price or plan change with before and after pages | a database's new tier: the old pricing page and the new one side by side on the desk; the changed line lifts out; the new price cuts to the calculator's own readout | `open` → `read` → `travel` → `match` → `lockup` |
| Technical report built on published figures | a service's quarterly reliability report: the summary table; a pull back over every incident chart and a hop to the worst; the spike's time cuts to the status-page entry that explains it | `open` → `travel` (grid-hop) → `match` → `measure` → `lockup` |

## Mode principles

1. **One desk, one row; the camera goes to the evidence.** Every print lies on the same desk in a row, in the same mount, and never flies in, flips or tilts; a change of subject is a camera move over the desk — a slide along the row, a pull back over the whole desk and a hop, a rise — or a cut matched on a value both prints show. The desk persists from the first frame to the last, and the closing rise shows all of it. *(Narrows 4: the next state grows out of the current one, here by the camera keeping the world; and 7: a through-line keeps the viewer oriented.)*
2. **The camera looks straight down; depth is planes.** Orthographic overhead view, no tilt, no orbit. Depth is three planes at three heights: the desk and the index numerals at the back, the prints in the middle, the chips in front; a camera move slides them at three rates (0.3 · 1 · 1.65) and a rise shrinks the near plane fastest, so depth reads without colour or blur. Shadows only on what lies above the desk: the mounts, the chips, a lifted reading. *(Narrows 6: depth and shadow only where there is height; motion parallax, Gibson 1950.)*
3. **Content first, then frame and source.** The first print enters as its content at the zoom cap; as the camera rises, the mount grows out of its edges with the source on its bar (`bezel-pullback`). Every print names where it came from. *(Narrows 2: precision — every asset says where it is from.)*
4. **Asset text is evidence; what is read is drawn.** Text inside an asset is never a scene's information text. Every number or claim the viewer reads is code-drawn (≥ 25 px, main ≥ 40 px), and `npm run assets` checks it against the asset: each redrawn or matched value is printed where the film says. The asset is only cropped, scaled and veiled, never edited. *(Narrows 1 and 2.)*
5. **One ring, one meaning.** The accent marks one kind of thing: what the film is pointing at now — a ring round a region, the edge of a lifted reading, the ring that holds still across a match cut, the dimension, the route, the rule under the name, the tick on a chip. It strokes; it never fills or sets type. *(Narrows 7: one accent, one meaning.)*
6. **The axis changes; the claim lifts once.** Consecutive moves change the axis of motion (along the row, over the whole desk, a cut in place, out of the plane), and the lift-out — out of the plane — is kept for the claim of a print, at most twice a film; the swap from pixels to code happens in one registered frame, never a dissolve, and the readings go back before the camera moves on. *(Narrows 4 and 5: the expressive device stays rare and the change stays legible; owner 2026-10-21, the lift and flip of the three asset modes read as one mould.)*
7. **Out of focus means stepped back.** Prints not in play are veiled toward the desk (55 %), never blurred; at the measured gap, everything of the print outside the gap steps back (45 %). *(Narrows 3: one protagonist per frame.)*

## Rules for real assets

| Rule | Value | Tag |
|---|---|---|
| One mount | every print shows the 16:9 part of its crop round its `focus`, in a mount 1200 × 675 at rest; the library's moves rest on that frame unchanged | `derived` |
| Zoom cap | output px per source px ≤ 4/3 (an output pixel covers ≥ 0.75 source px): each mount, the opening's full frame, a lock-up mark; lift-out swaps to code before it, match-cut pushes in no further | `standard` (principle 2) / `derived` |
| Not changed | assets are only cropped, scaled and veiled; never recoloured, retouched, re-laid out or regenerated; a rebuilt UI never stands in for a capture; a chart drawn in code from measured data is labelled as a stand-in on its face and its mount | `standard` (principle 2) |
| Manifest | every asset in `content.assets`: file, crop, focus, source, date, how, sha256, the claim it proves, `expect` / `forbid` strings, an optional chip | `derived` |
| Number consistency | `npm run assets`: hash unchanged; macOS Vision finds every `expect` and no `forbid` in the crop; each read cell's value inside its box; a match's value inside its box in both prints; a measure's values printed in the asset unless read off the axis (`printed: false`); a chip's number in the shown part unless it starts with `~` | `derived` |
| Colours | an asset's own colours are content, not palette; they do not count toward the accent's area | `derived` |
| Accent against the assets | the pencil differs from every chromatic colour inside each ringed region by **ΔE00 ≥ 20**; `npm run palettes` and `npm run assets` check it with ffmpeg on the content's regions | `owner` (2026-10-20) |
| People | no person in any crop; faces detected fail the check | `standard` |
| Re-fetch | re-capture a source before using a saved copy: published tables change | `derived` |

## Palette presets

The desk, mount, ink and label stock are the mode's; the accent is the only chromatic colour the film draws. Choose the preset by the accent rule.

| id | name | fits | ground (desk) | mat (mount edge, numerals) | ink · muted · dim | stock (mounts, chips, readings) · sink · smuted | accent |
|---|---|---|---|---|---|---|---|
| `lightbox` | Light desk, red pencil (default) | white pages, product UIs, charts without red | `#ECEBE6` | `#DAD8D2` | `#17181B` · `#4C4E52` · `#5A5C60` | `#FBFAF7` · `#17181B` · `#55575C` | `#D0233D` |
| `lightbox-pencil` | Light desk, blue pencil | the light desk when the ringed regions use red, pink or orange | same | same | same | same | `#677BFE` |
| `grease` | Dark desk, grease-pencil red | dark captures: terminals, dark UIs, dark charts | `#141518` | `#26282C` | `#ECEBE6` · `#A9AAA6` · `#909290` | `#EEECE6` · `#17181B` · `#55575C` | `#E02944` |
| `pencil` | Dark desk, blue pencil | the dark desk with red assets | same as `grease` | same | same | same | `#677BFE` |

**Default: the light desk** (`owner`, 2026-10-20: white captures on a dark desk were the brightest thing in the frame). On the light desk a white page sits one step above the ground, and "out of focus" is a veil toward the desk. The mounts' bars and the chips are label stock with sink and smuted type, so they read the same on both desks. Contrast (`standard`, WCAG 2.2, `npm run palettes`): every text pair ≥ 4.5; the pencil ≥ 3 on the desk, on label stock, on a white and on a black capture in every preset (`lightbox-pencil` on stock 3.0: keep its strokes ≥ 3 px). Accents sit between relative luminance 0.12 and 0.30, so one ring clears 3:1 on the desk, on white and on dark captures without a halo (`derived`). Lineage (`derived`): the red china marker photo editors ring a frame with on a contact sheet; the blue editor's pencil for assets that are themselves red.

## Variants

**Colour**: the four presets above, picked by the accent rule.

**Form: `desk`** (content.js; the default renders exactly as before the field existed):

| `desk` | What changes | When | Source |
|---|---|---|---|
| `plain` (default) | the ground with a faint fixed fibre texture on the back plane | most films: the prints are the only structure | `derived` |
| `mat` | adds a cutting mat's grid, 1 px lines every 80 desk px at 22 % of the muted ink, on the back plane | a film that measures (a `measure` scene): the desk reads as a workbench | `draft` (a self-healing cutting mat's printed grid) |

## Accent role

- **Accent**: what the film is pointing at now — the ring round a region (3 px), the edge of a lifted reading, the ring that holds still across a match cut and stays on the value it landed on, the dimension and its ticks, the hop's ring over the whole desk, the route over the row, the rule under the name, the last ring round the address; the short tick on each chip marks it as the print's claim. A mark, never a ground; median well under 1 % of the frame.
- **Neutral**: all type, the mount, label stock, the numerals, the shadows.
- **Status / category / effect**: none drawn by the mode. Colours inside assets are content.

## Type

| Role | Family | Licence | Sizes (px, output) |
|---|---|---|---|
| Captions, readings, chips, the name | Instrument Sans (variable, wdth 75–100, wght 400–700): 700 values, 600 captions and the name, 500 labels and lines | OFL 1.1 (google/fonts `ofl/instrumentsans`) | 140 name · 76 chip value · 59 captions · 44 reading labels, lines, the measured gap · 32 chip label; lift-out values at the card's scale (about 60–90); index numerals 220 (decoration, in the mount's edge colour) |
| Sources, notes, address | IBM Plex Mono 500 | OFL 1.1 | 40 address · 25 source line, notes |

Information text ≥ 25 px wherever it is read; main text ≥ 40 px (`standard`, principle 1). Text lies on a plane, so its output size depends on the camera: each text is set for the rest at which it is read and is **decoration** at any other zoom. Decoration below 25 px (listed): the mounts' source lines, the captions and the chips in the overviews (the grid-hop's and the lock-up's, about 5–15 px), asset text everywhere.

## Type scale

Ratio 4/3 from the 25 px floor: **25 · 33 · 44 · 59 · 79 · 105 · 140** (`derived`, a modular scale). The chip's label at 32 sits in the 33 level and its value at 76 in the 79 level; the address at 40 in the 44 level (mono reads larger). Levels per frame: a print at rest 79 · 59 · 33 (plus the source line); a reading 59 · 44 · 25 (plus the card value); the lock-up 140 · 44 · 40. Three at most outside asset text and decoration.

## Frame and grid

1920 × 1080; graphics-safe 96 / 54 px (`standard`). No screen-space frame: the desk is the through-line and nothing is pinned to the screen. At rest: the mount's content 1200 × 675 at (360, 224) under a 54 px bar, 12 px corners; the index numeral at (48, 330) left of it; the chip 570 × 190 at (1290, 770) over the mount's lower right; the caption 76 px under the mount at x 360. Prints lie one screen (1920 px) apart, so neighbours rest off-frame. The overviews (grid-hop's and the lock-up's) fit the whole row at about 0.24; the lock-up's title block is left-aligned under the first print. The light falls off toward the frame's edges (10 % at the corners on the light desk, 38 % on the dark; `draft`).

## Scenes

| Type | Purpose | Bars at 120 (example) |
|---|---|---|
| `open` | first scene: the first print at the zoom cap, the camera rises, the mount grows; a caption | 2 |
| `travel` | to another print: slide with parallax, truck, or pull back over the whole desk and hop; its chip, a caption | 1.75 |
| `read` | the claim of a print: 1–3 regions ringed, lifted out and read; a caption (at most 2 a film) | 3.25 |
| `match` | one value in two prints: push in, cut, pull back; the next print's chip, a caption | 2 |
| `measure` | the gap between two points on the print's own axis, computed and labelled; the claim (the climax) | 1.75 |
| `lockup` | the camera rises over the whole desk; the name, a line, the address; the route; the last ring | 5.5 (takes the phrase rounding) |

Slots and limits: `assets/templates/exhibit/TEMPLATE.md`.

## Signature transformations

Exhibit's axis of motion is **camera travel and depth on the desk** (owner, 2026-10-21: the three asset modes' moves read as one mould of lift and flip; transitions.md, Families). Consecutive moves change the axis, every move is a library hand-off through an adapter (TEMPLATE.md, Moves), and every adapter rests on the template's own frame, so any of them can be swapped.

- **bezel-pullback** (the opening, first composition; zoom and depth): the first print covers the frame at the zoom cap for one beat; the camera rises on a log scale over 2 beats and the mount grows out of the print's edges. `borrowed` (shared hand-off).
- **parallax-slide** (T2, the default travel; horizontal advance with depth): the camera slides one screen to the neighbouring print; the numerals behind drift at 0.3, the mounts travel at 1, the chips in front race at 1.65, and all three land on the same frame, so the next print arrives with its claim already in front of it. `borrowed`.
- **grid-hop** (T1, the overview; zoom and depth): the camera pulls back until the whole desk is a contact grid of every print (the other prints step back), the ring hops to the next print wherever it lies, and the camera dives in. Drawn onto the mounts, so its grid is the desk itself. `borrowed`.
- **match-cut** (T2; edit cut): the ring draws round a value; the camera pushes in on it to the cap, and on one still frame the print cuts to the next print's own printing of the same value at the same place and size; the ring does not move across the cut; the camera pulls back. The cut is the proof that two sources print one value. `borrowed`.
- **camera-truck** (T2, an alternative travel; horizontal advance): the middle plane alone trucks to the neighbour, cubic in-out, motion-blurred while fast; for a film that wants no parallax. `borrowed`.
- **lift-out** (T2, at the claim only, at most twice; lift and flip): the ringed regions rise with their own pixels, swap to code in one registered frame before the cap, and widen into readings; the print steps back beneath; played reversed (one beat) when the readings go back. `borrowed`; the cards widen to the longest note (a local extension, TEMPLATE.md).
- **measure** (T3 reveal): the match's ring comes off and a chip in the way steps aside; a dimension draws on the print's own axis; a chip with the computed difference lands on the beat and the rest of the print steps back round the gap. `derived` (an engineering dimension).
- **rise** (T2, `exhibit-rise`, into the lock-up): the camera rises over the whole desk, the near plane shrinking fastest; the ring's route draws over the row, dropping into each region it visited, and the rule under the name is its end. `derived`.

Not used: `device-flip`, `value-carry`, `mark-to-chrome` (the lift-and-flip family beyond the claim's one lift-out); frame-level transitions (the film never leaves the desk).

**Against the nearest references** (principle 10, the mode's fixed grammar, checked once here; 2026-10-20, moves revised 2026-10-21): gallery launch films that lay real assets on one plane or desktop and travel over it. Shared (3): one world the camera travels; content before its frame; motion blur on the travel. Not shared (6): perspective tilt and floating device frames (none here: a mount with the source, depth only as flat planes), soft gradient grounds and glass cards (banned), a cursor clicking through the product, values that rise without registration (here a registered one-frame swap), several highlight colours (here one ring and its route), a logo end card (here the overview, the route ending as the rule). Under half.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Words | captions, the claim and the line enter word by word, 0.3 s a word; each word scales 1.04 → 1 and fades in over 0.15 s (cubic out) | `standard` (principle 1, reading pace) / `draft` |
| Planes | rates 0.3 · 1 · 1.65; a plane of rate r seen at zoom 1 / (1 + r (1/z − 1)) when the camera rises to z; numerals fade below z 1 and away from the print in view | `borrowed` (parallax-slide's depths) / `derived` |
| Opening | cover for 1 beat at the cap, rise 2 beats (cubic in-out, log zoom), the caption half a beat after the landing | `draft` |
| Travel | parallax-slide or truck 2 beats, cubic in-out; grid-hop 3 beats: out 0–36 %, hop 35–55 %, dive 55–97 % | `borrowed` |
| Match | ring 1 beat; push in 0–46 % to the cap (64 px tall), cut at 50 % on a still frame, pull back 54–100 %; no motion blur across the cut | `borrowed` (match-cut) / `draft` |
| Rings | 3 px, 6 px padding round a reading, 12 px round a matched value, 10 px corners; drawn clockwise from the top left in 1.5 beats, half a beat apart (cubic in-out); off in 0.5 beat | `draft` |
| Lift-out | 2 beats from the first whole beat after the last ring; cards 140 px tall; the reading marker steps from card to card as each is read (the others veiled 50 %); notes a beat into their card's reading; back 1 beat from 1.5 beats before the scene's end | `borrowed` (module) / `draft` |
| Measure | a chip in the way steps aside in 0.5 beat; dimension 4 px with 14 px ticks, drawn over 1.5 beats on its own axis, offset 44 px to the side that stays inside the print, dashed drops to its two points; the chip settles in 0.2 beat onto beat 2; the rest of the print steps back to 45 % over half a beat | `derived` / `draft` |
| Lock-up | rise 2 beats (cubic in-out, log zoom); the name settles 1.5 → 2 beats; the line from beat 3; the address types at 24 characters a second and holds ≥ 3 s; the rule 1 beat, the route 2 beats; the last ring in 0.75 beat on the last downbeat | `derived` / `draft` |
| Shadows | mounts: blur 30, offset 14, 40 %; chips: blur 36, offset 18, 50 % (both scale with their plane) | `borrowed` (parallax-slide) |
| Holds | after each landing the picture holds still only once its text has landed; every such stretch is a declared hold (≥ 0.2 s, ≤ 2 beats; the claim's hold a pause) | `standard` (principle 5) |
| Motion blur | `lib/canvas.js` `subframes` on every frame whose fastest tracked point (the camera, a card, a ring) moves over 1 px a frame; shutter half a frame, exact sum; never across the match cut | `borrowed` (system) |
| Ambient | none: the desk holds still between moves | `derived` |
| Easing | no overshoot (paper lands) | `derived` |

## Sound

Bed: the kit's `swiss` preset at 120 BPM with `mix: 'v2'` — marimba, woodblock, shaker: a desk of paper and pencil (`owner`, 2026-10-21: approved on the sample film). The arrangement follows the scenes: the opening is the intro; from the first travel the build with the reading drop (the marimba line rests while text is read); the drop starts at the match (or the bar before the measure), so the measured gap lands inside it; the lock-up is the outro, its home chord ringing to the end. Effects on the same beats: a long whoosh under a slide or truck; under grid-hop a whoosh out, a tick on the hop and a whoosh in; a pencil tap (rim, 1.5–2 kHz, rising) on each ring; a paper lift and a tick on each lift-out and a tick on its swap to code; a soft riser under the match's push in and a hard tick with a stamp on the cut; a soft landing (thud and tick) on each landing; a down-whoosh as the readings go back; a riser into the measured gap and an impact with a rolled chime on it; an impact and a chime on the name; keystrokes under the address; pencil taps on the rule, the route and the last ring. Every key gets a high onset; inside the drop the music takes a 70 ms −6 dB breath before it. Mastered to −14 LUFS and −2.0 dBTP, so the render's AAC stays ≤ −1.5.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here: the `lightbox` desk with a red pencil; prints in a row in label-stock mounts with mono source lines, index numerals behind them and chips in front; the opening pull-back on the first print; a grid-hop over the whole desk; three readings lifted out of a table; a parallax slide; a match cut on a value from a report to a chart; a dimension on the chart; the overview with the route ending as the rule under the name; Instrument Sans with IBM Plex Mono; the `swiss` bed. The example copy: Filmsmith measuring its own render (`A film drawn in code.`, `124` bpm, `-14.1 LUFS`, `+2.0 LU`, `Two under a five-LU limit.`).

Banned (the gallery's default look for real assets; a film showing any of these fails P1): pastel gradient blobs or a mesh behind the assets; frosted glass cards; a floating device or browser window tilted in 3D and bobbing; cards dealt in perspective, carousels, device flips; a headline with one word in italic, a second colour or a gradient; tracked uppercase eyebrows; crossfades between assets; flash frames; particles; an oversized cursor clicking through the product.

## Don'ts

- Do not cut between prints except on a value both print (`match`): otherwise the camera travels (mode principle 1).
- Do not tilt the camera or the prints; depth is the three flat planes (mode principle 2).
- Do not lift out on every print, or twice in a row: the lift is the claim's move (mode principle 6); use a chip, a match or a measure.
- Do not run the same move twice in a row: change the axis (slide, hop, cut, lift).
- Do not fade a reading in over the asset: it rises out of it and swaps in one frame.
- Do not let the pencil set type or fill an area (Accent role); do not pick a preset that fails the accent rule.
- Do not edit, recolour or rebuild an asset, or show one without its mount; a chart drawn from data says it is a stand-in (Rules for real assets).
- Do not read a value off a chart's line as if printed: a `measure` point carries a value the asset prints, or says `printed: false` and comes from the axis, and a chip read off a chart starts with `~` (principle 2).
- Do not crop people in; do not zoom past the cap: capture larger instead.

## Checks

- **P0**: `npm run assets` 0 FAIL (hashes, `expect` / `forbid`, every redrawn or matched number where the film says, chips, the zoom cap, no face, the accent rule); `npm run fit` reports no errors (at most two reads; slides and trucks to neighbours; API 3 tiers: ≤ 5 words a state, the claim ≤ 8 in a pause, T0 gaps ≤ 4 beats, T2 count, 2–3 peaks with the climax at 60–85 %); `npm run palettes` passes; every read text ≥ 25 px at the rest where it is read, main ≥ 40; no frame mixes asset pixels and code type of the same region, and no frame mixes two sources across the match cut; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL.
- **P1**: the banned look absent; consecutive moves on different axes; one ring on screen except the route at the end; one camera move at a time; every caption lands with the picture still moving until it is read; the overview shows every print the film visited; type levels ≤ 3 outside asset text and decoration.
- **P2**: the three planes land on the same frame; the fibre texture visible on the bare desk but not over text; motion blur ends on the landing frame; no move pops at either end (each adapter's rests coincide with the desk).

## Known issues

- **The new axis is unseen** (2026-10-21): parallax-slide, grid-hop and match-cut replace the truck and value-carry as the defaults, and the lift-out is limited to the claim; the shipped example and the workshop's second sample film show them; the owner has not judged them.
- **Pace**: check-film warns that slow beats are 57 % of the example (limit 50 %), most of them in the 11 s lock-up that takes the phrase rounding; its moving parts (the address typing, the route, the last ring) are thin lines under the motion threshold.
- **One mount**: every print is framed 16:9; a print whose evidence lies far apart (a readout at the top of an app and its picker at the bottom) shows only one part, so the film reads the other elsewhere or not at all.
- **Registered swap**: the lift-out redraws a value in Instrument Sans over the asset's own face; positions and sizes match, letterforms do not, so the swap frame is visible as a change of letterform. Untested remedy: a closer face per film.
- **The overviews' text** is decoration (captions and chips about 5–15 px); a film that needs the whole desk read needs fewer prints.
- `lightbox-pencil`, `grease`, `pencil` and `desk: 'mat'` were rendered as stills on the first version of the template only.
- The sound was approved on the sample film; the template's arrangement (sections from the scenes) was verified by levels, onsets and loudness only.
