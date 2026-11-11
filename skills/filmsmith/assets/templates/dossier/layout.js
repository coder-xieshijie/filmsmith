// layout.js — where everything sits, in film px, computed from content.js alone (no measuring: mono type is 15 px a
// character at 25 px). film.js draws from it; tools/check-assets.mjs checks the crops, scales and leaders against it.
//
// The frame: 1920 × 1080, graphics-safe 96 px left and right, 54 px top and bottom. The persistent frame (slug, page
// in hand) at y 54; the claim on the mat at y 140, its terms at y 208; the reading position from y 292; a sheet is the
// asset plus a 24 px paper mount, its sticker overlapping only the mount's lower margin by 12 px. A sheet followed by a
// worksheet is laid out as a spread from its first frame (the worksheet at x 1240, 584 wide).
export const W = 1920, H = 1080;
export const M = 24; // mount margin
export const ZOOM_CAP = 1 / 0.75; // output px per source px: one output px covers at least 0.75 source px
export const X0 = 96, Y0 = 292, READ_W = 1728, BOTTOM = 1026;
export const TAG_H = 96, TAG_OVER = 12; // sticker height; how far it overlaps the mount's lower margin
export const SPREAD_W = 1112; // outer width of a sheet beside a worksheet
export const WORK = { x: 1240, y: Y0, w: 584, h: 600 };
export const MONO_ADV = 15; // IBM Plex Mono advance at 25 px (0.6 em)
export const CLAIM_Y = 140, TERMS_Y = 208, HEADER_Y = 54;
export const UNDER_SRC = 2; // an under-stroke starts this many source px above the band's lower edge

// the exhibit that owns scene i (itself, or the exhibit a claim, worksheet or result follows)
export const sheetIndex = (scenes, i) => { for (let k = i; k >= 0; k--) if (scenes[k].type === 'exhibit') return k; return -1; };
// an exhibit is a spread when a worksheet follows it before the next exhibit
export const isSpread = (scenes, i) => {
  for (let k = i + 1; k < scenes.length; k++) { if (scenes[k].type === 'exhibit' || scenes[k].type === 'ledger' || scenes[k].type === 'lockup') return false; if (scenes[k].type === 'worksheet') return true; }
  return false;
};

export const tagOf = (ex, kind, where) => {
  const l1 = (`EX. ${ex}`.length + kind.length) * MONO_ADV + 18, l2 = where.length * MONO_ADV;
  return { w: Math.max(300, Math.max(l1, l2) + 40), h: TAG_H };
};

// The sheet of exhibit scene i: scale, outer box, the asset's rect inside it, the sticker and the mapping source → local.
const fitOf = (content, i) => {
  const s = content.scenes[i], [, , cw, ch] = s.crop;
  const maxW = (isSpread(content.scenes, i) ? SPREAD_W : READ_W) - 2 * M, maxH = BOTTOM - Y0 - (TAG_H - TAG_OVER) - 2 * M;
  return Math.min(ZOOM_CAP, maxW / cw, maxH / ch);
};
const nextExhibit = (scenes, i) => { for (let k = i + 1; k < scenes.length; k++) if (scenes[k].type === 'exhibit') return k; return -1; };
export const sheetOf = (content, i) => {
  const s = content.scenes[i], A = content.assets[s.asset];
  const [cx, cy, cw, ch] = s.crop;
  const spread = isSpread(content.scenes, i);
  // a match cut needs the value printed at one size on both sides of the cut: each sheet is scaled so its box (`match`
  // from / to) is as tall as the smaller of the two at their fits
  let scale = fitOf(content, i);
  const j = nextExhibit(content.scenes, i), k = sheetIndex(content.scenes, i - 1);
  const matched = (a, b, m) => Math.min(fitOf(content, a) * m.from[3], fitOf(content, b) * m.to[3]);
  if (j >= 0 && content.scenes[j].enter === 'match-cut' && content.scenes[j].match) scale = Math.min(scale, matched(i, j, content.scenes[j].match) / content.scenes[j].match.from[3]);
  if (s.enter === 'match-cut' && k >= 0 && s.match) scale = Math.min(scale, matched(k, i, s.match) / s.match.to[3]);
  const aw = Math.round(cw * scale), ah = Math.round(ch * scale);
  const w = aw + 2 * M, h = ah + 2 * M;
  const tag = tagOf(s.ex, A.kind, s.where);
  const tx = (s.sticker ?? 'right') === 'left' ? 0 : w - tag.w;
  const rect = ([x, y, rw, rh]) => [M + (x - cx) * scale, M + (y - cy) * scale, rw * scale, rh * scale];
  return { i, x: X0, y: Y0, w, h, aw, ah, scale, spread, crop: s.crop, file: A.file, size: A.size, rect,
    pt: (sx, sy) => [M + (sx - cx) * scale, M + (sy - cy) * scale], tag: { ...tag, x: tx, y: h - TAG_OVER } };
};

// The band as drawn: the lit region (the veil's hole) and the stroke (over the claim, or under the line).
export const bandOf = (content, sh, scene) => {
  const [x, y, w, h] = sh.rect(scene.band);
  const under = scene.under === true || content.highlight === 'underline';
  const sw = Math.max(7, Math.round(10 * Math.min(1, sh.scale + 0.25))); // an under-stroke ≥ 7 px (a coloured line over a field ≥ 4)
  const top = under ? y + h - UNDER_SRC * sh.scale : y;
  return { lit: [x, y, w, under ? top + sw - y : h], stroke: [x, top, w, under ? sw : h], under };
};

// The leader of a band, sheet-local points from the band to the sticker, or null. It runs in the mount's margins
// wherever it can: 'left' leaves the band's left end into the left margin, down the margin and along the bottom margin
// to the sticker; 'right' the same on the right; 'down' drops straight from inside the band to the sticker's top edge
// (only where the band lies over the sticker). tools/check-assets.mjs checks that the part over the asset crosses no ink.
export const leaderOf = (sh, band, route = 'down') => {
  if (route === false) return null;
  const [bx, by, bw, bh] = band.lit, my = by + bh / 2, t = sh.tag, mid = M / 2;
  if (route === 'left') return [[bx, my], [mid, my], [mid, sh.h - 6], [t.x, sh.h - 6]];
  if (route === 'right') return [[bx + bw, my], [sh.w - mid, my], [sh.w - mid, t.y]];
  const lo = Math.max(bx + 11, t.x + 24), hi = Math.min(bx + bw - 11, t.x + t.w - 24);
  if (lo > hi) return null;
  return [[hi, my], [hi, t.y]];
};
// the leader's segments that lie over the asset, in source px (for the ink check)
export const leaderOverAsset = (sh, pts) => {
  if (!pts) return [];
  const toSrc = ([x, y]) => [sh.crop[0] + (x - M) / sh.scale, sh.crop[1] + (y - M) / sh.scale];
  const out = [];
  for (let k = 0; k + 1 < pts.length; k++) {
    let [a, b] = [pts[k], pts[k + 1]];
    // clip to the asset rect
    const x0 = Math.max(M, Math.min(a[0], b[0])), x1 = Math.min(M + sh.aw, Math.max(a[0], b[0]));
    const y0 = Math.max(M, Math.min(a[1], b[1])), y1 = Math.min(M + sh.ah, Math.max(a[1], b[1]));
    if (x1 - x0 < 1 && y1 - y0 < 1) continue;
    if (x1 < x0 || y1 < y0) continue;
    out.push([toSrc([x0, y0]), toSrc([x1, y1])]);
  }
  return out;
};

export const ledgerBox = (rows) => ({ x: X0, y: Y0, w: READ_W, h: 56 + rows * 92 + 24 });
