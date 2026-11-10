---
id: review-callouts
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### review-callouts

- **Purpose**: The problem as open review items: a two-line headline lettered on its construction lines, a bus feeding 2–4 boxes of key and value, each with an amber revision triangle, one phrase underlined in amber.
- **Intent**: State the problem the way a reviewer would: as open items on the drawing, each flagged by a person.
- **Content**: Label, two headline lines (≤ 22 chars), a phrase of line 2 to underline, 2–4 key/value items (≤ 12 / 11), a note.
- **Fits**: `hook`, `problem`; The opening sheet of a blueprint film: what is wrong today, as items a reviewer has marked. **Not for**: Problems that are not a list of facts; more than four items; a reviewer who is not a person (the amber means one).
- **Layout and camera**: label at (150, 180); lines at baselines 325 and 497, 140 px fitted to 1640 (≥ 100); bus at y 610 from the first to the last box centre; boxes 190 px tall from y 652 across the content width, 40 px gaps; key 25 px, value 70 px; triangles 52 × 46 at the top right of each box; note at y 918 under an amber rule; the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | Problem statement / 问题说明 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Fig. 1 — how flags ship today / 图 1 — 现在怎么上线开关 |
  | `lines` | list of text | primary | 2–2 | 4 words, 22 chars | 9 chars | ["Flags flip live.","Nobody signs off."] / ["开关直接上线。","没人签字。"] |
  | `mark` | text | glance (optional) | 1 | 3 words, 22 chars | 6 chars | signs off. / 签字 |
  | `items.key` | list of text | glance | 2–4 | 2 words, 12 chars | 5 chars | Rollout / 发布范围 |
  | `items.value` | list of text | glance | 2–4 | 2 words, 11 chars | 5 chars | everyone / 所有人 |
  | `note` | text | glance (optional) | 1 | 4 words, 24 chars | 10 chars | Four open items / 四个未决项 |

- **Length**: 7–14 beats (3.5–7 s at 120 BPM); longer copy reads longer; the sample plans 8 beats in English, 8 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival (beat 0–1); line 1 on beat 1 with its guides, line 2 on 1.75; the underline and the bus on 2.5; boxes 0.5 beat apart from 2.75; the note on 2.5 + 0.5 n; the build ends on 5.5, two beats still.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` per line (pen rims), `accent` on the underline and the note, `tick` per box.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/problem.js; choreography.js CUES.problem`), split from the blueprint style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: The mark must be a substring of line 2 exactly; in Chinese mark whole words, the underline follows the measured characters.
