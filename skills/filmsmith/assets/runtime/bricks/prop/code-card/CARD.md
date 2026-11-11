---
id: code-card
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### code-card

- **Structure**: `title` (55 px), `tabs` (a track of 72 px pills, highlight inset 5 px), `code` (55 px mono), `endpoint` (35 px mono), `run` (236 × 92 pill with a play triangle).
- **Intent**: One call in one card, with the language the viewer uses one tab away.
- **Content**: A title (≤ 28 / 12 字), 1–4 tabs (language, code lines), a Run label (≤ 6 / 3 字).
- **States**: `idle`, `armed` (Run in the accent), `second` (the second tab), `console` (the ink material).
- **Sizes**: S 760 × 320, M 1140 × 480, L 1520 × 640.
- **Swap points**: `title` (text), `tabs` (list), `run` (text); without them the made-up sample product is drawn.
- **Parameters** and **Roles**: `colors` (the look's roles), `lang`, `ground`, `corners` or `dot` where the look has a form variant; roles ground, paper, ink, dim, line, accent, onAccent, inkDim, inkCard, inkEdge, inkTrack.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph; avoid none.
- **Source**: own (`assets/templates/morph/film.js (focusContents, TAB, RUN)`), split from the template of the morph style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: In the ink material the highlight is an outline; filling it in the accent would compete with the status line.
