// tile-card — one card of a set (a template, a shot, a document, a result): a cover or figure, a label, a title, a foot.
// Adapted from video-shotcraft demos/ui-entrance/card-stack/CardStack.tsx (card references/shots/ui-entrance/card-stack.md)
// and demos/ui-entrance/carousel-3d/Carousel3D.tsx (card references/shots/ui-entrance/carousel-3d.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D prop (no React or Remotion); only the structure is kept (the cover share of the card
// face, the label–title–foot order, the stat layout's number line); every colour by role (the generative covers are
// drawn in line and dim, the accent only on a lit card); the upstream shot names, metas, numbers and the mark are
// replaced by the film's own copy (sample copy by default); a third layout `note` (a dark document card with a title,
// a byline and skeleton lines) is taken from demos/ui-entrance/research-card-stack-scroll/ResearchCardStackScroll.tsx.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { fontFor, wrap } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';

export const SIZES = { cover: [320, 440], stat: [340, 460], note: [640, 250] };
export const FIGURES = ['bars', 'line', 'rings', 'gantt', 'grid', 'dots', 'wave', 'blocks'];

// Default items for a set of n cards in a language: titles and labels from the sample copy, numbers from its KPIs.
export const cardItems = (lang = 'en', n = 6) => {
  const cards = copy('cards', lang), kpis = copy('kpis', lang);
  return Array.from({ length: n }, (_, i) => {
    const c = cards[i % cards.length], k = kpis[i % kpis.length];
    return { title: c.title, meta: c.meta, value: k.value, label: k.label, foot: copy('caption', lang), figure: FIGURES[(i * 3) % FIGURES.length] };
  });
};

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);

// A neutral generative figure in [x, y, w, h]: drawn in `ink` (mixed toward the panel), the accent when lit.
export const figure = (ctx, kind, x, y, w, h, c, { lit = 0, seed = 1, ground = null } = {}) => {
  const ink = mix(mix(c.panel, c.dim, 0.55), c.accent, lit), soft = mix(c.panel, c.line, 0.7);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (ground) { ctx.fillStyle = ground; ctx.fillRect(x, y, w, h); }
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const r = (k) => hash(k, seed);
  if (kind === 'bars') {
    const n = 7, bw = (w - 48) / n;
    for (let i = 0; i < n; i++) { const bh = h * (0.22 + 0.62 * r(i)); rrect(ctx, x + 24 + i * bw + 5, y + h - 20 - bh, bw - 10, bh, 6); ctx.globalAlpha = i === 4 ? 1 : 0.45; ctx.fill(); }
  } else if (kind === 'line') {
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) { const px = x + 20 + (i / 12) * (w - 40), py = y + h * (0.78 - 0.52 * (i / 12)) - Math.sin(i * 1.3 + seed) * h * 0.08; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.lineTo(x + w - 20, y + h); ctx.lineTo(x + 20, y + h); ctx.closePath(); ctx.globalAlpha = 0.14; ctx.fill();
  } else if (kind === 'rings') {
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, h * (0.16 + i * 0.12), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (0.45 + 0.4 * r(i))); ctx.lineWidth = 9; ctx.globalAlpha = 1 - i * 0.25; ctx.stroke(); }
  } else if (kind === 'gantt') {
    for (let i = 0; i < 6; i++) { const bx = x + 20 + r(i) * w * 0.35, bw = w * (0.2 + 0.35 * r(i + 9)); rrect(ctx, bx, y + 22 + i * ((h - 40) / 6), bw, (h - 40) / 6 - 10, 8); ctx.globalAlpha = i === 2 ? 1 : 0.35; ctx.fill(); }
  } else if (kind === 'grid') {
    const cols = 7, rows = 5, cw = (w - 40) / cols, ch = (h - 30) / rows;
    for (let i = 0; i < cols * rows; i++) { rrect(ctx, x + 20 + (i % cols) * cw + 3, y + 15 + Math.floor(i / cols) * ch + 3, cw - 6, ch - 6, 4); ctx.globalAlpha = 0.12 + 0.6 * (r(i) > 0.66 ? 1 : r(i) * 0.4); ctx.fill(); }
  } else if (kind === 'dots') {
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(x + 30 + (i % 10) * ((w - 60) / 9), y + 26 + Math.floor(i / 10) * ((h - 52) / 3), 4 + r(i) * 6, 0, Math.PI * 2); ctx.globalAlpha = 0.35 + 0.5 * r(i + 40); ctx.fill(); }
  } else if (kind === 'wave') {
    for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let s = 0; s <= 40; s++) { const u = s / 40, py = y + h * (0.5 + 0.1 * (j - 1)) + Math.sin(u * Math.PI * 3 + j + seed) * h * (0.18 - j * 0.04); s ? ctx.lineTo(x + u * w, py) : ctx.moveTo(x, py); } ctx.globalAlpha = 1 - j * 0.3; ctx.stroke(); }
  } else {
    const cols = 3, cw = (w - 40) / cols;
    for (let k = 0; k < cols; k++) for (let i = 0; i < 2 + Math.floor(r(k) * 3); i++) { rrect(ctx, x + 20 + k * cw + 5, y + 18 + i * 34, cw - 10, 26, 6); ctx.globalAlpha = k === 1 && i === 0 ? 1 : 0.3; ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.save(); ctx.strokeStyle = soft; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.restore();
};

// The film's image in [x, y, w, h], cropped to cover (asset.js rule: crop, scale, move only), or the neutral figure.
const picture = (ctx, item, x, y, w, h, c, o) => {
  const img = item.image;
  if (img && (img.width || img.naturalWidth)) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, s = Math.max(w / iw, h / ih);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, x + (w - iw * s) / 2, y + (h - ih * s) / 2, iw * s, ih * s);
    ctx.restore();
  } else figure(ctx, item.figure || 'bars', x, y, w, h, c, { ...o, ground: mix(c.panel, c.ground, 0.55) });
};

// Paint one card face into [0, 0, w, h] (the caller translates and scales). opts: { lit, dim, featured, index }.
export const drawCard = (ctx, item, w, h, P, { layout = 'cover', lit = 0, dim = 0, featured = false, index = 0, radius = 22, body = 1, ts = 1 } = {}) => {
  // ts: text scale, for a card shown smaller than 1:1 (its info text stays at the language's floor on screen)
  const c = P.colors, lang = P.lang, info = Math.round(infoSize(lang) * ts);
  const dark = layout === 'note';
  const face = dark ? mix(c.ink, c.ground, 0.12) : c.panel, onFace = dark ? c.ground : c.ink, sub = dark ? mix(c.ground, c.ink, 0.45) : c.dim;
  ctx.save();
  rrect(ctx, 0, 0, w, h, radius); ctx.fillStyle = face; ctx.fill();
  ctx.save(); ctx.clip();
  const pad = Math.round(w * 0.04 + 12);
  if (layout === 'cover') {
    // the cover takes 58 % of the card unless the label, the title and the foot need more room below it (short cards)
    const tf = F(P, 'display', Math.round(34 * ts), 680), lines = wrap(ctx, item.title || '', tf, w - pad * 2, lang).slice(0, 2);
    const below = info + 30 + tf.size * (1 + 1.18 * (lines.length - 1)) + 0.22 * tf.size + (item.foot ? 6 + 0.78 * info + 26 : 14);
    const ch = Math.max(Math.round(h * 0.3), Math.min(Math.round(h * 0.58), Math.floor(h - 12 - below)));
    ctx.save(); rrect(ctx, 12, 12, w - 24, ch, radius - 8); ctx.clip();
    picture(ctx, item, 12, 12, w - 24, ch, c, { lit: featured ? 1 : lit, seed: index + 1 });
    ctx.restore();
    text(ctx, item.meta || '', pad, ch + 12 + info + 18, F(P, 'mono', info, 600, 'label'), { color: featured || lit > 0.5 ? c.accent : sub });
    lines.forEach((l, i) => text(ctx, l, pad, ch + 12 + info + 30 + tf.size + i * tf.size * 1.18, tf, { color: onFace }));
    text(ctx, item.foot || '', pad, h - 26, F(P, 'text', info, 500), { color: sub });
  } else if (layout === 'stat') {
    text(ctx, item.meta || '', pad, pad + info, F(P, 'mono', info, 600, 'label'), { color: lit > 0.5 ? c.accent : sub });
    ctx.beginPath(); ctx.arc(w - pad - 7, pad + info * 0.62, 7, 0, Math.PI * 2); ctx.fillStyle = mix(c.line, c.accent, lit); ctx.fill();
    const fh = Math.round(h * 0.33);
    figure(ctx, item.figure || 'line', pad - 6, pad + info + 22, w - pad * 2 + 12, fh, c, { lit, seed: index + 1 });
    const vf = F(P, 'display', 64, 780, 'display');
    text(ctx, item.value || '', pad, pad + info + 22 + fh + 82, vf, { color: onFace });
    const tf = F(P, 'display', 32, 660);
    wrap(ctx, item.label || item.title || '', tf, w - pad * 2, lang).slice(0, 2).forEach((l, i) => text(ctx, l, pad, pad + info + 22 + fh + 132 + i * 38, tf, { color: onFace }));
  } else {
    ctx.fillStyle = featured ? c.accent : mix(face, c.ground, 0.5); ctx.fillRect(0, 0, 8, h);
    const tf = F(P, 'display', 40, 680);
    const lines = wrap(ctx, item.title || '', tf, w - 96, lang).slice(0, 2);
    lines.forEach((l, i) => text(ctx, l, 48, 66 + i * 50, tf, { color: onFace }));
    const by = 66 + lines.length * 50 + 6;
    ctx.save(); ctx.globalAlpha *= body;
    text(ctx, item.meta || '', 48, by, F(P, 'mono', info, 600, 'label'), { color: featured ? c.accent : sub });
    ctx.fillStyle = mix(face, onFace, 0.16);
    for (let k = 0; k < 3; k++) { const lw = (w - 96) * (0.94 - k * 0.12 - hash(index * 5 + k, 3) * 0.1); rrect(ctx, 48, by + 28 + k * 24, lw, 11, 5.5); ctx.fill(); }
    ctx.restore();
  }
  if (dim > 0) { ctx.fillStyle = rgba(c.ground, clamp(dim)); ctx.fillRect(0, 0, w, h); }
  ctx.restore();
  rrect(ctx, 0.75, 0.75, w - 1.5, h - 1.5, radius);
  ctx.lineWidth = 1.5; ctx.strokeStyle = dark ? mix(face, c.ground, 0.25) : c.line; ctx.stroke();
  if (lit > 0) { rrect(ctx, -1.5, -1.5, w + 3, h + 3, radius + 1.5); ctx.lineWidth = 3 * lit; ctx.strokeStyle = rgba(c.accent, 0.9 * lit); ctx.stroke(); }
  ctx.restore();
};

// A soft two-layer shadow under a card at elevation e (px): a contact shadow and an ambient one, from ink toward black.
export const cardShadow = (ctx, w, h, e, c, radius = 22, alpha = 1) => {
  if (alpha <= 0) return;
  const tone = mix(c.ink, '#000000', 0.6);
  ctx.save();
  for (const [blur, dy, a] of [[2 + e * 0.15, 1 + e * 0.08, 0.16], [8 + e * 0.9, 4 + e * 0.5, 0.18]]) {
    ctx.shadowColor = rgba(tone, a * alpha); ctx.shadowBlur = blur; ctx.shadowOffsetY = dy;
    rrect(ctx, 2, 2, w - 4, h - 4, radius); ctx.fillStyle = rgba(tone, a * alpha); ctx.fill();
  }
  ctx.restore();
};

// Cached faces (prepare-time tool cache): an offscreen canvas per card at scale k, for scenes that move many cards.
export const faceCanvas = (item, w, h, P, opts = {}, k = 1.5) => {
  const cv = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(1, 1);
  cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  const g = cv.getContext('2d', { willReadFrequently: true });   // software canvas: the same resampling on every draw
  g.scale(k, k);
  drawCard(g, item, w, h, P, opts);
  return cv;
};

// The sample: the three layouts side by side; the middle card walks rest → lit → dim → rest → lit.
const STATES = { rest: { lit: 0, dim: 0, lift: 0 }, lit: { lit: 1, dim: 0, lift: 1 }, dim: { lit: 0, dim: 0.55, lift: 0 } };
const WALK = ['rest', 'lit', 'dim', 'rest', 'lit'];

export default {
  id: 'tile-card', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [240, 330], M: [320, 440], L: [420, 578] },
  layouts: SIZES,
  states: STATES,
  parts: ['cover', 'label', 'title', 'foot', 'value', 'bar'],
  swap: {
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
    meta: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
    value: { type: 'number', limits: { en: { chars: 6 }, zh: { chars: 6 } } },
    foot: { type: 'text', tier: 'glance', limits: { en: { chars: 18 }, zh: { chars: 8 } } },
    image: { type: 'image', crop: true, optional: true },
    figure: { type: 'enum', of: FIGURES },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'One card of a set: a cover or figure, a label, a title and a foot; lit (accent rim) or dimmed by depth.',
  beats: 0,
  beatsFor: () => (WALK.length - 1) * 1.5,
  defaults: (ctx = {}) => ({ items: null, layout: null }),
  prepare(P) {
    const items = P.items || cardItems(P.lang, 3);
    return { items };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    const x = p * (WALK.length - 1), i = Math.min(WALK.length - 2, Math.floor(x)), u = clamp(x - i);
    const k = u < 0.34 ? 0 : clamp((u - 0.34) / 0.66), e = k * k * (3 - 2 * k);   // hold a third, then move
    const a = STATES[WALK[i]], b = STATES[WALK[i + 1]];
    return { lit: lerp(a.lit, b.lit, e), dim: lerp(a.dim, b.dim, e), lift: lerp(a.lift, b.lift, e) };
  },
  paint(ctx, S, P, D) {
    const c = P.colors;
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    const it = D.items;
    // left: cover card, centre: stat card (walks the states), right: two note cards stacked
    ctx.save(); ctx.translate(250, 320); cardShadow(ctx, 320, 440, 8, c); drawCard(ctx, it[0], 320, 440, P, { layout: 'cover', index: 0 }); ctx.restore();
    const lift = 14 * S.lift;
    ctx.save(); ctx.translate(670, 310 - lift); cardShadow(ctx, 340, 460, 8 + 30 * S.lift, c); drawCard(ctx, it[1], 340, 460, P, { layout: 'stat', index: 1, lit: S.lit, dim: S.dim }); ctx.restore();
    ctx.save(); ctx.translate(1130, 300); cardShadow(ctx, 640, 250, 8, c); drawCard(ctx, it[2], 640, 250, P, { layout: 'note', index: 2, featured: true }); ctx.restore();
    ctx.save(); ctx.translate(1130, 580); cardShadow(ctx, 640, 250, 8, c); drawCard(ctx, it[0], 640, 250, P, { layout: 'note', index: 3 }); ctx.restore();
  },
  track(S) { return [[840, 540 - 14 * S.lift]]; },
};
