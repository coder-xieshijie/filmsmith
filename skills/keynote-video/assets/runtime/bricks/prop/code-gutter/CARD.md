---
id: code-gutter
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### code-gutter

- **Structure**: the label (the path) mono 25 at baseline 84; line numbers mono 33 in `dim` at x 96, code mono 33 in `ink` from x 176, 46 px a line; the underline 4 px, 9 px under the baseline, as wide as the token inside its quotes; a diff: number at x 120, sign at x 174, code at x 200, 52 px apart, the minus line `muted`, a 6 × 40 accent bar at x 96 beside the plus line.
- **Intent**: Quote the input exactly, with its line numbers, so it can be checked.
- **Content**: 2–6 lines (≤ 64 characters) with the first line’s number and the file’s path; a token to underline or a line before and after.
- **States**: `quoted` → `paired` → `diffed`; quoted, paired (one token underlined), diffed.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `lines` (code), `label` (a path).
- **Parameters** and **Roles**: `label`, `from` (the first line’s number), `lines`, `token`, `diff`, `colors`, `lang`; roles paper, ink, muted, dim, accent.
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/film.js (inputOf.file, inputOf.diff)`), split from the split style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code is quoted verbatim and never translated.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: No syntax colours: the accent is the only colour.
