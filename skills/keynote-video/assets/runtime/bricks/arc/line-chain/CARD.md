---
id: line-chain
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### line-chain

- **Tells**: a video tool's pipeline as one line: brief, word, colour, boards, physics, timing, cut, output, proof, name
- **Intent**: Tell the tool's pipeline as one unbroken transformation, each link a step it really performs.
- **Fits / does not fit**: Reels of video, motion and rendering tools, 12–45 s. Not: Any other subject; more than six steps; steps that cannot each be shown by one link.
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 4–7 | 1 (optional) | brief-loop | – | intro |
  | `hook` | 1.5–3 | 1 (optional) | weight-word | hook | intro |
  | `demo` | 2–4 | 1 (optional) | glyph-swatch | – | build |
  | `demo` | 2–4 | 1 | panel-board | – | build |
  | `demo` | 3.5–5 | 1 | sphere-merge | – | build |
  | `demo` | 3–4.5 | 1 (optional) | ease-ruler | – | build |
  | `demo` | 2.5–4 | 1 (optional) | edit-tracks | – | build |
  | `rest` | 2–3 | 1 (optional) | ink-words | – | break |
  | `climax` | 8–11 | 1 (optional) | sheet-flood | reveal | drop |
  | `lockup` | 4–7 | 1 | name-cut | lockup | outro |

- **Length**: 12–45 s; peaks 2–3; sound bed `thread-bed`.
- **Climax**: the contact sheet on the drop (about 70 % of the film).
- **Example films**: the thread template's example (the thread demo film); a recomposed segment in the thread recipe.
- **Source**: own (`assets/templates/thread/content.js; film.js REGISTRY; references/modes/thread.md (Scenes, Use cases)`), split from the thread style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The order is fixed; leave out the head or the tail only as wholes (storyboard → merge → close is the shortest, 6 bars).
