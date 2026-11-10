---
id: burst-claim
category: scene
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### burst-claim

- **Purpose**: The last world shrinks into the anchor, which squashes and strikes on the bar line; a ring runs out and a burst of dots condenses onto the claim letters.
- **Intent**: Everything the film showed collapses into the one brand piece and bursts out as the claim, so the claim reads as what it all adds up to.
- **Content**: One or two claim lines (≤ 15 chars / 8 字 each); the field kind of the world that collapses.
- **Fits**: `climax`, `claim`; The climax of a print film: one claim in one or two lines. **Not for**: Claims longer than two short lines; quiet films.
- **Layout and camera**: claim lines at y 500 and +1.08 size (131 or 96 px) in the text column; the anchor at (1440, 540).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of text | primary | 1–2 | 3 words, 15 chars | 8 chars | ["Every voice,", "its own words."] |

- **Length**: 5–9 beats (2.5–4.5 s at 120 BPM); the sample plans 6 beats in English, 8 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 the last world shrinks into the anchor (0.5 beat); 0.5–1.25 the anchor squashes; 1.25 the strike, the ring, the burst; 2.5 the claim prints solid; a pause.
- **Needs**: motions collapse-burst; props anchor-mark; roles ground, ink, dim, accent; type display.
- **Sound**: `turn` on 0, `hit` on 1.25, `land` on 2.5.
- **Styles**: made for `halftone` (recipe the halftone recipe); fits halftone; avoid none.
- **Source**: own (`assets/templates/halftone/film.js (collapse boundary, claim cells)`), split from the halftone style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; big words take Noto Sans SC 800 after Bricolage Grotesque; Chinese line spacing 1.18 instead of 1.08; the product name stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the halftone template (`assets/templates/halftone/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the halftone recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: The strike must sit on a bar line; the anticipation squash only works if it holds still.
