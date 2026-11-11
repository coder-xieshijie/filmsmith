---
id: lead-word
category: motion
tier: T1
family: zoom-depth
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### lead-word

- **Looks**: the lead word appears alone, huge (2.3×) in the centre, holds, gives a small push, then pulls back fast to its place at the start of the line while the rest of the words fade and rise in after it one by one; a sub line lifts in under the finished title.
- **Tier**: T1. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: a line whose first word or phrase is the subject (a product name, "Introducing", "Weekly review,"): the lead alone first, then the sentence it belongs to; a launch-style opening. **Not for**: lines whose key word is not first; lines over about 32 characters (14 Chinese), or a lead over about 14 characters (at 2.3× it leaves the frame).
- **Intent**: Reading order becomes physical order: the viewer is made to read the lead word alone first, then sees the sentence grow round it, and has read the subject twice.
- **Content**: One line (≤ 32 chars) whose first word or phrase (≤ 14 chars) is the subject; optional sub line (≤ 50 chars).
- **Parameters**: `from` the ground, `to` the set title and its sub. `text` (string or `{ en, zh }`, default the sample claim; sample en `"Tidewell checks every render"`, zh `"Tidewell 检查每一次渲染"`), `lead` (the prefix that zooms; null = the first English word or Chinese phrase), `accent` (drawn in the accent; null = none), `sub` (a second line, default the sample caption; null for none), `size` (en 96, zh 88), `weight` 600, `subSize` (en 34, zh 32), `x` 960, `y` 540, `crash` false (true adds the upstream crash zoom at the end; off by default, a camera brick does it better), `probes` false (comparison points added to `track()`). Roles read: `ink`, `accent` (lead), `dim` (sub).
- **Theory**: figure first, then context: the lead word is read alone before the sentence frames it (the given-new order of a sentence, Halliday 1967); the pull-back is a camera move that keeps it the same object (object constancy).
- **Styles**: any; strongest on plain grounds.
- **Length and easing**: 3.5 beats, 3–5. Intro 6 f, hold 12 f, push to 1.06 cubic-bezier(.25, 1, .5, 1), recede 12 f cubic-bezier(.5, 0, .05, 1), words after 6 f, 4 f apart, 12 f each cubic-bezier(.22, .8, .36, 1) from 0.5 em below.
- **Sound**: `turn` at the pull-back, `land` as the last word settles.
- **Source**: adapted from video-shotcraft `demos/typography/lead-word-zoom-assemble/LeadWordZoomAssemble.tsx` (card `references/shots/typography/lead-word-zoom-assemble.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: the lead is the first Chinese phrase (or a product name in Latin letters); the rest rises in phrases.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the upstream crash zoom into the frame at the end is left to a camera brick; no backdrop, grain or brand mark; the lead and the rest are slots. Compare: pass (line scale 6.2 px ×100, slide 10.3 px, progress RMSE 0.006, events ±1 f; SSIM drop 0.023).
- **Pitfalls**: Only one word in the accent; two coloured words leave the viewer unsure which to remember. The lead must be short: over about 14 characters the 2.3× word overflows and its end is lost. A crash zoom after it is the first half of a transition; to end on it, hold still or fade instead.
