---
id: beat-list
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### beat-list

- **Purpose**: make a run of names felt on the beat: one word a beat, each caught in a lens that changes the whole frame's tone.
- **Intent**: A run of names felt rather than read: one word a beat, each catching the lens and retinting the whole frame, so the list becomes a metronome.
- **Content**: A lead of 1–3 words (Chinese ≤ 4 characters), 5–10 one-word items (≤ 10 chars, Chinese ≤ 3 characters), a counter label and an optional tagline (≤ 28 chars, Chinese ≤ 12 characters).
- **Fits**: `hook`, `demo`, `rest`. **Not for**: items that need a line each, fewer than five items, films without a steady beat.
- **Layout and camera**: a lead word on the left, a vertical list of words on the right that steps up one row a beat; a pill fixed mid-frame is the lens: the word in it takes a new face (the look's roles and weights) and a new tone on a ladder from ink to accent, and the ground leans toward the pill's tone. A counter and the tone swatches sit at the foot; the tagline closes. No camera move.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | lead | text | primary | 1 | 3 words, 12 | 4 | Made for |
  | words | list of text | word | 5–10 | 1 word, 10 | 3 | Drafts, Reviews, Renders … |
  | counter | text | glance | 1 | 1 word, 8 | 3 | Step |
  | tagline | text | glance | optional | 5 words, 28 | 12 | (sample copy) |

- **Length**: 6–12 beats (3–6 s): 2 beats of lead-in, one jump every `every` beats (default 1), the tagline's read.
- **Steps and events**: each jump takes the first 6 frames of its beat (`1 − (1 − x)^3.2` with a small squash) and the rest of the beat stands still (T1 each); the last jump lands (T2).
- **Needs**: no motion bricks; roles `ground`, `ink`, `dim`, `accent`; type `display`, `text`, `mono`.
- **Sound**: `accent` on every jump, `land` on the last; the bed should have a clear kick on the beat.
- **How not to look like a screen recording or a string of effects**: put the jumps exactly on the film's beats (`every` in beats, never in seconds) and keep every other thing still; the tone ladder stays inside the look, so the frame changes by one step, not by theme.
- **Styles**: any.
- **Source**: adapted from video-shotcraft `demos/rhythm/beat-step-list-theme-cycle/BeatStepListThemeCycle.tsx` (card `references/shots/rhythm/beat-step-list-theme-cycle.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: five upstream themes become one ladder inside the look (ink to accent); the words are slots. Compare waived: SSIM drop 0.19 (the upstream's themes jump between light and dark) and a constant 38 px offset (centred on the film's own word widths); progress RMSE 0, events ±0.
- **Pitfalls**: Sound-dependent: put every jump on a kick of the bed; without the beat it reads as the UI twitching. Jump in the first frames of the beat and hold still for the rest; a smooth scroll is just a list. Give more words than jumps (beats + 2), or the list visibly runs out at the end.
