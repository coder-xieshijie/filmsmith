---
id: row-pull
category: motion
tier: T1
family: horizontal
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### row-pull

- **Looks**: each longer strip’s cut end slides right to its film’s length while its frames are revealed; then each length (`40 s`) appears at its end.
- **Tier**: T1. **Family**: horizontal. **Surface**: canvas.
- **Use**: Showing that lengths differ and by how much. **Not for**: Equal lengths; values that are not lengths.
- **Intent**: Let the differences grow in front of the viewer, then name them.
- **Content**: The rows of a contact sheet with their durations.
- **Parameters**: `rows` (name, duration)
- **Theory**: Length on a common baseline is the most accurate visual comparison of quantities (Cleveland & McGill 1984); a strip as long as its film is the quantity itself.
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Length and easing**: 3 beats in the sample: the pull-out from 0, 0.1 beat between rows, 0.75 each (cubic out); the lengths from 1.6, 0.1 beat apart.
- **Sound**: a stamp and a tick as the lengths are set.
- **Source**: own (`assets/templates/strip/choreo.js (sheet: extend, lengths), film.js (sheetState)`), split from the strip style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; the lengths are numbers with `s`.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the strip template (`assets/templates/strip/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the strip recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: none known.
