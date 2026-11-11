// seam.js — what the seam hand-offs (split-open, louvre, wipe-line, split-branch, diff-slider) share: the seam itself (a 6 px accent core with a 2 px paper key on each side,
// so it reads on any frame), clipping to a rectangle, and the pane painters' contract. Pure helpers, no state.
//
// A pane painter is a function (ctx, dx, dy) that draws one pane's whole content shifted by (dx, dy) film px; the
// hand-off clips it. Painters come from the film (a real frame drawn 1:1, a code page), so a hand-off never invents
// content and never blends two contents: every pixel shows exactly one of them (clean-transition criterion C5).
//
// colors: { accent, key, stitch }. stitch: true draws the seam as a cut line (14 px dashes, 6 px gaps; the key only
// under the dashes); unset, the seam is solid.

export const SEAM_W = 6, KEY_W = 2, DASH = 14, GAP = 6;

export const clipRect = (ctx, x, y, w, h, fn) => {
  if (w <= 0 || h <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  fn();
  ctx.restore();
};

// A vertical seam centred on x from y0 to y1; a horizontal one centred on y from x0 to x1.
// dashes on a fixed grid (from the frame's origin), so a moving seam's dashes do not crawl along it
const runs = (a0, a1, stitch) => {
  if (!stitch) return [[a0, a1]];
  const out = [], P = DASH + GAP;
  for (let s = Math.floor(a0 / P) * P; s < a1; s += P) { const u = Math.max(a0, s), v = Math.min(a1, s + DASH); if (v > u) out.push([u, v]); }
  return out;
};

export const seamV = (ctx, x, y0, y1, C, w = SEAM_W) => {
  if (y1 <= y0) return;
  for (const [a, b] of runs(y0, y1, C.stitch)) {
    ctx.fillStyle = C.key; ctx.fillRect(x - w / 2 - KEY_W, a, w + 2 * KEY_W, b - a);
    ctx.fillStyle = C.accent; ctx.fillRect(x - w / 2, a, w, b - a);
  }
};
export const seamH = (ctx, y, x0, x1, C, w = SEAM_W) => {
  if (x1 <= x0) return;
  for (const [a, b] of runs(x0, x1, C.stitch)) {
    ctx.fillStyle = C.key; ctx.fillRect(a, y - w / 2 - KEY_W, b - a, w + 2 * KEY_W);
    ctx.fillStyle = C.accent; ctx.fillRect(a, y - w / 2, b - a, w);
  }
};

// A neutral sample content for the defaults (a page of grey rows over the whole frame, shifted by dx, dy); `tone` 1
// is the dark one, so a before and an after differ. Films pass their own painters.
const ROWS = [900, 640, 1100, 520, 820, 980, 600, 1040, 700];
export const samplePane = (tone = 0) => (ctx, dx = 0, dy = 0) => {
  ctx.fillStyle = tone ? '#1C2026' : '#EEEDE8'; ctx.fillRect(dx, dy, 1920, 1080);
  ctx.fillStyle = tone ? '#5C6670' : '#B9B8B2';
  ROWS.forEach((w, i) => ctx.fillRect(dx + 160 + (tone ? 240 : 0), dy + 150 + i * 96, w, 28));
};
