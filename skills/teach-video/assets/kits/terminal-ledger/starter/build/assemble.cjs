#!/usr/bin/env node
// Assembly (check / shots / render / dev run it first; no need to call it by hand):
// 1. Writes index.html from film.json: components and segment files in timeline order, presenter placeholder windows, narration,
//    music and sound-cue tracks. index.html is generated: never edit it.
//    Also adds one empty segment marker per cut (#mk-<segment>, a top-level timed element with data-beat=<segment> that draws nothing):
//    the engine splits scenes at top-level timed elements, so `hyperframes snapshot --review` recognises segments and gives every
//    segment boundary and every handoff.json seam its own seam strip (scripts/review-packet.mjs uses it).
// 2. Media and fonts: copies sound and fonts from film.json's shared directory into assets/ (media and fonts stay out of Git), subsets
//    LXGW WenKai to the characters the project uses (re-subsets when they change), and fetches GSAP into vendor/ when missing (build/vendor.cjs).
// Web loop units (film.json "web": true): fonts only; no presenter windows, narration, music or sound cues; window.STAGE tells tokens.js the logical canvas.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { dir, film, seams, sharedDir, scripts } = require('./common.cjs');
const F = film();
const S = F.stage;
const rel = (p) => path.join(dir, p);
const exists = (p) => fs.existsSync(rel(p));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- vendor, sound and fonts ----------
if (!['gsap.min.js', 'MotionPathPlugin.min.js', 'DrawSVGPlugin.min.js'].every((f) => exists('vendor/' + f))) cp.execFileSync('node', [path.join(__dirname, 'vendor.cjs'), dir], { stdio: 'inherit' });
const shared = sharedDir();
fs.mkdirSync(rel('assets/audio'), { recursive: true }); fs.mkdirSync(rel('assets/fonts'), { recursive: true });
// Fonts are required for every project (films and web units): stop with the command that fetches them
if (!fs.existsSync(path.join(shared, 'fonts/LXGWWenKai-Medium.ttf'))) {
  console.error(`[assemble] no fonts in ${path.join(shared, 'fonts')} (film.json "shared"). Fetch them: uv run ${path.join(scripts(), 'voice/voice.py')} fonts --dir ${shared}`);
  process.exit(1);
}
// Copy again when the source changed (different size or newer)
const sync = (src, dst) => {
  if (!fs.existsSync(src)) { console.error('[assemble] missing ' + src + ' (film.json "shared"; run scripts/voice/voice.py)'); return; }
  const a = fs.statSync(src), b = fs.existsSync(dst) && fs.statSync(dst);
  if (!b || a.size !== b.size || a.mtimeMs > b.mtimeMs + 1000) { fs.copyFileSync(src, dst); fs.utimesSync(dst, a.atime, a.mtime); }
};
const SFX = ['tick', 'paper', 'stamp', 'scratch', 'whoosh'];
if (!S.web) for (const f of ['vo', 'bed', ...SFX]) sync(path.join(shared, 'audio', f + '.wav'), rel(`assets/audio/${f}.wav`));
sync(path.join(shared, 'fonts/IBMPlexMono-Medium.ttf'), rel('assets/fonts/IBMPlexMono-Medium.ttf'));
// Skip dot directories (.hyperframes engine records, .review-packet): their JSON would pull unrelated characters into the subset and force a re-subset every time
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name.startsWith('.') || ['vendor', 'node_modules', 'assets', 'renders', 'build'].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]));
let text = '';
for (const f of walk(dir)) if (/\.(js|json|css)$/.test(f)) text += fs.readFileSync(f, 'utf8');
text += (F.title || '') + '口播小窗';
text += [...Array(95)].map((_, i) => String.fromCharCode(32 + i)).join('') + '·•…“”‘’，。：；？！、（）—–→←↑↓✓✗✎▶●○■□▍›≈×−%⏸';
const glyphs = shared + '\n' + [...new Set(text)].filter((c) => c.codePointAt(0) >= 32).sort().join('');
const stamp = rel('assets/fonts/.glyphs');
if (!exists('assets/fonts/WenKai-film.ttf') || !fs.existsSync(stamp) || fs.readFileSync(stamp, 'utf8') !== glyphs) {
  const tmp = rel(`assets/fonts/.glyphs-${process.pid}.txt`), out = rel(`assets/fonts/.WenKai-${process.pid}.ttf`);
  fs.writeFileSync(tmp, glyphs.slice(glyphs.indexOf('\n') + 1));
  cp.execFileSync('uvx', ['--from', 'fonttools', 'pyftsubset', path.join(shared, 'fonts/LXGWWenKai-Medium.ttf'), `--text-file=${tmp}`, `--output-file=${out}`, "--layout-features=*", '--no-hinting'], { stdio: ['ignore', 'ignore', 'inherit'] });
  fs.renameSync(out, rel('assets/fonts/WenKai-film.ttf')); fs.unlinkSync(tmp); fs.writeFileSync(stamp, glyphs);
  console.error(`[assemble] LXGW WenKai subset: ${[...glyphs.slice(glyphs.indexOf('\n') + 1)].length} characters`);
}

// ---------- index.html ----------
const D = F.duration;
const comps = fs.readdirSync(rel('components')).filter((f) => f.endsWith('.js')).sort();
const segs = F.timeline.filter((s) => exists(`segments/${s.id}.js`));
const av = (S.web ? [] : F.avatar || []).filter(([a]) => a < D).map(([a, b], i) => `  <div id="av${i}" class="clip av" data-start="${a}" data-duration="${(Math.min(b, D) - a).toFixed(3)}" data-track-index="${1 + i}" data-track-kind="graphics"><div class="avi" id="avi${i}"><div class="c"></div><div class="t">口播小窗</div></div></div>`);
const sfxList = !S.web && exists('sfx.json') ? JSON.parse(fs.readFileSync(rel('sfx.json'), 'utf8')) : [];
const dur = { whoosh: 0.9, tick: 0.12, paper: 0.32, scratch: 0.34, stamp: 0.25 };
const sfx = sfxList.filter((s) => s.t < D).sort((a, b) => a.t - b.t).map((s, i) => `  <audio id="sfx${i}" src="assets/audio/${s.f}.wav" data-start="${Math.max(0, s.t)}" data-duration="${dur[s.f]}" data-track-index="${30 + (i % 4)}" data-volume="${s.v}"></audio>`);
// Segment markers: cuts = each segment's start + handoff seams (handoff.json seams, default the boundaries); one marker between neighbouring cuts, on two alternating tracks (touching ends do not overlap)
const r3 = (x) => Math.round(x * 1000) / 1000;
const cuts = [...new Set([...F.timeline.map((s) => s.t0), ...seams().map((x) => x.at)].filter((t) => t > 0 && t < D).map(r3))].sort((a, b) => a - b);
const segOf = (t) => (F.timeline.find((s) => t >= s.t0 - 1e-6 && t < s.t1 - 1e-6) || F.timeline[F.timeline.length - 1]).id;
const seen = {};
const marks = [0, ...cuts].map((a, i, all) => {
  const b = i + 1 < all.length ? all[i + 1] : D, id = segOf(a);
  seen[id] = (seen[id] || 0) + 1;
  return `  <div id="mk-${id}${seen[id] > 1 ? '-' + seen[id] : ''}" data-beat="${esc(id)}" data-start="${a}" data-duration="${r3(b - a)}" data-track-index="${40 + (i % 2)}" data-layout-ignore style="display:none"></div>`;
});
const html = `<!doctype html>
<!-- Generated by build/assemble.cjs from film.json. Do not edit. -->
<html lang="zh-CN" data-resolution="landscape"${S.web ? ' data-stage="web"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, height=1080">
<title>${esc(F.title || '')}</title>
<link rel="stylesheet" href="style.css">
<script src="vendor/gsap.min.js"></script>
<script src="vendor/MotionPathPlugin.min.js"></script>
<script src="vendor/DrawSVGPlugin.min.js"></script>
<script>window.STAGE = ${JSON.stringify(S)};</script>
<script src="tokens.js"></script>
<script src="lib.js"></script>
${comps.map((c) => `<script src="components/${c}"></script>`).join('\n')}
<script src="cues.js"></script>
<script>window.FILM = ${JSON.stringify(F)};
window.HANDOFF = ${fs.readFileSync(rel('handoff.json'), 'utf8').trim()};</script>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${D}" data-width="1920" data-height="1080">
  <div id="world" class="clip" data-start="0" data-duration="${D}" data-track-index="0" data-track-kind="graphics">
    <div id="cam"></div>
    <div id="scr"></div>
  </div>
${av.join('\n')}
${marks.join('\n')}
${S.web ? '' : `  <audio id="vo" src="assets/audio/vo.wav" data-start="0" data-duration="${D}" data-track-index="20" data-volume="1"></audio>
  <audio id="bed" src="assets/audio/bed.wav" data-start="0" data-duration="${D}" data-track-index="21" data-volume="${F.bedVolume ?? 0.5}"></audio>
`}${sfx.join('\n')}
</div>
<script>
  window.__timelines = window.__timelines || {};
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildHold = window.__hf.buildHold || {};
  window.__hf.buildReady.main = new Promise((r) => (window.__hf.buildHold.main = r));
</script>
${segs.map((s) => `<script src="segments/${s.id}.js"></script>`).join('\n')}
<script src="main.js"></script>
</body>
</html>
`;
const idx = rel('index.html');
if (!fs.existsSync(idx) || fs.readFileSync(idx, 'utf8') !== html) { const tmp = idx + '.' + process.pid; fs.writeFileSync(tmp, html); fs.renameSync(tmp, idx); }
const missing = F.timeline.filter((s) => !exists(`segments/${s.id}.js`)).map((s) => s.id);
console.error(`[assemble] ${segs.length} segments mounted${missing.length ? ', no file yet: ' + missing.join(' ') : ''}; ${S.web ? 'silent' : exists('sfx.json') ? `${sfx.length} sound cues` : 'sound cues not collected yet (no sfx.json; npm run render collects them before assembling)'}`);
