---
id: count-to-result
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### count-to-result

- **Purpose**: The board dims, the camera pushes onto the token bar, and its own count grows into the enlarged result line; the bar lights in the learned colour.
- **Intent**: The result grows out of the object that carried the run, so the number is earned rather than announced.
- **Content**: The run; one result line with marked numbers (≤ 40 / 16 字).
- **Fits**: `proof`, `claim`; The result of a run, grown out of the through-line object rather than cut to a stat card. **Not for**: Results with no through-line on screen; more than one number.
- **Layout and camera**: the board dims, the camera pushes 1.3 onto the token bar, the bar's count grows into the enlarged result line '78 → 24'.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `big` | text | primary (claim) | 1 | 4 words, 16 chars | 10 chars | 78 → [[learned|24]] / 78 → [[learned|24]] |
  | `title` | text | glance | 1 | 3 words, 22 chars | 8 chars | Code tokenizer / 代码分词器 |
  | `subtitle` | text | glance (optional) | 1 | 6 words, 44 chars | 14 chars | learning a vocabulary from identifiers / 从标识符里学词表 |

- **Length**: 3–6 beats (1.5–3 s at 120 BPM); the sample plans 4 beats in English, 5 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 dim and push; beat 1 the count grows; beat 1.5 the bar lights in the learned colour; hold.
- **Needs**: motions token-sweep; props token-bar; roles ground, ink, dim, accent, learned, cell; type mono.
- **Sound**: `turn` on the push, `land` on the result.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace; avoid halftone, morph.
- **Source**: own (`assets/templates/trace/pieces.js (summary)`), split from the trace style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: The camera push is 1.3 at most; more and the board's top rows clip.
