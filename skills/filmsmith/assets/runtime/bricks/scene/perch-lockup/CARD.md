---
id: perch-lockup
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### perch-lockup

- **Purpose**: ends the film on a product with a mascot: the mascot perches on the name, a suffix types on and a pill says where to find it.
- **Intent**: The mascot settles on the name and says where to find the product: a friendly sign-off that leaves an address.
- **Content**: A name ≤ 10 chars, an optional suffix ≤ 12 chars, an optional where-to-find line ≤ 34 chars with a highlighted part, the mascot in a dropping and a crouched pose (images).
- **Fits**: `lockup`. **Not for**: products without a mascot image (the placeholder only stands in for one); names longer than ten characters.
- **Layout and camera**: a ground from the panel down to the accent with three slow glows; one row at y 510, centred as it grows: the name (150 px), the typed suffix (118 px, accent), the caret, then a 150 px perch slot for the mascot; a pill (72 px high) at y 650 under it. No camera move.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 1 word / 10 chars | 5 chars | product |
  | `suffix` | text | primary | 0–1 | 2 words / 12 chars | 5 chars | "Studio" / "工作台" |
  | `pill` | text | glance | 0–1 | 6 words / 34 chars | 16 chars | "Tidewell · left sidebar" / "Tidewell · 左侧栏" |
  | `highlight` | text (part of `pill`) | glance | 0–1 | 1 word / 10 chars | 5 chars | product |
  | `mascot` | image or painter (dropping pose) | — | 0–1 | — | — | a dashed box with a foot anchor |
  | `perch` | image or painter (crouched pose) | — | 0–1 | — | — | `mascot` |

- **Length**: 12–16 beats (6–8 s at 120 BPM): at least 6 s, longer when the suffix types longer or the name, suffix and pill need more reading time.
- **Steps and events**: 0–0.5 s the mascot drops in big (cubic in) and lands with a squash and a spring back (T2 peak); 0.35 s the name rises out of a blur behind it; 0.95–1.45 s the mascot shrinks and flies to the perch, scaled about its centre (T1), and lands with a squash; 1.6 s a selection box takes the name; 1.85 s the suffix types one character every 0.15 s (T0 each), the row re-centring; 2.75 s the pill rises and its text wipes on, the highlight in the accent; 3.6 s the mascot hops once, then sways; pause.
- **Needs**: no other bricks; roles `ground`, `panel`, `ink`, `dim`, `accent`, `onAccent`; type `display`, `text`.
- **Sound**: `land` on the drop, `accent` on the perch, the first typed character and the hop.
- **Styles**: light looks; avoid dossier and exhibit. **Source**: own (the source film). **Licence**: MIT (Filmsmith). **Languages**: en full · zh full (name, suffix and pill measured per language; the suffix typed by grapheme). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Pitfalls**: Without the film's mascot images the placeholder box is visible; do not ship it with the placeholder.
- **Sample**: `poster.jpg`, an English still 480 px wide.
