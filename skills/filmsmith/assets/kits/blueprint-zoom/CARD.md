# Production card · blueprint-zoom

Read only this page to start a segment. The director has set up the project; your segment file `segments/<your id>.js` is a one-line `F.shell(ctx)` stand-in: replace it with your picture. You write that one file; your contract is your entry in `handoff.json` (`start` / `end`, `lines`, `goal`, `first`, `last`, `hands`).

Order of work in a film: the director runs `new-film --kit blueprint-zoom` and `npm run init` (the shared assets come from `scripts/voice/voice.py`, with `"windows_s": {}`: this look has no presenter) → fills `handoff.json` and `anchors.txt` → segment agents write their segments and hand back once `check` / `shots` pass → the director checks the whole film and the seams → `render` / `finish`. The commands are in the kit [README](README.md).

## The look

What the approved look is: [ref/look.jpg](ref/look.jpg): the top two rows are moments of the demo segments, the bottom row one cell per component family the demo does not show; each cell is captioned with its time and segment or component.

- **One overview of a system of parts.** Layers are equal-width bands, x 60–1540, the layer name (and a short note) in the left column, cells shared out evenly from x 320 to 1516. Make it large: the layers together fill about y 100–780 (taller bands and cells rather than empty paper below), and the detail frame about y 240–780. At most one box sits right of the layers (x 1600, the outside part one layer talks to), joined by a two-headed connector. Nothing else goes right of x 1540: the presenter reserve x 1580–1880, y 560–860 stays plain paper for the whole film, and y ≥ 880 stays empty (captions).
- **The structure it serves:** the overview loads (the layer the film is about first, the rest after) → one layer is enlarged into its detail view (`F.bp.zoom`) → messages walk its connectors → back to the overview, the layer marked done (`F.bp.done`, "✓ 讲过"), the next part pointed at (`F.bp.next`, a dashed ring). In the detail view keep the overview's left-to-right order of cells (nothing crosses on the zoom), keep each node's overview size, leave about 200 px between parts so a message shows whole between them, and put windows (a light terminal) above or below the frame. The detail row runs from x 90 to 1510 (1420 px): three nodes of the default width (382 px) plus two 200 px gaps would need 1546, so give that row a wider `gap` in the overview spec, which narrows its cells: width = (1196 − 2 × gap) / 3, so `gap` ≥ 88 gives nodes ≤ 340 px that fit with 200 px gaps; with a loop in the middle (250 px circle) the default gap fits.
- **Only the nodes are hand-drawn** (Rough.js outline and hachure, a fixed seed per node, a solid background under the hachure). Band frames, connectors and the loop are clean vector shapes; a loop is a smooth pill that becomes a circle, never a Rough circle; connectors have round caps, two-stroke arrowheads and no wobble.
- **Colour:** paper `#f6f1e7`, ink `#2b2824`. One palette per layer for the whole film (`blue`, `violet`, `ochre`, `teal`, `stone`; `red` for the outside box). Messages: yellow `msg` a request from a person or the outside, red `call` a command one part writes for another to carry out, green `res` a result coming back, grey `txt` plain text with nothing to carry out. Status words: green done, grey not yet. Take colours from `F.COL`, geometry from `TOKENS.bp`; never write new values.
- **Type:** LXGW WenKai for all text, terminals and code included. Sizes 34 chapter / 36 node titles / 30 layer names / 28 body, small cells and status words / 26 node secondary lines / 24 floor (chips, notes).
- **Messages move along the lines.** The first round walks slowly, timed to the words (0.6–1 s per hop); what a part writes comes out of it, stops between it and its neighbour, types out, then goes. Repeated rounds may take about 0.5 s per hop once the first has walked the path. Messages sit under nodes and windows: pass `under` (the boxes of the parts on the path) so a message fades as it slides into a part instead of showing half its text, and give every hop between two parts a `hold` (≈ 0.3 s first round, ≈ 0.2 s repeated), a rest whole and still in the gap: without it a chip is whole for only a few frames of a hop, and no check notices.
- **State changes are acted out:** a round label plus one turn drawn around the circle; status words swap; a stopped loop goes grey over 0.6 s, and only then the caption that names it. Mark each with `!` in the director's anchors.
- Things appear when they are said (times from `ctx.T`; `cues.js` is generated, never edit it; ask the director for a missing anchor); hold ≥ 0.6 s after each key change; pushes and zooms `power2.inOut`, arrivals `power3.out`, exits half as long as entrances; no breathing, floating or looping blinks.

## Components (usage at the top of each file: `head -25 components/<name>.js`)

| File | One line |
|---|---|
| `overview.js` | `F.bp.overview(layer, spec)` the whole overview from a plain spec (rows of cells, optional side box); `ov.rows[key].band / .cells`, `ov.side`, `ov.lines` / `ov.msgs` (under the nodes); `F.bp.rowIn`, `F.bp.sideIn`; `F.bp.done(ov, key, t)` "✓ 讲过", `F.bp.next(ov, key, i, t)` ring round the next part; row fields `gap`, `done`, `next`; `visible: ['key']` draws a row at frame 0 |
| `zoom.js` | `F.bp.zoom(ov, key, { detail, cells, side, loopSub })`: `.in(t, { focus })` the other layers scale away and fade, the band becomes the detail frame, cells and the side box move; `.out(t)` back |
| `band.js` | `F.bp.band(parent, { box, c, name, sub })` clean frame, tint, name column; `F.bp.bandIn`, `F.bp.bandTo`; `F.bp.svg(layer)` a full-stage svg |
| `node.js` | `F.bp.node(parent, { box, c, title, sub, seed })` hand-drawn node; `F.bp.nodeIn`, `F.bp.pulse` (a loop thickens instead); move with `F.boxTo(n.el, n.box, box, t, d)` |
| `loop.js` | `F.bp.loop(parent, { pill, circle, c, title, sub, seed })`: `F.bp.loopTo` pill ↔ circle, `F.bp.orbit` one turn, `F.bp.loopStop` / `loopGo`, `F.bp.rounds(layer, L, labels)` round labels with `.on(i, t)` |
| `line.js` | `F.bp.line(svg, d, { col, arrows })` clean connector: `F.bp.lineIn`, `lineOut`, `lineBack`, `F.bp.dim` |
| `message.js` | `F.bp.chip` (msg / call / res / txt), `F.bp.travel(k, path, t0, t1, { a, b, under, hold })`, `F.bp.trip` (appear, travel, go), `F.bp.emit` (a part writes: out, wait, type, go), `F.bp.typeIn`, `F.bp.fracAt` |
| `status.js` | `F.bp.status(parent, x, y, [[text, colour], …])` status words in a window or under a node; `.go(i, t)` |
| `term.js` | `F.term(layer, { title, x, y, w, h })` light terminal, visible at once (enter: `F.init(w, { opacity: 0 })`, `F.show`); title bar 40 px, content from y ≈ 44; `F.termType` types with a caret; `F.termLog` a log that scrolls |
| `labels.js` | `F.tag` dashed "illustrative" note, `F.lbl` one line of any size (starts blurred: enter with `F.blurIn`), `F.how`, `F.group` |
| `chapter.js` | `F.chapter('章名', t)` chapter label; swap with `F.chapterHide(t)`, `F.chapter(new, t)`, `F.chapterShow(t)` around a zoom |
| `shell.js` | `F.shell(ctx)` stand-in segment for the director's skeleton; you replace it |
| `lib.js` | `F.init` registers starting values, `F.to(e, {…}, t, d, ease)` tweens on from the last value, `set` `show` `hide` `blurIn` `draw` `boxTo`; `F.rng(seed)` `F.hash(n)` |

There is no counter, presenter placeholder or hand-mark component in this kit: emphasis is a pulse, a dim or greying.

## Segments and handoffs

```js
defineSegment('b1', function build(ctx) {         // ctx.t0 / ctx.t1 = this segment's start / end
  const T = ctx.T, bp = F.bp;
  const ov = ctx.take('ov');                        // the overview, or its stand-in when the previous segment is not built yet
  const z = bp.zoom(ov, 'srv', { detail: [50, 240, 1500, 540], cells: { 0: [90, 419, 382, 182], 2: [1128, 419, 382, 182] }, side: [1189, 72, 260, 96], loopSub: 124 });
  z.in(T.zoom, { focus: T.b1 - 0.4 });
  const ln = bp.line(ov.lines, 'M927 510 H1125', { arrows: 'both', col: F.COL.tealS }); bp.lineIn(ln, T.zoom + 1.35);
  bp.trip(ov.msgs, 'GET /orders', 'msg', 'M925 510 H1319', T.send, T.send + 0.8, { under: [[1128, 419, 382, 182]], hold: 0.3 });
  // … windows and labels go into ctx.layer (above the overview); schedule only inside [t0, t1]
  bp.lineOut(ln, T.back - 0.4); z.out(T.back - 0.3);           // out() takes 1.3 s and must end before ctx.t1: z.out(t, { d: 0.9 }) when time is short
  bp.done(ov, 'srv', T.done);
  ctx.hit('whoosh', T.zoom + 0.2, 0.35);            // a sound cue at the moment the picture lands
  ctx.give('ov', ov);                               // hand over every item of last.items
});
```

- **The overview crosses seams whole**, as kind `overview` with box `[0, 0, 1920, 1080]`, while it shows the overview. The segment that first draws it builds it from its own contract: `F.bp.overview(ctx.layer, Object.assign({}, ctx.out.items.ov, { visible: ['srv'] }))`, so the stand-in is the same picture. Connectors and messages of a detail view go into `ov.lines` / `ov.msgs` (under the nodes); retire them, and windows, before giving the overview back. A `done` or `next` the overview gained goes into its row on both sides of the seam (`last.items.ov` of the segment that marked it, `first.items.ov` of the next: `"done": true`, `"next": 2`), so the stand-in shows it too.
- Other stand-in kinds: `band`, `node`, `loop`, `line`, `term`, `labels`. A seam inside the detail view hands over parts separately; their stand-ins are built in the receiving segment's layer.
- The last frame must match `last`: every item given, its box within 6 px of `box` and visible; chapter label as written; camera home. Retire anything not handed over before the end (check reports "segment-end leftovers").
- Elements created later cover earlier ones in the same layer, and `ctx.take` creates stand-ins in the order you call it: take the overview before anything that sits on it (check reports `handoff_covered`).
- A small object that stays across segments and that no segment animates (one 示意 note for the whole film) is the director's `persist` entry in `handoff.json`; you neither take nor give it.
- Transitions come from objects: the overview zooms into the detail and back; never clear the screen or cross-fade. To change the contract, ask the director to change `handoff.json`.

## Hard requirements and annotations

- At most 4 hand marks in the film and `hands` in your segment (this kit draws none). A block the viewer must read holds ≥ 4 s whole: add `data-read` to its wrapper.
- Label everything illustrative with `F.tag`. The presenter reserve and y ≥ 880 stay empty all film (above).
- No layer-wide exemptions: `data-geo-allow` and `data-layout-allow-*` go on specific elements with a reason (message chips already carry `data-layout-allow-occlusion`, the orbit `data-geo-allow`).
- Only `F.rng` / `F.hash`; never `Math.random` or `Date`.

## Commands

| Command | Does |
|---|---|
| `npm run check -- --seg <id>` | your segment only (or `--from a --to b`): geo-check, presenter reserve frame by frame, handoffs and leftovers, the engine check. The last line is pass / FAIL + report path, with every issue listed above it |
| `npm run anchors -- <lineID> [word]` | when each character (or the word) of a line starts and ends; query only |
| `npm run shots -- --seg <id>` | a contact sheet of your segment (about 15 cells; `--every 1` for spacing, `--at 12.6,13.5` for moments); the engine takes the frames, the last line is the image path |
| `npm run hf -- snapshot --zoom "<selector or x,y,w,h>" --at <s>` | detail of one block (the engine crops a sharp image); `--range a,b --frames n` for n frames of a span |
| `npm run hf -- compare <projectA> <projectB> --at <s>` | two projects side by side at one moment, before and after |
| `npm run render` / `npm run finish` | render and finish; the director or the renderer runs them, not segment agents |

`npm run hf -- <command>` is `npx hyperframes <command>` at the pinned version (only in `build/hf.cjs`); never write `npx hyperframes@…` yourself. Look at pictures, take frames and compare only with the commands above, not hand-written ffmpeg, image scripts or page screenshots.

Silent loop units for articles work as in [terminal-ledger's card](../terminal-ledger/CARD.md#web-loop-units-silent-loops-for-articles) (`npm run web-init`, 1200×675 canvas, one loop); `TOKENS.bp` has a narrower overview for that canvas, and the unit sets no counter.

## Do not read

- The usage at the top of each component, `lib.js`, `main.js`, `build/` script and the skill's `scripts/` is the interface: what a call takes and returns, what is visible at first and how it enters, what must be registered before it moves. Read it with `head`, not the source. When it leaves a question open, read only that function and name the gap under "For others" in your hand-back, so the kit's header gets the answer.
- Look only at `npm run shots` sheets and `ref/look.jpg`; for detail use `npm run hf -- snapshot --zoom` on that block, not full-resolution frames.
- Do not edit `index.html` (generated on every command), `cues.js` (generated by `npm run anchors`), `main.js`, `lib.js`, `tokens.js`, `vendor.json`, `components/`, `build/` (`npm run kit-sync` keeps them in step with the kit and would overwrite changes). If a component is missing or wrong, tell the director.
