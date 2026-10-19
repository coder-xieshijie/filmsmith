// screen.js — the halftone screen in Canvas2D: an AM screen (amplitude modulated: the dots sit on a fixed grid and
// only their size carries the tone, never a grey). One grid per plate at a real screen angle (black 45°, the process
// ink 15°: 30° apart, the classic pair that keeps the rosette fine). Tones are sampled at each cell's centre, so a
// frame is a pure function of the tone field.
//
// Dot shapes (content.dot, the form variant):
//   round   round dots; area = tone; past 78.5 % (π/4) neighbours touch and the dot grows on until the cell closes
//   square  square dots turned with the grid; side = pitch · √tone, so area = tone; the corners touch at 50 %
//   line    a line screen: one line per grid row, its thickness = pitch · tone, so the dots of a row join into a line
//           whose width carries the tone (the engraver's line screen)

const TAU = Math.PI * 2;
export const SHAPES = ['round', 'square', 'line'];

// dot radius for tone v in [0, 1] on a grid of pitch p (area coverage = v up to π/4, then the cell closes)
export const dotR = (v, p) => {
  if (v <= 0.003) return 0;
  if (v < 0.785) return p * Math.sqrt(v / Math.PI);
  return p * (0.5 + 0.2072 * Math.min(1, (v - 0.785) / 0.215));
};

// Fill the dots of tone(x, y) (screen px → [0, 1]) over the box x0..x1, y0..y1 in one path.
// The grid has its origin at (ox, oy), pitch `pitch` px, turned by `angle` degrees. `shape` from SHAPES.
export const screen = (ctx, { x0 = 0, y0 = 0, x1 = 1920, y1 = 1080, pitch = 14, angle = 45, ox = 960, oy = 540, tone, color, shape = 'round', path = null }) => {
  const a = (angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), p = pitch;
  let umin = Infinity, umax = -Infinity, vmin = Infinity, vmax = -Infinity;
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
    const dx = x - ox, dy = y - oy;
    const u = (dx * c + dy * s) / p, v = (-dx * s + dy * c) / p;
    umin = Math.min(umin, u); umax = Math.max(umax, u); vmin = Math.min(vmin, v); vmax = Math.max(vmax, v);
  }
  const P = path ?? new Path2D();
  for (let i = Math.floor(umin) - 1; i <= Math.ceil(umax) + 1; i++) {
    for (let j = Math.floor(vmin) - 1; j <= Math.ceil(vmax) + 1; j++) {
      const x = ox + (i * c - j * s) * p, y = oy + (i * s + j * c) * p;
      if (x < x0 - p || x > x1 + p || y < y0 - p || y > y1 + p) continue;
      const v = tone(x, y);
      if (!(v > 0.004)) continue;
      if (shape === 'square') {
        const h = (p * Math.sqrt(Math.min(1, v) * 1.02)) / 2; // 2 % bleed so a full cell closes without seams
        const ux = c * h, uy = s * h, vx = -s * h, vy = c * h;
        P.moveTo(x + ux + vx, y + uy + vy); P.lineTo(x - ux + vx, y - uy + vy); P.lineTo(x - ux - vx, y - uy - vy); P.lineTo(x + ux - vx, y + uy - vy); P.closePath();
      } else if (shape === 'line') {
        const hl = p * 0.52, ht = (p * Math.min(1, v)) / 2;
        if (ht < 0.25) continue;
        const ux = c * hl, uy = s * hl, vx = -s * ht, vy = c * ht;
        P.moveTo(x + ux + vx, y + uy + vy); P.lineTo(x - ux + vx, y - uy + vy); P.lineTo(x - ux - vx, y - uy - vy); P.lineTo(x + ux - vx, y + uy - vy); P.closePath();
      } else {
        const r = dotR(v, p);
        if (r <= 0.2) continue;
        P.moveTo(x + r, y);
        P.arc(x, y, r, 0, TAU);
      }
    }
  }
  if (!path) { ctx.fillStyle = color; ctx.fill(P); }
  return P;
};

// Type with a paper knock-out round it: the plate under the type is cleared, as in print, so dots never touch a glyph.
export const knockText = (ctx, s, x, y, { font, color, paper, knock = 0, align = 'left', spacing = 0, alpha = 1 }) => {
  ctx.save();
  ctx.font = font;
  ctx.letterSpacing = `${spacing}px`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha *= alpha;
  if (knock > 0) {
    ctx.lineJoin = 'round'; ctx.lineWidth = knock * 2; ctx.strokeStyle = paper;
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
};
