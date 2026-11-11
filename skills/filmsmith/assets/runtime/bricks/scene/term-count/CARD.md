---
id: term-count
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### term-count

- **Purpose**: Ask a plain question in a terminal and answer it with one or two counts.
- **Intent**: Hook the viewer with a plain question and a number big enough to need explaining.
- **Content**: A question, up to three source pills, one or two counts, a note.
- **Fits**: `hook`, `problem`. **Not for**: answers that are not counts.
- **Layout and camera**: the window at [360, 130, 1200, 590] (140 tall, 215 with pills, 590 when it grows); the first count at (36, 256) inside it, 80 px, with a 103 × 14 field of 7 px cells at (36, 418); the second at (640, 256) with "nearly" (48 px) before it and a 500 × 12 bar at (640, 352); the note at (360, 752); locked camera.
- **Slots**: `chapter`, `title`, `question` (primary), `chips` { label, items ≤ 3 }, `stats` [{ label, value, note, pre, show: grid | bar }] (1–2), `tag`; `at` overrides the times (seconds).
- **Length**: 10–40 beats (20 in the example, 9.7 s): until the question is read and both counts have landed and held.
- **Steps and events**: chapter 0.25 s; the window rises 0.12 s (0.6 s power3.out); typing from 0.5 s; pills from 2.15 s every 0.6 s (back.out 1.6); the window grows at 3.95 s; counts roll 4.85–6.1 s and 7.12–8.3 s (sine) and hop 1.07×.
- **Needs**: props paper-term, paper-frame; roles ground, panel, ink, dim, line, pill, cell, cellOn, grey, chapInk, chapRule; type text, mono.
- **Sound**: `tick` on each pill and each landed count.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (the source film 0–9.7 s; skills/filmsmith/assets/kits/terminal-ledger/starter/components/term.js, grid.js, counter.js`), split from terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: The question must be readable while it types; one cell is one item.
