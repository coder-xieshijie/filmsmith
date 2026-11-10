---
id: gradient-drift
category: motion
tier: T0
family: shape
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### gradient-drift

- **Looks**: the ground is a gradient that keeps moving: first a linear gradient whose angle sweeps from 18° to 198° while its stops drift and a soft light walks along the top; then (a 12-frame cross-fade) a radial light whose centre walks the diagonal from lower left to upper right while its radius opens from 48 % to 80 %; then (14 frames) a three-tone conic ring behind the right of the frame that turns 250° and slows to a stop. The text side is darkened under the first two kinds, the conic is ringed dark, and a vignette holds the frame. Drawn at 480 × 270 and scaled up, so it is soft by construction.
- **Tier**: T0. **Family**: shape. **Surface**: canvas.
- **Use**: an ambient ground under a title sequence or a launch intro; its three phases can carry a three-line title (one line per kind). **Not for**: behind dense content (it competes); looks with a flat or paper ground; a cut on the beat (it is slow by design).
- **Intent**: Keeps a still layout alive: a slow, ever-moving ground gives text-only passages a quiet pulse without pulling the eye.
- **Content**: No material: it is the ground under a scene (titles, a wordmark); 1–3 short foreground lines laid over it with `over`, one per gradient phase.
- **Parameters**: `over` (a painter drawn over the ground, `paint(ctx, p)`; none by default), `darken` 0.42 (the text-side shade under the first two kinds), `vignette` 0.55. Roles read: `ground` (the deep tone; on a dark ground it is darkened further), `accent` (the light), `ink` (mixed into the highlights).
- **Theory**: slow, continuous change of the ground keeps a still layout alive without competing with it (motion in the periphery is noticed but not attended, Peterson & Dugas 1972); one kind per phase makes the three phases readable.
- **Styles**: any style with a lit or dark ground; avoid paper, letterpress and blueprint.
- **Length and easing**: 12 beats (6 s at 120 BPM), 8–24; the phases are fractions of the brick: linear 0–34 % `swift`, radial 28–66 % `swift`, conic 59–100 % cubic-bezier(0.45, 0, 0.2, 1); cross-fades 28–34 % and 59–66 % `smooth`.
- **Sound**: a pad or riser; no hits (nothing lands).
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/transition/gradient-transition/GradientTransition.tsx` (card `references/shots/transition/gradient-transition.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the sample lays the title scene over it).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the stops are mixes of ground, accent and ink instead of fixed purples, magentas and ice blue (so it follows the look's palette and works on a light ground); the copy, the wordmark and the parameter readout are gone (the film lays its own foreground with `over`); no grain. Compare: tracks of all three parameters within 0.1 px, events ±1 frame; the SSIM drop (0.11 at frame 56) is waived: it falls where the upstream's copy blurs out over the gradient, which the brick does not draw.
- **Pitfalls**: Darken the text side (it does by default); the conic phase's bright tones otherwise eat the foreground's contrast. Three tones from the look only; a rainbow ring reads as a show, not a brand.
