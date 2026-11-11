#!/bin/sh
# npm run render: assemble → collect sound cues → assemble again (writes the cue tracks) → HyperFrames render to renders/raw.mp4. Then npm run finish.
# Web loop units (film.json "web": true): one assembly, no sound cues.
# The engine's full output goes to build/reports/render.log (finish reads the engine's mixed audio count from it); only the last lines are shown.
set -eu
cd "$(dirname "$0")/.."
WEB=$(node -e "console.log(require('./film.json').web?1:0)")
# A new project's first assembly has no sfx.json yet and says so; the second assembly after collecting has the real count
if [ "$WEB" = 1 ]; then node build/assemble.cjs; else node build/assemble.cjs && node build/sfx.cjs && node build/assemble.cjs; fi
mkdir -p renders build/reports
if ! node build/hf.cjs render --fps 30 --quality high --workers "${HF_WORKERS:-6}" --output renders/raw.mp4 > build/reports/render.log 2>&1; then
  tail -40 build/reports/render.log; echo "render failed; full output in build/reports/render.log"; exit 1
fi
sed 's/\x1b\[[0-9;]*m//g' build/reports/render.log | grep -E 'rendered in|capture ·' | tail -2
