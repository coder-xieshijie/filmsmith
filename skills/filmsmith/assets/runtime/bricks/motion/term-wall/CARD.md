---
id: term-wall
category: motion
tier: T1
family: zoom-depth
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### term-wall

- **Looks**: the window's content fades (0.2 s); the window shrinks to 150 × 96 at the first slot (0.1 s + 0.55 s power3.inOut); the first small window appears at 0.6 s; its copies pop in at 0.65 s + 0.03 s each (0.5 s power3.out) in reading order.
- **Tier**: T1. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: in-scene, or the seam from a terminal scene into a count.
- **Intent**: Show scale by multiplication: the one window becomes a wall too big to read.
- **Content**: A terminal and the wall's size.
- **Parameters**: `term` { box, title, line }, `inner` (a painter for what the window held, used by wall-ledger), `geo` { cols, rows, x0, y0, dx, dy, seed }; roles ground, panel, ink, dim, line, shadow.
- **Theory**: object constancy: the wall is visibly made of the same window, so the jump in scale is read, not guessed.
- **Length and easing**: 4 beats; power3 curves.
- **Sound**: `turn` as the copies start.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (`skills/filmsmith/assets/kits/terminal-ledger/starter/components/wall.js fromTerm`), split from terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: The small windows are volume, not content.
