---
id: worksheet-carry
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### worksheet-carry

- **Purpose**: Open the worksheet and carry the figure to it.
- **Intent**: Show the arithmetic in the open: the figure is taken from the page itself, so the result can be checked.
- **Content**: The printed figure's box and ink box, its text, a title (≤ 16 chars) and 1–5 rows of label and value.
- **Fits**: `turn`, `demo`, `proof`. **Not for**: figures to restate only; a second carry in one film.
- **Layout and camera**: the frame of the template: the source file and the page in hand at y 54 (mono 25), the claim on the mat at baseline 186 (serif 600 50), its terms at 234 (mono 25), the reading position from y 292 at x 96, the sheet up to 1728 wide (1112 beside a worksheet) and down to y 1026, the worksheet at x 1240 (584 wide); a locked camera; the exhibit as a spread (1112 wide), the seam at x 1240, the slip landing at (1280, 404), rows every 64 px.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `worksheet` | object { title, rows [[label, value]], carry { region, ink, text } } | primary / glance | 1 | title 16 chars, rows 1–5 | title 7 chars | Lead over B · 领先多少, three rows, the placeholder's 71.4 |
  | `exhibit` | object | optional | 1 | – | – | placeholder table as a spread |

  Options: `prior` ({ claim, terms } staying on the mat), `slug`, `prevPage`.
- **Length**: 4–12 beats (8 in the example).
- **Steps and events**: runtime split-open (a drawer in a pane, 1.5 beats; the seam in ink with a paper key, T1); the tab pressed on 1.5; the slip lifts on beat 1 (pixels, 1.2×, 18 px up), is set in code on 1.5, rises to the corridor (y 254), crosses and drops onto the worksheet by beat 3 (the key); the title rises on 3.5, rows on 4, 4.5, 5 (2 and on without a carry); a long hold presses the slip again.
- **Needs**: motions split-open (runtime); props ruled-worksheet, mounted-sheet, file-slug (inside the kit); roles ground (the mat), ink and dim (claim and terms on it), paper, onPaper, paperMuted, line (stack edges), accent, onAccent; type display, text, mono, sans. `exhibit` (object, optional): the capture and where its claim is printed, shared by the scenes of one sheet (kit.js exhibitSpec): `src`, `size`, `crop` [x, y, w, h], `band` [x, y, w, h], `under`, `leader` (down | left | right | false), `ex`, `of`, `kind`, `where`, `spread`, `scale`; without it the placeholder table.
- **Sound**: `turn`/split-open: a blade tick and a slide; `tick` on the tab; `accent` as the slip lifts; `land` as it is laid down.
- **Styles**: made for `dossier` (recipe the dossier recipe).
- **Source**: own (the dossier source film planOf worksheet; film.js buildWorksheet, paintWorksheet, buildSlip, slipAt, paintSlip, openParams`, the dossier template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: claims, titles and rows in Noto Serif SC (600 for claims and titles, 400 for rows) at the same sizes; a line rises character by character at a third of the English stagger (0.04 s), so it lands in about the time an English line does; mono labels at the 28 px floor with Noto Sans SC for Chinese; the capture stays in its own language; "EX. n" becomes 证物 n.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the dossier style (the template's example film the dossier source film, a model release on its published pages), so the compare is waived. Checked instead side by side with the example film at the same moments: the dossier recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the page a parameter (`exhibit`: src, size, crop, band, under, leader, ex, of, kind, where, spread; without it a placeholder published table drawn in code), what stood on the mat before passed as `prior` and `leaving`; the split-open hand-off is called directly (its pane mode) as the template does; the slip is the template's own (runtime value-carry is not used).
- **Pitfalls**: One carry a film; the slip never scales past 1.2× the sheet's scale while it is the page's pixels. The title shares its line with the tab: keep it short.
