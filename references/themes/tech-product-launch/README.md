# Theme: tech-product-launch

Launch and promo films for technical products: open-source repositories, developer tools, APIs, agent skills. The viewer is a developer deciding in under a minute whether the product is worth a click.

## Format so far

- Length from the content (principle 5); no typical range. 16:9 only, 1920×1080, 30 fps, sized for landscape full-screen playback (2026-10-18); vertical films are not made.
- On-screen text in English by default; Chinese when the user asks for it, once the templates support it (not yet). No narration.
- Ends on one clear action: the repository URL, held readable for at least 3 seconds.

## Narrative skeleton

The dev-skills drafts all followed this line, and it suits a product that is a process or a workflow:

| Beat | Share of runtime | Content |
|---|---|---|
| Problem | ~10% | What goes wrong today, as a short list or a question |
| Claim | ~8% | The product in one line, input → output |
| Method | ~45% | The product's steps as numbered chapters, each drawn as the thing it produces |
| Proof | ~10% | How the result is checked; a count or a pass list |
| Shape | ~10% | The whole flow on one screen, with where the human sits |
| Install | ~7% | The real install commands and first steps |
| Close | ~10% | Claim again, name, URL |

A product that is not a workflow (a library, an API, a UI, a filter like jq) may need another skeleton: problem → claim → three input-to-output examples → install → close is the candidate (the clean-room jq run of 2026-10-18 had to force its examples into workflow scenes). Record it here when a film proves one.

### Candidate: a model release measured on benchmarks

For a model or API whose launch rests on published scores. One release filmed in six modes proved it (2026-10-19/20): the first cut, a string of number cards, read as thin; this line, built on what the model can do, was accepted in every mode. It stays a candidate until a second release confirms it.

| Beat | Share of runtime | Content |
|---|---|---|
| Hook | ~15% | The kind of work the model does, as one task across real tools (labelled illustrative), then the name |
| Scoreboard | ~8% | The official comparison table redrawn from its values, the product's column in the accent; its first places light one by one while the rest steps back |
| Firsts | ~27% | Each first place in turn: the score with its computed rank, then the benchmark's own published example task drawn as the work (labelled illustrative) |
| Breadth | ~6% | Up to three more domains, one score each |
| Cost and speed | ~24% | The official score-vs-cost chart redrawn; the price; the speed shown at its real rate, not only as a number |
| Ecosystem | ~10% | The product it ships in or pairs with, and the offer in its official wording |
| Close | ~10% | The official line as the lock-up (rule 7), the ways in, the model id |

The climax is the cost claim or the offer. Every score follows principle 2's terms for quoted numbers.

## Rules

[rules.md](rules.md)

## Modes

| Mode | Look | Status |
|---|---|---|
| [phosphor](../../modes/phosphor.md) | Night terminal, one fluorescent phosphor accent, launch HUD | Accepted 2026-10-16; horizon opening, cursor closing and minimal HUD default since 2026-10-18 |
| [plakat](../../modes/plakat.md) | Moving international-style posters, one signal colour | Accepted 2026-10-16 |
| [blueprint](../../modes/blueprint.md) | One engineering drawing drafted sheet by sheet, amber stamps | Accepted 2026-10-16 |
| [ink](../../modes/ink.md) | Type slammed on the beat, an ink dot that floods into colour | Accepted 2026-10-17 |
| [thread](../../modes/thread.md) | One line that becomes everything | Accepted 2026-10-17; its example is the skill's own promo film (2026-10-18) |
| [handset](../../modes/handset.md) | One locked-off device whose screen shows only real captures; copy in the margin, level with the evidence | Accepted 2026-10-21 (sample film, its sound included) |
| [exhibit](../../modes/exhibit.md) | Real assets on one desk under an overhead camera; one pencil ring lifts each claim out as a code-drawn reading | Accepted 2026-10-21 (sample film, its sound included) |
| [dossier](../../modes/dossier.md) | An evidence file on a dark mat: claims struck where they are printed, tied to exhibit stickers, one figure carried onto a worksheet | Accepted 2026-10-21 (sample film, its sound included) |

## Ruled out

- **Filmed metaphor as the body** (letterboxed photoreal generated shots — a desk lamp, wax seals, machinery — with titles over them). The owner judged it a poor fit for a developer-tool launch: metaphor replaced the product's actual flow. Owner verdict, 2026-10-16.

## Benchmarks

[benchmarks.md](benchmarks.md)
