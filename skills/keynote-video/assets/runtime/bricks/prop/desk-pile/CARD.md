---
id: desk-pile
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### desk-pile

- **Structure**: wallpaper (accent-tinted gradient), taskbar (64 px, the sessions' names, an unread badge), window ×3 (title bar, the ask, a status with its ring; one asks for approval with two buttons), alert ×4, note (a sticky note, two lines), copy ×14 (the approval window cascading), cursor.
- **Intent**: Show "too much at once" as texture before the product takes it all.
- **Content**: Three sessions (title, ask, status), four alerts (title, yes, no), a two-line note; the copies repeat the sessions.
- **States**: `piled` (every item in, in order: windows, alerts, note, copies), `pierced` (every item lit with the accent's ring), `empty` (listed last: the sample ends on the emptied desk, the size stills show the pile). thread-pierce moves piled → pierced; reel-in empties it.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `sessions` (3 × title 24/12, ask and status 26/13), `alerts` (1–6 × title, yes, no), `note` (2 lines, 36 / 16), `copies` (optional, 4–30 dialog copies; 14 by default); without them the example's copy.
- **Parameters** and **Roles**: `opening` (desk | night), `seed`, `palette`, `colors`; roles paper, onPaper, onPaper2, bubble, user, onUser, rule, desk1–3, deskBar, panel, panel2, ink, dim, accent.
- **Fits**: `hook`, `problem`; The problem of a product that takes work off people: too many windows, approvals and questions at once. **Not for**: A pile that must be read item by item; a calm opening; a product that is not about handing work off.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `plan.js openItems; film.js css(), buildDOM() (the opening), renderOpen`), split from the stream style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Only the note and the freeze line are read; the windows and alerts are texture, so their copy may be short and generic. The copies (14 by default) cascade from the approval window, starting further up and left the more there are: keep that window's ask short or the cascade covers the note.
