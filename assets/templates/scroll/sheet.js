// sheet.js — the Scroll sheet: one long column joined from the content's strips (each a real asset at one scale),
// quote bands, cuts, and the panels unfold scenes open. Pure and Node-safe: timing.rules.js, film.js, score.mjs and
// the tools read the same layout, so the offsets the choreography times are the ones the picture draws.
//
// Coordinates: sheet y in film px from the sheet's top; screen y of a sheet point = TOP + y − off, where `off` is the
// scroll offset. Every strip is drawn at k = SW / its width film px per file px (all strips share one width, so one
// scale: validate() checks it).
import { tabsAt } from './lib/handoffs/section-lock.js';

export const W = 1920, H = 1080;
export const SW = 1496;                          // the sheet column's width (film px)
export const TOP = 54;                           // the viewport's top: above it, the ground
export const OFF0 = -16;                         // the offset that hangs the sheet's top edge at y 70
export const CAP = 4 / 3;                        // zoom cap: output px per source px (an output px covers ≥ 0.75 source px)
export const BAND = { hook: { h: 320, size: 96, weight: 700, lines: [132, 244], chars: 22 }, quote: { h: 250, size: 69, weight: 600, lines: [104, 190], chars: 34 } };
export const NAME = { size: 134, base: 168, chars: 14 }, URL = { size: 35, base: 250, chars: 40 };
export const CUT_H = 32;                         // a cut: the ground shows through (a splice, never hidden)
export const PANEL = { cap: 88, fw: 1216, pad: 20 };
export const MINI = { x: 1664, w: 160, top: 120 };
export const BAND_X = 96;                        // text inset inside a band

export const sheetX = (content) => (content.minimap === 'off' ? Math.round((W - SW) / 2) : 120);
const assetOf = (content, id) => content.assets?.[id];
export const scaleOf = (content) => {
  const first = (content.sheet || []).find((e) => typeof e === 'string');
  const a = assetOf(content, first);
  return a?.size ? SW / a.size[0] : 1;
};
export const panelH = (content, s) => {
  const f = assetOf(content, s.frames);
  const fh = f?.size ? Math.round((PANEL.fw * f.size[1]) / f.size[0]) : 684;
  return PANEL.cap + fh + PANEL.pad;
};

// the layout with the given unfold scenes open: opens = { [sceneIndex]: 0..1 }
export const layout = (content, opens = {}) => {
  const k = scaleOf(content), pieces = [];
  const unfolds = (content.scenes || []).map((s, i) => ({ s, i })).filter(({ s }) => s.type === 'unfold' && s.row);
  let y = 0;
  for (const e of content.sheet || []) {
    if (typeof e === 'string') {
      const a = assetOf(content, e), h = a.size[1];
      // split the strip at every unfold's fold line inside it
      const cuts = unfolds.filter(({ s }) => s.row.asset === e).map(({ s, i }) => ({ fy: s.row.box[1] + s.row.box[3], s, i })).sort((p, q) => p.fy - q.fy);
      let f0 = 0;
      for (const c of cuts) {
        pieces.push({ kind: 'strip', id: e, y, f0, f1: c.fy, h: (c.fy - f0) * k }); y += (c.fy - f0) * k;
        const ph = panelH(content, c.s) * (opens[c.i] ?? 0);
        pieces.push({ kind: 'panel', scene: c.i, y, h: ph, full: panelH(content, c.s) }); y += ph;
        f0 = c.fy;
      }
      pieces.push({ kind: 'strip', id: e, y, f0, f1: h, h: (h - f0) * k }); y += (h - f0) * k;
    } else if (e.cut) { pieces.push({ kind: 'cut', y, h: CUT_H }); y += CUT_H; }
    else if (e.band) { const b = BAND[e.size ?? 'quote']; pieces.push({ kind: 'band', id: e.band, size: e.size ?? 'quote', y, h: b.h }); y += b.h; }
  }
  const L = { pieces, length: y, k };
  // file y of a strip → sheet y
  L.at = (id, fy) => {
    for (const p of pieces) if (p.kind === 'strip' && p.id === id && fy >= p.f0 - 1e-6 && fy <= p.f1 + 1e-6) return p.y + (fy - p.f0) * k;
    throw new Error(`no strip "${id}" at file y ${fy} in the sheet`);
  };
  L.band = (id) => pieces.find((p) => p.kind === 'band' && p.id === id);
  L.panel = (i) => pieces.find((p) => p.kind === 'panel' && p.scene === i);
  return L;
};

// the headings that pin as chapters, for a layout: [{ y, h }] (their own pixels: the box grown 6 px up, 8 down)
export const headsOf = (content, L) => (content.heads || []).map((hd) => ({ y: L.at(hd.asset, Math.max(0, hd.box[1] - 6)), h: (hd.box[3] + 14) * L.k }));
// the pinned tab's height at an offset (0 when none is pinned at the top)
const tabAt = (content, L, off) => {
  const t = tabsAt(off, headsOf(content, L), TOP).find((x) => x.y >= TOP - 0.5);
  return t ? headsOf(content, L)[t.i].h : 0;
};
// put a sheet point at screen y `screen` (default: just under whatever tab pins there)
const place = (content, L, y, screen) => {
  if (screen != null) return y - (screen - TOP);
  let off = y - 100;
  for (let n = 0; n < 3; n++) off = y - tabAt(content, L, off) - 4;
  return off;
};

// every scene's offsets: [{ from, to, rows?, L }]; scenes after an unfold see it open
export const offsets = (content) => {
  const out = [];
  const opens = {};
  let cur = OFF0;
  (content.scenes || []).forEach((s, i) => {
    const L = layout(content, opens), heads = headsOf(content, L);
    const o = { from: cur, to: cur };
    if (s.type === 'open') { o.from = o.to = OFF0; }
    if (s.type === 'quote' && s.at) o.to = place(content, L, L.at(s.at.asset, s.at.y), s.at.screen);
    if (s.type === 'ratchet') {
      const hd = heads[s.head ?? 0];
      o.lock = hd.y;
      o.rows = (s.rows || []).map((r) => L.at(r.asset, r.box[1]) - hd.h);
      o.to = o.rows.at(-1) ?? o.lock;
    }
    if (s.type === 'unfold') o.to = place(content, L, L.at(s.row.asset, s.row.box[1]));
    if (s.type === 'lockup') o.to = OFF0;
    if (s.type === 'unfold') opens[i] = 1;
    o.L = layout(content, opens);
    cur = o.to;
    out.push(o);
  });
  return out;
};
