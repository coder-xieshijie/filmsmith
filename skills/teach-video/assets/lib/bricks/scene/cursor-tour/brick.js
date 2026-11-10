// cursor-tour — a guided tour of one page: the camera looks down on the whole page, then flies to four of its parts in
// turn; at each one the cursor gets there first, aims for a beat and clicks, and the page answers (a range switches and
// its number and bars follow, a point opens its tooltip, a switch turns on, a row is ticked); then the camera pulls
// back and all four answers stand together.
// Adapted from video-shotcraft demos/camera/cursor-flyover/CursorFlyover.tsx (card references/shots/camera/cursor-flyover.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the cursor and its ripple are the prop cursor;
// colours by role (the accent for the answer at each stop: the switch's pill, the line, the switch's track, the tick);
// brand, wordmark and every word and figure of the page removed (titles, metas, the range labels, the two numbers, the
// tooltip, the switch rows and the table rows are slots, sample copy by default); the page is a 2400 × 1500 world of
// four panels as the upstream lays it out; the camera table (overview 0.66 → each panel 1.3, bezier 0.55, 0, 0.18, 1
// over 20 frames starting 2 frames after the cursor, an 8 % hop between panels, the 24-frame pull back and the 1 % creep
// at the end), the cursor (swift 16 frames along a light bow, a click 22 frames after it sets off, 40 px on screen), the
// 18-frame ripple, the 44-frame stop and each panel's answer are the upstream's.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, caseOf, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { springAt } from '../../motion/stagger-in/brick.js';
import { drawCursor, drawRipple } from '../../prop/cursor/brick.js';

const WW = 2400, WH = 1500, LEG0 = 22, LEG = 44, BACK = 198, END = 240;
const MOD = [{ x: 60, y: 150, w: 1120, h: 640 }, { x: 1220, y: 150, w: 1120, h: 640 }, { x: 1220, y: 830, w: 1120, h: 640 }, { x: 60, y: 830, w: 1120, h: 640 }];
const CH = { x: 64, y: 190, w: 992, h: 360 }, LY = [0.62, 0.55, 0.58, 0.46, 0.5, 0.4, 0.44, 0.33, 0.37, 0.24, 0.3, 0.18], HOT = 9;
const ptX = (i) => CH.x + (i / (LY.length - 1)) * CH.w, ptY = (i) => CH.y + LY[i] * CH.h;
const TARGETS = [
  { x: MOD[0].x + MOD[0].w - 40 - 60, y: MOD[0].y + 40 + 30 }, { x: MOD[1].x + ptX(HOT), y: MOD[1].y + ptY(HOT) },
  { x: MOD[2].x + MOD[2].w - 64 - 46, y: MOD[2].y + 196 + 31 }, { x: MOD[3].x + 100, y: MOD[3].y + 196 + 104 + 50 },
];
const CAMS = [{ x: WW / 2, y: WH / 2 + 30, s: 0.66 }, ...MOD.map((m) => ({ x: m.x + m.w / 2, y: m.y + m.h / 2, s: 1.3 }))];
const CAM_EASE = bez(0.55, 0, 0.18, 1);
const BARS_A = [0.42, 0.5, 0.46, 0.58, 0.52, 0.6, 0.55, 0.64, 0.6, 0.7, 0.66, 0.74], BARS_B = [0.3, 0.38, 0.45, 0.42, 0.55, 0.62, 0.58, 0.7, 0.76, 0.82, 0.88, 0.96];
const legStart = (k) => LEG0 + k * LEG, clickAt = (k) => legStart(k) + 22;
const resp = (f, k, dur = 16, e = EASE.snappy) => ramp(f, clickAt(k) + 2, dur, e);
const camAt = (f) => {
  let { x, y, s } = CAMS[0], hop = 0;
  s *= 0.94 + 0.06 * ramp(f, 0, 22, EASE.snappy);
  for (let k = 0; k < 4; k++) {
    const u = ramp(f, legStart(k) + 2, 20, CAM_EASE), to = CAMS[k + 1];
    x += (to.x - x) * u; y += (to.y - y) * u; s += (to.s - s) * u;
    if (k > 0 && u > 0 && u < 1) hop = 0.08 * Math.sin(Math.PI * u);
  }
  const b = ramp(f, BACK, 24, EASE.smooth);
  x += (CAMS[0].x - x) * b; y += (CAMS[0].y - y) * b; s += (CAMS[0].s - s) * b;
  return { x, y, s: s * (1 - hop) * (1 + 0.01 * ramp(f, 222, 18, EASE.smooth)) };
};
const cursorAt = (f) => {
  let x = WW / 2 + 40, y = WH / 2 + 80;
  for (let k = 0; k < 4; k++) {
    const u = ramp(f, legStart(k), 16, EASE.swift), to = TARGETS[k], dx = to.x - x, dy = to.y - y, len = Math.max(1, Math.hypot(dx, dy)), bow = Math.sin(Math.PI * u) * Math.min(90, len * 0.12);
    x = x + (to.x - x) * u + (-dy / len) * bow; y = y + (to.y - y) * u + (dx / len) * bow;
  }
  return { x, y };
};
const lim = (en, zh, w = 4) => ({ en: { words: w, chars: en }, zh: { chars: zh } });
const DEFAULT = {
  en: { product: 'Tidewell', nav: ['Overview', 'Projects', 'Renders', 'Notes'],
    stops: [{ title: 'Frames checked', meta: 'Past 4 weeks' }, { title: 'Renders', meta: 'Shots per week' }, { title: 'Release checks', meta: '2 of 3 on' }, { title: 'Most approved', meta: 'By approvals' }],
    range: ['7D', '30D', '90D'], numbers: ['3.1M', '4.8M'], tip: { value: '96', label: 'Wk 6' },
    switches: ['Beat grid', 'Auto review', 'Export check'], rows: [{ name: 'Opening', value: '1,248' }, { name: 'Weekly review', value: '982' }, { name: 'Exports', value: '640' }] },
  zh: { product: 'Tidewell', nav: ['概览', '项目', '渲染', '笔记'],
    stops: [{ title: '检查过的帧', meta: '最近 30 天' }, { title: '渲染', meta: '每周镜头数' }, { title: '发布检查', meta: '已开 2 项' }, { title: '最受认可', meta: '按认可数' }],
    range: ['7天', '30天', '90天'], numbers: ['3.1M', '4.8M'], tip: { value: '96', label: '第 6 周' },
    switches: ['节拍网格', '自动审阅', '导出检查'], rows: [{ name: '开场', value: '1,248' }, { name: '每周回顾', value: '982' }, { name: '导出', value: '640' }] },
};

export default {
  id: 'cursor-tour', kind: 'scene',
  fits: ['demo'],
  surface: ['canvas'],
  beats: { min: 14, max: 16 },
  needs: { motions: [], props: ['cursor'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    product: { type: 'text', tier: 'glance', limits: lim(14, 8, 2) },
    nav: { type: 'list', count: [0, 4], of: { type: 'text', tier: 'glance', limits: lim(10, 4, 1) } },
    stops: { type: 'list', count: [4, 4], of: { title: { type: 'text', tier: 'primary', limits: lim(16, 6, 3) }, meta: { type: 'text', tier: 'glance', limits: lim(16, 7, 4) } } },
    range: { type: 'list', count: [3, 3], of: { type: 'text', tier: 'glance', limits: lim(4, 3, 1) } },
    numbers: { type: 'list', count: [2, 2], of: { type: 'number', limits: lim(6, 6, 1) } },
    tip: { type: 'list', count: [1, 1], of: { value: { type: 'number', limits: lim(5, 5, 1) }, label: { type: 'text', tier: 'glance', limits: lim(6, 4, 2) } } },
    switches: { type: 'list', count: [3, 3], of: { type: 'text', tier: 'glance', limits: lim(14, 5, 2) } },
    rows: { type: 'list', count: [3, 3], of: { name: { type: 'text', tier: 'glance', limits: lim(14, 5, 2) }, value: { type: 'number', limits: lim(6, 6, 1) } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  summary: 'A guided tour of one page: the camera flies to four of its parts; at each the cursor arrives first, clicks, and the page answers; then the camera pulls back on all four answers.',
  defaults: (ctx = {}) => { const d = JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])); d.tip = [d.tip]; return d; },
  plan(s, ctx) {
    return { beats: 16, reads: s.stops.map((st) => ({ text: st.title, lang: ctx.lang })),
      cues: [0, 1, 2, 3].map((k) => ({ beat: clickAt(k) / 15, kind: 'accent' })).concat([{ beat: BACK / 15, kind: 'turn' }]),
      motion: 'camera stops at four panels; cursor leads, clicks', settled: (BACK + 24) / 15, peakAt: null, pause: (END - BACK - 24) / 15 };
  },
  validate(s, ctx) {
    const e = [];
    if ((s.stops || []).length !== 4) e.push('stops: four, one per panel');
    // a stop must be read while the camera holds on it (about 1 s): the title within ~2.5 s of reading at most
    (s.stops || []).forEach((st, i) => { if (readTime(st.title, ctx.lang) > 2.5) e.push(`stops[${i}].title: too long to read in one stop`); });
    return e;
  },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  shell(ctx, m, st, active, s) {
    const c = s.colors;
    ctx.save(); ctx.shadowColor = rgba(mix(c.ground, '#000000', 0.75), 0.1 + 0.08 * active); ctx.shadowBlur = 18 + 28 * active; ctx.shadowOffsetY = 6 + 10 * active;
    rrect(ctx, m.x, m.y, m.w, m.h, 28); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
    rrect(ctx, m.x + 0.75, m.y + 0.75, m.w - 1.5, m.h - 1.5, 27.25); ctx.strokeStyle = active > 0.01 ? mix(c.line, c.accent, 0.35 * active) : c.line; ctx.lineWidth = 1.5; ctx.stroke();
    text(ctx, st.title, m.x + 64, m.y + 56 + 34, this.F(s, 'display', 34, 650, 'display'), { color: c.ink });
    text(ctx, st.meta, m.x + 64, m.y + 104 + 28, this.F(s, 'text', s.lang === 'zh' ? 28 : 26, 500), { color: c.dim });
  },
  // ① a range switch: the pill slides to the last range, the number rolls over, twelve bars spring to new heights
  stop0(ctx, m, f, s) {
    const c = s.colors, sel = ramp(f, clickAt(0), 8, EASE.snappy), sw = 120, x0 = m.x + m.w - 40 - 3 * sw - 8, y0 = m.y + 40;
    rrect(ctx, x0, y0, 3 * sw + 8, 60, 30); ctx.fillStyle = mix(c.panel, c.ground, 0.7); ctx.fill();
    rrect(ctx, x0 + 4 + (1 + sel) * sw, y0 + 4, sw, 52, 26); ctx.fillStyle = c.accent; ctx.fill();
    s.range.forEach((r, i) => { const on = Math.max(0, 1 - Math.abs(1 + sel - i)); text(ctx, r, x0 + 4 + i * sw + sw / 2, y0 + 31, this.F(s, 'mono', s.lang === 'zh' ? 28 : 26, 600), { color: on > 0.5 ? c.onAccent : c.dim, align: 'center', baseline: 'middle' }); });
    const r = resp(f, 0), nf = this.F(s, 'display', 96, 750, 'display');
    ctx.save(); ctx.beginPath(); ctx.rect(m.x + 50, m.y + 160, 600, 120); ctx.clip();
    text(ctx, s.numbers[0], m.x + 64, m.y + 260 - r * 110, nf, { color: c.ink, alpha: 1 - r });
    text(ctx, s.numbers[1], m.x + 64, m.y + 260 + (1 - r) * 110, nf, { color: c.ink, alpha: r });
    ctx.restore();
    const bw = 992 / 12;
    for (let i = 0; i < 12; i++) {
      const k = springAt(f - (clickAt(0) + 2 + i * 1.5), { damping: 14, stiffness: 180 }), h = 260 * (BARS_A[i] + (BARS_B[i] - BARS_A[i]) * k);
      rrect(ctx, m.x + 64 + i * bw + 10, m.y + 590 - h, bw - 20, h, 8); ctx.fillStyle = i === 11 ? c.accent : mix(c.panel, c.dim, 0.35 + 0.25 * (i / 11)); ctx.fill();
    }
  },
  // ② a line: the clicked point grows, a guide drops to the axis, a tooltip pops with its value
  stop1(ctx, m, f, s) {
    const c = s.colors, r = resp(f, 1), pop = ramp(f, clickAt(1) + 2, 12, EASE.overshoot), X = (i) => m.x + ptX(i), Y = (i) => m.y + ptY(i);
    ctx.beginPath(); LY.forEach((_, i) => (i ? ctx.lineTo(X(i), Y(i)) : ctx.moveTo(X(i), Y(i)))); ctx.lineTo(X(11), m.y + CH.y + CH.h); ctx.lineTo(X(0), m.y + CH.y + CH.h); ctx.closePath(); ctx.fillStyle = rgba(c.accent, 0.1); ctx.fill();
    for (let k = 0; k < 4; k++) { ctx.fillStyle = c.line; ctx.fillRect(m.x + CH.x, m.y + CH.y + (CH.h / 3) * k, CH.w, 1.5); }
    ctx.beginPath(); LY.forEach((_, i) => (i ? ctx.lineTo(X(i), Y(i)) : ctx.moveTo(X(i), Y(i)))); ctx.strokeStyle = c.accent; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
    if (r > 0) { ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = rgba(c.accent, 0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(HOT), Y(HOT)); ctx.lineTo(X(HOT), Y(HOT) + (m.y + CH.y + CH.h - Y(HOT)) * r); ctx.stroke(); ctx.restore(); }
    ctx.beginPath(); ctx.arc(X(HOT), Y(HOT), 8 + 6 * r, 0, Math.PI * 2); ctx.fillStyle = c.panel; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.accent; ctx.stroke();
    if (pop > 0) {
      const tip = s.tip[0], vf = this.F(s, 'display', 48, 750, 'display'), lf = this.F(s, 'text', s.lang === 'zh' ? 28 : 26, 500), w = Math.max(measure(ctx, tip.value, vf).width, measure(ctx, tip.label, lf).width) + 48;
      ctx.save(); ctx.translate(X(HOT) + 24, Y(HOT) - 24); ctx.scale(pop, pop); ctx.globalAlpha = Math.min(1, pop * 3);
      ctx.shadowColor = rgba(mix(c.ground, '#000000', 0.7), 0.2); ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      rrect(ctx, 0, -120, w, 120, 18); ctx.fillStyle = c.ink; ctx.fill(); ctx.shadowColor = 'transparent';
      text(ctx, tip.value, 24, -60, vf, { color: c.panel }); text(ctx, tip.label, 24, -22, lf, { color: mix(c.panel, c.ink, 0.4) });
      ctx.restore();
    }
  },
  // ③ switches: the first one slides on (a spring), its track takes the accent, a rollout bar starts
  stop2(ctx, m, f, s) {
    const c = s.colors, k = springAt(f - (clickAt(2) + 1), { damping: 13, stiffness: 220 }), bar = resp(f, 2, 30, EASE.out);
    s.switches.forEach((name, i) => {
      const y = m.y + 196 + i * 104, on = i === 0 ? k : i === 1 ? 1 : 0;
      if (i) { ctx.fillStyle = c.line; ctx.fillRect(m.x + 64, y - 26, m.w - 128, 1.5); }
      text(ctx, name, m.x + 64, y + 42, this.F(s, 'text', 32, 550), { color: c.ink });
      const tx = m.x + m.w - 64 - 92;
      rrect(ctx, tx, y + 6, 92, 50, 25); ctx.fillStyle = mix(mix(c.panel, c.dim, 0.35), c.accent, clamp(on)); ctx.fill();
      ctx.beginPath(); ctx.arc(tx + 25 + 42 * on, y + 31, 20, 0, Math.PI * 2); ctx.fillStyle = c.panel; ctx.fill();
    });
    const by = m.y + 196 + 3 * 104 + 10;
    rrect(ctx, m.x + 64, by, m.w - 128, 10, 5); ctx.fillStyle = mix(c.panel, c.dim, 0.2); ctx.fill();
    if (bar > 0) { rrect(ctx, m.x + 64, by, (m.w - 128) * 0.25 * bar, 10, 5); ctx.fillStyle = mix(c.dim, c.ink, 0.3); ctx.fill(); }
    text(ctx, `${Math.round(25 * bar)}%`, m.x + m.w - 64, by + 48, this.F(s, 'mono', s.lang === 'zh' ? 28 : 26, 600), { color: c.dim, align: 'right' });
  },
  // ④ a table: the second row is picked: a tint, an accent bar at its left, its box ticked
  stop3(ctx, m, f, s) {
    const c = s.colors, r = resp(f, 3), tick = resp(f, 3, 12, EASE.out);
    s.rows.forEach((row, i) => {
      const y = m.y + 196 + i * 104, sel = i === 1 ? r : 0;
      if (sel > 0) { rrect(ctx, m.x + 40, y, m.w - 80, 100, 14); ctx.fillStyle = rgba(c.accent, 0.08 * sel); ctx.fill(); rrect(ctx, m.x + 40, y + 14, 6, 72 * sel, 3); ctx.fillStyle = c.accent; ctx.fill(); }
      rrect(ctx, m.x + 82, y + 32, 36, 36, 9); ctx.fillStyle = sel > 0.5 ? c.accent : c.panel; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = sel > 0.5 ? c.accent : mix(c.line, c.dim, 0.4); ctx.stroke();
      if (i === 1 && tick > 0) { ctx.save(); ctx.beginPath(); ctx.moveTo(m.x + 91, y + 50); ctx.lineTo(m.x + 97 + 2 * clamp(tick * 2), y + 50 + 6 * clamp(tick * 2)); if (tick > 0.5) ctx.lineTo(m.x + 99 + 12 * clamp(tick * 2 - 1), y + 56 - 14 * clamp(tick * 2 - 1)); ctx.strokeStyle = c.onAccent; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
      text(ctx, row.name, m.x + 140, y + 62, this.F(s, 'text', 32, 550), { color: c.ink });
      text(ctx, row.value, m.x + m.w - 64, y + 62, this.F(s, 'mono', 30, 600), { color: c.dim, align: 'right' });
    });
  },
  paint(ctx, u, s, cx, D) {
    const c = s.colors, f = u * 15, cam = camAt(f);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(960 - cam.x * cam.s, 540 - cam.y * cam.s); ctx.scale(cam.s, cam.s);
    // the page's top bar: a mark, the product, the nav
    rrect(ctx, 60, 44, 56, 56, 16); ctx.fillStyle = c.accent; ctx.fill();
    text(ctx, s.product, 136, 84, this.F(s, 'display', 38, 700, 'display'), { color: c.ink });
    let nx = WW - 60; [...(s.nav || [])].reverse().forEach((n, i) => { const nf = this.F(s, 'text', 30, 550), w = measure(ctx, n, nf).width; text(ctx, n, nx, 84, nf, { color: i === s.nav.length - 1 ? c.ink : c.dim, align: 'right' }); nx -= w + 48; });
    MOD.forEach((m, k) => {
      const a = ramp(f, legStart(k) + 2, 20, EASE.smooth) * (1 - (k < 3 ? ramp(f, legStart(k + 1) + 2, 20, EASE.smooth) : ramp(f, BACK, 24, EASE.smooth)));
      this.shell(ctx, m, s.stops[k], a, s);
      this[`stop${k}`](ctx, m, f, s);
    });
    ctx.restore();
    // the cursor, in screen space (40 px whatever the zoom), and the ripple of each click
    const cu = cursorAt(f), sx = 960 + (cu.x - cam.x) * cam.s, sy = 540 + (cu.y - cam.y) * cam.s;
    let press = 0;
    for (let k = 0; k < 4; k++) {
      const t = f - clickAt(k);
      if (t >= 0 && t < 18) drawRipple(ctx, sx, sy, t / 18, { colors: c, r: 60, rings: 1, width: 3 });
      if (t >= 0 && t < 3) press = t / 3; else if (t >= 3 && t < 9) press = Math.max(press, 1 - (t - 3) / 6);
    }
    drawCursor(ctx, sx, sy, { h: 40, form: 'solid', press, colors: c });
  },
  // no sub-frame blur: at the runtime's shutter (0.5) the flying page smears into a defocus (the upstream caps its
  // directional blur at 8 px and warns that more reads as out of focus)
  blur() { return false; },
  // the next target and the cursor's tip on screen
  track(u) {
    const f = u * 15, cam = camAt(f), k = clamp(Math.floor((f - LEG0) / LEG), 0, 3), T = TARGETS[k], cu = cursorAt(f);
    return [[960 + (T.x - cam.x) * cam.s, 540 + (T.y - cam.y) * cam.s], [960 + (cu.x - cam.x) * cam.s, 540 + (cu.y - cam.y) * cam.s]];
  },
};
