#!/usr/bin/env node
// new-film.mjs <mode> <film-dir> [--palette <id>] [--bricks a,b,…]
// Copies a mode template into a new film folder, adds the shared runtime as lib/ (stamped with
// lib/VERSION; without the brick library, assets/runtime/bricks/: a composed film copies the bricks it uses with
// add-bricks.mjs once PLAN.md's composition table is filled, or here with --bricks), writes the PLAN.md skeleton,
// downloads the fonts and the pinned GSAP build. Exits non-zero
// when a prerequisite is missing or a font or GSAP cannot be downloaded: a film is never set up to render
// in a fallback font or to depend on a CDN. The network is needed here and on the first `npx hyperframes`
// run, not afterwards.
// Then: fill PLAN.md, edit content.js (see TEMPLATE.md), npm run film.
import { cp, readdir, readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templates = join(root, 'assets', 'templates');
const runtime = join(root, 'assets', 'runtime');
// Names before 2026-10-19 still work.
const ALIASES = { 'thread-reel': 'thread', 'ink-beat': 'ink', 'swiss-poster': 'plakat', 'blueprint-drafting': 'blueprint', 'terminal-launch': 'phosphor', 'unit-data': 'tally', 'diagram-explainer': 'trace' };
const [modeArg, target, ...rest] = process.argv.slice(2);
const bi = rest.indexOf('--bricks');
const brickIds = bi >= 0 ? (rest[bi + 1] ?? '').split(',').map((x) => x.trim()).filter(Boolean) : [];
const mode = ALIASES[modeArg] ?? modeArg;
const modes = (await readdir(templates, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);

if (!mode || !target || !modes.includes(mode)) {
  console.error(`usage: new-film.mjs <mode> <film-dir> [--palette <id>] [--bricks a,b,…]\nmodes: ${modes.join(', ')}`);
  process.exit(2);
}
// Prerequisites (doctor): Node 22+, ffmpeg and ffprobe on PATH. Chrome is downloaded by hyperframes on its
// first run, so it is not checked here.
const major = Number(process.versions.node.split('.')[0]);
const missing = [];
if (major < 22) missing.push(`Node 22 or newer (this is ${process.versions.node})`);
for (const bin of ['ffmpeg', 'ffprobe']) if (spawnSync(bin, ['-version'], { stdio: 'ignore' }).status !== 0) missing.push(`${bin} on PATH`);
if (missing.length) {
  console.error(`new-film: missing ${missing.join(', ')}. Install them and run again.`);
  process.exit(2);
}

const dest = resolve(target);
if (await access(dest).then(() => true, () => false)) {
  if ((await readdir(dest)).length) {
    console.error(`${dest} exists and is not empty`);
    process.exit(2);
  }
}

await cp(join(templates, mode), dest, { recursive: true });
// the runtime without the brick library (bricks are copied by id: add-bricks.mjs)
const BRICKS = join(runtime, 'bricks');
const outsideBricks = (p) => p !== BRICKS && !p.startsWith(BRICKS + sep);
await cp(runtime, join(dest, 'lib'), { recursive: true, filter: outsideBricks });

// lib/VERSION: which runtime this film was made with, so a film's lib/ that drifts from the Skill's
// runtime can be spotted (compare the hash with a fresh new-film). The hash covers the runtime outside bricks/; the
// copied bricks get their own line with a hash each (add-bricks.mjs).
const files = async (d) => (await readdir(d, { withFileTypes: true, recursive: true })).filter((e) => e.isFile()).map((e) => join(e.parentPath ?? e.path, e.name)).filter(outsideBricks).sort();
const hash = createHash('sha256');
for (const f of await files(runtime)) hash.update(relative(runtime, f) + '\0').update(await readFile(f));
const { TIMING_API } = await import(pathToFileURL(join(runtime, 'timing.js')).href);
const today = new Date().toISOString().slice(0, 10);
await writeFile(join(dest, 'lib', 'VERSION'), [
  `runtime timing-api ${TIMING_API}`,
  `hash sha256:${hash.digest('hex').slice(0, 16)} (assets/runtime outside bricks/ at copy time)`,
  `created ${today} by scripts/new-film.mjs ${mode}`,
  '',
].join('\n'));

if (brickIds.length) {
  const { addBricks } = await import(pathToFileURL(join(root, 'scripts', 'add-bricks.mjs')).href);
  const r = addBricks(dest, brickIds);
  console.log(`lib/bricks/: ${r.bricks.map((b) => b.id).join(', ')}`);
}

const pi = rest.indexOf('--palette');
if (pi >= 0 && rest[pi + 1]) {
  const file = join(dest, 'content.js');
  const src = await readFile(file, 'utf8');
  await writeFile(file, src.replace(/palette:\s*'[^']*'/, `palette: '${rest[pi + 1]}'`));
}

// PLAN.md skeleton (principle 10: borrow the grammar, not the layout). lib/fit.mjs refuses to run
// without it, and fills the beat table between the fit markers.
const card = await readFile(join(root, 'references', 'modes', `${mode}.md`), 'utf8').catch(() => '');
const section = (name) => {
  const m = card.match(new RegExp(`^## ${name}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
  return m ? m[1].trim() : '';
};
const defaults = section('Factory defaults');
const bans = defaults
  ? defaults.split('\n').map((l) => (/^\s*[-*] /.test(l) ? l.replace(/^(\s*)[-*] /, '$1- [ ] ') : l)).join('\n')
  : `<!-- fill: the mode card references/modes/${mode}.md has no "Factory defaults" section yet; list what the template produces untouched (source film's and nearest reference's motifs, example copy, default palette) -->`;
await writeFile(join(dest, 'PLAN.md'), `# PLAN — ${mode} film

Written before content.js; \`npm run fit\` refuses to run without this file. Keep it short. Replace every fill marker below; \`npm run fit\` warns while one is left.

## Concept

One sentence, in this form: "In this film, [something only this product has] becomes [the mode's signature device]." Then the rival test: put the nearest competing product into the sentence. If it still holds, the idea belongs to the category, not to this product; rewrite it.

<!-- fill: concept sentence -->

Rival tested: <!-- fill: competitor, and why the sentence no longer holds for it -->

## Through-line

The one object or gesture that carries the film from the first scene to the last, and how it changes at each turn.

<!-- fill: through-line -->

## Composition table

Composed films only (references/creative.md, "The composition table"); a standard-mode film deletes this section. One row per brick; the Brick column's first \`code\` span is the id that \`node <skill>/scripts/add-bricks.mjs <film>\` copies into lib/bricks/ (run it after filling the table and whenever it changes).

| Slot | Brick | From | Reskin | Material |
|---|---|---|---|---|
| <!-- fill --> | | | | |

## Banned defaults

Start from the mode card's factory defaults (below, copied from references/modes/${mode}.md). Tick every one this film drops; for each one kept, write why this film needs it. Then check the film against references/ai-tells.md in the skill: none of those may appear.

${bans}

## Nearest reference

The reference film or source film this one is closest to (mode card, theme benchmarks), and what this film must not take from it. When no reference film is at hand, the Factory defaults above stand in for it.

<!-- fill: nearest reference -->

## Motifs against the reference

Count only what this film chooses: scene types and their order, copy, palette, through-line, optional devices. The mode's fixed grammar (frame, signature transformations, the template's opening and lock-up) is checked on the mode card, not here. At most half of the chosen motifs may match the nearest reference (draft).

| Motif | Reference | This film | Same? |
|---|---|---|---|
| <!-- fill --> | | | |

## Facts and sources

One row per fact or number on screen: where it comes from, and for a number the code that computes it.

| On screen | Source | Computed by |
|---|---|---|
| <!-- fill --> | | |

## Beat plan

One row per scene: type, what it says, what it becomes in the next scene, where the music gives way or drops.

| # | Scene type | Says | Becomes | Music |
|---|---|---|---|---|
| <!-- fill --> | | | | |

## Beat table

Written by \`npm run fit\` (do not edit between the markers).

<!-- fit:begin -->
<!-- fit:end -->
`);

// A template whose fonts depend on content.js (stream: the language) ships its own tools/fonts.mjs, run instead of
// lib/setup-fonts.mjs; it reads the same fonts.json and pinned commit.
const ownFonts = await access(join(dest, 'tools', 'fonts.mjs')).then(() => true, () => false);
for (const [script, what] of [[ownFonts ? join(dest, 'tools', 'fonts.mjs') : join(dest, 'lib', 'setup-fonts.mjs'), 'font'], [join(dest, 'lib', 'setup-vendor.mjs'), 'GSAP']]) {
  const r = spawnSync(process.execPath, [script, dest], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\n${what} setup failed: ${dest} is set up but cannot render. Fix the network${what === 'font' ? ' or fonts.json' : ''}, then run \`npm run setup\` inside the folder.`);
    process.exit(1);
  }
}

console.log(`\n${mode} → ${dest}\nnext: fill PLAN.md, read TEMPLATE.md, edit content.js, then \`npm run film\` inside the folder.`);
