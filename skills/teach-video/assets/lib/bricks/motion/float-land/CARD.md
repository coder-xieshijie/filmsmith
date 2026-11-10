---
id: float-land
category: motion
tier: T1
family: lift-flip
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### float-land

- **Looks**: the text of a surface (default a list panel: six rows of a title and a count) starts hovering above it, each piece lifted up and to the left, with a same-shape shadow in the shade colour below and to the right, larger, softer and stronger the higher it is. The pieces fall onto the surface one after another in reading order, accelerating and landing softly; each shadow closes into a contact shadow and goes as its piece lands. `lift` (the reverse beat): three cards lie on a table seen from above at a tilt; one after another they lift off it along its normal and come back down with a small press, the last springs up and stays in the air; each card's shadow stays on the table as a small hard contact core and a wide soft shade that grow, soften, fade and slide away from the light as it rises, while the cards left lying sink a little.
- **Tier**: T1. **Family**: lift-flip. **Surface**: canvas.
- **Use**: a UI's text settling as the camera arrives (under `graze-tour`, `perspective-glide`, a push-in); a list, menu or form coming to rest. **Not for**: paragraphs (each piece is one line); dark text on a dark ground (the shadow cannot be seen); terminal styles. `lift`: naming options in turn and picking one (plans, presets, templates).
- **Intent**: The interface completes itself as you look: its words hover with shadows and settle into place, so the viewer feels the UI arrive rather than fade in.
- **Content**: A surface with 3–8 one-line text pieces (a list, menu or form; each ≤ 24 chars, Chinese ≤ 10 characters); `lift`: three cards to name one by one.
- **Parameters**: `surface` (the painter under the text; default a ruled list panel), `pieces` ([{ text, x, y, size, weight, role, color (a role name), align }]; default the sample cards' titles and counts), `lift` 130 (height before the fall, px), `first` 0.22, `span` 0.62 (when the first piece lands and over what share the others follow), `fall` 0.34 (share each fall takes), `look` (whose type the pieces are set in). Roles read: `ground`, `panel`, `line`, `ink`, `dim`, `accent` (the default surface and pieces); the shadow is the ground mixed with black. `mode` `'land'` | `'lift'`; lift: `cards` (three painters `(ctx, w, h)` for the 420 × 600 faces; default a label, a big figure, a line and a row of cells from the sample copy), `tilt` [24, 20] (degrees, eased over the brick).
- **Theory**: a cast shadow is the strongest cue for height above a surface (Kersten, Mamassian & Knill 1997: moving only the shadow makes an object appear to rise); landing in reading order leads the eye through the text.
- **Styles**: any light or mid-ground style; avoid terminal.
- **Length and easing**: 3.5 beats (about 50 frames at 120 BPM), 2–6. Each fall cubic-bezier(0.5, 0.05, 0.6, 1); offsets −0.34 h, −0.78 h for the piece and +0.22 h, +0.42 h for the shadow (scale 1 + 0.0011 h, blur 2 + 0.09 h px, opacity 0.08 + 0.0026 h up to 0.22). `lift` 8 beats (120 frames): named cards at frames 4 and 38 (up 10 frames out-cubic, hover 14 with a 5 % breath, down 8 in-cubic, a 2-frame press to 0.99), the chosen card from 74 on a spring (damping 16, stiffness 120) to 1.15 × 96 px and scale 1.05, then breathing ±4 %; contact core offset (2 + 18 l, 4 + 36 l), blur 3 + 22 l, opacity 0.32 − 0.18 l; ambient shade offset (10 + 40 l, 16 + 60 l), blur 14 + 40 l, opacity 0.09 + 0.13 l (l the lift 0–1).
- **Sound**: soft ticks as the pieces land, or nothing.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/camera/graze-face-tour/GrazeFaceTour.tsx` (`FloatWrap` and `liftOf`; card `references/shots/camera/graze-face-tour.md`) @ `1266a3e`; `lift` from `demos/ui-entrance/element-body-moves/ContactShadowLift.tsx` (card `references/shots/ui-entrance/element-body-moves.md`).
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the pieces are set in the look's type per language; zh counts at the 28 px floor).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the surface is any painter and the pieces are text set by the look instead of the workspace UI; the low grazing camera, its three segments and the neon frames belong to the scene `graze-tour`. Compare (the first segment, its first row): pass (offset track 0 px, events ±0 frames; the pictures differ: the upstream is seen at a grazing angle).
- **Pitfalls**: The shadow is what makes it read; on a dark ground lift the hovering pieces' brightness (~1.3×) or it is just a slide-in. Staggered landing is for a tour; a whole layout entering at once should land on one frame. `lift`: lift one card at a time and at least 28 px; smaller is not felt.
