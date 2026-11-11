---
id: option-pick
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### option-pick

- **Purpose**: A page of decisions: each question has two options, the person's pick fills in the accent and its note appears; a summary box and an ink confirm block with a tick close the page; an ink frame walks the picks while it holds.
- **Intent**: Show that a person decides, and what: the accent fills the chosen option, so the viewer sees each decision being made.
- **Content**: Page head (number, title, caption), 1–3 questions with two options (≤ 16 chars) and a note, a summary (≤ 40 chars) and a confirm line.
- **Fits**: `demo`, `turn`; A chapter page where a person decides something the product then acts on: settings, reviews, approvals. **Not for**: More than three questions; options longer than a short phrase; decisions the product makes alone (the accent means a person).
- **Layout and camera**: page head (num 120 px, title fitted to 706 px, caption at column 8, rule at y 300); questions from y 360, 150 px apart: question 34/40 px at column 1, options as boxes at columns 5–8 and 9–12; summary box at y 800, confirm block at columns 9–12; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `num` | number | glance | 1 | 2 chars | 2 chars | 02 / 02 |
  | `title` | text | primary | 1 | 2 words, 10 chars | 5 chars | Decide / 决定 |
  | `caption` | text | glance | 1 | 8 words, 48 chars | 18 chars | Two questions before the run. / 运行前的两个问题。 |
  | `rows.q` | list of text | primary | 1–3 | 5 words, 24 chars | 10 chars | Batch the backfill? / 分批回填吗？ |
  | `rows.options` | list of list | – | 1–3 | – | – | ["Yes","No"] / ["是","否"] |
  | `rows.pick` | list of index | – | 1–3 | – | – | 0 / 0 |
  | `notes` | list of text | glance | 0–2 | 6 words, 36 chars | 14 chars | ["picked by the person"] / ["由人来选"] |
  | `summary` | text | glance | 1 | 3 words, 24 chars | 8 chars | Decision summary / 决定摘要 |
  | `confirm` | text | primary | 1 | 3 words, 14 chars | 6 chars | You confirm. / 你来确认。 |

- **Length**: 8–20 beats (4–10 s at 120 BPM); longer copy reads longer; the sample plans 11 beats in English, 15 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: page head; each question rises, its options draw, the pick fills (0.35 s expoOut) and its note appears, paced by reading; summary, then the confirm block and its tick; a frame walks the picks a beat at a time; the page rolls up bottom-first.
- **Needs**: motions walk-frame; props poster-chrome; roles paper, ink, dim, line, grid, accent, onAccent, onInk; type display, text, mono.
- **Sound**: `tick` per question, `accent` per pick, `stamp` on the confirm.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (options)`), split from the template of the plakat style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: The unpicked option must stay ink outline: filling both makes the accent stop meaning a decision.
