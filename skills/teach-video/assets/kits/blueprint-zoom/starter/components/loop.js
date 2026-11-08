// Loop: a smooth rounded shape that is a pill in the overview and morphs into a circle when enlarged, with Rough hachure clipped to it
// (never a Rough circle); a turn drawn along the circle marks a new round; a stopped loop turns grey.
// Use (hidden at first unless o.visible):
//   const L = F.bp.loop(parent, { pill: [x, y, w, h], circle: [x, y, d, d], c: 'teal', title: '事件循环', sub: '一次只做一件事', seed: 47, shape: 'pill', visible })
//     returns { el (div at the current shape's box), svg (screen coordinates), line, bg, hatch, lab, title, sub, pill, circle, p, loop: true }
//   F.bp.loopIn(L, t)   F.bp.loopTo(L, 'circle'|'pill', t, d, { sub: 124 })   (sub: how far the secondary line moves down in the circle, below it)
//   F.bp.orbit(L, t, d)   one turn drawn clockwise around the circle, then fades      F.bp.pulse(L, t)   the outline thickens once
//   F.bp.loopStop(L, t, d) / F.bp.loopGo(L, t, d)   outline grey and hachure faint (the loop stopped) / back to its colour
//   const R = F.bp.rounds(layer, L, ['第 1 轮', '第 2 轮'])   round labels under the title in the circle: R.on(i, t) swaps to round i and draws
//     an orbit (returns t + 0.6, when the turn closes, for a sound cue); R.grey(i, t, d) greys one; R.els. Call R.on in time order (it
//     blurs out the round shown last)
// Stand-in kind "loop": { pill, circle, shape: 'pill'|'circle', c, title, sub, seed, subDy } (box = the current shape's box)
(function () {
  const { init, to, el, div, svgEl } = F;
  const bp = (F.bp = F.bp || {});
  let clipN = 0;
  const rr = ([x, y, w, h]) => { const r = Math.min(w, h) / 2; return { x, y, width: w, height: h, rx: r, ry: r }; };
  bp.loop = (parent, o) => {
    const p = bp.PAL(o.c), V = !!o.visible, circ = o.shape === 'circle', cur = circ ? o.circle : o.pill, [px, py, pw, ph] = o.pill, [cx, cy, cw, chh] = o.circle;
    const e = div(parent, 'rough-node', '', cur[0], cur[1], { width: cur[2] + 'px', height: cur[3] + 'px' });
    init(e, { left: cur[0], top: cur[1], width: cur[2], height: cur[3] });
    // The svg keeps screen coordinates: it moves against the box (left/top counter-tweened), so its shapes stay put on screen
    const svg = svgEl('svg', { width: 1, height: 1 }, e);
    Object.assign(svg.style, { position: 'absolute', overflow: 'visible' });
    init(svg, { left: -cur[0], top: -cur[1] });
    const id = 'bploop' + (++clipN);
    const cp = svgEl('clipPath', { id }, svgEl('defs', {}, svg));
    const A = rr(cur);
    const clipR = svgEl('rect', A, cp);
    const bg = svgEl('rect', Object.assign({ fill: p.B }, A), svg);
    // hachure over the union of both boxes, shown only inside the current shape
    const ux = Math.min(px, cx) - 10, uy = Math.min(py, cy) - 10, ux2 = Math.max(px + pw, cx + cw) + 10, uy2 = Math.max(py + ph, cy + chh) + 10;
    const hg = svgEl('g', { 'clip-path': `url(#${id})` }, svg);
    const hp = bp.hachure(svg, [ux, uy, ux2 - ux, uy2 - uy], o.c, o.seed || 3, { stroke: 'none', bowing: 1, into: hg }).hatch;
    const line = svgEl('rect', Object.assign({ fill: 'none', stroke: p.S, 'stroke-width': 3 }, A), svg);
    for (const r of [clipR, bg, line]) init(r, { attr: Object.assign({}, A) });
    init(line, { stroke: p.S, attr: { 'stroke-width': 3 } });
    init(bg, { opacity: V ? 1 : 0 }); init(line, { drawSVG: V ? '0% 100%' : '0% 0%' });
    for (const q of hp) init(q, { drawSVG: V ? '0% 100%' : '0% 0%', opacity: 1 });
    const lab = div(e, 'bp-lab', '', 0, 0, { width: '100%', height: '100%' });
    const title = el('div', 'bp-t', lab, o.title); title.style.fontSize = TOKENS.fs.node + 'px';
    const sub = o.sub ? el('div', 'bp-s', lab, o.sub) : null;
    if (sub) { sub.style.fontSize = TOKENS.fs.note + 'px'; init(sub, { y: circ ? (o.subDy || 0) : 0 }); }
    init(lab, { opacity: V ? 1 : 0, filter: V ? 'blur(0px)' : 'blur(6px)' });
    return { el: e, svg, clipR, bg, line, hatch: hp, lab, title, sub, pill: o.pill.slice(), circle: o.circle.slice(), p, loop: true };
  };
  bp.loopIn = (L, t, d = 0.5) => {
    to(L.bg, { opacity: 1 }, t, 0.25, 'power1.out');
    F.draw(L.line, t, d, 'power2.inOut');
    for (const q of L.hatch) F.draw(q, t + 0.1, d + 0.1, 'power1.inOut');
    to(L.lab, { opacity: 1, filter: 'blur(0px)' }, t + 0.15, 0.3, 'power2.out');
  };
  bp.loopTo = (L, which, t, d = TOKENS.bp.zoomD, o = {}, ease = 'power2.inOut') => {
    const box = which === 'circle' ? L.circle : L.pill, A = rr(box);
    for (const q of [L.clipR, L.bg, L.line]) to(q, { attr: A }, t, d, ease);
    to(L.el, { left: box[0], top: box[1], width: box[2], height: box[3] }, t, d, ease);
    to(L.svg, { left: -box[0], top: -box[1] }, t, d, ease);
    if (L.sub && o.sub != null) to(L.sub, { y: which === 'circle' ? o.sub : 0 }, t, d, ease);
  };
  bp.orbit = (L, t, d = 0.6) => {
    const [x, y, w] = L.circle, r = w / 2 + 9;
    const arc = svgEl('path', { d: F.circlePath(x + w / 2, y + w / 2, r), fill: 'none', stroke: L.p.S, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-opacity': 0.75 }, L.svg);
    arc.setAttribute('data-geo-allow', 'loop orbit');
    init(arc, { drawSVG: '0% 0%', opacity: 1 });
    to(arc, { drawSVG: '0% 100%' }, t, d, 'power1.inOut');
    to(arc, { opacity: 0 }, t + d + 0.05, 0.3, 'power1.in');
    return arc;
  };
  bp.loopStop = (L, t, d = 0.6) => { to(L.line, { stroke: F.COL.stroke }, t, d, 'none'); for (const q of L.hatch) to(q, { opacity: 0.3 }, t, d, 'none'); };
  bp.loopGo = (L, t, d = 0.6) => { to(L.line, { stroke: L.p.S }, t, d); for (const q of L.hatch) to(q, { opacity: 1 }, t, d); };
  bp.rounds = (layer, L, labels, o = {}) => {
    const [x, y, w] = L.circle, cx = x + w / 2, top = y + w / 2 + (o.dy ?? 11);
    const els = labels.map((s) => {
      const e = div(layer, 'bp-st', s, 0, top); e.style.color = L.p.S; e.style.fontSize = TOKENS.fs.body + 'px';
      e.style.left = (cx - e.offsetWidth / 2) + 'px'; init(e, { opacity: 0, filter: 'blur(6px)', color: L.p.S }); return e;
    });
    let cur = -1;
    return {
      els,
      on(i, t) { if (cur >= 0) F.blurOut(els[cur], t, 0.15); F.blurIn(els[i], t + (cur >= 0 ? 0.15 : 0), 0.22); cur = i; bp.orbit(L, t, 0.6); return t + 0.6; },
      grey(i, t, d = 0.6) { to(els[i], { color: F.COL.stroke }, t, d, 'none'); },
    };
  };
  F.standIn = F.standIn || {};
  F.standIn.loop = (spec, layer) => bp.loop(layer, Object.assign({}, spec, { visible: true }));
})();
