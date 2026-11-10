#!/usr/bin/env node
// Copy the bricks a film uses into its lib/.
//   node <skill>/scripts/add-bricks.mjs <film-dir> [--ids a,b,…]
// The ids come from film.json "bricks" (or --ids, which are then written into film.json). Each brick is copied from this skill's
// assets/lib/ (the subset of keynote-video's bricks synced here) into <film-dir>/lib/ with the same layout, together with
// everything it imports or names (lib/bricks/copy.mjs), and a HyperFrames host.html for motions, scenes and props. build/assemble.cjs
// then loads them as ES modules before main.js and puts each on window.BRICKS (see main.js). Writes lib/bricks/VERSION: each
// brick with the hash of its folder. Run it again whenever film.json "bricks" changes. Exit 0 done, 1 refused or failed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = path.join(SKILL, 'assets/lib');
const argv = process.argv.slice(2);
const die = (m) => { console.error(m); process.exit(1); };
const target = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
if (!target) die('usage: node add-bricks.mjs <film-dir> [--ids a,b,…]');
const dir = path.resolve(target), filmPath = path.join(dir, 'film.json');
if (!fs.existsSync(filmPath)) die(`${filmPath} is missing: start the film with scripts/new-film.mjs`);
const film = JSON.parse(fs.readFileSync(filmPath, 'utf8'));
const i = argv.indexOf('--ids');
if (i >= 0) { film.bricks = (argv[i + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean); fs.writeFileSync(filmPath, JSON.stringify(film, null, 2) + '\n'); }
const ids = film.bricks || [];
if (!ids.length) die('no bricks: list their ids in film.json "bricks", or pass --ids');
const { copyBricks } = await import(pathToFileURL(path.join(LIB, 'bricks/copy.mjs')).href);
try {
  const r = copyBricks({ from: LIB, to: path.join(dir, 'lib'), ids });
  fs.writeFileSync(path.join(dir, 'lib/bricks/VERSION'), r.bricks.map((b) => `${b.category}/${b.id}@${b.hash}`).join('\n') + '\n');
  console.log(`lib/bricks/: ${r.bricks.map((b) => b.id).join(', ')}`);
} catch (e) { die(`${e.message} (this skill carries the bricks whose hosts include teach: assets/lib/bricks/teach.json)`); }
