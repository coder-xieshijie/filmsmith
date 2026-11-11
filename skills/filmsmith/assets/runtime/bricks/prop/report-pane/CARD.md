---
id: report-pane
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### report-pane

- **Structure**: the bench from x 1320; the label mono 25 `mutedOnBench` at y 310; the claim 59 px at y 390 and 464; lines from y 556, 45 px apart: status at x 1360, the item 78 px right in `mutedOnBench`, the value right-aligned at x 1824; the result line bold at y 756.
- **Intent**: The proof is the tool’s own output, read beside the thing it measured.
- **Content**: A label, 1–5 lines of [status, item, value] (≤ 30 characters), a result line; a claim of 1–2 phrases (≤ 2 words).
- **States**: `labelled` → `lines` → `result`; labelled, lines, result.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `claim`; the report is data (`report: { label, lines, result }`).
- **Parameters** and **Roles**: `report`, `claim`, `colors`, `lang`; roles bench, onBench, mutedOnBench.
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/film.js (reportPane)`), split from the template of the split style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; report lines are what the tool prints and stay Latin; the claim above translates (≤ 7 characters a phrase).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: none known.
