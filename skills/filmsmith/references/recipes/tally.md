# Recipe: tally

A data story told by counting: one rounded square per item, on screen from the first frame to the last, re-sorted chapter by chapter into the answer — bands, a split, an axis, columns over time and their trend — and closed on the few numbers that matter. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [tally](../modes/tally.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/tally/`, whose `content.js` is the example film.

## Reference look

[`unit-ledger`](../../assets/runtime/bricks/look/unit-ledger/CARD.md): a dark radial ground (`navy-amber` `#0E1A2B` → panel) or warm paper (`paper-red`), plus `night-teal` and `coral`; squares in two neutrals (`base`, `rest`) and one accent for the protagonist only; Inter Tight for numbers and titles, IBM Plex Mono capitals for labels (Chinese labels: no case, no tracking); scale 25 · 32 · 40 · 64 · 150 · 210 · 273 · 300 (Chinese from 28); locked camera; grain and a specimen texture (`texture.js`).

## Recommended bricks

| Slot (arc `count-to-close`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`unit-count`](../../assets/runtime/bricks/scene/unit-count/CARD.md) | [`digit-roll`](../../assets/runtime/bricks/motion/digit-roll/CARD.md) when the set's size is the headline and must land as a precise figure |
| demo (which kinds) | [`unit-bands`](../../assets/runtime/bricks/scene/unit-bands/CARD.md) (`pick: 'roulette'`, `form: 'share'`), [`unit-split`](../../assets/runtime/bricks/scene/unit-split/CARD.md), [`unit-axis`](../../assets/runtime/bricks/scene/unit-axis/CARD.md) | [`unit-regroup`](../../assets/runtime/bricks/motion/unit-regroup/CARD.md) for a dot swarm that spells the total (one per film, not with `unit-flight`) |
| turn / proof (when) | [`unit-periods`](../../assets/runtime/bricks/scene/unit-periods/CARD.md) (`reread: 'trend'` for the second reading; `stagger: 'together'` in a short scene) | [`axis-rescale`](../../assets/runtime/bricks/motion/axis-rescale/CARD.md) when one period breaks the scale |
| rest (the long tail) | – | runtime [`stream-brake`](../transitions.md#stream-brake) (the template's `list` scene: a braking scroll to the newest item; `variants/stream-brake` for card rows) |
| lockup | [`unit-close`](../../assets/runtime/bricks/scene/unit-close/CARD.md) + [`rank-sweep`](../../assets/runtime/bricks/motion/rank-sweep/CARD.md) | – |
| every chapter | [`unit-flight`](../../assets/runtime/bricks/motion/unit-flight/CARD.md) between layouts; [`unit-mark`](../../assets/runtime/bricks/prop/unit-mark/CARD.md); [`chart-frame`](../../assets/runtime/bricks/prop/chart-frame/CARD.md) (source, unit, chapter) | [`marker-stroke`](../../assets/runtime/bricks/motion/marker-stroke/CARD.md) to underline the protagonist's word in a title |
| sound | [`data-bed`](../../assets/runtime/bricks/sound/data-bed/CARD.md) | – |

## Ban list

- A square that stands for more than one item, or a chapter that adds or drops squares (the promise is "the same items all film").
- A second accent, or the accent on anything but the protagonist.
- Charts drawn as lines or areas over continuous measures (the trend is the same squares' tops re-read).
- Category by shape (the mark is one shape all film).
- Camera moves beyond the template's (locked camera; squares move, the frame does not).
- Made-up data in a finished film: the numbers on screen are the film's own (source line on screen via `chart-frame`).

## Template → bricks

| Template part (`assets/templates/tally/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, type, `fx.js` grain and radial | [`unit-ledger`](../../assets/runtime/bricks/look/unit-ledger/CARD.md) (+ `texture.js`) | |
| `squares.js` (marks, wave, flight, landing), `layouts.js` geometry, `compute.js` grouping | `motion/unit-flight/units.js` (engine) and [`unit-flight`](../../assets/runtime/bricks/motion/unit-flight/CARD.md) | grid, sorted, bands, share, periods, axis, rule |
| `marks.js` | [`unit-mark`](../../assets/runtime/bricks/prop/unit-mark/CARD.md) | square, dot, glyphs |
| chapter label, key, progress rule, source, legend (`timeline.js`) | [`chart-frame`](../../assets/runtime/bricks/prop/chart-frame/CARD.md) | |
| `count` | [`unit-count`](../../assets/runtime/bricks/scene/unit-count/CARD.md) | |
| `columns` (+ roulette), `share` | [`unit-bands`](../../assets/runtime/bricks/scene/unit-bands/CARD.md) | the roulette schedule is re-implemented after runtime [`roulette-lock`](../transitions.md#roulette-lock) |
| `split` | [`unit-split`](../../assets/runtime/bricks/scene/unit-split/CARD.md) | the `flip` entrance stays in the template (runtime [`tally-flip`](../transitions.md#tally-flip)) |
| `axis` | [`unit-axis`](../../assets/runtime/bricks/scene/unit-axis/CARD.md) | |
| `timeline`, `trend` | [`unit-periods`](../../assets/runtime/bricks/scene/unit-periods/CARD.md) | the trend's re-encode is drawn on the squares (after runtime [`re-encode`](../transitions.md#re-encode)); the timeline's step-wipe entry, which lands the whole chart at once, becomes `stagger: 'together'` |
| `close` and its closing light | [`unit-close`](../../assets/runtime/bricks/scene/unit-close/CARD.md), [`rank-sweep`](../../assets/runtime/bricks/motion/rank-sweep/CARD.md) | the `dither` entrance stays in the template |
| `list` | not split: runtime [`stream-brake`](../transitions.md#stream-brake) | it is a hand-off already; a scene around it would add nothing |
| `score.mjs` | [`data-bed`](../../assets/runtime/bricks/sound/data-bed/CARD.md) (preset `data`) | |
| `content.js` scene order, `timing.rules.js` | [`count-to-close`](../../assets/runtime/bricks/arc/count-to-close/CARD.md) | |
| entrances `step` (step-wipe), `flip`, `dither` | stay in the template / runtime | they are chapter transitions between whole frames, already runtime hand-offs; each scene starts from the previous layout through `from` instead |

What stays in the recipe: the choice of protagonist (one category for the whole film; each scene takes `accent`), the rule that the next chapter flies from the last chapter's layout (`from`), and the data pipeline (`tools/peps-data.mjs`-style fetching, `compute.js` folding into ≤ 9 bands and the protagonist's count per period for `periods[i].accent` are film work, not bricks). Hand every scene the same `groups` and `periods`, so the squares are the same items all film.

## Chinese

Band names, eras, captions and the frame are set in Chinese; numbers stay Inter Tight; labels lose their capitals and tracking and sit at the 28 px floor. Each scene plans about one beat longer. A Chinese film takes these lengths ([system](../system.md#language)).
