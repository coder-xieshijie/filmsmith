# Phosphor (`phosphor`)

A product launch inside a night-time terminal: near-black ground, one phosphor accent for what passed, mono code against heavy display type, a HUD frame running the whole film, energy shots drawn as light, cut brisk. Aesthetic anchor: "like a CI run going green on a CRT, cut as a keynote opener".
Theme: tech-product-launch · Template: `assets/templates/phosphor/` (timing API 3) · length follows the copy, 120–136 BPM (default 128); the example fits to 38 bars, 71.25 s; the demo (reseed) 22 bars, 42.6 s at 124 · Source film accepted 2026-10-16 (dev-skills launch, terminal version, English v2); code-only shots matched it in a blind comparison 2026-10-16; template 2026-10-17; reading tiers, type scale and the split question page 2026-10-18; batch 2 options settled, brisk limits, two more presets 2026-10-18; `ice` chosen as default by the owner 2026-10-18; the four tiers of pacing and the batch 4 transitions approved 2026-10-19, migrated the same day (`run`, `pick`, `scope` pages; glitch cut as a counted T2 device)

## Fits / does not fit

Fits: CLIs, developer tools, agents, CI and infrastructure — anything whose home is a terminal; stories with a problem → claim → two to four chapters of how → install → claim; the copy sets the length (the two-scene sting `boot` → `end` about 10.6 s, the two-chapter demo 42.6 s, the four-chapter example 71 s).
Does not fit: consumer, lifestyle or design-led products; anything that needs warmth or people; a teaser under 20 s whose point is a claim (ink: here the shortest cut carries its claim only as the end card's 32 px sub); numbers about many items (tally); a mechanism that must be watched running (trace); a library or filter with no process to show (Known issues).

## Use cases

| Use | Example (made-up product) | Chain |
|---|---|---|
| **Launch of a CLI whose work is a process, 40–75 s** (best fit) | `grainlock`, a dependency-lock tool: "Pulled in 312 packages.", the claim under the horizon, four chapters (set the policy, lock the graph, check every PR, audit twice), the install commands, the tagline, the lock-up (the shipped example, 71 s) | `boot` → `hero` → `qa` / `decide` → `freeze` → `flow` → `compare` → `ends` → `install` → `horizon-tagline` → `end` |
| **Launch of a tool whose proof is a run, about 43 s** | `reseed`, a flaky-test replayer: "3 runs failed.", the claim, the log braking on the failing run, the bisect locking on the leaking test, the scope redrawn with no failure left, one install command, the tagline, the lock-up (workshop demo 2026-10-19, 22 bars at 124 BPM) | `boot` → `hero` → `run` → `pick` → `scope` → `install` → `horizon-tagline` → `end` |
| Sting or lock-up for a CLI, about 10 s | `reseed`: the test command typed, "3 runs failed." with the 3 growing, one problem tag, everything collapses into the cursor, the fibre burst, the name types back out of the cursor with its verbs and URL (first workshop demo 2026-10-19, 6 bars, 10.6 s at 136 BPM; fits api 3 unchanged) | `boot` → `end` |
| Release of a CI or infrastructure tool, about 40 s | a build cache's 2.0: the slow cold build in the hook, the claim, one `flow` chapter of what the cache now skips with its checks ticking, the two-machine `compare` counter, the upgrade command | `boot` → `hero` → `flow` → `compare` → `install` → `end` |
| Agent or AI coding tool that asks before it acts, about 38 s (`violet`) | an agent CLI: the risky command in the hook, the claim, a `qa` page of its two questions and the picks, the `decide` summary with what it found on its own and one confirmation, the lock-up | `boot` → `hero` → `qa` → `decide` → `install` → `end` |

Best fit: the registry is a process told in a terminal — questions, locks, a runner, a shared ruler, a log that brakes on its key line, a search that locks, a measure redrawn, an install — so a tool whose work is a sequence of commands fills it with real artefacts and the accent's "passed" has something to mark. A product that is not a process (a filter, a library) ends up using `flow` twice with one layout (jq run, 2026-10-18): use another mode, or say so in the plan.

## Mode principles

1. **One phosphor accent, and only it glows.** The accent marks what passed or is proven (Accent role); the energy shots are drawn in its light. Problem red and finding amber are status colours: small, short, never glowing, never filling. *(Narrows 7, one system, one accent, one meaning.)*
2. **Two voices of type.** What the machine says is mono (commands, code, labels, HUD); what the film claims is heavy display, scanline-striped on the default `crt` screen, in a neutral gradient from a near-white tinted toward the accent to grey. Nothing in between. The key word of a line is set apart by size (the hook's stress word grows 1.14, the tagline's is 1.12 × larger), not by colour: colour is the accent's, and the accent means passed. *(Narrows 7, one system; and 3, one idea per beat, one protagonist per frame.)*
3. **The HUD never leaves.** Brand and tag top left, licence top right, chapter `[nn/NN]` bottom left, a 4 px progress bar on the bottom edge, corner brackets; it appears with the claim and stays to the last frame. Nothing decorative: the timecode, BPM and beat dots are gone (settled 2026-10-18; accepted on the recommendation, the owner did not compare it shot by shot). *(Narrows 7, a persistent frame with real information.)*
4. **The turns transform; the glitch cut is counted.** At the opening, the cursor swallows the hook and becomes the point the fibres converge on, and the point becomes the horizon the sphere rises from; at the close, the tunnel folds into the same horizon line, which opens into the claim and shrinks into the cursor of the lock-up; at every chapter, the card's title flies to become the page header. Inside a chapter a page grows out of the last (the window reshapes, the log's lines smear off, the camera pushes in on the result). The turns into a chapter are the expressive moments: a glitch cut (jitter, tear, ≤ 0.25 s, ending two frames before the cut so the next scene's first frame is a clean onset) or a CRT collapse, alternating; the other page changes are straight cuts on the beat. The owner kept the glitch on page changes (2026-10-18); since the four tiers (2026-10-19) it is one T2 device among the others, at most three a film and never twice in a row the same (it leans left, then right). Glitch marks the cut and nothing else: no glitch before a title flight, no glitch hits on a held card. *(Narrows 4, transform at the turns, grow every state out of the last; and 5, T2 every 8–12 s, one device ≤ 3 times.)*
5. **Text is typed or decoded, never faded in as a block.** Commands type at a block cursor that sits exactly after the last glyph; headlines decode through scrambled glyphs for ≤ 0.6 s and lock; rows flip state with an RGB split of ≤ 0.1 s. *(Narrows 5, motion is a function of time; and 2, precision is a gate.)*
6. **Energy is light drawn in code.** Fibres, a scanline sphere, a grid tunnel and a horizon glow, rendered with a shared bloom pipeline and screen-blended over the ground; seeded grain over everything, and on the default `crt` screen 2 px scanlines and a vignette (Variants). No footage, no photo texture. *(Narrows 6, texture decides how good a passing film is; and 8, no people; the picture is technical.)*
7. **The beat is the clock, and nothing waits for it.** Chapter turns and the claim start on bar lines, other scenes on any beat; key landings (a pick, a lock, a brake, a lit output, the confirmation, the last count, the stress word) sit on a beat, other landings where their reading puts them; counters and roulette jumps step per half beat; cursors blink on the half beat. A step lands as soon as the one before it has been read; the music moves to the picture, not the reverse (install's drop falls on the bar line among its steps). The music drops on the claim. *(Narrows 5, only the key beats are locked, brisk; and 1, readable before beautiful.)*

## Palette presets

| id | name | fits | bg / bgHi | ink · muted · dim | accent · hi · deep | on | bad · find · key | titleHi · titleLo |
|---|---|---|---|---|---|---|---|---|
| `phosphor` | P1 phosphor green | CLIs, agents, CI | `#050A07` / `#0A1A12` | `#E8F1EB` · `#9DB3A6` · `#7A9385` | `#3DDC84` · `#B9F0D0` · `#1A9E5E` | `#04140A` | `#FF6B6B` · `#F2CF6B` · `#8FD0FF` | `#EEF7F1` · `#A9B9B0` |
| `amber` | P3 amber phosphor | infrastructure, databases, ops | `#0A0703` / `#1C1309` | `#F4ECE1` · `#BBAA94` · `#968570` | `#FFB45C` · `#FFE3C0` · `#D9822A` | `#1A0D00` | `#FF6F87` · `#9ED0FF` · `#C8B8FF` | `#FAF4EC` · `#BFB09C` |
| `ice` | P4 ice white (default) | any terminal tool; security, data, cloud | `#04080C` / `#0B1724` | `#E6EEF6` · `#AAB0B6` · `#848C94` | `#88BFFF` · `#DCEBFF` · `#3F86D6` | `#03101C` | `#FF7070` · `#F2CF6B` · `#C9B4FF` | `#EEF6FD` · `#A7B6C4` |
| `cyan` | ANSI cyan | networking, containers, APIs, observability | `#040A0B` / `#051A1D` | `#E5F1F2` · `#97B3B6` · `#749297` | `#05D8E3` · `#B9ECF3` · `#009BA4` | `#001416` | `#FF6B6B` · `#F2CF6B` · `#C9B4FF` | `#EBF7F8` · `#A5B9BC` |
| `violet` | Theme violet | AI and agent tools, editors | `#09070D` / `#181321` | `#EFEEF3` · `#AEABB4` · `#8E8A94` | `#C9BCF3` · `#E8E1F7` · `#9086AF` | `#120C1C` | `#FF7070` · `#F2CF6B` · `#8FD0FF` | `#F5F4FC` · `#B6B2BB` |
| `coral` | Coral red | a product whose own colour is a coral or pink-red (`bad` moves to violet) | `#0D0706` / `#21110F` | `#F7EBEA` · `#BFA6A2` · `#A08480` | `#FF6452` · `#FEC3AD` · `#FF3763` | `#1C0A07` | `#C9B4FF` · `#F2CF6B` · `#8FD0FF` | `#FEF2F1` · `#C2B0AC` |

Also per preset: `bgLo` corners, `line` panel borders (decorative, ≈1.5:1), `panel` fill. `titleHi` and `titleLo` are the top and bottom stops of the neutral headline gradient.

Contrast (`standard`, WCAG 2.2, computed on bg / panel):

| preset | ink | muted | dim | accent | hi | bad | find | key | on / accent |
|---|---|---|---|---|---|---|---|---|---|
| `phosphor` | 17.3 / 16.5 | 9.0 / 8.6 | 6.0 / 5.7 | 11.2 / 10.7 | 15.6 / 14.9 | 7.2 / 6.9 | 13.2 / 12.6 | 12.0 / 11.5 | 10.6 |
| `amber` | 17.2 / 16.5 | 8.9 / 8.5 | 5.6 / 5.4 | 11.4 / 11.0 | 16.3 / 15.6 | 7.5 / 7.2 | 12.4 / 11.9 | 11.3 / 10.8 | 10.8 |
| `ice` | 17.1 / 16.2 | 9.2 / 8.7 | 5.9 / 5.6 | 10.5 / 9.9 | 16.6 / 15.7 | 7.5 / 7.1 | 13.3 / 12.6 | 11.0 / 10.4 | 10.0 |
| `cyan` | 17.3 / 16.5 | 9.0 / 8.5 | 6.0 / 5.7 | 11.3 / 10.8 | 15.5 / 14.8 | 7.2 / 6.9 | 13.2 / 12.6 | 10.9 / 10.4 | 10.7 |
| `violet` | 17.4 / 16.7 | 8.9 / 8.5 | 5.9 / 5.7 | 11.4 / 11.0 | 15.8 / 15.1 | 7.4 / 7.1 | 13.3 / 12.7 | 12.1 / 11.6 | 10.9 |

`deep` (bottom stop of the accent gradient, large type only): phosphor 5.8, amber 6.9, ice 5.4, cyan 5.9, violet 5.9 on bg. `hyperframes check` contrast: 171/171 on the example (phosphor, 2026-10-18).

**The headline's near-white** (2026-10-18, proposal T1 of the colour audit, settled by theory; the owner did not object): the gradient's top stop was `#FFFFFF`, the only pure white in any mode, and large pure white on a ground at L* 2 is the harshest pairing (Material's dark theme keeps text off pure white). It is now a near-white at CIELAB L* 96.4, C* 4.4, at each preset's ink hue (phosphor `#EEF7F1`). Proposal T2, lifting the grounds toward Material's `#121212`, was not taken: it weakens the night-time terminal, and the grounds stay as they are.

**Accents.** CIEDE2000 to the nearest of about 120 brand and terminal-theme colours (list and script with the batch 3 research, 2026-10-18):

- `phosphor` `#3DDC84` is `owner` — the source film's terminal green, which coincides with Android's brand green (ΔE00 0); the owner kept it (2026-10-17, verbatim: "这个新绿的强调色就用品牌绿，我理解没有问题"). Its `hi` / `deep` / `on` are `derived` with the earlier phosphor preset's OKLCH relations to its accent: `hi` = lightness moved 55 % of the way to white, chroma × 0.39, hue +5°; `deep` = lightness × 0.78, chroma × 0.80, hue +1°; `on` = lightness 0.172, chroma 0.032, hue +3°.
- `ice` is the default since 2026-10-18, `owner`: picked from five-second samples of all five presets (workshop `batch3/palettes/`), against the recommendation to keep phosphor.
- `amber` and `ice` are `derived`: phosphor hues (P3 amber, P4 blue-white) at high chroma, moved away from ~40 brand ambers and cyans; ice was saturated until its accent separates from the neutral text by ΔE00 ≥ 15. Against the larger list, two terminal themes come close: the Dracula theme's orange `#FFB86C` sits ΔE00 2.2 from amber, Catppuccin's blue `#89B4FA` 3.7 from ice (themes, not brands; noted, not changed).
- `cyan` `#05D8E3` is `derived`: ANSI cyan, the sixth of the eight terminal colours, as bright on its ground as the other accents (11.3:1), at the hue (CIELAB h 204) farthest from the brand and theme cyans; nearest ΔE00 8.2 (Catppuccin sky), Material cyan 8.4, Tiffany Blue 8.5; ice 22, phosphor 27.
- `violet` `#C9BCF3` is `derived`: the lavender the dark terminal themes of today use as their key accent (Dracula, Catppuccin, Tokyo Night), at the point (CIELAB h 301, C* 30) farthest from all of them; nearest ΔE00 7.3 (Catppuccin mauve and lavender); ice 18. Its chroma is the lowest of the five: anything more saturated at this lightness lands within ΔE00 5 of a theme.
- `cyan` and `violet` take every other role from the accent with phosphor's relations: neutrals keep phosphor's OKLCH lightness and chroma at the accent's hue (violet's text tones at 0.45–0.6 of that chroma, so muted stays ΔE00 ≥ 15 from the accent, as ice does). Neutrals `borrowed (source)` (phosphor) and re-tinted per accent (`derived`).

**Which one** (the owner asked whether green is the right family, 2026-10-18). Green stays the default on theory: the mode's accent means "passed", and green is what passed means in every CI system and terminal (principle 9, the style points at the content; congruence of colour and meaning). The other four are for a product whose own colour is not green, or to step away from Android's green: `cyan` is the closest in mood and the liveliest; `ice` the quietest; `amber` the warmest; `violet` reads as an editor or AI tool and is the weakest as a mark. Five-second samples of the same shot (the hero) in each: `works/skill-modes-v1/batch3/palettes/terminal-<id>.mp4` in the workshop.

## Variants

**Colour**: the six presets above (`ice` default; `phosphor`, `amber`, `cyan`, `violet`, `coral`), with their contrast and collision checks.

**Form: `screen`**, the display the terminal is shown on (2026-10-19, not yet seen by the owner). Palette, type, sizes, layout, choreography, timing, sound and the energy shots stay; only the display's own marks change.

| `screen` | What changes | Choose it for | Source |
|---|---|---|---|
| `crt` (default) | The raster of a cathode-ray tube: 2 px scanlines over everything (one dark line in three at 22 %), display type striped (4 px solid, 2 px at 62 %), the vignette of a tube's edge fall-off (60 % at the corners) | Most films; the mode's anchor ("a CI run going green on a CRT"); a tool whose users live in a terminal and like it retro, open-source infrastructure, anything named after a phosphor | The source film (`borrowed (source)`); a raster display draws the picture as horizontal lines (`standard` display physics); terminals that offer the look name the same two marks, Windows Terminal's `experimental.retroTerminalEffect` "will emulate a classic CRT display with scan lines and blurry text edges" (`borrowed`, Microsoft Learn, profile appearance settings) |
| `flat` | A flat panel: no scanline overlay, no stripes in the display type, no vignette; grain, the accent grid, the glow disc, the bloom of the energy shots, motion blur and every glow of the accent stay | A product with a modern brand or a GPU terminal of its own, a film shown next to real screenshots of the tool, films whose titles must read crisply in a small player | What terminals draw by default today: the CRT effect is an opt-in in Windows Terminal (default `false`) and cool-retro-term exists to add it back (`borrowed`); LCD and OLED pixels are lit evenly across the panel, so there is no raster and no edge fall-off (`standard` display physics) |

Why a screen axis and why only two values. Every value had to keep the mode principles and the clean-transition checks C1–C8. cool-retro-term, the reference CRT emulator, exposes eleven effects besides its rasterization modes (`staticNoise`, `screenCurvature`, `glowingLine`, `burnIn`, `bloom`, `chromaColor`, `saturationColor`, `jitter`, `horizontalSync`, `flickering`, `rgbShift`, read from its `ApplicationSettings.qml`, 2026-10-19); each fails a rule here, so a stronger "tube" value was left out:

- `screenCurvature` (barrel): any curvature that keeps the HUD on screen shrinks the picture toward the edges, radially by 1 / (1 + 3k r²); a mild tube (k 0.05) sets the 25 px HUD and notes at about 20 px in the corners, under the 25 px floor (principle 1; `derived`).
- `bloom`, `glowingLine` (halation): neutral titles would glow, and in this mode only the accent glows, meaning "passed" (mode principle 1).
- `burnIn` (phosphor persistence): ghosts of the last frame, against C6 (lands clean, leaves nothing).
- `flickering`, `horizontalSync`, `jitter`: luminance swings and a moving picture outside the cuts, against the flash gate (C8) and mode principle 4 (glitch only at a cut).
- `rgbShift`: a standing colour split, against principle 7 (effect colours ≤ 0.1 s).
- `staticNoise` is the grain the mode already has; `chromaColor` and `saturationColor` are the colour axis.

What remains is the raster itself, on or off. The difference reads best full screen (striped against solid titles, lines on the ground, darker corners) and is slight in a thumbnail; a more visible form axis would be the persistent frame (a tmux-style status line carrying the chapters, `draft`, not built). Default output is unchanged pixel for pixel (fifteen stills of the example compared, 2026-10-19), apart from the cursor-to-point fix of the same day (Known issues). Both values pass the P0 and C1–C8 checks: on the 10.6 s demo `check-film` PASS for both with the same flash (1.5), hand-off and key results, `hyperframes check` 137/137 contrast; on the 71 s example in `flat`, `check-film` PASS (flashes 2 at most in a second) and one contrast warning that is the checker's, not the frame's (Known issues). Stills and a side-by-side: workshop `works/skill-showcase/demos/phosphor/variants/`.

## Accent role

Settled 2026-10-18 (accepted on the recommendation; the owner did not compare it shot by shot).

- **Accent** (`accent`, with `hi` and `deep` in gradients and glows): what passed or is proven — the flow's checks as they tick and its outputs as they light, the locks, the fix note and the added row, the result badge, the verified party's card, the counter, its `MATCH` verdicts and the shared lock's `⬢`, the confirmation once its check lands, the closing chips as they light, the legacy audit's flipped rows. The energy shots (fibres, sphere, tunnel, horizon) and the ground's tint keep the accent's light; the tunnel is a change of ground at the claim, one bar. As a mark it stays under 10 % of the frame (median 0 %, max 4.3 % on the example).
- **Neutral**, never glowing: titles and the tagline's stress word, the HUD (chapter label, progress bar, licence dot, logo), card numbers, window-bar right labels, question ids, the chosen option (an ink fill), cursors, connectors and travelling dots, `YOU` nodes, the hub, code headings and bullets, strip and list markers, the confirmation box until its check, the closing chips until they light.
- **Status** colours: `bad` marks problems (the opening's tags, the legacy audit rows); `find` marks what the second checker found (the sweep, gap flags, their markers, the flagged row while flagged, the `found` tag on a decision). Small, short, never glowing.
- **Effect** colours: the RGB split of a decode or a row flip uses `bad` and `key`, screen-blended, for at most 0.1 s (3 frames) at a cut or a flip (principle 7).
- **Code panels** use neutral levels only: `{keyword}` and `##` headings bold ink, punctuation `dim`.

## Type

| Role | Family | Licence | Sizes (px) |
|---|---|---|---|
| Display, headlines, numerals | Inter 4 variable, 800, optical size 32 (Display), −0.045 em, line-height 0.95, 4/2 px scanline mask | OFL | 240 counter · 150 hook question, chapter card, tagline (stress word ×1.12), end name · 108 hero claim, centred titles · 84 page header (the card title at 0.56) and counter label · 50 party names · 40 node names |
| Body | Inter 400–700 | OFL | 40 hero sub, questions and options, decisions, confirmation · 32 end sub · 25 card items, steps, check labels, strip |
| Code, commands, labels, HUD | JetBrains Mono variable 400–700 | OFL | 64 URL · 50 hook prompt · 40 gap findings, freeze result · 32 install commands, chips, card number and card line · 25 code panels, notes, window bars, tags, labels, ticker, HUD |

Information text is ≥ 25 px (principle 1); nothing decorative is set below it (the 20 px HUD timecode is gone). Slots never shrink below their nominal size except display slots, which fit down to about 0.87 of nominal so they stay in their level (the hook question, end name and taglines may shrink further, alone in their frame); text that does not fit prints a red banner naming the slot.

Main text is ≥ 40 px except where noted: install commands 32 (one line of up to 40 characters inside the terminal window); end sub 32 (a fourth level otherwise); the lock word and the outputs 25 (they sit in the document windows and the terminal, next to the lines they mark); flow check labels 25 (up to five on one row); compare meta 25 (beside the 240 counter, a fourth level otherwise); the opening's problem tags 25 (three on one row). The gap findings moved to 40 px under their windows (settled 2026-10-18). Sizes `derived` (2026-10-18: the source film's sizes snapped to the scale below and lifted to the 25 px floor); floors `standard` (principle 1).

## Type scale

**25 · 32 · 40 · 50 · 64 · 84 · 108 · 150 · 190 · 240** px, neighbours 1.25–1.39 apart (`derived`, 2026-10-18: the source's sizes 22–230 snapped to a series that starts at the 25 px floor and keeps every step ≥ 1.25). Levels per frame outside the HUD, at most three: chapter card 150 · 32; opening 150 · 50 · 25; hero 108 · 40 · 25; qa 84 · 40 · 25; decide 84 · 40 · 25; freeze 84 · 40 · 25; flow 84 · 40 · 25 (node names and the hub share one level, check 2026-10-18 P-05); ends 108 · 40 · 25; install 108 · 32 · 25; tagline 150; end 150 · 64 · 32. `compare` is a diagram page and uses one label level more: 240 counter · 84 header and counter label · 50 party names · 25 labels, items, meta and ticker. (190 is kept for the legacy dot-matrix slogan.)

## Frame and grid

1920 × 1080. Margins: content 110 px left / right (HUD at 70–74 px), corner brackets 34 px at (38, 34). Background stack, bottom to top: radial ground (`bgHi` centre → `bg` → `bgLo`), a glow disc 800 px breathing 0.967 → 1.0 over four bars, a 160 px accent grid at 5 % drifting −160 / −80 px a minute, `+` crosses every 320 px, scenes, HUD, vignette (60 % at the corners), 2 px scanlines (1 dark line in 3 at 22 %), seeded grain (overlay, 50 %), white flash layer. With `screen: 'flat'` the vignette and the scanlines are left out (Variants). Page layout: header at (110, 92), note at (112, 192), panels from y 262, check row y 792, strip y 948. All positions in `film.js` come from measured text or these fixed rails. Content area for measurement (`renders/timing.json` `mask`): x 100–1820, y 84–996, inside the HUD.

## Scenes

| Type | Purpose | Bars: example (need) · ceiling |
|---|---|---|
| `boot` (default opening) | Prompt typed alone, rises as the hook types; key word grows; problem tags; collapse into the cursor → point → fibre burst → flash | 4 (3.43) · 5 |
| `audit` (legacy opening) | Audit list red → fix command → rows flip green → burst → flash | — · 4 |
| `hero` | Claim under the horizon line, the scanline sphere rising out of it at the opening's point | 3 (2.07) · 3 |
| `qa` | Chapter: at most two questions, each typed, its options popping in, one pick | 3.25 (3.17) · 5 |
| `decide` | The same chapter: the window morphs; the decision summary lands line by line, then one confirmation, pushed in on | 2.75 (2.38) · 3 |
| `freeze` | Chapter: two documents, gap sweep and findings, fix, the freeze terminal, hashes resolve, locks | 4 (3.79) · 5 |
| `flow` | Chapter: inputs → hub → outputs, travelling dots, outputs light, checks tick | 4 (3.13) · 5 |
| `compare` | Chapter: two parties and a shared ruler, counter 0 → N, pushed in on, a ticker repeating the counted items | 3.25 (3.15) · 5 |
| `run` (2026-10-19) | Chapter: the tool's log races, brakes and stops on the key line; pushed in on | demo 3 (2.94) · 5 |
| `pick` (2026-10-19) | Chapter or its continuation: a frame tries each candidate and locks on the answer; pushed in on; the result resolves | demo 3 (2.65) · 5 |
| `scope` (2026-10-19) | Chapter: the old reading and its trace swept in; afterglow; the beam redraws the trace and the new reading lands (the reveal) | demo 3.25 (3.20) · 5 |
| `ends` | Pipeline with you at both ends, bracket, loop back | 3 (2.92) · 3 |
| `install` | Commands in a terminal under a musical break; the step cards land alone on the drop; time the fit adds waits before the cards, so they keep their own length into the climax | 3.75 (3.17) · 4 |
| `horizon-tagline` (default closing) | Tunnel folds into a horizon line that opens as a slit holding the claim | 3 (2.97) · 4 |
| `tunnel-tagline` (legacy closing) | Tunnel → flash → dot-matrix slogan | — · 3 |
| `end` | The horizon shrinks to a cursor (after `boot`, the opening's point is the cursor); name and chips type out of it on the horizon; the URL types on the next line; one line of sub; the chips light on the last downbeat; the frame dims in the last 0.4 s unless `dim: false` (a film cut into a longer one) | 4 (2.57) · rest, absorbs the phrase |

Bars at 128 BPM (the example), the batch 4 pages from the demo at 124. A ceiling of five bars belongs to a scene that holds two or three compositions (card, page, close-up); each composition stays ≤ 6 s (T1). Slots, limits, the reading tier of every slot and the fixed choreography: `TEMPLATE.md`.

### Length

Length follows content (`timing.rules.js`, `events.js`, `lib/timing.js` `fit()`, timing API 3 since 2026-10-19; principles 4 and 5). Every scene is a sequence of steps; a step starts once the step before it has been read. Primary text adds up in reading order, at most five words a state (a claim eight, in a pause); glance text (≤ 6 words, repeated or deletable; the qualifying slots are listed in `timing.rules.js`) needs 1 s fully still alongside it; the tagline is timed word by word. The 2026-10-18 page limits (12 words a page, a hold ≤ 1 bar, a page ≤ 4 bars) are gone. Within the slot limits every type fits all api 3 limits at 120, 128 and 136 BPM, checked with worst-case copy at every limit (2026-10-19). The example (the four-chapter launch) stays 38 bars, 71.25 s at 128.

| Value | Setting | Tag |
|---|---|---|
| Reading | primary 0.3 s per English word, in reading order, from 0.25 s after a line starts entering; ≤ 5 words a state (a typed line in chunks of five); glance ≥ 1 s fully still; tagline 0.3 s a word once complete, in a pause; symbol-only tokens are not words | standard (principle 1) / state limit standard (principle 5, api 3) |
| Closing URL | held ≥ 3 s after it is typed | standard (principle 1) |
| Holds | ≥ 0.2 s and ≤ 2 beats after each landing; the claim and the scope's reveal ≤ 2 bars in a pause; slack from the grid filled by tails (supporting elements dim to 60 % in two frames, on a beat) | standard (principle 5, owner-approved 2026-10-19) / tails derived |
| T0 | every landing, typed phrase, roulette jump, count step and tail is declared (`micro`): the example's median gap 0.55 beats, the demo's 0.75 | standard (principle 5) |
| T1 | compositions ≤ 6 s, median 2–3 s: the page after a chapter card, the close-up after a push-in, the freeze terminal, the hook under the risen prompt and the step cards alone are compositions of their own (`shots`); ceilings five bars where a scene holds two or three | standard (principle 5) / shot choice derived |
| T2 | fibre burst, glitch cut (≤ 3, leaning left or right), CRT collapse, tunnel fold; one every 8–12 s, each ≤ 2 beats | standard (principle 5) / devices draft (approved as samples 2026-10-19) |
| T3 | the hook (the stress word), the climax (the tagline's claim, else the scope's reveal, else a scene with `climax: true`), the lock-up | standard (principle 5) |
| Tempo | 128 default, 120–136: the bed's written tempo and the source film's measured one, ±6 % before the 16th pulse drags or turns frantic | borrowed (source, 128) / derived (range) |
| Grid | scenes in whole beats (`unit` a quarter bar, api 3: only key beats are locked); chapters, the claim and the batch 4 pages are `turn` scenes on a bar line; key landings on a beat; film rounded to a 2-bar phrase, absorbed by `end`, whose chips light on the last downbeat | derived (2026-10-19; whole bars before) |
| Chapter card | holds until the title is read and the card line (typed in 0.5 s) seen, to the next half beat, ≥ `chapter.beats` (2); on a longer card the number and card line light halfway; the title flies with no glitch before it; the page enters 0.4 beat into the flight | derived (2026-10-18; light and typing 2026-10-19) |
| Typing | prompt 40 cps, question in 1.4 beats, qa and pick questions at reading pace (≤ 48 cps, ≥ 24), freeze command 120 cps, install commands at reading pace (≤ 90 cps), URL 45 cps, card line 0.5 s | borrowed (source, 30–75 cps), raised 2026-10-18 for the owner's "0:16.7 shows the code too slowly"; reading pace derived 2026-10-19 (a line that ends long before it is read would leave a still frame over two beats) |
| Steps | tags as the one before is nearly read; options every 0.25 beat; facts, decisions, words, counter and roulette steps every 0.5 beat; install steps every beat; flags one a beat; hashes resolve in 0.5 beat | borrowed (source) / snapped to the beat grid derived |
| Exits | boot 4 beats (the turn to the hero), audit 2, glitch 0.5–0.64, CRT 0.75 (+ 0.6 power-on in the next scene), morph 0.2 before the cut (+ 0.7 into the next scene), smear 0.5 before a morph, cut 0, horizon-tagline 0.5, tunnel-tagline 0.6, end 0.4 s | borrowed (source) / derived |

## Signature transformations

- **cursor → point → horizon → sphere** (`boot` → `hero`): every glyph and tag is pulled into the block cursor (far pieces first, blurring to 6 px); the cursor shrinks to a 14 px glowing point at the frame centre; fibres converge on it (2 beats); white flash; a horizon line draws out from the point to both edges and the sphere is born at the point, rising out of the line (cut by it), pushing in for two bars (`derived`; settled 2026-10-18).
- **chapter title → page header** (every chapter): the title decodes in at 150 px, then flies to (110, 92) at 0.56 scale on the first half beat after it has been read, motion-blurred along its path; the page builds under it from the middle of the flight (`derived`). A `decide` or `pick` page keeps the header in place.
- **the log brakes on its key line** (`run`, X14 stream-brake): the tool's own log runs past at speed, brakes exponentially and stops with the key line exactly in the reading band, which locks (the accent for a pass, `bad` for a failure); the camera pushes in 1.1 on the band (`draft`, approved as a sample 2026-10-19).
- **the frame tries every candidate** (`pick`, X10 roulette-lock): a frame jumps one candidate per half beat, laps the row, slows for the last two jumps and locks on the answer, which is what the tool proved (the accent); the others step back (`draft`, 2026-10-19).
- **the beam redraws the measure** (`scope`, X26 beam-trace): the old trace and reading stop being refreshed and fade as phosphor afterglow; a blanked beam returns and draws the new trace with its glowing tail; the new reading flares and settles (`draft`, 2026-10-19).
- **the window reshapes; the log's lines smear off** (between pages of one chapter, X06 container-morph, X20 slice-smear): the old content leaves (blur, fade; or the lines slide off in bands one mono line high with their streaks), the window springs to its next size, the new content enters; two contents are never on screen together (`draft`, 2026-10-19).
- **decode in reading order** (every title, reading, hash and result, X15 scramble-resolve): each cell flickers through the line's own alphabet (hex for hashes) and locks left to right; a digit never flickers through other digits (a line's digits stay in place, a numeral flickers through symbols), so no still shows a wrong number (2026-10-20) (`borrowed (source)` decode, model `draft` 2026-10-19).
- **grid tunnel → horizon line → slit → cursor** (`horizon-tagline` → `end`): the tunnel's floor and ceiling fold onto the horizon in the last beat of the rush; the line splits into two lines that open a slit holding the claim; the slit closes back into the line; the line shrinks to a block cursor at its centre, out of which the name types to the left and the chips to the right, then the cursor drops a line and types the URL (`derived`; lock-up settled 2026-10-18).
- **rows flip red → green** (`audit`), **findings → fix** (`freeze`): the same element changes state in place with a ≤ 0.1 s RGB split (`borrowed (source)`).
- **glitch cut** and **CRT collapse** into a chapter: the glitch cut is jitter ±30 px with ±4° skew at 30 fps and six tear bars, for the exit's length less two frames, then the cut, leaning left or right; the CRT collapse squeezes the picture (not the HUD) to a bright line and a dying dot and powers the next page on from it (`borrowed (source)` glitch, kept by the owner 2026-10-18; CRT model `borrowed` from the library's crt-collapse; both counted T2 since 2026-10-19).

## Motion

| Value | Setting | Tag |
|---|---|---|
| Entrances | opacity + 10–40 px or scale 0.8–0.96 → 1, 0.3–0.6 s power3.out / expo.out; pops back.out(2–3) | borrowed (source; Material emphasized decelerate family) |
| Exits | 0.12–0.25 s power1.in, at most two thirds of the entrance they follow; the slit closes in 0.6 of its opening time; scenes leave by glitch cut | borrowed (source) / ratio derived (2026-10-18) |
| Overlap | at a glitch cut the next scene's first element enters on the cut frame; the page enters 0.4 beat into the card's 0.8-beat flight; the next line may enter 0.25 s before the line before it has been read; the freeze terminal enters while the fix note is read | derived (brisk, 2026-10-18) |
| Typing | 40–120 characters/s; cursor 0.5 em block in ink, blinks on the half beat | borrowed (source, 30–75) / raised and beat-locked derived |
| Decode | 0.4–0.6 s, each cell re-rolled 24 times a second from the line's own alphabet (hex for hashes; digits through symbols only), locking left to right after a 0.35 s scramble (scaled to the decode's length); hashes resolve in 0.5 beat | borrowed (source) / model borrowed (library scramble-resolve, X15, 2026-10-19; was 15 glyph steps/s from a fixed symbol set) |
| Chapter card | title scale 1.25 → 1, 0.5 s expo.out; flight 0.8 beat expo.inOut on the first half beat after the title is read; page content from +0.4 beat | borrowed (card) / derived (flight) |
| Title flight blur | Gaussian along the direction of travel, σ = half the travel per frame on screen (≤ 48 px), computed from t; an SVG filter on a wrapper rotated to the direction, the content counter-rotated | derived (check 2026-10-18 X3) |
| Key word | scale 1.14, 0.45 s back.out(2.2), neighbours shift by half the growth; rest of the line to 50 % | derived |
| Pick | the chosen option pushes in to 1.15, 0.5 beat back.out(1.6) (a slight settle), and stays; options after it make room; the others step back to 45 % | derived (settled 2026-10-18) |
| Collapse | 1.5 beats power3.in, far pieces start up to 0.5 beat earlier; point 0.8 beat expo.inOut | derived |
| Burst | 2.2 beats before the flash, 340 seeded fibres, zoom e^(1.55 t), flash 0.95 decaying 0.5 s | borrowed (measured from the source shot) |
| Hero horizon | the line draws out from the point, scaleX 0 → 1, 0.9 s expo.out; the sphere below it is masked | derived (settled 2026-10-18) |
| Sphere | birth: critically damped spring ω = 7 (≈ 0.7 s); push for the first two bars only, eased to a stop (wrapper 1 → 1.036 power1.out, radius × e^(0.05 t) on eased time), then still; 46 rings scrolling 0.42 /s | borrowed (measured) / birth and stop derived (check 2026-10-18 F14) |
| Tunnel | 1 bar; camera 24.5 units/s; wrapper 1 → 1.25 power2.in; fold over the last 0.9 beat (smoothstep), every line scaled toward the horizon together; the shot fades over its last 0.1 s; crossbars fade to 30 % between 6 and 2 units from the camera (flash gate) | borrowed (measured) / fold and fade derived (the centre line kept its full length until the last frames of the fold before 2026-10-18) |
| Slit | opens 0.75 beat power3.out (expo.out jumped half open in one frame); one word per half beat in one stream across both lines (scale 1.2 → 1, 0.35 s expo.out; stress word 1.5 → 1, back.out); closes 0.45 beat power3.in | derived (2026-10-18) |
| Line → cursor | 0.9 beat expo.inOut; the name types out of the cursor at 30 cps, last letter first | derived |
| Closing second move | on the downbeat of the last bar the chips light one per half beat: filled with the accent, scale 1.08 → 1, 0.4 s back.out | derived (principle 5) |
| Counters, ticks | one step per half beat, the last on a beat; travelling dots 1 beat ease-in-out | borrowed (source) |
| Glow pulses | the verified party's card only, half-beat yoyo, even count | borrowed (source) |
| Motion blur | canvas shots carry speed streaks and shutter-length beam smear; the title flight is blurred as above; the log stream gets sub-frame blur from the library above 1 px a frame (`subframes`); other DOM moves are short (≤ 40 px) and carry none; the collapse uses a CSS blur ramp | derived / draft |
| Stream brake | 2 beats: 80 % running and braking (position e-folds 4.5 times over the run), 20 % the band locking; line height 54, mono 32 | borrowed (library stream-brake, X14) / sizes derived |
| Roulette | a jump per half beat, the last two intervals × 1.5, 0.4 beat for the others to step back to 45 % brightness; the frame 4 px ink while it searches, the accent as it locks | borrowed (library roulette-lock, X10) / colours derived (Accent role) |
| Window morph | 1.5 beats: content out over the first 13 %, the shape on a damped landing (ω 7.7 per unit) to 60 %, content in to 80 %; starts 0.2 beat before the cut | borrowed (library container-morph, X06) |
| Smear | 0.5 beat (the exit half of the library's 1 beat): bands 54 px (the log's line height) slide right at 1900–3400 px over the exit, streak shutter 0.04 s | borrowed (library slice-smear, X20) / band height derived |
| Beam | 1.5 beats: the old picture decays exponentially (3.2 e-folds over 42 % of the hand-off, to 10 % in about 0.18 s at 128 BPM), the beam draws over 30–78 % at constant speed, the new reading lands at 80 % and settles; the old trace's sweep before it at constant speed | borrowed (library beam-trace, X26) / persistence of the order of P39, 150 ms to 10 % (US patent 4,231,892; standard), not of a P1 terminal (about 20 ms to 10 %, labguysworld CRT phosphor table; borrowed) |
| CRT collapse | off 0.75 beat: height cubic in to a 4 px line (55 %), width cubic in to a dot (to 86 %), the dot fades; brightness × (1 + 1.5 heat); on 0.6 beat: width cubic out, height back out (3.5 % over) | borrowed (library crt-collapse, model and easings) / lengths derived (≤ 2 beats as T2) |
| Push-in | scale 1 → 1.1 about the result, 0.6 beat expo out; header and note fade in 0.2 s | derived (2026-10-19) |
| Tails | on a beat in slack over 2 beats: a group of supporting elements to 60 % brightness in two frames | derived (2026-10-19) |

Every in-scene time is in beats (`events.js`), so tempo changes keep the choreography. Entrances count from the scene start and exits from its end, so a scene that holds longer lands everything at the same moment and holds; nothing is scaled to a scene's length.

### Ambient layers

Registered under principle 5 (draft limit ≤ 15 px/s of travel, ≤ 1.5 %/s of scale); all inside it since 2026-10-18:

| Layer | Speed | Within the limit |
|---|---|---|
| Background grid drift | 2.7 / 1.3 px/s | yes |
| Grain, scanlines | seeded, constant | yes (texture) |
| Sphere after its push | rings scroll ≈ 4 px/s; dust turns ≤ 12 px/s; highlight streaks ≤ 14 px/s, smears ≤ 3 px/s (brightness still pulses) | yes |
| Glow disc breathing | scale 0.967 → 1.0 over four bars, ≤ 1.5 %/s up to 136 BPM, edge ≤ 6 px/s | yes |
| Glow pulse (verified party) | brightness only, half-beat yoyo | no travel |
| `ends` loop dot | one loop per 2 beats, repeated while the page holds | a process, not a hold; that page exports no holds |
| `compare` ticker | 290 px/s, crossing the frame edge | a marquee: it repeats the counter's items and verdict, so it is never read (crop and overlap whitelist, principle 1); that page exports no holds |

`renders/timing.json` exports still holds only for `qa`, `decide`, `freeze`, `install`, `run`, `pick` and `scope`, the pages whose content area has no ambient motion, and the reading pauses (the claim, the scope's reveal) on any page.

## Sound

Bed: `terminal` preset (A minor, an 8-bar progression Am9 Fmaj7 Cmaj7 Em7 | Am9 Fmaj7 Dm9 E7sus4 whose second half answers the first; filtered 8th → 16th pulse, soft kick, offbeat hats, rim backbeat, sub, soft pad). Sections from the fitted scene list, so any number of bars works (the progression runs on across sections and restarts only at a drop and the outro): opening `intro`, hero, first chapter and its `decide` `build`, the groove (`drop`) from the second chapter's card on (with `musicRest`, a pad-only `break` under that card first; the example has none since 2026-10-18), except that the flow chapter builds and the compare chapter drops only when its counter lands, a `break` under the install commands up to the bar line among the steps (the steps land one per beat as soon as the commands are read, and the drop falls on whichever of them sits on the bar line), one bar of `build` under the tunnel and `drop` on the claim, `outro` under the end card. Energy follows a tension curve: low at the opening, rising by chapter, highest on the claim. A drop scene whose primary text takes 60 % or more of its length is a reading drop: the groove stays, the pulse rests. While keys are typed under a build or a drop, the pulse dips so the keystrokes are heard. The batch 4 pages: `run` and `pick` sit in the build with the first chapter, `scope` in the groove (2026-10-19). Effects come from `events.js`, the same event list as the picture: keystrokes for typing (16/s), a rush under the log stream and a stamp on its brake, rising ticks for the roulette's jumps and a stamp on its lock, pops for the scope's spikes, a whoosh and a short riser under the beam and a soft impact on the reveal, a falling whoosh and a thud for the CRT collapse and a rising whoosh and a tick for its power-on, a soft whoosh for a window morph, glitch and an airy whoosh for the smear, pop for picks, tags and found decisions, tick for rows, decisions, checks and counter steps (rising pitch), stamp for locks, landings and the confirmation, whoosh for title flights, glitch for cut frames (the title flight carries only its whoosh), riser for the collapse and the tunnel, soft impact with a 5 dB duck for flashes and the claim, a stamp and ticks for the closing chips as they light; every turn and accent key also gets a short bright tick, so each has an onset above 1.5 kHz. Master −14 LUFS, true peak ≤ −1.5 dBTP as delivered (`tone` v2; mastered at −2.0, Known issues). Optional generated bed: `bed: { file, offset }` at the measured tempo.

## Factory defaults

What the template produces untouched; a film's `PLAN.md` ban list starts here. Several items are shared with the unpublished reference film the source was inspired by (14 motifs compared, 12 shared, check 2026-10-18 F1; the settled options of 2026-10-18 changed four of them: HUD decoration, accent use, the claim page, the lock-up); these are the mode's fixed grammar, checked here against the reference; a film's own motif table counts only what it chooses (principle 10).

- The HUD: `brand // tag` top left, `● LICENCE` top right, `[nn/NN] CHAPTER` bottom left, a progress bar, corner brackets.
- Near-black ground, one phosphor accent (ice by default) glowing on what passed, on a `crt` screen (scanlines, striped titles, vignette).
- Giant scanline-striped titles in a neutral gradient, decoded through scrambled glyphs.
- A page header top left with one mono `// …` note line under it.
- Inputs → one hub → outputs with connectors and travelling dots (`flow`).
- A giant counter bottom left, `N / N label` (`compare`).
- Two party cards side by side with a shared lock between them (`compare`).
- A centred title over a row of pipeline nodes (`ends`).
- An install page: a centred title over a terminal window and a row of step cards.
- The claim under a horizon line with the sphere rising out of it, and the same horizon closing the film (`hero`, `horizon-tagline`).
- The cursor lock-up: name and chips typed out of a cursor on the horizon, the URL on the line below (`end`).
- Glitch cut and CRT collapse alternating into every chapter, straight cuts elsewhere, a window morph between pages of one chapter; a chapter card whose title flies to the header; a push-in on each page's result.
- 128 BPM, A minor synth bed, the drop on the claim.
- The example copy: grainlock, a made-up dependency-lock tool; its hook, claim, chapter titles and tagline.

## Don'ts

- Do not keep the example copy or its sentence shapes; the previous example's "X in. Y out." claim, "Who … ?" hook and "From install to first X." title are worn out too.
- Do not set information text below 25 px or let a slot shrink to fit: cut the copy or split the scene (principle 1).
- Do not raise the tempo or shrink the type to squeeze copy into a page: cut words first (keep the line with the most information), then move repeated labels to glance, then split the page.
- Do not hold a chapter card past its reading, add a pause before a cut, or make a step wait for a bar line: the music moves to the picture.
- Do not put more than two questions on a `qa` page, or decisions and the confirmation on it: they are the `decide` scene.
- Do not colour a title, a cursor, a choice or the HUD with the accent, add a second accent, let `bad` or `find` glow or fill, or colour code syntax (Accent role).
- Do not hard-code a hex value anywhere, including effects: the RGB split comes from the palette (principle 7).
- Do not fade a block of text in: it types or decodes (mode principle 5).
- Do not glitch anywhere but a cut, and not more than three times a film (T2: one device ≤ 3); turns past the third take the CRT collapse or a cut (`out`).
- Do not write the scope's or the run's numbers so they disagree with what is drawn: the traces come from `failed`, the readings are copy.
- Do not keep a protagonist drifting after it lands: the sphere stops after two bars; anything that keeps moving is a registered ambient layer.
- Do not name a content field `rest`: the music break under a card is `musicRest` (only `rest: true` marks a rest scene).
- Do not put new text in the compare ticker: it repeats the counted items or it is not allowed to run under the frame edge.

## Checks

- **P0**: `npm run fit` reports no errors (api 3: ≤ 5 primary words a state, every hold ≥ 0.2 s and ≤ 2 beats, compositions ≤ 6 s with a median of 2–3 s, T0 gaps ≤ 4 beats, 3–6 expressive transitions in 30–60 s with no device more than three times, 2–3 peaks with the climax at 60–85 %, every key event on its beat); `hyperframes check` 0 errors and contrast passes; no red banner (it lists text that does not fit at its size, a wrong palette or screen id, a removed slot or `content.variant`, too many questions, decisions or counter items, an end sub over 8 words or a `fit()` error); every typed line's cursor sits after its last glyph; numbers agree (counter N = items, the ticker lists the same items, hashes match the frozen documents, the head id is the same everywhere, gap numbers count across the page, the scope's readings match its spikes); every line holds long enough to read, which `fit()` guarantees for copy within the slot limits; information text ≥ 25 px; no hex outside `palettes.js`; loudness −14 ± 1 LUFS, true peak ≤ −1.5 dBTP; a frame renders identically twice.
- **P1**: `check-film.mjs` against `renders/timing.json` with no FAIL (api 3: the tier rows T0–T3 and `hold lengths`, `scene stills` ≤ 2 beats outside pauses, key events on the beat, hand-offs); the expressive transitions sit about every 8–12 s and each lands with its sound; every landing has its sound on the same frame; the break sits under the install commands, the drop on the claim; the closing chips light on the last downbeat; at most three type levels per frame outside the HUD (four on `compare`); the accent marks only passed / proven (the roulette frame takes it only on the lock, a failing key line is `bad`); glitch only at page cuts; ambient layers within their registered speeds.
- **P2**: grain visible on flat ground but not as noise on text; the sphere and tunnel bloom without clipping to white; scanline stripes do not beat with the 2 px scanline overlay; tags and chips align on a row; the title flight's blur ends exactly on the landing frame.

## Known issues

- **Migrated to timing API 3 (2026-10-19).** Every film made with the template before this date paced by the 2026-10-18 page limits (a glitch cut at every page change, whole-bar scenes, 12 words a page); those films still fit and render with their own `lib/`, but a new copy of the template changes their timing. The example keeps its scenes and copy and stays 71.25 s at 128; it fits api 3 from 122 to 132 BPM only (at 120 a page composition runs 6.05 s and the climax lands at 86 %; at 134–136 the climax lands at 87 %). Its first api 3 run warned that the run into the climax was not the shortest: the pad before the tagline's bar line went to the install's step cards (3.75 s), so the two compositions before the claim averaged 2.81 s against a median of 2.6 s. Since 2026-10-19 the install spends that time before the cards (the terminal waits whole beats, its window bar and then its title dimming on the beat), the cards run 2.81 s, the two before the claim average 2.34 s, and `npm run fit` has no warnings at 128–132 BPM. At 124 and 126 it still prints that warning, wrongly: the shared T3 check rounds composition starts to 0.1 ms but not the climax time, so a claim off that grid is counted in the composition before it (reported 2026-10-19).
- Fixed 2026-10-19: `npm run fit` warned "the last step holds still N beats once the grid are added" on scenes that a pad or the phrase share lengthens, though the tails fill that slack; every type now declares `fillsSlack: true`, and the render's `scene stills` and `hold lengths` measure the frame. The warning that `fibre-burst`, `glitch-cut` and `tunnel-fold` are not library ids is gone too: the rules list them as the mode's own devices (`devices`).
- **Mastered 0.5 dB lower** (2026-10-19): the renderer can encode the mix to AAC three times (the mix, a duration pad when the film is not a whole number of frames, the mux), one more than the shared master's AAC check models; on the reseed demo that took the delivered true peak from −1.9 to −1.2 dBTP, over the −1.5 gate. `score.mjs` masters at −2.0 dBTP (loudness still −14 LUFS, 0.5 dB more limiting) until `lib/audio` models the renderer's chain; the demo then delivers −2.2.
- The CRT collapse and the slice-smear are drawn on the DOM pages (the collapse as a transform of `#stage`, the smear by WebGL from the log's own canvas) rather than as frame-level transitions between two rendered frames, because the pages are DOM; the CRT model's line glow is a DOM bar, not the shader's halo. The beam-trace readings are DOM type lit by the module's painters. These are template-local uses of the library models (TEMPLATE.md, Transitions).
- The batch 4 pages (`run`, `pick`, `scope`), the push-ins, the tails and the sounds of the new devices have been seen only by the agent (contact sheets and key frames of the demo) and measured; the owner has not reviewed them, and nobody has listened to the new sounds.
- **Fixed 2026-10-19: an olive square around the cursor as it becomes the point.** The opening's cursor-to-point tween went from a three-length box shadow to a four-length one, so GSAP paired the numbers by position: the accent's red value became the shadow's spread (136 px in `ice`) and the colour turned yellow-green, a square around the cursor for the 0.8 beat of the move (every film made before this date, e.g. the example at 6.3–6.7 s). Both shadows now list four lengths; frames outside the move are unchanged.
- **Fixed 2026-10-19: the end card's ground went black.** The horizon glow is a screen-blended canvas whose unlit pixels are black; inside its `.scene` (a stacking context of its own) it blended with nothing, so at its 0.85 opacity it covered the ground, the grid and the crosses (ground (3, 6, 9) became (0, 1, 2)), against principle 6 and the background stack above ("screen-blended over the ground"). The glow layer now sits just before the end scene in `#stage` (z-index 5, shown only during the scene), so it screens over the ground and the grid stays visible under the end card. Frames before the end card are pixel-identical; every film made before this date has the black end card (the example from 65.63 s).
- **Fixed 2026-10-19: the fibre burst and the sphere painted the ground black.** Same cause as the end card: both canvases were filled black and their screen-blended layers sat inside their scenes, so the burst covered the ground, grid and crosses as it faded in (on the example at 7.0 s, 21 % of the frame fell more than 3 levels below the ground in `ice`, 14 % in `amber`), and the sphere sat in a dark disc with no grid (a cross at (800, 160) in `ice`: ground (13, 19, 24), before (9, 12, 17)). Fixed at the cause, not by repainting the ground: `fx.js` clears the burst and sphere canvases to transparent (the lit pixels keep their values), and every screen-blended shot is a light layer (`film.js` `lightLayer`) next to its scene in `#stage`, z-index 5, the burst over its scene, the sphere and the horizon glow under theirs, shown only while lit and moved with the scene's exit glitch. Checked against ground-only renders of the same instants in all five presets and in `flat`: no pixel falls below the ground (the cross above now (14, 21, 28)); the end card and every scene after the hero are pixel-identical; boot text before the burst moves by at most 2 levels (the old in-scene blend layer had changed how Chrome composited it). What is left in a scene under the burst now shows through its light instead of going black (the legacy `audit`'s rows as they dim to 25 %; checked on a probe, not re-rendered). Films made before this date have both; the example at 6.6–7.5 s and 7.5–13.1 s. The tunnel still draws its own ground on purpose (Accent role: a change of ground at the claim).
- `screen: 'flat'` on the example raises one `hyperframes check` contrast warning, on a letter of the end card's name (1.64:1 at 67.3 s). The checker samples the letter's own gradient as its background (gradient text cannot be hidden by its colour); on the frame the letter is about 15:1 on the ground and 3.3:1 where it crosses the horizon glow (sampled 2026-10-19). In `crt` the stripes darken the sample and it passes. Listed, not fixed.
- The shortest whole chain is `boot` → `end`: 6 bars, 10.6 s at 136 BPM (`target: 10`); it fits api 3 unchanged (one T2, the fibre burst; peaks: the hook and the lock-up). Anything with the hero or a tagline passes 12 s: `boot` needs 3 bars (4 beats of collapse and burst plus the hook's reading), `end` 3 (the URL holds ≥ 3 s, principle 1), `hero` 2 at least, and the film rounds to a 2-bar phrase. In that chain the claim is only the end card's 32 px sub.
- The end card's cursor blinks to the last frame, so even with `dim: false` the closing frames are settled but not pixel-still (`check-film` closing still 0.2 s).
- Nobody has watched the api 3 cut of the example (71.25 s, 2026-10-19). `check-film` passes with one WARN (above); the pace is measured, not seen.
- Structure stays close to the reference film that inspired the source: giant chapter cards, HUD and the problem → claim → chapters → install → claim arc (Factory defaults). The legacy `audit` and `tunnel-tagline` remain in the registry; they fit the new limits with ordinary copy (checked 2026-10-18) but were not re-rendered.
- `violet` is the weakest mark of the five presets (CIELAB C* 30, the most a lavender can carry at this lightness while staying ΔE00 ≥ 7 from Dracula, Catppuccin and Tokyo Night); amber and ice sit within ΔE00 4 of two terminal themes' colours (Dracula orange, Catppuccin blue). The presets other than ice have not been seen by the owner beyond the five-second samples; the full example film was rendered in phosphor before the default changed.
- Main text below 40 px in dense panels (install commands, end sub, the lock word and outputs, check labels, compare meta, problem tags): reasons under Type.
- (Gone with api 3: the six-word tagline above 128 BPM and the hero just over two bars at 120 no longer warn; the tagline is read in a pause and the grid is a beat.)
- Code-drawn shots versus the generated originals (owner could not tell them apart in a blind test, but up close): the fibre burst lacks the wide, volumetric ribbons and depth of field; the tunnel's near beams are wider and brighter and the far floor lines bunch into a bright band where the original has a dark seam; the sphere's highlight streaks are more regular. The horizon glow is a measured match.
- During the 0.8-beat title flight the title passes over page content that is entering (`hyperframes check` reports it as an informational overlap); since 2026-10-18 the page enters from the middle of the flight, on purpose.
- **The registry assumes a workflow product** (clean-room run on jq, 2026-10-18): qa, decide, freeze and compare describe a process; a filter or a library ends up using `flow` twice with one layout. A product that is not a workflow needs a scene for "input → output" examples. Until then, say so in the plan and use `flow` with different content on each page.
- `boot` draws its problem list in `bad` red with ×: name real problems there, never neighbouring tools the product works alongside (the jq run marked sed, awk and grep as failures).
- `install` always numbers its cards 01–04; when the cards are alternatives (binary, Docker, source), the numerals count nothing (ai-tells). A slot to turn them off is still missing.
- In the jq run the `install` turn measured no sound onset (its section is a pad-only break and the turn stamp was skipped next to a drop cue); the shipped example passes. Check `keys: sound` on every film.
- The `terminal` bed and every effect are synthesised and were checked by levels and spectra only, not by listening. Tempos other than 128 and breaks longer than one bar have not been listened to.
