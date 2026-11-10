---
id: chip-select
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### chip-select

- **Purpose**: shows one choice as cause and effect: the options, the press, the chosen one standing alone, and what it changed (an old value struck, the new one, a note).
- **Intent**: Show one choice as cause and effect: the options, the press, the chosen one standing alone, then what it changed, so the viewer sees what choosing this does.
- **Content**: A question (en ≤ 30 chars, zh ≤ 12), 3–6 short options (en ≤ 18, zh ≤ 7), an old and a new value (≤ 8 / 6 chars) with an optional unit, and a note (en ≤ 28, zh ≤ 12); optional eyebrow.
- **Fits**: `demo`, `proof`. **Not for**: more than six options; a choice with no measurable result; multi-select.
- **Layout and camera**: a question centred high (eyebrow above), the options as chips in centred rows (3 + 2, or one row of three); later the chosen chip rises to y 330 and narrows to 0.88, and the result row and its note rise under it. The camera breathes in 1.5 % while the pointer comes and back out as the others leave. Not a screen recording: no window chrome, no page; the chips are the stage, the pointer makes one decisive move, and the payoff is the number, not the click.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `eyebrow` | text (optional) | glance | 1 | 4 words / 24 chars | 10 chars | `detailEyebrow` |
  | `question` | text | primary | 1 | 6 words / 30 chars | 12 chars | Which cut goes out? / 发哪一版？ |
  | `options` | list of text | glance | 3–6 | 3 words / 18 chars | 7 chars | the sample cards' titles |
  | `before` | number (the old value) | — | 1 | 8 chars | 6 chars | 12 min / 12 分钟 |
  | `after` | number (the claim) | — | 1 | 6 chars | 5 chars | 4 |
  | `unit` | text (optional) | glance | 1 | 6 chars | 3 chars | min / 分钟 |
  | `note` | text | glance | 1 | 5 words / 28 chars | 12 chars | Three times faster / 快了三倍 |

  Param `choice` (index of the chosen option, default 0).
- **Length**: 11 beats (165 frames, 5.5 s at 120 BPM); range 10–12.
- **Steps and events**: question rises word by word from frame 3, chips from 8 (3 apart); the pointer arrives 24–54 on an arc (cursor-glide), presses at 56: one grey frame, five frames to ink with a light bounce, the others fade to 18 % without moving; hold to 101; the others leave and the choice rises 101–119; the old value rises at 108 and is struck at 118; the new value rises digit by digit from 116; the note pops at 128; settled at 134.
- **Needs**: motions `cursor-glide` (`glideAt`), `stagger-in` (`riseText`); props `choice-chip`, `cursor`; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `display`, `text`, `mono`.
- **Sound**: `accent` on the first chips (beat 0.5), `turn` on the press (3.7), `accent` on the strike (7.9), `stamp` on the note (8.5).
- **Styles**: any. **Source**: adapted from video-shotcraft `demos/interaction/chip-grid-single-select-blackout/ChipGridSingleSelectBlackout.tsx` (card `references/shots/interaction/chip-grid-single-select-blackout.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (the result).
- **Differs from upstream**: brand, billing options and prices are slots; chip widths are measured from the film's text (the upstream's width table is gone); selected is ink, the light and note the accent. Compare against `chip-grid-single-select-blackout`: pass (pointer and chosen chip, 32.5 px, events ±1).
- **Pitfalls**: The other chips must not move when one is chosen; reflowing reads as a page refresh and the single choice is lost. Without a measurable result the press has no payoff; pick another scene for choices that change nothing visible.
- **Sample**: `poster.jpg`, an English still 480 px wide.
