---
id: crop-cuts
category: motion
tier: T1
family: edit-cut
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### crop-cuts

- **Looks**: one picture held, then hard-cut to a tighter crop of itself on the beat, and again; no tween across a cut, only a slow 0.8 % drift inside each step so the still is alive; the last step eases its drift out and holds on the subject, whose ring deepens on that cut. `flash`: each cut is a white flash that decays in 4 frames while the new crop settles from 1.03×; without it, the cut frame and the next darken by 8 %.
- **Tier**: T1. **Family**: edit-cut. **Surface**: canvas.
- **Use**: pointing at one thing inside a busy screen on the beat; a highlight moment (`flash`). **Not for**: two different pictures (that is a cut); slow, quiet passages; morph or thread-like styles that never cut.
- **Intent**: "Look here, closer, this one": hard cuts to ever tighter crops force the eye onto one thing; with flashes it becomes the film's loudest drumbeat.
- **Content**: Wraps one still picture (a screenshot or a scene) and the subject's rect inside it; 2–3 crops; the picture must stay sharp at about 2.6×.
- **Parameters**: `from` (the picture's painter), `crops` `[[cx, cy, zoom], …]` (film px; the first is the full frame; each step at least 1.5× the last or it reads as a shake), `every` 2 beats between cuts, `settle` 1 beat (the last step's drift), `drift` 0.008, `ring` [x, y, w, h] or null (the subject, film px), `flash` false, `pulse` 0.08, `bpm` 120 (the flash and pulse last frames, not beats). Roles read: `ground` (behind a crop), `accent` (the ring), `paper` (the flash).
- **Theory**: the jump cut along the framing axis keeps the eye on the subject while the cut marks the beat (Reisz & Millar, The Technique of Film Editing); a flash per cut is the press photographer's gesture, a frame "taken".
- **Styles**: any style that cuts; avoid thread, morph, strip, scroll (no cuts inside them).
- **Length and easing**: `(crops − 1) × every + settle` beats, default 5; drift `smooth` inside a step, `out` in the last; no motion blur (never averages two crops across a cut).
- **Sound**: `accent` (a tick or a shutter) on each cut, on the beat; `flash` takes the shutter.
- **Merged from**: `paparazzi-flash` (`flash: true`).
- **Source**: adapted from video-shotcraft `demos/rhythm/rhythm-interrupt-moves/JumpCutPunchIn.tsx` (card `references/shots/rhythm/rhythm-interrupt-moves.md`) and `demos/rhythm/beat-cut-moves/PaparazziFlash.tsx` (card `references/shots/rhythm/beat-cut-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (no text of its own).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: cuts fall on beats; the drift is about each crop's centre (upstream: about the fixed zoom origin); the ring appears from the first cut (upstream: from the start, as the UI's selection) so p = 0 is the scene; no vignette, grain, viewfinder HUD or live flashes before the first cut. Compare: pass (track 13.7 px, from the drift origin; events ±0 frames).
- **Pitfalls**: All crops share the subject's centre; reframing each step makes three shots, not a jump cut. Put every cut on a beat with a click or shutter sound; silent, it reads as the picture glitching. Once per film with flash, and hold long after the last cut; a cross-fade of even 2 frames kills the hard cut.
