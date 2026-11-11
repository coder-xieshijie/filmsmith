# strip template

One strip of film on a light box carries the film. Its frames are real frames of real films: they move through a
fixed gate a pull-down at a time and stop registered in it, intertitles ride the same strip, and the optical track
beside each frame is drawn from that film's own sound. A frame punches to the full frame and shrinks into its cell on
a contact sheet whose rows are as long as the films; the editor's grease pencil rings one cell, which punches to full
and runs; at the end the strip runs out of the gate and leaves the name. The camera never moves: everything moves
horizontally through one place. The frames are evidence: the film crops, scales and veils them, never edits them.
Mode card: `references/modes/strip.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs strip <film-dir>
cd <film-dir>
# take the frames (tools/extract.mjs), capture a page if the end needs one (tools/capture.mjs), fill PLAN.md, edit content.js
npm run assets        # hashes, row lengths, the zoom cap, the pencil; with the videos at hand every frame decoded again
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time
npm run snapshot -- --at 1.0,4.5,7.0,11.5,14.0,17.5,21.0,26.0
npm run film          # assets → audio (fit, score) → check → render → renders/film.mp4
npm run palettes      # contrast table of every preset, then the pencil against the ringed cell
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film: palette, seed, the films with their manifest, any captured page, the scenes. The only file edited for an ordinary film. No duration, no bars. Optional `perfs` (Variants), `edges` (Shortest cut), `moves` (Moves), `bpm`, `target`, `bed`, `sound`. |
| `assets/real/` | The frames, as extracted (sha256 in content.js), and `tracks.js` (each film's sound beside its gate frame). The shipped set is the skill's own demo films (Example content). |
| `palettes.js` | Presets `lightbox` (default), `lightbox-blue`, `flatbed`. `npm run palettes` prints every contrast pair and checks the pencil against the ringed cell (ΔE00 ≥ 20). |
| `choreo.js` | The choreography of every scene type in beats from the scene's start, and the reels they run on: one pure module shared by `timing.rules.js` (need, events), `film.js` (the picture) and `score.mjs` (the sound). |
| `moves.js` | The three moves, pluggable: one adapter per role (advance, punch, pick) over a shared hand-off module (Moves). |
| `timing.rules.js` | Slot limits and `validate(content)`; how long each scene type needs (timing API 3, format `lib/timing.js`), read from `choreo.js`. |
| `film.js` | Renderer: the light box, the reel in the gate, the punch, the contact sheet, the pencil, the run, the lock-up. `render(ctx, t)` is a pure function of `t`. |
| `score.mjs` | The `thread` bed, a claw click on every pull-down and one effect per picture event, placed from `choreo.js`; writes `assets/audio/mix.wav`, `measure.json` and `track.js` (Order). |
| `tools/extract.mjs` | Take a film's frames from its video: the gate frame, the contact row, the run; prints the manifest entry. |
| `tools/capture.mjs` | Capture a page or a text for the end (`page`, `text`, `file`); prints the manifest entry. |
| `tools/check-assets.mjs` | `npm run assets` (below); writes `renders/check-assets.txt`. |
| `tools/ocr.swift`, `tools/regions.mjs` | macOS Vision text and face reading of a capture; the ΔE00 accent rule (ffmpeg decodes the ringed cell). |
| `index.html` | The canvas, the static `__timelines` stub and the pre-registered build hold; `data-duration` is stamped by `npm run fit`. |

## Films

Each entry of `content.films` is one film the strip shows, with the manifest of its frames in `assets/real/`.
`tools/extract.mjs` writes the files and prints the entry:

```bash
node tools/extract.mjs <id> <video> --name <Name> --frame <s> [--full] [--run <from>:<to>] [--source "<line>"]
```

| Field | What |
|---|---|
| `name` | the film's name under the gate and beside its row; ≤ 12 characters |
| `video` | the video's file name; `npm run assets` decodes every frame again when it is beside content.js, in `assets/video/` or in `--videos <dir>` (videos never ship with a template) |
| `duration` | seconds, as ffprobe measures the video; ≤ 50 (the sheet draws 24.8 px a second); the sheet prints it rounded |
| `source` | where the film is from (a release, a file); for PLAN.md and the check |
| `frame` | `{ file, at, sha256 }`: the frame that stands in the gate, a settled frame at `at` seconds. 1280 px wide; 1920 with `--full` for the film a `punch` scene punches to the full frame |
| `row` | `{ file, times, sha256 }`: the contact row, one 192 × 108 frame at the middle of every 4 s block (the last block partial, at its own middle), side by side |
| `run` | optional, for the film the pencil picks: `{ dir, ext, from, fps, frames, sha256 }`, every frame from `from` at 30 fps, 1920 wide. Start it on one of the row's times: the pencil rings that cell |

A `punch` shrinks the gate frame into its own cell, so the punched film's `frame.at` is one of its `row.times`.
`content.captures` holds a captured page for the lock-up's source frame, with the fields of every real-asset template
(`file`, `crop`, `source`, `captured`, `how`, `sha256`, `claim`, `expect`, `forbid`, `people: 'none'`).

`npm run assets` checks, for every film: each file and its hash (the run: its frames in name order); one row cell per
4 s block of `duration`, at the block middles, the row 192 px a cell by 108; the zoom cap, 4/3 output px per source px
(the gate frame at 832 wide, the punched frame and the run at 1920, the sheet's cells at 96); and, when the video is
at hand, its measured length and every stored frame decoded again at its instant (PSNR ≥ 35 dB for frames, ≥ 30 dB
for 96 × 54 cells). Without the video those are INFO, and the hashes stand for the extraction. For a capture, the
hash and, with macOS Vision, every `expect` and `forbid` string and no face. Then the accent rule for the content's
palette. Keep each image ≤ 200 KB in a template's shipped example; a film's own frames have no size limit.

## Order

The intertitles' optical tracks are this film's own mix in the second around each one's landing, so the picture
depends on the sound: `score.mjs` writes `assets/audio/track.js` after the master, and `film.js` reads it. Every
script that shows the picture runs the score first: `snapshot` and `render` are `npm run audio && …`, and `film` is
`assets → audio → check → render`, so a clean checkout renders with one command (`npm run film`). Without
`track.js`, or with one written for other lines (each cell carries its line), the intertitles' tracks are left blank
and nothing else changes.

## Time

Length follows content. `npm run fit` runs `lib/timing.js` `fit(content, rules)` (timing API 3) with
`timing.rules.js`: each scene gets the whole beats its choreography and its copy need. No scene is a turn; the total
is rounded up to a 2-bar phrase and the rounding goes to the lock-up, a rest, whose last move (the pencil under the
address) lands four beats before the end. Tempo 120 bpm (one bar 2.0 s), range 112–128; `bpm` fixes it, `target:
<seconds>` moves it inside the range.

Every landing in the gate is a pull-down of a quarter beat that ends on the quarter-beat grid (a film's frame on a
beat); when a landing opens a scene, its
pull-down is the last quarter beat of the scene before, so every scene's first landing is its first beat. An
intertitle is read before the strip moves it on (its slot is its reading plus a pull-down, at least a beat); a film's
name sits under the gate while its frame is registered. Every still stretch after a landing is a declared hold
(≥ 0.2 s, ≤ 2 beats).

### Length table

Beats from the scene's start at the tempo.

| Type | Motion | Primary text | Need |
|---|---|---|---|
| `titles` | first scene: the strip runs in and brakes onto the first intertitle, 2 beats (`strip-advance`, brake); then a pull-down a line. A line with `track: true` lights the optical track 0.4–1.15 beats after its landing | each line as it lands | run-in + Σ max(1, read + 0.25) on a quarter-beat grid |
| `frames` | a pull-down a beat, one film's gate frame each | each film's `name` under the gate | one beat a film |
| `punch` | the frame in the gate punches to the full frame, 1 beat (`gate-punch`, in); holds 1; shrinks into its cell on the sheet, 1 (`gate-punch`, out) | — | 3 |
| `sheet` | the sheet around the landed cell, its rows cut at the shortest film; the longer strips pull out to their lengths from beat 2 (0.75 beat, 0.1 between rows); the measured lengths print row by row | first caption on beat 1; the second on the first whole beat after the first is read and the strips have pulled out | the readings, and the lengths + 0.25 |
| `pick` | caption and the pencil loop, 1 beat; the other rows step back, 0.5; the ringed cell punches to full on beat 2, 1 beat (`sheet-pick`, the climax); the picked film runs `(frames − 1) / fps`; into the gate, 1 (`gate-punch`, out) | `caption` on 0 | run + 4, whole beats |
| `lockup` | the source frame registers on beat 1 after a pick (on 0 otherwise); the strip runs out of the gate, 1.5 beats (`strip-advance`, run-out); the name settles 2 beats after; the address types at 72 characters a second a beat later; the pencil underlines it 4 beats before the end | `line` with the source frame; `name`; `url` as it types | address + 3 s; takes the phrase rounding |

At 120 bpm: three one-to-three-word intertitles after the run-in 3.5 s; ten films 5 s; a punch 1.5 s; a sheet with
two five-word captions 3.5 s; a pick with a 2 s run 4 s; the lock-up with a five-word line and a 36-character
address 6 s, 8 s with the rounding.

**Tiers** (`choreo.js`, principle 5): T0 — every landing, the track lighting, the strips pulling out, the lengths,
the step back, each second of the run; T1 — every intertitle group, the frames, the full frame, the sheet, the lengths,
the picked film, the name; T2 — the run-in, the punch, the pick and the run-out (4: `strip-advance` twice, never in a
row); T3 — the hook (the first scene's last intertitle, `hook: true`), the pick (climax: 60–85 % of the length), the
name. `npm run fit` refuses a film that breaks them.

## Global slots

| Slot | Limit | Notes |
|---|---|---|
| `palette` | id | `lightbox` (default), `lightbox-blue`, `flatbed`; never a hex value. Pick by `npm run palettes`: only a preset marked `ok` for the ringed cell |
| `perfs` | id | `double` (default), `single` (Variants) |
| `edges` | id | `run` (default: the strip runs in), `cut` (Shortest cut) |
| `moves` | `{ role: id }` | Moves, below; omit for the defaults |
| `seed` | int | the pencil's hand, the sound's variations |
| `meta` | `{ title, url }` | the film's title and address (PLAN.md, the render's metadata) |
| `films`, `captures` | object | Films, above |
| `bed`, `sound` | — | `sound: { bed: 'thread', seed, fx }` picks another bed preset or seed, `fx` the effects' level (dB, default −4); `bed` as in every template (CONTRACT.md, Sound) |

## Scene registry

| Type | Purpose | Slots (limit) |
|---|---|---|
| `titles` | Intertitles on the strip; first scene: the run-in and the hook | `lines` 1–5, each a string or `{ text, track: true }`, ≤ 3 words and ≤ 18 characters; one line a film lights the track; `hook: true` (T3) on the first scene |
| `frames` | One frame of each film through the gate, its name under it | `films`: ids in order, 1–12 (default: every film in `films`) |
| `punch` | The last frame of the frames scene to the full frame and into its cell on the sheet | — (its film's `frame.at` is one of its `row.times`) |
| `sheet` | The contact sheet: every film as a strip as long as the film, then the measured lengths | `lines` 1–2 captions, ≤ 5 words each; at most 10 films |
| `pick` | The pencil rings one cell; it punches to full and the film runs from it (T3 reveal, the climax) | `film` (id; a `run` makes it run, else it holds its frame), `cell` (index in its row; the run starts at that cell's time), `caption` ≤ 3 words |
| `lockup` | Last scene (T3): a source frame in the gate, the run-out, the name and the address | `source` (optional: a capture id or a film id); `line` ≤ 5 words; `name` ≤ 16 characters; `url` ≤ 40 characters |

The order is a grammar: `titles` first (the strip runs in), `lockup` last; `titles` and `frames` in any order between;
`punch` right after a `frames` scene and right before the `sheet`; `pick` right after the `sheet` and right before the
`lockup`. `npm run fit` (and the page, as a red banner) reports every slot that breaks its limit or the order, a
punched frame that is not a row cell, a run that does not start at the ringed cell, and a capture without
`people: 'none'`. Rewrite shorter; never shrink type.

## Moves

Three roles, each filled by one hand-off of the shared library (`lib/handoffs/`), through an adapter in `moves.js`:

| Role | Default | What it does here |
|---|---|---|
| `advance` | `strip-advance` (film material) | every move of a reel through the gate: the claw pull-down, the opening brake, the closing run-out |
| `punch` | `gate-punch` | a frame in the gate to the full frame and back into a scene (the sheet, the gate) |
| `pick` | `sheet-pick` | the ringed cell on the sheet to the full frame |

`content.moves = { punch: 'other-id' }` picks another adapter for a role. The choreography reads only an adapter's
`device` and `beats` (through `moveOf()`), so a swapped move keeps every timing check. **Swapping a transition:** add
the module to `lib/handoffs/`, import it in `film.js` beside the others, and add an adapter to `ADAPTERS[role]`:

```js
'my-punch': {
  device: 'my-punch', beats: 1,                       // T2 device name and length in beats
  create(env, use) {                                  // env: { modules, PAL, F }; use: rect, direction, ease, image, crop, small, under
    const M = env.modules['my-punch'];
    const P = { ...M.defaults, ...use, ground: false, colors: env.PAL };
    return { paint: (ctx, p) => M.paint(ctx, M.at(p, P), P), track: (p) => M.track(M.at(p, P), P) };
  },
},
```

`use.under(ctx)` paints the scene on the other side (the gate at the punch's start, the sheet at the shrink's end), so
at p = 0 and p = 1 the move draws exactly what the template draws on either side. The film draws its own light box,
gate corners, captions and lock-up over the module (`ground: false`); no local extension of a module.

## Variants

Colour: three presets in `palettes.js`. A light box by default, because most frames are bright interfaces and a
light box shows them as transparencies in a black base; `flatbed` (a dark editing bench) for frames that are mostly
dark. The pencil is carmine unless the ringed cell is red, pink or magenta (then blue); `npm run palettes` decides.

Form: `perfs`, the film stock. The default `double` renders exactly as before the field existed.

| `perfs` | The strip | Reads as |
|---|---|---|
| `double` (default) | sprocket holes along both edges, a narrow variable-area track under each frame | 35 mm: the cinema's reel |
| `single` | one row of holes along the top; the bottom edge is a wide optical track (74 px in the gate), lit like the narrow one; on the sheet the bottom edge is plain base | 16 mm sound film: one row of perforations, the sound along the other edge; for films whose sound is part of the claim |

Timing, layout, the sheet and the moves are the same in both.

## Shortest cut

For a reel or a sting: `edges: 'cut'` and `titles` → `frames` → `lockup` (three intertitles, three films, the name
and the address): 6 bars = 12.0 s at 120 bpm. The first frame is already the mode's world (an intertitle registered
in the gate, no run-in), and the address holds 3 s after it has typed, so the last half second is settled. Without a
pick the lock-up's run-out is the only T2 and the name the only peak after the hook; `npm run fit` warns that no peak
is the climax, which a sting may accept.

## Fixed parts

The light box (ground with a brighter centre, static); the strip (a black base 660 px high, frames 832 × 468 at an
860 px pitch, ten sprocket holes a frame along each edge, the track 16 px under each frame); the gate at the frame's
centre (960, 486) with four 26 px corner marks; the veil over frames outside the gate (black, up to 55 % with their
distance); intertitles in Hanken Grotesk 700 79 px on the title colour; names, captions and the line in Hanken
Grotesk 600 59 px on y 950 (984 under the sheet); the sheet (ten rows 84 px apart from y 56, cells 96 × 54, names in Hanken Grotesk 600
33 px right-aligned at x 398, lengths in DM Mono 500 33 px after each row; fewer rows sit centred); the pencil (a
6 px stroke, the loop drawn in 1 beat with the seed's hand, the underline 0.75 beat); the name in Hanken Grotesk 700
140 px on y 560, settling from 104 %; the address in DM Mono 500 44 px on y 650; sub-frame motion blur on every frame
whose fastest point moves more than 1 px a frame, with the labels drawn sharp after it.

## Example content (shipped)

Filmsmith as a strip of its own ten demo films (the v0.1.0 release renders). Every frame is the skill's own output,
taken by `tools/extract.mjs`; the page at the end is the repository's README, captured signed out by
`tools/capture.mjs`. The `morph` run (61 frames, 2 s) is the only sequence; the videos do not ship, so `npm run
assets` reports the re-decode as INFO in a fresh film. It fits 14 bars = 28.0 s at 120 bpm, `npm run fit` with no
errors:

the strip runs in and brakes on `Ten ways` / `to film` / `your code.` (hook) → `Drawn in code.` / `Scored in code.`,
the optical track lights → the ten films, a pull-down a beat, each named → Pulse punches to the full frame and
shrinks into its cell → the sheet: `Length follows the content.`, the longer strips pull out, `Every render is
measured.`, the lengths → `Pick a style.`, the pencil rings Morph's fourth cell, it punches to full and runs 2 s
(climax, 63 %) → into the gate, the README registers, `Runs in any coding agent.`, the run-out → `Filmsmith`, the
address, the underline.

Tiers: T0 median gap 1 beat (max 2.75), T1 11 compositions (median 2.5 s), T2 4 (the run-in, the punch, the pick, the
run-out), T3 3 (hook 2.75 s, the pick 17.5 s = 63 %, climax; the name 23 s).
