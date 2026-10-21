#!/usr/bin/env node
// tools/frames.mjs — extract the frames an unfold scene plays: a span of a film, at a frame rate, scaled to the
// panel's width, as numbered webp files (f001.webp …). Only cut and scaled; prints the manifest entry for content.js.
//
//   node tools/frames.mjs <film.mp4> <out-dir> --from 11.9 --to 15.3 [--fps 12] [--width 1216] [--quality 70]
//
// Needs ffmpeg; webp is written by ffmpeg when it has libwebp, else by cwebp (from libwebp), else as png.
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const [src, out, ...rest] = process.argv.slice(2);
if (!src || !out) { console.error('usage: frames.mjs <film> <out-dir> --from s --to s [--fps 12] [--width 1216] [--quality 70]'); process.exit(2); }
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];
const from = +opt.from, to = +opt.to, fps = +(opt.fps || 12), w = +(opt.width || 1216), q = +(opt.quality || 70);
if (!(to > from)) { console.error('--from and --to: the span in seconds'); process.exit(2); }
mkdirSync(out, { recursive: true });
const vf = `fps=${fps},scale=${w}:-2:flags=lanczos`;
const hasWebp = String(spawnSync('ffmpeg', ['-hide_banner', '-encoders']).stdout).includes('libwebp');
const hasCwebp = spawnSync('cwebp', ['-version']).status === 0;
if (hasWebp) execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(from), '-i', src, '-t', String(to - from), '-vf', vf, '-c:v', 'libwebp', '-quality', String(q), join(out, 'f%03d.webp')]);
else {
  const tmp = join(tmpdir(), `frames-${process.pid}`);
  mkdirSync(tmp, { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(from), '-i', src, '-t', String(to - from), '-vf', vf, join(tmp, 'f%03d.png')]);
  for (const f of readdirSync(tmp).sort()) {
    if (hasCwebp) execFileSync('cwebp', ['-quiet', '-q', String(q), '-m', '6', join(tmp, f), '-o', join(out, f.replace('.png', '.webp'))]);
    else execFileSync('cp', [join(tmp, f), join(out, f)]);
  }
  rmSync(tmp, { recursive: true, force: true });
}
const files = readdirSync(out).filter((f) => /^f\d{3}\.(webp|png)$/.test(f)).sort();
const sha = createHash('sha256').update(Buffer.concat(files.map((f) => readFileSync(join(out, f))))).digest('hex');
const size = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', join(out, files[0])], { encoding: 'utf8' }).trim().split(',').map(Number);
const big = files.filter((f) => statSync(join(out, f)).size > 200 * 1024).length;
console.log(JSON.stringify({ frames: out.split('/').pop(), count: files.length, fps, size, from, sha256: sha, ...(big ? { note: `${big} frames over 200 KB` } : {}) }));
