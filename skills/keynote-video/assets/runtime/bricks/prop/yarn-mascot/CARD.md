---
id: yarn-mascot
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### yarn-mascot

- **Structure**: halo (a soft glow in the accent), ball (r 30, the accent), wound arcs (three, the glow colour), eyes (two, onAccent), highlight; its loose end is the thread's start.
- **Intent**: Give the thread a root the viewer can recognise: the product itself, sitting where all the work comes back to.
- **Content**: Nothing to read: an optional image of the film's own mascot.
- **States**: `sit`, `drop` (high, larger), `squash` (on landing: wider and lower by 18 %), `point` (wound small and faint: the lock-up's point).
- **Sizes**: S 480 × 360, M 720 × 540, L 960 × 720.
- **Swap points**: `image` (optional: the film's own mascot, drawn at the same anchor and size, transparent background); without it the ball of thread drawn in code. `size` (optional, 30–160 px, default 60): the box the mascot fills sitting on the spine; the stream scenes take it as the film parameter `mascotSize` `{ sit, drop }` (the box sitting, and while dropped into the desk; drop defaults to 1.6 × sit), which also scales the lock-up's mascot.
- **Parameters** and **Roles**: `palette`, `colors`, `image`; roles ground, accent, glow, core, onAccent.
- **Fits**: `hook`, `lockup`; A product with a mascot or a character; the root the thread grows from. **Not for**: Brands without a mascot that must not have one; people or photographs.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Source**: own (`assets/templates/stream/…`: `film.js mascot(), renderOpen (the drop), renderLock (the point)`), split from the stream style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: A swapped image is drawn at the same anchor and size: give it a transparent background and its own visual centre at the middle. The squash on landing is the only bounce in the style; do not add more.
