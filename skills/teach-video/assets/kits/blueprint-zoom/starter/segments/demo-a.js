// Demo segment a (illustrative content): the overview loads. The layer the film will enlarge is on screen at frame 0, the outside box
// joins it, then the other layers draw in from the bottom up. The overview is built from this segment's contract (handoff.json
// last.items.ov), so the next segment's stand-in is the same picture.
defineSegment('demo-a', function build(ctx) {
  const T = ctx.T, bp = F.bp;
  const ov = bp.overview(ctx.layer, Object.assign({}, ctx.out.items.ov, { visible: ['srv'] }));
  F.chapter('一次网页请求', 0.4);
  bp.sideIn(ov, T.a1 + 0.1);
  const order = [['sys', T.pass - 0.35], ['net', T.pass + 0.1], ['web', T.pass + 0.55]];
  for (const [k, t] of order) bp.rowIn(ov, k, t);
  ctx.give('ov', ov);
});
