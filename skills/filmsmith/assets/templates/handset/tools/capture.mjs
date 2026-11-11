#!/usr/bin/env node
// tools/capture.mjs — capture one real asset for content.js `assets`, in headless Chrome, unedited.
//
//   node tools/capture.mjs <url> <out.webp|out.png|out.jpg> [--w 1280] [--h 800] [--scale 1.5] [--quality 72]
//        [--selector css]            clip to this element's box (its full height, or the --from/--to span inside it)
//        [--from "text"] [--to "text"]  vertical span: from the top of the first element containing --from to the
//                                    bottom of the first element after it containing --to (inside --selector)
//        [--height cssPx]               a span this tall from its top (instead of --to)
//        [--pad 16] [--wait 3000] [--hide css,css] [--hideText "text"] [--probe css]
//
// The page is opened at the viewport size (en-US), scrolled through once so lazy images load, and the clip is saved
// exactly as the browser rendered it: no browser chrome, nothing drawn on. Overlays a reader would dismiss go first:
// --hide removes elements by selector, --hideText the outermost fixed or sticky box containing that text (a cookie
// bar). A clip to the part of a page that carries the claim keeps everything else (sidebars, avatars, account rows,
// unrelated names) out of the file, not only out of the frame. --probe prints the boxes of matching elements in the
// saved file's pixels, so content.js regions can be measured instead of guessed.
// Prints one JSON line: { file, url, captured, sha256, bytes, size: [w, h], scale, probes } — paste it into content.js.
// Needs puppeteer-core and a Chrome: the copy hyperframes downloads on its first run (`npx hyperframes` once), or $CHROME.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';

const [url, out, ...rest] = process.argv.slice(2);
if (!url || !out) { console.error('usage: capture.mjs <url> <out.webp|png|jpg> [options]'); process.exit(2); }
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];
mkdirSync(dirname(out), { recursive: true });

const puppeteerCore = () => {
  const req = createRequire(import.meta.url);
  try { return req('puppeteer-core'); } catch {}
  const base = join(homedir(), '.npm/_npx');
  for (const d of existsSync(base) ? readdirSync(base) : []) {
    if (existsSync(join(base, d, 'node_modules/puppeteer-core/package.json'))) return createRequire(join(base, d, 'node_modules/x.js'))('puppeteer-core');
  }
  throw new Error('puppeteer-core not found: run `npx --yes hyperframes@0.8.163 --version` once, or npm i puppeteer-core');
};
const chromePath = () => {
  if (process.env.CHROME) return process.env.CHROME;
  const base = join(homedir(), '.cache/puppeteer/chrome');
  for (const v of existsSync(base) ? readdirSync(base).sort().reverse() : []) {
    for (const p of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-linux64/chrome', 'chrome-win64/chrome.exe']) {
      if (existsSync(join(base, v, p))) return join(base, v, p);
    }
  }
  throw new Error('no Chrome found: set $CHROME');
};

const W = +(opt.w || 1280), H = +(opt.h || 800), S = +(opt.scale || 1.5), pad = +(opt.pad ?? 16);
const type = out.endsWith('.png') ? 'png' : out.endsWith('.jpg') || out.endsWith('.jpeg') ? 'jpeg' : 'webp';
const browser = await puppeteerCore().launch({ executablePath: chromePath(), headless: true, args: ['--hide-scrollbars', '--lang=en-US'] });
let clip = null, probes = [];
try {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
  await page.setViewport({ width: W, height: H, deviceScaleFactor: S });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise((r) => setTimeout(r, +(opt.wait || 3000)));
  const full = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < full; y += 500) { await page.evaluate((v) => window.scrollTo(0, v), y); await new Promise((r) => setTimeout(r, 120)); }
  await page.evaluate(() => window.scrollTo(0, 0)); await new Promise((r) => setTimeout(r, 1200));
  if (opt.hide) await page.evaluate((s) => s.split(',').forEach((q) => document.querySelectorAll(q).forEach((e) => e.remove())), opt.hide);
  if (opt.hideText) await page.evaluate((t) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.textContent.includes(t)) {
      let e = w.currentNode.parentElement, hit = null;
      for (; e && e !== document.body; e = e.parentElement) if (/fixed|sticky/.test(getComputedStyle(e).position)) hit = e;
      if (hit) hit.remove();
    }
  }, opt.hideText);
  clip = await page.evaluate(({ selector, from, to, height, pad }) => {
    const root = selector ? document.querySelector(selector) : document.body;
    if (!root) return { error: `no element for ${selector}` };
    const r = root.getBoundingClientRect(), sx = window.scrollX, sy = window.scrollY;
    let top = r.top + sy, bottom = r.bottom + sy;
    const find = (text, after) => {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) if (w.currentNode.textContent.includes(text)) {
        const e = w.currentNode.parentElement, b = e.getBoundingClientRect();
        if (after == null || b.top + sy >= after) return { top: b.top + sy, bottom: b.bottom + sy };
      }
      return null;
    };
    if (from) { const f = find(from); if (!f) return { error: `no text "${from}"` }; top = f.top; }
    if (to) { const t = find(to, top + 1); if (!t) return { error: `no text "${to}"` }; bottom = t.bottom; }
    if (height) bottom = top + height;
    return { x: Math.max(0, r.left + sx - pad), y: Math.max(0, top - pad), width: r.width + 2 * pad, height: bottom - top + 2 * pad };
  }, { selector: opt.selector, from: opt.from, to: opt.to, height: opt.height ? +opt.height : 0, pad });
  if (clip.error) throw new Error(clip.error);
  for (const k of ['x', 'y', 'width', 'height']) clip[k] = Math.round(clip[k]);
  if (opt.probe) probes = await page.evaluate((q, c, s) => [...document.querySelectorAll(q)].map((e) => {
    const b = e.getBoundingClientRect();
    return { text: (e.innerText || e.alt || '').replace(/\s+/g, ' ').slice(0, 60), box: [(b.left + scrollX - c.x) * s, (b.top + scrollY - c.y) * s, b.width * s, b.height * s].map(Math.round) };
  }).filter((p) => p.box[1] + p.box[3] > 0 && p.box[1] < c.height * s && p.box[0] < c.width * s), opt.probe, clip, S);
  await page.screenshot({ path: out, clip, captureBeyondViewport: true, type, ...(type !== 'png' ? { quality: +(opt.quality || 72) } : {}) });
} finally {
  await browser.close();
}
const buf = readFileSync(out);
console.log(JSON.stringify({ file: out, url, captured: new Date().toISOString().slice(0, 10), sha256: createHash('sha256').update(buf).digest('hex'), bytes: statSync(out).size, size: [Math.round(clip.width * S), Math.round(clip.height * S)], scale: S, probes }));
