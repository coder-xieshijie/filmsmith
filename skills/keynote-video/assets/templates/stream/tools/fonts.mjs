#!/usr/bin/env node
// tools/fonts.mjs <film-dir> — fonts for the film's language (the language variant of lib/setup-fonts.mjs).
//
// fonts.json is the CONTRACT's list with two extra fields:
//   "lang": "zh"     the entry is used only when content.lang is that language (no field: every language)
//   "subset": true   after download, the file is cut down to the characters the film uses (content.js plus the
//                    template's fixed glyphs), so a 17.8 MB CJK font becomes a few hundred KB. Needs fontTools
//                    (run through `uvx --from fonttools pyftsubset`); the full file is kept next to it, not used.
// Then it checks glyph coverage: every character of content.js must be in the font stack of the language (DM Sans,
// then the CJK face), otherwise it exits 1 — a missing glyph would fall back to a system font and the film would
// look different on another machine. Finally it writes assets/fonts/fonts.css and stamps <html lang> in index.html.
//
// scripts/new-film.mjs runs this file instead of lib/setup-fonts.mjs when a template ships it. It is to be merged into
// the shared runtime (setup-fonts.mjs with a lang argument) once a second template sets Chinese. Files from
// google/fonts are fetched from the same pinned commit as lib/setup-fonts.mjs. fontTools runs through `uvx` (uv):
// required for Chinese (the subset); for English the coverage check is skipped with a warning when uvx is missing.

import { readFile, writeFile, mkdir, access, rename, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const GOOGLE_FONTS_COMMIT = '47d54ca1ebb14fd864695f1d39dc734f39017c33';
const RAW = 'https://raw.githubusercontent.com/google/fonts/';
const pin = (url) => (url.startsWith(RAW + 'main/') ? RAW + GOOGLE_FONTS_COMMIT + '/' + url.slice((RAW + 'main/').length) : url);
// glyphs the template draws besides the copy (window controls, separators, the ellipsis)
const FIXED_ALL = ' 0123456789·—×!?…→.,:;\'"“”‘’()%-+/';
const FIXED_ZH = '（）、，。：；？！「」';

const dir = resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || '.');
const DROP = process.argv.includes('--drop-source'); // delete the full CJK file after subsetting (a later run downloads it again)
const content = (await import(pathToFileURL(join(dir, 'content.js')).href)).default;
const lang = content.lang === 'zh' ? 'zh' : 'en';
const FIXED = FIXED_ALL + (lang === 'zh' ? FIXED_ZH : '');
const list = JSON.parse(await readFile(join(dir, 'fonts.json'), 'utf8')).filter((f) => !f.lang || f.lang === lang);
const out = join(dir, 'assets', 'fonts');
await mkdir(out, { recursive: true });

const exists = (p) => access(p).then(() => true, () => false);
const get = async (url, dest) => {
  if (await exists(dest)) return false;
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(pin(url));
      if (!res.ok) throw new Error(`${res.status} ${pin(url)}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error('empty file');
      await writeFile(dest + '.part', buf); await rename(dest + '.part', dest);
      return true;
    } catch (e) { if (i >= 4) throw e; await new Promise((r) => setTimeout(r, 500 * 2 ** i)); }
  }
};

// every string in content.js
const strings = [];
const walk = (v) => { if (typeof v === 'string') strings.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
walk(content);
const chars = [...new Set([...strings.join(''), ...FIXED])].filter((c) => c.trim() || c === ' ').join('');

const py = (code, ...args) => spawnSync('uvx', ['--quiet', '--from', 'fonttools', 'python', '-c', code, ...args], { encoding: 'utf8' });
const haveUvx = spawnSync('uvx', ['--version'], { stdio: 'ignore' }).status === 0;
if (!haveUvx && list.some((f) => f.subset)) { console.error('ERROR fonts: the Chinese face is cut to the film\'s characters with fontTools through `uvx`; install uv (https://docs.astral.sh/uv/) and run again'); process.exit(1); }
const faces = [], failed = [], used = [];
for (const f of list) {
  try {
    const got = await get(f.url, join(out, f.file));
    if (f.licenseUrl && f.license) await get(f.licenseUrl, join(out, f.license));
    let file = f.file;
    if (f.subset) {
      file = f.file.replace(/\.(ttf|otf)$/, '.subset.$1');
      await writeFile(join(out, 'subset-chars.txt'), chars);
      const r = spawnSync('uvx', ['--quiet', '--from', 'fonttools', 'pyftsubset', join(out, f.file), `--text-file=${join(out, 'subset-chars.txt')}`, `--output-file=${join(out, file)}`, '--layout-features=*', '--no-hinting'], { encoding: 'utf8' });
      if (r.status !== 0) throw new Error(`pyftsubset: ${r.stderr || r.error}`);
      await rm(join(out, 'subset-chars.txt'), { force: true });
      if (DROP) await rm(join(out, f.file), { force: true }); // the full file is only needed to cut a new subset
    }
    used.push(join(out, file));
    console.log(`${got ? 'downloaded' : 'present   '} ${f.file}${f.subset ? ` → ${file} (${[...chars].length} characters)` : ''}`);
    faces.push(`@font-face { font-family: "${f.family}"; src: url("./${file}") format("${file.endsWith('.otf') ? 'opentype' : 'truetype'}"); font-weight: ${f.weight ?? 400}; font-style: ${f.style ?? 'normal'}; font-display: block; }`);
  } catch (e) { failed.push(`${f.file}: ${e.message}`); }
}
if (failed.length) { console.error('ERROR fonts:\n  ' + failed.join('\n  ')); process.exit(1); }

// coverage: every character of the copy in the language's font stack
const need = [...new Set(strings.join('') + FIXED)].filter((c) => c.trim());
const r = !haveUvx ? null : py(`import sys,json
from fontTools.ttLib import TTFont
cm=set()
for p in sys.argv[2:]:
    cm|=set(TTFont(p).getBestCmap().keys())
need=json.loads(sys.argv[1])
print(json.dumps([c for c in need if ord(c) not in cm]))`, JSON.stringify(need), ...used);
if (!r) console.warn('WARN coverage check skipped: uvx (fontTools) not found; install uv to check every character of content.js against the font');
else {
  if (r.status !== 0) { console.error('ERROR coverage check: ' + (r.stderr || r.error)); process.exit(1); }
  const missing = JSON.parse(r.stdout.trim() || '[]');
  if (missing.length) { console.error(`ERROR glyphs missing from the ${lang} font stack: ${missing.join(' ')} — rewrite the copy or add a font`); process.exit(1); }
  console.log(`coverage: ${need.length} characters, all in the ${lang} font stack`);
}

await writeFile(join(out, 'fonts.css'), faces.join('\n') + '\n');
const html = join(dir, 'index.html');
const src = await readFile(html, 'utf8');
const next = src.replace(/<html lang="[^"]*">/, `<html lang="${lang === 'zh' ? 'zh-Hans' : 'en'}">`);
if (next !== src) await writeFile(html, next);
console.log(`wrote assets/fonts/fonts.css; <html lang="${lang === 'zh' ? 'zh-Hans' : 'en'}">`);
