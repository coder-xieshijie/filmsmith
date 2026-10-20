# Pulse · 节拍 (`pulse`)

A question acted out as a query: huge condensed type asks it one word per beat at a fixed anchor while the ground flips along one hue's lightness ramp, a highlight hops over the real candidates, the answer locks, and the film's one whiteout slams it in amber on the music's drop; the camera then pushes through the answer's own 0 into the figures that explain it, and the name lands again. Aesthetic anchor: "like a benchmark query run live, cut to a beat".
Theme: tech-product-launch · Template: `assets/templates/pulse/` · tempo 112–120 BPM, default 120 (length follows the copy; the shipped example fits 16 bars = 32.0 s, the shortest cut 6 bars = 12 s) · timing API 3 · Status: owner-accepted 2026-10-19 (batch 4 style sample); template 2026-10-19

## Fits / does not fit

Fits: a version release that answers one question ("which build is fast enough?"), a benchmark with one winner, a configuration or option that passes a limit the others miss, a single conclusion with two or three supporting numbers; launch teasers of 12–40 s.
Does not fit: a product without a measurable question and real candidates (ink or plakat); a workflow with parts and flows (blueprint); many numbers or a distribution (tally); a mechanism to understand step by step (trace); a terminal tool whose look is its UI (phosphor); copy that needs more than five words at a time. The mode is chosen by structure (a question with an answer), so the candidates, their values and the query line are always the product's real artefacts (principle 9): builds, configurations, the real bench command.

**How it differs from ink.** Both slam heavy condensed words on the beat. Ink is one continuous take on paper whose protagonist is an ink dot (a full stop that hops, blooms into a field and ends as a cursor); its scene changes are things the dot does. Pulse has no dot and no paper: its protagonist is the query (the question, its machine form in the query line, the candidates, the answer), its grounds flip along a colour ramp through geometric apertures, and its climax is a search that locks and a whiteout, not a bloom. Ink suits a name or a claim; pulse suits a question with a measured answer.

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **Version release: "what changed" as a benchmark answer, 30–40 s** (best fit) | `quench` 4.0, an incremental build tool: which build rebuilds 2,400 files under 1 s? none of 3.7–3.9 · why: one edited line rechecks everything · in 4.0 an edit rechecks only its importers · the re-run locks 4.0, `0.6 s` · through the 0: 14 files, 3.2×, 8.0× · the lock-up (the shipped example, 32 s) | `ask` ×2 → `search` (no pass) → `data` → `ask` ×2 → `search` → `reveal` → `data` → `name` |
| Reel or sting, 12 s | the same question in two asks, one search with the answer, the reveal as the ending (the shortest cut) | `ask` → `ask` → `search` → `reveal` (`rest: true`) |
| Configuration that passes a limit, 20–25 s | a cache layer: which eviction policy keeps p99 under 5 ms at 80 % hit rate? LRU, LFU, ARC, `tinyLFU` locks; two figures; the name | `ask` → `search` → `reveal` → `data` → `name` |
| Benchmark against the field, 20–30 s | a JSON parser: which parser streams 4 GB under 2 s? four real builds, the answer in amber, the throughput and the ratio to the old build | `ask` ×2 → `search` → `reveal` → `data` → `name` |

Best fit: the mode's two signature devices, the search that locks and the whiteout that slams the answer, need a question whose answer is a measured value, and a release is the moment a product has one.

## Mode principles

1. **One anchor, one word per beat.** Every asked word sits on the same left edge and baseline (160, 660); only the word and the ground change, on the beat. The eye never travels between words. *(Narrows 3, one idea per beat; a fixed fixation point needs no re-orienting saccade.)*
2. **The query is real.** Every word's machine form types into the query line under it (`--builds 3.7,3.8,3.9`, `--max 1s`); the candidates are real options with their measured values; the verdict, the answer, the pass count and every ratio are computed from them (`{answer}`, `{pass}`, `{x:<label>}`). The corner labels carry only these real parameters: no timecode, no HUD. *(Narrows 2, precision, and 9, the style points at the content.)*
3. **Grounds flip along one hue's ramp.** Four lightness steps of one hue plus a tinted near-white; the ground changes through a geometric aperture or a hard invert, never a fade, and every pair of type and ground is checked. *(Narrows 7, one system; departure, see Accent role.)*
4. **Amber means the answer.** The accent marks only the answer: the locked cell, the revealed value, the version in the lock-up. Never a word for emphasis. *(Narrows 7, one accent, one meaning.)*
5. **One whiteout, on the drop.** The film has exactly one flash: the exposure build into the reveal, two white frames on the bar line of the music's drop, the answer slamming in. A second flash would make the first ordinary. *(Narrows 4 and 5: the climax as T3, isolation effect, von Restorff 1933; sound and picture synchronised on the hit, Chion 1994.)*
6. **The pulse is audible and visible.** Something lands on every beat of the build (a word, a hop, a value); the bed carries a muted kick on every beat from the first word; scenes before the climax are the shortest and the stretch after it a release. *(Narrows 5, the four tiers.)*

## Palette presets

| id | name | fits | ramp[0] / [1] / [2] / [3] | white | dim | accent |
|---|---|---|---|---|---|---|
| `indigo` | Indigo (source) | default; launches, version releases, benchmark answers | `#0D0C14` / `#24206B` / `#4B43E6` / `#ECEAF7` | `#F4F3FA` | `#8F8CA8` | `#FFC53D` |
| `petrol` | Petrol | infrastructure, data and storage; cooler, quieter | `#071214` / `#0C3A40` / `#0F717A` / `#E1F0F0` | `#F2F8F8` | `#7E9A9D` | `#FFC53D` |
| `graphite` | Graphite | sober benchmark reports, security and compliance; the amber carries all the colour | `#0E0F11` / `#2A2D33` / `#5A606B` / `#E9EAEC` | `#F5F5F6` | `#8E939C` | `#FFC53D` |
| `coral` | Coral red | launches whose brand colour is a coral or pink-red; wine and raspberry grounds, the flat coral answers | `#1C080C` / `#561525` / `#B42F52` / `#F8E1E4` | `#FCF5F5` | `#AD9093` | `#FF6452` (on ramp[0] and ramp[1] only) |

Checked by `npm run palettes` (`standard`, WCAG 2.2): every text role on every ground it can land on ≥ 4.5:1 (the 31 px query line is the smallest text), the accent ≥ 3:1 as display type and fills, the highlight fill ≥ 3:1 against the search ground; 21 pairs a preset (20 in `coral`), 83 in all, all pass. Weakest pairs: the highlight on ramp[0] (indigo 3.00, graphite 3.03, coral 3.18, petrol 3.31) and the accent on ramp[2] (petrol 3.63). `coral` (2026-10-19, `derived` from a brand guide's flat accent `#FF6452` and gradient `#FF3763` → `#FF7038`): the accent is the flat colour unchanged (6.61 on ramp[0], 4.70 on ramp[1], ink on it 6.61); the ramp is the same red pushed toward the gradient's cool end (OKLCH hue 10° at lightness 0.17 / 0.31 / 0.52 / 0.93), so the mid step is ΔE00 24.9 from the accent, darker (2.07:1) and cooler. Its `accentOn` lists ramp[0] and ramp[1], the only grounds the template draws the accent on: an accent of relative luminance under 0.40 cannot pass 3:1 on a ramp[2] that itself passes 3:1 over ramp[0], and the lightest coral on its own hue that would (`#FF9484`, ΔE00 10.3) reads as salmon. Who sets which colour on which ground is decided in one function (`onGround()`): white type on the three dark steps, ramp[0] on ramp[3], ramp[1] on white; the accent never lands on the two light grounds (amber on a light step fails 3:1). Indigo is the sample's palette (`owner`, accepted with the sample 2026-10-19); petrol and graphite are the same lightness steps on another hue (`derived`), the mid step carrying the most chroma (Taylor's rule, system.md, `borrowed`).

## Variants

**Colour**: the three presets above (`indigo` default; `petrol`; `graphite`).

**Form: `aperture`**, the shape of every mark that opens or holds something (2026-10-19, not yet seen by the owner; the default renders as the template did before the field existed). Choreography, timing, type and colours are the same.

| `aperture` | What changes | Choose it for | Source |
|---|---|---|---|
| `cut` (default) | ask apertures alternate a band opening from the word's middle and bars closing from top and bottom; scene apertures close; square cells; the closing flip is a band | most films; the hard, engineered voice of a query | the sample's band and closing bars (`owner`); the geometric aperture-per-beat grammar of a gallery title sequence (`borrowed`) |
| `round` | every aperture is a circle from the word's optical middle; cells with a 56 px radius; the closing flip is a circle | consumer-facing and friendlier products, mobile and design tools; reels where the circle reads as a lens | the sample's circle (`owner`); the iris of film title design (`borrowed`); radius `derived` |

Why the aperture and not another axis: it changes the silhouette of every transition and cell while keeping the anchor, the ramp, the type and the timing; a second typeface would break the one-family display voice, and a second accent the answer's meaning.

## Accent role

- **Accent** (`accent`, amber `#FFC53D` in every preset) marks one thing: the answer. The locked cell of a search, the revealed value, the version in the lock-up when it is the answer. Never a word, a figure, a label or emphasis. As a mark it covers well under 10 % of the frame (median 0 %, measured 2026-10-19 on the example), except while the camera pushes through the answer's counter: for under one second the amber glyph fills most of the frame (max 47 % at 23.27 s), a change of ground of under two bars.
- **Change of ground** is the ramp: the asks walk mid, black, light, deep; a word ending in `?` lands on the tinted white; searches stand on ramp[0], the verdict on ramp[1], figures on ramp[2]. The ramp's hue marks nothing: it is the film's ground, the way paper is ink's. This departs from principle 7's "neutrals plus a single accent" at layer 4 (unity): the grounds are lightness steps of one hue instead of neutrals, because the beat-by-beat flip is the mode's rhythm and a neutral ramp cannot carry it (graphite is the neutral case). The owner accepted it with the sample (2026-10-19).
- **No effect colours**: the whiteout has no channel offset (the sample's split used the ramp's own blue and white; the template drops it). No status or category colours.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Asked words, verdict, cell labels, figures, name | Barlow Condensed 900, −0.01 em | OFL | words 364 (floor 233), cell labels 186, figures 364 / 291 by rows (floor 186), name 364 (floor 291) |
| The revealed answer | Barlow 700, −0.015 em | OFL | 568 (floor 455) |
| Lines: the restated question, values, labels, the reveal's line, the tagline | Barlow 600 | OFL | 61 |
| The query line; the install command | JetBrains Mono 500; 600 | OFL | 31; 49 |

One superfamily in three widths plus one mono (system pairing rule). The answer is set in the normal-width Bold, not the condensed Black: its counter must hold the next scene, and Barlow Bold's 0 opens 110 × 270 px at 568 px where the condensed Black's opens about 30 % narrower (the sample's portal through the extra-condensed 0 was too thin to read; `derived`). Information text ≥ 31 px; main text ≥ 49 px; nothing is decoration. The query line (31 px) is glance text: the machine form of the word above it, safe to delete. Sizes `derived`; the condensed black and the mono `borrowed (source)`.

## Type scale

25 × 1.25ⁿ: **31 · 49 · 61 · 186 · 233 · 291 · 364 · 455 · 568** in use (the series 25 · 31 · 39 · 49 · 61 · 76 · 95 · 119 · 149 · 186 · 233 · 291 · 364 · 455 · 568; `derived`, a major third, fine enough that every auto-fit floor is one or two steps down). Levels per frame, at most three: ask word 364 + query 31 (2); search cell labels 186 + lines and values 61 + query 31 (3); data figures 291 + labels 61 + query 31 (3); reveal answer 568 + line 61 + query 31 (3); lock-up name 364 + tagline 61 + command 49 (3). The verdict replaces the row at the anchor (364 + query 31). Auto-fit steps down the series only.

## Frame and grid

1920 × 1080, 160 px margins (content 1600 px). The anchor: left edge 160, baseline 660; its optical middle (baseline − 0.36 × size) is every aperture's centre. Query line baseline 990. Search: the restated question at 300, cells from 380, 420 high, up to 380 wide with 40 px gaps, label baseline +220, value +370. Data figures on baselines 640 (one), 480 / 790 (two), 330 / 600 / 870 (three), labels after the figure. Reveal: answer baseline 720, line 870. Lock-up: name and version 600, tagline 720, command 860. No persistent frame: the anchor and the query line are the through-line (principle 7). Seeded grain tile, overlay 5 %. Content area for measurement: the whole frame. No deliberate overlaps; text that crosses the margin at its floor is a red banner and a page error.

## Scenes

| Type | Purpose | Length (120 BPM, example) |
|---|---|---|
| `ask` | The question, one word per beat at the anchor through an aperture, its machine form typing under it; the hook is the film's first word slamming on beat 1 | 1.5–2.5 s a phrase (two asks for a question of more than about five states) |
| `search` | The real candidates in cells; a highlight hops (new ones a beat, known ones an eighth); values rise; the answer scrambles and locks in amber, or the verdict says `0 of 3 pass` at the anchor | 2–4.5 s |
| `data` | One to three figures, a beat apart, each with its label; scramble or count in fixed digit slots | 3.5–4 s |
| `reveal` | The climax (T3): the whiteout on the bar line of the drop, the answer, its line read as a claim; then the push through its counter | 2 bars |
| `name` | The lock-up (T3): name and version, tagline, install command; the ground flips once more on the last downbeat | ≥ 4.5 s + the phrase rounding |

Slots, limits and the per-type timing: `TEMPLATE.md`. Length follows content (`lib/timing.js`, API 3): a state carries ≤ 5 primary words (the claim ≤ 8), a scene ≤ 6 s, the reveal starts on a bar line (the search before it spends the wait on extra highlight laps, never a held frame), and the film rounds to a 2-bar phrase. Shipped example: ask 0–2.5, ask 2.5–5, search 5–9.5 (verdict at 7.5), data 9.5–13.5, ask 13.5–16, ask 16–17.5, search 17.5–20, reveal 20–24 (63 %), data 24–27.5, name 27.5–32. Shortest cut: `ask` → `ask` → `search` → `reveal` with `rest: true`, 6 bars, 12 s at 120 (12.9 s at 112), climax at 67 % (2026-10-19).

## Signature transformations

- **aperture** (word to word, scene to scene; T0/T1, `aperture-swap`): the word holds the anchor while the next ground opens in a band, closing bars or a circle from its optical middle, on the beat, 0.2 s cubic out (sources fused: an anchored word with a geometric aperture per beat from a gallery title sequence; one word per colour field from gallery launch films; ours: the ground walks one ramp and the word's machine form types under it). `borrowed` grammar, `derived` values.
- **invert** (T2, a change of topic): a hard flip to the tinted white on the downbeat; the word slams (scale 1.06 → 1 and blur 6 px → 0 in 0.2 s) so the flip lands as an impact. `derived`.
- **roulette and lock** (inside a search; T0): a highlight hops one cell a beat (an eighth over candidates already seen), each new value rises under it, the answer's digits scramble at 24 Hz in fixed slots and lock; the others dim (expectation and resolution, Huron 2006). Template-local, because the library's `roulette-lock` frames labels only. `borrowed` grammar, `derived` values.
- **whip** (T2, `whip-push`, after a verdict into its evidence): the evidence card pushes the verdict off to the left in 0.15 s with a 64-tap motion streak, landing on the beat (motion streaks, Geisler 1999). `borrowed`.
- **whiteout** (T3, `whiteout-slam`, into the reveal, once): the camera leans into the locked cell while the frame exposes toward white over one beat; two white frames on the bar line with the drop; the answer lands in amber, blur and scale decaying to zero in 0.45 s, while the ground falls from white to ramp[0] in 0.3 s. `borrowed` grammar (a gallery launch film's slam), library values.
- **counter-portal** (T2, `counter-portal`, out of the reveal): the next scene is already in the answer's 0 from the first frame of the reveal, framed on its first figure; over the last two beats the camera pushes into the counter on an exponential zoom until it is the frame, the far scene growing slower (parallax 0.55), the push's fastest frame on a beat. Framing on the figure is the template's extension (TEMPLATE.md, Devices). `borrowed` grammar (title design's zoom-through), `derived` values.
- **slice** (T2, `slice-smear`, into the lock-up): the figures leave in 72 px bands at their own speeds, the lock-up resolves out of a smear in 0.13 s a band. `borrowed`.
- **closing flip** (the lock-up's second move): the ground flips from ramp[1] to ramp[0] around the fixed name on the last downbeat (a band, or a circle). `derived`.

**Against the nearest reference** (principle 10: the mode's fixed grammar, checked once here; 2026-10-19). The nearest reference is a gallery launch film that asks a question, runs a roulette over weekdays, slams the answer out of a flash and cuts on a bar pulse, in an orange, lime, purple and blue factory palette with a dark-ground orange HUD. Shared grammar (4): the ask–search–answer–supplement order; the roulette hop and lock; the exposure build and flash slam; one word slammed a beat. Not shared (6 of its motifs): the weekday and calendar subject (here real builds with measured values), the multi-colour factory palette (here one hue's ramp), the orange frame highlight (here a fill in the ramp's mid step, amber only on the lock), the dark-ground HUD with corners and timecode (here one query line of real parameters), the channel-split slam, its copy. So the mode shares 4 of 10 motifs, under half.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Tempo | 120 BPM default, range 112–120: a glance item stays still a full second and a hold after a landing lasts at most two beats, a second only at 120 or slower | `derived` (principle 5); 120 `owner` (the sample) |
| Reading | primary 0.3 s a word; glance ≥ 1 s still; the install command ≥ 3 s once typed | `standard` (principle 1) |
| First word | lands on beat 1; frame 0 is the ground and the prompt typing | `derived` |
| Aperture | starts on the beat, 0.2 s, cubic out (`aperture-swap`), hard antialiased edge | `derived` (sample 0.22 s) |
| Hook and invert slam | scale 1 + 0.1·d, blur 10·d px, d = (1 − q)^2.2 over 0.2 s (× 0.6 on an invert) | `derived` |
| Query typing | 12 ms a character; a fragment types with its word, a beat later when the word holds 3 beats | `borrowed (source)` / `derived` |
| Rise | lines rise through their mask in 0.22 s, expo out | `borrowed (source)` |
| Hops | first on beat 1; new candidates a beat apart, known ones half a beat; pop 3.5 % decaying over 0.12 s; a value rises 0.08 s after its hop | `derived`; pop `draft` |
| Scramble | 24 Hz, digits from a seeded hash, each in its own slot; data figures resolve in 0.35 s or count over a beat (expo out) | `borrowed` (X15 grammar) / `derived` |
| Lock | one beat after the last hop; the cell fills amber | `derived` |
| Beat pop | only where the beat grid or a phrase share leaves a last hold over two beats (an ask's last word, the verdict, a data scene's last figure): the focus pops 3.5 % over 0.12 s on the beat that splits it, about the anchor point; no new text, no sound of its own (the bed's kick is on the beat) | `derived` (the hop's pop; 2026-10-19) |
| Whip | 0.15 s from 0.15 s before the beat, quint in-out, 64-tap shutter of 0.75 frame | `borrowed` (library) |
| Whiteout | build 1 beat (exposure u^2.2 to 94 % white, lean 1 + 0.14·u²), 2 white frames, shock 0.45 s ((1 − q)^2.2), no channel offset; ground falls from white in 0.3 s on an S-curve | library values `borrowed`; the fall `derived` (no frame of it reads as a cut, check-film 2026-10-19) |
| Portal push | 2 beats, eased in-out (bezier 0.7, 0, 0.3, 1), landing at 94 % of the push; parallax 0.55; sub-frame motion blur | `borrowed` (library); 2 beats `derived` (2026-10-19: over one beat its fastest frame fell between beats and read as an off-beat cut) |
| Slice | 0.5 s from 0.33 s before the beat: bands leave in 0.25 s (expo in), the next resolves in 0.13 s a band | `borrowed` (library) |
| Closing flip | the aperture on the last downbeat | `derived` |
| Ambient | none: every change sits on a beat; the grain is fixed | — |

## Sound

Bed: built in `score.mjs` from the shared voices, D minor at the film's tempo. The build (every bar before the reveal): a muted kick on every beat from the first word, offbeat hats from bar 2, a rim on 2 and 4 from bar 3, a sub on each bar, a sixteenth-note "query" synth whose filter opens toward the drop (it rests under reading scenes), Dm9 · Bbmaj7 · Gm9 · A7sus4. The gap: the beat of the exposure build is near-silent but for a riser and a swell. The drop lands with the whiteout on the reveal's bar line: full kick, pumping sidechain, claps, open hats, offbeat bass, the progression lifting to Dm9 · Bbmaj9 · Fmaj9 · C6; after the reveal it eases 2.5 dB (the release); the lock-up is the outro, a soft muted kick and the chord ringing out. Effects on the picture's frames: a stamp and thud on each word, typing keys under the query line, a tick and thud on each aperture, a pop on each new hop and a tick on each known one, a glitch under each scramble, a chime and stamp on the lock, a low thud and bell on a failed search, a whoosh into the whip, an impact and rim on the invert, a stamp per figure, ticks under a count, the impact, whoosh, rim and chime of the whiteout, a whoosh up the portal push, a whoosh under the slice, an impact on the name, a chime on the last downbeat. Master −14 LUFS, true peak ≤ −1.5 dBTP, `tone: 'v2'`. Not yet confirmed by ear.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here.

- The `indigo` preset: an indigo ramp, a tinted white, amber for the answer.
- Barlow Condensed Black for every asked word and figure; Barlow Bold for the answer; JetBrains Mono for the query line.
- The anchor at (160, 660) and the query line at 990 in every ask.
- The ramp walk of the asks (mid, black, light, deep) and the white ground for a `?`.
- `cut` apertures: band and closing bars.
- A first search that fails (`0 of 3 pass`) with an empty slot, then a re-run that locks.
- The whip into the evidence, the invert into "what changed", the slice into the lock-up.
- The answer's 0 as the portal into the supporting figures.
- The bed in D minor at 120 BPM with the drop on the whiteout.
- The example copy: "quench" 4.0, a made-up incremental build tool (`which build rebuilds`, `2,400 files under 1 s?`, `0.6 s`, `only build under 1 s`, `npm i -D quench@4.0.0`).

## Don'ts

- Do not colour anything but the answer amber: not a word, a figure, a label, a highlight (principle 7).
- Do not use a second flash, a second whiteout or a white flicker anywhere: the whiteout is the film's one peak (mode principle 5; the template refuses a second `reveal`).
- Do not ask about weekdays, dates or anything calendar-like, and do not build a multi-colour factory palette or a dark-ground orange HUD with corners and timecodes: those are the nearest reference's signature.
- Do not put anything in the query line that the product would not accept as a real parameter, and no decorative labels in the corners (mode principle 2).
- Do not type a result: the verdict, the answer, the pass count and every ratio come from the candidates (`{answer}`, `{pass}`, `{x:<label>}`, principle 2).
- Do not move the anchor for a long word, and do not shrink type below its floor: rewrite shorter or split the question into two asks (mode principle 1).
- Do not crossfade grounds: every change is an aperture, an invert, a whip, a slice or the portal (principle 4).
- Do not set the answer in the condensed face: its counter must hold the next scene (Type).
- Do not use this mode when there is no question with a measured answer.

## Checks

- **P0**: `npm run fit` reports no errors (API 3: ≤ 5 words a state, the claim ≤ 8 in a pause, scenes ≤ 6 s, steps ≤ 2 beats, T0 gaps ≤ 4 beats, T2 count and ≤ 3 uses a device, 2–3 peaks with the climax at 60–85 %); `npm run palettes` passes (63 pairs); no red banner (margin, fonts); every number on screen is a fact computed from the candidates or comes from the product; exactly one whiteout, on the reveal's bar line; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL, flashes ≤ 3 a second (WCAG 2.3.1).
- **P1**: every word, hop, value and figure lands on its beat with its sound; the drop is the whiteout's frame; the run into the reveal is the shortest stretch and the scene after it a release; the counter shows the next scene's first figure from the reveal's first frame; the portal lands on the next scene's first beat; no step holds still over two beats outside the reveal's claim pause and the lock-up; the closing flip lands on the last downbeat.
- **P2**: the answer's edges stay clean on white during the shock (no dark halo); digits never jitter in their slots; the whip's streak reads as speed, not bands; the portal's counter edge never shows a seam; the grain is constant.

## Known issues

- **Library switch** (2026-10-19): apertures, whip, slice and whiteout come from `lib/transitions`, the portal from `lib/handoffs`; the search's roulette and the framing inside the counter stay in the template (TEMPLATE.md, Devices). The whiteout's ground is painted by the template so the module's blur does not leave a dark halo round the answer on white.
- **Not yet seen by the owner**: the rebuilt reveal (63 % instead of the sample's 58 %, the answer in the wider Bold with a 110 × 270 px counter, the figure already inside the counter, the two-beat push), the beat structure of the bed, the `round` variant and the `petrol` and `graphite` presets (`round` + `petrol` rendered as the shortest cut only; `graphite` checked by contrast table only).
- **Grid holds** (fixed 2026-10-19): the beat grid left the first search's verdict holding 2.17 beats and the closing data 2.04 beats. A beat pop now splits each (9.0 s and 26.5 s in the example; the longest still of that search is now 0.70 s and of that data 0.57 s, and the film's longest still went from 1.07 s to 1.00 s), and `steps()` reads `ctx.dur`, so `fit()` checks the holds as drawn, the shortest cut's highlight laps into the reveal included; `npm run fit` has no warnings. The shortest cut still warns at T1/T3 (five compositions in 12 s: no speeding-up or slowing-down run, the two before the reveal are not the shortest, no release after it), unchanged by this fix.
- Into a reveal the answer's digits keep scrambling through the build (the answer is withheld until the whiteout), so a still of the build shows random digits.
- During the push the amber 0 fills up to 47 % of the frame for under a second (Accent role).
- The sound was verified by levels, onsets and loudness only, not by listening.
