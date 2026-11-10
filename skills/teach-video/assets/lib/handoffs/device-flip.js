// device-flip — the window turns about its vertical axis until it is edge-on (ease in), the content is swapped on the
// frame where neither face is visible, and the window turns on from the other side to face the camera (ease out),
// darkening as it turns away from the light. Two contents are never on screen together (C5), so this is a hidden cut
// inside one object, not a hand-off of one object to another. Drawn as vertical strips of a perspective projection
// (Canvas2D, no WebGL). Theory: the same object with a new face keeps the viewer's place (object constancy) while
// the change of page reads as a turn. Sources: a fitness-app film (a phone turns edge-on and back with the next
// tab, 13 + 17 frames), a reading-app film (the same with a change of format), a device-turn carousel.
// Variant `turn: 'over'`: one continuous turn over instead of edge-on and back: a lean back to −10°, an accelerating
// turn past the far side to 194° and a settle onto 180°, the next content on the back; the window lifts 6 % while it
// turns, its face darkens with |cos θ| and a narrow light runs across it while it is near edge-on (60°–120°). Adapted
// from video-shotcraft demos/transition/card-flip-reveal/CardFlipReveal.tsx, https://github.com/Vincentwei1021/
// video-shotcraft @ 1266a3e, Apache-2.0: the angles, the 4 + 16 + 10 frame phases, the curve (0.55, 0, 0.3, 1), the lift
// and the edge light; the row of cards, the mirrored floor and the numbers on the backs are the scene flip-row.

import { seg, cubicOut, rgba, canvasOf } from './util.js';
import { bez } from '../motion.js';
import {
  NEUTRAL, BAR, assetOf, placeholderPage, fitView, windowOf, contentOf, windowBack, windowFront, clipWindow, drawAsset,
  coverRect,
} from './asset.js';

const OUT = 0.433;                             // edge-on at p = 13 / 30
const OVER = bez(0.55, 0, 0.3, 1), LEAN = 4 / 30, TURN = 20 / 30;
// turn over: the angle in degrees at p (−10 lean, 194 past the far side, 180 at rest)
const overDeg = (p) => {
  if (p <= 0) return 0;
  if (p >= 1) return 180;
  if (p < LEAN) return -10 * cubicOut(p / LEAN);
  if (p < TURN) return -10 + 204 * OVER(seg(p, LEAN, TURN));
  return 194 - 14 * cubicOut(seg(p, TURN, 1));
};

const M = {
  name: 'device-flip',
  tier: 'T2',
  beats: 2,
  modes: ['phosphor', 'tally'],
  roles: ['ground', 'panel', 'line', 'dim'],
  from: 'a window showing asset 1',
  to: 'the same window showing asset 2 (another page of the same source, or the next source)',
  interpolates: ['turn angle (0 → 90° ease in, −90° → 0 ease out)', 'shading', 'face (swapped edge-on)'],
  summary: 'A hidden cut inside one object, not a hand-off: the window turns edge-on, its content is swapped on the frame no face shows, and it turns back with the next page.',
  theory: 'One object with a new face keeps the viewer\'s place; the swap happens where no face shows, so two contents never overlap (C5). Nothing carries the eye from one content to the other, so it does not count as a hand-off.',
  defaults: {
    window: { cx: 960, cy: 540, w: 1300, h: 700 },   // content size; each asset is cropped (covered) to its aspect
    from: { asset: null, title: 'example.com/a', focus: null },
    to: { asset: null, title: 'example.com/b', focus: null },
    perspective: 2200,                         // camera distance, px
    shade: 0.6,                                // ground veil when edge-on
    strips: 120,
    turn: 'edge',                              // 'over': one continuous turn over to the back (a card flipped)
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const { w, h } = P.window;
    const face = (side, i) => {
      const s = P[side];
      const A0 = assetOf(s.asset, () => placeholderPage(2000, i ? 1300 : 1000));
      const A = { image: A0.image, crop: coverRect(A0.crop, w / h, s.focus) };
      const W = windowOf(0, 0, w, h);
      const c = canvasOf(w, h + BAR), g = c.getContext('2d');
      windowBack(g, W, P);
      g.save(); clipWindow(g, W); drawAsset(g, A, fitView(A.crop, contentOf(W)), contentOf(W)); g.restore();
      windowFront(g, W, P, { title: s.title });
      return c;
    };
    return { faces: [face('from', 0), face('to', 1)], W: w, H: h + BAR };
  },
  rest(side) { return { th: 0, face: side === 'from' ? 0 : 1 }; },
  at(p, P) {
    if (P && P.turn === 'over') { const d = overDeg(p), r = (d * Math.PI) / 180; return { th: d > 90 ? r - Math.PI : r, face: d > 90 ? 1 : 0, deg: d }; }
    if (p < OUT) { const u = seg(p, 0, OUT); return { th: (Math.PI / 2) * u * u * u, face: 0 }; }
    return { th: -(Math.PI / 2) * (1 - cubicOut(seg(p, OUT, 1))), face: 1 };
  },
  paint(ctx, S, P, D) {
    const C = P.colors, tex = D.faces[S.face], { W, H } = D, cx = P.window.cx, cy = P.window.cy;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const cos = Math.cos(S.th), sin = Math.sin(S.th), f = P.perspective;
    if (P.turn === 'over' && S.deg != null && S.deg !== 0 && S.deg !== 180) {
      // the lift while it turns, then the face as usual, then the light near edge-on
      const k = 1 + 0.06 * Math.sin(Math.PI * Math.min(1, Math.max(0, S.deg / 180)));
      ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
      M.paint(ctx, { th: S.th, face: S.face }, { ...P, turn: 'edge', ground: false }, D);
      if (S.deg > 60 && S.deg < 120 && Math.abs(cos) >= 0.012) {
        const t = (S.deg - 60) / 60, [xl, sl] = [cx + (-W / 2) * cos * (f / (f - (W / 2) * sin)), f / (f - (W / 2) * sin)], [xr, sr] = [cx + (W / 2) * cos * (f / (f + (W / 2) * sin)), f / (f + (W / 2) * sin)];
        ctx.save(); ctx.beginPath(); ctx.moveTo(xl, cy - (H * sl) / 2); ctx.lineTo(xr, cy - (H * sr) / 2); ctx.lineTo(xr, cy + (H * sr) / 2); ctx.lineTo(xl, cy + (H * sl) / 2); ctx.closePath(); ctx.clip();
        const x = xl + (xr - xl) * t, wb = Math.max(6, Math.abs(xr - xl) * 0.18), g = ctx.createLinearGradient(x - wb, 0, x + wb, 0), a = 0.45 * Math.sin(Math.PI * t);
        g.addColorStop(0, rgba('#FFFFFF', 0)); g.addColorStop(0.5, rgba('#FFFFFF', a)); g.addColorStop(1, rgba('#FFFFFF', 0));
        ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(Math.min(xl, xr) - wb, 0, Math.abs(xr - xl) + 2 * wb, ctx.canvas.height);
        ctx.restore();
      }
      ctx.restore();
      return;
    }
    if (Math.abs(S.th) < 1e-9) { ctx.drawImage(tex, Math.round(cx - W / 2), Math.round(cy - H / 2)); return; }
    if (Math.abs(cos) < 0.012) {                  // edge-on: only the window's edge, a hairline
      const sc = f / (f - (W / 2) * Math.abs(sin));
      ctx.fillStyle = C.line;
      ctx.fillRect(cx - 1, cy - (H * sc) / 2, 2, H * sc);
      return;
    }
    const proj = (u) => { const sc = f / (f + u * sin); return [cx + u * cos * sc, sc]; };
    const n = P.strips, sw = W / n;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const veilA = P.shade * (1 - Math.abs(cos));
    for (let i = 0; i < n; i++) {
      const u0 = -W / 2 + i * sw, u1 = u0 + sw;
      const [x0] = proj(u0), [x1] = proj(u1), [, sm] = proj((u0 + u1) / 2);
      const hm = H * sm, y = cy - hm / 2, dw = x1 - x0 + 0.6;
      ctx.drawImage(tex, i * sw, 0, sw, H, x0, y, dw, hm);
    }
    if (veilA > 0) {                              // one veil over the projected quad (per-strip veils would overlap)
      const [xl, sl] = proj(-W / 2), [xr, sr] = proj(W / 2);
      ctx.beginPath();
      ctx.moveTo(xl, cy - (H * sl) / 2); ctx.lineTo(xr, cy - (H * sr) / 2); ctx.lineTo(xr, cy + (H * sr) / 2); ctx.lineTo(xl, cy + (H * sl) / 2);
      ctx.closePath();
      ctx.fillStyle = rgba(C.ground, veilA);
      ctx.fill();
    }
    ctx.restore();
  },
  track: (S, P, D) => {
    const f = P.perspective, sin = Math.sin(S.th), cos = Math.cos(S.th), cx = P.window.cx, cy = P.window.cy;
    const k = P.turn === 'over' && S.deg != null ? 1 + 0.06 * Math.sin(Math.PI * Math.min(1, Math.max(0, S.deg / 180))) : 1;
    return [-D.W / 2, D.W / 2].map((u) => { const sc = f / (f + u * sin); return [cx + (u * cos * sc) * k, cy - (D.H / 2) * sc * k]; });
  },
};
export default M;
