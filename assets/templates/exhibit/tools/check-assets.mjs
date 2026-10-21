#!/usr/bin/env node
// tools/check-assets.mjs — the asset check of an Exhibit film: what content.js says about its real assets must be true
// of the files.
//
//   npm run assets          (node tools/check-assets.mjs .)   writes renders/check-assets.txt, exits 1 on any FAIL
//
// For every asset in content.js:
//   - the file exists; its sha256 equals the manifest's (the film shows the source as captured: crop, scale and veil
//     only, never an edit); over 200 KB is a WARN (fine in a film, not in a template);
//   - macOS Vision (tools/ocr.swift) reads the crop the film shows: every `expect` string is found, no `forbid` string
//     is, and no face is detected (people: 'none');
//   - every number the film redraws or matches is printed where the film says: each read cell's value inside its box,
//     a match's value inside its box in both prints, a measure's two values somewhere in the crop (unless the point
//     says printed: false, e.g. a plotted point with no label);
//   - a chip's value is printed in the part of its print the mount shows (unless it starts with ~, read off);
//   - the zoom cap (an output pixel covers ≥ 0.75 source pixels): each print in its mount, at full frame where the
//     opening or a grid-hop shows it so, a lock-up mark; lift-out and match-cut keep under it by themselves;
//   - the accent rule: the content's pencil differs from every colour inside each ringed region by ΔE00 ≥ 20.
// Off macOS the reads are INFO (not checked) and the hashes, the zoom cap and the accent rule still run.
// The OCR is a reader, not a judge: a miss is reported with what it did read.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FILM = resolve(process.argv[2] || resolve(HERE, '..'));
const REAL = join(FILM, 'assets/real');
const content = (await import(pathToFileURL(join(FILM, 'content.js')).href)).default;
const L = await import(pathToFileURL(join(FILM, 'layout.js')).href);
const PALETTES = (await import(pathToFileURL(join(FILM, 'palettes.js')).href)).default;
const { accentCheck } = await import(pathToFileURL(join(FILM, 'tools/regions.mjs')).href);

const out = [];
let fails = 0;
const say = (lvl, msg) => { out.push(`${lvl.padEnd(4)} ${msg}`); if (lvl === 'FAIL') fails++; };
const A = content.assets || {};
const canOcr = process.platform === 'darwin' && spawnSync('swift', ['--version']).status === 0;
const ocr = (file, box, faces = false) => execFileSync('swift', [join(HERE, 'ocr.swift'), file, ...(box ? box.map((v) => String(Math.round(v))) : [])], { encoding: 'utf8', maxBuffer: 1 << 24, env: { ...process.env, ...(faces ? { FACES: '1' } : {}) } })
  .split('\n').filter(Boolean).map((l) => { const [x, y, w, h, ...t] = l.split('\t'); return { face: x === 'FACE', x: +x, y: +y, w: +w, h: +h, text: t.join('\t') }; });
// OCR reads a zero as the letter O now and then, and a minus as a hyphen or a dash; compare on a normalised form
const norm = (s) => String(s).replace(/[−–—]/g, '-').replace(/(?<=[-$\d.])O|O(?=[.\d])/g, '0').replace(/\s+/g, ' ').trim();
const grow = ([x, y, w, h], d) => [x - d, y - d, w + 2 * d, h + 2 * d];
const clip = (id, b) => { const [cx, cy, cw, ch] = A[id].crop; const x = Math.max(cx, b[0]), y = Math.max(cy, b[1]); return [x, y, Math.min(cx + cw, b[0] + b[2]) - x, Math.min(cy + ch, b[1] + b[3]) - y]; };
const fileOf = (id) => join(REAL, A[id].file);
const found = (id, box, value) => {
  const lines = ocr(fileOf(id), clip(id, grow(box, 6)));
  const all = lines.map((l) => norm(l.text)).join(' ');
  return { ok: all.includes(norm(value)), read: all || '(nothing)' };
};

// ---------- files, hashes, what each crop shows ----------
for (const [id, a] of Object.entries(A)) {
  const file = join(REAL, a.file || '');
  if (!a.file || !existsSync(file)) { say('FAIL', `${id}: assets/real/${a.file} missing`); continue; }
  const sha = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (!a.sha256) say('WARN', `${id}: no sha256 in the manifest (this file's is ${sha})`);
  else if (sha !== a.sha256) say('FAIL', `${id}: sha256 ${sha.slice(0, 12)} differs from the manifest's ${a.sha256.slice(0, 12)} (the file changed after capture)`);
  else say('PASS', `${id}: ${a.file} unchanged (sha256 ${sha.slice(0, 12)})`);
  const kb = statSync(file).size / 1024;
  if (kb > 200) say('WARN', `${id}: ${kb.toFixed(0)} KB (fine in a film; a template ships images ≤ 200 KB)`);
  if (!a.source) say('FAIL', `${id}: no source (the mount names it)`);
  if (!canOcr) { say('INFO', `${id}: not read (OCR needs macOS); expect/forbid and people: 'none' stand as declared`); continue; }
  const lines = ocr(file, a.crop, true);
  const all = lines.filter((l) => !l.face).map((l) => norm(l.text)).join('\n');
  for (const e of a.expect || []) say(all.includes(norm(e)) ? 'PASS' : 'FAIL', `${id}: ${all.includes(norm(e)) ? 'shows' : 'does not show'} "${e}"`);
  for (const f of a.forbid || []) say(all.includes(norm(f)) ? 'FAIL' : 'PASS', `${id}: ${all.includes(norm(f)) ? 'shows' : 'no'} "${f}"${all.includes(norm(f)) ? ', which the film must not' : ''}`);
  const faces = lines.filter((l) => l.face);
  if (faces.length) say('FAIL', `${id}: ${faces.length} face(s) at ${faces.map((f) => `[${f.x}, ${f.y}, ${f.w}, ${f.h}]`).join(', ')}; crop people out (people: 'none')`);
  else say('PASS', `${id}: no face in the crop`);
}

// ---------- the numbers the film redraws ----------
let prev = null;
(content.scenes || []).forEach((s, i) => {
  const at = `scene ${i + 1} (${s.type})`;
  if (canOcr && s.type === 'read' && A[s.exhibit]) (s.cells || []).forEach((c, k) => {
    const r = found(s.exhibit, c.box, c.value);
    say(r.ok ? 'PASS' : 'FAIL', `${at} cell ${k + 1}: "${c.value}" ${r.ok ? 'printed in its box' : `not found in box [${c.box.join(', ')}]; read: ${r.read}`}`);
  });
  if (canOcr && s.type === 'match' && A[s.exhibit] && A[prev]) {
    const r1 = found(prev, s.from.box, s.from.value), r2 = found(s.exhibit, s.to.box, s.from.value);
    say(r1.ok ? 'PASS' : 'FAIL', `${at}: "${s.from.value}" ${r1.ok ? `printed in ${prev}'s box` : `not found in ${prev} [${s.from.box.join(', ')}]; read: ${r1.read}`}`);
    say(r2.ok ? 'PASS' : 'FAIL', `${at}: "${s.from.value}" ${r2.ok ? `printed in ${s.exhibit}'s box (the cut matches the same value)` : `not found in ${s.exhibit}'s box [${s.to.box.join(', ')}]; read: ${r2.read}`}`);
  }
  if (canOcr && s.type === 'measure' && A[s.exhibit]) {
    const all = ocr(fileOf(s.exhibit), A[s.exhibit].crop).map((l) => norm(l.text)).join(' ');
    for (const k of ['a', 'b']) {
      if (s[k]?.printed === false) { say('INFO', `${at}: ${k} (${s[k].value}) is a plotted point, not a printed value (printed: false)`); continue; }
      const v = Number(s[k]?.value).toFixed(s.digits ?? 1), ok = all.includes(norm(v));
      say(ok ? 'PASS' : 'FAIL', `${at}: ${k} = ${v} ${ok ? 'printed in the exhibit' : 'not printed in the exhibit (set printed: false only for a plotted point the axis gives)'}`);
    }
  }
  if (s.exhibit) prev = s.exhibit;
});

// ---------- the chips: a chip's value is printed in the part of its print the mount shows (a value read off a
// chart starts with ~ and is reported, not searched)
if (canOcr) {
  const Wc = L.world(content);
  for (const e of Wc.list) {
    if (!e.chip) continue;
    const v = String(e.chip[1]);
    if (v.startsWith('~')) { say('INFO', `${e.id}: chip "${v}" is read off the asset (~), not printed`); continue; }
    // the number is what must be printed (a unit may stand in a column of its own); a chip without a number whole
    const want = norm(v.match(/[-−]?\d[\d.,/]*/)?.[0] ?? v);
    const all = ocr(fileOf(e.id), e.region.map((x) => Math.round(x))).map((l) => norm(l.text)).join(' ');
    say(all.includes(want) ? 'PASS' : 'FAIL', `${e.id}: chip "${v}" ${all.includes(want) ? `("${want}") printed in the part the mount shows` : `("${want}") not found in the part the mount shows (a chip carries what the print shows)`}`);
  }
}

// ---------- the zoom cap ----------
const WD = L.world(content);
for (const e of WD.list) {
  say(e.a <= L.CAP + 1e-9 ? 'PASS' : 'FAIL', `${e.id}: ${e.a.toFixed(3)} output px per source px in its mount (cap ${L.CAP.toFixed(3)}; the mount shows [${e.region.map((v) => Math.round(v)).join(', ')}])`);
  // the opening shows its print at full frame, 1920 px wide: its region must be ≥ 1440 px wide (grid-hop's tiles
  // are drawn onto the mounts, so they never pass the mount's own scale)
  const full = 1920 / e.region[2];
  if ((content.scenes || [])[0]?.exhibit === e.id) say(full <= L.CAP + 1e-9 ? 'PASS' : 'FAIL', `${e.id}: ${full.toFixed(3)} output px per source px at full frame (the opening; cap ${L.CAP.toFixed(3)})${full > L.CAP ? '; capture it larger' : ''}`);
}
const lock = (content.scenes || []).find((s) => s.type === 'lockup');
if (lock?.mark && A[lock.mark]) {
  const a = 100 / A[lock.mark].crop[3];
  say(a <= L.CAP + 1e-9 ? 'PASS' : 'FAIL', `lock-up mark: ${a.toFixed(3)} output px per source px (100 px tall; cap ${L.CAP.toFixed(3)})`);
}
say('INFO', 'lift-out redraws a value in code before its bitmap passes the cap, and match-cut pushes in no further than the cap (lib/handoffs)');

// ---------- the accent rule ----------
try {
  const res = await accentCheck(PALETTES, { quiet: true });
  const row = res.rows[content.palette];
  if (!row) say('FAIL', `palette "${content.palette}" is not in palettes.js`);
  else if (!Number.isFinite(row.worst.d)) say('PASS', `accent ${PALETTES[content.palette].accent}: the ${res.regions} ringed regions hold no chromatic colour`);
  else say(row.ok ? 'PASS' : 'FAIL', `accent ${PALETTES[content.palette].accent} (${content.palette}): nearest colour in a ringed region ΔE00 ${row.worst.d.toFixed(1)} (≥ 20), ${row.worst.where}${row.ok ? '' : '; npm run palettes lists the presets that pass'}`);
} catch (e) { say('FAIL', `accent rule not checked: ${e.message}`); }

out.push('', fails ? `FAIL: ${fails}` : 'PASS: 0 FAIL');
mkdirSync(join(FILM, 'renders'), { recursive: true });
writeFileSync(join(FILM, 'renders/check-assets.txt'), out.join('\n') + '\n');
console.log(out.join('\n'));
process.exit(fails ? 1 : 0);
