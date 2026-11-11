---
id: layer-zoom
category: motion
tier: T2
family: zoom-depth
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### layer-zoom

- **Looks**: other layers scale 1 → 1.55 about the diagram's centre and fade (above over the first 60 %, below over 0.3 s); the focus frame moves to the detail box, its tint to 60 %, its note out; its parts move to their detail boxes; a loop's pill turns into a circle.
- **Tier**: T2. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: seam into a detail scene, or in-scene (detail-walk).
- **Intent**: Keep the viewer sure which overview cell became which detail part.
- **Content**: An overview with a focus layer and the detail layout.
- **Parameters**: `rows`, `focus`, `detail` { band, cells }; roles ground, ink, dim, line, subBack, subInk and the layers' S/H/B/T.
- **Theory**: object constancy: the diagram moves, the camera does not, so every part stays continuous.
- **Length and easing**: 2.6 beats (1.3 s), power2.inOut.
- **Sound**: device `layer-zoom`: a whoosh led by 0.35 s.
- **Styles**: made for `blueprint-zoom` (recipe the blueprint-zoom recipe); hosts: teach.
- **Source**: own (`skills/filmsmith/assets/kits/blueprint-zoom/starter/components/zoom.js; the source film 12.65 s, 38.04 s`), split from blueprint-zoom kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono in windows), floor 25 px; slot limits keep English labels inside the kit's boxes.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from blueprint-zoom kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Keep the left-to-right order; the layers below fade at once.
