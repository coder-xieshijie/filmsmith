// Demo segment b (illustrative content): enlarge one layer, walk one request along the connectors, return to the overview.
// Detail geometry is in screen pixels; times come from ctx.T anchors. Stacking: the overview (bands · connectors and messages · nodes ·
// side box) is taken first, so the browser window this segment adds sits above it. Messages go into ov.msgs and connectors into
// ov.lines, under the nodes, so a message slides into a part and out of the next; every hop rests whole in the gap (hold).
defineSegment('demo-b', function build(ctx) {
  const T = ctx.T, L = ctx.layer, COL = F.COL, bp = F.bp, { init, to, hide } = F;
  const ov = ctx.take('ov');
  const srv = ov.rows.srv, [route, loop, hdl] = srv.cells, db = ov.side;

  // ---------- detail geometry (each node keeps its overview size; ~200 px gaps) ----------
  const DT = { band: [50, 240, 1500, 540], route: [90, 419, 382, 182], hdl: [1128, 419, 382, 182], db: [1189, 72, 260, 96], term: [575, 72, 450, 150] };
  const CY = 510;                                                  // centre line of the detail row
  const P = {                                                      // message paths, node centre or edge to the next
    term: 'M800 212 V385',
    hdl: `M925 ${CY} H1319`,
    query: `M1319 120 V${CY}`,
  };
  const LN = { term: 'M800 223 V383', route: `M673 ${CY} H475`, hdl: `M927 ${CY} H1125`, db: 'M1319 416 V171' };
  const UNDER = [DT.term, loop.circle, DT.route, DT.hdl, DT.db];   // messages fade as they slide under these
  const WAIT = bp.fracAt(P.query, ([, y]) => y >= 330);           // the query waits between the handler and the frame while it is written

  // ---------- zoom in ----------
  const z = bp.zoom(ov, 'srv', { detail: DT.band, cells: { 0: DT.route, 2: DT.hdl }, side: DT.db, loopSub: 124 });
  const tZ = T.zoom, DZ = z.dur;
  z.in(tZ, { focus: T.b1 - 0.4 });
  ctx.hit('whoosh', tZ + 0.2, 0.35);
  F.chapterHide(tZ); F.chapter('服务端 · 放大', tZ + DZ - 0.15); F.chapterShow(tZ + DZ - 0.1);
  const tL = tZ + DZ + 0.05, lc = { arrows: 'both', col: COL.tealS };
  const lnRoute = bp.line(ov.lines, LN.route, lc), lnHdl = bp.line(ov.lines, LN.hdl, lc), lnDb = bp.line(ov.lines, LN.db, lc);
  bp.lineIn(lnRoute, tL, 0.35); bp.lineIn(lnHdl, tL + 0.08, 0.35); bp.lineIn(lnDb, tL + 0.16, 0.35);
  bp.pulse(route, Math.max(T.route, tL)); bp.pulse(loop, T.evl); bp.pulse(hdl, T.hdl);

  // ---------- the browser window ----------
  const term = F.term(L, { title: '浏览器', x: DT.term[0], y: DT.term[1], w: DT.term[2], h: DT.term[3] });
  init(term, { opacity: 0, y: -10 }); to(term, { opacity: 1, y: 0 }, T.hdl + 0.45, 0.35, 'power3.out');
  const lnTerm = bp.line(ov.lines, LN.term, { arrows: 'end', col: COL.tealS });
  bp.lineIn(lnTerm, T.hdl + 0.75, 0.3);
  F.termType(term, '› ', 'GET /orders', T.hdl + 0.85, 0.05, { x: 24, y: 44, size: 34, caret: T.b2 - 0.05 });
  const st = bp.status(term, 28, 96, [['', 'mute'], ['等待响应…', 'mute'], ['✓ 3 行订单', 'ok']], { size: TOKENS.fs.body });

  // ---------- one request, walked slowly: 0.6–1 s per hop, each resting in its gap (a repeated round could take about 0.5 s, hold 0.2) ----------
  const m = ov.msgs, H = 0.25;
  bp.trip(m, 'GET /orders', 'msg', P.term, T.b2 - 0.05, T.evl2 + 0.25, { under: UNDER, hold: H });
  st.go(1, T.b2 + 0.1);
  const tO = T.evl2 + 0.27;
  bp.orbit(loop, tO, 0.6); ctx.hit('tick', tO + 0.6, 0.3);
  bp.trip(m, 'GET /orders', 'msg', P.hdl, tO + 0.65, tO + 1.45, { under: UNDER, hold: 0.3 });
  bp.pulse(hdl, tO + 1.47);
  const q = 'SELECT 订单', nq = [...q].length;
  bp.emit(m, q, P.query, { at: T.write, wait: WAIT, out: 0.35, type: (i) => T.write + 0.05 + i * (T.query - 0.1 - T.write) / nq, go: T.send, arrive: T.db + 0.3, under: UNDER });
  bp.pulse(db, T.db + 0.32);
  bp.trip(m, '3 行订单', 'res', P.query, T.found, T.found + 0.65, { a: 0, b: 1, under: UNDER, hold: H });
  bp.trip(m, '3 行订单', 'res', P.hdl, T.found + 0.7, T.found + 1.3, { a: 1, b: 0, under: UNDER, hold: H });
  const tR = Math.max(T.back3, T.found + 1.35);
  bp.trip(m, '3 行订单', 'res', P.term, tR, tR + 0.65, { a: 1, b: 0, under: UNDER, hold: H });
  const tDone = Math.max(T.browser, tR + 0.68);
  st.go(2, tDone); ctx.hit('tick', tDone + 0.1, 0.3);

  // ---------- back to the overview: z.out ends at tB + 1.3, well before ctx.t1 ----------
  const tB = T.back - 0.3, tX = tB - 0.1;
  hide(term, tX, 0.35);
  for (const l of [lnTerm, lnRoute, lnHdl, lnDb]) bp.lineOut(l, tX, 0.3);
  z.out(tB);
  ctx.hit('whoosh', tB + 0.1, 0.3);
  F.chapterHide(tB); F.chapter('一次网页请求', tB + DZ - 0.15); F.chapterShow(tB + DZ - 0.1);
  bp.done(ov, 'srv', T.done); ctx.hit('tick', T.done, 0.4);
});
