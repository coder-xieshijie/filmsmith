---
id: unit-bands
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-bands

- **Purpose**: The same squares sort into one band per category, top band first, so the longest band visibly wins; optionally a roulette frame locks on the protagonist, or one block is cut into shares.
- **Intent**: Which kind wins becomes visible as length: the same squares sort into bands and the longest band reads before its number does.
- **Content**: 2–9 groups (name ≤ 14 chars / 6 字, count), a protagonist index, a title with *the protagonist* marked (≤ 44 / 16 字), a sub (≤ 40 / 16 字), an optional callout (≤ 26 / 14 字).
- **Fits**: `problem`, `demo`, `proof`; Which kinds, and which one matters: a category field over a counted set (up to 9 bands with the rest folded). **Not for**: Overlapping groups (one item in several: use unit-axis); continuous measures.
- **Layout and camera**: labels right-aligned at x 300, bands from x 330 top first, values after each band; `form: 'share'` one block cut into segments with percentages above; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | primary (claim) | 1 | 6 words, 44 chars | 16 chars | Second most common fate: *Rejected*. / 第二常见的结局：*驳回*。 |
  | `sub` | text | glance | 1 | 6 words, 40 chars | 16 chars | Status field · 5 values / 状态字段 · 5 种取值 |
  | `callout` | text | glance (optional) | 1 | 6 words, 26 chars | 14 chars | ← 18% of all 574 / ← 占全部 574 的 18% |
  | `groups` | list | – | 2–9 | – | – | 5 items |
  | `groups[].name` | text | glance | 1 | 2 words, 14 chars | 6 chars | – |
  | `groups[].count` | number | – | 1 | – | – | – |

- **Length**: 6–16 beats (3–8 s at 120 BPM); the sample plans 12 beats in English, 13 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 1 the squares mark and fly group by group (0.5 beat apart); values count as their squares land; with the roulette a frame hops band to band from the first landing, laps, slows and locks on the protagonist on a whole beat, whose squares then light by rank; the callout half a beat later.
- **Needs**: motions unit-flight, roulette-lock; props unit-mark, chart-frame; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: `turn` on 1, `land` per band, `accent` per roulette hop and on the lock.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid halftone, morph.
- **Source**: own (`assets/templates/tally/layouts.js (columns, share), timeline.js (roulette)`), split from the tally style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: The roulette needs a protagonist that is not the top band, or the lock is no surprise. Fold anything past nine bands into one 'other' band.
