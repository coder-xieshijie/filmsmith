---
id: numeral-chapter
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### numeral-chapter

- **Purpose**: A chapter card: a 640 px numeral on one side, a mono label, the chapter title at 225 px over a 12 px ink rule and a caption; the numeral steps 6 px on every beat while it holds.
- **Intent**: The film announces its structure like a poster series: a giant numeral says where you are before the page says what.
- **Content**: Number (1–2 digits), label (≤ 14 chars), title (≤ 14 chars), caption (≤ 40 chars); side left or right.
- **Fits**: `turn`, `rest`; Between parts of a claim-plus-steps film: one card per chapter, two seconds each. **Not for**: Films with one part; titles longer than two words; a film already paced by another chapter device.
- **Layout and camera**: numeral 640 px Inter Tight 800 −0.06 em at x 96 (side left) or right-aligned to x 1824; label at column 7, title 225 px fitted to 858 px (≥ 160), 12 px rule, caption 34/40 px; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `num` | number | primary | 1 | 2 chars | 2 chars | 01 / 01 |
  | `label` | text | glance | 1 | 6 words, 32 chars | 12 chars | The agent writes the plan / 代理先写出计划 |
  | `title` | text | primary | 1 | 1 words, 8 chars | 4 chars | Draft / 起草 |
  | `caption` | text | glance | 1 | 6 words, 40 chars | 16 chars | Four statements, one file. / 四条语句，一个文件。 |

- **Length**: 3–12 beats (1.5–6 s at 120 BPM); longer copy reads longer; the sample plans 4 beats in English, 4 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: numeral rises 0.6 s; label, title (0.1 u later), rule grows 0.5 s, caption; the numeral steps 6 px on each beat while it holds; everything sinks 0.125 u before the end.
- **Needs**: motions none; props poster-chrome; roles paper, ink, dim, grid; type display, text, mono.
- **Sound**: `land` low (tom and thud) on the numeral, `tick` on the rule.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (chapter)`), split from the plakat style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: Two chapter cards in a row lose the numeral's weight; put a page between them.
