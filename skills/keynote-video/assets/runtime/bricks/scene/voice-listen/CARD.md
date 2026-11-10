---
id: voice-listen
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### voice-listen

- **Purpose**: a voice capture the viewer reads twice: what you said (the live transcript above) and that it is listening (the waveform below); then it is sent and becomes a message.
- **Intent**: A live receipt that it is listening: the viewer reads what was said in the transcript and sees in the waveform that it was heard, rising when you speak and flattening when you pause, then the words are sent.
- **Content**: 1–2 short spoken phrases (each en ≤ 32 chars, zh ≤ 12, one line), an optional hint (en ≤ 26, zh ≤ 10), a listening label and a sent label (en ≤ 18, zh ≤ 6); optional word times to sit on a voice-over.
- **Fits**: `demo`, `hook`. **Not for**: more than two short phrases; a real recording's audio (the waveform is drawn from the phrases' timing, not from sound); conversations with replies.
- **Layout and camera**: the transcript at 92 px centred at y 372 (shrunk to fit, never wrapped); a capsule (1240 × 196) at y 760: an accent mic key with breathing rings, 64 bars scrolling right to left (older ones fainter, the left 14 % fading), a timer, an ink send key; a listening label above the capsule; a warm floor light that follows the level. No camera move. Not a screen recording: there is no app around it, the words appear on their syllables (each rising out of a blur, fresh in the accent, cooling to ink) and the pause is shown in two places at once (the bars fall to a dotted line, a caret blinks after the last word); the ending is a poster: a sent message bubble.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `said` | list of text (each a phrase, one line) | primary | 1–2 | 6 words / 32 chars | 12 chars | Cut a teaser for Friday, / start on the close-up. |
  | `hint` | text (optional; before the first word) | glance | 1 | 5 words / 26 chars | 10 chars | Say what you need… / 说说你要什么… |
  | `label` | text | glance | 1 | 3 words / 18 chars | 6 chars | Listening / 正在听 |
  | `sent` | text (the timer is added) | glance | 1 | 3 words / 18 chars | 6 chars | Sent / 已发送 |

  Param `at` (word times in frames, one list a phrase) to sit the words on a voice-over; default: derived from the words.
- **Length**: about 11 beats for two short phrases (172 frames for the upstream's); 9–14.
- **Steps and events**: capsule in 0–14 (1.04 → 1, out of focus), label from 6; hint fades before the first word at 15; phrase one (a word every 2 + 1.1 × its letters frames; Chinese 3 a character), a 23-frame pause, phrase two; send 2 frames after: the key presses 1 → 0.82 → 1, the waveform collapses over 12 frames, the arrow flies off, a tick lands; the transcript rises and shrinks to 0.72 into an accent bubble over 22 frames (`swift`), white text by frame 16 after; the sent line rises and the capsule sinks 24 px to standby; hold 20 frames.
- **Needs**: roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `display`, `text`, `mono`; `noise1` (rng.js).
- **Sound**: `accent` on each phrase's first word, `turn` on send, `land` as the bubble settles.
- **Styles**: light grounds suit it; any. **Source**: adapted from video-shotcraft `demos/interaction/voice-waveform-live/VoiceWaveformLive.tsx` (card `references/shots/interaction/voice-waveform-live.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (Chinese appears a character at a time). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (the sent bubble).
- **Differs from upstream**: the brand, sentence, hint and labels are slots; word timing is derived from the text (or given); the value noise uses the shared hash. Compare against `voice-waveform-live`: pass (transcript and capsule, 0 px, events ±0).
- **Pitfalls**: With a real voice-over, sit the words and the waveform's talk and pause on the voice track; a second off and it shows. The waveform follows speech, not the music; tying it to the score turns a product feature into decoration.
- **Sample**: `poster.jpg`, an English still 480 px wide.
