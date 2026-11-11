---
id: beam-return
category: motion
tier: T1
family: line-path
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### beam-return

- **Looks**: a star leaves the thread along an arc drawing a beam behind it and settles with its label and "Running"; later a bead of light runs back along the same arc to the thread and the status cross-fades to "Done"; the beam stays, dim.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas.
- **Use**: Long-running jobs the product keeps going in the background; a result that returns. **Not for**: Results that are not tied to a job; more than about six beams at once.
- **Intent**: Show that what goes out comes back, along the same line.
- **Content**: A label (≤ 30 characters / 15 Chinese characters), a running and a done status.
- **Parameters**: `label`, `running`, `done` (texts, defaults en/zh), `from`, `to`; roles read: `accent`, `glow`, `core`, `ink`, `dim`.
- **Theory**: Same path out and back reads as one connection; the status change after the bead arrives ties cause to effect.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Length and easing**: 4 beats (range 3–6): beam with the star on io2 over 0.6 s at 0.42 of the arc's height; the bead on 1 − io2 over 0.7 s; the status 0.6–0.8 s after it.
- **Sound**: a whoosh out, a chime on the return.
- **Source**: own (`assets/templates/stream/…`: `film.js renderConst (the beam with the star, io2 over 0.6 s at 0.42; the bead on 1 − io2 over 0.7 s; the status cross-fade); plan.js CONST`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Overlaps**: `path-flow`: packets run along drawn paths into one sink; beam-return draws one beam outwards with its star and sends one result back.
- **Pitfalls**: The bead runs the same arc backwards: a straight return line reads as a second connection. Cross-fade the status after the bead arrives (0.6–0.8 s), never before it.
