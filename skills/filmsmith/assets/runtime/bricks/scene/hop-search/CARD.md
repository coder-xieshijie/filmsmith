---
id: hop-search
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### hop-search

- **Purpose**: Run the question over the real candidates: a highlight hops, values rise, the answer scrambles and locks, or the verdict says none passes.
- **Intent**: The viewer watches the answer being found: anticipation builds hop by hop and resolves on the lock, or the failure is stated plainly.
- **Content**: A restated question (≤ 34 chars), 2–5 candidates each with a label (≤ 5 chars) and a measured value (≤ 8 chars), a numeric limit, an optional query (≤ 48 chars).
- **Fits**: `demo`, `proof`, `turn`. **Not for**: made-up values; more than five options; a choice without a limit.
- **Layout and camera**: the question at 160, baseline 300 (61 px); cells from y 380, 420 high, up to 380 wide with 40 px gaps (56 px radius with `form: 'round'`), label baseline +220 (186 px), value +370 (61 px); the verdict at the anchor (160, 660) on ramp[1]; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `line` | text | glance | 1 | 6 words, 34 chars | 14 chars | 4K city scene under 1 s? / 4K 城市场景 1 秒内？ |
  | `candidates` | list | – | 2–5 | – | – | 2.1 · 2.2 · 2.3 |
  | `candidates[].label` | text | glance | 1 | 5 chars | 3 chars | – |
  | `candidates[].value` | text | primary | 1 | 2 words, 8 chars | 5 chars | 4.8 s … / 4.8 秒 … |
  | `limit` | number | – | 1 | – | – | 1 |
  | `query` | code | glance (optional) | 1 | 48 chars | 48 chars | city-4k · warm · median of 5 runs |

  Options: `better` (`lower` default, `higher` for throughput), `slot` (an empty cell for the build that does not exist yet), `known` (labels already shown: eighth-note hops), `laps` (extra eighth-note laps before a reveal), `into: 'reveal'` (no verdict; the answer scrambles on; the last beat is the build), `form`.
- **Length**: 4–12 beats; three new candidates and a slot with the verdict ≈ 4.5 s; a re-run over known ones ≈ 2–2.5 s.
- **Steps and events**: first hop on beat 1 (half a beat for a known one); a new candidate a beat, a known one half; its value rises 0.08 s after the hop (0.22 s expo out); the best passing one scrambles through #&*@ at 24 Hz; the lock one beat after the last hop (T0 hit); with no pass the highlight takes the slot, the verdict opens at the anchor through an aperture one beat later (T1) and the summary types into the query line a beat after.
- **Needs**: motions symbol-scramble (its glyph slots, in the kit); props query-line; roles ground, panel, ink, dim, accent, onAccent, r0–r3; type display, text, mono.
- **Sound**: `tick` on every hop (a pop on a new one), `hit` on the lock, `land` (a low thud and bell) on a failed verdict.
- **Styles**: made for `pulse`. **Source**: own (`assets/templates/pulse/choreo.js`, `film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: the verdict reads "0 / 3 通过" and is set like the asked words (Noto Sans SC 900 as 长体); values with Chinese units ("4.8 秒") scramble only their digits.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the pulse template (`assets/templates/pulse/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the pulse recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start; the verdict's aperture is a canvas clip; the summary line is a short computed sentence ("none passes · limit 1").
- **Pitfalls**: The verdict and the answer are computed from the candidates and `limit`; never type them. Candidates already shown go in `known` so they hop on eighths.
