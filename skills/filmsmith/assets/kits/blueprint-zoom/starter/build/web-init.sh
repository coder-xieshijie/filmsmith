#!/bin/sh
# Turn a freshly copied starter into a web loop unit (silent loop, 1200×675 logical canvas, no presenter, caption zone or narration):
#   npm run web-init -- <unit id> <seconds> [hand marks, default 0] [fonts dir]
# A unit needs only the fonts: [fonts dir] is any folder `scripts/voice/voice.py fonts --dir <folder>` filled (a film's shared assets work too);
# without it "shared" stays where it was. Writes film.json ("web": true; "shared" for the fonts, keeps "skill"), handoff.json (one segment <id>, 0–seconds, empty first/last items)
# and a segments/<id>.js skeleton; deletes the demo segments demo-*.js; empties cues.js. Afterwards edit only segments/<id>.js
# (and handoff.json goal / state / last.counter).
set -eu
cd "$(dirname "$0")/.."
ID=$1; D=$2; HANDS=${3:-0}; FONTS=${4:-}
node - "$ID" "$D" "$HANDS" "$FONTS" <<'JS'
const fs = require('fs'), path = require('path'); const [id, D, hands, fonts] = process.argv.slice(2);
const old = JSON.parse(fs.readFileSync('film.json', 'utf8'));
if (fonts) {
  const abs = path.resolve(process.env.INIT_CWD || process.cwd(), fonts);
  if (!fs.existsSync(path.join(abs, 'fonts/LXGWWenKai-Medium.ttf'))) { console.error(`no fonts in ${abs}/fonts: run uv run <skill>/scripts/voice/voice.py fonts --dir ${abs}`); process.exit(1); }
  old.shared = path.relative(process.cwd(), abs) || '.';
}
fs.writeFileSync('film.json', JSON.stringify({ title: `web unit ${id}`, web: true, duration: +D, shared: old.shared, ...(old.skill ? { skill: old.skill } : {}), hands: +hands }, null, 2) + '\n');
const end = { state: 'back to the opening picture (same as frame 0)', chapter: null, counter: null, items: {} };
fs.writeFileSync('handoff.json', JSON.stringify({ _note: 'A web loop unit has one segment. first.counter must be null (the segment sets its own count at 0 s); last.counter is the number shown at the end (null when none); items stay empty.', segments: [{ id, start: 0, end: +D, lines: [], hands: +hands, goal: '', first: { state: 'opening state', chapter: null, counter: null, items: {} }, last: end }] }, null, 2) + '\n');
JS
rm -f segments/demo-*.js anchors.txt
printf '%s\n' '// A web loop unit has no narration: write times in seconds (reading ctx.T throws).' 'window.CUES = { T: {} };' > cues.js
cat > "segments/$ID.js" <<JS
// $ID: web loop unit (silent loop, $D s). Coordinates are the 1200×675 logical canvas (TOKENS.zone.W × H), times are seconds; colours and sizes only from F.COL / F.TK.
// One loop (npm run finish's web-check measures the last two):
//   from 0: opening state, still for ≥ 0.8 s. Things on screen at t = 0 are placed with init(e, { opacity: 1, … }), not faded in from 0 (start and end must match)
//   process: act out the one state change the article explains; hold ≥ 0.6 s after each key change
//   settle: the final picture holds ≥ 1.5 s (a sentence to be read ≥ 4 s, with data-read)
//   back to the start: in the last ≤ 1.0 s tween every changed property back to its init value, in place by $D - 0.2 s (last frame = frame 0, PSNR ≥ 40 dB)
defineSegment('$ID', function build(ctx) {
  const L = ctx.layer, D = ctx.t1, { init, to, show, hide, pop, div, COL } = F;
  // …
});
JS
echo "now a web loop unit $ID ($D s, $HANDS hand marks): write segments/$ID.js, then npm run check"
