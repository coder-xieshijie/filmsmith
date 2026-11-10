---
name: keynote-video
description: Makes short music-driven films for a technical product — launch, teaser, showreel, data story, a mechanism explained — drawn and scored entirely in code (HyperFrames), composed from bricks on a narrative skeleton; on-screen text in English or Chinese, chosen from the material (English by default); no voice-over, no people. Use when asked to make, remake or restyle such a film, or to choose a visual style for one.
descriptions:
  zh-Hans: 为技术产品制作由音乐驱动的短片（发布片、预告、showreel、数据片、机制讲解），画面与配乐全部由代码生成（HyperFrames），由积木按骨架组合；屏幕文字默认英文，支持中英，按物料定语言；无旁白、无人物。用于制作、重做或换风格这类短片，或为它选视觉风格。
displayNames:
  zh-Hans: 片匠 · 发布片
---

# keynote-video

Makes a short technical film — a technology demo, a technical report or explainer, a technical product launch — from a brief, its length computed from the content. By default the film is composed: two or three styles serve as references, the film gets one look of its own, and its scenes are bricks picked slot by slot along an arc. When the content falls squarely in one style and speed matters, the film runs that style's template as it ships. Every picture is drawn in code and every sound is synthesised in code (a generated music track can replace the bed), so a film needs only a coding agent that can run shell commands. `SKILL_ROOT` below is the folder that holds this `SKILL.md`.

The skill stands on a theory of taste ([foundations](references/foundations.md)), ten [core principles](references/principles.md) derived from it and from the owner's verdicts, one shared [system](references/system.md) of colours, type, space, motion and language, a library of bricks ([references/bricks.md](references/bricks.md)), and a set of styles, each a recipe of bricks with a template as its example film.

## Scope and fixed rules

These hold for every film, in every step.

- **Format.** Every film is 16:9, 1920×1080, for landscape full-screen playback. When asked for a vertical or square film, say the skill does not make one.
- **Language.** On-screen text is English or Chinese, chosen from the material: Chinese material makes a Chinese film, English material an English one. When the material's language is unclear or mixed, ask; when there is no material to go by, English. Every style sets both languages; the rules for Chinese (reading rate, sizes, setting, fonts) are written once in [system](references/system.md#language). Another script: say the skill does not set it.
- **Colour.** Palette presets only, as listed on the look brick or the mode card; no custom hex values. A brand colour the user asks for becomes a new preset first ([system](references/system.md#a-preset-from-a-brand-colour)).
- **Facts.** Every fact on screen comes from the source the user named; every number is computed by code.
- **Length.** Lengths come from `npm run fit` and the bricks' own plans; never type `duration` or scene `bars` to hit a length.
- **Plan first.** A film without a filled `PLAN.md` is not rendered ([principle 10](references/principles.md)); a composed film's `PLAN.md` holds its composition table ([creative.md](references/creative.md#the-composition-table)).
- **Pinned tools.** Keep the hyperframes version the templates pin; do not upgrade it inside a film.
- **House style.** Brisk, direct and clean — something changes on about every beat, each change brings one new thing, and the viewer never waits for the film — and clean is not plain: few elements, each moving fluidly enough to hold the eye ([principles 4–6](references/principles.md)).

## Core principles

Full text, theory and evidence in [references/principles.md](references/principles.md). Gates first; a film that fails one is not shown. Where a verdict and the theory disagree, the theory wins ([who decides](references/foundations.md#who-decides)).

1. **Readable before beautiful** — information text ≥ 25 px, Chinese ≥ 28 px (main text ≥ 40 px), contrast ≥ 4.5:1, reading by tier (primary 0.3 s an English word or 6 Chinese characters a second, in order; glance ≥ 1 s; word-at-a-time), −14 LUFS with short-term loudness ≤ integrated + 5 LU and a restrained arrangement.
2. **Precision is a gate** — aligned, consistent, computed; exact text, numbers and logos in code; quoted numbers keep their source's terms; no number animates through other digits.
3. **One idea per beat, one protagonist per frame** — at most three type levels (within 15 % is one level, neighbours ≥ 1.25 apart); emphasis by scale and isolation.
4. **Transform at the turns, grow every state out of the last** — related transformations are the default change, a cut where there is no relation; expressive devices (T2) about every 8–12 s, one device ≤ 3 times and never twice in a row unchanged; 2–3 marked peaks (T3); transitions stay clean. Prefer a hand-off from `runtime/handoffs/` or a motion brick, else a frame-level transition from `runtime/transitions/` ([transitions.md](references/transitions.md)); vary the axis of motion between chapters ([families](references/transitions.md#families)).
5. **Motion is a function of time, locked to the beat, and brisk** — key events on the beat, other cuts on any beat; four tiers of change: a micro change (T0) at a median of ≤ 2 beats and never > 4 beats apart, compositions (T1) a median 2–3 s and ≤ 6 s, holds 0.2 s to 2 beats; reading stays at its floor with ≤ 5 primary words per state (a claim ≤ 8, in a pause); length follows content, phrase rounding spread over the scenes.
6. **Texture decides how good a passing film is; clean is not simple** — fluid motion, motion blur, grain, light where things have volume; organic material flows; never at the cost of clarity; flat print may leave out blur if its card says why.
7. **One system, one accent, one meaning** — accent, status, category and effect colours; the accent ≤ 10 % as a mark; one type scale per film; a through-line or a frame of real information.
8. **No people; the picture is technical** — graphic, typographic, diagrammatic or drawn.
9. **The style points at the content** — choose the reference styles by what the content is; a style chosen by form draws one scene from a real technical artefact.
10. **Borrow grammar, not layout** — `PLAN.md` with the concept sentence and its rival test, a ban list from the recipes, the Factory defaults and the AI tells, and the motif table before the picture.

## Requirements

- Any coding agent that can run shell commands.
- Node 22 or newer, `ffmpeg` and `ffprobe` on PATH. `new-film` checks them and stops with a message if one is missing.
- A Chinese film also needs `uvx` ([uv](https://docs.astral.sh/uv/)) on PATH: its setup cuts the Chinese faces to the film's characters with fontTools.
- Network while a film is set up and rendered: fonts from a pinned google/fonts commit and the pinned GSAP build from the npm registry (both stored in the film folder), the first run of `npx hyperframes@0.8.163` (which also fetches its headless Chrome), and at render time the HyperFrames compiler may fetch font faces from Google Fonts as well. Offline rendering is not verified.

## Styles

A style is a recipe: one reference look, the bricks it recommends for each slot of its arc, a ban list, and its template, which renders the style's example film and is what standard mode runs. Pick two or three as references by what the content is ([choosing](references/modes/README.md#choosing-reference-styles)).

| Style (recipe) | Fits | Template (mode card) |
|---|---|---|
| [thread](references/recipes/thread.md) | The showreel of a video, motion or rendering toolchain: one line becomes each step it performs | [thread](references/modes/thread.md) |
| [ink](references/recipes/ink.md) | A name, a slogan or a one-line claim: teasers and stings slammed one word a beat | [ink](references/modes/ink.md) |
| [plakat](references/recipes/plakat.md) | A clear claim plus steps or decisions, with a person at the start and the end | [plakat](references/modes/plakat.md) |
| [blueprint](references/recipes/blueprint.md) | A system, pipeline or workflow drawn as a machine with parts, flows and sign-offs | [blueprint](references/modes/blueprint.md) |
| [phosphor](references/recipes/phosphor.md) | CLIs, developer tools, agents and CI: anything whose home is a terminal | [phosphor](references/modes/phosphor.md) |
| [tally](references/recipes/tally.md) | Counts of many items: how many, which kinds, what share, how it changed | [tally](references/modes/tally.md) |
| [trace](references/recipes/trace.md) | One mechanism or algorithm run live on a tiny input, its state merging or reducing | [trace](references/modes/trace.md) |
| [morph](references/recipes/morph.md) | Developer tools and interface products where one source becomes the whole product | [morph](references/modes/morph.md) |
| [halftone](references/recipes/halftone.md) | A model or product launch with a mark: a few features, one number, the name | [halftone](references/modes/halftone.md) |
| [pulse](references/recipes/pulse.md) | A release that answers one measured question with a single conclusion | [pulse](references/modes/pulse.md) |
| [handset](references/recipes/handset.md) | A launch that can be seen on the product's own screen, in real captures | [handset](references/modes/handset.md) |
| [exhibit](references/recipes/exhibit.md) | Claims printed in several real artefacts: tables, charts, product UI, a report | [exhibit](references/modes/exhibit.md) |
| [dossier](references/recipes/dossier.md) | Claims already published on a few pages, shown where printed and how measured | [dossier](references/modes/dossier.md) |
| [strip](references/recipes/strip.md) | Reels of a product's real outputs, side by side at their real lengths, one picked | [strip](references/modes/strip.md) |
| [split](references/recipes/split.md) | Developer tools whose input maps line by line to a real output | [split](references/modes/split.md) |
| [scroll](references/recipes/scroll.md) | A product whose argument is already written on its own long page | [scroll](references/modes/scroll.md) |
| [stream](references/recipes/stream.md) | Agent desks and task schedulers: work sent out, run in parallel, checked and brought back | [stream](references/modes/stream.md) |

Every template has colour presets (on its mode card) and one form variant, both set in `content.js`; the variant's default is the template as shipped. `new-film` also accepts the aliases `thread-reel`, `ink-beat`, `swiss-poster`, `blueprint-drafting`, `terminal-launch`, `unit-data` and `diagram-explainer`. Themes (narrative skeletons and rules by kind of film): [tech-product-launch](references/themes/tech-product-launch/README.md) for every style but tally and trace, [tech-explainer](references/themes/tech-explainer/README.md) for those two.

## Workflow

Composing is the default; say which way the film is made in step 2. Skip what the user already gave; ask the rest in plain conversation, at most three questions at a time; when a gap does not block the start, assume and say so.

### 1. Topic, material and language

| # | Question | Why |
|---|---|---|
| 1 | What is the content: a tool, a claim with steps, a system, a name, a reel, numbers, a mechanism? What material is there (docs, screenshots, product UI, official charts, logos, footage)? | Decides the reference styles and what the bricks are filled with |
| 2 | Where do the facts come from (repo, doc, dataset, algorithm)? | Every fact on screen comes from it |
| 3 | Platform, and a target length if any? | Length is computed from the content ([principle 5](references/principles.md)); a target moves the tempo inside the range, then scenes are cut or added |
| 4 | Hard constraints (must show, must not show, URL, name)? | Avoid rework |
| 5 | Music: can this agent call a music-generation API? | If yes, a generated bed at the film's tempo replaces the synthesised one ([system](references/system.md#sound-recipes)); if not, the synthesised bed is used and the hand-over says so |

Then set the language from the material (fixed rules above) and say which; ask only when it is unclear or mixed. Done when the content, the material, the source, the language and the music source are known, and the target length if there is one.

### 2. Reference styles, or standard mode

Pick two or three styles from the table above as references and give one reason each, in terms of the content ([creative.md](references/creative.md#picking-reference-styles)). A reference lends its grammar and its bricks; the film is not obliged to look like it.

Use **standard mode** instead — one style's template, presets, scenes and transitions as shipped — only when the content falls squarely in one style's "Fits" line and the user wants it fast. Then step 3 is choosing a preset on its mode card, step 4 is the template's scene registry, and the composition table is left out of step 5.

### 3. One look

Choose the film's one look: one palette preset, one type system, one through-line ([creative.md](references/creative.md#one-look-a-film)). It is usually the look of the reference that fits the content best; the bricks borrowed from the others are drawn in it. Done when `PLAN.md` can name the preset, the type families and scale, the accent's one meaning and the through-line.

### 4. Arc and bricks

Choose an arc (a sequence of slots: hook, problem, turn, demo, climax, proof, claim, rest, lockup), usually a reference's, and fill each slot from [references/bricks.md](references/bricks.md): read the catalogue by slot, open the candidates' `CARD.md`, and keep the ones whose intent and content match the material ([creative.md](references/creative.md#finding-bricks)). Every state has one primary sentence; the rest is glance text ([creative.md](references/creative.md#primary-and-glance-text)). Done when every slot names a brick, its source and what of the material goes into it.

### 5. Plan

`new-film` writes a `PLAN.md` skeleton into the film folder (step 6 runs it; write the plan before touching `content.js`):

1. **Concept sentence**, in the form "In this film, [something only this product has] becomes [the style's signature device]", and the rival test: with the nearest competitor in the sentence it must no longer hold. Then the through-line (the object or frame that carries the eye from first to last frame).
2. **Composition table** (composed films): one row per brick — its id, where it comes from, how it is reskinned into the film's look, and which slot it fills ([creative.md](references/creative.md#the-composition-table)).
3. **Ban list**: start from the reference recipes' ban lists, the mode cards' Factory defaults and [ai-tells.md](references/ai-tells.md); add anything too close to the nearest reference film.
4. **Nearest reference and motif table**: name the closest reference film and list the motifs the film shares with it; more than half shared fails P1.
5. **Beat plan**: one row per scene — scene type or brick, on-screen copy and which of it is primary or glance text, the fact's source, what this scene *becomes* in the next one, and where the music breaks for reading or drops for the key moment. Lengths are not chosen: write the scenes into `content.js` and run `npm run fit`, which prints each scene's start, beats, reading need, the pad before a turn and its share of the phrase rounding, and the film's length, writes `renders/timing.json`, and copies the table into `PLAN.md` between its `fit` markers. `npm run fit` stops while `PLAN.md` is missing and warns while it still has unfilled `<!-- fill -->` parts.

Done when every scene is in the registry or the composition table, every string fits its slot's limit, every number names the code that computes it, and `npm run fit` reports no errors. Character limits are only a first filter: a slot's width can depend on its neighbours, so the pixel check is the red banner in step 6.

On a template whose rules declare timing API 3, a `fit` error means the film breaks one of the four tiers of change of [principle 5](references/principles.md) (primary words per state, hold length, composition length, gaps without a change, or the number and placement of expressive transitions and peaks). Split long lines into phrases that enter one after another first, then make repeated labels glance text, then split the scene; never shrink the type or speed past the reading floor. Under the timing table `npm run fit` prints the tier measures. A template on timing API 2 keeps its page limits (twelve primary words, a step's hold one bar and the last one and a half, a page four bars) and shows the tiers as an INFO note.

### 6. Scaffold, fill and frame first

```bash
node <SKILL_ROOT>/scripts/new-film.mjs <style> <film-dir> --palette <id>
```

In a composed film `<style>` is the reference whose look the film takes. This checks Node and FFmpeg, copies the template, adds the shared runtime as `lib/` (stamped with `lib/VERSION`; the bricks are under `lib/bricks/`, driven through `createBrick` in `lib/bricks/index.js`, usage at the top of that file), writes the `PLAN.md` skeleton, downloads the fonts listed in the template's `fonts.json` from a pinned google/fonts commit and the pinned GSAP build into `lib/vendor/`; it stops if any of them fails, so a film never renders in a fallback face or depends on a CDN. A template that needs a variable font's axes declares them in `fonts.json` (`weight` and `stretch` ranges, see [CONTRACT.md](assets/templates/CONTRACT.md#fonts)). Read the mode card and the folder's `TEMPLATE.md` in full: the scene registry, each slot's character limit and the fixed choreography live there; read each composed brick's `CARD.md`. Scenes the template does not have are written film-locally from their bricks, against the template's registry and timing rules, so `npm run fit` and `check-film` measure them like any other.

Before writing copy, read the Length table in `TEMPLATE.md` and the slots of each brick's card: they say which slots count as primary text and how they enter, so each state can be budgeted instead of discovered. Edit `content.js` (and `data/` or `run.js` where the template uses them). Then render stills of the key frames and look at them before animating (the script runs `fit` first, so the stills use the current length):

```bash
npm run snapshot -- --at <t1>,<t2>,<t3>
```

A red banner on a still names a slot whose text is wider than its box, or a character no loaded face covers: shorten the text or fix the font. Fix any frame that fails a core principle or a style's principle: information text under its floor, unreadable text, more than three type levels, two protagonists, a second accent, clipped or overflowing copy, anything from [ai-tells.md](references/ai-tells.md). Done when each key frame passes the P0 checks of the checklist and the mode card.

### 7. Render

```bash
npm run film        # fit → audio → check → render, writes renders/film.mp4
```

`npm run check` must report 0 errors. Its warnings are judged against the checklist: a contrast warning is acceptable only on text that is still entering (typing, fading in) and is read once landed; any other warning is fixed or listed under Known issues. Sound follows `content.js` on the same beat grid; to use generated music instead, render it at the film's fitted tempo and length (`renders/timing.json`), save it under `assets/audio/`, and set `content.bed = { file, offset }` (see the template's `TEMPLATE.md`).

### 8. Measure and review

```bash
node <SKILL_ROOT>/scripts/check-film.mjs renders/film.mp4 --film-dir .
sh <SKILL_ROOT>/scripts/contact-sheet.sh renders/film.mp4 renders/contact-sheet.jpg 20
```

`check-film` reads `renders/timing.json` and measures the render against it: format and length, loudness with short-term and momentary jumps, black frames, flashes by area, key events on the beat (within 2 frames) with a picture event and a sound onset (≥ 3 dB within 1 frame), still stretches per scene inside the content mask against a grain-aware noise floor, the pace (no long run of near-still beats, no more than half the film near-still), holds settling, hand-offs, runs of equal-length scenes, and the four tiers of change on the declared events (T0 gaps, T1 composition lengths, T2 expressive transitions, T3 peaks, hold lengths), which FAIL only for templates on timing API 3; picture onsets, large-area changes and the loudest moment are pixel and signal estimates beside them. Smallest text, text contrast, type levels, accent area, octave balance, four-bar repetition and limiting are pixel or signal estimates, reported as INFO. An item with nothing to measure reports N/A, not PASS; `--json` gives each result with the checklist item it serves.

Then walk [references/checklist.md](references/checklist.md), the mode card's checks and, in a composed film, the composition checks of [creative.md](references/creative.md#when-to-say-no): P0 from the bottom of the pyramid up, then judge from the top down (fit, freshness, texture). Measure before changing anything; fix the cause, then re-measure. Done when every P0 passes and every P1/P2 miss is fixed or written under "Known issues" in the film's README.

### 9. Hand over

Give the MP4 path, the contact sheet, and a README with the plan (the composition table included), the reference styles, the look and preset, the language, the music source (synthesised or generated), commands, the `check-film` report and known issues; say "not yet confirmed by ear" unless someone has listened. Ask for the user's verdict and quote it back verbatim with the date; when the user is not available, write "verdict pending" and stop.

## Files

```
keynote-video/
├── SKILL.md
├── references/
│   ├── foundations.md      theory: style vs taste, three layers of taste, the six-layer pyramid, who decides, where values come from
│   ├── principles.md       the ten core principles with theory and verdict dates
│   ├── system.md           the shared layer: neutrals, accents, named colours with provenance, type pairing and scales, language, space, corners and strokes, motion and sound recipes
│   ├── checklist.md        P0/P1/P2 for every film
│   ├── ai-tells.md         dated list of devices that make a film read as made by default; every ban list includes them
│   ├── creative.md         composing a film: reference styles, one look, primary and glance text, finding bricks, the composition table, when to say no
│   ├── bricks.md           the brick catalogue: every brick by category, use and slot, with its intent; the cards are next to the code
│   ├── transitions.md      both transition layers (frame-level and hand-offs), their tiers, families by axis of motion, the style → transitions table, the real-asset rules and the borrowing rule
│   ├── recipes/            one recipe per style: reference look, recommended bricks by slot, ban list, template → bricks, Chinese
│   ├── modes/              the choosing table, one card per template (its look, presets, principles and checks)
│   └── themes/             per-theme narrative skeletons and rules (tech-product-launch, tech-explainer)
├── assets/
│   ├── runtime/            shared code copied into every film as lib/: timing, motion, rng, beat, canvas, text, boot, audio kit, font and GSAP setup
│   │   ├── bricks/         motions, scenes, props, looks, sounds and arcs: one folder each (code, CARD.md, posters), index.json, index.js
│   │   ├── handoffs/       object-level hand-offs: one object carried from scene to scene
│   │   └── transitions/    frame-level transitions between two rendered frames
│   └── templates/          one renderable template per style; CONTRACT.md is the template contract
└── scripts/
    ├── new-film.mjs        scaffold a film from a style's template (step 6)
    ├── check-film.mjs      measure a render against renders/timing.json (step 8)
    ├── lib/                check-film's measurement modules
    ├── contact-sheet.sh
    ├── loudness.sh         loudness summary with the −14 LUFS / −1.5 dBTP gate
    └── selftest.mjs        prerequisites, then every template scaffolded, fitted, checked and stilled; --modes, --variants, --render <mode>
```
