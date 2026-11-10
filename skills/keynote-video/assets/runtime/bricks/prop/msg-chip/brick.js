// msg-chip — a message on a line: a small rounded chip (2.5 px border, radius 21, 38 px tall) whose colour says who wrote
// it — yellow a person's message, red text the model wrote (a tool call), green a result coming back, grey plain text
// (no tool call); its text can type in one character at a time while it waits between two parts.
// From teach-video assets/kits/blueprint-zoom/starter/components/message.js (.bp-chip) and tokens.js (msg*, call*, res*,
// txt*). Drawn by the sketch-paper kit's drawMsgChip; msg-hop moves it along a connector.
import { drawMsgChip } from '../../look/sketch-paper/kit.js';

const DEFAULT = { en: { text: 'edit(app.ts, …)', kind: 'call' }, zh: { text: 'edit(app.ts, …)', kind: 'call' } };
// shown: 0–1 of the text typed; alpha; scale
const STATES = { hidden: { alpha: 0, shown: 1, scale: 1 }, typing: { alpha: 1, shown: 0.4, scale: 1 }, shown: { alpha: 1, shown: 1, scale: 1 } };
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

export default {
  id: 'msg-chip', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [300, 60], M: [600, 120], L: [900, 180] },
  states: STATES,
  parts: ['border', 'fill', 'text'],
  swap: { text: { type: 'text', tier: 'glance', limits: lim(22, 10, 5) }, kind: { type: 'enum', of: ['msg', 'call', 'res', 'txt'] } },
  roles: ['ink', 'msgS', 'msgB', 'callS', 'callB', 'resS', 'resB', 'txtS', 'txtB'],
  summary: 'A message on a line: a small rounded chip coloured by who wrote it (a person yellow, a tool call red, a result green, plain text grey); its text can type in while it waits.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  draw(ctx, S, P) {
    const k = P.w / 300, g = [...P.text], n = Math.round(Math.max(0, Math.min(1, S.shown)) * g.length);
    ctx.save(); ctx.scale(k, k);
    drawMsgChip(ctx, P.colors, P.lang, P.text, P.kind, 150, P.h / k / 2, { alpha: S.alpha, shown: g.slice(0, n).join(''), scale: S.scale });
    ctx.restore();
  },
};
