#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["edge-tts==7.3.1", "opencc-python-reimplemented==0.1.7"]
# ///
"""Shared assets of an explainer film: narration audio, timeline, full track, word timestamps, temporary music and sound cues,
contract and fonts, all from narration.json.

Usage: uv run voice.py <step...> [--dir shared-assets-dir] [--force] [--only id,id]
Steps: tts timeline track words audio contract fonts, or all (runs them in this order).
Fields and workflow in README.md next to this file. No film's parameters live in this script: pauses are each line's "pause" in
narration.json, everything else is in the directory's shared.json (optional; DEFAULTS below fill what it omits).
"""
import argparse, asyncio, hashlib, json, math, os, re, shutil, struct, subprocess, sys, tempfile, urllib.request, wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

def engine(cfg):
    """The engine version is pinned in each kit's starter/build/hf.cjs; transcription uses the same version. When kits pin different
    versions, shared.json "kit" names the film's kit."""
    kits = Path(__file__).resolve().parents[2] / "assets" / "kits"
    pins = {}
    for hf in sorted(kits.glob("*/starter/build/hf.cjs")):
        m = re.search(r"VERSION = '([^']+)'", hf.read_text())
        if m:
            pins[hf.parents[2].name] = m.group(1)
    if cfg.get("kit"):
        if cfg["kit"] not in pins:
            sys.exit(f"shared.json kit {cfg['kit']!r}: no {kits}/{cfg['kit']}/starter/build/hf.cjs with a VERSION")
        return f"hyperframes@{pins[cfg['kit']]}"
    if len(set(pins.values())) != 1:
        sys.exit(f"cannot pick the engine version from the kits' build/hf.cjs ({pins or 'none found'}): set \"kit\" in shared.json")
    return f"hyperframes@{next(iter(pins.values()))}"


DEFAULTS = {
    "voice": {"name": "zh-CN-YunxiNeural", "rate": "+0%"},      # natural speed: do not speed narration up
    "timing": {"fps": 30, "lead": 1.0, "gap": 0.4, "scene_gap": 1.2, "tail": 3.0,
               "manim_prefix": "M", "manim_pre": 0.8, "manim_post": 0.8, "silence_db": -45},
    "words": {"model": "small", "language": "zh", "parallel": 4},
    "fonts": None,      # None: download the pinned FONTS below; {"from": dir, "files": [...]} copies from a folder instead
    "contract": None,
    "kit": None,        # the film's kit, only needed when kits pin different engine versions
}
REC_EXT = (".wav", ".m4a", ".flac", ".aiff", ".mp3")   # formats accepted as recordings; TTS writes only .mp3


# ---------- configuration ----------
def load(d):
    lines = json.loads((d / "narration.json").read_text())
    cfg = {k: (dict(v) if isinstance(v, dict) else v) for k, v in DEFAULTS.items()}
    p = d / "shared.json"
    if p.exists():
        for k, v in json.loads(p.read_text()).items():
            if k.startswith("_"):
                continue
            if isinstance(cfg.get(k), dict) and isinstance(v, dict):
                cfg[k] = {**cfg[k], **v}
            else:
                cfg[k] = v
    ids = [l["id"] for l in lines]
    if len(set(ids)) != len(ids):
        sys.exit("narration.json has duplicate ids")
    return lines, cfg


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def sha1(p):
    return hashlib.sha1(p.read_bytes()).hexdigest()


# ---------- audio per line: a recording wins over TTS ----------
def audio_of(d, lid):
    """The audio for vo/<id>. An mp3 with a TTS record (vo/<id>.tts.json) whose hash matches is TTS; anything else is a recording."""
    found = [d / "vo" / f"{lid}{e}" for e in REC_EXT if (d / "vo" / f"{lid}{e}").exists()]
    non_mp3 = [f for f in found if f.suffix != ".mp3"]
    if len(non_mp3) > 1:
        sys.exit(f"vo/ has several recordings for {lid}: {[f.name for f in non_mp3]}; keep one")
    if non_mp3:
        return non_mp3[0], "rec"
    if found:
        meta = d / "vo" / f"{lid}.tts.json"
        ok = meta.exists() and json.loads(meta.read_text()).get("sha1") == sha1(found[0])
        return found[0], ("tts" if ok else "rec")
    return None, None


def step_tts(d, lines, cfg, a):
    import edge_tts
    v = cfg["voice"]
    (d / "vo").mkdir(exist_ok=True)
    todo, rec = [], []
    for l in lines:
        f, kind = audio_of(d, l["id"])
        if kind == "rec":
            rec.append(l["id"]); continue
        if a.only and l["id"] not in a.only:
            continue
        meta = d / "vo" / f"{l['id']}.tts.json"
        want = {"text": l["text"], "voice": v["name"], "rate": v["rate"]}
        if a.force or f is None or {k: json.loads(meta.read_text()).get(k) for k in want} != want:
            todo.append((l, want))

    async def one(l, want, sem):
        mp3 = d / "vo" / f"{l['id']}.mp3"
        async with sem:
            for i in range(3):
                try:
                    await edge_tts.Communicate(l["text"], v["name"], rate=v["rate"]).save(str(mp3))
                    break
                except Exception as e:  # the service fails now and then: retry
                    if i == 2:
                        sys.exit(f"edge-tts failed on {l['id']}: {e}")
                    await asyncio.sleep(2)
        (d / "vo" / f"{l['id']}.tts.json").write_text(json.dumps({**want, "sha1": sha1(mp3)}, ensure_ascii=False))

    async def run():
        sem = asyncio.Semaphore(8)
        await asyncio.gather(*[one(l, w, sem) for l, w in todo])
    asyncio.run(run())
    print(f"tts: {len(todo)} lines generated, {len(lines) - len(todo) - len(rec)} reused, {len(rec)} recordings" + (f" ({','.join(rec)})" if rec else ""))


# ---------- timeline ----------
def speech_span(f, db):
    """Voiced start `off` and voiced length `dur` (seconds): silencedetect finds leading and trailing silence; 0.04 s kept before, 0.12 s after."""
    total = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                           "-of", "csv=p=0", str(f)]).decode().strip())
    log = subprocess.run(["ffmpeg", "-i", str(f), "-af", f"silencedetect=n={db}dB:d=0.08", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    off = ends[0] if starts and starts[0] == 0 and ends else 0.0
    end = total
    if starts and starts[-1] > off and (len(ends) < len(starts) or ends[-1] >= total - 0.05):
        end = starts[-1]
    return max(0.0, off - 0.04), min(total, end + 0.12) - max(0.0, off - 0.04)


def step_timeline(d, lines, cfg, a):
    T = cfg["timing"]; FPS = T["fps"]
    files = []
    for l in lines:
        f, _ = audio_of(d, l["id"])
        if f is None:
            sys.exit(f"no audio for vo/{l['id']}: run tts or add a recording")
        files.append(f)
    with ThreadPoolExecutor(8) as ex:
        spans = list(ex.map(lambda f: speech_span(f, T["silence_db"]), files))
    pause = {l["id"]: l.get("pause", 0) for l in lines}
    res, t, prev = [], T["lead"], None
    for l, (off, dur) in zip(lines, spans):
        if prev is not None:
            t += T["scene_gap"] if l["scene"] != prev else T["gap"]
        fr = round(t * FPS)                          # starts snap to whole frames
        start = fr / FPS
        res.append({**{k: v for k, v in l.items() if k != "pause"}, "off": round(off, 3), "dur": round(dur, 3),
                    "start": round(start, 3), "from": fr, "frames": round(dur * FPS)})
        t = start + dur + pause[l["id"]]
        prev = l["scene"]
    total = round((t + T["tail"]) * FPS)

    scenes, order = {}, []
    for l in res:
        s = l["scene"]
        if s not in scenes:
            scenes[s] = {"scene": s, "manim": s.startswith(T["manim_prefix"]) if T["manim_prefix"] else False, "lines": []}
            order.append(s)
        scenes[s]["lines"].append(l["id"])
        scenes[s]["lastEnd"] = l["from"] + l["frames"] + round(pause[l["id"]] * FPS)
    first = {l["id"]: l for l in res}
    for i, s in enumerate(order):
        sc = scenes[s]
        nxt = scenes[order[i + 1]] if i + 1 < len(order) else None
        if sc["manim"]:
            sc["in"] = first[sc["lines"][0]]["from"] - round(T["manim_pre"] * FPS)
            sc["out"] = sc["lastEnd"] + round(T["manim_post"] * FPS)
            sc["clipFrames"] = sc["out"] - sc["in"]
        else:
            sc["in"] = 0 if i == 0 else first[sc["lines"][0]]["from"] - round(T["scene_gap"] * FPS)
            sc["out"] = total if nxt is None else first[nxt["lines"][0]]["from"] - round(T["scene_gap"] * FPS)
        del sc["lastEnd"]
    (d / "timeline.json").write_text(json.dumps({"fps": FPS, "total": total, "lines": res,
                                                 "scenes": [scenes[s] for s in order]}, ensure_ascii=False, indent=1))
    for s in order:
        sc = scenes[s]
        print(f"  {s:4} in {sc['in'] / FPS:7.2f}  out {sc['out'] / FPS:7.2f}  {len(sc['lines'])} lines{'  manim' if sc['manim'] else ''}")
    print(f"timeline: {len(res)} lines, {total} frames = {total / FPS:.2f} s")


def timeline(d):
    p = d / "timeline.json"
    if not p.exists():
        sys.exit("no timeline.json: run the timeline step first")
    return json.loads(p.read_text())


# ---------- full track ----------
def step_track(d, lines, cfg, a):
    TL = timeline(d)
    (d / "audio").mkdir(exist_ok=True)
    dur = TL["total"] / TL["fps"]
    args, chains = ["ffmpeg", "-y", "-v", "error"], []
    for i, l in enumerate(TL["lines"]):
        args += ["-i", str(audio_of(d, l["id"])[0])]
        ms = round((l["start"] - l["off"]) * 1000)
        chains.append(f"[{i}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms}[v{i}]")
    n = len(TL["lines"])
    fc = ";".join(chains) + ";" + "".join(f"[v{i}]" for i in range(n)) + \
        f"amix=inputs={n}:normalize=0,atrim=0:{dur},apad=whole_dur={dur}[out]"
    sh(args + ["-filter_complex", fc, "-map", "[out]", "-ar", "48000", str(d / "audio" / "vo.wav")])
    print(f"track: audio/vo.wav {dur:.2f} s")


# ---------- word timestamps: transcribe line by line, then add each line's start ----------
def step_words(d, lines, cfg, a):
    """Each line's raw transcript is cached in vo/<id>.words.json (keyed by audio hash and model): only changed audio is transcribed.
    words.json holds the text converted to simplified characters (Chinese only).
    Adding line starts is recomputed from the current timeline every time, so after a timeline change rerun only this step.
    Line by line, not the whole track: a whole-track transcript drifts earlier and earlier towards the end."""
    TL, W = timeline(d), cfg["words"]
    fresh, hf = [], engine(cfg)
    # The transcriber writes some characters in traditional form (這 樣 個 話); the narration is simplified, so convert before anchors align them
    simplify = (lambda s: s)
    if W["language"].startswith("zh"):
        from opencc import OpenCC
        simplify = OpenCC("t2s").convert

    def one(l):
        f = audio_of(d, l["id"])[0]
        cache, key = d / "vo" / f"{l['id']}.words.json", {"sha1": sha1(f), "model": W["model"], "language": W["language"]}
        c = json.loads(cache.read_text()) if cache.exists() else {}
        if a.force or {k: c.get(k) for k in key} != key:
            with tempfile.TemporaryDirectory(prefix="kp-words-") as t:
                sh(["npx", "--yes", hf, "transcribe", str(f), "-d", t, "-m", W["model"], "-l", W["language"], "--json"],
                   capture_output=True)
                c = {**key, "words": json.loads((Path(t) / "transcript.json").read_text())}
            cache.write_text(json.dumps(c, ensure_ascii=False))
            fresh.append(l["id"])
        raw = c["words"]
        shift = l["start"] - l["off"]                # where second 0 of this audio sits in the film
        return [{"line": l["id"], "text": simplify(w["text"]), "start": round(max(l["start"], w["start"] + shift), 3),
                 "end": round(w["end"] + shift, 3)} for w in raw]

    with ThreadPoolExecutor(W["parallel"]) as ex:
        per = list(ex.map(one, TL["lines"]))
    out = [w for ws in per for w in ws]
    (d / "words.json").write_text(json.dumps({"_note": "Word timestamps: each vo/<id> transcribed on its own, plus the line start (scripts/voice/voice.py words). Use the times only; the text of record is narration.json (the transcript mishears characters and spells numbers as read).",
                                              "words": out}, ensure_ascii=False, indent=0))
    # Self-check: first word vs line start (waveform onset), worth a glance before handing the assets on
    lag = sorted((ws[0]["start"] - l["start"], l["id"]) for l, ws in zip(TL["lines"], per) if ws)
    empty = [l["id"] for l, ws in zip(TL["lines"], per) if not ws]
    print(f"words: {len(out)} words, {len(fresh)} lines transcribed, {len(per) - len(fresh)} from cache; first word after line start median {lag[len(lag) // 2][0]:.2f} s, max {lag[-1][0]:.2f} s ({lag[-1][1]})"
          + (f"; lines with no words: {','.join(empty)}" if empty else ""))


# ---------- temporary music and sound cues (synthesised in code, CC0) ----------
def step_audio(d, lines, cfg, a):
    """Music: a pad of Fmaj7 → Cmaj7/E → Am7 → G6, 8 s each, looping every 32 s, summed sines with slow tremolo, reverb and low-pass in ffmpeg, filling the film.
    Sound cues: whoosh (pink-noise sweep), tick (short high tone), paper (paper rub), scratch (pen stroke), stamp (dull thud)."""
    TL = timeline(d)
    A = d / "audio"; A.mkdir(exist_ok=True)
    DUR = TL["total"] / TL["fps"] + 1
    SR, seg = 22050, 8.0
    chords = [[87.31, 174.61, 220.0, 261.63, 329.63], [82.41, 130.81, 196.0, 246.94, 329.63],
              [110.0, 164.81, 196.0, 261.63, 329.63], [98.0, 146.83, 196.0, 246.94, 329.63]]
    buf = bytearray()
    for i in range(int(SR * seg * 4)):
        t = i / SR; k = int(t // seg); ph = (t % seg) / seg
        x = 0.0
        for kk, w in ((k, min(1.0, ph * seg / 1.2)), ((k - 1) % 4, max(0.0, 1.0 - ph * seg / 1.2))):   # chords overlap 1.2 s
            if w <= 0:
                continue
            for j, f in enumerate(chords[kk]):
                trem = 1 + 0.18 * math.sin(2 * math.pi * (0.11 + 0.03 * j) * t + j)
                amp = (0.5 if j == 0 else 0.32) / (1 + 0.15 * j)
                x += w * amp * trem * (math.sin(2 * math.pi * f * t) + 0.12 * math.sin(2 * math.pi * 2 * f * t))
        buf += struct.pack("<h", max(-32767, min(32767, int(x * 0.16 * 32767))))
    with tempfile.TemporaryDirectory(prefix="kp-bed-") as t:
        loop = Path(t) / "bed-loop.wav"
        with wave.open(str(loop), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(buf))
        sh(["ffmpeg", "-y", "-v", "error", "-stream_loop", str(int(DUR // 32) + 1), "-i", str(loop), "-af",
            f"aecho=0.8:0.7:120|260:0.35|0.22,lowpass=f=2400,aresample=48000,afade=t=in:d=3,afade=t=out:st={DUR - 4}:d=4,atrim=0:{DUR}",
            "-ac", "2", "-ar", "48000", str(A / "bed.wav")])
    sfx = {
        "whoosh": ("anoisesrc=color=pink:amplitude=0.6:seed=7:d=0.9", "bandpass=f=900:width_type=o:w=2.5,afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.55:curve=exp,volume=1.6", 0.9),
        "tick": ("sine=f=1320:d=0.12", "afade=t=out:st=0.005:d=0.11:curve=exp,volume=0.7", 0.12),
        "paper": ("anoisesrc=color=brown:amplitude=0.7:seed=3:d=0.32", "highpass=f=1400,afade=t=in:d=0.04,afade=t=out:st=0.08:d=0.24:curve=exp,volume=2.2", 0.32),
        "scratch": ("anoisesrc=color=white:amplitude=0.4:seed=5:d=0.34", "bandpass=f=3200:width_type=o:w=1.2,tremolo=f=28:d=0.7,afade=t=in:d=0.03,afade=t=out:st=0.2:d=0.14,volume=1.3", 0.34),
        "stamp": ("sine=f=92:d=0.25", "afade=t=out:st=0.01:d=0.24:curve=exp,volume=1.4", 0.25),
    }
    for name, (src, af, dd) in sfx.items():
        sh(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", src, "-af", f"{af},atrim=0:{dd}", "-ac", "2", "-ar", "48000", str(A / f"{name}.wav")])
    print(f"audio: bed.wav {DUR:.2f} s, cues {' '.join(sfx)}")


# ---------- contract ----------
def step_contract(d, lines, cfg, a):
    """Writes shared.json's contract as is, with placeholders filled from the timeline:
    "$fps", "$total_frames"; {"$span": ["d4", "d5"]} → [start of d4, voiced end of d5] (seconds, two decimals)."""
    if not cfg["contract"]:
        print("contract: shared.json has no contract, skipped"); return
    TL = timeline(d)
    L = {l["id"]: l for l in TL["lines"]}

    def fill(v):
        if v == "$fps":
            return TL["fps"]
        if v == "$total_frames":
            return TL["total"]
        if isinstance(v, dict) and set(v) == {"$span"}:
            a_, b_ = v["$span"]
            return [round(L[a_]["start"], 2), round(L[b_]["start"] + L[b_]["dur"], 2)]
        if isinstance(v, dict):
            return {k: fill(x) for k, x in v.items()}
        if isinstance(v, list):
            return [fill(x) for x in v]
        return v
    (d / "contract.json").write_text(json.dumps(fill(cfg["contract"]), ensure_ascii=False, indent=1))
    print("contract: wrote contract.json")


# ---------- fonts ----------
# Pinned downloads (SIL Open Font License 1.1). Cached in $XDG_CACHE_HOME/filmsmith/fonts (default ~/.cache/...), then copied.
FONTS = [
    ("LXGWWenKai-Medium.ttf", "https://github.com/lxgw/LxgwWenKai/releases/download/v1.522/LXGWWenKai-Medium.ttf",
     "d4bdeb38a39151d74d084cba5090f8cb7d20bf83eedb78c35939ae70b9f4e3f6"),
    ("OFL.txt", "https://raw.githubusercontent.com/lxgw/LxgwWenKai/v1.522/OFL.txt",
     "c38b1994a5e48ac30ac7d1da7d0409fd8fd8127dfe28a13d6e787d5b1ef34a5e"),
    ("IBMPlexMono-Medium.ttf", "https://raw.githubusercontent.com/google/fonts/47d54ca1ebb14fd864695f1d39dc734f39017c33/ofl/ibmplexmono/IBMPlexMono-Medium.ttf",
     "a9b4c49bb299e05b5f6c481e7fb5e78943d2793249a0c8874ab574a2d1ea6755"),
    ("OFL-IBMPlexMono.txt", "https://raw.githubusercontent.com/google/fonts/47d54ca1ebb14fd864695f1d39dc734f39017c33/ofl/ibmplexmono/OFL.txt",
     "7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da"),
]


def step_fonts(d, lines, cfg, a):
    (d / "fonts").mkdir(exist_ok=True)
    F = cfg["fonts"]
    if F:
        src = (d / F["from"]).resolve()
        for name in F["files"]:
            if not (src / name).exists():
                sys.exit(f"fonts: {src / name} does not exist")
            shutil.copy2(src / name, d / "fonts" / name)
        print(f"fonts: copied {len(F['files'])} files from {src}"); return
    cache = Path(os.environ.get("XDG_CACHE_HOME") or Path.home() / ".cache") / "filmsmith" / "fonts"
    cache.mkdir(parents=True, exist_ok=True)
    got = []
    for name, url, want in FONTS:
        c = cache / name
        if not c.exists() or sha256(c) != want:
            for i in range(3):
                try:
                    with urllib.request.urlopen(url, timeout=300) as r:
                        (cache / (name + ".part")).write_bytes(r.read())
                    break
                except Exception as e:
                    if i == 2:
                        sys.exit(f"fonts: could not download {url}: {e}")
            if sha256(cache / (name + ".part")) != want:
                sys.exit(f"fonts: {name} from {url} does not match its pinned sha256")
            (cache / (name + ".part")).replace(c)
            got.append(name)
        if not (d / "fonts" / name).exists() or sha256(d / "fonts" / name) != want:
            shutil.copy2(c, d / "fonts" / name)
    print(f"fonts: {len(FONTS)} files in fonts/ ({'downloaded ' + ', '.join(got) if got else 'all from cache'})")


def sha256(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


STEPS = {"tts": step_tts, "timeline": step_timeline, "track": step_track, "words": step_words,
         "audio": step_audio, "contract": step_contract, "fonts": step_fonts}

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("steps", nargs="+", choices=[*STEPS, "all"])
    ap.add_argument("--dir", default=".", help="shared-assets directory (where narration.json is), default the current directory")
    ap.add_argument("--force", action="store_true", help="tts: regenerate even unchanged lines (recordings are never overwritten); words: ignore the cache")
    ap.add_argument("--only", default="", help="tts: only these line ids, comma-separated")
    a = ap.parse_args()
    a.only = set(filter(None, a.only.split(",")))
    for tool in ("ffmpeg", "ffprobe", "npx"):
        if not shutil.which(tool):
            sys.exit(f"missing {tool}")
    d = Path(a.dir).resolve()
    lines, cfg = load(d)
    for s in (list(STEPS) if "all" in a.steps else [s for s in STEPS if s in a.steps]):
        STEPS[s](d, lines, cfg, a)
