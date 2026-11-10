// session-queue — who is waiting on whom: four session windows pop up, each logging its work; one by one a lamp lights in
// each (the agent is waiting) and a line asks for a reply; a rope flies from the lit lamp to the vermilion stamp, pulls
// straight and drags the stamp over, which presses the lamp solid (a person replied), types the reply after the prompt
// sign and parks beside the lamp row; the calls come faster; a figure names how many sessions the person kept going, a
// brace spans the windows; at the end all four windows pull at once and the stamp stops in the middle, held by four ropes.
// From the terminal-ledger kit as the approved film uses it (the source film
// segments/abc.js 33.0–53.9 s): F.sessions (windows, logs, lamps, prompts), F.rope, the stamp's pulls and presses,
// F.hand.brace, the dashed guess struck out. Seconds from the scene's start, as the narration places them.
import { W, drawChapter, drawCounter, drawTerm, drawLog, drawLamp, drawRope, drawStamp, drawMark, drawTag, chevron, say, tw, E, lerp, mix, clamp, rrect, rgba } from '../../look/paper-ledger/kit.js';

const LOG = {
  en: [['$ read 3 files', '✓ parser updated', '✓ this step is done', '✓ unit tests added', '✓ API changed', '✓ tests pass'], ['$ read the API docs', '✓ migration written', '✓ dry run passes', '✓ logging added', '✓ config changed'],
    ['$ find the call sites', '✓ 12 references changed', '✓ done', '✓ build ran', '✓ types fixed'], ['$ read the design', '✓ styles changed', '✓ screenshot matches', '✓ spacing tuned', '✓ icon swapped']],
  zh: [['$ 读取 3 个文件', '✓ 修改解析模块', '✓ 这一步好了', '✓ 补上单测', '✓ 改完接口', '✓ 测试通过'], ['$ 查看接口文档', '✓ 写迁移脚本', '✓ 试跑通过', '✓ 补上日志', '✓ 改完配置'],
    ['$ 搜索调用点', '✓ 改了 12 处引用', '✓ 改好了', '✓ 跑了构建', '✓ 修了类型'], ['$ 读设计稿', '✓ 改样式', '✓ 截图对好了', '✓ 调了间距', '✓ 换了图标']],
};
const CALLS = [[0, 6.35], [1, 7.55], [3, 8.75], [2, 9.86], [0, 11.15], [1, 12.55], [2, 17.15], [0, 17.9, 1], [3, 18.5, 1], [1, 19.0, 1], [2, 19.45, 1]];
const DEFAULT = {
  en: { chapter: 'Who waits for whom', titles: ['Session A', 'Session B', 'Session C', 'Session D'], logs: LOG.en, wait: '? Waiting for your reply', words: ['Go on', 'OK', 'Go on', 'As suggested', 'Go on', 'OK', 'Go on', 'Go on', 'OK', 'Go on', 'Go on'],
    calls: CALLS, ghost: 'Sign-off after the big job', label: 'Sessions I messaged in the last half hour', figure: 'Median: 4', stamp: 'Me', all: true, tag: 'Sessions and logs are illustrative',
    counter: { value: '408', unit: 'replies were just "go on"', approx: true } },
  zh: { chapter: '谁在等谁', titles: ['会话 A', '会话 B', '会话 C', '会话 D'], logs: LOG.zh, wait: '? 等你回一句', words: ['继续', '好的', '继续', '按推荐来', '继续', '好的', '继续', '继续', '好的', '继续', '继续'],
    calls: CALLS, ghost: '大活做完后的验收', label: '过去半小时里，我发过消息的会话', figure: '中位数 4 个', stamp: '我', all: true, tag: '会话与终端内容为示意',
    counter: { value: '408', unit: '个只回“继续 / 好的”', approx: true } },
};
// the approved film's times (seconds from 33.0 s in the film) and layout
const AT = { show: 0.15, tag: 0.7, logs: [0.5, 0.85], wait: 1.15, ghost: [3.6, 4.73, 5.6], label: 10.84, brace: 14.01, figure: 14.11, all: 19.95, end: 20.9 };
const GEO = { boxes: [[470, 212, 510, 290], [1006, 212, 510, 290], [470, 536, 510, 290], [1006, 536, 510, 290]], lamps: 9, home: [250, 752], from: [250, 420], center: [975, 560], tagAt: [470, 842], labelAt: [470, 132], figureAt: [916, 112], ghostAt: [60, 200], braceY: 202 };
const SQ = ['sA', 'sB', 'sC', 'sD'];
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

export const queuePlan = (s) => {
  const A = { ...AT, ...(s.at || {}) }, G = { ...GEO, ...(s.geo || {}) }, B = G.boxes, n = B.length;
  const lampXY = (i, k) => [B[i][0] + 3 + 26 + k * 30 + 9, B[i][1] + 3 + B[i][3] - 98 + 9];
  const logs = B.map(() => []), li = B.map(() => 0), lamps = B.map(() => [...Array(G.lamps)].map(() => ({ on: Infinity, me: Infinity }))), prompts = B.map(() => []), lampK = B.map(() => 0);
  const nextLog = (i, t, fast) => { const L = s.logs[i % s.logs.length]; logs[i].push({ text: L[li[i] % L.length], t, cls: 'ok', fast }); li[i]++; };
  const waitLine = (i, t, fast) => logs[i].push({ text: s.wait, t, cls: '', fast });
  B.forEach((_, i) => { nextLog(i, A.logs[0] + i * 0.1); nextLog(i, A.logs[1] + i * 0.1); });
  const flies = B.map((_, i) => { const t = A.wait + i * 0.14; lamps[i][0].on = t + 0.46; waitLine(i, t + 0.5); return { t, to: lampXY(i, 0) }; });
  // the stamp: drops in at home; each call ropes it over to the lamp, presses, parks beside the row (slow) or stays (fast)
  const moves = [], presses = [], ropes = [];
  let at = G.home;
  const calls = (s.calls || []).map(([i, press, fast], c) => ({ i: i % n, press, fast: !!fast, word: s.words?.[c % (s.words.length || 1)] || '' }));
  calls.forEach((cl, c) => {
    const { i, press, fast } = cl, k = Math.min(lampK[i], G.lamps - 1), [lx, ly] = lampXY(i, k), d = fast ? 0.18 : 0.3, tr = press - (fast ? 0.62 : 0.9);
    ropes.push({ a: [lx, ly], b: at, t: tr, d, sag: fast ? 36 : 60, tight: tr + d + 0.04, drop: press - 0.32, gone: press - 0.1 });
    moves.push({ t: press - 0.4, d: 0.28, to: [lx, ly], s: 1.12 }); presses.push(press); at = [lx, ly];
    if (!fast) { const p = [B[i][0] + 356, B[i][1] + B[i][3] - 89]; moves.push({ t: press + 0.2, d: 0.3, to: p, s: 1 }); at = p; }
    lamps[i][k].me = press; prompts[i].push({ word: cl.word, on: press + 0.08, off: press + (fast ? 0.38 : 0.8) });
    nextLog(i, press + (fast ? 0.3 : 0.55), fast); lampK[i] = k + 1;
    const later = calls.slice(c + 1).find((x) => x.i === i);
    if (later && lampK[i] < G.lamps) { const tl = later.fast ? later.press - 0.75 : press + 1.75; lamps[i][lampK[i]].on = Math.min(tl, later.press - 0.95); waitLine(i, lamps[i][lampK[i]].on, later.fast); }
  });
  let all = null;
  if (s.all) {
    moves.push({ t: A.all - 0.33, d: 0.3, to: G.center, s: 1 });
    all = B.map((_, i) => { const k = G.lamps - 1; if (lamps[i][k].me === Infinity) lamps[i][k].on = Math.min(lamps[i][k].on, A.all - 0.12); return { a: lampXY(i, k), b: G.center, t: A.all - 0.05, d: 0.22, sag: 30, tight: A.all + 0.2 }; });
  }
  moves.sort((a, b) => a.t - b.t);
  return { A, G, lampXY, logs, lamps, prompts, flies, moves, presses, ropes, all, calls };
};
const stampAt = (D, t) => {
  let [x, y] = D.G.home, s = 1;
  for (const m of D.moves) { if (t < m.t) break; const u = tw(t, m.t, m.d, E.p2io); x = lerp(x, m.to[0], u); y = lerp(y, m.to[1], u); s = lerp(s, m.s, u); }
  for (const p of D.presses) if (t >= p - 0.06 && t < p + 0.12) s *= t < p ? lerp(1, 0.88 / 1.12, tw(t, p - 0.06, 0.06, E.p2i)) : lerp(0.88 / 1.12, 1, tw(t, p, 0.12, E.p2o));
  const a = tw(t, D.A.show + 0.05, 0.22, E.p3i);
  return { x, y, s: s * lerp(1.6, 1, a), a, hollow: 0 };
};

export default {
  id: 'session-queue', kind: 'scene',
  fits: ['problem', 'demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 16, max: 48 },
  needs: { motions: [], props: ['paper-term', 'seal-stamp', 'paper-frame'], roles: ['ground', 'panel', 'paper', 'ink', 'dim', 'line', 'accent', 'accentDeep', 'accentRing', 'ok', 'lamp', 'lampS', 'wait', 'waitS', 'sA', 'sB', 'sC', 'sD', 'dotR', 'dotY', 'dotG', 'shadow', 'chapInk', 'chapRule'], type: ['text', 'mono'] },
  slots: {
    chapter: { type: 'text', tier: 'glance', limits: lim(28, 12, 5) },
    titles: { type: 'list', count: [4, 4], of: { type: 'text', tier: 'glance', limits: lim(12, 6, 2) } },
    logs: { type: 'list', count: [1, 4], of: { type: 'list', count: [1, 8], of: { type: 'text', tier: 'glance', limits: lim(26, 12, 5) } } },
    wait: { type: 'text', tier: 'glance', limits: lim(26, 10, 5) },
    words: { type: 'list', count: [1, 16], of: { type: 'text', tier: 'word', limits: lim(14, 5, 2) } },
    calls: { type: 'list', count: [0, 16] },
    ghost: { type: 'text', tier: 'glance', optional: true, limits: lim(28, 10, 6) },
    label: { type: 'text', tier: 'glance', optional: true, limits: lim(44, 16, 8) },
    figure: { type: 'text', tier: 'primary', optional: true, limits: lim(12, 6, 2) },
    stamp: { type: 'text', tier: 'word', limits: lim(3, 1, 1) },
    all: { type: 'boolean' },
    tag: { type: 'text', tier: 'glance', limits: lim(40, 18, 7) },
    counter: { type: 'object', optional: true },
  },
  roles: ['ground', 'panel', 'paper', 'ink', 'dim', 'line', 'accent', 'accentDeep', 'accentRing', 'ok', 'lamp', 'lampS', 'wait', 'waitS', 'sA', 'sB', 'sC', 'sD', 'dotR', 'dotY', 'dotG', 'shadow', 'chapInk', 'chapRule'],
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, A = { ...AT, ...(s.at || {}) }, last = Math.max(0, ...(s.calls || []).map((c) => c[1])), end = Math.max(A.end, (s.all ? A.all : last) + 0.95);
    return { beats: clamp(Math.ceil(end / B - 1e-9), this.beats.min, this.beats.max), reads: [s.label, s.figure, s.ghost].filter(Boolean).map((x) => ({ text: x, lang: ctx.lang, tier: 'glance' })),
      cues: [{ beat: (A.show + 0.02) / B, kind: 'tick' }, ...(s.calls || []).map((c) => ({ beat: c[1] / B, kind: 'hit' })), ...(s.figure ? [{ beat: A.figure / B, kind: 'accent' }] : []), ...(s.all ? [{ beat: (A.all + 0.22) / B, kind: 'land' }] : [])],
      motion: null, settled: (s.all ? A.all + 0.5 : last + 0.5) / B, peakAt: (s.all ? A.all + 0.2 : A.figure) / B, pause: 0, lead: 0 };
  },
  validate(s) { return (s.calls || []).every((c) => c[0] >= 0 && c[0] < 4) ? [] : ['calls: [window 0–3, press time, fast]']; },
  prepare(s, c) { return { B: 60 / c.bpm, D: queuePlan(s) }; },
  paint(ctx, u, s, c, X) {
    const C = s.colors, L = c.lang, D = X.D, A = D.A, G = D.G, t = u * X.B;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, 1080);
    drawChapter(ctx, C, L, { text: s.chapter, at: -1 }, t);
    if (s.counter) drawCounter(ctx, C, L, { on: -1, segs: [{ t0: -1, t1: 1e9, value: s.counter.value }], units: [{ text: s.counter.unit, on: -1 }], approx: s.counter.approx ? -1 : null }, t);
    // the windows
    G.boxes.forEach((b, i) => {
      const k = tw(t, A.show + i * 0.08, 0.18, E.back(1.6)), a = clamp(tw(t, A.show + i * 0.08, 0.18, E.none) * 2);
      if (a <= 0) return;
      ctx.save(); ctx.translate(b[0] + b[2] / 2, b[1] + b[3] / 2); ctx.scale(lerp(0.75, 1, k), lerp(0.75, 1, k)); ctx.translate(-b[0] - b[2] / 2, -b[1] - b[3] / 2);
      drawTerm(ctx, C, L, b, { title: s.titles?.[i], sq: C[SQ[i % 4]], alpha: a }, (w) => {
        drawLog(w, C, L, D.logs[i], [22, 52, b[2] - 44, 108], t, 3);
        D.lamps[i].forEach((lp, kk) => {
          const on = tw(t, lp.on, 0.12, E.p2o), me = tw(t, lp.me, 0.12, E.p2o), x = 26 + kk * 30 + 9, y = b[3] - 98 + 9;
          w.beginPath(); w.arc(x, y, 8, 0, Math.PI * 2); w.fillStyle = mix(mix(C.panel, C.lamp, on), C.accent, me); w.fill(); w.lineWidth = 2; w.strokeStyle = mix(C.lampS, C.accentDeep, me); w.stroke();
        });
        chevron(w, 26, b[3] - 54 + 17, 13, C.ink);
        for (const p of D.prompts[i]) { const pa = tw(t, p.on, 0.1, E.p2o) * (1 - tw(t, p.off, 0.1, E.p2i)); if (pa > 0) say(w, p.word, 52, b[3] - 54, L, 28, C.accent, { lh: 34, alpha: pa }); }
      });
      ctx.restore();
    });
    drawTag(ctx, C, L, s.tag, ...G.tagAt, tw(t, A.tag, 0.3, E.p1o));
    // a waiting dot flies from the left column into each window's first lamp
    for (const f of D.flies) { if (t < f.t || t > f.t + 0.5) continue; const k = tw(t, f.t, 0.5, E.p3io); ctx.beginPath(); ctx.arc(lerp(G.from[0], f.to[0], k), lerp(G.from[1], f.to[1], k), 7, 0, Math.PI * 2); ctx.fillStyle = C.wait; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = C.waitS; ctx.stroke(); }
    // the guess, struck out
    if (s.ghost) {
      const [g0, gx, gh] = A.ghost, ga = tw(t, g0, 0.22, E.p2o) * (1 - tw(t, gh, 0.18, E.p1i));
      if (ga > 0) {
        const [x, y] = G.ghostAt, px = 28;
        ctx.save(); ctx.globalAlpha *= ga; const tw0 = say(ctx, s.ghost, x + 18, y + 8, L, px, C.dim, { lh: 40, alpha: 0 });
        rrect(ctx, x, y, tw0 + 36, 56, 8); ctx.setLineDash([9, 7]); ctx.strokeStyle = C.line; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        say(ctx, s.ghost, x + 18, y + 8, L, px, C.dim, { lh: 40, alpha: ga, blur: (1 - ga) * 6 });
        const sk = tw(t, gx, 0.25, E.p2o); if (sk > 0) { ctx.save(); ctx.globalAlpha *= ga; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 8, y + 28); ctx.lineTo(x - 8 + (tw0 + 52) * sk, y + 28); ctx.stroke(); ctx.restore(); }
      }
    }
    // the label, the figure and the brace over the windows
    if (s.label) { const a = tw(t, A.label, 0.22, E.p2o); if (a > 0) say(ctx, s.label, ...G.labelAt, L, 28, C.dim, { lh: 40, alpha: a, blur: (1 - a) * 6 }); }
    if (s.figure) { const a = tw(t, A.figure, 0.22, E.p2o); if (a > 0) say(ctx, s.figure, ...G.figureAt, L, 46, C.ink, { lh: 56, alpha: a, blur: (1 - a) * 6 }); drawMark(ctx, C, { kind: 'brace', y: G.braceY, x0: G.boxes[0][0] + 4, x1: G.boxes[1][0] + G.boxes[1][2] - 4, side: 'top', at: A.brace }, t); }
    // ropes, then the stamp on top
    for (const r of D.ropes) if (t < r.gone) drawRope(ctx, C, r.a, r.b, t, r.t, { d: r.d, sag: r.sag, tight: r.tight, drop: r.drop });
    if (D.all) for (const r of D.all) drawRope(ctx, C, r.a, r.b, t, r.t, { d: r.d, sag: r.sag, tight: r.tight });
    const sp = stampAt(D, t); drawStamp(ctx, C, L, sp, s.stamp);
  },
  track(u, s, c, X) { const sp = stampAt(X.D, u * X.B); return [[sp.x, sp.y]]; },
  blur: () => false,
};
