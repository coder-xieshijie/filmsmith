---
id: lamp-reveal
category: motion
tier: T1
family: mask-type
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### lamp-reveal

- **Looks**: The scene lies in the dark, only a ghost of it visible. `swing`: a lamp flickers on, its spot swings like a pendulum dying to the centre, then opens like an iris until the scene is lit. `grow`: a light grows from the top-left corner at constant speed until the whole page is lit. `pass`: a light crosses the scene's top edge at constant speed, waking it and leaving it dark again, an edge light running with it. `pan`: the light runs right while a wide scene slides left, then both brake to a stop.
- **Tier**: T1. **Family**: mask-type. **Surface**: canvas.
- **Use**: a dark opening or a dark section that introduces a title or a panel: the light decides what the viewer sees. **Not for**: light styles (a lamp on a light ground shows nothing); more than one dark section a film; more than two light effects in all.
- **Intent**: In the dark the viewer sees only what the light gives, so the lamp decides what appears and when: lighting as camera and edit.
- **Content**: One scene to light: a title (≤ 24 chars) or a UI panel; for pass and pan an edge for the light to run along.
- **Parameters**: `from` (the scene, default the title), `path` `swing` | `grow` | `pass` | `pan` (default `swing`), `dark` 0.07 (how much of the scene shows in the dark), `at` [960, 560] (the swing centre), `corner` [140, 90] (where `grow` starts), `rim` [x, y, w, h] (the edge `pass` and `pan` light runs along), `slide` [180, −1100] (the scene's slide in `pan`), `edge` false (the edge light), `seed`. Exports `PATHS`. Roles read: `ground` mixed with black (the night), `accent` (the edge light).
- **Theory**: In the dark the viewer sees only what the light gives (figure and ground by luminance, Gestalt); the lamp is both camera and edit. Constant speed reads as a mechanical searchlight with no intention of its own; the pendulum that dies to the centre before the iris opens is a damped swing, read as a hand on the lamp (anticipation, then release).
- **Styles**: any dark style; never ink, halftone, dossier, plakat or split.
- **Length and easing**: `swing` 137 frames (9.1 beats at 120 BPM): flicker 0–6, pendulum 4–117 (period 50 frames, damping `smooth`), iris 117–137 cubic out; `grow` 100 frames linear; `pass` 130 frames linear; `pan` 132 frames linear with a 10-frame quadratic brake. `beatsFor` follows the path; range 6–9.2 beats.
- **Sound**: `accent` on the lamp coming on (the flicker), `turn` led into the iris; the light itself is silent.
- **Merged from**: `corner-spotlight-reveal` (`grow`), `glow-wake-sleep-panel` (`pass` with `edge`), `slide-spotlight-pan` (`pan`).
- **Source**: adapted from video-shotcraft `demos/effects/light-play-moves/SpotlightSweepReveal.tsx` (card `references/shots/effects/light-play-moves.md`); adapted from video-shotcraft `demos/effects/spotlight-sweep-moves/CornerSpotlightReveal.tsx` (card `references/shots/effects/spotlight-sweep-moves.md`); adapted from video-shotcraft `demos/effects/spotlight-sweep-moves/GlowWakeSleepPanel.tsx` (card `references/shots/effects/spotlight-sweep-moves.md`); adapted from video-shotcraft `demos/effects/spotlight-sweep-moves/SlideSpotlightPan.tsx` (card `references/shots/effects/spotlight-sweep-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the velvet curtain, stage floor, motes, ghost panel, logo ring and the 3D panel tilt are the scene's and the style's; the camera drift of the corner and pass shots is left out; the pan gets a 10-frame brake so the next scene can hold. Compare (`swing` against `spotlight-sweep`): pass, track 0.1 px, events 0.
- **Don't**: let the `edge` light become a neon line on a black ground (a known AI tell): it is the accent, one layer of light where the lamp touches the interface, and only in `pass` and `pan`.
- **Pitfalls**: Dark grounds only: on a light ground the light shows nothing. All light effects together at most twice a film; light cheapens fastest. grow, pass and pan must move at constant speed (an eased light looks intentional, not a searchlight), and a grow radius too large saturates in the first quarter. pass and pan need the edge light running with them; a bare spot has no identity.
