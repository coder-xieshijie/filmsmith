---
id: level-rail
category: motion
tier: T0
family: vertical
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### level-rail

- **Looks**: the margin’s block of words slides up or down to the height of the next region while the accent tick on the device’s edge travels with it; the lines inside do not re-enter.
- **Tier**: T0. **Family**: vertical. **Surface**: canvas.
- **Use**: A light or a push that moves the region in play while its words stay beside it. **Not for**: Copy that does not belong to a region; a block that would leave the safe area.
- **Intent**: Word and evidence are read across one horizontal, even when the evidence moves.
- **Content**: A copy block (value, line, note) and the heights of two regions.
- **Parameters**: `y0`, `y1` (the two regions’ centres in film px), `x`, `w` (the margin), `copy`; roles `ground`, `panel`, `ink`, `dim`, `accent`.
- **Theory**: Spatial contiguity (Mayer 2017): a word read on the same horizontal as its evidence needs no search; the block moves with the light so the pairing survives the move.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, any real-asset launch; avoid tally, trace.
- **Length and easing**: 1 beat, cubic in-out (the spotlight-band hop’s beat); the block sits 62 px above the region’s centre, clamped to 96–654 px.
- **Sound**: none of its own (the hop’s `accent`).
- **Source**: own (`assets/templates/handset/film.js (blockY), choreo.js (the level tick)`), split from the handset style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese lines wrap inside the margin (lang.js wrap, simple kinsoku) instead of shrinking; notes and the chin are 28 px in Chinese (25 in English); numbers and product names stay in the Latin face; no capitals, no negative tracking.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the handset template (`assets/templates/handset/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the handset recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Clamp the block to the safe area; a region near the edge leaves the block at the clamp.
