# scroll template

One long vertical sheet from the first frame to the last: a product's own long page (a repository page and its
README, a docs page, a changelog) captured at one scale and joined top to bottom with code-set quote bands; a fixed
viewport looks at it, and everything that changes is the sheet's offset. The sheet is flicked and brakes onto the next
section with momentum; the page's own headings pin at the top as the chapters; one accent underline marks the line
being read and the band beside it repeats it in large type; one row of the page unfolds in place on what it
describes; at the end the sheet flies back to its top and its paper roll winds it up under the name. The captures are
evidence: the film crops, scales and veils them, never edits them. Mode card: `references/modes/scroll.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs scroll <film-dir>
cd <film-dir>
# capture the page (tools/capture.mjs), cut it into strips, fill PLAN.md, edit content.js
npm run assets        # hashes, what each strip shows, one scale under the cap, no people, quotes on the page, the accent
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time
npm run snapshot -- --at 3.4,7.6,13.5,16.5,21,26.5,33.5
npm run film          # assets → fit → audio → check → render → renders/film.mp4
npm run palettes      # contrast table of every preset, then the accent against every marked region
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film: palette, form variant, seed, the assets with their manifest, the sheet, the headings, the scenes. The only file edited for an ordinary film. No duration, no bars. Optional `moves` (Moves), `bpm`, `target`, `bed`, `sound`. |
| `assets/real/` | The captured strips (webp) and the frames of a film (`<id>/f001.webp …`), kept as captured (sha256 in content.js). The shipped ones are this skill's own README page and Ink demo (Example content). |
| `palettes.js` | Presets `slate` (default), `slate-violet`, `linen`. `npm run palettes` prints every contrast pair and checks the content's accent against every marked region (ΔE00 ≥ 20). |
| `sheet.js` | The sheet: the strips, bands, cuts and unfold panels laid top to bottom in film px; the headings that pin; every scene's offsets. Pure, so Node tools read it too. |
| `choreo.js` | The choreography of every scene type in beats and seconds from the scene's start: one pure function shared by `timing.rules.js` (need, events), `film.js` (the picture) and `score.mjs` (the sound). |
| `moves.js` | The five moves, pluggable: one adapter per role (detent, reel, fling, unfold, roll) over a shared hand-off module (Moves). |
| `timing.rules.js` | Slot limits and `validate(content)`; how long each scene type needs (timing API 3, format `lib/timing.js`), read from `choreo.js`. |
| `film.js` | Renderer: the sheet, the bands, the underline, the pinned tabs and their slot, the ratchet, the unfold panel, the minimap, the roll, the speed veil. `render(ctx, t)` is a pure function of `t`. |
| `score.mjs` | The `thread` bed and one synthesised effect per picture event, placed from `choreo.js`; writes `assets/audio/mix.wav` and `assets/audio/measure.json`. |
| `tools/capture.mjs` | Capture a page in headless Chrome at a device pixel ratio (full page, or a fixed span `--x --width --top --bottom`), printing the manifest entry and, with `--phrases`, the boxes of the lines that hold given phrases. |
| `tools/frames.mjs` | Extract a span of a film as numbered webp frames at a stated fps and width; prints the manifest entry (count, size, joined sha256). |
| `tools/check-assets.mjs` | `npm run assets` (below); writes `renders/check-assets.txt`. |
| `tools/ocr.swift`, `tools/regions.mjs` | macOS Vision text and face reading; the ΔE00 accent rule (ffmpeg decodes each marked region). |
| `index.html` | The canvas, the static `__timelines` stub and the pre-registered build hold; `data-duration` is stamped by `npm run fit`. |

## Assets

**Strips.** The sheet is one page cut into horizontal strips that share one x range and one width, in source order;
each strip is one file in `assets/real/`, and the sheet draws them all at one scale (1496 film px over the strips'
width). Capture the page full height at device pixel ratio 2, logged out, then cut each strip with one crop width and
one scale, so the page's edges run continuous. Leave out what the film does not show (a file list, a footer) with a
`{ cut: true }` between the strips: the ground shows through as a 32 px splice, never hidden. Keep each file ≤ 200 KB
in a template's shipped example (webp); a film's own assets have no size limit.

**Frames.** An unfold opens on a folder of frames: a span of a real film, extracted with `tools/frames.mjs` at a stated
fps (12 by default) and width, played 1:1 from half a beat into the unfold. When they run out before the scene ends,
the last frame stays and the page creeps (Time).

Each entry of `content.assets` is the manifest of one strip or one folder of frames:

| Field | What |
|---|---|
| `file` | a strip: the file in `assets/real/` |
| `frames`, `count`, `fps`, `from` | a folder of frames: the folder under `assets/real/`, how many, their rate, where they start in the source film |
| `size` | `[w, h]` in px (every strip shares one width; the frames' size is the first frame's) |
| `source`, `captured`, `how` | where it is from, the date, the command that made it |
| `sha256` | the file's hash (for frames: of the frames joined in order); `npm run assets` fails when it changed |
| `claim` | what the film says this asset proves, in one sentence |
| `expect`, `forbid` | strings the strip must show / must not show (names the film must not carry, an old version number) |
| `people` | `'none'`: crop people out; faces are detected and fail the check |
| `reviewed` | frames only, optional: `{ 'f025.webp': 'what a person saw there' }` for a frame the face detector misreads; always re-read, reported as a WARN with the reason |

Boxes in `heads`, `mark.rects`, `rows` and `row` are `[x, y, w, h]` in the file's own pixels. Measure them on the file
(`tools/capture.mjs --phrases` prints the line boxes of the phrases it is given), not by eye.

`npm run assets` checks, for every asset: the file, its size and its hash; with macOS Vision, every `expect` and no
`forbid` string, and no face (frames: every fourth frame and every reviewed one); one width for every strip, and the
sheet's scale and the panel's under the zoom cap (4/3 output px per source px); every word a band quotes printed in
its underlined lines; and the accent rule for the content's palette. Off macOS the reads are INFO and the rest still
runs. `npm run film` runs it first and stops on a FAIL.

## Time

Length follows content. `npm run fit` runs `lib/timing.js` `fit(content, rules)` (timing API 3) with
`timing.rules.js`: each scene gets the whole beats its choreography and its copy need, plus at most one beat of the
2-bar phrase rounding; the lock-up, a rest, takes the rest of it, and its roll-up lands on the last downbeat. No scene
is a turn (a pad would be a still frame). Tempo 120 bpm (one bar 2.0 s), range 112–128; `bpm` fixes it,
`target: <seconds>` moves it inside the range.

Quotes enter phrase by phrase (≤ 3 words at once), each phrase once the one before has been read (0.3 s a word, at
least a beat). Once the last phrase has landed, the page creeps up 10 px a second until the scene ends, as a reader's
page does, so the reading time is never a still frame; the same creep runs at the end of the opening and in an unfold
once its frames have run out. The creep is slow enough to read through and never triggers the speed veil.

### Length table

Beats from the scene's start at the tempo, unless marked s.

| Type | Motion | Primary text (enters from) | Glance | Need |
|---|---|---|---|---|
| `open` | the roll drops off the sheet's top edge, 2 beats (`roll`); the underline draws on beat 2; the minimap prints 0.75 beat after the last phrase, over 1 beat | the hook, phrase by phrase, from 3 | — | read + 0.3 s |
| `quote` | a detent (1 beat), a reel (2 beats, T2) or none; the underline draws as the move lands (none: on 0.25) | phrases from half a beat after the landing | — | read + 0.3 s |
| `ratchet` | a reel onto the chapter's heading, 2 beats (T2); then one row docks a beat (an expo-out half-beat step), the rows to come veiled, the docked one marked in the margin; the tab's slot rolls each name | each row's name as it docks (word tier) | — | last dock + 0.75 beat |
| `unfold` | a detent to the row, 1 beat; the row opens, 2 beats (`unfold`, T2); the frames play from half a beat into it | the claim 2 beats after the panel is open | the label, as the frames start | claim read + 1 beat |
| `lockup` | a fling to the top, 2 beats (`scroll-fling`, T2; none straight after `open`); the hook's lines exit; the name on 0.5 beat after the landing; the underline under the page's title on 1; the address types at 25 characters a second from 1.5; the roll comes up over 1.5 beats and lands 4 beats before the end | `name`, `url` | — | url typed + max(6 beats, 3 s); takes the phrase rounding |

At 128 bpm (the example): an `open` with a two-line hook 2 bars; a `quote` with a detent and four phrases 2.5 bars,
without a move and three phrases 1.75; a `ratchet` of ten rows 3.5 bars; an `unfold` with a five-word claim 2.75
bars; a `quote` with a reel and four phrases 2.25 bars; the lock-up with a 36-character address 3.25 bars.

**Tiers** (`choreo.js`, principle 5): T0 — every phrase as it enters, every underline, every docked row, the frames
playing, the minimap printing, each creep's start, the name, the address; T1 — a detent's landing, a quote without a
move, the chapter locking, the middle of a ratchet, the open panel, the top again, the roll-up's landing; T2 — the
unroll, every reel, the unfold and the fling; T3 — the hook (the opening's first phrase), the claim in the unfolded
panel (the climax), the lock-up. `npm run fit` refuses a film that breaks them: the unfold belongs at 60–85 % of the
length, so put the scenes that come before it first.

## Global slots

| Slot | Limit | Notes |
|---|---|---|
| `palette` | id | `slate` (default), `slate-violet`, `linen`; never a hex value. Pick by `npm run palettes`: only a preset marked `ok` for the content's marked regions |
| `minimap` | `'on'` \| `'off'` | Variants |
| `moves` | `{ role: id }` | Moves, below; omit for the defaults |
| `seed` | int | the ground's grain, the sound's variations |
| `meta` | `{ title, url }` | the film's title and address (PLAN.md, the render's metadata) |
| `assets` | object | Assets, above |
| `sheet` | array | top to bottom: strip ids, `{ band: id, size: 'hook' \| 'quote' }` (a quote band, default size `quote`), `{ cut: true }`; every strip once, all one width |
| `heads` | array | the page's headings that pin as chapters: `{ asset, box }` (the heading's own pixels, pinned as they are) |
| `bed`, `sound` | — | `sound: { bed: 'thread', seed }` picks another bed preset or seed; `bed` as in every template (CONTRACT.md, Sound) |

## Scene registry

| Type | Purpose | Slots (limit) |
|---|---|---|
| `open` | First scene only (T3 hook): the roll drops and the sheet hangs from its top; one line of the page is underlined and its band repeats it | `band` (the hook band's id); `mark { asset, rects }` (the line boxes to underline); `lines` 1–2 arrays of phrases (≤ 3 words each; a hook line ≤ 22 characters); `unroll` (default `true`; `false` opens on the hanging sheet, and then a reel or unfold must come within 8–12 s) |
| `quote` | The underline moves to the next line (a detent, a reel, or no move); its band's lines roll out and the next roll in | `move` `'detent'` \| `'reel'` \| `'none'` (default none); `at { asset, y, screen? }` where a move goes (the file y lands just under the pinned tab, or at screen y `screen`); `band`; `mark { asset, rects }`; `lines` 1–2 arrays of phrases (≤ 3 words each; a quote line ≤ 34 characters); every quoted word must be printed in the underlined lines |
| `ratchet` | A reel onto a heading, which locks as the chapter; its rows dock one a beat and the tab's slot names each | `head` (index in `heads`); `rows` 3–12 of `{ asset, box, name }` (`box` the row; `name` one word ≤ 14 characters, as the row prints it) |
| `unfold` | One row opens in place on what it describes (T2, the climax): the page below slides down, the frames play, the claim enters | `row { asset, box }`; `frames` (a frames asset id); `caption` the claim ≤ 8 words, ≤ 40 characters; `label` ≤ 6 words (glance: where the frames are from) |
| `lockup` | Last scene: the sheet flies back to its top; the hook band takes the name and the address; the roll winds the sheet up under it | `band` (the opening's band); `name` ≤ 14 characters; `url` ≤ 40 characters; `mark { asset, rects }` (the page's title, underlined) |

The first scene is `open`, the last `lockup`; at most two unfolds, never two in a row. `npm run fit` (and the page, as a
red banner) reports every slot that breaks its limit, a box outside its strip, a line wider than its band, strips of
two widths, and an asset without `people: 'none'`. Rewrite shorter; never shrink type.

## Moves

Five roles, each filled by one transition from the shared library (`lib/handoffs/`), through an adapter in
`moves.js`:

| Role | Default | What it does here |
|---|---|---|
| `detent` | `scroll-reel`, `momentum` k 5.5, 1 beat (T1) | a short flick to the next paragraph |
| `reel` | `scroll-reel`, `momentum` k 6.5, 2 beats (T2) | a long flick through what is not read, braking onto a section; a ratchet's reel locks its heading |
| `fling` | `scroll-fling`, `fling` k 12, 2 beats (T2) | back to the top before the lock-up: accelerate, streak (veiled), brake; the tabs unpin in reverse |
| `unfold` | `unfold`, its cubic in-out, 2 beats (T2) | a row opens in place |
| `roll` | `roll`, `momentum` k 4.2 down and k 5 up | the paper roll: the opening's unroll (T2), the closing's roll-up |

The other adapters shipped: `scroll-reel-flick` for `detent` and `reel` (`stage.js` `flick`: a quick ramp, then an
exponential brake). `content.moves = { reel: 'scroll-reel-flick' }` picks one. The choreography reads only an
adapter's `device`, `beats` and `tier` (through `moveOf()`), so a swapped move keeps every timing check. **Swapping a
transition:** add the module to `lib/handoffs/` (or keep it in the film), then an adapter to `ADAPTERS[role]`:

```js
'my-reel': { device: 'my-reel', beats: 2, tier: 'T2', curve: (p) => myCurve(p) },   // curve: 0 → 1, exact at both ends
```

The curve must be exactly 0 at p = 0 and 1 at p = 1, and land slowly (the last frame of a reel moves ≤ 2 px), or the
landing check refuses it.

**Local extension** (CONTRACT.md, Transitions): the sheet is the template's own painter, and the modules' own page
painters (`scroll-reel`'s `paintPage` and `page`, `unfold`'s `paint`) are not used, because the sheet mixes strips at
one scale, code-set quote bands, splices and an unfolding panel in one column, which their parameters cannot express.
What the template takes from the modules unchanged: the curves (`momentum`, `fling`, `flick`, `unfold.at`), the
sticky-heading rule (`section-lock` `tabsAt`) and the roll (`roll` `drawRoll`).

## Variants

Colour: three presets in `palettes.js`. A dark ground by default, because most long pages are light and a light sheet
on a near-black ground reads as one paper; `linen` turns it round for dark-mode pages. The accent is pencil ochre by
default: it clears blue links and blue, red and green thumbnails, which is what a README's marked lines usually hold;
`slate-violet` for pages whose marked lines carry yellow or ochre and no strong blue. `npm run palettes` decides.

Form: `minimap`. The default `'on'` renders exactly as the template did when the field was added.

| `minimap` | What changes | Reads as |
|---|---|---|
| `'on'` (default) | the whole sheet in miniature in the right gutter (x 1664, 160 px wide, from y 120), the frame's place on it bracketed in the accent, the rest veiled; the sheet column at x 120 | a scrollbar that shows the page: where the film is in it |
| `'off'` | no minimap; the sheet column centres (x 212) | the page alone, with the pinned tab as the only persistent frame: for a page whose miniature is a uniform grey (all text) |

Timing, the moves and the copy are the same in both.

## Shortest cut

For a reel or a sting: `open` → `lockup` with the name and the address: 6 bars = 12.0 s at 120 bpm. The lock-up does
not fling (the sheet is already at its top): the hook's lines give way to the name. The first frame is the paper roll
on the ground already unrolling the page, and the roll-up lands on the last downbeat with a settled last bar.

## Fixed parts

The viewport (the sheet column 1496 px wide, from y 54 to the frame's foot; the sheet's top edge hangs at y 70); the
bands (hook 320 px tall, Schibsted Grotesk 700 at 96 px, baselines 132 and 244; quote 250 px, 600 at 69 px, baselines
104 and 190; text inset 96 px; the warm stock spans the sheet's width); the name at 134 px and the address in DM Mono
500 at 35 px on the hook band; the underline (4 px, round caps, 5 px under its line box, drawn in half a beat, off in a
quarter); the pinned tab (the heading's own pixels, grown 6 px up and 8 down, a 2 px hairline under it; the slot in
Schibsted Grotesk 600 at 49 px after a muted dot); the ratchet (rows to come veiled 34 % toward the ground, a 6 px
margin mark beside the docked row); the unfold panel (an 88 px caption strip, the claim at 49 px and the label in DM
Mono at 25 px, the frames 1216 px wide centred, 20 px under them); a cut (32 px of ground); the paper roll (30 px
radius, the only shaded object); the speed veil (ground at 0.55 × clamp((v − 40) / 220)^1.5 over the sheet); sub-frame
motion blur, its shutter lengthening above 60 px a frame; a faint grain on the ground only.

## Example content (shipped)

Filmsmith filming its own README. Every asset is this skill's own: seven strips of the repository page as it stood on
2026-10-21 (03:16 UTC), captured at device pixel ratio 2 and scaled to the sheet (1870 → 1496 px, 0.8), with the file
list and the parts that name third-party products left out; and 41 frames (12 fps, 11.9–15.3 s) of the Ink demo the
README's table links to. The README has changed since (it lists more styles). It fits 18 bars = 33.75 s at 128 bpm,
`npm run fit` with no warnings:

the roll drops; `Ten ways to / film your code.` → a detent to the intro, the title pinning as the first chapter:
`Every frame, drawn in code. / Every sound, synthesised in code.` → the underline moves on: `Any coding agent / that
can use a shell.` → a reel to "Ten styles", which locks; ten rows dock one a beat, the tab's slot naming each → back to
the Ink row, which opens on its own demo: `Made with the skill itself.` (climax, 61 %) → a reel down to "How a film is
made": `Measured: / loudness, flashes, beat sync.` → a fling to the top; `Filmsmith` / the repository address; the
roll winds the sheet up under it.

Tiers: T0 median gap 1 beat (max 3), T1 15 compositions (median 2.3 s), T2 5 (the unroll, two reels, the unfold, the
fling), T3 3 (hook 1.4 s, the claim 20.6 s = 61 %, climax; lock-up). `check-film`: 0 FAIL (one WARN: the fastest
frame of the first reel reads as a cut, off the beat).
