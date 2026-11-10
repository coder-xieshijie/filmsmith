---
id: poster-chrome
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### poster-chrome

- **Structure**: grid: both edges of the 12 columns (x = 96 + 146 (i − 1) and + 121), 1 px ink at the grid alpha; header: brand 28 px at x 96, tag at column 3, section at column 8, licence at column 11, 25 px mono capitals, over a 2 px rule at y 116; footer: URL at x 96, platforms at column 5, progress cells from column 8 to the margin (706 px) over a rule at y 962; paper tooth over the whole sheet, soft-light 0.5.
- **Intent**: The film reads as one printed series: the grid shows the system, the header names where you are, the footer counts how far along it is.
- **Content**: Brand (≤ 16 chars), tag (≤ 42), section (≤ 20), licence, URL, platforms; the number of bars and the current one.
- **States**: `blank` (nothing drawn), `drawn` (grid and rules in, type on), `onAccent` (half the frame under an accent field: the chrome splits to onAccent there).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `brand`, `tag`, `section`, `licence`, `url`, `platforms` (text), `bars` and `bar` (numbers); the neutral sample product without them.
- **Parameters** and **Roles**: `colors`, `lang`, `seed` and `paper` (tooth amount, 0 = flat), `bars`, `bar`; roles paper, ink, grid, accent, onAccent.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/index.html (#grid, #paper, #chrome)`), split from the plakat style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: Over an accent field the chrome switches to onAccent at the field edge; pass the field rects or the label sinks to 2.5:1.
