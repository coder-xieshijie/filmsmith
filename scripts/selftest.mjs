#!/usr/bin/env node
// selftest.mjs [--modes a,b] [--variants] [--render <mode>] [--keep] [--dir <path>] [--jobs <n>]
// Self-test of the skill on this machine, for contributors and users. Changes no template and no runtime:
// every film is scaffolded into a temporary folder and only that copy is touched.
//
//   environment  Node 22 or newer, ffmpeg and ffprobe on PATH, every template pins the same hyperframes
//                version and `npx --yes hyperframes@<version>` runs
//   per mode     new-film.mjs <mode> <tmp>/<mode> --palette <the template's default>; PLAN.md skeleton with
//                its fill markers replaced; `npm run fit` (0 errors); `npm run audio` and
//                `npm run check -- --json` (0 errors; the check lints the audio file, so the audio comes
//                first, as in `npm run film`); two key-frame stills with `npm run snapshot -- --at ...`
//                (mid-points of holds in renders/timing.json), each 1920×1080, rendered after the runtime
//                was ready, with no red error banner (lib/text.js errorBanner, #D00000) and not black
//   --variants   every non-default value of the mode's form variant (CONTRACT.md, "Form variant") set in
//                content.js and stilled at the scene mid-points, checked the same way and against the
//                default (a value that changes no frame fails); the frame that changes most is reported.
//                A variant the shipped example copy does not fit gets the cut its TEMPLATE.md documents
//                (COPY_CUTS below). content.js is restored afterwards
//   --render m   `npm run film` for mode m, then check-film.mjs on renders/film.mp4 (exit 1 on any FAIL);
//                runs alongside the other modes, so `--modes m --render m` tests that mode alone
//
// Prints one PASS / FAIL table (progress goes to stderr) and exits 1 when any item fails, 2 on a usage error.
// The films go to a new folder under the system temp directory (or --dir, which must be empty or absent)
// and are removed afterwards unless --keep; step logs are in <dir>/logs/<mode>.log. Needs the network
// (fonts and GSAP for each new film, the first npx run). `hyperframes check` sometimes fails to shut its
// browser down ("did not exit after forced shutdown"); that error alone is retried up to twice and noted.
import { mkdtemp, mkdir, readdir, readFile, writeFile, rm, appendFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templates = join(root, 'assets', 'templates');
const scripts = join(root, 'scripts');

// ---------------------------------------------------------------- arguments
const USAGE = 'usage: selftest.mjs [--modes a,b] [--variants] [--render <mode>] [--keep] [--dir <path>] [--jobs <n>]';
const args = process.argv.slice(2);
const opt = { modes: null, variants: false, render: null, keep: false, dir: null, jobs: 1 };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--variants') opt.variants = true;
  else if (a === '--keep') opt.keep = true;
  else if (a === '--modes') opt.modes = (args[++i] ?? '').split(',').filter(Boolean);
  else if (a === '--render') opt.render = args[++i];
  else if (a === '--dir') opt.dir = args[++i];
  else if (a === '--jobs') opt.jobs = Math.max(1, Number(args[++i]) || 1);
  else if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
  else { console.error(`selftest: unknown argument ${a}\n${USAGE}`); process.exit(2); }
}

// ---------------------------------------------------------------- the skill's own facts
const contract = await readFile(join(templates, 'CONTRACT.md'), 'utf8');
// "Form variant" table: | mode | `field` | `'default'`, `'other'` ... |
const VARIANTS = {};
const vsec = contract.match(/^## Form variant\n([\s\S]*?)(?=^## )/m)?.[1] ?? '';
for (const line of vsec.split('\n')) {
  const m = line.match(/^\|\s*([a-z-]+)\s*\|\s*`([A-Za-z]+)`\s*\|(.*)\|\s*$/);
  if (m) VARIANTS[m[1]] = { field: m[2], values: [...m[3].matchAll(/'([^']+)'/g)].map((x) => x[1]) };
}
const dirs = (await readdir(templates, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
const order = Object.keys(VARIANTS);
const allModes = [...order.filter((m) => dirs.includes(m)), ...dirs.filter((m) => !order.includes(m)).sort()];
const ALIASES = { 'thread-reel': 'thread', 'ink-beat': 'ink', 'swiss-poster': 'plakat', 'blueprint-drafting': 'blueprint', 'terminal-launch': 'phosphor', 'unit-data': 'tally', 'diagram-explainer': 'trace' };
const norm = (m) => ALIASES[m] ?? m;
const modes = opt.modes ? opt.modes.map(norm) : allModes;
if (opt.render) opt.render = norm(opt.render);
for (const m of [...modes, ...(opt.render ? [opt.render] : [])]) {
  if (!allModes.includes(m)) { console.error(`selftest: unknown mode ${m}; modes: ${allModes.join(', ')}`); process.exit(2); }
}
if (opt.render && !modes.includes(opt.render)) modes.push(opt.render);

// ---------------------------------------------------------------- helpers
const t0 = Date.now();
const secs = (ms) => `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`;
const progress = (s) => process.stderr.write(`${s}\n`);
const tail = (s, n = 12) => s.trimEnd().split('\n').filter((l) => !/^npm notice/.test(l)).slice(-n).map((l) => `      ${l}`).join('\n');
const run = (cmd, argv, { cwd, log, timeout = 10 * 60e3 } = {}) => new Promise((done) => {
  const start = Date.now();
  const p = spawn(cmd, argv, { cwd, env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } });
  let out = '';
  p.stdout.on('data', (d) => { out += d; });
  p.stderr.on('data', (d) => { out += d; });
  const timer = setTimeout(() => { out += `\n[selftest] timed out after ${secs(timeout)}\n`; p.kill('SIGKILL'); }, timeout);
  const finish = async (code) => {
    clearTimeout(timer);
    if (log) await appendFile(log, `\n$ ${cmd} ${argv.join(' ')}   (in ${cwd ?? '.'})\n${out}\n[exit ${code}, ${secs(Date.now() - start)}]\n`);
    done({ code, out, ms: Date.now() - start });
  };
  p.on('error', (e) => { out += String(e); finish(127); });
  p.on('close', (code) => finish(code ?? 1));
});

// Still analysis: 1920×1080, no red error banner, not black. Read at half size as raw RGB through ffmpeg.
const W = 960, H = 540;
const rgb = (png) => spawnSync('ffmpeg', ['-v', 'error', '-i', png, '-vf', `scale=${W}:${H}:flags=neighbor`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 25 }).stdout;
// mean absolute difference of two stills, 0..255 per channel
const meanDiff = (a, b) => {
  const x = rgb(a), y = rgb(b);
  if (!x?.length || x.length !== y?.length) return null;
  let d = 0;
  for (let i = 0; i < x.length; i++) d += Math.abs(x[i] - y[i]);
  return d / x.length;
};
const analyse = (png) => {
  const pr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', png], { encoding: 'utf8' });
  const [w, h] = pr.stdout.trim().split(',').map(Number);
  const raw = rgb(png);
  const problems = [];
  if (w !== 1920 || h !== 1080) problems.push(`size ${w}×${h}, expected 1920×1080`);
  if (!raw || raw.length !== W * H * 3) return { problems: [...problems, 'could not decode'] };
  let bright = 0, max = 0, sum = 0, bannerRows = 0;
  for (let y = 0; y < H; y++) {
    let red = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3, r = raw[i], g = raw[i + 1], b = raw[i + 2];
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += l; if (l > max) max = l; if (l > 24) bright++;
      if (r >= 185 && r <= 230 && g <= 24 && b <= 24) red++; // errorBanner background #D00000
    }
    if (red >= 0.85 * W) bannerRows++;
  }
  // the banner has 18 px of padding above and below its text: at least 9 full rows at half size
  if (bannerRows >= 6) problems.push(`red error banner (${bannerRows * 2} px of #D00000 rows)`);
  const brightFrac = bright / (W * H);
  if (max < 32 || brightFrac < 0.002) problems.push(`black frame (max luma ${max.toFixed(0)}, ${(brightFrac * 100).toFixed(2)} % above 24)`);
  return { problems, mean: sum / (W * H), max, brightFrac };
};

// Key frames from renders/timing.json, mid-points of holds (the still windows after the protagonist lands):
// the first hold of 0.3 s or more, and the longest hold in another scene. A mode without holds: 35 % and 70 %.
const keyTimes = (tj) => {
  const holds = (tj.holds ?? []).filter((h) => h.to - h.from >= 0.3);
  const mid = (h) => Number(((h.from + h.to) / 2).toFixed(2));
  if (!holds.length) return [0.35, 0.7].map((f) => Number((tj.duration * f).toFixed(2)));
  const first = holds[0], rest = holds.filter((h) => h.scene !== first.scene);
  if (!rest.length) return [mid(first)];
  return [mid(first), mid(rest.reduce((x, y) => (y.to - y.from > x.to - x.from ? y : x)))];
};

const snapshot = async (dir, times, out, log) => {
  await mkdir(out, { recursive: true });
  const r = await run('npm', ['run', '--silent', 'snapshot', '--', '--at', times.join(','), '--no-end', '--keep', '-o', out], { cwd: dir, log });
  const pngs = (await readdir(out).catch(() => [])).filter((f) => f.endsWith('.png'))
    .sort((a, b) => parseFloat(a.slice(3)) - parseFloat(b.slice(3)));
  // a page error or a slow setup leaves the runtime unready: the still is not the film's frame
  const unready = /did not become render-ready/.test(r.out);
  return { r, unready, pngs: pngs.map((f) => join(out, f)) };
};

const checkStills = ({ pngs, unready }, want) => {
  const fails = [];
  if (unready) fails.push('hyperframes snapshot: runtime did not become render-ready (a page error or a slow setup; `npm run check` in the film folder names a page error)');
  let good = 0;
  for (const p of pngs) {
    const { problems } = analyse(p);
    if (!problems.length) good++;
    for (const pr of problems) fails.push(`${p.split('/').pop()}: ${pr}`);
  }
  if (pngs.length < want) fails.push(`${pngs.length} of ${want} stills written`);
  return Object.assign(fails, { good });
};

const FLAKE = /did not exit after forced shutdown/;
const NETWORK = /ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|fetch failed|socket hang up|HTTP 5\d\d/;

// Copy cuts a variant needs before the shipped example fits it, as the template's TEMPLATE.md documents them.
// Applied to the temporary film only; an edit that no longer matches the example is a failure (update this table).
const COPY_CUTS = {
  'ink typeWidth=extended': {
    source: 'ink/TEMPLATE.md, Variants',
    edits: [
      ["word: 'CLIPPING'", "word: 'CLIPPED'"],
      ["'INTEGRATE'", "'K-WEIGHT'"],
      ["words: ['{seconds}', 'SECONDS']", "words: ['{seconds}', 'SEC']"],
      ["value: '{lufs} LUFS', label: 'ITS MIX, MEASURED'", "value: '{lufs}', label: 'LUFS, ITS MIX, MEASURED'"],
    ],
  },
};
const parseCheck = (out) => {
  const lines = out.split('\n');
  const at = lines.lastIndexOf('{');
  if (at < 0) return null;
  try { return JSON.parse(lines.slice(at).join('\n')); } catch { return null; }
};

// ---------------------------------------------------------------- environment
const env = [];
const envItem = (name, ok, detail) => env.push({ name, ok, detail });
const nodeMajor = Number(process.versions.node.split('.')[0]);
envItem('node >= 22', nodeMajor >= 22, `v${process.versions.node}`);
for (const bin of ['ffmpeg', 'ffprobe']) {
  const r = spawnSync(bin, ['-version'], { encoding: 'utf8' });
  envItem(bin, r.status === 0, r.status === 0 ? (r.stdout.match(/version (\S+)/)?.[1] ?? 'found') : 'not on PATH');
}
const pins = new Map();
for (const m of allModes) {
  const pkg = await readFile(join(templates, m, 'package.json'), 'utf8');
  for (const v of pkg.matchAll(/hyperframes@([\w.-]+)/g)) pins.set(v[1], [...(pins.get(v[1]) ?? []), m]);
}
const HF = pins.size === 1 ? [...pins.keys()][0] : null;
envItem('one hyperframes pin', !!HF, HF ? `hyperframes@${HF} in all ${allModes.length} templates` : [...pins].map(([v, ms]) => `${v}: ${[...new Set(ms)].join(' ')}`).join('; ') || 'none found');
if (HF) {
  const r = await run('npx', ['--yes', `hyperframes@${HF}`, '--version'], { timeout: 5 * 60e3 });
  const ok = r.code === 0 && r.out.includes(HF);
  envItem(`npx hyperframes@${HF}`, ok, ok ? `runs (${secs(r.ms)})` : tail(r.out, 6).trim());
}
envItem('variant table', order.length > 0 && allModes.every((m) => VARIANTS[m]?.values.length >= 2),
  `CONTRACT.md "Form variant": ${order.length} rows${allModes.filter((m) => !VARIANTS[m]).length ? `; missing ${allModes.filter((m) => !VARIANTS[m]).join(', ')}` : ''}`);
for (const e of env) progress(`[env] ${e.ok ? 'PASS' : 'FAIL'} ${e.name}: ${e.detail}`);
const envOk = env.every((e) => e.ok);

// ---------------------------------------------------------------- per mode
let work;
if (opt.dir) {
  work = resolve(opt.dir);
  if ((await readdir(work).catch(() => [])).length) { console.error(`selftest: ${work} is not empty`); process.exit(2); }
  await mkdir(work, { recursive: true });
} else work = await mkdtemp(join(tmpdir(), 'filmsmith-selftest-'));
await mkdir(join(work, 'logs'), { recursive: true });

const COLS = ['new-film', 'fit', 'check', 'stills', ...(opt.variants ? ['variants'] : []), ...(opt.render ? ['render'] : [])];

const testMode = async (mode) => {
  const res = { mode, palette: '', length: '', cells: {}, fails: [], notes: [], ms: 0 };
  const start = Date.now();
  const dir = join(work, mode), log = join(work, 'logs', `${mode}.log`);
  const cell = (col, ok, text = '') => {
    res.cells[col] = { status: ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL', text };
    progress(`[${mode}] ${col} ${res.cells[col].status}${text ? ` ${text}` : ''}`);
  };
  const fail = (col, msg) => res.fails.push(`${mode} ${col}: ${msg}`);
  const skipRest = (from) => { for (const c of COLS.slice(COLS.indexOf(from))) if (!res.cells[c]) cell(c, null, 'skipped'); };
  try {
    // scaffold with the template's default palette
    const src = await readFile(join(templates, mode, 'content.js'), 'utf8');
    res.palette = src.match(/^\s*palette:\s*'([^']+)'/m)?.[1] ?? '?';
    let r;
    for (let tries = 1; ; tries++) {
      r = await run(process.execPath, [join(scripts, 'new-film.mjs'), mode, dir, '--palette', res.palette], { log });
      if (r.code === 0 || tries >= 3 || !NETWORK.test(r.out)) break;
      res.notes.push(`${mode} new-film: network error on try ${tries} (${r.out.match(NETWORK)[0]}), retried`);
      await rm(dir, { recursive: true, force: true });
      await new Promise((ok) => setTimeout(ok, 3000));
    }
    cell('new-film', r.code === 0, secs(r.ms));
    if (r.code !== 0) { fail('new-film', `exit ${r.code}\n${tail(r.out)}`); skipRest('fit'); return res; }

    // minimal PLAN.md: the skeleton new-film wrote, fill markers replaced
    const planFile = join(dir, 'PLAN.md');
    await writeFile(planFile, (await readFile(planFile, 'utf8')).replace(/<!-- fill[\s\S]*?-->/g, 'selftest: template example film, not a real plan'));

    // fit
    r = await run('npm', ['run', '--silent', 'fit'], { cwd: dir, log });
    const errs = r.out.split('\n').filter((l) => /^ERROR\b/.test(l));
    const warns = r.out.split('\n').filter((l) => /^WARN\b/.test(l));
    res.length = r.out.match(/·\s*([\d.]+) s\s*·/)?.[1] ? `${Number(r.out.match(/·\s*([\d.]+) s\s*·/)[1]).toFixed(1)} s` : '';
    cell('fit', r.code === 0 && !errs.length, `${errs.length}e ${warns.length}w`);
    if (r.code !== 0 || errs.length) { fail('fit', `exit ${r.code}\n${tail(errs.length ? errs.join('\n') : r.out)}`); skipRest('check'); return res; }
    for (const w of warns) res.notes.push(`${mode} fit: ${w}`);

    // audio, then hyperframes check (it lints assets/audio/mix.wav)
    r = await run('npm', ['run', '--silent', 'audio'], { cwd: dir, log });
    if (r.code !== 0) { cell('check', false, 'audio failed'); fail('check', `npm run audio exit ${r.code}\n${tail(r.out)}`); }
    else {
      let j, tries = 0;
      for (;;) {
        tries++;
        r = await run('npm', ['run', '--silent', 'check', '--', '--json'], { cwd: dir, log });
        j = parseCheck(r.out);
        const errors = j ? Object.values(j).filter((v) => v && typeof v === 'object' && Array.isArray(v.findings)).flatMap((v) => v.findings.filter((f) => f.severity === 'error')) : [];
        const flake = errors.length && errors.every((f) => FLAKE.test(f.message));
        if (flake && tries < 3) { res.notes.push(`${mode} check: browser shutdown failure on try ${tries}, retried`); continue; }
        const sections = j ? Object.entries(j).filter(([, v]) => v && typeof v === 'object' && 'errorCount' in v) : [];
        const ec = sections.reduce((n, [, v]) => n + v.errorCount, 0), wc = sections.reduce((n, [, v]) => n + v.warningCount, 0);
        const ok = !!j && ec === 0;
        cell('check', ok, j ? `${ec}e ${wc}w` : `exit ${r.code}, no JSON`);
        if (!ok) fail('check', j ? errors.map((f) => `[${f.code}] ${f.message}`).slice(0, 8).join('\n      ') : tail(r.out));
        if (j && wc) for (const [name, v] of sections) for (const f of v.findings.filter((x) => x.severity === 'warning').slice(0, 5)) res.notes.push(`${mode} check ${name} warning: [${f.code}] ${f.message}`);
        if (j?.browserSkipped) res.notes.push(`${mode} check: browser pass skipped by hyperframes (lint errors)`);
        break;
      }
    }

    // key-frame stills
    const tj = JSON.parse(await readFile(join(dir, 'renders', 'timing.json'), 'utf8'));
    const times = keyTimes(tj);
    const s = await snapshot(dir, times, join(dir, 'renders', 'selftest', 'default'), log);
    const sf = s.r.code !== 0 ? Object.assign([`npm run snapshot exit ${s.r.code}\n${tail(s.r.out)}`], { good: 0 }) : checkStills(s, times.length);
    cell('stills', !sf.length, `${sf.good}/${times.length} @ ${times.join(', ')} s`);
    for (const f of sf) fail('stills', f);

    // form variants
    if (opt.variants) {
      const v = VARIANTS[mode];
      if (!v) { cell('variants', false, 'not in CONTRACT.md'); fail('variants', 'mode has no row in the Form variant table'); }
      else {
        const file = join(dir, 'content.js'), orig = await readFile(file, 'utf8');
        // a variant changes some marks only (thread: where the line is drawn), so it is sampled at scene
        // mid-points, at most sixteen, and the frame where it differs most from the default is the one reported
        const sc = tj.scenes ?? [];
        const pick = sc.length <= 16 ? sc : Array.from({ length: 16 }, (_, i) => sc[Math.round((i * (sc.length - 1)) / 15)]);
        const at = [...new Set(pick.map((x) => Number(((x.start + x.end) / 2).toFixed(2))))];
        const base = await snapshot(dir, at, join(dir, 'renders', 'selftest', 'variant-base'), log);
        const done = [];
        try {
          for (const value of v.values.slice(1)) {
            const line = `  ${v.field}: '${value}', // selftest variant`;
            const re = new RegExp(`^  ${v.field}:\\s*'[^']*',?.*$`, 'm');
            let next = re.test(orig) ? orig.replace(re, line) : orig.replace(/^(\s*palette:\s*'[^']*',?.*)$/m, `$1\n${line}`);
            if (next === orig) { done.push([value, ['could not set the field in content.js']]); continue; }
            const cut = COPY_CUTS[`${mode} ${v.field}=${value}`];
            if (cut) {
              const missing = cut.edits.filter(([a]) => !next.includes(a));
              if (missing.length) { done.push([value, [`copy cut from ${cut.source} no longer matches content.js: ${missing.map(([a]) => a).join('; ')}`]]); continue; }
              for (const [a, b] of cut.edits) next = next.replace(a, b);
              res.notes.push(`${mode} variants: ${v.field}='${value}' runs on the example copy cut as ${cut.source} documents (${cut.edits.length} edits)`);
            }
            await writeFile(file, next);
            const out = join(dir, 'renders', 'selftest', `${v.field}-${value.replace(/[^\w-]+/g, '-')}`);
            const sv = await snapshot(dir, at, out, log);
            const vf = sv.r.code !== 0 ? [`npm run snapshot exit ${sv.r.code}\n${tail(sv.r.out)}`] : [...checkStills(sv, at.length)];
            // the field must change the picture: every sampled frame equal to the default means it was ignored
            const name = (p) => p.split('/').pop();
            const diffs = sv.pngs.map((p) => [p, base.pngs.find((b) => name(b) === name(p))]).filter(([, b]) => b).map(([p, b]) => [name(p), meanDiff(b, p)]).filter(([, d]) => d != null);
            const top = diffs.reduce((a, b) => (b[1] > a[1] ? b : a), ['', -1]);
            if (diffs.length && top[1] < 0.005) vf.push(`all ${diffs.length} sampled frames equal the default: the field had no effect`);
            if (diffs.length) res.notes.push(`${mode} variants: ${v.field}='${value}' frame ${top[0]} (largest difference from the default, ${top[1].toFixed(2)} / 255 mean; ${diffs.filter(([, d]) => d >= 0.005).length} of ${diffs.length} sampled frames differ)`);
            done.push([value, vf]);
          }
        } finally {
          await writeFile(file, orig);
          await run('npm', ['run', '--silent', 'fit'], { cwd: dir, log });
        }
        const bad = done.filter(([, f]) => f.length);
        cell('variants', !bad.length, `${done.length - bad.length}/${done.length} ${v.field}=${v.values.slice(1).join('|')}`);
        for (const [value, f] of bad) for (const x of f) fail('variants', `${v.field}='${value}': ${x}`);
      }
    }

    // full render and check-film
    if (opt.render && COLS.includes('render')) {
      if (mode !== opt.render) res.cells.render = { status: '—', text: '' };
      else {
        r = await run('npm', ['run', 'film'], { cwd: dir, log, timeout: 40 * 60e3 });
        if (r.code !== 0) { cell('render', false, `npm run film exit ${r.code}`); fail('render', tail(r.out)); }
        else {
          const c = await run(process.execPath, [join(scripts, 'check-film.mjs'), join(dir, 'renders', 'film.mp4'), '--film-dir', dir], { log, timeout: 20 * 60e3 });
          const rows = c.out.split('\n').filter((l) => /^ {2}(PASS|WARN|FAIL|INFO|N\/A)\s/.test(l));
          const n = (s) => rows.filter((l) => l.startsWith(`  ${s}`)).length;
          cell('render', c.code === 0, `${secs(r.ms)}; check-film ${n('PASS')} pass ${n('WARN')} warn ${n('FAIL')} fail`);
          if (c.code !== 0) fail('render', `check-film exit ${c.code}\n${rows.filter((l) => /^ {2}FAIL/.test(l)).join('\n') || tail(c.out)}`);
          for (const l of rows.filter((x) => /^ {2}WARN/.test(x))) res.notes.push(`${mode} check-film: ${l.trim().replace(/\s+/g, ' ')}`);
          res.checkFilm = c.out.trimEnd();
        }
      }
    }
  } catch (e) {
    res.fails.push(`${mode}: selftest error ${e?.stack ?? e}`);
    for (const c of COLS) if (!res.cells[c]) res.cells[c] = { status: 'FAIL', text: 'selftest error' };
  } finally {
    res.ms = Date.now() - start;
  }
  return res;
};

const results = [];
if (envOk) {
  const queue = [...modes];
  await Promise.all(Array.from({ length: Math.min(opt.jobs, queue.length) }, async () => {
    while (queue.length) results.push(await testMode(queue.shift()));
  }));
  results.sort((a, b) => modes.indexOf(a.mode) - modes.indexOf(b.mode));
}

// ---------------------------------------------------------------- report
const pad = (s, n) => String(s).padEnd(n);
const out = [];
out.push(`Filmsmith selftest  started ${new Date(t0).toISOString().slice(0, 16).replace('T', ' ')} UTC  ${process.platform}-${process.arch}`);
out.push(`films: ${work}${opt.keep ? ' (kept)' : ' (removed; --keep to retain)'}`);
out.push('', 'environment');
for (const e of env) out.push(`  ${e.ok ? 'PASS' : 'FAIL'}  ${pad(e.name, 26)} ${e.detail}`);
if (!envOk) out.push('', 'modes not run: fix the environment first');
else {
  const cw = (c) => Math.max(c.length, ...results.map((r) => `${r.cells[c]?.status ?? ''} ${r.cells[c]?.text ?? ''}`.trim().length)) + 2;
  const widths = Object.fromEntries(COLS.map((c) => [c, cw(c)]));
  out.push('', `${pad('mode', 11)}${pad('palette', 13)}${pad('length', 9)}${COLS.map((c) => pad(c, widths[c])).join('')}time`);
  for (const r of results) {
    out.push(`${pad(r.mode, 11)}${pad(r.palette, 13)}${pad(r.length || '-', 9)}${COLS.map((c) => pad(`${r.cells[c]?.status ?? '?'} ${r.cells[c]?.text ?? ''}`.trim(), widths[c])).join('')}${secs(r.ms)}`);
  }
  const fails = results.flatMap((r) => r.fails), notes = results.flatMap((r) => r.notes);
  if (fails.length) out.push('', 'failures', ...fails.map((f) => `  - ${f}`));
  if (notes.length) out.push('', 'notes', ...notes.map((n) => `  - ${n}`));
  for (const r of results) if (r.checkFilm) out.push('', `check-film (${r.mode})`, ...r.checkFilm.split('\n').map((l) => `  ${l}`));
}
const items = env.length + results.reduce((n, r) => n + Object.values(r.cells).filter((c) => c.status !== '—').length, 0);
const failed = env.filter((e) => !e.ok).length + results.reduce((n, r) => n + Object.values(r.cells).filter((c) => c.status === 'FAIL' || c.status === 'SKIP').length, 0);
out.push('', `result: ${failed ? `FAIL (${failed} of ${items} items failed or skipped)` : `PASS (${items} items)`}  total ${secs(Date.now() - t0)}`);
console.log(out.join('\n'));

if (!opt.keep) await rm(work, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
