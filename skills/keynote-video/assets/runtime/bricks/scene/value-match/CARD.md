---
id: value-match
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### value-match

- **Purpose**: One value printed in two sources: ringed on this print, the camera pushes in, cuts on a still frame to the same value in the next print and pulls back, the ring kept.
- **Intent**: Prove two sources agree by cutting between them on the very value they share.
- **Content**: The two prints, the value’s box in each (file px); a caption.
- **Fits**: `turn`, `proof`; The same name or number in two places: the picker and the chart, the report and the dashboard. **Not for**: Values that only look alike; different units.
- **Layout and camera**: the from print at rest, the value ringed; the push in to 64 px tall at the frame centre, the cut, the pull back to the next print’s rest.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 6 words, 34 chars | 16 chars | Named on the cost chart. / 成本图上也有它。 |
  | `prints` | list | – | 1–6 | – | – | 3 items |
  | `prints[].image` | image | – (optional) | 1 | – | – | – |
  | `prints[].source` | text | glance | 1 | 8 words, 56 chars | 28 chars | – |

- **Length**: 5–12 beats (2.5–6 s at 120 BPM); the ring (1 beat), the move (2 beats), the chip and the caption; the sample plans 8 beats.
- **Steps and events**: beat 0 the ring draws round the value (1 beat); beat 1 the push in; beat 2 the cut on a still frame; the pull back to beat 3; the ring stays round the landed value; the chip and the caption.
- **Needs**: motions match-cut; props print-mount, claim-chip; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: a pencil rim, a riser into the cut, a tick and a stamp on the cut, a falling whoosh, `land`.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Source**: own (`assets/templates/exhibit/choreo.js (match), moves.js (match-cut)`), split from the exhibit style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese captions, labels and lines are set character by character at 6 characters a second plus half a second (lang.js), never shrunk; mono notes and sources go to 28 px in Chinese (25 in English); captions 59 px, labels 44, the chip label 32; numbers, sources and the address stay in the Latin face.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the exhibit template (`assets/templates/exhibit/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the exhibit recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: No motion blur across the cut frame.
