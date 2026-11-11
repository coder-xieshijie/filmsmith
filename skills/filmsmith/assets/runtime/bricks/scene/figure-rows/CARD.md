---
id: figure-rows
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### figure-rows

- **Purpose**: State one to three figures a beat apart, each resolving in its own digit slots, its label beside it.
- **Intent**: Each figure is a fact that arrives on the beat and stays still to be read; the scramble says it was measured, not typed.
- **Content**: 1–3 items, each a value (≤ 9 chars) and a label (≤ 26 chars, ≤ 4 words); optional `count` per item; an optional query (≤ 48 chars).
- **Fits**: `proof`, `demo`, `problem`. **Not for**: more than three numbers; numbers without labels.
- **Layout and camera**: figures at x 160 on baselines 640 (one), 480 / 790 (two), 330 / 600 / 870 (three); one size for all (364 / 291 / 291, floor 186) fitted with their labels; labels 48 px after the figure (61 px); query at 990; ground ramp[2] (`ground`); locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `items` | list | – | 1–3 | – | – | 14 · 3.2× · 8.0× |
  | `items[].value` | text | primary | 1 | 9 chars | 6 chars | – |
  | `items[].label` | text | primary | 1 | 4 words, 26 chars | 10 chars | tiles re-rendered / 块瓦片重渲 |
  | `query` | code | glance (optional) | 1 | 48 chars | 48 chars | scene graph · 14 of 2,400 dirty |

- **Length**: 3–12 beats; two items ≈ 3 s, three ≈ 3.5–4 s.
- **Steps and events**: figure k at k beats or once the previous figure and label are read, less a beat (T0 `land`); a figure resolves in 0.35 s or counts over a beat; its label rises 0.25 beat after; the query types on the first beat after the first label; a last hold over two beats gets the 3.5 % pop.
- **Needs**: motions symbol-scramble (kit); props query-line; roles ground, ink, dim, r0–r3; type display, text, mono.
- **Sound**: `land` (a stamp) per figure, ticks under a count.
- **Styles**: made for `pulse`. **Source**: own (`assets/templates/pulse/choreo.js`, `film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: labels in Noto Sans SC 600 behind Barlow; figures are digits in Barlow Condensed in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the pulse template (`assets/templates/pulse/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the pulse recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start; the reading time of each item comes from `readTime`.
- **Pitfalls**: Every figure must come from the product or be computed from figures on screen.
