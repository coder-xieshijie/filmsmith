# halftone template

A two-ink print: newsprint, one black plate and one process ink. One anchor — a piece of the product's mark, printed
in the process ink — sits on one screen point from the first frame to the lock-up. Every world (ground, procedural
field, type) is printed round it, every transition happens round it, and at the end the camera pulls back on a log
scale and the anchor lands in the whole mark. Dots vary in size, never in grey. Mode card:
`references/modes/halftone.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs halftone <film-dir> --palette cyan
cd <film-dir>
# fill PLAN.md, edit content.js
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time
npm run snapshot -- --at 0.4,3.6,8.4,10.6,22.4,25.0,31.0
npm run film          # fit → audio → check → render → renders/film.mp4
npm run palettes      # contrast table of every preset
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film: palette, seed, the mark, the scenes. The only file edited for an ordinary film. No duration, no bars. Optional `dot` (Variants), `edges` (Shortest cut), `bpm`, `target`, `bed`, `sound.tone`. |
| `palettes.js` | Presets `cyan` (default), `magenta`, `reverse` (ink paper). `npm run palettes` prints every contrast pair. |
| `timing.rules.js` | How long each scene type needs (timing API 3, format: `lib/timing.js`), the choreography constants `C` that `film.js` and `score.mjs` use, and the four tiers of change each scene declares (T0 micro, T2 expressive, T3 peaks). |
| `registry.js` | Scene types, slot limits, transitions and their tiers, the validation that `npm run fit` and the page both run. |
| `fields.js` | The procedural fields: tone functions round the anchor (`rings`, `cross`, `cells`, `count`, `rows`, `wave`, `grid`, `none`) and the morph between two of them. |
| `screen.js` | The halftone screen: an AM screen at a real angle, dot shapes `round`, `square`, `line`; type with a paper knock-out. |
| `film.js` | Renderer: layout from measured type, the anchor and the mark, worlds, the lock-up. `render(ctx, t)` is a pure function of `t`. The transitions come from the shared library where it can express them (Transitions, below). |
| `score.mjs` | The `press` bed (built here from `lib/audio` voices) and one synthesised effect per picture event; writes `assets/audio/mix.wav` and `assets/audio/measure.json`. |
| `index.html` | The canvas, the static `__timelines` stub and the pre-registered build hold in the head; `data-duration` is stamped by `npm run fit`. |
| `examples/text-model.content.js` | The alternate example: a made-up text model with its own mark (a cursor at the end of three lines of text) and copy; fits 16 bars = 32.0 s at 120 bpm. Copy it over `content.js` to try it. |

## The mark

The anchor and the lock-up come from `content.mark`, in **mark units** (y down) with the origin at the anchor's
centre, the point that stays put all film:

| Slot | What |
|---|---|
| `accent` | SVG path of the anchor: the one part of the mark printed in the process ink |
| `ink` | SVG path of everything else (the black plate), fill rule non-zero |
| `box` | `[x0, y0, x1, y1]` of the whole mark; the lock-up scales it to 405 px high |
| `anchorBox` | `[x0, y0, x1, y1]` of the anchor; through the film it is drawn 220 px high, 1.45× that in the hook |
| `lambda` | spacing of the rings round the anchor in the push-in and pull-back (mark units, default 0.14) |
| `ringAt` | radius of one ring (default 0.25): set `lambda` and `ringAt` to the mark's own arcs, if it has any, and the field's rings land on them |

Draw the real mark (a product's logo is drawn in code, principle 2). Take the anchor from a detail that can stand
alone at 220 px: a dot, a stroke end, a counter, a tool tip. Never an eye or an animal.

Nothing in the template is made for one kind of product: the shipped microphone capsule is that example's mark, and
`examples/text-model.content.js` is the same film for a text model, whose anchor is a text cursor at the end of three
lines of text (copy it over `content.js` to try it). To put another product's mark in:

1. **Choose the anchor.** One part of the mark that reads on its own at 220 px high, a simple closed shape with no
   fine detail (it is printed as 7–24 px dots): the dot of an i, a cursor, a capsule, a counter, a tool tip, a
   stroke end. Its centre is the point that stays on screen all film.
2. **Draw the whole mark as SVG paths in mark units**, origin at the anchor's centre, y down; any scale (the
   lock-up scales `box` to 405 px high, the film scales `anchorBox` to 220 px). `accent` is the anchor alone; `ink`
   is every other part, as many sub-paths as needed (helpers such as the example's `band` or `line` keep it
   readable). Where the two overlap the anchor wins: it knocks the black plate out under itself (a 3 px trap).
3. **Set `box` and `anchorBox`** to the bounds of the whole mark and of the anchor. An anchor much taller than
   wide (a cursor, a capsule) or wider than tall still works: it is sized by its height.
4. **Set `lambda` and `ringAt` only if the mark has concentric parts** (arcs, rings, a round counter): `ringAt` the
   radius of one of them, `lambda` their spacing, so the push-in's rings land on them. Without arcs, leave the
   defaults or use a spacing the mark already has (the text model sets both to its line pitch).
5. **Pick the fields for what the product does** (Fields, below), not for the mark: a speech model leans on `cross`,
   `cells` and `wave`; a text model on `rows` (pages, rows of tokens), `cells` (one passage found), `wave` (a
   stream); a build tool on `grid`; a protocol on `rings`. Keep at least one `mono` card with a real artefact.
6. **Run `npm run fit`, then `npm run snapshot`** at the hook, a card, the push-in and the lock-up: the anchor
   must read as itself in the hook and land in its place in the mark.

## Time

Length follows content. `npm run fit` runs `lib/timing.js` `fit(content, rules)` (timing API 3) with
`timing.rules.js`: each scene gets the whole beats its choreography and its copy need; `claim` and `lockup` are
turns and start on a bar line; the total is rounded up to a 2-bar phrase (one beat at most per scene, from the back,
the rest to the lock-up). The length is stamped onto `index.html`, and `renders/timing.json` records the key events
and the four tiers of change. Tempo 120 bpm (one bar 2.0 s), range 112–128; `bpm` fixes it, `target: <seconds>`
moves it inside the range. More copy or more scenes make a longer film; the tempo never changes to hide it.

Every transition takes the tail of the scene it leaves (that scene's text has been read before the tail starts),
and some run on into the head of the next. Inside a scene everything is placed in beats from its start (entrances)
or its end (exits), so a longer scene lands at the same moments and holds longer.

### Length table

Beats at the tempo unless marked s. Primary text is read at 0.3 s a word in the order it lands; labels are glance
text (≤ 6 words, still ≥ 1 s, read in parallel). The first scene's text lands one beat later, while the anchor
rises in.

| Type | Primary text (lands at) | Glance | Further motion | Need |
|---|---|---|---|---|
| `hook` | line 1 on beat 1, line 2 on beat 2 | `label` from 1.5 | anchor rises over beat 0, lands on beat 1 with a stamp and a contact wave; the rings step out one wavelength a beat | read + transition tail |
| `card` | `word` on 0, `line` on 1 | `label` on 0 | the field steps every beat | read + tail |
| `count` | `line` on 1, the value when the count lands | `label` on 0 | counts from `from` to `value`, at most 4 values a beat, 2–4 beats, ease-out; one cell a value | read + tail |
| `claim` | the lines when the dots land, 1.25 beats after the burst | — | burst on the bar line; read in a pause (≤ 2 bars) | read + tail |
| `lockup` | `name` on 2, `line` on 3 | — | pull-back over the first 1.25 beats; the second move on the last downbeat | read + max(1 bar, 1.5 s); takes the phrase rounding |

A primary state carries at most 5 words (`claim` 8, marked `claim: true`); a scene lasts at most 6 s (the lock-up is a
rest). Transition tails and heads (the windows round each cut, `leadSec` and `inPostSec` in `timing.rules.js`):

| Transition | Tier | Tail of the outgoing scene | Head of the incoming scene |
|---|---|---|---|
| `morph` | T1 | 0.29 s (text leaves up 0.17 s; the new word rises 0.12 s before the cut) | the field front runs from 0.25 beat before the cut to 0.5 after |
| `whip` | T1 | 0.3 beat | — (the new card arrives with its word in place) |
| `scan` | T1 | 0.6 beat | — |
| `cut` | T1 | 0 | — |
| `invert` | T2 | 0.75 beat | — |
| `quantize` | T2 | 0.5 beat (≥ 0.29 s) | 1.25 beats (the blocks re-sort) |
| `collapse` | T3 | 1.25 beats (shrink 0.5, hold 0.75) | 1.25 beats (the burst condenses onto the claim) |
| `slam` | T3 | 1 beat (exposure to paper) | 1 beat (blur and scale decay in 0.45 s, the ground falls back from paper) |
| `pull` | T3 | 1.75 beats + 0.17 s (text leaves, push in 1.5, hold 0.25 in silence) | 1.25 beats (pull-back) |

At 120 bpm a card with a one-word title and a four-word line needs 4–5 beats; a count to 12 with a four-word line
5 beats; a five-word claim 2 bars (it is a turn and holds its reading pause); the lock-up with a four-word line 2.5
bars before the phrase rounding.

**Tiers** (`timing.rules.js` `events`, principle 5): T0 — every beat inside a hook, card or count the field steps (a
ring steps out, a source switches on, a cell lights, a row scrolls, a bar group advances, a grid cell turns solid,
the count ticks), plus each landing; T1 — every scene start; T2 — `invert`, `quantize`, `collapse`, `slam` and the
pull-back; T3 — the hook's landing, each claim (the one nearest 72 % of the film is marked climax), the slam's
landing, the lock-up. `npm run fit` refuses a film that breaks them: aim for one T2 every 8–12 s and the claim at
60–85 % of the length, with the scenes just before it the shortest.

## Global slots

| Slot | Limit | Notes |
|---|---|---|
| `palette` | id | `cyan` (default), `magenta`, `reverse`; never a hex value |
| `dot` | id | `round` (default), `square`, `line` (Variants) |
| `edges` | id | `full` (default) or `cut` (Shortest cut) |
| `seed` | int | grain, the field patterns, the burst's paths, the sound's variations |
| `mark` | object | The mark (above) |
| `bed`, `sound.tone` | — | as in every template (CONTRACT.md, Sound) |

## Scene registry

| Type | Ground | Purpose | Slots (limit) |
|---|---|---|---|
| `hook` | paper | Opens the film (T3): the anchor lands, the opening's light, coarse ring field, the problem in one or two lines | `lines` 1–2, each ≤ 18 characters, ≤ 5 words in all; `label` ≤ 34, ≤ 6 words; `field` (default `rings`) |
| `card` | paper (or `ground: 'ink'`) | One feature or one real artefact: a word, a line, a field round the anchor | `word` ≤ 10; `line` ≤ 30, ≤ 5 words; `label` ≤ 34, ≤ 6 words; `mono: true` sets the line in IBM Plex Mono (a command, a transcript line, a token); `field`; `pattern` (an integer: cards with the same pattern draw the same field, e.g. the same voice); `to` |
| `count` | ink (or `ground: 'paper'`) | The number: counts up while the field's cells multiply | `value` integer ≤ 7 digits; `from` (default 0); `line` ≤ 30, ≤ 5 words; `label`; `to` |
| `claim` | paper | The claim (T3): the scene before collapses into the anchor, which bursts; the dots condense onto the lines | `lines` 1–2, each ≤ 18 characters, ≤ 8 words in all |
| `lockup` | paper | Last scene (T3): pull back to the whole mark, the name and one line | `name` ≤ 14; `line` ≤ 34, ≤ 6 words |

`hook` only opens a film; a `claim` needs a scene before it; the last scene is the `lockup`. Character limits are a
first filter: the page measures every string once the fonts are in and paints a red banner (and raises a page
error, so `npm run check` fails) for text wider than its column at the smallest size the scale allows (card words
178 → 131 px, hook and claim lines 131 → 96, the count 242 → 178, the name 178 → 131). Rewrite shorter; never
shrink type.

## Fields (`field` on a scene)

All centred on the anchor, right of x = 1060 (the text column stays paper), printed at 14 px on the black plate's
45° screen, peaking at tone 0.5 and fading out 560 px from the anchor; the hook prints at 24 px, peak 0.36, three
rings (density, owner 2026-10-19).

| Field | What it draws | Its beat (T0) | Fits |
|---|---|---|---|
| `rings` | one source: concentric rings | the rings step out one wavelength | one signal, a ping, a voice, the problem |
| `cross` | two more sources switch on: interference, only the crests print | a source switches on (beats 0 and 1), then the rings step | concurrency, many inputs at once, noise |
| `cells` | the same sources split into cells with paper gutters, each its own rings | one cell darkens: the active one | isolation, separation, sharding |
| `count` | cells round the anchor, one per counted value (golden-angle placement) | a cell per value | the `count` scene's default |
| `rows` | rows of word blocks with a tick in front | the rows scroll up one | logs, transcripts, feeds, files |
| `wave` | a waveform of vertical bars | it advances one group of four bars | audio, a signal, a metric over time |
| `grid` | a grid of cells, some solid | one more cell turns solid | tests passing, tiles done, a chip |
| `none` | paper only | — | the claim's default |

After `quantize`, the next scene prints its field as binary blocks (23 px) instead of dots.

## Transitions (`to` on the outgoing scene)

Library and local (2026-10-19). From `lib/handoffs`: `anchor-swap` draws `scan`, `invert` (its `iris`) and the
pull-back (its `pull`), with this template's worlds, mark and anchor passed in as painters; the pull-back's motion
blur is the hand-off's own (speed-gated). From `lib/transitions` (WebGL): `whip-push` (direction `left`) and
`whiteout-slam` (channel offset off: two inks, no RGB fringe). Kept in `film.js`, because the library modules cannot
express them without changing the look: `morph` and `quantize` (the library `field-morph` prints its own two-source
field and a fixed sprite; here the field is any of the seven tone functions of `fields.js`, and the blocks re-sort
into the next field, so they stay local and are declared as `field-morph`); `collapse` (the library `collapse-burst`
shrinks one centred word into a round accent dot and condenses onto one centred word; here the whole scene collapses
into the anchor and the dots condense onto a two-line, left-set claim; declared as `collapse-burst`); the push-in
before the pull-back (no library step for it). `screen.js` stays local too: the library's `handoffs/halftone.js`
prints round dots only, and the `dot` form variant needs square and line screens (every pitch here is ≥ 7 px, above
the library's flat-tone threshold, so its moiré fallback is not needed). Sub-frame blur uses `lib/canvas.js`
`subframes` (exact sum; the anchor's rise gated by its speed).

Default: `morph` between scenes on the same ground, `whip` across grounds; into a `claim` always `collapse`, into
the `lockup` always `pull`. No device more than three times a film (`morph` and `cut` excepted), the `slam` once,
2–3 peaks (hook, claims, slam, lock-up).

| `to` | What happens round the anchor | Grounds |
|---|---|---|
| `morph` | the field changes its generating function behind a front from the anchor; the word swaps on its baseline (field-morph) | same |
| `whip` | the next card pushes the old one off to the left, a 64-tap motion streak over 0.75 frame, landing on the beat; the anchor stays put (`lib/transitions` whip-push) | any |
| `scan` | a 4 px hairline sweeps down; above it the next world is already printed (`lib/handoffs` anchor-swap, scan) | any |
| `invert` | a disc opens from the anchor onto the other ground (`lib/handoffs` anchor-swap, iris, its radius re-timed so the change peaks on the cut) | must change |
| `quantize` | a front from the anchor turns the field's dots into binary blocks, which re-sort, inside out, into the next field's blocks (field-morph, quantize) | same |
| `slam` | the frame exposes to paper over a beat, two frames of paper, the next word lands with blur and scale decaying in 0.45 s (`lib/transitions` whiteout-slam, a beat either side of the cut); once a film, a T3 | into `card` or `count` |
| `cut` | a plain cut on the beat | any |
| `collapse` | into a `claim` (fixed): the scene shrinks into the anchor, it squashes and holds (anticipation), bursts on the bar line; the dots fly out and condense onto the claim's letters (collapse-burst) | → paper |
| `pull` | into the `lockup` (fixed): the claim leaves, the camera pushes into the anchor while the mark's rings print round it (silence), then pulls back on a log scale to the whole mark; the rings outside the mark fade, the anchor lands in its place (anchor-swap, pull-back) | → paper |

## Variants

Colour: the three presets in `palettes.js`. Form: `dot`, the shape of every halftone mark (fields, the anchor, the
mark); the default `round` renders exactly as before the option existed.

| `dot` | Each cell prints | Reads as |
|---|---|---|
| `round` (default) | a round dot whose area is the tone; past 78.5 % neighbours touch and the cell closes | newsprint, the classic AM screen |
| `square` | a square turned with the screen, side = pitch · √tone | a coarser, more mechanical screen; pixel-adjacent, near the quantized blocks |
| `line` | a bar one pitch long and tone × pitch thick, so a row of cells is one line of varying width | an engraver's line screen: banknote and stock-certificate print |

Angles, rulings, timing and layout are the same in all three.

## Shortest cut

For a reel or a sting: `edges: 'cut'` puts the anchor in place on frame 0 (no rise), so the first frame is already
the mode's world; the lock-up's last bar holds after its second move, so its last half second is settled. The
shortest chain is `card` → `lockup`: 6 bars = 12 s at 120 bpm, 11.25 s at 128, with a four-word lock-up line (the
phrase rounding goes to the lock-up); with the name alone, 4 bars = 8 s at 120, 7.5 s at 128. A film that opens on a
card has no hook peak; it is a fragment, not a film, and `npm run fit` reports its tiers.

## Fixed parts

The anchor point (1440, 540); the text column x 150–1130 (margin 150 px); baselines (card label 380, word 590, line
680; count value 610, line 700; hook and claim lines 520 / 520 + 1.08 × size); the screen angles (black 45°, process
ink 15°); the mark's screen (7 px at the lock-up, scaling with the camera); the anchor's paper knock-out with a 3 px
trap; type knock-outs 7 % of the size; the push-in scale (the opening's 24 px screen again); the paper grain
(overlay 5 %, one fixed tile: it belongs to the paper, not the film); sub-frame motion blur (6 samples over half a
frame) on the anchor's rise, the collapse, the burst and the pull-back.

## Example content (shipped)

A made-up subject, "parley-2", a speech model that pulls the voices of a room apart from one microphone and writes
down who said what, live (not the source sample's subject; replace all of it, the mark included). Its mark is a
microphone capsule (the anchor) and three arcs of sound; the film's rings are those arcs. It fits 16 bars = 32.0 s at
120 bpm, `npm run fit` with no errors and no warnings:

hook `Everyone talks / at once.` → `CROSSTALK` (cross) → `SPLIT` (cells) → whip → count `12` voices (ink) →
quantize → `WRITTEN` (rows as blocks) → whip → `S4` “ship it on friday” → whip → `S9` “no, monday” → scan → `S4`
“friday. final.” (the same voice, the same waveform) → morph → `LIVE` (rows) → invert → `ON DEVICE` (grid, ink) →
collapse → claim `Every voice, / its own words.` → pull → `parley-2` / `speech model · out today`.

Order follows the product's pipeline (a mixture → separated → counted → written → said → live → on the device), not
a fixed card-run; tiers: T0 median gap 1 beat (max 1.75), T1 12 compositions (median 2.5 s, CV 0.45), T2 4 (quantize
9.75 s, invert 19.1 s, collapse 21.4 s, pull-back 26 s), T3 3 (hook 0.5 s, claim 22 s = 69 %, climax; lock-up 26 s).

### Alternate example: a text model

`examples/text-model.content.js`: "quire-3", a made-up text model that reads a whole archive in one pass and
answers with the page behind every sentence. Its mark is three lines of text with a cursor at the end of the last
(the cursor is the anchor); the mark has no arcs, so `lambda` and `ringAt` are the line pitch. It fits 16 bars =
32.0 s at 120 bpm, `npm run fit` with no errors and no warnings:

hook `Ask the whole / archive.` → `READ` (rows) → `FOUND` (cells) → whip → count `14` sources (ink) → quantize →
`CITED` (rows as blocks) → whip → `ASK` `> notice period?` (rings, mono) → scan → `ANSWER` `30 days [412]` (rows,
mono) → morph → `STREAMED` (wave) → invert → `ON PREM` (grid, ink) → collapse → claim `Every sentence, / with its
source.` → pull → `quire-3` / `text model · out today`. Tiers: T0 median gap 1 beat (max 1.75), T1 11 compositions
(median 2.5 s, CV 0.38), T2 4, T3 3 (claim 22 s = 69 %, climax).
