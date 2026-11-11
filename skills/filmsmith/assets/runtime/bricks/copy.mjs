// copy.mjs — copy a set of bricks, with everything they import, from one runtime folder to another (Node only).
//
//   import { copyBricks } from '<runtime>/bricks/copy.mjs';
//   const r = copyBricks({ from: '<skill>/assets/runtime', to: '<film>/lib', ids: ['card-portal', 'perch-lockup'] });
//   // r.bricks: [{ id, category, hash }]; r.files: every file written, relative to `to`
//
// `from` and `to` are runtime roots (the folder holding bricks/, handoffs/, transitions/ ...). A brick is its whole
// folder bricks/<category>/<id>/ (code, brick.json, CARD.md), plus a host.html written from bricks/host-template.html
// for motions, scenes and props. What a brick needs is followed to the end: its relative imports (another brick's
// file brings that brick's folder; a runtime file comes alone), the ids in its `needs: { motions, props }` and in
// literal createBrick('<id>') calls. The bricks/ root files every brick runs on come along (index.js, lang.js,
// sample.js, the neutral look, sample-copy.js, look-palettes.js, NOTICE.md and the licence). Ids that are the runtime's
// own hand-offs or frame-level transitions are left alone: they are part of the runtime. An id passed in a parameter
// (on-threes' inner brick, quad-montage's specs) cannot be seen here: list it too.
//
// opts.runtime: false copies only the bricks/ part (a film whose lib/ already holds the runtime); true (default) also
// copies the runtime files outside bricks/ that the bricks import.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

export const CATEGORIES = ['motion', 'scene', 'prop', 'look', 'sound', 'arc'];
const ROOT_FILES = ['index.js', 'lang.js', 'sample.js', 'ease.js', 'time.js', 'dom.js', 'sample-copy.js', 'look-palettes.js', 'host-template.html', 'copy.mjs', 'NOTICE.md', 'LICENSE-video-shotcraft'];
const posix = (p) => p.split(sep).join('/');

// relative specifiers a JS file imports: static `import … from '…'`, `import '…'`, `export … from '…'`, and import('…') with a literal
export const importsOf = (src) => [...src.matchAll(/(?:^|[\s;])(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|(?:^|[\s;])import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/gm)]
  .map((m) => m[1] || m[2] || m[3]).filter((s) => s.startsWith('.'));
// ids a brick names in code: needs.motions / needs.props lists and createBrick('<id>' …)
export const namedIds = (src) => {
  const ids = new Set();
  for (const m of src.matchAll(/needs\s*:\s*\{([^}]*)\}/g)) for (const k of m[1].matchAll(/(?:motions|props)\s*:\s*\[([^\]]*)\]/g)) for (const q of k[1].matchAll(/['"]([a-z0-9-]+)['"]/g)) ids.add(q[1]);
  for (const m of src.matchAll(/createBrick\(\s*['"]([a-z0-9-]+)['"]/g)) ids.add(m[1]);
  return [...ids];
};

// { '<id>': '<category>' } for every brick folder under <runtime>/bricks
export const brickMap = (runtime) => {
  const out = {};
  for (const c of CATEGORIES) {
    const d = join(runtime, 'bricks', c);
    if (existsSync(d)) for (const id of readdirSync(d)) if (existsSync(join(d, id, 'brick.json'))) out[id] = c;
  }
  return out;
};

// the runtime's own module names: hand-offs and frame-level transitions (`name: '<id>'` in their files)
export const runtimeNames = (runtime) => {
  const out = new Set();
  for (const d of ['handoffs', 'transitions']) {
    const dir = join(runtime, d);
    if (existsSync(dir)) for (const f of readdirSync(dir).filter((x) => x.endsWith('.js'))) for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/\bname:\s*'([a-z0-9-]+)'/g)) out.add(m[1]);
  }
  return out;
};

// What copying `ids` takes: { bricks: ['<category>/<id>'], files: [runtime-relative paths outside brick folders], unknown: [ids] }
export const closure = ({ from, ids, runtimeIds = runtimeNames(from) }) => {
  from = resolve(from);
  const map = brickMap(from), bricks = new Set(), files = new Set(), unknown = [], seen = new Set();
  const queue = [];
  const addBrick = (id) => {
    if (runtimeIds.has(id)) return;
    const c = map[id];
    if (!c) { if (!unknown.includes(id)) unknown.push(id); return; }
    const key = `${c}/${id}`;
    if (bricks.has(key)) return;
    bricks.add(key);
    const dir = join(from, 'bricks', c, id);
    for (const f of readdirSync(dir)) if (/\.(m?js)$/.test(f)) queue.push(join(dir, f));
  };
  const addFile = (abs) => {
    const rel = posix(relative(from, abs));
    if (rel.startsWith('..')) throw new Error(`copy: ${rel} is outside the runtime`);
    const m = rel.match(/^bricks\/([a-z]+)\/([a-z0-9-]+)\//);
    if (m && CATEGORIES.includes(m[1])) return addBrick(m[2]);
    if (!files.has(rel)) { files.add(rel); if (/\.(m?js)$/.test(rel)) queue.push(abs); }
  };
  for (const f of ROOT_FILES) if (existsSync(join(from, 'bricks', f))) addFile(join(from, 'bricks', f));
  addBrick('neutral');                                   // sample.js imports the neutral look
  for (const id of ids) addBrick(id);
  while (queue.length) {
    const f = queue.shift();
    if (seen.has(f)) continue;
    seen.add(f);
    const src = readFileSync(f, 'utf8');
    for (const s of importsOf(src)) {
      const abs = resolve(dirname(f), s);
      if (existsSync(abs)) addFile(abs);
    }
    if (posix(relative(from, f)).startsWith('bricks/')) for (const id of namedIds(src)) addBrick(id);
  }
  return { bricks: [...bricks].sort(), files: [...files].sort(), unknown };
};

// sha256 (first 16 hex) over a brick folder's files, names included
export const hashDir = (dir) => {
  const h = createHash('sha256');
  for (const f of readdirSync(dir).sort()) if (f !== 'host.html' && !/\.(jpg|png)$/.test(f)) h.update(f + '\0').update(readFileSync(join(dir, f)));
  return h.digest('hex').slice(0, 16);
};

export const copyBricks = ({ from, to, ids, runtime = true, runtimeIds = runtimeNames(from) }) => {
  from = resolve(from); to = resolve(to);
  const c = closure({ from, ids, runtimeIds });
  if (c.unknown.length) throw new Error(`copy: no brick ${c.unknown.join(', ')} in ${join(from, 'bricks')}`);
  const written = [];
  const host = readFileSync(join(from, 'bricks', 'host-template.html'), 'utf8');
  for (const rel of c.files) {
    if (!runtime && !rel.startsWith('bricks/')) continue;
    mkdirSync(dirname(join(to, rel)), { recursive: true });
    cpSync(join(from, rel), join(to, rel));
    written.push(rel);
  }
  const bricks = [];
  for (const key of c.bricks) {
    const [category, id] = key.split('/'), src = join(from, 'bricks', key), dst = join(to, 'bricks', key);
    mkdirSync(dst, { recursive: true });
    for (const f of readdirSync(src)) if (!/\.(jpg|png)$/.test(f)) { cpSync(join(src, f), join(dst, f)); written.push(`bricks/${key}/${f}`); }
    if (['motion', 'scene', 'prop'].includes(category)) {
      writeFileSync(join(dst, 'host.html'), host.replaceAll('{{ID}}', id).replaceAll('{{CATEGORY}}', category));
      written.push(`bricks/${key}/host.html`);
    }
    bricks.push({ id, category, hash: hashDir(src) });
  }
  return { bricks, files: written };
};
