---
id: claim-shift
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### claim-shift

- **Purpose**: Move the strike to the next claim on the same page.
- **Intent**: Keep the page and move the eye: the next claim is a step down the same evidence.
- **Content**: The box of the next printed claim, the claim (≤ 8 words) and its terms.
- **Fits**: `problem`, `demo`, `proof`. **Not for**: claims on another page (a new exhibit); more than three claims on one page.
- **Layout and camera**: the frame of the template: the source file and the page in hand at y 54 (mono 25), the claim on the mat at baseline 186 (serif 600 50), its terms at 234 (mono 25), the reading position from y 292 at x 96, the sheet up to 1728 wide (1112 beside a worksheet) and down to y 1026, the worksheet at x 1240 (584 wide); a locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `claim` | text (or 2 phrases) | primary | 1 | 8 words, 48 chars | 20 chars | Third on Long-Ctx 256K. · 在 Long-Ctx 256K 上排第三。 |
  | `terms` | text | glance (optional) | 1 | 56 chars | 26 chars | 44.7, behind Model B · 44.7，落后 Model B |
  | `band` | [x, y, w, h] image px | – | 1 | – | – | the placeholder's third row |
  | `exhibit` | object | optional | 1 | – | – | placeholder table (its `band` is where the strike moves from) |

  Options: `under`, `leader` (the new claim's), `prior` ({ claim, terms } sinking), `slug`.
- **Length**: 3–8 beats (5 in the example).
- **Steps and events**: the band and stroke move in 0.4 s (power 2 in-out) from beat 0; the old claim sinks (0.2 s, power 3 in) and the new rises on 0.25; a leader the new claim keeps follows, one it drops fades in 0.2 s, one it gains draws on 0.5; the old terms sink on 1.25, the new rise on 1.5; a long hold presses the stroke again.
- **Needs**: props mounted-sheet, exhibit-sticker, file-slug (inside the kit); roles ground (the mat), ink and dim (claim and terms on it), paper, onPaper, paperMuted, line (stack edges), accent, onAccent; type display, mono. `exhibit` (object, optional): the capture and where its claim is printed, shared by the scenes of one sheet (kit.js exhibitSpec): `src`, `size`, `crop` [x, y, w, h], `band` [x, y, w, h], `under`, `leader` (down | left | right | false), `ex`, `of`, `kind`, `where`, `spread`, `scale`; without it the placeholder table.
- **Sound**: `turn` (a light air, −28 dB) under the band move; `pop` on a tail move.
- **Styles**: made for `dossier` (recipe the dossier recipe).
- **Source**: own (the dossier source film planOf claim; film.js bandAt, buildMat`, the dossier template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: claims, titles and rows in Noto Serif SC (600 for claims and titles, 400 for rows) at the same sizes; a line rises character by character at a third of the English stagger (0.04 s), so it lands in about the time an English line does; mono labels at the 28 px floor with Noto Sans SC for Chinese; the capture stays in its own language; "EX. n" becomes 证物 n.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the dossier style (the template's example film the dossier source film, a model release on its published pages), so the compare is waived. Checked instead side by side with the example film at the same moments: the dossier recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the page a parameter (`exhibit`: src, size, crop, band, under, leader, ex, of, kind, where, spread; without it a placeholder published table drawn in code), what stood on the mat before passed as `prior` and `leaving`; the previous band comes from `exhibit.band` instead of the film's band list.
- **Pitfalls**: The band moves; it never fades out and in.
