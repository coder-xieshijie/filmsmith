# blueprint-zoom · overview, enlarge, return

A style kit for explaining a system made of parts: the whole system as one overview of equal-width layers whose nodes are hand-drawn, one layer enlarged into its detail view where messages travel along clean connectors, then back to the overview. Extracted on 2026-11-08 from a 49-second style sample the owner approved that day as the teach pipeline's second approved look, taken from that version as it is. The structure it serves is the one [teaching.md](../../../references/teaching.md) offers for a system of parts; whether a film uses it stays the maker's judgement.

- Segment agents read only [CARD.md](CARD.md) (one page) and look at [ref/look.jpg](ref/look.jpg) (8 demo moments, then 4 component families shot from a temporary gallery project with `npm run shots -- --at …`).
- [starter/](starter/) is the project every film with this kit starts from (`scripts/new-film-teach.mjs <dir> --kit blueprint-zoom` copies it). Its two demo segments (`demo-a` the overview loads, `demo-b` enlarge the server layer, walk one request to the database and back, return; illustrative content about a web request) run on [demo-shared/](demo-shared/) and pass `npm run check`; `npm run init` deletes them.
- To run the demo in a fresh copy: copy `demo-shared/` out of the skill (a new project's `film.json` `shared` points at the skill's own copy, which holds only JSON, so its first check stops for want of audio and fonts, and generating them there would write into the skill), make its voice, track, music and fonts with `uv run <skill>/scripts/voice/voice.py tts track audio fonts --dir <copy>` (the committed timeline and word timestamps stay as they are), and point `film.json` `shared` at the copy.
- What every kit must contain and how to extract a new one: [../README.md](../README.md).

## What is the same as terminal-ledger

`lib.js`, `main.js` and everything in `build/` are byte-identical to terminal-ledger's starter (the selftest's `kit-shared-identical` case asserts it): they carry no style, and a change to them is made in both kits. So these sections of [terminal-ledger's README](../terminal-ledger/README.md) hold here as written: **Project layout**, **Commands** (`init`, `anchors`, `check`, `shots`, `hf`, `render`, `finish`, `kit-sync`, `web-init`), the **Handoff contract** (except its list of stand-in kinds, below) and **Engine version** (HyperFrames 0.8.214, pinned in `starter/build/hf.cjs`).

Differences in the project:

- `tokens.js` adds `TOKENS.bp`, the overview's geometry (bands x 60–1540, cells x 320–1516, side box at x 1600, the zoom's push 1.55 and length 1.3 s) and the Rough.js settings; colours are one palette per layer (`blue`, `violet`, `ochre`, `teal`, `stone`, `red`) and four message kinds.
- `style.css` maps the `Mono` family to LXGW WenKai, so every text, terminals included, is WenKai (the fonts step still fetches IBM Plex Mono; this kit does not load it).
- `components/` has no counter, presenter placeholder or hand marks: `main.js` and `shell.js` call those only when present. The presenter reserve stays empty for the whole film: write `"windows_s": {}` in `shared.json`, as the demo does. Presenter windows in `film.json` would exempt those spans from the reserve check, and `assemble` would still add its presenter placeholder blocks, unstyled here (this kit has no presenter styles): keep `avatar` empty.
- `vendor.json` lists Rough.js 4.6.6 (`roughjs` from the npm registry, `bundled/rough.js`, MIT, checked by sha256). Every command's `assemble` hashes the vendor files against their pins and fetches a missing, damaged or re-pinned one again; `kit-sync` copies `vendor.json`. Nothing of it is committed.

## Components

One picture unit per file, usage in each header: `overview.js` (the layered overview from a plain spec, the "done" mark and the next-part ring), `zoom.js` (enlarge one layer and return), `band.js`, `node.js` (Rough outline and hachure), `loop.js` (pill ↔ circle, orbit, rounds, stop), `line.js`, `message.js` (chips that travel, rest in the gaps, type and fade under parts), `status.js`, plus `term.js`, `labels.js`, `chapter.js` and `shell.js` from terminal-ledger (`term.js`, `chapter.js` and `shell.js` unchanged; `labels.js` without chips). Looks, sizes and timings come from the approved sample's code. Properties to know:

- The overview is built from one plain spec, the same object `handoff.json` carries, so a segment and the stand-in of it draw the same picture, "done" marks and next-part rings included.
- A band and a loop keep their element at their current frame, so a handoff box, the cover test and the leftover test measure them.
- Messages sit under nodes and windows. With `under` (the boxes of the parts on the path) a message fades as it slides into a part, so its text is never seen half cut; without it the text is cut at the part's edge while it enters or leaves. `hold` rests it whole in the gap between two parts.
- Each zoom pushes the other layers about its own layer's centre, whichever zoom moved them before; a layer whose push would at any moment reach the presenter reserve fades in 0.3 s instead of 0.6 × the zoom. A side box belonging to another layer is pushed away with that layer and comes back with it.

## Handoffs

Stand-in kinds: `overview` (box `[0, 0, 1920, 1080]`; the spec is the overview's rows, cells, `done` / `next` and side box, the same object the segment that draws it builds from), `band`, `node`, `loop` (`shape` `pill` or `circle`), `line`, `term`, `labels`. Hand the overview over whole while it shows the overview; a seam inside the detail view hands parts over separately, and their stand-ins are built in the receiving segment's own layer, so messages there no longer pass under them.

## Measured

- The demo (2 segments, 24.5 s): `npm run check` passes with geo 0, page 0 and engine check 0 errors in about 25–35 s (geo-check about 25–31 s: the hachure is many short paths; page checks and the engine check run beside it). The selftest runs geo-check on it (`kit-demo-blueprint-zoom`, about 26 s) and two zoom cases on copies of it: a layer sweeping through the presenter reserve, and a second zoom after a built or stand-in segment.
- From copying the starter to a passing demo: about 20 minutes and one `npm run check` round, for the agent that extracted the components (writing the component files, voicing the demo narration twice, writing both segments). A fresh segment agent that read only this card wrote an 11-second segment in about 9 minutes and two check rounds.
- Against the approved sample's render (`npm run hf -- snapshot --against`, detail view and overview side by side): same type sizes, line weights, circle and window drawing; paper, band tint, hachure, window body and border colours within 1–12 levels of 255, the difference of h264 compression and anti-aliasing. The demo's layers and detail nodes are taller than the sample's, to fill the frame.

## Known limits

- Layers end at x 1540, so only one box fits right of them, above the presenter reserve (`F.bp.overview` refuses a side box that would reach it); a system with two outside parts puts the second in a layer.
- A node moved with `F.boxTo` scales its text: keep detail boxes the size of the overview cells (widen a row's `gap` to make them fit, CARD.md), or the text stretches.
- `under` treats a circle as its bounding square, so a message on a diagonal fades slightly before it touches the circle; paths that meet a part at the middle of an edge are unaffected.
- Repeated rounds at about 0.5 s per hop read as "the same path again"; a first-time viewer may need to replay them.
- The overview's spec in `handoff.json` is long (every row and cell); it is the only place its layout is written.
- Silent loop units: `TOKENS.bp` has a narrower overview for the 1200×675 canvas (no side column: give `side.box`), but no unit has been made with this kit yet.
- The demo's voice, music and sound cues are the temporary ones `voice.py` makes; nobody has listened to them.
