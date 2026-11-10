---
id: chart-frame
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### chart-frame

- **Structure**: chapter label top left, the accent key top right, a progress rule along the bottom with a tick per chapter, the source line bottom left, the legend bottom right.
- **Intent**: The source and the unit stay on screen, so every number in the film reads as checked.
- **Content**: Chapter label (≤ 24 / 10 字), the accent key (≤ 30 / 12 字), number of chapters, a source line (≤ 60 / 24 字), legend entries.
- **States**: `chapter` index moves the progress tick; `key` shows or hides the accent key.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `chapters` (list), `key` (text), `source` (text), `legend` (text); without them the made-up sample product is drawn.
- **Parameters** and **Roles**: `colors` (the look's roles), `lang`, `ground`, `corners` or `dot` where the look has a form variant; roles ground, ink, dim, line, accent, base.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid morph, halftone.
- **Source**: own (`assets/templates/tally/index.html, layouts.js (frame)`), split from the tally style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Keep it to the corners; the frame must never cover the squares.
