# Handset (`handset`)

One code-drawn device — a laptop for a desktop or web product, a phone for a mobile one — sits head-on and locked off on the left of the frame from the first frame to the last; everything that changes, changes on its screen, and the screen shows only real captures: the product's own pages and UI states, its docs, its official charts. The words live in a margin to the right, riding level with the part of the screen in play; the device's chin names where the screen's state comes from. Aesthetic anchor: "like a product demo shot on one locked-off camera, with the presenter's notes pinned in the margin — except every pixel on the screen was captured, none drawn".
Theme: tech-product-launch (a release that can be seen on the product's own surface) · Template: `assets/templates/handset/` · tempo 112–128 BPM, default 120 (length follows the copy; the shipped example fits 15 bars = 30.0 s) · timing API 3 · Status: owner-accepted 2026-10-21 (sample film, its sound included); template 2026-10-21. Values are tagged `standard` / `borrowed` / `derived` / `owner` / `draft` as in [foundations](../foundations.md#where-values-come-from).

## Fits / does not fit

Fits: a launch whose claim can be **seen on the product's own surface** — a model that ships as the default in an app's picker, a feature that is one new panel, a price on the pricing page, a score on the official chart, a line in the docs — and a product that has real, current captures of those surfaces (2× or 3× device pixels). 25–60 s; a 12 s sting is `wake` → `flip` → `lockup`.

Does not fit:
- a product with no screen (a library, an API with no console: phosphor or morph);
- a story of many artefacts side by side, whose relation is the content (exhibit, tally);
- a mechanism (trace);
- a product whose only images are marketing composites (several windows on a gradient, a phone over a laptop): a mockup inside the mockup is not a screen state;
- a product whose UI is not released yet, or whose captures disagree with the copy (an older name in the picker): the mode cannot draw the missing state, so the film cannot be made.

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **A model or feature that ships inside an app, 30–45 s** (best fit) | an editor's new default model: the download page; a push onto the picker that reads the model's name; a flip to the official benchmark chart, the light on the model's series; back to the download page for the lock-up | `wake` → `push` → `flip` → `band` → `claim` → `lockup` |
| **A tool shown through its own docs** (the shipped example) | Filmsmith filming its own README: the lede, the style stills, the guide's requirements, the pace line, the loudness check (30 s) | `wake` → `push` → `push` → `flip` → `band` → `scroll` → `claim` → `lockup` |
| A pricing or plan change, 15–25 s | a new tier on a pricing page: the page at rest → the light on the tier → a push onto the price, repeated in the margin → a flip to the checkout page | `wake` → `push` → `claim` → `lockup` |
| A number that changes on the same screen | a dashboard before and after a release: two captures of the same view, a registered `cut` on the beat, so only the number changes | `wake` → `push` → `cut` → `lockup` |

## Mode principles

1. **One device, locked off.** The device is on screen from the first frame to the last, head-on, at one size and place; the camera never moves. Only the screen's viewport moves (push, pull, pan, scroll) and the light on it. The device itself moves in two ways only: the opening wake, and a flip to change surface (≤ 3 a film; two flips in a row turn opposite ways). *(Narrows 7, a through-line object, and 4, keep the followed object on screen; object constancy. Locking it off, with no tilt and no swing-in, is this mode's own.)*
2. **The screen shows only real states.** Every screen state is a real capture of a real surface, saved unedited (sha256 in the manifest) with the region the film may show (`public`). A motion between two states is re-enacted only when both states were captured; a state that was not captured is not drawn, however simple. Code draws marks on the screen (the light, the ring) and the hardware round it — never a window, a control, a page or a chart. *(Narrows 2, precision, and 9, the style points at the content; `owner` 2026-10-20: real assets carry the key content.)*
3. **The device holds the evidence; the margin holds the words.** Text in a capture is evidence: it may be small, and it is never what the viewer must read. Anything the viewer must read is set in code in the margin, ≥ 25 px (main lines ≥ 40 px), clear of the device, and every number in it is read off the capture by the check. *(Narrows 1, readable before beautiful, and 3, one protagonist: the device is the picture, the margin the text.)*
4. **Push under the cap.** A push enlarges a capture until one output pixel covers no less than 0.75 source pixels (output / source ≤ 1.333): the screen never shows interpolated pixels. Captures are taken at 2× or 3× to buy that headroom; the code clamps every view to the cap. *(Narrows 1 and 2.)*
5. **One fixed accent per preset, apart from what it rings; it marks only the region in play.** The accent is the preset's, never computed per film. A film may use a preset only if its accent differs by **ΔE00 ≥ 20 from every colour filling ≥ 2 % of each region it rings**; a film whose captures fail that takes another preset. It is drawn only on code marks — the ring, the level tick — never on copy, never on a capture; on a white page it rides on a 9 px under-stroke of the ground so it reads at any brightness. *(Narrows 7, one accent, one meaning; `owner` 2026-10-20.)*
6. **Level rail.** The level tick on the device's right edge sits at the height of the ringed region, and the margin's copy block rides level with the lit region: when a push, a scroll or a hop moves the region, the copy moves with it. Word and evidence are read across one horizontal. *(Narrows 3, signalling; spatial contiguity.)*
7. **The chin names the source.** The device's chin (under the phone: a line beneath it) shows where the screen's state comes from, host and path in mono 25 px; it changes only with the screen, on a flip's swap frame. It is the persistent frame and carries nothing else. *(Narrows 2, a quoted number keeps its source, and 7, a persistent frame carries real information only.)*

## Rules for real assets

| Rule | Value | Tag |
|---|---|---|
| Capture | one viewport at the screen's aspect, or one page segment the screen scrolls through; headless Chrome, en-US, 2× or 3×, no browser chrome, clipped by selector or heading (`tools/capture.mjs`); overlays a reader would dismiss (a cookie bar) are removed before the shot, nothing else | `derived` |
| Not changed | the file is the capture (sha256 in the manifest); the film only shows it through views (crop and scale) and veils it; never recoloured, retouched, re-laid out or regenerated; a rebuilt UI never stands in for a capture | `standard` (principle 2) |
| Public region | the manifest names the only part of each capture the film may draw (`public`) and the parts it must never show (`private`, e.g. a sidebar with account names); `npm run assets` checks every view stays inside | `owner` (2026-10-20) |
| Supplied screenshots | an app screenshot supplied by its maker is used as supplied (hash), never re-encoded; its public region is set before the first scene is written | `owner` (2026-10-20) |
| UI in another language | its text is evidence only (a push may show it); every margin line is English and code-drawn | `owner` (2026-10-20) |
| A live readout | a number the app shows while working is one moment, not a benchmark: the margin says whose number it is and when, and the vendor's figure sits next to it as the vendor's | `derived` (principle 2) |
| Zoom cap | output px / source px ≤ 1 / 0.75 = 1.333 | `standard` (principle 2) / `derived` |
| Numbers | every digit in a scene's copy appears in the `reads` of the region that scene lights; macOS Vision reads `reads` back inside the region's box (WARN where OCR is unavailable) | `derived` |
| People | no faces, no avatars, no account names: left out of the capture or out of `public`, never covered | `standard` |
| Dates | a capture older than the claim (a name the launch changed) is not used; re-capture before using a saved copy | `derived` |
| Size | a template ships images ≤ 200 KB each | `derived` |
| Accent against the capture | ΔE00 ≥ 20 between the accent and every colour filling ≥ 2 % of a ringed box (`npm run palettes`, `npm run assets`) | `owner` (2026-10-20); principle 5 |

## Palette presets

Captures are content colour and are not counted. The neutrals are the device and the margin; the accent is only on code marks.

| id | name | fits | ground `bg` | `lid` / edge | `deck` / edge | `glass` | `ink` | `muted` | `dim` | accent | veil |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `graphite` | Graphite and focus lime (default) | most products: white pages, blue or red interfaces, charts | `#0E1013` | `#1A1D22` / `#30353C` | `#22262C` / `#3B4048` | `#07080A` | `#ECEEF1` | `#A9AFB8` | `#8B929C` | `#ADE05E` | 0.52 |
| `umber` | Warm graphite and amber | captures that are green or teal | `#100F0D` | `#1C1B18` / `#34322D` | `#25231F` / `#403D37` | `#080807` | `#EFEDE8` | `#B1ACA2` | `#948F85` | `#FFB45C` | 0.52 |
| `porcelain` | Porcelain and deep green (light) | a light film, or a dark-mode product (a dark screen on a light ground) | `#ECEEF1` | `#D3D7DD` / `#B8BEC6` | `#C5CAD1` / `#AEB4BC` | `#101215` | `#14161A` | `#454B53` | `#50565F` | `#3D7A0A` | 0.40 |

**Default: the dark ground** (`owner`, 2026-10-20). Contrast (`standard`, WCAG 2.2, `npm run palettes`): `graphite` ink 16.4, muted 8.6, dim 6.1 on the ground and 5.4 on the lid, accent 12.3; `umber` ink 16.4, muted 8.5, dim 6.0 / 5.4, accent 10.9; `porcelain` ink 15.6, muted 7.6, dim 6.4 / 5.1, accent 4.53 (graphics: ≥ 3). The lid's fill is close to the ground (about 1.1–1.2): the device's outline is its 2 px edge. Collisions (ΔE00): focus lime is 10.5 from a common sportswear "volt" and 15.0 from a mobile platform's green; amber is the system's P3 amber. Ground and device neutrals `derived` (system neutral rules, cool for `graphite` and `porcelain`, warm for `umber`); accents `derived`; the shipped example's `umber` fails the accent rule on its style stills (8.8), which is the rule doing its job.

## Variants

**Colour**: the three presets, picked by the accent rule.

**Form: `device`** (content.js; the default renders exactly as the approved sample's device):

| `device` | What changes | Choose it for | Source |
|---|---|---|---|
| `laptop` (default) | head-on lid 1192 × 800, a 16:10 screen 1152 × 720, a chin naming the source, an 18 px deck; margin on the right, 448 px | desktop apps, web apps, docs and blog surfaces | `owner` (the approved sample, 2026-10-21) |
| `phone` | head-on phone 440 × 920, screen 400 × 840, the source line under the device; margin 996 px | mobile apps and mobile pages, captured at the phone's width (390 CSS px at 3×) | `borrowed` grammar (portrait app demos turned to 16:9), `draft` values |

Why the device and not another axis: the device is the protagonist and its kind is set by the product (the claim must be seen where users meet it), not by taste. A code-drawn hardware frame, not the app's own window, carries the film (2026-10-20): the window's own frame usually sits in the part that must be cropped (a sidebar with session titles), one device must also carry the official page and chart, and an app window showing a web page would claim the app showed it; plain hardware claims nothing about the product, so it holds every surface honestly while the chin says whose each is.

## Accent role

- **Accent** marks one kind of thing: *the region of the screen in play*. It appears as the ring (4 px on a 9 px under-stroke of the ground, radius 10, drawn on in 0.25 s) and the level tick (8 × 48 px on the device's right edge). At most one region at a time; well under 1 % of the frame.
- **Veil**: not a colour role — a uniform dim of the ground over everything on the screen but the lit region (a box with padding, or a full-width band for a row). It is the spotlight; it never sits on the margin.
- **Status, category, effect**: none of the mode's own. Colours inside a capture (a chart's series, the product's brand colour) are content.
- **Change of ground**: none. The device is never removed, so the ground never floods.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| The number or name (display) | Inter Tight 700, −0.02 em | OFL 1.1 | 95 (76 for the whole film when a value does not fit the margin) |
| Margin lines | Inter Tight 600 | OFL 1.1 | 49 |
| Notes, the chin's source line, the closing URL | IBM Plex Mono 500 | OFL 1.1 | 25 |

Information text ≥ 25 px, main lines 49 px (`standard`, principle 1). Text inside captures is evidence and is not counted (principle 3); at rest it renders at about 7–15 px, decoration. One sans plus one mono (system pairing rule). Families `borrowed` (system).

## Type scale

25 × 1.25ⁿ: 25 · 31 · 39 · **49** · 61 · **76** · **95** · 119 (`derived`; the 25 px floor). In use: 95 (or 76) / 49 / 25 — three levels. The lock-up's optional mark is an image, not a type level.

## Frame and grid

1920 × 1080; graphics-safe 96 px. Laptop lid at (96, 131), 1192 × 800, radius 28, 2 px edge; screen at (116, 151), 1152 × 720, radius 8; chin 31 px above the deck; camera dot on the top bezel; deck 1272 × 18 at (56, 931) with a thumb notch. Phone body at (300, 48), 440 × 920, radius 64; screen at (320, 88), 400 × 840, radius 44; a camera pill. Margin: laptop x 1376–1824 (448 px, 88 px clear of the lid), phone x 828–1824; the copy block's value line sits level with the lit region, clamped to the safe area. No drop shadow, no reflection, no tilt, no floor. A fixed seeded 256 px grain at 4 % overlay. Persistent elements: the device and its chin.

## Scenes

| Type | Purpose | Length at 120 (example) |
|---|---|---|
| `wake` | opens (T3 hook): the lid's edge draws from the camera dot, the screen lights on the first capture on beat 1, the name enters; the source line appears on the chin | 3.0 s |
| `push` | viewport-push to a region (≤ cap); the light; value, note and line; the ring and the tick | 2.5 s |
| `cut` | a hard cut on the beat to another capture of the same screen, registered on the region | about 2 s |
| `flip` | device-flip to another surface; chin and screen change on the swap frame (T2) | 3.0 s |
| `scroll` | the page's own scroll to another stop of the same capture (T2) | 3.0 s |
| `band` | the light hops row to row on a still capture; each row its own copy | 4.5 s (2 rows) |
| `claim` | the region lit, the lead read; the push lands on the bar line with the value (T3 climax), read in a pause | 5.0 s |
| `lockup` | back to the product's surface at rest, veiled; the name, the line, the URL (≥ 3 s); the region ringed again on the last downbeat | 6.5 s (takes the bar rounding) |

Slots and limits: `assets/templates/handset/TEMPLATE.md`.

## Signature transformations

The moves are pluggable (TEMPLATE.md, Moves): each role is an adapter over a hand-off module, so a new transition set can replace any of them without touching the choreography. Fast frames get sub-frame motion blur (`lib/canvas.js` `subframes`, speed-gated: only frames whose fastest point moves over 1 px a frame).

- **viewport-push** (role `push`, T0–T1): one zoom about the point both views share, log scale, the module's curve (the move takes 0.8 of its beat, cubic in-out), so the region travels on a straight line; pans are the same at equal zoom; the light and the ring are drawn in source pixels through the same view and are carried exactly. `borrowed` (shared hand-off).
- **spotlight veil** (role `hop`, T0): a dim of the ground with a hole: a padded box, or a full-width band for rows of a list or paragraph; the band hops row to row in one beat with the shared `spotlight-band` curve. `borrowed` / `derived`.
- **level-rail** (T0): the margin's copy block slides on the same ease to stay level with the lit region; the tick sits at the ringed region's height. `derived`.
- **device-flip** (role `flip`, T2): the whole device, painted as a texture, turns about its vertical axis to edge-on (ease in), the screen state and the chin change on that frame, and it lands from the other side (ease out), darkening as it turns; 2 beats, swap at 0.433. ≤ 3 a film; two flips in a row turn opposite ways (`right`, `left`); two contents are never visible together. `borrowed` (shared hand-off).
- **page-scroll** (role `scroll`, T2, this template's own): the screen re-enacts the page's own scroll through one captured page segment, 2 beats cubic in-out, motion-blurred; it carries the viewer between two stops on the same page where a flip would claim a change of surface. `derived`.
- **in-frame cut** (T0): a hard cut on a beat between two captures of the same screen, registered so the changing element keeps its place. `derived`.
- **slot-rails** (system): the margin's lines enter up through their rail (0.36 s, expo out) and leave (0.2 s). `borrowed` (system).
- **screen-wake** (T3 hook): the 2 px edge draws from the camera dot both ways (0.45 s); on beat 1 the first capture comes up from black over 0.3 s, monotonic, no overshoot; `edges: 'cut'` starts on the lit device. `derived`.

**Against the nearest references** (principle 10, the mode's fixed grammar, checked once here; 2026-10-20): app-demo launch films with a phone on the left and big type on the right, in-device zoom, flips and a spotlight band. Shared (4 of 13): device left and large text right as a fixed template; in-device zoom; a flip to change screen; a spotlight band. Not shared (9): a tilted phone with a drop shadow on a light ground (head-on, no shadow), a second accent for callouts (one accent), a tab label on the screen (the chin names the source), a cube swarm becoming a chart, one phone becoming three fanned isometric, an icon route diagram, a dip to the ground between sections, an app-store badge and QR end card, a pulse under everything. Under half. Not in the references: the cap and the capture rules, the level rail, the chin's provenance, re-enactments only between captured states, the locked-off device.

## Motion

| Value | Setting | Tag |
|---|---|---|
| Copy group | value on the landing; note and line one beat later; the ring one beat after that | `derived` |
| Push | 1 beat, the module's curve (move in 0.8 of it, cubic in-out); the light 0.4 beat in | `borrowed` (module) / `draft` |
| Hop | 1 beat, `spotlight-band` | `borrowed` (module) |
| Flip | 2 beats, edge-on at 0.433, perspective 2200 px about the device's centre | `borrowed` (module) |
| Scroll | 2 beats, cubic in-out | `draft` |
| Ring | draw-on 0.25 s from the top-left corner; the tick follows it | `draft` |
| Margin text | slot-rails, enter 0.36 s, leave 0.2 s | `borrowed` (system) |
| Holds | after each landing the picture holds only once its text has landed; every still stretch is a declared hold (0.2 s to 2 beats; the claim's a pause) | `standard` (principle 5) |
| Motion blur | `subframes` on every frame whose fastest point (the screen's corners in a push or scroll, the device's edges in a flip) moves over 1 px a frame; shutter half a frame | `borrowed` (system) |
| Ambient | none: the device is locked off and a still screen is the point | `derived` |
| Tempo | 120 BPM default (112–128) | `draft` |

## Sound

Bed: the kit's `data` preset (a soft muted four-on-the-floor, a plucked up-down arpeggio, a warm pad, a round bass) at 120 BPM in F, `mix: 'v2'` (`owner`, 2026-10-21: approved on the sample film). The arrangement follows the scenes: an intro under the wake, a build under the pushes and flips, the groove from the first band or scroll to the claim (its melodic layer dropped while the claim is read), a build after it and an outro under the lock-up. The sounds belong to the device: a tick and a soft low body on each landing, a short sweep and a muted thock on a flip's swap frame, a sweep under a page scroll, an impact and a rolled chime with a duck before the claim, a chime on the screen lighting, a bell on the lock-up. Master −14 LUFS, true peak ≤ −1.5 dBTP after the renderer's AAC, `tone: 'v2'`.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here.

- The `graphite` preset: the head-on graphite laptop on the left, the margin on the right, focus lime on the ring and the tick.
- The chain wake → push → push → flip → band → scroll → claim → lockup, with two flips that turn opposite ways.
- The copy group (value, then note and line, then the ring) in every state.
- The `data` bed in F at 120 BPM.
- The example copy: Filmsmith filming its own README (`Every frame`, `drawn in code`, `Its frames`, `drawn, not filmed`, `Any agent`, `No API key`, `One file`, `2–3 s`, `−14 LUFS`, `loudness, checked`, `an agent skill`).

**Banned in this mode (the gallery default look and its neighbours; a film showing any of these fails P1):**

- A tilted or floating phone or laptop with a stock drop shadow on a soft gradient, a blurred blob or bokeh; any device that is not head-on at rest.
- Stock device mockup images or photographic bezels, glossy screen reflections, a moving highlight across the glass.
- Glassmorphism cards in the margin or over the screen; an italic, gradient or differently coloured word in a headline; a tiny uppercase eyebrow over the copy.
- Painted, photographed or textured backgrounds; a ground that changes colour per app.
- Drawn or rebuilt UI presented as the product (a fake picker, a fake browser window, a fake splash); a generated or illustrated screen.
- Several devices fanned, carouselled or laid isometric; devices swinging in from off-screen; the device leaving the frame.
- Cross-dissolves between screen states; a flash to cover a swap.
- An app-store badge or QR end card; a mascot.

## Don'ts

- Do not draw a state the product does not have, or one you did not capture (principle 2).
- Do not push past the cap to make capture text "readable"; set the line in the margin instead (principles 3, 4).
- Do not put the accent on copy, on a capture or on two regions; do not keep a preset that fails the accent rule (principle 5).
- Do not let the light's edge cut a word: size the region's box or band round it.
- Do not flip more than three times, or twice the same way in a row (principle 1).
- Do not use a capture whose words disagree with the copy: re-capture or drop the scene (rules for real assets).
- Do not crop people in, and do not show anything outside `public`.

## Checks

- **P0**: `npm run assets` 0 FAIL (hashes, sizes, `people`, every view inside the public region and under the cap, every margin number in its region's `reads`, OCR of `reads` where available, the accent ≥ 20 ΔE00 from every ringed region); `npm run fit` reports no errors (API 3: T0 gaps ≤ 4 beats, compositions median 2–3 s and ≤ 6 s, CV ≥ 0.3, 2–4 expressive transitions in 30 s, 2–3 peaks with the climax at 60–85 %); `npm run palettes` passes; the margin text ≥ 25 px and ≥ 4.5:1 on the ground; `hyperframes check` 0 errors; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; `check-film` 0 FAIL; no person, avatar or account name on any frame; the device never leaves the frame.
- **P1**: the banned look absent; the motif count against the nearest references stays under half; something changes about every beat; ≤ 3 flips, alternating; each landing puts the copy level with the region; the claim has its pause.
- **P2**: no word cut by the light's edge; the ring closes exactly on its start; no ghost of the old state on a flip; the chin changes on the swap frame, not before.

## Known issues

- **Transitions alike across modes** (`owner`, 2026-10-21: the sample films' moves felt too similar, flip and lift): the four moves are pluggable (TEMPLATE.md, Moves) so a more varied set (a momentum scroll, a feed of stacked screens) can replace them; none is swapped yet.
- **Flip edge**: the device has no side face, so the edge-on frames show only a hairline, and the perspective makes the near edge tall for a frame. A later version could draw a 10–14 px side.
- **The margin blurs while it rides a move** (the level rail moves it with the push, and the sub-frame blur takes the whole frame); a later version could draw the margin outside the blurred layer.
- **Captures are scarce**: a tap re-enactment needs two consecutive captured states of one control; the template has no tap type yet.
- `phone`, `umber` and `porcelain` render the example and pass the checks, but none has been judged on a film; the phone needs mobile captures (the example's desktop pages show as texture on it, and `npm run assets` warns).
- Focus lime is new to the skill and its collision search covered only the named neighbours.
