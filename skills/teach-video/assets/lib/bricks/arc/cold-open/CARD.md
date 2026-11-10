---
id: cold-open
category: arc
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### cold-open

- **Tells**: three flashes of the product, a breath of black silence, then the name (glimpse → hush → title).
- **Intent**: Hook the viewer before the film begins: three glimpses of the product's best frames, a breath of black silence, then the name, so the opening says 'this is worth watching' before explaining anything.
- **Content**: Three strong stills of the product (a whole page, another page, one close detail cropped at about 2.2×), one beat of pure black, and an opening title (the product name or a short line, held at least 40 frames); no voice-over over the opening.
- **Fits / does not fit**: the first 3–6 s of a launch film or teaser with three strong frames (a whole page, another page, one detail); not explainers that must teach from the first second, products without three distinct frames, or a voice-over across the opening (the silent beat must stay silent).
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 0.3–0.5 each | 3 | stills of the product (fits `demo`): a whole page, another page, one detail at 2.2×; hard cuts, each pushing 1 → 1.04 at a constant speed | hook | intro |
  | `rest` | one beat (0.2–0.5) | 1 | pure black, no sound | – | rest |
  | `lockup` | 2–4 | 1 | the opening title (tags `title`): fades up and rises over 16 frames, tracking closes 0.05 → −0.012 em over 30, then a held still of 40 frames or more | lockup | outro |

- **Climax**: one peak, the title; the three cuts are the hook's single peak.
- **Example films**: none approved yet.
- **Source**: adapted from video-shotcraft `demos/rhythm/trailer-grammar-moves/TrailerBumper.tsx` (card `references/shots/rhythm/trailer-grammar-moves.md`) @ `1266a3e`; Apache-2.0, see NOTICE. The six-frame black becomes one beat on the bed's rest.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The black beat must be pure black with nothing on it; it is a breath, not another title card. Silence the black beat completely; one hit per cut, nothing under the black. Pick three frames that differ (two pages and a detail); three similar pages read as one.
