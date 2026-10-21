// layout.js — the desk: one world coordinate system (film px at camera zoom 1) in which every exhibit lies in a row,
// mounted, at one scale per exhibit, and the views from file px to world and from world to screen. Pure (no DOM):
// film.js draws from it, tools/check-assets.mjs checks the zoom cap with it.
export const W = 1920, H = 1080, BAR = 54;
export const CAP = 4 / 3;              // zoom cap: an output pixel covers at least 0.75 source pixels (principle 2)
export const MAX_W = 1500, MAX_H = 740; // the largest exhibit, content area (the caption and the frame margin fit under it)
export const GAP = 200;                // world px between neighbouring mounts
export const CAPTION = 59, CAP_GAP = 76; // caption size and its baseline below the mount (type scale 25·33·44·59·79·105·140)
export const CARD_GAP = 70;              // a set-down reading's top below the caption baseline

// exhibits in order of first appearance; each { id, crop, w, h, x, y (window), a (world px per file px) }
export const world = (content) => {
  const order = [];
  for (const s of content.scenes || []) if (s.exhibit && !order.includes(s.exhibit)) order.push(s.exhibit);
  const E = {};
  let x = 0;
  for (const id of order) {
    const a0 = content.assets?.[id];
    if (!a0) continue;
    const [cx, cy, cw, ch] = a0.crop;
    const w = Math.round(Math.min(MAX_W, (MAX_H * cw) / ch, CAP * cw)), h = (w * ch) / cw;
    E[id] = { id, crop: a0.crop, w, h, x, y: Math.round(540 - (h + BAR) / 2), a: w / cw, cx, cy, source: a0.source ?? '' };
    x += w + GAP;
  }
  // camera x (screen = world − cam at zoom 1) that centres each exhibit
  for (const e of Object.values(E)) e.cam = e.x + e.w / 2 - 960;
  const list = order.map((id) => E[id]).filter(Boolean);
  const bottom = Math.max(...list.map((e) => e.y + BAR + e.h));
  return { E, order: order.filter((id) => E[id]), list, bottom, capY: bottom + CAP_GAP };
};

// file px of exhibit e → world point / rect
export const fileToWorld = (e, x, y) => [e.x + (x - e.cx) * e.a, e.y + BAR + (y - e.cy) * e.a];
export const fileRect = (e, [x, y, w, h]) => { const [X, Y] = fileToWorld(e, x, y); return { x: X, y: Y, w: w * e.a, h: h * e.a }; };
// the mount window of e in world px ({ x, y, w, h, bar, r }, the shape lib/handoffs/asset.js draws)
export const windowOfE = (e) => ({ x: e.x, y: e.y, w: e.w, h: e.h + BAR, bar: BAR, r: 12 });

// a camera view { a, bx, by }: screen = a · world + b
export const camView = (camX, z = 1, cy = 540) => ({ a: z, bx: 960 - (camX + 960) * z, by: 540 - cy * z });
export const compose = (v, a, bx, by) => ({ a: v.a * a, bx: v.a * bx + v.bx, by: v.a * by + v.by }); // v ∘ (a·x + b)
export const pt = (v, x, y) => [v.bx + x * v.a, v.by + y * v.a];
export const rect = (v, r) => ({ x: v.bx + r.x * v.a, y: v.by + r.y * v.a, w: r.w * v.a, h: r.h * v.a });
// the view from file px of e to the screen through camera view v
export const fileView = (v, e) => compose(v, e.a, e.x - e.cx * e.a, e.y + BAR - e.cy * e.a);
export const lerpView = (p, q, u) => {
  // a zoom about the point both views share, on a log scale (one straight camera move)
  if (Math.abs(p.a - q.a) < 1e-9) return { a: p.a, bx: p.bx + (q.bx - p.bx) * u, by: p.by + (q.by - p.by) * u };
  const fx = (q.bx - p.bx) / (p.a - q.a), fy = (q.by - p.by) / (p.a - q.a);
  const sx = p.a * fx + p.bx, sy = p.a * fy + p.by, a = p.a * Math.pow(q.a / p.a, u);
  return { a, bx: sx - a * fx, by: sy - a * fy };
};

// the overview over the whole desk and the title block under the row: screen sizes are the type scale's
// (name 140, line 44, address 40), so world sizes follow the zoom
// card: the height of a reading set down under its exhibit (film.js), 0 when the film carries none
export const overview = (Wd, { name = '', line = '', mark = null, card = 0 } = {}) => {
  const L = Wd.list;
  const x0 = L[0].x - 60, x1 = L.at(-1).x + L.at(-1).w + 60, top = Math.min(...L.map((e) => e.y)) - 120;
  const below = Wd.capY + 40 + (card ? CARD_GAP + card : 0) + 40;   // captions and set-down readings under the row
  const tbScreen = (mark ? 120 : 0) + 140 + (line ? 76 : 0) + 96 + 40;
  const zh = 1728 / (x1 - x0), zv = (972 - tbScreen) / (below - top + 300);
  const z = Math.min(zh, zv, 0.62);
  const tb = { x: L[0].x, top: below + 300 / 2, z };
  tb.markH = mark ? 100 / z : 0;
  tb.nameSize = 140 / z; tb.lineSize = 44 / z; tb.urlSize = 40 / z;
  tb.markY = tb.top;
  tb.nameY = tb.top + tb.markH + (mark ? 40 / z : 0) + tb.nameSize * 0.78;
  tb.ruleY = tb.nameY + 26 / z;
  tb.lineY = tb.ruleY + (line ? 64 / z : 0);
  tb.urlY = (line ? tb.lineY : tb.ruleY) + 76 / z;
  const yMid = (top + tb.urlY + 30 / z) / 2;
  return { view: { a: z, bx: 960 - ((x0 + x1) / 2) * z, by: 540 - yMid * z }, tb, laneY: top + 50 };
};
