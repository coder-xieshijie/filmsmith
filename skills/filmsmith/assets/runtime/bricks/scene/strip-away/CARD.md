---
id: strip-away
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### strip-away

- **Purpose**: ends a product demo on its one action: everything but the primary button evaporates, the button takes the centre, then the name.
- **Intent**: Everything but the one action falls away, so the viewer leaves with that action and the name behind it.
- **Content**: The primary action's label (one word ≤ 10 chars), a document title ≤ 20 chars, a wordmark ≤ 16 chars, a mark; up to four screenshots for the editor's cards.
- **Fits**: `lockup`. **Not for**: products without a primary action in their UI; endings that should keep the product on screen.
- **Layout and camera**: a neutral editor at full frame: a dark layers sidebar (240 px), a properties panel on the right (300 px), a toolbar split in three, a browser-like canvas card (1180 × 850) with four content cards, the primary button at the top right (150 × 40). No camera move; the button glides from the top right to the centre and grows 1.5×. The lock-up: the mark (132 px) and the wordmark side by side, centred, on the dark frame.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `action` | text | word | 1 | 1 word / 10 chars | 3 chars | "Publish" / "发布" |
  | `title` | text | glance | 1 | 3 words / 20 chars | 8 chars | detailTitle |
  | `wordmark` | text | primary | 1 | 2 words / 16 chars | 6 chars | product |
  | `mark` | image or painter | — | 0–1 | — | — | mark-lockup's placeholder mark |
  | `shots` | list of image (crop) | — | 0–4 | — | — | tile-card figures with text bars |

- **Length**: 10–12 beats (5–6 s at 120 BPM): at least 144 frames, longer when the wordmark needs more reading time after it lands.
- **Steps and events**: frames 4–32 the cursor arcs to the button; 34 the click (T0, the button springs); 38–58 the layers evaporate outside in, every 4 frames (sidebar, panel, cards one by one, the toolbar's ends, the canvas, the toolbar's middle), each accelerating out with its own drift and a growing blur while the ground goes dark (T1); 58–76 the button glides to the centre (T2 peak); 86 it lets go; 96 the mark and then the wordmark focus in on a spring; pause.
- **Needs**: props `cursor`, `tile-card`; motion `digit-roll` (spring); mark-lockup's `drawMark`; roles `ground`, `panel`, `line`, `ink`, `dim`, `accent`, `onAccent`; type `display`, `text`.
- **Sound**: `accent` on the click, `turn` as the last layer goes, `land` on the lock-up.
- **Styles**: any. **Source**: adapted from video-shotcraft `demos/outro/ui-strip-away-outro/UiStripAwayOutro.tsx` (card `references/shots/outro/ui-strip-away-outro.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (button label and wordmark measured per language). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the demo editor (layer names, property values, project and repository names, fixture cards) is a neutral editor of the same structure drawn with text bars; the mark is drawn in the light role on the dark frame. Compare against `ui-strip-away-outro` over frames 0–144: pass, SSIM drop 0.025, button and sidebar 0 px, events 0 frames.
- **Pitfalls**: The button must be the action the film was about; any other button turns the ending into a random click.
- **Sample**: `poster.jpg`, an English still 480 px wide.
