#!/usr/bin/env node
// validate.mjs — checks content.js against the registry before any rendering, and prints every string the
// film will show with its numbers filled in (the on-screen number table to audit against the data).
// Usage (film folder): node tools/validate.mjs        Exit 1 on any error.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { model, highlightOf } from '../compute.js';
import { plan, swaps, ENTER, listOf } from '../timeline.js';
import { fit, report } from '../lib/timing.js';
import rules from '../timing.rules.js';
import { plain } from '../fx.js';
import palettes from '../palettes.js';
import { markOf, legendOf } from '../marks.js';

const here = dirname(fileURLToPath(import.meta.url));

// character limits per slot, counted on the filled text without markup
export const LIMITS = {
  name: 24, source: 110, legend: 28,
  count: { caption: 44, note: 60, title: 52 },
  columns: { title: 52, sub: 96, callout: 28, restLabel: 24 },
  split: { title: 52, sub: 96, caption: 40, other: 32, labelIn: 40, labelOut: 40 },
  axis: { title: 52, sub: 96, callout: 28, foot: 100, seriesName: 22 },
  share: { title: 52, sub: 96, restLabel: 24 },
  timeline: { title: 52, sub: 96 },
  trend: { title: 52, sub: 96, callout: 28 },
  list: { title: 52, sub: 96, label: 64, keyWords: 5 },
  close: { title: 52, label: 28, line: 64, lineWords: 8 },
  highlight: 28, category: 24, period: 10,
};

// Mono labels are drawn at 25 px and never shrink (B7: text that carries information is ≥ 25 px). IBM Plex Mono
// advances 0.6 em per character, so a label's width is known here without a canvas: 25 px → 15 px + letter-spacing.
const CW = 1728, LABEL = 25;
const monoW = (s, ls) => [...String(s)].length * (0.6 * LABEL + ls);
const words = (s) => String(s).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const L_KEYWORDS = 5; // a list's key line (id and label) is one state of primary text (timing API 3)

export const validate = async (content, { quiet = false } = {}) => {
  const errors = [], rows = [], warnings = [];
  const err = (s) => errors.push(s);
  const m = model(content);
  // Length follows content: fit() sizes every scene; its errors are content errors (shorten or split).
  const F = fit(content, rules);
  F.notes.forEach((n) => { if (n.level === 'error') err(`fit: ${n.scene != null ? `scene ${n.scene + 1}: ` : ''}${n.msg}`); });
  plan(content, m, F); // throws on a schedule error
  const dur = Number(F.duration.toFixed(3));
  const html = await readFile(join(here, '..', 'index.html'), 'utf8');
  for (const mm of html.matchAll(/data-duration="([\d.]+)"/g)) if (Number(mm[1]) !== dur) err(`index.html data-duration="${mm[1]}" ≠ fitted ${dur} s; run \`npm run fit\``);
  if (!palettes[content.palette]) err(`unknown palette ${content.palette}; choose one of ${Object.keys(palettes).join(', ')}`);
  const len = (key, s, lim) => {
    const v = plain(m.fill(s ?? ''));
    rows.push([key, v]);
    if (lim && v.length > lim) err(`${key}: ${v.length} chars > ${lim}: "${v}"`);
  };
  m.cats.forEach((c) => { if (c.name.length > LIMITS.category) err(`category name "${c.name}" > ${LIMITS.category} chars`); });
  m.periods.forEach((p) => { if (String(p).length > LIMITS.period) err(`period "${p}" > ${LIMITS.period} chars`); });
  if (m.periods.length > 24) err(`at most 24 periods (${m.periods.length})`);
  len('source', content.source, LIMITS.source);
  if (content.edges != null && !['fade', 'cut'].includes(content.edges)) err(`edges: "${content.edges}"; use 'fade' (default) or 'cut'`);
  try {
    const mk = markOf(content);
    // mode principle 1: the legend says what one mark is
    if (mk.kind !== 'square' && /\bsquares?\b/i.test(content.legend ?? '')) err(`legend: "${content.legend}" says square but the mark is ${content.mark}; say "${mk.noun}" or leave legend out`);
  } catch (e) { err(e.message); }
  let legend = '1 square = 1 {unit}';
  try { legend = legendOf(content); } catch { /* reported above */ }
  len('legend', legend, LIMITS.legend);
  {
    // source line (left) and legend (right) share the bottom row at label size
    const src = plain(m.fill(content.source ?? '')), leg = plain(m.fill(legend));
    const w = monoW(src, 1) + 48 + monoW(leg, 1) + 26;
    if (w > CW) err(`source: "${src}" and the legend need ${Math.round(w)} px at ${LABEL} px, the row has ${CW}; delete a field (keep data, labeller, method)`);
  }
  const sw = swaps(content.scenes, m);
  const ORIGINS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'centre'];
  const climaxes = content.scenes.filter((c) => c.climax === true).length;
  if (climaxes > 1) err(`climax: ${climaxes} scenes say climax: true; mark one (its reveal is the film's climax, T3)`);
  if (!climaxes) warnings.push('no scene says climax: true: mark the one whose reveal is the film\'s climax (at 60–85 % of the length, T3)');
  content.scenes.forEach((ch, i) => {
    const L = LIMITS[ch.type];
    const key = (k) => `ch${i + 1}.${ch.type}.${k}`;
    if (!L) return err(`scene ${i + 1}: unknown type "${ch.type}"; use ${Object.keys(rules(content).types).join(', ')}`);
    len(key('name'), ch.name, LIMITS.name);
    for (const k of ['title', 'sub', 'caption', 'note', 'callout', 'foot', 'other', 'labelIn', 'labelOut', 'line'])
      if (ch[k] != null) len(key(k), ch[k], L[k] ?? 0);
    // glance lines are read at a glance: at most 6 words (more is read as primary text and fit() warns)
    for (const k of ['sub', 'note', 'foot', 'labelIn', 'labelOut'])
      if (ch[k] != null && words(plain(m.fill(ch[k]))) > 6) warnings.push(`${key(k)}: ${words(plain(m.fill(ch[k])))} words; glance text is at most 6 (it is read as primary otherwise)`);
    if (ch.highlight != null) len(key('highlight'), ch.highlight, LIMITS.highlight);
    // entries (T2) and the devices
    if (ch.enter != null) {
      if (!ENTER[ch.enter]) err(`${key('enter')}: "${ch.enter}"; use ${Object.keys(ENTER).map((x) => `'${x}'`).join(', ')}`);
      else if (i === 0) err(`${key('enter')}: the first scene has no scene to enter from`);
      else if (ch.enter === 'step' && !(content.scenes[i - 1].type === 'columns' && ch.type === 'timeline')) err(`${key('enter')}: 'step' turns a columns scene's bands into a timeline's columns; here it follows ${content.scenes[i - 1].type} into ${ch.type}`);
    }
    if (ch.enterFrom != null && !ORIGINS.includes(ch.enterFrom)) err(`${key('enterFrom')}: "${ch.enterFrom}"; use ${ORIGINS.join(', ')}`);
    if (ch.pick != null && !(ch.pick === 'roulette' && ch.type === 'columns' && ch.accent)) err(`${key('pick')}: only pick: 'roulette' on a columns scene with an accent`);
    if (ch.type === 'trend' && content.scenes[i - 1]?.type !== 'timeline') err(`${key('type')}: a trend re-encodes the timeline before it; put it right after a timeline`);
    if (ch.type === 'list') {
      try {
        const L = listOf(ch, m);
        if (L.units.length < 2) err(`${key('sel')}: ${ch.sel} lists ${L.units.length} item(s); a list needs at least 2`);
        if (L.key < 0) err(`${key('key')}: ${ch.key} matches no listed item; use 'last', 'first' or a selector of one listed item`);
        else if (ch.key && !['last', 'first'].includes(ch.key) && L.units.filter(m.match(ch.key)).length !== 1) err(`${key('key')}: ${ch.key} matches ${L.units.filter(m.match(ch.key)).length} listed items; it must match one`);
        const u = L.units[L.key];
        if (u && !u.label) err(`${key('sel')}: the data items have no label; a list shows each item's id and label (data.items[].label)`);
        if (u) {
          const line = `${u.id ?? ''} ${u.label ?? ''}`.trim();
          rows.push([key('key'), line + (u.note ? ` · ${u.note}` : '')]);
          if (words(line) > L_KEYWORDS) err(`${key('key')}: the key line "${line}" has ${words(line)} words; it is read in one state (≤ ${L_KEYWORDS}): choose another key or shorten the data label`);
          if (u.note && words(u.note) > 6) err(`${key('key')}: the key's note "${u.note}" is glance text: at most 6 words`);
        }
      } catch (e) { err(`${key('sel')}: ${e.message}`); }
    }
    if (ch.rest != null && ch.rest !== true) err(`${key('rest')}: \`rest\` is a timing flag (true only); the folded-band label is \`restLabel\``);
    for (const [k, ls] of [['sub', 1.2], ['note', 1.2], ['foot', 1.2]])
      if (ch[k] != null && monoW(plain(m.fill(ch[k])), ls) > CW) err(`${key(k)}: ${Math.round(monoW(plain(m.fill(ch[k])), ls))} px at ${LABEL} px > ${CW}; shorten it`);
    if (ch.type === 'close' && ch.line != null && words(plain(m.fill(ch.line))) > L.lineWords) err(`${key('line')}: ${words(plain(m.fill(ch.line)))} words > ${L.lineWords}; the closing line is read in one glance`);
    const hl = highlightOf(ch, m);
    if (hl && hl.length > LIMITS.highlight) err(`${key('highlight')}: "${hl}" > ${LIMITS.highlight} chars; set a shorter \`highlight\``);
    if (sw[i] && !/\*[^*]+\*/.test(ch.title ?? '')) warnings.push(`ch${i + 1} (${ch.type}): a new protagonist; name it in the title in *accent* so the colour is introduced, not inferred`);
    try {
      if (ch.accent) rows.push([key('accent'), `${ch.accent} = ${m.count(ch.accent)}`]);
      if (ch.type === 'count') rows.push([key('value'), m.fill(ch.value || '{n}')]);
      if (ch.type === 'columns' || ch.type === 'share') {
        const gs = m.groups(ch.top ?? (ch.type === 'columns' ? 7 : 5), ch.restLabel);
        if (gs.length > 9) err(`${key('top')}: ${gs.length} groups, at most 9`);
        gs.forEach((g) => { rows.push([key('group'), `${g.name} = ${g.n}`]); if (g.name.length > LIMITS.category) err(`${key('restLabel')}: "${g.name}" too long`); });
        if (ch.accent && !gs.some((g) => g.key !== '__rest' && m.units.some((u) => g.ids.includes(u.c) && m.match(ch.accent)(u)))) err(`${key('accent')}: no shown group matches ${ch.accent}`);
      }
      if (ch.type === 'split') {
        if (!ch.by) err(`${key('by')}: a selector is required`);
        rows.push([key('by'), `${ch.by} = ${m.count(ch.by)} / not = ${m.n - m.count(ch.by)}`]);
      }
      if (ch.type === 'axis') {
        const s = ch.series || [];
        if (s.length < 2 || s.length > 8) err(`${key('series')}: 2–8 series (${s.length})`);
        s.forEach((x) => {
          if (x.name.length > L.seriesName) err(`${key('series')}: "${x.name}" > ${L.seriesName} chars`);
          rows.push([key('series'), `${x.name} = ${m.count(ch.within && ch.within !== 'all' ? `${ch.within}&${x.sel}` : x.sel)}`]);
        });
        if (ch.accent && !s.some((x) => x.sel === ch.accent)) err(`${key('accent')}: must equal one series sel`);
      }
      if (ch.type === 'timeline' && !m.periods.length) err(`${key('type')}: timeline needs data.periods and a period per item`);
      if (ch.type === 'close') {
        const ns = ch.numbers || [];
        if (ns.length < 1 || ns.length > 3) err(`${key('numbers')}: 1–3 numbers`);
        if (ns.filter((x) => x.accent).length > 1) err(`${key('numbers')}: one accent at most`);
        ns.forEach((x) => { rows.push([key('number'), `${m.fill(x.value)} — ${x.label}`]); if (x.label.length > L.label) err(`${key('label')}: "${x.label}" > ${L.label}`); });
      }
    } catch (e) {
      err(`scene ${i + 1}: ${e.message}`);
    }
  });
  if (!quiet) {
    warnings.forEach((w) => console.log('warning: ' + w));
    console.log(`${m.n} units · ${m.cats.length} categories · ${m.flags.length} flags · ${m.periods.length} periods`);
    console.log(report(F));
    console.log('\non screen:');
    rows.forEach(([k, v]) => console.log(`  ${k.padEnd(26)} ${v}`));
    console.log(errors.length ? `\n${errors.length} error(s):\n  ` + errors.join('\n  ') : '\nok');
  }
  return errors;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const content = (await import('../content.js')).default;
  const errors = await validate(content);
  process.exit(errors.length ? 1 : 0);
}
