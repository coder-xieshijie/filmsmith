# Blueprint (`blueprint`)

One engineering drawing drafted sheet by sheet: 6–9 sheets on one large blueprint, the camera travelling the drafting route between them, every line and letter drawing itself, and stamps landing on the beat. Aesthetic anchor: "like a drawing office's general arrangement, detail and assembly sheets, filmed while being drawn".
Theme: tech-product-launch · Template: `assets/templates/blueprint/` · Length follows content at 92–108 BPM (default 100), scenes in whole beats, 2-bar phrase (timing API 3, the four tiers of change); the shipped placeholder example fits to 48 s (20 bars at 100 BPM; api 2: 52.8 s; batch 1: 86.4 s) · Source film accepted 2026-10-16 (dev-skills launch, blueprint version); this code template rebuilt 2026-10-17, revised 2026-10-18 after the check of the seven modes, and made brisk 2026-10-18 after the owner's review of batch 1 ("the waits between sheets are far too long"); the brisk version is not yet reviewed by the owner. 2026-10-19: the `linework` form variant and the excerpt (a 2–9 sheet cut-down, 9.6 s for the shortest), neither yet seen by the owner. 2026-10-19 (batch 4, after the owner approved the four tiers and the 26 transition samples): timing API 3, the pencil original issued as the print by a person's stamp (`original`, `issue`, the `vellum` preset), two sheet types built on library hand-offs (`interface`, `stages`), the release entered under a parallel rule; not yet seen by the owner. 2026-10-19 (owner's review of the ten demos: "satisfied overall", asked only why it starts white and turns blue; the owner kept the white → blue as the default, reason under Signature transformations): the checklist's probe run (a lamp crossing the inspection record, `blueprint-expose`), a fifth T2 that closes the 19.8 s gap between the flood and the rule; not yet seen by the owner.

## Fits / does not fit

Fits content that can be drawn as a machine: pipelines, systems, architectures, multi-step workflows with inputs, outputs and checks, and any launch where "this is the plan" is the message. Does not fit products whose value is emotional, visual or social, a single claim with no parts (use ink), or numbers about many items (use tally).

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **A workflow tool where a person signs off and machines check** (best fit) | `lintel`, a feature-rollout planner: every flag change is drawn as a plan in pencil, the owner answers the review and signs it, the signature issues the print, the rollout runs in stages, each checked by a canary (workshop demo 2026-10-19, 43.2 s at 100 BPM); `shoring`, a schema-migration planner (workshop excerpt 2026-10-19, 2 sheets, 9.6 s) | full film: `problem` → `arrangement` → `interface` → `detail` (amber stamp, `issue`) → `stages` → `checklist` (inspection stamp) → final `overview` → `release`; excerpt: `arrangement` → `detail` |
| A system launch: what the parts are and how they connect | a self-hosted vector store: ingest → index → query as the general arrangement, the on-disk segment format in section with a checksum inspection stamp, the services snapping into one deployment | `arrangement` → `section` → `loop` → `assembly` → `parts` → `release` |
| A scheduled pipeline and the evidence that it ran | the shipped example: `tidepool`, a backup tool that restores every backup and counts rows (48 s) | the example's eight scenes (TEMPLATE.md) |
| An architecture section of a longer launch, 10–15 s | the drawing cut into a reel or a phosphor film's companion cut: two or three sheets of the same product, ending on its stamp | excerpt: 2–3 sheets |

Best fit: the mode's two meanings of a stamp (amber for a person's decision, line colour for a machine's check) and its route between sheets are both about a process with parts and sign-offs; a product without a person in the loop loses the amber and keeps only the drawing.

## Mode principles

1. **One drawing, one space.** Every sheet lives on the same paper; the camera only travels the drafting route, and the route arrow draws with the camera so the line pulls the viewer to the next sheet. No cuts, no second space. One cut is hidden, never shown: from the whole drawing to the release sheet the camera cuts under a parallel rule crossing the lens (`occluder-pass`), the same drawing at two framings. Frame-level transitions never run between sheets; inside a sheet the only one is the checklist's probe run, a lamp over the same frame. *(Narrows 4, transform at the turns, and 7, one system, one accent, one meaning: the drawing is the persistent frame.)*
2. **Everything is drafted, nothing is placed.** Lines draw on with the pen; lettering first draws its construction lines (baseline, cap line), then traces in left to right. A shape that fades in reads as a slide, not a drawing. A drawn shape may change by drafting rules only: three lines make an outline a solid, a box opens along its edges, a word passes between two rails. *(Narrows 6, texture decides how good a passing film is, and 4, transform at the turns.)*
3. **Each sheet is a different kind of drawing.** Leaders, section, exploded view, timing diagram, inspection record, parts list: the drafting convention carries the meaning, and two consecutive sheets never share a drawing type. *(Narrows 9, the style points at the content, and 3, one idea per beat, one protagonist per frame.)*
4. **Amber is a person's annotation or approval.** The CONFIRMED and APPROVED stamps, revision marks, the bracket on chosen answers, `YOU`. What a machine did (a verification, a hash, a count) gets the inspection stamp in the line colour. Only a person's stamp can issue the print: the pencil original becomes the print where someone signed, never at a machine's check. A machine's check moves like a machine: the probe run's lamp at a steady feed, which reads the record and develops nothing. *(Narrows 7, one system, one accent, one meaning.)*
5. **Stamps land on the beat, pushed in, with a thud, beside what they certify.** The camera pushes in and settles half a beat before the stamp's beat; the stamp drops from 2.1× and the frame gives one short thud (one operation at a time, 2026-10-18); the camera returns in 0.6 of its push. A stamp never covers lettering: it lands beside the key number or answer it certifies. Four stamps a minute at most. *(Narrows 3, one protagonist per frame, and 5, motion is a function of time, locked to the beat.)*
6. **Arrive drawing, draw briskly, leave still.** The first strokes start while the camera decelerates into a sheet; parts land close behind each other (a landing every half beat in the median; builds of 4.5 beats, 7 with a stamp); every sheet ends with exactly two beats (1.1–1.3 s) in which nothing moves, then the camera leaves. No sheet waits for anything but its reading, and no sheet holds longer than two beats. *(Narrows 1, readable before beautiful, and 5, four tiers of change: owner 2026-10-18, "technical videos are light, direct, crisp"; tiers approved 2026-10-19.)*
7. **The frame never lies.** SHEET n / N, the SCALE field (live from the camera), the key plan and every count are computed from the same data the picture uses. *(Narrows 2, precision is a gate.)*

## Palette presets

| id | name | fits | bg · paper · ink · line · muted · accent |
|---|---|---|---|
| `cyanotype` | Cyanotype (source film) | default | `#0A2652` · `#10356C` · `#EAF3FF` · `#9FD3FF` · `#BCD6F3` · `#FFB547` |
| `diazo` | Diazo night | dark platforms, a quieter film | `#050B18` · `#0A1630` · `#E6EDF8` · `#8EB4E8` · `#B0C1DB` · `#FFB547` |
| `blueline` | Blueline print | light pages, documentation, print-like | `#C5CED9` · `#F3F5F1` · `#14306A` · `#2D5CA3` · `#3C5479` · `#A85200` |
| `graphite` | Graphite film | when blue clashes with the brand | `#0F1114` · `#1A1E23` · `#ECEEF1` · `#A9B6C3` · `#BCC4CD` · `#FFB547` |
| `vellum` | Vellum original | the pencil original before an issue (`original`), not a print | `#D7D8D3` · `#F4F3EE` · `#2B2E33` · `#565C64` · `#474C54` · `#A85200` |
| `coral` | Coral red (oxblood ground) | a brand whose colour is a warm red; a blue ground would make a red accent vibrate | `#220A0B` · `#311414` · `#FAF1EE` · `#BACAD4` · `#DCCDC9` · `#FF6452` |

Every text role ≥ 4.5:1 on paper (ink 10.7–15.2, line 6.0–10.1, accent 4.9–10.2); accent ≥ 90° of hue from the line colour. Grid: 40 px fine and 200 px major lines in the line colour at the preset's alpha; the fine grid fades out below 0.82× to avoid moiré. *(Source palette: `borrowed (source)`; other presets: `draft`; `vellum` 2026-10-19: ink 12.3, line 6.1, muted 7.8, accent 4.9 on its paper, `draft`; `coral` 2026-10-19: a brand guide's flat coral `#FF6452` used exactly (ΔE00 0; its gradient is not used, the accent is one flat ink), on a deep oxblood ground in the accent's own hue with cool silver line work 163° of hue away; ink 15.2, line 10.1, muted 11.0, accent 5.8 on its paper, `derived`.)*

## Variants

**Colour and print process**: the six presets above (`cyanotype` default; `diazo`, `blueline`, `vellum`, `coral`, `graphite`).

**Form: `linework`**, the drafting instrument the sheets are drawn with (2026-10-19, not yet seen by the owner). The palette, the HUD, the lettering, the stamps, the choreography, the timing and the sound stay; only how each line of a sheet and of the route is drawn changes. Every line ends where and when it does in `ink`, so `npm run fit` gives the same table and every landing keeps its frame.

| `linework` | What changes | Choose it for | Source |
|---|---|---|---|
| `ink` (default) | The technical pen: each line draws once at its ISO weight, square ends; the issued drawing | Most films; the cleanest read, a finished, released system | The source film (`borrowed (source)`); line types and widths of ISO 128 (`standard`) |
| `pencil` | The pencil original: each line is first blocked in as a light construction line (1.5 px, 0.42 of the line colour) that runs 56 px past each end of every straight segment, so box corners cross; the finished line is then drawn over it in graphite (a seeded grain, mean ≈ 0.8 of the colour, round ends) from 20 % of the line's time to its end. The construction lines stay. Lettering, arrowheads, stamps and the pre-printed frame (HUD) are unchanged | A film about design or planning rather than a release: an RFC, an architecture proposal, a roadmap, "what we are building"; pairs most naturally with `graphite` and `blueline`. Not for a film whose claim is "it is done" | Drafting practice: lay out with light construction lines, then darken the finished lines; construction lines are kept light enough not to be erased (engineering-drawing textbooks, e.g. Giesecke et al., *Technical Drawing*, on lines and layout) (`borrowed`); the two-pass timing, 56 px, 0.42 and the grain `draft` |

Why the instrument and not another axis: it changes every line on every sheet while keeping the mode's principles (mode principle 2, everything is drafted, gains a second, visibly drafted pass). Projection (orthographic, oblique, isometric) changes only the section sheet's two boxes, and an isometric view would shear the lettering on its faces (principle 1); the ISO 128 line group (0.35 / 0.5 / 0.7 mm) is a weight change a viewer barely tells apart at 1080; first- versus third-angle projection is invisible without a multiview part.

**Not a variant: the issue.** `original` with `issue: true` on a `detail` changes the material once, at a person's signature (Signature transformations); it is part of the film's story, not a look, so it is a content field, not the form variant. `linework` is then the print's instrument; the original is always pencil. Why the film starts white and turns blue: the white drawing is the draft, the person's stamp issues it, and the blue print is what the rest is run from; the change of material is the approval (Signature transformations, Original → print). The default since 2026-10-19 (the owner kept it). **To start blue from the first frame**, leave out `original` and the detail's `issue: true` (one without the other is an error): the drawing is the print throughout, the stamp lands amber as before, nothing floods.

Both values pass this card's P0 and the clean-transition checks C1–C8 on the workshop demo (2026-10-19: `check-film` PASS for both, the same keys, holds and flashes; frames render bit-identically twice). In `pencil`, a construction line may run under the edge of a label beside its box (like the lettering guides and the grid); it is 1.5 px at 0.42 and never carries information.

## Accent role

- **Accent (amber)** marks one kind of thing: a person's annotation or approval. On the `vellum` original the same role is a darker amber (`#A85200`), so a signature reads the same before and after the issue. The detail sheet's CONFIRMED stamp and the bracket on the chosen answers, the final overview's APPROVED stamp in the title block's APPROVED BY cell, the reviewer's revision triangles and underline on the problem sheet, the `YOU` ends and their brackets on the assembly. As a mark it stays under 10 % of the frame. The theme's accent rule is aligned by the docs owner.
- **Inspection stamps** (VERIFIED, FROZEN, SEALED, RESTORED: a machine's check) use the line colour, same shape as the amber stamps, so the stamp still lands but does not say "a person decided" (check 2026-10-18 C10, P-10). The section sheet's dimension repeats the stamp word in the line colour.
- No status, category or effect colours: an open item is an amber revision mark because a reviewer raised it, not a warning colour.
- The accent never becomes a ground.
- **Variant: no person decides** (2026-10-20). When the film's subject acts on its own (a model, a service), the accent marks **the product and its results** instead: its name, its column, its path through a sheet, its scores and the stamps that certify them (a rank, a pass). The film then starts in the print (no `original`, no `issue`), uses no line-colour inspection stamps and no APPROVED stamp, since nothing is signed by a person; the title block's APPROVED BY cell is left to the product's id, a film-local change today. `PLAN.md` and the README state the variant. Taken by one film here and one in plakat, both accepted.

## Type

| Role | Family | Licence | Sizes (px at 1080) |
|---|---|---|---|
| Titles, claims, values, stamp words, the count | IBM Plex Sans Condensed 500 / 600 / 700 | SIL OFL 1.1 | 280 (count), 200 (release name, fits to 140; final claim), 140 (one-word title, problem and claim lines, system name, loop read-out), 100 (one-line title, `YOU`), 70 (problem values), 35 (questions, answers, part names, claim line, footer); stamp words 70 / 50, HUD stamp 28–36 |
| Labels, annotations, commands, HUD | IBM Plex Mono 400 / 500 / 600 | SIL OFL 1.1 | 50 (URL), 35 (subs, steps, notes, nodes, chips, parts rows, ids, input / output names, section output, gate), 25 (figure labels, tags, column heads, captions, keys, release tags and status, stamp small lines); HUD 25–30 |

Text that carries information is ≥ 25 px (landscape full-screen on a phone, check 2026-10-18 B7); every fit() floor is 25 and lettering never shrinks below it: the copy is cut instead. Labels uppercase and tracked 0.08–0.16 em, like drafting lettering. The title block keeps only fields a viewer reads (APPROVED BY, the name, SHEET, SCALE); DWG NO., REV and DRAWN BY were removed rather than kept at 12 px.

**Decoration under 25 px** (carries nothing; listed as principle 1 requires): the zone digits 1–8 / A–D on the border (15 px) and the scale-bar figures `0 · 100 · 200 MM` (15 px). Both are drafting furniture; neither says anything about the film.

**Main text under 40 px** (principle 1 target, not met): the series has no step between 35 and 50, and the notes tier is 35: questions and answers, loop steps, the gate, section notes and part names, the checklist note and footer, assembly nodes and claim, parts rows and chips. They sit in fixed drawing geometry (the corners of a loop, chips in a chain, a table row, a chain of five boxes) that does not hold 50 px at the slots' character limits. Release tags and status are labels at 25.

Sizes: the ISO 3098 series `standard`; the per-sheet choice of steps `draft`; the floor `standard`.

## Type scale

ISO 3098's √2 series at 10 px a millimetre: 25 · 35 · 50 · 70 · 100 · 140 · 200 · 280. Three tiers a sheet — title 140 (one-line heads 100, release name 200), notes 35 (the problem's values 70), labels 25 — with stamps, the HUD and the drawn count counted apart but sized from the series; `env.fit()` steps down the series. Per-sheet sizes: template `TEMPLATE.md`, Type scale. Settled 2026-10-18 (check C9, batch 2 comparison `type: 'iso'`): accepted on the recommendation; the owner did not compare it shot by shot. The source film's sizes (3–5 levels a sheet) and the `content.variant.type` switch were removed. *(`standard`, ISO 3098-0; the per-sheet choice of steps is `draft`.)*

## Frame and grid

1920 × 1080. Sheets are 1920 × 1080 cells in a 3-column serpentine with 120 px gutters and margins (the source's 6240 × 3720 world for 9 sheets; 6240 × 2520 for 6). Sheet content between x 150 and 1790. Persistent HUD in screen space, every field ≥ 25 px: border at 24 / 36 px with zone ticks 1–8 / A–D; label panel top left (bubble n / N, `SHEET n · NAME`, product line), width from the longest label; corner note top right (licence); scale bar bottom left; title block bottom right, 156 px tall, its width from the measured strings: an APPROVED BY cell on the left (the final stamp lands in its empty part) and, on the right, the drawing's name over SHEET and SCALE (live from the camera). *(Layout: `borrowed (source)`; title block revision 2026-10-18: `draft`.)*

Deliberate overlaps and clips, and their conditions:
- **Stamps on the drawing.** A sheet's stamp may cross line work (box edges, a section line), never lettering: its place is solved clear of every text box on the sheet and of the HUD at rest (`sheets/common.js` `solveStamp`; P0 below).
- **The approval stamp on the HUD.** Only inside the APPROVED BY cell, never over a field's text (ISO 7200's "approved by" field).
- **The label panel folds** to the bubble while the camera is pushed in, so it never covers a sheet title; its lettering fades out 0.1 s before the fold and returns 0.1 s after it reopens, so no label is cut mid-word (check 2026-10-18 legibility #16). *(Fold: `draft`.)*
- **The claim panel** covers the whole drawing during the final overview; the drawing under it is dimmed and blurred 5 px, so the old sheet titles cannot be read beside the claim (check 2026-10-18 P-22).

`renders/timing.json` mask: `[44, 140, 1832, 740]`, the drawing inside the frame without the label panel, corner note, scale bar and title block.

## Scenes

| type | drawing | purpose | build (beats) | ceiling (api 3) |
|---|---|---|---|---|
| `problem` | callout boxes on a bus, amber revision triangles, amber underline | the problem as open review items | 4.5 | 6 s |
| `arrangement` | general arrangement input → system → output, overall dimension | the claim | 4.5 | 6 s |
| `detail` | leaders from questions to answers, amber bracket, amber CONFIRMED stamp; with `issue`, the stamp floods the drawing into the print | decisions a person settles | 7 (stamp on 5); 8 with `issue` | 3 (3 compositions) |
| `section` | oblique boxes cut by SECTION A-A, detail circle, dimension, inspection stamp | artefacts and the check on them | 7 (stamp on 5) | 3 (3 compositions) |
| `loop` | closed loop with a token, timing diagram stepping per lap | an iterative process | 4.5 | 6 s |
| `checklist` | inspection table checked by the probe run's lamp, computed count, stop rule, inspection stamp beside the count | verification | 7 (probe run from 2, stamp on 5) | 3 (3 compositions) |
| `assembly` | exploded view snapping into a chain, amber ends | the whole flow | 4.5 | 6 s |
| `parts` | parts list with BOM balloons, chain of chips | install / getting started | 4.5 | 6 s |
| `interface` | the product's outline drafted, made a cube by three lines, opened into six panels of its interface, each lettered | the product opened into its real parts | 6.75 (solid on 1.75, opens on 3.25) | 3 (2 compositions) |
| `stages` | one word a beat through a slot between two dimension lines, each a step larger; STAGE k / n computed | a staged sequence (rollout shares, pipeline stages) | n + 1 | 6 s |
| `overview` | pull-out over the drawing; final: route, claim panel, APPROVED stamp in the title block's APPROVED BY cell | orientation (optional), the claim | 2.5 (final 3.5, stamp on 3) | 3 (final: 2 compositions) |
| `release` | title block: dimensioned name, tags, framed URL, key plan; RELEASED lettered in on the last downbeat; after the final overview, entered under the parallel rule | end card | 4 | rest, takes the phrase remainder |

**Excerpt** (`excerpt: true`, 2026-10-19): a cut-down of 2–9 sheets for a reel or a companion cut, without the release card. Its frame is pre-printed (ISO 5457 drawing sheets come with border and title block), so the first frame already shows the drawing and the first sheet starts drawing at once (no half-beat lead); it ends on its last sheet: a stamp sheet stays pushed in on its stamp (the camera does not return) and holds still for the rest, any other sheet holds still for its two beats. Two sheets is the minimum that still shows a route (mode principle 1); the full film's 6 sheets and release card are a layout choice, not a principle, and stay the rule without the flag. The shortest excerpt, a 4.5-beat sheet then a stamp sheet, is 4 bars: 9.6 s at 100 BPM. *(Pre-printed frame: `standard`, ISO 5457; minimum and ending: `derived`.)*

Every type declares its steps (each cue's landing, then the final hold), every gap ≤ 2 beats; at most five words of primary text enter at one cue (eight for the final overview's claim, read in a pause); a composition lasts at most 6 s, so the stamp sheets, the interface and the final overview are split by shots (the push-in, the return, the unfold, the claim panel) and may run to 3 bars (principles 4 and 5, timing API 3, owner-approved 2026-10-19). Bars are not typed: `npm run fit` sizes each scene from its copy and choreography (`timing.rules.js`; reading tiers and the table in TEMPLATE.md "How long a film is"). Slots and limits: TEMPLATE.md. The mid-film `overview` is optional and the example leaves it out: a bar with nothing new drawn, so use it only in a long film that needs a breath (2026-10-18). There are no bar-line turns at api 3: the pad before a turn became a hold over two beats.

## Signature transformations

- **The route pulls the camera.** Between sheets an ink arrow draws across the gutter on the camera's own easing; the arrowhead lands as the camera arrives, and the next sheet's frame and construction lines are already drawing.
- **Exploded → assembled.** The `assembly` parts float apart on dash-dot centre lines, then snap into one chain on a beat; the centre lines retract and the assembly axis fades.
- **Lap → step.** In `loop`, each lap of the token raises the timing trace by one step and changes the milestone read-out.
- **Sheets → system.** The final overview draws one heavy route through every sheet centre (1.5 beats), then the claim panel rises over the blurred drawing and the approval stamp lands in the title block's APPROVED BY cell, which the release sheet keeps.
- **Drawn → issued.** On the downbeat of the film's last bar the release sheet letters in its status, `RELEASED` in a framed field (ISO 7200's document status), so the closing hold ends on a move instead of a dead stop (check 2026-10-18 F6, B4).
- **Original → print** (`issue`, 2026-10-19). The film is drafted in pencil on vellum; one beat after a person's amber stamp lands, the stamp's own outline grows out of where it sits and floods the frame, and inside it is the same drawing as the cyanotype print (`shape-flood`, PLAN X17). The material changes once, at the signature. *(A blueprint is a contact print of a pencil original: Herschel 1842; object constancy across the mask: Heer & Robertson 2007.)*
  **Why white, then blue** (asked by the owner 2026-10-19; kept as the default the same day). A drawing office drafts in pencil on white vellum, and the blue print is made from that original only once someone has signed it; the print is what the work is then run from. The film keeps that order. The white drawing is the draft: the problem, the plan, the console, the review, all still open. The person's amber stamp issues it, and from that beat on the drawing is the blue print, which the stages, the machine's checks and the release are run from. So the change of material is the human approval made visible: principle 4 (transform at the turns: the material changes once, at the story's turn) and principle 7 (one accent, one meaning: amber is a person's decision, so only an amber stamp can issue). A film without a sign-off, or whose subject is already done, has nothing to issue and starts blue. **Switch:** to start blue from the first frame, leave out `original` and the detail's `issue: true`; the stamp still lands, nothing floods, and the film has one T2 fewer (in the example's order `npm run fit` then warns of 17.25 s from the console to the probe run; six sheets, detail straight into the checklist, pass).
- **Record → checked, by the probe run** (`checklist`, 2026-10-19, phase 3). Once the inspection record is drawn and its count stands at 0 / n, a lamp crosses the frame top to bottom at a machine's steady feed (`blueprint-expose`, `develop: false`, 1.5 beats from beat 2); each row's result is drafted the moment the lamp passes it, and the count reads the rows passed. The person's signature floods out of their own stamp; the machine's check is a feed that develops nothing, so the print is still issued once. The second checklist in a film crosses left to right. *(The blueprint machine's lamp at a constant feed: Illinois PSAP; mode principle 4.)*
- **Outline → solid → console** (`interface`). The product's outline is drafted as a hexagon; three lines from its centre and three dashed hidden edges make it an isometric cube with nothing moving (`stroke-reinterpret`, X04); the cube opens along its edges into a cross and its faces slide into the six panels of the product's interface, which are then lettered (`net-unfold`, X05). The cube is the same outline vertex for vertex at both joints. *(Line labelling: Huffman 1971, Clowes 1971; staged transitions: Heer & Robertson 2007.)*
- **Stage through the slot** (`stages`). One word a beat passes between two rails that are dimension lines: it leaves up through the top rail, the rails breathe to the next word's cap height, the next rises in; the number at the side is the slot's measured height (`slot-rails`, X02). *(Common region: Palmer 1992.)*
- **Whole drawing → release, under the rule.** From the final overview a defocused parallel rule crosses the lens; under it the camera cuts to the release sheet already drawing (`occluder-pass`, X25). *(Occlusion and amodal completion: Kanizsa 1979.)*

## Timing

| What | Value | Tag |
|---|---|---|
| Tempo range | 92–108 BPM, default 100 (±8 %): a calm drafting pace that keeps the `blueprint` bed's 16th-note arpeggio unhurried; below 92 the clock ticks drag, above 108 dense sheets pass their two-beat hold because reading does not speed up | derived (default from the source film: `borrowed (source)`) |
| Timing API | 3: the four tiers of change (principles 4 and 5) as errors in `npm run fit` and FAILs in `check-film` | owner-approved 2026-10-19 |
| Reading | `read` copy is primary text, 0.3 s per English word, read in draw order; each line, value, question, answer and stage word enters on its own cue and carries at most five words (the final overview's claim lines eight, read in a pause); notes of ≤ 6 words are glance text (≥ 1 s fully still, in parallel: each repeats what the drawing shows or can be deleted), longer notes are primary; a stamp's word is primary and its small line a note; the loop's aside, the assembly's nodes, the parts chips and the console's regions are notes; free-standing symbols not counted | standard (principle 1, check 2026-10-18 B1; five words: principle 4, 2026-10-19) |
| Build per type | the cue beats in `choreography.js` (N0 = 4.5 beats, 7 on stamp sheets, 8 with `issue`, 6.75 on `interface`, n + 1 on `stages`, 3.5 on the final overview, 4 on the release): N0 is when the last part has landed and the picture has settled (a stamp sheet's return lands on it), so the hold that follows is still and starts where check-film measures the stillness (2026-10-19: a return landing 0.4 beat early and a quarter beat after the last stage word made t4's holds 1–2 frames too long) | order `borrowed (source)`; compressed from 9 / 5 beats 2026-10-18 (owner: waits too long): draft; new types 2026-10-19: draft |
| T0 (micro) | every cue landing (the same table the picture and the sound use), each stage word, each checklist row as the lamp passes it, the push-in settling and returning, the claim panel leaving, the route drawing out; median gap 0.5 beat, longest 3.25 beats (a two-beat hold plus a move) in the example and the demo; limits: median ≤ 2, max ≤ 4 | standard (principle 5, 2026-10-19); measured |
| T1 (compositions) | scene starts plus shots: the push-in on a stamp, the return from it, the interface's unfold, the final overview's claim panel; each ≤ 6 s (a sheet without shots ≤ 2.5 bars at 100 BPM); example: 16 compositions, median 2.1 s, CV 0.6; demo: 14, median 2.55 s, CV 0.45 | standard (principle 5); measured |
| T2 (expressive) | `stroke-reinterpret` (1 beat) and `net-unfold` (2 beats) on the interface, `shape-flood` (1 beat) at the issue, `blueprint-expose` (1.5 beats) for the checklist's probe run, `occluder-pass` (1 beat) into the release: five in the example (48 s, wants 4–6; 0.9–10.2 s apart) and the demo (43.2 s, wants 3–6; 0.9–9.6 s apart); each starts on a beat with its sound. Before the probe run: four, with 19.8 s (example) and 18.6 s (demo) from the flood to the rule | standard (principle 4: one every 8–12 s, no two more than 12 s apart); devices: PLAN §4 (owner approved the samples 2026-10-19); the probe run: draft |
| T3 (peaks) | hook (the first line lettered), claim (the final overview's approval; the climax: 76 % in the example, 83 % in the demo) or, in an excerpt, the last stamp (a reveal), lock-up (the release's name) | standard (principle 5) |
| Holds | exactly two beats after every build (`HOLD_S` 1 s rounded up to the beat: 1.11–1.30 s across the range); a stamp's thud to the return (0.59 s at 100 BPM; to the flood with `issue`); the final overview's claim and an excerpt's closing stamp are pauses (≤ 2 bars); URL ≥ 3 s on the release (a rest) | standard (holds 0.2 s–2 beats, principle 5) / derived (mode principle 6) |
| Ceiling | 6 s a composition (`sceneMaxSec`); the stamp sheets, the interface and the overview, split by shots, may run to 3 bars | standard (principle 5) |
| Grid and turns | scenes in whole beats; no bar-line turns at api 3 (a turn's pad lengthened the sheet before it into a hold over two beats); what the beat grid leaves after a sheet's hold goes to its pan (1–1.75 beats) | derived (principle 5; 2026-10-19) |
| Phrase | total rounded up to 2 bars; the release takes all of it and lands its status on the last downbeat (a share on the claim pause made a five-beat near-still passage: check-film `pace`, 2026-10-19) | borrowed (2-bar phrase) / derived (check 2026-10-18 B4) |
| Key events | each arrival (`land`, on the beat), the stamps (`stamp`), the release status (`land`), the end; holds; the tier arrays `micro`, `shots`, `expressive`, `peaks` (`renders/timing.json`) | derived (check 2026-10-18 E; api 3) |
| Lead and move out | 0.5 beat before the first sheet's first cue; move out at least 1 beat between sheets, 1.5 next to an overview, 1 into a release entered under the rule; the next sheet's frame starts at 45 % of the move and its label and construction lines 0.4 s before arrival, so every sheet is already drawing when the last one has left | derived from the camera grammar below |

## Motion

| What | Value | Tag |
|---|---|---|
| Pan sheet → sheet | 1 beat (0.6 s), up to 1.75 when the beat grid leaves a remainder after the hold; quartic in-out, zoom dip 10 % mid-move | `borrowed (source)` (source 0.7 s, dip 16 %), length snapped to the beat: derived; remainder to the pan: derived (api 3, 2026-10-19) |
| Pull-out / push back from an overview | 1.5 beats, quartic in-out; overview scale = whole drawing × 0.985 | draft |
| Drift while drawing (ambient) | scale 1.0 → 1.012, sine in-out, ending at the hold (≤ 0.5 %/s on average over a 4.5-beat build, ≤ 0.8 %/s at its fastest); the first sheet settles out 1.025 → 1.0 over its build (≤ 1.3 %/s at its fastest) | draft (source drifted to 1.025 and never stopped) |
| Overview drift (ambient) | scale × 1.008 over 4 beats, then still | draft |
| Lamp (ambient) | screen-space light drifting 14 px/s | draft (under principle 5's 15 px/s) |
| Read hold | exactly two beats fully still at the end of every sheet (never longer: copy that needs more is cut); URL ≥ 3 s | standard (≈ 0.3 s/word; holds ≤ 2 beats, principle 5, 2026-10-19) |
| Elastic scenes | cues are fixed beats after arrival, the claim panel and the camera move fixed beats before the end; the release status on the last downbeat; the only stretch is the release (the phrase rounding) | derived |
| First stroke | sheet frame at 45 % of the move, label 0.42 s and construction lines 0.38 s before arrival, title on the arrival beat | derived (fixes 0.2–0.4 s of empty grid) |
| Lettering | wipe 0.45–0.9 s, cubic in-out; construction lines 0.55 s | `borrowed (source)` |
| Push-in on a stamp | scale 1.12 → 1.045, largest that clips no label; in over 1 beat ending half a beat before the stamp, held fully still 1.9 beats (the source's slow 0.6 % creep removed so the hold after the thud is still); with `issue` held 2.9 beats, the flood running in beat 6; back over 0.6 beat, accelerating (ease-in for 70 %, settling in the last 30 %), landing on the build's end (beat 7, 8 with `issue`), where the sheet's hold starts | scales `borrowed (source)` (1.1–1.13); settle-before-stamp: owner 2026-10-18; return 0.6 × entrance: derived (check 2026-10-18 F15); solver and curve: draft |
| Stamp place | the free spot nearest the sheet's preferred anchor, ≥ 10–14 px clear of every lettering and of the HUD at rest; the largest of the sheet's stamp sizes that fits | derived (check 2026-10-18 A3); sizes draft |
| Stamp land | from 2.1×, rotation −9° extra, quintic-in over 0.17 s ending on the beat; squash 1.035 over 0.14 s; thud 3 px, decay e^(−18 t), 0.25 s | owner 2026-10-18 (was 7 px / 0.45 s, which made the landed stamp jump 2–3 frames) |
| Stamp wear | seeded ink wear; the small line keeps ≥ 60 % ink so no letter breaks | draft |
| Claim panel | in 0.3 s at beat 1.25, as the 1.5-beat route finishes; out 0.18 s (0.6 × in), ease-in, half a beat before the camera leaves (was one beat); the drawing under it blurred 5 px while it is up | derived (F15) / draft (5 px, check 2026-10-18 P-22; timing 2026-10-18) |
| Label panel fold | lettering out 0.1 s, fold 0.2 s around the push-in's start; unfold 0.2 s after the camera returns, lettering in 0.1 s | draft |
| Release status | construction lines, frame and wipe in 0.5 s from the last downbeat | derived (check 2026-10-18 F6) |
| Assembly snap | critically damped spring ω 15, 40 ms stagger | borrowed (critically damped spring) |
| Token laps | sine in-out per lap, one lap per milestone, from beat 1.6, the last ending on beat 4.0; the trace runs out over ≤ 0.5 beat and the token fades over 0.4 beat, both done by beat 4.5 | draft (end by N0: check 2026-10-18 holds settle) |
| Motion blur | `lib/canvas.js` `subframes` with the camera's speed: on above 4 px a frame, sub-frames at most 2 px apart (4–24; the shutter shortens past that), a 180° shutter, summed exactly in a fixed order, so a frame renders bit-identically every time and a fast pan streaks without ghost copies; hand-offs inside a sheet add no blur of their own | borrowed (180° shutter); speed gate and spacing: library 2026-10-19; integer sum: derived (check 2026-10-18 A5) |
| The issue's flood | one beat, starting one beat after the stamp; out of the stamp's outline (a rectangle of its aspect, corner 0.12, from its half-height), exponential growth covering the frame at 92 %; the camera holds the push-in until it has closed | library `shape-flood` defaults (exponential, edge blur ≤ 14 px): draft; timing: derived (one operation at a time, land then hold) |
| Outline drafted | the hexagon (r 106 px) draws in 0.75 beat, cubic in-out, from beat 0.75 | draft |
| Outline → solid | `stroke-reinterpret` over 1 beat from beat 1.75: three seen edges, then three dashed hidden ones, expo out; ink, 3 px | library defaults: draft |
| Solid → console | `net-unfold` over 2 beats from beat 3.25 (unfold, then arrange); isometric cube, edge r·√1.5 = 130 px; panels radius 16; region labels every 0.2 beat after it lands | library defaults: draft; isometric match: derived |
| Stage through the slot | `slot-rails`, one word a beat from beat 1; the slot drafts itself in half a beat before; words 50–200 px up the ISO series; ticks every 30 px | library defaults: draft |
| Probe run | `blueprint-expose` over 1.5 beats from the checklist's beat 2 (table drawn by 1.9, count at 0 / n from 1.4): `direction: 'down'` (a second checklist in the film `'right'`), `lamp: 'glow'` in `ink` (`line` on light presets), `develop: false`, A = B = the frame at t; rows ticked at the lamp's pass (`choreography.js` `lampPass`, the shader's feed inverted), 0.08 s for six rows; the lamp has left the frame half a beat before the push-in starts | library feed (55 % linear + 45 % cubic): draft; placement and 1.5 beats: derived (one operation at a time) |
| Rule into the release | `occluder-pass` over 1 beat ending on the release's arrival: tilt 10°, width 460 px, defocus 9 px; the camera holds the whole drawing, then cuts under the rule | library defaults: draft |
| Texture | seeded paper tile (screen / multiply, 0.13–0.18), grain 0.035–0.05 overlay, lamp, vignette | look `borrowed (source)`, regenerated in code: draft |

## Sound

Bed: the kit's `blueprint` preset (100 BPM, E minor, soft square arpeggio with ping-pong echo, tick-tock clock, airy pad, soft kick on 1 and 3). Sections follow the scene types: problem `intro`, arrangement `build`, interface `build`, detail `build` (the film's heaviest reading builds instead of dropping), section / loop / stages / checklist `drop`, mid overview `break`, assembly `build`, parts `break` (reading the install steps), final overview `drop` (the claim), release `outro` (resolving chord, 2 s fade). Energy rises sheet by sheet and peaks on the claim; a sheet under the groove whose primary text takes 60 % or more of its length is a reading drop (the arpeggio rests; clock, kick, pad and sub stay). Events on the picture's cue times: lettering a pencil-tap rim (−22 dB), boxes and the release status a rim + low thud (−20 / −22), laps a high tick (−18), annotations a pop (−23), the assembly snap a log-drum + rim (−16), camera pans a downward paper-slide whoosh (−27), pull-outs a rising whoosh (−23), the final route a swell and a rolled chime, each stamp a stamp hit (−9) + sub impact (−19) with a −4 dB duck; the issue's flood a rising whoosh over its beat (−20) and a two-note chime as it closes (−26); the outline made solid three high ticks (−19); the unfold a soft falling whoosh (−25) and a rim knock as each panel lands (−24); each stage word a tick and a low thud as it lands (−18 / −23); the rule a low, close whoosh (−19); the probe run a rising feed whoosh (−24) over a low E–B hum (−27) while the lamp crosses, and a quiet high tick per row as it is passed (−21); every camera arrival and turn key a crisp drafting tick, plus a soft set-down thud where nothing but a pencil tap sounds with it; an arrival straight out of a `drop` dips the music 5 dB for two frames and lifts its tick and thud 3 dB, since the full groove otherwise masks it (batch 3: 1.5–1.9 dB onsets at the loop → checklist and checklist → assembly arrivals, 5–7 dB with the dip). Master −14 LUFS, true peak ≤ −1.5 dBTP. Tone: `content.sound.tone` defaults to `'v1'` here (the square arpeggio is bright enough without the `'v2'` balance): settled by theory; the owner did not object (2026-10-18). *(Bed and levels: draft; stamp-under-music balance: `borrowed (source)`.)*

## Factory defaults

What the template produces untouched. A film's `PLAN.md` ban list starts here.

- The `cyanotype` preset: Prussian-blue paper, white ink, pale-blue line work, one amber accent (the source film's); `ink` line work; the example drafts in pencil on `vellum` until its detail stamp issues the print.
- One drawing of 6–9 sheets in a 3-column serpentine; the camera pans along drawn route arrows; a final pull-out overview (the mid pull-out is optional and the example leaves it out).
- The example's sheet order: problem → arrangement → interface → detail (issue) → section → checklist → final overview → release.
- The five T2 devices in their places: the interface's outline → cube → console, the flood out of the detail's stamp, the checklist's probe run, the rule into the release.
- The HUD: zone-ticked border, sheet bubble and label panel top left, licence note top right, scale bar bottom left, title block bottom right.
- An outlined two-digit sheet number top right of every sheet; figure labels "Fig. n — …" and "Detail 0n — …".
- Construction lines before every heading; Plex Sans Condensed headings over Plex Mono labels.
- Four stamps, each with a push-in and a thud: CONFIRMED (amber), two line-colour inspection stamps, APPROVED in the title block.
- The release card, entered under the parallel rule: dimensioned name, a row of tags, a framed URL, a key plan, RELEASED on the last downbeat.
- The `blueprint` bed: E minor, 100 bpm, arpeggio and tick-tock clock.
- The example copy: "tidepool", an invented backup tool, and its sentence shapes ("Backups run nightly. / Nobody restores them.", "Proven by restore, / not by hope."); and the source film's lines it replaced, which three films in a row copied: "Requirement in. / Verified PR out." and "Who proves it works?" (check 2026-10-18 F3).

## Don'ts

- Don't colour what a machine did amber: a verification, a hash, a count takes the line-colour inspection stamp (Accent role, principle 7).
- Don't let a stamp cover lettering or a HUD field: it lands beside the number or answer it certifies, and the approval stamp only in the APPROVED BY cell (P0; check 2026-10-18 A3).
- Don't stack the push-in, the stamp and the thud on one beat, or stamp more than four times a minute (mode principle 5).
- Don't place or fade in a shape: everything draws itself (mode principle 2).
- Don't use the same drawing type on two consecutive sheets (mode principle 3).
- Don't type a count, a sheet number or the scale: they are computed (mode principle 7).
- Don't shrink lettering below 25 px to make it fit, or bring back title-block fields nobody reads; cut the copy or split the sheet (principle 1).
- Don't cut to another space or add a second drawing (mode principle 1); don't run a frame-level transition between two sheets (the only hidden cut is the rule into the release).
- Don't issue the print at a machine's stamp, or twice: the material changes once, at a person's signature (mode principle 4). The probe run's lamp develops nothing; don't turn its development on.
- Don't fill the console's panels with invented numbers or charts: they carry the regions' names and drafting furniture only.
- Don't reuse the example copy, its sentence shapes or the source film's lines (principle 10).

## Checks

**P0 (fails the film)**
- `npm run fit` reports no errors (timing API 3: no state over five primary words, no hold over two beats, no composition over 6 s, the T0–T3 tiers; the issue's and the release's fields).
- Any content error (red banner): slot over its limit, text over its measured slot at the minimum size, a fit() error, a stamp that covers lettering or the HUD, an approval stamp that does not fit its APPROVED BY cell, lettering under the HUD at rest, a sheet count outside 6–9 (2–9 in an excerpt), an unknown `linework`.
- A label clipped by the frame or hidden by the HUD at any push-in; a sheet title under the label panel; a label cut mid-word by the folding panel.
- A count that disagrees with its table, SHEET n / N or the key plan that disagrees with the layout.
- Amber on anything a person did not decide or approve.
- Text that carries information under 25 px (the zone digits and scale-bar figures are the only decoration).
- Two renders of the same frame that differ.
- URL readable < 3 s; loudness outside −14 ± 1 LUFS or true peak > −1.5 dBTP.

**P1 (rhythm)**
- A sheet shows empty grid for more than one frame after the camera stops.
- A sheet without two beats of complete stillness before the camera leaves; a sheet still for more than two beats outside a pause (check-film `scene stills`, a FAIL at api 3); more than 7 near-still beats in a row outside the release, or near-still beats over half the film (check-film `pace`).
- check-film's tier rows: `T0 changes (declared)`, `T1 compositions`, `T2 expressive`, `T3 peaks`, `hold lengths` (FAIL at api 3).
- A T2 device without its sound on its beat; the flood not starting from the stamp; the cube not matching the outline at either joint (a jump at beat 1.75 or 3.25); a checklist row ticked before the probe run's lamp has reached it, or a count ahead of the rows passed.
- A stamp, assembly snap or arrival off the beat by more than one frame; a stamp without its sound; the release status off the last downbeat.
- An exit slower than its entrance (the push-in's return, the claim panel).
- Two consecutive sheets with the same drawing type.
- More than three type levels in a sheet's content area (title, notes, labels from the ISO series; stamps, the HUD and the drawn count are counted apart).

**P2 (polish)**
- Fast camera moves without motion blur; ghosted (stepped) blur on pull-outs.
- Stamp wear that breaks a letter; paper texture reading as stripes.
- Route arrows that do not meet the sheet edges; construction lines that stop short of the lettering.

## Known issues

- **Brisk pacing not yet seen by the owner** (2026-10-18): builds compressed from 9 / 5 beats to 7 / 4.5, the two-beat hold, the beat grid, the 1.5-beat route and the earlier claim-panel exit, the example without its mid pull-out. The example went from 86.4 s to 52.8 s; the longest still per sheet from 3.1–4.9 s to 1.2–2.1 s; near-still beats from 47 % to 33 % of the film. Whether the parts now draw too close behind each other (the detail's answers land 0.6 beat apart) is for the owner to judge.
- **Copy is terse.** At api 3 every line, value, question and answer is one state of at most five words, and a sheet's reading must end within two beats of its last landing: detail questions are two words ("Restore where?"), values one word, subs six. The api 2 example's `loop` (four two-word steps and a five-word gate) and `assembly` (a six-word claim) no longer pass unchanged and were left out of the example. The source film's dev-skills copy fails by a wide margin (its detail sheet alone has about 30 words); a product with more to say needs more sheets, not denser ones.
- **Pushes overlap the last strokes.** On stamp sheets the push-in starts on beat 3.5, while the summary (detail), the dimension (section) and the footer (checklist) are still lettering; nothing is cut, but the push and the last stroke run together.
- **Main text under 40 px**: the notes tier is 35 px (Type). The series has no step between 35 and 50, and 50 does not fit the loop, chain and table geometry at the slots' limits.
- **Stamps moved off the result.** The checklist's inspection stamp sits beside the count, not across it, and the section's stamp lands in the free part of the first artefact; the "stamped on the conclusion" moment is weaker. Not yet seen by the owner.
- **The title block grew** (156 px tall, about 580 px wide with the example) and covers more of each sheet's bottom right; the arrangement's dimension line was raised to clear it. Lettering under it at rest is an error, so long footers on the right are caught.
- **Draft values** (first to revisit): the compressed cue beats and the two-beat hold, the three non-source presets, the label panel fold and its lettering fade, the read/notes split by role (stamp small lines, the loop's aside, assembly nodes and parts chips as notes), the overview pull-out of 1.5 beats and its 0.8 % drift, the 1.012 sheet drift and the 1.025 opening settle, the push-in solver and its accelerating return curve, the stamp place solver and stamp sizes, the token laps, the regenerated paper texture, the bed and its levels (the pre-arrival dip after a drop), the title block layout, the 5 px blur under the claim panel, the release status move.
- **The full-sheet grid and "drawing directly on blue" are screen language, not drafting practice** (real grids are zone marks on the border; real blueprints are contact copies of a pencil original). Kept because the owner accepted the look; revisit if a film needs a stricter drafting read.
- **The approval stamp is theatre**: ISO 7200 has an "approved by" field and a "Released" status, not a stamp. The stamp now lands in that field, and the status is lettered on the release sheet.
- **Sound is synthesised.** The source used a generated ambient track; the `blueprint` bed was checked by levels and onset measurements only, not by ear. Pencil taps sit 1–2 dB above the bed and are subtle by design.
- **New behaviour not yet seen by the owner**: the label panel folding during push-ins, the ink (not amber) final route, the timing diagram, exploded assembly, BOM balloons, the still holds (the source never held still), the line-colour inspection stamps, the stamp solver, the APPROVED BY title block, the 25 px HUD, the blurred claim backdrop, the RELEASED move, the tidepool example, the ISO type scale and the brisk pacing.
- The paper texture is regenerated from a seed; it is close in feel to the source's `paper-noise.png` but not identical.
- **`pencil` line work and the excerpt are not yet seen by the owner** (2026-10-19). In `pencil` the drawing reads slightly stiller to `check-film` (near-still beats 44 % of the demo against 31 % in `ink`, limit 50 %), because a lighter, grained line changes fewer pixels per frame; its pixel estimates also count the construction lines near the outlined sheet number as a 22 px low-contrast "line" (INFO; the number is decoration).
- **An excerpt that opened on a turn** got a `turn` key at 0 s that `check-film` could not measure (two WARNs on the 2026-10-19 excerpt). Gone at api 3, which has no bar-line turns.
- **Batch 4 behaviour not yet seen by the owner** (2026-10-19): timing API 3 on this mode (a landing every half beat in the median, holds capped at two beats, compositions split by the push-in and its return), the pencil original issued by the stamp's flood, the `vellum` preset, the `interface` and `stages` sheets, the rule into the release, the variable pan (1–1.75 beats), the library motion blur. The owner approved the tiers and the 26 transition samples, not these uses of them.
- **T2 spacing** (fixed 2026-10-19, phase 3). Four devices left 19.8 s from the flood to the rule in the example (18.6 s in the demo; `npm run fit` warns past 12 s). The checklist's probe run is the fifth: 10.2 / 9.6 s (example) and 9.6 / 9.0 s (demo) either side of it. `blueprint-expose` was kept off the issue because a lamp would make the signature a machine's act; on the inspection it is a machine's act. Two devices still sit 0.9 s apart on the interface. A film without a checklist after the issue keeps the gap (a warning); one that starts in the print loses the flood (Signature transformations).
- **The probe run is not yet seen by the owner** (2026-10-19). The lamp crosses the whole frame, the HUD included (a scanner bed is the whole sheet); the six rows (225 px) pass in about 0.08 s, so the record reads as checked in one pass and the count jumps from 0 to 6 within three frames, not row by row; the lamp's feed is the library's and cannot slow down over the table. Without WebGL there is no lamp and the rows tick at the same times.
- **Hand-offs ignore the line work.** The interface's outline and cube and the stage slot draw one clean stroke in `pencil` too, and in the pencil original before an issue. Their own motion blur is off (the film's camera blur covers the frame).
- **The cube's faces tint at the first frame of the unfold** (net-unfold fills the faces, shaded toward the line colour at 35 %; the reinterpreted cube before it is open line work with dashed hidden edges): a one-frame change of three dashed lines and a light tint, read as the box starting to open.
- **The rule hides the zoom into the release** instead of showing it (the pull-out into the overview stays a camera move). If the owner prefers the push, `enter: 'push'` restores it and the film loses one T2.
- **`pencil` on the example changes only the print**: the original is pencil anyway, so the variant differs in 4 of the selftest's 8 sampled frames (those after the issue).
- **WebGL is required for the flood and the rule**; without it they cut at their midpoint (a console warning).
- **The vellum preset and its grid are draft**: real drafting film has no grid; it keeps the mode's grid at a lower alpha so the original and the print share their geometry.
