---
id: merge-step
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### merge-step

- **Purpose**: The most frequent pair is picked, lit on the board, fused on every row, written as a rule and taken off the token bar; or a loop of such merges at one every two beats or one a beat.
- **Intent**: A rule is taught once, slowly, then repeats faster, so the viewer learns the step and then believes it converges.
- **Content**: The run, which steps to show (`from`, `to`), the pace (`slow` | `loop`), a caption (≤ 64 / 24 字 with markup).
- **Fits**: `demo`, `problem`, `turn`; Teaching a rule once, slowly, then letting it repeat faster into the result. **Not for**: Steps whose state is not a merge, sort or reduction.
- **Layout and camera**: the board, the rules list in the right column, the counter top right, the caption.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 8 words, 60 chars | 22 chars | Most frequent: [[active|a + d]] → [[lear… / 最常见的一对：[[active|a + d]] → [[learned|ad]] |
  | `heading` | text | glance | 1 | 3 words, 18 chars | 8 chars | learned merges / 学到的合并 |
  | `title` | text | glance | 1 | 3 words, 22 chars | 8 chars | Code tokenizer / 代码分词器 |
  | `subtitle` | text | glance (optional) | 1 | 6 words, 44 chars | 14 chars | learning a vocabulary from identifiers / 从标识符里学词表 |

- **Length**: 3–12 beats (1.5–6 s at 120 BPM); the sample plans 5 beats in English, 7 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: slow: beat 0 pick and light the pair, beat 1 fuse, beat 2 the rule is written, beat 2.5 the bar shrinks; loop: one merge every two beats, then one a beat.
- **Needs**: motions pair-fuse, path-type, trace-flow; props token-chip, token-bar; roles ground, ink, dim, line, accent, base, learned, cell; type text, mono.
- **Sound**: `accent` per pick, `land` per fuse, `tick` per rule.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace; avoid halftone, morph.
- **Source**: own (`assets/templates/trace/timing.rules.js (step, loop), pieces.js`), split from the template of the trace style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Run the slow step once; a second slow step bores, a loop without a slow step teaches nothing.
