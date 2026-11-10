// type-filter — a search acted out at a human pace, so the audience does it along: close on the search field, a query
// is typed a grapheme every few frames (caret solid, then blinking through a held breath); the camera pulls back to
// the whole page; the cards that do not match leave in reading order (fade, sink, soften) while the match floats up
// into the first slot from wherever it was (even below the fold); a pointer arcs to it and clicks (a double ripple,
// an accent outline lit from the click), and the camera pushes in on it to hand over to what it opens.
// Adapted from video-shotcraft demos/interaction/type-and-filter/TypeAndFilter.tsx (card
// references/shots/interaction/type-and-filter.md) with its page camera demos/_fixtures/PageCam2D.tsx,
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React, Remotion or page screenshots); the page is drawn: a
// heading, the input-field prop as the search bar, cards in the panel colour with a cover band (the match's in the
// accent); colours by role (focus ring, caret, ripple and outline in the accent; the pointer is the cursor prop);
// the query, heading and card texts are slots; the layout (search rect, card rects) and the camera's zooms are
// params, so the scene can sit on a real page's geometry; the match's vertical speed blur is drawn as added copies.
import { clamp, lerp, mix, rgba, rrect, text, measure, scratch } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { bez } from '../../../motion.js';
import { fontFor, graphemes, wrap, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { drawField } from '../../prop/input-field/brick.js';
import { drawCursor } from '../../prop/cursor/brick.js';

const TYPE0 = 10, CAM = bez(0.33, 0, 0.15, 1), SLIDE = bez(0.35, 0, 0.2, 1), PTR = bez(0.45, 0, 0.2, 1);
const inOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2), outCubic = (t) => 1 - Math.pow(1 - t, 3);
const lin = (f, a, b) => clamp((f - a) / (b - a));
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);
const F = (s, role, size, weight, kind) => fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind);
// The default page: a 4 × 3 grid under a search bar, all of it readable at zoom 1.
const TILE = { w: 380, h: 220, gap: 28 }, GX = (1920 - (4 * TILE.w + 3 * TILE.gap)) / 2;
const defaultLayout = (n) => ({
  search: [GX, 168, 1000, 72], radius: 20,
  cards: Array.from({ length: n }, (_, i) => [GX + (i % 4) * (TILE.w + TILE.gap), 300 + Math.floor(i / 4) * (TILE.h + TILE.gap), TILE.w, TILE.h]),
});

const timeline = (S) => {
  const n = graphemes(S.query).length, cpf = S.lang === 'zh' ? 5 : 3, last = TYPE0 + cpf * Math.max(0, n - 1), filter = last + 11, click = filter + 16;
  return { n, cpf, last, filter, click, end: click + 15 };
};
const camAt = (f, K) => {
  for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (f >= a.f && f <= b.f) { const t = CAM(lin(f, a.f, b.f)); return { cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), zoom: lerp(a.zoom, b.zoom, t) }; } }
  return f < K[0].f ? K[0] : K[K.length - 1];
};
const slideAt = (f, T) => SLIDE(lin(f, T.filter, T.filter + 10));
const ptrAt = (f, T, from, to) => { const t = PTR(lin(f, T.filter + 4, T.click - 1)); return [lerp(from[0], to[0], t), lerp(from[1], to[1], t) + Math.sin(t * Math.PI) * 60]; };

export default {
  id: 'type-filter', kind: 'scene',
  fits: ['demo', 'how'],
  surface: ['canvas'],
  beats: { min: 3, max: 7 },
  needs: { motions: ['cursor-glide'], props: ['input-field', 'cursor'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'text'] },
  slots: {
    heading: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } }, default: { en: 'All projects', zh: '全部项目' } },
    query: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 5 } }, default: { en: 'teaser', zh: '预告' } },
    placeholder: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } }, default: { en: 'Search projects', zh: '搜索项目' } },
    items: { type: 'list', count: [4, 12], of: { title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } } }, meta: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 2, chars: 12 }, zh: { chars: 5 } } } } },
  },
  defaults: () => ({
    heading: { en: 'All projects', zh: '全部项目' }, query: { en: 'teaser', zh: '预告' }, placeholder: { en: 'Search projects', zh: '搜索项目' },
    items: {
      en: [['Drafts', '12 items'], ['Reviews', '8 open'], ['Renders', '21 queued'], ['Notes', '5 new'], ['Exports', '14 files'], ['Storyboard', '32 frames'], ['Sound mix', '3 tracks'], ['Colour pass', 'Day 2'], ['Captions', '2 languages'], ['Thumbnails', '9 options'], ['Teaser cut', '0:42'], ['Archive', '2024']].map(([title, meta]) => ({ title, meta })),
      zh: [['草稿', '12 项'], ['审阅', '8 条待看'], ['渲染', '21 个排队'], ['笔记', '5 条新'], ['导出', '14 个文件'], ['分镜', '32 帧'], ['混音', '3 轨'], ['调色', '第 2 天'], ['字幕', '2 种语言'], ['封面', '9 个备选'], ['预告剪辑', '0:42'], ['归档', '2024']].map(([title, meta]) => ({ title, meta })),
    },
    target: 10, layout: null, zoom: [1.6, 2.2],
  }),
  plan(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', S = { ...s, lang, query: pick(s.query, lang) || '' }, T = timeline(S);
    return {
      beats: T.end / 15, reads: readTime(S.query, lang) + 0.6,
      cues: [{ beat: TYPE0 / 15, kind: 'accent' }, { beat: T.filter / 15, kind: 'turn' }, { beat: T.click / 15, kind: 'stamp' }],
      motion: ['cursor-glide'], settled: (T.filter + 10) / 15, shots: 1, peakAt: T.click / 15, pause: { from: T.last / 15, to: T.filter / 15 },
    };
  },
  validate(s, ctx = {}) {
    const n = (pick(s.items, ctx.lang || 'en') || []).length, err = [];
    if (n < 4 || n > 12) err.push(`items: ${n}, want 4–12`);
    if (!(s.target >= 0 && s.target < n)) err.push(`target ${s.target} is not an item`);
    return err;
  },
  prepare(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', items = (pick(s.items, lang) || []).map((d) => (typeof d === 'string' ? { title: d } : d));
    const S = { ...s, lang, items, heading: pick(s.heading, lang), query: pick(s.query, lang) || '', placeholder: pick(s.placeholder, lang) };
    const L = s.layout || defaultLayout(items.length), T = timeline(S), [sx, sy, sw, sh] = L.search, k = S.target ?? 0, slot = L.cards[0], z = S.zoom || [1.6, 2.2];
    const click = [slot[0] + slot[2] / 2, slot[1] + slot[3] / 2];
    const keys = [
      { f: 0, cx: sx + sw * 0.405, cy: sy + sh / 2 + 118, zoom: z[0] }, { f: T.last + 3, cx: sx + sw * 0.405, cy: sy + sh / 2 + 118, zoom: z[0] },
      { f: T.filter + 4, cx: 960, cy: 540, zoom: 1 }, { f: T.click - 2, cx: 960, cy: 540, zoom: 1 }, { f: T.end - 1, cx: click[0], cy: click[1], zoom: z[1] },
    ];
    const rank = new Map(); L.cards.forEach((_, i) => { if (i !== k && i < items.length) rank.set(i, rank.size); });
    const lay = () => { const W = Math.ceil(Math.max(...L.cards.map((r) => r[2]))) + 120, H = Math.ceil(Math.max(...L.cards.map((r) => r[3]))) + 160, cv = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(W, H); cv.width = W; cv.height = H; return cv.getContext('2d', { willReadFrequently: true }); };
    return { S, L, T, k, click, keys, rank, from: [sx + sw * 0.79, sy + sh + 40], A: lay(), B: lay() };
  },
  paint(ctx, u, s, cx, D) {
    const S = D.S, T = D.T, L = D.L, c = s.colors, f = u * 15, k = D.k, R = L.radius ?? 20, lang = S.lang;
    const cam = camAt(f, D.keys);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(960 - cam.cx * cam.zoom, 540 - cam.cy * cam.zoom); ctx.scale(cam.zoom, cam.zoom);
    const [sx, sy, sw, sh] = L.search;
    if (S.heading) text(ctx, S.heading, sx - 2, sy - 40, F(S, 'display', Math.round(sh * 0.78), 700, 'display'), { color: c.ink });
    // one card at its rect into a graphics context (the match's cover in the accent)
    const drawCard = (g, i, x, y, w, h) => {
      const it = S.items[i] || {}, target = i === k, sc = w / 380, cov = h * 0.46;
      g.save(); rrect(g, x, y, w, h, R); g.fillStyle = c.panel; g.fill(); g.clip();
      g.fillStyle = target ? mix(c.panel, c.accent, 0.16) : mix(c.panel, c.line, 0.45); g.fillRect(x, y, w, cov);
      g.strokeStyle = target ? c.accent : mix(c.line, c.dim, 0.5); g.lineWidth = 3 * sc;
      if (target) for (let j = 0; j < 3; j++) { g.beginPath(); for (let q = 0; q <= 32; q++) { const t = q / 32, yy = y + cov * (0.62 - 0.1 * j) + Math.sin(t * Math.PI * 2.2 + j * 0.9) * cov * 0.11 - t * cov * 0.16; q ? g.lineTo(x + t * w, yy) : g.moveTo(x, yy); } g.globalAlpha = j ? 0.45 : 1; g.stroke(); g.globalAlpha = 1; }
      else for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(x + w * (0.66 + 0.04 * (i % 3)), y + cov * 0.7, (18 + j * 20) * sc, 0, Math.PI * 2); g.globalAlpha = 0.8 - j * 0.16; g.stroke(); g.globalAlpha = 1; }
      g.restore();
      rrect(g, x + 0.75, y + 0.75, w - 1.5, h - 1.5, R); g.lineWidth = 1.5; g.strokeStyle = c.line; g.stroke();
      const tf = F(S, 'display', Math.round(30 * sc), 650), lines = wrap(g, it.title || '', tf, w - 40 * sc, lang).slice(0, 2);
      lines.forEach((l, j) => text(g, l, x + 20 * sc, y + cov + 46 * sc + j * 36 * sc, tf, { color: c.ink }));
      if (it.meta) text(g, it.meta, x + 20 * sc, y + h - 22 * sc, F(S, 'text', Math.round(22 * sc), 500), { color: c.dim });
    };
    // the cards that leave, in reading order
    L.cards.forEach((r, i) => {
      if (i === k || i >= S.items.length) return;
      const cue = T.filter + D.rank.get(i) * 0.4; if (f >= cue + 5) return;
      const o = inOutQuad(lin(f, cue, cue + 5)), [x, y, w, h] = r;
      ctx.save(); ctx.globalAlpha = 1 - o; if (o > 0.02) ctx.filter = `blur(${(1.5 * o * cam.zoom).toFixed(2)}px)`;
      ctx.translate(x + w / 2, y + h / 2 + 8 * o); ctx.scale(1 - 0.015 * o, 1 - 0.015 * o); ctx.translate(-(x + w / 2), -(y + h / 2));
      ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.08); ctx.shadowBlur = 12 * cam.zoom; ctx.shadowOffsetY = 4 * cam.zoom; rrect(ctx, x, y, w, h, R); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
      drawCard(ctx, i, x, y, w, h); ctx.restore();
    });
    // the match: floats into the first slot, a vertical speed blur on the fast part
    {
      const [x0, y0, w, h] = L.cards[k], to = L.cards[0], t = slideAt(f, D.T), fl = Math.sin(t * Math.PI), sc = 1 + 0.02 * fl;
      const dx = (to[0] - x0) * t, dy = (to[1] - y0) * t, vy = (to[1] - y0) * (slideAt(f + 0.5, T) - slideAt(f - 0.5, T)), blur = Math.min(7, Math.abs(vy) * 0.04);
      const g = D.A, P = 60;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, g.canvas.width, g.canvas.height); g.translate(P, P + 20);
      g.save(); g.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.09 + 0.12 * fl); g.shadowBlur = 12 + 30 * fl; g.shadowOffsetY = 4 + 18 * fl; rrect(g, 0, 0, w, h, R); g.fillStyle = c.panel; g.fill(); g.restore();
      drawCard(g, k, 0, 0, w, h);
      let src = g.canvas;
      if (blur > 0.5) {
        const b = D.B, N = Math.max(3, Math.ceil(blur * 2) | 1);
        b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, b.canvas.width, b.canvas.height);
        b.globalCompositeOperation = 'lighter'; b.globalAlpha = 1 / N;
        for (let q = 0; q < N; q++) b.drawImage(g.canvas, 0, ((q / (N - 1)) * 2 - 1) * blur * 1.7);
        b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; src = b.canvas;
      }
      ctx.save(); ctx.translate(x0 + dx + w / 2, y0 + dy + h / 2); ctx.scale(sc, sc); ctx.drawImage(src, -w / 2 - P, -h / 2 - P - 20); ctx.restore();
    }
    // the search field: focus ring and caret in the accent, the query typed a grapheme every few frames
    const typedN = f < TYPE0 ? 0 : Math.min(T.n, Math.floor((f - TYPE0) / T.cpf) + 1);
    const caretOn = f >= TYPE0 - 2 && f <= T.click + 9 && (f <= T.last + 3 || Math.floor((f - (T.last + 3)) / 8) % 2 === 0);
    const focus = f < TYPE0 - 2 ? lin(f, TYPE0 - 6, TYPE0 - 2) : 1 - lin(f, T.click, T.click + 6);
    drawField(ctx, sx, sy, sw, sh, { focus: Math.max(focus, caretOn ? 0.6 : 0), typed: T.n ? typedN / T.n : 0, caret: caretOn ? 1 : 0, glow: 0 }, { ...S, colors: c }, { form: 'bar', text: S.query, placeholder: typedN ? '' : S.placeholder, icon: 'search', button: null, ring: false });
    if (focus > 0.001) { ctx.save(); ctx.globalAlpha = focus; rrect(ctx, sx - 1, sy - 1, sw + 2, sh + 2, Math.min(18, sh * 0.2) + 1); ctx.lineWidth = 1; ctx.strokeStyle = rgba(c.accent, 0.55); ctx.stroke(); rrect(ctx, sx - 3.5, sy - 3.5, sw + 7, sh + 7, Math.min(18, sh * 0.2) + 3.5); ctx.lineWidth = 3; ctx.strokeStyle = rgba(c.accent, 0.14); ctx.stroke(); ctx.restore(); }
    // the click: two rings, then the outline lit from it
    [0, 1].forEach((r) => {
      const st = T.click + r * 3; if (f < st || f > st + 10) return;
      const t = outCubic(lin(f, st, st + 10)), rad = lerp(14, r ? 78 : 54, t);
      ctx.save(); ctx.globalAlpha = 1 - t; ctx.beginPath(); ctx.arc(D.click[0], D.click[1], rad, 0, Math.PI * 2); ctx.lineWidth = r ? 1.5 : 2; ctx.strokeStyle = c.accent; ctx.stroke();
      if (!r) { const g = ctx.createRadialGradient(D.click[0], D.click[1], rad * 0.55, D.click[0], D.click[1], rad); g.addColorStop(0, rgba(c.accent, 0)); g.addColorStop(1, rgba(c.accent, 0.1)); ctx.fillStyle = g; ctx.fill(); }
      ctx.restore();
    });
    if (f >= T.click + 2) {
      const to = L.cards[0], h = L.cards[k][3], sc = lerp(1.015, 1, outCubic(lin(f, T.click + 2, T.click + 7))), x = to[0] - 6, y = to[1] - 6, w = to[2] + 12, hh = h + 12;
      ctx.save(); ctx.globalAlpha = lerp(0.5, 1, lin(f, T.click + 2, T.click + 5)); ctx.translate(x + w / 2, y + hh / 2); ctx.scale(sc, sc); ctx.translate(-(x + w / 2), -(y + hh / 2));
      ctx.shadowColor = rgba(c.accent, 0.45); ctx.shadowBlur = 34 * cam.zoom; ctx.shadowOffsetY = 8 * cam.zoom;
      rrect(ctx, x + 1.5, y + 1.5, w - 3, hh - 3, R + 6 - 1.5); ctx.lineWidth = 3; ctx.strokeStyle = c.accent; ctx.stroke(); ctx.shadowColor = 'transparent';
      rrect(ctx, x - 2, y - 2, w + 4, hh + 4, R + 8); ctx.lineWidth = 4; ctx.strokeStyle = rgba(c.accent, 0.1); ctx.stroke(); ctx.restore();
    }
    // the pointer: a constant size on screen whatever the zoom, fading in on the wide view and out in the push
    const pO = f < T.filter + 5 ? lin(f, T.filter, T.filter + 5) : 1 - lin(f, T.click + 4, T.click + 9);
    if (pO > 0.001) {
      const [px, py] = ptrAt(f, T, D.from, D.click), press = f < T.click - 1 ? 0 : f < T.click + 1 ? lin(f, T.click - 1, T.click + 1) : 1 - lin(f, T.click + 1, T.click + 5);
      drawCursor(ctx, px, py, { h: 44 / cam.zoom, form: 'solid', press, alpha: pO, colors: c });
    }
    ctx.restore();
  },
  // the match's centre and the pointer's tip, in page coordinates (before the camera)
  track(u, s, cx, D) {
    const f = u * 15, [x0, y0, w, h] = D.L.cards[D.k], to = D.L.cards[0], t = slideAt(f, D.T);
    return [[x0 + w / 2 + (to[0] - x0) * t, y0 + h / 2 + (to[1] - y0) * t], ptrAt(f, D.T, D.from, D.click)];
  },
};
