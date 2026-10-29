#!/usr/bin/env node
// tools/check-assets.mjs — the asset check of a Scroll film: what content.js says about its real assets must be true
// of the files.
//
//   npm run assets          (node tools/check-assets.mjs .)   writes renders/check-assets.txt, exits 1 on any FAIL
//
// For every asset in content.js:
//   - a strip: the file exists, its size is the manifest's, its sha256 equals the manifest's (the film shows the source
//     as captured: crop, scale and veil only, never an edit); over 200 KB is a WARN (fine in a film, not in a template);
//     macOS Vision (tools/ocr.swift) reads it: every `expect` string is found, no `forbid` string is, and no face;
//   - frames: the folder holds `count` frames, their joined sha256 is the manifest's, the first frame's size is `size`;
//     every fourth frame is read for faces (people: 'none'); a frame listed in `reviewed` ({ file: what a person saw
//     there }) is always read and a face in it is a WARN with that reason;
//   - the sheet: every strip shares one width (one scale) and that scale, and the panel's, stay under the zoom cap (an
//     output pixel covers ≥ 0.75 source pixels);
//   - every quoted phrase is printed in its underlined lines (OCR of the marked rects, normalised), so a band never
//     says what the page does not;
//   - the accent rule: the content's mark differs from every colour inside each marked region by ΔE00 ≥ 20.
// Off macOS the reads are INFO (not checked) and the rest still runs. The OCR is a reader, not a judge: a miss is
// reported with what it did read.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FILM = resolve(process.argv[2] || resolve(HERE, '..'));
const REAL = join(FILM, 'assets/real');
const content = (await import(pathToFileURL(join(FILM, 'content.js')).href)).default;
const SH = await import(pathToFileURL(join(FILM, 'sheet.js')).href);
const PALETTES = (await import(pathToFileURL(join(FILM, 'palettes.js')).href)).default;
const { accentCheck } = await import(pathToFileURL(join(FILM, 'tools/regions.mjs')).href);

const out = [];
let fails = 0;
const say = (lvl, msg) => { out.push(`${lvl.padEnd(4)} ${msg}`); if (lvl === 'FAIL') fails++; };
const A = content.assets || {};
const canOcr = process.platform === 'darwin' && spawnSync('swift', ['--version']).status === 0;
const ocr = (file, box, faces = false) => execFileSync('swift', [join(HERE, 'ocr.swift'), file, ...(box ? box.map((v) => String(Math.round(v))) : [])], { encoding: 'utf8', maxBuffer: 1 << 24, env: { ...process.env, ...(faces ? { FACES: '1' } : {}) } })
  .split('\n').filter(Boolean).map((l) => { const [x, y, w, h, ...t] = l.split('\t'); return { face: x === 'FACE', x: +x, y: +y, w: +w, h: +h, text: t.join('\t') }; });
const norm = (s) => String(s).toLowerCase().replace(/[−–—]/g, '-').replace(/[^a-z0-9.\- ]/g, ' ').replace(/\s+/g, ' ').trim();
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const sizeOf = (file) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim().split(',').map(Number);

// ---------- files, hashes, what each strip shows ----------
for (const [id, a] of Object.entries(A)) {
  if (a.frames != null) {
    const dir = join(REAL, a.frames);
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^f\d{3}\.(webp|png|jpg)$/.test(f)).sort() : [];
    if (files.length !== a.count) { say('FAIL', `${id}: ${files.length} frames in assets/real/${a.frames}, the manifest says ${a.count}`); continue; }
    const h = sha(Buffer.concat(files.map((f) => readFileSync(join(dir, f)))));
    say(h === a.sha256 ? 'PASS' : 'FAIL', `${id}: ${files.length} frames ${h === a.sha256 ? 'unchanged' : `changed (sha256 ${h.slice(0, 12)} ≠ ${String(a.sha256).slice(0, 12)})`}`);
    const sz = sizeOf(join(dir, files[0]));
    say(sz[0] === a.size[0] && sz[1] === a.size[1] ? 'PASS' : 'FAIL', `${id}: frames are ${sz.join(' × ')} (manifest ${a.size.join(' × ')})`);
    const big = files.filter((f) => statSync(join(dir, f)).size > 200 * 1024).length;
    if (big) say('WARN', `${id}: ${big} frames over 200 KB (fine in a film; a template ships images ≤ 200 KB)`);
    if (canOcr) {
      // every fourth frame, and every frame the manifest lists as reviewed (so a waiver is always re-read)
      const rv = a.reviewed || {};
      const sample = files.filter((f, k) => k % 4 === 0 || rv[f]);
      const faces = [...new Set(sample.flatMap((f) => ocr(join(dir, f), null, true).filter((l) => l.face).map(() => f)))];
      const open = faces.filter((f) => !rv[f]), waived = faces.filter((f) => rv[f]);
      for (const f of waived) say('WARN', `${id}: the detector sees a face in ${f}; reviewed: ${rv[f]}`);
      say(open.length ? 'FAIL' : 'PASS', `${id}: ${open.length ? `faces in ${open.join(', ')}; crop people out, or look and list the frame in reviewed with what it shows` : `no unreviewed face in ${sample.length} sampled frames`}`);
    }
    continue;
  }
  const file = join(REAL, a.file || '');
  if (!a.file || !existsSync(file)) { say('FAIL', `${id}: assets/real/${a.file} missing`); continue; }
  const h = sha(readFileSync(file));
  if (!a.sha256) say('WARN', `${id}: no sha256 in the manifest (this file's is ${h})`);
  else say(h === a.sha256 ? 'PASS' : 'FAIL', `${id}: ${a.file} ${h === a.sha256 ? 'unchanged' : `changed after capture (sha256 ${h.slice(0, 12)} ≠ ${a.sha256.slice(0, 12)})`}`);
  const sz = sizeOf(file);
  if (sz[0] !== a.size?.[0] || sz[1] !== a.size?.[1]) say('FAIL', `${id}: the file is ${sz.join(' × ')}, the manifest says ${a.size?.join(' × ')}`);
  const kb = statSync(file).size / 1024;
  if (kb > 200) say('WARN', `${id}: ${kb.toFixed(0)} KB (fine in a film; a template ships images ≤ 200 KB)`);
  if (!canOcr) { say('INFO', `${id}: not read (OCR needs macOS); expect/forbid and people: 'none' stand as declared`); continue; }
  const lines = ocr(file, null, true), all = norm(lines.filter((l) => !l.face).map((l) => l.text).join(' \n '));
  for (const e of a.expect || []) say(all.includes(norm(e)) ? 'PASS' : 'FAIL', `${id}: ${all.includes(norm(e)) ? 'shows' : 'does not show'} "${e}"`);
  for (const f of a.forbid || []) say(all.includes(norm(f)) ? 'FAIL' : 'PASS', `${id}: ${all.includes(norm(f)) ? 'shows' : 'no'} "${f}"${all.includes(norm(f)) ? ', which the film must not' : ''}`);
  const faces = lines.filter((l) => l.face);
  say(faces.length ? 'FAIL' : 'PASS', `${id}: ${faces.length ? `${faces.length} face(s); crop people out` : 'no face'}`);
}

// ---------- one scale, under the cap ----------
const strips = (content.sheet || []).filter((e) => typeof e === 'string');
const k = SH.scaleOf(content);
say(k <= SH.CAP + 1e-9 ? 'PASS' : 'FAIL', `the sheet: ${strips.length} strips at ${k.toFixed(3)} output px per source px (cap ${SH.CAP.toFixed(3)})`);
for (const [id, a] of Object.entries(A)) if (a.frames != null) {
  const pk = SH.PANEL.fw / a.size[0];
  say(pk <= SH.CAP + 1e-9 ? 'PASS' : 'FAIL', `${id}: the panel shows its frames at ${pk.toFixed(3)} output px per source px (cap ${SH.CAP.toFixed(3)})`);
}

// ---------- what the bands quote is on the page ----------
if (canOcr) (content.scenes || []).forEach((s, i) => {
  if (!s.mark || !s.lines || !A[s.mark.asset]) return;
  const file = join(REAL, A[s.mark.asset].file);
  const read = norm(s.mark.rects.map((r) => ocr(file, [r[0] - 4, r[1] - 4, r[2] + 8, r[3] + 8]).map((l) => l.text).join(' ')).join(' '));
  const quoted = s.lines.flat().join(' ').split(/\s+/).map(norm).filter((w) => w.length > 2);
  const missing = quoted.filter((w) => !read.includes(w.replace(/[.\-]+$/, '')));
  say(missing.length ? 'FAIL' : 'PASS', `scene ${i + 1} (${s.type}): ${missing.length ? `quotes ${missing.map((w) => `"${w}"`).join(', ')}, not in its underlined lines (read: ${read})` : `every word of the quote is in its underlined lines`}`);
});

// ---------- the accent rule ----------
try {
  const res = await accentCheck(PALETTES, { quiet: true });
  const row = res.rows[content.palette];
  if (!row) say('FAIL', `palette "${content.palette}" is not in palettes.js`);
  else if (!Number.isFinite(row.worst.d)) say('PASS', `accent ${PALETTES[content.palette].accent}: the ${res.regions} marked regions hold no chromatic colour`);
  else say(row.ok ? 'PASS' : 'FAIL', `accent ${PALETTES[content.palette].accent} (${content.palette}): nearest colour in a marked region ΔE00 ${row.worst.d.toFixed(1)} (≥ 20), ${row.worst.where}${row.ok ? '' : '; npm run palettes lists the presets that pass'}`);
} catch (e) { say('FAIL', `accent rule not checked: ${e.message}`); }

out.push('', fails ? `FAIL: ${fails}` : 'PASS: 0 FAIL');
mkdirSync(join(FILM, 'renders'), { recursive: true });
writeFileSync(join(FILM, 'renders/check-assets.txt'), out.join('\n') + '\n');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
