---
id: plate-slip
category: motion
tier: T2
family: paper
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### plate-slip

- **Looks**: A title slams in from off-frame on an ease-in and, on the hit, splits into two ink plates printed out of register, about 20 px apart sideways and 8 px up and down; the plates shake against each other twice, the slip dying away, while the page kicks 1.2 %; on frame 52 they snap hard into register with a small 3 % pulse and the title stands printed in one ink.
- **Tier**: T2. **Family**: paper. **Surface**: canvas.
- **Use**: the hit on a title or a word in a paper, print or poster style: the one landing a viewer should feel, once or twice a film. **Not for**: screen styles (use `impact-frame`); small text; every title of a film (two at most).
- **Intent**: A hit in the language of print: the plates slip out of register and snap back, so the landing feels like ink stamped on paper, not a screen glitch.
- **Content**: One large title or word (≤ 20 chars, 200–300 px), optionally over a scene.
- **Parameters**: `from` (the scene under the title; null: the ground), `text` (default the sample `claim`), `x` 120, `y` 250, `size` 230 en / 176 zh, `width` 1500 en / 1680 zh (wrap width), `weight` 860, `amp` [20, 8] px (the slip), `period` 18 frames, `tau` 60 frames (decay), `slide` 1700 px (where the slam starts). Roles read: `ground`, `ink` (one plate, and the title in register), `accent` (the other plate), `paper` (the plates are screened with paper on a dark ground, multiplied on a light one).
- **Theory**: A print metaphor for a hit: two colour plates out of register are what a risograph does when the drum slips, so the shake reads as material rather than as a screen glitch; the hard snap (not an ease) on a residue of about 11 px is the accent, the register itself.
- **Styles**: plakat, halftone, ink, swiss; never phosphor, stream or thread (two plates on a glowing screen read as an RGB split).
- **Length and easing**: 4 beats (60 frames at 120 BPM), 3–4. Slam ease-in over frames 0–8; slip ±amp · cos(2πt/18) · e^(−t/60) over 8–52; hard snap on 52 with a 4-frame pulse `out`; page kick 10 frames.
- **Sound**: `land` on the slam (frame 8), `accent` on the snap into register.
- **Source**: adapted from video-shotcraft `demos/effects/riso-print-hits/RisoMisregistrationHit.tsx` (card `references/shots/effects/riso-print-hits.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the title goes through `lang.js`: Chinese at 176 px on a 1680 px line, no negative tracking).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: fluorescent pink and blue become the accent and the ink; the halftone sun, register marks, info rows and the stamp are the scene's; paper fibre and grain are the style's texture. Compare against `misregistration-hit`: track 9.4 px, progress RMSE 0.001, events 0; the SSIM drop is waived (the upstream poster and its sun are not in the brick).
- **Don't**: use it on a screen style: there two offset colour copies of a title are an RGB split, a known AI tell (`ai-tells.md`); keep it to the printed look and one or two hits a film.
- **Pitfalls**: The slip must be large enough to see: about 20 px per plate (40 px apart) on a 200–300 px title; ±5 px is invisible at speed. Mix directions, mostly sideways with a little vertical; purely sideways reads as a wobble. Paper films take this, screen films take impact-frame; never both in one film.
