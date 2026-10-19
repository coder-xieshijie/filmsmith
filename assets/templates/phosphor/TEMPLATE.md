# phosphor template

A product launch inside a night-time terminal: near-black ground, one phosphor accent that means "passed, proven", mono code against heavy display type in a neutral gradient, a HUD frame that runs the whole film. Paced by the four tiers of timing API 3 (principles 4 and 5, owner-approved 2026-10-19): about one change a beat, a new composition every two to three seconds, an expressive transition every eight to twelve, two or three peaks. Read the mode card first: `references/modes/phosphor.md`, including its Factory defaults and Don'ts.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs phosphor <film-dir> --palette ice
cd <film-dir>
# fill PLAN.md, then edit content.js
npm run fit                                                # timing table: bars and start of every scene
npm run snapshot -- --at <times>                           # frame first (runs fit first): pick times from the table
npm run film                                               # fit → audio → check → render
```

**The example copy is a placeholder.** `content.js` ships a fictional tool so that every slot is filled. Write your own sentences for your product; do not keep the example's sentence shapes (its hook, its two-line claim, its chapter titles), and do not keep its scene order unless your story has that order.

## Files

| File | Edit? | What it is |
|---|---|---|
| `content.js` | yes | Palette, brand, scenes and copy; optional `bpm`, `target` |
| `palettes.js` | no | Presets `ice` (default), `phosphor`, `amber`, `cyan`, `violet` |
| `timing.rules.js` | no | Timing API 3: the tempo range, the reading tier of every slot and why it qualifies, per-type ceilings, the music's drops |
| `events.js` | no | Every event time inside a scene, from content only; read by the picture, the sound and the rules; how each scene hands over to the next (`exitsOf`); the key events, holds, hand-offs and the four tiers (micro, shots, expressive, peaks) written to `renders/timing.json` |
| `film.js` | no | Builds the DOM and one paused GSAP timeline from content; draws per-frame values; drives the library hand-offs (`lib/handoffs`) and transitions (`lib/transitions`) the pages use (Transitions below) |
| `fx.js` | no | Code-drawn energy shots: `burst`, `sphere`, `tunnel` (with fold), `horizon`; all but the tunnel are light only, screened over the ground by `film.js` `lightLayer` (a new screen-blended shot goes through it too) |
| `score.mjs` | no | `terminal` bed + one effect per picture event, on the fitted grid |
| `index.html` | no | CSS and the root; the timeline registry. `data-duration` is stamped by `npm run fit` |

## Length

Nobody types a duration or a scene's bars. `lib/timing.js` `fit(content, rules)` sizes every scene from its copy and its choreography, and `film.js`, `score.mjs` and `npm run fit` all call it. `npm run fit` prints the table (bars, start, seconds needed, primary and glance reading per scene) and one line of tier measures, writes `renders/timing.json` and stamps the length onto `index.html`; it exits with an error when a scene breaks an api 3 limit, and the same error prints a red banner on every frame.

**How a scene's need is computed** (`events.js`, the same schedule the picture plays, read with the shared reader of `lib/timing.js`):

1. Every scene is a sequence of steps: a hook is typed, then its problem tags land; a claim decodes line by line, then its sub; a question types, its options pop in, one is picked. A step starts once the step before it has been read (the next line may enter up to 0.25 s early, since a line is readable 0.25 s after it starts entering), and never earlier than its choreography allows. Key landings (a pick, a lock, a brake, a lit output, the confirmation, the last count) sit on a beat; other landings sit wherever their reading puts them.
2. **Primary** text is read at 0.3 s a word, one state after another (principle 1). **A state carries at most five primary words** (api 3; a claim eight, read in a pause): every primary slot below is one state, and a typed line is read along as it types, in chunks of five words.
3. **Glance** text needs 1 s fully still and is read alongside the primary text. A slot is glance only when it has at most six words and repeats something on screen or can be deleted without the shot losing its point; `timing.rules.js` lists the glance slots of every type and why each qualifies. A glance slot over six words is counted as primary and `npm run fit` warns.
4. The tagline is slammed word by word; once complete it is read in a pause, 0.3 s a word.
5. Symbol-only tokens (`·`, `→`, `|`, `//`, `✓`, `▸`) are not words; `{markup}` and `[stress]` brackets are dropped.
6. Need = the moment the last state has been read and the last landing has held + the exit choreography (`out`, which depends on the exit: see Transitions). `fit()` rounds it up to whole beats (`unit` a quarter bar) and the film up to a 2-bar phrase, which the `end` card absorbs; chapter turns, the claim and the batch 4 pages start on a bar line.
7. **Limits** (api 3; CONTRACT.md, "api 3: the four tiers"): after a landing the picture holds still ≥ 0.2 s and ≤ 2 beats (a claim read in a pause ≤ 2 bars); a composition lasts ≤ 6 s, and a scene that holds two or three compositions (a chapter card, its page, the close-up after a push-in) may last five bars; a typed line that would end long before it has been read types slower (`paceCps`, never below 24 cps), so the reading, not a still frame, fills the time. When the grid, a pad or the phrase share lays a scene out longer than it needs, its **tails** fill the slack: on a beat, a group of the page's supporting elements dims to 60 % in two frames, so no hold passes two beats and what the page proved stands alone. Past a limit, cut copy, move a repeated label to glance, or split the scene. Never raise the tempo to squeeze copy in, and never shrink the type.

| Type | in (beats) | out (beats) | extra motion | primary (one state each) | glance | max bars |
|---|---|---|---|---|---|---|
| `boot` | 0.25 | 4 (collapse 1.5, point 0.8, burst 2) | the prompt types alone at the centre (40 cps), rises 0.35 s as the hook types (1.4 beats); stress on the next beat; each tag as the one before has nearly been read | prompt (in chunks) → question → each tag | — | 5 |
| `audit` (legacy) | 0.5 | 2 (burst) | command 32 cps; rows every beat; fix 58 cps; flips every 0.5 beat | each row word + bad → each row word + good | command, fix | 4 |
| `hero` (turn) | 0.27 | glitch 0.64, else 0 | claim line 1 decodes (0.55 s); line 2 lands (0.6 s) as line 1 has been read; the sub as soon as the claim has been read; facts every 0.5 beat from half a beat after the sub; sphere push over the first 2 bars | each claim line → sub | facts | 3 |
| `qa` (turn) | 0.08 | per exit | card until its title is read and the card line (typed in 0.5 s) seen, on a half beat, ≥ `chapter.beats` (2); the number and card line light halfway through a long card; page 0.4 beat into the 0.8-beat flight; the question types at reading pace (≤ 48 cps); the options pop in once it is read; the pick on a beat | card title → each question → its options | card line, note, window bar | 5 |
| `decide` | 0.1 (after a windowed page: the window morph, 0.7 beat) | per exit | decisions every 0.5 beat, one with `found` holds the next until it is read; confirm on a beat; its check 1 beat later; the camera pushes in on the confirmation | each `found` decision → confirm | note, window bar, decisions without `found`, strip items | 3 |
| `freeze` (turn) | 0.08 | per exit | sweep 1.2 beats; flags one a beat; the fix half a beat after the last flag has nearly been read; the terminal (a new composition) half a beat after the fix; command 120 cps; each hash resolves in 0.5 beat (hex scramble); lock and result together on the next beat | card title → each flag → fix notes → result | card line, note, window names, document lines, added row, command, outputs, lock word | 5 |
| `flow` (turn) | 0.08 | glitch 0.6, else per exit | dot 1 beat per output, each output lights on a beat; checks every 0.5 beat after their output lights; the next output lights as the previous checks are nearly read | card title → each node name → each check label | card line, note, command, node subs, hub label and sub, strip items | 5 |
| `compare` (turn) | 0.08 | glitch 0.6, else per exit | counter from ≥ 2 beats into the page, one step per 0.5 beat, last step on a beat; the camera pushes in on the count; meta as the count is nearly read | card title → each name → `N label` → meta | card line, note, labels, descriptions, items; the ticker is not read | 5 |
| `run` (turn) | 0.08 | per exit; + 0.5 smear before a morph | the stream runs and brakes (stream-brake, 2 beats), the key line stops in the band on a beat; the camera pushes in on the band; the line after it 1.5 beats later | card title → key line | card line, note, window bar, the line after it | 5 |
| `pick` (turn, or continues a chapter) | 0.08 (after a windowed page: the morph) | per exit | the question types at reading pace; the candidates pop in every 1/8 beat; the frame jumps one per half beat, slows for the last two, locks on a beat (roulette-lock); the camera pushes in on the answer; the result resolves (0.5 beat) | card title → question → result | card line, window bar, candidates | 5 |
| `scope` (turn) | 0.08 | per exit | the old reading decodes; the beam sweeps the old trace at constant speed (spikes where runs failed); afterglow while the beam draws the new trace (beam-trace, 1.5 beats); the new reading flares and settles: the reveal, read in a pause | card title → old reading → new reading (≤ 8, a claim) | card line, window bar | 5 |
| `ends` | 0.17 | glitch 0.53, else per exit | nodes every 0.5 beat from the moment the title is read; bracket ≥ 2 beats after the first node; loop and its label half a beat later; one dot loop (2 beats) | title → each node name | sub, node tags and subs, bracket, loop | 3 |
| `install` | 0.1 | per exit | commands typed once the title is read, at reading pace (≤ 90 cps); the steps land one per beat as the commands are nearly read, alone (the title and terminal leave: a new composition); the music drops on the bar line among them. Time the fit adds (the grid, the pad before the tagline's bar line) goes before the steps in whole beats, the window bar and then the title dimming on the beat while the terminal waits, so the cards keep their own length and the run into the climax stays the shortest | title → each command (in chunks) | window bar, steps (each recaps a chapter) | 4 |
| `horizon-tagline` (turn) | 4.5 | 0.5 (slit closes in 0.45 beat) | tunnel 1 bar; fold (T2); one word per half beat, one stream across both lines | — | — (word at a time, then a pause) | 4 |
| `tunnel-tagline` (legacy) | 4 | 0.6 (tear) | tunnel 1 bar; each slogan line decodes | each line | — | 3 |
| `end` | 0.15 | 0.4 s (dim) | chips every 0.5 beat; URL from 1.5 beats at 45 cps, then held ≥ 3 s; chips light on the last downbeat | URL → sub | chips | rest, absorbs |

A turn scene starts a chapter, carries the claim, or is one of the batch 4 pages; it starts on a bar line and its start is a key event in `renders/timing.json`. **Within the slot limits below, every type fits every api 3 limit at 120, 128 and 136 BPM** (checked 2026-10-19 by building worst-case copy at every limit, one type at a time, and fitting it at each tempo; the limits that moved are marked *api 3*). Past them `fit()` reports an error: shorten the copy or split the scene.

**Elastic scenes.** Entrances are timed in beats from the scene start; exits (glitch cut, CRT collapse, smear, collapse, burst, slit close, dim) in beats before its end. A scene given more bars than it needs lands everything at the same moment and holds longer, its tails dimming what supports the result; pulses keep their half-beat yoyo, the `ends` dot keeps looping. The hero sphere stops pushing after two bars whatever the scene's length. Nothing is scaled to the scene's length.

**No waits between scenes** (2026-10-18). Exits are at most two thirds of the entrances they follow; a glitch cut's jitter ends two frames before the cut, so the next scene's first frame is a clean onset; a chapter card's title flies on the first half beat after it has been read and the page enters 0.4 beat into the 0.8-beat flight; install's steps land as soon as the commands are read (when the fit lengthens the install, the terminal waits instead, so the cards stay short into the climax), and the music drop moves to them, not the other way round.

**Tempo and `target`.** `bpm` defaults to 128 and may be set between 120 and 136; every in-scene time is in beats, so the choreography follows it, but reading time is in seconds, so a faster tempo can need more beats. `target: <seconds>` (with no `bpm`) asks `fit()` to search 120–136 for the length closest to it. More copy or more scenes make a longer film. A film's tempo may land a scene a part bar before a chapter turn; the tails fill it, and when a tempo leaves `npm run fit` with warnings about last steps (see Known issues on the mode card), try the neighbouring tempos.

**Hand bars.** A scene may set `bars` to hold longer for rhythm (a rest before a drop); a value below its need or above its limit is reported and overridden. The example sets none.

## Global slots

| Slot | Limit | Notes |
|---|---|---|
| `palette` | id | `phosphor`, `amber`, `ice`, `cyan`, `violet` — never a hex value (mode card, Palette presets) |
| `screen` | id | `crt` (default: scanlines, striped display type, vignette) or `flat` (a flat panel: none of the three); nothing else changes (mode card, Variants). Any other value prints a red banner |
| `seed` | int | All randomness (scramble glyphs, fibres, grain, sound) |
| `brand.name` | 14 | HUD and end card |
| `brand.tag` | 16 | HUD, after the name |
| `brand.licence` | 24 | HUD top right, uppercase; repeat it in the end card's sub, so the HUD only repeats it |
| `brand.logo` | id | `check` (brackets + tick), `prompt` (`>_`), `none` — drawn in code, in the HUD |
| `sound` | optional | `{ key: 'A', energy: 0.55, bedGain: 0 }` |
| `bed` | optional | `{ file, offset }` replaces the synthesised bed with a generated track; bpm must equal its tempo |
| scene `hud` | 40 | Overrides the HUD chapter label (`[01/04] SET THE POLICY` is derived; `NN` counts the scenes with a `chapter`) |
| scene `music` | kind | Overrides the bed section: `intro`, `build`, `drop`, `break`, `rest`, `outro` |
| scene `bars` | optional | Only to hold a scene longer on purpose (see "Length") |
| scene `out` | optional | `'glitch'`, `'crt'` or `'cut'`: overrides how the scene hands over to the next (Transitions) |
| scene `climax` | optional | `true` marks this scene's peak as the film's climax (T3) instead of the tagline's claim |

## Scene registry

Scenes run in the order given. Openings and closings come in pairs: one default that transforms into the next scene, one legacy motif kept for continuity with the source film.

| type | purpose | example bars (need) | fixed choreography |
|---|---|---|---|
| `boot` **(default opening)** | Hook typed at a cursor; the key word grows; problem tags flash; everything is pulled into the cursor, which becomes the point of light the fibres converge on | 4 (3.43) | the prompt types alone, rises as the hook types; collapse → point → burst → white flash on the last frame |
| `audit` (legacy opening) | Terminal audit: up to four red rows, a fix command, rows flip green, burst, flash | — | as the source film |
| `hero` | The claim under a horizon line, the scanline sphere rising out of it at the opening's point | 3 (2.07) | the line draws out from the point; the sphere is born there, pushes in for two bars, holds; claim, sub and one row of facts centred under the line |
| `qa` | Chapter: at most two questions, each typed, its options popping in, answered by one pick | 3.25 (3.17) | chapter card → title flight; the pick pushes in to 1.15 and the others step back |
| `decide` | The same chapter: the decision summary lands line by line, then one confirmation | 2.75 (2.38) | the questions window morphs into this one (container-morph); confirm, then its check on the next beat (the box takes the accent only then); push-in on it |
| `freeze` | Chapter: two documents; a second checker sweeps, flags gaps (40 px, under their windows); a gap is fixed; both freeze with hashes | 4 (3.79) | sweep, flags, fix, the terminal, hashes resolve, lock |
| `flow` | Chapter: inputs → one hub → outputs; dots travel; outputs light; checks tick | 4 (3.13) | |
| `compare` | Chapter: two parties and the shared ruler; a counter steps to N; a ticker repeats the counted items | 3.25 (3.15) | push-in on the count |
| `run` *(batch 4)* | Chapter: the tool's own log races past in a terminal window, brakes exponentially and stops with the key line in the reading band | — | stream-brake; push-in on the band; before a window morph the lines smear off (slice-smear) |
| `pick` *(batch 4)* | Chapter, or the same chapter: the tool tries the candidates one by one; a frame jumps, slows and locks on the answer; the result resolves | — | roulette-lock; push-in on the answer |
| `scope` *(batch 4)* | Chapter: a measure on a phosphor screen: the old reading and its trace, then the beam redraws the trace from the new data and the new reading lands (the reveal) | — | sweep of the old trace; beam-trace; the new reading flares and settles |
| `ends` | A pipeline whose first and last nodes are you; the middle is bracketed; gaps loop back | 3 (2.92) | |
| `install` | Terminal with install commands under a musical break; the step cards land alone, one per beat, the drop on the bar line among them | 3.75 (3.17) | break from the scene start to the drop |
| `horizon-tagline` **(default closing)** | Grid tunnel rush; the tunnel folds into one horizon line; the line opens as a slit holding the claim, word by word on the half beat; closes back into the line | 3 (2.97) | tunnel 1 bar → fold → slit |
| `tunnel-tagline` (legacy closing) | Tunnel → white flash → dot-matrix slogan | — | as the source film |
| `end` | The horizon line shrinks to a block cursor; the name types out of it to the left, the chips to the right; the cursor drops a line and types the URL; one line of sub; the chips light on the last downbeat | 4 (2.57) | after `horizon-tagline`, the line shrinks into the cursor; after `boot`, the opening's point of light is the cursor (the shortest whole film, `boot` → `end`: 6 bars, about 10.6 s at 136 BPM) |

Example bars at 128 BPM, from `npm run fit`; the need in bars is in brackets. The three batch 4 pages are not in the example; the demo film (reseed, 42.6 s) uses all three.

A scene with a `chapter` gets a chapter card: number `nn / NN` (counted automatically), the title decodes centred, the card line types under it, then the same title flies to the page header, motion-blurred along its path. The card holds until its title has been read and its card line seen, to the next half beat and at least `chapter.beats` (default 2): about three beats; on a longer card the number and card line light halfway (a T0 change). Add `musicRest: <beats>` to the scene for a musical break (pad only) under the card. A `decide` or `pick` scene without a `chapter` right after a chapter scene continues that chapter: same number in the HUD, same header and note, no card; after a windowed page (`qa`, `decide`, `run`, `pick`) its window morphs out of the last one.

### Slots and limits

Limits are characters unless they say words. Character limits are measured against the layout at the type sizes of the mode card; text that does not fit prints a red banner naming the slot and does not shrink below 25 px (display slots shrink a little first). Word limits keep every state inside api 3's five words and every type inside its ceiling at 120–136 BPM (checked with worst-case copy, 2026-10-19); glance slots are six words at most. Rewrite shorter instead of fighting the banner. The 12-words-a-page budget of 2026-10-18 is gone (api 3 counts words per state).

**boot** — `prompt` 40 (mono, after `› `; typed and read in chunks of five words) · `question` 30, ≤ 5 words (display, one line) · `stress` one word of `question` · `problems` 0–3 × `[WORD, note]`, each ≤ 3 words (*api 3*: was 22 characters), together ≤ 22 characters on one row.

**audit** — `command` 56 · `fix` 60 · `rows` 4 × `{ word 12, bad 14, good 34 }`, `word` + `bad` and `word` + `good` ≤ 5 words each.

**hero** — `lines` 2 × 18, ≤ 3 words each (*api 3*: a 4-word line holds 2.03 beats at 128) · `sub` ≤ 5 words, one line, one `[stressed phrase]` set in ink (*api 3*: was 60 characters) · `facts` 0–3 × `[key 9, value 30]`, each ≤ 6 words, one row ≤ 1700 px at 25 px.

**chapter** (qa / freeze / flow / compare / run / pick / scope) — `title` `[first word, rest]` ≤ 20 together, ≤ 5 words (≤ 16 on `flow`, which shares the header row with its command) · `card` ≤ 6 words · `beats` optional, minimum card length (default 2) · `note` ≤ 6 words.

**qa** — `window` `[30, 20]` · `questions` 1–2 × `{ id 3, q 40 and ≤ 4 words (*api 3*: was 7), options 2–3 × 14 (≤ 3 words together; was 4), pick }`. More questions: a second `qa` scene.

**decide** — `note` ≤ 6 words · `summary` `[24, 16]` · `decisions` ≤ 4 × `{ id 3, text 32 (22 with found; ≤ 6 words without found), found 12 }`, text + found ≤ 5 words; a decision that restates a pick from the questions page is glance, one with `found` (what the tool found on its own) is primary · `confirm` `[6, 28]`, ≤ 5 words together · `strip` ≤ 3 items, each ≤ 6 words, 90 together.

**freeze** — `docs` 2 × `{ name 16, label 14, lines ≤ 7 × 48 (≤ 42 on a line a gap points at, which gets a marker), each ≤ 6 words }`; line markup: `## heading` (bold), `- item`, `| table |`, `{keyword}` (bold); an excerpt that skips ids shows the gap as a row (`| … | 309 more |`) · `gaps` ≤ 2 × `{ doc 0|1, after <line index>, flag 22 (≤ 2 words; set at 40 px, it must fit its window's width), fix 12 (the fixes ≤ 5 words together), add <line> }` · `command` 56, ≤ 6 words · `output` ≤ 2 × `{ key 14, hashOf <doc index> | value 40 }` · `lock` 10 · `result` 20 (≤ 2 words).

**flow** — `command` `[30, 34]`, ≤ 6 words together · `inputs` 1–3 × `[name 12, sub 20]` · `hub` `[label 12, name 10, sub 18]` · `outputs` 1–3 × `[name 12, sub 22]` · node names ≤ 2 words each, ≤ 9 together · `checks` ≤ 3 × `[label 16, output index]`, ≤ 2 words each (*api 3*: was ≤ 5 checks, ≤ 10 words) · `strip` ≤ 3 items, each ≤ 6 words.

**compare** — `left` / `right` `{ label 16, name 14 (≤ 2 words), desc 28 (≤ 6 words), items 3 × 28 }` · `middle` `{ label 14, name 10 (1 word), desc 14, may hold `{head}` }` · `counter` `{ label 16 (≤ 3 words), items 1–8 ids, verdict 6 }` (N = number of items; one step per half beat) · `meta` 1–2 × 40, ≤ 5 words together (they enter together).

**run** — `window` `[30, 20]` (the command that runs, the project) · `stream` `{ count 1–60, line }`: the lines before the key line; `line` is a pattern with `{n}` (run number), `{seed}` (6 hex digits from the film's seed) and `{ms}` (a time from the film's seed), ≤ 60 characters, never read · `key` `{ mark 6, text 40 }`, ≤ 5 words together: the line it brakes on; a mark of `FAIL`, `ERR` or `✕` (or `status: 'fail'`) takes `bad`, anything else the accent (passed) · `after` 0–1 × 48, ≤ 6 words: what the tool did with the key line.

**pick** — `window` `[30, 20]` · `question` 40, ≤ 5 words · `candidates` 2–6 labels × 12 (≤ 2 words each) · `answer` one of the candidates · `laps` 0 or 1 (default 1; with `laps: 1` at most 4 candidates) · `result` 40, ≤ 5 words (resolves left to right).

**scope** — `window` `[30, 20]` · `runs` 2–100 (the time base: one blip per run) · `from` `{ failed: [run numbers], label ≤ 5 words }`: the old trace and its reading · `to` `{ failed: [run numbers], label ≤ 7 words }`: the new trace and the reveal (read in a pause) · `beats` optional, the beam's hand-off (default 1.5, ≤ 2 as a T2 device). The labels must agree with the traces (README: the number of failed runs is not computed for you).

**ends** — `title` `[first part, last part]` 28 together, ≤ 5 words · `sub` ≤ 6 words · `nodes` 4–6 × `{ tag 8, name 8, sub 16 }` (mark the first and last `you: true`) · `bracket` ≤ 6 words · `loop` ≤ 6 words.

**install** — `title` `[plain, rest]` 30, ≤ 3 words · `window` `[24, 20]` · `commands` ≤ 2 × 40, ≤ 4 words each · `steps` ≤ 4 × `[command 18, label 20]`, each ≤ 6 words.

**horizon-tagline** — `lines` 2 × 20, ≤ 6 words together (the 2026-10-18 warning above 128 BPM is gone: a pause may hold two bars) · `stress` one word of line 2 (set 1.12 × larger).

**tunnel-tagline** — `lines` 2 × 18 (shown upper-case), ≤ 5 words each.

**end** — `chips` ≤ 4 × 12 (one row in the 800 px right of the cursor at 32 px) · `url` 40 · `icon` `github` | `link` | `none` · `sub` ≤ 8 words (a rest: the state limit does not apply) · `dim` optional, `false` keeps the settled lock-up to the last frame instead of dimming it in the last 0.4 s (for a film cut into a longer one; the length does not change). The brand name is set at 150 px in the 800 px left of the cursor.

### Computed values

- `freeze.output[].hashOf` prints `sha256:` of that document as finally frozen (gap additions included), computed in the browser from the lines on screen.
- `{head}` in `compare.meta` prints a 7-hex id hashed from the title and every frozen document, so it agrees with itself wherever it appears.
- The counter's N is the number of `counter.items`; the ticker under it scrolls the same items with the verdict and nothing else (it runs under the frame edge because everything in it is shown by the counter).
- Gap flags and their markers are numbered across the page.
- `run`: the stream's seeds and times are computed from `seed` (lib/rng.js hash), so they are stable and plainly illustrative; the key line is copy.
- `scope`: the traces are computed from `runs` and the `failed` lists (one blip per run that passed, a spike per run that failed, with a `bad` mark above it); the readings are copy and must agree with them.
- Everything else on screen is copy: label illustrative examples as such in the film's README.

## Transitions (2026-10-19)

The mode's devices come from the shared libraries (`lib/handoffs`, `lib/transitions`; references/transitions.md), as PLAN §4 of the batch 4 design assigns them to phosphor, plus three the template draws itself. Each T2 is declared in `events()` `expressive` with its device and variant, lands on a beat with a sound, and lasts ≤ 2 beats.

| Device | Tier | Where | How the template uses it |
|---|---|---|---|
| `scramble-resolve` (X15) | T0 | every decode: titles, the claim, readings, hashes, results | its model (seeded glyph per cell, re-rolled 24 times a second, cells lock in reading order; `scramble`, `per`, `appear`, `rate` read from the module's defaults), the alphabet taken from the line itself (hex for hashes). Cells are DOM text, because display type here is DOM (gradient, stripes, the RGB split) |
| `stream-brake` (X14) | T1 | `run` | the module draws the stream into a canvas in the terminal window (mono 32 px, line height 54), braking exactly on the key line |
| `roulette-lock` (X10) | T1 | `pick` | the module's state (cell, pop, step-back, wrap slide) drives the mode's DOM cells and frame; the hop schedule comes from its own `prepare()`; the frame is neutral while it searches and takes the accent when it locks |
| `container-morph` (X06) | T1 | a windowed page into the page that continues it (`qa` → `decide`, `run` → `pick`) | the module's state (size, radius on a damped landing, content out then in) drives a DOM window shell; local extension: the centre follows the same landing, because our windows share x but not y |
| `slice-smear` (X20) | T1 | `run` before a window morph | its exit half (0.5 beat) on the log canvas: bands one mono line high, aligned to the log's lines, slide off with streaks, so the window reshapes empty |
| `beam-trace` (X26) | T1 (here the reveal) | `scope` | the module paints the traces (old picture as exponential afterglow, the beam with its tail); its painters set the light of the DOM readings. 1.5 beats: the old picture falls to 10 % in about 0.18 s at 128 BPM, the order of a long-persistence phosphor (P39: 150 ms to 10 %, US 4,231,892), not of a P1 terminal (about 20 ms) |
| `crt-collapse` | T2 | the turn into a chapter page or install, alternating with the glitch cut | the frame-level transition's model (height, then width, to a dying spot; on: width, then height with 3.5 % overshoot) applied to `#stage` in DOM, off 0.75 beat + on 0.6 beat; the HUD stays. Local because WebGL cannot sample DOM pages |
| `glitch-cut` (mode's own) | T2 | the other turns | jitter ±30 px, ±4° skew, six tear bars, ≤ 0.25 s, ending two frames before the cut; it leans left or right (its variant) so two in a row are never the same. Since 2026-10-19 it counts as a T2 device: at most three a film (the owner kept the glitch on page changes 2026-10-18; api 3 limits how often) |
| `fibre-burst` (mode's own) | T2 + the hook | `boot`, `audit` | collapse into the cursor, the point, the fibres, the flash; 2 beats |
| `tunnel-fold` (mode's own) | T2 | `horizon-tagline` | the tunnel folds into the horizon, which opens as the slit: the claim |
| push-in (mode's own) | T1 shot | the result of `run`, `pick`, `decide`, `compare` | the scene scales 1.1 about the result in 0.6 beat (expo out); the header and note leave |

`fit` warns that `glitch-cut`, `fibre-burst` and `tunnel-fold` are not ids of the libraries: they are the mode's own devices (the warning says a mode may own one). `whip-push` (PLAN §3 lists phosphor among its modes) is not used: a push slides a page sideways, which this mode's turns already do with the title flight and the morph; `dither-sweep` stays available in the library for a phosphor film made from frames.

**Which exit, by default** (`events.js` `exitsOf`): into a chapter page or `install`, glitch and CRT alternate (glitch first); a page continued in a window (`decide` or `pick` without a chapter after `qa`, `decide`, `run` or `pick`) morphs, `run` smearing its lines off first; everything else is a straight cut, on the beat, the next scene's first element entering on the cut frame. A scene's `out` overrides it. Keep the count inside T2's budget: `npm run fit` fails a film with too few or too many, or with one device more than three times.

## Sound

`score.mjs` lays the `terminal` bed (A minor, written for 128 BPM, played at the fitted tempo) on the same grid. Sections follow the fitted scenes (the same map as the drop keys in `timing.rules.js`, `MUSIC`): intro under the opening, build under the hero, the first chapter pages (`qa`, `decide`, `run`, `pick`, `flow`), the groove (`drop`) under `freeze`, `compare` (when its counter lands) and `scope`, a break under the install commands until the bar line among the steps, a one-bar build under the tunnel and the drop on the claim, outro under the end card. Every picture event in `events.js` gets one effect on the same frame: typing → keystrokes, picks, tags, spikes and found decisions → pop, rows, decisions, options and checks → tick, roulette jumps → rising ticks, locks, brakes, landings and confirmations → stamp, title flights → whoosh, glitch cuts → glitch, the CRT collapse → a falling whoosh and a low thud on the dot, the power-on → a rising whoosh and a tick, the window morph → a soft whoosh, the smear → glitch and an airy whoosh, the beam → a whoosh and a short riser, the reveal → soft impact, the collapse and the tunnel → riser, flashes → soft impact with a duck, the chips lighting on the last downbeat → stamp then ticks. Mastered to −14 LUFS, true peak ≤ −1.5 dBTP as delivered: `score.mjs` masters at −2.0 dBTP because the renderer can encode the mix to AAC three times (the mix, a duration pad, the mux), which on this bed raised the true peak by 0.7 dB (2026-10-19). The sounds of the new devices are synthesised and were checked by levels only, not by ear.

## Settled options (2026-10-18)

The six batch 2 options are settled and their alternatives deleted, with `content.variant` (a `content.variant` now prints a red banner). Accepted on the recommendation; the owner did not compare them shot by shot.

| Was a key | Now the only behaviour | Replaced |
|---|---|---|
| `hud` | `minimal`: brand and tag, licence, chapter label, progress bar, corner brackets | the timecode, BPM and beat dots (decoration, theme rule 3) |
| `hero` | `horizon`: the sphere rises out of a horizon line drawn from the opening's point; claim, sub and one row of facts centred under it; no pill | sphere left, pill, claim right, key/value list |
| `end` | `cursor`: the horizon shrinks to a cursor; the name types out of it to the left, the chips to the right; the URL types on the next line; no logo | logo + name, chips, URL and sub stacked in tiers |
| `accent` | `proven`: the accent marks only what passed or is proven; titles, HUD, cursors, choices, connectors, `YOU` nodes and code headings are neutral and do not glow | the accent on titles, HUD, cursors and choices |
| `emphasis` | `enlarge`: the pick pushes in to 1.15 and stays, the other options step back to 45 %; gap findings at 40 px under their windows | colour and small flags only |
| `ambient` | `calm`: glow disc ≤ 1.5 %/s, sphere streaks ≤ 14 px/s, RGB split ≤ 0.1 s | the source film's faster ambient layers |

## Example content

`content.js` ships a placeholder: the launch of a fictional dependency-lock tool. `boot` → `hero` → `qa` (01) → `decide` → `freeze` (02) → `flow` (03) → `compare` (04) → `ends` → `install` → `horizon-tagline` → `end`. Fitted at 128 BPM it runs 38 bars, 71.25 s; it fits every api 3 limit from 122 to 132 BPM (at 120 a page composition reaches 6.05 s and the climax 86 %; at 134–136 the climax lands at 87 %). Tiers at 128 (`npm run fit`, check-film 2026-10-19): T0 median gap 0.55 beats, longest 3; T1 22 compositions, median 2.6 s, CV 0.5; T2 7 (fibre-burst, glitch ×3, CRT ×2, tunnel-fold); T3 hook, the claim at 84 % (climax), the lock-up; the two compositions before the claim average 2.34 s (the install's cards 2.81 s, the tunnel 1.88 s) against the median 2.6 s. Package names, counts and policy rules are invented; hashes and the head id are computed as above. The three batch 4 pages (`run`, `pick`, `scope`) are shown by the demo film (workshop `works/skill-showcase/demos-v2/phosphor/`), not by the example.
