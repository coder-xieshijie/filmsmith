---
id: poster-tagline
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### poster-tagline

- **Purpose**: The promise as the biggest type in the film: one or two lines at 225 px rise a quarter beat apart, a 28 px ink bar grows under them, a mono label rises under the bar; one emphasised word takes the accent.
- **Intent**: Restate the promise at full size in a pause, so it is the one sentence the viewer keeps; the accent word is the person.
- **Content**: 1–2 lines (≤ 17 chars each, `*word*` for the accent) and a label (≤ 60 chars).
- **Fits**: `climax`, `claim`; The climax of a claim-plus-steps film, right before the closing page. **Not for**: Taglines longer than two short lines; a film whose claim was not made earlier (it restates, it does not introduce).
- **Layout and camera**: lines at (88, 190 + 246 i), 225 px fitted to 1736 (≥ 164); the bar 1728 × 28 at 300 px under the last line; label 25/28 px mono at 60 px under the bar; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of text | primary | 1–2 | 4 words, 17 chars | 7 chars | ["Agents draft.","*You* sign."] / ["代理起草。","*你*来签字。"] |
  | `label` | text | glance | 1 | 10 words, 60 chars | 24 chars | draft → measure → replay → sign / 起草 → 测量 → 回放 → 签字 |

- **Length**: 4–12 beats (2–6 s at 120 BPM); longer copy reads longer; the sample plans 5 beats in English, 7 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: lines rise 0.25 u apart (0.65 s); the bar grows at 0.6 u (0.7 s expoInOut) unless carried in; the label rises at 1 u; it holds as a pause; lines sink and the bar retracts at the end unless it is the last scene.
- **Needs**: motions block-carry; props poster-chrome; roles paper, ink, dim, grid, accent; type display, mono.
- **Sound**: `claim` on the first line (the bed's drop, ducked for reading), `turn` on the bar (a thud when carried in).
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (tagline)`), split from the template of the plakat style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: Emphasis is marked with `*…*` in the copy, not found by matching words, so it works in Chinese; mark one word only.
