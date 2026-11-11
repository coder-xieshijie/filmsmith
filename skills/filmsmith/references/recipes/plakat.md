# Recipe: plakat

A product launch set as a Swiss concert-poster series: warm paper, one ink, a visible 12-column grid, giant numerals beside small mono labels, and one accent colour that only ever marks the person and the person's decisions. The film argues a claim page by page: the problem as a table of facts, the claim as input → output, numbered chapters of steps with real material, a rest on how to start, the promise at full size, the closing page. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [plakat](../modes/plakat.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/plakat/`, whose `content.js` is the example film.

## Reference look

[`poster-grid`](../../assets/runtime/bricks/look/poster-grid/CARD.md): paper `#F2EFE8`, ink `#111111`, grey `#5E5A53`, and one accent per preset: `signal` (Swiss red), `ikb`, `orange`, `clay` (the example's), `poster-coral`, `night-print` (dark rooms). Inter Tight for display, numerals and body, IBM Plex Mono for labels, commands and the chrome; Chinese takes Noto Sans SC after each family, as written, untracked, labels 28 px and body 40 px. Scale 25 · 34 · 47 · 64 · 88 · 120 · 164 · 225 (Chinese 28 · 40 · …), giant numerals at 400–640. Columns 1–12 at x = 96 + 146 (i − 1); header rule y 116, footer rule y 962, page-head rule y 300. Locked camera; a static seeded print tooth, soft-light at 0.5.

## Recommended bricks

| Slot (arc `claim-steps`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`problem-table`](../../assets/runtime/bricks/scene/problem-table/CARD.md) | – |
| claim | [`input-output`](../../assets/runtime/bricks/scene/input-output/CARD.md) (entered by the problem's own accent wipe) | – |
| turn (each chapter) | [`numeral-chapter`](../../assets/runtime/bricks/scene/numeral-chapter/CARD.md) | runtime [`counter-portal`](../transitions.md#counter-portal) when a chapter is entered through its numeral |
| demo | [`option-pick`](../../assets/runtime/bricks/scene/option-pick/CARD.md), [`doc-freeze`](../../assets/runtime/bricks/scene/doc-freeze/CARD.md), [`step-matrix`](../../assets/runtime/bricks/scene/step-matrix/CARD.md), [`human-loop`](../../assets/runtime/bricks/scene/human-loop/CARD.md) | runtime [`slot-rails`](../transitions.md#slot-rails) for one word a beat through a slot (the template's `slot` page) |
| proof | [`verify-band`](../../assets/runtime/bricks/scene/verify-band/CARD.md), [`doc-freeze`](../../assets/runtime/bricks/scene/doc-freeze/CARD.md) | – |
| rest | [`install-block`](../../assets/runtime/bricks/scene/install-block/CARD.md) | – |
| climax | [`poster-tagline`](../../assets/runtime/bricks/scene/poster-tagline/CARD.md) | – |
| lockup | [`poster-end`](../../assets/runtime/bricks/scene/poster-end/CARD.md) | – |
| every page | [`poster-chrome`](../../assets/runtime/bricks/prop/poster-chrome/CARD.md) (each scene draws it from `chrome`), [`walk-frame`](../../assets/runtime/bricks/motion/walk-frame/CARD.md) while a page holds | – |
| seams | [`block-carry`](../../assets/runtime/bricks/motion/block-carry/CARD.md) (install → tagline, options → loop) | runtime [`step-wipe`](../transitions.md#step-wipe), `aperture-swap`, `plakat-columns` (transitions) between chapters |
| sound | [`poster-bed`](../../assets/runtime/bricks/sound/poster-bed/CARD.md) (preset `swiss`) | – |

## Ban list

- The accent on anything that is not a person or a person's decision (machine results stay ink).
- A second accent, gradients, shadows, rounded corners, photographs, depth.
- A camera move: the grid is the frame; things enter through masks and wipes.
- Body text under the floors (25 / 34 px; Chinese 28 / 40) to fit more items: cut the copy.
- Capitals or negative tracking in Chinese.

## Template → bricks

| Template part (`assets/templates/plakat/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `index.html` CSS, `scenes.js` SERIES | [`poster-grid`](../../assets/runtime/bricks/look/poster-grid/CARD.md) | `coral` renamed `poster-coral` (the id is taken by `unit-ledger`) |
| `#grid`, `#paper`, `#chrome` | [`poster-chrome`](../../assets/runtime/bricks/prop/poster-chrome/CARD.md) (+ `kit.js`, the engine every plakat scene imports) | the progress cell moves on every four beats (`barOf`) |
| `problem` | [`problem-table`](../../assets/runtime/bricks/scene/problem-table/CARD.md) | |
| `claim` | [`input-output`](../../assets/runtime/bricks/scene/input-output/CARD.md) | |
| `chapter` | [`numeral-chapter`](../../assets/runtime/bricks/scene/numeral-chapter/CARD.md) | |
| `options` | [`option-pick`](../../assets/runtime/bricks/scene/option-pick/CARD.md) | |
| `document` | [`doc-freeze`](../../assets/runtime/bricks/scene/doc-freeze/CARD.md) | |
| `matrix` | [`step-matrix`](../../assets/runtime/bricks/scene/step-matrix/CARD.md) | |
| `verify` | [`verify-band`](../../assets/runtime/bricks/scene/verify-band/CARD.md) | |
| `flow` | [`human-loop`](../../assets/runtime/bricks/scene/human-loop/CARD.md) | `enterBy: 'reblock'` with `from` takes the carried block |
| `install` | [`install-block`](../../assets/runtime/bricks/scene/install-block/CARD.md) | |
| `tagline` | [`poster-tagline`](../../assets/runtime/bricks/scene/poster-tagline/CARD.md) | |
| `end` | [`poster-end`](../../assets/runtime/bricks/scene/poster-end/CARD.md) | |
| walk `frame` (hold moves) | [`walk-frame`](../../assets/runtime/bricks/motion/walk-frame/CARD.md) | also built into each scene's hold |
| `plakat-reblock` (devices.js) | [`block-carry`](../../assets/runtime/bricks/motion/block-carry/CARD.md) | not in the runtime; the only plakat seam that became a brick |
| `score.mjs` | [`poster-bed`](../../assets/runtime/bricks/sound/poster-bed/CARD.md) | the device cues carry lib/audio voices |
| `content.js` scene types, TEMPLATE.md | [`claim-steps`](../../assets/runtime/bricks/arc/claim-steps/CARD.md) | |
| `slot`, `bars`, `figure`, `words` | stay in the template / runtime | see below |

What stays in the recipe, and why:

- **`slot`** (one word a beat through a slot between two rails): it is runtime [`slot-rails`](../transitions.md#slot-rails) plus the page head; a scene around it would add only the head, which `numeral-chapter` and `pageHead` already draw.
- **`bars`** (a bar chart against the person's limit): a chart page that the library already covers better ([`unit-axis`](../../assets/runtime/bricks/scene/unit-axis/CARD.md), [`axis-rescale`](../../assets/runtime/bricks/motion/axis-rescale/CARD.md)); its plakat look is the page head and ink bars, made by restyling those.
- **`figure`** (a counter pushed through its numeral, runtime [`counter-portal`](../transitions.md#counter-portal)) and **`words`** (an aperture swap of words, runtime [`aperture-swap`](../transitions.md#aperture-swap)): hand-offs already; the page around them is the page head.
- **`plakat-columns`** (the opening's column wipe) and **`step-wipe`** between chapters: runtime transitions, referenced, not copied.
- The film's number model (one stated model computes every figure in `content.js`) and the rule that the accent is the person: film work, not bricks. Hand every scene the same `chrome`, with `bar` set to the bar it starts in.

## Chinese

Every family takes Noto Sans SC after it, set as written and untracked; labels sit at 28 px and body at 40 px. Type, line breaks and the accent wipe hold, and no Chinese line breaks inside a word. Pages read longer: with the sample copy `problem-table` plans 23 beats against 16, `input-output` 16 against 9, so a Chinese film of the same pages runs about 25 % longer. A Chinese film takes these lengths ([system](../system.md#language)).
