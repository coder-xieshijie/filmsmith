#!/bin/sh
# contact-sheet.sh <video> <out.jpg> [frames]
# Evenly spaced frames from the video, 480px wide each, tiled four per row.
set -e
video=$1; out=$2; n=${3:-20}
if [ -z "$video" ] || [ -z "$out" ]; then
  echo "usage: contact-sheet.sh <video> <out.jpg> [frames]" >&2
  exit 2
fi
duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")
fps=$(awk -v n="$n" -v d="$duration" 'BEGIN { printf "%.6f", n / d }')
rows=$(( (n + 3) / 4 ))
ffmpeg -v error -y -i "$video" -vf "fps=$fps,scale=480:-1,tile=4x$rows" -frames:v 1 "$out"
echo "$out: $n frames over ${duration}s"
