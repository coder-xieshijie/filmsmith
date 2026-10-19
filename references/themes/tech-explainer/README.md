# Theme: tech-explainer

Films that explain a technical thing rather than sell it: how an algorithm or mechanism works, what a dataset or a survey says. The viewer wants to understand something in under a minute and may watch twice; the film succeeds when they can retell the mechanism or the numbers afterwards.

## Format so far

- Length from the content (principle 5); the shipped examples run 34–45 s. 16:9 only, 1920×1080, 30 fps, for landscape full-screen playback.
- On-screen text in English; Chinese is planned for a later version of the skill. No narration.
- Ends on the one sentence the viewer should keep (the thesis, or the headline number), then the source.

## Narrative skeleton

From the two accepted films (genre demos 06 and 08, 2026-10-17):

| Beat | Content |
|---|---|
| Hook | The question or the headline number, in one line |
| Set-up | The input: the string to be encoded, the population of items |
| Mechanism | The steps, run live on the input, one change at a time; or the items regrouped, one grouping per chart |
| Probe | One case that shows where it breaks, or one surprising slice |
| Thesis | The sentence to keep, with the computed number |

## Rules

[rules.md](rules.md)

## Modes

| Mode | Look | Status |
|---|---|---|
| [trace](../../modes/trace.md) | Dark live diagram of an algorithm's state | Accepted 2026-10-17 (genre demo 06) |
| [tally](../../modes/tally.md) | One square per item, regrouping chart to chart | Accepted 2026-10-17 (genre demo 08) |

## Ruled out

None yet.

## Benchmarks

None reviewed yet. Candidates: 3Blue1Brown's videos for trace (the source of its look; manim's colours are its category colours); The Pudding and Our World in Data's animated charts for tally.
