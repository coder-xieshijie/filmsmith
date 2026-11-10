---
id: sketch-paper
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sketch-paper

- **Looks like**: warm paper (#f6f1e7) with one overview diagram: equal-width layer bands (a clean rounded frame at 55 % stroke opacity, a light tint, the name in the left column); only the nodes are hand-drawn (two passes of a rough 2.4 px outline and a 1.3 px hachure at −41°, gap 8, on a light backing); loops are smooth pills that become circles; connectors clean 2.5 px lines with two-stroke arrowheads; messages are small rounded chips; light terminal windows as in paper-ledger; the chapter label top left.
- **Palette presets**: one, `sketch` (Sketch on paper). Roles: ground, panel, ink, dim, line, accent (the person), onAccent; per layer <layer>S/H/B/T for prod (blue), comp (violet), mech (ochre), core (teal), inf (stone), mod (the model, red); messages msgS/msgB (a person, yellow), callS/callB (a tool call, red), resS/resB (a result, green), txtS/txtB (plain text, grey); subBack/subInk (secondary lines). Measured: ink/ground 13.03, dim/ground 5.21, accent/ground 4.46, coreS 5.18, prodS 4.68, compS 5.36, mechS 3.83, modS 5.56, ink on msgB 12.9, on callB 11.73, subInk/subBack 8.64.
- **Type**: zh LXGW WenKai throughout (the kit); en Source Serif 4, IBM Plex Mono in windows. OFL-1.1.
- **Type scale**: node titles 36 (28 in outer layers), layer names 30, body 28, secondary 26, chips 24 → floor; floors zh 28, en 25.
- **Grid and frame**: bands x 60–1540, cells x 320–1516, rows 14 px apart from y 100; the side part (the model) at x 1600, 240 wide; the presenter reserve and the caption band (y ≥ 880) empty.
- **Camera**: locked; the zoom moves the diagram (layer-zoom), not the camera; no motion blur.
- **Texture and light**: none; hachure is the only texture.
- **Intent**: Let the viewer keep the whole system in view while one part is explained.
- **Styles**: made for `blueprint-zoom` (recipe the blueprint-zoom recipe); hosts: teach.
- **Source**: own (`skills/teach-video/assets/kits/blueprint-zoom/starter/tokens.js, style.css`), split from teach-video's blueprint-zoom kit. **Licence**: MIT (Filmsmith); fonts OFL-1.1.
- **Languages**: zh full: LXGW WenKai as in the kit, floor 28 px (the kit's 24 px secondary lines and chips are raised). en full: Source Serif 4, IBM Plex Mono in windows, floor 25 px; boxes keep the kit's sizes and long English labels are kept short by the slot limits.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's blueprint-zoom kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Only nodes are rough; ochre is for names and outlines only.
