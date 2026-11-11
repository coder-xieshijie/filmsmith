---
id: block-carry
category: motion
tier: T2
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### block-carry

- **Looks**: the page clears bottom-up under a black (or accent) block; the block glides and reshapes into the next page's bar or node; the big type rises round it.
- **Tier**: T2. **Family**: shape. **Surface**: canvas.
- **Use**: A seam between two plakat pages where the outgoing page ends on a solid block the next page also needs: a command block to a bar, a pick to a node. **Not for**: Pages with no solid block; outlined boxes (the block must be filled to read as the same object); seams that change colour meaning.
- **Intent**: Keep one solid shape across the cut so two pages read as one argument; the colour keeps its meaning (ink the system, accent the person).
- **Content**: The block's rect on each page and its kind (ink or accent); the pages on either side.
- **Parameters**: `kind` (`ink` | `accent`), `from` and `to` ([x, y, w, h]), `fromText` (the command on the block), `title` (the outgoing page's), `toLines`, `label` (the person's node); roles read: `paper`, `ink` (an ink block), `accent` and `onAccent` (the person's block), `onInk`.
- **Theory**: Object constancy (Heer & Robertson 2007): a single shape that survives the cut ties two pages; changing only position and size is the cheapest change for the eye to follow (one variable at a time).
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Length and easing**: 2 beats: roll-up over the first half beat (power2.in), the rect over one beat (expoInOut) landing on the downbeat, the incoming type over the last half beat.
- **Sound**: a swept whoosh while the block crosses; ink: a 66 Hz thud on the beat; accent: the marimba stroke of the `accent` cue.
- **Source**: own (`assets/templates/plakat/devices.js (plakat-reblock); scenes.js tagline/flow `from``), split from the template of the plakat style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: The incoming scene must be told (`enterBy: reblock`, `from`) or it draws its own block a second time.
