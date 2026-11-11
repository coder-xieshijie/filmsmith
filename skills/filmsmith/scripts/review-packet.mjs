#!/usr/bin/env node
// review-packet: shrinks a film into a small set of images a reviewing agent can look at in one go, plus an
// index.md that says what to check in each image.
// The images come from the engine (`hyperframes snapshot`, the same runtime as the render, so they show the
// project source as it is now). This script adds: the narration line at each moment (timeline.json), a geo-check
// summary, the image budget, index.md and packet.json.
//   - Seam strips seam-NN.jpg (snapshot --review): five frames at -0.2 / -0.1 / 0 / +0.1 / +0.2 s around each cut.
//     The engine splits scenes by top-level timed elements, and the kit's assemble step gives every segment a marker
//     (#mk-<segment>), so cuts = segment bounds + handoff times from handoff.json. Presenter-window entries and
//     exits are cuts too and rank lower. Handoffs listed in handoff.json that the engine did not detect (a project
//     assembled by an older assemble without segment markers), and narration scene changes (scenes boundaries in
//     timeline.json) more than 0.5 s from any detected cut, get the same five frames via snapshot --at (one call
//     each, 3 in parallel).
//   - Scene frames review-beats*.jpg (snapshot --review): each scene start + 0.3 s and midpoint, and each timed
//     element with data-beat.
//   - State changes change-NN.jpg (snapshot --at): every anchor the director marked with ! in anchors.txt (cues.js
//     CHANGES), one row per change, three rows per image: before (−0.2 s), during (half the change), after (the
//     change + 0.3 s), so 1–2 s moves that fall between contact-sheet frames are seen.
//   - Contact sheets sheet-NN.jpg (snapshot --at; the engine's sheets are 3x3): 9 frames per 30 s, to tell with the
//     sound off what that stretch is about.
//   - Phone width review-phone.jpg (snapshot --review): scene frames scaled to 360 px wide, to see whether text
//     stays legible on a phone.
//   - Full-resolution frames frame-NN-*.png for --at (snapshot --at).
// At most 20 images by default (--max-images), taken in this order: --at frames > segment-handoff seams > scene
// frames > state changes > narration-change seams > contact sheets > presenter-window seams > phone width. Whatever does not fit is
// listed in index.md. Seam images are numbered by time, seam-NN.jpg.
// Engine version follows the project: <project>/build/hf.cjs, else the first kit's starter/build/hf.cjs.
//
// Fallback (not the normal path): when there is only a rendered film and no project (an mp4 with no index.html
// beside it), or --video names a film, the engine cannot be used. ffmpeg then pulls frames from the film into
// images of the same shape (contact sheets 3x3, seam strips 5 frames in a row, no text drawn on them; times and
// lines are in index.md). Seams come from handoff.json or the segment bounds in timeline.json. No scene frames or
// phone width.
//
// Usage: node review-packet.mjs <project dir | film.mp4> [options]
//   --out <dir>          default <project>/.review-packet/ (rewritten each run; keep it out of Git)
//   --from <s> --to <s>  only this stretch (for reworking one part; scene frames still cover the whole film)
//   --timeline <json>    default, first match of: <project>/timeline.json; timeline.json in the shared directory
//                        named by <project>/film.json "shared" (relative to the project, or absolute); sibling
//                        directories named 0-shared*. Shared candidates must match the film length (total frames).
//   --handoff <json>     default <project>/handoff.json
//   --sheet-every 30     seconds per contact sheet
//   --max-images 20      image budget
//   --at 12.5,80.2       extra full-resolution frames (count toward the budget); add --only-at to produce just
//                        these frames and nothing else (a checker's closer look): they go to <project>/.review-packet/frames/
//                        (replaced on each --only-at run) unless --out is given, and the packet itself stays
//   --look <md>          append this file under "Extra points for this review" in index.md
//   --video <mp4>        use the ffmpeg fallback on this film
//   --no-geo             neither run nor read geo-check
//   --keep               keep the temporary directory (debugging)
// handoff.json may take either form (the kit's convention):
//   { "fps": 30, "segments": [ { "id": "a", "start": 0, "end": 27.0 }, ... ] }   start/end in seconds; in/out are
//                                                                                 frames, divided by fps
//   { "seams": [ { "t": 27.0, "from": "a", "to": "b", "state": "what the last frame = first frame must show" } ] }
//                                                                                 seams win when present
// Output: <out>/index.md, <out>/packet.json, the images, and geo-check.json when geo-check was re-run. The last
// stdout line is: review packet → <dir>: <n> images (...), <s> s[; <k> warnings, see index.md]
// geo-check: reuses <project>/.geo-check.json when it is newer than the source, otherwise runs geo-check.cjs from
// this directory (film.json "web": true adds --zone y0=1080 --avatar none). Check logs: the summary lines of
// build/check-*.txt and build/reports/summary-*.txt are quoted in index.md.
// Exit codes: 0 packet written; 2 error. Needs node and npx (engine); the fallback needs ffmpeg and ffprobe.
// Known limits: the engine path shows the source, not renders/film.mp4 (a warning is added when the film is older
// than the source); dates in index.md are ISO strings in UTC.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const T0 = Date.now();

// ---------- options ----------
const argv = process.argv.slice(2);
const flag = (k) => argv.includes('--' + k);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const BOOL = ['seek', 'no-geo', 'keep', 'only-at'];
const ONLY_AT = flag('only-at');
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && !BOOL.includes(argv[i - 1].slice(2))));
if (!positional[0]) { console.error('usage: node review-packet.mjs <project dir | film.mp4> [--out dir] ... (see the file header)'); process.exit(2); }
let DIR, VIDEO = opt('video', null);
const first = path.resolve(positional[0]);
if (first.endsWith('.mp4')) {
  DIR = path.basename(path.dirname(first)) === 'renders' ? path.dirname(path.dirname(first)) : path.dirname(first);
  if (!fs.existsSync(path.join(DIR, 'index.html'))) VIDEO = first;
} else DIR = first;
if (VIDEO) VIDEO = path.resolve(VIDEO);
const ENGINE = !VIDEO;
const OUT = path.resolve(opt('out', path.join(DIR, '.review-packet', ONLY_AT ? 'frames' : '')));
const SHEET_EVERY = Number(opt('sheet-every', '30'));
const TILES = 9; // the engine's contact sheets are 3x3
const MAX_IMAGES = Number(opt('max-images', '20'));
const AT = (opt('at', '') || '').split(',').filter(Boolean).map(Number);
const FPS = 30;

const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const readJSON = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; } };
const warnings = [];
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20 });
  if (r.status !== 0) throw new Error(`${cmd} ${args[0] || ''} exited ${r.status}: ${(r.stderr || r.stdout || '').trim().split('\n').slice(-6).join(' | ')}`);
  return r.stdout;
};

// ---------- engine: the project's own build/hf.cjs (the version is pinned only there), else the kit's ----------
const KITS = path.join(HERE, '../assets/kits');
const HF = [path.join(DIR, 'build/hf.cjs'), ...(fs.existsSync(KITS) ? fs.readdirSync(KITS).sort().map((k) => path.join(KITS, k, 'starter/build/hf.cjs')) : [])].find((p) => fs.existsSync(p));
function snapshot(args) {
  const s = run('node', [HF, 'snapshot', DIR, ...args, '--json']);
  return JSON.parse(s.slice(s.indexOf('{')));
}
const snapshotAsync = (args) => new Promise((res, rej) => {
  const p = spawn('node', [HF, 'snapshot', DIR, ...args, '--json']);
  let out = '', err = '';
  p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (err += d));
  p.on('close', (code) => { try { if (code) throw new Error(err.trim().split('\n').slice(-4).join(' | ')); res(JSON.parse(out.slice(out.indexOf('{')))); } catch (e) { rej(new Error(`snapshot ${args.join(' ')}: ${e.message}`)); } });
});
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; await fn(items[k]); } })); }
const five = (t, dur) => [-0.2, -0.1, 0, 0.1, 0.2].map((d) => Math.round(Math.min(dur - 1 / FPS, Math.max(0, t + d)) * 1000) / 1000);

// ---------- timeline, narration, handoff contract ----------
function newestSource(dir) {
  let newest = 0, who = '';
  const walk = (d, depth) => {
    for (const f of fs.existsSync(d) ? fs.readdirSync(d) : []) {
      if (f.startsWith('.') || ['node_modules', 'renders', 'vendor', 'assets', 'build'].includes(f)) continue;
      const p = path.join(d, f), s = fs.statSync(p);
      if (s.isDirectory()) { if (depth < 1) walk(p, depth + 1); continue; }
      if (/\.(js|cjs|mjs|html|css|json)$/.test(f) && s.mtimeMs > newest) { newest = s.mtimeMs; who = path.relative(dir, p); }
    }
  };
  walk(dir, 0);
  return { newest, who };
}
function findTimeline(duration) {
  const cands = [];
  if (opt('timeline')) cands.push(path.resolve(opt('timeline')));
  cands.push(path.join(DIR, 'timeline.json'));
  const shared = (readJSON(path.join(DIR, 'film.json')) || {}).shared;
  if (typeof shared === 'string' && shared) cands.push(path.join(path.resolve(DIR, shared), 'timeline.json'));
  const parent = path.dirname(DIR);
  for (const f of fs.existsSync(parent) ? fs.readdirSync(parent).sort() : []) if (/^0-shared/.test(f)) cands.push(path.join(parent, f, 'timeline.json'));
  for (const p of cands) {
    const t = readJSON(p);
    if (!t) continue;
    const fps = t.fps || FPS;
    const total = t.total ? t.total / fps : null;
    if (opt('timeline') || p === path.join(DIR, 'timeline.json') || !duration || (total && Math.abs(total - duration) < 0.5)) return { path: p, data: t, fps };
  }
  return null;
}
function linesOf(tl) {
  if (!tl || !Array.isArray(tl.data.lines)) return [];
  return tl.data.lines.map((l) => {
    const start = l.start ?? (l.from != null ? l.from / tl.fps : 0);
    return { id: l.id, text: l.text || '', start, end: start + (l.dur ?? (l.frames != null ? l.frames / tl.fps : 0)) };
  });
}
const st = (v) => (v && typeof v === 'object' ? v.state || '' : v || '');
function seamsFromHandoff(p) {
  const h = readJSON(p);
  if (!h) return null;
  const fps = h.fps || FPS;
  if (Array.isArray(h.seams) && h.seams.length) {
    return h.seams.map((s) => ({ t: s.at ?? s.t ?? (s.frame != null ? s.frame / fps : null), from: s.from || '', to: s.to || '', state: s.state || s.handoff || '' })).filter((s) => s.t != null);
  }
  if (Array.isArray(h.segments) && h.segments.length > 1) {
    const segs = h.segments.map((s) => ({ id: s.id, start: s.start ?? (s.in != null ? s.in / fps : null), end: s.end ?? (s.out != null ? s.out / fps : null), last: st(s.last || s.endState), first: st(s.first || s.startState) })).sort((a, b) => a.start - b.start);
    const out = [];
    for (let i = 0; i + 1 < segs.length; i++) {
      const t = segs[i].end ?? segs[i + 1].start;
      if (t != null) out.push({ t, from: segs[i].id, to: segs[i + 1].id, state: [segs[i].last && `last frame: ${segs[i].last}`, segs[i + 1].first && `first frame: ${segs[i + 1].first}`].filter(Boolean).join('; ') });
    }
    return out;
  }
  return null;
}
function seamsFromTimeline(tl) {
  const sc = tl && Array.isArray(tl.data.scenes) ? tl.data.scenes : null;
  if (!sc || sc.length < 2) return null;
  return sc.slice(0, -1).map((s, i) => ({ t: (s.out ?? sc[i + 1].in) / tl.fps, from: s.scene || s.id || String(i), to: sc[i + 1].scene || sc[i + 1].id || String(i + 1), state: '' }));
}

// State changes the director marked in anchors.txt (cues.js CHANGES: anchor name → seconds the change lasts) → [{ name, t, d }]
function changesOf() {
  const f = path.join(DIR, 'cues.js');
  if (!fs.existsSync(f)) return [];
  const sb = {};
  try { vm.runInNewContext(fs.readFileSync(f, 'utf8'), sb); } catch (e) { warnings.push(`cues.js could not be read (${e.message}): no state-change strips`); return []; }
  const C = (sb.CUES || {}).CHANGES || {}, T = (sb.CUES || {}).T || {};
  return Object.entries(C).filter(([n]) => typeof T[n] === 'number').map(([name, d]) => ({ name, t: T[name], d })).sort((a, b) => a.t - b.t);
}

// ---------- fallback: ffmpeg pulls frames from the film and tiles them ----------
const ff = {
  duration: (f) => Number(JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', f])).format.duration),
  // frames -> one image with cols columns (a partial row is still produced)
  sheet(times, w, cols, tmp, name) {
    const d = fs.mkdtempSync(path.join(tmp, name + '-'));
    times.forEach((t, i) => run('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', VIDEO, '-frames:v', '1', '-vf', `scale=${w}:-2`, '-q:v', '3', path.join(d, `${i + 1}.jpg`)]));
    const out = path.join(OUT, name + '.jpg');
    run('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(d, '%d.jpg'), '-vf', `tile=${cols}x${Math.ceil(times.length / cols)}:padding=4:color=0x1b1b1b`, '-frames:v', '1', '-q:v', '3', out]);
    return out;
  },
};

// ---------- main ----------
(async () => {
  if (ENGINE && !fs.existsSync(path.join(DIR, 'index.html'))) throw new Error(`${DIR} has no index.html; with only a rendered film, pass the mp4 path (ffmpeg fallback)`);
  if (ENGINE && !HF) throw new Error('build/hf.cjs not found (neither in the project nor in the kit)');
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'review-packet-'));
  const te = Date.now();

  // The engine's review plan (scenes, cuts, scene frames, seam strips, phone width); also gives the film length
  let review = null, DUR;
  if (ENGINE) {
    if (ONLY_AT) DUR = (readJSON(path.join(DIR, 'film.json')) || {}).duration ?? Infinity;
    else { const j = snapshot(['--review', '--output', path.join(tmp, 'review')]); review = j.review; DUR = review.window[1]; }
  } else DUR = ff.duration(VIDEO);
  const FROM = Math.max(0, Number(opt('from', '0')));
  const TO = Math.min(DUR, Number(opt('to', String(DUR))));
  const tl = findTimeline(DUR === Infinity ? null : DUR);
  const lines = linesOf(tl);
  const lineAt = (t) => lines.find((l) => t >= l.start && t < l.end) || [...lines].reverse().find((l) => l.start <= t) || null;
  const lineTag = (t) => { const l = lineAt(t); return l ? `${l.id} "${l.text}"` : ''; };

  if (ENGINE && fs.existsSync(path.join(DIR, 'renders/film.mp4'))) {
    const ns = newestSource(DIR), vm = fs.statSync(path.join(DIR, 'renders/film.mp4')).mtimeMs;
    if (ns.newest > vm + 1000) warnings.push(`the packet shows the source as it is now; renders/film.mp4 (${new Date(vm).toISOString()}) is older than ${ns.who} (${new Date(ns.newest).toISOString()}): re-render before delivery`);
  }

  // Handoff contract
  const handoffPath = path.resolve(opt('handoff', path.join(DIR, 'handoff.json')));
  let contract = fs.existsSync(handoffPath) ? seamsFromHandoff(handoffPath) : null;
  let contractSrc = contract ? path.relative(DIR, handoffPath) || 'handoff.json' : null;
  contract = (contract || []).filter((s) => s.t > FROM && s.t < TO);
  const near = (a, b) => Math.abs(a - b) < 0.05;

  // ---------- candidate images (kind, priority, times, lines to label) ----------
  const cands = [];
  const add = (c) => cands.push(c);
  // --at frames
  if (AT.length) {
    if (ENGINE) {
      const j = snapshot(['--at', AT.join(','), '--no-end', '--output', path.join(tmp, 'at')]);
      j.frames.forEach((f, i) => { const name = `frame-${String(i + 1).padStart(2, '0')}-${fmt(f.time).replace(':', 'm')}.png`; fs.copyFileSync(f.path, path.join(OUT, name)); add({ pri: 0, kind: 'full-res frame', file: name, a: f.time, b: f.time, times: [f.time] }); });
    } else AT.forEach((t, i) => { const name = `frame-${String(i + 1).padStart(2, '0')}-${fmt(t).replace(':', 'm')}.jpg`; run('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', VIDEO, '-frames:v', '1', '-q:v', '2', path.join(OUT, name)]); add({ pri: 0, kind: 'full-res frame', file: name, a: t, b: t, times: [t] }); });
  }
  if (!ONLY_AT) {
    // Seams: cuts the engine detected; contract handoffs it did not detect; narration scene changes (scenes bounds in timeline.json)
    const narr = (seamsFromTimeline(tl) || []).filter((s) => s.t > FROM && s.t < TO);
    const extra = [];
    if (ENGINE) {
      const used = new Set();
      for (const s of review.seams.filter((x) => x.time > FROM && x.time < TO)) {
        const c = contract.find((x) => near(x.t, s.time));
        if (c) used.add(c);
        const av = !c && [s.from, s.to].some((x) => /^av\d+$/.test(x || ''));
        const n = !c && !av && narr.find((x) => near(x.t, s.time));
        const kind = c ? 'seam (segment handoff)' : av ? 'seam (presenter window)' : n ? 'seam (narration change)' : 'seam (engine cut)';
        add({ pri: c ? 1 : n ? 3 : 5, kind, src: s.sheet, t: s.time, a: s.times[0], b: s.times[s.times.length - 1], times: s.times, from: c ? c.from : n ? n.from : s.from, to: c ? c.to : n ? n.to : s.to, state: c ? c.state : '', note: av ? 'presenter window entering or leaving, not a segment handoff: check that the picture makes room and nothing is covered by it' : '' });
      }
      const taken = review.seams.map((x) => x.time);
      for (const c of contract.filter((x) => !used.has(x))) { extra.push({ pri: 1, kind: 'seam (segment handoff)', t: c.t, from: c.from, to: c.to, state: c.state, note: 'the engine did not detect a cut here (the project has no segment markers; re-assemble with the current kit assemble); five frames added at the contract time' }); taken.push(c.t); }
      for (const n of narr.filter((x) => !taken.some((t) => Math.abs(t - x.t) < 0.5))) extra.push({ pri: 3, kind: 'seam (narration change)', t: n.t, from: n.from, to: n.to, state: '', note: 'the narration changes scene here; the picture need not cut at this instant; the five frames show whether it follows the new topic' });
      extra.forEach((e) => { e.times = five(e.t, DUR); e.a = e.times[0]; e.b = e.times[4]; add(e); });
      // Scene frames, phone width
      const beatTimes = review.beats.map((b) => b.time);
      review.sheets.beats.forEach((p) => add({ pri: 2, kind: 'scene frames', src: p, a: 0, b: DUR, times: beatTimes, labels: review.beats }));
      review.sheets.phone.forEach((p) => add({ pri: 6, kind: 'phone width', src: p, a: 0, b: DUR, times: beatTimes, labels: review.beats }));
    } else {
      const segs = contract.length ? contract.map((c) => ({ ...c, pri: 1, kind: 'seam (segment handoff)' })) : narr.map((n) => ({ ...n, pri: 3, kind: 'seam (narration change)' }));
      segs.forEach((c) => { const times = five(c.t, DUR); add({ pri: c.pri, kind: c.kind, t: c.t, a: times[0], b: times[4], times, from: c.from, to: c.to, state: c.state }); });
    }
    // State changes: three per image, one row each (before / during / after)
    const ch = changesOf().filter((c) => c.t >= FROM && c.t < TO);
    const clamp = (t) => Math.round(Math.min(DUR - 1 / FPS, Math.max(0, t)) * 1000) / 1000;
    for (let i = 0; i < ch.length; i += 3) {
      const rows = ch.slice(i, i + 3).map((c) => ({ ...c, times: [c.t - 0.2, c.t + c.d / 2, c.t + c.d + 0.3].map(clamp) }));
      add({ pri: 2.5, kind: 'state changes', a: rows[0].times[0], b: rows[rows.length - 1].times[2], times: rows.flatMap((r) => r.times), rows });
    }
    // Contact sheets: 9 frames per SHEET_EVERY seconds
    const wins = [];
    for (let a = FROM; a < TO - 0.5; a += SHEET_EVERY) { const b = Math.min(TO, a + SHEET_EVERY), step = SHEET_EVERY / TILES; const ts = []; for (let k = 0; k < TILES; k++) { const t = Math.round((a + step * (k + 0.5)) * 1000) / 1000; if (t < b) ts.push(t); } wins.push({ a, b, times: ts }); }
    wins.forEach((w) => add({ pri: 4, kind: 'contact sheet', a: w.a, b: w.b, times: w.times }));
  }

  // ---------- image budget ----------
  cands.sort((x, y) => x.pri - y.pri || (x.t ?? x.a) - (y.t ?? y.a));
  const keep = cands.slice(0, MAX_IMAGES), dropped = cands.slice(MAX_IMAGES);
  if (dropped.length) warnings.push(`image budget ${MAX_IMAGES}: ${dropped.length} left out (${dropped.map((c) => `${c.kind} ${fmt(c.t ?? c.a)}`).join(', ')}); raise --max-images or split with --from/--to to see them`);

  // ---------- produce images ----------
  const sheets = keep.filter((c) => c.kind === 'contact sheet');
  if (sheets.length && ENGINE) {
    const j = snapshot(['--at', sheets.flatMap((c) => c.times).join(','), '--no-end', '--output', path.join(tmp, 'cover')]);
    if (j.contactSheets.length !== sheets.length) warnings.push(`the engine produced ${j.contactSheets.length} contact sheets, expected ${sheets.length} (9 frames each)`);
    sheets.forEach((c, i) => { c.src = j.contactSheets[i]; });
  }
  if (ENGINE) await pool(keep.filter((c) => (c.kind.startsWith('seam') || c.kind === 'state changes') && !c.src), 3, async (c) => { const j = await snapshotAsync(['--at', c.times.join(','), '--no-end', '--output', path.join(tmp, `strip-${c.t ?? c.a}`)]); c.src = j.contactSheets[0]; });
  let nSeam = 0, nChange = 0;
  for (const c of keep.slice().sort((x, y) => (x.t ?? x.a) - (y.t ?? y.a))) {
    if (c.file) continue;
    if (c.kind === 'contact sheet') c.file = `sheet-${String(sheets.indexOf(c) + 1).padStart(2, '0')}.jpg`;
    else if (c.kind.startsWith('seam')) c.file = `seam-${String(++nSeam).padStart(2, '0')}.jpg`;
    else if (c.kind === 'state changes') c.file = `change-${String(++nChange).padStart(2, '0')}.jpg`;
    else c.file = path.basename(c.src);
    if (ENGINE) { if (c.src && fs.existsSync(c.src)) fs.copyFileSync(c.src, path.join(OUT, c.file)); else warnings.push(`${c.file}: the engine produced no image`); }
    else if (c.kind === 'contact sheet' || c.kind === 'state changes') fs.renameSync(ff.sheet(c.times, 640, 3, tmp, c.file.replace('.jpg', '')), path.join(OUT, c.file));
    else fs.renameSync(ff.sheet(c.times, 384, 5, tmp, c.file.replace('.jpg', '')), path.join(OUT, c.file));
  }
  const engS = (Date.now() - te) / 1000;
  if (!flag('keep')) fs.rmSync(tmp, { recursive: true, force: true });

  // ---------- geo-check and check logs ----------
  let geo = null, geoNote = '';
  if (!flag('no-geo') && !ONLY_AT && fs.existsSync(path.join(DIR, 'index.html'))) {
    const own = path.join(DIR, '.geo-check.json');
    const ns = newestSource(DIR);
    if (fs.existsSync(own) && fs.statSync(own).mtimeMs >= ns.newest - 1000) { geo = readJSON(own); geoNote = 'read the project\'s .geo-check.json (newer than the source)'; }
    else {
      const tg = Date.now();
      const web = (readJSON(path.join(DIR, 'film.json')) || {}).web === true; // web animation unit: no caption band, no presenter
      const r = spawnSync('node', [path.join(HERE, 'geo-check.cjs'), DIR, '--out', path.join(OUT, 'geo-check.json'), ...(web ? ['--zone', 'y0=1080', '--avatar', 'none'] : [])], { encoding: 'utf8', maxBuffer: 64 << 20 });
      geo = readJSON(path.join(OUT, 'geo-check.json'));
      geoNote = `${fs.existsSync(own) ? 'the project report is older than the source, ' : 'no report in the project, '}re-ran it (${((Date.now() - tg) / 1000).toFixed(0)} s, exit ${r.status}); full report in geo-check.json`;
      if (!geo) geoNote += `; no report was written: ${(r.stderr || '').slice(-300)}`;
    }
  }
  const logs = [['build', /^check-.*\.txt$/], ['build/reports', /^summary-.*\.txt$/]].flatMap(([d, re]) => (fs.existsSync(path.join(DIR, d)) ? fs.readdirSync(path.join(DIR, d)).filter((f) => re.test(f)).sort().map((f) => path.join(d, f)) : []));
  const checkLines = logs.map((f) => {
    const p = path.join(DIR, f), s = fs.readFileSync(p, 'utf8');
    const sum = s.split('\n').filter((l) => /^check |error\(s\)|errors|issues|Check (passed|failed)/.test(l)).map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim()).slice(0, 3).join(' | ');
    return `${f} (${new Date(fs.statSync(p).mtimeMs).toISOString()}): ${sum || 'no summary line'}`;
  });

  // ---------- index.md ----------
  const secs = ((Date.now() - T0) / 1000).toFixed(0);
  const count = (k) => keep.filter((c) => c.kind.startsWith(k)).length;
  const md = [`# Review packet · ${path.basename(DIR)}`, ''];
  md.push(`- Source: ${ENGINE ? `engine snapshots of the source (hyperframes snapshot, ${path.relative(DIR, HF).startsWith('..') ? 'the kit\'s' : 'the project\'s'} build/hf.cjs)` : `ffmpeg frames from the film (fallback: ${VIDEO})`}; length ${fmt(DUR === Infinity ? 0 : DUR)}${FROM > 0 || TO < DUR ? `; this packet covers only ${fmt(FROM)}–${fmt(TO)}${ENGINE ? ' (scene frames still cover the whole film)' : ''}` : ''}`);
  const shown = (p) => (path.relative(DIR, p).startsWith('../..') ? p : path.relative(DIR, p));
  md.push(`- Narration: ${tl ? shown(tl.path) : 'no timeline.json found, lines not labelled'}; handoff contract: ${contractSrc || 'none'}${ENGINE && review ? `; cuts detected by the engine: ${review.seams.length}` : ''}`);
  md.push(`- ${keep.length} images (budget ${MAX_IMAGES}): seams ${count('seam')}, scene frames ${count('scene frames')}, state changes ${count('state changes')}, contact sheets ${count('contact sheet')}${count('phone') ? `, phone width ${count('phone')}` : ''}${count('full-res') ? `, full-res frames ${count('full-res')}` : ''}; built in ${secs} s (images ${engS.toFixed(0)} s)`);
  md.push('');
  if (warnings.length) md.push('## Read these first', '', ...warnings.map((w) => `- ${w}`), '');
  md.push('## How to use this packet', '',
    '- Look only at the images listed below, in order; under each image are the narration lines at its moments.',
    '- Geometry (text on strokes, overlaps, out of frame, caption band), empty frames, the number of hand marks and read holds were measured by geo-check (summary at the end); do not count them again. To dispute a script result, name the frame and the element.',
    `- For a closer look, cut at most 4 full-resolution frames yourself: \`node ${fileURLToPath(import.meta.url)} ${DIR} --only-at --at <s>,<s>\` (written to ${path.join(DIR, '.review-packet', 'frames')}/, this packet stays). Do not pull frames in bulk.`,
    '- Every required change names the segment, time and element id (or visible text), e.g. "b · 0:41.3 · the light of #queue-c is off".', '');
  md.push('## Images and what to check', '');
  const LOOK = {
    'seam': 'Check: the five frames show one state moving on (last frame of the previous segment = first frame of the next; follow the contract when there is one); the transition is driven by an object in the picture, not a hard cut and not wiped to empty paper first.',
    'scene frames': 'Check: the start and middle of each segment show what that segment says; each tile shows the scene name (mk-<segment> is a segment marker) and the time.',
    'state changes': 'Check: each row is one state change the narration names, left to right before → during → after; it is acted out (the object moves, gathers, turns void), not swapped by fading one picture out and another in.',
    'contact sheet': 'Check: with the sound off, these tiles alone tell what this stretch is about; for each state change the narration mentions, the picture shows before → process → after; no text-only cards, decorative motion, or picture rules the brief lists as rejected.',
    'phone width': 'Check: at phone width, body text and numbers are still legible.',
  };
  for (const c of keep.slice().sort((x, y) => (x.t ?? x.a) - (y.t ?? y.a) || x.pri - y.pri)) {
    md.push(`### ${c.file} (${c.kind} · ${fmt(c.a)}${c.b !== c.a ? '–' + fmt(c.b) : ''})`, '');
    if (c.kind.startsWith('seam')) md.push(`- Cut ${fmt(c.t)} · ${c.from || '?'} → ${c.to || '(end)'}${c.state ? ` · contract: ${c.state}` : ''}${c.note ? ` · ${c.note}` : ''}`, `- Five frames ${c.times.map((t) => t.toFixed(2)).join(' / ')} s · ${lineTag(c.t) || '(no narration)'}`);
    else if (c.labels) c.labels.forEach((b, i) => md.push(`- ${i + 1}. ${fmt(b.time)} ${b.label} · ${lineTag(b.time) || '(no narration)'}`));
    else if (c.rows) c.rows.forEach((r, i) => md.push(`- Row ${i + 1}: ${r.name} at ${fmt(r.t)} (${r.d} s) · ${lineTag(r.t) || '(no narration)'} · frames ${r.times.map((t) => t.toFixed(2)).join(' / ')} s`));
    else c.times.forEach((t, i) => md.push(`- ${c.times.length > 1 ? i + 1 + '. ' : ''}${fmt(t)} · ${lineTag(t) || '(no narration)'}`));
    const look = Object.entries(LOOK).find(([k]) => c.kind.startsWith(k));
    if (look) md.push('', look[1]);
    md.push('');
  }
  if (opt('look') && fs.existsSync(opt('look'))) md.push('## Extra points for this review', '', fs.readFileSync(opt('look'), 'utf8').trim(), '');
  md.push('## Already measured by scripts', '');
  if (geo) {
    const by = {};
    for (const it of geo.issues || []) by[it.kind] = (by[it.kind] || 0) + 1;
    md.push(`- geo-check: ${geoNote}; ${geo.samples} samples (every ${geo.step} s), ${(geo.issues || []).length} issues${Object.keys(by).length ? ': ' + Object.entries(by).map(([k, v]) => `${k} ${v}`).join(', ') : ''}; ${(geo.hands || []).length} hand marks, ${(geo.reads || []).length} read holds`);
    for (const it of (geo.issues || []).slice(0, 15)) md.push(`  - ${it.from != null ? fmt(it.from) + (it.to != null && it.to !== it.from ? '–' + fmt(it.to) : '') : ''} ${it.kind} ${it.who || ''} ${it.text || ''}`.replace(/\s+/g, ' '));
    if ((geo.issues || []).length > 15) md.push(`  - ${(geo.issues || []).length - 15} more, see the full report`);
  } else md.push(`- geo-check: ${flag('no-geo') ? 'skipped (--no-geo)' : (geoNote || 'not run (no index.html)')}`);
  if (checkLines.length) { md.push('- Check logs in the project (make sure they are newer than the source):'); checkLines.forEach((l) => md.push(`  - ${l}`)); }
  md.push('');
  fs.writeFileSync(path.join(OUT, 'index.md'), md.join('\n'));
  fs.writeFileSync(path.join(OUT, 'packet.json'), JSON.stringify({
    dir: DIR, mode: ENGINE ? 'engine' : 'ffmpeg', video: VIDEO, duration: DUR, from: FROM, to: TO, seconds: Number(secs), timeline: tl?.path || null, contract: contractSrc,
    images: keep.map(({ src, labels, pri, ...c }) => ({ ...c, lines: [...new Set((c.t != null ? [c.t] : c.times).map((t) => lineAt(t)?.id).filter(Boolean))] })),
    dropped: dropped.map((c) => ({ kind: c.kind, a: c.a, b: c.b, t: c.t })), warnings,
    geo: geo ? { issues: (geo.issues || []).length, hands: (geo.hands || []).length, reads: (geo.reads || []).length, note: geoNote } : null,
  }, null, 1));
  console.log(`review packet → ${OUT}: ${keep.length} images (seams ${count('seam')}, scene frames ${count('scene frames')}, state changes ${count('state changes')}, contact sheets ${count('contact sheet')}${count('phone') ? ', phone ' + count('phone') : ''}${count('full-res') ? ', full-res ' + count('full-res') : ''}), ${secs} s${warnings.length ? `; ${warnings.length} warnings, see index.md` : ''}`);
})().catch((e) => { console.error(e.stack || e); process.exit(2); });
