---
id: unit-close
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-close

- **Purpose**: Up to three numbers land a beat apart over a rule made of the same squares; the protagonist number is larger in the accent and its own squares wait under it as beads that light up one by one on the last downbeat.
- **Intent**: The film ends on the few numbers that matter, standing on a rule made of the same squares, the protagonist last and largest.
- **Content**: Up to three numbers (value, label ≤ 24 / 10 字), the protagonist index; optional source line.
- **Fits**: `lockup`, `claim`; The lock-up of a counted film: the whole, one notable count, the protagonist. **Not for**: More than three numbers; three equal numbers (one must be the protagonist).
- **Layout and camera**: numbers left to right a beat apart over a rule of squares at y 760; the protagonist larger in the accent, its squares waiting under it as beads.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `numbers` | list | – | 1–3 | – | – | 3 items |
  | `numbers[].value` | number | – | 1 | – | – | – |
  | `numbers[].label` | text | glance | 1 | 4 words, 22 chars | 8 chars | – |
  | `line` | text | primary (claim) (optional) | 1 | 6 words, 40 chars | 16 chars | 238 made it through. / 238 次走到了发布。 |
  | `groups` | list | – | 1–9 | – | – | 5 items |
  | `groups[].name` | text | glance | 1 | 2 words, 14 chars | 6 chars | – |
  | `groups[].count` | number | – | 1 | – | – | – |

- **Length**: 6–14 beats (3–7 s at 120 BPM); the sample plans 8 beats in English, 9 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: numbers land a beat apart; the rule forms from the squares; on the last downbeat the beads light one by one.
- **Needs**: motions unit-flight, rank-sweep; props chart-frame; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: `land` per number, `accent` on the beads.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid halftone, morph.
- **Source**: own (`assets/templates/tally/layouts.js (close), timeline.js (closing light)`), split from the tally style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Let the protagonist number be the only accent on screen.
