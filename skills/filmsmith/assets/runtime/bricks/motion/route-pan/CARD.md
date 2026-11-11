---
id: route-pan
category: motion
tier: T1
family: horizontal
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### route-pan

- **Looks**: the drawing slides one sheet over; a black arrow grows across the gap and its head lands as the next sheet stops, its frame already drawing.
- **Tier**: T1. **Family**: horizontal. **Surface**: canvas.
- **Use**: Every seam between two sheets of a blueprint film. **Not for**: Seams into or out of the overview (a pull-out); cuts between different drawings.
- **Intent**: Keep one space: the camera travels the drawing and the route line pulls the eye to the next sheet, so nothing is a cut.
- **Content**: The two sheets and the direction of travel (right, left, down).
- **Parameters**: `dir` (right | left | down), `fromName`, `toName`; roles read: `ground` (outside the paper), `paper`, `ink` (the arrow), `line` (frames, grid).
- **Theory**: Spatial continuity: one world under a moving camera keeps the viewer's map of where each sheet is (Tversky 2003); the line drawing ahead is a leading line.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Length and easing**: 1 beat, power3.inOut for the camera and the arrow alike; the head at 0.98; the next frame from 0.45.
- **Sound**: one whoosh down (350–2600 Hz) per move, −27 dB.
- **Source**: own (`assets/templates/blueprint/film.js (world route arrows); camera.js (cameraKeys)`), split from the template of the blueprint style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: The scene bricks draw their own arrival (lead 1); use route-pan where the host draws both sheets in one world, not on top of a scene's own arrival.
