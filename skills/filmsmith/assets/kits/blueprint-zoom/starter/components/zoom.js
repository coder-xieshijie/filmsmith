// Zoom: the signature move. One layer of the overview becomes the detail diagram: the other layers scale away from its centre and fade,
// its frame morphs into the detail frame, its cells move to their detail places (a loop becomes its circle), the side box follows its
// layer; out() plays it back to the overview. Connectors, windows and messages of the detail view are the segment's own: draw them in
// after in() lands and retire them as out() starts.
// Use:
//   const z = F.bp.zoom(ov, 'srv', { detail: [50, 250, 1500, 520], cells: { 0: [90, 424, 382, 172], 2: [1128, 424, 382, 172] }, side: [1189, 80, 260, 96], loopSub: 124 })
//     cells: index → detail box for nodes (keep each node's size); loop cells go to their circle; loopSub moves a loop's secondary line below the circle;
//     side: where the side box goes when it belongs to this layer (omit: it stays in place); a side box of another layer is pushed away with that layer
//   z.in(t, { d: 1.3, focus: tF })    focus (optional, before t): the other layers dim to 0.32 (and a side box that will move, to 0.5) while the narration names the layer
//   z.out(t, { d: 1.3 })              back to the overview, everything at full opacity; the link to the side box returns at t + d.
//                                     out() must finish (t + d) before the segment's end: pass a shorter d when the segment ends sooner
//   z.dur                             the default length (TOKENS.bp.zoomD)
// Every zoom pushes about its own layer's centre, also when another zoom (this segment's or an earlier one's) moved the same layers before.
// A layer whose pushed box, at any moment of the push, would reach the presenter reserve fades in 0.3 s instead of 0.6 d, so nothing sweeps across it.
(function () {
  const { init, to, set } = F;
  const bp = (F.bp = F.bp || {});
  bp.zoom = (ov, key, o) => {
    const B = TOKENS.bp, k = o.k || B.push, R = ov.rows[key];
    if (!R) throw new Error(`zoom: no row "${key}" in the overview`);
    const [bx, by, bw, bh] = R.band.box, ox = bx + bw / 2, oy = by + bh / 2, Z = TOKENS.zone.avatar, origin = `${ox}px ${oy}px`;
    // The push scales from 1 to k monotonically, so the area it sweeps is the union of the start and end boxes
    const crosses = (b) => {
      if (!Z) return false;
      const x0 = Math.min(b[0], ox + (b[0] - ox) * k), x1 = Math.max(b[0] + b[2], ox + (b[0] + b[2] - ox) * k);
      const y0 = Math.min(b[1], oy + (b[1] - oy) * k), y1 = Math.max(b[1] + b[3], oy + (b[1] + b[3] - oy) * k);
      return x1 > Z[0] && x0 < Z[2] && y1 > Z[1] && y0 < Z[3];
    };
    const sideOwn = !!ov.side && ov.side.row === key;
    const others = Object.entries(ov.rows).filter(([kk]) => kk !== key).map(([, r]) => ({ ws: [r.rw, r.nw], fast: crosses(r.band.box) }));
    if (ov.side && !sideOwn) others.push({ ws: [ov.sideW], fast: crosses(ov.side.box) });
    for (const x of others) for (const w of x.ws) if (!F.has(w, 'scale')) init(w, { opacity: 1, scale: 1, transformOrigin: origin });
    if (ov.side && !F.has(ov.side.el, 'opacity')) init(ov.side.el, { opacity: 1 });
    const sideMoves = sideOwn && !!o.side;
    const cellsOf = () => R.cells.map((n, i) => ({ n, i, to: n.loop ? null : (o.cells || {})[i] })).filter((c) => c.n.loop || c.to);
    return {
      dur: B.zoomD,
      in(t, p = {}) {
        const d = p.d ?? B.zoomD, t0 = Math.min(t, p.focus ?? t);
        for (const x of others) for (const w of x.ws) set(w, { transformOrigin: origin }, t0 - 0.002);
        if (p.focus != null) {
          for (const x of others) for (const w of x.ws) to(w, { opacity: 0.32 }, p.focus, 0.4, 'power1.inOut');
          if (sideMoves) to(ov.side.el, { opacity: 0.5 }, p.focus, 0.4, 'power1.inOut');
        }
        if (ov.link) bp.lineOut(ov.link, p.focus ?? t, 0.3);
        for (const x of others) for (const w of x.ws) { to(w, { scale: k }, t, d, 'power2.inOut'); to(w, { opacity: 0 }, t, x.fast ? 0.3 : d * 0.6, 'power1.in'); }
        bp.bandTo(R.band, o.detail, t, d);
        to(R.band.rect, { attr: { 'stroke-opacity': 0.42 } }, t, d); to(R.band.fill, { opacity: 0.6 }, t, d);
        if (R.band.sub) to(R.band.sub, { opacity: 0 }, t, 0.3, 'power1.in');
        for (const c of cellsOf()) { if (c.n.loop) bp.loopTo(c.n, 'circle', t, d, { sub: o.loopSub }); else F.boxTo(c.n.el, c.n.box, c.to, t, d, 'power2.inOut'); }
        if (sideMoves) { F.boxTo(ov.side.el, ov.side.box, o.side, t + 0.2, d - 0.1, 'power2.inOut'); to(ov.side.el, { opacity: 1 }, t + 0.3, 0.6, 'power1.inOut'); }
      },
      out(t, p = {}) {
        const d = p.d ?? B.zoomD;
        for (const x of others) for (const w of x.ws) {
          to(w, { scale: 1 }, t, d, 'power2.inOut');
          if (x.fast) to(w, { opacity: 1 }, t + d * 0.7, d * 0.3, 'power1.out'); else to(w, { opacity: 1 }, t + d * 0.35, d * 0.65, 'power1.out');
        }
        bp.bandTo(R.band, R.band.box, t, d);
        to(R.band.rect, { attr: { 'stroke-opacity': 0.55 } }, t, d); to(R.band.fill, { opacity: 1 }, t, d);
        if (R.band.sub) to(R.band.sub, { opacity: 1 }, t + d - 0.2, 0.3);
        for (const c of cellsOf()) { if (c.n.loop) bp.loopTo(c.n, 'pill', t, d, { sub: o.loopSub }); else F.boxTo(c.n.el, c.n.box, c.n.box, t, d, 'power2.inOut'); }
        if (sideMoves) F.boxTo(ov.side.el, ov.side.box, ov.side.box, t, d, 'power2.inOut');
        if (ov.side) to(ov.side.el, { opacity: 1 }, t, 0.3);
        if (ov.link) bp.lineBack(ov.link, t + d, 0.3);
      },
    };
  };
})();
