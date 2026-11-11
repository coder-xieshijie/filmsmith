---
id: prompt-boot
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### prompt-boot

- **Purpose**: The opening: a prompt types alone at the centre and rises as the hook types under it at 150 px, the key word grows on a beat, problem tags pop, then everything collapses into the cursor, a point of light, the fibre burst and a flash.
- **Intent**: Open in the terminal with the failure itself, then turn the whole screen into the point the film grows from.
- **Content**: A prompt (the command), a hook of ≤ 5 words with its key word marked (`*3*`), 0–4 problem tags (a word and a note).
- **Fits**: `hook`; The hook of a CLI film: the command and what went wrong, then the energy of the burst into the claim. **Not for**: Films without a command line; a hook longer than five words; quiet openings.
- **Layout and camera**: prompt 50 px mono muted (fit to 44) with an ink chevron, hook 150 px display (fit to 96), tags 25 px mono in bad (Chinese 28) 20 px apart, centred as one block (36 and 56 px gaps); the prompt types at the frame's centre and rises 0.35 s expo.out as the hook types; the cursor after the last typed character.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `prompt` | code | primary | 1 | 40 chars | 40 chars | pnpm test --repeat=50 / pnpm test --repeat=50 |
  | `question` | text | primary | 1 | 5 words, 24 chars | 10 chars | *3* runs failed. / *3* 次运行失败。 |
  | `problems.word` | list of text | primary | 0–4 | 1 words, 10 chars | 4 chars | SEED / 种子 |
  | `problems.note` | list of text | primary (optional) | 0–4 | 2 words, 12 chars | 4 chars | lost / 丢了 |

- **Length**: 10–20 beats (5–10 s at 120 BPM); four beats after the last tag has been read: the collapse (1.5 beats), the point (0.8 beat), the burst (2 beats); Chinese hooks type by character; the sample plans 12 beats in English, 14 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: prompt at 0.25 beat (40 cps); hook on the half beat once the prompt is read, typed in 1.4 beats; key word 1.14× on the next beat (back.out 2.2), neighbours make room, the rest to 50 %; tags as the one before is nearly read (back.out 2.5); collapse D − 4 beats, far pieces first, power3.in to 5 % and 6 px blur; point D − 2.5 beats; burst D − 2 beats, fading in over 0.5 s; flash at D − 0.045.
- **Needs**: motions cursor-collapse; props terminal-hud; roles ground, ink, muted, bad, accent, hi, titleHi, titleLo; type display, mono.
- **Sound**: typing keys under both lines, a stamp on the key word, a pop per tag, a riser through the collapse, the burst's whoosh and an impact on the flash.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.boot; fx.js burst; events.js TIMING.boot`), split from the template of the phosphor style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: Mark the key word in the copy (`*3*`); a bare word match fails on Chinese and on punctuation. The burst is the loudest shot of the opening: do not put another T2 device within 8 s of it.
