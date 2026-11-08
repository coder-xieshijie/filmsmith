// Shared by the build scripts: project and skill locations, film.json, time ranges, opening the page directly
// (local static server + the engine's headless Chrome) and seeking it.
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const dir = path.resolve(__dirname, '..');
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };
const filmRaw = () => readJSON(path.join(dir, 'film.json'), {});

// The skill root (the folder holding teach-video's SKILL.md): TEACH_VIDEO_ROOT, else film.json "skill"
// (scripts/new-film.mjs writes it), else this project is the kit's own starter inside the skill.
function skillRoot() {
  const isSkill = (p) => p && fs.existsSync(path.join(p, 'SKILL.md')) && fs.existsSync(path.join(p, 'scripts/geo-check.cjs'));
  const cands = [process.env.TEACH_VIDEO_ROOT, filmRaw().skill, path.resolve(dir, '../../../..')].filter(Boolean).map((p) => path.resolve(dir, p));
  const hit = cands.find(isSkill);
  if (!hit) throw new Error(`cannot find the teach-video skill (tried ${cands.join(', ')}): set film.json "skill" or TEACH_VIDEO_ROOT to the folder that holds its SKILL.md`);
  return hit;
}
const scripts = () => path.join(skillRoot(), 'scripts');
const handoff = () => readJSON(path.join(dir, 'handoff.json'), { segments: [] });
// film.json (film settings) + handoff.json segments (sorted by start) → timeline [{ id, t0, t1, hands }]
const film = () => {
  const F = JSON.parse(fs.readFileSync(path.join(dir, 'film.json'), 'utf8'));
  F.timeline = (handoff().segments || []).slice().sort((a, b) => a.start - b.start).map((s) => ({ id: s.id, t0: s.start, t1: s.end, hands: s.hands }));
  if (!F.timeline.length) F.timeline = [{ id: 'main', t0: 0, t1: F.duration }];
  F.stage = stage(F);
  return F;
};
// Stage: a normal film is 1920×1080 (k = 1). A web loop unit (film.json "web": true) lays out on a 1200×675 logical
// canvas and #world is scaled by k = 1.6 to render 1920×1080 (type tokens unchanged: the 24 px floor reads about
// 13.6 px in a 680 px article column). Web units also switch off the presenter window and its reserve, the caption
// zone y ≥ 880, narration, music and sound cues.
function stage(F) {
  if (!F.web) return { web: false, w: 1920, h: 1080, k: 1 };
  const [w, h] = Array.isArray(F.web) ? F.web : [1200, 675];
  return { web: true, w, h, k: 1920 / w };
}
// Seams: handoff.json "seams" when written (at or t), else one between each pair of neighbours, objects = keys of the earlier segment's last.items
const seams = (H = handoff()) => {
  const segs = (H.segments || []).slice().sort((a, b) => a.start - b.start), by = Object.fromEntries(segs.map((s) => [s.id, s]));
  if (Array.isArray(H.seams) && H.seams.length) return H.seams.map((x) => ({ from: x.from, to: x.to, at: x.at ?? x.t, objects: x.objects || Object.keys(((by[x.from] || {}).last || {}).items || {}) }));
  return segs.slice(1).map((s, i) => ({ from: segs[i].id, to: s.id, at: s.start, objects: Object.keys((segs[i].last || {}).items || {}) }));
};
function args(argv = process.argv.slice(2)) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const k = a.slice(2), v = argv[i + 1]; if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; } } else o._.push(a); }
  return o;
}
// Time range: --seg <id>[,<id>] takes those segments' span; --from / --to override; neither = first segment start to last segment end
function range(o, F = film()) {
  let a = F.timeline[0].t0, b = F.timeline[F.timeline.length - 1].t1;
  if (o.seg) { const ids = String(o.seg).split(','); const ss = F.timeline.filter((s) => ids.includes(s.id)); if (!ss.length) throw new Error('no segment ' + o.seg + ' in handoff.json'); a = Math.min(...ss.map((s) => s.t0)); b = Math.max(...ss.map((s) => s.t1)); }
  if (o.from !== undefined) a = Number(o.from); if (o.to !== undefined) b = Number(o.to);
  return [a, b];
}
const launch = (opts = {}) => require('./browser.cjs').launch({ from: dir, ...opts });
async function open({ scale = 1 } = {}) {
  const browser = await launch();
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.ttf': 'font/ttf', '.wav': 'audio/wav', '.png': 'image/png', '.svg': 'image/svg+xml' };
  const server = http.createServer((req, res) => {
    const f = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(`${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '')}`); });
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: scale });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'load', timeout: 120000 });
  const dl = Date.now() + 90000;
  while (!(await page.evaluate(() => !!(window.__timelines && window.__timelines.main)))) { if (Date.now() > dl) throw new Error('the main timeline never registered (page errors: ' + errors.slice(0, 3).join(' | ') + ')'); await new Promise((r) => setTimeout(r, 200)); }
  await page.evaluate(() => { const r = document.querySelector('[data-composition-id]'); r.style.width = '1920px'; r.style.height = '1080px'; document.querySelectorAll('audio').forEach((a) => a.remove()); window.__timelines.main.pause(); });
  const seek = (t) => page.evaluate((tt) => {
    window.__timelines.main.seek(tt, false);
    // No engine runtime on a directly opened page: show or hide clips by data-start / data-duration (presenter placeholder)
    document.querySelectorAll('.clip[data-start]').forEach((c) => { const a = +c.dataset.start, d = +c.dataset.duration; if (c.id !== 'world') c.style.visibility = tt >= a && tt < a + d ? 'visible' : 'hidden'; });
  }, t);
  const close = async () => { await browser.close(); server.close(); };
  return { browser, page, seek, close, errors };
}
const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
// The shared-assets directory (scripts/voice/voice.py output: timeline.json, words.json, contract.json, audio/, fonts/):
// film.json "shared", relative to this project or absolute
const sharedDir = (F = filmRaw()) => path.resolve(dir, F.shared || '');
const readShared = (name, D = sharedDir()) => { const f = path.join(D, name); if (!fs.existsSync(f)) throw new Error(`no ${f} in the shared assets (run scripts/voice/voice.py first)`); return JSON.parse(fs.readFileSync(f, 'utf8')); };
// timeline.json lines → [{ id, scene, text, start, v0, v1 }]: start is the line's slot, v0–v1 the voiced part (start + off, + dur)
const lines = (D = sharedDir()) => {
  const T = readShared('timeline.json', D), fps = T.fps || 30;
  return T.lines.map((l) => { const start = l.start ?? l.from / fps, v0 = start + (l.off || 0); return { id: l.id, scene: l.scene, text: l.text || '', start, v0, v1: v0 + (l.dur ?? (l.frames || 0) / fps) }; });
};
module.exports = { dir, skillRoot, scripts, film, stage, handoff, seams, args, range, open, launch, fmt, sharedDir, readShared, lines };
