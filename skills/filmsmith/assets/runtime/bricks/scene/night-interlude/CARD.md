---
id: night-interlude
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### night-interlude

- **Purpose**: A stretch of the stream night after the closing sweep, laid out by the film like any scene, for a composition of the film's own: a section the skeleton has no scene for (a draw, an offer, a reveal) or an ending in place of the lock-up. The sky goes on with the film's motes, bokeh and push; the stars are already gathered; the thread that lay flat under the claim is gone; the mascot stays on its perch at the top of the spine with the product's name (`perch`), or leaves the frame to the composition (`perch: false`).
- **Intent**: Keep the film one continuous night past the close, so the film's own section or ending sits in the same sky with no seam.
- **Content**: Nothing to read: its length in beats and whether the mascot stays on its perch. The composition over it (a [`split-fuse`](../../motion/split-fuse/CARD.md) reveal, a slogan, an offer) is drawn by the film in its own layer.
- **Fits**: after `close`, before an optional `lockup`; a film's own ending (with no lock-up after it). **Not for**: anything a stream scene already draws; a stretch with nothing over it (the night alone is a held frame); before the close, where the stars are still in the sky.
- **Layout and camera**: the full-frame night only; with `perch`, the mascot at (230, 156) at `mascotSize.sit` with the name label beside it, as at the end of the close. No camera move beyond the sky's push.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `beats` | number | – | 1 | 1–64 | 1–64 | 8 |
  | `perch` | flag (optional) | – | 1 | – | – | true: the mascot on its perch with the name; false: the frame left to the composition |
  | `film` | object | – | 1 | – | – | null: the worked example (Skein) with an interlude after its close, in the brick's language |
  | `palette` | id | – | 1 | – | – | `night` (or `ember`, `aurora`, `mono`; `colors` overrides roles) |

- **Length**: `beats` (1–64), the composition's own length. As the film's last scene it absorbs the rounding to a whole bar (up to three beats more); a host that ends earlier truncates its own track to the composition's end.
- **Steps and events**: none of its own: the sky goes on; with `perch: false` the mascot and its name are gone from the interlude's first frame (a composition that takes the mascot, such as `split-fuse` with `arrive` at the perch, picks it up there).
- **Needs**: props yarn-mascot, glow-thread; roles ground, field, fieldEdge, dust, accent, glow, core, ink, dim; type text (the name label).
- **Sound**: none of its own; the bed plays a build at half energy under it. The composition over it brings its cues.
- **Styles**: made for `stream` (recipe the stream recipe); fits stream; avoid plakat, blueprint, dossier (the glow greys out on a light ground).
- **Source**: own (the stream engine's interlude scene, `prop/glow-thread/sched.js` `interlude`).
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full (no text of its own; the name label as in every stream scene).
- **Sample**: `poster.jpg`, an English still 480 px wide (the night with the mascot on its perch); variant `empty` (`perch: false`).
- **Differs from upstream**: no upstream: an own scene of the stream engine, so the compare is waived. The template has no interlude; it is the brick library's addition to the skeleton (see the stream recipe's skeleton).
- **Pitfalls**: Put something over it: the interlude is a ground, not a scene. One interlude a film, after the close. `perch` is the slot (the film's `mascot` stays the mascot's picture). With `perch: false` and no lock-up after it, the composition owns the ending: it should land the name or the mascot itself.
