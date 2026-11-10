# Recipe: trace

A dark diagram in which an algorithm runs live and the picture is its state: chips fuse, a histogram counts, a rule list grows, a token bar shrinks; the rule is taught once slowly, then repeats faster into the result, an unseen input proves it, and the film closes on its thesis. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [trace](../modes/trace.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/trace/`, whose `content.js` is the example film.

## Reference look

[`live-diagram`](../../assets/runtime/bricks/look/live-diagram/CARD.md): a near-black ground (`ink` `#0C1013`, or `paper`, `chalk`); four semantic colours with one meaning each — `base` untouched, `accent` (active) being acted on now, `learned` produced by the run, `unseen` new input — plus `cell` for the token bar; Source Serif 4 for the title and the thesis (Noto Serif SC in Chinese), Inter Tight for captions, JetBrains Mono for chips, counts and rules (chips, code and rules stay Latin in every language); scale 26 · 30 · 40 · 46 · 54 · 76 · 82 (Chinese from 28); 8-sample motion blur, two camera moves at most.

## Recommended bricks

| Slot (arc `rule-run`) | Own bricks | From the rest of the library |
|---|---|---|
| hook (input as units) | [`chip-split`](../../assets/runtime/bricks/scene/chip-split/CARD.md) | [`type-enter`](../../assets/runtime/bricks/motion/type-enter/CARD.md) if the input should type in before it splits |
| count | [`weight-histogram`](../../assets/runtime/bricks/scene/weight-histogram/CARD.md) | – |
| demo (one step slow, then the loop) | [`merge-step`](../../assets/runtime/bricks/scene/merge-step/CARD.md) (`slow: true` for the first step; `from`/`to` with `pace: 2`, then `pace: 1` for the loops) with [`pair-fuse`](../../assets/runtime/bricks/motion/pair-fuse/CARD.md) | runtime [`path-type`](../transitions.md#path-type) (the caption rolling into a loop for "repeat"), `trace-flow` |
| proof (the total) | [`count-to-result`](../../assets/runtime/bricks/scene/count-to-result/CARD.md) | [`digit-roll`](../../assets/runtime/bricks/motion/digit-roll/CARD.md) when the result is a figure that must land exactly |
| turn (an unseen case) | [`probe-replay`](../../assets/runtime/bricks/scene/probe-replay/CARD.md) | [`live-trace`](../../assets/runtime/bricks/motion/live-trace/CARD.md) when the replay should leave a path behind the rules it fires |
| thesis | [`thesis-lines`](../../assets/runtime/bricks/scene/thesis-lines/CARD.md) | [`type-retype`](../../assets/runtime/bricks/motion/type-retype/CARD.md) for a thesis that corrects its first word |
| every scene | [`token-chip`](../../assets/runtime/bricks/prop/token-chip/CARD.md), [`token-bar`](../../assets/runtime/bricks/prop/token-bar/CARD.md) (the through-line) | [`terminal-window`](../../assets/runtime/bricks/prop/terminal-window/CARD.md) when the run is shown as a command |
| sound | [`diagram-bed`](../../assets/runtime/bricks/sound/diagram-bed/CARD.md) | – |

## Ban list

- A number, chip or rule that the run did not compute (the run module draws the picture; copy carries placeholders).
- A colour used for anything but its meaning: the accent only for what is being acted on now, `learned` only for what the run produced, `unseen` only for new input; no status or effect colours, no full-frame accent ground.
- More than three regions lit at once (board + histogram while counting; board + rules in the loop; the bar alone for the summary).
- Saying the weighting instead of showing it (each contribution flies to its bar and stays visible as a segment).
- Every step at the same speed: the first one slow, the rest compressed.
- Continuous plots and curves; swap-based or search mechanisms whose chips would cross or vanish (the pieces only fuse neighbours).
- Chinese in chips, rules or code; italic in Chinese (the subtitle turns dim instead).

## Template → bricks

| Template part (`assets/templates/trace/`) | Brick | Notes |
|---|---|---|
| `palettes.js` (ink, paper, chalk), type, `fx.js` blur | [`live-diagram`](../../assets/runtime/bricks/look/live-diagram/CARD.md) | |
| `run.js` (the run, pair counts, merges), board geometry and chips in `pieces.js` | `motion/pair-fuse/board.js` (engine), [`pair-fuse`](../../assets/runtime/bricks/motion/pair-fuse/CARD.md) | the fuse of two chips into one, with the settle |
| chip | [`token-chip`](../../assets/runtime/bricks/prop/token-chip/CARD.md) | base, active, learned, unseen |
| token bar | [`token-bar`](../../assets/runtime/bricks/prop/token-bar/CARD.md) | learned cells take the learned colour (`kinds`) |
| `hook` | [`chip-split`](../../assets/runtime/bricks/scene/chip-split/CARD.md) | the bar counts in under the board |
| `count` | [`weight-histogram`](../../assets/runtime/bricks/scene/weight-histogram/CARD.md) | the weight flight is drawn inside the scene (the template's own, no runtime module) |
| `step` | [`merge-step`](../../assets/runtime/bricks/scene/merge-step/CARD.md) (`slow`) | |
| `loop` | [`merge-step`](../../assets/runtime/bricks/scene/merge-step/CARD.md) (`from`, `to`, `pace`) | the caption's roll into a loop (runtime [`path-type`](../transitions.md#path-type)) is referenced, not drawn |
| `summary` | [`count-to-result`](../../assets/runtime/bricks/scene/count-to-result/CARD.md) | the `sweep` entrance stays runtime [`token-sweep`](../transitions.md#token-sweep) |
| `probe` | [`probe-replay`](../../assets/runtime/bricks/scene/probe-replay/CARD.md) | the `flow` reveal stays runtime [`trace-flow`](../transitions.md#trace-flow) |
| `thesis` | [`thesis-lines`](../../assets/runtime/bricks/scene/thesis-lines/CARD.md) | the chips → claim morph stays in the template; the scene opens on the claim |
| `score.mjs` | [`diagram-bed`](../../assets/runtime/bricks/sound/diagram-bed/CARD.md) (preset `diagram`) | |
| `content.js` scene order, `timeline.js` focus and camera | [`rule-run`](../../assets/runtime/bricks/arc/rule-run/CARD.md) | |
| `timing.rules.js` fit to bars, camera push and reveal, `stroke: 'sketch'` | stays in the template | film-level timing; `sketch` is a whole-film form variant (every box or none), not a brick |

What stays in the recipe: the run (which mechanism, which tiny input, how many merges: one `run` object handed to every scene so all scenes draw the same state), the order slow → loop → faster loop, and the lighting of regions (each scene lights its own regions; which are dimmed across a cut is the film's decision).

## Chinese

Titles, captions and the HUD are set in Chinese (Noto Serif SC for the title and the thesis); chips, rules and code stay Latin; the subtitle turns dim instead of italic. The hook plans 5 beats (3.0 s) against 2.4 s, each step 6 beats (3.6 s) against 3 s. A Chinese film takes these lengths ([system](../system.md#language)).
