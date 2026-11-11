---
id: cursor-close
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### cursor-close

- **Purpose**: Close on the name and the command, the dot becoming its cursor.
- **Intent**: The dot that carried the film becomes the cursor: the next thing to do is type.
- **Content**: A name, a command or URL (≤ 44 chars), an optional licence line (≤ 30 chars).
- **Fits**: `lockup`. **Not for**: a URL longer than 44 chars; a closing with several calls to action.
- **Layout and camera**: wordmark centred at 590 (210 fitted to 130, normal width); the command centred at 700 (IBM Plex Mono 600 40); the licence at 770 (28, soft); the cursor dot r 16; ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera) (no punch after a portal).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | word | 1 | 1 word, 12 chars | 5 chars | cleave |
  | `url` | code | primary | 1 | 44 chars | 44 chars | cleave run --good v2.3 -- npm test |
  | `line` | text | glance (optional) | 1 | 6 words, 30 chars | 16 chars | MIT / runs in any CI · MIT / 任何 CI 都能跑 |

  Options: `risen` (after a portal the wordmark is already at rest).
- **Length**: 6–16 beats: the command from 0.25 beat at 120 cps, the dot on the next beat after it is typed, held ≥ 3 s, the last bar for the hop.
- **Steps and events**: the wordmark rises on beat 0; the command types with a block cursor; the dot drops 46 px into the cursor over 0.18 s and lands (contact frame, squash); the licence types on beat 1; on the last downbeat the dot hops 36 px and lands again.
- **Needs**: props ink-dot; roles ground, ink, dim, accent; type display, mono.
- **Sound**: `drop` (soft) on the rise, `type` under the command, `bell` on the cursor landing, `land` on the last downbeat.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes cta, drawScene cta; timing.rules.js ctaTimes`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat; the command stays code.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the scene length rounds to whole beats rather than the plan's phrase rounding.
- **Pitfalls**: Hold the typed command at least 3 s.
