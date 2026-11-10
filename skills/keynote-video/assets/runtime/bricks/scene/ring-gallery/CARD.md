---
id: ring-gallery
category: scene
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### ring-gallery

- **Purpose**: shows a whole catalogue as one object the viewer could browse, naming one item per step.
- **Intent**: Present a whole catalogue as one object the viewer could browse forever, naming one item per step, so the set feels complete and endless rather than a list that runs out.
- **Content**: 6–10 cards, each a stat-style tile with a label that doubles as the caption (en ≤ 18 chars, zh ≤ 8), an optional number (≤ 6 chars) and image; an eyebrow (en ≤ 24, zh ≤ 10) and a corner label (en ≤ 16, zh ≤ 8).
- **Fits**: `demo`, `proof`, `rest`. **Not for**: comparing items (one is legible at a time); fewer than six items; styles whose camera stays flat.
- **Layout and camera**: eight 340 × 460 cards on a ring of radius 700 px centred at 960, 470, seen from a fixed camera 9° above (perspective 2200 px); every card always faces outward and never mirrors (a face on each side). The card at the front pushes out 44 px and turns to its lit face; the rest darken with their distance round the ring (up to 70 %); a soft accent disc, a turning ring of ticks and a faint reflection put the ring on a floor. Under the ring a 120 px window rolls the caption: the index in the accent and the name at 72 px. Not a screen recording: the cards are a set of objects in space; let the dock-and-move rhythm carry it and keep each card's copy to a number and a name.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `cards` | list of tile-card `stat` items (`meta`, `value`, `label`, `image`?) | label primary (it is the caption) | 6–10 | label 3 words / 18 chars; value 6 chars | label 8 chars | numbers and titles from the sample copy |
  | `eyebrow` | text | glance | 1 | 3 words / 24 chars | 10 chars | `eyebrow` |
  | `corner` | text | glance | 1 | 16 chars | 8 chars | `label` |

- **Length**: 11.7 beats for eight cards (5.9 s at 120 BPM): 21 frames a step (8 frames docked, 13 moving) plus a last 8-frame dock; range 8–14; each card adds 1.4 beats. `loop: true` drops the last dock and the brake for a seamless loop (it then ends moving).
- **Steps and events**: the angle is half constant turn and half steps (a `smooth` change of place after each dock), so the ring never stops but docks every 45°; the caption rolls up during each move (T0 each); the constant half brakes over the last step so the ring lands still with the first card in front.
- **Needs**: prop `tile-card` (layout `stat`, a rest and a lit face per card); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `mono`.
- **Sound**: a soft `accent` on each dock; nothing else (it is a breathing loop).
- **Styles**: any with depth; not locked-camera styles. **Source**: adapted from video-shotcraft `demos/ui-entrance/carousel-3d/Carousel3D.tsx` (card `references/shots/ui-entrance/carousel-3d.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`. Surface: dom only (CSS 3D; the cards are canvases painted once).
- **Differs from upstream**: the last step brakes and a last dock holds the front card (upstream loops at frame 168); compare covers frames 0–147. Compare: pass (two cards, 9.8 px, RMSE 0.003, events ±0).
- **Pitfalls**: A steady ring has no beginning or end; as the main shot it reads flat, so lay a title or a camera move over it. Front and back faces must carry the same content; the ring never flips a card to reveal. The dimming by depth and the reflection are tuned for a dark ground; on white blend the dimming toward the ground and drop the reflection to about 5 %.
- **Sample**: `poster.jpg`, an English still 480 px wide.
