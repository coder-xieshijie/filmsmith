---
id: hook-unfold
category: motion
tier: T0
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### hook-unfold

- **Looks**: a point lights on the spine, a short light reaches right as a hook, and a block opens from its left edge along it, its width 0 → full and its content clipped as it widens; played backwards it folds into the thread.
- **Tier**: T0. **Family**: line-path. **Surface**: canvas.
- **Use**: Bringing an interface block in from the thread, or folding it back. **Not for**: A block that should fly in from off-screen; a full-screen panel.
- **Intent**: Every piece of interface comes out of the thread and goes back into it.
- **Content**: Nothing to read in the move: the block's rectangle (its content is the block's).
- **Parameters**: `rect` (the block, default 560 × 520 at x 290), `hy` (the hook's height); roles read: `accent`, `glow`, `core`, `paper`, `bubble`, `user`.
- **Theory**: Growth from an anchor reads as attachment (the block belongs to the thread); clipping keeps the content one object with its box.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Length and easing**: 1 beat (range 1–2): the reach over the first 0.4, the width on io3 over 0.45 s (the template's cardAt).
- **Sound**: a soft whoosh.
- **Source**: own (`assets/templates/stream/…`: `film.js renderChat (the hook: a point 64 px below the block's top, the reach); plan.js cardAt (0.45 s, ease-in-out cubic)`), split from the template of the stream style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Open from the hook's side only; a centred scale-up loses the sense of hanging. Clip the content with the width: content that fades in after the box looks like a second step.
