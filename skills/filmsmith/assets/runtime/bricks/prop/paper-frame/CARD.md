---
id: paper-frame
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### paper-frame

- **Structure**: chapter label at (56, 28), 34 px, a 4 px yellow rule under it as wide as the text + 12 (it stretches on a swap); the counter right-aligned at 1860, top 28, 112 px tabular figures, a double rule 300 wide, units under it (30 px), an "about" prefix (44 px) when approximate; the "sorted by" label at (120, 104); the dashed note (24 px → floor) anywhere; parts `chapter`, `rule`, `counter`, `units`, `approx`, `how`, `tag`.
- **States**: `empty`, `chapter`, `counted`, `approx`.
- **Sizes**: S 1200 × 675, M and L 1920 × 1080 (the frame of a film).
- **Swap points**: `chapter`, `how`, `counter` { value, unit }, `tag`.
- **Intent**: Keep the viewer oriented: which chapter, how many so far, how sorted, and that the data is illustrative.
- **Content**: A chapter title, a counter value with its unit, a "sorted by" line and a note.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (`skills/filmsmith/assets/kits/terminal-ledger/starter/components/chapter.js, counter.js, labels.js`), split from terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: One counter a frame; every illustrative number gets the dashed note.
