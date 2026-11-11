---
id: wall-ledger
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### wall-ledger

- **Purpose**: Read the work and count what matters onto a ledger.
- **Intent**: Show where the number comes from: a machine read every item and each one became a dot.
- **Content**: A wall caption, a reader label, a ledger title, a unit, a legend, a number of dots.
- **Fits**: `problem`, `demo`. **Not for**: small counts.
- **Layout and camera**: a 6 × 4 wall of 150 × 96 windows from (130, 200), 172 × 118 apart; the caption at (130, 678); the ledger card at [1190, 196] × 0.28; the rail from (140, 178) to the card; the legend at (1190, 534); locked camera.
- **Slots**: `chapter`, `term` { box, title, line, count (term-count's params: the window fades out with the counts it holds) }, `wall` { label }, `reader` { label }, `ledger` { title }, `counter` { unit }, `legend` (0–2), `dots`; `at`, `geo` override. Exports `wallPlan` and `drawCollapse` (pile-split draws the collapse tail).
- **Length**: 8–24 beats (13 in the example, 6.1 s).
- **Steps and events**: term-wall from 0; the reader 0.37 s, walks 1.21–2.44 s ticking each window; the card 2.75 s; the rail 2.85 s; 21 marks pop at 2.9 s and run from 3.25 s (0.045 s apart, 0.7 s each); each pours its dots (0.34 s power3.out); the counter counts landed dots and hops at 5.3 s; the wall collapses into the card's entrance at 5.9 s.
- **Needs**: motion term-wall; props ruled-ledger, paper-frame; roles ground, panel, ink, dim, line, machine, base, baseS, ruling, margin, chapInk, chapRule.
- **Sound**: `turn` as the wall forms and the rail draws; `land` on the counter's hop.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (the source film 9.7–15.8 s; skills/filmsmith/assets/kits/terminal-ledger/starter/components/wall.js, ledger.js, counter.js`), split from terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: The counter counts the dots that have landed.
