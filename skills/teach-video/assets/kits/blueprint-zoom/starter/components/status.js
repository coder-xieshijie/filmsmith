// Status words: one place in a window or under a node whose word changes when the state changes (未运行 → 运行中… → ✓ 通过).
// Use:
//   const s = F.bp.status(term, 112, 92, [['未运行', 'mute'], ['运行中…', 'msgS'], ['✓ 通过', 'ok']], { size: 26 })
//     the first state is visible from frame 0; colours are token names; returns { els, go(i, t) }
//   s.go(1, t)   the old word blurs out (0.12 s), the new one blurs in (0.2 s); hold each state ≥ 0.6 s unless the narration runs on.
//                call go in time order: it blurs out the state set by the previous call
// A change the narration names is a state change: mark its anchor with ! in anchors.txt so the review packet shows before / during / after.
(function () {
  const { init, div } = F;
  const bp = (F.bp = F.bp || {});
  bp.status = (parent, x, y, states, o = {}) => {
    const els = states.map(([text, c], i) => {
      const e = div(parent, 'bp-st', text, x, y); e.style.color = F.COL[c] || c;
      if (o.size) e.style.fontSize = o.size + 'px';
      init(e, i === 0 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(6px)' });
      return e;
    });
    let cur = 0;
    return { els, go(i, t) { F.blurOut(els[cur], t, 0.12); F.blurIn(els[i], t + 0.1, 0.2); cur = i; } };
  };
})();
