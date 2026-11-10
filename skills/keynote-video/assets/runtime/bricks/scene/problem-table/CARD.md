---
id: problem-table
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### problem-table

- **Purpose**: A one- or two-line headline at 164 px shrinks into the heading of a table of what is broken; rows rise, ink flags wipe over their values one by one, an ink frame steps over the rows, and a full-screen accent wipe closes it.
- **Intent**: The problem is stated large, then shown to be concrete: each broken fact gets its own row and an ink flag, so the claim that follows answers something real.
- **Content**: 1–2 headline lines (≤ 18 chars each), 1–4 rows of a label (≤ 12 chars) and a value (≤ 12 chars).
- **Fits**: `hook`, `problem`; The hook of a claim-plus-steps film: the problem stated, then itemised as facts. **Not for**: Problems without countable facts; more than four rows; a film with no person to hand the accent to (the wipe means what the person brings).
- **Layout and camera**: headline lines at (96, 186 + 186 i), 164 px fitted to 1728 px (≥ 120); the group shrinks to 0.5 about (96, 190) and up 32 px; table rule at y 430, rows 125 px apart: index at x 96, label at x 242 (88 px, fitted to column 8), value at x 1146 (47 px), the ink flag over columns 8–12; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of text | primary | 1–2 | 5 words, 18 chars | 8 chars | ["Agents write SQL.","Nobody reads it."] / ["代理在写 SQL。","没人读它。"] |
  | `rows.label` | list of text | primary | 1–4 | 2 words, 12 chars | 5 chars | DROP COLUMN / 删除列 |
  | `rows.value` | list of text | primary | 1–4 | 3 words, 12 chars | 6 chars | users.email / users.email |

- **Length**: 8–24 beats (4–12 s at 120 BPM); longer copy reads longer; the sample plans 16 beats in English, 23 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: line 1 at 0.5 u (1 beat), line 2 once line 1 is read; the shrink 0.15 u before the first row; rows paced by reading (≥ 1 beat apart); each row's flag as the next row rises; the frame walks a beat at a time once settled; the wipe over the last 0.45 u.
- **Needs**: motions walk-frame; props poster-chrome; roles paper, ink, dim, grid, accent, onAccent, onInk; type display, text, mono.
- **Sound**: `land` per headline line, `tick` per row, `stamp` per flag, `turn` on the wipe.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (problem)`), split from the plakat style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: The wipe is the film's only full-frame accent outside the claim; without a claim after it, turn it off (`wipe: false`). Values longer than 12 characters step down to 34 px and stop reading as flags.
