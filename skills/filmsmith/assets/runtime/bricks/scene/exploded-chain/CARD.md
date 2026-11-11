---
id: exploded-chain
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### exploded-chain

- **Purpose**: The whole flow as an exploded view: 2–5 nodes float apart on dash-dot centre lines between two amber ends, then snap into one chain on a beat; amber brackets over the ends, a loop label, a claim and its sub.
- **Intent**: Assemble the system in front of the viewer: separate parts click into one chain, and the people at its ends are amber.
- **Content**: Title (≤ 26), two ends (word ≤ 5, sub ≤ 16), an end tag, 2–5 nodes (≤ 12), a loop label, a claim (≤ 36), a sub.
- **Fits**: `demo`, `claim`; The flow with people at both ends: who starts it, what runs, who signs. **Not for**: Flows with branches; more than five nodes; flows with no person (the ends are people).
- **Layout and camera**: title at 100 px; the chain on one axis: two amber end boxes (YOU 100 px) and the nodes between, floating apart on dash-dot centre lines until the snap; brackets over the ends with their tags; the loop label under the chain; claim 35/40 px and sub below; the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | Assembly / 装配 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Fig. 5 — assembly / 图 5 — 装配 |
  | `title` | text | primary | 1 | 4 words, 26 chars | 10 chars | One chain, two people / 一条链，两端是人 |
  | `ends.word` | list of text | primary | 2–2 | 1 words, 5 chars | 2 chars | YOU / 你 |
  | `ends.sub` | list of text | glance | 2–2 | 3 words, 16 chars | 6 chars | write the change / 写下改动 |
  | `endTag` | text | glance | 1 | 1 words, 12 chars | 4 chars | Person / 人 |
  | `nodes` | list of text | glance | 2–5 | 2 words, 12 chars | 4 chars | ["plan","stage","canary"] / ["计划","分阶段","金丝雀"] |
  | `loop` | text | glance (optional) | 1 | 8 words, 48 chars | 16 chars | a failed canary returns to the plan / 金丝雀失败就退回计划 |
  | `claim` | text | primary (optional) | 1 | 5 words, 36 chars | 14 chars | People at both ends. / 两端都是人。 |
  | `claimSub` | text | glance (optional) | 1 | 10 words, 90 chars | 24 chars | The machine runs only what a person sign… / 机器只执行人签过字的计划。 |

- **Length**: 7–16 beats (3.5–8 s at 120 BPM); longer copy reads longer; the sample plans 8 beats in English, 10 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival; title 1; axis 1.5; ends 1.7; nodes from 1.9, 0.25 beat apart; the snap on 3.25 (a crit spring); brackets 3.6; loop 3.9; claim 4.2; sub 4.6; build over on 5.5.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` on the title, `tick` on the ends, `hit` on the snap (a tom and a rim), `accent` on the brackets.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/assembly.js; choreography.js CUES.assembly`), split from the template of the blueprint style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: A six-word claim reads past the build at 100 BPM; keep it to five words.
