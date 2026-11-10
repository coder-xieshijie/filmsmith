---
id: cursor
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### cursor

- **Structure**: `arrow` (a 26 × 30 arrow, tip at its top left), `rim` (1.4–1.6 px, the contrasting role), `shadow` (two layers: near and hard, far and soft; both pull in on a press), `ripple` (one ring with a faint inner fill, or two rings 3 frames apart), `tag` (a collaborator's name in a pill hung below right of the arrow, its top-left corner sharp).
- **Intent**: Put a person's hand in the frame: a plain pointer that presses and ripples makes every change on screen read as caused by someone, and named pointers make a team feel present.
- **Content**: No content for a plain pointer; for collaborators a name per cursor (en ≤ 10 chars, zh ≤ 4) and a tone that stays the same person all film.
- **States**: `rest`; `named` (the tag in); `pressed` (0.86 about the tip, shadows in); `clicked` (released, the ripple leaving the tip). `cursor-glide` moves between them; scenes call `drawCursor`, `drawRipple` and `drawTag` directly.
- **Sizes**: S 48 px (a page at 1:1), M 96 px (a near shot), L 150 px (a close-up); the box is [180, 48], [300, 96], [460, 150].
- **Swap points**: `name` (the collaborator's tag: 1 word / 10 chars, zh 4 chars); without it no tag is drawn.
- **Parameters**: `form` `outline` (panel fill, ink rim; the close-up) | `solid` (ink fill, panel rim; on a page), `tone` `accent` | `ink` | `dim` (the tag's fill), `rings` 1 | 2, `backdrop` true (fill the sample's ground). **Roles**: `ink`, `panel` (arrow and rim), `accent` (ripple, the tag of the one who matters), `onAccent`, `ground`.
- **Styles**: any interface style. **Source**: adapted from video-shotcraft `demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx` (card `references/shots/interaction/segmented-thumb-hero.md`); adapted from video-shotcraft `demos/interaction/collab-cursor-moves/CursorCastEnsemble.tsx` (card `references/shots/interaction/collab-cursor-moves.md`); adapted from video-shotcraft `demos/interaction/type-and-filter/TypeAndFilter.tsx` (card `references/shots/interaction/type-and-filter.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (S, M and L stills).
- **Rule**: the user's own action is this plain pointer; a mascot or character never clicks for the user. Collaborators' tags use the accent for the one who matters and ink or dim for the rest, one accent a film, not five identity colours.
- **Pitfalls**: Keep each collaborator's tag colour the same all film; a change reads as a different person. Lock the click ripple to the click point; if it follows a moving control it reads as a trail. Drifting cursors must never cover what is being read.
- **Sample**: `poster.jpg`, an English still 480 px wide.
