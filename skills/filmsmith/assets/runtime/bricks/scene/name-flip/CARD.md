---
id: name-flip
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### name-flip

- **Purpose**: Close on the name and version, the tagline, the install command; flip the ground once more on the last downbeat.
- **Intent**: The answer gets a name and a way in: the name stands still, the command types out and holds long enough to copy, the last flip closes the rhythm.
- **Content**: A name (≤ 12 chars), an optional version (≤ 6), a tagline (≤ 34 chars), an install command (≤ 34 chars of code).
- **Fits**: `lockup`. **Not for**: a film that closes on its reveal; a name without a command.
- **Layout and camera**: name and version at 160, baseline 600 (364 px, floor 291); tagline at 720 (61 px); command at 860 (JetBrains Mono 600, 49 px); ground ramp[1], ramp[0] after the flip; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 2 words, 12 chars | 6 chars | tidewell |
  | `version` | text | primary (optional) | 1 | 6 chars | 6 chars | 2.4 |
  | `line` | text | primary | 1 | 5 words, 34 chars | 14 chars | incremental scene renders / 增量场景渲染 |
  | `install` | code | primary | 1 | 34 chars | 34 chars | npm i -D tidewell@2.4.0 |

  Options: `answer` (the version is the answer: amber), `form` (`cut`: a band; `round`: a circle).
- **Length**: 8–16 beats, whole bars; ≥ 4.5 s and the command held ≥ 3 s once typed; in a film it takes the phrase rounding.
- **Steps and events**: beat 0 name and version (T3 lock-up; after runtime slice-smear they resolve out of its smear); beat 1 the tagline rises; from beat 2 the command types at 50 characters a second; the last bar's downbeat flips the ground through a band or circle round the name (T0 `end`).
- **Needs**: roles ground, panel, ink, dim, accent, r0, r1, r3; type display, text, mono.
- **Sound**: `hit` on the name, typing keys under the command, `end` (a chime) on the last downbeat.
- **Styles**: made for `pulse`. **Source**: own (`assets/templates/pulse/film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: a Chinese name is set in Noto Sans SC 900 as 长体 like the asked words; the tagline in Noto Sans SC 600; the command stays code.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the pulse template (`assets/templates/pulse/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the pulse recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start; the scene rounds itself to whole bars and flips on its own last downbeat (the template gives the film's phrase rounding to it).
- **Pitfalls**: The version is amber only when it is the answer. Hold the typed command at least 3 s.
