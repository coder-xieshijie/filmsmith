---
id: versus
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### versus

- **Purpose**: settle a comparison in one hit: a question, then the two answers slam shut against each other, each a number.
- **Intent**: A comparison settled in one hit: the old way and the new slam together, each a number, so the gap is felt as a clash rather than read in a table.
- **Content**: A question (≤ 24 chars, Chinese ≤ 9 characters), two sides each with a name, a number and unit (≤ 3 digits), a caption (≤ 46 chars, Chinese ≤ 13) and 0–4 items; a 1–3 character mark and an optional verdict.
- **Fits**: `problem`, `turn`, `proof`. **Not for**: more than two sides, sides without a number, a gentle contrast.
- **Layout and camera**: the question centred on the ground while the seam is drawn through it; the two halves (left in the ink role, right in the accent) rush in from the frame's sides and shut on the vertical seam; each half carries its name, a huge number and unit, then its caption and a short list; a paper stamp with the mark presses between them and a verdict pill closes. A 1 → 1.015 push after the hit.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | eyebrow | text | glance | optional | 4 words, 24 | 8 | Two ways to ship |
  | question | text | primary | 1 | 5 words, 24 | 9 | What does a cut take? |
  | sides[].name | text | glance | 2 | 3 words, 16 | 7 | By hand / With Tidewell |
  | sides[].value, unit | number, text | claim, primary | 2 | 3; 1 word, 7 | 3; 3 | 14 days / 1 prompt |
  | sides[].caption | text | glance | 2 | 8 words, 46 | 13 | Drafts, reviews and three rounds of fixes. |
  | sides[].items | list of text | glance | 0–4 | 2 words, 14 | 4 | Draft, Review, Fix, Repeat |
  | mark | text | word | 1 | 1 word, 3 | 2 | VS |
  | verdict | text | primary, claim | optional | 7 words, 40 | 16 | Ship the cut you meant |

- **Length**: 6–10 beats (3–5 s): the captions' and verdict's reads.
- **Steps and events**: frame 1 the question rises; frame 18 the halves set off (turn); frame 28 the hit: flash, shake, ring, speed lines, stamp (T3, land); +8 and +14 the captions and lists (left first, right 4 frames later); +26 the verdict (accent).
- **Needs**: motion `split-open` with its close variant (`close`, `impact`, `hit: 0.62`); roles `ground`, `ink`, `dim`, `accent`, `onAccent`, `paper`, `onPaper`; type `display`, `text`, `mono`.
- **Sound**: `turn` as the halves set off, `land` (a heavy one) on the hit, `stamp` with it, `accent` on the verdict.
- **How not to look like a screen recording or a string of effects**: one hit per film; let the numbers do the arguing (one number per side, same unit family) and keep the lists to what the number counts.
- **Styles**: any.
- **Source**: adapted from video-shotcraft `demos/transition/transition-hidden-cut/VersusSlam.tsx` (card `references/shots/transition/transition-hidden-cut.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the 78° slanted seam becomes split-open's vertical one; brand and copy removed. Compare waived: the halves enter from the frame's edges (track deviation 280 px from the slant) and the SSIM drop is the content; progress RMSE 0.006, events ±1.
- **Pitfalls**: Only for a real two-sided contrast; without one, the slam is just a slanted wipe. Counts as the film's loud hit: keep it away from other flash or impact transitions.
