// scan-read — a machine reads a page: one line crosses the page at a constant speed with a read wash behind it, and
// each block it passes the foot of is framed by four corners collapsing onto it on a spring, flashed, and named by a
// small machine label that types itself out; a status row above counts the signals (00 / 06 → 06 / 06) and turns to
// done when the last one is read, while the camera pushes in very slowly.
// Adapted from video-shotcraft demos/effects/scanline-annotate-focus/ScanlineAnnotateFocus.tsx (card
// references/shots/effects/scanline-annotate-focus.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the line, its wash, dots and timing are
// scan-line's `line` mode (lightAt, and crossAt for the frame a block fires), the corners are reticle-lock's painted in
// place (fly [0, 0], grow 76 px → 0 on the upstream's spring, arm 40 → 26); the analysed page is a slot (`page`, the
// film's screenshot of the window's size, with `rects` placing its blocks and `targets` naming them), the neutral page drawn from the sample
// copy keeps the upstream's layout (logo, nav, two-line headline, body, call to action, hero picture, swatches) so its
// blocks (the `rects` param) fall where the upstream's do; brand, demo site, vase illustration and every label removed: the labels, the
// status words and the URL are slots with English and Chinese defaults; colours by role (the page in its own roles,
// the machine in the accent); labels measured, not counted in monospace cells, so Chinese labels fit.
import { clamp, lerp, mix, rgba, rrect, measure, text, scratch, canvasOf } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, graphemes, readTime, units, wrap } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';
import SCAN, { crossAt } from '../../motion/scan-line/brick.js';
import RETICLE from '../../motion/reticle-lock/brick.js';
import { springAt } from '../../motion/stagger-in/brick.js';
import { figure } from '../../prop/tile-card/brick.js';
import { drawMark } from '../mark-lockup/brick.js';

const WIN = { x: 180, y: 168, w: 1560, h: 840, chrome: 52 }, LINE = { mode: 'line', over: [-20, 20], wash: 140, dots: true, radius: 20 };
const TAG_H = 50, PUSH = [960, 0.54 * 1080];
const PLACES = {   // where the neutral page's blocks sit (page px, the window's top-left at 0, 0) and where each label goes
  logo: { x: 48, y: 64, w: 344, h: 66, tag: 'right' }, nav: { x: 1000, y: 64, w: 512, h: 66, tag: 'belowRight' }, h1: { x: 48, y: 222, w: 722, h: 262, tag: 'above' },
  cta: { x: 48, y: 632, w: 408, h: 88, tag: 'right' }, hero: { x: 892, y: 216, w: 620, h: 532, tag: 'below' }, palette: { x: 48, y: 756, w: 220, h: 66, tag: 'right' },
};
const LABELS = {
  en: { logo: ['LOGO', 'Wordmark'], nav: ['NAV', '4 links'], h1: ['H1', '2 lines'], cta: ['CTA', 'Primary'], hero: ['HERO', 'Chart'], palette: ['PALETTE', '4 roles'] },
  zh: { logo: ['标志', '字标'], nav: ['导航', '4 个链接'], h1: ['标题', '两行'], cta: ['按钮', '主操作'], hero: ['主图', '图表'], palette: ['色板', '4 个角色'] },
};
const LIM = { head: { en: { words: 1, chars: 8 }, zh: { chars: 3 } }, detail: { en: { words: 3, chars: 18 }, zh: { chars: 6 } }, status: { en: { words: 2, chars: 12 }, zh: { chars: 4 } }, cta: { en: { words: 3, chars: 18 }, zh: { chars: 6 } } };

// the scene frame at which the line reaches page y (scan-line's line mode runs its frames 2–88 of the upstream)
const fireAt = (y) => crossAt(WIN.y + y, { ...LINE, rect: [WIN.x, WIN.y, WIN.w, WIN.h] }) * 86 + 2;
const firing = (targets) => { let prev = -99; const out = targets.map((t) => ({ ...t })); for (const t of [...out].sort((a, b) => a.y + a.h - (b.y + b.h))) { t.ft = Math.max(fireAt(t.y + t.h), prev + 4); prev = t.ft; } return out; };
const timing = (T, lang) => { const last = Math.max(...T.map((t) => t.ft)), tail = T.map((t) => `${t.head} ${t.detail}`).join(' '); const end = Math.max(150, Math.round(last + 14 + Math.min(3, readTime(tail, lang) * 0.4) * 30)); return { last, end, beats: Math.ceil(end / 15) }; };

// The neutral page (when the film gives no screenshot): browser chrome, logo, nav, a two-line headline, body, a call to
// action, a hero picture and four swatches, all in the page's roles from the sample copy.
const pageOf = (s, C, L) => {
  const cv = canvasOf(WIN.w, WIN.h), x = cv.getContext('2d'), g = scratch(), paper = mix(C.panel, C.ground, 0.3);
  x.fillStyle = paper; x.fillRect(0, 0, WIN.w, WIN.h);
  x.fillStyle = mix(C.panel, C.ground, 0.75); x.fillRect(0, 0, WIN.w, WIN.chrome); x.fillStyle = C.line; x.fillRect(0, WIN.chrome - 1, WIN.w, 1);
  for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(30 + i * 22, 26, 6, 0, Math.PI * 2); x.fillStyle = rgba(C.ink, 0.16); x.fill(); }
  rrect(x, WIN.w / 2 - 260, 11, 520, 30, 8); x.fillStyle = rgba(C.panel, 0.7); x.fill(); x.strokeStyle = C.line; x.lineWidth = 1; x.stroke();
  text(x, s.url, WIN.w / 2, 32, fontFor(NEUTRAL, 'mono', L, 18, 500), { color: C.dim, align: 'center' });
  drawMark(x, 57 + 28, 70 + 28, 56, s);
  text(x, copy('product', L), 57 + 56 + 12, 70 + 28 + 12, fontFor(NEUTRAL, 'display', L, 34, 700), { color: C.ink });
  const nf = fontFor(NEUTRAL, 'text', L, 28, 550), nav = copy('nav', L), nw = nav.map((n) => measure(g, n, nf).width); let nx = WIN.w - 64 - nw.reduce((a, b) => a + b, 0) - 46 * (nav.length - 1);
  nav.forEach((n, i) => { text(x, n, nx, 84 + 28, nf, { color: i === nav.length - 1 ? C.ink : C.dim }); nx += nw[i] + 46; });
  // the headline: the claim in at most two lines of up to 120 px, the last word in the accent
  let hf = fontFor(NEUTRAL, 'display', L, 120, 850, 'display'), lines = wrap(g, s.headline, hf, 800, L);
  while ((lines.length > 2 || lines.some((l) => measure(g, l, hf).width > 800)) && hf.size > 64) { hf = { ...hf, size: hf.size - 4 }; lines = wrap(g, s.headline, hf, 800, L); }
  lines.forEach((l, i) => text(x, l, 60, 236 + hf.size * 0.82 + i * hf.size, hf, { color: i === lines.length - 1 ? C.accent : C.ink }));
  const bf = fontFor(NEUTRAL, 'text', L, 34, 450); wrap(g, copy('titleLong', L), bf, 700, L).slice(0, 2).forEach((l, i) => text(x, l, 64, 512 + 34 + i * 46, bf, { color: C.dim }));
  const cf = fontFor(NEUTRAL, 'text', L, 30, 650), cw = measure(g, s.cta, cf).width;
  x.save(); x.shadowColor = rgba(mix(C.accent, '#000000', 0.5), 0.45); x.shadowBlur = 24; x.shadowOffsetY = 10; rrect(x, 64, 644, cw + 68 + 30, 64, 32); x.fillStyle = C.accent; x.fill(); x.restore();
  text(x, s.cta, 64 + 34, 644 + 32 + 11, cf, { color: C.onAccent });
  x.strokeStyle = C.onAccent; x.lineWidth = 2.6; x.lineCap = 'round'; x.beginPath(); const ax = 64 + 34 + cw + 14; x.moveTo(ax, 676); x.lineTo(ax + 20, 676); x.moveTo(ax + 13, 669); x.lineTo(ax + 20, 676); x.lineTo(ax + 13, 683); x.stroke();
  [C.ground, C.dim, C.accent, C.line].forEach((col, i) => { x.beginPath(); x.arc(64 + 21 + i * 54, 768 + 21, 21, 0, Math.PI * 2); x.fillStyle = col; x.fill(); x.strokeStyle = rgba(C.ink, 0.12); x.lineWidth = 1; x.stroke(); });
  x.save(); rrect(x, 900, 224, 604, 516, 22); x.clip();
  figure(x, 'wave', 900, 224, 604, 516, C, { lit: 1, seed: 5, ground: mix(C.panel, C.accent, 0.14) });
  const pf = fontFor(NEUTRAL, 'text', L, 24, 600), pt = copy('detailTitle', L), pw = measure(g, pt, pf).width;
  rrect(x, 928, 740 - 26 - 50, pw + 36 + 26, 50, 14); x.fillStyle = rgba(C.panel, 0.86); x.fill();
  x.beginPath(); x.moveTo(946, 675); x.lineTo(960, 689); x.lineTo(946, 703); x.closePath(); x.fillStyle = C.ink; x.fill();
  text(x, pt, 972, 689 + 9, pf, { color: C.ink });
  x.restore();
  return cv;
};

export default {
  id: 'scan-read', kind: 'scene',
  fits: ['demo', 'proof', 'problem'],
  surface: ['canvas'],
  beats: { min: 10, max: 12 },
  needs: { motions: ['scan-line', 'reticle-lock', 'stagger-in'], props: ['tile-card'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent', 'paper'], type: ['display', 'text', 'mono'] },
  slots: {
    page: { type: 'image', crop: true, optional: true },
    targets: { type: 'list', count: [2, 6], of: { head: { type: 'text', tier: 'glance', limits: LIM.head }, detail: { type: 'text', tier: 'glance', limits: LIM.detail } } },
    reading: { type: 'text', tier: 'glance', limits: LIM.status }, done: { type: 'text', tier: 'glance', limits: LIM.status }, counter: { type: 'text', tier: 'glance', limits: LIM.status },
    headline: { type: 'text', tier: 'glance', sample: 'claim', limits: { en: { words: 6, chars: 30 }, zh: { chars: 12 } } },
    cta: { type: 'text', tier: 'glance', limits: LIM.cta }, url: { type: 'code' }, mark: { type: 'image', optional: true },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent', 'paper'],
  summary: 'One line crosses a page at a constant speed; each block it passes is framed by corners collapsing onto it and named by a machine label typing itself out, while a status row counts the signals read.',
  defaults: (ctx = {}) => {
    const L = ctx.lang === 'zh' ? 'zh' : 'en', zh = L === 'zh';
    return { page: null, targets: Object.keys(PLACES).map((k) => ({ head: LABELS[L][k][0], detail: LABELS[L][k][1] })), rects: Object.values(PLACES).map((p) => [p.x, p.y, p.w, p.h, p.tag]),
      reading: zh ? '读取中' : 'READING', done: zh ? '读完' : 'READ', counter: zh ? '信号' : 'SIGNALS', headline: copy('claim', L), cta: zh ? '开始渲染' : 'Start a render', url: copy('path', L), mark: null };
  },
  plan(s, ctx) {
    const T = timing(firing(this.blocks(s)), ctx.lang);
    return { beats: T.beats, reads: s.targets.map((t) => ({ text: `${t.head} ${t.detail}`, lang: ctx.lang })),
      cues: [{ beat: 6 / 15, kind: 'turn' }, { beat: (T.last + 8) / 15, kind: 'land' }], motion: 'a line reads the page; corners lock on block by block; slow push',
      settled: (T.last + 14) / 15, peakAt: (T.last + 8) / 15, pause: (T.end - T.last - 14) / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en', over = (v, lim) => v && units(v, L) > (L === 'zh' ? lim.zh.chars : lim.en.words);
    const n = (s.targets || []).length; if (n < 2 || n > 6) err.push('targets: 2 to 6 blocks');
    if (!Array.isArray(s.rects) || s.rects.length < n || s.rects.slice(0, n).some((r) => !Array.isArray(r) || r.length < 4)) err.push('rects: one [x, y, w, h, tag?] in page px per target');
    (s.targets || []).forEach((t, i) => { if (over(t.head, LIM.head)) err.push(`targets[${i}].head too long`); if (over(t.detail, LIM.detail)) err.push(`targets[${i}].detail too long`); });
    for (const k of ['reading', 'done', 'counter']) if (over(s[k], LIM.status)) err.push(`${k} too long`);
    if (over(s.cta, LIM.cta)) err.push('cta too long');
    return err;
  },
  prepare(s, ctx) {
    const L = ctx.lang, C = s.colors, g = scratch(), tf = fontFor(NEUTRAL, 'mono', L, 32, 600), tb = { ...tf, weight: 750 };
    const targets = firing(this.blocks(s));
    for (const t of targets) { t.full = graphemes(`${t.head} · ${t.detail}`); t.nh = graphemes(t.head).length; t.cum = [0]; for (let k = 1; k <= t.full.length; k++) t.cum.push(measure(g, t.full.slice(0, Math.min(k, t.nh)).join(''), tb).width + (k > t.nh ? measure(g, t.full.slice(t.nh, k).join(''), tf).width : 0)); t.w0 = t.cum[t.full.length] + 34; }
    let pg = null;
    if (s.page && (s.page.width || s.page.naturalWidth)) { pg = canvasOf(WIN.w, WIN.h); const x = pg.getContext('2d'), iw = s.page.naturalWidth || s.page.width, ih = s.page.naturalHeight || s.page.height, k = Math.max(WIN.w / iw, WIN.h / ih); x.drawImage(s.page, (WIN.w - iw * k) / 2, 0, iw * k, ih * k); }
    else pg = pageOf(s, C, L);
    return { targets, page: pg, tf, tb, sf: fontFor(NEUTRAL, 'mono', L, 30, 600), sl: fontFor(NEUTRAL, 'mono', L, 30, 500), yf: fontFor(NEUTRAL, 'mono', L, 22, 600), T: timing(targets, L) };
  },
  // the blocks: target i's label on rect i ([x, y, w, h, tag] in page px; tag right | above | below | belowRight)
  blocks(s) { return s.targets.map((t, i) => { const r = s.rects[i]; return { x: r[0], y: r[1], w: r[2], h: r[3], tag: r[4] || 'right', head: t.head, detail: t.detail }; }); },
  push(f, D) { return 1 + 0.035 * ramp(f, 0, D.T.end, EASE.swift); },
  // a label's box at frame f: where it sits, how wide it has grown, how many characters are typed
  label(t, f) {
    const s0 = t.ft + 5; if (f < s0) return null;
    const typedF = Math.min(t.full.length, (f - s0) * 2.2 + 1), n = Math.floor(typedF), wNow = Math.min(t.w0, lerp(t.cum[Math.floor(typedF)], t.cum[Math.min(t.full.length, Math.floor(typedF) + 1)], typedF % 1) + 34);
    let x = t.x, y = t.y;
    if (t.tag === 'right') { x = t.x + t.w + 16; y = t.y + (t.h - TAG_H) / 2; } else if (t.tag === 'above') y = t.y - TAG_H - 10; else if (t.tag === 'below') y = t.y + t.h + 12; else if (t.tag === 'belowRight') { x = t.x + t.w - wNow; y = t.y + t.h + 10; }
    return { x, y: y + (1 - ramp(f, s0, 12, EASE.out)) * 8, w: wNow, n, a: ramp(f, s0, 4, EASE.out), typing: n < t.full.length };
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, f = u * 15, k = this.push(f, D), M = C.accent, deep = mix(C.ink, '#000000', 0.4);
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    let g = ctx.createRadialGradient(576, 54, 0, 576, 54, 1300); g.addColorStop(0, rgba(C.paper, 0.4)); g.addColorStop(1, rgba(C.paper, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(PUSH[0], PUSH[1]); ctx.scale(k, k); ctx.translate(-PUSH[0], -PUSH[1]);
    const T = D.targets, fired = T.filter((t) => f >= t.ft).length, done = ramp(f, D.T.last + 8, 8, EASE.out), scanP = clamp((f - 6) / 74), status = ramp(f, 0, 10, EASE.out);
    // the status row above the window: a pulsing dot, the state, the counter and a progress bar
    ctx.save(); ctx.globalAlpha = status;
    const sy = 84 + 24;
    ctx.beginPath(); ctx.arc(WIN.x + 7, sy, 13, 0, Math.PI * 2); ctx.fillStyle = rgba(M, 0.12); ctx.fill();
    ctx.beginPath(); ctx.arc(WIN.x + 7, sy, 7, 0, Math.PI * 2); ctx.fillStyle = done > 0.5 ? M : rgba(M, 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(f / 3))); ctx.fill();
    const st = done > 0.5 ? s.done : s.reading, sw = measure(ctx, st, { ...D.sf, spacing: 30 * 0.06 }).width;
    text(ctx, st, WIN.x + 30, sy + 11, { ...D.sf, spacing: c.lang === 'zh' ? 0 : 30 * 0.06 }, { color: done > 0.5 ? M : C.ink });
    text(ctx, copy('product', c.lang), WIN.x + 30 + sw + 18, sy + 11, D.sl, { color: C.dim });
    const n2 = (v) => String(v).padStart(2, '0'), right = WIN.x + WIN.w, tot = ` / ${n2(T.length)}`, wt = measure(ctx, tot, D.sl).width, wn = measure(ctx, n2(fired), D.sf).width, wl = measure(ctx, `${s.counter} `, D.sl).width;
    text(ctx, tot, right, sy + 11, D.sl, { color: C.dim, align: 'right' }); text(ctx, n2(fired), right - wt, sy + 11, D.sf, { color: fired === T.length ? M : C.ink, align: 'right' }); text(ctx, `${s.counter} `, right - wt - wn, sy + 11, D.sl, { color: C.dim, align: 'right' });
    const bx = right - wt - wn - wl - 20 - 220; rrect(ctx, bx, sy - 3, 220, 6, 3); ctx.fillStyle = rgba(C.ink, 0.1); ctx.fill(); if (scanP > 0) { rrect(ctx, bx, sy - 3, 220 * scanP, 6, 3); ctx.fillStyle = M; ctx.fill(); }
    ctx.restore();
    // the window: two soft shadows, the page, then scan-line's line mode clipped to it
    ctx.save(); ctx.shadowColor = rgba(deep, 0.18); ctx.shadowBlur = 60; ctx.shadowOffsetY = 30; rrect(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 20); ctx.fillStyle = C.panel; ctx.fill(); ctx.restore();
    ctx.save(); rrect(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 20); ctx.clip(); ctx.drawImage(D.page, WIN.x, WIN.y); ctx.restore();
    rrect(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 20); ctx.strokeStyle = rgba(C.ink, 0.08); ctx.lineWidth = 1; ctx.stroke();
    const LP = { ...LINE, rect: [WIN.x, WIN.y, WIN.w, WIN.h], colors: C }, S = SCAN.at((f - 2) / 86, LP);
    SCAN.paint(ctx, S, LP, { from() {} });
    // the cursors on either side of the frame, the left one reading out y
    if (S.on > 0.01) {
      const ly = S.y; ctx.save(); ctx.globalAlpha = S.on; ctx.fillStyle = M;
      ctx.beginPath(); ctx.moveTo(WIN.x - 28, ly - 11); ctx.lineTo(WIN.x - 10, ly); ctx.lineTo(WIN.x - 28, ly + 11); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(WIN.x + WIN.w + 28, ly - 11); ctx.lineTo(WIN.x + WIN.w + 10, ly); ctx.lineTo(WIN.x + WIN.w + 28, ly + 11); ctx.closePath(); ctx.fill();
      text(ctx, `Y ${String(Math.max(0, Math.round(ly - WIN.y))).padStart(4, '0')}`, WIN.x - 38, ly + 8, D.yf, { color: M, align: 'right' });
      ctx.restore();
    }
    // per block: the focus flash, reticle-lock's corners collapsing on the spring, then the label typing out
    for (const t of T) {
      const d = f - t.ft; if (d < 0) continue;
      const sp = springAt(d, { damping: 15, stiffness: 210 }), arm = 40 - 14 * ramp(f, t.ft + 3, 12, EASE.out), flash = ramp(f, t.ft + 3, 3, EASE.out) * (1 - ramp(f, t.ft + 6, 12, EASE.out));
      const X = WIN.x + t.x, Y = WIN.y + t.y;
      if (flash > 0.002) { rrect(ctx, X, Y, t.w, t.h, 6); ctx.fillStyle = rgba(M, 0.075 * flash); ctx.fill(); ctx.strokeStyle = rgba(M, 0.4 * flash); ctx.lineWidth = 2; rrect(ctx, X + 1, Y + 1, t.w - 2, t.h - 2, 5); ctx.stroke(); }
      RETICLE.paint(ctx, { show: true, own: true, lock: 1, alpha: Math.min(1, d / 3), fly: [0, 0], shrink: 1, grow: 76 * (1 - sp), bite: 0, focus: 0, locked: false, label: 0 },
        { rect: [X, Y, t.w, t.h], pad: 0, arm: arm + 1.75, thick: 3.5, radius: 6, colors: C }, { scene() {} });
    }
    for (const t of T) {
      const B = this.label(t, f); if (!B) continue;
      const X = WIN.x + B.x, Y = WIN.y + B.y;
      ctx.save(); ctx.globalAlpha = B.a;
      ctx.save(); ctx.shadowColor = rgba(mix(M, '#000000', 0.6), 0.55); ctx.shadowBlur = 22; ctx.shadowOffsetY = 10; rrect(ctx, X, Y, B.w, TAG_H, 10); ctx.fillStyle = M; ctx.fill(); ctx.restore();
      ctx.save(); rrect(ctx, X, Y, B.w, TAG_H, 10); ctx.clip();
      const head = t.full.slice(0, Math.min(B.n, t.nh)).join(''), rest = B.n > t.nh ? t.full.slice(t.nh, B.n).join('') : '', by = Y + TAG_H / 2 + 11;
      text(ctx, head, X + 17, by, D.tb, { color: C.onAccent }); text(ctx, rest, X + 17 + t.cum[Math.min(B.n, t.nh)], by, D.tf, { color: rgba(C.onAccent, 0.78) });
      if (B.typing) { ctx.fillStyle = rgba(C.onAccent, 0.85); ctx.fillRect(X + 17 + t.cum[B.n] + 2, Y + 10, 14, 30); }
      ctx.restore(); ctx.restore();
    }
    ctx.restore();
  },
  // the line's left cursor and the headline's label (compare pairs them with the upstream's)
  track(u, s, c, D) {
    const f = u * 15, k = this.push(f, D), at = ([x, y]) => [PUSH[0] + (x - PUSH[0]) * k, PUSH[1] + (y - PUSH[1]) * k];
    const S = SCAN.at((f - 2) / 86, { ...LINE, rect: [WIN.x, WIN.y, WIN.w, WIN.h] }), h1 = D.targets[2], B = h1 && this.label(h1, f);
    return [at([WIN.x - 30, S.y - 13]), B ? at([WIN.x + B.x, WIN.y + B.y]) : at([WIN.x + h1.x, WIN.y + h1.y - TAG_H - 2])];
  },
  blur() { return false; },
};
