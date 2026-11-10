---
id: reticle-lock
category: motion
tier: T0
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### reticle-lock

- **Looks**: Four L-shaped corners fly in together as one large frame from the lower right, shrink past the target, come back out to it and bite onto it with a 6 px click; as they lock a faint light rises inside the frame, the rest of the screen dims a little, a crosshair marks the centre, and a small label pill pops above the top-left corner from its foot.
- **Tier**: T0. **Family**: shape. **Surface**: canvas.
- **Use**: pointing at one region while the picture keeps running: the panel, the number, the button the next line is about. `fly: [0, 0]` with `grow` and no label: the corner brackets collapse onto a document in place (the frame of a scan). `corners: 'own'`: each corner flies in from its own side and the label pops beside the target, fired on the frame something stops (stream-brake `brake: 'overshoot'` exports that frame). **Not for**: more than two locks a film, or twice on the same target (it reads as a military template); a frozen frame to annotate (use `time-freeze`).
- **Intent**: "This one" without stopping the picture: a targeting frame catches one region in motion with a felt click, so the eye goes straight there.
- **Content**: The target's rect on the running scene and an optional label (≤ 16 chars, Chinese ≤ 6 characters); a stopping list can fire it on its stop frame.
- **Parameters**: `from` (the scene, default the grid), `rect` (the target, default `gridRect(1)`), `pad` 16, `arm` 58 px (corner arm), `thick` 5 px, `radius` 22, `fly` [1100, 620] (start offset of the frame), `scale0` 2.2 (start scale), `grow` 0 (px the corners start outside the target when not flying), `label` { `text` (default the second sample card title), `code` "02" } or null, `corners` 'frame' ('own': each corner from its own side). Roles read: `accent` (corners, crosshair, label dot), `paper` (corner underlay, lock light), `ground` mixed with black (veil), `ink` (label pill), `ground` (label text).
- **Theory**: Capture in motion, the targeting reticle of fictional interfaces: the frame says "this one" without stopping the picture; the overshoot and bite give the lock a felt moment (anticipation and settle), and attention follows the one region outlined and lit (Posner 1980).
- **Styles**: any; avoid ink and halftone (a precise HUD frame on hand-drawn paper).
- **Length and easing**: 3 beats (45 frames at 120 BPM), 2–3. Fly 0–10 cubic out; shrink from 6 `swift` to 0.94 by 26, out to 1 by 32, bite on 32; label 34–44 back-out. `corners: 'own'`: 2 beats; corners from ±620 / ±320 px over 0–9 with back-out 2.4, lock light from 9, label 13–21 from 0.6 with back-out 2.6.
- **Sound**: `accent` on the lock (frame 32), nothing on the fly.
- **Source**: adapted from video-shotcraft `demos/effects/fui-hud-moves/ReticleLockOn.tsx` (card `references/shots/effects/fui-hud-moves.md`) @ `1266a3e`; the `corners` variant from `demos/data/scroll-brake-moves/BrakeReticleLock.tsx`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the label goes through `lang.js`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the dashboard, brand and demo copy are the scene's; the slow camera push is the style's, so compare reads the corner positions without it. Compare against `reticle-lock-on`: pass, track 0 px, events 0.
- **Don't**: add the label code as a decorative counter (01 / 02 numerals that count nothing are an AI tell); one lock a beat, never a swarm of reticles.
- **Pitfalls**: At most twice a film, on different targets; repeated it reads as a military template. Give the bite a mechanical click; a game UI sound cheapens it. Stopping-list variant: the corners must fly on the very frame the list stops, or it reads as two moves.
