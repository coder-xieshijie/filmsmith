# Ink (`ink`)

Heavy extra-condensed type slammed onto warm paper on every beat; an ink dot hops between the words as their full stop, then transforms — it opens each next ground under a word, splits into stops, swallows a word and bursts into the next, sinks and blooms into an accent field, holds still while the world is scanned in round it, stretches into a wipe, punches an iris — and ends as the cursor of the closing URL or command. The claim lands on the film's one whiteout, and the camera leaves through a counter of its type. Aesthetic anchor: "like a letterpress teaser where the full stop is the protagonist".
Theme: tech-product-launch · Template: `assets/templates/ink/` · length fitted from content at 124 bpm (range 120–136); timing API 3 (the four tiers of change, 2026-10-19); the shipped example fits 18 bars = 34.8 s (api 2: 16 bars = 31.0 s) · Accepted 2026-10-17 (genre demo 02: "the first half an anchor (ink dot) hops between words; then the anchor's motion turns into a blue colour field. Good — explore more of these effects for transitions between scenes")

## Fits / does not fit

Fits: a name, a slogan or a one-line claim; teasers and stings of about 10–40 s (Use cases); a library, API or single feature that needs one claim, a short list and one number; the teaser cut of a longer launch film; a launch film of 30–40 s whose content is a hook, a problem, a turn, the name, a short process, one number and one claim.
Does not fit: a workflow with parts and flows (blueprint); anything a viewer must read for more than ~5 words at a time (a claim: 8, in a pause); more than 8 steps; data with many numbers (tally); a terminal tool whose look is its UI (phosphor). Longer than ~40 s, the beat-per-word rhythm turns into a feature list. The mode is chosen by form, so at least one scene is drawn from a real technical artefact of the product (principle 9): the `steps` list of its real stages, a real number in the `counter`, the real command in the closing card.

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **Name reveal or launch sting, 10–15 s** (best fit) | `seedfield` 1.0, a texture CLI: the dot is its seed and blooms into the field, the name drops out of it, the dot ends as the cursor of `seedfield grow --seed {seed}`, the seed this bloom was drawn from (workshop demo 2026-10-19, 6 bars, 10.6 s) | `bloom` → `name` → `cta` |
| **Launch film with one claim, 30–40 s** | `cleave`, a CI bot that bisects a red main branch: WHO / BROKE / MAIN on three grounds, 4096 COMMITS, ONE OF THEM split into stops, GUESS bursting into HALVE, the bloom into the name, the bisection loop, 12 builds, GOOD / BAD / FOUND, the claim IT WAS 7F0C2D1 on the whiteout, out through its 0 into the command (workshop demo v2, 2026-10-19, 18 bars, 34.8 s) | `swap` → slams, `warp`, `burst` → `bloom` → `name` (scan) → `steps` → `counter` → `swap` → `claim` (portal) → `cta` |
| One-line claim with its proof, 30–35 s | `loudgate`, a CI loudness check: the hook swapped, the problem slammed, the bloom into the name, its six real metering stages, the film's own length and measured loudness, the verdict, the claim (the shipped example, 34.8 s) | `swap`, slams, `warp`, `burst` → `bloom` → `name` → `steps` → `ruler`, `counter` → `swap` → `claim` → `cta` |
| Release of a version, about 20 s | a parser's 2.0: `BREAKING.` `NOTHING.` split into stops, the bloom, the name with its version, one benchmark number from its own suite in the `counter`, the upgrade command | `slam` (split) → `bloom` → `name` → `counter` → `cta` |
| Teaser cut of a longer launch film, 15–20 s | the social cut of the same product's phosphor or blueprint film: its claim in one or two slams, the name, the install command; the long film carries the detail | `slam` → `bloom` → `name` → `cta` |

Best fit: the mode's two signature devices, the dot blooming into the field and the name's width jumps on the drop, are both about a name, and the ending gives one action (the command). A film over 30 s needs about three T2 transitions (principle 4): use a `burst`, a `scan` and the `claim`'s whiteout and portal, not more slams.

## Mode principles

1. **The dot is the only protagonist that persists.** Every scene has exactly one dot: a full stop, a progress dot, a playhead, the anchor of a scan, the cursor of the closing command. It is never decoration and never duplicated except while it splits on purpose or bursts into particles. *(Narrows 7, one system: a through-line object keeps the viewer oriented.)*
2. **Every scene change is something the dot does.** Hop, aperture (the next ground opens from it), split, burst, bloom, scan (it holds still while the world changes round it), wipe, iris, flood; a plain cut only as a contrast flip on the downbeat. One exception a film, the peak: the whiteout into the claim and the push through a counter of the claim's type out of it, during which the dot is the claim's full stop and leaves with its line. No crossfades, no slides. *(Narrows 4, transform at the turns, cut inside them; the peak is marked by being the only one, von Restorff 1933.)*
3. **The accent means "the dot and what it becomes".** See Accent role. Type is never accent for emphasis. *(Narrows 7, one accent, one meaning.)*
4. **One word per beat, landing on the beat.** Words slam (spring scale 1.5 → 1, < 8 % overshoot) or swap on the beat; the dot lands with the last word; something changes on every beat or two, and a resting dot bounces in place rather than hold still past two beats. *(Narrows 5 and the T0 tier, motion locked to the beat.)*
5. **Scale carries the emphasis.** Slam words 220–330 px against 28 px mono labels; nothing in between. The name gets the drop and the biggest width change; the claim gets the whiteout. *(Narrows 3, one idea per beat: the key word is made unmistakable by scale.)*
6. **Read it or cut it.** Labels are 1–4 words and type after their line; a state carries at most 5 words, the claim 8; the template refuses copy that does not hold its reading time (see Length and tempo). *(Narrows 1, readable before beautiful.)*

## Palette presets

| id | name | fits | paper / ink / soft | accent / onAccent | night / nightInk / nightSoft / nightAccent | mis |
|---|---|---|---|---|---|---|
| `cobalt` | Cobalt (source) | default; tools and launches | `#EFEEE8` / `#111214` / `#52545A` | `#2B3BFF` / `#EFEEE8` | `#111214` / `#EFEEE8` / `#9A9BA0` / `#6B78FF` | `#FF5A1F` |
| `vermilion` | Vermilion | editorial, culture, stamps and seals | same / same / `#595250` | `#C8321A` / `#EFEEE8` | same / `#FF6A45` | `#1F6BFF` |
| `forest` | Forest | data, finance, calm products | same / same / `#4E5451` | `#0E6A48` / `#EFEEE8` | same / `#3CC48C` | `#FF5A1F` |
| `carbon` | Carbon (inverted) | night launches, developer tools | `#16161A` / `#EEEDE6` / `#BFB8B6` | `#FF5B2E` / `#16161A` | `#EEEDE6` / `#16161A` / `#55565B` / `#C23A16` | `#2B3BFF` |
| `coral` | Coral red (inverted) | night launches with a coral or pink-red brand colour | `#16161A` / `#EEEDE6` / `#C0B8B6` | `#FF6452` / `#16161A` | `#EEEDE6` / `#16161A` / `#5B5553` / `#EB5141` | `#2B3BFF` |

Checked by `npm run palettes` (`standard`): text ≥ 4.5:1 (ink, soft, onAccent on the field, nightInk, nightSoft), graphics and large type ≥ 3:1 (accent on paper, nightAccent on night). Weakest pairs: vermilion onAccent 4.60, carbon nightAccent 4.58. `soft` is the neutral grey tinted toward each preset's own hue at the same lightness, C* about 3 (2026-10-18, proposal I1 of the workshop's colour study, settled by theory; the owner did not object): cobalt cool `#52545A` 6.51:1 on paper, vermilion warm `#595250` 6.58, forest green `#4E5451` 6.66, carbon toward its orange accent `#BFB8B6` 9.23 (derived the same way: L* 75.3 kept, h 42); before, all four shared the cool `#55565B` (`#B9BAB4` on carbon), which matched only cobalt. `nightAccent` is the accent hue lifted (or deepened on carbon) so the dot reads on night: cobalt on ink is only 2.83:1, which the source film's GENERATE word failed. `cobalt` paper/ink/accent are the source's (`borrowed (source)`); the rest `derived`.

## Variants

**Colour**: the five presets above (`cobalt` default; `vermilion`, `forest`, `carbon` and `coral` inverted).

**Form: `typeWidth`**, which end of Archivo's width axis carries the display type (2026-10-19, not yet seen by the owner). Family, weight, sizes, floors, grid, the dot, the choreography and the timing stay; only the width, the tracking and word space that width needs, and the direction of the name's width jumps change.

| `typeWidth` | What changes | Choose it for | Source |
|---|---|---|---|
| `compressed` (default) | Display words extra-condensed (OpenType width class 2, 62.5 %); name and wordmark normal at rest, jumps 75 → 87.5 → 62.5 → 87.5 → 100 % | Most films; lines up to 14 characters; the loud, urgent teaser | The source film (`borrowed (source)`); compressed gothic wood type, the poster printer's face for big words in a narrow measure (Gothic Condensed, X and XX Condensed: Kelly, *American Wood Type 1828–1900*, 1969; Rob Roy Kelly American Wood Type Collection, UT Austin) |
| `extended` | Every display word expanded (width class 7, 125 %), tracking 0, word space 0.26 em; name and wordmark expanded at rest, jumps 112.5 → 100 → 75 → 100 → 125 %, so the widest swing is still the name's (mode principle 5); character limits about halve (`TEMPLATE.md`) | Short names and words (≤ 8 letters a line), numbers, infrastructure, hardware and engineering products; a calmer, wider, machined voice. Not for long words | The same wood-type lineage cut the other way (Gothic Extended, Antique Extended: Kelly 1969, `borrowed`); the extended grotesques of technical lettering, Microgramma (Butti and Novarese, Nebiolo, 1952) and Eurostile (Novarese, 1962) (`borrowed`); width classes of the OpenType `wdth` axis and `usWidthClass` (`standard`); tracking, word space and limits `derived` |

Why width and not another axis: it keeps one family (two families plus one mono, [system](../system.md#pairing-rules)) and the name's width jumps, which need a `wdth` axis, while changing the silhouette of every frame. A wood-type slab or fat-face serif would put a serif into launch films (system: a launch film stays sans) and has no width axis for the jumps; brush ink changes the bloom and turns the letterpress world into another one; full-bleed type breaks the 150 px margin (P0); a centred axis already exists per scene (`align: 'center'`).

Both values pass this card's P0 and the clean-transition checks C1–C8 on the same 16-bar copy (2026-10-19: `check-film` PASS for both, with identical flash, hand-off, key and pace results; the transitions are untouched). After the api 3 migration the shipped example, cut as `TEMPLATE.md` documents, runs in both widths at the same 18 bars (selftest `--variants`, 2026-10-19: PASS). Caution: wide grotesques are frequent in current tech branding (`draft` observation); a film in `extended` lists "expanded grotesque" in its motif table.

## Accent role

- **Accent** (`accent`, on night `nightAccent`) marks one thing: the dot and what it becomes — the full stop, the split stops, the burst's ring and particles, the bloom, the playhead, the anchor of a scan, the progress dot of the current step, the ruler head, the counter's stop, the claim's full stop, the cursor of the closing command. A word is accent only while it is itself transforming (the `warp` word, a slam word with `accent`). It never marks emphasis, a status or decoration: the streaks on night are `nightSoft`, not accent. As a mark the dot covers well under 1 % of the frame.
- **Change of ground.** The bloom turns the whole frame to the accent field at the chapter turn into the name (no paper left from about beat 6.8 of the bloom, measured 2026-10-19 on the rendered film, v4), and the field stays the name scene's ground until the wipe or scan opens the night section: about 8 beats, two bars (principle 7; batch 2 `field: 'short'`, settled 2026-10-18 by theory, the owner did not object). A `swap`'s answer stands on the field for one beat or two: the dot opens into it, so it is still what the dot becomes (`derived`, 2026-10-19).
- **Effect colour.** `mis` (orange on cobalt and forest, blue on vermilion and carbon) is the misregistration ghost: 40 % opacity, 5 / −3 px off, only on the 0.1 s impact frame of a slam word. It is an effect colour (principle 7), never an accent, and never marks anything. The whiteout's red/blue channel offset (10 px, decaying in 0.45 s) is an effect of the shock, not a colour.
- No status or category colours.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Slam and swap words, burst words, steps, values | Archivo 900, `wdth` extra-condensed, −0.02 em | OFL | 330 (auto-fit floor 220), steps 300 (floor 200), counter 280 (floor 180) |
| Name, wordmark, claim | Archivo 900, `wdth` normal ↔ extra-condensed per beat (the claim at rest, normal), −0.035 em | OFL | 225 (floor 140), wordmark 210 (floor 130), claim 260 (floor 160) |
| Labels, step counter, licence line | IBM Plex Mono 500, caps, +0.12 em | OFL | 28 |
| Closing URL or command | IBM Plex Mono 600, +0.12 em | OFL | 40 |

With `typeWidth: 'extended'` every Archivo role above is set expanded (Variants); sizes and floors are the same. Information text is ≥ 28 px (≥ 25 px, B7 2026-10-18); nothing on screen is smaller, and no text is decoration. Main text ≥ 40 px: slam words, step words, values, the name, the claim, the wordmark and the closing URL or command. The labels (28 px) are read as primary text but stay below 40 px on purpose: the mode's emphasis is the 10 : 1 scale contrast between the slammed word and its mono label (mode principle 5), and labels are 1–4 words; to be reviewed with the owner in the second batch. The step counter and the licence line are glance text (≤ 6 words, they repeat the progress dots / add nothing the film needs). The claim is set at the name's width because it is read in a pause, not slammed, and because counter-portal needs an open counter: the extra-condensed 0 is a slot that keeps the frame mostly black for several frames of the push (measured 2026-10-19: 3.5 flashes a second, over the limit; at normal width 2.5). Slam, name and wordmark sizes `borrowed (source)`; mono sizes `derived` (raised from 22–26 to 28, the URL from 34 to 40, 2026-10-18); the claim's size and width `derived` (2026-10-19); floors `draft`.

## Type scale

√2 series from the label: **28 · 40**, then display type fitted to its slot: name and wordmark 210–225 (floors 130–140), the claim 260 (floor 160), slams, swaps, steps and values 280–330 (floors 180–220). Levels per frame, at most three: slam or warp + label (2); swap (1); name 225 + label 28 (2); steps 300 + counter 28 (2); ruler 330 + label 28 (2); counter 280 + label 28 (2); claim (1); closing card wordmark 210 + command 40 + licence line 28 (3). The dot is not type.

## Frame and grid

1920 × 1080, 150 px margins (content inside 1620 px). Baselines: one line 640 with label at 730; two lines 520 / 830 with label at 190; name 610, labels 720, playhead rule 780; steps word 650, `STEP n / N` 300, progress dots 850 (46 px apart, r 9, current r 11); ruler 300–1620 at y 760, one tick per beat of the whole film; swap words on the one-line baseline at the left margin, one size for the whole run so the anchor never moves; burst words centred on the one-line baseline (the hand-off's layout); claim lines at the left margin on the slam baselines; closing card wordmark 590, command 700 (centred together with its cursor dot, r 16, 8 px after the last character), licence line 770. No persistent HUD: the dot is the persistent element (principle 7: a through-line object instead of a persistent frame). Seeded grain, overlay 10 %. Content area for measurement: the whole frame.

## Scenes

| Type | Purpose | Ceiling |
|---|---|---|
| `swap` | One word a beat on the same anchor, each on its own ground, the next ground opened from the dot (X18 aperture-swap); the answer stands on the accent field | 6 s |
| `slam` | One phrase, a word per beat, dot as full stop; `stops: 'each'` splits the dot into one stop per word | 6 s |
| `warp` | The problem: an accent word rises and warps beat by beat, an ink word slams under it | 6 s |
| `burst` | A word lands with its dot, is read, shrinks into the dot, which bursts into the next word (X11 collapse-burst, T2) | 6 s |
| `bloom` | The dot sinks into the paper and blooms into the accent field (fixed choreography, a baked fluid simulation, v4 approved 2026-10-19; the music breaks in its last half bar); may open the film, frame 0 being the dot alone on paper | 2 bars |
| `name` | The drop: name rises from the field, width jumps per beat, playhead dot runs under it | 2 bars |
| `steps` | A list on night, one word per beat, progress dots; streaks on its first beat | 3 bars |
| `ruler` | Two words and a ruler of the whole film; the dot sits at the film's real position | 6 s |
| `counter` | One value per bar line; digits count up in fixed slots, the dot lands as its full stop | 6 s |
| `claim` | The film's peak: the whiteout lands it on the music's second drop (X21), it is read in a pause, and the camera leaves through a counter of its type (X23, `to: 'portal'`); one a film | 6 s |
| `cta` | Wordmark, the URL or command typing on; the dot lands as its cursor; licence line | rest |

Bars are never typed: `npm run fit` sizes each scene from its copy and choreography (see Length and tempo). Slots, limits, the per-type timing table and the transition table: `TEMPLATE.md`.

## Length and tempo

The film is as long as its content needs (`lib/timing.js` `fit()` with `timing.rules.js`, timing API 3: the four tiers of change of principles 4 and 5, owner-approved 2026-10-19); more copy or more scenes make it longer, the tempo does not move to hide it. `target: <s>` moves the tempo inside the range to meet a length and reports the bars to add or cut when it cannot. Every tier comes from `plan.js`, the tables that place the picture and the sound, so the declared events cannot drift from the frames.

| Value | Setting | Tag |
|---|---|---|
| Tempo | 124 bpm default, away from the gallery's factory 128 (check 2026-10-18 F6); range 120–136. Faster, a slam with a label needs more beats; slower, the `inkbeat` bed leaves techno for house and the slams lose their snap | default `derived`; range `derived` |
| Reading | three tiers (principle 1): slam and swap lines, the warp pair, the burst's first word and the ruler pair are **word** text (one word a beat; once complete the line holds 0.3 s × its words); labels, names, step words, values, the claim and the URL or command are **primary** (0.3 s a word, added up in order, the label read after its line; the URL or command also ≥ 3 s after typing); the final `STEP n / N` and the licence line are **glance** (still ≥ 1 s) | `standard` |
| Text per state | ≤ 5 primary words enter together; a label starts typing 0.75 beat after its line is complete (a second state); the claim ≤ 8 words with `claim: true`, read in a pause | `standard` (principle 1, api 3); the 0.75 beat `derived` (it has typed by the next beat, and a label of up to 4 words does not lengthen the scene by a beat) |
| T0 | every word, label, aperture, split, burst, width jump, step, value, ink drop and the cursor landing; a resting dot bounces in place on a beat wherever nothing else would change for more than two beats (`plan.js` places the bounces as late as it can) | `standard` (principles 4 and 5); the bounce `borrowed (source)` (the source's in-place bounce on beat 3), placement `derived` |
| T1 | scene starts, and the bloom's second composition at its beat 4 as a `shot`; ceiling 6 s a scene (`bloom`, `name` 2 bars, `steps` 3), `cta` a rest | `standard` |
| T2 | collapse-burst, anchor-swap scan, whiteout-slam, counter-portal, and the dot's iris or flood onto another ground (`dot-iris`); a swap is T0 | `standard` (tiers), devices `borrowed` (library, owner-approved samples 2026-10-19) |
| T3 | the name (reveal), the claim (climax at 60–85 %), the lock-up; a film without a name or claim marks its first change as the hook | `standard` |
| Holds | only the claim's reading pause is declared (≤ 2 bars); every other scene runs the ambient push, so none is pixel-still, and its T0 changes keep each stretch within two beats | `derived` |
| Grid | `unit` 1 beat: every scene is whole beats; the four turns (`bloom`, `name`, `steps`, `claim`) start on a bar line, the scene before them takes the wait; inside a scene entrances in beats from its start and exits in beats before its end. Whole bars until 2026-10-18 (principle 5: only the key beats are locked; whole bars made dead holds) | `derived` |
| Phrase | total rounded up to 2 bars; one beat at most per scene, from the back over the scenes after the last turn below their ceiling, the rest to the `cta`, whose second move lands on the downbeat of the last bar either way | `derived` |
| Slam | word k on beat k (k + 1 in the first scene), label from 0.75 beat after the last word, words leave 0.2 s before the end; 0.8 beat early into a bloom, 1 beat into wipe / iris / flood / scan; into a claim they stay | `borrowed (source)` choreography, measured; label start `derived` |
| Swap | word k on beat k; the next ground opens from the previous word's dot over 0.44 beat (cubic out), alternating circle, band, closing bars | `borrowed` (library aperture-swap, 0.22 s at 120 BPM) |
| Burst | word on 0; collapse-burst from the beat after it is read (at least one), over 2 beats (the library's 2.62 at 120 BPM, scaled to ≤ 2 beats as a T2); `into` lands on the next beat | `borrowed` (library), length `derived` |
| Name | labels at 0.5 and 4.5 (later on a half beat if the name and label 1 need it); choreography to beat 7 | `borrowed (source)` / label shift `derived` |
| Night scenes | steps one per beat; words stay to the end while the dot hops 0.9 beat early; counter values on bar lines | steps `borrowed (source)`; words to the end `derived` |
| Claim | the whiteout's build over the last beat of the scene before, two paper frames and the hit on the claim's bar line, the shock decaying in 0.45 s; with a portal, the other glyphs rise out 0.3 s before the push, which runs 1.5 beats from 1.8 beats before the end | `borrowed` (library whiteout-slam and counter-portal); placement `derived` (the push starts so the counter's strokes leave the frame on the last beat, measured 2026-10-19) |
| CTA | at least 2 bars, URL or command from beat 0.25, the dot on its cursor on the first beat ≥ 0.15 s after typing | `derived` |
| Shortest | `bloom` → `name` → `cta`: 6 bars, 10.6 s at 136 bpm, 11.6 s at 124, passes api 3 (no climax, a warning, expected for a sting). A scene before the bloom costs a whole bar (the bloom is a turn), the phrase rounds 7 bars to 8: 14.1 s at 136, which then needs one T2 | `derived` |
| Example | 18 bars at 124 bpm = 34.8 s (api 2, 2026-10-18: 16 bars = 31.0 s); T0 median 1 beat, longest gap 3.25; T1 13 compositions, median 2.42 s, CV 0.35; four T2; climax at 78 %; `npm run fit` 0 errors, 0 warnings; `check-film` PASS, 0 WARN | `derived` |

`renders/timing.json` carries every slam and swap landing, the burst's landing, the counter values, the claim's hit (on its bar line, with the music's second drop), the dot landing on the cursor (`land`), the second move (`end`), the four turns, the bloom's two hand-offs (dot → bloom, field → name), and the tier arrays `micro`, `holds`, `shots`, `expressive`, `peaks`.

## Signature transformations

- **hop** (slam → slam): the dot rests on its stop, bounces in place on a beat when it would otherwise hold past two beats, then hops in an arc (220–380 px, seeded) to the next phrase's stop, landing with its last word (`borrowed (source)`; bounce placement `derived` 2026-10-19).
- **aperture** (inside a `swap`, X18): the word holds its anchor; on the next beat the next ground opens from the previous word's dot (a circle), from its line (a band), as bars closing from top and bottom, or as a cut; the new word slams in on it with its dot (`borrowed`, library `aperture-swap`; the circle from the dot `derived`, so the change is something the dot does).
- **split** (inside a slam): each landing word buds a new stop off the previous one, arcing over the word with a gooey neck; after the last word they merge back into one (`draft`).
- **burst** (a `burst`, X11): the word shrinks into its dot; the dot swells, holds with a small squash, bursts into a crisp ring and particles that condense, left to right, onto the next word's glyph cells and its dot (`borrowed`, library `collapse-burst`).
- **bloom** (paper → accent field): the dot moves to the centre and grows to r 34 (drip) and rests; on beat 1 it is released like a drop of ink in water and blooms into lobes whose fronts curl into tendrils; from 2.4 held ink at the centre and three drops round it thicken and widen the mass; from 4.2 drops round its rim carry it past the frame while the camera pushes in, and the ink clouding the water fills the last gaps; no paper from about beat 6.8, the tones even out into the exact accent hex by 7.9 (idea `borrowed (source)`: the generated shot of genre demo 02; the ink-in-water look `derived` 2026-10-19, v4, after a stable-fluids page the owner liked; made final by the owner 2026-10-19).
- **scan** (X13): the dot holds still as the anchor while a hairline sweeps down over the last beat with the next world already printed above it; as the line passes it the dot takes the next ground's colour, then hops to its place in the next scene (`borrowed`, library `anchor-swap`, `swap: 'scan'`; the anchor is the mode's dot, not a part of a mark).
- **wipe** (name → night): the playhead dot stretches into a bar across the frame in half a beat, then the bar opens as a window onto the next scene, its edges thinning to 3 px, fully open on the downbeat (`draft`).
- **iris** (night → paper): the dot swells into a ring whose hole shows the next scene already moving; the ring thins to 8 px and opens past the frame half a beat after the downbeat, 1.5 beats in all (`draft`; 0.75 beat until 2026-10-18).
- **flood** (any → any): the dot takes the next ground's colour and floods out as a crisp disc in the last half beat (`borrowed (source)` ending).
- **whiteout** (into the claim, X21, once a film): the scene before exposes up to paper over its last beat while the camera leans into the claim; two paper frames; on the bar line the claim lands with blur, scale and a 10 px channel offset decaying to zero in 0.45 s, on the music's second drop (`borrowed`, library `whiteout-slam`; on paper, the white settling into the paper the claim is printed on).
- **portal** (out of the claim, X23): the next scene is visible inside the counter of the claim's first 0, O, Q or D from the frame the claim lands; the other glyphs and the dot rise out; the camera pushes through the counter until it is the frame (`borrowed`, library `counter-portal`).
- **cut**: contrast flip on the downbeat; the dot falls in again from above.
- **cursor** (closing card): the block cursor waits at the end of the typed URL or command; on the beat the dot drops the last 46 px into its place and lands; on the last downbeat it hops in place and lands again (`derived`, 2026-10-18).

## Motion

| Value | Setting | Tag |
|---|---|---|
| Slam | per glyph, 28 ms stagger; damped spring ζ 0.62, ω 30; scale 1.5 → 1, y −0.1 em → 0; blur 7 px → 0; 35 ms fade | `borrowed (source)` |
| Step words | as the slam with ζ 0.8, ω 44 and 12 ms stagger: 1.5 % overshoot, settled (within 1 %) 0.07 s after landing, so a word shown for one beat is still for most of it | `derived` (check 2026-10-18 legibility #15) |
| Rise | through a mask line, spring ζ 0.78, ω 22, 30 ms stagger | `borrowed (source)` |
| Exit | up through the mask in 0.17 s, ending on the bar; 1 beat early before a dot transition, 0.8 beat before a bloom | `borrowed (source)` (exits faster than entrances) |
| Dot landing | squash 0.28, decaying e^(−14 t), 40 rad/s; motion blur of 6 sub-frame copies over half a frame while it moves | `derived` |
| Hop | starts max(0.15 s after landing, 0.9 s before the next), cubic in-out, parabola arc | `borrowed (source)` |
| Cursor | drop 46 px in 0.18 s (ease-in, contact on the beat), squash; second move a 36 px hop over 0.3 s onto the last downbeat | `derived` |
| Camera | ambient push (principle 5) 1.4 %/s of scale at any tempo, 13 px/s at the frame edge, from each scene's start, easing from 4.5 % into a 6.5 % ceiling (not on `burst` and `claim`, whose hand-offs draw in film space); punch-in 5 % decaying e^(−7 t) on every landing. Settled 2026-10-18 (batch 2 `push: 'ambient'`, accepted on the recommendation; the owner did not compare it shot by shot); the source's 4.5 % a bar is gone | `derived`; punch-in `borrowed` (gallery 1.03–1.07) |
| Warp | amplitude ramps over 2.7 beats with a 9 rad/s wobble; x-scale ±18 %, shear ±0.35, two ghost copies at 28 % | `borrowed (source)` |
| Name width | condensed → semi-condensed → extra-condensed → semi-condensed → normal on beats 2–6 | `borrowed (source)` |
| Misregistration | `mis` at 40 %, 5 px / −3 px, 0.1 s, slams only (effect colour) | `borrowed` (gallery: impact frames only) |
| Labels | typed at 90 chars/s (URL 120), block cursor; from 0.75 beat after their line is complete | `derived` |
| Bounce | the resting dot rises 70 px and lands over 0.3 s, landing on the beat with the landing squash; placed by `plan.js` as late as it can while no stretch without a change passes two beats, never in the last 0.3 s before the dot leaves; steps' and counter's own dots too (60 % and 100 % of the height) | `borrowed (source)` (the source's in-place bounce on beat 3); placement `derived` (T0, 2026-10-19) |
| Aperture | lib `aperture-swap`, 0.44 beat, cubic out, hard edge, from the previous word's dot (circle) or its line (band, closing bars) | `borrowed` (library) |
| Swap word | the step-word spring (ζ 0.8, ω 44, 12 ms stagger), so a word shown for a beat is still for most of it | `derived` (as steps) |
| Burst | lib `collapse-burst` over 2 beats (2.62 at 120 BPM in the library): collapse power 2.5, swell spring, squash, burst at 38 %, ring expo out, particles 6 px grid, condense cubic in-out left to right; the slammed and landed words drawn whole on the slam spring | `borrowed` (library); length `derived` (≤ 2 beats as a T2) |
| Scan | lib `anchor-swap` `scan`, 1 beat, hairline 4 px in the outgoing ground's ink, 88 % linear; the dot changes colour as the line passes its centre; then hops 1 beat to its place | `borrowed` (library); the hop `borrowed (source)` |
| Whiteout | lib `whiteout-slam`, 2 beats centred on the claim's bar line: exposure u^2.2 to 94 % paper, lean 1 + 0.14 u²; 2 paper frames; blur 26 px, channel offset 10 px (library 22), zoom 0.16, decaying (1 − q)^2.2 over 0.45 s | `borrowed` (library); offset `derived` (the claim is black on paper: a smaller fringe) |
| Portal | lib `counter-portal`, 1.5 beats from 1.8 beats before the claim's end, cubic-bezier (0.7, 0, 0.3, 1) on a log scale of zoom, parallax 0.55; the other glyphs and the dot rise out (0.17 s each, 8 ms apart) 0.3 s before | `borrowed` (library); clearing and lead `derived` (flash count, cut on the beat, 2026-10-19) |
| Streaks | `nightSoft` strips (2–34 px, halo and a lighter core) on the first beat of a `steps` scene only, the hand-off into the list (`streaks: 'each'` fires one per beat, `false` none); outside the 34–68 % type band and ≥ 30 px clear of the step counter's glyphs; 0.24 s sweep | `derived` (check 2026-10-18 P-15, legibility #14) |
| Bloom | Ink dropped in water, simulated once and drawn per frame as pigment (`inkflow.js`; the owner, 2026-10-19: v3 not satisfying either; he pointed at a stable-fluids "sumi ink in water" page as the look he likes). `bloom-bake.mjs` runs stable fluids (Stam 1999) on a 192 × 108 grid (10 px a cell): implicit viscosity, semi-Lagrangian self-advection, Jacobi pressure projection, vorticity confinement, a slow divergence-free current; the ink on a grid 4 times finer, MacCormack-advected with a little diffusion. A drop is a source: an ink-only outward flow (not projected) shaped by an uneven angular profile, and a ring of alternating tangential pushes at its advancing front that sheds vortex pairs into the water, which roll the front into tendrils. Drops (beats): the dot released on 1; held ink at the centre plus three drops round it from 2.4; six drops round the rim from 4.2, four more toward the frame's corners from 5.2. Stored 16 times a beat, one byte of concentration per ink cell. Drawn as absorbance (Beer–Lambert): up to c = 1 the paper turns into the accent, beyond it the accent deepens toward navy (blue kept, red and green falling); a dark tideline where the front thins against clear water, a darker rim on steep inner edges, the paper's sizing making the wash uneven, a fine granulation fixed to the paper; a tent filter at ink resolution so fronts never show stair steps. From 4.8 the ink clouding the water (a wide blur of c) fills the gaps from their surroundings. Camera 1 → 2.4× over 3.6–7.2; frame 0 is the slam's crisp dot, kept until the release; paper gone at about 6.8; exact accent from 7.9 | `derived` (2026-10-19, v4; replaces v3's shaded height field, v2's WebGL turbulence shader, the finger crown of 2026-10-18 and the CPU lobes of batch 1) |

## Sound

Bed: `inkbeat` preset (F minor minimal techno, written for 128 BPM and played at the film's fitted tempo, 124 by default, anywhere in 120–136; sections are whole bars of the fitted scenes, so it follows any length): every bar before the `name` is the build (no kick, hats, rim, claps, resonant pulse opening, riser), the last half bar before the drop is silent, the drop (kick, rolling bass, open hats, impact) lands on the name, and its energy is highest there, easing through the steps and the numbers; a `claim` gets the second drop: the bar before it is a build again (no kick, the riser, its last half bar silent while the frame exposes to white) and the drop lands on the whiteout's hit; `cta` bars are the outro. Effects from `plan.js` on the same beats: stamp + thud on each slam and swap word (the film's first hit 6 dB softer: out of near silence the render's AAC encode overshoots its true peak by about 2 dB, and the renderer would lower the whole mix by 1 dB), a pencil-tap rim on each stop, a dry tick on each aperture, typing keys at about 30 a second, a reversed swell as the burst's word drains into its dot and an impact on the burst with a quiet arp as the particles form, a synthesised ink drip as the dot sinks, a low whoosh and sub swell on each bloom surge, a stamp tick on each width jump, a stamp per step and a short glitch on the streak beat, a tick and a light whoosh under a scan, ruler and counter ticks, a quiet rim on each bounce of the resting dot, a whoosh into each dot transition and an impact on its downbeat, a deep impact on the whiteout's hit, a light whoosh as the claim's glyphs leave and a rising whoosh through the portal, a chime and a stamp as the dot lands on the cursor, a rim tap on the closing second move, and a high woodblock on every turn (bloom, name, steps, claim) so each turn has an onset above 1.5 kHz over its low impact. Master −14 LUFS, true peak ≤ −1.5 dBTP; `score.mjs` has `lib/audio` write the measured loudness to `assets/audio/measure.json`, and `{lufs}` on screen reads it. Optional generated bed: `bed: { file, offset }`, with `bpm` set to its measured tempo inside 120–136.

## Factory defaults

What the template produces untouched. A film's `PLAN.md` ban list starts here. The first four items are motifs the template shares with the gallery's factory look (check 2026-10-18 F6); the wordmark full stop and 128 bpm, also shared, were removed from the template on 2026-10-18.

- Archivo extra-condensed black for every slammed word.
- The `cobalt` preset: cobalt accent on warm paper.
- The misregistration ghost on impact frames.
- The film ends on the product's name (the wordmark of the closing card).
- 124 bpm, F minor minimal techno (`inkbeat`), drop on the name, a second drop on the claim.
- The dot as full stop hopping between slammed words; one word per beat.
- A swapped hook: three words on paper, night, paper.
- A guess bursting into the method word.
- The bloom into the accent field and the name rising from it with width jumps and a playhead.
- The night section: a step list with `STEP n / N` and progress dots, a ruler of the film, a counter.
- The film measuring itself: `{seconds}` on the ruler, `{lufs}` on the counter.
- A two-word verdict swap ending on the accent field, then the claim on the whiteout and out through its first counter.
- The dot ending as the cursor of the closing command, a licence line under it.
- The example copy: "loudgate", a made-up CI loudness check (`TOO LOUD AGAIN`, `SHIPPED ANYWAY`, `GUESS` → `METER`, `TOO LOUD / NO MERGE`).

## Don'ts

- Do not colour a word for emphasis or a streak, a rule or a label in the accent: the accent is the dot's (Accent role, principle 7).
- Do not use `mis` for anything but the slam impact frame: held longer it reads as a second accent.
- Do not draw a second dot, or keep the dot still on a scene change: every change is something the dot does (mode principles 1, 2); the scan's stillness is the change (the world moves round it).
- Do not crossfade or slide between scenes (mode principle 2).
- Do not type a number the film defines (length, tempo, bars, loudness): write `{seconds}`, `{bpm}`, `{bars}`, `{lufs}` (principle 2).
- Do not end on the wordmark's full stop or a dot beside the name: that is the gallery's factory ending (F6). End on the cursor of a real URL or command.
- Do not shrink type below the auto-fit floors or the mono text below 28 px (principle 1); rewrite shorter or split the scene.
- Do not give a one-bar slam a label of more than a word or two and expect it to stay one bar: the label is read after the slammed line; a labelled slam takes 5–6 beats instead of 3–4, which slows the beat-per-word rhythm.
- Do not use this mode when the viewer must read more than about five words at a time.
- Do not use a second claim, or a whiteout anywhere else: the peak is marked by being the only one (X21).
- Do not set a claim whose counter opens onto night with `to: 'portal'`: an ink letter on paper would fill solid (refused by `npm run fit`).

## Checks

- **P0**: `npm run fit` reports no errors (every scene readable within its ceiling, the four tiers of api 3, the rules' `validate`); `npm run audio` passes (registry, limits, the reading cross-check: ≥ 0.3 s per word, glance ≥ 1 s, URL ≥ 3 s, every step and swap word before the last readable in its beat); `npm run palettes` passes; every number on screen is a `{fact}` (with `{lufs}` from `measure.json`) or comes from the subject's own source; no word or dot crosses the 150 px margin at rest (a display word, full stop, claim line or counter value that still crosses it at its auto-fit floor is a red banner and a page error from `film.js`, 2026-10-19); the bloom ends on the exact accent hex the name scene uses (no step at the hand-off); `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; flashes ≤ 3 a second (the portal is the risk: keep the claim at the name's width); the same frame renders identically twice.
- **P1**: each word lands on its beat with its sound (onset within 2 ms, peak within one frame); the dot lands with the last word of each phrase; `check-film` T0, T1, T2, T3 and hold rows PASS; the drop is on the name and the half bar before it is silent and still; the claim's hit is on its bar line with the second drop; every scene change is a dot transformation, the whiteout and portal of the one claim, or a downbeat contrast flip; the closing card's second move lands on the last downbeat; information text ≥ 25 px.
- **P2**: the split's buds arc over the words, not through them; the burst's particles condense left to right into the next word and leave no stray particle; the scan's hairline never crosses a word that is still being read; streaks stay out of the type band and clear of the step counter; the bloom moves as ink in water (lobes, fronts curling into tendrils, drops merging into one mass) until it evens out, reads as pigment (pale wash where thin, deepened accent where thick, a dark tideline at the front, no glow and no stair-stepped edge); grain visible on the accent field but not dirty.

## Known issues

- **Bloom** (final): v4 is approved as the final version (owner, 2026-10-19). The earlier versions and why they were dropped: batch 1 stiff; 2026-10-18 a splat; v2 stiff; v3 (lit volume) not satisfying; v4 follows a stable-fluids ink-in-water page (workshop `works/skill-modes-v1/batch3/ink-bloom/`). Do not change its look.
- **api 3 and the five library devices** (2026-10-19): swap, burst, scan, whiteout and portal are new in the template and seen by the owner only as library samples; the demo v2 (workshop `works/skill-showcase/demos-v2/ink/`) is their first film. Values are `draft` until the owner has seen it.
- **The portal through heavy type**: Archivo 900 has small counters, so even at normal width the push keeps most of the frame black for about 4 frames; the claim's other glyphs leave first so only the counter's strokes sweep (flashes 2.5 a second, 2026-10-19). The cut that `check-film` detects inside the push lands within 2 frames of the claim's last beat at 124 bpm; at other tempi it may drift (the lead is in beats, the stroke exit in p).
- **The loudest moment** is the name's drop (about 50 % of the film), not the claim's (about 0.1 LU below, both measured 2026-10-19); `check-film` reports it as INFO.
- A film that opens on the bloom (the shortest chain) has its `turn` key on frame 0, where no frame precedes it: `check-film` reports no picture and no sound onset there (two WARNs). Expected; list it in the film's README.
- The bloom is baked: `bloom-bake.mjs` simulates it in about 3 s and writes a 6 MB `assets/bloom/field.inkz` (kept out of Git); without it the bloom is a plain disc with a red banner, not acceptable. Drawing runs on the CPU at about 20 ms a bloom frame; the 35 s example renders in about 50 s on an M4 Pro with 2 workers (2026-10-19).
- **Change of ground**: about 9 beats (no paper left from the bloom's beat 6.8, then the name's 7.5 beats until the wipe or scan), measured 2026-10-19 on the rendered film (v4); the last paper is a gap or two at the frame's edge, filled over 6.3–6.8. `check-film` reports the accent field over 2 bars as INFO.
- The labels are 28 px, below the 40 px target for main text (see Type).
- **Streaks vs the generated plate**: crisper and more regular than the source's light streaks; no lens glare or scanline shimmer beyond a faint drift. Now on one beat per `steps` scene.
- The step counter `STEP n / N` changes every beat; only its final state counts as read (glance), the dots carry the progress in between.
- No persistent frame (theme rule 3); the dot is the through-line instead, as in the source.
- The sound was verified by levels, onsets and loudness only, not by listening.
