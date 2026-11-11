---
id: ruled-worksheet
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### ruled-worksheet

- **Structure**: 584 px wide (≥ 600 tall), paper with the tooth, ruled every 64 px from 93 at 7 % ink, stack edges; the title (serif 600 50) at +78 with the tab (accent, mono 600) at the right; the slip slot at +112; rows (serif 400 40, values mono 400 40 right-aligned) every 64 px; a 2 px rule; the result (serif 600 125) and caption (serif 400 40); the stroke over the result; parts `card`, `ruling`, `title`, `tab`, `rows`, `rule`, `figure`, `caption`, `stroke`.
- **States**: `titled`, `rows`, `result`.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080 (the frame scaled).
- **Swap points**: `title`, `rows`, `value`, `caption`.
- **Intent**: Show the arithmetic, so the result can be checked.
- **Content**: A title, 1–5 rows, a value and caption.
- **Parameters** and **Roles**: `title`, `rows`, `value`, `caption`, `ex`; roles ground, paper, onPaper, line, accent, onAccent.
- **Styles**: dossier. **Source**: own (the dossier source film). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: Noto Serif SC for the title and labels; values stay mono.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Values derived by reading a chart are marked ~ and listed in the film's notes.
