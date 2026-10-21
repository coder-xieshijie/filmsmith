# split template

One movable seam divides the frame from the first scene to the last. On one side is what is written (the input, on
paper: a request, a list, real lines of a real file, a command, a one-line diff, the install line); on the other is
what that makes (the result: real frames of rendered films, renders, a captured page, a report). Every change is a
move of the seam: the caret stands up into it, slats slide out of it, a copy of it wipes the frame, it branches into a
third pane, and at the climax it slides across two renders of one instant. Each pixel shows one side, never both
(no crossfade). The results are evidence: the film crops them to their pane and scales them within the zoom cap,
never edits them, and every quoted line is quoted verbatim. Mode card: `references/modes/split.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs split <film-dir>
cd <film-dir>
# capture the results (tools/capture.mjs), fill PLAN.md, edit content.js
npm run assets -- --films <dir of the source films> --root <repo the quoted files live in>
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time
npm run snapshot -- --at 1.3,5.3,8.3,12.5,19.5,21.0,27.5
npm run film          # assets → fit → audio → check → render → renders/film.mp4
npm run palettes      # contrast table of every preset, then the seam against every result region
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film: palette, seed, the assets with their manifest, the scenes. The only file edited for an ordinary film. No duration, no bars. Optional `seam` (Variants), `edges` (Shortest cut), `moves` (Moves), `bpm`, `target`, `sound`. |
| `assets/real/` | The captured results, kept as captured (sha256 in content.js). The shipped thirteen are the skill's own outputs (Example content). |
| `palettes.js` | Presets `diff` (default), `night`, `plum`. `npm run palettes` prints every contrast pair and checks each preset's accent against every result region of content.js (ΔE00 ≥ 20). |
| `choreo.js` | The layout of each scene type and when everything in it happens, in beats and seconds from the scene's start; the slot limits and `validate(content)`. One pure table shared by `timing.rules.js` (need, events), `film.js` (the picture) and `score.mjs` (the sound). |
| `moves.js` | The six moves, pluggable: one adapter per role over a hand-off module of the runtime (Moves). |
| `timing.rules.js` | How long each scene type needs (timing API 3, format `lib/timing.js`), read from `choreo.js`. |
| `film.js` | Renderer: the two sides, the seam and its grip, the chips naming each result's source, the moves, the report pane, the lock-up. `render(ctx, t)` is a pure function of `t`. |
| `score.mjs` | The `terminal` bed and the sounds of the keyboard and the seam, placed from `choreo.js`; writes `assets/audio/mix.wav` and `assets/audio/measure.json`. |
| `tools/capture.mjs` | Capture a result: `frame` (one frame of a rendered film, optionally cropped), `page` (a live page in headless Chrome), `image` (a still a template rendered). Encodes once (webp, stepping the quality down to `--max-kb`) and prints the manifest entry. |
| `tools/check-assets.mjs` | `npm run assets` (below); writes `renders/check-assets.txt`. |
| `tools/regions.mjs` | The places each result is shown and the ΔE00 accent rule (ffmpeg decodes each visible region). |
| `index.html` | The canvas, the static `__timelines` stub and the pre-registered build hold; `data-duration` is stamped by `npm run fit`. |

## Assets

Each entry of `content.assets` is the manifest of one file in `assets/real/`:

| Field | What |
|---|---|
| `file`, `size` | the file in `assets/real/` (webp, png, jpg) and its pixel size `[w, h]` |
| `kind` | `'frame'` (a frame of a rendered film), `'render'` (a still a product rendered), `'page'` (a captured page) |
| `from` | a frame's source: `{ film, at, crop? }`, the film's file name, the time in seconds, the crop `[x, y, w, h]` |
| `focus` | the point (file px) kept nearest the pane's centre when the asset covers a pane smaller than it |
| `scale` | optional: a frame or render shown larger than 1:1, at most 4/3 |
| `chip` | the source shown on a tab beside the seam (a film and its time, a template and its palette); ≤ 52 characters |
| `captured`, `how` | the date and the way it was captured (the line `tools/capture.mjs` prints) |
| `sha256` | the file's hash at capture; `npm run assets` fails when the file changed |
| `claim` | what the film says this asset shows, in one sentence |
| `people` | starts with `'none'` and says what was checked: crop people, avatars and account rows out |

Frames and renders cover their pane at 1:1 (or `scale`); pages are contained, 60 px clear of the seam. The zoom cap
is 4/3 output px per source px (principle 2): capture at the film's size, a page at 2×. Keep each file ≤ 200 KB in a
template's shipped example (`tools/capture.mjs` steps the webp quality down); a film's own assets have no size limit
(`npm run assets -- --max-kb <n>`).

`npm run assets` checks, for every asset: the file, its hash, its size and `people`; a frame decoded again from its
film at its time (and crop) against the file, PSNR ≥ 30 dB (`--films <dir>` or `$SPLIT_FILMS`; without the films a
WARN, never a silent pass); the zoom cap at every place the film shows it. For the scenes: every line a `file` scene
quotes equals that line of its source file, and a `diff` scene's `before` equals line `n` (`--root <dir>` or
`$SPLIT_ROOT`, else the folders above the film; a file not found is a WARN); a `render` scene's report lines equal
what `scripts/check-film.mjs` prints for the report's film; and the accent rule for the content's palette. `npm run
film` runs it first and stops on a FAIL.

## Time

Length follows content. `npm run fit` runs `lib/timing.js` `fit(content, rules)` (timing API 3) with
`timing.rules.js`: each scene gets the whole beats its choreography and its copy need. No scene is a turn; the diff
lands its slider on a bar line itself (its claim key), by placing everything else back from that landing. The total
is rounded up to a 2-bar phrase and the rounding goes to the lock-up, a rest, whose second move (the seam closing)
lands on the last downbeat. Tempo 120 bpm (one bar 2.0 s), range 112–128; `bpm` fixes it, `target: <seconds>`
moves it inside the range.

Claims, tokens and results rise through their own rail (0.36 s) at reading pace, 0.3 s a word; typed text (the
request, the command, the diff's + line, the install line) runs at a constant rate, one onset a beat while it runs,
so the picture is never still while something is read or written. Still stretches between landings are declared
holds (≥ 0.2 s, ≤ 2 beats); the diff's last is the claim's pause. The list of a pick, the report's lines and the
lock-up's line are glance text (≤ 6 words each).

### Length table

Beats from the scene's start at the tempo, unless marked s.

| Type | Motion | Primary text (enters at) | Glance | Need |
|---|---|---|---|---|
| `request` | the prompt types at 28 characters a second from 0.25; the caret runs to the seam and stands up into it (0.75 beat), landing on the first beat ≥ 2 beats and ≥ 0.75 after the typing; the first result slides out of the seam (`split-open`, 1 beat) | `prompt` typed; `claim` phrases one beat apart after the landing | — | the claim read, the request out 1.5 beats later, + 0.3 s |
| `pick` | the list rises (0.5); the tick hops at 1, 2, then every 2 beats; the first change is a louvre of slats (`louvre`, 2 beats), later ones one slat (0.75 beat) | `claim` at 0.25 | the list items | last landing + 1.25 beats |
| `file` | a copy of the seam crosses the frame top to bottom (`wipe-line`, 2 beats): code above, its result below; the underline pairs a token with its frame at 2, 3, 4 … | `claim` at 1.5; each token as it is paired | — | last pair + 1.5 beats |
| `render` | the band rises to the command and a branch runs down (`split-branch`, 2 beats): command, film, report; the command types from 0.75; the film cuts at 2, 3, 4 … | first phrase at 2.5; `report.result` after the last line, the second phrase half a beat later | the report's label and lines (one every 0.5 beat from 3) | result + 1 beat |
| `diff` | the + line types into the time before the first phrase (12–42 characters a second); the chips name before and after 4 beats before the landing; the seam slides across the two renders (`diff-slider`, 2 beats) and lands on the first bar line ≥ 7.5 beats in | first phrase 6 beats before the landing; the second phrase with the landing (the claim) | — | landing + reading + 2 beats (the pause) |
| `lockup` | a copy of the seam crosses right to left (`wipe-line`, 2 beats); the name at 3.5; the install line types from 4.5; the address on the next beat; the seam closes out of the frame 5 beats before the end (1 beat), the caret blinks on the last four beats | `name`, `command`, `url` | `line` | max(address + 3 s, line + 0.86 s) + 5 beats; takes the phrase rounding |

At 120 bpm: a `request` with a two-phrase claim 2 bars; a `pick` with three picks 1.75 bars; a `file` with four lines
and three pairs 1.5; a `render` with four results and four report lines 2; a `diff` 3–3.75 (it waits for its bar
line); the lock-up 4.5–5 with the rounding.

**Tiers** (`choreo.js`, principle 5): T0 — every word, tick, underline, cut, report line, typed beat and move start;
T1 — every landing composition (a result in its pane, a token with its frame, command | film | report, before |
after named, the slider at rest); T2 — the first louvre, each wipe line and the branch; T3 — the hook (the caret
standing up into the seam; a cut-down opening on a file: the first pairing), the slider's landing (climax, 60–85 %),
the lock-up's name. `npm run fit` refuses a film that breaks them.

## Global slots

| Slot | Limit | Notes |
|---|---|---|
| `palette` | id | `diff` (default), `night`, `plum`; never a hex value. Pick by `npm run palettes`: only a preset marked `ok` for the content's regions |
| `seam` | id | `straight` (default), `stitched` (Variants) |
| `edges` | id | `full` (default), `cut` (Shortest cut) |
| `moves` | `{ role: id }` | Moves, below; omit for the defaults |
| `seed` | int | the sound's variations |
| `meta` | `{ title, url }` | the film's title and address (PLAN.md, the render's metadata) |
| `assets` | object | Assets, above |
| `sound` | `{ bed, key, seed, tone }` | `bed` (default `terminal`), `key` (default `A`), `tone: 'v1'` for the older mix |

## Scene registry

| Type | Purpose | Slots (limit) |
|---|---|---|
| `request` | First scene only (T3 hook): the request is typed; its caret becomes the seam and the first result slides out of it | `label` ≤ 44 characters; `prompt` ≤ 40 characters; `result` (frame or render id); `claim` 1–2 phrases, each ≤ 5 words and ≤ 24 characters |
| `pick` | After a request or a pick: a list on the input side; the tick moves and the result follows | `label`; `claim`; `list` 2–10 items ≤ 14 characters; `picks` 2–4 of `{ item, result }` (the item must be in the list) |
| `file` | Real lines of a real file over the frames they make; the underline pairs a token with its frame | `label`; `claim`; `source { file, from }` (the path and the first line's number); `lines` 2–6, ≤ 64 characters, verbatim; `pairs` 1–4 of `{ line, token, result }` (0-based line; the token must be on it) |
| `render` | After a file: the command above, the film and its report below | `label`; `command` ≤ 44 characters; `results` 2–5 ids; `claim` 1–2 phrases; `report { label, source { film, tool }, lines: 1–5 of [status, item, value] ≤ 30 characters, result }` |
| `diff` | One changed line; the same instant rendered before and after either side of the seam (the climax) | `label`; `source { file }`; `line { n, before, after }` ≤ 40 characters each (`before` must be line `n` of the file); `before`, `after` (two assets of the same size); `claim` exactly two phrases, each ≤ 8 words |
| `lockup` | Last scene (T3): the name, the install line, the address; the result (a page) beside the seam until it closes | `label`; `name` ≤ 16 characters; `command` ≤ 44; `url` ≤ 44; `line` ≤ 6 words (optional); `result` (page, frame or render id) |

The film opens on a request (or, with `edges: 'cut'`, a file) and ends on the lock-up (or, with `edges: 'cut'`, a
diff). `npm run fit` (and the page, as a red banner) reports every slot that breaks its limit and an asset without
`people: 'none …'`. Rewrite shorter; never shrink type.

## Moves

Six roles, each filled by one hand-off of the runtime (`lib/handoffs/`), through an adapter in `moves.js`:

| Role | Default | Module | What it does here |
|---|---|---|---|
| `open` | `split-open` | `split-open` (`pane`, `caret`, `seam`, `run`) | the caret runs to the seam and stands up into it; the first result slides out of it like a drawer |
| `change` | `louvre` | `louvre` (`pane`, `n` 9, `stagger` 0.07) | the first change of result: nine slats slide out of the seam behind copies of it |
| `push` | `seam-push` | `louvre` (`n` 1, `stagger` 0) | an ordinary change of result: one slat (T1) |
| `wipe` | `wipe-line` | `wipe-line` (`dir` down / left) | a copy of the seam crosses the frame and changes input and result at once |
| `branch` | `split-branch` | `split-branch` (`stage` 0.5) | the seam rises to a band and a branch runs down: two panes become three |
| `slide` | `diff-slider` | `diff-slider` | the seam slides across two renders of one instant: before on one side, after on the other |

`content.moves = { change: 'other-id' }` picks another adapter for a role. The choreography reads only an adapter's
`device` and `beats` (through `moveOf()`), so a swapped move keeps every timing check. **Swapping a transition:**
the module must be registered in `lib/handoffs/index.js`; add an entry to `ADAPTERS[role]` in `moves.js`:

```js
'my-move': { device: 'my-move', beats: 2, params: { /* fixed params */ } },
```

`film.js` passes the pane and the painters (`from.paint`, `to.paint`: `(ctx, dx, dy)` paint the pane's content
shifted), the seam's colours (`colors: { accent, key, stitch }`) and the geometry; at p = 0 and p = 1 the module must
paint exactly what the template paints on either side, or the move pops. All six use the runtime modules unchanged
(no local extension).

## Variants

Colour: three presets in `palettes.js`. `diff` (paper and a deep teal seam) by default: results are content and
keep their own colours, so the seam takes a hue few products use for their own marks. `plum` when the results are
green or teal (the teal seam would sit inside them); `night` for a dark input side. `npm run palettes` decides.

Form: `seam`. The default `straight` renders exactly as before the field existed.

| `seam` | The seam | Reads as |
|---|---|---|
| `straight` (default) | a solid 6 px accent line with a 2 px key on each side | an editor's split view: a boundary you can drag |
| `stitched` | the same line as dashes, 14 px with 6 px gaps on a fixed grid (a moving seam's dashes do not crawl along it); every copy of the seam in every move too | a cut line: the frame is assembled from pieces, closer to an edit than to a tool |

Timing, layout and the moves are the same in both.

## Shortest cut

For a reel or a sting: `edges: 'cut'` lets the film open on a `file` (its first frame is already code over its
result, the seam between) and end on a `diff` (the claim's pause is the settled last half second; no lock-up). `file`
→ `render` → `diff`: 8 bars = 16.0 s at 120 bpm (15.0 s at 128), climax at 75 %; check-film PASS (2026-10-21). A
`request` → … → `lockup` film is the full form.

## Fixed parts

The two sides (paper for the input at 96 px margins; the bench behind results); the seam (6 px accent core, 2 px key
each side) and its grip (a 24 × 64 px accent tab with two key lines, 40 px from the top; 64 × 24 on a horizontal
seam); the chips (JetBrains Mono 25 px on a 40 px bench tab beside the grip); the type scale 25 · 33 · 44 · 59 · 105
(labels, code, the request and command in JetBrains Mono; claims and the name in Archivo 700 semi-expanded); the
caret (4 px accent); the underline pairing a token with its frame (4 px accent); the diff's + bar (6 px accent); the
layout in `choreo.js` `L` (the request and pick seam at x 900, the lock-up's at 1000, the band at y 260, the branch
at x 1320, the slider from 1320 to 620); sub-frame motion blur on every frame whose fastest point moves more than
1 px a frame.

## Example content (shipped)

The skill showing itself, from its own files. Every asset is the skill's own output, so the example ships with no
third-party material: frames of four demo films (the v0.1.0 release renders), two renders of the halftone template
at one instant in two palettes, and the README as its repository page shows it. Every quoted line is a line of the
skill (`assets/templates/pulse/content.js` 16–19, `assets/templates/halftone/content.js` 18), and the report lines
are what `scripts/check-film.mjs` prints for the pulse demo's render. It fits 16 bars = 32.0 s at 120 bpm, `npm run
fit` with no errors:

request `Use filmsmith.`, the Ink demo slides out of the seam, `Ten ways / to film your code.` → pick ink,
blueprint, phosphor from the style list, `Pick a style,` → the pulse template's lines over the words they put on
screen, `fill one file,` → `$ npm run film`, four frames of the pulse demo and its report, `render, / measured.` →
line 18 of the halftone template, cyan to reverse, the slider across the two renders, `One line, / a new palette.`
(climax, 63 %) → `Filmsmith`, the install line, the address, the README.

Tiers: T0 55 onsets (median gap 1 beat, max 2.5), T1 14 compositions (median 1.75 s: a WARN, every state reads),
T2 4 (the louvre, two wipe lines, the branch), T3 3 (hook 1.0 s, climax 20.0 s = 63 %, lock-up 24.0 s). check-film
PASS with two WARN: the median composition, and a 3 s passage from 14.0 s (the end of the report, then the + line
typing) under 20 % visible motion.
