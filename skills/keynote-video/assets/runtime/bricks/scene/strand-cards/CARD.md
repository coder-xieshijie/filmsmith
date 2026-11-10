---
id: strand-cards
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### strand-cards

- **Purpose**: Whole – part – whole: three strands (or two) fork from the spine and each ends in a glass card; each card is enlarged in turn in place on its strand, its rows arriving, the next growing as the previous shrinks; then all of them again and a sub-line. One card is a single pass: one strand straight into it, already large, its rows read, then the sub-line.
- **Intent**: Show the parts and keep the whole: up to three things the product keeps, each read in turn.
- **Content**: Two captions, one to three cards each with a title, a sub-line and 1–5 rows (≤ 34 characters / 17 Chinese characters); optionally per card a caption while it is open (two or three cards), a line that flows into it, a new task that starts from it; optionally the tangle the strands are pulled out of.
- **Fits**: `demo`, `proof`; What the product keeps between tasks (memory, decisions, files): up to three, shown together and one by one, or one shown on its own. **Not for**: More than three things; things that are not lists; one card that needs a sentence of its own while open (one card is read under the scene's caption).
- **Layout and camera**: three strands fork from the spine at y 420, 600, 780 to three glass cards 640 × 300 at x 1060; the enlarged card goes to 1.45 × centred on y 600 at x 900, the others dim to 30 % and step right 60 px; captions at (1000, 112). Two cards hang at y 435 and 645; one card sits at the enlarged place from the start (1.45 ×, x 900), its strand straight from the spine into its foot.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 34 chars | 14 chars | example copy |
  | `caption2` | text | primary | 1 | 34 chars | 14 chars | example copy |
  | `cards` | list of {title, sub, rows, say?, flow?, task?: {title, detail?}} | primary (`say`) · glance (title, rows, flow, task) | 1–3 (no `say` with one) | 14/30/34 chars, 1–5 rows (with the flow line); say 34, task 30/34 | 7/15/17 chars, 1–5 rows; say 14, task 15/17 | example copy; the optional fields not drawn |
  | `tangle` | flag (optional) | – | 1 | – | – | false |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `caption`, `cards`, `rows`, `say`, `flow`, `task` (arrays per card), `caption2` |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 10–56 beats (5–28 s at 120 BPM); the example plans 23 beats in English and 24 in Chinese (29 and 33 before the reading rule read every row); with its first two cards 19 beats, with its first card alone 11. Reading: primary, the caption, each card's `say` while it is open, the second caption; the titles, rows, the flowed line and the new task are glanced (a fixed hold, 0.8 s, or `glance` in seconds on the scene or the film). The tangle adds 6 beats. `holds` keys: the slot table.
- **Steps and events**: the strands fork and the cards land (T0 each); strand-zoom into card 1 (T1), rows 0.6 beat after and 0.4 beat apart, each held for a glance; handover to card 2, card 3; back to the three; the second caption. With two cards the same, with two handovers fewer; with one card the strand forks straight into the large card, its rows arrive and are glanced, the scene's caption stays, the second caption follows (no zoom in or out). With `tangle: true` the scene opens with 6 beats from the original K: up to seven earlier tasks' beams light again from the spine to their stars, knot into a turning tangle (centre 1330, 620; seed 606), the loose end lights at (960, 610), the thread reaches over and pulls the strands straight out of it (2.6 beats) to the cards, and the cards land on their ends. Per card: `say` replaces the caption while that card is open (the scene's caption returns when the three are whole again); `flow` travels as a bead and a pill along the card's strand into it and becomes its last row; `task` hooks a row off the spine (x 290, y 820) that runs, turns done and leaves as a star, which stays for the closing sweep.
- **Needs**: motions strand-zoom; props hung-block, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: a whoosh per enlargement, soft pops per row.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderCards, cardGeo; sched.js cards`), split from the stream style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: The rows are glances (0.8 s each): what a card says is its `say`, read while the card is open; a card without `say` holds for its rows' glances only. One card is a single pass, with no whole before or after: its rows are read under the scene's caption, so its `say` is refused; `day-after-day` needs three cards. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
