---
id: icon-field
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### icon-field

- **Purpose**: shows "this many" before naming anything: a whole universe of features laid out unlit, then lit at once.
- **Intent**: Lay out the whole universe of features in grey so the viewer registers 'this many', then light it all in one fast sweep, so the product reads as what brings it all to life.
- **Content**: 6–16 simple solid icons (SVG paths on a 24 grid; hearts, stars, bolts, ticks: recognisable shapes, not abstract blocks), repeated over about 170 keys; an eyebrow (en ≤ 20 chars, zh ≤ 8) and a two-line title (en ≤ 16 / 24, zh ≤ 6 / 9).
- **Fits**: `hook`, `proof` (scale), `lockup`. **Not for**: fewer than about a hundred things (the field must read as many); icons that must be read one by one; light, flat styles.
- **Layout and camera**: 17 × 10 keycaps (66 px, rows offset half a cell) fill the frame; a 4 % push over the whole scene. Beat by beat (frames): keys rise from the centre outward in ten batches 4.4 frames apart (plus up to 3 frames of seeded jitter), each popping 0.6 → 1 with an overshoot and rising 10 px (0–48); the field holds, then dims 12 % as if drawing breath (56–66); four bands of light start at rows 0, 3, 5 and 8 at frames 66, 72, 78 and 84 and sweep down, 1.4 frames a row with a slight lean across the columns, each key filling top-down with the band's colour over 4 frames with a 22 % pop, a white flash and a halo, while its row spills the same light on the stage; the bands end as four horizontal strata, light to deep; at 118 a veil darkens the centre and the eyebrow and the two title lines rise word by word.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `icons` | list of icon (SVG path data on a 24 grid) | — | 6–16 | — | — | sixteen plain neutral glyphs |
  | `eyebrow` | text | glance | 1 | 3 words, 20 chars | 8 | the sample eyebrow |
  | `line1` | text | primary | 1 | 3 words, 16 chars | 6 | the sample detail title |
  | `line2` | text | primary, claim | 1 | 5 words, 24 chars | 9 | the sample claim (in the first band's colour) |

- **Length**: 10–12 beats (5–6 s at 120 BPM): the rise, the breath, the sweep, then the title with its reading time.
- **Steps and events**: T0 the rise; the breath is a marked pause; T2 the lighting sweep (the one hit; the first band is a `turn`, the others `accent`); T1 the title (`land`).
- **Needs**: the word rise of `stagger-in` (`riseText`); roles `ground`, `panel`, `dim` (unlit keys), `ink`, `accent` (the four bands are four steps of it, light to deep), `onAccent` (lit glyphs); type `display`, `mono`.
- **Sound**: a low swell under the rise, silence in the breath, a rising sweep (`turn`) with ticks as the bands pass, `land` under the title.
- **Styles**: dark styles (afterglow especially); not ink, dossier, plakat or swiss. **Source**: adapted from video-shotcraft `demos/opening/icon-field-colorize/IconFieldColorize.tsx` (card `references/shots/opening/icon-field-colorize.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (Chinese title lines rise by phrase). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the four sunrise colours are four steps of the film's one accent (one accent, one meaning); the wordmark eyebrow is a text slot; keys drawn in Canvas2D from pre-drawn caps. The upstream's seeded draw order is kept (rng.js `mulberry32`, seed 20260718), so the field matches it key for key. Compare against `icon-field-colorize` (window 0–180, the scene's 12 beats): passes, the top-left key's rise and pop match to the frame (0 px), SSIM drop 0.002.
- **Pitfalls**: Never light the whole field on one frame; the light must sweep down in bands, or it reads as a different picture swapped in. Wipe the light in with a clip, not a cross-fade; half-transparent warm colour over a dark ground passes through a muddy olive. Use recognisable solid icons; abstract blocks do not read as a universe of features.
- **Sample**: `poster.jpg`, an English still 480 px wide.
