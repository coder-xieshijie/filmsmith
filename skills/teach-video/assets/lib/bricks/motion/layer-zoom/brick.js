// layer-zoom — into one layer of an overview without moving the camera: the other layers are pushed away (scale 1.55
// about the diagram's centre) and fade (those above over the first 60 %, those below at once, so nothing crosses the
// presenter reserve), while the focus layer's frame grows into the detail frame, its tint thins to 60 %, its note goes,
// and its parts move to the detail layout — a loop's pill turning into a circle, its secondary line moving below it.
// Reversed, the same move returns to the overview. 1.3 s, power2.inOut.
// From teach-video assets/kits/blueprint-zoom/starter/components/zoom.js (F.bp.zoomIn / zoomOut; push 1.55, zoomD 1.3)
// as the approved film uses it (agent-harness 11-blueprint-zoom, 12.65 s and 38.04 s).
import { E, tw, lerp, drawBand, drawNode, drawLoop, overviewLayout } from '../../look/sketch-paper/kit.js';

const D = 1.3;
const ROWS = {
  en: [{ c: 'mech', name: 'Mechanisms', cells: ['Context', 'Sessions', 'Side effects'] }, { c: 'core', name: 'Core', cells: [{ title: 'Tools' }, { title: 'Agent Loop', loop: true }, { title: 'Model call' }] }, { c: 'inf', name: 'Infra', cells: ['Billing', 'Sandbox', 'Network'] }],
  zh: [{ c: 'mech', name: 'Harness 机制', cells: ['上下文与压缩', 'Session', '副作用控制'] }, { c: 'core', name: 'Harness 核心', cells: [{ title: '工具' }, { title: 'Agent Loop', loop: true }, { title: '模型调用' }] }, { c: 'inf', name: 'Infra', cells: ['账单', '执行环境', '网络'] }],
};
const DETAIL = { band: [50, 270, 1500, 430], cells: [[90, 400, 382, 144], [675, 347, 250, 250], [1128, 400, 382, 144]] };
export default {
  id: 'layer-zoom', kind: 'motion',
  tier: 'T2', family: 'zoom-depth', beats: 2.6,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'line', 'subBack', 'subInk', 'mechS', 'mechH', 'mechB', 'mechT', 'coreS', 'coreH', 'coreB', 'coreT', 'infS', 'infH', 'infB', 'infT'],
  from: 'the overview: equal-width layer bands, the focus layer among them',
  to: 'the focus layer alone, enlarged into its detail layout; the other layers gone',
  interpolates: ['other layers: scale 1 → 1.55 about the diagram centre, opacity 1 → 0 (above: over 60 %; below: over 0.3 s)', 'focus frame: its box → the detail box, tint 1 → 0.6', 'parts: layout boxes → detail boxes; a loop pill → circle'],
  summary: 'Into one layer of an overview: the other layers are pushed away and fade while the focus layer grows into its detail layout, a loop pill becoming a circle.',
  theory: 'Keeping the camera still and moving the diagram keeps every part continuous (object constancy): the viewer sees which overview cell became which detail part, so the detail is read as a part of the whole.',
  defaults: (ctx = {}) => ({ rows: ROWS[ctx.lang === 'zh' ? 'zh' : 'en'], focus: 1, detail: DETAIL }),
  prepare(P) { return { O: overviewLayout({ rows: P.rows, focus: P.focus, geo: { top: 260 } }) }; },
  rest(side, P, X) { return this.at(side === 'from' ? 0 : 1, P, X); },
  at(p) { return { p, k: E.p2io(Math.max(0, Math.min(1, p))), t: p * D }; },
  paint(ctx, S, P, X) {
    const C = P.colors, L = P.lang, O = X.O, k = S.k, t = S.t, Dt = P.detail || DETAIL;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    const sc = lerp(1, 1.55, k), aAbove = 1 - tw(t, 0, D * 0.6, E.p1i), aBelow = 1 - tw(t, 0, 0.3, E.p1i), [ox, oy] = [800, O.fr.box[1] + O.fr.box[3] / 2];
    O.rows.forEach((r) => {
      if (r.focus) return;
      const a = r.below ? aBelow : aAbove; if (a <= 0.001) return;
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(ox, oy); ctx.scale(sc, sc); ctx.translate(-ox, -oy);
      drawBand(ctx, C, L, r, { frame: 1, tint: 1, name: 1, sub: 1, op: 0.55 }); r.cells.forEach((c) => drawNode(ctx, C, L, c)); ctx.restore();
    });
    const fr = O.fr;
    drawBand(ctx, C, L, fr, { frame: 1, tint: 1, fill: lerp(1, 0.6, k), name: 1, sub: 1 - k, op: lerp(0.55, 0.42, k) }, fr.box.map((v, i) => lerp(v, Dt.band[i], k)));
    fr.cells.forEach((c, i) => {
      const to = Dt.cells[i] || c.box;
      if (c.loop) drawLoop(ctx, C, L, { ...c, pill: c.box, circle: to }, { k, bg: 1, line: 1, hatch: 1, lab: 1, lw: 3 });
      else drawNode(ctx, C, L, c, undefined, c.box.map((v, j) => lerp(v, to[j], k)));
    });
  },
  track(S, P, X) { const O = X.O, Dt = P.detail || DETAIL; return O.fr.cells.map((c, i) => [lerp(c.box[0], Dt.cells[i][0], S.k), lerp(c.box[1], Dt.cells[i][1], S.k)]); },
  blur: () => false,
};
