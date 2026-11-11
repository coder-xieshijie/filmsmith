#!/usr/bin/env node
// Skill self-test: one command, PASS/FAIL per case.
//   node <skill>/scripts/selftest-teach/run.mjs [--only <name regex>] [--keep] [--jobs 4]
// Six parts:
//   1. The geo-check cases in cases.mjs: each becomes a minimal HyperFrames project of a few seconds in a temp folder and makes one
//      deliberate mistake; the set of issue kinds geo-check reports must equal `expect` exactly (more or fewer is a FAIL).
//   2. Each style kit's demo segments (KIT_DEMOS in cases.mjs) must report 0: a fresh project from scripts/new-film-teach.mjs --kit <kit> with
//      the kit's demo shared assets (fonts via scripts/voice/voice.py fonts, cached after the first download), assembled, then geo-check.
//   3. The page-check cases in cases.mjs (PAGE_CASES): copies of the terminal-ledger demo project with one segment each, checked by the kit's
//      build/page-checks.cjs (handoffs covered by a later element, the presenter reserve, handoff.json "persist").
//   4. The zoom cases in cases.mjs (ZOOM_CASES) on copies of the blueprint-zoom demo project (F.bp.zoom near the presenter reserve,
//      a second zoom after a built or stand-in segment), and kit-shared-identical: lib.js, main.js and build/ byte-identical across kits.
//   5. voice-t2s: scripts/voice/voice.py words on a cached transcript written in traditional characters must write simplified ones.
//   6. bricks-loader: a kit demo with film.json "bricks" has them copied by add-bricks-teach.mjs from the shared library and puts them on
//      window.BRICKS.
// geo-check does not check the presenter reserve itself (the kit's build/page-checks.cjs compares that block pixel by pixel); the avatar-zone
// case tests how geo-check treats the reserve: anything entirely inside it is not counted as content.
// Needs node, uv, network on first run (GSAP from the npm registry, fonts, the pinned HyperFrames engine and its Chrome).
// --keep leaves the temp projects (open one with `npm run hf -- preview` inside it); by default they are deleted. Exit 0 all pass, 1 any FAIL.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { CASES, PAGE_CASES, PAGE_ITEMS, KIT_DEMOS, ZOOM_CASES } from './cases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(here, '../..');
const GEO = path.join(here, '..', 'geo-check.cjs');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const ONLY = opt('only') && new RegExp(opt('only'));
const KEEP = argv.includes('--keep');
const JOBS = Number(opt('jobs', '4'));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'geo-selftest-'));
const sh = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${(r.stderr || r.stdout).trim().split('\n').slice(-4).join(' | ')}`); return r.stdout; };
// GSAP for the cases: the kit's pinned download
const KIT = path.join(SKILL, 'assets/kits/terminal-ledger');
sh('node', [path.join(KIT, 'starter/build/vendor.cjs'), path.join(tmp, 'gsap')]);
const gsap = fs.readFileSync(path.join(tmp, 'gsap/vendor/gsap.min.js'));

// A kit demo: new project + its own copy of the demo shared assets (JSON committed in the skill; fonts downloaded or cached)
function kitDemo(kit) {
  const proj = path.join(tmp, 'kit-demo-' + kit), shared = path.join(tmp, 'kit-demo-shared-' + kit);
  sh('node', [path.join(SKILL, 'scripts/new-film-teach.mjs'), proj, '--kit', kit]);
  fs.mkdirSync(shared);
  for (const f of ['narration.json', 'shared.json', 'timeline.json', 'words.json', 'contract.json']) fs.copyFileSync(path.join(SKILL, 'assets/kits', kit, 'demo-shared', f), path.join(shared, f));
  sh('uv', ['run', path.join(SKILL, 'scripts/voice/voice.py'), 'fonts', '--dir', shared]);
  const fp = path.join(proj, 'film.json'), film = JSON.parse(fs.readFileSync(fp, 'utf8'));
  film.shared = shared; fs.writeFileSync(fp, JSON.stringify(film, null, 2) + '\n');
  sh('node', [path.join(proj, 'build/assemble.cjs')]);
  return proj;
}

// 0.1 s of 16-bit mono silence at 48 kHz
function silentWav() {
  const n = 4800, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(48000, 24); b.writeUInt32LE(96000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  return b;
}

// A page-check case: a copy of the kit-demo project with one segment "cov" (0–3 s) and no presenter windows, then build/page-checks.cjs
function pageCase(c, demo) {
  return new Promise((resolve) => {
    const d = path.join(tmp, c.name), out = path.join(tmp, c.name + '.page.json');
    try {
      fs.cpSync(demo, d, { recursive: true });
      for (const f of fs.readdirSync(path.join(d, 'segments'))) fs.unlinkSync(path.join(d, 'segments', f));
      fs.writeFileSync(path.join(d, 'segments/cov.js'), `defineSegment('cov', function build(ctx) { const L = ctx.layer; ${c.seg} });\n`);
      const empty = { state: '', chapter: null, counter: null, items: {} };
      fs.writeFileSync(path.join(d, 'handoff.json'), JSON.stringify({ segments: [{ id: 'cov', start: 0, end: 3, lines: [], hands: 0, goal: c.what, first: empty, last: { state: '', items: PAGE_ITEMS } }], ...(c.persist ? { persist: c.persist } : {}) }, null, 1));
      const fp = path.join(d, 'film.json'), film = JSON.parse(fs.readFileSync(fp, 'utf8'));
      film.avatar = []; fs.writeFileSync(fp, JSON.stringify(film, null, 2) + '\n');
      // The demo shared assets carry no audio (the selftest fetches only fonts): a short silent track keeps the page free of 404s
      fs.mkdirSync(path.join(d, 'assets/audio'), { recursive: true });
      for (const f of ['vo', 'bed']) fs.writeFileSync(path.join(d, `assets/audio/${f}.wav`), silentWav());
      sh('node', [path.join(d, 'build/assemble.cjs')]);
    } catch (e) { return resolve({ code: 2, log: e.message, report: null }); }
    const p = spawn(process.execPath, [path.join(d, 'build/page-checks.cjs'), '--out', out], { stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    p.stdout.on('data', (b) => (log += b)); p.stderr.on('data', (b) => (log += b));
    p.on('close', (code) => { let report = null; try { report = JSON.parse(fs.readFileSync(out, 'utf8')); } catch {} resolve({ code, log, report }); });
  });
}

// A blueprint-zoom project: a copy of its kit-demo project with the case's handoff.json and segments (silent audio, no presenter windows)
function zoomProject(name, c, demo, segs) {
  const d = path.join(tmp, name);
  fs.cpSync(demo, d, { recursive: true });
  for (const f of fs.readdirSync(path.join(d, 'segments'))) fs.unlinkSync(path.join(d, 'segments', f));
  for (const [id, body] of Object.entries(segs)) fs.writeFileSync(path.join(d, `segments/${id}.js`), /^defineSegment/.test(body) ? body : `defineSegment('${id}', function build(ctx) { ${body} });\n`);
  fs.writeFileSync(path.join(d, 'handoff.json'), JSON.stringify(c.handoff, null, 1));
  const fp = path.join(d, 'film.json'), film = JSON.parse(fs.readFileSync(fp, 'utf8'));
  film.avatar = []; film.duration = Math.max(...c.handoff.segments.map((x) => x.end)); fs.writeFileSync(fp, JSON.stringify(film, null, 2) + '\n');
  fs.writeFileSync(path.join(d, 'cues.js'), 'window.CUES = { T: {} };\n');
  fs.mkdirSync(path.join(d, 'assets/audio'), { recursive: true });
  for (const f of ['vo', 'bed']) fs.writeFileSync(path.join(d, `assets/audio/${f}.wav`), silentWav());
  sh('node', [path.join(d, 'build/assemble.cjs')]);
  return d;
}
// The box of window.__probe at time t, read by seeking the directly opened page (the project's own build/common.cjs)
async function probeBox(d, t) {
  const { open } = createRequire(import.meta.url)(path.join(d, 'build/common.cjs'));
  const { seek, page, close } = await open();
  try { await seek(t); return await page.evaluate(() => { const r = window.__probe.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map((v) => Math.round(v)); }); } finally { await close(); }
}
async function zoomCase(c, demo) {
  try {
    if (!c.probe) {
      const d = zoomProject(c.name, c, demo, c.segs), out = path.join(tmp, c.name + '.page.json');
      const r = spawnSync(process.execPath, [path.join(d, 'build/page-checks.cjs'), '--out', out], { encoding: 'utf8' });
      let report = null; try { report = JSON.parse(fs.readFileSync(out, 'utf8')); } catch {}
      return { code: r.status, log: (r.stdout || '') + (r.stderr || ''), report };
    }
    const built = await probeBox(zoomProject(c.name, c, demo, c.segs), c.probe.at);
    const shell = await probeBox(zoomProject(c.name + '-shell', c, demo, { ...c.segs, [c.probe.standIn]: `defineSegment('${c.probe.standIn}', (ctx) => F.shell(ctx));` }), c.probe.at);
    const off = Math.max(...built.map((v, i) => Math.abs(v - shell[i])));
    return { code: 0, log: '', report: { issues: off > 2 ? [{ kind: 'zoom_origin', text: `built ${built.join(',')}, after a stand-in ${shell.join(',')}` }] : [] } };
  } catch (e) { return { code: 2, log: e.message, report: null }; }
}

// The parts every kit shares (lib.js, main.js, build/) must be byte-identical across kits
function kitDrift() {
  const kits = path.join(SKILL, 'assets/kits'), names = fs.readdirSync(kits).filter((k) => fs.existsSync(path.join(kits, k, 'starter/package.json')));
  const files = (k) => { const b = path.join(kits, k, 'starter'); const walk = (r) => fs.readdirSync(path.join(b, r), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (['reports', 'shots'].includes(e.name) ? [] : walk(path.join(r, e.name))) : [path.join(r, e.name)]); return ['lib.js', 'main.js', ...walk('build')].sort(); };
  const ref = names[0], issues = [];
  for (const k of names.slice(1)) {
    const a = files(ref), b = files(k);
    for (const f of new Set([...a, ...b])) {
      const pa = path.join(kits, ref, 'starter', f), pb = path.join(kits, k, 'starter', f);
      if (!fs.existsSync(pa) || !fs.existsSync(pb) || !fs.readFileSync(pa).equals(fs.readFileSync(pb))) issues.push({ kind: 'kit_drift', text: `${k}/starter/${f} differs from ${ref}'s` });
    }
  }
  return { code: 0, log: '', report: { issues } };
}

// bricks-loader: a copy of the terminal-ledger demo project lists two bricks in film.json, scripts/add-bricks-teach.mjs copies them into lib/,
// assemble writes the module loader, and the page must put both on window.BRICKS with a working create() (a brick drawn at p 0.5 on a
// canvas paints something) and still build every segment.
async function bricksLoader(demo) {
  const d = path.join(tmp, 'bricks-loader'), ids = ['card-portal', 'digit-roll'], issues = [];
  fs.cpSync(demo, d, { recursive: true });
  sh('node', [path.join(SKILL, 'scripts/add-bricks-teach.mjs'), d, '--ids', ids.join(',')]);
  sh('node', [path.join(d, 'build/assemble.cjs')]);
  const { launch } = createRequire(import.meta.url)(path.join(d, 'build/browser.cjs'));
  const http = await import('node:http');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.wav': 'audio/wav', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
  const srv = http.createServer((q, res) => { const f = path.join(d, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(d) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const browser = await launch();
  try {
    const page = await browser.newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(`http://127.0.0.1:${srv.address().port}/index.html`, { waitUntil: 'load' });
    await page.waitForFunction('window.__built', { timeout: 60000 });
    const r = await page.evaluate(async (ids) => {
      const out = {};
      for (const id of ids) {
        const B = window.BRICKS && window.BRICKS[id];
        if (!B) { out[id] = 'missing'; continue; }
        const b = await B.create({}, { lang: 'zh' }), c = document.createElement('canvas'); c.width = 1920; c.height = 1080;
        const g = c.getContext('2d', { willReadFrequently: true }); b.draw(g, 0.5, { dur: 1 });
        const px = g.getImageData(0, 0, 1920, 1080).data; let n = 0; for (let i = 3; i < px.length; i += 4 * 97) if (px[i]) n++;
        out[id] = n ? 'ok' : 'blank';
      }
      return { out, built: window.__built.length, errs: window.__segErrors.length };
    }, ids);
    for (const id of ids) if (r.out[id] !== 'ok') issues.push({ kind: 'bricks_loader', text: `${id}: ${r.out[id]}` });
    if (!r.built || r.errs) issues.push({ kind: 'bricks_loader', text: `segments built ${r.built}, errors ${r.errs}` });
    for (const e of errs) issues.push({ kind: 'bricks_loader', text: `page error: ${e}` });
  } finally { await browser.close(); srv.close(); }
  return { code: 0, log: '', report: { issues } };
}

// voice-t2s: a shared-assets folder whose cached transcript (vo/a1.words.json, keyed by the audio's hash, so nothing is transcribed) is in
// traditional characters; voice.py words must write words.json in simplified ones
function voiceT2S() {
  const d = path.join(tmp, 'voice-t2s'), text = '这样的话，说过。';
  try {
    fs.mkdirSync(path.join(d, 'vo'), { recursive: true });
    fs.writeFileSync(path.join(d, 'narration.json'), JSON.stringify([{ id: 'a1', scene: 'A', text }]));
    fs.writeFileSync(path.join(d, 'timeline.json'), JSON.stringify({ fps: 30, total: 90, lines: [{ id: 'a1', scene: 'A', text, off: 0, dur: 1.6, start: 1, from: 30, frames: 48 }], scenes: [] }));
    fs.writeFileSync(path.join(d, 'vo/a1.mp3'), 'not audio: the transcript cache below matches its hash');
    const sha1 = spawnSync(process.execPath, ['-e', "process.stdout.write(require('crypto').createHash('sha1').update(require('fs').readFileSync(process.argv[1])).digest('hex'))", path.join(d, 'vo/a1.mp3')], { encoding: 'utf8' }).stdout;
    fs.writeFileSync(path.join(d, 'vo/a1.words.json'), JSON.stringify({ sha1, model: 'small', language: 'zh', words: [{ text: '這樣', start: 0, end: 0.4 }, { text: '的話', start: 0.4, end: 0.8 }, { text: '說過', start: 0.9, end: 1.4 }] }));
    const log = sh('uv', ['run', path.join(SKILL, 'scripts/voice/voice.py'), 'words', '--dir', d]);
    const got = JSON.parse(fs.readFileSync(path.join(d, 'words.json'), 'utf8')).words.map((w) => w.text).join('');
    return { code: 0, log, report: { issues: got === '这样的话说过' ? [] : [{ kind: 'not_simplified', text: got }] } };
  } catch (e) { return { code: 2, log: e.message, report: null }; }
}

function writeProject(c) {
  const d = path.join(tmp, c.name);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'gsap.min.js'), gsap);
  fs.writeFileSync(path.join(d, 'hyperframes.json'), JSON.stringify({ paths: { assets: 'assets' } }, null, 2) + '\n');
  fs.writeFileSync(path.join(d, 'index.html'), `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, height=1080">
<title>geo-check self-test · ${c.name}</title>
<!-- ${c.what} -->
<style>
  html, body { margin: 0; background: #f4f1e8; }
  #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #f4f1e8; color: #222; font: 40px/1.2 "PingFang SC", sans-serif; }
  .abs { position: absolute; }
</style>
<script src="gsap.min.js"></script>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${c.dur}" data-width="1920" data-height="1080">
${c.body}
</div>
<script>
  const tl = gsap.timeline({ paused: true });
  ${c.script || ''}
  tl.set({}, {}, ${c.dur});
  window.__timelines = window.__timelines || {};
  window.__timelines.main = tl;
</script>
</body>
</html>
`);
  return d;
}

function geo(dir, args, out) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [GEO, dir, '--out', out, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    p.stdout.on('data', (b) => (log += b)); p.stderr.on('data', (b) => (log += b));
    p.on('close', (code) => {
      let report = null;
      try { report = JSON.parse(fs.readFileSync(out, 'utf8')); } catch {}
      resolve({ code, log, report });
    });
  });
}

// Write every case as a project first (`same` reuses another case's project with different geo-check arguments)
const byName = Object.fromEntries(CASES.map((c) => [c.name, c]));
const jobs = CASES.map((c) => {
  const proj = c.same || c.name, args = c.args ?? byName[proj].args ?? [];
  return { name: c.name, what: c.what, expect: c.expect, proj, run: () => geo(path.join(tmp, proj), args, path.join(tmp, c.name + '.geo.json')) };
});
// Each kit-demo project is built once, before the jobs, when a job needs it; the page cases use terminal-ledger's
const demos = {}, demoErrs = {};
const needDemo = (kit = 'terminal-ledger') => { if (!demos[kit] && !demoErrs[kit]) { try { demos[kit] = kitDemo(kit); } catch (e) { demoErrs[kit] = e; } } if (demoErrs[kit]) throw demoErrs[kit]; return demos[kit]; };
for (const kit of KIT_DEMOS) jobs.push({ name: 'kit-demo-' + kit, what: `the ${kit} kit demo segments must report 0`, expect: [], kit, run: async () => { try { return await geo(needDemo(kit), [], path.join(tmp, `kit-demo-${kit}.geo.json`)); } catch (e) { return { code: 2, log: e.message, report: null }; } } });
for (const c of PAGE_CASES) jobs.push({ name: c.name, what: c.what, expect: c.expect, kit: 'terminal-ledger', run: async () => { try { return await pageCase(c, needDemo()); } catch (e) { return { code: 2, log: e.message, report: null }; } } });
for (const c of ZOOM_CASES) jobs.push({ name: c.name, what: c.what, expect: c.expect, kit: 'blueprint-zoom', run: async () => { try { return await zoomCase(c, needDemo('blueprint-zoom')); } catch (e) { return { code: 2, log: e.message, report: null }; } } });
jobs.push({ name: 'kit-shared-identical', what: 'lib.js, main.js and build/ are byte-identical in every kit', expect: [], run: async () => kitDrift() });
jobs.push({ name: 'bricks-loader', what: 'film.json "bricks" are copied by add-bricks-teach.mjs from the shared library, loaded before main.js and work on window.BRICKS', expect: [], kit: 'terminal-ledger', run: async () => { try { return await bricksLoader(needDemo()); } catch (e) { return { code: 2, log: e.message, report: null }; } } });
jobs.push({ name: 'voice-t2s', what: 'voice.py words turns a cached transcript in traditional characters (這樣的話 說過) into simplified ones', expect: [], run: async () => voiceT2S() });
const todo = jobs.filter((j) => !ONLY || ONLY.test(j.name));
for (const kit of new Set(todo.map((j) => j.kit).filter(Boolean))) { try { needDemo(kit); } catch (_) { /* each kit job reports it */ } }
for (const p of new Set(todo.map((j) => j.proj).filter(Boolean))) writeProject(byName[p]);
const t0 = Date.now();
const results = new Array(todo.length);
let next = 0;
await Promise.all(Array.from({ length: Math.min(JOBS, todo.length) }, async () => {
  while (next < todo.length) {
    const i = next++, j = todo[i], s = Date.now();
    const r = await j.run();
    const got = r.report ? [...new Set(r.report.issues.map((x) => x.kind))].sort() : null;
    const want = [...j.expect].sort();
    const ok = got && r.code !== 2 && JSON.stringify(got) === JSON.stringify(want);
    results[i] = { ...j, ok, got, want, r, sec: (Date.now() - s) / 1000 };
  }
}));

let fail = 0;
for (const x of results) {
  if (!x.ok) fail++;
  const got = x.got ? (x.got.length ? x.got.join(', ') : 'none') : 'no report';
  console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.name.padEnd(26)} want ${x.want.length ? x.want.join(', ') : 'none'}, got ${got} (${x.sec.toFixed(1)} s)  ${x.what}`);
  if (!x.ok) {
    for (const i of x.r.report?.issues || []) console.log(`        ${i.kind}  ${i.text || ''}${i.other ? ' × ' + i.other : ''}  ${i.who || ''}`);
    if (!x.r.report || x.r.code === 2) console.log(x.r.log.split('\n').map((l) => '        ' + l).join('\n'));
  }
}
console.log(`\n${results.length - fail}/${results.length} pass in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (KEEP) console.log(`projects kept in ${tmp}`); else fs.rmSync(tmp, { recursive: true, force: true });
process.exitCode = fail ? 1 : 0;
