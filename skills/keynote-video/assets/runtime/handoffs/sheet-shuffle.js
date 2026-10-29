// sheet-shuffle — the evidence lies on the mat as sheets of paper, the next one already in the pile under the current
// one, its corner showing. The top sheet is drawn out to the side (it accelerates, then eases to a stop clear of the
// pile), is tucked back underneath, and settles as the corner of the pile; the sheet that was under squares up to the
// reading position. The order changes only while the two sheets do not overlap, so no sheet ever passes through the
// other. Sheets are the assets with a paper margin and a cast shadow; the one being read is always square (0°), only
// the sheet underneath lies at a slight angle.
// Theory: physical paper handling as the editorial metaphor of a dossier (the pile is the order of exhibits; what is
// read is on top); occlusion and shadow as depth cues (Cutting & Vishton 1995); out, then under: one operation per
// stage. Sources: document-shuffle shots in news explainer videos; HyperFrames `spring-stack-shuffle`, `physical-exit`
// (named, not copied).

import { seg, cubicInOut, lerp } from './util.js';
import { NEUTRAL, assetOf, placeholderPage } from './asset.js';
import { castShadow, containView } from './stage.js';

const pose = (x, y, rot) => ({ x, y, rot });
const lerpPose = (a, b, u) => pose(lerp(a.x, b.x, u), lerp(a.y, b.y, u), lerp(a.rot, b.rot, u));

export default {
  name: 'sheet-shuffle',
  tier: 'T1',
  beats: 2,
  modes: ['dossier', 'ink (paper films)'],
  roles: ['ground', 'paper', 'line'],
  from: 'a sheet (an asset on paper) square in the reading position, the next sheet under it with its corner showing',
  to: 'the next sheet square in the reading position, the previous one tucked under it as the pile\'s corner',
  interpolates: ['top sheet x, y, angle (out to the side, then under)', 'z order (swapped while the sheets are apart)', 'under sheet pose (squares up)'],
  summary: 'The top sheet is drawn out to the side and tucked under the pile; the sheet beneath squares up to be read.',
  theory: 'Paper handling as the dossier\'s metaphor; occlusion and shadow as depth (Cutting & Vishton 1995); out, then under.',
  defaults: {
    from: { asset: null },
    to: { asset: null },
    sheet: { cx: 960, cy: 540, w: 1320, maxH: 900, pad: 26 },   // the reading position; content width w (height follows, ≤ maxH)
    pile: { dx: -30, dy: -26, rot: -2.2 },     // the sheet underneath: its top-left offset from the top sheet's, and its angle
    out: { dx: 1560, dy: -40, rot: 5 },        // where the top sheet is drawn out to (clear of the pile)
    colors: { ...NEUTRAL, paper: '#F4F3EF' },
  },
  prepare(P) {
    const sheetOf = (s, n) => {
      const A = assetOf(s.asset, () => placeholderPage(2000, 1100 + 200 * n));
      const k = Math.min(P.sheet.w / A.crop[2], P.sheet.maxH / A.crop[3]);
      const w = A.crop[2] * k + 2 * P.sheet.pad, h = A.crop[3] * k + 2 * P.sheet.pad;
      return { A, w, h };
    };
    const a = sheetOf(P.from, 0), b = sheetOf(P.to, 1);
    const centre = (s) => pose(P.sheet.cx - s.w / 2, P.sheet.cy - s.h / 2, 0);
    const under = (s, top) => pose(top.x + P.pile.dx, top.y + P.pile.dy, P.pile.rot);
    const a0 = centre(a), b1 = centre(b);
    return { a, b, a0, aOut: pose(a0.x + P.out.dx, a0.y + P.out.dy, P.out.rot), a1: under(a, b1), b0: under(b, a0), b1 };
  },
  rest(side) { return side === 'from' ? { out: 0, back: 0, sq: 0 } : { out: 1, back: 1, sq: 1 }; },
  at(p) { return { out: cubicInOut(seg(p, 0, 0.46)), back: cubicInOut(seg(p, 0.5, 1)), sq: cubicInOut(seg(p, 0.3, 0.84)) }; },
  poses(S, D) {
    const a = S.back > 0 ? lerpPose(D.aOut, D.a1, S.back) : lerpPose(D.a0, D.aOut, S.out);
    return { a, b: lerpPose(D.b0, D.b1, S.sq), aOnTop: S.back <= 0 };
  },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const { a, b, aOnTop } = this.poses(S, D);
    const sheet = (s, q) => {
      ctx.save();
      ctx.translate(q.x + s.w / 2, q.y + s.h / 2); ctx.rotate((q.rot * Math.PI) / 180); ctx.translate(-s.w / 2, -s.h / 2);
      const r = { x: 0, y: 0, w: s.w, h: s.h };
      castShadow(ctx, r, { radius: 2, alpha: 0.5, blur: 28, dy: 12 });
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, s.w, s.h);
      const inner = { x: P.sheet.pad, y: P.sheet.pad, w: s.w - 2 * P.sheet.pad, h: s.h - 2 * P.sheet.pad };
      const v = containView(s.A, inner), [cx, cy, cw, ch] = s.A.crop;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(s.A.image, cx, cy, cw, ch, v.bx + cx * v.a, v.by + cy * v.a, cw * v.a, ch * v.a);
      ctx.restore();
    };
    if (aOnTop) { sheet(D.b, b); sheet(D.a, a); } else { sheet(D.a, a); sheet(D.b, b); }
  },
  track(S, P, D) {
    const { a, b } = this.poses(S, D);
    return [[a.x, a.y], [a.x + D.a.w, a.y + D.a.h], [b.x, b.y], [b.x + D.b.w, b.y + D.b.h]];
  },
};
