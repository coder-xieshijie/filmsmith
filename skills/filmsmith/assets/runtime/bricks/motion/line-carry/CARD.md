---
id: line-carry
category: motion
tier: T2
family: line-path
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### line-carry

- **Looks**: a line fills a bar in the current scene (ease-out), holds a beat when full, then runs out of the scene to a point at x 1480 (zero speed at both ends); the camera then pans one frame width to the right at the line's own speed, so the tip (an accent dot with a soft halo) stays pinned on screen while the line grows; a ruler appears under the line once it has passed. Near the end of the pan the line turns up, then runs the frame's top, right and bottom edges to close it; the next scene's picture inside the frame fades in as it closes and the tip fades out. The world blurs sideways with the camera's speed; the line and tip stay sharp.
- **Tier**: T2. **Family**: line-path. **Surface**: canvas.
- **Use**: process → result (render → film, plan → shipped), a graphic, poster-style title sequence, one continuous gesture between two places. **Not for**: scenes with no line or rule to start from; fast films (about 9 beats); vertical layouts.
- **Intent**: No cut at all: one line, born from something finishing, leads the eye across to the next place and draws its frame, so two scenes read as one gesture.
- **Content**: Wraps two scenes: the first must have a line to start from (a progress bar, an underline, a rule) and its position; the second picture goes inside the frame the line draws.
- **Parameters**: `from`, `to` (painters; `to` sits one frame width to the right), `frame` [x, y, w, h] (the frame the line draws, in the next scene's coordinates; its bottom is the line's height; default [960, 280, 720, 480]), `x0` 336 (the bar's start in the current scene), `bar` 648 (the bar's length), `tipX` 1480 (where the tip is pinned on screen during the pan), `width` 8, `ticks` true (ruler under the line), `cover` true (the frame's inside shows the ground until it closes), `smear` 0.28 (world blur per px/frame of camera speed, at most 16 px). Roles read: `ink` (line, ruler), `accent` (tip), `ground` (the cover).
- **Theory**: the eye follows one moving point (smooth pursuit), so a line that never breaks carries attention across a change of place without a cut (the graphic relay of title sequences in the Saul Bass tradition); every hand-over (bar → run-out → pan → closing) is at continuous speed, so it reads as one gesture.
- **Styles**: any style with lines and rules (graphic, blueprint, editorial); not strip or scroll.
- **Length and easing**: 9.2 beats (138 frames at 120 BPM, 30 fps), 7–12. Bar 0–26 % `out`; run-out 30–38 % `swift`; pan 38–78 % `smooth` (the line grows with the camera); closing 78–96 % `smooth`; picture fade 93–100 % `out`; tip fade 96–100 %.
- **Sound**: a pencil or scratch bed under the line; a soft `land` when the frame closes.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/transition/line-carry-transition/LineCarryTransition.tsx` (card `references/shots/transition/line-carry-transition.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the ruler has no labels).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: any two scenes instead of the export card and the poster; the frame's place, the bar and the pinned tip are parameters; the ruler has no distance labels; the next scene's picture is masked with the ground until the frame closes (the upstream builds its poster inside); the world's speed blur is six shifted copies instead of a CSS blur. The rests are not the bare scenes: at the end the closed frame stays drawn on the next scene. Compare: pass (tracks 0 px, events ±1 frame, SSIM drop 0.001).
- **Pitfalls**: The line must grow out of something already on screen (a bar finishing, an underline drawn); a line from nowhere reads as a screensaver. A signature move: once per film. Keep one line language across the film (same weight and feel as other drawn lines).
