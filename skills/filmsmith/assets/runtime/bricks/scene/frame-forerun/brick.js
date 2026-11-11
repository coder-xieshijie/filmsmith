// frame-forerun — a neon frame runs round an empty place from two heads and closes; the page inside wakes from dark to
// light while its parts drop out of the air onto it, each with a same-shape soft shadow that tightens as it lands;
// a tunnel of echo frames behind strikes up and later goes out. Parts land in turn (forerun) or all at once while the
// camera arcs round the page (together).
// Adapted from video-shotcraft demos/ui-entrance/neon-frame-forerun/NeonFrameForerun.tsx (card
// references/shots/ui-entrance/neon-frame-forerun.md) and demos/ui-entrance/neon-frame-orbit-drop/NeonFrameForerunOrbit.tsx
// (card references/shots/ui-entrance/neon-frame-orbit-drop.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion): CSS 3D with the panel, its parts and the echo frames
// as canvases painted once, the main frame repainted per pose; the two shots are two `drop`s of one scene (forerun:
// staggered landings 54 → 104 with a long camera settle from −30° to −12°; together: every part lands at once while the
// camera arcs from +38° to −26°); in both the parts rise on translateZ with a blurred silhouette as their shadow (the
// orbit shot's 2D lift is not kept); the neon tube is four strokes of the accent (a wide halo, a halo, the colour core
// and a hot white core) instead of the purple-to-pink gradients; the echo tunnel serves both drops (the orbit shot's
// random background frames are not kept); the workbench page (brand, nav, greeting, stats, tasks) is neutral sample
// copy on the paper role; deterministic flicker as upstream; grain is dropped.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { bez } from '../../../motion.js';
import { el, n } from '../../dom.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { GLYPHS } from '../hub-links/brick.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
const FRAMES = 140, PW = 1440, PH = 840, PAD = 22, FW = PW + 2 * PAD, FH = PH + 2 * PAD, M = 70;
const FALL = bez(0.55, 0, 0.75, 0.95), FALL2 = bez(0.5, 0.05, 0.6, 1), ORBIT = bez(0.42, 0.05, 0.32, 1), TRACE2 = bez(0.3, 0.1, 0.3, 1), LIT2 = bez(0.35, 0, 0.3, 1);
const STRIKE = [0, 0.7, 0.15, 0.9, 0.35, 1], FADE = [1, 0.3, 0.8, 0.12, 0.4, 0];
const strike = (f, on) => (f < on ? 0 : f - on >= STRIKE.length ? 1 : STRIKE[Math.floor(f - on)]);
const quench = (f, off) => (f < off ? 1 : f - off >= FADE.length ? 0 : FADE[Math.floor(f - off)]);
const keys = (f, xs, ys) => { if (f <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (f <= xs[i]) return lerp(ys[i - 1], ys[i], (f - xs[i - 1]) / (xs[i] - xs[i - 1])); return ys[ys.length - 1]; };
const PERSP = { forerun: 1600, together: 1500 };
const ECHO = Array.from({ length: 5 }, (_, i) => { const k = i + 1, z = 320 * k, g = 1.13 + 0.2 * k; return { k, z, s: (g * (PERSP.forerun + z)) / PERSP.forerun, on: 20 + i * 4, off: 94 + [2, 1, 0, 1, 2][i] * 7 + (i % 2) * 2 }; });

// The frame's outline from the left-middle, up, clockwise (share u of the perimeter → point)
const PERIM = 2 * (FW + FH);
const SEGS = [[0, FH / 2, 0, 0], [0, 0, FW, 0], [FW, 0, FW, FH], [FW, FH, 0, FH], [0, FH, 0, FH / 2]];
const pointAt = (u) => {
  let s = (((u % 1) + 1) % 1) * PERIM;
  for (const [x1, y1, x2, y2] of SEGS) { const len = Math.hypot(x2 - x1, y2 - y1); if (s <= len) return [x1 + ((x2 - x1) * s) / len, y1 + ((y2 - y1) * s) / len]; s -= len; }
  return [0, FH / 2];
};
const spanPath = (g, a, b) => {   // the outline between shares a < b as one polyline (corners included)
  const pts = [pointAt(a)], corners = [FH / 2, FH / 2 + FW, FH / 2 + FW + FH, FH / 2 + 2 * FW + FH].map((s) => s / PERIM);
  for (const cu of corners) if (cu > a && cu < b) pts.push(pointAt(cu));
  pts.push(pointAt(b));
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
};
// a neon tube: four strokes (wide halo, halo, colour core, hot core); spans [[a, b], …] of the outline, or the whole
const tube = (g, c, spans, { a = 1, core = 1, w = 1 } = {}) => {
  const hot = mix(c.accent, '#ffffff', 0.85), col = mix(c.accent, '#ffffff', 0.25);
  g.lineJoin = 'miter'; g.lineCap = 'butt';
  for (const [lw, color, al] of [[34 * w, c.accent, 0.07 * a], [14 * w, c.accent, 0.18 * a], [5 * w, col, 0.9 * a], [1.6 * w, hot, 0.85 * a * core]]) {
    g.strokeStyle = rgba(color, al); g.lineWidth = lw;
    for (const [s0, s1] of spans) { spanPath(g, s0, s1); g.stroke(); }
  }
};

// ── the neutral page: parts of a workbench home (panel px), each painted once ────────────────────────────────────────
const partsOf = (P) => {
  const c = P.colors, info = infoSize(P.lang), ink = c.onPaper, ink2 = mix(c.onPaper, c.paper, 0.35), ink3 = mix(c.onPaper, c.paper, 0.55);
  const nav = copy('nav', P.lang), kpis = copy('kpis', P.lang), cards = copy('cards', P.lang), steps = copy('steps', P.lang);
  const card = (g, w, h, r) => { g.save(); g.shadowColor = rgba(mix(ink, '#000000', 0.5), 0.12); g.shadowBlur = 18; g.shadowOffsetY = 6; rrect(g, 0, 0, w, h, r); g.fillStyle = mix(c.paper, '#ffffff', 0.6); g.fill(); g.restore(); rrect(g, 0.5, 0.5, w - 1, h - 1, r); g.strokeStyle = rgba(ink, 0.09); g.lineWidth = 1; g.stroke(); };
  const glyph = (g, name, cx, cy, s, col) => { g.save(); g.translate(cx - s / 2, cy - s / 2); g.scale(s / 24, s / 24); g.beginPath(); (GLYPHS[name] || GLYPHS.page)(g); g.strokeStyle = col; g.lineWidth = 2; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); g.restore(); };
  const parts = [];
  parts.push({ key: 'brand', x: 40, y: 44, w: 280, h: 56, land: 0, H: 150, paint: (g) => {
    g.beginPath(); g.arc(24, 28, 22, 0, Math.PI * 2); g.fillStyle = c.accent; g.fill(); g.beginPath(); g.arc(24, 28, 8, 0, Math.PI * 2); g.fillStyle = c.paper; g.fill();
    text(g, P.product || copy('product', P.lang), 60, 39, F(P, 'display', 32, 720, 'display'), { color: ink });
  } });
  nav.forEach((s, i) => parts.push({ key: `nav${i}`, x: 28, y: 160 + i * 76, w: 270, h: 62, land: 0.08 + i * 0.06, H: 130, paint: (g) => {
    if (i === 0) card(g, 270, 62, 14);
    glyph(g, ['page', 'card', 'code', 'wave'][i], 36, 31, 30, i === 0 ? c.accent : ink2);
    text(g, s, 70, 43, F(P, 'text', 33, i === 0 ? 650 : 500), { color: i === 0 ? ink : ink2 });
    if (i === 1) { rrect(g, 216, 17, 38, 28, 14); g.fillStyle = c.accent; g.fill(); text(g, '4', 235, 39, F(P, 'text', 24, 700), { color: c.onAccent, align: 'center' }); }
  } }));
  parts.push({ key: 'hello', x: 384, y: 52, w: 960, h: 84, land: 0.04, H: 170, paint: (g) => {
    const tf = F(P, 'display', 66, 750, 'display'), tw = measure(g, copy('title', P.lang), tf).width;
    text(g, copy('title', P.lang), 0, 64, tf, { color: ink });
    text(g, copy('caption', P.lang), tw + 26, 64, F(P, 'text', 32, 500), { color: ink3 });
  } });
  kpis.forEach((k, i) => parts.push({ key: `stat${i}`, x: 384 + i * 334, y: 176, w: 310, h: 188, land: 0.2 + i * 0.07, H: 160, paint: (g) => {
    card(g, 310, 188, 22);
    text(g, k.label, 28, 54, F(P, 'text', 32, 550), { color: ink2 });
    text(g, k.value, 26, 128, F(P, 'display', 70, 750, 'display'), { color: i === 2 ? c.accent : ink });
    text(g, k.delta, 28, 170, F(P, 'text', 32, 600), { color: i === 0 ? c.fail : ink3 });
  } }));
  parts.push({ key: 'today', x: 388, y: 404, w: 400, h: 36, land: 0.42, H: 120, paint: (g) => text(g, copy('eyebrow', P.lang), 0, 30, F(P, 'mono', Math.max(32, info), 700, 'label'), { color: ink3 }) });
  [0, 1, 2, 3].forEach((i) => parts.push({ key: `task${i}`, x: 384, y: 450 + i * 88, w: 978, h: 74, land: 0.5 + i * 0.12, H: 140, paint: (g) => {
    card(g, 978, 74, 16);
    const tone = [c.fail, c.warn, c.fail, c.accent][i];
    g.beginPath(); g.arc(37, 37, 11.5, 0, Math.PI * 2); g.strokeStyle = tone; g.lineWidth = 3; g.stroke();
    text(g, cards[i].title, 70, 49, F(P, 'text', 34, 560), { color: ink });
    const sf = F(P, 'text', 30, 650), st = steps[i], sw = measure(g, st, sf).width + 28;
    rrect(g, 978 - 24 - 44 - 22 - sw, 17, sw, 40, 10); g.fillStyle = i === 0 ? rgba(c.accent, 0.12) : rgba(ink, 0.06); g.fill();
    text(g, st, 978 - 24 - 44 - 22 - sw + 14, 48, sf, { color: i === 0 ? c.accent : ink2 });
    g.beginPath(); g.arc(978 - 24 - 22, 37, 22, 0, Math.PI * 2); g.fillStyle = mix(c.paper, c.accent, 0.12 + 0.06 * i); g.fill();
    text(g, String(i + 1).padStart(2, '0'), 978 - 24 - 22, 46, F(P, 'mono', 24, 700, 'label'), { color: ink2, align: 'center' });
  } }));
  return parts;
};
const canvasEl = (parent, w, h, paint, style = {}) => {
  const k = 1.25, cv = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${w}px`, height: `${h}px`, ...style }, parent);
  cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  const g = cv.getContext('2d', { willReadFrequently: true }); g.scale(k, k); paint(g);
  return cv;
};

// CSS 3D, by hand: the panel's transform (about its centre) and the stage's perspective, for track()
const project = (x, y, z, S, P) => {
  const d = (a) => (a * Math.PI) / 180, [ry, rx, rz] = [d(S.rotY), d(S.rotX), d(S.rotZ)];
  let X = x - PW / 2, Y = y - PH / 2, Z = z;
  [X, Y] = [X * Math.cos(rz) - Y * Math.sin(rz), X * Math.sin(rz) + Y * Math.cos(rz)];
  [Y, Z] = [Y * Math.cos(rx) - Z * Math.sin(rx), Y * Math.sin(rx) + Z * Math.cos(rx)];
  [X, Z] = [X * Math.cos(ry) + Z * Math.sin(ry), -X * Math.sin(ry) + Z * Math.cos(ry)];
  X *= S.scale; Y *= S.scale;   // CSS scale(s) is 2D: z is not scaled
  const cx = 960, cy = 540 + S.dy, ox = (S.origin * 1920) / 100, oy = 0.45 * 1080 - (S.together ? 0.01 * 1080 : 0), k = S.persp / (S.persp - Z);
  return [ox + (cx + X - ox) * k, oy + (cy + Y - oy) * k];
};

export default {
  id: 'frame-forerun', kind: 'scene',
  fits: ['hook', 'demo', 'turn'],
  surface: ['dom'],
  beats: { min: 8, max: 11 },
  beatsFor: () => FRAMES / 15,
  needs: { motions: [], props: [], roles: ['ground', 'paper', 'onPaper', 'ink', 'accent', 'onAccent', 'warn', 'fail'], type: ['display', 'text', 'mono'] },
  slots: {
    parts: { type: 'list', count: [4, 16], optional: true, of: {
      image: { type: 'image' }, x: { type: 'number' }, y: { type: 'number' }, w: { type: 'number' }, h: { type: 'number' },
      land: { type: 'number', optional: true }, lift: { type: 'number', optional: true },
    } },
    base: { type: 'image', optional: true },
    product: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 12 }, zh: { chars: 6 } } },
  },
  roles: ['ground', 'paper', 'onPaper', 'ink', 'accent', 'onAccent', 'warn', 'fail'],
  summary: 'A neon frame runs round an empty place and closes; the page inside wakes from dark while its parts drop out of the air onto it, in turn or all at once.',
  defaults: () => ({ drop: 'forerun', parts: null, base: null, product: null }),
  plan(s) { return { beats: FRAMES / 15, reads: [], cues: [{ beat: (s.drop === 'together' ? 14 : 22) / 15, kind: 'accent' }, { beat: (s.drop === 'together' ? 66 : 104) / 15, kind: 'land' }], peakAt: (s.drop === 'together' ? 66 : 22) / 15, settled: 124 / 15 }; },
  validate(s) { return s.drop && !['forerun', 'together'].includes(s.drop) ? [`drop: ${s.drop} (forerun | together)`] : []; },
  // the film's page: its own crops (panel px, 1440 × 840) dropped in land order, over its own base image if given
  prepare(P) {
    const parts = P.parts ? P.parts.map((q, i) => ({ key: `part${i}`, x: q.x, y: q.y, w: q.w, h: q.h, land: q.land ?? i / Math.max(1, P.parts.length - 1), H: q.lift ?? 140,
      paint: (g) => { if (q.image && (q.image.width || q.image.naturalWidth)) g.drawImage(q.image, 0, 0, q.w, q.h); } })) : partsOf(P);
    return { together: P.drop === 'together', parts };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * FRAMES;
    if (D.together) {
      const orbit = ORBIT(clamp(f / 128)), trace = TRACE2(clamp(f / 14)), t = clamp((f - 10) / 108), q = FALL2(clamp((t - 0.22) / 0.3));
      return { f, together: true, trace, lit: lerp(0.25, 1, LIT2(clamp((f - 8) / 22))), vis: trace > 0.4 ? 1 : 0, core: lerp(1, 0.35, clamp((f - 96) / 34)), frameA: 1,
        rim: keys(f, [0, 20, 108, 138], [0.7, 1, 0.75, 0.5]) * Math.min(1, trace * 1.6), bg: keys(f, [0, 30, 100, 136], [0.3, 1, 0.85, 0.1]), flash: 0, meet: 1,
        rotY: 38 - 64 * orbit, rotX: 6 - 2.5 * orbit, rotZ: 3 - 7.5 * orbit, scale: 0.8 + 0.08 * Math.sin(orbit * Math.PI) + 0.1 * orbit, origin: 30 + 34 * orbit, dy: -10, persp: PERSP.together,
        lifts: D.parts.map((pt) => (1 - q) * pt.H) };
    }
    const settle = ramp(f, 0, 96, 'out'), drift = ramp(f, 90, 50, 'smooth'), trace = ramp(f, 2, 20, 'swift'), meet = ramp(f, 21, 14, 'out');
    return { f, together: false, trace, lit: ramp(f, 24, 60, 'smooth'), vis: ramp(f, 16, 14, 'out'), core: lerp(1, 0.35, ramp(f, 60, 40, 'smooth')), frameA: 1 - 0.35 * ramp(f, 96, 30, 'smooth'),
      rim: ramp(f, 40, 40, 'out') * (1 + 0.25 * ramp(f, 100, 30, 'smooth')), bg: 0.55 + 0.45 * ramp(f, 18, 30, 'out') - 0.3 * ramp(f, 96, 30, 'smooth'), flash: f >= 21 ? 1 - meet : 0, meet,
      rotY: lerp(-30, -12, settle) + 1.5 * drift, rotX: lerp(10, 5, settle), rotZ: lerp(-7, -2.5, settle), scale: lerp(0.8, 0.88, settle) + 0.01 * drift, origin: 50, dy: 0, persp: PERSP.forerun,
      lifts: D.parts.map((pt) => { const lf = 54 + EASE.out(pt.land) * 50; return (1 - FALL(clamp((f - (lf - 24)) / 24))) * pt.H; }) };
  },
  build(root, P, D) {
    const c = P.colors;
    root.style.background = c.ground;
    const bg = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root);
    bg.width = 960; bg.height = 540;
    const stage = el('div', { position: 'absolute', inset: '0', overflow: 'hidden', perspective: `${D.together ? PERSP.together : PERSP.forerun}px` }, root);
    const panel = el('div', { position: 'absolute', left: `${(1920 - PW) / 2}px`, top: `${(1080 - PH) / 2}px`, width: `${PW}px`, height: `${PH}px`, transformStyle: 'preserve-3d' }, stage);
    // the echo tunnel: the same frame further back and larger, painted once at full strength
    const echoes = ECHO.map((e) => {
      const cv = canvasEl(panel, FW + 2 * M, FH + 2 * M, (g) => { g.translate(M, M); tube(g, { ...c, accent: e.k % 2 ? c.accent : mix(c.accent, '#ffffff', 0.4) }, [[0, 1]], { core: 0.5, w: 1.2 + e.k * 0.3 }); }, { left: `${-PAD - M}px`, top: `${-PAD - M}px` });
      cv.style.transform = `translateZ(${-e.z}px) scale(${n(e.s)})`;
      return cv;
    });
    const rimEl = el('div', { position: 'absolute', inset: '0', borderRadius: '18px', transform: 'translateZ(-2px)' }, panel);
    const base = el('div', { position: 'absolute', inset: '0', borderRadius: '18px', overflow: 'hidden', background: `linear-gradient(180deg, ${mix(c.paper, '#ffffff', 0.5)} 0%, ${c.paper} 100%)` }, panel);
    if (P.base && (P.base.width || P.base.naturalWidth)) canvasEl(base, PW, PH, (g) => g.drawImage(P.base, 0, 0, PW, PH));
    else el('div', { position: 'absolute', left: '0', top: '0', bottom: '0', width: '330px', background: mix(c.paper, c.onPaper, 0.05), boxShadow: `inset -1px 0 0 ${rgba(c.onPaper, 0.09)}` }, base);
    const veil = el('div', { position: 'absolute', inset: '0' }, base);
    const layer = el('div', { position: 'absolute', inset: '0', transformStyle: 'preserve-3d' }, panel);
    const parts = D.parts.map((pt) => {
      const holder = el('div', { position: 'absolute', left: `${pt.x}px`, top: `${pt.y}px`, width: `${pt.w}px`, height: `${pt.h}px`, transformStyle: 'preserve-3d' }, layer);
      const shadow = canvasEl(holder, pt.w, pt.h, pt.paint), body = canvasEl(holder, pt.w, pt.h, pt.paint);
      return { holder, shadow, body };
    });
    const frame = el('canvas', { position: 'absolute', left: `${-PAD - M}px`, top: `${-PAD - M}px`, width: `${FW + 2 * M}px`, height: `${FH + 2 * M}px`, transform: 'translateZ(2px)' }, panel);
    frame.width = FW + 2 * M; frame.height = FH + 2 * M;
    return { root, bg, bgc: bg.getContext('2d'), stage, panel, echoes, rimEl, base, veil, parts, frame, fc: frame.getContext('2d'), blurTarget: null };
  },
  pose(Rg, S, P, D) {
    const c = P.colors, f = S.f;
    // the stage: the ground, a key light up left and a fill of the accent down right, a heavy vignette
    const g = Rg.bgc; g.setTransform(0.5, 0, 0, 0.5, 0, 0);
    g.fillStyle = c.ground; g.fillRect(0, 0, 1920, 1080);
    for (const [x, y, r, col, a] of [[576, 54, 1300, mix(c.ground, c.ink, 0.14), 0.9 * S.bg], [1632, 1026, 900, c.accent, 0.12 * S.bg]]) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); }
    const vg = g.createRadialGradient(960, 540, 380, 960, 540, 1150); vg.addColorStop(0, rgba(mix(c.ground, '#000000', 0.7), 0)); vg.addColorStop(1, rgba(mix(c.ground, '#000000', 0.7), 0.7)); g.fillStyle = vg; g.fillRect(0, 0, 1920, 1080);
    Rg.stage.style.perspectiveOrigin = `${n(S.origin, 3)}% ${S.together ? 44 : 45}%`;
    Rg.panel.style.transform = `translateY(${n(S.dy, 2)}px) scale(${n(S.scale)}) rotateY(${n(S.rotY, 3)}deg) rotateX(${n(S.rotX, 3)}deg) rotateZ(${n(S.rotZ, 3)}deg)`;
    ECHO.forEach((e, i) => {
      const a = (D.together ? strike(f, e.on) * S.bg : strike(f, e.on) * quench(f, e.off)) * (0.42 - e.k * 0.06) * (0.85 + 0.15 * Math.sin(f / 7 + e.k));
      Rg.echoes[i].style.opacity = n(clamp(a), 4);
    });
    Rg.rimEl.style.opacity = n(clamp(S.trace * 2), 4);
    Rg.rimEl.style.boxShadow = `0 40px 120px -10px ${rgba(mix(c.ground, '#000000', 0.8), 0.85)}, -30px -10px 80px 6px ${rgba(c.accent, 0.32 * S.rim)}, 30px 30px 90px 10px ${rgba(mix(c.accent, '#ffffff', 0.35), 0.26 * S.rim)}`;
    Rg.base.style.opacity = n(S.vis, 4);
    Rg.base.style.filter = S.lit < 0.995 ? `brightness(${n(Math.max(0.03, S.lit), 3)})` : 'none';
    const tint = mix(c.ground, c.accent, 0.25);
    Rg.veil.style.background = `linear-gradient(90deg, ${rgba(tint, 0)} ${n(lerp(-40, 100, S.lit), 2)}%, ${rgba(tint, 0.6)} ${n(lerp(0, 160, S.lit), 2)}%)`;
    D.parts.forEach((pt, i) => {
      const h = S.lifts[i], R = Rg.parts[i];
      R.shadow.style.display = h > 0.5 ? 'block' : 'none';
      R.shadow.style.transform = `translate3d(${n(h * 0.34, 2)}px, ${n(h * 0.5, 2)}px, 0.5px) scale(${n(1 + h * 0.0011)})`;
      R.shadow.style.filter = `brightness(0) blur(${n(2 + h * 0.12, 2)}px)`;
      R.shadow.style.opacity = n(clamp((0.42 - h * 0.0016) * S.lit * S.vis), 4);
      R.body.style.transform = `translateZ(${n(h + 1, 2)}px)`;
      R.body.style.opacity = n(S.vis, 4);
      R.body.style.filter = S.lit < 0.995 ? `brightness(${n(Math.max(0.04, S.lit), 3)})` : 'none';
    });
    // the main frame: two heads from the left-middle, one over the top and one under, meeting at the right-middle
    const fc = Rg.fc; fc.setTransform(1, 0, 0, 1, 0, 0); fc.clearRect(0, 0, FW + 2 * M, FH + 2 * M); fc.translate(M, M);
    if (S.trace > 0) {
      const h = S.trace * 0.5;
      tube(fc, c, [[0, h], [1 - h, 1]], { a: S.frameA, core: S.core });
      const head = (x, y, r, a) => { const gr = fc.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba('#ffffff', a)); gr.addColorStop(0.25, rgba(mix(c.accent, '#ffffff', 0.85), 0.9 * a)); gr.addColorStop(1, rgba(c.accent, 0)); fc.fillStyle = gr; fc.fillRect(x - r, y - r, 2 * r, 2 * r); };
      if (S.trace < 1) { const [x1, y1] = pointAt(h), [x2, y2] = pointAt(1 - h); head(x1, y1, 46, 1); head(x2, y2, 46, 1); }
      if (S.flash > 0.01) head(FW, FH / 2, 60 + 160 * S.meet, S.flash);
    } else if (!D.together && f < 3) {
      const gr = fc.createRadialGradient(0, FH / 2, 0, 0, FH / 2, 34); gr.addColorStop(0, rgba('#ffffff', 1)); gr.addColorStop(1, rgba(c.accent, 0)); fc.fillStyle = gr; fc.fillRect(-34, FH / 2 - 34, 68, 68);
    }
  },
  // the brand part and the last task (lifted), the panel's top-left corner, and the panel (middles of on-screen boxes)
  track(S, P, D) {
    const box = (x, y, w, h, z) => {
      const cs = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => project(x + u * w, y + v * h, z, S, P)), xs = cs.map((q) => q[0]), ys = cs.map((q) => q[1]);
      return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    };
    const at = (i) => { const pt = D.parts[i]; return box(pt.x, pt.y, pt.w, pt.h, S.lifts[i] + 1); };
    return [at(0), at(D.parts.length - 1), project(0, 0, 0, S, P), box(0, 0, PW, PH, 0)];
  },
  blur: () => false,
};
