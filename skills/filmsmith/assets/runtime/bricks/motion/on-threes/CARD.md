---
id: on-threes
category: motion
tier: T1
family: edit-cut
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### on-threes

- **Looks**: the inner brick's move is drawn on threes until the switch: each pose holds for three frames, so the first part reads as hand-drawn (a flip book). At the switch two frames flash inverted (the impact frames of Japanese key animation), and from there the move runs on ones, every frame, with motion blur back on: the climax feels faster by contrast.
- **Tier**: T1. **Family**: edit-cut. **Surface**: canvas (the inner brick's).
- **Use**: a climax that should feel faster than what led to it; hand-drawn, anime or zine styles; once per film. **Not for**: calm, continuous films (the steps read as dropped frames); dom bricks (canvas inner bricks only for now).
- **Intent**: The climax feels faster than anything before it: a hand-drawn, stepping move suddenly runs smooth, and the switch itself is the high point.
- **Content**: Wraps one canvas motion brick with a large move (each 3-frame step ≥ 30 px) and the moment to switch; no text of its own.
- **Parameters**: `inner` { `id`, `params`, `category` } (the brick it times; default `card-portal`), `beats` 4 (the length you give the inner move), `every` 3 (frames per held pose), `switch` 0.5 (share of the move drawn stepped), `impact` 2 (inverted frames at the switch; 0 for none), `fpb` 15 (frames per beat: 30 fps at 120 BPM). Roles read: none of its own (the inner brick's).
- **Theory**: limited animation holds drawings for two or three frames; switching to ones for the climax makes the fast part feel faster by contrast, and the impact frames punctuate it (sakuga timing in Japanese key animation).
- **Styles**: hand-drawn, anime, zine, paper; avoid thread (its lines must flow).
- **Length and easing**: as the inner move, 2–8 beats; the inner brick keeps its own easing, only its time is held.
- **Sound**: a hit on the impact frames; the stepped part can sit on a ticking hi-hat on threes.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/rhythm/sakuga-timing-shift/SakugaTimingShift.tsx` (card `references/shots/rhythm/sakuga-timing-shift.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws nothing of its own).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: only the timing rule is kept and applied to any inner brick; the paper sheet, the cel card's walk and sprint, the timesheet, the corner label and the speed lines are gone; the impact frames invert the picture instead of an ink ground with focus lines. Compare: waived for SSIM, track and progress (the pictures and paths are the inner brick's), but the key events line up with the upstream's within ±1 frame (start 2/2, switch 48/47, settle 76/77).
- **Pitfalls**: Each step on threes must move ≥ 30 px; small steps read as dropped frames. Mark the switch (a hit sound or a label); otherwise viewers only feel "it got faster". One time-manipulator per shot: not with time-freeze or hit-stop.
