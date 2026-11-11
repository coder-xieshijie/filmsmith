# Recipe: terminal-ledger

A narrated explainer that argues from a count: a question asked in a light terminal is answered by counting, the work is read and every item becomes a hand-drawn dot on a ruled ledger, the same dots are sorted into the answer, the count reverses a belief (who waits for whom), and a rule is earned from it. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the kit became, and what stays in the kit or the film.

- **Kit**: [`assets/kits/terminal-ledger/`](../../assets/kits/terminal-ledger/README.md), whose starter and demo segments are the example. **Bricks**: from the shared library in `assets/runtime/bricks/` ([The library](../../SKILL.md#the-library)), every brick whose `hosts` names teach.

## Reference look

`paper-ledger`: warm paper `#f6f1e7` and dark ink `#2b2824`; light terminal windows with a hard 8/9 px shadow; a ruled ledger page of small hand-drawn dots; one colour per meaning — vermilion the person, teal the machine, yellow waiting or routine, red a judgement, grey the rest, green what passes; the chapter label top left with a yellow rule, one counter top right; the presenter reserve `[1580, 560, 1880, 860]` and the caption band (y ≥ 880) empty; locked camera, no motion blur. Shared drawing code in the `paper-ledger` look's `kit.js`.

## Recommended bricks

| Slot (arc `count-then-rule`) | Own bricks | From the rest of the library |
|---|---|---|
| hook (the question) | `term-count` | `digit-roll` when one figure must land as a precise number |
| problem (read and counted) | `wall-ledger` (runs `term-wall`) | – |
| demo (sorted into the answer, 1–3 times) | `pile-split` (runs `dot-sort`) | `unit-regroup` for squares on springs instead of dots (another look) |
| turn / proof (who waits for whom) | `session-queue` (`seal-stamp` roped from window to window) | – |
| claim (the rule) | `hand-mark` (underline, circle, brace), `seal-stamp` | `marker-stroke` (keynote look) |
| every scene | `paper-frame` (chapter, counter, "sorted by", dashed note), `paper-term`, `ruled-ledger` | – |
| sound | `narration-pad` | – |

## Languages

Chinese on-screen text is set in LXGW WenKai with a 28 px floor; English in Source Serif 4, with IBM Plex Mono in the terminal windows, with a 25 px floor. Both follow [On-screen language](../teaching.md#on-screen-language). The dots, the ledger and the windows do not change with the language; labels and chips are words, so a Chinese label is set untracked and never in capitals.

## Ban list

- A second accent: vermilion is only the person (what a person types, decides or marks); never decoration.
- A dot that appears or vanishes while being sorted: the same items from the wall to the last pile.
- Run charts and swimlanes (the kit's `bars.js`): judged weak by the owner (2026-10-27); tell time with sessions and lamps instead.
- More than four hand marks in a film; a mark that boils.
- Anything in the presenter reserve or the caption band; camera moves; motion blur.
- Illustrative numbers without the dashed note; real numbers that the note calls illustrative.

## Kit → bricks

| Kit part (`starter/components/`) | Brick | Notes |
|---|---|---|
| `tokens.js`, `style.css` | `paper-ledger` (+ `kit.js`) | the kit's values; English type and floors added |
| `term.js` (`F.term`, `termType`, `termLog`) | `paper-term` | |
| `chapter.js`, `counter.js`, `labels.js` (`how`, `tag`, `lbl`, `chip`) | `paper-frame` | chips drawn by the kit (`drawChip`) inside scenes |
| `stamp.js` | `seal-stamp` | |
| `ledger.js` (page, card, `grow`, `pile`, `assign`, `partition`), `marks.js` | `ruled-ledger`; `dot-sort` (`toPile`) | |
| `wall.js` (`fromTerm`, `read`, `emit`, `collapse`) | `term-wall`; `wall-ledger` | |
| `hand.js` | `hand-mark` | |
| `grid.js` and the a1 counts | `term-count` | |
| `sessions.js` (windows, lamps, prompts, rope) | `session-queue` | |
| `scripts/voice/voice.py` bed and cues, `build/assemble.cjs` volume | `narration-pad` | shared with blueprint-zoom |
| `film.json` scene order | `count-then-rule` | |

## What stays in the kit or the film

- **The presenter** (`avatar.js`, presenter windows): a video of the narrator placed by the film; the look only keeps its reserve empty.
- **Handoffs and stand-ins between segment agents** (`handoff.js`, `ctx.take` / `ctx.give`, `handoff.json`): how the teach pipeline splits one film across agents, not a picture. Scenes take what the previous scene left as parameters instead (`wall-ledger`'s `term.count`, `pile-split`'s `fromWall`).
- **The narration timeline** (`anchors.txt`, `cues.js`, `build/anchors.cjs`): the anchor times of words in the voice. Scenes take seconds (`at`) so the film passes its anchors.
- **Build and checks** (`build/assemble.cjs`, `scripts/geo-check.cjs`, `review-packet.mjs`): the teach pipeline.
- **`bars.js`** (run charts, swimlanes): banned (see above). **`cards.js`** (a board of prompt cards) and **`prompt-card.js`**: used once, around real prompts; not bricks yet.
- **A longer film's later chapters** (a merged session, a second count, the rule and the recap) reuse the same bricks (`paper-term`, `pile-split`, `hand-mark`, `seal-stamp` with `hollow`); its one-off layouts stay in the film.

## Arc role mapping

`count-then-rule` maps the explainer's sections onto the nine slot roles of an arc: the question → `hook`, the count → `problem`, the sort → `demo` (repeated per question), the reversal ("who waits for whom") → `turn`, its figure → `proof`, the rule → `claim`, the recap → `lockup`; `rest` optional, `climax` unused. Two explainer sections have no role of their own: **mechanism** (mapped to `demo`) and **recap** (mapped to `lockup`).
