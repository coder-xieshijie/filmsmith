---
id: unit-split
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-split

- **Purpose**: The same grid re-sorted: the matches light up in place, then fly back first in the accent while one big number counts them; the share enters once the count has landed.
- **Intent**: A subset is counted where it lives: the matches light up inside the whole, fly out first, and one number counts them.
- **Content**: Groups (2–9) and which of them match; a title (≤ 44 / 16 字), a count label and a share line (≤ 30 / 12 字).
- **Fits**: `turn`, `proof`, `demo`; Which subset: one flag or one category over the whole set, told as a count. **Not for**: Two subsets at once; a subset too small to see (under about 1 % of the set).
- **Layout and camera**: the grid stays where it was; the matches fly to a sorted block at the left under a big number; the share line enters under it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | primary (claim) | 1 | 6 words, 44 chars | 16 chars | Still being argued: *drafts*. / 还在争论的：*草稿*。 |
  | `sub` | text | glance | 1 | 6 words, 40 chars | 16 chars | Status draft · not yet decided / 状态为草稿 · 尚未定论 |
  | `caption` | text | primary | 1 | 5 words, 30 chars | 12 chars | still drafts (16%) / 仍是草稿（16%） |
  | `other` | text | glance | 1 | 5 words, 30 chars | 12 chars | decided or closed / 已定或已关闭 |
  | `labelIn` | text | glance | 1 | 4 words, 24 chars | 10 chars | Draft · 92 / 草稿 · 92 |
  | `labelOut` | text | glance | 1 | 4 words, 28 chars | 10 chars | Everything else · 482 / 其余 · 482 |
  | `groups` | list | – | 2–9 | – | – | 5 items |
  | `groups[].name` | text | glance | 1 | 2 words, 14 chars | 6 chars | – |
  | `groups[].count` | number | – | 1 | – | – | – |

- **Length**: 6–12 beats (3–6 s at 120 BPM); the sample plans 8 beats in English, 10 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 1 matches light in place; beat 1.5 they fly back first in the accent while the number counts; the rest re-sort behind; the share enters once the count has landed.
- **Needs**: motions unit-flight; props unit-mark, chart-frame; roles ground, panel, ink, dim, accent, base, rest; type display, text, mono.
- **Sound**: `accent` on the light, `land` as the count lands.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid halftone, morph.
- **Source**: own (`assets/templates/tally/layouts.js (split)`), split from the tally style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Show the share only after the count lands; two numbers at once split the reading.
