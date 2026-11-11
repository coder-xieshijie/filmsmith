#!/usr/bin/env node
// Keep a project in step with its style kit: copy the parts of the kit that carry no film content and that a project must not edit;
// leave the project's own files alone.
//   in a project:              npm run kit-sync [-- --check]
//   for another project:       node <skill>/assets/kits/<kit>/starter/build/kit-sync.cjs <project-dir> [--check]
// Synced: build/ (except reports, shots), lib.js, main.js, components/, style.css, tokens.js, vendor.json, package.json, hyperframes.json;
// .gitignore gets the kit's lines it lacks appended, and keeps the project's own lines.
// Untouched: film.json, handoff.json, cues.js, anchors.txt, segments/, sfx.json, assets/, vendor/, renders/, READMEs and other project files;
// index.html is rewritten by the next command that assembles.
// Files in the project's components/ that the kit lacks (components a director added) stay and are listed.
// --check lists differences without writing and exits 1 when there are any.
// The kit: <skill>/assets/kits/<film.json "kit", default terminal-ledger>/starter, with the skill found as build/common.cjs skillRoot() does.
'use strict';
const fs = require('fs'), path = require('path');
const { args } = require('./common.cjs');
const o = args();
const here = path.resolve(__dirname, '..');
const proj = path.resolve(o._[0] || here);
if (!fs.existsSync(path.join(proj, 'film.json'))) { console.error(`${proj} is not a kit project (no film.json)`); process.exit(2); }
const film = (() => { try { return JSON.parse(fs.readFileSync(path.join(proj, 'film.json'), 'utf8')); } catch (_) { return {}; } })();
const isSkill = (p) => p && fs.existsSync(path.join(p, 'SKILL.md')) && fs.existsSync(path.join(p, 'scripts/geo-check.cjs'));
const skill = [process.env.FILMSMITH_ROOT, film.skill && path.resolve(proj, film.skill), path.resolve(here, '../../../..')].find(isSkill);
if (!skill) { console.error('cannot find the filmsmith skill: set film.json "skill" or FILMSMITH_ROOT'); process.exit(2); }
const kit = path.join(skill, 'assets/kits', film.kit || 'terminal-ledger', 'starter');
if (!fs.existsSync(path.join(kit, 'build/kit-sync.cjs'))) { console.error(`no kit at ${kit}`); process.exit(2); }
if (path.resolve(kit) === proj) { console.error('this is the kit itself: run it in a project, or pass the project directory'); process.exit(2); }

const FILES = ['lib.js', 'main.js', 'style.css', 'tokens.js', 'vendor.json', 'package.json', 'hyperframes.json', '.gitignore'];
const DIRS = ['build', 'components'];
const SKIP = new Set(['build/reports', 'build/shots']);
const list = (root, d) => fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => {
  const r = path.join(d, e.name);
  if (SKIP.has(r) || e.name.startsWith('.')) return [];
  return e.isDirectory() ? list(root, r) : [r];
}) : [];
const want = [...FILES.filter((f) => fs.existsSync(path.join(kit, f))), ...DIRS.flatMap((d) => list(kit, d))];
const add = [], change = [];
const gitignoreMissing = (kitBuf, projBuf) => { const have = new Set(projBuf.toString().split('\n').map((l) => l.trim())); return kitBuf.toString().split('\n').filter((l) => l.trim() && !have.has(l.trim())); };
const lineDiff = (a, b) => { const x = a.split('\n'), y = new Set(b.split('\n')); return x.filter((l) => !y.has(l)).length; };
for (const f of want) {
  const src = path.join(kit, f), dst = path.join(proj, f);
  if (!fs.existsSync(dst)) { add.push(f); continue; }
  const a = fs.readFileSync(src), b = fs.readFileSync(dst);
  if (f === '.gitignore') { const miss = gitignoreMissing(a, b); if (miss.length) change.push({ f, n: `${miss.length} kit lines to append` }); continue; }
  if (!a.equals(b)) change.push({ f, n: /\.(js|cjs|css|json|sh)$/.test(f) ? `${lineDiff(b.toString(), a.toString())} old lines → ${lineDiff(a.toString(), b.toString())} new` : 'binary differs' });
}
const ownComp = list(proj, 'components').filter((f) => !fs.existsSync(path.join(kit, f)));
const ownBuild = list(proj, 'build').filter((f) => !fs.existsSync(path.join(kit, f)));
const name = path.basename(proj);
if (!add.length && !change.length) { console.log(`${name}: in step with the kit`); process.exit(0); }
const lines = [...add.map((f) => `  + ${f}`), ...change.map((c) => `  ~ ${c.f} (${c.n})`)];
if (ownComp.length) lines.push(`  the project's own components, left alone: ${ownComp.join(' ')}`);
if (ownBuild.length) lines.push(`  files in build/ the kit lacks, left alone: ${ownBuild.join(' ')}`);
if (o.check) { console.log(`${name}: ${add.length} new, ${change.length} different\n${lines.join('\n')}`); process.exit(1); }
for (const f of [...add, ...change.map((c) => c.f)]) {
  const src = path.join(kit, f), dst = path.join(proj, f);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (f === '.gitignore' && fs.existsSync(dst)) {
    const cur = fs.readFileSync(dst, 'utf8');
    fs.writeFileSync(dst, cur + (cur.endsWith('\n') || !cur ? '' : '\n') + gitignoreMissing(fs.readFileSync(src), Buffer.from(cur)).join('\n') + '\n');
  } else fs.copyFileSync(src, dst);
}
console.log(`${name}: synced, ${add.length} new, ${change.length} overwritten\n${lines.join('\n')}\nNext: npm run check (re-assembles index.html); web loop units also npm run render && npm run finish for web-check`);
