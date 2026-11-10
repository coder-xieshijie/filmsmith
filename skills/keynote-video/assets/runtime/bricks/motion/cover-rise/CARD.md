---
id: cover-rise
category: motion
tier: T1
family: vertical
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### cover-rise

- **Looks**: a cover rises from the bottom edge and fills the frame in one power3 in-out move; its face is fixed to the frame (a vertical gradient, by default the ground lightened to near white at the top and the accent at the bottom, or a picture cropped to fill) and is revealed from the edge down; a soft shade falls on the covered scene just ahead of the edge. Under the cover is the scene it covers: a drawn one, or nothing (`from: 'none'`), so the real picture under the canvas shows until the edge passes. When it lands, the cover is what the next clip opens on (`to: 'none'`), or the next scene fades in over it in the last 15 %.
- **Tier**: T1. **Family**: vertical. **Surface**: canvas.
- **Use**: The seam into an ending whose ground is a gradient or a picture (a lock-up), where a hard cut would jump. **Not for**: A cut between two scenes on the same ground (nothing changes under the cover); more than once a film.
- **Intent**: Hide the last cut inside a rise: the next ground comes up over the frame.
- **Content**: Nothing to read: the cover's gradient stops (or a picture) and the scenes either side (drawn, or the real ones under the canvas).
- **Parameters**: `from`, `to` (a scene painter, default the placeholders `title` and `detail`, or `'none'`), `stops` (hex, top to bottom, at least two), `image` (a URL; the picture face, cropped to fill), `shade` (0.35), `beats` (0.25–2, default 1); roles read: `ground`, `accent`.
- **Theory**: A wipe by a surface that becomes the next ground hides the cut inside a move: the edge carries the eye up while the picture behind it changes (continuity editing's cut on action, Murch, In the Blink of an Eye); from below it reads as rising, a lift into the ending.
- **Styles**: any; made for the stream ending (sky-gather into a lock-up on the brand gradient, as K).
- **Length and easing**: 1 beat by default; the `beats` parameter sets it (0.25–2, clamped), power3 in-out; K's sweep was 0.26 s at 128 BPM (about half a beat): give `beats: 0.5` there.
- **Sound**: none of its own; a whoosh or the lock-up's hit sits on its landing.
- **Source**: own (the source film: the sweep before the lock-up, a gradient from below, yPercent 100 → 0, power3.inOut), from the stream original K.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full (no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick from the stream original K (its sweep into the lock-up), so the compare is waived. Changed from K: a brick with roles, a picture face and a drawn or transparent scene either side; the length in beats.
- **Pitfalls**: Give the cover the next scene's own ground (its stops or picture): the next clip must open on exactly what the cover shows, or the cut comes back. With `from: 'none'` the canvas is transparent until the edge passes: put it above the previous clip in the host, overlapping its last beat. `beats` sets the rise's length (0.25–2, default 1); under about 0.85 beat the edge is still moving on its last frame, so let the next clip's first frame land on it.
