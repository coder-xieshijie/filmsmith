---
id: rank-sweep
category: motion
tier: T0
family: shape
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### rank-sweep

- **Looks**: a sweep by rank runs along the marks: every non-protagonist mark steps from base to rest, the protagonist's marks swell × 1.4 one by one; `kind: 'glint'` swells them × 1.22 in a 0.6-beat sweep and changes no colour.
- **Tier**: T0. **Family**: shape. **Surface**: canvas.
- **Use**: The closing second move of a chart scene that ends a film; a glint in a reading hold over 1.5 beats. **Not for**: Charts whose marks are not units; a protagonist that has not been named yet.
- **Intent**: At the end of a chart everything but the protagonist steps back, so the viewer leaves with the one group the film is about.
- **Content**: A unit layout already on screen with a protagonist group; nothing new.
- **Parameters**: `groups`, `accent`, `layout` (default `bands`), `kind` (`close` | `glint`), `mark`, `seed`; roles `ground`, `panel`, `base`, `rest`, `accent`.
- **Theory**: The isolation effect (von Restorff 1933; Hunt 1995): emphasis works when everything else is alike, so the move removes competition rather than adding colour.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid halftone, morph.
- **Length and easing**: 3 beats (2 for the glint): sweep 2.6 beats, each swell 0.35 s.
- **Sound**: `accent` as the sweep reaches the protagonist's last mark.
- **Source**: own (`assets/templates/tally/squares.js (closing light, glints)`), split from the tally style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Use it once, at the end; a sweep in every chapter turns into decoration.
