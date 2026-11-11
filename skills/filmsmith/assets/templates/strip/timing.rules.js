// timing.rules.js — how long each Strip scene needs (format: lib/timing.js, api 3). Every time comes from choreo.js,
// the module film.js and score.mjs draw and score from, so the timing table, the picture and the sound agree.
// Reading (lib/timing.js reader, three tiers):
//   primary  intertitles, the films' names under the gate, the captions on the sheet, the pick's caption, the line,
//            the name and the address: 0.3 s a word, one after another. An intertitle is read before the strip
//            moves it on (its slot is its reading plus a pull-down), so the picture holds still only after it lands
//   glance   the films' names and lengths beside the sheet's rows (≤ 2 words each; they repeat the names read
//            under the gate and are safe to delete): read in parallel, never added up
// Grid: one beat. No scene is a turn (a pad would be a still frame); the phrase rounding goes to the lock-up, a rest,
// whose second move (the pencil underlining the address) lands on the last downbeat.
import { local, words, lineOf, filmsOf, TYPES, C } from './choreo.js';
import { moveOf } from './moves.js';

const LIMITS = { titleLines: [1, 5], titleWords: 3, titleChars: 18, films: [1, 12], nameChars: 12, sheetLines: [1, 2], caption: 5, pickCaption: 3, line: 5, name: 16, url: 40, maxDur: 50 };

// Copy that breaks the registry or a slot limit; returns error strings (npm run fit stops on them, film.js shows a banner)
export const validate = (content) => {
  const errs = [], Fm = content.films || {}, S = content.scenes || [], ids = Object.keys(Fm);
  const num = (x) => Number.isFinite(x);
  if (!ids.length) errs.push('films: none (each film: name, duration, frame { file, at, sha256 }, row { file, times, sha256 })');
  for (const [id, f] of Object.entries(Fm)) {
    const at = `films.${id}`;
    if (!f.name || f.name.length > LIMITS.nameChars) errs.push(`${at}: name, at most ${LIMITS.nameChars} characters`);
    if (!num(f.duration) || f.duration <= 0) errs.push(`${at}: duration (seconds, as measured by ffprobe)`);
    else if (f.duration > LIMITS.maxDur) errs.push(`${at}: ${f.duration} s; the contact sheet holds films up to ${LIMITS.maxDur} s (24.8 px a second)`);
    if (!f.frame?.file || !num(f.frame?.at)) errs.push(`${at}: frame { file, at, sha256 } (tools/extract.mjs prints it)`);
    if (!f.row?.file || !Array.isArray(f.row?.times) || !f.row.times.length) errs.push(`${at}: row { file, times, sha256 } (tools/extract.mjs prints it)`);
    else if (num(f.duration) && f.row.times.length !== Math.ceil(f.duration / 4 - 1e-6)) errs.push(`${at}: row has ${f.row.times.length} cells for a ${f.duration} s film; one per 4 s block (${Math.ceil(f.duration / 4 - 1e-6)})`);
    if (f.run && !(num(f.run.from) && num(f.run.fps) && num(f.run.frames) && f.run.dir)) errs.push(`${at}: run { dir, ext, from, fps, frames, sha256 }`);
  }
  for (const [id, c] of Object.entries(content.captures || {})) {
    if (!c.file || !Array.isArray(c.crop) || c.crop.length !== 4) errs.push(`captures.${id}: needs file and crop [x, y, w, h]`);
    if (c.people !== 'none') errs.push(`captures.${id}: people must be 'none' (crop people out)`);
  }
  if (!S.length) errs.push('scenes: none');
  if (S[0] && S[0].type !== 'titles') errs.push('scene 1 must be titles (the strip runs in and brakes on the first intertitle)');
  if (S.length && S.at(-1).type !== 'lockup') errs.push(`the last scene must be lockup (got ${S.at(-1).type})`);
  S.forEach((s, i) => {
    const at = `scene ${i + 1} (${s.type})`, prev = S[i - 1], next = S[i + 1];
    if (!TYPES.includes(s.type)) return errs.push(`${at}: unknown type; types: ${TYPES.join(', ')}`);
    if (s.type === 'titles') {
      const L = (s.lines || []).map(lineOf);
      if (L.length < LIMITS.titleLines[0] || L.length > LIMITS.titleLines[1]) errs.push(`${at}: lines, 1–5 intertitles`);
      L.forEach((l, k) => {
        if (!l.text) errs.push(`${at} line ${k + 1}: empty`);
        else if (words(l.text) > LIMITS.titleWords) errs.push(`${at} line ${k + 1}: "${l.text}" is ${words(l.text)} words; at most ${LIMITS.titleWords} (an intertitle is read before the strip moves on, within two beats); split it`);
        else if (l.text.length > LIMITS.titleChars) errs.push(`${at} line ${k + 1}: over ${LIMITS.titleChars} characters (the frame is 832 px wide)`);
      });
      if (L.filter((l) => l.track).length > 1 || S.filter((x) => x.type === 'titles').flatMap((x) => (x.lines || []).map(lineOf)).filter((l) => l.track).length > 1) errs.push(`${at}: the optical track lights once a film (one line with track: true)`);
    }
    if (s.type === 'frames') {
      const f = filmsOf(s, content);
      if (f.length < LIMITS.films[0] || f.length > LIMITS.films[1]) errs.push(`${at}: films, 1–12`);
      for (const id of f) if (!Fm[id]) errs.push(`${at}: film "${id}" is not in films`);
    }
    if (s.type === 'punch') {
      if (prev?.type !== 'frames') errs.push(`${at}: a punch follows a frames scene (it punches the frame in the gate)`);
      if (next?.type !== 'sheet') errs.push(`${at}: a punch is followed by the sheet (the frame shrinks into its cell)`);
      const id = prev?.type === 'frames' ? filmsOf(prev, content).at(-1) : null, f = Fm[id];
      if (f && !f.row?.times?.some((x) => Math.abs(x - f.frame.at) < 1 / 30)) errs.push(`${at}: ${id}'s gate frame (${f.frame.at} s) must be one of its row's times (${f.row?.times?.join(', ')}) so it lands in its own cell; extract the frame at one of them`);
    }
    if (s.type === 'sheet') {
      if (prev?.type !== 'punch') errs.push(`${at}: the sheet follows a punch (the frame shrinks into it)`);
      const L = (s.lines || []).map(lineOf);
      if (L.length < 1 || L.length > 2) errs.push(`${at}: lines, 1–2 captions`);
      L.forEach((l, k) => { if (words(l.text) > LIMITS.caption) errs.push(`${at} line ${k + 1}: over ${LIMITS.caption} words`); });
      if (Object.keys(Fm).length > 10) errs.push(`${at}: the sheet holds 10 rows; the films list has ${Object.keys(Fm).length}`);
    }
    if (s.type === 'pick') {
      if (prev?.type !== 'sheet') errs.push(`${at}: a pick follows the sheet`);
      const f = Fm[s.film];
      if (!f) errs.push(`${at}: film "${s.film}" is not in films`);
      else {
        if (!Number.isInteger(s.cell) || s.cell < 0 || s.cell >= (f.row?.times?.length ?? 0)) errs.push(`${at}: cell, 0–${(f.row?.times?.length ?? 1) - 1} (a cell of ${s.film}'s row)`);
        else if (f.run && Math.abs(f.run.from - f.row.times[s.cell]) > 1 / 30) errs.push(`${at}: ${s.film}'s run starts at ${f.run.from} s; the ringed cell is at ${f.row.times[s.cell]} s (extract the run from the cell's time)`);
      }
      if (!s.caption || words(s.caption) > LIMITS.pickCaption) errs.push(`${at}: caption, 1–${LIMITS.pickCaption} words (read before the punch covers it)`);
      if (next?.type !== 'lockup') errs.push(`${at}: the lockup follows a pick`);
    }
    if (s.type === 'lockup') {
      if (i !== S.length - 1) errs.push(`${at}: lockup only as the last scene`);
      if (s.source && !content.captures?.[s.source] && !Fm[s.source]) errs.push(`${at}: source "${s.source}" is not in captures or films`);
      if (s.line && words(s.line) > LIMITS.line) errs.push(`${at}: line over ${LIMITS.line} words`);
      if (!s.name || s.name.length > LIMITS.name) errs.push(`${at}: name, at most ${LIMITS.name} characters`);
      if (!s.url || s.url.length > LIMITS.url) errs.push(`${at}: url, at most ${LIMITS.url} characters`);
    }
  });
  for (const [role, id] of Object.entries(content.moves || {})) { try { moveOf(role, id); } catch (e) { errs.push(e.message); } }
  if (content.edges && !['run', 'cut'].includes(content.edges)) errs.push(`edges: 'run' (default: the strip runs in) or 'cut' (the first frame is already registered in the gate; for a cut-down)`);
  if (content.perfs && !['double', 'single'].includes(content.perfs)) errs.push(`perfs: 'double' or 'single' (got ${content.perfs})`);
  return errs;
};

const items = (s, ctx, B) => local(s, ctx, B).items.filter((x) => x.text).map((x) => ({ text: x.text, at: x.at ?? 0 }));
const sec = (list, B) => list.map(([t, what]) => ({ t: t * B, what }));
const type = (extra = {}) => ({
  read: (s, ctx) => items(s, ctx, 0.5),
  // the choreography's length, never below what the shared reader needs for the scene's text at this tempo
  need: (s, g, ctx) => Math.max(local(s, ctx, g.beat).need * g.beat, ctx.reading(items(s, ctx, g.beat)).end),
  fillsSlack: true,
  events: (s, g, ctx) => {
    const B = g.beat, p = local(s, ctx, B, (s.end - s.start) / B);
    const exp = p.expressive.map((x) => ({ t: x.t * B, dur: x.beats * B, device: moveOf(x.device === 'strip-advance' ? 'advance' : x.device === 'gate-punch' ? 'punch' : 'pick', (ctx.content.moves || {})[x.device === 'strip-advance' ? 'advance' : x.device === 'gate-punch' ? 'punch' : 'pick']).device, variant: x.variant }));
    return {
      keys: p.keys.map((k) => ({ t: k.t * B, kind: k.kind, ...(k.drop ? { drop: true } : {}) })),
      holds: p.holds.map(([a, b, pause]) => ({ from: a * B, to: b * B, ...(pause ? { pause: true } : {}) })),
      handoffs: p.handoffs.map((t) => ({ t: t * B })),
      micro: sec(p.micro, B), shots: sec(p.shots, B), expressive: exp,
      peaks: p.peaks.map((x) => ({ t: x.t * B, kind: x.kind, ...(x.climax ? { climax: true } : {}) })),
    };
  },
  ...extra,
});

const rules = {
  api: 3,
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4, unit: 0.25, phrase: 2, wordSec: C.wordSec,
  phraseShareBeats: 0,
  types: {
    titles: type({ max: 4, doc: { in: 'the first: the strip runs in, braking 2 beats; then a pull-down a line (a quarter beat), each read before the next' } }),
    frames: type({ max: 6, doc: { in: 'a pull-down a beat, one film\'s frame each, its name under the gate' } }),
    punch: type({ max: 2, doc: { in: 'the frame punches to full 1 beat, holds 1, shrinks into its cell on the sheet 1' } }),
    sheet: type({ max: 5, doc: { in: 'the sheet around the landed cell; caption; the longer strips pull out; caption; the lengths' } }),
    pick: type({ max: 5, climax: true, reason: 'the climax: the pencil, the punch and the picked film running at full size', doc: { in: 'caption and the pencil loop 1 beat; the rest steps back; the cell punches 1 beat; the film runs; into the gate 1' } }),
    lockup: type({ rest: true, absorb: true, max: 10, reason: 'closing card: the address holds ≥ 3 s; the phrase rounding lands here; the second move on the last downbeat', doc: { in: 'the source frame pulls in; the line; the strip runs out 1.5 beats; name, address, the underline' } }),
  },
};
rules.validate = (content) => validate(content);
export default rules;
