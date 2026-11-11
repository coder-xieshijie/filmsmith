#!/usr/bin/env node
// setup-fonts.mjs <film-dir>
// Downloads the fonts listed in <film-dir>/fonts.json into <film-dir>/assets/fonts/ (with their licence files)
// and writes assets/fonts/fonts.css with one @font-face per file. Skips files already present.
// Exits 1 when any file cannot be downloaded, and then writes no fonts.css: a film must never render in a
// fallback font (lib/text.js fontsReady checks the same thing in the browser).
//
// fonts.json: [{ "family": "Inter Tight", "file": "InterTight-VF.ttf", "url": "https://...",
//               "weight": "100 900", "style": "normal", "license": "OFL-InterTight.txt", "licenseUrl": "https://..." }]
//   weight   a number, "normal" / "bold", or a range "100 900" (a variable font's wght axis); default 400
//   stretch  optional: a percentage or a range "62% 125%" (a variable font's wdth axis), or a keyword such as
//            "condensed"; written as font-stretch so canvas and CSS can ask for any width inside the range
//   style    "normal" | "italic" | "oblique" (optionally with an angle range); default normal
// A descriptor the browser would not parse drops the whole @font-face silently, so a malformed one is an error.
//
// Files from the google/fonts repository are fetched from one pinned commit, not from `main`, so a film set
// up today and one set up next year get the same font files. fonts.json may name `main`; it is rewritten to
// GOOGLE_FONTS_COMMIT here. Move the pin deliberately (and re-check the templates) when a font must update.
import { readFile, writeFile, mkdir, access, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export const GOOGLE_FONTS_COMMIT = '47d54ca1ebb14fd864695f1d39dc734f39017c33'; // google/fonts main, 2026-10-16
const RAW = 'https://raw.githubusercontent.com/google/fonts/';
export const pin = (url) => (url.startsWith(RAW + 'main/') ? RAW + GOOGLE_FONTS_COMMIT + '/' + url.slice((RAW + 'main/').length) : url);

const dir = resolve(process.argv[2] || '.');
const list = JSON.parse(await readFile(join(dir, 'fonts.json'), 'utf8'));
const out = join(dir, 'assets', 'fonts');
await mkdir(out, { recursive: true });

// Network hiccups (a reset connection, a 5xx) are retried three times with a short back-off; a 4xx is final.
const fetchRetry = async (url, tries = 4) => {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500 || i >= tries) return res;
    } catch (e) { if (i >= tries) throw e; }
    await new Promise((r) => setTimeout(r, 500 * 2 ** (i - 1)));
  }
};
const exists = (p) => access(p).then(() => true, () => false);
const get = async (url, dest) => {
  if (await exists(dest)) return false;
  const res = await fetchRetry(pin(url));
  if (!res.ok) throw new Error(`${res.status} ${pin(url)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error(`empty file ${pin(url)}`);
  await writeFile(dest + '.part', buf);
  await rename(dest + '.part', dest); // no half-written font is ever "present"
  return true;
};

const WEIGHT = /^(normal|bold|\d{1,4}( \d{1,4})?)$/;
const PCT = '\\d+(\\.\\d+)?%';
const STRETCH = new RegExp(`^(${PCT}( ${PCT})?|(ultra-|extra-|semi-)?(condensed|expanded)|normal)$`);
const STYLE = /^(normal|italic|oblique( -?\d+(\.\d+)?deg( -?\d+(\.\d+)?deg)?)?)$/;
const descriptors = (f) => {
  const weight = String(f.weight ?? 400).trim(), style = String(f.style ?? 'normal').trim();
  const bad = [];
  if (!WEIGHT.test(weight) || /\d/.test(weight) && weight.split(' ').some((w) => +w < 1 || +w > 1000)) bad.push(`weight "${weight}"`);
  if (f.stretch != null && !STRETCH.test(String(f.stretch).trim())) bad.push(`stretch "${f.stretch}"`);
  if (!STYLE.test(style)) bad.push(`style "${style}"`);
  if (bad.length) throw new Error(`fonts.json: ${bad.join(', ')} is not a valid @font-face descriptor`);
  return `font-weight: ${weight}; ${f.stretch != null ? `font-stretch: ${String(f.stretch).trim()}; ` : ''}font-style: ${style};`;
};

const faces = [], failed = [];
for (const f of list) {
  let desc;
  try {
    desc = descriptors(f);
    const got = await get(f.url, join(out, f.file));
    if (f.licenseUrl && f.license) await get(f.licenseUrl, join(out, f.license));
    console.log(`${got ? 'downloaded' : 'present   '} ${f.file}`);
  } catch (e) {
    failed.push(`${f.file}: ${e?.cause?.code ?? e.message}`);
    continue;
  }
  const fmt = f.file.endsWith('.woff2') ? 'woff2' : f.file.endsWith('.otf') ? 'opentype' : 'truetype';
  faces.push(
    `@font-face { font-family: "${f.family}"; src: url("${f.file}") format("${fmt}"); ${desc} font-display: block; }`,
  );
}
if (failed.length) {
  console.error(`font setup failed (${failed.length} of ${list.length}):\n  ${failed.join('\n  ')}\nNo fonts.css written. Fix fonts.json or the network, then run \`npm run setup\`.`);
  process.exit(1);
}
await writeFile(join(out, 'fonts.css'), faces.join('\n') + '\n');
console.log(`wrote ${join(out, 'fonts.css')} (google/fonts @ ${GOOGLE_FONTS_COMMIT.slice(0, 7)})`);
