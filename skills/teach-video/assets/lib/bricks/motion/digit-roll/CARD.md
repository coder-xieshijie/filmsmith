---
id: digit-roll
category: motion
tier: T0
family: vertical
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### digit-roll

- **Looks**: a number changes like an odometer: every digit sits in its own window and rolls forward through a full lap of 0–9 (or straight to its new digit with `laps: 0`), landing on the new value with a long soft stop; the columns start 4 frames apart from the left, separators and units stand still, and the number never shifts sideways because each digit has a cell as wide as the widest figure. A label and an illustrative note sit under it.
- **Tier**: T0. **Family**: vertical. **Surface**: canvas.
- **Use**: a counted value arriving or changing in place (a KPI, a total, a score the next line states). **Not for**: numbers that are not quantities (versions, ids, dates); more than one rolling number on screen at once.
- **Intent**: The value reads as counted, not typed: the wheels carry over like an odometer and the width never jitters, so the eye reads the change.
- **Content**: One number (old and new value, ≤ 9 digits with separators), an optional label (≤ 24 chars) and note.
- **Parameters**: `from` "0" (the old value; missing digits count as 0), `to` (default the sample KPI "1,248"), `label`, `note` ("Illustrative figures" / "示意数据"; null to hide), `at` [960, 600], `size` 240, `weight` 720, `laps` 1, `roll` 22 frames, `stagger` 4 frames, `accent` false. Roles read: `ink` (digits) or `accent` (with `accent: true`), `dim` (label, note), `ground`.
- **Theory**: the odometer: a counter whose wheels carry over reads as a quantity that has been counted, not typed; fixed digit cells keep the width still, so the eye reads the change, not a jitter.
- **Styles**: any.
- **Length and easing**: 3 beats for a five-character value (`beatsFor`: roll + stagger × (characters − 1), rounded up to a half beat, at least 2); each column on the curve (0.25, 0.8, 0.25, 1) over 22 frames.
- **Sound**: a soft `tick` roll thinning out with the columns; nothing on the landing (the next line carries it).
- **Source**: adapted from video-shotcraft `assets/lib/DigitRoll.tsx` (the roll used by shots `list-stack-press` and `paper-title-card`; card `references/shots/ui-entrance/list-stack-press.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (digits are the same; the label goes through `lang.js`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: rolls from any old value (laps plus the forward difference) instead of from zero only; fixed digit cells; label and note added. Compare waived: the source is a library component with no shot of its own to render.
- **Shared helpers**: also exports `figures` / `figuresWidth` (tabular figures on a canvas, which has no `font-variant-numeric`), `grouped` (group separators) and `spring` / `dampingFor` (the closed-form damped spring the data shots time their landings with), used by the other bricks of batch 7 until they move into the runtime.
- **Pitfalls**: One rolling number on screen at a time; two rolls compete for the eye. Only for quantities: a rolling version number or date reads as a slot machine.
