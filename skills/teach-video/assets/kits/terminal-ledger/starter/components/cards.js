// Cards and a six-card board.
// Card: white body, radius 10, a circled number on the left (一…六 / ✓), two lines of 26 px WenKai on the right. tone: 'off' faint frame and text
// (unlit) / 'on' ink frame and text / 'focus' heavier ink frame with a shadow (the card being discussed).
// Use (canvas coordinates; elements start invisible unless visible: true):
//   const c = F.card(ctx.layer, { x, y, w: 360, h: 112, num: '二', lines: ['第一行，', '第二行'], tone: 'on', visible: false })
//     returns the card element c: c.show(t) / c.tone('focus', t) / c.setLines(['…', '…'], t) (old text blurs out, new text lands); c._box = [x, y, w, h];
//     c.num the circled number, c.tx the text block; move or reshape with F.boxTo / F.morphCard
//   const B = F.board(ctx.layer, { cards: [['一', ['…', '…']], … six], groups: ['组名一', '组名二', '组名三'], visible: false, lit: false })
//     three shaded groups × two cards (right edge x 1500, bottom y 472; the presenter reserve and y ≥ 540 stay free)
//     B.cards[0..5] (F.card), B.blocks[0..2] (shaded groups with their names); B.CARDS[i] / B.BLOCKS[g] are their boxes
//     B.showAll(t, gap)     the six cards appear one by one (faint, unlit); B.light(i, t) lights card i; B.block(g, t) shows group g's shading and name
//     B.links(t, { gap: 0.5, d: 0.6 }) three dashed links drawn one after another (cards 3, 4 and 5 back to card 2); returns 3 × { path, head, mask }
//       (the dashes stay still and a mask reveals them, so a dashed line stays dashed while it draws); B.linkTo(k, 'me', t) recolours link k ('stroke' back to grey)
//     B.el is the wrapper (push or pull the whole board: F.to(B.el, { x, y, scale }, t, d, 'power2.inOut'), origin top-left)
// Stand-ins: kind "card" { box, num, lines, tone }; kind "board" { cards, groups, lit: true, blocks: true, links: true };
//   kind "quote" { box, title, lines, size }: a light terminal window with one or two lines already typed (a quotation window).
(function () {
  const { init, to, div, COL } = F;
  let UID = 0;
  const TONE = () => ({
    off: { borderColor: COL.faint, color: COL.mute, borderWidth: 2.5, boxShadow: '0px 0px 0 rgba(43,40,36,0)' },
    on: { borderColor: COL.ink, color: COL.ink, borderWidth: 2.5, boxShadow: '0px 0px 0 rgba(43,40,36,0)' },
    focus: { borderColor: COL.ink, color: COL.ink, borderWidth: 3.5, boxShadow: '6px 7px 0 rgba(43,40,36,0.14)' },
  });
  F.card = (parent, o) => {
    const w = o.w || 360, h = o.h || 112;
    const c = div(parent, 'abs', '', o.x, o.y, { width: w + 'px', height: h + 'px', boxSizing: 'border-box', borderStyle: 'solid', borderRadius: '10px', background: COL.body });
    c._box = [o.x, o.y, w, h];
    const n = o.num != null ? div(c, 'abs', o.num, 18, (h - 48) / 2 - 2.5, { width: '48px', height: '48px', borderRadius: '50%', border: '2.5px solid currentColor', boxSizing: 'border-box', textAlign: 'center', lineHeight: '43px', fontSize: TOKENS.fs.note + 'px' }) : null;
    let tx;
    const mkTx = () => div(c, 'abs', '', o.num != null ? 82 : 22, 0, { height: (h - 5) + 'px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: TOKENS.fs.note + 'px', lineHeight: '36px', whiteSpace: 'nowrap' });
    const put = (lines, into) => { (lines || []).forEach((s) => div(into || tx, '', s)); };
    tx = mkTx(); put(o.lines);
    const T = TONE()[o.tone || 'on'];
    init(c, Object.assign({ opacity: o.visible ? 1 : 0, scale: o.visible ? 1 : 0.9, transformOrigin: '50% 50%' }, T));
    init(tx, { opacity: 1, filter: 'blur(0px)' });
    c.num = n; c.tx = tx;
    c.show = (t, d = 0.18) => to(c, { opacity: 1, scale: 1 }, t, d, 'back.out(1.6)');
    c.tone = (k, t, d = 0.3) => to(c, TONE()[k], t, d, 'power1.inOut');
    c.setLines = (lines, t) => {   // old text blurs out, new text lands (the new text is its own layer, so any seek gives the same frame)
      const old = c.tx, nx = mkTx(); put(lines, nx); init(nx, { opacity: 0, filter: 'blur(6px)' });
      to(old, { opacity: 0, filter: 'blur(6px)' }, t, 0.12, 'power2.in');
      to(nx, { opacity: 1, filter: 'blur(0px)' }, t + 0.1, 0.2, 'power2.out');
      c.tx = nx;
    };
    return c;
  };

  // Board layout: three shaded groups × two cards
  const BLOCKS = [[120, 150, 420, 322], [600, 150, 420, 322], [1080, 150, 420, 322]];
  const CARDS = [[150, 206, 360, 112], [150, 336, 360, 112], [630, 206, 360, 112], [630, 336, 360, 112], [1110, 206, 360, 112], [1110, 336, 360, 112]];
  // The three dashed links all point back to card 2: 3 → 2 and 4 → 2 run through the gap between the first two groups; 5 → 2 comes round under the groups and enters 2 from below
  const LINKS = [
    [[630, 262], [572, 262], [572, 376], [512, 376]],
    [[630, 404], [512, 404]],
    [[1110, 262], [1052, 262], [1052, 504], [330, 504], [330, 450]],
  ];
  F.BOARD = { CARDS, BLOCKS, LINKS };
  F.board = (parent, o = {}) => {
    const items = o.cards || [], names = o.groups || [];
    if (items.length !== 6 || names.length !== 3) throw new Error('F.board needs cards: six [num, [line, line]] and groups: three names');
    const g = div(parent, 'abs', '', 0, 0, { width: TOKENS.zone.W + 'px', height: TOKENS.zone.H + 'px' });
    init(g, { x: 0, y: 0, scale: 1, transformOrigin: '0 0' });
    const P = { el: g, cards: [], blocks: [], CARDS, BLOCKS, arrows: [] };
    BLOCKS.forEach((b, i) => {
      const bl = div(g, 'abs', '', b[0], b[1], { width: b[2] + 'px', height: b[3] + 'px', borderRadius: '14px', background: COL.grey });
      const nm = div(bl, 'abs', names[i], 20, 10, { fontSize: TOKENS.fs.note + 'px', color: COL.mute, lineHeight: '34px', whiteSpace: 'nowrap' });
      init(bl, { opacity: o.blocks || o.visible && o.lit ? 1 : 0 });
      bl.nm = nm; P.blocks.push(bl);
    });
    CARDS.forEach((b, i) => P.cards.push(F.card(g, { x: b[0], y: b[1], w: b[2], h: b[3], num: items[i][0], lines: items[i][1], tone: o.lit ? 'on' : 'off', visible: !!o.visible })));
    P.showAll = (t, gap = 0.08) => P.cards.forEach((c, i) => c.show(t + i * gap));
    P.light = (i, t) => P.cards[i].tone('on', t);
    P.block = (k, t) => to(P.blocks[k], { opacity: 1 }, t, 0.35, 'power1.out');
    // A dashed line cannot be drawn with DrawSVG (it rewrites stroke-dasharray and the dashes turn solid): the dashed path stays still and a white mask path of the same shape draws in to reveal it
    P.links = (t, p = {}) => {
      const gap = p.gap ?? 0.5, d = p.d ?? 0.6;
      LINKS.forEach((pts, k) => {
        const id = 'blink' + (++UID), dStr = 'M' + pts.map((q) => q.join(',')).join(' L');
        const svg = F.fullSvg(g), defs = F.svgEl('defs', {}, svg);
        const mask = F.svgEl('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: TOKENS.zone.W, height: TOKENS.zone.H }, defs);
        const mp = F.svgEl('path', { d: dStr, fill: 'none', stroke: '#fff', 'stroke-width': 14, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mask);
        const path = F.svgEl('path', { d: dStr, fill: 'none', stroke: COL.stroke, 'stroke-width': 2.5, 'stroke-dasharray': '8 7', 'stroke-linecap': 'round', mask: `url(#${id})` }, svg);
        init(path, { opacity: 0, attr: { stroke: COL.stroke } }); F.set(path, { opacity: 1 }, t + k * gap);   // hidden until it starts: geo-check counts a masked path as visible
        init(mp, { drawSVG: '0% 0%' }); F.draw(mp, t + k * gap, d, 'power2.inOut');
        const [a, b] = [pts[pts.length - 1], pts[pts.length - 2]], ang = Math.atan2(a[1] - b[1], a[0] - b[0]), L = 14, sp = 0.5;
        const p1 = [a[0] - L * Math.cos(ang - sp), a[1] - L * Math.sin(ang - sp)], p2 = [a[0] - L * Math.cos(ang + sp), a[1] - L * Math.sin(ang + sp)];
        const head = F.svgEl('path', { d: `M${p1} L${a} L${p2}`, fill: 'none', stroke: COL.stroke, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
        init(head, { opacity: 0, attr: { stroke: COL.stroke } }); to(head, { opacity: 1 }, t + k * gap + d - 0.05, 0.06, 'none');
        P.arrows.push({ svg, path, head, mask: mp });
      });
      return P.arrows;
    };
    P.linkTo = (k, c, t) => { const a = P.arrows[k], col = COL[c] || c; to(a.path, { attr: { stroke: col } }, t, 0.3, 'power1.inOut'); to(a.head, { attr: { stroke: col } }, t, 0.3, 'power1.inOut'); };
    if (o.links) P.links(0, { gap: 0, d: 0.001 });
    return P;
  };

  F.quoteWin = (parent, o) => {
    const [x, y, w, h] = o.box;
    const win = F.term(parent, { title: o.title, x, y, w, h });
    const size = o.size || TOKENS.fs.note;
    (o.lines || []).forEach((s, i) => div(win, 'abs', (i === 0 ? '› ' : '  ') + s, 22, 52 + i * (size + 12), { fontSize: size + 'px', lineHeight: (size + 8) + 'px', whiteSpace: 'pre', color: COL.ink }));
    return win;
  };

  F.standIn = F.standIn || {};
  F.standIn.card = (spec, layer) => { const [x, y, w, h] = spec.box; return F.card(layer, { x, y, w, h, num: spec.num, lines: spec.lines, tone: spec.tone || 'on', visible: true }); };
  F.standIn.board = (spec, layer) => F.board(layer, { cards: spec.cards, groups: spec.groups, visible: true, lit: spec.lit !== false, blocks: spec.blocks !== false, links: !!spec.links });
  F.standIn.quote = (spec, layer) => F.quoteWin(layer, spec);
})();
