---
id: anchor-mark
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### anchor-mark

- **Structure**: `anchor` (the accent path, 15° dots shaded top to bottom, a 3 px paper trap), `plate` (the ink paths, 45° dots darkest at the anchor), `rings` (the field in mark space, λ = the mark's ring spacing).
- **Intent**: The brand piece is a printed object: process-ink dots on paper, the black plate round it.
- **Content**: The mark as SVG paths in mark units (accent piece, ink plate, box, anchor box).
- **States**: `anchor` (alone), `inking` (the plate inking out of the anchor, half the rings), `mark`, `rings` (the mark with its rings).
- **Sizes**: S 360 × 260, M 720 × 520, L 1080 × 780.
- **Swap points**: `mark` (svg-paths); without them the made-up sample product is drawn.
- **Parameters** and **Roles**: `colors` (the look's roles), `lang`, `ground`, `corners` or `dot` where the look has a form variant; roles ground, ink, accent.
- **Styles**: made for `halftone` (recipe the halftone recipe); fits halftone; avoid none.
- **Source**: own (`assets/templates/halftone/film.js (drawAnchor, drawMark, drawMarkRings), content.js mark`), split from the template of the halftone style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; big words take Noto Sans SC 800 after Bricolage Grotesque; Chinese line spacing 1.18 instead of 1.08; the product name stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the halftone template (`assets/templates/halftone/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the halftone recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: The anchor always knocks out to paper, also on an ink ground.
