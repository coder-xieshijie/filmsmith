# Production card · terminal-ledger

Read only this page to start a segment. The director has set up the project; your segment file `segments/<your id>.js` is a one-line `F.shell(ctx)` stand-in: replace it with your picture. You write that one file; your contract is your entry in `handoff.json` (`start` / `end`, `lines`, `goal`, `first`, `last`, `hands`).

Order of work in a film: the director runs `new-film` and `npm run init` (the shared assets come from `scripts/voice/voice.py`) → fills `handoff.json` and `anchors.txt` → segment agents write their segments and hand back once `check` / `shots` pass → the director checks the whole film and the seams → `render` / `finish`. The commands are in the kit [README](README.md).

## The look

What the approved look is: [ref/look.jpg](ref/look.jpg): the top two rows are moments of the demo segments, the bottom two one cell per component family the demo does not show; each cell is captioned with its time and segment or component.

- Paper `#f6f1e7`, ink `#2b2824`. Vermilion only for the narrator or viewer, a decision only a person makes, the irreversible, and hand marks; teal is the machine; yellow is waiting or routine; green is what passes, matches or is allowed (✓); grey dashed is void. One colour, one meaning. Take colours and sizes from `F.COL` / `F.TK`; never write new values.
- Type: LXGW WenKai for all text; IBM Plex Mono only for commands and logs inside terminals. Sizes 34 chapter / 28 body / 26 secondary and logs / 24 floor; numbers 46–66, the big counter 112.
- The terminal world is plain paper, the ledger world is ruled; both are the same sheet.
- Things appear when they are said (times from `ctx.T` anchors; `cues.js` is generated from the director's `anchors.txt`, never edit it; ask the director for a missing anchor); hold ≥ 0.6 s after each key change; pushes and pulls only `power2.inOut`, arrivals `power3.out`, exits half as long as entrances; no breathing, floating or looping blinks.

## Components (usage at the top of each file: `head -25 components/<name>.js`)

| File | One line |
|---|---|
| `term.js` | `F.term(layer, {title, x, y, w, h, sq})` light terminal, visible at once (enter: `F.init(w, {opacity: 0})`, `F.show`); title bar 40 px, content from y ≈ 50; `F.termType` types with a caret; `F.termLog(w, …).add(line, t, 'ok'/'me'/'stop')` log that scrolls; `F.termGrow` grows with content |
| `wall.js` | `F.wall(layer, {cols, rows, …})`: `.fromTerm(term, t)` a terminal shrinks into the first cell and copies into a wall, `.read` walks the cells, `.emit` sends marks along a rail, `.collapse` folds the wall into a point |
| `ledger.js` | `F.ledger(layer, {title, card})`: `.appear` `.grow` pushes in to a full page, `.addDots`, `.toPile(dots, F.pile(n, cx, cy, seed), centre, t, {color})` sorts into piles; `F.partition` sorts by counts |
| `counter.js` | top-right total: `F.cntSeg(t0, t1, t => '600')`, `F.unit` / `F.unitOn`, `F.cntOn` / `F.cntBlur` (blur before a new quantity) / `F.cntJump`; `F.unitsOff(t)` before a new unit |
| `stamp.js` | stamp (default glyph 我): `F.stamp(ctx.ov, 'stamp')`, `F.stampIn`, `F.pressAt(s, x, y, t, hop, [rest x, y])`, `F.imprint(ctx.imps, x, y, t)`, `F.stampHollow` / `F.stampSolid` |
| `prompt-card.js` | `F.promptCard(layer, {title, x, y, w, h, lines, t, typeAt})` types a sentence to be read, carries `data-read` (its typed characters already carry the overflow exemption); `.color` keywords, `.out` / `.toDot` |
| `hand.js` | hand marks (carry `data-hand`): `F.hand.brace` (`side` = where its tip points), `F.hand.underline` / `F.hand.underChars(win, a, b, t, name)`, `F.hand.circle` |
| `labels.js` | `F.how` 'sorted by' label, `F.tag` dashed "illustrative" note, `F.lbl` number or caption (`F.how` and `F.lbl` start blurred: enter with `F.blurIn`), `F.chip` (`c` yellow `g` green `a` teal `m` vermilion `n` neutral), `F.chipKind`, `F.group` (a set handed over as one) |
| `chapter.js` | `F.chapter('章名', t)` chapter label (one per film; the old one blurs out) |
| `avatar.js` | presenter placeholder, placed by main from `film.json` `avatar`; segments do nothing |
| `handoff.js` | handoff moves: `F.boxTo` box to box, `F.morphCard` a card reshapes in place, `F.flowAlong` along a path, `F.spawnFrom` one becomes many, `F.growInto` a dot grows into a window |
| `grid.js` | `F.grid(layer, {x, y, cols, rows, cell, gap, shape, order})`: `.reveal`, `.fill(n or [i], 'colour', t0, t1)`, `.dash(n or [i], t0, t1)` (void: grey dashed), `.glyph(i, '✓', t)`, `.reset`; `.cells[i].e` is a cell (register x / y before moving it); hand over `.el` as kind `grid` |
| `bars.js` | `F.lanes` swimlanes (`.bar(row, a, b, t)`, `.axis`, `.sweep`, `.reset`); `F.bar` a progress bar; `F.doc` a page of grey text lines, `.keep(n, t)` keeps the first n |
| `marks.js` | `F.mark(layer, x, y, 'ok'/'issue'/'none', t)` result marks; `F.arrow(layer, points, t, {dash, bend})`; `F.divider(layer, x, y0, y1, t)` |
| `sessions.js` | `F.sessions(layer, {boxes, lamps, titles})` four windows with a lamp queue: `.show`, `.lampOn/Off(i, k, t)`, `.prompt(i, '继续', t)`, `.lampXY`; `F.rope(layer, a, b, t)`, `.tighten` / `.drop` |
| `cards.js` | `F.card(layer, {x, y, w, h, num, lines, tone})` (`'off'/'on'/'focus'`, `.show` `.tone` `.setLines`); `F.board(layer, {cards: six, groups: three})` six cards in three groups: `.showAll`, `.light(i, t)`, `.block(g, t)`, `.links(t)` |
| `shell.js` | `F.shell(ctx)` stand-in segment for the director's skeleton; you replace it |
| `lib.js` | `F.init` registers starting values, `F.to(e, {…}, t, d, ease)` tweens on from the last value, `set` `show` `hide` `pop` `blurIn` `draw` `roll`; `F.rng(seed)` `F.hash(n)` |

## Segments and handoffs

```js
defineSegment('b1', function build(ctx) {        // ctx.t0 / ctx.t1 = this segment's start / end
  const led = ctx.take('ledger');                  // receive first.items; a stand-in appears when the previous segment is not built yet
  F.chapter('谁在等谁', ctx.T.b1 - 0.9);
  // … schedule only inside [t0, t1]; layers: ctx.layer (moves with the camera) / ctx.scr (screen-fixed)
  ctx.hit('stamp', ctx.T.b1 + 0.28, 0.5);          // a sound cue at the moment the picture lands
  ctx.give('ledger', led);                          // hand over every item of last.items
});
```

- The last frame must match `last`: every item given, its box within 6 px of `box` and visible; chapter label and counter as written; camera back home. Retire anything not handed over before the end (check reports "segment-end leftovers").
- Elements created later cover earlier ones in the same layer, and `ctx.take` creates stand-ins in the order you call it: create or take a window before what sits inside it (check reports `handoff_covered`).
- A small object that stays across segments and that no segment animates (a 示意 note for the whole film) is the director's `persist` entry in `handoff.json`; you neither take nor give it.
- Transitions come from objects: what the previous segment handed over morphs or moves into the new picture; never clear the screen or cross-fade. To change the contract (another object, a new position), ask the director to change `handoff.json`.

## Hard requirements and annotations

- At most 4 hand marks in the film and `hands` in your segment, only with `F.hand.*`. A card or sentence the viewer must read holds ≥ 4 s whole: prompt cards carry `data-read`; add `data-read` to the wrapper of any other block to be read.
- Label everything illustrative with `F.tag`. Keep the presenter reserve x 1580–1880, y 560–860 empty outside presenter windows, and y ≥ 880 empty always (captions).
- No layer-wide exemptions: `data-geo-allow` and `data-layout-allow-*` go on specific elements with a reason (stamp and imprint carry `data-geo-allow="seal"`, which the engine check ignores: after pressing, retreat with `F.pressAt`'s `rest`; where that is impossible, put `data-layout-allow-overlap` on that one element).
- Only `F.rng` / `F.hash`; never `Math.random` or `Date`.

## Commands

| Command | Does |
|---|---|
| `npm run check -- --seg <id>` | your segment only (or `--from a --to b`): geo-check, presenter reserve frame by frame, handoffs and leftovers, the engine check. The last line is pass / FAIL + report path, with every issue listed above it |
| `npm run anchors -- <lineID> [word]` | when each character (or the word) of a line starts and ends; query only |
| `npm run shots -- --seg <id>` | a contact sheet of your segment (about 15 cells; `--every 1` for spacing, `--at 12.6,13.5` for moments); the engine takes the frames, the last line is the image path |
| `npm run hf -- snapshot --zoom "<selector>" --at <s>` | detail of one element (the engine crops a sharp block); `--range a,b --frames n` for n frames of a span |
| `npm run hf -- compare <projectA> <projectB> --at <s>` | two projects side by side at one moment, before and after |
| `npm run render` / `npm run finish` | render and finish; the director or the renderer runs them, not segment agents |

`npm run hf -- <command>` is `npx hyperframes <command>` at the pinned version (only in `build/hf.cjs`); never write `npx hyperframes@…` yourself. Look at pictures, take frames and compare only with the commands above, not hand-written ffmpeg, image scripts or page screenshots.

## Web loop units (silent loops for articles)

After `new-film`, run `npm run web-init -- <unit id> <seconds> [hand marks] [fonts dir]` instead of `init` (a unit needs only the fonts: any folder `scripts/voice/voice.py fonts --dir <folder>` filled, or a film's shared assets): it writes `film.json` (`"web": true`), a one-segment `handoff.json` with empty items and a `segments/<id>.js` skeleton. Then write only that file. Different from a film:

- **Canvas**: a 1200×675 logical canvas (`TOKENS.zone.W × H`), scaled 1.6× to 1920×1080. Type tokens stay: the 24 px floor reads about 13.6 px in a 680 px column. 40 px margins.
- **Off**: presenter window and reserve, caption zone, narration and music, sound (`ctx.hit` does nothing). No anchors: write seconds; reading `ctx.T` throws. No chapter label; for a title line use `F.lbl(L, '…', 40, 28, 28, F.COL.ink)`.
- **One loop**: an opening state still ≥ 0.8 s (what is on screen at t = 0 is placed with `init`, not faded in) → the process → the settled picture still ≥ 1.5 s (2.5–3.5 s is better) → within the last ≤ 1.0 s tween everything back so the last frame equals frame 0. 8–25 s long.
- **Handoff**: `first.counter` must be `null` (set the counter yourself at 0 s: `F.cntSeg(0, D, …)`, `F.unitOn(k, 0)`, `F.cntOn(0)`); `last.counter` is the number shown at the end, or `null`.
- **Checks**: `npm run check` as above (caption zone and reserve skipped); `npm run render && npm run finish` writes `renders/unit.mp4` (no audio), poster and contact sheet, then `build/web-check.sh`: spec, silence, length, loop seam PSNR ≥ 40 dB, the final hold. Fix until every line is PASS.
- A hand circle around text must not touch the text (`rx` ≥ half the text width + 20), or geo reports `text_on_stroke`.

## Do not read

- The usage at the top of each component, `lib.js`, `main.js`, `build/` script and the skill's `scripts/` is the interface: what a call takes and returns, what is visible at first and how it enters, what must be registered before it moves. Read it with `head`, not the source. When it leaves a question open, read only that function and name the gap under "For others" in your hand-back, so the kit's header gets the answer.
- Look only at `npm run shots` sheets and `ref/look.jpg`; for detail use `npm run hf -- snapshot --zoom` on that block, not full-resolution frames.
- Do not edit `index.html` (generated on every command), `cues.js` (generated by `npm run anchors`), `main.js`, `lib.js`, `tokens.js`, `components/`, `build/` (`npm run kit-sync` keeps them in step with the kit and would overwrite changes). If a component is missing or wrong, tell the director.
