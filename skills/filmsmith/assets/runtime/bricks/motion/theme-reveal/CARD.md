---
id: theme-reveal
category: motion
tier: T1
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### theme-reveal

- **Looks**: The same interface in the next theme spreads over the current one. Ripple: from a point, a circle with a white-hot rim and a soft glow in each theme's accent grows past the farthest corner while the new theme inside settles from 1.035 to 1; optionally a command panel first collapses into that point like a television switching off (squash to a line, then to a dot held 5 frames). Sweep: the new theme crosses the frame from the right behind a 15° edge with a hot core line and bands that widen with speed, day and night on screen at once.
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: one interface changing state in place: a theme, a mode, light to dark, before to after on the same layout. **Not for**: going to another page (the layouts must be identical, or it reads as a wipe); a cut between scenes.
- **Intent**: The same interface changes its skin before the viewer's eyes, so it reads as one product changing state, not a cut to another page.
- **Content**: One scene painted in two palettes with an identical layout (often light and dark), the point that was pressed, and optionally a command panel that collapses first.
- **Parameters**: `from`, `to` (the scene painted with two palettes of one look, default the page in `neutral-light` → `neutral-dark`), `shape` `ripple` | `sweep`, `origin` [960, 452] (the point the ripple leaves; put it on the control that was pressed), `panel` `{ rect: [470, 242, 980, 420] }` or null (the command panel that collapses first), `angle` 15, `sweep` `{ from: 1960, to: -480 }`. Roles read: the two palettes' `ground`, `panel`, `ink`, `accent` (the glows); the rim is white.
- **Theory**: Object constancy: when every element keeps its place and only its colours change, the eye reads one interface changing state, not a cut to another page; the ripple leaves the point that caused it (Michotte 1946 on caused change).
- **Styles**: any look with a light and a dark preset; avoid single-palette looks.
- **Length and easing**: 3.2 beats (ripple 48 frames with the panel collapse, 34 frames of growth on bezier .2 .55 .3 1), sweep 64 frames on bezier .3 0 .35 1; range 2.4–4.4.
- **Sound**: `turn` as the ripple leaves the point (or the edge enters); a soft `land` as it clears the frame.
- **Source**: adapted from video-shotcraft `demos/interaction/theme-switch-moves/PaletteThemeRipple.tsx` (card `references/shots/interaction/theme-switch-moves.md`); adapted from video-shotcraft `demos/interaction/theme-switch-moves/ThemeSweepToggle.tsx` (card `references/shots/interaction/theme-switch-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the panel's text is the film's).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the two themes are the caller's scene in two palettes (the brick never inverts colours); the gallery and calendar fixtures, the camera breath and the "lights come on" aftermath are the scene's. Compare against `palette-theme-ripple`: tracks pass (rim radius 20.6 px, panel 6.3 px, events ±0); SSIM drop waived as a content gap (the upstream's dark gallery of bright art against the neutral page).
- **Pitfalls**: The two layouts must match pixel for pixel; any difference reads as going to another page. For a real product, use two real screenshots of the two themes, not a filter. Once a film: it is a feature story, not a transition; repeated it looks like a demo accident.
