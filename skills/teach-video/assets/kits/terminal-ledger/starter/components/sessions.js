// Session windows with a lamp queue, and a rope: four light terminal windows, each with a row of lamps along its lower edge (lit yellow = waiting for a reply).
// Sessions are always windows, never horizontal bars.
// Use (canvas coordinates; windows start invisible unless show() or visible: true):
//   const S = F.sessions(ctx.layer, { boxes: F.SESS_BOXES, lamps: 9, visible: false, titles: ['会话 A', …], waitLabel: '等你回复' })
//     waitLabel: false drops the line above the lamps (a rope pulled left would cross another window's label)
//     S.wins[i]   window i (F.term, title with an identity square); S.logs[i] = F.termLog (log lines, Mono 26)
//     S.lamps[i][k]  lamp k of window i (circle, 18 across); S.lampXY(i, k) → the lamp centre in canvas coordinates (for F.pressAt, rope ends)
//     S.show(t, gap = 0.08)       the four windows pop in one by one (0.75 → 1, back.out)
//     S.lampOn(i, k, t) / S.lampOff(i, k, t)   lamp lit (yellow) / off (hollow)
//     S.prompt(i, '继续', t) / S.promptClear(i, t)   a reply appears after the window's last-line › (vermilion WenKai) / is cleared; add ctx.hit('tick', t) in the segment
//     S.el is the wrapper (canvas-sized; handoff box [0, 0, 1920, 1080]; move the set with it)
//   F.rope(ctx.layer, [x0, y0], [x1, y1], t, { d: 0.35, sag: 60 })   a vermilion 5 px round-capped rope flung from start to end (slack, then taut; back.out(2.2))
//     returns { path, tighten(t), drop(t) }: tighten pulls it straight; drop reels it in (exits take half as long as entrances)
// Stand-in kind "sessions": { boxes: [[x, y, w, h] ×4], lit: [lamps lit per window, …], titles }.
(function () {
  const { init, to, div, svgEl, COL } = F;
  F.SESS_BOXES = [[470, 222, 510, 290], [1006, 222, 510, 290], [470, 556, 510, 290], [1006, 556, 510, 290]];
  const SQ = () => [COL.sA, COL.sB, COL.sC, COL.sD];
  F.sessions = (parent, o = {}) => {
    const boxes = o.boxes || F.SESS_BOXES, nL = o.lamps || 9, titles = o.titles || ['会话 A', '会话 B', '会话 C', '会话 D'];
    const g = div(parent, 'abs', '', 0, 0, { width: TOKENS.zone.W + 'px', height: TOKENS.zone.H + 'px' });
    const S = { el: g, wins: [], logs: [], lamps: [], boxes, prompts: [] };
    boxes.forEach((b, i) => {
      const w = F.term(g, { title: titles[i], x: b[0], y: b[1], w: b[2], h: b[3], sq: SQ()[i % 4] });
      init(w, o.visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.75, transformOrigin: '50% 50%' });
      S.wins.push(w);
      S.logs.push(F.termLog(w, { x: 22, y: 52, w: b[2] - 44, h: 108, keep: 3 }));
      if (o.waitLabel !== false) div(w, 'abs', typeof o.waitLabel === 'string' ? o.waitLabel : '等你回复', b[2] - 120, b[3] - 104, { fontSize: TOKENS.fs.min + 'px', color: COL.mute, lineHeight: '30px' });
      const row = [];
      for (let k = 0; k < nL; k++) {
        const L = div(w, 'abs', '', 26 + k * 30, b[3] - 98, { width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${COL.lampS}`, boxSizing: 'border-box' });
        init(L, { backgroundColor: COL.body });
        row.push(L);
      }
      S.lamps.push(row);
      const p = div(w, 'abs', '›', 22, b[3] - 54, { fontFamily: TOKENS.font.mono, fontSize: TOKENS.fs.log + 'px', color: COL.ink, lineHeight: '34px' });
      const pt = div(w, 'abs', '', 52, b[3] - 54, { fontSize: TOKENS.fs.body + 'px', color: COL.me, lineHeight: '34px', whiteSpace: 'nowrap' });
      init(pt, { opacity: 0 });
      S.prompts.push(pt); void p;
    });
    S.lampXY = (i, k) => { const b = boxes[i]; return [b[0] + 26 + k * 30 + 9, b[1] + b[3] - 98 + 9]; };
    S.show = (t, gap = 0.08) => S.wins.forEach((w, i) => to(w, { opacity: 1, scale: 1 }, t + i * gap, 0.18, 'back.out(1.6)'));
    S.lampOn = (i, k, t) => to(S.lamps[i][k], { backgroundColor: COL.lamp }, t, 0.12, 'power2.out');
    S.lampOff = (i, k, t) => to(S.lamps[i][k], { backgroundColor: COL.body }, t, 0.12, 'power2.in');
    S.prompt = (i, s, t) => { const e = S.prompts[i]; F.txt(e, s, t); to(e, { opacity: 1 }, t, 0.1, 'power2.out'); };
    S.promptClear = (i, t) => to(S.prompts[i], { opacity: 0 }, t, 0.1, 'power2.in');
    (o.lit || []).forEach((n, i) => { for (let k = 0; k < n; k++) init(S.lamps[i][k], { backgroundColor: COL.lamp }); });
    return S;
  };
  F.rope = (parent, a, b, t, o = {}) => {
    const svg = svgEl('svg', { class: 'full', viewBox: `0 0 ${TOKENS.zone.W} ${TOKENS.zone.H}` }, parent);
    const sag = o.sag ?? 60, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
    const path = svgEl('path', { d: `M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`, fill: 'none', stroke: COL.me, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    init(path, { drawSVG: '0% 0%', attr: { d: path.getAttribute('d') } });
    F.draw(path, t, o.d ?? 0.35, 'power3.out');
    const straight = `M${a[0]},${a[1]} Q${mx},${(a[1] + b[1]) / 2} ${b[0]},${b[1]}`;
    return {
      svg, path,
      tighten: (tt, d = 0.3) => to(path, { attr: { d: straight } }, tt, d, 'back.out(2.2)'),
      drop: (tt, d = 0.18) => F.draw(path, tt, d, 'power2.in', '0% 100%', '100% 100%'),
    };
  };
  F.standIn = F.standIn || {};
  F.standIn.sessions = (spec, layer) => F.sessions(layer, { boxes: spec.boxes, titles: spec.titles, lit: spec.lit, visible: true });
})();
