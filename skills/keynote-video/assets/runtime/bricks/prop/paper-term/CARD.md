---
id: paper-term
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### paper-term

- **Structure**: a white body in a 3 px ink frame (radius 12) with a hard 8/9 px shadow, a 40 px title bar with three dots, an optional identity square, a title and a right note; the line typed after a stroke-drawn › behind a 4 px caret (40 px); a log at 34 px a line that scrolls, keeping three; parts `frame`, `shadow`, `title bar`, `dots`, `identity square`, `title`, `right note`, `prompt`, `typed line`, `caret`, `log`.
- **States**: `closed`, `open` (risen 24 px, shown), `typed`, `logged` (grown to full height).
- **Sizes**: S 600 × 295, M 1200 × 590, L 1500 × 738 (the 1200 × 590 layout scaled).
- **Swap points**: `title`, `right`, `line`, `log` [{ text, cls: "" | ok | me | stop }].
- **Intent**: Show that a machine was asked and answered, in a window light enough to sit on the paper.
- **Content**: A title, one typed line, up to six log lines.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (`skills/teach-video/assets/kits/terminal-ledger/starter/components/term.js, style.css (.term, .q, .ln, .caret)`), split from teach-video's terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Grey is the machine, green a pass, vermilion only what a person types.
