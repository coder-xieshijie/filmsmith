# handset template

One code-drawn device (a laptop, or a phone) stays head-on and locked off on the left of the frame from the first frame to the last. Everything that changes, changes on its screen, and the screen shows only real captures of the product's own surfaces: its pages, its UI states, its docs. The screen's viewport pushes in under the zoom cap, the light moves from row to row, the page scrolls, the device flips to another surface. The words live in the margin to the right, level with the region in play; the chin names where the screen's state comes from. Mode card: `references/modes/handset.md`.

```bash
node scripts/new-film.mjs handset <film-dir> [--palette <id>]
cd <film-dir>
# write PLAN.md first (new-film made the skeleton; fit refuses to run without it)
# capture the product's surfaces (tools/capture.mjs, below), list them in content.js `assets`, then write the scenes
npm run fit           # the timing table, renders/timing.json, the duration stamped into index.html
npm run snapshot -- --at 2.5,7,9.2,12.5,17,21,24.6,29.5     # key frames (times for the shipped example)
npm run assets        # the real-asset gate: hashes, sizes, people, private regions, zoom cap, numbers, OCR, the accent
npm run film          # assets → fit → audio → check → render
npm run palettes      # contrast of every preset, then each accent against every ringed region (ΔE00 ≥ 20)
```

## What content.js controls

```js
export default {
  palette: 'graphite',   // id from palettes.js; chosen by the accent rule (Palettes)
  device: 'laptop',      // form variant: 'laptop' (default) or 'phone'; see "Form variant"
  edges: 'full',         // 'full' (default): the lid draws on and the screen lights; 'cut': the first frame is the lit device (Short cut)
  seed: 3,               // grain
  // bpm: 120,           // optional, 112–128
  // moves: { flip: 'device-flip' },   // optional: another adapter for a move role (Moves)
  meta: { title, url },
  assets: { ... },       // the real captures and their manifest (below)
  scenes: [ ... ],       // the chain (registry below); no bars, no duration
};
```

### assets: the manifest

Every capture the screen shows, kept as captured. `npm run assets` checks each field; the film refuses to start (red banner) when `validate()` fails.

| Field | What it is | Checked |
|---|---|---|
| `file` | `assets/real/<name>.webp` (or `.png`, `.jpg`) | exists; at most 200 KB in a template (a film may pass `--max-kb`) |
| `size` | `[w, h]` in px | equals the file (ffprobe) |
| `sha256` | the file's hash at capture | equals the file: the capture is not edited |
| `source`, `captured`, `how`, `licence` | the page or origin, the date, the exact capture command, whose the content is | `source` required; the others are provenance for the README |
| `people` | what was checked for faces, avatars, account names (`'none: README text only'`) | required: a string that says what was checked |
| `chin` | the source line on the device's chin while this capture is on screen (host and path, ≤ 40 characters) | |
| `public` | `[x, y, w, h]`: the only part of the image the film may ever draw (default: all of it) | inside the image; every view stays inside it |
| `private` | `[[x, y, w, h], ...]`: parts that must never be on screen (a sidebar with account names) | outside `public`; no view overlaps them |
| `regions` | `{ name: { box: [x, y, w, h], band: [y, h], reads } }`: what the film points at. `box`: the ring (in the file's px; measure it with `tools/capture.mjs --probe` or `tools/ocr.swift`); `band`: the full-width row the light uses when it hops (band rows, the claim); `reads`: what the region shows, transcribed | inside `public`; macOS Vision reads `reads` back inside `box` (WARN where OCR is unavailable); every digit in a scene's copy appears in its region's `reads` |

Capture with `tools/capture.mjs` (headless Chrome, no browser chrome, 2× or 3× device pixels so pushes have headroom under the cap):

```bash
node tools/capture.mjs <url> assets/real/<name>.webp --selector article.markdown-body --height 820 --scale 1.5 --quality 72
node tools/capture.mjs <url> assets/real/<name>.webp --selector main --from 'Heading text' --to 'Later heading' --scale 1.3
node tools/capture.mjs <url> assets/real/<name>.webp --selector main --probe 'h2, code'   # also prints these elements' boxes in the file's px
```

It prints one JSON line with the file's sha256, bytes and size (and `--probe` boxes) for the manifest; `swift tools/ocr.swift <file> x y w h` lists the text Vision finds in a box, with boxes, to measure a region round a phrase. Clip by selector or by heading (`--from`, `--to`), never by covering: a region with a person or an account name is left out of the capture, or out of `public`. A state that was not captured is never drawn (mode principle 2).

## Scene registry

Each scene shows one capture (`asset`) and points at one region. The first scene is `wake`, the last is `lockup`; `push`, `band`, `claim` and `scroll` stay on the capture already on screen (change capture with `flip`, or `cut` for another capture of the same screen). At most one `claim`. Character limits are first filters; `film.js` also measures every line against the margin and paints a red banner for one that does not fit (Slots).

| type | purpose | fields | move |
|---|---|---|---|
| `wake` | Opens: the lid's edge draws out from the camera dot, the screen lights on the first capture on beat 1 (the hook); the name, then the note and line | `asset`, `name`, `note`, `line`, `region` (optional: ring it), `view` | — |
| `push` | The viewport pushes (or pulls, or pans) to a region; the light finds it; value, note and line; the ring closes on it | `asset`, `region`, `zoom` (`'rest'` or ≤ 1.333), `value`, `note`, `line`, `ring: false` (optional) | push |
| `cut` | A hard cut on the beat to another capture of the same screen, registered so the region keeps its place: the number changes, nothing else moves | `asset` (another capture), `region` (on both captures), `value`, `note`, `line` | — |
| `flip` | The device turns edge-on and lands on another surface; screen and chin change on the swap frame (T2) | `asset`, `region`, `zoom` or `view`, `value`, `note`, `line` | flip |
| `scroll` | The screen re-enacts the page's own scroll to another stop of the same capture (T2) | `asset`, `region`, `zoom` or `view`, `value`, `note`, `line` | scroll |
| `band` | The light hops from row to row on the still capture; each row brings its own copy (each row a composition) | `asset`, `rows`: 2–4 of `{ region, value, note, line }` (each region needs a `band`) | hop |
| `claim` | The climax: the region is lit and the lead read; the push lands on the next bar line with the value, read in a pause | `asset`, `region`, `zoom`, `lead`, `note`, `value` (required), `line` | hop, push |
| `lockup` | Back to the product's surface at rest (a flip when the capture changes, else a pull back), veiled; the name, the line, the URL (≥ 3 s); on the last downbeat the region is lit and ringed once more | `asset`, `region` (optional: the second move), `name` (required), `line`, `url`, `mark` (optional: an asset id drawn above the name) | flip or push |

`view` (any scene with a move): `'rest'` (the public region covering the screen, top-left), `{ region, zoom, anchor: 'top' }` (the region near the top of the screen: the reading position after a flip or a scroll), or `{ x, y, zoom }` (a top-left source point). Every view is clamped inside `public` and under the cap.

### Slots

| Slot | Role | Limit | Size |
|---|---|---|---|
| `value` | the number or name read first | ≤ 12 characters | Inter Tight 700, 95 px (76 px for the whole film when a value does not fit the margin at 95) |
| `name` | the product's name (wake, lockup) | ≤ 14 characters | display, as `value` |
| `line` | the main line under the value | ≤ 24 characters, ≤ 4 words | Inter Tight 600, 49 px |
| `lead` | the claim's lead line, read before the value | ≤ 24 characters, ≤ 4 words | 49 px |
| `note` | a glance note: repeats or sources what the screen shows | ≤ 34 characters, ≤ 6 words | IBM Plex Mono 500, 25 px; wraps once at a space or `/` |
| `url` | the closing address | ≤ 48 characters | mono 25 px; wraps once after a `/` |

The margin is 448 px wide on the laptop, 996 px on the phone. Every number in a scene's copy must appear in the `reads` of the region that scene lights (`npm run assets`): the margin repeats the evidence, it never adds to it.

### Short cut

The shortest chain is `wake → flip → lockup` with `edges: 'cut'` (2026-10-21): the first frame is the lit device on the first capture, the name lands on beat 1 (the hook), the device flips to a second surface and back for the lock-up. It fits 6 bars = 12.0 s at 120 BPM; `npm run fit` reports no error and one shape warning a three-scene reel cannot avoid (no climax marked), and `check-film` passes. `wake → push → lockup` has no expressive transition (a T2 error at 12 s): a short cut needs a `flip` or a `scroll`. Its last half second is the settled lock-up, so it cuts into a longer reel.

## Length

Nothing in content.js says how long the film is. `timing.rules.js` (timing API 3) states what each type needs, through `choreo.js`, the one table of times that `film.js` draws, `score.mjs` scores and the rules measure; `lib/timing.js` `fit()` rounds every scene to a beat and the film to a bar. A scene needs the longer of its choreography and its reading (0.3 s a word for primary text, read in order; a glance note ≤ 6 words still ≥ 1 s, in parallel).

Every state of the margin enters in the same order, the copy group: the value on the landing, the note and the line one beat later, the ring closing round the evidence one beat after that (a change that is not new text, so the line is read in a still frame while the picture keeps a change about every beat).

| type | choreography (beats from the start, at the default move lengths) | read (tier) | at 120 BPM (example) |
|---|---|---|---|
| `wake` | lid draws 0, screen lights 1 (hook), name 2, note and line 3, ring 4 (with a region), source line one beat after the last; `edges: 'cut'`: name 1, note and line 2, source line 3 | name, line (primary); note (glance) | 3.0 s |
| `push` | push 0–1, light 0.4, value 1, note and line 2, ring 3 | value, line; note | 2.5 s |
| `cut` | cut 0 with the value, note and line 1, ring 2 | value, line; note | — |
| `flip` | flip 0–2 (swap at 0.87), value 2, note and line 3, ring 4 | value, line; note | 3.0 s |
| `scroll` | scroll 0–2, value 2, note and line 3, ring 4 | value, line; note | 3.0 s |
| `band` | per row from its start t: light (or hop, 1 beat) t, value t + 1, note and line t + 2, ring t + 3; the next row at t + 4; a row's copy leaves as the next hop starts | each row's value and line; notes | 4.5 s (2 rows) |
| `claim` | light (a hop when the previous region was on the same capture) 0, lead 1, note 3, ring 5 (when the preroll is ≥ 6), the push lands on the next bar line P (4–7 beats) with the value (climax), line P + 1, then the pause | lead, value (`claim: true`), line; note | 5.0 s (P = 7) |
| `lockup` | flip (or pull back) 0–2, all veiled, name 2, line 3, URL 4 (holds ≥ 3 s), the second move on the last bar's downbeat | name, line, URL | 6.5 s; a rest that takes the bar rounding |

How the chain stays brisk under api 3 (`CONTRACT.md`, "api 3: the four tiers"):

- **The copy group is compressed.** The note and the line enter together, so every state lands in about three beats and the median composition stays near 3 s; a line or lead over 4 words is refused (it could not be read inside one still of at most two beats).
- **Every onset is a micro event** (`choreo.js` TYPES `micro`, including each line that leaves inside a scene), the still windows between them are the holds (the claim's is a pause), the flips and scrolls are the expressive transitions, and the peaks are the screen lighting (hook), the claim (climax) and the lock-up.
- **The claim finds its bar line itself.** `timing.rules.js` plans the scenes before the claim while `fit()` sizes them, so the claim knows how many beats remain to the next bar line (its preroll P). Lengthen nothing by hand before a claim.
- **Phrase of one bar, no shared rounding.** All the rounding goes to the closing `lockup` (a rest whose second move lands on the last downbeat).
- **Two flips in a row turn opposite ways** (`right`, then `left`): the T2 rule "never twice in a row unchanged"; at most three flips a film.

The shipped example fits 15 bars = 30.0 s at 120 BPM: `npm run fit` reports no error and no warning; T0 median gap 1 beat, longest 2; 9 compositions, median 3 s, CV 0.41; 3 expressive transitions; the climax at 73 %. `check-film --film-dir .` reports 0 WARN and 0 FAIL.

## Computed, never typed

| On screen | Comes from |
|---|---|
| everything on the screen | the capture's own pixels, through a view (`choreo.js` `viewOf`): never redrawn |
| the ring, the level tick, the light | the region's `box` and `band` in the capture's px, carried through the same view as the pixels |
| the chin's source line | the capture's `chin` |
| the copy block's height on the margin | the lit region's height on the screen (the level rail) |
| the display size (95 or 76 px) and every wrap | measured against the margin (`film.js` `fitCopy`) |
| flip directions | alternate per flip (`choreo.js` `plan`) |

## Form variant: `device`

`device` changes the hardware drawn round the screen, the screen's size and the margin, and nothing else: timing, choreography, sound, colours and type do not change.

| value | device | screen | margin | capture for it |
|---|---|---|---|---|
| `laptop` (default) | head-on lid 1192 × 800 at (96, 131), radius 28, a chin naming the source, an 18 px deck | 1152 × 720 (16:10) | x 1376, 448 px | desktop apps, web pages, docs: a 1152 px wide capture shows at 1.0 output px per source px at rest |
| `phone` | head-on body 440 × 920 at (300, 48), radius 64, a camera pill; the source line under the device | 400 × 840 | x 828, 996 px | mobile apps and mobile pages (390 CSS px at 3×, or any capture about 400–530 px wide) |

A capture made for a wider screen still renders on the phone, but its text is texture: `npm run assets` warns when a view shows a capture below 0.5 output px per source px. The shipped example's captures are desktop README pages, so `device: 'phone'` renders it with that warning on the guide (2026-10-21; `check-film` passes).

## Palettes

One ground, the device's neutrals, three text tones for the margin, and one accent that marks only the region in play (the ring, the level tick). Captures keep their own colours: they are content. `npm run palettes` checks every contrast pair, then measures each preset's accent against every colour filling ≥ 2 % of each ringed region of content.js (ΔE00 ≥ 20); the page paints a failing pair or ring in red.

| id | ground / lid / ink / dim | accent | veil | choose it for | weakest pair |
|---|---|---|---|---|---|
| `graphite` (default) | `#0E1013` / `#1A1D22` / `#ECEEF1` / `#8B929C` | `#ADE05E` | 0.52 | most products: white pages, blue or red interfaces, charts | dim on the lid 5.38 |
| `umber` | `#100F0D` / `#1C1B18` / `#EFEDE8` / `#948F85` | `#FFB45C` | 0.52 | captures that are green or teal | dim on the lid 5.35 |
| `porcelain` (light) | `#ECEEF1` / `#D3D7DD` / `#14161A` / `#50565F` | `#3D7A0A` | 0.40 | a light film, or a dark-mode product (a dark screen on a light ground) | accent on the ground 4.53 (graphics: ≥ 3) |

The accent is the preset's, never computed per film: a film whose captures fail the ΔE00 rule takes another preset. In the shipped example `umber` fails on the README's style stills (8.8 against their amber still), which is why the example is `graphite`.

## Moves

Four roles, each filled by one adapter in `moves.js`:

| Role | Default | What it does here |
|---|---|---|
| `push` | `viewport-push` (library) | the viewport moves on the log-zoom path between two views of the same capture (push, pull, pan); 1 beat |
| `hop` | `spotlight-band` (library) | the light moves from one band region to the next on a still capture; 1 beat |
| `scroll` | `page-scroll` (this template) | the page's own scroll to another stop of the same capture, cubic in-out; 2 beats, T2 |
| `flip` | `device-flip` (library) | the whole device (both faces painted as textures) turns edge-on and lands on the other surface; the `left` variant mirrors the turn; 2 beats, T2 |

`content.moves = { scroll: 'other-id' }` picks another adapter for a role. The choreography reads only an adapter's `beats` and `device` (through `movesOf()`), so a swapped move keeps every timing check; `timing.rules.js` declares every adapter's T2 device to `lib/fit.mjs`. **Swapping a transition:** add the module to `lib/handoffs/` (or keep it in the film), then add an adapter to `ADAPTERS[role]` in `moves.js`:

```js
// a scroll that paints the screen itself (a momentum scroll, a feed of stacked screens)
'my-scroll': {
  device: 'my-scroll', beats: 3,               // T2 device name and length in beats
  curve: (p) => p,                             // still used for the copy's level and the light
  screen(g, p, env) { /* env: { from: { image, view, public }, to: {...}, w, h, colors, variant } */ },
  track: (p, env) => [[x, y], ...],            // screen points, for the motion blur
},
// a change of surface
'my-flip': {
  device: 'my-flip', beats: 2, swap: 0.5,      // swap: the p of the content change (score.mjs puts its sound there)
  paint(g, p, env) { /* env: { faces: [from, to] canvases of the whole device, box, screen (inside the box), colors, variant } */ },
  track: (p, env) => [[x, y], ...],
},
```

At p = 0 and p = 1 an adapter must draw exactly what the template draws on either side (the device at rest with the from or to screen), or the move pops.

## Library and local code

From the shared runtime (`lib/`): `lib/handoffs/viewport-push.js` (the push's curve), `lib/handoffs/spotlight-band.js` (the band hop), `lib/handoffs/device-flip.js` (the turn, the swap frame, the strip projection), `lib/handoffs/asset.js` (`view`, `zoomBetween`, `ring`, `ringContrast`, `deltaE00`), `lib/canvas.js` `subframes` (speed-gated motion blur, exact), `lib/timing.js`, `lib/audio`. Kept in this template, and why:

- **page-scroll** (`moves.js`): no library module scrolls one captured page under a still frame; it is a view interpolation with its own T2 device name, so `fit` and `check-film` count it.
- **the device, the chin, the level tick and the margin rails** (`film.js`): the mode's own frame.
- **the veil** (`film.js` `paintScreen`): an even-odd fill over the screen with the region's hole, drawn through the same view as the capture, so it is carried exactly by every move.
- **`tools/check-assets.mjs`, `tools/rings.mjs`, `tools/capture.mjs`, `tools/ocr.swift`**: the real-asset gate and the capture tool; `ocr.swift` uses macOS Vision and is skipped (WARN) elsewhere.

## Sound

`score.mjs` reads the same `fit()` and `choreo.js`. The bed is the kit's `data` preset (a soft muted four-on-the-floor, a plucked up-down arpeggio, a warm pad, a round bass) in F with `mix: 'v2'`, arranged from the scenes: an intro under the wake, a build under the pushes and flips, the groove from the first band or scroll to the claim (its melodic layer dropped while the claim is read), a build after it and an outro under the lock-up. The sounds belong to the device: a tick and a soft low body on each landing, a short sweep and a muted thock on a flip's swap frame, a sweep under a page scroll, a quiet sweep under a push, an impact and a rolled chime on the claim with a duck before it, a chime on the screen lighting, a bell on the lock-up. Master −14 LUFS, true peak ≤ −1.5 dBTP, `tone: 'v2'`, measured into `assets/audio/measure.json`. `content.sound = { key, tone }` changes the key or returns to tone v1.

## Files

| File | Holds |
|---|---|
| `content.js` | the film (the only file edited for an ordinary film) |
| `choreo.js` | the device geometry (`DEVICES`), views (`viewOf`), every time of every type (`TYPES`), `plan()`, `LIMITS` and `validate()` |
| `moves.js` | the four move roles and their adapters (`ADAPTERS`, `moveOf`) |
| `timing.rules.js` | what each type needs, its key events, micro events, holds, shots, expressive transitions and peaks (api 3); the claim's preroll during sizing |
| `palettes.js` | presets, their contrast check, and (as `npm run palettes`) the accent against every ringed region |
| `film.js` | the camera, the light, the device, the margin, the pixel checks (red banner), frame assembly, motion blur, grain |
| `score.mjs` | the bed and every picture event's sound |
| `tools/` | `check-assets.mjs` (`npm run assets`), `rings.mjs` (ΔE00 of the accent per ringed region), `capture.mjs` (captures and probes), `ocr.swift` (macOS Vision boxes) |
| `assets/real/` | the captures |
| `index.html` | the composition: the build hold and the `__timelines` stub in the head, fonts through `fonts.css` and `fontsReady` |

## Example (shipped content.js)

The skill films its own README as rendered on its public repository page: two captures of the README article made with `tools/capture.mjs` on 2026-10-21 (no avatars, account rows or sidebar; the repository's own content, MIT; THIRD-PARTY.md). 30.0 s at 120 BPM, `graphite`, laptop:

| # | type | start | length | what the viewer sees |
|---|---|---|---|---|
| 1 | `wake` | 0.0 | 3.0 | the lid draws, the README lights (hook); Filmsmith, films made in code, its own README |
| 2 | `push` | 3.0 | 2.5 | a push into the lede, "every frame drawn in code" lit and ringed; Every frame, drawn in code |
| 3 | `push` | 5.5 | 2.5 | a pull back onto the row of style stills; Its frames, drawn, not filmed |
| 4 | `flip` | 8.0 | 3.0 | the device turns to the README's guide section; Any agent, no special tools |
| 5 | `band` | 11.0 | 4.5 | the light on the "needs no API key" row, then a hop to the "writes one `content.js`" row; No API key; One file, content.js |
| 6 | `scroll` | 15.5 | 3.0 | the page scrolls down to "a new composition every 2–3 s"; 2–3 s |
| 7 | `claim` | 18.5 | 5.0 | the light hops to the Measured row, each film measured; the push lands on the bar line (22.0): −14 LUFS (climax), loudness, checked |
| 8 | `lockup` | 23.5 | 6.5 | the device turns back (the other way) to the README at rest, veiled; Filmsmith, an agent skill, the URL; the title ringed on the last downbeat |
