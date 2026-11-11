// Connector: one clean vector line with round caps and two-stroke arrowheads; no wobble (only nodes are hand-drawn).
// Use (hidden at first unless o.visible):
//   const l = F.bp.line(svg, 'M800 247 V345', { col: F.COL.tealS, w: 2.5, arrows: 'end'|'both'|'', visible })   svg from F.bp.svg(layer)
//     returns { g (svg group), p (the path), heads, len, d }
//   F.bp.lineIn(l, t, d)   draws it, the heads appear as it arrives      F.bp.lineOut(l, t, d) / F.bp.lineBack(l, t, d)   fade out / back in
//   F.bp.dim(l, t, 0.3)    fades to an opacity (a path no longer in use stays faintly)
// Paths run between node edges; a message travelling along a connector uses its own path from node centre to node centre (message.js).
// Stand-in kind "line": { d, col (token name), w, arrows } in its own full-stage svg; its box is the path's bounding box
(function () {
  const { init, to, show, hide, svgEl } = F;
  const bp = (F.bp = F.bp || {});
  const head = (svg, x, y, ang, col, w) => {
    const L = 13, A = 0.42;
    const d = `M${x - L * Math.cos(ang - A)} ${y - L * Math.sin(ang - A)} L${x} ${y} L${x - L * Math.cos(ang + A)} ${y - L * Math.sin(ang + A)}`;
    return svgEl('path', { d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  };
  bp.line = (svg, d, o = {}) => {
    const col = o.col || F.COL.stroke, w = o.w || 2.5, V = !!o.visible;
    const g = svgEl('g', {}, svg);
    const p = svgEl('path', { d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    const len = p.getTotalLength();
    const at = (s) => p.getPointAtLength(Math.max(0, Math.min(len, s)));
    const heads = [];
    const mk = (s0, s1) => { const a = at(s0), b = at(s1); heads.push(head(g, b.x, b.y, Math.atan2(b.y - a.y, b.x - a.x), col, w)); };
    if (o.arrows === 'end' || o.arrows === 'both') mk(len - 6, len);
    if (o.arrows === 'both') mk(6, 0);
    init(p, { drawSVG: V ? '0% 100%' : '0% 0%' }); for (const h of heads) init(h, { opacity: V ? 1 : 0 });
    init(g, { opacity: 1 });
    return { g, el: g, p, heads, len, d };
  };
  bp.lineIn = (l, t, d = 0.45) => { F.draw(l.p, t, d, 'power2.inOut'); for (const h of l.heads) show(h, t + d - 0.1, 0.15); };
  bp.lineOut = (l, t, d = 0.25) => hide(l.g, t, d);
  bp.lineBack = (l, t, d = 0.3) => show(l.g, t, d);
  bp.dim = (l, t, op = 0.3, d = 0.6) => to(l.g, { opacity: op }, t, d, 'none');
  F.standIn = F.standIn || {};
  F.standIn.line = (spec, layer) => bp.line(bp.svg(layer), spec.d, { col: F.COL[spec.col] || spec.col, w: spec.w, arrows: spec.arrows, visible: true });
})();
