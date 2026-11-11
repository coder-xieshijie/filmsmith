#!/usr/bin/env node
// Check the skill's own text: every relative link in a Markdown file resolves, and no file names a folder that is no longer part of the skill.
//   node <skill>/scripts/link-check.mjs [--fix-nothing]
// Exit 0 clean, 1 problems printed. Runs in CI and before a publish; it reads, it does not edit.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Folder names the skill never refers to: they were separate skills before this one.
const GONE = ['keynote-video', 'teach-video'];
const problems = [];

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'vendor' || e.name === 'renders') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
};

const files = walk(SKILL);
const md = files.filter((f) => f.endsWith('.md'));

// 1. Relative links in Markdown: the target file must exist, and an anchor must match a heading in it.
const anchorOf = (file) => {
  const slugs = new Set();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    for (const a of line.matchAll(/<a\s+id="([^"]+)"/g)) slugs.add(a[1].toLowerCase());
    const m = line.match(/^#{1,6}\s+(.*)$/);
    if (!m) continue;
    const slug = m[1].trim().toLowerCase()
      .replace(/`/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');
    slugs.add(slug);
  }
  return slugs;
};

for (const f of md) {
  const text = readFileSync(f, 'utf8');
  const rel = relative(SKILL, f);
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const link = m[1];
    if (/^(https?:|mailto:|#)/.test(link)) {
      if (link.startsWith('#') && !anchorOf(f).has(link.slice(1).toLowerCase())) problems.push(`${rel}: anchor ${link} has no heading`);
      continue;
    }
    const [target, anchor] = link.split('#');
    const p = resolve(dirname(f), target);
    if (!existsSync(p)) { problems.push(`${rel}: ${link} does not exist`); continue; }
    if (anchor && statSync(p).isFile() && p.endsWith('.md') && !anchorOf(p).has(anchor.toLowerCase())) {
      problems.push(`${rel}: ${link} — ${relative(SKILL, p)} has no heading matching #${anchor}`);
    }
  }
}

// 2. No file names a folder the skill no longer has.
for (const f of files) {
  if (f === fileURLToPath(import.meta.url)) continue;
  if (!/\.(md|mjs|cjs|js|json|py|sh|yml|txt)$/.test(f)) continue;
  const text = readFileSync(f, 'utf8');
  for (const gone of GONE) {
    if (text.includes(gone)) problems.push(`${relative(SKILL, f)}: names "${gone}"`);
  }
}

// 3. The frontmatter the skills CLI reads.
const skillMd = join(SKILL, 'SKILL.md');
const head = readFileSync(skillMd, 'utf8').match(/^---\n([\s\S]*?)\n---/);
if (!head) problems.push('SKILL.md: no frontmatter');
else {
  if (!/^name:\s*filmsmith$/m.test(head[1])) problems.push('SKILL.md: name must be filmsmith');
  if (!/^description:\s*\S/m.test(head[1])) problems.push('SKILL.md: description is missing');
}

// 4. Both pipelines are reachable from SKILL.md.
for (const p of ['pipelines/launch.md', 'pipelines/teach.md']) {
  if (!existsSync(join(SKILL, p))) problems.push(`missing ${p}`);
  else if (!readFileSync(skillMd, 'utf8').includes(p)) problems.push(`SKILL.md does not point at ${p}`);
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`link-check: ${md.length} Markdown files, every link resolves, no stale skill name`);
