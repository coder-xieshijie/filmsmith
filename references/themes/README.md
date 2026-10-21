# Themes

A theme is a kind of film with its own audience, narrative skeleton and rules: a technical product launch wants different things from a personal essay or a story. Visual languages are [modes](../modes/README.md); a theme lists which modes suit it. A theme's rules apply only inside it; when several themes share a rule, it moves up to [principles.md](../principles.md).

## Index

| Theme | Covers | Modes |
|---|---|---|
| [tech-product-launch](tech-product-launch/README.md) | Launch and promo films for technical products: open-source repositories, developer tools, APIs, agent skills | phosphor, plakat, blueprint, ink, thread, morph, halftone, pulse, handset, exhibit, dossier, strip, split, scroll |
| [tech-explainer](tech-explainer/README.md) | Films that explain a mechanism, an algorithm or a dataset | trace, tally |

## A theme folder

```
themes/<theme>/
├── README.md      scope, audience, platform and length, narrative skeleton, suitable modes, ruled-out directions
├── rules.md       rules for this theme, each with its evidence
├── benchmarks.md  reference films for this theme and what each does well
```

Rejected directions are not kept as files: the theme README's "Ruled out" section records what was tried and why it was rejected, citing the owner's verdict by date.

A new theme starts with an empty `rules.md`; it inherits nothing from other themes except the principles. Rules are written from the owner's verdicts, never ahead of them, and cite each verdict by date.

Every theme shares the skill's format: 16:9 only, 1920×1080, for landscape full-screen playback; a vertical film is not made in any theme.

When a mode card and a theme rule disagree, the mode card wins only where it states the departure and its reason; for example, a mode may carry the viewer with a through-line object instead of the persistent frame of tech-product-launch rule 3.

A new visual language becomes a mode, not a theme file: write a mode card from the template in [modes/README.md](../modes/README.md) and a template under `assets/templates/` following its CONTRACT.md, once the owner has accepted a film in it.
