---
id: combo-hits
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### combo-hits

- **Purpose**: tells three features or gains as a combo: each one lands with its number and the total climbs.
- **Intent**: Three gains land like hits in a fighting game, so the total feels earned and fun.
- **Content**: Exactly three cards: a title ≤ 16 chars, an optional meta line ≤ 22 chars and a gain ≤ 8 chars each; a counter label ≤ 8 chars; an optional closing line ≤ 36 chars.
- **Fits**: `proof`, `climax`, `demo`. **Not for**: serious or quiet films (it is an arcade joke); more or fewer than three items; numbers that are not gains.
- **Layout and camera**: a field of the ground leaning to the accent, with slow diagonal stripes and a dot screen at the foot; three dashed slots (480 × 330, 60 px apart) at y 446 numbered 01–03; a ×N counter top right (label, number, three heat bars); the closing line centred at y 866. No camera move; the whole picture holds still on every hit.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `cards[].title` | text | glance | 3 | 3 words / 16 chars | 6 chars | Drafts, Reviews, Renders |
  | `cards[].meta` | text | glance | 0–3 | 4 words / 22 chars | 9 chars | 12 items, 8 open, 21 queued |
  | `cards[].hit` | text | word, claim | 3 | 2 words / 8 chars | 5 chars | +38%, +210, +1.4 |
  | `cards[].icon` | image | — | 0–3 | — | — | three line glyphs |
  | `label` | text | word | 1 | 1 word / 8 chars | 3 chars | "Combo" / "连击" |
  | `line` | text | primary, claim | 0–1 | 7 words / 36 chars | 14 chars | claim |

- **Length**: 12–14 beats (6–7 s at 120 BPM): at least 176 frames, longer when the closing line needs more reading time.
- **Steps and events**: frames 0–20 the field, slots and a dim ×0; the three cards fall 10 frames each (in-quad, stretched by speed) and hit at content frames 30, 58 and 86 (real frames 30, 60, 90): each hit holds the whole picture for 2 frames (time-freeze's hitStop), flashes the card white, squashes it, rings its outline and throws sparks (10, 13, 16), punches its number up off the card (88, 104, 124 px) and steps the counter (140, 166, 196 px, tilted −2°, −4°, −6°, pulsing back) (T2 each, the third the peak); 12 frames after each hit the number settles into the card's footer; from frame 104 the closing line rises word by word; pause.
- **Needs**: motions `time-freeze` (hitStop), `stagger-in` (riseText); roles `ground`, `paper` and `onPaper` (the cards), `dim`, `accent` (numbers, counter, sparks, slot glow); type `display`, `text`, `mono`.
- **Sound**: `hit` on each of the three hits.
- **Styles**: any; avoid dossier and exhibit. **Source**: adapted from video-shotcraft `demos/effects/impact-feedback/HitCounter.tsx` (card `references/shots/effects/impact-feedback.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (titles shrink to fit the card; no italic or skew in Chinese). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the cobalt field is the ground leaning to the accent and the arcade yellow is the accent; the feature copy, icons and savings are slots; the ring and sparks follow the card's outline as in the upstream rather than slam-drop's round burst. Compare against `hit-counter` (frames aligned): pass, SSIM drop 0.086 at the third hit, cards 0 px, events 0 frames.
- **Pitfalls**: The hit-stop freezes the whole picture; a background that keeps moving through it breaks the hit. Numbers must grow hit by hit; a smaller third hit deflates the combo.
- **Sample**: `poster.jpg`, an English still 480 px wide.
