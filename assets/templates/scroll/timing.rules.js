// timing.rules.js — how long each Scroll scene needs (format: lib/timing.js, api 3). Every time comes from choreo.js,
// the module film.js and score.mjs draw and score from, so the timing table, the picture and the sound agree.
// Reading (lib/timing.js reader, three tiers):
//   primary  every quote phrase (≤ 3 words, entering one after another as the one before is read), the claim in an
//            unfolded panel, the name and the address
//   word     the ratchet's names, one a beat as each row docks
//   glance   an unfolded panel's label (≤ 6 words): it names the source of what plays, repeated in the manifest
// Grid: one beat. No scene is a turn (a pad would be a still frame); the phrase rounding goes to the lock-up, a rest,
// whose roll-up lands on the last downbeat.
import { plan, words, C } from './choreo.js';
import { moveOf } from './moves.js';
import { BAND, NAME, URL } from './sheet.js';

export const LIMITS = { phraseWords: 3, lines: 2, caption: 8, captionChars: 40, label: 6, rows: [3, 12], name: NAME.chars, url: URL.chars };
const TYPES = ['open', 'quote', 'ratchet', 'unfold', 'lockup'];

export const validate = (content) => {
  const errs = [], A = content.assets || {}, S = content.scenes || [], sheet = content.sheet || [];
  const box4 = (b) => Array.isArray(b) && b.length === 4 && b.every((v) => Number.isFinite(v));
  const strips = sheet.filter((e) => typeof e === 'string');
  const bands = Object.fromEntries(sheet.filter((e) => e && e.band).map((e) => [e.band, e.size ?? 'quote']));
  const inStrip = (id, b, what) => {
    if (!strips.includes(id)) return errs.push(`${what}: "${id}" is not a strip of the sheet`);
    const a = A[id];
    if (!box4(b)) return errs.push(`${what}: a box is [x, y, w, h] in the file's pixels`);
    if (a?.size && (b[0] < 0 || b[1] < 0 || b[0] + b[2] > a.size[0] + 0.5 || b[1] + b[3] > a.size[1] + 0.5)) errs.push(`${what}: box ${JSON.stringify(b)} lies outside ${id} (${a.size.join(' × ')})`);
  };
  for (const [id, a] of Object.entries(A)) {
    if (!a.source) errs.push(`assets.${id}: needs source`);
    if (a.people !== 'none') errs.push(`assets.${id}: people must be 'none' (crop people out; npm run assets looks for faces)`);
    if (!Array.isArray(a.size) || a.size.length !== 2) errs.push(`assets.${id}: size [w, h] in px (the capture prints it)`);
    if (a.frames == null && !a.file) errs.push(`assets.${id}: needs file (a strip) or frames (a folder of frames)`);
    if (a.frames != null && !(a.count > 0 && a.fps > 0)) errs.push(`assets.${id}: frames need count and fps`);
  }
  if (!strips.length) errs.push('sheet: no strips');
  const widths = [...new Set(strips.map((id) => A[id]?.size?.[0]))];
  if (widths.length > 1) errs.push(`sheet: every strip must share one width (one scale); widths ${widths.join(', ')}`);
  for (const id of strips) if (!A[id] || !A[id].file) errs.push(`sheet: strip "${id}" is not a file asset`);
  if (new Set(strips).size !== strips.length) errs.push('sheet: a strip appears twice');
  (content.heads || []).forEach((h, k) => inStrip(h.asset, h.box, `heads[${k}]`));
  if (!S.length) errs.push('scenes: none');
  if (S[0] && S[0].type !== 'open') errs.push('scene 1 must be open');
  if (S.length && S.at(-1).type !== 'lockup') errs.push(`the last scene must be lockup (got ${S.at(-1).type})`);
  const lines = (s, at) => {
    const b = bands[s.band];
    if (!b) return errs.push(`${at}: band "${s.band}" is not in the sheet`);
    if (!Array.isArray(s.lines) || !s.lines.length || s.lines.length > LIMITS.lines) return errs.push(`${at}: lines, 1–${LIMITS.lines} arrays of phrases`);
    s.lines.forEach((line, li) => {
      if (!Array.isArray(line) || !line.length) return errs.push(`${at} line ${li + 1}: an array of phrases`);
      for (const p of line) if (words(p).length > LIMITS.phraseWords) errs.push(`${at} line ${li + 1}: phrase "${p}" has ${words(p).length} words; at most ${LIMITS.phraseWords} enter at once`);
      const chars = line.join(' ').length;
      if (chars > BAND[b].chars) errs.push(`${at} line ${li + 1}: ${chars} characters; a ${b} band holds ${BAND[b].chars}`);
    });
  };
  const mark = (m, at) => {
    if (!m) return;
    if (!Array.isArray(m.rects) || !m.rects.length) return errs.push(`${at}: mark.rects, the line boxes to underline`);
    m.rects.forEach((r, k) => inStrip(m.asset, r, `${at} mark rect ${k + 1}`));
  };
  let unfolds = 0;
  S.forEach((s, i) => {
    const at = `scene ${i + 1} (${s.type})`;
    if (!TYPES.includes(s.type)) return errs.push(`${at}: unknown type; types: ${TYPES.join(', ')}`);
    if (s.type === 'open') {
      if (i > 0) errs.push(`${at}: open only as the first scene`);
      if (s.unroll != null && typeof s.unroll !== 'boolean') errs.push(`${at}: unroll is true (default) or false`);
      lines(s, at); mark(s.mark, at);
    }
    if (s.type === 'quote') {
      lines(s, at); mark(s.mark, at);
      if (s.move && !['none', 'detent', 'reel'].includes(s.move)) errs.push(`${at}: move 'none', 'detent' or 'reel'`);
      if (s.move && s.move !== 'none' && !s.at) errs.push(`${at}: a move needs at { asset, y } (where the sheet goes)`);
      if (s.at) inStrip(s.at.asset, [0, s.at.y, 1, 1], `${at} at`);
    }
    if (s.type === 'ratchet') {
      const h = (content.heads || [])[s.head ?? 0];
      if (!h) errs.push(`${at}: head ${s.head ?? 0} is not in heads`);
      const rows = s.rows;
      if (!Array.isArray(rows) || rows.length < LIMITS.rows[0] || rows.length > LIMITS.rows[1]) errs.push(`${at}: rows, ${LIMITS.rows.join('–')} of { asset, box, name }`);
      else rows.forEach((r, k) => { inStrip(r.asset, r.box, `${at} row ${k + 1}`); if (!r.name || words(r.name).length !== 1 || r.name.length > 14) errs.push(`${at} row ${k + 1}: name, one word ≤ 14 characters`); });
    }
    if (s.type === 'unfold') {
      unfolds++;
      if (!s.row) errs.push(`${at}: row { asset, box } (the row that opens)`); else inStrip(s.row.asset, s.row.box, `${at} row`);
      if (!A[s.frames] || A[s.frames].frames == null) errs.push(`${at}: frames "${s.frames}" is not a frames asset`);
      if (!s.caption || words(s.caption).length > LIMITS.caption || s.caption.length > LIMITS.captionChars) errs.push(`${at}: caption (the claim), ≤ ${LIMITS.caption} words, ≤ ${LIMITS.captionChars} characters`);
      if (s.label && words(s.label).length > LIMITS.label) errs.push(`${at}: label ≤ ${LIMITS.label} words (a glance)`);
      if (S[i - 1]?.type === 'unfold') errs.push(`${at}: never two unfolds in a row`);
    }
    if (s.type === 'lockup') {
      if (s.band !== S[0]?.band) errs.push(`${at}: band must be the opening's band ("${S[0]?.band}"): the name replaces the hook`);
      if (!s.name || s.name.length > LIMITS.name) errs.push(`${at}: name, at most ${LIMITS.name} characters`);
      if (!s.url || s.url.length > LIMITS.url) errs.push(`${at}: url, at most ${LIMITS.url} characters`);
      mark(s.mark, at);
    }
  });
  if (unfolds > 2) errs.push(`${unfolds} unfolds; at most 2 a film`);
  for (const [role, id] of Object.entries(content.moves || {})) { try { moveOf(role, id); } catch (e) { errs.push(e.message); } }
  if (content.minimap && !['on', 'off'].includes(content.minimap)) errs.push(`minimap: 'on' or 'off' (got ${content.minimap})`);
  return errs;
};

const P = (s, g, ctx, dur) => plan(s, ctx, g.beat, dur, ctx?.content);
const type = (extra = {}) => ({
  read: (s, ctx) => { try { return (plan(s, ctx, 0.5, undefined, ctx?.content).items || []).map(({ text, tier, claim }) => ({ text, tier, ...(claim ? { claim } : {}) })); } catch { return []; } },
  need: (s, g, ctx) => P(s, g, ctx).need,
  events: (s, g, ctx) => {
    const p = P(s, g, ctx, s.end - s.start);
    return { keys: p.keys, holds: p.holds, handoffs: p.handoffs, micro: p.micro, shots: p.shots, expressive: p.expressive, peaks: p.peaks };
  },
  ...extra,
});

const rules = {
  api: 3,
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4, unit: 0.25, phrase: 2, wordSec: C.wordSec,
  phraseShareBeats: 1,
  devices: ['roll'],
  types: {
    open: type({ doc: { in: 'the roll drops 2 beats; the underline; the hook phrase by phrase; the minimap prints' } }),
    quote: type({ doc: { in: 'detent 1 beat or reel 2 (or none: the underline moves); phrases one after another' } }),
    ratchet: type({ max: 4, doc: { in: 'reel 2 beats onto the chapter; one row docks a beat' } }),
    unfold: type({ max: 4, climax: true, reason: 'the climax: the row opens and what it describes plays while the claim is read', doc: { in: 'detent 1 beat to the row; unfold 2 beats; the claim 2 beats after' } }),
    lockup: type({ rest: true, absorb: true, max: 8, reason: 'closing card: the address holds ≥ 3 s; the phrase rounding lands here; the roll-up lands on the last downbeat', doc: { in: 'fling 2 beats; the name; the address types; the roll comes up' } }),
  },
};
rules.validate = (content) => validate(content);
export default rules;
