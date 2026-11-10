---
id: unit-mark
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-mark

- **Structure**: `mark`: a rounded square (radius 18 % of the side), or a dot of the same area, or a glyph (`doc` page with a folded corner, `box`, `chip`); drawn centred in its box.
- **Intent**: One mark stands for one item all film, so a viewer can count with their eyes.
- **Content**: Nothing but the choice of form: square, dot or a pictogram (page, box, chip).
- **States**: `base` (the neutral), `marked` (the accent), `swollen` (× 1.4 at the peak of a landing), `rest` (stepped back); unit-flight and rank-sweep move between them.
- **Sizes**: S 240 × 160, M 480 × 320, L 960 × 640.
- **Swap points**: ; without them the made-up sample product is drawn.
- **Parameters** and **Roles**: `colors` (the look's roles), `lang`, `ground`, `corners` or `dot` where the look has a form variant; roles ground, base, rest, accent.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid none.
- **Source**: own (`assets/templates/tally/marks.js`), split from the tally style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Never separate categories by shape; colour and place do that.
