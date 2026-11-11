#!/bin/sh
# Spec check of a web loop unit (finish-web.sh calls it; standalone: sh build/web-check.sh renders/unit.mp4 <seconds>):
#   spec: 1920×1080, 30 fps, h264, yuv420p, the three bt709 tags, 0 decode errors, no audio stream, 8–25 s long
#   loop: first and last frame PSNR ≥ 40 dB (the film must return to frame 0's picture)
#   final hold: a still stretch ≥ 1.5 s in the second half (measured with freezedetect −70 dB after scaling to 480 wide, which removes
#   keyframe compression noise while a small dot changing colour still counts as motion), ending ≤ 1.5 s before the end (time to return)
# The caption zone and presenter reserve are not checked (web units have neither). Exit 0 when all pass, else 1.
set -u
f="$1"; D="$2"; fail=0
ok() { echo "PASS $1"; }; bad() { echo "FAIL $1"; fail=1; }
info=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name,pix_fmt,color_space,color_primaries,color_transfer -of default=nw=1 "$f" | tr '\n' ' ')
for want in width=1920 height=1080 r_frame_rate=30/1 codec_name=h264 pix_fmt=yuv420p color_space=bt709 color_primaries=bt709 color_transfer=bt709; do
  case " $info" in *" $want "*) ok "$want";; *) bad "$want (got $info)";; esac
done
na=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$f" | wc -l | tr -d ' ')
[ "$na" = 0 ] && ok "no audio stream" || bad "$na audio streams"
errs=$(ffmpeg -v error -i "$f" -f null - 2>&1 | wc -l | tr -d ' ')
[ "$errs" = 0 ] && ok "0 decode errors" || bad "$errs lines of decode errors"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
python3 -I -c "import sys; d=float('$dur'); sys.exit(0 if 8-0.05<=d<=25+0.05 else 1)" && ok "length ${dur}s" || bad "length ${dur}s (must be 8–25 s)"
last=$(python3 -I -c "print(max(0, float('$dur') - 1/30 - 0.001))")
p=$(ffmpeg -v error -i "$f" -ss "$last" -i "$f" -filter_complex "[0:v]trim=end_frame=1,setpts=PTS-STARTPTS[a];[1:v]trim=end_frame=1,setpts=PTS-STARTPTS[b];[a][b]psnr=stats_file=-" -f null - 2>/dev/null | sed -n 's/.*psnr_avg:\([0-9.inf]*\).*/\1/p' | head -1)
python3 -I -c "import sys; v='$p'; sys.exit(0 if v=='inf' or (v and float(v)>=40) else 1)" && ok "loop seam PSNR ${p} dB" || bad "loop seam PSNR ${p:-?} dB (must be ≥ 40: the last frame must look like frame 0)"
fz=$(ffmpeg -v info -i "$f" -vf "scale=480:-2:flags=area,freezedetect=n=-70dB:d=1.5" -f null - 2>&1 | sed -n 's/.*freeze_start: \([0-9.]*\).*/s \1/p; s/.*freeze_end: \([0-9.]*\).*/e \1/p' | tr '\n' ' ')
python3 -I - "$fz" "$dur" <<'PY' && ok "final hold" || bad "final hold"
import sys
toks = sys.argv[1].split(); D = float(sys.argv[2]); spans = []; cur = None
for i in range(0, len(toks) - 1, 2):
    k, v = toks[i], float(toks[i + 1])
    if k == 's': cur = v
    elif cur is not None: spans.append((cur, v)); cur = None
if cur is not None: spans.append((cur, D))
cand = [(a, b) for a, b in spans if b - a >= 1.5 and a >= D * 0.35]
print('  still stretches: ' + (', '.join('%.2f–%.2f' % s for s in spans) or 'none'))
if not cand: print('  no still stretch of ≥ 1.5 s in the second half'); sys.exit(1)
a, b = cand[-1]
if D - b > 1.5: print('  after the last still stretch %.2f–%.2f it moves for %.2f s (returning must take ≤ 1.5 s)' % (a, b, D - b)); sys.exit(1)
print('  settled %.2f–%.2f (%.2f s), then %.2f s back to the start' % (a, b, b - a, D - b))
PY
exit $fail
