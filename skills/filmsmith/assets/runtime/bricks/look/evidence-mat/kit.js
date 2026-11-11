// kit.js — what the dossier bricks share (exhibit-strike, claim-shift, worksheet-carry, result-strike, exhibit-ledger,
// name-strike, page-turn, sheet-deal, exhibit-sticker, mounted-sheet, ruled-worksheet, file-slug): the frame and its
// constants, the type styles in both languages, lines of words that rise out of a mask and sink upward, the paper (its
// tooth, the stacked edges, the ruling), the exhibit sheet (the asset on its mount, the veil, the highlighter stroke in
// multiply, the leader, the sticker), the worksheet (title, rows, the slip, the rule, the result and its stroke), the
// index of exhibits, the header (the source file and the page in hand), the sheet motions (dealt on, slid off) and a
// placeholder published page for samples. Pure functions of their arguments; images come in decoded.
// From the dossier template's example (the dossier source film layout.js, choreo.js C and CB, film.js
// lineOf, drawLine, paper, edges, poly, stampScale, popScale, paintSheet, buildWorksheet, paintWorksheet, slipAt,
// paintLedger, paintHeader): the values are the template's. Chinese (SPEC 4): claims and titles in Noto Serif SC 600 at
// the same sizes; a line rises character by character at a third of the English stagger (0.04 s), so a line lands in
// about the time an English one does; mono at the 28 px floor; no negative tracking on Chinese.
import { clamp, measure, text, canvasOf, rgba } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { expOut } from '../../../motion.js';
import { seamV } from '../../../handoffs/seam.js';
import { breaks, fontStack, graphemes, isCJK, readTime } from '../../lang.js';
import LOOK from './look.js';

export const W = 1920, H = 1080, M = 24, ZOOM_CAP = 4 / 3, X0 = 96, Y0 = 292, READ_W = 1728, BOTTOM = 1026;
export const TAG_H = 96, TAG_OVER = 12, SPREAD_W = 1112, WORK = { x: 1240, y: 292, w: 584, h: 600 };
export const CLAIM_Y = 140, TERMS_Y = 208, HEADER_Y = 54, UNDER_SRC = 2;
// durations in seconds (C) and beats (CB): the mode card's Motion table
export const C = { rise: 0.42, stagger: 0.12, settle: 0.25, sink: 0.2, sinkStagger: 0.02, veil: 0.3, leader: 0.4, dot: 0.12, stamp: 0.12, bandMove: 0.4, exit: 0.35, rule: 0.4, header: 0.3, pop: 0.36, popScale: 0.12 };
export const CB = { stroke: 1, deal: 1, turn: 1, slip: 2, stack: 1, lift: 0.5, open: 1.5 };
export const ZH_STAGGER = 0.04;
export const lerp = (a, b, u) => a + (b - a) * u;
export const progress = (t, t0, d) => (d <= 0 ? (t >= t0 ? 1 : 0) : clamp((t - t0) / d));
export const ease2io = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
export const ease1io = (u) => -(Math.cos(Math.PI * clamp(u)) - 1) / 2;
export { clamp, expOut, readTime };
const hasCJK = (s) => graphemes(String(s ?? '')).some(isCJK);

// ---------- type ----------
// [role, weight, size, tracking key]; Chinese mono and labels at the 28 px floor
const STY = {
  claim: ['display', 600, 50, 'display'], title: ['display', 600, 50, 'title'], fig: ['display', 600, 125, 'fig'], name: ['display', 600, 160, 'name'],
  row: ['text', 400, 40], caption: ['text', 400, 40],
  terms: ['mono', 400, 25], header: ['mono', 400, 25], tag1: ['mono', 600, 25], tag2: ['mono', 400, 25], tab: ['mono', 600, 25], value: ['mono', 400, 40], source: ['mono', 400, 25], url: ['mono', 500, 40], cap: ['mono', 400, 25],
  slip: ['sans', 700, 100],
};
// the font of a style for a string: a string with no Chinese keeps the English tracking and size
export const F = (key, lang = 'en', s = '') => {
  const [role, weight, size0, tk] = STY[key], zh = lang === 'zh' && hasCJK(s);
  const size = zh && role === 'mono' && size0 < 28 ? 28 : size0;
  const tr = tk ? LOOK.type.tracking[zh ? 'zh' : 'en'][tk] ?? 0 : 0;
  return { family: fontStack(LOOK, role, lang), weight, size, spacing: tr * size };
};
export const widthOf = (ctx, s, key, lang) => measure(ctx, s, F(key, lang, s)).width;
let MC = null;
const mctx = () => (MC ||= canvasOf(8, 8).getContext('2d'));
export const measureCtx = () => mctx();
export const exLabel = (n, lang) => (lang === 'zh' ? `证物 ${n}` : `EX. ${n}`);
export const pageText = (kind, o = {}, lang = 'en') => {
  const zh = lang === 'zh';
  if (kind === 'exhibit') return zh ? `证物 ${o.ex} / 共 ${o.of} 件` : `Exhibit ${o.ex} of ${o.of}`;
  if (kind === 'worksheet') return zh ? `演算纸，取自证物 ${o.ex}` : `Worksheet, from exhibit ${o.ex}`;
  if (kind === 'ledger') return zh ? '证物索引' : 'Index of exhibits';
  if (kind === 'lockup') return zh ? `共 ${o.of} 件证物` : `${o.of} exhibit${o.of === 1 ? '' : 's'}`;
  return '';
};

// ---------- lines of words: rise out of a mask one after another (expo out); sink upward, faster (power3 in) ----------
// o: { x, base, align, at, leave, color, lang, stagger }; words are breaks() (Latin words; Chinese characters)
export const lineOf = (text0, key, o) => {
  const L = o.lang || 'en', s = String(text0 ?? ''), f = F(key, L, s), g = mctx();
  const st = o.stagger ?? (L === 'zh' && hasCJK(s) ? ZH_STAGGER : C.stagger);
  const words = [];
  let acc = '', k = 0;
  for (const { w, sep } of breaks(s, L)) {
    const pre = acc ? acc + sep : acc;
    words.push({ s: w, x: acc ? measure(g, pre, f).width : 0, at: o.at + k * st });
    acc = pre + w; k++;
  }
  const width = acc ? measure(g, acc, f).width : 0;
  const x = o.align === 'right' ? o.x - width : o.align === 'center' ? o.x - width / 2 : o.x;
  return { f, color: o.color, x, base: o.base, words, width, leave: o.leave ?? Infinity, st, lang: L };
};
// a second phrase on the same baseline, entering later
export const appendTo = (Ln, text0, at) => {
  const s = String(text0 ?? ''), g = mctx(), f = Ln.f, st = Ln.lang === 'zh' && hasCJK(s) ? ZH_STAGGER : C.stagger;
  const sp = Ln.lang === 'zh' && hasCJK(s) ? 0 : measure(g, ' ', f).width;
  let k = 0;
  for (const { w, sep } of breaks(s, Ln.lang)) {
    const x = Ln.width + (k === 0 ? sp : measure(g, sep, f).width);
    Ln.words.push({ s: w, x, at: at + k * st });
    Ln.width = x + measure(g, w, f).width; k++;
  }
  return Ln;
};
// the same without measuring (plans run without a canvas): when a line starting at `at` has landed
export const landAt = (s, at, lang = 'en') => { const n = breaks(String(s ?? ''), lang).length; return at + Math.max(0, n - 1) * (lang === 'zh' && hasCJK(s) ? ZH_STAGGER : C.stagger) + C.rise * 0.9; };
// the moment a line's last word has landed (90 % of its rise)
export const landOf = (Ln) => (Ln.words.length ? Ln.words[Ln.words.length - 1].at + C.rise * 0.9 : 0);
export const drawLine = (ctx, Ln, t, dx = 0, dy = 0) => {
  if (!Ln || !Ln.words.length || t < Ln.words[0].at || t >= Ln.leave + C.sink + Ln.words.length * C.sinkStagger) return;
  const size = Ln.f.size, rise = size * 1.2 * 1.15;
  ctx.save();
  ctx.beginPath(); ctx.rect(Ln.x + dx - 12, Ln.base + dy - size * 1.05, Ln.width + 24, size * 1.4); ctx.clip();
  Ln.words.forEach((w, k) => {
    if (t < w.at) return;
    let y = (1 - expOut(progress(t, w.at, C.rise))) * rise;
    if (t >= Ln.leave) { const u = progress(t, Ln.leave + k * C.sinkStagger, C.sink); y -= u * u * u * rise; }
    text(ctx, w.s, Ln.x + dx + w.x, Ln.base + dy + y, Ln.f, { color: Ln.color });
  });
  ctx.restore();
};
// the claim and its terms on the mat: claim baseline 186, terms 234; `phrases` 1–2 (the second appended at at2)
export const matLines = (claim, terms, o, Cc, lang) => {
  const ph = Array.isArray(claim) ? claim : claim ? [claim] : [];
  const out = {};
  if (ph.length) {
    out.claim = lineOf(o.joined === false ? ph[0] : ph.join(lang === 'zh' && hasCJK(ph.join('')) ? '' : ' '), 'claim', { x: X0, base: CLAIM_Y + 46, at: o.claimAt, leave: o.leave, color: Cc.ink, lang });
    if (o.joined === false && ph[1]) appendTo(out.claim, ph[1], o.claimAt2);
  }
  if (terms) out.terms = lineOf(terms, 'terms', { x: X0, base: TERMS_Y + 26, at: o.termsAt, leave: o.termsLeave ?? o.leave, color: Cc.dim, lang });
  return out;
};
// what stood on the mat when the scene began: drawn settled, sinking at `leave` (Infinity: it stays)
export const priorLines = (prior, Cc, lang, leave, termsLeave = leave) => (prior ? matLines(prior.claim, prior.terms, { claimAt: -100, claimAt2: -100, termsAt: -100, leave, termsLeave, joined: false }, Cc, lang) : {});

// ---------- the header: the source file on the left, the page in hand on the right ----------
// h: { slug, page, prev, at } — at the page change the old text leaves upward (0.2 s), the new rises 0.1 s later
export const header = (ctx, t, h, Cc, lang) => {
  if (!h) return;
  const base = HEADER_Y + 26;
  if (h.slug) text(ctx, h.slug, X0, base, F('header', lang, h.slug), { color: Cc.dim });
  if (!h.page) return;
  ctx.save(); ctx.beginPath(); ctx.rect(W - X0 - 900, HEADER_Y - 4, 900, 40); ctx.clip();
  const at = h.at ?? 0, changes = h.prev && h.prev !== h.page;
  if (changes && t < at + 0.2) { const v = progress(t, at, 0.2); text(ctx, h.prev, W - X0, base - 40 * v * v, F('header', lang, h.prev), { color: Cc.dim, align: 'right' }); }
  const t1 = at + (changes ? 0.1 : 0);
  if (!changes || t >= t1) { const u = changes ? expOut(progress(t, t1, C.header)) : 1; text(ctx, h.page, W - X0, base + 40 * (1 - u), F('header', lang, h.page), { color: Cc.dim, align: 'right' }); }
  ctx.restore();
};

// ---------- paper ----------
const TOOTH = new Map();
const toothOf = (hex, seed = 1) => {
  const key = hex + seed;
  if (TOOTH.has(key)) return TOOTH.get(key);
  const c = canvasOf(256, 256), g = c.getContext('2d'), img = g.createImageData(256, 256);
  const pr = parseInt(hex.slice(1), 16), base = [(pr >> 16) & 255, (pr >> 8) & 255, pr & 255], k = LOOK.texture.paperTooth;
  for (let i = 0; i < img.data.length; i += 4) {
    const d = (hash(i >> 2, seed) - 0.5) * k;
    img.data[i] = base[0] + d; img.data[i + 1] = base[1] + d; img.data[i + 2] = base[2] + d * 1.1; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  TOOTH.set(key, c);
  return c;
};
export const paper = (ctx, x, y, w, h, Cc, { ruled = false, seed = 1 } = {}) => {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = ctx.createPattern(toothOf(Cc.paper, seed), 'repeat'); ctx.fillRect(0, 0, w, h);
  if (ruled) { ctx.fillStyle = rgba(Cc.onPaper, 0.07); for (let ry = 93; ry < h - 4; ry += 64) ctx.fillRect(0, ry, w, 1); }
  ctx.restore();
};
// the stack under a sheet: two hard paper edges, offset down and right (k shrinks them as the file squares up)
export const edges = (ctx, x, y, w, h, Cc, k = 1) => { ctx.fillStyle = Cc.line; ctx.fillRect(x + 14 * k, y + 14 * k, w, h); ctx.fillRect(x + 7 * k, y + 7 * k, w, h); };
export const poly = (ctx, [x, y, w, h], sl = 5) => { ctx.moveTo(x + sl, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - sl, y + h); ctx.lineTo(x, y + h); ctx.closePath(); };
// a sticker or tab pressed on its key: there at 1.1× on the key's frame, settling to 1 in C.stamp (power3 out)
export const stampScale = (t, tl) => { const u = progress(t, tl, C.stamp); return { a: t >= tl ? 1 : 0, s: 1.1 - 0.1 * (1 - (1 - u) ** 3) }; };
export const popScale = (t, pops = []) => { for (const p of pops) { const u = (t - p) / C.pop; if (u >= 0 && u < 1) return 1 + C.popScale * Math.sin(Math.PI * u); } return 1; };
// sheet motion: dealt on (from 800 px below, expo out over a beat), slid off (900 px down, power2 in, 0.35 s)
export const dealY = (t, t0, B) => (t < t0 ? Infinity : 800 * (1 - expOut(progress(t, t0, CB.deal * B))));
export const exitY = (t, t0, d = C.exit) => (t < t0 ? 0 : 900 * progress(t, t0, d) ** 2);
// the tail moves (T0): where the last landing would hold still over more than two beats, the focus is pressed again
// on the beat that splits the hold (1 → 1.12 → 1 in 0.36 s)
export const popsOf = (lastMove, dur, B) => {
  const w = dur - lastMove, cap = 2 * B;
  if (w <= cap + 1e-6) return [];
  const n = Math.ceil(w / cap - 1e-9) - 1, out = [];
  for (let j = 1; j <= n; j++) { const target = lastMove + (j * w) / (n + 1), r = Math.round(target / B) * B; out.push(r - (out.at(-1) ?? lastMove) >= 0.2 && dur - r >= 0.2 ? r : target); }
  return out;
};

// ---------- a placeholder published page (samples): a vendor's benchmark table, black on white ----------
export const PLACEHOLDER = {
  size: [2000, 600], crop: [0, 0, 2000, 600], kind: { en: 'as published', zh: '原样发布' }, where: { en: 'example.com/blog · 2026-10-20', zh: 'example.com/blog · 2026-10-20' },
  rows: [['Tool-Bench v2', '71.4', '68.0', '65.2'], ['Agent-Arena', '58.9', '61.3', '55.0'], ['Long-Ctx 256K', '44.7', '39.8', '41.2'], ['Code-Repair', '63.0', '60.1', '57.5']],
  band: (k) => [40, 190 + k * 90, 1920, 90],
  cell: (k) => ({ region: [1070, 202 + k * 90, 150, 66], ink: [1117, 221 + k * 90, 83, 29] }),
};
let PH = null;
export const placeholderPage = () => {
  if (PH) return PH;
  const [w, h] = PLACEHOLDER.size, c = canvasOf(w, h), g = c.getContext('2d');
  const sans = (wt, z) => ({ family: '"Inter Tight", sans-serif', weight: wt, size: z });
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  text(g, 'Benchmark results (vendor-reported)', 60, 80, sans(700, 46), { color: '#000000' });
  ['Ours', 'Model A', 'Model B'].forEach((s, k) => text(g, s, 1200 + k * 350, 160, sans(600, 34), { color: '#000000', align: 'right' }));
  g.fillStyle = '#000000'; g.fillRect(40, 186, 1920, 3);
  PLACEHOLDER.rows.forEach((r, k) => {
    const y = 250 + k * 90;
    text(g, r[0], 60, y, sans(500, 40), { color: '#000000' });
    r.slice(1).forEach((v, j) => text(g, v, 1200 + j * 350, y, sans(j === 0 ? 700 : 400, 40), { color: '#000000', align: 'right' }));
    g.fillStyle = rgba('#000000', 0.18); g.fillRect(40, 280 + k * 90, 1920, 2);
  });
  PH = c;
  return c;
};
export const loadImage = async (src) => { if (!src) return placeholderPage(); const im = new Image(); im.src = src; await im.decode(); return im; };
// an exhibit spec with the placeholder page's values filled in where the film gave none
export const exhibitSpec = (e = {}, lang = 'en') => ({
  ex: 1, of: 1, size: PLACEHOLDER.size, crop: PLACEHOLDER.crop, kind: PLACEHOLDER.kind[lang] || PLACEHOLDER.kind.en, where: PLACEHOLDER.where[lang] || PLACEHOLDER.where.en,
  band: PLACEHOLDER.band(0), leader: 'down', under: false, sticker: 'right', spread: false, ...e,
});

// ---------- the exhibit sheet ----------
export const tagOf = (ctx, e, lang) => {
  const l1 = widthOf(ctx, exLabel(e.ex, lang), 'tag1', lang) + 18 + widthOf(ctx, e.kind, 'tag2', lang), l2 = widthOf(ctx, e.where, 'tag2', lang);
  return { w: Math.max(300, Math.ceil(Math.max(l1, l2) + 40)), h: TAG_H };
};
// geometry of a sheet: scale (≤ the zoom cap; a spread beside a worksheet is 1112 wide), the mount, the asset's rect,
// the sticker, the mapping from source px
export const sheetOf = (ctx, e, lang) => {
  const [cx, cy, cw, ch] = e.crop;
  const maxW = (e.spread ? SPREAD_W : READ_W) - 2 * M, maxH = BOTTOM - Y0 - (TAG_H - TAG_OVER) - 2 * M;
  const scale = e.scale ?? Math.min(ZOOM_CAP, maxW / cw, maxH / ch);
  const aw = Math.round(cw * scale), ah = Math.round(ch * scale), w = aw + 2 * M, h = ah + 2 * M;
  const tag = tagOf(ctx, e, lang), tx = e.sticker === 'left' ? 0 : w - tag.w;
  return { e, x: X0, y: Y0, w, h, aw, ah, scale, crop: e.crop, tag: { ...tag, x: tx, y: h - TAG_OVER },
    rect: ([x, y, rw, rh]) => [M + (x - cx) * scale, M + (y - cy) * scale, rw * scale, rh * scale],
    pt: (sx, sy) => [M + (sx - cx) * scale, M + (sy - cy) * scale] };
};
// the band as drawn: the lit region (the veil's hole) and the stroke (over the claim, or under the line)
export const bandOf = (G, band, under) => {
  const [x, y, w, h] = G.rect(band);
  const sw = Math.max(7, Math.round(10 * Math.min(1, G.scale + 0.25))), top = under ? y + h - UNDER_SRC * G.scale : y;
  return { lit: [x, y, w, under ? top + sw - y : h], stroke: [x, top, w, under ? sw : h], under: !!under };
};
export const mixBand = (a, b, u) => ({ lit: a.lit.map((v, k) => lerp(v, b.lit[k], u)), stroke: a.stroke.map((v, k) => lerp(v, b.stroke[k], u)), under: u < 0.5 ? a.under : b.under });
// the leader from a band to the sticker, sheet-local points, or null ('down', 'left', 'right', false)
export const leaderOf = (G, band, route = 'down') => {
  if (!route) return null;
  const [bx, by, bw, bh] = band.lit, my = by + bh / 2, t = G.tag, mid = M / 2;
  if (route === 'left') return [[bx, my], [mid, my], [mid, G.h - 6], [t.x, G.h - 6]];
  if (route === 'right') return [[bx + bw, my], [G.w - mid, my], [G.w - mid, t.y]];
  const lo = Math.max(bx + 11, t.x + 24), hi = Math.min(bx + bw - 11, t.x + t.w - 24);
  return lo > hi ? null : [[hi, my], [hi, t.y]];
};
// the sticker: accent, "EX. n" + kind on the first line, where on the second
export const drawSticker = (ctx, x, y, tg, e, Cc, lang, a = 1, s = 1) => {
  if (a <= 0) return;
  ctx.save();
  ctx.translate(x + tg.w / 2, y + tg.h / 2); ctx.scale(s, s); ctx.translate(-tg.w / 2, -tg.h / 2);
  ctx.globalAlpha *= a;
  ctx.fillStyle = Cc.accent; ctx.fillRect(0, 0, tg.w, tg.h);
  const l1 = exLabel(e.ex, lang), w1 = widthOf(ctx, l1, 'tag1', lang);
  text(ctx, l1, 20, 41, F('tag1', lang, l1), { color: Cc.onAccent });
  text(ctx, e.kind, 20 + w1 + 18, 41, F('tag2', lang, e.kind), { color: Cc.onAccent });
  text(ctx, e.where, 20, 76, F('tag2', lang, e.where), { color: Cc.onAccent });
  ctx.restore();
};
// paint a sheet with its top left at (x, y). st: { band, veil 0–1, stroke 0–1 (the wipe), pop, leader: { route, p,
// dot, alpha } | null, stamp: { a, s } | null, edges, bare }
export const paintSheet = (ctx, G, img, st, x, y, Cc, lang) => {
  if (st.edges !== false) edges(ctx, x, y, G.w, G.h, Cc, st.edgeK ?? 1);
  paper(ctx, x, y, G.w, G.h, Cc);
  const [cx, cy, cw, ch] = G.crop;
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.rect(M, M, G.aw, G.ah); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (img) ctx.drawImage(img, cx, cy, cw, ch, M, M, G.aw, G.ah);
  const band = st.band;
  // the veil: the mat laid uniformly over the page outside the lit band
  if (st.veil > 0 && band) {
    ctx.globalAlpha = LOOK.veil * st.veil; ctx.fillStyle = Cc.ground;
    ctx.beginPath(); ctx.rect(M, M, G.aw, G.ah); poly(ctx, band.lit); ctx.fill('evenodd'); ctx.globalAlpha = 1;
  }
  // the stroke: multiply, wiped left to right; pressed again on the tail moves
  if (st.stroke > 0 && band) {
    const [bx, by, bw, bh] = band.stroke, k = st.pop ?? 1;
    ctx.save();
    ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(k, k); ctx.translate(-(bx + bw / 2), -(by + bh / 2));
    ctx.beginPath(); ctx.rect(bx - 2, by - 2, bw * st.stroke + 4, bh + 4); ctx.clip();
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = Cc.accent;
    ctx.beginPath(); poly(ctx, band.stroke, band.under ? 2 : 5); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // the leader: ink case 9 px, accent core 4 px, a dot r 8 on the band; drawn from the band to the sticker
  const Ld = st.leader, pts = Ld && band && !st.bare ? leaderOf(G, band, Ld.route) : null;
  if (pts && Ld.p > 0 && (Ld.alpha ?? 1) > 0) {
    const segs = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1])), len = segs.reduce((a, b) => a + b, 0);
    const left = len * Ld.p;
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= Ld.alpha ?? 1;
    const path = () => { ctx.beginPath(); ctx.moveTo(...pts[0]); let r = left; for (let k = 0; k < segs.length && r > 0; k++) { const u = Math.min(1, r / segs[k]); ctx.lineTo(lerp(pts[k][0], pts[k + 1][0], u), lerp(pts[k][1], pts[k + 1][1], u)); r -= segs[k]; } };
    ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
    path(); ctx.strokeStyle = Cc.onPaper; ctx.lineWidth = 9; ctx.stroke();
    path(); ctx.strokeStyle = Cc.accent; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], 8 * (Ld.dot ?? 1), 0, Math.PI * 2);
    ctx.fillStyle = Cc.accent; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = Cc.onPaper; ctx.stroke();
    ctx.restore();
  }
  if (st.stamp && !st.bare) drawSticker(ctx, x + G.tag.x, y + G.tag.y, G.tag, G.e, Cc, lang, st.stamp.a, st.stamp.s);
};
// a sheet at rest: veiled, struck, its leader drawn and its sticker on
export const restState = (G, e, extra = {}) => ({ band: bandOf(G, e.band, e.under), veil: 1, stroke: 1, leader: e.leader ? { route: e.leader, p: 1, dot: 1 } : null, stamp: { a: 1, s: 1 }, ...extra });

// ---------- the worksheet ----------
// spec: { title, rows: [[label, value]], carry: { region, ink, text } | null, ex, value, caption }; times (s from the
// scene's start, −100 = settled): { title, rows: [..], tab, rule, figure, caption, stroke }
export const worksheetOf = (spec, times, Cc, lang, G) => {
  const w = WORK.w, T = { title: -100, tab: -100, rule: null, figure: null, caption: null, stroke: null, ...times };
  const tab = exLabel(spec.ex ?? 1, lang), tabW = widthOf(mctx(), tab, 'tab', lang);
  const L = { x: WORK.x, y: Y0, w, tab, tabW, tabT: T.tab, rows: [], spec };
  L.title = lineOf(spec.title, 'title', { x: 40, base: 78, at: T.title, color: Cc.onPaper, lang });
  let top = 112;
  if (spec.carry && G) {
    const [rx, ry, rw, rh] = spec.carry.region, ink = spec.carry.ink, kf = clamp(Math.min(28 / ink[3], (w - 80) / rw), 1, 3);
    L.slip = { region: spec.carry.region, ink, text: spec.carry.text, kf, slot: [WORK.x + 40, Y0 + top], w: rw * kf, h: rh * kf };
    top += L.slip.h + 40;
  }
  (spec.rows || []).forEach((r, k) => {
    const at = T.rows?.[k] ?? -100, base = top + k * 64 + 40;
    L.rows.push(lineOf(r[0], 'row', { x: 40, base, at, color: Cc.onPaper, lang }), lineOf(r[1], 'value', { x: w - 40, base, align: 'right', at, color: Cc.onPaper, lang }));
  });
  L.ruleY = top + (spec.rows || []).length * 64 + 18;
  L.ruleT = T.rule;
  if (spec.value != null && T.figure != null) {
    L.fig = lineOf(spec.value, 'fig', { x: 40, base: L.ruleY + 120, at: T.figure, color: Cc.onPaper, lang });
    L.fig.words.forEach((x) => (x.at = T.figure)); // the figure enters as one
    L.caption = lineOf(spec.caption, 'caption', { x: 40, base: L.ruleY + 195, at: T.caption, color: Cc.onPaper, lang });
    L.hlT = T.stroke;
    L.hl = spec.underline ? [28, L.ruleY + 130, L.fig.width + 24, 10] : [28, L.ruleY + 44, L.fig.width + 24, 84];
    L.h = Math.max(WORK.h, L.ruleY + 235);
  } else L.h = Math.max(WORK.h, L.ruleY + 40);
  return L;
};
export const paintWorksheet = (ctx, L, t, x, y, Cc, lang, { B = 0.5, pops = [] } = {}) => {
  edges(ctx, x, y, L.w, L.h, Cc);
  paper(ctx, x, y, L.w, L.h, Cc, { ruled: true });
  ctx.save(); ctx.translate(x, y);
  drawLine(ctx, L.title, t);
  if (t >= L.tabT) {
    const { a, s } = stampScale(t, L.tabT), tw = L.tabW + 20;
    ctx.save(); ctx.translate(L.w - 40 - tw / 2, 60); ctx.scale(s, s); ctx.globalAlpha *= a;
    ctx.fillStyle = Cc.accent; ctx.fillRect(-tw / 2, -18, tw, 36);
    text(ctx, L.tab, -tw / 2 + 10, 9, F('tab', lang, L.tab), { color: Cc.onAccent });
    ctx.restore();
  }
  L.rows.forEach((r) => drawLine(ctx, r, t));
  if (L.ruleT != null && t >= L.ruleT) { const u = expOut(progress(t, L.ruleT, C.rule)); ctx.fillStyle = Cc.onPaper; ctx.fillRect(40, L.ruleY, (L.w - 80) * u, 2); }
  if (L.fig) {
    drawLine(ctx, L.fig, t); drawLine(ctx, L.caption, t);
    if (L.hlT != null && t >= L.hlT) {
      const u = ease1io(progress(t, L.hlT, CB.stroke * B)), k = popScale(t, pops), [hx, hy, hw, hh] = L.hl;
      ctx.save(); ctx.translate(hx + hw / 2, hy + hh / 2); ctx.scale(k, k); ctx.translate(-(hx + hw / 2), -(hy + hh / 2));
      ctx.beginPath(); ctx.rect(hx - 2, hy - 2, hw * u + 4, hh + 4); ctx.clip();
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = Cc.accent; ctx.beginPath(); poly(ctx, L.hl); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
};
// the spread's seam, which stays after split-open: runtime seam.js in ink with a paper key (it is a cut, not a claim)
export const seam = (ctx, x, y0, y1, Cc) => seamV(ctx, x, y0, y1, { key: Cc.paper, accent: Cc.onPaper }, 6);

// ---------- the slip: the figure's own pixels, then the same figure set in code on the same paper ----------
// The code-set slip at its landed size (2× for sharpness): paper and ink sampled from the region (lightest corner,
// darkest pixel), the text registered on the ink box.
export const slipCanvas = (img, S) => {
  const [rx, ry, rw, rh] = S.region;
  const probe = canvasOf(Math.max(1, Math.round(rw)), Math.max(1, Math.round(rh))), pc = probe.getContext('2d', { willReadFrequently: true });
  pc.drawImage(img, rx, ry, rw, rh, 0, 0, probe.width, probe.height);
  const d = pc.getImageData(0, 0, probe.width, probe.height).data;
  let best = 1e9, inkC = [0, 0, 0];
  for (let k = 0; k < d.length; k += 4) { const l = d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11; if (l < best) { best = l; inkC = [d[k], d[k + 1], d[k + 2]]; } }
  const pap = [d[0], d[1], d[2]], R = 2, c = canvasOf(Math.round(S.w * R), Math.round(S.h * R)), g = c.getContext('2d');
  g.fillStyle = `rgb(${pap})`; g.fillRect(0, 0, c.width, c.height);
  const [ix, iy, iw, ih] = S.ink, k = S.kf * R, fam = F('slip').family;
  g.font = `700 100px ${fam}`;
  const m = g.measureText(S.text), mh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const size = (100 * ih * k) / Math.max(1, mh);
  g.font = `700 ${size}px ${fam}`;
  const m2 = g.measureText(S.text), sx = (iw * k) / Math.max(1, m2.actualBoundingBoxLeft + m2.actualBoundingBoxRight);
  g.save(); g.translate((ix - rx) * k, (iy - ry) * k + m2.actualBoundingBoxAscent); g.scale(sx, 1);
  g.fillStyle = `rgb(${inkC})`; g.fillText(S.text, m2.actualBoundingBoxLeft, 0); g.restore();
  return c;
};
// the slip's place at t: [x, y, scale relative to its landed size, phase]; T: { lift, swap, land } in seconds
export const slipAt = (S, G, T, t, pops = []) => {
  const [lx, ly] = G.pt(S.region[0], S.region[1]), s0 = G.scale / S.kf, x0 = X0 + lx, y0 = Y0 + ly;
  if (t < T.swap) {
    const u = 1 - (1 - progress(t, T.lift, T.swap - T.lift)) ** 2, sc = lerp(s0, s0 * 1.2, u);
    return [x0 - ((sc - s0) * S.w) / 2, y0 - ((sc - s0) * S.h) / 2 - 18 * u, sc, 'pixels'];
  }
  const s1 = s0 * 1.2, xA = x0 - ((s1 - s0) * S.w) / 2, yA = y0 - ((s1 - s0) * S.h) / 2 - 18;
  const D = T.land - T.swap, a1 = T.swap + D * 0.4, a2 = a1 + D * 0.333, sC = Math.min(0.55, 34 / S.h), yC = 254;
  if (t < a1) { const u = 1 - (1 - progress(t, T.swap, a1 - T.swap)) ** 2; return [xA, lerp(yA, yC, u), lerp(s1, sC, u), 'code']; }
  if (t < a2) { const u = ease2io(progress(t, a1, a2 - a1)); return [lerp(xA, S.slot[0], u), yC, sC, 'code']; }
  if (t < T.land) { const u = progress(t, a2, T.land - a2) ** 2; return [S.slot[0], lerp(yC, S.slot[1], u), lerp(sC, 1, u), 'code']; }
  return [S.slot[0], S.slot[1], popScale(t, pops), 'landed'];
};
export const paintSlip = (ctx, S, img, code, pose, Cc, dy = 0) => {
  const [x, y, k, phase] = pose;
  ctx.save();
  if (phase === 'landed') { ctx.translate(x + S.w / 2, y + dy + S.h / 2); ctx.scale(k, k); ctx.translate(-S.w / 2, -S.h / 2); }
  else { ctx.translate(x, y + dy); ctx.scale(k, k); }
  ctx.shadowColor = rgba('#000000', 0.28); ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  ctx.fillStyle = Cc.line; ctx.fillRect(-1, -1, S.w + 2, S.h + 2);
  ctx.shadowColor = 'transparent';
  if (phase === 'pixels') { const [rx, ry, rw, rh] = S.region; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, rx, ry, rw, rh, 0, 0, S.w, S.h); }
  else ctx.drawImage(code, 0, 0, S.w, S.h);
  ctx.restore();
};

// ---------- the index of exhibits ----------
// rows: [[n, text, source]]; times: { rows: [..] } (s, −100 settled)
export const ledgerOf = (rows, times, Cc, lang, B = 0.5) => {
  const L = { x: X0, y: Y0, w: READ_W, h: 56 + rows.length * 92 + 24, rows: [] };
  rows.forEach(([n, txt, src], k) => {
    const t0 = times?.rows?.[k] ?? -100;
    const srcL = lineOf(src, 'source', { x: L.w - 64, base: 58 + k * 92 + 26, align: 'right', at: t0 + 0.25 * B, color: Cc.paperMuted, lang });
    L.rows.push({ tab: exLabel(n, lang), t0, y: 56 + k * 92, txt: lineOf(txt, 'row', { x: 200, base: 50 + k * 92 + 40, at: t0, color: Cc.onPaper, lang }), srcL });
  });
  return L;
};
export const paintLedger = (ctx, L, t, x, y, Cc, lang, { k = 1, pops = [] } = {}) => {
  edges(ctx, x, y, L.w, L.h, Cc, k);
  paper(ctx, x, y, L.w, L.h, Cc, { ruled: true });
  ctx.save(); ctx.translate(x, y);
  L.rows.forEach((r, n) => {
    if (t >= r.t0) {
      const { a, s } = stampScale(t, r.t0), tw = widthOf(ctx, r.tab, 'tab', lang) + 20, p = n === L.rows.length - 1 ? popScale(t, pops) : 1;
      ctx.save(); ctx.translate(64 + tw / 2, r.y + 18); ctx.scale(s * p, s * p); ctx.globalAlpha *= a;
      ctx.fillStyle = Cc.accent; ctx.fillRect(-tw / 2, -18, tw, 36);
      text(ctx, r.tab, -tw / 2 + 10, 9, F('tab', lang, r.tab), { color: Cc.onAccent });
      ctx.restore();
    }
    drawLine(ctx, r.txt, t); drawLine(ctx, r.srcL, t);
  });
  ctx.restore();
};

// ---------- what was on the mat when a scene began, leaving ----------
// leaving: { exhibit, worksheet, ledger } (specs as the scenes take them) prepared by prepareLeaving; how: 'exit'
// (each sheet slides 900 px down in 0.35 s from t0) or 'stack' (the file squared — edges closing — and slid off in a beat)
export const prepareLeaving = async (lv, Cc, lang) => {
  if (!lv) return null;
  const out = {}, ctx = mctx();
  if (lv.exhibit) { const e = exhibitSpec(lv.exhibit, lang); out.e = e; out.img = await loadImage(e.src); out.G = sheetOf(ctx, e, lang); }
  if (lv.worksheet) { out.WL = worksheetOf({ ...lv.worksheet, ex: lv.worksheet.ex ?? out.e?.ex }, { rule: lv.worksheet.value != null ? -100 : null, figure: lv.worksheet.value != null ? -100 : null, caption: -100, stroke: lv.worksheet.value != null ? -100 : null }, Cc, lang, out.G); if (out.WL.slip && out.img) out.code = slipCanvas(out.img, out.WL.slip); }
  if (lv.ledger) out.LG = ledgerOf(lv.ledger.rows || [], null, Cc, lang);
  return out;
};
export const paintLeaving = (ctx, D, t, t0, Cc, lang, how = 'exit', B = 0.5) => {
  if (!D || t >= t0 + (how === 'stack' ? CB.stack * B : C.exit) + 0.05) return;
  const dy = how === 'stack' ? exitY(t, t0, CB.stack * B) : exitY(t, t0), k = how === 'stack' ? 1 - clamp(progress(t, t0, CB.stack * B * 0.5)) : 1;
  if (D.G) paintSheet(ctx, D.G, D.img, { ...restState(D.G, D.e), edgeK: k }, X0, Y0 + dy, Cc, lang);
  if (D.WL) { paintWorksheet(ctx, D.WL, 1e6, D.WL.x, D.WL.y + dy, Cc, lang); seam(ctx, D.WL.x, D.WL.y + dy, D.WL.y + dy + D.WL.h, Cc); if (D.WL.slip && D.code) paintSlip(ctx, D.WL.slip, D.img, D.code, [D.WL.slip.slot[0], D.WL.slip.slot[1], 1, 'landed'], Cc, dy); }
  if (D.LG) paintLedger(ctx, D.LG, 1e6, X0, Y0 + dy, Cc, lang, { k });
};
export const ground = (ctx, Cc) => { ctx.fillStyle = Cc.ground; ctx.fillRect(0, 0, W, H); };
// reading: a primary item takes readTime from when it settles; a glance item 1 s (the template's reader)
export const readEnd = (items, lang) => Math.max(0, ...items.map((x) => x.at + C.settle + (x.glance ? 1 : readTime(x.text, lang))));
