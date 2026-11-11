// Grid: one cell per unit (1% of the time, one run, one case), coloured one by one in order.
// Use (logical canvas coordinates; cells start invisible unless reveal() or visible: true):
//   const g = F.grid(ctx.layer, { x: 80, y: 200, cols: 25, rows: 4, cell: 26, gap: 6, shape: 'sq', order: 'col', visible: false });
//     shape: 'sq' rounded square / 'dot' circle; order: fill order 'row' (row by row) / 'col' (column by column) / 'snake'
//   g.reveal(t, d = 0.5)                 empty cells fade in column by column, left to right
//   g.fill(n or [index…], 'cont', t0, t1)  colour the first n cells (in order) or the listed cells one by one over t0–t1 (0.12 s each); returns when the last is done
//   g.glyph(i, '✓', t, 'ok')             pop a character into cell i (✓ ✗ ! ? 0 …), size = cell × 0.72 and at least 24 px: cells with text need cell ≥ 34
//   g.dash(n or [index…], t0, t1)          void the cells one by one over t0–t1: paper fill, grey dashed frame (void, no longer usable); fill() makes a cell solid again
//   g.reset(t, d = 0.4)                  everything back to empty cells, characters gone (for loops); g.hide(t) fades the whole grid
//   returns g = { el, cells, box, reveal, fill, dash, glyph, reset, hide }: g.el is the wrapper (hand it over, move the whole grid with
//     F.to(g.el, { x, y }, …): x / y / opacity are registered); g.box = [x, y, w, h]; g.cells[i] = { e, x, y, r, c }: the cell element, its
//     top-left in layer coordinates, its row and column (reading order, row by row)
//   A cell registers only opacity, colours and border style. To move or scale one, register first: F.init(g.cells[i].e, { x: 0, y: 0, scale: 1 }).
//   F.init writes its value for the whole film: on a grid received with ctx.take, register at the value it has now (x: 0, opacity: 1)
//   and tween from ctx.t0 on, or the earlier segment shows your value too.
// Colour names: empty / cont (yellow: waiting, routine) / agent (teal: done by the machine) / judge (red: needs a judgement) / me (vermilion: the
//   narrator, irreversible) / ok (green: passes) / ink / rest (grey) / base (neutral blue-grey) / rel (green: allowed). When cell counts are real, show
//   the unit; when the layout is illustrative, label it with F.tag.
// Stand-in kind "grid" (hand a grid over): { box: [x, y, w, h], cols, rows, cell, gap, shape, runs: [['base', 0, 17], ['void', 18, 19]] }
//   runs colour cells from..to (indices in reading order, row by row; 'void' = dashed); cells not in any run are invisible. box w/h must equal the grid's size.
(function () {
  const { init, to, div, COL } = F;
  const PAL = {
    empty: [COL.body, COL.faint], cont: [COL.cont, COL.contS], agent: [COL.agent, '#16545b'], judge: [COL.judge, COL.judgeS], me: [COL.me, COL.meDeep],
    ok: [COL.ok, '#1f5a37'], ink: [COL.ink, COL.ink], rest: [COL.rest, COL.restS], base: [COL.base, COL.baseS], rel: [COL.rel, COL.relS],
  };
  F.gridPal = PAL;
  F.grid = (parent, o) => {
    const cols = o.cols, rows = o.rows || 1, cell = o.cell || 26, gap = o.gap ?? 6, x0 = o.x, y0 = o.y;
    const W = cols * cell + (cols - 1) * gap, H = rows * cell + (rows - 1) * gap;
    const root = div(parent, 'abs', '', x0, y0, { width: W + 'px', height: H + 'px' });
    const c0 = PAL[o.color || 'empty'];
    const cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c * (cell + gap), y = r * (cell + gap);
      const e = div(root, 'abs', '', x, y, { width: cell + 'px', height: cell + 'px', borderRadius: o.shape === 'dot' ? '50%' : Math.round(cell * 0.18) + 'px', borderStyle: 'solid', borderWidth: (cell >= 30 ? 2.5 : 2) + 'px' });
      init(e, { backgroundColor: c0[0], borderColor: c0[1], borderStyle: 'solid', opacity: o.visible ? 1 : 0 });
      cells.push({ e, x: x0 + x, y: y0 + y, r, c });
    }
    const ord = cells.slice().sort((a, b) => (o.order === 'row' ? a.r - b.r || a.c - b.c : o.order === 'snake' ? a.c - b.c || (a.c % 2 ? b.r - a.r : a.r - b.r) : a.c - b.c || a.r - b.r));
    const glyphs = [];
    const g = {
      el: root, cells, box: [x0, y0, W, H],
      reveal(t, d = 0.5) { for (const k of cells) to(k.e, { opacity: 1 }, t + (cols > 1 ? (k.c / (cols - 1)) * d : 0), 0.2, 'power1.out'); return t + d + 0.2; },
      fill(sel, color, t0, t1) {
        const list = typeof sel === 'number' ? ord.slice(0, sel) : sel.map((i) => cells[i]);
        const p = PAL[color] || [color, color], n = list.length;
        list.forEach((k, j) => { const t = t0 + (n > 1 ? (t1 - t0) * j / (n - 1) : 0); F.set(k.e, { borderStyle: 'solid' }, t); to(k.e, { opacity: 1, backgroundColor: p[0], borderColor: p[1] }, t, 0.12, 'power1.out'); });
        return t1 + 0.12;
      },
      dash(sel, t0, t1) {
        const list = typeof sel === 'number' ? ord.slice(0, sel) : sel.map((i) => cells[i]), n = list.length;
        list.forEach((k, j) => { const t = t0 + (n > 1 ? (t1 - t0) * j / (n - 1) : 0); F.set(k.e, { borderStyle: 'dashed' }, t); to(k.e, { opacity: 1, backgroundColor: COL.paper, borderColor: COL.stroke }, t, 0.12, 'power1.out'); });
        return t1 + 0.12;
      },
      glyph(i, s, t, color = 'ink') {
        const k = cells[i], fs = Math.max(24, Math.round(cell * 0.72));
        const fc = color === 'paper' ? COL.paper : COL[color] || color;
        const e = div(root, 'abs nw', s, k.x - x0, k.y - y0, { width: cell + 'px', height: cell + 'px', lineHeight: cell + 'px', textAlign: 'center', fontSize: fs + 'px', color: fc });
        init(e, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }); F.pop(e, t);
        glyphs.push(e); return e;
      },
      reset(t, d = 0.4) { for (const k of cells) to(k.e, { backgroundColor: c0[0], borderColor: c0[1] }, t, d, 'power1.inOut'); for (const e of glyphs) F.hide(e, t, d * 0.6); },
      hide(t, d = 0.25) { F.hide(root, t, d); },
    };
    init(root, { opacity: 1, x: 0, y: 0 });
    return g;
  };
  F.standIn = F.standIn || {};
  F.standIn.grid = (spec, layer) => {
    const [x, y] = spec.box;
    const g = F.grid(layer, { x, y, cols: spec.cols, rows: spec.rows || 1, cell: spec.cell, gap: spec.gap, shape: spec.shape, order: 'row' });
    for (const [c, a, b] of spec.runs || []) for (let i = a; i <= b; i++) {
      const k = g.cells[i]; if (!k) continue;
      if (c === 'void') init(k.e, { opacity: 1, backgroundColor: COL.paper, borderColor: COL.stroke, borderStyle: 'dashed' });
      else { const p = PAL[c] || [c, c]; init(k.e, { opacity: 1, backgroundColor: p[0], borderColor: p[1] }); }
    }
    return g;
  };
})();
