# Tally · 算筹 (`tally`)

One square per item; the same squares regroup from a grid into category bands, a sorted grid, the axis of a bar chart and a rule under the closing numbers, chapter by chapter. Aesthetic anchor: "like a data-journalism unit chart that keeps its marbles between charts".
Theme: tech-explainer · Template: `assets/templates/tally/` · Length follows content: 104–120 bpm (default 112), whole beats per scene, 1-bar phrase, timing API 3 (≤ 5 primary words a state, holds ≤ 2 beats, compositions ≤ 6 s, an entry every 8–12 s); the example fits to 15 bars, 32.1 s (30.0 s under API 2) · Accepted 2026-10-17 (genre demo 08: "I really like the squares-to-bar-chart effect"); pacing tiers and transitions owner-approved 2026-10-19 (batch 4)

## Fits / does not fit

Fits: counts of many items (40–2,000) — how many, which kinds, what share, which subset, how it changed over a few periods; dataset or survey stories; a Proof section built from real counts.
Does not fit: continuous measures (latency, revenue, temperature) — squares only count; a single headline number (use ink or phosphor); more than ~2,000 items (squares fall under 3 px); stories that need a map or a line over many time steps; anything whose numbers cannot be computed in the project.

Limits that shape the plan (`TEMPLATE.md` slots): `columns` and `share` show at most 9 bands, the folded rest band included, so "every one of 24 kinds" becomes 8 bands + one rest band; a per-item ledger goes to `list`, which keeps about 8 lines readable at the lock (the key, 3 above, 4 below; with `key: 'last'` only the key and 3 above) and streams the rest past unread; `timeline` takes ≤ 24 periods; `axis` 2–8 series; `close` 1–3 numbers, beads only for ≤ ~56 items.

## Use cases

What the squares are made for: one public list of items, each with a field that sorts it, where the story is which group is large and which one matters (2026-10-19).

| Scene | Example: data, and what the film says | Scenes |
|---|---|---|
| **The fate of every item in a public registry (best fit)** | The PEP index (peps.python.org/api/peps.json, 745 PEPs on 2026-10-19): 745 squares sort themselves into status bands and a roulette frame locks on the second band, *Rejected* (← 18 % of all 745); a staircase wipes the bands into eras, the same columns read as a trend, the grid re-sorts drafts first, and the 55 drafts stream as a list that brakes on the newest. One registry gives the count, the categories, the eras and the protagonist's name (the 32 s demo of 2026-10-19). The short cut for a reel is count → columns: 12.0 s at 120 bpm (Length) | count → columns → timeline → trend → split → list → close |
| A labelled collection: what for, and who said how | The source film: 703 agent-made videos from a gallery, by purpose, then the 370 that named their tools, then which tools (one video can name several, so the subset becomes the axis) | count → columns → split → axis → close |
| A few periods, then a share and a subset | Closed issues of a repository over six months: bugs per month, the bugs' share, how many closed with a test, the first-time contributors as closing beads (the template's alt example, illustrative counts) | timeline → share → split → close |
| The proof section of a release | A benchmark's fixed task list, e.g. the 164 problems of HumanEval: the grid of problems, re-sorted with the ones the release solves first, then the handful it newly solves as closing beads (≤ 56 items light up one by one); the numbers come from the project's own run logs | count → split → close |

Choose the first when one field already tells the story; the second when items carry several overlapping tags; the third only with real periods (≤ 24); the fourth when the subset is small enough to count by eye.

## Mode principles

1. **One square is one item, always.** The legend says what a square is; a square never stands for 10 items or a percentage. The comparison is the count of squares. The same holds for the dot and the pictogram of the form variants (Variants): one mark, one item, one mark for the whole film. *(Narrows 2, precision is a gate: the number is the picture.)*
2. **The squares never leave.** Every chapter moves the same squares into a new shape; no chart is drawn from scratch beside them. Where squares cannot carry the chart (overlapping groups), they become its axis. *(Narrows 4, transform at the turns.)*
3. **The title is the conclusion, and its numbers are placeholders.** Each chapter states one sentence its picture proves; every digit on screen is computed from `data` in the film, and a line that states a counted number's final value appears only once the count has landed. *(Narrows 2 and 3.)*
4. **One accent marks this chapter's protagonist; everything else is neutral.** One category, one flag, one bar or one number per chapter; no second hue, no rainbow of categories. When the protagonist changes, the old accent squares return to neutral first, the title names the new one in the accent, and only then do the new squares light up. *(Narrows 7, one system, one accent, one meaning.)*
5. **Source and method stay on screen.** The bottom-left line names the data, who labelled it and how; "illustrative" when it is. *(Narrows 2; the gallery's honest-marking habit.)*
6. **Mark, land, count, hold.** Squares change colour in place, then fly; the last group of every regroup lands on a beat, counts follow the landed squares, the accent is called out on the next beat, then the frame holds (at most 2 beats under timing API 3; a glint breaks a longer stillness). *(Narrows 5, motion is a function of time, locked to the beat.)*

## Palette presets

| id | name | fits | ground / glow / edge | text | muted | base | rest | accent |
|---|---|---|---|---|---|---|---|---|
| `navy-amber` | Navy and amber (source) | default; dark screens, gallery and product data | `#0B111F` / `#16203A` / `#070B14` | `#EEF1F5` | `#929EB2` | `#C0C8D0` | `#647187` | `#FFB71C` |
| `paper-red` | Paper, ink and red | print-like, editorial, light rooms | `#F2EEE6` / `#F8F6F1` / `#EAE5DB` | `#141414` | `#57534D` | `#3B3A37` | `#7F7B73` | `#BF2417` |
| `night-teal` | Night and teal | engineering and infra data | `#0D1213` / `#152022` / `#080B0C` | `#E9EEEE` | `#93A2A4` | `#8F9A9C` | `#5F6D70` | `#3FE0C5` |
| `coral` | Coral red | a red brand; a dark room where one warm red marks the protagonist | `#170C0D` / `#2C1517` / `#0B0607` | `#F7EFED` | `#B6A4A0` | `#D4C7C3` | `#7A6662` | `#FF6452` |

Checked by `npm run palettes` (`standard`): text ≥ 4.5:1 and graphics ≥ 3:1 against all three ground stops; accent vs base and vs rest ΔE ≥ 15 (normal) and ≥ 8 (protan, deutan). Weakest pairs: paper-red accent/base protan ΔE 10, night-teal base/rest ΔE 15 — both rely on position (sorted groups) and direct labels as secondary encoding. `navy-amber` hexes are `borrowed (source)` (the source film's; also the gallery's KPI-reel palette, see Factory defaults); the others `derived`. paper-red's accent `#BF2417` sits ΔE00 3.1 from ANSI Z535 safety red (Munsell 7.5R 4/14, about `#BA2121`): its provenance, the warning red of print. paper-red's `muted` was `#55565A`, a cool grey (h 281) among warm neutrals (h 85–97); it is now `#57534D` (warm, h 84; 6.60:1 on ground, 6.08:1 on edge; ΔE00 6.2 from the old value), so all of the preset's greys share the paper's hue (2026-10-18, proposal U1 of the colour study, accepted on the recommendation; the owner did not compare it shot by shot).

## Variants

**Colour**: the three palette presets above (`navy-amber`, `paper-red`, `night-teal`); the accent keeps its one meaning in each. **Form**: one content field, `mark`, the shape of one item, independent of the palette (2026-10-19; `TEMPLATE.md` Film-level slots).

| `mark` | What changes | Choose it when | Source |
|---|---|---|---|
| `square` (default) | A rounded square filling 79 % of its cell, as in the source film | Any count up to ~2,000; the bands read as areas that become bars; the densest packing | `borrowed (source)` |
| `dot` | A disc of the square's area (diameter 1.13 × its side), centred in the same cell; everything else unchanged | Items that are separate instances (submissions, runs, incidents) and should be read one by one; the editorial look of a dot plot, best with `paper-red`; up to ~1,000 items, since smaller dots blur into a tone | Wilkinson dot plots: one stacked dot per observation (Wilkinson 1999); equal area so the ink per item does not change with the variant (`derived`); 1,000 `draft` |
| `glyph:doc` · `glyph:box` · `glyph:chip` | An Isotype pictogram of the counted thing: a page (proposals, RFCs, papers, issues), a box (packages, releases, builds), a chip (devices, machines). Drawn in full from a 12 px cell; below 7 px it is the square; in between the square's corners fade as the size grows, in the same move as the size | The unit is a concrete object with a familiar silhouette, and the largest band keeps its cells ≥ 11 px: about 300 items or fewer (233 PEPs: 11 px; 745: 8 px, where the pictogram is already the square) | Isotype: one sign is a fixed quantity, more of it is more signs, never a bigger sign (Neurath 1936), the rule of mode principle 1; pictographs that stand for the data cost nothing against plain shapes and slightly helped recall under memory load, while an unrelated decorative image hurt (Haroz, Kosara & Franconeri 2015); 7 / 12 px `draft` |

Why the shape and not the layout: the count is read from a band's length and position, the two channels read most accurately (Cleveland & McGill 1984), so the mark's shape can carry meaning or texture without costing the comparison. A layout axis would break the mode: a waffle makes one square 1 % (principle 1), a beeswarm places items by a continuous value (Fits). Rules (`derived`): one mark for the whole film, in every chapter, the legend and the accent key; a shape never separates categories (position and labels do); a legend that says "square" with another mark is an error in `npm run validate`. The mark changes no timing, colour or motion, so C1–C5 and C7 are those of the default; a pictogram's outline follows its size in the same flight (one operation whose properties change together, 07 C1), never as a change of its own. Each value was rendered on the 12 s demo and passes P0 and `check-film` (C6 holds settle, C8 flashes 0.5 / s, 2026-10-19); after the API 3 migration `selftest.mjs --variants` stills every value again (PASS, 2026-10-19).

## Accent role

- **Accent** marks one thing: this chapter's protagonist — the category, flag, bar or number its title is about (product launches; the videos that named their tools; the AI-video-model bar; the closing number). It is named in the title in the accent (`*…*`) and in the top-right key ("HIGHLIGHTED: …"). It never marks the frame: chapter number, progress rule, labels and legend are neutral.
- **Change of protagonist.** The meaning of the accent may change from chapter to chapter, never silently: the old accent squares fade to neutral (beats 0–0.5), the title names the new protagonist in the accent and the key changes, the new squares light up (beats 1–1.5), and the flight leaves on beat 2. One beat longer than a plain regroup (check 2026-10-18 P-12; Hunt 1995: emphasis works only when everything else is alike).
- **No category colours.** Categories are told apart by position (bands, segments, columns, sorted groups) and direct labels, not by hue. `base` and `rest` are two neutrals — "the comparison group" and "not it" — not categorical hues.
- No status or effect colours.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Big numbers, titles, captions, values | Inter Tight 600–800 | OFL | 300 (count, fits to 120), 273 / 150 (close: the accent number / the others; 210 without an accent), 200 (split), 64 (title, fits to 44 only to keep one line; share accent percentage), 40 (count and split captions, close labels and line; close labels fit to 32), 40 (share percentages), 28 (band, series and period values) |
| Labels, sub, note, foot, callouts, frame | IBM Plex Mono 400 / 500, letter-spaced, caps | OFL | 25, every one of them, never shrunk |

Two families, no third; the mono is the machine voice of measures and labels. Text that carries information is ≥ 25 px (full-screen landscape on a phone, check 2026-10-18 B7), with no exception in this template: there is no decorative text. Main text is ≥ 40 px except the call-outs (25 px mono): they sit beside a bar inside a band of at most 74 px, and nine bands do not fit at 40 px — revisit in the second batch. Mono labels never shrink to fit; `npm run validate` rejects a sub, foot or source line wider than its row, and the copy is cut instead. Numbers are drawn in fixed digit cells (no jitter while counting). Sizes `derived` (raised to 25 / 40 px and put on the scale, 2026-10-18; the 200–300 px numbers and 64 px title `borrowed (source)`); the 25 px floor `standard`.

## Type scale

**25 · 32 · 40 · 64 · 150 · 210 · 273 · 300**; values at 28 and the 200 px split number sit on the 25 and 210 steps (within 15 %). Content area, at most three steps per frame plus the 25 px label step: count 300 / 40 (64 with a title); columns, axis, timeline 64; split 210 / 64 / 40; share 64 / 40; close 273 / 150 / 40 (a `close` title would be a fourth step: leave it off). The persistent frame (25) is not counted.

## Frame and grid

1920 × 1080 canvas, 96 px side margins, chart area from y 330 to ~920. With `edges: 'cut'` the film starts and ends on its own picture: no fade from or to the edge colour, the persistent frame there from frame 0, for a demo that an edit cuts or transitions into (2026-10-19). Persistent, all 25 px mono caps: chapter number and name top left at y 82 (neutral), the accent key top right (an accent square + "HIGHLIGHTED: …", while an accent is on screen), progress rule at y 986 with a tick per chapter (ticks of chapters already reached are brighter; no "chapter n of N" label), source line bottom left at y 1040, legend (one base square + "1 SQUARE = 1 …") bottom right while squares are visible. Background: radial glow at (62 %, 42 %) into ground and edge; seeded grain at 5–6 % overlay.

## Scenes

| Type | Purpose | Max bars |
|---|---|---|
| `count` | The whole set, one big counting number, squares appear in a wave | 5 |
| `columns` | One band of squares per category (top k + rest); `pick: 'roulette'`: a frame hops band to band and locks on the protagonist | 5 |
| `split` | The same grid re-sorted: matches first, in accent | 5 |
| `axis` | Overlapping groups as bars; the subset's squares become the axis | 5 |
| `share` | One block cut into segments by category: part of the whole | 5 |
| `timeline` | A column of squares per period; the accent lights up at the base | 5 |
| `trend` | The timeline's columns re-read as a trend: the tops become points, a curve draws through them | 5 |
| `list` | One line per selected item (its id and label from the data); the list streams and brakes on the key item | 5 |
| `close` | Up to three numbers on beats, a beat apart; the squares become a rule; the accent number's squares, as beads under the rule, light up on the last downbeat (a rest) | — |

A scene is two compositions (the title over the old layout, then the landed chart), each held to 6 s by the T1 check, so a scene may run to 5 bars (10 s at 120 bpm); the example's run 2–2.75 bars and the close 4.75. At most 5 words of primary text enter together (a phrase); a line enters phrase by phrase, a beat apart. Any scene after the first may enter with an expressive transition (`enter`: `flip`, `dither`, or `step` from columns into timeline). Slots and limits: `TEMPLATE.md`. A scene's bars are fitted, never typed: see Length.

## Length

Each scene lasts the whole beats it needs (`timing.rules.js`, `lib/timing.js` `fit()`, timing API 3, principles 4 and 5); the bar rounding goes to the closing scene. The table in `TEMPLATE.md` lists every type's motion, primary and glance text.

| Value | Setting | Tag |
|---|---|---|
| Tempo | default 112 bpm, range 104–120 (±7 %): steady and curious; slower drags the 1.4-beat flights past 0.8 s, faster turns the four-on-the-floor bed into a dance pulse | default `borrowed (source)` (`data` bed), range `derived` |
| Reading | primary text 0.3 s per word, read in sequence: each phrase of the title, then the line that proves it (call-out, counted number and caption, the list's key line, the accent closing number and the closing line); glance text (sub, note, foot, complement line, split labels, the key's note, and beside an accent number the other closing numbers) ≤ 6 words, fully still ≥ 1 s, in parallel | `standard` (principle 1, check 2026-10-18 B1) |
| Text per state | ≤ 5 primary words enter together; a line enters in phrases a beat apart, each phrase whole (no word stagger) | `standard` (principle 5, timing API 3, owner-approved 2026-10-19); phrase step `derived` |
| Readable | 0.2 s after a line starts to enter | `derived` (90 % of a 0.35 s cubic-out) |
| Hold | a still window lasts ≥ 0.2 s and ≤ 2 beats; any stillness over 1.5 beats gets a glint a beat after it begins; the last motion holds ≥ 0.25 s | limits `standard` (principle 5, API 3); glint gap `derived` (2026-10-19) |
| Entry | the title enters at beat 0.25, as the previous chapter's text finishes leaving | `derived` (brisk, 2026-10-18) |
| Exit | text leaves over 0.4 beat (0.21 s at 112 bpm, ≤ 2/3 of the 0.35 s entrance), from 0.15 beat before its chapter ends to 0.25 beat into the next; a frame-level entry carries the old chapter's last full frame instead | `derived` (brisk, 2026-10-18) |
| Compositions | a regroup is two compositions (the title over the old layout, the landed chart: a shot at the last landing); each ≤ 6 s, median 2–3 s; a scene ≤ 5 bars | `standard` (principle 5, API 3); 5 bars `derived` |
| Expressive (T2) | the entries `flip` (tally-flip), `dither` (dither-sweep), `step` (step-wipe), ≤ 2 beats each, about one every 8–12 s; a device repeated changes its `enterFrom` | `standard` (principle 4, API 3); devices `owner` (PLAN §4, 2026-10-19) |
| Peaks (T3) | the opening count settling (hook), the reveal of the scene marked `climax: true` (60–85 % of the length), the closing light (lock-up) | `standard` (principle 5, API 3) |
| Grid | whole beats per scene; every regroup lands on a beat | `derived` (2026-10-19: half bars left still half bars under API 3; was B3 of 2026-10-18) |
| Phrase | total rounded to 1 bar, all of it to the closing scene (a rest), whose accent squares light up on the last downbeat | `derived` (2026-10-19, as morph) |
| Shortest chain | count → columns with `enter: 'flip'` and `climax: true`: 1.5 + 4.5 bars = 6 bars, 12.0 s at 120 bpm, 12.9 s at 112; the last bar carries the closing light (a three-beat sweep and the value's answering pulse) | `derived` (2026-10-19; check-film PASS) |
| Example | 112 bpm · 15 bars · 32.1 s (count 2, columns 2.75, split 2.75, axis 2.75, close 4.75); alt example 13 bars, 27.9 s. API 2: 14 bars, 30.0 s; batch 1: 16 bars, 34.3 s | — |

## Signature transformations

- grid → bands: each square flies to its category band; bands fill on successive eighth notes, top band first, so the longest band visibly wins (`owner`, the accepted effect, 2026-10-17).
- bands → sorted grid: mark, then move. The matching squares light up in their bands first (half a beat, a short sweep by rank), then on the next beat the same squares fly back into the grid, matches first. Every scene change works this way: a square changes colour in place before it leaves and never in flight (one visual variable at a time; owner 2026-10-18). When the protagonist changes, the old accent squares return to neutral before the new ones light up (Accent role).
- grid → axis: the subset's squares shrink to 3 px and stack into the vertical axis; the rest drop 40 px and fade; bars then grow out of that axis (`derived`, replaces the source's panel push).
- any → share / timeline: squares stream into segments or period columns; in `timeline` the accent squares sit at the base of each column and light up together on the reveal beat.
- A chart scene that closes the film (`columns`, `share` or `timeline` with an accent, as the last scene): on the downbeat of the last bar, a sweep by rank over three beats, every square that is not the protagonist steps back from `base` to `rest` and the protagonist's squares swell × 1.4 one by one along their band, with the soft closing chime; the values beside the other bands step back to muted, and in `columns` and `share` the protagonist's value pulses as the sweep reaches its band's end. Principle 5's second move for a scene that is not `close` (`derived`, 2026-10-19; three beats so the last bar holds still under 2 beats).
- columns, roulette (lib/handoffs `roulette-lock`): the bands land neutral; a frame hops to each band as it lands (half a beat a hop), laps back to the top, slows to a beat a hop and locks on the protagonist, which lights up with the accent words of the title. The candidates are the real categories; the lock is the reveal (`owner`, PLAN §4 X10, 2026-10-19).
- columns → timeline, step-wipe (lib/handoffs `step-wipe`, the T2 entry `step`): the band labels leave; a staircase front whose step heights are exactly the timeline's column counts sweeps in over a beat, the bands retract into it, and the staircase stays as the chart, square by square (`owner`, PLAN §4 X24: the step heights are the next chart's real data).
- timeline → trend, re-encode (lib/handoffs `re-encode`): the same columns step back to `rest`, each column's top becomes a point, and a curve in the accent draws through the points: the same counts, read as a trend. Only where the data has the second reading (`owner`, PLAN §4 X07).
- any → list, stream-brake (lib/handoffs `stream-brake`): the selected squares fly into a column of lines, one per item beside its id and label; the list streams and brakes exponentially onto the key item, whose square lights up as the reading band locks (`owner`, PLAN §4 X14).
- Frame-level entries (T2): `tally-flip` turns the frame over in unit tiles in order from a corner, the tile marked in `base` before it turns, into the next chapter whose squares already wear their new colours (the flip is the mark, so the squares fly at beat 2); `dither-sweep` sweeps an ordered-dither front across (references/transitions.md).
- axis → close: the axis squares and the dropped squares lay out as a single rule under the closing numbers; the accent number's own squares land under the rule, in its column, as neutral beads (one or two rows) and light up one by one from the downbeat of the film's last bar, the closing lock-up's second move (`derived`, check 2026-10-18 F7, B4). The rule never runs through the beads: the column is a measured stack (`TEMPLATE.md` Closing column), the beads 6 px below the rule at their largest (owner 2026-10-19, at 0:27.5 of the 32 s demo: the rule crossed the first row of the 55 beads, as it crossed the 3 beads of the shipped example). Without beads, an accent rule draws under the accent number's label on that downbeat.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Mark | colour change in place over half a beat, a sweep by rank; flights leave on the next beat (2 beats after a change of protagonist, which first returns the old accent to neutral, or after a frame-level entry, which is the mark; at once when nothing changes colour) | `derived` (owner 2026-10-18 for mark-then-move; the departure beat 2026-10-18, so landings sit on beats) |
| Flight | 1.4 beats (0.75 s at 112 bpm), cubic in-out, seeded arc ≤ 30 % of the distance, ≤ 140 px | `borrowed (source)` 0.75 s; arc `draft` |
| Departure stagger | 0.6 beat within a group (rank 80 %, seeded 20 %); groups 0.5 beat apart, the first delayed so the last lands on a beat | `derived` |
| Wave entrance | 2.05 beats across the set in data order; each square 0.7 beat cubic-out, scale 0.3 → 1; settles on beat 3 | `borrowed (source)` 1.3 s wave, shortened to settle on a beat |
| Counters | expo-out; count 3 beats, split 2 beats (landing with a × 1.08 pulse), close 0.9 s, the closing numbers starting on beats a beat apart; values follow landed squares in bands and columns | `borrowed` (gallery: expo-out 0.9–1.3 s); spacing `derived` (brisk, 2026-10-18) |
| Bars | grow from the axis, quint-out over 2 beats, starts 0.5 beat apart | `borrowed` (gallery: quint-out, ~0.2 s stagger) |
| Emphasis | accent value pulse ×1.35 over 0.3 s; beads and revealed squares pop ×1.45; the close accent number is 1.3 × the others and pulses ×1.12 as it lands | `derived` |
| Closing light | beads light one by one from the last downbeat, ≤ 1 beat in all, ≤ a sixteenth apart; the downbeat comes at least a beat after the closing line enters and 0.5 s after the last number settles, and may fall while the line is read. A closing chart scene: the same downbeat, at least 0.5 s after its reveal and after its call-out is read; each square changes over 0.4 beat, the sweep by rank over 2.6 beats, the protagonist's squares swell × 1.4 over 0.35 s, its value pulses × 1.35 at the sweep's end | `derived` (brisk, 2026-10-18; chart scenes and API 3 2026-10-19) |
| Landing | over the last 30 % of its flight a square swells 10 % and back while it brakes: one pulse that ends as it lands, no bounce | `derived` (secondary motion on landing, 2026-10-18) |
| Text | in: 0.35 s fade + 14 px rise (cubic-out); out: 0.4 beat smoothstep across the chapter boundary (0.21 s at 112 bpm), see Length | `borrowed` (Material, exits faster); the 2/3 ratio `derived` (2026-10-18) |
| Phrases | a line of primary text in phrases of ≤ 5 words, a beat apart, each entering whole (0.35 s fade + 14 px rise) | `standard` (API 3 text per state); no word stagger `derived` (references/ai-tells.md, 2026-10-19) |
| Glint | in any stillness over 1.5 beats, a beat after it begins: the protagonist's squares (else the base squares) swell × 1.22 for 0.35 s, a sweep by rank over 0.6 beat; the faintest pluck | `derived` (2026-10-19: the T0 change that is not new text, CONTRACT migration step 3) |
| Roulette | a hop every half beat from the first band landing, laps once, the last two intervals a beat (`slow` 2), settle 0.4 beat; lock on a whole beat; the frame a 3 px accent outline round the band, pops × 1.12 on its first hop | `borrowed` (lib/handoffs `roulette-lock` schedule; Huron 2006) / geometry `derived` |
| Step-wipe | front over 1 beat cubic in-out from beat 1; bands retract cubic in-out between 10 % and 54 % of it; the old band labels leave first | `borrowed` (lib/handoffs `step-wipe`) |
| Re-encode | 2 beats from beat 1: column values and squares step back as their points land (spring), the curve draws over the second beat, 6 px accent, points 9 px | `borrowed` (lib/handoffs `re-encode`; Heer & Robertson 2007) |
| Stream | lines 64 px apart, squares 18 px; runs 2 beats, an exponential brake (k 4.5) over the first 80 %, the band locks over the rest; lines fade 70 px before the window's edges; 6–24 sub-frames by speed | `borrowed` (lib/handoffs `stream-brake`; Abrams & Christ 2003) / sub-frames `derived` |
| Entries | `tally-flip`, `dither-sweep` over 2 beats (beats 0–2 of the new chapter), from the old chapter's last full frame; marks in `base` | `borrowed` (lib/transitions; durations `derived`, ≤ 2 beats for T2) |
| Motion blur | 6 sub-frames over half a frame while squares fly, numbers land or a reveal pops; 1 otherwise; the roulette frame and the counters read the frame time (no ghosts) | `derived` (principle 6) |
| Fades | 0.5 s in from the edge colour, 0.6 s out at the end | `borrowed (source)` |

## Sound

Bed: `data` preset (112 bpm default, follows the fitted tempo; F lydian; soft muted four-on-the-floor, plucked up-down arpeggio, warm pad, round bass). Sections follow the fitted scenes, which start on beats: first scene `intro`, `columns`/`share`/`timeline`/`trend`/`list` `build`, `split` `break` (reading), `axis` `drop` (the surprise), `close` `outro`; override with `music`. Events from `timeline.js`: count ticks that thin out with the counter's expo-out (14 per counter, −24 dB), a thud + soft pluck on every landing (band, bar, segment, column, closing number) walking up the scale, a whoosh on every flight departure (−21 dB), a soft rising pluck when squares take the accent colour (mark) and a falling one when they give it back (unmark), each with a 70 ms breath in the music just before it, a chime on the accent reveal and on the closing light, with a −3 dB duck (the climax's reveal: a rising triad and a soft impact, the music's drop); the devices' own sounds (references/transitions.md): a tick per roulette hop and a stamp on the lock, a braking tick roll and a falling whoosh for the stream, ticks and a swell for the re-encode, a tick per step and a stamp for the step-wipe, a tick roll for tally-flip, a quiet glitch for dither-sweep, the faintest high pluck for a glint; the closing chime on the last downbeat is softer, because the outro's resolving chord lands under it. Energy follows a tension curve: quiet on the count, building through the chapters, highest on the surprise (axis). Master −14 LUFS, true peak ≤ −1.5 dBTP; `assets/audio/measure.json` records the measured values. Optional generated bed: `bed: { file, offset }` at the measured tempo.

## Factory defaults

What the template produces untouched. A film's `PLAN.md` ban list starts here; the first three items are the frame the gallery's data-story category ships by default (check 2026-10-18 F8).

- A chapter label top left over a one-sentence-conclusion title and a mono caps sub naming the measure.
- A bottom progress rule with a tick per chapter.
- A source line bottom left.
- The `navy-amber` preset: navy ground, one amber accent, grey-white neutrals — the gallery's KPI-reel palette.
- Count-ups on an expo-out; bars growing quint-out from a baseline, staggered.
- The example's scene order — count → columns → split → axis → close — ending on three big numbers in a row.
- Mono caps letter-spaced labels for every measure, key and source.
- The example copy and its sentence patterns: a question answered in the same title ("What were they for? *X* lead."), "Only *n of m* …", "About half …", the chapter names, "In three numbers".

## Don'ts

- Do not let a square stand for more than one item, or draw a chart beside the squares instead of moving them (mode principles 1, 2).
- Do not type a number into the copy; do not show a count's final value (a percentage in its caption) while the counter is still running (principle 2).
- Do not change a square's colour in flight, and do not switch the protagonist without returning the old accent to neutral and naming the new one in the title (Accent role).
- Do not give categories their own hues, or their own marks; position and labels separate them. One mark for the whole film (Variants).
- Do not shrink a label under 25 px to make it fit; cut the copy or delete a field.
- Do not put a second large number beside the protagonist (the split complement is a label-size line) or three equal numbers in the close (principle 3).
- Do not add a "chapter n of N" label or a timecode; the progress rule's ticks carry the position.
- Do not reuse the example copy or its scene order unchanged (principle 10).

## Checks

- **P0**: `npm run fit` reports no errors (API 3 tiers: ≤ 5 primary words a state, holds 0.2 s–2 beats, compositions ≤ 6 s with a median of 2–3 s, 1 expressive transition per 8–12 s, 2–3 peaks with the climax at 60–85 %); every on-screen number matches `npm run validate` and the data (spot-check five frames at their landing moments; the step-wipe's step heights and the trend's points are the next chart's own counts); legend states the mark and the unit; source line present all film; titles fit one line ≥ 44 px; no label overlaps squares or another label, and no rule crosses a square or a text (the close's rule, beads, labels and line are a measured stack, in every preset and `mark`); every text that carries information ≥ 25 px; `npm run palettes` passes; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `hyperframes check` 0 errors; same frame renders identically twice; `check-film` 0 FAIL.
- **P1**: something changes about every beat; every regroup lands its last group on a beat, the accent with its chime (the key events in `renders/timing.json`); counts never run after their squares land, and no line states a count's final value before it lands; a change of protagonist goes through neutral (or through an entry) and is named in the title; a roulette's candidates are the real bands and a list's lines the real items; a trend only where the counts really have that reading; the closing accent squares light up on the last downbeat; no device twice in a row unchanged; not three square-only layouts in a row without a number or bar chart in between.
- **P2**: arcs read as a flock, not noise; motion blur only on flights and the stream; a colour change is the mark before a flight, an entry, or a reveal on a beat, never in flight; glints stay quiet (they are a reader's rest, not an event); paper preset grain visible but not dirty; band labels and counts align to band centres.

## Known issues

- The axis cannot be made of squares when the series overlap (one item in several groups); its bars are drawn from counts, and only the axis is made of the subset's squares. Say "one item can be in several" in `sub`.
- `counts` input assigns flags per row at random (seeded); flag intersections are meaningless in that form (category × flag is fine).
- At 703 items squares are 15 px in grids and 10 px in bands; on a phone they blur into a tone (source known issue). Above ~1,500 items prefer `columns` with fewer bands.
- Tool groups in the example are regex groups over the authors' words: 236 code renderers is a lower bound, and "AI video model" includes one avatar-video tool (source known issue).
- The close beads appear only when the accent number's selector matches ≤ about 56 items; otherwise the closing move is an accent rule under its label.
- Call-outs are primary text at 25 px, under the 40 px target (see Type).
- In `split`, the complement squares are still flying across the left column while the counter starts (they pass behind the number, never rest on it); the 32 s demo shows "46" with squares still in flight (2026-10-19).
- When the opening scene is not `count`, its squares appear in the wave but its landing key in `renders/timing.json` is the scheduled band landing (beat 5), not the wave's end.
- Scenes start on beats (API 3, 2026-10-19); the `data` bed's sections follow them, its chords change only on bar lines whatever a section's start (check 2026-10-18 D1); not listened to at beat-aligned section starts.
- The sound was verified by levels and spectra only, not by listening. The 2026-10-18 brisk timing moved the closing thuds onto beats and shortened the scenes; the bed was re-measured (−14.1 LUFS, −1.8 dBTP), not listened to.
- The closing light falls while the closing line is still being read (at least a beat after it enters); a long closing line therefore reads under the beads' move.
- The glints are a template choice to keep API 3's 2-beat holds on long reading windows; they have not been seen by the owner. If they read as fidgeting, the alternative is shorter copy per scene.
- The device sounds (roulette ticks, stream roll, re-encode swell, step ticks, flip roll, dither glitch, glint pluck, the climax impact) were checked by levels only, not by ear.
- A `trend` after a `timeline` with an accent returns the lit squares to `rest`; its `highlight` defaults to "trend" (set it). `list` keeps about 8 lines readable when it locks (3 above the key, 4 below), fewer with `key: 'last'`; a key line over 5 words is an error (choose another key).
- The step-wipe works only from `columns` into `timeline`, the one pair whose staircase is real data in this template (the column counts); other pairs fall back to the plain flight (validate reports it).
- During a frame-level entry the incoming frame is live (its title enters at beat 0.25 inside the flip); the outgoing frame is the old chapter's last full frame, frozen.
- `hyperframes lint` warned at 360 lines of `index.html`; the squares moved to `squares.js` (264 lines now, 0 warnings).
- The opening counter runs ahead of the wave: at 120 bpm it reads 510 of 745 (69 %) half a second in, when about a third of the squares have begun to appear (the 12 s demo, 2026-10-19). It settles before the wave ends, so no count runs after its squares have landed, but the number does not follow the squares as the band counts do.
- With `edges: 'cut'` the first frames are the ground and the persistent frame; the number and the first squares arrive from 0.15 s. The progress rule keeps growing through the final still (a constant-rate process, outside the content mask).
- On `night-teal` the closing step-back (base → rest) is ΔE 15, the preset's weakest pair: quiet by design; the protagonist's swell carries the move.
- The closing light of a chart scene has not been listened to: its chime reuses the soft closing chime of `close` (not yet confirmed by ear). Its sweep runs three beats (was one under API 2) and its swell × 1.4 (was × 1.25), so the last bar never holds still past 2 beats; not yet seen by the owner.
