---
id: drafting-stamp
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### drafting-stamp

- **Structure**: paper fill at 0.74, a 6 px inner frame and a 2 px outer ring 13 px out, the word in Plex Sans Condensed 700 tracked 0.06 em (Chinese 0), the small line in Plex Mono 600 tracked 0.24 em at 0.3 of the word size (≥ 25, Chinese ≥ 28), eroded by seeded fbm and specks (the small line wears at most to 60 %).
- **Intent**: Make a decision or a check land like an office stamp: on the beat, beside what it certifies, in the colour of who did it.
- **Content**: A word (≤ 10 chars) and a small line (≤ 18); the role: accent (a person) or line (a machine).
- **States**: `hidden`, `dropping` (0.08 s before landing: 1.6× and turning), `landed` (settled at its angle).
- **Sizes**: S 360 × 160, M 540 × 240, L 720 × 320.
- **Swap points**: `word`, `small` (text), `role` (`accent` | `line`).
- **Parameters** and **Roles**: `colors`, `palette`, `lang`, `seed` (the wear), `ground` (paper under it in the sample); roles paper, accent, line.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/fx.js (makeStamp, drawStamp)`), split from the template of the blueprint style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: A line-colour stamp still lands with a thud: do not make it amber to make it louder.
