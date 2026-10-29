#!/bin/sh
# Finishing for a web loop unit (npm run finish comes here when film.json has "web": true):
# renders/raw.mp4 → drop the audio, write the three bt709 tags (video stream copied) → renders/unit.mp4
# → renders/poster.jpg (960 wide, film.json "poster" seconds; default 0.8 s before the end, the settled picture)
# → renders/contact-sheet.jpg (one frame per second, 6 columns) → build/web-check.sh (spec, silence, loop seam, final hold) → delete raw.mp4 (KEEP_RAW=1 keeps it).
# The poster and contact sheet come from the delivered unit.mp4, so ffmpeg (engine snapshots render the source).
set -eu
cd "$(dirname "$0")/.."
D=$(node -e "console.log(require('./film.json').duration)")
PT=$(node -e "const f=require('./film.json');console.log(f.poster ?? Math.max(0, f.duration - 0.8))")
ffmpeg -v error -y -i renders/raw.mp4 -map 0:v:0 -an -c:v copy \
  -bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -movflags +faststart renders/unit.mp4
ffmpeg -v error -y -ss "$PT" -i renders/unit.mp4 -frames:v 1 -vf scale=960:-2 -q:v 3 renders/poster.jpg
ROWS=$(node -e "console.log(Math.max(1, Math.ceil(require('./film.json').duration / 6)))")
ffmpeg -v error -y -i renders/unit.mp4 -vf "fps=1,scale=320:-2,tile=6x${ROWS}:padding=6:color=0x888888" -frames:v 1 -q:v 4 renders/contact-sheet.jpg
[ "${KEEP_RAW:-0}" = 1 ] || rm -f renders/raw.mp4
sh build/web-check.sh renders/unit.mp4 "$D"
