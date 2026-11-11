---
id: input-output
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### input-output

- **Purpose**: The claim as a split poster: the accent field holds what the person gives (input), an arrow points to what the product returns (output); the field then collapses into a band that carries the product name and one line.
- **Intent**: The claim is a transformation the eye can check at a glance: the person's part is in the colour, the product's result in ink, and the arrow is the product.
- **Content**: Input and output, each a label (≤ 10 chars) and 1–2 lines (≤ 12 chars); product name (≤ 16) and a one-line description (≤ 40).
- **Fits**: `claim`, `turn`; The claim right after the problem: what goes in, what comes out, and the product between. **Not for**: Claims that are not a transformation; more than two lines a side; a film with no person (the accent half is the person).
- **Layout and camera**: accent field full frame → the left half (x 0–960) in 0.6 s, then a band y 172–252; input label and lines at x 96 on the field (164 px fitted to 768, ≥ 88), the arrow at x 940–1060 drawn at 1.5 u, output lines at x 1146 in ink; underline 6 px under the output; name 120 px and description 34/40 px under the band; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `input` | group | – | 1 | – | – | {"label":"YOU SIGN","lines":["Each chang… / {"label":"你签字","lines":["每一处改动。"]} |
  | `output` | group | – | 1 | – | – | {"label":"IT APPLIES","lines":["In small… / {"label":"它执行","lines":["分小批","执行。"]} |
  | `name` | text | primary | 1 | 2 words, 16 chars | 8 chars | tablewarden / tablewarden |
  | `desc` | text | primary | 1 | 5 words, 40 chars | 16 chars | Agents draft. You sign. / 代理起草，你来签字。 |

- **Length**: 8–18 beats (4–9 s at 120 BPM); longer copy reads longer; the sample plans 9 beats in English, 16 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 the field halves; input lines rise 0.25 u apart; the arrow draws; output lines rise once the input is read; at 3 u the field collapses to the band and the input turns ink; name and description; a hold move nudges the arrow each beat; sinks at the end.
- **Needs**: motions none; props poster-chrome; roles paper, ink, dim, grid, accent, onAccent; type display, text, mono.
- **Sound**: `accent` as the field halves (the person), `land` per output line, `turn` on the collapse, `claim` duck while it reads.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (claim)`), split from the template of the plakat style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: Input lines sit on the accent at about 3:1 in clay and orange; keep them at 88 px or more. Chinese lines of 7 characters or more step down below 88 px; split them across two lines instead.
