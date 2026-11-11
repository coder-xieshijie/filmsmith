---
id: marker-stroke
category: motion
tier: T0
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### marker-stroke

- **Looks**: under one word of a title already on screen, a mark is drawn from left to right. `marker` (default): a hand-drawn felt-tip stroke with a wobbling edge and a dry-brush texture, fast and loose. `highlight`: a translucent accent bar sweeps behind the word, like a highlighter. `rule`: a clean straight rule draws under the word on an in-out curve.
- **Tier**: T0. **Family**: line-path. **Surface**: canvas.
- **Use**: pointing at the one word of a settled title that carries the claim (new, faster, the product). **Not for**: more than one word per title; a title still moving or still entering (mark it after it lands, e.g. after `type-enter`); long phrases that wrap.
- **Intent**: One hand-drawn stroke lifts a word out of the type, like someone circling the point on a poster, so the viewer knows which word is the claim.
- **Content**: A title already on screen and the one word or short phrase in it to mark (≤ 12 chars, on one line).
- **Parameters**: `from` the title unmarked, `to` the title with its word marked. `how` `'marker'` | `'highlight'` | `'rule'`; `text` (string or `{ en, zh }`, default the sample claim), `mark` (the substring to mark, en `"meant"`, zh `"想要"`), `size` (en 118, zh 112), `weight` 700, `role` `'display'`, `x` 960, `y` 540, `align` `'center'`, `maxW` 1600, `leading` (null = per language), `lead` 0 (frames before the stroke), `color` `'accent'` (a role name), `seed` 1 (the marker's wobble and texture), `probes` false. Roles read: `ink` (the title), `accent` (the mark).
- **Theory**: underlining is the oldest emphasis cue in print; drawing it in time makes the emphasis an event the eye follows to the word (pre-attentive motion onset, Abrams & Christ 2003).
- **Styles**: `marker` suits hand-made or editorial looks (ink, plakat); `rule` any; `highlight` suits paper grounds.
- **Length and easing**: 1 beat, 0.5–2. `marker` 10 f, ease 1 − (1 − u)^2.2; `highlight` 14 f `EASE.snappy`; `rule` 18 f cubic-bezier(.3, 0, .2, 1).
- **Sound**: `tick` at the start of the stroke (a marker squeak), nothing at its end.
- **Source**: adapted from video-shotcraft `demos/typography/marker-underline-title/MarkerUnderlineTitle.tsx` (card `references/shots/typography/marker-underline-title.md`), `demos/typography/typewriter-moves/TypewriterErrorRetype.tsx` (card `references/shots/typography/typewriter-moves.md`) and `demos/typography/paper-title-card/PaperTitleCard.tsx` (card `references/shots/typography/paper-title-card.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: the mark sits 0.08 em lower under Chinese, whose glyphs fill the em box down to the baseline; the marked range is a phrase, never a single character inside a word.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the title is not drawn in by this brick (the upstream demo also types the title; here that is `type-enter`); no paper grain, brand line or cursor; the stroke texture is seeded noise, not an SVG filter. Compare (`marker`, against `marker-underline-title`): pass (stroke front 6 px, progress RMSE 0, events 0; SSIM drop 0). `highlight` and `rule` have no upstream motion of their own and are not compared.
- **Pitfalls**: Fast: one stroke in 8–12 frames; slower it reads as a progress bar. Keep it close under the letters; set apart it reads as a divider, not emphasis. Follow the slant of the type: under an italic word the stroke rises left to right; slanted the wrong way it looks fake at once.
