---
id: hand-mark
category: motion
tier: T0
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### hand-mark

- **Looks**: a smooth vermilion 4.5 px stroke drawn along its path: an underline curved gently under the text (0.5 s power2.inOut), an ellipse clear of the text by 20–34 px starting at its top (0.45 s), or a brace growing from its middle out (0.55 s power2.out).
- **Tier**: T0. **Family**: line-path. **Surface**: canvas.
- **Use**: in-scene.
- **Intent**: Point like a person at the one thing that matters.
- **Content**: A target on screen and the kind.
- **Parameters**: `target` { lines, x, y, size }, `kind` (underline | circle | brace), `mark` (explicit geometry); roles ground, ink, accent.
- **Theory**: a hand-made mark reads as a person pointing (deixis); drawn once and still, it keeps attention without motion noise.
- **Length and easing**: 1.5 beats; the curves above.
- **Sound**: device `hand-mark`: a short pen stroke.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (`skills/filmsmith/assets/kits/terminal-ledger/starter/components/hand.js`), split from terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: At most four a film; draw it once and keep it still.
