// tree-cascade — one sentence grows a structure: a prompt bar is typed into (an uneven, human hand), confirmed and
// sent; a dotted line drips from the bar to the root, then each level's links run ahead of their nodes with a glowing
// head, and a node is pulled out of its port the frame its link arrives (root → two → up to four). The camera starts
// close on the bar and pulls back as the tree grows; once complete the tree breathes once and the bar reports the count.
// Adapted from video-shotcraft demos/interaction/canvas-materialize-moves/DiagramCascadeBuild.tsx (card
// references/shots/interaction/canvas-materialize-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React, SVG or Remotion); colours by role (the links, ports, the
// root's rim and the bar's flowing rim in the accent and a lighter accent, cards in the panel colour); the site's
// data-model table names, fields and key tags replaced by node slots (a title and a meta line, a neutral skeleton
// row under it); the prompt and the status line are slots typed by grapheme in either language; 3 to 7 nodes.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { fontFor, graphemes, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { springAt } from '../../motion/stagger-in/brick.js';

const NW = 344, NH = 158, PY = 96, PH = 100, PX = 400, PW = 1120, LEVEL_GAP = 22, SIB = 5, LEAD = 10, EDGE = 16, R = 22;
const LEVEL_Y = [372, 608, 852], L1X = [540, 1380];
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);
const F = (s, role, size, weight, kind) => fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind);

// Keystroke times: one grapheme a step, a word gap holds half a beat longer; Chinese types a character in about two.
const keyTimes = (s, lang) => {
  const g = graphemes(s), out = []; let t = 8;
  g.forEach((ch, i) => { t += ch === ' ' ? 1.7 : (0.95 + 0.25 * Math.abs(Math.sin(i * 2.17))) * (lang === 'zh' ? 2 : 1); out.push(t); });
  return out;
};
// Root, two children, the rest as grandchildren two to a parent (left parent first).
const treeOf = (n) => {
  const nodes = [{ x: 960, y: LEVEL_Y[0], level: 0, parent: -1 }];
  for (let i = 0; i < Math.min(2, n - 1); i++) nodes.push({ x: n === 2 ? 960 : L1X[i], y: LEVEL_Y[1], level: 1, parent: 0 });
  const g = n - 3, per = [Math.ceil(g / 2), Math.floor(g / 2)];
  per.forEach((k, p) => { for (let j = 0; j < k; j++) nodes.push({ x: L1X[p] + (k === 1 ? 0 : j ? 220 : -220), y: LEVEL_Y[2], level: 2, parent: 1 + p }); });
  return nodes;
};
const timing = (s, lang) => {
  const kt = keyTimes(s.prompt, lang), end = kt.length ? kt[kt.length - 1] : 8, submit = Math.round(end) + 4;
  return { kt, end, submit, drip: submit + 6, cascade: submit + 14 };
};
const startOf = (T, nodes, i) => {
  const n = nodes[i];
  if (!n.level) return T.cascade;
  return T.cascade + n.level * LEVEL_GAP + nodes.filter((m, k) => m.level === n.level && k < i).length * SIB;
};
// The rounded elbow from a parent's bottom port to a child's top port; at(u) walks it by arc length.
const edgeOf = (p, c) => {
  const x1 = p.x, y1 = p.y + NH / 2 + 8, x2 = c.x, y2 = c.y - NH / 2 - 8, my = (y1 + y2) / 2, dir = Math.sign(x2 - x1) || 1;
  const r = Math.min(R, Math.abs(x2 - x1) / 2), s1 = my - r - y1, a = (Math.PI * r) / 2, h = Math.abs(x2 - x1) - 2 * r, s3 = y2 - my - r;
  const at = (u) => {
    if (u <= s1) return [x1, y1 + u]; u -= s1;
    if (u <= a) { const th = u / (r || 1); return [x1 + dir * r * (1 - Math.cos(th)), my - r + r * Math.sin(th)]; } u -= a;
    if (u <= h) return [x1 + dir * (r + u), my]; u -= h;
    if (u <= a) { const th = u / (r || 1); return [x2 - dir * r + dir * r * Math.sin(th), my + r - r * Math.cos(th)]; } u -= a;
    return [x2, my + r + Math.min(u, s3)];
  };
  return { len: s1 + 2 * a + h + s3, at };
};
const popOf = (f, st) => { const pop = springAt(f - st, { damping: 14, stiffness: 190 }); return { pop, sc: 0.7 + 0.3 * pop, dy: (1 - pop) * -18 }; };

const spark = (ctx, x, y, s, color) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.fillStyle = color;
  const star = (cx, cy, R1, r1) => { ctx.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? r1 : R1, an = (k * Math.PI) / 4 - Math.PI / 2; ctx.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } ctx.closePath(); ctx.fill(); };
  star(12, 11, 8.5, 2.6); ctx.globalAlpha *= 0.6; star(19, 18.5, 3, 0.9);
  ctx.restore();
};
const tableGlyph = (ctx, x, y, s, color) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 18, s / 18); ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  rrect(ctx, 2, 3, 14, 12, 2.5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(2, 7.5); ctx.lineTo(16, 7.5); ctx.moveTo(7, 7.5); ctx.lineTo(7, 15); ctx.stroke();
  ctx.restore();
};
const head = (ctx, x, y, r, c, a) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba('#ffffff', a)); g.addColorStop(0.35, rgba(c.hi, 0.9 * a)); g.addColorStop(1, rgba(c.accent, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
};
const port = (ctx, x, y, k, color, c) => { if (k <= 0.01) return; ctx.beginPath(); ctx.arc(x, y, 6 * k, 0, Math.PI * 2); ctx.fillStyle = c.ground; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = color; ctx.stroke(); };

export default {
  id: 'tree-cascade', kind: 'scene',
  fits: ['demo', 'mechanism'],
  surface: ['canvas'],
  beats: { min: 10, max: 14 },
  needs: { motions: [], props: ['input-field'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['text', 'mono'] },
  slots: {
    prompt: { type: 'text', tier: 'primary', limits: { en: { words: 8, chars: 40 }, zh: { chars: 16 } }, default: { en: 'Map how a film gets made', zh: '画出一支片的制作流程' } },
    nodes: { type: 'list', count: [3, 7], of: { title: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 13 }, zh: { chars: 5 } } }, meta: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } } } },
    status: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 5, chars: 22 }, zh: { chars: 10 } } },
  },
  defaults: () => ({
    prompt: { en: 'Map how a film gets made', zh: '画出一支片的制作流程' },
    nodes: {
      en: [['Film', '1 project'], ['Drafts', '12 items'], ['Renders', '21 queued'], ['Reviews', '8 open'], ['Notes', '5 new'], ['Exports', '14 files'], ['Frames', '4.8M checked']].map(([title, meta]) => ({ title, meta })),
      zh: [['成片', '1 个工程'], ['草稿', '12 项'], ['渲染', '21 个排队'], ['审阅', '8 条待看'], ['笔记', '5 条新'], ['导出', '14 个文件'], ['帧', '已检 4.8M']].map(([title, meta]) => ({ title, meta })),
    },
    status: null,
  }),
  plan(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', S = { ...s, prompt: pick(s.prompt, lang) || '' }, T = timing(S, lang), n = (pick(s.nodes, lang) || []).length || 7;
    const nodes = treeOf(n), last = Math.max(...nodes.map((_, i) => startOf(T, nodes, i))), done = last + 12, br = done + 10;
    return {
      beats: (br + 35) / 15, reads: readTime(S.prompt, lang),
      cues: [{ beat: T.submit / 15, kind: 'accent' }, { beat: T.cascade / 15, kind: 'turn' }, { beat: done / 15, kind: 'stamp' }, { beat: (br + 14) / 15, kind: 'accent' }],
      motion: [], settled: (br + 28) / 15, shots: 1, peakAt: (T.cascade + LEVEL_GAP) / 15, pause: { from: T.end / 15, to: T.submit / 15 },
    };
  },
  validate(s, ctx = {}) {
    const n = (pick(s.nodes, ctx.lang || 'en') || []).length;
    return n < 3 || n > 7 ? [`nodes: ${n}, want 3–7`] : [];
  },
  prepare(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', nodes = (pick(s.nodes, lang) || []).map((d) => (typeof d === 'string' ? { title: d } : d));
    const S = { ...s, lang, prompt: pick(s.prompt, lang) || '', nodes };
    S.status = pick(s.status, lang) || (lang === 'zh' ? `${nodes.length} 个节点 · ${nodes.length - 1} 条连线` : `${nodes.length} nodes · ${nodes.length - 1} links`);
    const T = timing(S, lang), tree = treeOf(nodes.length), starts = tree.map((_, i) => startOf(T, tree, i));
    const done = Math.max(...starts) + 12;
    return { S, T, tree, starts, edges: tree.map((n) => (n.parent >= 0 ? edgeOf(tree[n.parent], n) : null)), done, breathe: done + 10, gs: graphemes(S.prompt) };
  },
  paint(ctx, u, s, cx, D) {
    const S = D.S, T = D.T, f = u * 15, c0 = s.colors, c = { ...c0, hi: mix(c0.accent, '#ffffff', 0.35) };
    let typed = 0; while (typed < T.kt.length && T.kt[typed] <= f) typed++;
    const caretOn = f < T.submit && (typed < T.kt.length || Math.floor((f - T.end) / 7) % 2 === 0);
    const confirm = ramp(f, T.end, 6, 'out');
    const press = f < T.submit ? 0 : f < T.submit + 3 ? ramp(f, T.submit, 3, 'out') : 1 - ramp(f, T.submit + 3, 10, 'out');
    const promptIn = ramp(f, 0, 14, 'snappy'), gen = ramp(f, T.submit, 8, 'out') * (1 - ramp(f, D.done, 12, 'out')), doneIn = ramp(f, D.done, 14, 'snappy');
    const flow = Math.max(0, f - T.submit) * 0.012;
    const pull = ramp(f, T.submit + 2, 72, 'smooth'), cam = lerp(1.3, 1, pull), camY = lerp(340, 0, pull);
    const br = ramp(f, D.breathe, 14, 'smooth') - ramp(f, D.breathe + 14, 14, 'smooth'), breathe = 1 + 0.03 * br, auroraUp = ramp(f, D.breathe - 6, 24, 'out');
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    // the light behind the tree and the canvas's dot grid
    ctx.save(); ctx.globalAlpha = ramp(f, T.submit, 60, 'out');
    for (const [gx, gy, rx, ry, col, a] of [[260 + 1400 * 0.35, 380 + 640 * 0.55, 700, 320, c.accent, 0.1 + 0.12 * auroraUp], [260 + 1400 * 0.7, 380 + 640 * 0.6, 630, 288, c.hi, 0.05 + 0.08 * auroraUp]]) {
      ctx.save(); ctx.translate(gx, gy); ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, rgba(col, a)); g.addColorStop(0.7, rgba(col, 0));
      ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = rgba(c.ink, 0.12);
    for (let y = 16 + 20; y < 1080; y += 40) for (let x = 20; x < 1920; x += 40) { const d = Math.hypot((x - 960) / 1152, (y - 626) / 670); if (d < 1) { ctx.globalAlpha = Math.min(1, (1 - d) / 0.75); ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill(); } }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(960, 151.2 + camY); ctx.scale(cam, cam); ctx.translate(-960, -151.2);
    // the prompt bar: a rim that flows while generating, the spark, the typed text and caret, the send key → the status
    ctx.save(); ctx.globalAlpha = promptIn; ctx.translate(0, (1 - promptIn) * -20);
    ctx.save(); ctx.shadowColor = rgba(c.accent, 0.1 + 0.25 * gen); ctx.shadowBlur = 30 + 40 * gen;
    rrect(ctx, PX, PY, PW, PH, 50); ctx.fillStyle = rgba(c.accent, 0.14 + 0.4 * confirm); ctx.fill(); ctx.restore();
    const rimA = Math.max(gen, 0.55 * doneIn);
    if (rimA > 0.001) {
      const g = ctx.createLinearGradient(PX - flow * PW * 3, 0, PX - flow * PW * 3 + PW * 3, 0);
      [0, 0.25, 0.5, 0.75, 1].forEach((k, i) => g.addColorStop(k, i % 2 ? c.hi : c.accent));
      ctx.save(); ctx.globalAlpha *= rimA; rrect(ctx, PX, PY, PW, PH, 50); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }
    rrect(ctx, PX + 2, PY + 2, PW - 4, PH - 4, 48); ctx.fillStyle = c.panel; ctx.fill();
    ctx.save(); ctx.shadowColor = rgba(c.accent, 0.6); ctx.shadowBlur = 8 + 10 * gen; spark(ctx, PX + 32, PY + PH / 2 - 17, 34, c.accent); ctx.restore();
    const pf = F(S, 'text', 36, 520), shown = D.gs.slice(0, typed).join(''), tx = PX + 32 + 34 + 20, tw = shown ? measure(ctx, shown, pf).width : 0;
    if (shown) text(ctx, shown, tx, PY + PH / 2 + 1, pf, { color: c.ink, baseline: 'middle' });
    if (caretOn) { rrect(ctx, tx + tw + 4, PY + PH / 2 - 20 + 2, 3, 40, 1.5); ctx.fillStyle = c.accent; ctx.fill(); }
    const kx = PX + PW - 2 - 16 - 34, ky = PY + PH / 2;
    if (doneIn < 1) {
      const ks = (1 - 0.1 * press) * (1 - 0.3 * doneIn);
      ctx.save(); ctx.globalAlpha *= (0.4 + 0.6 * confirm) * (1 - doneIn); ctx.translate(kx, ky); ctx.scale(ks, ks);
      ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2);
      if (confirm > 0) { const g = ctx.createLinearGradient(-34, -34, 34, 34); g.addColorStop(0, c.accent); g.addColorStop(1, c.hi); ctx.fillStyle = g; } else ctx.fillStyle = rgba(c.ink, 0.06);
      ctx.fill();
      ctx.strokeStyle = confirm > 0.5 ? c.onAccent || c.panel : c.dim; ctx.lineWidth = 3.25; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(0, 8.75); ctx.lineTo(0, -8.75); ctx.moveTo(-7.5, -1.25); ctx.lineTo(0, -8.75); ctx.lineTo(7.5, -1.25); ctx.stroke();
      ctx.restore();
    }
    if (doneIn > 0) {
      const sf = F(S, 'text', 28, 560), sw = measure(ctx, S.status, sf).width, rx = PX + PW - 2 - 16 - 14;
      ctx.save(); ctx.globalAlpha *= doneIn; ctx.translate(0, (1 - doneIn) * 12);
      text(ctx, S.status, rx, ky + 1, sf, { color: c.dim, align: 'right', baseline: 'middle' });
      const ix = rx - sw - 12 - 14;
      ctx.beginPath(); ctx.arc(ix, ky, 11.7, 0, Math.PI * 2); ctx.fillStyle = rgba(c.accent, 0.18); ctx.fill();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(ix - 5.3, ky + 0.35); ctx.lineTo(ix - 1.75, ky + 3.85); ctx.lineTo(ix + 5.25, ky - 3.5); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    // the tree, breathing about its centre
    ctx.save(); ctx.translate(960, 620); ctx.scale(breathe, breathe); ctx.translate(-960, -620);
    const eg = ctx.createLinearGradient(0, 300, 0, 800); eg.addColorStop(0, rgba(c.accent, 0.85)); eg.addColorStop(1, rgba(c.hi, 0.7));
    const root = D.tree[0], dy1 = PY + PH + 4, dy2 = root.y - NH / 2 - 8, drip = ramp(f, T.drip, 8, 'out');
    if (drip > 0) {
      const y2 = lerp(dy1, dy2, drip);
      ctx.save(); ctx.strokeStyle = eg; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.setLineDash([2, 7]);
      ctx.beginPath(); ctx.moveTo(960, dy1); ctx.lineTo(960, y2); ctx.stroke(); ctx.restore();
      if (drip < 1) head(ctx, 960, y2, 16, c, 1);
    }
    D.tree.forEach((n, i) => {
      if (n.parent < 0) return;
      const e = D.edges[i], st = D.starts[i] - LEAD, grow = ramp(f, st, EDGE, 'out');
      if (grow <= 0) return;
      const pts = []; for (let q = 0; q <= grow * e.len; q += 4) pts.push(e.at(q)); pts.push(e.at(grow * e.len));
      const line = (w, style) => { ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineWidth = w; ctx.strokeStyle = style; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
      line(9, rgba(c.accent, 0.18)); line(2.5, eg);
      const ho = 1 - ramp(f, st + EDGE - 4, 8, 'out'), [hx, hy] = pts[pts.length - 1];
      if (ho > 0) head(ctx, hx, hy, 18, c, ho);
      port(ctx, n.x, n.y - NH / 2 - 8, ramp(f, st + EDGE - 6, 10, 'overshoot'), c.hi, c);
    });
    D.tree.forEach((n, i) => {
      const k = D.tree.findIndex((m) => m.parent === i);
      if (k > 0) port(ctx, n.x, n.y + NH / 2 + 8, ramp(f, D.starts[k] - LEAD - 4, 8, 'overshoot'), c.accent, c);
    });
    port(ctx, 960, dy2, ramp(f, T.drip + 4, 8, 'overshoot'), c.accent, c);
    // the nodes, pulled out of their top port
    const hf = F(S, 'text', 34, 650), mf = F(S, 'mono', 22, 500);
    D.tree.forEach((n, i) => {
      const st = D.starts[i]; if (f < st) return;
      const { pop, sc, dy } = popOf(f, st), op = ramp(f, st, 5, 'linear'), lift = (1 - Math.min(1, pop)) * 22, isRoot = !n.level, t = f - st, d = S.nodes[i] || {};
      ctx.save(); ctx.globalAlpha = op; ctx.translate(n.x, n.y - NH / 2 + dy); ctx.scale(sc, sc); ctx.translate(-NW / 2, 0);
      ctx.save(); ctx.shadowColor = rgba('#000000', 0.45); ctx.shadowBlur = 2 * (10 + lift); ctx.shadowOffsetY = (10 + lift) * 0.6;
      if (isRoot) { ctx.shadowColor = rgba(c.accent, 0.25 + 0.2 * br); ctx.shadowBlur = 50; ctx.shadowOffsetY = 0; }
      rrect(ctx, 0, 0, NW, NH, 22);
      if (isRoot) { const g = ctx.createLinearGradient(0, 0, NW, NH); g.addColorStop(0, c.accent); g.addColorStop(1, c.hi); ctx.fillStyle = g; } else ctx.fillStyle = c.panel;
      ctx.fill(); ctx.restore();
      if (isRoot) { rrect(ctx, 2, 2, NW - 4, NH - 4, 20); const g = ctx.createLinearGradient(0, 0, 0, NH); g.addColorStop(0, mix(c.panel, c.accent, 0.16)); g.addColorStop(1, c.panel); ctx.fillStyle = g; ctx.fill(); }
      else { rrect(ctx, 0.5, 0.5, NW - 1, NH - 1, 22); ctx.lineWidth = 1; ctx.strokeStyle = rgba(c.ink, 0.09); ctx.stroke(); }
      ctx.fillStyle = rgba('#ffffff', isRoot ? 0.14 : 0.08); ctx.fillRect(24, isRoot ? 2 : 1, NW - 48, 1);
      const hd = ramp(t, 3, 8, 'out');
      ctx.save(); ctx.globalAlpha *= hd; ctx.translate(0, (1 - hd) * 6);
      tableGlyph(ctx, 24, 20, 26, isRoot ? c.accent : c.dim);
      text(ctx, d.title || '', 24 + 26 + 14, 34, hf, { color: c.ink, baseline: 'middle' });
      ctx.restore();
      ctx.fillStyle = rgba(c.ink, isRoot ? 0.12 : 0.07); ctx.fillRect(0, 66, NW, 1);
      const row = (k) => ramp(t, 7 + k * 3, 9, 'out');
      if (d.meta) { const a = row(0); ctx.save(); ctx.globalAlpha *= a; text(ctx, d.meta, 24 + (1 - a) * -8, 66 + 14 + 13, mf, { color: c.dim, baseline: 'middle' }); ctx.restore(); }
      { const a = row(d.meta ? 1 : 0), y = 66 + 14 + (d.meta ? 36 : 0) + 9; ctx.save(); ctx.globalAlpha *= a; ctx.translate((1 - a) * -8, 0);
        rrect(ctx, 24, y, 120, 8, 4); ctx.fillStyle = rgba(c.ink, 0.14); ctx.fill(); rrect(ctx, NW - 24 - 64, y, 64, 8, 4); ctx.fillStyle = rgba(c.ink, 0.08); ctx.fill(); ctx.restore(); }
      ctx.restore();
    });
    ctx.restore();
    ctx.restore();
  },
  // root and last node centres in the layer's own coordinates (before the camera and the breath), like the upstream's
  // node boxes
  track(u, s, cx, D) {
    const f = u * 15, pt = (i) => { const n = D.tree[i], { sc, dy } = popOf(f, D.starts[i]); return [n.x, n.y - NH / 2 + dy + sc * NH / 2]; };
    return [pt(0), pt(D.tree.length - 1)];
  },
};
