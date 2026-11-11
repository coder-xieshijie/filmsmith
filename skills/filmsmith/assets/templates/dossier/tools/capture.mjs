#!/usr/bin/env node
// tools/capture.mjs — capture one real asset into assets/real/ (Node 22; the headless Chrome that hyperframes installs).
//
//   node tools/capture.mjs page <url> <out.webp|png|jpg> [--w 1280] [--h 900] [--scale 1.5] [--wait 2500]
//        [--selector css | --text "visible text" | --clip x,y,w,h] [--above 0] [--below 0] [--pad 16]
//        [--within css] [--span css] [--hide css,css] [--quality 82] [--lang en-US]
//     Screenshot a live page. --selector clips to the first matching element, --text to the element that holds the
//     text (then --above / --below extend the clip up or down in page px), --clip to a page rectangle; otherwise the
//     viewport. --within limits the --text search to an element (default body; script, style and invisible text are
//     skipped); --span widens the clip to the box of the matched element's nearest ancestor matching css (a page's
//     article column). --hide removes overlays (cookie bars, sign-in prompts) by selector before the shot.
//   node tools/capture.mjs file <url> <out>
//     Download a published image as it is (no re-encoding).
//
// Prints one JSON line to paste into content.js `assets`: { file, page, captured, how, sha256, size }. Nothing is
// edited afterwards: crops are declared in content.js and applied at draw time, so the file is the source as captured.
// Keep each file under 200 KB (CONTRACT.md: no image over 200 KB in a template); a WebP at --quality 75–85 usually is.
// Never capture a page with a person on it without cropping them out (people: the check flags faces).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const [mode, url, out, ...rest] = process.argv.slice(2);
if (!mode || !url || !out) { console.error('usage: capture.mjs page|file <url> <out> [options]'); process.exit(2); }
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];
mkdirSync(dirname(out), { recursive: true });
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const size = (file) => {
  const o = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim();
  return o.split(',').map(Number);
};
function puppeteerCore() {
  const req = createRequire(import.meta.url);
  try { return req('puppeteer-core'); } catch {}
  const base = join(homedir(), '.npm/_npx');
  for (const d of existsSync(base) ? readdirSync(base) : []) {
    const pc = join(base, d, 'node_modules/puppeteer-core/package.json');
    if (existsSync(pc) && existsSync(join(base, d, 'node_modules/hyperframes/package.json'))) return createRequire(join(base, d, 'node_modules/x.js'))('puppeteer-core');
  }
  throw new Error('puppeteer-core not found: run `npx --yes hyperframes@0.8.163 --version` once, or npm i puppeteer-core');
}
function chromePath() {
  if (process.env.CHROME) return process.env.CHROME;
  const base = join(homedir(), '.cache/puppeteer/chrome');
  for (const v of existsSync(base) ? readdirSync(base).sort().reverse() : []) {
    for (const p of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-linux64/chrome', 'chrome-win64/chrome.exe']) {
      if (existsSync(join(base, v, p))) return join(base, v, p);
    }
  }
  throw new Error('no Chrome found: set $CHROME');
}

let how = '';
if (mode === 'file') {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  how = 'downloaded as published';
} else if (mode === 'page') {
  const browser = await puppeteerCore().launch({ executablePath: chromePath(), headless: true, args: ['--hide-scrollbars', `--lang=${opt.lang || 'en-US'}`] });
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'accept-language': `${opt.lang || 'en-US'},en;q=0.9` });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.setViewport({ width: +(opt.w || 1280), height: +(opt.h || 900), deviceScaleFactor: +(opt.scale || 1.5) });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    await new Promise((r) => setTimeout(r, +(opt.wait || 2500)));
    if (opt.hide) await page.evaluate((sels) => sels.split(',').forEach((s) => document.querySelectorAll(s).forEach((e) => e.remove())), opt.hide);
    let clip = null, handle = null;
    if (opt.clip) { const [x, y, w, h] = opt.clip.split(',').map(Number); clip = { x, y, width: w, height: h }; }
    else if (opt.selector || opt.text) {
      // find the element; mark it and (with --span) its column, so the shot is taken relative to that column's box,
      // which stays right inside inner scroll containers
      const found = await page.evaluate(({ selector, text, within, span }) => {
        let el = null;
        if (selector) el = document.querySelector(selector);
        else {
          const root = document.querySelector(within || 'body');
          const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('script,style,template,noscript') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
          while (w.nextNode()) {
            if (!w.currentNode.textContent.includes(text)) continue;
            const r = w.currentNode.parentElement.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) { el = w.currentNode.parentElement; break; }
          }
        }
        if (!el) return false;
        el.scrollIntoView({ block: 'center' });
        const col = span ? el.closest(span) || el : el;
        col.setAttribute('data-capture-col', '1');
        const c = col.getBoundingClientRect(), r = el.getBoundingClientRect();
        return { y: r.top - c.top, h: r.height, w: c.width };
      }, { selector: opt.selector, text: opt.text, within: opt.within, span: opt.span });
      if (!found) throw new Error(`no element for ${opt.selector || opt.text}`);
      handle = await page.$('[data-capture-col="1"]');
      const pad = +(opt.pad ?? 16), above = +(opt.above || 0), below = +(opt.below || 0);
      const y = Math.max(0, found.y - pad - above);
      clip = { x: 0, y, width: found.w, height: found.h + 2 * pad + above + below - (found.y - pad - above < 0 ? -(found.y - pad - above) : 0) };
    }
    await new Promise((r) => setTimeout(r, 800));
    const ext = extname(out).slice(1).toLowerCase(), type = ext === 'jpg' ? 'jpeg' : ext;
    const shot = { path: out, type, ...(type !== 'png' ? { quality: +(opt.quality || 82) } : {}) };
    if (handle) await handle.screenshot({ ...shot, clip });
    else await page.screenshot({ ...shot, ...(clip ? { clip, captureBeyondViewport: true } : {}) });
    how = `node tools/capture.mjs page ${url} <out> ${rest.join(' ')} (headless Chrome, ${opt.lang || 'en-US'}, ${opt.scale || 1.5}x)`;
  } finally { await browser.close(); }
} else throw new Error(`mode ${mode}`);

const buf = readFileSync(out);
const today = new Date().toISOString().slice(0, 10);
if (buf.length > 200 * 1024) console.error(`warning: ${out} is ${(buf.length / 1024).toFixed(0)} KB; keep template assets under 200 KB (lower --quality or --scale)`);
console.log(JSON.stringify({ file: out, page: url, captured: today, how, sha256: sha(buf), size: size(out) }));
