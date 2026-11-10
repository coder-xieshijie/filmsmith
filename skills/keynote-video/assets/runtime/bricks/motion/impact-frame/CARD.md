---
id: impact-frame
category: motion
tier: T3
family: zoom-depth
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### impact-frame

- **Looks**: the camera eases back about 1.5 % (6 frames), then crashes into one card, accelerating (6 frames, ease-in) until the card nearly fills the frame; on the stop three frames hit: the whole picture turns into a hard grey negative, two tinted negatives (the accent and its complement) are screened over it about 8 px apart, and thick and thin focus lines strike in from outside the frame toward a clear ellipse round the card, new lines every frame; on the fourth frame all of it is gone and the clean close-up shakes (6 px, dying in about 12 frames) while the rest of the screen, veiled, eases from 0.22 to 0.1.
- **Tier**: T3. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: the film's single hit: a card, a number or a word that is the climax, landing on the drop. **Not for**: anything but the one peak (a second one makes the punch a habit); paper and ink styles (use `plate-slip`, the printed hit); calm or serious products, where the game-and-anime language reads as a joke.
- **Intent**: The film's one hit lands with force: three negative frames bite into time, so the viewer feels the blow rather than sees a picture.
- **Content**: The scene and one target card in it (its rect): a card, a number or a word that is the climax; no extra text.
- **Parameters**: `from` (the scene's painter; the brick draws it under its camera), `rect` [x, y, w, h] (the card the punch lands on, film px; default the sample grid's second card), `scale` (null: fit the card into `fill` 0.92 of the frame), `push` true (false: no wind-back or crash, the impact hits the scene in place), `lines` `{ thick 34, thin 22 }`, `split` 8 px, `shake` 6 px, `veil` [0.22, 0.1] (outside the card after the hit, start and rest), `vignette` 0.3, `seed`. Roles read: `ground` (veil and vignette, mixed with black), `accent` (one split ink; the other is its complement), `paper` and `onPaper` (the focus lines), `onPaper` mixed with black (the impact ground).
- **Theory**: impact frames of Japanese animation: two or three frames of inverted, line-struck picture are shorter than the eye's integration time (about 100 ms), so they read as force rather than as a picture; the wind-back is anticipation (Thomas & Johnston); the shake afterwards is game feedback for a hit (Vlambeer, "screenshake") and dies inside half a second so the close-up is read still.
- **Styles**: pulse, phosphor, any loud style with a dark or white ground; never ink, halftone, dossier, blueprint or stream (the negative breaks a paper or night material).
- **Length and easing**: 2.5 beats (38 frames at 120 BPM), 2–3; wind-back frames 0–6 `smooth`; crash 6–12 ease-in cubic (0.55, 0.055, 0.675, 0.19) with motion blur from the card's corners; impact frames 12, 13, 14, hard, no blur; shake from frame 15, 6 px · e^(−t/2.2); veil `out` from frame 15 to the end. At other lengths the phases scale with it (keep the impact at 2–4 frames).
- **Sound**: `turn` under the crash (a short rising whoosh), `land` and the hit on the first impact frame with the drop; nothing new for a beat after.
- **Source**: adapted from video-shotcraft `demos/effects/impact-feedback/AnimeImpact.tsx` (card `references/shots/effects/impact-feedback.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the scene's own words are pushed and inverted with it).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the overview's creep (1 → 1.012) and the constant vignette are the style's, so the wind-back starts at 1; the split inks are the accent and its complement instead of red and cyan, screened at 0.55; the two crash copies and the sharp centre layer are replaced by sub-frame motion blur from the card's corners. Compare: waived on the SSIM drop only (the impact frames are negatives of different content: the neutral grid against the upstream dashboard); the camera track matches to 4.2 px, progress RMSE 0.006, events ±0 frames.
- **Don't**: use it twice, or without a sound on the hit (a silent negative reads as a broken frame); flash frames and RGB splits as filler between scenes are a known AI tell (`ai-tells.md`): this is one hit on the climax, nothing else.
- **Pitfalls**: Once a film, at the peak; a second one makes the punch a habit. Never with whiteout-slam or plate-slip in one film. The negative frames must land with an impact sound on the same frame; silent, they read as a broken frame. Do not stack it with another time remap (freeze, speed ramp) in the same shot.
