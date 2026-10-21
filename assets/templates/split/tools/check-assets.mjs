#!/usr/bin/env node
// tools/check-assets.mjs — the real-asset gate of a Split film (npm run assets; `npm run film` runs it first).
// Reads content.js `assets` (the manifest) and the scenes, and checks:
//   file      every asset exists, its sha256 equals the manifest's (the file is the capture, unedited), its pixel size
//             equals `size`, and it is at most 200 KB (a template ships no larger image; a film may raise --max-kb)
//   people    the manifest says what was checked for faces, avatars and account rows (`people`)
//   zoom      every place the film shows an asset is at most 4/3 output px per source px (no interpolated pixels)
//   frames    a frame decoded again from its film at its time (and crop) matches the file: PSNR ≥ 30 dB (the file is
//             encoded once; a different frame scores far lower). Needs the films: --films <dir> (or $SPLIT_FILMS);
//             without them each frame is a WARN ("not verified"), never a silent pass
//   quotes    every line a `file` scene quotes equals that line of its source file, and a `diff` scene's `before` line
//             equals line n of its file; files resolve against --root <dir> (or $SPLIT_ROOT), else the folders above
//             this film; a file not found is a WARN
//   report    a `render` scene's report lines equal what scripts/check-film.mjs prints for the report's film (item and
//             value; padding and gate notes are cut), when the film and the script are found; else a WARN
//   accent    the palette's accent differs by ΔE00 ≥ 20 from every colour filling ≥ 2 % of each result region
// Prints PASS / WARN / FAIL lines, writes renders/check-assets.txt, exits 1 on any FAIL.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), FILM = resolve(HERE, '..');
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const maxKb = Number(arg('max-kb')) || 200;
const FILMS = arg('films') ?? process.env.SPLIT_FILMS ?? null;
const imp = async (f) => (await import(pathToFileURL(join(FILM, f)).href)).default;
const content = await imp('content.js'), PALETTES = await imp('palettes.js');
const { validate, CAP } = await import(pathToFileURL(join(FILM, 'choreo.js')).href);
const { regionsOf, regionReport } = await import(pathToFileURL(join(HERE, 'regions.mjs')).href);

const out = []; let fails = 0;
const say = (l, m) => { out.push(`${l.padEnd(4)} ${m}`); if (l === 'FAIL') fails++; };
const finish = () => {
  out.push(`result: ${fails ? `FAIL (${fails})` : 'PASS'}`);
  mkdirSync(join(FILM, 'renders'), { recursive: true });
  writeFileSync(join(FILM, 'renders/check-assets.txt'), out.join('\n') + '\n');
  console.log(out.join('\n'));
  process.exit(fails ? 1 : 0);
};

const v = validate(content);
for (const e of v) say('FAIL', `content.js: ${e}`);
if (v.length) finish();

// ---------------------------------------------------------------- files
const raw = (args) => execFileSync('ffmpeg', ['-v', 'error', ...args], { maxBuffer: 256 << 20 });
for (const [id, A] of Object.entries(content.assets)) {
  const f = join(FILM, 'assets/real', A.file);
  if (!existsSync(f)) { say('FAIL', `${id}: assets/real/${A.file} missing`); continue; }
  const sha = createHash('sha256').update(readFileSync(f)).digest('hex');
  say(sha === A.sha256 ? 'PASS' : 'FAIL', `${id}: sha256 ${sha.slice(0, 12)} ${sha === A.sha256 ? 'equals the manifest' : `differs from the manifest's ${String(A.sha256).slice(0, 12)}`}`);
  const kb = statSync(f).size / 1024;
  say(kb <= maxKb ? 'PASS' : 'FAIL', `${id}: ${kb.toFixed(0)} KB (at most ${maxKb})`);
  const pr = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim().split(',').map(Number);
  say(pr[0] === A.size[0] && pr[1] === A.size[1] ? 'PASS' : 'FAIL', `${id}: ${pr.join(' × ')} px (manifest ${A.size.join(' × ')})`);
  say(typeof A.people === 'string' && A.people.startsWith('none') ? 'PASS' : 'FAIL', `${id}: people — ${A.people ?? 'not stated'}`);
  if (A.kind === 'frame') {
    const src = FILMS ? join(FILMS, A.from.film) : null;
    if (!src || !existsSync(src)) { say('WARN', `${id}: frame not verified (pass --films <dir> holding ${A.from.film})`); continue; }
    const crop = A.from.crop ? ['-vf', `crop=${A.from.crop[2]}:${A.from.crop[3]}:${A.from.crop[0]}:${A.from.crop[1]}`] : [];
    const tmp = join(FILM, 'renders', `.frame-${id}.png`);
    mkdirSync(join(FILM, 'renders'), { recursive: true });
    raw(['-y', '-ss', String(A.from.at), '-i', src, '-frames:v', '1', ...crop, tmp]);
    const r = spawnSync('ffmpeg', ['-v', 'info', '-i', f, '-i', tmp, '-lavfi', 'psnr', '-f', 'null', '-'], { encoding: 'utf8' });
    const psnr = Number((r.stderr.match(/average:([\d.]+|inf)/) || [])[1] === 'inf' ? 99 : (r.stderr.match(/average:([\d.]+)/) || [])[1]);
    execFileSync('rm', ['-f', tmp]);
    say(psnr >= 30 ? 'PASS' : 'FAIL', `${id}: decoded again from ${A.from.film} at ${A.from.at} s${A.from.crop ? ` (crop ${A.from.crop})` : ''}: PSNR ${Number.isFinite(psnr) ? psnr.toFixed(1) : '?'} dB (≥ 30)`);
  }
}

// ---------------------------------------------------------------- zoom
for (const r of regionsOf(content)) say(r.k <= CAP + 1e-9 ? 'PASS' : 'FAIL', `scene ${r.scene + 1} ${r.type}: ${r.id} at ${r.k.toFixed(3)} output px per source px (cap ${CAP.toFixed(3)}), shows [${r.rect.join(', ')}]`);

// ---------------------------------------------------------------- quotes and the report
const roots = [arg('root'), process.env.SPLIT_ROOT, FILM, resolve(FILM, '..'), resolve(FILM, '../..'), resolve(FILM, '../../..'), resolve(FILM, '../../../..')].filter(Boolean);
const find = (rel) => roots.map((r) => join(r, rel)).find((p) => existsSync(p)) ?? null;
content.scenes.forEach((s, i) => {
  const at = `scene ${i + 1} ${s.type}`;
  if (s.type === 'file') {
    const f = find(s.source.file);
    if (!f) return say('WARN', `${at}: ${s.source.file} not found (pass --root <skill or repo folder>): ${s.lines.length} quoted lines not verified`);
    const L = readFileSync(f, 'utf8').split('\n');
    s.lines.forEach((ln, k) => say(L[s.source.from - 1 + k] === ln ? 'PASS' : 'FAIL', `${at}: line ${s.source.from + k} of ${s.source.file} ${L[s.source.from - 1 + k] === ln ? 'quoted verbatim' : `differs: file has ${JSON.stringify(L[s.source.from - 1 + k])}`}`));
  }
  if (s.type === 'diff') {
    const f = find(s.source.file);
    if (!f) return say('WARN', `${at}: ${s.source.file} not found (pass --root): line ${s.line.n} not verified`);
    const ln = readFileSync(f, 'utf8').split('\n')[s.line.n - 1];
    say(ln === s.line.before ? 'PASS' : 'FAIL', `${at}: line ${s.line.n} of ${s.source.file} ${ln === s.line.before ? 'is the diff\'s - line' : `differs: ${JSON.stringify(ln)}`}`);
  }
  if (s.type === 'render') {
    const film = FILMS ? join(FILMS, s.report.source?.film ?? '') : null, tool = find('scripts/check-film.mjs');
    if (!film || !existsSync(film) || !tool) return say('WARN', `${at}: report not verified (needs --films with ${s.report.source?.film} and scripts/check-film.mjs under --root)`);
    const txt = spawnSync(process.execPath, [tool, film], { encoding: 'utf8' }).stdout;
    for (const [st, item, val] of s.report.lines) {
      const line = txt.split('\n').find((l) => l.trim().startsWith(st) && l.includes(` ${item} `));
      const cols = line ? line.trim().split(/\s{2,}/) : [], num = val.split(' ')[0], unit = val.split(' ')[1];
      const ok = !!line && cols[1] === item && cols[2] === num && (!unit || (cols[3] ?? '').startsWith(unit));
      say(ok ? 'PASS' : 'FAIL', `${at}: report "${st} ${item} ${val}" ${ok ? 'as check-film prints it' : `— check-film: ${line ? cols.slice(0, 4).join(' | ') : 'no such line'}`}`);
    }
    const res = txt.trim().split('\n').at(-1);
    say(res === s.report.result ? 'PASS' : 'FAIL', `${at}: "${s.report.result}" ${res === s.report.result ? 'as printed' : `— printed "${res}"`}`);
  }
});

// ---------------------------------------------------------------- the accent
for (const r of await regionReport(content, { [content.palette]: PALETTES[content.palette] })) {
  say(r.ok ? 'PASS' : 'FAIL', `accent ${PALETTES[content.palette].accent} vs ${r.region}: ΔE00 ${r.min.toFixed(1)} against ${r.worst} (≥ 20)`);
}
finish();
