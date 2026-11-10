---
id: sheet-open
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### sheet-open

- **Purpose**: Unroll the page and quote its first line.
- **Intent**: Open the page itself: the viewer sees the real thing hang and the first line read out.
- **Content**: The tagline's mark (image px) and its quote in 1–2 lines of phrases (≤ 20 chars).
- **Fits**: `hook`. **Not for**: pages without a one-line tagline; films that open on a screen.
- **Layout and camera**: the sheet column x 120–1616 from y 54 (bleeding off the foot), 0.8 film px per image px in the example; the minimap at x 1664–1824 from y 120; a locked viewport: everything that changes is the sheet's offset; the hook band 320 px at 96 px bold, the sheet's top edge at y 70.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of lists of text | primary | 1–2 × 1–3 | 3 words, 20 chars | 6 chars | Incremental renders / for big scenes. · 大场景的 / 增量渲染。 |
  | `mark` | name of a mark | glance (optional) | 1 | – | – | tagline |
  | `sheet` | object | optional | 1 | – | – | placeholder README |

  Options: `band` (the band it fills, default Q1), `minimap`, `unmark` (retract on the last beat).
- **Length**: 6–12 beats (8 in the example): the phrases from beat 3, one once the previous is read, on quarter beats.
- **Steps and events**: the roll drops out of the frame over 2 beats (momentum k 4.2, T2); the underline draws on beat 2 (half a beat, T0); each phrase rises into its line box (half a beat, expo out); the minimap prints top to bottom on 5.5–6.5; the underline retracts on the last beat.
- **Needs**: motions roll, section-lock (runtime); props quote-band, sheet-minimap; roles ground, paper, onPaper, accent, line, roll; type display. `sheet` (object, optional): the capture and its geometry, shared by every scroll scene of a film (kit.js header); without it a placeholder README.
- **Sound**: `accent` on the underline (a pencil tick) and on each phrase (a soft pop); a paper slide under the unroll.
- **Styles**: made for `scroll` (recipe the scroll recipe).
- **Source**: own (the source film SPANS unroll, under1, mini; film.js rollAt, band, minimap`, the scroll template's example). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: quotes in Noto Sans SC at the same sizes (96 / 69 / 49 / 134), phrases cut by the page's own wording (no space between Chinese phrases); the capture is evidence in its own language; mono stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the scroll style (the template's example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the scroll recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the sheet a parameter (`sheet`: a capture's strips, bands, heads, marks and rows in image px; without it a placeholder README drawn in code); the phrase timing is computed from `readTime` (explicit `at` per phrase overrides it).
- **Pitfalls**: The quote is the page's own words, cut, never added to.
