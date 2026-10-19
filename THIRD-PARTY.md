# Third-party software and fonts

Nothing below is committed to this repository. `skills/filmsmith/scripts/new-film.mjs` downloads the fonts and GSAP into each film folder when the film is set up, and `npx hyperframes` fetches HyperFrames and its headless Chrome on first use. Each keeps its own licence; the licence text of every font is saved next to it in the film's `assets/fonts/`.

## Rendering

| Software | Version | Licence | Used for |
|---|---|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes) | 0.8.163 (pinned in each template's `package.json`) | Apache-2.0 | Compositions, preview, frame-accurate render to MP4 |
| [GSAP](https://gsap.com) | 3.14.2 (pinned and hash-checked in `assets/runtime/setup-vendor.mjs`) | GSAP Standard "no charge" licence, https://gsap.com/standard-license | Paused timelines that HyperFrames seeks frame by frame |
| [FFmpeg](https://ffmpeg.org) | yours, on PATH | LGPL/GPL, depending on your build | Encoding, measuring (`check-film`, `loudness.sh`, contact sheets) |

## Fonts

All from the [google/fonts](https://github.com/google/fonts) repository at the commit pinned in `assets/runtime/setup-fonts.mjs`, all under the SIL Open Font License 1.1.

| Family | Styles that use it |
|---|---|
| Archivo (width axis) | ink |
| Bricolage Grotesque | thread |
| IBM Plex Mono | ink, plakat, tally, blueprint |
| IBM Plex Sans Condensed | blueprint |
| Instrument Serif | thread |
| Inter | phosphor |
| Inter Tight | plakat, tally, trace |
| JetBrains Mono | phosphor, thread, trace |
| Source Serif 4 | trace |

## Data in examples

- tally's 10-second demo counts the [PEP index](https://peps.python.org/api/peps.json) (Python Software Foundation, public domain / CC0-1.0 for PEP content), fetched 2026-10-19.
- Every other example product (`grainlock`, `seedfield`, `tablewarden`, `shoring`, `rushes`, `reseed`, `loudgate`, `gatewright`, `tidepool`) is made up, and its numbers are illustrative.
