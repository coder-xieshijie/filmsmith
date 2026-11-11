// Stamp and imprints: a 64 px rounded vermilion square with an inner frame and one paper-coloured character (default 我, the narrator). One stamp per
// film, handed between segments (handoff kind "stamp").
// Use:
//   const s = F.stamp(F.$('ov'), 'stamp', { x, y, glyph: '我' })   built in the top SVG (#ov); invisible at first (opacity 0)
//   F.stampIn(s, t)           drops in (1.6 → 1, 0.22 s)
//   F.pressAt(s, x, y, t, hop = true, rest)   hovers at (x, y-64) → drops → presses (0.88 rebound) → lifts; t is the moment of the press
//     rest = [x, y]: where to retreat after pressing (without it the stamp stays at (x, y-64), often over text, and the engine check reports content_overlap)
//   F.imprint(F.$('imps'), x, y, t, r = 30, ink, bg, glyph)   a hollow round imprint where it pressed (t usually the press t + 0.24); r ≥ 21 or the glyph drops below 24 px
//   F.stampHollow(s, t) / F.stampSolid(s, t)   hollow when the narrator is absent / solid again
// Pressing onto content is the action itself: stamp and imprint carry data-geo-allow="seal" (geo-check only). The engine check still reports the overlap:
// retreat with rest after pressing; where that is impossible, put data-layout-allow-overlap on that element with a reason.
(function () {
  const { init, to, set, svgEl, svgText, COL } = F;
  F.stamp = (parent, id, p = {}) => {
    const g = svgEl('g', { id }, parent);
    const r = svgEl('rect', { x: -32, y: -32, width: 64, height: 64, rx: 10 }, g);
    const ri = svgEl('rect', { x: -26, y: -26, width: 52, height: 52, rx: 6, fill: 'none', 'stroke-width': 1.5 }, g);
    const tx = svgText(g, 0, 14, p.glyph || '我', { size: 40, anchor: 'middle', fill: COL.paper, allow: 'seal' });
    init(r, { fill: COL.me, stroke: COL.me, strokeWidth: 2.5 }); init(ri, { stroke: COL.meRing }); init(tx, { fill: COL.paper, opacity: 1 });
    init(g, { x: p.x ?? 960, y: p.y ?? 540, opacity: p.opacity ?? 0, scale: p.scale ?? 1.6, transformOrigin: '50% 50%' });
    return { g, r, ri, tx, el: g };
  };
  F.stampIn = (s, t) => to(s.g, { opacity: 1, scale: 1 }, t, 0.22, 'power3.in');
  F.pressAt = (s, x, y, t, hop = true, rest) => {
    if (hop) to(s.g, { x, y: y - 64 }, t - 0.4, 0.25, 'power2.inOut');
    to(s.g, { y }, t - 0.13, 0.12, 'power3.in');
    to(s.g, { scale: 0.88 }, t, 0.05, 'power2.in'); to(s.g, { scale: 1 }, t + 0.05, 0.12, 'power2.out');
    if (rest) to(s.g, { x: rest[0], y: rest[1] }, t + 0.12, 0.3, 'power2.out'); else to(s.g, { y: y - 64 }, t + 0.12, 0.18, 'power2.out');
  };
  F.imprint = (parent, x, y, t, r = 30, ink = COL.me, bg = 'rgba(196,67,42,.10)', glyph = '我') => {
    const g = svgEl('g', { 'data-geo-allow': 'seal' }, parent);
    svgEl('circle', { cx: 0, cy: 0, r, fill: bg, stroke: ink, 'stroke-width': 3 }, g);
    svgText(g, 0, r * 0.42, glyph, { size: Math.round(r * 1.15), anchor: 'middle', fill: ink }).setAttribute('data-layout-allow-overlap', '');
    init(g, { x, y, opacity: 0, scale: 1.5, transformOrigin: '50% 50%' });
    to(g, { opacity: 1, scale: 1 }, t, 0.12, 'power3.out');
    return g;
  };
  F.stampHollow = (s, t) => { to(s.tx, { opacity: 0 }, t, 0.1, 'power1.in'); to(s.r, { fill: COL.paper }, t + 0.1, 0.25); to(s.ri, { stroke: COL.paper }, t + 0.1, 0.25); set(s.tx, { fill: COL.me }, t + 0.12); to(s.tx, { opacity: 1 }, t + 0.38, 0.12, 'power1.out'); };
  F.stampSolid = (s, t) => { to(s.tx, { opacity: 0 }, t, 0.06, 'power1.in'); to(s.r, { fill: COL.me }, t + 0.06, 0.12); to(s.ri, { stroke: COL.meRing }, t + 0.06, 0.12); set(s.tx, { fill: COL.paper }, t + 0.07); to(s.tx, { opacity: 1 }, t + 0.18, 0.08, 'power1.out'); };
  // Stand-in: spec = { at: [x, y], hollow: false, glyph }
  F.standIn = F.standIn || {};
  F.standIn.stamp = (spec) => { const s = F.stamp(F.$('ov'), 'stamp', { x: spec.at[0], y: spec.at[1], opacity: 1, scale: 1, glyph: spec.glyph }); if (spec.hollow) { init(s.r, { fill: COL.paper }); init(s.ri, { stroke: COL.paper }); init(s.tx, { fill: COL.me }); } return s; };
})();
