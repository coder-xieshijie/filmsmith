#!/usr/bin/env bash
# unit-check: delivery spec check for a rendered unit or film (mp4).
# Checks: 1920x1080, 30 fps, h264, yuv420p, bt709 tags (matrix, primaries, transfer), a full decode without errors,
# and an empty caption band (y >= 880).
# Caption band test is a high-pass: the band minus its heavy blur; a frame has content when pixels deviating by
# more than 20 cover more than about 1.2% of the band (YAVG > 3). Gradients, vignettes and static background
# images do not count (a desk-photo background measured about 0.4%). 10 frames per second are sampled; content
# lasting more than 1.5 s is FAIL, shorter spans (a full-screen transition sweeping past) are listed as INFO.
# Usage: scripts/unit-check.sh <unit.mp4>
# Output: one PASS / FAIL / INFO line per check.
# Exit codes: 0 all checks pass; 1 any FAIL.
# Needs ffprobe, ffmpeg and python3. Known limits: the caption band is fixed at y 880-1080 of a 1080-high frame;
# a static image in the band that looks like text (sharp detail) can still count as content.
set -uo pipefail
f="$1"; fail=0
read -r w h fps codec pix cs cp ct < <(ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,codec_name,pix_fmt,color_space,color_primaries,color_transfer \
  -of default=nw=1:nk=0 "$f" | python3 -I -c '
import sys; d=dict(l.strip().split("=",1) for l in sys.stdin if "=" in l)
print(d["width"],d["height"],d["r_frame_rate"],d["codec_name"],d["pix_fmt"],d.get("color_space","unknown"),d.get("color_primaries","unknown"),d.get("color_transfer","unknown"))')
check() { if [ "$2" = "$3" ]; then echo "PASS $1 $2"; else echo "FAIL $1 $2 (expected $3)"; fail=1; fi; }
check size "${w}x${h}" 1920x1080; check fps "$fps" 30/1; check codec "$codec" h264; check pix_fmt "$pix" yuv420p
check matrix "$cs" bt709; check primaries "$cp" bt709; check transfer "$ct" bt709
errs=$(ffmpeg -v error -i "$f" -f null - 2>&1 | wc -l | tr -d ' ')
if [ "$errs" = 0 ]; then echo "PASS decode 0 errors"; else echo "FAIL decode $errs error lines"; fail=1; fi
ffmpeg -v error -i "$f" -filter_complex "fps=10,crop=1920:200:0:880,format=gray,split[a][b];[b]gblur=sigma=25[bl];[a][bl]blend=all_mode=difference,lut=y='if(gt(val,20),255,0)',signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null - 2>/dev/null \
| python3 -I -c '
import sys,re
t=None; rows=[]
for l in sys.stdin:
    m=re.search(r"pts_time:([\d.]+)",l)
    if m: t=float(m.group(1)); continue
    m=re.search(r"YAVG=([\d.]+)",l)
    if m and t is not None: rows.append((t,float(m.group(1))))
busy=[t for t,v in rows if v>3]
spans=[]
for t in busy:
    if spans and t-spans[-1][1]<=0.15: spans[-1][1]=t
    else: spans.append([t,t])
long=[s for s in spans if s[1]-s[0]>1.5]
if not spans: print("PASS caption band y>=880 empty throughout")
else:
    for s in spans: print(("FAIL" if s in long else "INFO"), "caption band has content %.2f-%.2f s" % (s[0],s[1]))
sys.exit(1 if long else 0)
' || fail=1
exit $fail
