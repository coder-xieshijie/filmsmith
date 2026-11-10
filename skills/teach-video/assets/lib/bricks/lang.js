// lang.js — the language functions bricks call instead of touching text themselves: graphemes, line breaks, wrapping,
// typing, slot units, reading time, font stacks and case per language. Reading follows the runtime's one rule
// (timing.js readCount, readTimeOf), so a brick and a template's `npm run fit` count the same seconds.
// Pure: no DOM except the canvas context a caller passes for measuring.

import { fontOf, measure } from '../handoffs/util.js';
import { readCount, readTimeOf } from '../timing.js';

const SEG = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
// Grapheme clusters: every per-character animation counts these, never code units.
export const graphemes = (s) => (SEG ? Array.from(SEG.segment(String(s ?? '')), (x) => x.segment) : Array.from(String(s ?? '')));

const CJK = /[　-〿぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/;
const NO_START = /^[。，、；：？！）」』》〉】,.;:?!)\]%]/;   // never at the start of a line
const NO_END = /[（「『《〈【(\[]$/;                          // never at the end of a line
export const isCJK = (ch) => CJK.test(ch);

// Break opportunities [{ w, sep }]: Latin at spaces; Chinese between characters, a Latin word or a number with its unit
// kept whole, with simple kinsoku (no closing punctuation at a line start, no opening one at a line end).
export const breaks = (s, lang = 'en') => {
  s = String(s ?? '');
  if (lang !== 'zh') return s.split(/\s+/).filter(Boolean).map((w) => ({ w, sep: ' ' }));
  const out = [];
  let run = '', pendingSpace = false;
  const flush = () => { if (run) { out.push({ w: run, sep: pendingSpace && out.length ? ' ' : '' }); run = ''; pendingSpace = false; } };
  for (const g of graphemes(s)) {
    if (/\s/.test(g)) { flush(); pendingSpace = true; continue; }
    if (isCJK(g)) {
      flush();
      if (out.length && NO_START.test(g)) { out[out.length - 1].w += g; continue; }
      const prev = out[out.length - 1];
      if (prev && NO_END.test(prev.w)) { prev.w += g; continue; }
      out.push({ w: g, sep: pendingSpace && out.length ? ' ' : '' });
      pendingSpace = false;
    } else run += g;
  }
  flush();
  return out;
};

// Greedy wrap into lines no wider than maxW (f: a font spec as handoffs/util.js fontOf takes).
export const wrap = (ctx, s, f, maxW, lang = 'en') => {
  const lines = [];
  let line = '';
  for (const { w, sep } of breaks(s, lang)) {
    const next = line ? line + sep + w : w;
    if (line && measure(ctx, next, f).width > maxW) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

// Reading units and the limit count of SPEC 3.2: Latin by word; Chinese by character, Latin letters and digits inside
// Chinese two to one (rounded up).
export const units = (s, lang = 'en') => {
  s = String(s ?? '');
  if (lang !== 'zh') return s.split(/\s+/).filter(Boolean).length;
  let han = 0, latin = 0;
  for (const g of graphemes(s)) if (isCJK(g)) han++; else if (/[A-Za-z0-9]/.test(g)) latin++;
  return han + Math.ceil(latin / 2);
};
// What a reader reads (timing.js readCount): English the words holding a letter or a digit; Chinese { han, words }.
export { readCount };
// Seconds to read one main-read line: English 0.3 s a word; Chinese 6 Han characters a second, 0.3 s a Latin word,
// plus 0.5 s.
export const readTime = (s, lang = 'en') => readTimeOf(s, lang);

// Font family stack for a role and language from a look: the Latin family first, CJK after, then a generic.
export const fontStack = (look, role = 'text', lang = 'en') => {
  const fam = look?.type?.families?.[role]?.[lang] || look?.type?.families?.[role]?.en || ['sans-serif'];
  const generic = role === 'mono' ? 'monospace' : 'sans-serif';
  return [...fam.map((f) => `"${f}"`), generic].join(', ');
};
// A font spec ({ family, weight, size, spacing }) for a role at a size in a language: tracking from the look in em,
// Chinese never takes negative tracking.
export const fontFor = (look, role, lang, size, weight = 600, kind = role === 'display' ? 'display' : null) => {
  const tr = kind ? look?.type?.tracking?.[lang]?.[kind] ?? 0 : 0;
  return { family: fontStack(look, role, lang), weight, size, spacing: (lang === 'zh' ? Math.max(0, tr) : tr) * size };
};
// Whether a role is set in capitals and its tracking: Chinese has no case and no negative tracking, no italic.
export const caseOf = (s, look, role, lang = 'en') => {
  const caps = (look?.type?.caps?.[lang] || []).includes(role);
  const tr = look?.type?.tracking?.[lang]?.[role] ?? 0;
  return { text: caps && lang !== 'zh' ? String(s).toLocaleUpperCase('en') : String(s), tracking: lang === 'zh' ? Math.max(0, tr) : tr, italic: lang !== 'zh' && !!look?.type?.italic?.[lang] };
};
export { fontOf };
