---
id: exhibit-strike
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### exhibit-strike

- **Purpose**: Lay an exhibit and strike its claim.
- **Intent**: Show the claim where it was printed and strike it, so the viewer sees the evidence before the words.
- **Content**: A captured page, the box of its printed claim (image px), the claim (≤ 8 words) and its terms.
- **Fits**: `hook`, `problem`, `demo`, `proof`. **Not for**: claims with no printed source; pages whose claim cannot be struck where it is.
- **Layout and camera**: the frame of the template: the source file and the page in hand at y 54 (mono 25), the claim on the mat at baseline 186 (serif 600 50), its terms at 234 (mono 25), the reading position from y 292 at x 96, the sheet up to 1728 wide (1112 beside a worksheet) and down to y 1026, the worksheet at x 1240 (584 wide); a locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `claim` | text (or 2 phrases) | primary | 1 | 8 words, 48 chars | 20 chars | First on Tool-Bench v2. · 在 Tool-Bench v2 上排第一。 |
  | `terms` | text | glance (optional) | 1 | 56 chars | 26 chars | Vendor-reported · v2 · 3 models · 厂商自报 · v2 · 3 个模型 |
  | `exhibit` | object | optional | 1 | – | – | placeholder table |

  Options: `enter` (`open` the cold open · `deal` dealt from below · `change` there after a page change in the seam · `matched` arrives struck after a match cut), `slug`, `prevPage` (the header's previous page), `prior` ({ claim, terms } on the mat before; sinks on a deal), `leaving` ({ exhibit, worksheet } sliding off on a deal).
- **Length**: 4–10 beats (5 in the example): until the claim is read (0.3 s a word) and the terms glanced (1 s).
- **Steps and events**: open: the claim rises on beat 0 (0.42 s a word, 0.12 s apart), the veil on 0.5 (0.3 s), the stroke wipes on beat 1 (one beat, cosine in-out), lands on 2, the leader draws (0.4 s) with its dot, the terms on 2.5, the sticker pressed on 3 (1.1 → 1 in 0.12 s); deal shifts it all a beat (the sheet before slides off at 0, this one dealt on at 0.5); matched arrives veiled and struck, sticker on 1; a hold over two beats presses the stroke again (1 → 1.12 → 1, 0.36 s).
- **Needs**: motions sheet-deal; props mounted-sheet, exhibit-sticker, file-slug (inside the kit); roles ground (the mat), ink and dim (claim and terms on it), paper, onPaper, paperMuted, line (stack edges), accent, onAccent; type display, mono. `exhibit` (object, optional): the capture and where its claim is printed, shared by the scenes of one sheet (kit.js exhibitSpec): `src`, `size`, `crop` [x, y, w, h], `band` [x, y, w, h], `under`, `leader` (down | left | right | false), `ex`, `of`, `kind`, `where`, `spread`, `scale`; without it the placeholder table.
- **Sound**: `accent` (the felt-tip stroke) as the stroke starts, `land` as it lands, `land` (heavier, the sticker) on the press; `turn` under a deal.
- **Styles**: made for `dossier` (recipe the dossier recipe).
- **Source**: own (the dossier source film planOf exhibit; film.js paintSheet, buildMat, paintHeader, dealY`, the dossier template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: claims, titles and rows in Noto Serif SC (600 for claims and titles, 400 for rows) at the same sizes; a line rises character by character at a third of the English stagger (0.04 s), so it lands in about the time an English line does; mono labels at the 28 px floor with Noto Sans SC for Chinese; the capture stays in its own language; "EX. n" becomes 证物 n.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the dossier style (the template's example film the dossier source film, a model release on its published pages), so the compare is waived. Checked instead side by side with the example film at the same moments: the dossier recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the page a parameter (`exhibit`: src, size, crop, band, under, leader, ex, of, kind, where, spread; without it a placeholder published table drawn in code), what stood on the mat before passed as `prior` and `leaving`; the enter kinds `change` and `matched` stand for the template's page changes (sheet-shuffle, louvre, match-cut), which run in the seam before the scene; their poses are not redrawn here.
- **Pitfalls**: Strike only what the page prints; a number the page does not print goes to the worksheet. One band lit at a time.
