// device.js — the engine of the handset bricks: the head-on device (a laptop with a chin, or a phone with the source
// line under it), the views of a real capture on its screen (cover at rest, a region at a zoom, kept inside the
// capture's public region and under the zoom cap), the moves of the screen's content (push, feed, scroll, flip, cut)
// through the runtime hand-offs, the light (veil, ring, level tick) and the margin's copy group. Pure: every function
// is of its arguments; the scenes (screen-*, row-band, device-lockup) import it.
// From the handset template (assets/templates/handset/choreo.js DEVICES, viewOf, group; film.js paintDevice,
// paintScreen, drawCapture, light; moves.js adapters): geometry, timings and the zoom cap are the template's; a
// capture is a slot ({ image, size, public, chin, regions }) instead of content.js's assets table.
import { clamp, lerp, mix, rgba, rrect, text, canvasOf } from '../../../handoffs/util.js';
import { view, zoomBetween, placeholderPage } from '../../../handoffs/asset.js';
import { placeholderLong } from '../../../handoffs/stage.js';
import viewportPush from '../../../handoffs/viewport-push.js';
import spotlightBand from '../../../handoffs/spotlight-band.js';
import scrollReel from '../../../handoffs/scroll-reel.js';
import feedStack from '../../../handoffs/feed-stack.js';
import deviceFlip from '../../../handoffs/device-flip.js';
import { cubicInOut } from '../../../motion.js';
import { fontFor } from '../../lang.js';
import LOOK from '../../look/device-margin/look.js';
import { veilHole, ringRect, tick } from '../region-light/light.js';

export const CAP = 1 / 0.75;            // output px per source px, at most
export const RING_DRAW = 0.25;          // s
export const DEVICES = {
  laptop: {
    body: { x: 96, y: 131, w: 1192, h: 800, r: 28 }, deck: { x: 56, y: 931, w: 1272, h: 18 },
    screen: { x: 116, y: 151, w: 1152, h: 720, r: 8 }, chin: { y: 900 }, cam: { x: 692, y: 141 },
    copy: { x: 1376, w: 448 }, tick: { x: 1284 },
  },
  phone: {
    body: { x: 300, y: 48, w: 440, h: 920, r: 64 }, deck: null,
    screen: { x: 320, y: 88, w: 400, h: 840, r: 44 }, chin: { y: 1004, outside: true }, cam: { x: 520, y: 68 },
    copy: { x: 828, w: 996 }, tick: { x: 736 },
  },
};
export const deviceOf = (form) => DEVICES[form === 'phone' ? 'phone' : 'laptop'];
export const boxOf = (D) => {
  const x0 = Math.min(D.body.x, D.deck?.x ?? D.body.x), x1 = Math.max(D.body.x + D.body.w, D.deck ? D.deck.x + D.deck.w : 0);
  const y1 = Math.max(D.body.y + D.body.h, D.deck ? D.deck.y + D.deck.h : 0, D.chin.outside ? D.chin.y + 16 : 0);
  return { x: x0, y: D.body.y, w: x1 - x0, h: y1 - D.body.y };
};
// the device's neutrals and text tones in any look (the look's extra roles, else mixes of its standard roles)
export const tones = (C) => ({
  glass: C.glass || mix(C.ground, C.onPaper || C.ink, 0.6), deck: C.deck || mix(C.panel, C.ink, 0.05),
  deckEdge: C.deckEdge || mix(C.line, C.ink, 0.08), cam: C.cam || mix(C.panel, C.line, 0.6), muted: C.muted || mix(C.ink, C.ground, 0.28),
});

// ── type ──────────────────────────────────────────────────────────────────────────────────────────────────────────
export const chinFont = (L) => fontFor(LOOK, 'mono', L, L === 'zh' ? 28 : 25, 500);

// ── captures ──────────────────────────────────────────────────────────────────────────────────────────────────────
// A capture: { image (img, canvas, or a URL string the scene's prepare() loads), size [w, h], public [x, y, w, h],
// chin (where it comes from), regions { name: { box [x, y, w, h], band [y, h] } } }, all in the image's own px.
// Without an image the neutral placeholder page (or the long one, for a scroll) stands in, with regions on its rows.
const PAGE = { w: 1600, h: 1000 }, LONG = { w: 1600, h: 4800 };
// the placeholder page's rows (asset.js placeholderPage: a 16 % header, six rows; stage.js placeholderLong: sections)
export const SAMPLE_REGIONS = {
  title: { box: [96, 48, 520, 64] },
  r1: { box: [544, 202, 190, 56], band: [160, 140] },
  r2: { box: [544, 342, 147, 56], band: [300, 140] },
  r3: { box: [544, 482, 218, 56], band: [440, 140] },
  r4: { box: [544, 622, 111, 56], band: [580, 140] },
  s2: { box: [128, 1280, 640, 56], band: [1250, 116] },
  s3: { box: [128, 2480, 800, 56], band: [2450, 116] },
};
export const placeholderCapture = (kind = 'page', chin = '') => {
  const long = kind === 'long', S = long ? LONG : PAGE;
  return { image: long ? placeholderLong(S.w, S.h, 1200) : placeholderPage(S.w, S.h), size: [S.w, S.h], public: null, chin, regions: SAMPLE_REGIONS, placeholder: true };
};
export const captureOf = (c, kind, chin) => (c && c.image ? { regions: {}, ...c, size: c.size || [c.image.naturalWidth || c.image.width, c.image.naturalHeight || c.image.height] } : { ...placeholderCapture(kind, chin), ...(c || {}), image: placeholderCapture(kind).image });
// Load a capture whose image is a URL (prepare only: images are assets, loaded once, not frame state).
export const loadCapture = async (c) => {
  if (!c || typeof c.image !== 'string') return c;
  const im = new Image(); im.src = c.image; await im.decode();
  return { ...c, image: im, size: c.size || [im.naturalWidth, im.naturalHeight] };
};
export const publicOf = (A) => A.public || [0, 0, A.size[0], A.size[1]];

// A view shows the source rect [x, y, scr.w / k, scr.h / k] of a capture on the screen, k output px per source px.
// 'rest': the public region covering the screen, top-left; { region, zoom }: centred on the region at that zoom
// (anchor 'top': the region near the screen's top); { x, y, zoom }: a top-left source point. Inside `public`, ≤ CAP.
export const viewOf = (A, spec, D) => {
  const P = publicOf(A), S = D.screen, cover = Math.max(S.w / P[2], S.h / P[3]);
  const sp = spec == null || spec === 'rest' ? { zoom: 'rest' } : spec;
  let k = sp.zoom == null || sp.zoom === 'rest' ? cover : Number(sp.zoom);
  k = Math.max(cover, Math.min(CAP, k));
  const vw = S.w / k, vh = S.h / k, R = sp.region ? A.regions[sp.region] : null;
  let cx, cy;
  if (R) { cx = R.box[0] + R.box[2] / 2; cy = R.box[1] + R.box[3] / 2; }
  else if (sp.x != null) { cx = sp.x + vw / 2; cy = (sp.y ?? P[1]) + vh / 2; }
  else { cx = P[0] + vw / 2; cy = P[1] + vh / 2; }
  if (sp.anchor === 'top' && R) cy = R.box[1] - 24 / k + vh / 2;
  const x = Math.min(Math.max(cx - vw / 2, P[0]), P[0] + P[2] - vw), y = Math.min(Math.max(cy - vh / 2, P[1]), P[1] + P[3] - vh);
  return { x, y, k, w: vw, h: vh };
};
// a view → asset.js's mapping (screen-local = a · image + b)
export const asView = (v) => view(v.k, -v.x * v.k, -v.y * v.k);
// the registered view of an in-frame cut: the new capture's region sits where the old one's did
export const registered = (v0, A0, A1, region) => {
  const r0 = A0.regions[region].box, r1 = A1.regions[region].box;
  return { ...v0, x: v0.x + (r1[0] - r0[0]), y: v0.y + (r1[1] - r0[1]) };
};

// A capture through a mapping, screen-local; only its public region is ever drawn.
export const drawCapture = (g, A, v, D) => {
  const [cx, cy, cw, ch] = publicOf(A), S = D.screen;
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  const x0 = Math.max(cx, -v.bx / v.a), y0 = Math.max(cy, -v.by / v.a);
  const x1 = Math.min(cx + cw, (S.w - v.bx) / v.a), y1 = Math.min(cy + ch, (S.h - v.by) / v.a);
  if (A.image && x1 > x0 && y1 > y0) g.drawImage(A.image, x0, y0, x1 - x0, y1 - y0, v.bx + x0 * v.a, v.by + y0 * v.a, (x1 - x0) * v.a, (y1 - y0) * v.a);
};

// ── moves of the screen's content (the template's moves.js adapters over the runtime hand-offs) ───────────────────
export const MOVE_BEATS = { push: 1, hop: 1, scroll: 2, feed: 1, flip: 2 };
export const FLIP_SWAP = 0.433;
export const pushAt = (v0, v1, p) => zoomBetween(v0, v1, viewportPush.at(clamp(p) * 0.8).u);
export const hopAt = (p, from, to) => { const S = spotlightBand.at(clamp(p), { from: { band: [0, from[0], 0, from[1]] }, to: { band: [0, to[0], 0, to[1]] } }); return [S.y, S.h]; };
// scroll-reel, window-less inside the screen: the page is the reading column the starting view shows (its left edge
// and the screen's width at its zoom, as film-v2's COLUMN), so the reel's rest scale is the view's own zoom; its
// offset and pull-back scale become a view of the capture
export const scrollAt = (v0, v1, A, D, p) => {
  const pub = publicOf(A), S = D.screen, x0 = -v0.bx / v0.a, col = [x0, pub[1], S.w / v0.a, pub[3]];
  const P = { ...scrollReel.defaults, chrome: false, scrollbar: false, ground: false, line: 0, curve: 'flick', pull: 0.32,
    window: { x: 0, y: 0, w: S.w, h: S.h }, asset: { image: { width: col[0] + col[2], height: col[1] + col[3] }, crop: col },
    from: (-v0.by / v0.a - col[1]) * v0.a, to: (-v1.by / v1.a - col[1]) * v1.a };
  const Dd = scrollReel.prepare(P), St = scrollReel.at(clamp(p), P, Dd), a = Dd.items[0].a * St.k;
  return view(a, Dd.R.w / 2 - (Dd.R.w / 2) * St.k - col[0] * a, P.line - St.s * St.k - col[1] * a);
};
// feed-stack, window-less: the next capture rises from below on its landing spring, the current one steps back
const FEED = { peek: 34, scale: 0.05, veil: 0.4 };
export const feedCards = (p, D) => {
  const S = D.screen, u = feedStack.at(clamp(p)).u, s = 1 - FEED.scale * u, w = S.w * s, h = S.h * s;
  return { u, back: { x: (S.w - w) / 2, y: -FEED.peek * u, w, h, dim: clamp(FEED.veil * u, 0, 0.85) }, front: { x: 0, y: lerp(S.h + 24, 0, u), w: S.w, h: S.h, dim: 0 } };
};
// device-flip: the whole device as a texture turns edge-on, the faces swap there, it lands from the other side
export const flipEnv = (D, C) => {
  const B = boxOf(D);
  return { B, P: { window: { cx: B.x + B.w / 2, cy: B.y + B.h / 2 }, perspective: 2200, shade: 0.6, strips: 120, ground: false, colors: { ground: C.ground, line: C.line } } };
};
export const flipState = (p, variant) => { const S = deviceFlip.at(clamp(p)); return variant === 'left' ? { ...S, th: -S.th } : S; };
export const paintFlip = (g, p, faces, D, C, variant = 'right') => { const { B, P } = flipEnv(D, C); deviceFlip.paint(g, flipState(p, variant), P, { faces, W: B.w, H: B.h }); };
export const trackFlip = (p, faces, D, C, variant = 'right') => { const { B, P } = flipEnv(D, C); return deviceFlip.track(flipState(p, variant), P, { faces, W: B.w, H: B.h }); };
export const faceCanvases = (D) => { const B = boxOf(D); return [canvasOf(B.w, B.h), canvasOf(B.w, B.h)]; };

// ── light: the veil with the lit region's hole (or a band), the ring and the level tick ──────────────────────────
// lit: { alpha, region (name) | null (the whole screen veiled), band [y, h] override, holeFill, ring (0..1 drawn) }
export const regionPoly = (A, name, band) => {
  const R = A.regions[name], Pb = publicOf(A), b = band || R.band;
  if (b) return [[Pb[0], b[0]], [Pb[0] + Pb[2], b[0]], [Pb[0] + Pb[2], b[0] + b[1]], [Pb[0], b[0] + b[1]]];
  const [x, y, w, h] = R.box, pad = 14;
  return [[x - pad, y - pad], [x + w + pad, y - pad], [x + w + pad, y + h + pad], [x - pad, y + h + pad]];
};
export const paintLit = (g, A, v, D, C, lit, veil = 0.52) => {
  if (!lit || lit.alpha <= 0) return;
  const poly = lit.region ? regionPoly(A, lit.region, lit.band).map(([x, y]) => [v.bx + x * v.a, v.by + y * v.a]) : null;
  veilHole(g, { x: 0, y: 0, w: D.screen.w, h: D.screen.h }, poly, C, veil * lit.alpha, lit.holeFill ? veil * lit.holeFill : 0);
  if (lit.region && lit.ring > 0) {
    const [x, y, w, h] = A.regions[lit.region].box;
    ringRect(g, { x: v.bx + x * v.a, y: v.by + y * v.a, w: w * v.a, h: h * v.a }, C, { draw: lit.ring, alpha: lit.ringAlpha ?? 1 });
  }
};
// the level tick on the device's right edge, at the height of the ringed region (film px); null when off screen
export const levelOf = (A, v, D, region) => { const R = A.regions[region].box; return D.screen.y + v.by + (R[1] + R[3] / 2) * v.a; };
export const paintTick = (g, A, v, D, C, region, alpha) => {
  const y = levelOf(A, v, D, region);
  if (alpha > 0 && y > D.screen.y && y < D.screen.y + D.screen.h) tick(g, D.tick.x, y, C, alpha);
};

// ── the device ───────────────────────────────────────────────────────────────────────────────────────────────────
// paint the body (lid, deck, the 2 px edge drawn out from the camera dot by `edge` 0..1, the lid's fill by `fill`),
// then the screen through screenFn(g) (screen-local, clipped), then the chin's source line.
export const paintDevice = (g, D, C, { edge = 1, fill = 1, screen = null, chin = '', chinAlpha = 1, lang = 'en' } = {}) => {
  const b = D.body, T = tones(C);
  g.save(); g.globalAlpha = fill;
  rrect(g, b.x, b.y, b.w, b.h, b.r); g.fillStyle = C.panel; g.fill();
  if (D.deck) { g.fillStyle = T.deck; rrect(g, D.deck.x, D.deck.y, D.deck.w, D.deck.h, 8); g.fill(); }
  g.restore();
  g.save();
  const per = 2 * (b.w + b.h);
  if (edge < 1) { g.setLineDash([(per * edge) / 2, per]); g.lineDashOffset = (per * edge) / 4 - b.w / 2; }
  if (edge > 0) { rrect(g, b.x + 1, b.y + 1, b.w - 2, b.h - 2, b.r - 1); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke(); }
  g.restore();
  if (D.deck) {
    g.fillStyle = T.deckEdge; g.fillRect(D.deck.x + D.deck.w / 2 - (D.deck.w / 2) * edge, D.deck.y, D.deck.w * edge, 2);
    g.fillStyle = C.panel; rrect(g, D.deck.x + D.deck.w / 2 - 90, D.deck.y, 180, 7, 4); g.fill();
    g.beginPath(); g.arc(D.cam.x, D.cam.y, 4, 0, Math.PI * 2); g.fillStyle = T.cam; g.fill();
  } else { g.fillStyle = T.cam; rrect(g, D.cam.x - 36, D.cam.y - 7, 72, 14, 7); g.fill(); }
  const S = D.screen;
  g.save(); g.translate(S.x, S.y);
  rrect(g, 0, 0, S.w, S.h, S.r); g.clip();
  g.fillStyle = T.glass; g.fillRect(0, 0, S.w, S.h);
  if (screen) screen(g);
  g.restore();
  if (chin && chinAlpha > 0) text(g, chin, b.x + b.w / 2, D.chin.y, chinFont(lang), { color: C.dim, align: 'center', baseline: 'middle', alpha: chinAlpha });
};
// a capture painted into a rect of the screen at rest, veiled by dim (the feed's cards)
export const paintCard = (g, A, v, D, C, r, dim) => {
  const S = D.screen;
  g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
  g.translate(r.x, r.y); g.scale(r.w / S.w, r.h / S.h);
  g.fillStyle = tones(C).glass; g.fillRect(0, 0, S.w, S.h);
  drawCapture(g, A, v, D);
  if (dim > 0) { g.fillStyle = rgba(C.ground, dim); g.fillRect(0, 0, S.w, S.h); }
  g.restore();
};
export const ground = (g, C) => { g.fillStyle = C.ground; g.fillRect(0, 0, 1920, 1080); };
export { cubicInOut };

// ── a handset scene: the copy group, the reading plan, the frame ──────────────────────────────────────────────────
// Times inside a scene are beats from its start (as plan() returns them); paint converts to seconds at the scene's bpm.
import { readTime } from '../../lang.js';
import { layout, paintNotes, TEXT_OUT } from '../margin-notes/notes.js';
import { grainTile, grain } from '../../look/device-margin/texture.js';
import { scratch } from '../../../handoffs/util.js';

// The copy group from landing L (beats): the value; the note and the line one beat later; the ring one beat after.
export const group = (L, s, { ring = true } = {}) => {
  const t1 = s.value ? L + 1 : L, items = [];
  if (s.value) items.push({ role: 'display', text: s.value, in: L });
  if (s.line) items.push({ role: 'line', text: s.line, in: t1 });
  if (s.note) items.push({ role: 'note', text: s.note, in: t1 });
  const ringAt = ring ? t1 + 1 : null;
  return { items, ringAt, last: Math.max(t1, ringAt ?? 0) };
};
// Beats the scene needs: its last event plus the ring's draw and a settle, and every primary line read from when it
// enters (lang.js readTime: English 0.3 s a word, Chinese 6 characters a second plus 0.5 s; glance notes 1 s).
export const needBeats = (items, last, bpm, lang, extraSec = 0.45) => {
  const B = 60 / bpm;
  let need = last + extraSec / B;
  for (const i of items) if (i.text && i.role !== 'mark') need = Math.max(need, i.in + (i.role === 'note' || i.role === 'url' ? Math.max(1, readTime(i.text, lang)) : readTime(i.text, lang)) / B + 0.2 / B);
  return need;
};
// Copy items leave TEXT_OUT before the scene's end unless they hold to it (`keep`), or at their own `out` (beats).
export const timed = (items, beats, B, keep = false) => items.map((i) => ({ ...i, in: i.in * B, out: i.out != null ? i.out * B - TEXT_OUT : keep ? null : beats * B - TEXT_OUT }));
export const blockLevel = (y) => Math.min(1080 - 96 - 330, Math.max(96, y - 62));

// What every handset scene's prepare() does: load the captures, the mark and the grain, measure the copy.
export const prepareScene = async (s, ctx, items) => {
  const A = captureOf(await loadCapture(s.screen), s.kind, s.chin);
  const A0 = s.from?.screen ? captureOf(await loadCapture(s.from.screen), s.from.kind, s.from.chin) : A;
  let mark = s.mark || null;
  if (typeof mark === 'string') { const im = new Image(); im.src = mark; await im.decode(); mark = im; }
  const D = deviceOf(s.device), g = scratch();
  const W = s.copyW || D.copy.w;
  const Lay = layout(g, items.map((i) => (i.role === 'mark' ? { ...i, image: mark } : i)), W, ctx.lang, s.display);
  const tile = s.grain > 0 ? grainTile(canvasOf(256, 256), s.seed ?? 3) : null;
  return { A, A0, D, Lay, tile, mark };
};
// The frame: the ground, the device with its screen painted by screenFn (screen-local), the level tick, the copy,
// the grain. chin: the source line; tickAt: { A, v, region, alpha } or null.
export const paintFrame = (g, s, C, Dd, { edge = 1, fill = 1, screenFn, chin, chinAlpha = 1, tickAt = null, t, by, lang }) => {
  ground(g, C);
  paintDevice(g, Dd.D, C, { edge, fill, screen: screenFn, chin, chinAlpha, lang });
  if (tickAt) paintTick(g, tickAt.A, tickAt.v, Dd.D, C, tickAt.region, tickAt.alpha);
  paintNotes(g, Dd.Lay, t, by, Dd.D.copy.x, s.copyW || Dd.D.copy.w, C);
  if (Dd.tile) grain(g, Dd.tile, s.grain);
};
// the light state of a region switched on at `on` (s), ringed at `ringAt` (s) or never: { alpha, region, ring }
export const litAt = (t, region, on, ringAt, extra = {}) => (region && t >= on ? { alpha: clamp((t - on) / 0.2), region, ring: ringAt != null ? clamp((t - ringAt) / RING_DRAW) : 0, ...extra } : null);
// tracked points for the motion blur: the screen's corners at the landing mapping v1, carried back into the source and
// shown through the current mapping v (film px); they move exactly as the capture does
export const trackView = (v, v1, D) => {
  const S = D.screen;
  return [[0, 0], [S.w, 0], [0, S.h], [S.w, S.h]].map(([x, y]) => { const sx = (x - v1.bx) / v1.a, sy = (y - v1.by) / v1.a; return [S.x + v.bx + sx * v.a, S.y + v.by + sy * v.a]; });
};
