// counter-portal — the next scene is already visible inside a letter's counter (the 0 of a version number, an O, a D)
// from the first frame; the camera pushes into the counter (exponential zoom, the counter sliding to frame centre, the
// far scene growing slower: parallax) until the counter is the frame. Theory: the title-design zoom-through; a window
// present from frame one is a preview, not a surprise. references/transitions.md#counter-portal.

import { seg, bez, measure, scratch, canvasOf, text, ground } from './util.js';

const ZEASE = bez(0.7, 0, 0.3, 1);
const COUNTERS = '0OoDdQqPpBbAa69@Reg';

export default {
  name: 'counter-portal',
  tier: 'T2',
  beats: 1.5,
  modes: ['plakat', 'ink', 'pulse'],
  roles: ['ground', 'ink', 'portal'],
  from: 'a poster with a big glyph whose counter shows the next scene',
  to: 'the next scene, full frame',
  interpolates: ['zoom (exponential)', 'counter centre → frame centre', 'far scene scale (parallax)'],
  summary: 'The next scene waits inside a letter\'s counter; the camera pushes through the counter until it is the frame.',
  theory: 'The zoom-through of title design; z-axis motion shared by both scenes; the window is visible from the first frame, so it previews.',
  defaults: {
    glyph: { text: '2.0', counter: null, counterAt: [0.5, 0.5] },   // counter: index of the char (default: the last with a counter)
    x: 96, baseline: 990,
    font: { family: 'sans-serif', weight: 900, size: 760, spacing: -30 },
    parallax: 0.55,                      // the far scene's growth exponent (1 = no parallax)
    from: null,                          // (ctx, P) => scene A's other marks (no ground), drawn in A's space
    to: (ctx, P) => { text(ctx, 'next', 102, 660, { ...P.font, size: 400, spacing: -14 }, { color: P.colors.ink }); },   // scene B (its ground is filled for it)
    colors: { ground: '#F2EFE8', ink: '#111111', portal: '#FF3B1F' },
  },
  prepare(P) {
    const g = scratch(), G = P.glyph, f = P.font, s = G.text;
    let ci = G.counter;
    if (ci == null) for (let i = s.length - 1; i >= 0; i--) if (COUNTERS.includes(s[i])) { ci = i; break; }
    if (ci == null) throw new Error(`counter-portal: no letter with a counter in "${s}"; set glyph.counter`);
    const ch = s[ci];
    const x0 = P.x + measure(g, s.slice(0, ci), f).width;          // left edge of the counter's letter (kerned prefix)
    // the letter at 4x in its own canvas; rays from the counter centre out to the first ink (alpha 0.5, sub-pixel)
    const Z = 4, fz = { ...f, size: f.size * Z }, m = measure(g, ch, fz);
    const cw = Math.ceil(m.actualBoundingBoxRight + 40), chh = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + 40);
    const c = canvasOf(cw, chh), cg = c.getContext('2d', { willReadFrequently: true });
    const oy = Math.ceil(m.actualBoundingBoxAscent + 20);
    text(cg, ch, 0, oy, fz, { color: '#000' });
    const A = cg.getImageData(0, 0, cw, chh).data;
    const al = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      const at = (a, b) => (a < 0 || b < 0 || a >= cw || b >= chh ? 0 : A[(b * cw + a) * 4 + 3]);
      return (at(xi, yi) * (1 - fx) + at(xi + 1, yi) * fx) * (1 - fy) + (at(xi, yi + 1) * (1 - fx) + at(xi + 1, yi + 1) * fx) * fy;
    };
    const [fxr, fyr] = G.counterAt;
    const gx = m.actualBoundingBoxLeft * -1 + (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) * fxr;
    const gy = oy - m.actualBoundingBoxAscent + (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) * fyr;
    const N = 720, rho = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2, dx = Math.cos(th), dy = Math.sin(th);
      let r = 0;
      while (r < cw && al(gx + dx * r, gy + dy * r) < 128) r += 1;
      let lo = Math.max(0, r - 1), hi = r;
      for (let k = 0; k < 10; k++) { const mid = (lo + hi) / 2; if (al(gx + dx * mid, gy + dy * mid) < 128) lo = mid; else hi = mid; }
      rho.push(lo / Z);
    }
    const Cx = x0 + gx / Z, Cy = P.baseline + (gy - oy) / Z;
    // final scale: the counter, centred on the frame, covers every point of the frame's edge (+3 %)
    const rAt = (th) => { const q = ((((th / (Math.PI * 2)) % 1) + 1) % 1) * N, i = Math.floor(q) % N; return rho[i] + (rho[(i + 1) % N] - rho[i]) * (q - Math.floor(q)); };
    let S = 1;
    for (let k = 0; k <= 400; k++) {
      for (const [px, py] of [[(k * 1920) / 400, 0], [(k * 1920) / 400, 1080], [0, (k * 1080) / 400], [1920, (k * 1080) / 400]]) {
        const dx = px - 960, dy = py - 540;
        S = Math.max(S, Math.hypot(dx, dy) / rAt(Math.atan2(dy, dx)));
      }
    }
    return { Cx, Cy, rho, N, S: S * 1.03 };
  },
  rest(side) { return { w: side === 'from' ? 0 : 1 }; },
  at(p) { const w = seg(p, 0, 0.94); return { w: w >= 1 ? 1 : ZEASE(w) }; },   // lands a frame or two early: still by p = 1
  paint(ctx, S, P, D) {
    const C = P.colors;
    const fillAll = (color) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = color; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); };
    if (S.w >= 1) { fillAll(C.portal); P.to(ctx, P); return; }
    const s = Math.pow(D.S, S.w), Fx = D.Cx + (960 - D.Cx) * S.w, Fy = D.Cy + (540 - D.Cy) * S.w;
    const sB = Math.pow(s / D.S, P.parallax);
    const aT = () => ctx.setTransform(s, 0, 0, s, Fx - D.Cx * s, Fy - D.Cy * s);
    const bT = () => ctx.setTransform(sB, 0, 0, sB, Fx - 960 * sB, Fy - 540 * sB);
    if (P.ground !== false) fillAll(C.ground);
    // the portal: the counter polygon, grown 2.5 screen px so the redrawn ink overlaps its edge
    aT();
    const d = 2.5 / s;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < D.N; i++) {
      const th = (i / D.N) * Math.PI * 2, r = D.rho[i] + d;
      const x = D.Cx + Math.cos(th) * r, y = D.Cy + Math.sin(th) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.clip();
    fillAll(C.portal);
    bT(); P.to(ctx, P);
    ctx.restore();
    // scene A's ink: the glyph and the template's other marks
    aT();
    text(ctx, P.glyph.text, P.x, P.baseline, P.font, { color: C.ink });
    if (P.from) P.from(ctx, P);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },
  track: (S, P, D) => {
    const s = Math.pow(D.S, S.w), Fx = D.Cx + (960 - D.Cx) * S.w, Fy = D.Cy + (540 - D.Cy) * S.w;
    return [0, 180, 360, 540].map((i) => { const th = (i / D.N) * Math.PI * 2, r = D.rho[i]; return [Fx + Math.cos(th) * r * s, Fy + Math.sin(th) * r * s]; });
  },
};
