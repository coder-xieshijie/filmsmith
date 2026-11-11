---
id: seam-lockup
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### seam-lockup

- **Purpose**: A wipe line brings the name, the install line typing, the address and the published page beside the seam; on the last bar the seam closes and the caret waits.
- **Intent**: What to type to get it, beside where it is published; then the seam leaves.
- **Content**: The name (≤ 16 characters), the install command (≤ 44), the address (≤ 44), a glance line (≤ 6 words), the published page.
- **Fits**: `lockup`; The close of a split film. **Not for**: A logo card; a QR end card.
- **Layout and camera**: the name at y 470 (105 px), the install line at y 580 (mono 33), the address at y 640 (`muted`), the line at y 720 (25); the page contained in the pane right of x 1000, 60 px clear of the seam.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `label` | code | – | 1 | – | – | README.md · quick start / README.md · quick start |
  | `name` | text | primary | 1 | 2 words, 16 chars | 8 chars | Northwind / Northwind |
  | `command` | code | – | 1 | 44 chars | 44 chars | $ npx skills add northwind/docs / $ npx skills add northwind/docs |
  | `url` | code | – | 1 | 44 chars | 44 chars | github.com/northwind/docs / github.com/northwind/docs |
  | `line` | text | glance (optional) | 1 | 6 words, 34 chars | 14 chars | Written and checked in code. / 文档用代码写，也用代码量。 |
  | `result` | image | – (optional) | 1 | – | – | – / – |

- **Length**: 10–24 beats (5–12 s at 120 BPM); the wipe 2 beats, the name 1.5 beats after, the install line types, the address on the next beat (≥ 3 s), the line a beat later, the close 5 beats before the end; the sample plans 16 beats.
- **Steps and events**: with `from`: beat 0 a copy of the seam wipes left (2 beats); the name rises (`lockup` half a beat after); a beat later the install line types behind the caret; the address on the next whole beat; the line; 5 beats before the end the seam closes (`seam-close`, 1 beat) and the caret blinks on the last four beats.
- **Needs**: motions wipe-line, seam-close; props seam-grip; roles paper, ink, muted, dim, bench, onBench, accent, key; type display, mono.
- **Sound**: `turn` (wipe-line), `lockup` (a bell and a thud), `type` per character, `turn` (seam-close).
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/choreo.js (lockup), film.js (stateOf lockup, wipe-line)`), split from the template of the split style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese claims keep 59 px (Archivo then Noto Sans SC, no negative tracking) and are read at 6 characters a second plus half a second (lang.js); code, commands, paths, list items, report lines and addresses stay Latin in JetBrains Mono, as the product prints them.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the split template (`assets/templates/split/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the split recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). outside the recomposed segment (film-v1’s first 20 s).
- **Pitfalls**: Hold the address at least 3 s.
