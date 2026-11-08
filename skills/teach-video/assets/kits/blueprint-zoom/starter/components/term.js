// Light terminal window: typing, log lines, caret.
// Use:
//   const w = F.term(ctx.layer, { id: 'w0', title: '收件箱', x: 360, y: 130, w: 1200, h: 590, sq: F.COL.sA, right: '运行中' });
//     returns the window element (w._box = [x, y, w, h], w.bar the title bar, w.tt its title text). It is visible from frame 0: to bring it
//     in, F.init(w, { opacity: 0 }) then F.show(w, t) (or F.growInto). Inside it, coordinates start at the window's inner top-left; the
//     title bar takes y 0–40, so content starts at y ≈ 50. Children of the window are clipped to it and move with it.
//   F.termType(w, '› ', '这一周收到多少封邮件？', t0, 0.055, { x: 36, y: 62, size: 40, caret: 1.9 })  types one span per character; caret = when to remove the caret
//     returns { line, chars: [span per character], caret }
//   const log = F.termLog(w, { x: 22, y: 50, w: 466, h: 102, keep: 3 });  log.add('$ 读取 3 个文件', t, 'ok'|'me'|'stop', fast)  scrolls up when full;
//     returns { box, lg, els, add }, add returns the line element
//   F.termGrow(w, 215, t)  the window grows with its content (registers h first). To close: hide the content first, then shrink: hide → F.boxTo(w, …)
// Windows grow with their content; text typed by a person is vermilion WenKai (cls 'me'), machine output grey Mono; the prompt sign is ›.
(function () {
  const { init, to, set, el, div } = F;
  F.term = (parent, o) => {
    const t = div(parent, 'term' + (o.cls ? ' ' + o.cls : ''), `<div class="bar"><i></i><i></i><i></i>${o.sq ? `<b class="sq" style="background:${o.sq}"></b>` : ''}<span class="tt">${o.title || ''}</span>${o.right ? `<span class="tr">${o.right}</span>` : ''}</div>`, o.x, o.y, { width: o.w + 'px', height: o.h + 'px' });
    if (o.id) t.id = o.id;
    t._box = [o.x, o.y, o.w, o.h];
    t.bar = t.querySelector('.bar'); t.tt = t.querySelector('.bar .tt');
    return t;
  };
  F.termGrow = (w, h, t, d = 0.3) => { if (!F.has(w, 'height')) init(w, { height: w._box[3] }); to(w, { height: h }, t, d, 'power2.out'); w._box[3] = h; };
  // Typing: prefix as is, one span per character of s. dt is a number (interval per character) or a function i → time. Returns { line, chars, caret }
  // Each character opens from max-width 0 (.ch is overflow: hidden); being clipped by its own box while it opens is the typing effect itself, so every character carries data-layout-allow-overflow and the engine check does not report clipped_text
  F.termType = (w, prefix, s, t0, dt, o = {}) => {
    const line = div(w, 'q', prefix || '', o.x ?? 36, o.y ?? 62, Object.assign({ fontSize: (o.size || 40) + 'px' }, o.color ? { color: o.color } : {}));
    const chars = [...s].map((ch) => { const c = el('span', 'ch', line); c.textContent = ch; c.setAttribute('data-layout-allow-overflow', ''); return c; });
    F.measureChars(w, chars);
    chars.forEach((c, i) => { init(c, { opacity: 0, maxWidth: 0 }); to(c, { opacity: 1, maxWidth: 60 }, typeof dt === 'function' ? dt(i) : t0 + i * dt, 0.01, 'none'); });
    let caret = null;
    if (o.caret != null) { caret = el('span', 'caret', line); init(caret, { opacity: 0 }); set(caret, { opacity: 1 }, t0 - 0.05); set(caret, { opacity: 0 }, o.caret); }
    return { line, chars, caret };
  };
  // Measure each character's position in the window (window coordinates, unscaled) before hiding it; F.hand.underChars uses it
  F.measureChars = (w, chars) => {
    const W = w.getBoundingClientRect(), k = W.width / w.offsetWidth || 1, bx = w.clientLeft, by = w.clientTop;
    for (const c of chars) { const r = c.getBoundingClientRect(); c._r = { x0: (r.left - W.left) / k - bx, x1: (r.right - W.left) / k - bx, y1: (r.bottom - W.top) / k - by }; }
  };
  // Log area: 34 px per line, at most `keep` lines; beyond that the top line fades and the log scrolls up
  F.termLog = (w, o) => {
    const box = div(w, 'logbox', '<div class="lg"></div>', o.x, o.y, { width: o.w + 'px', height: o.h + 'px' });
    const lg = box.firstChild; init(lg, { y: 0 });
    const keep = o.keep || 3, LH = o.lineH || 34, els = [];
    return {
      box, lg, els,
      add(text, t, cls, fast) {
        const d = el('div', 'ln' + (cls ? ' ' + cls : ''), lg); d.textContent = text; d.style.top = (els.length * LH) + 'px';
        init(d, { opacity: 0 }); to(d, { opacity: 1 }, t, fast ? 0.1 : 0.22, 'power2.out');
        if (els.length >= keep) { const fd = fast ? 0.05 : 0.1; to(els[els.length - keep], { opacity: 0 }, t - 0.02 - fd, fd, 'power1.in'); to(lg, { y: -(els.length - keep + 1) * LH }, t - 0.02, fast ? 0.1 : 0.2, 'power2.out'); }
        els.push(d); return d;
      },
    };
  };
  // Stand-in: when the previous segment is not built, place the same empty window at t0 from the handoff description
  F.standIn = F.standIn || {};
  F.standIn.term = (spec, layer) => { const [x, y, w, h] = spec.box; return F.term(layer, { title: spec.title, x, y, w, h, sq: spec.sq }); };
})();
