#!/bin/sh
# loudness.sh <video-or-audio>
# Integrated loudness (LUFS), loudness range (LU) and true peak (dBTP), then the delivery gate:
# integrated −15..−13 LUFS (target −14), true peak ≤ −1.5 dBTP. Exit 1 when the gate fails.
# check-film.mjs measures the same values plus short-term and momentary jumps.
set -e
if [ -z "$1" ]; then
  echo "usage: loudness.sh <video-or-audio>" >&2
  exit 2
fi
summary=$(ffmpeg -hide_banner -nostats -i "$1" -vn -filter_complex ebur128=peak=true -f null - 2>&1 | sed -n '/Summary:/,/Peak:/p')
echo "$summary"
echo "$summary" | awk '
  /I:/ && /LUFS/ { i = $2 }
  /Peak:/ { tp = $2 }
  END {
    ok = (i >= -15 && i <= -13 && tp <= -1.5)
    printf "gate: integrated %s LUFS (−15..−13, target −14), true peak %s dBTP (≤ −1.5): %s\n", i, tp, ok ? "PASS" : "FAIL"
    exit ok ? 0 : 1
  }'
