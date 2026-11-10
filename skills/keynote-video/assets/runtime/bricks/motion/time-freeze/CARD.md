---
id: time-freeze
category: motion
tier: T2
family: zoom-depth
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### time-freeze

- **Looks**: `orbit` (default): the content plays (a chart grows) on one plane square to the camera; at a third of the way its time brakes in 8 frames to a freeze; while it is frozen the camera orbits the plane to 52° (a grid floor and a far dot wall slide in parallax), drifts at the apex, pushes in 160 px and comes back square; time ramps back in 8 frames and the content finishes. `annotate`: the content plays; time stops instantly (a shutter flash, frame corners spring in, the frame dims slightly); a marker draws one hand-made ring (1.08 turns, not closed) round `focus`, an arrow and a short note with an underline appear; the ink fades and the content catches up in 22 frames (ease-in, then lands). `hit-stop`: the content plays square to the camera and on each hit holds still for 2 frames under a faint paper flash, then goes on from where it stopped.
- **Tier**: T2. **Family**: zoom-depth. **Surface**: dom (the content is a canvas repainted at its own time).
- **Use**: the one moment of a process worth seeing from the side (a spike, a peak); review and explain films that point at one thing (`annotate`); the weight of each landing in a combo (`hit-stop`; other bricks and scenes call the exported `hitStop(f, hits, stop)` to remap their own clock). **Not for**: content with no motion of its own (nothing to freeze); strip or split styles (`orbit` moves the camera; use `annotate`).
- **Intent**: "This moment is worth stopping time for": the content freezes while we look at it from the side or mark it up, so one instant of a process lands with weight.
- **Content**: Wraps one time-driven painter (a chart growing, a list moving) and the moment to freeze; `annotate`: the focus point and a note ≤ 24 chars (Chinese ≤ 10 characters); `hit-stop`: the hit frames.
- **Parameters**: `mode` `'orbit'` | `'annotate'` | `'hit-stop'`, `scene` (a time-driven painter `paint(ctx, t)`, t 0 → 1; default the sample bar chart), `yaw` −52 (orbit angle), `floor` true (grid floor and dot wall, orbit), `focus` [x, y, w, h] (what the ring circles, annotate; default the chart's accent bar), `note` (sample-copy key or text of the note; default `metric`), `look` (whose type the note is set in; default neutral); hit-stop: `hits` [14, 28, 42] (content frames), `stop` 2, `content` 54 (content frames). Roles read: `ground`, `accent` (glow, floor dots, marker ink), `ink` (the note's caption), `line` (floor grid), `paper` (hit-stop flash).
- **Theory**: two clocks: freezing the content while the camera moves separates what happened from how we look at it (bullet time); the orbit's parallax shows the frozen frame is a space; the instant freeze of `annotate` reads as pressing pause to point at one thing.
- **Styles**: any; in strip, split or scroll use `annotate`.
- **Length and easing**: `orbit` 9.5 beats (140 frames at 120 BPM), `annotate` 9 beats (134 frames), 8–12; `hit-stop` 4 beats (54 content frames plus 2 held per hit). Orbit: speed ramp out 29–34 %, frozen to 71 %, ramp in 71–77 % (`smooth`); camera out 33–51 % `smooth`, drift 51–60 %, back 60–76 % `swift`. Annotate: freeze at 34 %, ring 40–48 %, note 49–58 %, ink out 78–84 %, thaw 84–100 % (smootherstep).
- **Sound**: the music drops out (or a tape-stop) on the freeze and comes back with time; a marker squeak on the ring (`annotate`).
- **Merged from**: `freeze-annotate` (mode `annotate`).
- **Source**: adapted from video-shotcraft `demos/camera/tension-camera-moves/BulletTimeFreezeOrbit.tsx` (card `references/shots/camera/tension-camera-moves.md`) and `demos/rhythm/speed-ramp-freeze/FreezeAnnotateReal.tsx` (card `references/shots/rhythm/speed-ramp-freeze.md`) @ `1266a3e`; `hit-stop` from `demos/effects/impact-feedback/HitCounter.tsx`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the note and its caption come from the sample copy and the look's type).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the content is any time-driven painter on one plane instead of the glass data panel with sparks and an odometer (orbit) or the card rail of screenshots (annotate); the plane is the scene's aspect (1180 × 664, the upstream's panel is 1180 × 640); the marker has no turbulence wobble and no pin is left behind; no light breathing or grain. Compare (`orbit`): pass (tracks within 1.8 px, events ±0 frames, SSIM drop 0.067).
- **Pitfalls**: One time-manipulator per shot: not with on-threes or another speed ramp; two remaps fight and read as a fault. `hit-stop` must freeze the whole picture, background included; otherwise only that card seems to drop frames. Pick by meaning: orbit is "stop to look", annotate is "stop to explain".
