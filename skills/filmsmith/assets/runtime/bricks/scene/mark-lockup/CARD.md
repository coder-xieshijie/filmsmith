---
id: mark-lockup
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### mark-lockup

- **Purpose**: ends the film on the product's mark, name and one line, arriving at the mark from something already on screen, and holds long enough to read.
- **Intent**: The film resolves into the product's signature: something the viewer has just seen becomes the mark, and the name is left to remember.
- **Content**: A mark (image or vector; a placeholder without one), a wordmark ≤ 16 chars, an optional tagline ≤ 34 chars; for flip an app icon, for assemble a prompt ≤ 36 chars and the mark's pieces.
- **Fits**: `lockup`. **Not for**: films without a mark (use name-stamp); ends that must keep the product UI on screen (strip-away); more than one tagline.
- **Layout and camera**: the mark appears at the centre, then steps left while the wordmark lands to its right as one centred row (geometry from the measured wordmark, so any name centres); the tagline sits under the row. No camera move. Three ways in (`enter`):
  - `ring` (default, 132 frames): a neon ring with two gaps collapses from 5.4× onto the centre, turning as it shrinks, heals into a solid ring and brakes with a 6 % overshoot on the frame the mark replaces it, with one thin shock ring.
  - `flip` (130 frames): an app icon wobbles twice, flips edge-on (accelerating, two ghosts) and the mark springs open from that sliver, its accent piece wiping in a beat later; the letters drop from 1.9× and defocus into place.
  - `assemble` (168 frames): a cursor sends the message in an input field, the text flies off, the field floods with the mark's ink and springs into its stem, and the other pieces drop into dashed construction slots one by one.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `wordmark` | text | primary | 1 | 2 words / 16 chars | 6 chars | product |
  | `tagline` | text | glance | 0–1 | 6 words / 34 chars | 12 chars | claim |
  | `mark` | image or painter | — | 0–1 | — | — | four-piece placeholder mark |
  | `icon` | image (`flip`) | — | 0–1 | — | — | rounded icon of the mark |
  | `prompt` | text (`assemble`) | glance | 0–1 | 7 words / 36 chars | 15 chars | claim |

  Parameter `pieces` (`assemble`): the mark as pieces in a 128-unit box (`stem` marks the one the field becomes); default the placeholder's four.
- **Length**: 8–14 beats (4–7 s at 120 BPM): the entry (4.4–5.6 s by mode), then at least one second and at least the reading time of the wordmark and tagline from the first letter.
- **Steps and events**: the entry is the T2 peak (the ring's brake, the flip's sliver, the field becoming the stem); the mark steps aside and the letters arrive (T1); the tagline rises word by word (stagger-in); pause on the lock-up.
- **Needs**: motions `stagger-in` (riseText), `digit-roll` (spring); prop `cursor` (`assemble`); roles `ground`, `panel`, `line`, `ink`, `dim`, `accent`, `onAccent`; type `display`, `text`, `mono`. Exports `drawMark(ctx, cx, cy, size, P, opts)` and `PLACEHOLDER` for other lock-ups.
- **Sound**: `land` on the mark, `accent` on the wordmark, `turn` on the flip's sliver.
- **Merged from**: `icon-flip-bloom` (variant `flip`), `input-morph-assemble` (variant `assemble`).
- **Styles**: any. **Source**: adapted from video-shotcraft `demos/outro/logo-shrink-wordmark-lockup/LogoShrinkWordmarkLockup.tsx` (card `references/shots/outro/logo-shrink-wordmark-lockup.md`), `demos/outro/ui-to-brand-morph/IconFlipBloomLogo.tsx` and `InputMorphsIntoLogo.tsx` (card `references/shots/outro/ui-to-brand-morph.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (wordmark and tagline measured per language; the hold from `readTime`). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`, variants `poster-flip-*.jpg`, `poster-assemble-*.jpg`.
- **Differs from upstream**: brand mark, wordmark, motto and demo copy are slots with a neutral placeholder mark; the three shots are one scene with three entries. Compare against `logo-shrink-wordmark-lockup` (ring): pass, SSIM drop 0.029, mark 0 px, events 0 frames; `icon-flip-bloom` (`compare/pairs-flip.json`, dry run): pass, SSIM drop 0.069; `input-morph-assemble` (`compare/pairs-assemble.json`, dry run): pass, progress RMSE 0.0002. Each pairs file sets `markShift` to the upstream's mark offset.
- **Pitfalls**: Hold the finished lock-up at least one second past its reading time; a cut on the last letter loses the name. flip swaps on the thinnest frame: an icon that does not resemble the mark makes the swap read as a cut. assemble needs the mark as separable pieces; a single-shape logo only floods the field.
- **Sample**: `poster.jpg`, an English still 480 px wide.
