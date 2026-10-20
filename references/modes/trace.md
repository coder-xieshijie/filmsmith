# Trace (`trace`)

A dark 3Blue1Brown-style diagram in which an algorithm runs live and the picture is its state: chips fuse, a histogram counts, a rule list grows, a token bar shrinks. Aesthetic anchor: "like a 3Blue1Brown scene where the numbers are produced on screen by the actual run".
Theme: tech-explainer · Template: `assets/templates/trace/` (timing API 3) · length follows content, 88–104 bpm (default 96); the example fits to 36 s (15 bars at 100 bpm, scenes 4–7 beats) · Accepted 2026-10-17 (genre demo 06: "this motion style is also good, and its music is quite good")

## Fits / does not fit

Fits: one mechanism or algorithm that can run on a tiny input in the browser and whose state merges, sorts or reduces — tokenisation, compression, sorting or searching, counting, any "repeat a simple rule" process whose steps fuse pieces and shrink a total; a proof that a method works on a case it never saw.
Does not fit: claims without a mechanism (use a launch mode); processes too large to show on ≤ 6 rows of chips; continuous maths that needs plots and curves (the pieces are discrete); anything whose numbers cannot be computed by a run module in the project; mechanisms whose state is a reassignment or a mapping rather than a merge, a sort or a reduction — consistent hashing, load balancing, scheduling, routing, where items move from one owner to another and nothing fuses. The scene registry (count, step, loop, summary, probe) only fuses chips, counts them in a histogram and shrinks a token bar, so such a run can only be forced into merge-type scenes, and fusing chips then says the wrong thing (a consistent-hashing explainer, 2026-10-19 test: keys "collapsing" into a server). No trace scene shows reassignment yet. Use blueprint when the point is the parts and where each item goes (owners as parts, items as inputs and outputs), or tally when the point is how many items move (items as squares in one band per owner, the moved ones as a flag a `split` sorts first).

## Use cases

What the pieces are made for: a rule applied again and again to adjacent units of a short input, with something that counts and something that shrinks (2026-10-19).

| Scene | Example: mechanism, and what the film says | Run module |
|---|---|---|
| **A tokenizer learning its vocabulary (best fit)** | BPE: count adjacent pairs weighted by word frequency, merge the winner everywhere, repeat; 79 tokens become 29 and the unseen `lowest` still splits into `low + est`. Every piece is used: the histogram counts, the rule list is the vocabulary, the token bar is the through-line, the probe is the proof. The 10 s cut of the same idea: `git / commit / digit`, `i + t → it`, then `g + it → git`, "Merged pieces merge again" | `bpe` (shipped) |
| A compression rule and its limit | Run-length encoding of a 16 × 4 picture: each run is written once as `count×value`, 64 symbols become 24, and a row of noise grows from 8 to 16: the probe shows where the rule stops paying | `rle` (shipped) |
| A divide-and-merge procedure on a short sequence | Bottom-up merge sort of eight numbers: neighbouring runs fuse into sorted runs, 8 → 4 → 2 → 1 in three passes, the bar counting runs; the film says each pass halves the runs, so n items take log₂ n passes, and a reversed input (the probe) takes the same three | to write (`steps()` per pass; fused chips relabel, so their letters converge, then the sorted label fades in) |

Choose the first when the mechanism learns something from data; the second when it transforms one input by a fixed rule; the third only when the steps really fuse neighbours (a swap-based sort or a search does not: its chips would cross each other or be discarded, which the pieces do not draw).

## Mode principles

1. **The run draws the picture.** Every chip, count, rule and total on screen comes from `runs/<name>.js` executed in the page; copy carries placeholders. Nothing is illustrated "roughly". *(Narrows 2, precision is a gate.)*
2. **Four semantic colours, one meaning each.** base = untouched, active = being acted on now, learned = produced by the algorithm, unseen = new input; caption words take the colour of the thing they name, and only that thing (in "79 tokens → 29" only the 29 was learned). *(Narrows 7, one system, one accent, one meaning: active is the accent, the other three are category colours.)*
3. **Slow first, then compressed.** The first two steps get a scene each, the first the slowest (the pair lit for a beat and a half before it fuses); the rest run as loops at one merge every two beats, and the last loop may run at one a beat into the result (`pace: 1`), so the steps speed up into the climax. A viewer learns the rule once and then watches it repeat. A short insert cut into a reel shows the rule briefly and its claim: under api 3 the shortest is step 1 → step 2 → loop → loop (`pace: 1`, entered by path) → thesis, about 16 s (the 10 s loop → thesis insert of 2026-10-19 has one composition in its first 5 s and a hold of over two beats before the claim's bar line, so it no longer passes); it cannot teach the rule at length, so it does not pretend to, and its README says so. *(Narrows 5, fast and slow passages alternate, and the four tiers: a run that speeds up into the climax; fixes the source's too-fast merges.)*
4. **Show the weighting, don't say it.** When a count is weighted, each contribution flies from its source and becomes a visible segment of the bar. *(Narrows 3, one idea per beat: signalling by showing; fixes the source's said-not-shown weighting.)*
5. **Only the regions in play are lit.** Board + histogram while counting; board + rules in the loop; the bar alone for the summary. Never more than three regions at once. A dimmed region dims its shapes; its text stays at ≥ 3:1 and carries nothing new while dimmed. *(Narrows 3, one protagonist per frame; and 1, dimmed context text.)*
6. **One through-line object.** The token bar is on screen from the first count to the last frame and changes only when the algorithm changes the data; its count becomes the summary's result and the closing move lights it again. *(Narrows 7, through-line object.)*
7. **Smooth, brisk, then still.** 8-sample motion blur on every move, eased or critically damped at both ends, a small settle on each landing, then a hold of 0.2 s to 2 beats; each scene's first caption rises while the last one leaves, and a caption enters phrase by phrase; the camera moves twice (summary push, probe reveal); the summary and the thesis grow out of objects already on screen. *(Narrows 4, transform at the turns, and 5, motion locked to the beat and brisk: the owner's "light, direct, crisp" rule, 2026-10-18.)*
8. **The four tiers, carried by the run.** A micro change on about every beat, and each one is the run's (a weight lands, a pair lights, a pair fuses, a rule line arrives, a letter of the unseen input locks) or a phrase of the caption (T0); a new composition every 2–3 s (T1); every 8–12 s an expressive transition made of the diagram's own objects: the caption's line rolls into a loop for "repeat", the token bar's cells sweep up into the result, a front carried by a vector field passes over the data for a recount, and again over the unseen input as the probe turns into its reveal (T2, the last one, so none of the film's last 12 s goes without one); three peaks: the words splitting into chips (hook), the unseen input's reveal (the climax, read in a pause), the claim the chips grow into (lock-up) (T3). *(Narrows 5, the four tiers, owner-approved 2026-10-19.)*

## Palette presets

| id | name | fits | ground | text / dim | base | active | learned | unseen |
|---|---|---|---|---|---|---|---|---|
| `ink` | Ink (source) | default; tokenisers, models, anything "3b1b" | `#0C1013` | `#E6ECEF` / `#8A97A0` | `#7D8A93` | `#F7D96F` | `#5CD0B3` | `#FC6255` |
| `paper` | Paper | light rooms, print, docs-like | `#F5F2EA` | `#1A1E21` / `#5B646A` | `#2C3236` | `#2456C8` | `#077562` | `#C2362C` |
| `chalk` | Chalkboard | teaching, maths-flavoured | `#17221F` | `#EEEDE6` / `#9AA8A2` | `#84908B` | `#F6C945` | `#8FD0F7` | `#FF8F70` |

All checked by `npm run palettes` (`standard`): every semantic colour ≥ 4.5:1 as text, bar cells ≥ 3:1, every pair of semantic colours ΔE ≥ 15 (normal) and ≥ 8 (protan, deutan). `ink` keeps the source hexes (`borrowed (source)`) except `base`, darkened from `#AEB9C1` to `#7D8A93` because the source grey and the learned teal were indistinguishable under deuteranopia (ΔE 1.9); `paper`'s active is blue because amber on paper failed both contrast and red/amber separation (`derived`); its faint (bars and rules, decoration only) is the cool `#D3D9DE`, the hue of its text greys at the same L* (was the warm `#DDD8CC`, 2026-10-18). `ink`'s three hues are manim's named colours (`borrowed (source)`): learned and unseen are `TEAL_C` and `RED_C` (in both ManimCommunity `manim_colors.py` and 3b1b `default_config.yml`), active is ManimCommunity's `YELLOW_C` `#F7D96F` (was `#FFD23F`, which matched no named manim colour; 13.75:1 on the ground, 2026-10-18). Colours taken from the domain's own tool are the strongest kind of named-colour source, so `ink` keeps them: the manim colours were kept and the off-manim presets `ink-h9` and `ink-far` deleted (2026-10-18, accepted on the recommendation; the owner did not compare it shot by shot), and the active and paper-faint changes are settled by theory (the owner did not object).

## Variants

**Colour**: the three palette presets above (`ink`, `paper`, `chalk`); semantic colours change hue between them, never meaning. **Form**: one content field, `stroke`, independent of the palette (2026-10-19; template `TEMPLATE.md` "Variants").

| `stroke` | What changes | Pick it for | Source |
|---|---|---|---|
| `vector` (default) | Exact rounded outlines, as in the source film | Films whose claim rests on exactness: a production tokenizer, a benchmark, a launch; anything "3b1b" | `borrowed (source)` |
| `sketch` | Every box drawn as by hand: each edge twice, slightly bowed, its ends wandering ≤ 2 px and overshooting the corner ≤ 4 px (× board scale); dashed boxes once. Histogram segments keep their exact ends; token-bar cells, the path line and all text stay exact. Choreography, colours, type and timing do not change | A lesson or a whiteboard-style walk-through, an RFC or early design ("this is how we think it works"); pairs best with `chalk` or `paper` | Sketchy rendering of charts raises engagement and willingness to annotate, and worsens size and ratio judgements as sketchiness rises (Wood et al. 2012, the Handy renderer); architects preferred sketches for early drafts because they invite discussion, CAD plots for final ones (Schumann et al. 1996); varying sketchiness reads as uncertainty (Boukhelifa et al. 2012); stylised strokes must stay attached to their object or they flicker and slide (Bénard, Bousseau & Thollot 2011); double stroke, bowing and a seed after rough.js (`borrowed`); amplitudes `draft` |

Rules for `sketch` (`derived` from the sources above): the whole film is sketched or none of it, since sketchiness varied by item would read as uncertainty; a length that encodes a quantity keeps its exact ends; the wobble is seeded by the object's identity (a chip is the span of original units it covers), never by time or position, so a sliding chip keeps its outline and a landed one never boils (C6). Both values pass the same P0 and C1–C8: only outlines change, not the motion, so C1–C5 and C7 are those of the default; C6 and C8 were measured on the 10 s demo (`check-film` PASS for both; a still chip's frames pixel-identical 0.5 s apart, 2026-10-19).

## Accent role

- **Accent: `active`** marks one kind of thing, what the algorithm is counting or acting on right now: the highlighted pair on the board, the picked histogram bar, the flying weights, the rule line flashing during the probe replay, and the caption words that name them. Nothing is yellow (blue in `paper`) because it is important; as a mark it stays well under 10 % of the frame (a few chips and one bar).
- **Category colours: `base`, `learned`, `unseen`.** Three kinds of unit, one meaning each, all film: untouched input, produced by the algorithm, never seen by it. They follow principle 7's category role (few, separable hues, checked under protan and deutan simulation). A chip changes category only through a fuse; the probe's chips start unseen and turn learned as rules fuse them.
- No status or effect colours, and no full-frame accent ground.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Title, subtitle, thesis | Source Serif 4 600–700, italic 400 for the subtitle | OFL | 82 thesis lines (fitted ≥ 56), 46 title, 30 subtitle |
| Chips, counts, rules, numbers | JetBrains Mono 500–600 | OFL | 54 × the board's scale (chips; 39 in the `rle` example, 64 in `bpe`), 76 summary line, 40 bar count and thesis stats, 26 histogram, rules, row labels, segment weights, headings, step counter |
| Captions, labels | Inter Tight 500–600 | OFL | 40 captions (fitted ≥ 34), 26 headings and notes |

Three families, the most principle 7 allows (two plus a mono), each with one job: the serif speaks for the author (title, the thesis), the mono for the run (everything the algorithm produces, fixed-width so letters line up as tokens fuse), the sans for the narration (captions, headings). `borrowed (source)`; minimums `standard`.

- **Information text is ≥ 25 px** (principle 1); nothing on screen is smaller, so there is no decoration list. Chips scale with the board, and `npm run validate` fails a run whose widest row would put them under 25 px.
- **Main text is 40 px** (captions, the bar count, the thesis stats), and larger for the chips, the summary line and the thesis. A caption longer than the 1,400 px measure is fitted down to 34 px instead of wrapping; keep captions to about 60 characters to stay at 40.

## Type scale

Ratio about 1.35–1.5: **26 · 40 · 54 · 76 · 82** (label · text · display), where 54 is the chips' size at board scale 1 and moves with the board (36–70 px), and 76 and 82 are one level (the summary line and the thesis never share a frame). The persistent frame (title 46, subtitle 30, step counter 26) is not counted.

Levels per frame in the content area: three at most plus the label level. Board scenes: chips (display) · captions and bar count (text) · labels (26). Summary: result line 76 · caption and count 40 · label. Thesis: lines 82 · stats 40 · bar label. The label level (histogram rows, rule list, row labels, segment weights, headings) is the diagram's table: it is read at a glance and repeats what the board shows (principle 3 allows one label level on a diagram page).

## Frame and grid

1920 × 1080. Title top left (x 130, baseline 104), step counter and `hud.a` top right (right edge x 1800, baseline 100). **Board**: scaled until its widest row (over the whole run and the probe) fills the left two thirds, x 130–1220, or its rows and the probe row fill the band y 176–806, whichever comes first, up to 1.3; then centred in that region. Rows 106 × scale apart, chips 82 × scale tall; row labels right-aligned 28 px left of the chips; the probe row 128 × scale below the last row. `bpe` is limited by height (scale 1.19, chips 64 px, board 677 px wide with its labels), `rle` by width (0.72, 1,090 px). **Right third**, x 1290–1800: histogram from y 250 (62 px rows, headings at 196), rule list at y 640 (42 px rows), or y 250 once the histogram is gone. Captions at x 130, baseline 872, ≤ 1,400 px wide. Token bar y 950 from x 300; its label above-left (baseline 942) and count (baseline 984) at x 130. Flat ground, no gradients or bloom; grain 3.5–5 %. Content area for measurement: y 150–1080 (below the title row).

## Scenes

| Type | Purpose | Ceiling (api 3) |
|---|---|---|
| `hook` | Input appears and splits into chips; token bar counts in (T3 hook on the split) | 6 s |
| `count` | Step 1's histogram, weight by weight | 6 s |
| `step` | One step: pick, highlight, fuse, rule (the first after the count is the slow one) | 6 s |
| `loop` | Further steps, one merge every two beats (`pace: 1`: every beat); split with `from`/`to` | 6 s |
| `summary` | Push onto the bar; the count grows into the result | 6 s |
| `probe` | The unseen input's letters resolve; the learned rules replay on it; the reveal (T3 climax, a second composition, a pause); hands off to the thesis | 4.5 bars: two compositions ≤ 6 s |
| `thesis` | The claim in one to four serif lines + a stats line entering part by part (T3 lock-up) | rest (closing; turn; absorbs the rounding) |

Any scene but the first and the thesis may enter by an expressive transition (`enter`: `path`, `sweep`, `flow`; Signature transformations); the probe may also turn into its reveal by one (`reveal: 'flow'`, 2026-10-19).

Slots and limits: `TEMPLATE.md`. Example run modules: `bpe` (source film), `rle` (alt: run-length encoding of a 16 × 4 picture, with a noise row as the probe).

## Length and tempo

No fixed length: `timing.rules.js` (timing API 3, since 2026-10-19) states each scene type's choreography in beats, every move it makes and what the viewer reads, and `npm run fit` sizes every scene to the beat and the film from the copy and the run, checks the four tiers and writes `renders/timing.json` with the key events, holds, micro events, shots, expressive transitions and peaks. Per-type choreography: `TEMPLATE.md` "Length and tempo". The values follow principles 4 and 5 (the four tiers, owner-approved 2026-10-19).

| Value | Setting | Tag |
|---|---|---|
| Default tempo | 96 bpm, the tempo of the generated felt-piano track in the source film, so that track can be the bed (the owner's spoken choice 2026-10-17, not an A/B) | borrowed (source) |
| Tempo range | 88–104 bpm (about ±8 %): calm felt keys below, the pieces' former 104 bpm tuning above | derived |
| Tempo of the examples | 100 bpm: most trace scenes take five beats, 3.0 s at 100, the top of the T1 median; 3.1 s at 96 | derived (api 3, 2026-10-19) |
| Grid | scenes round to one beat (`unit` 0.25 bar); only the thesis is a turn and starts on a bar line; the total is rounded to one bar, all of it to the thesis (`phraseShareBeats: 0`: a shared beat would lengthen a still hold past 2 beats; two bars left up to 7 beats of extra closing hold) | standard (principle 5) / derived (2026-10-19) |
| Reading | captions, the summary line, thesis lines and stats parts are primary text (0.3 s a word, in order, placeholders filled from the run); rule lines, histogram rows, row labels and the probe's size are glance text (≤ 6 words, each repeats what the board shows), still ≥ 1 s, which may finish in the next scene when that scene keeps it lit and in place (count → step 1, step → step, loop → loop, also across a path transition) | standard |
| Text per state | a caption is a line of phrases, each ≤ 5 words entering when the one before has been read; the probe's reveal caption is the film's claim, ≤ 8 words in a pause; the thesis's lines ≤ 5 words each, its stats line split at `·`. Was ≤ 12 words a page | standard (principle 5, api 3) |
| Caption in / out | a scene's first caption starts its 0.3 s rise 0.25 beat before the scene, while the last one leaves (0.2 s fade, drifting up 6 px, ending 0.12 s before its scene's exit), so it is still about 0.1 s into the scene; in the first scene and after the summary and the probe (they end on exit moves) it starts at 0.15 beat; after an incoming transition, at its end; later phrases each 0.15 s before the one ahead has been read | borrowed (source fades) / derived (overlap, 2026-10-18; phrases, 2026-10-19) |
| Holds | every still window between two moves is 0.2 s – 2 beats (the probe's reveal, a pause: ≤ 2 bars); the moves are listed per type (`movesOf`) and the holds computed from them | standard (principle 5, api 3) |
| Compositions | each scene ≤ 6 s, the probe two (its reveal a shot), the thesis a rest; median 2–3 s, CV ≥ 0.3 | standard (principle 5, api 3) |
| Count spacing | 1 beat between items, one landing a beat, the first on the first half beat after its flight | derived |
| Slow step | the first step after the count: pick 0.5, highlight 0.75, the fuse landing on beat 3, rule 3.5; later steps: recount at 0, pick 0.75, the fuse on beat 2, rule 2.5 (was pick 1, fuse 3, rule 3.75 for both) | derived (2026-10-19) |
| Loop spacing | 2 beats per merge (`pace: 2`), or 1 (`pace: 1`, the compressed run into the summary); each merge landing on a beat, highlight half a pace before, rule a quarter pace after | derived (pace 1, 2026-10-19) |
| Probe spacing | the row as the summary's exit ends (beat 0), its chips at 0.25, their letters resolving over 0.75 beat (0.04 s apart); one replay per beat from beat 2 (after the letters); the reveal on the first beat ≥ 0.4 beat after the last replay; the unused rules dim a beat later (was two) | derived |
| Expressive transitions | one every 8–12 s, none more than 12 s from the next or from either end of the film; two beats each, straddling the cut (the probe's reveal flow straddles its reveal beat); an entry's second use mirrored, the reveal's flow always left to right | standard (principle 5) / derived (reveal flow 2026-10-19) |

The example fits to 36 s (15 bars at 100 bpm: 1.25 / 1.75 / 1.5 / 1.25 / 1.25 / 1.25 / 1 / 2.75 / 3 bars; 40 s, 16 bars at 96 before api 3): 6 merges (7 before), steps 1 and 2, a loop of two and a `pace: 1` loop of two, entered by path-type; the summary entered by token-sweep, step 2 by trace-flow, the probe's reveal by trace-flow. Tiers: T0 73 onsets, median gap 0.5 beat, longest 3 beats; T1 10 compositions, median 3 s, CV 0.36; T2 4 (10.2, 16.2, 19.2, 25.2 s; the last 10.8 s before the end, was 16.8 s without the reveal flow); T3 hook 1.1 s, reveal 25.8 s (72 %, climax), lock-up 28.8 s. `examples/rle.content.js` fits to 31.2 s (13 bars at 100 bpm; path-type, token-sweep, and trace-flow at the reveal).

**Key events** (in `renders/timing.json`, on the beat ± 2 frames): every fuse lands (`land`) on the frame its move reaches 90 % (75 % of its duration, about 0.15 s after the chips touch); the summary line lands (`accent`) on its beat 1 at 90 % of its ease-out; the loop's drop (`accent`, `drop: true`); the probe's replays (`land`) and its reveal (`accent`, `drop: true`: the push starts on it, expo-out, so its hit is on the beat); the claim (the thesis's first line, `claim` on the thesis's bar line); the closing move (`end`) on the downbeat of the last bar. The count's landings (each segment at 90 % of its growth, where its tick sounds) sit on the half-beat grid and are not keys. Holds: the still windows between all moves. Hand-offs: count → summary line, summary line → count, probe chips → thesis. Tiers: micro (every move that brings something new, every phrase), shots (the probe's reveal), expressive (the `enter` transitions), peaks (hook, reveal, lock-up).

## Signature transformations

- word → chips: letters spread apart and each grows its own chip box (the hook).
- weight → segment: a row's `×5` label flies to the histogram and becomes a bar segment (`derived`).
- pair → token: the active pair slides together, its outline turns from active to learned, the letters close into one label; the matching token-bar cells shrink away (`borrowed (source)`, the accepted motion).
- histogram → rule list: when the loop starts, the histogram leaves and the rule list rises into its place (`derived`).
- count → result (summary): the bar's count grows into the enlarged line `79 → 29`, its own digits becoming the line's result while the rest writes in; at the end the line shrinks back into the count (`derived`, 2026-10-18).
- red → teal: the unseen word's chips start in the unseen colour and turn learned as each rule fuses them (`derived`).
- chips → claim (probe → thesis): the probe's result chips slide together into one chip, which grows into the frame of the thesis's first line; the chip's letters leave, then the line's words arrive, landing on the thesis's bar line (`derived`, 2026-10-18). Without a probe (a step or loop right before the thesis), the chip the last step fused first holds while the rest of the board leaves, then grows the same way (`derived`, 2026-10-19).
- scrambled → resolved (scramble-resolve, T0, 2026-10-19): the unseen input's chips arrive empty and each letter flickers through the corpus's own letters (the run's alphabet, never random glyphs) until it locks, left to right in reading order, one chip after another; then the replays start. Locking in reading order does not compete with reading (progressive refinement); `lib/handoffs` `scramble-resolve`, drawn into each chip as a layer. `borrowed` grammar, `draft` values.
- caption → loop (path-type, T2, `enter: 'path'`): the last caption of a loop lies on a thin line in the dim colour; the line rolls up a loop from its middle (length kept), carries the sentence round and out and the next scene's caption ("Repeat.") in, and opens again. Used where the content is repetition; the text is read only while the line is straight (good continuation, Wertheimer 1923; `lib/handoffs` `path-type`). The loop's circumference takes the longer sentence; the line sits high enough that the loop clears the token bar. `borrowed` grammar, `derived` geometry, `draft` timing.
- token bar → sweep (token-sweep, T2, `enter: 'sweep'`): the token bar's cells grow into bars in `learned` that sweep up over the board and fall back left to right, uncovering the summary, where the count grows into the result: the through-line becomes the wipe (Material's persistent element; `lib/transitions` `token-sweep`). `borrowed` (library), `draft`.
- data → flow (trace-flow, T2, `enter: 'flow'`): a front carried by a curl-noise vector field crosses the frame in `learned`, dragging the old state along its streamlines into the new one: the recount is drawn as a pass over the data (Bridson et al. 2007; Cabral & Leedom 1993; `lib/transitions` `trace-flow`). Its second use as an entry runs right to left (mirrored). `borrowed` (library), `draft`.
- unseen → result (trace-flow at the reveal, T2, `reveal: 'flow'` on the probe, 2026-10-19): where the run turns from replaying its rules on the unseen input to their result, the same front crosses the frame left to right, in reading order over the input, a beat either side of the reveal: the last replay has landed when it sets off, it passes the result chips as the beat arrives, and the push, the claim's caption and the size's colour come up behind it. No cut and no new state: side A is the probe as its last replay settles, side B the reveal, both the run's. It gives the last third of the film its T2 (the probe and the thesis otherwise change by hand-off only, so the last T2 was the sweep into the summary, 16.8 s before the end), and it lands on the climax with the airy whoosh rising into the reveal's chime. The token bar under it is dragged for a few frames like everything near the front; its count does not change. `borrowed` (library), `derived` (placement), `draft`.
- Not used by the shipped runs (PLAN §4 of the fourth batch): `re-encode` (a run whose counts have a true second reading), `signal-relay` (real pipeline stages, node count = step count, Michotte's launching), `stream-brake` (a real token or log stream stopping on its real verdict), `squash-to-path` (a real execution path whose retries straighten). They need run modules whose state is a chart, a pipeline, a stream or a path; the board-of-chips runs (`bpe`, `rle`) have none of these, so drawing them would show a state the run does not have (mode principle 1). Each is in `lib/handoffs` for the run module that has it.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Fuse | 0.6 s slow / ≤ 45 % of a loop slot; smootherstep; first half slide together, second half merge; lands at 90 % of the move (75 % of its duration), which sits on the beat | borrowed (source 0.6 / 0.45 s) |
| Slow step | pick +1 beat, highlight +1.25, the fuse lands on beat 3, rule line +3.75 | derived |
| Loop | highlight 1 beat before each landing (the first at 0.1 beat), fuses landing on beats 1, 3, 5 …, rule line 0.5 beat after | derived |
| Weight flight | 0.45 s cubic in-out with a 60 px arc; segment grows expo-out 0.3 s; lands at 90 % (0.1 s after touching down) | draft |
| Entrances | 0.2–0.3 s smootherstep fade, 12–20 px rise, blur 6–10 px → 0 | borrowed (source) |
| Exits | ≤ 2/3 of the entrance, accelerating: regions dim over 0.24 s (up 0.4), captions leave over 0.2 s (rise 0.3), the probe row's label 0.18 s, the camera returns in 0.2 s (push 0.32), the summary line shrinks back in 0.36 s (grows 0.6) | derived (principle 5) |
| Landing settle | a fused chip, a probe chip and the claim line swell ≤ 3.5 % from the landing frame and come back, critically damped (x·e^(1−x), peak at 0.06 s, gone by 0.4 s): one swell, no oscillation | derived (2026-10-18, "smooth" and "lands") |
| Camera | summary push to 1.3 (expo-out 0.32 s at 0.1 beat); probe push to 1.06 about the frame centre (0.32 s, starting on the reveal beat); each returns in 0.2 s, accelerating: the summary's before the scene's exit, the probe's during the morph's first 0.2 s | borrowed (gallery: 0.28 s push on the conclusion) / derived (returns) |
| Summary line | grows from the count expo-out 0.6 s, landing on beat 1; returns 0.36 s accelerating, ending at the cut | derived |
| Probe → thesis | the last 0.7 s of the probe: the morph (0.28 s chips together while the camera returns, 0.42 s cubic in-out into the line's frame; letters out over the first 30 %, the line's words in from 35 % to 80 %), then the claim's settle | derived (camera overlap 2026-10-18) |
| Thesis | first line from the morph (or fades in at 0.25 beat without a probe), later lines one per beat (0.5 s fade), the stats line's parts half a beat apart from 0.75 beat after the last line; holds ≥ 2 s | borrowed / derived (parts, 2026-10-19) |
| Closing move | the dimmed token bar lights up (expo-out 0.4 s, landing on the last downbeat) with a 6 px ripple along its cells; then the 0.5 s fade to ground | derived (principle 5, the closing second move) |
| Motion blur | 8 samples over 1/60 s, centred; inside a frame-level transition each side is such a frame | borrowed (source) |
| Caption phrases | each phrase rises 12 px (0.3 s, blur 6 → 0) at its own time on the line laid out for the whole caption; the line leaves as one | derived (api 3, 2026-10-19) |
| Letters resolve (probe) | 0.75 beat a chip, chips 0.04 s apart, re-rolled 24 times a second through the corpus's letters, locked left to right; deep → unseen | borrowed (library defaults) / draft |
| path-type | 2 beats straddling the cut; bend 22 %, flow cubic in-out, open 72–95 % of the window; line 3 px in `dim`, loop radius 56–84 px (the longer sentence's length / 2π) | borrowed (library) / derived (geometry) / draft |
| token-sweep | 2 beats straddling the cut; cells 40 px in `learned`, rise then fall, columns 30 % apart; the summary's push runs under it and its line lands on the window's last frame | borrowed (library) / draft |
| trace-flow | 2 beats straddling the cut; front and streamlines in `learned`, eddy 520 px; each side of the cut held at the cut while the other moves. At the reveal: the reveal beat is the cut, left to right always; the reveal waits until the window's first beat is free of the letters resolving, the replays and the first caption | borrowed (library) / draft |
| Summary landing | the result line swells ≤ 3.5 % on landing, as a fused chip | derived (2026-10-19) |
| Film edges | 0.4 s fade in from the ground, 0.5 s fade out to it; `edges: 'cut'` for an insert cut into a reel: no fades, the title and counters on from the first frame, the last 0.5 s the settled card; such a film starts without a hook | derived (2026-10-19) |

## Sound

Bed: `diagram` preset (felt keys chord and a two-bar motif over a warm pad, gentle plucked pulse, soft low kick and sub in the drop; Eb major). Sections: hook and count `intro`, steps `build` (both steps one section, so the build keeps rising), loop `drop`, summary `break`, probe `build` under its replays (3 dB down, `reading: 'duck'`, coming out of the break) and `drop` on its reveal, thesis `outro`; override with `music`. A drop that would start inside a bar after another kind builds to the next bar line first. Energy is low on the hook and the count, rises through the steps and peaks on the probe. Sections now start on any beat (only the thesis starts on a bar line). Events from the timeline: soft ticks as rows appear and as each count segment lands, a three-note pluck when words split, a pop on each pick, a woody fuse (log-drum `tom` + a marimba note walking up Eb, with a short woody click, the music taking a 70 ms breath just before it) on every merge's landing frame, a chime on the summary line's landing (single) and the probe reveal (rolled triad, −3 dB duck), a felt-keys Ebmaj9 chord with a glassy chime on top as the claim lands (the thesis's first line, on its bar line), a soft bell on the closing move on the last downbeat. Each expressive transition lands with its sound (2026-10-19): a rising-then-falling whoosh round path-type's loop, ticks up the scale under token-sweep's rising bars and down under their fall, an airy whoosh with trace-flow's front; the probe's letters resolve over a quiet glitch and lock with a tick; the summary's single chime gains a woody click (alone it rose only 2.6 dB out of the bed where a token-sweep hands over to it). Master −14 LUFS, true peak ≤ −1.5 dBTP. The source's music was a generated felt-piano track at 96 bpm, the template's default tempo; to use one, set `bed: { file, offset }` and `bpm` to its measured tempo (a fixed `bpm` turns off `target`).

## Factory defaults

What the template produces untouched; it is 3Blue1Brown's default grammar, which a new film copies unless it decides otherwise. A film's `PLAN.md` ban list starts here.

- The `ink` preset: near-black ground with manim's `TEAL_C` and `RED_C` as learned and unseen, and its `YELLOW_C` highlight.
- Serif title with an italic subtitle top left, a `merge n / N` counter top right.
- Outlined rounded chips on a board at left, a histogram and a rule list stacked in the right third.
- A token bar along the bottom with its count at left, lit again at the very end.
- Left-aligned sans captions under the board, keywords coloured by kind.
- The order hook → count → two slow steps → loop → summary → probe → thesis.
- A camera push onto the result `T0 → TN`, then an unseen word replayed in red turning teal.
- A closing serif thesis of short imperative lines ("Count … Merge … Repeat.") over a mono stats line.
- The BPE example corpus (`low`, `lower`, `newest`, `widest`) with `lowest` as the probe, 6 merges.
- The felt-keys bed in Eb major at 96 bpm (the examples at 100).
- The four expressive transitions in the example's places: trace-flow into the second step, path-type into the compressed loop ("Repeat."), token-sweep into the summary, trace-flow at the probe's reveal.

## Don'ts

- Don't type a number the run computes, or draw a step "roughly": the picture is the run's state (principle 2).
- Don't give `active` a second meaning (a decoration, a heading, the learned result): it marks what is being acted on now and nothing else (principle 7).
- Don't colour a whole phrase with a category colour when only part of it is that category ("79 tokens → 29": only the 29 is learned).
- Don't add a fifth semantic colour, a status colour or a gradient: four kinds are what the viewer can track (principle 7).
- Don't light more than three regions, or dim context text below 3:1 (principles 3 and 1).
- Don't squeeze the loop below one merge every two beats to make it fit: split it into two loops (`from`/`to`), so every merge stays on a beat and every rule line can be seen.
- Don't cross-fade between scenes: the summary and the claim grow out of the count and the chips (principle 4).
- Don't add plot axes, LaTeX, glow or a mascot to make it look more like 3Blue1Brown: the pieces are discrete, and the borrowed grammar is the live mechanism, not the channel's props (principle 10).
- Don't keep the example's thesis cadence for another algorithm: write that mechanism's own claim.

## Checks

- **P0**: `npm run fit` reports no errors (api 3: every reading state ≤ 5 words, the claim ≤ 8; every hold 0.2 s – 2 beats, the reveal's pause ≤ 2 bars; each composition ≤ 6 s; the four tiers); every number on screen equals the run's output (`npm run validate` prints them; spot-check five frames); a chip never changes text without a fuse or the probe's letters resolving into the run's input; semantic colours never swap meaning; no caption over 1,400 px or under 34 px, no chip under 25 px (validate); every caption phrase read at 0.3 s a word in order, every rule line and histogram row still ≥ 1 s; a caption on a path is read only while its line is straight; dimmed text ≥ 3:1; `npm run palettes` passes; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `hyperframes check` 0 errors; identical frames on re-render; `check-film` tier rows and `scene stills` PASS.
- **P1**: the first step slowest, later steps faster, the last loop may run a merge a beat; at most three regions lit at once; every fuse lands on a beat with its sound on the landing frame; the summary number is the largest thing on screen; the claim lands on the thesis's bar line; the thesis holds ≥ 2 s after its last line; the closing move lands on the last downbeat; at most three type levels plus the label level; T0 a change about every beat (median gap ≤ 2 beats, none over 4); T1 median 2–3 s, CV ≥ 0.3; T2 one every 8–12 s, each with its sound, no device twice in a row unchanged; T3 hook, the reveal as the climax at 60–85 %, lock-up; transitions drawn in `learned`, never `active`.
- **`stroke: 'sketch'`** (P0 on top of the above): a still chip's outline is identical from frame to frame; histogram segments end exactly at their value; no box is sketched in some places and exact in others.
- **P2**: flying weights land exactly on their segment; rule list rises without overlapping the HUD; chip text centred; bar cell colours match chip colours; the probe → thesis morph shows no two texts at once.

## Known issues

- **`ink` is manim's palette.** Learned, unseen and active are manim's named `TEAL_C`, `RED_C` and (ManimCommunity) `YELLOW_C`, the colours of the channel the anchor names (checked 2026-10-18). Kept on purpose (Palette presets); the off-manim alternatives were searched and dropped: manim's ~150 named colours cover the hue circle so densely that the farthest pair still passing `npm run palettes` sat only about 8 ΔE from a manim colour and narrowed the colour-vision margins.
- The board fills its region by width only when the rows are wide: four rows plus a probe row limit `bpe` by height (scale 1.19, 677 px with its labels, about a third of the frame), so the left region keeps air around it. A sixth row or no probe changes that; a taller band would push the probe row into the captions.
- Plain BPE without an end-of-word marker is a teaching simplification; real tokenisers work on bytes with boundary information (source known issue). Say so in the README of a film that matters.
- The run's histogram shows at most six items; a concept whose counts matter beyond the top six needs another piece.
- A film with a `probe` scene holds at most 4 board rows: the probe row sits below the board and would cover the captions under a fifth (validate reports it).
- The loop at two beats per merge is slower than the natural 1.5 beats the count uses; 1.5 would put every other merge between beats, off the key-event grid. `pace: 1` (a merge a beat) is for the run into the result only; at 100 bpm its fuses take 0.27 s and its rule lines are glanced, not read.
- The T1 median (≤ 3 s) is tight for this mode: most scenes take five beats, 3.1 s at the default 96 bpm, so both examples run at 100 bpm. A film at 96 keeps most scenes to four beats (fewer merges per loop, shorter captions). `npm run fit` reports it.
- A loudness jump of +6.1 LU at the slow step's fuse when the bed's build starts there (the demo, 8.3 s): the bed's motif leaves the last beat and a half of its answering bar empty, and the fuse lands right after that gap. `music: 'intro'` on the first step (the build starts at step 2) clears it; the fix belongs in the shared `diagram` bed.
- With five or more replays the probe's first composition runs 4 s or more, so the run into the climax is not the shortest (a T3 warning). Replays at half a beat would land off the key grid; choose a probe that uses three or four rules, or accept the warning.
- check-film's `keys: picture` can miss the summary line's landing when a token-sweep ends on the same frame (the falling bars dominate the frames around it) and the claim when it lands by settling out of the morph (the turn key on the same frame passes as a settle): pixel heuristics, listed in the demo README.
- The probe and the thesis grow out of chips (hand-offs, not T2 devices), so without `reveal: 'flow'` the last T2 is the sweep into the summary, 14–17 s before the end (`npm run fit` warns; api 3 wants ≤ 12 s). A flow out of the summary into the probe does not reach: it still leaves about 14 s (the `rle` example had one; it now reveals by flow instead). The reveal flow is new (2026-10-19) and not yet seen by the owner; the owner's verdict on the trace demo (2026-10-19) predates it.
- The landing settle, the caption overlap and the brisker count are new (2026-10-18) and not yet seen by the owner.
- The api 3 retune (phrase captions, the faster later steps, `pace: 1`, the resolving probe letters, path-type, token-sweep and trace-flow inside the film, the one-bar rounding) is new (2026-10-19) and not yet seen by the owner; the transitions were approved as samples, not in this film.
- The `chalk` and `paper` presets have not been reviewed by the owner.
- The bed is the shared code-synthesised `diagram` preset, not the generated felt-piano track the owner praised; its closeness was checked by level and spectrum only, not by listening. Its sections now start on beats inside a bar; not yet listened to.
- The count → summary and chips → thesis transformations are new (2026-10-18) and not yet seen by the owner.
- The `sketch` stroke, `edges: 'cut'` and the board → thesis morph are new (2026-10-19) and not yet seen by the owner; the sketch amplitudes are draft values chosen on stills.
- The shortest cut is 16 s, not 10 (api 3, 2026-10-19). A film of only loop → thesis (or two loops → thesis) has too few compositions for the T1 median and CV, and the thesis's bar line leaves a hold of over two beats; the five-scene cut `edges: 'cut'`, step 1 (`bars: 1.25`) → step 2 → loop (one merge) → loop (`pace: 1`, `enter: 'path'`) → thesis fits 16.2 s at 104 bpm with six merges and passes `check-film` with no warning (the `git / commit / digit` corpus, checked 2026-10-19). Without a probe the claim is the climax and the closing move the lock-up.
