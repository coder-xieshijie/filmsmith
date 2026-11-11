---
name: filmsmith
description: Makes technical videos drawn and scored entirely in code (HyperFrames) — a music-driven launch, teaser or showreel with no voice-over, or a Chinese-narrated explainer that teaches a mechanism; scenes are composed from a library of bricks in one shared visual system, on a narrative skeleton, with a style kit or template as the reference look. Use when asked to make, remake or restyle a film for a technical product or an explainer of how something works, to choose a visual style for one, or to make a silent loop for an article.
descriptions:
  zh-Hans: 用代码生成技术视频（HyperFrames），画面与配乐全部由代码绘制：音乐驱动的发布片、预告、showreel（无旁白），或中文旁白的讲解片（讲清一个技术机制）。画面按叙事骨架从共享的积木库组合，落在同一套视觉系统里，参考风格来自风格模板或风格包。用于制作、重做或换风格这类片子、为它选视觉风格，或制作文章里的无声循环动图。
displayNames:
  zh-Hans: 片匠
---

# filmsmith

Two pipelines, one library. Both draw every picture in code and synthesise every sound in code, so a film needs only a coding agent that can run shell commands.

| The user wants | Pipeline |
|---|---|
| A **film with no voice-over** — launch, teaser, showreel, data story, a mechanism stated in pictures — driven by music and on-screen text, on a beat grid. | [pipelines/launch.md](pipelines/launch.md) |
| An **explainer with Chinese narration** that teaches a mechanism to an audience, timed to the spoken lines and built by a director plus 2–3 segment agents. | [pipelines/teach.md](pipelines/teach.md) |

Pick one before any other step and say which; the two share this file's rules and the library, and nothing else. When a request is both — a narrated launch — the narration decides it: teach. When a silent loop for an article is wanted, that is teach's web unit ([pipelines/teach.md](pipelines/teach.md#silent-loops-for-an-article)).

`SKILL_ROOT` below is the folder that holds this `SKILL.md`; every script finds the others from there, so the folder can live anywhere.

## Rules for both pipelines

These hold for every film, version and stage, including direction samples.

- **Frame.** 1920×1080. Launch is 16:9 for landscape full-screen playback and declines a vertical or square film; teach adds a subtitle band (`y ≥ 880` empty by layout) and a presenter reserve. 30 fps.
- **Facts.** Every fact on screen comes from the source the user named; every number is computed by code. Anything illustrative in teach is labelled 示意.
- **Language.** On-screen text is Chinese or English, chosen from the material: Chinese material makes a Chinese film, English material an English one. When it is unclear or mixed, ask. With no material to go by, launch writes English and teach writes Chinese. Other scripts: both say the skill does not set it.
- **Colour.** Launch uses palette presets only, as listed on the look brick or the mode card — no custom hex; a brand colour becomes a new preset first ([system](references/system.md#a-preset-from-a-brand-colour)). Teach takes its colour from its kit.
- **Pinned engine.** Each pipeline pins its HyperFrames version ([launch](pipelines/launch.md#scaffold), [teach](assets/kits/README.md)); keep it, and never upgrade it inside a film.
- **Deterministic.** A frame depends only on time: `F.rng` / `F.hash`, never `Math.random` or `Date`; one command re-renders the film.
- **Nothing media in version control.** Audio, video and fonts are regenerated or downloaded, never committed.
- **No people.** The picture is graphic, typographic, diagrammatic or drawn. Teach adds exactly two exceptions: the presenter window and sourced footage that supports a claim.
- **Read the usage headers, not the source.** Components, `build/` and scripts carry their usage at the top. Look at contact sheets and review packets, not batches of full-resolution frames.

Both pipelines stand on one theory of taste ([foundations](references/foundations.md)), ten [core principles](references/principles.md) derived from it and from the owner's verdicts, one shared [system](references/system.md) of colour, type, space, motion and language, and a library of [bricks](references/bricks.md) — reusable parts drawn in code, each with a `CARD.md` saying what it does, what material it takes and which pipelines can host it.

## The library

`assets/runtime/bricks/` holds every brick by kind — motion, scene, prop, look, sound, arc — with `index.json` carrying each one's intent, slots and `hosts` (which pipelines can use it). Nothing about a brick is launch-only or teach-only except its `hosts` entry; a brick a pipeline can host is used the same way in both, through `createBrick`, and the catalogue in [bricks.md](references/bricks.md) reads by slot for whichever pipeline you are running. Each pipeline scaffolds with this library copied in as the film's `lib/`.

A style is a recipe of bricks: one reference look, the bricks recommended for each part, a ban list. Launch styles are [recipes](references/recipes/) with a template each; teach styles are [kits](assets/kits/) — a kit is a recipe plus the runnable project that shows it.

## Requirements

- Any coding agent that can run shell commands. Teach dispatches 2–3 segment agents plus a fresh checker, which helps but is not required.
- Node 22 or newer, `ffmpeg` and `ffprobe` on PATH. A script checks them and stops with a message if one is missing.
- `python3` and [uv](https://docs.astral.sh/uv/) for a Chinese film (the font subsetter), and for teach's narration and checks.
- Network while a film is set up and rendered: fonts from pinned URLs, the pinned GSAP build from npm, the HyperFrames package and its headless Chrome, and in teach the whisper `small` model and edge-tts. Every download is pinned and checked where the file is fixed. Offline rendering is not verified.

## Files

```
filmsmith/
├── SKILL.md                 this file: the two pipelines, the rules both keep, the library, requirements
├── pipelines/
│   ├── launch.md            no voice-over: prompt, reference styles, one look, arc and bricks, plan, render, review, hand over
│   └── teach.md             narration first: topic card, voice and timeline, brief, director and segments, checks, review, hand over
├── references/
│   ├── foundations.md       theory: style vs taste, three layers of taste, the six-layer pyramid, who decides, where values come from
│   ├── principles.md        the ten core principles with theory and verdict dates
│   ├── system.md            the shared layer: neutrals, accents, named colours with provenance, type pairing and scales, language, space, corners and strokes, motion and sound recipes
│   ├── checklist.md         P0/P1/P2 for every film
│   ├── ai-tells.md          dated list of devices that make a film read as made by default; every ban list includes them
│   ├── creative.md          composing a film: reference styles, one look, primary and glance text, finding bricks, the composition table, when to say no
│   ├── bricks.md            the brick catalogue: every brick by category, use and slot, with its intent; the cards are next to the code
│   ├── transitions.md       both transition layers (frame-level and hand-offs), their tiers, families by axis of motion, the style → transitions table, the real-asset rules and the borrowing rule
│   ├── teaching.md          teach: content and picture rules, what counts as understood, captions, on-screen language, presenter, tools
│   ├── process.md           teach: the route from topic to final, the three user reviews, the topic card and fact sheet format, rule conflicts, recording the narration
│   ├── roles.md             teach: director / segment / renderer / checker split, concurrency, rework, what each hands back
│   ├── brief-template.md    the brief for agents, in either pipeline
│   ├── recipes/             one recipe per launch style: reference look, recommended bricks by slot, ban list, template → bricks, Chinese; plus one per teach kit
│   ├── modes/               the choosing table, one card per launch template (its look, presets, principles and checks)
│   └── themes/              per-theme narrative skeletons and rules (tech-product-launch, tech-explainer)
├── assets/
│   ├── runtime/             shared code copied into every film as lib/: timing, motion, rng, beat, canvas, text, boot, audio kit, font and GSAP setup
│   │   ├── bricks/          motions, scenes, props, looks, sounds and arcs: one folder each (code, CARD.md, posters), index.json, index.js
│   │   ├── handoffs/        object-level hand-offs: one object carried from scene to scene
│   │   └── transitions/     frame-level transitions between two rendered frames
│   ├── templates/           one renderable template per launch style; CONTRACT.md is the template contract
│   └── kits/                teach's style kits (terminal-ledger, blueprint-zoom), each a starter project with CARD.md, components and ref/
└── scripts/
    ├── new-film.mjs         launch: scaffold a film from a style's template
    ├── new-film-teach.mjs   teach: scaffold a version from a kit, or a web unit
    ├── check-film.mjs       launch: measure a render against renders/timing.json
    ├── lib/                 check-film's measurement modules
    ├── contact-sheet.sh     a row of stills across the film
    ├── loudness.sh          loudness summary with the −14 LUFS / −1.5 dBTP gate
    ├── add-bricks.mjs       add bricks to a film or to the library
    ├── add-bricks-teach.mjs add bricks to a teach project
    ├── geo-check.cjs        teach: geometry and measurable brief rules
    ├── unit-check.sh        teach: delivery spec
    ├── review-packet.mjs    teach: at most 20 images and an index for review
    ├── voice/               teach: narration to voice, timeline, words, music and cues
    ├── selftest.mjs         launch: every template scaffolded, fitted, checked and stilled
    └── selftest-teach/      teach: every case PASS
```
