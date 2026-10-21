# Transitions

How one state of a film becomes the next, in two layers:

- **Frame-level transitions** (`assets/runtime/transitions/`, 17): a pixel function of two whole frames, A → B, drawn by WebGL. Use when the two scenes do not share an object, or when the change is the frame itself (a lamp, an aperture, a push, a flash).
- **Hand-offs** (`assets/runtime/handoffs/`, 29, nine of them for real assets): one object of scene A carries the eye into scene B: a line presses a word, a card shrinks into a node, a dot bursts into the next word, a ringed cell of a screenshot lifts out and becomes code. Drawn in Canvas2D as a pure function of progress, with the template's own content, geometry and palette. Use them first: a change the eye can follow costs the viewer least (principle 4).

new-film copies the runtime into every film as `lib/` (`lib/transitions/`, `lib/handoffs/`). Every entry passes the clean-transition criteria C1–C8 (workshop theory 07). The 26 added on 2026-10-19 (six frame-level, twenty hand-offs) were approved by the owner as samples that day; their values are `draft` until a film has used them. The nine asset hand-offs (`lift-out` … `mark-to-chrome`, added 2026-10-20) were approved the same way on sample clips over real screenshots, a chart and a logo; their values are `draft` too. Proof of the 2026-10-19 set: workshop `works/skill-modes-v1/batch4/transitions/library-proof/` (contact sheets of every module at p = 0, 0.25, 0.5, 0.75, 1 rendered through this library, a side-by-side with the approved sample clips, a low-resolution reel).

## Tiers

Each entry has a tier (principles 4 and 5): **T0** a micro change, about one per beat, never more than 4 beats without one; **T1** a scene change, median 2–3 s; **T2** an expressive transition, about one every 8–12 s, the same device at most three times a film and never twice in a row unchanged (vary direction, origin or colour role and record it as `variant`), at most 2 beats each; **T3** a peak (the hook, the claim or reveal, the lock-up), two or three a film. Each T2 and T3 lands on a beat with a sound. Templates on timing API 3 declare each T2 in `events().expressive` with its `device` id (an entry name here; `lib/fit.mjs` checks the id against both registries).

A device used below its tier is fine (a T2 device as a T3 peak); used above it, it is not: a T0 or T1 hand-off repeated as the film's big turns stops being a hand-off and becomes a tic. Several entries take longer than 2 beats at their defaults; as a T2 pass a shorter length (`durationOf(name, bpm, beats)` for frame-level ones, `beats` in the timeline for hand-offs whose phases scale), or use them as a T3.

## Use

### Frame-level

```js
import { createTransitions, frameOf, progressAt, durationOf } from './lib/transitions/index.js';

const tx = createTransitions(canvas);              // a 1920 × 1080 canvas on top of the scene, or any canvas
tx.warm();                                         // compile all programs while the film loads
// inside render(t), during a transition that starts at t0:
const dur = durationOf('ink-drop', BPM);           // default beats × 60 / bpm; durationOf(name, bpm, 2) for 2 beats
const p = progressAt(t, t0, dur);                  // linear 0..1; each transition eases by itself
tx.draw('ink-drop', frameOf('a'), frameOf('b'), p, {
  seed: 3,
  origin: [960, 540],                              // film px; where the drop lands, the line runs, the sweep starts
  colors: { ink: pal.accent },                     // palette roles, see "Colour roles"
});
```

- `from` / `to`: any `TexImageSource`: an `img`, a `canvas` (a template's scene canvas), a `video`, an `ImageBitmap`. Two scenes drawn by code: render each into its own offscreen canvas and pass those.
- `frameOf(id)`: the current frame of `<video id>`. While rendering, HyperFrames 0.8.163 injects the decoded frame as `<img id="__render_frame_<key>__" class="__render_frame__">` next to the video (`key` = `data-hf-render-id`, else the id); in preview there is none and the video element is returned. Checked 2026-10-19 on the sample: the frame drawn equals the source clip's frame (PSNR 44–45 dB, encode loss only).
- Pure function: a frame depends on `(name, from, to, p, opts)` only. `p ≤ 0` draws `from`, `p ≥ 1` draws `to`, pixel for pixel when they are the canvas's size.
- GLSL ES 1.00, one full-screen triangle per frame; WebGL1 and WebGL2. `createTransitions` returns `null` without WebGL.
- `list`: `[{ name, mode, tier, beats, ease, roles, summary }]`.

**Self-test** (`node lib/transitions/test/run.mjs [--gl gpu|swiftshader]`, needs puppeteer-core and Chrome): random-noise frames, every transition; p = 0 and p = 1 differ from `from` / `to` by 0 in every channel; p = 1/300 and 299/300 change at most the designed pixels; p = 0.5 drawn twice with other frames between is identical. Result 2026-10-19: all seventeen PASS on Metal (Apple M4 Pro) and on SwiftShader. Time per 1920 × 1080 frame: GPU 1–10 ms; SwiftShader 22–88 ms, slice-smear 133 ms, whip-push 237 ms, ink-drop 249 ms.

### Hand-offs

```js
import { createHandoff, progressAt } from './lib/handoffs/index.js';

// once, after the fonts have loaded (hand-offs measure text and sample glyphs):
const press = await createHandoff('rail-press', {
  from: { text: 'tracewire' }, to: { text: 'rewind' },
  font: { family: 'Bricolage Grotesque', weight: 700, size: 230 },
  colors: { ground: pal.ground, ink: pal.text, accent: pal.line },
});
// inside render(t):
const dur = press.duration(BPM);                   // its beats × 60 / bpm
if (t < t0) press.still(ctx, 'from');              // scene A's rest (or the template draws its own, identical)
else if (t < t0 + dur) press.draw(ctx, progressAt(t, t0, dur), { dur });
else press.still(ctx, 'to');                       // scene B's rest
```

- Every hand-off has one structure: an object of scene A (`from`) hands off, an object of scene B (`to`) takes over, and a few named properties interpolate between them (`list[i].interpolates`). A module computes the state at p and the two rests as plain numbers, then paints a state; so a frame depends on `(name, params, p)` only, p = 0 paints exactly the `from` rest and p = 1 exactly the `to` rest, and nothing is kept between frames. Randomness comes from `lib/rng.js` `hash` with `params.seed`.
- Params: `colors` by role (`ground`, `ink`, `accent`, `dim`, plus the few each entry names), `font` / `mono` (`{ family, weight, size, spacing }`), geometry in film px (1920 × 1080), content (`from`, `to`: text, values, card painters `(ctx, box, params) => …`, scene painters), `seed`. Every module's `defaults` (in its file) lists every parameter with a neutral sample value; a template passes its own content and palette.
- `ground: false` draws the hand-off as a layer over the template's scene instead of on its ground colour.
- `draw(ctx, p, { dur })`: with `dur` (the seconds it lasts) the frames whose fastest point moves more than 1 px during the exposure get sub-frame motion blur; slower frames and the two rests are sharp. `{ blur: false }` turns it off.
- `drawHandoff(ctx, name, p, params, opts)` is the one-call form for hand-offs whose preparation is synchronous. `list`: `[{ name, tier, beats, roles, summary, theory, modes, from, to, interpolates }]`; `beatsOf(name, params)` and `durationOf(name, bpm, params)` for those whose length follows their content (roulette-lock, scramble-resolve) or stage.
- `lib/handoffs/halftone.js` is the halftone mode's print screen (`screen`, `knockText`), used by anchor-swap and field-morph and free for scenes.

**Self-test** (`node lib/handoffs/test/run.mjs`, puppeteer-core and Chrome): every hand-off with its defaults and each stage or variant, and every asset hand-off once more on an image file (`test/asset.png`, drawn in code by `test/make-asset.mjs`) (60 cases); p = 0 equals the `from` rest and p = 1 the `to` rest (max channel difference 0); a frame drawn twice with other frames between is identical, with motion blur on as well; the defaults draw something; the fastest point moves ≤ 2 px during the last frame before landing. Result 2026-10-20: PASS, 2–34 ms per 1920 × 1080 frame without blur (field-morph's full-frame screen is the slowest; the asset hand-offs take 4–13 ms).

### Motion blur

`lib/canvas.js` `subframes(ctx, draw, t, { speed, fps, shutter, step, threshold, maxN })` renders sub-frames over the shutter and sums them exactly (integers, premultiplied alpha, fixed order: bit-identical every time, transparent layers keep clean edges). `speed` is the fastest edge in px per frame (a number or a function of t): below `threshold` (1 px) the frame is drawn once, sharp, so nothing blurs while settled or after landing; above it the sub-frames are at most `step` px apart (2), so a fast thin line becomes a streak, not a row of ghost copies, and when even `maxN` (32) cannot keep that spacing the shutter shortens. The older form `{ n, fps, shutter }` (a fixed n, running average) still works as before. Motion streaks are how the eye records real speed (Geisler 1999), so the blur describes the move rather than decorating it; on only above the threshold, it never softens a still frame.

### Real assets

Screenshots, interface captures, official charts and logos enter a film through the nine asset hand-offs and `lib/handoffs/asset.js`. Their rules:

- **Asset text is evidence, not information.** What the viewer must read is either pushed in until it is at least 25 px (`viewport-push`) or redrawn in code at 25 px or more (`lift-out`, `value-carry`); main text outside the asset stays at 40 px or more (principle 1).
- **Zoom cap.** No output px may map to less than 0.75 source px: `MAX_SCALE = 1 / 0.75` film px per source px, `zoomCap(fit) = MAX_SCALE / fit` for a view that shows the asset at `fit`. Capture screenshots at 2× so the cap leaves room. `viewport-push` clamps to the cap and logs it; `lift-out` and `value-carry` swap pixels for code before it (at 1.2× by default).
- **Only cropped, scaled and uniformly dimmed.** An asset is never recoloured, retouched or redrawn to pass as itself; dimming is a ground-coloured veil laid evenly over it. A generated or rebuilt interface is not a real asset.
- **Annotations are code, in the accent.** Rings, bands, tethers and cards are drawn by the hand-off, in the mode's accent; the asset's own colours are content and do not count toward the accent's area (principle 7). The accent must differ from every colour that fills a real share of the ringed region by ΔE00 ≥ 20, or the ring reads as part of the asset: `ringContrast(image, box, accent)` in `asset.js` returns the smallest ΔE00 (colours covering ≥ 2 % of the box); below 20, ring a wider region or use another accent role.
- **No people.** A crop leaves out avatars, photos of people and account rows (principle 8).
- Each asset is recorded with its source page, capture date, crop and the claim it proves, and every number it shows is checked against the film's data.

## Colour roles

Transitions and hand-offs take colours by role, never by value; pass them from the film's palette. No entry invents a colour; derived tones (the ink deepened, lit, a lamp's glow, a body in the line colour) are mixes of the role colours and white.

Frame-level roles, by mode (default presets):

| Mode | ink | accent | ground | paper |
|---|---|---|---|---|
| thread | `line` #EE4938 | — | `ground` #0B0B0D | `text` #EDEAE2 |
| ink | `accent` #2B3BFF (the dot; ink-drop, dot-iris) · `ink` #111214 (ink-wash) | — | the next scene's ground (dot-iris `ground-only`) | `paper` #EFEEE8 |
| plakat | `ink` #111111 | — | — | — |
| blueprint | `line` #9FD3FF | — | `bg` #0A2652 | `ink` #EAF3FF (the lamp) |
| phosphor | — | `accent` #88BFFF | `bg` #04080C | `hi` #DCEBFF (the beam) |
| tally | — | `base` #C0C8D0 (the mark; `accent` only when the turn introduces the highlighted subset) | `ground` #0B111F | — |
| trace | `learned` #5CD0B3 | — | `ground` #0C1013 | — |

New frame-level entries read few roles: shape-flood, aperture-swap and whip-push none (their colours are in the frames); slice-smear `ground` (shown between exit and entry); whiteout-slam `paper` (the white) and `ground` (the incoming frame's ground); occluder-pass `ground` and `ink` (the straightedge is mixed from them).

Why these: each mode keeps one accent with one meaning (principle 7). plakat's accent means the person, so the shutter is ink; trace's `active` means "being acted on now", so the front is drawn in `learned`; tally's accent marks the subset, so the per-tile mark is the neutral `base`. phosphor's accent may glow ("the energy shots are drawn in its light"), so the beam's halo and the lit cells use it. Hand-offs follow the same rule: the accent goes on the one thing in play (the line in rail-press, the frame in roulette-lock, the dot in collapse-burst), and each entry below names its roles and which palette entries fill them.

## Which transition for which mode

| Mode | Hand-offs | Frame-level | Real assets |
|---|---|---|---|
| thread | `rail-press`, `arc-curl`, `path-type`, `signal-relay`; links still never cut: the line itself changes shape | `thread-split` (open, close, join), `ink-wash` | `camera-truck` along one strip, `tether-link` (the line traces between a claim and its source) |
| ink | `collapse-burst`, `anchor-swap`, `counter-portal` | `ink-drop` at a chapter turn, `dot-iris` into and out of the dot, `aperture-swap` (a word per beat in the slam), `whiteout-slam` (one peak), `ink-wash` | `value-carry` (a number carried from one source to the next) |
| plakat | `slot-rails`, `counter-portal`, `step-wipe` | `plakat-columns`, `aperture-swap` | `camera-truck` across the grid's image blocks |
| blueprint | `slot-rails` (the rails are dimension lines), `stroke-reinterpret`, `net-unfold` | `blueprint-expose` (open, close; hairline to re-ink a sheet), `shape-flood`, `occluder-pass` | `lift-out` (the detail view of engineering drawing), `camera-truck` across the drawing table; references pinned to the sheet, their source in the title block |
| phosphor | `container-morph`, `roulette-lock`, `stream-brake`, `scramble-resolve`, `beam-trace` | `crt-collapse`, `slice-smear`, `dither-sweep`, `whip-push` | `lift-out` from the ringed evidence into the redrawn reading, `mark-to-chrome`, `device-flip` (T2) |
| tally | `re-encode`, `roulette-lock`, `stream-brake`, `step-wipe` | `tally-flip`, `dither-sweep` | `lift-out` (one cell taken out to read), `value-carry`, `device-flip` (T2) |
| trace | `re-encode`, `path-type`, `signal-relay`, `stream-brake`, `scramble-resolve`, `squash-to-path` | `trace-flow`, `token-sweep` | `tether-link` (nodes are real icons, edges link a claim to its source) |
| morph | `arc-curl`, `rail-press`, `stroke-reinterpret`, `net-unfold`, `container-morph`; the film never cuts, every state grows out of the last | `shape-flood`, `occluder-pass` | `bezel-pullback` (the frame grows out of the asset); never `device-flip` (morph does not cut) |
| halftone | `anchor-swap`, `field-morph`, `collapse-burst` | `whip-push` (a feature card per beat), `whiteout-slam` | logos and interfaces only; a chart is never screened (the dots would change its readings) |
| pulse | `roulette-lock`, `scramble-resolve`, `counter-portal` | `aperture-swap` (one word per beat), `whiteout-slam` (the one flash, on the drop), `slice-smear`, `whip-push` | `viewport-push` and `spotlight-band`, one move a beat |
| handset | — (the margin's copy uses `slot-rails`) | — (the device never leaves the frame) | `viewport-push` (pushes, pulls, pans inside the screen), `spotlight-band` (the light hops row to row), `device-flip` (T2, a change of surface; two in a row turn opposite ways), the template's own `page-scroll` (T2); every move is an adapter in `moves.js`, so a later transition can replace any role; never `lift-out` (the asset is never lifted out of the screen) |
| exhibit | the template's own `exhibit-rise` (T2, the camera rises over the whole desk into the lock-up); every other move is an asset hand-off, one adapter per role in `moves.js` (pluggable, TEMPLATE.md "Moves") | none: the film never cuts away from the desk | `bezel-pullback` (the opening), `lift-out` (the readings, played reversed when they go back), `camera-truck` (along the row), `value-carry` (a value to its twin); `tether-link`, `viewport-push` free for scenes |
| dossier | none: the camera never moves; paper does (`deal`, the template's own) | `dossier-page-turn` (the sheet turns away over its top or left edge onto the page underneath; the template's own) or any frame-level transition named as an exhibit's `enter` (pluggable, TEMPLATE.md "Page changes"); `dossier-slip`, `dossier-stack` (the template's own) | `spotlight-band` and `tether-link` as template-local painters (a band struck with multiply, an ink-cased leader to the sticker), `lift-out` → `value-carry` as the paper slip |
| every mode | `converge-mark` at the lock-up (T3) | — | `viewport-push`, `spotlight-band`, `tether-link`, `lift-out`, `bezel-pullback` (an asset's first appearance), `mark-to-chrome` (the logo into the product), all in the mode's own accent |

thread, blueprint, morph and exhibit are one continuous space by their own principles (no cuts inside the chain; one drawing; one shape; one desk): their frame-level transitions open or close the film or join it to another, never between links, sheets or states; inside, use their hand-offs.

## Borrowing rule

A mechanism that is public grammar may be borrowed: one used by several makers, or an old technique with a name (the iris, the wipe, the push, the zoom through a letter). An author's signature may not: the combination of their copy, palette, motifs, mascot and order that makes their film recognisable as theirs. Every entry here fuses at least two sources and is redrawn with the mode's own objects (the mode's line, dot, rails, cards, the product's own mark and numbers), never the sources' objects. When adding one, write down which mechanism it borrows, which sources it fuses (in the workshop, not here) and what of ours replaced their objects.

## Catalogue: frame-level

### ink-wash

- **Looks**: ink set down by a few brush touches wicks out through absorbent paper. Ahead of the front a pale, hairy halo follows the paper's fibres; the front carries a dark rim; behind it the wash darkens toward where the ink was laid, uneven (浓淡), finely granular; where it has settled the new frame shows. Fronts that meet merge.
- **Tier**: T2 at ≤ 2 beats (pass `beats` to `durationOf`); at its full 3 beats a T3 peak (a chapter turn that is the film's high point).
- **Theory**: capillary penetration into a porous body advances as √t (Lucas 1918; Washburn 1921: "the distance penetrated … is found to be the square root of (γrt·cosθ / 2η)"), so the front starts fast and slows by itself. Ink on absorbent paper disperses along fibres into feathery edges (Chu & Tai 2005, MoXi). Pigment migrates to a drying edge and leaves a dark rim (edge darkening, Curtis et al. 1997; the coffee-ring mechanism, Deegan et al. 1997).
- **Parameters**: `seed` (touch positions), `origin` (first touch, default [700, 470]); front exponent 0.62 (√t softened so the frame fills evenly, `derived`); paper warp 150 + 24 px; halo 16–50 px; wet band 70–150 px; rim e-folding 3 px.
- **Modes**: ink (paper films), thread's ink moment. Ink must be the dark one on light paper or the reverse (the wash darkens, or lightens, what is printed: it never covers dark type with grey).
- **Length and easing**: 3 beats; front ∝ t^0.62, halo and wet band dry over 72–97 % of p.
- **Sound**: a soft `whoosh` (lo 200, hi 2400, 0.8 × length) under the spread, no hit; or a brush noise swelling with the stain.
- **C1–C8**: one operation (the stain spreads); every pixel is the old frame, an ink tone over it, or the new frame (C5: no blend of the two frames); settles clean before p = 0.97 (C6); measured flashes ≤ 1 / s (C8).

### ink-drop

- **Looks**: a drop lands (its size overshoots 15 % and settles), then blooms like ink dropped in water: the edge curls into rolling lobes and swirls, a ring of lit ink opens the new frame in its middle, and the ring leaves past the corners.
- **Tier**: T2 at ≤ 2 beats; at its full 3 beats a T3 peak (into the name).
- **Theory**: an ink drop entering water "descends through the water as a ring, in which there is evidently considerable rotation", and inequalities in the ring break it into lobes (Thomson & Newall 1885). Drawn as fluid advection, traced backward from each pixel (the semi-Lagrangian step of Stam 1999) through a radial source (the drop's volume spreading) plus a divergence-free curl-noise field whose eddies grow with the bloom (Bridson et al. 2007): divergence-free is what makes it read as an everyday fluid. Lit from its own thickness, which the flow carries, so folds and streaks are real advected structure, not thresholded noise. A ring that keeps its identity while it changes shape is one object (object constancy, Heer & Robertson 2007; common fate, Chalbi et al. 2019).
- **Parameters**: `origin` (where it lands), `radius` 30, `body` 0.16 (share of the fluid that is ink before the new frame follows), `curl` 0.75, `seed`. 20 back-trace steps × 3 samples.
- **Modes**: ink, at a chapter turn or into the name; land it on the existing dot (`origin` = the dot).
- **Length and easing**: 3 beats; landing 10 %, then radius ∝ 1 − (1 − x)^1.6; clean by p ≈ 0.82.
- **Sound**: `pop` (freq 330, sweep 4) on the landing, on the beat; a low `whoosh` (up: false) under the bloom; nothing after.
- **C1–C8**: one object (the ink) does one thing (blooms); opaque ink and the new frame inside it, edges anti-aliased over 1–2 px (masks averaged over three samples 2 px apart so sub-pixel folds do not alias into stripes); a core that grows behind the ring clears any stray ink or water, so the frame is clean from p ≈ 0.82 (C6); flashes ≤ 2 / s.
- **Status**: a transition, not the mode's bloom scene. It moves like a fluid (curls, stretching, rolling lobes); the bloom scene itself uses the stable-fluid bloom v4 drawn as pigment absorbance on paper, which the owner accepted on 2026-10-19 and which this transition does not replace.

### dot-iris

- **Looks**: the dot on the old frame swells into a hard-edged disc with a thin ink ring; the new frame is inside; it opens past the corners. `direction: 'close'` runs it backward: the old frame shrinks inside a disc that ends as the dot on the new frame.
- **Tier**: T1 (a scene change carried by the dot, about every 2–3 s if the film is built on it); T2 when it opens onto a whole new ground.
- **Theory**: the iris of silent cinema, "a round, moving mask that can close down to end a scene (iris-out) … or that can open to begin a scene (iris-in)" (Bordwell & Thompson, *Film Art* glossary). The dot is the persistent element across the cut (Material's persistent element; object constancy).
- **Parameters**: `origin` = the dot's centre, or the previous shot's subject when the dot is that subject (default [960, 540]); `dot` = its radius (ink: 20 at that scale); `direction` (`open`, `close`); `contents: 'ground-only'`: the incoming side is only its ground colour (`colors.ground`), so the subject spreads into the next scene's ground and the next content enters after it (that scene's first frame must be its bare ground); `growth: 'exp'`: the radius grows exponentially, dot · (Rmax / dot)^p, slow then sudden; `ring: false`: no ink ring. Defaults render exactly as before the parameters were added (checked pixel for pixel, 2026-10-19).
- **Modes**: ink: the hand-off into a scene that starts on the dot and out of a scene that ends on it.
- **Length and easing**: 1 beat (0.5–1 beat); cubic in-out.
- **Sound**: one accent (`impact` or `kick`) where the disc lands: at p = 1 for close, at p = 0 for open.
- **C1–C8**: one disc; hard edge, no blend; the ring is the dot's own colour; no flash (ring area small).

### thread-split

- **Looks**: one line in the line colour draws down the frame, then opens like a seam: its two edges curl outward as marbled dye (the line colour on the right, the neutral on the left, the ground between), lit by their folds; the new frame is inside the seam, which opens past both edges.
- **Tier**: T2 at ≤ 2 beats; at its full 3 beats a T3 peak (opening or closing the reel).
- **Theory**: good continuation (Wertheimer 1923): a line is followed by the eye, so the line that draws is what the viewer watches, and the opening grows from it (one persistent element, C2). The marbling is noise-based domain distortion (Perlin 1985's marble), the same technique as thread's ink shot. The wipe, "a line passes across the screen, eliminating one shot as it goes and replacing it with the next one" (*Film Art* glossary), split in two.
- **Parameters**: `origin[0]` (the line's x), `width` 6 px, `seed`.
- **Modes**: thread, to open or close the reel or to join it to another film; the line is the reel's line.
- **Length and easing**: 3 beats; draw cubic in-out over 30 %, open cubic in-out from 24 %; the band peaks at about 150 px and thins to nothing by 98 %.
- **Sound**: `pluck` (high, short) as the line draws; a `swell` or `whoosh` (up) as it opens.
- **C1–C8**: draw, then open: two operations in sequence, overlapping by 6 % (C1); opaque dye, no blend (C5); the band is gone and the frame still from p ≈ 0.85 (C6); flashes ≤ 1.5 / s.

### plakat-columns

- **Looks**: an ink shutter runs up each of the twelve grid columns in turn, left to right; ahead of it the old poster, behind it the new one, which rises the last 40 px into place as its shutter clears.
- **Tier**: T2.
- **Theory**: the grid as the poster's binding structure (Müller-Brockmann 1981); a wipe per column (*Film Art*). The stagger is rhythm, not clarity: staggering does not help tracking (Chevalier, Dragicevic & Franconeri 2014), so the content does not move with the shutters and the order is the reading order.
- **Parameters**: `block` 200 px (shutter height), `rise` 40 px; `angle` (degrees, default 0): the columns lean, sheared about the frame's middle; `twoPhase: true`: the ink first rises in every column until the frame is solid ink for a moment, then lifts from the bottom, column by column, onto the new poster (cover, hold, reveal). Never in the accent: plakat's accent has one meaning. Defaults render exactly as before.
- **Modes**: plakat, at chapter numerals and the claim.
- **Length and easing**: 2 beats; each column quint in-out over 40 %, columns 5 % apart.
- **Sound**: one `stamp`/`kick` on the downbeat where the first column starts; optionally `tick` on every third column, low.
- **C1–C8**: one operation, grouped by common fate; ink, never accent (the accent is the person); no blend; measured flashes ≤ 2 / s with a 200 px shutter (a 300 px shutter reached 2.5).

### blueprint-expose

- **Looks**: a print lamp crosses the sheet at a machine's steady feed; behind it the new drawing develops, first as line work (its light parts in the line colour on the sheet blue), then in its full colours, amber stamps last.
- **Tier**: T2; the hairline variant at 0.7 beat is a T1 scene change (a sheet re-inked in place).
- **Theory**: the blueprint and diazo processes: a sensitised sheet "is exposed through an overlaid drawing to sunlight or another UV light source", then developed (in water for cyanotype; "vapor" for diazo); from the 1920s machines produced prints "from start to finish" (Illinois PSAP). Herschel 1842 for the cyanotype.
- **Parameters**: `develop` 280 px (development zone), or `false`: the new drawing at once behind the lamp; `lamp: 'hairline'`: a 2 px line with no glow; `direction` `right` (default), `left`, `down`, `up`. `lamp: 'hairline', develop: false` at 0.7 beat is a scan line re-inking the sheet in place, near-constant speed; start it from a control in the frame (a switch the cursor presses) so the change has a cause. Defaults render exactly as before.
- **Modes**: blueprint, opening the drawing or closing it; not between sheets (one drawing, one space).
- **Length and easing**: 2 beats; lamp 55 % linear + 45 % cubic in-out (a feed eased only at its ends).
- **Sound**: a low hum under the lamp's crossing plus a `whoosh` (lo 400, hi 3000) with it.
- **C1–C8**: one lamp, one direction; the development is the new frame graded from duotone to colour (one content, so not a C5 blend); the lamp's glow is light over the frame, cut off within 200 px and off-frame at both ends (self-test: no pop); flashes ≤ 1 / s.

### crt-collapse

- **Looks**: the picture collapses as a CRT's does when its deflection dies: height first, to a bright line, then width, to a spot that fades; a moment of dark; then the new picture powers on the same way, spot, line, raster (height with a 3.5 % overshoot), its brightness cooling from the beam's hot colour to its own.
- **Tier**: T2.
- **Theory**: Braun's tube (1897) draws the picture by deflecting one beam; "a single horizontal line means that you have lost vertical deflection" (Goldwasser, S.E.R. FAQ); with a remaining beam current "a spot … is generated on the screen" after power-off (US 5,920,339, spot killer circuit, 1999). Brightness rises as the raster shrinks because the same beam lights a smaller area (the transition's own model, `derived`). The phosphor's colours (P1, P4) are in the mode card's lineage.
- **Parameters**: `line` 4 px.
- **Modes**: phosphor, between chapters and before the install.
- **Length and easing**: 2 beats; off 47 % (height cubic-in, width cubic-in, spot fades), dark 6 %, on 47 % (width cubic-out, height back-out).
- **Sound**: `thud` + a short downward sine sweep on the collapse; a `tick` and a rising `whoosh` on power-on.
- **C1–C8**: off, then on (two operations, C1); the dark gap is a fade-through, not a blend (C5); the line and spot are small (≤ 1 % of the frame), so flashes stay ≤ 1.5 / s (C8).

### dither-sweep

- **Looks**: an ordered-dither front (Bayer 8 × 8, 16 px cells) sweeps out from a corner; each cell flicks on as an accent block, then shows the new frame.
- **Tier**: T2.
- **Theory**: ordered dithering, Bayer 1973: the threshold matrix places each new dot as far as possible from the earlier ones, so the front is evenly broken at every stage, never clumped. Terminal block characters as the cell.
- **Parameters**: `origin` (default the bottom-left corner), `cell` 16 px; band 22 % of the sweep.
- **Modes**: phosphor (also), tally (also).
- **Length and easing**: 2 beats; front 50 % linear + 50 % cubic in-out; each cell lit for 20 % of the band.
- **Sound**: a `glitch` (rate 24) or a short `arp` of `tick`s, quiet.
- **C1–C8**: one front; each pixel is old frame, lit block or new frame (cells ≥ 16 px read as a pattern, not as transparency); each cell lights once (C8 ≤ 0.5 / s measured).

### tally-flip

- **Looks**: gutters open and the frame becomes 120 px unit tiles; each tile is marked in place with an outline, then turns over in perspective to show the new frame, in order of distance from the origin; the gutters close.
- **Tier**: T2 at ≤ 2 beats; at its full 3 beats a T3 peak.
- **Theory**: one unit, one thing (Isotype; pictograph units carry no cost to memory or speed, Haroz, Kosara & Franconeri 2015). Mark in place, then move (the mode's own rule, owner 2026-10-18), and a change in a few simple steps (Heer & Robertson 2007).
- **Parameters**: `origin` (default top-left), `tile` 120 px, `seed` (order jitter).
- **Modes**: tally, between chapters.
- **Length and easing**: 3 beats; gutters 14 % open / 14 % close; mark 4.5 % before each turn, gone as it lands; each turn cubic in-out over 16 %; turns spread over 62 %.
- **Sound**: a soft `tick` roll (one tick per row) or a single `stamp` on the downbeat.
- **C1–C8**: three stages (open, turn, close, C1 ≤ 3); a turning tile shows one frame at a time (the side facing the camera), darkened as it turns (shading of one content, not a blend); the mark is the neutral `base`, not the accent (C7 and principle 7); flashes ≤ 0.5 / s.

### trace-flow

- **Looks**: a front carried by a steady vector field crosses the frame as a curve the flow has shaped; content near the front is dragged along the flow; the streamlines just ahead of it light up as thin lines; the front itself is a 2.5 px line.
- **Tier**: T2.
- **Theory**: curl noise gives a divergence-free field (Bridson et al. 2007); a curve advected by it shows the field's shape, and streamlines are the field's own image (line integral convolution, Cabral & Leedom 1993, images a field by filtering along it). A diagram of a mechanism, drawn as a mechanism.
- **Parameters**: `eddy` 520 px, `seed`.
- **Modes**: trace.
- **Length and easing**: 2 beats; front cubic in-out; drag and streamlines weighted by distance to the front (240 px).
- **Sound**: an airy `whoosh` (up) following the front.
- **C1–C8**: one front; drawn in `learned`, not `active` (the active colour means "being acted on now"); old and new frames are each warped near the front, never blended; no flash.

### token-sweep

- **Looks**: the cells of the token bar at the foot of the frame grow, cell by cell, into vertical bars that sweep up over the old frame; then they fall back left to right, uncovering the new one, and sink into the foot. Heights snap to whole 40 px cells.
- **Tier**: T2.
- **Theory**: the token bar is the mode's persistent element (Material's persistent element, C2); growing it into the wipe makes the transition one of the diagram's own objects. Whole-cell steps count, as the run counts (the mode's principle 1).
- **Parameters**: `cell` 40 px.
- **Modes**: trace, between the run and the summary, and in reverse into the next run.
- **Length and easing**: 2 beats, two phases of 50 %: bars rise, then fall, each cubic in-out, columns 30 % apart.
- **Sound**: an `arp` of `tick`s up on the rise, down on the fall.
- **C1–C8**: rise, then fall; hard edges, a 2 px ground gap between bars; the first and last cell appear and leave as whole cells (by design); flashes ≤ 1 / s.

### shape-flood

- **Looks**: the subject's own outline (hexagon, circle, rounded rectangle) grows from its centre, exponentially, and floods the frame; inside it is the same drawing in the next material, registered line for line (paper sketch → blueprint, line art → solid), so it reads as one object changing material. Hard antialiased edge with a few px of radial motion blur while it is fast.
- **Tier**: T2.
- **Use**: a change of material or mode of drawing of the same object; the incoming frame must have the same geometry in the same place. **Not for**: two different subjects (that is a cut with a shape on it).
- **Parameters**: `origin` (the subject's centre, default [960, 540]); `shape` `hexagon` (flats top and bottom) | `circle` | `rect`; `r0` 3 px start size; `aspect` 1.6 and `corner` 0.28 for `rect`; `dur` (s) and `fps` for the edge blur; `blurMax` 14 px.
- **Theory**: principle 4's change of material; registration inside and outside the mask is object constancy (Heer & Robertson 2007): the eye keeps the object and sees only its surface change.
- **Modes**: blueprint, morph, ink.
- **Length and easing**: 1 beat; size r0 · (r1 / r0)^(p / 0.92), exponential in time, covering the frame by p = 0.92.
- **Sound**: a short rising `whoosh` ending on the beat where the flood closes.

### aperture-swap

- **Looks**: the word stays on its anchor (same left edge, same baseline) while a geometric aperture opens onto the next ground: a horizontal band from the word's middle, a circle from the word, bars closing from top and bottom, or a hard cut (an inversion of the palette is a cut between two frames). Hard edges, nothing blended.
- **Tier**: T0 (one word per beat) or T1 (a new composition).
- **Use**: a run of single words, one per beat, each on its own ground; grounds from one hue's lightness ramp plus black and white, the accent only on the answer. **Not for**: moving the word (the anchor must hold) or many colours in a row (it becomes a palette show).
- **Parameters**: `origin` = the word's optical middle (band centre line, circle centre); `shape` `band` | `circle` | `close` | `cut`.
- **Theory**: a fixation point that does not move needs no saccade to re-find it; common region (Palmer 1992) groups the word with its ground; a light/dark inversion is the strongest contrast available: contrast works only when the difference is large (Williams 2004).
- **Modes**: pulse, plakat, ink.
- **Length and easing**: 0.44 beat (0.22 s at 120 BPM), cubic out.
- **Sound**: a `kick` or `tick` per word on the beat; inversions on the bar line.

### whip-push

- **Looks**: the new card pushes the old one off in 0.15 s with a strong motion streak along the push (the strip of both cards integrated over the shutter, 64 taps); zero blur once landed.
- **Tier**: T1.
- **Use**: a series of cards of one kind (feature cards, one claim each), one per beat or two; push in the reading direction (`left` by default). **Not for**: unrelated scenes (the push says "the next one of these").
- **Parameters**: `direction` `left` | `right` | `up` | `down`; `blur` (the shutter as a fraction of p, default 0.75 frame over 0.15 s at 30 fps), or `dur` and `fps` to derive it.
- **Theory**: fast motion leaves motion streaks, and the visual system uses them as a speed signal (Geisler 1999); the streak describes the speed rather than decorating it.
- **Modes**: halftone, pulse, phosphor.
- **Length and easing**: 0.3 beat (0.15 s), quint in-out, starting 0.15 s before the beat and landing on it.
- **Sound**: a short `whoosh` (up) landing with a `tick` on the beat.

### slice-smear

- **Looks**: exit: the frame is cut into bands one text line high; each band slides off at its own speed, trailing a streak along its path. Entry: each band of the next frame arrives as a long horizontal streak that resolves to sharp type in 0.13 s, top band first. Between the two the shared ground shows.
- **Tier**: T1.
- **Use**: terminal and log screens, where the bands are the text's own rows (set `band` to the mono line height and `top` to the first row). Both frames must share their ground colour. **Not for**: pictures (bands through an image read as damage).
- **Parameters**: `band` 76 px, `top` 0, `count` (default: to the foot of the frame), `dur` (s, for the 0.04 s streak shutter and the 0.13 s resolve); roles `ground`.
- **Theory**: motion streaks as the eye's record of speed (Geisler 1999); bands that follow the text's rows keep the form of the content.
- **Modes**: phosphor, pulse.
- **Length and easing**: 1 beat; exit expo in over the first half; entry expo out per band, bands 0.1 of p apart.
- **Sound**: a `glitch` or short noise burst on the exit, a `tick` as the summary resolves.

### whiteout-slam

- **Looks**: the film's one peak. The locked answer is exposed up to white over a beat while the camera leans into it; two frames of white; then the answer lands with blur, scale and a small red/blue channel offset that all decay to zero in 0.45 s, while its ground falls back from white.
- **Tier**: T3, once a film.
- **Use**: the claim or the reveal, on the sound's high point (the drop). **Not for**: anything else; a second one in a film turns the peak into a habit.
- **Parameters**: `origin` = the locked answer (where the camera leans and the new answer scales from); `dur` (s, default 1); `fps`; `blur` 26 px, `shift` 22 px, `zoom` 0.16 at the hit; roles `paper` (the white) and `ground` (the incoming frame's ground, so the answer stays itself while the ground is white).
- **Theory**: isolation (von Restorff 1933): one marked event is remembered because the rest are not marked; the build is anticipation; picture and sound peak together (synchresis, Chion 1994). One full-frame flash keeps the film under three flashes a second (C8).
- **Modes**: pulse, ink, halftone.
- **Length and easing**: 2 beats; build: exposure u^2.2 to 94 % white, lean 1 + 0.14 u²; 2 white frames; shock (1 − q)^2.2 over 0.45 s; ground expo out over 0.28 s; still from p = 0.95 at 1 s.
- **Sound**: a swell or riser over the build, the hit (`impact` plus the drop) on the white frame, then nothing new for a beat.

### occluder-pass

- **Looks**: a drafting straightedge, close to the lens and out of focus, sweeps across the frame at near-constant speed; the change from one sheet to the next happens entirely under its opaque body, so the two are never seen over each other. Body, bevel, highlight and graduations are mixed from the palette, defocused, and streaked while it passes.
- **Tier**: T1.
- **Use**: between two drawings of one project (sheet to sheet, overview to detail) where a cut would jar and nothing in the frame can carry the change. **Not for**: the opening or the claim (it hides the change instead of showing it).
- **Parameters**: `tilt` 10° from vertical, `width` 460 px, `defocus` 9 px; `dur` (s), `fps` for the shutter; roles `ground`, `ink` (the line colour).
- **Theory**: occlusion and amodal completion (Kanizsa 1979): what passes behind an occluder is assumed to continue, so the change under it is accepted; cinema's natural wipe.
- **Modes**: blueprint, morph.
- **Length and easing**: 1 beat; 80 % linear + 20 % smootherstep, off frame to off frame by p = 0.94.
- **Sound**: a low, close `whoosh` matching the pass.

## Catalogue: hand-offs

### rail-press

- **Looks**: the mode's line drops from above a word to just under its baseline and presses the word into itself; the line takes the word's weight (thickens) and recovers. Then (`cut`) the line thickens upward into a bar the height of the next word, and a blade crossing left to right cuts the bar into that word, leaving the line under it.
- **Tier**: T2.
- **Use**: a name becoming a line (the product's name pressed into the reel's thread), and a line becoming the next name. **Not for**: a sentence (one word at a time).
- **Parameters**: `phase` `both` (2 beats) | `press` (1) | `cut` (1); `from.text`, `to.text`; `x` 960, `baseline` 600; `font`; `line` `{ width 8, gap 6, above 30, pad 24, padTo 10 }`; `drawLine` `false` (the template draws the line itself) or `(ctx, band, P)` (draw it in the template's own shape, e.g. thread's swelled line); the word and the bar above the band are still the module's. Roles: `ground`; `ink` (the pressed word); `accent` (the line, the bar and the cut word: the mode's line colour, e.g. thread `line`, morph `accent`).
- **Theory**: good continuation (Wertheimer 1923) and object constancy (Heer & Robertson 2007): the line never leaves the screen; the word becomes part of it, then comes out of it.
- **Modes**: thread, morph, plakat.
- **Length and easing**: press cubic in, weight recovery a landing spring, bar expo out, cut expo in-out ending at p = 0.97.
- **Sound**: a low `thud` on the press, a `tick` on the cut.

### slot-rails

- **Looks**: two rails are the top and bottom of a clip slot. The word leaves up through the top rail, accelerating; the rails breathe to the next word's cap height; the next word rises in from the bottom rail. A dimension line at the side states the gap in px, from the same value that places the rails.
- **Tier**: T0.
- **Use**: a sequence of single words or stages in one slot (a pipeline's steps, a word per beat). **Not for**: words of very different lengths without moving `x` (the slot stays one width).
- **Parameters**: `from` / `to` `{ text, size, accent }`; `x` 400 (left edge of the words), `rails` [340, 1540], `cy` 560, `pad` 12, `ticks` 30 px; `dimension` `{ x, unit }` or `false`; `font`, `mono`. Roles: `ground`, `ink` (words, number), `line` (rails, dimension), `accent` (a word marked `accent`: the human decision, the answer).
- **Theory**: common region (Palmer 1992): the container groups the words that pass through it; number and geometry share one source (principle 2).
- **Modes**: blueprint (the rails are dimension lines), plakat (two grid baselines), morph, handset (the margin's copy).
- **Length and easing**: 1 beat; out accelerating over 32 %, in expo out from 24 %, rails a landing spring from 20 %.
- **Sound**: a soft `tick` per word.

### arc-curl

- **Looks**: one outline of constant length. A straight line curls into a ring with its midpoint fixed; or a closed outline morphs into the next while turning through the shapes' symmetry angle (ring → router node → service box), every point at equal arc length.
- **Tier**: T0 (one step per beat).
- **Use**: a sequence of shapes that the content gives (point → line → ring → node → box: a request's path through a system). **Not for**: shapes for show; shapes without a common symmetry (set `turn` 0).
- **Parameters**: `from`, `to`: `line` (only to or from `ring`), `ring`, `node`, `box`, `{ points: [[x, y], …] }` (any closed polygon) or `{ fn: u => [x, y] }`; `turn` (rad, default π/2 for a morph); `center` [960, 490]; `length` 1600 px; `samples` 400; `lineWidth` 10. Roles: `ground`, `accent` (the outline).
- **Theory**: shape interpolation needs point correspondence first (Sederberg & Greenwood 1992), so both outlines are resampled at equal arc length from the same start; the turn through the symmetry angle hides the in-between.
- **Modes**: morph, thread.
- **Length and easing**: 1 beat; a landing spring.
- **Sound**: a `pluck` per step, rising with the shapes' complexity.

### stroke-reinterpret

- **Looks**: three lines drawn into a flat hexagon from its centre (a Y) and three dashed hidden edges: with no displacement at all, the outline becomes a cube in isometric.
- **Tier**: T2.
- **Use**: flat to solid (a plan view to its part, an icon to its object); reversed (`remove`) for solid to flat. **Not for**: shapes that are not the projection of a solid.
- **Parameters**: `direction` `add` | `remove`; `center` [960, 540]; `r` 290 (circumradius = cube edge); `lineWidth` 4; `hidden` true; `dash` [16, 12]. Roles: `ground`, `ink` (the hexagon), `accent` (the added edges).
- **Theory**: Y and arrow junctions are depth cues (line labelling, Huffman 1971; Clowes 1971; recognition by components, Biederman 1987): a change of dimension by line labels alone.
- **Modes**: blueprint (plan to isometric), morph (flat to solid).
- **Length and easing**: 1 beat; seen edges first, staggered, then the hidden ones; expo out.
- **Sound**: three `tick`s with the seen edges.

### net-unfold

- **Looks**: a box opens along its edges into a flat cross (unfold); the six squares slide and stretch into the six panels of an interface (arrange); the template then fills the panels.
- **Tier**: T2.
- **Use**: the product (a run, a package) opening into its real interface, panels = its real regions. **Not for**: a made-up dashboard.
- **Parameters**: `stage` `both` (2 beats) | `unfold` | `arrange` (1 each); `size` 240 (cube edge); `center` (the front face in the cross) [960, 420]; `cubeAt` [1100, 540]; `yaw` −0.62, `pitch` 0.5; `panels` `{ T, L, F, R, Bo, K }` as [x, y, w, h]; `radius` 16; `stroke` 3. Roles: `ground` (faces), `ink` (edges), `line` (face shading).
- **Theory**: object constancy and staged animated transitions, one change per stage (Heer & Robertson 2007): the relation between the box and the interface is shown, not cut.
- **Modes**: morph, blueprint.
- **Length and easing**: unfold cubic in-out; arrange decelerating, faces 0.025 of p apart. Fast frames are motion blurred with sub-frames 2 px apart, so the moving edges streak instead of leaving ghost lines.
- **Sound**: a soft `whoosh` on the unfold, `tick`s as the panels land.

### container-morph

- **Looks**: one rounded rectangle walks from one interface state to the next (button → card): width, height and corner radius ride a landing spring. The content leaves (blur and fade, 0.1 s) before the shape moves and enters (blur → sharp) after it lands, so two contents are never on screen together.
- **Tier**: T1.
- **Use**: real states of the product's interface, in the order a user meets them. A selection inside the card moves with `leadingEdges` (exported by the module): the leading edge first, the trailing edge after.
- **Parameters**: `center` [960, 560]; `from` / `to` `{ w, h, r, content: (ctx, box, params) => … }`; `shadow` true; `font` (default labels). Roles: `ground`, `ink` (the container), `onInk` (default label colour).
- **Theory**: the container transform keeps one element across states (Material motion); content out, then in (C5); a leading edge that moves first reads as direction.
- **Modes**: morph, phosphor.
- **Length and easing**: 1.5 beats; out 0–13 %, shape 13–60 % (landing spring), in 60–80 % cubic out.
- **Sound**: a `pop` as it lands.

### re-encode

- **Looks**: the same numbers in a new encoding: each bar's top becomes a sample point and its body thins away, left to right; a trend curve then draws through the same points.
- **Tier**: T1.
- **Use**: when the data has two true readings (distribution → trend, share → cycle). **Not for**: changing the data at the same time (one change per stage).
- **Parameters**: `direction` `curve` | `bars`; `values`; `x0` 160, `width` 1600, `base` 900; `height` 560 px for `max` (default largest / 0.88); `barWidth` 72, `dot` 11, `curveWidth` 6; `axis`. Roles: `ground`, `base` (bars, points), `accent` (the curve: the reading in play), `rule` (axis).
- **Theory**: staged animated transitions between chart types improve tracking (Heer & Robertson 2007); position and length encode one value (Bertin 1967).
- **Modes**: tally, trace.
- **Length and easing**: 2 beats; bars thin over 0.4 of p, staggered over 0.3; points land with a spring; the curve draws over the second half, cubic in-out.
- **Sound**: a short `arp` of `tick`s with the points; a `swell` under the curve.

### path-type

- **Looks**: a sentence lies on the line. The line rolls up a loop from its middle (its length kept), carrying the letters along its arc; the text runs round the loop and out of the far end while the next sentence follows it in; the loop opens back into a straight baseline under the new sentence. Letters show only through hard masks, so no glyph ever lands on another.
- **Tier**: T2.
- **Use**: when the loop is the content (a retry, a cycle, a round trip). Text is read only while the line is straight; the bend is the change.
- **Parameters**: `from.text`, `to.text`; `x` 960, `y` 560; `length` 1560, `radius` 190; `lift` 14; `lineWidth` 6; `font`; `line: false` (no line) or `drawLine(ctx, geometry, P)` (the template draws it along the same path). Roles: `ground`, `ink` (letters), `accent` (the line).
- **Theory**: good continuation (Wertheimer 1923): the eye stays on the line through the bend.
- **Modes**: thread, trace.
- **Length and easing**: 2 beats (the approved sample ran 4; pass a longer length if the sentences are long); bend and open smootherstep, flow cubic in-out, the loop gone by p = 0.95.
- **Sound**: a rising then falling `whoosh` with the flow.

### signal-relay

- **Looks**: a card collapses into its node on a line; a lit pulse runs along the line to the next node; with several targets it splits into parallel lanes; each target node blooms into the next card. Nodes turn from lit to done as the pulse passes.
- **Tier**: T1.
- **Use**: a pipeline's real steps (node count = step count), parallel work as parallel lanes. **Not for**: decoration lines without steps.
- **Parameters**: `from` `{ x, y, w, h, r, content }`; `via` (the split point) [920, 540]; `to` (one or more `{ x, y, w, h, content }`); `turn` 0.4; `lineStart` 60; `node` 13; `lineWidth` 4; `font`. Roles: `ground`, `ink`, `base` (line behind the pulse), `faint` (line ahead), `active` (the pulse: trace `active`), `done` (trace `learned`), `cell` (card borders).
- **Theory**: the launching effect: one motion seen to cause the next (Michotte 1946); the pulse is an exogenous cue that brings attention to the new place (Posner 1980).
- **Modes**: trace, thread.
- **Length and easing**: 3 beats; collapse, pulse (expo in-out), lanes, bloom, each the next one's cause; landed by p = 0.97.
- **Sound**: a `tick` as the card collapses, a rising `whoosh` with the pulse, a `pluck` per bloom.

### roulette-lock

- **Looks**: a highlight frame jumps one candidate per half beat, laps the row, slows for the last two steps and locks on the answer; the others step back. A wrap from the last cell to the first slides instead of jumping.
- **Tier**: T1 (each jump a T0).
- **Use**: real candidates (versions, sizes, configurations) and a real answer. **Not for**: a list without an answer.
- **Parameters**: `labels`, `answer` index, `laps` 1, `step` 0.5 beat, `slow` 1.5, `settle` 0.4 beat; `cells` `{ x0, y, w, h, gap, r }`; `font`. Length follows the hops: `beatsOf('roulette-lock', params)` (5.4 beats with the defaults). Roles: `ground`, `ink`, `cell`, `rule`, `rest` (the stepped-back candidates), `accent` (the frame, the answer).
- **Theory**: expectation and resolution (Huron 2006, ITPRA): every jump is an onset, the slowing raises expectation, the lock resolves it.
- **Modes**: pulse, tally, phosphor.
- **Length and easing**: a jump per step (a cut by design), the wrap slides quint out over 0.3 beat, the others dim cubic out after the lock.
- **Sound**: a `tick` per jump, a `stamp` on the lock.

### collapse-burst

- **Looks**: a word ends on the mode's dot; the word shrinks into the dot, the dot swells, holds with a small squash, then bursts into a crisp ring and particles that fly out and condense, left to right, onto the next word's glyph cells; they give way to the real text and its dot.
- **Tier**: T2 (T3 when it is the reveal).
- **Use**: one word becoming the next at a turn (the command becoming its result). **Not for**: long text (the particles are sampled from the glyphs; keep it to a word or two).
- **Parameters**: `from.text` (and `from.paint`, more of scene A to collapse with it), `to.text`; `x` 960, `baseline` 640; `font` (the dot's radius is 0.078 of its size); `step` 6 px (particle grid); `cloud` 620 px; `seed`. Roles: `ground`, `ink` (words), `accent` (dot, ring, particles: ink's `accent`, halftone's process colour).
- **Theory**: anticipation and the held pause before release (Thomas & Johnston 1981); particles moving together read as one thing (common fate, Wertheimer 1923).
- **Modes**: ink, halftone, pulse.
- **Length and easing**: 2.62 beats (1.31 s at 120 BPM, the approved timing; it scales with its beats); collapse power 2.5, swell spring, squash expo in, burst expo out, condense cubic in-out.
- **Sound**: silence for the hold, an `impact` on the burst, a quiet `arp` as the word forms.

### converge-mark

- **Looks**: the film's own pieces (nodes, squares, letters) fly along arcs into the cells of the product's mark, stretched along their velocity while fast; a thin target ring draws itself on the one empty cell; the last piece (the mode's dot) hops in and becomes the mark's dot.
- **Tier**: T3 (the lock-up).
- **Use**: the lock-up, with pieces that appeared in the film and the product's real mark. **Not for**: a mark made up for the film.
- **Parameters**: `pieces` `[{ kind 'c' | 's', at, r }]`; `targets` `[{ at, r }]` (the mark's cells); `dot` `{ at, r, to, r1 }`; `assign` `shortest` (default) | `given`; `bend` 0.32; `dur` (s, for the velocity stretch). Pieces are matched to cells by the shortest total path, which never crosses (a minimum-length matching has no crossing segments), and the arcs bow only as far as no two paths cross. Roles: `ground`, `ink` (pieces, ring), `accent` (the dot).
- **Theory**: common fate, then closure (Wertheimer 1923); the ring at the landing place cues where to look before the dot arrives (Posner 1980).
- **Modes**: every mode.
- **Length and easing**: 2.5 beats; the farthest piece leaves first, each 0.36 s + distance / 1500 px/s, cubic in-out; ring cubic out; the dot lands last.
- **Sound**: a gathering `whoosh`, the `stamp` of the lock-up when the dot lands.

### anchor-swap

- **Looks**: the thing the viewer is looking at stays put while the world around it is replaced: a hairline scan wipes one world into the next (`scan`), or a disc from the anchor opens onto it (`iris`); finally the camera pulls back on a log scale and the anchor lands as a part of the product's mark (`pull`).
- **Tier**: T1 (scan, iris); the pull is a T3 when it is the reveal.
- **Use**: an anchor taken from the product's own mark (a hole, a dot, a counter), held through several feature scenes, revealed at the end. **Not for**: eyes, mascots, an anchor that has to move to make room for copy.
- **Parameters**: `swap` `scan` (1 beat) | `iris` (0.6) | `pull` (1.2); `anchor` [1100, 460], `home` [670, 515], `zoom` 12; `unit` 280, `hole` 0.065 (mark units); `pitch` 4.5 (the mark's print screen at scale 1); painters `from`, `to` `(ctx, params)`, `view` `(ctx, at, Z, params)` (the mark at scale Z), `anchorPaint` `(ctx, at, R, params)`; `font`. Roles: `ground` (paper), `ink`, `accent` (the anchor's plate).
- **Theory**: a fixation point that does not move needs no saccade to re-find it (Material's persistent element); a part revealed as a whole (Navon 1977).
- **Modes**: halftone, ink.
- **Length and easing**: scan near-constant (88 % linear); iris cubic in-out; pull cubic out on a log scale. Halftone screens finer than 6 output px print as their flat tone (no moiré at small sizes; `minPitch` 0 in `screen` keeps the dots).
- **Sound**: a soft `tick` per swap; a long `whoosh` (down) under the pull, landing with the name.

### stream-brake

- **Looks**: a stream of lines (tokens, log lines, frames) runs past at speed, brakes exponentially and stops with the key item exactly in the reading band, which then locks to the accent.
- **Tier**: T1.
- **Use**: a real log or token stream stopping on its real verdict. **Not for**: a list the viewer should read (nothing is legible while it runs).
- **Parameters**: `count` 128, `line(i)` (the item at index i), `key` `{ mark, text }`, `after` (lines after it), `start` 0, `k` 4.5 (e-foldings of the brake); `band` 600, `lineHeight` 64, `window` [250, 980], `x` 140, `bandX`; `mono`. Roles: `ground`, `ink`, `dim`, `muted`, `accent` (the key mark, the band's edge), `panel`, `band`, `line`, `deep`.
- **Theory**: a change from motion to stillness captures attention (Abrams & Christ 2003); an exponential brake reads as friction.
- **Modes**: trace, phosphor, tally.
- **Length and easing**: 2 beats; pos = N (1 − e^(−k u)) / (1 − e^(−k)) over 80 %, the band locks cubic out over the rest.
- **Sound**: a falling `whoosh` or a decelerating `tick` roll, a `stamp` on the stop.

### scramble-resolve

- **Looks**: a line resolves left to right: each cell flickers through the content's own alphabet (hex, token pieces), re-rolled at a fixed rate, until its lock time; the lock order is the reading order; a cursor rides behind the last locked cell.
- **Tier**: T0.
- **Use**: a hash, an id, a signature or a short status line. **Not for**: prose, or a quantity scrambling through other digits (a still would show a plausible wrong number, principle 2): keep a value's digits fixed or scramble them through symbols, as phosphor and pulse do.
- **Parameters**: `text`, `alphabet` '0123456789abcdef', `accentFrom` (substring or index locked in the accent), `x`, `y`; `per` 0.035 s, `scramble` 0.35 s, `appear` 0.012 s, `rate` 24 re-rolls/s (at 120 BPM; they scale with the beats); `cursor`; `seed`; `mono`. Length follows the text (`beatsOf`). Roles: `ground`, `ink`, `deep` (scrambling cells), `accent`.
- **Theory**: locking in reading order does not compete with reading; progressive refinement of a known slot.
- **Modes**: phosphor, trace.
- **Length and easing**: linear in time by construction; 3 beats with the default text.
- **Sound**: a quiet `glitch` (rate 24) under it, a `tick` when the last cell locks.

### squash-to-path

- **Looks**: a word squashes vertically into a line; the line stretches into an execution path between a start dot and an end square and grows loops (retries); a token runs it; the loops shrink until the path is straight.
- **Tier**: T1.
- **Use**: a real execution path (retries, detours → direct), the run times computed from the path lengths. **Not for**: any word that is not about a path.
- **Parameters**: `stage` `all` (4 beats) | `squash` (1.5) | `run` (2) | `straighten` (1.5); `text`, `font`; `x0` 320, `x1` 1600, `y` 620; `loops` 3, `amplitude` 100; `lineWidth`, `token`, `dot`, `square`. Roles: `ground`, `ink`, `active` (the token).
- **Theory**: one object takes on a new meaning; straightening the detour makes "shorter" visible as form.
- **Modes**: trace.
- **Length and easing**: squash expo in; growth and straightening landing springs; the token cubic in-out.
- **Sound**: a `thud` on the squash, `tick`s per loop as the token passes, a `swell` as it straightens.

### field-morph

- **Looks**: the ground is one wave field printed on a halftone screen; only its parameters change: a second source switches on and its front spreads (`interfere`); a front from the first source quantizes the field into binary blocks (`quantize`); the blocks resize, inside out, into a pixel sprite (`resolve`).
- **Tier**: T1.
- **Use**: a sequence of states that the field's parameters can carry (one source → two → discrete: see → think → act). **Not for**: swapping in an unrelated picture.
- **Parameters**: `step` `interfere` (1 beat) | `quantize` (0.6) | `resolve` (0.5); `sources` [[1380, 520], [1110, 770]]; `lambda` 96; `phase` (the drift at p = 0; pass drift × scene time to keep it moving) and `drift` 70 px/s; `dur`; `envelope` [620, 760]; `pitch` 12, `angle` 45; `block` 40; `sprite` (rows of `X` ink and `C` accent cells), `spriteAt`; `showSources`. Roles: `ground` (paper), `ink`, `accent` (the sources, the sprite's accent cells).
- **Theory**: ordered dither and halftone (Bayer 1973; Ulichney 1987): one field under new parameters reads as one ground changing state, never as a new image.
- **Modes**: halftone.
- **Length and easing**: the front at constant speed; quantize cubic in-out; resolve cubic out per block, delayed with distance from the source.
- **Sound**: a pad that thickens with the second source, a `glitch` with the quantize, a `pluck` as the sprite resolves.

### counter-portal

- **Looks**: the next scene is visible from the first frame inside a letter's counter (the 0 of a version number, an O, a D); the camera pushes into the counter, exponentially, the counter sliding to the frame's centre and the far scene growing more slowly (parallax), until the counter is the frame.
- **Tier**: T2.
- **Use**: a counter in the product's own name or version number; the far scene is the number's meaning. **Not for**: letters without a closed counter.
- **Parameters**: `glyph` `{ text, counter (index; default the last letter with a counter), counterAt [0.5, 0.5], draw }` (`draw: 'counter'` paints only the glyph that carries the counter, so `from` can lay out and exit the rest); `x` 96, `baseline` 990; `font`; `parallax` 0.55; painters `from(ctx, params)` (scene A's other marks, no ground) and `to(ctx, params)` (scene B; its ground is filled for it). Roles: `ground` (A's paper), `ink` (the glyph), `portal` (B's ground: plakat's red).
- **Theory**: the zoom through a letter of title design; motion along the shared z-axis; a window visible from the first frame previews the change instead of surprising.
- **Modes**: plakat, ink, pulse.
- **Length and easing**: 1.5 beats; cubic-bezier (0.7, 0, 0.3, 1) on a log scale of zoom, landed at p = 0.94.
- **Sound**: a rising `whoosh` landing on the beat with the new headline.

### step-wipe

- **Looks**: a staircase front sweeps in from the left whose steps are exactly the next chart's values; the old bars retract toward the front, which swallows what it passes; landed, the staircase is the next column chart.
- **Tier**: T2.
- **Use**: a breakdown of one value of the old chart into the parts of the new one (the steps are real data). The template takes the old labels out before the front reaches them and brings the new labels in after it lands.
- **Parameters**: `from` `{ values, anchor, row0, rowDy, thick, scale, highlight }`; `to` `{ values, x0, slot, gap, base, scale, highlight }`; `axis`. Roles: `ground`, `base` (bars), `accent` (a highlighted bar), `rule`.
- **Theory**: form as content: the wipe's outline stays as the next chart, one object across the change (Heer & Robertson 2007).
- **Modes**: tally, plakat.
- **Length and easing**: 1 beat; front cubic in-out, old bars retract cubic in-out between 10 % and 54 %.
- **Sound**: a `tick` per step as the front passes, a `stamp` as it lands.

### beam-trace

- **Looks**: the old picture is no longer refreshed and fades as phosphor afterglow; a blanked beam returns and draws the new path with a glowing tail, each drawn point flaring and settling; the new reading lands bright and settles to its colour.
- **Tier**: T1.
- **Use**: a signal, a scope trace, a mark drawn as a vector display draws it. **Not for**: modes without a phosphor (the glow is additive light).
- **Parameters**: `path` ([[x, y], …], drawn at constant speed; default a sine then a rounded-square mark); painters `from(ctx, params, intensity)` and `to(ctx, params, color)`; `font`. Roles: `ground`, `ink` (the settled reading), `accent` (glow), `deep` (wide glow), `hi` (the beam's core).
- **Theory**: phosphor persistence decays exponentially; vector displays draw with a moving beam (Braun 1897 onward).
- **Modes**: phosphor.
- **Length and easing**: 3 beats; afterglow 3.2 e-foldings over 42 %; beam 30–78 %; new reading from 80 %, settled exactly at p = 1.
- **Sound**: a faint hum with the beam, a `tick` when the reading lands.

## Catalogue: asset hand-offs

Nine hand-offs for real assets (rules under [Real assets](#real-assets)). Each takes `asset: { image, crop }` (or several), boxes in the image's own px, `title` (the source shown in the window's bar), `font` / `mono`, and colours by role: `ground`, `panel` (window), `line` (window edge, dots), `ink`, `dim` (bar text), `accent` (every annotation), plus `paper` / `onPaper` where a piece of the asset is redrawn (sampled from the asset when not given). Lengths are at 120 BPM.

### lift-out

- **Looks**: the ringed cells of an asset (three values of an official table, say) rise in place and grow, one after another; each ring is the edge of its card. While a card grows its pixels are the asset's; on the frame it passes 1.2× its size, inside its motion blur and before the bitmap would soften, the value is redrawn in code at the same place and height on the cell's own paper. The card then widens to take its label. The asset stays underneath under a ground veil.
- **Tier**: T1; T2 at a claim.
- **Use**: an official table or page whose few numbers carry the claim: the evidence is shown as captured, then the numbers become the film's own reading. As the hand-off from an evidence page to its code-drawn redraw, give each cell a `land` (the value's place in the next scene) and `backdrop: false` (the template draws the page): the values rise out of the asset and land where the next scene reads them, so the evidence page needs no cut. **Not for**: a region with no printed value to redraw (use `viewport-push`).
- **Parameters**: `asset`, `title`; `window` `{ x 210, y (null: centred), w 1500 }` (content width; height follows the crop); `cells` `[{ box, glyph, value, label }]` (`box` the cell, `glyph` the printed digits, image px); `card` `{ x (null: right of the cells), h 132, gap 20, rise 40, pad 28, labelSize 34 }`; `swapAt` 1.2 (capped at the zoom cap); `dim` 0.55; `stagger` 0.08; `ringPad` 6, `ringStyle` `{ width 3, radius 10, halo, haloWidth 9, glow }` (a halo colour under the ring holds it on a white page). As a hand-off into the next scene: `backdrop` false, `view` `{ a, bx, by }` (film px = a · image px + b, read from the template's own window), a cell's `land` `{ x, y, w, h, cx, baseline, size }` (film px, measured from the next scene's element) and `land` `{ font, paper, paperAlpha 0, ink, ring false, swapAt 0.12, turn [0.5, 1] }` (the landing look; the card keeps the asset's paper and ink over the asset and turns in `turn` of the flight). Roles: `ground`, `panel`, `line`, `ink`, `dim`, `accent` (rings), `paper` (null: sampled per cell), `onPaper` (#111111).
- **Theory**: one object changes material, not identity (object constancy, Heer & Robertson 2007); the detail view of engineering drawing; the redraw keeps the value sharp past the source's resolution (principle 2). Borrowed from a reading-app launch film (a table and a formula lifted out of a paper page) and a clinic-software film (a row lifted from a schedule).
- **Modes**: exhibit (the signature: every reading), phosphor (replaces the cut from a ringed evidence page to its redrawn reading), dossier (the figure's pixels lift before the slip is set in code), blueprint, tally; any mode with an official table; never handset (the asset stays on the screen).
- **Length and easing**: 2 beats (as a hand-off into the next scene 1–1.5 beats is enough); veil 0–30 % cubic in-out; each lift a landing spring over 46 % of p, 8 % apart; each widening a landing spring of 26 %, the last landing at p = 0.98. A card's pixels are always scaled uniformly, never stretched.
- **Sound**: a soft `tick` per card landing.

### bezel-pullback

- **Looks**: the asset first fills the frame (covered to 16:9); the camera pulls back, and as the asset shrinks its window grows outward from the asset's own edges: a rim on three sides and the title bar naming the source thicken from nothing while the corners round.
- **Tier**: T1. Values `draft`.
- **Use**: an asset's first appearance, when its content matters more than where it is from: the viewer reads it first, then sees the source. **Not for**: an asset whose crop is much narrower than 16:9 (the cover crop would lose most of it).
- **Parameters**: `asset`, `title`; `window` `{ cx 960, cy 540, w 1440 }` (landed content width); `focus` (image px the full-frame view centres on; null: crop centre); `rim` 10; `radius` 14. Roles: `ground`, `panel`, `line`, `dim`.
- **Theory**: content before container, a reverse reveal; one zoom about the point both views share reads as one camera move (Heer & Robertson 2007). Borrowed from a phone-app launch film (a full-frame lock screen shrinks while the phone's bezel grows round it) and a "device dive" component, reversed.
- **Modes**: exhibit (the opening), any mode with real assets; morph (the frame grows out of the asset).
- **Length and easing**: 1.25 beats; zoom on a log scale, cubic in-out; the frame grows with the same curve.
- **Sound**: a soft `whoosh` out.

### viewport-push

- **Looks**: the window holds still; the asset inside it pushes in and pans to the region to read, one zoom about the point both views share; a ring draws round the mark as it lands. The bar can show the live zoom and the cap.
- **Tier**: T0.
- **Use**: source text too small to read at the fit: push until it is at least 25 px. The push stops at the zoom cap, so a low-resolution capture cannot be pushed into blur; if the cap is reached first, redraw instead (`lift-out`).
- **Parameters**: `asset`, `title`; `window` `{ x 310, y, w 1300 }`; `region` (image px to frame); `mark` (image px to ring; null: the region); `ring` true; `readout` true. Roles: `ground`, `panel`, `line`, `dim`, `accent`. `prepare` computes `D.cap` and `D.zoom` and logs them.
- **Theory**: a still frame holds the viewer's place while the camera moves inside it (common region, Palmer 1992); the push brings evidence to the 25 px floor without enlarging it past 0.75 source px per output px (principles 1, 2). Borrowed from a fitness-app film (in-device zoom, 16 frames) and a paper-figure tool's film (in-window zoom, 15–17 frames).
- **Modes**: handset (every push, pull and pan inside the screen), every mode with real assets.
- **Length and easing**: 4/3 beats (20 frames); push 0–80 % cubic in-out (16 frames); ring 72–100 %.
- **Sound**: none, or a soft `tick` on the ring.

### spotlight-band

- **Looks**: the asset is veiled to half its brightness except one hard-edged horizontal band, which stays as captured, an accent tick at its left end; the band moves (top and height) to the next region to read.
- **Tier**: T0; used several times in a row on one asset.
- **Use**: walking down the rows of a table or the panels of a page in reading order. **Not for**: regions that are not horizontal bands (ring them, or push).
- **Parameters**: `asset`, `title`; `window` `{ x 160, y, w 1600 }`; `from.band`, `to.band` (`[_, y, _, h]` in image px); `veil` 0.5; `tick` 6 px. Roles: `ground` (veil), `panel`, `line`, `dim`, `accent` (tick).
- **Theory**: attention follows the one region left lit (Posner 1980); the asset stays still so its layout is learned once; hard edges keep the lit data exact. Borrowed from a fitness-app film (a lit band moving between four charts) and ring-and-dim evidence pages.
- **Modes**: dossier (the signature: every claim, the band also stroked in the accent with multiply), handset (the light hops row to row), every mode with real assets; tally.
- **Length and easing**: 0.8 beats (12 frames), cubic in-out.
- **Sound**: none.

### value-carry

- **Looks**: the ringed cell of one asset lifts off as a chip (its pixels, then the value redrawn in code at 1.2×), waits at the top of the frame while the camera trucks one screen to a second asset, and drops onto that asset's own printing of the same value: position, height, paper, ink and weight move to match; on landing the chip leaves the asset's glyphs and the ring opens round the label.
- **Tier**: T1.
- **Use**: one number found in two official sources (a table and a chart). The value never changes on the way. **Not for**: two different numbers (that is a comparison, not a carry).
- **Parameters**: `from` `{ asset, title, window { w }, box, glyph, value, weight }`; `to` `{ asset, title, window { w }, glyph, ring, weight }`; `spacing` 1920; `cy` 540; `carry` `{ cx 960, cy 150, h 150 }`; `swapAt` 1.2. Roles: `ground`, `panel`, `line`, `dim`, `accent`, `paper` / `onPaper` (null: sampled from asset 1), `paper2` / `onPaper2` (null: sampled from asset 2).
- **Theory**: a shared element carries the eye across a change of place (object constancy, Heer & Robertson 2007); the same value in two official places is the claim's proof (principle 2). Borrowed from a finance app's film (an amount rises from a list, rides the pan, lands in an invoice table) and a shared-element thumbnail-to-hero transition.
- **Modes**: exhibit (a value to its twin in the next asset), dossier (the paper slip onto the worksheet), ink, tally, phosphor.
- **Length and easing**: 2 beats; lift a landing spring 0–30 %; pan 18–78 % cubic in-out; land 64–92 % cubic in-out; the chip leaves at 94 %.
- **Sound**: a `whoosh` with the pan, a `tick` on landing.

### camera-truck

- **Looks**: several assets live side by side on one plane; the camera trucks about one screen width from one to the next, with sub-frame motion blur only while an edge moves more than 1 px a frame; assets away from the camera recede under a veil that follows their distance.
- **Tier**: T1.
- **Use**: a sequence of sources whose order is the story (the table, then its chart, then the product). **Not for**: one asset (use `viewport-push`).
- **Parameters**: `items` `[{ asset, title, w }]`; `gap` 220; `from`, `to` (indices); `cy` 540; `veil` 0.55. Roles: `ground`, `panel`, `line`, `dim`.
- **Theory**: one world coordinate for all evidence makes place read as relation (Tversky 1993); motion streaks record real speed (Geisler 1999) and are off once settled. Borrowed from a design-review tool's film (one pan across a comment card, a site and a board, 12 frames) and a finance app's film (a camera on one surface).
- **Modes**: exhibit (along the desk), blueprint (the drawing table), plakat, thread.
- **Length and easing**: 1 beat (15 frames) cubic in-out; a truck longer than about one screen needs more beats to keep the last frame's movement ≤ 2 px.
- **Sound**: a short `whoosh`.

### device-flip

- **Looks**: the window turns about its vertical axis until it is edge-on (ease in), its content and title are swapped on the frame where no face shows, and it turns on from the other side to face the camera (ease out), darkening as it turns away. Drawn as vertical strips of a perspective projection.
- **Tier**: T2. **It is a hidden cut inside one object, not a hand-off**: nothing carries the eye from one content to the other, so it does not count as one where a template or check counts hand-offs; it counts as an expressive transition.
- **Use**: the next page of the same source or the next product screen, when the two have no shared element. The same direction at most three times a film. **Not for**: morph (the film never cuts) or two contents with a shared element (hand it off instead).
- **Parameters**: `window` `{ cx 960, cy 540, w 1300, h 700 }` (each asset is cover-cropped to it); `from`, `to` `{ asset, title, focus }`; `perspective` 2200; `shade` 0.6; `strips` 120. Roles: `ground` (shade), `panel`, `line`, `dim`.
- **Theory**: one object with a new face keeps the viewer's place; the swap happens where no face shows, so two contents never overlap (C5). Borrowed from a fitness-app film (a phone turns edge-on and back with the next tab, 13 + 17 frames) and a reading-app film (the same with a change of format).
- **Modes**: handset (a change of surface; two in a row turn opposite ways), phosphor, tally; not morph.
- **Length and easing**: 2 beats; turn out 0–43 % cubic in (13 frames), turn back 43–100 % cubic out (17 frames).
- **Sound**: a `whoosh` landing on the beat as it faces the camera.

### tether-link

- **Looks**: an accent line, led by a small dot, draws on a gentle arc from a code-drawn claim to the region of a real asset that supports it; a ring closes round the region and the dot rests at the ring.
- **Tier**: T0.
- **Use**: a number or sentence on screen and the place in the source it comes from, side by side. **Not for**: two places far apart in different scenes (use `value-carry`).
- **Parameters**: `claim` `{ x, lines: [{ text, y, size, weight, color (role), anchor }] }` (the line starts after the `anchor` line); `target` `{ asset, title, window { x, y, w }, box }`; `bend` 0.18; `gapStart` 28; `ringPad` 8; `dot` 8; `width` 3. Roles: `ground`, `panel`, `line`, `ink`, `dim`, `accent`.
- **Theory**: connectedness groups more strongly than proximity (Palmer & Rock 1994); the dot gives the line a direction (claim → source). Borrowed from an editor's launch film (a line from each typed source line to its rendered line) and a "tracing beam" component.
- **Modes**: dossier (a straight leader from the band to the exhibit sticker), every mode with real assets; trace, thread.
- **Length and easing**: 1 beat; line 0–62 % by arc length, cubic in-out; ring 55–92 %.
- **Sound**: a soft `tick` when the ring closes.

### mark-to-chrome

- **Looks**: the official logo (a PNG, scaled only) shrinks on a log scale and flies to the top left, accelerating, and lands as the title of a window's bar; the window then opens from that corner to the bottom right on a landing spring, uncovering the product screenshot anchored inside it; the source in the bar is uncovered as the bar widens.
- **Tier**: T1.
- **Use**: from the brand to the product's first screen (an opening), or back into the product after a title. **Not for**: a logo that does not appear in the product's own chrome.
- **Parameters**: `logo` `{ asset, from { cx 960, cy 540, w 1100 }, h 26 }` (`h`: height in the bar); `content` `{ asset }`; `window` `{ x 240, y, w 1440 }`; `title`. Roles: `ground`, `panel`, `line`, `dim`.
- **Theory**: the mark is carried into the interface where it really appears (object constancy); a throw eases in and lands, the opening eases out (Thomas & Johnston 1981). Borrowed from an editor's launch film (the wordmark shrinks into the title bar, the window unfolds from there); a logo that flies off and lands nowhere, seen in another film, is what it avoids.
- **Modes**: phosphor; any mode's opening into the product.
- **Length and easing**: 1.5 beats; flight 0–40 % cubic in; window width 40–84 %, height 46–95 %, landing springs.
- **Sound**: a `tick` as the logo lands in the bar.

## Adding one

**A frame-level transition**: one entry in a file of `assets/runtime/transitions/` (`name`, `mode`, `tier`, `beats`, `ease`, `roles`, `summary`, `frag`, `uniforms`), registered in its `index.js`: `frag` defines `vec3 transition(vec2 s, float p)` with `s` in film pixels and `A(s)`, `B(s)`, `cover()`, the easings and the noise of `glsl.js` (do not redeclare its uniforms: `uRes`, `uScale`, `uP`, `uSeed`, `uOrigin`, the four role colours); anything at p = 0 and p = 1 is handled by the shared `main`.

**A hand-off**: a module in `assets/runtime/handoffs/` registered in its `index.js` (an asset hand-off builds on `asset.js` and adds an image case to the self-test), exporting `{ name, tier, beats, modes, roles, from, to, interpolates, summary, theory, defaults, prepare?, rest(side, P, D), at(p, P, D), paint(ctx, S, P, D), track? }`: `at` and `rest` return plain numbers, `paint` draws a state, `track` returns the moving points that decide when motion blur is on. Land exactly (a raw spring never reaches its target: use `settle` from `util.js`), no `Math.random` or `Date`, colours by role.

Then run both self-tests, render it through the library on a contact sheet, read the frames, and add its entry here with its tier, theory and modes, and the borrowing note.
