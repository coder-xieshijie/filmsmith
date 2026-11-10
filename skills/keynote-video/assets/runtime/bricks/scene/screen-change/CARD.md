---
id: screen-change
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### screen-change

- **Purpose**: The screen changes state while the device stays: the next capture rises like the next post of a feed, the page is flicked to its next stop, or the whole device turns once; then the copy group lands.
- **Intent**: The device stays the through-line while the evidence changes under the glass.
- **Content**: The capture before and the capture after (or two stops of one long capture), each with its source line; the copy group as in screen-push.
- **Fits**: `demo`, `turn`, `proof`; A change of surface (the official page after the app) or of stop on the same page. **Not for**: More than one flip a film; a cross-dissolve between states.
- **Layout and camera**: the device locked; feed: window-less cards edge to edge with the screen, the back one 5 % smaller and 34 px up, veiled to 40 %; scroll: the page at its own width; flip: the whole device turns about its vertical axis (perspective 2200 px).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `value` | text | primary | 1 | 2 words, 10 chars | 5 chars | Any team / 任何团队 |
  | `line` | text | primary | 1 | 4 words, 18 chars | 14 chars | one plan for all / 一个方案通用 |
  | `note` | text | glance (optional) | 1 | 6 words, 40 chars | 22 chars | from the pricing page / 出自价格页 |
  | `screen` | image | – (optional) | 1 | – | – | – / – |

- **Length**: 3–12 beats (1.5–6 s at 120 BPM); the move (feed 1 beat, scroll 2, flip 2) plus the copy group and its reading.
- **Steps and events**: beat 0 the old light fades (0.15 s) and the move starts; feed: the chin changes half way; flip: the screen and the chin change on the edge-on frame (0.433); on the landing the light, the value; a beat later the line and the note; a beat later the ring.
- **Needs**: motions feed-stack, scroll-reel, device-flip; props device-shell, margin-notes, region-light; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `turn` under a feed (a short rising sweep); the device cues of scroll-reel (a flick sweep) and device-flip (a sweep and a thock on the swap); `land` on the landing; `accent` on the ring.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, any real-asset launch; avoid tally, trace.
- **Source**: own (`assets/templates/handset/choreo.js (TYPES.feed, scroll, flip), moves.js (feed-stack, scroll-reel, device-flip adapters)`), split from the handset style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese lines wrap inside the margin (lang.js wrap, simple kinsoku) instead of shrinking; notes and the chin are 28 px in Chinese (25 in English); numbers and product names stay in the Latin face; no capitals, no negative tracking.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the handset template (`assets/templates/handset/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the handset recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Flip once a film at most; change surface with a feed. The chin must change with the screen (half way through a feed, on the flip’s swap frame).
