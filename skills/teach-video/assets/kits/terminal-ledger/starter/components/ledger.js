// Dot ledger: a ledger page, hundreds of small hand-drawn dots, and pre-laid piles.
// The piles are laid out in the page (fixed seeds, tens of milliseconds), so the same parameters give the same layout in any segment and a
// handoff only needs the parameters.
// Use:
//   const led = F.ledger(ctx.layer, { title: '待处理', card: [1190, 196, 0.28] });  card = small ledger's top-left and scale; omit for the full page
//   led.appear(t)                  the small ledger fades in (0.3 s)
//   led.grow(t, d = 0.8)           pushes in place to the full page (x, y and scale on one power2.inOut); frame and title hide on the way, rules return near the end
//   led.rulesOff(t) / led.rulesOn(t)   ledger rules and margin line leave / return (leave when switching to the terminal world)
//   const dots = led.addDots(600, { at: [40, 512], color: 'base', opacity: 0 });   dots (each {e, i, k}), stacked at `at` to begin with
//   const P = F.pile(300, 372, 536, 23)             positions for one pile (irregular blob + collision relaxation); squash and gap optional
//   led.toPile(sub, P, [cx, cy], t, { d: 0.8, spread: 0.3, color: 'cont', colorAt: t + 0.1 })  send these dots to the pile (outer slots pick their nearest dot first, so motion stays parallel)
//   F.partition(dots, { c: 300, j: 120, r: 180 }, seed)   randomly sort dots into groups of given sizes, written to dot.k
//   F.rank(sub, (o) => key) → Map(dot → 0–1)          order by a value (piles move left to right by default)
// Colour names are the dot colours in tokens: base / cont / judge / rest / rel (the stroke takes xxxS automatically).
(function () {
  const { init, to, set, hide, show, el, div, svgEl, hash, COL } = F;
  const mulberry32 = (a) => function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r1 = (v) => Math.round(v * 10) / 10;
  F.mulberry32 = mulberry32;
  F.pile = (n, cx, cy, seed, squash = [1.06, 0.94], gap = 20.4) => {
    const rr = mulberry32(seed);
    const R = Math.sqrt((n * gap * gap * 0.92) / Math.PI);
    const ph1 = rr() * 6.28, ph2 = rr() * 6.28;
    const edge = (th) => R * (1 + 0.075 * Math.sin(2 * th + ph1) + 0.05 * Math.sin(3 * th + ph2));
    const pts = [];
    for (let i = 0; i < n; i++) { const th = rr() * Math.PI * 2, u = Math.sqrt(rr()); pts.push([Math.cos(th) * edge(th) * u, Math.sin(th) * edge(th) * u]); }
    const MIN = gap * 0.858, CS = gap;
    for (let it = 0; it < 160; it++) {
      const grid = new Map();
      pts.forEach((p, i) => { const k = Math.floor(p[0] / CS) + ',' + Math.floor(p[1] / CS); (grid.get(k) || grid.set(k, []).get(k)).push(i); });
      for (let i = 0; i < n; i++) {
        const p = pts[i], gx = Math.floor(p[0] / CS), gy = Math.floor(p[1] / CS);
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const j of grid.get((gx + dx) + ',' + (gy + dy)) || []) {
          if (j <= i) continue;
          const q = pts[j], ex = q[0] - p[0], ey = q[1] - p[1], d = Math.hypot(ex, ey) || 0.01;
          if (d < MIN) { const k = ((MIN - d) / 2) / d; p[0] -= ex * k; p[1] -= ey * k; q[0] += ex * k; q[1] += ey * k; }
        }
      }
      for (let i = 0; i < n; i++) {
        const p = pts[i], th = Math.atan2(p[1], p[0]), d = Math.hypot(p[0], p[1]), e = edge(th) * (i % 37 === 0 ? 1.1 : 1);
        if (d > e) { p[0] *= 1 - 0.5 * (d - e) / d; p[1] *= 1 - 0.5 * (d - e) / d; } else { p[0] *= 0.997; p[1] *= 0.997; }
      }
    }
    return pts.map((p) => [r1(cx + p[0] * squash[0] + (rr() - 0.5) * 1.6), r1(cy + p[1] * squash[1] + (rr() - 0.5) * 1.6)]);
  };
  // Greedy assignment: pile slots from the outside in, each slot takes its nearest free dot. src(o) gives a dot's starting position
  F.assign = (sub, slots, center, src) => {
    const order = slots.map((p, k) => [k, Math.hypot(p[0] - center[0], p[1] - center[1])]).sort((a, b) => b[1] - a[1]);
    const free = new Set(sub), out = new Map();
    for (const [k] of order) {
      let best = null, bd = Infinity;
      for (const o of free) { const p = src(o); const d = (p[0] - slots[k][0]) ** 2 + (p[1] - slots[k][1]) ** 2; if (d < bd) { bd = d; best = o; } }
      free.delete(best); out.set(best, slots[k]);
    }
    return out;
  };
  F.partition = (dots, counts, seed) => {
    const rr = mulberry32(seed), idx = dots.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rr() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    let k = 0; for (const key in counts) for (let m = 0; m < counts[key]; m++) dots[idx[k++]].k = key;
    return dots;
  };
  F.rank = (arr, key) => { const s = arr.slice().sort((a, b) => key(a) - key(b)); const m = new Map(); s.forEach((o, k) => m.set(o, k / Math.max(1, s.length - 1))); return m; };
  const wobble = (seed, r = 7.6, pct = 7) => {
    const rr = mulberry32(seed * 7919), n = 12, pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const w = 1 + (rr() * 2 - 1) * pct / 100; pts.push([Math.cos(a) * r * w, Math.sin(a) * r * w]); }
    let d = `M${r1((pts[0][0] + pts[n - 1][0]) / 2)} ${r1((pts[0][1] + pts[n - 1][1]) / 2)}`;
    for (let j = 0; j < n; j++) { const p = pts[j], q = pts[(j + 1) % n]; d += ` Q${r1(p[0])} ${r1(p[1])} ${r1((p[0] + q[0]) / 2)} ${r1((p[1] + q[1]) / 2)}`; }
    return d + 'Z';
  };
  F.dotShapes = [1, 2, 3, 4, 5, 6].map((s) => wobble(s));   // 12-point wobbly circles, about 16 px across, 6 shapes in rotation
  F.dotColor = (name) => ({ fill: COL[name], stroke: COL[name + 'S'] });

  F.ledger = (parent, o = {}) => {
    const root = div(parent, 'led', `<div class="frame"></div><div class="rules"></div><div class="margin"></div><div class="title">${o.title || ''}</div>`);
    const svg = svgEl('svg', { class: 'full', viewBox: `0 0 ${TOKENS.zone.W} ${TOKENS.zone.H}` }, root);
    const g = svgEl('g', {}, svg);
    const L = { el: root, svg, g, frame: root.querySelector('.frame'), rules: root.querySelector('.rules'), margin: root.querySelector('.margin'), title: root.querySelector('.title'), dots: [] };
    const card = o.card || [0, 0, 1];
    init(root, { x: card[0], y: card[1], scale: card[2], opacity: o.card ? 0 : 1 });
    const full = !o.card;
    for (const k of ['frame', 'title']) init(L[k], { opacity: full ? 0 : 1 });
    for (const k of ['rules', 'margin']) init(L[k], { opacity: o.rules === false ? 0 : 1 });
    L.appear = (t) => to(root, { opacity: 1 }, t, 0.3, 'power1.out');
    L.grow = (t, d = 0.8) => {
      to(root, { x: 0, y: 0, scale: 1 }, t, d, 'power2.inOut');
      hide(L.frame, t - 0.12, 0.2); hide(L.title, t - 0.12, 0.15);
      hide(L.rules, t - 0.12, 0.2); show(L.rules, t + d - 0.18, 0.3);
    };
    L.rulesOff = (t, d = 0.5) => { hide(L.rules, t, d); hide(L.margin, t, d); };
    L.rulesOn = (t, d = 0.45) => { to(L.rules, { opacity: 1 }, t, d, 'power1.out'); to(L.margin, { opacity: 1 }, t, d, 'power1.out'); };
    L.addDots = (n, p = {}) => {
      const at = p.at || [960, 540], c = F.dotColor(p.color || 'base');
      const base = L.dots.length;
      for (let i = 0; i < n; i++) {
        const e = svgEl('path', { d: F.dotShapes[(base + i) % 6] }, g);
        init(e, { x: at[0], y: at[1], scale: p.scale ?? 1, transformOrigin: '50% 50%', fill: c.fill, stroke: c.stroke, strokeWidth: 1.2, opacity: p.opacity ?? 1 });
        L.dots.push({ e, i: base + i, k: null });
      }
      return L.dots.slice(base);
    };
    L.pos = (o) => { const s = F.st.get(o.e); return [s.x, s.y]; };
    // To a pile: dots in sub are assigned greedily to P's slots; lower rankBy moves first (default: by x, left to right)
    L.toPile = (sub, P, center, t, p = {}) => {
      const m = F.assign(sub, P, center, L.pos);
      const rk = F.rank(sub, p.rankBy || ((x) => L.pos(x)[0]));
      const c = p.color ? F.dotColor(p.color) : null;
      sub.forEach((x) => {
        const tt = t + rk.get(x) * (p.spread ?? 0.3) + hash(x.i, p.seed || 7) * (p.jitter ?? 0.08);
        const q = m.get(x);
        to(x.e, Object.assign({ x: q[0], y: q[1] }, p.scale != null ? { scale: p.scale } : {}), tt, p.d ?? 0.8, p.ease || 'power3.inOut');
        if (c) to(x.e, c, p.colorAt != null ? p.colorAt + hash(x.i, (p.seed || 7) + 1) * (p.colorSpread ?? 0) : tt + 0.1, p.colorD ?? 0.6, 'power1.inOut');
      });
      return m;
    };
    return L;
  };
  // Stand-in: spec = { box: [x, y, w, h], title, frame: false, rules: true, piles: [{ n, c: [x, y], seed, color, squash, k }] }
  F.standIn = F.standIn || {};
  F.standIn.ledger = (spec, layer) => {
    const b = spec.box || [0, 0, TOKENS.zone.W, TOKENS.zone.H], s = b[2] / TOKENS.zone.W, small = s < 0.999;
    const L = F.ledger(layer, { title: spec.title, card: small ? [b[0], b[1], s] : null, rules: spec.rules !== false });
    if (small) init(L.el, { opacity: 1 });
    if (spec.frame === false) { init(L.frame, { opacity: 0 }); init(L.title, { opacity: 0 }); }
    for (const p of spec.piles || []) {
      const P = F.pile(p.n, p.c[0], p.c[1], p.seed, p.squash);
      const sub = L.addDots(p.n, { color: p.color || 'base' });
      sub.forEach((x, k) => { init(x.e, { x: P[k][0], y: P[k][1] }); x.k = p.k || null; });
    }
    return L;
  };
})();
