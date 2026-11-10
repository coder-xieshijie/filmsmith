---
id: phone-hero
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### phone-hero

- **Purpose**: holds a mobile product still without letting it go dead: the app scrolls on its own, two things to remember about it hover beside it.
- **Intent**: The mobile product, held still yet alive: this is it, and here are the two things to remember.
- **Content**: A tall screenshot of the app (or a neutral feed), two callouts ≤ 18 chars each with optional icons, an optional mark, wordmark ≤ 16 chars and tagline ≤ 34 chars.
- **Fits**: `hero`, `lockup`, `rest`. **Not for**: desktop or web products; more than two callouts; screens the viewer has to read in detail (the feed scrolls).
- **Layout and camera**: a 430 × 900 phone at the centre (metal frame, black border, island, side keys, two soft shadows) in four concentric rings (2240, 1760, 1280, 840 px) breathing 1 ± 6 % out of phase; the left chip's right edge 64 px left of the phone at y 330, the right chip 64 px right of it at y 610; the mark, wordmark and tagline in the bottom-left corner. Camera: none (the phone rises 90 px into place over 26 frames).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `screen` | image (crop, tall) | — | 0–1 | — | — | a neutral feed from the sample copy |
  | `chips[].label` | text | glance | 2 | 3 words / 18 chars | 7 chars | Frames checked, Shots approved |
  | `chips[].icon` | image | — | 0–2 | — | — | a list glyph, a download glyph |
  | `mark` | image or painter | — | 0–1 | — | — | mark-lockup's placeholder mark |
  | `wordmark` | text | primary | 0–1 | 2 words / 16 chars | 6 chars | product |
  | `tagline` | text | glance | 0–1 | 6 words / 34 chars | 12 chars | claim |

- **Length**: 11–14 beats (5.5–7 s at 120 BPM): at least 168 frames, longer when the wordmark and tagline need more reading time.
- **Steps and events**: 0–26 the phone rises and its shadow tightens (T1); from 13 the feed scrolls 560 px at an even speed (autoplay, no easing) to frame 165; 37 the left chip pops out of the phone's side on a spring (damping 13, stiffness 190) and slides 28 px out, hovering ±8 px once landed (T0); 67 the right chip (T0, the peak); 90 the mark and wordmark rise, the tagline word by word; the rings breathe throughout; pause.
- **Needs**: motion `stagger-in` (springAt, riseText); prop `tile-card` (feed thumbnails); the afterglow look's `rings()` and `vignette()`; mark-lockup's `drawMark`; roles `ground`, `panel`, `line`, `ink`, `dim`, `accent`, `onAccent`, `paper`; type `display`, `text`.
- **Sound**: `land` as the phone settles, `accent` on each chip and on the wordmark.
- **Styles**: afterglow (dawn) and light looks; avoid dossier and strip. **Source**: adapted from video-shotcraft `demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx` (card `references/shots/effects/radial-ripple-phone-chips.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (chips measured per language). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the demo feed, clock and player title are a neutral feed (the status bar is shapes); the sand rings and terracotta are the look's roles. Compare against `radial-ripple-phone-chips` (frames aligned): pass, SSIM drop 0.034, phone and right chip 0 px, events 0 frames.
- **Pitfalls**: Keep it slow: speeding up the rings or the feed turns the calm hold into noise. Without a real app screenshot the neutral feed shows; use the film's own screen.
- **Sample**: `poster.jpg`, an English still 480 px wide.
