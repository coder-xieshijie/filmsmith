---
id: evening-stars
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### evening-stars

- **Purpose**: One evening of asks: the chat block lowers and a task list grows out beside it; every ask adds a running row and launches a star from its ring; then a burst of unnamed tasks (those past the film's `ui.cap` queued; without it the last two) and the list's counts. Too many to read is the point.
- **Intent**: Make the sky fill up: the scale of what is handed off, felt rather than read.
- **Content**: A caption, 3–8 asks (each a bubble and a task title, read at a glance; optionally a file chip on the ask and a progress line on the row), a number of further tasks (0–16); optionally the list's filter tabs, one quoted follow-up sent to an earlier task (after the burst, or between the asks), and file chips inside the bubbles.
- **Fits**: `demo`, `proof`; Showing volume after the single loop: the product takes many things in one evening. **Not for**: A scene where each task must be read; fewer than three asks.
- **Layout and camera**: the chat block lowered to the bottom left; the task list grows to its right (rows 64 px apart, scrolling up as they pass 8); stars launch from each row's ring into the upper sky; the caption at (1000, 112).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 34 chars | 14 chars | example copy |
  | `asks` | list of {ask, task, file?, progress?} | glance | 3–8 | 86/30 chars | 40/15 chars | example copy |
  | `more` | number | – | 1 | 0–16 | 0–16 | the example's count |
  | `asks[i].file`, `asks[i].progress` | text (optional) | glance | – | 18 / 34 chars | 14 / 17 chars | none: not drawn |
  | `tabs` | flag (optional) | – | 1 | – | – | false |
  | `fileInBubble` | flag (optional) | – | 1 | – | – | false: a file chip sits over its bubble |
  | `followUp` | {caption, quote, text, to, after?, tag?} (optional; `after`: the ask it follows, at or after `to`) | primary (its caption) · glance | 1 | 34/40/86/–/18 chars | 14/20/40/–/9 chars | none: not drawn |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `caption`, `followUpCaption`, `followUp`, `tag`, `askGap` (s between two asks; max(0.75 beat, 0.5 s)), `burstGap` (s between two unnamed tasks; 0.2) |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 12–36 beats (6–18 s at 120 BPM); the example plans 16 beats in both languages; the number of asks sets it. Reading: primary, the caption (and the follow-up's caption); everything in the chat and the list is glanced (a fixed hold, 0.8 s, or `glance` in seconds on the scene or the film). The follow-up adds about 3–4 s. `holds` keys: the slot table.
- **Steps and events**: the block lowers and the list grows (T1); per ask: a bubble, a running row, a star (star-launch, compressed); the burst (unnamed rows; the rows past `ui.cap`, or without it the last two, queued with dashed rings that do not spin and half-bright stars); the counts (running and queued follow `ui.cap`). With `progress` on the asks, the rows take two lines (the task, then "running · progress") 84 px apart and the list scrolls after 4 instead of 6; with `tabs: true` the header shows ui-kit's filter tabs (all, needs you 0, running n, done, queued n) under the title, named by the film's `ui.filter` when it has one (the done tab then counts the stars already sent; see glow-thread for both counts); `file` puts a file chip above that ask. With `followUp` (`to` the index of an ask): a sub-caption, then the quoted addition arrives in the chat (the quote small above the text, a bar on its left), a beam carries it to that task's star, which flares, a tag (`tag`, default "task · follow-up") hangs by it, and the list scrolls back to that row and outlines it. With `followUp.after`: the follow-up takes the slot after that ask instead of coming after the burst; the asks after it wait one slot, its beam flies to the star while they go on, and the list keeps scrolling once its tag is up. With `fileInBubble`: the asks' file chips sit inside their bubbles, over the text.
- **Needs**: motions star-launch; props hung-block, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: a pluck per star climbing the pentatonic; the bed builds.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderEvening, listScrollEased, renderBG stars; sched.js evening`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Only the caption is read; the rows scroll by. Do not raise their size to make them readable, the point is that there are too many. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
