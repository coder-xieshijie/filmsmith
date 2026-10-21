# dossier template

An evidence file on a dark mat. Real published pages are mounted on paper sheets and dealt into one reading position;
the rest of the page is veiled, a highlighter strikes the exact words or number a claim rests on (multiply, so the
page's own type stays under it), a leader ties the stroke to an exhibit sticker that says where and when the page was
captured, and the claim is restated in type on the mat. A figure is carried off its page as a paper slip onto a ruled
worksheet, which does the arithmetic and strikes the result; an index of exhibits closes the file; the name is struck
on the mat. The camera never moves: paper does. Mode card: `references/modes/dossier.md`.

```bash
node <SKILL_ROOT>/scripts/new-film.mjs dossier <film-dir>
cd <film-dir>
# capture the pages (tools/capture.mjs), fill PLAN.md, edit content.js
npm run assets        # hashes, sizes, the zoom cap, what each crop shows, every number on screen printed, leaders, faces, bands
npm run palettes      # contrast table of every preset, then the accent against every band of this film
npm run fit           # timing table and the four tiers; stops on copy that cannot be read in time
npm run snapshot -- --at 1.2,5.6,8.4,11.4,16.8,20.6,23.8,28.0
npm run film          # fit → audio → check → render → renders/film.mp4
```

## Files

| File | What it is |
|---|---|
| `content.js` | The film: palette, form variant, seed, the assets with their manifest, the scenes. The only file edited for an ordinary film. No duration, no bars. Optional `bpm`, `target`, `bed`. |
| `assets/real/` | The captured pages, kept as captured (sha256 and size in content.js). The shipped three are the skill's own public pages (Example content). |
| `palettes.js` | Presets `yellow` (default), `magenta`, `coral`; the colour science (WCAG contrast, CIEDE2000) and the band report. `npm run palettes [-- --all]`. |
| `registry.js` | Scene types, slot limits, `validate(content)`. |
| `layout.js` | Where everything sits, computed from content.js alone: each sheet's scale under the zoom cap, its sticker, its bands and leaders. Pure, so the asset gate reads it too. |
| `choreo.js` | Every scene type's choreography as one table of moments in beats from the scene's start; shared by `timing.rules.js`, `film.js` and `score.mjs`. |
| `timeline.js`, `plan.js` | The fitted film as moments: keys, holds, the four tiers for `renders/timing.json`, and the sound cues. |
| `changes.js` | The page changes an exhibit may arrive by, as a registry (Page changes). |
| `timing.rules.js` | How long each scene type needs (timing API 3, format `lib/timing.js`), read from `choreo.js`; `validate` from `registry.js`. |
| `film.js` | Canvas2D renderer. `render(ctx, t)` is a pure function of `t`. |
| `score.mjs` | The `diagram` bed and the paper sounds, placed from the same moments; writes `assets/audio/mix.wav` and `measure.json`. |
| `tools/capture.mjs` | Capture a page (headless Chrome) or download a published image; prints the manifest entry. |
| `tools/check-assets.mjs` | `npm run assets`; writes `renders/check-assets.txt`. |
| `tools/vision.swift`, `tools/regions.mjs`, `tools/pixels.mjs` | Text and face reading (the OS vision framework, macOS); the band rules; ffmpeg pixel decoding. |
| `index.html` | The canvas, the static `__timelines` stub and the pre-registered build hold; `data-duration` is stamped by `npm run fit`. |

## Assets

Each entry of `content.assets` is the manifest of one file in `assets/real/`:

| Field | What |
|---|---|
| `file`, `size`, `sha256` | the file, its pixel size and its hash at capture (`tools/capture.mjs` prints all three); `npm run assets` fails when the file changed |
| `page`, `captured`, `how` | the page it shows, the capture date, the command that captured it |
| `kind` | `'as published'` (a published page) or `'as captured'` (a screen of an app, not a publication); printed on the sticker |
| `expect`, `forbid` | strings the crops must show / must not show (a superseded figure, a currency the copy does not use) |
| `drawn` | strings the film sets in code from this page; each must be printed in its crops |
| `private` | rectangles (`[x, y, w, h]`, file px) no crop may touch: an account row, a sidebar with names |

Capture larger than the film shows when the page is small: a sheet fills at most 1680 × 602 px of asset (1064 wide in a
spread), and the zoom cap is 4/3 output px per source px (principle 2); the slip lifts the figure's pixels to 1.2 × the
sheet's scale before they become type, so that lift is capped too. In a template's shipped example each file stays
≤ 200 KB (WebP, `--quality`); a film's own assets have no size limit. Crop people out: faces fail the check.

`npm run assets` checks, for every asset: hash and size; each sheet's scale and the slip's lift under the cap; private
regions outside every crop. With the OS vision framework (macOS; elsewhere these are skipped with one WARN, run them on
a Mac before delivery): every `expect`, `drawn` and `forbid` string; no face; **every number set in type on the mat, the
worksheet or the index is printed in some crop**; each leader's run over the page crosses no text; the slip's region
reads its `carry.text`. Then every band (also `npm run palettes`): the accent differs from every chromatic colour
inside it by ΔE00 ≥ 20, and the claim under a multiply stroke keeps ≥ 3:1 (or 80 % of the page's own contrast when that
was already lower); a band that cannot must run under the line (`under: true`), and then the claim's ink must end 2
source px above the band's lower edge, where the under-stroke starts.

## Time

Nobody types a duration. `npm run fit` reads every scene's choreography from `choreo.js`, reads the text through the
shared reader, rounds each scene to whole beats and the film to a 2-bar phrase. All of the rounding goes to the lockup
(`phraseShareBeats: 0`), so the scenes before it keep their own lengths and vary (T1 CV ≥ 0.3).

| Type | Choreography (beats from the scene's start) | Reading (tier) | At 120 BPM (example) |
|---|---|---|---|
| `exhibit` | arrives (open, dealt on 0.5–1.5, or under a page change of the scene before); claim on the mat at 0 / 0.25 / 1; veil +0.5; the stroke from the next whole beat, one beat; leader on the landing; sticker pressed one beat later (stamp key); terms half a beat after it | claim primary (claim), terms glance | 3.0–3.5 s |
| `claim` | the band, its veil hole and leader move to the next claim (0.4 s); the old claim sinks at 0, the new one rises at 0.25; terms at 1.5 | claim primary (claim), terms glance | 2.0–2.5 s |
| `worksheet` | dealt beside its exhibit at 0 (the exhibit is laid out as a spread from its first frame); its exhibit tab at 0.75; with `carry`, the slip lifts at 1, is set in code at 1.5, crosses the corridor and is laid down on 3 (land key); title, then the rows half a beat apart | title primary; rows glance (they restate the mat's claims) | 3.5 s |
| `result` | a rule under the rows at 0.5, the figure at 1, its caption at 1.5; the mat's claim leaves at 1.5, the first phrase rises at 1.75, terms at 2.25; the figure struck 3 → 4; the second phrase lands on 4 with the drop (climax), then a pause | phrases primary (claims), figure and caption glance (the second phrase restates them), terms glance | 4.0 s |
| `ledger` | the sheets slide off at 0; the index dealt at 0.5; phrases at 1 and 2; rows with their exhibit tabs at 1.5, 2.5, 3.5 | phrases primary (claims), rows glance | 3.0 s |
| `lockup` | the file slides off (dossier-stack, 1 beat); the mark (optional) at 0.5; the name struck 1 → 2 (lockup peak); URL at 2.5 (≥ 3 s); capture line at 3; the URL underlined on the last bar's downbeat | name, URL primary; capture line glance | 4.5 s + the rounding |

Tail moves: where a scene's last landing would hold still more than two beats (the grid, the rounding), its focus is
pressed again on a beat (the stroke, the slip or the last index tab scales 1 → 1.12 → 1 in 0.36 s). Nothing new
enters. Keys: the first stroke's landing (accent, the hook), each sticker (stamp), the slip laid down (land), the
result's second phrase (accent with `drop`, the climax), the struck name (accent), the URL underline (end).

## Global slots

| Slot | Limit | What |
|---|---|---|
| `palette` | an id of `palettes.js` | `yellow` (default), `magenta`, `coral` |
| `highlight` | `'band'` \| `'underline'` | the form variant (Variants) |
| `seed` | integer | the paper tooth |
| `meta.slug` | ≤ 40 characters | the persistent frame, top left: "Source file: …" |
| `bpm`, `target` | 112–124 | optional |
| `bed` | `{ file, offset, gain }` | optional licensed bed in place of the synthesised one |

## Scene registry

The film opens cold on an `exhibit` and closes on the `lockup`. Words are counted as the reader counts them; type never
shrinks to fit: copy over a limit is rewritten shorter (`npm run fit` names the slot).

| Type | Follows | Slots (limits) |
|---|---|---|
| `exhibit` | anything (the first scene) | `ex` (1–9), `asset`, `crop` `[x, y, w, h]` inside the file, `where` (≤ 40: domain · page · capture date, on the sticker), `enter` (required after the first: `'turn'`, `'deal'` or another page change), `edge` (`'top'` \| `'left'`, for `turn`), `sticker` (`'right'` default \| `'left'`), `band` `[x, y, w, h]` inside the crop, `under` (boolean), `leader` (`'left'` \| `'right'` \| `'down'` default \| `false`), `claim` (≤ 8 words, ≤ 46 characters; or two phrases of ≤ 5 words), `terms` (≤ 6 words, ≤ 40) |
| `claim` | `exhibit` or `claim` (same sheet) | `band`, `under`, `leader`, `claim`, `terms` as above |
| `worksheet` | `exhibit` or `claim` | `title` (≤ 22), `carry` `{ region, ink, text }` (optional: the figure's cell and its ink box in the exhibit's file px, its text ≤ 14), `rows` (1–3 of `[label ≤ 18, value ≤ 12]`) |
| `result` | `worksheet` | `value` (≤ 8), `caption` (≤ 22), `claim` (two phrases, ≤ 8 words in all), `terms` |
| `ledger` | anything but the lockup | `claim` (two phrases), `rows` (1–4 of `[ex ≤ 2, text ≤ 34 and ≤ 6 words, source ≤ 14]`) |
| `lockup` | last | `name` (≤ 14), `url` (≤ 44), `caption` (≤ 64, optional), `mark` `{ asset, crop }` (optional: a logo file, whole, above the name) |

Bands: the exact words or number the claim rests on, the whole row when the claim is a rank. Never over a data mark (a
series line, a point, a bar): mark the label instead. Leaders: `'left'` / `'right'` run from the band's end into the
mount's margin, down it and along the bottom margin to the sticker, so they cross the page only between the band and
the margin; `'down'` drops from inside the band straight to the sticker's top edge (only where the band lies over the
sticker). `false` where every path would cross page text: the figure is lifted instead (a worksheet's `carry`).
`npm run assets` checks the path.

## Page changes

`content.js` `enter` on an exhibit names how it arrives; `changes.js` is the registry, so a new set of transitions plugs
in without touching the choreography.

| `enter` | Level | What | Device (T2) |
|---|---|---|---|
| `'deal'` | — | the sheet in the reading position slides off downward (0.35 s, power2 in), the new one is dealt on from below (y +800 → 0, one beat, expo out) | none (T1) |
| `'turn'` | sheet | in the last beat of the scene before, the sheet turns away over its top edge (`edge: 'top'`) or its left edge (`'left'`), to 89° with a 2200 px perspective, power2 in, darkening as it tilts; the new sheet is already whole underneath | `dossier-page-turn` (variant: the edge) |
| any id of `lib/transitions` | frame | the frame as it runs is mixed with the new exhibit's first frame by that WebGL transition, in the last beat of the scene before (colour roles: ink, accent = the highlighter, ground = the mat, paper) | its own id |
| `register(name, def)` | sheet or frame | a change added in `changes.js` (or imported there), under its device id; add the id to `timing.rules.js` `devices` | its id |

A `sheet` change draws the outgoing sheet's canvas at a progress (`draw(ctx, { sheet, x, y, w, h, p, opts })`, optional
`travel()` for the motion blur); a `frame` change mixes two finished frames (`draw(ctx, { from, to, p, palette })`).
The same device twice in a row must change its variant (a turn over the top, then over the left edge).

## Devices: why Canvas2D, and what is local

The template draws on one canvas from `render(t)`: page changes need two finished frames (or one sheet's canvas) at
any progress, motion blur needs sub-frames of a pure `render(t)` (`lib/canvas.js` `subframes`, on every frame where a
sheet or the slip moves more than 1 px), the highlighter is one `multiply` composite over the page's pixels, and every
slot is measured before the first frame (a line that would cross its slot is a red banner, not a clipped render).

The library's `spotlight-band`, `tether-link`, `lift-out` and `value-carry` draw inside a browser window with a camera;
a dossier sheet is paper with a mount and a sticker, so the template keeps four local painters with the modules' rules
and values: the band (veil hole of the mat at 50 %, a stroke wiped in one beat with chisel ends, moved with its hole and
leader in 0.4 s), the leader (an ink case 9 px, an accent core 4 px, a dot on the band, drawn in 0.35 s), the slip
(the cell's own pixels lift to 1.2 × the sheet's scale, then in one frame the same cell is set in code on its own
sampled paper and ink, registered on its ink box, then carried along the corridor above the sheets) and the page turn.
Its own T2 devices: `dossier-page-turn`, `dossier-slip`, `dossier-stack`.

## Variants

**Colour**: `palette` (`palettes.js`; the mode card says when each fits). A new brand colour becomes a new preset
(`references/system.md`, "A preset from a brand colour"), checked with `npm run palettes -- --all` on the film's bands.

**Form: `highlight`**

| `highlight` | What changes | When |
|---|---|---|
| `'band'` (default) | every stroke covers its claim, multiply; a band whose claim is printed in colour may set `under: true` on its own | most films |
| `'underline'` | every stroke on a page runs under its line: a strip ≥ 7 px from 2 source px above the band's lower edge, the lit region (the veil's hole) still covering the claim; the result's stroke runs under the figure; the band behind the name at the close stays | pages printed in colour throughout, or a darker preset (`magenta`) over coloured type |

## Shortest cut

`exhibit` → `claim` → `lockup`: one page, two claims, the name. 12 s at 120 BPM (3 + 2 s, the lockup takes the
rounding). The first frame is already the page on the mat; the last half second is the lockup at rest.

## Fixed parts

The dark mat and paper sheets with hard edges; the persistent frame (slug, page in hand); the claim restated on the mat
at y 140; one reading position from y 292; stickers at the sheet's lower right (or left), overlapping only the mount's
margin; the worksheet at x 1240 beside a spread; Source Serif 4, IBM Plex Mono, and Inter Tight only inside the slip.

## Example content (shipped)

The skill filming its own public pages, captured 2026-10-21 with `tools/capture.mjs page`: the README's "Ten styles"
section, its "asks very little of the agent" list and the 0.3.0 entry of the CHANGELOG. Three claims are struck where
they are printed; the loudness numbers are carried onto a worksheet ("Loudness margin": −1.5 dBTP gate, −1.9 dBTP
ceiling → 0.4 dB). 9 scenes, 16 bars = 32.0 s at 120 BPM:

`exhibit` (cold open, the hook) → `exhibit` (`turn`, top edge) → `claim` → `exhibit` (`turn`, left edge; a spread) →
`claim` (no leader) → `worksheet` (the slip) → `result` (climax) → `ledger` → `lockup`

Every number on screen is printed on the page it comes from (`npm run assets`: 43 PASS on macOS).
