# Recipe: halftone

A two-ink print in motion: newsprint, one black plate and one process ink; dots that vary in size, never in grey; one anchor — a piece of the product's mark, printed in the process ink — holds one point of the screen while every world is printed round it, until the camera pulls back and the anchor lands in the whole mark. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [halftone](../modes/halftone.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/halftone/`, whose `content.js` is the example film.

## Reference look

[`newsprint`](../../assets/runtime/bricks/look/newsprint/CARD.md): newsprint paper `#F1EDE4`, a black plate `#141414` screened at 45°, one process ink at 15° (`cyan` `#0090CC`, `magenta` `#E4007C`, or the whole film `reverse`d out of black); tone only as dot area, no grey, no gradient, no glow; Bricolage Grotesque 800 for words and numbers and 500 for lines, IBM Plex Mono for labels, quotes and transcripts, set as written (lower case); Chinese words in Noto Sans SC 800 after Bricolage, line spacing 1.18 instead of 1.08, the product name stays Latin; scale 28 · 38 · 52 · 71 · 96 · 131 · 178 · 242; the anchor at (1440, 540), 220 px high, never moves until the pull-back.

## Recommended bricks

| Slot (arc `anchor-launch`) | Own bricks | From the rest of the library |
|---|---|---|
| hook (anchor and problem) | [`anchor-rise`](../../assets/runtime/bricks/scene/anchor-rise/CARD.md) | – |
| demo (features acted out round the anchor) | [`field-card`](../../assets/runtime/bricks/scene/field-card/CARD.md) (one per feature; `from` the previous field; `ground: 'ink'` for a reversed card; `mono: true` for a real command or transcript line) | runtime [`field-morph`](../transitions.md#field-morph) for a field change without a card |
| proof (a count) | [`cell-count`](../../assets/runtime/bricks/scene/cell-count/CARD.md) | [`digit-roll`](../../assets/runtime/bricks/motion/digit-roll/CARD.md) for a large number or a percentage |
| seams (T2 devices, about one every 8–12 s) | [`dot-quantize`](../../assets/runtime/bricks/motion/dot-quantize/CARD.md) (cells → rows, then `field-card` with `print: 'blocks'`) | runtime [`anchor-swap`](../transitions.md#anchor-swap) (scan, iris), variants `whip-push` and `whiteout-slam` |
| climax (the claim) | [`burst-claim`](../../assets/runtime/bricks/scene/burst-claim/CARD.md) | [`grain-condense`](../../assets/runtime/bricks/motion/grain-condense/CARD.md) for a claim that condenses out of grain instead of a burst; [`slam-drop`](../../assets/runtime/bricks/motion/slam-drop/CARD.md) for a one-word slam |
| lockup | [`mark-pullback`](../../assets/runtime/bricks/scene/mark-pullback/CARD.md) | – |
| every scene | [`anchor-mark`](../../assets/runtime/bricks/prop/anchor-mark/CARD.md) (the anchor alone, the whole mark, rings) | – |
| sound | [`press-bed`](../../assets/runtime/bricks/sound/press-bed/CARD.md) | – |

## Ban list

- Grey, gradients, glow, transparency or blur standing in for tone (motion blur only while something moves fast).
- The process ink on anything but the anchor (type, fields, rules and emphasis are black or paper).
- Moving the anchor to make room for copy, or a transition that does not happen round it.
- A field that is a picture swapped for another (fields change parameters along a front from the anchor; never a cross-fade).
- A dense first screen: a field peaks at tone 0.5, fades out 560 px from the anchor and never enters the text column.
- Bounces: a second move is a press impression (dot gain).
- More than five words to read at a time; capitals in Chinese; Chinese in the product name.

## Template → bricks

| Template part (`assets/templates/halftone/`) | Brick | Notes |
|---|---|---|
| `palettes.js` (cyan, magenta, reverse), type, `screen.js` (AM screen, round, square, line) | [`newsprint`](../../assets/runtime/bricks/look/newsprint/CARD.md) | the dot shapes are the `dot` parameter of every brick |
| `screen.js`, `fields.js` (rings, cross, cells, count, rows, wave, grid), `film.js` layout, knock-out type, blocks | `motion/dot-quantize/press.js` (engine) | shared by every halftone brick |
| `film.js` `quantize` seam | [`dot-quantize`](../../assets/runtime/bricks/motion/dot-quantize/CARD.md) | the field is reprinted as binary blocks behind a front and the blocks re-sort |
| content `mark`, anchor, rings | [`anchor-mark`](../../assets/runtime/bricks/prop/anchor-mark/CARD.md) | made up for the example: a capsule and three arcs of sound |
| `hook` | [`anchor-rise`](../../assets/runtime/bricks/scene/anchor-rise/CARD.md) | |
| `card` | [`field-card`](../../assets/runtime/bricks/scene/field-card/CARD.md) | `print: 'blocks'` is the card a quantize seam leads into |
| `count` | [`cell-count`](../../assets/runtime/bricks/scene/cell-count/CARD.md) | |
| `claim` (collapse and burst) | [`burst-claim`](../../assets/runtime/bricks/scene/burst-claim/CARD.md) | the collapse is drawn in the scene (runtime [`collapse-burst`](../transitions.md#collapse-burst) is the generic one) |
| `lockup` (pull-back) | [`mark-pullback`](../../assets/runtime/bricks/scene/mark-pullback/CARD.md) | the pull drawn directly (runtime [`bezel-pullback`](../transitions.md#bezel-pullback) is not used) |
| `score.mjs` | [`press-bed`](../../assets/runtime/bricks/sound/press-bed/CARD.md) | no `press` preset in `lib/audio`: the card keeps the recipe |
| `content.js` scene order, `registry.js` | [`anchor-launch`](../../assets/runtime/bricks/arc/anchor-launch/CARD.md) | |
| seams `whip`, `scan`, `invert` | runtime / variants: `whip-push`, `anchor-swap` (scan, iris) | already hand-offs; not copied |
| `timing.rules.js` fit to bars, T2 spacing, quant and sort beats | stays in the template | film-level rules (how often a device may come, where the peaks fall) |

What stays in the recipe: the product's mark and which piece of it is the anchor ([`anchor-mark`](../../assets/runtime/bricks/prop/anchor-mark/CARD.md) takes a `mark`, the example's capsule is made up), the order of the fields (each chosen for what its card says; `pattern` reused only when the film means "the same one again"), and which seam joins which pair of cards.

## Chinese

The big words and lines are set in Noto Sans SC 800 after Bricolage Grotesque, line spacing 1.18 instead of 1.08, and hold the layout; no capitals; the product name stays Latin. The feature cards read longer: a Chinese card plans 7 beats (3.5 s) against 2–2.5 s in English, so a Chinese film of this arc runs about 40 % longer through its cards. A Chinese film takes these lengths ([system](../system.md#language)).
