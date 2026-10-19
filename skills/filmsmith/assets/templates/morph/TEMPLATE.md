# morph template

One ink shape never leaves the frame and is promoted one dimension per scene: a point → a line (the baseline of an endpoint) → a plane (the request pill, the response card, the schema) → a solid (the spec, a cube) → an interface (the cube unfolds into the generated docs page, which gathers into one card at main size) → the live console (the Run button floods the frame) → the product's mark (the card splits into the mark's parts; the point lands as its drop of ink). No cuts: every scene starts on the exact frame the previous one ended. Light cool ground, one ink, and one accent that marks only the part that is changing now. Mode card: `references/modes/morph.md`.

```bash
node scripts/new-film.mjs morph <film-dir> [--palette <id>]
cd <film-dir>
# write PLAN.md first (new-film made the skeleton; fit refuses to run without it), then edit content.js (this file is the guide)
npm run fit           # the timing table, renders/timing.json, the duration stamped into index.html
npm run snapshot -- --at 0.5,3,7,13.6,16.3,19,24.6,28.5     # key frames (times for the shipped example)
npm run film          # fit → audio → check → render
npm run palettes      # contrast of every preset
```

## What content.js controls

```js
export default {
  palette: 'slate',      // id from palettes.js
  corners: 'round',      // form variant: 'round' (default) or 'cut' (chamfered corners); see "Form variant"
  seed: 20261019,        // grain
  // bpm: 120,           // optional, 112–128
  // target: 40,         // optional seconds; the tempo moves inside 112–128 to meet it
  meta: { title, url },
  product: { ... },      // the facts several scenes draw from (below)
  scenes: [ ... ],       // the chain (registry below); no bars, no duration
};
```

### product: the facts

The docs page, the card, the console and the cube's labels all show the same API, so it is written once:

| Field | What it is | Limits |
|---|---|---|
| `name` | the product's name: the wordmark of the lock-up | ≤ 12 characters |
| `title`, `version`, `file`, `base` | the docs page header (`Invoices API v2.3 · invoices.yaml`) and the API's base path (`/v2`) | header ≤ ~40 characters together |
| `endpoints` | `[[method, path], ...]`, 3–5 rows: the page's endpoint list | the last path segment ≤ 9 characters (it sits in a 340 px column) |
| `select` | the index of the endpoint the film follows (the highlight jumps to it; the page and the focus card show it) | |
| `schemas`, `sdks` | lists: their lengths are counted on the cube (`{schemas}`, `{sdks}`); `sdks` are the page's chips | `sdks` 2–4 short names |
| `call` | `{ status, reason, ms }` of the request the film runs | |
| `body` | `[[field, value, type], ...]`, 2–5 fields: the response body (card, console) and its schema types (chips) | each JSON line ≤ 26 characters; a type ≤ 8 |
| `mark` | the product's mark in grid units: `parts` (3–8 rectangles `[x, y, w, h]`) and `dot` (`[cx, cy, r]`, where the point lands) | one grid unit is 30 px; keep it within about 10 × 10 units |

Copy may quote facts as placeholders: `{endpoints}` `{schemas}` `{sdks}` (counts), `{title}` `{version}` `{file}` `{name}` `{status}` `{reason}` `{ms}`. Any other `{token}` (an API path parameter such as `{id}`) is left as written.

The mark is drawn from `product.mark`, never a stock logo: the pieces of the previous scene (the page's six panels, or the card cut into a grid) fly into its parts, so the parts should be rectangles of the product's real mark. The example's is quillstack's: a stepped nib, three layers of a stack split by the slit, the point as the drop of ink at its tip.

## Scene registry (the chain)

Each scene starts from the shape the previous one ended on, so the order is fixed by what may follow what (`choreo.js` `FOLLOWS`; `npm run fit` and the page report any other order as an error). Character limits are first filters; the pixel checks paint a red banner (`film.js` `problems()`).

| # | type | purpose | slots (limits) | follows | hands to the next |
|---|---|---|---|---|---|
| 1 | `point` | The film's first frame is the accent point; it swells and lands on beat 1 (the hook) | — | the start | the point |
| 2 | `line` | The point shoots out into a line; the text rises out of it as its baseline (beat 1); one token is swapped in the accent (beat 3) | `text` ≤ 30 (mono 69 px), `swap: [token in text, replacement ≤ 12]` (optional) | the start or `point` | the line and its text |
| 3 | `press` | The line thickens upward into a pill around its own text (the text is knocked out of the ink); the token hands the accent to the action chip (beat 1); the chip is pressed (beat 3) | `action` ≤ 8 (optional) | `line` | the pill |
| 4 | `card` | After the pill: its content leaves, the pill grows into the response card (a container transform), status and body enter (beats 1, 2), the status chip gives up the accent (beat 3). After a card: the same card re-read as the schema: the header turns into `name`, type chips rise in the accent (beat 1) and settle (beat 3) | `name` ≤ 14 (required after a card) | `press` or `card` | the card |
| 5 | `solid` | The card's outline morphs at equal arc length into a flat hexagon (beat 0); three accent lines re-read it as a cube (beat 2, stroke-reinterpret); the faces take three tones of the ink; the caption (beat 3); three face labels, half a beat apart; the front face takes the accent a beat before the end. Opening a film, it starts on the hexagon a beat sooner | `caption` ≤ 14 (86 px, ≤ 640 px wide), `faces`: 3 labels ≤ 16 | the start or `card` | the cube |
| 6 | `unfold` | The cube unfolds about its front face into a cross and the squares slide into the six panels of the docs page (beats 0–2, net-unfold); the panels fill (beat 2); the second caption (beat 2.5); the highlight jumps down the endpoint list (beat 3) and settles (beat 4) | `caption` ≤ 14, `ref` ≤ 22 (the reference panel's title), `code: [lang, line]` (the code panel) | `solid` | the page |
| 7 | `focus` | The six panels gather into one card at main size (beat 0); title (beat 1); tabs, the first code and Run (beat 2); one tab every 2 beats or once the previous code is read; a beat before the end Run takes the accent | `title` ≤ 22, `tabs`: 2–4 of `{ lang ≤ 8, code: 1–2 lines ≤ 36 }` (mono 55 px), `run` | `unfold` | the card with Run |
| 8 | `flood` | Run is pressed and spins until the next bar line; on the bar line its outline floods the frame (shape-flood): inside, the same card in the other material, the live console; status (+2 beats, accent), two body lines; the claim on the next bar line (the climax), read in a pause; the console retracts into Run | `claim` ≤ 16 (86 px) | `focus` | the card with Run |
| 9 | `mark` | The previous shape splits into the mark's parts, which fly in on arcs and fill with ink; a target ring; the point grows out of the last accent element, hops in and lands as the mark's dot (beat 2, the lock-up); the name wipes out of the mark; the tagline (beat 2.5); the command types on (beat 3.5) and holds ≥ 3 s; on the last downbeat the stack presses once | `line` ≤ 24 (the tagline), `cmd` ≤ 36 (optional, the closing command) | `card`, `unfold`, `focus` or `flood`; always last | — |

### Short cut

The shortest chain is `solid → unfold → mark` (2026-10-19): the first frame is the flat hexagon on the ground, the three lines draw on beat 1 (the hook), the page unfolds, the panels fly into the mark. With the closing command it fits 6 bars = 12.0 s at 120 BPM (11.25 s at 128); `npm run fit` reports no error, two shape warnings that a three-scene reel cannot avoid (no run of three compositions that speeds up or slows down; no climax marked). Without the command the three compositions vary too little (CV 0.25 < 0.3, an error): keep `cmd` in a short cut. Its last half second is the settled lock-up, so it cuts into a longer reel.

## Length

Nothing in content.js says how long the film is. `timing.rules.js` (timing API 3) states what each type needs, through `choreo.js`, the one table of times that `film.js` draws, `score.mjs` scores and the rules measure; `lib/timing.js` `fit()` rounds every scene to a beat and the film to a bar. A scene needs the longer of its choreography and its reading (0.3 s a word for primary text, read in order; glance text ≤ 6 words still ≥ 1 s, in parallel).

| type | choreography (beats from the start) | read (tier) | at 120 BPM (example) |
|---|---|---|---|
| `point` | land 1 | — | 1.0 s (2 beats minimum) |
| `line` | shoot 0, text 1, swap 3 | `text`, then the new token (primary) | 2.5 s |
| `press` | grow 0, chip 1, press 3 | `action` (glance) | 2.0 s |
| `card` (response) | grow 0, header and body 1, rest of body 2, settle 3 | the status line (primary); body lines (glance) | 2.5 s |
| `card` (schema) | header 0, chips 1, settle 3 | `name` (primary); types (glance) | 2.5 s |
| `solid` | morph 0, lines 2, tones 2.6, caption 3, faces 3.5 / 4 / 4.5, arm end − 1 | `caption` (primary); faces (glance) | 4.0 s |
| `unfold` | unfold 0, slide 1, fill 2, caption 2.5, jump 3, settle 4 | `caption` (primary); `ref` (glance) | 2.5 s |
| `focus` | gather 0, title 1, code 2, a tab every ≥ 2, arm end − 1 | `title`, each tab's code (primary, in order); tab names, the endpoint (glance) | 4.0 s (3 tabs) |
| `flood` | press 0, flood at the next bar line (`pre`, 0–3 beats), status pre + 2, lines pre + 2.5 / 3, claim pre + 4, retract the last 1.25 | the status line (primary), the claim (primary, `claim: true`, read in a pause) | 5.5 s (pre 2 beats) |
| `mark` | split 0, ring 1.25, land 2, name 2, tagline 2.5, command 3.5 (60 characters a second) + 3 s | name, tagline, command (primary) | 5.5 s; a rest that takes the bar rounding |

How the chain stays brisk under api 3 (`CONTRACT.md`, "api 3: the four tiers"):

- **No turns, no shared rounding.** No type is a turn, and `phraseShareBeats` is 0: a turn's pad and a beat of phrase share both lengthened a scene's last still hold past 2 beats. The flood finds the bar line itself: it starts where the focus ends, Run spins for the beats left to the next bar line (`pre`), and the flood and the claim land on bar lines. `timing.rules.js` computes the flood's start while `fit()` sizes the scenes (every earlier scene is its need rounded up to a beat), so a hand `bars` on an earlier scene breaks that computation: lengthen nothing by hand before a flood.
- **Phrase of one bar.** All the rounding goes to the closing `mark` (a rest whose stack presses on the last downbeat), so the phrase is one bar, not two: a 2-bar phrase left up to 7 beats of extra lock-up (8.5 s in the example).
- **Exit-relative accents.** The `solid`'s front face and the focus card's Run button take the accent one beat before their scene ends, timed from the fitted end: the last still hold of those scenes stays under 2 beats whatever the rounding adds.
- **Every onset is a micro event** (`choreo.js` `micro`), the still windows between them are the holds (the claim's is a pause), the three dimension upgrades in the middle are the expressive transitions (stroke-reinterpret, net-unfold, shape-flood), and the peaks are the point's landing (hook), the claim (climax) and the point landing in the mark (lock-up). The console is a second composition inside the flood when a preroll comes first (`shots`).

The shipped example fits 16 bars = 32.0 s at 120 BPM: `npm run fit` reports no error and no warning; T0 median gap 1 beat, longest 2.5; 11 compositions, median 2.5 s, CV 0.47; 3 expressive transitions; the climax at 75 %.

## Computed, never typed

| On screen | Comes from |
|---|---|
| `5 endpoints`, `5 schemas`, `4 SDKs` on the cube | lengths of `product.endpoints`, `.schemas`, `.sdks` (`choreo.js` `facts`) |
| the endpoint list, its methods (`DELETE` shown `DEL`) and last path segments | `product.endpoints` |
| `GET /v2/invoices/{id}` on the page and the focus card | `product.endpoints[select]` + `product.base` (`choreo.js` `endpointLine`) |
| the response body, the schema types, the console's lines | `product.body` (`choreo.js` `bodyLines`) |
| `200 OK · 84 ms` | `product.call` (`choreo.js` `statusLine`, `metaLine`) |
| the SDK chips | `product.sdks` |
| the mark | `product.mark` (`film.js` `markLayout`) |

The example's call (84 ms, the amount 4200) is illustrative: a film of a real API takes them from a real request and says so in its README.

## Form variant: `corners`

`corners` changes the corner geometry of every container the shape becomes, and nothing else: the pill, the card, the type and status chips, the six panels, the focus card, the tabs and their highlight, Run, the flood's outline (it is Run's outline) and the mark's parts (`film.js` `shapePath`). The point stays round (it is a point, not a container); the hexagon and the cube are geometry. Timing, choreography, sound, colours and type do not change.

| value | corners | source (mode card, Variants) |
|---|---|---|
| `round` (default) | circular arcs (the pill is a full stadium) | the approved sample; Material's rounded corner family |
| `cut` | the same corners chamfered at 45° (cut length 0.82 × the radius) | Material's cut corner family (the shape system of 2018); chamfered edges of machined parts and technical drawing |

`round` renders exactly as the template did before the field existed (it is the code path that existed). Both values render the example with `check-film` PASS (2026-10-19, workshop `works/skill-modes-v1/batch4/modes/morph/variants/cut`).

## Palettes

One ground, one ink, one accent; `paper` is the panels' fill, a step lighter than the ground; `inkDim` and `inkAccent` are the same roles on the ink ground of the console. `npm run palettes` checks every pair, the console's against the console card it actually sits on (the ink mixed 6 % toward the ground); the page paints a failing preset in red.

| id | ground / paper / ink / dim | accent / onAccent | console: inkDim / inkAccent | weakest pair |
|---|---|---|---|---|
| `slate` (default, the approved sample) | `#EDEFF2` / `#F8F9FB` / `#15171A` / `#5F656D` | `#6A3DF0` / `#EDEFF2` | `#9AA0A8` / `#8C6CFF` | inkAccent on the console card 4.23 (44 px semibold, large type: ≥ 3) |
| `azure` | same | `#1F55E0` / `#EDEFF2` | `#9AA0A8` / `#7FA0FF` | dim on ground 5.11 |
| `night` (inverted; the console turns light) | `#121418` / `#1B1E23` / `#E8EBEF` / `#8D939B` | `#9C80FF` / `#121418` | `#585E66` / `#6A3DF0` | inkAccent on the console card 4.40 (large type); inkDim on it 4.85 |

## Library and local code

From the shared runtime (`lib/`): `lib/handoffs` `stroke-reinterpret` draws the three lines that turn the hexagon into a cube; `lib/handoffs/paths.js` measures the outlines that the card → hexagon morph resamples at equal arc length; `lib/handoffs/container-morph.js` `leadingEdges` moves the tab highlight (leading edge first); `lib/canvas.js` `subframes` (exact) blurs the fast moves. Kept in `film.js`, and why:

- **net-unfold**: the module paints a light box (faces mixed from the ground toward `line`) and panels with round corners; morph's solid is the ink shape itself, shaded in three tones of the ink that flatten into the panels' paper as the cube opens, and its panels follow `corners`.
- **converge-mark**: the module flies circles and squares; morph flies the page's rectangles (or the card's cells) into the mark's rectangular parts, which follow `corners`.
- **container-morph** (the pill → card, the page → focus card): the module has one centre and round corners; the pill grows into a card centred elsewhere, six panels gather into one, and every container follows `corners`.
- **shape-flood**: the WebGL transition floods a circle, a hexagon or a rounded rectangle; Run's outline in `corners: 'cut'` is chamfered, and the flood must be that exact outline in both values, so it is a canvas clip of `shapePath`, exponential in over one beat.

The expressive transitions are declared under the library's ids, so `npm run fit` and `check-film` count them like any other film's.

## Sound

`score.mjs` reads the same `fit()` and `choreo.js`. The bed is written in `score.mjs` from `lib/audio` voices (no preset in `lib/audio/beds.mjs` fits morph yet): E major, one chord a bar (Emaj9 C#m9 Amaj7#11 B7sus4), a soft pad, a plucked eighth-note arpeggio, a muted kick and offbeat hats that thicken with the dimension (line < plane < solid < interface), the arpeggio resting under the focus card's code, a riser into the flood, the drop (four on the floor, claps, sixteenth hats, bass on every beat) from the flood's bar line to its retract, and felt keys and one bell under the mark. Every key event has a short broadband click and a soft low body on its frame (`keyHit`), so `check-film` hears the onset; each landing has its own sound at the same time (pop, pluck, tick, chime, impact). Master −14 LUFS, true peak ≤ −1.5 dBTP, measured into `assets/audio/measure.json`.

The renderer lowers the whole mix when its AAC encode would pass −1 dBTP; an FM bell over the drop's hats once overshot by 2.5 dB and cost 1.2 dB of loudness (2026-10-19), so the bells over the drop use a low FM index (0.9). After changing a sound, check `npm run film`'s log for "Audio lowered".

## Files

| File | Holds |
|---|---|
| `content.js` | the film (the only file edited for an ordinary film) |
| `choreo.js` | every time of every type, the facts and placeholders, the registry (`FOLLOWS`, `LIMITS`) and `validate()` |
| `timing.rules.js` | what each type needs, its key events, micro events, holds, shots, expressive transitions and peaks (api 3), the flood's preroll during sizing |
| `palettes.js` | presets and their contrast check |
| `film.js` | every scene, the form variant (`shapePath`), the layout, the pixel checks (red banner), frame assembly, motion blur, grain |
| `score.mjs` | the bed and every picture event's sound |
| `index.html` | the composition: the build hold and the `__timelines` stub in the head, fonts through `fonts.css` and `fontsReady` |

## Example (shipped content.js)

quillstack, a made-up tool that turns one API spec into the whole docs site. 32.0 s at 120 BPM:

| # | type | start | length | what the viewer sees |
|---|---|---|---|---|
| 1 | `point` | 0.0 | 1.0 | the violet point lands (hook) |
| 2 | `line` | 1.0 | 2.5 | it shoots into a line; `GET /v2/invoices/{id}` rises on it; `{id}` → `inv_8KQ2` in violet |
| 3 | `press` | 3.5 | 2.0 | the line thickens into the request pill; Send is pressed |
| 4 | `card` | 5.5 | 2.5 | the pill grows into the response card: `200 OK · 84 ms` and the JSON body |
| 5 | `card` | 8.0 | 2.5 | the same card re-read as the Invoice schema: type chips |
| 6 | `solid` | 10.5 | 4.0 | outline → hexagon → cube; One spec in.; 5 endpoints, 5 schemas, 4 SDKs |
| 7 | `unfold` | 14.5 | 2.5 | the cube unfolds into the docs page; Every doc out.; the highlight jumps to `GET /{id}` |
| 8 | `focus` | 17.0 | 4.0 | the page gathers into one card: Retrieve an invoice, python / node / curl at 55 px |
| 9 | `flood` | 21.0 | 5.5 | Run spins, floods the frame on the bar line (22.0): the console, `200 OK · 84 ms`, the body; Docs that run. (24.0, climax) |
| 10 | `mark` | 26.5 | 5.5 | the card splits into the nib; the point lands as its drop of ink (27.5); quillstack, docs from one spec, `npx quillstack build invoices.yaml` |
