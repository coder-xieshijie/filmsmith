#!/usr/bin/env node
// tools/capture.mjs — capture one real asset into assets/real/, as evidence. Prints one JSON line for the asset's
// manifest entry in content.js ({ file, size, kind, source, captured, how, sha256, … }); paste it and add the claim.
//
//   node tools/capture.mjs frame <film.mp4> <seconds> <out.webp|png> [--crop x,y,w,h] [--quality 0.9] [--max-kb 200]
//     one frame of a rendered film, decoded by ffmpeg at that time, optionally cropped to the part the film shows,
//     encoded once (webp or png). The manifest keeps the film's name and the time, so tools/check-assets.mjs can
//     decode it again and compare (--films <dir>).
//   node tools/capture.mjs page <url> <out.webp|png> [--w 1280] [--h 1600] [--scale 2] [--selector css]
//        [--until css] [--wait 1500] [--quality 0.9] [--max-kb 200]
//     a live page in headless Chrome, logged out, en-US, light; --selector clips to the first match (from its top),
//     --until ends the clip at the bottom of the first match of another selector (a page's first image, say)
//   node tools/capture.mjs image <render.png> <out.webp|png> [--quality 0.9] [--max-kb 200]
//     a still the product itself rendered (a snapshot of a template at a given time, say), encoded once; write down
//     in the manifest's `how` the command that rendered it and what was changed, so it can be rendered again
//
// A template's shipped example keeps every image ≤ 200 KB (CONTRACT.md): the quality steps down until it fits
// (--max-kb), and the result says which quality it took. The film never edits an asset: it only crops it to its pane
// and scales it within the zoom cap (4/3 output px per source px).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve, extname, basename } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2), mode = argv[0];
const pos = [], opt = {};
for (let i = 1; i < argv.length; i++) { if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i]; else pos.push(argv[i]); }
const usage = 'usage: capture.mjs frame <film.mp4> <seconds> <out> [--crop x,y,w,h] | page <url> <out> [options]';
if (!['frame', 'page', 'image'].includes(mode)) { console.error(usage); process.exit(2); }
const today = new Date().toISOString().slice(0, 10);
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const maxKb = Number(opt['max-kb'] ?? 200);

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
const browser = await puppeteerCore().launch({ executablePath: chromePath(), headless: true, args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();

// encode a PNG buffer (or the page's own pixels) once, as webp or png, stepping the webp quality down to fit max-kb
const encode = async (png, out) => {
  if (extname(out).toLowerCase() === '.png') return { buf: png, quality: null };
  await page.setContent('<canvas id="c"></canvas>');
  let q = Number(opt.quality ?? 0.9), r;
  for (;;) {
    r = await page.evaluate(async (b64, q) => {
      const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
      const c = document.getElementById('c'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return { url: c.toDataURL('image/webp', q), w: c.width, h: c.height };
    }, png.toString('base64'), q);
    const buf = Buffer.from(r.url.split(',')[1], 'base64');
    if (buf.length / 1024 <= maxKb || q <= 0.5) return { buf, quality: q };
    q = Math.round((q - 0.05) * 100) / 100;
  }
};

let entry;
if (mode === 'image') {
  const [src, out] = pos;
  if (!src || !out) { console.error(usage); process.exit(2); }
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const { buf, quality } = await encode(readFileSync(src), out);
  writeFileSync(out, buf);
  const size = await page.evaluate(async (u) => { const i = new Image(); i.src = u; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }, `data:image/${extname(out).slice(1)};base64,${buf.toString('base64')}`);
  entry = { file: basename(out), size, kind: 'render', captured: today, how: `tools/capture.mjs image: ${basename(src)} encoded once${quality ? ` (webp ${quality})` : ''}`, sha256: sha(buf) };
} else if (mode === 'frame') {
  const [film, at, out] = pos;
  if (!film || !at || !out) { console.error(usage); process.exit(2); }
  const dir = mkdtempSync(join(tmpdir(), 'split-frame-'));
  const crop = opt.crop ? opt.crop.split(',').map(Number) : null;
  const tmp = join(dir, 'f.png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(at), '-i', film, '-frames:v', '1', ...(crop ? ['-vf', `crop=${crop[2]}:${crop[3]}:${crop[0]}:${crop[1]}`] : []), tmp]);
  const png = readFileSync(tmp); rmSync(dir, { recursive: true, force: true });
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const { buf, quality } = await encode(png, out);
  writeFileSync(out, buf);
  const size = await page.evaluate(async (u) => { const i = new Image(); i.src = u; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }, `data:image/${extname(out).slice(1)};base64,${buf.toString('base64')}`);
  entry = {
    file: basename(out), size, kind: 'frame',
    from: { film: basename(film), at: Number(at), ...(crop ? { crop } : {}) },
    captured: today, how: `tools/capture.mjs frame: ffmpeg -ss ${at}${crop ? `, crop ${crop.join(',')}` : ''}, encoded once${quality ? ` (webp ${quality})` : ''}`,
    sha256: sha(buf),
  };
} else {
  const [url, out] = pos;
  if (!url || !out) { console.error(usage); process.exit(2); }
  await page.setViewport({ width: +(opt.w ?? 1280), height: +(opt.h ?? 1600), deviceScaleFactor: +(opt.scale ?? 2) });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(async () => { for (const img of document.images) { img.loading = 'eager'; if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; }); } });
  await new Promise((r) => setTimeout(r, +(opt.wait ?? 1500)));
  let clip;
  if (opt.selector) {
    clip = await page.evaluate((sel, until) => {
      const el = document.querySelector(sel); if (!el) return null;
      const r = el.getBoundingClientRect(), y0 = r.top + scrollY;
      let y1 = r.bottom + scrollY;
      if (until) { const u = el.querySelector(until) || document.querySelector(until); if (u) { const b = u.getBoundingClientRect(); y1 = b.bottom + scrollY + 16; } }
      return { x: r.left, y: y0, width: r.width, height: y1 - y0 };
    }, opt.selector, opt.until ?? null);
    if (!clip) throw new Error(`no element matches ${opt.selector}`);
  }
  const png = Buffer.from(await page.screenshot({ type: 'png', ...(clip ? { clip, captureBeyondViewport: true } : {}) }));
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const { buf, quality } = await encode(png, out);
  writeFileSync(out, buf);
  const size = await page.evaluate(async (u) => { const i = new Image(); i.src = u; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }, `data:image/${extname(out).slice(1)};base64,${buf.toString('base64')}`);
  entry = {
    file: basename(out), size, kind: 'page', source: url.replace(/^https?:\/\//, ''),
    captured: today, how: `tools/capture.mjs page: headless Chrome, ${opt.w ?? 1280} css px wide, ${opt.scale ?? 2}×, logged out, en-US${opt.selector ? `, ${opt.selector}${opt.until ? ` to ${opt.until}` : ''}` : ''}${quality ? `, webp ${quality}` : ''}`,
    sha256: sha(buf),
  };
}
await browser.close();
console.log(JSON.stringify(entry));
