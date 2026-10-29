// registry.js — the halftone scene registry: types, slot limits, transitions, defaults and the validation that
// `npm run fit` (rules.validate) and the page (film.js) both run. Plain JS for Node and the browser.
import { KINDS } from './fields.js';
import { SHAPES } from './screen.js';
import PALETTES from './palettes.js';

export const TYPES = ['hook', 'card', 'count', 'claim', 'lockup'];
// transitions by tier (research PLAN §3, §5): T1 scene changes, T2 expressive, T3 peaks
export const TRANSITIONS = {
  morph: 'T1', whip: 'T1', scan: 'T1', cut: 'T1',
  invert: 'T2', quantize: 'T2',
  collapse: 'T3', slam: 'T3', pull: 'T3',
};
export const MAX_USES = 3;    // no device more than three times in a film (morph and cut excepted: they are the plain changes)
export const GROUNDS = ['paper', 'ink'];

// character limits (a first filter; the pixel check in film.js decides) and word limits (primary text ≤ 5 words a
// state, a claim ≤ 8; research PLAN §5)
export const LIMITS = {
  hook: { line: 18, lines: 2, words: 5, label: 34 },
  card: { word: 10, line: 30, lineWords: 5, label: 34 },
  count: { value: 7, line: 30, lineWords: 5, label: 34 },
  claim: { line: 18, lines: 2, words: 8 },
  lockup: { name: 14, line: 34, lineWords: 6 },
};

export const DEFAULT_FIELD = { hook: 'rings', card: 'rings', count: 'count', claim: 'none', lockup: 'none' };
export const groundOf = (s) => s.ground ?? (s.type === 'count' ? 'ink' : 'paper');
export const fieldOf = (s) => s.field ?? DEFAULT_FIELD[s.type] ?? 'none';

// The transition out of scene i into scene i + 1: forced into a claim (collapse) and the lock-up (pull); else
// `to` on the scene; else morph on the same ground, whip across grounds.
export const transitionOut = (scenes, i) => {
  const s = scenes[i], n = scenes[i + 1];
  if (!n) return null;
  if (n.type === 'claim') return 'collapse';
  if (n.type === 'lockup') return 'pull';
  if (s.to) return s.to;
  return groundOf(s) === groundOf(n) ? 'morph' : 'whip';
};
export const transitionIn = (scenes, i) => (i > 0 ? transitionOut(scenes, i - 1) : null);

const words = (s) => String(s ?? '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const chars = (s) => [...String(s ?? '')].length;

// validate(content) → error strings (empty when the film is valid). Warnings go to `warn` when given.
export const validate = (content, warn = () => {}) => {
  const E = [];
  const sc = content.scenes || [];
  if (!PALETTES[content.palette]) E.push(`palette "${content.palette}" is not a preset (${Object.keys(PALETTES).join(', ')})`);
  if (content.dot != null && !SHAPES.includes(content.dot)) E.push(`dot "${content.dot}" is not one of ${SHAPES.join(', ')}`);
  if (content.edges != null && !['full', 'cut'].includes(content.edges)) E.push(`edges "${content.edges}" is not full or cut`);
  const m = content.mark;
  if (!m || typeof m.ink !== 'string' || typeof m.accent !== 'string' || !Array.isArray(m.box) || !Array.isArray(m.anchorBox)) E.push('mark: needs ink and accent (SVG path strings in mark units) and box, anchorBox ([x0, y0, x1, y1])');
  if (!sc.length) E.push('scenes: at least one scene');
  if (sc.length && sc.at(-1).type !== 'lockup') E.push('the last scene must be the lockup');
  if (sc.filter((s) => s.type === 'lockup').length > 1) E.push('only one lockup');
  if (sc.slice(1).some((s) => s.type === 'hook')) E.push('hook may only open the film');
  if (sc[0]?.type === 'claim') E.push('a claim needs a scene before it to collapse');

  sc.forEach((s, i) => {
    const at = `scene ${i + 1} (${s.type})`;
    if (!TYPES.includes(s.type)) { E.push(`${at}: unknown type; one of ${TYPES.join(', ')}`); return; }
    const L = LIMITS[s.type];
    const over = (slot, v, lim) => { if (v != null && chars(v) > lim) E.push(`${at}: ${slot} "${v}" is ${chars(v)} characters; at most ${lim}`); };
    if (s.ground != null && !GROUNDS.includes(s.ground)) E.push(`${at}: ground "${s.ground}" is not paper or ink`);
    if (s.field != null && !KINDS.includes(s.field)) E.push(`${at}: field "${s.field}" is not one of ${KINDS.join(', ')}`);
    if (s.to != null && !TRANSITIONS[s.to]) E.push(`${at}: to "${s.to}" is not one of ${Object.keys(TRANSITIONS).join(', ')}`);
    if (s.to === 'collapse' || s.to === 'pull') E.push(`${at}: to "${s.to}" is set by the next scene's type (claim, lockup); remove it`);
    over('label', s.label, L.label ?? 0);
    if (s.label != null && words(s.label) > 6) E.push(`${at}: label has ${words(s.label)} words; a label is glance text, at most 6`);
    if (s.type === 'hook' || s.type === 'claim') {
      const ls = s.lines || [];
      if (!ls.length || ls.length > L.lines) E.push(`${at}: lines must hold 1–${L.lines} lines`);
      ls.forEach((l, k) => over(`line ${k + 1}`, l, L.line));
      const w = words(ls.join(' '));
      if (w > L.words) E.push(`${at}: ${w} words; at most ${L.words}`);
    }
    if (s.pattern != null && !Number.isInteger(s.pattern)) E.push(`${at}: pattern must be an integer`);
    if (s.type === 'card') {
      if (!s.word) E.push(`${at}: word is required`);
      over('word', s.word, L.word);
      over('line', s.line, L.line);
      if (words(s.line) > L.lineWords) E.push(`${at}: line has ${words(s.line)} words; at most ${L.lineWords}`);
    }
    if (s.type === 'count') {
      if (!Number.isInteger(s.value) || s.value < 1) E.push(`${at}: value must be a positive integer`);
      if (s.from != null && (!Number.isInteger(s.from) || s.from < 0 || s.from >= s.value)) E.push(`${at}: from must be an integer below value`);
      over('value', String(s.value ?? ''), L.value);
      over('line', s.line, L.line);
      if (words(s.line) > L.lineWords) E.push(`${at}: line has ${words(s.line)} words; at most ${L.lineWords}`);
    }
    if (s.type === 'lockup') {
      if (!s.name) E.push(`${at}: name is required`);
      over('name', s.name, L.name);
      over('line', s.line, L.line);
      if (words(s.line) > L.lineWords) E.push(`${at}: line has ${words(s.line)} words; at most ${L.lineWords}`);
    }
    const tr = transitionOut(sc, i), n = sc[i + 1];
    if (tr === 'invert' && groundOf(s) === groundOf(n)) E.push(`${at}: invert changes the ground; the next scene is on the same ground (use morph or scan)`);
    if (tr === 'quantize' && groundOf(s) !== groundOf(n)) E.push(`${at}: quantize keeps the ground; the next scene is on the other ground (use whip or invert)`);
    if (tr === 'morph' && n && groundOf(s) !== groundOf(n)) E.push(`${at}: morph keeps the ground; the next scene is on the other ground (use whip or invert)`);
    if (tr === 'quantize' && ['claim', 'lockup'].includes(n?.type)) E.push(`${at}: quantize needs a field in the next scene`);
    if (tr === 'slam' && !['card', 'count'].includes(n?.type)) E.push(`${at}: slam lands a card or a count`);
  });

  // devices and peaks (research PLAN §5): no device more than three times, the whiteout once, 2–3 peaks
  const uses = {};
  sc.forEach((_, i) => { const tr = transitionOut(sc, i); if (tr) uses[tr] = (uses[tr] || 0) + 1; });
  for (const [k, n] of Object.entries(uses)) if (!['morph', 'cut'].includes(k) && n > MAX_USES) E.push(`transition ${k} is used ${n} times; at most ${MAX_USES} (no device more than three times)`);
  if ((uses.slam || 0) > 1) E.push(`slam (the whiteout) is used ${uses.slam} times; at most once a film`);
  const peaks = (sc[0]?.type === 'hook' ? 1 : 0) + sc.filter((s) => s.type === 'claim').length + (uses.slam || 0) + (sc.some((s) => s.type === 'lockup') ? 1 : 0);
  if (peaks > 3) E.push(`${peaks} peaks (hook, claims, slam, lockup); at most 3`);
  if (peaks < 2 && sc.length > 3) warn(`${peaks} peak(s); a film over three scenes wants 2–3 (hook, a claim or slam, the lockup)`);
  return E;
};
