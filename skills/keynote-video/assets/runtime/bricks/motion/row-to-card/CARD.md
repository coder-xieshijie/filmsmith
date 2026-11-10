---
id: row-to-card
category: motion
tier: T1
family: line-path
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### row-to-card

- **Looks**: Picked rows leave a side panel one after another: each lifts (slightly larger, a deeper shadow), travels on an upward arc to the open canvas, its size and corners following the position three frames late; on the way the row's content fades out and the card's fades in, never both at once; it lands with its own slight tilt and a short squash, and the slot it left stays behind as a dashed outline.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas.
- **Use**: moving things from a list into a workspace: picked items placed on a board, results added to a canvas, a selection becoming objects. **Not for**: re-ordering in place (`layout-morph`); more than about six items at once; a copy (the dashed slot says moved).
- **Intent**: The same items change form on the way from a list to a canvas, so the viewer reads them as moved and materialised, not deleted and re-added.
- **Content**: A panel of rows and an open canvas; 2–6 items, each with a row form (≤ 30 chars) and a card form (title ≤ 20 chars, a line or two).
- **Parameters**: `from` (the scene with the panel and the canvas, default `board`: a panel of rows with ticks and a "place" button), `items` (each `{ row, card, from, to, tilt }` with row and card painters; null: four neutral ones from the sample copy; exports `neutralRow`, `neutralCard`), `stagger` 6 frames, `lift` 220 px. Roles read: `panel`, `ink`, `dim`, `line`, `accent` (ticks, the card's top rule, the dashed slots).
- **Theory**: Object permanence across containers: the same object changing form on one continuous path reads as moved, not deleted and re-added; the dashed slot says "moved", not "copied".
- **Styles**: any interface style.
- **Length and easing**: 4 beats, 3.5–6 with more items; position on a spring (17, 95, 0.9), lift 4 frames, size lag 3 frames, squash 6 frames.
- **Sound**: one `land` per card (soft, stepping down), `accent` on the press that starts it (cursor-glide).
- **Source**: adapted from video-shotcraft `demos/interaction/canvas-materialize-moves/PanelToCanvasMaterialize.tsx` (card `references/shots/interaction/canvas-materialize-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the recipe list, names and quotes are the film's rows and cards (neutral painters by default, with skeleton bars); the cursor and the checkbox clicks are cursor-glide's and the scene's; speed blur by the runtime's sub-frames. Compare against `panel-to-canvas`: pass, 0 px, events ±0.
- **Pitfalls**: The slot a row leaves must stay as a dashed outline; if the panel looks untouched, the move reads as a copy. Never show the row and the card content at once on the way: one fades out before the other fades in.
