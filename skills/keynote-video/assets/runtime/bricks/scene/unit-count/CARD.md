---
id: unit-count
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-count

- **Purpose**: One big number counts up to the size of a set while one square per item appears in a wave beside it; the squares stay for every later chapter.
- **Intent**: The viewer feels the size of the set before any category: a number counts while one square per item fills the frame.
- **Content**: The set as groups (1–9, name ≤ 14 chars / 6 字, count); a caption (≤ 34 chars / 14 字) and a note on what one square is (≤ 40 / 16 字).
- **Fits**: `hook`, `problem`; The opening of a story told by counting: how many there are, before saying which kinds. **Not for**: A single headline number with nothing to sort afterwards (use a number scene of a launch style); more than about 2,000 items.
- **Layout and camera**: number at the left (300 px, fitted ≤ 860 px wide), caption and note under it; the grid of squares at the right; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 5 words, 34 chars | 14 chars | Renders in the archive / 档案里的全部渲染 |
  | `note` | text | glance | 1 | 6 words, 40 chars | 16 chars | One square per render, by date / 一格一次渲染，按日期排 |
  | `title` | text | primary (claim) (optional) | 1 | 6 words, 44 chars | 16 chars |  /  |
  | `groups` | list | – | 1–9 | – | – | 5 items |
  | `groups[].name` | text | glance | 1 | 2 words, 14 chars | 6 chars | – |
  | `groups[].count` | number | – | 1 | – | – | – |

- **Length**: 4–10 beats (2–5 s at 120 BPM); the sample plans 5 beats in English, 7 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0.25 the counter starts (expo-out over 3 beats) and the wave of squares (2.05 beats, each 0.7 beat cubic out from 30 %); beat 1.5 the caption rises; beat 2.5 the note; then a hold of a beat.
- **Needs**: motions unit-flight; props unit-mark, chart-frame; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: `accent` at 0.25, `land` at 3.25.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid halftone, morph.
- **Source**: own (`assets/templates/tally/layouts.js (count), squares.js (wave)`), split from the tally style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Set `title: ''` unless the count needs a claim; the caption is the main read. The squares must stay on screen into the next chapter; cutting them away loses the through-line.
