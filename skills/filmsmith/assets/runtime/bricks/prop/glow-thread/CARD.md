---
id: glow-thread
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### glow-thread

- **Structure**: haze (16 px, accent), body (7 px, accent), core (2.6 px, glow), all additive; head (a white-hot point with a 44 px halo while it travels); knot (a glow where it touches something); hook (a lit point on the spine and a short reach right). Its home: the mascot at (230, 156), the spine x 230 from y 236 to 1010.
- **Intent**: Keep one thread on screen through the whole film: whatever arrives, the thread takes it, sends it or brings it back.
- **Content**: Nothing to read: the thread's form (running, spine, hooked, taut).
- **States**: `running` (the head travelling down, 35 % drawn), `spine` (straight down from the mascot), `hooked` (a point lit with a short light reaching right), `taut` (wider, a glow at its middle). thread-pierce, hook-unfold and star-sweep move between them.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: none (the thread carries no text).
- **Parameters** and **Roles**: `palette`, `colors`. The engine the scenes import: `kit.js` (`filmScene`, `text`), `engine.js` (`createFilm`, `planOf`), `plan.js`, `sched.js`, `rules.js`, `text.js`, `draw.js`, `examples.js`. `createFilm(content, { colors, palette, mascot, mascotSize: { sit, drop }, images: { url: Image } })`: every stream scene passes its `mascot` (an image URL), `mascotSize` and the pictures its film names (`image` on a scene) through `kit.js`. The skeleton is the template's scenes in their order, each once: `open`, `intro`, `ask`, `evening`, `constellation`, `verify`, `cards` (one to three cards), then the optional `days` (day-after-day, with three cards), `close`, the optional `interlude` (night-interlude: the night after the close for a composition of the film's own) and the optional `lockup`. Two film-wide counts in `ui`: `cap` (an integer ≥ 1, the tasks that run at once: in the evening the rows past it are queued, a dashed ring that does not spin, and the header's running and queued counts follow it; without it the last two rows are queued, as in the template) and `filter` (`{ all, needsYou, running, done, queued }`, the filter row's names, which then carry counts: the done tab counts the stars already sent; any name left out falls back to the row's own, so a film without `filter` keeps its tabs). The panel's done count is the stars minus the ones a card's new task sends. Every option a scene brick adds is optional, and a film that gives none draws frame for frame as before; roles ground, accent, glow, core, field, fieldEdge, dust.
- **Fits**: `hook`, `demo`, `climax`; Every scene of a stream film; a line of light that ties loose things together. **Not for**: A line that carries text; a line in a second colour; a light ground.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js (thread, glow, star, renderSpine, render*); plan.js; sched.js; timing.rules.js; lang.js`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Draw it additively (lighter) over the night only: on a light ground the three passes turn into a grey smear. It never breaks: a block leaves by folding back into it, a star by a beam that stays.
