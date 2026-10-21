// device-flip — the window turns about its vertical axis until it is edge-on (ease in), the content is swapped on the
// frame where neither face is visible, and the window turns on from the other side to face the camera (ease out),
// darkening as it turns away from the light. Two contents are never on screen together (C5), so this is a hidden cut
// inside one object, not a hand-off of one object to another. Drawn as vertical strips of a perspective projection
// (Canvas2D, no WebGL). Theory: the same object with a new face keeps the viewer's place (object constancy) while
// the change of page reads as a turn. Sources: a fitness-app film (a phone turns edge-on and back with the next
// tab, 13 + 17 frames), a reading-app film (the same with a change of format), a device-turn carousel.

import { seg, cubicOut, rgba, canvasOf } from './util.js';
import {
  NEUTRAL, BAR, assetOf, placeholderPage, fitView, windowOf, contentOf, windowBack, windowFront, clipWindow, drawAsset,
  coverRect,
} from './asset.js';

const OUT = 0.433;                             // edge-on at p = 13 / 30

export default {
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
  at(p) {
    if (p < OUT) { const u = seg(p, 0, OUT); return { th: (Math.PI / 2) * u * u * u, face: 0 }; }
    return { th: -(Math.PI / 2) * (1 - cubicOut(seg(p, OUT, 1))), face: 1 };
  },
  paint(ctx, S, P, D) {
    const C = P.colors, tex = D.faces[S.face], { W, H } = D, cx = P.window.cx, cy = P.window.cy;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const cos = Math.cos(S.th), sin = Math.sin(S.th), f = P.perspective;
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
    const f = P.perspective, sin = Math.sin(S.th), cos = Math.cos(S.th), cx = P.window.cx;
    return [-D.W / 2, D.W / 2].map((u) => { const sc = f / (f + u * sin); return [cx + u * cos * sc, P.window.cy - (D.H / 2) * sc]; });
  },
};
