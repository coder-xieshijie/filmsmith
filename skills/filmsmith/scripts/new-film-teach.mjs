#!/usr/bin/env node
// Start a film project from a style kit.
//   node <skill>/scripts/new-film.mjs <film-dir> [--kit terminal-ledger]
// Copies the kit's starter into <film-dir> (which must not exist or be empty), records in film.json where the skill is ("skill") and which
// kit it came from ("kit"), points "shared" at the kit's demo assets so the demo segments run until `npm run init` replaces them, and
// fetches the pinned GSAP into vendor/. Next: `npm run init -- --shared <your shared-assets dir> --segments "…" --title "…"` inside <film-dir>.
// Exit 0 done, 1 refused or failed.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const target = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const kitName = opt('kit', 'terminal-ledger');
const die = (m) => { console.error(m); process.exit(1); };
if (!target) die('usage: node new-film.mjs <film-dir> [--kit terminal-ledger]');
const kit = path.join(SKILL, 'assets/kits', kitName);
const starter = path.join(kit, 'starter');
if (!fs.existsSync(path.join(starter, 'package.json'))) die(`no kit "${kitName}" (kits: ${fs.readdirSync(path.join(SKILL, 'assets/kits')).filter((d) => fs.existsSync(path.join(SKILL, 'assets/kits', d, 'starter'))).join(', ')})`);
const dir = path.resolve(target);
if (fs.existsSync(dir) && fs.readdirSync(dir).length) die(`${dir} exists and is not empty: give a new folder`);

// Generated and downloaded things stay behind; everything else is the starter
const SKIP = new Set(['build/reports', 'build/shots', 'vendor', 'assets', 'renders', 'index.html', 'sfx.json', '.geo-check.json', '.review-packet', '.hyperframes', 'node_modules']);
const copy = (rel) => {
  const src = path.join(starter, rel), dst = path.join(dir, rel);
  if (SKIP.has(rel)) return;
  if (fs.statSync(src).isDirectory()) { fs.mkdirSync(dst, { recursive: true }); for (const f of fs.readdirSync(src)) copy(path.join(rel, f)); }
  else fs.copyFileSync(src, dst);
};
fs.mkdirSync(dir, { recursive: true });
for (const f of fs.readdirSync(starter)) copy(f);

const filmPath = path.join(dir, 'film.json');
const film = JSON.parse(fs.readFileSync(filmPath, 'utf8'));
const demo = path.join(kit, 'demo-shared');
const out = { ...film, shared: fs.existsSync(demo) ? demo : film.shared, skill: SKILL, kit: kitName };
fs.writeFileSync(filmPath, JSON.stringify(out, null, 2) + '\n');

const v = spawnSync('node', [path.join(dir, 'build/vendor.cjs'), dir], { stdio: 'inherit' });
if (v.status !== 0) die('could not fetch GSAP (network?): run `node build/vendor.cjs` in the project later; every build command also retries it');
console.log(`new film ${dir} from kit ${kitName}.
Next, inside it:
  npm run init -- --shared <shared-assets dir> --segments "<id>:<first>-<last>,…" --title "<film title>"`);
