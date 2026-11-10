---
id: print-travel
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### print-travel

- **Purpose**: The camera goes to another print on the desk: a parallax slide (default), a truck, or a pull back over the whole desk with a hop; then that print’s chip and caption.
- **Intent**: Keep the desk continuous: every print lies somewhere real, and the camera goes there.
- **Content**: The desk’s prints, the print to go to and the one it leaves; a caption (≤ 6 words / 16 字).
- **Fits**: `demo`, `proof`; Going from one piece of evidence to the next: the table to the product, the report to the chart. **Not for**: A cut on a shared value (use value-match); the first scene.
- **Layout and camera**: the row of prints one screen apart; the camera from one rest mount to the next; numerals behind at 0.3, chips in front at 1.65; earlier captions stay on the desk at 45 %.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 6 words, 34 chars | 16 chars | Ships first in Northwind. / 先在 Northwind 上线。 |
  | `prints` | list | – | 1–6 | – | – | 3 items |
  | `prints[].image` | image | – (optional) | 1 | – | – | – |
  | `prints[].source` | text | glance | 1 | 8 words, 56 chars | 28 chars | – |

- **Length**: 4–12 beats (2–6 s at 120 BPM); the move (2 beats; grid-hop 3), the chip and the caption; the sample plans 7 beats in English, 8 in Chinese.
- **Steps and events**: beat 0 the camera leaves (parallax-slide, camera-truck or grid-hop); on the landing the chip is read, the caption half a beat later word by word.
- **Needs**: motions parallax-slide, camera-truck, grid-hop; props print-mount, claim-chip; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `land`; an upward whoosh under the slide (grid-hop: out, a tick on the hop, the dive).
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Source**: own (`assets/templates/exhibit/choreo.js (travel), moves.js (parallax-slide, camera-truck, grid-hop)`), split from the exhibit style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese captions, labels and lines are set character by character at 6 characters a second plus half a second (lang.js), never shrunk; mono notes and sources go to 28 px in Chinese (25 in English); captions 59 px, labels 44, the chip label 32; numbers, sources and the address stay in the Latin face.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the exhibit template (`assets/templates/exhibit/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the exhibit recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Grid-hop needs at least three prints to read as a desk.
