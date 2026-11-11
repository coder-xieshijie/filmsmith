---
id: flip-row
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### flip-row

- **Purpose**: turn a row of features into a run of results: each card's back answers its front with one number.
- **Intent**: "So what?" answered card by card: each feature turns over to show what it brought, so the row reads as a run of results.
- **Content**: 3–4 cards: front a name (≤ 14 chars, Chinese ≤ 6 characters) and a line (≤ 32 chars, Chinese ≤ 13); back one number (≤ 6 chars), a label (≤ 20 chars, Chinese ≤ 9) and optional before/after values; a headline.
- **Fits**: `demo`, `proof`. **Not for**: backs unrelated to their fronts, more than four cards, outcomes that need more than one number and a line.
- **Layout and camera**: a headline above a centred row of three or four portrait cards (front: name and one line; back, in the ink role: label, before/after bars, the number). The camera pushes in 1 → 1.03 over the scene; a soft reflection and contact shadows ground the row.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | eyebrow | text | glance | 1 | 3 words, 22 | 10 | Three features |
  | headline | text | primary | 1 | 5 words, 34 | 12 | Three tools, three results. |
  | barLabels | list of text | glance | 2 | 1 word, 8 | 3 | Before, After |
  | cards[].name | text | primary | 3–4 | 2 words, 14 | 6 | Drafts … |
  | cards[].desc | text | glance | 3–4 | 7 words, 32 | 13 | One line in, a first cut out. |
  | cards[].value | number | claim | 3–4 | 6 | 6 | 3× |
  | cards[].label | text | glance | 3–4 | 4 words, 20 | 9 | faster first cut |
  | cards[].before / after / ratio | text, number | glance | optional | 2 words, 8 | 5 | 48 min / 16 min / 0.33 |

- **Length**: 8–12 beats (4–6 s); the last label's read time decides the hold.
- **Steps and events**: beat 0 the headline rises; from frame 22 each card turns (−10° wind-up over 4 frames, over to 194° in 16 on bezier 0.55, 0, 0.3, 1, a spring back to 180°), 12 frames apart (T2 each); the number on each back springs 1.08 → 1 as it lands; the last card settles, then a held read.
- **Needs**: no motion bricks (the turn is drawn here, the curve device-flip's `over` variant now carries); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `text`, `mono`.
- **Sound**: `turn` on each card's turn, `land` on each number, `accent` on the last.
- **How not to look like a screen recording or a string of effects**: the backs must answer the fronts (feature → result, same order); keep one number per card and let the stagger carry the rhythm. Do not add other moves between the turns: the row turning in sequence is the whole scene.
- **Styles**: any; avoid `strip` (its flat bands fight the 3D turn).
- **Source**: adapted from video-shotcraft `demos/transition/card-flip-reveal/CardFlipReveal.tsx` (card `references/shots/transition/card-flip-reveal.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: brand, wordmark and copy removed (slots); colours by role (back in ink with ground type); the card turn drawn in 96 perspective strips on Canvas2D. Compare passes (deviation 7.6 px, events ±0).
- **Pitfalls**: Front and back must be a cause and its result; an unrelated back makes the flip a decorative swap. A soft snap on each card's landing makes the run read as a rhythm.
