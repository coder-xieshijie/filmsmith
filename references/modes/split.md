# Split (`split`)

One movable seam carries the whole film: on one side of it what someone writes (a request, a list, real lines of a real file, a command, a one-line diff, the install line), on the other what that makes (real frames of the rendered output, a real report, a real page). The seam is born from the caret of the first typed line, and every change in the film is a move of the seam — it slides a result out like a drawer, louvres the result into slats, wipes across the frame, branches into three panes, slides across a before/after — until it closes and leaves the caret waiting. Aesthetic anchor: "like a code review where the diff is on the left and the running result on the right, and the reviewer drags the divider — except the divider is the film's only actor".
Theme: tech-product-launch (developer tools whose input maps line by line to an output) · Template: `assets/templates/split/` · tempo 112–128 BPM, default 120 (length follows the copy; the shipped example fits 16 bars = 32.0 s) · timing API 3 · Status: owner-accepted 2026-10-21 (sample film; the mode and its five transitions go into the skill); template 2026-10-21. Values are tagged `standard` / `borrowed` / `derived` / `owner` / `draft` as in [foundations](../foundations.md#where-values-come-from).

## Fits / does not fit

Fits: a product whose story is **input → output** and both halves are real and showable: a generator or compiler (one file in; a site, an SDK, a film out), a config or flag whose change shows in a render, a CLI whose command and printed report are the proof, a template system, a diff tool, a linter with before and after. Real outputs must exist as captures or renders (frames, pages, reports), and the inputs as text the product really reads. 25–35 s; a 15–17 s cut-down is `file` → `render` → `diff` (`edges: 'cut'`).

Does not fit:
- a product with no visible output (an API with only JSON: phosphor or trace draw it);
- a model launch argued from benchmark tables (exhibit, dossier);
- a product whose surface is one app screen (handset);
- a mechanism to explain step by step (trace); a data story (tally);
- outputs that exist only as marketing composites, or an input that is a vague prompt not mapping line by line to the output (the registration is the point).

## Use cases

| Use | Example (made-up product unless named) | Chain |
|---|---|---|
| **A code-to-media or code-to-docs tool** (best fit; the shipped example) | Filmsmith from its own files: `Use filmsmith.` → a demo frame slides out of the seam; the style list beside three demos; the pulse template's `content.js` lines registered with the words they put on screen; `npm run film` beside four frames and the measured report; one palette line changed, the same frame in both palettes either side of the seam; the install line beside the README (32 s) | `request` → `pick` → `file` → `render` → `diff` → `lockup` |
| A config change with a visible result | `fernwave`, a theme engine: the config file, one token, the render before; the `+` line types; the seam slides across before and after | `request` → `file` → `render` → `diff` → `lockup` |
| A CLI and its report | `loudgate`, a loudness gate: the command types in the band; the result pane branches into the output and its report; each report line lands on a beat beside the output it describes | `request` → `pick` → `file` → `render` → `lockup` |
| A reel sting | any of the above, cut down: code over its result, the command and its report, the one-line diff (16 s) | `file` → `render` → `diff` (`edges: 'cut'`) |

## How it differs

| | Through-line | Camera | What turns an asset into a reading |
|---|---|---|---|
| **split** | one seam between input (paper) and result (real frames) | fixed; panes change, the seam moves | the input beside it: code-drawn lines registered with the result; a one-line diff over two registered renders |
| exhibit | one desk holding every asset | travels between assets | a region lifts out and becomes a code-drawn reading |
| handset | one device, locked off | fixed; only the screen's viewport moves | the margin's copy, level with the region |
| dossier | a stack of documents | over the file | highlighter, leaders, stickers |
| thread | one line that becomes every object | fixed | the line becomes the content (all drawn) |

Split's seam is not thread's line: thread's line turns into the content and never separates two things; Split's seam never becomes content — it only divides input from result, and the content on each side is real text or a real capture. Split never draws an output: an output that was not rendered or captured is not shown.

## Mode principles

1. **One seam, two sides, one meaning.** The frame is always divided by a seam into an input side (paper, code-drawn text) and a result side (real frames, captures, reports); input on the left or above, result on the right or below. The seam is on screen from its birth (the caret, in the first two beats) to its close in the last bar. Every transition is a move of the seam or of a copy of it; nothing else moves a whole pane. *(Narrows 7, one through-line, and 4, keep the followed object on screen; object constancy, Heer & Robertson 2007. The reading order input → result follows the left-to-right, top-to-bottom scan of Latin script.)*
2. **The result side shows only real output.** Frames are decoded from the rendered film at a named time, captures are taken unedited, renders are made by the product itself; each is shown 1:1 or scaled under the zoom cap, cropped only by its pane, never recoloured, retouched, veiled or redrawn. A result that was not rendered or captured is not drawn, however simple. *(Narrows 2 and 9; the real-asset rules of [transitions.md](../transitions.md).)*
3. **Register input and result.** What is written and what it makes sit across the seam from each other and are paired by one mark at a time (the pick's tick, the token underline, the diff's `+` bar): the line `{ text: 'build', … }` above, the frame that says *build* below. A pairing changes on a beat, with the result cut or slid on that same beat. *(Narrows 3, one protagonist and signalling; spatial and temporal contiguity, Mayer 2017.)*
4. **Change one thing, show it twice.** The climax is a diff: one changed input line above, two registered real renders of the same instant either side of the seam, the seam sliding so the edit takes the frame over. The two renders differ only by that line (same renderer, same time). *(Narrows 2, precision, and 10, the rival test: only a product with a file that maps to its output can do this.)*
5. **No blend, ever.** Every pixel shows one content: the drawer, the louvre, the push, the wipe line and the slider move hard edges; there is no crossfade, dissolve, flash or half-transparent overlap; motion blur is the only averaging and it lives under the moving seam. *(Narrows 4's clean-transition criteria; owner 2026-10-21: transitions must not all be flips, so the louvre slides content out of the seam instead of turning slats.)*
6. **The paper side writes; text is set, never pasted.** Everything the viewer reads is drawn in code on the paper side or on a bench tab: claims, code, commands, report lines, labels. Lines quoted from real files keep their text and line numbers exactly; text inside a result is evidence. Code is set in one mono, one colour, no syntax colours. *(Narrows 1 and 7: one accent; syntax colours would be a second.)*
7. **Every result names its source.** A bench chip beside the seam's grip says where the result side comes from and when (`filmsmith-pulse.mp4 · 0:01.5`, `before · palette: 'cyan'`, a repository address and date); it swaps on the beat the result changes and rides with the seam. It is the persistent frame and carries nothing else. *(Narrows 2, a quoted thing keeps its source, and 7, a persistent frame carries real information only.)*

## Rules for real assets

| Rule | Value | Tag |
|---|---|---|
| Frames | decoded from the rendered MP4 at a named time (and crop), encoded once; `npm run assets` decodes the frame again and compares, PSNR ≥ 30 dB (a different frame scores far lower) | `derived` |
| Renders | made by the product itself (the shipped example: `npm run snapshot` of the halftone template), the command and the one changed line recorded; before and after from the same renderer at the same instant and the same size | `derived` (mode principle 4) |
| Captures | web pages at 2× device pixels, headless, logged out, en-US, the article or region only (no avatar, account row or commit author) | `derived` (as exhibit, handset) |
| Not changed | crop by the pane, scale ≤ the cap, place; no veil, no grain, no tint over a result | `derived` (stricter than transitions.md: Split never dims, because the seam already says which side is in play) |
| Zoom cap | output px per source px ≤ 4/3 (an output pixel covers ≥ 0.75 source px), at every place an asset is shown | `standard` (principle 2) / `derived` |
| Quoted input | every line a `file` scene quotes equals that line of its file; a `diff`'s `-` line equals line `n`; the report's lines equal what the measuring tool prints for the report's film | `derived` (principle 2) |
| Manifest | every asset in `content.assets`: file, size, kind, source (`from` or `source`), chip, date, how, sha256, the claim it supports, `people` | `derived` |
| Accent against results | ΔE00 ≥ 20 between the accent and every colour filling ≥ 2 % of each result region the seam or its copies cross (the shipped example: smallest 30.3); `npm run palettes` and `npm run assets` check it with ffmpeg on the content's regions | `owner` rule (2026-10-20) applied to the seam |
| Size | each file ≤ 200 KB in a template's shipped example; a film's own assets have no limit | `derived` (CONTRACT.md) |
| People | none in any crop; `people` says what was checked | `standard` |

## Palette presets

Results are content colour and are not counted. The neutrals are paper (input), bench (behind a result that does not fill its pane, and the report pane), and the text tones; the accent is the seam.

| id | name | fits | paper (input) | ink · muted · dim | bench | onBench · mutedOnBench | accent | key |
|---|---|---|---|---|---|---|---|---|
| `diff` | Paper and diff teal (default) | most products; results in blue, indigo, violet, amber, cyan, black or paper | `#F3F2EE` | `#16171A` · `#4A4F57` · `#5C626B` | `#15171A` | `#E8E9EB` · `#A7ADB5` | `#007C72` | `#F3F2EE` |
| `night` | Graphite and light teal (the input side dark) | products used in a dark editor; light results | `#121417` | `#E8E9EB` · `#A7ADB5` · `#8C929B` | `#0B0C0E` | `#E8E9EB` · `#A7ADB5` | `#36B5B0` | `#121417` |
| `plum` | Paper and plum | results that are green or teal (where the teal seam would sit inside them) | `#F3F2EE` | as `diff` | `#15171A` | as `diff` | `#A23B92` | `#F3F2EE` |

Contrast (`standard`, WCAG 2.2, `npm run palettes`): `diff` ink 16.0, muted 7.36, dim 5.49 on paper; on bench 14.78 / 7.94; the accent 4.54 on paper, 3.53 on bench (graphics ≥ 3:1; it never sets text). `night` ink 15.19, muted 8.16, dim 5.89; on bench 16.11 / 8.65; the accent 7.37 on graphite, 7.82 on bench. `plum` the accent 5.24 on paper, 3.06 on bench (keep its marks ≥ 4 px).

Collisions (ΔE00, `derived`, system step 3): the `diff` teal sits 17.8 from the success green of a widely used code host's interface (a deliberate move away from the "added line" green, which sat 5.4 from it), 11.5 from ink's `forest`, 25.6 from halftone's cyan; `night`'s light teal 22.3 from phosphor's `phosphor` green, 10.5 from its `cyan` preset, 12.5 from tally's `night-teal`; `plum` 12.7 from dossier's magenta, 14.5 from halftone's. Neutrals `borrowed` (system rules: paper L* ≈ 95, cool graphite); accents `derived` (the teal from the review tool's "added" colour turned toward blue, darkened to pass 3:1 on paper; `plum` the farthest hue from green that keeps 3:1 on both sides). `night` and `plum` rendered as stills only, `draft`.

## Variants

**Colour**: the three presets above, picked by the accent rule; paper input by default.

**Form: `seam`** (content.js; the default renders exactly as before the field existed):

| `seam` | What changes | When | Source |
|---|---|---|---|
| `straight` (default) | a solid 6 px seam with a 2 px key on each side; the grip a 24 × 64 px tab at its end; every copy (louvre slats, wipe lines, the branch, the slider) the same | most films: the seam reads as an editor's split view, a boundary you can drag | `derived` (the sample film) |
| `stitched` | the seam drawn as 14 px dashes 6 px apart on a fixed grid (a moving seam's dashes do not crawl), every copy too; still never blends | a calmer, print-like film; products about patches and edits: the frame reads as assembled from pieces | `draft` (a cut line on a pattern sheet) |

Why the seam and not another axis: the seam is the protagonist; its drawing is the only thing a film can vary without changing what the mode claims.

## Accent role

- **Accent** marks one kind of thing: *the edit point between what is written and what it makes*. It is the seam (6 px), its copies while they move (louvre slat edges, wipe lines, the branch), the grip, the caret, and the one mark on the input side that pairs with the result now (the pick's tick, the token underline 4 px, the diff's `+` bar 6 × 40 px). At most one pairing mark at a time. The shipped example: median 0.6 % of the frame, at most 1.4 %.
- **Key**: the seam's 2 px edges in the input side's ground, so it reads on any result; not a colour role.
- **Status, category, effect**: none of the mode's own. The diff's removed line is muted, not red; colours inside results are content.
- **Change of ground**: none: the paper and the results take turns as the seam moves; the frame never floods with the accent.

## Type

| Role | Family | Licence | Sizes (px, output) |
|---|---|---|---|
| Claims (main text) and the name at the lock-up | Archivo 700, width axis semi-expanded, −0.6 / −2 px tracking | OFL 1.1 (google/fonts `ofl/archivo`) | 59; the name 105 |
| The request and the command; code, the pick's list, the install line, the address | JetBrains Mono 500 (700 for the picked item) | OFL 1.1 (google/fonts `ofl/jetbrainsmono`) | 44 typed request and command; 33 code, list, install line, address |
| Labels (the input's file path), chips, report lines | JetBrains Mono 500 | OFL 1.1 | 25 |

Information text ≥ 25 px; main text 59 px (`standard`, principle 1). Text inside results is evidence and is decoration as type (a demo's HUD at about 18 px; the README at 7–14 px). One sans plus one mono: the mono is for what really is code, a command, a path or a report (system pairing rule). Archivo on its width axis is ink's family, but ink sets it extra-condensed for slams and Split semi-expanded for claims: a different face in use. `derived`; families `borrowed` (system).

## Type scale

25 × (4/3)ⁿ: **25 · 33 · 44 · 59 · 79 · 105** (`derived`; the 25 px floor and a perfect fourth). In use 25 / 33 / 44 / 59 / 105, at most three in any frame outside results: request 59 · 44 · 25; pick, file, diff 59 · 33 · 25; render 59 · 44 · 25; lock-up 105 · 33 · 25.

## Frame and grid

1920 × 1080; margins 96 px (graphics-safe area, `standard`). Seam positions are content-led (`derived`, `choreo.js` `L`): vertical at x 900 for request and pick (input 804 px wide); horizontal under the quoted code for a file (y 236 + 46 per line: 420 for four lines); y 260 for the command band and the diff's two lines; the branch at x 1320; the slider from x 1320 to 620; the lock-up's seam at x 1000. Input text hangs from the label (baseline 84) on a 46–52 px line grid; code lines carry their real line numbers in a gutter at x 96 (code from x 176). Frames and renders cover their pane at 1:1 with their `focus` nearest the pane's centre; pages are contained, 60 px clear of the seam. Persistent elements: the seam, its grip, the input label (the file path), the result chip. No grain, no shadows, no window chrome. Deliberate overlap: the chip sits on the result next to the grip.

## Scenes

| Type | Purpose | Bars at 120 (example) |
|---|---|---|
| `request` | opens (T3 hook): a request types; its caret runs to the seam's place and stands up; the first result slides out of the seam; the claim | 2 |
| `pick` | a list on the input side (modes, presets, targets), a tick on one; the result changes as the tick moves (a louvre for the first change, a push after) | 1.75 |
| `file` | real input lines over the result; the underline pairs a token with the frame it produced, one a beat | 1.5 |
| `render` | the seam branches: the command above, the output and its report below; cuts and report lines land on the beat | 2 |
| `diff` | climax (T3): the changed line, two registered renders, the seam slides and lands on a bar line; the claim is read in a pause | 3.75 |
| `lockup` | a wipe line brings the name, the install line and the published page; the address ≥ 3 s; second move: the seam closes, the caret waits | 5 (takes the phrase rounding) |

Slots and limits: `assets/templates/split/TEMPLATE.md`.

## Signature transformations

Five hand-offs of the runtime (`assets/runtime/handoffs/`; catalogue in [transitions.md](../transitions.md)), each behind a role in the template's `moves.js` so a film can swap one without touching the choreography. Fast frames get sub-frame motion blur (`lib/canvas.js` `subframes`, speed-gated).

- **split-open** (the opening, T3 hook; T1 elsewhere): the caret runs (0.75 beat, cubic in-out) to the seam's place while growing to full height and stands up into it; the result slides out from behind the seam like a drawer, only the part already out shown, the rest of the pane still paper (1 beat). The edit point becomes the boundary (object constancy). `borrowed` (shared hand-off, pane mode: `pane`, `caret`, `seam`).
- **louvre** (T2): the result pane is cut into 9 horizontal slats; in each the next result slides out of the seam behind a copy of the seam, pushing the old one out of the far edge; slats start 0.07 apart from the grip down; 2 beats. No slat turns: it slides (owner 2026-10-21, "not all flips"). With `n = 1` it is the plain push used as T1 (0.75 beat). `borrowed` (shared hand-off; venetian-blind and comb wipes of broadcast switchers, public grammar).
- **wipe-line** (T2): a copy of the seam crosses the whole frame (down into a file, left into the lock-up); behind it the next state, ahead the current one; 2 beats, cubic in-out. Changes input and result in one stroke. `borrowed` (shared hand-off; the hard-edged line wipe).
- **split-branch** (T2): the seam rises to the command band (1 beat), then a branch runs from it to the frame's edge and the report pane opens behind its tip (1 beat): two panes become three, the film's frame riding up with the seam. `borrowed` (shared hand-off; the split-screen build of multi-camera broadcasts).
- **diff-slider** (T3 climax): two registered renders of one instant either side of the seam; the seam slides 2 beats (cubic in-out) so the edited render takes the frame over and lands on the bar line; before and after named on chips that ride the seam. `borrowed` (shared hand-off; the before/after comparison slider).
- **pairing hop** (T0): the input mark (tick, underline) slides 0.2–0.25 s to the next token while the result cuts on the same beat. `derived`.
- **rail** (T0): text rises 0.36 s expo out through its own rail and leaves upward in 0.2 s. `borrowed` (system).
- **seam close** (the lock-up's second move): the seam slides off the frame's edge over the page in one beat, landing on the last bar line; the caret blinks after the install line on the last four beats. `derived`.

**Against the nearest references** (principle 10, the mode's fixed grammar, checked once here; 2026-10-21): the gallery's code-and-result split-screen product films (an editor on the left, the running app on the right, a divider) and broadcast before/after sliders. Shared (3 of 10): code left and result right; a divider between them; a before/after slider (the climax only). Not shared: editor chrome and syntax colours, a live screen recording (here stills of real renders, cut on the beat), a round handle with arrows, crossfades between results, a device mockup or tilted screen, cursor clicks on every action, a final logo on a gradient. Under half. Not in the references: the seam as the film's only actor (born from the caret, closed at the end), the louvre and wipe lines as copies of it, the branch into three panes, line-by-line registration of real input with the result it made, two real renders differing by one line, the provenance chip, the no-dim rule.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Seam moves | cubic in-out, 0.75–2 beats; no overshoot, no spring on the seam | `draft` |
| Louvre | 9 slats, starts 0.07 of the move apart, 2 beats; the push one slat, 0.75 beat | `draft` |
| Typing | constant rate (a process): the request and command at 28 characters a second, the diff's `+` line 12–42 a second to fill the time before the first phrase; one onset a beat while it runs | `borrowed` (principle 5) / `draft` |
| Text | rail: enter 0.36 s expo out, leave 0.2 s ease in; primary text at 0.3 s a word | `borrowed` (system) / `standard` |
| Pairings | the tick hops at 1, 2, then every 2 beats; underlines at 2, 3, 4 … beats; render cuts at 2, 3, 4 … beats, report lines every half beat from 3 | `draft` |
| Chips | swap inside their tab in 0.24 s (expo out) when the result changes; before and after named 4 beats before the slider lands | `draft` |
| Climax | the slider lands on the first bar line at least 7.5 beats into the diff; the second phrase with it; a pause of 2 beats after the claim is read | `derived` (principle 5) |
| Lock-up | the wipe 2 beats; the name 1.5 beats after; the install line types; the address on the next beat and ≥ 3 s on screen; the close 1 beat onto the last bar line; 4 caret blinks | `derived` |
| Holds | every still stretch after a landing is a declared hold (≥ 0.2 s, ≤ 2 beats; the diff's last a pause) | `standard` (principle 5) |
| Motion blur | sub-frame, only when the fastest seam point moves over 1 px a frame | `borrowed` (system) |
| Ambient | none: a still seam between still panes is the resting state | `derived` |

## Sound

Bed: the kit's `terminal` preset (a pulsing saw figure over an 8-bar A-minor progression) at 120 BPM with `mix: 'v2'`: the input side is a shell (`owner`, 2026-10-21: accepted with the sample film). The arrangement follows the scenes: the intro under the request, the build through pick, file and render, the drop from the diff into its climax with the melody out while the claim is read, the outro under the lock-up. The sounds belong to the keyboard and the seam: a key click per typed character (with a light duck of the pulse), a rim on each tick of a pick, a tick per louvre slat, an air sweep under each wipe line, the branch and the slider, a dry tick and a soft low body on each landing, an impact and a rolled chime with a duck on the climax, a bell and a thud on the lock-up's name. Master −14 LUFS, true peak ≤ −1.5 dBTP after the renderer's AAC (`standard`).

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here: the `diff` preset; paper left, results right, the seam at x 900; code over its frame with the seam at y 420; the command band at y 260; the chain request → pick → file → render → diff → lockup; the README sentence split across three claims (`Ten ways / to film your code.`, `Pick a style,`, `fill one file,`, `render, / measured.`, `One line, / a new palette.`); a palette change on a halftone frame as the climax; the README capture at the lock-up; Archivo with JetBrains Mono; the `terminal` bed.

Banned (the gallery's default look for this pairing and its neighbours; a film showing any of these fails P1): a round before/after handle with two arrows in the middle of the frame; a divider that springs, wobbles or glows; crossfades, dissolves, flashes or glitches between contents; editor chrome (window frame, tabs, traffic lights, minimap), syntax highlighting in several colours, a fake terminal window; device mockups, tilted screens, drop shadows, glass, gradient blobs behind panes; a wall or grid of outputs flying past; a result that was not rendered or captured, or one retouched, tinted, grained or veiled; tiny uppercase eyebrows, decorative timecodes, a chip that says anything but the result's source.

## Don'ts

- Do not draw an output you did not render or capture (mode principle 2).
- Do not change two input lines for one diff: the climax proves one line (mode principle 4).
- Do not let the seam become content (a letter, an arrow, a chart line): that is thread's grammar (mode principle 1).
- Do not dim a result to point at it; move the seam or the pairing mark instead (Rules for real assets).
- Do not use the louvre twice in a row unchanged, or one device more than three times; the push is its T1 form (principle 4).
- Do not quote a line without its file on the input label and its number in the gutter (mode principle 6).
- Do not pick a preset that fails the accent rule against the results.

## Checks

- **P0**: `npm run assets` 0 FAIL (hashes, sizes, every frame equal to a fresh decode of its film, every place under the cap, every quoted line verbatim, the report equal to the tool's output, the accent rule); `npm run fit` reports no errors (API 3 tiers: ≤ 5 words a state, the claim's two phrases, T0 gaps ≤ 4 beats, T2 2–4, 2–3 peaks with the climax at 60–85 %); `npm run palettes` passes; paper text ≥ 25 px and ≥ 4.5:1; no frame where two contents blend outside a motion-blur streak; no person, avatar or account row in any crop; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL.
- **P1**: the banned look absent; something changes about every beat; one pairing mark at a time; the climax's two renders differ only by the shown line; ≤ 3 uses of one seam device, never twice in a row unchanged.
- **P2**: the seam lands exactly (no drift); chips swap on the beat the result changes; no word on the paper side cut by a moving seam while it is read; the caret returns at the end.

## Known issues

- **Short compositions**: the example's median composition is 1.75 s (a `fit` and `check-film` WARN, under 2 s); every state reads, but a film with more copy per scene should check its stills.
- **A slow passage** from the end of the render's report into the diff's typing (3 s under 20 % visible motion from 14.0 s, a `check-film` WARN): the + line types slowly into the time before its first phrase.
- Motion blur doubles the grip and the chips for 1–3 frames on the fastest seam moves (they ride the seam); the wipe lines' blur streak (about 60 px) is the one place two states share pixels.
- Pages shown small (the README at the lock-up, about 0.48×) are evidence only; a film that needs a page read should capture the region it reads.
- `night`, `plum` and `seam: 'stitched'` have been rendered as stills only, not judged; the cut-down (`edges: 'cut'`) passes check-film but has not been seen in a reel.
- The mode depends on a product whose input really maps to its output; a launch without such a file falls back to exhibit or handset.
