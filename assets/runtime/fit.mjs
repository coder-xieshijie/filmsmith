#!/usr/bin/env node
// fit.mjs [film-dir] [--no-plan] — size the film from its content.
// Reads content.js and the mode's timing.rules.js, runs lib/timing.js fit(), prints the timing table,
// stamps the fitted duration onto every data-duration in index.html that carried the old one
// (HyperFrames reads those attributes statically) and writes renders/timing.json (scenes, key events,
// holds, hand-offs, content mask, and the tier arrays micro / shots / expressive / peaks with their measures;
// format in lib/timing.js timingJson()), which check-film reads. Rules at api 3 fail on the four tiers.
// Exit 1 when a scene cannot be read in the bars its type allows, when the mode's events() throws, or
// when the film folder has no PLAN.md (written by scripts/new-film.mjs: concept, through-line, banned
// defaults, nearest reference), so `npm run film` stops before rendering. --no-plan skips the PLAN.md
// check (tests of the runtime only).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fit, report, events, timingJson, deviceNotes } from './timing.js';

const args = process.argv.slice(2);
const noPlan = args.includes('--no-plan');
const dir = resolve(args.find((a) => !a.startsWith('--')) || '.');
const load = async (f) => (await import(pathToFileURL(resolve(dir, f)).href + `?t=${Date.now()}`)).default;
const content = await load('content.js');
const rules = await load('timing.rules.js');
const t = fit(content, rules);
// A template may give validate(content) (sync or async) on its rules: each returned string (or a thrown error) is an error of the
// film, so copy over a slot's limit stops here instead of at render time.
if (typeof rules.validate === 'function') {
  try { for (const msg of (await rules.validate(content)) ?? []) t.notes.push({ level: 'error', msg }); }
  catch (e) { t.notes.push({ level: 'error', msg: String(e?.message ?? e) }); }
}

// Key events: a throwing events() is an error of the film, not a crash of the tool.
let ev;
try {
  ev = events(t);
} catch (e) {
  ev = { keys: [], holds: [], handoffs: [], mask: null, micro: [], shots: [], expressive: [], peaks: [], notes: [] };
  t.notes.push({ level: 'error', msg: `events() threw: ${e?.stack?.split('\n').slice(0, 3).join(' | ') ?? e}` });
}
for (const n of ev.notes) t.notes.push(n);
// T2 devices name entries of the transition library (runtime/transitions) or the hand-off library
// (runtime/handoffs), or a device of the template's own that its rules list in `devices`; any other id is a
// warning (lib/timing.js deviceNotes), never an error.
if (ev.expressive?.length) {
  const known = new Set();
  for (const lib of ['./transitions/index.js', './handoffs/index.js']) {
    try {
      const m = await import(new URL(lib, import.meta.url).href);
      for (const x of m.list ?? []) if (x?.name ?? x?.id) known.add(x.name ?? x.id);
    } catch { /* library absent in this lib/ copy */ }
  }
  if (known.size) for (const n of deviceNotes(ev.expressive, known, t.rules)) t.notes.push(n);
}
Object.defineProperty(t, 'tiers', { value: ev.tiers ?? null, enumerable: false, configurable: true });
console.log(report(t));
const auto = !ev.holds.length && !ev.handoffs.length && ev.keys.every((k) => k.kind === 'turn');
const tierArrays = ev.micro?.length || ev.shots?.length || ev.expressive?.length || ev.peaks?.length ? `; tiers: ${ev.micro.length} micro, ${ev.shots.length} shots, ${ev.expressive.length} expressive, ${ev.peaks.length} peaks` : '';
console.log(`events: ${ev.keys.length} keys, ${ev.holds.length} holds, ${ev.handoffs.length} hand-offs${ev.mask ? `, mask ${ev.mask.join(' ')}` : ''}${auto ? ' (no events() in this mode: turn starts only)' : ''}${tierArrays}`);

mkdirSync(resolve(dir, 'renders'), { recursive: true });
// the accent for check-film: rules.accent or content.accent, else palettes.js[content.palette].accent
let accent;
try {
  const P = await import(pathToFileURL(resolve(dir, 'palettes.js')).href);
  accent = (P.default ?? P.palettes)?.[content.palette]?.accent;
} catch { /* no palettes.js, or not importable in Node: omitted */ }
const json = timingJson(t, { ...ev, notes: [] }, { accent }); // ev.notes are already in t.notes
writeFileSync(resolve(dir, 'renders', 'timing.json'), JSON.stringify(json, null, 2) + '\n');
console.log('wrote renders/timing.json');

const html = resolve(dir, 'index.html');
const src = readFileSync(html, 'utf8');
const root = src.match(/data-composition-id="main"[^>]*?data-duration="([\d.]+)"|data-duration="([\d.]+)"[^>]*?data-composition-id="main"/);
const old = root ? root[1] ?? root[2] : null;
const now = String(Number(t.duration.toFixed(3)));
if (!old) {
  console.error('index.html: no root element with data-composition-id="main" and data-duration');
  process.exit(1);
}
if (old !== now) {
  writeFileSync(html, src.split(`data-duration="${old}"`).join(`data-duration="${now}"`));
  console.log(`index.html data-duration ${old} → ${now}`);
}
// PLAN.md: no plan, no render (principle 10 in the workflow, summary B8).
let planError = false;
if (!noPlan) {
  const plan = resolve(dir, 'PLAN.md');
  if (!existsSync(plan)) {
    console.error(`ERROR: ${plan} is missing. Every film needs PLAN.md before it renders: concept sentence, through-line, banned defaults, nearest reference and motif table (scripts/new-film.mjs writes the skeleton; copy it from another film folder if this one predates it).`);
    planError = true;
  } else {
    let md = readFileSync(plan, 'utf8');
    if (/<!-- fill/.test(md)) console.log('WARN: PLAN.md still has unfilled <!-- fill --> sections');
    // the beat table between the fit markers is this run's table
    const a = md.indexOf('<!-- fit:begin -->'), z = md.indexOf('<!-- fit:end -->');
    if (a >= 0 && z > a) {
      const table = '<!-- fit:begin -->\n```\n' + report(t) + '\n```\n';
      const next = md.slice(0, a) + table + md.slice(z);
      if (next !== md) writeFileSync(plan, next);
    }
  }
}
process.exit(planError || t.notes.some((n) => n.level === 'error') ? 1 : 0);
