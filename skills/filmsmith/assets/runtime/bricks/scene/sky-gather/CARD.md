---
id: sky-gather
category: scene
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sky-gather

- **Purpose**: One thread gathers everything (the climax): the spine retracts into the mascot, the thread sweeps the sky catching every star, straightens, the caught stars ride it into its end, and that point opens into the task panel (one row "needs you" in the accent's ink); a nudge hangs on the tether; then the thread lies flat as the baseline of the claim and its three words, and winds back into the mascot.
- **Intent**: Everything comes back to one place, and only one thing in it needs the user.
- **Content**: A caption, a panel (title and 2–4 rows, one marked needs), a nudge, a claim (one line) and three words; optionally a second chapter line after the alert.
- **Fits**: `climax`, `claim`; The climax and claim of a stream film: everything sent out comes back to one panel with one thing for the user. **Not for**: A film that has not sent stars out; a claim longer than one line.
- **Layout and camera**: the sweep covers the whole sky in three passes; the tether from the mascot to the point at (1180, 560); the panel 700 × 420 opens from that point; the claim on the flattened thread at y 640, centred; the three words under it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 34 chars | 14 chars | example copy |
  | `panel` | {title, head?, warnAtNeed?, tabs?, rows: [{title, status, detail, group?, time?}]} (`head`: the title as a space chip and a queued filter; `warnAtNeed`: the "needs you" grey until the alert) | glance | 2–4 rows, 2–3 tabs | 30/34 chars; tab 12, time 8 | 15/17 chars; tab 6, time 5 | example copy; head, tabs, groups, times not drawn; warn from the panel's opening |
  | `nudge` | text | glance | 1 | 34 chars | 17 chars | example copy |
  | `caption2` | text (optional) | primary | 1 | 34 chars | 14 chars | none: not drawn |
  | `claim` | text (claim) | primary | 1 | 30 chars | 14 chars | example copy |
  | `words` | list of text | word | 3 | 10 chars | 4 chars | example copy |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `caption`, `caption2`, `panel`, `nudge`, `claim`, `need` (s from the panel opening to its "needs you"; 1.4 beats) |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 20–36 beats (10–18 s at 120 BPM); the example plans 23 beats in English and 25 in Chinese (24 and 26 before the reading rule read the nudge). Reading: primary, the caption (and `caption2` after the alert), then the claim with its words; the panel's rows and the nudge are glanced (a fixed hold, 0.8 s, or `glance` in seconds on the scene or the film). `holds` keys: the slot table.
- **Steps and events**: the spine retracts (turn); star-sweep (T3, 8 beats; a tick per star caught); the point opens into the panel (T2, the climax: an impact, chime and duck); the one "needs you" pill pulses once (the film's only alert); the nudge on the tether; the panel folds; the thread lies flat under the claim; the three words land one a beat; the thread winds back into the mascot. The panel's filter row counts needs you 1, running 0 and done (every star sent, less the ones a card's new task sent), named by the film's `ui.filter` when it has one. The panel takes ui-kit's parts when given: `tabs` as a segmented control on its title line (the first current), a header where a row's `group` changes, a `time` at a row's end. "Needs you" (the filter pill, the row's dot and lead word, the nudge's dot) is drawn in the look's `warn` role (night-sky: accentInk unless a film sets it, K: #B84A00), the running rings stay in accentInk. With `holds.need` the panel stays still that long before its one "needs you". With `caption2`: a second chapter line after the alert, once the first caption is read (primary). With `panel.head`: the panel's title is a space chip (a catalog glyph, the name, a chevron) and the filter row adds the queued count where it fits. With `panel.warnAtNeed`: the "needs you" (its filter, its row's dot and word) stays grey from the panel's opening until the alert, then turns warn in 0.2 s as the pill pulses and a ring leaves the dot.
- **Needs**: motions star-sweep; props hung-block, yarn-mascot, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: a riser under the sweep, ticks per star, an impact on the panel, the three-note alert with a 6 dB duck on "needs you", a thud per word.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderClose; sched.js close; plan.js GATHER`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Exactly one row needs the user: the `warn` role appears once in the film, here. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
