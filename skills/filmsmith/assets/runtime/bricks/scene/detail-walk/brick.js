// detail-walk — one part of the overview enlarged and one task walked through it: the other layers dim and are pushed
// away (scale 1.55 about the diagram's centre) while the focus layer's frame grows into the detail frame and its parts
// move to the detail layout (the loop's pill becomes a circle, the side part rises above it); clean connectors draw
// between the parts; a terminal drops in above and a line types after the prompt sign; then messages travel the
// connectors as coloured chips (a person's message yellow, text the model wrote red and typed out where it waits, a
// result green, plain text grey), a round label and an orbit mark each turn of the loop, a window below shows the file
// change and the test status; a round with no tool call greys the loop and dims its lines, the stop is stated, the answer
// returns to the terminal; optionally the diagram then zooms back to the overview with one line to remember and a check
// on the layer. Steps are data (the default is the approved film's), timed in seconds from the scene's start.
// From the blueprint-zoom kit as the approved film uses it (the source film segments/bz.js
// 11.97–43.4 s; the kit's zoom.js, loop.js, message.js, line.js, term.js, status.js).
import { W, E, tw, lerp, clamp, mix, rgba, say, widthOf, sz, drawChapter, drawTag, drawTerm, drawTyped, tick, chevron, drawBand, drawNode, drawLoop, drawOrbit, drawLine, drawMsgChip, tripAt, pulseK, loopBox, overviewLayout, sample, pointAt, lengths, PAL } from '../../look/sketch-paper/kit.js';
import LO from '../layer-overview/brick.js';

const P = { term: [['M', 800, 236], ['L', 800, 347]], up: [['M', 925, 472], ['L', 1304, 472], ['Q', 1319, 472, 1319, 457], ['L', 1319, 145]], down: [['M', 675, 472], ['L', 296, 472], ['Q', 281, 472, 281, 487], ['L', 281, 790]] };
const LN = { term: [['M', 800, 247], ['L', 800, 345]], tool: [['M', 673, 472], ['L', 475, 472]], call: [['M', 927, 472], ['L', 1125, 472]], model: [['M', 1319, 397], ['L', 1319, 195]], repo: [['M', 281, 547], ['L', 281, 713]] };
const DT = { band: [50, 270, 1500, 430], cells: [[90, 400, 382, 144], [675, 347, 250, 250], [1128, 400, 382, 144]], side: [1189, 96, 260, 96], term: [575, 96, 450, 150], repo: [81, 716, 400, 148] };
// the approved film's times, seconds from 11.967 s in the film
const AT = { focus: 0.05, zoom: 0.686, zoomD: 1.3, pulses: [[0, 1.786], [1, 2.496], [2, 3.256]], term: 4.218, termLine: 4.518, type: [4.688, 6.238], caret: 6.438, tag: 4.468, repo: 13.869, repoLine: 14.119, edit: 15.379,
  rounds: [6.998, 18.839, 21.889], stop: 23.859, back: 26.073, backD: 1.3, three: 27.713, take: 28.783, check: 30.383, end: 26.0 };
const STEPS = (w) => [
  { text: w[0], kind: 'msg', path: 'term', t0: 6.398, t1: 6.968, ease: 'p1io' },
  { text: w[0], kind: 'msg', path: 'up', t0: 7.078, t1: 8.348, ease: 'none', pulse: 'side' },
  { text: w[1], kind: 'call', path: 'up', emit: [11.247, 12.547, 13.483], out: 0.35, typeTo: 12.247 },
  { text: w[1], kind: 'call', path: 'down', t0: 13.783, t1: 14.969, ease: 'none', pulse: 0, pulseAt: 14.419 },
  { text: w[2], kind: 'res', path: 'down', t0: 16.329, t1: 17.809, a: 1, b: 0, ease: 'none' },
  { text: w[2], kind: 'res', path: 'up', t0: 18.989, t1: 19.539, ease: 'none' },
  { text: w[3], kind: 'call', path: 'up', emit: [19.639, 19.939, 20.389], out: 0.2 },
  { text: w[3], kind: 'call', path: 'down', t0: 20.439, t1: 20.939, ease: 'none' },
  { text: w[4], kind: 'res', path: 'down', t0: 21.389, t1: 21.839, a: 1, b: 0, ease: 'none' },
  { text: w[4], kind: 'res', path: 'up', t0: 22.039, t1: 22.489, ease: 'none' },
  { text: w[5], kind: 'txt', path: 'up', emit: [22.589, 22.839, 23.259], out: 0.2 },
  { text: w[5], kind: 'txt', path: 'term', t0: 23.509, t1: 24.009, a: 1, b: 0, ease: 'p1io' },
];
const DEFAULT = {
  en: { overview: 'The Agent Harness', chapter: 'Core layer · zoomed in', term: { title: 'Terminal', line: 'Fix this bug for me', done: '✓ Fixed' },
    steps: STEPS(['Fix this bug for me', 'edit(app.ts, …)', 'Changed app.ts', 'bash(npm test)', 'Tests pass', 'Fixed']), rounds: ['Round 1', 'Round 2', 'Round 3'],
    repo: { title: 'Your repo', file: 'app.ts', code: ['if (n ', '=', '===', ' 0)'], changed: 'Changed', tests: 'tests/', status: [['Not run', 'dim'], ['Running…', 'msgS', 20.939], ['✓ Passed', 'ok', 21.339]] },
    stop: ['No tool call this round', 'stop'], note: 'The default stop rule, Pi as the example (agent-loop.ts)', tag: 'Terminal, repo and message text are illustrative', mapTag: "Layers and limits: the author's view", back: true, take: 'The core three: drop one and it is not an agent', judge: "the author's view", check: '✓ Covered' },
  zh: { overview: 'Agent Harness 总图', chapter: '核心层 · 放大', term: { title: '终端', line: '帮我修这个 bug', done: '✓ 修好了' },
    steps: STEPS(['帮我修这个 bug', 'edit(app.ts, …)', '已改 app.ts', 'bash(npm test)', '测试通过', '修好了']), rounds: ['第 1 轮', '第 2 轮', '第 3 轮'],
    repo: { title: '你的仓库', file: 'app.ts', code: ['if (n ', '=', '===', ' 0)'], changed: '已改', tests: 'tests/', status: [['未运行', 'dim'], ['运行中…', 'msgS', 20.939], ['✓ 通过', 'ok', 21.339]] },
    stop: ['这一轮没有工具调用', '停'], note: '默认停止条件，以 Pi 为例（agent-loop.ts）', tag: '终端、仓库与消息上的文字都是示意', mapTag: '分层与约束：研究者判断', back: true, take: '核心三件：少一件，就不成 Agent', judge: '研究者判断', check: '✓ 讲过' },
};
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });
const EASE = { none: E.none, p1io: E.p1io, p2io: E.p2io, p1i: E.p1i, p2o: E.p2o };

export const walkPlan = (s, ctx = {}) => {
  const base = LO.defaults({ lang: ctx.lang }), O = overviewLayout({ rows: s.rows || base.rows, focus: s.focus ?? base.focus, side: s.side || base.side }), A = { ...AT, ...(s.at || {}) }, D = { ...DT, ...(s.detail || {}) };
  const upPts = sample(P.up, 24), upLs = lengths(upPts); let wait = 1; for (let i = 0; i <= 600; i++) if (pointAt(upPts, i / 600, upLs)[1] <= 231) { wait = i / 600; break; }
  const trips = [];
  for (const st of s.steps || []) {
    const path = P[st.path] || st.path;
    if (st.emit) {
      const [at, go, arrive] = st.emit, out = st.out ?? 0.3, n = [...st.text].length, dt = st.typeTo ? Math.max(0.04, (st.typeTo - at) / n) : null;
      trips.push({ text: st.text, kind: st.kind, path, t0: at, t1: at + out, a: 1, b: wait, ease: E.p2o, type: dt ? [at + 0.05, dt] : null, until: go });
      trips.push({ text: st.text, kind: st.kind, path, t0: go, t1: arrive, a: wait, b: 0, ease: E.p1i, show: 'keep', hide: true });
    } else trips.push({ text: st.text, kind: st.kind, path, t0: st.t0, t1: st.t1, a: st.a ?? 0, b: st.b ?? 1, ease: EASE[st.ease] || E.p1io, hide: true });
  }
  const sidePulse = (s.steps || []).filter((x) => x.pulse === 'side').map((x) => x.t1 + 0.02), cellPulse = (s.steps || []).filter((x) => typeof x.pulse === 'number').map((x) => [x.pulse, x.pulseAt ?? x.t0]);
  return { O, A, D, trips, sidePulse, cellPulse };
};
const sayMark = (ctx, C, L, s, x, y, px, color, o = {}) => {
  const m = /^✓\s*/.exec(s), body = m ? s.slice(m[0].length) : s, dx = m ? px * 0.95 : 0;
  if (m && (o.alpha ?? 1) > 0) tick(ctx, x + 2, y + (o.lh || 40) / 2 - px * 0.36, px * 0.6, color, o.alpha ?? 1, 2.6);
  return dx + say(ctx, body, x + dx, y, L, px, color, o);
};

export default {
  id: 'detail-walk', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 16, max: 80 },
  needs: { motions: ['layer-zoom', 'msg-hop'], props: ['sketch-node', 'msg-chip', 'paper-term'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'faint', 'ok', 'subBack', 'subInk', 'chapInk', 'chapRule', 'accent', 'dotR', 'dotY', 'dotG', 'shadow', 'coreS', 'coreH', 'coreB', 'coreT', 'modS', 'modH', 'modB', 'msgS', 'msgB', 'callS', 'callB', 'resS', 'resB', 'txtS', 'txtB'], type: ['text', 'mono'] },
  slots: {
    overview: { type: 'text', tier: 'glance', limits: lim(28, 14, 5) },
    chapter: { type: 'text', tier: 'glance', limits: lim(28, 14, 5) },
    term: { type: 'object' },
    steps: { type: 'list', count: [1, 24], of: { text: { type: 'text', tier: 'glance', limits: lim(22, 10, 5) }, kind: { type: 'enum', of: ['msg', 'call', 'res', 'txt'] } } },
    rounds: { type: 'list', count: [0, 4], of: { type: 'text', tier: 'glance', limits: lim(10, 5, 2) } },
    repo: { type: 'object', optional: true },
    stop: { type: 'list', count: [0, 2], of: { type: 'text', tier: 'glance', limits: lim(26, 10, 5) } },
    note: { type: 'text', tier: 'glance', optional: true, limits: lim(60, 26, 11) },
    tag: { type: 'text', tier: 'glance', limits: lim(52, 18, 9) },
    mapTag: { type: 'text', tier: 'glance', optional: true, limits: lim(40, 14, 7) },
    back: { type: 'boolean' },
    take: { type: 'text', tier: 'primary', optional: true, limits: lim(52, 16, 12) },
    judge: { type: 'text', tier: 'glance', optional: true, limits: lim(20, 6, 3) },
    check: { type: 'text', tier: 'glance', optional: true, limits: lim(12, 5, 2) },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'faint', 'ok', 'subBack', 'subInk', 'chapInk', 'chapRule', 'accent', 'dotR', 'dotY', 'dotG', 'shadow', 'coreS', 'coreH', 'coreB', 'coreT', 'modS', 'modH', 'modB', 'msgS', 'msgB', 'callS', 'callB', 'resS', 'resB', 'txtS', 'txtB'],
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, A = { ...AT, ...(s.at || {}) }, last = Math.max(A.stop + 1.2, ...(s.steps || []).map((x) => (x.emit ? x.emit[2] : x.t1) + 0.4)), end = s.back ? Math.max(A.check + 1.2, A.take + 2.5) : Math.max(A.end, last);
    return { beats: clamp(Math.ceil(end / B - 1e-9), this.beats.min, this.beats.max), reads: [s.term?.line, s.stop?.join(' '), s.note, s.take].filter(Boolean).map((x) => ({ text: x, lang: ctx.lang })),
      cues: [{ beat: (A.zoom + 0.2) / B, kind: 'turn' }, ...A.rounds.slice(0, (s.rounds || []).length).map((r) => ({ beat: (r + 0.6) / B, kind: 'tick' })), { beat: (A.stop + 0.2) / B, kind: 'tick' }, ...(s.back ? [{ beat: (A.back + 0.1) / B, kind: 'turn' }, { beat: A.check / B, kind: 'tick' }] : [])],
      motion: 'layer-zoom', settled: (A.zoom + A.zoomD) / B, peakAt: A.stop / B, pause: 0, lead: 0 };
  },
  validate(s) { return (s.steps || []).every((x) => x.emit || (x.t1 > x.t0)) ? [] : ['steps: each { t0 < t1 } or { emit: [at, go, arrive] }']; },
  prepare(s, c) { return { B: 60 / c.bpm, W: walkPlan(s, c) }; },
  paint(ctx, u, s, c, X) {
    const C = s.colors, L = c.lang, { O, A, D, trips } = X.W, t = u * X.B, fr = O.fr;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, 1080);
    // the zoom: k 0 → 1 (power2.inOut, zoomD) and back
    const kz = tw(t, A.zoom, A.zoomD, E.p2io) * (s.back ? 1 - tw(t, A.back, A.backD, E.p2io) : 1);
    const zin = t < (s.back ? A.back : Infinity);
    const dimA = zin ? lerp(1, 0.32, tw(t, A.focus, 0.4, E.p1io)) * (1 - tw(t, A.zoom, A.zoomD * 0.6, E.p1i)) : tw(t, A.back + A.backD * 0.35, A.backD * 0.65, E.p1o);
    const dimB = zin ? lerp(1, 0.32, tw(t, A.focus, 0.4, E.p1io)) * (1 - tw(t, A.zoom, 0.3, E.p1i)) : tw(t, A.back + A.backD * 0.7, A.backD * 0.3, E.p1o);
    const sc = lerp(1, 1.55, kz), [ox, oy] = [800, 514];
    O.rows.forEach((r) => {
      if (r.focus) return;
      const a = r.below ? dimB : dimA; if (a <= 0.001) return;
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(ox, oy); ctx.scale(sc, sc); ctx.translate(-ox, -oy);
      drawBand(ctx, C, L, r, { frame: 1, tint: 1, name: 1, sub: 1, op: 0.55 }); r.cells.forEach((cl) => drawNode(ctx, C, L, cl)); ctx.restore();
    });
    // the focus band grows into the detail frame
    const bandBox = fr.box.map((v, i) => lerp(v, D.band[i], kz)), subA = zin ? 1 - tw(t, A.zoom, 0.3, E.p1i) : tw(t, A.back + A.backD - 0.2, 0.3, E.p1o);
    drawBand(ctx, C, L, fr, { frame: 1, tint: 1, fill: lerp(1, 0.6, kz), name: 1, sub: subA, op: lerp(0.55, 0.42, kz) }, bandBox);
    // connectors in the detail
    const lnA = (zin ? 1 : 1 - tw(t, A.back - 0.1, 0.3, E.p1i)), stopK = tw(t, A.stop - 0.6, 0.6, E.none) * (zin ? 1 : 0);
    const coreS = PAL(C, fr.c).S, tL = A.zoom + A.zoomD + 0.05;
    [['tool', 0], ['call', 0.08], ['model', 0.16]].forEach(([k, d]) => drawLine(ctx, LN[k], coreS, { u: tw(t, tL + d, 0.35, E.p2io), arrows: 'both', alpha: lnA * lerp(1, 0.3, tw(t, A.stop - 0.55, 0.6, E.none)) }));
    drawLine(ctx, LN.term, coreS, { u: tw(t, A.termLine, 0.3, E.p2io), arrows: 'end', alpha: lnA });
    if (s.repo) drawLine(ctx, LN.repo, coreS, { u: tw(t, A.repoLine, 0.25, E.p2io), arrows: 'both', alpha: lnA });
    // the overview link (side part), out on the focus, back after the return
    if (O.side) drawLine(ctx, O.link, C.line, { arrows: 'both', alpha: (1 - tw(t, A.focus, 0.3, E.p1o)) + (s.back ? tw(t, A.back + A.backD, 0.3, E.p1o) : 0) });
    // messages (under the parts and windows)
    for (const tr of trips) { if (tr.until != null && t >= tr.until) continue; const q = tripAt(ctx, L, tr, t); if (q.alpha > 0) drawMsgChip(ctx, C, L, tr.text, tr.kind, q.x, q.y, { alpha: q.alpha, shown: q.shown }); }
    // the parts
    const pulses = (i) => [...A.pulses.filter((p) => p[0] === i).map((p) => p[1]), ...X.W.cellPulse.filter((p) => p[0] === i).map((p) => p[1]), ...(s.back ? [A.three + (i === 2 ? 0.1 : 0)] : [])];
    fr.cells.forEach((cl, i) => {
      const to = D.cells[i];
      if (cl.loop) {
        const lp = { ...cl, pill: cl.box, circle: to }, thick = pulses(i).some((p) => t >= p && t < p + 0.55) ? lerp(3, 6, pulses(i).reduce((m, p) => Math.max(m, t < p + 0.25 ? tw(t, p, 0.18, E.p2o) : 1 - tw(t, p + 0.25, 0.3, E.p2io)), 0)) : 3;
        const grey = zin ? stopK : 1 - tw(t, A.back + 0.2, 0.6, E.p2o);
        drawLoop(ctx, C, L, lp, { k: kz, bg: 1, line: 1, hatch: 1, lab: 1, lw: thick, grey: Math.max(0, grey), subDy: 124 * kz });
        A.rounds.slice(0, (s.rounds || []).length).forEach((r) => zin && drawOrbit(ctx, C, lp, t, r));
      } else drawNode(ctx, C, L, cl, undefined, cl.box.map((v, j) => lerp(v, to[j], kz)), pulseK(t, pulses(i)));
    });
    if (O.side) {
      const ks = tw(t, A.zoom + 0.2, A.zoomD - 0.1, E.p2io) * (s.back ? 1 - tw(t, A.back, A.backD, E.p2io) : 1), sa = zin ? lerp(1, 0.5, tw(t, A.focus, 0.4, E.p1io)) + 0.5 * tw(t, A.zoom + 0.3, 0.6, E.p1io) : 1;
      drawNode(ctx, C, L, O.side, undefined, O.side.box.map((v, j) => lerp(v, D.side[j], ks)), pulseK(t, X.W.sidePulse), sa);
    }
    // the windows: the terminal above, the repository below
    const winOut = s.back ? 1 - tw(t, A.back - 0.1, 0.35, E.p1i) : 1, ta = tw(t, A.term, 0.35, E.p3o) * winOut;
    if (ta > 0) {
      const [x, y, w, h] = D.term;
      drawTerm(ctx, C, L, [x, lerp(y - 10, y, tw(t, A.term, 0.35, E.p3o)), w, h], { title: s.term.title, alpha: ta }, (cw) => {
        const n = [...s.term.line].length, dt = (A.type[1] - A.type[0]) / Math.max(1, n - 1);
        drawTyped(cw, C, L, '› ', s.term.line, 21, 41, t, A.type[0], (i) => A.type[0] + i * dt, { size: 34, lh: 54, caret: A.caret });
        const da = tw(t, A.stop + 0.2, 0.25, E.p2o); if (da > 0) sayMark(cw, C, L, s.term.done, 25, 93, 28, C.ok, { lh: 40, alpha: da, blur: (1 - da) * 6 });
      });
    }
    if (s.repo) {
      const ra = tw(t, A.repo, 0.35, E.p3o) * winOut, R = s.repo;
      if (ra > 0) {
        const px0 = sz(26, L), need = Math.max(109, 15 + widthOf(ctx, R.file, L, px0, 'mono') + 16) + widthOf(ctx, R.code[0] + R.code[2] + R.code[3], L, 28, 'mono') + 18 + widthOf(ctx, R.changed, L, px0) + 24;
        const [x, y, w0, h] = D.repo, w = Math.max(w0, need + 6);
        drawTerm(ctx, C, L, [x, lerp(y + 10, y, tw(t, A.repo, 0.35, E.p3o)), w, h], { title: R.title, alpha: ra }, (cw) => {
          const px = sz(26, L), wf = say(cw, R.file, 15, 45, L, px, C.dim, { lh: 40, role: 'mono' }), wt = say(cw, R.tests, 15, 89, L, px, C.dim, { lh: 40, role: 'mono' });
          // the code: the wrong operator closes, the right one opens
          const cp = 28, x0 = Math.max(109, 15 + wf + 16), xs = Math.max(109, 15 + wt + 16), wA = say(cw, R.code[0], x0, 45, L, cp, C.ink, { lh: 40, role: 'mono' }), close = tw(t, A.edit, 0.18, E.p1i), wo = widthOf(cw, R.code[1], L, cp, 'mono') * (1 - close);
          if (wo > 0.5) { cw.save(); cw.beginPath(); cw.rect(x0 + wA, 45, wo, 40); cw.clip(); say(cw, R.code[1], x0 + wA, 45, L, cp, C.accent, { lh: 40, role: 'mono', alpha: 1 - close }); cw.restore(); }
          const g = [...R.code[2]], wNew = g.reduce((acc, ch, i) => { const k = tw(t, A.edit + 0.2 + i * 0.08, 0.06, E.none); if (k > 0) { const cwid = widthOf(cw, ch, L, cp, 'mono') * k; cw.save(); cw.beginPath(); cw.rect(x0 + wA + wo + acc, 45, cwid, 40); cw.clip(); say(cw, ch, x0 + wA + wo + acc, 45, L, cp, C.ok, { lh: 40, role: 'mono' }); cw.restore(); return acc + cwid; } return acc; }, 0);
          const wB = say(cw, R.code[3], x0 + wA + wo + wNew, 45, L, cp, C.ink, { lh: 40, role: 'mono' }), wFull = wA + widthOf(cw, R.code[2], L, cp, 'mono') + wB;
          const ca = tw(t, A.edit + 0.5, 0.22, E.p2o); if (ca > 0) say(cw, R.changed, Math.max(297, x0 + wFull + 18), 45, L, px, C.ok, { lh: 40, alpha: ca, blur: (1 - ca) * 6 });
          (R.status || []).forEach(([txt, col, at], i) => { const nx = R.status[i + 1], a = (at == null ? 1 : tw(t, at, 0.18, E.p2o)) * (nx ? 1 - tw(t, nx[2], 0.12, E.p1i) : 1); if (a > 0) sayMark(cw, C, L, txt, xs, 89, px, C[col] || C.dim, { lh: 40, alpha: a, blur: (1 - a) * 6 }); });
        });
      }
    }
    // the round label in the loop, the stop and its note
    const loopI = fr.cells.findIndex((x) => x.loop);
    if (loopI >= 0 && zin) {
      const cb = D.cells[loopI], cx = cb[0] + cb[2] / 2, top = cb[1] + cb[3] / 2 + 11, R = A.rounds.slice(0, (s.rounds || []).length);
      R.forEach((r, i) => {
        const on = tw(t, r + (i > 0 ? 0.15 : 0), 0.22, E.p2o), off = R[i + 1] != null ? tw(t, R[i + 1], 0.15, E.p1i) : (s.back ? tw(t, A.back - 0.1, 0.35, E.p1i) : 0), a = on * (1 - off);
        if (a > 0) say(ctx, s.rounds[i], cx, top, L, 28, mix(coreS, C.line, i === R.length - 1 ? stopK : 0), { lh: 40, align: 'center', alpha: a, blur: (1 - a) * 6 });
      });
    }
    const out = s.back ? 1 - tw(t, A.back - 0.1, 0.35, E.p1i) : 1;
    if (s.stop?.length) {
      const a = tw(t, A.stop, 0.25, E.p2o) * out;
      if (a > 0) {
        const px = 28, w1 = widthOf(ctx, s.stop[0], L, px), w2 = s.stop[1] ? widthOf(ctx, s.stop[1], L, px) : 0, aw = s.stop[1] ? 44 : 0, x0 = 800 - (w1 + aw + w2) / 2;
        say(ctx, s.stop[0], x0, 650, L, px, C.ink, { lh: 40, alpha: a, blur: (1 - a) * 6 });
        if (s.stop[1]) { ctx.save(); ctx.globalAlpha *= a; drawLine(ctx, [['M', x0 + w1 + 10, 670], ['L', x0 + w1 + aw - 10, 670]], C.ink, { arrows: 'end', w: 2.5 }); ctx.restore(); say(ctx, s.stop[1], x0 + w1 + aw, 650, L, px, C.ink, { lh: 40, alpha: a, blur: (1 - a) * 6 }); }
      }
    }
    if (s.note) { const a = tw(t, A.stop + 0.3, 0.25, E.p2o) * out; if (a > 0) say(ctx, s.note, 575, 716, L, 24, C.dim, { lh: 36, alpha: a, blur: (1 - a) * 6 }); }
    drawTag(ctx, C, L, s.tag, 1050, 812, tw(t, A.tag, 0.3, E.p1o) * out);
    // the overview's note on whose layering it is stays at the top right all scene
    if (s.mapTag) drawTag(ctx, C, L, s.mapTag, 1860 - widthOf(ctx, s.mapTag, L, sz(24, L)) - 24, 40, 1);
    // after the return: the line to remember with its dashed note, a check on the layer
    if (s.back) {
      if (s.take) { const a = tw(t, A.take, 0.25, E.p2o); if (a > 0) { const wt = say(ctx, s.take, 84, 760, L, 34, C.ink, { lh: 40, alpha: a, blur: (1 - a) * 6 }); if (s.judge) drawTag(ctx, C, L, s.judge, 84 + wt + 22, 766, a); } }
      if (s.check) { const k = tw(t, A.check, 0.25, E.back(1.8)), a = clamp(tw(t, A.check, 0.25, E.none) * 2); if (a > 0) { ctx.save(); ctx.translate(fr.box[0] + 24, fr.box[1] + (fr.nameY ?? 14) + 42 + (fr.sub ? fr.sub.split('\n').length * 30 : 0) + 30); ctx.scale(lerp(0.6, 1, k), lerp(0.6, 1, k)); sayMark(ctx, C, L, s.check, 0, -20, 28, C.ok, { lh: 40, alpha: a }); ctx.restore(); } }
    }
    // the chapter: hidden on the zoom, the new one shown as it settles; back to the overview's on the return
    const swap = A.zoom + A.zoomD - 0.15, back2 = s.back ? A.back + A.backD - 0.15 : Infinity;
    if (t < swap) drawChapter(ctx, C, L, { text: s.overview, at: -1, hide: A.zoom }, t);
    else if (t < (s.back ? A.back : Infinity)) drawChapter(ctx, C, L, { text: s.chapter, at: -1, hide: A.zoom, show: A.zoom + A.zoomD - 0.1 }, t);
    else if (t < back2) drawChapter(ctx, C, L, { text: s.chapter, at: -1, hide: A.back }, t);
    else drawChapter(ctx, C, L, { text: s.overview, at: -1, hide: A.back, show: A.back + A.backD - 0.1 }, t);
  },
  track(u, s, c, X) { const t = u * X.B, { O, A, D } = X.W, kz = tw(t, A.zoom, A.zoomD, E.p2io); return O.fr.cells.map((cl, i) => cl.box.slice(0, 2).map((v, j) => lerp(v, D.cells[i][j], kz))); },
  blur: () => false,
};
