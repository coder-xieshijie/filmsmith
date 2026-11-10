---
id: layer-overview
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### layer-overview

- **Purpose**: Draw the whole system as a map of layers.
- **Intent**: Give the viewer the whole map first, so every detail later has a place on it.
- **Content**: 3–6 layers with parts, the focus layer, a side part, a note.
- **Fits**: `hook`, `problem`, `claim`. **Not for**: flows over time.
- **Layout and camera**: bands x 60–1540 from y 100, 14 px apart (88 tall, 104 with a two-line note, the focus 184); cells x 320–1516 equally wide; the side part at x 1600 (240 × 92) beside the focus with a two-headed link; the note right-aligned at 1860, y 40; locked camera.
- **Slots**: `chapter`, `rows` [{ c, name, sub, cells [title | { title, sub, loop }] }], `focus`, `side` { title, sub }, `from` (the side part's box before), `tag`; `at`, `geo` override.
- **Length**: 8–32 beats (15 in the example, 7.1 s).
- **Steps and events**: the side part glides from `from` (0.95 s power2.inOut); the focus band at 0.37 s (frame 0.5 s, tint, name, note), its parts 0.15 s later, 0.1 s apart (outline, hachure, label); the link 1.0 s; the chapter 1.42 s; the other layers from 2.44 s bottom up (0.02, 0.5, 0.95, 1.4 s), parts 0.06 s apart; the note 4.04 s.
- **Needs**: props sketch-node, paper-frame; roles ground, panel, ink, dim, line, faint, subBack, subInk, chapInk, chapRule and the layers' S/H/B/T.
- **Sound**: `accent` as the focus layer draws; `tick` as the others start.
- **Styles**: made for `blueprint-zoom` (recipe the blueprint-zoom recipe); hosts: teach.
- **Source**: own (the source film 4.84–11.97 s; skills/teach-video/assets/kits/blueprint-zoom/starter/components/overview.js, band.js, node.js, loop.js, line.js`), split from teach-video's blueprint-zoom kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono in windows), floor 25 px; slot limits keep English labels inside the kit's boxes.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's blueprint-zoom kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Say whose layering it is; build the focus layer first.
