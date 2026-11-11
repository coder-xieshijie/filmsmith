---
id: glitch-tear
category: motion
tier: T1
family: edit-cut
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### glitch-tear

- **Looks**: two thin bands tremble ±12 px for two ticks (the precursor); a beat later the whole frame tears into 16 uneven horizontal bands (the narrowest about a third of the widest) that jump sideways every tick, up to ±70 px. About a fifth of the bands stay still, a third swing at full width and the rest only tremble, so every band stays whole and the picture reads as a signal jump, not a broken page. Moving bands carry a two-colour ghost of their own content (±12 px, screened), a lit top edge and a dark bottom lip; two scan lines jump with them. At the strongest jitter the scene underneath is cut hard to the next one, with a one-tick exposure kick (1.28) and a 1.6 % zoom kick; the bands then decay to rest in five ticks.
- **Tier**: T1. **Family**: edit-cut. **Surface**: canvas.
- **Use**: a state jump of the same screen (deploying → live, before → after, off → on); two scenes on one grid. **Not for**: calm or warm films; two unrelated scenes (it then reads as a broken page); more than once a minute.
- **Intent**: The system switches state in one jolt: the page tears into bands but stays whole, so the viewer reads a digital jump, not a broken screen.
- **Content**: Wraps two scenes of the same screen on one grid (before and after a state change); no text of its own; the scenes need an opaque ground.
- **Parameters**: `from`, `to` (painters, full frame), `bands` 16, `amp` 70 (largest band offset, px; the precursor scales with it), `ghost` 12 (ghost offset, px), `ticks` 32 (jitter steps over the brick; the timeline is in ticks), `scan` true, `exposure` 1.28 (brightness at the cut tick). Roles read: `ground` (ghost extraction, the bottom lip), `ink` and `accent` (the ghost tints are the accent and an accent–ink mix; the lit edge is ink mixed with white).
- **Theory**: a cut hidden inside large motion is not seen as a cut (edit blindness during transients, Smith & Henderson 2008); the precursor tremor makes the jump expected (anticipation); bands that stay whole keep the content legible, so the meaning is "the system switched state".
- **Styles**: any technical style; avoid paper and letterpress, whose material cannot glitch.
- **Length and easing**: 2.125 beats (32 ticks; one tick per frame at 120 BPM, 30 fps), 2–3. Precursor ticks 1–2; tear from tick 15, rising in 3 ticks (out-cubic), cut at tick 25, linear decay to rest by tick 30. Jitter is seeded per tick and band: the same tick always gives the same picture.
- **Sound**: a short digital `hit` at the cut; a crackle bed under the tear if the sound look has one.
- **Merged from**: none (batch 3's `glitch-cycle` and `misregistration-hit` are to fold in as variants).
- **Source**: adapted from video-shotcraft `demos/transition/tear-streak-transitions/GlitchDisplace.tsx` (card `references/shots/transition/tear-streak-transitions.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: any two painters instead of the release console; the ghost is the scene's own difference from the ground, tinted, instead of the page re-rendered in two tints; the bands decay to rest in 5 ticks instead of 6 (the upstream snaps from one sixth at its last frame; here the brick ends settled); no slow push-in, vignette or grain (the film's camera and look own them). Compare (from the grid scene, whose density is closest): pass (track 8.4 px, events ±1 frame, SSIM drop 0.058).
- **Pitfalls**: Bands only, never blocks: once the page breaks into tiles it reads as destroyed. The cut must hide in the strongest jitter; a cut on a still frame loses the cover. High-energy seam: keep it away from other loud transitions (whip, crash) or they cancel out.
