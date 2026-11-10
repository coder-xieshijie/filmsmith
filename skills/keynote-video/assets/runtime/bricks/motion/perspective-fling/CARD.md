---
id: perspective-fling
category: motion
tier: T2
family: horizontal
energy: high
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### perspective-fling

- **Looks**: A card is flung in from the left at speed, huge and bent in a fish-eye perspective (rotated 62 degrees on a tilted axis, scale 1.8, the lens at 260 px); as it brakes the lens lengthens and the card flattens, the pose landing a little after the position; at the stop it overshoots 6 degrees and snaps flat, the frame shakes for two frames and a ring of focus lines strikes for nine frames while speed streaks fade behind it.
- **Tier**: T2. **Family**: horizontal. **Surface**: dom (CSS 3D, with a canvas overlay for streaks and focus lines).
- **Use**: one hero card arriving with flair: the launch card, the release, the feature everyone came for. **Not for**: serious or editorial films; more than one per film; cards that must be read while they fly (the text lands with the card).
- **Intent**: The hero card arrives with flair: the bent lens says speed and nearness, and the snap flat says "it's here".
- **Content**: One card in the scene (its rect), e.g. a launch or KPI card; its text is read only after it lands.
- **Parameters**: `from` (the scene without the card, default the grid with its fifth card skipped), `to` (the scene the card is cropped from), `rect` (the card, default `gridRect(4)`), `dx` −1350 (where the fling starts, px from its place; positive flings from the right), `lines` 48 (focus lines in the ring), `shake` 8 px. Roles read: `ground`, `ink` (shadow), `paper` (streaks and lines), `accent` (every fourth line).
- **Theory**: Kanada-style animation: an exaggerated lens on a fast object reads as speed and nearness, and the snap to flat on the overshoot is the accent ("the slap is in the rebound"); a pose that lands later than the position is drag (Thomas & Johnston, follow-through).
- **Styles**: pulse, plakat; never ink, dossier, blueprint, stream or split.
- **Length and easing**: 2.4 beats (36 frames at 120 BPM), 2–3. Position `snappy` with a small dip, 0–18; pose and lens on a later curve (0.62, 0, 0.3, 1); overshoot on a spring 18–36; shake frames 18–19; focus lines 18–27.
- **Sound**: `turn` under the fling (a short whoosh), `land` on the snap.
- **Source**: adapted from video-shotcraft `demos/effects/slam-entrance-moves/KanadaPerspectiveSnap.tsx` (card `references/shots/effects/slam-entrance-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the artwork, poster type band and hold push are removed; the card's own text follow-through (late slide, skew) is the scene's; motion blur comes from the tracked corners (a CSS blur while fast) instead of a horizontal-only blur. Compare against `kanada-perspective-snap`: pass, track 5 px (the upstream points projected through its computed 3D matrix), events 0.
- **Don't**: add the shake or the focus lines to other entrances in the film; speed lines on every move read as a template.
- **Pitfalls**: Its shake counts as the shot's one source of shake: no other slam or impact in the same shot. At most two slams a film counting slam-drop; more and none of them hit. The snap wants a "pak" on the same frame; silent, it loses its accent.
