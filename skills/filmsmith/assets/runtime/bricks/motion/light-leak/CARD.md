---
id: light-leak
category: motion
tier: T1
family: edit-cut
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### light-leak

- **Looks**: a soft film light leak builds from one corner (a gate band along two edges and three stacked glows in the accent, mixed towards white at the core), the scene burns brighter and flatter under it, and at the peak a white-hot core covers most of the frame. The cut hides in that peak; the light then drains away along the diagonal over the next scene, which settles from 1.04 to 1 as it clears.
- **Tier**: T1. **Family**: edit-cut. **Surface**: canvas.
- **Use**: a warm, nostalgic cut; time passing between two moments; an opening into a memory or a recap. **Not for**: fast cuts (the build alone is a beat and a half); terminal or cold styles where warm light reads as a fault; a cut that should be noticed (use `whiteout-slam`).
- **Intent**: A warm, invisible cut: the eye is blinded by a sweep of film light and when it clears the scene has changed, which reads as time passing.
- **Content**: Wraps two scenes (before and after a change of time or mood) and the corner the light comes from; no text of its own.
- **Parameters**: `from`, `to` (the two scenes' painters, full frame), `corner` `'top-right'` (default), `'top-left'`, `'bottom-right'`, `'bottom-left'` (where the leak comes in; it leaves by the opposite one), `burn` 0.85 (brightness added at the peak), `settle` 0.04 (the next scene's scale before it settles). Roles read: `accent` (the leak is the accent mixed with white and black).
- **Theory**: a cut at the brightest frame is masked by the luminance transient: the eye cannot compare the two pictures through it. A slow ease-in build and a long ease-out tail read as warmth and time passing rather than a flash.
- **Styles**: warm and editorial styles, film and photo looks, light or dark grounds; avoid terminal and blueprint.
- **Length and easing**: 4.75 beats (71 frames at 120 BPM, 30 fps), 3–6. Intensity rises as u² to the peak at 28/71 and falls with an ease-out; the sweep follows 1 − (1 − u)^1.2 and comes to rest with matched speed after 0.85; a two-frame screen lift at the cut.
- **Sound**: a soft swell into the peak, no hit at the cut.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/transition/transition-hidden-cut/LightLeakBurn.tsx` (card `references/shots/transition/transition-hidden-cut.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: colours by role instead of the amber, ember and ochre literals; any corner; the viewfinder, the two photos, the vignette, grain and the outgoing scene's push-in are left to the film; the sweep stops with matched speed (the upstream's light is still moving, invisibly, on its last frame), so the brick lands still. Compare (frames 25–84 of the leak window): pass (leak core track and events match, SSIM drop 0.003).
- **Pitfalls**: Once per film, and it counts as the film's light-hidden cut: do not also use a white flash cut. The light serves the cut, not decoration; check it at normal speed before keeping it.
