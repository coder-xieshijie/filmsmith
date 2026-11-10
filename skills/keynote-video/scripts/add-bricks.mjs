#!/usr/bin/env node
// add-bricks.mjs <film-dir> [--ids a,b,…]
// Copies the bricks a composed film uses into its lib/bricks/: the ids in the Brick column of PLAN.md's composition
// table (or --ids), each with everything it imports or names (assets/runtime/bricks/copy.mjs), plus the bricks/ root
// files every brick runs on. Ids of the runtime's own hand-offs and transitions are skipped: lib/ already holds them.
// Writes the copied bricks and their hashes into lib/VERSION (line `bricks …`). Run it after filling the composition
// table and again whenever the table changes; a brick no longer listed stays until lib/bricks/ is removed and the
// script run again. new-film.mjs copies the runtime without bricks/ and calls this only with --bricks, so a standard-mode
// film's lib/ has no bricks/ folder.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runtime = join(root, 'assets', 'runtime');
const { copyBricks, runtimeNames } = await import(pathToFileURL(join(runtime, 'bricks', 'copy.mjs')).href);

// Brick ids in PLAN.md's "## Composition table": the first `code` span of the Brick column of each row
export const planIds = (plan) => {
  const sec = plan.match(/^## Composition table[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? '';
  const rows = sec.split('\n').filter((l) => /^\s*\|/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
  if (!rows.length) return [];
  const col = rows[0].findIndex((h) => /^brick$/i.test(h));
  if (col < 0) throw new Error('PLAN.md composition table has no "Brick" column');
  return [...new Set(rows.slice(1).filter((r) => !/^-+$/.test(r[col] ?? '')).map((r) => (r[col] ?? '').match(/`([a-z0-9-]+)`/)?.[1]).filter(Boolean))];
};

// lib/VERSION: one `bricks …` line listing each copied brick with its hash (replaced on every run)
export const stampBricks = (lib, bricks) => {
  const f = join(lib, 'VERSION');
  const lines = existsSync(f) ? readFileSync(f, 'utf8').split('\n').filter((l) => l && !l.startsWith('bricks ')) : [];
  lines.push(`bricks ${bricks.length ? bricks.map((b) => `${b.category}/${b.id}@${b.hash}`).join(' ') : 'none'} (sha256 of each brick folder at copy time)`);
  writeFileSync(f, lines.join('\n') + '\n');
};

export const addBricks = (dest, ids) => {
  const lib = join(dest, 'lib');
  const own = runtimeNames(runtime);
  const wanted = ids.filter((id) => !own.has(id));
  const r = copyBricks({ from: runtime, to: lib, ids: wanted, runtime: false });
  stampBricks(lib, r.bricks);
  return r;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [target, ...rest] = process.argv.slice(2);
  if (!target) { console.error('usage: add-bricks.mjs <film-dir> [--ids a,b,…]'); process.exit(2); }
  const dest = resolve(target);
  if (!existsSync(join(dest, 'lib', 'VERSION'))) { console.error(`${dest} has no lib/VERSION: make the film with new-film.mjs first`); process.exit(2); }
  const ii = rest.indexOf('--ids');
  let ids;
  if (ii >= 0) ids = (rest[ii + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  else {
    const plan = join(dest, 'PLAN.md');
    if (!existsSync(plan)) { console.error(`${plan} is missing`); process.exit(2); }
    ids = planIds(readFileSync(plan, 'utf8'));
  }
  if (!ids.length) { console.error('no brick ids: fill the Brick column of PLAN.md\'s composition table, or pass --ids'); process.exit(2); }
  try {
    const r = addBricks(dest, ids);
    console.log(`lib/bricks/: ${r.bricks.length} bricks (${r.bricks.map((b) => b.id).join(', ')}); lib/VERSION updated`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
