#!/usr/bin/env node
// tools/check-assets.mjs — the asset check of a Strip film: what content.js says about its frames must be true of the
// files.
//
//   npm run assets            (node tools/check-assets.mjs .)                 writes renders/check-assets.txt
//   node tools/check-assets.mjs . --videos <dir>                              also decode every frame again
//
// For every film in content.js `films`:
//   - each file exists and its sha256 equals the manifest's (the run: its frames in name order); an image over
//     200 KB is a WARN (fine in a film, not in a template);
//   - the lengths: the row has one cell per 4 s block of `duration`, the last one partial; the row file is 192 px a
//     cell by 108; when the film's `video` is at hand (beside content.js, in assets/video/ or in --videos), ffprobe's
//     duration equals `duration` (± 2 ms);
//   - the frame re-decode, when the video is at hand: the gate frame, every row cell and five frames of the run are
//     decoded again at their instants and compared (PSNR of the luma; ≥ 35 dB for frames, ≥ 30 dB for 96 × 54 cells:
//     compression loss only). Without the video it is an INFO, and the hashes stand for what was extracted;
//   - the zoom cap: no frame drawn larger than 4/3 output px per source px (the gate, the punch, the run, the sheet);
// For every capture: the hash; macOS Vision (tools/ocr.swift) reads the crop: every `expect` string found, no `forbid`
// string, no face (people: 'none'); off macOS those reads are INFO.
// The accent rule: the palette's pencil differs from every colour inside the ringed cell by ΔE00 ≥ 20.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const FILM = resolve(argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--videos') || resolve(HERE, '..'));
const VIDEOS = argv.includes('--videos') ? resolve(argv[argv.indexOf('--videos') + 1]) : null;
const REAL = join(FILM, 'assets/real');
const content = (await import(pathToFileURL(join(FILM, 'content.js')).href)).default;
const PALETTES = (await import(pathToFileURL(join(FILM, 'palettes.js')).href)).default;
const { accentCheck } = await import(pathToFileURL(join(FILM, 'tools/regions.mjs')).href);

const out = [];
let fails = 0;
const say = (lvl, msg) => { out.push(`${lvl.padEnd(4)} ${msg}`); if (lvl === 'FAIL') fails++; };
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
const shaDir = (d, ext) => { const h = createHash('sha256'); for (const f of readdirSync(d).filter((x) => x.endsWith(`.${ext}`)).sort()) h.update(readFileSync(join(d, f))); return h.digest('hex'); };
const size = (f) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim().split(',').map(Number);
const gray = (args, w, h, pre = '') => execFileSync('ffmpeg', ['-v', 'error', ...args, '-vf', `${pre}scale=${w}:${h}:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
const psnr = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; } const mse = s / a.length; return mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse); };
const videoOf = (f) => (f.video ? [join(FILM, f.video), join(FILM, 'assets/video', f.video), VIDEOS && join(VIDEOS, f.video)].filter(Boolean).find((p) => existsSync(p)) ?? null : null);
const bigWarn = (id, file) => { const kb = statSync(file).size / 1024; if (kb > 200) say('WARN', `${id}: ${file.split('/').pop()} ${kb.toFixed(0)} KB (fine in a film; a template ships images ≤ 200 KB)`); };
const hashed = (id, file, want) => {
  if (!existsSync(file)) { say('FAIL', `${id}: ${file.slice(FILM.length + 1)} missing`); return false; }
  const d = sha(file);
  if (!want) say('WARN', `${id}: no sha256 in the manifest (this file's is ${d})`);
  else if (d !== want) say('FAIL', `${id}: ${file.split('/').pop()} sha256 ${d.slice(0, 12)} differs from the manifest's ${want.slice(0, 12)} (the file changed after extraction)`);
  else say('PASS', `${id}: ${file.split('/').pop()} unchanged (sha256 ${d.slice(0, 12)})`);
  bigWarn(id, file);
  return true;
};

const CAP = 4 / 3, GATE_W = 832;
const zoom = (what, k) => say(k <= CAP + 1e-9 ? 'PASS' : 'FAIL', `zoom: ${what} at ${k.toFixed(3)} output px per source px (cap ${CAP.toFixed(3)})${k > CAP + 1e-9 ? '; extract it larger (tools/extract.mjs --full)' : ''}`);
const scenes = content.scenes || [];
const punchI = scenes.findIndex((s) => s.type === 'punch');
const punched = punchI > 0 && scenes[punchI - 1]?.type === 'frames' ? (scenes[punchI - 1].films?.length ? scenes[punchI - 1].films : Object.keys(content.films || {})).at(-1) : null;
const pick = scenes.find((s) => s.type === 'pick');
let decoded = 0;

for (const [id, f] of Object.entries(content.films || {})) {
  const frameFile = join(REAL, f.frame?.file || ''), rowFile = join(REAL, f.row?.file || '');
  const okF = hashed(id, frameFile, f.frame?.sha256), okR = hashed(id, rowFile, f.row?.sha256);
  let runDir = null;
  if (f.run) {
    runDir = join(REAL, f.run.dir);
    if (!existsSync(runDir)) say('FAIL', `${id}: run ${f.run.dir}/ missing`);
    else {
      const n = readdirSync(runDir).filter((x) => x.endsWith(`.${f.run.ext ?? 'webp'}`)).length, d = shaDir(runDir, f.run.ext ?? 'webp');
      say(n === f.run.frames ? 'PASS' : 'FAIL', `${id}: run of ${n} frames (manifest ${f.run.frames}, ${((f.run.frames - 1) / f.run.fps).toFixed(2)} s at ${f.run.fps} fps)`);
      say(d === f.run.sha256 ? 'PASS' : 'FAIL', `${id}: run ${d === f.run.sha256 ? 'unchanged' : 'changed after extraction'} (sha256 ${d.slice(0, 12)})`);
      for (const x of readdirSync(runDir)) bigWarn(`${id} run`, join(runDir, x));
    }
  }
  // lengths
  const blocks = Math.ceil(f.duration / 4 - 1e-6), times = f.row?.times || [];
  say(times.length === blocks ? 'PASS' : 'FAIL', `${id}: row of ${times.length} cells for ${f.duration} s (${blocks} blocks of 4 s; the last ${(f.duration - 4 * (blocks - 1)).toFixed(2)} s)`);
  if (okR) { const [w, h] = size(rowFile); say(w === 192 * times.length && h === 108 ? 'PASS' : 'FAIL', `${id}: row file ${w} × ${h} (${times.length} cells of 192 × 108)`); }
  const mid = times.every((t, k) => Math.abs(t - Math.min(4 * k + 2, (4 * k + f.duration) / 2)) < 0.002);
  say(mid ? 'PASS' : 'FAIL', `${id}: row cells at the middle of each 4 s block (${times.join(', ')})`);
  // zoom cap
  if (okF) {
    const [fw] = size(frameFile);
    zoom(`${id}'s frame in the gate (${fw} px wide)`, GATE_W / fw);
    if (id === punched) zoom(`${id}'s frame punched to the full frame`, 1920 / fw);
  }
  if (runDir && existsSync(runDir)) { const first = readdirSync(runDir).sort()[0]; zoom(`${id}'s run at full size`, 1920 / size(join(runDir, first))[0]); }
  // the re-decode
  const video = videoOf(f);
  if (!video) { say('INFO', `${id}: ${f.video ?? '(no video)'} not at hand; frames not decoded again (the hashes stand for the extraction)`); continue; }
  decoded++;
  const d = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], { encoding: 'utf8' }).trim();
  say(Math.abs(d - f.duration) < 0.002 ? 'PASS' : 'FAIL', `${id}: ${f.video} measures ${d.toFixed(3)} s (manifest ${f.duration})`);
  if (okF) {
    const p = psnr(gray(['-i', frameFile], 320, 180), gray(['-ss', f.frame.at.toFixed(3), '-i', video, '-frames:v', '1'], 320, 180));
    say(p >= 35 ? 'PASS' : 'FAIL', `${id}: the gate frame is ${f.video} at ${f.frame.at} s (PSNR ${p.toFixed(1)} dB)`);
  }
  if (okR) {
    let worst = 99;
    times.forEach((t, k) => { worst = Math.min(worst, psnr(gray(['-i', rowFile], 96, 54, `crop=192:108:${k * 192}:0,`), gray(['-ss', t.toFixed(3), '-i', video, '-frames:v', '1'], 96, 54))); });
    say(worst >= 30 ? 'PASS' : 'FAIL', `${id}: every row cell is its instant (worst PSNR ${worst.toFixed(1)} dB)`);
  }
  if (runDir && existsSync(runDir)) {
    const files = readdirSync(runDir).filter((x) => x.endsWith(`.${f.run.ext ?? 'webp'}`)).sort();
    let worst = 99;
    for (const i of [0, 0.25, 0.5, 0.75, 1].map((u) => Math.round(u * (files.length - 1)))) {
      worst = Math.min(worst, psnr(gray(['-i', join(runDir, files[i])], 320, 180), gray(['-ss', (f.run.from + i / f.run.fps).toFixed(4), '-i', video, '-frames:v', '1'], 320, 180)));
    }
    say(worst >= 35 ? 'PASS' : 'FAIL', `${id}: the run is ${f.video} from ${f.run.from} s (five frames, worst PSNR ${worst.toFixed(1)} dB)`);
  }
}
zoom('row cells on the sheet (192 px shown 96)', 96 / 192);
if (pick) zoom('the ringed cell while it punches (gate-punch draws the row cell up to the cap, then the full frame)', CAP);
if (!decoded) say('INFO', 'no video at hand: put the films beside content.js, in assets/video/, or pass --videos <dir> to decode every frame again');

// ---------- captures ----------
const canOcr = process.platform === 'darwin' && spawnSync('swift', ['--version']).status === 0;
const ocr = (file, box, faces = false) => execFileSync('swift', [join(HERE, 'ocr.swift'), file, ...(box ? box.map((v) => String(Math.round(v))) : [])], { encoding: 'utf8', maxBuffer: 1 << 24, env: { ...process.env, ...(faces ? { FACES: '1' } : {}) } })
  .split('\n').filter(Boolean).map((l) => { const [x, y, w, h, ...t] = l.split('\t'); return { face: x === 'FACE', x: +x, y: +y, w: +w, h: +h, text: t.join('\t') }; });
const norm = (s) => String(s).replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
for (const [id, c] of Object.entries(content.captures || {})) {
  const file = join(REAL, c.file || '');
  if (!hashed(`capture ${id}`, file, c.sha256)) continue;
  if (!c.source) say('FAIL', `capture ${id}: no source`);
  zoom(`capture ${id} covering the gate`, GATE_W / Math.min(c.crop[2], (c.crop[3] * 16) / 9));
  if (!canOcr) { say('INFO', `capture ${id}: not read (OCR needs macOS); expect/forbid and people: 'none' stand as declared`); continue; }
  const lines = ocr(file, c.crop, true);
  const all = norm(lines.filter((l) => !l.face).map((l) => l.text).join(' '));
  for (const e of c.expect || []) say(all.includes(norm(e)) ? 'PASS' : 'FAIL', `capture ${id}: ${all.includes(norm(e)) ? 'shows' : 'does not show'} "${e}"`);
  for (const f of c.forbid || []) say(all.includes(norm(f)) ? 'FAIL' : 'PASS', `capture ${id}: ${all.includes(norm(f)) ? 'shows' : 'no'} "${f}"`);
  const faces = lines.filter((l) => l.face);
  say(faces.length ? 'FAIL' : 'PASS', faces.length ? `capture ${id}: ${faces.length} face(s); crop people out (people: 'none')` : `capture ${id}: no face in the crop`);
}

// ---------- the accent rule ----------
try {
  const res = await accentCheck(PALETTES, { quiet: true });
  const row = res.rows[content.palette];
  if (!row) say('FAIL', `palette "${content.palette}" is not in palettes.js`);
  else if (!Number.isFinite(row.worst.d)) say('PASS', `accent ${PALETTES[content.palette].accent}: the ringed cell holds no chromatic colour`);
  else say(row.ok ? 'PASS' : 'FAIL', `accent ${PALETTES[content.palette].accent} (${content.palette}): nearest colour in the ringed cell ΔE00 ${row.worst.d.toFixed(1)} (≥ 20)${row.ok ? '' : '; npm run palettes lists the presets that pass'}`);
} catch (e) { say('FAIL', `accent rule not checked: ${e.message}`); }

out.push('', fails ? `FAIL: ${fails}` : 'PASS: 0 FAIL');
mkdirSync(join(FILM, 'renders'), { recursive: true });
writeFileSync(join(FILM, 'renders/check-assets.txt'), out.join('\n') + '\n');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
