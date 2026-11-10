---
id: isolate
category: motion
tier: T2
family: zoom-depth
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### isolate

- **Looks**: the film opens close on one card (2.2×) among eight neighbours; the camera pulls back about the card (out-cubic) to 0.62×. From a quarter of the way in, the neighbours go out one by one, nearest first, every 8 frames: each fades (opacity first), darkens, defocuses and sinks slightly. From the middle the ground sinks from the look's ground to a deep tone, and a cool halo grows round the card. It ends with one small lit card alone in the dark.
- **Tier**: T2. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: the one number or claim the film is for; an ending that narrows to a single item. **Not for**: showing how items relate (it removes them); bright, busy films that should stay open.
- **Intent**: "In the end, only this one thing": everything around one card goes dark as the camera pulls away, a quiet, heavy close on the point the film is for.
- **Content**: One hero card (a number or a claim, ≤ 24 chars, Chinese ≤ 10 characters) among 4–8 neighbour cards whose content does not matter.
- **Parameters**: `hero` { `w` 520, `i` 4 } (the card's width and which sample card it is), `siblings` (offsets and widths [[dx, dy, w], …] from the hero's centre; default the upstream's eight), `start` 2.2, `end` 0.62 (camera scale), `step` 8 (frames between neighbours going out), `fade` 16 (frames each takes), `halo` true. Roles read: `ground` (both grounds: the deep one is the ground mixed with black), `accent` (halo, mixed with white; the ground's glow), `panel`, `ink`.
- **Theory**: isolation by subtraction: removing every competitor leaves one figure, and the pull-back gives it scale against the emptiness (figure–ground); nearest-first makes the darkness travel outward from the subject.
- **Styles**: any; avoid strip and split (locked cameras).
- **Length and easing**: 7.5 beats (about 110 frames at 120 BPM), 6–10. Pull-back out-cubic over the whole; neighbours from 27 % in steps of 7 %; ground and halo from 55 %, in-out quad.
- **Sound**: a low drone that thins as the cards go out; silence at the end.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/camera/tension-camera-moves/PullBackIsolation.tsx` (card `references/shots/camera/tension-camera-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the cards' titles and meta come from the sample copy).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the sample's cards instead of the metric card and placeholder siblings; card heights follow the card's aspect (the upstream's hero is 520 × 340, here 520 × 300); the deep ground is the look's ground mixed with black; no grain. Compare: pass (tracks 0 px, events ±0 frames, SSIM drop 0.069).
- **Pitfalls**: At the end of a film, do not follow it with an opening move such as group-photo: one closes, the other opens. Do not stack it with another time or camera trick in the same shot.
