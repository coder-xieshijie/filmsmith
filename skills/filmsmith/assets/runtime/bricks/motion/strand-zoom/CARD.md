---
id: strand-zoom
category: motion
tier: T1
family: zoom-depth
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### strand-zoom

- **Looks**: three glass cards hang on strands from the spine; one grows in place to 1.45 × with its rows arriving, its strand following its left edge, while the others dim and step right; handing over, the next grows as the previous shrinks.
- **Tier**: T1. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: Three things a product keeps (memory, decisions, files) shown together and then one by one. **Not for**: More than three cards; cards whose rows need more than two seconds each.
- **Intent**: Show the parts without losing the whole: the zoom never returns to an empty frame between parts.
- **Content**: Nothing to read in the move: which card is enlarged (from, to).
- **Parameters**: `from`, `to` (card indices, −1 the three whole); roles read: `panel`, `panel2`, `ink`, `dim`, `accent`.
- **Theory**: Whole – part – whole keeps the context while reading a part (overview first, zoom and filter, details on demand).
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Length and easing**: 2 beats (range 1–3): io3 over 0.55 s; rows 0.6 beat after, 0.4 beat apart.
- **Sound**: a soft whoosh per enlargement.
- **Source**: own (`assets/templates/stream/…`: `film.js cardGeo, renderCards (io3 over 0.55 s, target x 900 at 1.45 ×, centred on y 600); sched.js cards`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Grow in place on the strand; flying the card to the centre cuts it off its strand. Hand over by growing and shrinking together; zooming out to three and back in again doubles the length.
