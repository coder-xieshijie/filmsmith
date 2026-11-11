---
id: three-angles
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### three-angles

- **Purpose**: one subject seen whole, closer and in one detail, then the detail eats the frame and carries the claim.
- **Intent**: One subject seen whole, closer and in detail, cut in like comic panels on the beat, and the detail grows into a poster that carries the claim.
- **Content**: One subject (vector or high-resolution), three captions of kicker plus text (≤ 16 chars, Chinese ≤ 6 characters), a headline (≤ 24 chars, Chinese ≤ 10) and an optional subline.
- **Fits**: `demo`, `climax`, `claim`. **Not for**: three different subjects (use quad-montage), subjects without a detail worth a close-up, quiet editorial films.
- **Layout and camera**: the subject full frame, cut by two slanted seams into three comic panels on three beats (whole, closer, one detail); a paper caption box is stamped on each panel's top-left corner (tracked from panel-carve); after a held beat the third panel eats the frame, a ground shade comes in from the left and the headline rises over it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | subject | brick | – | optional | – | – | the sample page |
  | captions[].kicker | text | glance | 3 | 3 words, 14 | 6 | 01 · Wide |
  | captions[].text | text | primary | 3 | 3 words, 16 | 6 | The whole page |
  | eyebrow | text | glance | optional | 3 words, 22 | 8 | Three angles |
  | headline | text | primary, claim | 1 | 5 words, 24 | 10 | Ship the cut you meant |
  | subline | text | glance | optional | 7 words, 40 | 14 | Every render, checked before it ships |

- **Length**: 9–12 beats (4.5–6 s): the carve to frame 80, the headline from 82, the read.
- **Steps and events**: frames 20, 24, 28 the panels pop (T1 each) and their captions stamp 7 frames later (1.25 → 1, overshoot, tilts −2°, 1.5°, −1.5°); frame 66 the eat (T3); frame 82 the headline rises line by line (land).
- **Needs**: motion `panel-carve`; roles `ground`, `ink`, `accent`, `paper`, `onPaper`; type `display`, `text`.
- **Sound**: `accent` on each panel, `turn` on the eat, `land` on the headline.
- **How not to look like a screen recording or a string of effects**: the three panels must be three framings of one moment (wide, close, detail), never three moments; the captions name what each framing shows, not what the product does.
- **Styles**: any.
- **Source**: adapted from video-shotcraft `demos/rhythm/panel-grid-moves/ComicPanelSplit.tsx` (card `references/shots/rhythm/panel-grid-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the vector lens, brand and copy removed; captions clipped to their panels so the eating edge covers them. Compare passes (deviation 0 px).
- **Pitfalls**: All three panels show the same subject; different contents read as a bento layout. Cut on the beat with a click per panel; once per film.
