---
id: roll-lockup
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### roll-lockup

- **Purpose**: Fling back to the top, name the product and roll the page up.
- **Intent**: Back to the top, where it began: the name and the address, and the page rolled away.
- **Content**: The name (≤ 14 chars) and the address (≤ 40 chars).
- **Fits**: `lockup`. **Not for**: a closing that needs a demo or several calls to action.
- **Layout and camera**: the sheet column x 120–1616 from y 54 (bleeding off the foot), 0.8 film px per image px in the example; the minimap at x 1664–1824 from y 120; a locked viewport: everything that changes is the sheet's offset; the name at 134 px bold in the hook band (baseline +168), the address DM Mono 35 at +250; the roll lands just under the band.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 2 words, 14 chars | 6 chars | tidewell |
  | `url` | code | primary | 1 | 40 chars | 40 chars | github.com/acme/tidewell |
  | `sheet` | object | optional | 1 | – | – | placeholder README |

  Options: `from` (the offset it flings from), `band`, `mark` (the title's mark), `open`.
- **Length**: 10–16 beats, whole bars: the fling 2, the name on 2.75, the address 3.5–5, the roll-up 1.5 beats landing 4 before the end.
- **Steps and events**: the fling (2 beats, k 12, T2; the tabs unpin in reverse); the band's lines rise out on 2.5 and the name rises in on 2.75; the title's underline on 3; the address types over 1.5 beats; the roll comes up (1.5 beats, momentum k 5, T2) and lands under the band.
- **Needs**: motions scroll-fling, roll, section-lock (runtime); props quote-band, sheet-minimap; roles ground, paper, onPaper, paperMuted, accent, roll; type display, mono. `sheet` (object, optional): the capture and its geometry, shared by every scroll scene of a film (kit.js header); without it a placeholder README.
- **Sound**: a riser into the fling, `land` as it stops, `type` under the address, `end` as the roll lands.
- **Styles**: made for `scroll` (recipe the scroll recipe).
- **Source**: own (the source film fling, name, under5, url, rollup; film.js band Q1, rollAt`, the scroll template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: quotes in Noto Sans SC at the same sizes (96 / 69 / 49 / 134), phrases cut by the page's own wording (no space between Chinese phrases); the capture is evidence in its own language; mono stays Latin; a Chinese name at 134 px; the address stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the scroll style (the template's example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the scroll recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the sheet a parameter (`sheet`: a capture's strips, bands, heads, marks and rows in image px; without it a placeholder README drawn in code); the name and the address are slots instead of the plan's QUOTES.
- **Pitfalls**: The roll lands on a downbeat four beats before the end.
