// timing.rules.js — how long each Exhibit scene needs (format: lib/timing.js, api 3). Every time comes from
// choreo.js, the module film.js and score.mjs draw and score from, so the timing table, the picture and the sound
// agree. Reading (lib/timing.js reader, three tiers):
//   primary  captions, the readings' values and labels, the carried reading's value and line, the claim, the name,
//            its line and the address: 0.3 s a word, one after another; every primary text enters word by word at
//            that pace, so the picture is not still while it is read
//   glance   a reading's note and the carried reading's meta line (≤ 6 words): each qualifies a value shown beside
//            it and is safe to delete; each stays still ≥ 1 s
// Grid: one beat. No scene is a turn, so no scene waits for a bar line (a pad would be a still frame); the phrase
// rounding goes to the lock-up, a rest, whose second move lands on the last downbeat.
import { plan, words, C } from './choreo.js';
import { moveOf } from './moves.js';

const LIMITS = {
  caption: 5, claim: 8,            // words (principle 5: ≤ 5 primary words a state, a claim ≤ 8)
  cells: [1, 3], valueChars: 8, cardWords: 3, labelChars: 16, noteWords: 6,
  cardLine: 5, meta: 6, name: 16, line: 6, url: 40,
};
const TYPES = ['open', 'read', 'carry', 'measure', 'lockup'];

// Copy that breaks the registry or a slot limit; returns error strings (npm run fit stops on them, film.js shows a banner)
export const validate = (content) => {
  const errs = [], A = content.assets || {}, S = content.scenes || [];
  const box4 = (b) => Array.isArray(b) && b.length === 4 && b.every((v) => Number.isFinite(v));
  const inCrop = (id, b, what) => {
    const a = A[id];
    if (!a || !box4(b)) return errs.push(`${what}: a box is [x, y, w, h] in the file's pixels`);
    const [cx, cy, cw, ch] = a.crop;
    if (b[0] < cx || b[1] < cy || b[0] + b[2] > cx + cw || b[1] + b[3] > cy + ch) errs.push(`${what}: box ${JSON.stringify(b)} lies outside ${id}'s crop ${JSON.stringify(a.crop)}`);
  };
  const nw = (t) => words(t).length;
  for (const [id, a] of Object.entries(A)) {
    if (!a.file || !box4(a.crop)) errs.push(`assets.${id}: needs file and crop [x, y, w, h]`);
    if (!a.source) errs.push(`assets.${id}: needs source (shown on its mount)`);
    if (a.people !== 'none') errs.push(`assets.${id}: people must be 'none' (crop people out; tools/check-assets.mjs looks for faces)`);
  }
  if (!S.length) errs.push('scenes: none');
  if (S[0] && S[0].type !== 'open') errs.push('scene 1 must be open (content first, then its mount)');
  if (S.length && S.at(-1).type !== 'lockup') errs.push(`the last scene must be lockup (got ${S.at(-1).type})`);
  let prev = null;
  S.forEach((s, i) => {
    const at = `scene ${i + 1} (${s.type})`;
    if (!TYPES.includes(s.type)) return errs.push(`${at}: unknown type; types: ${TYPES.join(', ')}`);
    if (s.type !== 'lockup' && !A[s.exhibit]) errs.push(`${at}: exhibit "${s.exhibit}" is not in assets`);
    const cap = s.claim ? LIMITS.claim : LIMITS.caption;
    if (s.caption && nw(s.caption) > cap) errs.push(`${at}: caption has ${nw(s.caption)} words; at most ${cap}${s.claim ? ' (a claim)' : ''}`);
    if (s.type === 'open' && i > 0) errs.push(`${at}: open only as the first scene`);
    if (s.caption && (s.type === 'carry' || s.type === 'lockup')) errs.push(`${at}: no caption on a ${s.type} (the reading or the title block is its text)`);
    if (s.type === 'read') {
      const cells = s.cells;
      if (!Array.isArray(cells) || cells.length < LIMITS.cells[0] || cells.length > LIMITS.cells[1]) errs.push(`${at}: cells must be an array of 1–3`);
      else cells.forEach((c, k) => {
        const w = `${at} cell ${k + 1}`;
        inCrop(s.exhibit, c.box, `${w} box`); inCrop(s.exhibit, c.glyph, `${w} glyph`);
        if (String(c.value ?? '').length > LIMITS.valueChars) errs.push(`${w}: value "${c.value}" over ${LIMITS.valueChars} characters`);
        if (nw(`${c.value} ${c.label ?? ''}`) > LIMITS.cardWords) errs.push(`${w}: value and label are ${nw(`${c.value} ${c.label}`)} words; at most ${LIMITS.cardWords} (one card is read in about a second)`);
        if (String(c.label ?? '').length > LIMITS.labelChars) errs.push(`${w}: label over ${LIMITS.labelChars} characters`);
        if (c.note && nw(c.note) > LIMITS.noteWords) errs.push(`${w}: note over ${LIMITS.noteWords} words (a glance)`);
      });
    }
    if (s.type === 'carry') {
      if (!prev || prev === s.exhibit) errs.push(`${at}: a carry goes from the previous exhibit to another one`);
      if (prev && A[prev]) { inCrop(prev, s.from?.box, `${at} from.box`); inCrop(prev, s.from?.glyph, `${at} from.glyph`); }
      inCrop(s.exhibit, s.to?.glyph, `${at} to.glyph`); inCrop(s.exhibit, s.to?.ring, `${at} to.ring`);
      if (!s.from?.value) errs.push(`${at}: from.value (the value as printed in both exhibits)`);
      if (s.card) {
        if (nw(s.card.value) + nw(s.card.line) > LIMITS.cardLine + 1) errs.push(`${at}: card value and line over ${LIMITS.cardLine + 1} words`);
        if (s.card.meta && nw(s.card.meta) > LIMITS.meta) errs.push(`${at}: card meta over ${LIMITS.meta} words (a glance)`);
      }
    }
    if (s.type === 'measure') {
      if (s.exhibit !== prev) errs.push(`${at}: measure stays on the exhibit before it`);
      for (const k of ['a', 'b']) if (!Array.isArray(s[k]?.point) || !Number.isFinite(s[k]?.value)) errs.push(`${at}: ${k} = { point: [x, y] (file px), value: number as printed }`);
    }
    if (s.type === 'lockup') {
      if (!s.name || s.name.length > LIMITS.name) errs.push(`${at}: name, at most ${LIMITS.name} characters`);
      if (s.line && nw(s.line) > LIMITS.line) errs.push(`${at}: line over ${LIMITS.line} words`);
      if (!s.url || s.url.length > LIMITS.url) errs.push(`${at}: url, at most ${LIMITS.url} characters`);
      if (s.mark && !A[s.mark]) errs.push(`${at}: mark "${s.mark}" is not in assets`);
    }
    if (s.exhibit) prev = s.exhibit;
  });
  for (const [role, id] of Object.entries(content.moves || {})) { try { moveOf(role, id); } catch (e) { errs.push(e.message); } }
  if (content.desk && !['plain', 'mat'].includes(content.desk)) errs.push(`desk: 'plain' or 'mat' (got ${content.desk})`);
  return errs;
};

const tiersOf = (list) => list.map(({ text, tier, claim }) => ({ text, tier, ...(claim ? { claim } : {}) }));
const P = (s, g, ctx) => plan(s, ctx, g.beat, ctx?.dur, ctx?.content);
const type = (extra = {}) => ({
  read: (s, ctx) => {
    try { return tiersOf(plan(s, ctx, 0.5, undefined, ctx?.content).items || []); } catch { return []; }
  },
  need: (s, g, ctx) => P(s, g, ctx).need,
  fillsSlack: false,
  events: (s, g, ctx) => {
    const p = plan(s, { ...ctx }, g.beat, s.end - s.start, ctx?.content);
    // the climax (T3): the measured gap; in a film without a measure, a read marked claim
    const measured = (ctx?.scenes || []).some((x) => x.type === 'measure');
    const peaks = p.peaks.map((k) => ({ ...k, ...((k.kind === 'reveal' || (k.kind === 'claim' && !measured)) ? { climax: true } : {}) }));
    return { keys: p.keys, holds: p.holds, handoffs: p.handoffs, micro: p.micro, shots: p.shots, expressive: p.expressive, peaks };
  },
  ...extra,
});

const rules = {
  api: 3,
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4, unit: 0.25, phrase: 2, wordSec: C.wordSec,
  phraseShareBeats: 0,
  devices: ['exhibit-rise'],
  types: {
    open: type({ doc: { in: 'content at the cap, the camera rises 2 beats, the caption word by word' } }),
    read: type({ max: 5, doc: { in: 'travel 2 beats when the exhibit changes; rings; lift-out 2 beats; cards read one by one; caption', out: 'readings go back, rings off: 1.5 beats' } }),
    carry: type({ max: 4, doc: { in: 'ring 1 beat, value-carry 2 beats; the exhibit steps back; the reading lifts and is read' } }),
    measure: type({ max: 4, doc: { in: 'the dimension draws 1.5 beats; its chip lands on beat 2; the claim' } }),
    lockup: type({ rest: true, absorb: true, max: 8, reason: 'closing card: the address holds ≥ 3 s; the phrase rounding lands here; the second move on the last downbeat', doc: { in: 'the camera rises 2 beats; name, line, address, rule, route' } }),
  },
};
rules.validate = (content) => validate(content);
export default rules;
