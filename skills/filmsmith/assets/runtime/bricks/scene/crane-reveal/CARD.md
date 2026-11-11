---
id: crane-reveal
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### crane-reveal

- **Purpose**: starts from one concrete item and widens to the system around it: "this one is one of many, and it is done".
- **Intent**: Start on one concrete item, then widen to the system around it, so the viewer understands 'the row you just saw is one cell of a whole wall, and it is done'.
- **Content**: A table of 8–12 rows, each a name (en ≤ 16 chars, zh ≤ 6) and a state (en ≤ 9, zh ≤ 4), one row tracked; an eyebrow, a title (en ≤ 18, zh ≤ 8), a caption (en ≤ 34, zh ≤ 14) and a counting number (≤ 8 chars) with its label.
- **Fits**: `hook` (an opening that starts in the middle of the work), `demo`, `proof`. **Not for**: products without a table or list to show; a claim that must be on screen from the first frame (the header is out of frame until the camera lifts); slots under about 4.5 seconds.
- **Layout and camera**: one product window (1680 × 900, its top bar, a header with eyebrow, title, caption and a large number on the right, a table of 8–12 rows with id, step, name, state chip, progress bar and a count) on a dot-grid stage. Frames: the camera holds at 3× on the lower left of the table with the tracked row lit and pulsing, breathing in 1.5 % (0–24); it cranes up and out to 1:1 on bezier(0.2, 0, 0.25, 1) (24–126), the stage dots following at 0.35 of the move, a close-up vignette lifting, the other rows coming into focus (0.38 → 1), each row washing with a band of accent light as the frame's top edge passes it, the header brightening as it enters, the number counting up with the move and the window's shadow rising; at 134 the tracked row's progress fills and its chip pops to done with a tick; then the whole window holds.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `eyebrow` | text | glance | 1 | 3 words, 22 chars | 9 | the sample detail eyebrow |
  | `title` | text | primary | 1 | 3 words, 18 chars | 8 | the sample detail title |
  | `caption` | text | glance | 1 | 6 words, 34 chars | 14 | the sample caption |
  | `value` | number | — | 1 | 8 chars | 8 | `48,210` (its digits count up; a sign, unit or % around them stays) |
  | `valueLabel` | text | glance | 1 | 4 words, 24 chars | 10 | the sample metric label |
  | `rows` | list of `{ name, step }` | glance, word | 8–12 | name 2 words, 16 chars; step 1 word, 9 chars | name 6, step 4 | twelve rows from the sample cards and steps |

  Parameters that are not slots: `tracked` (the row the camera starts on, from 0; default the third from last), `states` (the four state labels, running, checking, done, waiting; default neutral words per language).
- **Length**: 9–12 beats (4.5–6 s at 120 BPM): the close-up, the crane, the flip, a hold that grows with the title's reading time.
- **Steps and events**: T0 the close-up hold; T2 the crane (`turn` at its start, the move itself the one big motion); T1 the flip to done (`accent`), then a marked pause on the whole window.
- **Needs**: the spring of `stagger-in` (`springAt`) for the chip pop; roles `ground`, `panel`, `line`, `ink`, `dim`, `accent`, `ok` (done); type `display`, `text`, `mono`.
- **Sound**: a held tone under the close-up, a rising whoosh under the crane with soft ticks as rows wash, `accent` on the flip.
- **Styles**: light and dark product styles; not plakat or ink (it is a product UI). **Source**: adapted from video-shotcraft `demos/opening/crane-rise-reveal/CraneRiseReveal.tsx` (card `references/shots/opening/crane-rise-reveal.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (the table's headers and state labels per language). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the render-queue data, recipe names, search box, avatar and brand are gone: every word is a slot or neutral copy, ids are numbered; state colours by role (accent running, ink checking, dim waiting, `ok` done); no multi-sample camera blur on the fast part of the move. Compare against `crane-rise-reveal` (window 0–172.5, the scene's 11.5 beats): the camera matches exactly (both window corners 0 px, events ±0); SSIM drop waived (lowest at frame 48, inside the upstream's motion-blurred stretch, and its table words differ).
- **Pitfalls**: The opening close-up magnifies one row about 3×; rasterise real material at high resolution or the first frame is blurred. Blur only the fast first half of the lift; blurring the slow top softens the text. Do not use it in the same film as a top-down dive onto one item; the mirrored move reads as the same trick.
- **Sample**: `poster.jpg`, an English still 480 px wide.
