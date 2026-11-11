// exhibit.js — the six exhibit scenes on one desk: their timelines (the template's choreo.js plan, in seconds from
// the scene's start, read with lang.js times) and the shared scene body (plan, prepare, paint, track) the scene
// bricks print-open, print-travel, print-read, value-match, gap-measure and desk-lockup are made of. A scene names
// the desk (`prints`), the print it is about (`print`), the print the camera comes from (`from`), and the captions
// already lying on the desk from earlier scenes (`held`); its own caption is set down word by word at reading pace.
import {
  C, MOVE_BEATS, reader, wordsOf, contextOf, frame, trackFrame, captionList, restCam, viewOf, lerpCam, overview, rect, pt, fileRect, fileToWorld,
  contentOfE, boxRing, chipAt, planeView, DEPTH, deskWords, handColors, openMove, travelMove, matchMove, liftMove, pIn, clamp, lerp, cubicOut, cubicInOut, settle,
  veil, ring, text, measure, rgba, SAMPLE_BOXES, SAMPLE_GLYPHS,
} from './desk.js';
import { geom, paintDimension, isolate, labelOf } from '../../motion/dimension-line/dimension.js';
import { routePoints, paintRoute, paintRule } from '../../motion/ring-route/route.js';

// ── defaults for samples: three placeholder prints, two with chips ─────────────────────────────────────────────────
export const SAMPLE_PRINTS = {
  en: [{ source: 'example.dev/report · official table' }, { source: 'Northwind · release build · Oct 20', chip: ['in the model picker', 'Northwind 2'] }, { source: 'example.dev/report · official chart', chip: ['per task, max effort', '~$0.045'] }],
  zh: [{ source: 'example.dev/report · 官方表格' }, { source: 'Northwind · 正式版 · 10 月 20 日', chip: ['模型选择器里', 'Northwind 2'] }, { source: 'example.dev/report · 官方图表', chip: ['每个任务，最高档', '~$0.045'] }],
};
export { SAMPLE_BOXES, SAMPLE_GLYPHS };
export const CAPTION_LIMITS = { en: { words: 6, chars: 34 }, zh: { chars: 16 } };

// ── timelines ────────────────────────────────────────────────────────────────────────────────────────────────────
// T: { need (s), land (s), capAt, items (read), ...per type }; a chip on the landed print is read first (its label a
// glance), then the caption half a beat after the landing
const landed = (T, s, e, at, B, lang) => {
  const chip = e?.chip;
  const items = [...(chip ? [{ text: chip[0], tier: 'glance', at }, { text: chip[1], at }] : []), ...(s.caption ? [{ text: s.caption, at: at + C.capAt * B, cap: true }] : [])];
  const r = reader(items, lang);
  T.items = r.items;
  T.capAt = s.caption ? r.items.find((x) => x.cap).from : null;
  T.need = Math.max(r.done, r.glanceDone, at) + C.settle;
};
export const timeline = (type, s, ctx, Wd) => {
  const B = 60 / ctx.bpm, lang = ctx.lang, T = { type, B }, e = Wd.list[s.print ?? 0];
  if (type === 'open') {
    T.pull = [C.pullAt * B, (C.pullAt + MOVE_BEATS['bezel-pullback']) * B]; T.land = T.pull[1];
    landed(T, s, e, T.land, B, lang);
  }
  if (type === 'travel') {
    T.move = [0, MOVE_BEATS[s.move || 'parallax-slide'] * B]; T.land = T.move[1];
    landed(T, s, e, T.land, B, lang);
  }
  if (type === 'match') {
    T.ringIn = [0, C.ringIn * B]; T.move = [C.ringIn * B, (C.ringIn + MOVE_BEATS['match-cut']) * B]; T.cut = T.move[0] + C.cutAt * MOVE_BEATS['match-cut'] * B; T.land = T.move[1];
    landed(T, s, e, T.land, B, lang);
  }
  if (type === 'read') {
    const cells = s.cells || [], n = cells.length;
    T.rings = cells.map((c, k) => [C.ringStep * k * B, (C.ringStep * k + C.ringDraw) * B]);
    const Rt = Math.ceil(C.ringStep * (n - 1) + C.ringDraw) * B;
    T.lift = [Rt, Rt + MOVE_BEATS['lift-out'] * B]; T.land = T.lift[1];
    T.labelAt = cells.map((c, k) => Rt + MOVE_BEATS['lift-out'] * B * (0.98 - 0.75 * C.liftStagger * (n - 1 - k)));
    const first = reader(cells.map((c, k) => ({ text: `${c.value} ${c.label}`, at: T.labelAt[k] })), lang);
    T.reading = first.items.map((it) => [it.from, it.to]);
    T.noteAt = cells.map((c, k) => (c.note ? T.reading[k][0] + Math.min(C.noteAt * B, (T.reading[k][1] - T.reading[k][0]) / 2) : null));
    const items = [...first.items.map((x) => ({ text: x.text, at: x.at })), ...(s.caption ? [{ text: s.caption, at: first.done, cap: true }] : []), ...cells.filter((c) => c.note).map((c) => ({ text: c.note, tier: 'glance', at: T.noteAt[cells.indexOf(c)] }))];
    const r = reader(items, lang);
    T.items = r.items; T.capAt = s.caption ? first.done : null;
    T.need = Math.max(r.done, r.glanceDone, T.land) + C.settle + (C.back + C.unring) * B;
    T.tail = true;
  }
  if (type === 'measure') {
    T.unringM = s.ringed ? [0, C.unringM * B] : null;
    T.dim = [C.dimAt * B, (C.dimAt + C.dim) * B]; T.land = T.dim[1];
    const r = reader(s.caption ? [{ text: s.caption, at: C.mcapAt * B, cap: true }] : [], lang);
    T.items = r.items; T.capAt = s.caption ? C.mcapAt * B : null; T.pause = !!(s.caption && s.claim);
    T.need = Math.max(r.done, T.land) + Math.max(C.pauseMin, C.settle);
  }
  if (type === 'lockup') {
    T.rise = [0, C.rise * B]; T.land = T.rise[1]; T.name = [C.nameAt * B, C.rise * B];
    const r0 = reader([{ text: s.name, at: T.land }, ...(s.line ? [{ text: s.line, at: C.lineAt * B }] : [])], lang);
    T.lineAt = s.line ? r0.items[1].from : null;
    T.urlAt = Math.max(r0.done, T.land) + 0.1; T.urlTyped = T.urlAt + String(s.url || '').length / C.urlCps;
    T.items = [...r0.items, { text: s.url, from: T.urlTyped, to: T.urlTyped }];
    T.rule = [T.urlTyped, T.urlTyped + B]; T.route = [T.rule[1], T.rule[1] + 2 * B];
    T.need = Math.max(r0.done, T.route[1]) + Math.max(4 * B, C.urlHold);
    T.tail = true;
  }
  T.beats = Math.max(s.beats || 0, Math.ceil(T.need / B - 1e-9));
  const D = T.beats * B;
  if (type === 'read') { T.back = [D - (C.back + C.unring) * B, D - C.unring * B]; T.unring = [D - C.unring * B, D]; }
  if (type === 'lockup') T.last = [D - 4 * B, D - 4 * B + 0.75 * B];
  return T;
};

// ── the scene body ───────────────────────────────────────────────────────────────────────────────────────────────
const CUES = { open: 'hook', travel: 'land', read: 'land', match: 'accent', measure: 'claim', lockup: 'lockup' };
export const sceneBody = (type) => ({
  surface: ['canvas'],
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onPaper', 'muted', 'smuted'],
  plan(s, ctx) {
    // the desk's world only matters for chips (read before the caption): use the prints as given, unloaded
    const Wd = { list: (s.prints || []).map((p) => ({ chip: p?.chip ?? null })) };
    const T = timeline(type, s, ctx, Wd), B = T.B;
    const reads = T.items.filter((i) => i.tier !== 'glance' && i.text).map((i) => ({ text: i.text, lang: ctx.lang }));
    const cues = [{ beat: T.land / B, kind: CUES[type] }];
    if (T.cut != null) cues.push({ beat: T.cut / B, kind: 'accent' });
    if (T.last) cues.push({ beat: T.last[0] / B, kind: 'end' });
    const motion = { open: 'bezel-pullback', travel: s.move || 'parallax-slide', read: 'lift-out', match: 'match-cut', measure: 'dimension-line', lockup: 'ring-route' }[type];
    return { beats: T.beats, reads, cues, motion, settled: Math.ceil(T.land / B), peakAt: type === 'measure' || type === 'lockup' ? T.land / B : null, pause: T.pause ? Math.max(0, T.beats - Math.ceil((T.items.at(-1)?.to ?? T.land) / B)) : 0 };
  },
  validate(s) {
    const e = [], n = (s.prints || []).length;
    if (!n) e.push('prints: at least one');
    if ((s.print ?? 0) >= n) e.push('print: an index into prints');
    if (['travel', 'match'].includes(type) && (s.from == null || s.from === s.print || s.from >= n)) e.push('from: another print');
    if (type === 'read' && !((s.cells || []).length >= 1 && s.cells.length <= 3)) e.push('cells: 1 to 3');
    if (type === 'match' && !(s.fromBox && s.toBox)) e.push('fromBox and toBox: the value on both prints');
    if (type === 'measure' && !(s.a?.point && s.b?.point)) e.push('a, b: { point, value }');
    if (type === 'lockup' && !s.name) e.push('name');
    return e;
  },
  async prepare(s, ctx) {
    const X = await contextOf(s, ctx.lang), Wd = X.Wd, e = Wd.list[s.print ?? 0], prev = s.from != null ? Wd.list[s.from] : null;
    const T = timeline(type, s, ctx, Wd), D = { X, T, e, prev };
    if (type === 'open') D.move = await openMove(X, e);
    if (type === 'travel') D.move = await travelMove(X, prev, e, s.move || 'parallax-slide');
    if (type === 'match') D.move = await matchMove(X, prev, e, s.fromBox, s.toBox);
    if (type === 'read') D.lift = await liftMove(X, e, s.cells);
    if (type === 'measure') {
      const v = viewOf(restCam(e)), G = geom(X.g, pt(v, ...fileToWorld(e, ...s.a.point)), pt(v, ...fileToWorld(e, ...s.b.point)), rect(v, contentOfE(e)), v.a, labelOf(s.a.value, s.b.value, s.label, s.digits ?? 1), X.F.font);
      const c = rect(planeView(restCam(e), DEPTH.front), chipAt(e));
      const rs = [G.chip, { x: Math.min(G.A[0], G.Bp[0], G.ax, G.bx) - 10, y: Math.min(G.A[1], G.Bp[1], G.ay, G.by) - 10, w: Math.abs(G.A[0] - G.Bp[0]) + Math.abs(G.ax - G.A[0]) + 20, h: Math.abs(G.A[1] - G.Bp[1]) + Math.abs(G.ay - G.A[1]) + 20 }];
      D.aside = !!e.chip && rs.some((r) => r.x < c.x + c.w && r.x + r.w > c.x && r.y < c.y + c.h && r.y + r.h > c.y);
    }
    if (type === 'lockup') {
      D.OV = overview(Wd, { line: s.line, mark: !!s.mark?.image });
      D.last = Wd.list[s.from ?? Wd.n - 1];
      D.route = (s.route || []).filter((r) => Wd.list[r.print]).map((r) => fileRect(Wd.list[r.print], r.box));
      if (s.mark?.image) { const im = typeof s.mark.image === 'string' ? Object.assign(new Image(), { src: s.mark.image }) : s.mark.image; if (im.decode) await im.decode(); D.mark = { image: im, crop: s.mark.crop || [0, 0, im.naturalWidth || im.width, im.naturalHeight || im.height] }; }
    }
    D.own = s.caption ? { print: e.i, units: wordsOf(s.caption, ctx.lang, T.capAt) } : null;
    return D;
  },
  shot(t, s, D) {
    const T = D.T, m = D.move;
    if (type === 'open') return { cam: m.camera(pIn(t, T.pull)), move: m, mp: pIn(t, T.pull) };
    if (type === 'travel' && t < T.move[1]) return { cam: m.camera(pIn(t, T.move)), move: m, mp: pIn(t, T.move) };
    if (type === 'match' && t < T.move[0]) return { cam: restCam(D.prev) };
    if (type === 'match' && t < T.move[1]) return { cam: m.camera(pIn(t, T.move)), move: m, mp: pIn(t, T.move) };
    if (type === 'lockup') return { cam: lerpCam(restCam(D.last), D.OV.cam, cubicInOut(pIn(t, T.rise))) };
    return { cam: restCam(D.e) };
  },
  paint(g, u, s, c, D) {
    const T = D.T, t = u * T.B, X = D.X, { cam, move, mp } = this.shot(t, s, D);
    const focus = move ? null : type === 'match' && t < T.move[0] ? D.prev.i : D.e.i;
    const rise = type === 'lockup' ? cubicInOut(pIn(t, T.rise)) : 0;
    const caps = captionList(X, { focus, own: D.own, rise, t });
    const aside = {};
    if (type === 'measure' && D.aside) aside[D.e.id] = cubicInOut(pIn(t, [0, T.dim[0]]));
    const vl = type === 'lockup' ? (e) => lerp(e.id === D.last.id ? 0 : 0.55, 0.5, rise) : () => 0;
    const measureG = type === 'measure' ? (v) => geom(X.g, pt(v, ...fileToWorld(D.e, ...s.a.point)), pt(v, ...fileToWorld(D.e, ...s.b.point)), rect(v, contentOfE(D.e)), v.a, labelOf(s.a.value, s.b.value, s.label, s.digits ?? 1), X.F.font) : null;
    frame(g, X, {
      cam, move, mp, caps, t, vl, aside,
      under: type === 'measure' ? (ctx, v) => isolate(ctx, measureG(v), rect(v, contentOfE(D.e)), X.C, cubicOut(pIn(t, [T.land - 0.2 * T.B, T.land + 0.3 * T.B]))) : null,
      over: (ctx, v) => {
        if (type === 'read') readLayer(ctx, s, t, D, v);
        if (type === 'match' && t < T.move[0]) boxRing(ctx, v, D.prev, s.fromBox, cubicInOut(pIn(t, T.ringIn)), X);
        if (type === 'match' && t >= T.move[1] && s.keepRing !== false) boxRing(ctx, v, D.e, s.toBox, 1, X);
        if (type === 'measure') {
          if (T.unringM) boxRing(ctx, v, D.e, s.ringed, 1 - cubicInOut(pIn(t, T.unringM)), X);
          if (t >= T.dim[0]) paintDimension(ctx, measureG(v), X.C, pIn(t, T.dim), pIn(t, [T.land - 0.2 * T.B, T.land]));
        }
        if (type === 'lockup') lockupLayer(ctx, s, t, D, v);
      },
    });
  },
  track(u, s, c, D) {
    const T = D.T, t = u * T.B, { cam, move, mp } = this.shot(t, s, D), out = trackFrame(cam, move, mp);
    if (type === 'read') { if (t > T.lift[0] && t < T.lift[1]) out.push(...D.lift.track(pIn(t, T.lift))); if (t > T.back[0] && t < T.back[1]) out.push(...D.lift.track(1 - pIn(t, T.back))); }
    return out;
  },
});

// a read: rings drawn on, the lift-out, notes, the reading marker, the readings going back
const readLayer = (ctx, s, t, D, v) => {
  const T = D.T, lift = D.lift, X = D.X, PW = { colors: handColors(X.C), mono: X.F.mono }, content = rect(v, contentOfE(D.e));
  if (t < T.lift[0]) { lift.cards.forEach((c, k) => ring(ctx, c.r0, PW, { pad: 6, radius: 10, width: 3, draw: cubicInOut(pIn(t, T.rings[k])) })); return; }
  if (t >= T.unring[0]) { lift.cards.forEach((c) => ring(ctx, c.r0, PW, { pad: 6, radius: 10, width: 3, draw: 1 - cubicInOut(pIn(t, T.unring)) })); return; }
  const p = t < T.back[0] ? pIn(t, T.lift) : 1 - pIn(t, T.back);
  ctx.save(); veil(ctx, content, PW, lift.state(p).dim); ctx.restore();
  lift.draw(ctx, p);
  if (t >= T.back[0]) return;
  const n = lift.cards.length, cur = T.reading.reduce((a, [from], k) => (t >= from ? k : a), -1), capOn = T.capAt != null && t >= T.capAt;
  lift.cards.forEach((c, k) => {
    const note = s.cells[k].note;
    if (note && t >= T.noteAt[k]) text(ctx, note, c.labelX, c.y + c.h / 2 + 52, { ...X.F.mono, size: X.F.note }, { color: X.C.smuted || X.C.dim, alpha: cubicOut(clamp((t - T.noteAt[k]) / C.wordIn)) });
    if (n > 1 && cur >= 0 && !capOn && k !== cur && t >= T.lift[1]) { ctx.save(); ctx.fillStyle = rgba(X.C.ground, 0.5); ctx.fillRect(c.x, c.y, c.w, c.h); ctx.restore(); }
  });
};

// the lock-up: the title block on the desk (an optional mark, the name, the rule, the line, the address), the ring's
// route over the row, and the last ring round the address a bar before the end
const lockupLayer = (ctx, s, t, D, v) => {
  const T = D.T, X = D.X, tb = D.OV.tb, lang = X.lang, Cl = X.C;
  if (t >= T.name[0]) {
    const u = settle(pIn(t, T.name), 10);
    if (D.mark) { const [cx, cy, cw, ch] = D.mark.crop, h = tb.markH, w = (h * cw) / ch, [x, y] = pt(v, tb.x, tb.markY); ctx.save(); ctx.globalAlpha = u; ctx.drawImage(D.mark.image, cx, cy, cw, ch, x, y, w * v.a, h * v.a); ctx.restore(); }
    const [x, y] = pt(v, tb.x - tb.nameSize * 0.04, tb.nameY), k = 1.04 - 0.04 * u;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    text(ctx, s.name, 0, 0, { ...X.F.font, weight: 600, size: tb.nameSize * v.a }, { color: Cl.ink, alpha: u });
    ctx.restore();
  }
  if (s.line) deskWords(ctx, v, wordsOf(s.line, lang, T.lineAt), tb.x, tb.lineY, tb.lineSize, t, X, { weight: 500, color: Cl.muted || Cl.dim });
  if (t >= T.urlAt) {
    const n = Math.max(1, Math.floor(clamp((t - T.urlAt) / Math.max(1e-6, T.urlTyped - T.urlAt)) * s.url.length + 1e-9)), [x, y] = pt(v, tb.x, tb.urlY);
    text(ctx, s.url.slice(0, n), x, y, { ...X.F.mono, size: tb.urlSize * v.a }, { color: Cl.muted || Cl.dim });
  }
  if (t >= T.rule[0]) { const nameW = measure(ctx, s.name, { ...X.F.font, weight: 600, size: tb.nameSize }).width, [x0, y] = pt(v, tb.x, tb.ruleY); paintRule(ctx, x0, y, nameW * v.a, Cl, pIn(t, T.rule)); }
  if (t >= T.route[0] && D.route.length) paintRoute(ctx, routePoints(D.route, D.OV.laneY).map(([x, y]) => pt(v, x, y)), Cl, pIn(t, T.route));
  if (t >= T.last[0]) {
    const w = measure(ctx, s.url, { ...X.F.mono, size: tb.urlSize }).width, r = rect(v, { x: tb.x, y: tb.urlY - tb.urlSize * 0.8, w, h: tb.urlSize * 1.05 });
    ring(ctx, r, { colors: handColors(Cl) }, { pad: 12, radius: 10, width: 3, draw: cubicOut(pIn(t, T.last)) });
  }
};
