# Recipe: blueprint-zoom

A narrated explainer that teaches one part of a system from its map: the whole system as one diagram of layer bands, built from the inside out; zoom into one layer, which becomes the detail diagram; one task walked through it round by round — messages hopping between the parts, coloured by who wrote them — until a round without a tool call stops the loop; then back to the map with the part marked and one line to remember. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the kit became, and what stays in the kit or the film.

- **Kit**: [`assets/kits/blueprint-zoom/`](../../assets/kits/blueprint-zoom/README.md), whose starter and demo segments are the example. **Bricks**: from the shared library in `assets/runtime/bricks/` ([The library](../../SKILL.md#the-library)), every brick whose `hosts` names teach.

## Reference look

`sketch-paper`: warm paper and dark ink as in paper-ledger; equal-width layer bands with clean rounded frames and light tints; only the nodes are hand-drawn (two rough passes of the outline and a hachure at −41°, gap 8, after Rough.js's idea with this library's own deterministic strokes); loops are smooth pills that become circles; clean connectors with two-stroke arrowheads; one colour per layer (product blue, composition violet, mechanism ochre, core teal, infrastructure stone, the model red) and one per message (a person yellow, a tool call red, a result green, plain text grey); locked camera — the zoom moves the diagram, not the camera. Shared drawing code in the `sketch-paper` look's `kit.js` (text, windows, eases and paths from the `paper-ledger` look's `kit.js`).

## Recommended bricks

| Slot (arc `zoom-return`) | Own bricks | From the rest of the library |
|---|---|---|
| hook (the question) | – (the film's opening stays in the film, see below) | `term-count` from terminal-ledger when the question is about a count |
| problem (the map) | `layer-overview` | – |
| turn (into one layer) | `layer-zoom` (inside `detail-walk`, or as a seam) | – |
| demo / climax (the walk and the stop) | `detail-walk` (runs `msg-hop`-style trips, `msg-chip`, `sketch-node`, `paper-term`) | `path-flow` for many packets at once (another look) |
| claim / lockup (back to the map, the next part) | `detail-walk` with `back`, `layer-overview` | `hand-mark` (terminal-ledger) to circle the next part |
| every scene | `paper-frame` (chapter, dashed note) | – |
| sound | `narration-pad` (shared with terminal-ledger) | – |

## Languages

Chinese on-screen text is set in LXGW WenKai with a 28 px floor (the kit's 24 px secondary lines and chips are raised to it); English in Source Serif 4, with IBM Plex Mono in the windows, with a 25 px floor. Both follow [On-screen language](../teaching.md#on-screen-language). WenKai's hand-written warmth carries the Chinese map; the English map reads more like a printed diagram, since no hand-written Latin face is chosen yet.

## Ban list

- Rough frames, connectors or circles: only nodes are hand-drawn; a rough loop circle reads as a doodle.
- A fifth message colour, or a colour that does not say who wrote the message.
- A chip typed while it moves: text the model writes waits between the model and the frame and types there.
- Zooming the camera or a screenshot; parts that cross each other on the zoom (keep the overview's left-to-right order).
- Ochre (mechanism, 3.83:1 on the paper) for body text.
- Anything in the presenter reserve or the caption band; motion blur.

## Kit → bricks

| Kit part (`starter/components/`) | Brick | Notes |
|---|---|---|
| `tokens.js`, `style.css` | `sketch-paper` (+ `kit.js`) | the kit's values; English type and floors added |
| `node.js`, `loop.js` | `sketch-node` | Rough.js replaced by the kit's own deterministic strokes |
| `message.js` (`chip`) | `msg-chip` | |
| `message.js` (`travel`, `under`, `hold`, `emit`) | `msg-hop`; trips inside `detail-walk` | |
| `zoom.js` | `layer-zoom` | |
| `overview.js`, `band.js`, `line.js` | `layer-overview` | |
| `term.js` | `paper-term` (from terminal-ledger) | the same window |
| `status.js`, `labels.js` (rounds, stop, take) | inside `detail-walk` | |
| `film.json` scene order | `zoom-return` | |
| the bed and cues | `narration-pad` | |

## What stays in the kit or the film

- **The opening** (in the approved film, the model alone writing tokens towards a dashed "your code" box with a question mark): one picture made for one film's question; `layer-overview` takes the model's box from it (`from`) so the map starts where the opening left it.
- **The presenter, handoffs and stand-ins, the narration timeline, build and checks**: as in [terminal-ledger](terminal-ledger.md#what-stays-in-the-kit-or-the-film) (the teach pipeline, not pictures).
- **The next-part teaser** (a dashed ring round the next cell and its pulse): two lines of film code; `hand-mark` (circle) or a sketch-node pulse covers it.

## Arc role mapping

`zoom-return`: the question → `hook`, the map → `problem`, the zoom → `turn`, the walk (mechanism) → `demo`, the stop → `climax`, the return with the line to remember (recap) → `claim`, the next part → `lockup`; `proof` and `rest` unused. **Mechanism** and **recap** have no role of their own among the nine slot roles (mapped to `demo` and `claim`).
