// graze-tour — the camera flies low over the surface of a product page in three legs (a side tree, the top bar, a
// list), tilted almost edge-on; the page's words hover above it with soft shadows and land in the order the camera
// passes them, so the page completes itself as it is flown over.
// Adapted from video-shotcraft demos/camera/graze-face-tour/GrazeFaceTour.tsx (card references/shots/camera/graze-face-tour.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion): three CSS 3D planes, each a canvas repainted on every
// pose with its page and the motion brick float-land (the hovering words, their same-shape shadows and the fall are
// its own); colours by role (the page in panel, ground and line, the neon edge, the background frames and the
// selection in the accent); brand, wordmark, icons and every word removed (the tree, the tabs and title, the rows are
// slots, sample copy by default; icons are plain role-coloured marks); the screen-space depth-of-field blur and the
// grain are left out (the far end of each plane darkens instead); the three camera legs (tilt, turn, roll ±1°, scale,
// path), the cruise curve with its eased first and last thirds and its linear run into the 7-frame cross-fades, the
// neon edge and the drifting background frames are the upstream's.
import { clamp, mix, rgba, rrect, text } from '../../../handoffs/util.js';
import { el, n } from '../../dom.js';
import { fontFor, caseOf, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import land from '../../motion/float-land/brick.js';

const PW = 2900, PH = 2400, M = 160, PERSP = 1050, ORIGIN = [960, 0.46 * 1080], SEG = 50, FADE = 7;
const CAMS = [
  { rx: 12, ry: 30, rz: -6, s: 0.95, x: [1450 - 950, 1450 - 880], y: [1200 - 1050, 1200 - 1850], edge: 'left' },
  { rx: 20, ry: -20, rz: 6, s: 0.95, x: [1450 - 800, 1450 - 2000], y: [1050 - 350, 1050 - 800], edge: 'top' },
  { rx: 14, ry: 28, rz: -5, s: 1.05, x: [1450 - 900, 1450 - 680], y: [1100 - 620, 1100 - 1240], edge: 'left' },
];
// the cruise: the first leg eases in over its first 30 %, the last eases out over its last 30 %, the middle runs at a
// constant speed, and outside [0, 1] (the cross-fades) every leg runs on at its end speed, so no leg ever stops
const cruise = (u, first, last) => {
  const A = 0.3, k = 1 / (1 - (first ? A / 2 : 0) - (last ? A / 2 : 0)), inPart = (x) => (x < A ? (x * x) / (2 * A) : x - A / 2);
  if (first && u <= A) return k * inPart(Math.max(0, u));
  if (last && u >= 1 - A) return 1 - k * inPart(Math.max(0, 1 - u));
  return first ? k * inPart(u) : k * u;
};
const rad = (d) => (d * Math.PI) / 180;
const DEFAULT = {
  en: { product: 'Tidewell', section: 'Spaces', tree: ['Drafts', 'Reviews', 'Renders', 'Notes', 'Weekly review', 'Exports', 'Plan', 'Draft', 'Review', 'Ship'],
    tabs: ['Overview', 'Projects', 'Renders', 'Notes'], title: 'Good morning', subtitle: '6 projects · 2 rendered today',
    rows: [{ name: 'Drafts', meta: '12 items' }, { name: 'Reviews', meta: '8 open' }, { name: 'Renders', meta: '21 queued' }, { name: 'Notes', meta: '5 new' }, { name: 'Weekly review', meta: '9 checks' }, { name: 'Exports', meta: '14 files' }] },
  zh: { product: 'Tidewell', section: '空间', tree: ['草稿', '审阅', '渲染', '笔记', '每周回顾', '导出', '规划', '起稿', '审阅中', '发布'],
    tabs: ['概览', '项目', '渲染', '笔记'], title: '早上好', subtitle: '6 个项目 · 今天渲染了 2 个',
    rows: [{ name: '草稿', meta: '12 项' }, { name: '审阅', meta: '8 个待办' }, { name: '渲染', meta: '21 个排队' }, { name: '笔记', meta: '5 条新' }, { name: '每周回顾', meta: '9 项检查' }, { name: '导出', meta: '14 个文件' }] },
};
const T = (en, zh, w = 3) => ({ type: 'text', tier: 'glance', limits: { en: { words: w, chars: en }, zh: { chars: zh } } });

export default {
  id: 'graze-tour', kind: 'scene',
  fits: ['demo', 'hook'],
  surface: ['dom'],
  beats: { min: 10, max: 10 },
  beatsFor: () => 10,
  needs: { motions: ['float-land'], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'text'] },
  slots: {
    product: T(14, 8, 2), section: T(10, 4, 1),
    tree: { type: 'list', count: [6, 10], of: T(14, 5) },
    tabs: { type: 'list', count: [3, 5], of: T(10, 4, 1) },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } },
    subtitle: T(32, 16, 7),
    rows: { type: 'list', count: [4, 6], of: { name: T(14, 5), meta: T(10, 6) } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'The camera flies low over a product page in three legs, almost edge-on; the page\'s words hover with soft shadows and land as the camera passes them.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    return { beats: 10, reads: [{ text: s.title, lang: ctx.lang }], cues: [0, 1, 2].map((i) => ({ beat: (i * SEG) / 15, kind: i ? 'turn' : 'accent' })),
      motion: 'three grazing camera legs; words land as the camera passes', settled: 150 / 15, peakAt: null, pause: 0 };
  },
  validate(s, ctx) { return readTime(s.title, ctx.lang) > 1.6 ? ['title: too long to read in one leg'] : []; },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  // the three pages: a painter of the surface and the pieces float-land lands, in the plane's px
  pages(s) {
    const c = s.colors, info = s.lang === 'zh' ? 1.12 : 1, mark = (g, x, y, w, h, on) => { rrect(g, x, y, w, h, 12); g.fillStyle = on ? c.accent : mix(c.panel, c.dim, 0.3); g.fill(); };
    const base = (g) => { g.fillStyle = c.panel; g.fillRect(0, 0, PW, PH); };
    const P = (t, x, y, size, weight, role, color, align) => ({ text: t, x, y, size: Math.round(size * (role === 'display' ? 1 : info)), weight, role, color, align });
    const tree = {
      surface: (g) => {
        base(g); g.fillStyle = mix(c.panel, c.ground, 0.55); g.fillRect(0, 0, 1180, PH); g.fillStyle = c.line; g.fillRect(1180, 0, 3, PH);
        mark(g, 120, 130, 96, 96, true);
        s.tree.forEach((_, i) => { const y = 470 + i * 150; mark(g, 140, y - 46, 56, 56, i === 3); if (i === 3) { rrect(g, 90, y - 80, 1040, 124, 26); g.fillStyle = rgba(c.accent, 0.1); g.fill(); } });
        for (let k = 0; k < 6; k++) { rrect(g, 1320, 200 + k * 360, 1440, 300, 36); g.fillStyle = mix(c.panel, c.ground, 0.35); g.fill(); }
      },
      pieces: [P(s.product, 250, 200, 72, 700, 'display', 'ink'), P(caseOf(s.section, s.look || NEUTRAL, 'label', s.lang).text, 140, 360, 44, 650, 'text', 'dim'),
        ...s.tree.map((t, i) => P(t, 240, 470 + i * 150, 60, i === 3 ? 650 : 550, 'text', i === 3 ? 'accent' : 'ink'))],
    };
    const nav = {
      surface: (g) => {
        base(g); g.fillStyle = mix(c.panel, c.ground, 0.55); g.fillRect(0, 0, PW, 260); g.fillStyle = c.line; g.fillRect(0, 260, PW, 3);
        s.tabs.forEach((_, i) => { const x = 160 + i * 560; if (!i) { rrect(g, x - 50, 60, 500, 150, 30); g.fillStyle = c.panel; g.fill(); } mark(g, x, 108, 54, 54, !i); });
        for (let k = 0; k < 3; k++) { rrect(g, 200 + k * 860, 1180, 780, 900, 40); g.fillStyle = mix(c.panel, c.ground, 0.35); g.fill(); }
      },
      pieces: [...s.tabs.map((t, i) => P(t, 160 + i * 560 + 80, 152, 52, i ? 550 : 650, 'text', i ? 'dim' : 'ink')),
        P(s.title, 200, 640, 170, 750, 'display', 'ink'), P(s.subtitle, 200, 790, 60, 500, 'text', 'dim')],
    };
    const list = {
      surface: (g) => {
        base(g); g.fillStyle = mix(c.panel, c.ground, 0.4); g.fillRect(0, 320, PW, 110);
        s.rows.forEach((_, i) => { const y = 520 + i * 190; g.fillStyle = c.line; g.fillRect(100, y + 70, PW - 200, 3); rrect(g, 140, y - 50, 64, 64, 14); g.lineWidth = 5; g.strokeStyle = i === 1 ? c.accent : mix(c.line, c.dim, 0.4); g.stroke(); if (i === 1) { g.fillStyle = c.accent; g.fill(); } rrect(g, 1700, y - 56, 300, 76, 38); g.fillStyle = i === 1 ? rgba(c.accent, 0.14) : mix(c.panel, c.ground, 0.45); g.fill(); });
      },
      pieces: s.rows.flatMap((r, i) => [P(r.name, 260, 520 + i * 190, 60, 600, 'text', 'ink'), P(r.meta, 1850, 512 + i * 190, 44, 600, 'text', i === 1 ? 'accent' : 'dim', 'center')]),
    };
    return [tree, nav, list];
  },
  prepare(s) {
    const pages = this.pages(s);
    const P = pages.map((pg) => ({ colors: s.colors, look: s.look || NEUTRAL, lang: s.lang, surface: pg.surface, pieces: pg.pieces, lift: 130, first: 0.22, span: 0.62, fall: 0.34 }));
    return { P, D: P.map((p) => land.prepare(p)) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  // each leg: its camera (cruise, extrapolated into the fades), the pieces' heights, its opacity
  at(p, P, D) {
    const f = clamp(p) * 150;
    const legs = CAMS.map((cam, i) => {
      const local = f - i * SEG, u = local / SEG, t = clamp(u), q = cruise(u, i === 0, i === CAMS.length - 1);
      const fin = i === 0 ? 1 : clamp((local + FADE) / FADE), fout = i === CAMS.length - 1 ? 1 : clamp((SEG - local) / FADE);
      return { on: Math.min(fin, fout), q, x: cam.x[0] + (cam.x[1] - cam.x[0]) * q, y: cam.y[0] + (cam.y[1] - cam.y[0]) * q, roll: cam.rz + (q - 0.5) * 2, h: land.at(t, D.P[i], D.D[i]).h };
    });
    return { p, f, legs };
  },
  build(root, P, D) {
    const c = P.colors, stageBg = mix(c.ground, '#000000', 0.82);
    root.style.background = stageBg;
    const bg = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root); bg.width = 1920; bg.height = 1080;
    const legs = CAMS.map(() => {
      const wrap = el('div', { position: 'absolute', inset: '0', perspective: `${PERSP}px`, perspectiveOrigin: `${ORIGIN[0]}px ${ORIGIN[1]}px`, overflow: 'hidden' }, root);
      const world = el('div', { position: 'absolute', left: '960px', top: '540px', width: '0', height: '0', transformStyle: 'preserve-3d' }, wrap);
      const mover = el('div', { position: 'absolute', left: '0', top: '0', width: '0', height: '0', transformStyle: 'preserve-3d' }, world);
      const cv = el('canvas', { position: 'absolute', left: `${-PW / 2 - M}px`, top: `${-PH / 2 - M}px`, width: `${PW + 2 * M}px`, height: `${PH + 2 * M}px` }, mover);
      cv.width = PW + 2 * M; cv.height = PH + 2 * M;
      return { wrap, world, mover, cv, g: cv.getContext('2d', { willReadFrequently: true }) };
    });
    // the vignette over everything, tinted from the stage
    const vg = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root); vg.width = 1920; vg.height = 1080;
    const g = vg.getContext('2d'), r = g.createRadialGradient(ORIGIN[0], ORIGIN[1], 300, ORIGIN[0], ORIGIN[1], 1250);
    r.addColorStop(0, rgba(stageBg, 0)); r.addColorStop(1, rgba(stageBg, 0.62)); g.fillStyle = r; g.fillRect(0, 0, 1920, 1080);
    return { root, bg, bgc: bg.getContext('2d'), legs, blurTarget: null };
  },
  pose(R, S, P, D) {
    const c = P.colors, stageBg = mix(c.ground, '#000000', 0.82), b = R.bgc;
    b.setTransform(1, 0, 0, 1, 0, 0); b.fillStyle = stageBg; b.fillRect(0, 0, 1920, 1080);
    S.legs.forEach((L, i) => {
      const r = R.legs[i], cam = CAMS[i], vis = L.on > 0.001;
      r.wrap.style.opacity = n(L.on, 4); r.wrap.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      // the background frames, drifting against the camera (screen space, under the planes)
      b.save(); b.globalAlpha = L.on;
      [[-140 + L.q * 60, 240, 620, 380, 0.42], [60 + L.q * 36, 700, 420, 260, 0.32], [1400 - L.q * 50, 120, 560, 300, 0.3]].forEach(([x, y, w, h, a]) => {
        b.save(); b.shadowColor = rgba(c.accent, a); b.shadowBlur = 24; rrect(b, x, y, w, h, 32); b.lineWidth = 3; b.strokeStyle = rgba(c.accent, a); b.stroke(); b.restore();
      });
      b.restore();
      r.world.style.transform = `scale(${n(cam.s)}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) rotateZ(${n(L.roll)}deg)`;
      r.mover.style.transform = `translate3d(${n(L.x, 3)}px,${n(L.y, 3)}px,0px)`;
      // the page and its landing words (float-land), the neon edge and the far end's shade
      const g = r.g;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PW + 2 * M, PH + 2 * M);
      g.save(); g.filter = 'blur(60px)'; g.fillStyle = rgba(c.accent, 0.8);
      if (cam.edge === 'left') g.fillRect(M - 90, M - 40, 110, PH * 1.04); else g.fillRect(M - 40, M - 90, PW * 1.04, 110);
      g.restore();
      g.fillStyle = mix(c.accent, '#FFFFFF', 0.55);
      if (cam.edge === 'left') g.fillRect(M - 7, M, 6, PH); else g.fillRect(M + 48, M - 7, PW - 96, 6);
      g.save(); g.translate(M, M); g.beginPath(); g.rect(0, 0, PW, PH); g.clip();
      land.paint(g, { h: L.h }, D.P[i], D.D[i]);
      const sh = cam.edge === 'left' ? g.createLinearGradient(0, 0, PW, PW * Math.tan(rad(15))) : g.createLinearGradient(0, 0, PH * Math.tan(rad(5)), PH);
      sh.addColorStop(0.34, rgba(stageBg, 0)); sh.addColorStop(0.75, rgba(stageBg, 0.22)); sh.addColorStop(1, rgba(stageBg, 0.5));
      g.fillStyle = sh; g.fillRect(0, 0, PW, PH);
      g.restore();
    });
  },
  // the first piece of the leg in view, on screen: its landing anchor through the leg's camera and the perspective
  track(S, P, D) {
    const i = clamp(Math.floor(S.f / SEG), 0, 2), L = S.legs[i], cam = CAMS[i], pc = D.D[i].pieces[0];
    let x = pc.x - PW / 2 - L.h[0] * 0.34 + L.x, y = pc.y - PH / 2 - L.h[0] * 0.78 + L.y, z = 0;
    const rz = rad(L.roll), ry = rad(cam.ry), rx = rad(cam.rx);
    [x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)];
    [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
    [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
    x *= cam.s; y *= cam.s; z *= cam.s;
    const X = 960 + x, Y = 540 + y, k = PERSP / (PERSP - z);
    return [[ORIGIN[0] + (X - ORIGIN[0]) * k, ORIGIN[1] + (Y - ORIGIN[1]) * k]];
  },
  blur: () => false,
};
