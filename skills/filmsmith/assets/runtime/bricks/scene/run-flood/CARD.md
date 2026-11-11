---
id: run-flood
category: scene
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### run-flood

- **Purpose**: Run is pressed and spins, then its own outline floods the frame into the live console (the same card in the other material): status, body, then the claim; the console retracts into the button.
- **Intent**: The product is seen actually running: the button floods the frame into its live result and the claim lands in that moment.
- **Content**: A claim (≤ 28 chars / 14 字), the card it starts from (title, tabs, Run), the product's call and two body lines.
- **Fits**: `climax`, `proof`, `demo`; The climax of a developer film: the thing actually runs; one claim in a pause. **Not for**: Films without a button to press; claims longer than five words.
- **Layout and camera**: the focus card, then the whole frame in the ink with the same card as the console; the claim centred at y 930.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `claim` | text | primary (claim) | 1 | 5 words, 28 chars | 14 chars | Docs that run. / 能跑的文档。 |
  | `title` | text | glance | 1 | 5 words, 28 chars | 12 chars | Retrieve an invoice / 获取一张发票 |
  | `run` | text | glance | 1 | 1 words, 6 chars | 3 chars | Run / 运行 |
  | `tabs` | list | – | 1–4 | – | – | 3 items |
  | `tabs[].lang` | code | – | 1 | – | – | – |
  | `tabs[].code` | list | – | 1 | – | – | – |

- **Length**: 8–14 beats (4–7 s at 120 BPM); the sample plans 10 beats in English, 11 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 press and spin; `pre` the flood (one beat, exponential); pre+2 status; +2.5, +3 body lines; +4 the claim; the last 1.25 beats retract into Run.
- **Needs**: motions none; props code-card; roles ground, paper, ink, dim, accent, onAccent, inkDim, inkAccent, inkCard, inkEdge; type display, mono.
- **Sound**: `hit` on 0, `turn` on the flood, `land` on the status, `accent` on the claim, `turn` on the retract.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph; avoid none.
- **Source**: own (`assets/templates/morph/film.js (drawFlood, consoleFrame, floodScale)`), split from the template of the morph style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Put the flood on a bar line (`pre` = beats to the next bar); off the bar it reads as a glitch.
