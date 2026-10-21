#!/usr/bin/env node
// tools/capture.mjs — capture one real asset into assets/real/, as evidence: the file is the source as captured,
// and content.js declares the crop the film shows. Prints one JSON line for the asset's manifest entry
// ({ file, source, captured, how, sha256, size }).
//
//   node tools/capture.mjs page <url> <out.webp|png> [--w 1440] [--h 900] [--scale 2] [--selector css] [--wait 2500]
//        [--hide css,css] [--quality 90]
//     a live page in headless Chrome (en-US); --selector clips to the first match; --hide removes overlays
//   node tools/capture.mjs text <file> <out.webp|png> [--lines 1-20] [--size 22] [--width 1800] [--scale 2]
//     a text file as printed (a tool's report, a log, a table): every character as in the file, in the mono face of
//     assets/fonts, dark on paper; --lines picks a range of lines (1-based, inclusive)
//   node tools/capture.mjs file <url> <out.ext>
//     a published image downloaded as is (no re-encoding)
//
// A template's shipped example keeps every image ≤ 200 KB (CONTRACT.md): --quality and --scale trade size for zoom
// headroom (the zoom cap: output px per source px ≤ 4/3, tools/check-assets.mjs).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, extname } from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), FILM = resolve(HERE, '..');
const [mode, src, out, ...rest] = process.argv.slice(2);
if (!mode || !src || !out) { console.error('usage: capture.mjs page|text|file <url|file> <out> [options]'); process.exit(2); }
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];
mkdirSync(dirname(resolve(out)), { recursive: true });
const today = new Date().toISOString().slice(0, 10);
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

function puppeteerCore() {
  const req = createRequire(import.meta.url);
  try { return req('puppeteer-core'); } catch {}
  const base = join(homedir(), '.npm/_npx');
  for (const d of existsSync(base) ? readdirSync(base) : []) {
    const p = join(base, d, 'node_modules/puppeteer-core/package.json');
    if (existsSync(p) && existsSync(join(base, d, 'node_modules/hyperframes'))) return createRequire(join(base, d, 'node_modules/x.js'))('puppeteer-core');
  }
  throw new Error('puppeteer-core not found: run `npx --yes hyperframes@0.8.163 --version` once (it installs it), or npm i puppeteer-core');
}
function chromePath() {
  if (process.env.CHROME) return process.env.CHROME;
  const base = join(homedir(), '.cache/puppeteer/chrome');
  for (const v of existsSync(base) ? readdirSync(base).sort().reverse() : []) {
    for (const p of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-linux64/chrome', 'chrome-win64/chrome.exe']) {
      if (existsSync(join(base, v, p))) return join(base, v, p);
    }
  }
  throw new Error('no Chrome: set $CHROME (hyperframes downloads one on its first run)');
}
const type = extname(out).toLowerCase() === '.png' ? 'png' : extname(out).toLowerCase() === '.jpg' ? 'jpeg' : 'webp';
const shot = async (page, clip) => page.screenshot({ path: out, type, ...(type === 'png' ? {} : { quality: +(opt.quality || 90) }), ...(clip ? { clip } : { fullPage: false }) });

let how = '';
if (mode === 'file') {
  const res = await fetch(src, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${res.status} ${src}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  how = 'downloaded as published';
} else {
  const browser = await puppeteerCore().launch({ executablePath: chromePath(), headless: true, args: ['--hide-scrollbars', '--lang=en-US'] });
  try {
    const page = await browser.newPage();
    const scale = +(opt.scale || 2);
    if (mode === 'page') {
      await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
      await page.setViewport({ width: +(opt.w || 1440), height: +(opt.h || 900), deviceScaleFactor: scale });
      await page.goto(src, { waitUntil: 'networkidle2', timeout: 90000 });
      await new Promise((r) => setTimeout(r, +(opt.wait || 2500)));
      if (opt.hide) await page.evaluate((s) => s.split(',').forEach((q) => document.querySelectorAll(q).forEach((e) => e.remove())), opt.hide);
      let clip = null;
      if (opt.selector) {
        const el = await page.$(opt.selector);
        if (!el) throw new Error(`no element ${opt.selector}`);
        await el.scrollIntoView();
        const b = await el.boundingBox();
        clip = { x: b.x, y: b.y, width: b.width, height: b.height };
      }
      await shot(page, clip);
      how = `headless Chrome, viewport ${opt.w || 1440}×${opt.h || 900} at ${scale}×, en-US${opt.selector ? `, clipped to ${opt.selector}` : ''}`;
    } else if (mode === 'text') {
      let lines = readFileSync(src, 'utf8').replace(/\r/g, '').split('\n');
      if (opt.lines) { const [a, b] = opt.lines.split('-').map(Number); lines = lines.slice(a - 1, b ?? a); }
      const fontFile = ['IBMPlexMono-Medium.ttf', 'JetBrainsMono-VF.ttf'].map((f) => join(FILM, 'assets/fonts', f)).find(existsSync);
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const size = +(opt.size || 22);
      const cols = Math.max(...lines.map((l) => [...l].length));
      const width = +(opt.width || Math.ceil(cols * size * 0.6 + size * 3.2));
      // the face is embedded as a data URL: a page set from a string cannot load file:// fonts
      const html = `<!doctype html><meta charset="utf-8"><style>${fontFile ? `@font-face{font-family:M;src:url(data:font/ttf;base64,${readFileSync(fontFile).toString('base64')})}` : ''}
        html,body{margin:0;background:#FBFAF7}pre{margin:0;padding:${size * 1.4}px ${size * 1.6}px;font:${size}px/1.5 ${fontFile ? 'M' : 'monospace'};color:#1B1C1F;white-space:pre;width:${width}px;box-sizing:border-box}</style><pre>${esc(lines.join('\n'))}</pre>`;
      await page.setViewport({ width, height: 400, deviceScaleFactor: scale });
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const b = await (await page.$('pre')).boundingBox();
      await shot(page, { x: 0, y: 0, width, height: Math.ceil(b.height) });
      how = `text of ${src.split('/').pop()}${opt.lines ? ` lines ${opt.lines}` : ''}, as printed, set in a mono face at ${size} px, ${scale}×`;
    } else throw new Error(`unknown mode ${mode}`);
  } finally { await browser.close(); }
}
const buf = readFileSync(out);
const dims = (() => {
  // read width and height from the PNG, JPEG or WebP header
  if (buf.readUInt32BE(0) === 0x89504e47) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 12, 16) === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 12, 16) === 'VP8L') { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 12, 16) === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  for (let i = 2; i < buf.length;) { const m = buf[i + 1], len = buf.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc3) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)]; i += 2 + len; }
  return [0, 0];
})();
console.log(JSON.stringify({ file: out.split('/').pop(), source: src, captured: today, how, sha256: sha(buf), size: dims, bytes: buf.length }));
