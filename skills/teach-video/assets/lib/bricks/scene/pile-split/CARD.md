---
id: pile-split
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### pile-split

- **Purpose**: Sort the heap into the answer and split one share again.
- **Intent**: Let the viewer feel the proportion first, then read the figure, then see the part that still needs a person.
- **Content**: Two groups with shares, counts and chips; the second may split in two.
- **Fits**: `demo`, `proof`, `turn`. **Not for**: more than two groups at the first split.
- **Layout and camera**: the page full screen; piles at (372, 536) and (1090, 512); the share at (228, 262) 66 px with its count at (452, 286); chips at y 726 from x 170 (tilted −2.5°, 1.8°, −1.2°); the re-split piles at (936, 396) and (1272, 664) with the label at (862, 220) 46 px; the note at (120, 814); locked camera.
- **Slots**: `chapter`, `title` (the card's, fading on the push-in), `how`, `tag`, `counter` { value, unit, approx }, `fromWall` { offset, …wall-ledger params } (the wall still collapsing into the card), `groups` [{ count, color, keep, pct, sub, chips, split [{ count, color, label, sub }] }]; `seed`, `at`, `geo` override.
- **Length**: 10–40 beats (24 in the example, 11.6 s).
- **Steps and events**: the card pushes in at 0.12 s (0.8 s power2.inOut); the sort label 0.92 s; the note 1.37 s; dot-sort from 0.85 s and 0.97 s; the share 1.72 s, its count 2.57 s; chips 3.65, 4.32, 5.13 s; the re-split: the judgement dots swell red from 7.62 s and gather from 8.67 s, the rest grey from 8.62 s; the label 9.4 s, its count 9.8 s.
- **Needs**: motion dot-sort; props ruled-ledger, paper-frame; roles ground, paper, ink, dim, line, base, baseS, wait, waitS, waitSoft, judge, judgeS, rest, restS, ruling, margin, chapInk, chapRule.
- **Sound**: `turn` on the push-in; `accent` on each chip and on the label; `tick` as the re-split starts.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (the source film 15.8–27.4 s; skills/teach-video/assets/kits/terminal-ledger/starter/components/ledger.js, labels.js`), split from teach-video's terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Name the rule of the sort before the dots move; the re-split takes from one pile only.
