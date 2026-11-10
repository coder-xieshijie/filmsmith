---
id: point-line
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### point-line

- **Purpose**: The accent point lands on beat 1, shoots into a line that hands its colour to the ink, and the endpoint rises out of it as its baseline; one token swaps in on an accent chip.
- **Intent**: A film opens on the smallest thing, a point, and promotes it into the first fact, so the viewer is inside the product's logic from frame one.
- **Content**: One line of code or a path (≤ 30 chars), an optional token swap [from, to], an optional note (≤ 36 / 14 字).
- **Fits**: `hook`, `demo`; The hook of a film that promotes one shape; any opening on one line of code, a path or a command. **Not for**: Prose openings; more than one line.
- **Layout and camera**: the point at (960, 560); the line centred on it, its text rising out of it as its baseline; the note under the line; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `line` | code | primary | 1 | 30 chars | 30 chars | GET /v2/invoices/{id} / GET /v2/invoices/{id} |
  | `swap` | list of code | – | 0–2 | – | – | ["{id}", "inv_8KQ2"] |
  | `note` | text | glance (optional) | 1 | 6 words, 36 chars | 14 chars | One endpoint of the spec / 规格里的一个接口 |

- **Length**: 5–9 beats (2.5–4.5 s at 120 BPM); the sample plans 6 beats in English, 6 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 1 the point lands (squash); beat 2 it shoots into the line (0.34 s exponential) and hands its colour to the ink; beat 3 the text rises; beat 4 the token swaps in on an accent chip.
- **Needs**: motions none; props none; roles ground, ink, dim, accent, onAccent; type mono.
- **Sound**: `accent` on 1, `turn` on 2, `land` on 3, `accent` on 4.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph; avoid tally, halftone.
- **Source**: own (`assets/templates/morph/film.js (drawPoint, lineState, drawLineText)`), split from the morph style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Keep the line under 30 characters; at 69 px a longer line leaves the safe area.
