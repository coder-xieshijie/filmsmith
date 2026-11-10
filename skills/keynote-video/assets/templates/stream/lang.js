// lang.js — everything that depends on the language of the copy, in one place.
//
// content.lang is 'en' (default) or 'zh'. Every reading time, character limit, line break and typing effect in
// this template goes through the functions below; no scene counts words or splits text on its own.
// These belong in the shared runtime (reading into lib/timing.js, breaks/wrap/typed into lib/text.js); they live
// here until the stream mode moves into the Skill, and are written so that move is a copy.
//
//   reading   en: 0.3 s a word (the runtime's wordSec), at least 1 s a state.
//             zh: 6 characters a second plus 0.5 s a state (owner, 2026-11-09);
//             a Latin word inside Chinese copy counts 0.3 s.
//   limits    one table per language (LIMITS): Latin slots count characters, Chinese slots count characters too,
//             but about 1 em wide each, so the zh numbers are roughly half.
//   breaks    en: at spaces. zh: between any two Han characters, never before closing punctuation or after opening
//             punctuation (kinsoku), never inside a Latin word or number.
//   typed     by grapheme cluster (Intl.Segmenter), so an emoji or a combined mark never splits.

export const LANGS = ['en', 'zh'];
export const langOf = (content) => (LANGS.includes(content?.lang) ? content.lang : 'en');

const HAN = /[\p{Script=Han}　-〿＀-￯]/u;
const HAN_G = /[\p{Script=Han}]/gu;
export const isHan = (ch) => HAN.test(ch);

const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('und', { granularity: 'grapheme' }) : null;
export const graphemes = (text) => (seg ? [...seg.segment(String(text ?? ''))].map((x) => x.segment) : [...String(text ?? '')]);

// Han characters and Latin words (a run of letters or digits) in a string or an array of strings.
export const count = (text) => {
  const t = Array.isArray(text) ? text.flat(Infinity).filter(Boolean).join(' ') : String(text ?? '');
  const han = (t.match(HAN_G) || []).length;
  const words = t.replace(HAN_G, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return { han, words };
};

export const READ = {
  en: { wordSec: 0.3, stateMin: 1.0, stateAdd: 0 },
  zh: { wordSec: 0.3, hanPerSec: 6, stateAdd: 0.5, stateMin: 1.0 },
};

// Seconds one state of text needs to be read once it is fully on screen.
export const readSec = (text, lang = 'en') => {
  const c = count(text);
  if (!c.han && !c.words) return 0;
  const r = READ[lang] ?? READ.en;
  const s = c.words * r.wordSec + (c.han ? c.han / (r.hanPerSec ?? 6) : 0) + (r.stateAdd ?? 0);
  return Math.max(r.stateMin, s);
};

// Visible length used by the character limits: graphemes, spaces included.
export const len = (text) => graphemes(text).length;

// ---------- line breaking ----------

const NO_START = '，。、；：？！）」』》〉】〕…—·%,.;:?!)]}\'"”’ー々〻';
const NO_END = '（「『《〈【〔“‘([{';

// Break opportunities: [{ w, sep }], sep joins w to the text before it on the same line.
export const breaks = (text, lang = 'en') => {
  const s = String(text ?? '');
  if (lang !== 'zh' && !HAN.test(s)) return s.split(/\s+/).filter(Boolean).map((w) => ({ w, sep: ' ' }));
  // zh: tokens are single Han characters (with kinsoku glue) and whole Latin words with their trailing space
  const out = [];
  const gs = graphemes(s);
  let buf = '', pendingSep = '';
  const push = (w, sep) => { if (w) out.push({ w, sep }); };
  for (let i = 0; i < gs.length; i++) {
    const ch = gs[i];
    if (/\s/.test(ch)) { if (buf) { push(buf, pendingSep); buf = ''; } pendingSep = ' '; continue; }
    if (isHan(ch)) {
      if (buf && !NO_END.includes(buf.slice(-1))) { push(buf, pendingSep); buf = ''; pendingSep = ''; }
      if (NO_START.includes(ch) && (buf || out.length)) { // glue to what came before
        if (buf) buf += ch; else out[out.length - 1].w += ch;
        continue;
      }
      buf += ch;
      if (!NO_END.includes(ch)) { push(buf, pendingSep); buf = ''; pendingSep = ''; }
      continue;
    }
    // Latin, digits, other punctuation: build a word
    if (NO_START.includes(ch) && !buf && out.length && !pendingSep) { out[out.length - 1].w += ch; continue; }
    if (buf && isHan(buf.slice(-1)) && !NO_END.includes(buf.slice(-1))) { push(buf, pendingSep); buf = ''; pendingSep = ''; }
    buf += ch;
  }
  push(buf, pendingSep);
  return out;
};

// Wrap into lines no wider than maxWidth; measure(str) returns a width in px.
//   zh: phrases first — a line breaks after ，、：；。！？ when the phrase fits, and only a phrase wider than the
//       line is broken between characters (kinsoku from breaks()).
//   balance (default on): the width is then narrowed as long as the line count stays the same, so the last line
//       is never a lone word or a lone character ("问。").
const PHRASE_END = /([，、：；。！？])/;
const greedy = (measure, para, maxWidth, lang) => {
  const lines = [];
  let line = '', broken = false;
  const addTokens = (toks) => {
    for (const { w, sep } of toks) {
      const next = line ? line + sep + w : w;
      if (line && measure(next) > maxWidth) { lines.push(line); line = w; } else line = next;
    }
  };
  if (lang === 'zh' || HAN.test(para)) {
    const phrases = para.split(PHRASE_END).reduce((acc, x, i) => (i % 2 ? (acc[acc.length - 1] += x, acc) : (x && acc.push(x), acc)), []);
    for (const ph of phrases) {
      const next = line + ph;
      if (measure(next) <= maxWidth) line = next;
      else if (measure(ph) <= maxWidth) { if (line) lines.push(line); line = ph; }
      else { broken = true; addTokens(breaks(ph, 'zh')); }
    }
  } else addTokens(breaks(para, lang));
  lines.push(line);
  return { lines, broken };
};
export const wrap = (measure, text, maxWidth, lang = 'en', { balance = true } = {}) => {
  const out = [];
  for (const para of String(text ?? '').split('\n')) {
    const first = greedy(measure, para, maxWidth, lang);
    let ls = first.lines;
    if (balance && ls.length > 1) { // narrow while the line count holds and no phrase newly breaks inside
      const ok = (w) => { const g = greedy(measure, para, w, lang); return g.lines.length === ls.length && (first.broken || !g.broken); };
      let lo = maxWidth * 0.4, hi = maxWidth;
      for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }
      ls = greedy(measure, para, hi, lang).lines;
    }
    out.push(...ls);
  }
  return out;
};

// Typing: the first n grapheme clusters at time t of a line that starts typing at t0.
export const TYPE_RATE = { en: 26, zh: 11 }; // characters a second
export const typed = (text, t, t0, lang = 'en', rate = TYPE_RATE[lang] ?? 26) => {
  const gs = graphemes(text);
  const n = Math.max(0, Math.min(gs.length, Math.floor((t - t0) * rate)));
  return gs.slice(0, n).join('');
};
export const typeSec = (text, lang = 'en', rate = TYPE_RATE[lang] ?? 26) => len(text) / rate;

// ---------- type per language ----------
// Same roles, different sizes: Chinese sets denser (each glyph ~1 em), needs more leading and a touch of tracking;
// Latin keeps tighter tracking. Sizes in px at 1920×1080. Information text ≥ 25 px; main text ≥ 40 px except
// where the card says why (hung UI blocks read at 30 px, like the source film).
export const TYPE = {
  en: {
    family: "'DM Sans', sans-serif", track: '-0.01em', lead: 1.32,
    caption: 58, sub: 30, bubble: 34, row: 30, rowSub: 26, label: 27, labelSub: 25, cardTitle: 42, cardSub: 27, cardRow: 29,
    claim: 66, word: 54, name: 168, tagline: 40, freeze: 96, window: 26, popup: 25, note: 34, mascotName: 30, weight: { caption: 600, claim: 600, name: 700 },
  },
  zh: {
    family: "'DM Sans', 'Noto Sans SC', sans-serif", track: '0.02em', lead: 1.5,
    caption: 58, sub: 30, bubble: 34, row: 30, rowSub: 26, label: 27, labelSub: 25, cardTitle: 42, cardSub: 27, cardRow: 29,
    claim: 64, word: 56, name: 168, tagline: 40, freeze: 92, window: 26, popup: 25, note: 34, mascotName: 30, weight: { caption: 600, claim: 600, name: 700 },
  },
};

// Character limits per slot (graphemes). zh limits are about half of en: a Han character is ~1 em, a Latin
// character ~0.5 em, and the slots are sized by width.
export const LIMITS = {
  en: { caption: 34, sub: 48, bubble: 86, row: 30, rowSub: 34, label: 18, labelSub: 22, cardTitle: 14, cardSub: 30, cardRow: 34, claim: 30, word: 10, name: 10, tagline: 36, freeze: 16, window: 24, popup: 26, note: 36, file: 18 },
  zh: { caption: 14, sub: 22, bubble: 40, row: 15, rowSub: 17, label: 9, labelSub: 11, cardTitle: 7, cardSub: 15, cardRow: 17, claim: 14, word: 4, name: 10, tagline: 15, freeze: 8, window: 12, popup: 13, note: 16, file: 14 },
};
