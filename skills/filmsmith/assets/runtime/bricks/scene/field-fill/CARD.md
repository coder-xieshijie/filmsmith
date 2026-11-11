---
id: field-fill
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### field-fill

- **Purpose**: turns "a card appears" into "a form is being filled": the viewer's eye is led through the card's structure in order (picture, name, tags, value, key lines, variants, action), and the one value that is struck and replaced is the scene's only change of meaning.
- **Intent**: Turn 'a card appears' into 'a form is being filled': the eye is led through what one item carries in order, and the one value struck and replaced is the scene's single change of meaning.
- **Content**: One item: an optional picture, an eyebrow (en ≤ 28 chars, zh ≤ 12), a one-word name (en ≤ 10, zh ≤ 5), 2–3 tags, an old and a new value (≤ 6 chars) with a chip, 2–3 key lines (en ≤ 38, zh ≤ 18), a swatch label and a call to action.
- **Fits**: `demo`, `proof`. **Not for**: many items (one card only); a screenshot of a real page; a cut that needs one big moment.
- **Layout and camera**: one 1520 × 840 card (79 % of the frame width) on a washed ground with a key light up left and a faint accent glow behind; picture 640 wide on the left, fields in a right column at x 764 (card px). The card rises 30 px in 14 frames, then creeps 1 → 1.035 (asymmetric in-out) to frame 132 and holds 40 frames. Not a screen recording: the fill cursor is the only light and it leads; the card is an object on a stage (two soft shadows, a backdrop, no browser chrome), and the hold is for reading it once, then cut.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `image` | image (cover-cropped) | — | 0–1 | — | — | a neutral object on a seamless backdrop |
  | `eyebrow` | text | glance | 1 | 4 words / 28 chars | 12 chars | `eyebrow` · `detailEyebrow` |
  | `title` | text | primary | 1 | 1 word / 10 chars | 5 chars | `product` |
  | `tags` | list of text | glance | 2–3 | 2 words / 14 chars each | 5 chars each | `steps` |
  | `from`, `to` | number | primary (`to` is the claim) | 1 each | 6 chars | 6 chars | `metric2`, the third KPI |
  | `chip` | text | glance | 1 | 2 words / 12 chars | 6 chars | the third KPI's delta |
  | `body` | list of text | glance | 2–3 | 7 words / 38 chars a line | 18 chars a line | `claim`, `titleLong`, `subtitle` |
  | `marks` | list of line indices | — | 0–3 | — | — | lines 0 and 1 |
  | `swatchLabel`, `cta` | text | glance | 1 each | 3 words / 18, 4 words / 24 | 8, 10 chars | `label`; last step — product |
  | `cursorLabel` | text | glance | 0–1 | 1 word / 10 chars | 4 chars | none (a pulsing dot and three ticks) |

- **Length**: 11.5 beats (172 frames, 5.7 s at 120 BPM); range 10–13.
- **Steps and events**: the cursor arrives at picture 8, title 20, tags 30, value 42, body 76, swatches 96, button 114 (6-frame swift hops that morph its frame); each field lands 2 frames after: `rise` (10–26 px, de-blur, 14 frames) for picture, title, value and lines, `pop` (a spring with one overshoot, 3 frames apart) for tags and swatches; the value change at 62: struck, shrunk to 0.46 and greyed in 6 frames, the new value springs 1.18 → 1 from 63 (T2 peak), the chip slides in from 69; markers sweep under the marked lines at 86 and 90 in 6 frames; the button fills left to right from 116 and the cursor shrinks into it and goes; hold from 132.
- **Needs**: helper `springAt` (stagger-in); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `text`, `mono`.
- **Sound**: tiny ticks on the cursor hops (or none), a `turn` on the strike (beat 4.1) and a `land` on the new value (beat 4.4); quiet from there.
- **Styles**: any with a card material; avoid strip and split. **Source**: adapted from video-shotcraft `demos/ui-entrance/product-card-progressive-assemble/ProductCardProgressiveAssemble.tsx` (card `references/shots/ui-entrance/product-card-progressive-assemble.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the upstream's own product (mark, name, price, licence chip, lines, brand swatches) is the film's slots, with sample copy, a neutral object and the palette's roles by default; the cursor tag is a pulsing dot unless the film gives a label; grain is dropped. Compare: pass (cursor and value row, 0 px, events ±0).
- **Pitfalls**: Keep the ~1.3 s slow push after the last field; it is the time to read the whole card, not dead air. Key lines do not wrap; longer copy or Chinese must be refitted to size and line length or it overflows the card. When the real item has more or fewer fields, re-space the timetable by field group; keep the struck value in the middle.
- **Sample**: `poster.jpg`, an English still 480 px wide.
