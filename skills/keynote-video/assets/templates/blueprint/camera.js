// camera.js — the camera is derived, never hand-keyed: arrivals come from the scene list and the beat grid,
// positions from the sheet layout, push-ins from each stamp's measured position. camAt(t) is pure.
import { E } from './fx.js';

export const SAFE = { x0: 60, y0: 140, x1: 1860, y1: 960 }; // where a push-in target must sit on screen
export const PUSH = 1.1;

const inter = (a, b) => !(a[0] + a[2] <= b[0] || b[0] + b[2] <= a[0] || a[1] + a[3] <= b[1] || b[1] + b[3] <= a[1]);
const toScreen = (r, cx, cy, s) => [(r[0] - cx) * s + 960, (r[1] - cy) * s + 540, r[2] * s, r[3] * s];

// Choose the push-in centre nearest the focus centre such that: the focus sits in SAFE, the sheet title is
// either clear of the HUD label panel or fully out of frame, the stamp stays off the title block, and the view
// stays on its own sheet (at most GUTTER px into the gutter), so a push never shows half of the next sheet.
const GUTTER = 60;
export const solvePush = ({ focus, title, stamp, panel, block, sheet, texts = [] }, errs, where) => {
  const cut = (R) => { // a text rect partly in frame, crossing the HUD border, or under the HUD reads as a clipped label
    const inF = R[0] >= 44 && R[1] >= 44 && R[0] + R[2] <= 1876 && R[1] + R[3] <= 1036; // inside the HUD frame
    const off = R[0] + R[2] <= 0 || R[1] + R[3] <= 0 || R[0] >= 1920 || R[1] >= 1080;
    return (!inF && !off) || (!off && (inter(R, panel) || inter(R, block)));
  };
  const fx = focus[0] + focus[2] / 2, fy = focus[1] + focus[3] / 2;
  // the largest scale (1.12 … 1.045) at which nothing is clipped wins
  let fallback = null;
  for (const s of [1.12, PUSH, 1.08, 1.06, 1.045]) {
    let best = null;
    for (let dy = -420; dy <= 420; dy += 6) {
      for (let dx = -720; dx <= 720; dx += 8) {
        const cx = fx + dx, cy = fy + dy;
        const F = toScreen(focus, cx, cy, s);
        const over = Math.max(0, SAFE.x0 - F[0]) + Math.max(0, F[0] + F[2] - SAFE.x1) + Math.max(0, SAFE.y0 - F[1]) + Math.max(0, F[1] + F[3] - SAFE.y1);
        const T = toScreen(title, cx, cy, s);
        const titleOk = !inter(T, panel) || T[1] + T[3] <= 0;
        const titleCut = T[1] < 0 && T[1] + T[3] > 0 && T[0] < panel[0] + panel[2]; // half in frame, under the panel
        const stampOk = !stamp || !inter(toScreen(stamp, cx, cy, s), block);
        if (sheet && (Math.abs(cx - (sheet[0] + sheet[2] / 2)) > sheet[2] / 2 - 960 / s + GUTTER || Math.abs(cy - (sheet[1] + sheet[3] / 2)) > sheet[3] / 2 - 540 / s + GUTTER)) continue;
        let cuts = 0;
        for (const r of texts) if (r !== title && cut(toScreen(r, cx, cy, s))) cuts++;
        const cost = Math.hypot(dx, dy) + over * 40 + (titleOk ? 0 : 1e5) + (titleCut ? 5e4 : 0) + (stampOk ? 0 : 1e5) + cuts * 600;
        if (!best || cost < best.cost) best = { cost, cx, cy, s, cuts, ok: over < 1 && titleOk && !titleCut && stampOk };
      }
    }
    if (!best) continue;
    if (best.ok && !best.cuts) return best;
    if (best.ok && (!fallback || best.cuts < fallback.cuts)) fallback = best;
  }
  if (fallback) return fallback;
  errs.push(`${where}: no push-in framing keeps the title clear of the label panel and the stamp in frame`);
  return { cx: focus[0] + focus[2] / 2, cy: focus[1] + focus[3] / 2, s: 1.0, cuts: 0, ok: false };
};

// keys: [{ t, x, y, s, ease, dip }]; the segment into key j uses key j's ease and dip.
export const makeCamAt = (keys, impacts) => (t) => {
  let j = 0;
  while (j < keys.length - 1 && keys[j + 1].t <= t) j++;
  const a = keys[j], b = keys[Math.min(j + 1, keys.length - 1)];
  let x = a.x, y = a.y, s = a.s;
  if (b !== a && t > a.t) {
    const u = Math.min(1, (t - a.t) / (b.t - a.t)), e = b.ease(u);
    x = a.x + (b.x - a.x) * e;
    y = a.y + (b.y - a.y) * e;
    s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e) * (1 - b.dip * Math.sin(Math.PI * u));
  }
  let dx = 0, dy = 0;
  for (const ti of impacts) {
    const d = t - ti;
    // a short thud, not a tremor: the stamp and the sheet move together and settle within 0.25 s
    if (d >= 0 && d < 0.25) { const amp = 3 * Math.exp(-d * 18); dx += amp * Math.sin(d * 95); dy += amp * 0.7 * Math.cos(d * 73); }
  }
  return { x, y, s, dx, dy };
};

// Build keys from the schedule. pos(i) → world centre for scene i; push(i) → solved push or null.
// Overviews drift for OV_DRIFT_B beats after the pull-out lands, then hold still, so a longer overview holds
// longer instead of drifting slower.
const OV_DRIFT_B = 4;
export const cameraKeys = ({ scenes, pos, full, push, adjacent, beat }) => {
  const K = [];
  const key = (t, p, s, ease = E.sineInOut, dip = 0) => {
    if (K.length && t <= K[K.length - 1].t + 1e-4) { K[K.length - 1] = { ...K[K.length - 1], x: p.x, y: p.y, s }; return; }
    K.push({ t, x: p.x, y: p.y, s, ease, dip });
  };
  scenes.forEach((sc, i) => {
    const p = pos(i);
    if (sc.type === 'overview') {
      key(sc.start, p, full, E.quartInOut);
      key(Math.min(sc.moveOutStart, sc.start + OV_DRIFT_B * beat), p, full * 1.008, E.sineInOut);
      key(sc.moveOutStart, p, full * 1.008, E.linear);
      return;
    }
    // the opening sheet settles out from 1.025 over its (now 5-beat) build: ≤ 1.3 %/s at its fastest, inside the
    // ambient limit (principle 5); the others drift in 1.0 → 1.012 while they draw
    // a release entered under the parallel rule: the camera holds the overview until the rule has crossed, then
    // cuts to the release sheet (film.js draws the two framings under the rule; lib/transitions occluder-pass)
    if (sc.rule && K.length) { const L = K[K.length - 1]; key(sc.start - 1e-3, { x: L.x, y: L.y }, L.s, E.linear); }
    const a = i === 0 ? 1.025 : 1.0, h = i === 0 ? 1.0 : 1.012;
    const drift = (t) => a + (h - a) * E.sineInOut((t - sc.start) / Math.max(0.01, sc.holdStart - sc.start));
    key(sc.start, p, a, E.quartInOut, i > 0 && adjacent(i) ? 0.1 : 0);
    const pu = push(i);
    if (pu && sc.push && sc.push.end) {
      // an excerpt that ends on this stamp: push in, land the stamp, hold the pushed-in frame to the end
      key(sc.push.from, p, drift(sc.push.from), E.sineInOut);
      key(sc.push.at, { x: pu.cx, y: pu.cy }, pu.s, E.cubicInOut);
      key(sc.end, { x: pu.cx, y: pu.cy }, pu.s, E.linear);
      return;
    }
    if (pu && sc.push) {
      key(sc.push.from, p, drift(sc.push.from), E.sineInOut);
      key(sc.push.at, { x: pu.cx, y: pu.cy }, pu.s, E.cubicInOut);
      key(sc.push.hold, { x: pu.cx, y: pu.cy }, pu.s, E.linear); // held still after the thud (land, then hold: principle 5)
      // the return is an exit: 0.6 of the push-in's length, accelerating (principle 5, exits faster; flow F15)
      key(sc.push.back, p, drift(sc.push.back), E.accel);
    }
    key(sc.holdStart, p, h, E.sineInOut);
    key(i === scenes.length - 1 ? sc.end : sc.moveOutStart, p, h, E.linear);
  });
  return K;
};
