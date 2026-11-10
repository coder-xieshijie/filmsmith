---
id: ground-flip
category: motion
tier: T3
family: shape
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### ground-flip

- **Looks**: On a light frame an aurora of soft light rises slowly from the foot of the frame and grows; the line on screen blurs and drifts away; then in about a third of a second the whole ground drops to near black and the aurora is pressed down into a low afterglow, its pale fringe gone; after an empty beat the next line blurs in on the dark.
- **Tier**: T3. **Family**: shape. **Surface**: canvas.
- **Use**: the turn of a story told by the ground itself: before and after, "for years …" → "now …", the one accent of a calm film. **Not for**: a film already dark, or with more than one change of ground; a turn that is not the story's main one; fast films (the build is two thirds of it).
- **Intent**: The whole ground drops from light to dark after a long build, so the viewer feels the story turn before reading the next line.
- **Content**: Two lines: the before line on the light ground and the after line on the dark (≤ 30 chars each), usually a "for years …" / "now …" pair.
- **Parameters**: `from` (the scene on the light preset, default the long title, 120 px en / 104 px zh so the Chinese line does not orphan), `to` (the scene drawn on the dark preset, default the claim), `toPalette` `neutral-dark` (a palette id or a roles object), `blur` 32 px (lines out and in), `rise` 24 px (their drift). The aurora is the `afterglow` look's `bloom` texture. Roles read: `ground` of both presets, `accent` (the aurora, mixed toward the dark preset's), `paper` (its fringe).
- **Theory**: A change of ground is the largest luminance change a frame can make, so made fast after a long build it is the strongest accent available (von Restorff isolation; the build is anticipation); the empty gap before the next line lets the eye take the change before reading (Mayer, segmenting).
- **Styles**: any style with a light and a dark preset, and `afterglow`; never ink, halftone, dossier or phosphor.
- **Length and easing**: 10.4 beats (156 frames at 120 BPM), 8–11. Rise 4–56 % cubic out; old line out 40–58 % ease-in quad; ground flip 57–64 % in-out quad; aurora squash on `overshoot`; new line in 70–86 % quint out.
- **Sound**: `land` on the flip frame, where the bed can enter its `drop` section; nothing in the gap.
- **Source**: adapted from video-shotcraft `demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip.tsx` (card `references/shots/effects/aurora-bloom-bg-flip.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the lines are the scenes'; Chinese uses the title scene's Chinese size and leading).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the two grounds are the light and dark presets of one look; the aurora is the `afterglow` bloom in the accent with soft elliptical gradients instead of a 60 px blur; the lines blur out and in as wholes (word-by-word staggers are the text bricks'); the top light, sky light, vignette and grain are the style's. Compare against `aurora-bloom-bg-flip`: pass, track 11.5 px, progress RMSE 0.003, events ±1.
- **Don't**: tint the aurora in a second colour: violet-to-cyan glows on black are a known AI tell; it is the accent only, and one flip a film.
- **Pitfalls**: Leave the gap: the new line comes after the flip with an empty beat, never cross-faded with the old one. Once a film, as the main turn; never in the same film as whiteout-slam. Recolour the aurora as a whole with the line colours; changing only the text colour detaches it from the ground.
