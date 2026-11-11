---
id: anchor-ask
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### anchor-ask

- **Purpose**: Ask the film's question one word per beat at one anchor, the ground flipping along the ramp, the machine form typing under it.
- **Intent**: The eye never moves: one word per beat on the same spot, the ground flipping under it, so the question lands as rhythm and the query under it says it is real.
- **Content**: 2–6 words or short phrases (≤ 14 chars, ≤ 5 words a state), each with an optional machine form (≤ 34 chars of code).
- **Fits**: `hook`, `problem`, `turn`. **Not for**: copy over five words a state; statements; words that would move the anchor.
- **Layout and camera**: every word left at 160, baseline 660, 364 px fitted down to 233; the query line at 990; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `words` | list | – | 2–6 | – | – | which · build · renders · under 1 s? / 哪个 · 版本 · 1 秒内 · 渲完？ |
  | `words[].text` | text | word | 1 | 3 words, 14 chars | 5 chars | – |
  | `words[].param` | code | glance (optional) | 1 | 34 chars | 34 chars | $ tidewell bench … |
  | `queryBase` | code | glance (optional) | 1 | 48 chars | 48 chars | the line carried from the previous ask |

  Options: `first` (the film's first scene: frame 0 is the ground and the prompt typing, the first word slams on beat 1), `invert` (arrives on an invert: the first word on the tinted white, slamming), `form` (`cut`: band and closing bars; `round`: circles), `prevGround`.
- **Length**: 2–12 beats; a state holds until read (0.3 s a word; Chinese 6 characters a second) and the next aperture can start: one beat a word at 120 BPM; the last state's query fragment holds ≥ 1 s.
- **Steps and events**: word k lands on its beat (T0) through an aperture of 0.2 s cubic out from its optical middle (band, close, or circle; a word ending in "?" lands on white as an invert); its fragment types at 12 ms a character (a beat late when the word holds 3 beats, half a beat late on the last); a last hold over two beats gets a 3.5 % pop on the beat that splits it.
- **Needs**: props query-line (drawn by the kit); roles ground, panel, ink, dim, r0–r3, white; type display, mono.
- **Sound**: `hit` on a slammed word, `land` on every other word (the bed's stamp and thud), typing keys under the query line.
- **Styles**: made for `pulse` (recipe the pulse recipe).
- **Source**: own (`assets/templates/pulse/choreo.js`, `film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: Chinese words are set in Noto Sans SC 900 as 长体 (scaled to 0.84 wide, the condensed setting of Chinese headline type) at the same size and floor, one 词 a beat; Latin and digits inside keep Barlow Condensed. The reading time per state follows `readTime`; a word ending in "？" is a question too.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the pulse template (`assets/templates/pulse/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the pulse recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start; the apertures are drawn as canvas clips with aperture-swap's shapes and timing instead of calling the WebGL transition; the query line drops fragments by `breaks()` instead of `split(' ')`.
- **Pitfalls**: Never move the anchor for a long word: split the question into two asks. Do not crossfade grounds: every change is an aperture or an invert.
