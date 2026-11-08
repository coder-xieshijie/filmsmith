// Layer band: a clean rounded frame with a light tint and the layer's name (and an optional two-line note) in the name column at the left.
// Use (hidden at first unless o.visible):
//   const b = F.bp.band(parent, { box: [x, y, w, h], c: 'teal', name: '服务端', sub: '处理请求', nameY: 14, visible })
//     returns { el (div at the box: frame, tint and name; data-geo-group), fill, rect (svg rects, width / height registered), name, sub, box, c }
//   F.bp.bandIn(b, t)   draws the frame, fades the tint, blurs the name in
//   F.bp.bandTo(b, [x, y, w, h], t, d)   morphs the frame to another box (the name keeps its place at the top left); b.box stays the first box
//   F.bp.svg(parent)    a full-stage <svg> (screen coordinates) for connectors and marks
// Stand-in kind "band": { box, c, name, sub, nameY }; hand over b (its .el's box is the frame)
(function () {
  const { init, to, div, svgEl } = F;
  const bp = (F.bp = F.bp || {});
  bp.PAL = (c) => { const C = F.COL; if (!C[c + 'S']) throw new Error(`no layer palette "${c}" in tokens.js (blue, violet, ochre, teal, stone, red)`); return { S: C[c + 'S'], H: C[c + 'H'], B: C[c + 'B'], T: C[c + 'T'] || C[c + 'B'] }; };
  bp.svg = (parent) => { const s = F.fullSvg(parent); s.style.overflow = 'visible'; return s; };
  bp.band = (parent, o) => {
    const [x, y, w, h] = o.box, p = bp.PAL(o.c), ny = o.nameY ?? 14, V = !!o.visible;
    const g = div(parent, 'abs bp-band', '', x, y, { width: w + 'px', height: h + 'px' }); g.setAttribute('data-geo-group', 'band');
    init(g, { left: x, top: y, width: w, height: h });
    const svg = svgEl('svg', { width: w, height: h }, g);
    Object.assign(svg.style, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
    const fill = svgEl('rect', { x: 0, y: 0, width: w, height: h, rx: 12, fill: p.T, stroke: 'none' }, svg);
    const rect = svgEl('rect', { x: 0, y: 0, width: w, height: h, rx: 12, fill: 'none', stroke: p.S, 'stroke-width': 2, 'stroke-opacity': 0.55 }, svg);
    init(fill, { opacity: V ? 1 : 0, attr: { width: w, height: h } });
    init(rect, { drawSVG: V ? '0% 100%' : '0% 0%', attr: { width: w, height: h, 'stroke-opacity': 0.55 } });
    const name = div(g, 'bp-lname', o.name, 24, ny); name.style.color = p.S;
    init(name, { opacity: V ? 1 : 0, filter: V ? 'blur(0px)' : 'blur(6px)' });
    let sub = null;
    if (o.sub) { sub = div(g, 'bp-lsub', o.sub, 24, ny + 42); init(sub, { opacity: V ? 1 : 0, filter: V ? 'blur(0px)' : 'blur(6px)' }); }
    return { el: g, fill, rect, name, sub, box: o.box.slice(), c: o.c };
  };
  bp.bandIn = (b, t) => {
    F.draw(b.rect, t, 0.5, 'power2.inOut');
    to(b.fill, { opacity: 1 }, t + 0.1, 0.4, 'power1.out');
    to(b.name, { opacity: 1, filter: 'blur(0px)' }, t + 0.15, 0.3, 'power2.out');
    if (b.sub) to(b.sub, { opacity: 1, filter: 'blur(0px)' }, t + 0.25, 0.3, 'power2.out');
  };
  bp.bandTo = (b, box, t, d = TOKENS.bp.zoomD, ease = 'power2.inOut') => {
    const [x, y, w, h] = box;
    to(b.el, { left: x, top: y, width: w, height: h }, t, d, ease);
    to(b.rect, { attr: { width: w, height: h } }, t, d, ease); to(b.fill, { attr: { width: w, height: h } }, t, d, ease);
  };
  F.standIn = F.standIn || {};
  F.standIn.band = (spec, layer) => bp.band(layer, Object.assign({}, spec, { visible: true }));
})();
