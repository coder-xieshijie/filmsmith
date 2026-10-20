# Morph (`morph`)

One ink shape that never leaves the frame and is promoted one dimension per scene — a point, a line, a plane, a solid, an interface, a mark — with no cuts; a violet accent marks only the part that is changing now and is handed on like a baton. Aesthetic anchor: "like an API's whole docs site drawn in one stroke, without lifting the pen".
Theme: tech-product-launch · Template: `assets/templates/morph/` · tempo 112–128 BPM, default 120 (length follows the copy; the shipped example fits 16 bars = 32.0 s) · timing API 3 · Status: owner-accepted 2026-10-19 (batch 4 style sample: "这个非常帅，我很喜欢。"; the sample's interface text was too small and its logo generic, both rebuilt here, see Known issues); template 2026-10-19

## Fits / does not fit

Fits: the launch of a developer tool or an interface product whose story is "one thing becomes the whole product": one spec becomes the docs, one schema the SDKs, one component the design system, one request the console (30–45 s); a version or feature sting cut to 10–12 s. The chain ends on the product's real interface at main size and its real mark, so the film needs both: an interface state worth showing (a docs page, a console, a settings panel) and a mark that can be drawn as 3–8 rectangles and a dot.
Does not fit: a product with no interface to unfold into (a library with no UI: ink or phosphor); a system of many parts and flows (blueprint); several numbers (tally); a mechanism the viewer must follow step by step (trace); a film that needs to cut between unrelated worlds (the mode has no cut); a product whose mark is a photograph, a mascot or a script logo (the mark is drawn from rectangles); copy longer than five primary words a state.

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **A developer tool that turns one source into a whole product surface, 30–40 s** (best fit) | `quillstack`, docs from one API spec: a point becomes the baseline of `GET /v2/invoices/{id}`, the request pill, the response card, the schema; the card becomes a hexagon and three lines make it the spec cube (5 endpoints, 5 schemas, 4 SDKs); the cube unfolds into the docs page, the page gathers into one card with python / node / curl, Run floods the frame into the live console ("Docs that run."), the card splits into the nib mark (the shipped example, 32 s) | `point` → `line` → `press` → `card` ×2 → `solid` → `unfold` → `focus` → `flood` → `mark` |
| Version or feature sting for a reel, 10–12 s | `quillstack 2.4` adds a Go SDK: the spec cube, the docs page, the mark with `npx quillstack build` | `solid` → `unfold` → `mark` (the short cut) |
| An API client or console, about 20 s | `relay`, a request runner: the request line, the pill, Send, the response card, the console (Run floods it), the mark; `corners: 'cut'` for a harder, tool-like voice | `point` → `line` → `press` → `card` → `mark` |
| A design system or component library, 25–35 s | `tessera`, components from tokens: the token line, the button pill, the card, the schema of its props, the cube of its packages, the docs page, the mark | `line` → `press` → `card` ×2 → `solid` → `unfold` → `mark` |

Best fit: the mode's signature is the dimension climb itself (plane → solid → interface), and "one source becomes every surface" is the one story in which that climb is literally true: the response card really is the schema, the schema really is part of the spec, and the spec really generates the page.

## Mode principles

1. **One shape, never lifted.** One ink shape is on screen from the first frame to the last and every scene starts on the exact frame the previous one ended (checked pixel for pixel by the hand-off check). There are no cuts and no cross-dissolves; content inside a container leaves before the next content enters (container transform). *(Narrows 4, transform along a relation the content has, and 7, a through-line object; object constancy, Heer & Robertson 2007; good continuation, Wertheimer 1923.)*
2. **Every scene adds a dimension, and the dimension is the content's.** Point → line (the endpoint's baseline) → plane (request, response, schema) → solid (the spec) → interface (the generated page) → mark. A move up a dimension happens only where the content really grows (the schema is part of the spec; the spec generates the page); a scene that does not add a dimension changes what the same shape means (the response card re-read as its schema). *(Narrows 4 and 9: the style points at the content.)*
3. **One ink, one material, one accent that marks the change.** Light cool ground, one near-black ink and its three tones on the solid; no second material except the console, which is the same card drawn in the ink (the flood's inside), and no three-ink swaps (paper → blueprint → hologram). The accent marks only the part changing now and passes on as a baton: point, line, swapped token, action chip, type chips, the cube's three lines, the front face, the nav highlight, the tab highlight, Run, the console's status, the mark's dot. *(Narrows 7, one accent, one meaning; the departure from the nearest reference's three inks is this mode's reason to exist.)*
4. **The interface is shown at main size.** The page is an overview (information text 28–44 px); the film then gathers it into one card whose title and code are 55 px, so every word the viewer is asked to read meets the main-text floor. *(Narrows 1, readable before beautiful; owner 2026-10-19: the sample's interface text was too small.)*
5. **The mark is the product's, drawn from content.** The last shape is the product's real mark, given in `content.js` as rectangles and a dot on a 30 px grid; the previous scene's pieces fly into its parts and the point lands as its dot. No stock logo, no generic bars. *(Narrows 2, exact words, numbers and logos are drawn in code; owner 2026-10-19: the final logo must be the product's real mark.)*
6. **The four tiers, on the dimension climb.** A micro change on about every beat (T0); a new composition every 2–3 s (T1); the three dimension upgrades in the middle are the expressive transitions (stroke-reinterpret, net-unfold, shape-flood), about one every 4–6 s of the middle third and each used once (T2); three peaks: the point's landing, the claim inside the flood, the point landing in the mark (T3). *(Narrows 5, the four tiers, owner-approved 2026-10-19.)*
7. **No decoration that is not the product.** No mascot, no corner figure or beat labels, no dashboard of the film's own data, no start-to-end loop; every number on the page is computed from `product`. *(Narrows 2 and 10; the nearest reference's signature motifs, see Signature transformations.)*

## Palette presets

| id | name | fits | ground `bg` | `paper` | ink `fg` | `dim` | `line` | accent | console `inkDim` / `inkAccent` |
|---|---|---|---|---|---|---|---|---|---|
| `slate` | Slate and violet (source) | default; developer tools, docs, APIs | `#EDEFF2` | `#F8F9FB` | `#15171A` | `#5F656D` | `#C3C9D0` | `#6A3DF0` | `#9AA0A8` / `#8C6CFF` |
| `azure` | Slate and blue | infrastructure, data platforms, enterprise developer products | `#EDEFF2` | `#F8F9FB` | `#15171A` | `#5F656D` | `#C3C9D0` | `#1F55E0` | `#9AA0A8` / `#7FA0FF` |
| `night` | Night | night launches, terminals and consoles; the ground is ink and the console turns light | `#121418` | `#1B1E23` | `#E8EBEF` | `#8D939B` | `#2C3036` | `#9C80FF` | `#585E66` / `#6A3DF0` |

`onAccent` (text on the accent) is the ground in every preset. Checked by `npm run palettes` against what is actually behind each text: body and label text ≥ 4.5:1 on the ground, the panels, the ink shape and the console card; the accent ≥ 3:1 as a graphic; the console's status line (`inkAccent`, 44 px semibold, large type) ≥ 3:1 on the console card. Weakest pairs: `slate` `inkAccent` on the console card 4.23, `dim` on ground 5.11; `azure` `dim` on ground 5.11; `night` `inkAccent` on the console card 4.40, `inkDim` on it 4.85 (deepened from `#5E646C`, 4.43, 2026-10-19). Ground, ink and violet are the batch-4 sample's draft palette (`owner`, accepted with the sample 2026-10-19), except `dim`: the sample's `#7C828A` measured 3.37:1 on the ground, so the default deepens it along the same grey to `#5F656D` (`derived`). The ground sits near L* 95, a cool grey that keeps the ink's three tones apart (`derived`).

## Variants

**Colour**: the three presets above (`slate` default; `azure`; `night`).

**Form: `corners`**, the corner geometry of every container the shape becomes (pill, card, chips, the page's panels, the focus card, tabs, Run, the flood's outline, the mark's parts). The point stays round; the hexagon and the cube are geometry. Timing, choreography, sound, colours and type are the same (2026-10-19, rendered and checked, not yet seen by the owner).

| `corners` | What changes | Choose it for | Source |
|---|---|---|---|
| `round` (default) | circular arcs; the pill is a full stadium | most films; friendly, product-UI voice | the approved sample (`owner`); the rounded corner family of Material's shape system (`borrowed`) |
| `cut` | the same corners chamfered at 45°, cut length 0.82 × the radius (the same visual weight as the arc) | security, infrastructure, hardware-adjacent or CLI-first tools; a harder, machined voice | the cut corner family of Material's shape system (2018, `borrowed`); chamfered edges in technical drawing (`standard`) |

Why corners and not another axis: the shape is the mode's protagonist, so its silhouette is the one form choice that changes every frame while keeping the chain, the one ink and the accent's role; a second material or stroke style would break principle 3.

## Accent role

- **Accent** (`accent`) marks one kind of thing: the part of the shape changing now. It travels as a baton (principle 3) and is never on two unrelated things at once; text it carries is set in `onAccent`. As a mark it stays small: measured on the example, the median frame has almost none and the most is 0.9 % (26.5 s, Run as the console retracts into it; `check-film`, 2026-10-19).
- **Console accent** (`inkAccent`) is the same role on the ink ground: the console's status line, the one changing line inside the flood.
- **Change of ground**: the flood turns the whole frame to the ink (the console) for up to two bars, then retracts into Run; the ground never becomes the accent.
- No status, category or effect colours. A `4xx` status would still be set in `inkAccent`, as the changing part, not in red.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Captions and the claim; the name in the lock-up | Inter Tight 700 | OFL | 86; 135 |
| Card and page titles, the focus title, the action chip, Run, the tagline | Inter Tight 600–700 | OFL | 55; 44 |
| The endpoint line; code; response and body lines; the command | IBM Plex Mono 500–600 | OFL | 69 (the line); 55 (code in the focus card); 44 (body, status, command) |
| Page and card labels: nav rows, tabs, chips, face labels, the file name | IBM Plex Mono 500–600 | OFL | 35; 28 |

One sans in two weights plus one mono (system pairing rule). Information text ≥ 28 px, main text ≥ 44 px; nothing on screen is smaller and no text is decoration. Primary copy (captions, claim, the focus card's code, the status line, the lock-up) is never below 44 px; 28–35 px is used only on the docs page overview and for labels that are glanced at. Sizes `derived`; Inter Tight `borrowed` (the sample).

## Type scale

28 × 1.25ⁿ: **28 · 35 · 44 · 55 · 69 · 86 · 135** (`derived`; ratio 1.25, the smallest step that still counts as a level; 107 is skipped so the name stands apart from the captions). Levels per frame: line 69 (1); press 69 + chip 44 (2); response card 44 (1); schema card 55 + 44 + chips 35 (3); solid caption 86 + face labels 35 (2); focus card 55 + 44 + tabs 35 (3); lock-up 135 + 44 (2). Two frames add one label level, as principle 3 allows a table or interface page: the docs page (caption 86, panel text 44 / 35 / 28) and the console (claim 86, the card's 55 / 44 / 35): both are the product's real interface, whose own labels are the information.

## Frame and grid

1920 × 1080. Margin 120 px. The chain works on the centre axis (x 960): the point at (960, 560), the line's baseline at y 534, the response card 1000 × 600 at (460, 240), radius 36. From the solid on, copy sits left (captions at x 120, baselines 470 and 580, ≤ 640 px wide) and the shape right: the hexagon and the cube centred at (1300, 560), radius 210; the docs page's six panels inside x 792–1800, y 96–984 (header, nav, reference, body, response, SDKs; radius 20). The focus card 1520 × 640 at (200, 120), radius 28; Run 236 × 92 in its lower right; the claim centred, baseline 930. The mark is drawn on a 30 px grid and centred with the name, 72 px apart. No persistent HUD: the shape is the persistent element. A fixed seeded grain tile (256 px) at 5 % overlay. Content area for measurement: the whole frame. Deliberate overlaps: the line's text knocked out of the pill's ink (it is the same text); the console's claim set below the card on the ink ground.

## Scenes

| Type | Purpose | Length (120 BPM, example) |
|---|---|---|
| `point` | Opens (T3 hook): the accent point swells and lands on beat 1 | 1.0 s |
| `line` | The point shoots into a line; the endpoint rises out of it as its baseline; one token swaps in the accent | 2.5 s |
| `press` | The line thickens into a pill around its own text; the action chip takes the accent and is pressed | 2.0 s |
| `card` | The pill grows into the response card (status, body); or the same card re-read as its schema (type chips) | 2.5 s each |
| `solid` | The card's outline morphs into a hexagon; three lines make it a cube (T2); caption and three counted faces | 4.0 s |
| `unfold` | The cube unfolds into the docs page (T2); the second caption; the highlight jumps to the endpoint | 2.5 s |
| `focus` | The six panels gather into one card at main size: title, language tabs, code, Run takes the accent | 4.0 s (3 tabs) |
| `flood` | Run spins to the bar line and floods the frame into the live console (T2); status, body; the claim (T3 climax, a pause); the console retracts | 5.5 s |
| `mark` | The shape splits into the mark's parts; the point lands as its dot (T3 lock-up); name, tagline, the command; second move on the last downbeat | 5.5 s, a rest that takes the bar rounding |

Slots, limits, the order rules (`FOLLOWS`) and the per-type timing: `TEMPLATE.md`. Length follows content (`lib/timing.js`, API 3): ≤ 5 primary words a state, a phrase of one bar, the flood and the claim on bar lines. The shortest cut: `solid` → `unfold` → `mark` (with the closing command), 12.0 s at 120 BPM, 11.25 s at 128 (2026-10-19).

## Signature transformations

- **point → line** (T0): the point shoots out into the line in 0.34 s (exponential out) and hands its colour to the ink over 0.16 s; the text rises out of the line, so the line reads as its baseline (sources fused: a point drawn into a baseline and the line promoted scene by scene, two liked films). `borrowed` grammar.
- **line → pill** (T1): the line thickens upward around its own text, the text knocked out of the ink; the swapped token gives the accent to the action chip. `derived`.
- **container transform** (pill → card, page → focus card): width, height and radius on critically damped springs; the old content leaves first (0.1 s, 12 px blur), the new enters after; never two contents at once (Material container transform; sources: a liked film's container morph). `borrowed` grammar, `derived` values.
- **re-read** (card → schema): the same card, the header turns into the schema's name, type chips rise beside the values; nothing moves but the meaning. `derived`.
- **outline morph** (card → hexagon): the card's outline and the hexagon's are resampled at the same arc length from the same start point and interpolated in 0.38 s (shape blending, Sederberg & Greenwood 1992). `borrowed`.
- **stroke-reinterpret** (hexagon → cube, T2): three accent lines from the centre turn the flat hexagon into a cube with no movement at all; the faces then take three tones of the ink (Y-junctions as 3-D cues, Huffman 1971, Clowes 1971; `lib/handoffs` `stroke-reinterpret`). `borrowed`.
- **net-unfold** (cube → page, T2): the cube unfolds about its front face into a flat cross (1 beat) and the six squares slide and stretch into the docs page's six panels (1 beat); the panels fill on beat 2 (staged transitions, Heer & Robertson 2007). The page is the product's real layout, not a dashboard. `borrowed` grammar, kept in the template (the module paints a light box and round panels).
- **shape-flood** (focus → console, T2): Run is pressed and spins until the next bar line; on it, Run's own outline grows exponentially over one beat until it covers the frame, and inside it the same card is already drawn in the ink: the live console, registered exactly (`lib/transitions` `shape-flood` by id, drawn as a canvas clip of Run's `corners` outline). After the claim it retracts into Run in 1.25 beats. `borrowed` grammar, `derived` values.
- **converge-mark** (→ mark, T3): the previous shape splits into the mark's parts (the page's six panels, or the card cut into a grid), which fly on bowed arcs and fill with ink; a target ring draws; the point grows out of the last accent element, hops in and lands as the mark's dot on beat 2 (sources fused: pieces converging into a mark, a liked film; the point as the protagonist, the ink mode's dot). `borrowed` grammar, `derived` values.

**Against the nearest reference** (principle 10: the mode's fixed grammar, checked once here; 2026-10-19). The nearest reference is a liked launch film in which one pencil line is promoted three times — graphite on paper, wire on a blueprint, light on black — and never leaves the screen. Shared grammar (5): one shape that never leaves the frame with no cuts; a point becoming a line; stroke-reinterpret (hexagon → cube); net-unfold; pieces converging into a mark. Not shared (9 of its motifs): the three inks and their materials, the pencil line, the mascot, the corner figure and beat labels, the dashboard of the film's own data, the start-to-end loop, words pressed into the line, the twin slot rails, a polygon sequence one shape a beat. Here the chain is the product's own (request → response → schema → spec → docs → console), the climb is by dimension, not by material, and the film ends on the product's interface and mark; the mode shares 5 of 14 motifs, under half.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Point | radius 22, swells from 45 % over 0.25 s (cubic out) to land on beat 1; squash 10 % decaying e^(−14t), 40 rad/s | `derived` |
| Point → line | 0.34 s exponential out; ink takes over from the accent 0.36–0.52 s | `derived` |
| Text in | rises 1.1 × its size through its baseline mask on a critically damped spring (ω 22), from its beat | `derived` |
| Text out | down through the mask, 0.12–0.16 s, faster than in | `derived` (principle 5) |
| Token swap | out 0.16 s; the new token in on a spring (ω 22) 0.14 s later, on an accent chip that settles into the ink | `derived` |
| Pill growth | height ω 14, width ω 22 (critically damped) | `derived` (2026-10-19, softened so the hand-off stays continuous) |
| Container transform | rect and radius on a spring (ω 18); old content out in 0.1 s with a 12 px blur, new content in over 0.15 s | `borrowed` (Material container transform) / `derived` |
| Outline morph | 0.38 s cubic in-out, equal arc length, 4 px ink stroke | `borrowed` (Sederberg & Greenwood 1992) |
| Stroke-reinterpret | three accent lines from the centre (`lib/handoffs`), 4 px; faces tone in from beat 2.6 | `borrowed` (system) |
| Net-unfold | unfold 1 beat cubic in-out about the front face; slide 1 beat; panels fill over 0.24 s, staggered 40 ms | `derived` |
| Tab highlight | leading edge first, trailing edge 0.14 later, 0.36 s (`lib/handoffs/container-morph.js` `leadingEdges`) | `borrowed` (system) |
| Run press and spin | press 5 % on a spring (ω 34); a spinner at 1.6 turns a second until the flood (a constant-rate process: it shows time) | `derived` |
| Shape-flood | Run's outline scaled exponentially (progress^2.2 on a log scale) over one beat to 1.15 × the frame; retract 1.25 beats cubic in-out | `derived` (exponential zoom reads as constant speed, van Wijk & Nuij 2003) |
| Converge flights | quadratic arcs bowed 18 % of the distance, alternating sides; 0.24 s + distance / 3800 px/s, staggered 20 ms; pieces fill paper → ink as they fly | `derived` |
| Point hop | 0.28 s on an arc 240 px above the higher end, cubic in-out; lands on beat 2 with a 12 % squash | `derived` |
| Name wipe | out of the mark's edge, 0.28 s exponential out | `derived` |
| Command typing | 60 characters a second with a caret; holds ≥ 3 s | `derived` (principle 1: the closing command ≥ 3 s) |
| Second move | on the last downbeat the mark's rows press 8 px in 0.2 s, 30 ms apart | `derived` |
| Motion blur | `lib/canvas.js` `subframes` (exact, shutter 0.5): 7 sub-frames in every fast window, 12 during the hop | `borrowed` (system) |
| Grain | one seeded 256 px tile, 5 % overlay, fixed | `derived` |
| Ambient | none: every change sits on a beat | — |
| Tempo | 120 BPM default (112–128) | `owner` (the sample's tempo, accepted 2026-10-19) |

## Sound

Bed built in `score.mjs` from the shared voices (no kit preset fits): E major, one chord a bar (Emaj9 · C#m9 · Amaj7#11 · B7sus4), a soft pad, a plucked eighth-note "glass" arpeggio, a muted kick and offbeat hats that thicken with the dimension (line < plane < solid < interface). Intro under the point and the line (pad, one pluck a beat, a soft pulse); build from the pill; a breath under the focus card's code (the arpeggio rests while the viewer reads); a riser through Run's spin; the drop on the flood's bar line (four on the floor, claps, sixteenth hats, bass on every beat) until the retract; an outro of felt keys and the pad under the mark. Effects on the same frames: a pluck as the point lands; a whoosh as it shoots out; a pop and a bell on the swap; a thud under the pill; an impact as the card lands; ticks on each type chip; an impact and a chime on the cube's three lines; a whoosh through the unfold and a pop on the highlight's jump; a pluck on each tab; an impact and a clap on the flood; a bell on the status; an impact and a chime on the claim (a duck before it); a chime and a bell as the point lands in the mark; soft type keys under the command. Every key event has a short click and a low body on its frame. Master −14 LUFS, true peak ≤ −1.5 dBTP, `tone: 'v2'`. Not yet confirmed by ear.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here.

- The `slate` preset: cool grey ground, near-black ink, violet.
- Inter Tight 700 captions on the left, the shape on the right, from the solid on.
- The chain point → line → pill → response card → schema → hexagon → cube → docs page → focus card → console → mark.
- The two-part caption ("One spec in." / "Every doc out.") either side of the unfold.
- The six-panel docs page (header, nav, reference, body, response, SDKs).
- Run flooding into the console with the claim under the card.
- The mark lock-up with the name to the right and a typed command below.
- The E-major glass bed at 120 BPM with a drop on the flood.
- The example copy: "quillstack", a made-up docs tool (`GET /v2/invoices/{id}`, `inv_8KQ2`, `200 OK · 84 ms`, `Invoice`, `One spec in.`, `Every doc out.`, `Retrieve an invoice`, `Docs that run.`, `docs from one spec`, `npx quillstack build invoices.yaml`).

## Don'ts

- Do not cut, cross-fade or start a scene from anything but the previous scene's last frame (principle 1); a scene that cannot grow out of the last one belongs in another mode.
- Do not add a second material or ink (paper → blueprint → hologram): the climb is by dimension (principle 3), and three inks are the nearest reference's signature.
- Do not put the accent on two things, on a word for emphasis, or on a ground (principle 3; core principle 7).
- Do not leave the interface at overview size: what the viewer must read goes on the focus card at ≥ 44 px (principle 4).
- Do not use a stock or generic logo; the mark's parts come from the product (principle 5).
- Do not add a mascot, corner figure or beat labels, a dashboard of the film's own data, or a loop back to the first frame (principle 7).
- Do not type a count, a status or a body the product does not have: they are computed from `product` (core principle 2); illustrative values say so in the README.
- Do not lengthen a scene by hand before the flood (`bars`): the flood's bar line is computed from the scenes before it (TEMPLATE.md, Length).

## Checks

- **P0**: `npm run fit` reports no errors (API 3 tiers: ≤ 5 primary words a state, the claim in a pause, holds 0.2 s–2 beats, 2–3 peaks with the climax at 60–85 %, the registry order); `npm run palettes` passes; no red banner (no text wider than its panel or column); every hand-off is pixel-continuous (no jump between a scene's last frame and the next one's first); every count, status and body line comes from `product`; the mark is drawn from `product.mark`; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL.
- **P1**: something changes on about every beat; each key event has its sound on the same frame; the flood and the claim land on bar lines; the run into the claim is the shortest stretch and the mark a release; the accent is on one thing at a time; the focus card's code reads at 55 px; no run of four equal scene lengths.
- **P2**: the outline morph has no twist (the start points align); the cube's three tones stay apart (and invert correctly in `night`); the flood's edge stays the exact shape of Run in both `corners`; no ghost of the old content during a container transform; the point's hop lands inside the ring; the grain is constant.

## Known issues

- **Interface size** (owner, 2026-10-19: the interface text must be legible): the page is now an overview at 28–44 px and the focus card carries the reading at 55 px; awaiting the owner's look.
- **Mark** (owner, 2026-10-19: the logo must be the product's real mark): the generic three bars are replaced by `product.mark`; at 30 px a grid unit, a mark with fine detail (a slit under a unit) loses it, so marks are drawn as 3–8 rectangles. The example's nib is made up.
- **Converge mapping**: pieces are matched to parts in reading order (row by row); a mark whose parts are far from that order crosses its flights. Not yet seen with a mark other than the example's.
- **Flood start**: the flood finds its bar line from the scenes' computed needs; a hand `bars` on an earlier scene breaks that and leaves Run spinning too long or too short.
- **Sound**: true peak sits 0.1–0.4 dB under −1.5 dBTP; an FM bell over the drop's hats once pushed the AAC encode over −1 dBTP and the renderer lowered the whole mix 1.2 dB (2026-10-19). Bells over the drop use a low FM index; check the render log for "Audio lowered". Verified by levels, onsets and loudness only, not by listening.
- **Short cut**: `solid` → `unfold` → `mark` fits with two shape warnings a three-scene reel cannot avoid (no accelerating or decelerating run, no climax), and needs the closing command (without it the three lengths vary too little).
- **Variants**: `corners: 'cut'` and the `azure` and `night` presets have been rendered and checked (cut: `check-film` PASS) but not judged by the owner.
- **Library** (2026-10-19): stroke-reinterpret, the arc-length paths, `leadingEdges` and `subframes` come from the shared runtime; net-unfold, converge-mark, the container transforms and the flood stay in the template because the modules draw round corners, light materials or circles only (TEMPLATE.md, Library and local code).
