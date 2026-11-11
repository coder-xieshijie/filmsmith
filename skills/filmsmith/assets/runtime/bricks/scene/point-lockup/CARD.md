---
id: point-lockup
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### point-lockup

- **Purpose**: The stream lock-up, two endings: `name` (the mascot winds to the centre and becomes the point the name opens out of; the thread opens with it and settles as a rule under it) or `mascot` (the name opens and the mascot hops from the top of the spine onto the end of the wordmark); the tagline rises a word (a character) at a time.
- **Intent**: End where everything went: the one point becomes the name.
- **Content**: A name (≤ 10 characters) and a tagline (one line).
- **Fits**: `lockup`; The end of a stream film; any product with a short name and a one-line tagline. **Not for**: A long name (over 10 characters); a lock-up that needs a URL or a button.
- **Layout and camera**: the name 168 px at the centre (y 540); the rule under it at y 600; the tagline 42 px at y 680; with `mascot` the mascot perches at the end of the wordmark.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 10 chars | 10 chars | "Skein" |
  | `tagline` | text (claim) | primary | 1 | 36 chars | 15 chars | the example's tagline |
  | `ending` | enum | – | 1 | – | – | `name` (the point becomes the name) | `mascot` (the mascot hops onto the wordmark) |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `name` (the name and tagline together) |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 14–22 beats (7–11 s at 120 BPM); the example plans 17 beats in both languages; the name and tagline are read and the closing line holds at least 6 s.
- **Steps and events**: the mascot winds to the centre into a point (T1) — or stays on the spine; the name opens out of the point, the thread opening with it into the rule (T1); the tagline rises a word (a character) at a time; hold.
- **Needs**: props yarn-mascot, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: a whoosh as the name opens, a chime on the tagline, the bed's outro.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderLock; sched.js lockup`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: The lock-up is optional: a film that ends on a composition of its own leaves it out and puts that composition over [`night-interlude`](../night-interlude/CARD.md) after the close (with an interlude before it, the lock-up follows the interlude). The tagline rises per word in English and per character in Chinese: keep it to one line or it wraps under the rule. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
