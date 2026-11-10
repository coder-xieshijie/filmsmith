---
id: ruled-ledger
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### ruled-ledger

- **Structure**: a paper page with blue rules every 46 px and a red margin, a frame and a title when it is a card; dots packed in a heap (the kit's phyllotaxis pile, seeded); parts `page`, `rules`, `margin`, `frame`, `title`, `dots`.
- **States**: `card` (small, at [1190, 196] × 0.28), `full`, `plain` (rules gone).
- **Sizes**: S 960 × 540, M and L 1920 × 1080.
- **Swap points**: `title`, `n`, `heap`, `card`.
- **Intent**: Let the viewer see the count as a heap of real items, the same heap that will be sorted into the answer.
- **Content**: A title and a number of dots.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (`skills/teach-video/assets/kits/terminal-ledger/starter/components/ledger.js, marks.js`), split from teach-video's terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: The dots are illustrative positions; say so with the dashed note.
