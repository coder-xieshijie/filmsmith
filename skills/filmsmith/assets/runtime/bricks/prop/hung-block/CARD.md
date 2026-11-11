---
id: hung-block
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### hung-block

- **Structure**: hook (point and reach), paper or glass body (radius 30 / 28, a soft shadow), bubbles (the user's dark, the product's warm grey), ring / tick (a running ring in the accent becoming a neutral tick), rows, pills. Forms: `chat` 560 × 520, `row` 760 × 130, `card` 640 × 300 (glass), `panel` 700 × 420.
- **Intent**: Show the interface as small objects the thread holds, never as a screen that fills the frame.
- **Content**: A chat (1–3 bubbles), a task row (title, running and done lines), a glass card (title and up to three rows) or a panel with one row that needs the user.
- **States**: `open`, `done`, `folded` (width 0 at the hook; listed last so the sample folds a finished block back into the thread and the size stills show it open) (the ring becomes a tick, the detail cross-fades to the done line). hook-unfold moves folded ↔ open; card-squash is the library's other way back into a line.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `title` (30 / 15 chars), `detail` and `done` (34 / 17), `lines` (1–3 bubbles, 86 / 40), `rows` (1–3, 34 / 17); without them the example's copy. The panel takes ui-kit's parts when given (not drawn otherwise): `tabs` (2–3, 12 / 6, a segmented control on the title line, the first current), `group` (a header over the rows, 34 / 17), `times` (one per row at its end, 8 / 5). `blocks.js` `bubbleOf(…, quote)` sets a quoted line small above a bubble's text.
- **Parameters** and **Roles**: `form` (chat | row | card | panel), `palette`, `colors`; roles ground, accent, glow, paper, onPaper, onPaper2, bubble, user, onUser, rule, accentInk, warn, panel, panel2, ink, dim.
- **Fits**: `demo`, `proof`; Showing an agent's interface as small pieces on the night: chat, a task, a summary card, a status panel. **Not for**: A full-screen app screenshot; long documents; more than three rows a block.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js css() (.paper, .chat, .bub, .row, .ring, .tick, .glass, .pill), renderChat, renderAsk, renderCards; plan.js cardAt`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Keep sky around it: a block wider than about half the frame stops reading as hung on the thread. "Needs you" is the `warn` role and appears once (the one alert; accentInk unless the film sets `warn`, as K's ui-kit orange #B84A00); the running ring stays accentInk; a done row is a neutral tick, not the accent.
