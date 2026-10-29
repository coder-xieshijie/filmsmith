# voice.py: a film's shared assets

Every film starts from one shared-assets directory: narration audio, timeline, full narration track, word timestamps, temporary music and sound cues, a contract and fonts. `voice.py` makes all of it from `narration.json` (and an optional `shared.json`). The film project only reads this directory; segment agents never change it.

## Command

```bash
uv run <skill>/scripts/voice/voice.py all --dir <shared-assets dir>
```

`all` runs the seven steps below in order; you can name some of them instead (for example `timeline track words`), and they still run in table order. Needs `uv`, `ffmpeg`/`ffprobe`, `npx` and network: Python packages install from the script header (edge-tts 7.3.1, opencc-python-reimplemented 0.1.7), HyperFrames is the version the kits pin in `starter/build/hf.cjs`, its whisper `small` model downloads on first use (about 466 MB), and the fonts download once into `$XDG_CACHE_HOME/teach-video/fonts` (default `~/.cache/teach-video/fonts`, about 26 MB).

| Step | Writes | What it does |
|---|---|---|
| `tts` | `vo/<id>.mp3`, `vo/<id>.tts.json` | edge-tts, one file per line. Lines whose text, voice and rate are unchanged are reused; **a recording is never overwritten** (not even with `--force`) |
| `timeline` | `timeline.json` | per line `off`/`dur` (silence detection), `start`, `from`/`frames`; per scene `in`/`out` (Manim scenes also `clipFrames`) |
| `track` | `audio/vo.wav` | the lines placed at their `start` in one 48 kHz stereo track |
| `words` | `words.json`, `vo/<id>.words.json` | `hyperframes transcribe` **line by line**, plus each line's start (a whole-track transcript drifts earlier towards the end). The transcriber writes some characters in traditional form; `words.json` gets them in simplified form (OpenCC `t2s`), so anchors only flag real mishearings. Cached by audio hash, so only changed audio is transcribed (the cache keeps the raw transcript; rerunning `words` re-converts it); prints how far each line's first word sits from the line start, worth a glance before handing over |
| `audio` | `audio/bed.wav`, `whoosh` `tick` `paper` `scratch` `stamp`.wav | a temporary pad and sound cues synthesised in code (CC0), as long as the timeline |
| `contract` | `contract.json` | `shared.json`'s `contract` with placeholders filled from the timeline |
| `fonts` | `fonts/` | LXGW WenKai Medium 1.522 and IBM Plex Mono Medium, with their OFL licence files, from pinned URLs checked by sha256 (`FONTS` in the script); `shared.json` `fonts.from` + `fonts.files` copies from a folder instead |

Options: `--force` (tts: regenerate every TTS line; words: ignore the cache), `--only a1,a2` (tts: only these lines).

## Input

`narration.json`: an array, one object per line: `{"id", "scene", "text", "pause"}`. `pause` is extra seconds after the line (time for the picture to finish and hold), optional; other fields (such as `src`) pass into `timeline.json` unchanged. Lines of one `scene` are adjacent; scenes whose name starts with `M` are Manim scenes. Write numbers in the text the way they should be read (一千二百 or 1200 both work; the anchors step aligns either).

Length: the default voice reads about 4.7 characters a second (punctuation not counted), and `timeline` adds the gaps, so with the default `timing` a film lasts about characters ÷ 4.7 + 0.4 s × (lines − scenes) + 1.2 s × (scenes − 1) + the `pause`s + 4 s (lead and tail): about 690 characters for three minutes of 30 lines in 5 scenes with 15 s of pauses. Measured: 224 characters per finished minute on a 3:18 film, 203 on the kit demo. `timeline` prints the real length.

`shared.json` (optional; omitted keys take the defaults):

```json
{
 "voice":  {"name": "zh-CN-YunxiNeural", "rate": "+0%"},
 "timing": {"fps": 30, "lead": 1.0, "gap": 0.4, "scene_gap": 1.2, "tail": 3.0,
            "manim_prefix": "M", "manim_pre": 0.8, "manim_post": 0.8, "silence_db": -45},
 "words":  {"model": "small", "language": "zh", "parallel": 4},
 "contract": {"size": [1920, 1080], "fps": "$fps", "total_frames": "$total_frames",
              "avatar_zone": {"box": [1580, 560, 1880, 860], "windows_s": {"opening": [0, 4.0], "key line": {"$span": ["d4", "d5"]}}}}
}
```

`kit` (optional): the film's kit, read only when kits pin different engine versions in their `build/hf.cjs`.

`timing`: `lead` silence before the first line, `gap` between lines of a scene, `scene_gap` between scenes, `tail` after the last line, `manim_pre`/`manim_post` extra time around a Manim scene, `silence_db` the silence-detection threshold. In `contract`, everything except placeholders is written as is; placeholders are `"$fps"`, `"$total_frames"` and `{"$span": ["d4", "d5"]}` → `[start of d4, voiced end of d5]` in seconds. `avatar_zone.windows_s` lists when a presenter window may appear; the kit's `npm run init` copies these windows into `film.json`. A film with no presenter writes `"windows_s": {}`: the reserve then stays empty for the whole film, and the checks hold it to that. Keep the rate at `+0%`: a faster voice is harder to follow.

The kit's demo assets (`assets/kits/terminal-ledger/demo-shared/`) are a complete small example of both files.

## When the user records the narration

1. Put one file per line in `vo/`: `vo/<id>.wav` (or `.m4a` `.flac` `.aiff`), or overwrite `vo/<id>.mp3`. Keep the line ids; a little silence around the speech is fine.
2. Run `all`. `tts` recognises recordings and skips them (any file TTS did not write is a recording); timeline, track, word timestamps, music length and contract follow the recording; `words` transcribes only the changed lines.
3. Noisy room tone, clipped starts or long tails: adjust `timing.silence_db` (for example `-38`) and rerun from `timeline`.
4. In the film project run `npm run anchors` again: the anchors follow the new word times, and the picture moves with them.

## Engine choices

| Job | Uses | Why |
|---|---|---|
| Word timestamps | `hyperframes transcribe -m small -l zh`, line by line | first-word onset matched the waveform onset (median 0.00 s) and word starts were within 0.12 s (median) of the TTS word boundaries on a 28-line test; `medium` was no more precise and misheard more |
| Voice | edge-tts `zh-CN-YunxiNeural` | the engine's own TTS dropped half or more of the Chinese characters when read back by whisper and could not read digits or English |
| Loudness | not here | the film's `npm run finish` sets the mixed film to −14 LUFS |
| Music | a code-synthesised pad | temporary only; replace it with a real track for a finished film |
