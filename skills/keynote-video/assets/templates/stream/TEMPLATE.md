# Stream template

One thread carries the whole film: it threads a scattered desk together, becomes the spine every interface block hangs on, sends tasks out as stars, links them into a constellation, forks into three cards, sweeps the sky to gather every star into one panel, lies flat under the claim and winds back into the mascot. The mode card is [`references/modes/stream.md`](../../../references/modes/stream.md); this file is what an agent reads before editing `content.js`.

## Files

| File | What it is |
|---|---|
| `content.js` | The film: language, palette, the two form variants, product, interface words, nine scenes. The only file edited for an ordinary film. |
| `examples/content.zh.js` | The same example film written in Chinese. |
| `lang.js` | Everything that depends on the language: reading time, character limits, line breaking, typing, type sizes. Kept in this template for now; it moves into the shared runtime (`timing.js`, `text.js`) once a second template sets Chinese. |
| `sched.js` | Each scene's choreography as times (pure). Scene lengths, picture and sound all read it. |
| `timing.rules.js` | The rules `lib/timing.js` `fit()` reads; `validate(content)` checks every slot against its limit. |
| `plan.js` | The film laid out in absolute time: stars, the chat feed, the hung blocks' positions, the closing sweep, cues. Pure. |
| `film.js` | The picture: three canvases (night and stars; thread, beams and hooks under the blocks; mascot and sparks over them) and DOM blocks for all text. |
| `palettes.js` | Four presets; `node palettes.js` prints every text pair's contrast. |
| `score.mjs` | The sound: `terminal` bed and one sound per cue, mastered to −14 LUFS. |
| `fonts.json`, `tools/fonts.mjs` | Fonts per language; the Chinese face is cut to the characters the film uses, and glyph coverage is checked. `new-film.mjs` and `npm run setup` run `tools/fonts.mjs` instead of `lib/setup-fonts.mjs`; it moves into the shared runtime (`setup-fonts.mjs` with a language) together with `lang.js`. |
| `index.html`, `package.json`, `hyperframes.json` | The composition and the scripts (CONTRACT.md). |

## Language

`lang: 'en' | 'zh'` (default `'en'`). Write the copy in the film's language; the switch does not translate. It sets:

| | `en` | `zh` |
|---|---|---|
| Fonts | DM Sans (variable, OFL) | DM Sans for Latin, then Noto Sans SC (variable, OFL) cut to the film's characters by `npm run setup` |
| Reading | 0.3 s a word, at least 1 s a state | 6 characters a second + 0.5 s a state; a Latin word inside counts 0.3 s |
| Line breaks | at spaces | after `，、：；。！？` first; a phrase wider than its line breaks between characters, never before closing or after opening punctuation |
| Balance | lines narrowed while the count holds, so no line ends alone | same, and never breaking a phrase that fitted |
| Text entrance | a word at a time | a character at a time |
| Tracking, leading | −0.01 em, 1.32 | +0.02 em, 1.5 |
| `<html lang>` | `en` | `zh-Hans` |

Choose the language from the material: Chinese material makes a Chinese film, English material an English film; ask when it is mixed or unclear; with nothing to go by, English.

Chinese needs `uvx` ([uv](https://docs.astral.sh/uv/)) on PATH: `npm run setup` downloads Noto Sans SC (about 18 MB, from the pinned google/fonts commit), cuts it to the film's characters with fontTools (about 170 KB for the example) and stops when a character of `content.js` is missing from the font, so a film never falls back to a system face. Change the Chinese copy, run `npm run setup` again. English needs only DM Sans; without `uvx` its coverage check is skipped with a warning.

The Chinese reading rule (6 characters a second plus 0.5 s a state, owner, 2026-11-09) lives in `lang.js`; the runtime's `cjkCharSec` (9 characters a second) is not used by this template.

## Variants

| Field | Values (default first) | What changes |
|---|---|---|
| `palette` | `night`, `ember`, `aurora`, `mono` | colours only (mode card, "Palette presets") |
| `opening` (the form variant, CONTRACT.md) | `'desk'`, `'night'` | `desk`: a daytime desktop (accent-tinted wallpaper, taskbar) piles up windows, alerts, a note and a cascade of copies, freezes, is threaded and sinks into the night. `night`: the same items as dark cards scattered over the night sky, drifting; threaded the same way, no desktop |
| `lockup` (an ending switch) | `'name'`, `'mascot'` | `name`: the mascot winds to the centre and becomes the point the name opens out of; the thread settles as a rule under it. `mascot`: the name opens and the mascot hops from the top of the spine onto the end of the wordmark |
| `product` | `{ name, role, tagline }` | the name beside the mascot and in the lock-up; the tagline under it |
| `ui` | words of the interface | status words, list header, filter pills, input placeholder |

## Scenes

All nine, in this order (no cut-down yet). Limits are characters (graphemes) per slot, `en / zh`.

| Type | Purpose | Slots and limits |
|---|---|---|
| `open` | Scattered → threaded (first peak) | `sessions` ×3 `{ title 24/12, ask 26/13, status 26/13 }`; `alerts` ×4 `{ title 26/13, yes 10/4, no 10/4 }`; `note` ×2 lines 36/16; `freeze` 16/8 |
| `intro` | The mascot's name; the first block unfolds from the thread | `lines` ×2, bubble 86/40 |
| `ask` | One ask → one task hung on the thread → it finishes and shrinks into a star | `caption` 34/14, `file` 18/14, `ask` 86/40, `reply` 86/40, `chip` 34/17, `task { title 30/15, running 34/17, done 34/17 }` |
| `evening` | Many asks, a task list grows out of the chat, a star per ask, then a burst | `caption`; `asks` 3–8 `{ ask 86/40, task 30/15 }`; `more` 0–16 (unnamed stars; the last two queue) |
| `constellation` | A job that keeps going: a workspace, three jobs and a plan as a constellation, results flow back along the beams (second peak) | `caption`, `caption2`; `ask`, `offer` bubbles; `yes` 10/4; `workspace` 18/9; `jobs` ×3 `{ label 18/9 }`; `plan { label 18/9, waits 22/11 }`; `result` bubble |
| `verify` | The check gate: stopped once, sent back, reworked, passes | `caption`, `gate` 10/4, `item` 18/9, `fail` 22/11, `pass` 22/11 |
| `cards` | Three cards, whole – part – whole: each enlarged in turn with its rows | `caption`, `caption2` (shown as the sub-line); `cards` ×3 `{ title 14/7, sub 30/15, rows 1–3 × 34/17 }` |
| `close` | The thread gathers every star into one panel (climax); one "needs you"; the claim on the thread | `caption`; `panel { title 30/15, rows 2–4 { title 30/15, status 'needs'|'done', detail 34/17 } }` with exactly one `needs`; `nudge` 34/17; `claim` 30/14; `words` ×3, 10/4 |
| `lockup` | Name (and mascot) | `product.name` 10/10, `product.tagline` 36/15 |

A caption must fit one line (860 px at 58 px); the page shows a red banner when it does not. `npm run fit` stops on any slot over its limit.

## Length

Each scene's length is its choreography plus the reading time of its copy (`sched.js`), on a 128 bpm grid (120–132). The example runs 91.9 s in English and 97.5 s in Chinese: the Chinese reading rule is slower per idea. Shorter films: fewer `asks`, fewer `more`, one-row cards, shorter bubbles.

The rules declare timing API 1: each scene is one continuous composition hung on the thread, so every type is a `rest` and the api 3 tiers are printed as INFO (the migration is a known issue on the mode card). `events()` gives `check-film` the beat-locked keys (the constellation linking and the panel opening, both on the music's drop; the name opening), the micro changes from `sched.js` cues, and the peaks (hook, reveal, the climax at about 83 %, the lock-up).

## Commands

```
npm run setup    # fonts for content.lang (+ subset, coverage, <html lang>) and GSAP
npm run fit      # lengths, renders/timing.json, data-duration
npm run audio    # fit + score → assets/audio/mix.wav
npm run check    # hyperframes check
npm run render   # renders/film.mp4
npm run film     # audio + check + render
```

## Worked example

`content.js` (English) and `examples/content.zh.js` (Chinese) are the same film: Skein, a fictional desk that runs agent tasks in parallel and brings results back checked. Copy either one and replace the copy; keep the palette, opening and lock-up unless the brand asks otherwise.
