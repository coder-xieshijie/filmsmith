---
id: gap-measure
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### gap-measure

- **Purpose**: The climax: the gap between two points of a print is measured on its own axis, the label computed, the rest of the print stepped back, the claim held in a pause.
- **Intent**: The difference is drawn on the evidence and computed, so the claim cannot be argued with.
- **Content**: Two points and values on the print; a label pattern; the claim (≤ 6 words / 16 字).
- **Fits**: `climax`, `claim`; A cost ratio, a score gap, a latency difference read off one chart. **Not for**: Gaps between prints; values with no shared axis.
- **Layout and camera**: the print at rest; the dimension on its own axis, offset to the side inside the print; its chip at the middle; the claim as the caption under the mount.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary (claim) | 1 | 6 words, 34 chars | 16 chars | The rival: ~20× the cost. / 对手约 20 倍的成本。 |
  | `prints` | list | – | 1–6 | – | – | 3 items |
  | `prints[].image` | image | – (optional) | 1 | – | – | – |
  | `prints[].source` | text | glance | 1 | 8 words, 56 chars | 28 chars | – |

- **Length**: 4–12 beats (2–6 s at 120 BPM); the dimension lands on beat 2; the claim from 2.5 beats; at least 0.75 s held; the sample plans 6 beats in English, 7 in Chinese.
- **Steps and events**: beat 0 a chip in the way steps aside and the match’s ring comes off (0.5 beat); 0.5 beat the dimension draws (1.5 beats); its chip settles onto beat 2 and the print steps back to 45 % round the span; the claim from 2.5 beats, held in a pause.
- **Needs**: motions dimension-line; props print-mount, claim-chip; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `claim`: four rising ticks under the line, an impact, a rolled chime, a stamp and a duck on the landing.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Source**: own (`assets/templates/exhibit/choreo.js (measure), film.js (measureGeom, measures, measureVeil, chipAside)`), split from the template of the exhibit style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese captions, labels and lines are set character by character at 6 characters a second plus half a second (lang.js), never shrunk; mono notes and sources go to 28 px in Chinese (25 in English); captions 59 px, labels 44, the chip label 32; numbers, sources and the address stay in the Latin face.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the exhibit template (`assets/templates/exhibit/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the exhibit recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Mark values read off an axis with `~`.
