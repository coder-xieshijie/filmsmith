---
id: scroll-wall
category: scene
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### scroll-wall

- **Purpose**: says "there is far more than we can show you" in a few seconds: a standing wall of pages that keeps flowing, read as volume, never as detail.
- **Intent**: Say 'there is far more than we can show you' in a few seconds: a standing wall of pages keeps flowing past, read as volume, never as detail.
- **Content**: 9–15 distinct card-level crops of the film's pages (not whole pages), none repeated across columns; no text slots, the crops only need to look like real pages.
- **Fits**: `demo`, `rest`, `proof`. **Not for**: reading a page; fewer than nine distinct cards; a second time in one film.
- **Layout and camera**: three columns 420 px wide, 26 apart, on a wall tilted back (perspective 1000 px, rotateX 20°) inside a layout box zoomed 1.2 → 1.272 over the shot (a linear push), so the cards are laid out at their shown size. Columns loop at 12, 9 and 14 s per period, the middle one downward; they brake to a stop over the last 20 frames. The far end is darkened (air), the top and bottom fade into the ground, a vignette closes the frame. Not a screen recording: no page is ever centred or followed; the motion is the wall's, the camera only creeps; use it as one beat of breadth, then hand over to a single-card scene.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `items` | list of the film's page crops (`image`, card-level, not whole pages) | — | 9–15, none repeated across columns | — | — | ten neutral page cards (tile-card cover, stat and note layouts on the paper role, at the upstream captures' proportions) |

- **Length**: 10 beats (150 frames, 5 s at 120 BPM); range 8–12 (the flow has no events: trim the length to the passage).
- **Steps and events**: none; constant flow and push, brake from frame 130, still at 150.
- **Needs**: prop `tile-card` (`faceCanvas`, `cardItems`); roles `ground`, `paper`, `onPaper`, `accent`; type `display`, `text`, `mono`.
- **Sound**: a bed; no hits.
- **Styles**: any dark ground; avoid strip, split, dossier. **Source**: adapted from video-shotcraft `demos/ui-entrance/page-waterfall-wall/PageWaterfallWall.tsx` and `VerticalTicker.tsx` (card `references/shots/ui-entrance/page-waterfall-wall.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (the card copy only). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (neutral-dark).
- **Differs from upstream**: the page captures are the film's crops or neutral page cards; the columns brake at the end (upstream loops to the cut); grain is dropped. Compare: waived (the upstream's captures are not shipped, so its columns collapse to empty images in the probe render; the brick's track was checked against its own DOM boxes, exact at p 0, 0.3, 0.6 and 1).
- **Pitfalls**: Each column's crops must be taller than the visible wall, or the same crop shows twice on screen. Do not reuse a crop across columns; the same image in two columns reads as thin material. It is an atmosphere shot: text on the crops only needs to look real; to have one page read, hand over to a single-card scene. Once per film; a second waterfall reads as padding.
- **Sample**: `poster.jpg`, an English still 480 px wide.
