---
id: result-strike
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### result-strike

- **Purpose**: Compute, strike and claim the result on the drop.
- **Intent**: The proof lands as the music drops: the computed figure, struck like the published ones, and the sentence it proves.
- **Content**: A computed value (≤ 8 chars), its caption, a claim in two phrases (≤ 5 words each) and its terms.
- **Fits**: `climax`, `claim`, `proof`. **Not for**: figures printed on a page (strike them there); a second climax.
- **Layout and camera**: the frame of the template: the source file and the page in hand at y 54 (mono 25), the claim on the mat at baseline 186 (serif 600 50), its terms at 234 (mono 25), the reading position from y 292 at x 96, the sheet up to 1728 wide (1112 beside a worksheet) and down to y 1026, the worksheet at x 1240 (584 wide); a locked camera; the rule under the rows, the figure 125 px at the rule + 120, its caption at + 195.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `claim` | 2 phrases | primary | 2 | 5 words, 30 chars each | 12 chars each | First by 6.2 points, / on its own table. · 领先 6.2 分， / 出自它自己的表。 |
  | `terms` | text | glance (optional) | 1 | 56 chars | 26 chars | Tool-Bench v2, vendor-reported |
  | `worksheet` | object, plus `value`, `caption`, `underline` | glance | 1 | value 8, caption 28 chars | caption 12 chars | +6.2 · points over the next model |
  | `exhibit` | object | optional | 1 | – | – | placeholder table as a spread |

  Options: `prior` ({ claim, terms } sinking on beat 1.5), `slug`.
- **Length**: 6–12 beats (8 in the example): the second phrase lands on beat 4 and the frame holds at least two beats after it.
- **Steps and events**: the rule on 0.5 (0.4 s expo out), the figure on 1 (as one), the caption on 1.5 as the old claim sinks, the first phrase on 1.75, the terms on 2.25, the stroke over the figure on 3 (one beat), the second phrase on 4 (the key, the climax), then a still hold (a pause).
- **Needs**: props ruled-worksheet, mounted-sheet, file-slug (inside the kit); roles ground (the mat), ink and dim (claim and terms on it), paper, onPaper, paperMuted, line (stack edges), accent, onAccent; type display, text, mono. `exhibit` (object, optional): the capture and where its claim is printed, shared by the scenes of one sheet (kit.js exhibitSpec): `src`, `size`, `crop` [x, y, w, h], `band` [x, y, w, h], `under`, `leader` (down | left | right | false), `ex`, `of`, `kind`, `where`, `spread`, `scale`; without it the placeholder table.
- **Sound**: `land` as the figure enters, `accent` (the stroke), `claim` on beat 4 (an impact, a paper press and a tick: the drop).
- **Styles**: made for `dossier` (recipe the dossier recipe).
- **Source**: own (the dossier source film planOf result; film.js buildWorksheet result, paintWorksheet, buildMat`, the dossier template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: claims, titles and rows in Noto Serif SC (600 for claims and titles, 400 for rows) at the same sizes; a line rises character by character at a third of the English stagger (0.04 s), so it lands in about the time an English line does; mono labels at the 28 px floor with Noto Sans SC for Chinese; the capture stays in its own language; "EX. n" becomes 证物 n.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the dossier style (the template's example film the dossier source film, a model release on its published pages), so the compare is waived. Checked instead side by side with the example film at the same moments: the dossier recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the page a parameter (`exhibit`: src, size, crop, band, under, leader, ex, of, kind, where, spread; without it a placeholder published table drawn in code), what stood on the mat before passed as `prior` and `leaving`; the worksheet before the rule is drawn settled from `worksheet` (the film keeps one worksheet across both scenes).
- **Pitfalls**: The figure is computed from rows on the worksheet; mark derived numbers as approximate (~).
