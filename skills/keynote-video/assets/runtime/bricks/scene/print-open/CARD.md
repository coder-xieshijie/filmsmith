---
id: print-open
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### print-open

- **Purpose**: The film opens on a real print at full frame; the camera rises and its mount grows round it until it lies on the desk; its chip, then a caption word by word.
- **Intent**: Start inside the evidence, then step back to show it is a print on a desk with a source.
- **Content**: The desk’s prints; this print’s caption (≤ 6 words / 16 字).
- **Fits**: `hook`; The first scene of an exhibit film: the strongest single piece of evidence. **Not for**: A logo or title card; an asset that does not survive full frame (below 1920 × 1080 source px).
- **Layout and camera**: the print at full frame (its content scaled to cover, capped at 1.333), rising to the rest mount at (360, 224); the caption under the mount at 76 px; the chip at lower right in front.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 6 words, 34 chars | 16 chars | Scored on real work. / 在真实工作上评分。 |
  | `prints` | list | – | 1–6 | – | – | 3 items |
  | `prints[].image` | image | – (optional) | 1 | – | – | – |
  | `prints[].source` | text | glance | 1 | 8 words, 56 chars | 28 chars | – |

- **Length**: 5–12 beats (2.5–6 s at 120 BPM); the rise lands on beat 3; the chip and the caption are read; the sample plans 7 beats in English and Chinese.
- **Steps and events**: beat 0 the print at full frame; beat 1 the camera rises (bezel-pullback, 2 beats, cubic in-out, log zoom) and the mount grows with its shadow; beat 3 it lands; the chip is read, the caption from beat 3.5, a word every 0.3 s (a character every 1/5.5 s).
- **Needs**: motions bezel-pullback; props print-mount, claim-chip; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `hook`: a falling whoosh under the rise, `land` on the landing, a pop as the caption begins.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Source**: own (`assets/templates/exhibit/choreo.js (open), moves.js (bezel-pullback)`), split from the exhibit style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese captions, labels and lines are set character by character at 6 characters a second plus half a second (lang.js), never shrunk; mono notes and sources go to 28 px in Chinese (25 in English); captions 59 px, labels 44, the chip label 32; numbers, sources and the address stay in the Latin face.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the exhibit template (`assets/templates/exhibit/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the exhibit recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: The opening frame is at the zoom cap: crop so it holds at 1.333.
