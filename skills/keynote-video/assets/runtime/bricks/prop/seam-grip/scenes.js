// scenes.js — the six split scenes on one seam: their timelines (the template's choreo.js plan1, seconds from the
// scene's start) and the shared scene body the scene bricks request-open, pick-list, file-pair, render-branch,
// diff-climax and seam-lockup are made of. A scene continues from the one before: `from` is that scene's params with
// its `type` (and optionally its `beats`), so a pick knows the result it opens on, a wipe line crosses from the last
// state of the scene before, and the branch rises from the file's seam. Without `from` a scene opens on its own
// first state.
import {
  W, H, CAP, TEXT_IN, TEXT_OUT, SETTLE, CPS, PLUS_CPS, MARGIN, L, YC, paneOf, fonts, text, width, chw, rail, typed, caret,
  assetOf, keyOf, placeOf, drawAsset, painter, chip, gripV, gripH, seamColors, moveOf, MOVES, clamp, lerp, cubicInOut, expOut,
  clipRect, seamV, seamH, readTime,
} from './split.js';

const phrases = (c) => (Array.isArray(c) ? c : c ? [c] : []);
const ceilB = (t, B) => Math.ceil(t / B - 1e-9) * B;
const progress = (t, a, d) => clamp((t - a) / d);
// reading: when every read text is done (primary at its own time; the template's reading() with lang.js times)
const readDone = (reads, lang) => reads.filter((r) => r.text).reduce((m, r) => Math.max(m, r.at + readTime(r.text, lang)), 0);

// the asset showing at the end of a scene (what the next one continues from)
export const lastResult = (s) => {
  if (!s) return null;
  if (s.type === 'request' || s.type === 'lockup') return s.result;
  if (s.type === 'pick') return s.picks?.at(-1)?.result;
  if (s.type === 'file') return s.pairs?.at(-1)?.result;
  if (s.type === 'render') return s.results?.at(-1);
  if (s.type === 'diff') return s.after;
  return null;
};

// ── timelines (seconds from the scene's start) ─────────────────────────────────────────────────────────────────────
export const timeline = (type, s, ctx, dur = null) => {
  const B = 60 / ctx.bpm, lang = ctx.lang, T = { type, B, reads: [], results: [], cues: [] };
  const read = (text, at, extra = {}) => T.reads.push({ text, at, ...extra });
  const prevKey = keyOf(lastResult(s.from));
  if (type === 'request') {
    const typeEnd = 0.25 * B + s.prompt.length / CPS;
    T.typeEnd = typeEnd; read(s.prompt, typeEnd);
    const land = Math.max(2 * B, ceilB(typeEnd + 0.75 * B, B));
    T.open = [land - 0.75 * B, land + B]; T.land = land;
    T.results.push({ at: T.open[0], asset: 0, move: { role: 'open', dur: T.open[1] - T.open[0] } });
    T.phrases = phrases(s.claim).map((p, k) => land + (1 + k) * B);
    phrases(s.claim).forEach((p, k) => read(p, T.phrases[k]));
    T.promptOut = (T.phrases.at(-1) ?? land) + 1.5 * B;
    T.cues.push({ t: 0.25 * B, kind: 'type' }, { t: T.open[0], kind: 'device', device: 'split-open' }, { t: land, kind: 'hook' });
    T.need = Math.max(readDone(T.reads, lang), T.promptOut + TEXT_OUT) + SETTLE;
    T.settled = land + B;
  }
  if (type === 'pick') {
    T.claimAt = 0.25 * B; read(s.claim, T.claimAt);
    T.listAt = 0.5 * B;
    T.hops = s.picks.map((p, k) => (k === 0 ? B : k === 1 ? 2 * B : (5 + 2 * (k - 2)) * B));
    if (prevKey && prevKey !== keyOf(s.picks[0].result)) T.results.push({ at: 0, asset: 0, move: { role: 'push', dur: MOVES.push.beats * B } });
    else T.results.push({ at: 0, asset: 0 });
    let last = T.listAt + TEXT_IN + 0.04 * s.list.length;
    s.picks.forEach((p, k) => {
      T.cues.push({ t: T.hops[k], kind: 'pull' });
      if (k === 0) return;
      const role = k === 1 ? 'change' : 'push', d = MOVES[role].beats * B;
      T.results.push({ at: T.hops[k], asset: k, move: { role, dur: d } });
      T.cues.push({ t: T.hops[k], kind: 'device', device: k === 1 ? 'louvre' : 'seam-push' }, { t: T.hops[k] + d, kind: 'land' });
      last = Math.max(last, T.hops[k] + d);
    });
    T.lastLand = last;
    T.need = Math.max(readDone(T.reads, lang), T.lastLand + 1.25 * B);
    T.settled = T.hops[1] + MOVES.change.beats * B;
  }
  if (type === 'file') {
    if (s.from) { T.wipe = [0, MOVES.wipe.beats * B]; T.cues.push({ t: 0, kind: 'device', device: 'wipe-line' }, { t: T.wipe[1], kind: 'land' }); }
    T.claimAt = 1.5 * B; read(s.claim, T.claimAt);
    T.pairs = s.pairs.map((p, k) => (2 + k) * B);
    s.pairs.forEach((p, k) => {
      read(p.token, T.pairs[k]);
      T.results.push({ at: k === 0 ? 0 : T.pairs[k], asset: k });
      T.cues.push({ t: T.pairs[k], kind: k === 0 ? 'land' : 'accent' });
    });
    T.lastLand = T.pairs.at(-1) + 0.2;
    T.need = Math.max(readDone(T.reads, lang) + SETTLE, T.lastLand + 1.5 * B);
    T.settled = T.wipe ? T.wipe[1] : 2 * B;
  }
  if (type === 'render') {
    T.branch = [0, MOVES.branch.beats * B];
    T.cmdAt = 0.75 * B; T.cmdEnd = T.cmdAt + s.command.length / CPS; read(s.command, T.cmdEnd);
    T.cuts = s.results.map((_, k) => (2 + k) * B);
    s.results.forEach((r, k) => { T.results.push({ at: T.cuts[k], asset: k }); if (k > 0) T.cues.push({ t: T.cuts[k], kind: 'accent' }); });
    T.labelAt = T.branch[1] - 0.5 * B;
    const [p1, p2] = phrases(s.claim);
    T.p1 = 2.5 * B; read(p1, T.p1);
    T.lines = s.report.lines.map((_, k) => 3 * B + 0.5 * k * B);
    s.report.lines.forEach((ln, k) => { T.reads.push({ text: ln.join(' '), tier: 'glance', at: T.lines[k] + TEXT_IN }); T.cues.push({ t: T.lines[k], kind: 'tick' }); });
    T.resultAt = Math.max(T.lines.at(-1) + B, T.cuts.at(-1) + 0.5 * B);
    read(s.report.result, T.resultAt);
    if (p2) { T.p2 = s.p2Beat != null ? s.p2Beat * B : T.resultAt + 0.5 * B; read(p2, T.p2); }
    T.lastLand = Math.max(T.resultAt, T.p2 ?? 0) + TEXT_IN;
    T.cues.push({ t: 0, kind: 'device', device: 'split-branch' }, { t: T.branch[1], kind: 'land' }, { t: T.cmdAt, kind: 'type' });
    T.need = Math.max(readDone(T.reads, lang) + SETTLE, T.lastLand + B);
    T.settled = T.branch[1];
  }
  if (type === 'diff') {
    // the slider lands on the first bar line at least 7.5 beats in (`bar`: the beat of the bar the scene starts on);
    // the + line types into whatever that leaves (constant speed, 12–42 characters a second)
    const bar = 4 * B, start = (s.bar ?? 0) * B, land = Math.ceil((start + 7.5 * B) / bar - 1e-6) * bar - start;
    T.slide = [land - MOVES.slide.beats * B, land];
    T.chipsAt = land - 4 * B; T.p1 = land - 6 * B; T.plusAt = 0.5 * B;
    const n = s.line.after.length;
    T.plusEnd = Math.max(T.plusAt + n / PLUS_CPS, Math.min(T.plusAt + n / 12, T.p1 - 0.5 * B));
    T.plusCps = n / (T.plusEnd - T.plusAt);
    read(s.line.after, T.plusEnd);
    const [p1, p2] = phrases(s.claim);
    read(p1, T.p1);
    T.results.push({ at: 0, asset: 0 });
    T.p2 = T.slide[1]; read(p2 ?? '', T.p2, { claim: true });
    T.pauseFrom = T.p2 + TEXT_IN + 0.1;
    T.cues.push({ t: T.plusAt, kind: 'type' }, { t: T.slide[0], kind: 'device', device: 'diff-slider' }, { t: T.slide[1], kind: 'claim' });
    T.need = Math.max(readDone(T.reads, lang), T.p2 + TEXT_IN) + 2 * B;
    T.settled = T.slide[1]; T.peakAt = T.slide[1]; T.pause = [T.pauseFrom, null];
  }
  if (type === 'lockup') {
    T.wipe = s.from ? [0, MOVES.wipe.beats * B] : [0, 0];
    T.results.push({ at: 0, asset: 0 });
    T.nameAt = T.wipe[1] + 1.5 * B; read(s.name, T.nameAt);
    T.cmdAt = T.nameAt + B; T.cmdEnd = T.cmdAt + s.command.length / CPS; read(s.command, T.cmdEnd);
    T.urlAt = ceilB(T.cmdEnd + 0.5 * B, B); read(s.url, T.urlAt);
    T.lineAt = s.line ? T.urlAt + B : null;
    if (s.line) T.reads.push({ text: s.line, tier: 'glance', at: T.lineAt + TEXT_IN });
    T.lastLand = (T.lineAt ?? T.urlAt) + TEXT_IN;
    T.need = Math.max(T.urlAt + 3, T.lastLand + 0.5 + 5 * B);
    if (s.from) T.cues.push({ t: 0, kind: 'device', device: 'wipe-line' });
    T.cues.push({ t: T.nameAt + 0.5 * B, kind: 'lockup' }, { t: T.cmdAt, kind: 'type' });
    T.settled = T.nameAt + 0.5 * B;
  }
  T.beats = Math.max(s.beats || 0, Math.ceil(T.need / B - 1e-6));
  const D = dur ?? T.beats * B;
  if (type === 'lockup') {
    T.close = [D - 5 * B, D - 4 * B];
    T.blinks = [0, 1, 2, 3].map((k) => T.close[1] + k * B).filter((t) => t < D);
    T.cues.push({ t: T.close[0], kind: 'device', device: 'seam-close' }, { t: T.close[1], kind: 'land' });
  }
  return T;
};

// ── the scene's state: assets resolved, moves built ───────────────────────────────────────────────────────────────
const assetsOf = async (type, s) => {
  if (type === 'request' || type === 'lockup') return [await assetOf(s.result, type === 'lockup' ? 5 : 0)];
  if (type === 'pick') return Promise.all(s.picks.map((p, k) => assetOf(p.result, 1 + k)));
  if (type === 'file') return Promise.all(s.pairs.map((p, k) => assetOf(p.result, 2 + k)));
  if (type === 'render') return Promise.all(s.results.map((r, k) => assetOf(r, 3 + k)));
  if (type === 'diff') return [await assetOf(s.before, 4), await assetOf(s.after, 5)];
  return [];
};
const build = async (type, s, ctx, Cl, start, end) => {
  const T = timeline(type, s, ctx, end - start), F = fonts(ctx.lang), C = seamColors(Cl, s.stitch);
  const SC = { type, s, T, F, C, A: await assetsOf(type, s), start, end, lang: ctx.lang, MV: {} };
  SC.prevA = s.from ? await assetOf(lastResult(s.from), 9) : null;
  SC.pane = paneOf(type, s);
  return SC;
};
const resultAsset = (sc, k) => (k < 0 ? sc.prevA : sc.A[sc.T.results[k].asset]);
const resultIndex = (sc, t) => { let k = -1; sc.T.results.forEach((r, j) => { if (t >= sc.start + r.at) k = j; }); return k; };

// the chip of the result showing at t, swapping (0.24 s) when the result changes
const chipFor = (g, sc, t, x, y, align = 'left') => {
  const R = sc.T.results, k = resultIndex(sc, t), A = resultAsset(sc, k);
  if (!A) return;
  const t0 = k < 0 ? sc.start : sc.start + R[k].at + (R[k].move ? R[k].move.dur / 2 : 0);
  if (t < t0 && k >= 0) { const P = resultAsset(sc, k - 1); if (P) chip(g, sc.F, sc.C, P.chip, x, y, align); return; }
  chip(g, sc.F, sc.C, A.chip, x, y, align, (1 - expOut(clamp((t - t0) / 0.24))) * 40);
};
// the result pane of a scene with a vertical seam (request, pick) at time t
const resultPane = (g, sc, t) => {
  const R = sc.T.results, k = resultIndex(sc, t);
  if (k < 0) { if (sc.prevA) painter(sc.prevA, sc.pane, sc.C)(g); return; }
  const r = R[k], m = sc.MV[k];
  if (r.move && m && r.move.role !== 'open' && t < sc.start + r.at + r.move.dur) { m.draw(g, progress(t, sc.start + r.at, r.move.dur)); return; }
  painter(resultAsset(sc, k), sc.pane, sc.C)(g);
};

// ── the input side, per type ───────────────────────────────────────────────────────────────────────────────────────
const inputOf = {
  request(g, sc, t, out) {
    const { s, T, F, C } = sc, t0 = sc.start, B = T.B;
    rail(g, s.label, MARGIN, L.label, F.label, C.dim, -Infinity, out, t);
    phrases(s.claim).forEach((p, k) => rail(g, p, MARGIN, L.claimA[k], F.claim, C.ink, t0 + T.phrases[k], out, t));
    const pOut = Math.min(out ?? Infinity, t0 + T.promptOut);
    if (t < pOut + TEXT_OUT) {
      const leave = t > pOut ? Math.pow(clamp((t - pOut) / TEXT_OUT), 2) : 0, sz = F.req, y = L.prompt, h = sz.size * 1.3;
      clipRect(g, 0, y - sz.size * 1.02, L.X - 20, h, () => {
        text(g, '>', MARGIN, y - leave * h, sz, C.muted);
        text(g, typed(s.prompt, t, t0 + 0.25 * B, CPS), MARGIN + 2 * chw(g, sz), y - leave * h, sz, C.ink);
      });
    }
  },
  pick(g, sc, t, out) {
    const { s, T, F, C } = sc, t0 = sc.start, B = T.B;
    rail(g, s.label, MARGIN, L.label, F.label, C.dim, t0 + 0.25 * B, out, t);
    rail(g, s.claim, MARGIN, L.claimB, F.claim, C.ink, t0 + T.claimAt, out, t);
    let k = -1;
    T.hops.forEach((h, j) => { if (t >= t0 + h) k = j; });
    const cur = k >= 0 ? s.list.indexOf(s.picks[k].item) : -1;
    s.list.forEach((m, i) => rail(g, m, L.listX, L.listY + i * L.listStep, i === cur ? F.codeB : F.code, i === cur ? C.ink : C.muted, t0 + T.listAt + i * 0.04, out, t));
    if (k >= 0 && (out == null || t < out)) {
      const prev = k > 0 ? s.list.indexOf(s.picks[k - 1].item) : cur, u = cubicInOut(clamp((t - t0 - T.hops[k]) / 0.25));
      const y = L.listY + lerp(prev, cur, k > 0 ? u : 1) * L.listStep;
      g.save(); g.globalAlpha = k === 0 ? clamp((t - t0 - T.hops[0]) / 0.15) : 1;
      g.fillStyle = C.accent; g.fillRect(MARGIN, y - 26, 6, 34); g.restore();
    }
  },
  file(g, sc, t, out) {
    const { s, T, F, C } = sc, t0 = sc.start, ch = chw(g, F.code);
    rail(g, s.label, MARGIN, L.label, F.label, C.dim, -Infinity, out, t);
    rail(g, s.claim, MARGIN, L.claimC, F.claim, C.ink, t0 + T.claimAt, out, t);
    s.lines.forEach((ln, i) => {
      const y = L.inputY + i * L.inputStep;
      rail(g, String(s.from0 + i), MARGIN, y, F.code, C.dim, -Infinity, out, t);
      rail(g, ln, L.inputX, y, F.code, C.ink, -Infinity, out, t);
    });
    // the underline: the token the seam pairs with the frame under it (pair-hop)
    if (t >= t0 + T.pairs[0] && (out == null || t < out)) {
      let k = 0;
      T.pairs.forEach((p, j) => { if (t >= t0 + p) k = j; });
      const box = (j) => { const p = s.pairs[j], i = s.lines[p.line].indexOf(p.token); return { x: L.inputX + (i + 1) * ch, w: (p.token.length - 2) * ch, y: L.inputY + p.line * L.inputStep }; };
      const a = box(Math.max(0, k - 1)), b = box(k);
      const u = k === 0 ? 1 : cubicInOut(clamp((t - t0 - T.pairs[k]) / 0.2)), dr = k === 0 ? clamp((t - t0 - T.pairs[0]) / 0.15) : 1;
      g.fillStyle = C.accent; g.fillRect(lerp(a.x, b.x, u), lerp(a.y, b.y, u) + 9, lerp(a.w, b.w, u) * dr, 4);
    }
  },
  render(g, sc, t, out, bandY) {
    const { s, T, F, C } = sc, t0 = sc.start, B = T.B;
    rail(g, s.label, MARGIN, L.label, F.label, C.dim, t0 + 0.5 * B, out, t);
    if (t >= t0 + T.cmdAt && (out == null || t < out + TEXT_OUT)) {
      const str = typed(s.command, t, t0 + T.cmdAt, CPS);
      clipRect(g, 0, 0, W, bandY, () => text(g, str, MARGIN, L.cmdY, F.req, C.ink));
      if (t < t0 + T.cmdEnd + 0.25) caret(g, MARGIN + str.length * chw(g, F.req) + 2, L.cmdY, 44, C.accent);
    }
  },
  diff(g, sc, t, out) {
    const { s, T, F, C } = sc, t0 = sc.start, y0 = L.diffY, y1 = L.diffY + L.diffStep;
    rail(g, s.label, MARGIN, L.label, F.label, C.dim, -Infinity, out, t);
    text(g, String(s.line.n), L.diffNum, y0, F.code, C.dim); text(g, '-', L.diffSign, y0, F.code, C.muted); text(g, s.line.before, L.diffCode, y0, F.code, C.muted);
    if (t >= t0 + T.plusAt) {
      const u = clamp((t - t0 - T.plusAt) / 0.15);
      g.fillStyle = C.accent; g.fillRect(L.diffBar, y1 - 30 + (1 - u) * 20, 6, 40 * u);
      text(g, String(s.line.n), L.diffNum, y1, F.code, C.dim); text(g, '+', L.diffSign, y1, F.code, C.ink);
      text(g, typed(s.line.after, t, t0 + T.plusAt, T.plusCps), L.diffCode, y1, F.code, C.ink);
    }
    phrases(s.claim).forEach((p, k) => rail(g, p, L.claimEX, L.claimE[k], F.claim, C.ink, t0 + (k === 0 ? T.p1 : T.p2), out, t));
  },
};

// the report pane of a render scene: the bench, the report's label and lines (glance), the claim, the result line
const reportPane = (g, sc, t) => {
  const { s, T, F, C } = sc, t0 = sc.start, x = L.reportX;
  g.fillStyle = C.bench; g.fillRect(L.XD, 0, W - L.XD, H);
  rail(g, s.report.label, x, L.reportLabel, F.label, C.mutedOnBench, t0 + T.labelAt, null, t);
  const [p1, p2] = phrases(s.claim);
  rail(g, p1, x, L.claimD[0], F.claim, C.onBench, t0 + T.p1, null, t);
  if (p2) rail(g, p2, x, L.claimD[1], F.claim, C.onBench, t0 + T.p2, null, t);
  s.report.lines.forEach(([st, item, val], k) => {
    const y = L.reportY + k * L.reportStep, tin = t0 + T.lines[k];
    rail(g, st, x, y, F.label, C.onBench, tin, null, t);
    rail(g, item, x + 78, y, F.label, C.mutedOnBench, tin, null, t);
    rail(g, val, W - MARGIN, y, F.label, C.onBench, tin, null, t, 'right');
  });
  rail(g, s.report.result, x, L.resultY, F.labelB, C.onBench, t0 + T.resultAt, null, t);
};

// ── whole states ─────────────────────────────────────────────────────────────────────────────────────────────────
const stateOf = (g, sc, t, prev) => {
  const { s, T, C, type } = sc;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (type === 'request' || type === 'pick') {
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    if (type === 'pick' && prev && inputOf[prev.type]) inputOf[prev.type](g, prev, t, prev.end);
    inputOf[type](g, sc, t, null);
    if (type === 'request' && t < sc.start + T.open[0]) {          // the caret follows the typing
      caret(g, MARGIN + 2 * chw(g, sc.F.req) + typed(s.prompt, t, sc.start + 0.25 * T.B, CPS).length * chw(g, sc.F.req) + 2, L.prompt, 44, C.accent);
      return;
    }
    if (type === 'request' && t < sc.start + T.open[1]) sc.MV[0].draw(g, progress(t, sc.start + T.open[0], T.open[1] - T.open[0]));
    else { clipRect(g, L.X, 0, W - L.X, H, () => resultPane(g, sc, t)); seamV(g, L.X, 0, H, C); }
    if (type !== 'request' || t >= sc.start + T.land) gripV(g, C, L.X);
    if (type !== 'request' || t >= sc.start + T.land + 0.5 * T.B) chipFor(g, sc, t, L.X + 28, 50);
    return;
  }
  if (type === 'file') {
    const y = sc.pane.y;
    g.fillStyle = C.paper; g.fillRect(0, 0, W, y);
    const k = Math.max(0, resultIndex(sc, t));
    clipRect(g, 0, y, W, H - y, () => painter(resultAsset(sc, k), sc.pane, C)(g));
    inputOf.file(g, sc, t, null);
    seamH(g, y, 0, W, C); gripH(g, C, y);
    chipFor(g, sc, t, W - 120, y + 22, 'right');
    return;
  }
  if (type === 'render') {
    const pb = progress(t, sc.start + T.branch[0], T.branch[1] - T.branch[0]);
    sc.MV.branch.draw(g, pb);
    const y = lerp(sc.y0, L.YD, cubicInOut(clamp(pb / 0.5)));
    gripH(g, C, y);
    chipFor(g, sc, t, pb >= 1 ? L.XD - 28 : W - 120, y + 22, 'right');
    return;
  }
  if (type === 'diff') {
    g.fillStyle = C.paper; g.fillRect(0, 0, W, L.YD);
    inputOf.diff(g, sc, t, null);
    sc.MV.slide.draw(g, progress(t, sc.start + T.slide[0], T.slide[1] - T.slide[0]));
    seamH(g, L.YD, 0, W, C); gripH(g, C, L.YD);
    const x = lerp(L.XD, L.XE, cubicInOut(progress(t, sc.start + T.slide[0], T.slide[1] - T.slide[0]))), dy = (1 - expOut(clamp((t - sc.start - T.chipsAt) / 0.24))) * 40;
    if (t >= sc.start + T.chipsAt) { chip(g, sc.F, C, sc.A[0].chip, x - 28, L.YD + 22, 'right', dy); chip(g, sc.F, C, sc.A[1].chip, x + 28, L.YD + 22, 'left', dy); }
    return;
  }
  if (type === 'lockup') {
    const { F } = sc, x = lerp(L.XF, W + 16, cubicInOut(progress(t, sc.start + T.close[0], T.close[1] - T.close[0])));
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    rail(g, s.label, MARGIN, L.label, F.label, C.dim, -Infinity, null, t);
    rail(g, s.name, MARGIN, L.name, F.name, C.ink, sc.start + T.nameAt, null, t);
    if (t >= sc.start + T.cmdAt) text(g, typed(s.command, t, sc.start + T.cmdAt, CPS), MARGIN, L.install, F.code, C.ink);
    rail(g, s.url, MARGIN, L.url, F.code, C.muted, sc.start + T.urlAt, null, t);
    if (s.line) rail(g, s.line, MARGIN, L.line, F.label, C.dim, sc.start + T.lineAt, null, t);
    const n = typed(s.command, t, sc.start + T.cmdAt, CPS).length, cx = MARGIN + n * chw(g, F.code) + 3;
    const typing = t >= sc.start + T.cmdAt && t < sc.start + T.cmdEnd + 0.25, blink = (T.blinks ?? []).some((b) => t >= sc.start + b && t < sc.start + b + 0.25);
    if (typing || blink) caret(g, cx, L.install, 33, C.accent);
    if (x < W) {
      clipRect(g, x, 0, W - x, H, () => { painter(sc.A[0], sc.pane, C)(g, x - L.XF, 0); chip(g, F, C, sc.A[0].chip, L.XF + 28 + (x - L.XF), 50); });
      seamV(g, x, 0, H, C); gripV(g, C, x);
    }
  }
};

// ── moves (built once in prepare, drawn by p) ─────────────────────────────────────────────────────────────────────
const buildMoves = (sc, prev, now) => {
  const { s, T, C, type } = sc;
  T.results.forEach((r, k) => {
    if (!r.move) return;
    if (r.move.role === 'open') {
      sc.MV[k] = moveOf('open', {
        caret: { x: MARGIN + 2 * sc.chReq + s.prompt.length * sc.chReq + 4, y: L.prompt - 16, h: 52, w: 4 },
        seam: { x: L.X, y0: 0, y1: H }, pane: sc.pane, run: 0.75 / 1.75, to: { paint: painter(sc.A[r.asset], sc.pane, C) }, colors: C,
      });
    } else {
      const from = resultAsset(sc, k - 1);
      sc.MV[k] = moveOf(r.move.role, { pane: sc.pane, from: { paint: painter(from, sc.pane, C) }, to: { paint: painter(sc.A[r.asset], sc.pane, C) }, colors: C });
    }
  });
  if (T.wipe && T.wipe[1] > 0 && prev) sc.MV.wipe = moveOf('wipe', { dir: type === 'lockup' ? 'left' : 'down', from: { paint: (g) => stateOf(g, prev, Math.min(now.t, prev.end - 1e-3), null) }, to: { paint: (g) => stateOf(g, sc, now.t, prev) }, colors: C });
  if (type === 'render') {
    sc.y0 = prev && prev.type === 'file' ? prev.pane.y : YC(4);
    const panes = (g, S) => {
      const t = now.t;
      g.fillStyle = C.paper; g.fillRect(0, 0, W, S.y);
      if (prev && prev.type === 'file') inputOf.file(g, prev, t, prev.end);
      inputOf.render(g, sc, t, null, S.y);
      // the film below: its frame rides up with the seam, from its place in the file scene to its place here
      const k = resultIndex(sc, t), A = resultAsset(sc, k);
      if (A) {
        const p0 = placeOf(A, prev && prev.type === 'file' ? prev.pane : { x: 0, y: sc.y0, w: W, h: H - sc.y0 }), p1 = placeOf(A, sc.pane), u = (sc.y0 - S.y) / (sc.y0 - L.YD);
        clipRect(g, 0, S.y, W, H - S.y, () => { g.fillStyle = C.bench; g.fillRect(0, 0, W, H); drawAsset(g, A, { x: lerp(p0.x, p1.x, u), y: lerp(p0.y, p1.y, u), k: p1.k }); });
      } else clipRect(g, 0, S.y, W, H - S.y, () => { g.fillStyle = C.bench; g.fillRect(0, 0, W, H); });
      if (S.tip > S.y) clipRect(g, L.XD, S.y, W - L.XD, S.tip - S.y, () => reportPane(g, sc, t));
    };
    sc.MV.branch = moveOf('branch', { y0: sc.y0, y1: L.YD, x: L.XD, y2: H, panes, colors: C });
  }
  if (type === 'diff') sc.MV.slide = moveOf('slide', { pane: sc.pane, x0: L.XD, x1: L.XE, before: { paint: painter(sc.A[0], sc.pane, C) }, after: { paint: painter(sc.A[1], sc.pane, C) }, colors: C });
};

const MOTION = { request: 'split-open', pick: 'louvre', file: 'wipe-line', render: 'split-branch', diff: 'diff-slider', lockup: 'wipe-line' };
export const sceneBody = (type) => ({
  surface: ['canvas'],
  plan(s, ctx) {
    const T = timeline(type, s, ctx), B = T.B;
    const cues = T.cues.map((c) => ({ beat: Math.round((c.t / B) * 100) / 100, kind: c.kind === 'device' ? 'turn' : c.kind, ...(c.device ? { device: c.device } : {}) }))
      .filter((c) => c.beat <= T.beats);
    return {
      beats: T.beats, lead: 0,
      reads: T.reads.filter((r) => r.text).map((r) => ({ text: r.text, at: Math.round((r.at / B) * 100) / 100, ...(r.tier ? { tier: r.tier } : {}) })),
      cues, motion: MOTION[type],
      settled: Math.min(T.beats, Math.round((T.settled / B) * 100) / 100),
      ...(T.peakAt != null ? { peakAt: Math.round((T.peakAt / B) * 100) / 100 } : {}),
      ...(T.pause ? { pause: [Math.round((T.pause[0] / B) * 100) / 100, T.beats] } : {}),
    };
  },
  validate(s) {
    const e = [];
    if (type === 'request' && !(s.prompt && s.prompt.length <= 40)) e.push('prompt: 1–40 characters');
    if (type === 'pick') {
      if (!(s.list?.length >= 2 && s.list.length <= 10)) e.push('list: 2–10 items');
      if (!(s.picks?.length >= 2 && s.picks.length <= 4)) e.push('picks: 2–4 of { item, result }');
      else s.picks.forEach((p, k) => { if (!s.list?.includes(p.item)) e.push(`picks[${k}].item "${p.item}" is not in the list`); });
    }
    if (type === 'file') {
      if (!(s.lines?.length >= 2 && s.lines.length <= 6)) e.push('lines: 2–6 quoted lines');
      if (!(s.pairs?.length >= 1 && s.pairs.length <= 4)) e.push('pairs: 1–4 of { line, token, result }');
      else s.pairs.forEach((p, k) => { if (!s.lines?.[p.line]?.includes(p.token)) e.push(`pairs[${k}]: token ${p.token} is not on line ${p.line}`); });
    }
    if (type === 'render') {
      if (!(s.results?.length >= 2 && s.results.length <= 5)) e.push('results: 2–5 frames');
      if (!(s.report?.lines?.length >= 1 && s.report.lines.length <= 5 && s.report.result)) e.push('report: { label, lines: 1–5 of [status, item, value], result }');
    }
    if (type === 'diff') {
      if (!(s.line?.before && s.line?.after && Number.isInteger(s.line?.n))) e.push('line: { n, before, after }');
      if (phrases(s.claim).length !== 2) e.push('claim: two phrases (the second lands with the slider)');
    }
    if (type === 'lockup' && !(s.name && s.command && s.url)) e.push('name, command and url');
    return e;
  },
  async prepare(s, ctx) {
    const Cl = s.colors, B = 60 / ctx.bpm;
    const now = { t: 0 };
    let prev = null;
    if (s.from) {
      const fT = timeline(s.from.type, s.from, ctx), pd = fT.beats * B;
      prev = await build(s.from.type, { ...s.from, from: null, from0: s.from.from0 ?? s.from.source?.from ?? 1 }, ctx, Cl, -pd, 0);
    }
    const sc = await build(type, { ...s, from0: s.source?.from ?? 1 }, ctx, Cl, 0, timeline(type, s, ctx).beats * B);
    const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(8, 8) : document.createElement('canvas'), g = cv.getContext('2d');
    for (const x of [sc, prev].filter(Boolean)) { x.chReq = chw(g, x.F.req); buildMoves(x, null, now); }
    buildMoves(sc, prev, now);
    return { sc, prev, now, B };
  },
  paint(g, u, s, c, D) {
    const { sc, prev, now, B } = D, t = u * B, T = sc.T;
    now.t = t;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    if (sc.MV.wipe && t < T.wipe[1]) { sc.MV.wipe.draw(g, progress(t, T.wipe[0], T.wipe[1] - T.wipe[0])); return; }
    stateOf(g, sc, t, prev);
  },
  track(u, s, c, D) {
    const { sc, B } = D, t = u * B, T = sc.T;
    if (sc.MV.wipe && t < T.wipe[1]) return sc.MV.wipe.track(progress(t, T.wipe[0], T.wipe[1] - T.wipe[0]));
    if (T.open && t >= T.open[0] && t < T.open[1]) return sc.MV[0].track(progress(t, T.open[0], T.open[1] - T.open[0]));
    if (T.branch) return sc.MV.branch.track(progress(t, T.branch[0], T.branch[1] - T.branch[0]));
    if (T.slide) return sc.MV.slide.track(progress(t, T.slide[0], T.slide[1] - T.slide[0]));
    if (T.close && t >= T.close[0]) return [[lerp(L.XF, W + 16, cubicInOut(progress(t, T.close[0], T.close[1] - T.close[0]))), 540]];
    const k = resultIndex(sc, t), r = T.results[k];
    if (r?.move && r.move.role !== 'open' && t < r.at + r.move.dur) return sc.MV[k].track(progress(t, r.at, r.move.dur));
    return [[L.X, 540]];
  },
});

// ── sample content: a made-up product (`northwind`, a docs generator) on neutral placeholder frames ───────────────────
export const SAMPLE = {
  label: 'README.md · quick start', prompt: 'Use northwind.',
  list: ['guide', 'reference', 'tutorial', 'changelog', 'cookbook', 'api'],
  lines: ["  pages: [", "    { title: 'Install', from: 'docs/install.md' },", "    { title: 'Deploy', from: 'docs/deploy.md' },", "  ],"],
  pairs: [{ line: 1, token: "'Install'" }, { line: 2, token: "'Deploy'" }],
  command: '$ npm run docs',
  report: { label: 'check-docs site/', lines: [['PASS', 'links', '412/412'], ['PASS', 'pages', '38'], ['PASS', 'build', '4.2 s']], result: 'result: PASS' },
  diff: { n: 12, before: "  theme: 'paper',", after: "  theme: 'night'," },
  install: '$ npx skills add northwind/docs', url: 'github.com/northwind/docs',
};
export const sampleFrame = (n, chip) => ({ n, chip: chip || `northwind-site.mp4 · 0:0${n}` });
