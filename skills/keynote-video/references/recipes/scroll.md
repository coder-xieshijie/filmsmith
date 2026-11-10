# Recipe: scroll

One long vertical sheet from the first frame to the last: the product's own long page — a repository page and its README, a docs page, a changelog — captured at one scale and joined top to bottom, with quote bands pasted in between, hanging in a fixed viewport. The sheet is flicked and brakes onto the next section; the page's headings pin at the top as the chapters; an accent pencil underlines the line being read and a band repeats it in large type; a list docks row by row; one row unfolds in place on what it describes; at the end the sheet flies back to its top and its paper roll winds it up under the name. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [scroll](../modes/scroll.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/scroll/`, whose `content.js` is the example film.

## Reference look

[`reading-sheet`](../../assets/runtime/bricks/look/reading-sheet/CARD.md): three presets (`slate` default, `slate-violet`, `linen` for dark pages), picked by the accent rule (ΔE00 ≥ 20 from every chromatic colour in the regions the accent marks); the ground, the bands' warm paper stock with its ink, the dark unfold panel, the hairline under a pinned tab, the lit roll; the accent only a stroke (4 px underline, 6 px margin mark, 3 px minimap bracket); Schibsted Grotesk (96 hook, 69 quotes, 49 slot and claim, 134 name) and DM Mono (35 address, 25 label); the sheet column x 120–1616 from y 54, 0.8 film px per image px; the minimap at x 1664–1824; a locked viewport. The bricks share `look/reading-sheet/kit.js`: the sheet (capture strips, bands, the panel, splices), offset targets, the bands' phrases, the underline, the pinned tabs (runtime [`section-lock`](../transitions.md#section-lock) `tabsAt`), the minimap, the roll (runtime [`roll`](../transitions.md#roll) `drawRoll`), the curves (runtime [`scroll-reel`](../transitions.md#scroll-reel) `momentum`, `fling`), and a placeholder README for samples.

## The sheet

Every scene takes the same `sheet` object: the capture's URL, the x range every strip shares, the pieces top to bottom (`img` strips in image px, `gap` splices, `band`s with the lines they hold when no scene animates them, the `panel` an unfold opens), the headings (`heads`), the lines to underline (`marks`) and the list's rows (`rows`), all in image px. A film builds it once from its capture and its measured boxes — the example's comes from the template's `data/boxes.js` — and passes it to every scene, changing only what its bands hold.

## Recommended bricks

| Slot (arc `page-read`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`sheet-open`](../../assets/runtime/bricks/scene/sheet-open/CARD.md) | – |
| problem (1–2) | [`quote-detent`](../../assets/runtime/bricks/scene/quote-detent/CARD.md) (`detent` with `lead: 1`, then `none` with `replace`) | – |
| demo | [`row-ratchet`](../../assets/runtime/bricks/scene/row-ratchet/CARD.md) | – |
| climax | [`row-unfold`](../../assets/runtime/bricks/scene/row-unfold/CARD.md) (the row's real frames) | – |
| proof | [`quote-detent`](../../assets/runtime/bricks/scene/quote-detent/CARD.md) (`reel`, `unmark`) | – |
| lockup | [`roll-lockup`](../../assets/runtime/bricks/scene/roll-lockup/CARD.md) | – |
| every scene | [`quote-band`](../../assets/runtime/bricks/prop/quote-band/CARD.md), [`sheet-minimap`](../../assets/runtime/bricks/prop/sheet-minimap/CARD.md) (inside the kit) | runtime [`scroll-reel`](../transitions.md#scroll-reel), `scroll-fling`, `section-lock`, `unfold`, `roll` (curves and drawing called from the kit) |
| sound | [`sheet-bed`](../../assets/runtime/bricks/sound/sheet-bed/CARD.md) (lib/audio `thread`) | – |

## Ban list

- Any cut, flip, tilt, zoom, crossfade or sideways move: every change is the sheet's offset (runtime frame-level transitions, `device-flip`, `lift-out`, `camera-truck` are banned here).
- A linear pan or an overshoot: every scroll is a flick (momentum) or a fling, landing ≤ 2 px.
- The accent as a fill or text; two underlines at once.
- Recolouring, retouching or rebuilding the capture; hiding a cut (a splice shows the ground).
- A quote that adds to the page's wording; two unfolds in a row.

## Template → bricks

| Template part (`assets/templates/scroll/`) | Brick | Notes |
|---|---|---|
| `PAL`, type, grid | [`reading-sheet`](../../assets/runtime/bricks/look/reading-sheet/CARD.md) (+ `kit.js`) | |
| `PIECES`, `layout`, `imgToSheet`, `sheet()`, `tabsAt` tabs | `kit.js` (`loadSheet`, `drawSheet`) | |
| `open`: `unroll`, `under1`, `mini`, band Q1 | [`sheet-open`](../../assets/runtime/bricks/scene/sheet-open/CARD.md) | |
| `code`, `agent`, `measured`: `detent1`, `under2`, `swap2`, `reel2`, bands Q2, Q4 | [`quote-detent`](../../assets/runtime/bricks/scene/quote-detent/CARD.md) | |
| `styles`: `reel1`, `ratchet()`, `slot()` | [`row-ratchet`](../../assets/runtime/bricks/scene/row-ratchet/CARD.md) | |
| `ink`: `reelUp`, `unMark`, `unfold`, `play`, `panel()` | [`row-unfold`](../../assets/runtime/bricks/scene/row-unfold/CARD.md) | |
| `lockup`: `fling`, `name`, `under5`, `url`, `rollup` | [`roll-lockup`](../../assets/runtime/bricks/scene/roll-lockup/CARD.md) | |
| `band()`, `slotLine`, `phraseLine` | [`quote-band`](../../assets/runtime/bricks/prop/quote-band/CARD.md) | |
| `minimap()` | [`sheet-minimap`](../../assets/runtime/bricks/prop/sheet-minimap/CARD.md) | |
| `score.mjs` (lib/audio `thread`) | [`sheet-bed`](../../assets/runtime/bricks/sound/sheet-bed/CARD.md) | |
| `plan.js` SCENES | [`page-read`](../../assets/runtime/bricks/arc/page-read/CARD.md) | |
| hand-offs `scroll-reel`, `scroll-fling`, `section-lock`, `unfold`, `roll` | runtime, referenced | their curves and drawing imported, not copied |

What stays in the template:

- **The capture tools** (`tools/capture.mjs`, `tools/capture-github.mjs`, `npm run assets`): the full-page capture at 2× logged out, the measured line boxes (`--phrases`), the zoom cap, the accent ΔE check against the marked regions, the people check, the manifest. Bricks take the capture and its boxes as data (`sheet`); producing and checking them is the template's job.
- **The demo's frames** (`assets/real/ink-frames/`): extracted from the source film by the template's tool at a stated time range and fps; `row-unfold` plays whatever frames it is given.
- **The film's plan** (`plan.js` SPANS, the phrase timings of `QUOTES`, `npm run fit`): which band each scene fills and what the other bands hold at that moment (the sheet's band lines) is the film's.

## Chinese

Scroll's type is a news grotesk quoting an English page; the capture is evidence and stays in its own language. The quotes are set in Noto Sans SC at the same sizes (96 / 69 / 49 / 134), cut into phrases by the page's own wording with no space between Chinese phrases; the slot names, the address and the panel label stay as written. No redesign was needed: its bricks mark Chinese `adapted` for the type only. The Chinese phrases plan longer (the opening 9 beats against 8, the unfold 11 against 8). A Chinese film takes these lengths ([system](../system.md#language)).
