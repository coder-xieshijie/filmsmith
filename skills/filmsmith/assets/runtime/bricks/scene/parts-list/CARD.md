---
id: parts-list
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### parts-list

- **Purpose**: Getting started as a parts list: a bill-of-materials table of 1–3 rows with BOM balloons, then a chain of 2–5 chips (the first steps) under a THEN label, and a note.
- **Intent**: Tell a developer exactly what to fetch and do first, in the drawing office's own form: a parts list.
- **Content**: Title, two heads, 1–3 rows (code ≤ 60), a then label, 2–5 chips (≤ 16), a note.
- **Fits**: `demo`, `rest`; The install / getting-started sheet near the end of a blueprint film. **Not for**: More than three commands; commands longer than 60 characters; products without a command line.
- **Layout and camera**: title at 100 px; the table from y 430: head row, 1–3 rows at 35 px Plex Mono with numbered balloons; THEN at y_b + 56 and the chips in a chain across the content width; the note at the bottom; the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | Parts list / 零件表 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Fig. 6 — parts list / 图 6 — 零件表 |
  | `title` | text | primary | 1 | 4 words, 26 chars | 10 chars | Install in one line / 一行命令安装 |
  | `head` | list of text | glance | 2–2 | 1 words, 8 chars | 4 chars | ["Item","Command"] / ["项","命令"] |
  | `rows` | list of code | primary | 1–3 | 60 chars | 60 chars | ["npm i -g lintel","lintel init --store … / ["npm i -g lintel","lintel init --store … |
  | `thenLabel` | text | glance | 1 | 1 words, 8 chars | 4 chars | Then / 然后 |
  | `chips` | list of text | glance | 2–5 | 3 words, 16 chars | 6 chars | ["draw a plan","sign it","stage it"] / ["画一份计划","签字","分阶段发布"] |
  | `note` | text | glance (optional) | 1 | 10 words, 90 chars | 30 chars | Works with any flag store. / 支持任何开关服务。 |

- **Length**: 7–14 beats (3.5–7 s at 120 BPM); longer copy reads longer; the sample plans 9 beats in English, 13 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival; title 1; table 1.5; rows from 1.8 over 0.8 beat; then 2.8; chips from 3.0 over 1 beat; note 4.2; build over on 5.5.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` per row, `tick` per chip.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/parts.js; choreography.js CUES.parts`), split from the template of the blueprint style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: Rows are code: keep them Latin; only the heads, chips and note translate.
