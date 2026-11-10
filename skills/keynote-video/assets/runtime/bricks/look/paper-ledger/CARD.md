---
id: paper-ledger
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### paper-ledger

- **Looks like**: warm paper (#f6f1e7) and dark ink (#2b2824); light terminal windows (3 px ink frame, radius 12, hard 8/9 px shadow at 14 % ink, three dots); a ruled ledger page (blue rules, a red margin) whose items are small hand-drawn dots; one colour per meaning (vermilion the person, teal the machine, yellow waiting or routine, green what passes, grey dashed what is void); the chapter label at (56, 28) with a yellow rule; one counter at the top right (112 px, a double rule, units under it); a dashed "illustrative" note wherever data is illustrative.
- **Palette presets**: one, `paper` (Paper and ink). Roles: ground (paper), panel (a window's body), ink, dim, line, accent (vermilion, the person), onAccent; extras by meaning: machine, ok, wait/waitS/waitSoft, lamp/lampS, judge/judgeS, rest/restS, pass/passS, base/baseS (an uncounted dot), sA–sD (session squares), ruling and margin (the ledger), cell/cellOn, pill, chapInk/chapRule, shadow. Measured contrast: ink/ground 13.03, dim/ground 5.21, accent/ground 4.46 (labels ≥ 28 px only), machine/ground 5.18, ok/ground 4.48, judgeS/ground 7.55, waitS/ground 4.19 (large labels only).
- **Type**: zh: LXGW WenKai (one weight) for everything, IBM Plex Mono for terminal logs; en: Source Serif 4 for text and display, IBM Plex Mono for logs. OFL-1.1.
- **Type scale**: zh 28 · 30 · 34 · 42 · 46 · 66 · 112; en 25 · 28 · 30 · 34 · 42 · 46 · 66 · 112 (floor · body · notes · chapter · quote · mid figures · large figures · the counter). Floors: zh 28, en 25 (the kit's was 24).
- **Grid and frame**: 12 columns, margin 56, gutter 24; the presenter reserve [1580, 560, 1880, 860] and the caption band y ≥ 880 empty; rules end at x 1540; the counter right-aligned at 1860.
- **Camera**: locked; no motion blur; things move on paper (rise, pop with back.out, slide, collapse into a card).
- **Texture and light**: none: flat paper; one hard offset shadow under windows.
- **Intent**: Make a count feel like evidence kept by hand: every item a dot on paper, every colour a meaning the narrator names.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (`skills/teach-video/assets/kits/terminal-ledger/starter/tokens.js, style.css`), split from teach-video's terminal-ledger kit. **Licence**: MIT (Filmsmith); fonts OFL-1.1.
- **Languages**: zh full: the kit is Chinese (LXGW WenKai, one weight; logs in IBM Plex Mono); sizes on the kit scale with the floor raised to 28 px. en full: Source Serif 4 for text (WenKai's Latin is a handwriting cut with no bold), IBM Plex Mono for logs, floor 25 px; tabular figures measured on the serif's widest digit; ✓ and › are drawn as strokes in both languages (no glyph a subset may lack).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Vermilion is only the person; keep the reserve and the caption band empty.
