---
id: token-bar
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### token-bar

- **Structure**: `cells` (one per unit, 3 px apart, up to 14 px wide; with `kinds` a learned token's cell takes the learned colour), `label` and `count` at the left.
- **Intent**: The total the run reduces is always visible, so every step's saving is felt.
- **Content**: The starting count and the current count (≤ 150 units); a label (≤ 10 / 4 字).
- **States**: `full`, `reduced` (cells past the count shrink away), `lit` (the learned colour).
- **Sizes**: S 700 × 120, M 1200 × 160, L 1680 × 200.
- **Swap points**: `label` (text); without them the made-up sample product is drawn.
- **Parameters** and **Roles**: `colors` (the look's roles), `lang`, `ground`, `corners` or `dot` where the look has a form variant; roles ground, ink, dim, learned, cell.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace, any diagram; avoid none.
- **Source**: own (`assets/templates/trace/pieces.js (token bar)`), split from the template of the trace style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Keep it at the same place all film; it is the through-line.
