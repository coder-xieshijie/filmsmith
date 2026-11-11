// human-loop — the whole system as one line: a person → the steps → a person, boxes on one 3 px rule with arrows
// between them; the person's nodes are accent blocks, the steps paper boxes; a bracket over the steps with its label,
// a loop drawn back under them with an arrowhead, a rule, one statement and a list. An ink frame walks the nodes while
// the page holds. From the plakat template's `flow` (assets/templates/plakat/scenes.js). Entered by plakat-reblock,
// the first node lands from the previous page's band (block-carry) instead of popping in.
import { clock, E, F, SZ, COL, SPAN, zh, masked, riseOff, sinkOff, at, rect, frameRect, labelFont, labelText, fitSize, plain, width, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, beatUp, rd, walkMoves, walkFrame, pad2, wrapLines, drawPath, rollUp, lerp, graphemes , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { title: 'From draft to applied', nodes: [{ name: 'YOU', note: 'ask', human: true }, { name: 'draft', note: 'agent' }, { name: 'measure', note: 'locks' }, { name: 'replay', note: 'shadow' }, { name: 'YOU', note: 'sign', human: true }],
    bracket: 'the agent and the probe', loop: 'fails: back to draft', statement: 'You start it, you sign it.', list: 'draft · measure · replay · sign · apply' },
  zh: { title: '从起草到执行', nodes: [{ name: '你', note: '提出', human: true }, { name: '起草', note: '代理' }, { name: '测量', note: '锁' }, { name: '回放', note: '影子' }, { name: '你', note: '签字', human: true }],
    bracket: '代理和探针', loop: '失败：退回起草', statement: '你发起，你签字。', list: '起草 · 测量 · 回放 · 签字 · 执行' },
};
const tplan = (s, bpm, L) => {
  const n = s.nodes.length, nodeT = s.nodes.map((_, i) => (i === 0 && s.enterBy === 'reblock' ? 0.5 : 0.35 + 0.25 * i)), nb = nodeT[n - 1] + 0.4;
  const P = { nodeT, bracket: nb, brL: nb + 0.2, loop: nb + 0.5, loopL: nb + 0.85, loopH: nb + 1.25, r2: nb + 1.1, st: nb + 1.2, list: nb + 1.6 };
  P.reads = [[0, [s.title]], ...s.nodes.flatMap((nd, i) => (nd.human ? [[nodeT[i], [nd.name]], [nodeT[i], [nd.note], G]] : [[nodeT[i], [nd.name + ' ' + nd.note], G]])), [P.brL, [s.bracket], G], [P.loopL, [s.loop], G], [P.st, [s.statement]], [P.list, [s.list], G]];
  P.settled = P.list + 0.35;
  P.D = Math.max(needU(P.reads, P.settled, 0.125, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  P.moves = walkMoves(P.settled, P.D - 0.125);
  return P;
};
export default {
  id: 'human-loop', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 8, max: 18 },
  needs: { motions: ['walk-frame', 'block-carry'], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 26 }, zh: { chars: 10 } } },
    nodes: { type: 'list', count: [3, 6], of: { name: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 11 }, zh: { chars: 4 } } }, note: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 13 }, zh: { chars: 5 } } }, human: { type: 'flag', default: false } } },
    bracket: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 48 }, zh: { chars: 16 } } },
    loop: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 44 }, zh: { chars: 14 } } },
    statement: { type: 'text', tier: 'primary', limits: { en: { words: 6, chars: 36 }, zh: { chars: 14 } } },
    list: { type: 'text', tier: 'glance', limits: { en: { words: 12, chars: 60 }, zh: { chars: 24 } } },
  },
  roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null, enterBy: null, from: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: Math.round(P.D * 2), reads: [s.title, s.statement].map((text) => ({ text, lang: ctx.lang })),
      cues: [{ beat: 0, kind: 'land' }, ...P.nodeT.map((u, i) => ({ beat: u * 2, kind: s.nodes[i].human ? 'stamp' : 'tick' })), { beat: P.bracket * 2, kind: 'turn' }, { beat: P.st * 2, kind: 'land' }],
      motion: 'the line draws; nodes pop on it; bracket, loop, rule, statement, list', settled: P.settled * 2 };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, S = SZ(L), lf = labelFont(L), mf = F('mono', L, S.label, 500);
    const n = s.nodes.length, span = Math.min(4, Math.max(2, Math.floor(12 / n))), nw = span * 146 - 62, x = (i) => COL(1 + span * i);
    ground(ctx, C);
    ctx.save(); rollUp(ctx, ck, P.D);
    const tz = fitSize(ctx, plain(s.title), (z) => F('display', L, z), 1732, 120, 100);
    masked(ctx, s.title, 92, 150, F('display', L, tz), C, { off: riseOff(tw(0, 0.6)), lh: 1 });
    rect(ctx, 96, 559, (x(n - 1) + nw - 96) * ck.sec(AT(0.35), 1.4 * ck.k, E.p1InOut), 3, C.ink);
    const boxes = [];
    s.nodes.forEach((nd, i) => {
      boxes.push([x(i) - 12, 478, nw + 24, 164]);
      let p = ck.sec(AT(P.nodeT[i]), 0.25, nd.human ? E.back(2) : E.p3Out), bx = x(i), by = 490, bw = nw, bh = 140;
      if (i === 0 && s.enterBy === 'reblock' && s.from) { const m = ck.sec(AT(-0.25), 0.5 * ck.k, E.expoInOut); bx = lerp(s.from[0], bx, m); by = lerp(s.from[1], by, m); bw = lerp(s.from[2], bw, m); bh = lerp(s.from[3], bh, m); p = 1; }
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = Math.min(1, p); ctx.translate(0, 18 * (1 - Math.min(1, p)));
      if (nd.human) { rect(ctx, bx, by, bw, bh, C.accent); const tp = i === 0 && s.enterBy === 'reblock' ? tw(P.nodeT[0], 0.25, E.p2Out) : 1;
        at(ctx, nd.name, bx + 20, by + 34, { ...F('display', L, S.body, 800), spacing: zh(L) ? 0 : -0.04 * 34 }, C.onAccent, { alpha: tp }); at(ctx, nd.note, bx + 22, by + 92, F('mono', L, S.label, 600), C.onAccent, { alpha: tp }); }
      else { rect(ctx, bx, by, bw, bh, C.paper); frameRect(ctx, bx, by, bw, bh, 3, C.ink); at(ctx, labelText(pad2(i), L), bx + 18, by + 20, lf, C.dim); at(ctx, nd.name, bx + 18, by + 52, F('mono', L, S.body, 600), C.ink); at(ctx, nd.note, bx + 18, by + 96, mf, C.dim); }
      ctx.restore();
      if (i < n - 1) { const ap = ck.sec(AT(0.5) + 0.25 * i * ck.k, 0.15, E.p2Out), ax = x(i) + nw + (span * 146 - nw - 26) / 2 - 8 * (1 - ap); if (ap > 0) { ctx.save(); ctx.globalAlpha = ap; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(ax + 4, 550); ctx.lineTo(ax + 22, 561); ctx.lineTo(ax + 4, 572); ctx.closePath(); ctx.fill(); ctx.restore(); } }
    });
    const inner = s.nodes.map((_, i) => i).filter((i) => !s.nodes[i].human), a = inner.length ? inner[0] : 0, b = inner.length ? inner[inner.length - 1] : n - 1;
    const bx0 = x(a), bx1 = x(b) + nw, lx0 = x(a) + nw / 2, lx1 = x(b) + nw / 2;
    drawPath(ctx, [[bx0, 470], [bx0, 446], [bx1, 446], [bx1, 470]], tw(P.bracket, 0.5, E.p2InOut), C.ink, 2);
    drawPath(ctx, [[lx1, 630], [lx1, 700], [lx0, 700], [lx0, 636]], tw(P.loop, 0.8, E.p2InOut), C.ink, 3);
    if (ck.t >= AT(P.loopH)) drawPath(ctx, [[lx0 - 12, 650], [lx0, 632], [lx0 + 12, 650]], 1, C.ink, 3);
    const bl = tw(P.brL, 0.3, E.p2Out); at(ctx, s.bracket, bx0, 400, mf, C.ink, { alpha: bl, dy: 8 * (1 - bl) });
    const ll = tw(P.loopL, 0.3, E.p2Out); at(ctx, s.loop, lx0 + 57, 714, mf, C.ink, { alpha: ll, dy: 8 * (1 - ll) });
    rect(ctx, 96, 790, 1728 * tw(P.r2, 0.6), 2, C.ink);
    masked(ctx, s.statement, 96, 818, { ...F('display', L, S.body, 750), spacing: zh(L) ? 0 : -0.03 * 34 }, C, { off: riseOff(tw(P.st, 0.5)), lh: 1, rich: false });
    const lp = tw(P.list, 0.35, E.p2Out); at(ctx, s.list, 96 - 16 * (1 - lp), 886, mf, C.ink, { alpha: lp });
    walkFrame(ctx, ck, P.moves, boxes, C);
    ctx.restore();
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L);
  },
  track() { return [[960, 560]]; },
};
