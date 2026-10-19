# Thread · 一线 (`thread`)

One vermilion line that becomes everything in turn: caret, the loop that carries the brief round, word, swatches, storyboard, glossy spheres, the ruler that presses the stage name into itself, easing curves, edit tracks and playhead, marbled ink, a colour flood, the film's own contact sheet, a file card, and the bar a blade cuts into the name. Aesthetic anchor: "like a motion designer's reel cut as one unbroken transformation, where every link is a step of the tool being shown".
Theme: tech-product-launch / reel · Template: `assets/templates/thread/` · length fitted to the copy at 112–128 bpm (default 120), timing API 3 (2026-10-19); the example fits to 40 s (20 bars at 120), the short chain to 6 bars (12 s at 120) · Accepted 2026-10-17 (genre demo 05: "the best overall texture of all; many transitions and they are very smooth. I don't know what it is trying to say, but I like this motion and form")

## Fits / does not fit

Fits: only the showreel of a video, motion or rendering toolchain itself (a renderer, an animation library, an editor, a video skill such as this one), where every link of the chain is a step the subject really performs: brief, palette, storyboard, shading, timing, edit, render. About six named steps, short words, texture and flow carrying the film; also the opening or closing reel of such a launch.
Does not fit: any other subject, even as a "how it's made" reel. The chain itself (storyboard, glossy spheres, edit tracks, the film's own contact sheet) says "making a video", so a print shop, a database or a CLI told through it still reads as a video tool once the words are hidden (check 2026-10-18, alt content). Also not: a claim that needs reading (plakat, ink); a system with parts and flows (blueprint); a terminal tool whose look is its UI (phosphor); numbers about many items (tally); a mechanism to understand (trace); more than six steps, or steps that cannot each be *shown* by one link of the chain. Supporting other subjects would mean replacing links with the subject's own objects; that is not built.

## Use cases

Every use is a reel of a video, motion or rendering tool (Fits); only the copy and which links are kept change. ★ is the best fit. Examples are fictional (2026-10-19).

| Use | Example | Links that carry it |
|---|---|---|
| ★ Pipeline reel of a code- or prompt-to-video tool: each link is a stage the tool really runs | `tweenery`, a prompt-to-video renderer: the request goes round the loop and comes back revised, six stages, the name cut out of the line (40 s demo at timing API 3, workshop `works/skill-showcase/demos-v2/thread`); `rushes`, a storyboard-to-render tool, as the short chain (11 s demo at API 2, workshop `works/skill-showcase/demos/thread`). The shipped example tells this skill's whole pipeline the same way | the full chain for the whole pipeline, or the short chain (storyboard → merge → close) |
| Launch reel of a renderer or shading library: the volume shots are its own output | an SDF ray-marching library for the web: its import line typed as the brief, the smooth-min merge as its blend operator, the marbled ink as its noise field | open, word, storyboard, merge, ink, review, close |
| Release reel of an animation or timing library | a spring-physics library: its presets drawn as the curves with their real ω, its timeline laid out as the tracks | full chain; `curves` and `tracks` named as its stages |
| Opening or closing reel of an editor's launch | a video editor's 2.0: the edit tracks and playhead, the export counting this film's real frames, the file card | full chain; `tracks` and `review` named as its stages |

## Mode principles

1. **One line colour becomes everything.** The accent is a single object whose form changes: line, caret, full stop, swatch, panel, spheres, riders, playhead, ink dye, flood, underline. Nothing else is ever that colour, and there is never a second accent; the field colour is a ground, never a mark. *(Narrows 7, one system, one accent, one meaning, and 4, transform at the turns.)*
2. **Every hand-off is pixel-continuous.** The last frame of a link equals the first frame of the next; the measured difference across a hand-off equals an ordinary frame-to-frame difference (grain only). The only hard-edged change is the flood, on a downbeat. No cuts inside the chain, no crossfades, no slides. The expressive transitions (timing API 3) are the line's own changes of shape from the hand-off library (path-type, rail-press), and the flood's iris; never a frame-level cut between links. *(Narrows 4, keep every transition clean, and 2, precision is a gate.)*
3. **Show the step by doing it, then name it plainly.** Each link performs its step (the brief is typed, the palette is the real hex, the clips sit where this film's scenes sit, the counter stops at this film's frame count); a numbered stage label and one plain note say what the subject does there, and the stage name lands once, large, in the centre. Never caption a technique ("I CAN BLUR"). *(Narrows 2 and 3, one idea per beat; answers the source film's unclear message. Texture may lead in a reel (principle 6), but the frame still has to say what it is about.)*
4. **Volume where it is an object, flat where it is a sign.** Spheres and ink get light, shadow, one highlight, rim and grain; type, swatches, panels and tracks stay flat graphic. Stylised CG that holds up frame by frame, never photoreal. *(Narrows 6, texture decides, and 8, the picture is technical.)*
5. **Locked camera, one push.** The camera is locked except the push into panel 3 and the 6 % push on the contact sheet. The frame moves because the object moves. *(Narrows 5, motion locked to the beat; borrowed from the category's "drafting-table camera".)*
6. **The factory look is banned.** No corner HUD (timecode, BPM, BAR n/8, frame number; the stage label is real information and stays), no ring text, Truchet tiles, dot-matrix sphere, keyword marquee, glow, lens flare, camera shake, RGB split, purple-blue gradient, crossfade, particle explosion; no 128 BPM / 8-bar / red-dot / name-ending default. Static elements stay ≥ 150 px from the sides and ≥ 90 px from top and bottom. *(Narrows 10, borrow grammar, not layout. The template still carries some of these by default; see Factory defaults and Known issues.)*

## Palette presets

| id | name | fits | ground / panel / text | line / onLine | field / onField |
|---|---|---|---|---|---|
| `vermilion` | Vermilion on cobalt (source) | default; tools, studios | `#0B0B0D` / `#17171B` / `#EDEAE2` | `#EE4938` / `#0B0B0D` | `#2E2EF4` / `#EDEAE2` |
| `ultramarine` | Ultramarine on saffron | calm, technical, product reels | `#0A0B10` / `#161823` / `#ECEDF2` | `#6B7BFF` / `#0A0B10` | `#F2B630` / `#0A0B10` |
| `rose` | Rose on deep teal | creative tools, culture | `#0D0B0E` / `#1A161B` / `#F0EAEE` | `#FF4F9A` / `#0D0B0E` | `#0B6658` / `#F0EAEE` |
| `paper` | Vermilion on paper (light) | print, editorial, daytime | `#EEEAE1` / `#E0DBD0` / `#141416` | `#EE4938` / `#141416` | `#2E2EF4` / `#EEEAE1` |

`standard` checks, run by the template on load: text/ground 15.3–16.8, line/ground ≥ 3.1 (paper is the weakest), onLine/line ≥ 4.9, onField/field ≥ 5.8. Measured on rendered frames (2026-10-18, grain on, glyph core and 75th percentile): the corner label and note on the field 5.8–10.8, on the line-colour flood 4.9–6.4 in all four presets; text on any ground or field is solid, never drawn with transparency. Line against field is 1.9–2.2:1 in every preset: hue contrast only, inherited from the source; the spheres read by shading and contact shadow, never as text. Source colours `borrowed (source)` (cobalt returned to the designed `#2E2EF4` now that no video model shifts it); the other three `derived`. The spheres' shadow side is the line colour darkened linearly ×0.45 with its hue turned −4° (`fx.js` `deepen`), `derived` from the source shot's dark red (sampled (176, 40, 23); the template's is (171, 45, 51)).

## Variants

Two axes, chosen in `content.js`; both keep every mode principle, the timing and the sound (2026-10-19).

**Colour**: the four presets above (`palette`). A preset changes every hex together and keeps the three roles: ground, one line colour, one field.

**Form**: `thread`, the line's profile. It changes every place the line colour is drawn as a line (the drawn line and the caret, the rod the sphere squashes into, the beat ruler, the playhead, the full-height line the ink starts from, the line the card flattens into, the underline, the line and the playhead sketched in panels 2 and 5) and nothing else: swatches, panels, spheres, ink, flood and type are untouched.

| Value | What changes | Choose it for | Source |
|---|---|---|---|
| `rule` (default) | An even 6 px line with square ends; caret 6 × 64; the sphere squashes into a rounded box | Screen tools, editors, renderers; any subject whose own interface is ruled | The source film's line; the printer's plain rule, a strip of brass that prints "a single, uninterrupted straight line" and is cut to any length (Jury) · `borrowed (source)` |
| `swell` | A swelled rule: 12 px in the middle (2 × the rule), tapering to points, its outline an ellipse, also round the brief's loop and in the band the name is cut from; the caret, the playhead and the ink's line are vertical swells; the sphere stays an ellipsoid and flattens straight into the lens (no box morph); the card swells over the second half of its flattening | Editorial, typographic or illustration tools, a renderer that sells shape; with `paper` especially, where the underline reads as a book title's rule | The swelled (English) rule, thick in the middle and tapering: adopted by English printers in the late eighteenth century, revived by Stanley Morison and the Curwen Press (Rafaeli, *Book Typography*, quoted in TUGboat 26:3, 2005); "while its weight achieves emphasis, the tapering ends prevent obtrusiveness" (Peggy Lang, *Signature* 9, 1938); the pointed pen's expansion stroke, which swells with pressure (Noordzij, *The Stroke*, 2005) · `borrowed`; the factor 2 `draft` |

Why the profile and not another form axis: a double or dotted line splits the one object, and the sphere would have to split with it (mode principles 1 and 2); weight alone moves a few pixels at 6 px, and a hairline under 4 px breaks the coloured-line-over-a-field rule (system, Corners and strokes); a lit or textured line (yarn, glow) breaks "flat where it is a sign" (mode principle 4), and glow is banned (6). A true swelled rule levels off in the middle; this one is an ellipse so that the squashed sphere lands on it exactly.

Checked 2026-10-19 (workshop `works/skill-showcase/demos/thread/variants/`): `rule` renders the 40 s example pixel-identical to the template before the axis existed (24 stills, PSNR ∞; the mix byte-identical); both values render the 40 s example and the short chain with check-film PASS (hand-offs 9/9 and 3/3, holds settle, flashes ≤ 2 in any second, no black frame), and the sphere → line hand-off from WebGL to 2D is as smooth in `swell` as in `rule` (frame PSNR 36 dB across it in both). After the timing API 3 migration (2026-10-19) both values render the loop, the press and the cut in their own profile (stills checked by eye; selftest `--variants`).

## Accent role

- **Accent (the line colour)** marks one thing: the thread, the single object that carries the work from step to step (caret, full stop, swatch, chosen panel, spheres, riders, playhead, ink dye, flood, underline). It never marks a status, a category or a highlight in text. As a mark it stays under 10 % of the frame (the merged sphere is about 5 %).
- **Change of ground.** The flood turns the whole frame to the line colour at the climax (`review`) and holds it for two bars (principle 7), the corner text in `onLine`; then it retracts onto the contact sheet's gutters and border (about 5 % of the frame) until the collapse, and counter, label and card sit on the ground. Settled 2026-10-18 by theory; the owner did not object (the 5-bar full flood is deleted).
- **Field** is a second ground, not an accent: it only ever fills large areas (the volume shots' stage, panel 3, the field swatch that shows the palette). It never marks a clip, a word or a detail; the tracks' shot clips are neutral with a line-colour outline.
- No status, category or effect colours. The ink's second dye is the neutral text colour.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Big word, name, counter, card title, centre stage names | Bricolage Grotesque, variable 200–800, −0.02 to −0.03 em | OFL | word 360 (fit to 1500 px), name 196 (fit), card 230 (fit), counter 98, centre names 76 |
| Ink words, closing line, formula, stage note | Instrument Serif Italic | OFL | ink words 230 (fit to 1300), closing line 58, formula 58 (superscript 34), note 34 |
| Brief, hex, specimen, labels, URL, track names, spec line | JetBrains Mono 500 (700 on the field and the flood), +0.18 em on labels | OFL | brief, URL, spec line, specimen 44 (the serif specimen 50, its optical match); stage label, hex, counter label, track names, ω labels 26 |

Two families plus one mono, the limit of principle 7; each has one job (display, the serif voice of notes and the formula, the machine voice of what is typed). Information text is ≥ 26 px; main text (brief, word, formula, ink words, counter, card, closing lines, URL) is ≥ 44 px. The stage note (34 px) is glance text. Below 25 px, decoration only: the panel numbers `01`–`06` (16 px, part of the storyboard drawing), the word sketched in panel 1 and every frame shrunk into a contact-sheet tile (0.25 scale). Sizes `borrowed (source)` where they kept the source value, `derived` where raised to 25 / 40 px or moved onto the scale (2026-10-18).

## Type scale

Ratio ≈ 1.3: **26 · 34 · 44 · 58 · 76 · 98**, then display type fitted to its slot (196–360). Content area, at most three levels per frame: palette 76 / 44 / 26; curves 58 (with its 34 superscript) / 26; tracks 76 / 26; review 98 / 26, then the card 230 / 44; close 196 / 58 / 44. The corner label (26) and note (34) are the persistent frame and not counted.

## Frame and grid

1920 × 1080. Stage label at x 150: mark 16 px square at y 90, label baseline 106, note baseline 152. Centre stage names centred on the baseline the link leaves free (palette 330, storyboard 262, merge 300, curves 975, tracks 282). Big word baseline 650; brief baseline 560; swatches on y 500, 250 px apart; storyboard 3 × 2 panels 400 × 225, gap 40, centred +20 px; merge sphere settles at (960, 560) r 180; the line is 1400 × 6 at the sphere centre, then at y 860; tracks x 300–1620, rows 360 + 110 n, height 56; contact sheet 4 × 4 tiles 280 × 158, gap 12, top 200; counter baseline 985; name baseline 600, underline 650, line 750, URL 870. Persistent elements: the line (in some form, every frame) and the stage label, which stays on from its first appearance to the name (only the step number and the name are retyped when the stage changes). Content area for measurement: y 170–1080. Seeded full-range grain, overlay 12 %.

## Scenes

| Type | Purpose | Bars at 120 (fitted) |
|---|---|---|
| `open` *(head)* | Line → caret → the brief's first phrase typed → the caret falls flat under it → (two phrases) the loop carries it round and brings the second (path-type) → the line tightens → contracts into the caret, which takes the letters | 2.75 with two phrases; 2 with one |
| `word` *(head)* | The brief's big word, weight swinging on the beats (the hook) | 1 |
| `palette` *(optional)* | Glyphs → swatches, hex, type specimen; stage name | 1.5 |
| `storyboard` | Swatches (or glyphs, or the line when it is the first link) → panels; panel 3 chosen; stage name | 1.5 |
| `merge` | Push into panel 3; three spheres merge, squash, settle (WebGL); the stage name under the sphere | 2 (2.25 without `curves`: the squash) |
| `curves` *(optional)* | Sphere → rod → presses the stage name into itself (rail-press) → beat ruler + easing curves | 1.75 (1.5 without a name to press) |
| `tracks` *(tail)* | Ground floods out of the line; curves → tracks; playhead | 1.5 |
| `ink` *(optional)* | Playhead line dissolves into marbled ink; serif words (WebGL) | 1 |
| `review` *(tail)* | Flood (dot-iris) on a bar line, held two bars, retracted into the sheet; particles → this film's contact sheet; counter; card, its spec line in three parts, the export bar; the card squashes into the line | 4.75 (climax, three compositions) |
| `close` | Card (or the merge's rod) → line → a bar a blade cuts into the name (rail-press), the band its underline; line, URL; the underline's second move on the last downbeat | ≥ 2.25 (rest; takes the bar rounding) |

The order is fixed; `palette`, `curves` and `ink` may be left out. **Short chain** (2026-10-19): the head (`open` + `word`, with `palette`) may be left out as a whole, and the storyboard then opens out of the line, which is the first frame; the tail (`tracks` + `review`, with `curves` and `ink`) may be left out as a whole, and the close then opens the ground out of the merge's rod. `storyboard → merge → close` is the shortest film: 6 bars, 12 s at 120 (7 bars, 13.1 s at 128), because the merge needs 2.25 bars with its squash and the closing URL 3 s. Slots and limits: `TEMPLATE.md`.

## Length and tempo

The film has no fixed length: `timing.rules.js` declares timing API 3 (principles 4 and 5, the four tiers of change, owner-approved 2026-10-19) and gives each link the longest of its centre reading, its corner reading and its choreography; `lib/timing.js` `fit()` rounds each link to a beat and the total to a bar. More copy makes a longer film; the tempo does not move to hide it. `npm run fit` writes `renders/timing.json` with the key events, holds, hand-offs and the tier arrays below. The per-type table is in `TEMPLATE.md` ("Length").

| Value | Setting | Tag |
|---|---|---|
| Tempo | default 120 bpm (the `thread` bed and the source film); range 112–128 (−7 % / +7 %) | default `borrowed (source)`; range `draft` below, `derived` above |
| Reading | primary text 0.3 s a word (the brief's phrases, the word, the formula, the ink words, the card and its spec line, the closing lines); the closing URL ≥ 3 s after it is typed | `standard` (principle 1) |
| Text per state | ≤ 5 primary words entering together: the brief is one or two phrases of ≤ 5 words; the card's spec line enters in three parts | `standard` (principle 5, api 3) |
| Glance text | stage name and note in the corner (note ≤ 6 words: it restates what the link performs, and the name is repeated in the centre), hex labels, specimen names, track names: fully still ≥ 1 s, in parallel with the centre | `standard` (principle 1) |
| Read-along | the typed phrase, the rising ink words and the spec parts are read as they appear | `derived` |
| Grid | one beat (`unit` 0.25 bar); `review` is a turn and starts on a bar line, so the flood lands on a downbeat; the total rounds up to one bar, none of it shared out (a share would lengthen a hold past 2 beats), so the close takes it and ends with its second move | `standard` (principle 5); phrase 1 bar `derived` (2026-10-19: with no share allowed, a 2-bar phrase would give the close up to 7 extra beats of still name card) |
| Holds | after a landing the picture holds still 0.2 s to 2 beats; where text is still read the line keeps moving without crossing it (the caret falls flat, the line tightens under the brief, the export bar runs along the card) | `standard` (principle 5, api 3) |
| T0 | a change about every beat: the example's median gap 1 beat, longest 2.7 beats (limits 2 and 4) | `standard` (principle 5) |
| T1 | links plus shots (the loop, the shot behind panel 3, the contact sheet, the file card, the lock-up): the example 15 compositions, median 3 s, longest 4.85 s, CV 0.36, two in the first 5 s | `standard` (principle 5) |
| T2 | four in the example: path-type 2.5 s, rail-press press 18.3 s, dot-iris 25.75 s, rail-press cut 36.0 s (see Signature transformations); 3–5 in 40 s as the count rule asks, the same device ≤ 3 times and never twice in a row unchanged. The chain's middle (word to merge) has no expressive device: the gaps are 15.8, 7.4 and 10.3 s (Known issues) | `standard` (principle 4) |
| T3 | the hook (the word's first swing; without the head, the first centre name), the climax (the contact sheet on the drop, 70 % in the example; without the review, the lock-up), the lock-up (the name cut out of the line) | `standard` (principle 4) |
| Review ceiling | 5 bars, a turn and the climax, with its reason: three compositions in one take (flood, sheet, card) | `derived` |
| Example | 20 bars = 40.0 s at 120, the same length as before the migration (the links were refitted: open 2.75, curves 1.75, review 4.75, close 2.25) | `derived` |
| Short chain | `storyboard → merge → close`: 1.5 + 2.25 + 2.25 = 6 bars, 12 s at 120 (7 bars, 13.1 s at 128). No chain is shorter: the merge's choreography (push, merge, settle, squash) is 3.95 u and the close's URL holds 3 s | `derived` |

Key events exported (`timing.rules.js` `events`): the centre name's landing on each named link (`land`), the word's three weight swings (`accent`), the second phrase landing on the straight line (`land`), the line hitting the stage name (`accent`), the flood (`turn`), the drop on the contact sheet (`accent`, `drop: true`), the counter's landing (`land`), the name cut out of the line (`land`), the underline's second move (`end`); hand-offs at every link boundary except the flood, push → shot, and the start of each library hand-off; holds after each landing; content mask `0 170 1920 910`; and `micro`, `shots`, `expressive`, `peaks`.

## Signature transformations

- Line → caret: the drawn line contracts to a 6 × 64 caret at the start of the centred brief. Caret → letters: the caret types the first phrase, at least 42 characters a second.
- Caret → line: the caret shrinks onto the line's height at its own place, right of the phrase, then stretches both ways under it (never crossing the text); the same path back when the line contracts into the caret.
- **The brief round the loop** (path-type, T2, 2 beats): the line rolls up a loop from its middle, its length kept, carries the first phrase round and out of its far end while the second follows it in, and opens straight under it. The loop is the content: the prompt goes round and comes back revised. Text is read only while the line is straight.
- Letters → caret: at the end of `open` the line tightens under the last phrase, contracts into the caret, and the caret takes the letters back (they slide right into it, last letter first) and closes; the big word springs in only after, so nothing crossfades.
- Word → swatches (or panels): the first four glyph boxes, measured at the hand-off weight, morph from rounded rectangles into circles (or straight into panels when `palette` is left out), filling from text colour to their role colour.
- Swatches → panels: each circle grows into a 16:9 panel of the same colour; two more panels scale in.
- Panel → shot: a log-space zoom into panel 3, whose content is the merge's first frame rendered once by WebGL; the radius goes to 0 as the zoom lands, so the shot starts on an identical frame.
- Sphere → line: the settled sphere morphs (ellipsoid → rounded box) into a 1400 × 6 rod while its shading flattens to the line colour; the 2D line takes over with no visible change.
- **The stage name into the ruler** (rail-press, phase `press`, T2, 1 beat): the rod drops to hover 30 px over the merge's stage name, then presses it into itself on the beat; the line takes the word's weight (thickens 2.1×) and recovers as the beat ruler. The step's name becomes the step's tool.
- Line → ground: the ground floods out of the line both ways. Curves → tracks: the four curves flatten onto the track rows.
- Playhead → ink: the playhead sweeps to the centre and grows to full height; the ink starts from that exact line and dissolves it.
- Ink → flood (dot-iris, `contents: 'ground-only'`, exponential growth, no ring; T2): a line-colour disc grows from the centre (0.3 u) and lands on the downbeat as the next ground.
- Line → panels (short chain, the film's first frame): the line is cut into four equal segments that open into panels 1, 4, 2 and 3 (nearest first, so no paths cross), on 1/32 notes from the first frame; each keeps its slice of the line's profile until it opens.
- Rod → name (short chain): the ground opens out of the merge's rod both ways, as in `tracks`, and the rod settles and is cut into the name as above.
- Particles → sheet: 420 squares gather onto the 16 tile outlines; the tiles show this film's own frames.
- Sheet → card → line: tiles collapse, a card grows; its title, its spec line in three parts; the line runs along its foot as the export (constant speed: a process); the card squashes into a 1100 × 6 line, landing exactly at the link's end.
- **Line → name** (rail-press, phase `cut`, T2 and the lock-up, 1 beat): the ground opens from the line, the line settles where the name's underline goes, thickens upward into a bar, and a blade crossing left to right cuts the bar into the name; the band stays under it. On the last downbeat it extends a fifth of its width to the right.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Position springs | critically damped `1 − (1 + ωt)e^(−ωt)`, ω 14–26, no overshoot; start 0.05 s before the beat to land on it | borrowed (category quality point 4) |
| Big word | letters 1/32-note stagger, ω 20, rise 180 px; weight 780 → 200 → 800 → 430 on beats 2–4 (ω 16) | borrowed (source) |
| Brief exit | letters slide into the caret over the last 0.4 s (expo-in, 0.16 s each, last letter first); the caret closes over 0.08 s, gone 0.05 s before the word | draft (check 2026-10-18 F13: the 0.2 s crossfade removed) |
| Caret ↔ line | 0.3 u (0.2 u back): height to the line's over the first 40 %, then width both ways from 30 %, cubic in-out; 0.2 u after the phrase is typed | draft (2026-10-19) |
| The loop (path-type) | 2 beats from the next beat after the first phrase is read; loop radius 190, line 1400 × 6, letters 14 px above it; bend and open smootherstep, flow cubic in-out (the module's) | library `draft` (owner approved the sample 2026-10-19, "这 22 个转场我都很喜欢"); radius and lift `derived` from the line |
| Line tightens | to the last phrase's width + 48 px, spring ω 20, halfway through its hold (a T0 change that is not new text) | draft (2026-10-19) |
| Glyph → swatch → panel | ω 17 / 16, 1/32-note stagger; swatch hop 36 px, 1/16-note stagger | borrowed (source) |
| Centre stage name | Bricolage 800, 76 px; spring ω 24 from 0.2 s before a beat, lands on it, holds one beat, leaves in 0.12 s rising 16 px; on the first link of each stage whose centre has no words. The merge's lands under the sphere (baseline 851) and, when `curves` follows, stays until the rod presses it | draft (check 2026-10-18 P-16); the merge's place draft (2026-10-19) |
| The press (rail-press `press`) | the rod drops 0.45–0.78 u (a landing, ω 10) to hover 30 px over the name; the press runs 1 beat from 0.82 u, the line reaching the name on the beat (1.0 u: the module's cubic-in press over its first 36 %), thickening 2.1× and recovering; the curves' choreography then runs 0.5 u later | library `draft` (approved sample: ~3.6 beats with both phases; the 1-beat press phase is the library's own split); placement draft |
| Corner label | mark and label stay on; a stage change retypes only the step number and the name (60 cps); notes fade in 0.2 s, out 0.1 s | draft (check 2026-10-18 P-17) |
| Push into panel | exponential in-out, 0.9 s, log-space scale, lands 0.1 s before the shot | borrowed (source; radius-to-0 is new) |
| Merge drift | 0.20–1.70 s (smootherstep, staggered 0.07 s), landing squash 26 % with 0.52 s period, exactly settled at 2.45 s; volume kept (x = 1/√y) | draft |
| Merge neck | per contact: the smooth-min radius rises linearly from 0 at the moment two surfaces touch to 140 px over 0.35 s, fading as the centres coincide; contacts at 1.00 s and 1.20 s (`shots.js` `MERGE_CUES`) | draft (check 2026-10-18 X2: the neck used to be full before contact, fused in 3 frames) |
| Merge surface | tremor of 1.5 % of the radius from each contact, decaying with 0.3 s, zero from 2.3 s | draft |
| Merge shading | shadow side = line ×0.45 (linear, hue −4°); one softbox highlight ≤ 0.15; rim in the line colour ≤ 0.25; field bounce 0.03; no grey fresnel, no sharp specular; normals with a 1 px step and an epsilon (no single-frame spark where three surfaces meet) | derived (from the source shot, check 2026-10-18 X2) |
| Sphere → rod | 0.42 s cubic-out, shape ellipsoid → rounded box over the first 60 % | draft |
| Ink | 2 s; plume half-width 0.01 → 1.31 × 540 px along t^1.6; centre ellipse held 55 % darker for the words | draft |
| Flood | lib/transitions `dot-iris` (ground-only, exponential growth from a 1 px dot, no ring) over 0.3 u from 0.25 u before the downbeat; holds two bars, then retracts onto the sheet, exponential in-out over 0.4 s, landing on the downbeat (`REVIEW_CUES.recede`) | borrowed (source); drawn by the library since 2026-10-19; retraction derived (principle 7, settled 2026-10-18) |
| Particles | 420, ω 9, delays 0–0.35 s, size 7–16 px, 75 % onLine / 25 % text | draft (source had 360 bone, judged weak) |
| Tiles / checks | reveal and check on 1/16 notes; collapse ω 14 | borrowed (source) |
| Counter | cubic-out over 3.5 s to the rendered frame count, ceil(duration × fps) | borrowed (source) |
| Camera push on the sheet | 1.00 → 1.06 over 4 s, ease in-out | borrowed (source) |
| Card | title from 0.2 u after the card lands; the spec line typed in three parts 0.25 u apart from 0.45 u; the export bar (820 px, the line's profile) at constant speed over 0.8 u from 1.2 u; the squash a landing (ω 10, scaled to end exactly) over the last 0.35 u | draft (2026-10-19) |
| The cut (rail-press `cut`) | the line settles (ω 10, exact) over 0.05–0.45 u onto the band 50 px under the name's baseline, then the bar grows (expo out) and a blade cuts it into the name (expo in-out), 1 beat from 0.5 u, landing on the beat; the name is the line colour, 196 px | library `draft` (approved sample: ~3.6 beats for press and cut; the 1-beat cut phase still reads, checked by eye 2026-10-19); placement draft |
| Closing second move | the underline extends 20 % of its width to the right, spring ω 22 landing on the last bar's downbeat, then holds | draft (principle 5, closing scene) |
| Motion blur | 6 sub-frames, 180° shutter, on fast moves only; 16 on the push, 10 on clips, the collapse and the card squash; the library hand-offs speed-gated (`subframes` with `speed`: no blur under 1 px per frame, sub-frames ≤ 2 px apart) | draft; speed-gated `borrowed` (library) |
| Rest before the climax | 0.2 bar of music (0.4 s at 120) before the sheet reveals, 0.8–1.0 bar into `review`; the picture keeps gathering (T0 gap 2.7 beats there) | borrowed (category: 0.3–0.5 s) |
| Exits | 0.12–0.15 s, faster than entrances; timed from the link's end, entrances from its start, so a longer link holds instead of slowing | standard (principle 5) |
| Ambient | the ink keeps curling under its words (z drifts) | draft |

## Sound

Bed `thread` (120 bpm, D major, Dmaj7–Bm7–Gmaj7–A): `intro` on `open`, `build` through the chain, `intro` (half-time: pad and one kick per bar) under `merge` so the squelch reads, `break` under `ink` and the particle gather, 0.2-bar `rest`, `drop` on the contact sheet (bars 1–3.225 of `review`), `rest` under the collapse, a pad-only `break` while the card is held (bar 4 of `review` onward), `outro` on the name (D add9 and a bell). Sections follow the fitted links; consecutive links of one kind share a section, so the chord progression runs on across them. Energy follows a tension curve over the chain, highest at the review's drop and lowest on the close. About 70 effects on picture events at the same times: whoosh on the line, pluck on the caret, typing, a six-note run on the word, bells on the weight swing, plucks and ticks on swatches, panels and sketches, a bell on the chosen panel, a whoosh into the push, an impact at the shot, two synthesised squelches at the merge contacts, a thud on the landing and a pop on the rebound, a downward whoosh on the squash, rising ticks on the ruler, plucks per curve, bells as the riders land, ticks per clip, a whoosh on the playhead, an impact and a synthesised rumble under the ink, bells per word, a riser into the flood, an impact and a clap on the flood, 70 rising shimmer ticks with the particles, a pentatonic pluck per tile, a tick per check, a bell as the counter lands, whooshes and a kick on the card, an impact, bell and pluck shimmer on the name, typing on the URL. The api 3 hand-offs land with sounds of their own (2026-10-19): a tick as the caret falls flat, a whoosh with the loop and a pluck and bell as the second phrase lands, ticks as the line tightens and contracts, a whoosh as the rod drops and a thud and bass where it hits the stage name, typing for the card's spec parts and a soft riser under the export bar, a swell into the bar, a pluck per letter as the blade passes, a tick, kick and bell as the name lands. The mix fades in over 60 ms: a short chain opens on a hit, and the AAC encode then overshot the true-peak ceiling by 4–8 dB, so HyperFrames lowered the whole mix (−17.5 to −21.6 LUFS rendered, 2026-10-19). Master −14 LUFS, true peak ≤ −1.5 dBTP; `score.mjs` writes the measured loudness to `assets/audio/measure.json`. Every time the picture and the sound share is exported by `shots.js` and read by both `film.js` and `score.mjs`: the merge contacts, landing and rebound (`MERGE_CUES`), the squash exit (`SQUASH_EXIT`), the brief going into the caret (`OPEN_OUT`, a whoosh), each centre name's landing (`CENTRE_NAME`/`nameAt`, a two-note pluck and a tick, the music giving way 70 ms before it), the review's sheet, checks, counter, collapse and card (`REVIEW_CUES`), the closing second move (`closeSecondMove`, a bell).

## Factory defaults

What the template produces untouched. A film's `PLAN.md` ban list starts here; the first nine items are the motifs the gallery's motion-showreel category shares with the source film (check 2026-10-18 F2).

- The `vermilion` preset: ink black, bone, red-orange `#EE4938`, cobalt `#2E2EF4`.
- Heavy grotesque + serif italic + mono labels.
- The film opens on one horizontal line on black.
- Red spheres on a cobalt field.
- An easing-curve demonstration (`curves`).
- A counter that stops at this film's own frame count.
- A full-frame flood in the line colour (two bars, then retracted into the sheet).
- A centred line-colour disc growing to fill the frame (the flood's entrance).
- The film ends on the name, underlined (cut out of the line by a blade, in the line colour).
- The fixed chain order; the 4 × 4 contact sheet of the film's own frames.
- A small mono label `nn / NN NAME` with an italic note in the top-left corner.
- The example copy: the code-reel skill explaining its own pipeline in six stages (Prompt, Colour, Boards, Physics, Cut, Output), brief `explain our pipeline` / `in {seconds} seconds`, word `Plan.`, ink words `pure code`, card `MP4`.

## Don'ts

- Do not use this mode for a subject that is not a video, motion or rendering tool: the chain will say "video tool" whatever the words say (Fits).
- Do not type the film's length, frame count or frame rate into the copy; write `{seconds}`, `{frames}`, `{fps}` and let the film fill them (principle 2; the old example said "30-second" in a 48 s film).
- Do not use the field colour to mark anything smaller than a ground: it reads as a second accent (principle 7).
- Do not draw text with transparency on the field or the flood; use the solid `onField` / `onLine` colour (principle 1, contrast against what is behind it).
- Do not overlap two links' content or crossfade between them; a link clears its own content before the next arrives (mode principle 2).
- Do not caption a technique; name what the subject does (mode principle 3).
- Do not write a note over six words or a stage name that is not a step a viewer can see in the same link.

## Checks

P0 (fails the film)
- `npm run fit` reports no errors (timing API 3: ≤ 5 primary words a state, each brief phrase ≤ 5 words and ≤ 24 characters, holds 0.2 s–2 beats, compositions ≤ 6 s, T0 gaps, T1, T2 count and repeats, T3; the corner note is ≤ 6 words).
- check-film fails: `scene stills` (≤ 2 beats still on links not marked rest), or any tier row (T0, T1, T2, T3, hold lengths).
- A hand-off jumps: check-film `handoffs` measures each one in `renders/timing.json` (link boundaries, push → shot, the start of each library hand-off); the difference must equal an ordinary frame pair's.
- A library hand-off does not land on its rest: the frame after it (the loop's end, the press, the cut) equals the template's own drawing of the next state.
- The counter disagrees with the rendered frame count (check-film's `duration` line), a hex label disagrees with the palette, or the brief or the card states a length other than the film's.
- Any copy overflows, clips or is painted over a red `content.js` banner.
- Corner text below 4.5:1 on any ground, measured on rendered frames.
- A second accent colour, a corner HUD, or any item from the ban list the film's `PLAN.md` adopted.
- WebGL fallback visible (flat discs instead of shaded spheres).
- Loudness outside −15 to −13 LUFS or true peak above −1.5 dBTP.

P1 (rhythm)
- Every key event in `renders/timing.json` within 2 frames of its beat, with a picture event and a sound on it (check-film `keys`).
- Stage labels name the steps a viewer can see in the same link; six or fewer names; each named link shows its name in the centre.
- The brief's two phrases are a real loop of the content (a request and its revision, a step and its retry); otherwise write one phrase (path-type's "use when the loop is the content").
- No text is crossed by the line while it is read: the caret falls flat beside the phrase, the press waits until the name has been read for a beat.
- The corner label never goes out between stages.
- The closing URL holds ≥ 3 s (enforced by `fit()`); the second move lands on the last downbeat.
- Short chain: the first frame is the whole line and nothing else (no label, no panel); the merge's last frame and the close's first frame are the same rod on the field.
- Each picture event in the sound section has its sound on the same beat.

P2 (polish)
- Motion blur on every fast move and nowhere else; no visible sub-frame steps.
- Tiles show settled frames (no tile caught mid-hand-off).
- Sphere highlight and contact shadow stay on the same side through the merge; no frame where the brightest pixel of the spheres jumps.

## Known issues

- **Ban list against the template (check 2026-10-18 R2, F2), accepted 2026-10-18.** Mode principle 6 bans the factory look and a red-dot / name-ending default, yet the template's defaults (the first nine Factory defaults) are that look: the vermilion preset is the gallery's factory palette, the flood enters as a full-frame red disc from the centre, and the chain ends on the name. Settled 2026-10-18 (`TEMPLATE.md` "Settled"): the default preset stays `vermilion` (`ultramarine` and `rose` stay as ordinary presets), the film ends on the name (the `'line'` ending is deleted), the example keeps `curves`; kept as they are because the owner approved this film as it stands and wants it as the Skill's promo; the owner did not compare the options shot by shot (workshop `batch2/c6-*`). A film made from the template still starts its ban list from Factory defaults and may drop them.
- **The flood is a change of ground (resolved 2026-10-18).** It held the line colour for the whole `review` (5 bars, 10 s at 120); it now holds two bars and retracts into the sheet (principle 7). Settled by theory; the owner did not object (workshop `batch2/t-flood`).
- **Text across a moving ground edge (fixed 2026-10-18, batch 2).** During the push into panel 3, as `tracks` opens the ground out of the line and as the flood retracts, the corner label (and the flattening graph) took one ground's colour for the whole string; with `ultramarine`'s light field the part on the other ground fell to about 1.6:1 for a few frames. The text is now drawn in both colours, each clipped to its side; `vermilion` only changes the label's weight on the field side.
- **The message (source issue, partly addressed).** The owner liked the motion but could not tell what the film says. The template numbers the stages, adds a plain note to each, names each stage once in the centre and closes on one sentence of what the subject does. Seen in the batch-1 film (2026-10-18): the owner liked the whole film and chose it as the Skill's promo; no remark on the message itself.
- **Merge rebuild vs. the generated source shot.** Same geometry and timing role, ray-marched shading with one highlight and a line-coloured shadow side, a neck that forms over 0.35 s from contact and a small surface tremor. The surfaces still meet with a visible crease for the first frames after contact, the highlight is softer than the source's, and there is no refraction or real liquid thinning. Changed 2026-10-18 (batch 1) and kept: accepted on the recommendation; the owner did not compare it shot by shot (workshop `batch2/x-thread-merge`).
- **Ink rebuild vs. the generated source shot.** Domain-warped fbm lit from its own density: reads as marbled ink with curls and a dark core, but more like oil paint than the source's billowing smoke-like plumes with fine filaments; it evolves by noise, not by advection, so it does not fold over itself.
- **Centre names.** They answer the three-second test on the wordless links (check 2026-10-18 P-16). Seen in the batch-1 film (2026-10-18) with no remark; the owner liked the film as a whole.
- Contact-sheet tiles are 280 × 158: decoration on a phone; a 3 × 2 sheet of larger tiles is the check's suggestion (F7), not done.
- 30 fps with 6–16 sub-frame blur, not the category's 60 fps + 8 sub-frames.
- Line vs field is about 2:1 in every preset (hue contrast only).
- The chain order is fixed; three links can be left out on their own, the head and the tail only as wholes (short chain). The shortest chain is 6 bars at 120 (12 s): `merge` needs 2.25 bars (push, merge, settle, squash) and the close 2.25 (the cut and the URL's 3 s), so 10 s is not reachable; at 128 the chain is 7 bars, 13.1 s, so 120 is the shortest in seconds too.
- **Short chain at API 3 (2026-10-19).** `storyboard → merge → close` fits 1.5 + 2.25 + 2.25 bars (12 s at 120; 7 bars, 13.1 s at 128, where the close needs more beats for the URL's 3 s). It has five compositions, too few for a run of three that speeds up or slows down: `npm run fit` and check-film warn (T1), nothing fails. Rendered at 128: check-film PASS.
- **Line → field colour on the opening segment (2026-10-19).** The segment that becomes panel 3 changes from the line colour to the field colour by an sRGB mix; with complementary presets (`ultramarine`) it passes a muddy mid-tone for about four frames, under motion blur. The glyph → panel hand-off of the full chain does the same from the text colour.
- **Fixed 2026-10-19: one bare frame between the card and the name.** At the review → close hand-off the close's ground band covered the flattening card one frame before the close drew its line (`close` returned before u 0.05), so one frame showed only the ground (36.033 s in the example; 07 C2 asks for none). The close now draws its line from u 0, where the card flattens to (1100 × 6 at y 540); the name, the sentence and the URL keep their times. In the example only 36.0 s and 36.033 s change (the line, 1100 × 6 px); stills elsewhere are pixel-identical. The short chain (close after `merge`) never had it.
- **`swell` tips on the field.** The swelled line is under 4 px for the last 6 % of its length at each end; over the field (the rod, the ruler) that breaks the coloured-line rule (system) at the tips only, which carry nothing.
- The tracks' sound row is the beat grid, not the mix's real envelope.
- **Timing API 3 migration (2026-10-19), not yet seen by the owner.** The 40 s promo the owner approved (2026-10-18) now differs: the brief is two phrases round a loop, the merge's name sits under the sphere and is pressed into the ruler, the card gains a spec line in parts and an export bar, and the name is cut out of the line in the line colour (it was text-coloured, rising under a settling underline). Kept: the chain, every look, the palette, the sound bed, the length. The default `rule` profile no longer renders pixel-identical to the template before 2026-10-19.
- **Hand-off lengths.** The library compresses the owner-approved samples to fit T2's 2 beats: rail-press ran about 3.6 beats with both phases, path-type about 4. Here each rail-press phase gets its own beat (press in `curves`, cut in `close`), and path-type runs at its 2-beat default with a short phrase. Judged by eye on frame strips (2026-10-19): the 2-beat loop still reads (the phrase is visible round the loop for about half a beat at each end, unreadable in the middle by design); the 1-beat cut reads as a blade (bar for half a beat, the name revealed left to right over the next); the 1-beat press reads as a hit rather than a press, the name squashing in two frames on the beat. All stay T2; none needed a slower tempo.
- **Template-local drawing of the line during hand-offs.** path-type and rail-press stroke an even line; to keep `swell` they get a transparent line colour (path-type) or a clip over their band (rail-press), and the template draws the line in the thread's profile with the module's geometry. If a module's geometry changes, `film.js` `loopLine` and `railDraw` must follow.
- **T2 spacing.** The four expressive hand-offs pass the count rule (3–5 in 40 s) but sit at 2.5, 18.3, 25.75 and 36.0 s: 15.8 s between the loop and the press, longer than the 8–12 s rhythm, while word, palette, storyboard and the push carry the middle as T0 and T1 changes. A fifth device there would need a hand-off the chain really performs (the glyphs → swatches morph is the template's own, not a library entry). check-film does not measure spacing, only count.
- **Not used from the batch-4 plan:** `arc-curl` (none of the line's figures in the chain is a closed outline; a curl into a ring would be a shape for show) and `signal-relay` (cards on a line of steps with active and done colours; thread has one accent, and the corner label already counts the steps).
- **Short-chain opening hit and the encoder (fixed 2026-10-19).** The short chain opens on the bed's kick and four plucks at sample 0; the AAC encode overshot −1 dBTP and HyperFrames lowered the whole mix by 3.4–7.5 dB (check-film loudness −17.5 to −21.6 LUFS, FAIL). The mix now fades in over 60 ms; rendered: −14.1 LUFS, −1.8 dBTP.
- The sound was verified by levels, spectrum and event timing only; nobody has listened to it.
