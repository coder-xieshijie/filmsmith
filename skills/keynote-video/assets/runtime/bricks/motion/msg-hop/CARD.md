---
id: msg-hop
category: motion
tier: T0
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### msg-hop

- **Looks**: the chip moves from one part's centre to the next along the connector: power2.out to the middle of the longest uncovered stretch, still for the hold, power2.in on; it fades while 35 % or more of it is under a part.
- **Tier**: T0. **Family**: line-path. **Surface**: canvas.
- **Use**: in-scene.
- **Intent**: Give the eye one still, whole label per hop.
- **Content**: Two parts, the connector and one chip.
- **Parameters**: `a`, `b` (nodes), `text`, `kind`, `hold` (s); roles ground, ink, dim, line, coreS/H/B and the message colours.
- **Theory**: one fixation on a whole, still label (0.2–0.3 s) lets it be read; hiding it under the parts makes them solid places.
- **Length and easing**: 2 beats (1 s) with a 0.3 s hold.
- **Sound**: device `msg-hop`: a soft tick on arrival.
- **Styles**: made for `blueprint-zoom` (recipe the blueprint-zoom recipe); hosts: teach.
- **Source**: own (`skills/teach-video/assets/kits/blueprint-zoom/starter/components/message.js travel (under, hold)`), split from teach-video's blueprint-zoom kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono in windows), floor 25 px; slot limits keep English labels inside the kit's boxes.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from teach-video's blueprint-zoom kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added. It ends moving: the chip slides under the receiving part at speed, hidden there (endsMoving, SPEC 3.1), as the kit's travel does.
- **Pitfalls**: Every hop gets a hold; first rounds slow.
