---
id: desk-threaded
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### desk-threaded

- **Purpose**: The stream opening: a desk piles up (windows, alerts, a sticky note, fourteen dialog copies, a cursor that never gets to click), freezes on one line, the mascot drops in, one glowing thread pierces every item, goes taut and reels them in, and the emptied desk sinks into the night as the thread straightens into the spine. `opening: 'night'` shows the pile as dark cards over the night.
- **Intent**: Start from the overload everyone recognises, then let one thread take all of it in one move.
- **Content**: Three sessions, 1–6 alerts (four in the example), a two-line note (≤ 36 characters / 16 Chinese characters each), one freeze line (≤ 24 / 12).
- **Fits**: `hook`, `problem`; The open of a product that takes work off people: the overload, then the one thread that takes it. **Not for**: A calm opening; a product that does not take work off people; a pile that must be read item by item.
- **Layout and camera**: full frame; the desk (wallpaper, taskbar 64 px) with items scattered over 1920 × 1080 by seed; freeze line 96 px at the centre; the mascot drops to (230, 156); the thread's path by angle round the mascot; camera locked, the desk sinks 60 px and darkens into the night over the last 2 beats.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `sessions` | list of {title, ask, status} | glance | 3 | 24/26/26 chars | 12/13/13 chars | example copy |
  | `alerts` | list of {title, yes, no} | glance | 1–6 | 26/10/10 chars | 13/4/4 chars | example copy |
  | `note` | list of text | primary | 2 | 36 chars | 16 chars | example copy |
  | `freeze` | text (claim) | primary | 1 | 16 chars | 8 chars | example copy |
  | `opening` | enum | – | 1 | – | – | `desk` (daytime desktop) | `night` (dark cards over the night) |
  | `copies` | number (optional) | – | 1 | 4–30 | 4–30 | 14 |
  | `mascot` / `mascotSize` | image URL / {sit, drop} px (optional, every stream scene) | – | 1 | – | – | the ball of thread / 60 and 96 |
  | `holds` | {key: seconds, or an array per item} (optional) | – | 1 | 0–20 s | 0–20 s | none: primary texts hold their reading time, glances `glance`; keys `note`, `freeze`, `reel` (s from taut to reeled in; 2.5 beats), `sink` (s of the emptied day sinking into the night; 2.75 beats) |
  | `glance` | seconds (optional) | – | 1 | 0.3–3 | 0.3–3 | the film's `glance`, else 0.8 s: how long a glanced text holds |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: 24–44 beats (12–22 s at 120 BPM); the example plans 31 beats in English and 32 in Chinese at 128 BPM (unchanged by the reading rule). Reading: primary, the note and the freeze line (6 Chinese characters a second + 0.5 s; English 0.3 s a word); the windows, alerts and copies are texture, not held. `holds` keys: the slot table.
- **Steps and events**: windows, alerts and the note pop in (T0, a pop each) over about 10 beats, the copies cascade, the cursor wanders without clicking; the freeze (the bed breaks, held for the line's reading time); the mascot drops and squashes (land); thread-pierce (T2, 5 beats, a tick per item, the taut swell on a downbeat: the hook's peak); reel-in (T1, 3 beats); the desk sinks into the night as the thread straightens into the spine (turn). How full the pile gets is `copies` (14 by default; K's desk used 24); the mascot's size is the film parameter `mascotSize` `{ sit, drop }` in px (60 and 1.6 × 60 by default; a film's own mascot, passed as `mascot` with an image URL, often wants about 90 sitting and 240 dropped).
- **Needs**: motions thread-pierce, reel-in; props desk-pile, yarn-mascot, glow-thread; roles ground, panel, ink, dim, accent, onAccent, paper, onPaper, onPaper2, field, fieldEdge, dust, glow, core, panel2, bubble, user, onUser, rule, accentInk, desk1–3, deskBar; type display, text.
- **Sound**: pops per item, a break on the freeze, a thud on the landing, ticks while piercing, an impact and chime when taut, a whoosh on the pull.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js renderOpen; sched.js open; plan.js openItems and the opening's path`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Only the note and the freeze line are read: keep everything else short; the freeze line holds while the bed breaks. Pass the film's whole content as `film`: the scene draws its window of that film (the stars sent before it, the chat feed, the block's place), and its length is fitted with it.
