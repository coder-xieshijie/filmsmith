---
id: slam-drop
category: motion
tier: T2
family: zoom-depth
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### slam-drop

- **Looks**: A card hangs close to the camera, large, tilted 5 degrees and soft with depth blur; it drops with an accelerating ease-in, overshoots to 0.965 and settles to 1 in its place; on the landing frame a ring opens from its centre, shards and sparks fly out, the frame flashes and shakes for five frames over a filled ground. `slot`: the card hangs over its empty slot, drops with a squash, a pressure disc opens under it and three frames later its neighbours are knocked out 34 px and tilted, then spring back. `fall`: the card falls from above the frame into its slot with a smaller ring and sparks (one hit of a combo).
- **Tier**: T2. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: a heavy card landing: the headline number, the result, the one feature that matters; `slot` when the page already has neighbours, `fall` for a row of hits that land one after another. **Not for**: more than two landings a film; calm, editorial or paper styles (use `plate-slip`); text that must be read while it falls.
- **Intent**: The card lands with weight: the viewer feels it is heavy, and in the slot drop sees the force travel to its neighbours.
- **Content**: One card in the scene (its rect), usually a headline number or result; for slot, the rects of its neighbours already on the page.
- **Parameters**: `from` (the scene without the card: default the sample grid with its fifth card skipped), `to` (the scene with the card; the card is cropped from it at `rect`), `drop` `camera` | `slot` | `fall` (default `camera`), `rect` [x, y, w, h] (the card, default `gridRect(4)`), `neighbours` (rects of `to` pushed in `slot`, default the cards either side), `fall` 980 px (height of the fall in `fall`), `dark` false (sparks and ring tuned for a dark ground). Exports `spring(t, damping, stiffness)`, `DROPS` (the three drops in frames) and `burst(ctx, k, [x, y], D, colors, { seed, dark })` for scenes that land several things. Roles read: `ground` (fill under the shake), `panel` and `accent` (shards), `paper` and `accent` (ring and sparks), `ink` (contact shadow).
- **Theory**: Weight is read from acceleration into the contact: an ease-in is a slam, an ease-out a set-down (Thomas & Johnston, timing); the burst on the contact frame is game feedback for a hit (Vlambeer, "screenshake"), and the neighbours knocked three frames later show the force travelling (Michotte, launching effect).
- **Styles**: pulse, tally, plakat; never ink, dossier, blueprint, stream or thread (a shaking, sparking landing breaks a quiet material).
- **Length and easing**: 2.4 beats (`camera`, 36 frames at 120 BPM), 2–4.4; `slot` 66 frames, `fall` 30 frames (`beatsFor` follows the drop). Hover then drop on an ease-in, landing on the spring (mass 1, the closed form of Remotion's spring); ring out-expo over 16 frames; shake dies in 4–5 frames; neighbours on a spring over 40 frames.
- **Sound**: `land` on the landing frame with the hit; in `slot` a second, softer `land` when the neighbours are knocked.
- **Merged from**: `impact-burst-kit` (the `slot` drop), `hit-counter` (one hit as the `fall` drop; the hit-stop is a variant of `time-freeze`, the combo counter a planned scene `combo-hits`).
- **Source**: adapted from video-shotcraft `demos/effects/slam-entrance-moves/ScoreSlam.tsx` (card `references/shots/effects/slam-entrance-moves.md`); adapted from video-shotcraft `demos/effects/slam-entrance-moves/ImpactBurstKit.tsx` (card `references/shots/effects/slam-entrance-moves.md`); adapted from video-shotcraft `demos/effects/impact-feedback/HitCounter.tsx` (card `references/shots/effects/impact-feedback.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the card's words are the scene's).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: stadium lights, score digits with their second landing, the badge and the title are the scene's; the ring, shards and sparks are in the palette's roles; hit-stop is left to the time bricks; motion blur comes from the tracked corners. Compare (camera drop against `score-slam`): pass, track 12.8 px, progress RMSE 0.012, events ±1 frame.
- **Don't**: land more than two cards a film with it, or use the shake anywhere else in the same film: camera shake as a habit is a known AI tell, here it is the one hit; no sparks on a calm product.
- **Pitfalls**: At most two slams a film counting perspective-fling; one source of shake per shot. In slot, the neighbours must have been still for at least 15 frames before they are knocked, or the cause is lost. The ring needs contrast: a saturated ring over a white pressure disc on light grounds, a white core with a coloured glow on dark (set dark). The landing wants a boom on the same frame; silent, the burst reads as a twitch.
