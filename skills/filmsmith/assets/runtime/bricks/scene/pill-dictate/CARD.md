---
id: pill-dictate
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### pill-dictate

- **Purpose**: the quietest beat of a demo: an input waits for you (a warm light inside it), a sentence arrives at an even pace, and the light recedes as it does.
- **Intent**: A rest between louder beats: the input glows while it waits for you, and gives its light to the words as they arrive, so the request feels calm and personal.
- **Content**: One request sentence (en ≤ 34 chars, zh ≤ 16, one line) and an optional caption under the pill (en ≤ 24, zh ≤ 10).
- **Fits**: `demo`, `hook`, `rest` (a quiet beat between louder ones). **Not for**: long text (more than one line); anything that should feel fast or busy; showing a reply (the next scene does that).
- **Layout and camera**: one fixed-width pill (1240 × 132, the `input-field` prop) centred on the screen, an accent light behind its right end, a few soft lights for its frost to blur, a warm reflection on the floor under it; a short line under it at the bottom. No camera move: the pill lands from 1.25 × out of focus. Not a screen recording: there is nothing else on screen, the field is an object with light and a floor, and the light (not the typing) is what changes; three things happen, landing, typing, the light going.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `text` | text (typed) | primary | 1 | 9 words / 34 chars | 16 chars | Draft a teaser for the new release / 给新版本写一支预告片 |
  | `caption` | text (optional) | glance | 1 | 4 words / 24 chars | 10 chars | Speak or type / 说出来，或打出来 |

- **Length**: 8 frames + 2 a grapheme (Chinese 3.5) + 36 frames: about 7.5 beats in English, 5.3 in Chinese; range 5–9.
- **Steps and events**: visible at once, landing 1.25 → 1 over 20 frames (`snappy`), out of focus for the first 14; the caret from frame 2; typing from 8 at a constant pace; the glow, the light behind and the floor go 1 → 0 from frame 10 to the end of typing + 8 (`smooth`), the voice key from filled to outline with them; the caret goes 2 frames after the last character; hold.
- **Needs**: prop `input-field` (`drawField`: form `pill`, voice button with live bars); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `text`.
- **Sound**: `accent` as typing starts (a soft tone), `land` at the end; no per-key clicks (it is dictation).
- **Styles**: light grounds suit it; any. **Source**: adapted from video-shotcraft `demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping.tsx` (card `references/shots/interaction/glass-pill-dictation-typing.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (typed by grapheme). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: no CSS backdrop filter: the frost is the panel colour over drawn lights; the brand mark is gone, the line under the pill is a slot; terracotta and apricot are the accent and a lighter mix of it. Compare against `glass-pill-dictation-typing`: pass (the caret, 31.4 px: type metrics, events ±0).
- **Pitfalls**: Do only three things: land, type, let the light recede; any extra bounce, colour change or icon motion stops it being a rest. On a light stage the glow must be strong and the ambient light must recede with it, or the receding light is not seen. Re-fit the pill width (about 1.8–2× the sentence) and the typing window when the sentence changes.
- **Sample**: `poster.jpg`, an English still 480 px wide.
