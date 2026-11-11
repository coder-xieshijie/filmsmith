---
id: scan-read
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### scan-read

- **Purpose**: shows a product reading something (a page, a document, a design) and what it finds, block by block.
- **Intent**: The viewer watches the product read a page and name what it finds, so its understanding feels concrete and fast.
- **Content**: A screenshot the window's size (or the neutral page) with 2–6 block rectangles; for each a label head ≤ 8 chars and detail ≤ 18 chars; status words ≤ 12 chars.
- **Fits**: `demo`, `proof`, `problem`. **Not for**: more than six findings (labels crowd); findings that need a sentence each (a label is a word and a detail).
- **Layout and camera**: a browser window (1560 × 840 at 180, 168, chrome 52) holding the page; a status row above it (pulsing dot, state, product, progress bar, `SIGNALS 00 / 06`); cursors on both sides of the window ride the line, the left one reading out y. Camera: a slow push 1 → 1.035 about (960, 583) over the scene (swift).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `page` | image (crop, window size) | — | 0–1 | — | — | a neutral page from the sample copy |
  | `targets[].head` | text | glance | 2–6 | 1 word / 8 chars | 3 chars | LOGO, NAV, H1, CTA, HERO, PALETTE / 标志 … |
  | `targets[].detail` | text | glance | 2–6 | 3 words / 18 chars | 6 chars | Wordmark, 4 links, 2 lines … |
  | `reading`, `done`, `counter` | text | glance | 1 each | 2 words / 12 chars | 4 chars | READING, READ, SIGNALS / 读取中, 读完, 信号 |
  | `headline` | text (neutral page) | glance | 1 | 6 words / 30 chars | 12 chars | claim |
  | `cta` | text (neutral page) | glance | 1 | 3 words / 18 chars | 6 chars | "Start a render" / "开始渲染" |
  | `url` | code | — | 1 | — | — | path |
  | `mark` | image or painter | — | 0–1 | — | — | mark-lockup's placeholder mark |

  Parameter `rects`: one `[x, y, w, h, tag]` per target in page px (tag `right`, `above`, `below`, `belowRight`: where its label goes); default the neutral page's six blocks.
- **Length**: 10–12 beats (5–6 s at 120 BPM): at least 150 frames, a little longer when the labels need more reading time.
- **Steps and events**: 0–6 the status row lights; 6–80 the line crosses the window at a constant speed (scan-line `line` mode); a block fires the frame the line passes its foot (at least 4 frames after the previous): its corners collapse from 76 px out on a spring (damping 15, stiffness 210) with arms shortening 40 → 26, a focus flash at +3, and at +5 its label wipes out and types about two characters a frame (T0 each); the counter steps with each; 80–88 the line fades and the state turns to done (T1); pause.
- **Needs**: motions `scan-line` (`line` mode, crossAt), `reticle-lock` (its corners), `stagger-in` (springAt); prop `tile-card` (hero figure); mark-lockup's `drawMark`; roles `ground`, `panel`, `line`, `ink`, `dim`, `accent` (the machine: line, corners, labels), `onAccent`, `paper`; type `display`, `text`, `mono`.
- **Sound**: `turn` as the line starts, `land` when the last block is read.
- **Styles**: any. **Source**: adapted from video-shotcraft `demos/effects/scanline-annotate-focus/ScanlineAnnotateFocus.tsx` (card `references/shots/effects/scanline-annotate-focus.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (labels measured, not counted in monospace cells; the headline shrinks to two lines). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the demo site and vase illustration are a neutral page of the same layout; the machine colour is the accent (the page uses its own roles); the corners are reticle-lock's (a paper underlay under the accent stroke). Compare against `scanline-annotate-focus` (frames aligned): pass, SSIM drop 0.019, left cursor and headline label 0 px, events ±2 frames.
- **Pitfalls**: Blocks fire when the line passes their foot: two blocks with the same foot fire 4 frames apart, so order them by height. Labels sit outside their block (right, above, below): leave room on the page for them.
- **Sample**: `poster.jpg`, an English still 480 px wide.
