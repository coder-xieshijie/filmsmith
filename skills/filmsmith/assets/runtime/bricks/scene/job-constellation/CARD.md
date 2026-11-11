---
id: job-constellation
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### job-constellation

- **Purpose**: A job that keeps going: an ask and an offer in the chat, a dashed workspace region with its name, three jobs and a plan launched from the thread as stars along beams, each with its status; results flow back as beads of light and the jobs turn done; on the drop the plan joins the three into a constellation; one answer comes back into the chat.
- **Intent**: Show that a bigger job is split, run and brought back as one answer, without the user watching each part.
- **Content**: A caption, an ask, an offer, a yes, a workspace name, three job labels, a plan label and its waiting line, a result, a second caption.
- **Fits**: `climax`, `demo`; The middle peak of a stream film: a bigger job split into parts that run in the background and come back as one answer. **Not for**: A job without parts; a product that does not run things in the background.
- **Layout and camera**: the chat block left; a dashed workspace region x 1060–1840 with its name; three job stars and a plan star placed in it along beams from the spine; labels 34 px under each star; the constellation lines between them; the caption at (1000, 112).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 34 chars | 14 chars | example copy |
  | `ask` | text | glance | 1 | 86 chars | 40 chars | example copy |
  | `offer` | text | glance | 1 | 86 chars | 40 chars | example copy |
  | `yes` | text | glance | 1 | 10 chars | 4 chars | example copy |
  | `workspace` | text | glance | 1 | 18 chars | 9 chars | example copy |
  | `jobs` | list of {label} | glance | 3 | 18 chars | 9 chars | example copy |
  | `plan` | {label, waits} | glance | 1 | 18/22 chars | 9/11 chars | example copy |
  | `result` | text (claim) | primary | 1 | 86 chars | 40 chars | example copy |
  | `caption2` | text | glance (shares the screen with the result) | 1 | 34 chars | 14 chars | example copy |
  | `head` | flag (optional) | – | 1 | – | – | false: the workspace's name as a small label; true: a header with the name as a space chip and the filter row with live counts (its names the film's `ui.filter`, else the rows') |
  | `modal` | {title, fields: [{label, value, required?}], note?} (optional) | glance | 1–3 fields | 40/30/30/40 chars | 20/15/15/20 chars | none: not drawn |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `ask`, `offer`, `modal`, `result`, `caption2` |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 20–44 beats (10–22 s at 120 BPM); the example plans 22 beats in English and 23 in Chinese (31 and 31 before the reading rule read the ask and the offer). Reading: primary, the caption and the result (the second caption shares the screen with the result, so it is glanced (a fixed hold, 0.8 s, or `glance` in seconds on the scene or the film), as are the ask, the offer, the dialog and the labels). The modal adds its glance (at least 1.5 beats). `holds` keys: the slot table.
- **Steps and events**: caption; ask, offer, yes (pops); the workspace region draws (T0); three beam-returns and the plan launch (T1, staggered a beat); the results return (a chime each); on the drop the plan links the three (T2, the middle peak); the result bubble; the second caption. With `modal`, the new-workspace dialog (600 wide at x 1150, y 400: a 34 px title, 28 px labels with a warn-coloured `*` when required, 30 px inputs typed in, a 28 px note) opens 0.3 beat after the yes, held for its glance (at least 1.5 beats), and shrinks into the workspace's name as the region draws. With `head`: the workspace opens with its header instead of the small label: the name as a space chip (a catalog glyph, the name, a chevron) and a filter row (all, needs you, running, done, queued) whose counts follow the jobs.
- **Needs**: motions beam-return; props hung-block, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: whooshes on the beams, a chime per result (A5, C6, E6), an impact and chime with a 4 dB duck on the link.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderConst; sched.js constellation; plan.js CONST`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: The link into a constellation lands on the drop; the labels must already be settled by then. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
