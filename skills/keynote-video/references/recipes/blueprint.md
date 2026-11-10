# Recipe: blueprint

One engineering drawing drafted sheet by sheet: 6–9 sheets on one large blueprint, the camera travelling the drafting route between them, every line and letter drawing itself with the technical pen, stamps landing on the beat, and a title block in the corner that knows which sheet it is. The film argues that the product is a plan someone signed: the problem as open review items, the claim as a general arrangement, details, sections, loops and inspections as the evidence, the overview as the claim at full size, the release block as the lock-up. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [blueprint](../modes/blueprint.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/blueprint/`, whose `content.js` is the example film.

## Reference look

[`drafting-sheet`](../../assets/runtime/bricks/look/drafting-sheet/CARD.md): the sheet (`paper`) on a darker ground (`bg`), ink and line in two blues, one amber accent for stamps, revision marks and the person's decisions. Presets `cyanotype` (the source film's), `diazo` (dark rooms), `blueline` (light pages), `vellum` (the pencil original), `oxblood` (a warm-red brand; the mode card's `coral`) and `graphite-film` (when blue clashes; the mode card's `graphite`). Plex Condensed (IBM Plex Sans Condensed, the template's name for it) for titles and numerals, IBM Plex Mono for lettering, labels and the title block; Chinese takes Noto Sans SC after each family. ISO lettering heights 25 · 35 · 50 · 70 · 100 · 140 · 200 · 280; Chinese starts at 28 and 40 (a 25 or 35 px Chinese label is lifted to the floor, untracked). A 40 px fine grid and a 200 px major grid on the sheet, a drifting warm lamp, a paper tile, grain and a vignette over it; the camera travels the drafting route at a fixed scale, pushes in by 1.1 on a check.

## Recommended bricks

| Slot (arc `sheet-route`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`review-callouts`](../../assets/runtime/bricks/scene/review-callouts/CARD.md) | – |
| claim | [`general-arrangement`](../../assets/runtime/bricks/scene/general-arrangement/CARD.md) | – |
| turn, demo (each sheet) | [`detail-confirm`](../../assets/runtime/bricks/scene/detail-confirm/CARD.md), [`section-cut`](../../assets/runtime/bricks/scene/section-cut/CARD.md), [`lap-loop`](../../assets/runtime/bricks/scene/lap-loop/CARD.md) | runtime [`slot-rails`](../transitions.md#slot-rails) for the stages slot page |
| proof | [`inspection-record`](../../assets/runtime/bricks/scene/inspection-record/CARD.md), [`exploded-chain`](../../assets/runtime/bricks/scene/exploded-chain/CARD.md) | – |
| rest | [`parts-list`](../../assets/runtime/bricks/scene/parts-list/CARD.md) | – |
| climax | [`sheet-overview`](../../assets/runtime/bricks/scene/sheet-overview/CARD.md) (with `pages`, the film's own sheets under the route) | – |
| lockup | [`release-block`](../../assets/runtime/bricks/scene/release-block/CARD.md) | – |
| every sheet | [`sheet-hud`](../../assets/runtime/bricks/prop/sheet-hud/CARD.md) (the title block, sheet frame and the engine every blueprint scene imports), [`drafting-stamp`](../../assets/runtime/bricks/prop/drafting-stamp/CARD.md), [`guide-letter`](../../assets/runtime/bricks/motion/guide-letter/CARD.md) (lettering between its guide lines) | – |
| between sheets | [`route-pan`](../../assets/runtime/bricks/motion/route-pan/CARD.md) (the camera travels to the next sheet; built into each scene's arrival as its `lead`) | runtime [`shape-flood`](../transitions.md#shape-flood) (the issue flood), `blueprint-expose` (the probe lamp), `occluder-pass` (into the release) |
| sound | [`drafting-bed`](../../assets/runtime/bricks/sound/drafting-bed/CARD.md) (preset `blueprint`) | – |

## Ban list

- A second accent or the accent on machine output: amber is for stamps, revision marks and what a person decided.
- Lines that appear without being drawn; type that appears without its guide lines.
- Rounded corners, shadows, gradients, photographs; anything that is not drawn with a pen on the sheet.
- A camera move other than the route between sheets, the pull-out to the overview and the 1.1 push on a check.
- Lettering under the floors (25 / 35 px; Chinese 28 / 40), and capitals, italic or negative tracking in Chinese.

## Template → bricks

| Template part (`assets/templates/blueprint/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `index.html` CSS, ISO series | [`drafting-sheet`](../../assets/runtime/bricks/look/drafting-sheet/CARD.md) | `coral` renamed `oxblood`, `graphite` renamed `graphite-film` (the ids are taken by other looks) |
| `fx.js` (pen, pencil, stamps, paper tile), `common.js`, `choreography.js` constants, film.js HUD and camera | [`sheet-hud`](../../assets/runtime/bricks/prop/sheet-hud/CARD.md) (+ `kit.js`) | the HUD words are slots, so they can be Chinese |
| `makeStamp`, `drawStamp` | [`drafting-stamp`](../../assets/runtime/bricks/prop/drafting-stamp/CARD.md) | |
| `problem` | [`review-callouts`](../../assets/runtime/bricks/scene/review-callouts/CARD.md) | |
| `arrangement` | [`general-arrangement`](../../assets/runtime/bricks/scene/general-arrangement/CARD.md) | |
| `detail` | [`detail-confirm`](../../assets/runtime/bricks/scene/detail-confirm/CARD.md) | `issue: true` floods the drawing; the flood itself is runtime [`shape-flood`](../transitions.md#shape-flood) |
| `section` | [`section-cut`](../../assets/runtime/bricks/scene/section-cut/CARD.md) | |
| `loop` | [`lap-loop`](../../assets/runtime/bricks/scene/lap-loop/CARD.md) | |
| `checklist` | [`inspection-record`](../../assets/runtime/bricks/scene/inspection-record/CARD.md) | the lamp is the host's (runtime [`blueprint-expose`](../transitions.md#blueprint-expose)) with `lamp: 'host'`; otherwise the brick draws a stand-in scan line |
| `assembly` | [`exploded-chain`](../../assets/runtime/bricks/scene/exploded-chain/CARD.md) | |
| `parts` | [`parts-list`](../../assets/runtime/bricks/scene/parts-list/CARD.md) | |
| `overview` (final) | [`sheet-overview`](../../assets/runtime/bricks/scene/sheet-overview/CARD.md) | `pages` names the scene brick of each sheet; it draws their settled state under the route |
| `release` | [`release-block`](../../assets/runtime/bricks/scene/release-block/CARD.md) | the key plan's label is a slot (`keyLabel`) |
| the route between sheets (film.js camera) | [`route-pan`](../../assets/runtime/bricks/motion/route-pan/CARD.md) | the arrival is each sheet scene's `lead` (1 beat) |
| lettering with guides (`pen.text` and construction lines) | [`guide-letter`](../../assets/runtime/bricks/motion/guide-letter/CARD.md) | in Chinese the guides mark the em box (+0.12 / −0.88 em), not a baseline and x-height |
| `score.mjs` | [`drafting-bed`](../../assets/runtime/bricks/sound/drafting-bed/CARD.md) | cue gains below the template's: the stamps sound softer |
| `content.js` scene types, TEMPLATE.md | [`sheet-route`](../../assets/runtime/bricks/arc/sheet-route/CARD.md) | |
| `interface`, `stages` | stay in the template / runtime | see below |

What stays in the recipe, and why:

- **`interface`** (the product's outline drafted, made a cube by three lines, opened into six panels): it is runtime [`stroke-reinterpret`](../transitions.md#stroke-reinterpret) into `net-unfold`, two hand-offs in a row, around a sheet that is only the frame; the library's `hex-solid` and `cube-page` cover the cube without the blueprint lettering. A brick would copy two hand-offs.
- **`stages`** (one word a beat through a slot between two dimension lines): runtime [`slot-rails`](../transitions.md#slot-rails) on a sheet; the sheet around it is `sheetFrame` and a header, which every sheet scene already draws.
- **The issue flood** (`detail` with `issue`), **the probe lamp** (`checklist`) and **the parallel rule into the release**: runtime transitions `shape-flood`, `blueprint-expose`, `occluder-pass`, referenced, not copied. The bricks leave room for them (`issue`, `lamp: 'host'`, `from: 'none'`).
- The film's single drawing (all sheets on one blueprint, the route through them in order, the key plan in the release) is film work: give every sheet scene the same `frame` (title, subtitle, corner, total) and its `sheetNo`, and the overview the same sheet list.

## Chinese

- Lettering guides mark the em box of the Chinese line (+0.12 em below, −0.88 em above the baseline), since a Chinese line has no x-height or descender to rule ([`guide-letter`](../../assets/runtime/bricks/motion/guide-letter/CARD.md), `pen.guides`).
- The ISO series starts below the Chinese floor: a 25 or 35 px string with Chinese in it is drawn at 28 or 40 px and untracked (`zf` in `prop/sheet-hud/kit.js`); stamps keep their small line at 28 px or more.
- The title block's words (APPROVED BY, SHEET, SCALE, the sheet name pattern, ALL) are slots with Chinese defaults (批准, 张次, 比例, 第 {n} 张, 全部), as is the key plan's label.
- Stamps: a Chinese stamp word is two to four characters, untracked, set in the display family; a stamp never takes capitals in Chinese.

- **Length**: Chinese sheets hold longer; with the sample copy `detail-confirm` plans 22 beats against 14. A Chinese film takes these lengths ([system](../system.md#language)).
