# trace template

An algorithm runs live and the picture is its state: chips on a board, a histogram of what it counts, the list of rules it learns, a token bar that shrinks (or grows) with every step, a step counter, captions and a closing thesis card. A concept is one run module; the pieces are shared. Mode card: `references/modes/trace.md`.

## Files

| File | What it is | Edit? |
|---|---|---|
| `content.js` | palette, title, run module + params, HUD words, scenes and copy (optional `bpm`, `target`, `stroke`, `edges`: see Variants) | yes |
| `runs/<name>.js` | a run module: `steps(params)` computes every state and number. Ships `bpe` (example) and `rle` | add one for a new concept |
| `run.js` | the run interface (documented at the top) and its loader | no |
| `timing.rules.js` | how long each scene type needs (timing API 3): its choreography in beats, every move it makes, the text read and its tier, the key events and the four tiers, the tempo range, the expressive transitions (`ENTER`) | no |
| `timeline.js` | lays the fitted scenes out on the clock from `timing.rules.js`; shared by picture and sound | no |
| `pieces.js` | renderer pieces: board, probe (its letters resolve with `lib/handoffs` scramble-resolve), histogram, rule list, token bar, captions (phrases; path-type for the captions on a loop), summary, thesis, HUD, camera, focus | no |
| `fx.js` | measured rich text, colour mixing | no |
| `index.html` | `render(t)` with 8-sample motion blur and seeded grain; the frame-level transitions (`lib/transitions` token-sweep, trace-flow) between two such frames | no |
| `score.mjs` | `diagram` bed + effects from the timeline's events, one sound for each transition | no |
| `tools/validate.mjs` | limits, placeholders, step coverage, transitions and path captions, the fitted timing; prints every caption with numbers filled | run it |
| `tools/check-palettes.mjs` | contrast and colour-vision checks | after palette edits |
| `examples/rle.content.js` | the alt film: rle run, paper palette (fits to 13 bars, 31.2 s at 100 bpm) | copy over content.js to try |

## Commands

```bash
node scripts/new-film.mjs trace <film-dir> [--palette paper]
cd <film-dir>
npm run fit            # each scene's bars, the film's length and the tier line; stamps index.html, writes renders/timing.json
npm run validate       # the run's numbers, every caption filled, limits, chip size, transitions, fit errors; fix all errors first
npm run snapshot -- --at 1.5,5,9,10.2,15,16.2,19.2,21,24,27.5,30   # times from the `npm run fit` table
npm run film           # fit → audio → check → render (renders/film.mp4); under 1 min for 36 s (8 sub-frames per frame)
```

## The run interface

`runs/<name>.js` exports `steps(params)`, deterministic, returning `{ rows, steps, probe?, hud0, fills }` — full shape in `run.js`. In words:

- `rows`: the board before the first step, 1–6 rows of tokens (≤ 4 when the film has a `probe` scene: its row sits below the board) `{ t, k, cells? }`, each with a `label` (e.g. `×5`) and a `weight` (how many times the row counts in the token bar).
- `steps[k]`: the histogram shown before the step (`counts.items` with `value` and `from` = how each value adds up, row weight × occurrences; `pick` index or −1; optional `note`), the chips it acts on (`hi`), every row after it with `map` (new chip j ← old chips), the `rule` line appended to the list, and the counters after it (`hud.a`, `hud.b`).
- `probe` (optional): an input the run never saw and how the learned rules replay on it (`rule` index per step, or −1).
- `fills`: every `{NAME}` the copy may use. Copy never types a number the run computes.

Token kinds are the semantic colours: `base` untouched unit, `active` being counted or acted on now, `learned` what the algorithm produced, `unseen` an input it never saw. One meaning each, all film.

Fused chips animate generically: parts slide together (active), become one chip; when the new text is the parts' concatenation the letters slide into place, otherwise they converge and the new label fades in. The token bar shrinks or grows by `cells`. `bpe` takes `top` (histogram items, default 5).

## Scenes (the registry)

Copy markup: `[[active|…]]`, `[[learned|…]]`, `[[unseen|…]]`; mark only the words that are that kind (`{T0} tokens → [[learned|{TN}]]`, not the whole phrase).

**Captions.** A caption is one line: a string, or an array of phrases that enter one after another on it (`caption: ['Count every [[active|adjacent pair]],', 'weighted by its word.']`). Each phrase is one reading state: ≤ 5 words (api 3, an error in `npm run fit`); the probe's last caption is its claim, ≤ 8. A phrase rises 12 px into place (0.3 s) when the one before has been read, on the line laid out for the whole caption, so nothing already there moves. Whole line ≤ 72 chars after filling (40 px, fitted down to 34 px within 1,400 px); primary text, 0.3 s per word. Keep captions short: the median composition is ≤ 3 s, so a scene rarely has time for more than eight words.

| Type | Purpose | Slots |
|---|---|---|
| `hook` | The input appears as words, splits into chips; the token bar counts in | `caption` or `captions` (2nd at the split) |
| `count` | Step 1's histogram, built item by item: each row's weight flies from its label and becomes a bar segment | `caption` |
| `step` | One step: recount (unless straight after `count`), pick (pop), highlight, fuse, rule appended. The first step after the count is the slow one | `step` (1-based), `caption` |
| `loop` | Further steps compressed (histogram hidden, rule list moves up): highlight, fuse, rule per step | `from`, `to` (default: the rest), `pace` (2 beats a merge, default; 1 for the compressed run into the climax), `caption` |
| `summary` | Camera pushes onto the token bar; the bar's count grows into the enlarged result and shrinks back at the end | `big` ≤ 16 chars (default `{T0} → [[learned|{TN}]]`; when it contains the final count, the count grows into it, otherwise it fades), optional `caption` (it follows the line), `zoom` (1.3) |
| `probe` | The unseen input: its letters resolve left to right (scramble-resolve, through the corpus's own letters); rules replay one per beat and light up; a 0.3 s push lands on the reveal (a second composition, read in a pause), unused rules dim a beat later; at the end the result's chips grow into the thesis's first line | `captions` (2nd at the reveal: the claim, ≤ 8 words), `reveal: 'flow'` (the expressive transition into the reveal; Transitions) |
| `thesis` | The first line grown from the probe's chips, or, when a `step` or `loop` comes right before it, from the board chip the last step fused first (2026-10-19); faded in after any other scene. Later lines one per beat; the stats line part by part (split at `·`, ≤ 5 words each); closing move on the last downbeat | `lines` 1–4 × ≤ 34 chars (≤ 5 words each; the first is the claim), `stats` ≤ 80 (40 px mono, fitted ≥ 34) |

Rules: every run step appears exactly once, in order — normally `step 1`, `step 2`, then one or two loops (`to`, then the rest); a loop with `pace: 1` is the compressed run that speeds up into the summary and the probe (validate checks coverage). Optional per scene: `music: 'intro' | 'build' | 'drop' | 'break' | 'outro'`; `bars` to lengthen a scene for rhythm (the example's hook takes one beat more so the thesis's bar line needs no pad).

Film-level slots: `title` ≤ 16 (serif), `subtitle` ≤ 44 (italic), `hud: { step ≤ 12, a ≤ 12 or null, b ≤ 12, before ≤ 20 ('before merge {k}'), rules ≤ 24 }`.

## Transitions

`enter` on a scene (not the first, not the thesis) names the expressive transition into it (T2, principles 4 and 5). Each is a library device (`references/transitions.md`, mode trace), lasts two beats straddling the cut (one beat of each scene) and lands with a sound. The outgoing scene's captions are read before it starts; the incoming scene's captions start when it ends; its choreography may already move underneath.

| `enter` | Device | What the viewer sees | Use it for |
|---|---|---|---|
| `'path'` | `path-type` (`lib/handoffs`) | The outgoing scene's last caption lies on a thin line; the line rolls up a loop (the sentence riding round it), carries the sentence out and the incoming scene's first caption in, and opens again | a loop whose content is repetition: into the compressed `loop` ("Repeat.") |
| `'sweep'` | `token-sweep` (`lib/transitions`) | The token bar's cells grow into bars that sweep up over the frame (in `learned`), then fall back and uncover the next scene | between the run and the result: into the `summary` |
| `'flow'` | `trace-flow` (`lib/transitions`) | A front carried by a vector field crosses the frame, dragging the old frame along its streamlines into the new | a pass over the data: the recount into `step 2`, or out of the zoomed summary into the probe (the camera stays pushed; the flow carries it home); on the probe, `reveal: 'flow'` (below) |

- **`reveal: 'flow'` on the probe** (2026-10-19): a trace-flow straddling the reveal beat inside the probe, where the run turns from replaying its rules to their result. There is no cut: side A is the probe while its last replay settles, side B the reveal (the push, the claim's caption, the size turning colour), both the run's real state. The reveal waits until the window's first beat is free (the letters resolved, the last replay landed, the first caption read). It always runs left to right, in reading order over the encoded input, so the front has left the caption band's left half when the claim's caption rises there (`variant` `left to right, at the reveal`). It is the film's last T2: without it the last one is the sweep into the summary, 14–17 s before the end, past the 12 s spacing. A probe that already enters by `flow` cannot also reveal by it (validate).
- A device's second use as an `enter` runs right to left (the frames and the output mirrored): the `variant` recorded in `timing.json`, so no repeat is unchanged.
- A caption that rides `path` is one phrase of ≤ 5 words, drawn as plain text centred on its line (the hand-off paints one ink), up to ~80 px above the other captions so the loop and its letters clear the token bar (validate checks). Its loop's circumference takes the longer sentence (radius 56–84 px).
- `path` covers only the caption band: the board and the rule list stay in place, so a loop's last rule line may finish its glance in the loop after it. `sweep` and `flow` cover the whole frame: the outgoing scene's glance text is still ≥ 1 s before the cut.
- How many: one every 8–12 s, so three or four in a 30–40 s film, none more than 12 s from the next or from either end of the film, each device at most three times. The probe and the thesis are the last third of a film; a film with a probe gets its last T2 from `reveal: 'flow'`. A template-local extension (no new module): the mirrored second use, and the path line's position and radius computed from the captions.

Not used by the shipped runs: `re-encode`, `signal-relay`, `stream-brake`, `squash-to-path` (PLAN §4 of the fourth batch). They fit other run modules — a run that has a true second reading of its counts (re-encode), real pipeline stages (signal-relay, node count = step count), a real log or token stream that stops on its verdict (stream-brake), a real execution path that straightens (squash-to-path) — and are drawn by `lib/handoffs` when such a run module is added (mode card, Use cases).

## Fixed parts

- **Frame**: title + italic subtitle top left (baseline 104), step counter and `hud.a` top right, token bar at y 950 with its label and count at x 130, captions at x 130, baseline 872. The board is scaled until its widest row fills x 130–1220 or its rows and the probe row fill y 176–806 (up to 1.3), then centred there; row labels right-aligned beside the chips. Histogram and rule list in the right third, x 1290–1800.
- **Type**: label 26 · text 40 · display (chips 54 × board scale, summary 76, thesis 82); see the mode card's Type scale. Nothing that carries information is under 25 px.
- **Choreography** (beats from scene start, `timing.rules.js` `choreo`): a scene's first caption starts rising 0.25 beat before the scene (while the last one is leaving; at 0.15 beat in the first scene and after the summary or the probe, which end on exit moves; at the end of an incoming transition); its later phrases each 0.15 s before the one ahead has been read; hook rows 0.25 apart, split ≤ 2.4 (later when a first of two captions needs longer), bar count-in from split + 0.75 over 0.75 beat; count items 1 beat apart, the first segment landing (90 %) on the first half beat ≥ 0.25 beat + the flight; the slow step (straight after the count) pick 0.5, highlight 0.75, the fuse (0.6 s) landing on beat 3, rule 3.5; a later step: the histogram regrows at 0, pick 0.75, highlight 1, the fuse landing on beat 2, rule 2.5; loop merges `pace` beats apart (2, or 1), landing on beats 1, 1 + pace …, highlight half a pace before, rule a quarter pace after, the last rule still ≥ 1 s (unless the next loop keeps it in place); summary push 0.1, the count's growth landing on beat 1 (under a sweep, as its bars leave); probe row 0, chips 0.25, their letters resolving over 0.75 beat, 0.04 s apart, replays landing on beats 2, 3, … (after the letters), the reveal (push start, second caption, size colour) on the first beat ≥ 0.4 beat after the last replay, unused rules dimming a beat later; thesis lines one per beat, the stats parts half a beat apart from 0.75 beat after the last line. Exits are timed back from the scene's end: the summary line returns over its last 0.36 s and the camera over its last 0.2 s (before an outgoing transition, before it starts; before a flow the camera stays pushed); the probe's last 0.7 s is the morph into the thesis's first line, landing on the thesis's bar line, with the camera returning over its first 0.2 s. A `step` or `loop` followed by the thesis ends the same way: its last 0.7 s is the morph of the last step's first fused chip into the claim's frame. None of these depends on the scene's fitted length: a longer scene holds longer.
- **Landing settle**: a fused chip (board and probe) and the claim line swell by at most 3.5 % from their landing frame and come back, critically damped (one swell, no oscillation, about 0.3 s).
- **Focus**: only the regions in play are lit — count: board + histogram (bar dimmed); loop: board + rules (histogram gone, rules move up); summary: bar only; probe: probe row + rules (board and bar dimmed); thesis: card + dim bar, lit again on the last downbeat. A region comes up over 0.4 s and goes down over 0.24 s; dimmed text stays ≥ 3:1.
- **Camera**: still, except the summary push (zoom 1.3 onto the bar, 0.32 s) and the probe reveal (1.06 about the frame centre, 0.32 s, starting on the reveal beat), each returning in 0.2 s, accelerating (the probe's during the morph; the summary's at once on the far side of a flow).
- **Texture**: 8 sub-frames over 1/60 s centred on every frame; counters and flying labels read the frame time; seeded grain. Inside a frame-level transition, each side is such a frame.

## Variants

Two content fields change the form without changing what the film says (2026-10-19). Defaults render exactly as before.

| Field | Values | What changes |
|---|---|---|
| `stroke` | `'vector'` (default), `'sketch'` | `sketch`: every box (chips, highlight boxes, histogram segments, the rule flash, the morph frame) is drawn hand-style after rough.js / Handy: each edge twice, slightly bowed, ends wandering ≤ 2 px and overshooting the corner ≤ 4 px (× board scale); dashed boxes once. The wobble is seeded by the object's identity (a chip is the span of original units it covers), so a sliding chip keeps its outline and a landed one never boils. Histogram segments keep their exact ends (only their long edges wobble); token-bar cells, the path line and all text stay exact. Choreography, colours and timing are unchanged |
| `edges` | `'fade'` (default), `'cut'` | `cut`, for a film cut into a reel with an outside transition: no 0.4 s fade in from the ground, the title and counters are on from the first frame, and the last 0.5 s holds the settled card instead of fading. Start such a film without a `hook` (validate refuses one), so the first frame shows the board already split. Length and timing are unchanged |

The colour variants are the palette presets below; `stroke` is the form variant; `edges` only serves editing. A film that opens on its loop gets no drop key on its first frame (nothing comes before it to drop from).

**Short cut** (for a reel, api 3): `edges: 'cut'`, `bpm: 104`, six merges, scenes `step 1` (`bars: 1.25`) → `step 2` → `loop` (`to: 3`) → `loop` (`pace: 1`, `enter: 'path'`) → `thesis` (one line and a short stats line): 16.2 s, 5 compositions, median 2.9 s; without a probe the claim is the climax (71 %) and the closing move the lock-up. Shorter cuts (loop → thesis, two loops → thesis) fail the T1 median or CV, or hold more than two beats before the thesis's bar line.

## Palettes

`ink` (source, dark), `paper` (light), `chalk` (green-black board). Semantic colours change hue between presets (e.g. `paper` active is blue, since yellow fails on paper) but never meaning. All pass `npm run palettes`.

Decided 2026-10-18: `ink` keeps manim's `TEAL_C` and `RED_C` as learned and unseen; the presets `ink-h9` and `ink-far` (hues turned off manim's) are deleted (accepted on the recommendation; the owner did not compare it shot by shot). `ink`'s active is now Manim Community's `YELLOW_C` `#F7D96F` (was `#FFD23F`, which matched no named manim colour), and `paper`'s faint is `#D3D9DE` (was the warm `#DDD8CC`; now the hue of the text greys, L* kept) (both settled by theory; the owner did not object).

## Length and tempo

No duration and no bars are typed: `npm run fit` (`lib/timing.js` `fit()` with `timing.rules.js`, timing API 3) sizes every scene from its copy and the run, rounds it to one beat, and the film's length is the sum rounded to one bar. Each scene needs the longest of three paths:

- **motion**: the last landing of its choreography, then its hold (0.5 beat; the loop's last rule line ≥ 1 s), plus the scene's exit (the summary's return, the probe's hand-off);
- **primary reading**: caption phrases in sequence at 0.3 s per word with every `{PLACEHOLDER}` filled from the run, read through `ctx.reading()`; each caption's first phrase is still 0.3 s after it starts rising, each later phrase once the one before has been read, and the last leaves before the scene's exit or before the transition out starts; the summary line and the thesis's lines and stats parts are primary too;
- **glance**: the last rule line, the last histogram row and the probe's size, each still ≥ 1 s. When the next scene keeps it lit and in place (the count's last row into step 1, a step's rule line into the next step, a loop's last rule into the next loop, also across a path) the second may finish in the next scene; not into a loop from a step (the rule list rises), into the summary (it dims) or across a sweep or a flow.

**The four tiers** (api 3, principles 4 and 5, owner-approved 2026-10-19): every move of the choreography and every phrase is listed with its duration (`movesOf`); those that bring something new are the T0 micro events, and the still windows between all moves are the holds (each 0.2 s – 2 beats; the probe's reveal, read as a claim, is a pause ≤ 2 bars). T1: every scene start, plus the probe's reveal (a shot: the camera pushes in on the result); each composition ≤ 6 s, the thesis excepted (a rest). T2: the `enter` transitions and the probe's `reveal` flow. T3: the hook's split (hook), the probe's reveal (the climax, at 60–85 % of the film), the claim the thesis lands (lock-up).

| Type | Moves (T0) | Exit | Ceiling |
|---|---|---|---|
| `hook` | each row, the split, the count-in | — | 6 s |
| `count` | the heading, each item's flight and segments (1 beat apart) | — | 6 s |
| `step` | recount, pick, highlight, fuse, rule line | — (morph 0.7 s when the thesis follows) | 6 s |
| `loop` | the rule list rising; per merge highlight, fuse, rule line | — (morph 0.7 s when the thesis follows) | 6 s |
| `summary` | push, the line landing | line returns 0.36 s | 6 s |
| `probe` | row, letters resolving, each replay, reveal (with `reveal: 'flow'`, a trace-flow over the beat either side of it), unused rules dimmed | morph 0.7 s (camera returns in its first 0.2 s) | 4.5 bars: two compositions of ≤ 6 s |
| `thesis` | lines, stats parts, the bar lighting | 0.5 s fade | rest (turn, absorbs the rounding) |

- **Grid, turns and rounding.** Scenes are whole beats; the thesis is the only turn, so it starts on a bar line (the wait is the probe's pad, part of its pause) and its first line lands there as the claim. The total is rounded up to one bar, all of it to the thesis (`phraseShareBeats: 0`: shared out, a beat would lengthen a still hold past 2 beats); the thesis ends with the closing move on its last downbeat. Was two bars (the bed's two-bar motif) before api 3: that left up to 7 beats of extra closing hold.
- **What fit cannot see**: the T1 median (≤ 3 s), the CV (≥ 0.3), a run of three compositions that speeds up or slows down, and a short run into the climax depend on the whole film. At 100 bpm most trace scenes take five beats (3.0 s); at the default 96 they are 3.1 s, over the median's top. So a film either runs at 100–104 bpm or keeps most of its scenes to four beats. Shape the run with the copy (a scene is rarely longer than its captions), with `pace: 1` on the last loop, and with a hand `bars` on an early scene when the thesis's bar line would otherwise pad the probe (a padded probe is a long composition).
- **Key events** (`renders/timing.json`): fuse and probe-replay landings at 90 % of the fuse's move (`land`), the summary line and the reveal (`accent`), the claim, the end; holds; hand-offs at the three transformations (or the board → thesis morph in a film without a probe); the tier arrays; content mask y 150–1080.
- **Tempo.** 96 bpm by default (the owner's choice of the source film's tempo, 2026-10-17), 88–104 allowed (`content.bpm`). Both shipped examples set `bpm: 100` for the T1 median (above). More copy or more scenes make a longer film; the tempo does not change to hide it.
- **`target`** (seconds, optional): the tempo moves inside 88–104 to meet it, skipping tempos at which a scene would exceed its ceiling; what the range cannot reach is reported as bars to cut or add. A `bars` value on a scene only lengthens it on purpose; below the reading need or above the ceiling it is reported and overridden.
- **Music.** The bed's sections follow the fitted scenes and may start on any beat. Optional generated bed: `bed: { file: 'assets/audio/bed.wav', offset }` with `bpm` set to its measured tempo (calm felt piano + warm pad, the source music at 96 bpm); with a fixed `bpm`, `target` is not used.

The example fits to 15 bars, 36 s at 100 bpm (1.25 / 1.75 / 1.5 / 1.25 / 1.25 / 1.25 / 1 / 2.75 / 3 bars; 16 bars, 40 s at 96 before api 3): T0 73 onsets, median gap 0.5 beat, longest 3 beats; T1 10 compositions, median 3 s, CV 0.36; T2 trace-flow (10.2 s), path-type (16.2 s), token-sweep (19.2 s), trace-flow at the reveal (25.2 s; 10.8 s before the end, was 16.8 s with no T2 after the sweep); T3 hook 1.1 s, reveal 25.8 s (72 %, the climax), lock-up 28.8 s. `examples/rle.content.js` fits to 13 bars, 31.2 s at 100 bpm (path, sweep, and a flow at the reveal, which replaced its flow out of the summary: that one left 14.4 s to the end).

## Example content

BPE on the classic corpus `low ×5, lower ×2, newest ×6, widest ×3` (Sennrich et al. 2016): 6 merges, 79 → 35 tokens, vocabulary 10 → 16, the unseen `lowest` splits into `low + est`. A second run, `rle` (run-length encoding of a 16 × 4 picture, 64 → 24 symbols; a noise row grows 8 → 16), uses the same pieces: copy `examples/rle.content.js` over `content.js`.
