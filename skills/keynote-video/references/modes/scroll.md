# Scroll (`scroll`)

One long vertical sheet, from the first frame to the last: the product's own long page — a repository page and its README, a docs page, a changelog — captured at one scale and joined top to bottom, with code-set quote bands pasted in between; a fixed viewport looks at it, and everything that changes is the sheet's offset. The sheet is flicked and travels up with momentum, brakes and locks on the next section; the page's own headings pin at the top as the chapters; the accent underlines the line being read and a band beside it repeats it in large type; one passage unfolds in place on what it describes; at the end the sheet flies back to its top and its paper roll winds it up under the name. Aesthetic anchor: "like a long-form web story read on a phone — flicked, caught, sticky section headers, pull quotes — except the page is the product's own README, captured, and it hangs as one paper scroll".
Theme: tech-product-launch (products whose own pages carry the story: open-source tools, developer products with a README, docs or a changelog) · Template: `assets/templates/scroll/` · tempo 112–128 BPM, default 120 (length follows the copy; the shipped example fits 18 bars = 33.75 s at 128) · timing API 3 · Status: owner-accepted 2026-10-21 (sample film); template 2026-10-21. Values are tagged `standard` / `borrowed` / `derived` / `owner` / `draft` as in [foundations](../foundations.md#where-values-come-from).

## Fits / does not fit

Fits: a product whose argument is already written, in order, on its own long page — a README, a docs page, a changelog, a release note, a long product page — so that reading it top to bottom is the story: open-source tools and skills, CLIs and libraries with a good README, developer products with a docs site, a version release told by its changelog. The page should hold three to six claims a viewer can underline, its headings should be the chapters, and at least one passage should *carry* something that can open in place (a table row with a demo, a code block with its output, a changelog line with its screen). About 20 s to 60 s.

Does not fit:
- evidence spread over several unrelated artefacts (a benchmark table, a cost chart and an app): exhibit, which walks a desk of them;
- an app whose story is its own screens changing: handset (one device, the screen changes); scroll draws no device;
- a claim argued from published numbers, with arithmetic and provenance on each: dossier (one page at a time, a worksheet);
- a product with no long page worth reading, or a page that is mostly images (a landing page of hero shots): the underline has nothing to find;
- a page that names people, private data or third-party products in the regions the film must show, when they cannot be cropped out;
- a teaser under 15 s whose point is one line: ink.

## Use cases

| Use | Example (made-up product unless stated) | Chain |
|---|---|---|
| **An open-source tool or skill launched from its README** (best fit; the shipped example) | Filmsmith filming its own README: the tagline, the intro, the table of styles docking row by row, the Ink row unfolding on the Ink demo, "Measured", the name (33.75 s) | `open` → `quote` → `quote` → `ratchet` → `unfold` → `quote` → `lockup` |
| A version release from its changelog | `tern 2.0`, a CLI: the changelog's 2.0 heading pins; three lines underlined in turn; one line unfolds on the command and its output (frames of a captured terminal) | `open` → `quote` → `ratchet` → `unfold` → `lockup` |
| A docs page for one feature | a database's new index type: the docs heading pins; the definition underlined and quoted; the code sample's row unfolds on the query plan it produces; the limits section | `open` → `quote` → `unfold` → `quote` → `lockup` |
| A product page read as a story | a design tool's new panel: the page's sections pin one by one; each claim underlined and quoted; the screenshot row unfolds on a short screen recording | `open` → `quote` → `quote` → `unfold` → `lockup` |

The first is the best fit because the README is the product's own argument in order, and its table of styles is a list of films the skill made, so the unfold shows the thing the row describes, not an illustration of it.

## Mode principles

1. **One sheet, one direction of travel, never a cut.** The sheet is on screen from the first frame (the roll unrolling it from its top edge) to the last (the roll winding it up); every change of subject is the sheet's offset changing — a detent, a reel, a fling — inside one fixed viewport. Nothing flips, tilts, zooms or crossfades; nothing moves sideways. *(Narrows 4: the next state is the same page further on, the relation the content really has; and 7: the sheet is the through-line. The vertical travel, a long scroll moving up: `owner`, 2026-10-21.)*
2. **Scrolls move like a flicked page.** Every scroll is a flick: full speed within a frame or two, then an exponential brake onto the next section (`momentum`, k 5.5–6.5), the last frame ≤ 2 px; a return to the top accelerates, then brakes (`fling`). A short move is a detent; a run of detents one a beat is the ratchet. Never a linear pan, never an overshoot. *(Narrows 5: motion as a function of time with a defined landing; momentum scrolling is the domain's own physics.)*
3. **The page's headings are the chapters.** A heading that reaches the top stays pinned, as its own pixels, while its section scrolls under it; the next pushes it out; on the way back they unpin in reverse. This is the mode's persistent frame and it carries only the page's real structure. A slot on the pinned tab names the item docked under it (one word, 49 px). *(Narrows 7: the persistent frame carries real information; `section-lock` is a pure function of the offset.)*
4. **Underline in the capture, quote in a band.** The accent marks the one line being read now — an underline drawn under it in the capture — and the nearest quote band repeats its words in code, phrase by phrase (≤ 3 words entering at once), at 69–134 px. The copy is the page's own wording, condensed only by cutting words, never by adding a claim; `npm run assets` reads every quoted word back from the underlined lines. Capture text is evidence even when it is legible. *(Narrows 1 and 2: what is read is drawn ≥ 25 px and agrees with its source; 3: one protagonist, the quote.)*
5. **One passage opens in place.** At the climax a row of the page unfolds: the page below slides down, and what the row carries is revealed from the fold line (a real demo, an output, a screen); the page stays longer afterwards (the minimap grows). One unfold per film by default, two at most, never two in a row. *(Narrows 4: a transformation along a relation the content has — the row and what it describes — and 5: the climax at 60–85 %.)*
6. **Real pages, only cropped, scaled and veiled.** The sheet is real captures at one scale, under the zoom cap; crops are horizontal strips at one x range so the page's edges run continuous; a cut is shown as a gap of the ground (a splice), never hidden; dimming is a uniform ground veil (rows not yet docked, a page flying past); nothing is recoloured, retouched or redrawn. *(Narrows 2; the rules for real assets below.)*
7. **The roll is the only volume.** The sheet is flat paper with no shadow; the paper roll at the two ends is the one lit object (highlight, core shadow, a contact shadow on the sheet, spiral end caps). *(Narrows 6: shadows only where something has volume.)*

## Rules for real assets

| Rule | Value | Tag |
|---|---|---|
| Capture | full-page capture of each source at device pixel ratio 2, logged out, in English (`tools/capture.mjs`); line boxes measured in the same browser session (`--phrases`); re-capture rather than reuse an old copy: published pages change | `derived` |
| One scale | every strip shares one width and is drawn at one scale (the example: 1870 px of capture → 1496 film px, 0.8); body text renders at about 21–26 px: evidence, not information | `derived` |
| Zoom cap | output px per source px ≤ 4/3 (an output pixel covers ≥ 0.75 source px), for the sheet and the unfold's frames; `npm run assets` checks both | `standard` (principle 2) / `derived` |
| Crops | horizontal strips sharing one x range, in source order; a cut is shown as a 32 px gap of the ground | `derived` |
| Asset text | evidence; every line the film says is repeated in code ≥ 49 px (main ≥ 69 px) and is the page's own wording | `standard` (principle 1) |
| Not changed | crop, scale, a uniform ground veil only; no recolour, retouch, re-layout or rebuilt page | `standard` (principle 2) |
| Accent against the assets | the accent differs by **ΔE00 ≥ 20** from every chromatic colour inside each region it marks (each underlined line box, each docked row, the unfolding row); `npm run palettes` and `npm run assets` check it with ffmpeg on the content's regions | `owner` (2026-10-20) |
| People, names | no person in any strip or frame (faces fail the check; a misread frame is listed as `reviewed` with what a person saw and reported as a WARN); `forbid` strings for names the film must not carry | `standard` |
| Manifest | every asset in `content.assets`: file or frames, size, source, date, how, sha256, the claim it proves, `expect` / `forbid` | `derived` |
| Frames of a film | extracted with ffmpeg from the source film at a stated time range and fps, scaled only, played 1:1; when they run out the last frame stays | `derived` |

## Palette presets

The captures bring their own colours (content, not palette); the mode draws the ground, the quote stock, the panel, the roll and one accent. Choose the preset by the accent rule.

| id | name | fits | ground | stock (bands) · ink · muted | panel · onPanel · panelMuted | hair (under a tab) | accent |
|---|---|---|---|---|---|---|---|
| `slate` | Slate, ochre mark (default) | light pages (READMEs, docs, changelogs) on a near-black ground | `#0E0F11` | `#F3F0E8` · `#17181B` · `#55575C` | `#141518` · `#F1EFEA` · `#A9ABB0` | `#C9CDD3` | `#8F7719` |
| `slate-violet` | Slate, violet mark | light pages whose marked lines hold yellow, ochre or green and no strong blue | same | same | same | same | `#9B4DCA` |
| `linen` | Linen, ochre mark | dark-mode pages: a dark sheet on a light ground; the bands become dark stock | `#ECEAE4` | `#17181B` · `#F1EFEA` · `#A9ABB0` | same as `slate` | `#3A3D44` | `#8F7719` |

The paper roll is the same in all three: highlight `#F6F3EC`, body `#E4E0D7`, shade `#B5B0A6`, edge `#7E7A72`.

Contrast (`standard`, WCAG 2.2, `npm run palettes`, 2026-10-21):

| preset | ink / stock | muted / stock | onPanel · panelMuted / panel | accent / ground | accent / white page | accent / black page | accent / stock |
|---|---|---|---|---|---|---|---|
| `slate` | 15.6 | 6.3 | 15.9 · 7.9 | 4.4 | 4.4 | 4.8 | 3.8 |
| `slate-violet` | 15.6 | 6.3 | 15.9 · 7.9 | 3.9 | 4.9 | 4.3 | 4.3 |
| `linen` | 15.4 (light on dark stock) | 7.7 | 15.9 · 7.9 | 3.6 | 4.4 | 4.8 | 4.1 |

Grounds (`derived`): `slate` L* 4.3, `linen` L* 92.7; the stock is a warm paper (L* 94.8), a separate material from the cool white captures, so a band reads as pasted in. The accent never sets text; it is a stroke (a 4 px underline, a 6 px margin mark, a 3 px bracket), between relative luminance 0.10 and 0.26 so it clears 3:1 on a white page, a black page, the ground and the stock.

**Lineage and collisions** (`derived`, 2026-10-21): the default accent is a pencil ochre, the colour of a reader's graphite-and-ochre marginal mark; it was chosen against the marked regions a README holds (blue links, blue, red and green thumbnails: ΔE00 50.5 from the nearest in the example) and against every other mode's accent (nearest: the dark-amber pencils of blueprint `#A85200` and plakat `#D36F01`, ΔE00 21.0, and handset's green `#3D7A0A`, 21.8). The violet option is 10.8 from morph's `#6A3DF0` and fails the example's Thread row (a saturated blue thumbnail, ΔE00 17.2): it is for other pages.

## Variants

**Colour**: the three presets above, picked by the accent rule.

**Form: `minimap`** (content.js; the default renders exactly as the template did when the field was added):

| `minimap` | What changes | When | Source |
|---|---|---|---|
| `'on'` (default) | the whole sheet in miniature in the right gutter (x 1664–1824, the sheet at 0.107, from y 120), the frame's place on it bracketed in the accent, the rest veiled 50 %; the sheet column at x 120–1616 | most pages: the viewer sees where the film is in the page and the page grow when a row unfolds | `draft` (a document map: the overview scrollbar of code editors and long readers) |
| `'off'` | no minimap; the sheet column centres (x 212–1708); the pinned tab is the only persistent frame | a page whose miniature is a uniform grey (all text), or a cut-down that does not need the overview | `derived` |

## Accent role

- **Accent**: the line being read now — the underline in the capture under the line a band quotes, the docked row's mark in the margin during the ratchet, the minimap's bracket (where the frame is on the sheet). One underline at a time: the old one retracts, or is carried off by the scroll, before the next draws. A mark, never a ground or a fill.
- **Neutral**: all type (bands in ink on stock, the tab's slot in ink, the panel's claim on the panel), the veils (the ground colour), the roll.
- **Status / category / effect**: none drawn by the mode; colours inside captures and frames are content.

## Type

| Role | Family | Licence | Sizes (px, output) |
|---|---|---|---|
| Quotes, the hook, the name, the tab slot, the panel's claim | Schibsted Grotesk (variable, wght 400–900): 700 for the hook and the name, 600 for quotes, the slot and the claim | OFL 1.1 (google/fonts `ofl/schibstedgrotesk`) | 134 name · 96 hook · 69 quotes · 49 slot and claim |
| The address, the panel's source label | DM Mono 500 | OFL 1.1 (google/fonts `ofl/dmmono`) | 35 address · 25 label |

Schibsted Grotesk is a news grotesk drawn for a newspaper group's long-form pages: the reading voice of a long page, and used by no other mode (`derived`). Information text ≥ 25 px, main text ≥ 49 px (`standard`, principle 1). Below 25 px, decoration only: the captures' own text everywhere (about 21–26 px at the sheet's scale; evidence), the minimap. The pinned tabs are captures (a README's headings at about 38–51 px): real headings, legible, counted as the persistent frame.

## Type scale

25 × 1.4ⁿ: **25 · 35 · 49 · 69 · 96 · 134** (`derived`, a modular scale from the 25 px floor). Levels per frame (content area, the persistent frame excluded): the opening 96 (hook) and the capture; quotes 69 and the capture; the ratchet 49 (slot) and the capture; the climax 49 (claim) · 25 (label); the lock-up 134 · 35. Three at most.

## Frame and grid

1920 × 1080; graphics-safe 96 / 54 px (`standard`). The viewport: the sheet column 1496 px wide (x 120 with the minimap, centred without it), from y 54 down to the frame's foot (the sheet bleeds off the bottom: it continues); above y 54 the ground; the sheet's top edge hangs at y 70. Quote bands span the sheet's width (they cross the captured page's edges: pasted in), text inset 96 px; the hook band 320 px tall, quote bands 250. The unfold panel spans the sheet's width: an 88 px caption strip, the frames 1216 px wide centred, 20 px under them. Persistent elements: the pinned chapter tab (the page's headings, a 2 px hairline under it) and the minimap. Deliberate overlaps: tabs pass over the sheet; the underline sits 5 px under its line box, over the page's own white.

## Scenes

| Type | Purpose | Bars at 128 (example) |
|---|---|---|
| `open` | first scene (T3 hook): the roll drops; the underline finds a line; the hook band repeats it; the minimap prints | 2 |
| `quote` | a detent, a reel or no move; the underline moves to the next line; the band's lines roll out and the next roll in, phrase by phrase | 1.75 (no move) · 2.25 (a reel) · 2.5 (a detent) |
| `ratchet` | a reel onto a heading, which locks as the chapter; its rows dock one a beat; the tab's slot names each | 3.5 (ten rows) |
| `unfold` | a detent to a row; the row opens in place on what it describes; the claim (the climax) | 2.75 |
| `lockup` | a fling to the top; the hook band takes the name and the address; the roll winds the sheet up under it | 3.25 (takes the phrase rounding) |

Slots and limits: `assets/templates/scroll/TEMPLATE.md`.

## Signature transformations

The moves are pluggable (TEMPLATE.md, Moves): each role is an adapter over a shared hand-off module, so a new transition set can replace any of them without touching the choreography.

- **scroll-reel** (T1 as a detent, T2 as a long reel): the offset is the integral of a flick, v ∝ e^(−kp) − e^(−(k+r)p), normalised to land exactly; 95 % of the travel is done by half the move, the rest a slow brake. `borrowed` (shared hand-off, its `momentum` curve).
- **scroll-fling** (T2, into the lock-up): back to the top, v ∝ p² e^(−kp): it peaks a sixth in and brakes softly; the tabs unpin in reverse by themselves. `borrowed` (shared hand-off, its `fling` curve).
- **section-lock** (T1, continuous): sticky headings as a pure function of the offset — pinned at the top, pushed out by the next — drawn as the heading's own pixels. `borrowed` (shared hand-off, `tabsAt`).
- **unfold** (T2, the climax): a row opens in place; the page below slides down (cubic in-out) and the frames are revealed from the fold line, anchored to it. `borrowed` (shared hand-off).
- **roll** (T2 unroll at the opening; the closing's second move): the paper roll drops off the frame with momentum, and comes back to wind the sheet up under the name on the last downbeat. `borrowed` (shared hand-off, `drawRoll`).
- **ratchet** (T0 × n): detents one a beat (expo-out half-beat steps), the rows to come veiled, the slot's names rolling vertically with each step. `derived`.
- **underline** and **band lines** (T0): the underline draws left to right in half a beat and retracts in a quarter; each phrase rises into its line's clip box (expo out, half a beat) and the lines rise out (ease in) — vertical, like the scroll. `derived`.

Banned in this mode: flips, `device-flip`, `lift-out`, `camera-truck` and frame-level transitions: they belong to the sibling modes, or cut away from the sheet.

**Against the nearest references** (principle 10, the mode's fixed grammar, checked once here; 2026-10-21): long-form web stories (sticky section headers, pull quotes, inline figures that open) are the grammar scroll borrows. Shared (4 of 9): the long page, sticky headers, pull quotes, the inline opening. Not shared: the page is a real capture of the product's own page; it is filmed, not scrolled by a reader (flicks, detents, a ratchet, a fling, on the beat); it hangs as a paper roll at both ends; the minimap; the inline opening shows the thing the row describes. Under half. Against the sibling modes: exhibit walks many artefacts on a desk with a ring and readings lifted out; handset draws a device; dossier deals one page at a time with a highlighter; strip moves sideways through frames; split divides the frame with a line. Scroll is the only one with one artefact, no camera move and vertical travel.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Unroll | 2 beats, the roll from the sheet's top edge to below the frame, `momentum` k 4.2; the sheet visible only above the roll | `draft` |
| Detent | 1 beat, `momentum` k 5.5 | `draft` |
| Reel | 2 beats, `momentum` k 6.5 (last frame ≤ 2 px) | `draft` |
| Ratchet | a step a beat, each an expo-out half beat; the slot's names roll with the step | `draft` |
| Unfold | 2 beats, cubic in-out; the frames from half a beat in, 1:1 | `borrowed` (unfold) / `draft` |
| Fling | 2 beats, `fling` k 12 (last frame about 1.4 px) | `draft` |
| Roll-up | 1.5 beats, `momentum` k 5, landing 4 beats before the end, on a downbeat | `draft` |
| Phrases | ≤ 3 words enter at once, each phrase once the one before is read (0.3 s a word, at least a beat), rising into its line over half a beat | `standard` (principle 1) / `derived` |
| Creep | while a quote or the hook is read, and in an unfold once its frames have run out, the page creeps up 10 px a second until the scene ends: the reading time is never a still frame | `derived` (2026-10-21: a still page under a quote read as a stall) |
| Motion blur | `lib/canvas.js` `subframes` on the offset's speed: half a frame's shutter below 60 px a frame, one frame up to 200, 2.5 above | `borrowed` (system) / `derived` |
| Speed veil | a uniform ground veil, 0.55 × clamp((v − 40) / 220)^1.5, over the sheet: a page flying past steps back; it keeps a fast fling under the flash gate | `derived` (2026-10-21: light pages and the dark panel streaking past strobed, 4 flashes in 1 s) |
| Easing | no overshoot anywhere (paper lands) | `derived` |

## Sound

Bed: the kit's `thread` preset with `mix: 'v2'` — plucks, a pad, a soft four-on-the-floor: one long line that keeps moving, like the sheet (`draft`). The arrangement follows the scenes: the opening is the intro; the quotes before the climax are the build with the reading drop (the melody rests while text is read); a ratchet raises the energy; the unfold is the drop, so the claim lands inside it; the quotes after it dip for reading; the lock-up is the outro. Effects on the same beats: a dry whoosh under each scroll whose sweep follows its direction, a soft click (rim and thud) on each landing, one wheel-detent tick per ratchet step (rising), a pencil tick on each underline, a soft pop per entering phrase (rising through the film), a paper slide and a swell under the unfold, an impact and a rolled chime on the claim and on the lock-up, a riser into the fling, keystrokes under the address, a click as the roll lands. A 70 ms −6 dB breath in the bed before the keys inside the drop and the roll-up. Master −14 LUFS, true peak ≤ −1.5 dBTP after the renderer's AAC.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here: `slate` with the ochre mark; the roll dropping at the top; a repository page and its README in source order with the file list cut; a hook band quoting the tagline; the title pinning on the first detent; two quote bands on the intro; a reel to the table of styles and ten rows docking; one row unfolding on its demo; a long reel to the last claim; a fling to the top; the name and the address in the hook band; the roll winding up under it; the minimap on; Schibsted Grotesk with DM Mono; the `thread` bed. The example copy: Filmsmith filming its own README (`Ten ways to film your code.`, `Every frame, drawn in code.`, `Any coding agent that can use a shell.`, `Made with the skill itself.`, `Measured: loudness, flashes, beat sync.`).

Banned (the gallery's default look for real assets; a film showing any of these fails P1): floating browser windows with stock drop shadows, tilted or bobbing; tilted cards, carousels, device flips; mesh gradients, glass cards; a headline with one word in a second colour; tracked uppercase eyebrows; crossfades between captures; flash frames; particles; an oversized clicking cursor.

Banned in this mode: any horizontal move or zoom; any flip, fold-over or 3D turn of the sheet (only the roll is round); cutting away from the sheet; a quote that adds a claim the page does not make; a capture at another scale than the sheet's; a ring or a highlighter band (the sibling modes' marks); more than one underline at a time; a decorative counter or running timecode (the panel's label is the clip's fixed range).

## Don'ts

- Do not pan sideways or zoom: the viewport is fixed; only the offset moves (mode principle 1).
- Do not scroll linearly or overshoot a lock (mode principle 2).
- Do not redraw a heading as the chapter tab: pin its pixels (mode principle 3).
- Do not enter more than three words of a band at once, or quote words the underlined line does not print (mode principle 4).
- Do not unfold more than twice, or twice in a row (mode principle 5).
- Do not hide a cut: leave the gap (mode principle 6).
- Do not drop the speed veil and the long shutter on a long reel or fling: light pages and a dark panel streaking past strobe.
- Do not pick a preset that fails the accent rule; do not let the accent set type or fill an area.

## Checks

- **P0**: `npm run assets` 0 FAIL (hashes, `expect` / `forbid`, no face, one scale under the cap, every quoted word in its underlined lines, the accent rule); `npm run fit` reports no errors (API 3 tiers: ≤ 3 words entering at once, T0 gaps ≤ 4 beats, T2 count, 2–3 peaks with the climax at 60–85 %); `npm run palettes` passes; read text ≥ 25 px, main ≥ 49; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL (no still over 2 beats outside the lock-up; flashes ≤ 3 in any second).
- **P1**: the banned look absent; no cut, no horizontal move, no zoom; every scroll lands with momentum (last frame ≤ 2 px); one underline at a time; the chapter tab is the page's own heading; T2 every 8–12 s; ≤ 2 unfolds; type levels ≤ 3.
- **P2**: the roll's shading and contact shadow; the splice gap visible; the minimap's bracket matches the viewport; the frames play 1:1; motion blur ends on the landing frame.

## Known issues

- **A fast reel reads as a cut** to `check-film`'s cut detector (one WARN in the example, off the beat): at its fastest frame most of the frame changes; it is a move, not a cut.
- **The creep** is a constant 10 px a second: on a very long reading it carries the underlined line up toward the tab (about 20 px in the example's longest quote); a quote longer than four phrases should be split.
- **Frames run out**: a folder of frames shorter than the unfold scene holds its last frame while the page creeps; extract a longer span when the scene is long.
- The demo frames are 12 fps against 30 fps scrolling (stepped, as the source plays them at that rate in the panel); a film with room for larger assets can extract 24 or 30.
- `slate-violet`, `linen` and `minimap: 'off'` have been rendered as stills only, not judged.
- The shipped captures show the README as it stood on 2026-10-21 (the stars badge reads 0); a re-capture shows the page as it is now.
- The sound has been checked by levels, onsets and loudness only.
