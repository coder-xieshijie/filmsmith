# thread template

One line colour becomes everything: a drawn line becomes the caret that types the brief, falls flat under it and rolls up a loop that carries the brief round and brings back its second phrase, then takes the letters back; the brief's big word gives up four glyphs that become swatches, the swatches become storyboard panels, the camera pushes into one panel where three glossy spheres merge, the merged sphere squashes back into the line, the line drops onto the stage name and presses it into itself and becomes a beat ruler with easing curves, the curves flatten into edit tracks, the playhead becomes a full-height line that dissolves into marbled ink, the line colour floods the frame, particles gather into this film's own contact sheet, the sheet becomes a file card, the line runs along the card's foot and the card squashes into it, and a blade cuts the line into the name, the line staying under it. Each stage is named in the corner throughout and once, large, in the centre. Mode card: `references/modes/thread.md` (it fits only reels of a video, motion or rendering tool).

```bash
node scripts/new-film.mjs thread <film-dir> [--palette <id>]
cd <film-dir>
# edit content.js (this file is the guide), then:
# write PLAN.md first (new-film made the skeleton; fit refuses to run without it)
npm run fit           # the timing table, renders/timing.json, the duration stamped into index.html
npm run film          # fit → audio → check → render
npm run snapshot -- --at 2.3,2.9,4.4,6.5,12.6,18.45,20.6,28.5,34.2,38.5     # stills while editing (times for the shipped example)
```

## What content.js controls

```js
export default {
  fps: 30,               // keep 30: the render command uses 30 and the counter shows ceil(duration × fps)
  palette: 'vermilion',  // id from palettes.js
  thread: 'rule',        // the line's profile: 'rule' (default) or 'swell'; see "Thread profile"
  seed: 5150,            // particles, grain, waveform jitter
  // bpm: 120,           // optional, 112–128; the whole chain scales with it (all times are beats)
  // target: 50,         // optional seconds; see "Length" below. Ignored when bpm is set.
  meta: { title, url },
  scenes: [ ... ],       // the chain, in registry order; no bars, no duration
};
```

The brief is one phrase or two (`brief: ['explain our pipeline', 'in {seconds} seconds']`), each at most five words and 24 characters once filled: each phrase is one reading state (timing API 3). Two phrases make the loop (path-type) the head's expressive transition; one phrase is typed and taken back without it.

Numbers about the film itself are never typed: write `{seconds}` (its length), `{frames}`, `{fps}`, `{width}`, `{height}`, `{bpm}` or `{bars}` in the brief or a stage note and the film fills them from the fitted timing (`fx.js` `facts`), so the brief, the counter and the card cannot disagree.

## Scene registry (the chain)

The chain is fixed choreography: the order below never changes. Three links are optional; leaving them out keeps the hand-offs continuous because each hand-off is computed from the neighbours (glyph boxes, the squashed line, the full-height playhead), not tuned to one film. The head and the tail may also be left out, each as a whole (see "Short chain"). How many bars a link holds is not part of the registry: it is fitted from the link's copy (see "Length").

| # | type | purpose | slots (character limits) | hands to the next link |
|---|---|---|---|---|
| 1 | `open` *(head)* | Line draws from the centre, becomes the caret, types the brief's first phrase; the caret falls flat into the line under it (first shrinking at its own place, so it never crosses the text); with a second phrase the line rolls up a loop and carries the first round and out while the second follows it in (path-type); the line tightens under the last phrase, contracts back into the caret at its right end, and the letters slide into the caret, which closes | `brief`: one or two phrases, each ≤ 5 words and ≤ 24 characters after placeholders are filled; `stage` | an empty frame; the big word springs in after |
| 2 | `word` *(head)* | The big word springs in letter by letter, its weight swings 780→200→800→430 on beats 2–4; a trailing `.` `!` `?` is the line colour | `word`: 4–7 letters + optional mark (max size 360 px, fitted to 1500 px) | its first four glyph boxes |
| 3 | `palette` *(optional)* | Glyphs morph into four swatches (text, ground, field, line), hex labels type on, swatches hop, type specimen | `stage` (hex labels and specimen are computed) | four swatch circles |
| 4 | `storyboard` | Swatches (or glyphs, or, as the first link, the line's four segments) grow into four panels, two more appear, sketches draw, panel 3 is chosen | `stage` | panel 3 |
| 5 | `merge` | Camera pushes into panel 3 (first half bar); three spheres drift together, merge through a viscous neck, squash, rebound, settle (WebGL); its centre stage name lands under the sphere | `stage` | the settled sphere and its name (to `curves`) or, without `curves`, the sphere squashed into a 1400 × 6 line in its last 0.45 s (at 120) |
| 6 | `curves` *(optional)* | Sphere squashes into the line; when the merge showed its name, the line drops to hover over it and presses it into itself on the beat (rail-press, phase `press`), taking its weight and recovering as the beat ruler; otherwise it drops straight to the ruler. Four easing curves draw (ω 12/20/30/40), riders land together on the beat, the spring formula | `stage` | the ruler line at y 860 and the graph |
| 7 | `tracks` *(tail)* | Ground floods out of the line, curves flatten into four tracks, clips land (positions computed from this film's own scene layout); the playhead waits at the left, sweeps in the last half bar and grows to full height | `tracks`: 4 names, each ≤ 12; `stage` | a full-height line at the centre |
| 8 | `ink` *(optional)* | The line dissolves into two marbled dyes curling outward (WebGL); serif words rise over the darker centre; in a longer link the plume stops growing and keeps curling | `words` ≤ 14 chars, 1–3 words (max 230 px); `stage` | the frame, under the flood |
| 9 | `review` *(tail)* | Line colour floods from the centre (lib/transitions `dot-iris`, ground-only) and holds the frame for two bars, then retracts onto the contact sheet's gutters and border; particles gather into 16 tiles; the tiles reveal this film's own frames on 1/16 notes while the counter runs to the real frame count; checks pop; tiles collapse into a file card: its title, then its spec line in three parts, then the line runs along the card's foot (the export); the card squashes into the line, landing exactly at the link's end | `count` ≤ 22 (counter label), `card` ≤ 4 (card title); `stage` | a 1100 × 6 line at the centre |
| 10 | `close` | Ground opens from the line (the card's, or the merge's rod in the short chain); the line settles 50 px under the name's baseline, thickens into a bar, and a blade cuts the bar into the name, left to right (rail-press, phase `cut`), landing on the beat; as the name lands, the band left under it contracts into the caret at the URL's start (the open's caret path run back); the caret types the URL, which holds ≥ 3 s, and one serif line enters; on the last downbeat the caret falls flat into the URL's underline, as it fell flat under the brief (the line that typed the request ends as the link; without a `url` the band stays under the name) | `name` ≤ 16 (max 196 px; descenders stay above the band, 50 px under the baseline), `line` ≤ 52 (max 60 px), `url` ≤ 52 | — |

## Short chain

Added 2026-10-19 for reels shorter than the full chain (the shortest is 6 bars, 12 s at 120 BPM). Two parts may be left out, each only as a whole; `film.js` paints anything else as an error:

- **Head**: `open` and `word` together (and `palette`, which takes the word's glyphs). The storyboard is then the first link and the film's first frame is the line alone, 1400 × 6 at the centre (the opening line of the full chain). From the first frame the line is cut into four equal segments that open into panels 1, 4, 2 and 3 on 1/32 notes, nearest first so no two paths cross; each segment starts in the line colour, keeps its slice of the line's profile until it opens, and takes its panel's colour as it grows; the panel outline and the shot in panel 3 appear as it opens. Panel 1 shows the close's `name` (the title board) instead of the word.
- **Tail**: `tracks` and `review` together, with `curves` and `ink` (they hang on the tracks' playhead and the flood). The merge then squashes its sphere into the line in its last 0.45 u, and the close starts from that rod on the field: the ground opens out of it both ways (as in `tracks`) while the rod settles under the name's place and is cut into the name. The merge's centre name (under the sphere) lands half a beat earlier and leaves before the squash, so its landing sound gets a soft kick under it to stand out from the second squelch. The film's audio fades in over 60 ms: a short chain opens on a hit, which made the encoder overshoot the true-peak ceiling (see Sound).

| Chain | Bars at 120 | At 120 | At 128 |
|---|---|---|---|
| `storyboard → merge → close` | 1.5 + 2.25 + 2.25 = 6 | 12 s | 13.125 s (7 bars: the merge needs 2.25 and the URL's 3 s a longer close) |
| `open → word → storyboard → merge → close` | 10 (the example's copy) | 20 s | — |
| `storyboard → merge → curves → tracks → ink → review → close` | 15 (the example's copy) | 30 s | — |

(timing API 3, checked 2026-10-19 with `npm run fit`; all three fit with no error. The short chain gets a fit warning, no run of three compositions that speeds up or slows down, because it has only five compositions.)

The first frame of a headless film is the line, so a reel can join another film's line to it without a cut; its last bar holds the name card still (the closing second move lands on the last downbeat).

## Length

Nothing in content.js says how long the film is. `timing.rules.js` declares **timing API 3** (the four tiers of change, principles 4 and 5, owner-approved 2026-10-19): `lib/timing.js` `fit()` rounds each link to a beat (`unit: 0.25` bar) and the total up to a whole bar (`phrase: 1`), and `film.js`, `score.mjs` and `npm run fit` all call it; `npm run fit` writes `renders/timing.json` for `check-film`, whose tier rows FAIL for an api 3 film. A link needs the longest of three paths:

- **centre**: the time until its text is readable, its primary text read through the shared reader at 0.3 s a word (items with an `at` enter one after another; each is one reading state of at most five words), and its exit. Text revealed piece by piece (the typed phrase, the rising ink words, the card's spec line in three parts) is read along. Hex labels, specimen names and track names are glance text: still ≥ 1 s, in parallel.
- **corner**: the stage name (where it changes) and the note, both glance text: fully still ≥ 1 s after they appear (1.7 beats on the first link, 0.9 where a new stage starts, 0.7 where only the note changes), plus 0.25 beat as the note leaves. A note over six words is counted as primary text and reported.
- **motion**: the choreography that must play out before the hand-off (`shots.js` tables), including the centre stage name's beat on the links that show it. It does not grow with the copy.

| type | readable from | read (tier) | motion | bars at 120, the example |
|---|---|---|---|---|
| `open` | 1.0 u (typing) | each phrase (primary, read along; the second from the loop's end) | `shots.js` `openPlan`: line, caret, phrase 1, the caret falling flat, the loop (2 beats), the line tightening, contracting, the letters into the caret | 2.75 |
| `word` | 0.6 u | `word` (primary) | 1.95 u (weight swing) | 1 |
| `palette` | 0.62 u | four hex labels, three specimen names (glance) | 1.825 u; with its centre name 2.77 u | 1.5 |
| `storyboard` | — | — (panel numbers are 16 px decoration) | 1.9 u; with its centre name 2.67 u | 1.5 |
| `merge` | — | — | 3.5 u (push, merge, settle, the name under the sphere); + 0.45 u squash without `curves` | 2 |
| `curves` | 1.15 u (+ 0.5 u after a press) | the formula (primary, five words) | the riders land at 2.0 u (+ 0.5 u after a press) | 1.75 |
| `tracks` | 0.54 u | the four track names (glance) | 2.0 u; with its centre name 2.97 u | 1.5 |
| `ink` | 0.65 u | `words`, one every 0.55 u (primary) | 2.0 u (plume growth) | 1 |
| `review` | the card's title at 7.05 u | `card`, then the spec line in three parts (primary) | the export bar ends 8.85 u; + 0.35 u squash | 4.75: a turn (on a bar line) and the climax, with its reason; three compositions (shots at the sheet and the card) |
| `close` | the name at 1.0 u | `name`, `line`, `url` (primary); URL ≥ 3 s after it is typed | — | rest; takes the bar rounding |

Limits every link obeys (`lib/timing.js` DEFAULTS, api 3; `npm run fit` reports a breach as an error):

- **Text per state**: at most five primary words enter together; the brief is split into phrases for this, the card's spec line enters in three parts.
- **Holds**: after a landing the picture holds still at least 0.2 s and at most 2 beats (`events()` declares every hold; check-film measures the longest still per link on the pixels, rest links excepted). Where text is still being read the line keeps moving without crossing it: the caret falls flat, the line tightens under the brief, the export bar runs along the card.
- **T0**: a change about every beat (the example: median 1 beat, longest gap 2.7 beats), each declared as `micro` from the same tables the picture draws from.
- **T1**: compositions (links and `shots`: the loop, the shot behind panel 3, the contact sheet, the file card, the lock-up) median 2–3 s, each ≤ 6 s except the review (the climax, with its reason) and the close (a rest); two in the first 5 s.
- **T2**: the line's expressive hand-offs, one every 8–12 s (see "Hand-offs"); **T3**: the hook (the big word's first swing, or without the head the first centre name), the climax (the contact sheet on the drop, at 60–85 %; without the review, the lock-up), the lock-up (the name cut out of the line).

**Tempo.** `bpm` defaults to 120, the `thread` bed's tempo, and is kept within 112–128: every motion value is in beats, so the tempo changes how fast the chain moves, not its shape. Reading is in seconds, so a faster tempo can need more beats (the short chain is 6 bars at 120 and 7 at 128).

**target.** With `target` (seconds) and no `bpm`, `fit()` searches 112–128 in half-BPM steps for the length closest to it; what the range cannot reach is reported as bars to cut or add.

**Holding a link longer by hand.** A scene may set `bars` to lengthen a link; a value below the reading need or above the ceiling is reported and overridden. Lengthening a link lengthens its last hold, which api 3 caps at 2 beats, so it rarely helps.

**Events.** `timing.rules.js` exports keys (each centre name's landing, the word's three weight swings, the loop's landing, the press hitting the name, the flood's turn, the drop on the contact sheet, the counter, the name cut, the closing second move: the caret falling flat under the URL), the still windows, every hand-off (link boundaries except the flood, push → shot, and the start of each library hand-off, so check-film measures their continuity), the content mask `0 170 1920 910` (everything but the corner label), and the tier arrays `micro`, `shots`, `expressive`, `peaks`.

The shipped example fits to 20 bars = 40.0 s at 120 BPM (1200 frames): open 2.75, word 1, palette 1.5, storyboard 1.5, merge 2, curves 1.75, tracks 1.5, ink 1, review 4.75, close 2.25. Tiers (2026-10-19): T0 73 onsets, median gap 1 beat, longest 2.7; T1 15 compositions, median 3 s, CV 0.36; T2 5 (path-type, the panel push, rail-press ×2, dot-iris; spacing 4.8–11 s); T3 3, the climax at 70 %. Rendered, check-film 0 FAIL, 0 WARN.

### `stage` (every link except `close`)

`stage: { name, note }` names the pipeline step the link demonstrates. Consecutive links with the same `name` share one label (its number does not change); a link without `stage` continues the previous one. The label reads `02 / 06   PALETTE` (step number and count are computed from the distinct names) with the `note` under it in serif italic. The label stays on from the first link to the name; when the stage changes only the number and the name are retyped. The first link of each stage whose centre has no words of its own (`palette`, `storyboard`, `merge`, `curves`, `tracks`) also shows the name large in the centre for one beat after it lands.

- `name` ≤ 14 characters, shown upper-case.
- `note` ≤ 40 characters and six words or fewer; it says what the subject *does* at this step, in plain words, restating what the link shows (that is why it may be read at a glance). Placeholders such as `{frames}` and `{seconds}` are filled from the film and count as one word.
- Write six or fewer distinct names. This is where the film says what it is about; the owner's known issue with the source film was that the message was unclear.

## Hand-offs (timing API 3)

The links still never cut: the line itself changes shape between states. Four library devices carry it, drawn from `lib/handoffs/` and `lib/transitions/` (references/transitions.md), and one device of the template's own (`timing.rules.js` `devices`, CONTRACT.md "Template devices"):

| Where | Device | Tier | What the line does |
|---|---|---|---|
| `open`, two phrases | `path-type` (2 beats) | T2 | rolls up a loop from its middle, carries the first phrase round and out, brings the second in, opens straight under it |
| `storyboard` → `merge` | `thread-panel-push` (the template's own, 2 beats: 0.9 u push + the shot on the beat) | T2 | the line, as the outline that chose panel 3, frames the window the camera pushes through into the shot the panel already shows; a change of ground on the beat (the zoom through a window: counter-portal's mechanism with the chain's own panel, not a letter's counter). It fills the middle of the chain, where the loop and the press were 15.8 s apart (2026-10-19) |
| `merge` → `curves`, when the merge shows its name | `rail-press`, phase `press` (1 beat) | T2 | drops onto the stage name, presses it into itself, takes its weight and recovers as the beat ruler |
| `ink` → `review` | `dot-iris`, `contents: 'ground-only'`, `growth: 'exp'`, no ring (0.6 beat) | T2 | the flood: the line colour opens from the centre as the next ground (the one frame-level device inside the chain: a change of ground, principle 7, never a cut) |
| `close` | `rail-press`, phase `cut` (1 beat) | T2 and the lock-up | thickens into a bar that a blade cuts into the name; the band then leaves the name as the caret that types the URL and underlines it |

Two small template-local extensions, because the modules cannot express the thread's profile: during path-type the template draws the bent line itself (the module's line is made transparent; the geometry is the module's, sampled so a `swell` line stays swelled), and during rail-press the template draws the band (the module draws the word and the bar, with the band's rows clipped out). Both blur through `lib/canvas.js` `subframes` with the module's own speed measure (`h.speed`), as `h.draw` does. Without WebGL the flood falls back to the template's 2D disc.

Not used: `arc-curl` (the line's figures in the chain, caret, rod, ruler, playhead and the URL's underline, are none of them closed outlines; a curl into a ring would be a shape for show, its own "not for") and `signal-relay` (it needs cards on a line of steps and two state colours, active and done; thread has one accent, and its corner label already counts the steps).

## Computed, never typed

| On screen | Comes from |
|---|---|
| Swatch hex labels | the chosen palette |
| Type specimen names | the fonts this template ships (`fx.js` `SPECIMEN`) |
| Step numbers `02 / 06` | distinct stage names, in order |
| Clip positions on the tracks | the laid-out scenes (row 1 every scene, row 2 the two WebGL shots, row 3 the beat grid, row 4 the stage spans + the name) |
| Contact-sheet tiles | 16 frames of this film rendered at quarter size at init: every link before the review gets tiles in proportion to its fitted length (at least one), inside the window where it holds still (`REGISTRY.still`) |
| Counter | the rendered frame count, `ceil(duration × fps)` of the fitted length (1200 for the 40 s example) |
| Card spec line | `{width}×{height} · {fps} FPS · {seconds} S` (`fx.js` `SPEC`) |
| `{seconds}` and the other placeholders in the brief and notes | the fitted timing (`fx.js` `facts`) |
| The card's spec line, in three parts | `fx.js` `SPEC`, split at ` · ` |
| Centre stage names, their beat | the stage names, `shots.js` `CENTRE_NAME` |
| Formula and ω labels | the curves actually drawn |

## Fixed parts (change in code only, with the mode card)

The chain order; the timing values in `timing.rules.js` (measured from the choreography: change them only together with the motion they describe); every motion value (springs, staggers, the push, the merge choreography and the chain constants in `shots.js`, the shaders in `gl.js`); the type scale (`fx.js` `TYPE`); the tile grid (4 × 4 at 280 × 158); the track row meanings (the shot row is neutral with a line-colour outline: the field colour is a ground only); the Factory defaults and Don'ts in the mode card. Track names, words and labels are slots; their positions follow measured text.

## Palettes

Each keeps one ground, one **line** colour (the only accent: caret, full stop, swatch, spheres, riders, playhead, ink dye, flood, the URL's underline) and one **field** colour (a second ground: the stage of the volume shots, never a mark). Contrast is checked on load; a failing preset is painted in red. Text on the field and on the flood uses the solid `onField` / `onLine` colour (the corner label one weight heavier); measured on rendered frames it holds 4.9:1 or more in every preset. Where a ground edge sweeps across text (the push into panel 3, the ground opening out of the line in `tracks`, the flood retracting) the text is drawn in both colours, each clipped to its side (`film.js` `split`, `edgeAt`): with `ultramarine`'s light field, a label coloured for one side fell to about 1.6:1 on the other for a few frames.

| id | ground | text | line | field | text/ground | line/ground | onLine/line | onField/field |
|---|---|---|---|---|---|---|---|---|
| `vermilion` (source film) | `#0B0B0D` | `#EDEAE2` | `#EE4938` | `#2E2EF4` | 16.4 | 5.3 | 5.3 | 6.2 |
| `ultramarine` | `#0A0B10` | `#ECEDF2` | `#6B7BFF` | `#F2B630` | 16.8 | 5.5 | 5.5 | 10.8 |
| `rose` | `#0D0B0E` | `#F0EAEE` | `#FF4F9A` | `#0B6658` | 16.5 | 6.4 | 6.4 | 5.8 |
| `paper` (light) | `#EEEAE1` | `#141416` | `#EE4938` | `#2E2EF4` | 15.3 | 3.1 | 4.9 | 6.2 |

Line against field is about 2:1 in every preset (hue contrast only, as in the source film); the spheres read by their shading and contact shadow.

## Thread profile

`thread` sets the line's profile everywhere the line colour is drawn as a line: the drawn line and the caret, the caret falling flat and the line under the brief (straight and bent round the loop, `film.js` `loopLine`), the rod, the band of both rail-presses (`railDraw`), the beat ruler, the playhead, the full-height line under the ink, the export bar on the card, the line the card flattens into, the band under the cut name, the caret and the underline of the URL, and the line and playhead sketched in panels 2 and 5 (`film.js` `threadRect`). Nothing else changes: timing, choreography, sound, swatches, panels, spheres, ink, flood, type.

| value | the line | the squash | source (mode card, Variants) |
|---|---|---|---|
| `rule` (default) | the box a 6 px rule fills, square ends; caret 6 × 64 | ellipsoid → rounded box → 1400 × 6 rod | the source film; the printer's plain rule |
| `swell` | the box's swelled form: an ellipse along the long side, the short side `SWELL` (2) times thicker in the middle, tapering to points; near a square the swell eases off, so the line becomes the caret through a round dot | the sphere stays an ellipsoid and flattens into a 1400 × 12 lens; the 2D line takes over with no visible change | the swelled (English) rule; the pointed pen's expansion stroke |

When the axis was added the default rendered pixel-identical to the template before it (2026-10-19, 24 stills and the mix compared); the timing API 3 migration later that day changed both values alike. Both values render the new hand-offs (checked by stills, 2026-10-19).

## Settled (2026-10-18)

The batch-2 options (check 2026-10-18 C6, C7, F2, R2 and principle 7) are settled; there is no `variant` key any more (`film.js` reports one as an error). The owner judged this film the one to keep as the Skill's promo, unchanged (workshop journal 2026-10-18), so the three items the owner was to pick stay as they were. Samples: workshop `works/skill-modes-v1/batch2/c6-*`, `t-flood`, `x-thread-merge`.

| Item | Settled | How it was decided |
|---|---|---|
| `c6-palette` | default preset `vermilion`; `ultramarine` and `rose` stay as ordinary presets (contrast in the table above) | kept as it is because the owner approved the film as it stands; the owner did not compare the presets shot by shot |
| `c6-ending` | the film ends on the name, with the closing line and the URL under it; the `'line'` ending (closing line as display text, no name) is deleted. Since 2026-10-19 (timing API 3) the name is cut out of the line (rail-press) and so drawn in the line colour. Changed the same day after the owner asked what the extra line under the name meant (review, 2026-10-19): the band leaves the name as the caret, types the URL and underlines it on the last downbeat, so the film ends on the name and the underlined URL | kept as it is because the owner approved the film as it stands; the owner did not compare it shot by shot |
| `c6-curves` | the example keeps `curves` (still optional in the registry) | kept as it is because the owner approved the film as it stands; the owner did not compare it shot by shot |
| `t-flood` | the flood holds the frame for two bars, then retracts onto the contact sheet (exponential in-out over `RECEDE` = 0.4 u, landing on the downbeat two bars after the flood, `REVIEW_CUES.recede`), leaving the sheet's 12 px gutters and border in the line colour (about 5 % of the frame); from the collapse it shrinks with the tiles and is gone under the stack before the card lands. Counter, corner label and card sit on the ground after the retraction; the retraction was a `land` key and is a `micro` event since 2026-10-19 (the checks start popping on the same beat, so check-film saw no stop there); the sound did not change. The flood's entrance is drawn by lib/transitions `dot-iris` since 2026-10-19 (the same exponential disc). The 5-bar full flood is deleted | settled by theory (principle 7: a change of ground lasts at most two bars); the owner did not object |
| `x-thread-merge` | the batch-1 merge: line-coloured shadow side, one soft highlight, the neck growing over 0.35 s from contact, no spark where three surfaces meet | accepted on the recommendation; the owner did not compare it shot by shot |

## Sound

`score.mjs` reads the same `fit()` and lays the `thread` bed on the same grid, one section per run of links (intro on `open`, build through the chain, half-time intro under `merge`, a pad-only break under `ink` and the particle gather, a rest of 0.2 bar, the drop on the contact sheet, rest under the collapse, a pad-only break while the card is held past the review's fourth bar, outro on the name; `assets/audio/measure.json` records the measured loudness). The mix fades in over 60 ms (a film that opens on a hit, the short chain, made the AAC encode overshoot the true-peak ceiling by 4–8 dB, and HyperFrames then lowered the whole mix by as much; 2026-10-19). Consecutive links of one kind share a section, so the chord progression runs on instead of restarting each link; every section is whole links, so the bed fits any number of bars. It places about 70 effects at the same reference times as `film.js` (exits timed from the link's end, like the picture): whoosh, plucks, typing, bells, ticks per clip and tile, a squelch at the merge contact and a thud on the landing, an impact and a rumble under the ink, a riser into the flood. The api 3 hand-offs each land with a sound: a tick as the caret falls flat, a whoosh with the loop and a pluck and bell as the second phrase lands, ticks as the line tightens and contracts, a whoosh as the rod drops and a thud and bass where it hits the stage name, typing for the card's spec parts and a soft riser under the export bar, a swell into the bar, a pluck per letter as the blade passes, and a tick, kick and bell as the name lands. The squelch and the rumble are synthesised in `score.mjs`. If you add an event in `film.js`, add its sound at the same `u`.

## Files

| File | Holds |
|---|---|
| `content.js` | the film (only file edited for an ordinary film) |
| `timing.rules.js` | timing API 3: what each link needs (choreography, strings read, ceilings, tempo range) and its events (keys, holds, hand-offs, micro, shots, expressive, peaks), read by `fit()` and `events()` |
| `palettes.js` | presets |
| `film.js` | registry, validation (including the short chain and the brief's phrases), the thread profile (`threadRect`, `loopLine`, `railDraw`), every link, stage labels, frame assembly, motion blur and still windows, the four library hand-offs (built in `ready()` after the fonts); takes bars, bpm and duration from `fit()` |
| `shots.js` | merge and squash choreography (pure functions of time, contact times in `MERGE_CUES`), the thread profiles (`THREADS`, `SWELL`) and the chain constants film, timing and sound share (`OPEN_OUT`, `CENTRE_NAME`, `closeSecondMove`, `REVIEW_CUES`, `RECEDE`), and the api 3 tables: `OPEN` / `openPlan` (the brief's phrases, the loop), `PRESS` / `pressedName` (the stage name into the ruler), `RIDE`, `CARD` (the spec parts, the export bar, the squash), `CLOSE` (the cut) |
| `gl.js` | the two WebGL shaders: ray-marched smooth-min spheres (one highlight, line-coloured shadow side); domain-warped ink |
| `fx.js` | fonts, the type scale, measured type, typing, colour, contrast, the placeholders (`facts`, `SPEC`) |
| `score.mjs` | bed, effects, two synthesised sounds, on the `fit()` grid (`lib/fit.mjs` stamps the duration) |

WebGL is required for the two volume shots (HyperFrames' Chrome provides it; on a machine without a GPU it falls back to software and renders more slowly). If WebGL is missing entirely the spheres fall back to flat discs and the ink to a plain ground, with a console warning; the film is not acceptable that way.

## Example (shipped content.js)

The filmsmith skill explaining its own pipeline (a video toolchain, as the mode requires). Brief `explain our pipeline` / `in {seconds} seconds` (two phrases: the loop), word `Plan.`, stages Prompt → Colour → Boards → Physics → Cut → Output, tracks `SHOTS / GL PASSES / MUSIC / TITLES`, ink words `pure code`, counter `FRAMES RENDERED` to 1200, card `MP4`, close `filmsmith` / `Every film is code: scored, timed and checked.` / the repository URL. Fitted length 40.0 s (20 bars at 120 BPM), the same as batch 1 though every link was refitted for timing API 3 (2026-10-19). It is also the Skill's promo film (owner, 2026-10-18), so its facts follow the Skill: the URL is the public repository, and nothing in the copy states a mode count or a command. The copy differs from the source film's; the look is still its factory default (mode card, Factory defaults), kept at the owner's wish.
