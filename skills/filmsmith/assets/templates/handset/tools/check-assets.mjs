#!/usr/bin/env node
// tools/check-assets.mjs — the real-asset gate of a Handset film (npm run assets; `npm run film` runs it first).
// Reads content.js `assets` (the manifest) and the scenes, and checks, for every asset:
//   file      the file exists, its sha256 equals the manifest's (the file is the capture, unedited), its pixel size
//             equals `size`, and it is at most 200 KB (a template ships no larger image; a film may raise --max-kb)
//   people    the manifest says what was checked for faces, avatars and account names (`people`)
//   private   the public region lies inside the image and outside every `private` rect; every view the film shows
//             stays inside the public region, so nothing private is ever on screen
//   zoom      every view is at most 1 / 0.75 output px per source px (the zoom cap: no interpolated pixels)
//   accent    the palette's accent differs from every colour filling ≥ 2 % of each ringed region by ΔE00 ≥ 20
//   numbers   every digit run in the copy of a scene appears in the `reads` of the region that scene lights (a number on
//             the margin is backed by the same number on the evidence); dashes and minus signs compare as one
//   reads     where macOS Vision is available (tools/ocr.swift), each region's `reads` is read back from the image inside
//             its box; elsewhere this line is a WARN ("not verified"), never a silent pass
// Prints PASS / WARN / FAIL lines, writes renders/check-assets.txt, exits 1 on any FAIL.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), FILM = resolve(HERE, '..');
const imp = async (f) => (await import(pathToFileURL(join(FILM, f)).href)).default;
const content = await imp('content.js'), rules = await imp('timing.rules.js'), PALETTES = await imp('palettes.js');
const { fit } = await import(pathToFileURL(join(FILM, 'lib/timing.js')).href);
const { plan, deviceOf, publicOf, validate, CAP } = await import(pathToFileURL(join(FILM, 'choreo.js')).href);
const { ringReport } = await import(pathToFileURL(join(HERE, 'rings.mjs')).href);
const maxKb = Number(process.argv[process.argv.indexOf('--max-kb') + 1]) || 200;

const out = []; let fails = 0;
const say = (l, m) => { out.push(`${l.padEnd(4)} ${m}`); if (l === 'FAIL') fails++; };
const norm = (x) => String(x).replace(/[–—−‒]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
const inside = (r, P) => r[0] >= P[0] - 0.5 && r[1] >= P[1] - 0.5 && r[0] + r[2] <= P[0] + P[2] + 0.5 && r[1] + r[3] <= P[1] + P[3] + 0.5;
const overlap = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

const v = validate(content);
for (const e of v) say('FAIL', `content.js: ${e}`);
if (v.length) { finish(); }

// ---------------------------------------------------------------- per asset
const ocrOk = process.platform === 'darwin' && spawnSync('swift', ['--version'], { stdio: 'ignore' }).status === 0;
for (const [id, A] of Object.entries(content.assets)) {
  const f = join(FILM, A.file);
  if (!existsSync(f)) { say('FAIL', `${id}: ${A.file} missing`); continue; }
  const buf = readFileSync(f), sha = createHash('sha256').update(buf).digest('hex');
  say(sha === A.sha256 ? 'PASS' : 'FAIL', `${id}: sha256 ${sha.slice(0, 12)} ${sha === A.sha256 ? 'equals the manifest' : `differs from the manifest's ${String(A.sha256).slice(0, 12)}`}`);
  const kb = statSync(f).size / 1024;
  say(kb <= maxKb ? 'PASS' : 'FAIL', `${id}: ${kb.toFixed(0)} KB (at most ${maxKb})`);
  const pr = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim().split(',').map(Number);
  say(pr[0] === A.size[0] && pr[1] === A.size[1] ? 'PASS' : 'FAIL', `${id}: ${pr.join(' × ')} px (manifest ${A.size.join(' × ')})`);
  say(typeof A.people === 'string' && A.people.trim() ? 'PASS' : 'FAIL', `${id}: people — ${A.people ?? 'not stated'}`);
  const P = publicOf(A);
  for (const pv of A.private ?? []) say(overlap(P, pv) ? 'FAIL' : 'PASS', `${id}: private [${pv.join(', ')}] ${overlap(P, pv) ? 'overlaps' : 'is outside'} the public region`);
  for (const [rn, R] of Object.entries(A.regions ?? {})) {
    if (!R.reads) continue;
    if (!ocrOk) { say('WARN', `${id}.${rn}: "${R.reads}" not verified (no OCR on this machine; check the box by eye)`); continue; }
    const [x, y, w, h] = R.box, pad = 10;
    const box = [Math.max(0, x - pad), Math.max(0, y - pad), Math.min(A.size[0], x + w + pad) - Math.max(0, x - pad), Math.min(A.size[1], y + h + pad) - Math.max(0, y - pad)].map(Math.round);
    const txt = norm(execFileSync('swift', [join(HERE, 'ocr.swift'), f, ...box.map(String)], { encoding: 'utf8' }).split('\n').map((l) => l.split('\t').slice(4).join(' ')).join(' '));
    const want = norm(R.reads);
    // OCR confuses a capital I with a lower-case l: compare letters with l read as i too (digits are compared as they are)
    const loose = (x) => x.replace(/[^a-z0-9.%-]/g, '').replace(/l/g, 'i');
    const ok = txt.includes(want) || loose(txt).includes(loose(want));
    say(ok ? 'PASS' : 'FAIL', `${id}.${rn}: OCR inside the box reads "${R.reads}"${ok ? '' : ` — read "${txt.slice(0, 80)}"`}`);
  }
}

// ---------------------------------------------------------------- views, numbers
const T = fit(content, rules), D = deviceOf(content);
const S = plan(content, T.scenes, T.beat, T.bar);
const seen = new Set();
S.forEach((x, i) => {
  const A = content.assets[x.asset], P = publicOf(A), vw = x.view, rect = [vw.x, vw.y, vw.w, vw.h], key = `${x.asset}:${rect.map(Math.round)}`;
  if (seen.has(key)) return; seen.add(key);
  say(inside(rect, P) ? 'PASS' : 'FAIL', `scene ${i + 1} ${x.type}: view [${rect.map((n) => Math.round(n)).join(', ')}] of ${x.asset} ${inside(rect, P) ? 'inside' : 'OUTSIDE'} the public region`);
  for (const pv of A.private ?? []) if (overlap(rect, pv)) say('FAIL', `scene ${i + 1} ${x.type}: view overlaps private [${pv.join(', ')}]`);
  say(vw.k <= CAP + 1e-9 ? 'PASS' : 'FAIL', `scene ${i + 1} ${x.type}: ${vw.k.toFixed(3)} output px per source px (1 output px = ${(1 / vw.k).toFixed(2)} source px; cap ${CAP.toFixed(3)})`);
  // a capture made for a wider screen (a desktop page on the phone) shows its text as texture: capture for this screen
  if (vw.k < 0.5) say('WARN', `scene ${i + 1} ${x.type}: ${x.asset} shows at ${vw.k.toFixed(2)} output px per source px on the ${content.device ?? 'laptop'} screen (${D.screen.w} px wide): its evidence is texture at this size; capture it at this screen's width (TEMPLATE.md, Form variant)`);
});
content.scenes.forEach((s, i) => {
  const A = content.assets[s.asset];
  const states = s.rows ? s.rows.map((r) => ({ ...r })) : [s];
  for (const st of states) {
    const texts = [st.value, st.line, st.lead, st.note].filter(Boolean);
    const backing = st.region ? [A.regions[st.region]?.reads ?? ''] : Object.values(A.regions ?? {}).map((r) => r.reads ?? '');
    for (const tx of texts) for (const run of norm(tx).match(/-?\d[\d.,]*/g) ?? []) {
      const ok = backing.some((b) => norm(b).includes(run));
      say(ok ? 'PASS' : 'FAIL', `scene ${i + 1} ${s.type}: "${tx}" — ${run} ${ok ? 'is on the evidence' : `is not in ${st.region ? `${s.asset}.${st.region}` : s.asset} reads`}`);
    }
  }
});

// ---------------------------------------------------------------- the accent against the ringed regions
for (const r of (await ringReport(content, PALETTES)).filter((r) => r.preset === content.palette)) {
  say(r.ok ? 'PASS' : 'FAIL', `ring ${r.region}: accent ${PALETTES[r.preset].accent} vs ${r.worst} ΔE00 ${r.min.toFixed(1)} (at least 20)`);
}
finish();

function finish() {
  mkdirSync(join(FILM, 'renders'), { recursive: true });
  writeFileSync(join(FILM, 'renders/check-assets.txt'), out.join('\n') + `\n${fails ? `${fails} FAIL` : 'all PASS'}\n`);
  console.log(out.join('\n'));
  console.log(fails ? `${fails} FAIL` : 'check-assets: PASS');
  process.exit(fails ? 1 : 0);
}
