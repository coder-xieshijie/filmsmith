---
id: attention-hop
category: motion
tier: T2
family: vertical
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### attention-hop

- **Looks**: One icon crouches and hops: four jumps, each higher than the last (0.35, 0.6, 0.85 and 1.2 times its height), squashing on every landing and stretching with speed, a ripple and a splash on the ground and a contact shadow that shrinks as it rises; meanwhile the camera is drawn in toward it (1 → 1.08) and the rest of the screen goes soft and fades by 40 %; after the last landing it settles with a damped wobble.
- **Tier**: T2. **Family**: vertical. **Surface**: canvas.
- **Use**: introducing one new feature or app as a performer at half-screen size, before it opens its panel. **Not for**: small icons in a corner (no one sees the performance); text; more than once a film; serious or editorial films.
- **Intent**: A new feature asks to be noticed, louder each time, so the viewer looks at it before it opens.
- **Content**: One icon or app tile in the scene (its rect), shown large (about half the screen); no text.
- **Parameters**: `from` (the scene, default the grid), `rect` (the icon, default `gridRect(4)`; cropped and its place filled with the ground while in the air), `radius` 22, `push` [0.015, 0.065] (camera push before and during the hops), `focus` null (the push centre; null: the icon), `defocus` 7 px (blur of the rest), `seed`. Roles read: `ground` (the hole), `dim` (ripple and splash), `ink` mixed with black (contact shadow).
- **Theory**: The Dock bounce of desktop systems played as a performer: rising jumps read as a voice getting louder; air time in proportion to the square root of the height keeps one gravity (a projectile), squash and stretch give it weight (Thomas & Johnston); the rack focus and the push act out the viewer being drawn in.
- **Styles**: any; avoid ink, dossier and blueprint.
- **Length and easing**: 8 beats (120 frames at 120 BPM), 6–8. Jumps start at frames 12, 28, 48 and 72 (14, 18, 22 and 26 frames of air); last landing 98, settle by 120; push `smooth`.
- **Sound**: `accent` on each of the first three landings, `land` on the last.
- **Source**: adapted from video-shotcraft `demos/effects/icon-performance-moves/AttentionBounce.tsx` (card `references/shots/effects/icon-performance-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the dock, window light, badge, run dot and the feature panel are removed (the scene's next step); the neighbours are the rest of the scene, softened as a whole; motion blur comes from the tracked corners. Compare against `attention-bounce`: pass, track 0.1 px, events 0.
- **Don't**: let the rest of the film bounce: springs that overshoot and wobble on everything are an AI tell; the hop is one performer once.
- **Pitfalls**: Leave headroom: the last hop rises 1.2 times the icon height plus the push; measure the top margin or it leaves the frame. A small icon gets lost: the hop only reads at about half-screen size. Each landing wants a rising "duk"; silent hops lose half their weight.
