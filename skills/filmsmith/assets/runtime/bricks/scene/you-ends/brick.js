// you-ends — a pipeline with you at both ends: the title decodes in two halves, a sub, then three to six nodes land
// every half beat (the first and last are you, outlined in ink), links light between them, a bracket names what
// runs between the people, and a dashed loop sends a dot from the last machine step back to the first, lap after lap.
// From the phosphor template: film.js BUILD.ends, events.js TIMING.ends (title 0.17 / 0.8 beat, sub 1.5 beats, nodes
// every half beat as the title is read, links a beat after, bracket as the names are read, loop half a beat later,
// a dot lap two beats), index.html .ends-h .ends-sub .pn .lab-c. Chinese: tags untracked at 28 px, names at 40 px,
// halves split at the break nearest the middle.
import { E, F, W, at, rr, rect, display, decodeAt, ground, post, hud, hudAt, palOf, reader, half, SEEN, rgba, zh, clamp, fit, halves, label } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { title: ['You at ', 'both ends.'], sub: 'the machine runs the middle', nodes: [{ tag: 'ASK', name: 'You', sub: 'set the policy', you: true }, { tag: 'LOCK', name: 'lock', sub: 'hash the graph' }, { tag: 'CHECK', name: 'check', sub: 'every PR' }, { tag: 'SIGN', name: 'You', sub: 'approve the diff', you: true }], bracket: 'grainlock runs these', loop: 'a gap goes back to lock' },
  zh: { title: ['两头', '都是你。'], sub: '中间交给机器', nodes: [{ tag: '提问', name: '你', sub: '定下策略', you: true }, { tag: '锁定', name: 'lock', sub: '给依赖图做哈希' }, { tag: '检查', name: 'check', sub: '每个 PR' }, { tag: '签字', name: '你', sub: '批准改动', you: true }], bracket: '这段由 grainlock 跑', loop: '发现缺口就回到锁定' },
};
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), nodes = (s.nodes || []).slice(0, 6), n = nodes.length, T = { title1: 0.17 * B, title2: 0.8 * B, sub: 1.5 * B };
  rd.move(T.title1, 0.5); rd.move(T.title2, 0.45); rd.at(T.title2 + 0.45);
  const titleRead = rd.primary(T.title1 + 0.4, [s.title].flat().join(''));
  rd.move(T.sub, 0.35); rd.glance(T.sub + SEEN, s.sub);
  const n0 = half(Math.max(1.2 * B, titleRead - SEEN), B);
  T.nodes = nodes.map((d, i) => { const t = rd.move(n0 + i * 0.5 * B, 0.3); rd.glance(t + SEEN, d.tag); rd.glance(t + SEEN, d.sub); return t; });
  nodes.forEach((d, i) => rd.primary(T.nodes[i] + SEEN, d.name));
  const named = n ? Math.max(T.nodes[n - 1] + 0.3, rd.done) : n0;
  T.links = rd.move(n0 + B, 0.4);
  T.bracket = rd.move(half(Math.max(n0 + 2 * B, named - B), B), 0.35); rd.glance(T.bracket + SEEN, s.bracket);
  T.loop = rd.move(T.bracket + 0.5 * B, 0.3); T.dot = T.loop + 0.5 * B; T.dotDur = 2 * B;
  rd.glance(T.loop + SEEN, s.loop); rd.at(T.dot + T.dotDur);
  T.done = rd.done; T.beats = Math.max(Math.ceil(T.done / B - 1e-6), minBeats);
  return T;
};
const bez = (p0, p1, p2, p3, u) => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };

export default {
  id: 'you-ends', kind: 'scene',
  fits: ['claim', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 16 },
  needs: { motions: ['glyph-decode'], props: ['terminal-hud'], roles: ['ground', 'panel', 'ink', 'muted', 'dim', 'line', 'hi'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 14 }, zh: { chars: 5 } } } },
    sub: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 36 }, zh: { chars: 12 } } },
    nodes: { type: 'list', count: [3, 6], of: { tag: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } }, name: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 5 } } }, sub: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } }, you: { type: 'flag', default: false } } },
    bracket: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } },
    loop: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 32 }, zh: { chars: 12 } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'panel', 'ink', 'muted', 'dim', 'line', 'hi', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], screen: 'crt', palette: 'ice', hud: null, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B, n = T.nodes.length;
    return {
      beats: T.beats, lead: 0, reads: [{ text: [s.title].flat().join(''), lang: ctx.lang }, ...(s.nodes || []).map((d) => ({ text: d.name, lang: ctx.lang }))],
      cues: [{ beat: b(T.title1), kind: 'accent' }, ...T.nodes.map((x, i) => ({ beat: b(x), kind: i === 0 || i === n - 1 ? 'stamp' : 'accent' })), { beat: b(T.loop), kind: 'turn' }],
      motion: 'the title decodes; the nodes land with you at both ends; links light; the bracket; a dot loops back', settled: b(T.loop) + 0.5, shots: [{ beat: 0, kind: 'pipeline' }],
    };
  },
  prepare(s, c) { const L = c.lang || 'en', B = 60 / c.bpm; return { L, B, P: palOf(s.colors, s.palette), T: timing(s, B, L, s.minBeats || 0), title: Array.isArray(s.title) ? s.title.map(String) : halves(s.title, L) }; },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B, nodes = (s.nodes || []).slice(0, 6), n = nodes.length, w = (1690 - (n - 1) * 50) / n, xOf = (i) => 115 + i * (w + 50);
    ground(ctx, P, t, { bpm: c.bpm });
    const [a, b2] = D.title; let f = { ...F('display', L, 108, 800), spacing: zh(L) ? 0 : -0.045 * 108 }; f = fit(ctx, a + b2, f, 1700, zh(L) ? 88 : 94);
    const x0 = 960 - W(ctx, a + b2, f) / 2;
    display(ctx, decodeAt(a, t, T.title1, 0.5, 51), x0, 150, f, P, { screen: s.screen }); display(ctx, decodeAt(b2, t, T.title2, 0.45, 52), x0 + W(ctx, a, f), 150, f, P, { screen: s.screen });
    const fm = F('mono', L, zh(L) ? 28 : 25, 400);
    if (s.sub && t >= T.sub) { const e = E.p3Out((t - T.sub) / 0.35); at(ctx, s.sub, 960, 286 + 10 * (1 - e), fm, P.muted, { align: 'center', alpha: e }); }
    // links between the nodes
    if (t >= T.links) for (let i = 0; i < n - 1; i++) { const e = clamp((t - T.links - i * 0.08) / 0.2), x = xOf(i + 1) - 50; ctx.save(); ctx.globalAlpha *= e; rect(ctx, x, 548.5, 50, 3, P.muted); ctx.beginPath(); ctx.arc(x + 25, 550, 5, 0, Math.PI * 2); ctx.fillStyle = P.hi; ctx.fill(); ctx.restore(); }
    const ftag = { ...F('mono', L, zh(L) ? 28 : 25, 400), spacing: zh(L) ? 0 : 0.2 * 25 }, fs = F('text', L, zh(L) ? 28 : 25, 400);
    nodes.forEach((d, i) => {
      const t0 = T.nodes[i]; if (t < t0) return;
      const e = clamp((t - t0) / 0.3), y = 470 + 30 * (1 - (d.you ? E.back(2)(e) : E.p3Out(e))), x = xOf(i);
      ctx.save(); ctx.globalAlpha *= Math.min(1, e * 1.5);
      rr(ctx, x, y, w, 160, 8); ctx.fillStyle = rgba(P.panel, 0.92); ctx.fill(); ctx.strokeStyle = d.you ? P.ink : P.line; ctx.lineWidth = 2; ctx.stroke();
      const fv = fit(ctx, d.name, { ...F(d.you ? 'text' : 'mono', L, 40, 700), spacing: zh(L) ? 0 : -0.02 * 40 }, w - 20, 35);
      at(ctx, label(d.tag, L), x + w / 2, y + 22, ftag, d.you ? P.ink : P.dim, { align: 'center' });
      at(ctx, d.name, x + w / 2, y + 60, fv, P.ink, { align: 'center' });
      at(ctx, d.sub || '', x + w / 2, y + 112, fit(ctx, d.sub || '', fs, w - 20, 22), d.you ? P.ink : P.muted, { align: 'center' });
      ctx.restore();
    });
    // the bracket under the machine steps, and the loop back
    if (n >= 3 && s.bracket && t >= T.bracket) {
      const e = E.p3Out((t - T.bracket) / 0.35), x1 = xOf(1), x2 = xOf(n - 2) + w, lw = W(ctx, s.bracket, fm), mid = (x1 + x2) / 2;
      ctx.save(); ctx.globalAlpha *= e; ctx.strokeStyle = P.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, 652); ctx.lineTo(x1, 682); ctx.lineTo(mid - lw / 2 - 18, 682); ctx.moveTo(mid + lw / 2 + 18, 682); ctx.lineTo(x2, 682); ctx.lineTo(x2, 652); ctx.stroke(); ctx.restore();
      at(ctx, s.bracket, mid, 668 - 10 * (1 - e), fm, P.muted, { align: 'center', alpha: e });
    }
    if (n >= 3 && t >= T.loop) {
      const e = clamp((t - T.loop) / 0.3), lx1 = xOf(n - 2) + w / 2, lx2 = xOf(1) + w / 2, p0 = [lx1, 720], p1 = [lx1, 840], p2 = [lx2, 840], p3 = [lx2, 720];
      ctx.save(); ctx.globalAlpha *= e; ctx.setLineDash([10, 10]); ctx.strokeStyle = rgba(P.muted, 0.7); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(...p0); ctx.bezierCurveTo(...p1, ...p2, ...p3); ctx.stroke(); ctx.restore();
      if (s.loop) { const el = E.p3Out((t - T.loop) / 0.35); at(ctx, s.loop, 960, 850 + 10 * (1 - el), fm, P.muted, { align: 'center', alpha: el }); }
      if (t >= T.dot) { const q = ((t - T.dot) / T.dotDur) % 1, pt = bez(p0, p1, p2, p3, E.sine(q)); ctx.beginPath(); ctx.arc(pt[0], pt[1], 8, 0, Math.PI * 2); ctx.fillStyle = P.hi; ctx.fill(); }
    }
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen });
  },
  track() { return [[960, 540]]; },
};
