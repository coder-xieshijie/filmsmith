// Overview: the whole system as equal-width layers (bands x 60–1540, names at the left, cells shared out evenly), each cell a hand-drawn
// node or a loop, and at most one box right of the layers (the outside part one layer talks to) joined to it by a two-headed connector.
// Build it from a plain spec (the same object handoff.json carries for the stand-in), so the contract is the one source of its layout:
//   const ov = F.bp.overview(ctx.layer, ctx.out.items.ov)      (or the spec written inline)
//     visible: true builds it all drawn; ['srv', 'side'] only those rows (and the side box), e.g. the layer that is on screen at frame 0
//   spec = { rows: [ { key, c, name, sub, y, h, inset: 14, gap: 24, nameY: 10, done, next, cells: ['地址栏', …] or [{ title, sub, seed, size, loop: [x, y, d, d] }, …] }, … ],
//            side: { row: '<key>', c: 'red', title, sub, box: [1600, y, 240, 92] (default: centred on the row), size: 34, subSize: 24 } }
//   a cell with `loop` is a loop (pill here, that circle when enlarged); string cells are titles at 28 px, cells with a sub 36 / 26 px;
//   `gap` (px between cells) also sets their width: (1196 − gap × (n − 1)) / n; done: true (or a text) shows "✓ 讲过" in the name column,
//   next: <cell index> the dashed ring around that cell (both drawn from frame 0, so a handed-over overview keeps them)
// Returns ov = { el (full stage), rows: { <key>: { band, cells: [node or loop], spec, done, ring } }, side, sideW, link, lines (svg), msgs (div), spec }.
// Stacking inside: bands · lines and msgs (connectors and messages you add, under the nodes) · nodes · side box. Draw it in with
//   F.bp.rowIn(ov, key, t, { at: 0.12, step: 0.06, d: 0.4 })   frame, name and cells in turn      F.bp.sideIn(ov, t)   the side box and its link
//   F.bp.done(ov, key, t, '✓ 讲过')   the layer is covered: the mark lands in its name column (below the note, or right of the name in a low band)
//   F.bp.next(ov, key, i, t)          the dashed ring around the next part to enlarge (pulse it with F.bp.pulse when the narration names it);
//                                     it stays where the cell sits in the overview: hide it (F.hide(ring, t)) before zooming that cell's own layer
// Enlarge one layer with F.bp.zoom (zoom.js). Hand the overview over whole (kind "overview", box [0, 0, 1920, 1080]) while it shows the
// overview; write a done or next it gained into the contract's spec, so the stand-in shows it too.
(function () {
  const { init, to, div, svgEl } = F;
  const bp = (F.bp = F.bp || {});
  bp.cellBox = (row, n, i) => {
    const B = TOKENS.bp, inset = row.inset ?? 14, gap = row.gap ?? B.gap, w = (B.cellW - gap * (n - 1)) / n;
    return [B.cellX + i * (w + gap), row.y + inset, w, row.h - 2 * inset];
  };
  const doneMark = (R, text, shown) => {
    const b = R.band, ny = R.spec.nameY ?? 10, h = b.box[3];
    let x = 24, y = ny + (b.sub ? 86 : 44);
    if (y + 40 > h - 4) { x = 24 + b.name.offsetWidth + 14; y = ny - 1; }      // a low band: right of the name
    const e = div(b.el, 'bp-take', text, x, y); e.style.color = F.COL.ok; e.style.fontSize = TOKENS.fs.body + 'px';
    init(e, shown ? { opacity: 1, scale: 1, transformOrigin: '0% 50%' } : { opacity: 0, scale: 0.6, transformOrigin: '0% 50%' });
    return e;
  };
  const ringOf = (R, i, shown) => {
    const c = R.cells[i]; if (!c) throw new Error(`overview next: row "${R.spec.key}" has no cell ${i}`);
    const [x, y, w, h] = c.loop ? c.pill : c.box;
    if (!R.svg) R.svg = bp.svg(R.rw);
    const ring = svgEl('rect', { x: x - 9, y: y - 9, width: w + 18, height: h + 18, rx: 12, fill: 'none', stroke: bp.PAL(R.spec.c).S, 'stroke-width': 3, 'stroke-dasharray': '12 8' }, R.svg);
    init(ring, shown ? { opacity: 1, scale: 1, transformOrigin: '50% 50%' } : { opacity: 0, scale: 1.06, transformOrigin: '50% 50%' });
    return ring;
  };
  bp.overview = (parent, spec) => {
    const B = TOKENS.bp, Z = TOKENS.zone, Vs = spec.visible, V = (k) => Vs === true || (Array.isArray(Vs) && Vs.includes(k));
    const el = div(parent, 'abs', '', 0, 0, { width: Z.W + 'px', height: Z.H + 'px' });
    const bandsL = div(el, 'abs', '', 0, 0), mid = div(el, 'abs', '', 0, 0), nodesL = div(el, 'abs', '', 0, 0), sideW = div(el, 'abs', '', 0, 0);
    const lines = bp.svg(mid), msgs = div(mid, 'abs', '', 0, 0);
    const rows = {};
    for (const r of spec.rows) {
      const rw = div(bandsL, 'abs', '', 0, 0), nw = div(nodesL, 'abs', '', 0, 0);
      const band = bp.band(rw, { box: [B.x, r.y, B.w, r.h], c: r.c, name: r.name, sub: r.sub, nameY: r.nameY ?? 10, visible: V(r.key) });
      const cells = r.cells.map((c0, i) => {
        const c = typeof c0 === 'string' ? { title: c0 } : c0, box = bp.cellBox(r, r.cells.length, i), seed = c.seed || 11 + i * 7 + r.y;
        if (c.loop) return bp.loop(nw, { pill: box, circle: c.loop, c: r.c, title: c.title, sub: c.sub, seed, visible: V(r.key) });
        return bp.node(nw, { box, c: r.c, title: c.title, sub: c.sub, seed, size: c.size ?? (c.sub ? TOKENS.fs.node : TOKENS.fs.body), subSize: c.subSize, visible: V(r.key) });
      });
      const R = rows[r.key] = { band, cells, rw, nw, spec: r, done: null, ring: null };
      if (r.done) R.done = doneMark(R, typeof r.done === 'string' ? r.done : '✓ 讲过', true);
      if (r.next != null) R.ring = ringOf(R, r.next, true);
    }
    let side = null, link = null;
    if (spec.side) {
      const s = spec.side, row = rows[s.row] && rows[s.row].spec;
      if (!row) throw new Error(`overview side: no row "${s.row}"`);
      if (!s.box && B.sideX == null) throw new Error('overview side: this canvas has no side column (TOKENS.bp.sideX is null): give side.box');
      const box = s.box || [B.sideX, Math.round(row.y + row.h / 2 - 46), B.sideW, 92], A = Z.avatar;
      if (A && box[0] < A[2] && box[0] + box[2] > A[0] && box[1] < A[3] && box[1] + box[3] > A[1])
        throw new Error(`overview side: box ${box.join(',')} reaches the presenter reserve (${A.join(',')}): centre its row higher (above y ≈ ${A[1] - 46}) or give side.box`);
      side = bp.node(sideW, { box, c: s.c || 'red', title: s.title, sub: s.sub, seed: s.seed || 53, size: s.size ?? 34, subSize: s.subSize ?? 24, visible: V('side') });
      side.row = s.row;
      const last = rows[s.row].cells[rows[s.row].cells.length - 1], lb = last.loop ? last.pill : last.box, cy = box[1] + box[3] / 2;
      link = bp.line(lines, `M${lb[0] + lb[2] + 1} ${cy} H${box[0] - 2}`, { arrows: 'both', visible: V('side') });
    }
    return { el, rows, side, sideW, link, lines, msgs, spec };
  };
  bp.rowIn = (ov, key, t, o = {}) => {
    const r = ov.rows[key], at = o.at ?? 0.12, step = o.step ?? 0.06, d = o.d ?? 0.4;
    bp.bandIn(r.band, t);
    r.cells.forEach((n, i) => (n.loop ? bp.loopIn(n, t + at + i * step, d + 0.05) : bp.nodeIn(n, t + at + i * step, d)));
  };
  bp.sideIn = (ov, t) => { if (ov.side) bp.nodeIn(ov.side, t); if (ov.link) bp.lineIn(ov.link, t + 0.3, 0.35); };
  bp.done = (ov, key, t, text = '✓ 讲过') => {
    const R = ov.rows[key]; if (!R) throw new Error(`done: no row "${key}"`);
    if (!R.done) R.done = doneMark(R, text, false);
    to(R.done, { opacity: 1, scale: 1 }, t, 0.25, 'back.out(1.8)');
    return R.done;
  };
  bp.next = (ov, key, i, t) => {
    const R = ov.rows[key]; if (!R) throw new Error(`next: no row "${key}"`);
    const ring = ringOf(R, i, false);
    to(ring, { opacity: 1, scale: 1 }, t, 0.45, 'power3.out');
    R.ring = ring; return ring;
  };
  F.standIn = F.standIn || {};
  F.standIn.overview = (spec, layer) => bp.overview(layer, Object.assign({}, spec, { visible: true }));
})();
