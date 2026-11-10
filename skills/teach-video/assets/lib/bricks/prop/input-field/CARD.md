---
id: input-field
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### input-field

- **Structure**: `body` (a fixed-width bar, pill or prompt box in the panel colour with a soft top-lit gradient), `rim` (the line role, turning to the accent and thicker when confirmed), `focus-ring` (a 4 px accent ring at 28 %), `glow` (an accent light inside, faint on the left and strong on the right), `icon` (a search glyph on bars), `text` and `placeholder`, `caret` (4 px, ahead of the text), `button` (voice: a circle with five bars that can move; send: an arrow), filled in the accent while glowing or confirmed. The body never stretches with its text (stretching reads as a chip); long text scrolls left.
- **Intent**: Show that input happens here: a field that focuses, takes text as it is typed and confirms, so the viewer follows what was asked before seeing the answer.
- **Content**: One line of text to type (en ≤ 44 chars, zh ≤ 20) and an optional placeholder (en ≤ 24, zh ≤ 10); a search, send or voice button by form.
- **States**: `empty`; `focus` (caret, ring, the glow full: "waiting for you"); `typed` (the text in, the glow gone); `done` (the rim in the accent). Scenes type by setting `typed` 0 → 1 (by grapheme cluster).
- **Sizes**: S 640 × 88, M 1000 × 104, L 1240 × 132.
- **Swap points**: `text` (8 words / 44 chars, zh 20 chars), `placeholder` (4 words / 24 chars, zh 10 chars); neutral sample copy without them.
- **Parameters**: `form` `bar` | `pill` | `prompt`, `button` `voice` | `send` | null, `icon` `search` | `none`, `size` (type px), `ring` (false: no focus ring), state fields `caret` (0 hides, between 0 and 1 fades) and `wave` (the voice bars' phase); exports `drawField` and `typedText`. **Roles**: `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`, `ground`.
- **Styles**: any interface style. **Source**: adapted from video-shotcraft `demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping.tsx` (card `references/shots/interaction/glass-pill-dictation-typing.md`); adapted from video-shotcraft `demos/interaction/theme-switch-moves/PaletteThemeRipple.tsx` (card `references/shots/interaction/theme-switch-moves.md`); adapted from video-shotcraft `demos/interaction/type-and-filter/TypeAndFilter.tsx` (card `references/shots/interaction/type-and-filter.md`); adapted from video-shotcraft `demos/interaction/canvas-materialize-moves/DiagramCascadeBuild.tsx` (card `references/shots/interaction/canvas-materialize-moves.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (Chinese types a character a step). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`; variants `search`, `prompt`.
- **Pitfalls**: Type at a human pace, about 3 frames a character to start; the first draft of an interaction is almost always too fast. The field never stretches with its text; keep a fixed width about 1.8–2× the sentence and let long text scroll.
- **Sample**: `poster.jpg`, an English still 480 px wide.
