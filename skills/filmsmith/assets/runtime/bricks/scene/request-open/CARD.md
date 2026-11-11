---
id: request-open
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### request-open

- **Purpose**: A request types; its caret runs to the seam’s place and stands up into it; the first result slides out of the seam; the claim rises in two phrases.
- **Intent**: The edit point becomes the boundary: what is typed opens onto what it makes.
- **Content**: A request (≤ 40 characters, as the product reads it), a first result, a claim in 1–2 phrases (≤ 5 words each).
- **Fits**: `hook`; The opening of a film about input and output. **Not for**: A film that does not start from something typed.
- **Layout and camera**: the request at y 600 after `>` (mono 44), the label at baseline 84, the claim at y 330 and 404 (59 px), the seam at x 900, the result pane right of it, the chip 28 px right of the grip at y 50.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `label` | code | – | 1 | – | – | README.md · quick start / README.md · quick start |
  | `prompt` | code | – | 1 | 40 chars | 40 chars | Use northwind. / Use northwind. |
  | `claim` | list | – | 1–2 | – | – | 2 items |
  | `claim[].type` | undefined | – | 1 | – | – | – |
  | `claim[].tier` | undefined | – | 1 | – | – | – |
  | `claim[].limits` | undefined | – | 1 | – | – | – |
  | `result` | image | – (optional) | 1 | – | – | – / – |

- **Length**: 5–14 beats (2.5–7 s at 120 BPM); typing, the caret’s run (0.75 beat) on the next whole beat at least 2, the drawer (1 beat), the claim a beat apart, the request out 1.5 beats after; the sample plans 7 beats.
- **Steps and events**: beat 0.25 the request types at 28 characters a second behind the caret; the caret runs to x 900 growing to full height and stands up (landing on beat 2 in the sample: `hook`); the result slides out of the seam (1 beat); the claim’s phrases on the next beats; the request leaves upward; the grip on the landing, the chip half a beat after.
- **Needs**: motions split-open; props seam-grip; roles paper, ink, muted, dim, bench, onBench, accent, key; type display, mono.
- **Sound**: `type` per character, `turn` (split-open) as the caret runs, `hook` as it stands up.
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/choreo.js (request), film.js (inputOf.request, split-open)`), split from the template of the split style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese claims keep 59 px (Archivo then Noto Sans SC, no negative tracking) and are read at 6 characters a second plus half a second (lang.js); code, commands, paths, list items, report lines and addresses stay Latin in JetBrains Mono, as the product prints them.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the split template (`assets/templates/split/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the split recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). none found against film-v1 at its moments (the template’s request is film-v1’s).
- **Pitfalls**: none known.
