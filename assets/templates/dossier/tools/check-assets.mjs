#!/usr/bin/env node
// tools/check-assets.mjs — the real-asset gate (`npm run assets`). Writes renders/check-assets.txt; exits 1 on any FAIL.
// For every asset in content.js:
//   - the file is the one captured: its sha256 and its size match content.js;
//   - each exhibit's scale is ≤ the zoom cap (1/0.75 output px per source px), the slip's lift (1.2 × the sheet's
//     scale) included; no crop shows a declared private region;
//   - macOS (the OS vision framework, tools/vision.swift): the crops show every `expect` string and every `drawn`
//     string (a value the film sets in code must be printed on the page it came from), and no `forbid` string; no face
//     is detected in any crop (the film shows no people); every number set on the mat, the worksheet or the index is
//     printed in some crop; a leader's run over the page crosses no text; the carried slip reads its `carry.text`.
//     Elsewhere these checks are skipped with one WARN (run them on a Mac before delivery);
//   - every band: ΔE00 ≥ 20 from every chromatic colour inside it, and the claim stays legible under the stroke or
//     the band runs under the line (tools/regions.mjs, also run by `npm run palettes`).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = resolve(HERE, '..');
const content = (await import(pathToFileURL(join(ROOT, 'content.js')).href)).default;
const { sheetOf, bandOf, leaderOf, leaderOverAsset, ZOOM_CAP, sheetIndex } = await import(pathToFileURL(join(ROOT, 'layout.js')).href);
const { regions } = await import(pathToFileURL(join(ROOT, 'tools/regions.mjs')).href);
const { pixels } = await import(pathToFileURL(join(ROOT, 'tools/pixels.mjs')).href);

const out = []; let fails = 0;
const say = (lvl, msg) => { out.push(`${lvl.padEnd(4)} ${msg}`); if (lvl === 'FAIL') fails++; };
const ok = (cond, msg, warn = false) => say(cond ? 'PASS' : warn ? 'WARN' : 'FAIL', msg);
const hit = ([ax, ay, aw, ah], [bx, by, bw, bh]) => ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah;
// OCR reads a minus as a hyphen and an O for a zero next to digits; spaces vary
const norm = (s) => String(s).replace(/[−–—]/g, '-').replace(/(?<=[\d.])O|O(?=[.\d])/g, '0').replace(/\s+/g, ' ').trim().toLowerCase();

const scenes = content.scenes;
const exhibits = scenes.map((s, i) => [s, i]).filter(([s]) => s.type === 'exhibit');
const crops = {}; // asset id → [{ i, crop, sh }]
for (const [s, i] of exhibits) (crops[s.asset] ??= []).push({ i, crop: s.crop, sh: sheetOf(content, i) });
const mark = scenes.at(-1)?.mark;
if (mark) (crops[mark.asset] ??= []).push({ i: scenes.length - 1, crop: mark.crop, sh: null });

// ---------- files, scale, private regions ----------
for (const [id, a] of Object.entries(content.assets)) {
  const file = join(ROOT, a.file);
  if (!existsSync(file)) { say('FAIL', `${id}: ${a.file} is missing`); continue; }
  const sha = createHash('sha256').update(readFileSync(file)).digest('hex');
  ok(sha === a.sha256, `${id}: sha256 ${sha.slice(0, 12)} ${sha === a.sha256 ? 'matches content.js (the file is as captured)' : `differs from content.js ${a.sha256.slice(0, 12)}: the file was changed, or content.js names another`}`);
  const px = pixels(file);
  ok(px.w === a.size[0] && px.h === a.size[1], `${id}: ${px.w} × ${px.h} px${px.w === a.size[0] && px.h === a.size[1] ? '' : `, content.js says ${a.size.join(' × ')}`}`);
  if (!crops[id]) say('WARN', `${id}: listed in assets but no scene shows it`);
  for (const c of crops[id] ?? []) {
    if (c.sh) ok(c.sh.scale <= ZOOM_CAP + 1e-9, `${id}: scene ${c.i + 1} shows it at ${c.sh.scale.toFixed(3)} output px per source px (cap ${ZOOM_CAP.toFixed(3)})`);
    for (const r of a.private ?? []) ok(!hit(c.crop, r), `${id}: scene ${c.i + 1}'s crop [${c.crop}] keeps clear of the private region [${r}]`);
  }
}
const ws = scenes.findIndex((s) => s.type === 'worksheet');
if (ws >= 0 && scenes[ws].carry) {
  const sh = sheetOf(content, sheetIndex(scenes, ws));
  ok(sh.scale * 1.2 <= ZOOM_CAP + 1e-9, `the slip's pixels lift to ${(sh.scale * 1.2).toFixed(3)} output px per source px before they are set in code (cap ${ZOOM_CAP.toFixed(3)})`);
  const { region, ink } = scenes[ws].carry;
  ok(ink[0] >= region[0] && ink[1] >= region[1] && ink[0] + ink[2] <= region[0] + region[2] && ink[1] + ink[3] <= region[1] + region[3], `the slip's ink box [${ink}] lies inside its region [${region}]`);
}

// ---------- what the page shows (macOS vision) ----------
const canSee = process.platform === 'darwin' && (() => { try { execFileSync('swift', ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
const temps = [];
const seen = new Map();
const look = (id, r) => {
  const key = `${id}|${r}`;
  if (seen.has(key)) return seen.get(key);
  let file = join(ROOT, content.assets[id].file);
  if (!/\.(png|jpe?g)$/i.test(file)) { // the vision framework reads PNG reliably: a copy for reading only
    const png = join(tmpdir(), `dossier-vision-${id}-${process.pid}.png`);
    if (!temps.includes(png)) { execFileSync('sips', ['-s', 'format', 'png', file, '--out', png], { stdio: 'ignore' }); temps.push(png); }
    file = png;
  }
  const res = execFileSync('swift', [join(HERE, 'vision.swift'), file, ...r.map(String)], { encoding: 'utf8', maxBuffer: 1 << 24 })
    .split('\n').filter(Boolean).map((l) => { const [k, x, y, w, h, ...t] = l.split('\t'); return { k, x: +x, y: +y, w: +w, h: +h, text: t.join('\t') }; });
  seen.set(key, res);
  return res;
};
if (!canSee) say('WARN', 'text, number, leader and face checks skipped: they need macOS (swift and the Vision framework). Run `npm run assets` on a Mac before delivery');
else {
  const allText = [];
  for (const [id, a] of Object.entries(content.assets)) {
    if (!crops[id]) continue;
    const found = crops[id].flatMap((c) => look(id, c.crop));
    const lines = found.filter((f) => f.k === 'T'), text = norm(lines.map((l) => l.text).join('\n'));
    allText.push(text);
    for (const e of a.expect ?? []) ok(text.includes(norm(e)), `${id}: the crop shows "${e}"`);
    for (const d of a.drawn ?? []) ok(text.includes(norm(d)), `${id}: "${d}", set in code, is printed in the crop`);
    for (const f of a.forbid ?? []) ok(!text.includes(norm(f)), `${id}: the crop does not show "${f}"`);
    const faces = found.filter((f) => f.k === 'F');
    ok(!faces.length, `${id}: no face in the crops${faces.length ? ` (${faces.length} found at ${faces.map((f) => `[${f.x}, ${f.y}, ${f.w}, ${f.h}]`).join(', ')}: crop it out)` : ''}`);
  }
  // every number the film sets in type is printed on a page it shows
  const words = [];
  scenes.forEach((s, i) => {
    const claim = Array.isArray(s.claim) ? s.claim.join(' ') : s.claim;
    for (const v of [claim, s.terms, s.value, s.carry?.text, ...(s.rows ?? []).flat()]) if (v) words.push([i, v]);
  });
  const nums = new Set();
  for (const [i, v] of words) for (const m of String(v).matchAll(/[−-]?\d+(?:[.,]\d+)*/g)) nums.add(`${i}|${m[0]}`);
  const corpus = allText.join('\n');
  for (const k of nums) {
    const [i, n] = k.split('|');
    if (/^\d$/.test(n) && scenes[i].type === 'ledger') continue; // an exhibit number
    ok(corpus.includes(norm(n)), `scene ${+i + 1}: the number ${n} is printed in a crop`);
  }
  // leaders: the part over the page crosses no text
  let sheet = null;
  scenes.forEach((s, i) => {
    if (s.type === 'exhibit') sheet = i;
    if ((s.type !== 'exhibit' && s.type !== 'claim') || sheet == null || s.leader === false) return;
    const sh = sheetOf(content, sheet), band = bandOf(content, sh, s), pts = leaderOf(sh, band, s.leader ?? 'down');
    if (!pts) { say('FAIL', `scene ${i + 1}: leader '${s.leader ?? 'down'}' has no path from the band to the sticker; choose 'left' or 'right', or leader: false`); return; }
    const segs = leaderOverAsset(sh, pts);
    const lines = look(scenes[sheet].asset, scenes[sheet].crop).filter((f) => f.k === 'T');
    const pad = 5 / sh.scale; // the leader's case is 9 px wide
    const crossed = [];
    for (const [[x0, y0], [x1, y1]] of segs) {
      const r = [Math.min(x0, x1) - pad, Math.min(y0, y1) - pad, Math.abs(x1 - x0) + 2 * pad, Math.abs(y1 - y0) + 2 * pad];
      for (const l of lines) {
        // the band's own claim is where the leader starts: it may touch it
        const [bx, by, bw, bh] = s.band;
        if (hit([l.x, l.y, l.w, l.h], [bx, by, bw, bh])) continue;
        if (hit(r, [l.x, l.y, l.w, l.h])) crossed.push(l.text);
      }
    }
    ok(!crossed.length, `scene ${i + 1}: the leader (${s.leader ?? 'down'}) ${segs.length ? 'crosses no text on the page' : 'runs in the mount\'s margins only'}${crossed.length ? `: it crosses ${crossed.map((x) => `"${x}"`).join(', ')}` : ''}`);
  });
  if (ws >= 0 && scenes[ws].carry) {
    const sheetI = sheetIndex(scenes, ws), { region, text } = scenes[ws].carry;
    const [x, y, w, h] = region;
    const read = look(scenes[sheetI].asset, [x - 24, y - 24, w + 48, h + 48]).filter((f) => f.k === 'T' && f.x + f.w / 2 >= x - 4 && f.x + f.w / 2 <= x + w + 4);
    const got = norm(read.map((l) => l.text).join(' '));
    ok(got.includes(norm(text)), `the slip's region reads "${text}", the text its code copy sets (read: "${read.map((l) => l.text).join(' | ')}")`);
  }
}
for (const f of temps) rmSync(f, { force: true });

// ---------- the bands ----------
const log = [];
const bad = await regions({ log: (m) => log.push(m) });
for (const l of log.join('\n').split('\n').filter((x) => x.trim())) {
  const m = l.match(/^\s+(ok|FAIL)\s+(.*)$/);
  if (m) say(m[1] === 'ok' ? 'PASS' : 'FAIL', `band ${m[2]}`);
}
if (bad && !log.length) say('FAIL', 'tools/regions.mjs reported failures');

mkdirSync(join(ROOT, 'renders'), { recursive: true });
writeFileSync(join(ROOT, 'renders/check-assets.txt'), out.join('\n') + `\n\n${fails ? `${fails} FAIL` : 'all PASS'}\n`);
console.log(out.join('\n'));
console.log(fails ? `\n${fails} FAIL` : `\nall PASS (${out.length} checks)`);
process.exit(fails ? 1 : 0);
