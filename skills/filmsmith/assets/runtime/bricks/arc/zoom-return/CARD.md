---
id: zoom-return
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### zoom-return

- **Tells**: a question the viewer cannot answer yet → the whole system as one diagram of layers → zoom into one layer → one task walked through it round by round until it stops → back to the map, the part marked as covered, one line to remember → the next part named.
- **Intent**: Teach one part without losing the whole.
- **Fits / does not fit**: narrated explainers of 30–90 s, one part an episode. Not: arguments from counts.
- **Slots**: hook 3–6 s (the opening question; no brick: the recipe's opening) · problem 6–10 s layer-overview · turn 1–2 s layer-zoom · demo 10–30 s × 1–2 detail-walk · climax 2–5 s the stop (peak) · claim 4–8 s the return and the line to remember (peak) · lockup 3–8 s the next part; 30–90 s, 2–3 peaks; the bed narration-pad.
- **Role mapping**: question → hook, map → problem, zoom → turn, mechanism → demo, the stop → climax, recap → claim, next part → lockup. "Mechanism" and "recap" have no role of their own in SPEC 3.6.
- **Example films**: the blueprint-zoom sample (the source film, 49.1 s): question 0.8–4.2, map 4.2–12, zoom and walk 12–38, return 38–43.4, next part 43.4–49.
- **Styles**: made for `blueprint-zoom` (recipe the blueprint-zoom recipe); hosts: teach.
- **Source**: own (the source film; the source film), split from blueprint-zoom kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono in windows), floor 25 px; slot limits keep English labels inside the kit's boxes.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from blueprint-zoom kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Return to the same map with the part marked.
