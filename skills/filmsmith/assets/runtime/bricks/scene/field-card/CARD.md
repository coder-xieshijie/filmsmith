---
id: field-card
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### field-card

- **Purpose**: A big word and one line at the left; at the right a procedural field round the anchor acts the feature out and steps one state a beat; on paper or reversed out of ink.
- **Intent**: Each feature is acted out by the picture: the field round the anchor changes its function to show what the word means.
- **Content**: A word (≤ 11 chars / 6 字), a line (≤ 32 / 16 字), an optional label (≤ 30 / 16 字), a field kind, paper or ink; `print: 'blocks'` after a dot-quantize seam.
- **Fits**: `problem`, `demo`, `proof`, `turn`; One feature per card in a launch: interference, separation, a log, a waveform, a grid filling in. **Not for**: Features that need a screenshot; more than one line of copy.
- **Layout and camera**: word at y 590 (178 or 131 px), line at 680 (52 px), label at 380; the field right of x 1060 round the anchor at (1440, 540).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `word` | text | primary (claim) | 1 | 2 words, 11 chars | 6 chars | CROSSTALK / 串音 |
  | `line` | text | primary | 1 | 6 words, 32 chars | 16 chars | three voices, one channel / 三个人声，挤在一条声道 |
  | `label` | text | glance (optional) | 1 | 5 words, 30 chars | 16 chars |  /  |

- **Length**: 3–8 beats (1.5–4 s at 120 BPM); the sample plans 5 beats in English, 7 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 the field (from `from` behind a front over 0.75 beat); 0.5 the word; 1.5 the line; the field steps one state a beat.
- **Needs**: motions field-morph; props anchor-mark; roles ground, ink, dim, dimInk, accent; type display, mono.
- **Sound**: `turn` on 0, `land` on 0.5 and 1.5, `tick` per step.
- **Styles**: made for `halftone` (recipe the halftone recipe); fits halftone; avoid none.
- **Source**: own (`assets/templates/halftone/film.js (ready card, toneAt), fields.js`), split from the template of the halftone style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; big words take Noto Sans SC 800 after Bricolage Grotesque; Chinese line spacing 1.18 instead of 1.08; the product name stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the halftone template (`assets/templates/halftone/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the halftone recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Cards with the same `pattern` draw the same field: reuse it only when the film means 'the same one again'.
