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
import { plan, words, C, travelMove } from './choreo.js';
import { moveOf } from './moves.js';
import { world } from './layout.js';

const LIMITS = {
  caption: 5, claim: 8,            // words (principle 5: ≤ 5 primary words a state, a claim ≤ 8)
  cells: [1, 3], valueChars: 8, cardWords: 3, labelChars: 16, noteWords: 6,
  chipLabel: 28, chipValue: 10, reads: 2, name: 16, line: 6, url: 40,
};
const TYPES = ['open', 'travel', 'read', 'match', 'measure', 'lockup'];
const NEIGHBOUR = ['parallax-slide', 'camera-truck'];   // travel moves that go to the next print in the row only

// Copy that breaks the registry or a slot limit; returns error strings (npm run fit stops on them, film.js shows a banner)
export const validate = (content) => {
  const errs = [], A = content.assets || {}, S = content.scenes || [];
  const box4 = (b) => Array.isArray(b) && b.length === 4 && b.every((v) => Number.isFinite(v));
  let Wd = null;
  for (const [id, a] of Object.entries(A)) {
    if (!a.file || !box4(a.crop)) errs.push(`assets.${id}: needs file and crop [x, y, w, h]`);
    if (!a.source) errs.push(`assets.${id}: needs source (shown on its mount)`);
    if (a.people !== 'none') errs.push(`assets.${id}: people must be 'none' (crop people out; tools/check-assets.mjs looks for faces)`);
    if (a.focus != null && !(Array.isArray(a.focus) && a.focus.length === 2)) errs.push(`assets.${id}: focus is [x, y] in file px`);
    if (a.chip != null) {
      if (!Array.isArray(a.chip) || a.chip.length !== 2) errs.push(`assets.${id}: chip is [label, value]`);
      else {
        if (String(a.chip[0]).length > LIMITS.chipLabel || words(a.chip[0]).length > 6) errs.push(`assets.${id}: chip label "${a.chip[0]}" over ${LIMITS.chipLabel} characters or 6 words`);
        if (String(a.chip[1]).length > LIMITS.chipValue || words(a.chip[1]).length > 2) errs.push(`assets.${id}: chip value "${a.chip[1]}" over ${LIMITS.chipValue} characters or 2 words`);
      }
    }
  }
  if (!errs.length) { try { Wd = world(content); } catch (e) { errs.push(`assets: ${e.message}`); } }
  // a box must lie in the part of the crop the mount shows (the crop's 16:9 region round `focus`)
  const inRegion = (id, b, what) => {
    const e = Wd?.E[id];
    if (!e) return;
    if (!box4(b)) return errs.push(`${what}: a box is [x, y, w, h] in the file's pixels`);
    const [rx, ry, rw, rh] = e.region;
    if (b[0] < rx - 0.5 || b[1] < ry - 0.5 || b[0] + b[2] > rx + rw + 0.5 || b[1] + b[3] > ry + rh + 0.5) errs.push(`${what}: box ${JSON.stringify(b)} lies outside the part of ${id} the mount shows, [${e.region.map((v) => Math.round(v)).join(', ')}] (move the asset's focus or its crop)`);
  };
  const nw = (t) => words(t).length;
  if (!S.length) errs.push('scenes: none');
  if (S[0] && S[0].type !== 'open') errs.push('scene 1 must be open (content first, then its mount)');
  if (S.length && S.at(-1).type !== 'lockup') errs.push(`the last scene must be lockup (got ${S.at(-1).type})`);
  if (S[0]?.exhibit && A[S[0].exhibit]?.chip) errs.push(`assets.${S[0].exhibit}: the opening exhibit carries no chip (the opening is content first; its caption is its text)`);
  if (S.filter((s) => s.type === 'read').length > LIMITS.reads) errs.push(`read: at most ${LIMITS.reads} a film (lift-out is the claim's move, not every exhibit's)`);
  let prev = null;
  S.forEach((s, i) => {
    const at = `scene ${i + 1} (${s.type})`;
    if (!TYPES.includes(s.type)) return errs.push(`${at}: unknown type; types: ${TYPES.join(', ')}`);
    if (s.type !== 'lockup' && !A[s.exhibit]) errs.push(`${at}: exhibit "${s.exhibit}" is not in assets`);
    const cap = s.claim ? LIMITS.claim : LIMITS.caption;
    if (s.caption && nw(s.caption) > cap) errs.push(`${at}: caption has ${nw(s.caption)} words; at most ${cap}${s.claim ? ' (a claim)' : ''}`);
    if (s.caption && s.type === 'lockup') errs.push(`${at}: no caption on a lockup (the title block is its text)`);
    if (s.type === 'open' && i > 0) errs.push(`${at}: open only as the first scene`);
    if ((s.type === 'read' || s.type === 'measure') && s.exhibit !== prev) errs.push(`${at}: ${s.type} stays on the exhibit before it (travel or match there first)`);
    if ((s.type === 'travel' || s.type === 'match') && s.exhibit === prev) errs.push(`${at}: ${s.type} goes to another exhibit than the one before`);
    if (s.type === 'travel') {
      let mv = null;
      try { mv = travelMove(s, content); } catch (e) { errs.push(`${at}: ${e.message}`); }
      const a = Wd?.E[prev], b = Wd?.E[s.exhibit];
      if (mv && a && b && NEIGHBOUR.includes(mv.device) && Math.abs(a.i - b.i) !== 1) errs.push(`${at}: ${mv.device} goes to a neighbouring print (prints lie in the order they first appear); use move: 'grid-hop' to reach ${s.exhibit}`);
    }
    if (s.type === 'read') {
      const cells = s.cells;
      if (!Array.isArray(cells) || cells.length < LIMITS.cells[0] || cells.length > LIMITS.cells[1]) errs.push(`${at}: cells must be an array of 1–3`);
      else cells.forEach((c, k) => {
        const w = `${at} cell ${k + 1}`;
        inRegion(s.exhibit, c.box, `${w} box`); inRegion(s.exhibit, c.glyph, `${w} glyph`);
        if (String(c.value ?? '').length > LIMITS.valueChars) errs.push(`${w}: value "${c.value}" over ${LIMITS.valueChars} characters`);
        if (nw(`${c.value} ${c.label ?? ''}`) > LIMITS.cardWords) errs.push(`${w}: value and label are ${nw(`${c.value} ${c.label}`)} words; at most ${LIMITS.cardWords} (one card is read in about a second)`);
        if (String(c.label ?? '').length > LIMITS.labelChars) errs.push(`${w}: label over ${LIMITS.labelChars} characters`);
        if (c.note && nw(c.note) > LIMITS.noteWords) errs.push(`${w}: note over ${LIMITS.noteWords} words (a glance)`);
      });
    }
    if (s.type === 'match') {
      if (prev && A[prev]) inRegion(prev, s.from?.box, `${at} from.box`);
      inRegion(s.exhibit, s.to?.box, `${at} to.box`);
      if (!s.from?.value) errs.push(`${at}: from.value (the value as printed in both exhibits)`);
    }
    if (s.type === 'measure') {
      for (const k of ['a', 'b']) {
        if (!Array.isArray(s[k]?.point) || !Number.isFinite(s[k]?.value)) errs.push(`${at}: ${k} = { point: [x, y] (file px), value: number as printed }`);
        else inRegion(s.exhibit, [...s[k].point, 0, 0], `${at} ${k}.point`);
      }
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
    travel: type({ max: 5, doc: { in: 'parallax-slide or camera-truck 2 beats, grid-hop 3; the chip, then the caption' } }),
    read: type({ max: 5, doc: { in: 'rings; lift-out 2 beats; cards read one by one; caption', out: 'readings go back, rings off: 1.5 beats' } }),
    match: type({ max: 4, doc: { in: 'ring 1 beat; push, cut on beat 2, pull back (match-cut 2 beats); the chip, then the caption' } }),
    measure: type({ max: 4, doc: { in: 'the dimension draws 1.5 beats; its chip lands on beat 2; the claim' } }),
    lockup: type({ rest: true, absorb: true, max: 8, reason: 'closing card: the address holds ≥ 3 s; the phrase rounding lands here; the second move on the last downbeat', doc: { in: 'the camera rises 2 beats; name, line, address, rule, route' } }),
  },

};
rules.validate = (content) => validate(content);
export default rules;
