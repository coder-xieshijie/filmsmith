---
id: spine-intro
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### spine-intro

- **Purpose**: The product introduces itself from the top of the thread: its name lights beside the mascot, a point lights on the spine, a short light reaches right and the chat block unfolds from it; two lines from the product arrive as bubbles.
- **Intent**: Let the product speak for itself, from the thread that just took everything.
- **Content**: A name (≤ 10 characters) and two lines (≤ 86 characters / 40 Chinese characters each).
- **Fits**: `turn`, `hook`; Right after the hook: the product's name and what it promises, in its own voice. **Not for**: A product without a conversational interface; more than two lines.
- **Layout and camera**: the mascot at (230, 156), the spine x 230 from y 236 to 1010; the name 58 px right of the mascot; the chat block 560 px wide at x 290, its hook 64 px below its top; sky everywhere else.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `name` | text | glance | 1 | 10 chars | 10 chars | "Skein" |
  | `lines` | list of text | primary | 2 | 86 chars | 40 chars | example copy |
  | `title` | text (optional) | glance | 1 | 10 chars | 10 chars | none: not drawn (K: the product's name, 96 px) |
  | `role` | text (optional) | glance | 1 | 36 chars | 20 chars | none: not drawn (who it is, 40 px under the title) |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `lines` (array), `role` |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 12–26 beats (6–13 s at 120 BPM); the example plans 16 beats in English and 15 in Chinese (unchanged by the reading rule). Reading: primary, the two lines one after the other; the title and role are glanced (a fixed hold, 0.8 s, or `glance` in seconds on the scene or the film). `holds` keys: the slot table.
- **Steps and events**: the name lights (blur entrance per word, T0); the hook lights and the chat block unfolds (hook-unfold, T0, 1 beat); the two bubbles arrive one after the other, each held for its reading time. With `title` and `role`, the product's name rises large on the right of the block (96 px at x 1060, y 392) 0.9 beat in, a word (a character) at a time, and who it is under it (40 px, dim); both hold to the scene's end and are read (the scene grows to fit them).
- **Needs**: motions hook-unfold; props hung-block, yarn-mascot, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: a whoosh as the block unfolds, a pop per bubble; the bed's turn (a break into the intro).
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderSpine, renderChat; sched.js intro; plan.js cardAt`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: The chat block stays for the next scenes (its place is planned over the film): do not end on an empty spine. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
