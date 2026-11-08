// Hand-drawn node: a Rough.js outline and hachure on a solid background, a title and an optional secondary line on a light backing.
// Use (hidden at first unless o.visible):
//   const n = F.bp.node(parent, { box: [x, y, w, h], c: 'teal', title: '处理函数', sub: '读写订单', seed: 41, size: 36, subSize: 26, visible })
//     returns { el (div.rough-node at the box), inner (scaled by pulse), bg, outline, hatch (svg paths), lab, title, sub, box, p (palette) }
//   F.bp.nodeIn(n, t, d)   draws outline then hachure, blurs the label in      F.bp.pulse(n, t)   one emphasis (scale 1.05 and back; a loop thickens)
//   move it: F.boxTo(n.el, n.box, [x, y, w, h], t, d) (the label scales with it; keep the aspect ratio when the text must stay crisp)
// Same seed, same strokes: give every node its own fixed seed (0 or none counts as 1). F.bp.hachure(svg, box, c, seed, o) draws a Rough rectangle into any svg.
// Stand-in kind "node": { box, c, title, sub, seed, size, subSize }
(function () {
  const { init, to, el, div, svgEl } = F;
  const bp = (F.bp = F.bp || {});
  // A Rough.js rectangle (outline + hachure, or hachure only with o.stroke 'none'); returns { g, hatch, outline } (paths)
  bp.hachure = (svg, [x, y, w, h], c, seed, opts = {}) => {
    const p = bp.PAL(c), B = TOKENS.bp, { into, ...o } = opts;
    // seed 0 would make Rough.js pick a random one: never pass it on
    const g = rough.svg(svg).rectangle(x, y, w, h, Object.assign({
      seed: seed || 1, roughness: B.roughness, bowing: B.bowing, stroke: p.S, strokeWidth: 2.4,
      fill: p.H, fillStyle: 'hachure', hachureAngle: B.hachureAngle, hachureGap: B.hachureGap, fillWeight: 1.3,
    }, o));
    (into || svg).appendChild(g);
    const paths = [...g.querySelectorAll('path')];
    return { g, hatch: paths.filter((q) => q.getAttribute('stroke') === p.H), outline: paths.filter((q) => q.getAttribute('stroke') !== p.H) };
  };
  bp.node = (parent, o) => {
    const [x, y, w, h] = o.box, p = bp.PAL(o.c), PAD = 12, V = !!o.visible;
    const e = div(parent, 'rough-node', '', x, y, { width: w + 'px', height: h + 'px' });
    const inner = div(e, 'in', '', 0, 0, { width: w + 'px', height: h + 'px' });
    const svg = svgEl('svg', { width: w + 2 * PAD, height: h + 2 * PAD, viewBox: `${-PAD} ${-PAD} ${w + 2 * PAD} ${h + 2 * PAD}` }, inner);
    Object.assign(svg.style, { position: 'absolute', left: -PAD + 'px', top: -PAD + 'px', overflow: 'visible' });
    const bg = svgEl('rect', { x: 1.5, y: 1.5, width: w - 3, height: h - 3, rx: 4, fill: p.B }, svg);
    const r = bp.hachure(svg, [0, 0, w, h], o.c, o.seed || 1);
    const lab = div(inner, 'bp-lab', '', 0, 0, { width: w + 'px', height: h + 'px' });
    const title = el('div', 'bp-t', lab, o.title); title.style.fontSize = (o.size || TOKENS.fs.node) + 'px';
    let sub = null;
    if (o.sub) { sub = el('div', 'bp-s', lab, o.sub); sub.style.fontSize = (o.subSize || TOKENS.fs.note) + 'px'; }
    init(bg, { opacity: V ? 1 : 0 });
    for (const q of [...r.hatch, ...r.outline]) init(q, { drawSVG: V ? '0% 100%' : '0% 0%' });
    init(lab, { opacity: V ? 1 : 0, filter: V ? 'blur(0px)' : 'blur(6px)' });
    init(inner, { scale: 1, transformOrigin: '50% 50%' });
    return { el: e, inner, svg, bg, hatch: r.hatch, outline: r.outline, lab, title, sub, box: o.box.slice(), p };
  };
  bp.nodeIn = (n, t, d = 0.45) => {
    to(n.bg, { opacity: 1 }, t, 0.25, 'power1.out');
    for (const q of n.outline) F.draw(q, t, d, 'power2.inOut');
    for (const q of n.hatch) F.draw(q, t + 0.1, d + 0.1, 'power1.inOut');
    to(n.lab, { opacity: 1, filter: 'blur(0px)' }, t + 0.15, 0.3, 'power2.out');
  };
  bp.pulse = (n, t, k = 1.05) => {
    if (n.loop) { to(n.line, { attr: { 'stroke-width': 6 } }, t, 0.18, 'power2.out'); to(n.line, { attr: { 'stroke-width': 3 } }, t + 0.25, 0.3); return; }   // a loop's outline thickens instead
    to(n.inner, { scale: k }, t, 0.18, 'power2.out'); to(n.inner, { scale: 1 }, t + 0.22, 0.3, 'power2.inOut');
  };
  F.standIn = F.standIn || {};
  F.standIn.node = (spec, layer) => bp.node(layer, Object.assign({}, spec, { visible: true }));
})();
