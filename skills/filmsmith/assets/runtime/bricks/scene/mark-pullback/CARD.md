---
id: mark-pullback
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### mark-pullback

- **Purpose**: The camera pushes in on the anchor while the mark inks up out of it, then pulls back on a log scale into the whole mark; name and line rise beside it; the plate takes one dot-gain impression.
- **Intent**: The reveal that the anchor was part of the mark all along: the camera pulls back and the rings of the film were its arcs.
- **Content**: The product name (≤ 12 chars, Latin), a line (≤ 28 / 14 字), the mark as SVG paths with the anchor's box.
- **Fits**: `close`; The lock-up of a film whose recurring anchor is a piece of the product mark. **Not for**: Marks without a separable piece; word-only marks.
- **Layout and camera**: push in on the anchor at (1440, 540) to 3.4×; pull back to the mark left of the name, both centred together; line 92 px under the name.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | code | primary | 1 | 12 chars | 12 chars | parley-2 / parley-2 |
  | `line` | text | primary (claim) | 1 | 5 words, 28 chars | 14 chars | speech model · out today / 语音模型 · 今日发布 |

- **Length**: 8–12 beats (4–6 s at 120 BPM); the sample plans 10 beats in English, 11 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beats 0–1.5 push in, the plate inks up, rings appear; 0.25 still; 1.75 pull back (1.25 beats, exponential, log scale); +2 the name; +3 the line; the last bar's downbeat the dot gain.
- **Needs**: motions anchor-swap; props anchor-mark; roles ground, ink, dim, accent; type display.
- **Sound**: silence on the push, `hit` on the pull, `land` on the name and line, `accent` on the dot gain.
- **Styles**: made for `halftone` (recipe the halftone recipe); fits halftone; avoid none.
- **Source**: own (`assets/templates/halftone/film.js (pullState, paintPull, paintLockup)`), split from the template of the halftone style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; big words take Noto Sans SC 800 after Bricolage Grotesque; Chinese line spacing 1.18 instead of 1.08; the product name stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the halftone template (`assets/templates/halftone/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the halftone recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Leave 1–2 s without the bed for the push-in; the silence makes the pull-back land.
