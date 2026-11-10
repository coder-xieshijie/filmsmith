---
id: star-sweep
category: motion
tier: T3
family: line-path
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### star-sweep

- **Looks**: the spine retracts into the mascot; the thread's head sweeps the sky in three passes along one smooth path, each star snapping onto the line, brightening and riding it as it is passed; the line straightens into a tether and the caught stars flow along it into its end, which glows as one point.
- **Tier**: T3. **Family**: line-path. **Surface**: canvas.
- **Use**: The climax of a film that sent many things out: everything comes back to one place. **Not for**: Fewer than about eight stars; a film that has not sent stars out before.
- **Intent**: Everything that was sent out comes back to one point the user can look at.
- **Content**: Nothing to read: the stars in the sky (count, seed) and the point they flow into.
- **Parameters**: `count` (stars, default 18), `seed`; roles read: `ground`, `accent`, `glow`, `core`, `dust`.
- **Theory**: One line touching everything reads as one act of gathering; the straightening is the release after the build (tension and release).
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (paper and print grounds put the glow on a light ground, where it greys out).
- **Length and easing**: 8 beats (range 6–10): retract 0.1–0.9, sweep 0.9–4.6 (io2), straighten over 1.5 beats, flow 5.0–6.9, the point 7.0.
- **Sound**: a riser under the sweep, a tick per star caught, a pull under the flow.
- **Source**: own (`assets/templates/stream/…`: `plan.js GATHER (17 waypoints, Catmull-Rom to 400 points, the tether, catch times, flow windows); film.js renderClose, renderSpine; sched.js close`), split from the stream style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese takes Noto Sans SC after DM Sans, tracked +0.02 em with leading 1.5, nothing in capitals or italic; every information size is raised to the library's 28 px (row details, labels, statuses, card sub-lines; the opening pile is texture and keeps the template's sizes); the tagline and the claim's words rise a character at a time; the copy is the template's own Chinese example (`examples/content.zh.js`). Reading time is the runtime's `readTime` (6 characters a second plus 0.5 s) over tokens with a letter or digit, so "→" and "·" are not read as words; it still counts Chinese punctuation, so the Chinese example runs 99.4 s against the original's 97.5 s.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the stream template (`assets/templates/stream/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the stream recomposition (the recipe's Recomposition section). Intended departures: the template's DOM film (CSS paper blocks over a canvas sky) is ported to one canvas (`prop/glow-thread/engine.js`), so the blocks' blur entrances are drawn per word or character and their shadows are canvas shadows; each scene is a window of the whole film drawn by that engine; Chinese information text is 28 px; reading time skips tokens without letters or digits.
- **Pitfalls**: Catch each star on the frame the head passes it; a star that jumps early breaks the one-thread logic. The path must not cross itself near a star or the catch reads twice.
