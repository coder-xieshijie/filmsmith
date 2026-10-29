// sheets/common.js — shared geometry and lettering for every sheet type.
// Sheet-local coordinates: one sheet is 1920 × 1080; content sits between x = 150 and x = 1790.
import { stampBox } from '../fx.js';

export const X0 = 150, X1 = 1790, CW = X1 - X0;
export const up = (s) => String(s ?? '').toUpperCase();

// The type scale: ISO 3098 lettering heights, stepping by √2 (2.5 · 3.5 · 5 · 7 · 10 · 14 · 20 · 28 mm), at 10 px a
// millimetre. Each sheet uses three tiers: title (140; one-line heads 100; the release name 200), notes (35; the
// problem's values 70) and labels (25, the floor). The HUD, the stamps and the drawn read-outs (the checklist
// count) are counted apart, but their sizes come from the same series. env.fit() (film.js) steps down the series,
// so a fitted size stays on it. Settled 2026-10-18 (check C9; accepted on the recommendation; the owner did not
// compare it shot by shot); the source film's sizes (150 / 64 / 44 / 26 …) were removed.
// Text that carries information is ≥ 25 px (principle 1, landscape full-screen on a phone); MIN is the floor.
export const ISO = [25, 35, 50, 70, 100, 140, 200, 280];
export const MIN = 25;
export const F = {
  label: { fam: 'mono', w: 400, size: 25, track: 0.14 }, // figure label, line colour
  tag: { fam: 'mono', w: 400, size: 25, track: 0.14 }, // box tags, column heads
  sub: { fam: 'mono', w: 400, size: 35 }, // one-line explanation, muted
  body: { fam: 'mono', w: 400, size: 35 }, // annotations
  small: { fam: 'mono', w: 400, size: 25 },
  title: { fam: 'cond', w: 700, size: 140, track: -0.02 }, // one-word sheet title
  head2: { fam: 'cond', w: 700, size: 100, track: -0.02 }, // one-line sheet title
  claim: { fam: 'cond', w: 700, size: 140, track: -0.02 }, // two-line claim
};
export const sz = (f, size, extra = {}) => ({ ...f, size, ...extra });

// Label + construction lines + a title of one or two lines. Returns the title's bounding rect.
// o: { lines: [str], fonts: [f], bases: [y], cues: [t], minSize }
export const header = (pen, env, s, o) => {
  const { lines, bases, cues } = o;
  env.lim('label', s.label, 36);
  pen.text(up(s.label), X0, 180, F.label, cues[0] - 0.42, 0.45, { col: 'line' });
  let rect = null;
  lines.forEach((str, i) => {
    const f = env.fit(str, o.fonts[i], CW, o.minSize, `title line ${i + 1}`);
    pen.guides(bases[i], f.size, cues[i] - (i ? 0.15 : 0.38));
    const it = pen.text(str, X0 - 8, bases[i], f, cues[i], o.dur || 0.6 * (str.length > 12 ? 1.15 : 1));
    rect = rect ? union(rect, it.rect) : it.rect;
  });
  return rect;
};

export const union = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]);
  return [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y];
};

const meets = (a, b) => !(a[0] + a[2] <= b[0] || b[0] + b[2] <= a[0] || a[1] + a[3] <= b[1] || b[1] + b[3] <= a[1]);

// Where a stamp may land: the free spot nearest `prefer` inside `region` [x0, y0, x1, y1] whose rotated box
// stays `margin` px clear of every lettering on the sheet (pen text items: key numbers, captions, labels) and
// of the extra rects in `avoid` (custom-drawn figures such as a computed count) and env.hud (the HUD at rest,
// mapped into sheet coordinates). A stamp
// lands beside the result it certifies, never on top of it. Call it after all lettering is placed.
export const solveStamp = (pen, env, box, { prefer, region, avoid = [], margin = 14, where = 'stamp' }) => {
  const [bw, bh] = box;
  const blocks = [...pen.items.filter((it) => it.k === 'text' && !it.f.outline).map((it) => it.rect), ...avoid, ...(env.hud || [])]
    .map((r) => [r[0] - margin, r[1] - margin, r[2] + 2 * margin, r[3] + 2 * margin]);
  let best = null;
  for (let cy = region[1] + bh / 2; cy <= region[3] - bh / 2 + 1e-6; cy += 4) {
    for (let cx = region[0] + bw / 2; cx <= region[2] - bw / 2 + 1e-6; cx += 4) {
      const R = [cx - bw / 2, cy - bh / 2, bw, bh];
      if (blocks.some((b) => meets(R, b))) continue;
      const d = Math.hypot(cx - prefer[0], cy - prefer[1]);
      if (!best || d < best.d) best = { cx, cy, d };
    }
  }
  if (!best) { env.err(`${where}: no place clear of the lettering; shorten the stamp or the copy around it`); return { cx: prefer[0], cy: prefer[1] }; }
  return best;
};

// The largest stamp (sizes tried in order) that solveStamp can place clear of the lettering; the stamp's
// own lettering stays ≥ 25 px at every size (fx.js). Returns { st, box, cx, cy, rect }.
export const fitStamp = (pen, env, spec, { sizes, rot, role = 'accent', ...opts }) => {
  let last = null;
  for (const size of sizes) {
    const st = env.stamp(spec, size, role), box = stampBox(st, rot);
    const quiet = { ...env, err: () => {} };
    const p = solveStamp(pen, size === sizes[sizes.length - 1] ? env : quiet, box, opts);
    last = { st, box, ...p, rect: [p.cx - box[0] / 2, p.cy - box[1] / 2, box[0], box[1]] };
    if (p.d !== undefined) break;
  }
  return last;
};

// A box whose outline draws itself, then its lettering appears. Returns the box rect.
export const box = (pen, x, y, w, h, t, st = 's1', dur = 0.4) => {
  pen.rect(x, y, w, h, t, dur, st);
  return [x, y, w, h];
};

// Spans: a string or [[text, role], ...] → { text, spans }
export const spans = (v) => (Array.isArray(v) ? { text: v.map((p) => p[0]).join(''), spans: v } : { text: String(v ?? ''), spans: null });
