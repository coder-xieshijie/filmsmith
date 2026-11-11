// sample.js — the neutral scenes a brick sample shows on either side of a motion (SPEC 9.1), and the defaults a brick
// falls back to when a film passes nothing. Every word comes from sample-copy.js (generated from
// tools/sample-copy.json), every colour from the look's roles, every font from its type roles; nothing here is a
// brand, a screenshot or upstream demo data. Painters are pure: paint(ctx) draws the same pixels every time.
// The grid (six 520 × 300 cards with procedural covers), the detail panel (a line chart and two chips) and the page
// (top bar, headline, area chart, three KPI tiles) take their geometry from video-shotcraft
// demos/transition/shot-transitions/PortalWipeV2.tsx and demos/camera/overhead-camera-moves/TiltReveal.tsx,
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0, so a comparison lines up with the upstream
// frame. Changes: drawn in Canvas2D from the look's roles and type roles; every word is neutral copy; no brand.

import { rrect, mix, rgba, text, measure } from '../handoffs/util.js';
import { fontFor, units, wrap } from './lang.js';
import NEUTRAL from './look/neutral/look.js';
import COPY from './sample-copy.js';

export const W = 1920, H = 1080;
export const look = NEUTRAL;
// a palette by id: the neutral look's, or another look's once registered (createBrick loads it when ctx.palette names it)
const OTHER = new Map();
export const registerPalette = (id, roles) => OTHER.set(id, roles);
export const palette = (id = 'neutral-light') => OTHER.get(id) || (NEUTRAL.palettes.find((p) => p.id === id) || NEUTRAL.palettes[0]).roles;
// load the look a palette id belongs to. Palette ids are per look (SPEC 3.4): `<look>/<palette>` names both; a bare id
// is looked up in the staged look-palettes.js (generated from every look) and works when one look has it, else is taken
// as `<look>-…` (afterglow-dawn → look/afterglow). A bare id two looks share, or one no look has, is warned about and
// drawn in neutral-light.
const lookPalette = async (look, pid) => { try { const L = (await import(`./look/${look}/look.js`)).default; return L.palettes?.find((x) => x.id === pid) || null; } catch { return null; } };
export const loadPalette = async (id) => {
  if (!id || OTHER.has(id) || NEUTRAL.palettes.some((p) => p.id === id)) return;
  let p = null, owner;
  if (id.includes('/')) { const [look, pid] = id.split('/'); p = await lookPalette(look, pid); }
  else {
    try { owner = (await import('./look-palettes.js')).default[id]; } catch {}
    if (Array.isArray(owner)) { console.warn(`palette ${id} is in looks ${owner.join(', ')}: write <look>/${id}; drawing in neutral-light`); return; }
    if (owner) p = await lookPalette(owner, id);
    const parts = id.split('-');
    for (let k = parts.length - 1; k > 0 && !p; k--) p = await lookPalette(parts.slice(0, k).join('-'), id);
  }
  if (p) registerPalette(id, p.roles);
  else console.warn(`palette ${id}: no look has it; drawing in neutral-light`);
};
export const copy = (key, lang = 'en') => (COPY[key] ? COPY[key][lang] ?? COPY[key].en : key);
// Information-text size for a language: the look's floor (en 25, zh 28 px).
export const infoSize = (lang) => NEUTRAL.type.floors[lang === 'zh' ? 'zh' : 'en'].info;

const F = (role, lang, size, weight, kind) => fontFor(NEUTRAL, role, lang, size, weight, kind);
const T = (ctx, s, x, y, f, o) => text(ctx, s, x, y, f, o);

// ── grid: a workspace of six cards, one of them the target ─────────────────────────────────────────────────────────
export const GRID = { tile: { w: 520, h: 300, gap: 32, cover: 176 }, x: 148, y: 330 };
export const gridRect = (i) => [GRID.x + (i % 3) * (GRID.tile.w + GRID.tile.gap), GRID.y + Math.floor(i / 3) * (GRID.tile.h + GRID.tile.gap), GRID.tile.w, GRID.tile.h];

// Cover art of card i: flat geometry in line / dim; the target's in the accent (the picture of the world it opens).
const cover = (ctx, i, x, y, w, h, c, target) => {
  ctx.save();
  rrect(ctx, x, y, w, h + 22, 22); ctx.clip();
  ctx.fillStyle = target ? mix(c.panel, c.accent, 0.16) : mix(c.panel, c.line, 0.45);
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = target ? c.accent : mix(c.line, c.dim, 0.5);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 3;
  const k = i % 6;
  if (target) {
    for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let s = 0; s <= 48; s++) { const u = s / 48; const yy = y + h * (0.62 - 0.1 * j) + Math.sin(u * Math.PI * 2.2 + j * 0.9) * h * 0.11 - u * h * 0.16; s ? ctx.lineTo(x + u * w, yy) : ctx.moveTo(x, yy); } ctx.globalAlpha = j ? 0.45 : 1; ctx.stroke(); }
  } else if (k === 0) for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(x + w * 0.78, y + h * 0.62, 30 + j * 34, 0, Math.PI * 2); ctx.globalAlpha = 1 - j * 0.16; ctx.stroke(); }
  else if (k === 1) for (let j = 0; j < 9; j++) { const bh = h * (0.25 + 0.5 * Math.abs(Math.sin(j * 1.3 + 0.6))); rrect(ctx, x + w * 0.42 + j * 30, y + h - bh, 16, bh, 4); ctx.globalAlpha = 0.55; ctx.fill(); }
  else if (k === 2) for (let j = 0; j < 40; j++) { ctx.beginPath(); ctx.arc(x + w * 0.46 + (j % 10) * 26, y + h * 0.2 + Math.floor(j / 10) * 32, 4 + ((j * 7) % 5), 0, Math.PI * 2); ctx.globalAlpha = 0.6; ctx.fill(); }
  else if (k === 3) for (let j = 0; j < 12; j++) { ctx.beginPath(); ctx.moveTo(x + w * 0.3 + j * 34, y + h + 10); ctx.lineTo(x + w * 0.3 + j * 34 + 120, y - 10); ctx.lineWidth = 10; ctx.globalAlpha = 0.35; ctx.stroke(); }
  else for (let j = 0; j < 4; j++) { const r = 90 + j * 46; ctx.beginPath(); ctx.arc(x + w * 0.35 + r, y + h + 4, r, Math.PI, 0); ctx.globalAlpha = 0.7; ctx.stroke(); }
  ctx.restore();
};

// One card at [x, y, w, h] of the grid's size (scaled when w differs).
export const card = (ctx, i, [x, y, w, h], { lang = 'en', colors, target = false, dim = 0 } = {}) => {
  const c = colors, t = GRID.tile, s = w / t.w, item = copy('cards', lang)[i % 6];
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, h / t.h);
  rrect(ctx, 0, 0, t.w, t.h, 22); ctx.fillStyle = c.panel; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = c.line; ctx.stroke();
  cover(ctx, i, 0, 0, t.w, t.cover, c, target);
  T(ctx, item.title, 26, t.cover + 62, F('display', lang, 40, 650), { color: c.ink });
  T(ctx, item.meta, 26, t.cover + 104, F('text', lang, infoSize(lang), 500), { color: c.dim });
  if (dim > 0) { rrect(ctx, 0, 0, t.w, t.h, 22); ctx.fillStyle = rgba(c.ground, dim); ctx.fill(); }
  ctx.restore();
};

export const grid = ({ lang = 'en', colors = palette(), target = 4, skip = -1, dim = 0 } = {}) => (ctx) => {
  const c = colors;
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, W, H);
  T(ctx, copy('eyebrow', lang), GRID.x, 132, F('mono', lang, infoSize(lang), 600, 'label'), { color: c.accent });
  T(ctx, copy('title', lang), GRID.x - 4, 262, F('display', lang, 96, 700, 'display'), { color: c.ink });
  T(ctx, copy('subtitle', lang), W - GRID.x, 262, F('text', lang, 36, 500), { color: c.dim, align: 'right' });
  for (let i = 0; i < 6; i++) if (i !== skip) card(ctx, i, gridRect(i), { lang, colors: c, target: i === target, dim: i === target ? 0 : dim });
};

// ── detail: the world one card opens; a panel with a chart and two chips ──────────────────────────────────────────
const SERIES = Array.from({ length: 60 }, (_, i) => 0.28 + i * 0.007 + 0.065 * Math.sin(i * 0.55) + 0.02 * Math.sin(i * 1.7 + 1));
export const detail = ({ lang = 'en', colors = palette(), draw: draw0 = 1, spread: spread0 = 1 } = {}) => (ctx, u) => {
  // u: how far the scene has arrived (a brick passes its own progress); the panel draws its line and the chips spread
  const spread = u == null ? spread0 : u, draw = u == null ? draw0 : Math.min(1, u * 1.25);
  const c = colors, bg = mix(c.ground, c.accent, 0.1);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.strokeStyle = rgba(c.accent, 0.25); ctx.lineWidth = 2;
  for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let s = 0; s <= 48; s++) { const u = s / 48; const yy = 210 + H * (0.62 - 0.1 * j) + Math.sin(u * Math.PI * 2.2 + j * 0.9) * H * 0.11 - u * H * 0.16; s ? ctx.lineTo(u * W, yy) : ctx.moveTo(0, yy); } ctx.stroke(); }
  ctx.restore();
  const far = 1 + 0.08 * spread, near = 1 + 0.3 * spread;
  ctx.save(); ctx.translate(960, 540); ctx.scale(far, far); ctx.translate(-960, -540);
  const px = 340, py = 200, pw = 1240, ph = 660;
  rrect(ctx, px, py, pw, ph, 30); ctx.fillStyle = c.panel; ctx.fill(); ctx.strokeStyle = c.line; ctx.lineWidth = 1.5; ctx.stroke();
  T(ctx, copy('detailEyebrow', lang), px + 64, py + 82, F('mono', lang, infoSize(lang), 600, 'label'), { color: c.accent });
  T(ctx, copy('detailTitle', lang), px + 64, py + 160, F('display', lang, 64, 700, 'display'), { color: c.ink });
  const [l1, l2] = copy('legend', lang);
  const lf = F('text', lang, infoSize(lang), 500);
  const w2 = measure(ctx, l2, lf).width, w1 = measure(ctx, l1, lf).width;
  let lx = px + pw - 64 - w2;
  T(ctx, l2, lx, py + 150, lf, { color: c.dim }); ctx.setLineDash([10, 8]); ctx.strokeStyle = c.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx - 44, py + 141); ctx.lineTo(lx - 14, py + 141); ctx.stroke(); ctx.setLineDash([]);
  lx -= 44 + 40 + w1;
  T(ctx, l1, lx, py + 150, lf, { color: c.dim }); ctx.fillStyle = c.accent; ctx.fillRect(lx - 44, py + 139, 30, 5);
  const CH = { x: px + 64, y: py + 220, w: 1112, h: 300 }, X = (i) => CH.x + (i / 59) * CH.w, Y = (v) => CH.y + CH.h * (1 - v);
  ctx.strokeStyle = c.line; ctx.lineWidth = 1.5;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(CH.x, CH.y + (CH.h / 3) * k); ctx.lineTo(CH.x + CH.w, CH.y + (CH.h / 3) * k); ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, CH.x + CH.w * draw + 4, H); ctx.clip();
  ctx.beginPath(); SERIES.slice(0, 40).forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)))); ctx.lineTo(X(39), CH.y + CH.h); ctx.lineTo(X(0), CH.y + CH.h); ctx.closePath(); ctx.fillStyle = rgba(c.accent, 0.14); ctx.fill();
  ctx.beginPath(); SERIES.slice(0, 40).forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)))); ctx.strokeStyle = c.accent; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.beginPath(); SERIES.slice(39).forEach((v, i) => (i ? ctx.lineTo(X(39 + i), Y(v)) : ctx.moveTo(X(39), Y(v)))); ctx.setLineDash([12, 10]); ctx.strokeStyle = c.dim; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  const months = copy('months', lang);
  months.forEach((m, i) => T(ctx, m, CH.x + 80 + i * ((CH.w - 80) / (months.length - 1)), py + ph - 46, F('mono', lang, infoSize(lang), 500), { color: c.dim, align: 'center' }));
  ctx.restore();
  ctx.save(); ctx.translate(960, 540); ctx.scale(near, near); ctx.translate(-960, -540);
  const chip = (x, y, w, h, big, small) => {
    const k = 1 / 1.3;
    rrect(ctx, x, y, w * k, h * k, 22 * k); ctx.fillStyle = mix(c.panel, c.accent, 0.08); ctx.fill(); ctx.strokeStyle = c.line; ctx.lineWidth = 1.5; ctx.stroke();
    T(ctx, big, x + 30 * k, y + 100 * k, F('display', lang, 84 * k, 750, 'display'), { color: c.accent });
    T(ctx, small, x + 32 * k, y + 160 * k, F('text', lang, Math.max(infoSize(lang), 32 * k), 500), { color: c.dim });
  };
  chip(960 + (1380 - 960) / 1.3, 540 + (64 - 540) / 1.3, 400, 200, copy('metric', lang), copy('metricLabel', lang));
  chip(960 + (104 - 960) / 1.3, 540 + (790 - 540) / 1.3, 420, 200, copy('metric2', lang), copy('metric2Label', lang));
  ctx.restore();
};

// ── page: a dashboard page, the plane the camera bricks tilt, glide and fly ───────────────────────────────────────
export const page = ({ lang = 'en', colors = palette(), w = W, h = H, draw = 1, radius = 26 } = {}) => (ctx) => {
  const c = colors;
  ctx.save();
  rrect(ctx, 0, 0, w, h, radius); ctx.fillStyle = c.panel; ctx.fill(); ctx.clip();
  ctx.fillStyle = mix(c.panel, c.ground, 0.5); ctx.fillRect(0, 0, w, 104);
  ctx.fillStyle = c.accent; ctx.fillRect(0, 103, w, 2);
  rrect(ctx, 64, 30, 44, 44, 12); ctx.fillStyle = c.accent; ctx.fill();
  T(ctx, copy('product', lang), 128, 66, F('display', lang, 36, 700), { color: c.ink });
  copy('nav', lang).forEach((n, i) => T(ctx, n, 420 + i * 190, 64, F('text', lang, infoSize(lang), 550), { color: i ? c.dim : c.ink }));
  T(ctx, copy('label', lang), w - 64, 64, F('text', lang, infoSize(lang), 550), { color: c.dim, align: 'right' });
  T(ctx, copy('eyebrow', lang), 120, 200, F('mono', lang, infoSize(lang), 650, 'label'), { color: c.accent });
  T(ctx, copy('claim', lang), 116, 320, F('display', lang, 104, 760, 'display'), { color: c.ink });
  const CH = { x: 160, y: 420, w: 1600, h: 300 }, S = [22, 26, 24, 31, 35, 33, 38, 44, 41, 47, 52, 49, 55, 61, 58, 66, 71, 69, 78, 86];
  const X = (i) => CH.x + (i / (S.length - 1)) * CH.w, Y = (v) => CH.y + CH.h - (v / 100) * CH.h;
  ctx.strokeStyle = c.line; ctx.lineWidth = 1.5;
  for (const g of [0.25, 0.5, 0.75, 1]) { ctx.beginPath(); ctx.moveTo(CH.x, CH.y + CH.h * (1 - g)); ctx.lineTo(CH.x + CH.w, CH.y + CH.h * (1 - g)); ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(CH.x - 10, CH.y - 40, (CH.w + 20) * draw, CH.h + 80); ctx.clip();
  ctx.beginPath(); S.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)))); ctx.lineTo(CH.x + CH.w, CH.y + CH.h); ctx.lineTo(CH.x, CH.y + CH.h); ctx.closePath(); ctx.fillStyle = rgba(c.accent, 0.16); ctx.fill();
  ctx.beginPath(); S.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)))); ctx.strokeStyle = c.accent; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
  copy('kpis', lang).forEach((k, i) => {
    const kw = (w - 240 - 80) / 3, kx = 120 + i * (kw + 40), ky = 790;
    rrect(ctx, kx, ky, kw, 190, 22); ctx.fillStyle = mix(c.panel, c.ground, 0.6); ctx.fill(); ctx.strokeStyle = c.line; ctx.lineWidth = 1.5; ctx.stroke();
    T(ctx, k.label, kx + 38, ky + 58, F('text', lang, infoSize(lang), 550), { color: c.dim });
    const vf = F('display', lang, 76, 720, 'display');
    T(ctx, k.value, kx + 38, ky + 148, vf, { color: c.ink });
    T(ctx, k.delta, kx + 58 + measure(ctx, k.value, vf).width, ky + 148, F('text', lang, 28, 650), { color: c.accent });
  });
  ctx.restore();
};

// ── title: one claim, centred, with its label ─────────────────────────────────────────────────────────────────────
export const title = ({ lang = 'en', colors = palette(), key = 'claim', size = 120, ground = null } = {}) => (ctx) => {
  const c = colors;
  ctx.fillStyle = ground || c.ground; ctx.fillRect(0, 0, W, H);
  const f = F('display', lang, size, 760, 'display');
  const lines = wrap(ctx, copy(key, lang), f, 1500, lang);
  const lh = size * (lang === 'zh' ? 1.3 : 1.1), y0 = 560 - ((lines.length - 1) * lh) / 2 + size * 0.35;
  T(ctx, copy('label', lang), 960, y0 - size - 34, F('mono', lang, infoSize(lang), 600, 'label'), { color: c.accent, align: 'center' });
  lines.forEach((l, i) => T(ctx, l, 960, y0 + i * lh, f, { color: c.ink, align: 'center' }));
  T(ctx, copy('caption', lang), 960, y0 + (lines.length - 1) * lh + 80, F('text', lang, infoSize(lang), 500), { color: c.dim, align: 'center' });
};

// ── bars: a chart that grows with time t in [0, 1] (time bricks rewrite t) ──────────────────────────────────────
export const BARS = { x: 360, base: 860, w: 120, gap: 80, max: 520 };
export const barTop = (i, t) => { const v = [0.42, 0.66, 0.54, 0.88, 0.74][i]; const g = Math.min(1, Math.max(0, t * 1.6 - i * 0.14)); return BARS.base - BARS.max * v * (1 - Math.pow(1 - g, 3)); };
export const bars = ({ lang = 'en', colors = palette() } = {}) => (ctx, t = 1) => {
  const c = colors;
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, W, H);
  T(ctx, copy('label', lang), BARS.x, 200, F('mono', lang, infoSize(lang), 600, 'label'), { color: c.accent });
  T(ctx, copy('detailTitle', lang), BARS.x - 4, 290, F('display', lang, 72, 720, 'display'), { color: c.ink });
  ctx.strokeStyle = c.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(BARS.x - 40, BARS.base); ctx.lineTo(BARS.x + 5 * (BARS.w + BARS.gap), BARS.base); ctx.stroke();
  copy('steps', lang).concat(copy('steps', lang)[0]).slice(0, 5).forEach((s, i) => {
    const x = BARS.x + i * (BARS.w + BARS.gap), top = barTop(i, t);
    rrect(ctx, x, top, BARS.w, BARS.base - top, 10); ctx.fillStyle = i === 3 ? c.accent : mix(c.dim, c.ground, 0.35); ctx.fill();
    T(ctx, s, x + BARS.w / 2, BARS.base + 48, F('text', lang, infoSize(lang), 550), { color: c.dim, align: 'center' });
  });
};

export const SCENES = { grid, detail, page, title, bars };
// A painter from a description: a function stays itself; { scene: 'grid', ...opts } becomes that scene.
// base: the brick's params; only its lang and colors reach the scene.
export const painterOf = (v, base = {}) => (typeof v === 'function' ? v : v && SCENES[v.scene] ? SCENES[v.scene]({ lang: base.lang, colors: base.colors, ...v }) : null);

// ── slot filling (SPEC 9.1): a scene's or prop's slots filled from the sample copy, the longest entry that fits ──────────
// text slots pick by `sample` (a copy key) or by name (title, label, caption, metric, …), else by tier; list slots fill
// their largest count, item i taking the i-th entry of the list copies (cards, steps, kpis); image and brick slots stay
// null (the brick draws its neutral placeholder). Returns params, and the slots that had no candidate within limits.
const BY_NAME = { title: ['title', 'titleLong', 'detailTitle'], heading: ['title', 'detailTitle'], claim: ['claim'], label: ['label', 'eyebrow'], eyebrow: ['eyebrow', 'detailEyebrow'],
  caption: ['caption', 'subtitle'], subtitle: ['subtitle', 'caption'], sub: ['subtitle', 'caption'], body: ['subtitle', 'caption'], metric: ['metric', 'metric2'], value: ['metric', 'metric2'],
  command: ['command'], cmd: ['command'], path: ['path'], product: ['product'], name: ['product'], note: ['note'], source: ['note'], before: ['before'], after: ['after'],
  suffix: ['suffix'], where: ['where'], available: ['where'], button: ['button'], action: ['action', 'button'], cta: ['cta', 'button', 'action'], call: ['cta', 'button', 'action'] };
const BY_TIER = { primary: ['claim', 'title', 'titleLong', 'detailTitle'], glance: ['label', 'caption', 'eyebrow', 'metricLabel'], word: ['steps'] };
// the text a reader sees: markup ([[kind|text]], *accent*) does not count toward a slot's limits, a `{name}` filled in
// later (a figure) counts as three characters
export const plainText = (s) => String(s ?? '').replace(/\{[a-zA-Z]\w*\}/g, '000').replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1').replace(/\*([^*]+)\*/g, '$1');
// limits: zh chars in units (a Han character 1, two Latin letters or digits 1); en chars in characters, en words in words
const unitsOf = (s, lang) => (lang === 'zh' ? units(plainText(s), 'zh') : plainText(s).length);
const fits = (s, lim, lang) => { if (!lim) return true; const L = lim[lang] || lim.en || {}; s = plainText(s); if (L.chars != null && unitsOf(s, lang) > L.chars) return false; if (lang !== 'zh' && L.words != null && s.trim().split(/\s+/).length > L.words) return false; return true; };
const listCopy = (name, i, lang) => {
  const cards = copy('cards', lang), steps = copy('steps', lang), kpis = copy('kpis', lang), k = /meta|count|sub|caption/.test(name) ? 'meta' : 'title';   // a label is a name, not a count
  const out = [cards[i % cards.length]?.[k], steps[i % steps.length], kpis[i % kpis.length]?.[/value|metric|number/.test(name) ? 'value' : 'label']];
  return /value|metric|number/.test(name) ? [out[2]] : out.filter(Boolean);
};
// `sample` may name a field of a list copy ("cards.title": item i of a list takes cards[i].title). Number slots take the
// number alone ("+38%" → "38"), for a unit slot of their own. A list's items come from the first source that fits
// (cards, then steps, then kpis) and never repeat.
const MEDIA = new Set(['image', 'brick', 'icon']), COPY_TYPES = new Set(['text', 'code']);
const copyList = (of) => (!of ? false : of.type ? COPY_TYPES.has(of.type)
  : Object.values(of).some((f) => COPY_TYPES.has(f?.type || 'text')) && Object.values(of).every((f) => f?.optional || COPY_TYPES.has(f?.type || 'text')));
export const fillSlots = (slots = {}, lang = 'en', { index = null, misses = [], at = '', used = new Set() } = {}) => {
  const out = {}, own = used;   // the slots of one call never repeat an entry either
  for (const [name, sl] of Object.entries(slots)) {
    const where = at ? `${at}.${name}` : name;
    // a slot marked sample: 'default', an image, brick or icon slot (no shared copy stands in for a capture), and a
    // list of data keep the brick's own default, the coherent set it was drawn for: shared copy would pair card
    // titles with stray figures. A list is copy when its items are text or code (an object item: some text or code
    // field and every required field text or code; its optional media fields are left out, as single slots are)
    // an optional slot keeps the brick's own default too: the sample shows what the brick was drawn with (its
    // default copy, or nothing), not shared copy picked by name (a stamp reading 规划); a list item fills its fields, and an optional slot that
    // names its copy (`sample: 'claim'`) is filled from it
    if (sl.sample === 'default' || (sl.optional && index == null && !sl.sample) || MEDIA.has(sl.type) || (sl.type === 'list' && !copyList(sl.of))) continue;
    if (sl.type === 'list') {
      const n = sl.sampleCount ?? (Array.isArray(sl.count) ? sl.count[1] : sl.count || 3);   // sampleCount: how many a sample fills
      const used = new Set(own);   // one list never repeats an entry (nor one the slots above took)
      out[name] = Array.from({ length: n }, (_, i) => (sl.of && sl.of.type ? fillSlots({ v: sl.of }, lang, { index: i, misses, at: `${where}[${i}]`, used }).v : fillSlots(sl.of || {}, lang, { index: i, misses, at: `${where}[${i}]`, used })));
      continue;
    }
    // a structured field (rect, point, colour, a flag…) is not copy: it keeps the brick's default
    if (sl.type && !['text', 'number', 'code'].includes(sl.type)) { if (sl.default != null) out[name] = sl.default?.[lang] ?? sl.default; continue; }
    const base = name.replace(/\d+$/, '').toLowerCase();
    // a number slot that is not a figure on screen (ratio, at, delay…) keeps its default: no copy fits it
    if (sl.type === 'number' && !/value|metric|number|figure|count|stat|kpi|total|score|before|after|amount|price/.test(base)) { if (sl.default != null) out[name] = sl.default?.[lang] ?? sl.default; continue; }
    let cands;
    if (sl.sample) cands = [].concat(sl.sample).map((k) => {
      const [key, field] = k.split('.');
      if (!field) return copy(key, lang);
      const list = [].concat(copy(key, lang)).map((o) => o?.[field]);
      return index != null ? list.slice(index % list.length).concat(list.slice(0, index % list.length)) : list;
    });
    else if (sl.type === 'code') cands = [copy('command', lang), copy('path', lang)];   // code, in a list or not
    else if (index != null) cands = listCopy(sl.type === 'number' ? 'value' : base, index, lang);
    else if (sl.type === 'number') cands = [copy('metric', lang), copy('metric2', lang)];
    else if (sl.type === 'code') cands = [copy('command', lang), copy('path', lang)];
    else cands = (BY_NAME[base] || BY_TIER[sl.tier] || BY_TIER.glance).map((k) => copy(k, lang));
    cands = cands.flat().filter((x) => typeof x === 'string');
    if (sl.type === 'number') cands = cands.map((x) => (x.match(/\d[\d.,]*/) || [])[0]).filter(Boolean);
    let ok = cands.filter((x) => fits(x, sl.limits, lang));
    if (index == null) ok.sort((a, b) => unitsOf(b, lang) - unitsOf(a, lang));   // one slot: the longest that fits
    if (used) { const fresh = ok.filter((x) => !used.has(x)); if (fresh.length) ok = fresh; }
    if (!ok.length) misses.push(where);
    out[name] = ok[0] ?? sl.default?.[lang] ?? sl.default ?? cands.sort((a, b) => unitsOf(a, lang) - unitsOf(b, lang))[0] ?? null;   // nothing fits: the brick's default before an over-long copy
    if (used && out[name] != null) used.add(out[name]);
  }
  return out;
};
// The text slot values of params that break their limits: [{ at, text, units, limit }].
export const slotOverflows = (slots = {}, params = {}, lang = 'en', at = '') => {
  const bad = [];
  for (const [name, sl] of Object.entries(slots)) {
    const v = params?.[name], where = at ? `${at}.${name}` : name;
    if (v == null) continue;
    if (sl.type === 'list' && Array.isArray(v)) {
      const [lo, hi] = Array.isArray(sl.count) ? sl.count : [0, Infinity];
      if (v.length < lo || v.length > hi) bad.push({ at: where, text: `${v.length} items`, limit: `${lo}–${hi}` });
      v.forEach((it, i) => bad.push(...(sl.of && sl.of.type ? slotOverflows({ v: sl.of }, { v: it }, lang, `${where}[${i}]`) : slotOverflows(sl.of || {}, it, lang, `${where}[${i}]`))));
    } else if (typeof v === 'string' && sl.limits && !fits(v, sl.limits, lang)) bad.push({ at: where, text: v, units: unitsOf(v, lang), limit: JSON.stringify(sl.limits[lang] || sl.limits.en) });
  }
  return bad;
};

