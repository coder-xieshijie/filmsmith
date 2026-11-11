#!/usr/bin/env node
// Start a film: a freshly copied starter (scripts/new-film-teach.mjs) → the skeleton of one film (video; web loop units use web-init).
//   npm run init -- --shared <shared-assets dir> --segments "abc:a1-c3,de:d1-e3,ez:e4-z1" [--title name] [--poster s] [--hands 4] [--force]
// The shared-assets dir is the one scripts/voice/voice.py wrote (timeline.json, words.json, contract.json, audio/, fonts/);
// relative to where you ran npm, to this project, or absolute.
// Writes:
//   film.json     title, duration (timeline total frames), shared (relative to this project), avatar (contract.json avatar_zone.windows_s),
//                 hands, poster (default: middle of the first segment); keeps "skill"
//   handoff.json  one segment per --segments entry, cut by line ID: start / end / lines come from the timeline (a boundary at a scene change
//                 takes the scene's start, otherwise the midpoint of the silence between the two lines, snapped to a frame);
//                 goal, first / last state and items empty, chapter and counter null, hands 0 — the director fills them in
//   segments/<id>.js  a one-line F.shell(ctx) stand-in per segment; the demo segments demo-*.js are deleted
//   anchors.txt   one anchor per line (name = line ID, the moment the line starts), the line's text in a comment; then cues.js is generated
// Refuses when non-demo segment files or a non-demo anchors.txt exist (pass --force to start over).
// Afterwards `npm run check -- --no-hf` passes as it is (stand-in segments).
'use strict';
const fs = require('fs'), path = require('path');
const { dir, args, readShared, lines: loadLines } = require('./common.cjs');
const o = args();
const die = (m) => { console.error(m); process.exit(1); };
if (!o.shared || !o.segments) die('usage: npm run init -- --shared <shared-assets dir> --segments "abc:a1-c3,de:d1-e3,ez:e4-z1" [--title name] [--poster s] [--hands 4] [--force]');

const cand = [process.env.INIT_CWD, dir, process.cwd()].filter(Boolean).map((b) => path.resolve(b, o.shared));
const SD = cand.find((p) => fs.existsSync(path.join(p, 'timeline.json')));
if (!SD) die(`cannot find shared assets ${o.shared} (needs timeline.json; run scripts/voice/voice.py all --dir <dir> first)`);
const sharedRel = path.relative(dir, SD) || '.';
const T = readShared('timeline.json', SD), fps = T.fps || 30, D = Math.round(T.total / fps * 1000) / 1000;
const L = loadLines(SD), idx = Object.fromEntries(L.map((l, i) => [l.id, i]));
let contract = {}; try { contract = readShared('contract.json', SD); } catch (_) { console.error('[init] no contract.json in the shared assets: no presenter windows'); }

// --segments: id:first-last, in time order, contiguous, covering every line
const segs = String(o.segments).split(',').map((x) => x.trim()).filter(Boolean).map((x) => {
  const m = x.match(/^([A-Za-z][\w-]*):([^-\s]+)(?:-([^-\s]+))?$/);
  if (!m) die(`--segments entry "${x}" must read id:firstLine-lastLine (id starts with a letter)`);
  const [, id, a, b = a] = m;
  for (const s of [a, b]) if (!(s in idx)) die(`no line ${s} (line IDs in timeline.json: ${L.map((l) => l.id).join(' ')})`);
  if (idx[b] < idx[a]) die(`segment ${id}: ${a} comes after ${b}`);
  return { id, i0: idx[a], i1: idx[b] };
});
if (new Set(segs.map((s) => s.id)).size !== segs.length) die('duplicate segment id in --segments');
segs.forEach((s, k) => { const want = k ? segs[k - 1].i1 + 1 : 0; if (s.i0 !== want) die(`segment ${s.id} must start at ${L[want] ? L[want].id : '(no lines left)'}: lines must be contiguous, none skipped or repeated`); });
if (segs[segs.length - 1].i1 !== L.length - 1) die(`the last segment must reach the last line ${L[L.length - 1].id}`);

// Boundaries: at a scene change the scene's start (timeline scenes[].in), else the midpoint between the earlier line's end and the next line's start; snapped to a frame
const sceneIn = Object.fromEntries((T.scenes || []).map((s) => [s.scene, s.in / fps]));
const fr = (t) => Math.round(Math.round(t * fps) / fps * 1000) / 1000;
const cut = (k) => {
  const prev = L[segs[k - 1].i1], next = L[segs[k].i0];
  return next.scene !== prev.scene && sceneIn[next.scene] != null ? fr(sceneIn[next.scene]) : fr((prev.v1 + next.v0) / 2);
};
segs.forEach((s, k) => { s.start = k ? cut(k) : 0; });
segs.forEach((s, k) => { s.end = k + 1 < segs.length ? segs[k + 1].start : D; s.lines = L.slice(s.i0, s.i1 + 1).map((l) => l.id); });

// Never overwrite what a director already wrote
const segDir = path.join(dir, 'segments');
const own = fs.readdirSync(segDir).filter((f) => f.endsWith('.js') && !f.startsWith('demo-'));
const anchorsFile = path.join(dir, 'anchors.txt');
const ownAnchors = fs.existsSync(anchorsFile) && !/^# demo anchors/.test(fs.readFileSync(anchorsFile, 'utf8'));
if (!o.force && (own.length || ownAnchors)) die(`found ${[...own.map((f) => 'segments/' + f), ...(ownAnchors ? ['anchors.txt'] : [])].join(', ')}: this is not a fresh starter. Add --force to start over`);

const old = JSON.parse(fs.readFileSync(path.join(dir, 'film.json'), 'utf8'));
const avatar = Object.values(((contract.avatar_zone || {}).windows_s) || {}).filter((w) => Array.isArray(w) && w.length === 2).map(([a, b]) => [a, b]).sort((x, y) => x[0] - y[0]);
const poster = o.poster !== undefined ? Number(o.poster) : Math.round((segs[0].start + segs[0].end) / 2 * 10) / 10;
const film = { title: o.title || path.basename(dir), duration: D, shared: sharedRel, ...(old.skill ? { skill: old.skill } : {}), ...(old.kit ? { kit: old.kit } : {}), bedVolume: old.bedVolume ?? 0.5, avatar, hands: o.hands !== undefined ? Number(o.hands) : 4, poster };
const fmtArr = (a) => '[' + a.map((w) => `[${w.join(', ')}]`).join(', ') + ']';
fs.writeFileSync(path.join(dir, 'film.json'), JSON.stringify(film, null, 2).replace(/"avatar": \[[\s\S]*?\n  \]/, `"avatar": ${fmtArr(avatar)}`) + '\n');

const oldH = JSON.parse(fs.readFileSync(path.join(dir, 'handoff.json'), 'utf8'));
// One object per segment, lines on one line, so the director can fill them in segment by segment
const hjs = '{\n  "_note": ' + JSON.stringify(oldH._note || '') + ',\n  "segments": [\n' + segs.map((s) => `    {
      "id": ${JSON.stringify(s.id)}, "start": ${s.start}, "end": ${s.end},
      "lines": ${JSON.stringify(s.lines).replace(/,/g, ', ')}, "hands": 0,
      "goal": "",
      "first": { "state": "", "chapter": null, "counter": null, "items": {} },
      "last": { "state": "", "chapter": null, "counter": null, "items": {} }
    }`).join(',\n') + '\n  ]\n}\n';
fs.writeFileSync(path.join(dir, 'handoff.json'), hjs);

for (const f of fs.readdirSync(segDir)) if (f.startsWith('demo-') || (o.force && f.endsWith('.js'))) fs.unlinkSync(path.join(segDir, f));
for (const s of segs) fs.writeFileSync(path.join(segDir, `${s.id}.js`), `// ${s.id} (${s.start}–${s.end} s, lines ${s.lines[0]}–${s.lines[s.lines.length - 1]}): stand-in that lays out the first and last frames from handoff.json. The segment agent replaces this line with its own picture; do not leave F.shell in a finished segment.\ndefineSegment(${JSON.stringify(s.id)}, (ctx) => F.shell(ctx));\n`);

const AN = require('./anchors.cjs'), S = AN.load();
const at = ['# Anchor list: one anchor per line; npm run anchors turns it into cues.js (format at the top of build/anchors.cjs).', '# name lineID [word][#n][$] [±s] [!]; write the word as in the narration text, once per line (several: word#2); word$ = the moment the word ends; ! marks the start of a state change the narration names.', ''];
for (const s of segs) {
  at.push(`# ---- segment ${s.id}`);
  for (const id of s.lines) { const [t0, t1] = AN.span(S, id); at.push(`# ${id} (${t0.toFixed(2)}–${t1.toFixed(2)}) ${L[idx[id]].text}`, `${id} ${id}`); }
}
at.push('', 'end end');
fs.writeFileSync(anchorsFile, at.join('\n') + '\n');
AN.build();
console.log(`started: ${segs.length} segments ${segs.map((s) => `${s.id} ${s.start}–${s.end}`).join(', ')}; ${D} s long, ${avatar.length} presenter windows, poster at ${poster} s. Next: the director fills handoff.json (goal, first / last) and anchors.txt, then npm run check -- --no-hf`);
