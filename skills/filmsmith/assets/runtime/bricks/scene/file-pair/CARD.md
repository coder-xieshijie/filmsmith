---
id: file-pair
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### file-pair

- **Purpose**: A wipe line brings real lines of a real file over the frames they made; an underline pairs a token with the frame below it, one a beat.
- **Intent**: Register a line of input with the frame it produced.
- **Content**: 2–6 quoted lines with the file and first line number, 1–4 pairs { line, token, result }, a claim (≤ 5 words).
- **Fits**: `demo`, `proof`; Showing that a line of input made a piece of output. **Not for**: Code written for the film; outputs not made by those lines.
- **Layout and camera**: the claim at y 170, the lines from y 236 (46 px), the seam under them (y 420 for four lines), the result pane below; the chip right-aligned at x 1800 under the seam.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `label` | code | – | 1 | – | – | docs.config.js / docs.config.js |
  | `claim` | text | primary | 1 | 5 words, 24 chars | 12 chars | fill one file, / 填一份文件， |
  | `lines` | list | – | 2–6 | – | – | 4 items |
  | `lines[].type` | undefined | – | 1 | – | – | – |
  | `lines[].limits` | undefined | – | 1 | – | – | – |
  | `pairs` | list | – | 1–4 | – | – | 2 items |
  | `pairs[].token` | code | – | 1 | – | – | – |
  | `pairs[].result` | image | – (optional) | 1 | – | – | – |

- **Length**: 5–12 beats (2.5–6 s at 120 BPM); the wipe 2 beats, the claim at 1.5, a pair a beat from 2, then 1.5 beats; the sample plans 6 beats (7 in Chinese).
- **Steps and events**: with `from`: beat 0 a copy of the seam crosses the frame downward (wipe-line, 2 beats): the previous state ahead, this one behind; beat 1.5 the claim; beat 2 the underline draws under the first token (its frame already below); each next beat the underline slides to the next token (0.2 s) and the frame cuts.
- **Needs**: motions wipe-line, pair-hop; props seam-grip, code-gutter; roles paper, ink, muted, dim, bench, onBench, accent, key; type display, mono.
- **Sound**: `turn` (wipe-line, an air sweep) and `land`; `accent` on each pairing after the first.
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/choreo.js (file), film.js (inputOf.file, wipe-line)`), split from the template of the split style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese claims keep 59 px (Archivo then Noto Sans SC, no negative tracking) and are read at 6 characters a second plus half a second (lang.js); code, commands, paths, list items, report lines and addresses stay Latin in JetBrains Mono, as the product prints them.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the split template (`assets/templates/split/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the split recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). none found against film-v1 at its moments.
- **Pitfalls**: none known.
