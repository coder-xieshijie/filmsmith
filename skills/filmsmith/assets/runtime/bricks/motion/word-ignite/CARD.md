---
id: word-ignite
category: motion
tier: T2
family: mask-type
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: Apache-2.0
status: approved
---

### word-ignite

- **Looks**: one word of a settled line catches fire. `sweep` (default): a bright head runs through the word left to right, leaving it filled with an accent gradient, sparks flicking off the head, then the word settles. `outline`: the word pops in as a hollow outline inside a large ring that shrinks round it while turning; light lines streak in, the word fills warm from the bottom, flashes once and sends out a shock ring.
- **Tier**: T2. **Family**: mask-type. **Surface**: canvas.
- **Use**: the one payoff word of a slogan at the film's peak (faster, yours, the product name), on the drop of the music. **Not for**: more than once a film; light grounds (both ways glow and are tuned for a dark ground); a word that is not the selling point of its line; dossier and blueprint (too loud).
- **Intent**: Only the selling word gets the charge, so the viewer knows which word the line is for; outline nails it down in two landings, size then substance.
- **Content**: A line (≤ 30 chars) and the one word in it to light (≤ 8 chars); outline works best on a single short word alone (≤ 6 letters, 4 Chinese).
- **Parameters**: `from` the line with the word plain, `to` the line with the word lit. `how` `'sweep'` | `'outline'`; `text` (default the sample claim), `word` (en `"meant"`, zh `"想要"`), `size` (en 92, zh 88; the `outline` sample uses 220 for a single word), `weight` 750, `x` 960, `y` 540, `seed` 1 (sparks), `ring` true (`outline`'s ring and shock), `probes` false (comparison points added to `track()`). Roles read: `ink` (line), `accent` (gradient, ring, sparks, warm fill), `ground` (dark detection and the ring's glow).
- **Theory**: a moving bright edge pulls the eye (motion and luminance onset); the gradient that stays marks the word as changed, not merely highlighted (a state change, not a pulse).
- **Styles**: high-energy looks (pulse, plakat, phosphor); avoid dossier and blueprint.
- **Length and easing**: `sweep` 4 beats (fill 18 f, head 6 f, trail 10 f, sparks at 0–44 f, settle by 52 f); `outline` 5 beats (pop to 52 f, ring 2.8 → 1 over 8–44 f, lines 28 f, warm fill 43 f, flash 8 f, shock 14 f).
- **Sound**: `turn` as the head starts, `land` at the settle (`outline`: `hit` at the flash).
- **Merged from**: `outline-word-fill` (`outline`).
- **Source**: adapted from video-shotcraft `demos/typography/gradient-word-sweep/GradientWordSweep.tsx` (card `references/shots/typography/gradient-word-sweep.md`) and `demos/typography/outline-word-fill/OutlineWordFill.tsx` (card `references/shots/typography/outline-word-fill.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh adapted: `sweep` is the same in Chinese; `outline` draws Chinese with a faint fill under a 1.5 px stroke, because a pure outline of Chinese glyphs shows every overlapping stroke and reads as noise. Weakest in Chinese: `outline`, whose hollow stage is less clean than in Latin letters.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: one accent instead of a multi-hue gradient (the gradient runs accent → a lighter accent); no backdrop, brand or particles field. Compare (`sweep`, against `gradient-word-sweep`): pass (fill front 0 px, events 0; SSIM mean 0.43 is the content gap: upstream's second line and gradient); `outline` is not compared.
- **Pitfalls**: The rest of the line stays still and plain; if everything moves, nothing is "the one word lit". sweep must be fast (15–20 frames) and brightest at the front; slower it reads as a progress bar. outline fills on one frame, never a fade, and wants a short hard sound on that frame.
