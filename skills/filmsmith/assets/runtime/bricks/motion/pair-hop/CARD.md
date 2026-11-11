---
id: pair-hop
category: motion
tier: T0
family: vertical
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### pair-hop

- **Looks**: a 6 × 34 px accent tick at x 96 slides 0.25 s (cubic in-out) to the next list item, which turns bold; or a 4 px underline slides 0.2 s to the next token, its width changing on the way; the result beside the seam cuts on the same beat.
- **Tier**: T0. **Family**: vertical. **Surface**: canvas.
- **Use**: Pairing items of a list or tokens of code with the results they make, one a beat. **Not for**: Several marks at once; a mark that fades between places.
- **Intent**: Pair one input with one result at a time, on the beat the result changes.
- **Content**: A list and the item to move to, or quoted lines and the next token.
- **Parameters**: `mode` (`tick` | `underline`), `list`, `from`, `to`, `lines`, `tokens`
- **Theory**: Spatial and temporal contiguity (Mayer 2017): the input and the result it makes are paired by one moving mark on the beat the result changes; one mark at a time keeps one protagonist.
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Length and easing**: 2 beats in the sample: the hop on beat 1 (0.25 s; 0.2 s for an underline); in the scenes the hops fall on beats 1, 2, then every 2 (pick) or on 2, 3, 4 … (file).
- **Sound**: `pull` (a rim) on each hop; `accent` on a paired frame.
- **Source**: own (`assets/templates/split/film.js (inputOf.pick tick, inputOf.file underline)`), split from the template of the split style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; language-free (it moves a mark).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the split template (`assets/templates/split/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the split recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: none known.
