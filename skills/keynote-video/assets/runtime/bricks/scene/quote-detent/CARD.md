---
id: quote-detent
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### quote-detent

- **Purpose**: Move to a line of the page, underline it and quote it.
- **Intent**: Read the page's claims one at a time, each marked where it is written and said in large type.
- **Content**: A mark on the page and its quote in 1–2 lines of phrases (≤ 20 chars each).
- **Fits**: `problem`, `turn`, `demo`, `proof`. **Not for**: claims that are not on the page; more than four phrases a line.
- **Layout and camera**: the sheet column x 120–1616 from y 54 (bleeding off the foot), 0.8 film px per image px in the example; the minimap at x 1664–1824 from y 120; a locked viewport: everything that changes is the sheet's offset; quote bands 250 px at 69 px semibold, inset 96 px.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of lists of text | primary | 1–2 × 1–4 | 3 words, 20 chars | 6 chars | Only what · an edit touches, / rebuilt. · 只重建 · 改动碰到的 / 那部分。 |
  | `mark` | name of a mark | glance (optional) | 1 | – | – | intro |
  | `sheet` | object | optional | 1 | – | – | placeholder README |

  Options: `from`, `to` (offset targets: 'top', a number, { piece, under }, { head }, { row, head }, { bandFoot, at }), `move` (`detent` | `reel` | `none`), `lead` (beats of the move before the boundary), `band`, `replace` (the band's previous lines rise out first), `prevMark`, `unmark`, `open` (the unfold panel's state).
- **Length**: 4–12 beats: the move, half a beat, the underline, then the phrases until read.
- **Steps and events**: the sheet moves (detent 1 beat momentum k 5.5, reel 2 beats k 6.5; T1/T2), headings pinning by runtime section-lock's tabsAt; half a beat after it lands the underline draws (T0); phrases rise in half a beat after it, each once the previous is read; with `unmark` the underline retracts over the last half beat.
- **Needs**: motions scroll-reel, section-lock (runtime); props quote-band, sheet-minimap; roles ground, paper, onPaper, accent, line; type display. `sheet` (object, optional): the capture and its geometry, shared by every scroll scene of a film (kit.js header); without it a placeholder README.
- **Sound**: `turn` (a dry whoosh) under the move, `land` (a click) as it lands, `accent` on the underline and each phrase.
- **Styles**: made for `scroll` (recipe the scroll recipe).
- **Source**: own (the source film SPANS detent1, under2, swap2, reel2, under4; film.js offsetAt, band, underline`, the scroll template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: quotes in Noto Sans SC at the same sizes (96 / 69 / 49 / 134), phrases cut by the page's own wording (no space between Chinese phrases); the capture is evidence in its own language; mono stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the scroll style (the template's example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the scroll recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the sheet a parameter (`sheet`: a capture's strips, bands, heads, marks and rows in image px; without it a placeholder README drawn in code); the move's curve is runtime scroll-reel's `momentum`, called directly.
- **Pitfalls**: One underline at a time: the previous one retracts or is carried off before the next draws.
