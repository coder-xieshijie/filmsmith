// Hand marks: vermilion 4.5 px smooth strokes drawn in one go (DrawSVG), no jitter, no boil. At most 4 in a film, only where the viewer must look.
// Each carries data-hand (geo-check counts them); name says what the mark is. Every other emphasis uses clean lines and colour.
// Use (t is when drawing starts; returns the wrapping svg, retire it with F.hide(svg, t)):
//   F.hand.brace(ctx.layer, { x: 432, y0: 227, y1: 843, side: 'left' }, t, '大括号')   a vertical brace; horizontal: { y, x0, x1, side: 'top'|'bottom' }
//     side is where the middle tip points (towards the label); the two ends curl the other way, towards what it groups. Under a row of
//     cells with the label below: { y: row bottom + 24, x0, x1, side: 'bottom' }; right of a column with the label on the right: side 'right'
//   F.hand.underline(ctx.layer, x0, x1, y, t, '下划线')            a gently curved underline (0.5 s)
//   F.hand.circle(ctx.layer, cx, cy, rx, ry, t, '圈')              a smooth ellipse, drawn in one stroke (0.45 s); around text, rx ≥ half the text width + 20 or geo reports text_on_stroke
//   F.hand.underChars(win, chars[12], chars[20], t, '下划线')      under characters a typed line (F.termType / F.promptCard) from char a to char b, using positions measured before typing (right even after the window scales)
//   Inside a window pass the window as parent, window coordinates and { local: [w, h] }: F.hand.underline(win, …, { local: [IW, IH] })
(function () {
  const { init, draw, svgEl, COL, ellPath } = F;
  const host = (parent, name, local) => svgEl('svg', local
    ? { 'data-hand': name || '', viewBox: `0 0 ${local[0]} ${local[1]}`, style: `position:absolute;left:0;top:0;width:${local[0]}px;height:${local[1]}px;overflow:visible` }
    : { class: 'full', viewBox: `0 0 ${TOKENS.zone.W} ${TOKENS.zone.H}`, 'data-hand': name || '' }, parent);
  const stroke = (svg, d) => svgEl('path', { d, fill: 'none', stroke: COL.me, 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  const braceV = (x, y0, y1, s) => { const m = (y0 + y1) / 2, X = (v) => x + s * v; return `M${X(20)},${y0} C${X(4)},${y0} ${X(0)},${y0 + 10} ${X(0)},${y0 + 30} L${X(-1)},${m - 27} C${X(-2)},${m - 9} ${X(-7)},${m - 3} ${X(-22)},${m} C${X(-7)},${m + 3} ${X(-2)},${m + 9} ${X(-1)},${m + 27} L${X(0)},${y1 - 30} C${X(0)},${y1 - 10} ${X(4)},${y1} ${X(20)},${y1}`; };
  const braceH = (y, x0, x1, s) => { const m = (x0 + x1) / 2, Y = (v) => y + s * v; return `M${x0},${Y(20)} C${x0},${Y(4)} ${x0 + 10},${Y(0)} ${x0 + 30},${Y(0)} L${m - 27},${Y(-1)} C${m - 9},${Y(-2)} ${m - 3},${Y(-7)} ${m},${Y(-22)} C${m + 3},${Y(-7)} ${m + 9},${Y(-2)} ${m + 27},${Y(-1)} L${x1 - 30},${Y(0)} C${x1 - 10},${Y(0)} ${x1},${Y(4)} ${x1},${Y(20)}`; };
  F.hand = {
    brace(parent, o, t, name, opt = {}) {
      const svg = host(parent, name, opt.local);
      const side = o.side || 'left';
      const d = side === 'left' || side === 'right' ? braceV(o.x, o.y0, o.y1, side === 'left' ? 1 : -1) : braceH(o.y, o.x0, o.x1, side === 'top' ? 1 : -1);
      const p = stroke(svg, d); init(p, { drawSVG: '50% 50%' }); F.to(p, { drawSVG: '0% 100%' }, t, opt.d || 0.55, 'power2.out');
      svg.path = p; return svg;
    },
    underline(parent, x0, x1, y, t, name, opt = {}) {
      const svg = host(parent, name, opt.local);
      const p = stroke(svg, `M${x0 - 4},${y + 3} C${x0 + (x1 - x0) * 0.3},${y - 3} ${x0 + (x1 - x0) * 0.65},${y + 7} ${x1 - 4},${y}`);
      init(p, { drawSVG: '0%' }); draw(p, t, opt.d || 0.5, 'power2.inOut', '0%', '100%');
      svg.path = p; return svg;
    },
    underChars(win, a, b, t, name, opt = {}) {
      if (!a._r || !b._r) throw new Error('underChars needs characters typed by F.termType / F.promptCard (their positions are measured before typing)');
      const x0 = a._r.x0, x1 = b._r.x1, y = a._r.y1 + 4;
      return F.hand.underline(win, x0, x1, y, t, name, Object.assign({ local: [win.clientWidth, win.clientHeight] }, opt));
    },
    circle(parent, cx, cy, rx, ry, t, name, opt = {}) {
      const svg = host(parent, name, opt.local);
      const p = stroke(svg, ellPath(cx, cy, rx, ry));
      init(p, { drawSVG: '0%' }); draw(p, t, opt.d || 0.45, 'power2.inOut', '0%', '100%');
      svg.path = p; return svg;
    },
  };
})();
