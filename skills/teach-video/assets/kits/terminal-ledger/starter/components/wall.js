// Wall of small windows: a terminal shrinks into the first cell, copies into a wall, a reader walks the cells, windows emit marks that travel along a line.
// Use:
//   const wall = F.wall(ctx.layer, { cols: 6, rows: 4, x0: 130, y0: 200, dx: 172, dy: 118, seed: 20261027 });
//   wall.fromTerm(term, t)          the big window's content goes (title stays), the window shrinks into the first cell (0.55 s), becomes a small window at t+0.6, then copies out (about 0.75 s)
//   wall.reveal(t)                  when not coming from a terminal: lay the cells out directly
//   wall.read(t0, t1, '程序逐封读', showAt)  a teal frame and label appear at showAt, walk the cells over t0–t1 and tick each
//   const arr = wall.emit({ n: 21, t: 12.6, go: 12.95, path: (mx, my) => `M${mx},${my} L…`, seed })  arrival time of each mark at the end (ascending)
//   wall.collapse(x, y, t)          the windows fly into (x, y) in order of distance and vanish (0.34 s)
//   wall.mws[i], wall.slots[i] = [x, y] (top-left)
(function () {
  const { init, to, set, show, hide, pop, el, div, rng, tl } = F;
  F.wall = (parent, o) => {
    const cols = o.cols || 6, rows = o.rows || 4, x0 = o.x0 ?? 130, y0 = o.y0 ?? 200, dx = o.dx || 172, dy = o.dy || 118;
    const rnd = rng(o.seed || 20261027);
    const root = div(parent, 'abs', ''), slots = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) slots.push([x0 + c * dx, y0 + r * dy]);
    const mws = slots.map(() => {
      const m = el('div', 'mw', root, '<div class="b"><i></i><i></i><i></i></div>');
      [32, 50, 68].forEach((yy) => { const r = el('div', 'r', m); r.style.top = yy + 'px'; r.style.width = (50 + Math.round(rnd() * 70)) + 'px'; });
      const ck = el('div', 'ck', m, '✓');
      init(m, { x: slots[0][0], y: slots[0][1], opacity: 0, scale: 1 }); init(ck, { opacity: 0 });
      m._ck = ck; return m;
    });
    const W = { root, slots, mws, rnd };
    const spread = (t) => mws.slice(1).forEach((m, i) => { to(m, { opacity: 1 }, t + i * 0.03, 0.08); to(m, { x: slots[i + 1][0], y: slots[i + 1][1] }, t + i * 0.03, 0.5, 'power3.out'); });
    W.fromTerm = (term, t) => {
      const [tx, ty, tw, th] = term._box;
      for (const k of term.children) if (!k.classList.contains('bar')) hide(k, t, 0.2);
      init(term, Object.assign({ x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' }, F.has(term, 'opacity') ? {} : { opacity: 1 }));
      to(term, { x: slots[0][0] - tx, y: slots[0][1] - ty, scaleX: 150 / tw, scaleY: 96 / th }, t + 0.1, 0.55, 'power3.inOut');
      to(mws[0], { opacity: 1 }, t + 0.6, 0.05); to(term, { opacity: 0 }, t + 0.62, 0.05);
      spread(t + 0.65);
    };
    W.reveal = (t) => { to(mws[0], { opacity: 1 }, t, 0.1); spread(t + 0.05); };
    W.read = (t0, t1, label, showAt = t0 - 0.8) => {
      const rd = div(parent, 'rd', ''); init(rd, { x: slots[0][0] - 8, y: slots[0][1] - 8, opacity: 0 });
      const ag = label ? div(parent, 'agentTag', label) : null;
      if (ag) init(ag, { x: slots[0][0] - 8, y: slots[0][1] - 52, opacity: 0 });
      show(rd, showAt, 0.25); if (ag) show(ag, showAt, 0.25);
      const step = (t1 - t0) / slots.length;
      slots.forEach(([x, y], k) => {
        const t = t0 + k * step;
        if (k) { set(rd, { x: x - 8, y: y - 8 }, t); if (ag) set(ag, { x: x - 8, y: y - 52 }, t); }
        set(mws[k]._ck, { opacity: 1 }, t + step * 0.8);
      });
      hide(rd, t1 + 0.1, 0.2); if (ag) hide(ag, t1 + 0.1, 0.2);
      W.rd = rd; W.ag = ag;
    };
    // Marks: pop out of the gap at each window's right (from t, 0.018 s apart), travel along path for 0.7 s (from go, 0.045 s apart) and vanish on arrival
    W.emit = (e) => {
      const marks = div(parent, 'abs', ''), arrive = [], pick = [];
      for (let i = 0; i < e.n; i++) pick.push(Math.floor(rnd() * slots.length));
      pick.sort((a, b) => a - b);
      const cnt = {};
      pick.forEach((wi, i) => {
        const j = (cnt[wi] = (cnt[wi] || 0) + 1) - 1;
        const [x, y] = slots[wi]; const mx = x + 161, my = y + 22 + j * 28;
        const m = el('div', 'mk', marks);
        init(m, { x: mx, y: my, opacity: 0, scale: 0 });
        pop(m, e.t + 0.02 + i * 0.018, 0.2);
        const t = e.go + i * 0.045;
        tl.to(m, { motionPath: { path: e.path(mx, my) }, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, t);
        to(m, { opacity: 0 }, t + 0.68, 0.04);
        arrive.push(t + 0.7);
      });
      W.marks = marks; return arrive;
    };
    W.collapse = (x, y, t) => mws.forEach((m, i) => { const [sx, sy] = slots[i]; const dd = Math.hypot(x - sx, y - sy); to(m, { x: x - 11, y: y - 44, scale: 0.2, opacity: 0 }, t + dd * 0.0002, 0.34, 'power3.in'); });
    return W;
  };
})();
