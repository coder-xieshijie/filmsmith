// msg-hop — a message travels one connector: a chip appears at one part's centre, slides out from under it (fading in as
// it leaves the part, so its text is never seen half cut), rests whole and still in the middle of the gap between the two
// parts, then slides on and under the next part, fading as it goes in. The first round walks slowly (0.6–1 s a hop,
// hold ≈ 0.3 s); repeated rounds take about 0.5 s (hold ≈ 0.2 s). The chip's colour says who wrote it (msg-chip).
// From assets/kits/blueprint-zoom/starter/components/message.js (F.bp.travel with under and hold; gapMid,
// coverOf; the pace rules in its header).
import { E, tw, drawNode, drawLine, drawMsgChip, tripAt } from '../../look/sketch-paper/kit.js';

const SEC = 0.5;
const DEFAULT = {
  en: { a: { title: 'Agent Loop', c: 'core', seed: 47 }, b: { title: 'Model call', c: 'core', seed: 43 }, text: 'Fix this bug for me', kind: 'msg', hold: 0.3 },
  zh: { a: { title: 'Agent Loop', c: 'core', seed: 47 }, b: { title: '模型调用', c: 'core', seed: 43 }, text: '帮我修这个 bug', kind: 'msg', hold: 0.3 },
};
const BOX = { a: [300, 468, 382, 144], b: [1238, 468, 382, 144] };
const path = () => [['M', BOX.a[0] + BOX.a[2] / 2, 540], ['L', BOX.b[0] + BOX.b[2] / 2, 540]];
export default {
  id: 'msg-hop', kind: 'motion',
  tier: 'T0', family: 'line-path', beats: 2,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'line', 'subBack', 'subInk', 'coreS', 'coreH', 'coreB', 'msgS', 'msgB', 'callS', 'callB', 'resS', 'resB', 'txtS', 'txtB'],
  from: 'the message inside the part that sends it (hidden under it)',
  to: 'the message inside the part that receives it (hidden under it)',
  interpolates: ['position along the connector from centre to centre (power2.out to the gap, still for the hold, power2.in on)', 'opacity: 0 while 35 % or more of the chip is under a part'],
  summary: 'A message travels one connector: it slides out from under one part, rests whole in the gap, slides under the next; its colour says who wrote it.',
  theory: 'The rest in the gap gives the eye one fixation on a whole, still label (reading needs about 0.2–0.3 s), and hiding the chip under the parts makes the parts read as solid places the message enters.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  prepare(P) { return null; },
  rest(side, P, X) { return this.at(side === 'from' ? 0 : 1, P, X); },
  at(p) { return { p, t: p * 2 * SEC }; },
  paint(ctx, S, P) {
    const C = P.colors, L = P.lang;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    drawLine(ctx, [['M', BOX.a[0] + BOX.a[2] + 2, 540], ['L', BOX.b[0] - 2, 540]], C.coreS, { arrows: 'both' });
    const tr = { text: P.text, kind: P.kind, path: path(), t0: 0, t1: 2 * SEC, hold: P.hold, under: [BOX.a, BOX.b], show: false };
    const q = tripAt(ctx, L, tr, S.t);
    if (q.alpha > 0) drawMsgChip(ctx, C, L, P.text, P.kind, q.x, q.y, { alpha: q.alpha });
    drawNode(ctx, C, L, { ...P.a, box: BOX.a });
    drawNode(ctx, C, L, { ...P.b, box: BOX.b });
  },
  track(S, P) {
    const c = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
    if (!c) return [[960, 540]];
    const q = tripAt(c, P.lang, { text: P.text, kind: P.kind, path: path(), t0: 0, t1: 2 * SEC, hold: P.hold, under: [BOX.a, BOX.b], show: false }, S.t);
    return [[q.x ?? 491, q.y ?? 540]];
  },
  blur: () => false,
};
