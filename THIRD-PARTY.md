# Third-party software and fonts

Nothing below is committed to this repository. `scripts/new-film.mjs` downloads the fonts and GSAP into each film folder when the film is set up, and `npx hyperframes` fetches HyperFrames and its headless Chrome on first use. Each keeps its own licence; the licence text of every font is saved next to it in the film's `assets/fonts/`.

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
| IBM Plex Mono | ink, plakat, tally, blueprint, handset, exhibit, dossier |
| IBM Plex Sans Condensed | blueprint |
| Instrument Sans (width axis) | exhibit |
| Instrument Serif | thread |
| Inter | phosphor |
| Inter Tight | plakat, tally, trace, handset, dossier |
| JetBrains Mono | phosphor, thread, trace |
| Source Serif 4 | trace, dossier |

## Data in examples

- tally's 10-second demo counts the [PEP index](https://peps.python.org/api/peps.json) (Python Software Foundation, public domain / CC0-1.0 for PEP content), fetched 2026-10-19.
- handset's example assets (`assets/templates/handset/assets/real/readme-top.webp`, `readme-guide.webp`) are two captures of this repository's own README as rendered on its public GitHub page (https://github.com/coder-xieshijie/filmsmith), made 2026-10-21 with `tools/capture.mjs`, clipped to the README article (no avatars, account rows or sidebar). The text and the style stills in them are this repository's own content, under its licence; the page's typography is the host's rendering of it.
- exhibit's example assets (`assets/templates/exhibit/assets/real/`) are the skill's own outputs, made 2026-10-21: the timing table `npm run fit` printed and the first 17 lines of the report `check-film` printed for the phosphor demo, captured as text in IBM Plex Mono (`tools/capture.mjs text`), and a chart of that render's short-term loudness drawn in code from `ffmpeg` `ebur128` measurements, labelled as a stand-in on its face. Released under this repository's licence.
- dossier's example assets (`assets/templates/dossier/assets/real/readme-styles.webp`, `readme-any-agent.webp`, `changelog-0.3.0.webp`) are three captures of this repository's own README and CHANGELOG as rendered on its public GitHub pages (https://github.com/coder-xieshijie/filmsmith), made 2026-10-21 with `tools/capture.mjs`, clipped to the article column (no avatars, account rows or sidebar). The text and the style stills in them are this repository's own content, under its licence; the page's typography is the host's rendering of it.
- Every other example product (`grainlock`, `seedfield`, `tablewarden`, `shoring`, `rushes`, `reseed`, `loudgate`, `gatewright`, `tidepool`, `vela-2`, `orrery-3`, `fernwave`, `quarrystore`) is made up, and its numbers are illustrative.
