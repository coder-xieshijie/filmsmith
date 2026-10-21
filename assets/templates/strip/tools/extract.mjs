#!/usr/bin/env node
// tools/extract.mjs — take a film's frames for the strip from its video, reproducibly, and print its manifest entry
// for content.js `films` (TEMPLATE.md, "Films"). Only ffmpeg decodes and scales (lanczos); nothing changes a pixel's
// content. Stored as WebP when `cwebp` is on PATH (smaller), else JPEG (ffmpeg's own encoder).
//
//   node tools/extract.mjs <id> <video> --name <Name> --frame <s> [--full] [--run <from>:<to>] [--source "<line>"]
//
//   --frame <s>     the frame that stands in the gate (a settled frame, not mid-transition). Stored 1280 px wide
//                   (the gate shows it 832 wide: 0.65 px per source px), or 1920 with --full: a frame a `punch`
//                   scene punches to the full frame needs the full size (the zoom cap is 4/3)
//   row             always: the frames at the middle of every 4 s block of the film (a partial last block at its
//                   own middle), each 192 × 108, side by side: the contact sheet's row, cut at the measured length
//   --run a:b       every frame from a to b seconds, 1920 wide, into <id>-run/: the film running after a pick.
//                   Start it on one of the row's times (the pencil rings that cell)
//   tracks          the film's sound in the second around --frame as 208 RMS values, into assets/real/tracks.js
//                   (the optical track beside the frame in the gate)
//
// Prints the entry with every file's sha256 and the measured duration; paste it into content.js. `npm run assets`
// then checks the files against it, and decodes the same instants again from `video` when that file is present.
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const FILM = resolve(dirname(fileURLToPath(import.meta.url)), '..'), REAL = join(FILM, 'assets/real');
const argv = process.argv.slice(2);
const [id, video] = argv;
const opt = (k, d = null) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; };
if (!id || !video || !opt('--frame')) { console.error('usage: extract.mjs <id> <video> --name <Name> --frame <s> [--full] [--run a:b] [--source "<line>"]'); process.exit(2); }
if (!existsSync(video)) { console.error(`no video: ${video}`); process.exit(2); }

const STEP = 4, THUMB = [192, 108];
const webp = spawnSync('cwebp', ['-version']).status === 0;
const ext = webp ? 'webp' : 'jpg';
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { maxBuffer: 1 << 28 });
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
const TMP = join(tmpdir(), `strip-extract-${process.pid}`); mkdirSync(TMP, { recursive: true });
// decode and scale to a lossless PNG, then store
const store = (png, out, q) => {
  if (webp) execFileSync('cwebp', ['-quiet', '-q', String(q), '-m', '6', png, '-o', out]);
  else ff('-i', png, '-q:v', '3', out);
  rmSync(png);
};
const grab = (t, w, out, q = 80) => { const png = join(TMP, 'f.png'); ff('-ss', t.toFixed(3), '-i', video, '-frames:v', '1', '-vf', `scale=${w}:-2:flags=lanczos`, png); store(png, out, q); };

mkdirSync(REAL, { recursive: true });
const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], { encoding: 'utf8' }).trim();
const at = +opt('--frame');
const frameFile = `${id}-frame.${ext}`;
grab(at, argv.includes('--full') ? 1920 : 1280, join(REAL, frameFile), argv.includes('--full') ? 85 : 80);

const times = [];
for (let k = 0; k * STEP < dur - 1e-6; k++) times.push(+Math.min(k * STEP + STEP / 2, (k * STEP + dur) / 2).toFixed(3));
times.forEach((t, k) => ff('-ss', t.toFixed(3), '-i', video, '-frames:v', '1', '-vf', `scale=${THUMB[0]}:${THUMB[1]}:flags=lanczos`, join(TMP, `r${String(k).padStart(2, '0')}.png`)));
const rowFile = `${id}-row.${ext}`;
ff('-i', join(TMP, 'r%02d.png'), '-vf', `tile=${times.length}x1`, '-frames:v', '1', join(TMP, 'row.png'));
store(join(TMP, 'row.png'), join(REAL, rowFile), 90);

let run = null;
if (opt('--run')) {
  const [a, b] = opt('--run').split(':').map(Number), fps = 30;
  const dir = `${id}-run`; rmSync(join(REAL, dir), { recursive: true, force: true }); mkdirSync(join(REAL, dir));
  ff('-ss', a.toFixed(3), '-t', (b - a + 0.5 / fps).toFixed(4), '-i', video, '-vf', `fps=${fps},scale=1920:-2:flags=lanczos`, '-start_number', '0', join(TMP, 'run-%02d.png'));
  const files = readdirSync(TMP).filter((f) => f.startsWith('run-')).sort();
  for (const f of files) store(join(TMP, f), join(REAL, dir, f.slice(4).replace('.png', `.${ext}`)), 85);
  const h = createHash('sha256'); for (const f of readdirSync(join(REAL, dir)).sort()) h.update(readFileSync(join(REAL, dir, f)));
  run = { dir, ext, from: a, fps, frames: files.length, sha256: h.digest('hex') };
}

// the sound in the second around the gate frame: 208 RMS values (mono, 8 kHz) → assets/real/tracks.js
const env = (() => {
  const a = Math.max(0, at - 0.5);
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-ss', a.toFixed(3), '-t', '1', '-i', video, '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], { maxBuffer: 1 << 24 });
  const x = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4), n = 208, out = [];
  for (let i = 0; i < n; i++) { let p = 0, m = 0; for (let k = Math.floor((i * x.length) / n); k < Math.floor(((i + 1) * x.length) / n); k++) { p += x[k] * x[k]; m++; } out.push(+Math.sqrt(p / Math.max(1, m)).toFixed(3)); }
  return out;
})();
const tracksFile = join(REAL, 'tracks.js');
const tracks = existsSync(tracksFile) ? (await import(pathToFileURL(tracksFile).href + `?${Date.now()}`)).default : {};
tracks[id] = env;
writeFileSync(tracksFile, `// tracks.js — each film's sound in the second around its gate frame (208 RMS values), written by tools/extract.mjs;\n// the optical track beside the frame is drawn from it.\nexport default ${JSON.stringify(tracks)};\n`);
rmSync(TMP, { recursive: true, force: true });

const entry = {
  name: opt('--name', id), video: basename(video), duration: +dur.toFixed(3),
  source: opt('--source', basename(video)),
  frame: { file: frameFile, at, sha256: sha(join(REAL, frameFile)) },
  row: { file: rowFile, times, sha256: sha(join(REAL, rowFile)) },
  ...(run ? { run } : {}),
};
console.log(`${id}: ${JSON.stringify(entry)},`);
