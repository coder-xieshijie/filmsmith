#!/usr/bin/env node
// bloom-bake.mjs <film-dir> — runs the ink bloom's fluid simulation (inkflow.js) once for the film's seed and writes
// the ink to assets/bloom/field.inkz (gzip, about 6 MB) with assets/bloom/field.json. The browser only loads and
// shades it, so a frame stays a pure function of its time and no page waits on the solve (a few seconds).
// Skips the work when field.json already matches the seed and inkflow.js's VERSION. The package scripts run it before
// check, snapshot and render; run it by hand with `npm run bloom`.
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = resolve(process.argv[2] || '.');
const { simulate, VERSION } = await import(pathToFileURL(join(dir, 'inkflow.js')));
const content = (await import(pathToFileURL(join(dir, 'content.js')))).default;
const seed = content.seed ?? 1;
const meta = join(dir, 'assets', 'bloom', 'field.json');
const have = JSON.parse(await readFile(meta, 'utf8').catch(() => 'null'));
if (have && have.version === VERSION && have.seed === seed) process.exit(0);

const t0 = Date.now();
const F = simulate({ seed });
await mkdir(join(dir, 'assets', 'bloom'), { recursive: true });
const bin = join(dir, 'assets', 'bloom', 'field.inkz');
await writeFile(bin + '.part', gzipSync(F.data, { level: 6 }));
await rename(bin + '.part', bin);
const { data, ...info } = F;
await writeFile(meta, JSON.stringify(info, null, 2) + '\n');
console.log(`bloom: simulated seed ${seed} in ${((Date.now() - t0) / 1000).toFixed(1)} s → assets/bloom/field.inkz`);
