---
id: answer-whiteout
category: scene
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### answer-whiteout

- **Purpose**: Land the measured answer on the drop: two white frames, the amber slam, the ground falling back, the line read as a claim.
- **Intent**: The peak is marked by being the only flash: the answer arrives on the hit, in the one colour that means "answer", and is given time to sink in.
- **Content**: The answer value (≤ 7 chars, usually computed), one line read as a claim (≤ 30 chars), an optional query (≤ 48 chars).
- **Fits**: `climax`, `claim`. **Not for**: a second peak; an unmeasured answer; the opening.
- **Layout and camera**: the answer at 160, baseline 720, Barlow 700 568 px (floor 455); the line at 870 (61 px); the query at 990; locked camera (the lean is the build's, the push the portal's).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `value` | text | primary (claim) | 1 | 7 chars | 5 chars | 0.6 s / 0.6 秒 |
  | `line` | text | primary (claim) | 1 | 6 words, 30 chars | 12 chars | only build under 1 s / 唯一进 1 秒的版本 |
  | `query` | code | glance (optional) | 1 | 48 chars | 48 chars | p50 · 1 of 4 pass |

- **Length**: 4–10 beats (default 8, two bars, the last two the portal's push when it leaves through the counter).
- **Steps and events**: beat 0 the hit (T3): white for two frames, the answer at scale 1.16 and blur 26 px decaying as (1 − q)^2.2 over 0.45 s, the ground falling from white to ramp[0] in 0.3 s on an S-curve; beat 1 the line rises; beat 2 the query types; the rest is the claim's pause.
- **Needs**: motions whiteout-slam (runtime, the build before), counter-portal (runtime, the way out; `answerGlyph()` gives it the glyph); roles ground, ink, dim, accent, white, r0; type text, mono.
- **Sound**: `hit` on beat 0 (impact, rim and chime with the drop), `land` on the line.
- **Styles**: made for `pulse`. **Source**: own (`assets/templates/pulse/film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: the answer is digits (its 0 still carries the portal's counter); the line in Noto Sans SC 600.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the pulse template (`assets/templates/pulse/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the pulse recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start; the build is left to runtime whiteout-slam over the previous scene; the brick starts on the hit.
- **Pitfalls**: One per film. Keep the answer in the normal-width Bold: the portal needs its counter.
