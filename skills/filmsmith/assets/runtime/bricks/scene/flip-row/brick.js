// flip-row — a row of feature cards turns over one after another: each card leans back, swings 194° about its vertical
// axis and springs back to 180°, a band of light crossing its edge at the thinnest moment, and its back shows what the
// feature brought: one big number, a before/after bar and a label. Cause on the front, outcome on the back.
// Adapted from video-shotcraft demos/transition/card-flip-reveal/CardFlipReveal.tsx (card references/shots/transition/card-flip-reveal.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion): each face is painted into a buffer and projected
// in vertical strips (the hand-off device-flip's projection), so the turn has perspective without CSS 3D; colours by
// role (the front is the panel on the ground, the back is the ink role inverted, the accent only on the dot and the
// after bar); brand, demo copy and the three illustrated UIs removed: the front shows the tile-card prop's neutral
// figure, every word is a slot; 3 or 4 cards (the row narrows for four); the turn (4 frames back to −10°, 16 frames
// bezier 0.55, 0, 0.3, 1 to 194°, a spring of damping 15 back to 180°, a 60 px lift on a sine), the face shading
// (1 − |cos θ|), the light band between 56° and 124°, the 12-frame stagger, the number's 1.08 → 1 spring, the label
// 4 frames after it, the mirrored floor reflection, the contact shadow and the 1 → 1.03 push are the upstream's.
import { clamp, mix, rgba, rrect, text, measure, canvasOf } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, caseOf, wrap, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { springAt } from '../../motion/stagger-in/brick.js';
import { figure, FIGURES } from '../../prop/tile-card/brick.js';

const ROW = { w: 1536, y: 330, h: 620, gap: 48 }, PERSP = 1600, STRIPS = 96, M = 70;   // M: the buffer's margin for the lift
const FLIP0 = 22, STAGGER = 12, PRE = 4, TURN = 16, PEAK = 194, SETTLE = 12, HOLD = 40;
const flipEase = bez(0.55, 0, 0.3, 1);
const rad = (d) => (d * Math.PI) / 180;
const lum = (hex) => { const v = parseInt(hex.slice(1, 7), 16); return (0.2126 * (v >> 16) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255; };

const CARD = {
  name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } },
  desc: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 32 }, zh: { chars: 13 } } },
  value: { type: 'number', claim: true, limits: { en: { chars: 6 }, zh: { chars: 6 } } },
  label: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 20 }, zh: { chars: 9 } } },
  before: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 2, chars: 8 }, zh: { chars: 5 } } },
  after: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 2, chars: 8 }, zh: { chars: 5 } } },
  ratio: { type: 'number', optional: true },
};
const DEFAULT = {
  en: { eyebrow: 'Three features', headline: 'Three tools, three results.', barLabels: ['Before', 'After'], cards: [
    { name: 'Drafts', desc: 'One line in, a first cut out.', value: '3×', label: 'faster first cut', before: '48 min', after: '16 min', ratio: 0.33 },
    { name: 'Reviews', desc: 'Every cut checked in one place.', value: '−41%', label: 'time on fixes', before: '6.1 h', after: '3.6 h', ratio: 0.59 },
    { name: 'Exports', desc: 'Every file, one click away.', value: '0.2 s', label: 'to find a file', before: '3.4 s', after: '0.2 s', ratio: 0.06 }] },
  zh: { eyebrow: '三项功能', headline: '三项功能，三个结果', barLabels: ['之前', '之后'], cards: [
    { name: '起稿', desc: '一句话进去，初剪出来。', value: '3×', label: '初剪更快', before: '48 分钟', after: '16 分钟', ratio: 0.33 },
    { name: '审阅', desc: '每一刀都在一处检查。', value: '−41%', label: '返工时间', before: '6.1 小时', after: '3.6 小时', ratio: 0.59 },
    { name: '导出', desc: '每个文件一键就到。', value: '0.2 秒', label: '找到一个文件', before: '3.4 秒', after: '0.2 秒', ratio: 0.06 }] },
};

// the row's geometry for n cards: card width, x of card i
const rowOf = (n) => { const gap = n > 3 ? 40 : ROW.gap, w = (ROW.w - (n - 1) * gap) / n; return { w, gap, x0: (1920 - ROW.w) / 2, x: (i) => (1920 - ROW.w) / 2 + i * (w + gap) }; };
// the card's turn at frame f: 0 → −10 (lean back) → 194 (accelerating turn) → 180 (spring)
const angleAt = (f, i) => {
  const s = FLIP0 + i * STAGGER;
  if (f < s + PRE) return -10 * ramp(f, s, PRE, EASE.out);
  if (f < s + PRE + TURN) return -10 + (PEAK + 10) * ramp(f, s + PRE, TURN, flipEase);
  return PEAK - (PEAK - 180) * springAt(f - (s + PRE + TURN), { damping: 15, stiffness: 190 });
};
const landOf = (i) => FLIP0 + i * STAGGER + PRE + TURN;

// Shade a face turned `a` degrees off the camera: darker as it turns away; a narrow light band crosses it near 90°.
const light = (g, w, h, a, dark, c) => {
  const k = Math.abs(Math.cos(rad(a))), shade = (1 - k) * (dark ? 0.55 : 0.4);
  if (shade > 0.001) { g.fillStyle = rgba(mix(c.ground, '#000000', 0.85), shade); g.fillRect(0, 0, w, h); }
  const band = Math.max(0, 1 - Math.abs(a - 90) / 34);
  if (band > 0.01) {
    const pos = (-0.2 + 1.4 * clamp((a - 56) / 68)) * w, gr = g.createLinearGradient(pos - 0.14 * w, -0.03 * w, pos + 0.14 * w, 0.03 * w);
    gr.addColorStop(0, rgba('#FFFFFF', 0)); gr.addColorStop(0.5, rgba('#FFFFFF', 0.9 * band * (dark ? 0.5 : 0.35))); gr.addColorStop(1, rgba('#FFFFFF', 0));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
};

// Project a face buffer (w × h) turned phi degrees about its vertical axis (cos phi > 0), lifted z px, centred at
// (cx, cy): vertical strips, each scaled by the perspective at its depth.
const project = (ctx, tex, w, h, cx, cy, phi, z) => {
  const cos = Math.cos(rad(phi)), sin = Math.sin(rad(phi));
  if (cos < 0.01) return;
  const at = (u) => { const k = PERSP / (PERSP - (z - u * sin)); return [cx + u * cos * k, k]; };
  const n = STRIPS, sw = w / n;
  for (let i = 0; i < n; i++) {
    const u0 = -w / 2 + i * sw, u1 = u0 + sw, [x0] = at(u0), [x1] = at(u1), [, k] = at((u0 + u1) / 2), hh = h * k;
    ctx.drawImage(tex, i * sw, 0, sw, h, x0, cy - hh / 2, x1 - x0 + 0.6, hh);
  }
};

export default {
  id: 'flip-row', kind: 'scene',
  fits: ['proof', 'demo', 'claim'],
  surface: ['canvas'],
  beats: { min: 8, max: 12 },
  needs: { motions: ['device-flip'], props: ['tile-card'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 10 } } },
    headline: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 34 }, zh: { chars: 12 } } },
    barLabels: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } } },
    cards: { type: 'list', count: [3, 4], of: CARD },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'A row of feature cards turns over one by one; each back answers its front with one big number, a before/after bar and a label.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  // frames: the headline, the turns (12 apart), the last card settled, then a hold long enough to read the last label
  frames(s, lang) {
    const n = s.cards.length, read = Math.max(HOLD, Math.ceil(readTime(s.cards[n - 1].label, lang) * 30));
    return { land: landOf(n - 1) + SETTLE, total: landOf(n - 1) + SETTLE + read };
  },
  plan(s, ctx) {
    const F = this.frames(s, ctx.lang), beats = clamp(Math.ceil(F.total / 15), 8, 12);
    return { beats, reads: [{ text: s.headline, lang: ctx.lang }, ...s.cards.map((c) => ({ text: `${c.value} ${c.label}`, lang: ctx.lang }))],
      cues: s.cards.map((_, i) => ({ beat: landOf(i) / 15, kind: i === s.cards.length - 1 ? 'land' : 'accent' })),
      motion: 'cards turn over in a stagger', settled: F.land / 15, peakAt: landOf(s.cards.length - 1) / 15, pause: beats - F.land / 15 };
  },
  validate(s, ctx) {
    const err = [], n = (s.cards || []).length;
    if (n < 3 || n > 4) err.push('cards: 3 or 4');
    (s.cards || []).forEach((c, i) => { if (c.ratio != null && !(c.ratio >= 0 && c.ratio <= 1)) err.push(`cards[${i}].ratio: 0 to 1 (the after bar against the before bar)`); if (!c.value) err.push(`cards[${i}].value missing`); });
    return err;
  },
  prepare(s) {
    const R = rowOf(s.cards.length), B = () => { const b = canvasOf(Math.ceil(R.w), ROW.h); return { b, g: b.getContext('2d') }; };
    return { R, front: s.cards.map(B), back: s.cards.map(B), row: canvasOf(1920, ROW.h + 2 * M) };
  },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  // the front: the feature, as a panel with its number, a neutral figure, its name and one line
  paintFront(g, w, h, it, i, s, a) {
    const c = s.colors, L = s.lang, info = L === 'zh' ? 28 : 25;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    g.save(); rrect(g, 0, 0, w, h, 34); g.clip();
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, mix(c.panel, c.ink, 0.03)); gr.addColorStop(0.5, c.panel); gr.addColorStop(1, mix(c.panel, c.ground, 0.5));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const lab = caseOf(String(i + 1).padStart(2, '0'), s.look || NEUTRAL, 'label', L);
    text(g, lab.text, 40, 66, this.F(s, 'mono', 22, 600), { color: c.dim });
    figure(g, FIGURES[(i * 3 + 1) % FIGURES.length], 40, 112, w - 80, h * 0.36, c, { seed: i + 2, ground: mix(c.panel, c.ground, 0.55) });
    const nf = this.F(s, 'display', w < 420 ? 44 : 52, 750, 'display'), df = this.F(s, 'text', L === 'zh' ? 28 : 28, 450);
    const lines = wrap(g, it.desc || '', df, w - 80, L).slice(0, 2);
    const by = h - 44 - (lines.length - 1) * (L === 'zh' ? 38 : 34);
    text(g, it.name, 40, by - 52, nf, { color: c.ink });
    lines.forEach((ln, k) => text(g, ln, 40, by + k * (L === 'zh' ? 38 : 34), df, { color: c.dim }));
    light(g, w, h, a, lum(c.panel) < 0.5, c);
    g.restore();
    rrect(g, 0.75, 0.75, w - 1.5, h - 1.5, 33.5); g.strokeStyle = rgba(c.ink, 0.1); g.lineWidth = 1.5; g.stroke();
  },
  // the back: the outcome, the ink role inverted (dark cards turn light on a dark ground, and the other way round)
  paintBack(g, w, h, it, i, s, a, f) {
    const c = s.colors, L = s.lang, fill = c.ink, on = c.ground, soft = mix(fill, on, 0.55), land = landOf(i);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    g.save(); rrect(g, 0, 0, w, h, 34); g.clip();
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, mix(fill, on, 0.02)); gr.addColorStop(1, mix(fill, on, 0.07));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.beginPath(); g.arc(46, 58, 6, 0, Math.PI * 2); g.fillStyle = c.accent; g.fill();
    const nm = caseOf(it.name, s.look || NEUTRAL, 'label', L);
    text(g, nm.text, 64, 66, { ...this.F(s, 'text', L === 'zh' ? 28 : 22, 700), spacing: nm.tracking * 22 }, { color: soft });
    // before / after bars: the after bar shortens once the card has landed
    if (it.ratio != null) {
      const grow = ramp(f, land + 4, 18, EASE.snappy), lf = this.F(s, 'text', L === 'zh' ? 28 : 22, 700), uf = this.F(s, 'mono', L === 'zh' ? 28 : 25, 600);
      [0, 1].forEach((k) => {
        const y = 112 + k * 86, lb = caseOf(s.barLabels?.[k] ?? '', s.look || NEUTRAL, 'label', L), wk = k === 0 ? 1 : 1 + (it.ratio - 1) * grow;
        text(g, lb.text, 40, y + 22, { ...lf, spacing: lb.tracking * lf.size }, { color: k ? on : soft });
        const u = k ? it.after : it.before;
        if (u) text(g, u, w - 40, y + 22, uf, { color: k ? on : soft, align: 'right', alpha: k ? grow : 1 });
        rrect(g, 40, y + 38, w - 80, 16, 8); g.fillStyle = rgba(on, 0.08); g.fill();
        rrect(g, 40, y + 38, (w - 80) * wk, 16, 8); g.fillStyle = k ? c.accent : rgba(on, 0.22); g.fill();
      });
    }
    // the number: as large as fits (158 px at most), springing 1.08 → 1 as the card lands; the label 4 frames later
    const num = springAt(f - (land - 2), { damping: 18, stiffness: 160 }), sc = 1.08 + (1 - 1.08) * num;
    let vs = 158; const vf = (z) => this.F(s, 'display', z, 800, 'display');
    while (vs > 64 && measure(g, it.value, vf(vs)).width > w - 70) vs -= 2;
    g.save(); g.translate(36, h - 128); g.scale(sc, sc); text(g, it.value, 0, 0, vf(vs), { color: on }); g.restore();
    const lb = ramp(f, land + 2, 14, EASE.snappy);
    text(g, it.label, 40, h - 54 + (1 - lb) * 14, this.F(s, 'text', 34, 550), { color: mix(on, fill, 0.2), alpha: lb });
    light(g, w, h, a, lum(fill) < 0.5, c);
    g.restore();
  },
  paint(ctx, u, s, cx, D) {
    const c = s.colors, L = s.lang, f = u * 15, R = D.R, n = s.cards.length, push = 1 + 0.03 * ramp(f, 0, this.frames(s, L).total, EASE.smooth);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    // the floor: a faint sheen below the row's foot
    const fl = ctx.createLinearGradient(0, ROW.y + ROW.h, 0, 1080); fl.addColorStop(0, rgba(c.ink, 0.035)); fl.addColorStop(0.6, rgba(c.ink, 0));
    ctx.fillStyle = fl; ctx.fillRect(0, ROW.y + ROW.h, 1920, 1080 - ROW.y - ROW.h); ctx.fillStyle = rgba(c.ink, 0.06); ctx.fillRect(0, ROW.y + ROW.h, 1920, 1);
    ctx.save(); ctx.translate(960, 648); ctx.scale(push, push); ctx.translate(-960, -648);
    // the title, word by word
    const ef = this.F(s, 'mono', L === 'zh' ? 28 : 25, 650, 'label'), eb = caseOf(s.eyebrow || '', s.look || NEUTRAL, 'label', L);
    text(ctx, eb.text, R.x0, 150, { ...ef, spacing: eb.tracking * ef.size }, { color: c.accent, alpha: ramp(f, 0, 14, EASE.out) });
    const hf = this.F(s, 'display', 84, 760, 'display'), rise = ramp(f, 2, 18, EASE.snappy);
    ctx.save(); ctx.beginPath(); ctx.rect(R.x0 - 10, 170, 1700, 110); ctx.clip();
    text(ctx, s.headline, R.x0, 252 + (1 - rise) * 90, hf, { color: c.ink }); ctx.restore();
    // the cards into one row buffer (lifted cards overflow their slot), drawn twice: mirrored for the floor, then upright
    const rb = D.row, rg = rb.getContext('2d');
    rg.setTransform(1, 0, 0, 1, 0, 0); rg.clearRect(0, 0, rb.width, rb.height);
    s.cards.forEach((it, i) => {
      const a = angleAt(f, i), lift = Math.max(0, Math.sin(rad(clamp(a, 0, 180)))) * 60, ccx = R.x(i) + R.w / 2;
      const front = Math.cos(rad(a)) > 0;
      if (front) { this.paintFront(D.front[i].g, Math.ceil(R.w), ROW.h, it, i, s, Math.abs(a)); project(rg, D.front[i].b, R.w, ROW.h, ccx, M + ROW.h / 2, a, lift); }
      else { this.paintBack(D.back[i].g, Math.ceil(R.w), ROW.h, it, i, s, Math.abs(180 - a), f); project(rg, D.back[i].b, R.w, ROW.h, ccx, M + ROW.h / 2, a - 180, lift); }
    });
    // reflection: mirrored about the floor line, 22 %, fading out over its first 26 %
    ctx.save(); ctx.beginPath(); ctx.rect(0, ROW.y + ROW.h + 6, 1920, ROW.h * 0.3); ctx.clip();
    ctx.translate(0, 2 * (ROW.y + ROW.h) + 6); ctx.scale(1, -1);
    ctx.globalAlpha = 0.22; ctx.drawImage(rb, 0, ROW.y - M); ctx.restore();
    const fade = ctx.createLinearGradient(0, ROW.y + ROW.h + 6, 0, ROW.y + ROW.h + 6 + ROW.h * 0.26); fade.addColorStop(0, rgba(c.ground, 0.1)); fade.addColorStop(1, c.ground);
    ctx.fillStyle = fade; ctx.fillRect(0, ROW.y + ROW.h + 6, 1920, ROW.h * 0.3);
    // contact shadows, as wide as each card's projected width
    s.cards.forEach((_, i) => {
      const k = Math.max(0.12, Math.abs(Math.cos(rad(angleAt(f, i))))), w = (R.w - 60) * k, x = R.x(i) + R.w / 2;
      const sh = ctx.createRadialGradient(x, ROW.y + ROW.h, 0, x, ROW.y + ROW.h, w / 2);
      sh.addColorStop(0, rgba(mix(c.ground, '#000000', 0.8), 0.45)); sh.addColorStop(1, rgba(mix(c.ground, '#000000', 0.8), 0));
      ctx.save(); ctx.translate(x, ROW.y + ROW.h); ctx.scale(1, 36 / w); ctx.translate(-x, -(ROW.y + ROW.h));
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(x, ROW.y + ROW.h, w / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    ctx.drawImage(rb, 0, ROW.y - M);
    ctx.restore();
  },
  blur() { return false; },
  // each card's two vertical edges at mid-height (the turn's projected width), then the headline's left end
  track(u, s, cx, D) {
    const f = u * 15, R = rowOf(s.cards.length), push = 1 + 0.03 * ramp(f, 0, this.frames(s, cx.lang).total, EASE.smooth), P = (x, y) => [960 + (x - 960) * push, 648 + (y - 648) * push];
    const out = [];
    s.cards.forEach((_, i) => {
      const a = angleAt(f, i), front = Math.cos(rad(a)) > 0, phi = front ? a : a - 180, lift = Math.max(0, Math.sin(rad(clamp(a, 0, 180)))) * 60;
      const cos = Math.cos(rad(phi)), sin = Math.sin(rad(phi)), ccx = R.x(i) + R.w / 2;
      for (const uu of [-R.w / 2, R.w / 2]) { const k = PERSP / (PERSP - (lift - uu * sin)); out.push(P(ccx + uu * cos * k, ROW.y + ROW.h / 2)); }
    });
    return out;
  },
};
