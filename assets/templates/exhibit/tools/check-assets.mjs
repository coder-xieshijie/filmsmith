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
//   - every number the film redraws is printed where the film says: each read cell's value inside its box, a carried
//     value inside its source box and inside the target's ring, a measure's two values somewhere in the crop (unless
//     the point says printed: false, e.g. a plotted point with no label);
//   - the zoom cap (an output pixel covers ≥ 0.75 source pixels): each exhibit's scale on the desk, the opening's
//     full-frame cover, a lock-up mark; the lift-out and the carry swap bitmap for code before the cap by themselves;
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
  if (canOcr && s.type === 'carry' && A[s.exhibit] && A[prev]) {
    const r1 = found(prev, s.from.box, s.from.value), r2 = found(s.exhibit, s.to.ring, s.from.value);
    say(r1.ok ? 'PASS' : 'FAIL', `${at}: "${s.from.value}" ${r1.ok ? `printed in ${prev}'s source box` : `not found in ${prev} [${s.from.box.join(', ')}]; read: ${r1.read}`}`);
    say(r2.ok ? 'PASS' : 'FAIL', `${at}: "${s.from.value}" ${r2.ok ? `printed inside ${s.exhibit}'s ring (the twin it lands on)` : `not found in ${s.exhibit}'s ring [${s.to.ring.join(', ')}]; read: ${r2.read}`}`);
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

// ---------- the zoom cap ----------
const WD = L.world(content);
for (const e of WD.list) say(e.a <= L.CAP + 1e-9 ? 'PASS' : 'FAIL', `${e.id}: ${e.a.toFixed(3)} output px per source px on the desk (cap ${L.CAP.toFixed(3)})`);
const open = (content.scenes || [])[0];
if (open?.type === 'open' && A[open.exhibit]) {
  const [, , cw, ch] = A[open.exhibit].crop, w = cw / ch > 16 / 9 ? ch * 16 / 9 : cw, a0 = 1920 / w;
  say(a0 <= L.CAP + 1e-9 ? 'PASS' : 'FAIL', `opening: the full-frame cover shows ${a0.toFixed(3)} output px per source px (cap ${L.CAP.toFixed(3)})${a0 > L.CAP ? '; capture the asset larger or crop it closer to 16:9' : ''}`);
}
const lock = (content.scenes || []).find((s) => s.type === 'lockup');
if (lock?.mark && A[lock.mark]) {
  const a = 100 / A[lock.mark].crop[3];
  say(a <= L.CAP + 1e-9 ? 'PASS' : 'FAIL', `lock-up mark: ${a.toFixed(3)} output px per source px (100 px tall; cap ${L.CAP.toFixed(3)})`);
}
say('INFO', 'lift-out and value-carry redraw a value in code before its bitmap passes the cap (lib/handoffs: swap = min(1.2, cap / scale))');

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
