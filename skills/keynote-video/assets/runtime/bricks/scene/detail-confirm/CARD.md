---
id: detail-confirm
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### detail-confirm

- **Purpose**: Decisions a person settles: leaders run from 2–3 questions to their answers, an amber bracket closes the chosen answers, a summary box with a note, and the amber stamp lands on beat 5 with a push-in and a thud.
- **Intent**: Show the moment a person decides, and certify it: the answers are bracketed in amber and stamped on the beat.
- **Content**: Label, a one-word title, a sub, 2–3 questions (≤ 56) with answers (≤ 12), a round label, a summary (≤ 48), a note, a stamp word and small line.
- **Fits**: `turn`, `demo`; A sheet where a person answers what the product will then do: a policy, a review, a sign-off. **Not for**: Decisions a machine makes; more than three questions; answers longer than 12 characters.
- **Layout and camera**: label, one-word title at 140 px (baseline 325), sub at 402; rows from y 500: round tag, question at 35/40 px, a dashed leader to the answer box at the right; the amber bracket over the answers; summary box at y 760 with its note; stamp solved clear of the lettering (−5°); the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats; the push-in (×1.045–1.12) from 1.5 to 0.5 beats before the stamp, held one beat after, back in 0.6 beat; the label panel folds meanwhile.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | Detail 02 · Sign-off / 详图 02 · 签字 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Detail 02 — the owner’s review / 详图 02 — 负责人评审 |
  | `title` | text | primary | 1 | 1 words, 10 chars | 4 chars | REVIEW / 评审 |
  | `sub` | text | glance | 1 | 6 words, 90 chars | 20 chars | Answered once, by the flag owner. / 由开关负责人一次答完。 |
  | `rows.q` | list of text | primary | 2–3 | 5 words, 56 chars | 12 chars | First audience? / 先给谁？ |
  | `rows.a` | list of text | primary | 2–3 | 4 words, 12 chars | 6 chars | Staff, 1 % / 员工 1% |
  | `roundLabel` | text | glance | 1 | 1 words, 6 chars | 3 chars | Ask / 问 |
  | `summary` | text | primary | 1 | 10 words, 48 chars | 20 chars | Plan 7 · staff · abort > 1 % / 计划 7 · 员工 · 错误超 1% 即中止 |
  | `note` | text | glance (optional) | 1 | 5 words, 28 chars | 14 chars | saved → plans/7.toml / 已存 → plans/7.toml |
  | `stamp` | group | – | 1 | – | – | {"word":"Signed","small":"by the owner"} / {"word":"已签字","small":"负责人"} |

- **Length**: 10–22 beats (5–11 s at 120 BPM); longer copy reads longer; the sample plans 16 beats in English, 21 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival; title on 1; sub 1.5; rows from 1.9 and answers from 2.5 (1.2 beats spread); summary 4.0, note 4.25; the push 4.5–5.5; the stamp on beat 6 (5 after arrival) with a thud; return; build over on 8, two beats still.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` per line, `tick` per answer, `stamp` with the bed ducked, `turn` on a flood.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/detail.js; choreography.js CUES.detail, STAMP_B, ISSUE_N0`), split from the blueprint style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: `issue: true` only times the flood: the print itself is the host's shape-flood transition between the vellum and the print palettes.
