// paper-term — the light terminal of a narrated explainer: a white body in a 3 px ink frame (radius 12) with a hard offset
// shadow, a 40 px title bar with three coloured dots, an optional identity square, a title and a note at the right; a
// line typed after the prompt sign › behind a 4 px caret; a log of short lines that scrolls (machine output grey in mono,
// a pass in green, what a person types in vermilion); the window grows with its content.
// From teach-video assets/kits/terminal-ledger/starter/components/term.js and style.css (.term, .q, .ln, .caret);
// blueprint-zoom's term.js is the same window. Drawn by the kit's drawTerm / drawTyped / drawLog.
import { W, drawTerm, drawTyped, drawLog, clamp, lerp, sz } from '../../look/paper-ledger/kit.js';

const DEFAULT = {
  en: { title: 'Inbox · this week', right: '', sq: null, prompt: '› ', line: 'How many emails came in this week?', log: [{ text: '$ read 3 mailboxes', cls: '' }, { text: '✓ 1,200 emails found', cls: 'ok' }, { text: 'Leave the rest for me', cls: 'me' }] },
  zh: { title: '收件箱 · 本周', right: '', sq: null, prompt: '› ', line: '这一周收到多少封邮件？', log: [{ text: '$ 读取 3 个邮箱', cls: '' }, { text: '✓ 找到 1,200 封邮件', cls: 'ok' }, { text: '其余的留给我', cls: 'me' }] },
};
// open: the window shown (opacity, 24 px rise); typed: 0–1 of the line's graphemes; log: 0–1 of the log's lines; grow: 0 the
// short window (the typed line only), 1 its full height
const STATES = {
  closed: { open: 0, typed: 0, log: 0, grow: 0 },
  open: { open: 1, typed: 0, log: 0, grow: 0 },
  typed: { open: 1, typed: 1, log: 0, grow: 0 },
  logged: { open: 1, typed: 1, log: 1, grow: 1 },
};
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

// The window from a state in [0, 0, w, h] (layout 1200 × 590 scaled to w): what term-count and session-queue draw.
export const drawPaperTerm = (ctx, C, lang, P, s, w, h) => {
  const k = w / 1200, H0 = 140, hh = lerp(H0, h / k, clamp(s.grow));
  ctx.save(); ctx.scale(k, k);
  const n = [...(P.line || '')].length, lines = P.log || [];
  drawTerm(ctx, C, lang, [0, lerp(24, 0, clamp(s.open)), 1200, hh], { title: P.title, right: P.right, sq: P.sq ? C[P.sq] || P.sq : null, alpha: clamp(s.open) }, (c) => {
    drawTyped(c, C, lang, P.prompt ?? '› ', P.line || '', 36, 54, clamp(s.typed) * n, 0, 1, { size: 40, lh: 64, caret: s.typed < 1 ? Infinity : -1 });
    const shown = clamp(s.log) * lines.length;
    drawLog(c, C, lang, lines.map((l, i) => ({ ...l, t: i })), [36, 130, 1100, 34 * 6], shown, 6);
  });
  ctx.restore();
};

export default {
  id: 'paper-term', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [600, 295], M: [1200, 590], L: [1500, 738] },
  states: STATES,
  parts: ['frame', 'shadow', 'title bar', 'dots', 'identity square', 'title', 'right note', 'prompt', 'typed line', 'caret', 'log'],
  swap: {
    title: { type: 'text', tier: 'glance', limits: lim(28, 14, 5) },
    right: { type: 'text', tier: 'glance', optional: true, limits: lim(14, 6, 2) },
    line: { type: 'text', tier: 'primary', limits: lim(40, 18, 8) },
    log: { type: 'list', count: [0, 6], of: { text: { type: 'text', tier: 'glance', limits: lim(40, 18, 7) }, cls: { type: 'enum', of: ['', 'ok', 'me', 'stop'] } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'ok', 'dotR', 'dotY', 'dotG', 'shadow'],
  summary: 'The light terminal of a narrated explainer: a white window in a hard ink frame with three coloured dots, a line typed after the prompt sign, a log that scrolls, colours by who wrote the line.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  draw(ctx, S, P) { drawPaperTerm(ctx, P.colors, P.lang, P, S, P.w, P.h); },
};
