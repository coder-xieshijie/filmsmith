#!/usr/bin/env node
// Anchor list: anchors.txt (the director writes it, one anchor per line) → cues.js (segments read ctx.T.<name>). Times come from the
// shared assets' words.json (word timestamps from scripts/voice/voice.py).
//   npm run anchors                    regenerate cues.js from anchors.txt; on any error, list every error, exit 1, leave cues.js untouched
//   npm run anchors -- <lineID> [word] query only: print each character's time in that line, or the word's start and end
// Each line of anchors.txt (# starts a comment):
//   name lineID               the moment the line starts (its first character)
//   name lineID word          the moment the word's first character starts; write the word as in the narration text (narration.json;
//                             spaces and punctuation ignored); it must occur once in the line
//   name lineID word#2        its second occurrence
//   name lineID word$         the moment the word's last character ends; a bare $ is the end of the line
//   name lineID word +0.3     shifted by 0.3 s (−0.5 earlier), for "move just before it is said"
//   name 33.0                 not tied to a word: seconds; `name end` is the film's length
//   name lineID word !         also marks the start of a state change the narration names (move to storage, store back, a scene
//   name lineID word !2.5      change): the review packet shows each marked one as before / during / after (frames at −0.2 s, half the
//                              change, the change + 0.3 s; the change lasts 1.5 s unless written after the !)
// The times in the comments are the line's first and last character as anchors resolve them: word times from the transcript, which
// run about 0.1 s ahead of the voiced span in timeline.json (silence detection); that small lead suits the picture.
// When the transcript misheard characters, the narration text is aligned onto it by edit distance and the time is taken from the alignment;
// such anchors print a note "estimated by alignment". A word missing from the line, a repeated word without #n, an unknown line ID or a
// duplicate name are errors; nothing silently takes the first match.
'use strict';
const fs = require('fs'), path = require('path');
const { dir, sharedDir, readShared, lines: loadLines, args } = require('./common.cjs');

const norm = (s) => [...String(s).toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')];
const r3 = (x) => Math.round(x * 1000) / 1000;

// Per-character times of one line: each transcribed word's span is split evenly over its characters; the narration text is aligned onto them by edit distance
function lineChars(L, words) {
  const W = [];
  for (const w of words.filter((x) => x.line === L.id)) {
    const cs = norm(w.text), k = cs.length;
    cs.forEach((c, q) => W.push({ c, s: w.start + (w.end - w.start) * q / k, e: w.start + (w.end - w.start) * (q + 1) / k }));
  }
  const N = norm(L.text), n = N.length, m = W.length;
  const D = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j - 1] + (N[i - 1] === W[j - 1].c ? 0 : 1), D[i - 1][j] + 1, D[i][j - 1] + 1);
  const map = new Array(n).fill(-1);
  for (let i = n, j = m; i > 0 && j > 0;) {
    if (D[i][j] === D[i - 1][j - 1] + (N[i - 1] === W[j - 1].c ? 0 : 1)) { map[i - 1] = j - 1; i--; j--; }
    else if (D[i][j] === D[i - 1][j] + 1) i--; else j--;
  }
  // Characters with no match: interpolate by position between the matched neighbours
  const chars = N.map((c, i) => {
    if (map[i] >= 0) { const w = W[map[i]]; return { c, s: w.s, e: w.e, exact: w.c === c, heard: w.c }; }
    let p = i - 1; while (p >= 0 && map[p] < 0) p--;
    let q = i + 1; while (q < n && map[q] < 0) q++;
    const a = p >= 0 ? W[map[p]].e : L.v0, b = q < n ? W[map[q]].s : L.v1, g = q - p - 1;
    return { c, s: a + (b - a) * (i - p - 1) / g, e: a + (b - a) * (i - p) / g, exact: false, heard: '' };
  });
  return { chars, heard: W.map((w) => w.c).join(''), N: N.join('') };
}

function load() {
  const D = sharedDir();
  const L = loadLines(D), words = readShared('words.json', D).words;
  const T = readShared('timeline.json', D);
  const cache = {};
  const get = (id) => { const l = L.find((x) => x.id === id); if (!l) return null; return (cache[id] = cache[id] || { L: l, ...lineChars(l, words) }); };
  return { L, get, end: r3(T.total / (T.fps || 30)), shared: D };
}

// Resolve one anchor to { t, note }, or throw
function resolve(S, lineId, spec = '', off = 0) {
  const x = S.get(lineId);
  if (!x) throw new Error(`no line ${lineId} (line IDs in timeline.json: ${S.L.map((l) => l.id).join(' ')})`);
  const { chars, N } = x;
  if (!chars.length) throw new Error(`line ${lineId} has no characters`);
  let atEnd = false, nth = 0, w = spec;
  if (w.endsWith('$')) { atEnd = true; w = w.slice(0, -1); }
  const m = w.match(/^(.*)#(\d+)$/); if (m) { w = m[1]; nth = Number(m[2]); }
  let i0 = 0, i1 = chars.length - 1;
  if (w) {
    const k = norm(w).join(''), hits = [];
    if (!k) throw new Error(`word "${w}" is empty once spaces and punctuation are removed`);
    for (let p = N.indexOf(k); p >= 0; p = N.indexOf(k, p + 1)) hits.push(p);
    if (!hits.length) throw new Error(`line ${lineId} has no "${w}". Text: ${x.L.text}`);
    if (hits.length > 1 && !nth) throw new Error(`"${w}" occurs ${hits.length} times in line ${lineId}: write ${w}#1 … ${w}#${hits.length} to say which`);
    if (nth && !hits[nth - 1]) throw new Error(`"${w}" occurs only ${hits.length} times in line ${lineId}, there is no #${nth}`);
    i0 = hits[(nth || 1) - 1]; i1 = i0 + k.length - 1;
  }
  const c = atEnd ? chars[i1] : chars[i0];
  const span = w ? chars.slice(i0, i1 + 1) : [c];
  const note = span.every((z) => z.exact) ? '' : `estimated by alignment (transcript heard "${span.map((z) => z.heard || '·').join('')}")`;
  return { t: r3((atEnd ? c.e : c.s) + off), note };
}

// A line's first and last character as anchors resolve them (`name lineID` and `name lineID $`)
const span = (S, id) => { const c = S.get(id).chars; return [r3(c[0].s), r3(c[c.length - 1].e)]; };

function parse(file) {
  const out = [], errs = [];
  fs.readFileSync(file, 'utf8').split('\n').forEach((raw, k) => {
    const s = raw.replace(/\s+#\s.*$/, '').trim();
    if (!s || s.startsWith('#')) return;
    const f = s.split(/\s+/), at = `anchors.txt line ${k + 1}`;
    let change = null;
    const mk = f.length > 2 && f[f.length - 1].match(/^!(\d+(?:\.\d+)?)?$/);
    if (mk) { change = mk[1] ? Number(mk[1]) : 1.5; f.pop(); }
    if (!/^[A-Za-z_$][\w$]*$/.test(f[0])) return errs.push(`${at}: name "${f[0]}" must be a JS identifier (starting with a letter)`);
    if (f.length === 2 && (/^-?\d+(\.\d+)?$/.test(f[1]) || f[1] === 'end')) return out.push({ name: f[0], lit: f[1], change, at });
    let spec = f[2] || '', off = f[3];
    if (/^[+-]\d/.test(spec) && off === undefined) { off = spec; spec = ''; }
    if (f.length > 4 || (off !== undefined && !/^[+-]\d+(\.\d+)?$/.test(off))) return errs.push(`${at}: write "name lineID [word][#n][$] [±s] [!]"`);
    out.push({ name: f[0], line: f[1], spec, off: off ? Number(off) : 0, change, at });
  });
  return { list: out, errs };
}

function build() {
  const file = path.join(dir, 'anchors.txt');
  if (!fs.existsSync(file)) { console.error('no anchors.txt (npm run init writes one with an anchor per line; format at the top of build/anchors.cjs)'); process.exit(1); }
  const S = load(), { list, errs } = parse(file), seen = {}, notes = [];
  for (const a of list) {
    if (seen[a.name]) { errs.push(`${a.at}: name ${a.name} repeats ${seen[a.name]}`); continue; }
    seen[a.name] = a.at;
    try {
      if (a.lit !== undefined) a.t = a.lit === 'end' ? S.end : Number(a.lit);
      else { const r = resolve(S, a.line, a.spec, a.off); a.t = r.t; if (r.note) notes.push(`${a.name} (${a.line} ${a.spec}) ${r.note}`); }
    } catch (e) { errs.push(`${a.at}: ${e.message}`); }
  }
  if (errs.length) { console.error(errs.join('\n')); console.error(`anchors.txt has ${errs.length} errors; cues.js unchanged`); process.exit(1); }
  const body = [];
  let cur = null;
  for (const a of list) {
    if (a.line && a.line !== cur) { cur = a.line; const [t0, t1] = span(S, cur); body.push(`    // ${cur} (${t0.toFixed(2)}–${t1.toFixed(2)}) ${S.get(cur).L.text}`); }
    body.push(`    ${a.name}: ${a.t},`);
  }
  const js = `// Generated by build/anchors.cjs from anchors.txt and the shared assets' words.json; do not edit: change anchors.txt, then npm run anchors.
// Narration anchor times (seconds); segments read ctx.T.<name>. Sound cues are not here: segments call ctx.hit() where the picture lands.
(function (root) {
  const T = {
${body.join('\n')}
  };
  // State changes marked with ! in anchors.txt: anchor name → seconds the change lasts (scripts/review-packet.mjs shows each one)
  const CHANGES = ${JSON.stringify(Object.fromEntries(list.filter((a) => a.change != null).map((a) => [a.name, a.change])))};
  root.CUES = { T, CHANGES };
})(typeof window !== 'undefined' ? window : globalThis);
`;
  fs.writeFileSync(path.join(dir, 'cues.js'), js);
  for (const n of notes) console.error('[anchors] ' + n);
  const nc = list.filter((a) => a.change != null).length;
  console.log(`cues.js: ${list.length} anchors, ${nc} marked as state changes${notes.length ? ` (${notes.length} estimated by alignment, see above)` : ''}`);
}

function query(id, w) {
  const S = load();
  if (!w) {
    const x = S.get(id);
    if (!x) { console.error(`no line ${id}`); process.exit(1); }
    const [t0, t1] = span(S, id);
    console.log(`${id} (${t0.toFixed(2)}–${t1.toFixed(2)}) ${x.L.text}\ntranscript: ${x.heard}`);
    console.log(x.chars.map((c) => `${c.c}${c.s.toFixed(2)}${c.exact ? '' : '?'}`).join(' '));
    return;
  }
  try { const a = resolve(S, id, w), b = resolve(S, id, w.replace(/\$$/, '') + '$'); console.log(`${id} ${w}: ${a.t} – ${b.t}${a.note ? '  ' + a.note : ''}`); }
  catch (e) { console.error(e.message); process.exit(1); }
}

if (require.main === module) {
  const o = args();
  if (o._.length) query(o._[0], o._[1]); else build();
}
module.exports = { build, resolve, load, parse, span };
