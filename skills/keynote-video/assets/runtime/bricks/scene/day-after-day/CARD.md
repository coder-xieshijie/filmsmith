---
id: day-after-day
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### day-after-day

- **Purpose**: The days go on in one chat: a chat block unfolds from the spine and days scroll past in it (a divider, an ask and an answer each), today's question gets an answer written from what was kept, the progress runs back along the three strands to the mascot, and a short line hangs on each card. The stream skeleton's one optional scene, between strand-cards and sky-gather.
- **Intent**: Show the product keeps going: days pass in one chat and it still knows where things stand.
- **Content**: A caption and an optional sub-line, 2–5 days (a divider, an ask and an answer each, read at a glance), today's ask and answer, three short lines for the cards (≤ 34 characters / 14 Chinese characters); optionally one summary card's title, in place of the three cards, with rows of its own and the lines large.
- **Fits**: `proof`, `rest`; After the cards: the product is used every day and keeps what matters (the chat does not break, nothing is forgotten, details come back). **Not for**: A film without the three cards before it; one day only (that is ask-to-star).
- **Layout and camera**: the chat block at the chat's place (x 290–930, y 236–1010, hooked at y 300); the three cards stay where strand-cards left them (x 1100); the beads run from each card's strand end to the spine and up to the mascot (230, 156); each card's line is a pill on its right side; captions at (1000, 112) and the sub-line under it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 34 chars | 14 chars | example copy |
  | `sub` | text (optional) | glance | 1 | 48 chars | 22 chars | example copy in samples; not drawn in a film that leaves it out |
  | `days` | list of {day, user, bot} | glance | 2–5 | 12/86/86 chars | 6/40/40 chars | example copy |
  | `ask` | text | glance | 1 | 86 chars | 40 chars | example copy |
  | `answer` | text (claim) | glance | 1 | 86 chars | 40 chars | example copy |
  | `notes` | list of text | glance | 3 | 34 chars | 14 chars | example copy |
  | `summary` | text (optional) | glance | 1 | 14 chars | 7 chars | none: the lines hang on the three cards |
  | `summaryRows` | list of text (optional, with `summary`) | glance | 1–3 | 34 chars | 17 chars | none: the card has its title and lines only |
  | `bigNotes` | flag (optional, with `summary`) | – | 1 | – | – | false: the lines are small tags |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `caption`, `ask`, `answer`, `notes`, `dayGap` (s between two days; 0.45, 0 with `summary`), `noteGap` (s between two lines; half a beat) |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language, with this scene put in its place |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 12–28 beats (6–14 s at 120 BPM); the example plans 14 beats in both languages. Reading: primary, the caption (one sentence a screen, so today's answer, which shares it, is glanced (a fixed hold, 0.8 s, or `glance` in seconds on the scene or the film), as are the sub-line, the days, the ask and the three lines). `holds` keys: the slot table.
- **Steps and events**: the caption (and the sub-line); the block unfolds from the hook (hook-unfold); the days scroll past, a divider and two bubbles each 0.45 s apart; today's ask and the answer (pops); the beads run back along the strands to the mascot, which glows (beam-return); the three lines hang on the cards half a beat apart; the block folds into the spine before the closing sweep. With `summary`: the three cards fold into one summary card (its title over a rule, spanning the three cards' places) as the block unfolds, the days are in the chat at once and scroll by in one move, the three lines hang inside the card; the closing sweep folds it as it folds the cards. With `summaryRows` the card holds those rows under its title (as the cards it gathered, a row each, sliding in as it opens) over its rule; with `bigNotes` the three lines are set large under the rule (the card title's size, fitted to its width) instead of tags.
- **Needs**: motions hook-unfold, beam-return; props hung-block, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, warn, desk1–3, deskBar; type display, text.
- **Sound**: a pop per day, the send and the answer's pop, a return chime as the beads arrive, a pluck per line.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (the source film: "一直用下去", the days scrolling past, the progress along the strands, three lines on the cards), from the stream original K; drawn by the stream engine (`prop/glow-thread/engine.js` renderDays, `sched.js` days).
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; as every stream scene (Noto Sans SC after DM Sans, information text at 28 px, reading by the runtime's `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick from the stream original K, so the compare is waived. Changed from K: the days are a scrolling chat block in the stream's own block (K swapped dated cards), the lines hang on the cards' right side rather than beside the mascot; the length comes from reading, so it runs longer than K's 4.4 s.
- **Pitfalls**: The days are glances: keep each ask and answer to a few words; the reading belongs to the caption. Pass the film's whole content as `film` (with the cards scene): the strands and cards it uses are that film's; a film without a `days` scene gets this one put in its place.
