---
id: pill-card
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### pill-card

- **Purpose**: The baseline thickens into the request pill around its own text, the action chip takes the accent and is pressed, then the pill grows into the response card; or the same card re-read as its schema.
- **Intent**: A request visibly becomes its response in the same object, so cause and result read as one gesture.
- **Content**: The line (≤ 30 chars) and swap, an action word (≤ 8 chars / 3 字), the product's call (status, reason, ms) and 2–6 body fields; schema form: the type's name and the word for 'schema'.
- **Fits**: `demo`, `proof`; A request and its response; any input that becomes a result in the same object. **Not for**: Responses longer than six lines; two objects side by side.
- **Layout and camera**: the pill grows upward out of the line (centred, top 444, 132 high); the card at [460, 240, 1000, 600]; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `line` | code | primary | 1 | 30 chars | 30 chars | GET /v2/invoices/{id} / GET /v2/invoices/{id} |
  | `swap` | list of code | – | 0–2 | – | – | ["{id}", "inv_8KQ2"] |
  | `action` | text | glance (optional) | 1 | 1 words, 8 chars | 3 chars | Send / 发送 |
  | `name` | code | glance | 1 | 16 chars | 16 chars | Invoice / Invoice |
  | `schemaWord` | text | glance | 1 | 1 words, 8 chars | 3 chars | schema / 结构 |

- **Length**: 5–11 beats (2.5–5.5 s at 120 BPM); the sample plans 9 beats in English, 9 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 the line thickens into the pill; beat 1 the accent goes to the action chip; beat 3 the press; beat 4 the card (container transform); beats 5–6 the header and body; beat 7 the status chip settles. Schema: beat 0 header swap, beat 1 type chips rise, beat 3 settle.
- **Needs**: motions outline-morph; props code-card; roles ground, ink, dim, accent, onAccent, inkDim; type display, mono.
- **Sound**: `turn` on 0 and 4, `accent` on 1, `hit` on 3, `land` on 5.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph; avoid none.
- **Source**: own (`assets/templates/morph/film.js (pressState, drawPressContents, drawCard)`), split from the morph style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Never show the pill's text and the card's body at once; content out first, then the shape.
