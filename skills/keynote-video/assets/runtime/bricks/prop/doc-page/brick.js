// doc-page — a source document as an object: a white page with a title, a meta line and sections of text (or
// skeleton lines), that can scroll inside its frame and mark any line with a marker that grows left to right.
// Adapted from video-shotcraft demos/ui-entrance/doc-park-left-pill-deal/DocParkLeftPillDeal.tsx (card
// references/shots/ui-entrance/doc-park-left-pill-deal.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D prop (no React or Remotion); the upstream launch-film brief is the film's own lines
// (title, meta, headings, paragraphs) or, by default, the sample copy with skeleton lines for unwritten paragraphs; the
// evidence marker is the accent at low alpha with the marked text turning toward the accent; sizes are film px
// (the upstream's 480-wide design × 4); `ts` scales the text when a scene shows the page smaller than 1:1.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { hash } from '../../../rng.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
export const DOC = { w: 1000, h: 760, pad: 56, radius: 40 };
const GAP = { title: 0, meta: 50, rule: 40, h: 74, p: 46 };

// The sample document: the long title, a meta line, six sections of three lines; the first line of sections 2, 3 and
// 4 is written (and marked by scenes as evidence), the rest are skeleton lines.
export const docLines = (lang = 'en') => {
  const heads = [...copy('steps', lang), ...copy('nav', lang)].slice(0, 6), kpis = copy('kpis', lang), sep = lang === 'zh' ? '，' : ' · ';
  const lines = [{ kind: 'title', text: copy('titleLong', lang) }, { kind: 'meta', text: `${copy('product', lang)}${sep}${copy('caption', lang)}` }];
  heads.forEach((h, s) => {
    lines.push({ kind: 'h', text: h });
    for (let j = 0; j < 3; j++) {
      const m = s >= 1 && s <= 3 && j === 0 ? s - 1 : undefined;
      lines.push(m === undefined ? { kind: 'p', text: null } : { kind: 'p', text: `${kpis[m].label} ${kpis[m].value}${sep}${kpis[m].delta} ${copy('metricLabel', lang)}`, mark: m });
    }
  });
  return lines;
};
// Baselines (content px from the page top) for every line, and the content height; ts spaces the lines with the text.
export const layoutDoc = (lines, ts = 1) => {
  let y = 76 * ts; const ys = [];
  lines.forEach((l, i) => { if (i) y += ts * (l.kind === 'meta' ? GAP.meta : l.kind === 'h' ? GAP.h + (lines[i - 1].kind === 'meta' ? GAP.rule : 0) : GAP.p); ys.push(y); });
  return { ys, height: y + 60 };
};
const fontOfLine = (P, kind, ts) => {
  const info = infoSize(P.lang);
  if (kind === 'title') return F(P, 'display', 40 * ts, 680, 'display');
  if (kind === 'meta') return F(P, 'mono', info * ts, 500, 'label');
  if (kind === 'h') return F(P, 'mono', info * ts, 700, 'label');
  return F(P, 'text', 31 * ts, 460);
};
// The page at its own origin (w × h): face, hairline, the lines scrolled up by `scroll` px; marks[k] in [0, 1] grows
// the marker under the line whose `mark` is k. Returns the right end of every marked line (content x, baseline y).
export const paintDoc = (ctx, lines, lay, P, { w = DOC.w, h = DOC.h, scroll = 0, marks = [], ts = 1, radius = DOC.radius } = {}) => {
  const c = P.colors, ends = [];
  rrect(ctx, 0, 0, w, h, radius); ctx.fillStyle = c.panel; ctx.fill();
  ctx.save(); rrect(ctx, 0, 0, w, h, radius); ctx.clip();
  ctx.fillStyle = rgba('#ffffff', 0.9); ctx.fillRect(0, 0, w, 2);
  ctx.translate(0, -scroll);
  const cw = w - 2 * DOC.pad;
  lines.forEach((l, i) => {
    const y = lay.ys[i], f = fontOfLine(P, l.kind, ts);
    if (y - scroll < -60 || y - scroll > h + 60) { if (l.mark !== undefined) ends[l.mark] = [DOC.pad, y]; return; }
    if (l.kind === 'meta') { text(ctx, l.text, DOC.pad, y, f, { color: c.dim }); ctx.fillStyle = c.line; ctx.fillRect(DOC.pad, y + 30 * ts, cw, 2); return; }
    if (!l.text) {   // a skeleton line: a soft bar whose length varies, the last of a section shorter
      const last = i + 1 >= lines.length || lines[i + 1].kind !== 'p', lw = cw * (last ? 0.52 + 0.2 * hash(i, 7) : 0.82 + 0.17 * hash(i, 5));
      rrect(ctx, DOC.pad, y - 20 * ts, lw, 18 * ts, 9 * ts); ctx.fillStyle = rgba(c.ink, 0.1); ctx.fill(); return;
    }
    const mk = l.mark !== undefined ? clamp(marks[l.mark] || 0) : 0, tw = measure(ctx, l.text, f).width;
    if (mk > 0) { rrect(ctx, DOC.pad - 8, y - 30 * ts, (tw + 16) * mk, 40 * ts, 8); ctx.fillStyle = rgba(c.accent, 0.16); ctx.fill(); }
    const col = l.kind === 'title' ? c.ink : l.kind === 'h' ? c.dim : mix(mix(c.ink, c.dim, 0.45), mix(c.accent, c.ink, 0.45), mk);
    text(ctx, l.text, DOC.pad, y, f, { color: col });
    if (l.mark !== undefined) ends[l.mark] = [DOC.pad + tw, y - 11 * ts];
  });
  ctx.restore();
  rrect(ctx, 0.75, 0.75, w - 1.5, h - 1.5, radius); ctx.strokeStyle = rgba(c.ink, 0.09); ctx.lineWidth = 1.5; ctx.stroke();
  return ends;
};
// A soft two-layer shadow for the page at elevation e.
export const docShadow = (ctx, w, h, e, c, radius = DOC.radius) => {
  const tone = mix(c.ink, '#000000', 0.6);
  ctx.save();
  for (const [b, dy, a] of [[2 + e * 0.2, 1 + e * 0.1, 0.12], [10 + e * 1.2, 3 + e * 0.6, 0.14]]) { ctx.shadowColor = rgba(tone, a); ctx.shadowBlur = b; ctx.shadowOffsetY = dy; rrect(ctx, 2, 2, w - 4, h - 4, radius); ctx.fillStyle = c.panel; ctx.fill(); }
  ctx.restore();
};

// The sample: the page in the middle scrolls slowly (braking at the end) and marks its three evidence lines in turn.
const markAt = (p, k) => EASE.out(clamp((p - 0.12 - k * 0.27) / 0.12));
const scrollAt = (p) => { const a = 0.8, u = clamp((p - a) / (1 - a)); return 360 * (p <= a ? p : a + (1 - a) * (u - (u * u) / 2)) / 0.9; };

export default {
  id: 'doc-page', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [750, 570], M: [DOC.w, DOC.h], L: [1250, 950] },
  states: { still: { scroll: 0, mark: 0 }, read: { scroll: 1, mark: 1 } },
  parts: ['face', 'title', 'meta', 'heading', 'line', 'skeleton', 'marker'],
  swap: {
    lines: { type: 'list', count: [6, 40], of: {
      kind: { type: 'enum', of: ['title', 'meta', 'h', 'p'] },
      text: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 12, chars: 64 }, zh: { chars: 28 } } },
      mark: { type: 'number', optional: true },
    } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'A source document as an object: a page of title, meta and sections that can scroll in its frame and mark any line.',
  beats: 0,
  beatsFor: () => 6,
  defaults: () => ({ lines: null, size: 'M' }),
  prepare(P) { const lines = P.lines || docLines(P.lang), k = ((this.sizes[P.size] || this.sizes.M)[0]) / DOC.w; return { lines, lay: layoutDoc(lines, Math.max(1, 1 / k)), k }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) { return { scroll: scrollAt(p), marks: [0, 1, 2].map((k) => markAt(p, k)) }; },
  paint(ctx, S, P, D) {
    const c = P.colors, k = D.k;   // a size tier scales the page; its text keeps the floor (ts)
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(960 - (DOC.w * k) / 2, 540 - (DOC.h * k) / 2); ctx.scale(k, k);
    docShadow(ctx, DOC.w, DOC.h, 10, c); paintDoc(ctx, D.lines, D.lay, P, { scroll: S.scroll, marks: S.marks, ts: Math.max(1, 1 / k) });
    ctx.restore();
  },
  track(S, P, D) { return [[960, 540 + D.k * (400 - S.scroll)]]; },
};
