---
id: flock-finale
category: scene
energy: high
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### flock-finale

- **Purpose**: end the film by spending its pages into its name: three pages tumble into a stair, are pulled into a point that flashes, and the title slams in inside a ring of smoke.
- **Intent**: The film's peak of energy collapses into its name: the product's pages are gathered and spent in one flash, and the title slams through a ring of smoke.
- **Content**: Three page painters (optional, the sample's otherwise), a one-word title (≤ 10 chars, Chinese ≤ 4 characters), an optional eyebrow, tagline (≤ 40 chars, Chinese ≤ 10) and a wall phrase.
- **Fits**: `lockup`, `climax`. **Not for**: middle sections, titles longer than one word, quiet editorial films.
- **Layout and camera**: three cards (tumble-stair, the film's pages or the sample's) start edge-on near the centre, 30 px low, over a bloom and an outlined word wall drifting in two rows; they tumble into a staggered stair and keep turning; then the pull, the flash at the same point, one turbulent smoke ring growing from it, and the title at its centre with the eyebrow above and the tagline below. No camera move.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | cards | brick | – | 3, optional | – | – | page, grid, detail |
  | wall | text | texture | optional | 4 words, 20 | 20 | Make it move |
  | eyebrow | text | glance | optional | 2 words, 16 | 8 | Tidewell |
  | title | text | word, claim | 1 | 1 word, 10 | 4 | Cinematic |
  | tagline | text | glance | optional | 7 words, 40 | 10 | Every render, checked before it ships. |

- **Length**: 9 beats (4.5 s, fixed timetable of 135 frames).
- **Steps and events**: frames 6–22 the wall comes up; 10–54 the tumble (turn), then the idle turn; 62–72 the pull (quad in, fading over its last 45 %) (turn); 70 the flash and the ring (T3, land); 74 the title slams 1.22 → 1 with its tracking closing (accent); 84 the eyebrow, 92 the tagline; from 106 a held poster with the ring still growing.
- **Needs**: motion `tumble-stair`; roles `ground`, `panel`, `ink`, `line`, `accent`; type `display`, `text`.
- **Sound**: `turn` on the tumble and the pull, a heavy `land` on the flash, `end` under the title.
- **How not to look like a screen recording or a string of effects**: use it once, at the end, and let the cards be the film's own pages, so the pull reads as the film gathering into its name; no particles, one ring, one flash.
- **Styles**: any.
- **Source**: adapted from video-shotcraft `demos/transition/card-flock-tumble/CardFlockTumble.tsx` (card `references/shots/transition/card-flock-tumble.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: brand, mark and copy removed; the ring's colours come from the accent and the ink, blended by screen on dark grounds and multiply on light ones; grain and vignette left out. The pull and the ring are drawn here (the collapse-burst ring variant is not made yet). Compare waived for the SSIM drop (the cards' content); all tracked points deviation 0 px, events ±0.
- **Pitfalls**: Use it once, at the film's energy peak; it ends everything on screen. The smoke ring is the aftermath of the collapse, not a celebration: no confetti or particles on top.
