# Creative mode: composing a film from styles and transitions

Filmsmith can be used in two ways. Pick one in step 1 of the workflow and say which.

| | Standard mode | Creative mode |
|---|---|---|
| What you use | One mode as it ships: its template, palette presets, scene registry and the transitions its card names | The whole kit: every mode card as a source of scene ideas, every transition in `assets/runtime/transitions/` and `assets/runtime/handoffs/`, and the subject's real assets |
| When | The content matches a mode's "Pick it for" line; speed and a proven look matter most | No mode fits the subject or its assets, the user asks for something custom, or a series needs a look of its own |
| Starts from | `new-film.mjs <mode>` | `new-film.mjs <base-mode>`: the base mode supplies the visual system and the renderable skeleton |
| Risk | Looks like the mode's demo | Loses unity; reads as a sampler of effects |

Styles and transitions are separate layers. A style (a mode) is a visual system: ground, palette roles, type scale, frame, through-line, scene grammar. A transition is a function of two states and progress, takes its colours by role and draws nothing of its own: so any transition can run in any style, as long as the style's system holds. Creative mode recombines on that seam.

## What stays fixed

Creative mode frees the choice of scenes and transitions, not the gates. Unity is layer 4 of the pyramid ([foundations](foundations.md)): one visual system end to end is what makes variety read as one film, so a creative film still has exactly:

1. **One visual system**, taken whole from the base mode: its palette preset (accent, status, category and effect roles), its type families and scale, its frame or through-line. Scene ideas borrowed from another mode are redrawn in the base mode's system, never pasted with their own colours or fonts.
2. **One accent with one meaning** (principle 7), stated in `PLAN.md`.
3. **One through-line** object or persistent frame (principle 7), first frame to last.
4. **Transitions by relation, rationed** (principle 4): a hand-off where two states share an object, a cut where they do not; each T2 device at most three times, never twice in a row unchanged, one about every 8–12 s. Variety comes from changing the axis of motion between chapters (vertical scroll, horizontal advance, depth, split, mask), not from adding devices: [Families](transitions.md#families) sorts every hand-off by its axis.
5. Every core principle, the checklist, `check-film` and, with real assets, the real-asset rules in [transitions.md](transitions.md#real-assets).

## Workflow additions

In step 3, `PLAN.md` gets a **composition sheet** before the beat plan:

| Row | Write |
|---|---|
| Base mode and preset | Which system the film runs in, and why it suits the subject |
| Borrowed scene ideas | Each idea, the card it comes from, and how it is redrawn in the base system |
| Transition vocabulary | 4–8 entries from the catalogue: name, tier, which turns of the story use it, the axis of motion. At most two from one family ([Families](transitions.md#families): lift and flip, zoom and depth, vertical scroll and stack, horizontal advance, split and wipe, mask and type, paper, edit cuts, line, shape) |
| Real assets | What each asset proves, and the transition that brings it in and out |
| Unity check | The accent's one meaning, the through-line, the type scale |

The concept sentence and the rival test still apply (principle 10). Scenes the base template does not have are written film-locally, against the template's registry and timing rules, so `npm run fit` and `check-film` measure them like any other. When a borrowed idea or a film-local scene proves itself in an accepted film, it can be proposed for the template it came from.

## When to say no

If the composition sheet needs two accents, two type systems or a second through-line to work, the subject wants two films or another base mode. Say so instead of mixing.
