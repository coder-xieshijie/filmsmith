---
id: layout-morph
category: motion
tier: T1
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### layout-morph

- **Looks**: a set of tiles (default twelve pictures) moves from one layout to another, tile after tile. Each tile lifts off the page (3.5 % larger, a deeper shadow) while it travels, takes its new place first, its new size two frames later and its new turn four frames later with one small overshoot, then settles. Three layouts are built in: `grid` (4 × 3), `mosaic` (6 × 4, the first tile 3 × 2) and `cascade` (portrait prints with a white mount fanned along a diagonal, each turned 3° more than the last).
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: re-sorting a gallery, a storyboard or a set of screenshots; showing one set in a second arrangement (archive → feature → fan). **Not for**: content that changes while it moves (use a scene); one or two tiles (use `card-portal` or a push); tiles full of small text.
- **Intent**: The layout itself is thinking: the same set of items re-sorts into a new arrangement while the eye follows each one, so the viewer sees one collection read another way.
- **Content**: 8–12 tiles of pictures or screenshots (little or no text) and two layouts among grid, mosaic and cascade; pictures with their subject near the centre (cascade crops to portrait).
- **Parameters**: `from` `'grid'`, `to` `'mosaic'` (a layout name, `{ kind, …options }`, or an array of boxes `{ x, y, w, h, rot, pad, radius }`), `n` 12, `area` [96, 212, 1824, 984] (where the layouts sit), `tiles` (painters `(ctx, w, h)`; default six role-coloured pictures, cropped to cover), `stagger` `'wave'` (span 10, each 26 frames, eased out from the first tile) or `'deal'` (span 14, each 30 frames, equal steps), `span`, `dur` (override the stagger's), `lift` 0.035. Roles read: `ground`, `panel` (the tile and its mount), `ink`, `accent` (the pictures).
- **Theory**: keeping every tile visible while it moves lets the eye follow each one to its new place (object constancy; Heer & Robertson 2007, animated transitions); the stagger turns one change into a readable sequence, and the late size and turn make the place arrive first.
- **Styles**: any; editorial and gallery styles suit the cascade.
- **Length and easing**: 2.75 beats for the wave (40 frames), 3.25 for the deal (48 frames), from `beatsFor`; 2–5. Place and size cubic-bezier(0.75, 0, 0.15, 1); turn cubic-bezier(0.45, 0, 0.3, 1.22).
- **Sound**: a soft card shuffle across the stagger, or a tick per tile on the deal.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/transition/mosaic-reframe/MosaicReframe.tsx` (card `references/shots/transition/mosaic-reframe.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: one change of layout per brick (the upstream's two changes, the holds, the segmented control, the captions, the headline and the slow camera push are the scene `gallery-reframe`); the tiles are any painters instead of the eight illustrated photos; no grain. Compare (grid → mosaic, frames 56–96): pass (three tile centres at 0 px, events ±0 frames, SSIM drop 0.03).
- **Pitfalls**: Put the subject of each picture near its centre; portrait prints crop landscape pictures to a strip.
