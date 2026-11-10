---
id: thesis-lines
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### thesis-lines

- **Purpose**: One to four short serif lines enter one a beat, coloured where they name the run’s colours; a stats line enters part by part; the token bar lights once on the last downbeat.
- **Intent**: The claim is stated in the author's voice with every number the run's own, so it reads as a conclusion, not a slogan.
- **Content**: 1–4 lines (≤ 48 chars / 16 字 each, with [[kind|marked]] words), a stats line (≤ 60 / 24 字).
- **Fits**: `claim`, `lockup`; The claim of an explainer, every number the run’s own. **Not for**: Long claims (over five words a line); claims with no numbers from the run.
- **Layout and camera**: centred serif lines (46–76 px) one under another, the stats line under them, the token bar below.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of text | primary | 1–4 | 5 words, 48 chars | 16 chars | ["[[unseen|Unseen]] names", "are [[learn… |
  | `stats` | text | primary | 1 | 14 words, 64 chars | 30 chars | 78 → [[learned|24]] tokens · vocabulary … / 78 → [[learned|24]] 个词元 · 词表 6 → 12 · 6 … |
  | `title` | text | glance | 1 | 3 words, 22 chars | 8 chars | Code tokenizer / 代码分词器 |
  | `subtitle` | text | glance (optional) | 1 | 6 words, 44 chars | 14 chars | learning a vocabulary from identifiers / 从标识符里学词表 |

- **Length**: 4–12 beats (2–6 s at 120 BPM); the sample plans 12 beats in English, 12 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: one line a beat; the stats line part by part; the token bar lights once on the last downbeat.
- **Needs**: motions none; props token-bar; roles ground, ink, dim, learned, unseen, cell; type display, mono.
- **Sound**: `land` per line, `accent` on the bar.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace; avoid halftone, morph.
- **Source**: own (`assets/templates/trace/pieces.js (thesis)`), split from the trace style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Markup counts toward the limits; keep each line short. Chinese has no italic: the subtitle takes the dim colour instead.
