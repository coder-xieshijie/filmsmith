---
id: seam-close
category: motion
tier: T1
family: split-wipe
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### seam-close

- **Looks**: the seam with its grip and the page beside it slides from x 1000 off the right edge (cubic in-out, 1 beat); then the accent caret after the install line is on for a quarter beat on each beat.
- **Tier**: T1. **Family**: split-wipe. **Surface**: canvas.
- **Use**: Closing a film whose through-line is the seam. **Not for**: Films without a seam; a mid-film change.
- **Intent**: End where the film began: the seam leaves, the caret waits.
- **Content**: The lock-up’s name, install line and address.
- **Parameters**: `name`, `command`, `url`
- **Theory**: Closure: the actor that opened the film leaves the way it came, and the caret it was born from is what remains (object constancy, Heer & Robertson 2007).
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Length and easing**: 2 beats: the close over the first (landing on the last bar line), a blink on the second.
- **Sound**: `turn` with the `seam-close` whoosh as it starts.
- **Source**: own (`assets/templates/split/film.js (stateOf lockup: close, blinks)`), split from the split style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; language-free (the lock-up’s text is the scene’s).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the split template (`assets/templates/split/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the split recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: none known.
