---
id: session-queue
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### session-queue

- **Purpose**: Show agents waiting on one person, and the person being pulled between them.
- **Intent**: Reverse the viewer's belief: the agents pull the person.
- **Content**: Four windows with logs, a waiting line, replies, call times, a label and a figure.
- **Fits**: `problem`, `demo`, `proof`. **Not for**: one agent.
- **Layout and camera**: windows 510 × 290 at (470, 212), (1006, 212), (470, 536), (1006, 536); nine 18 px lamps a window; the stamp's home (250, 752); the label at (470, 132), the figure at (916, 112) with a brace at y 202; the note at (470, 842); locked camera.
- **Slots**: `chapter`, `titles` (4), `logs`, `wait`, `words`, `calls` [[window, time, fast]], `ghost`, `label`, `figure`, `stamp`, `all`, `tag`, `counter`; `at`, `geo` override.
- **Length**: 16–48 beats (42 in the example, 20.9 s).
- **Steps and events**: windows pop at 0.15 s (0.08 s apart, back.out 1.6); logs 0.5 and 0.85 s; a waiting dot flies into each first lamp at 1.15 s; the guess 3.6 s, struck 4.73 s; each call: the rope 0.9 s before the press (0.62 s fast), drawn 0.3 s, pulled straight (back.out 2.2), the stamp dragged 0.4 s before, presses (0.88×), the lamp turns vermilion, the reply types, the stamp parks; the figure 14.11 s with the brace; all four at 19.95 s.
- **Needs**: props paper-term, seal-stamp, paper-frame; roles ground, panel, paper, ink, dim, line, accent, accentDeep, accentRing, ok, lamp, lampS, wait, waitS, sA–sD, dotR, dotY, dotG, shadow, chapInk, chapRule.
- **Sound**: `hit` (the stamp) on every press; `tick` as the windows pop; `accent` on the figure; `land` when all four pull.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (the source film 33.0–53.9 s; skills/teach-video/assets/kits/terminal-ledger/starter/components/sessions.js, stamp.js, hand.js`), split from teach-video's terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: The stamp parks beside the lamp row, never on the log text.
