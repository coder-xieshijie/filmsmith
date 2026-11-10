---
id: name-strike
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### name-strike

- **Purpose**: Strike the name on the mat.
- **Intent**: End on the name, struck like the evidence: the product is the claim the file supports.
- **Content**: The name (≤ 16 chars), the URL, a capture line, the logo asset (optional).
- **Fits**: `lockup`. **Not for**: films whose ending is a quote or a number.
- **Layout and camera**: the frame of the template: the source file and the page in hand at y 54 (mono 25), the claim on the mat at baseline 186 (serif 600 50), its terms at 234 (mono 25), the reading position from y 292 at x 96, the sheet up to 1728 wide (1112 beside a worksheet) and down to y 1026, the worksheet at x 1240 (584 wide); a locked camera; the mark at y 236 (≤ 240 tall), the name band at y 560 (400 without a mark), 160 px serif, the URL at + 274, the capture line at + 326.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 3 words, 16 chars | 8 chars | Example 2.0 · 示例模型 2.0 |
  | `url` | text | primary | 1 | 40 chars | 40 chars | example.com |
  | `caption` | text | glance (optional) | 1 | 64 chars | 30 chars | Captured 2026-10-20 · example.com |
  | `mark` | { src, crop } | optional | 1 | – | – | none |

  Options: `of` (the number of exhibits, for the header), `beats` (the arc's rounding), `leaving` ({ ledger } squared and slid off), `prior`, `slug`, `prevPage`.
- **Length**: 8–16 beats (13 in the example, the film's rounding).
- **Steps and events**: the file squares (edges closing) and slides off in a beat; the mark wipes in on 0.5 (0.45 s); the band and the name wipe in on beat 1 (one beat, cosine), the name's key on 2; the URL rises on 2.5, the capture line on 3 (0.05 s a word); the URL underlined on the downbeat of the last bar (0.4 s expo out).
- **Needs**: props file-slug (inside the kit); roles ground, ink, dim, accent, onAccent; type display, mono.
- **Sound**: `turn` (the file, heavier), `accent` (the stroke), `land` (the name: an impact and a stamp, the bed ducked), `end` (the underline).
- **Styles**: made for `dossier` (recipe the dossier recipe).
- **Source**: own (the dossier source film planOf lockup; film.js buildLockup, paintLockup; timeline.js endMove`, the dossier template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: claims, titles and rows in Noto Serif SC (600 for claims and titles, 400 for rows) at the same sizes; a line rises character by character at a third of the English stagger (0.04 s), so it lands in about the time an English line does; mono labels at the 28 px floor with Noto Sans SC for Chinese; the capture stays in its own language; "EX. n" becomes 证物 n; a name with Chinese gets a taller band (0.91 em above the baseline to 0.19 below) since Chinese characters fill the em box where Latin capitals stop at cap height.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the dossier style (the template's example film the dossier source film, a model release on its published pages), so the compare is waived. Checked instead side by side with the example film at the same moments: the dossier recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the page a parameter (`exhibit`: src, size, crop, band, under, leader, ex, of, kind, where, spread; without it a placeholder published table drawn in code), what stood on the mat before passed as `prior` and `leaving`; `beats` lets the arc hand it the rounding (the template's fit gives the lock-up the remainder).
- **Pitfalls**: The logo is the brand's own file, unchanged; the band is the only accent fill under type that is not a page's.
