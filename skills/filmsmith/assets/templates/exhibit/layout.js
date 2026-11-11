// layout.js — the desk as a multiplane: three planes under a camera looking straight down. The desk itself and the
// exhibits' index numerals lie at the back; the prints, each in its mount, lie on a glass in the middle; the chips
// (the claim each print carries, set in code) lie on a glass in front. Every print has the same mount, so every move
// in the library (parallax-slide, camera-truck, grid-hop, match-cut, lift-out, bezel-pullback) rests on exactly the
// frame the template draws. Pure (no DOM): film.js draws from it, tools/check-assets.mjs checks the zoom cap with it.
//
// Coordinates. The middle plane's world is the screen when the camera rests on exhibit 0: exhibit i's mount is the
// rest window shifted i · S to the right. A camera is { cx, cy, z }: the middle-plane point at the frame centre and
// its zoom. A plane with lateral rate r (back 0.3, middle 1, front 1.65: parallax-slide's depths) is seen at zoom
// z_r = 1 / (1 + r (1/z − 1)) and moves r times as far for the same camera move: the rates and zooms of planes at
// three heights under one rising camera (a near plane grows and slides faster; at z = 1 all three are as drawn).
import { coverRect } from './lib/handoffs/asset.js';

export const W = 1920, H = 1080, BAR = 54;
export const CAP = 4 / 3;                 // zoom cap: an output pixel covers at least 0.75 source pixels (principle 2)
export const S = 1920;                    // world px from one mount to the next (a screen: neighbours rest off-frame)
export const WIN = { x: 360, y: 170, w: 1200, h: 675 };   // the rest window: content 1200 × 675 (16:9) under a 54 px bar
export const R = { x: WIN.x, y: WIN.y + BAR, w: WIN.w, h: WIN.h };   // the content rect at rest
export const DEPTH = { back: 0.3, mid: 1, front: 1.65 };
export const NUMERAL = { x: 48, baseline: 330, size: 220 };          // back plane: the exhibit's index, left of its mount
export const CHIP = { x: 1290, y: 770, w: 570, h: 190 };             // front plane: the chip over the mount's lower right
export const CAPTION = 59, CAP_GAP = 76;  // captions on the middle plane, 76 px under the mount (type scale 25·33·44·59·79·105·140)

// exhibits in order of first appearance; each { id, i, crop, region (the 16:9 part of the crop shown), a (content px
// per file px), x (window, world), index ('01' …) }
export const world = (content) => {
  const order = [];
  for (const s of content.scenes || []) if (s.exhibit && !order.includes(s.exhibit)) order.push(s.exhibit);
  const E = {};
  order.forEach((id, i) => {
    const a0 = content.assets?.[id];
    if (!a0) return;
    const region = coverRect(a0.crop, R.w / R.h, a0.focus);
    E[id] = { id, i, crop: a0.crop, region, a: R.w / region[2], x: WIN.x + i * S, source: a0.source ?? '', index: String(i + 1).padStart(2, '0'), chip: a0.chip ?? null };
  });
  const list = order.map((id) => E[id]).filter(Boolean);
  return { E, order: order.filter((id) => E[id]), list, n: list.length, capY: R.y + R.h + CAP_GAP };
};

// file px of exhibit e → middle-plane world
export const fileToWorld = (e, x, y) => [e.x + (x - e.region[0]) * e.a, R.y + (y - e.region[1]) * e.a];
export const fileRect = (e, [x, y, w, h]) => { const [X, Y] = fileToWorld(e, x, y); return { x: X, y: Y, w: w * e.a, h: h * e.a }; };
export const windowOfE = (e) => ({ x: e.x, y: WIN.y, w: WIN.w, h: WIN.h + BAR, bar: BAR, r: 12 });
export const contentOfE = (e) => ({ x: e.x, y: R.y, w: R.w, h: R.h });

// cameras
export const restCam = (e) => ({ cx: 960 + e.i * S, cy: 540, z: 1 });
export const lerpCam = (p, q, u) => {
  // one straight camera move: zoom on a log scale about the point both views share
  if (Math.abs(p.z - q.z) < 1e-9) return { cx: p.cx + (q.cx - p.cx) * u, cy: p.cy + (q.cy - p.cy) * u, z: p.z };
  const vp = viewOf(p), vq = viewOf(q);
  const fx = (vq.bx - vp.bx) / (vp.a - vq.a), fy = (vq.by - vp.by) / (vp.a - vq.a);
  const sx = vp.a * fx + vp.bx, sy = vp.a * fy + vp.by, a = vp.a * Math.pow(vq.a / vp.a, u);
  return camOf({ a, bx: sx - a * fx, by: sy - a * fy });
};
// the middle plane's view { a, bx, by } (screen = a · world + b) of a camera, and back
export const viewOf = (c) => ({ a: c.z, bx: 960 - c.z * c.cx, by: 540 - c.z * c.cy });
export const camOf = (v) => ({ z: v.a, cx: (960 - v.bx) / v.a, cy: (540 - v.by) / v.a });
// a plane's view: its own coordinates are its rest screen positions with exhibit i's items shifted i · S · r
export const zoomOf = (z, r) => 1 / (1 + r * (1 / z - 1));
export const planeView = (c, r) => {
  const a = zoomOf(c.z, r);
  return { a, bx: 960 - a * (r * (c.cx - 960) + 960), by: 540 - a * (r * (c.cy - 540) + 540) };
};
export const pt = (v, x, y) => [v.bx + x * v.a, v.by + y * v.a];
export const rect = (v, r) => ({ x: v.bx + r.x * v.a, y: v.by + r.y * v.a, w: r.w * v.a, h: r.h * v.a });
// the view from file px of e to the screen through camera view v
export const fileView = (v, e) => ({ a: v.a * e.a, bx: v.bx + v.a * (e.x - e.region[0] * e.a), by: v.by + v.a * (R.y - e.region[1] * e.a) });
// a numeral's and a chip's plane coordinates for exhibit e
export const numeralAt = (e) => ({ x: NUMERAL.x + e.i * S * DEPTH.back, baseline: NUMERAL.baseline });
export const chipAt = (e) => ({ x: CHIP.x + e.i * S * DEPTH.front, y: CHIP.y, w: CHIP.w, h: CHIP.h });

// the overview over the whole desk and the title block under the row: screen sizes are the type scale's
// (name 140, line 44, address 40), so world sizes follow the zoom
export const overviewZoom = (Wd) => Math.min(0.62, 1728 / ((Wd.n - 1) * S + WIN.w + 120));
export const overview = (Wd, { line = '', mark = null } = {}) => {
  const L = Wd.list;
  const x0 = L[0].x - 60, x1 = L.at(-1).x + WIN.w + 60, top = WIN.y - 120;
  const below = Wd.capY + 40;                                  // captions under the row
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
  return { cam: { cx: (x0 + x1) / 2, cy: yMid, z }, tb, laneY: top + 50 };
};
