#!/bin/sh
# npm run finish: renders/raw.mp4 → check every registered sound cue was mixed in → loudness −14 LUFS (true-peak target −1.8 dBTP),
# AAC 48 kHz stereo, bt709 tags (video stream copied, not re-encoded) → renders/film.mp4
# → renders/poster.jpg (960 wide, at film.json "poster" seconds) and renders/contact-sheet.jpg (one frame per 6 s, up to 8 columns, long side ≤ 2000)
# → assert true peak ≤ −1.5 dBTP → the skill's scripts/unit-check.sh → delete raw.mp4 (KEEP_RAW=1 keeps it).
# Only what the engine cannot do is here: its normalize-audio sets one track's data-volume and cannot set a mixed film's loudness or
# limit its true peak; the poster and contact sheet must come from the delivered film.mp4 (engine snapshots render the source), so ffmpeg.
set -eu
cd "$(dirname "$0")/.."
# Web loop units (film.json "web": true) go to build/finish-web.sh: drop audio, bt709 tags → renders/unit.mp4, poster, contact sheet, web-check
if [ "$(node -e "console.log(require('./film.json').web?1:0)")" = 1 ]; then exec sh build/finish-web.sh; fi
PT=$(node -e "console.log(require('./film.json').poster ?? 1)")
SCR=$(node -e "console.log(require('./build/common.cjs').scripts())")
# Sound cues: those registered with ctx.hit() (sfx.json, within the film) must equal the tracks the engine mixed into raw (render.log audioCount, minus narration and music)
node - <<'JS'
const fs = require('fs');
const st = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);
const log = fs.existsSync('build/reports/render.log') ? fs.readFileSync('build/reports/render.log', 'utf8') : '';
const m = log.match(/"audioCount":(\d+)/);
if (!m) { console.error('FAIL sound cues: no engine audioCount in build/reports/render.log; make raw.mp4 with npm run render'); process.exit(1); }
if (st('renders/raw.mp4') - st('build/reports/render.log') > 60000) { console.error('FAIL sound cues: raw.mp4 is newer than build/reports/render.log, so the log is not this render; run npm run render again'); process.exit(1); }
const D = require('./film.json').duration;
const reg = fs.existsSync('sfx.json') ? JSON.parse(fs.readFileSync('sfx.json', 'utf8')).filter((s) => s.t < D).length : 0;
const html = fs.readFileSync('index.html', 'utf8');
const base = (html.match(/<audio id="(vo|bed)"/g) || []).length;
const missing = [...html.matchAll(/<audio [^>]*src="([^"]+)"/g)].map((x) => x[1]).filter((f) => !fs.existsSync(f));
const got = +m[1] - base;
if (got !== reg || missing.length) { console.error(`FAIL sound cues: ${reg} registered, ${got} mixed into raw (audioCount ${m[1]} minus narration and music ${base})${missing.length ? '; missing ' + [...new Set(missing)].join(' ') : ''}`); process.exit(1); }
console.log(`PASS sound cues: all ${reg} mixed into raw (engine audioCount ${m[1]})`);
JS
# Narration has a crest factor near 17 dB, so a linear move to −14 would hit the true-peak ceiling: add the gain difference and limit (−2.5 dBFS) first, then two-pass linear loudnorm
I0=$(ffmpeg -hide_banner -nostats -i renders/raw.mp4 -vn -af ebur128 -f null - 2>&1 | sed -n '/Summary/,$p' | awk '/ I:/{print $2; exit}')
G=$(python3 -I -c "print(round(-14 - ($I0), 2))")
ffmpeg -v error -y -i renders/raw.mp4 -vn -af "volume=${G}dB,alimiter=limit=0.75:attack=3:release=60:level=disabled" -ar 48000 -c:a pcm_s24le renders/pre.wav
M=$(ffmpeg -hide_banner -i renders/pre.wav -af loudnorm=I=-14:TP=-1.8:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | python3 -I -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i renders/raw.mp4 -i renders/pre.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -af "loudnorm=I=-14:TP=-1.8:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart renders/film.mp4
rm -f renders/pre.wav
ffmpeg -v error -y -ss "$PT" -i renders/film.mp4 -frames:v 1 -vf scale=960:-2 -q:v 3 renders/poster.jpg
N=$(node -e "console.log(Math.max(1, Math.ceil(require('./film.json').duration / 6)))")
COLS=$(( N < 8 ? N : 8 )); ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -v error -y -i renders/film.mp4 -vf "fps=1/6,scale=240:-2,tile=${COLS}x${ROWS}:padding=6:color=0x888888" -frames:v 1 -q:v 4 renders/contact-sheet.jpg
[ "${KEEP_RAW:-0}" = 1 ] || rm -f renders/raw.mp4
# Loudness and true peak (ebur128 peak=true is 4× oversampled true peak; ffmpeg prints the unit as dBFS, it is dBTP)
fail=0
SUM=$(ffmpeg -hide_banner -nostats -i renders/film.mp4 -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p')
LI=$(echo "$SUM" | awk '/ I:/{print $2; exit}'); LRA=$(echo "$SUM" | awk '/ LRA:/{print $2; exit}'); TP=$(echo "$SUM" | awk '/True peak:/{f=1} f&&/Peak:/{print $2; exit}')
echo "loudness ${LI} LUFS, LRA ${LRA} LU"
if python3 -I -c "import sys; sys.exit(0 if float('$TP') <= -1.5 else 1)"; then echo "PASS true peak ${TP} dBTP (≤ −1.5)"; else echo "FAIL true peak ${TP} dBTP (must be ≤ −1.5)"; fail=1; fi
bash "$SCR/unit-check.sh" renders/film.mp4 || fail=1
exit $fail
