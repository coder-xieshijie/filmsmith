---
id: detail-walk
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### detail-walk

- **Purpose**: Zoom into one layer and walk one task through it round by round.
- **Intent**: Make a mechanism concrete by following one real task through it until it stops.
- **Content**: The overview, the detail layout, a typed request, message steps, rounds, a repository window, a stop line, a note.
- **Fits**: `demo`, `proof`. **Not for**: static structure.
- **Layout and camera**: the detail frame [50, 270, 1500, 430]; parts at [90, 400, 382, 144], the loop circle [675, 347, 250, 250], [1128, 400, 382, 144]; the side part at [1189, 96, 260, 96]; the terminal [575, 96, 450, 150], the repository [81, 716, 400, 148] (wider for long English code); round labels centred at (800, 483); the stop at y 650, its note at (575, 716); the note at (1050, 812); locked camera.
- **Slots**: `overview`, `chapter`, `term` { title, line, done }, `steps` [{ text, kind, path: term | up | down, t0, t1 | emit [at, go, arrive], typeTo, pulse }], `rounds`, `repo` { title, file, code [before, wrong, right, after], changed, tests, status [[text, colour, at]] }, `stop` [text, word], `note`, `tag`, `mapTag` (the overview's note, kept top right), `back`, `take`, `judge`, `check`; `rows`, `focus`, `side` as layer-overview; `at`, `detail` override.
- **Length**: 16–80 beats (the example 31.4 s with the return).
- **Steps and events**: layer-zoom at 0.69 s (1.3 s); lines 2.04 s; pulses on the parts as named; the terminal 4.22 s, typing 4.69–6.24 s; round 1 at 7.0 s (an orbit 0.6 s), the request hops to the loop and up to the model; the model writes edit(…) where it waits (11.25 s) and it travels down; the repository 13.87 s, the edit 15.38 s; round 2 at 18.84 s, round 3 at 21.89 s; the stop greys the loop from 23.26 s, stated at 23.86 s; the return at 26.07 s (1.3 s), the line to remember 28.78 s, the check 30.38 s.
- **Needs**: motions layer-zoom, msg-hop; props sketch-node, msg-chip, paper-term; roles as listed in the code.
- **Sound**: `turn` on the zoom and the return; `tick` as each round's orbit closes, on the stop and on the check.
- **Styles**: made for `blueprint-zoom` (recipe the blueprint-zoom recipe); hosts: teach.
- **Source**: own (the source film 11.97–43.4 s; skills/filmsmith/assets/kits/blueprint-zoom/starter/components/zoom.js, loop.js, message.js, line.js, term.js, status.js`), split from blueprint-zoom kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono in windows), floor 25 px; slot limits keep English labels inside the kit's boxes.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from blueprint-zoom kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Text the model writes types out where it waits; a stop is shown on the loop itself.
