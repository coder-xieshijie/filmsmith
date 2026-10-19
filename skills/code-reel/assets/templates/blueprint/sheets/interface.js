// sheets/interface.js — THE CONSOLE (2026-10-19, timing API 3). The product's outline is drafted as a flat
// hexagon; three lines from its centre and three dashed hidden edges make it a cube without moving anything
// (lib/handoffs stroke-reinterpret, PLAN X04); the cube then opens along its edges into a cross and the six faces
// slide into the six panels of the product's real interface (lib/handoffs net-unfold, X05), which are lettered
// one by one. The two hand-offs are drawn in sheet coordinates as layers of the drawing (ground: false); the
// cube is isometric (yaw π/4, pitch atan(1/√2), edge = r·√1.5), so the hexagon, the reinterpreted cube and the
// cube that unfolds are the same outline, vertex for vertex.
import { E, partial, polyLen } from '../fx.js';
import { mix } from '../lib/handoffs/util.js';
import { X0, X1, CW, F, MIN, up, header, sz } from './common.js';
import { REINTERPRET_B, UNFOLD_B } from '../choreography.js';

const HEX = { cx: 960, cy: 650, r: 106 }; // the outline: circumradius = projected cube edge
const EDGE = HEX.r * Math.sqrt(1.5); // the cube's edge, so its isometric silhouette is the hexagon
// the six panels in the order net-unfold folds them: header, list, main, side, second side, footer (sheet px).
// They keep clear of the HUD's title block at rest (bottom right) and of the scale bar (bottom left).
const PANELS = {
  T: [X0, 440, CW, 64],
  L: [X0, 524, 380, 376],
  F: [550, 524, 780, 300],
  R: [1350, 524, X1 - 1350, 140],
  Bo: [1350, 684, X1 - 1350, 140],
  K: [550, 844, 740, 56],
};
const ORDER = ['T', 'L', 'F', 'R', 'Bo', 'K'];
const WIDTH = 3; // the ink line weight (fx.js s2)

export const plan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 60);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.6, { col: 'muted' });

  const regions = s.regions || [];
  if (regions.length !== 6) env.err('regions needs exactly 6 entries: header, list, main, side, second side, footer');
  regions.forEach((r, k) => env.lim(`regions[${k}]`, r, 18));
  const views = s.views || ['Outline', 'Isometric'];
  views.forEach((v, k) => env.lim(`views[${k}]`, v, 14));

  const b = env.b, tHex = c('hex'), tRe = c('reinterpret'), tUn = c('unfold');
  const sr = env.handoff('stroke-reinterpret', {
    direction: 'add', center: [HEX.cx, HEX.cy], r: HEX.r, lineWidth: WIDTH, hidden: true, dash: [14, 10],
    colors: { ground: P.paper, ink: P.ink, accent: P.ink }, // the added edges are line work, not a person's mark
  });
  const nu = env.handoff('net-unfold', {
    stage: 'both', size: EDGE, center: [HEX.cx, HEX.cy], cubeAt: [HEX.cx, HEX.cy], yaw: Math.PI / 4, pitch: Math.atan(Math.SQRT1_2),
    panels: PANELS, radius: 16, stroke: WIDTH,
    colors: { ground: P.paper, ink: P.ink, line: mix(P.paper, P.line, 0.35) },
  });
  // the outline drafted with the pen, then the two hand-offs, then the console's panels at rest
  const hex = [...Array(7).keys()].map((k) => { const a = Math.PI / 2 - (k * Math.PI) / 3; return [HEX.cx + HEX.r * Math.cos(a), HEX.cy - HEX.r * Math.sin(a)]; });
  const L = polyLen(hex), draftDur = 0.75 * b;
  pen.custom(tHex, (ctx, t) => {
    if (t < tRe) {
      const u = E.cubicInOut((t - tHex) / draftDur);
      if (u >= 1 && sr.h) return sr.h.still(ctx, 'from');
      ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = WIDTH; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const pts = partial(hex, u, L);
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
      return;
    }
    if (t < tUn) return sr.h?.draw(ctx, Math.min(1, (t - tRe) / (REINTERPRET_B * b)), { blur: false });
    nu.h?.draw(ctx, Math.min(1, (t - tUn) / (UNFOLD_B * b)), { blur: false });
  });

  // the view label under the figure: the outline's name, then the solid's; it leaves before the box opens
  const fv = sz(F.tag, 25, { track: 0.14 }), vy = HEX.cy + HEX.r + 56;
  const v1 = pen.text(up(`Fig. A — ${views[0]}`), HEX.cx, vy, fv, c('view'), 0.3, { align: 'center', col: 'line', mode: 'fade' });
  v1.fadeOut = c('solid') - 0.12; v1.fadeDur = 0.1;
  const v2 = pen.text(up(`Fig. A — ${views[1]}`), HEX.cx, vy, fv, c('solid'), 0.25, { align: 'center', col: 'line', mode: 'fade' });
  v2.fadeOut = tUn; v2.fadeDur = 0.1;

  // the regions: each panel lettered with its name, then its drafted furniture (list rows, the main area's
  // reserved-area cross, a centre line on the side tiles)
  const fl = { fam: 'mono', w: 500, size: 25, track: 0.12 };
  ORDER.forEach((k, i) => {
    const [x, y, w, h] = PANELS[k], t = c('region' + i);
    const name = up(regions[i] || '');
    const fit = env.fit(name, fl, w - 44, MIN, `regions[${i}]`);
    pen.text(name, x + 22, k === 'T' || k === 'K' ? y + h / 2 + 9 : y + 40, fit, t, 0.3, { col: 'line' });
    const d = t + 0.1;
    if (k === 'L') for (let r = 0; r < 4; r++) pen.seg(x + 22, y + 92 + r * 64, x + w - 22, y + 92 + r * 64, d + r * 0.05, 0.3, 'sf');
    if (k === 'F') { pen.seg(x + 22, y + 64, x + w - 22, y + h - 22, d, 0.35, 'sf'); pen.seg(x + w - 22, y + 64, x + 22, y + h - 22, d + 0.05, 0.35, 'sf'); }
    if (k === 'R' || k === 'Bo') pen.line([[x + 22, y + h - 40], [x + w - 22, y + h - 40]], d, 0.3, 'sf', { dash: 'dashdot' });
  });
  return { title, focus: null };
};

