// Stand-in segment: before a segment is written, lays out its first and last frames from handoff.json so the whole film can be seeked, sheeted and checked.
// Use: defineSegment('B', (ctx) => F.shell(ctx));   the segment agent replaces this line with its own picture; a finished segment never keeps F.shell.
// What it does: takes first.items; at the segment's midpoint retires objects that are gone or changed by the last frame, places last.items as stand-ins and gives them;
// switches the chapter label and the counter from first to last. The empty half (when first.items or last.items is empty) shows a faint placeholder "空壳 · <id>" with the
// first 30 characters of the goal (so geo-check does not report a blank page); old and new objects overlap 0.15 s around the midpoint, never leaving blank paper.
(function () {
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const elOf = (o) => (o && o.nodeType ? o : o && o.el);
  F.shell = (ctx) => {
    const fi = (ctx.in && ctx.in.items) || {}, la = (ctx.out && ctx.out.items) || {};
    const t0 = ctx.t0, t1 = ctx.t1, tm = t0 + (t1 - t0) * 0.5;
    const took = {};
    for (const id in fi) took[id] = ctx.take(id);
    for (const id in fi) if (!(id in la) || !same(fi[id], la[id])) { const e = elOf(took[id]); if (e) F.hide(e, tm - 0.4, 0.25); }
    for (const id in la) {
      if (id in fi && same(fi[id], la[id])) { ctx.give(id, took[id]); continue; }
      const spec = la[id], mk = (F.standIn || {})[spec.kind];
      if (!mk) throw new Error(`no stand-in for kind ${spec.kind}`);
      const o = mk(spec, spec.layer === 'scr' ? ctx.scr : ctx.layer), e = elOf(o);
      if (spec.kind === 'stamp') { F.init(e, { opacity: 0 }); F.stampIn(o, tm - 0.25); } else { F.init(e, { opacity: 0 }); F.show(e, tm - 0.25, 0.35); }
      ctx.give(id, o);
    }
    const empty1 = !Object.keys(fi).length, empty2 = !Object.keys(la).length;
    if (empty1 || empty2) {
      // The placeholder is faint on purpose: data-layout-ignore keeps the engine check from measuring its contrast and layout (geo-check still counts it, so no blank-page report)
      const g = F.div(ctx.layer, 'abs', '', 0, 0); g.setAttribute('data-layout-ignore', '');
      const goal = String(ctx.seg && ctx.seg.goal || ctx.out.state || '');
      for (const e of [F.lbl(g, '空壳 · ' + ctx.id, 120, 360, 66, F.COL.faint), F.lbl(g, goal.length > 30 ? goal.slice(0, 30) + '…' : goal, 120, 460, 28, F.COL.faint)]) F.init(e, { opacity: 1, filter: 'none' });
      F.init(g, { opacity: empty1 && t0 === 0 ? 1 : 0 });
      if (empty1 && t0 > 0) F.set(g, { opacity: 1 }, t0);
      if (empty1 && !empty2) F.hide(g, tm - 0.4, 0.25);
      if (!empty1 && empty2) F.show(g, tm - 0.25, 0.35);
      // Neither end has handoff objects (the skeleton right after npm run init): the placeholder belongs to this segment and goes 0.1 s before its end (the film's last segment keeps it)
      if (empty2 && t1 < ctx.film.duration - 1e-3) F.set(g, { opacity: 0 }, t1 - 0.1);
    }
    // chapter.js and counter.js are optional in a kit: without them a contract's chapter / counter is not drawn (page checks then report it)
    const fc = ctx.in.chapter || null, lc = ctx.out.chapter || null;
    if (fc !== lc && F.chapter) { if (lc) F.chapter(lc, tm); else F.chapterHide(tm); }
    const a = ctx.in.counter || null, b = ctx.out.counter || null;
    if (!F.cntSeg) return;
    if (same(a, b)) { if (a) F.cntSeg(t0, t1, () => a.value); return; }
    if (a) F.cntSeg(t0, tm, () => a.value);
    F.unitsOff(tm);
    if (b) {
      F.cntSeg(tm, t1, () => b.value);
      if (a) F.cntBlur(tm); else F.cntOn(tm);
      F.cntPre(!!b.approx, tm);
      const k = 'shell-' + ctx.id; F.unit(k, b.unit); F.unitOn(k, tm + 0.1);
    } else F.cntOff(tm);
  };
})();
