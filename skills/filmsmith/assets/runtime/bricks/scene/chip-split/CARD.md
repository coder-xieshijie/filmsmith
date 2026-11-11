---
id: chip-split
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### chip-split

- **Purpose**: The input words appear as plain text beside their weights, their letters spread apart into chips, and a token bar counts in under them, one cell per unit.
- **Intent**: The input stops being words and becomes units the run will act on, so the viewer knows what is being counted from the first seconds.
- **Content**: A corpus of 2–6 words with weights (the run), a title (≤ 22 / 8 字), a subtitle (≤ 44 / 14 字), a caption (≤ 40 / 16 字).
- **Fits**: `hook`; The hook of a mechanism explainer: what the input is, as units the run will act on. **Not for**: Inputs too long for six rows of chips; inputs that are not sequences of units.
- **Layout and camera**: the board (x 130–1220) with row weights at the left, the token bar at y 950, title and subtitle top left, the counter top right.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | glance | 1 | 3 words, 22 chars | 8 chars | Code tokenizer / 代码分词器 |
  | `subtitle` | text | glance (optional) | 1 | 6 words, 44 chars | 14 chars | learning a vocabulary from identifiers / 从标识符里学词表 |
  | `caption` | text | primary | 1 | 5 words, 40 chars | 16 chars | 4 identifiers, 15 uses. / 4 个标识符，共用 15 次。 |

- **Length**: 4–8 beats (2–4 s at 120 BPM); the sample plans 5 beats in English, 6 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0.1 words appear packed; beat 1 the letters spread into chips; beat 1.5 the token bar counts in; the caption rises; hold.
- **Needs**: motions none; props token-chip, token-bar; roles ground, ink, dim, accent, base, cell; type display, text, mono.
- **Sound**: `accent` on 1, `land` as the bar fills.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace; avoid halftone, morph.
- **Source**: own (`assets/templates/trace/pieces.js (hook)`), split from the template of the trace style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: The words stay Latin code in every language; translate the captions, not the corpus.
