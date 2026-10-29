// Top-right counter: right-aligned at x 1860, 112 px WenKai tabular digits, a double rule below, one 30 px unit line. One per film, shared.
// The value shown is a pure function of time: F.cntSeg(t0, t1, (t) => '600') registers "what shows in this span", and the main timeline writes it each frame.
// To change quantity, blur out and land the new number (F.cntBlur); never count from one quantity to another.
// Use:
//   F.unit('n', '封要处理'); F.unitOn('n', t); F.unitOff('n', t)     unit line
//   F.cntSeg(t0, t1, fn)   F.cntOn(t)  F.cntOff(t)  F.cntBlur(t)  F.cntJump(t) (settles with a 1.1× hop)  F.cntPre(true, t) (the "约" before the number)
//   F.unitsOff(t)   take away every unit line registered so far (call before a new F.unit when the unit changes)
//   F.cntNow(value, unitKey, unitText, t0, t1)   for handoffs: no animation, show this from t0 to t1 (main calls it when the previous segment is not built)
(function () {
  const { init, to, el, div } = F;
  let box, numEl, wrap, rule, pre, last = null;
  const segs = [], units = {};
  const mk = () => {
    if (box) return;
    box = div(F.$('world'), '', '<div id="c-num-wrap" class="dg"><span id="c-pre">约</span><span id="c-num"></span></div><div id="c-rule"></div>'); box.id = 'counter';
    numEl = F.$('c-num'); wrap = F.$('c-num-wrap'); rule = F.$('c-rule'); pre = F.$('c-pre');
    init(wrap, { opacity: 0, filter: 'blur(8px)' }); init(numEl, { scale: 1, transformOrigin: '100% 60%' });
    init(rule, { scaleX: 0 }); init(pre, { opacity: 0 });
  };
  F.cntRender = () => {
    if (!box) return;
    const t = F.tl.time(); let v = '';
    for (const g of segs) if (t >= g.t0 && t < g.t1) v = String(g.f(t));
    if (v !== last) { numEl.innerHTML = F.dg(v); last = v; }
  };
  F.cntSeg = (t0, t1, f) => { mk(); segs.push({ t0, t1, f }); };
  F.unit = (key, text) => { mk(); const u = el('div', 'cu', box); u.textContent = text; init(u, { opacity: 0, filter: 'blur(6px)' }); units[key] = u; return u; };
  F.unitOn = (key, t) => to(units[key], { opacity: 1, filter: 'blur(0px)' }, t, 0.2, 'power2.out');
  F.unitOff = (key, t) => to(units[key], { opacity: 0, filter: 'blur(6px)' }, t, 0.15, 'power2.in');
  F.cntOn = (t) => { mk(); to(wrap, { opacity: 1, filter: 'blur(0px)' }, t, 0.18, 'power2.out'); to(rule, { scaleX: 1 }, t + 0.05, 0.5, 'power3.out'); };
  F.cntOff = (t) => { to(wrap, { opacity: 0, filter: 'blur(8px)' }, t, 0.2, 'power2.in'); to(rule, { scaleX: 0 }, t + 0.05, 0.3, 'power2.in'); };
  F.cntBlur = (t) => { to(wrap, { opacity: 0, filter: 'blur(8px)' }, t, 0.13, 'power2.in'); to(wrap, { opacity: 1, filter: 'blur(0px)' }, t + 0.18, 0.18, 'power2.out'); };
  F.cntJump = (t) => { to(numEl, { scale: 1.1 }, t, 0.07, 'power2.out'); to(numEl, { scale: 1 }, t + 0.07, 0.25, 'power2.out'); };
  F.cntPre = (on, t) => to(pre, { opacity: on ? 1 : 0 }, t, 0.15, on ? 'power2.out' : 'power2.in');
  F.cntNow = (value, unitKey, unitText, t0, t1, approx) => {
    mk(); segs.push({ t0, t1, f: () => value });
    init(wrap, { opacity: 1, filter: 'blur(0px)' }); init(rule, { scaleX: 1 }); init(pre, { opacity: approx ? 1 : 0 });
    if (unitKey) { const u = F.unit(unitKey, unitText); init(u, { opacity: 1, filter: 'blur(0px)' }); }
  };
  // Take away every unit line registered so far (when the unit changes, without knowing the previous segment's key)
  F.unitsOff = (t) => Object.values(units).forEach((u) => to(u, { opacity: 0, filter: 'blur(6px)' }, t, 0.15, 'power2.in'));
  F.cntText = () => (numEl ? numEl.textContent : '');
})();
