---
id: exhibit-ledger
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### exhibit-ledger

- **Purpose**: List every claim with its exhibit and source.
- **Intent**: Close the file: the viewer sees every claim again, each tied to its source.
- **Content**: A claim in 1–2 phrases and 2–6 rows (exhibit number, the claim ≤ 36 chars, its source).
- **Fits**: `rest`, `proof`, `claim`. **Not for**: films with one exhibit; more than six claims.
- **Layout and camera**: the frame of the template: the source file and the page in hand at y 54 (mono 25), the claim on the mat at baseline 186 (serif 600 50), its terms at 234 (mono 25), the reading position from y 292 at x 96, the sheet up to 1728 wide (1112 beside a worksheet) and down to y 1026, the worksheet at x 1240 (584 wide); a locked camera; the index card at the reading position, 1728 wide, rows every 92 px, tabs at x 64, text at 200, sources right-aligned.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `claim` | 1–2 phrases | primary | 1–2 | 5 words, 30 chars each | 12 chars each | Every claim, / struck where it was printed. |
  | `rows` | [n, claim, source] | glance | 2–6 | 36 chars | 16 chars | three placeholder rows |

  Options: `leaving` ({ exhibit, worksheet } sliding off), `prior` ({ claim, terms } sinking), `slug`, `prevPage`.
- **Length**: 4–12 beats (7 in the example): rows one a beat from 1.5.
- **Steps and events**: the sheets slide off at 0 (0.35 s); the index is dealt on at 0.5 (expo out, one beat); the phrases rise on 1 and 2; each row on 1.5 + k: its tab pressed (1.1 → 1), its text rising, its source a quarter beat later; a long hold presses the last tab.
- **Needs**: motions sheet-deal; props file-slug (inside the kit); roles ground (the mat), ink and dim (claim and terms on it), paper, onPaper, paperMuted, line (stack edges), accent, onAccent; type display, text, mono.
- **Sound**: `turn` (the exit, the deal), `tick` (a tab stamp) per row.
- **Styles**: made for `dossier` (recipe the dossier recipe).
- **Source**: own (the dossier source film planOf ledger; film.js buildLedger, paintLedger; layout.js ledgerBox`, the dossier template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: claims, titles and rows in Noto Serif SC (600 for claims and titles, 400 for rows) at the same sizes; a line rises character by character at a third of the English stagger (0.04 s), so it lands in about the time an English line does; mono labels at the 28 px floor with Noto Sans SC for Chinese; the capture stays in its own language; "EX. n" becomes 证物 n.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the dossier style (the template's example film the dossier source film, a model release on its published pages), so the compare is waived. Checked instead side by side with the example film at the same moments: the dossier recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the page a parameter (`exhibit`: src, size, crop, band, under, leader, ex, of, kind, where, spread; without it a placeholder published table drawn in code), what stood on the mat before passed as `prior` and `leaving`; the sheets leaving are drawn settled from `leaving`.
- **Pitfalls**: Restate claims the film struck; no new ones here.
