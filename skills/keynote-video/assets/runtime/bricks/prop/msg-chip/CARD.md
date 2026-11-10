---
id: msg-chip
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### msg-chip

- **Structure**: a rounded chip (radius 21, 2.5 px border, 38 px tall, padding 14), text at 24 px → floor in ink; colours by kind: msg yellow, call red, res green, txt grey; parts `border`, `fill`, `text`.
- **States**: `hidden`, `typing` (part of its text), `shown`.
- **Sizes**: S 300 × 60, M 600 × 120, L 900 × 180.
- **Swap points**: `text`, `kind`.
- **Intent**: Make who said what visible at a glance as the message moves.
- **Content**: One short message and its kind.
- **Styles**: made for `blueprint-zoom` (recipe the blueprint-zoom recipe); hosts: teach.
- **Source**: own (`skills/teach-video/assets/kits/blueprint-zoom/starter/components/message.js (.bp-chip), tokens.js`), split from teach-video's blueprint-zoom kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono in windows), floor 25 px; slot limits keep English labels inside the kit's boxes.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's blueprint-zoom kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Four kinds only.
