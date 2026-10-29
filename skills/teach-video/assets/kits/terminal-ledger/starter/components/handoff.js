// Handoff helpers: segments never clear the screen or cross-fade; one object morphs or moves from the previous segment's last state into the next one's first.
// The handoff contract lives in handoff.json; segments receive with ctx.take(id) and hand over with ctx.give(id, obj) (main.js, CARD.md). The moves:
//   F.boxTo(e, fromBox, toBox, t, d)        an element goes from one box to another (x, y, scaleX, scaleY, origin top-left; lib.js)
//   F.morphCard(e, { w, h, border, radius, bg }, t, d)   a card changes shape in place: centre fixed; width, height, border colour, radius and fill together
//   F.flowAlong(e, path, t, d, ease)        travel along an SVG path (marks flowing into a ledger); the end position is recorded as the path's end
//   F.spawnFrom(src, els, t, { gap: 0.03 }) one object becomes a set: els start stacked at src, then go to their places one by one (a wall of windows, six cards)
//   F.growInto(seed, e, t, d)               a dot grows into a window: seed flies to e's centre, e grows in place from 0.035×
// Camera push and pull use power2.inOut only; arrivals power3.out / expo.out; exits take half as long as entrances.
(function () {
  const { init, to, set, tl, has } = F;
  F.morphCard = (e, p, t, d = 0.6) => {
    const cs = getComputedStyle(e), w0 = e.offsetWidth, h0 = e.offsetHeight;
    if (!has(e, 'width')) init(e, { width: w0, height: h0, x: has(e, 'x') ? F.st.get(e).x : 0, y: has(e, 'y') ? F.st.get(e).y : 0, borderColor: cs.borderTopColor, borderRadius: parseFloat(cs.borderTopLeftRadius) || 0, backgroundColor: cs.backgroundColor });
    const s = F.st.get(e), w = p.w ?? s.width, h = p.h ?? s.height;
    const v = { width: w, height: h, x: s.x - (w - s.width) / 2, y: s.y - (h - s.height) / 2 };
    if (p.border) v.borderColor = p.border; if (p.radius != null) v.borderRadius = p.radius; if (p.bg) v.backgroundColor = p.bg;
    to(e, v, t, d, 'power2.inOut');
  };
  F.flowAlong = (e, path, t, d = 0.7, ease = 'power2.inOut') => {
    tl.to(e, { motionPath: { path }, duration: d, ease, immediateRender: false }, t);
    const m = path.match(/(-?[\d.]+)[ ,](-?[\d.]+)\s*$/);
    if (m) F.assume(e, { x: +m[1], y: +m[2] });
  };
  F.spawnFrom = (src, els, t, o = {}) => {
    els.forEach((e, i) => {
      init(e, { x: src[0], y: src[1], opacity: 0 });
      to(e, { opacity: 1 }, t + i * (o.gap ?? 0.03), 0.08);
      to(e, { x: e._to[0], y: e._to[1] }, t + i * (o.gap ?? 0.03), o.d ?? 0.5, 'power3.out');
    });
  };
  F.growInto = (seed, e, t, d = 0.55) => {
    const b = e._box; const cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2;
    to(seed, { x: cx, y: cy, scale: 1.4 }, t - 0.45, 0.42, 'power3.inOut'); set(seed, { opacity: 0 }, t + 0.05);
    init(e, { opacity: 0, scale: 0.035, transformOrigin: '50% 50%' }); set(e, { opacity: 1 }, t); to(e, { scale: 1 }, t, d, 'power3.inOut');
  };
})();
