# Recipe: thread

A video tool's reel cut as one unbroken transformation: one line in the line colour becomes everything in turn (caret, the loop that carries the brief round, the big word's full stop, swatches, storyboard panels, glossy spheres, the rod that presses the stage name into itself, the beat ruler, the playhead, marbled ink, the flood, the film's own contact sheet, a file card, the bar a blade cuts into the name, the caret that types the URL and underlines it). Every link is a step the tool really performs; the last frame of a link is the first frame of the next. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [thread](../modes/thread.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/thread/`, whose `content.js` is the example film.

## Reference look

[`one-line`](../../assets/runtime/bricks/look/one-line/CARD.md): presets `cobalt-vermilion` (the source, default), `ultramarine`, `rose`, `vermilion-paper`, each with ground, panel, ink (the template's text), accent (the line colour, the thread), onAccent, field (a second ground, only ever large areas) and onField, plus a derived dim and divider line for library bricks the thread never draws. Bricolage Grotesque 200–800 for display (the big word 360, the name 196, the card 230, the counter 98, centre names 76), Instrument Serif Italic for the serif voice (the note 34, the formula and closing line 58, the ink's words 230), JetBrains Mono for what is typed and the labels (44 and 26, +0.18 em on labels). Chinese takes Noto Sans SC after the grotesque and the mono and Noto Serif SC after the serif, upright, untracked, labels 28 px. Flat grounds, seeded grain as an overlay at 12 %, volume only on the spheres and the ink; the profile of the line (`thread`: `rule` or `swell`) is a parameter of every scene.

## Recommended bricks

| Slot (arc `line-chain`) | Own bricks | From the rest of the library |
|---|---|---|
| hook (head) | [`brief-loop`](../../assets/runtime/bricks/scene/brief-loop/CARD.md) → [`weight-word`](../../assets/runtime/bricks/scene/weight-word/CARD.md) | runtime [`path-type`](../transitions.md#path-type) (the brief's loop, drawn by the engine) |
| demo | [`glyph-swatch`](../../assets/runtime/bricks/scene/glyph-swatch/CARD.md), [`panel-board`](../../assets/runtime/bricks/scene/panel-board/CARD.md), [`sphere-merge`](../../assets/runtime/bricks/scene/sphere-merge/CARD.md), [`ease-ruler`](../../assets/runtime/bricks/scene/ease-ruler/CARD.md), [`edit-tracks`](../../assets/runtime/bricks/scene/edit-tracks/CARD.md) | runtime [`rail-press`](../transitions.md#rail-press) phase `press` (inside `ease-ruler`) |
| rest | [`ink-words`](../../assets/runtime/bricks/scene/ink-words/CARD.md) | – |
| climax (tail) | [`sheet-flood`](../../assets/runtime/bricks/scene/sheet-flood/CARD.md) | runtime transition `dot-iris` (the flood, inside it) |
| lockup | [`name-cut`](../../assets/runtime/bricks/scene/name-cut/CARD.md) | runtime [`rail-press`](../transitions.md#rail-press) phase `cut` (inside it) |
| every scene | [`thread-line`](../../assets/runtime/bricks/prop/thread-line/CARD.md) (the line and the engine: `kit.js` `linkScene`, `chain.js`) | – |
| motions on their own | [`caret-fall`](../../assets/runtime/bricks/motion/caret-fall/CARD.md), [`weight-swing`](../../assets/runtime/bricks/motion/weight-swing/CARD.md), [`card-squash`](../../assets/runtime/bricks/motion/card-squash/CARD.md) | – |
| sound | [`thread-bed`](../../assets/runtime/bricks/sound/thread-bed/CARD.md) (preset `thread`) | – |

The order is fixed: open, word, palette, storyboard, merge, curves, tracks, ink, review, close. `glyph-swatch`, `ease-ruler` and `ink-words` may be left out on their own; the head (`brief-loop` + `weight-word`) and the tail (`edit-tracks` + `sheet-flood`, with the curves and the ink) only as wholes. `panel-board → sphere-merge → name-cut` is the shortest film (6 bars, 12 s at 120).

**Every scene takes the film's chain.** A thread scene is one link of the chain, and its hand-offs read its neighbours (the word's glyph boxes become the swatches; panel 3 shows the merge's first frame; the curves press the merge's stage name; the tracks lay out the film's own links; the contact sheet shows the film's own frames; the close opens from the card's line or the merge's rod). Give each scene the other links as `before` and `after`, exactly as the template's `content.js` lists them, and the film's length as `seconds`: the scene then draws the film's frames of its link, the neighbours' overlapping exits and entrances, the corner label and the centre names included, and plans the length the film gives it. Left alone, a scene plans with the shortest neighbours it needs, which fits differently (a palette after only its word plans 8 beats, 6 in the chain).

## Ban list

- A second accent; the field colour on anything smaller than a ground (a clip, a word, a detail).
- Glow, lens flare, camera shake, RGB split, ring text, a corner HUD (timecode, BPM, bar counter); the stage label is information and stays.
- Cuts or crossfades between links: every hand-off is pixel-continuous, the flood is the only hard edge and lands on a downbeat.
- Text drawn with transparency on the field or the flood (use `onField`, `onAccent`).
- Subjects that are not a video, motion or rendering tool (the chain says "making a video" whatever the words say); more than six named steps.
- In Chinese: italic (the serif is upright), tracking, capitals, a big word under four characters.

## Template → bricks

| Template part (`assets/templates/thread/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `fx.js` FAMILY and TYPE | [`one-line`](../../assets/runtime/bricks/look/one-line/CARD.md) | `vermilion` and `paper` renamed `cobalt-vermilion` and `vermilion-paper` (the ids are taken by other looks); roles renamed to the library's (text → ink, line → accent, onLine → onAccent) |
| `film.js` (the whole chain), `fx.js`, `shots.js`, `timing.rules.js`, `gl.js` | [`thread-line`](../../assets/runtime/bricks/prop/thread-line/CARD.md) (`chain.js`, `fx.js`, `shots.js`, `rules.js`, `gl.js`, `kit.js`) | `chain.js` is `film.js` as a factory (no module state), with the language, the shared WebGL context and the grain drawn in; `gl.js` and `shots.js` are copied verbatim |
| `open` | [`brief-loop`](../../assets/runtime/bricks/scene/brief-loop/CARD.md) | |
| `word` | [`weight-word`](../../assets/runtime/bricks/scene/weight-word/CARD.md) | |
| `palette` | [`glyph-swatch`](../../assets/runtime/bricks/scene/glyph-swatch/CARD.md) | |
| `storyboard` | [`panel-board`](../../assets/runtime/bricks/scene/panel-board/CARD.md) | |
| `merge` | [`sphere-merge`](../../assets/runtime/bricks/scene/sphere-merge/CARD.md) | the push into panel 3 (`thread-panel-push`) is inside |
| `curves` | [`ease-ruler`](../../assets/runtime/bricks/scene/ease-ruler/CARD.md) | |
| `tracks` | [`edit-tracks`](../../assets/runtime/bricks/scene/edit-tracks/CARD.md) | |
| `ink` | [`ink-words`](../../assets/runtime/bricks/scene/ink-words/CARD.md) | |
| `review` | [`sheet-flood`](../../assets/runtime/bricks/scene/sheet-flood/CARD.md) | |
| `close` | [`name-cut`](../../assets/runtime/bricks/scene/name-cut/CARD.md) | |
| `caretToLine`, `CARET`, `FLAT` | [`caret-fall`](../../assets/runtime/bricks/motion/caret-fall/CARD.md) | the caret ↔ line on its own |
| `word` (`weightAt`) | [`weight-swing`](../../assets/runtime/bricks/motion/weight-swing/CARD.md) | the weight swing on its own |
| `review` (the card's squash) | [`card-squash`](../../assets/runtime/bricks/motion/card-squash/CARD.md) | the card → line on its own |
| `score.mjs` | [`thread-bed`](../../assets/runtime/bricks/sound/thread-bed/CARD.md) | |
| `content.js`, `REGISTRY`, the mode card's Scenes | [`line-chain`](../../assets/runtime/bricks/arc/line-chain/CARD.md) | |

What stays in the recipe, and why:

- **`path-type`, `rail-press` (`press`, `cut`), `dot-iris`**: runtime hand-offs and a transition. The engine calls the runtime's `createHandoff` and `createTransitions` as the template does (and draws the line through them in the thread's profile); nothing is copied.
- **`thread-panel-push`** (the template's own T2: the camera zooms through panel 3, whose content is the merge's first frame rendered once by WebGL): bound to the board's layout and that still, so it lives inside `sphere-merge` rather than as a motion.
- **The sphere's squash into the rod and the ink**: WebGL shots of `gl.js`, inside `sphere-merge`, `ease-ruler` and `ink-words`; a separate motion would copy `gl.js` again.
- **The corner stage label, the centre names, the tracks' clips and the contact sheet's tiles** read the whole chain (the stage spans, where the film's links sit, the film's own frames): film work, carried by giving every scene the film's chain.

## The two lines: thread and stream

Both styles are "one line through the film"; they split the work by what the line does (owner, 2026-11-10). Pick by the product: a tool whose output is film takes thread; a product that sends work out and brings it back takes stream.

- **thread's line becomes each object** of a pipeline, for a tool whose output is film: a flat 6 px stroke (or a swelled rule) in the one line colour, no glow, that turns into a caret, a full stop, panels, spheres, a rod, a ruler, a playhead, ink, a flood and the name. Its bricks are [`thread-line`](../../assets/runtime/bricks/prop/thread-line/CARD.md) and the ten link scenes.
- **stream's line stays a line and carries things**, for a product that sends work out: a three-layer glowing stroke that pierces the opening pile, hangs interface blocks on hooks, branches beams to stars and sweeps them back (stream's mode card, principle 1). Stream's glowing stroke is its own prop (`glow-thread`) and does not reuse `thread-line`, whose principle bans glow.
- **Made once, here**: the caret falling flat into the line under what it typed ([`caret-fall`](../../assets/runtime/bricks/motion/caret-fall/CARD.md)) and a card squashing into a line ([`card-squash`](../../assets/runtime/bricks/motion/card-squash/CARD.md)), with `lineBox` in `prop/thread-line/kit.js` for a flat line in either profile. Where stream's line lays flat under its three words or contracts into a point under text, it reuses `caret-fall` (with stream's colours) instead of making a second one.

## Chinese

- **The big word** is four characters and a full stop (先做计划。): the swatches take the first four glyph boxes, so a shorter word breaks the hand-off. Noto Sans SC is variable, so the weight swings 780 → 200 → 800 → 430 as in English; the full stop 。 takes the line colour.
- **The serif voice** (the notes, the ink's words, the closing line) is set upright in Noto Serif SC: Chinese has no italic, and a slanted Song face is a fake (`fx.js` `setFont` drops `italic` in Chinese).
- **The ink's words** rise one at a time; Chinese has no spaces, so they are the word segmenter's words (纯 / 代码), punctuation joined to the word before (`shots.js` `inkWords`, read by `rules.js` too).
- **The specimen** names the Chinese faces the film is set in (思源黑体, 思源宋体, JetBrains Mono).
- **No tracking, no capitals**: the labels' +0.18 em and the display's −0.02 em are dropped in Chinese (`setFont`, `textW`); stage names are set as written.
- **Reading**: Chinese follows the shared reading rule in [system](../system.md#language); code, URLs, hex values, the formula and the card's spec line stay Latin.
