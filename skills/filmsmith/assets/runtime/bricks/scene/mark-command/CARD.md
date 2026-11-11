---
id: mark-command
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### mark-command

- **Purpose**: The card splits into the parts of the product mark, which fly in on arcs; the point lands as the mark dot, the name wipes out, the tagline rises and the closing command types on.
- **Intent**: The object the viewer followed all film becomes the product's mark, and the command to get it is typed, so they leave with a name and an action.
- **Content**: The product's name (≤ 12 chars), the mark as parts in grid units plus a dot, a tagline (≤ 26 chars / 12 字), a command (≤ 36 chars).
- **Fits**: `close`; The close of a film whose product has a geometric mark and a command to run. **Not for**: Marks that are pictures or words only; closings without a command (use a plain lock-up).
- **Layout and camera**: mark and name centred together (mark left, 72 px gap, name 135 px); tagline 84 px under the name's baseline; the command 168 px under it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `line` | text | primary (claim) | 1 | 5 words, 26 chars | 12 chars | docs from one spec / 一份规格，生成全部文档 |
  | `cmd` | code | primary (optional) | 1 | 36 chars | 36 chars | npx quillstack build invoices.yaml / npx quillstack build invoices.yaml |

- **Length**: 8–14 beats (4–7 s at 120 BPM); the sample plans 11 beats in English, 11 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 the card splits and the pieces fly; 1.25 the ring; 1.44 the hop; 2 the dot lands and the name wipes out; 2.5 the tagline; 3.5 the command types (60 chars/s); the last bar's downbeat: rows press once.
- **Needs**: motions converge-mark; props code-card; roles ground, paper, ink, dim, accent; type display, mono.
- **Sound**: `turn` on 0, `hit` on 2, `land` on 2.5, `type` from 3.5, `accent` on the second move.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph; avoid none.
- **Source**: own (`assets/templates/morph/film.js (drawMark, markLayout, piecesOf, batonOf)`), split from the template of the morph style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Hold the typed command ≥ 3 s; a closing command that vanishes cannot be copied.
