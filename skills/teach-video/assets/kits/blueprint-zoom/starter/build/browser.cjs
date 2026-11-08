// Headless Chrome for the checks that open the page directly (page checks, sound-cue collection, contact
// sheets, and the skill's scripts/geo-check.cjs). Both halves come from the HyperFrames engine pinned in
// hf.cjs, so the checks see the page with the same browser the render uses:
//   - Chrome: `hyperframes browser ensure` downloads it once into the engine's cache, `browser path` prints it.
//     CHROME_PATH overrides it.
//   - puppeteer-core: the copy the engine itself depends on, found in npm's npx cache next to the pinned
//     hyperframes package. A puppeteer-core or puppeteer installed in the project (or on NODE_PATH) wins.
//   const { launch } = require('./browser.cjs'); const browser = await launch({ args: [...] });
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const hf = require('./hf.cjs');

let pptr = null, exe = null;

function npxCache() {
  try { return path.join(cp.execSync('npm config get cache', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(), '_npx'); } catch (_) { return null; }
}

function findPuppeteer(from) {
  for (const name of ['puppeteer-core', 'puppeteer']) {
    try { return require(require.resolve(name, { paths: [from || process.cwd(), __dirname] })); } catch (_) {}
  }
  const scan = () => {
    const base = npxCache();
    for (const d of base && fs.existsSync(base) ? fs.readdirSync(base) : []) {
      const pkg = path.join(base, d, 'node_modules/hyperframes/package.json');
      const pc = path.join(base, d, 'node_modules/puppeteer-core');
      try { if (JSON.parse(fs.readFileSync(pkg, 'utf8')).version === hf.VERSION && fs.existsSync(pc)) return require(pc); } catch (_) {}
    }
    return null;
  };
  let p = scan();
  if (!p) { hf.run(['--version']); p = scan(); }   // first use: let npx install the pinned engine, then look again
  if (!p) throw new Error(`puppeteer-core not found: neither in the project nor beside hyperframes@${hf.VERSION} in the npx cache (${npxCache()}). Run \`npx --yes hyperframes@${hf.VERSION} --version\`, or \`npm i -D puppeteer-core\` in the project.`);
  return p;
}

function chromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const last = (r) => (r.stdout || '').trim().split('\n').pop().trim();
  let p = last(hf.run(['browser', 'path']));
  if (!p || !fs.existsSync(p)) {
    const r = hf.run(['browser', 'ensure']);
    if (r.status !== 0) throw new Error(`hyperframes browser ensure failed: ${(r.stderr || r.stdout || '').trim().split('\n').slice(-4).join(' | ')}`);
    p = last(hf.run(['browser', 'path']));
  }
  if (!p || !fs.existsSync(p)) throw new Error('no Chrome: `hyperframes browser path` printed nothing usable; set CHROME_PATH');
  return p;
}

async function launch(opts = {}) {
  pptr = pptr || findPuppeteer(opts.from);
  exe = exe || chromePath();
  return pptr.launch({ headless: /headless[-_]shell/.test(exe) ? 'shell' : true, executablePath: exe, args: opts.args || [] });
}

module.exports = { launch, chromePath, findPuppeteer };
