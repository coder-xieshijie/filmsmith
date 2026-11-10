---
id: emblem-relay
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### emblem-relay

- **Purpose**: a three-point benefit statement where each word gets geometry that argues it: rings that spin (quick), rings that lock (locked), a metal sheen for the conclusion (polished).
- **Intent**: Let each benefit word be argued by its own geometry, spinning rings for quick, locking rings for tight, a metal sheen for the final word, so three words become one continuous claim rather than three title cards.
- **Content**: 2–4 single benefit words of the same grammatical kind (en ≤ 9 chars each, zh ≤ 3), optional one-line subs (en ≤ 40, zh ≤ 16), and which geometry backs each word.
- **Fits**: `claim`, `proof`. **Not for**: words longer than one word (three Chinese characters); calm films (nothing on screen ever stops); light grounds.
- **Layout and camera**: the word centred at (960, 500), 230 px (Chinese 236) at weight 800; the emblem behind it on the same centre at frame scale; a 40 px sub under it (246 px under for `link`, 210 otherwise); frame furniture not under the camera: a mono counter top left, three progress segments with mono labels along the bottom; a stage light and 26 drifting specks. Camera: a slow push 1 → 1.025 on the word's centre.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `words` | list of text | primary | 2–4 | 1 word, 9 chars each | 3 chars each | `Quick, Locked, Polished` / `更快、咬合、精致` |
  | `subs` | list of text, optional | info | 2–4 | 7 words, 40 chars each | 16 chars each | one neutral line per word |
  | `emblems` | list of `spin` \| `link` \| `sheen` \| `none`, optional | — | one per word | — | — | `spin`, `link`, …, `sheen` for the last |

  Options: `size`, `weight` 800, `counter` true, `progress` true, `dust` 26, `push` 0.025, `seed`, `cues` (each word's entry in beats; null = 2 f then every 57 f), `probes` false (comparison points).
- **Length**: 8–16 beats (4–8 s at 120 BPM): 57 f per word, 64 f for the last; 12 beats for three words.
- **Steps and events**: per word a T1 composition: in over 14 f (`EASE.snappy`, scale 1.06 → 1, blur 10 → 0), outline first, fill wiped in from 10 f over 18 f (`EASE.swift`, soft front ±7 %); out over 10 f (`EASE.exit`, 1 → 0.86, blur 12), 6 f of overlap with the next. `spin`: ring 0.4 → 1 over 22 f with 160° of braking, then a steady 0.9°/f against a tick ring at −0.35°/f, a comet at 7.5°/f. `link`: three rings trimmed on 6 f apart over 22 f (`EASE.out`), closing 340 → 300 px at 38 f over 14 f, a brightening click and four rivets (`EASE.overshoot`). `sheen` (the T2 peak, `plan().peakAt`): chrome from 4 f, a sweep band 8–32 f, plain ink with a bloom from 30 f, a horizon line; then a 22 f hold.
- **Needs**: no motions or props; roles `ground`, `ink` (words, all geometry lines), `dim`, `accent` (the sheen's warm band); type roles `display`, `text`, `mono`.
- **Sound**: `turn` at each word's entry, `land` at the `link` click, `hit` at the sheen's settle.
- **Styles**: high-energy dark looks (phosphor, pulse); avoid dossier and ink.
- **Source**: adapted from video-shotcraft `demos/typography/word-relay-geometry/WordRelayGeometry.tsx` (card `references/shots/typography/word-relay-geometry.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: Chinese words are two-character words at 236 px; the outline stage carries a faint fill under Chinese (pure outlines of Chinese show every stroke overlap); subs rise by phrase; labels are set as written (no uppercase in either language).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: text stroke, masks and background-clip are composited offscreen layers; all lines in ink instead of white and the champagne highlight is the accent; no brand mark or name; timing per word so two to four fit; the static Helvetica is the look's display face. Compare (with upstream's entry frames passed as `cues`): pass (second word's scale and link spacing 0 px, events 0; SSIM drop 0.026).
- **Pitfalls**: The words must be the same kind (three adjectives or three comparatives) and of similar length; a long word pushes out of its ring. Give the sheen to the last word only; sheen on every word removes the sense of a conclusion. Keep the dust, shared stage light and progress bar; without them the relay falls back into three separate cards.
