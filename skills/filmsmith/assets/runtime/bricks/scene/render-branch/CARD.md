---
id: render-branch
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### render-branch

- **Purpose**: The seam rises to a command band and branches: the command types above, the output below cutting on the beat, its report in the new pane line by line.
- **Intent**: Run it and measure it in one frame: command, output, report.
- **Content**: A command (≤ 44 characters), 2–5 output frames, a report (label, 1–5 lines, result), a claim in 1–2 phrases (≤ 2 words each).
- **Fits**: `proof`, `demo`; A command, its output and the tool’s report on that output. **Not for**: A report typed for the film; an output that was not rendered.
- **Layout and camera**: the command at y 190 (mono 44) in the band above y 260; the output pane 0–1320 below; the report pane from x 1320 (`report-pane`).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `label` | code | – | 1 | – | – | terminal / terminal |
  | `command` | code | – | 1 | 44 chars | 44 chars | $ npm run docs / $ npm run docs |
  | `claim` | list | – | 1–2 | – | – | 2 items |
  | `claim[].type` | undefined | – | 1 | – | – | – |
  | `claim[].tier` | undefined | – | 1 | – | – | – |
  | `claim[].limits` | undefined | – | 1 | – | – | – |
  | `results` | list | – | 2–5 | – | – | 4 items |
  | `results[].type` | undefined | – | 1 | – | – | – |
  | `results[].crop` | undefined | – | 1 | – | – | – |
  | `results[].optional` | undefined | – | 1 | – | – | – |

- **Length**: 6–14 beats (3–7 s at 120 BPM); the branch 2 beats, cuts on beats 2, 3, 4 …, report lines every half beat from 3, the result line after both, the second phrase half a beat later; the sample plans 8 beats (9 in Chinese).
- **Steps and events**: beat 0 the seam rises to y 260 (1 beat), then the branch runs down at x 1320 and the report pane opens behind its tip (1 beat); beat 0.75 the command types; beat 1.5 the report label; beat 2 the first cut, 2.5 the claim’s first phrase, 3 the first report line; the result line on the later of a beat after the last line and half a beat after the last cut; the second phrase half a beat after (`p2Beat` places it).
- **Needs**: motions split-branch; props seam-grip, report-pane; roles paper, ink, muted, dim, bench, onBench, mutedOnBench, accent, key; type display, mono.
- **Sound**: `turn` (split-branch: up, then down), `type`, `tick` per report line, `accent` per cut.
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/choreo.js (render), film.js (inputOf.render, reportPane, split-branch)`), split from the template of the split style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese claims keep 59 px (Archivo then Noto Sans SC, no negative tracking) and are read at 6 characters a second plus half a second (lang.js); code, commands, paths, list items, report lines and addresses stay Latin in JetBrains Mono, as the product prints them.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the split template (`assets/templates/split/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the split recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). film-v1 sets the second phrase with the result line (26.5) where the template sets it half a beat later; `p2Beat` gives a film its own.
- **Pitfalls**: none known.
