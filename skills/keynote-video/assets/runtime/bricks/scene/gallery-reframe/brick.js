// gallery-reframe — a board of twelve pictures thinks again twice: a switch in the corner slides to the next layout
// and, four frames later, the tiles follow it from the plain grid to a feature mosaic (the first picture captioned),
// then deal out into a diagonal cascade of mounted prints, and the headline rises in the space they leave.
// Adapted from video-shotcraft demos/transition/mosaic-reframe/MosaicReframe.tsx (card references/shots/transition/mosaic-reframe.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion) over the motion brick layout-morph (both
// changes of layout are its own: grid → mosaic with the wave stagger, mosaic → cascade with the deal); colours by role
// (the switch's pill and the headline's last line in the accent); brand, wordmark, the eight illustrated photos and every
// word removed (the tiles are layout-morph's role-coloured pictures or the film's images; header, switch labels, the
// feature caption, headline and subline are slots); the serif and italic of the headline become the display role (the
// look decides); the diagonal rise of the tiles at the start (0.94 → 1, 40 px, 14-frame stagger along the diagonals),
// the switch (12-frame snappy slide, stretched 18 % mid-way, the next label pressed), the four-frame lag of the tiles
// behind it, the feature caption (frames 76–138), the headline at frame 158 and the 1 → 1.025 push are the upstream's.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, caseOf, wrap, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { riseText } from '../../motion/stagger-in/brick.js';
import morph from '../../motion/layout-morph/brick.js';

const T_AB = 52, T_BC = 128, LAG = 4, HEAD = 158, END = 214, N = 12, AREA = [96, 212, 1824, 984];
const SEG = { w: 168, h: 60, pad: 6, right: 96, top: 92 };
const DEFAULT = {
  en: { eyebrow: 'Workspace', title: 'Weekly review', modes: ['Grid', 'Mosaic', 'Cascade'],
    feature: [{ kicker: 'Featured', title: 'Weekly review', meta: '9 checks · 4.5 s' }],
    headline: 'Every render, in sequence', subline: 'Twelve shots, three ways to read them' },
  zh: { eyebrow: '工作台', title: '每周回顾', modes: ['网格', '拼贴', '错落'],
    feature: [{ kicker: '精选', title: '每周回顾', meta: '9 项检查 · 4.5 秒' }],
    headline: '每一次渲染，按顺序排好', subline: '十二个镜头，三种读法' },
};

export default {
  id: 'gallery-reframe', kind: 'scene',
  fits: ['demo', 'proof', 'rest'],
  surface: ['canvas'],
  beats: { min: 12, max: 15 },
  needs: { motions: ['layout-morph'], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    images: { type: 'list', count: [0, 12], of: { type: 'image', crop: true }, optional: true },
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } },
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 7 } } },
    modes: { type: 'list', count: [3, 3], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } } },
    feature: { type: 'list', count: [1, 1], of: {
      kicker: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } },
      title: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
      meta: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 24 }, zh: { chars: 12 } } },
    } },
    headline: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } },
    subline: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 8, chars: 42 }, zh: { chars: 16 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  summary: 'A board of twelve pictures rearranges twice, following a layout switch: grid, feature mosaic (the first picture captioned), then a diagonal cascade of prints under the headline.',
  defaults: (ctx = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])), images: null }),
  plan(s, ctx) {
    const read = readTime(s.headline, ctx.lang) + (s.subline ? readTime(s.subline, ctx.lang) : 0), total = Math.max(END, HEAD + 24 + Math.ceil(read * 30)), beats = clamp(Math.ceil(total / 15), 12, 15);
    return { beats, reads: [{ text: s.title, lang: ctx.lang }, { text: s.feature?.[0]?.title || '', lang: ctx.lang }, { text: s.headline, lang: ctx.lang }],
      cues: [{ beat: T_AB / 15, kind: 'turn' }, { beat: T_BC / 15, kind: 'turn' }, { beat: HEAD / 15, kind: 'land' }],
      motion: 'layout-morph twice: grid → mosaic (wave), mosaic → cascade (deal)', settled: 180 / 15, peakAt: null, pause: beats - 180 / 15 };
  },
  validate(s) { const e = []; if ((s.modes || []).length !== 3) e.push('modes: three labels, one per layout'); if ((s.images || []).length > 12) e.push('images: at most 12'); return e; },
  prepare(s) {
    const tiles = (s.images || []).length ? s.images.map((img) => (g, w, h) => { const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, k = Math.max(w / iw, h / ih); g.drawImage(img, (w - iw * k) / 2, (h - ih * k) / 2, iw * k, ih * k); }) : null;
    const base = { colors: s.colors, n: N, area: AREA, tiles, lift: 0.035, span: null, dur: null };
    const P1 = { ...base, from: 'grid', to: 'mosaic', stagger: 'wave' }, P2 = { ...base, from: 'mosaic', to: 'cascade', stagger: 'deal' };
    const D1 = morph.prepare(P1), D2 = morph.prepare(P2), board = new OffscreenCanvas(1920, 1080);
    const frames = (P) => { const st = { wave: [10, 26], deal: [14, 30] }[P.stagger]; return st[0] + st[1] + 4; };
    return { P1, P2, D1, D2, F1: frames(P1), F2: frames(P2), board, bg: board.getContext('2d', { willReadFrequently: true }) };
  },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  // the board at frame f: which change, and how far
  stateAt(f, D) {
    if (f < T_BC + LAG) return { P: D.P1, D: D.D1, S: morph.at(clamp((f - T_AB - LAG) / D.F1), D.P1, D.D1) };
    return { P: D.P2, D: D.D2, S: morph.at(clamp((f - T_BC - LAG) / D.F2), D.P2, D.D2) };
  },
  paint(ctx, u, s, cx, D) {
    const c = s.colors, f = u * 15, L = s.lang, cam = 1 + 0.025 * ramp(f, 0, END, EASE.smooth), B = this.stateAt(f, D);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(960, 0.46 * 1080); ctx.scale(cam, cam); ctx.translate(-960, -0.46 * 1080);
    if (f < 40) {
      // the tiles rise in along the diagonals: each one's rect of the board, scaled 0.94 → 1 and lifted 40 px → 0
      const g = D.bg; g.setTransform(1, 0, 0, 1, 0, 0); morph.paint(g, B.S, B.P, B.D);
      ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
      B.S.tiles.forEach((t, i) => {
        const order = (i % 4) + Math.floor(i / 4), inP = ramp(f, EASE.out(order / 5) * 14 - 2, 16, EASE.snappy);
        if (inP <= 0) return;
        const k = 0.94 + 0.06 * inP;
        ctx.save(); ctx.globalAlpha = inP; ctx.translate(t.cx, t.cy + (1 - inP) * 40); ctx.scale(k, k); ctx.translate(-t.cx, -t.cy);
        ctx.beginPath(); ctx.rect(t.cx - t.w / 2 - 10, t.cy - t.h / 2 - 8, t.w + 20, t.h + 24); ctx.clip();
        ctx.drawImage(D.board, 0, 0); ctx.restore();
      });
    } else morph.paint(ctx, B.S, B.P, B.D);
    this.feature(ctx, f, s, D);
    this.header(ctx, f, s);
    this.switcher(ctx, f, s);
    // the headline in the space the cascade leaves, its last line in the accent
    if (f >= HEAD - 1) {
      const hf = this.F(s, 'display', L === 'zh' ? 96 : 104, 600, 'display'), lines = wrap(ctx, s.headline, hf, L === 'zh' ? 640 : 900, L).slice(0, 2), lh = hf.size * (L === 'zh' ? 1.18 : 1.0);
      const y0 = 676 + hf.size * 0.86 + (2 - lines.length) * lh * 0.5;
      lines.forEach((ln, i) => riseText(ctx, ln, 96, y0 + i * lh, hf, { color: i === lines.length - 1 && lines.length > 1 ? c.accent : c.ink, lang: L, f, start: HEAD + i * 6, each: 20, gap: 5 }));
      if (s.subline) { const k = ramp(f, HEAD + 14, 18, EASE.snappy); text(ctx, s.subline, 96, y0 + (lines.length - 1) * lh + 26 + 40 + (1 - k) * 12, this.F(s, 'text', 32, 450), { color: c.dim, alpha: ramp(f, HEAD + 14, 16, EASE.out) }); }
    }
    ctx.restore();
  },
  header(ctx, f, s) {
    const c = s.colors, L = s.lang, ef = this.F(s, 'mono', L === 'zh' ? 28 : 25, 650, 'label'), eb = caseOf(s.eyebrow || '', s.look || NEUTRAL, 'label', L);
    rrect(ctx, 96, 104, 48, 48, 14); ctx.fillStyle = c.accent; ctx.fill();
    text(ctx, eb.text, 166, 122, { ...ef, spacing: eb.tracking * ef.size }, { color: c.dim, baseline: 'middle' });
    text(ctx, s.title, 166, 156, this.F(s, 'display', 34, 650, 'display'), { color: c.ink, baseline: 'middle' });
  },
  // the layout switch: the accent pill slides to the next label (stretching on the way), the label is pressed
  switcher(ctx, f, s) {
    const c = s.colors, p1 = ramp(f, T_AB, 12, EASE.snappy), p2 = ramp(f, T_BC, 12, EASE.snappy), pos = p1 + p2;
    const stretch = 1 + 0.18 * (Math.sin(Math.PI * p1) + Math.sin(Math.PI * p2)), W = SEG.w * 3 + SEG.pad * 2, x0 = 1920 - SEG.right - W, y0 = SEG.top;
    ctx.save(); ctx.shadowColor = rgba(mix(c.ground, '#000000', 0.7), 0.18); ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    rrect(ctx, x0, y0, W, SEG.h + SEG.pad * 2, (SEG.h + SEG.pad * 2) / 2); ctx.fillStyle = rgba(c.panel, 0.7); ctx.fill(); ctx.restore();
    rrect(ctx, x0 + 0.5, y0 + 0.5, W - 1, SEG.h + SEG.pad * 2 - 1, (SEG.h + SEG.pad * 2) / 2); ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.stroke();
    const px = x0 + SEG.pad + pos * SEG.w + SEG.w / 2, pw = SEG.w * stretch;
    ctx.save(); ctx.shadowColor = rgba(c.accent, 0.5); ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    rrect(ctx, px - pw / 2, y0 + SEG.pad, pw, SEG.h, SEG.h / 2); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore();
    s.modes.forEach((m, k) => {
      const on = Math.max(0, 1 - Math.abs(pos - k)), press = k === 0 ? 1 : 1 - 0.05 * Math.sin(Math.PI * ramp(f, (k === 1 ? T_AB : T_BC) - 3, 8, EASE.linear));
      const x = x0 + SEG.pad + k * SEG.w + SEG.w / 2, y = y0 + SEG.pad + SEG.h / 2;
      ctx.save(); ctx.translate(x, y); ctx.scale(press, press);
      text(ctx, m, 0, 2, this.F(s, 'text', s.lang === 'zh' ? 28 : 30, 600), { color: on > 0.5 ? c.onAccent : c.dim, align: 'center', baseline: 'middle' });
      ctx.restore();
    });
  },
  // the feature caption inside the first tile while the mosaic holds
  feature(ctx, f, s, D) {
    const it = s.feature?.[0], a0 = T_AB + LAG + 20, out = ramp(f, T_BC, 10, EASE.exit);
    if (!it || f < a0 - 4 || out >= 1) return;
    const c = s.colors, L = s.lang, t = morph.at(clamp((f - T_AB - LAG) / D.F1), D.P1, D.D1).tiles[0], shade = mix(c.ground, '#000000', 0.85), on = mix(c.panel, '#FFFFFF', 0.5);
    ctx.save(); ctx.translate(t.cx, t.cy); ctx.rotate((t.rot * Math.PI) / 180);
    const x = -t.w / 2, y = -t.h / 2;
    rrect(ctx, x, y, t.w, t.h, t.radius); ctx.clip();
    const g = ctx.createLinearGradient(x + t.w * 0.6, y, x, y + t.h); g.addColorStop(0.4, rgba(shade, 0)); g.addColorStop(1, rgba(shade, 0.6));
    ctx.globalAlpha = ramp(f, T_AB + LAG + 16, 14, EASE.out) * (1 - out); ctx.fillStyle = g; ctx.fillRect(x, y, t.w, t.h);
    ctx.globalAlpha = 1 - out;
    const kf = this.F(s, 'text', L === 'zh' ? 28 : 30, 650, 'label'), kk = caseOf(it.kicker, s.look || NEUTRAL, 'label', L), tf = this.F(s, 'display', L === 'zh' ? 76 : 84, 600, 'display'), mf = this.F(s, 'text', 32, 450);
    const yb = y + t.h - 36;
    text(ctx, it.meta, x + 44, yb, mf, { color: rgba(on, 0.82), alpha: ramp(f, T_AB + LAG + 34, 14, EASE.out) });
    riseText(ctx, it.title, x + 44, yb - 52, tf, { color: on, lang: L, f, start: T_AB + LAG + 26, each: 18, gap: 5 });
    text(ctx, kk.text, x + 44, yb - 52 - tf.size - 6, { ...kf, spacing: kk.tracking * kf.size }, { color: mix(on, c.accent, 0.35), alpha: ramp(f, T_AB + LAG + 22, 14, EASE.out) });
    ctx.restore();
  },
  blur() { return false; },
  // tile 1 and tile 8's centres (as layout-morph), under the push
  track(u, s, cx, D) {
    if (!D) return [[960, 540]];
    const f = u * 15, cam = 1 + 0.025 * ramp(f, 0, END, EASE.smooth), B = this.stateAt(f, D), P = ([x, y]) => [960 + (x - 960) * cam, 0.46 * 1080 + (y - 0.46 * 1080) * cam];
    const rise = (i) => (1 - ramp(f, EASE.out(((i % 4) + Math.floor(i / 4)) / 5) * 14 - 2, 16, EASE.snappy)) * 40;
    return [0, 7].map((i) => P([B.S.tiles[i].cx, B.S.tiles[i].cy + rise(i)]));
  },
};
