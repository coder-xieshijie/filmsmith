---
id: sheet-hud
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sheet-hud

- **Structure**: border 2.5 px at 24 px and a guide at 36 px, zone ticks 1–8 / A–D (15 px, decoration); label panel at (44, 40), 96 px tall, width from its longest string, bubble n / N at (98, 88); corner note right-aligned at (1856, 84); scale bar at (64, 1000); title block right-aligned to 1880, bottom 1040, 156 px tall: APPROVED BY cell (≥ 250 px), the name at 40 px, SHEET and SCALE cells.
- **Intent**: The frame says this is one drawing and where you are in it: sheet n of N, the scale the camera is at, who approved it.
- **Content**: Product name (≤ 12), product line (≤ 28), corner note (≤ 24), the sheet's name, sheet number and total; optionally the fixed words.
- **States**: `blank` (nothing), `drawn` (the whole frame), `folded` (the panel folded to the bubble, SCALE reading 1.1:1, as while pushed in).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `title`, `subtitle`, `corner`, `name` (text), `sheet` and `total` (numbers, `sheet: 'all'` for the overview), `words` { `approvedBy`, `sheet`, `scale`, `sheetLabel` (a `{n}` placeholder for Chinese 第 {n} 张), `all` }.
- **Parameters** and **Roles**: `colors`, `palette`, `lang`, `paper` (draw a blank sheet under it), `seed`; roles ground, paper, ink, line, accent.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/hud.js`), split from the template of the blueprint style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: The label panel folds while the camera is pushed in; a host that does not pass the fold lets it cover the sheet title.
