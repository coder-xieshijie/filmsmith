---
id: evidence-mat
category: look
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### evidence-mat

- **Looks like**: an evidence file on a dark mat: a real published page mounted on warm paper with two hard paper edges under it, everything but one printed claim veiled, that claim struck with a highlighter (multiply, the page's own type showing through), a leader to an exhibit sticker; the claim restated in serif on the mat with its terms in mono; a ruled worksheet beside the page where a figure is carried and computed; an index of exhibits; the name struck on the mat.
- **Intent**: Make the viewer trust a claim by showing it where it was printed, struck like evidence in a file.
- **Fits / does not fit**: published evidence (tables, prices, charts, app screens), 20–45 s. Not: products without published evidence, mechanisms, mood pieces.
- **Palette presets**:

  | id | name | mat (ground) · ink · dim | paper · onPaper · paperMuted | line (edges) | accent · onAccent | onAccent/accent |
  |---|---|---|---|---|---|---|
  | `yellow` | Highlighter yellow (default) | #161512 · #EEEBE2 · #A8A396 | #F3F1EA · #1C1B17 · #5A574E | #CFCBBF | #FFE13B · #1C1B17 | 13.2 |
  | `magenta` | Magenta highlighter | same | same | same | #E20088 · #020202 | 4.53 |
  | `coral` | Coral highlighter | same | same | same | #FF7A63 · #1C1B17 | 6.74 |

  Roles: ground (the mat), ink and dim (the claim and its terms on the mat), panel and paper (mounts, worksheets, the index), onPaper and paperMuted (type on paper), line (the stack's paper edges), accent (the highlighter), onAccent (type on stickers and tabs). The veil is the mat at 50 %. Pick the preset by the accent rule: ΔE00 ≥ 20 from every colour inside each struck band; a claim printed in colour is struck under the line (`under`).
- **Type**: Source Serif 4 VF (600 claims, titles, the result and the name; 400 rows and captions), IBM Plex Mono (400 terms, header, sources; 500 the URL; 600 sticker and tab labels), Inter Tight 700 (the slip's figure set in code); zh stacks add Noto Serif SC (serif) and Noto Sans SC (mono, sans). Licences OFL-1.1.
- **Type scale**: 25 · 40 · 50 · 125 · 160 (terms and labels · rows, values and captions · claims and titles · the result · the name); Chinese mono at 28.
- **Tracking, case, italic, leading**: claims −0.01 em, titles −0.008, the result and the name −0.02, otherwise 0 (Chinese 0); no capitals, no italic; leading 1.2 (zh 1.4).
- **Grid and frame**: the frame of the template: the source file and the page in hand at y 54 (mono 25), the claim on the mat at baseline 186 (serif 600 50), its terms at 234 (mono 25), the reading position from y 292 at x 96, the sheet up to 1728 wide (1112 beside a worksheet) and down to y 1026, the worksheet at x 1240 (584 wide); a locked camera; mount margin 24 px; the sticker ≥ 300 × 96, overlapping the mount's lower margin by 12 px.
- **Camera**: locked; every change is paper being handled (deal, slide off, turn, shuffle, louvre, match cut, split-open).
- **Texture and light**: paper tooth ±3.5 levels (seeded) on mounts and worksheets only; worksheet ruling every 64 px at 7 % ink; no grain on pages; sheets that move get sub-frame motion blur.
- **Source**: own (the dossier source film, `layout.js`, `film.js`), split from the dossier style of keynote-video. **Licence**: MIT; fonts OFL-1.1.
- **Languages**: en full · zh adapted: claims, titles and rows in Noto Serif SC (600 for claims and titles, 400 for rows) at the same sizes; a line rises character by character at a third of the English stagger (0.04 s), so it lands in about the time an English line does; mono labels at the 28 px floor with Noto Sans SC for Chinese; the capture stays in its own language; "EX. n" becomes 证物 n.
- **Sample**: `poster.jpg`, an English still 480 px wide.
