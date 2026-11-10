---
id: exhibit-sticker
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### exhibit-sticker

- **Structure**: an accent rectangle ≥ 300 × 96, overlapping the mount's lower margin by 12 px; "EX. n" in mono 600 25 and the kind in mono 400 on the first baseline (+41), where · date on the second (+76), inset 20 px, onAccent; parts `label`, `kind`, `where`.
- **States**: `pressing` (1.1×), `pressed` (1), `popped` (1.06, a tail move).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080 (the frame scaled; the sample shows it ×2 on a strip of mount).
- **Swap points**: `ex`, `kind` (≤ 16 chars / 8), `where` (≤ 36 / 24).
- **Intent**: Say what the page is and where it came from, in the language of a case file.
- **Content**: The exhibit number, kind and where · date.
- **Parameters** and **Roles**: `ex`, `kind`, `where`; roles ground, paper, line, accent, onAccent.
- **Styles**: dossier. **Source**: own (the dossier source film). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: "EX. n" becomes 证物 n, Chinese at the 28 px floor in Noto Sans SC.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: It overlaps only the mount's margin, never the page.
