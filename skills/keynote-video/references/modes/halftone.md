# Halftone (`halftone`)

A two-ink print in motion: newsprint, one black plate and one process ink; dots that vary in size, never in grey; one anchor — a piece of the product's mark, printed in the process ink — holds one point of the screen while every world is printed round it, until the camera pulls back and the anchor lands in the whole mark. Aesthetic anchor: "like a newspaper's launch-day insert watched through a loupe, pulled back to arm's length on the last beat".
Theme: tech-product-launch · Template: `assets/templates/halftone/` · tempo 112–128 BPM, default 120 (length follows the copy; the shipped example fits 16 bars = 32.0 s) · timing API 3 · Status: owner-accepted 2026-10-19 (batch 4 style sample; the first screen's dot grid was judged too dense and is rebuilt here, see Known issues); template 2026-10-19

## Fits / does not fit

Fits: the launch or teaser of a model or a product that has a mark: a few features, one number, the name (30–45 s); a version sting cut to 8–12 s; any product whose mark has a detail that can stand alone at 220 px (a dot, a capsule, a stroke end, a tool tip, a counter). The mode is chosen by form, so at least one scene is drawn from a real technical artefact of the product (principle 9): a `card` with `mono: true` carrying a real command, a transcript line, a token, a log row; the number in the `count` comes from the product's own measurement.
Does not fit: a product with no mark, or a mark with no detail that holds alone (the anchor is the through-line; without it the mode is cards on paper); a workflow with parts and flows (blueprint); many numbers (tally); a terminal tool whose look is its UI (phosphor); anything the viewer must read for more than five words at a time; films over about 45 s (one anchor and seven fields carry about a dozen scenes before they repeat).

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **Model or product launch: features, one number, the name, 30–40 s** (best fit) | `parley-2`, a speech model: one microphone in a room where everyone talks; the voices interfere, come apart into cells, are counted (12), quantize into rows of words, three real transcript lines from two voices (the same voice twice draws the same waveform), live, on the device; the room collapses into the capsule, which speaks the claim; pull-back: the capsule and the rings were the mark (the shipped example, 32 s) | `hook` → `card` ×2 → `count` → `card` ×6 → `claim` → `lockup` |
| **Text model launch, same chain, its own mark** (alternate example) | `quire-3`, a text model that reads a whole archive and cites the page behind every sentence: the anchor is a text cursor, the mark three lines of text ending at it; the archive scrolls past as rows, one clause is found in a cell, 14 sources multiply, quantize into cited rows, a real prompt and answer in mono, the answer streams; the archive collapses into the cursor; pull-back: the cursor stands at the end of the mark's last line (`assets/templates/halftone/examples/text-model.content.js`, 32 s; copy it over `content.js`). The anchor is whatever `mark.accent` draws: TEMPLATE.md, The mark, says how to draw another product's | `hook` → `card` ×2 → `count` → `card` ×5 → `claim` → `lockup` |
| Version sting for a reel, 8–12 s | `squash 3`, a compression library whose mark is a pressed square with a cyan corner: the corner on frame 0, one card (`grid`: blocks packed), pull back to the mark and `squash 3` (`edges: 'cut'`) | `card` → `lockup` |
| One number with its proof, about 20 s | `tessel`, a build cache: the cache hit dot of its mark is the anchor; `count` 0 → 94 % of steps skipped, a `card` with the real command `tessel run build` in mono, the claim, the mark | `hook` → `count` → `card` → `claim` → `lockup` |
| A rename or a new mark | a database renamed `keel`: the keel's tip is the anchor; the old name's field quantizes into the new one, the pull-back reveals the new mark | `hook` → `card` → `card` (`quantize`) → `lockup` |

Best fit: the mode's two signature devices — the anchor held while the worlds swap, and the pull-back that makes the anchor part of the whole mark — are both about a mark, and "a few features + one number + the name" gives the T0–T3 rhythm enough material to run a dozen compositions round one point.

## Mode principles

1. **One anchor, one point.** The anchor (`mark.accent`) sits on one screen point, (1440, 540), at one size (220 px high; the hook 1.45×) from the first frame to the lock-up's pull-back; every scene is laid out round it and every transition happens round it: fields radiate from it, fronts run out of it, discs open from it, worlds collapse into it. It never moves to make room for copy. *(Narrows 7, a through-line object; a fixed fixation point needs no re-orienting saccade, persistent element in Material motion.)*
2. **Dots carry the tone; grey does not exist.** Every tone is printed as an AM screen on the plate's grid: the dot's area is the tone. The black plate at 45°, the process ink at 15° (30° apart, the pair that keeps the rosette fine). No gradient, blur-as-shading, glow or transparency stands in for a tone; motion blur is the only soft edge, and only while something moves fast. *(Narrows 6, texture; the material is the print.)*
3. **Fields are functions, not pictures.** A field is one generating function round the anchor (concentric rings, interference, cells, rows, a waveform, a grid); a scene change alters its parameters (another source, a cell boundary, a quantization) along a front from the anchor, so the dots resize and nothing cross-fades. The field is chosen for what the scene says (TEMPLATE.md, Fields). *(Narrows 4, transform along a relation the content has; ordered dither and halftone, Bayer 1973, Ulichney 1987.)*
4. **The paper breathes.** A field peaks at tone 0.5, fades out 560 px from the anchor and never enters the text column; the opening prints coarser (24 px) and lighter (peak 0.36), three rings round the anchor and paper everywhere else. Measured on the shipped example: 1–10 % of the frame is ink, type included (the batch-4 sample's first screen: 42 %). *(Owner, 2026-10-19: the first screen's grid was too dense and filled the frame; narrows 3, one protagonist per frame.)*
5. **The accent is the anchor.** The process ink prints only the anchor (and, at the end, the anchor inside the mark). Type, fields, rules and emphasis are black or paper. *(Narrows 7, one accent, one meaning.)*
6. **Something changes on every beat; the devices stay rare.** Inside a scene the field steps on every beat (T0); scenes change every 1.5–3 s (T1); the expressive devices — invert, quantize, collapse, slam, pull-back — come about once every 8–12 s, none more than three times (T2); three peaks: the hook's landing, the claim, the lock-up (T3). *(Narrows 5, the four tiers, owner-approved 2026-10-19.)*
7. **Print logic everywhere.** Type knocks the plate out round itself; the anchor knocks the black plate out under itself (a 3 px trap); a second move is a press impression (dot gain), not a bounce. *(Narrows 2, precision: the picture is consistent with one physical process.)*

## Palette presets

| id | name | fits | paper `bg` | ink `fg` | `dim` | `dimInk` | accent |
|---|---|---|---|---|---|---|---|
| `cyan` | Process cyan (source) | default; models, developer tools, launches | `#F1EDE4` | `#141414` | `#6E6A62` | `#A39E94` | `#0090CC` |
| `magenta` | Process magenta | consumer and media products; louder, warmer | `#F1EDE4` | `#141414` | `#6E6A62` | `#A39E94` | `#E4007C` |
| `reverse` | Reverse (ink paper) | night launches, infrastructure, security: the whole film reversed out of black | `#141414` | `#F1EDE4` | `#A39E94` | `#68645C` | `#0090CC` |

Checked by `npm run palettes` (`standard`): type on both grounds ≥ 4.5:1 (fg on bg 15.8, dim 4.61 (reverse 6.91), dimInk on fg 6.91 (reverse 5.04)), the anchor ≥ 3:1 against both grounds, because it sits on both (cyan 3.07 on paper, 5.14 on ink; magenta 3.92 / 4.03). Paper, ink and dim are the batch-4 sample's draft palette (`owner`, accepted with the sample 2026-10-19). The sample's cyan `#00A3E0` measured 2.46:1 on the paper, under the 3:1 graphics floor (principle 1; the standard decides at layer 1), so the default deepens it along the same hue (197°) to `#0090CC`; magenta is process magenta deepened the same way (`derived`). The process inks are approximations of the ISO 12647-2 primaries' hues on newsprint (`borrowed`), not measured solids.

## Variants

**Colour**: the three presets above (`cyan` default; `magenta`; `reverse`).

**Form: `dot`**, the shape every halftone mark is printed in (fields, the anchor, the mark); type, blocks, timing and layout are the same (2026-10-19, not yet seen by the owner; the default renders exactly as the template did before the field existed).

| `dot` | What changes | Choose it for | Source |
|---|---|---|---|
| `round` (default) | round dots, area = tone; neighbours touch at 78.5 % and the cell closes at 100 % | most films; the newsprint look | the AM round-dot screen of offset printing (`standard`); the sample (`owner`) |
| `square` | square dots turned with the screen, side = pitch · √tone; corners touch at 50 % | a harder, more mechanical voice; products about pixels, packing, storage; it rhymes with the quantized blocks | the square-dot screen of offset practice (`standard`) |
| `line` | a line screen: each row of cells prints as one line whose thickness is the tone | finance, security, anything that wants the banknote or certificate engraving; rings become hatched bands | the engraver's line screen, intaglio security print (`borrowed`) |

Why the dot shape and not another axis: it changes the silhouette of every mark in every frame while keeping the screen angles, the rulings and the one-ink-plus-black palette; the ruling is a legibility value (Motion), and a third ink would be a second accent.

## Accent role

- **Accent** (`accent`, the process ink) marks one thing: the anchor, the part of the product's mark that runs through the film, and the same part inside the mark at the lock-up. It never marks a word, a field, a state or emphasis. As a mark it covers 1–2 % of the frame (measured on the example: median 0.4 %, max 2.1 % at the push-in, 2026-10-19); it never becomes a ground.
- **Change of ground** is black ↔ paper (`invert`, `whip` across grounds, the `slam`'s paper exposure), never the accent.
- No status, category or effect colours.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Card word, hook and claim lines, count, name | Bricolage Grotesque 800 | OFL | card word 178 (floor 131), hook and claim lines 131 (floor 96), count 242 (floor 178), name 178 (floor 131) |
| Lines under them, the lock-up line | Bricolage Grotesque 500 | OFL | 52 |
| Labels (glance); artefact lines (`mono: true`) | IBM Plex Mono 500 | OFL | 28; 52 |

One bold sans in two weights plus one mono (system pairing rule). Information text ≥ 28 px; main text ≥ 52 px; nothing on screen is smaller, and no text is decoration. Type knocks the plate out round itself (7 % of its size), so dots never touch a glyph; a word that runs into the field's fade-in band (x 1060–1130) stays readable on paper. Sizes `derived`; Bricolage at 800 `borrowed` (the sample). Caution: thread uses the same family for its display type; the two modes never share a film.

## Type scale

28 × 1.36ⁿ: **28 · 38 · 52 · 71 · 96 · 131 · 178 · 242** (`derived`; ratio 1.36, between √2 and the plakat ratio, so three sizes per frame stay ≥ 1.25 apart). Levels per frame, at most three: card label 28 + word 178 (131) + line 52 (3); count label 28 + value 242 + line 52 (3); hook label 28 + lines 131 (2); claim 131 (1); lock-up name 178 + line 52 (2). Auto-fit only steps down the scale (one step), never between its values.

## Frame and grid

1920 × 1080. Text column x 150–1130 (150 px left margin); fields right of x 1060, fading in over 140 px; the anchor at (1440, 540). Baselines: label 380 (hook 330), card word 590, line 680; count value 610, line 700; hook and claim lines 520 and 520 + 1.08 × size; lock-up name at 540 + 0.36 × size beside the mark, line 92 px below. The mark at the lock-up is 405 px high, centred with the name. No persistent HUD: the anchor is the persistent element. Paper tooth: one fixed seeded grain tile, overlay 5 %. Content area for measurement: the whole frame. Deliberate overlap: a card word may enter the field's fade-in band, knocked out of the plate.

## Scenes

| Type | Purpose | Length (120 BPM, example) |
|---|---|---|
| `hook` | Opens (T3): the anchor rises in and lands on beat 1 with a stamp and a contact wave; the opening's light ring field; the problem in 1–2 lines | 2.5 s |
| `card` | One feature or one real artefact: a word, a line, a field round the anchor; `mono` for a command or a transcript line; `pattern` repeats a field | 1.5–2.5 s |
| `count` | The number: counts up (≤ 4 values a beat, 2–4 beats) while cells multiply round the anchor; ink ground by default | 3 s |
| `claim` | The climax (T3): the scene before collapses into the anchor, it bursts on the bar line, the dots condense onto the claim; read in a pause | 2 bars |
| `lockup` | The ending (T3): push in, silence, pull back to the whole mark; name, line; second move on the last downbeat | 2.5 bars + the phrase rounding |

Slots, limits, fields and the per-type timing: `TEMPLATE.md`. Length follows content (`lib/timing.js`, API 3): a state carries ≤ 5 primary words (the claim ≤ 8), a scene ≤ 6 s, the claim and the lock-up start on a bar line, and the film rounds to a 2-bar phrase. The shortest cut (`edges: 'cut'`, `card` → `lockup`): 12 s at 120 BPM, 11.25 s at 128; 8 s / 7.5 s with the name alone (2026-10-19).

## Signature transformations

- **field morph** (same ground): the field's generating function changes behind a front that runs out of the anchor in 0.75 beat (a second and third source switch on → interference; boundaries cut the interference into cells; cells into rows); the old word leaves up through its mask, the new one rises through it on the beat (sources fused: a field that changes its generating function, a gallery launch film; the dot field as the material, ordered dither; ours: the field's parameters follow the product's own pipeline). `borrowed` grammar, `derived` values.
- **whip push** (across grounds, or speaker to speaker): the next card pushes the old one off to the left in 0.3 beat, with a 64-tap motion streak over 0.75 frame, landing on the beat (`lib/transitions`); the anchor stays put on top (motion streaks, Geisler 1999). `borrowed` (public grammar).
- **scan** (any): a 4 px hairline sweeps down in 0.6 beat; above it the next world is already printed round the anchor. `draft`.
- **invert** (ground change, T2): a disc opens out of the anchor, accelerating (radius ∝ u^2.4), and covers the frame on the beat. `derived` (2026-10-19, so the change peaks on the cut).
- **quantize** (T2): a front from the anchor turns the field's dots into binary 23 px blocks in half a beat; on the beat the blocks re-sort, inside out, into the next field's blocks over 1.25 beats; that scene stays quantized (sources fused: halftone growing into pixel blocks, cells resizing by distance; ours: the quantization is the content's own step, sound to words, words to the chip). `borrowed` grammar, `draft` values.
- **collapse → burst → claim** (T3, the climax): the whole scene shrinks into the anchor in half a beat (power 2.5), the anchor squashes 10 % and holds 0.75 beat (anticipation, Thomas & Johnston 1981), bursts on the bar line with one ink ring and dots that fly on bowed paths and condense, left to right, onto the claim's letters by beat 1.25 (common fate). The dots come out of the product's own part and become its claim — the relation the AI-tell "particles swarming into the logo" lacks. `borrowed` grammar, `draft` values.
- **pull-back** (T3, the lock-up): the claim leaves; the camera pushes into the anchor over 1.5 beats while the mark's rings print round it at the opening's 24 px screen (the bed is silent); a quarter-beat hold; on the bar line, with the impact, the camera pulls back on a log scale over 1.25 beats while the anchor travels to its place in the mark; the rings outside the mark fade, the ones on the mark's arcs stay (part to whole, Navon 1977). `derived` (2026-10-19: the sample's pull-back was judged weak; rebuilt as a real peak: silence, push-in, impact, the film's own rings becoming the mark).
- **slam** (T3, at most once): the frame exposes to paper over a beat, two frames of paper, the next word lands with blur and scale decaying to zero in 0.45 s (isolation effect, von Restorff 1933). `borrowed` grammar, `draft` values; not in the example (it would be a fourth peak).

**Against the nearest reference** (principle 10: the mode's fixed grammar, checked once here; 2026-10-19). The nearest reference is a gallery launch film that holds an anchor while the world swaps, pushes feature cards one a beat, runs a counter and ends on a pull-back reveal; its order is its signature. Shared grammar (4): an anchor held while the world swaps; the pull-back reveal; the whip push; a field that changes its generating function. Not shared (7 of its motifs): the anchor's subject (eyes, an animal), the black-and-green photocopy palette, the one-word-a-beat card run, the counter just before the reveal, its three-verb copy, the context-length counter, the iris into a tunnel. The order here is the product's (the example follows a speech pipeline; the count comes early, the claim condenses out of the anchor, three cards are a dialogue), the template does not fix a card run, and whip is limited to three uses; so the mode shares 4 of 11 motifs, under half.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Screen angles | black plate 45°, process ink 15° | `standard` (offset practice: C 15°, M 75°, Y 0°, K 45°) |
| Dot geometry | round: area = tone, neighbours touch at π/4 = 78.5 %; square: side = pitch · √tone; line: thickness = pitch · tone | `standard` |
| Rulings (on screen) | fields 14 px; the opening 24 px; the mark 7 px at the lock-up, scaling with the camera (the anchor through the film 11.4 px, the push-in 24 px) | `derived` (a dot under about 4 px smears after 4:2:0 chroma subsampling; the opening coarser: owner 2026-10-19) |
| Field density | peak tone 0.5 (the opening 0.36), fade to nothing 560 px from the anchor (the opening 470), a clear disc round the anchor (150 px; the opening 190), nothing left of x 1060 | `owner` (2026-10-19, density) / `derived` |
| Field step (T0) | one step on every beat, quint-out over 0.4 beat, then still; quantized fields step hard on the beat | `derived` (principle 5) |
| Text in | rises through its baseline mask in 0.24 s (cubic out), starting 0.12 s before its beat, so it lands on the beat | `derived` |
| Text out | up through the mask in 0.17 s (cubic in) | `derived` (exits faster than entrances, principle 5) |
| Anchor rise (hook) | from 820 px below, quadratic, contact on beat 1; squash 9 % decaying e^(−t/0.07 s); a contact wave of larger dots runs out 1300 px in 0.7 s | `draft`; contact wave `borrowed (source)` |
| Count | ease-out (quadratic) over 2–4 beats, at most 4 values a beat; one cell a value | `derived` |
| Morph front | 0.75 beat, from 0.25 beat before the cut; 220 px soft edge | `draft` |
| Whip | 0.3 beat, quint in-out, a 64-tap shutter of 0.75 frame (`lib/transitions` whip-push) | `borrowed` (public grammar) |
| Scan | 0.6 beat, 4 px hairline, near-constant speed (15 % eased) | `draft` |
| Invert | 0.75 beat, radius 40 + 1960 · u^2.4 px | `derived` |
| Quantize | front 0.5 beat; blocks 23 px (3 px gap); re-sort 1.25 beats inside out, 0.14 s a block | `draft` |
| Collapse | shrink 0.5 beat (power 2.5), squash 10 % over 0.75 beat (exp in), burst ring 12 px thinning to nothing over 0.42 s, dots in 1.25 beats with a 0.14 s left-to-right spread | `borrowed (source)` / `draft` |
| Push-in and pull-back | push 1.5 beats cubic in-out to 3.4× the lock-up scale, hold 0.25 beat, pull 1.25 beats exp-out on a log scale; rings fade over the first 80 % of the pull | `derived` (2026-10-19) |
| Second move | dot gain on the last downbeat: the mark's tone × 1.16, decaying e^(−t/0.12 s) | `derived` (dot gain is the press's own effect) |
| Motion blur | `lib/canvas.js` `subframes` (exact sum over half a frame): the anchor's rise gated by its speed, the collapse and the burst at 6 sub-frames; the pull-back blurred by its hand-off; the whip's own 64-tap streak | `borrowed` (system) |
| Ambient | none: every change sits on a beat | — |
| Tempo | 120 BPM default (112–128); the sample's tempo, away from the gallery's factory 128 | `derived` |

## Sound

Bed: `press`, built in `score.mjs` from the shared voices (no kit preset is a print shop): D minor, one chord a bar (Dm9 · Bbmaj7 · Gm9 · A7sus4), over a 3-3-2 rim-and-tick ostinato from the first bar, the rhythm of a sheet-fed press. Intro on the hook (pad, press, a muted kick on 1); build on the first chapter (half-time kick, offbeat hats, bass on 1 and 3); drop from the first change to ink (four on the floor, offbeat bass, a plucked arpeggio on the chord), 1.5 dB lower until the two scenes before the claim, which sit 1 dB up; the claim is a break (pad, press; the arpeggio rests for the reading); the bed drops out 1.5 s before the lock-up (the push-in is silent but for a faint riser) and comes back on the lock-up's bar line with an impact and the home chord (D6add9), which rings to the end. Effects on the same beats: a stamp and thud as the anchor lands; a stamp on each word's landing and a tick on each line; a short whoosh into each whip; ticks on every counted value and a stamp when the count lands; a low whoosh and a thud through the invert; a glitch and falling ticks through the quantize; a sucking whoosh into the collapse and a duck through the anticipation, then an impact, a stamp and scattered ticks as the dots condense; a stamp on the name and a press impression on the last downbeat. Master −14 LUFS, true peak ≤ −1.5 dBTP, `tone: 'v2'`. Not yet confirmed by ear.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here.

- The `cyan` preset: newsprint, black, process cyan.
- Bricolage Grotesque 800 for every display word; IBM Plex Mono for labels and artefact lines.
- The anchor at (1440, 540), text on the left, the field on the right, in every scene.
- The opening: the anchor rising into three rings.
- A field morph between the first cards; a whip to change ground; a count on ink with multiplying cells.
- The quantize into rows of blocks; transcript cards in mono.
- The claim condensing out of the anchor's burst; the push-in, the silence and the pull-back to the mark; the name to the right of the mark.
- The `press` bed in D minor at 120 BPM.
- The example copy: "parley-2", a made-up speech model (`Everyone talks / at once.`, `CROSSTALK`, `SPLIT`, `12`, `WRITTEN`, `S4` / `S9`, `LIVE`, `ON DEVICE`, `Every voice, / its own words.`).

## Don'ts

- Do not print anything but the anchor in the accent (principle 7).
- Do not fill the frame with dots: fields keep the paper (mode principle 4; owner 2026-10-19); do not raise a field's tone or fade radius in content, and do not put a field behind the text column.
- Do not use grey, gradients, glows or transparency for a tone: a tone is a dot size (mode principle 2).
- Do not move or resize the anchor for copy; shorten the copy (mode principle 1).
- Do not take the anchor from an eye, a face or an animal, and do not use a black-and-green photocopy look: both are the nearest reference's signature.
- Do not run cards one a beat with whips in a row as the film's spine; the template allows three whips and the order follows the product.
- Do not use the slam and a claim in one film with a hook (four peaks); the template refuses it.
- Do not type a number the product does not compute; a `count` value comes from the product's own measurement (principle 2).
- Do not crossfade two worlds; every change is a front, a push, a disc, a scan or a collapse round the anchor (principle 4).

## Checks

- **P0**: `npm run fit` reports no errors (API 3 tiers: ≤ 5 words a state, the claim ≤ 8 in a pause, scenes ≤ 6 s, T0 gaps ≤ 4 beats, T2 count and repeats, 2–3 peaks with the climax at 60–85 %); `npm run palettes` passes (the anchor ≥ 3:1 on both grounds); no red banner (no text wider than its column at the scale floor); the anchor holds (1440, 540) until the pull-back starts; the lock-up's anchor lands on its place in the mark; every number on screen comes from the product; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL.
- **P1**: every word and line lands on its beat with its sound; something changes on every beat inside a scene; the run into the claim is the shortest stretch and the lock-up a release; the bed is silent before the lock-up and the impact lands on its bar line; no run of four or more equal scene lengths; no frame over about 10 % ink, type included; the first frame is already paper, rings and (unless `edges: 'cut'`) the anchor rising.
- **P2**: no visible moiré between the two plates; the dots stay round (or square, or lines) at every scale of the pull-back; the claim's dots condense evenly, left to right, and no stray dot stays after the swap to type; the whip's streak reads as speed, not as bands; the paper grain is constant.

## Known issues

- **Density** (owner, 2026-10-19: the first screen's grid was too dense and filled the frame): rebuilt as above — the opening now prints 2–5 % of the frame in ink against the sample's 42 % (measured on rendered frames, 2026-10-19), every field keeps the paper; awaiting the owner's look at the new opening.
- **Accent**: the sample's draft cyan `#00A3E0` fails 3:1 on the paper (2.46); the default is `#0090CC` (3.07). If the owner prefers the brighter ink, it can only return with a deeper paper or a keyline, both changes of the look; to be shown side by side.
- **Order and pull-back**: the example's order (the product's pipeline, the count early, the claim out of the anchor) and the rebuilt pull-back (silence, push-in, impact, rings becoming the mark) replace the sample's order and its weak reveal; not yet seen by the owner.
- **Library** (2026-10-19): scan, invert and the pull-back come from `lib/handoffs` `anchor-swap`, whip and slam from `lib/transitions`; morph, quantize, the collapse-burst, the push-in and the screen (dot shapes) stay in the template, because the library modules print their own field, word and round dots (TEMPLATE.md, Transitions). Stills before and after the switch match except the whip, whose streak is now smooth (64 taps instead of 32).
- **Variants**: `square`, `line` and the `magenta` and `reverse` presets have been rendered as stills only (2026-10-19), not judged by the owner. In `reverse` the anchor's knock-out is the dark ground, so the anchor reads as process ink on black.
- The `slam` device is implemented and validated (at most once, counted as a peak) but not used in the example.
- The sound was verified by levels, onsets and loudness only, not by listening.
