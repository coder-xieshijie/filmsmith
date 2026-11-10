---
id: row-ratchet
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### row-ratchet

- **Purpose**: Dock a list's rows one a beat under its pinned heading.
- **Intent**: The list is felt as a count: one row a beat, named as it docks.
- **Content**: A heading on the page and 3–12 rows, each named in one word (≤ 12 chars).
- **Fits**: `demo`, `proof`. **Not for**: lists over twelve rows; rows whose names are not one word.
- **Layout and camera**: the sheet column x 120–1616 from y 54 (bleeding off the foot), 0.8 film px per image px in the example; the minimap at x 1664–1824 from y 120; a locked viewport: everything that changes is the sheet's offset; the docked row under the tab, its 6 px accent bar at x 128, the rows below veiled 34 %; the slot at 49 px after the heading's own glyphs.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `names` | list of text | glance | 0–12 | 1 word, 12 chars | 5 chars | the rows' labels |
  | `sheet` | object | optional | 1 | – | – | placeholder README |

  Options: `head` (the heading index), `rows` (how many dock), `from`, `open`.
- **Length**: 5–16 beats: the reel 1.5 beats, the first row on 2.5, one a beat.
- **Steps and events**: the reel (1.5 beats, momentum k 6.5, T2) pins the heading; each row docks in an expo-out half beat ending on its beat (T0 × n), the margin bar resizing to the row, the slot's names rolling vertically.
- **Needs**: motions scroll-reel, section-lock (runtime); props sheet-minimap; roles ground, paper, onPaper, paperMuted, accent, line; type display. `sheet` (object, optional): the capture and its geometry, shared by every scroll scene of a film (kit.js header); without it a placeholder README.
- **Sound**: `turn` under the reel, `land` as it pins, `tick` per row (rising).
- **Styles**: made for `scroll` (recipe the scroll recipe).
- **Source**: own (the source film reel1, RATCHET0, RATCHET_STEP, RATCHET_MOVE; film.js ratchet, slot`, the scroll template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: quotes in Noto Sans SC at the same sizes (96 / 69 / 49 / 134), phrases cut by the page's own wording (no space between Chinese phrases); the capture is evidence in its own language; mono stays Latin; the slot names in Chinese (≤ 5 characters).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the scroll style (the template's example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the scroll recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the sheet a parameter (`sheet`: a capture's strips, bands, heads, marks and rows in image px; without it a placeholder README drawn in code); the slot's x comes from scanning the heading's pixels (as the template does) and falls back to 30 % of the width when the capture cannot be read.
- **Pitfalls**: The slot names must be the rows' own names.
