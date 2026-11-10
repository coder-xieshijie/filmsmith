---
id: dot-sort
category: motion
tier: T1
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### dot-sort

- **Looks**: each dot moves from its place in the heap to its slot in its group's pile (0.8 s power3.inOut), starting at a time ranked by its x (spread 0.25–0.3 s) plus jitter (≤ 0.08 s), its colour turning to the group's over 0.6 s from +0.1 s; a group marked keep stays grey.
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: in-scene (pile-split runs it).
- **Intent**: Make a share visible as the same items moving apart, so the proportion is felt before the figure is read.
- **Content**: Dots on screen and 2–4 groups.
- **Parameters**: `groups` [{ count, color (a role), at [x, y], seed, delay, keep }], `seed`; roles ground, base, baseS, wait, waitS, judge, judgeS.
- **Theory**: common fate: dots that move together and share a colour are read as one group, so the share is seen before it is counted.
- **Length and easing**: 3 beats at 120 BPM (the last dot lands); power3.inOut moves.
- **Sound**: `tick` as the first pile settles.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (`skills/teach-video/assets/kits/terminal-ledger/starter/components/ledger.js toPile, F.partition`), split from teach-video's terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Keep every dot.
