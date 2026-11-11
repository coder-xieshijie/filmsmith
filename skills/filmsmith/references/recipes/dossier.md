# Recipe: dossier

An evidence file on a dark mat: each claim is shown on the published page that printed it, mounted on paper, the rest of the page veiled, the claim struck with a highlighter and tied by a leader to an exhibit sticker, and restated in serif on the mat with its terms; the band moves down the page to the next claim; pages change by paper being handled (dealt, turned, shuffled, cut into slats, matched on a value printed in both); a figure is lifted off a page as a slip and carried to a ruled worksheet, where the result is computed and struck on the drop; an index lists every claim where it was printed; the name is struck on the mat. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [dossier](../modes/dossier.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/dossier/`, whose `content.js` is the example film.

## Reference look

[`evidence-mat`](../../assets/runtime/bricks/look/evidence-mat/CARD.md): three presets (`yellow` default, `magenta`, `coral`) sharing the neutrals — the mat `#161512` with its ink and dim, paper `#F3F1EA` with its ink and muted, the stack's paper edge — and differing only in the highlighter and the type on it, picked by the accent rule (ΔE00 ≥ 20 from every colour inside each struck band; a claim printed in colour is struck under the line); the accent means only a published claim and its proof; the veil is the mat at 50 %; Source Serif 4 (600 claims, titles, the result at 125 and the name at 160; 400 rows), IBM Plex Mono (terms, header, labels at 25; values and the URL at 40), Inter Tight 700 only inside the slip; the frame's lines at y 54 (header), 186 (claim), 234 (terms), 292 (the reading position) and 1026; a locked camera. The bricks share `look/evidence-mat/kit.js`: lines of words that rise and sink, the paper (tooth, edges, ruling), the exhibit sheet (crop and scale under the zoom cap, veil, multiply stroke, leader, sticker), the worksheet and the slip, the index, the header, the sheet motions (deal, slide off), the tail moves, and a placeholder published table for samples.

## The exhibit

Every sheet scene takes the same `exhibit` object: the capture's URL and size, the crop, where its claim is printed (`band`, image px), whether the stroke runs under the line (`under`), the leader's route (`down`, `left`, `right`, `false`), the exhibit's number and the file's count (`ex`, `of`), the source's kind and where and when it was captured (`kind`, `where`), and whether it lies as a spread beside a worksheet (`spread`). The scenes after the first on a sheet take the sheet as the scene before left it, plus `prior` (the claim and terms standing on the mat) and, where sheets leave, `leaving`. A film writes these once from its content and its measured regions; the template's `content.js` holds the example's.

## Recommended bricks

| Slot (arc `evidence-file`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`exhibit-strike`](../../assets/runtime/bricks/scene/exhibit-strike/CARD.md) (`enter: 'open'`) | – |
| problem (0–3) | [`claim-shift`](../../assets/runtime/bricks/scene/claim-shift/CARD.md) (the same page), [`exhibit-strike`](../../assets/runtime/bricks/scene/exhibit-strike/CARD.md) | – |
| demo (1–3 exhibits) | [`exhibit-strike`](../../assets/runtime/bricks/scene/exhibit-strike/CARD.md) (`deal`; `change` after a turn, shuffle or louvre; `matched` after a match cut) | seams: [`sheet-deal`](../../assets/runtime/bricks/motion/sheet-deal/CARD.md), [`page-turn`](../../assets/runtime/bricks/motion/page-turn/CARD.md), runtime [`sheet-shuffle`](../transitions.md#sheet-shuffle), `louvre`, `match-cut` |
| proof | [`claim-shift`](../../assets/runtime/bricks/scene/claim-shift/CARD.md) | – |
| turn | [`worksheet-carry`](../../assets/runtime/bricks/scene/worksheet-carry/CARD.md) | runtime [`split-open`](../transitions.md#split-open) (inside it) |
| climax | [`result-strike`](../../assets/runtime/bricks/scene/result-strike/CARD.md) | – |
| rest | [`exhibit-ledger`](../../assets/runtime/bricks/scene/exhibit-ledger/CARD.md) | – |
| lockup | [`name-strike`](../../assets/runtime/bricks/scene/name-strike/CARD.md) | – |
| every scene | [`mounted-sheet`](../../assets/runtime/bricks/prop/mounted-sheet/CARD.md), [`exhibit-sticker`](../../assets/runtime/bricks/prop/exhibit-sticker/CARD.md), [`ruled-worksheet`](../../assets/runtime/bricks/prop/ruled-worksheet/CARD.md), [`file-slug`](../../assets/runtime/bricks/prop/file-slug/CARD.md) (inside the kit) | runtime `seam` (the spread's seam) |
| sound | [`paper-bed`](../../assets/runtime/bricks/sound/paper-bed/CARD.md) (lib/audio `diagram`) | – |

No brick from another style is reused as is: the nearest are the exhibit style's [`region-light`](../../assets/runtime/bricks/prop/region-light/CARD.md) (a veil and a ring round a region) and [`print-mount`](../../assets/runtime/bricks/prop/print-mount/CARD.md) (a print on a desk mount seen from above), and [`marker-stroke`](../../assets/runtime/bricks/motion/marker-stroke/CARD.md) (a marker under a title in type); the dossier's multiply stroke over a captured page, its leader and sticker and its flat file sheet are different marks, so the cards list them as overlaps.

## Ban list

- Any camera move, lift, flip of the whole frame or crossfade: pages change by paper handling and editorial cuts only.
- The accent anywhere but a published claim and its proof (stroke, leader core, sticker, tabs, the struck result, the band behind the name, the URL underline); a seam or slat edge in the accent (they are ink with a paper key).
- A band over a chart line or point; a stroke over a claim printed in colour that falls under 3:1 (strike under the line).
- Recolouring, retouching, rebuilding or blurring a page; zooming past 4/3 output px per source px; page text counted as readable.
- Investigative clichés: red string, pins, clips, polaroids, stains, aged edges, red rubber stamps, redaction bars as decoration, a typewriter face or keys, a magnifying glass, grain over pages; copy like "The receipts.", "Case closed.", "Exhibit A".
- A second carry, a second computed result, a highlight on a heading or the product name inside the film body.

## Template → bricks

| Template part (`assets/templates/dossier/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, type and grid of `film.js`, `layout.js` constants | [`evidence-mat`](../../assets/runtime/bricks/look/evidence-mat/CARD.md) (+ `kit.js`) | |
| `lineOf`, `drawLine`, `appendTo`, `paper`, `edges`, `poly`, `stampScale`, `popScale`, `popsOf` | `kit.js` | |
| `exhibit` (`planOf`, `paintSheet`, `buildMat`) | [`exhibit-strike`](../../assets/runtime/bricks/scene/exhibit-strike/CARD.md) | enter `open`, `deal`, `change`, `matched` |
| `claim` (`bandAt`) | [`claim-shift`](../../assets/runtime/bricks/scene/claim-shift/CARD.md) | |
| `worksheet` (`buildWorksheet`, `buildSlip`, `slipAt`, `openParams`) | [`worksheet-carry`](../../assets/runtime/bricks/scene/worksheet-carry/CARD.md) | runtime [`split-open`](../transitions.md#split-open) called as the template does |
| `result` | [`result-strike`](../../assets/runtime/bricks/scene/result-strike/CARD.md) | |
| `ledger` (`buildLedger`, `paintLedger`) | [`exhibit-ledger`](../../assets/runtime/bricks/scene/exhibit-ledger/CARD.md) | |
| `lockup` (`buildLockup`, `paintLockup`, `endMove`) | [`name-strike`](../../assets/runtime/bricks/scene/name-strike/CARD.md) | `beats` takes the arc's rounding |
| `changes.js` `turn` (dossier-page-turn) | [`page-turn`](../../assets/runtime/bricks/motion/page-turn/CARD.md) | ends edge-on at its fastest on the downbeat, as the template's, declared `endsMoving` |
| `dealY`, `exitY` (deal) | [`sheet-deal`](../../assets/runtime/bricks/motion/sheet-deal/CARD.md) | the same curves inside the scenes |
| `paintSheet` sticker, `tagOf` | [`exhibit-sticker`](../../assets/runtime/bricks/prop/exhibit-sticker/CARD.md) | |
| `paper`, `edges`, `paintSheet`, `sheetOf`, `bandOf`, `leaderOf` | [`mounted-sheet`](../../assets/runtime/bricks/prop/mounted-sheet/CARD.md) | |
| `paintWorksheet` | [`ruled-worksheet`](../../assets/runtime/bricks/prop/ruled-worksheet/CARD.md) | |
| `paintHeader` | [`file-slug`](../../assets/runtime/bricks/prop/file-slug/CARD.md) | |
| `score.mjs` (lib/audio `diagram`) | [`paper-bed`](../../assets/runtime/bricks/sound/paper-bed/CARD.md) | |
| `content.js` order, `timing.rules.js` | [`evidence-file`](../../assets/runtime/bricks/arc/evidence-file/CARD.md) | |
| `changes.js` `sheet-shuffle`, `louvre`, `match-cut`; `split-open`, `seam` | runtime, referenced | not copied; the scenes after them take `enter: 'change'` or `'matched'` |

What stays in the template:

- **The capture and asset tools** (`tools/capture.mjs`, `check-assets.mjs`, `pixels.mjs`, `regions.mjs`, `vision.swift`; `npm run assets`, `npm run palettes`): the capture at 2×, the hashes and sizes, the zoom cap, private regions, the `expect` / `drawn` / `forbid` text checks, every on-screen number printed in a crop, leaders clear of text, no faces, the slip's text, ΔE00 ≥ 20 and legibility in every band. Bricks take the capture and its boxes as data (`exhibit`, `carry`); producing and checking them is the template's job.
- **The page changes' pairing** (`changes.js` registry, `film.js` `changeArgs`, `buildPairs`, `paintPile`): a shuffle, a louvre or a match cut draws two finished sheets and knows each sheet's matched value or struck rows; the film pairs them and keeps the shuffled sheet as the pile's corner. The runtime modules do the motion; which sheets they pair is the film's.
- **The film's plan** (`content.js`, `derived`, `timing.rules.js`, `npm run fit`): the claims, the derived numbers and how they were read off, which scene clears the mat when, the phrase rounding (the lock-up takes it).

## Chinese

Dossier's type is an editorial serif with mono identifiers; nothing in it depends on Latin letterforms, so Chinese needs a setting rather than a redesign, except for two things (accepted by the owner, 2026-11-10):

- **Type**: claims, titles and rows in Noto Serif SC (600 / 400) at the same sizes; mono labels at the 28 px floor with Noto Sans SC for Chinese; "EX. n" becomes 证物 n; the header reads 来源档案：…, 证物 4 / 共 4 件, 演算纸，取自证物 4, 证物索引, 共 4 件证物. The pages and the slip stay in their own language.
- **The rise** (every line on the mat and the worksheet): English rises word by word, 0.12 s apart; Chinese has no spaces, so a line rises character by character at a third of that stagger (0.04 s), landing in about the time an English line does.
- **The name band** ([`name-strike`](../../assets/runtime/bricks/scene/name-strike/CARD.md)): the band is cut to Latin cap height and descender; Chinese characters fill the em box and stood above it, so a name with Chinese gets a taller band (0.91 em above the baseline to 0.19 below).
