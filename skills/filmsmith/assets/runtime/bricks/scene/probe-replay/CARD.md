---
id: probe-replay
category: scene
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### probe-replay

- **Purpose**: An unseen input arrives, its letters resolve through the corpus’s own letters, the learned rules replay on it one a beat, and the reveal names the pieces, read in a pause.
- **Intent**: Proof that the method generalises: an input the run never saw is split by the rules it learned, one a beat, and the pieces are named.
- **Content**: The run with a probe word (≤ 12 chars, code), a caption (≤ 64 / 24 字 with markup), a reveal line.
- **Fits**: `climax`, `proof`; The climax of a mechanism explainer: proof that the method works on a case it never saw. **Not for**: Runs with no rules to replay; a probe longer than a board row.
- **Layout and camera**: the board dims; a new row under it holds the probe in the unseen colour; the rules list lights the rule being replayed; the reveal under the row.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `captions` | list of text | primary | 2–2 | 8 words, 56 chars | 22 chars | ["An unseen name: [[unseen|reloader]]", … |
  | `label` | text | glance | 1 | 1 words, 5 chars | 2 chars | new / 新 |
  | `heading` | text | glance | 1 | 3 words, 18 chars | 8 chars | learned merges / 学到的合并 |
  | `size` | text | glance | 1 | 2 words, 12 chars | 6 chars | {n} tokens / {n} 个词元 |
  | `title` | text | glance | 1 | 3 words, 22 chars | 8 chars | Code tokenizer / 代码分词器 |
  | `subtitle` | text | glance (optional) | 1 | 6 words, 44 chars | 14 chars | learning a vocabulary from identifiers / 从标识符里学词表 |

- **Length**: 6–14 beats (3–7 s at 120 BPM); the sample plans 12 beats in English, 14 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 the probe arrives; its letters resolve; one rule replays a beat; the reveal names the pieces; a pause.
- **Needs**: motions pair-fuse, scramble-resolve, trace-flow; props token-chip, token-bar; roles ground, ink, dim, accent, base, learned, unseen, cell; type text, mono.
- **Sound**: `hit` as the letters resolve, `land` per rule, `accent` on the reveal.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace; avoid halftone, morph.
- **Source**: own (`assets/templates/trace/pieces.js (probe); lib/handoffs scramble-resolve grammar`), split from the template of the trace style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Pick a probe the rules actually split into learned pieces; one that stays in letters proves nothing.
