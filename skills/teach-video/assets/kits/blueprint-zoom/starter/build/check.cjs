#!/usr/bin/env node
// npm run check [-- --seg <id> | --from a --to b] [--no-hf] [--step 0.25]
// Runs every picture check in one command and ends with one line, pass / fail + report path:
//   geo-check (the skill's scripts/geo-check.cjs: geometry, empty frames, hand-mark count, read holds)
//   page checks (build/page-checks.cjs: presenter reserve frame by frame, handoffs, leftovers at segment ends, segment build errors)
//   web loop units (film.json "web": true): geo-check skips the caption zone and the presenter reserve (--zone y0=1080 --avatar none),
//     the page checks skip the reserve
//   hyperframes check (one job per 30 s, --at-transitions --max-transition-samples 120; version in build/hf.cjs)
// One segment: --seg <id> (that segment's start/end from handoff.json; the hand-mark cap is that segment's "hands").
// Reports go to build/reports/, one file per range, so several segments can be checked at once without clobbering each other.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { dir, film, args, range, scripts, fmt } = require('./common.cjs');
const o = args(), FM = film();
if (cp.spawnSync('node', [path.join(__dirname, 'assemble.cjs')], { stdio: 'inherit' }).status !== 0) process.exit(1);   // assemble printed why
const [A, B] = range(o, FM);
const tag = `${A}-${B}`;
const rep = path.join(dir, 'build/reports'); fs.mkdirSync(rep, { recursive: true });
const hf = require('./hf.cjs');
const segs = o.seg ? FM.timeline.filter((s) => String(o.seg).split(',').includes(s.id)) : null;
const handMax = segs ? segs.reduce((n, s) => n + (s.hands ?? 0), 0) : (FM.hands ?? 4);
const run = (name, cmd, argv, file) => new Promise((res) => {
  const t0 = Date.now();
  const p = cp.spawn(cmd, argv, { cwd: dir, env: process.env });
  let out = '';
  p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
  p.on('close', (code) => { fs.writeFileSync(file, out); res({ name, code, out, file, s: Math.round((Date.now() - t0) / 1000) }); });
});
const jobs = [];
const geo = path.join(scripts(), 'geo-check.cjs');
if (!fs.existsSync(geo)) { console.error('cannot find ' + geo + ' (film.json "skill" or TEACH_VIDEO_ROOT must point at the teach-video skill)'); process.exit(2); }
jobs.push(() => run('geo', 'node', [geo, '.', '--from', String(A), '--to', String(B), '--hand-max', String(handMax), ...(FM.stage.web ? ['--zone', 'y0=1080', '--avatar', 'none'] : []), '--out', path.join(rep, `geo-${tag}.json`), ...(o.step ? ['--step', String(o.step)] : [])], path.join(rep, `geo-${tag}.txt`)));
jobs.push(() => run('page', 'node', [path.join(__dirname, 'page-checks.cjs'), '--from', String(A), '--to', String(B), '--out', path.join(rep, `page-${tag}.json`)], path.join(rep, `page-${tag}.txt`)));
if (!o['no-hf']) for (let a = A; a < B - 1e-6; a += 30) {
  const b = Math.min(B, a + 30), r = `${+a.toFixed(3)},${+b.toFixed(3)}`;
  jobs.push(() => run('hf ' + r, 'npx', hf.argv(['check', '--range', r, '--at-transitions', '--max-transition-samples', '120']), path.join(rep, `hf-${r.replace(',', '-')}.txt`)));
}
(async () => {
  const t0 = Date.now(), results = [], queue = jobs.slice();
  await Promise.all([0, 1, 2].map(async () => { while (queue.length) results.push(await queue.shift()()); }));
  const order = ['geo', 'page']; results.sort((x, y) => (order.indexOf(x.name) + 1 || 9) - (order.indexOf(y.name) + 1 || 9) || x.name.localeCompare(y.name));
  const lines = [], bad = [];
  for (const r of results) {
    let ok = r.code === 0, brief = '';
    if (r.name === 'geo') { const m = r.out.match(/(\d+) issues/); const h = r.out.match(/hand marks (\d+)/); const rd = r.out.match(/read holds (\d+)/); brief = `geo ${m ? m[1] : '?'} issues (hand marks ${h ? h[1] : '?'}/${handMax}, read holds ${rd ? rd[1] : '?'})`; }
    else if (r.name === 'page') { const m = r.out.match(/(\d+) issues/); brief = `page ${m ? m[1] : '?'} issues (presenter reserve, handoffs, segment-end leftovers)`; }
    else { const passed = /Check passed/.test(r.out); const errs = [...r.out.matchAll(/(\d+) error\(s\)|◇ (\d+) errors?/g)].map((m) => +(m[1] || m[2])).reduce((a, b) => a + b, 0); ok = ok && passed; brief = `${r.name} ${passed ? 'pass' : 'fail'} (error ${errs})`; }
    lines.push((ok ? '  ✓ ' : '  ✗ ') + brief + `  ${path.relative(dir, r.file)}  ${r.s}s`);
    if (!ok) {
      bad.push(r.name);
      const pick = r.name === 'geo' || r.name === 'page'
        ? (l) => /^(\d+:\d\d\.\d|[a-z_]+  |Error|cannot|no )/.test(l)
        : (l) => /✗|[1-9]\d* error|Error|failed/.test(l) && !/samples \d|overlap \d|^\s+\/|Fix:|skills/.test(l);
      const keep = r.out.split('\n').filter(pick).slice(0, 12);
      for (const l of keep) lines.push('      ' + l.trim());
    }
  }
  const sum = path.join(rep, `summary-${tag}.txt`);
  const head = `check ${fmt(A)}–${fmt(B)}${segs ? ' (segment ' + segs.map((s) => s.id).join(', ') + ')' : ''}: ${bad.length ? 'FAIL (' + bad.join(', ') + ')' : 'pass'}  report ${path.relative(dir, sum)}  ${Math.round((Date.now() - t0) / 1000)} s`;
  fs.writeFileSync(sum, [head, ...lines].join('\n') + '\n');
  console.log(lines.join('\n'));
  console.log(head);
  process.exit(bad.length ? 1 : 0);
})();
