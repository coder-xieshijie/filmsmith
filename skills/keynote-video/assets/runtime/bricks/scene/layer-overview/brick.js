// layer-overview — a whole system as one diagram of layer bands, read from the inside out: the side part (the model)
// glides from where the opening left it to its place at the right, the focus layer draws itself around it (frame, tint,
// name, then its parts, outline before hachure), the link to the side part draws, the chapter label comes, then the other
// layers draw one after another from the bottom up, each band then its parts left to right, and a dashed note at the top
// right says whose layering it is. The diagram holds for the narration; detail-walk zooms into the focus layer from here.
// From the blueprint-zoom kit as the approved film uses it (the source film segments/bz.js
// 4.84–11.97 s; the kit's overview.js, band.js, node.js, loop.js, line.js). Seconds from the scene's start.
import { W, E, tw, lerp, clamp, widthOf, sz, drawChapter, drawTag, drawBand, bandIn, drawNode, inState, drawLoop, drawLine, overviewLayout, loadTimes, PAL } from '../../look/sketch-paper/kit.js';

const ROWS = {
  en: [{ c: 'prod', name: 'Products', sub: 'From people', cells: ['CLI', 'IDE', 'Desktop', 'Cloud', 'SDK'] }, { c: 'comp', name: 'Composition', cells: ['Subagents', 'MCP', 'Skills', 'Hooks'] },
    { c: 'mech', h: 104, inset: 18, name: 'Mechanisms', sub: 'Answer other limits', cells: ['Context', 'Sessions', 'Side effects', 'Evals'] },
    { c: 'core', name: 'Core', sub: "The model's\nthree limits", cells: [{ title: 'Tools', sub: 'Limit: only tokens out' }, { title: 'Agent Loop', sub: 'Limit: one call is not enough', loop: true }, { title: 'Model call', sub: 'Limit: only via the API' }] },
    { c: 'inf', h: 96, inset: 18, name: 'Infra', sub: 'The base', cells: ['Billing', 'Inference', 'Sandbox', 'Network', 'Hardware', 'Training'] }],
  zh: [{ c: 'prod', name: '产品形态', sub: '来自人', cells: ['CLI', 'IDE', '桌面', '云端', 'SDK'] }, { c: 'comp', name: '组合与扩展', cells: ['子 Agent', 'MCP', 'Skill', 'Hooks'] },
    { c: 'mech', h: 104, inset: 18, name: 'Harness 机制', sub: '回应无状态等约束', cells: ['上下文与压缩', 'Session', '副作用控制', '验证与评测'] },
    { c: 'core', name: 'Harness 核心', sub: '回应模型的\n三条约束', cells: [{ title: '工具', sub: '约束：只能输出 token' }, { title: 'Agent Loop', sub: '约束：一次调用完不成任务', loop: true }, { title: '模型调用', sub: '约束：只能经推理接口' }] },
    { c: 'inf', h: 96, inset: 18, name: 'Infra', sub: '底座', cells: ['账单', '推理与 KV', '执行环境', '网络', '硬件', '训练'] }],
};
const DEFAULT = {
  en: { chapter: 'The Agent Harness', rows: ROWS.en, focus: 3, side: { title: 'Model', sub: 'Via the API' }, from: [640, 330, 312, 120], tag: "Layers and limits: the author's view" },
  zh: { chapter: 'Agent Harness 总图', rows: ROWS.zh, focus: 3, side: { title: '模型', sub: '经推理接口' }, from: [640, 330, 312, 120], tag: '分层与约束：研究者判断' },
};
// the approved film's times, seconds from 4.84 s in the film
const AT = { move: 0, moveD: 0.95, core: 0.37, link: 1.0, chapter: 1.42, up: 2.44, tag: 4.04, end: 7.13 };
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

// the overview at t of this scene (also what detail-walk starts from): { bands: [[row, state, box]], nodes: [[cell, state, box, alpha]], … }
export const overviewAt = (O, A, t) => {
  const LT = loadTimes(O, A), out = { bands: [], nodes: [], loops: [] };
  O.rows.forEach((r, i) => {
    const t0 = LT[i];
    out.bands.push([r, bandIn(t, t0), r.box]);
    r.cells.forEach((c, k) => {
      const tc = r.focus ? t0 + 0.15 + k * 0.1 : t0 + 0.12 + k * 0.06, st = inState(t, tc, r.focus ? 0.45 : 0.4);
      if (c.loop) out.loops.push([{ ...c, pill: c.box, circle: c.box }, { k: 0, bg: st.bg, line: tw(t, tc, 0.5, E.p2io), hatch: st.hatch, lab: st.lab }]); else out.nodes.push([c, st, c.box, 1, r]);
    });
  });
  return out;
};
export const drawOverview = (ctx, C, L, O, ov, o = {}) => {
  for (const [r, st, box] of ov.bands) drawBand(ctx, C, L, r, st, box, o.alpha?.(r) ?? 1);
  for (const [c, st, box, a, r] of ov.nodes) drawNode(ctx, C, L, c, st, box, 1, a * (o.alpha?.(r) ?? 1));
  for (const [lp, st] of ov.loops) drawLoop(ctx, C, L, lp, st);
};

export default {
  id: 'layer-overview', kind: 'scene',
  fits: ['hook', 'problem', 'claim'],
  surface: ['canvas'],
  beats: { min: 8, max: 32 },
  needs: { motions: [], props: ['sketch-node', 'paper-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'faint', 'subBack', 'subInk', 'chapInk', 'chapRule', 'prodS', 'prodH', 'prodB', 'prodT', 'compS', 'compH', 'compB', 'compT', 'mechS', 'mechH', 'mechB', 'mechT', 'coreS', 'coreH', 'coreB', 'coreT', 'infS', 'infH', 'infB', 'infT', 'modS', 'modH', 'modB'], type: ['text'] },
  slots: {
    chapter: { type: 'text', tier: 'glance', limits: lim(28, 14, 5) },
    rows: { type: 'list', count: [2, 6], of: { name: { type: 'text', tier: 'glance', limits: lim(14, 8, 2) }, sub: { type: 'text', tier: 'glance', optional: true, limits: lim(40, 12, 7) }, cells: { type: 'list', count: [1, 6], of: { type: 'text', tier: 'word', limits: lim(14, 6, 2) } } } },
    focus: { type: 'number', limits: lim(1, 1, 1) },
    side: { type: 'object', optional: true },
    tag: { type: 'text', tier: 'glance', limits: lim(40, 14, 7) },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'faint', 'subBack', 'subInk', 'chapInk', 'chapRule', 'prodS', 'prodH', 'prodB', 'prodT', 'compS', 'compH', 'compB', 'compT', 'mechS', 'mechH', 'mechB', 'mechT', 'coreS', 'coreH', 'coreB', 'coreT', 'infS', 'infH', 'infB', 'infT', 'modS', 'modH', 'modB'],
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, A = { ...AT, ...(s.at || {}) }, n = s.rows.length - 1, loaded = A.up + [0.02, 0.5, 0.95, 1.4, 1.85, 2.3][Math.max(0, n - 1)] + 0.6;
    return { beats: clamp(Math.ceil(Math.max(A.end, loaded + 1.5) / B - 1e-9), this.beats.min, this.beats.max), reads: [{ text: s.chapter, lang: ctx.lang, tier: 'glance' }, ...s.rows.map((r) => ({ text: r.name, lang: ctx.lang, tier: 'glance' }))],
      cues: [{ beat: A.core / B, kind: 'accent' }, { beat: A.up / B, kind: 'tick' }], motion: null, settled: loaded / B, peakAt: loaded / B, pause: 0, lead: 0 };
  },
  validate(s) { return s.rows?.[s.focus] ? [] : ['focus: the index of the row to zoom into']; },
  prepare(s, c) { return { B: 60 / c.bpm, A: { ...AT, ...(s.at || {}) }, O: overviewLayout(s) }; },
  paint(ctx, u, s, c, X) {
    const C = s.colors, L = c.lang, { A, O } = X, t = u * X.B;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, 1080);
    drawOverview(ctx, C, L, O, overviewAt(O, A, t));
    if (O.side) {
      const k = tw(t, A.move, A.moveD, E.p2io), f = s.from || O.side.box, box = f.map((v, i) => lerp(v, O.side.box[i], k));
      drawLine(ctx, O.link, C.line, { u: tw(t, A.link, 0.35, E.p2io), arrows: 'both' });
      drawNode(ctx, C, L, O.side, { bg: 1, outline: 1, hatch: 1, lab: 1 }, box);
    }
    drawChapter(ctx, C, L, { text: s.chapter, at: A.chapter }, t);
    if (s.tag) drawTag(ctx, C, L, s.tag, 1860 - widthOf(ctx, s.tag, L, sz(24, L)) - 24, 40, tw(t, A.tag, 0.3, E.p1o));
  },
  track(u, s, c, X) { const t = u * X.B, k = tw(t, X.A.move, X.A.moveD, E.p2io), f = s.from || X.O.side?.box || [0, 0, 0, 0], b = X.O.side?.box || f; return [[lerp(f[0], b[0], k), lerp(f[1], b[1], k)]]; },
  blur: () => false,
};
