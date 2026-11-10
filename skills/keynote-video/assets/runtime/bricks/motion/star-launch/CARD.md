---
id: star-launch
category: motion
tier: T1
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### star-launch

- **Looks**: a task row shrinks into its status ring, its beam retracting; from the ring a star leaves with a short comet tail, arcs up into the sky, flares and stays, twinkling.
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: Each task the product takes; a count that should be felt as a sky filling up. **Not for**: Tasks that must stay readable after they finish; a single big reveal.
- **Intent**: Every task handed off is not lost: it becomes a star the product keeps watching.
- **Content**: Nothing to read: the row (a placeholder) and where its star settles.
- **Parameters**: `from` (the ring's point), `to` (where the star settles); roles read: `paper`, `onPaper`, `accent`, `glow`, `core`.
- **Theory**: A thing that becomes a lasting mark is remembered (object permanence); the arc reads as sending, not falling.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Length and easing**: 3 beats (range 2–4): the row in3 over 0.35 s towards its ring; the star on a quadratic arc through a vertex 120 px above, io2 over 0.8 s, 8-step tail, ×1.7 in flight.
- **Sound**: a pluck per star up an A-minor pentatonic, a short whoosh.
- **Source**: own (`assets/templates/stream/…`: `film.js renderAsk (the row's exit, in3 over 0.35 s) and renderBG stars (quadratic arc via a vertex 120 px above, io2 over 0.8 s, 8-step tail); plan.js the ask's star`), split from the stream style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: The star stays: it must be in every later frame of the film (the closing sweep catches it). Leave from the ring, not from the row's centre, or the row reads as exploding.
