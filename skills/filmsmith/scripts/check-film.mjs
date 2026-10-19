#!/usr/bin/env node
// check-film.mjs <film.mp4> [--film-dir <dir>] [--timing <timing.json>] [--mask x,y,w,h] [--accent #rrggbb]
//                [--no-text] [--json]
// Measures a rendered film against the delivery gates and the rhythm checks, with ffprobe / ffmpeg only.
// Each check prints PASS, WARN, FAIL, INFO or N/A; N/A means the film gave nothing to check (an
// event-based check without events never passes by default). Exit code 1 when any check FAILs.
//
// Timing comes from <film-dir>/renders/timing.json (written by `npm run fit`): scene table, key events,
// holds, handoffs and the content mask. Older films without it fall back to content.js and the mode's
// fit(); the checks that need events, holds, handoffs or the mask then report N/A.
//
//   format      1920×1080, 30 fps; duration and frame count; rendered length vs the fitted length
//   loudness    integrated −15..−13 LUFS (target −14), true peak ≤ −1.5 dBTP, LRA; short-term max ≤ I + 5 LU;
//               momentary jumps > 6 LU over the 2 s before (keys of kind `drop`, or with `drop: true`, excepted)
//   black       no black run ≥ 0.1 s outside the first and last 0.2 s
//   flashes     ≤ 3 flashes in any 1 s in any 1/3- or 1/4-frame window; red flashes counted separately
//   cuts        hard cuts against the beat grid; scene starts on a beat, `turn` scenes on a bar line
//   keys        each key event on a beat (turn and claim on a bar line) within 2 frames; a picture event
//               that stands out at the key (onset or start; settle or stop for land, end and turn); an
//               audio onset (broadband) for land, stamp, accent and turn
//   stills      per scene, the longest still stretch inside the mask, against a noise floor per colour and
//               per block (grain, ambient drift); over `lastStillBars` bars on a scene that is not a rest is
//               a WARN (api 3 rules: over `holdMaxBeats` beats outside rest scenes and pause holds is a FAIL);
//               the longest slow passage (beats with < 20 % visible motion)
//   handoffs    frame difference across each handoff ≤ 1.5 × the 95th percentile of the pairs around it
//   holds       still again within 0.3 s of each hold's start; still time in holds vs primary reading time
//   rhythm      scene-length CV, runs of equal-length scenes (≥ 4 WARN), closing stillness (> 1 bar + 3 s WARN)
//   tiers       the four tiers of change (principles 4 and 5, 2026-10-19) on timing.json's declared events, through
//               lib/timing.js tiers(): T0 gaps between changes, T1 composition lengths (median, max, CV, first 5 s),
//               T2 expressive transitions (count, device repeats, length), T3 peaks (count, climax position), hold
//               lengths. FAIL / WARN only when the rules declare api 3 (timing.json rulesApi); INFO otherwise.
//               Pixel estimates, always INFO: picture onsets per second and the longest gap between them (T0),
//               large-area changes (T2), the loudest short-term moment as a share of the length (T3)
//   INFO        type-size levels, smallest text and worst text contrast on hold frames (pixel estimates),
//               accent area, octave balance against a reference curve, 4-bar self-similarity, limiting
// Measurement details and draft thresholds are in lib/*.mjs. Without renders/timing.json, --mask and
// --accent supply what the template would export.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { probe, ebur128, decodePcm, grabFrame, keyframes } from './lib/media.mjs';
import { analysePicture } from './lib/picture.mjs';
import { motionModel, eventStrength, longestStill, stillRuns, stillFrames, slowRun, pictureEvent, handoffRatio, settleFrames, quantile, VISIBLE, pictureOnsets, largeChanges, longestStillOutside } from './lib/motion.mjs';
import { flashes } from './lib/flash.mjs';
import { jumps, onsets as audioOnsets, octaves, balance, selfSimilarity, limiting } from './lib/audio.mjs';
import { findLines, levels } from './lib/text.mjs';
import { loadTiming } from './lib/timing.mjs';
import { tiers as tierMeasures, DEFAULTS as TIMING_DEFAULTS } from '../assets/runtime/timing.js';

// ---------------------------------------------------------------- arguments
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const json = bool('--json'), noText = bool('--no-text');
const filmDir = flag('--film-dir'), timingPath = flag('--timing'), maskArg = flag('--mask'), accentArg = flag('--accent');
const file = args[0];
if (!file || !existsSync(file)) {
  console.error('usage: check-film.mjs <film.mp4> [--film-dir <dir>] [--timing <timing.json>] [--mask x,y,w,h] [--accent #rrggbb] [--no-text] [--json]');
  process.exit(2);
}

// ---------------------------------------------------------------- inputs
const pr = probe(file);
if (!pr.video) { console.error('no video stream'); process.exit(2); }
const { video: vs, audio: as, duration, frames } = pr;
const fps = pr.fps || 30, frame = 1 / fps;
const T = await loadTiming({ filmDir, timingPath });
if (maskArg) T.mask = maskArg.split(',').map(Number);
if (accentArg) { T.accent = accentArg; T.accentFrom = '--accent'; }
const { beat, bar, t0, scenes, keys, holds, handoffs, mask } = T;
const hasEvents = T.source === 'timing.json';
// api 3 rules (timing.json rulesApi ≥ 3): the four tiers FAIL where measurable; below it they are INFO.
const v3 = (T.rulesApi ?? 0) >= 3;
const L = { ...TIMING_DEFAULTS, ...(T.limits || {}) };

const checks = [];
// item: the checklist line or report rule the check measures (for references/checklist.md ⚙ marks).
const add = (name, status, value, detail = '', item = '') => checks.push({ name, status, value, detail, item });
const f2 = (x, d = 2) => (x == null || !Number.isFinite(x) ? String(x) : Number(x.toFixed(d)));
const ts = (t) => `${t.toFixed(2)} s`;
const sgn = (x) => (x > 0 ? '+' : '') + f2(x, 1);
const nearestGrid = (t, unit) => { const n = Math.round((t - t0) / unit); return { n, off: (t - (t0 + n * unit)) / frame }; };

// ---------------------------------------------------------------- format
add('resolution', vs.width === 1920 && vs.height === 1080 ? 'PASS' : 'FAIL', `${vs.width}x${vs.height}`, 'gate 1920x1080', 'P0 format');
add('fps', Math.abs(fps - 30) < 0.01 ? 'PASS' : 'FAIL', f2(fps, 3), 'gate 30', 'P0 format');
add('duration', 'INFO', f2(duration, 3), `${frames} frames`);
if (frames && fps) { const expect = Math.round(duration * fps); if (Math.abs(frames - expect) > 1) add('frame count', 'WARN', frames, `duration × fps = ${expect}`, 'P0 format'); }
add('timing', T.source === 'timing.json' ? (T.warnings.length ? 'WARN' : 'INFO') : T.source ? 'WARN' : 'N/A', T.source ?? 'none',
  [T.source === 'timing.json' ? `api ${T.api}, rules api ${T.rulesApi ?? '?'}${v3 ? ' (tiers enforced)' : ''}` : T.source ? 'no renders/timing.json: event, hold, handoff and mask checks are N/A' : 'pass --film-dir (or --timing) to check against the film\'s timing', ...T.warnings].join('; '));
if (T.duration) {
  const d = Math.abs(duration - T.duration);
  add('duration vs fit', d <= 2 * frame ? 'PASS' : 'WARN', f2(d, 3), `fitted length ${f2(T.duration, 3)} s; gate ≤ 2 frames`, 'P0 format');
}

// ---------------------------------------------------------------- sound
let loud = null, pcm = null, onsets = null;
if (!as) {
  add('audio', 'FAIL', 'none', 'no audio stream', 'P0 loudness');
} else {
  loud = ebur128(file);
  const { I, LRA, TP } = loud;
  add('loudness', I >= -15 && I <= -13 ? 'PASS' : 'FAIL', I, 'LUFS, gate −15..−13 (target −14)', 'P0 loudness');
  add('true peak', TP <= -1.5 ? 'PASS' : 'FAIL', TP, 'dBTP, gate ≤ −1.5', 'P0 loudness');
  add('loudness range', 'INFO', LRA, 'LU');
  const S = loud.S.filter((v) => v > -70);
  if (S.length) {
    const sMax = Math.max(...S), at = loud.t[loud.S.indexOf(sMax)];
    add('short-term max', sMax - I <= 5 ? 'PASS' : 'WARN', f2(sMax - I, 1), `LU over I (${f2(sMax, 1)} LUFS at ${ts(at)}); limit I + 5 LU (EBU R 128 s1)`, 'principle 1 no sudden jumps');
  }
  const drops = keys.filter((k) => k.drop);
  const J = jumps(loud, I).map((j) => ({ ...j, drop: drops.some((k) => Math.abs(k.t - j.t) <= 0.5) }));
  const bad = J.filter((j) => !j.drop);
  add('loudness jumps', bad.length ? 'WARN' : 'PASS', bad.length,
    (bad.length ? bad.map((j) => `${ts(j.t)} +${f2(j.rise, 1)} LU`).join(', ') + '; ' : '') + `momentary rise over the median of the 2 s before; limit 6 LU${drops.length ? `; ${J.length - bad.length} at drop keys excepted` : ''}`, 'principle 1 no sudden jumps');
  const ad = Number(as.duration || 0);
  if (ad && Math.abs(ad - duration) > 0.1) add('audio length', 'WARN', f2(ad, 3), `video is ${duration.toFixed(3)} s`, 'P0 format');
  pcm = decodePcm(file);
  if (pcm) onsets = audioOnsets(pcm.mono, fps);
}

// ---------------------------------------------------------------- picture
const pic = await analysePicture(file, { mask, accent: T.accent });
const kf = keyframes(file);
const M = motionModel(pic, kf, fps), MC = motionModel(pic, kf, fps, { channel: 'colour' }), E = eventStrength(MC);
const floor = M.floor, thrNote = `still = every block under its colour's noise threshold (${f2(M.thrRange[0])}–${f2(M.thrRange[1])}; film-wide floor ${f2(floor)})`;
const maskNote = mask ? `mask ${mask.join(',')}` : 'whole frame (no mask: HUD and ambient motion count as motion)';

const edge = 0.2;
const badBlack = pic.blacks.filter((b) => Math.min(b.end, duration - edge) - Math.max(b.start, edge) >= 0.1);
add('black frames', badBlack.length ? 'FAIL' : 'PASS', badBlack.length,
  badBlack.length ? badBlack.map((b) => `${b.start.toFixed(2)}–${b.end.toFixed(2)} s`).join(', ') : `${pic.blacks.length} run(s), all within the first/last ${edge} s`, 'P0 format');

const fl = flashes(pic, fps);
const where = (w) => (w.window ? `${ts(w.at)}, window ${w.window.x},${w.window.y} ${w.window.w}×${w.window.h}` : '');
const bySize = (k) => `1/3 frame ${fl.bySize.third[k].flashes}, 1/4 frame ${fl.bySize.quarter[k].flashes}`;
add('flashes', fl.general.flashes > 3 ? 'FAIL' : 'PASS', fl.general.flashes, `most in any 1 s (${bySize('general')})${fl.general.flashes ? ` at ${where(fl.general)}` : ''}; gate ≤ 3 (WCAG 2.3.1, BT.1702)`, 'P0 flashes');
add('red flashes', fl.red.flashes > 3 ? 'FAIL' : 'PASS', fl.red.flashes, `saturated-red flashes in any 1 s (${bySize('red')})${fl.red.flashes ? ` at ${where(fl.red)}` : ''}; gate ≤ 3`, 'P0 flashes');

// Hard cuts: ffmpeg's scene score (min(mafd, |Δmafd|) / 100) above 0.3, at most one per 2 frames.
let cuts = [];
for (let f = 1; f < pic.n; f++) if (pic.scene[f] > 0.3 && !(cuts.length && f - cuts.at(-1).f <= 2)) cuts.push({ f, t: f / fps, score: pic.scene[f] });
if (!cuts.length) add('cuts on beat', 'N/A', '0 cuts', 'no hard cut detected (transforms and fades are checked as key events and handoffs)', 'P1 cuts and landings');
else if (beat) {
  for (const c of cuts) { const g = nearestGrid(c.t, beat); c.beat = g.n; c.offFrames = f2(g.off); }
  const off = cuts.filter((c) => Math.abs(c.offFrames) > 2);
  add('cuts on beat', off.length ? 'WARN' : 'PASS', `${cuts.length - off.length}/${cuts.length}`,
    off.length ? 'off by > 2 frames: ' + off.map((c) => `${ts(c.t)} (${sgn(c.offFrames)} f from beat ${c.beat})`).join(', ') : `${T.bpm} BPM, t0 ${t0}`, 'P1 cuts and landings');
} else add('cuts on beat', 'N/A', `${cuts.length} cuts`, 'no tempo: pass --film-dir to check them against the beat grid', 'P1 cuts and landings');

if (scenes.length && beat) {
  const off = [];
  for (const s of scenes.slice(1)) {
    const g = nearestGrid(s.start, s.turn ? bar : beat);
    if (Math.abs(g.off) > 2) off.push(`${s.type}@${ts(s.start)} ${sgn(g.off)} f from ${s.turn ? 'bar line' : 'beat'}`);
  }
  add('scene starts', off.length ? 'WARN' : 'PASS', `${scenes.length - 1 - off.length}/${scenes.length - 1}`, off.length ? off.join(', ') : 'every scene starts on a beat; `turn` scenes on a bar line (from the scene table)', 'P1 cuts and landings');
} else add('scene starts', 'N/A', '-', 'no scene table', 'P1 cuts and landings');

// Key events. Only kinds that land something carry a sound of their own (land, stamp, accent, turn);
// claim and end keys without an onset are listed but not warned.
const SOUND_KINDS = ['land', 'stamp', 'accent', 'turn'];
const keyRows = keys.map((k) => {
  const unit = ['turn', 'claim'].includes(k.kind) ? bar : beat;
  const g = unit ? nearestGrid(k.t, unit) : { off: NaN };
  const f = Math.round(k.t * fps);
  const pe = pictureEvent(MC, E, f, { landing: ['land', 'end', 'turn'].includes(k.kind) });
  let au = null;
  let hf = null;
  if (onsets) for (let d = -1; d <= 1; d++) {
    const r = onsets.broadband[f + d] ?? 0, h = onsets.high[f + d] ?? 0;
    if (r >= 3 && (!au || r > au.rise)) au = { off: d, rise: Number(r.toFixed(1)) };
    if (h >= 3 && (!hf || h > hf.rise)) hf = { off: d, rise: Number(h.toFixed(1)) };
  }
  return { ...k, grid: unit === bar ? 'bar' : 'beat', offFrames: f2(g.off), picture: pe, audio: au, audioHigh: hf, needsSound: SOUND_KINDS.includes(k.kind) };
});
if (!hasEvents || !keys.length) {
  for (const n of ['keys on beat', 'keys: picture', 'keys: sound']) add(n, 'N/A', '-', hasEvents ? 'timing.json lists no key events' : 'no timing.json key events', n === 'keys: sound' ? 'P2 landing sounds' : 'P1 cuts and landings');
} else {
  const off = keyRows.filter((k) => !(Math.abs(k.offFrames) <= 2));
  add('keys on beat', off.length ? 'WARN' : 'PASS', `${keys.length - off.length}/${keys.length}`, off.length ? off.map((k) => `${k.kind}@${ts(k.t)} ${sgn(k.offFrames)} f from ${k.grid}`).join(', ') : 'within 2 frames; turn and claim on a bar line', 'P1 cuts and landings');
  // A key within the first 2 frames has no frame or sound before it to rise from: it is listed, not judged.
  const first = keyRows.filter((k) => k.t * fps < 2), firstNote = first.length ? `; not measurable (no frame before them): ${first.map((k) => `${k.kind}@${ts(k.t)}`).join(', ')}` : '';
  const judged = keyRows.filter((k) => !first.includes(k));
  const np = judged.filter((k) => !k.picture);
  add('keys: picture', !judged.length ? 'N/A' : np.length ? 'WARN' : 'PASS', `${judged.length - np.length}/${judged.length}`, (np.length ? 'no picture event standing out at the key (onset or start; settle or stop for land, end and turn): ' + np.map((k) => `${k.kind}@${ts(k.t)}`).join(', ') + '; ' : '') + maskNote + firstNote, 'P1 cuts and landings');
  const need = judged.filter((k) => k.needsSound), na = need.filter((k) => !k.audio), quiet = judged.filter((k) => !k.needsSound && !k.audio);
  const hfCount = keyRows.filter((k) => k.audioHigh).length;
  add('keys: sound', !onsets ? 'N/A' : !need.length ? 'N/A' : na.length ? 'WARN' : 'PASS', `${need.length - na.length}/${need.length}`,
    (na.length ? 'no audio onset (broadband rise ≥ 3 dB over 2 frames) within 1 frame: ' + na.map((k) => `${k.kind}@${ts(k.t)}`).join(', ') + '; ' : '') + `kinds ${SOUND_KINDS.join(', ')}${quiet.length ? `; silent ${quiet.map((k) => `${k.kind}@${ts(k.t)}`).join(', ')} (no sound required)` : ''}${firstNote}; INFO: ${hfCount}/${keyRows.length} keys also have a rise above 1.5 kHz (a bed with a beat on every beat also rises here: a screen, not proof)`, 'P2 landing sounds');
}

// Stillness per scene.
// api 3: a fully still stretch is at most holdMaxBeats beats, outside rest scenes and pause holds (a claim being
// read, measured against pauseMaxBars). api 2: the hold after a page's last step, lastStillBars.
const stillLimit = v3 && beat ? L.holdMaxBeats * beat : bar ? T.lastStillBars * bar : 4;
const pauseSkip = holds.filter((h) => h.pause).map((h) => [Math.round(h.from * fps), Math.round(h.to * fps)]);
const sceneRows = scenes.map((s) => {
  const f0 = Math.round(s.start * fps), f1 = Math.round(s.end * fps);
  const ls = v3 ? longestStillOutside(M, f0, f1, pauseSkip) : longestStill(M, f0, f1);
  return { i: s.i, type: s.type, start: s.start, dur: s.end - s.start, rest: s.rest, still: ls.frames / fps, stillAt: ls.at / fps };
});
if (sceneRows.length) {
  // Same 2-frame tolerance as the beat grid: stills land on the grid, so a hold of exactly 2 bars can
  // measure a frame or two longer.
  const over = sceneRows.filter((r) => r.still > stillLimit + 2 * frame + 1e-6 && !r.rest);
  add('scene stills', over.length ? (v3 ? 'FAIL' : 'WARN') : 'PASS', `${over.length} over`,
    (over.length ? over.map((r) => `${r.type}@${ts(r.start)} still ${f2(r.still, 1)} s from ${ts(r.stillAt)}${bar ? ` (${f2(r.still / bar, 1)} bars)` : ''}`).join(', ') + '; ' : '') + `limit ${v3 ? `${L.holdMaxBeats} beats (api 3; pause holds excepted)` : `${T.lastStillBars} bars`} = ${f2(stillLimit, 2)} s (+2 frames) on scenes not marked rest; ${thrNote}; ${maskNote}`, v3 ? 'P1 T0 micro changes' : 'P1 holds');
} else {
  const runs = stillRuns(M, Math.floor((stillLimit + 2 * frame) * fps) + 1);
  add('long stills', runs.length ? 'WARN' : 'PASS', runs.length,
    (runs.length ? runs.map((r) => `${ts(r.from / fps)}–${ts(r.to / fps)} (${f2((r.to - r.from) / fps, 1)} s)`).join(', ') + '; ' : '') + `no scene table: rests unknown; limit ${f2(stillLimit, 2)} s (${bar ? `${T.lastStillBars} bars` : 'no bpm, 4 s'}); ${thrNote}; ${maskNote}`, 'P1 holds');
}
if (beat) {
  const sr = slowRun(M, { beat, t0, fps });
  // Pace (principle 5, brisk): no passage of near-still beats longer than a page's last hold plus one beat,
  // and no more than half the film's beats near-still (both draft, 2026-10-18). Rest scenes are not excluded:
  // the closing card's URL hold is the expected longest run.
  const runCap = v3 ? L.microMaxGapBeats : T.lastStillBars * T.beatsPerBar + 1, closing = scenes.length ? scenes[scenes.length - 1] : null;
  const inClosing = closing && sr.start >= closing.start - 1e-6;
  const slowBad = (sr.beats > runCap && !inClosing) || sr.share > 0.5;
  add('pace', slowBad ? 'WARN' : 'PASS', `${f2(sr.seconds, 1)} s`, `slowest passage ${sr.beats} beats from ${ts(sr.start)} with < 20 % visible motion (block change ≥ ${VISIBLE})${inClosing ? ', in the closing scene' : ''}; limit ${runCap} beats outside the closing scene; slow beats ${Math.round(sr.share * 100)} % of the film (limit 50 %)`, 'P1 brisk pace');
}

// Handoffs (07 C2).
if (!hasEvents || !handoffs.length) add('handoffs', 'N/A', '-', hasEvents ? 'timing.json lists no handoffs' : 'no timing.json handoffs', 'P1 transitions');
else {
  const rows = handoffs.map((h) => ({ ...h, ...handoffRatio(M, Math.round(h.t * fps), fps) }));
  const bad = rows.filter((r) => r.ratio > 1.5);
  add('handoffs', bad.length ? 'WARN' : 'PASS', `${rows.length - bad.length}/${rows.length}`,
    (bad.length ? bad.map((r) => `${ts(r.t)} ${f2(r.ratio, 1)}×`).join(', ') + '; ' : '') + 'frame difference across the handoff ≤ 1.5 × p95 of ordinary pairs within 1 s (07 C2, draft)', 'P1 transitions');
  handoffs.forEach((h, i) => Object.assign(h, { ratio: f2(rows[i].ratio) }));
}

// Holds (07 C6): settle within 0.3 s, then report how much of the hold is still.
const settleLimit = Math.round(0.3 * fps);
if (!hasEvents || !holds.length) add('holds settle', 'N/A', '-', hasEvents ? 'timing.json lists no holds' : 'no timing.json holds', 'P1 holds');
else {
  for (const h of holds) {
    const f0 = Math.round(h.from * fps), f1 = Math.round(h.to * fps);
    h.settle = settleFrames(M, f0, Math.max(settleLimit + 1, f1 - f0));
    const still = stillFrames(M, f0, f1);
    h.still = f2(still / fps); h.stillShare = f2(still / Math.max(1, f1 - f0));
  }
  const bad = holds.filter((h) => h.settle == null || h.settle > settleLimit);
  add('holds settle', bad.length ? 'WARN' : 'PASS', `${holds.length - bad.length}/${holds.length}`,
    (bad.length ? bad.map((h) => `${ts(h.from)} ${h.settle == null ? 'never still' : `${f2(h.settle / fps)} s`}`).join(', ') + '; ' : '') + `still again within 0.3 s of each hold's start (07 C6, draft); ${thrNote}`, 'P1 holds');
  const reading = scenes.filter((s) => s.reading && Number(s.reading.primary) > 0).map((s) => {
    const got = holds.filter((h) => h.scene === s.i).reduce((a, h) => a + Number(h.still), 0);
    return { s, got, need: Number(s.reading.primary) };
  }).filter((r) => r.got + frame < r.need);
  add('holds vs reading', 'INFO', `${reading.length} short`, reading.length ? reading.map((r) => `${r.s.type}@${ts(r.s.start)} still ${f2(r.got, 1)} s < primary ${f2(r.need, 1)} s`).join(', ') + ' (pixel stillness inside the mask; text can be readable while something else moves)' : 'still time inside holds covers each scene\'s primary reading time', 'P0 reading time');
}

// Rhythm.
if (scenes.length >= 2) {
  const d = scenes.map((s) => s.end - s.start), mean = d.reduce((a, b) => a + b) / d.length;
  const cv = Math.sqrt(d.reduce((a, x) => a + (x - mean) ** 2, 0) / d.length) / mean;
  add('scene length CV', 'INFO', f2(cv), `${d.length} scenes, mean ${f2(mean, 2)} s (Cutting 2010: lengths should vary)`, 'P1 fast and slow alternate');
  let run = 1, best = 1, at = 0;
  for (let i = 1; i < d.length; i++) { if (Math.abs(d[i] - d[i - 1]) <= frame) { run++; if (run > best) { best = run; at = i - run + 1; } } else run = 1; }
  add('equal-length run', best >= 4 ? 'WARN' : 'PASS', best, `${best} consecutive scenes of ${f2(d[at], 2)} s from scene ${at + 1}; limit 3`, 'P1 fast and slow alternate');
  const last = sceneRows.at(-1), lim = (bar ?? 0) + 3;
  add('closing still', last.still > lim ? 'WARN' : 'PASS', `${f2(last.still, 1)} s`, `longest still in the closing ${last.type}; limit 1 bar + 3 s = ${f2(lim, 2)} s`, 'P1 holds');
} else for (const n of ['scene length CV', 'equal-length run', 'closing still']) add(n, 'N/A', '-', 'no scene table', n === 'closing still' ? 'P1 holds' : 'P1 fast and slow alternate');

// ---------------------------------------------------------------- tiers (principles 4 and 5, api 3)
// Declared events through lib/timing.js tiers() (the same function `npm run fit` ran), always measured as api 3;
// the status is FAIL / WARN / PASS only for api 3 rules, INFO for older ones (their numbers are a preview).
const TIER_ITEMS = { T0: 'P1 T0 micro changes', T1: 'P1 T1 scene changes', T2: 'P1 T2 expressive transitions', T3: 'P1 T3 peaks', hold: 'P1 holds' };
let tierSummary = null;
const tierStatus = (ns) => (!v3 ? 'INFO' : ns.some((n) => n.level === 'error') ? 'FAIL' : ns.some((n) => n.level === 'warn') ? 'WARN' : 'PASS');
if (hasEvents && scenes.length && beat) {
  const TR = tierMeasures({ duration: T.duration ?? duration, beat, bar, scenes, keys, holds, micro: T.micro, shots: T.shots, expressive: T.expressive, peaks: T.peaks }, L, 3);
  const S = tierSummary = TR.summary;
  const msgs = (tier) => TR.notes.filter((n) => n.tier === tier);
  const tail = (ns) => (ns.length ? ns.map((n) => `${n.level === 'error' ? (v3 ? 'FAIL' : 'would fail') : 'warn'}: ${n.msg}`).join('; ') + '; ' : '');
  const pre = v3 ? '' : `preview (rules api ${T.rulesApi ?? '?'}, not enforced); `;
  add('T0 changes (declared)', tierStatus(msgs('T0')), `${S.t0.maxGapBeats ?? '–'} beats`, pre + tail(msgs('T0')) + `longest gap without a change ${S.t0.maxGapBeats ?? '–'} beats${S.t0.maxGapAt != null ? ` from ${ts(S.t0.maxGapAt)}` : ''}, median ${S.t0.medianGapBeats ?? '–'} beats over ${S.t0.onsets} onsets (${S.t0.declared} micro events, plus scene starts, shots, keys, expressive starts, peaks); limits median ≤ ${L.microMedianBeats}, max ≤ ${L.microMaxGapBeats} beats outside rest scenes and pause holds`, TIER_ITEMS.T0);
  add('T1 compositions', tierStatus(msgs('T1')), `${S.t1.medianSec ?? '–'} s`, pre + tail(msgs('T1')) + `${S.t1.count} compositions (${S.t1.shots} shots inside scenes), median ${S.t1.medianSec} s, max ${S.t1.maxSec} s, CV ${S.t1.cv}, ${S.t1.first} in the first ${L.firstSec} s, longest speeding-up or slowing-down run ${S.t1.run}; limits median ${L.sceneMedianSec.join('–')} s, ≤ ${L.sceneMaxSec} s each (rest, or climax with a reason, excepted), CV ≥ ${L.sceneCV}, ≥ ${L.firstScenes} in the first ${L.firstSec} s`, TIER_ITEMS.T1);
  add('T2 expressive', tierStatus(msgs('T2')), `${S.t2.count}`, pre + tail(msgs('T2')) + `${S.t2.count} expressive transitions (wants ${S.t2.range[0]}–${S.t2.range[1]}, one every ${L.expressiveEverySec.join('–')} s)${Object.keys(S.t2.devices).length ? `, devices ${Object.entries(S.t2.devices).map(([k, n]) => `${k} ×${n}`).join(', ')}` : ''}${S.t2.gapSec ? `, spacing ${S.t2.gapSec[0]}–${S.t2.gapSec[1]} s` : ''}; same device ≤ ${L.expressiveSameMax}, never twice in a row unchanged, ≤ ${L.expressiveMaxBeats} beats each`, TIER_ITEMS.T2);
  add('T3 peaks', tierStatus(msgs('T3')), `${S.t3.count}`, pre + tail(msgs('T3')) + `${S.t3.count} marked peaks${S.t3.climax ? `, climax (${S.t3.climax.kind}) at ${ts(S.t3.climax.t)} = ${Math.round(S.t3.climax.at * 100)} %` : ', no climax marked'}; ${L.peakCount.join('–')} peaks, the climax at ${L.climaxAt.map((x) => Math.round(x * 100)).join('–')} %`, TIER_ITEMS.T3);
  add('hold lengths', tierStatus(msgs('hold')), `${S.holds.count}`, pre + tail(msgs('hold')) + `${S.holds.count} declared holds (${S.holds.pauses} pause); each ≥ ${L.holdMinSec} s and ≤ ${L.holdMaxBeats} beats, a pause ≤ ${L.pauseMaxBars} bars, rest scenes excepted`, TIER_ITEMS.hold);
} else for (const [n, it] of [['T0 changes (declared)', 'T0'], ['T1 compositions', 'T1'], ['T2 expressive', 'T2'], ['T3 peaks', 'T3'], ['hold lengths', 'hold']]) add(n, 'N/A', '-', hasEvents ? 'no scene table or tempo in timing.json' : 'no renders/timing.json', TIER_ITEMS[it]);

// Pixel estimates of the tiers, always INFO: they cannot see what the template meant, only what changed.
const restRanges = scenes.filter((s) => s.rest).map((s) => [s.start, s.end]).concat(holds.filter((h) => h.pause).map((h) => [h.from, h.to]));
const inRest = (t) => restRanges.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);
const pOn = pictureOnsets(M, E, fps);
const pixelTiers = { onsets: pOn.length, perSecond: duration ? f2(pOn.length / duration) : null };
{
  const pts = [0, ...pOn, duration];
  const gaps = [];
  for (let k = 1; k < pts.length; k++) if (!inRest((pts[k - 1] + pts[k]) / 2)) gaps.push({ a: pts[k - 1], len: pts[k] - pts[k - 1] });
  const g = gaps.map((x) => x.len).sort((a, b) => a - b), worst = gaps.reduce((m, x) => (!m || x.len > m.len ? x : m), null);
  pixelTiers.medianGap = g.length ? f2(g[Math.floor((g.length - 1) / 2)]) : null;
  pixelTiers.maxGap = worst ? f2(worst.len) : null;
  add('T0 picture onsets', 'INFO', `${pixelTiers.perSecond}/s`, `${pOn.length} picture onsets (a start after stillness, or a new rise of ≥ ${VISIBLE} levels inside motion; ${maskNote}); gap between onsets outside rests: median ${pixelTiers.medianGap ?? '–'} s, longest ${pixelTiers.maxGap ?? '–'} s${worst ? ` from ${ts(worst.a)}` : ''}${beat ? ` (${f2((worst?.len ?? 0) / beat, 1)} beats; T0 wants ≤ ${L.microMaxGapBeats})` : ''}; a pixel estimate (small changes on a dark ground can stay under the noise floor), the declared count is "T0 changes (declared)"`, TIER_ITEMS.T0);
}
{
  const big = largeChanges(pic, M, fps);
  pixelTiers.large = big.map((x) => f2(x.t));
  const sp = big.slice(1).map((x, k) => x.t - big[k].t);
  add('T2 large changes', 'INFO', big.length, `${big.length} stretches where ≥ 50 % of the ${mask ? 'mask' : 'frame'} changes visibly${big.length ? ` at ${big.slice(0, 12).map((x) => f2(x.t, 1)).join(', ')}${big.length > 12 ? ', …' : ''}` : ''}${sp.length ? `; spacing ${f2(Math.min(...sp), 1)}–${f2(Math.max(...sp), 1)} s` : ''} (expressive transitions and full-frame ground changes show here; so do hard cuts between busy frames)`, TIER_ITEMS.T2);
}
if (loud) {
  const S = loud.S.filter((v) => v > -70);
  if (S.length && duration) {
    const sMax = Math.max(...S), at = loud.t[loud.S.indexOf(sMax)];
    pixelTiers.loudestAt = f2(at / duration);
    add('T3 loudest moment', 'INFO', `${Math.round((at / duration) * 100)} %`, `short-term loudness peaks at ${ts(at)} (${Math.round((at / duration) * 100)} % of the film); the climax sits at ${L.climaxAt.map((x) => Math.round(x * 100)).join('–')} %${tierSummary?.t3?.climax ? `, declared at ${Math.round(tierSummary.t3.climax.at * 100)} %` : ''}`, TIER_ITEMS.T3);
  }
}

// ---------------------------------------------------------------- INFO: text on hold frames
const textRows = [];
if (noText) add('type levels', 'N/A', '-', 'skipped (--no-text)');
else {
  let samples = holds.map((h) => ({ t: (h.from + h.to) / 2, from: 'hold' }));
  if (!samples.length) {
    samples = stillRuns(M, Math.round(0.5 * fps)).sort((a, b) => b.to - b.from - (a.to - a.from)).slice(0, 12)
      .map((r) => ({ t: (r.from + r.to) / 2 / fps, from: 'still run' }));
  }
  if (samples.length > 24) { const k = samples.length / 24; samples = Array.from({ length: 24 }, (_, i) => samples[Math.floor(i * k)]); }
  samples.sort((a, b) => a.t - b.t);
  for (const s of samples) {
    const rgb = grabFrame(file, s.t);
    if (!rgb) continue;
    const lines = findLines(rgb, mask ?? undefined).filter((l) => l.glyphs >= 3);
    textRows.push({ t: f2(s.t), from: s.from, lines, levels: levels(lines.map((l) => l.px)).map((l) => (l.length > 1 ? `${l[0]}-${l.at(-1)}` : `${l[0]}`)) });
  }
  if (!textRows.length) add('type levels', 'N/A', '-', 'no hold frames or still runs to sample');
  else {
    const src = textRows[0].from === 'hold' ? 'hold frames' : 'mid-frames of the longest still runs (no holds)';
    const worst = textRows.reduce((a, r) => (r.levels.length > a.levels.length ? r : a));
    const over = textRows.filter((r) => r.levels.length > 3).length;
    add('type levels', 'INFO', worst.levels.length, `most at ${ts(worst.t)} [${worst.levels.join(' ')} px]; ${over}/${textRows.length} ${src} over 3 levels (sizes within 15 % = one level; pixel estimate ±15 %, graphics can count as text)`, 'principle 3 type levels');
    const all = textRows.flatMap((r) => r.lines.map((l) => ({ ...l, t: r.t })));
    if (all.length) {
      // Only lines of 8 or more glyphs: short fragments (a "%", one lowercase word) under-read their size.
      const small = all.filter((l) => l.glyphs >= 8).reduce((a, l) => (!a || l.px < a.px ? l : a), null);
      if (small) add('smallest text', 'INFO', `~${small.px} px`, `at ${ts(small.t)}, box ${small.x},${small.y} ${small.w}×${small.h}; font size estimated from cap / ascender height of lines with ≥ 8 glyphs (±15 %); information-bearing text ≥ 25 px, main text ≥ 40 px (B7)`, 'P0 phone size');
      else add('smallest text', 'N/A', '-', 'no line of 8 or more glyphs to size reliably', 'P0 phone size');
      const legible = all.filter((l) => l.px >= 18);
      const low = legible.filter((l) => l.cr < 4.5);
      const w = legible.reduce((a, l) => (!a || l.cr < a.cr ? l : a), null);
      if (w) add('text contrast', 'INFO', w.cr, `worst line at ${ts(w.t)}, box ${w.x},${w.y} ${w.w}×${w.h}, ~${w.px} px; ${low.length}/${legible.length} lines under 4.5:1 (stroke core vs surrounding pixels; dimmed context and graphics included, check flagged boxes by eye)`, 'P0 contrast');
    }
  }
}

// ---------------------------------------------------------------- INFO: accent area
if (!pic.accent) add('accent area', 'N/A', '-', 'no accent colour (timing.json `accent`, palettes.js `accent`, or --accent)', 'P0 one accent');
else {
  const a = pic.accent, med = quantile(a, 0.5), max = Math.max(...a), at = a.indexOf(max) / fps;
  const runs = [];
  let s = -1;
  for (let f = 0; f <= a.length; f++) { const on = f < a.length && a[f] > 0.1; if (on && s < 0) s = f; if (!on && s >= 0) { runs.push({ from: s / fps, dur: (f - s) / fps }); s = -1; } }
  const long = runs.filter((r) => bar && r.dur > 2 * bar);
  add('accent area', 'INFO', `${f2(med * 100, 1)} %`, `median share of the ${mask ? 'mask' : 'frame'} within ΔE 20 of ${[T.accent].flat().join(', ')} (${T.accentFrom}); max ${f2(max * 100, 1)} % at ${ts(at)}; ${runs.length} stretch(es) over 10 %${long.length ? `, ${long.length} longer than 2 bars: ${long.map((r) => `${ts(r.from)} for ${f2(r.dur, 1)} s`).join(', ')}` : ''} (as a marker ≤ 10 %; a full-field change ≤ 2 bars, B6)`, 'P0 one accent');
}

// ---------------------------------------------------------------- INFO: sound
if (pcm) {
  const o = octaves(pcm.mono), bal = balance(o.bands);
  add('octave balance', 'INFO', `${sgn(bal[250])}/${sgn(bal[4000])} dB`, `250 Hz / 4 kHz against the reference shape; all: ${Object.entries(bal).map(([c, v]) => `${c >= 1000 ? c / 1000 + 'k' : c} ${sgn(v)}`).join(' ')}; slope ${f2(o.slope, 2)} dB/oct (2–5 kHz within ±3 dB proposed, draft)`, 'sound balance');
  if (bar) {
    const ss = selfSimilarity(pcm.mono, 4 * bar);
    if (ss) add('4-bar repetition', 'INFO', f2(ss.median), `median cosine of spectra 4 bars apart; ${Math.round(ss.share * 100)} % of frames > 0.95 (a verbatim loop reads ≈ 0.99 / 50 %)`, 'sound repetition');
  }
  const lm = limiting(pcm.peak, loud.I);
  let measured = '';
  const mj = filmDir ? resolve(filmDir, 'assets', 'audio', 'measure.json') : null;
  if (mj && existsSync(mj)) {
    try {
      const j = JSON.parse(readFileSync(mj, 'utf8'));
      if (typeof j.limiting === 'number') measured = `; the master's pre-limiter took up to ${j.limiting} dB (measure.json)`;
      else if (j.preLimit) measured = `; master pre-limit ${j.preLimit.reduction} dB (measure.json)`;
    } catch {}
  }
  add('limiting', 'INFO', `${f2(lm.plr, 1)} dB PLR`, `sample peak ${f2(lm.samplePeak, 1)} dBFS; ${f2(lm.atCeiling * 100, 1)} % of 10 ms blocks within 0.5 dB of it${measured}`, 'sound limiting');
}

// ---------------------------------------------------------------- output
const ok = !checks.some((c) => c.status === 'FAIL');
if (json) {
  console.log(JSON.stringify({
    file, filmDir, timing: { source: T.source, file: T.file, warnings: T.warnings, api: T.api, rulesApi: T.rulesApi, bpm: T.bpm, beatsPerBar: T.beatsPerBar, t0, mask, maxStillBars: T.maxStillBars },
    tiers: tierSummary, pixelTiers,
    fps, duration, frames, motion: { floor: f2(floor, 3), thresholds: M.thrRange.map((x) => f2(x, 3)) }, checks,
    scenes: sceneRows.map((r) => ({ ...r, still: f2(r.still), stillAt: f2(r.stillAt) })), keys: keyRows, holds, handoffs,
    cuts: cuts.map((c) => ({ t: f2(c.t, 3), score: f2(c.score), offFrames: c.offFrames ?? null })), blacks: pic.blacks, flashes: fl,
    text: textRows, ok,
  }, null, 2));
} else {
  console.log(`check-film: ${file}`);
  const w = Math.max(...checks.map((c) => c.name.length)) + 1;
  for (const c of checks) console.log(`  ${c.status.padEnd(4)}  ${c.name.padEnd(w)} ${String(c.value).padEnd(12)} ${c.detail}`);
  if (sceneRows.length) {
    console.log('  scenes (start, length, longest still):');
    for (const r of sceneRows) console.log(`    ${String(r.i + 1).padStart(2)} ${r.type.padEnd(18)} ${r.start.toFixed(2).padStart(7)} s ${r.dur.toFixed(2).padStart(6)} s  still ${r.still.toFixed(2).padStart(5)} s${r.rest ? '  rest' : ''}`);
  }
  if (cuts.length) console.log(`  cuts: ${cuts.map((c) => c.t.toFixed(2) + (c.offFrames != null ? `(${sgn(c.offFrames)}f)` : '')).join(' ')}`);
  console.log(ok ? 'result: PASS' : 'result: FAIL');
}
process.exit(ok ? 0 : 1);
