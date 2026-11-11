---
id: walk-frame
category: motion
tier: T0
family: shape
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### walk-frame

- **Looks**: a thin black rectangle steps down a list one row per beat, the list itself still.
- **Tier**: T0. **Family**: shape. **Surface**: canvas.
- **Use**: The hold of any plakat page with two or more items: rows, options, nodes. **Not for**: Pages still landing (it starts once settled); single-item pages; dark films where a frame reads as a selection UI.
- **Intent**: Keep the beat on a still page without rewriting it: one small frame moves, the content stays readable.
- **Content**: The page's item rects in reading order.
- **Parameters**: `items` (the sample list); in scenes the item rects come from the page; roles read: `paper`, `ink` (the frame), `dim`.
- **Theory**: A small moving element on a still field is pre-attentive and reads as a pointer, not new content (Ware 2012); keeping it on the beat lets the hold carry the music without costing reading time.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Length and easing**: 4 beats in the sample; in a scene it runs from 0.3 u after settling to a quarter beat before the exit; each hop 0.12 s power2.out from 0.06 s before the beat.
- **Sound**: none of its own; the bed's beat.
- **Source**: own (`assets/templates/plakat/scenes.js (walk frame), timing.rules.js (holds)`), split from the template of the plakat style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: Above about 140 BPM a hop each beat reads as nervous; walk every second beat there.
