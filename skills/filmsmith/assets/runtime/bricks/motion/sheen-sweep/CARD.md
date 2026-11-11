---
id: sheen-sweep
category: motion
tier: T0
family: mask-type
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### sheen-sweep

- **Looks**: One soft diagonal band of light, angled 115 degrees, crosses a dark card once from left to right, clipped to its rounded corners; a thin bright core in the middle of a wide fall-off; the card's top edge brightens where the band passes; then the card is as it was.
- **Tier**: T0. **Family**: mask-type. **Surface**: canvas.
- **Use**: crowning the one hero card while it holds still: the plan, the product card, the result. **Not for**: light grounds or light cards (screened light is invisible there); more than one card; more than twice a film counting all light effects.
- **Intent**: A silent crowning: one pass of light over the hero card says "this is the one" without decorating anything else.
- **Content**: One dark hero card in the scene (its rect), holding still; no text.
- **Parameters**: `from` (the scene, default the grid), `rect` (the card, default `gridRect(4)`), `radius` 22, `core` 0.5 (core brightness), `edge` 0.85 (top-edge highlight). Roles read: `paper` (the light, screened).
- **Theory**: A specular highlight moving over a surface is how the eye reads a material turning to the light (gloss perception, Fleming 2014); passing once, on the one card that matters, it crowns it without decorating the rest.
- **Styles**: any dark style; never ink, halftone, dossier or plakat (no gloss on paper).
- **Length and easing**: 2 beats (30 frames at 120 BPM), 2–3; band centre −0.45 W → 1.45 W on `swift`.
- **Sound**: none, or a soft device cue (`device: { 'sheen-sweep': … }`) as the core crosses the centre.
- **Source**: adapted from video-shotcraft `demos/effects/light-play-moves/SheenSweepRetry.tsx` (card `references/shots/effects/light-play-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the card is flat: the 3D turn toward the light, the brushed metal and the etched lit copy are the scene's; the band is paper screened over the card instead of warm white. Compare against `sheen-sweep`: pass, track 0 px, events 0.
- **Don't**: sweep a sheen over chrome or brushed-metal lettering, or over every card: shiny metal and decorative glows are known AI tells; one pass, one card, on a beat.
- **Pitfalls**: Four rules or it looks cheap: one sweep, one hero card, clipped to its corners, once only. Dark card or dark ground only; on light it is invisible. All light effects together at most twice a film.
