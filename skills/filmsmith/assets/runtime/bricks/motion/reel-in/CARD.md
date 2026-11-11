---
id: reel-in
category: motion
tier: T1
family: line-path
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### reel-in

- **Looks**: every threaded item slides back along the thread into the mascot, the nearest first, shrinking to a speck and fading over its last quarter, while the thread reels in behind the farthest; all arrive together.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas.
- **Use**: Ending a pile: the product takes everything in one move. **Not for**: Items that must stay readable; a merge into a hub with several sources (hub-links).
- **Intent**: Make taking everything over feel like one effortless pull.
- **Content**: Nothing to read: the threaded items and the point they go into.
- **Parameters**: `items`, `start`; roles read: `ground`, `accent`, `panel`.
- **Theory**: Arriving together reads as one pull; the stagger by distance keeps the thread taut behind the last item.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Length and easing**: 3 beats (range 2–4): each item starts 0.6 beat × its distance share late, io2 to the tug's end over 2.5 beats, scale 1 → 0.08.
- **Sound**: a rising whoosh over the pull.
- **Source**: own (`assets/templates/stream/…`: `film.js renderOpen (the tug: 0.6 beat × distance share late, io2 over 2.5 beats, scale 1 → 0.08)`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Overlaps**: `hub-links`: its merge mode slides several sources into one hub; reel-in pulls a whole pile along one thread into a point.
- **Pitfalls**: All items must arrive on the same frame: the lateness is a share of the distance, not a fixed stagger. Fade only the last quarter; earlier fading makes it read as disappearing, not as being taken.
