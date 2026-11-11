---
id: check-gate
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### check-gate

- **Purpose**: Done means checked: a gate (a vertical stroke of the thread) rises from its middle; the item, hung on a beam, slides up to it, is stopped with a white flash and sent back ("not passed" in grey), is reworked, slides through and is ringed in the accent ("checked"); then the chat block folds back into the spine.
- **Intent**: Show that a result is not "done" until it has passed a check, failing once first.
- **Content**: A caption, a gate word (≤ 10 characters / 4 Chinese characters), an item label, a fail line and a pass line.
- **Fits**: `proof`; The proof of an agent's result: it was checked before it came back. **Not for**: A product without a check step; several items at once.
- **Layout and camera**: the gate a vertical stroke of the thread at x 1300 from y 380 to 700 with its word above; the item (a paper row) on a beam from the chat block, sliding from x 900 to the gate; the caption at (1000, 112).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 34 chars | 14 chars | example copy |
  | `gate` | text | glance | 1 | 10 chars | 4 chars | example copy |
  | `item` | text | glance | 1 | 18 chars | 9 chars | example copy |
  | `fail` | text | glance | 1 | 22 chars | 11 chars | example copy |
  | `pass` | text | glance | 1 | 22 chars | 11 chars | example copy |
  | `explain` | text (optional) | glance | 1 | 86 chars | 40 chars | none: not drawn |
  | `graph` | {caption, node, outs: [3–6], back, caption2} (optional) | primary (its two captions) · glance | 3–6 arcs | 34/18/22/22/34 chars | 14/9/11/11/14 chars | none: not drawn |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `caption`, `fail`, `explain`, `pass`, `graphCaption`, `outs`, `graphCaption2`, `back` |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 10–34 beats (5–17 s at 120 BPM); the example plans 11 beats in both languages (13 and 15 before the reading rule read the fail and pass lines). Reading: primary, the caption, then the graph's two captions one after the other; the fail and pass lines, the explanation, the arcs' names and the return are glanced (a fixed hold, 0.8 s, or `glance` in seconds on the scene or the film). The graph adds about 4–5 s. `holds` keys: the slot table.
- **Steps and events**: the gate rises from its middle (T0); the item slides up, is stopped (white flash, a stamp) and sent back with the grey fail line; its ring runs (rework); it slides through and is ringed in the accent with the pass line; the chat block folds into the spine (a whoosh; card-squash is the library's version of the fold). With `explain`, the product says why in the chat half a second after the stop (a bot bubble), and the rework waits for it to be read. With `graph`, after the fold: its caption; a node box (150 × 80 at x 1690, y 600); one named arc per `outs` from the thread (236, 640) to the node, half a beat apart, each with its pill at its height; then one thick arc back below (the big accent pill `back`) with `caption2`; the scene grows to hold it (about 4–6 s).
- **Needs**: props hung-block, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: a stamp when stopped, a chime on the pass, a whoosh as the block folds.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderVerify; sched.js verify`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: The fail is grey and the pass is the accent: a red fail adds a second accent the style does not have. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
