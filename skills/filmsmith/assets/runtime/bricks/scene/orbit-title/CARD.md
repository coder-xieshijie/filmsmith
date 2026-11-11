---
id: orbit-title
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### orbit-title

- **Purpose**: holds up one claim with a whole set of real product pictures turning round it: "there is a whole set of these".
- **Intent**: Hold up one claim with a whole set of real product pictures circling it: cards always entering and leaving say 'there is more', while the title stays fixed in the middle.
- **Content**: 6–10 product pictures (16:9 crops or the film's own cards, each with a static first frame), a lead line (en ≤ 40 chars, zh ≤ 14), a key line (en ≤ 24, zh ≤ 9, one line) and an optional kicker (en ≤ 32, zh ≤ 16).
- **Fits**: `hook` (the first shot of an opening), `claim`, `lockup`. **Not for**: a single hero object; claims longer than one short line; sparse light styles where eight cards read as clutter.
- **Layout and camera**: a flat ellipse (720 × 380 px radii) carrying 6–10 16:9 cards evenly spaced, turning at constant speed (0.3 rad/s); cards never tilt, depth is only ±12 % scale, draw order, and far cards darker and softer; a faint orbit line; a dark scrim over the ring keeps the title readable; the title block centred: a secondary lead line over the key line, a kicker under it. Camera: a 2.5 % push over frames 40–110. Beat by beat (frames): the ring opens from 0.62 to full size 0–24 (`snappy`) while the cards fade in one by one; the orbit line draws 0–30; the lead line arrives grapheme by grapheme from 10 (one frame apart, out of a blur, travelling only in its first third), the key line from 18 (two frames apart, heavier and slower); the highlighter springs across the key line from 50 (damping 20, stiffness 190) and the letters it has passed turn `onAccent`; the kicker floats up 60–76; then the hold, the ring braking to a stop over the last 24 frames (`loop: true` keeps it turning; `exit: true` blurs the title out over the last 12).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `cards` | list of `{ image }` | — | 6–10 | — | — | 8 neutral sample cards |
  | `lead` | text | glance | 1 | 7 words, 40 chars | 14 | the sample long title |
  | `key` | text | primary, claim | 1 | 5 words, 24 chars | 9 | the sample claim (140 px, zh 150, fitted to 1000 px) |
  | `kicker` | text | glance | 0–1 | 6 words, 32 chars | 16 | the sample subtitle |

- **Length**: 6–12 beats (3–6 s at 120 BPM): the key line's entry plus a hold of at least a second, longer for reading.
- **Steps and events**: T0 grapheme entries and the ring opening; T1 the highlighter sweep (the one hit, `accent`); a marked pause on the complete poster.
- **Needs**: the highlighter of `marker-stroke` (drawn here with the letter inversion), cards from the sample or `tile-card` pictures; roles `ground`, `panel`, `line`, `ink`, `dim`, `accent`, `onAccent`; type `display`, `text`, `mono`.
- **Sound**: `land` under the key line's last grapheme, `accent` on the highlighter, the bed alone through the hold.
- **Styles**: dark styles with one strong accent (afterglow, exhibit); not plakat, ink or dossier. **Source**: adapted from video-shotcraft `demos/opening/orbit-ring-title-open/OrbitRingTitleOpen.tsx` (card `references/shots/opening/orbit-ring-title-open.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (graphemes enter one by one; the highlighter inverts any script). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the cards are the film's pictures, still (the upstream's eight animated demo tiles are gone); the ring brakes to a stop at the end unless `loop`, so the scene settles; brand mark, wordmark and code name removed from the kicker. Compare against `orbit-ring-title-open`: the orbit (19.8 px, only in the brake) and the highlighter (0 px) match; SSIM drop waived (the title's content differs where the letters appear).
- **Pitfalls**: Never tilt the cards with the orbit; they change place, not angle, or the ring becomes a roller coaster and the text tilts. Keep the key line on one line; the highlighter and the letter inversion assume a single line box. Add no second moving layer (particles, sweeps, breathing gradients) over the turning ring; two constant motions leave no hierarchy. Each card's first frame must be a filled still; cards whose content draws in from nothing show as blanks while the ring opens.
- **Sample**: `poster.jpg`, an English still 480 px wide.
