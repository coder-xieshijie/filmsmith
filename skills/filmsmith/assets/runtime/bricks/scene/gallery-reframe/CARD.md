---
id: gallery-reframe
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### gallery-reframe

- **Purpose**: show that the product sees one set of pictures more than one way: a layout switch flips and the board follows it twice.
- **Intent**: The viewer sees one set of pictures read three ways, archive, curated and fanned, and believes the product's layouts are a real feature.
- **Content**: 8–12 pictures or screenshots (subjects near the centre), three layout names (≤ 8 chars, Chinese ≤ 3 characters), a header, a featured caption and a headline (≤ 28 chars, Chinese ≤ 12).
- **Fits**: `demo`, `proof`, `rest`. **Not for**: fewer than eight pictures, a story about one picture, layouts the product does not have.
- **Layout and camera**: a header (mark, eyebrow, title) top left and a three-label switch top right over a board of twelve tiles: grid → feature mosaic (the first tile captioned) → a diagonal cascade of mounted prints that leaves room for the headline at lower left. A 1 → 1.025 push over the scene.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | images | image, crop | – | 0–12, optional | – | – | role-coloured pictures |
  | eyebrow | text | glance | 1 | 2 words, 14 | 6 | Workspace |
  | title | text | glance | 1 | 3 words, 18 | 7 | Weekly review |
  | modes | list of text | glance | 3 | 1 word, 8 | 3 | Grid, Mosaic, Cascade |
  | feature | kicker, title, meta | glance, primary | 1 | 2/3/5 words | 6/7/12 | Featured · Weekly review · 9 checks |
  | headline | text | primary, claim | 1 | 5 words, 28 | 12 | Every render, in sequence |
  | subline | text | glance | optional | 8 words, 42 | 16 | Twelve shots, three ways to read them |

- **Length**: 12–15 beats (6–7.5 s): the headline's read decides.
- **Steps and events**: frames 0–40 the tiles rise along the diagonals; frame 52 the switch slides (turn), 4 frames later the wave reflow to the mosaic (layout-morph); frame 76 the feature caption; frame 128 the switch again and the deal to the cascade (turn); frame 158 the headline (land).
- **Needs**: motion `layout-morph`; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `display`, `text`, `mono`.
- **Sound**: `turn` on each switch, `land` on the headline.
- **How not to look like a screen recording or a string of effects**: the switch is the cause and the tiles the effect, so keep the 4-frame lag and never move the tiles without the switch; use the film's real pictures, all of one kind.
- **Styles**: any.
- **Source**: adapted from video-shotcraft `demos/transition/mosaic-reframe/MosaicReframe.tsx` (card `references/shots/transition/mosaic-reframe.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: illustrated photos and copy removed (layout-morph's pictures or the film's images); serif headline becomes the display role. Compare waived: SSIM drop 0.30 from the pictures' content; track deviation 0 px.
- **Pitfalls**: The layouts on the switch must exist in the product; the switch claims them. Portrait prints crop landscape pictures to a strip: keep subjects near the centre.
