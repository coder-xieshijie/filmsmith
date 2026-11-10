---
id: api-page
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### api-page

- **Structure**: six panels on the paper: `T` title bar (1008 × 104), `L` endpoint list (340 × 760), `F` reference (644 × 300), `Bo` code (644 × 180), `R` response (644 × 120), `K` SDK chips (644 × 88).
- **Intent**: Generated docs look complete at a glance: list, reference, code, response and SDKs in one page.
- **Content**: The product facts (title, version, file, 2–6 endpoints, body, call, SDKs), a reference title (≤ 24 / 12 字), a code sample.
- **States**: `empty` (outlines only), `chosen` (contents, the highlight in the accent on the followed endpoint), `settled` (the highlight in the ink).
- **Sizes**: S 504 × 444, M 756 × 666, L 1008 × 888.
- **Swap points**: `product` (facts), `ref` (text), `code` (code); without them the made-up sample product is drawn.
- **Parameters** and **Roles**: `colors` (the look's roles), `lang`, `ground`, `corners` or `dot` where the look has a form variant; roles ground, paper, ink, dim, line, accent, onAccent.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph; avoid none.
- **Source**: own (`assets/templates/morph/film.js (PANELS, panelContent)`), split from the morph style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: It is a schematic page; do not put a real product's screenshot style on it.
