---
id: thread-pierce
category: motion
tier: T2
family: line-path
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### thread-pierce

- **Looks**: one thread runs out of the mascot, its white-hot head passing through the centre of every item in turn, each lighting with a ring as it is pierced; the whole thread swells wider once (taut) with a glow at its root and relaxes.
- **Tier**: T2. **Family**: line-path. **Surface**: canvas.
- **Use**: Turning a pile of loose things into one connected thing; the hook's peak. **Not for**: Items that must be read while it runs; fewer than four items.
- **Intent**: Show one attention taking every loose thing at once.
- **Content**: Nothing to read: the items' rectangles and the thread's start.
- **Parameters**: `items` (rects, default eight neutral placeholders), `start` (the mascot's point); roles read: `ground` (sky), `accent` (thread, rings), `glow`, `core` (head), `panel` (placeholders).
- **Theory**: One continuous line through many things reads as one act (common fate, continuity); the taut swell marks the end of the act.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Length and easing**: 5 beats (range 4–6): head on io2 over 3.5 beats, each item lit 0.12 beat as it is passed, taut over the last beat (out3 up, io2 down).
- **Sound**: a tick per item pierced, a riser under the head, `accent` (impact) when taut.
- **Source**: own (`assets/templates/stream/…`: `plan.js (the opening's path: Catmull-Rom by angle, io2 over 3.5 beats, pierce times); film.js renderOpen`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Order the items by angle round the start, not by layer: a path by layer zig-zags and reads as random. The taut swell is the beat's hit: land it on a downbeat.
