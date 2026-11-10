---
id: afterglow
category: look
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### afterglow

- **Looks like**: a dark section lit by its own light: near-black indigo grounds with soft orbs of light drifting behind the content, an aurora that rises from the foot of the frame, or (in the warm light preset) concentric rings breathing round the subject. Like a night product page whose only decoration is the light the product gives off.
- **Fits / does not fit**: one dark section of a calm product film (an ambient opening, the turn of `ground-flip`, a product shown as a source of light) / films that are dark all through (the light stops meaning anything), paper and print styles, loud styles where the orbs would compete with hits.
- **Palette presets**:

  | id | ground | panel | ink | dim | line | accent | contrast (ink, dim, accent on ground) | accent means |
  |---|---|---|---|---|---|---|---|---|
  | afterglow-night | #0A0C14 | #141826 | #EEF0F6 | #8C93A6 | #262B3B | #7A86FF | 17.13, 6.36, 6.21 | the light: where the product is attending |
  | afterglow-dawn | #EFE7DA | #FBF7F0 | #231F1A | #756B5E | #D8CCBA | #3E55E0 | 13.34, 4.26, 4.78 | the light: where the product is attending |

  `paper` is #F4F1EA (night) and #FFFFFF (dawn): the bloom's fringe and the rings' rims.
- **Type**: `display`, `text` Inter Tight; `mono` JetBrains Mono; Chinese stacks put Noto Sans SC after the Latin family (all OFL). Chinese is subset to the characters used (`tools/lib/fonts.mjs`, pyftsubset).
- **Type scale**: en 25, 34, 47, 64, 88, 120, 164, 225; zh 28, 36, 48, 64, 88, 120, 164. Floors: info en 25, zh 28; main 40.
- **Tracking, case, italic, leading**: en display −0.03 em, labels +0.12 em in capitals, no italic, leading 1.1; zh no negative tracking (labels +0.04 em), no capitals, no italic, leading 1.3.
- **Grid and frame**: 12 columns, margin 120, gutter 24, baseline 8, safe area 96 × 54; no persistent elements.
- **Camera**: habit `drift` (slow, under the ambient limits); zoom cap 1.1; shutter 0.5; curves `snappy` in, `smooth` moves, `exit` out.
- **Texture and light**: grain 0.06; glow on `accent`, radius 90; vignette 0.35 (`ground` mixed with black); one light per section, `light` one of: `orbs` (default, night: three orbs in the accent and two mixes of it with `line` and `paper`, screened, drifting on two sines each and converging to a stop at the end of a section; `surge` brightens one when something arrives), `bloom` (an aurora of soft ellipses in the accent with `paper` tints, rising from the foot; `ground-flip` presses it into an afterglow), `rings` (dawn: four concentric rings stepping from `ground` to `panel`, `paper` rims, breathing ±6 % out of phase). The painters are pure functions in `texture.js` (`orbs`, `bloom`, `bloomBox`, `rings`, `vignette`, `tide`) that bricks and scenes call with this look's roles.
- **Source**: idea and texture parameters adapted from video-shotcraft `demos/effects/glow-flyline-moves/GlowOrbAmbient.tsx`, `demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip.tsx` and `demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx` @ `1266a3e` (teal, blue, coral, purple, orange and sand replaced by roles; the bloom's 60 px blur by soft gradients; brand and content removed). **Licence**: Apache-2.0, see NOTICE; fonts Inter Tight (OFL-1.1), JetBrains Mono (OFL-1.1), Noto Sans SC (OFL-1.1). **Sample**: `bloom` in the `ground-flip` samples; stills of `orbs` and `rings` not rendered yet (`sample.mjs` renders motions only).
- **Don't**: run two lights in one section, or give the orbs a second hue: neon gradient glows (violet to cyan) on black are a known AI tell (`ai-tells.md`); the light is the accent, and it moves under the ambient limits.
- **Sample**: `poster.jpg`, an English still 480 px wide.
