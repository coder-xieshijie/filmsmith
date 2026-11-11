// Labels: a 'how' label, a dashed note box, numbers and captions. Sizes follow the token scale, never below 24 px.
// Use (all return the element, invisible at first; schedule your own entrance):
//   F.tag(ctx.scr, '示意', x, y)                         24 px grey text in a dashed box: label everything illustrative; enter with F.show
//   F.lbl(ctx.layer, '这一轮没有工具调用', x, y, 28, F.COL.ink)   one line of any size and colour; starts blurred (8 px): enter with F.blurIn(e, t)
//   F.how(ctx.scr, '按调用顺序')                          top left at 120,104, 28 px, a faint rule underneath; starts blurred: enter with F.blurIn
//   F.group(ctx.layer)                                    a wrapper for a set of labels (hand the whole set over: ctx.give('notes', g))
// Messages on lines are F.bp.chip (message.js), status words in a window F.bp.status (status.js).
// Stand-in kind "labels": list items { type: 'lbl'|'how'|'tag', text, x, y, size, color (token name) }; layer: 'scr' for the screen layer
(function () {
  const { init, div } = F;
  F.how = (parent, s) => { const e = div(parent, 'how', s); init(e, { opacity: 0, filter: 'blur(6px)' }); return e; };
  F.tag = (parent, s, x, y) => { const e = div(parent, 'tag', s, x, y); init(e, { opacity: 0 }); return e; };
  F.lbl = (parent, s, x, y, size, color, extra) => { const e = div(parent, 'lbl', s, x, y, Object.assign({ fontSize: size + 'px', color: color || F.COL.ink }, extra || {})); init(e, { opacity: 0, filter: 'blur(8px)' }); return e; };
  F.group = (parent) => F.div(parent, 'abs', '', 0, 0);
  F.standIn = F.standIn || {};
  F.standIn.labels = (spec, layer) => {
    const g = F.group(layer);
    for (const it of spec.list || []) {
      let e;
      if (it.type === 'how') e = F.how(g, it.text);
      else if (it.type === 'tag') e = F.tag(g, it.text, it.x, it.y);
      else e = F.lbl(g, it.text, it.x, it.y, it.size || 28, F.COL[it.color] || it.color);
      init(e, { opacity: 1, filter: 'blur(0px)' });
    }
    return g;
  };
})();
