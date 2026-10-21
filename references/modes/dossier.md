# Dossier (`dossier`)

An editorial evidence file on a locked document camera: real published pages (tables, charts, pricing, changelogs, product screens) are mounted on paper and dealt one at a time onto a dark mat; the rest of the page is veiled, a highlighter strikes the exact words or number a claim rests on, a leader ties the stroke to an exhibit sticker that names the source and its capture date, and the claim is restated in type on the mat. A figure the viewer must read is lifted off its page as a paper slip and carried onto a ruled worksheet that does the arithmetic and strikes the result; an index of exhibits closes the file; the name is struck on the mat. Aesthetic anchor: "like a newsroom's annotated source document — yellow note rectangles on a trial exhibit with its sticker — filmed on a document camera".
Theme: tech-product-launch (benchmark-heavy launches), technical reports, changelogs · Template: `assets/templates/dossier/` · tempo 112–124 BPM, default 120 (length follows the copy; the shipped example fits 16 bars = 32.0 s) · timing API 3 · Status: owner-accepted 2026-10-21 (sample film, its sound included); template 2026-10-21. Values are tagged `standard` / `borrowed` / `derived` / `owner` / `draft` as in [foundations](../foundations.md#where-values-come-from).

## Fits / does not fit

Fits: a story whose claims are already published by someone, where the film's job is to show each claim on the page that published it and say exactly how it was measured: benchmark-heavy model and product launches, reports and papers with a headline table or figure, price and cost comparisons, changelogs whose lines carry the news. Three to eight claims on two to five pages, about 20–60 s. The pages say "technical product" before a word is read, so the mode is chosen by content (evidence), not by form.

Does not fit:
- a walkthrough of a product's own interface, its state changing inside one window (handset);
- a tour of many assets in one world, or one value followed from asset to asset by a travelling camera (exhibit);
- a CLI or terminal tool (phosphor); counts (tally); a mechanism (trace);
- a claim with no published source, or a source that cannot be shown in the film's language;
- a teaser or a naming moment (ink); anything whose emotion is the point;
- one page with one claim: that is a still with a highlight; below three claims use another mode.

## Use cases

| Use | Example (made-up product, except the shipped example) | Chain |
|---|---|---|
| **A launch whose claims are results on the vendor's own table and charts** (best fit) | `orrery-3`, a model: its row on the official benchmark table struck three times (two firsts, one tie), the price table, the cost chart's label carried as a slip onto a worksheet that computes "higher score at ~1/25 the cost per task" | exhibit → claim → claim → exhibit → exhibit → claim → worksheet → result → ledger → lockup |
| **A release told by its own pages** (the shipped example) | the skill itself: the README's style list and its requirements, the changelog's loudness line carried onto a worksheet that computes the margin under the gate (32 s) | exhibit → exhibit → claim → exhibit → claim → worksheet → result → ledger → lockup |
| A paper's headline result | `fernwave`, a retrieval paper: the abstract's sentence struck, the leader to Table 2, the row carried onto a worksheet that states what the number measures | exhibit → exhibit → worksheet → result → lockup |
| A price change across official pages | `quarrystore`, a database: last month's and this month's pricing pages, the per-hour prices carried onto a worksheet that computes one workload's monthly cost | exhibit → exhibit → worksheet → result → ledger → lockup |

## Mode principles

1. **The source page is the protagonist and is never touched.** A page is cropped, scaled and veiled uniformly; its pixels are never recoloured, retouched, redrawn or blurred (motion blur during a move belongs to the move and is gone on the landing frame); a logo is never broken into parts; people are cropped out. Every mark (band, leader, sticker) lies above the page as its own layer. *(Narrows 2, precision, and 8, the picture is technical.)*
2. **The camera never moves; paper does.** One sheet sits in the reading position at a time (a sheet and its worksheet in a spread); sheets arrive by being dealt onto the file or are uncovered when the sheet above turns away. No truck, orbit, zoom-through or tilt: the change comes to the eye where it already is. *(Narrows 3 and 4: the next page is already under the current one. What separates it from exhibit, whose camera travels.)*
3. **One stroke per claim, exactly on the claim.** The highlighter covers the words or the number the claim rests on — the whole row when the claim is a rank ("first" needs its competitors in view), the label when the claim is a point on a chart — and nothing else; the rest of the page dims under a uniform veil, so the claim stands out by luminance, not by colour alone. A band lies over text and pale tints, never over a data mark. *(Narrows 3 and 7.)*
4. **Every mark is tied to where it was published.** Each struck claim has a leader to its exhibit sticker, or is carried onto the worksheet; every exhibit carries a sticker in short form on two lines: "EX. n as published" (or "as captured" for a screen of an app) over "domain · page · capture date". Every worksheet cites its exhibit with a tab. A number keeps its source's terms (who measured it, `~` for a value read off a chart). `owner` (2026-10-20). *(Narrows 2.)*
5. **Prove in pixels, read in code.** Text inside a page is evidence and is never counted as readable; whatever the viewer must read is set in code at ≥ 25 px (main text 50): the claim on the mat, the sticker, the worksheet. When a page's own figure must be read it is lifted out as a paper slip: its own pixels to at most 1.2 × the sheet's scale, then in one frame the same cell set in code on its own sampled paper and ink, registered on its ink box, carried to the worksheet and laid down there as a clipping. `owner` (2026-10-20: the slip replaced a jump from the page's face to the mode's serif). *(Narrows 1.)*
6. **The arithmetic is on the page.** A comparison is never a bare ratio: the worksheet shows the carried values with their terms, a rule, and the result computed from them; a cost is compared only against a result that scored no higher. *(Narrows 2 and 9.)*
7. **Flat paper, hard edges.** Sheets are flat: no soft shadow, glass, glow, bevel or tilt at rest; the depth of the file is two hard paper edges offset 7 and 14 px. The page turn is the one 3D move; it passes edge-on in one beat. The slip alone casts a small shadow while it is in the air. *(Narrows 6 and 7; paper does not bounce.)*

## Rules for real assets

| Rule | Value | Tag |
|---|---|---|
| Zoom cap | output px per source px ≤ 4/3 (an output pixel covers ≥ 0.75 source px), the slip's lift (1.2 × the sheet's scale) included | `standard` (principle 2) / `derived` |
| Not changed | pages are only cropped, scaled and veiled (the mat at 50 %); never recoloured, retouched, re-laid out or regenerated; a rebuilt page never stands in for a capture | `standard` (principle 2) |
| Manifest | every page in `content.assets`: file, size, sha256, page, capture date, how, kind (`as published` / `as captured`), `expect` / `drawn` / `forbid` strings, private rectangles | `derived` |
| Number consistency | `npm run assets`: hash and size unchanged; the OS vision framework finds every `expect` and `drawn` string and no `forbid` in the crops; **every number set in type on screen is printed in a crop**; the slip's region reads its text | `derived` |
| Accent against the page | the highlighter differs from every chromatic colour (CIELAB chroma ≥ 12) inside each band by **ΔE00 ≥ 20**; `npm run palettes` and `npm run assets` check it on the film's own bands | `owner` (2026-10-20) |
| Legible under the stroke | the claim under a multiply stroke keeps ≥ 3:1, or ≥ 80 % of the page's own contrast when that was already lower; a band that cannot runs under the line (`under: true`), clear of the claim's ink | `derived` (2026-10-21, from the `magenta` preset: below) |
| Leaders | a leader's run over the page crosses no text; where every path would, there is no leader and the figure is lifted instead | `derived` |
| Private regions | an app screen's account rows and sidebars are declared and stay out of every crop; UI text in another language is evidence, never read on screen | `owner` (2026-10-20) |
| People | no person in any crop; faces detected fail the check | `standard` |
| Superseded sources | a page that printed a different figure is never shown | `borrowed` (principle 2) |
| The mark | the official logo file, whole, on the mat (never on paper, never in parts) | `derived` |
| Colours | a page's own colours are content, not palette; they do not count toward the accent's area | `derived` |

## Palette presets

The neutrals are shared by every preset; only the highlighter changes. Choose a preset by the accent rule, never invent a hex value; a brand colour becomes a new preset ([system](../system.md), "A preset from a brand colour").

| id | name | fits | mat · onMat · mutedOnMat | paper · paperEdge | ink · muted | accent | onAccent |
|---|---|---|---|---|---|---|---|
| `yellow` | Highlighter yellow (default) | almost every source; the colour newsrooms annotate in | `#161512` · `#EEEBE2` · `#A8A396` | `#F3F1EA` · `#CFCBBF` | `#1C1B17` · `#5A574E` | `#FFE13B` | `#1C1B17` |
| `magenta` | Magenta highlighter | a subject whose brand colour is a magenta or pink-red; pages printed mostly in black | same | same | same | `#E20088` | `#020202` |
| `coral` | Coral highlighter | a subject whose brand colour is a coral; pages with no red or coral data | same | same | same | `#FF7A63` | `#1C1B17` |

Contrast (`standard`, WCAG 2.2, `npm run palettes`): ink / paper 15.3, muted / paper 6.4, onMat / mat 15.3, mutedOnMat / mat 7.3, paper / mat 16.2; type on the accent (stickers, tabs) 13.2 `yellow`, 4.53 `magenta`, 6.74 `coral`; the accent on the mat (the leader's core, the struck name) 14.0, 3.99, 7.1; black page type under the veil 6.1. The accent is never a line or type on paper: only a fill under ink, and a leader over paper carries a 2.5 px ink case each side (system, "a coloured line over a coloured field"). Mat L* 6.8, paper L* 95.1 (system neutrals, `borrowed`).

**`yellow`** (`derived`): public notes on annotated source documents are shown "as clickable yellow rectangles" ([MuckRock, 2020](https://www.muckrock.com/news/archives/2020/aug/24/documentcloud-page-note-embeds/)), and trial exhibit stickers are conventionally yellow for the plaintiff ([Courtroom Technology Wiki](https://www.courtroomtech.org/2018/09/12/electronic-exhibit-stickers/)). Fluorescent inks lie outside sRGB; `#FFE13B` is an approximation lowered a step so ink on it reads. The default (`owner`, 2026-10-20: yellow kept, a green preset dropped for sitting next to handset's lime).

**`magenta`** (`owner`, 2026-10-21: "a colour closer to the subject" asked for over yellow on a launch film; built by the system's brand-colour steps): a brand guide's icon gradient starts at `#E21680` (OKLCH 0.599 0.236 357.7°). On a vendor benchmark table that stop measured ΔE00 19.1 against the table's red column rule (compression variants of it), under the rule, so it was moved along its own OKLCH hue to `#E20088`, 2.2 ΔE00 away, which keeps 20.7–24.9 from every chromatic pixel in that film's bands. The gradient's middle and warm stops sat 6–15 ΔE00 from red print and were not taken. Ink on `#E20088` is 3.77:1, so type on accent fills is a darker near-black (`onAccent` `#020202`, 4.53:1). **Rendered, not just the hex** (multiply over the page, measured on the frames): black page type under the stroke 3.8:1 on white, 3.55:1 on a pink table cell, 3.44:1 on the mount's paper — legible; but type printed in colour falls to 1.0–1.8:1 (a red price 1.02, a chart label 1.56). Such claims run **under the line** (`under: true`: a strip under the claim, the claim's own pixels untouched), which `npm run palettes` and `npm run assets` enforce.

**`coral`** (`derived`, 2026-10-20): a brand guide's flat coral `#FF6452`, lightened along its OKLCH hue to `#FF7A63` so ink reads on it (6.74:1). It sits within 12 ΔE00 of red data: barred from pages that print data in red or coral.

## Variants

**Colour**: the three presets above, picked by the accent rule.

**Form: `highlight`** (content.js; the default renders exactly as before the field existed):

| `highlight` | What changes | When | Source |
|---|---|---|---|
| `band` (default) | every stroke covers its claim (multiply); a single band may still say `under: true` | most films | the newsroom highlighter (`derived`) |
| `underline` | every stroke on a page runs under its line: a strip ≥ 7 px starting 2 source px above the band's lower edge, the veil's hole still lighting the whole claim; the result's stroke runs under the figure; the band behind the name stays | pages printed in colour throughout, or `magenta` over coloured type | an editor's underline (`draft`, 2026-10-21) |

## Accent role

- **Accent**: a published claim and its proof (one kind of thing): the stroke over the exact words or number, the leader's core and its dot, the exhibit sticker, the exhibit tabs on the worksheet and the index, the stroke on the result the worksheet computed, the band behind the struck name and the URL's underline at the close. As a mark it measured 2.7 % of the frame (median, shipped example), at most 3.6 %; never a ground.
- **Neutral**: all type, the mat, the paper, the paper edges, the veil.
- **Status / category / effect**: none drawn by the mode: a disputed or superseded source is said in words on its sticker, never in red. Colours inside pages are content.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Claims, worksheet title and rows, the figure, the name | Source Serif 4 (variable): 600 claims, title, figure, name; 400 rows and captions | OFL 1.1 | 160 name · 125 figure · 50 claim and title · 40 rows, caption |
| Stickers, tabs, the persistent frame, terms, sources, URL, values in a row | IBM Plex Mono 400 / 500 / 600 | OFL 1.1 | 40 URL, row values · 25 stickers, tabs, terms, slug, sources, capture line |
| The carried slip's code copy | Inter Tight 700, scaled to the cell's ink box | OFL 1.1 | the page's own printing × the slip's landed scale (about 28 px of ink) |

A serif because the content is editorial (system pairing rule). The sans appears only inside a slip, where it stands in for the page's own printing. Information text ≥ 25 px everywhere it is read; main text 50 (`standard`, principle 1). **Below 25 px: only text inside the pages**, which is evidence, never information (check-film reports it as the smallest text: about 21 px on the shipped spread).

## Type scale

Ratio 1.25 from the 25 px floor, rounded to tens: **25 · 32 · 40 · 50 · 64 · 80 · 100 · 125 · 160** (`derived`). Levels per frame outside page text: an exhibit 50 · 25; the worksheet 125 · 50 · 40 · 25 (a table page, the exception principle 3 allows); the lockup 160 · 40 · 25.

## Frame and grid

1920 × 1080; graphics-safe 96 / 54 px (`standard`). Persistent frame (real information only), mono 25 in `mutedOnMat` at y 54: left the file slug ("Source file: …"), right the page in hand ("Exhibit 2 of 3", "Worksheet, from exhibit 3", "Index of exhibits", "3 exhibits"), the old text leaving upward as the new rises. The claim on the mat at x 96, y 140 (50 px), its terms at y 208 (25 px). Reading position from y 292, x 96–1824: the page plus a 24 px paper mount; a sheet followed by a worksheet is a spread from its first frame (the sheet 1112 wide, the worksheet at x 1240, 584 wide). Stickers 96 px tall, at the sheet's lower right (or left), overlapping only the mount's bottom margin by 12 px, never the page. Paper tooth: a static seeded noise on paper only, never over a page. No grid lines; the worksheet is ruled every 64 px at 7 % ink.

## Scenes

| Type | Purpose | Seconds at 120 (example) |
|---|---|---|
| `exhibit` | a page dealt on or uncovered; veil; the claim struck; leader; sticker; terms. The first is the cold open (the hook within 1 s) | 3.0–3.5 |
| `claim` | the same page: the band, its veil hole and its leader move to the next claim | 2.0–2.5 |
| `worksheet` | a ruled sheet beside its exhibit: its tab, the slip laid down, the title, the rows | 3.5 |
| `result` | the rule, the computed figure struck, the claim's second phrase on the drop, read in a pause (the climax) | 4.0 |
| `ledger` | the index at the close: one row per claim with its tab and source | 3.0 |
| `lockup` | the file slides off; the mark (optional); the name struck; the URL ≥ 3 s; the capture line; the URL underlined on the last downbeat | 4.5 + the phrase rounding |

Slots and limits: `assets/templates/dossier/TEMPLATE.md`.

## Signature transformations

The page changes are pluggable (TEMPLATE.md, Page changes): `changes.js` is a registry, so a new set of transitions plugs in by name without touching the choreography. The template is Canvas2D: page changes mix finished frames or project one sheet's canvas, motion blur needs sub-frames of a pure `render(t)`, and the highlighter is one multiply composite (`derived`, 2026-10-21; the sample film's DOM layout could do neither the frame-level changes nor exact sub-frame blur).

| Move | What happens | Tier | Tag |
|---|---|---|---|
| `deal` | the sheet in the reading position slides off downward (y +900, 0.35 s power2 in); the next is dealt on from below (y +800 → 0, one beat expo out), motion-blurred while fast | T1 | `owner` (sample film, 2026-10-21) |
| `spotlight-band` | the page dims (the mat at 50 %, 0.3 s); the highlighter strikes the claim left to right in one beat (a hand's rate, eased at its ends, chisel ends); on the same page the band, its veil hole and its leader move to the next claim in 0.4 s | T0 | `borrowed` (the shared module's veil and hard edges) / `owner` |
| `tether-link` | a dot lands on the band's end; an ink-cased leader draws in orthogonal legs through the mount's margin to the sticker (0.35 s) | T0 | `borrowed` (module rule) / `derived` (straight legs, an editorial leader) |
| `exhibit-stamp` | the sticker is there at 1.1 × on its key's frame and settles to 1 in 0.12 s; worksheet and index tabs the same | T0 | `owner` |
| `dossier-slip` (`lift-out` → `value-carry`) | the figure's own pixels lift to 1.2 × the sheet's scale and 18 px up (half a beat); in one frame the same cell is set in code on its sampled paper and ink; it rises into the corridor between the claim's terms and the sheets' top edge at ≤ 0.55 of its landed size, crosses, and drops onto the worksheet on the beat; it stays there as a clipping | T2 | `borrowed` (module: swap at 1.2 ×, one frame, its own paper and ink) / `owner` |
| `dossier-page-turn` | in the last beat before the next exhibit, the sheet turns away over its top edge (or, as a variant, its left edge) to 89° with a 2200 px perspective, power2 in, darkening as it tilts; the next page is already whole underneath, so no two contents are ever half-transparent over each other | T2 | `owner` |
| any `lib/transitions` id | a frame-level transition in place of the turn (`enter: '<id>'`), colour roles from the palette | T2 | `borrowed` (library) |
| `dossier-stack` | into the lockup: the index squares onto the file and slides off the mat in one beat | T2 | `owner` |
| strike the name | the band behind the name and the name wipe in together in one beat (the lockup peak); the URL is underlined on the last downbeat | T3 | `owner` |

**Against the nearest references** (principle 10, the mode's fixed grammar, checked once here; 2026-10-20): annotated source documents in newsrooms, and the gallery's launch films over real assets. Shared with annotated documents (2 of 9): the page front-on, the yellow rectangle. Not shared: the dim, the leader to a source sticker, the code-drawn worksheet that computes, the locked camera with paper moving, the dark mat with hard paper edges, serif claims with mono identifiers, the struck name. Against exhibit: the locked camera, one page in the reading position, the leader and the sticker, the dark mat; against handset: no device, and the sources are publications, not the product's own UI.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Words | each line rises out of a mask word by word (0.42 s expo out, 0.12 s apart) and leaves upward faster (0.2 s power3 in, 0.02 s apart) | `borrowed` (plakat) / `owner` |
| Deal / exit | y +800 → 0 in one beat, expo out / y 0 → +900 in 0.35 s, power2 in | `owner` |
| Veil | the mat at 50 % over the page outside the band, in 0.3 s | `borrowed` (spotlight-band) |
| Stroke | one beat, eased only at its ends | `owner` |
| Band move | the stroke, the veil hole and the leader together, 0.4 s, power2 in-out | `owner` |
| Leader | dot 0.12 s, line 0.35 s from 0.05 s | `owner` |
| Sticker and tabs | on the key's frame at 1.1 ×, to 1 in 0.12 s (power3 out) | `owner` / `derived` (2026-10-21: the press starts on the key, so it stands out there) |
| Slip | lift half a beat (power2 out), set in code on the next frame, the flight 1.5 beats (40 / 33 / 27 % for rise, cross, drop) | `borrowed` / `owner` |
| Page turn | one beat, power2 in, 89°, perspective 2200 px, strips of 3 px | `owner` |
| Tail moves | where a landing would hold still over two beats, the scene's focus (the stroke, the slip, the last tab) is pressed again on a beat: 1 → 1.12 → 1 in 0.36 s | `derived` (principle 5) |
| Motion blur | `lib/canvas.js` `subframes` on every frame where a sheet, the turn's far edge or the slip moves over 1 px a frame; shutter half a frame, exact sum, up to 16 sub-frames | `borrowed` (system) |
| Ambient | none | `derived` |
| Easing | no overshoot (paper lands) | `derived` |

## Sound

Bed: the kit's `diagram` preset (felt keys, pad, plucked pulse) in E♭ at the film's tempo, `mix: 'v2'`: energy rising by chapter (one section per exhibit), the drop on the result, the outro under the lockup; no reading drop (one made the return jump +6.9 LU on the sample film). `owner` (2026-10-21: "these three sounds", approved with the sample films). Restrained paper sounds on the picture's own moments:
- the stroke: a narrow band of noise (2.6–4.2 kHz) lasting the stroke; the URL underline a shorter one;
- a sticker: a short falling stamp, a low thud and a 3 dB duck; an index tab a lighter stamp; a tail move the softest touch;
- the page turn: falling air, then a rim flick and a thud on the beat the page is gone;
- a deal or exit: a soft swish; the stack heavier, with a thud;
- the slip: a pop, air, and a light press as it is laid down (also the hook's landing);
- the struck result and the struck name: a soft impact with a duck;
- the leader and the band move: none / a faint high swish.

Master −14 LUFS, true peak ≤ −1.5 dBTP after the renderer's AAC (shipped example, measured on the render: −14.0 LUFS, −2.2 dBTP). The sticker's click is the sharpest transient and the renderer's AAC encode can overshoot it more than the master's estimate, so `score.mjs` holds that estimate at −2.5 dBTP (`aac.ceiling`). Banned: typewriter clatter, camera shutter, ticking clock, a procedural-drama stinger.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here:

- the `yellow` preset on the near-black mat, `highlight: 'band'`;
- the example chain: a cold open on a struck heading → a page turned over its top edge → a second claim on it → a page turned over its left edge as a spread → a claim with no leader → the slip onto a worksheet → the struck result → the index → the lockup;
- a sticker at the lower right of every sheet; leaders through the left margin;
- the worksheet at x 1240 with a 125 px figure under a rule; the "EX. n" tab at its top right;
- the lockup: the name on a band, the URL, the capture line, the URL underlined;
- the example copy: the skill's own pages ("Ten styles in one skill.", "Runs on a shell, Node.js and FFmpeg.", "Mixes ship at −1.9 dBTP.", "Every mix lands 0.4 dB under the gate.", "Every claim, struck where it was printed.").

Banned from every film in this mode (the gallery's tells around real assets and the clichés of the investigative genre):

- a device frame with a soft glow behind it; screenshots on glass cards with white hairlines and soft drop shadows; tilted 3D carousels; a wall of screenshots flying past as the climax; a camera drifting over the pages;
- red string between pinned items; push-pins, paper clips, polaroids; coffee rings, stains, torn or aged edges, sepia or grunge; "CONFIDENTIAL", "TOP SECRET", "CASE CLOSED" or any red rubber stamp; redaction bars as decoration; a typewriter face or key sounds; a magnifying glass; crime-scene tape; a flickering lamp or film grain over the pages; a manila folder with a typed label;
- a band over a chart line or point; any recolouring of a page to match the palette; a fake scan texture; a blurred or sharpened page; a rebuilt or generated table passed off as the source;
- copy shapes: "The receipts.", "Case closed.", "Don't take our word for it", "Exhibit A" (exhibits are numbered).

## Don'ts

- No band, leader or sticker over a page's data marks or text other than the claim (mode principles 1 and 3).
- No highlight on a heading or the product name inside the film body: the accent means a sourced claim; the struck name at the close is the one exception, as the film's conclusion.
- No number without its terms: who measured it, `~` for read-off values, the version, the capture date (principle 2).
- No camera move: once the camera moves, the mode is exhibit (mode principle 2).
- No page text counted as readable; no zoom past the cap to make it readable: capture larger, or lift it as a slip.
- No preset that fails the accent rule on the film's bands; no solid stroke over a claim printed in colour where it falls under 3:1 (run it under the line).

## Checks

- **P0**: `npm run assets` 0 FAIL (hashes, sizes, the zoom cap, private regions, `expect` / `drawn` / `forbid`, every on-screen number printed in a crop, leaders clear of text, no face, the slip's text, ΔE00 ≥ 20 and legibility in every band); `npm run palettes` passes; `npm run fit` reports no errors (API 3 tiers); `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL; every string the viewer must read is code-drawn at ≥ 25 px.
- **P1**: the accent marks only sourced claims and their proof; every exhibit has its sticker with provenance and date; every band its leader or a carry; one page in the reading position (a page and its worksheet in a spread); no camera move; a page change never twice in a row unchanged; no motif from the ban list.
- **P2**: chisel ends on the stroke; stickers square to the sheet; leaders in orthogonal legs, landing on the sticker; the paper tooth invisible as noise; the slip's swap reads as one object.

## Known issues

- **Transitions alike across modes** (`owner`, 2026-10-21: the sample films' moves felt too similar): the page changes are pluggable (TEMPLATE.md, Page changes) so a more varied set can replace the turn; none is swapped yet.
- **The slip's face**: the code copy is Inter Tight scaled to the cell's ink box, not the page's own face; the difference shows only on the swap frame.
- **Small pages in a spread**: a wide page beside a worksheet is shown at about 0.8 × (the changelog in the example), so its text is evidence only; the claim on the mat carries it.
- `magenta`, `coral` and `highlight: 'underline'` have been rendered on the example as stills only; the `magenta` under-the-line rule was judged on the sample film. The shipped example has no `mark` (the lockup's optional logo).
- `npm run assets` reads text and faces with the macOS vision framework; elsewhere those checks are skipped with a warning.
- The sound was approved on the sample film; the template's arrangement (sections from the scenes) was verified by levels, onsets and loudness only.
