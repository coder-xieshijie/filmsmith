// halftone.js — an AM halftone screen in Canvas2D (the halftone mode's print surface; used by anchor-swap and
// field-morph, and by any scene that prints a tone field).
//
// Round dots on a square grid at a real screen angle (black 45°, process cyan 15°, magenta 75°, yellow 0°); a dot's area
// is the tone (no grey, only size); past 78.5 % the dots touch and grow on until they close the cell at 100 %. Tones are
// sampled at each cell's centre, so the screen is a pure function of the tone field.
//
// Small screens: a rotated dot grid finer than about 6 output px beats against the pixel grid (moiré), and a dot under a
// pixel rounds to nothing or to a whole pixel. Below `minPitch` the screen is printed as what the eye sees at that size,
// the flat tone (each cell an axis-aligned square of the plate colour at coverage = tone, so the average is unchanged);
// between minPitch and 1.6 × minPitch the flat tone is laid over the dots in proportion, so a zoom passes from dots to
// tone without a jump.

const TAU = Math.PI * 2;

// dot radius for tone v in [0, 1] on a grid of pitch p (area coverage = v)
export const dotR = (v, p) => {
  if (v <= 0.003) return 0;
  if (v < 0.785) return p * Math.sqrt(v / Math.PI);
  return p * (0.5 + 0.2072 * Math.min(1, (v - 0.785) / 0.215));
};

const dots = (ctx, { x0, y0, x1, y1, pitch: p, angle, ox, oy, tone, color }) => {
  const a = (angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  let umin = Infinity, umax = -Infinity, vmin = Infinity, vmax = -Infinity;
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
    const dx = x - ox, dy = y - oy;
    const u = (dx * c + dy * s) / p, v = (-dx * s + dy * c) / p;
    umin = Math.min(umin, u); umax = Math.max(umax, u); vmin = Math.min(vmin, v); vmax = Math.max(vmax, v);
  }
  ctx.beginPath();
  for (let i = Math.floor(umin) - 1; i <= Math.ceil(umax) + 1; i++) {
    for (let j = Math.floor(vmin) - 1; j <= Math.ceil(vmax) + 1; j++) {
      const x = ox + (i * c - j * s) * p, y = oy + (i * s + j * c) * p;
      if (x < x0 - p || x > x1 + p || y < y0 - p || y > y1 + p) continue;
      const r = dotR(tone(x, y), p);
      if (r <= 0.15) continue;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, TAU);
    }
  }
  ctx.fillStyle = color;
  ctx.fill();
};

// flat tone: axis-aligned cells of side `cell`, each filled with the plate colour at alpha = tone
const flat = (ctx, { x0, y0, x1, y1, tone, color, cell, alpha }) => {
  ctx.save();
  ctx.fillStyle = color;
  const ax = Math.floor(x0 / cell) * cell, ay = Math.floor(y0 / cell) * cell;
  for (let y = ay; y < y1; y += cell) {
    for (let x = ax; x < x1; x += cell) {
      const v = Math.min(1, Math.max(0, tone(x + cell / 2, y + cell / 2)));
      if (v <= 0.003) continue;
      ctx.globalAlpha = v * alpha;
      ctx.fillRect(x, y, cell, cell);
    }
  }
  ctx.restore();
};

// Fill the screen of tone(x, y) (screen px → [0, 1]) over the box x0..x1, y0..y1. Grid origin (ox, oy), pitch in
// output px, angle in degrees. Pass the context's scale in `scale` when drawing under a transform, so minPitch is judged
// in output pixels.
export const screen = (ctx, { x0 = 0, y0 = 0, x1 = 1920, y1 = 1080, pitch = 12, angle = 45, ox = 960, oy = 540, tone, color, minPitch = 6, scale = 1 }) => {
  const out = pitch * scale;
  const w = Math.min(1, Math.max(0, (1.6 * minPitch - out) / (0.6 * minPitch)));   // 0 = dots, 1 = flat tone
  const box = { x0, y0, x1, y1, tone, color };
  // the flat cell is a whole number (2–4) of output px on the pixel grid: no beat with it, no seams between cells
  const cell = Math.max(2, Math.min(4, Math.round(out))) / scale;
  if (w <= 0) { dots(ctx, { ...box, pitch, angle, ox, oy }); return; }
  if (w >= 1) { flat(ctx, { ...box, cell, alpha: 1 }); return; }
  // blend: dots at opacity 1 − w (mean coverage (1 − w)·v), then the flat tone at the alpha that brings the mean to v
  ctx.save();
  ctx.globalAlpha = 1 - w;
  dots(ctx, { ...box, pitch, angle, ox, oy });
  ctx.restore();
  flat(ctx, { ...box, cell, alpha: 1, tone: (x, y) => { const v = Math.min(1, Math.max(0, tone(x, y))); return (w * v) / (1 - (1 - w) * v || 1); } });
};

// Text with a paper knock-out around it (the plate is cleared under the type, as in print).
export const knockText = (ctx, s, x, y, { family = 'sans-serif', weight = 800, size = 96, color, paper, knock = 0, align = 'left', spacing = 0 }) => {
  ctx.save();
  ctx.font = `${weight} ${size}px ${/^(serif|sans-serif|monospace)$/.test(family) ? family : `"${family}"`}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (knock > 0) {
    ctx.lineJoin = 'round'; ctx.lineWidth = knock * 2; ctx.strokeStyle = paper;
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
};
