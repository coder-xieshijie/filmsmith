---
id: word-window
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### word-window

- **Purpose**: the name and the product in one picture: the word is a window cut out of the stage, the product moves behind it, then the word opens and the product takes the frame.
- **Intent**: Make the name and the product one picture: the word is a door cut out of the stage, the product is seen through it, and as the word opens the viewer walks from the name into the product.
- **Content**: One heavy word (en ≤ 9 letters, zh ≤ 3 chars), an optional eyebrow (en ≤ 22 chars, zh ≤ 8) and subtitle (en ≤ 44, zh ≤ 16), and one live product picture with large areas of colour and bright lines (dark or darkened).
- **Fits**: `hook` (the first shot of an opening that names the product), `lockup`, `turn` (a chapter card that ends inside the next scene's picture). **Not for**: a light picture behind a light stage (the window must hold large areas of colour and bright lines); thin or light type; words longer than about nine letters (three Chinese characters); a film that also uses `counter-portal` through a stroke (the same idea twice).
- **Layout and camera**: the word at up to 470 px (zh 440), weight 900, tracking −22/470 em, fitted to 72 % of the frame, centred; the eyebrow above it, the subtitle below; a soft tinted shadow under the word as if it were cut into the stage. Behind the word, in screen space, the film's picture or a neutral live panel (a sidebar, a header, three figures, a large area chart flowing left, four progress bars) in deep, saturated colours derived from the palette. Frames: the word wipes up from its baseline and settles 1.04 → 1 (0–18), the eyebrow's tracking closes in, the subtitle rises; the picture, enlarged 1.32× and raised 110 px so its bright line runs through the word's waist, drifts from +150 to −150 px (18–96); the word draws breath, 1 → 0.965 (96–104), while the eyebrow and subtitle leave; it rushes out (104–128), scale growing exponentially in log space (t^1.8) about the deepest point of its strokes, which is drawn to the middle of the frame; the picture settles to 1:1 and unmoved (104–132) and, once the stroke covers the frame, fades in over it; hold on the full picture to 165.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `word` | text | primary, claim | 1 | 1 word, 9 chars | 3 | the sample product name |
  | `eyebrow` | text | glance | 0–1 | 3 words, 22 chars | 8 | the sample eyebrow |
  | `subtitle` | text | glance | 0–1 | 8 words, 44 chars | 16 | the sample long title; must be readable before the breath |
  | `picture` | image | — | 0–1 | — | — | a neutral live panel |

- **Length**: 11 beats (5.5 s at 120 BPM), fixed: the timing is the shot.
- **Steps and events**: T1 the word settling (`land`); a marked pause in the drift; the breath (`turn`); T2 the rush (the one hit, at its end); then hold on the picture.
- **Needs**: nothing beyond the runtime; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent` (the picture's colours are derived from them); type `display`, `text`, `mono`.
- **Sound**: a soft bed under the drift, a short intake on the breath, a whoosh building to `hit` as the stroke fills the frame, then the picture's own bed.
- **Styles**: light styles (porcelain, swiss, exhibit); on a dark ground the picture is drawn deeper than the ground, which reads less strongly. **Source**: adapted from video-shotcraft `demos/opening/text-as-mask/TextAsMask.tsx` (card `references/shots/opening/text-as-mask.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (the window works in any script; the rush finds a stroke in whatever glyphs it is given). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (zh with the word 潮汐).
- **Differs from upstream**: the point the rush grows from and its end scale are computed from the word (the deepest point of a distance transform of its strokes, leaning to the middle; the scale at which that stroke covers the frame by 86 % of the rush), not hand-placed for one word; the picture is the film's, or a neutral panel from sample copy (the upstream's render dashboard, its figures, nav and brand removed); the brand mark and wordmark eyebrow are a text slot. Compare against `text-as-mask` (window 0–165): the rush (0.5 px on its log share) and the picture's drift and landing (0 px) match, events ±0; SSIM drop waived (mid-rush the frame is mostly one blown-up stroke of a different word).
- **Pitfalls**: Darken a light page or use its dark theme; the strokes must show large areas of colour and bright lines, or the word does not read as a window. Do not outline the letters; variable fonts build glyphs from overlapping contours and an outline draws their insides. The picture is watched in close-up the whole time; rasterise it at high resolution or it blurs inside the strokes. Not in the same film as counter-portal's push through a stroke; both grow a world out of a word.
- **Sample**: `poster.jpg`, an English still 480 px wide.
