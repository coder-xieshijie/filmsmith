---
id: claim-portal
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### claim-portal

- **Purpose**: Land the claim on the climax and leave the film through one of its counters.
- **Intent**: The claim is the door to the end: the viewer reads it, then goes through it.
- **Content**: 1–2 lines (≤ 12 chars, ≤ 8 words in all), a far side (the closing wordmark or a painter).
- **Fits**: `claim`, `climax`. **Not for**: a second claim; a claim with no glyph that has a counter (Chinese falls back to the 。 ring).
- **Layout and camera**: left at 150, baselines 640 or 520 · 830, 260 fitted to 160 at the normal width (−0.035 em); the stop after the last line; no camera until the push.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of text | primary | 1–2 | 4 words, 12 chars | 7 chars | It was · 7f0c2d1 / 就是它 · 7f0c2d1 |
  | `then` | painter or { text } | – (optional) | 1 | – | – | { text: 'cleave' } |

  Options: `thenGround` (the far side's ground role).
- **Length**: 5–10 beats: landed 0.45 s, read, cleared 0.3 s, the push 1.5 beats ending 0.3 beat before the scene ends.
- **Steps and events**: the lines land whole on beat 0 (the hit of runtime whiteout-slam, T3 climax); the far side shows inside the counter from the first frame; 1.8 beats before the end minus 0.3 s the other glyphs and the stop rise out 8 ms apart; then counter-portal pushes in over 1.5 beats (T2).
- **Needs**: motions counter-portal (runtime), whiteout-slam (runtime, the transition in); props ink-dot; roles ground, ink, accent; type display.
- **Sound**: `hit` on the landing (the second drop), the counter-portal whoosh.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes claim, paintClaim, drawClaim; counter-portal hand-off`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted (zhRedesigns): the portal glyph is a Latin 0 O Q D when the claim has one; else the Han character with the largest closed counter (口, 日, 回, 四 …, found by flood-filling the rendered glyph; at least 3 % of its box); else the full stop turns into the Chinese stop 。 and the camera pushes through its ring.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the far side is a parameter (a painter or the closing wordmark) instead of the next scene of a plan.
- **Pitfalls**: The landing shock is the transition into this scene (runtime whiteout-slam); cut into it hard, never crossfade. English needs a 0, O, Q or D in the claim.
