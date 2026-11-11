#!/usr/bin/env node
// validate.mjs — checks content.js and the run before rendering, and prints every caption with its numbers
// filled from the run (the on-screen number table). Usage (film folder): node tools/validate.mjs
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadRun, fill } from '../run.js';
import { plan } from '../timeline.js';
import { caps as capsOf, lineOf, phrasesOf, enterOf, pathCaps, ENTER, REVEAL, PACES } from '../timing.rules.js';
import { report as timingReport } from '../lib/timing.js';
import { plain } from '../fx.js';
import palettes from '../palettes.js';
import { boardGeometry, COLUMN } from '../pieces.js';
import { words } from '../lib/timing.js';

const here = dirname(fileURLToPath(import.meta.url));
export const LIMITS = { title: 16, subtitle: 44, caption: 72, line: 34, lines: 4, stats: 80, big: 16, hudWord: 12, before: 20, rules: 24, ruleLine: 30, note: 36, rows: 6, items: 6 };
// B7: text that carries information is ≥ 25 px at 1080 (the chips scale with the board)
export const MIN_PX = 25;

export const validate = async (content, { quiet = false } = {}) => {
  const errors = [], rows = [];
  const err = (s) => errors.push(s);
  let run;
  try { run = await loadRun(content); } catch (e) { err(`run "${content.run?.module}": ${e.message}`); }
  if (!run) return report(errors, rows, quiet);
  const TYPES = ['hook', 'count', 'step', 'loop', 'summary', 'probe', 'thesis'];
  const bad = content.scenes.map((c, i) => [c, i]).filter(([c]) => !TYPES.includes(c.type));
  if (bad.length) { bad.forEach(([c, i]) => err(`scene ${i + 1}: unknown type "${c.type}"; use ${TYPES.join(', ')}`)); return report(errors, rows, quiet); }
  // length follows content: lib/timing.js fit() with timing.rules.js (the same call index.html and score.mjs make)
  const S = plan(content, run), T = S.T;
  T.notes.filter((n) => n.level === 'error').forEach((n) => err(`scene ${n.scene + 1}: ${n.msg}`));
  const fitted = String(Number(T.duration.toFixed(3)));
  const html = await readFile(join(here, '..', 'index.html'), 'utf8');
  for (const m of html.matchAll(/data-duration="([\d.]+)"/g)) if (m[1] !== fitted) err(`index.html data-duration="${m[1]}" ≠ fitted ${fitted} s; run \`npm run fit\``);
  if (!palettes[content.palette]) err(`unknown palette ${content.palette}; choose ${Object.keys(palettes).join(', ')}`);
  // the stroke variant and the film's edges (2026-10-19; TEMPLATE.md "Variants")
  if (content.stroke != null && !['vector', 'sketch'].includes(content.stroke)) err(`stroke "${content.stroke}": use 'vector' (default) or 'sketch'`);
  if (content.edges != null && !['fade', 'cut'].includes(content.edges)) err(`edges "${content.edges}": use 'fade' (default) or 'cut'`);
  // edges 'cut' promises a first frame that already shows the board; a hook fades its rows in from bare ground
  if (content.edges === 'cut' && content.scenes[0]?.type === 'hook') err(`edges 'cut' opens on the first frame: start without a hook (the board is then already split), or use edges 'fade'`);
  const txt = (key, s, lim) => {
    const v = plain(fill(s, run.fills));
    rows.push([key, v]);
    if (/\{\w+\}/.test(v)) err(`${key}: unknown placeholder in "${v}"; the run fills ${Object.keys(run.fills).join(', ')}`);
    if (lim && v.length > lim) err(`${key}: ${v.length} chars > ${lim}`);
  };
  txt('title', content.title, LIMITS.title);
  txt('subtitle', content.subtitle, LIMITS.subtitle);
  for (const k of ['step', 'a', 'b']) if (content.hud?.[k] && content.hud[k].length > LIMITS.hudWord) err(`hud.${k} > ${LIMITS.hudWord} chars`);
  if ((content.hud?.before || '').length > LIMITS.before) err(`hud.before > ${LIMITS.before} chars`);
  if ((content.hud?.rules || '').length > LIMITS.rules) err(`hud.rules > ${LIMITS.rules} chars`);
  // the run
  if (run.rows.length < 1 || run.rows.length > LIMITS.rows) err(`run: 1–${LIMITS.rows} board rows (${run.rows.length})`);
  // the probe row sits below the board; under five or more rows it would cover the captions
  if (run.probe && content.scenes.some((c) => c.type === 'probe') && run.rows.length > 4) err(`run: a probe scene needs ≤ 4 board rows (${run.rows.length}); drop a row or the probe`);
  const geo = boardGeometry(run, content);
  if (geo.chip < MIN_PX) err(`run: the widest row (${Math.round(geo.widest)} px at full size) shrinks the chips to ${geo.chip.toFixed(1)} px, under ${MIN_PX}; use shorter rows or fewer chips`);
  run.steps.forEach((s, k) => {
    const line = s.rule.parts.map((p) => p.t).join(' ');
    if (line.length > LIMITS.ruleLine) err(`run step ${k + 1}: rule "${line}" > ${LIMITS.ruleLine} chars`);
    // the rule line and its value share the right third's width
    const ruleW = COLUMN.ruleIndent + (line.length + s.rule.value.length + 2) * COLUMN.labelAdv;
    if (ruleW > COLUMN.w) err(`run step ${k + 1}: rule "${line}  ${s.rule.value}" is ${Math.round(ruleW)} px wide, the column ${COLUMN.w}; shorten it`);
    if (s.counts?.note && s.counts.note.length > LIMITS.note) err(`run step ${k + 1}: histogram note "${s.counts.note}" > ${LIMITS.note} chars`);
    if ((s.counts?.items.length ?? 0) > LIMITS.items) err(`run step ${k + 1}: ≤ ${LIMITS.items} histogram items`);
    rows.push([`step ${k + 1}`, `${line}   ${s.rule.value}   ${content.hud.b} ${s.hud.b}${content.hud.a ? ` · ${content.hud.a} ${s.hud.a}` : ''}`]);
  });
  // scenes
  const covered = [];
  content.scenes.forEach((sc, i) => {
    const key = (k) => `s${i + 1}.${sc.type}.${k}`;
    const caps = capsOf(sc);
    caps.forEach((c, j) => txt(key(`caption${caps.length > 1 ? j + 1 : ''}`), lineOf(c), LIMITS.caption));
    // the expressive transition into the scene (TEMPLATE.md, "Transitions")
    if (sc.enter != null) {
      if (!ENTER[sc.enter]) err(`${key('enter')}: "${sc.enter}"; use ${Object.keys(ENTER).join(', ')}`);
      else if (!enterOf(content.scenes, i)) err(`${key('enter')}: the ${i === 0 ? 'first scene' : 'thesis'} cannot enter by a transition (${i === 0 ? 'nothing comes before it' : 'it grows out of the chips'})`);
    }
    // the probe's turn into its reveal (TEMPLATE.md, "Transitions")
    if (sc.reveal != null) {
      if (sc.type !== 'probe') err(`${key('reveal')}: only a probe turns into a reveal`);
      else if (!REVEAL[sc.reveal]) err(`${key('reveal')}: "${sc.reveal}"; use ${Object.keys(REVEAL).join(', ')}`);
      // two flows in a row: the entry's would be unchanged (left to right) or a mirror two beats away; use one
      else if (sc.enter === sc.reveal) err(`${key('reveal')}: this probe already enters by '${sc.enter}'; a second ${REVEAL[sc.reveal].device} straight after it repeats the device, so keep one of the two`);
    }
    if (sc.pace != null && (sc.type !== 'loop' || !PACES.includes(sc.pace))) err(`${key('pace')}: only a loop takes a pace, ${PACES.join(' or ')} beats a merge`);
    // a caption that rides path-type is one phrase of plain text, read only while its line is straight
    const pc = pathCaps(content.scenes, i);
    if (enterOf(content.scenes, i) === 'path' && !caps.length) err(`${key('enter')}: 'path' carries the captions; this scene has none`);
    if (enterOf(content.scenes, i + 1) === 'path' && !caps.length) err(`s${i + 2}.enter: 'path' needs a caption on the scene before it`);
    for (const [on, c] of [[pc.first, caps[0]], [pc.last, caps[caps.length - 1]]]) {
      if (!on || c == null) continue;
      if (phrasesOf(c).length > 1) err(`${key('caption')}: a caption that rides the path is one phrase (it arrives or leaves whole)`);
      if (words(fill(lineOf(c), run.fills)) > 5) err(`${key('caption')}: a caption on the path carries ≤ 5 words`);
    }
    if (sc.type === 'step') covered.push((sc.step ?? covered.length + 1) - 1);
    if (sc.type === 'loop') { const from = (sc.from ?? covered.length + 1) - 1, to = (sc.to ?? run.steps.length) - 1; for (let k = from; k <= to; k++) covered.push(k);}
    if (sc.type === 'summary') txt(key('big'), sc.big ?? '{T0} → {TN}', LIMITS.big);
    if (sc.type === 'probe' && !run.probe) err(`${key('type')}: run "${run.module}" has no probe`);
    if (sc.type === 'thesis') {
      if (!sc.lines?.length || sc.lines.length > LIMITS.lines) err(`${key('lines')}: 1–${LIMITS.lines} lines`);
      (sc.lines || []).forEach((l, j) => txt(key(`line${j + 1}`), l, LIMITS.line));
      if (sc.stats) txt(key('stats'), sc.stats, LIMITS.stats);
    }
  });
  const want = run.steps.map((_, k) => k);
  if (covered.join(',') !== want.join(',')) err(`steps shown ${covered.map((k) => k + 1).join(',') || 'none'} ≠ run steps ${want.map((k) => k + 1).join(',')}: use step scenes for the first steps and one loop for the rest`);
  if (!quiet) {
    console.log(`run ${run.module}: ${run.rows.length} rows · ${run.steps.length} steps · probe ${run.probe ? 'yes' : 'no'} · board scale ${geo.sc.toFixed(2)} (chips ${geo.chip.toFixed(0)} px, board ${Math.round(geo.boardW)} px wide)`);
    console.log(timingReport(T));
    console.log(`fills: ${JSON.stringify(run.fills)}`);
  }
  return report(errors, rows, quiet);
};

const report = (errors, rows, quiet) => {
  if (!quiet) {
    console.log('\non screen:');
    rows.forEach(([k, v]) => console.log(`  ${k.padEnd(22)} ${v}`));
    console.log(errors.length ? `\n${errors.length} error(s):\n  ` + errors.join('\n  ') : '\nok');
  }
  return errors;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const content = (await import('../content.js')).default;
  process.exit((await validate(content)).length ? 1 : 0);
}
