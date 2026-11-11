---
id: unit-periods
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-periods

- **Purpose**: The same squares stand in one column per period, the protagonist at the base of each column lighting up together; or the standing columns step back and their tops become a curve: the same counts read as a trend.
- **Intent**: Time becomes columns of the same items, and the protagonist at the base of every column lights together, so 'when' and 'is it rising again' read in one picture.
- **Content**: Periods (2–24, label ≤ 8 / 4 字) with counts per group; a title (≤ 44 / 16 字); `reread: 'trend'` for the curve; `stagger: 'together'` lands every column at once.
- **Fits**: `problem`, `proof`, `turn`; A few real periods (≤ 24) over a counted set: when, and whether it is rising again. **Not for**: Many time steps (a line chart reads better); periods that are not real (made-up bins).
- **Layout and camera**: one column per period along the baseline, period labels under it, protagonist squares at the base; trend: the columns step back and a curve joins their tops.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | primary (claim) | 1 | 6 words, 44 chars | 16 chars | *Rejections* peaked early. / *驳回*在早期最多。 |
  | `sub` | text | glance | 1 | 6 words, 40 chars | 16 chars | Renders per year of creation / 按创建年份的渲染数 |
  | `callout` | text | glance (optional) | 1 | 4 words, 20 chars | 10 chars | 64 → 130 / 64 → 130 |
  | `periods` | list | – | 2–24 | – | – | 6 items |
  | `periods[].name` | text | glance | 1 | 2 words, 9 chars | 5 chars | – |
  | `periods[].count` | number | – | 1 | – | – | – |
  | `groups` | list | – | 1–9 | – | – | 5 items |
  | `groups[].name` | text | glance | 1 | 2 words, 14 chars | 6 chars | – |
  | `groups[].count` | number | – | 1 | – | – | – |

- **Length**: 4–14 beats (2–7 s at 120 BPM); the sample plans 8 beats in English, 9 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 1 the squares fly into columns; the protagonist bases light together; trend: beat 1 the columns dim, beat 1.5 the curve draws left to right, its last point pulses.
- **Needs**: motions unit-flight, re-encode, step-wipe; props chart-frame; roles ground, panel, ink, dim, accent, base, rest; type display, text, mono.
- **Sound**: `turn` on 1, `land` per column, `accent` as the bases light or the curve ends.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid halftone, morph.
- **Source**: own (`assets/templates/tally/layouts.js (timeline, trend); lib/handoffs re-encode drawn on squares`), split from the template of the tally style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Period by period the flight lands only after 1 + 0.25·(n − 1) + 2 beats; in a scene shorter than that set `stagger: 'together'` or the accent never shows.
