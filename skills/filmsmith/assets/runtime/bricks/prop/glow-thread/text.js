// text.js — everything in the stream bricks that depends on the language: type sizes and families, reading time,
// character limits, balanced line breaking, the units that enter one at a time. Reading and breaking go through the
// library's shared functions (runtime lang.js readTime, breaks, graphemes); the template's own rules are kept where the
// library has none (a state reads at least 1 s; lines balanced so none ends alone; a Chinese phrase kept whole first).
// From the stream template's lang.js. Changed: reading is the library's readTime (English 0.3 s a word; Chinese 6
// characters a second + 0.5 s a state, Latin inside Chinese two letters a unit), with the template's 1 s floor; Chinese
// information text is 28 px (the library's floor) where the template set 25–27 px, except the opening pile (texture).
import { readTime, breaks, graphemes, isCJK } from '../../lang.js';

export { graphemes };
const join = (text) => (Array.isArray(text) ? text.flat(Infinity).filter(Boolean).join(' ') : String(text ?? ''));
// Seconds one state of text needs once it is fully on screen.
// Only letters and digits are read (the template's count): English drops tokens with neither (→, ·, —), Chinese drops
// punctuation (，。、：·), which readTime would count as characters (two of them in a bubble made the Chinese intro two
// beats longer than the original's).
const readable = (s, lang) => (lang === 'zh' ? s.replace(/[\p{P}\p{S}]/gu, ' ') : breaks(s, 'en').map((x) => x.w).filter((w) => /[\p{L}\p{N}]/u.test(w)).join(' ')).trim();
export const readSec = (text, lang = 'en') => { const l = lang === 'zh' ? 'zh' : 'en', s = readable(join(text), l); return s ? Math.max(1, readTime(s, l)) : 0; };
export const len = (text) => graphemes(text).length;

export const TYPE = {
  en: {
    family: "'DM Sans', sans-serif", track: -0.01, lead: 1.32,
    caption: 58, sub: 30, bubble: 34, row: 30, rowSub: 26, label: 27, labelSub: 25, cardTitle: 42, cardSub: 27, cardRow: 29,
    claim: 66, word: 54, name: 168, tagline: 40, freeze: 96, window: 26, popup: 25, note: 34, mascotName: 30, weight: { caption: 600, claim: 600, name: 700 },
  },
  zh: {
    family: "'DM Sans', 'Noto Sans SC', sans-serif", track: 0.02, lead: 1.5,
    caption: 58, sub: 30, bubble: 34, row: 30, rowSub: 28, label: 28, labelSub: 28, cardTitle: 42, cardSub: 28, cardRow: 29,
    claim: 64, word: 56, name: 168, tagline: 40, freeze: 92, window: 26, popup: 25, note: 34, mascotName: 30, weight: { caption: 600, claim: 600, name: 700 },
  },
};
// Character limits per slot (graphemes): the template's table.
export const LIMITS = {
  en: { caption: 34, sub: 48, bubble: 86, row: 30, rowSub: 34, label: 18, labelSub: 22, cardTitle: 14, cardSub: 30, cardRow: 34, claim: 30, word: 10, name: 10, tagline: 36, freeze: 16, window: 24, popup: 26, note: 36, file: 18, role: 36, quote: 40, question: 40, option: 30, optionDesc: 40, field: 30, tab: 12, step: 14, time: 8, day: 12, say: 34 },
  zh: { caption: 14, sub: 22, bubble: 40, row: 15, rowSub: 17, label: 9, labelSub: 11, cardTitle: 7, cardSub: 15, cardRow: 17, claim: 14, word: 4, name: 10, tagline: 15, freeze: 8, window: 12, popup: 13, note: 16, file: 14, role: 20, quote: 20, question: 20, option: 14, optionDesc: 20, field: 15, tab: 6, step: 8, time: 5, day: 6, say: 14 },
};
export const typeOf = (lang) => TYPE[lang === 'zh' ? 'zh' : 'en'];
export const fontOf = (TY, px, w = 400) => `${w} ${px}px ${TY.family}`;

// Line breaking: Chinese phrases first (a line breaks after ，、：；。！？ when the phrase fits; a phrase wider than the
// line breaks between characters with the library's kinsoku); Latin at spaces; then balanced: the width narrows while
// the line count holds, so the last line is never a lone word or character. measure(str) → px.
const PHRASE_END = /([，、：；。！？])/;
const greedy = (measure, para, maxWidth, lang) => {
  const lines = []; let line = '', broken = false;
  const addTokens = (toks) => { for (const { w, sep } of toks) { const next = line ? line + sep + w : w; if (line && measure(next) > maxWidth) { lines.push(line); line = w; } else line = next; } };
  if (lang === 'zh' || graphemes(para).some(isCJK)) {
    const phrases = para.split(PHRASE_END).reduce((acc, x, i) => (i % 2 ? (acc[acc.length - 1] += x, acc) : (x && acc.push(x), acc)), []);
    for (const ph of phrases) {
      const next = line + ph;
      if (measure(next) <= maxWidth) line = next;
      else if (measure(ph) <= maxWidth) { if (line) lines.push(line); line = ph; }
      else { broken = true; addTokens(breaks(ph, 'zh')); }
    }
  } else addTokens(breaks(para, 'en'));
  lines.push(line);
  return { lines, broken };
};
export const wrap = (measure, text, maxWidth, lang = 'en') => {
  const out = [];
  for (const para of String(text ?? '').split('\n')) {
    const first = greedy(measure, para, maxWidth, lang);
    let ls = first.lines;
    if (ls.length > 1) {
      const ok = (w) => { const g = greedy(measure, para, w, lang); return g.lines.length === ls.length && (first.broken || !g.broken); };
      let lo = maxWidth * 0.4, hi = maxWidth;
      for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }
      ls = greedy(measure, para, hi, lang).lines;
    }
    out.push(...ls);
  }
  return out;
};
// The units of a line that enter one at a time: Chinese a character, Latin a word (spaces kept as their own units).
export const unitsOf = (line, lang) => {
  if (lang === 'zh') return graphemes(line).map((g) => ({ s: g, space: /^\s$/.test(g) }));
  const out = [];
  breaks(line, 'en').forEach(({ w }, i) => { if (i) out.push({ s: ' ', space: true }); out.push({ s: w, space: false }); });
  return out;
};
// Typing: the first n grapheme clusters at time t of a line that starts typing at t0.
export const TYPE_RATE = { en: 26, zh: 11 };
export const typed = (text, t, t0, lang = 'en') => { const gs = graphemes(text); const n = Math.max(0, Math.min(gs.length, Math.floor((t - t0) * (TYPE_RATE[lang] ?? 26)))); return gs.slice(0, n).join(''); };
