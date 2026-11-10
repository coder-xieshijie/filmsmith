---
id: cell-count
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### cell-count

- **Purpose**: A huge number counts up at the left while one more cell of rings appears round the anchor per counted step; reversed out of ink by default.
- **Intent**: A small count is felt as things appearing: one cell per step round the anchor while the number climbs.
- **Content**: A value and its start (difference ≤ 16), a line (≤ 32 / 16 字), an optional label (≤ 30 / 16 字).
- **Fits**: `proof`, `problem`; A small count that matters (voices, regions, models), at most sixteen steps. **Not for**: Large numbers or percentages (use a counter brick); counts that are not units.
- **Layout and camera**: the number at y 610 (242 or 178 px), the line at 700, label at 380; cells round the anchor; reversed out of ink by default.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `value` | number | primary (claim) | 1 | – | – | 12 / 12 |
  | `line` | text | primary | 1 | 6 words, 32 chars | 16 chars | voices pulled from one mic / 从一支麦克风里分出的人声 |
  | `label` | text | glance (optional) | 1 | 5 words, 30 chars | 16 chars | one mic · 41 min / 一支麦克风 · 41 分钟 |

- **Length**: 4–8 beats (2–4 s at 120 BPM); the sample plans 6 beats in English, 8 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0.5 the number lands and counts (ease-out over 2–4 beats), one cell per step; 1.5 the line.
- **Needs**: motions none; props anchor-mark; roles ground, ink, dim, dimInk, accent; type display, mono.
- **Sound**: `accent` on 0.5, `tick` per step, `land` on 1.5.
- **Styles**: made for `halftone` (recipe the halftone recipe); fits halftone; avoid none.
- **Source**: own (`assets/templates/halftone/film.js (countAt, ready count), fields.js count`), split from the halftone style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; big words take Noto Sans SC 800 after Bricolage Grotesque; Chinese line spacing 1.18 instead of 1.08; the product name stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the halftone template (`assets/templates/halftone/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the halftone recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: At most four values a beat; faster and the in-between values flash unreadably.
