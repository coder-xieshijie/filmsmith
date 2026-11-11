---
id: ask-to-star
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### ask-to-star

- **Purpose**: One ask becomes one task and one star: the user's message (with a file) and the product's reply arrive in the chat block, a chip says a task was created, the task row unfolds on a beam, runs, turns done, then shrinks into its ring and leaves as a star that stays in the sky.
- **Intent**: Show the whole loop once, small: ask, task, done, kept.
- **Content**: A caption, an optional file name, an ask and a reply (bubbles), a chip, a task title with running and done lines; optionally the picture the ask is about and a decision asked with a recommendation (a sub-caption, a question, 2–4 options with a short description, the recommended one tagged).
- **Fits**: `demo`; The first demo: the smallest whole loop of handing one thing off. **Not for**: Tasks that need a screen to show their result; a product with no task list.
- **Layout and camera**: the chat block left (x 290–850); the task row 760 × 130 hung on a beam from the block's right edge at x 1060; the caption at (1000, 112); the star arcs up into the right half of the sky.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 34 chars | 14 chars | example copy |
  | `file` | text (optional) | glance | 1 | 18 chars | 14 chars | example copy |
  | `ask` | text | glance | 1 | 86 chars | 40 chars | example copy |
  | `reply` | text | glance | 1 | 86 chars | 40 chars | example copy |
  | `chip` | text | glance | 1 | 34 chars | 17 chars | example copy |
  | `task` | {title, running, done} | glance | 1 | 30/34/34 chars | 15/17/17 chars | example copy |
  | `image` | image URL (optional) | – | 1 | – | – | none: not drawn |
  | `choice` | {caption, question, step?, options: [{label, desc?}], pick?, answer?} (optional) | primary (its caption) · glance | 2–4 options | 34/40/14/30/40 chars | 14/20/8/14/20 chars | none: not drawn |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `caption`, `ask`, `reply`, `task`, `done`, `choiceCaption`, `choice`, `answer`, `image` (s the large picture stays up after it lands) |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 12–44 beats (6–22 s at 120 BPM); the example plans 13 beats in both languages (20 and 21 before the reading rule read every bubble). Reading: primary, the caption (and the choice's caption); the ask, the reply, the chip, the task's lines, the question card and the answer are glanced (a fixed hold, 0.8 s, or `glance` in seconds on the scene or the film). The image adds about a beat and a half before the ask, the choice about 4–5 s after the star. `holds` keys: the slot table.
- **Steps and events**: the caption; the ask (with its file) and the reply arrive (pops); the chip; the row unfolds on its beam (hook-unfold); its ring runs; done (the tick, the done line cross-fades); star-launch (T1, 3 beats). With `image`: the picture (a card 600 × 400 at x 1080, y 330) flies in on the right and lands on the first beat, the ask follows 0.6 beat later and the picture shrinks into it as a 200 × 133 thumbnail (in place of the file chip). With `choice`: after the star leaves, the sub-caption; the question card (920 wide at x 950, y 250: the question, the step, a close mark; options with a letter, the label, the recommended tag in the accent and a grey description; an input and "skip") unfolds, the options arriving 0.16 s apart; a cursor comes in and clicks the recommended option (`pick`, default the first), which lights; the card folds into the chat and the user's answer (`answer`, default "A: label") arrives as a bubble. The card is a glance (the sub-caption is what is read). With `holds.image`: the picture stays large beside the block for that long after it lands (rising 130 px to clear the task row as it unfolds), then shrinks into the ask as its thumbnail, at the latest half a second before the choice's card or the scene's end; the ask's thumbnail place stays empty until then.
- **Needs**: motions hook-unfold, star-launch; props hung-block, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: pops per bubble, a whoosh on the unfold, a pluck as the star leaves.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderAsk, renderChat, renderBG stars; sched.js ask`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Decision: the questionnaire is drawn in the engine.** A stream scene is one canvas the engine draws as a whole film (the chat feed, the blocks' places, the stars all read from one plan), so a DOM brick such as `prop/choice-chip` or `scene/chip-select` cannot be hung inside it: it would sit outside the engine's z-order and timing, and the chat could not take its answer. The engine draws the same card (ui-kit's question card: letter, label, recommended tag, description, arrow; input and skip) with the stream's blocks; opening a hook for DOM props was not taken, because every stream block would then need two drawings kept in step.
- **Pitfalls**: The picture is passed by URL and loaded before the first frame (`image`); without it the card draws a document glyph. Keep the options' labels short: the card is read at a glance, the sub-caption carries the scene. The done line is a glance (0.8 s): keep it to a few words of what came back ("3 icons"), not "Done"; the caption is the scene's one read sentence. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
