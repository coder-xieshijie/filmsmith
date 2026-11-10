# Recipe: handset

A launch told on one device held still: a head-on laptop (or phone) drawn in code, its screen showing only real captures of the product and its official evidence, one accent pointing at the region in play, and the words set beside the device in a margin, level with what they explain. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [handset](../modes/handset.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/handset/`, whose `content.js` is the example film.

## Reference look

[`device-margin`](../../assets/runtime/bricks/look/device-margin/CARD.md): a near-black graphite ground (`graphite`), a warm dark (`umber`) or a light porcelain (`porcelain`); the device's lid a step above the ground with a 2 px edge, the screen the only colour; one lime accent for the ring, the band's edge and the level tick; Inter Tight for the margin's value (95 px) and lines (49 px), IBM Plex Mono for notes, the chin's source line and the address (25 px; Chinese 28); scale 25 · 31 · 39 · 49 · 61 · 76 · 95 · 119 (Chinese from 28); locked camera; a fixed 4 % grain (`texture.js`).

## Recommended bricks

| Slot (arc `surface-tour`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`screen-wake`](../../assets/runtime/bricks/scene/screen-wake/CARD.md) | – |
| demo | [`screen-push`](../../assets/runtime/bricks/scene/screen-push/CARD.md) (`entry: 'cut'` for a later capture of the same screen, `release: 'rest'` to pull back to the context after a readout) | [`viewport-push`](../transitions.md#viewport-push) (the runtime move the push is made of) |
| turn (change of surface) | [`screen-change`](../../assets/runtime/bricks/scene/screen-change/CARD.md) (`move: 'feed'`, the usual; `scroll` inside one long capture; `flip` once a film at most) | [`feed-stack`](../transitions.md#feed-stack), [`scroll-reel`](../transitions.md#scroll-reel), [`device-flip`](../transitions.md#device-flip) |
| proof | [`row-band`](../../assets/runtime/bricks/scene/row-band/CARD.md) (`step: 3, quick: true` after a scroll that lands on the boundary) | [`spotlight-band`](../transitions.md#spotlight-band) |
| climax | [`screen-push`](../../assets/runtime/bricks/scene/screen-push/CARD.md) with `claim: true` (the push lands on the bar line, read in a pause) | – |
| lockup | [`device-lockup`](../../assets/runtime/bricks/scene/device-lockup/CARD.md) | – |
| every scene | [`device-shell`](../../assets/runtime/bricks/prop/device-shell/CARD.md) (the device and its chin), [`region-light`](../../assets/runtime/bricks/prop/region-light/CARD.md) (veil, ring, tick), [`margin-notes`](../../assets/runtime/bricks/prop/margin-notes/CARD.md) (the copy group), [`level-rail`](../../assets/runtime/bricks/motion/level-rail/CARD.md) (the block rides with the region) | – |
| sound | [`device-bed`](../../assets/runtime/bricks/sound/device-bed/CARD.md) (preset `data`, in F) | – |

## Ban list

- A tilted, floating or fanned device, a stock mockup or photographed bezel, a reflection or a moving highlight on the glass, a drop shadow on a gradient.
- A drawn or rebuilt UI on the screen; only captures go there, cropped to their `public` region and never past 1.333 output px per source px.
- The accent on copy, on a capture, or on two regions at once; a preset whose accent sits within ΔE00 20 of a colour filling the ringed region.
- Cross-dissolves between screen states; more than one flip a film; the device leaving the frame.
- Words over the screen: every line is set in the margin, level with its region.
- An app-store badge or QR end card.
- Beside another real-asset style's bricks: its lock-up and its bed too (one lock-up and one bed a film, [creative.md](../creative.md#rules-for-any-composition)).

## Template → bricks

| Template part (`assets/templates/handset/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `film.js` type and grain | [`device-margin`](../../assets/runtime/bricks/look/device-margin/CARD.md) (+ `texture.js`) | the three presets keep the template's hexes; `muted`, `deck`, `deckEdge`, `glass`, `cam` are extra roles |
| `choreo.js` DEVICES, `film.js` paintDevice and the chin | [`device-shell`](../../assets/runtime/bricks/prop/device-shell/CARD.md) (engine `device.js`) | captures are a slot `{ image, size, public, chin, regions }` instead of `content.js`'s assets |
| `film.js` light (veil, ring, tick) | [`region-light`](../../assets/runtime/bricks/prop/region-light/CARD.md) | |
| `film.js` copy and its rails, `choreo.js` group | [`margin-notes`](../../assets/runtime/bricks/prop/margin-notes/CARD.md) | Chinese lines wrap in the margin instead of shrinking |
| `film.js` blockY | [`level-rail`](../../assets/runtime/bricks/motion/level-rail/CARD.md) | |
| `wake` | [`screen-wake`](../../assets/runtime/bricks/scene/screen-wake/CARD.md) | |
| `push`, `cut`, `claim` | [`screen-push`](../../assets/runtime/bricks/scene/screen-push/CARD.md) | one scene, three entries; `release` pulls back to the context after a readout |
| `feed`, `scroll`, `flip` | [`screen-change`](../../assets/runtime/bricks/scene/screen-change/CARD.md) | the moves are the runtime's `feed-stack`, `scroll-reel`, `device-flip`, window-less inside the screen |
| `band` | [`row-band`](../../assets/runtime/bricks/scene/row-band/CARD.md) | `step`, `quick` |
| `lockup` | [`device-lockup`](../../assets/runtime/bricks/scene/device-lockup/CARD.md) | entry `push`, `feed` or `flip`; the second move rings the region on the last bar |
| `score.mjs` | [`device-bed`](../../assets/runtime/bricks/sound/device-bed/CARD.md) (preset `data`) | |
| `content.js` scene order, `timing.rules.js` | [`surface-tour`](../../assets/runtime/bricks/arc/surface-tour/CARD.md) | |
| `moves.js` adapters (viewport-push, spotlight-band, scroll-reel, feed-stack, device-flip) | not copied: the runtime hand-offs, called from `device.js` | |

What stays in the template: capturing and checking the real assets (`tools/capture.mjs` for retina captures, `tools/check-assets.mjs` for hashes, the expected and forbidden strings, the zoom cap and people, `tools/rings.mjs` and `ocr.swift` for the accent's ΔE00 against each ringed region and for finding region boxes). A film names its regions in each capture's own pixels (`regions: { name: { box, band } }`) and hands the same capture object to every scene that shows it, so a cut or a release lands registered.

## Chinese

The margin's lines are set in Noto Sans SC after Inter Tight and wrap in the margin instead of shrinking; notes, the chin's source line and the address sit at the 28 px floor; the captures stay in their own language. The scenes read Chinese at 6 characters a second plus 0.5 s a state, so a margin line holds longer than its English. A Chinese film takes these lengths ([system](../system.md#language)).
