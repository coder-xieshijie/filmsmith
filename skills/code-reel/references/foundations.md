# Foundations

The theory the skill stands on. [principles.md](principles.md) derives the core principles from it; each mode under [modes/](modes/README.md) applies those principles to one visual language; the templates turn a mode into a film. Read this when writing or changing a principle, a mode or a checklist item, or when a verdict does not fit any existing rule.

## Style and taste

- **Style is a property of the work**: a set of reproducible formal choices (palette, type, grid, motion, sound) plus what that set points to. Black ground, green mono text and a blinking cursor point to "code"; cyan paper, white lines and a title block point to "engineering" (Barthes 1964, *Rhetoric of the Image*). A mode card therefore writes values, never moods.
- **Taste is a capacity of a person**: choosing, for a given purpose, the best of several workable options and executing it fully. Taste can be trained through practice and comparison (Hume 1757, *Of the Standard of Taste*), and it is not arbitrary: "your old tastes were not merely different, but worse" (Graham 2002, *Taste for Makers*).
- Style answers *what it looks like*; taste answers *which one, and how well*. One taste can run several styles: the accepted modes differ in almost every visible value but share the same lower-layer discipline (see the pyramid).

## Three layers of taste

| Layer | What it is | How it is measured |
|---|---|---|
| Shared | Perception every viewer shares: grouping, contrast, fluency | Standards and metrics |
| Domain | Conventions trained into a field: grids, drafting symbols, editing rhythm | Expert consensus, benchmark films |
| Personal | The owner's own preferences: novelty, colour, density | Pairwise comparison of samples |

For designed artefacts the personal share is large (Vessel et al. 2018; Leder et al. 2016), so no generic "beauty score" stands in for the owner. A single formula for beauty has failed empirically (Birkhoff's M = O/C, Hübner & Ufken 2023); preference for moderate complexity exists, but its peak moves by audience (Reinecke & Gajos 2014). The owner's taste is learned the way preference scales are built: A-or-B comparisons of samples that differ in one variable (Thurstone 1927; Bradley & Terry 1952).

## The pyramid

Six layers, built bottom-up and judged top-down. Lower layers are **gates** (fail one and the film fails); upper layers are **distinguishers** (they decide how good a passing film is). Adapted from the design-needs hierarchy (Lidwell et al. 2003, after Maslow) and Murch's editing priorities, where emotion and story outrank rhythm and eye-trace (Murch 1995).

| # | Layer | The film must | Grounding | Measured by |
|---|---|---|---|---|
| 6 | **Fresh but acceptable** | Be memorable and distinct from its references while still reading instantly | MAYA: novelty is preferred while it keeps typicality (Hekkert et al. 2003) | Pairwise comparison; count of motifs shared with the nearest reference |
| 5 | **Fit** | Point at its domain before any word is read | Style as connotation (Barthes 1964); form follows function (Sullivan 1896); the title sequence starts the film from the first frame (Bass) | Mute, no text: can a viewer name the domain? |
| 4 | **Unity** | Run one visual system end to end; vary only inside its rules | Unity-in-variety, the strongest single source of aesthetic pleasure (Berghman & Hekkert 2017); processing fluency (Reber et al. 2004); one isolated accent is remembered (von Restorff 1933) | Colours covering 90% of pixels; accent area as a mark (≤ 10 %); type families; sizes from one scale |
| 3 | **Flow** | Move naturally, alternate tension and release, lock picture to sound | Animation principles (Thomas & Johnston 1981); ease-out by default (NN/g); shot lengths vary, not uniform (Cutting et al. 2010), at the genre's level: about 2–2.6 s a shot in commercials and short-form video (Zhu et al. 2023); onset of motion captures attention, sustained motion does not (Abrams & Christ 2003), so changes come often and settle briefly; related changes cost the viewer least (Lang et al. 1993); synchresis (Chion 1994) | Cut-on-beat error; shot-length median and variance; gaps between changes and the longest still stretch (the four tiers, principles 4–5); no linear easing |
| 2 | **Clarity of structure** | Show one idea at a time, with one protagonist per frame | Gestalt grouping (Wertheimer 1923); contrast means "very different" (Williams); at most three type sizes (Gordon 2021); signalling and coherence effects (Mayer 2017) | Type levels per frame (sizes within 15 % are one level, neighbours ≥ 1.25 apart); elements moving at once |
| 1 | **Legibility** | Be seen, read and heard without effort | WCAG 2.2 contrast; subtitle dwell (Netflix, BBC); loudness (EBU R 128) | Contrast ≥ 4.5:1 on the rendered frame; information text ≥ 25 px at 1080; reading holds by tier; integrated loudness, true peak, short-term loudness ≤ integrated + 5 LU |

The layers keep these names everywhere, in English and in the workshop's Chinese notes alike: 1 Legibility (看得清), 2 Clarity of structure (看得懂), 3 Flow (看得顺), 4 Unity (统一), 5 Fit (契合), 6 Fresh but acceptable (新而可接受). "Clarity" on its own always means layer 2, never legibility.

Build from layer 1 up: a beautiful film with unreadable text fails, and surface delight over a broken base reads as cheap (Fessenden 2017). Review from layer 6 down: first ask whether it fits and moves the viewer, then check the details.

## Who decides

The skill's taste is meant to be better than any one viewer's, the owner's included, so verdicts and theory have different jobs:

| Layer | Decided by |
|---|---|
| 1 Legibility, 2 Clarity of structure | Standards. A verdict cannot pass a film that fails them |
| 3 Flow, 4 Unity | Domain consensus. A deliberate departure is allowed when it is written down with its reason |
| 5 Fit, 6 Fresh but acceptable | The theory narrows the candidates; the owner picks between the ones it judges equally good |

Two owner decisions sit above the table as the skill's premise: it makes technical videos, and no person appears on screen ([principles](principles.md#premise)). A verdict becomes a rule only after it is placed on a layer and checked against this file; when the two conflict, the conflict is shown to the owner and the theory wins. A tendency becomes a rule after two consistent verdicts or one A/B comparison, not after one reaction to one film.

## Where values come from

Every number on a mode card carries one of five tags:

| Tag | Examples | How it is set |
|---|---|---|
| `standard` | Text contrast, reading time, loudness, drafting symbols | Computed from the standard; pass or fail |
| `borrowed` | Easing curves, duration ranges, grids, type scales; values kept from an accepted source film | Taken from a mature system (Material 3 motion, modular scales, Müller-Brockmann grids) and adapted to video: durations snap to the beat, not to a 500 ms UI limit. A value inherited from the mode's source film is `borrowed (source)` |
| `derived` | Accent hue, type class, signature device | From the domain's history (P1 phosphor green, Prussian-blue blueprints, grotesque type), narrowed by the standards, then searched for collisions with existing brands |
| `owner` | The pick between qualified candidates | Five-second samples differing in that one value, compared side by side, with the date; also the owner's ruling on a brand collision |
| `draft` | Values set while making a first film | Not yet derived or compared; first to revisit |

Accepting a whole film is not a choice between its values, so it does not make them `owner`. A value taken from a source film stays `borrowed (source)` until it wins an A/B comparison; only then is it tagged `owner`, with the comparison's date.

Identity values are searched for collisions with known brands, because a borrowed colour can bring its brand along. A collision is reported to the owner, who decides: the terminal green `#3DDC84` coincides with Android's brand green, and the owner kept it (verdict 2026-10-17).
