---
id: row-unfold
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### row-unfold

- **Purpose**: Open a row of the page on what it describes.
- **Intent**: Proof inside the page: the row opens on the very thing it describes.
- **Content**: A row of the page, the frames it opens on (a film's own frames, 1:1), a claim (≤ 32 chars) and a source label.
- **Fits**: `climax`, `demo`. **Not for**: rows with nothing real to open; two unfolds in a row.
- **Layout and camera**: the sheet column x 120–1616 from y 54 (bleeding off the foot), 0.8 film px per image px in the example; the minimap at x 1664–1824 from y 120; a locked viewport: everything that changes is the sheet's offset; the panel 792 px across the sheet: an 88 px caption strip (the claim at 49 px left, the label at 25 px mono right), the frames 1216 × 684 centred.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `claim` | text | primary | 1 | 6 words, 32 chars | 12 chars | Measured on a real scene. / 在真实场景上测得。 |
  | `label` | text | glance (optional) | 1 | 30 chars | 30 chars | city-4k · 0.6 s |
  | `frames` | object | optional | 1 | – | – | { src: 'f{n}.jpg', count, fps }; placeholder frames without it |
  | `sheet` | object | optional | 1 | – | – | placeholder README |

  Options: `row`, `head`, `from` (default the ratchet's last row), `slotFrom`.
- **Length**: 6–12 beats: the move 1 beat, the unfold 2, the frames from 1.5, the claim on beat 5, held until read.
- **Steps and events**: the sheet moves to the row (1 beat, momentum k 6, T1) while the ratchet's mark fades (half a beat) and the slot rolls to the row's name; the row opens over beats 1–3 (cubic in-out, T2: runtime unfold's opening); the frames play 1:1 from 1.5; the claim rises into the caption strip on beat 5 (T3 climax).
- **Needs**: motions unfold, scroll-reel (runtime); props sheet-minimap; roles ground, panel, onPanel, dim, accent, paper, onPaper, line; type display, mono. `sheet` (object, optional): the capture and its geometry, shared by every scroll scene of a film (kit.js header); without it a placeholder README.
- **Sound**: `turn` under the move, a paper slide and a swell under the unfold, `claim` (an impact and a rolled chime) on the claim.
- **Styles**: made for `scroll` (recipe the scroll recipe).
- **Source**: own (the source film reelUp, unMark, unfold, play, caption; film.js panel`, the scroll template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: quotes in Noto Sans SC at the same sizes (96 / 69 / 49 / 134), phrases cut by the page's own wording (no space between Chinese phrases); the capture is evidence in its own language; mono stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the scroll style (the template's example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the scroll recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the sheet a parameter (`sheet`: a capture's strips, bands, heads, marks and rows in image px; without it a placeholder README drawn in code); the opening is drawn by the scene (the sheet's layout grows the panel) with runtime unfold's easing rather than calling the hand-off.
- **Pitfalls**: One unfold per film by default, two at most, never two in a row. Frames play 1:1; when they run out the last stays.
