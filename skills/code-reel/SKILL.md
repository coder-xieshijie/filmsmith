---
name: code-reel
description: Short technical films made by any coding agent, drawn and scored entirely in code (HyperFrames) from a mode template. Ten modes — Thread, Ink, Plakat, Blueprint, Phosphor, Tally, Trace, Morph, Halftone, Pulse — each with palette presets, a form variant, a scene registry and a renderable template; length follows the content, pace is brisk, every render is measured. Use when asked to make, remake or restyle a launch, promo, teaser, showreel, data story or explainer video for a technical product, or to choose a visual style for one.
descriptions:
  zh-Hans: 任何编码 Agent 都能用的技术短片制作：画面和配乐全部由代码生成（HyperFrames），从模式模板出发。十种模式：一线 Thread、落墨 Ink、招贴 Plakat、蓝图 Blueprint、荧屏 Phosphor、算筹 Tally、演算 Trace、一笔 Morph、网点 Halftone、节拍 Pulse，各带配色预设、形态变体、登记场景库和可直接渲染的模板；片长由内容决定，节奏轻快，每次渲染都有测量。用于给技术产品制作、重做或换风格的发布片、宣传片、预告、showreel、数据片、讲解片，或为一支片选视觉风格。
displayNames:
  zh-Hans: 代码胶片 CodeReel
---

# CodeReel

Ten ways to film your code. Makes a short technical film — a technology demo, a technical report or explainer, a technical product launch — from a brief, its length computed from the content, with no person on screen: pick a **mode**, copy its template, fill `content.js`, render. Every picture is drawn in code and every sound is synthesised in code (a generated music track can replace the bed), so a film needs only a coding agent that can run shell commands. The skill stands on a theory of taste ([foundations](references/foundations.md)), ten [core principles](references/principles.md) derived from it and from the owner's verdicts, one shared [system](references/system.md) of colours, type, space and motion, and ten modes that apply them to one visual language each.

The house style for every mode: **brisk, direct and clean** — something changes on about every beat, each change brings one new thing, and the viewer never waits for the film — and **clean is not plain**: few elements, each moving fluidly enough to hold the eye ([principles 4–6](references/principles.md)).

## Requirements

- Any coding agent that can run shell commands. `SKILL_ROOT` below is the folder that holds this `SKILL.md`.
- Node 22 or newer, `ffmpeg` and `ffprobe` on PATH. `new-film` checks them and stops with a message if one is missing.
- Network while a film is set up and rendered: fonts from a pinned google/fonts commit and the pinned GSAP build from the npm registry (both stored in the film folder), the first run of `npx hyperframes@0.8.163` (which also fetches its headless Chrome), and at render time the HyperFrames compiler may fetch font faces from Google Fonts as well. Offline rendering is not verified. Keep the hyperframes version the templates pin; do not upgrade it inside a film.
- On-screen text is English in this version; when the user asks for Chinese or another script, say the templates do not set it yet.

## Modes

| Mode | 中文 | Looks like | Form variant | Pick it for |
|---|---|---|---|---|
| [thread](references/modes/thread.md) | 一线 | One line that becomes everything, no cuts | `thread`: even rule or swelled line | Showreels of a video, motion or rendering toolchain |
| [ink](references/modes/ink.md) | 落墨 | Heavy type slammed on every beat, an ink dot that blooms into colour | `typeWidth`: compressed or extended type | Name reveals, launch stings, one-line claims |
| [plakat](references/modes/plakat.md) | 招贴 | Moving international-style posters, one signal colour | `form`: square or diagonal fields | A claim plus steps and the person who decides |
| [blueprint](references/modes/blueprint.md) | 蓝图 | One engineering drawing drafted sheet by sheet, amber stamps | `linework`: ink or pencil | Systems and workflows with parts and sign-offs |
| [phosphor](references/modes/phosphor.md) | 荧屏 | Night terminal, one phosphor accent, launch HUD | `screen`: CRT raster or flat | CLI and developer tools |
| [tally](references/modes/tally.md) | 算筹 | One square per item, regrouping chart to chart | `mark`: square, dot or Isotype glyph | Counts, shares, dataset stories |
| [trace](references/modes/trace.md) | 演算 | Dark live diagram of an algorithm's state | `stroke`: vector or sketch | How a mechanism or algorithm works |
| [morph](references/modes/morph.md) | 一笔 | One ink shape climbing point → line → plane → solid → interface → mark, no cuts | `corners`: round or cut | Developer tools and interface products: one source becomes every surface |
| [halftone](references/modes/halftone.md) | 网点 | Two-ink print: a piece of the mark holds still while every world is printed round it, then pulls back to the whole mark | `dot`: round, square or line screen | Model and product launches: a few features, one number, the name |
| [pulse](references/modes/pulse.md) | 节拍 | A question acted out as a query: one word a beat, grounds flipping along one hue, one whiteout for the answer | `aperture`: cut or round | Version releases and benchmark answers: one measured conclusion |

Every mode has colour presets (on its card) and one form variant, both set in `content.js`; the default renders as before. Every card lists its use cases with a worked example and marks the best fit. The names before 2026-10-19 (`thread-reel`, `ink-beat`, `swiss-poster`, `blueprint-drafting`, `terminal-launch`, `unit-data`, `diagram-explainer`) still work in `new-film`.

Choosing rules and the mode card format: [references/modes/README.md](references/modes/README.md). Modes do not mix. Themes (narrative skeletons and rules by kind of film): [tech-product-launch](references/themes/tech-product-launch/README.md) for thread, ink, plakat, blueprint, phosphor, morph, halftone and pulse, [tech-explainer](references/themes/tech-explainer/README.md) for tally and trace.

## Workflow

### 1. Clarify

Skip what the user already gave; ask the rest, the mode first. Ask in plain conversation, at most three questions at a time; when a gap does not block the start, assume and say so. Every film is 16:9, 1920×1080, for landscape full-screen playback; when asked for a vertical or square film, say the skill does not make one.

| # | Question | Why |
|---|---|---|
| 1 | What is the content: a tool, a claim with steps, a system, a name, a reel, numbers, a mechanism? | Decides the mode ([selection table](references/modes/README.md#choosing-a-mode)); propose one and say why |
| 2 | Where do the facts come from (repo, doc, dataset, algorithm)? | Every fact on screen comes from it; every number is computed |
| 3 | Platform, and a target length if any? | Length is computed from the content ([principle 5](references/principles.md)); a target moves the tempo inside the mode's range, then scenes are cut or added |
| 4 | Which palette preset? | Presets only, listed on the mode card; no custom hex values |
| 5 | Hard constraints (must show, must not show, URL, name)? | Avoid rework |
| 6 | Music: can this agent call a music-generation API? | If yes, a generated bed at the film's tempo replaces the synthesised one ([system](references/system.md#sound-recipes)); if not, the synthesised bed is used and the hand-over says so |

Done when the mode, the source and the preset are named, the music source is known, and the target length if there is one.

### 2. Scaffold

```bash
node <SKILL_ROOT>/scripts/new-film.mjs <mode> <film-dir> --palette <id>
```

This checks Node and FFmpeg, copies the template, adds the shared runtime as `lib/` (stamped with `lib/VERSION`), writes the `PLAN.md` skeleton, downloads the fonts listed in the template's `fonts.json` from a pinned google/fonts commit and the pinned GSAP build into `lib/vendor/`; it stops if any of them fails, so a film never renders in a fallback face or depends on a CDN. A template that needs a variable font's axes declares them in `fonts.json` (`weight` and `stretch` ranges, see [CONTRACT.md](assets/templates/CONTRACT.md#fonts)). Then read the mode card and the folder's `TEMPLATE.md` in full: the scene registry, each slot's character limit and the fixed choreography live there. Done when you can name every scene type the mode offers.

### 3. Concept and beat plan

`new-film` has written a `PLAN.md` skeleton into the film folder. Fill it before touching `content.js`; a film without a plan is not rendered ([principle 10](references/principles.md)):

1. **Concept sentence**, in the form "In this film, [something only this product has] becomes [the mode's signature device]", and the rival test: with the nearest competitor in the sentence it must no longer hold. Then the through-line (the object or frame that carries the eye from first to last frame).
2. **Ban list**: start from the mode card's Factory defaults and [ai-tells.md](references/ai-tells.md); add anything too close to the nearest reference film.
3. **Nearest reference and motif table**: name the closest reference film and list the motifs the film shares with it; in a mode with a known reference, more than half shared fails P1.
4. **Beat plan**: one row per scene — scene type, on-screen copy and which of it is primary or glance text, the fact's source, what this scene *becomes* in the next one, and where the music breaks for reading or drops for the key moment. Lengths are not chosen: write the scenes into `content.js` and run `npm run fit`, which prints each scene's start, beats, reading need, the pad before a turn and its share of the phrase rounding, and the film's length, writes `renders/timing.json`, and copies the table into `PLAN.md` between its `fit` markers. `npm run fit` stops while `PLAN.md` is missing and warns while it still has unfilled `<!-- fill -->` parts.

Before writing copy, read the Length table in the mode's `TEMPLATE.md`: it says which slots of each scene count as primary text and how they enter, so each state can be budgeted instead of discovered. Done when every scene type is in the registry, every string fits its character limit, every number names the code that computes it, and `npm run fit` reports no errors. Character limits are only a first filter: a slot's width can depend on its neighbours, so the pixel check is the red banner in step 4. On a template whose rules declare timing API 3, an error means the film breaks one of the four tiers of change ([principle 5](references/principles.md)): more than five words of primary text entering at once (eight for a claim, read in a marked pause), a hold after a landing over two beats, a composition over 6 s, a gap of more than four beats without a change, or the wrong number or placement of expressive transitions and peaks. Split long lines into phrases that enter one after another first, then make repeated labels glance text, then split the scene; never shrink the type or speed past the reading floor. Under the timing table `npm run fit` prints the tier measures; a template still on API 2 keeps its page limits (twelve primary words, a step's hold one bar and the last one and a half, a page four bars) and shows the tiers as an INFO note.

### 4. Fill and frame first

Edit `content.js` (and `data/` or `run.js` where the mode uses them); never type `duration` or scene `bars` to hit a length. Then render stills of the key frames and look at them before animating (the script runs `fit` first, so the stills use the current length):

```bash
npm run snapshot -- --at <t1>,<t2>,<t3>
```

A red banner on a still names a slot whose text is wider than its box: shorten that text. Fix any frame that fails a core principle or a mode principle: information text under 25 px, unreadable text, more than three type levels, two protagonists, a second accent, clipped or overflowing copy, anything from [ai-tells.md](references/ai-tells.md). Done when each key frame passes the mode card's P0 checks.

### 5. Render

```bash
npm run film        # fit → audio → check → render, writes renders/film.mp4
```

`npm run check` must report 0 errors. Its warnings are judged against the checklist: a contrast warning is acceptable only on text that is still entering (typing, fading in) and is read once landed; any other warning is fixed or listed under Known issues. Sound follows `content.js` on the same beat grid; to use generated music instead, render it at the film's fitted tempo and length (`renders/timing.json`), save it under `assets/audio/`, and set `content.bed = { file, offset }` (see the mode's `TEMPLATE.md`).

### 6. Measure and review

```bash
node <SKILL_ROOT>/scripts/check-film.mjs renders/film.mp4 --film-dir .
sh <SKILL_ROOT>/scripts/contact-sheet.sh renders/film.mp4 renders/contact-sheet.jpg 20
```

`check-film` reads `renders/timing.json` and measures the render against it: format and length, loudness with short-term and momentary jumps, black frames, flashes by area, key events on the beat (within 2 frames) with a picture event and a sound onset (≥ 3 dB within 1 frame), still stretches per scene inside the content mask against a grain-aware noise floor, the pace (no long run of near-still beats, no more than half the film near-still), holds settling, hand-offs, runs of equal-length scenes, and the four tiers of change on the declared events (T0 gaps, T1 composition lengths, T2 expressive transitions, T3 peaks, hold lengths), which FAIL only for templates on timing API 3; picture onsets, large-area changes and the loudest moment are pixel and signal estimates beside them. Smallest text, text contrast, type levels, accent area, octave balance, four-bar repetition and limiting are pixel or signal estimates, reported as INFO. An item with nothing to measure reports N/A, not PASS; `--json` gives each result with the checklist item it serves.

Then walk [references/checklist.md](references/checklist.md) and the mode card's checks: P0 from the bottom of the pyramid up, then judge from the top down (fit, freshness, texture). Measure before changing anything; fix the cause, then re-measure. Done when every P0 passes and every P1/P2 miss is fixed or written under "Known issues" in the film's README.

### 7. Hand over

Give the MP4 path, the contact sheet, and a README with the plan, the mode and preset, the music source (synthesised or generated), commands, the `check-film` report and known issues; say "not yet confirmed by ear" unless someone has listened. Ask for the user's verdict and quote it back verbatim with the date; when the user is not available, write "verdict pending" and stop.

### Maintainers: from verdict to rule

Only for whoever maintains this skill's source; a film's maker stops at step 7. A verdict does not edit a mode card or the [principles](references/principles.md) directly. First place it on a layer of the pyramid and check it against [foundations.md](references/foundations.md#who-decides): at layers 1–2 the standard decides, at 3–4 domain consensus unless a departure is written with its reason, at 5–6 the owner picks between candidates the theory judges equally good. A tendency becomes a rule after two consistent verdicts or one A/B comparison. Show the owner any conflict with the theory, then propose the edit citing the date, and apply it once agreed.

## Core principles

Full text, theory and evidence in [references/principles.md](references/principles.md). Premise: technical videos, no person on screen. Gates first; a film that fails one is not shown. Where a verdict and the theory disagree, the theory wins ([who decides](references/foundations.md#who-decides)).

1. **Readable before beautiful** — information text ≥ 25 px (main text ≥ 40 px), contrast ≥ 4.5:1, reading by tier (primary 0.3 s a word in order, glance ≥ 1 s, word-at-a-time), −14 LUFS with short-term loudness ≤ integrated + 5 LU and a restrained arrangement.
2. **Precision is a gate** — aligned, consistent, computed; exact text, numbers and logos in code.
3. **One idea per beat, one protagonist per frame** — at most three type levels (within 15 % is one level, neighbours ≥ 1.25 apart); emphasis by scale and isolation.
4. **Transform at the turns, grow every state out of the last** — related transformations are the default change, a cut where there is no relation; expressive devices (T2) about every 8–12 s, one device ≤ 3 times and never twice in a row unchanged; 2–3 marked peaks (T3); transitions stay clean. Prefer a hand-off from `runtime/handoffs/`, else a frame-level transition from `runtime/transitions/` ([transitions.md](references/transitions.md)).
5. **Motion is a function of time, locked to the beat, and brisk** — key events on the beat, other cuts on any beat; four tiers of change: a micro change (T0) at a median of ≤ 2 beats and never > 4 beats apart, compositions (T1) a median 2–3 s and ≤ 6 s, holds 0.2 s to 2 beats; reading stays 0.3 s a word with ≤ 5 primary words per state (a claim ≤ 8, in a pause); length follows content, phrase rounding spread over the scenes.
6. **Texture decides how good a passing film is; clean is not simple** — fluid motion, motion blur, grain, light where things have volume; organic material flows; never at the cost of clarity; flat print may leave out blur if its card says why.
7. **One system, one accent, one meaning** — accent, status, category and effect colours; the accent ≤ 10 % as a mark; one type scale per mode; a through-line or a frame of real information.
8. **No people; the picture is technical** — graphic, typographic, diagrammatic or drawn.
9. **The style points at the content** — choose the mode by what the content is; a mode chosen by form draws one scene from a real technical artefact.
10. **Borrow grammar, not layout** — `PLAN.md` with the concept sentence and its rival test, a ban list from the Factory defaults and the AI tells, and the motif table before the picture.

## Files

```
code-reel/
├── SKILL.md
├── references/
│   ├── foundations.md      theory: style vs taste, three layers of taste, the six-layer pyramid, where values come from
│   ├── principles.md       the ten core principles with theory and verdict dates
│   ├── system.md           the shared layer: neutrals, accents, named colours with provenance, type pairing and scales, space, corners and strokes, motion and sound recipes
│   ├── checklist.md        P0/P1/P2 for every film
│   ├── ai-tells.md         dated list of devices that make a film read as made by default; every ban list includes them
│   ├── transitions.md      both transition layers, their tiers, the mode → transitions table and the borrowing rule
│   ├── modes/              mode index, selection table, one card per mode
│   └── themes/             per-theme narrative skeletons and rules (tech-product-launch, tech-explainer)
├── assets/
│   ├── runtime/            shared code copied into every film as lib/: timing (length from content, the four tiers of change), motion, rng, beat, canvas (with speed-gated motion blur), text, boot, audio kit, font and GSAP setup
│   │   ├── handoffs/       object-level hand-offs: one object carried from scene to scene
│   │   └── transitions/    frame-level transitions between two rendered frames
│   └── templates/          one renderable template per mode; CONTRACT.md is the template contract
└── scripts/
    ├── new-film.mjs        scaffold a film from a mode: prerequisite check, template, lib/ with VERSION, PLAN.md skeleton, pinned fonts and GSAP
    ├── check-film.mjs      measure a render against renders/timing.json: format, loudness and jumps, flashes, key events (beat, picture, sound), stills, pace, settling, hand-offs, rhythm, the four tiers of change; INFO estimates of text, accent, picture onsets and sound balance
    ├── lib/                check-film's measurement modules (media, picture, motion, flash, audio, text, timing)
    ├── contact-sheet.sh
    ├── loudness.sh         loudness summary with the −14 LUFS / −1.5 dBTP gate
    └── selftest.mjs        self-test for contributors and users: prerequisites, then every mode scaffolded, fitted, checked and stilled (red banner, black frame); --variants, --render <mode>
```
