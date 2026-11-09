# Stream (`stream`)

One thread of light runs through the whole film and is the product's attention: it pierces a scattered desk and pulls it together, becomes the spine every interface block hangs on, sends each task out as a star, links a job's stars into a constellation, forks into three cards, sweeps the sky to gather every star into one panel, lies flat under the claim and winds back into the mascot. Aesthetic anchor: "like a night sky being tidied by one strand of light, with small pieces of the product hung on it".
Theme: tech-product-launch (agent desks, schedulers, orchestration products) · Template: `assets/templates/stream/` · tempo 120–132 BPM, default 128 (length follows the copy; the shipped example fits 91.9 s in English and 97.5 s in Chinese) · timing API 1 (see Known issues) · Language: English or Chinese (`lang`), the only mode that sets Chinese · Status: owner-accepted 2026-11-09 (style sample in both languages, made from an accepted launch film; the threaded line chosen as the direction 2026-11-04 because it shows the scheduling and the unity of a whole task; the Chinese reading rate set 2026-11-09). Values are tagged `standard` / `borrowed` / `derived` / `owner` / `draft` as in [foundations](../foundations.md#where-values-come-from); `borrowed (source)` means taken from the accepted source film.

## Fits / does not fit

Fits: products that **send work out and bring it back** — agent desks, task schedulers, orchestration and background-job products, assistants that run several things in parallel. Their story is dispatch, parallel work, checking, memory, gathering; the thread is the product keeping track of all of it. Also an opening or closing sequence for such a launch.
Does not fit: a video, motion or rendering toolchain's reel (that is `thread`: there the line *becomes* each object of the pipeline, for a tool whose output is film; here it stays a line and *carries* things, for a product that sends work out, runs it in parallel, checks it and brings it back). A single claim or name (ink). A system diagram with parts and flows (blueprint). A release shown on the product's own screen with real captures (handset): stream redraws the interface as small neutral blocks and never fills the frame with it. Numbers about many items (tally). A product with nothing to send out — without dispatch the stars and the gathering are decoration.

## Use cases

Examples are fictional. ★ is the best fit.

| Use | Example | What the film says |
|---|---|---|
| ★ Launch of an agent desk | `Skein` (the shipped example): sessions pile up on a desk until one thread takes them over; tasks become stars; a job becomes a constellation; results are checked; the workspace remembers; only one thing needs you | "hand it off, get it back checked" |
| Launch of a background-job or workflow scheduler | a queue runner: the evening becomes a night of jobs, the gate is its retry-on-failure, the panel is its dashboard with one failed job waiting | "nothing gets lost, you hear about the one that needs you" |
| Feature film for an assistant's long-running "projects" | the constellation and the three cards carry it: a workspace that keeps its summary, memory and files between tasks | "the task ends, the workspace stays" |
| Closing sting of any multi-agent launch | `close` + `lockup` alone (not built as a cut-down yet, see Known issues) | "one thread gathers everything" |

## Mode principles

1. **One thread through the whole film is the attention.** The film has one stroke: the thread that pierces the opening pile, the spine, the hooks and beams that branch from it, the strands, the sweep, the baseline, the rule under the name. It may branch (hooks, beams, strands) but never breaks and never appears as a second independent line. A line that folds back or snaps reads as broken (owner, 2026-11-09, on a rejected version). *(Narrows 4, one through-line; and 7, one meaning per colour.)*
2. **Interfaces are small blocks hung on the thread, never the main picture.** A chat, a task row, a list, a panel each hangs off the spine by a hook or a beam, sits in the night with sky around it, and folds back into the thread when it is done. No block fills the frame, and the camera never moves into one to make it the scene: a version that kept the camera on content panels read as a screen recording and lost the life of a launch film (owner, 2026-11-09). *(Narrows 8, the picture is technical, and 9, the style points at the content.)*
3. **No hard cuts.** Every scene enters from the thread and leaves into it: blocks unfold from hooks and fold back, rows shrink into stars, cards wind back along their strands, the panel opens out of the point the stars flowed into. Text enters with a short blur and leaves the same way. The only full-frame change is the opening desk sinking into the night. *(Narrows 4, transform at the turns.)*
4. **One accent colour.** The thread, the stars, their glow and the single "needs you" are the accent; nothing else is. On the paper blocks the accent appears only as its ink tone (`accentInk`), for the one status word and the one pill. Done is a neutral tick, failure is grey text, queued is a dashed ring. *(Narrows 7.)*
5. **Whole – part – whole.** Detail is shown by enlarging a card together with its text, in place on its strand, one card after another, and returning to the whole (owner, 2026-11-05: rounded cards, a local zoom, whole – part – whole). Never a cut to a full-screen detail. *(Narrows 3, one idea per beat.)*
6. **Every task is a star and stays.** Whatever the film sends out stays in the sky, dimmed, until the closing sweep gathers it; the panel's count is the number of stars. The "many" is shown by stars, not by long lists. *(Narrows 2, precision is a gate: the numbers on screen are the film's own.)*
7. **Lively, not a recording.** Something on the thread moves in every reading hold (light flowing down the spine, a star twinkling, the feed scrolling) and every scene peaks once; the film runs on the owner's taste over general rules where they disagree. No decoration beyond the thread, stars, blocks and the ambient dust: no icons as ornament, no recycle bins or document stacks (owner, 2026-11-09: props that carry nothing made a version worse). *(Narrows 5 and 6.)*

## Palette presets

| id | name | fits | ground / field | thread (accent) / glow | text / text2 on night | paper / ink / ink2 | accentInk |
|---|---|---|---|---|---|---|---|
| `night` | Night sky, blue thread (source) | default; agent, scheduling, developer products | `#05070D` / `#0B1426` | `#4DB5FF` / `#D6EEFF` | `#EEF3FF` / `#A9B6CC` | `#F5F2EC` / `#1C1E24` / `#575B66` | `#175F9C` |
| `ember` | Warm dark, amber thread | warmer brands, writing and research tools | `#0A0705` / `#1C130C` | `#FFB347` / `#FFE2B8` | `#FBF1E6` / `#C9B7A2` | `#F7F2EA` / `#211A14` / `#5F554B` | `#834C00` |
| `aurora` | Deep teal night, mint thread | infrastructure, data, ops | `#03090A` / `#0A1C1E` | `#4FE0B8` / `#CFFBEF` | `#EAF8F4` / `#A2C2BB` | `#F2F4F1` / `#172020` / `#52605E` | `#096A50` |
| `mono` | Graphite night, white thread | when the brand colour must stay out | `#070708` / `#16171A` | `#E9EAEE` / `#F4F5F8` | `#F2F2F4` / `#AEB0B7` | `#F3F3F1` / `#1A1A1C` / `#58595E` | `#1A1A1C` |

Full role list (panel, bubble, user bubble, desk wallpaper) in the template's `palettes.js`. `night` keeps the source film's sky and thread (`borrowed (source)`); its lock-up gradient is not carried. `ember`, `aurora`, `mono` are `derived` and `draft` until a film uses them.

Contrast, computed (`node palettes.js`, WCAG): text on ground/field 16.0–18.4; text2 on ground/field 8.3–10.5; ink on paper 14.9–15.6; ink2 on paper 5.9–6.5; ink on bubble 12.9–13.4; white on the user bubble 13.6–14.9; accentInk on paper 5.9–15.6 and on the bubble 5.2–13.4; desk taskbar 15.4–16.0. Measured on rendered frames by `hyperframes check` (2026-11-09, English film): `night`, `aurora`, `mono` with the desk opening 66/66 text checks pass WCAG AA; `ember` with the night opening and the mascot lock-up 62/62; the Chinese sample (`night`) 96/96.

## Variants

**Colour**: the four presets above (`palette`).

**Form**: `opening`, how the film's first scene shows the pile the thread gathers.

| Value | What changes | Choose it for | Source |
|---|---|---|---|
| `desk` (default) | a daytime desktop in accent-tinted wallpaper: three session windows, four alerts, a sticky note, fourteen dialog copies cascading, a cursor that never gets to click; freeze "Until today."; the mascot drops in, the thread pierces every item and reels them in; the emptied desk sinks into the night | the product replaces juggling several sessions or windows | the source film's opening (owner, 2026-11-09: the pile-up of tasks and the thread pulling them in singled out) · `borrowed (source)` |
| `night` | the same items as dark cards scattered over the night sky, drifting; threaded and reeled in the same way; no desktop | the brand should stay in the night from the first frame; no desktop metaphor | an earlier accepted cut's "gathered at night" opening (2026-11-05), redrawn · `derived` |

**Ending**: `lockup` is a switch of the last scene, like plakat's `opening`, not a second form axis: `name` (default; the mascot winds to the centre and becomes the point the name opens out of, the thread settles as a rule under it) or `mascot` (the name opens and the mascot hops from the top of the spine onto the end of the wordmark; for a product with a mascot people should remember).

**Language**: `lang`, `'en'` (default) or `'zh'`: fonts, reading time, line breaking, entrance per word or per character, tracking and leading, `<html lang>` (the template's `TEMPLATE.md`, "Language"). Write the copy in the film's language; the switch does not translate. Choose it from the material, ask when it is mixed or unclear, English when there is nothing to go by.

Both defaults render the shipped samples; `night`, `mascot` and the other palettes were rendered as stills and passed `hyperframes check` (2026-11-09).

## Accent role

- **Accent (the thread)** marks one thing: the product's attention. It is the thread, the stars it sends, the beams and strands that branch from it, the glow where it touches something, and the single "needs you". As a mark it stays under 8 % of the frame; the only larger accent areas are glows (the climax point, the gate flash in `core`).
- **On paper** the accent is `accentInk`: the "needs you" word, its pill and its row dot, the nudge's dot, the running spinner's arc. Nothing else on paper is coloured.
- **No status colours.** Done = neutral tick, failed = grey text (`text2`), queued = dashed ring and half-bright star. The source's orange "needs you" and green ticks are not carried (a second hue would break principle 4).
- **Change of ground** happens once: the desk opening's wallpaper (accent-tinted) sinks into the night. The `night` opening has none.

## Type

| Role | Family | Licence | en px | zh px |
|---|---|---|---|---|
| Name in the lock-up | DM Sans 700 | OFL | 168 | 168 (the name stays as the brand writes it) |
| Claim, three words | DM Sans 600 (+ Noto Sans SC 600) | OFL | 66 / 54 | 64 / 56 |
| Chapter caption | 600 | OFL | 58 | 58 |
| Card title (×1.45 when enlarged) | 600 | OFL | 42 | 42 |
| Chat bubble, note | 400 / 600 | OFL | 34 | 34 |
| Sub-caption, list/panel row title, tagline | 500–600 | OFL | 30 / 30 / 40 | 30 / 30 / 40 |
| Row detail, star label, card row, status | 400–600 | OFL | 25–29 | 25–29 |

DM Sans variable (opsz, wght 100–1000) is the only Latin family; Chinese adds Noto Sans SC variable (wght 100–900) after it in the stack, cut to the film's characters at setup (the template's `tools/fonts.mjs`, about 170 KB for the example; needs `uvx`). Fonts download at setup from the pinned google/fonts commit and are never committed. Chinese sets with +0.02 em tracking and 1.5 leading, Latin with −0.01 em and 1.32. Information text ≥ 25 px; main text ≥ 40 px except the hung blocks' text (30–34 px), which is read inside a block the size of a phone screen — the source's choice (brief: "the main shot sees the whole"); the reading that matters sits in the 58 px caption. Below 25 px: only the opening pile, shrinking or stacked (texture, `data-layout-ignore`).

## Type scale

Named series **26 · 30 · 34 · 42 · 58 · 66 · 168** (about ×1.2–1.4 per step, `derived` from the source film's 25.2 · 32 · 40 · 64 · 96). At most three levels per frame outside the persistent mascot name: caption 58 / bubble 34 / row 26–30; cards 58 / 42 / 27; claim 66 / 54; lock-up 168 / 40.

## Frame and grid

1920 × 1080. Persistent: the mascot at (230, 156), its name at (292, 134), the spine x 230 from y 236 to 1010 (from the end of the opening to the closing sweep). Caption x 1000, y 112, one line, 860 px wide. Left column: the hung chat block (290, 236, 640 × 774), or lowered (290, 560, 600 × 450) with the task list beside it (940, 560, 900 × 450). Right region x 1060–1840: task row at y 650, workspace region (1060, 236, 780 × 760), gate at x 1400, cards x 1100 (640 wide) at y 330 / 540 / 750, an enlarged card at x 900 ×1.45, the closing panel (1060, 250, 780 wide) opening from (1060, 600). The claim's baseline thread at y 640, words at x 700 / 1060 / 1420. Deliberate overlaps: the opening pile; the enlarged card over its neighbours; the chat feed scrolling out under the block's top edge.

## Scenes

| Type | Purpose | Example length (en, 128 BPM) |
|---|---|---|
| `open` | Scattered → threaded → sunk into the night (first peak, the hook) | 14.5 s |
| `intro` | The mascot's name; the first block unfolds from the spine with two lines from the product | 7.5 s |
| `ask` | One ask → a task row hung on a beam → done → shrinks into a star | 9.4 s |
| `evening` | The block lowers and grows a task list; every ask launches a star; a burst; the list counts | 7.5 s |
| `constellation` | A workspace; three jobs and a plan launched along beams; results flow back; the constellation links (second peak) | 14.5 s |
| `verify` | The gate stops the plan once, sends it back, passes it; the chat block folds into the spine | 6.1 s |
| `cards` | Strands fork from the spine into three cards; each enlarged in turn; the three again | 13.6 s |
| `close` | The spine retracts; the thread sweeps the sky in three passes, catches every star, straightens, they flow into one point, which opens as the task panel (climax); one "needs you"; the thread lies flat under the claim and winds back | 11.3 s |
| `lockup` | `name` or `mascot` | 7.5 s |

Every length is the scene's choreography plus the reading time of its copy in its language (`sched.js`); none is typed. Slots, limits (en / zh) and the worked example: the template's `TEMPLATE.md`.

## Signature transformations

- **Pierce and reel in** (open): the thread's head runs a smooth path through the centre of every item, lighting each as it passes; taut on a hit; then every item slides back along the thread into the mascot, the nearest first.
- **Hook unfold** (intro onward): a point lights on the spine, a short light reaches right, and the block opens from its left edge along it.
- **Row to star** (ask, evening): a finished row shrinks into its status ring and leaves as a star with a short comet tail, arcing up into the sky.
- **Out and back along a beam** (constellation): a star travels out along an arc from the spine; later a bead of light runs back along the same arc and the job's status turns to done.
- **Strand to enlarged card** (cards): the strand follows the card's left edge as the card grows; the next card grows as the previous one shrinks, so the zoom never returns to an empty frame between parts.
- **Gather** (close): one sweep, three passes, catching each star it passes; the caught stars ride the thread as it straightens and flow into its end, which opens into the panel.
- **Lay flat and wind back** (close → lockup): the tether bends down into a baseline for the three words, then winds back into the mascot, which becomes the point the name opens from.

## Motion

Entrances: text blur 8 → 0 px with opacity over 0.24–0.3 s, ease-out cubic (`borrowed (source)`); bubbles 0.36 s expo, the product's from its left edge (scale 0.7 → 1), the user's from 40 px right (`borrowed (source)`); blocks unfold 0.45 s ease-in-out cubic from the hook (`derived`); block reshape one beat, ease-in-out cubic (`borrowed (source)`, `cardAt`); star flight 0.6–0.8 s ease-in-out quad with an 8-step tail (`borrowed (source)`); gather sweep 3.7 beats, straighten 1.5 beats, flow 1.9 beats, panel 0.5 s expo (`derived` from the source's 4.4 / 1.5 / 2.2 beats, tightened); words land 0.35 s expo from 26 px above (`derived`). Exits take 0.22 s (`borrowed (source)`). Camera: locked, no camera moves; the field pushes 5 % over the whole film (`borrowed (source)`). Ambient: dust drifting 2–7 px/s, bokeh, light flowing down the spine at 0.11 of its length a second, stars twinkling ±14 % (`borrowed (source)`). Text enters a character at a time in Chinese (0.04 s apart) and a word at a time in English (0.07 s apart) (`derived`, 2026-11-09).

## Sound

Bed `terminal` (filtered synth pulse, soft kick, off-beat hats, sub, pad) at the film's tempo, sections from `sched.js`: build while the desk piles up, break on the freeze, drop on the three peaks (threaded, constellation, panel), quieter reading passages under copy, outro under the lock-up. One sound per picture event at the same frame: pops for windows and bubbles, ticks as the thread pierces each item and as the sweep catches each star, a pluck per star launched, a chime per result returned, a stamp at the gate, impact + chime + 4 dB duck on each peak, and the film's only three-note alert with a 6 dB duck on the "needs you". Mastered to −14 LUFS, true peak ≤ −1.5 dBTP after the AAC encode (`lib/audio` master). Measured on the samples: English −14.0 LUFS, true peak −2.7 dBTP, LRA 4.0; Chinese −14.1 LUFS, −2.5 dBTP, LRA 3.7 (2026-11-09).

## Factory defaults

What the template produces untouched; a film's PLAN.md ban list starts here: the `night` palette and blue thread; the desk opening with three sessions, four alerts and the sticky note's two questions; "Until today."; the yarn-ball mascot; chat block on the left, captions top-right; the evening's burst of ten; the three-job constellation; the gate; Summary / Memory / Files; the four-row panel with one "needs you"; "You do three things: Ask / Decide / Review"; the name lock-up with a rule; the Skein copy.

## Don'ts

- A block that fills the frame, or a camera move into a block (principle 2).
- A hard cut or a crossfade between scenes (principle 3).
- A second line that is not branched from the thread; a thread that folds back sharply or breaks (principle 1).
- A second hue: status greens, oranges, reds (principle 4).
- More than one "needs you", or an alert sound anywhere else (the source keeps exactly one).
- Two mascots on screen at once; the mascot clicking or answering for the user (the source film's rule).
- Ornament: icons, document stacks, recycle bins, logos that are not the product's (principle 7).
- The real product's interface copied pixel for pixel (redraw it as neutral blocks; keep the product's words).
- Captions on two lines; Chinese set with Latin tracking or Latin reading time.

## Checks

- **P0 (fails the film).** `hyperframes check` 0 errors. One thread on screen at a time apart from its branches. No hard cut (the desk's sink is a transform, not a cut). The accent appears only in its roles. One "needs you" and one alert sound. Every caption one line (the page shows a red banner otherwise). Chinese: the CJK face loads from the subset and the coverage check of `tools/fonts.mjs` passes (no system fallback). Loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP.
- **P1 (rhythm).** Three peaks: threaded (~14 %), constellation (~50 %), panel (~83 %, the climax). Each bubble and caption holds its reading time for its language (`lang.js`). `check-film` keys (the constellation, the panel, the name) on the beat with a sound. Something moves on the thread in every reading hold.
- **P2 (polish).** Bubbles balanced (no lone last word or character). Stars from the evening leave from their own row. The strand stays attached to its card through the zoom. The panel count equals the stars.

## Known issues

- **Timing API 1.** Each scene is one continuous composition, so the rules mark every type `rest` and the api 3 tiers are INFO only (T1 median 9–10 s; no T2 devices from the libraries; the hand-offs here are the template's own). Declaring `shots` for each block change and naming the thread moves as template devices is the migration.
- **No cut-downs.** All nine scenes are required; `evening` and `verify` should become optional, and `close` + `lockup` should stand alone as a sting.
- **Chinese runs about 6 % longer** (97.5 s against 91.9 s for the same film) because of the reading rule (6 characters a second plus 0.5 s a state, owner, 2026-11-09); the example copy was already tightened for it.
- **Language plumbing in the template.** `lang.js` (reading, limits, line breaking, typing, type per language) and `tools/fonts.mjs` (fonts per language, subset, coverage, `<html lang>`) belong in the shared runtime; the runtime's `cjkCharSec` (9 characters a second) differs from this template's rule.
- **Small type.** Row details, star labels and statuses are 25–27 px, at the information floor and under the 28 px HyperFrames recommends, as in the source film.
- **Evening flash.** The evening's asks stay about 1.5 s each — the "too many to read" is the point, as in the source film.
- **Closing still.** The lock-up holds 5.8 s still (a closing line holds ≥ 6 s for `hyperframes check`); `check-film` warns past 1 bar + 3 s.
- **The `night` opening's scatter** lets cards overlap more than the placement asks for when 22 items share the frame.
- **The desk's sink** shows a hard-edged rectangle shrinking into the night, as the source film did; not yet judged in this template.
- **Not heard on headphones or a phone speaker.**
