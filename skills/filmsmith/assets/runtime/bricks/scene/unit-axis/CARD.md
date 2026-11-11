---
id: unit-axis
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-axis

- **Purpose**: Where groups overlap, the subset squares shrink into a vertical axis and the rest drop away; one bar per series grows out of that axis, the protagonist in the accent.
- **Intent**: Overlap becomes a surprise you can see: the subset shrinks into an axis and bars grow out of it, so one item naming several things is shown, not claimed.
- **Content**: Series (2–8, name ≤ 14 / 6 字, count, may overlap), the subset size, a title (≤ 44 / 16 字), a sub (≤ 8 words / 16 字).
- **Fits**: `climax`, `proof`; The surprise of a counted story: tags that overlap (one item can name several), drawn as bars on the subset itself. **Not for**: Groups that do not overlap (unit-bands keeps the squares as the bars); more than 8 series.
- **Layout and camera**: the subset squares shrink into a vertical axis at the left; one bar per series grows to the right, the protagonist in the accent; the rest of the squares drop away.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | primary (claim) | 1 | 6 words, 44 chars | 16 chars | Most named a *code renderer*. / 最多人用的是*代码渲染*。 |
  | `sub` | text | glance | 1 | 8 words, 48 chars | 18 chars | Tools named · one render can name severa… / 提到的工具 · 一次可提到多个 |
  | `callout` | text | glance (optional) | 1 | 4 words, 20 chars | 8 chars | ← the surprise / ← 意外之处 |
  | `foot` | text | glance (optional) | 1 | 8 words, 56 chars | 22 chars | 238 shipped renders that named their too… / 238 次已发布渲染提到了工具 |
  | `series` | list | – | 2–8 | – | – | 4 items |
  | `series[].name` | text | glance | 1 | 3 words, 18 chars | 8 chars | – |
  | `series[].count` | number | – | 1 | – | – | – |
  | `groups` | list | – | 1–9 | – | – | 5 items |
  | `groups[].name` | text | glance | 1 | 2 words, 14 chars | 6 chars | – |
  | `groups[].count` | number | – | 1 | – | – | – |

- **Length**: 6–14 beats (3–7 s at 120 BPM); the sample plans 11 beats in English, 12 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 1 the rest drop; beat 1.5 the subset shrinks into the axis; bars grow a quarter beat apart; the protagonist's bar last, with a pulse.
- **Needs**: motions unit-flight; props chart-frame; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: `turn` as the rest drops, `land` per bar, `accent` on the protagonist.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid halftone, morph.
- **Source**: own (`assets/templates/tally/layouts.js (axis)`), split from the template of the tally style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Say in the sub that one item can count in several bars, or the bars read as an error.
