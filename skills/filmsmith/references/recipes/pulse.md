# Recipe: pulse

A question acted out as a query: huge condensed words ask it one per beat at one anchor while the ground walks one hue's lightness ramp through geometric apertures; a highlight hops over the real candidates, the answer locks, the film's one whiteout slams it in amber on the drop, the camera pushes through the answer's 0 into the figures that explain it, and the name lands. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [pulse](../modes/pulse.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/pulse/`, whose `content.js` is the example film.

## Reference look

[`query-ramp`](../../assets/runtime/bricks/look/query-ramp/CARD.md): four presets (`indigo` default, `petrol`, `graphite`, `coral-ramp` whose accent may only land on ramp[0] and ramp[1]), each a four-step ramp plus a tinted white; white type on the dark steps, ramp[0] on ramp[3], ramp[1] on white (`kit.js onGround`); amber only for the answer; Barlow Condensed 900 for asked words, cell labels, figures and the name, Barlow 600 for lines and 700 for the answer, JetBrains Mono for the query line; scale 31 · 49 · 61 · 186 · 233 · 291 · 364 · 455 · 568; the anchor at (160, 660), the query line at 990; locked camera; grain 5 %. The bricks share `look/query-ramp/kit.js` (type in both languages, grounds, apertures, the query line, the scramble glyphs).

## Recommended bricks

| Slot (arc `ask-to-answer`) | Own bricks | From the rest of the library |
|---|---|---|
| hook, problem | [`anchor-ask`](../../assets/runtime/bricks/scene/anchor-ask/CARD.md) (`first: true`) | – |
| demo (the first run) | [`hop-search`](../../assets/runtime/bricks/scene/hop-search/CARD.md) (`slot: true`, none passes) | runtime [`whip-push`](../transitions.md#whip-push) out of the verdict into its evidence |
| proof (why) | [`figure-rows`](../../assets/runtime/bricks/scene/figure-rows/CARD.md) | [`digit-roll`](../../assets/runtime/bricks/motion/digit-roll/CARD.md) only if an odometer suits the figure better than the scramble |
| turn (what changed) | [`anchor-ask`](../../assets/runtime/bricks/scene/anchor-ask/CARD.md) (`invert: true`, then a second ask) | – |
| demo (the re-run) | [`hop-search`](../../assets/runtime/bricks/scene/hop-search/CARD.md) (`known`, `into: 'reveal'`) | runtime [`whiteout-slam`](../transitions.md#whiteout-slam) over its last beat (the exposure build) |
| climax | [`answer-whiteout`](../../assets/runtime/bricks/scene/answer-whiteout/CARD.md) | runtime [`counter-portal`](../transitions.md#counter-portal) out of it (its `answerGlyph()`) |
| proof (through the 0) | [`figure-rows`](../../assets/runtime/bricks/scene/figure-rows/CARD.md) | runtime [`slice-smear`](../transitions.md#slice-smear) into the lock-up |
| lockup | [`name-flip`](../../assets/runtime/bricks/scene/name-flip/CARD.md) | – |
| every scene | [`query-line`](../../assets/runtime/bricks/prop/query-line/CARD.md), [`symbol-scramble`](../../assets/runtime/bricks/motion/symbol-scramble/CARD.md) (inside the kit) | – |
| sound | [`query-bed`](../../assets/runtime/bricks/sound/query-bed/CARD.md) | – |

## Ban list

- Amber on anything but the answer: no word, figure, label or highlight.
- A second whiteout, a flash or a white flicker anywhere else.
- Questions about weekdays or dates, a multi-colour factory palette, a dark HUD with corners and timecodes (the nearest reference's signature).
- Anything in the query line the product would not accept; typed results (the verdict, the answer, the pass count and every ratio are computed).
- Moving the anchor for a long word, or type below its floor: split the question.
- Crossfaded grounds: every change is an aperture, an invert, a whip, a slice or the portal.
- The answer in the condensed face (its counter must hold the next scene).

## Template → bricks

| Template part (`assets/templates/pulse/`) | Brick | Notes |
|---|---|---|
| `palettes.js` (`onGround`), type and grid of `film.js` | [`query-ramp`](../../assets/runtime/bricks/look/query-ramp/CARD.md) (+ `kit.js`) | |
| `ask` (`askPlan`, `paintAsk`) | [`anchor-ask`](../../assets/runtime/bricks/scene/anchor-ask/CARD.md) | aperture-swap's shapes drawn as canvas clips |
| `search` (`searchPlan`, `paintSearchRow`, `paintVerdict`) | [`hop-search`](../../assets/runtime/bricks/scene/hop-search/CARD.md) | the roulette stays inside the scene (it reveals values; runtime [`roulette-lock`](../transitions.md#roulette-lock) frames labels only) |
| `data` | [`figure-rows`](../../assets/runtime/bricks/scene/figure-rows/CARD.md) | |
| `reveal` | [`answer-whiteout`](../../assets/runtime/bricks/scene/answer-whiteout/CARD.md) | the build is runtime [`whiteout-slam`](../transitions.md#whiteout-slam); the portal runtime [`counter-portal`](../transitions.md#counter-portal) |
| `name` | [`name-flip`](../../assets/runtime/bricks/scene/name-flip/CARD.md) | |
| `valueGlyphs`, `scrambleChar`, `numFormat` | [`symbol-scramble`](../../assets/runtime/bricks/motion/symbol-scramble/CARD.md) | |
| `queryText`, `drawQuery` | [`query-line`](../../assets/runtime/bricks/prop/query-line/CARD.md) | fragments dropped by `breaks()` |
| `score.mjs` | [`query-bed`](../../assets/runtime/bricks/sound/query-bed/CARD.md) (recipe bed `query`) | lib/audio has no preset: a Skill change |
| `content.js` order, `timing.rules.js` | [`ask-to-answer`](../../assets/runtime/bricks/arc/ask-to-answer/CARD.md) | |
| transitions `aperture-swap`, `whip-push`, `slice-smear`, `whiteout-slam`, `counter-portal` | runtime, referenced | not copied |

What stays in the recipe:

- **The framing inside the counter** (the next scene's first figure placed in the answer's 0 from the reveal's first frame): it depends on the scene after the reveal; the film passes `answer-whiteout`'s `answerGlyph()` and the next scene's painter to runtime [`counter-portal`](../transitions.md#counter-portal).
- **The candidates and their measured values, the limit, which builds are `known`**: the film's own data; the query line carries only parameters the product accepts.
- **The ramp walk across scenes** (`prevGround`, `queryBase`): each ask takes the previous ask's last ground and line, which the film hands over.
- **Fit and the phrase rounding** (`timing.rules.js`): the reveal on a bar line, a search spending the wait on extra laps (`laps`), the lock-up taking the rounding.

## Chinese

Pulse's identity is a 364 px extra-condensed black set one word a beat; Chinese has no condensed black, and at full width a Chinese word over about four characters falls to the floor. The redesign (accepted by the owner, 2026-11-10):

- **Asked words, the verdict and a Chinese name** (`anchor-ask`, `hop-search`, `name-flip`): Noto Sans SC 900 set as 长体, scaled to 0.84 wide, the condensed setting of Chinese headline type, at the same 364 px and 233 floor, so a four- or five-character word stays on the anchor at full size; one 词 a beat; the optical middle of a Chinese word is 0.38 of its size above the baseline; Latin and digits inside keep Barlow Condensed.
- **The query line** stays code; it is cut by `breaks()` instead of the template's `split(' ')`.
- Figures and the answer are digits in both languages.

- **Length**: the data scene plans 12 beats in Chinese against 8 in English; it slows rather than cutting copy. A Chinese film takes these lengths ([system](../system.md#language)).
