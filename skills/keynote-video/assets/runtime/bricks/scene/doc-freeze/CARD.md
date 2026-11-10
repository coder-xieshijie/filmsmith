---
id: doc-freeze
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### doc-freeze

- **Purpose**: Two documents side by side: cells land, the added ones in the accent; a scan line passes, the documents fill ink and their frames thicken from 2 to 7 px; stamps and hashes land, and a four-step rail marks the active step.
- **Intent**: Make "it is locked now" visible: the ink fill and heavy frame turn a draft into a sealed document, and the stamp names who sealed it.
- **Content**: Page head, two documents (title, 3–8 cells, which cells are added), a stamp and a hash each, four step names and the active step.
- **Fits**: `demo`, `proof`; A chapter page about something becoming fixed: a plan frozen, a version signed, a spec locked. **Not for**: Documents with more than eight cells each; anything without a before and after; live editing.
- **Layout and camera**: page head; two documents at columns 1–6 and 7–12 from y 360 to 820, cells 34/40 px in rows; the scan line crosses both; stamps at the lower right of each, hashes under them; the step rail at y 880 with the active marker; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `num` | number | glance | 1 | 2 chars | 2 chars | 03 / 03 |
  | `title` | text | primary | 1 | 2 words, 10 chars | 5 chars | Freeze / 冻结 |
  | `caption` | text | glance | 1 | 8 words, 48 chars | 18 chars | Plan and checks, frozen before the run. / 计划和检查在运行前冻结。 |
  | `stamp` | text | glance | 1 | 1 words, 8 chars | 4 chars | FROZEN / 已冻结 |
  | `left` | group | – | 1 | – | – | {"title":"Plan","label":"0042_drop_email… / {"title":"计划","label":"0042_drop_email.s… |
  | `right` | group | – | 1 | – | – | {"title":"Checks","label":"shadow replay… / {"title":"检查","label":"影子回放 · 6 次","grou… |
  | `hashes` | list of code | glance | 0–2 | 30 chars | 30 chars | ["sha 8f3a…c21","sha 77b0…e9d"] / ["sha 8f3a…c21","sha 77b0…e9d"] |
  | `rail` | group | – | 1 | – | – | {"label":"Hand-off","steps":["Check the … / {"label":"交接","steps":["检查计划","确认格子","冻结… |

- **Length**: 10–20 beats (5–10 s at 120 BPM); longer copy reads longer; the sample plans 12 beats in English, 16 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: page head; cells land row by row (added ones in the accent, back easing); the scan line passes; the ink fill staggers 0.025 s per cell and frames grow 2 → 7 px; stamps and hashes; the rail's active step; roll-up exit.
- **Needs**: motions walk-frame; props poster-chrome; roles paper, ink, dim, grid, accent, onAccent, onInk; type display, text, mono.
- **Sound**: `tick` per row, `accent` on added cells, a `turn` whoosh with the scan, `stamp` per seal.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (document)`), split from the plakat style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: Hashes are code: keep them Latin and short (≤ 12 chars) or they collide with the stamp.
