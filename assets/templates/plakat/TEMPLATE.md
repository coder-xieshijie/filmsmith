# plakat template

A series of International Typographic Style posters in motion: warm paper, ink, one accent, a visible 12-column grid, a persistent header and footer with a bar-by-bar progress strip. Every page is a registered scene type; the copy, counts, order and palette come from `content.js`, and the length of every page and of the film follows from that copy (`timing.rules.js`). Mode card: `references/modes/plakat.md`.

## Files

| File | What it is | Edit? |
|---|---|---|
| `PLAN.md` | concept sentence, through-line, banned factory defaults, nearest reference (written by `new-film.mjs`; `npm run fit` refuses to run without it) | yes, first |
| `content.js` | palette, chrome, sound, `scenes`; optional `bpm`, `target`, `form`, `opening` | yes |
| `palettes.js` | four presets (names, sources and contrast in its header); pick one by id | no |
| `timing.rules.js` | `lib/timing.js` **api 3**: per type its `need` (reading through the shared reader), `steps` (every still window), turns; the events of the four tiers (`micro`, `shots`, `expressive`, `peaks`), keys, holds, hand-offs and the content mask for `renders/timing.json` | no (a new type adds a rule) |
| `scenes.js` | the scene registry: per type its counts, character limits, timing plan (landings, reading schedule, motion table, hold move; shared by picture, sound and `fit()`) and DOM build; `planScene()` applies a scene's links and fills its long still windows with hold moves; `planFilm()` lays the fitted scenes out | no (add a type here) |
| `devices.js` | how a scene is entered and how it ends: which library device (plakat-columns, counter-portal, step-wipe, aperture-swap, slot-rails), its window in beats, and the exact clip geometry of the two frame-level ones | no |
| `index.html` | grid, chrome, paper texture, text fitting, the one paused GSAP timeline built from `scenes.js`, the per-frame device clips and each scene's hand-off canvas; fonts from `assets/fonts/fonts.css`, verified by `lib/text.js` `fontsReady` | no (`npm run fit` stamps its `data-duration`) |
| `score.mjs` | `swiss` bed with sections from the scene list + one effect per landing and one per device; `--stem fx\|bed` writes unmastered stems for level checks | no |
| `validate.mjs` | the fitted table, limits, counts, each scene's device and its longest still window in beats | run it |

## Commands

```bash
node scripts/new-film.mjs plakat <film-dir> [--palette orange]
cd <film-dir>
# fill PLAN.md first: concept, banned defaults (the example copy and its sentence shapes are among them)
npm run fit                                        # timing table and the tier line; stamps index.html, writes renders/timing.json
npm run validate                                   # the same table plus limits, devices and still windows; fix every ERROR
npm run snapshot -- --at 3,9,16,24 --no-end        # key frames first (times from the table)
npm run film                                       # fit → audio → check → render (renders/film.mp4)
```

`npm run fit` must report no errors: a state with more than five primary words entering together (eight for a claim), a still window over 2 beats that no hold move can fill, a composition over 6 s, a T0 gap over 4 beats, a T2 count off the film's length, a T3 count off 2–3, a key event off the beat. It warns once that `plakat-accent-wipe` is not a library id (the problem's wipe is the mode's own device, see Transitions). `npm run check` must report 0 errors: text that still overflows after fitting, a font that did not load, a `fit()` error, or a stale `data-duration`.

## The example copy is a placeholder

`content.js` ships a launch film for **gatewright**, a fictional staged-rollout tool, so that every slot is filled and the template renders. Its copy shows the slots, not the voice: write your own sentences from your product, and do not reuse its sentence shapes (the problem's two short lines, the claim's two-line halves, the tagline's comma line, the three words on three grounds). The previous example's "Who … ?" hook and "X in. / Y out." claim travelled into every film made from it; `PLAN.md` lists the example copy among the factory defaults to drop.

## Timing: length follows content

Nobody types a duration or a page's bars. `npm run fit` runs `lib/timing.js` `fit(content, rules)` with `timing.rules.js` (**api 3**, the four tiers of change, principles 4 and 5, owner-approved 2026-10-19), prints the table and one line of tier measures, stamps the duration onto `index.html` and writes `renders/timing.json`; `index.html`, `score.mjs` and `validate.mjs` call the same `fit()` through `scenes.js` `planFilm()`.

- **Grid.** A bar is 4 beats; at 120 BPM a beat is 0.5 s. Every scene is a whole number of beats (`unit` 0.25 bar). `claim` and `tagline` are turns: they start on a bar line, and the beats the scene before them waits are reported as their `pad`. Inside a scene, times are written in u = 2 beats (1 s at 120 BPM). The film ends on a bar line (`phrase` 1); the rounding goes one beat per scene from the back, the rest to the closing scene.
- **Tempo.** 120 BPM by default, 112–128 allowed (`content.bpm`).
- **A scene's length** is `need = max(primary reading done, glance done, held text done, last landing settled + 1 beat) + exit`, rounded up to the next beat. Every string a type shows is listed in its plan's `reads` with the u it lands at and its tier, and goes through the shared reader: **primary** text 0.3 s a word, one string after another, never before it is legible (0.25 s after its landing starts; 0.1 s for a word opened by the aperture, which opens from the word's middle; 0.2 s in the slot); **glance** text (≤ 6 words, repeated elsewhere or safe to delete: `scenes.js` says why per type) ≥ 1 s fully still, in parallel. The closing URL holds ≥ 3 s once legible.
- **Text per state (T0, api 3).** Primary text entering at one moment is at most five words; a claim, marked `claim: true` in `reads`, at most eight, read in a pause hold. Every multi-part slot enters part by part: problem lines and rows, the claim's halves, matrix rows (one per half beat), figure lines, a run of words (one state on the anchor at a time), the slot (one word through it at a time). The tagline's lines and the figure (the number and its line) are this mode's two claims; a film with more than two pause holds warns.
- **Holds (api 3).** Each type's plan carries a motion table (every move: when it starts, how long it visibly moves; an out-eased tween counts for 65 % of its length). The gaps in it are the still windows, and each is at most 2 beats (`holdMaxBeats`), or 2 bars where a claim is read (`pause`). A window that grows past that — from the grid, a turn's pad, the phrase share, or a longer reading time — is filled with the type's **hold move**, on a beat, 0.3–0.8 u into the window (`scenes.js` `planScene`): an ink frame (3 px) steps over the page's items in reading order (problem rows, options summary items, document rail steps, matrix rows, verify rows, flow nodes, the slot, the bars), the claim's arrow pushes a gutter (at most three out, then back to one), the install cursor blinks on every beat, the last word of a run stays on its anchor while its ground inverts (a cut), the chapter numeral steps 6 px on every beat. The hold move is not new text and never crosses the text being read.
- **Compositions (T1).** Every scene start is a composition; `problem` (the headline shrinks into the table heading) and `claim` (the half collapses into a band; at the end of a film, the name takes the output side on the last downbeat) declare a second one as a `shot`. Each composition is at most 6 s (`sceneMaxSec`) at the fitted tempo; the median is 2–3 s, the CV of their lengths ≥ 0.3, two in the first 5 s. `problem` and `claim` may run to 4 bars because each holds two compositions.
- **T2 (expressive).** One every 8–12 s, from the scene entrances (Transitions below), declared in `events().expressive` with the device's id and a `variant`; each ≤ 2 beats.
- **T3 (peaks).** The first scene is the hook and the last the lock-up by default; a scene sets `peak: 'hook' | 'claim' | 'reveal' | 'lockup'` and one of them `climax: true` (at 60–85 % of the film). The example marks the run of words after the figure.
- **Exits straddle the cut.** Every exit is faster than the entrance it answers (≤ 2/3: 0.2–0.25 s against 0.5–0.7 s rises) and starts about 0.125 s before the scene ends, overlapping the next scene's first rise by about a quarter beat (`scenes.js` `EXIT`, `EXIT_LEAD`). Masked type sinks upward through its mask (chapter, claim, tagline); a page without its own exit is cleared bottom-up by a 0.25 s clip (`leave()`). A scene covered by the next scene's device (the columns, the portal, the aperture) has no exit of its own: it stays at rest until the device has passed. The film's last scene has no exit (2026-10-19).
- **Elastic scenes.** Entrances count from the scene start, exits from its end; a longer scene lands at the same moments and carries more hold moves, never a longer still.
- **`bars` by hand** (any scene) lengthens a scene for rhythm between its need and its ceiling; the hold moves fill the extra.
- **`content.target`** (seconds): with no `bpm`, the tempo moves inside 112–128 to the length closest to the target; what the range cannot reach is reported, never padded.
- **Key events** (`renders/timing.json`): `turn` at the claim and tagline starts; `claim` on the claim's first frame; `stamp` where the document's stamps land; `end` on the closing underline's landing; `drop: true` where the music drops. Holds are every still window ≥ 0.2 s; hand-offs are problem → claim, figure → (portal), and the step-wipe's landing; the content mask is `[0, 120, 1920, 840]`.

| Type | in (beats) | out (beats) | primary (`reads`), one state at a time | glance | T0 inside it | hold move | max |
|---|---|---|---|---|---|---|---|
| `problem` | 1.5 | 0.9 (wipe) | each `lines` entry, each row's `label` + `value` | — | lines, rows, one ink flag per row | frame over the rows | 4 bars (2 shots) |
| `claim` | 1.1 | 0.3 | `input.lines`, `output.lines`, `name`, `desc` | the two side labels | halves, arrow, underline, name, line, collapse | arrow push | 4 bars (2 shots) |
| `chapter` | 0.7 | 0.25 | `title` | `label`, `caption` | numeral, kicker, title, rule, caption | numeral steps 6 px a beat | 6 s |
| `options` | 0.5 | 0.25 | page `title`, each `q`, `confirm` | caption, heads, options, notes, summary | each question, pick, summary, confirm, tick | frame over the summary items | 6 s |
| `document` | 0.5 | 0.25 | page `title`, doc titles, each rail step | caption, labels, lines, groups, note, stamp, hashes | cells, scan, added cells, fill, freeze, rail | frame over the rail steps | 6 s |
| `matrix` | 0.5 | 0.25 | page `title`, each row, `side.big`, each strip line | caption, corner, heads, done, side label and caption, notes | each row, each cell (half beats), strip | frame over the rows | 6 s |
| `verify` | 0.5 | 0.25 | page `title`, box titles, n/N, `band.a`, `band.b` | caption, labels, link, note, heads, refs, counter label and caption, `blind` | each pass (half beats), flash, band | frame over the rows | 6 s |
| `flow` | 0.5 | 0.25 | `title`, the human nodes, `statement` | other nodes, notes, bracket, loop, list | each node, bracket, loop, statement | frame over the nodes | 6 s |
| `install` | 0.5 | 0.25 | `title`, each command once typed, each step's `cmd` | panel, note, step notes | typing, rules, steps | cursor blink every beat | 6 s |
| `slot` | 0.7 | 0.25 | each word (≤ 3 words) | `label`, `note` | one word through the slot each (slot-rails) | frame over label and slot | 6 s |
| `bars` | 1 | 0.25 | page `title`, each value | caption, item labels, limit label, note | step-wipe, each value (half beats), the limit rule | frame over the columns | 6 s |
| `figure` | 0.5 | 0.25 (or the portal) | the number, each line part (a claim) | `label`, `note` | number, label, line parts | — (a pause: the claim is read) | 6 s |
| `words` | 0.2 | 0.25 | each state (≤ 3 words) | — | one aperture per state | the last word's ground inverts | 6 s |
| `tagline` | 0.5 | 0.25 | `lines` (a claim) | `label` | lines, bar, label | — (a pause) | 6 s |
| `end` | 0.5 | 0 | `name`, `url` (≥ 3 s) | `items`, `foot` | rules, items, square, URL, rule, foot | URL underline on the last downbeat | rest |

Values are measured from `scenes.js` `plan()` (`derived`); the reading rate and the glance minimum are `standard`; the tier limits are lib/timing.js `DEFAULTS` (principles 4 and 5, `draft` values approved 2026-10-19). Before 2026-10-19 the template ran on api 2 (≤ 12 primary words a page, a page ≤ 4 bars, a still ≤ 1 bar between landings and ≤ 1.5 after the last, no stretch without motion over 1.25 bars); those limits are gone.

## Transitions (2026-10-19)

The mode's devices come from the shared library (references/transitions.md, "Which transition for which mode"; PLAN batch 4 §4): X02 slot-rails, X18 aperture-swap, X23 counter-portal, X24 step-wipe, and plakat-columns with its new `angle` and `twoPhase`. No device brings a colour of its own: the shutter is ink, the portal is the accent only when the scene behind it is the person's (the accent keeps its one meaning).

| Device | Tier | Where | How the template triggers it | Variant / params |
|---|---|---|---|---|
| plakat-columns (`lib/transitions/plakat.js`) | T2 | into a chapter card (any scene with `enter`) | the first three chapter cards with no `enter` take the columns in turn: `'columns'` upright, `'columns-lean'` leaning on the grid diagonal (−19.2°, the `diagonal` form's slope), `'columns-two'` two-phase (cover, hold, reveal); later cards turn the page. Any scene but a claim may set `enter: 'columns' \| 'columns-lean' \| 'columns-two'`; `enter: 'turn'` or `'cut'` refuses it | 2 beats, half before the cut; `block` 200, `rise` 0 |
| counter-portal (`lib/handoffs/counter-portal.js`) | T2 | `figure` → a scene that opens on the accent (a `claim`, or `words` whose first state stands on the accent) | automatic: the accent waits inside the counter of the figure's 0 from its first frame; the camera pushes through it in the last 1.5 beats of the figure | parallax 0.55; `portal` = accent |
| step-wipe (`lib/handoffs/step-wipe.js`) | T2 | into every `bars` scene | automatic: the staircase front's steps are the chart's own values; landed, it is the chart | 1 beat; bars ink, the limit rule accent |
| aperture-swap (`lib/transitions/aperture-swap.js`) | T0 | each state of `words` | automatic: the word holds its anchor; the next ground opens as a band, closing bars or a circle (`shape` per state, else they rotate) | 0.44 beat, cubic out |
| slot-rails (`lib/handoffs/slot-rails.js`) | T0 | each word of `slot` | automatic: the rails are two grid baselines (y 450 and 670 around the 225 px word); the word marked `human` is set in the accent | 1 beat |
| plakat-accent-wipe (this template) | T2 | `problem` → next scene | the problem's full accent wipe (0.45 u, expo in-out), kept since the source film because it grows into the claim's input half | declared with a template id: `fit` warns that it is not a library id |

**Template-local geometry, and why.** The two frame-level entries (plakat-columns, aperture-swap) are WebGL functions of two rendered frames. A plakat page is DOM, which cannot be handed to WebGL as a texture without rasterising every page every frame. So `devices.js` reads each module's own entry (its stagger, sweep, easing, slant, two-phase split and radius, through the module's `uniforms()`) and draws the same shapes as CSS clip paths on the two pages and an ink layer: the same picture from the same numbers. The one difference: the new poster does not take the shader's 40 px `rise` (it would need a copy of the page per column); `rise: 0` is one of the module's own settings. The three hand-offs are drawn by their modules (`createHandoff`) on a canvas inside their scene (`HAND`), so they share its clips and its exit.

## Global slots

| Slot | Limit | Notes |
|---|---|---|
| `palette` | id | `signal` Swiss red (source), `ikb` Ultramarine signal, `orange` Safety orange (ANSI hue), `night` Night print |
| `bpm` | 112–128 | optional, default 120; fixes the tempo (then `target` is ignored) |
| `target` | seconds | optional; the tempo moves inside 112–128 to meet it (see Timing) |
| `form` | `'square'` \| `'diagonal'` | optional, default `'square'`; the form variant (mode card, Variants): `'diagonal'` leans the solid fields wider than four columns on the grid diagonal |
| `opening` | `'draw'` \| `'set'` | optional, default `'draw'`: the grid drops in and the chrome draws over the first 0.8 s. `'set'`: grid and chrome are already on the first frame, for a film cut into a reel or entered by a transition |
| `seed` | int | paper texture and bed melody |
| `paper` | 0–1, default 0.5 | static print texture (soft-light, contrast-neutral); 0 = flat |
| `chrome.brand` | 16 | header, top left, 28 px heavy |
| `chrome.tag` | 40 | header, column 3, 25 px mono caps |
| `chrome.license` | 10 | header, column 11 |
| `chrome.url` | 32 | footer left |
| `chrome.platforms` | 24 | footer, column 5 |
| `sound` | — | `{ preset: 'swiss', key: 'C', energy: 0.55, bedGain: -4, kinds: { <type>: '<section kind>' }, energies: { <type>: 0..1 } }` |
| `bed` | — | optional generated music: `{ file: 'assets/audio/bed.wav', offset: 0 }`, its tempo must equal the fitted bpm (set `bpm`) |
| `section` (any scene) | 24 | header label from this scene on; chapter and page scenes default to `num — title` |
| `enter` (any scene) | `'columns'` \| `'columns-lean'` \| `'columns-two'` \| `'turn'` \| `'cut'` | how the scene is entered (Transitions); a claim cannot take the columns |
| `peak` (any scene) | `'hook'` \| `'claim'` \| `'reveal'` \| `'lockup'` | marks the scene's peak (T3); default: the first scene `hook`, the last `lockup` |
| `climax` (any scene) | `true` | the one peak at 60–85 % of the film |

The header carries real information only — brand, tag, section, licence — and the footer the URL, the platforms and one progress cell per bar; there is no running timecode. Chrome over an accent field (claim half, problem wipe, verify band; any element marked `data-accent-field`) is drawn in the palette's `onAccent`, split per character at the field edge.

Markup: `*text*` sets text in the accent. Only in `problem.lines`, `tagline.lines` and `words.states[].text` on paper or ink (large type), and only for a word that names a person or a decision — "you", "your call" — never punctuation, a number or a broken thing (`validate` warns on a starred span with no letter). Everything else that needs weight is set in ink.

Type size: every string that carries information renders at 25 px or more (the chrome, labels, notes and ids at 25 px; see the mode card's Type section). Every size sits on one modular scale, 25 × 1.3685ⁿ = 25 · 34 · 47 · 64 · 88 · 120 · 164 · 225, and each page sets three tiers of it (display, body 34, label 25; table below). Slots whose text would need to shrink below their floor are reported by `npm run check`: rewrite the copy shorter, never smaller.

## Scene registry

Bars are what the example fits to at 120 BPM (including a turn's pad and the phrase share) / the type's ceiling (6 s = 3 bars at 120, 3.25 bars at 128).

| Type | Purpose | Bars | Slots (character limits) | Fixed |
|---|---|---|---|---|
| `problem` | Hook: headline, then a table of what is broken; values flagged by ink bars; full-screen accent wipe out | 3 / 4 | `lines` 1–2 (18, ≤ 5 words each), `rows` 1–4: `label` (12, caps), `value` (12) | the second line lands once the first is read; the headline shrinks into the table heading; a row's flag lands as the next row rises; ends with the full wipe |
| `claim` | Input → output. Accent half = what the human brings | 2.5 / 4 | `input.label` (10), `input.lines` 1–2 (12), `output.label` (10), `output.lines` 1–2 (12), `name` (16), `desc` (40, ≤ 2 lines) | opens from a full accent field collapsing to the left half (after `problem`'s wipe or a figure's portal); on u 3 the half collapses into a band; starts on a bar line; at the end of a film the name takes the output side on the last downbeat |
| `chapter` | Chapter card: 640 px numeral + title, ink rule, caption | 1 / 6 s | `num` (2), `label` (32), `title` (8), `caption` (40, ≤ 2 lines, ≤ 6 words), `side` `'left'\|'right'` | the first three are entered by the columns; the numeral steps 6 px on every beat |
| `options` | Decisions: two options per question, the chosen one fills accent; summary; confirm block | 2.5 / 6 s | page head; `heads` 3 (10), `rows` 1–3: `q` (24), `options` 2 (16), `pick` 0\|1; `notes` 0–2 (36); `summary` (24); `confirm` (14) | summary items are the picked options (D1…); the tick is the accent |
| `document` | Two framed documents fill with numbered cells; a check adds cells; then frozen | 3 / 6 s | page head; `left.title` (12), `left.label` (26), `left.lines` 1–6; `right.title` (12), `right.label` (26), `right.groups` 1–2 (`added` ≤ 7); `right.note` (40); `stamp` (8); `hashes` 0–2 (30); `rail.label` (16), `rail.steps` exactly 4 (16); `rail.after` (16) | the four-step rail: check → confirm → freeze → hand-off |
| `matrix` | Steps × milestones; an accent cursor frame fills cells on half beats | — / 6 s | page head; `corner` (18), `cols` 2–3 (4), `rows` 2–4 (18), `done` (7), `side.label` (12), `side.big` (2), `side.caption` (22), `strip` 0–2 | rows enter one per half beat; milestone underline fills accent when its column completes |
| `verify` | Independent check: rows pass one per half beat, a counter n/N, an accent stop band | 2.5 / 6 s | page head; `from`, `link`, `to`, `blind` (34, optional), `heads` 2, `rows` 3–7: `id` (4), `ref` (28), `result` (6); `counter.label` (12), `counter.caption` (40); `band.a` (20), `band.b` (20) | N = number of rows; the band is where the person decides |
| `flow` | The system on one line: human → steps → human | 2.5 / 6 s | `title` (26), `nodes` 3–6: `name` (11), `note` (13), `human`; `bracket` (48), `loop` (44), `statement` (36), `list` (60) | human nodes are accent blocks |
| `install` | Commands typed in an ink block; numbered steps land one by one | 2.25 / 6 s | `title` (26), `panel` (24), `commands` 1–2 (36), `note` (48), `steps` 2–4: `cmd` (16), `note` (24) | typing at 72 characters/s; the cursor blinks on the beat; the bed rests here |
| `slot` | A sequence of steps through one slot between two grid baselines (X02 slot-rails) | 2.25 / 6 s | `label` (40), `words` 2–8 (14, ≤ 3 words; a string or `{ text, human }`), `note` (40, optional) | one size for every word (225, 164 or 120 px, the largest that fits); the `human` word in the accent; an index `01/05` beside the slot |
| `bars` | One measured quantity per item as columns; arrives as a staircase whose steps are its values (X24 step-wipe) | 1.5 / 6 s | page head; `values` 2–6: `label` (14), `value` (number), `display` (9, optional); `unit` (8); `limit` `{ value, label (32) }` (optional); `note` (40, optional) | columns span the grid by count; the limit rule is accent: it is the person's limit |
| `figure` | One number at 640 px with what it counts; its counter may hold the next scene (X23 counter-portal) | 1.5 / 6 s | `value` (4; needs a letter with a counter when the next scene opens on the accent), `label` (32), `line` 1–2 parts (22 each), `note` (40, optional) | the number and its line are a claim (read in a pause); the portal is the accent |
| `words` | A run of one- to three-word states on one anchor, each on its own ground (X18 aperture-swap) | 1.5 / 6 s | `states` 2–8: `text` (16, ≤ 3 words), `ground` `'paper'\|'ink'\|'accent'`, `shape` `'band'\|'close'\|'circle'\|'cut'` | one size for every state; the accent ground only for a state that is the person (mode principle 2); neighbouring states on different grounds |
| `tagline` | The promise again, biggest type of the film, ink bar | 1.25 / 6 s | `lines` 1–2 (17), `label` (60) | a claim, read in a pause; starts on a bar line |
| `end` | Name, the parts in columns, ink square + URL, footer line | 2.75 / rest | `name` (14), `items` 2–4 (12), `url` (44), `foot` 1–2 (44) | URL holds ≥ 3 s; an ink underline lands under it on the film's last downbeat |

Page head (options, document, matrix, verify, bars): `num` (2), `title` (10), `caption` (48, ≤ 2 lines, ≤ 6 words).

Order: any. The signature chains read best in order: `problem → claim` (the full wipe collapses into the input half), `chapter → page`, `figure → words` or `figure → claim` (the portal). A `claim` after any other scene opens on a hard cut to the accent field.

Text fitting: display slots shrink to fit their span down to a floor (≈ 0.75× nominal), stepping down the scale; labels and mono text do not shrink below 25 px. Beyond the floor `npm run check` reports a console error — rewrite, do not shrink further.

### Short chain (a reel cut)

`opening: 'set'` puts the grid and chrome on the first frame; the last scene does not exit. The shortest cut is `problem → claim`: 6 bars, 11.25 s at 128 BPM (12 s at 120). Under api 3 a closing claim carries its lock-up (the name takes the output side on the last downbeat), so the cut holds four or five compositions and passes the T1 variation; the problem's wipe is its one T2.

## Example content (`content.js`)

The gatewright launch film (placeholder copy, see above), `signal`, fitted by `npm run fit` to 64 s: 32 bars at 120 BPM (api 3, 2026-10-19). It uses every device: the columns into the three chapter cards (upright, lean, two-phase), the slot for the five rollout stages, the step-wipe into the error-rate chart, the portal through the 0 into the run of words (the climax, at 76 %).

| Bars | Scene |
|---|---|
| 0–3 | problem: "All users," / "one push." + 2 rows; the full accent wipe (T2, hook) |
| 3–5.5 | claim: Who first, how far. → Every stage, gated.; gatewright |
| 5.5–6.5, 6.5–9 | chapter 01 Plan (columns, upright), options (2 questions) |
| 9–11.25 | slot: staff · 1 % · 10 % · *you widen* · 100 % |
| 11.25–12.25, 12.25–15.25 | chapter 02 Sign (columns, lean), document |
| 15.25–16.25, 16.25–18.75 | chapter 03 Watch (columns, two-phase), verify (4 checks) |
| 18.75–21.25 | flow: YOU → dry run → gates → probe → YOU |
| 21.25–22.75 | bars: error rate per stage under the person's 0.5 % limit (step-wipe) |
| 22.75–24.25 | figure: 0 stages widened without a person (the portal opens) |
| 24.25–25.75 | words: You widen. / It ramps. / You *close*. (accent, ink, paper; climax) |
| 25.75–28 | install: one command, two steps (bed rests) |
| 28–29.25 | tagline: "Every gate," / "opened by *you*." |
| 29.25–32 | end: gatewright, four parts, URL, underline on the last downbeat (lock-up) |

The product, its URL, ids, hashes and counts are fictional; the four health checks are the same four rows on the verify page, and the error rates are under the plan's 0.5 % limit.

## Sound

`score.mjs` maps scene types to bed sections (`problem`, `claim`, `figure` build; chapters, pages, `slot`, `bars`, `words` drop; `install` break; `tagline` drop; `end` outro); a chapter, `flow` or `tagline` opens a new section so the bed's chord parts change instead of looping. Override with `sound.kinds` / `sound.energies`. Every cue from `scenes.js` gets a sound on the same frame: display-type landings (thud; chapter numerals a log drum), rows and cells (woodblock), counters (marimba stepping up a pentatonic), accent blocks — the human's decisions — (swish into a marimba stroke), ink blocks and rules (a soft swish), full wipes (swept noise + low landing), stamps, typing, hold moves (a high woodblock; the cursor blink and the inverted ground are silent or a soft tick). The devices: the columns a stamp on the downbeat where the first column starts and a low tick on every third column; the step-wipe a tick per step and a stamp as it lands; the portal a rising whoosh landing on the beat with a thud; the slot a soft tick per word (the person's word the accent marimba); the aperture a muted kick and a tick per word. Master −14 LUFS, true peak ≤ −1.5 dBTP. **Not yet confirmed by ear** (2026-10-19).

## Form variant (2026-10-19)

`content.form` picks one value of the mode's form axis; the mode card's Variants section says when to choose which. `'square'` is the template as it was: its output is unchanged (21 stills of the example at fixed times, byte-identical before and after the change). `'diagonal'` changes only geometry, in `scenes.js` (`FORMS`, `LEAN`, `isDiag`):

| Element | `'diagonal'` |
|---|---|
| problem ink bars (706 × 80) | sheared 19.2° about their middle; the value on them set upright, 28 px from the leaning edge |
| problem full wipe, claim field | 190 px wider on each side and sheared about the frame's middle, so the full-width field still covers every corner; the wipe's front edge leans |
| claim half | collapses until its edge joins (960, 120) and (668, 960), the gutters between columns 6 / 7 and 4 / 5 on the two rules, crossing y 540 at x 814 (`CLAIM_EDGE`); the band behind the input label keeps the lean |
| claim input lines, arrow | lines fit 729 px (one line) or 682 px (two) instead of 820, so they end one gutter inside the edge; the arrow is 578 px instead of 778 |
| verify band | 28 px wider on each side, sheared; its front edge leans as it wipes in |
| install block (1728 × 200) | sheared about its middle; panel label and commands set upright |
| chrome over a field | `data-accent-field` takes a fifth value, the lean, and `index.html` follows the sheared edge glyph by glyph |

Type, rules, outlined boxes and blocks four columns wide or narrower (picks, confirm block, probe box, cells, nodes, stamps, the tagline bar) stay upright. Measured on 2026-10-19: the template example in `ikb` with `'diagonal'` passes `hyperframes check` with 0 errors and 510/510 contrast; a 6-bar problem → claim film in `orange` (the mode card's best-fit use case) passes `check-film` in both values with the same single WARN (the claim key's picture event, a known issue).

## Settled options (2026-10-18)

The two batch 2 candidates are the template's only behaviour now; `content.variant` and the `'source'` / `'half'` branches are deleted. Both were accepted on the recommendation; the owner did not compare them shot by shot.

- **Type: three tiers on one scale.** Every size from 25 × 1.3685ⁿ = 25 · 34 · 47 · 64 · 88 · 120 · 164 · 225 (· 308 · 421), the 25 px floor and the 120 px page head five steps apart; each page uses three tiers of it. The 640 chapter numeral, the 400 side numeral and the 300 counter are graphics, off the scale; the chrome keeps its sizes. Display slots that do not fit step down the scale, not 2 px at a time, and never below the scale step at or under their floor.

| Page | Display | Body | Label (25) |
|---|---|---|---|
| page head (options, document, matrix, verify) | numeral + title 120 | — | caption |
| `problem` | headline 164 (82 once shrunk into the heading), row labels 88 | values 47 | index |
| `claim` | input / output lines 120 | name 34, description 34 | side labels |
| `chapter` | title 225 | caption 34 | kicker |
| `options` | — | questions, summary items, confirm 34 | Q index, options, notes |
| `document` | — | file titles, rail steps 34 | cells, lines, hashes, stamps |
| `matrix` | — | milestone heads, step rows, strip lines 34 | side caption, done labels, notes |
| `verify` | /N 120 | box titles, blind line, band 34 | ids, refs, results |
| `flow` | title 120 | node names, statement 34 | notes, bracket, loop, list |
| `install` | title 120 | commands, step commands 34 | step numbers, notes |
| `tagline` | lines 225 | — | label |
| `end` | name 225 | items, URL 47 | foot |

- **Claim: the half collapses into a band.** On beat 3 of bar 2 (u 3, as the description settles) the accent half collapses about its middle into an 80 px band behind the input label (y 172–252, 0.6 s expo in-out, with a swish; the arrow's pushes from bar 3 are unchanged); the input lines and the arrow turn ink on the frame the field's edge passes them. The problem's wipe and the half then hold the accent ground for under 2 bars together, and the band marks the input (4.8 % of the content area) for the rest of the page (principle 7: a change of ground lasts ≤ 2 bars; a marker covers ≤ 10 %). The collapse is the page's last landing; the page is always fitted long enough for it. The header and footer follow the band (index.html reads each accent field's scaleY and y as well as its scaleX).
- **Opening: unchanged.** The low-energy build under the problem page stays as it is (settled by theory; the owner did not object).
