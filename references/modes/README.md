# Modes

A mode is one visual language made repeatable: a mode card (this folder) that states its look, principles, presets and checks, and a template (`assets/templates/<mode>/`) that renders a complete film from `content.js`. Every mode applies the [core principles](../principles.md); its own principles narrow them for one look. A mode may depart from a principle only at layers 3–4 (flow, unity), and only where its card states the departure and the reason ([who decides](../foundations.md#who-decides)). Modes do not mix: a film uses one mode's template, palette and scene registry from start to end.

## Index

| Mode | Looks like | Best for | Tempo (default) · example length · shortest cut | Source film (owner-accepted) |
|---|---|---|---|---|
| [thread](thread.md) | One vermilion line that becomes everything in turn: cursor, word, swatches, storyboard, spheres, curves, tracks, the film's own contact sheet | Showreels of a video, motion or rendering toolchain itself | 112–128 bpm (120) · 40 s · shortest cut storyboard → merge → close, 12 s | genre demo 05 (2026-10-17, best texture) |
| [ink](ink.md) | Heavy condensed type slammed onto paper on every beat; an ink dot hops between words as the full stop, opens each next ground, bursts, blooms into colour, and ends as the cursor of the closing command; one claim on a whiteout | Launch teasers, one-line claims, naming moments | 120–136 bpm (124) · 35 s · shortest cut bloom → name → cta, 10.6 s | genre demo 02 (2026-10-17) |
| [plakat](plakat.md) | A series of international-style posters in motion: warm paper, ink, one signal red, visible 12-column grid | Products with a clear claim and a step list; decisions and the people who make them | 112–128 bpm (120) · 64 s · shortest cut problem → claim, 11.3 s | dev-skills launch, Swiss version (2026-10-16) |
| [blueprint](blueprint.md) | One engineering drawing being drafted sheet by sheet; amber stamps approve each part | Workflows and systems with parts, inputs and outputs; anything with "architecture" | 92–108 bpm (100) · 48 s · shortest cut 2 sheets, 9.6 s | dev-skills launch, blueprint version (2026-10-16) |
| [phosphor](phosphor.md) | A night-time terminal running a launch: black, one phosphor accent (ice by default; green, amber, cyan, violet), mono and heavy display type, HUD frame | CLI tools, developer workflows, anything that runs in a terminal | 120–136 bpm (128) · 71 s · shortest cut boot → end, 10.6 s | dev-skills launch, terminal version (2026-10-16) |
| [tally](tally.md) | One square per item; the same squares regroup from grid to bands, eras, a trend and a list, chapter by chapter | Counts, distributions, registry or dataset stories | 104–120 bpm (112) · 32 s · shortest cut count → columns, 12 s | genre demo 08 (2026-10-17) |
| [trace](trace.md) | Dark 3Blue1Brown-style diagram; an algorithm runs live and the picture is its state | How a mechanism or algorithm works, step by step | 88–104 bpm (100) · 36 s · shortest cut five scenes, 16 s | genre demo 06 (2026-10-17) |
| [morph](morph.md) | One ink shape on cool grey that never leaves the frame and is promoted a dimension per scene; violet marks only the part changing now | Launches of developer tools and interface products where one source becomes the whole product | 112–128 bpm (120) · 32 s · shortest cut solid → unfold → mark, 12 s | batch 4 style sample (2026-10-19) |
| [halftone](halftone.md) | Newsprint, a black plate and one process ink; dots vary in size, never in grey; an anchor from the product's mark holds one point while every world is printed round it, and the pull-back lands it in the whole mark | Launches and teasers of a model or product with a mark | 112–128 bpm (120) · 32 s · shortest cut card → lockup, 12 s (8 s name only) | batch 4 style sample (2026-10-19) |
| [pulse](pulse.md) | A question acted out as a query: one word a beat at a fixed anchor, grounds flipping along one hue's ramp, a highlight hopping over real candidates, one whiteout slamming the answer in amber on the drop | Version releases that answer one benchmark question; a single measured conclusion | 112–120 bpm (120) · 32 s · shortest cut ask → ask → search → reveal, 12 s | batch 4 style sample (2026-10-19) |

## Choosing a mode

The shortest cut is the smallest chain each template renders (2026-10-19), made for reels and stings; its first frame is already the mode's world and its last half second is settled, so it can be cut into a longer film. Lengths in the index are the shipped examples fitted at the default tempo under the four tiers of change of 2026-10-19 (timing API 3, all ten templates); every film's length follows its own content (principle 5).

Ask what the content *is*, then pick (principle 9, the style points at the content):

| The content is… | Mode |
|---|---|
| A reel showing what a video, motion or rendering toolchain itself makes | thread |
| A name, a slogan, a teaser under 30 s | ink |
| A claim plus a short list of steps or decisions, with a human in the loop | plakat |
| A system: parts, flow between them, inputs and outputs | blueprint |
| A tool used from a terminal, a CLI, a CI step | phosphor |
| Numbers about many items: how many, which kinds, what share | tally |
| A mechanism or algorithm a viewer should understand, whose state merges, sorts or reduces (a reassignment such as consistent hashing or scheduling: trace's "Does not fit") | trace |
| One source that becomes a whole product surface (a spec into docs, a schema into SDKs), with an interface to show | morph |
| A model or product launch with a mark: a few features, one number, the name | halftone |
| A question with a measured answer: which build, config or option passes a limit | pulse |
| The owner asks for "something with impact" for a developer product | ink or phosphor; show a 5 s sample of each |
| None of the above fits | Say so; propose the nearest mode and what would change. Do not improvise a new look inside a film |

Every mode chosen by form (ink, plakat, thread) still draws at least one scene from a real technical artefact of the product (principle 9).

## Mode card template

```markdown
# <Name> (`<id>`)

One line: what it looks like. Aesthetic anchor: "like <reference>".
Theme: <theme> · Template: assets/templates/<mode>/ · Tempo range; length from content · Status and verdict dates

## Fits / does not fit
## Use cases          3–4 concrete uses, each with an example product and what its film says; mark the best fit
## Mode principles      5–7 rules; break one and the look collapses. Each names the core principle it narrows, or the departure it takes and why.
## Palette presets      table: id, name, fits, role → hex. Choose one; no custom hex values.
## Variants             the colour presets above plus one form axis set by a content.js field: value, what changes, when to choose it, its source; the default value renders exactly as before
## Accent role          the one kind of thing the accent marks in this mode, from the four colour roles of principle 7; which colours are status, category or effect colours, and their conditions; where the accent becomes a full-frame ground and for how long
## Type                 role → family → licence; minimum sizes (information text ≥ 25 px; main text ≥ 40 px, or why not); every use below 25 px listed as decoration
## Type scale           the numeric series every size sits on (ratio or named series, e.g. ISO 3098 √2), the sizes in use, and the levels per frame with any label level and its reason
## Frame and grid       canvas (16:9, 1920×1080), margins, grid, persistent elements (real information only); deliberate overlaps or clips and their conditions
## Scenes               the registry in one table (type, purpose, bars); slots and limits live in TEMPLATE.md
## Signature transformations   how one scene grows into the next
## Motion               entrances, exits, springs, camera, ambient layers; every value tagged standard/borrowed/derived/owner/draft
## Sound                bed preset, where the break and the drop go, which events get a sound
## Factory defaults     what this template produces untouched: the source film's and the nearest reference's motifs, example copy, default preset; a film's PLAN.md ban list starts here
## Don'ts               what breaks the look or a principle in this mode, each with the reason
## Checks               P0 (fails the film) / P1 (rhythm) / P2 (polish), specific to this mode
## Known issues         what the next film in this mode must beat first
```
