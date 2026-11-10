---
id: general-arrangement
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### general-arrangement

- **Purpose**: The claim as a general arrangement: a two-line headline, then input → system → output as three boxes on one axis with arrows, the system name large in the middle, an overall dimension under them.
- **Intent**: Show the product as one designed part between an input and an output, dimensioned like a real assembly.
- **Content**: Label, two lines (≤ 18 chars), a sub (≤ 6 words), input, system and output each a tag and a name.
- **Fits**: `claim`, `turn`; The claim of a system film: what goes in, what the product is, what comes out. **Not for**: Claims with branches or more than one product; names longer than 14 characters.
- **Layout and camera**: label (150, 180); lines at 325 / 497 (140 px); sub at y 575; three boxes on y 720 with tags above, the system box larger with its name at 100 px; arrows between; an overall dimension at y 880; the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | General arrangement / 总体布置 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Fig. 2 — general arrangement / 图 2 — 总体布置 |
  | `lines` | list of text | primary | 2–2 | 4 words, 18 chars | 8 chars | ["Drawn first,","shipped in stages."] / ["先画图，","再分批上线。"] |
  | `sub` | text | glance | 1 | 8 words, 90 chars | 20 chars | Each flag change becomes a plan. / 每次开关改动都变成一份计划。 |
  | `input` | group | – | 1 | – | – | {"tag":"Input","name":"FLAG CHANGE"} / {"tag":"输入","name":"开关改动"} |
  | `system` | group | – | 1 | – | – | {"tag":"Planner","name":"lintel"} / {"tag":"规划器","name":"lintel"} |
  | `output` | group | – | 1 | – | – | {"tag":"Output · staged","name":"ROLLOUT… / {"tag":"输出 · 分阶段","name":"发布"} |

- **Length**: 7–14 beats (3.5–7 s at 120 BPM); longer copy reads longer; the sample plans 8 beats in English, 12 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival; line 1 on beat 1, line 2 on 1.7; input on 2.3, arrow 2.8, system 3.0, arrow 3.5, output 3.7, sub 4.0, dimension 4.3; build over on 5.5.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` per line, `tick` per box, `land` on the dimension.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/arrangement.js; choreography.js CUES.arrangement`), split from the blueprint style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: Three names must leave 110 px between boxes; long names fail before they shrink.
