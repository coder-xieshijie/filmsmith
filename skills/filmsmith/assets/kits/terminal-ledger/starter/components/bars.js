// Bars: timeline swimlanes (who works when), a single progress bar, a page of text drawn as grey lines (text getting shorter). Clean square bars, never hand-drawn.
// Use (logical canvas coordinates; elements start invisible and grow in at their times):
//   const ln = F.lanes(ctx.layer, { x: 230, y: 130, w: 860, rows: 8, rowH: 28, gap: 14, span: [0, 14], labels: ['模块 1', …], labelW: 120 });
//     ln.show(t)                               row labels (24 px and up, left-aligned at x - labelW) and each row's faint track appear
//     ln.bar(row, a, b, t, d = 0.4, 'agent', ease)   a bar on row `row` from a to b (span units, e.g. hours), growing left to right; colour names as in grid; when it follows a sweep use ease 'none'
//     ln.axis([0, 7, 14], t, '小时')           a tick line and tick labels underneath
//     ln.sweep(t0, t1, { from, to })           a vertical line sweeping from `from` to `to` (span units, default the whole span): time passing; returns the line
//     ln.xOf(v) / ln.yOf(row)                  span value → x; row → the top y of that row's bar
//     ln.reset(t, d = 0.35)                    pull every bar back (loop back to the start); ln.el is the wrapper
//   const b = F.bar(ctx.layer, { x, y, w, h: 14, color: 'cont', track: true });   one bar (track = grey groove underneath): b.to(0.36, t, d) grows to 36%; b.el / b.fillEl
//   const doc = F.doc(ctx.layer, { x, y, w, lines: 16, lineH: 24, seed: 7, title: '说明文档' });   a page of text, one grey line per text line (lengths from a fixed seed)
//     doc.show(t); doc.keep(n, t, d = 0.8)     keep only the first n lines: the rest fold away bottom-up and the page shrinks; doc.keep(doc.lines, t) restores the page
(function () {
  const { init, to, div, COL } = F;
  const pal = (c) => (F.gridPal && F.gridPal[c]) || [COL[c] || c, COL[c + 'S'] || COL[c] || c];
  F.lanes = (parent, o) => {
    const rows = o.rows, rowH = o.rowH || 28, gap = o.gap ?? 14, [s0, s1] = o.span || [0, 1], lw = o.labelW ?? 0;
    const root = div(parent, 'abs', '', 0, 0); init(root, { opacity: 1 });
    const xOf = (v) => o.x + (o.w * (v - s0)) / (s1 - s0), yOf = (r) => o.y + r * (rowH + gap);
    const heads = [], bars = [];
    for (let r = 0; r < rows; r++) {
      const trk = div(root, 'abs', '', o.x, yOf(r), { width: o.w + 'px', height: rowH + 'px', background: COL.grey, borderRadius: '5px' });
      init(trk, { opacity: 0 }); heads.push(trk);
      if (o.labels && o.labels[r] != null) { const l = div(root, 'abs nw', o.labels[r], o.x - lw, yOf(r) + rowH / 2 - 15, { fontSize: Math.max(24, o.labelSize || 24) + 'px', lineHeight: '30px', color: COL.mute }); init(l, { opacity: 0 }); heads.push(l); }
    }
    return {
      el: root, xOf, yOf,
      show(t) { heads.forEach((e, i) => F.show(e, t + i * 0.02, 0.3)); },
      bar(row, a, b, t, d = 0.4, color = 'agent', ease = 'power2.out') {
        const p = pal(color);
        const e = div(root, 'abs', '', xOf(a), yOf(row), { width: Math.max(2, xOf(b) - xOf(a)) + 'px', height: rowH + 'px', background: p[0], border: `2px solid ${p[1]}`, borderRadius: '5px', transformOrigin: '0 50%' });
        init(e, { scaleX: 0, opacity: 1 }); to(e, { scaleX: 1 }, t, d, ease); bars.push(e); return e;
      },
      axis(ticks, t, unit) {
        const y = yOf(rows) + 2;
        const ax = div(root, 'abs', '', o.x, y, { width: o.w + 'px', height: '0', borderTop: `2px solid ${COL.stroke}` }); init(ax, { opacity: 0 }); F.show(ax, t, 0.3);
        ticks.forEach((v, i) => { const s = i === ticks.length - 1 && unit ? `${v} ${unit}` : String(v); const e = div(root, 'abs nw', s, xOf(v) - (i === 0 ? 0 : i === ticks.length - 1 ? s.length * 13 : 8), y + 6, { fontSize: '24px', lineHeight: '30px', color: COL.mute }); init(e, { opacity: 0 }); F.show(e, t + 0.05, 0.3); });
      },
      sweep(t0, t1, w = {}) {
        const a = w.from ?? s0, b = w.to ?? s1, h = rows * (rowH + gap) - gap + 16;
        const e = div(root, 'abs', '', xOf(a) - 1.5, o.y - 8, { width: '3px', height: h + 'px', background: COL.ink, borderRadius: '2px' });
        init(e, { opacity: 0, x: 0 }); F.show(e, t0 - 0.2, 0.2); to(e, { x: xOf(b) - xOf(a) }, t0, t1 - t0, 'none'); return e;
      },
      reset(t, d = 0.35) { for (const e of bars) to(e, { scaleX: 0 }, t, d, 'power2.in'); },
    };
  };
  F.bar = (parent, o) => {
    const p = pal(o.color || 'cont'), h = o.h || 14;
    const root = div(parent, 'abs', '', o.x, o.y, { width: o.w + 'px', height: h + 'px', borderRadius: h / 2 + 'px', background: o.track === false ? 'transparent' : COL.grey, overflow: 'hidden' });
    const f = div(root, 'abs', '', 0, 0, { width: o.w + 'px', height: h + 'px', background: p[0], transformOrigin: '0 50%' });
    init(root, { opacity: 0 }); init(f, { scaleX: 0 });
    return { el: root, fillEl: f, to(frac, t, d = 0.6, ease = 'power2.out') { to(f, { scaleX: frac }, t, d, ease); } };
  };
  F.doc = (parent, o) => {
    const n = o.lines, lh = o.lineH || 24, pad = 22, top = o.title ? 58 : pad, R = F.rng(o.seed || 7);
    const H = (k) => top + k * lh + pad - (lh - 10);
    const root = div(parent, 'abs', '', o.x, o.y, { width: o.w + 'px', height: H(n) + 'px', background: COL.body, border: `2px solid ${COL.ink}`, borderRadius: '8px', boxShadow: '4px 5px 0 rgba(43,40,36,.12)', overflow: 'hidden' });
    if (o.title) { const tt = div(root, 'abs nw', o.title, 20, 12, { fontSize: '24px', lineHeight: '30px', color: COL.mute }); }
    const ls = [];
    for (let k = 0; k < n; k++) { const w = (o.w - 2 * pad) * (k % 6 === 5 ? 0.35 + 0.2 * R() : 0.72 + 0.26 * R()); const e = div(root, 'abs', '', pad, top + k * lh, { width: w + 'px', height: '10px', borderRadius: '5px', background: '#d9d2c4' }); init(e, { opacity: 1 }); ls.push(e); }
    init(root, { opacity: 0, height: H(n), x: 0, y: 0 });
    let cur = n;
    return {
      el: root, lines: n, lineEls: ls,
      show(t) { F.show(root, t, 0.35); },
      keep(m, t, d = 0.8) {
        const span = Math.abs(cur - m) || 1;
        if (m < cur) for (let k = cur - 1; k >= m; k--) F.hide(ls[k], t + (d * 0.7 * (cur - 1 - k)) / span, 0.12);
        else for (let k = cur; k < m; k++) F.show(ls[k], t + (d * 0.7 * (k - cur)) / span, 0.12);
        to(root, { height: H(m) }, t, d, 'power2.inOut'); cur = m;
      },
    };
  };
})();
