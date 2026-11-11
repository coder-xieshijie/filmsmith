// Labels: a 'how' label, a dashed note box, numbers and captions, chips. Sizes follow the token scale, never below 24 px.
// Use (all return the element, invisible at first; schedule your own entrance):
//   F.how(ctx.scr, '分法：按要不要你动手')              top left at 120,104, 28 px, a faint rule underneath; starts blurred: enter with F.blurIn
//   F.tag(ctx.layer, '示意数据', x, y)                 24 px grey text in a dashed box: label everything illustrative; enter with F.show
//   F.lbl(ctx.layer, '50%', x, y, 66, F.COL.ink)        one line of any size and colour (numbers 66 / 46, captions 28); starts blurred
//                                                       (8 px): enter with F.blurIn(e, t), since F.show alone leaves it blurred
//   F.chip(ctx.layer, '通知', x, y, 'c'|'g'|'a'|'m'|'n', t, rot)   a chip that lands at t (0.32 s back.out) and settles at angle rot (degrees);
//     c yellow, g green, a teal, m vermilion, n neutral
//   F.chipKind(c, 'a', t)                                 recolour a chip (change its kind); move it with F.to(c, { x, y }, t, d)
//   F.group(ctx.layer)                                    a wrapper for a set of labels (hand the whole set over: ctx.give('labelsA', g))
// Stand-in kind "labels": list items { type: 'lbl'|'how'|'tag'|'chip', text, x, y, size, color (token name), rot, chip: 'c'|'g' }; layer: 'scr' for the screen layer
(function () {
  const { init, to, div } = F;
  F.how = (parent, s) => { const e = div(parent, 'how', s); init(e, { opacity: 0, filter: 'blur(6px)' }); return e; };
  F.tag = (parent, s, x, y) => { const e = div(parent, 'tag', s, x, y); init(e, { opacity: 0 }); return e; };
  F.lbl = (parent, s, x, y, size, color, extra) => { const e = div(parent, 'lbl', s, x, y, Object.assign({ fontSize: size + 'px', color: color || F.COL.ink }, extra || {})); init(e, { opacity: 0, filter: 'blur(8px)' }); return e; };
  // Chip kinds: c yellow (routine / waiting), g green (allowed), a teal (the machine does it), m vermilion (stop and ask a person, irreversible), n neutral (not sorted yet)
  const KIND = () => ({ c: [F.COL.contS, '#fbf7ee'], g: [F.COL.relS, '#f1f7ef'], a: [F.COL.agent, F.COL.agentSoft], m: [F.COL.me, F.COL.meSoft], n: [F.COL.stroke, F.COL.body] });
  F.chip = (parent, s, x, y, kind = 'c', t, rot = 0) => {
    const c = div(parent, kind === 'g' ? 'chipg' : 'chipc', s, x, y);
    const k = KIND()[kind] || KIND().c;
    init(c, { opacity: 0, x: 0, y: -10, rotation: 0, scale: 0.9, transformOrigin: '50% 50%', borderColor: k[0], backgroundColor: k[1] });
    if (t != null) to(c, { opacity: 1, y: 0, rotation: rot, scale: 1 }, t, 0.32, 'back.out(1.6)');
    return c;
  };
  // Change a chip's kind (colour, not text): F.chipKind(c, 'a', t); move it with F.to(c, { x, y }, t, d) (x, y relative to where it landed)
  F.chipKind = (c, kind, t, d = 0.3) => { const k = KIND()[kind]; to(c, { borderColor: k[0], backgroundColor: k[1] }, t, d, 'power1.inOut'); };
  F.group = (parent) => F.div(parent, 'abs', '', 0, 0);
  F.standIn = F.standIn || {};
  F.standIn.labels = (spec, layer) => {
    const g = F.group(layer);
    for (const it of spec.list || []) {
      let e;
      if (it.type === 'how') e = F.how(g, it.text);
      else if (it.type === 'tag') e = F.tag(g, it.text, it.x, it.y);
      else if (it.type === 'chip') { e = F.chip(g, it.text, it.x, it.y, it.chip || 'c'); init(e, { opacity: 1, y: 0, rotation: it.rot || 0, scale: 1 }); continue; }
      else e = F.lbl(g, it.text, it.x, it.y, it.size || 28, F.COL[it.color] || it.color);
      init(e, { opacity: 1, filter: 'blur(0px)' });
    }
    return g;
  };
})();
