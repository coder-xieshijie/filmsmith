// Messages: small rounded chips that travel along a connector, sampled every frame from a path (node centre to node centre).
// A chip sits under the nodes and windows it enters (create its layer before them), so it slides into a part and out of the next.
// Use (every chip is hidden until it travels):
//   const k = F.bp.chip(layer, 'GET /orders', 'msg'|'call'|'res'|'txt')   centre-anchored; colours from tokens (msg yellow, call red, res green, txt grey)
//   F.bp.travel(k, pathD, t0, t1, { a: 0, b: 1, ease, show, hide, under, hold })   moves k's centre from fraction a to b of pathD;
//     show: fades in at t0 (false or 'keep': already visible); hide: fades out at t1;
//     under: [[x, y, w, h], …] boxes of the nodes and windows it passes under: the chip fades as it slides under one, so its text is never seen half cut;
//     hold: seconds the chip rests, whole and still, in the middle of the gap between two parts (inside t0–t1; it eases in and out of the rest)
//   F.bp.trip(layer, text, kind, pathD, t0, t1, o)   a chip that appears, travels and goes (travel with hide: true); returns the chip
//   F.bp.emit(layer, text, pathD, { at, wait, go, arrive, type, kind, under })   a part writes something: the chip comes out at the path's end,
//     stops at fraction `wait` (between the writer and its neighbour), types its text from `at` (type: seconds per character, or i → time),
//     leaves at `go` and arrives at the path's start at `arrive`
//   F.bp.typeIn(k, t0, dt)   one character at a time (chip width fixed)      F.bp.fracAt(pathD, ([x, y]) => y <= 230)   first fraction where it holds
// Pace: the first round walks slowly (0.6–1 s per hop, timed to the words, hold ≈ 0.3); repeated rounds may take about 0.5 s per hop once the
// path is known (hold ≈ 0.2). Every hop between two parts gets a hold: with under, a chip without one is whole for only a few frames of a hop.
(function () {
  const { init, to, set, el, div, svgEl } = F;
  const bp = (F.bp = F.bp || {});
  const KIND = () => { const C = F.COL; return { msg: [C.msgS, C.msgB], call: [C.callS, C.callB], res: [C.resS, C.resB], txt: [C.txtS, C.txtB] }; };
  bp.chip = (parent, text, kind = 'msg') => {
    const k = KIND()[kind]; if (!k) throw new Error(`chip kind "${kind}": msg, call, res or txt`);
    const e = div(parent, 'bp-chip', '', 0, 0, { borderColor: k[0], background: k[1] });
    // deliberate: a message slides under the window or node it enters (and out from under the one it leaves)
    e.setAttribute('data-layout-allow-occlusion', 'message entering or leaving a window or node');
    e._chars = [...text].map((ch) => { const s = el('span', '', e); s.textContent = ch; s.setAttribute('data-layout-allow-occlusion', 'message'); return s; });
    init(e, { opacity: 0, scale: 1, x: -999, y: -999, xPercent: -50, yPercent: -50 });
    e._w = e.offsetWidth; e._h = e.offsetHeight;
    return e;
  };
  const sampler = (d) => {
    let s = F.$('bp-measure');
    if (!s) { s = F.fullSvg(document.body); s.id = 'bp-measure'; s.style.visibility = 'hidden'; s.setAttribute('data-layout-ignore', ''); }
    const p = svgEl('path', { d }, s), len = p.getTotalLength();
    return (f) => { const q = p.getPointAtLength(Math.max(0, Math.min(1, f)) * len); return [q.x, q.y]; };
  };
  // Share of the chip (centre x, y) under the most-covering box
  const coverOf = (k, x, y, boxes) => {
    const w = k._w || 1, h = k._h || 1, x0 = x - w / 2, y0 = y - h / 2;
    let m = 0;
    for (const [bx, by, bw, bh] of boxes) {
      const iw = Math.min(x0 + w, bx + bw) - Math.max(x0, bx), ih = Math.min(y0 + h, by + bh) - Math.max(y0, by);
      if (iw > 0 && ih > 0) m = Math.max(m, (iw * ih) / (w * h));
    }
    return m;
  };
  // The middle of the longest stretch of the path (between fractions a and b) where the chip is under no box; with no such stretch, the least covered point
  const gapMid = (at, k, a, b, under) => {
    const N = 200, cov = (f) => { const [x, y] = at(f); return under ? coverOf(k, x, y, under) : 0; };
    let best = null, run = null, low = { f: (a + b) / 2, c: Infinity };
    for (let i = 0; i <= N; i++) {
      const f = a + (b - a) * i / N, c = cov(f);
      if (c < low.c) low = { f, c };
      if (c === 0) { run = run || { s: f, e: f }; run.e = f; if (!best || Math.abs(run.e - run.s) > Math.abs(best.e - best.s)) best = { s: run.s, e: run.e }; } else run = null;
    }
    return best ? (best.s + best.e) / 2 : low.f;
  };
  bp.travel = (k, d, t0, t1, o = {}) => {
    const at = sampler(d), a = o.a ?? 0, b = o.b ?? 1, E = gsap.parseEase(o.ease || 'power1.inOut');
    const n = Math.max(1, Math.round((t1 - t0) * 30));
    // fraction of the path at time t: eased from a to b, or with hold: to the middle of the visible gap (power2.out), still for `hold` s, on (power2.in)
    let fracAt = (t) => a + (b - a) * E(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
    if (o.hold) {
      const m = gapMid(at, k, a, b, o.under), mv = Math.max(0.1, t1 - t0 - o.hold), share = Math.abs(b - a) > 1e-9 ? Math.abs(m - a) / Math.abs(b - a) : 0.5;
      const l1 = mv * share, l2 = mv - l1, E1 = gsap.parseEase('power2.out'), E2 = gsap.parseEase('power2.in');
      fracAt = (t) => { const u = t - t0; if (u <= l1) return l1 > 0 ? a + (m - a) * E1(u / l1) : m; if (u <= l1 + o.hold) return m; return l2 > 0 ? m + (b - m) * E2(Math.min(1, (u - l1 - o.hold) / l2)) : b; };
    }
    if (o.under) {
      // opacity per frame: fades over the first 0.12 s (unless already visible), fades as it slides under a box (gone at 35 % covered), and over the last 0.1 s when hide
      const showIn = o.show !== false && o.show !== 'keep';
      for (let i = 0; i <= n; i++) {
        const t = t0 + i / 30, [x, y] = at(fracAt(t));
        let op = 1 - Math.min(1, coverOf(k, x, y, o.under) / 0.35);
        if (showIn) op *= Math.min(1, (t - t0) / 0.12);
        if (o.hide) op *= Math.min(1, Math.max(0, (t1 + 0.08 - t) / 0.1));
        set(k, { x, y, opacity: Math.round(op * 1000) / 1000 }, t);
      }
      if (o.hide) set(k, { opacity: 0 }, t1 + 0.08);
      return;
    }
    for (let i = 0; i <= n; i++) { const t = t0 + i / 30, [x, y] = at(fracAt(t)); set(k, { x, y }, t); }
    if (o.show !== false && o.show !== 'keep') to(k, { opacity: 1 }, t0, 0.12, 'none');
    if (o.hide) to(k, { opacity: 0 }, t1 - 0.02, 0.1, 'none');
  };
  bp.fracAt = (d, pred) => { const at = sampler(d); for (let i = 0; i <= 600; i++) if (pred(at(i / 600))) return i / 600; return 1; };
  bp.typeIn = (k, t0, dt) => {
    k._chars.forEach((c, i) => { init(c, { opacity: 0 }); set(c, { opacity: 1 }, typeof dt === 'function' ? dt(i) : t0 + i * dt); });
  };
  bp.trip = (parent, text, kind, d, t0, t1, o = {}) => { const k = bp.chip(parent, text, kind); bp.travel(k, d, t0, t1, Object.assign({ hide: true }, o)); return k; };
  bp.emit = (parent, text, d, o) => {
    const k = bp.chip(parent, text, o.kind || 'call'), out = o.out ?? 0.3;
    bp.travel(k, d, o.at, o.at + out, { a: 1, b: o.wait, ease: 'power2.out', under: o.under });
    if (o.type) bp.typeIn(k, o.at + 0.05, o.type);
    bp.travel(k, d, o.go, o.arrive, { a: o.wait, b: 0, ease: 'power1.in', show: 'keep', hide: true, under: o.under });
    return k;
  };
})();
