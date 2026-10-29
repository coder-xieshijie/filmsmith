# Strip (`strip`)

Real frames of real films, carried by one strip of film on a light box: the strip moves horizontally through a fixed gate and stops with a frame registered in it, intertitles ride the same strip, a frame punches to the full frame, the films lie side by side as a contact sheet whose rows are exactly as long as the films, and the editor's grease pencil rings the pick, which punches to full size and runs. At the end the strip runs out of the gate and leaves the name. The camera never moves; the material does. Aesthetic anchor: "like an editor's light box and flatbed viewer: a print reel advanced frame by frame through the gate, the contact sheet beside it, one china-marker loop on the take".
Theme: tech-product-launch (products whose evidence is footage: renderers, video and motion tools, engines, the skill itself), reels · Template: `assets/templates/strip/` · tempo 112–128 BPM, default 120 (length follows the content; the shipped example fits 14 bars = 28.0 s) · timing API 3 · Status: owner-accepted 2026-10-21 (sample film); template 2026-10-21. Values are tagged `standard` / `borrowed` / `derived` / `owner` / `draft` as in [foundations](../foundations.md#where-values-come-from).

## Fits / does not fit

Fits: a product whose proof is **sequential pictures it made** — rendered films, captured footage, animation output, game or simulation frames — and whose story is choosing among them: a reel of examples, a set of styles or presets, before and after versions, demo scenes of different lengths. The frames are the protagonists; the code draws only the film stock, the words and the one pencil mark. About 12 s (a cut-down: three intertitles, three frames, the name) to about 45 s (twelve films, a sheet, a pick).

Does not fit:
- evidence that is static and printed (tables, charts, pricing, docs): exhibit walks a desk of them, dossier works one page at a time;
- one app whose story is a sequence of its own screens: handset;
- a reel whose links must *perform* the tool's steps (brief, palette, storyboard, shading) rather than show its outputs: thread draws them;
- a product with no footage or frames of its own (a CLI: phosphor; a mechanism: trace; counts: tally);
- frames that cannot be recognised at 0.43 of their size (fine text-only screens): the gate is 832 px wide;
- films over 50 s, or more than ten on one sheet (the sheet draws 24.8 px a second, ten rows).

## Use cases

| Use | Example | What the film says | Chain |
|---|---|---|---|
| **The examples of a video, motion or rendering tool, chosen from** (best fit; the shipped example) | Filmsmith: ten demo films, one per style (28 s) | "Ten ways to film your code; drawn and scored in code; length follows the content; pick a style." | `titles` → `titles` → `frames` → `punch` → `sheet` → `pick` → `lockup` |
| A game engine's or renderer's release (made-up product) | `orrery-3`, a path tracer: its sample scenes | the scenes pass the gate; the sheet's rows are the scenes' lengths; the pencil picks the one rendered with the new feature, which runs | `titles` → `frames` → `punch` → `sheet` → `pick` → `lockup` |
| A model or tool's generated clips, honestly sampled (made-up product) | `fernwave`, a text-to-motion library's examples | every clip appears with its measured length and sampled every 4 s, so nothing is chosen between frames | `titles` → `frames` → `punch` → `sheet` (one caption) → `lockup` |
| A sting inside a longer reel | any of the above, `edges: 'cut'` | three intertitles, three frames, the name | `titles` → `frames` → `lockup` (12 s) |

## Mode principles

1. **The camera is locked; the material moves.** The light box and the gate never move. Changes are the strip being pulled, a frame being punched toward the eye, or the sheet's strips sliding; never a pan, a dolly or a zoom over a world. *(Narrows 4: the next state grows out of the current one, here by the strip carrying it; departs from exhibit's travelling camera. Ambient: none.)*
2. **Motion is horizontal transport, or toward the eye.** Strips move along their length; the one other move is the punch (a frame to the full frame and back). Nothing tilts, flips, scrolls vertically or rotates. *(Narrows 5.)*
3. **Every move ends registered.** A pull-down stops with the next frame exactly in the gate (a claw: a cell in a quarter beat, accelerating and braking, landing still); only the opening run and the closing run-out move continuously. A frame never drifts in the gate. *(Narrows 5: a landing holds still; the projector's intermittent movement, a frame held then advanced, is what this mode is made of.)*
4. **Real frames, real lengths.** Frames are decoded from the films and only scaled, cropped and uniformly veiled; a contact row is sampled at the middle of every 4 s block and cut at the film's measured length, so its length is a reading. A frame is never enlarged past 4/3 output px per source px: a contact cell that punches is swapped for the full-resolution frame before it gets there. *(Narrows 2 and the real-asset rules of [transitions](../transitions.md).)*
5. **Words are intertitles or labels, never over a frame.** Copy on the strip is an intertitle frame (a dark frame of type, read before the strip moves on); copy off the strip is a typeset label on the light box, under the gate or under the sheet, cutting in and out on the beat. No word is laid over a real frame. *(Narrows 1 and 3: intertitles are read one at a time in reading order; the real frames' own text is evidence, not information.)*
6. **One pencil, one pick.** The accent is the grease pencil (china marker), and it marks one thing: the pick — a hand loop round the chosen cell, and at the end the underline of the address. One mark at a time, drawn on by arc length, never a ring that fills or a second colour. *(Narrows 7: one accent, one meaning.)*
7. **One strip, end to end.** A strip is on screen from the first frame to the last but one move: the scene behind changes only while a full frame covers it (`gate-punch`, occlusion) or as the strip moves; there is no cut from one composition to an unrelated one. *(Narrows 4 and 7: a through-line object keeps the viewer oriented.)*

## Rules for real frames

P0 unless marked.

| Rule | Value | Tag |
|---|---|---|
| Source | the product's own renders or captures; the film decodes the instant it shows (`tools/extract.mjs`); a generated or rebuilt frame never stands in | `standard` (principle 2) |
| Only scaled, cropped, veiled | ffmpeg decode and lanczos scale; WebP storage; frames outside the gate under a black veil up to 55 %; stepped-back rows under the ground colour; no grading, no "film look" | `standard` ([transitions](../transitions.md), Real assets) |
| Zoom cap | ≤ 4/3 output px per source px: gate frames from ≥ 1280 px sources (832 / 0.75 = 1109); a punch to full needs the 1920 source; a contact cell (192 px) is drawn only until 256 px wide, then the full frame | `standard` (principle 2) / `derived` |
| Contact rows | one cell per 4 s block at its middle (2, 6, 10 … s; a partial last block at its own middle), 192 × 108 a cell, the row cut at the measured length, 24.8 px a second on the sheet | `derived` |
| Lengths | ffprobe of the video, shown rounded to the second | `standard` (principle 2) |
| Identity | each stored frame matches its source instant (PSNR ≥ 35 dB, cells ≥ 30 dB at 96 × 54) in `npm run assets` when the videos are at hand; the hashes otherwise | `derived` |
| Manifest | every film in `content.films`: name, video, duration, the gate frame (file, instant, sha256), the row (file, instants, sha256), the run (from, fps, frames, sha256); written by the extraction script | `borrowed` (exhibit) |
| Page captures | 2× pixel density; crop off headers, avatars and contributor photos; the words the film quotes found by OCR in the crop | `standard` (principle 2) |
| People | none in any frame or crop | `standard` (principle 8) |

## Palette presets

The light box, the film base, the intertitle frame and the type are the mode's; the accent is the only colour the film draws. Frames keep their own colours (content).

| id | name | fits | ground · glow | base | title · titleInk | ink · muted · dim | hole | track dim · lit | accent |
|---|---|---|---|---|---|---|---|---|---|
| `lightbox` | Light box, carmine china marker (default) | most frame sets | `#ECEFEE` · `#F5F7F6` | `#0B0C0D` | `#1B1D1F` · `#ECEFEE` | `#14171A` · `#474D51` · `#565C61` | the ground | `#2B2E31` · `#C9CFCC` | `#C2185B` |
| `lightbox-blue` | Light box, blue china marker | a pick whose frame is red, pink or magenta | same | same | same | same | same | same | `#2F5BD8` |
| `flatbed` | Editing bench, pink china marker | frames that are mostly dark (night terminals, dark UIs), where a light box would make them the darkest thing in the frame | `#17191A` · `#1F2223` | `#050606` | same | `#E9ECEA` · `#A9AFAC` · `#8F9693` | `#3A3F41` (the bench's plate) | `#202325` · `#C9CFCC` | `#F58FB8` |

Contrast (`standard`, WCAG 2.2, `npm run palettes`): `lightbox` ink on the box 15.6, muted 7.4, dim 5.9, intertitle type 14.6, the pencil 5.1 on the box, 3.3 on the film base, 5.9 on a white frame; `lightbox-blue` the same, the pencil 5.0 / 3.4 / 5.8; `flatbed` ink 14.8, muted 7.9, dim 5.8, the pencil 8.0 on the bench, 9.2 on the base, 2.2 on a white frame (so on `flatbed` the pencil never crosses a frame: the loop runs on the base and the bench). Sprocket holes and the optical track are texture and carry nothing.

**Why these** (`derived`): the light box is the editor's own surface for print reels and contact sheets, and a light ground puts the real frames on black film where every one reads as a picture; the bench is the flatbed's dark table, for dark material. The china marker is the tool editors and photo editors pick takes with; carmine because the red of thread (`#EE4938`, ΔE00 22.5) and exhibit (`#D0233D`, 11.2) is taken, and the flatbed's pink is the same hue lifted for a dark ground. Nearest accents of other modes: `lightbox` exhibit's red 11.2, `lightbox-blue` ink's cobalt 9.6, `flatbed` dossier's coral 21.7 (all ≥ 6.5). Grounds: L* 94 (the light-ground rule, 92–97, a cool neutral), L* 8 (the dark-ground rule, 2–8). Brand collisions were not searched beyond the skill's own accents (`draft`).

**The accent rule** (`owner`, 2026-10-20, as in exhibit, handset and dossier): the pencil differs by ΔE00 ≥ 20 from every chromatic colour inside the cell it rings; `npm run palettes` and `npm run assets` check it with ffmpeg on the content's cell. The shipped example: Morph's fourth cell holds no chromatic colour.

## Variants

**Colour**: the three presets above, picked by the accent rule and the frames' brightness.

**Form: `perfs`** (content.js; the default renders exactly as before the field existed):

| `perfs` | What changes | When | Source |
|---|---|---|---|
| `double` (default) | sprocket holes along both edges, ten to a frame; a narrow variable-area track (16 px) under each frame | most films: the cinema's reel | `borrowed` (35 mm print film) |
| `single` | one row of holes along the top; the bottom edge is a wide optical track (74 px in the gate), lit like the narrow one; on the sheet the bottom edge is plain base | a film whose sound is the point (a music or audio tool): the track carries more of the story | `borrowed` (16 mm sound film: one row of perforations, the sound along the other edge) / `draft` |

The gate, the sheet, the pencil, the punch and the timing are the same in both.

## Accent role

- **Accent**: the pick. The grease-pencil loop round the chosen cell (drawn on by arc length in one beat, a hand loop that spirals in and crosses itself), and the underline of the address. On screen one at a time. Area: a mark (the shipped example measures at most 0.1 % of the frame); never a ground, never text, never over a frame on `flatbed`.
- **Neutral**: all type, the film base, the intertitle frames, the gate's corners (decoration), the sprocket holes, the optical track, the veils.
- **Status / category / effect**: none drawn by the mode. Colours inside frames are content.

## Type

| Role | Family | Licence | Sizes (px, output) |
|---|---|---|---|
| Intertitles, labels, captions, the name | Hanken Grotesk (variable, wght 100–900): 700 intertitles and the name, 600 labels and captions | OFL 1.1 (google/fonts `ofl/hankengrotesk`) | 140 name · 79 intertitles · 59 labels and captions · 33 the sheet's names |
| Lengths, the address | DM Mono 500 | OFL 1.1 (google/fonts `ofl/dmmono`) | 44 address · 33 lengths |

A departure from [system](../system.md)'s families, with its reason (`draft`): Hanken Grotesk is a plain grotesque in the manner of the typeset labels of a light box and an edge-print catalogue, and no other mode uses it; DM Mono sets the measured values only (lengths, the address), never a heading. Information text ≥ 25 px everywhere it is read; main text ≥ 40 px (labels 59, intertitles 79) (`standard`, principle 1). **Below 25 px: only text inside the real frames** (in the gate at 0.43 of its size, on the sheet at 0.05), which is evidence; a contact cell is decoration.

## Type scale

Ratio 4/3 from the 25 px floor: **25 · 33 · 44 · 59 · 79 · 105 · 140** (`derived`, a modular scale; the same series as exhibit, another family). Levels per frame: the gate 79 (an intertitle) or 59 (a label); the sheet 59 · 33; the lock-up 140 · 44 (the line at 59 is gone before the name). At most three outside the frames' own text.

## Frame and grid

1920 × 1080; graphics-safe 96 / 54 px (`standard`). The strip, in strip px at scale k: a cell 860 wide (frame 832 × 468, 28 of frame line), height 660: holes 34 × 48 (r 7) every 86 px at y 16 and 596, the frame at y 96, the optical track at y 577 (16 high) (`derived`). **The gate**: k = 1, the frame registered at x 544–1376, y 252–720 (its centre at 960, 486), four 26 px corners 8 px outside it on the base (decoration); neighbours step back by distance (veil 0.55 × smoothstep(0.1, 0.6, d)). **Labels** under the gate on one baseline, y 950; under the sheet, y 984. **The sheet**: k = 96 / 832 (the same film at 0.115), up to ten rows 84 px apart from y 56 (fewer sit centred), frames from x 432, names right-aligned 34 px before, lengths 26 px after each row's end. **Lock-up**: the name centred at y 560, the address at y 650. Persistent elements: the strip (through-line); no HUD, no timecode, no frame counter.

## Scenes

| Type | Purpose | Beats at 120 (example) |
|---|---|---|
| `titles` | intertitles on the strip; the first scene runs in (2 beats) and carries the hook; one line may light the optical track | 7 (run-in and three lines) · 5 (two lines) |
| `frames` | a pull-down a beat through the films' gate frames, each one's name under the gate | 1 a film (10) |
| `punch` | the last frame to the full frame, held, and into its cell on the sheet | 3 |
| `sheet` | the films as a contact sheet, rows as long as the films; two captions; the lengths | 7 |
| `pick` | the pencil rings a cell; the cell punches to full and the film runs (the climax) | 8 (a 2 s run) |
| `lockup` | a source frame in the gate, the line, the run-out; the name and the address | 16 (takes the phrase rounding) |

Order: `titles` first, `lockup` last; `punch` between a `frames` scene and the `sheet`; `pick` between the `sheet` and the `lockup`. Every composition ≤ 6 s; median 2–3 s. Slots and limits: `assets/templates/strip/TEMPLATE.md`.

## Signature transformations

The moves are pluggable (TEMPLATE.md, Moves): each role is an adapter over a shared hand-off module.

| Transformation | Tier | What it does | Tag |
|---|---|---|---|
| `strip-advance`, `claw` | T0 | one cell in a quarter beat, cubic in-out, landing still and registered; motion-blurred while fast | `borrowed` (shared hand-off) |
| `strip-advance`, `brake` and `run-out` | T2 | the run-in braking onto the first frame (cubic out); the run-out leaving the gate (p^2.4) | `borrowed` |
| `gate-punch` | T2 (in), T1 (out) | a registered frame to the full frame on a log-scale zoom about the shared point; out: the full frame into its place in the next scene, laid underneath while covered | `borrowed` |
| `sheet-pick` | T2 | the ringed contact cell punches to full; the ring stays on the sheet | `borrowed` |
| track light | T0 | the optical track lights, swept left to right at constant speed (a scan, not an ease) | `derived` |
| row pull-out | T0 | the longer strips pull out to their measured lengths, staggered | `derived` |
| grease-pencil loop | T0 | a hand loop, drawn on by arc length in one beat | `derived` |

Not used: `camera-truck`, `bezel-pullback`, `device-flip`, `viewport-push` (the camera is locked; flips are not horizontal transport) and frame-level transitions (the strip is one object; a frame-level transition would cut it).

**Against the nearest references** (principle 10, checked once here; 2026-10-21): the gallery's film-strip reels scroll a strip continuously as decoration behind a headline and fly a wall of outputs as the climax. Shared (2): a strip of frames with sprocket holes; real outputs as the material. Not shared (6): continuous scrolling (here every frame stops registered in a gate), decoration behind a headline (here the strip is the protagonist and no word lies over a frame), a wall of outputs as the climax (here one picked film running at full size), crossfades (here pull-downs and punches), a countdown leader or film-burn look (banned), lengths left unshown (here the sheet's rows are the lengths). Under half.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Claw pull-down | 0.25 beat (0.125 s at 120, about 4 frames), cubic in-out, one cell; lands on the quarter-beat grid, a film's frame on a beat | `draft` |
| Run-in | 2 beats, 3.5 cells, cubic out (from 10.5 cells a second) | `draft` |
| Run-out | 1.5 beats, p^2.4, until the cut end is off the frame | `draft` |
| Punch in | 1 beat, cubic out on the log of the scale | `draft` |
| Punch out | 1 beat, cubic in-out on the log of the scale | `draft` |
| Hold at full size | 1 beat | `draft` |
| Row pull-out | 0.75 beat each, cubic out, 0.1 beat apart | `draft` |
| Pencil loop | 1 beat, cubic in-out by arc length; width 6 px; the other rows step back 0.5 beat after it (ground at 62 %) | `draft` |
| Track light | from 0.4 to 1.15 beats after its intertitle lands, a constant-speed sweep | `draft` |
| Name, address | the name settles from 104 % over 0.4 beat; the address types at 72 characters a second and holds ≥ 3 s; the underline 0.75 beat, 4 beats before the end | `derived` / `draft` |
| Labels | cut in and out on the beat (no fade, no rise) | `derived` |
| Holds | after each landing the picture holds still only once its text has landed; every such stretch is a declared hold (≥ 0.2 s, ≤ 2 beats) | `standard` (principle 5) |
| Motion blur | `lib/canvas.js` `subframes`, shutter half a frame, speed from the strip's position, the punch rect's corners and the rows' ends; labels drawn after, sharp | `borrowed` (system) |
| Ambient | none | `derived` |

## Sound

Bed: the kit's `thread` preset at 120 BPM with `mix: 'v2'` — plucks and a soft kick: a reel's bed (`draft`). The arrangement follows the scenes: the run-in is the intro; the intertitles are a quiet build with the reading drop; the frames build harder; the punch is a break; the sheet's readings build again; under the pick the music rests while the picked film runs with its own sound (decoded from its video when that file is at hand) or drops when it is not; the lock-up is the outro. Effects on the same beats: a dry two-part claw click (a tick and a low rim) on every pull-down; a run of clicks braking at the open and speeding up at the run-out, one per frame line crossing the gate; a soft swell and rising ticks as the track lights; a whoosh with each punch and an impact on the full frame; ticks as the strips pull out and as the lengths print; a pencil tap and a short high scribble on the loop and the underline; a riser, an impact and a rolled chime on the pick; an impact and a chime on the name; keys under the address. Effects sit 4 dB under their nominal gains (sharp clicks pushed the limiter, which the renderer's AAC then overshot). Every key gets a high onset; inside the builds the music takes a 70 ms −6 dB breath before it. Master −14 LUFS, true peak ≤ −1.5 dBTP after the renderer's AAC. The intertitles' optical tracks are drawn from this mix, so the score is written before the picture (TEMPLATE.md, Order).

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here: the `lightbox` box with a soft central glow; a black print strip with ten holes a frame and a variable-area track; the run-in braking onto three intertitles; the track lighting under the second group; a frame a beat with its name under the gate; the last frame punched to full and dropped into the sheet; rows sampled every 4 s, pulled out to their lengths; the carmine loop on one cell; the picked film running for two seconds; a captured page as the last frame; the run-out; the name and the underlined address; Hanken Grotesk with DM Mono; the `thread` bed. The example copy: `Ten ways` / `to film` / `your code.`, `Length follows the content.`, `Pick a style.`

**Banned** (the gallery's film-strip look; a film showing any of these fails P1):
- a strip that scrolls continuously across the screen as decoration, a reel of outputs flying past as the climax;
- frames tilted in perspective, dealt on a curve, on a carousel, in device frames or browser windows;
- crossfades and scale-dissolves between frames, flash frames, film burn, light leaks, gate weave, dust and scratches as filler;
- a projector countdown leader; sepia, "vintage" or any grading of the real frames;
- a word laid over a real frame; tracked uppercase eyebrows, 01 / 02 / 03 numerals, a timecode or frame counter;
- glass cards, neon gradients, an italic or coloured accent word, a whoosh under every move.

Also banned in this mode: a camera move; vertical motion; a frame drifting in the gate; a frame enlarged past the cap; a sampled frame chosen between the 4 s marks to look better (the sheet samples blind); more than one pencil mark moving.

## Don'ts

- Do not scroll the strip continuously between frames: it pulls down and stops (mode principle 3).
- Do not move the camera, tilt the strip or flip a frame (mode principles 1, 2).
- Do not put a label over a frame or an intertitle on the light box (mode principle 5).
- Do not punch a contact cell without the full-resolution frame behind it (mode principle 4).
- Do not change the scene behind a frame while it can be seen: only while a full frame covers it (mode principle 7).
- Do not let the pencil ring more than the pick, or cross a frame on `flatbed` (mode principle 6, contrast).
- Do not sample a contact row anywhere but the middle of each 4 s block (the sheet's honesty is its sampling).

## Checks

- **P0**: `npm run assets` 0 FAIL (hashes; one row cell per 4 s block at the block middles; the zoom cap; the accent rule; with the videos at hand, each frame its source instant and each length re-measured; a capture's `expect` / `forbid` by OCR and no face); `npm run fit` reports no errors (API 3 tiers: T0 gaps ≤ 4 beats, the T2 count, 2–3 peaks with the pick at 60–85 %); `npm run palettes` passes; every read text ≥ 25 px and ≥ 4.5:1 on the box; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL.
- **P1**: one strip on screen end to end; every pull-down lands registered (no drift in the gate); no word over a frame; one pencil mark at a time; T2 (run-in, punch, pick, run-out) spread through the film, ≤ 2 beats each; the banned look absent.
- **P2**: motion blur ends on the landing frame; labels sharp; the optical track drawn from real sound; the gate's corners never over a frame.

## How it differs

**From thread** (the nearest mode by subject: a reel of a video tool). Thread draws everything in one line on a dark ground and shows the tool's *steps* being performed; its contact sheet is one drawn link of the chain. Strip draws none of the pictures: its protagonists are the tool's real *outputs*, on film stock, and the contact sheet is a measurement (rows as long as the films). Thread never shows a real asset; strip's only drawn object is the strip.

**From exhibit** (real assets, one world). Exhibit's camera travels over a desk of mounted prints and turns a ringed region into code-drawn readings; strip's camera is locked and its material moves through a gate, frames are never read or redrawn, and the pencil picks rather than reads. Exhibit is for printed evidence (tables, charts, UI); strip for footage.

**From handset** (one device, the screen changes) and **dossier** (one page at a time, highlighter, worksheet). Both show one asset at a time in a fixed frame and annotate it with words; strip shows a run of frames with their neighbours always in view and annotates nothing but the pick.

**From the code-drawn modes**: every one draws its world in code. Nearest after thread: halftone and morph hold one object while worlds change around it — strip holds the gate while the object moves through it; pulse flips grounds one word a beat — strip advances real frames one a beat.

## Lessons from the sample film (2026-10-21)

1. **Intertitles set the beat grid, not the other way round.** A three-word intertitle needs 0.9 s plus the pull-down, about 2.1 beats, while a hold may last 2: the template puts intertitles on the quarter-beat grid and gives each line its reading plus a pull-down. Write intertitles of two words where the rhythm is tight.
2. **Labels go on after the motion blur.** A label that cuts in on the landing frame of a pull-down is averaged with the frames before it and comes out faint; the labels are drawn once, sharp, over the blurred frame.
3. **The punch is the transition between scenes.** A full frame covers the screen, so the next scene is laid underneath and revealed by the shrink: the gate becomes the sheet and the sheet the closing reel without a cut.
4. **Thin marks need a partner.** The pencil's 6 px loop alone does not register as a picture event at its key; the caption cuts in on the loop's start and the other rows step back on its close.
5. **The optical track is evidence too.** Drawn from RMS (not peak) the films' sound reads as a variable-area track; beside the intertitles it is the film's own mix, which ties "Scored in code." to what is heard.

## Known issues

- The pull-down's middle frames double the intertitles beside the gate for about 1/15 s (motion blur of an 860 px move in four frames); a slower claw costs reading time, a blanking blade would read as a flash.
- The sheet first shows every row at the shortest film's length, then the longer ones pull out: deliberate, but the first half second is not a reading.
- Contact cells (96 × 54) are texture; a film that needs a cell read must punch it.
- Without the picked film's video at hand the run is silent under the drop; with it, its two seconds of sound are placed by tempo, not by ear.
- `lightbox-blue`, `flatbed` and `perfs: 'single'` have been rendered as stills only, not judged; the cut-down (`edges: 'cut'`) has no climax, which `npm run fit` reports as a warning.
- Hanken Grotesk and DM Mono have not been compared against the system's families in a film.
