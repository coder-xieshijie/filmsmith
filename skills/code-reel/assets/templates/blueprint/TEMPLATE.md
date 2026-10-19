# blueprint — template

One engineering drawing drafted sheet by sheet. 6–9 sheets sit in a serpentine on one large drawing; the camera travels the drafting route between them, lines and lettering draw themselves, and stamps land on the beat. Timing API 3 (the four tiers of change, principles 4 and 5, owner-approved 2026-10-19): something lands about every half beat, each sheet is one to three compositions of at most 6 s, and four transitions of the library carry the film's big changes (below, "Transitions"). Mode card: `references/modes/blueprint.md`.

**The shipped `content.js` is a placeholder.** "tidepool" is an invented backup tool, there only so every slot shows a realistic length. Replace every line; do not keep its sentence shapes, and do not fall back on the source film's "X in. Y out." or a "Who …?" headline (mode card, Factory defaults; `PLAN.md` lists them as banned defaults).

```bash
node scripts/new-film.mjs blueprint <film-dir> [--palette diazo]
cd <film-dir>
# edit content.js (this file explains every slot), then
# fill PLAN.md first: npm run fit stops without it
npm run fit             # timing table: bars per scene, tempo, length; stamps data-duration; writes renders/timing.json
npm run film            # fit → audio → check → render  (renders/film.mp4)
npm run snapshot -- --at 18.9,25.5,31.5,36.9 --no-end  # the four stamps of the example, held
npm run contrast        # palette contrast table
```

Timing errors (more than five words of primary text entering at one cue, a sheet whose reading runs past two beats after its last landing, a composition over 6 s, the four tiers: T0 gaps, T1 lengths, T2 count, T3 peaks) and copy errors the rules can see (`validate`: the issue's fields, `enter`) stop `npm run fit` / `npm run audio`; schedule errors (sheet count, scene order) stop `npm run audio`. Layout errors (over-long slots, text that does not fit its measured slot at 25 px, a stamp with no place clear of the lettering, lettering under the HUD at rest, an approval stamp too long for its cell, a push-in that cannot avoid clipping) are logged in the browser console and painted as a red banner across every frame, so a broken film cannot pass a look. Fix the copy, never the code.

## What is derived, what is fixed

| Derived from content.js | Fixed (the look; do not edit per film) |
|---|---|
| Sheet count (6–9; 2–9 in an excerpt), order and serpentine layout (3 columns) | Drawing frame: zone ticks 1–8 / A–D, label panel with detail bubble, scale bar, title block (APPROVED BY, name, SHEET, SCALE) |
| Every scene's bars, the tempo and the film's length, from the copy (`fit()`, below) | Each sheet type's choreography (the order its parts draw in), written in beats (`choreography.js`) |
| Every cue and stamp time, from the fitted scene starts and the beat | Reading model and bar ceilings (`timing.rules.js`) |
| Camera keyframes: arrivals, drift, holds, push-ins, pull-outs | Camera grammar: 1-beat pans with a slight zoom dip, 1.5-beat pull-outs, push-in on every stamp |
| Push-in framing, solved so no label is clipped or hidden by the HUD | Line weights, dash patterns, oblique depth (60, −45), stamp shape and land (2.1× → 1×, 0.17 s) |
| Each stamp's place and size, solved clear of every lettering and of the HUD (`sheets/common.js` `fitStamp`) | Which stamps are amber (a person's: detail, final) and which are line-colour inspection stamps (a machine's: section, checklist) |
| Box, leader, table, chain and tag geometry, from measured lettering | Type sizes (`sheets/common.js` `F`; 25 px floor for every fit) |
| HUD label panel width, title block widths, SCALE value (live from the camera) | Paper texture, lamp, grain and vignette recipes (seeded) |
| Sound events (one per landing / stamp / move) on the same cue times | Bed preset `blueprint` and the voice for each event kind |
| The issue's flood: its origin and starting size from the stamp's place and size on screen | The material change: pencil on the `original` preset → the print (`palette`, `linework`), once, at the detail sheet marked `issue` |
| The console's panels: six named regions from `regions`, lettered in order | Their layout, the outline's size and the isometric cube that unfolds into them (`sheets/interface.js`) |
| The stage words' sizes (a step up the ISO series each) and the slot's measured height | The slot, its rails as dimension lines and the one-word-a-beat rhythm (`sheets/stages.js`) |
| Each sheet's move out: the shortest pan plus what the beat grid leaves after the hold | The two-beat hold after every build (never longer: api 3) |

Scenes are elastic only where it is safe: every part lands a fixed number of beats after the camera arrives, and the exits (the final overview's claim panel, the camera move, the release's RELEASED status on the film's last downbeat) are fixed beats before the scene ends. Every sheet ends with exactly two beats of complete stillness (`HOLD_S` 1 s rounded up to the beat: 1.11–1.30 s across the tempo range) before the camera leaves; what the beat grid leaves over goes to the pan (1–1.75 beats), never to the stillness, and the phrase rounding goes to the release. The release URL is held ≥ 3 s.

**Brisk (2026-10-18), then dense (2026-10-19).** The owner found the batch 1 film's waits between sheets far too long ("technical videos are light, direct, crisp"). Since then: builds of 4.5 beats (7 on the three stamp sheets, the stamp on beat 5) instead of 9; a two-beat hold; scenes on the beat grid instead of half bars; the final overview's route in 1.5 beats and its claim panel leaving half a beat before the camera; the example has no mid pull-out (86.4 s → 52.8 s). Timing API 3 (2026-10-19) then replaced the page limits (12 words, 1- and 1.5-bar stills, 4-bar pages) with the four tiers: five words a state, holds of at most two beats, compositions of at most 6 s (the stamp sheets split by the push-in and the return), a T0 change every half beat in the median, four library transitions, three peaks. No bar-line turns any more: a turn's pad lengthened the sheet before it into a hold over two beats.

## content.js

```js
export default {
  palette: 'cyanotype',  // cyanotype | diazo | blueline | graphite (vellum is the pencil original's paper)
  seed: 7,               // paper, grain, stamp wear, sound round-robin
  // optional: original: 'vellum' — the pencil original the film is drafted on until the detail sheet marked
  //           issue: true; its stamp floods the drawing into the print ("The issue" below)
  // optional: linework: 'ink' | 'pencil' — the print's drafting instrument (default 'ink'; "Line work" below)
  // optional: excerpt: true — a 2–9 sheet cut-down without the release card ("Excerpts" below)
  // optional: sound: { tone: 'v2' } — the other modes' spectral balance; this mode's default is 'v1' (2026-10-18)
  meta: { title, subtitle, corner, url },
  scenes: [ { type: 'problem', ... }, ... ],   // no bars: fit() sizes each scene
  // optional: bpm (92–108, default 100), target (seconds; see "How long a film is"),
  //           key: 'E' (bed key), bed: { file, offset, gain } to use a generated track instead of the synthesised bed
};
```

**meta** (title block and HUD; limits in characters): `title` ≤ 12 (title block name, HUD product line) · `subtitle` ≤ 28 (HUD product line) · `corner` ≤ 24 (top-right note, e.g. the licence) · `url`. The old `dwg`, `rev` and `drawnBy` fields are no longer drawn: at 25 px the title block keeps only what a viewer reads (a console warning names them).

Every scene also takes `hud` ≤ 24 (the HUD strip reads `SHEET n · <HUD>`) and, for sheets, `label` ≤ 36 (the figure label above the title). Optional per scene: `music: 'intro' | 'build' | 'drop' | 'break' | 'rest' | 'outro'` to override the bed section; on one `detail`, `issue: true` (the signature that issues the print); on the `release`, `enter: 'rule' | 'push'` (after the final overview it enters under the parallel rule unless `'push'`).

### Rules of the scene list

- 6–9 scenes are sheets; `overview` scenes do not count. The last scene is `release`. The film does not open on an overview, and `interface` is never last. An excerpt (`excerpt: true`) takes 2–9 sheets and ends on any sheet; the release is optional and, if present, still last ("Excerpts" below).
- At most one `overview` without `final` (a mid-film pull-out over the sheets drawn so far) and one with `final: true` (the claim and the approval stamp), placed just before `release`. The mid pull-out is optional and the example leaves it out: it is a bar with nothing new drawn, so use it only in a long film (8–9 sheets, over a minute) that needs a breath.
- At most one sheet carries `issue: true`, and only a `detail` with its stamp; `original` is set only with it, and is not the same preset as `palette`.
- An api 3 film wants four or more library transitions in 48 s (one every 8–12 s): the `interface` gives two, the issue one, the rule into the release one. A film without them fails T2 at `npm run fit`; add the interface or the issue, or cut the film shorter.
- A scene may set `bars` (steps of 0.25, a beat) only to lengthen it on purpose, e.g. a longer mid-film overview as a rest; fit() overrides a value below the reading need or above the ceiling and says so.

## How long a film is

Nobody types a duration or a scene's bars. `npm run fit` runs `lib/timing.js` `fit(content, rules)` with `timing.rules.js` (timing API 3); `timeline.js` (picture) and `score.mjs` (sound) call the same function, `fit` stamps the result onto `index.html`'s `data-duration` and writes `renders/timing.json` (scenes, key events, holds, the content mask and the four tiers' events) for `check-film`.

A sheet is drawn part by part, and the viewer reads each part as it lands while the next one draws. So each type's need is `lib/timing.js`'s reader (`ctx.reading`) run over its choreography (`choreography.js`, cue beats after the camera arrives), each item placed when it has finished drawing:

- **read** (primary text): the copy the sheet exists to say, 0.3 s per English word, read in draw order; a string is read once it has drawn and the previous one has been read. Each line, value, question, answer and stage word enters on its own cue, so a state carries at most five words (`stateWords`); the final overview's two claim lines are marked as a claim (eight words) and read in a pause.
- **notes**: annotations (figure label, muted subs and descriptions, box tags, footnotes, the console's regions). A note of six words or fewer is glance text: fully still ≥ 1 s, read in parallel, never added up; it qualifies because it repeats what the drawing shows or can be deleted. A longer note is primary text, read in its place in the draw order, so a sentence-long sub costs its full reading time.
- **build**: the lead, the build (N0 beats until the last part lands), then exactly two beats of stillness.
- need = the later of reading done and build + stillness, plus the shortest move out, rounded up to the beat; what the rounding adds goes to the move. A sheet whose reading runs more than two beats past its last landing is an error (its hold would pass `holdMaxBeats`): cut the copy, make a note short enough to be glance text, or split the sheet.
- **steps**: each cue's landing, then the final hold up to the move out; every gap ≤ 2 beats. The final overview's last step is the claim, a pause (≤ 2 bars); so is the closing stamp of an excerpt.
- **compositions** (T1): a sheet is one composition of at most 6 s (`sceneMaxSec`, the default ceiling: 2.5 bars at 100 BPM); the stamp sheets split into three (arrival, push-in, return: shots), the interface into two (the outline, the console: the unfold), the final overview into two (the pull-out, the claim panel), so those types may run to 3 bars and each composition is held to 6 s.
- **grid**: scenes are whole beats (`unit` 0.25 bar). No bar-line turns: the pad before a turn became a hold over two beats.
- **phrase**: the total is rounded up to a 2-bar phrase. The release takes all of it (`phraseShareBeats` 0: a sheet's hold is already at its cap, and two more beats on the final overview's claim made a five-beat near-still passage, check-film `pace`), then letters its status in on the film's last downbeat, so the end does not hold dead.

The lead and the move out come from the neighbours: the first sheet waits half a beat for the drawing frame; the camera leaves at least 1.5 beats before the end into or out of an overview, 1 beat between sheets, 1 beat out of the final overview when the release enters under the rule.

Columns: lead = beats before the first cue (first sheet only); build N0 = beats until the last part lands; out = beats of the shortest move out, after two beats of stillness; max = the type's ceiling in bars at api 3 (6 s is 2.5 bars at 100 BPM, 2.25 at 92).

| type | lead (beats) | build N0 (beats) | out (beats) | read (primary), in order | notes (glance if ≤ 6 words) | max bars | compositions |
|---|---|---|---|---|---|---|---|
| `problem` | 0.5 | 4.5 | 1–1.5 | `lines`, `items[].value` | `label`, `items[].key`, `note` | 6 s | 1 |
| `arrangement` | 0.5 | 4.5 | 1–1.5 | `lines`, `input/system/output.name` | `label`, `sub`, the three `tag`s | 6 s | 1 |
| `interface` | 0.5 | 6.75 (outline 0.75, solid on 1.75, opens on 3.25) | 1–1.5 | `title` | `label`, `sub`, `regions` | 3 | 2 |
| `detail` | 0.5 | 7 (stamp on beat 5); 8 with `issue` (flood on beat 6) | 1–1.5 | `title`, each `rows[].q` then `.a`, `stamp.word` | `label`, `sub`, `summary` (repeats the answers), `note`, `stamp.small` | 3 | 3 |
| `section` | 0.5 | 7 (stamp on beat 5) | 1–1.5 | `title`, `parts[].name`, `notes`, `output`, `stamp.word` | `label`, `sub`, `parts[].desc`, `parts[].lines`, `dimension`, `stamp.small` | 3 | 3 |
| `loop` | 0.5 | 4.5 | 1–1.5 | `title`, `steps`, `gate.title` | `label`, `sub`, `gate.sub`, `aside.head`, `aside.text` (a side note by role) | 6 s | 1 |
| `stages` | 0.5 | n + 1.25 (a word a beat from beat 1) | 1–1.5 | `title`, each of `stages` as it lands | `label`, `sub`, `note` | 6 s | 1 |
| `checklist` | 0.5 | 7 (stamp on beat 5) | 1–1.5 | `title`, the count, `note`, `footer`, `stamp.word` | `label`, `sub`, `countLabel`, `stamp.small` (the computed `k / n`) | 3 | 3 |
| `assembly` | 0.5 | 4.5 | 1–1.5 | `title`, `ends[].word`, `claim` | `label`, `ends[].sub`, `nodes` (repeat the sheets just drawn), `loop`, `claimSub` | 6 s | 1 |
| `parts` | 0.5 | 4.5 | 1–1.5 | `title`, `rows` | `label`, `chips` (repeat the assembly's order), `note` | 6 s | 1 |
| `overview` (mid) | 0 | 2.5 | 1.5 | — | — | 3 | 1 |
| `overview` (final) | 0 | 3.5 (stamp on beat 3) | 1.5, or 1 into the rule; the claim panel leaves half a beat before it | `lines` (a claim), `stamp.word` | `label`, `stamp.small` | 3 | 2 |
| `release` | 0.5 | 4 | none (last); URL ≥ 3 s after it draws; RELEASED on the last downbeat | `name`, `tags`, `url` | `kicker`, `foot` | rest; takes the phrase remainder | 1 |

Free-standing symbols (`·`, `→`, `—`, `/`, `△`, `%`, `>`) are not counted as words. The per-slot character limits in the registry below are layout limits; the reading limits come first on every sheet: write terse questions ("Restore where?", not "Restore into scratch, or into a test copy?"), subs of six words or fewer (a longer sub is read as primary text), one-word values, short stamps. The `assembly` claim and a `loop` with four two-word steps and a long gate are the easiest to push over; the example leaves both out.

**The four tiers** (api 3, measured by `npm run fit` and `check-film` from `events()`):

- **T0** (`micro`): every cue landing of every sheet (the same cue table the picture and the sound use), each stage word, the push-in settling and returning, the claim panel leaving, the route drawing out. Median gap 0.5 beat in the example; the longest gap is a sheet's two-beat hold plus its move (3.25 beats).
- **T1** (scene starts and `shots`): the push-in on a stamp and the return from it, the interface's unfold, the final overview's claim panel. The example: 16 compositions, median 2.1 s, CV 0.6, two in the first 5 s.
- **T2** (`expressive`): `stroke-reinterpret` and `net-unfold` (interface), `shape-flood` (the issue), `occluder-pass` (the rule into the release); each ≤ 2 beats and lands on a beat with its sound.
- **T3** (`peaks`): the hook (the first line lettered), the claim (the final overview's approval stamp; the climax) or, in an excerpt without an overview, the last stamp (a reveal), and the lock-up (the release's name).
- **Holds**: the two-beat hold after every build, each stamp's thud-to-return window (≥ 0.2 s), the final overview's claim (a pause), the release's (a rest).

**Tempo and `target`.** The tempo is `content.bpm`, else 100, within 92–108. With `target` (seconds) and no `bpm`, fit() searches that range for the length closest to the target; reading time does not shrink with the tempo, so a faster tempo can push a dense sheet over its hold (fit reports it). What the range cannot reach is reported as bars of scenes to cut or add; it is never padded with holds or squeezed below reading time. More copy or more sheets make a longer film.

## Length

| Film | Sheets | Length at 100 BPM |
|---|---|---|
| Shipped example (tidepool) | problem → arrangement → interface → detail (issue) → section → checklist → final overview → release | 48 s (20 bars) |
| Workshop demo (lintel, 2026-10-19) | problem → arrangement → interface → detail (issue) → stages → checklist → final overview → release | 43.2 s (18 bars) |
| A plain sheet (problem, arrangement, loop, assembly, parts) | — | 8 beats (4.8 s); 7.5 + rounding when it is not the first |
| A stamp sheet (section, checklist, detail) | — | 10 beats (6 s), 11 with `issue` |
| `interface` / `stages` (4 words) | — | 10 / 9 beats |
| Shortest excerpt: a plain sheet, then a stamp sheet ending on its stamp | 2 | 4 bars, 9.6 s (8.9 s at 108 BPM) |

## Registry

Each sheet type has its own drawing type, so no two detail sheets share a layout. Character limits are hard; text that does not fit its measured slot at the minimum size is an error.

| type | drawing | purpose | slots (limit) |
|---|---|---|---|
| `problem` | callout boxes on a bus, amber revision triangles | the problem, as open review items | `lines` [2] (≤ 22 each, 140 px → min 100) · `mark` (≤ 22, a substring of lines[1], underlined in amber) · `items` 2–4 × { `key` ≤ 12, `value` ≤ 11 } · `note` ≤ 24 (prefixed △, amber) |
| `arrangement` | general arrangement: input → system → output, overall dimension | the claim | `lines` [2] (≤ 18 each, 140 px → min 100) · `sub` ≤ 90 · `input` / `output` { `tag` ≤ 18, `name` ≤ 14 } · `system` { `tag` ≤ 18, `name` ≤ 12 } |
| `detail` | detail view with dashed leader lines, amber bracket, amber stamp | questions settled by a person | `title` ≤ 10 · `sub` ≤ 90 · `rows` 2–3 × { `q` ≤ 56, `a` ≤ 12 } · `roundLabel` ≤ 6 (default "Round") · `summary` ≤ 48 · `note` ≤ 28 · `stamp` { `word` ≤ 10, `small` ≤ 16 } (amber: a person's decision; 70 → 50 px, placed right of the summary, clear of the answers) | · `issue: true` (optional, one sheet: one beat after the stamp its outline floods the drawing from the pencil `original` into the print)
| `section` | two oblique (cavalier) boxes cut by SECTION A-A, detail circle, dimension | artefacts and their check | `title` ≤ 10 · `sub` ≤ 60 · `parts` [2] × { `name` ≤ 12, `desc` ≤ 26, `lines` 0–2 × ≤ 30 } · `notes` 1–2 × ≤ 30 (one line each at 35 px beside the section: keep them short) · `cut` ≤ 14 (default "Section A-A") · `dimension` ≤ 28 · `output` ≤ 12 · `stamp` { `word` ≤ 10, `small` ≤ 18 } (line-colour inspection stamp: a machine's check; 70 → 50 px, nearest the first artefact, clear of its lettering) |
| `loop` | closed loop with a token (one lap per milestone) + timing diagram | an iterative process | `title` ≤ 10 · `sub` ≤ 60 · `steps` 3–4 × ≤ 34 (top pair and bottom pair each together ≤ ~56) · `milestones` 2–4 × ≤ 4 · `counterLabel` ≤ 12 · `trackLabel` ≤ 14 · `gate` { `title` ≤ 30, `sub` ≤ 20 } · `aside` { `head` ≤ 16, `text` ≤ 40, on two lines when one does not fit the column } |
| `checklist` | inspection record: ticked table, computed count, stop rule, inspection stamp | verification | `title` ≤ 10 · `sub` ≤ 90 · `head` [2] ≤ 16 · `items` 3–8 × { `id` ≤ 8, `ok` } · `countLabel` ≤ 26 · `note` ≤ 30 · `footer` ≤ 48 · `stamp` { `word` ≤ 10, `small` (default "passed / n") } (line-colour inspection stamp, beside the count, never on it) |
| `assembly` | exploded view that snaps into a chain on a beat, amber ends | the whole flow, people at both ends | `title` ≤ 26 (100 px → min 70) · `ends` [2] × { `word` ≤ 5, `sub` ≤ 16 } · `endTag` ≤ 12 · `nodes` 2–5 × ≤ 12 · `loop` ≤ 48 · `claim` ≤ 36 · `claimSub` ≤ 90 |
| `parts` | parts list with BOM balloons, then a chain of chips | installation, getting started | `title` ≤ 26 · `head` [2] ≤ 8 · `rows` 1–3 × ≤ 60 (one size for all rows, 35 → min 25) · `thenLabel` ≤ 8 · `chips` 2–5 × ≤ 16 · `note` ≤ 90 (string or spans) |
| `interface` | the product's outline drafted as a hexagon, made a cube by three lines (stroke-reinterpret), opened along its edges into six panels (net-unfold), each lettered | the product opened into its real interface | `title` ≤ 10 (140 px → min 100) · `sub` ≤ 60 · `regions` [6] ≤ 18 each, in the order header, list, main, side, second side, footer (25 px labels, glance) · `views` [2] ≤ 14 (optional: the figure label before and after, default "Outline", "Isometric") |
| `stages` | a slot between two rails that are dimension lines; one word a beat passes through it (slot-rails), lettered a step larger each time; the rails' gap measured at the side; a computed STAGE k / n | a staged sequence: rollout shares, pipeline stages, versions | `title` ≤ 10 · `sub` ≤ 60 · `stages` 3–5 × ≤ 8 (sizes step up the ISO series to 200 px) · `note` ≤ 40 (optional) |
| `release` | title block: dimensioned name, tags, framed URL, key plan of all sheets, status lettered on the last downbeat | the end card | `kicker` ≤ 40 · `name` ≤ 14 (200 px → min 140) · `tags` 2–5 × ≤ 14 · `url` ≤ 44 · `foot` ≤ 44 (string or spans) · `status` ≤ 12 (default "Released") | · `enter` (`'rule'` default after the final overview: the parallel rule crosses the lens; `'push'`: the camera pushes in as before)
| `overview` | camera pulls out over the whole drawing | orientation / the claim | mid: `hud` only. final (`final: true`): `label` ≤ 36 · `lines` [2] ≤ 18 (200 px, 140 when a line does not fit) · `stamp` { `word` ≤ 10, `small` ≤ 16 } (amber, lands in the title block's APPROVED BY cell at 36 → 28 px; a longer stamp is an error) |

Spans: where a slot accepts spans, pass `[['MIT', 'ink'], [' · text', 'muted']]`; roles are palette keys (`ink`, `line`, `muted`, `accent`).

**The accent means "a person annotated or approved".** On the pencil original (`vellum`) it is the same role in its own hue (`#A85200`), so the signature is amber before and after the flood. It is used by the CONFIRMED and APPROVED stamps (`detail`, final `overview`), the revision triangles and underline (`problem`), the answer bracket (`detail`), the `YOU` ends and their brackets (`assembly`). The `section` and `checklist` stamps mark a machine's check and are drawn in the line colour. Do not put the accent anywhere else; there is no slot that colours arbitrary text amber except spans, and spans should not use `accent` for anything a machine did.

## Example (shipped content.js)

A placeholder: "tidepool", an invented backup tool, drafted in pencil on `vellum` and issued as `cyanotype` when the restore policy is confirmed; fitted to 48 s at 100 BPM (20 bars; api 2: 52.8 s, batch 1: 86.4 s): problem 2 · arrangement 2 · interface 2.5 · detail (issue) 2.75 · section 2.5 · checklist 2.75 · overview (final) 2 · release 3.5 (with the phrase's 6 beats). Stamps land at 18.6, 25.2, 31.2 and 36.6 s; the flood runs 19.2–19.8 s; the cube is made at 10.65 s and opens at 11.55 s; the rule crosses at 39.0 s; RELEASED at 45.6 s, the last downbeat. Tiers: T0 median 0.5 beat, longest 3.25; T1 16 compositions, median 2.1 s, CV 0.6; T2 four; T3 hook 0.3 s, claim 36.6 s (76 %, the climax), lock-up 39.7 s. The api 2 example's `loop`, `assembly` and `parts` sheets were left out: the loop's reading and the assembly's six-word claim pass the api 3 limits only when rewritten, and the film did not need them. Its row counts and hashes are illustrative. The source film's dev-skills copy does not fit this template (50-character questions, sentence-long subs and loop steps): dense copy is cut, not squeezed.

## Palettes

| id | ground / paper | line work | accent | use |
|---|---|---|---|---|
| `cyanotype` | `#0A2652` / `#10356C` | `#EAF3FF` ink, `#9FD3FF` line | `#FFB547` | default; the source film |
| `diazo` | `#050B18` / `#0A1630` | `#E6EDF8`, `#8EB4E8` | `#FFB547` | darker, for dark-mode platforms |
| `blueline` | `#C5CED9` / `#F3F5F1` | `#14306A`, `#2D5CA3` | `#A85200` | white print, for light pages and documents |
| `graphite` | `#0F1114` / `#1A1E23` | `#ECEEF1`, `#A9B6C3` | `#FFB547` | neutral, when blue clashes with the brand |
| `vellum` | `#D7D8D3` / `#F4F3EE` | `#2B2E33`, `#565C64` | `#A85200` | the pencil original (`original`): graphite on drafting film, before the issue |

All roles pass 4.5:1 on paper (`npm run contrast`).

## Excerpts

`excerpt: true` makes a cut-down for a reel, a demo or a companion cut of a longer film: 2–9 sheets, no release card required, and the film ends on its last sheet. Without the flag a film keeps 6–9 sheets and ends on the release; the flag only removes what a short cut cannot carry, and every reading, step, ceiling and beat rule still applies.

- **Opening.** The frame is pre-printed (ISO 5457 sheets come with border, zone marks and title block): the HUD is drawn as if 1.2 s had passed (`EXCERPT_HUD_PRE`), and the first sheet has no half-beat lead, its frame and label already being drawn at 0 s (`EXCERPT_SHEET_PRE` 0.45 s). The first frame is the drawing in progress, never bare paper, so a reel can transition straight into it.
- **Ending.** The last sheet builds to its end state and holds still for the usual two beats, with no move out (`choreography.js` `endBuild`). A stamp sheet ends pushed in on its stamp: the push-in settles half a beat before the stamp as usual, the stamp lands with its thud, and the camera stays (no return, the label panel stays folded); the hold runs from the thud to the end and is the excerpt's last word, declared as a pause (≤ 2 bars at api 3). Any other sheet ends on its two-beat hold at the rest framing. Phrase rounding, if the total is not a whole phrase, lengthens that last hold; past two beats on a sheet that ends without a stamp, or past 2 bars on a stamp, `npm run fit` reports it (e.g. `detail` → `assembly` is 4.5 bars, rounded to 6): reorder, add or cut a sheet.
- **Shortest.** A 4.5-beat sheet (2 bars) then a stamp sheet ending on its stamp (2 bars) is 4 bars: 9.6 s at 100 BPM, 8.9 s at 108. Two sheets is the minimum because the route between sheets is the mode's grammar (mode principle 1).
- The HUD reads `SHEET n / N` of the excerpt's own sheets: the drawing on screen is the whole drawing (mode principle 7).
- api 3 has no bar-line turns, so an `arrangement` first no longer gets a `turn` key at 0 s (the 2026-10-19 excerpt's two check-film WARNs are gone).
- Tiers in an excerpt: two peaks (the hook and the last stamp, a reveal, as the climax at about 80 %), no T2 needed under 12 s; the issue and the interface work in an excerpt like in a film.

## Line work

`linework` picks the drafting instrument (mode card, Variants). `'ink'` (default) is the technical pen: every line draws once. `'pencil'` is the pencil original: each line of the sheets and of the route arrows is first blocked in as a light construction line running 56 px past the ends of each straight segment (curves and the loop are laid out along their own path), then lined in over it with a graphite stroke that ends exactly where and when the ink line would (`fx.js` `PENCIL`). Lettering guides are already construction lines; the final route and the amber marks are not laid out. Lettering, arrowheads, stamps and the pre-printed HUD do not change, nor does any timing: `npm run fit` and every key event are the same in both. The hand-offs drawn inside a sheet (the interface's outline and cube, the stage slot) keep their single clean stroke in both. `linework` is the print's instrument: the pencil `original` before an issue is always drawn in `'pencil'`.

## The issue: the pencil original becomes the print

A blueprint is a contact print of a pencil original (Herschel 1842; mode card, Known issues). Set `original: 'vellum'` and `issue: true` on the `detail` sheet whose amber stamp is the signature: until then the whole drawing (sheets, routes, HUD) is drawn in pencil on the original's preset; one beat after the stamp lands (`FLOOD_AFTER_B`), the stamp's own outline grows out of where it sits on screen and floods the frame in one beat (`lib/transitions` `shape-flood`, `shape: 'rect'`, the stamp's aspect, `r0` its half-height), and inside it is the same drawing in `palette` and `linework`: the print. The geometry is identical in both worlds (the same measured layout, built twice: `film.js` `compose`), so the flood reads as one drawing changing material (object constancy, Heer & Robertson 2007). The camera holds the push-in until the flood has closed, then returns; the sheet's build is a beat longer (8). Everything after is the print, including every earlier sheet when the camera pulls out over the whole drawing. The material changes once: a second `issue` is an error. Where it serves: a plan, a review, a signature that makes the rest happen. Not for a film whose subject is already done (start in the print).

## Transitions (2026-10-19)

PLAN §4 gave the mode five new devices (references/transitions.md, "Which transition for which mode"); four carry the film's T2, one its T0. All come from the library (`lib/handoffs`, `lib/transitions`); the template keeps no local copy.

| Device | Where | Tier | How the template uses it | Why here |
|---|---|---|---|---|
| `slot-rails` (X02) | `stages` | T0, one a beat | the rails are dimension lines; the number is the slot's measured height in px (`unit: 'px'`); `from` of the first is an empty word, so the first stage rises in; the slot drafts itself by a left-to-right wipe of the hand-off's own `from` rest | common region groups the stages; number and geometry share one value (mode principle 7) |
| `stroke-reinterpret` (X04) | `interface`, beat 1.75 | T2, 1 beat | the outline the pen drafted is the hand-off's `from` rest, vertex for vertex; added edges in `ink` (line work, not a person's mark) | a change of dimension by line labels alone (Huffman 1971; Clowes 1971) |
| `net-unfold` (X05) | `interface`, beat 3.25 | T2, 2 beats | `yaw` π/4, `pitch` atan(1/√2) and `size` = r·√1.5, so its folded cube is the reinterpreted cube exactly; `panels` are the six regions, lettered after it lands | the box-to-interface relation is shown, not cut (Heer & Robertson 2007) |
| `shape-flood` (X17) | the `detail` with `issue` | T2, 1 beat | from the stamp's outline on screen, original → print | the person's signature changes the drawing's material (mode principle 4) |
| `occluder-pass` (X25) | final overview → `release` | T2 here, 1 beat | the camera holds the whole drawing, then cuts to the release sheet under the rule (`camera.js`); A and B are the same world at two framings | hides the messiest frames of the zoom from the whole drawing to one sheet (Kanizsa 1979); declared T2 because it is the film's last big change |

`blueprint-expose` keeps its role in references/transitions.md (opening or closing a drawing; `lamp: 'hairline', develop: false, direction` re-ink a sheet from a control in the frame) but is not built into the template: the issue is a person's act, so the flood out of the stamp carries it; a lamp would make it a machine's. Hand-offs inside a sheet are drawn without their own motion blur (`{ blur: false }`): the film's camera blur (`lib/canvas.js` `subframes`, speed-gated, sub-frames ≤ 2 px apart, on above 4 px a frame) covers the frame. During the flood and the rule the frame is two worlds composited by WebGL; without WebGL they cut at their midpoint (a console warning).

## Changing tempo or length

Edit the copy; `npm run fit` prints the new table. To ask for a length, set `target`; to fix the tempo, set `bpm` (92–108). To shorten a film, cut copy or sheets; to lengthen a rest, give the mid overview `bars`. To use a generated music track instead of the bed: put it at `assets/audio/bed.wav`, set `bed: { file: 'assets/audio/bed.wav', offset }` with `offset` trimming the file so its first downbeat sits at 0, and set `bpm` to its measured tempo.

## Files

`PLAN.md` the plan (concept, banned defaults; required by `npm run fit`) · `content.js` the film · `palettes.js` presets · `timing.rules.js` reading model, steps, ceilings and key events for fit() · `choreography.js` cue beats per sheet type · `timeline.js` schedule from fit() (shared by picture and sound) · `film.js` build (one world per material) + compose (the flood, the rule, motion blur) + render(t) · `camera.js` keyframes and push-in solver · `hud.js` drawing frame and title block · `fx.js` pen primitives, stamps, paper texture · `sheets/common.js` type sizes and the stamp place solver · `sheets/*.js` one module per sheet type (`interface.js` and `stages.js` draw library hand-offs as layers of the sheet, through `env.handoff`) · `score.mjs` sound · `tools/contrast.mjs`.

## Type scale (settled 2026-10-18)

Every size comes from the ISO 3098 lettering series, heights stepping by √2 (2.5 · 3.5 · 5 · 7 · 10 · 14 · 20 · 28 mm) at 10 px a millimetre: 25 · 35 · 50 · 70 · 100 · 140 · 200 · 280. Each sheet uses three of them — title, notes, labels — set in `sheets/common.js` (`F`, `ISO`). `env.fit()` steps down the series, never below the series step at or under the slot's minimum. The HUD is counted apart and keeps its sizes; stamps (70 / 50, small line 25) and the drawn read-outs are counted apart but sized from the series; the outlined sheet number (decoration) is 140. Settled 2026-10-18 from the batch 2 comparison (check C9): accepted on the recommendation; the owner did not compare it shot by shot. The source film's sizes (150 / 64 / 44 / 26 …) and the `content.variant.type` switch were removed.

| Sheet | Title | Notes | Labels (25) |
|---|---|---|---|
| all sheets | — | sub line 35 (baseline 402) | figure label, tags |
| `problem` | lines 140 | values 70 | keys, triangle numbers, note |
| `arrangement` | claim lines 140, system name 140 | input / output names 35, sub | tags |
| `detail` | 140 | questions and answers 35 | round tags, summary, note |
| `section` | 140 | part names, descriptions and notes 35, output 35, dimension line 35 | part lines, A-A letters, cut label |
| `loop` | 140, week read-out 140 | steps 35, gate rule 35 (25 when it does not fit) | milestones, track and counter labels, gate sub, aside head |
| `checklist` | 140 (count 280, a drawn graphic) | ids 35, count label 35, note 35, footer 35 | column heads |
| `assembly` | one-line head 100, YOU 100 | nodes 35, loop label 35, claim 35 | owner tags, end subs, claim sub |
| `parts` | one-line head 100 | rows 35, chips 35 | balloon numbers, heads, note |
| `release` | name 200 | URL 50 | kicker, tags, foot, status |
| final `overview` | claim lines 200 (140 when a line does not fit) | — | label |

## Sound tone (settled 2026-10-18)

`content.sound.tone` defaults to `'v1'` in this mode: the `blueprint` bed's bright square arpeggio needs no extra air, so the other modes' `'v2'` balance and mastering chain stay off unless set. Settled by theory; the owner did not object (the batch 2 listening pair was not heard). Arrivals out of a `drop` section dip the music 5 dB for two frames and lift the arrival tick and thud 3 dB, so the landing stands out over the full groove (batch 3: the assembly's arrival right after the checklist's drop measured a 1.5–1.9 dB onset).
