---
id: install-cards
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### install-cards

- **Purpose**: Getting started under a musical break: the title decodes in two halves, a terminal rises and its commands type at reading pace, then the title and terminal leave and two to four step cards land alone, one a beat, on the drop.
- **Intent**: Show how little it takes to start, then recap the film as the verbs you will type.
- **Content**: A title (≤ 4 words, or its two halves), the window's title and right label, 1–2 commands, 2–4 steps of a command and a label (≤ 4 words).
- **Fits**: `rest`, `demo`; The rest before the climax of a CLI film: how to install, and the verbs the film has shown, as cards. **Not for**: More than two commands; steps that are not the film's own chapters; a product without a command line.
- **Layout and camera**: title centred at y 150, 108 px (fits to 94; Chinese to 88), decoded in two halves; terminal window 1320 × 210 at (300, 330), bar 54 px with three dots, commands at 32 px mono from (328, 414), 54 px apart; cards 360 × 150, 50 px apart, centred at y 465: number top right (25 px dim), command (25 px mono muted), label (25 px, Chinese 28) in ink; the HUD when given.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | primary | 1 | 4 words, 26 chars | 12 chars | Replay any run. / 任何一次运行都能重放。 |
  | `window` | list of code | glance | 1–2 | 24 chars | 24 chars | ["terminal","zsh"] / ["terminal","zsh"] |
  | `commands` | list of code | primary | 1–2 | 60 chars | 60 chars | ["npm i -D reseed"] / ["npm i -D reseed"] |
  | `steps.cmd` | list of code | glance | 2–4 | 18 chars | 18 chars | reseed run / reseed run |
  | `steps.label` | list of text | glance | 2–4 | 4 words, 20 chars | 8 chars | record seeds / 记录种子 |
  | `hud` | group | – (optional) | 1 | – | – | null / null |

- **Length**: 8–20 beats (4–10 s at 120 BPM); the cards land one a beat from the beat after the commands are read; minBeats over the plan adds whole beats before them, with the window bar then the title dimming to 60 % on the beat; the sample plans 11 beats in English, 14 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: title halves decode at 0.1 and 0.6 beat (0.5 / 0.45 s); terminal rises at 0.43 beat (0.35 s); commands type at reading pace (≤ 90 cps, ≥ 24) once the title is read; title and terminal leave on the first card's beat; cards enter 0.3 s expo.out from 30 px below at 0.94, their border turning muted.
- **Needs**: motions glyph-decode; props terminal-hud; roles ground, panel, ink, muted, dim, line, accent, titleHi, titleLo; type display, text, mono.
- **Sound**: a key tick per command, a stamp per card, the drop on the first bar line among the cards.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.install; events.js TIMING.install`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: Time the host adds goes before the cards, not after them: the cards keep their own length into the climax.
