---
id: token-chip
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### token-chip

- **Structure**: `box` (rounded, radius 15 % of the height, fill 8–12 % of the outline colour), `label` (mono, 66 % of the height).
- **Intent**: A unit of data looks like a thing that can be merged, counted or tested, and its outline says what is happening to it.
- **Content**: A label in code (≤ 8 chars).
- **States**: `base`, `active` (the accent), `learned` (swells once), `unseen`.
- **Sizes**: S 180 × 60, M 300 × 100, L 480 × 160.
- **Swap points**: `label` (code); without them the made-up sample product is drawn.
- **Parameters** and **Roles**: `colors` (the look's roles), `lang`, `ground`, `corners` or `dot` where the look has a form variant; roles ground, ink, accent, base, learned, unseen.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace, any diagram; avoid none.
- **Source**: own (`assets/templates/trace/pieces.js (drawChip)`), split from the trace style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Four meanings at most; a fifth colour has no place in the legend.
