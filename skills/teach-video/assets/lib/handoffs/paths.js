// paths.js — polylines measured by arc length, outlines resampled for shape interpolation, segment crossings.

// { pts, cum, len } for a polyline [[x, y], ...]; cum[i] = arc length up to point i.
export const measurePath = (pts) => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
};

// [x, y, angle] at arc length s (clamped to the path).
export const pointAt = (path, s) => {
  const { pts, cum, len } = path;
  if (pts.length < 2) return [pts[0][0], pts[0][1], 0];
  const q = Math.min(len, Math.max(0, s));
  let lo = 0, hi = pts.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= q) lo = mid; else hi = mid; }
  const a = (q - cum[lo]) / (cum[lo + 1] - cum[lo] || 1);
  const [x0, y0] = pts[lo], [x1, y1] = pts[lo + 1];
  return [x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, Math.atan2(y1 - y0, x1 - x0)];
};

// Path of the stretch [a, b] of arc length (call ctx.stroke() after).
export const spanPath = (ctx, path, a, b) => {
  ctx.beginPath();
  if (b <= a) return false;
  const { pts, cum } = path;
  let started = false;
  for (let i = 0; i < pts.length - 1; i++) {
    if (cum[i + 1] < a || cum[i] > b) continue;
    const L = cum[i + 1] - cum[i] || 1;
    const f0 = (Math.max(a, cum[i]) - cum[i]) / L, f1 = (Math.min(b, cum[i + 1]) - cum[i]) / L;
    const x0 = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f0, y0 = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f0;
    const x1 = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f1, y1 = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f1;
    if (!started) { ctx.moveTo(x0, y0); started = true; }
    ctx.lineTo(x1, y1);
  }
  return started;
};

export const polyPath = (ctx, pts, closed = false) => {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  if (closed) ctx.closePath();
};

// A closed outline from a parametric curve f(u), u in [0, 1) (start at the top, counter-clockwise on screen), scaled to
// perimeter L and resampled at n equal arc-length steps: two outlines sampled this way correspond point for point, which
// is what lets one interpolate into the other without folding (Sederberg & Greenwood 1992).
export const resampleClosed = (f, n = 400, L = 1600, dense = 4000) => {
  const pts = [];
  for (let i = 0; i <= dense; i++) pts.push(f(i / dense));
  const { cum } = measurePath(pts);
  const per = cum[dense], k = L / per, out = [];
  let j = 0;
  for (let m = 0; m < n; m++) {
    const s = (per * m) / n;
    while (cum[j + 1] < s) j++;
    const a = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    out.push([(pts[j][0] + (pts[j + 1][0] - pts[j][0]) * a) * k, (pts[j][1] + (pts[j + 1][1] - pts[j][1]) * a) * k]);
  }
  return out;
};

// Closed polygon (list of vertices, any scale) as a parametric curve for resampleClosed.
export const polygonCurve = (poly) => {
  const path = measurePath([...poly, poly[0]]);
  return (u) => { const [x, y] = pointAt(path, u * path.len); return [x, y]; };
};

// Do segments p1-p2 and p3-p4 properly cross?
export const segmentsCross = (p1, p2, p3, p4) => {
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
};

// Do two polylines cross anywhere?
export const polylinesCross = (a, b) => {
  for (let i = 0; i < a.length - 1; i++) for (let j = 0; j < b.length - 1; j++) if (segmentsCross(a[i], a[i + 1], b[j], b[j + 1])) return true;
  return false;
};
