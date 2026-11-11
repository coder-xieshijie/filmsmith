---
id: lap-loop
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### lap-loop

- **Purpose**: An iterative process: a closed loop of 3–4 steps with a token running one lap per milestone, a timing diagram that steps up once per lap, a read-out, a gate rule and an aside.
- **Intent**: Show iteration as laps the eye can count: each lap raises the trace one step, so progress is visible without numbers.
- **Content**: Label, title, sub, 3–4 steps (≤ 34), 2–4 milestones (≤ 4), counter and track labels, a gate (title, sub), an aside.
- **Fits**: `demo`; A process that repeats until it reaches a goal: staged rollouts, retries, training epochs, polling. **Not for**: Linear pipelines (use exploded-chain); more than four steps or milestones.
- **Layout and camera**: label, title, sub; the loop at the left with the steps at its corners, the token on it; the timing diagram at the right from Rx with its track label, the trace stepping up per lap; the read-out under the loop; the gate rule and the aside at the right; the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | Detail 03 · Stages / 详图 03 · 分阶段 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Detail 03 — each stage, a lap / 详图 03 — 每个阶段一圈 |
  | `title` | text | primary | 1 | 1 words, 10 chars | 4 chars | STAGES / 分阶段 |
  | `sub` | text | glance | 1 | 6 words, 60 chars | 16 chars | Widen, wait, check, repeat. / 放量、等待、检查、再来。 |
  | `steps` | list of text | primary | 3–4 | 3 words, 34 chars | 8 chars | ["Widen","Wait 10 min","Check canary","H… / ["放量","等 10 分钟","查金丝雀","停或继续"] |
  | `milestones` | list of text | glance | 2–4 | 6 chars | 6 chars | ["1 %","10 %","50 %","100 %"] / ["1%","10%","50%","100%"] |
  | `counterLabel` | text | glance | 1 | 1 words, 12 chars | 4 chars | Share / 比例 |
  | `trackLabel` | text | glance | 1 | 1 words, 14 chars | 4 chars | Audience / 受众 |
  | `gate` | group | – | 1 | – | – | {"title":"Over limit → roll back","sub":… / {"title":"超限 → 自动回滚","sub":"无需人工"} |
  | `aside` | group | – (optional) | 1 | – | – | {"head":"Why laps","text":"Each lap wide… / {"head":"为什么分圈","text":"每圈通过后才放量。"} |

- **Length**: 7–16 beats (3.5–8 s at 120 BPM); longer copy reads longer; the sample plans 11 beats in English, 12 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival; title 1; sub 1.5; loop 1.7; axis 2.0; laps from 2.6, one per milestone, the last ending on 5.0; gate 3.2; aside 3.6; the run-out and the token's fade over by 5.5.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` per line and on the loop, `tick` per lap, `tick` on the gate.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/loop.js; choreography.js CUES.loop`), split from the template of the blueprint style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: Four two-word steps and a long gate push the reading past the build; keep steps to one word where possible.
