---
id: screen-wake
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### screen-wake

- **Purpose**: The device’s edge draws out from the camera dot, the screen lights on the first real capture on beat 1, the product’s name lands in the margin, the chin names the source.
- **Intent**: The film opens on the product’s own surface coming to life, so everything after reads as the real thing.
- **Content**: The first capture with its source line; the name (≤ 10 chars / 5 字), a line (≤ 18 / 14 字), an optional note.
- **Fits**: `hook`; The opening of a launch told on one device. **Not for**: A film without a real capture to open on; a cold open on a word.
- **Layout and camera**: the laptop on the left (lid at 96, 131), the margin x 1376–1824; the block at 410 px or level with the region named; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `value` | text | primary | 1 | 2 words, 10 chars | 5 chars | Northwind / Northwind |
  | `line` | text | primary | 1 | 4 words, 18 chars | 14 chars | a code editor / 一个代码编辑器 |
  | `note` | text | glance (optional) | 1 | 6 words, 40 chars | 22 chars | its own release notes / 它自己的发布说明 |
  | `chin` | text | glance | 1 | 6 words, 44 chars | 22 chars | northwind.dev/releases / northwind.dev/releases |
  | `screen` | image | – (optional) | 1 | – | – | – / – |

- **Length**: 4–12 beats (2–6 s at 120 BPM); the copy’s reading sets it; the sample plans 6 beats in English, 7 in Chinese.
- **Steps and events**: beat 0 the edge draws (0.45 s) and the lid fills (0.3 s); beat 1 the screen comes up from the glass (0.3 s, monotonic); beat 2 the name; beat 3 the line and the note; beat 4 the ring (if a region); a beat later the chin’s source line (0.3 s). `edges: 'cut'`: the lit device from frame 0, the name on beat 1.
- **Needs**: motions none; props device-shell, margin-notes, region-light; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `hook` (a chime and a thud) as the screen lights; `accent` on the ring.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, any real-asset launch; avoid tally, trace.
- **Source**: own (`assets/templates/handset/choreo.js (TYPES.wake), film.js (paintDevice, the backlight)`), split from the handset style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese lines wrap inside the margin (lang.js wrap, simple kinsoku) instead of shrinking; notes and the chin are 28 px in Chinese (25 in English); numbers and product names stay in the Latin face; no capitals, no negative tracking.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the handset template (`assets/templates/handset/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the handset recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). The film’s scene boundaries (film-v2) put the name at 1.0 s and the line at 1.5 s; the brick keeps the template’s copy group (name on beat 2, line on beat 3).
- **Pitfalls**: The first capture must be the product’s surface at rest, not a marketing composite.
