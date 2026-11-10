# Recipe: phosphor

A command-line tool launched on a glowing screen at night: one phosphor colour on near-black, display type in a neutral gradient striped by the CRT raster, mono for everything the machine says, a faint accent grid drifting under it all. The film is one terminal session: a prompt types the failure and collapses into a point of light, the claim rises under the horizon, chapters show the tool at work (questions and decisions, a flow, a count, the run, the pick, the scope), the install sits under a musical break, a grid tunnel folds into the tagline's slit, and the name types back out of a cursor. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [phosphor](../modes/phosphor.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/phosphor/`, whose `content.js` is the example film.

## Reference look

[`night-terminal`](../../assets/runtime/bricks/look/night-terminal/CARD.md): presets `phosphor` (P1 green), `amber`, `ice` (the default and the example's), `ansi-cyan`, `violet`, `coral-crt`, each with ground / groundHi / groundLo, panel, ink, muted, dim, line, accent, hi, deep, onAccent, the status colours bad / find / key and the display gradient titleHi → titleLo. Inter 800 at −0.045 em for display, Inter for body, JetBrains Mono for code, commands, labels and the HUD; Chinese takes Noto Sans SC after each family, untracked, labels and HUD at 28 px, body at 40 px. Sizes 240 counter · 150 hook, chapter title, tagline, end name · 108 claim and centred titles · 84 header · 50 card names · 40 body · 32 chips and commands · 25 labels (Chinese 28). Screen `crt` (2 px scanlines one in three at 22 %, display type striped 4 / 2 px, vignette to 60 %) or `flat`; grain, the glow disc and the 160 px grid stay in both.

## Recommended bricks

| Slot (arc `boot-to-end`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`prompt-boot`](../../assets/runtime/bricks/scene/prompt-boot/CARD.md) (its end is [`cursor-collapse`](../../assets/runtime/bricks/motion/cursor-collapse/CARD.md) and the fibre burst) | – |
| claim | [`horizon-hero`](../../assets/runtime/bricks/scene/horizon-hero/CARD.md) | – |
| turn (each chapter) | [`chapter-card`](../../assets/runtime/bricks/scene/chapter-card/CARD.md) | [`title-demote`](../../assets/runtime/bricks/motion/title-demote/CARD.md) where a host wants the title-to-header move on another look |
| demo | [`qa-pick`](../../assets/runtime/bricks/scene/qa-pick/CARD.md) → [`decide-confirm`](../../assets/runtime/bricks/scene/decide-confirm/CARD.md), [`hub-flow`](../../assets/runtime/bricks/scene/hub-flow/CARD.md), [`party-count`](../../assets/runtime/bricks/scene/party-count/CARD.md) | runtime [`stream-brake`](../transitions.md#stream-brake) (the `run` page), `roulette-lock` (`pick`), `beam-trace` (`scope`) |
| proof | [`you-ends`](../../assets/runtime/bricks/scene/you-ends/CARD.md), [`party-count`](../../assets/runtime/bricks/scene/party-count/CARD.md) | – |
| rest | [`install-cards`](../../assets/runtime/bricks/scene/install-cards/CARD.md) | – |
| climax | [`slit-tagline`](../../assets/runtime/bricks/scene/slit-tagline/CARD.md) | – |
| lockup | [`cursor-lockup`](../../assets/runtime/bricks/scene/cursor-lockup/CARD.md) (after slit-tagline: `fromLine`, `horizonY: 521.25`) | – |
| every scene | [`terminal-hud`](../../assets/runtime/bricks/prop/terminal-hud/CARD.md) (the frame and the engine: give each scene `hud`), [`glyph-decode`](../../assets/runtime/bricks/motion/glyph-decode/CARD.md) (every title) | – |
| seams | – | runtime [`crt-collapse`](../transitions.md#crt-collapse) and [`glitch-tear`](../../assets/runtime/bricks/motion/glitch-tear/CARD.md) (the glitch cut) into chapters, alternating; `container-morph` and `slice-smear` between windowed pages of a chapter |
| sound | [`phosphor-bed`](../../assets/runtime/bricks/sound/phosphor-bed/CARD.md) (preset `terminal`) | – |

## Ban list

- A second accent; the accent on anything but what the tool proved or a person chose.
- Light grounds: the sphere, the burst and the horizon glow are light layers and vanish on them.
- Photographs, people, rounded cartoon shapes; motion that is not typing, decoding, a push or one of the T2 devices.
- More than three glitch cuts in a film, or two in a row unchanged; a T2 device closer than 8 s to another.
- Body text under the floors (25 / 40 px; Chinese 28 / 40); capitals, italic or negative tracking in Chinese; Latin letters in a Chinese decode.

## Template → bricks

| Template part (`assets/templates/phosphor/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `index.html` CSS (type, ground, screen) | [`night-terminal`](../../assets/runtime/bricks/look/night-terminal/CARD.md) | `cyan` and `coral` renamed `ansi-cyan` and `coral-crt` (the ids are taken by other looks) |
| HUD, ground and screen CSS, `film.js` decode, typing, windows, LOGO, ICON; `fx.js` | [`terminal-hud`](../../assets/runtime/bricks/prop/terminal-hud/CARD.md) (+ `kit.js`, `fx.js`, the engine every phosphor scene imports) | the HUD's chapter mark is a slot (`mark`: [01/03], [>>], [00]) |
| `boot` | [`prompt-boot`](../../assets/runtime/bricks/scene/prompt-boot/CARD.md) | the key word is marked in the copy (`*3*`) |
| `hero` | [`horizon-hero`](../../assets/runtime/bricks/scene/horizon-hero/CARD.md) | |
| chapter card (`pageHeader` with `chapter`) | [`chapter-card`](../../assets/runtime/bricks/scene/chapter-card/CARD.md) | the page after it draws the header in place |
| `qa` | [`qa-pick`](../../assets/runtime/bricks/scene/qa-pick/CARD.md) | |
| `decide` | [`decide-confirm`](../../assets/runtime/bricks/scene/decide-confirm/CARD.md) | the window morph from `qa` is runtime [`container-morph`](../transitions.md#container-morph) |
| `flow` | [`hub-flow`](../../assets/runtime/bricks/scene/hub-flow/CARD.md) | |
| `compare` | [`party-count`](../../assets/runtime/bricks/scene/party-count/CARD.md) | |
| `ends` | [`you-ends`](../../assets/runtime/bricks/scene/you-ends/CARD.md) | |
| `install` | [`install-cards`](../../assets/runtime/bricks/scene/install-cards/CARD.md) | |
| `horizon-tagline` | [`slit-tagline`](../../assets/runtime/bricks/scene/slit-tagline/CARD.md) | the stressed word is marked in the copy (`*failure*`) |
| `end` | [`cursor-lockup`](../../assets/runtime/bricks/scene/cursor-lockup/CARD.md) | |
| decode (`scramble`, `alphabetOf`, `numberSafe`) | [`glyph-decode`](../../assets/runtime/bricks/motion/glyph-decode/CARD.md) | not runtime [`scramble-resolve`](../transitions.md#scramble-resolve) (a hand-off) nor `symbol-scramble` (a value in its slots) |
| the boot's collapse and point | [`cursor-collapse`](../../assets/runtime/bricks/motion/cursor-collapse/CARD.md) | |
| `score.mjs` | [`phosphor-bed`](../../assets/runtime/bricks/sound/phosphor-bed/CARD.md) | |
| `content.js` scene types, mode card use cases | [`boot-to-end`](../../assets/runtime/bricks/arc/boot-to-end/CARD.md) | |
| `freeze`, `run`, `pick`, `scope`, `audit`, `tunnel-tagline` | stay in the template / runtime | see below |

What stays in the recipe, and why:

- **`run`, `pick`, `scope`**: each page is one runtime hand-off in a window under the header (`stream-brake`, `roulette-lock`, `beam-trace`); a brick would copy the hand-off and add only the window and header, which [`terminal-hud`](../../assets/runtime/bricks/prop/terminal-hud/CARD.md) already draws (`win`, `pageHead`).
- **`freeze`** (two documents, a second checker sweeping them for gaps, a fix, the freeze terminal, hashes resolving, both files locking): not a brick yet. It is the template's longest page (three compositions, about 150 lines of choreography); it is to become its own brick, with the decode and the window from the kit.
- **`audit`** and **`tunnel-tagline`**: legacy types the mode card keeps only for old films; `prompt-boot` and `slit-tagline` replace them.
- **The glitch cut, the CRT collapse and power-on, the container morph, the slice smear** between scenes: runtime transitions and hand-offs, referenced, not copied. The exits a host chooses (alternating glitch and CRT into chapters, a morph between windowed pages) are film work.
- The HUD's progress and chapter marks across the film, the brand in every scene, the colour of the run (bad for a failure, the accent for a pass): film work. Hand every scene the same `hud` with its `mark`, `section` and `progress` [from, to].

## Chinese

- **Decode**: a Chinese cell flickers through the line's own Chinese characters and a fixed pool of dense, common characters (`ZH_POOL` in `prop/terminal-hud/kit.js`), never through Latin letters; Latin cells flicker through the line's own letters, hex through hex, and digits stay put (a numeral flickers through symbols), as in English.
- **Emphasis**: the template finds the stressed word by stripping non-word characters (`w.replace(/[^\w-]/g, '') === s.stress`), which never matches a Chinese word; the bricks take the stress marked in the copy (`*三*`, `*失败*`), and the punctuation after it stays with it.
- **Word-by-word reveals**: the tagline's words pop one a half beat; in Chinese a word is a word of the Chinese word segmenter (`Intl.Segmenter('zh', { granularity: 'word' })`), punctuation joined to the word before.
- **Halves**: a title given as one string splits at the word (English) or break opportunity (Chinese) nearest its middle; titles may also be given as two halves.
- **Reading**: commands, URLs and hashes are read as Latin in a Chinese film (the reader takes `lang: 'en'` for code), so a 29-character URL does not count as 15 Chinese characters.

- **Length**: Chinese pages read much longer: with the sample copy `hub-flow` plans 19 beats against 10, `qa-pick` 15 against 9, so a Chinese film of the same pages runs about 40 % longer. A Chinese film takes these lengths ([system](../system.md#language)).
