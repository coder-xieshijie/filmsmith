---
id: diff-climax
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### diff-climax

- **Purpose**: One changed line, two registered renders of the same instant either side of the seam; the seam slides so the edit takes the frame over, landing on a bar line with the claim.
- **Intent**: Change one thing and show it twice: the edit takes the frame over.
- **Content**: The line (number, before, after; ≤ 40 characters), two renders of one instant at one size, a claim in two phrases (≤ 8 words each).
- **Fits**: `climax`; The climax of a film whose product turns a one-line change into a visible change. **Not for**: Two renders that differ by more than the shown line; renders of different instants.
- **Layout and camera**: the paper band above y 260: the label, the minus line at y 150, the plus line at y 202 beside a 6 × 40 accent bar, the claim at x 1040 (y 140, 214); the two renders below, the seam vertical from x 1320 to 620 with the chips either side.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `label` | code | – | 1 | – | – | docs.config.js / docs.config.js |
  | `claim` | list | – | 2–2 | – | – | 2 items |
  | `claim[].type` | undefined | – | 1 | – | – | – |
  | `claim[].tier` | undefined | – | 1 | – | – | – |
  | `claim[].claim` | undefined | – | 1 | – | – | – |
  | `claim[].limits` | undefined | – | 1 | – | – | – |
  | `before` | image | – (optional) | 1 | – | – | – / – |
  | `after` | image | – (optional) | 1 | – | – | – / – |

- **Length**: 10–20 beats (5–10 s at 120 BPM); the slider lands on the first bar line at least 7.5 beats in, then the claim’s reading and a 2-beat pause; the sample plans 11 beats (12 in Chinese).
- **Steps and events**: beat 0.5 the plus bar draws and the plus line types (12–42 characters a second, filling the time before the first phrase); 6 beats before the landing the first phrase; 4 beats before, before and after named on chips either side of the seam; 2 beats before, the seam slides (cubic in-out) and lands on the bar line with the second phrase (`claim`); the pause.
- **Needs**: motions diff-slider; props seam-grip, code-gutter; roles paper, ink, muted, dim, bench, onBench, accent, key; type display, mono.
- **Sound**: `type` per character, `turn` (diff-slider, an air sweep), `claim` (an impact, a rolled chime and a duck).
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/choreo.js (diff), film.js (inputOf.diff, diff-slider)`), split from the split style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese claims keep 59 px (Archivo then Noto Sans SC, no negative tracking) and are read at 6 characters a second plus half a second (lang.js); code, commands, paths, list items, report lines and addresses stay Latin in JetBrains Mono, as the product prints them.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the split template (`assets/templates/split/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the split recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). none found against film-v1 at its moments.
- **Pitfalls**: Give `bar` (the beat of its bar the scene starts on) so the slider lands on a bar line.
