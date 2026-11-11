// Prompt card: a large terminal-style card that types out one sentence the viewer must read (a quotation, the text of a prompt). Carries data-read:
// geo-check measures the longest stretch with every character shown, opaque and the whole block in frame; ≥ 4 s by default (option read).
// Finish typing before or as the narration says it, and hold the whole sentence ≥ 4 s before it leaves.
// Each character opens from max-width 0 like F.termType, so each carries data-layout-allow-overflow (the engine check does not report clipped_text while it types).
// Use:
//   const pc = F.promptCard(ctx.layer, { title: 'prompt · 第一句', x: 230, y: 250, w: 1240, h: 330,
//     lines: ['第一行；', '第二行、', '第三行。'], t: 3.4, typeAt: 3.7, dt: 0.017, read: 4 });
//   pc.color(0, 7, F.COL.agent, t)    colour characters 0–6 (keywords: teal = the machine does it, vermilion = stop and ask a person)
//   pc.out(t)                          text leaves first (0.15 s), then the card fades; to turn it into something else use pc.toDot(x, y, t, 'judge')
//   pc.el / pc.chars / pc.lines / pc.bar
(function () {
  const { init, to, set, hide, el, div, COL } = F;
  F.promptCard = (parent, o) => {
    const w = F.term(parent, { title: o.title, x: o.x, y: o.y, w: o.w, h: o.h, cls: 'prompt' });
    w.setAttribute('data-read', o.read != null ? String(o.read) : '');
    init(w, { opacity: 0, scale: 0.96, transformOrigin: '50% 50%' }); to(w, { opacity: 1, scale: 1 }, o.t, 0.35, 'power3.out');
    const lines = o.lines.map((s, i) => div(w, 'q', i === 0 ? '› ' : '', i === 0 ? 40 : 86, 70 + i * 72));
    const chars = [];
    o.lines.forEach((s, li) => [...s].forEach((ch) => { const sp = el('span', 'ch', lines[li]); sp.textContent = ch; sp.setAttribute('data-layout-allow-overflow', 'typing'); chars.push(sp); }));
    F.measureChars(w, chars);
    const dt = o.dt ?? 0.017, t0 = o.typeAt ?? o.t + 0.3;
    chars.forEach((sp, i) => { init(sp, { opacity: 0, maxWidth: 0, color: COL.ink }); to(sp, { opacity: 1, maxWidth: 60 }, t0 + i * dt, 0.01, 'none'); });
    const P = { el: w, chars, lines, bar: w.bar, typedAt: t0 + chars.length * dt };
    P.color = (from, toI, c, t) => chars.slice(from, toI).forEach((sp, k) => to(sp, { color: c }, t + k * 0.03, 0.2, 'power1.out'));
    P.out = (t) => { for (const e of [w.bar, ...lines]) { init(e, { opacity: 1 }); hide(e, t, 0.15); } hide(w, t + 0.15, 0.25); };
    // Text leaves first, then the card shrinks into one dot that lands at (x, y) (a card becoming a dot in a pile)
    P.toDot = (x, y, t, color = 'judge') => {
      for (const e of [w.bar, ...lines]) { init(e, { opacity: 1 }); hide(e, t - 0.05, 0.15); }
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      init(w, { x: 0, y: 0, width: o.w, height: o.h, borderRadius: 12, backgroundColor: COL.body, borderColor: COL.ink, boxShadow: '8px 9px 0px rgba(43,40,36,0.14)' });
      to(w, { x: cx - 22 - o.x, y: cy - 22 - o.y, width: 44, height: 44, borderRadius: 22, backgroundColor: COL[color], borderColor: COL[color + 'S'], boxShadow: '0px 0px 0px rgba(43,40,36,0)' }, t + 0.05, 0.42, 'power3.inOut');
      to(w, { x: x - 9 - o.x, y: y - 9 - o.y, width: 18, height: 18, borderRadius: 9 }, t + 0.5, 0.35, 'power2.in');
      set(w, { opacity: 0 }, t + 0.85);
      return t + 0.85;
    };
    return P;
  };
})();
