// Marks and lines: small result marks, relation arrows, dividers drawn top to bottom. Clean lines, not hand marks (hand marks are F.hand.* only).
// Use (logical canvas coordinates; t is when it appears / starts drawing):
//   F.mark(ctx.layer, x, y, 'ok' | 'issue' | 'none', t, { size: 36 })   a round mark centred on (x, y) that pops in:
//       ok = green with a white ✓ (passes, holds, caught); issue = ink with a paper-coloured ! (a problem found); none = faint frame, grey — (checked, nothing found).
//       Returns the element (x, y registered, so F.to can move it)
//   F.arrow(ctx.layer, [[x0, y0], [x1, y1], …], t, { d: 0.5, color: 'stroke', w: 3, dash: false, head: true, bend: 0 })
//       a polyline arrow (two points with bend ≠ 0 draw a quadratic curve, bend = offset of the midpoint along the normal in px), drawn from its start with
//       DrawSVG, arrowhead at the end; dash: true is the dashed "relation" line (8 7). Returns { svg, path, head }; recolour: F.to(a.path, { attr: { stroke: … } }, t)
//   F.divider(ctx.layer, x, y0, y1, t, { d: 0.7, color: 'ink', w: 3 })   a vertical divider drawn top to bottom; returns the path
// Colour names from tokens (stroke / ink / me / agent …).
(function () {
  const { init, to, div, svgEl, COL } = F;
  const C = (c) => COL[c] || c;
  F.mark = (parent, x, y, kind, t, o = {}) => {
    const s = o.size || 36, fs = Math.max(24, Math.round(s * 0.72));
    const sty = kind === 'ok' ? { background: COL.ok, color: '#fff', border: `2.5px solid #1f5a37` }
      : kind === 'issue' ? { background: COL.ink, color: COL.paper, border: `2.5px solid ${COL.ink}` }
      : { background: COL.body, color: COL.faint, border: `2.5px solid ${COL.rule}` };
    const e = div(parent, 'abs nw', kind === 'ok' ? '✓' : kind === 'issue' ? '!' : '—', x - s / 2, y - s / 2,
      Object.assign({ width: s + 'px', height: s + 'px', borderRadius: '50%', textAlign: 'center', lineHeight: (s - 5) + 'px', fontSize: fs + 'px' }, sty));
    init(e, { opacity: 0, scale: 0.6, x: 0, y: 0, transformOrigin: '50% 50%' });
    if (t != null) F.pop(e, t);
    return e;
  };
  F.arrow = (parent, pts, t, o = {}) => {
    const col = C(o.color || 'stroke'), w = o.w || 3, d = o.d ?? 0.5;
    const svg = F.fullSvg(parent);
    let dStr;
    if (pts.length === 2 && o.bend) {
      const [[x0, y0], [x1, y1]] = pts, mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) || 1;
      dStr = `M${x0},${y0} Q${mx - ((y1 - y0) / L) * o.bend},${my + ((x1 - x0) / L) * o.bend} ${x1},${y1}`;
    } else dStr = 'M' + pts.map((p) => p.join(',')).join(' L');
    const path = svgEl('path', Object.assign({ d: dStr, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, o.dash ? { 'stroke-dasharray': '8 7' } : {}), svg);
    init(path, { drawSVG: '0% 0%', attr: { stroke: col } });
    F.draw(path, t, d, 'power2.inOut');
    let head = null;
    if (o.head !== false) {
      const n = path.getTotalLength(), a = path.getPointAtLength(n), b = path.getPointAtLength(Math.max(0, n - 8));
      const ang = Math.atan2(a.y - b.y, a.x - b.x), L = 14, sp = 0.5;
      const p1 = [a.x - L * Math.cos(ang - sp), a.y - L * Math.sin(ang - sp)], p2 = [a.x - L * Math.cos(ang + sp), a.y - L * Math.sin(ang + sp)];
      head = svgEl('path', { d: `M${p1} L${a.x},${a.y} L${p2}`, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
      init(head, { opacity: 0, attr: { stroke: col } }); to(head, { opacity: 1 }, t + d - 0.05, 0.08, 'none');
    }
    return { svg, path, head };
  };
  F.divider = (parent, x, y0, y1, t, o = {}) => {
    const svg = F.fullSvg(parent), col = C(o.color || 'ink');
    const p = svgEl('path', { d: `M${x},${y0} L${x},${y1}`, fill: 'none', stroke: col, 'stroke-width': o.w || 3, 'stroke-linecap': 'round' }, svg);
    init(p, { drawSVG: '0% 0%', attr: { stroke: col } }); F.draw(p, t, o.d ?? 0.7, 'power2.inOut');
    return p;
  };
})();
