---
id: pencil-loop
category: motion
tier: T1
family: line-path
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### pencil-loop

- **Looks**: a 6 px round-capped accent stroke: a loop 30 px outside the cell (24 above and below), drawn from the upper left through 1.1 turns, spiralling in so its end crosses its start; an underline 10 px past each end, a gentle wave and a hooked end.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas.
- **Use**: A choice made by a person: the pick among many, the address to remember. **Not for**: Marking several things; anything on a dark frame.
- **Intent**: A hand mark that reads as a choice, not as the system’s highlight.
- **Content**: The cell to loop (row, cell) or the address to underline.
- **Parameters**: `mode` (`loop` | `underline`), `row`, `cell`, `url`, `seed`
- **Theory**: A hand mark reads as a person’s choice, not the system’s (the editor’s china marker on a contact sheet); the step back keeps the picked row the only figure (Wertheimer 1923, figure and ground).
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Length and easing**: 2 beats: the loop over the first beat (cubic in-out), the other rows stepping back over the next half; the underline in 0.75 beat.
- **Sound**: a scribble (a high, narrow whoosh) and a stamp as the loop closes.
- **Source**: own (`assets/templates/strip/lib/handoffs/strip.js (pencilLoop, pencilUnderline), choreo.js (pick, lockup)`), split from the strip style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; language-free (no text of its own).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the strip template (`assets/templates/strip/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the strip recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: none known.
