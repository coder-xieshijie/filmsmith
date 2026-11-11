---
id: ring-route
category: motion
tier: T1
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### ring-route

- **Looks**: one 3 px accent stroke with round joins: up from the top of each region to a lane 50 px above the prints, along it, down into the next; drawn by a growing dash.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas.
- **Use**: The close of a film that pointed at several pieces of evidence. **Not for**: A single piece of evidence; regions on one print only (ring them instead).
- **Intent**: Retrace the argument as one path through the evidence before the name.
- **Content**: The regions ringed during the film, in order (one per read, both sides of each match).
- **Parameters**: `route` (regions in visiting order), the lane height from the overview
- **Theory**: A path drawn through the items in the order they were shown recalls the sequence (method of loci; Yates 1966) and closes the argument on one figure.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Length and easing**: 2 beats, cubic in-out on the stroke’s length.
- **Sound**: a pencil rim as it starts.
- **Source**: own (`assets/templates/exhibit/film.js (lockup: ROUTE, the route)`), split from the template of the exhibit style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; language-free (no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the exhibit template (`assets/templates/exhibit/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the exhibit recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: none known.
