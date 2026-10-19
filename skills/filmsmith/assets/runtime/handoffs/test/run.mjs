#!/usr/bin/env node
// run.mjs — serve the runtime folder, open handoffs/test/selftest.html in headless Chrome, print the results.
// Needs puppeteer-core (any install; the HyperFrames CLI brings one into the npx cache) and a Chrome
// (CHROME=/path, else the system Google Chrome, else puppeteer's cache). Exit 1 when a check fails.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));   // runtime/

const findPuppeteer = async () => {
  try { return await import('puppeteer-core'); } catch {}
  const npx = join(homedir(), '.npm', '_npx');
  if (existsSync(npx)) for (const d of await readdir(npx)) {
    const p = join(npx, d, 'node_modules', 'puppeteer-core', 'lib', 'puppeteer', 'puppeteer-core.js');
    if (existsSync(p)) return import(pathToFileURL(p).href);
  }
  throw new Error('puppeteer-core not found (npm i puppeteer-core, or run `npx hyperframes` once)');
};
const findChrome = async () => {
  if (process.env.CHROME) return process.env.CHROME;
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (existsSync(mac)) return mac;
  for (const p of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) if (existsSync(p)) return p;
  throw new Error('no Chrome found; set CHROME=/path/to/chrome');
};

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!path.startsWith(root)) throw new Error('outside');
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const port = server.address().port;

const pptr = (await findPuppeteer()).default;
const browser = await pptr.launch({ executablePath: await findChrome(), headless: true, args: ['--force-color-profile=srgb'], protocolTimeout: 900000 });
let ok = false;
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/handoffs/test/selftest.html`);
  await page.waitForFunction('window.__selftest', { timeout: 900000, polling: 500 });
  const r = await page.evaluate(() => window.__selftest);
  console.log('case                         p=0 max  p=1 max  pure  blur pure  drawn %  1/300 chg  299/300 chg  end px/fr  ms/frame');
  const pct = (n) => `${((100 * n) / (1920 * 1080)).toFixed(2)} %`;
  for (const x of r.results) {
    if (x.error) { console.log(`${x.name.padEnd(28)} ERROR ${x.error}`); continue; }
    console.log(`${x.name.padEnd(28)} ${String(x.p0).padStart(7)}  ${String(x.p1).padStart(7)}  ${x.pure ? 'yes ' : 'NO  '}  ${x.blurPure ? 'yes      ' : 'NO       '}  ${pct(x.drawn).padStart(7)}  ${pct(x.near0).padStart(9)}  ${pct(x.near1).padStart(11)}  ${x.endSpeed.toFixed(2).padStart(9)}  ${String(x.ms).padStart(8)}  ${x.pass ? 'PASS' : 'FAIL'}`);
  }
  ok = r.pass;
  console.log(ok ? 'PASS' : 'FAIL');
} finally {
  await browser.close();
  server.close();
}
process.exit(ok ? 0 : 1);
