---
id: sketch-node
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sketch-node

- **Structure**: a light backing (radius 4), two bowed, jittered passes of a 2.4 px outline (roughness 1.05, bowing 0.9), a 1.3 px hachure at −41°, gap 8; the title (36 px) and an optional secondary line (26 px → floor) on a light backing, centred; a loop: a smooth pill (a circle when enlarged) with the hachure clipped to it; parts `backing`, `rough outline`, `hachure`, `title`, `secondary line`, `secondary backing`, `loop pill / circle`.
- **States**: `hidden`, `outlined`, `drawn`, `pulsed` (1.05), `circle` (a loop enlarged), `stopped` (grey outline, faint hachure).
- **Sizes**: S 382 × 144 (the kit's detail node), M 600 × 226, L 900 × 340.
- **Swap points**: `title`, `sub`, `c` (layer), `shape` (rect | loop), `seed`.
- **Intent**: Make each part feel drawn for the viewer, distinct from the clean structure.
- **Content**: A title, an optional secondary line, the layer, a seed.
- **Styles**: made for `blueprint-zoom` (recipe the blueprint-zoom recipe); hosts: teach.
- **Source**: own (`skills/teach-video/assets/kits/blueprint-zoom/starter/components/node.js, loop.js`), split from teach-video's blueprint-zoom kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono in windows), floor 25 px; slot limits keep English labels inside the kit's boxes.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's blueprint-zoom kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Give every node its own seed; a loop is never a rough circle.
