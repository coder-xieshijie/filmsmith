# Brief template

Copy into the film folder as `brief.md`, replace the angle brackets, delete rows you do not need. Written for makers and the checker: short, concrete sentences, one point each, in the language of the user's project. Generic practice already on the kit's CARD.md is not repeated here. The dispatcher hands it to the director, the segment makers and the checker; each reads the sections it needs, and notes point at sections by their headings.

```markdown
# Brief: <film> · <what this version is> (<date>)

## Delivery
- Form: <video / article with silent loops / both> (decided before work started).
- Bar: <direction sample: hard floor only / production: every gate in code and the independent check>.

## What the user asked for
<The user's words, quoted with the date. Where the user accepted a recommendation, say so and list what it was.>

## Scope and length
- Length <45 s / 3:11.9>, following the shared assets' timeline; do not lengthen or reorder.
- Segments: <a 0–27 s: what it explains; b 27–53.4 s: …> (the director cuts and writes handoff.json from this).
- Learning goals: after watching, the viewer can <1–3 goals>.

## Read
Only these; find anything else by name when needed, never read through.

| File | Which part | Why |
|---|---|---|
| `<film>/topic.md` | fact sheet F1–F<n>, numbers on screen, wording notes | numbers and claims on screen come only from here; quotations verbatim |
| `<film>/shared/` | narration, timeline, word timestamps, contract | read only; report problems to the director |
| `<skill>/assets/kits/<kit>/CARD.md` | all (one page) | components, layout constants, how to write a segment |
| `<skill>/assets/kits/<kit>/ref/look.jpg`, or `<film>/look-board.md` after a direction review | all | the look |

Do not read: old projects' source, component source (CARD.md has the usage), check-script source (their headers have the usage), the full HyperFrames skill references (look up one section by name if needed).

## Per segment
- **<a: name> (<line IDs>)**: <the state change to act out: before → during → after; the key moment; which component>.
- **<b: name>**: …

## Hard requirements
Each row says who measures it. Makers make the scripted ones pass before handing back; the rest are for the checker.

| Requirement | Measured by | What the maker does |
|---|---|---|
| 1920×1080, 30 fps, h264, yuv420p, bt709; AAC 48 kHz; about −14 LUFS, true peak ≤ −1.5 dBTP | `npm run finish` (renderer) | nothing |
| y ≥ 880 empty (by layout, not a mask) | geo-check (`npm run check`) | nothing |
| text never on lines, overlapping, or out of frame | geo-check, engine check | a deliberate case: `data-geo-allow` on that element with a reason, never on a layer |
| presenter reserve holds only the placeholder, only in its windows | page checks (`npm run check`) | nothing |
| transitions never wipe to blank paper | geo-check empty frames | nothing |
| at most <4> hand marks | geo-check hand count | `data-hand="<name>"` on each hand mark's wrapper (F.hand.* does it) |
| <cards, quotations> held ≥ <4> s | geo-check read holds | `data-read="<seconds>"` on the block (prompt cards have it) |
| facts and wording: <e.g. two figures with different bases never in one chart> | checker | label illustrative pictures 示意 |
| every state change acted out before → during → after; picture in sync with the words | checker | tie motion to word anchors |
| <a taste requirement the user set, e.g. "sessions are windows, never bars"> | checker | |
| the frame depends only on time; one command re-renders | renderer | never `Math.random` or `Date` |
| write only your own files (in production your `segments/<id>.js`); no commits; no media in version control | dispatcher, by the file listing | |

## Hand back
| Field | What |
|---|---|
| Done | line by line: what changes on screen at that moment |
| Checks | the `npm run check` summary line; elements given exemptions, with reasons |
| Against the contract | first or last frames that differ from handoff.json, and why |
| For others | changes needed in shared assets, the contract or other segments |
| Read | each file read, and which part |
| Known issues | what is not done or uncertain |
```
