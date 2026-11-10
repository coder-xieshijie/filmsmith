# Third-party software and fonts

Each skill's section lists the software and fonts it downloads at setup, none of which is committed to this repository, and the sources of the data in its examples.

## keynote-video

Paths are inside `skills/keynote-video/`. `scripts/new-film.mjs` downloads the fonts and GSAP into each film folder when the film is set up, and `npx hyperframes` fetches HyperFrames and its headless Chrome on first use. Each keeps its own licence; the licence text of every font is saved next to it in the film's `assets/fonts/`.

### Rendering

| Software | Version | Licence | Used for |
|---|---|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes) | 0.8.163 (pinned in each template's `package.json`) | Apache-2.0 | Compositions, preview, frame-accurate render to MP4 |
| [GSAP](https://gsap.com) | 3.14.2 (pinned and hash-checked in `assets/runtime/setup-vendor.mjs`) | GSAP Standard "no charge" licence, https://gsap.com/standard-license | Paused timelines that HyperFrames seeks frame by frame |
| [FFmpeg](https://ffmpeg.org) | yours, on PATH | LGPL/GPL, depending on your build | Encoding, measuring (`check-film`, `loudness.sh`, contact sheets) |

### Fonts

All from the [google/fonts](https://github.com/google/fonts) repository at the commit pinned in `assets/runtime/setup-fonts.mjs`, all under the SIL Open Font License 1.1.

| Family | Styles that use it |
|---|---|
| Archivo (width axis) | ink, split |
| Barlow | pulse |
| Barlow Condensed | pulse |
| Bricolage Grotesque | thread, halftone |
| DM Mono | strip, scroll |
| DM Sans | stream |
| Hanken Grotesk | strip |
| IBM Plex Mono | ink, plakat, tally, blueprint, morph, halftone, handset, exhibit, dossier |
| IBM Plex Sans Condensed | blueprint |
| Instrument Sans (width axis) | exhibit |
| Instrument Serif | thread |
| Inter | phosphor |
| Inter Tight | plakat, tally, trace, morph, handset, dossier |
| JetBrains Mono | phosphor, thread, trace, pulse, split |
| Noto Sans SC | stream, Chinese films only (`lang: 'zh'`): downloaded at setup by the template's `tools/fonts.mjs` (about 18 MB) and cut to the film's characters with [fontTools](https://github.com/fonttools/fonttools) (MIT, run through `uvx`); never committed |
| Schibsted Grotesk | scroll |
| Source Serif 4 | trace, dossier |

### Bricks adapted from video-shotcraft

Many bricks in `assets/runtime/bricks/` are adapted from [video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) by Vincent Wei, at commit `1266a3ec4831289c4d893d42dd5102723658039a`, under the Apache License 2.0; the licence text is in `assets/runtime/bricks/LICENSE-video-shotcraft`. Each one has `licence: Apache-2.0` and `source` (the upstream demo and shot card) in its `brick.json`, and every adapted file starts with the upstream path and what was changed: rewritten as a HyperFrames brick in plain JavaScript (no React or Remotion), colours by role, brand, demo copy and screenshots removed, timing in beats, English and Chinese text through the shared language functions. A few options of the runtime's own hand-offs and transitions (`louvre`, `split-open`, `ink-wash` and others) take an idea from an upstream shot and say so in their file header. `assets/runtime/bricks/NOTICE.md` lists every adapted file with its upstream source; upstream has no NOTICE file of its own. The upstream text quoted in each brick's `select.upstream` (shot names, summaries, use) is carried as written, with one Chinese word for "inside" swapped for its synonym 内里. Everything else in `assets/runtime/bricks/` is Filmsmith's own (MIT).

The bricks' looks name two fonts besides the ones above; a film downloads them only when its look uses one, and they are never committed: Noto Serif SC (google/fonts, OFL-1.1, Chinese films in a serif look) and [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) (OFL-1.1, the two teach-video looks).

### Data in examples

- tally's 10-second demo counts the [PEP index](https://peps.python.org/api/peps.json) (Python Software Foundation, public domain / CC0-1.0 for PEP content), fetched 2026-10-19.
- handset's example assets (`assets/templates/handset/assets/real/readme-top.webp`, `readme-guide.webp`) are two captures of this repository's own README as rendered on its public GitHub page (https://github.com/coder-xieshijie/filmsmith), made 2026-10-21 with `tools/capture.mjs`, clipped to the README article (no avatars, account rows or sidebar). The text and the style stills in them are this repository's own content, under its licence; the page's typography is the host's rendering of it.
- exhibit's example assets (`assets/templates/exhibit/assets/real/`) are the skill's own outputs, made 2026-10-21: a frame of the phosphor demo's render (the made-up product `reseed`, frame at 8.0 s), the timing table `npm run fit` printed and the first 17 lines of the report `check-film` printed for the phosphor demo, captured as text in IBM Plex Mono (`tools/capture.mjs text`), and a chart of that render's short-term loudness drawn in code from `ffmpeg` `ebur128` measurements, labelled as a stand-in on its face. Released under this repository's licence.
- dossier's example assets (`assets/templates/dossier/assets/real/readme-styles.webp`, `readme-any-agent.webp`, `audio-master.webp`, `changelog-0.3.0.webp`) are four captures of this repository's own README, `assets/runtime/audio/README.md` and CHANGELOG as rendered on its public GitHub pages (https://github.com/coder-xieshijie/filmsmith), made 2026-10-21 with `tools/capture.mjs`, clipped to the article column (no avatars, account rows or sidebar). The text and the style stills in them are this repository's own content, under its licence; the page's typography is the host's rendering of it.
- strip's example frames (`assets/templates/strip/assets/real/`) are frames of the skill's own ten demo films (the v0.1.0 release renders of this repository), taken 2026-10-21 with `tools/extract.mjs` (ffmpeg decode and lanczos scale only): one gate frame per film, a contact row per film sampled at the middle of every 4 s block, two seconds of the morph demo at 30 fps, and each film's sound around its gate frame as RMS values (`tracks.js`). `repo-readme.webp` is a capture of this repository's README as rendered on its public GitHub page (https://github.com/coder-xieshijie/filmsmith), made 2026-10-21 with `tools/capture.mjs`, clipped to the README column (no avatars, account rows or sidebar). All of it is this repository's own content, under its licence; the page's typography is the host's rendering of it.
- split's example assets (`assets/templates/split/assets/real/`) are the skill's own outputs, made 2026-10-21 with `tools/capture.mjs`: ten frames of four demo films (ink, blueprint, phosphor, pulse; the v0.1.0 release renders of this repository), each decoded once at a named time (one cropped) and encoded as webp; two renders of the halftone template at one instant (`npm run snapshot -- --at 2.5`), as shipped and with line 18 set to `palette: 'reverse'`; and `readme-top.webp`, a capture of this repository's README as rendered on its public GitHub page (https://github.com/coder-xieshijie/filmsmith), clipped to the README article (no avatars, account rows or sidebar). The quoted lines are lines of this repository's files and the report lines are what `scripts/check-film.mjs` prints for the pulse demo's render. All of it is this repository's own content, under its licence; the page's typography is the host's rendering of it.
- scroll's example assets (`assets/templates/scroll/assets/real/`) are seven strips of one capture of this repository's own page (https://github.com/coder-xieshijie/filmsmith: the repository header and the README as rendered), made 2026-10-21 (03:16 UTC) with `tools/capture.mjs` at device pixel ratio 2, cut at one x range and scaled (ffmpeg crop and scale ×0.8, cwebp), with the file list, the sidebar and the lines naming third-party products left out (no avatars or account rows); and 41 frames (`ink/`, 12 fps, 11.9–15.3 s) of the skill's own Ink demo film, taken with `tools/frames.mjs` (ffmpeg decode and scale only). All of it is this repository's own content, under its licence; the page's typography is the host's rendering of it.
- Every other example product (`grainlock`, `seedfield`, `tablewarden`, `shoring`, `rushes`, `reseed`, `loudgate`, `gatewright`, `tidepool`, `vela-2`, `orrery-3`, `fernwave`, `quarrystore`, stream's `Skein`) is made up, and its numbers are illustrative.

## teach-video

Paths are inside `skills/teach-video/`. `scripts/new-film.mjs` and `scripts/voice/voice.py fonts` download GSAP, the libraries a kit lists in its `vendor.json` and the fonts into each film folder and check their sha256; `npx hyperframes` fetches HyperFrames, its headless Chrome and, for word timestamps, the Whisper model on first use. Nothing below is committed to this repository.

| Component | Version and licence | Used for |
|---|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes) | 0.8.214, Apache-2.0 | Rendering, checks, snapshots, transcription |
| [GSAP](https://gsap.com) with MotionPathPlugin and DrawSVGPlugin | 3.15.0, GreenSock standard no-charge licence, from the npm registry | Animation timeline |
| [Rough.js](https://github.com/rough-stuff/rough) | 4.6.6, MIT, from the npm registry (blueprint-zoom kit, `starter/vendor.json`) | Hand-drawn node outlines and hachure |
| [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) Medium | v1.522, OFL-1.1 | On-screen Chinese text |
| [IBM Plex Mono](https://github.com/google/fonts) Medium | google/fonts commit 47d54ca1, OFL-1.1 | Terminal text |
| [edge-tts](https://github.com/rany2/edge-tts) | 7.3.1, LGPL-3.0, installed by `uv` when `voice.py` runs | Placeholder voice-over only; the presenter records the final voice |
| [OpenCC (Python reimplementation)](https://github.com/yichen0831/opencc-python) | opencc-python-reimplemented 0.1.7, Apache-2.0, installed by `uv` when `voice.py` runs | Converts transcripts to simplified characters before alignment |
| Whisper small | Downloaded by `hyperframes transcribe` | Word timestamps |
| fonttools, FFmpeg | Called at run time, not distributed | Font subsetting, audio and video processing |

`assets/lib/` is a byte-for-byte copy of the keynote-video bricks this skill can use (those whose `hosts` include `teach`) and the runtime files they import, synced from keynote-video; the bricks adapted from video-shotcraft (Apache-2.0, commit `1266a3e`) are listed in `assets/lib/bricks/NOTICE.md`, with the licence text in `assets/lib/bricks/LICENSE-video-shotcraft`, as described under keynote-video above.

The temporary music bed and the sound effects are synthesised in code by `voice.py` and released under CC0. The kits' demo segments use made-up content (terminal-ledger: a week of e-mail and similar; blueprint-zoom: an illustrative system diagram), labelled as illustrative on screen.
