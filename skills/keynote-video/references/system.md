# System: the values every mode shares

The composition layer under the modes: neutrals, accents and named colours with their provenance, type families and how they pair, type scales, spacing and safe areas, corners and strokes, motion and sound recipes. A mode card takes its values from here, or states the departure and its reason ([foundations](foundations.md#who-decides)). A new mode starts here before it invents anything.

Tags as in [foundations](foundations.md#where-values-come-from): `standard`, `borrowed`, `derived`, `owner`, `draft`. Colour figures are CIELAB (D65) and WCAG 2.2 contrast; the study behind them is the workshop's colour audit of 2026-10-17.

## Colour

### Neutrals

| Rule | Value | Tag |
|---|---|---|
| Light ground is a near-white, never pure white | L* 92–97 (print paper white is L* 95: ISO 12647-2, FOGRA51); chroma ≤ 5 | borrowed |
| Dark ground is a near-black, never pure black | L* 2–8; a tinted ground (blueprint paper, chalkboard) may sit at L* 11–23 when the mode is named for it | borrowed |
| Neutrals lean toward the accent's hue, or toward the paper's | one hue for the whole neutral ramp: Radix pairs grey with the nearest accent hue, Material 3 tints neutrals with the source hue (HCT chroma 4–8) | borrowed |
| Darker neutrals carry more chroma than lighter ones | the mid tones are the most saturated (Taylor's rule: colour proportional to darkness) | borrowed |
| Three text tones per ground | `ink` (primary), `muted` (secondary), `dim` (labels), each ≥ 4.5:1 on the ground and on any panel it sits on | standard |
| No pure `#FFFFFF` in the content | a headline highlight tops out at an accent-tinted near-white (terminal: `#EEF7F1`); white is kept for error banners | borrowed |
| A mode's warm neutrals stay warm, its cool ones cool | no single grey borrowed across presets of different temperature (fixed 2026-10-18 in ink, tally, trace) | borrowed |

### Accents and the four roles

Colour beyond the neutrals plays one of four roles ([principle 7](principles.md)): **accent** (one kind of thing, ≤ 10 % of the frame as a mark), **status** (error, warning; only on the item in that state), **category** (chart or diagram classes; few, CVD-safe, ΔE00 ≥ 15 normal and ≥ 8 under simulated deficiencies), **effect** (transients ≤ 0.1 s that mark nothing).

How an accent is chosen (`derived`):

1. From the domain's own lineage: the colour the field already uses for this kind of thing (a terminal's phosphor, a blueprint's amber note, the tool's own palette for a mechanism).
2. Narrowed by the standards: ≥ 3:1 against its ground for large type and graphics, ≥ 4.5:1 if it ever sets small text; on a dark ground lower its chroma a step (Material's dark-theme guidance).
3. Searched for collisions with known brands (ΔE00 < 5 is a collision); a collision goes to the owner, who decides.
4. Small accents read best on a ground of contrasting hue (amber on Prussian blue, green on black): a measured preference, not a rule of harmony.

### A preset from a brand colour

When the user asks for a product's own colour, it becomes a new preset in the mode's `palettes.js`; `content.js` still names a preset id. The brand collision of step 3 above is the point here, and the user's request settles it. Steps (`derived`; the `coral` preset in six modes, 2026-10-19/20, accepted with six films):

1. **Base.** The brand guide's flat (single) colour is the accent, unchanged wherever it passes the mode's contrast check on the grounds it lands on. The preset's comment cites the guide.
2. **Where it fails**, move it along its own OKLCH hue and chroma, lightness only, until it passes; record the new value, its contrast and its ΔE00 from the brand value. Past about ΔE00 10 it stops reading as the brand (a coral lightened that far reads as salmon): then keep the brand value and narrow the grounds it may land on instead (pulse's `accentOn`).
3. **Grounds and neutrals** stay the mode's, or lean toward the accent's hue under the neutral rules above. A ground of the accent's own hue may replace one that makes the accent vibrate (a red accent on blueprint blue moved to an oxblood ground).
4. **Gradients.** A brand gradient is used only where the mode already draws two stops or a highlight; a flat mode uses the flat colour.
5. **Collisions inside the preset.** A status or effect colour within ΔE00 10 of the new accent changes hue (phosphor's red `bad` moved to violet next to a coral accent).
6. **Names.** The id and name describe the colour (`coral`, "Coral red"), never the brand; the brand, its guide and the film are named only in the film's README. Add the preset's row to the mode card's palette table and to `TEMPLATE.md`, and run the mode's palette check.
7. **Meaning.** The accent keeps the mode's one meaning (principle 7). When the brief asks the brand colour to mark the product's results and the mode's accent means a person, use the card's variant for a film where no person decides (plakat, blueprint).

### Named colours, with provenance

A name is only used when its value can be traced; otherwise the preset gets a plain descriptive name. Use this pool before inventing a hue.

| Name | Value used | Provenance | Used by |
|---|---|---|---|
| P1 phosphor green | `#3DDC84` | P1 phosphor chromaticity x 0.218, y 0.712 lies outside sRGB; this approximation coincides with Android's brand green and was kept by the owner (2026-10-17) | phosphor `phosphor` |
| P4 ice white | `#88BFFF` | P4 blue-white phosphor tint, saturated until it separates from the neutral text (ΔE00 17); ΔE00 3.7 from Catppuccin's blue (a theme, not a brand); the owner's default for phosphor (2026-10-18) | phosphor `ice` (default) |
| P3 amber phosphor | `#FFB45C` | lightened off `#FFB000`, which sits ΔE00 0.8 from a design tool's brand | phosphor `amber` |
| Prussian blue (cyanotype paper) | blueprint `paper` | the drafting tradition; no measured Lab for hand cyanotype found | blueprint |
| Swiss red | `#FF3B1F` (approximates the federal `#FF0000`) | Swiss federal design manual gives `#FF0000`; RAL 3001 "Signalrot" is a different, darker red, so the name "signal red" is not used | plakat `signal` |
| Safety orange | `#D36F01` | ANSI Z535.1 Safety Orange 5.0YR 6.0/15 hue, darkened until it passes 3:1 on paper (the centre `#E27700` does not) | plakat `orange` |
| Safety red | `#BF2417` | ΔE00 3.1 from ANSI safety red 7.5R 4/14 | tally `paper-red` |
| Safety yellow | `#EAC600` | approximates ANSI 5.0Y 8.0/12; held in reserve, not used | — |
| manim TEAL_C / RED_C | `#5CD0B3` / `#FC6255` | manim's named colours: the explainer domain's own tool | trace category colours |
| manim YELLOW_C (Community) | `#F7D96F` | Manim Community's YELLOW_C | trace `active` |
| International Klein Blue | not used under that name | IKB was registered as a technique, not a colour; the web's `#002FA7` was set without a source (Wikipedia edit, 2005); the Klein archive images average about `#0049A0` | — |
| Paper white | L* 95, b* −4 to −6 (coated); FT's `#FFF1E5` as a warm reference | ISO 12647-2, FOGRA51; Financial Times identity | the light grounds |

## Type

### Families

Every family is SIL OFL 1.1, fetched from one pinned google/fonts commit by `setup-fonts.mjs`, its licence file copied next to it.

| Family | Class | Role in the skill | Modes |
|---|---|---|---|
| Inter | neo-grotesque | display and text on screens | phosphor |
| Inter Tight | neo-grotesque, tight | display and text in print-like modes | plakat, tally, trace (UI text) |
| IBM Plex Sans Condensed | condensed grotesque | drafting titles and values | blueprint |
| Archivo (wdth axis) | grotesque on its width axis: extra-condensed (default) or extended (`typeWidth`) | slammed display type; semi-expanded claims beside a seam | ink, split |
| Bricolage Grotesque | expressive grotesque | display in a reel | thread |
| Instrument Serif | display serif | one editorial line | thread |
| Source Serif 4 | text serif | explainer titles and thesis | trace |
| JetBrains Mono | monospace | real code, commands | phosphor, thread, trace, split |
| IBM Plex Mono | monospace | labels, data, commands | plakat, blueprint, ink, tally |
| Hanken Grotesk | grotesque (variable, wght axis) | intertitles, labels and the name on a light box | strip |
| Schibsted Grotesk | news grotesque (variable, wght axis) | quotes, the hook and the name over a long page | scroll |
| DM Mono | monospace | measured values: lengths, the address | strip, scroll |

### Pairing rules

- At most two families plus one mono per film ([principle 7](principles.md)).
- Mono only for what is really code, a command, a hash or a data label; never for headings that merely want to look technical.
- A serif appears only where the content is editorial or explanatory (a thesis, a quotation); a launch film stays sans.
- Pair within one design system when possible (Plex Sans with Plex Mono); otherwise pair by x-height and stroke contrast, and settle a hesitation with five-second samples (tech-product-launch rule 6).
- Chinese faces are not part of this version; on-screen text is English.

### Scales

One series per mode; sizes within 15 % are one level, neighbouring levels ≥ 1.25 apart, at most three levels in the content area ([principle 3](principles.md)). Information text ≥ 25 px, main text ≥ 40 px ([principle 1](principles.md)).

| Mode | Series | Tag |
|---|---|---|
| phosphor | 25 · 32 · 40 · 50 · 64 · 84 · 108 · 150 · 190 · 240 | derived |
| plakat | 25 × 1.3685ⁿ: 25 · 34 · 47 · 64 · 88 · 120 · 164 · 225; three tiers a page, display 120 / body 34 / label 25 | derived (2026-10-18) |
| blueprint | ISO 3098 √2 heights at 10 px a millimetre: 25 · 35 · 50 · 70 · 100 · 140 · 200 · 280; title 140 / notes 35 / labels 25 | standard (2026-10-18) |
| ink | √2 for labels (28 · 40); display fitted to its slot | derived |
| thread | ratio ≈ 1.3: 26 · 34 · 44 · 58 · 76 · 98; display fitted to its slot | derived |
| tally | 25 · 32 · 40 · 64 · 150 · 210 · 273 · 300 | derived |
| trace | 26 · 40 · 54 · 76/82 (label · text · display) | derived |
| strip | 4/3 from 25: 25 · 33 · 44 · 59 · 79 · 105 · 140; intertitle 79 / labels 59 / the sheet's names and lengths 33, the name 140 | derived |
| split | 4/3 from 25: 25 · 33 · 44 · 59 · 79 · 105; claims 59 / request and command 44 / code 33 / labels 25, the name 105 | derived |
| scroll | 25 × 1.4ⁿ: 25 · 35 · 49 · 69 · 96 · 134; hook 96 / quotes 69 / slot and claim 49 / label 25, the name 134 · address 35 | derived |

A new mode picks a named series (ISO 3098 for drawings, a modular ratio ≥ 1.25 from the 25 px floor otherwise) before it sets any size.

## Space

| Value | Rule | Tag |
|---|---|---|
| Graphics-safe area | everything that carries information stays inside 5 % of each edge: 96 px left and right, 54 px top and bottom at 1920 × 1080 | standard (SMPTE ST 2046-1, EBU R 95) |
| Content margins | 96–150 px left and right, by mode (swiss and tally 96, terminal 110, diagram 130, ink and blueprint 150) | borrowed (source films) |
| Spacing step | multiples of 8 px for gaps and offsets in new layouts; a grid mode uses its own module (swiss: 146 px columns) | draft |
| Grid | a print mode shows its grid (swiss 12 columns); other modes keep an invisible one | borrowed |

## Corners and strokes

| Value | Rule | Tag |
|---|---|---|
| Corners in print modes | square: plakat, blueprint, ink type and rules | borrowed (international style, drafting) |
| Corners in screen modes | small radii, one per element kind: terminal panels 10 px, chips 6 px, keys 4 px; tally squares 18 % of the side; diagram chips by board scale | borrowed (source films) |
| Information lines | ≥ 2 px at 1080; a 1 px line is decoration (grids, panel borders) and carries nothing | derived (4:2:0 chroma subsampling halves colour resolution; a 1 px coloured line smears after platform compression) |
| A coloured line over a coloured field | ≥ 4 px, or a 2 px ground-coloured outline where it crosses | derived (same reason; thread's known issue) |
| A tapering line (thread `swell`) | the ≥ 4 px rule for a coloured line over a field holds at its centre; the tips under 4 px carry nothing | derived (2026-10-19) |
| Stamps, connectors, pointers | land exactly on their target ([principle 2](principles.md)) | standard |

## Motion recipes

Durations are written in beats so they follow the tempo; seconds are given at 120 BPM.

| Recipe | Value | Tag |
|---|---|---|
| Entrance | expo.out or power3.out, 0.5–1 beat (0.25–0.5 s); or a critically damped spring ω 14–26, started a few frames early so it lands on the beat | borrowed (Material 3 emphasized decelerate; source films) |
| Exit | ease-in, at most two thirds of the entrance's time | borrowed (Material 3; [principle 5](principles.md)) |
| Hand-over between scenes | the next scene's first element enters while the previous one leaves, overlapping ¼–½ beat, where the old content has already cleared; no text over text, no frame of bare ground | derived (2026-10-18, brisk) |
| Change of state (T0, T1) | the next state grows out of the current one along a relation the content has (regroup, reshape, bend, carry); a straight cut on a beat or an action only where there is no relation ([principle 4](principles.md)) | derived (2026-10-19) |
| Chapter turn | one transformation along a relation the content has, ≤ 1½ beats ([principle 4](principles.md)) | derived (2026-10-18) |
| Pace: T0 micro change | a word or phrase entering, a highlight jump, a count tick, a morph step: median gap ≤ 2 beats, never > 4 beats without one (rests and pause holds excepted); one new piece of information each | derived (theory review 2026-10-19, approved by the owner; the A/B sample is pending) |
| Pace: T1 scene change | composition median 2–3 s, ≤ 6 s each (rest, or climax with a reason, excepted); ≥ 2 in the first 5 s; length CV ≥ 0.3, in accelerating or decelerating runs; a new topic only at a scene change | derived (theory review 2026-10-19, approved by the owner; the A/B sample is pending) |
| Pace: T2 expressive transition | a device from `runtime/transitions` or `runtime/handoffs`, or a full-frame ground change: one every 8–12 s, ≤ 2 beats; the same device ≤ 3 times a film, never twice in a row unchanged | derived (theory review 2026-10-19, approved by the owner; the A/B sample is pending) |
| Pace: T3 peak | hook, claim or reveal, lock-up: 2–3 a film; the climax at 60–85 % of the length, the scenes before it shortest, a release after it; the sound may drop out before the lock-up | derived (theory review 2026-10-19, approved by the owner; the A/B sample is pending) |
| Text per state | primary text entering at one moment ≤ 5 words; a claim ≤ 8, read in a pause ≤ 2 bars; word- or phrase-at-a-time entry by default; the 0.3 s a word floor unchanged | derived (theory review 2026-10-19, approved by the owner; the A/B sample is pending) |
| Slam (type on the beat) | spring ζ 0.62, ω 30, scale 1.5 → 1, overshoot < 8 %, 28 ms per-glyph stagger | borrowed (ink source) |
| Landing | a spring at 95 % of its travel, an ease-out at 90 %, an impact at contact; the sound sits on that frame | draft |
| Holds | after a landing ≥ 0.2 s and ≤ 2 beats; a claim's pause ≤ 2 bars (timing API 3). Templates still on API 2: after a step ≤ 1 bar, after a page's last step ≤ 1½ bars, a page ≤ 4 bars and ≤ 12 primary words (2026-10-18, superseded) | derived (theory review 2026-10-19, approved by the owner; the A/B sample is pending) |
| Ambient layers | ≤ 15 px/s of travel, ≤ 1.5 %/s of scale; registered on the mode card | draft |
| Motion blur | sub-frame blur on any move faster than about 1 px per frame at 1080; print modes may leave it out with a stated reason | borrowed |
| Effect colours (RGB split, glitch) | ≤ 0.1 s (3 frames) each time, on a beat or a meaning, inside the flash gate | standard (WCAG 2.3.1) / derived |
| Organic material (ink, liquid, smoke) | simulate the fluid, do not draw it: a small 2D solver (advection, pressure, vorticity) baked once and drawn per frame (ink `inkflow.js`); thresholded noise reads as stiff even when it curls (owner, 2026-10-19, on v2); ink on paper is drawn as pigment absorbance (Beer–Lambert: pale wash, deep tone, dark tideline), not as a lit 3D surface (owner, 2026-10-19, preferring a stable-fluids ink page to v3's shaded volume); never a rigid shape scaling up | derived (2026-10-19) |

## Sound recipes

| Recipe | Value | Tag |
|---|---|---|
| Delivery | −14 LUFS integrated, true peak ≤ −1.5 dBTP, short-term ≤ integrated + 5 LU | standard (EBU R 128, YouTube reference) |
| Bed | one preset per mode in `lib/audio/beds.mjs`, sections from the fitted scenes, energy rising by chapter and highest on the claim (up to 1 dB over the reference) | derived |
| Mix and master | `tone: 'v2'` (high-passed pads, a 7 kHz shelf, low-band soft clip, 2:1 glue) in every mode but blueprint, which keeps the plain chain because its arpeggio is already bright | owner on recommendation, 2026-10-18; not yet confirmed by ear |
| Reading | a scene read for ≥ 60 % of its length drops the bed's melody layer; the heaviest reading gets a pad-only break | draft |
| Landings | one sound on each landing that deserves one, on the landing frame; a 70 ms, −5 dB breath in the music before the main landings of the explainer modes and the reel | owner on recommendation, 2026-10-18; not yet confirmed by ear |
| Generated music | when the agent can call a music-generation API, a generated bed at the film's tempo replaces the synthesised one through `content.bed = { file, offset }`; the synthesised bed stays the fallback, and the README says which was used | derived (2026-10-17: the owner preferred the generated tracks) |
