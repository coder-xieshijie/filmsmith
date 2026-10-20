# Checklist

Walk this against the rendered MP4, not the preview, then the mode card's own checks. Record each result in the film's README. Levels follow the pyramid in [foundations.md](foundations.md): P0 items are gates, P1 decide rhythm, P2 decide finish. Each item applies a [core principle](principles.md), named in brackets. `scripts/check-film.mjs` measures the items marked ⚙ against the film's `renders/timing.json` (written by `npm run fit`); an item with nothing to measure in this film reports N/A, never PASS. Time limits it checks carry a 2-frame tolerance (one frame at 30 fps is 0.033 s). Where it only estimates from pixels (smallest text, text contrast, type levels, accent area, reading against holds, picture onsets, large changes, the loudest moment) it reports INFO; those items stay unmarked and are checked on the frames and in the DOM. The four tiers of change (principles 4 and 5) are enforced for templates whose `timing.rules.js` declares `api: 3`: `npm run fit` refuses what follows from the content and `check-film` FAILs what it measures; for a template still on `api: 2` the same measures are reported as INFO, and its items below keep their api 2 limits, given in brackets.

## P0 — fails the film

- ⚙ `npm run fit` reports no errors, and the rendered duration matches its fitted length within 2 frames; 1920×1080 (16:9 only), 30 fps; no black frames outside the first and last 0.2 s. [5]
- ⚙ Integrated loudness −14 ±1 LUFS, true peak ≤ −1.5 dBTP. [1]
- ⚙ Flashes: in any one-second window, no more than three pairs of opposing relative-luminance changes of 10 % or more (the darker frame below 0.80) in any area of about a third of the frame's width and height, and none over 25 % of the screen more than three times (WCAG 2.2 SC 2.3.1; ITU-R BT.1702). Fast cuts, glitch jitter and tear bars count; saturated red flashes count separately. [1, 4]
- No person on screen, filmed or generated; no generated photoreal footage. [8]
- Text that carries information is ≥ 25 px at 1080; anything smaller is decoration listed in the mode card's Type section. [1]
- Contrast against what is actually behind the text on the rendered frame (paper grain, light, transparency included): body ≥ 4.5:1, large type ≥ 3:1. Context text dimmed on purpose carries no information while dimmed and keeps ≥ 3:1. [1]
- Every line of text holds still long enough to read, by tier: primary text 0.3 s per English word, a scene's primary lines added in reading order; glance text (≤ 6 words, repeated elsewhere or dispensable) fully still ≥ 1 s; word-at-a-time text timed per word, then the whole line held 0.3 s per word; the closing URL ≥ 3 s. Text counts as read while it is readable and still; other things may change meanwhile if they are not new text and do not cross it. `npm run fit` sizes every scene for this; check the frames for text that moves before it is read. [1]
- ⚙ Text per state: primary text entering at one moment is at most five words; a claim at most eight, read in a marked pause; word-by-word or phrase-by-phrase entry is the default (api 3, refused by `npm run fit`). [1, 5]
- No text clipped, overlapping other text, or crossing the frame edge; nothing stuck mid-animation at a cut. The only exceptions are deliberate and listed on the mode card with their condition: a stamp landing in the title block's approval field (never on a key number or note); a marquee whose content is shown in full elsewhere; a panel collapsing in ≤ 0.2 s. [1, 2]
- Every number on screen is computed by code and agrees with itself in every scene; length, frame count, tempo and loudness shown on screen are filled in from the fitted timing or the measured master, never typed; illustrative values are labelled in the README. [2]
- Numbers quoted from another party keep its terms: who measured them, `~` on chart readings, ranks and ties computed from the reported values, quantities named by what they measure, offers in official wording, no cost compared alone against a higher score; no number passes through other digits while it animates. [2]
- Pointers, cursors, connectors and stamps land exactly on their targets. [2]
- One accent colour marking one kind of thing, the mode card's Accent role; status, category and effect colours appear only under their conditions (principle 7); the palette is a preset from the mode card. [7]
- Every font has its licence file in `assets/fonts/`, and every face loaded as declared: no red font banner on any frame, no font error in `npm run check`.
- `npm run check` reports 0 errors; two renders of the same frame are identical. [5]

## P1 — rhythm

- `PLAN.md` holds the concept sentence in its fixed form with the rival test, a ban list taken from the mode card's Factory defaults and [ai-tells.md](ai-tells.md), the nearest reference film and the motif table. [10]
- ⚙ Key events (accents, stamps, chapter turns, the claim, the lock-up, the end) sit on a beat within 2 frames, and the picture starts, strikes or lands on that frame (±2 frames); chapter turns and the claim start on a bar line; hard cuts sit on a beat within 2 frames. [5]
- Length comes from `fit()`: no hand `bars` below a scene's reading need, no hold padded to reach a target length; phrase rounding is spread over earlier scenes, and the closing scene ends with a second move on the downbeat of its last bar. [5]
- ⚙ **Holds.** After a landing the content area (grain and ambient layers excluded) holds still at least 0.2 s and at most two beats, plus the 2-frame tolerance; a claim being read may hold up to two bars in a hold marked `pause`; rest scenes excepted, and the closing card holds still for at most one bar plus the URL's 3 s. [api 2: after each step at most one bar, after the page's last step one and a half; a page at most twelve primary words and four bars unless marked rest or climax with its reason.] [5]
- ⚙ **T0 micro changes.** A word or phrase entering, a highlight jumping, a count ticking, a morph step: the median gap between neighbouring changes is at most two beats, and no gap is longer than four beats outside rest scenes and pause holds; each change brings one new piece of information. Measured on the declared events (`micro`, keys, scene starts, shots, expressive starts, peaks); picture onsets per second and the longest still stretch are reported beside them. [5]
- ⚙ Brisk pace: no run of near-still beats longer than four beats outside the closing scene [api 2: the last-step hold plus one beat], and no more than half the film's beats near-still. [5]
- Brisk turns: each scene's first text is readable within two beats; the next scene enters while the previous one leaves, never on top of its text; exits take at most two thirds of the entrance's time; a chapter turn's camera or morph takes at most a beat and a half. Nothing waits on screen for the music. [5]
- ⚙ Each registered hold settles: the content area is still (three frames in a row) within 0.3 s of the hold's start and leaves nothing moving behind (0.3 s is draft). [4, 5]
- ⚙ Across each registered hand-off, the frame difference is no larger than 1.5 × the 95th percentile of the ordinary frame pairs within a second of it (draft). [4]
- Each state grows out of the last along a relation the content has (regroup, reshape, bend, carry); a straight cut, on a beat or an action, where the next content has no relation; no text cross-fades over other text; no frame of bare ground in the middle of a transition. [4]
- ⚙ **T1 scene changes.** Compositions (scene starts plus declared `shots`) last a median of 2–3 s, none over 6 s unless its scene is a rest, or a climax with a written reason; at least two in the first five seconds; a coefficient of variation of at least 0.3, with runs that speed up or slow down; a new topic enters only at a scene change. [4, 5]
- ⚙ **T2 expressive transitions.** One every 8–12 s (about 3 in 30 s, 5–6 in 60 s), each a named device of the transition or hand-off library or a full-frame change of ground, at most two beats long; the same device at most three times a film and never twice in a row unchanged (change its direction, origin or colour role); each lands with a sound. [4]
- ⚙ **T3 peaks.** Two or three marked peaks (the hook, the claim or reveal, the lock-up); the climax at 60–85 % of the length, the compositions just before it the shortest, a release after it; the sound may drop out before the lock-up. A tagline followed by an end card lands past 85 % (the URL holds 3 s after it): make the tagline the lock-up peak and put the climax on the strongest proof before it. [4, 5]
- Moves and scales that start and stop never run linear, except motion that shows time or a constant-rate process and registered ambient layers; colour and opacity never overshoot. [5]
- Content area: at most three type levels (sizes within 15 % are one level, neighbouring levels ≥ 1.25 apart), plus one label level on a table or diagram page when the card gives the reason; every size sits on the mode's type scale (±2 px). [3, 7]
- Main text is ≥ 40 px, or the mode card says why not. [1]
- The accent as a mark covers ≤ 10 % of the frame; a full-frame accent ground at a structural turn lasts ≤ 2 bars each time. [7]
- Of the motifs the film chooses (scene types and order, copy, palette, through-line, optional devices), at most half are shared with the nearest reference; the mode's fixed grammar is not counted here, it is checked on the mode card (half is draft). [10]
- ⚙ Fast and slow passages alternate: no run of four or more scenes of equal length (scene-length variation and the slowest passage are reported as INFO; the CV gate is T1). [5]
- ⚙ Short-term loudness never above integrated + 5 LU (EBU R 128 s1); momentary loudness never jumps more than 6 LU above the median of the preceding 2 s, except at a key the plan marks as a drop. [1]
- The music gives way where the viewer must read and lands its accent on the key moment: a scene whose primary reading takes 60 % or more of its length gets the bed's reading drop (the melody layer rests; the groove stays); a pad-only break is kept for the film's heaviest reading (60 % is draft). [1, 5]
- Within the first two seconds the frame already shows the film's world; the ending gives one action (URL, command, name). [9]
- Pause on any frame: within three seconds you can say what it is about. [3]

## P2 — finish

- The key word or number of each scene is enlarged, isolated or zoomed, not only coloured. [3]
- Fast moves carry motion blur; grain is seeded and constant; objects meant to have volume have a highlight and a shadow. A flat-print mode may leave out blur and secondary motion where its card states the departure. [6]
- Clean, not plain: every move is fluid enough to hold the eye; organic material (ink, liquid, light) flows as a field with uneven density and curling edges, never a rigid shape scaling up. [6]
- None of the devices in [ai-tells.md](ai-tells.md) appears. [10]
- ⚙ Every landing that deserves a sound has one, on the same frame: at each `land`, `stamp`, `accent` and `turn` key, broadband energy rises by 3 dB or more within ±1 frame. [5]
- Judge by ear what check-film reports only as INFO: octave balance against its reference curve, four-bar repetition, limiting; on headphones and on a phone speaker. Until someone has, the README says the sound is "not yet confirmed by ear". [1]
- Mute it and hide the text: in a mode chosen by domain, the look still says which world the film belongs to; in a mode chosen by form (ink, plakat, thread), you can still tell it is a technical product. [9]
- Next to the mode's source film and the nearest reference, it does not read as the same design; the plan's ban list holds. [10]
- The mode card's known issues are beaten or carried forward in the README.
