---
id: mode-switch
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### mode-switch

- **Structure**: segmented form: `track` (recessed, ink on the ground at 8 %, an inner shadow), `thumb` (raised, the panel colour, a top highlight), `labels` (two, ink when active, dim when not), `icons` (the old segment's folds away, the new one's pops in: neutral `lines` and `spark` glyphs). Toggle form: `track` (grey to the accent), `knob` (a disc whose sun turns to a crescent).
- **Intent**: Make one press of a two-way control the whole story, 'we went from A to B': the thumb's slide is the world answering, and the new icon popping in rewards the switch.
- **Content**: Two one-word labels (en ≤ 9 chars, zh ≤ 3) with their icons for the segmented form; nothing for the sun-and-moon toggle.
- **States**: `first` (`on` 0), `second` (`on` 1, `pop` 1). Between them the thumb stretches: its leading edge runs ahead (1 − (1 − on)^4/3) and its trailing edge lags (1 − (1 − on)^2/3), so it reads as a body being pulled, not a box sliding. `cursor-glide` presses it; the scene drives `on` with a spring.
- **Sizes**: S 600 × 122, M 1080 × 220, L 1400 × 285 (the toggle is 0.6 h high, twice as wide).
- **Swap points**: `left`, `right` (1 word / 9 chars, zh 3 chars each); without them two words from the sample steps.
- **Parameters**: `form` `segmented` | `toggle`, `backdrop` true; exports `drawSegmented` and `drawToggle`. **Roles**: `ground`, `panel`, `ink`, `dim`, `accent`.
- **Styles**: any interface style. **Source**: adapted from video-shotcraft `demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx` (card `references/shots/interaction/segmented-thumb-hero.md`); adapted from video-shotcraft `demos/interaction/theme-switch-moves/ThemeSweepToggle.tsx` (card `references/shots/interaction/theme-switch-moves.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`; variant `toggle`.
- **Use in a close-up** (the upstream's thumb hero): mode-switch at L, centred, with `cursor-glide` `hero` pressing the second segment; the thumb's stretch is the shot.
- **Pitfalls**: Keep it to two segments; across three or more the thumb's slide is too quick to read where it stops. Collapse the old icon by width, not just scale, or a ghost gap stays inside the control. Switch the theme at most once per film; it is a feature beat, and repeated switching reads as a demo accident.
- **Sample**: `poster.jpg`, an English still 480 px wide.
