# tally template

One square per item. The same squares regroup chapter by chapter — a grid, bands per category, a sorted grid, the axis of a bar chart, one block cut by share, columns per period, the same columns re-read as a trend, a list that streams to its key item, a rule under the closing numbers — and each chapter's title is the sentence its picture proves. Mode card: `references/modes/tally.md`.

## Files

| File | What it is | Edit? |
|---|---|---|
| `PLAN.md` | concept sentence, through-line, banned defaults, nearest reference (written by `new-film.mjs`; `npm run fit` refuses to run without it) | yes, first |
| `content.js` | palette, source line, `data`, `scenes` (optional `bpm`, `target`) | yes |
| `timing.rules.js` | timing API 3: what each scene type needs (reading by tier, its last motion), its ceiling, tempo range, and the events of the four tiers | no |
| `data/*.js` | the dataset (`data/gallery.js` is the example: 703 videos) | replace for a new film |
| `palettes.js` | presets; pick one by id | no |
| `compute.js` | units, selectors, `{placeholder}` filling | no |
| `timeline.js` | every scene event in beats from the scene start (phrases, flights, devices, glints), shared by picture, sound and `timing.rules.js` | no |
| `layouts.js` | the layout registry: placement of every square + the chapter's text and marks | no (add a layout here) |
| `squares.js` | every square at time t: wave, flights, mark-then-move, reveals, glints, the stream, the re-encode, the step-wipe | no |
| `fx.js` | measured rich text, tabular numbers, phrases | no |
| `marks.js` | the mark variants (`content.mark`): square, dot, Isotype glyphs; the default legend | no (add a glyph here) |
| `index.html` | `render(t)`: squares, overlays, persistent frame, grain; creates the hand-offs and frame-level entries | no |
| `score.mjs` | `data` bed + effects from `timeline.js` events | no |
| `tools/validate.mjs` | limits, selectors, devices, the fitted timing table; prints every on-screen string with numbers filled | run it |
| `tools/check-palettes.mjs` | contrast and colour-vision checks of every preset | run after palette edits |
| `examples/issues.content.js` | an alt film: illustrative `counts` data, `paper-red`, timeline → trend → share → split → close | copy over content.js to try |

**The example copy is a placeholder.** `content.js` carries the source film's titles and lines and `examples/issues.content.js` an illustrative story, so that both run as they are. A new film replaces every line with its own story and does not reuse their sentence patterns ("What were they for? *X* lead.", "Only *n of m* …", "About half …"); the mode card's Factory defaults list what else the template brings with it (principle 10).

## Commands

```bash
node scripts/new-film.mjs tally <film-dir> [--palette paper-red]
cd <film-dir>
npm run fit             # the timing table and the tier measures; stamps data-duration in index.html, writes renders/timing.json
npm run validate        # fit + every on-screen string and number, limits, devices; fix all errors first
npm run snapshot -- --at 3,8,14,20,27 --no-end    # key frames (runs fit first)
npm run film            # audio → check → render (renders/film.mp4); `npm run render -- --workers 2` on a shared machine
npm run palettes        # only if palettes.js changed
```

## Data

`content.data` takes one of two shapes. Every item becomes one square.

```js
data: {
  unit: 'video', units: 'videos',                 // legend and {unit}/{units}
  categories: [{ id: 'product-launch', name: 'Product launch' }, ...],   // name ≤ 24 chars
  flags: [{ id: 'stated', name: 'Named their tools' }, ...],            // ≤ 30 flags, yes/no per item
  periods: ['2026-09-26', ...],                   // optional, ≤ 24, label ≤ 10 chars; needed by `timeline` and `trend`
  items: [[categoryIndex, periodIndex, flagBits], ...]   // or { c: 'id', t: 'period', f: ['flag', ...], id, label, note }
  // or, when only totals exist:
  counts: [{ c: 'bug', t: 'Apr', n: 52, f: { tested: 30 } }, ...],
}
```

`id`, `label` and `note` on an item (strings from the data: a number, a title, a date) are what a `list` scene shows, one line per item. `counts` rows are expanded deterministically (seed from `content.seed`): within a row, each flag goes to a seeded subset of its units; flags of different rows are independent, so **intersections of two flags are only meaningful with `items`**. Keep the item count between about 40 and 2,000 (the grid shrinks to 3 px squares at the top end).

## Selectors and placeholders

A selector picks units: `all`, or atoms joined by `&`; atom = `[!]kind:value[|value…]`, kind `c` (category), `f` (flag), `t` (period). Examples: `f:stated`, `c:product-launch`, `!f:stated`, `f:three|remotion` (either), `c:bug&t:Sep`.

Copy never types a number. Placeholders in any string:

| Placeholder | Becomes |
|---|---|
| `{n}` | number of items |
| `{<selector>}` | count of matching items, e.g. `{f:stated}`, `{c:bug&t:Apr}`, `{!f:stated}` |
| `{pct:<sel>/<sel>}` | rounded percentage; the denominator defaults to all: `{pct:f:stated}` |
| `{kinds}` `{periods}` `{first}` `{last}` `{unit}` `{units}` | category count, period count, first and last period, unit names |
| `{rest}` | in a `restLabel` only: how many categories were folded |

Markup: `*words*` take the accent colour (the protagonist only); `[words]` are emphasised in the text colour. When a scene changes the protagonist, its title names the new one in `*accent*`: the squares light up in that colour while the title is read (`npm run validate` warns otherwise).

## Scenes (the registry)

`scenes: [{ type, name, ... }]` — one scene is one chapter on screen (a tick on the progress rule). `type` is the layout. `name` ≤ 24 chars (top-left label). Every scene except `count` and `close` usually has `title` (≤ 52 chars, one line, the conclusion) and `sub` (≤ 96 chars and the content width at 25 px, mono caps, the measure and its unit; ≤ 6 words, so it is read as a glance). Any order and any count of scenes; the first scene's squares appear in a wave, every later scene moves the same squares. No scene carries `bars`: its length is fitted (below). `rest` is not a content field: only `rest: true` means anything, and it marks a timing rest.

| Type | Purpose | Slots (limits) | Accent |
|---|---|---|---|
| `count` | The whole set and its size | `value` (default `{n}`), `caption` ≤ 44, `note` ≤ 60 | none |
| `columns` | Compare categories: one band of squares each | `top` (default 7): at most 9 bands in all, the rest band included, so with more than 9 categories `top` ≤ 8 and the rest fold into one band (24 categories show as 8 bands + "16 other …"; give each its own line in a `list` instead); `restLabel` ≤ 24 (e.g. `'{rest} other kinds'`), `callout` ≤ 28, `pick: 'roulette'` (below) | `accent: 'c:<id>'` — band in accent, count pulses, callout with the reveal |
| `split` | The grid re-sorted: matches first | `by` (selector, required), `caption` ≤ 40 (enters after its counter lands), `other` ≤ 32 (a label-size line after the complement's count, e.g. "333 said nothing about how"), `labelIn` / `labelOut` ≤ 40 | the matching squares |
| `axis` | Counts of overlapping groups as a bar chart; the subset's squares collapse into the axis | `within` (selector), `series: [{ name ≤ 22, sel }]` 2–8, `sort` (default desc), `callout` ≤ 28, `foot` ≤ 100 (one line across the content width at 25 px) | `accent: '<a series sel>'` — accent bar, value pulse, others dim |
| `share` | Part of the whole: one block, a segment per category | `top` (default 5; at most 9 segments with the rest segment, as `columns`), `restLabel` ≤ 24 | `accent: 'c:<id>'` — accent segment, large percentage |
| `timeline` | Count per period: a column of squares per period | — (needs `data.periods`, ≤ 24 periods, label ≤ 10 chars); `enter: 'step'` after a `columns` (below) | `accent: <selector>` — matching squares sit at the base and light up on the reveal beat |
| `trend` | The timeline's columns re-read as a trend (lib/handoffs `re-encode`): the squares step back, each column's top becomes a point, a curve draws through the points. Only right after a `timeline`, and only when the counts really have that second reading (PLAN §4 X07) | `callout` ≤ 28 (beside the last point, e.g. `'{t:2009–11} → {t:2024–26}'`), `highlight` (the key; default "trend") | the curve |
| `list` | The selected items as one line each (`id` and `label` from the data), streaming up and braking onto the key item (lib/handoffs `stream-brake`), whose square lights up as the reading band locks | `sel` (selector of the listed items, ≥ 2), `key`: `'last'` (default), `'first'` or a selector of one listed item; the key line (id + label) ≤ 5 words, its `note` ≤ 6 words (glance). Lines readable at once: about 8 when the band locks (the key, 3 above it, 4 below; the window is 600 px at a 64 px pitch and fades 70 px at each edge), and at the start the first line and 4 below it; the lines the stream passes are seen, not read. With `key: 'last'` only the key and the 3 lines before it stay on screen, so for every row to be read list ≤ 8 items and key one in the fourth line | the key item's square |
| `close` | Up to three numbers land on beats, a beat apart; the squares become a rule under them | `numbers: [{ value: '{sel}', label ≤ 28, accent?, sel? }]` 1–3, `line` ≤ 64 chars and ≤ 8 words (one line) | one number with `accent: true`, drawn 1.3 × the others; with `sel` and ≤ ~56 items its squares sit under the rule below it as beads (one or two rows) and light up on the last downbeat, otherwise an accent rule draws under its label. Beside an accent number the others recap earlier chapters and are read as glance text (number + label ≤ 6 words) |

Word limits count what enters at one moment as one sentence: parts shown together are joined with spaces before counting, so the list's key line is its id and label together, and a closing number beside an accent number is number + label together. `npm run validate` checks the limits above (the 9 bands, the 24 periods and the key line among them); the readable-lines window of `list` is a property of the layout, not checked.

Optional per scene:

- `enter` (T2, an expressive transition into this scene; not on the first): `'flip'` (lib/transitions `tally-flip`: the frame turns over in unit tiles into the new chapter, whose squares already wear their new colours: the flip is the mark), `'dither'` (lib/transitions `dither-sweep`: an ordered-dither front sweeps it in), both over beats 0–2, the squares leave at beat 2; `'step'` (lib/handoffs `step-wipe`, only `columns` → `timeline`: the band labels leave, a staircase front whose steps are the timeline's columns sweeps in over beats 1–2, the bands retract into it, and it stays as the chart). `enterFrom`: `'top-left'` (flip's default), `'bottom-left'` (dither's default), `'top-right'`, `'bottom-right'`, `'centre'`; vary it when a device repeats (the same device unchanged twice in a row is an error).
- `pick: 'roulette'` on a `columns` with an accent (lib/handoffs `roulette-lock`): the bands land neutral; a frame hops to each band as it lands (half a beat a hop), laps back to the top band, slows (a beat a hop) and locks on the protagonist, which lights up on the lock; the title's accent words enter at the lock. The candidates are the real bands (PLAN §4 X10).
- `climax: true` on the one scene whose reveal is the film's climax (T3, at 60–85 % of the length); on a `close` it is the accent number's landing. `npm run validate` warns without one.
- `music: 'intro' | 'build' | 'drop' | 'break' | 'outro'` overrides the bed section; `highlight` ≤ 28 names what the accent marks in the top-right key ("HIGHLIGHTED: …"), by default the accent's category or flag name, the accent series' name, the key item ("PEP 849") or the accent number's label.

Film-level slots: `source` (always on, bottom left: data, labels, method; say "illustrative" when it is) and `legend` (default `1 square = 1 {unit}`; `1 dot = …` or `1 symbol = …` with another mark) share the bottom row at 25 px: about 85 characters together with a short legend, checked by `npm run validate`. Past that, delete a field of the source line rather than shrink it. `legend` ≤ 28, `meta.title`.

- `mark` (the form variant, mode card Variants): `'square'` (default), `'dot'`, or an Isotype glyph `'glyph:doc'` (documents, proposals, issues), `'glyph:box'` (packages, releases), `'glyph:chip'` (devices). One mark for the whole film: every square, the legend and the accent key wear it. A glyph is drawn in full from a 12 px cell and is the square below 7 px, so it shows only where the cells are large (about 300 items or fewer). A legend that says "square" with another mark fails `npm run validate`.
- `edges`: `'fade'` (default: in over 0.5 s from the edge colour, out over 0.6 s) or `'cut'`: no fade, the persistent frame on from frame 0, and the last frame the settled picture. For a film that an edit cuts or transitions into (a demo in a reel); the same field as trace's.

## Fixed parts

- **Frame**: scene number and name top left (muted), the accent key top right while an accent is on screen (an accent square + "HIGHLIGHTED: …"), progress rule at y 986 with a tick per scene (ticks of scenes already reached are brighter; there is no "chapter n of N" label), source line bottom left, legend bottom right while squares are on screen. 96 px margins. All of it at 25 px.
- **Type**: one scale, every size on it: labels 25 (values 28), captions 32 / 40, titles 64 (fit down to 44), numbers 150 / 210 / 273 / 300. Text that carries information is never under 25 px; mono labels never shrink, so `npm run validate` rejects a sub, foot or source line wider than its row.
- **Text in phrases** (timing API 3): a line of primary text (title, caption, call-out, closing line) enters phrase by phrase, a beat apart, each phrase ≤ 5 words (`fx.js` `phrasesOf`: the fewest even phrases, breaking after punctuation; '←', '→', '·' ride with the next word). A phrase enters whole, a 0.35 s fade and a 14 px rise: no word-by-word stagger (a 60–90 ms stagger on a fade-and-rise is web-page load motion, `references/ai-tells.md`).
- **Mark, then move**: every regroup first changes colours in place (half a beat, a short sweep by rank), then the squares fly on the next beat. A scene that changes the protagonist first returns the old accent squares to neutral (beats 0–0.5), names the new one in the title, lights the new squares (beats 1–1.5) and flies at beat 2. A scene with nothing to mark (no accent before or after) flies at beat 0. A frame-level entry is the mark: the new colours are on the incoming frame, and the squares fly at beat 2.
- **Flight**: every regroup moves each square once: groups leave on eighth notes (the first late enough that the last lands on a beat), squares inside a group over 0.6 beat, each flies 1.4 beats on a cubic in-out with a small seeded arc; six sub-frames of motion blur while anything flies.
- **Timing inside scenes** (beats from the scene start, never scaled to its length): title 0.25, its later phrases a beat apart; flights leave at 1 (2 after a change of protagonist or an entry, 0 with nothing to mark) and land 2 beats later; accent reveal on the next beat at least half a beat after the last landing; `split` counter from 1 beat after the flight for 2 beats, its caption half a beat after it lands, the complement line half a beat after the caption's last phrase, labels half a beat and a beat after that; `axis` bars grow from 2.5 beats after the flight, every 0.5 beat, footnote at flight + 3, reveal on the first whole beat 1.5 after the last bar starts; `trend` re-encode at 1 for 2 beats, call-out at 3; `list` flight at 1 (lines in place at 3), the stream 3–5 (brakes over its first 80 %), the key's note and the lock at 5; `close` numbers at flight + 1, + 2, + 3 (the second as the rule lands), the line on the eighth after the primary number is read, the accent squares light up from the downbeat of the film's last bar, at least a beat after the line has entered. A longer scene lands at the same moments and holds longer.
- **Glints**: wherever a scene would hold fully still for more than 1.5 beats (a long reading window, a fitted length rounded up), a sweep of light runs along the protagonist's squares (the base squares when there is none): each swells × 1.22 for 0.35 s, the sweep by rank over 0.6 beat, a beat after the stillness begins, with the faintest pluck. It is the T0 change that is not new text (CONTRACT, "Migrating a template", step 3): the reader keeps reading, and no hold passes the 2 beats of api 3. Not in the closing scene.
- **Exits overlap the next chapter** (2026-10-18, brisk): text leaves over 0.4 beat (0.21 s at 112 bpm, under 2/3 of the 0.35 s entrance), from 0.15 beat before its chapter ends to 0.25 beat into the next. A frame-level entry carries the old chapter's last full frame instead.
- **Landing settle**: over the last 30 % of its flight a square swells 10 % and back while it brakes, one pulse that ends exactly as it lands (secondary motion, no bounce; the landing is still a clean stop).
- **Closing light of a chart scene**: when the last scene is `columns`, `share` or `timeline` with an accent, it ends like `close`, with a second move on the downbeat of the film's last bar: a sweep by rank over three beats in which every square that is not the protagonist steps back to `rest` (its value to muted) and the protagonist's squares swell × 1.4 one by one along their band, with the soft closing chime; in `columns` and `share` the protagonist's value pulses as the sweep reaches the end of its band.
- **Closing column** (`layouts.js` `close`, a measured stack): the numbers (baseline 560), their labels (616), the rule (at least 660, and 24 px below the label font's descent), the accent number's beads in one or two rows under the rule, the closing line (at least 770, and 24 px below the beads). The beads start 6 px below the rule, measured at their largest (the × 1.45 reveal pop of the widest mark, the dot), so in no preset or `mark` does the rule cross a bead or a bead touch the labels or the line; two rows push the line down a few pixels (774 in the 32 s demo). Without beads, the accent rule draws over the rule itself (2026-10-19: the owner saw the rule run through the beads).
- **Numbers** count with an expo-out, drawn in fixed digit cells, and read the frame time (motion blur never ghosts digits). A line that states a counted number's final value (the split caption with its percentage) enters only when the counter has landed.

## Library and local code

From the shared runtime (`lib/`): `lib/handoffs` `roulette-lock` (the frame's hop schedule, `beatsOf()`, and its state: cell and pop), `stream-brake` (the list's exponential brake and lock, `speed()` for the sub-frame count), `re-encode` (drawn over the scene with `ground: false`: the points land and the curve draws through the column tops; its `state().r` and `w` also fade the column values and step the squares back), `step-wipe` (its `state()`: front and retraction); `lib/transitions` `tally-flip` and `dither-sweep` (the entries, drawn from the previous chapter's last full frame to the live frame). Kept local, and why:

- **step-wipe's painting** (`squares.js` `stepSquares`): the module paints solid bars, and tally's bars are made of squares (mode principles 1 and 2). The template takes the module's state and paints the same staircase square by square: the old bands retract toward the front, each column's squares show where the staircase covers them.
- **roulette-lock's painting** (`layouts.js`, columns): the module paints its own row of cells; tally's candidates are the landed bands, so the frame is drawn round a band from the module's state.
- **stream-brake's painting** (`layouts.js`, list): the module paints log lines in its own mono; tally's lines are the items' squares (which fly in and ride with the stream) beside their id and label, in the template's type.

The expressive transitions are declared under the library's ids (`events().expressive`: `step-wipe`, `tally-flip`, `dither-sweep`), so `npm run fit` and `check-film` count them like any other film's. roulette-lock, stream-brake and re-encode are T1 devices: their hops, stop and points are T0 events, the list and the trend are compositions (`shots`).

## Palettes

`navy-amber` (source), `paper-red`, `night-teal`. Each is one accent plus neutrals: `base` for the comparison group, `rest` for "not it". All pass `npm run palettes` (text ≥ 4.5:1, graphics ≥ 3:1, accent vs neutrals ΔE ≥ 15 normal and ≥ 8 under protan/deutan). The frame-level entries mark tiles and cells in `base`, never the accent (references/transitions.md, Colour roles).

## Length and tempo

No film and no scene has a fixed length. `npm run fit` (`lib/fit.mjs`) runs `lib/timing.js` `fit(content, timing.rules.js)` (timing API 3, principles 4 and 5): each scene gets the whole beats its choreography and copy need, the total is rounded up to a bar, and the rounding goes to the closing scene. The length is stamped onto `index.html`'s `data-duration`, and `renders/timing.json` lists the scenes, key events, holds, flight hand-offs and the four tiers for `check-film`. `index.html`, `score.mjs` and `tools/validate.mjs` call the same `fit()`.

A scene needs the later of two moments, plus the 0.15 beat of its exit that falls inside it:

1. **Reading** (`ctx.reading()`, principle 1), each item timed from when it is readable (0.2 s after it starts to enter):
   - **primary**, read in sequence at 0.3 s a word: each phrase of the title, then the line that proves it (call-out, counted number and caption, the list's key line, each closing number with its label, the closing line); at most 5 words enter together (a phrase);
   - **glance**, fully still ≥ 1 s, in parallel: sub, note, foot, the split complement line and labels, the list key's note. They qualify because each states the measure or repeats a number already on screen; a glance line over 6 words is read as primary and `npm run fit` warns: shorten it.

   A word has a letter or digit (`·`, `=`, `/`, `←`, `…` are not words); placeholders are filled first. Chart labels (bands, series, periods, segments) are read with the chart and covered by 2.
2. **Motion**: the scene's last motion (`timeline.js` `motionWindows`) + 0.25 s, so the last landing reads as arrived.

| Type | Motion (beats from scene start; F = flight start: 1, 2 after a swap or an entry, 0 with nothing to mark) | Primary | Glance |
|---|---|---|---|
| `count` | counter 0.5 → 3.5; caption 2.5; note a beat after its last phrase (opener: wave to 3) | title → number → caption | sub, note |
| `columns` | band g lands at F + 2 + 0.5 g (shifted so the last is on a beat); reveal on the next beat; roulette: hops from the first landing, lock on a whole beat | title → callout (at the reveal) | sub |
| `split` | groups land F + 2, F + 3; counter F + 1 → F + 3; caption F + 3.5; complement + 0.5; labels + 0.5, + 1 | title → count → caption | sub, complement line, `labelIn`, `labelOut` |
| `axis` | squares form the axis by F + 2; bars from F + 2.5 every 0.5 for 2 beats; foot F + 3; reveal | title → callout (at the reveal) | sub, foot |
| `share` | segment g lands at F + 2 + 0.5 g; reveal on the next beat | title → the accent percentage | sub |
| `timeline` | period i lands at F + 2 + i × min(0.5, 6 / periods); with `enter: 'step'` every column lands at 2; reveal on the next beat | title | sub |
| `trend` | re-encode 1 → 3 (bars thin, points land, the curve draws over the second beat); call-out 3 | title → callout | sub |
| `list` | lines in place F + 2; stream F + 2 → F + 4 (stops at 80 %); lock and note F + 4 | title → key line (at the stop) | sub, note |
| `columns` · `share` · `timeline` closing the film | as above; then the closing light on the downbeat of the last bar, at least 0.5 s after the reveal and after the call-out is read; the film ends a bar later | as above | as above |
| `close` (a rest) | numbers at F + 1 + k, each counts 0.9 s; line on the eighth after the primary number is read; the accent squares light up on the downbeat of the last bar, at least a beat after the line enters and 0.5 s after the last number settles; the film ends a bar later and not before the line is read + 0.4 s + the 0.6 s fade | title → the accent number + label → line | the other numbers + labels (beside an accent number) |

How the template meets api 3 (`CONTRACT.md`, "api 3: the four tiers"):

- **Grid of one beat, phrase of one bar.** Scenes no longer round to half bars (that rounding alone left still half bars); `phraseShareBeats` is 0 and the bar rounding goes to `close`, a rest that ends with its light on the last downbeat.
- **Holds.** `events()` declares every still window of at least 0.2 s up to the text exit as a hold; glints break any longer than 1.5 beats, so `fit()` checks the fitted holds against 2 beats and `check-film` against the pixels.
- **Compositions.** A regroup is two compositions: the title over the old layout, then the landed chart (declared as a shot at the last landing; the list and the trend likewise). Chart types may run to 5 bars because each composition is held to 6 s by the T1 check; `close` is one composition, the release after the climax.
- **T0** is every phrase, landing, counter, reveal, roulette hop, stream stop, re-encode stage and glint. **T2** is the entries (`enter`), at most 2 beats each, about one every 8–12 s: choose two or three for a 30–40 s film. **T3** is the opening scene's settled count or landing (hook), the reveal of the scene with `climax: true`, and the closing light (lock-up).

- **Tempo**: 104–120 bpm, default 112 (the `data` bed's tempo). `bpm` in content.js picks one inside the range. A generated bed (`bed: { file, offset }`) must be inside the range and `bpm` set to its measured tempo.
- **`target`** (seconds, optional): the tempo moves inside the range to the length closest to the target; what the range cannot reach is reported as bars of scenes to cut or add. Scenes are never padded or squeezed to meet it.
- **`bars`** by hand only to lengthen a scene on purpose (a drop); below the need or above the ceiling it is reported and replaced. The glints keep a lengthened scene from holding still.
- The `data` bed's sections follow the fitted scenes (`intro`, `build`, `break`, `drop`, `outro`; `music` overrides). The climax's reveal adds a soft impact under its chime, and its key is the music's drop.

The shortest film that shows the signature move is `count` → `columns` with `enter: 'flip'` (one expressive transition is the least a 12 s film may have) and `climax: true` on the columns, `edges: 'cut'`: 1.5 + 4.5 bars = 6 bars, 12.0 s at 120 bpm (12.9 s at 112); check-film PASS (2026-10-19). The example fits to 112 bpm · 15 bars · 32.1 s: `count` 2, `columns` 2.75, `split` 2.75 (flip entry), `axis` 2.75 (the climax), `close` 4.75 (dither entry; 3 beats of bar rounding); check-film PASS. Under api 2 it was 14 bars, 30.0 s. The alt example (`examples/issues.content.js`) fits to 112 bpm · 13 bars · 27.9 s: `timeline` 2, `trend` 1.5, `share` 2.25 (flip), `split` 2.5, `close` 4.75 (dither, the climax).

## Example content

`content.js` ships the source film's data and a trimmed version of its copy, as a working placeholder: 703 videos from an AI-video gallery snapshot. `count` (703) → `columns` (product launch 203, 29%) → `split` (370 named their tools, 333 did not; tally-flip entry) → `axis` (tools among the 370: Remotion 92 … AI video model 3; the climax) → `close` (703 · 370 · **3**, and 236 named a code renderer; dither-sweep entry). Every number is computed from `data/gallery.js`; `npm run validate` prints them. Replace the copy for a new film (see Files).
