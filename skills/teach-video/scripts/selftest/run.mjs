#!/usr/bin/env node
// Skill self-test: one command, PASS/FAIL per case.
//   node <skill>/scripts/selftest/run.mjs [--only <name regex>] [--keep] [--jobs 4]
// Four parts:
//   1. The geo-check cases in cases.mjs: each becomes a minimal HyperFrames project of a few seconds in a temp folder and makes one
//      deliberate mistake; the set of issue kinds geo-check reports must equal `expect` exactly (more or fewer is a FAIL).
//   2. The style kit's demo segments must report 0: a fresh project from scripts/new-film.mjs with the kit's demo shared assets
//      (fonts via scripts/voice/voice.py fonts, cached after the first download), assembled, then geo-check.
//   3. The page-check cases in cases.mjs (PAGE_CASES): copies of that project with one segment each, checked by the kit's
//      build/page-checks.cjs (handoffs covered by a later element, the presenter reserve, handoff.json "persist").
//   4. voice-t2s: scripts/voice/voice.py words on a cached transcript written in traditional characters must write simplified ones.
// geo-check does not check the presenter reserve itself (the kit's build/page-checks.cjs compares that block pixel by pixel); the avatar-zone
// case tests how geo-check treats the reserve: anything entirely inside it is not counted as content.
// Needs node, uv, network on first run (GSAP from the npm registry, fonts, the pinned HyperFrames engine and its Chrome).
// --keep leaves the temp projects (open one with `npm run hf -- preview` inside it); by default they are deleted. Exit 0 all pass, 1 any FAIL.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CASES, PAGE_CASES, PAGE_ITEMS } from './cases.mjs';

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

// The kit demo: new project + its own copy of the demo shared assets (JSON committed in the skill; fonts downloaded or cached)
function kitDemo() {
  const proj = path.join(tmp, 'kit-demo'), shared = path.join(tmp, 'kit-demo-shared');
  sh('node', [path.join(SKILL, 'scripts/new-film.mjs'), proj]);
  fs.mkdirSync(shared);
  for (const f of ['narration.json', 'shared.json', 'timeline.json', 'words.json', 'contract.json']) fs.copyFileSync(path.join(KIT, 'demo-shared', f), path.join(shared, f));
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
// The kit-demo project is built once, before the jobs, when a job needs it
let demo = null, demoErr = null;
const needDemo = () => { if (!demo && !demoErr) { try { demo = kitDemo(); } catch (e) { demoErr = e; } } if (demoErr) throw demoErr; return demo; };
jobs.push({ name: 'kit-demo', what: 'the terminal-ledger kit demo segments must report 0', expect: [], kit: true, run: async () => { try { return await geo(needDemo(), [], path.join(tmp, 'kit-demo.geo.json')); } catch (e) { return { code: 2, log: e.message, report: null }; } } });
for (const c of PAGE_CASES) jobs.push({ name: c.name, what: c.what, expect: c.expect, kit: true, run: async () => { try { return await pageCase(c, needDemo()); } catch (e) { return { code: 2, log: e.message, report: null }; } } });
jobs.push({ name: 'voice-t2s', what: 'voice.py words turns a cached transcript in traditional characters (這樣的話 說過) into simplified ones', expect: [], run: async () => voiceT2S() });
const todo = jobs.filter((j) => !ONLY || ONLY.test(j.name));
if (todo.some((j) => j.kit)) { try { needDemo(); } catch (_) { /* each kit job reports it */ } }
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
  console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.name.padEnd(24)} want ${x.want.length ? x.want.join(', ') : 'none'}, got ${got} (${x.sec.toFixed(1)} s)  ${x.what}`);
  if (!x.ok) {
    for (const i of x.r.report?.issues || []) console.log(`        ${i.kind}  ${i.text || ''}${i.other ? ' × ' + i.other : ''}  ${i.who || ''}`);
    if (!x.r.report || x.r.code === 2) console.log(x.r.log.split('\n').map((l) => '        ' + l).join('\n'));
  }
}
console.log(`\n${results.length - fail}/${results.length} pass in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (KEEP) console.log(`projects kept in ${tmp}`); else fs.rmSync(tmp, { recursive: true, force: true });
process.exitCode = fail ? 1 : 0;
