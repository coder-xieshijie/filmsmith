---
id: bento-wall
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### bento-wall

- **Purpose**: shows a wall of things that are already there switching on, one cell at a time on an even beat: calm and ceremonious, the opposite of a wall pouring in.
- **Intent**: Show that a whole set of capabilities is already there and simply switches on, so the viewer reads a calm, complete overview instead of things pouring in.
- **Content**: 3 or 6 cells, each a label and a title (en ≤ 16 chars, zh ≤ 7) with an optional number, image or figure; an eyebrow (en ≤ 24 chars, zh ≤ 10) and a title line (en ≤ 34 chars, zh ≤ 14).
- **Fits**: `demo`, `rest`, `proof`. **Not for**: light grounds; a wall that should arrive with energy (use deck-deal); a second whole-wall light effect in the same film.
- **Layout and camera**: two rows of bento cells 330 px high with 44 px gutters, widths alternating 600/420/420 and 420/420/600 (one row with three cells); an eyebrow (a dot and mono text in the accent) and a title (display 56) above the wall at its left edge. Dark ground with a light from the top, an accent glow under the wall that rises when all are lit, a heavy vignette. Locked camera until the wall is lit, then a 4 % push in over 25 frames and a true hold. Not a screen recording: the cells are a composed bento (a label, a title, a figure), not panels of a product UI; one wall light-up per film, then cut away.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `cells` | list (`meta`, `title`, `value`?, `image`?, `figure`?) | glance | 3 or 6 | 3 words / 16 chars each | 7 chars each | the sample's six cards and KPIs |
  | `eyebrow` | text | glance | 1 | 3 words / 24 chars | 10 chars | `eyebrow` |
  | `title` | text | primary, claim | 1 | 6 words / 34 chars | 14 chars | `titleLong` |

- **Length**: 10 beats (150 frames, 5 s at 120 BPM); range 7–11.
- **Steps and events**: hold 0–20 (the wall dimmed to 18 %, the title brightening); from 20 a cell every 12 frames: the comet (a 22 % head, a blurred accent glow and a hot core) runs once round the edge in 8 frames (cubic out), leaving a thin rim that anneals to 40 %; from 6 frames in, the content brightens and rises 20 px with a back-out over 8 frames and a warm pulse inside; all lit by about 94; push 96–121; hold to 150.
- **Needs**: helpers `rrPoint`, `strokeSpan` (outline-trace), `figure`, `cardItems` (tile-card); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `mono`.
- **Sound**: a soft `accent` per cell (every 0.8 beat) or a single riser under the six; nothing on the push.
- **Styles**: dark styles; avoid strip, split, scroll. **Source**: adapted from video-shotcraft `demos/ui-entrance/wall-reveal-moves/BentoLightUp.tsx` (card `references/shots/ui-entrance/wall-reveal-moves.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (neutral-dark).
- **Differs from upstream**: the mark, wordmark and tagline are the film's eyebrow and title; cells are neutral bento faces from the film's items (labels, titles, figures or images) instead of the fixture cards; grain is dropped. Compare: pass (first and last cells, 0 px, events ±0).
- **Pitfalls**: Use at most one whole-wall light effect per film; this and a blueprint wireframe draw together count as two. Do not mix a fly-in into the light-up; a wall that should move belongs to deck-deal. The dimmed state needs a dark ground; on light grounds it reads as a fault.
- **Sample**: `poster.jpg`, an English still 480 px wide.
