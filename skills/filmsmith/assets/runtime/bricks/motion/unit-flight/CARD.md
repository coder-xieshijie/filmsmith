---
id: unit-flight
category: motion
tier: T1
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-flight

- **Looks**: the squares that change group first change colour in place (half a beat), then depart group by group, fly on shallow arcs (1.4 beats each, cubic in-out) and land with one swell; squares that leave the chart drop 40 px and fade.
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: Any change of chart over the same counted items: grid to bands, bands to a sorted grid, bands to period columns, to an axis, to a closing rule. **Not for**: Charts of different items, or of measures that are not counts (a square must stay one item).
- **Intent**: The same items move from one chart into the next, so the viewer trusts that every chapter counts the same things.
- **Content**: A counted set as groups (2–9, name ≤ 14 chars / 6 字, count) and the two layouts it flies between (grid, sorted, bands, share, periods, axis, rule).
- **Parameters**: `from`, `to`: layouts (`grid`, `sorted`, `bands`, `share`, `periods`, `axis`, `rule`); `groups` [{ name, count }], `accent` (index of the protagonist), `mark` (`square`, `dot`, `glyph:doc|box|chip`), `seed`; roles `ground`, `panel`, `ink`, `dim`, `accent`, `base`, `rest`.
- **Theory**: Common fate (Wertheimer 1923): items that move together are read as one group; marking before moving (Tversky et al. 2002, apprehension) lets the eye know what will move before it moves.
- **Styles**: made for `tally` (recipe the tally recipe); fits tally, any data; avoid halftone, morph.
- **Length and easing**: 5 beats (3–7 by the number of groups): mark 0.5 beat, departures 0.5 beat apart, flight 1.4 beats cubic in-out, landing swell 0.3 beat.
- **Sound**: `turn` on the first departure, `land` per group landing.
- **Source**: own (`assets/templates/tally/squares.js, timeline.js (FLIGHT, MARK)`), split from the template of the tally style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese labels are not capitalised and take no tracking; numbers stay Inter Tight.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the tally template (`assets/templates/tally/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the tally recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Never add or drop a square between layouts. Over about 2,000 squares the flight turns to noise; count a larger unit.
