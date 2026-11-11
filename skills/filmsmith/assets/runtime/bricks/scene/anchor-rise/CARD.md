---
id: anchor-rise
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### anchor-rise

- **Purpose**: On paper the anchor rises into its point and lands on beat 1; a contact wave and coarse rings run out of it; the problem lands in one or two big lines.
- **Intent**: The one brand piece arrives first and the problem lands beside it, so the viewer has a focal point before any feature.
- **Content**: One or two problem lines (≤ 15 chars / 8 字 each), an optional label (≤ 30 / 16 字).
- **Fits**: `hook`, `problem`; The hook of a print film: the problem stated beside the one brand piece that will run through the film. **Not for**: Openings without a mark piece; long setups.
- **Layout and camera**: the text column x 150–1130 (lines at y 520 and +1.08 size, label at 330); the anchor at (1440, 540) at 1.45 × its film size; the field right of x 1060.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of text | primary | 1–2 | 3 words, 15 chars | 8 chars | ["Everyone talks", "at once."] |
  | `label` | text | glance (optional) | 1 | 6 words, 30 chars | 16 chars | one mic · room 4 / 一支麦克风 · 4 号会议室 |

- **Length**: 4–8 beats (2–4 s at 120 BPM); the sample plans 5 beats in English, 6 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 the anchor rises 820 px; beat 1 it lands with a squash, the contact wave runs out, the first line lands; 1.5 the label; 2 the second line; the rings step a wavelength a beat.
- **Needs**: motions none; props anchor-mark; roles ground, ink, dim, accent; type display, mono.
- **Sound**: `hit` on 1, `land` on 2, `tick` per ring step.
- **Styles**: made for `halftone` (recipe the halftone recipe); fits halftone; avoid none.
- **Source**: own (`assets/templates/halftone/film.js (toneAt hook, riseSpeed, ready hook)`), split from the template of the halftone style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; big words take Noto Sans SC 800 after Bricolage Grotesque; Chinese line spacing 1.18 instead of 1.08; the product name stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the halftone template (`assets/templates/halftone/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the halftone recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Keep the opening field coarse and light (24 px screen, peak 0.36); a dense first screen buries the anchor.
