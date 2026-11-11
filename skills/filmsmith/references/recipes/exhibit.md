# Recipe: exhibit

A launch argued from published evidence laid on one desk: real prints in neutral card mounts under an overhead camera, one pencil (red, or blue for red assets) that rings what the film points at, lifts a claim's cells out as readings, cuts on a value two sources share, measures a gap on a chart's own axis, and at the end retraces its route under the name. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [exhibit](../modes/exhibit.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/exhibit/`, whose `content.js` is the example film.

## Reference look

[`light-desk`](../../assets/runtime/bricks/look/light-desk/CARD.md): a warm-grey desk (`lightbox`, red pencil `#D0233D`; `lightbox-pencil`, blue `#677BFE` for red assets) or a dark one (`grease`, `pencil`); label stock `#FBFAF7` for mounts, chips and readings, the mat colour for mount edges and index numerals; Instrument Sans for captions (59 px), chips (32 / 76), reading labels (44) and the name (140), IBM Plex Mono for sources, notes and the address (25; Chinese 28); scale 25 · 33 · 44 · 59 · 79 · 105 · 140; an overhead camera that trucks and rises, never tilts; a fixed fibre texture on the desk, the cutting mat's grid with `desk: 'mat'`, light falling off to the corners (`texture.js`).

## Recommended bricks

| Slot (arc `desk-survey`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`print-open`](../../assets/runtime/bricks/scene/print-open/CARD.md) | [`bezel-pullback`](../transitions.md#bezel-pullback) (the move it is made of) |
| proof | [`print-read`](../../assets/runtime/bricks/scene/print-read/CARD.md) (at most twice a film) | [`lift-out`](../transitions.md#lift-out) |
| demo (to the next print) | [`print-travel`](../../assets/runtime/bricks/scene/print-travel/CARD.md) (`move`: `parallax-slide` default, `camera-truck`, `grid-hop` with three or more prints) | [`parallax-slide`](../transitions.md#parallax-slide), [`camera-truck`](../transitions.md#camera-truck), [`grid-hop`](../transitions.md#grid-hop) |
| turn | [`value-match`](../../assets/runtime/bricks/scene/value-match/CARD.md) | [`match-cut`](../transitions.md#match-cut) |
| climax | [`gap-measure`](../../assets/runtime/bricks/scene/gap-measure/CARD.md) (`desk: 'mat'` reads as a workbench) | [`dimension-line`](../../assets/runtime/bricks/motion/dimension-line/CARD.md) (own) |
| lockup | [`desk-lockup`](../../assets/runtime/bricks/scene/desk-lockup/CARD.md) | [`ring-route`](../../assets/runtime/bricks/motion/ring-route/CARD.md) (own) |
| every scene | [`print-mount`](../../assets/runtime/bricks/prop/print-mount/CARD.md) (the desk engine `desk.js`, the scene machinery `exhibit.js`), [`claim-chip`](../../assets/runtime/bricks/prop/claim-chip/CARD.md) | – |
| sound | [`desk-bed`](../../assets/runtime/bricks/sound/desk-bed/CARD.md) (preset `swiss`) | – |

## Ban list

- A recoloured, retouched, re-laid-out or regenerated asset, or a rebuilt UI standing in for a capture; a chart drawn in code from data must say it is a stand-in on its face.
- A print past 1.333 output px per source px (crop instead), a person in any crop.
- The pencil within ΔE00 20 of a colour inside a ringed region (take the other pencil), or on anything the film is not pointing at now.
- Two claims on one chip, more than two reads a film, a measured gap whose label was typed instead of computed.
- Tilted or perspective prints, a camera that tilts or orbits; prints that change position on the desk between scenes.
- Beside another real-asset style's bricks: its lock-up and its bed too (one lock-up and one bed a film, [creative.md](../creative.md#rules-for-any-composition)).

## Template → bricks

| Template part (`assets/templates/exhibit/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `film.js` desk, falloff and type | [`light-desk`](../../assets/runtime/bricks/look/light-desk/CARD.md) (+ `texture.js`) | the four presets keep the template's hexes; `panel` is the stock, `line` the mat, `onPaper` the sink |
| `layout.js` (planes, mounts, cameras, overview), `film.js` desk, numerals, mount, captions | [`print-mount`](../../assets/runtime/bricks/prop/print-mount/CARD.md) (`desk.js`) | the desk is a slot (`prints: [{ image, crop, focus, source, chip }]`) instead of `content.js`'s assets |
| `film.js` chips | [`claim-chip`](../../assets/runtime/bricks/prop/claim-chip/CARD.md) (`chip.js`) | also the dimension's label chip |
| `film.js` measureGeom, measures, measureVeil | [`dimension-line`](../../assets/runtime/bricks/motion/dimension-line/CARD.md) (`dimension.js`) | |
| `film.js` lockup's route and rule | [`ring-route`](../../assets/runtime/bricks/motion/ring-route/CARD.md) (`route.js`) | |
| `choreo.js` plan (every type) and `film.js` paint, readLayer, heldRing | `prop/print-mount/exhibit.js` | the timelines read Chinese with lang.js times (6 characters a second plus half a second) |
| `open` | [`print-open`](../../assets/runtime/bricks/scene/print-open/CARD.md) | |
| `read` | [`print-read`](../../assets/runtime/bricks/scene/print-read/CARD.md) | |
| `travel` | [`print-travel`](../../assets/runtime/bricks/scene/print-travel/CARD.md) | |
| `match` | [`value-match`](../../assets/runtime/bricks/scene/value-match/CARD.md) | the ring stays round the landed value (`keepRing`) |
| `measure` | [`gap-measure`](../../assets/runtime/bricks/scene/gap-measure/CARD.md) | the match's ring comes off when `ringed` names it |
| `lockup` | [`desk-lockup`](../../assets/runtime/bricks/scene/desk-lockup/CARD.md) | the route is a parameter (`route`: the regions in order) |
| `score.mjs` | [`desk-bed`](../../assets/runtime/bricks/sound/desk-bed/CARD.md) (preset `swiss`) | |
| `content.js` scene order, `timing.rules.js` | [`desk-survey`](../../assets/runtime/bricks/arc/desk-survey/CARD.md) | |
| `moves.js` adapters (bezel-pullback, lift-out, parallax-slide, camera-truck, grid-hop, match-cut) | not copied: the runtime hand-offs, called from `desk.js` with the template's adapter code | |

What stays in the recipe: the desk is one object for the whole film. Hand every scene the same `prints` in the same order (the camera's positions, the numerals and the chips follow from the index), name the print a scene is about (`print`) and the one the camera leaves (`from`), pass the captions already lying on the desk (`held`), and give the lock-up the route (`route`: each read's first cell and both sides of each match). What crosses scenes in the template and is a parameter here: a match's ring held into the measure (`ringed`), the measure's isolation and the chip it moved aside (they end at the measure; in the template they fade with the lock-up's rise). What stays in the template: capturing and checking the assets (`tools/capture.mjs`, `tools/check-assets.mjs` with macOS Vision OCR in `ocr.swift` for `expect`/`forbid`, hashes, the zoom cap and people; `tools/regions.mjs` for the accent's ΔE00 against each ringed region).

## Chinese

Captions, notes, chip labels and sources are set in Chinese; benchmark names, numbers and addresses stay Latin, and the prints stay in their own language (they are evidence). Every Chinese information size sits at the 28 px floor (sources, notes, the address). The scene timelines read Chinese at 6 characters a second plus 0.5 s a state, so the reads run longer: with the sample copy a read plans 22 beats against 15, the open 9 against 7. A Chinese film takes these lengths ([system](../system.md#language)).
