---
id: scatter-gather
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### scatter-gather

- **Tells**: scattered → threaded → dispatched → gathered: one thread takes a pile of loose work, sends each task out as a star, checks what comes back and gathers every star into one panel with one thing for the user.
- **Intent**: Tell handing work off as one thread that takes everything, sends it out and brings it all back to one place.
- **Content**: Scenes for each slot (see the card); the night-sky look and the stream-bed sound.
- **Fits / does not fit**: Launch films of agents and assistants that take work off people, 75–120 s. Not: Short teasers under a minute; products that do not run things for the user.
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 11–18 | 1 | desk-threaded | hook | build |
  | `turn` | 6–9 | 1 | spine-intro | – | break |
  | `demo` | 5–12 | 1 | ask-to-star | – | build |
  | `demo` | 6–13 | 1 | evening-stars | – | build |
  | `climax` | 9–16 | 1 | job-constellation | reveal (45–60 %) | drop |
  | `proof` | 4–12 | 1 | check-gate | – | build |
  | `demo` | 10–20 | 1 | strand-cards | – | build |
  | `proof` | 4–11 | 0–1 (optional) | day-after-day | – | build |
  | `climax` | 9–14 | 1 | sky-gather | reveal (78–88 %) | drop |
  | `rest` | 1–30 | 0–1 (optional) | night-interlude (the film's own composition over it) | – | build |
  | `lockup` | 6–9 | 0–1 (optional) | point-lockup | lockup | outro |

- **Length**: 75–120 s; peaks 3–4 (threaded, the constellation, the gathered panel, the lock-up or the film's own ending); sound bed `stream-bed`; look `night-sky`.
- **Climax**: two: the constellation at about half-way and the gather at about 83 %, the higher.
- **Example films**: the stream template's example (the stream recipe, 80.6 s at 128 BPM under the library's reading rule: open 14.5, intro 7.5, ask 6.1, evening 7.5, constellation 10.3, verify 5.2, cards 10.8, close 10.8, lock-up 8.0 s; Chinese 82.5 s; the rendered film is the template's own, 91.9 s, which reads every bubble); K's content with every option and the days plans 116.3 s (the stream recipe, Reading); a recomposed segment in the stream recomposition.
- **Source**: own (`assets/templates/stream/…`: `content.js; sched.js; references/modes/stream.md (Scenes)`), split from the template of the stream style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The order is fixed and each scene comes once; the days, the interlude and the lock-up are optional (the template itself draws its nine scenes, with the lock-up). A film that drops the lock-up ends on its own composition over the interlude, and that composition must land the name or the mascot. The two climaxes must be the constellation (about half-way) and the gather (about 83 %); swapping their order loses the build.
