---
id: perspective-glide
category: motion
tier: T2
family: horizontal
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### perspective-glide

- **Looks**: a strip of pages stands steeply on edge, turned 60° (its near edge on the right, its far edge vanishing low on the left, its top rising to the right), on a dark ground with a soft accent glow on the left. The camera never moves: the strip itself glides along its own plane, about one page, soft at the start and landing at rest, while a darkening lifts off it in the first 1.5 s. Fast parts leave three faint trailing copies; a depth fog darkens the far end.
- **Tier**: T2. **Family**: horizontal. **Surface**: dom.
- **Use**: showing a long UI (a board, a timeline, a feed) as an object in space; an opener or b-roll under a voice line. **Not for**: reading the page's text (it is at 60°); short slots (it needs about 8 beats).
- **Intent**: The page shows itself off: a long interface stands as a steep wall and slides past a still camera like train carriages, so it reads as a real object in space.
- **Content**: Wraps one long, wide page (a board, timeline or feed; a long screenshot works) or a strip of 2–4 page painters; its text is not read.
- **Parameters**: `pages` (painters laid side by side as one strip; default page, grid, detail), `land` true (`false` keeps the upstream's curve, which never stops: for a shot cut out while still moving), `scale` 1.378 (strip scale on the wall; the upstream's panel height at 0.62), `trail` true (three trailing copies by speed), `res` 1 (canvas resolution of the strip). Roles read: `ground` (the dark around it, the shade and fog), `panel` (strip backing), `accent` (glow).
- **Theory**: with the camera locked, motion parallax across the steep plane carries the depth (the near edge moves fast, the far edge slowly), so a flat UI reads as an object in space (Gibson 1979, optic flow); moving the object rather than the camera keeps the frame calm.
- **Styles**: any style with a dark or deep ground; avoid paper, strip and split (flat-camera styles).
- **Length and easing**: 8 beats (4 s at 120 BPM), 6–12. Slide cubic-bezier(0.3, 0.12, 0.5, 1) (landing; `land: false` uses 0.3, 0.12, 0.72, 0.9); shade 0.7 → 0.4 → 0 over the first 15 % and 37 %.
- **Sound**: an air bed or a long whoosh under the glide.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/camera/steep-tilt-glide/SteepTiltGlide.tsx` (card `references/shots/camera/steep-tilt-glide.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the pages are the scenes').
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the page is a strip of the scenes' painters instead of the task board; the glide lands by default (the upstream never settles); the hovering text that falls onto the page is the separate brick `float-land`; no grain. The camera constants (perspective 1100, origin 30 % 58 %, rotateY −60°, rotateZ −2°) and the slide distance are the upstream's. Compare (`land: false`, light pages on the dark ground like the upstream): pass (track 0 px, events ±0 frames, SSIM drop 0.064).
- **Pitfalls**: Keep the angle within 55–65°; outside it is another shot. Do not use with graze-tour in the same section: one moves the camera, this one the page.
