---
id: weight-histogram
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### weight-histogram

- **Purpose**: The most frequent neighbouring pairs, counted one a beat: each row’s weight flies from its label to the pair’s bar and lands as a visible segment.
- **Intent**: Counting that is weighted is drawn: each row's weight flies to its bar, so the viewer sees why the top pair wins.
- **Content**: The run (as chip-split), a caption with [[kind|marked]] words (≤ 64 / 24 字 with markup), the number of pairs shown (≤ 4).
- **Fits**: `problem`, `demo`; Counting that is weighted: the weighting is drawn, not said; the top bar is the next step of the run. **Not for**: Unweighted counts (a plain bar grows); more than four items to count in a scene.
- **Layout and camera**: the board at the left, the histogram column at the right (x 1290–1800), the caption at y 872, the token bar.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 8 words, 60 chars | 22 chars | Count [[active|neighbouring pairs]], wei… / 数[[active|相邻的字符对]]，按使用次数加权。 |
  | `heading` | text | glance | 1 | 3 words, 18 chars | 8 chars | pair counts / 字符对计数 |
  | `title` | text | glance | 1 | 3 words, 22 chars | 8 chars | Code tokenizer / 代码分词器 |
  | `subtitle` | text | glance (optional) | 1 | 6 words, 44 chars | 14 chars | learning a vocabulary from identifiers / 从标识符里学词表 |

- **Length**: 4–10 beats (2–5 s at 120 BPM); the sample plans 7 beats in English, 7 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: one pair a beat: the pair lights on the board, each row's weight flies from its label to the bar and lands as a segment that keeps the weight written inside it; the top pair is marked last.
- **Needs**: motions none; props token-chip, token-bar; roles ground, ink, dim, line, accent, base, cell; type text, mono.
- **Sound**: `tick` per weight landing, `accent` on the top pair.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace; avoid halftone, morph.
- **Source**: own (`assets/templates/trace/pieces.js (count, histogram)`), split from the template of the trace style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Show at most four pairs a scene; the fifth bar is never read.
