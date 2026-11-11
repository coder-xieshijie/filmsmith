---
id: step-matrix
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### step-matrix

- **Purpose**: A matrix of steps by targets: an accent cursor walks the cells, each finished cell is marked DONE and its column gets an accent underline; a 400 px side numeral counts columns and a strip sums the run.
- **Intent**: Show a run as progress through a grid: one cursor, one cell at a time, so order and completeness read at once.
- **Content**: Page head, 2–4 row names, 2–5 column names (≤ 10 chars), a done label, a side number and a strip line.
- **Fits**: `demo`, `proof`; A chapter page where the same steps run over several targets: databases, regions, services, files. **Not for**: More than 4 × 5 cells; steps that run in parallel (the cursor is one at a time).
- **Layout and camera**: page head; the matrix from y 380 in columns 1–9, cells 122 × 96 px; side numeral 400 px at column 10; strip at y 880; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `num` | number | glance | 1 | 2 chars | 2 chars | 04 / 04 |
  | `title` | text | primary | 1 | 2 words, 10 chars | 5 chars | Loop / 循环 |
  | `caption` | text | glance | 1 | 8 words, 48 chars | 18 chars | Every statement runs the same three chec… / 每条语句都跑同样三项检查。 |
  | `corner` | text | glance | 1 | 2 words, 18 chars | 6 chars | Statement / 语句 |
  | `cols` | list of text | glance | 2–3 | 1 words, 6 chars | 3 chars | ["Lint","Lock","Replay"] / ["检查","锁","回放"] |
  | `rows` | list of text | primary | 2–4 | 4 words, 18 chars | 8 chars | ["S1 add column","S2 backfill","S3 swap … / ["S1 新增列","S2 回填","S3 切换读取"] |
  | `done` | text | glance | 1 | 1 words, 7 chars | 3 chars | DONE / 完成 |
  | `side` | group | – | 1 | – | – | {"label":"Failures","big":"0","caption":… / {"label":"失败","big":"0","caption":"共 12 … |
  | `strip.text` | list of text | primary | 0–2 | 5 words, 24 chars | 11 chars | Same checks every time. / 每次都是同样的检查。 |
  | `strip.note` | list of text | glance | 0–2 | 6 words, 24 chars | 12 chars | runner v2 · fixed order / runner v2 · 顺序固定 |

- **Length**: 8–20 beats (4–10 s at 120 BPM); longer copy reads longer; the sample plans 12 beats in English, 20 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: page head; rows and column heads land; the cursor moves one cell a beat, each passed cell turns DONE; a column's underline when it completes; the side numeral steps; the strip; roll-up exit.
- **Needs**: motions walk-frame; props poster-chrome; roles paper, ink, dim, grid, accent, onInk; type display, text, mono.
- **Sound**: `tick` per cell, `count` per completed column, `stamp` on the strip.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (matrix)`), split from the template of the plakat style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: The DONE label is a mono label: in Chinese it is 完成 at 28 px, not capitals.
