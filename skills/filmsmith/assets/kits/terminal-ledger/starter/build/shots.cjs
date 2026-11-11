#!/usr/bin/env node
// npm run shots -- --from a --to b [--every 1] | --seg <id> | --at 12.6,13.5 [--cols 4] [--out x.png]
// The engine takes the frames (hyperframes snapshot --at, the same runtime as the render); this script only tiles them into one contact
// sheet, long side ≤ 2000 px, each cell captioned with its time and segment. (The engine's own sheets hold 9 cells and no segment names.)
// The last line printed is the image path (build/shots/<a>-<b>.jpg, one file per range).
// Look only at this sheet; for detail at a moment use --at those moments (at most 48 cells per sheet).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const { dir, film, args, range, fmt, launch } = require('./common.cjs');
const hf = require('./hf.cjs');
const o = args(), FM = film();
if (cp.spawnSync('node', [path.join(__dirname, 'assemble.cjs')], { stdio: ['ignore', 'ignore', 'inherit'] }).status !== 0) process.exit(1);   // assemble printed why
let times;
if (o.at) times = String(o.at).split(',').map(Number);
else {
  const [A, B] = range(o, FM);
  const nice = [0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 10, 15, 20, 30];
  const every = o.every ? Number(o.every) : nice.find((s) => (B - A) / s <= 15) || 30;
  times = []; for (let t = A; t <= B + 1e-6; t += every) times.push(Math.round(t * 1000) / 1000);
  if (times[times.length - 1] < B - 0.05) times.push(Math.round((B - 1 / 30) * 1000) / 1000);
}
if (times.length > 48) { console.error(`at most 48 cells per sheet, this asks for ${times.length}: raise --every or narrow the range`); process.exit(2); }
const n = times.length, GAP = 8, LAB = 30, MAX = 2000;
let best = null;
for (let c = 1; c <= 8; c++) {
  const r = Math.ceil(n / c), w = Math.min(480, Math.floor((MAX - (c + 1) * GAP) / c)), h = Math.round(w * 9 / 16);
  const W = c * w + (c + 1) * GAP, H = r * (h + LAB) + (r + 1) * GAP;
  if (W > MAX || H > MAX) continue;
  if (!best || w > best.w || (w === best.w && Math.abs(W - H) < Math.abs(best.W - best.H))) best = { c, r, w, h, W, H };
}
if (o.cols) { const c = Number(o.cols), w = Math.min(480, Math.floor((MAX - (c + 1) * GAP) / c)); best = { c, r: Math.ceil(n / c), w, h: Math.round(w * 9 / 16) }; }
if (!best) { console.error('too many cells to fit in 2000 px'); process.exit(2); }
const segAt = (t) => (FM.timeline.find((s) => t >= s.t0 && t < s.t1) || {}).id || '';
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shots-'));
  try {
    const snap = hf.json(['snapshot', dir, '--at', times.join(','), '--no-end', '--output', tmp]);
    const frames = snap.frames || [];
    if (frames.length !== n) throw new Error(`the engine returned ${frames.length} frames, ${n} were asked for`);
    const cells = frames.map((f) => `<figure><img src="${path.basename(f.path)}"><figcaption>${fmt(f.time)} · ${segAt(f.time)}</figcaption></figure>`).join('');
    fs.writeFileSync(path.join(tmp, 'sheet.html'), `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#888"><div id="g" style="display:grid;grid-template-columns:repeat(${best.c},${best.w}px);gap:${GAP}px;padding:${GAP}px;width:max-content">${cells}</div>
<style>figure{margin:0;background:#222} img{display:block;width:${best.w}px;height:${best.h}px} figcaption{height:${LAB}px;line-height:${LAB}px;font:18px/30px monospace;color:#eee;padding-left:8px}</style></body>`);
    const browser = await launch({ args: ['--allow-file-access-from-files'] });
    const page = await browser.newPage();
    await page.setViewport({ width: best.c * best.w + (best.c + 1) * GAP, height: 800, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(tmp, 'sheet.html'), { waitUntil: 'load' });
    const out = path.resolve(o.out || path.join(dir, 'build/shots', o.at ? `at-${times.join('_')}.jpg` : `${times[0]}-${times[times.length - 1]}.jpg`));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const g = await page.$('#g'); await g.screenshot({ path: out, type: /\.png$/.test(out) ? 'png' : 'jpeg', quality: /\.png$/.test(out) ? undefined : 88 });
    await browser.close();
    console.log(out);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
})().catch((e) => { console.error(e.message || e); process.exit(2); });
