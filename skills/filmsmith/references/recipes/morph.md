# Recipe: morph

One ink shape never leaves the frame and is promoted one dimension per scene — point, line, plane, solid, interface, the live console, the mark — while one accent is handed on like a baton. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [morph](../modes/morph.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/morph/`, whose `content.js` is the example film.

## Reference look

[`slate-ink`](../../assets/runtime/bricks/look/slate-ink/CARD.md): slate ground `#EDEFF2`, one ink shape `#15171A`, interface panels on a lighter paper `#F8F9FB`, one accent (`slate` violet `#6A3DF0`, `azure` `#1F55E0`, or the inverted `night`); Inter Tight 600/700 for words, IBM Plex Mono for code and facts; one scale, ratio 1.25 from 28 (28 · 35 · 44 · 55 · 69 · 86 · 135); locked camera; overlay grain 0.05; corners `round` or `cut`. Chinese: Noto Sans SC after Inter Tight, captions at 0 tracking (English −2 px at 86); code, paths and the product name stay Latin.

## Recommended bricks

| Slot (arc `dimension-climb`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`point-line`](../../assets/runtime/bricks/scene/point-line/CARD.md) | [`type-enter`](../../assets/runtime/bricks/motion/type-enter/CARD.md) for a title card before the point, if the film needs a name first |
| demo (request → response) | [`pill-card`](../../assets/runtime/bricks/scene/pill-card/CARD.md) (response; `form: 'schema'` for the same card as its schema) | [`terminal-window`](../../assets/runtime/bricks/prop/terminal-window/CARD.md) when the call is a CLI, not an HTTP request |
| turn (source revealed) | [`hex-solid`](../../assets/runtime/bricks/scene/hex-solid/CARD.md) with [`outline-morph`](../../assets/runtime/bricks/motion/outline-morph/CARD.md) | runtime [`stroke-reinterpret`](../transitions.md#stroke-reinterpret) (drawn inside the scene) |
| demo (interface) | [`cube-page`](../../assets/runtime/bricks/scene/cube-page/CARD.md) ([`api-page`](../../assets/runtime/bricks/prop/api-page/CARD.md)), [`panel-focus`](../../assets/runtime/bricks/scene/panel-focus/CARD.md) ([`code-card`](../../assets/runtime/bricks/prop/code-card/CARD.md)) | [`write-on`](../../assets/runtime/bricks/motion/write-on/CARD.md) if the docs page should write itself instead of unfolding |
| climax | [`run-flood`](../../assets/runtime/bricks/scene/run-flood/CARD.md) | [`digit-roll`](../../assets/runtime/bricks/motion/digit-roll/CARD.md) for a latency or count in the console status |
| lockup | [`mark-command`](../../assets/runtime/bricks/scene/mark-command/CARD.md) | runtime [`converge-mark`](../transitions.md#converge-mark) for a mark whose pieces are not rectangles |
| sound | [`glass-climb`](../../assets/runtime/bricks/sound/glass-climb/CARD.md) | – |

## Ban list

- A second accent colour, or the accent on anything that is not changing now (it is a baton: point → token → action chip → status chip → front face → Run → the dot).
- Hard cuts between scenes: every scene starts from the exact shape the last one ended on; never two contents inside one shape at once (content out 0.1 s with a 12 px blur, then the shape moves).
- Photographs, screenshots and real product UI; the interface is drawn as panels.
- Camera moves: the camera is locked; growth is the shape's, not a zoom.
- Data charts and counted squares (that is `tally`); free-floating particles or glow (`afterglow`, `stream`).
- Letter-spacing below 0 in Chinese, capitals in Chinese labels (ENDPOINTS → 接口).

## Template → bricks

| Template part (`assets/templates/morph/`) | Brick | Notes |
|---|---|---|
| `palettes.js` (slate, azure, night), type scale, layout constants | [`slate-ink`](../../assets/runtime/bricks/look/slate-ink/CARD.md) | inkCard, inkEdge, inkTrack (the console's tones) become roles |
| `film.js` shapePath, outlineOf, resample, cube, faces, layout | `motion/outline-morph/ink.js` (engine) | shared by every morph brick |
| card → hexagon morph (in `drawSolid`) | [`outline-morph`](../../assets/runtime/bricks/motion/outline-morph/CARD.md) | any two closed outlines, round or cut |
| `point`, `line` | [`point-line`](../../assets/runtime/bricks/scene/point-line/CARD.md) | one scene: the point and its line are one gesture |
| `press`, `card` | [`pill-card`](../../assets/runtime/bricks/scene/pill-card/CARD.md) | `form: 'schema'` is the second card |
| `solid` | [`hex-solid`](../../assets/runtime/bricks/scene/hex-solid/CARD.md) | `from: 'none'` opens on the hexagon (the short cut) |
| `unfold`, `PANELS`, `panelContent` | [`cube-page`](../../assets/runtime/bricks/scene/cube-page/CARD.md), [`api-page`](../../assets/runtime/bricks/prop/api-page/CARD.md) | |
| `focus`, `focusContents`, tabs, Run | [`panel-focus`](../../assets/runtime/bricks/scene/panel-focus/CARD.md), [`code-card`](../../assets/runtime/bricks/prop/code-card/CARD.md) | |
| `flood`, `consoleFrame` | [`run-flood`](../../assets/runtime/bricks/scene/run-flood/CARD.md) | the flood curve is drawn in the scene (no runtime module) |
| `mark`, `markLayout`, the second move | [`mark-command`](../../assets/runtime/bricks/scene/mark-command/CARD.md) | the mark is grid parts plus a dot (product facts) |
| `score.mjs` | [`glass-climb`](../../assets/runtime/bricks/sound/glass-climb/CARD.md) | no `glass` preset in `lib/audio`: the card keeps the recipe |
| `content.js` scene order, `choreo.js` | [`dimension-climb`](../../assets/runtime/bricks/arc/dimension-climb/CARD.md) | |
| `choreo.js` fit, `timing.rules.js`, sub-frame blur, the error banner | stays in the template | film-level rules (bar alignment of the flood's pre-roll, the fitted length) belong to a film, not to a brick; a brick plans its own beats |
| runtime [`stroke-reinterpret`](../transitions.md#stroke-reinterpret), `container-morph` (leadingEdges), `net-unfold` | referenced, not copied | already runtime hand-offs |

What stays in the recipe and not in the library: the baton itself (which element holds the accent at each moment is a film decision across scenes, so each scene takes the accent at its own start and gives it up at its end, and the recipe keeps the order); the flood's pre-roll to the next bar line (a property of where the scene sits in the film: `run-flood` takes it as `pre`).

## Chinese

Captions and labels are set in Noto Sans SC after Inter Tight at 0 tracking (English takes −2 px at 86 px); labels written in capitals in English are set as words (ENDPOINTS → 接口); code, paths and the product name stay Latin. The cube's unfold plans 7 beats in Chinese against 6. A Chinese film takes these lengths ([system](../system.md#language)).
