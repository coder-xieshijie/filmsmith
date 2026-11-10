---
id: segment-reveal
category: motion
tier: T3
family: mask-type
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### segment-reveal

- **Looks**: A dark ground; a few unconnected fragments of letters flicker on one by one in a shuffled order, sparse at first and faster and faster, each striking like a neon tube (on, off, on, half, on) and settling at half light, while the ground behind brightens with the share lit; nothing is readable. Then a held breath of about half a second, three key pieces land on the beat, and on the last the whole word surges to full light (a 2 % pulse, a burst of glow) and holds, readable at last. The camera pushes in 3.5 % throughout.
- **Tier**: T3. **Family**: mask-type. **Surface**: canvas.
- **Use**: the hook of an opening, when recognising the word is the moment: a product name, one short word, a big number. Once a film. **Not for**: text that must be read at once (claims, labels); more than one line; light or busy grounds, where half-lit pieces do not read as light.
- **Intent**: Hold back recognition to make a hook: the viewer sees only mysterious pieces until the key ones land, and the moment the word is recognised is the payoff.
- **Content**: One short word the viewer already knows (a product name, SHIP, LIVE, a big number): en 4–6 letters best, zh 2–4 chars; no other text.
- **Parameters**: `text` (one word; default the sample copy's last step, "Ship" / "发布"), `size` (en 360, zh 320), `weight` 700, `y` (baseline; null centres the ink), `cuts` [columns, rows] per grapheme (en [2, 3], zh [3, 3]), `gap` 4 px (the gap cut along each piece's edges), `push` 0.035, `glow` 1, `seed` 3 (the cut positions and the order). Roles read: `ground`, `accent` (the tube, its glow, and mixed with white for the hot core).
- **Theory**: Recognition is the hook: a figure missing its diagnostic parts is not recognised, and is at once when they arrive (recognition by components, Biederman 1987); holding the key strokes back keeps the viewer in an open question until the reveal (the title sequence of *Alien*, 1979).
- **Styles**: any dark style with one luminous accent; not ink, dossier, plakat or halftone (no light sources on paper).
- **Length and easing**: 8.53 beats (128 frames at 120 BPM), 7–10; pieces start at frame 12 spread over 60 frames on `out` (sparse to dense), keys at 86, 93, 99, reveal at 105 on `snappy` over 8 frames, surge 3 frames up and 19 down on `out`; push on `smooth`.
- **Sound**: `accent` ticks on the pieces (a few, not all), nothing in the breath, `land` on each key, the hook peak (`stamp` or the bed's hit) on the reveal.
- **Source**: adapted from video-shotcraft `demos/opening/stroke-segment-build/StrokeSegmentBuild.tsx` (card `references/shots/opening/stroke-segment-build.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the pieces are cut from the font's own glyphs, so Chinese characters fragment the same way; zh cuts 3 × 3 because a character is wider and denser than a letter).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the pieces are cells of the font's glyphs (slanted seeded cuts, the key pieces the most inked middle-row cells) instead of 16 hand-drawn single-line neon tubes for one brand word, so they are filled shapes, not tubes; the wall, the floor reflection and the subtitle are the scene's. Compare against `stroke-segment-build` on the share of pieces lit: progress RMSE 0.027 and events ±0 pass; track deviation waived (the share is quantised by 16 tubes upstream and 24 pieces here; the 62.5 is one upstream tube at frame 72).
- **Pitfalls**: The word must be one the viewer already knows; a made-up word has no moment of recognition. Keep it short; long words make the unreadable stretch hard to control and the pieces explode in number. For the reveal let the lettering's own glow surge; a separate radial glow makes a dirty spot in the middle of the word. Once per film.
