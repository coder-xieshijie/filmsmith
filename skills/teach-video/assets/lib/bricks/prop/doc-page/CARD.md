---
id: doc-page
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### doc-page

- **Structure**: one tall page (1000 × 760 at M) with a 40 px radius: a title (display), a meta line (mono, info size) over a rule, then sections, each a heading (mono, info size) and paragraph lines. A paragraph line with text is set in the text face (31 px); one without text is a skeleton bar whose length varies (a section's last line is shorter). `parts`: face, title, meta, heading, line, skeleton, marker.
- **Intent**: Keep the source on screen, so every claim drawn from it visibly comes from a real document instead of floating in the air.
- **Content**: A document's title, one meta line and 6–40 lines of headings and paragraphs; only 1–3 evidence lines need real text (en ≤ 64 chars, zh ≤ 28 chars), the rest can be skeleton bars.
- **States**: `still` (no scroll, no marks) and `read` (scrolled, marks drawn); scenes drive `scroll` (content px) and `marks[k]` (0 → 1: the marker under the line whose `mark` is k grows left to right and its text turns toward the accent).
- **Sizes**: S 750 × 570, M 1000 × 760, L 1250 × 950 (the page scales; below M its text and line spacing grow by `ts` so the info text stays at the language's floor on screen).
- **Swap points**: `lines` (a list of `{ kind: title | meta | h | p, text?, mark? }`, 6–40 lines; a `p` line's text: en 12 words / 64 chars, zh 28 chars; give `mark: k` to the evidence line of finding k). By default: the sample's long title, product and caption as meta, the steps and nav as six headings, and three written evidence lines (the KPIs) among skeleton lines.
- **Parameters** and **Roles**: `docLines(lang)`, `layoutDoc(lines, ts)` → `{ ys, height }`, `paintDoc(ctx, lines, layout, P, { w, h, scroll, marks, ts, radius })` → the right end of every marked line (content x, y: where a connector starts), `docShadow(ctx, w, h, elevation, colors)`, `DOC`. Roles: `panel` (face), `ink` (title), `dim` (meta, headings, text), `line` (rule), `ink` at 10 % (skeleton), `accent` (marker, marked text).
- **Styles**: any. **Source**: adapted from video-shotcraft `demos/ui-entrance/doc-park-left-pill-deal/DocParkLeftPillDeal.tsx` (card `references/shots/ui-entrance/doc-park-left-pill-deal.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (the page scrolls slowly, braking at the end, and marks its three evidence lines in turn), `sample/poster-S-en.jpg`, `-M-`, `-L-` (and zh). Compare: waived (a prop has no motion of its own; doc-findings checks the moves).
- **Pitfalls**: The text must be longer than the whole scroll, or the page scrolls into blank space at the end. Write real text only on the lines that are read; a page full of readable sentences pulls the eye off the findings.
- **Sample**: `poster.jpg`, an English still 480 px wide.
