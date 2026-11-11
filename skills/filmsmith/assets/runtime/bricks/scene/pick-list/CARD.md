---
id: pick-list
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### pick-list

- **Purpose**: A list on the paper side and a tick that hops to one item at a time; the result beside the seam follows: a louvre for the first change, a push after.
- **Intent**: Each choice written on the left makes the result on the right, on the same beat.
- **Content**: 2–10 list items (≤ 14 characters, as the product names them), 2–4 picks each with its result, a claim (≤ 5 words).
- **Fits**: `demo`; Choosing among modes, presets or targets and seeing each result. **Not for**: More than four picks; a list longer than ten.
- **Layout and camera**: the claim at y 200, the list from y 300 at x 136, 50 px apart (mono 33, the picked one bold in `ink`), the tick at x 96; the seam at x 900, the result pane right of it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `label` | code | – | 1 | – | – | SKILL.md · themes / SKILL.md · themes |
  | `claim` | text | primary | 1 | 5 words, 24 chars | 12 chars | Pick a theme, / 挑一种主题， |
  | `list` | list | – | 2–10 | – | – | 6 items |
  | `list[].type` | undefined | – | 1 | – | – | – |
  | `list[].limits` | undefined | – | 1 | – | – | – |
  | `picks` | list | – | 2–4 | – | – | 3 items |
  | `picks[].item` | code | – | 1 | – | – | – |
  | `picks[].result` | image | – (optional) | 1 | – | – | – |

- **Length**: 6–16 beats (3–8 s at 120 BPM); hops on beats 1, 2, 5, 7 …; the louvre 2 beats, a push 0.75; the scene ends 1.25 beats after the last landing; the sample plans 7 beats.
- **Steps and events**: beat 0.25 the claim and the label; 0.5 the list rises (0.04 s an item); beat 1 the tick on the first pick (its result already beside the seam, pushed in if the scene before showed another); beat 2 the tick hops and the louvre brings the second result (2 beats, slats 0.07 apart from the top); beat 5 the next hop with a one-slat push; the chip swaps as each result lands; the request’s copy (with `from`) leaves at beat 0.
- **Needs**: motions louvre, pair-hop; props seam-grip; roles paper, ink, muted, dim, bench, onBench, accent, key; type display, mono.
- **Sound**: `pull` (a rim) per hop, `turn` (louvre: a tick per slat) and `land` as it lands.
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/choreo.js (pick), film.js (inputOf.pick, louvre)`), split from the template of the split style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese claims keep 59 px (Archivo then Noto Sans SC, no negative tracking) and are read at 6 characters a second plus half a second (lang.js); code, commands, paths, list items, report lines and addresses stay Latin in JetBrains Mono, as the product prints them.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the split template (`assets/templates/split/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the split recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). none found against film-v1 at its moments.
- **Pitfalls**: Use the louvre once; later changes are pushes.
