#!/usr/bin/env node
// run.mjs [--gl swiftshader|gpu] — serve this folder, open test/selftest.html in headless Chrome, print the results.
// Needs puppeteer-core (any install; the HyperFrames CLI brings one into the npx cache) and a Chrome
// (CHROME=/path, else the system Google Chrome, else puppeteer's cache). Exit 1 when a check fails.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const gl = process.argv.includes('--gl') ? process.argv[process.argv.indexOf('--gl') + 1] : 'swiftshader';

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
const args = gl === 'gpu' ? ['--use-angle=metal', '--enable-gpu'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const browser = await pptr.launch({ executablePath: await findChrome(), headless: true, args, protocolTimeout: 900000 });
let ok = false;
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  if (process.argv.includes('--verbose')) page.on('console', (m) => console.error('page:', m.text()));
  else page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') console.error('page:', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/test/selftest.html`);
  await page.waitForFunction('window.__selftest', { timeout: 600000, polling: 500 });
  const r = await page.evaluate(() => window.__selftest);
  console.log(`renderer: ${r.renderer}`);
  console.log('name              p=0 max  p=1 max  frame 1/300: changed (max)  frame 299/300: off (max)  pure  ms/frame');
  const pct = (d) => `${((100 * d.bad) / (1920 * 1080)).toFixed(2)} %`.padStart(8);
  for (const x of r.results) {
    if (x.error) { console.log(`${x.name.padEnd(17)} ERROR ${x.error.split('\n')[0]}`); continue; }
    console.log(`${x.name.padEnd(17)} ${String(x.p0.max).padStart(7)}  ${String(x.p1.max).padStart(7)}  ${pct(x.near0)} (${String(x.near0.max).padStart(3)})        ${pct(x.near1)} (${String(x.near1.max).padStart(3)})         ${x.pure ? 'yes ' : 'NO  '}  ${String(x.ms).padStart(8)}  ${x.pass ? 'PASS' : 'FAIL'}`);
  }
  ok = r.pass;
  console.log(ok ? 'PASS' : 'FAIL');
} finally {
  await browser.close();
  server.close();
}
process.exit(ok ? 0 : 1);
