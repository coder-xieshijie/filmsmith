---
id: symbol-scramble
category: motion
tier: T0
family: mask-type
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### symbol-scramble

- **Looks**: the value's slots fill with #, &, * and @ that change 24 times a second (seeded), each in the slot its digit will take, so the string never jitters; over the last 40 % of the move the digits lock left to right and the label rises beside the value. `kind: 'count'` counts from zero to the value in its own format (separators, decimals, suffix), expo out.
- **Tier**: T0. **Family**: mask-type. **Surface**: canvas.
- **Use**: a value appearing where a measurement is the point. **Not for**: words, unmeasured numbers.
- **Intent**: The number feels measured rather than typed: it searches, then settles, and no frame shows a wrong value.
- **Content**: One value (≤ 9 chars) and an optional label (≤ 26 chars).
- **Parameters**: `value`, `label`, `kind` (`scramble` | `count`), `size` (291), `y` (640), `ground` (a ramp step), `seed`; roles `ground` (the ramp step), `ink` (the value).
- **Theory**: expectation and resolution (Huron 2006); fixed slots keep the eye still; symbols keep every still truthful (principle 2).
- **Styles**: pulse; any data film. Avoid ink (its numbers count in fixed slots without symbols).
- **Length and easing**: 1 beat (0.5–2); 24 Hz flicker, lock over the last 40 %; count expo out.
- **Sound**: `tick`s under the flicker (a glitch in the pulse bed), `land` on the lock.
- **Source**: own (`assets/templates/pulse/film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full (only digits scramble; a Chinese unit stands).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream (own, split from the pulse template); compare waived. The template resolves a data figure in 0.35 s at once; here the lock runs left to right over the move's last 40 %.
- **Pitfalls**: Only digits scramble; units, signs and words stand from the first frame.
