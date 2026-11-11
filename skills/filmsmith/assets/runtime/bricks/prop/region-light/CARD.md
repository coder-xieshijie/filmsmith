---
id: region-light
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### region-light

- **Structure**: the veil (the ground at 52 %, porcelain 40 %) over a rect with an even-odd hole; the hole a box padded 14 px or a full-width band; the ring 4 px of the accent on a 9 px under-stroke of the ground, padded 8 px, radius 10; the tick 8 × 48 px.
- **Intent**: The viewer looks where the film points, and the asset stays exactly as captured.
- **Content**: An asset and one region on it (a box, or a band for a row of a table or list).
- **States**: `off` → `veiled` → `ringed` → `band`; the veil opens round a box, the ring draws on clockwise from the top-left in 0.25 s, the tick follows; the band state hops a full-width row.
- **Sizes**: S 640 × 400, M 1152 × 720, L 1600 × 1000.
- **Swap points**: `asset` (image; the neutral placeholder page without one).
- **Parameters** and **Roles**: `veil`, `rows` (band rows as shares of the height), `box` (the ringed box as shares), `colors`; roles ground, accent.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, exhibit, any real-asset launch; avoid tally.
- **Source**: own (`assets/templates/handset/film.js (paintScreen light, the level tick)`), split from the template of the handset style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; language-free (no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Size the box or band round whole words: the light’s edge must not cut a word. Ring one region at a time.
