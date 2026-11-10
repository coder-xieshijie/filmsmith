---
id: blueprint-build
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### blueprint-build

- **Purpose**: shows a product building a page: the result assembles itself in seconds.
- **Intent**: The page builds itself in seconds, so the viewer feels the product generate the result, not draw it by hand.
- **Content**: A landing-page set: headline ≤ 24 chars, body ≤ 70 chars, badge, three nav items, two buttons, three stats (value + label), an optional picture; seven slot tags and three status words.
- **Fits**: `demo`, `hero`, `proof`. **Not for**: products whose output is not a page; layouts the film must show in its real proportions (the board is fixed to seven blocks).
- **Layout and camera**: a 1640 × 860 board at (140, 150) on a blueprint grid (24 px fine, 120 px major), its width dimensioned above; seven blocks in board px: nav (full width, 96), badge (372 × 56), headline (820 × 250, two lines), body (760 × 96), picture (628 × 560 at 940, 140), calls to action (560 × 76), stats (1496 × 80); a status row above (state, path, `BLOCKS 00 / 07`, a clock). Camera: a slow push 1 → 1.03 about (960, 562) (`type`: 1 → 1.015 from frame 120).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `headline` | text | primary, claim | 1 | 6 words / 24 chars | 10 chars | claim |
  | `body` | text | glance | 1 | 12 words / 70 chars | 26 chars | titleLong |
  | `badge`, `badgeTag` | text | glance, word | 1 each | 3 words / 16 chars; 1 word / 6 chars | 6; 2 chars | label; "NEW" / "新" |
  | `nav` | list of text | glance | 3 | 1 word / 10 chars | 4 chars | the first three nav items |
  | `navAction`, `cta`, `cta2` | text | glance | 1 each | 3 words / 16 chars | 6 chars | the fourth nav item; "Start a render" / "开始渲染"; detailTitle |
  | `stats[].value`, `stats[].label` | text | word, glance | 3 | 6 chars; 3 words / 16 chars | 6 chars | the three KPIs |
  | `tags` | list of text | glance | 7 | 1 word / 6 chars | 2 chars | NAV, BADGE, H1, BODY, MEDIA, CTA, STATS / 导航 … |
  | `building`, `built`, `blocks` | text | glance | 1 each | 1 word / 10 chars | 4 chars | BUILDING, BUILT, BLOCKS / 搭建中, 搭好了, 区块 |
  | `url` | code | — | 1 | — | — | path |
  | `media` | image (crop) | — | 0–1 | — | — | a procedural night sky in the roles |
  | `mark` | image or painter | — | 0–1 | — | — | mark-lockup's placeholder mark |

- **Length**: 11–13 beats (5.5–6.5 s at 120 BPM; `type` 5.6–6.5 s): at least 156 frames (`type` 168), longer when the headline needs more reading time.
- **Steps and events**: 0–8 the board, slots and status; 8–92 the line crosses the board at a constant speed, brushing the blueprint into the page's surface behind it; each block takes off 14 frames before the line passes its slot's foot (at least 4 frames apart: nav ~19, badge ~29, headline ~54, body ~66, picture ~75, buttons ~79, stats ~87), flies 380–980 px from its own side with a ±2–7° tilt on the overshoot curve, and lands as its slot's dashed box goes (T0 each); reticle-lock's corners bite from 20 to 10 px outside it and flash out; 92–104 the blueprint fades to 30 %, the picture lights up, the clock stops (T1, the picture's landing the peak); pause.
- **Variant** `type` (`mode: 'type'`, from `assemble-then-type-flyin`): twelve column guides instead of the grid, no line; 6–50 the bare shells dock (nav bar 6, picture 10, badge 15, buttons 27, stats 35) from 120–420 px on the overshoot with a tilt that settles 4 frames later; 50–58 a half beat of rest; 58–128 every character tumbles in from ±260 / ±200 px, 200–760 px deep with three rotations up to ±190°, through a 900 px perspective (blurred while far), headline first (58, 66), then nav, badge, body, buttons, stats, the picture's caption; 118 the primary button powers up from an outline; 124–146 the picture is graded from flat grey to colour by a wipe.
- **Needs**: motion `reticle-lock` (snap corners); mark-lockup's `drawMark`; roles `ground`, `panel`, `line`, `ink`, `dim`, `accent` (blueprint, line glow, picture tint), `onAccent`, `paper`; type `display`, `text`, `mono`.
- **Sound**: `turn` as the line starts, `land` per block; `type`: `turn` at 6, `accent` at 58, `land` at 118.
- **Merged from**: `assemble-then-type-flyin` (variant `type`).
- **Styles**: dark looks; avoid dossier. **Source**: adapted from video-shotcraft `demos/effects/scanline-assemble-flyin/ScanlineAssembleFlyin.tsx` (card `references/shots/effects/scanline-assemble-flyin.md`) and `demos/effects/assemble-then-type-flyin/AssembleThenTypeFlyin.tsx` (card `references/shots/effects/assemble-then-type-flyin.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (headline fitted to two lines, every text measured per language; characters tumble by grapheme). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`, variant `poster-type-*.jpg`.
- **Differs from upstream**: the demo landing page is a neutral page of the same blocks; the galaxy card is a procedural night sky in the roles; the line's lit grid is a clipped band; the variant keeps this board's layout instead of the upstream's own page and colour wheels, and its 3D tumble projects each glyph in canvas (scale by the cosine of its x and y turns). Compare against `scanline-assemble-flyin` (frames aligned): pass, SSIM drop 0.070, headline and picture blocks 0 px, events 0 frames. The variant is not compared: its layout is this board's, not the upstream's.
- **Pitfalls**: Seven blocks on a fixed board: a page with another structure needs its own scene, not squeezed copy. The type variant's characters are unreadable while they tumble; the page reads only after frame 128.
- **Sample**: `poster.jpg`, an English still 480 px wide.
