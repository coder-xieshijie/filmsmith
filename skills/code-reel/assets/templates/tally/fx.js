// fx.js — drawing helpers for the tally template: measured rich text, tabular numbers, colours.
// Text markup in copy: *accent words* use the palette accent; [strong words] use the text colour at a heavier weight.

export const SANS = 'Inter Tight';
export const MONO = 'IBM Plex Mono';
export const font = (weight, size, fam = SANS) => `${weight} ${size}px "${fam}"`;

const cache = new Map();
export const measure = (ctx, text, f, ls = 0) => {
  const key = f + '|' + ls + '|' + text;
  let w = cache.get(key);
  if (w === undefined) {
    ctx.save();
    ctx.font = f;
    ctx.letterSpacing = ls + 'px';
    w = ctx.measureText(text).width;
    ctx.restore();
    cache.set(key, w);
  }
  return w;
};
export const clearMeasure = () => cache.clear();

// '*a* plain [b]' → [{ text: 'a', kind: 'accent' }, { text: ' plain ', kind: 'plain' }, { text: 'b', kind: 'strong' }]
export const runs = (s) => {
  const out = [];
  const re = /\*([^*]+)\*|\[([^\]]+)\]/g;
  let i = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > i) out.push({ text: s.slice(i, m.index), kind: 'plain' });
    out.push(m[1] != null ? { text: m[1], kind: 'accent' } : { text: m[2], kind: 'strong' });
    i = re.lastIndex;
  }
  if (i < s.length) out.push({ text: s.slice(i), kind: 'plain' });
  return out;
};
export const plain = (s) => runs(s).map((r) => r.text).join('');

// ---------- phrases (timing API 3: at most 5 primary words enter together) ----------
// tokens('Second fate: *Rejected*.') → [{ text: 'Second', kind: 'plain', sp: false }, …, { text: 'Rejected', kind:
// 'accent', sp: true }, { text: '.', kind: 'plain', sp: false }]: every space-separated piece of every run, with
// `sp` = a space before it. A word has a letter or a digit (lib/timing.js counts the same way); '←', '·', '→'
// and punctuation are tokens but not words.
export const isWord = (s) => /[\p{L}\p{N}]/u.test(s);
export const tokens = (s) => {
  const out = [];
  let sp = false;
  for (const r of runs(String(s ?? ''))) {
    for (const piece of r.text.split(/(\s+)/)) {
      if (!piece) continue;
      if (/^\s+$/.test(piece)) { sp = true; continue; }
      out.push({ text: piece, kind: r.kind, sp: out.length ? sp : false });
      sp = false;
    }
  }
  return out;
};
// Markup text of a token list (accent and strong runs re-wrapped).
export const tokensText = (tk) => {
  let s = '';
  for (let i = 0; i < tk.length;) {
    let j = i;
    while (j + 1 < tk.length && tk[j + 1].kind === tk[i].kind) j++;
    const body = tk.slice(i, j + 1).map((t, x) => (x && t.sp ? ' ' : '') + t.text).join('');
    const [a, b] = tk[i].kind === 'accent' ? ['*', '*'] : tk[i].kind === 'strong' ? ['[', ']'] : ['', ''];
    s += (i && tk[i].sp ? ' ' : '') + a + body + b;
    i = j + 1;
  }
  return s;
};
// phrasesOf(text, max) → [{ tokens, words, text, plain }]: the line cut into phrases of at most `max` words that
// enter one after another. A line of `max` words or fewer is one phrase. Longer lines are cut into the fewest
// phrases, each about the same length, breaking after punctuation when there is a break within one word of the
// even cut. Tokens that are not words ride with the next word ('←' with '18%'), or with the last one at the end.
const BREAK = /[,.:;?!—–)]$/;
export const phrasesOf = (text, max = 5) => {
  const tk = tokens(text);
  const units = []; // [{ tokens, word }]
  let lead = [];
  for (const t of tk) {
    if (!isWord(t.text)) { (units.length && !t.sp ? units[units.length - 1].tokens : lead).push(t); continue; }
    units.push({ tokens: [...lead, t], word: t });
    lead = [];
  }
  if (lead.length) { if (units.length) units[units.length - 1].tokens.push(...lead); else units.push({ tokens: lead, word: null }); }
  const n = units.filter((u) => u.word).length;
  const mk = (us) => { const t = us.flatMap((u) => u.tokens); const s = tokensText(t); return { tokens: t, words: us.filter((u) => u.word).length, text: s, plain: plain(s) }; };
  if (!units.length) return [];
  if (n <= max) return [mk(units)];
  const k = Math.ceil(n / max), out = [];
  let start = 0;
  for (let j = 0; j < k; j++) {
    const left = units.length - start;
    if (j === k - 1) { out.push(mk(units.slice(start))); break; }
    const ideal = Math.round(((j + 1) * units.length) / k);
    const lo = Math.max(start + 1, units.length - (k - j - 1) * max), hi = Math.min(start + max, units.length - (k - j - 1));
    let end = Math.min(hi, Math.max(lo, ideal));
    for (const d of [0, -1, 1]) {
      const e = ideal + d;
      if (e >= lo && e <= hi && BREAK.test(units[e - 1].tokens[units[e - 1].tokens.length - 1].text)) { end = e; break; }
    }
    if (left <= 0) break;
    out.push(mk(units.slice(start, end)));
    start = end;
  }
  return out;
};

// style: { weight, size, fam, ls, strongWeight, color: { plain, accent, strong } }
const runFont = (st, kind) => font(kind === 'strong' ? st.strongWeight ?? st.weight : st.weight, st.size, st.fam);
export const measureRich = (ctx, s, st) => runs(s).reduce((w, r) => w + measure(ctx, r.text, runFont(st, r.kind), st.ls || 0), 0);
export const drawRich = (ctx, s, x, y, st, align = 'left') => {
  const rs = runs(s);
  const w = measureRich(ctx, s, st);
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const r of rs) {
    const f = runFont(st, r.kind);
    ctx.font = f;
    ctx.letterSpacing = (st.ls || 0) + 'px';
    ctx.fillStyle = st.color[r.kind] || st.color.plain;
    ctx.fillText(r.text, cx, y);
    cx += measure(ctx, r.text, f, st.ls || 0);
  }
  ctx.letterSpacing = '0px';
  return w;
};
// Largest size <= st.size (and >= min) at which s fits maxWidth.
export const fitSize = (ctx, s, st, maxWidth, min = 12) => {
  let size = st.size;
  while (size > min && measureRich(ctx, s, { ...st, size }) > maxWidth) size -= 1;
  return size;
};

// Numbers drawn in fixed digit cells so a counting value never jitters (proportional figures otherwise).
export const tabularWidth = (ctx, str, f) => {
  const cell = Math.max(...'0123456789'.split('').map((d) => measure(ctx, d, f)));
  let w = 0;
  for (const ch of str) w += /\d/.test(ch) ? cell : measure(ctx, ch, f);
  return w;
};
export const drawTabular = (ctx, str, x, y, f, color, align = 'left') => {
  const cell = Math.max(...'0123456789'.split('').map((d) => measure(ctx, d, f)));
  const w = tabularWidth(ctx, str, f);
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  ctx.font = f;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '0px';
  for (const ch of str) {
    if (/\d/.test(ch)) {
      ctx.textAlign = 'center';
      ctx.fillText(ch, cx + cell / 2, y);
      cx += cell;
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(ch, cx, y);
      cx += measure(ctx, ch, f);
    }
  }
  ctx.textAlign = 'left';
  return w;
};

export const hexRgb = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgbaStr = ([r, g, b], a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)})`;
export const mixRgb = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
export const withAlpha = (hex, a) => rgbaStr(hexRgb(hex), a);
