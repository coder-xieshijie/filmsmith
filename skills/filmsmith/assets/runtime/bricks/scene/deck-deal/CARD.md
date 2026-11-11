---
id: deck-deal
category: scene
energy: high
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### deck-deal

- **Purpose**: builds the first impression of volume with suspense: a pile (what is it?), then the answer (dozens of items flying into their places on a page, faster and faster), then the full board held.
- **Intent**: Build the first impression of volume with suspense: a pile raises 'what is it?', then dozens of items fly into place faster and faster, so the viewer feels content pouring in.
- **Content**: 10 distinct card crops from the film (real page or item slices; 16 more are dealt from the same ten), a two-line title (en ≤ 26 chars, zh ≤ 10), a count label (en ≤ 22, zh ≤ 9) and the board's page title (en ≤ 14, zh ≤ 6).
- **Fits**: `demo`, `proof`, `climax` (the climbing part of a film). **Not for**: the opening shot; fewer than ten distinct cards; reading a card; calm passages.
- **Layout and camera**: a page board (1216 wide, 3782 long, the paper role) on a dark table (gradients of the ground), the pile on the table to its right. The camera is one spline: a low, slanted close-up circling the pile (0–30), a pull back to face the top of the board (62), a chase down the board while rising, tilting back and turning (86), into a runway view where the whole board runs diagonally away with all 26 cards in frame, shifted right 300 px to leave room for the title (110), then a 1.5 % creep. A light opens from the pile over the board 34–64; the far end is darkened in the runway view. Not a screen recording: the camera never faces a page squarely for long; the cards are objects (a pile with weight, an arc, a ghost, a shadow that lags); cut after the hold.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `cards` | list of the film's card crops (`image`; 16 more are dealt from the same ten) | — | 10 | — | — | ten neutral cards (tile-card cover and note on the paper role) |
  | `title` | text, set in two lines (bold, light) | primary, claim | 1 | 6 words / 26 chars | 10 chars | `claim` |
  | `count` | text after the landed count | glance | 1 | 3 words / 22 chars | 9 chars | `eyebrow` |
  | `page` | text (the board's page title) | glance | 1 | 2 words / 14 chars | 6 chars | the second nav item |

- **Length**: 10 beats (150 frames, 5 s at 120 BPM); range 9–11.
- **Steps and events**: orbit 0–28; anticipation 26–36 (the pile presses 48 px, the top card pulls back 30 px: past the visible threshold); the deal from 36, card k at 36 + 4k − 0.0792·k(k−1) (4 frames apart, closing to 0.2), each an 8-frame dive with a 110 px arc and a 1.06 peak, a 4-frame overshooting settle and a press, a blurred ghost behind, its shadow settling 3 frames after the card; the title rises word by word from 100 and the count row (tracking the landed cards) from 90; hold 110–150.
- **Needs**: prop `tile-card` (`faceCanvas`, `cardItems`); helper `riseText` (stagger-in); roles `ground`, `paper`, `onPaper`, `ink`, `dim`, `accent`; type `display`, `text`, `mono`.
- **Sound**: a big whoosh on the pull-back and the first deals (beat 2.4), fast whooshes as the deal accelerates; landings as two alternating samples stepping down in level, fading into one swoosh when too dense; nothing per card.
- **Styles**: dark grounds; avoid strip, split, dossier. **Source**: adapted from video-shotcraft `demos/ui-entrance/deck-deal-flyin/DeckDealFlyin.tsx` (card `references/shots/ui-entrance/deck-deal-flyin.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (neutral-dark).
- **Differs from upstream**: the page captures and the projects page are the film's crops or neutral cards and a neutral page; the brushed-metal noise tile is dropped (the table is gradients); the mark, tagline and count label are slots; grain is dropped; the camera-motion blur of the fast segment is not added (the per-card ghosts stay). Compare: pass (first and last cards, 0 px, events ±0).
- **Pitfalls**: Use real page or item slices for the cards; hand-made fake cards read as fake at once. Keep the accelerating stagger; all cards flying at once reads as an explosion. Compute the anticipation in pixels, not as a share of the move; at the far camera a textbook ratio is too small to see. Do not open the film with it; it needs a lead-in to tell where the pile comes from.
- **Sample**: `poster.jpg`, an English still 480 px wide.
