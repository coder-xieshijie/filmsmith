// engine.js — the stream engine: the template's film.js as a factory that draws a whole stream film on one canvas, so
// each stream scene brick draws its own window of the film with the neighbours its picture reads (the stars every
// earlier scene sent, the chat feed, the chat block's place). createFilm(content, { colors, palette }) lays the film out
// with plan.js (fit() with rules.js) and returns { plan, duration, problems, frame(ctx, t) }: the film's frame at film
// time t (s), a pure function of t.
// Copied from assets/templates/stream/film.js; changed: no module state and no DOM (the template's three canvases and its
// DOM blocks become offscreen layers composed in the template's z-order: night, desk, thread, blocks, mascot and glows,
// texts, the freeze veil, the lock-up), every block measured and drawn on canvas (hung-block/blocks.js, desk-pile/pile.js,
// yarn-mascot/mascot.js) with the template's boxes, the palette from the look (night-sky), the language through text.js
// (the library's readTime; Chinese information text at 28 px), no red banner (copy that does not fit is returned in
// `problems`).
import { build, L } from './plan.js';
import { E, seg, lerp, clamp, glow, thread, star, arcPts, straight, atLen, subPath, palOf, layer, cubic, W, H } from './draw.js';
import { mulberry32 } from '../../../rng.js';
import { typeOf, typed } from './text.js';
import { sky } from '../../look/night-sky/texture.js';
import { mascot } from '../yarn-mascot/mascot.js';
import { item as pileItem, wall, cursor } from '../desk-pile/pile.js';
import { box, textAt, textW, run, runAt, ring, tick, doc, pill, bubbleOf, drawBubble, chipOf, drawChip, fileOf, drawFile, lineH, shadowOf, setFont, baseline } from '../hung-block/blocks.js';

const FILMS = new Map();
export const createFilm = (content, opt = {}) => {
  const key = JSON.stringify([content, opt.colors || null, opt.palette || null, opt.mascotSize || null, opt.mascot?.src || null, Object.keys(opt.images || {})]);
  if (!FILMS.has(key)) FILMS.set(key, make(content, opt));
  return FILMS.get(key);
};
// the plan alone (no canvas): node and the scene bricks' plan() read it
const PLANS = new Map();
export const planOf = (content) => { const key = JSON.stringify(content); if (!PLANS.has(key)) PLANS.set(key, build(content)); return PLANS.get(key); };

// draw fn with an element's transform: left/top its box, x/y the translate, s (or sx, sy) the scale and r the rotation
// (deg) about the origin ox/oy (px in the box), o its opacity, b a blur (px)
const xf = (ctx, { o = 1, x = 0, y = 0, s = 1, sx, sy, b = 0, r = 0, ox = 0, oy = 0, left = 0, top = 0 }, fn) => {
  if (o <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= o >= 0.999 ? 1 : o;
  ctx.translate(left + ox + x, top + oy + y); ctx.scale(sx ?? s, sy ?? s); if (r) ctx.rotate((r * Math.PI) / 180); ctx.translate(-ox, -oy);
  if (b > 0.05) ctx.filter = `blur(${b.toFixed(2)}px)`;
  fn(); ctx.restore();
};
const life = (t, t0, d, t1 = Infinity, d1 = 0.22) => ({ i: E.out3(seg(t, t0, t0 + d)), o: t1 === Infinity ? 0 : E.in3(seg(t, t1 - d1, t1)) });
const blurIn = (t, t0, d = 0.3, t1 = Infinity, d1 = 0.22, px = 8) => { const { i, o } = life(t, t0, d, t1, d1); return { o: i * (1 - o), b: px * (1 - i) + 10 * o }; };
const wrapv = (v, m) => ((v % m) + m) % m;

const make = (content, opt) => {
  const PLAN = planOf(content);
  const { lang, B, sc, STARS, CONST, S8, GATHER, OPEN, MSG } = PLAN;
  const duration = PLAN.duration;
  const TY = typeOf(lang);
  const { P, C } = palOf(opt.colors, opt.palette);
  const UI = content.ui;
  // the filter row's words (`ui.filter`: a product names its filters apart from its rows' states, as "In progress" over
  // "Running"); left out, the filters say what the rows say. Given, every filter carries its count, as a product's does.
  const FL = { ...UI, ...(UI.filter || {}) }, COUNTED = !!UI.filter;
  // how many tasks run at once (`ui.cap`): the evening's list holds at most this many running and queues the rest, rows
  // and counts alike, so the counts never show how many the product can run. Left out, the last two of the burst queue.
  const CAP = Number.isInteger(UI.cap) && UI.cap >= 1 ? UI.cap : null;
  const VARIANT = content.opening === 'night' ? 'night' : 'desk';
  const LOCK = content.lockup === 'mascot' ? 'mascot' : 'name';
  const SEED = content.seed ?? 1;
  // the mascot's size: the box it fills sitting on the spine (sit, default 60 px) and while dropped into the desk (drop,
  // default 1.6 × sit); a film's own mascot passes its own (opt.mascotSize { sit, drop } in px)
  const MS = opt.mascotSize || {}, KB = MS.sit > 0 && MS.sit !== 60 ? MS.sit / 60 : 1, DROP = MS.drop > 0 ? MS.drop / (MS.sit > 0 ? MS.sit : 60) : 1.6;
  const problems = [];
  // where the mascot on its perch hands over: to an interlude that leaves the frame to its composition (`perch: false`),
  // else to the lock-up, else it stays to the end
  const IL = sc.interlude, HAND = IL && IL.s.perch === false ? IL.start : sc.lockup ? sc.lockup.start : Infinity;
  const M = layer();   // measuring
  const deskL = layer(), midL = layer(), topL = layer();
  const mid = midL, top = topL;
  const TEXT_SHADOW = { color: P.ground, oy: 2, blur: 12 };
  const label = (ctx, s, x, y, px, w, color, alpha = 1) => { ctx.save(); ctx.shadowColor = TEXT_SHADOW.color; ctx.shadowOffsetY = TEXT_SHADOW.oy; ctx.shadowBlur = TEXT_SHADOW.blur; textAt(ctx, TY, s, x, y, px, w, color, { alpha }); ctx.restore(); };

  // ---------- geometry (the template's buildDOM + measureDOM) ----------
  const geo = {};
  const BW = 470;
  const QUOTE = UI.quote || (lang === 'zh' ? '引用' : 'Quote');
  // a file chip sits over the bubble, or inside it (`fileIn`: the evening's `fileInBubble`)
  const msgs = MSG.map((m) => ({ m, g: m.who === 'chip' ? chipOf(M, TY, m.text) : bubbleOf(M, TY, m.text, lang, BW, m.quote ? `${QUOTE} · ${m.quote}` : null, m.fileIn ? m.file : null), f: m.file && !m.fileIn ? fileOf(M, TY, m.file) : null, im: m.image ? L.THUMB : null }));
  { let y = 34; geo.msgs = []; msgs.forEach((o) => { const y0 = y; if (o.im) { o.iy = y; y += o.im.h + 10; } if (o.f) { o.fy = y; y += o.f.h + 10; } o.y = y; geo.msgs.push({ at: o.m.at, top: y0, bottom: y + o.g.h }); y += o.g.h + 18; }); }
  const IMG = (src) => (src && opt.images ? opt.images[src] || null : null);
  // a picture drawn whole (contain) in a box, or a document glyph where it did not load
  const picture = (ctx, src, x, y, w, h) => {
    const im = IMG(src);
    box(ctx, x, y, w, h, Math.min(14, w / 8), P.bubble);
    if (!im) { const s2 = Math.min(1, w / 120); ctx.save(); ctx.translate(x + w / 2 - 15 * s2, y + h / 2 - 18 * s2); ctx.scale(s2, s2); doc(ctx, P, 0, 0); ctx.restore(); return; }
    const r = Math.min(w / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * r, dh = im.naturalHeight * r;
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(14, w / 8)); ctx.clip(); ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); ctx.restore();
  };
  const as = sc.ask.s, ev = sc.evening.s, cs = sc.constellation.s, vs = sc.verify.s, cd = sc.cards.s, cl = sc.close.s, os = sc.open.s;
  const rowStack = (title, sub) => lineH(TY.row, 'normal', title) + lineH(TY.rowSub, 'normal', sub);
  geo.rowH = 56 + rowStack(as.task.title, as.task.running);
  geo.vchip = { w: 28 + 30 + 18 + textW(M, TY, vs.item, TY.row, 600) + 18 + 6 + 30 + 28, h: 44 + Math.max(36, lineH(TY.row, 'normal', vs.item)) };
  const cardRowH = (r) => 24 + 3 + lineH(TY.cardRow, 'normal', r);
  const rowsOf = (c) => (c.flow ? [...c.rows, c.flow] : c.rows); // a card's rows, with the line that flows into it last
  geo.cards = cd.cards.map((c) => { const h0 = 56 + lineH(TY.cardTitle, 'normal', c.title) + 4 + lineH(TY.cardSub, 'normal', c.sub); return { h0, h1: h0 + rowsOf(c).reduce((n, r) => n + cardRowH(r) + 14, 0) }; });
  const pillH = lineH(TY.rowSub, 'normal') + 8;
  const panelRowH = (r) => 32 + rowStack(r.title, r.detail);
  // the panel's optional group headers (rows[i].group, shown where it changes)
  const groupH = (r) => lineH(TY.rowSub, 'normal', r.group) + 14;
  const panelGroups = cl.panel.rows.map((r, i) => (r.group && r.group !== cl.panel.rows[i - 1]?.group ? r.group : null));
  geo.panelH = 60 + lineH(TY.row + 2, 'normal', cl.panel.title) + 18 + pillH + 10 + cl.panel.rows.reduce((n, r, i) => n + panelRowH(r) + (panelGroups[i] ? groupH(r) : 0), 0);
  geo.nudge = { w: 26 + 16 + 14 + textW(M, TY, cl.nudge, TY.row, 600) + 26, h: 36 + lineH(TY.row, 'normal', cl.nudge) };
  geo.name = { w: textW(M, TY, content.product.name, TY.name, TY.weight.name, -0.02), h: lineH(TY.name, 'normal', content.product.name) };
  geo.words = cl.words.map((w) => ({ w: textW(M, TY, w, TY.word, 600), h: lineH(TY.word, 'normal', w) }));
  const regionHead = `${UI.workspace} · ${cs.workspace}`;
  geo.regionHead = { w: 44 + 4 + textW(M, TY, regionHead, TY.label, 600), h: 24 + 4 + lineH(TY.label, 'normal', regionHead) };
  // a workspace's header (the constellation's `head`, the panel's `head`): a space chip (a catalog glyph, the name, a
  // chevron) over a filter row, as ui-kit's space header
  const chipH = lineH(TY.row, 'normal') + 20;
  geo.wsHead = { chip: chipH, h: 18 + chipH + 14 + pillH + 20 };
  const spaceChip = (ctx, x, y, name) => {
    const tw = textW(ctx, TY, name, TY.row, 600), w = 18 + 22 + 12 + tw + 14 + 16 + 18;
    box(ctx, x, y, w, chipH, chipH / 2, P.bubble);
    ctx.save(); ctx.fillStyle = P.ink2; const gy = y + (chipH - 22) / 2;
    [[0, 0], [12, 0], [0, 12], [12, 12]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.roundRect(x + 18 + dx, gy + dy, 10, 10, 2.5); ctx.fill(); });
    ctx.restore();
    textAt(ctx, TY, name, x + 18 + 22 + 12, y + 10, TY.row, 600, P.ink);
    ctx.save(); ctx.strokeStyle = P.ink2; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const cx = x + w - 18 - 8, cy = y + chipH / 2; ctx.beginPath(); ctx.moveTo(cx - 7, cy - 3.5); ctx.lineTo(cx, cy + 3.5); ctx.lineTo(cx + 7, cy - 3.5); ctx.stroke();
    ctx.restore();
    return w;
  };

  // the evening's list rows and where each star leaves from
  // rows are 58 px, or 84 px when the asks carry a second line of progress; the filter tabs (`tabs`) take a row of the
  // header; the follow-up scrolls the list back to the row it adds to
  const EVP = ev.asks.some((a) => a.progress) ? 84 : 58, EVC = EVP / 2 - 4, EVH = ev.tabs ? 84 + pillH + 14 : 84;
  const EVN = Math.floor((L.LIST.h - EVH - 6) / EVP);
  const evFu = sc.evening.k.fu ? sc.evening.start + sc.evening.k.fu.msg : null;
  const listScrollEased = (t) => {
    const e = sc.evening; const times = [...e.s.asks.map((_, i) => e.start + e.k.asks[i] + 0.2 * B), ...e.k.burst.map((x) => e.start + x)]; let y = 0;
    times.forEach((tt, i) => { if (i + 1 > EVN) y += EVP * E.out3(seg(t, tt, tt + 0.25)); });
    // a follow-up sent between the asks (`after`) lets the list go on scrolling once its tag is up
    const fk = sc.evening.k.fu, rel = fk && fk.after != null ? 1 - E.io3(seg(t, sc.evening.start + fk.free - 0.5, sc.evening.start + fk.free)) : 1;
    if (evFu != null) y = lerp(y, Math.min(y, Math.max(0, (ev.followUp.to - 1) * EVP)), E.io3(seg(t, evFu, evFu + 0.5)) * rel);
    return y;
  };
  const listRowPos = (i, t) => [L.LIST.x + 34, L.LIST.y + EVH + 6 + i * EVP - listScrollEased(t)];
  STARS.forEach((s) => { if (s.row != null) { const p = listRowPos(s.row, s.launchAt); s.from = [p[0] + 15, p[1] + (EVP === 58 ? 25 : EVC)]; } });
  // the ask's question card (choice): options with a letter, the recommended one tagged, a footer
  const CH = as.choice || null;
  if (CH) {
    const X = L.CHOICE, pad = 36, iw = X.w - 2 * pad;
    const qh = lineH(TY.row + 2, 'normal', CH.question);
    const opts = CH.options.map((o) => { const lh = lineH(TY.row, 'normal', o.label), dh = o.desc ? lineH(TY.rowSub, 'normal', o.desc) + 4 : 0; return { lh, dh, h: 40 + Math.max(40, lh + dh) }; });
    let y = pad + qh + 22; opts.forEach((o) => { o.y = y; y += o.h + 12; });
    geo.choice = { pad, iw, qh, opts, foot: y + 4, h: y + 4 + 60 + pad };
  }
  // the constellation's new-workspace modal
  const MD = cs.modal || null;
  if (MD) {
    const pad = 32; let y = pad + lineH(34, 'normal', MD.title) + 22;
    const fields = MD.fields.map((f) => { const o = { ly: y }; y += lineH(28, 'normal', f.label) + 10; o.iy = y; o.ih = lineH(30, 'normal', f.value) + 24; y += o.ih + 18; return o; });
    const ny = y; if (MD.note) y += lineH(28, 'normal', MD.note) + 8;
    geo.modal = { pad, fields, ny, h: y + pad - 18 };
  }

  // text runs (the template's glyphs()): captions, the cards' sub-line, the claim, the tagline
  const caps = [];
  ['ask', 'evening', 'constellation', 'verify', 'cards', 'days', 'close'].forEach((type) => {
    if (!sc[type]) return;
    const k = sc[type].k, s = sc[type].s, A0 = sc[type].start;
    caps.push({ text: s.caption, t0: A0 + k.cap });
    if (type === 'constellation') caps.push({ text: s.caption2, t0: A0 + k.cap2 });
    if (type === 'close' && k.cap2 != null) caps.push({ text: s.caption2, t0: A0 + k.cap2 });
    // optional chapter lines: the choice, the follow-up, the relation graph (two), each card while it is open (the scene's
    // own caption comes back when the three are whole again)
    if (type === 'ask' && k.ch) caps.push({ text: s.choice.caption, t0: A0 + k.ch.cap });
    if (type === 'evening' && k.fu) caps.push({ text: s.followUp.caption, t0: A0 + k.fu.cap });
    if (type === 'verify' && k.gr) { caps.push({ text: s.graph.caption, t0: A0 + k.gr.cap }); caps.push({ text: s.graph.caption2, t0: A0 + k.gr.cap2 }); }
    if (type === 'cards' && s.cards.some((c) => c.say)) { s.cards.forEach((c, i) => caps.push({ text: c.say || s.caption, t0: A0 + k.zoom[i].z0 })); caps.push({ text: s.caption, t0: A0 + k.whole }); }
  });
  caps.sort((a, b) => a.t0 - b.t0);
  caps.forEach((c, i) => { c.t1 = i + 1 < caps.length ? caps[i + 1].t0 : sc.close.start + sc.close.k.recede; if (caps[i + 1] && sc.close.start + sc.close.k.cap === caps[i + 1].t0) c.t1 = sc.close.start + 0.6 * B; });
  caps.forEach((c) => { c.R = run(M, TY, c.text, { px: TY.caption, w: TY.weight.caption, maxW: L.CAP_W, lang }); if (c.R.lines.length > 1) problems.push(`caption "${c.text}" needs ${c.R.lines.length} lines at ${TY.caption}px in ${L.CAP_W}px; shorten it`); });
  const capsub = run(M, TY, cd.caption2, { px: TY.sub, w: 500, maxW: L.CAP_W, lang });
  const DS = sc.days ? sc.days.s : null;
  const daysub = DS?.sub ? run(M, TY, DS.sub, { px: TY.sub, w: 500, maxW: L.CAP_W, lang }) : null;
  const claimR = run(M, TY, cl.claim, { px: TY.claim, w: TY.weight.claim, maxW: 1500, lang, align: 'center' });
  const tagR = run(M, TY, content.product.tagline, { px: TY.tagline, w: 500, maxW: 1400, lang, align: 'center' });
  const capTop2 = L.CAP[1] + Math.round(TY.caption * 1.3);
  // the intro's optional hero: the name large (96 px) and who it is (40 px) at (1060, 392)
  const ins = sc.intro.s;
  const heroR = ins.title ? run(M, TY, ins.title, { px: 96, w: 600, maxW: 820, lang }) : null;
  const roleR = ins.role ? run(M, TY, ins.role, { px: 40, w: 500, maxW: 820, lang }) : null;

  // ---------- per-frame helpers ----------
  const SPINE = (t) => {
    const o = sc.open, k = o.k;
    const grow = E.io2(seg(t, o.start + k.sink0 + 0.5 * (k.sink1 - k.sink0), o.start + k.sink1 + 0.1));
    const ret = E.io2(seg(t, S8.r0, S8.gA));
    return { on: grow > 0 && t < S8.gA, bot: lerp(L.MASCOT[1] + 34, L.SPINE_BOT, grow) - (L.SPINE_BOT - L.SPINE_TOP) * ret * (grow >= 1 ? 1 : 0), ret };
  };
  const listGeo = (t) => { const e = sc.evening, k = e.k, c = sc.constellation; const g = E.io3(seg(t, e.start + k.grow + 0.3 * B, e.start + k.grow + 1.3 * B)) * (1 - E.io3(seg(t, c.start + c.k.back, c.start + c.k.back + 0.8 * B))); return { w: L.LIST.w * g }; };
  const listCount = (t) => { const e = sc.evening; let n = 0; e.s.asks.forEach((_, i) => { if (t >= e.start + e.k.asks[i] + 0.2 * B) n++; }); e.k.burst.forEach((x) => { if (t >= e.start + x) n++; }); return n; };
  const appearAt = (it) => { const k = sc.open.k, s0 = sc.open.start; return s0 + (it.kind === 'window' ? k.win[it.i] : it.kind === 'alert' ? k.alert[it.i] : it.kind === 'note' ? k.note : k.cascade[it.i]); };
  const starState = (s, t) => {
    if (t < s.launchAt) return null;
    const fly = seg(t, s.launchAt, s.launchAt + s.fly);
    let x = s.x + Math.sin(t * 0.4 + s.tw) * 3, y = s.y + Math.cos(t * 0.33 + s.tw) * 3;
    if (fly < 1) {
      const q = E.io2(fly);
      if (s.beam) { const p = arcPts(s.from, [s.x, s.y], q, q, 1)[0]; x = p[0]; y = p[1]; }
      else { const v = [lerp(s.from[0], x, 0.5), Math.min(s.from[1], y) - 120], r = 1 - q; x = r * r * s.from[0] + 2 * r * q * v[0] + q * q * x; y = r * r * s.from[1] + 2 * r * q * v[1] + q * q * y; }
    }
    let a = E.out3(seg(t, s.launchAt, s.launchAt + 0.2)) * (s.queued ? 0.5 : 1);
    if (s.cst) a *= lerp(1, 0.45, seg(t, sc.verify.start, sc.verify.start + 0.8));
    else a *= lerp(1, 0.45, seg(t, s.launchAt + s.fly + 1.2, s.launchAt + s.fly + 2.2));
    const caught = seg(t, s.catchT - 0.06, s.catchT + 0.12);
    const g = GATHER.pos(s, t);
    if (g) { a = lerp(a, 1, caught); x = g.x; y = g.y; a *= 1 - seg(g.k, 0.88, 1); }
    return { x, y, a: a * (0.86 + 0.14 * Math.sin(t * 1.7 + s.tw)), fly, caught };
  };

  // the layers above the night are queued per frame and drawn in the template's z-order
  let Q;
  const q = (layerName, z, fn) => Q[layerName].push({ z, n: Q[layerName].length, fn });

  // ---------- render ----------
  const renderBG = (ctx, t) => {
    sky(ctx, P, t, { seed: SEED, duration });
    ctx.globalCompositeOperation = 'lighter';
    STARS.forEach((s) => {
      const st = starState(s, t); if (!st || st.a <= 0.01) return;
      const fl = st.fly < 1 ? 1 - st.fly : 0;
      if (fl > 0) for (let k = 8; k >= 1; k--) { const p = starState(s, t - k * 0.03); if (p && t - k * 0.03 >= s.launchAt) glow(ctx, p.x, p.y, 20 - k, C.glow, 0.45 * fl * (1 - k / 9)); }
      star(ctx, C, st.x, st.y, s.size * (1 + 0.25 * st.caught + 0.7 * fl), st.a);
      if (s.queued && t < sc.constellation.start) { ctx.save(); ctx.setLineDash([4, 6]); ctx.strokeStyle = `rgba(${C.glow},${(0.6 * st.a).toFixed(3)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(st.x, st.y, 16, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  const renderOpen = (ctx, t) => {
    const o = sc.open, k = o.k, s0 = o.start, T = (x) => s0 + x;
    const sinkK = E.io3(seg(t, T(k.sink0), T(k.sink1)));
    const gone = t > T(k.sink1) + 0.2;
    if (!gone) {
      const D = deskL; D.setTransform(1, 0, 0, 1, 0, 0); D.globalAlpha = 1; D.filter = 'none'; D.clearRect(0, 0, W, H);
      const badge = VARIANT === 'desk' && t >= T(k.alert[0]) ? Math.max(1, Math.min(30, OPEN.items.filter((it) => t >= appearAt(it)).length * 2 - 4)) : null;
      if (VARIANT === 'desk') wall(D, TY, P, os.sessions, badge);
      OPEN.items.forEach((it) => {
        const a0 = appearAt(it); if (t < a0) return;
        const inK = E.outExpo(seg(t, a0, a0 + 0.32));
        let x = it.x, y = it.y, s = lerp(it.kind === 'note' ? 1.12 : 0.94, 1, inK), op = inK, r = it.rot ?? 0;
        if (it.kind === 'alert') x += 60 * (1 - inK);
        if (VARIANT === 'night' && it.drift != null) { x += Math.sin(t * 0.5 + it.drift) * 8; y += Math.cos(t * 0.4 + it.drift) * 6; }
        const tg = E.io2(seg(t, T(k.tug) + 0.6 * B * (it.d / OPEN.total), T(k.tugEnd)));
        if (tg > 0) {
          const p = atLen(OPEN.path, OPEN.len, it.d * (1 - tg));
          x = p[0] - it.w / 2 + (x - it.x) * (1 - tg); y = p[1] - it.h / 2 + (y - it.y) * (1 - tg);
          s *= lerp(1, 0.08, tg); op *= 1 - seg(tg, 0.75, 1); r *= 1 - tg;
        }
        const lit = seg(t, it.pierce - 0.02, it.pierce + 0.06) * (1 - 0.6 * seg(t, it.pierce + 0.1, it.pierce + 0.5));
        xf(D, { o: op, x, y, s, r, ox: it.w / 2, oy: it.h / 2 }, () => pileItem(D, TY, P, VARIANT, it, os, t, lit));
      });
      const c0 = T(k.click) - 0.6, c1 = T(k.click), cp = OPEN.items.find((it) => it.kind === 'copy' && it.i === 0);
      const ca = seg(t, c0, c0 + 0.15) * (1 - seg(t, T(k.cascade[3]), T(k.cascade[3]) + 0.1));
      const cx = lerp(cp.x + 260, cp.x + cp.w - 150, E.io2(seg(t, c0, c1))), cy = lerp(cp.y + 260, cp.y + cp.h - 40, E.io2(seg(t, c0, c1)));
      cursor(D, P, VARIANT, cx + 16, cy + 10, t > c1 && t < c1 + 0.12 ? 0.9 : 1, ca);
      const cxy = OPEN.drop, sc1 = lerp(1, 0.28, sinkK), op = 1 - E.in3(sinkK);
      if (op > 0.001) { ctx.save(); ctx.globalAlpha = op; ctx.translate(cxy[0], cxy[1]); ctx.scale(sc1, sc1); ctx.translate(-cxy[0], -cxy[1]); ctx.drawImage(D.canvas, 0, 0); ctx.restore(); }
    }
    // freeze: a veil and one line, typed
    const fz = T(k.fz), dr = T(k.drop);
    const v = seg(t, fz, fz + 0.25) * (1 - seg(t, dr - 0.05, dr + 0.3));
    if (v > 0.001) q('veil', 0, (c) => { c.save(); c.globalAlpha = v; c.fillStyle = `rgba(${C.ground},0.86)`; c.fillRect(0, 0, W, H); textAt(c, TY, typed(os.freeze, t, fz + 0.15, lang), W / 2, 470, TY.freeze, 700, P.text, { align: 'center' }); c.restore(); });
    // the mascot drops in; later it moves to the top of the spine
    const land = T(k.land);
    if (t >= dr) {
      const fall = E.in3(seg(t, dr, land));
      let x = OPEN.drop[0], y = lerp(-120 * (DROP / 1.6) * KB, OPEN.drop[1], fall), s = DROP, sq = 0;
      if (t >= land) { const b = seg(t, land, land + 0.22); sq = 0.18 * Math.sin(Math.PI * b) * (1 - b); }
      const mv = E.io3(seg(t, T(k.sink0), T(k.sink1)));
      x = lerp(x, L.MASCOT[0], mv); y = lerp(y, L.MASCOT[1], mv); s = lerp(s, 1, mv);
      if (t < HAND) mascot(top, C, x, y, KB === 1 ? s : s * KB, 1, sq, opt.mascot || null);
    }
    // the thread: shoots from the mascot through every item, goes taut, reels them in
    const th0 = T(k.th0), th1 = T(k.th1), tugEnd = T(k.tugEnd);
    if (t >= th0 && t < tugEnd + 0.1) {
      let d1 = OPEN.head(t);
      if (t > T(k.tug)) d1 = Math.max(0, ...OPEN.items.map((it) => it.d * (1 - E.io2(seg(t, T(k.tug) + 0.6 * B * (it.d / OPEN.total), tugEnd)))));
      const pts = subPath(OPEN.path, OPEN.len, 0, d1);
      const taut = seg(t, th1 - 0.05, th1 + 0.1) * (1 - seg(t, th1 + 0.2, th1 + 0.8));
      thread(top, C, pts, 1, 1 + 0.6 * taut);
      const hp = atLen(OPEN.path, OPEN.len, d1);
      if (t < th1) { glow(top, hp[0], hp[1], 44, C.line, 0.7); glow(top, hp[0], hp[1], 10, C.core, 1); }
      if (taut > 0) glow(top, OPEN.drop[0], OPEN.drop[1], 260, C.line, 0.35 * taut);
    }
  };

  const renderSpine = (t) => {
    const sp = SPINE(t);
    if (sp.on) {
      thread(mid, C, straight([L.SPINE_X, L.MASCOT[1] + 34], [L.SPINE_X, sp.bot], 60), 1);
      if (sp.ret > 0) { glow(mid, L.SPINE_X, sp.bot, 44, C.line, 0.6); glow(mid, L.SPINE_X, sp.bot, 12, C.core, 0.95); }
      else if (sp.bot > L.SPINE_BOT - 1) for (let j = 0; j < 3; j++) { const y = lerp(L.SPINE_TOP, L.SPINE_BOT, wrapv(t * 0.11 + j / 3, 1)); glow(mid, L.SPINE_X, y, 10, C.glow, 0.35); }
    }
    const n0 = sc.intro.start + sc.intro.k.name, n1 = HAND + 0.4 * B, bi = blurIn(t, n0 + 0.1, 0.3, n1, 0.3);
    q('texts', 0, (c) => xf(c, bi, () => textAt(c, TY, content.product.name, L.NAME[0], L.NAME[1], TY.mascotName, 600, P.text)));
    if (heroR || roleR) {
      const h0 = sc.intro.start + sc.intro.k.hero, h1 = sc.intro.end, top = 392;
      q('texts', 0, (c) => {
        if (heroR) runAt(c, TY, heroR, 1060, top, P.text, t, h0 - 0.15, h1, lang);
        if (roleR) runAt(c, TY, roleR, 1060, top + (heroR ? Math.round(96 * 1.1) + 14 : 0), P.text2, t, h0 + 0.3, h1, lang);
      });
    }
  };

  const renderChat = (t) => {
    const c = PLAN.cardAt(t);
    if (c.a <= 0 || c.w < 1) return;
    const hy = c.y + 64;
    thread(mid, C, [[L.SPINE_X, hy], [c.x + 6, hy]], 0.9, 0.7); glow(mid, L.SPINE_X, hy, 22, C.glow, 0.7); glow(mid, L.SPINE_X, hy, 6, C.core, 1);
    let bottom = 34;
    geo.msgs.forEach((g, i) => { const k = E.out3(seg(t, g.at - 0.12, g.at + 0.3)); if (k > 0) bottom = lerp(i ? geo.msgs[i - 1].bottom : 34, g.bottom, k); });
    const off = Math.max(0, bottom - (c.h - 120));
    q('blocks', 0, (ctx) => {
      box(ctx, c.x, c.y, c.w, c.h, 34, P.paper, { shadow: shadowOf(0.42) });
      ctx.save(); ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, Math.min(34, c.w / 2, c.h / 2)); ctx.clip();
      const fx = c.x + 30, fw = c.w - 60, fy = c.y - off;
      msgs.forEach((o) => {
        const { m, g, f, fy: fileY, y } = o;
        const k = E.outExpo(seg(t, m.at - 0.12, m.at + 0.3)); if (k <= 0.001) return;
        const p = { o: k, b: 6 * (1 - k) };
        if (m.who === 'chip') xf(ctx, { ...p, left: fx, top: fy + y }, () => drawChip(ctx, TY, P, m.text, 0, 0, g));
        else if (m.who === 'bot') xf(ctx, { ...p, left: fx, top: fy + y, sx: lerp(0.7, 1, k), sy: lerp(0.85, 1, k) }, () => drawBubble(ctx, TY, P, g, 'bot', 0, 0));
        else xf(ctx, { ...p, left: fx + fw - g.w, top: fy + y, x: 40 * (1 - k), ox: g.w }, () => drawBubble(ctx, TY, P, g, 'user', 0, 0));
        if (f) xf(ctx, { o: k, b: 6 * (1 - k), left: fx + fw - f.w, top: fy + fileY, x: 40 * (1 - k) }, () => drawFile(ctx, TY, P, m.file, 0, 0, f));
        if (o.im) { const a0 = sc.ask.start + sc.ask.k.imgYield + 0.4; xf(ctx, { o: seg(t, a0 - 0.05, a0), left: fx + fw - o.im.w, top: fy + o.iy }, () => picture(ctx, m.image, 0, 0, o.im.w, o.im.h)); }
      });
      const iy = c.y + c.h - 24 - 66;
      box(ctx, c.x + 26.75, iy + 0.75, c.w - 52 - 1.5, 64.5, 22, P.paper, { stroke: [1.5, P.rule] });
      textAt(ctx, TY, UI.input, c.x + 26 + 1.5 + 24, iy + 1.5, TY.rowSub, 400, P.ink2, { lh: 63 / TY.rowSub });
      ctx.restore();
    });
  };

  const renderAsk = (t) => {
    const a = sc.ask, k = a.k, T = (x) => a.start + x;
    const r0 = T(k.row), done = T(k.done), launch = T(k.launch);
    if (t < r0 || t > launch + 0.5) return;
    const inK = E.outExpo(seg(t, r0, r0 + 0.35)), outK = E.in3(seg(t, launch - 0.05, launch + 0.3));
    const H0 = geo.rowH, origin = outK > 0 ? [52, 50] : [0, H0 / 2];
    const dk = seg(t, done, done + 0.2);
    q('blocks', 1, (ctx) => xf(ctx, { o: inK * (1 - seg(outK, 0.7, 1)), left: L.ROW.x, top: L.ROW.y, ox: origin[0], oy: origin[1], sx: lerp(0.2, 1, inK) * (1 - outK), sy: lerp(0.9, 1, inK) * (1 - outK) }, () => {
      box(ctx, 0, 0, L.ROW.w, H0, 28, P.paper, { shadow: shadowOf(0.42) });
      const st = rowStack(as.task.title, as.task.running), ry = 28 + (st - 30) / 2;
      if (dk > 0.5) tick(ctx, P, 32, ry); else ring(ctx, P, 47, ry + 15, ((t * 360) % 360) * Math.PI / 180);
      const th = lineH(TY.row, 'normal', as.task.title);
      textAt(ctx, TY, as.task.title, 80, 28, TY.row, 600, P.ink);
      textAt(ctx, TY, as.task.running, 80, 28 + th, TY.rowSub, 400, P.ink2, { alpha: 1 - dk });
      textAt(ctx, TY, as.task.done, 80, 28 + th, TY.rowSub, 400, P.ink2, { alpha: dk });
    }));
    const c = PLAN.cardAt(t), y = L.ROW.y + geo.rowH / 2, x0 = c.x + c.w;
    if (inK > 0 && outK < 1) { thread(mid, C, straight([x0, y], [lerp(x0, L.ROW.x, inK), y], 12), 0.85 * (1 - outK), 0.7); glow(mid, x0, y, 18, C.glow, 0.7 * (1 - outK)); }
  };

  // where the chat block's feed sits at t (the block, its scroll)
  const chatAt = (t) => {
    const c = PLAN.cardAt(t); let bottom = 34;
    geo.msgs.forEach((g, i) => { const k = E.out3(seg(t, g.at - 0.12, g.at + 0.3)); if (k > 0) bottom = lerp(i ? geo.msgs[i - 1].bottom : 34, g.bottom, k); });
    return { c, off: Math.max(0, bottom - (c.h - 120)) };
  };
  // ask (optional): the image flies in on the right, lands, and shrinks into the ask as its thumbnail
  const renderImage = (t) => {
    if (!as.image) return;
    const a = sc.ask, k = a.k, T = (x) => a.start + x;
    const t0 = T(k.img), t1 = T(k.imgLand), y0 = T(k.imgYield), y1 = y0 + 0.45;
    if (t < t0 || t >= y1) return;
    const R = L.IMG, inK = E.outExpo(seg(t, t1 - 0.42, t1));
    let x = lerp(R.x + 160, R.x, inK), y = lerp(R.y - 40, R.y, inK), w = R.w, h = R.h, o = seg(t, t1 - 0.42, t1 - 0.2);
    // held (holds `image`) past the task row: the card rises to clear the row as it unfolds
    if (k.imgHeld && k.imgYield > k.row) y -= 130 * E.io3(seg(t, T(k.row) - 0.35, T(k.row) + 0.1));
    const sk = E.io3(seg(t, y0, y1));
    if (sk > 0) {
      const { c, off } = chatAt(y1), o2 = msgs.find((m) => m.im), fx = c.x + 30, fw = c.w - 60;
      const tx = fx + fw - L.THUMB.w, ty = c.y - off + o2.iy;
      x = lerp(x, tx, sk); y = lerp(y, ty, sk); w = lerp(w, L.THUMB.w, sk); h = lerp(h, L.THUMB.h, sk);
    }
    const pad = lerp(14, 0, sk);
    q('blocks', 9, (ctx) => xf(ctx, { o, left: x, top: y, r: 3 * (1 - inK) }, () => {
      box(ctx, 0, 0, w, h, Math.min(24, w / 10), P.paper, { shadow: shadowOf(0.42 * (1 - sk)) });
      picture(ctx, as.image, pad, pad, w - 2 * pad, h - 2 * pad);
    }));
  };
  const renderChoice = (t) => {
    if (!CH) return;
    const a = sc.ask, ch = a.k.ch, T = (x) => a.start + x, G = geo.choice, X = L.CHOICE;
    const c0 = T(ch.card), f0 = T(ch.fold), f1 = f0 + 0.45;
    if (t < c0 || t >= f1) return;
    const inK = E.outExpo(seg(t, c0, c0 + 0.35)), fk = E.io3(seg(t, f0, f1)), sel = seg(t, T(ch.sel) - 0.05, T(ch.sel) + 0.1);
    const pick = CH.pick ?? 0, REC = UI.recommended || (lang === 'zh' ? '推荐' : 'Recommended'), SKIP = UI.skip || (lang === 'zh' ? '跳过' : 'Skip');
    const cc = PLAN.cardAt(t), tx = cc.x + cc.w - 80, ty = cc.y + cc.h - 160;
    q('blocks', 9, (ctx) => xf(ctx, { o: inK * (1 - seg(fk, 0.6, 1)), b: 6 * (1 - inK), left: lerp(X.x, tx, fk), top: lerp(X.y, ty, fk), s: lerp(0.96, 1, inK) * lerp(1, 0.12, fk) }, () => {
      box(ctx, 0, 0, X.w, G.h, 30, P.paper, { shadow: shadowOf(0.42) });
      textAt(ctx, TY, CH.question, G.pad, G.pad, TY.row + 2, 600, P.ink);
      const cx = X.w - G.pad - 12, cy = G.pad + G.qh / 2;
      ctx.save(); ctx.strokeStyle = P.ink2; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 9, cy - 9); ctx.lineTo(cx + 9, cy + 9); ctx.moveTo(cx + 9, cy - 9); ctx.lineTo(cx - 9, cy + 9); ctx.stroke(); ctx.restore();
      if (CH.step) textAt(ctx, TY, CH.step, cx - 32, G.pad + (G.qh - lineH(TY.rowSub, 'normal', CH.step)) / 2, TY.rowSub, 500, P.ink2, { align: 'right' });
      CH.options.forEach((op, i) => {
        const o = G.opts[i], ok = E.out3(seg(t, T(ch.opts[i]), T(ch.opts[i]) + 0.3)), on = i === pick ? sel : 0;
        xf(ctx, { o: ok, x: 20 * (1 - ok), left: G.pad, top: o.y }, () => {
          box(ctx, 0, 0, G.iw, o.h, 18, on > 0 ? P.bubble : P.paper, { stroke: [on > 0 ? 2.5 : 1.5, on > 0 ? P.line : P.rule] });
          const my = o.h / 2;
          box(ctx, 20, my - 20, 40, 40, 20, P.bubble);
          textAt(ctx, TY, 'ABCD'[i], 40, my - lineH(TY.rowSub, 'normal', 'A') / 2, TY.rowSub, 700, P.ink, { align: 'center' });
          const ty0 = my - (o.lh + o.dh) / 2;
          textAt(ctx, TY, op.label, 80, ty0, TY.row, 600, P.ink);
          if (i === pick) pill(ctx, TY, P, 80 + textW(ctx, TY, op.label, TY.row, 600) + 14, ty0 + (o.lh - pillH) / 2, REC, { bg: P.line, color: P.onLine, w: 600 });
          if (op.desc) textAt(ctx, TY, op.desc, 80, ty0 + o.lh + 4, TY.rowSub, 400, P.ink2);
          textAt(ctx, TY, '→', G.iw - 24, my - lineH(TY.row, 'normal', '→') / 2, TY.row, 500, P.ink2, { align: 'right' });
        });
      });
      box(ctx, G.pad + 0.75, G.foot + 0.75, G.iw - 160, 58.5, 20, P.paper, { stroke: [1.5, P.rule] });
      textAt(ctx, TY, UI.input, G.pad + 22, G.foot + (60 - lineH(TY.rowSub, 'normal', UI.input)) / 2, TY.rowSub, 400, P.ink2);
      textAt(ctx, TY, SKIP, X.w - G.pad - 20, G.foot + (60 - lineH(TY.rowSub, 'normal', SKIP)) / 2, TY.rowSub, 500, P.ink2, { align: 'right' });
    }));
    // the cursor comes in and picks the recommended option
    const o = G.opts[pick], px = X.x + G.pad + G.iw * 0.62, py = X.y + o.y + o.h / 2;
    const m0 = T(ch.cur), m1 = T(ch.sel), ca = seg(t, c0 + 0.3, c0 + 0.5) * (1 - seg(t, f0, f0 + 0.2));
    const mk = E.io2(seg(t, m0, m1));
    if (ca > 0) q('blocks', 10, (ctx) => cursor(ctx, P, 'desk', lerp(X.x + X.w - 60, px, mk), lerp(X.y + G.h + 80, py, mk), t > m1 && t < m1 + 0.12 ? 0.9 : 1, ca));
  };

  const renderEvening = (t) => {
    const e = sc.evening, g = listGeo(t);
    if (g.w < 1) return;
    const n = listCount(t), nq = CAP != null ? Math.max(0, n - CAP) : e.k.burst.filter((x, i) => i >= e.s.more - 2 && t >= e.start + x).length;
    const times = [...e.s.asks.map((_, i) => e.start + e.k.asks[i] + 0.2 * B), ...e.k.burst.map((x) => e.start + x)];
    q('blocks', 2, (ctx) => {
      const X = L.LIST.x, Y = L.LIST.y;
      box(ctx, X, Y, g.w, L.LIST.h, 30, P.paper, { shadow: shadowOf(0.42) });
      ctx.save(); ctx.beginPath(); ctx.roundRect(X, Y, g.w, L.LIST.h, Math.min(30, g.w / 2)); ctx.clip();
      const headH = Math.max(lineH(TY.row, 'normal', UI.tasks), pillH), hy = Y + 26;
      textAt(ctx, TY, UI.tasks, X + 34, hy + (headH - lineH(TY.row, 'normal', UI.tasks)) / 2, TY.row, 600, P.ink);
      const runS = `${FL.running} ${n - nq}`, qS = `${FL.queued} ${nq}`, pw = (s) => textW(ctx, TY, s, TY.rowSub, 500) + 32;
      if (ev.tabs) { // the filter tabs under the title: all, needs you, running, done, queued
        let tx = X + 34; const ty = hy + headH + 12;
        // done: the tasks finished before the evening (the ask's), counted where the filters carry counts
        [[FL.all, true], [`${FL.needsYou} 0`], [runS], [COUNTED ? `${FL.done} ${STARS.filter((x) => x.launchAt < e.start).length}` : FL.done], [qS]].forEach(([s2, on]) => { tx += pill(ctx, TY, P, tx, ty, s2, on ? { bg: P.ink, color: P.paper } : {}) + 10; });
      } else {
        let px = X + 34 + (L.LIST.w - 68) - (nq ? pw(qS) + 12 : 0) - pw(runS);
        px += pill(ctx, TY, P, px, hy + (headH - pillH) / 2, runS) + 12;
        if (nq) pill(ctx, TY, P, px, hy + (headH - pillH) / 2, qS);
      }
      ctx.beginPath(); ctx.rect(X, Y + EVH, g.w, L.LIST.h - EVH); ctx.clip();
      const by = Y + EVH + 6 - listScrollEased(t);
      const fuEnd = e.k.fu && e.k.fu.after != null ? e.start + e.k.fu.free : e.end;
      const fuK = e.k.fu ? seg(t, e.start + e.k.fu.beam, e.start + e.k.fu.beam + 0.3) * (1 - seg(t, fuEnd - 0.4, fuEnd)) : 0;
      if (fuK > 0) { const ry = by + ev.followUp.to * EVP; box(ctx, X + 16, ry - 4, L.LIST.w - 32, EVP - 4, 16, P.bubble, { stroke: [2, `rgba(${C.line},${(0.9 * fuK).toFixed(2)})`] }); }
      const nAsk = e.s.asks.length, total = nAsk + e.s.more;
      for (let i = 0; i < total; i++) {
        const k = E.outExpo(seg(t, times[i] - 0.05, times[i] + 0.3)); if (k <= 0.001) continue;
        const ry = by + i * EVP; if (ry > Y + L.LIST.h || ry + EVP - 8 < Y + EVH) continue;
        const queued = CAP != null ? i >= CAP : i >= nAsk && i - nAsk >= e.s.more - 2, rc = EVP === 58 ? 25 : EVC;
        xf(ctx, { o: k, b: 5 * (1 - k), left: X + 34, top: ry, x: 30 * (1 - k) }, () => {
          ring(ctx, P, 15, rc, queued ? 0 : (((t * 360 + i * 40) % 360) * Math.PI) / 180, { dashed: queued });
          let x = 30 + 18;
          if (i < nAsk && EVP !== 58) { // two lines: the task, then "running · its progress"
            const s = e.s.asks[i].task, pr = e.s.asks[i].progress, r = queued ? UI.queued : pr ? `${UI.running} · ${pr}` : UI.running;
            const th = lineH(TY.row, 'normal', s), top0 = rc - (th + lineH(TY.rowSub, 'normal', r)) / 2;
            textAt(ctx, TY, s, x, top0, TY.row, 500, P.ink); textAt(ctx, TY, r, x, top0 + th, TY.rowSub, 400, P.ink2);
          } else if (i < nAsk) {
            const s = e.s.asks[i].task; textAt(ctx, TY, s, x, 25 - lineH(TY.row, 'normal', s) / 2, TY.row, 500, P.ink); x += textW(ctx, TY, s, TY.row, 500) + 18;
            const r = `· ${queued ? UI.queued : UI.running}`; textAt(ctx, TY, r, x, 25 - lineH(TY.rowSub, 'normal', r) / 2, TY.rowSub, 400, P.ink2);
          } else {
            const j = i - nAsk, bw = 200 + ((j * 97) % 220); box(ctx, x, rc - 8, bw, 16, 8, P.bubble); x += bw + 18;
            if (queued) { const r = `· ${UI.queued}`; textAt(ctx, TY, r, x, rc - lineH(TY.rowSub, 'normal', r) / 2, TY.rowSub, 400, P.ink2); }
          }
        });
      }
      ctx.restore();
    });
  };

  // evening (optional): the quoted follow-up goes along a beam to its task's star, which flares and is tagged
  const renderFollowUp = (t) => {
    const e = sc.evening, fu = e.k.fu; if (!fu) return;
    const T = (x) => e.start + x, b0 = T(fu.beam), end = e.end;
    if (t < b0 || t > end + 0.1) return;
    const st = STARS.find((x) => x.row === ev.followUp.to), p = st && starState(st, t); if (!p) return;
    const c = PLAN.cardAt(t), a0 = [c.x + c.w, c.y + 80], u = E.io2(seg(t, b0, b0 + 0.6)), out = 1 - seg(t, end - 0.5, end);
    thread(mid, C, arcPts(a0, [p.x, p.y], 0, u, 40), 0.75 * out, 0.7);
    if (u < 1) { const h = arcPts(a0, [p.x, p.y], u, u, 1)[0]; glow(top, h[0], h[1], 34, C.line, 0.7); glow(top, h[0], h[1], 8, C.core, 1); }
    const fl = seg(t, b0 + 0.55, b0 + 0.7) * (1 - seg(t, b0 + 0.9, b0 + 1.8));
    if (fl > 0) { glow(top, p.x, p.y, 120, C.line, 0.5 * fl); glow(top, p.x, p.y, 14, C.core, fl); }
    const tag = ev.followUp.tag || `${ev.asks[ev.followUp.to].task} · ${UI.followUp || (lang === 'zh' ? '续派' : 'follow-up')}`;
    q('texts', 1, (ctx) => xf(ctx, { ...blurIn(t, T(fu.tag), 0.3, end, 0.3), left: p.x + 28, top: p.y + 18 }, () => pill(ctx, TY, P, 0, 0, tag, { bg: P.paper, color: P.ink, w: 600 })));
  };
  // constellation (optional): the new-workspace modal, folded into the workspace's name
  const renderModal = (t) => {
    if (!MD) return;
    const c = sc.constellation, T = (x) => c.start + x, G = geo.modal, X = L.MODAL;
    const m0 = T(c.k.modal), f0 = T(c.k.ws) - 0.25, f1 = f0 + 0.45;
    if (t < m0 || t >= f1) return;
    const inK = E.outExpo(seg(t, m0, m0 + 0.35)), fk = E.io3(seg(t, f0, f1));
    q('blocks', 9, (ctx) => xf(ctx, { o: inK * (1 - seg(fk, 0.5, 1)), b: 6 * (1 - inK), left: lerp(X.x, L.REGION.x + 24, fk), top: lerp(X.y, L.REGION.y + 22, fk), s: lerp(0.95, 1, inK) * lerp(1, 0.15, fk) }, () => {
      box(ctx, 0, 0, X.w, G.h, 28, P.paper, { shadow: shadowOf(0.42) });
      textAt(ctx, TY, MD.title, G.pad, G.pad, 34, 600, P.ink);
      MD.fields.forEach((f, i) => {
        const o = G.fields[i]; textAt(ctx, TY, f.label, G.pad, o.ly, 28, 500, P.ink2);
        if (f.required) textAt(ctx, TY, '*', G.pad + textW(ctx, TY, f.label, 28, 500) + 6, o.ly, 28, 600, P.warn);
        box(ctx, G.pad + 0.75, o.iy + 0.75, X.w - 2 * G.pad - 1.5, o.ih - 1.5, 14, P.paper, { stroke: [1.5, P.rule] });
        textAt(ctx, TY, typed(f.value, t, m0 + 0.35 + i * 0.3, lang), G.pad + 18, o.iy + 12, 30, 400, P.ink);
      });
      if (MD.note) textAt(ctx, TY, MD.note, G.pad, G.ny, 28, 400, P.ink2);
    }));
  };
  // verify (optional): the relation graph — arcs from the thread to one node, each named, then one thick arc back
  const renderGraph = (t) => {
    const v = sc.verify, gr = v.k.gr; if (!gr) return;
    const T = (x) => v.start + x, g = vs.graph, A0 = L.GRAPH.a, B0 = L.GRAPH.b, N = L.GRAPH.node;
    if (t < T(gr.cap) || t > T(gr.out) + 0.45) return;
    const out = 1 - E.in3(seg(t, T(gr.out), T(gr.out) + 0.4)), n = g.outs.length;
    const arc = (dy, u0, u1) => { const cp = [(A0[0] + B0[0]) / 2, 640 + 2 * dy], o = []; for (let j = 0; j <= 40; j++) { const u = lerp(u0, u1, j / 40), r = 1 - u; o.push([r * r * A0[0] + 2 * r * u * cp[0] + u * u * B0[0], r * r * A0[1] + 2 * r * u * cp[1] + u * u * B0[1]]); } return o; };
    const nb = blurIn(t, T(gr.node), 0.35);
    q('blocks', 8, (ctx) => xf(ctx, { o: nb.o * out, b: nb.b, left: N.x, top: N.y }, () => { box(ctx, 0, 0, N.w, N.h, 20, P.paper, { shadow: shadowOf(0.42) }); textAt(ctx, TY, g.node, N.w / 2, (N.h - lineH(TY.row, 'normal', g.node)) / 2, TY.row, 600, P.ink, { align: 'center' }); }));
    g.outs.forEach((s2, i) => {
      const dy = n > 1 ? -250 + (i * 240) / (n - 1) : -130, u = E.io2(seg(t, T(gr.arcs[i]), T(gr.arcs[i]) + 0.5));
      if (u <= 0) return;
      thread(mid, C, arc(dy, 0, u), 0.7 * out, 0.6);
      if (u < 1) { const h = arc(dy, u, u)[0]; glow(top, h[0], h[1], 26, C.glow, 0.7); }
      const pw = textW(M, TY, s2, TY.rowSub, 500) + 32;
      q('texts', 2, (ctx) => xf(ctx, { ...blurIn(t, T(gr.arcs[i]) + 0.25, 0.3), left: 958 - pw / 2, top: 640 + dy - pillH / 2 }, () => { ctx.globalAlpha *= out; pill(ctx, TY, P, 0, 0, s2, { bg: P.paper, color: P.ink, w: 600 }); }));
    });
    const ru = E.io2(seg(t, T(gr.ret), T(gr.ret) + 0.7));
    if (ru > 0) {
      const pts = arc(200, 1 - ru, 1).reverse();
      thread(mid, C, pts, out, 1.7);
      if (ru < 1) { const h = pts[pts.length - 1]; glow(top, h[0], h[1], 50, C.line, 0.8); glow(top, h[0], h[1], 12, C.core, 1); }
      const px = TY.row, bw = textW(M, TY, g.back, px, 700) + 56, bh = lineH(px, 'normal', g.back) + 22;
      q('texts', 2, (ctx) => xf(ctx, { ...blurIn(t, T(gr.ret) + 0.5, 0.3), left: 958 - bw / 2, top: 840 - bh / 2 }, () => {
        ctx.globalAlpha *= out; box(ctx, 0, 0, bw, bh, bh / 2, P.line, { shadow: { color: `rgba(${C.line},0.6)`, oy: 0, blur: 30 } }); textAt(ctx, TY, g.back, bw / 2, 11, px, 700, P.onLine, { align: 'center' });
      }));
    }
  };
  // cards (optional): the earlier tasks' beams light again, knot into a tangle, the thread reaches its loose end and pulls
  // three strands straight (the stream template's s6 tangle: the same seed, centre and loose end)
  const TG = cd.tangle && sc.cards.k.tg ? (() => {
    const old = STARS.filter((x) => !x.queued && x.launchAt < sc.cards.start).slice(0, 7), rnd = mulberry32(606), N = 120, X0 = L.SPINE_X;
    const curves = old.map((st, k) => { const y0 = 300 + ((k * 73) % 240); return { st, base: arcPts([X0, y0], [st.x, st.y], 0, 1, N - 1), f: [1 + rnd() * 1.4, 1.6 + rnd() * 1.6, 1 + rnd() * 1.3, 2 + rnd() * 1.5, 1 + rnd()], ph: Array.from({ length: 5 }, () => rnd() * 6.28), rx: 300 + rnd() * 100, ry: 210 + rnd() * 70, spin: 0.22 + 0.06 * k }; });
    return { curves, N, X0, CX: 1330, CY: 620, TE: [960, 610] };
  })() : null;
  // the cards' places: three at the template's tops, two between them; one card opens at once where a card is enlarged
  // (L.ZOOM) and is read there, its strand straight into it
  const NC = cd.cards.length, CYS = NC === 3 ? L.CARD.ys : NC === 2 ? [435, 645] : [L.CARD.ys[1]], CX0 = NC === 1 ? L.ZOOM.x : L.CARD.x;
  const ONE = NC === 1 ? (() => { const s2 = L.ZOOM.s, h = geo.cards[0].h1; return { x: L.ZOOM.x, y: Math.max(260, 600 - (h * s2) / 2), s: s2, h, a: 1, z: 1 }; })() : null;
  const strandY = (i) => (ONE ? ONE.y + (ONE.h * ONE.s) / 2 : CYS[i] + geo.cards[i].h0 / 2);
  const renderTangle = (t) => {
    if (!TG) return;
    const c = sc.cards, g = c.k.tg, T = (x) => c.start + x, { curves, N, X0, CX, CY, TE } = TG;
    if (t < T(g.relight) || t >= T(c.k.fork)) return;
    const lt = t - c.start, T2 = Math.PI * 2;
    const tp = (cv, k, u) => {
      const x = cv.rx * Math.sin(T2 * cv.f[0] * u + cv.ph[0]) + 110 * Math.sin(T2 * cv.f[1] * u + cv.ph[1]);
      const y = cv.ry * Math.cos(T2 * cv.f[2] * u + cv.ph[2]) + 80 * Math.sin(T2 * cv.f[3] * u + cv.ph[3]);
      const z = Math.sin(T2 * cv.f[4] * u + cv.ph[4]), th = lt * cv.spin;
      let p = [CX + x * Math.cos(th) + z * 220 * Math.sin(th), CY + y];
      if (k < NC) { const h = E.io2(Math.min(1, u / 0.14)); p = [lerp(TE[0], p[0], h), lerp(TE[1], p[1], h)]; }
      return p;
    };
    const K = E.io2(seg(t, T(g.knot0), T(g.knot1))), Pk = seg(t, T(g.pull0), T(g.pull1));
    const relight = seg(t, T(g.relight), T(g.knot0));
    curves.forEach((cv, i) => {
      const pts = [];
      for (let j = 0; j < N; j++) {
        const u = j / (N - 1); let p = K <= 0 ? cv.base[j] : (() => { const q2 = tp(cv, i, u); return K >= 1 ? q2 : [lerp(cv.base[j][0], q2[0], K), lerp(cv.base[j][1], q2[1], K)]; })();
        if (i < NC && Pk > 0) { const m = E.io2(clamp(Pk * 1.5 - u * 0.5)); const tg = [lerp(X0, CX0, u), strandY(i)]; p = [lerp(p[0], tg[0], m), lerp(p[1], tg[1], m)]; }
        pts.push(p);
      }
      const grow = seg(t, T(g.relight) + i * 0.06, T(g.knot0) + i * 0.06);
      const a = i < NC ? lerp(0.55, 1, E.io2(seg(Pk, 0.2, 1))) : 0.5 * (1 - seg(Pk, 0.15, 0.75)), w = i < NC ? lerp(0.5, 0.75, E.io2(seg(Pk, 0.2, 1))) : 0.45;
      thread(mid, C, grow < 1 ? pts.slice(0, Math.max(2, Math.ceil(E.out3(grow) * N))) : pts, a, w);
      const el = E.out3(relight) * (1 - seg(t, T(g.knot0) + 0.5, T(g.knot1)));
      if (el > 0) { glow(top, cv.st.x, cv.st.y, 34, C.glow, 0.7 * el); glow(top, cv.st.x, cv.st.y, 8, C.core, el); }
    });
    const hint = seg(t, T(g.knot1) - 0.4, T(g.reach)) * (1 - seg(t, T(g.pull1) - 0.3, T(g.pull1)));
    if (t >= T(g.reach) && t < T(g.pull1)) {
      const gk = E.out3(seg(t, T(g.reach), T(g.pull0)));
      const end = Pk > 0 ? [lerp(TE[0], X0, E.io2(Pk)), lerp(TE[1], strandY(Math.min(1, NC - 1)), E.io2(Pk))] : [lerp(X0, TE[0], gk), TE[1]];
      thread(mid, C, [[X0, 610], end], 1, 0.9); glow(top, end[0], end[1], 34 + 10 * Math.sin(t * 9), C.glow, 0.85); glow(top, end[0], end[1], 9, C.core, 1);
    } else if (hint > 0) { glow(top, TE[0], TE[1], 40, C.glow, 0.7 * hint); glow(top, TE[0], TE[1], 9, C.core, hint); }
  };
  // cards (optional): a card's new task, hooked off the spine, running, then leaving as a star
  const renderCardTask = (t) => {
    const c = sc.cards, T = (x) => c.start + x;
    cd.cards.forEach((card, i) => {
      const z = c.k.zoom[i]; if (!card.task || !z.task) return;
      const r0 = T(z.task.row), launch = T(z.task.launch), done = launch - 0.3;
      if (t < r0 || t > launch + 0.5) return;
      const R = L.TASK, H0 = 56 + rowStack(card.task.title, card.task.detail || UI.running);
      const inK = E.outExpo(seg(t, r0, r0 + 0.35)), outK = E.in3(seg(t, launch - 0.05, launch + 0.3)), dk = seg(t, done, done + 0.2);
      const origin = outK > 0 ? [52, 50] : [0, H0 / 2];
      q('blocks', 31, (ctx) => xf(ctx, { o: inK * (1 - seg(outK, 0.7, 1)), left: R.x, top: R.y, ox: origin[0], oy: origin[1], sx: lerp(0.2, 1, inK) * (1 - outK), sy: lerp(0.9, 1, inK) * (1 - outK) }, () => {
        box(ctx, 0, 0, R.w, H0, 28, P.paper, { shadow: shadowOf(0.42) });
        const sub = card.task.detail || UI.running, st = rowStack(card.task.title, sub), ry = 28 + (st - 30) / 2, th = lineH(TY.row, 'normal', card.task.title);
        if (dk > 0.5) tick(ctx, P, 32, ry); else ring(ctx, P, 47, ry + 15, ((t * 360) % 360) * Math.PI / 180);
        textAt(ctx, TY, card.task.title, 80, 28, TY.row, 600, P.ink);
        textAt(ctx, TY, sub, 80, 28 + th, TY.rowSub, 400, P.ink2, { alpha: 1 - dk });
        textAt(ctx, TY, UI.done, 80, 28 + th, TY.rowSub, 400, P.ink2, { alpha: dk });
      }));
      const y = R.y + H0 / 2;
      if (inK > 0 && outK < 1) { thread(mid, C, straight([L.SPINE_X, y], [lerp(L.SPINE_X, R.x, inK), y], 12), 0.85 * (1 - outK), 0.7); glow(mid, L.SPINE_X, y, 18, C.glow, 0.7 * (1 - outK)); }
    });
  };
  // days (optional scene): a chat window where days scroll past, the progress flows back along the strands to the
  // mascot, one short line hangs under each card
  const DAYS = DS ? (() => {
    const k = sc.days.k, A0 = sc.days.start, items = [];
    DS.days.forEach((d, i) => { items.push({ who: 'day', text: d.day, at: A0 + k.day[i] }); items.push({ who: 'user', text: d.user, at: A0 + k.day[i] + 0.08 }); items.push({ who: 'bot', text: d.bot, at: A0 + k.day[i] + 0.16 }); });
    items.push({ who: 'user', text: DS.ask, at: A0 + k.ask }); items.push({ who: 'bot', text: DS.answer, at: A0 + k.answer });
    let y = 34; items.forEach((o) => { o.g = o.who === 'day' ? { w: 0, h: lineH(TY.rowSub, 'normal', o.text) + 8 } : bubbleOf(M, TY, o.text, lang, BW); o.y = y; y += o.g.h + 18; });
    return { items, notes: DS.notes.map((x) => ({ text: x, w: textW(M, TY, x, TY.rowSub, 500) + 32 })) };
  })() : null;
  const renderDays = (t) => {
    if (!DAYS) return;
    const d = sc.days, k = d.k, T = (x) => d.start + x, G = L.G1;
    if (t < T(k.win) || t > d.end + 0.6) return;
    const inK = E.io3(seg(t, T(k.win), T(k.win) + 0.45)), fk = E.io3(seg(t, T(k.fold), T(k.fold) + 0.4)), w = G.w * inK * (1 - fk);
    const hy = G.y + 64;
    if (w > 1) {
      thread(mid, C, [[L.SPINE_X, hy], [G.x + 6, hy]], 0.9, 0.7); glow(mid, L.SPINE_X, hy, 22, C.glow, 0.7);
      let bottom = 34; DAYS.items.forEach((o, i) => { const kk = E.out3(seg(t, o.at - 0.12, o.at + 0.3)); if (kk > 0) bottom = lerp(i ? DAYS.items[i - 1].y + DAYS.items[i - 1].g.h : 34, o.y + o.g.h, kk); });
      const off = Math.max(0, bottom - (G.h - 120));
      q('blocks', 0, (ctx) => {
        box(ctx, G.x, G.y, w, G.h, 34, P.paper, { shadow: shadowOf(0.42) });
        ctx.save(); ctx.beginPath(); ctx.roundRect(G.x, G.y, w, G.h, Math.min(34, w / 2)); ctx.clip();
        const fx = G.x + 30, fw = G.w - 60, fy = G.y - off;
        DAYS.items.forEach((o) => {
          const kk = E.outExpo(seg(t, o.at - 0.12, o.at + 0.3)); if (kk <= 0.001) return;
          if (o.who === 'day') { const tw = textW(ctx, TY, o.text, TY.rowSub, 500); ctx.save(); ctx.globalAlpha *= kk; ctx.fillStyle = P.rule; ctx.fillRect(fx, fy + o.y + o.g.h / 2, (fw - tw) / 2 - 16, 1.5); ctx.fillRect(fx + (fw + tw) / 2 + 16, fy + o.y + o.g.h / 2, (fw - tw) / 2 - 16, 1.5); ctx.restore(); textAt(ctx, TY, o.text, fx + fw / 2, fy + o.y + 4, TY.rowSub, 500, P.ink2, { align: 'center', alpha: kk }); }
          else if (o.who === 'bot') xf(ctx, { o: kk, b: 6 * (1 - kk), left: fx, top: fy + o.y }, () => drawBubble(ctx, TY, P, o.g, 'bot', 0, 0));
          else xf(ctx, { o: kk, b: 6 * (1 - kk), left: fx + fw - o.g.w, top: fy + o.y, x: 40 * (1 - kk) }, () => drawBubble(ctx, TY, P, o.g, 'user', 0, 0));
        });
        const iy = G.y + G.h - 24 - 66;
        box(ctx, G.x + 26.75, iy + 0.75, G.w - 52 - 1.5, 64.5, 22, P.paper, { stroke: [1.5, P.rule] });
        textAt(ctx, TY, UI.input, G.x + 26 + 1.5 + 24, iy + 1.5, TY.rowSub, 400, P.ink2, { lh: 63 / TY.rowSub });
        ctx.restore();
      });
    }
    // the progress: a bead from each card back along its strand to the spine and up to the mascot
    [0, 1, 2].forEach((i) => {
      const qq = seg(t, T(k.beads) + i * 0.25, T(k.beads) + i * 0.25 + 1.3); if (qq <= 0 || qq >= 1) return;
      const sy = strandY(i), path = [[L.CARD.x, sy], [L.SPINE_X, sy], [L.SPINE_X, L.MASCOT[1] + 34]], Ls = [0, L.CARD.x - L.SPINE_X, L.CARD.x - L.SPINE_X + sy - L.MASCOT[1] - 34];
      const p = atLen(path, Ls, Ls[2] * E.io2(qq)); glow(top, p[0], p[1], 24, C.glow, 0.85); glow(top, p[0], p[1], 7, C.core, 1);
    });
    const ml = seg(t, T(k.beads) + 1.2, T(k.beads) + 1.4) * (1 - seg(t, T(k.beads) + 1.8, T(k.beads) + 2.6));
    if (ml > 0) glow(top, L.MASCOT[0], L.MASCOT[1], 110, C.line, 0.5 * ml);
    // a short line hangs on each card (its right side) until the closing sweep folds the cards
    const off2 = sc.close.start + 0.05;
    if (DS.summary) { renderSummary(t, off2); return; }
    DAYS.notes.forEach((nt, i) => {
      const y = L.CARD.ys[i] + geo.cards[i].h0 / 2 - pillH / 2;
      q('blocks', 21, (ctx) => xf(ctx, { ...blurIn(t, T(k.notes[i]), 0.3, off2, 0.3), left: L.CARD.x + L.CARD.w - nt.w - 28, top: y }, () => pill(ctx, TY, P, 0, 0, nt.text, { bg: P.paper, color: P.ink, w: 500 })));
    });
  };

  // days with `summary`: the three cards fold into one summary card (its title, a rule, the lines hung inside it), which
  // the closing sweep folds as it folds the cards
  const summaryK = (t) => (DS?.summary ? E.io3(seg(t, sc.days.start + sc.days.k.win, sc.days.start + sc.days.k.win + 0.5)) : 0);
  const renderSummary = (t, off2) => {
    const d = sc.days, k = d.k, T = (x) => d.start + x, clo = sc.close;
    const mk = summaryK(t); if (mk <= 0) return;
    const fold = clo.start + 0.05, foldEnd = clo.start + clo.k.gA - 0.05, fk = E.in3(seg(t, fold + 0.06, foldEnd));
    if (t >= foldEnd + 0.1) return;
    const X = L.CARD.x, Y = L.CARD.ys[0], H = L.CARD.ys[2] + geo.cards[2].h0 - Y, th = lineH(TY.cardTitle, 'normal', DS.summary);
    // optional rows under the title (`summaryRows`, as the cards it gathers: "Summary", "Files"), and the three lines
    // large under the rule (`bigNotes`) instead of small tags
    const rows = DS.summaryRows || [], RH = 64, IW = L.CARD.w - 72;
    let ry = 28 + th + 22;
    const rowY = rows.map(() => { const y0 = ry; ry += RH + 14; return y0; });
    const ruleY = rows.length ? ry + 6 : 28 + th + 18;
    const big = DS.bigNotes ? DAYS.notes.map((nt) => { const w0 = textW(M, TY, nt.text, TY.cardTitle + 2, 600); return { px: Math.min(TY.cardTitle + 2, ((TY.cardTitle + 2) * IW) / Math.max(1, w0)) }; }) : null;
    q('blocks', 21, (ctx) => xf(ctx, { o: mk * (1 - seg(fk, 0.6, 1)), left: X, top: Y, oy: H / 2, sx: lerp(0.94, 1, mk) * (1 - fk), sy: lerp(0.94, 1, mk) * (1 - 0.6 * fk) }, () => {
      box(ctx, 0, 0, L.CARD.w, H, 28, P.panel, { shadow: shadowOf(0.45) });
      box(ctx, 1, 1, L.CARD.w - 2, H - 2, 27, null, { stroke: [2, `rgba(${C.line},0.55)`] });
      textAt(ctx, TY, DS.summary, 36, 28, TY.cardTitle, 600, P.text);
      rows.forEach((r, i) => {
        const rk = E.out3(seg(t, T(k.win) + 0.2 + i * 0.12, T(k.win) + 0.55 + i * 0.12));
        xf(ctx, { o: rk, x: 20 * (1 - rk), left: 36, top: rowY[i] }, () => {
          box(ctx, 0, 0, IW, RH, 16, P.panel2); box(ctx, 0.75, 0.75, IW - 1.5, RH - 1.5, 16, null, { stroke: [1.5, `rgba(${C.line},0.35)`] });
          textAt(ctx, TY, r, 24, (RH - lineH(TY.cardRow, 'normal', r)) / 2, TY.cardRow, 600, P.text);
        });
      });
      ctx.fillStyle = `rgba(${C.line},0.35)`; ctx.fillRect(36, ruleY, IW, 1.5);
      DAYS.notes.forEach((nt, i) => {
        const b = blurIn(t, T(k.notes[i]), 0.3, off2, 0.3);
        if (big) xf(ctx, { ...b, left: 36, top: ruleY + 22 + i * 64 }, () => textAt(ctx, TY, nt.text, 0, 0, big[i].px, 600, P.text));
        else xf(ctx, { ...b, left: 36, top: (rows.length ? ruleY + 26 : 28 + th + 44) + i * (pillH + 26) }, () => pill(ctx, TY, P, 0, 0, nt.text, { bg: P.paper, color: P.ink, w: 500 }));
      });
    }));
  };

  const renderConst = (t) => {
    const c = sc.constellation, k = c.k, T = (x) => c.start + x;
    const off = sc.verify.start + 0.4 * B;
    const reg = blurIn(t, T(k.ws), 0.4, off + 0.3, 0.4, 4), regS = lerp(0.97, 1, E.out3(seg(t, T(k.ws), T(k.ws) + 0.4)));
    q('blocks', 3, (ctx) => xf(ctx, { o: reg.o * 0.9, b: reg.b, s: regS, left: L.REGION.x, top: L.REGION.y }, () => box(ctx, 1, 1, L.REGION.w - 2, L.REGION.h - 2, 27, null, { stroke: [2, `rgba(${C.text2},0.45)`, [7, 5]] })));
    const hb = blurIn(t, T(k.ws) + 0.15, 0.3, off + 0.3, 0.3);
    if (cs.head) { // the workspace's header (`head`): its name as a space chip, then the filter row with live counts
      const jobs = CONST.stars, P0 = CONST.plan, fin = (s) => t >= s.ret + 0.6;
      const run = jobs.filter((s) => t >= s.launchAt && !fin(s)).length + (t >= CONST.link ? 1 : 0), done = jobs.filter(fin).length, queued = t >= P0.launchAt && t < CONST.link ? 1 : 0;
      q('blocks', 4, (ctx) => xf(ctx, { ...hb, left: L.REGION.x, top: L.REGION.y }, () => {
        box(ctx, 0, 0, L.REGION.w, geo.wsHead.h, [27, 27, 18, 18], P.paper, { shadow: shadowOf(0.42) });
        spaceChip(ctx, 20, 18, cs.workspace);
        let x = 26; const y = 18 + geo.wsHead.chip + 14;
        [[FL.all, true], [`${FL.needsYou} 0`], [`${FL.running} ${run}`], [`${FL.done} ${done}`], [`${FL.queued} ${queued}`]].forEach(([s2, on]) => { if (x + textW(ctx, TY, s2, TY.rowSub, 500) + 32 > L.REGION.w - 20) return; x += pill(ctx, TY, P, x, y, s2, on ? { bg: P.ink, color: P.paper } : {}) + 10; });
      }));
    } else q('blocks', 4, (ctx) => xf(ctx, { ...hb, left: L.REGION.x + 24, top: L.REGION.y + 22 }, () => {
      box(ctx, 0, 0, geo.regionHead.w, geo.regionHead.h, 20, P.panel, { shadow: shadowOf(0.45) });
      box(ctx, 1, 1, geo.regionHead.w - 2, geo.regionHead.h - 2, 19, null, { stroke: [2, `rgba(${C.line},0.55)`] });
      textAt(ctx, TY, regionHead, 24, 14, TY.label, 600, P.text);
    }));
    const beamA = 1 - seg(t, off, off + 0.4);
    const all = [...CONST.stars, CONST.plan];
    all.forEach((s, i) => {
      if (t < s.launchAt) return;
      const u = E.io2(seg(t, s.launchAt, s.launchAt + 0.6));
      thread(mid, C, arcPts(CONST.origin, [s.x, s.y], 0, u, 40), 0.42 * beamA, 0.6);
      if (s.ret) { const qq = seg(t, s.ret, s.ret + 0.7); if (qq > 0 && qq < 1) { const p = arcPts(CONST.origin, [s.x, s.y], 1 - E.io2(qq), 1 - E.io2(qq), 1)[0]; glow(mid, p[0], p[1], 30, C.glow, 0.8); glow(mid, p[0], p[1], 7, C.core, 1); } }
      const lb = blurIn(t, s.launchAt + 0.45, 0.3, off + 0.2, 0.3);
      const sw = i < 3 ? seg(t, s.ret + 0.6, s.ret + 0.8) : seg(t, CONST.link, CONST.link + 0.2);
      const a1 = i < 3 ? UI.running : cs.plan.waits, b1 = i < 3 ? UI.done : UI.running, lh = lineH(TY.label, 'normal', s.label);
      q('texts', 1, (ctx) => xf(ctx, { ...lb, left: s.x + 26, top: s.y - 20 }, () => {
        label(ctx, s.label, 0, 0, TY.label, 600, P.text);
        label(ctx, a1, 0, lh, TY.labelSub, 400, P.text2, 1 - sw);
        label(ctx, b1, 0, Math.round(TY.label * TY.lead), TY.labelSub, 400, P.text2, sw);
      }));
    });
    if (t >= T(k.ws) && t < off + 0.5) glow(mid, CONST.origin[0], CONST.origin[1], 26, C.glow, 0.7 * beamA);
    const lk = seg(t, CONST.link - 0.3, CONST.link + 0.5);
    if (lk > 0 && beamA > 0) {
      const P4 = all.map((s) => [s.x, s.y]);
      [[0, 3], [1, 3], [2, 3], [0, 1], [1, 2]].forEach(([a, b], j) => { const qq = E.io2(clamp(lk * 1.6 - j * 0.15)); if (qq > 0) thread(mid, C, straight(P4[a], [lerp(P4[a][0], P4[b][0], qq), lerp(P4[a][1], P4[b][1], qq)], 12), 0.75 * beamA, 0.55); });
      const fl = seg(t, CONST.link, CONST.link + 0.1) * (1 - seg(t, CONST.link + 0.2, CONST.link + 1.2));
      if (fl > 0) glow(top, CONST.plan.x, CONST.plan.y, 220, C.line, 0.35 * fl);
    }
  };

  const renderVerify = (t) => {
    const v = sc.verify, k = v.k, T = (x) => v.start + x;
    const GX = 1400, GY0 = 400, GY1 = 860, Y = 600;
    const end = T(k.fold) + 0.4;
    if (t < v.start || t > end + 0.1) return;
    const out = E.in3(seg(t, T(k.fold), end));
    const gk = E.outExpo(seg(t, T(k.gate), T(k.gate) + 0.5));
    const gh = ((GY1 - GY0) / 2) * gk, gc = (GY0 + GY1) / 2;
    const passK = seg(t, T(k.pass) - 0.15, T(k.pass) + 0.1) * (1 - 0.5 * seg(t, T(k.pass) + 0.3, T(k.pass) + 1));
    const hitK = seg(t, T(k.hit) - 0.02, T(k.hit) + 0.05) * (1 - seg(t, T(k.hit) + 0.1, T(k.hit) + 0.5));
    thread(mid, C, straight([GX, gc - gh], [GX, gc + gh], 10), (0.8 + 0.2 * passK) * (1 - out), 1.1 + 0.8 * passK);
    if (hitK > 0) { glow(top, GX, Y, 200, C.core, 0.55 * hitK); glow(top, GX, Y, 60, C.core, 0.9 * hitK); }
    const gw = textW(M, TY, vs.gate, TY.labelSub, 400);
    q('texts', 2, (ctx) => xf(ctx, { ...blurIn(t, T(k.gate) + 0.2, 0.3, end, 0.3), left: GX - gw / 2, top: GY0 - 56 }, () => label(ctx, vs.gate, 0, 0, TY.labelSub, 400, P.text2)));
    const w = geo.vchip.w, h = geo.vchip.h, xStart = 1010, xGate = GX - w - 8, xBack = 990, xPast = GX + 40;
    let x = xStart;
    x = lerp(x, xGate, E.in3(seg(t, T(k.go1), T(k.hit))));
    x = lerp(x, xBack, E.outExpo(seg(t, T(k.hit), T(k.hit) + 0.45)));
    x = lerp(x, xGate, E.io2(seg(t, T(k.go2), T(k.go2) + 0.6 * (T(k.pass) - T(k.go2)))));
    x = lerp(x, xPast, E.out3(seg(t, T(k.go2) + 0.6 * (T(k.pass) - T(k.go2)), T(k.pass) + 0.2)));
    const ink = blurIn(t, v.start + 0.2, 0.35, end, 0.3);
    const ringOn = t >= T(k.rework) && t < T(k.go2), passed = t >= T(k.pass);
    q('blocks', 5, (ctx) => xf(ctx, { o: ink.o, b: ink.b, left: x, top: Y - h / 2, s: 1 - 0.04 * hitK }, () => {
      box(ctx, 0, 0, w, h, 24, P.paper, { shadow: shadowOf(0.42) });
      if (passed) box(ctx, -1.5, -1.5, w + 3, h + 3, 25.5, null, { stroke: [3, `rgba(${C.line},${(0.9 * (1 - out)).toFixed(2)})`] });
      doc(ctx, P, 28, (h - 36) / 2);
      textAt(ctx, TY, vs.item, 28 + 30 + 18, (h - lineH(TY.row, 'normal', vs.item)) / 2, TY.row, 600, P.ink);
      if (ringOn) ring(ctx, P, w - 28 - 15, h / 2, ((t * 420) % 360) * Math.PI / 180);
    }));
    const c = PLAN.cardAt(t);
    if (c.w > 1) thread(mid, C, straight([c.x + c.w, Y], [x, Y], 16), 0.7 * ink.o, 0.6);
    q('texts', 3, (ctx) => xf(ctx, { ...blurIn(t, T(k.hit) + 0.15, 0.3, T(k.rework) + 0.2, 0.25), left: x, top: Y + h / 2 + 18 }, () => label(ctx, vs.fail, 0, 0, TY.labelSub, 400, P.text2)));
    q('texts', 4, (ctx) => xf(ctx, { ...blurIn(t, T(k.pass) + 0.1, 0.3, end, 0.3), left: xPast, top: Y + h / 2 + 18 }, () => {
      const lh = lineH(TY.label, 'normal', vs.pass), bl = baseline(TY.label, 'normal', 0, vs.pass);
      ctx.save(); ctx.translate(6 + 8, bl - 4 - 13); ctx.rotate(Math.PI / 4); ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(6, -13); ctx.lineTo(6, 13); ctx.lineTo(-6, 13); ctx.stroke(); ctx.restore();
      label(ctx, vs.pass, 40, 0, TY.label, 600, P.text); void lh;
    }));
  };

  const cardGeo = (k, t) => {
    const c = sc.cards, kk = c.k, T = (x) => c.start + x;
    if (ONE) return ONE;
    const base = { x: L.CARD.x, y: CYS[k], h: geo.cards[k].h0 };
    let z = 0, dim = 0;
    kk.zoom.forEach((zz, j) => {
      const zEnd = j + 1 < kk.zoom.length ? T(kk.zoom[j + 1].z0) : T(kk.whole);
      const qq = E.io3(seg(t, T(zz.z0), T(zz.z0) + 0.55)) * (1 - E.io3(seg(t, zEnd, zEnd + 0.55)));
      if (j === k) z = qq; else dim = Math.max(dim, qq);
    });
    const Z = { x: L.ZOOM.x, y: Math.max(260, 600 - (geo.cards[k].h1 * L.ZOOM.s) / 2), s: L.ZOOM.s, h: geo.cards[k].h1 };
    return { x: lerp(base.x, Z.x, z) + 90 * dim * (1 - z), y: lerp(base.y, Z.y, z), s: lerp(1, Z.s, z), h: lerp(base.h, Z.h, z), a: lerp(1, 0.3, dim * (1 - z)), z };
  };
  const renderCards = (t) => {
    const c = sc.cards, k = c.k, T = (x) => c.start + x;
    const clo = sc.close, fold = clo.start + 0.05, foldEnd = clo.start + clo.k.gA - 0.05;
    const vis = t >= T(k.fork) && t < foldEnd + 0.1;
    cd.cards.forEach((card, i) => {
      if (!vis || t < T(k.land[i]) - 0.4) return;
      const g = cardGeo(i, t);
      const fk = E.in3(seg(t, fold + i * 0.06, foldEnd));
      const inK = E.outExpo(seg(t, T(k.land[i]), T(k.land[i]) + 0.4));
      const sk = DS?.summary ? 1 - summaryK(t) : 1; // under the days' summary card
      q('blocks', g.z > 0.01 ? 30 : 20, (ctx) => xf(ctx, { o: g.a * inK * (1 - seg(fk, 0.6, 1)) * sk, left: g.x, top: g.y, oy: g.h / 2, sx: g.s * lerp(0.15, 1, inK) * (1 - fk), sy: g.s * (1 - 0.6 * fk) }, () => {
        box(ctx, 0, 0, L.CARD.w, g.h, 28, P.panel, { shadow: shadowOf(0.45) });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, L.CARD.w, g.h, Math.min(28, g.h / 2)); ctx.clip();
        let y = 28; const th = lineH(TY.cardTitle, 'normal', card.title);
        textAt(ctx, TY, card.title, 36, y, TY.cardTitle, 600, P.text); y += th + 4;
        textAt(ctx, TY, card.sub, 36, y, TY.cardSub, 400, P.text2); y += lineH(TY.cardSub, 'normal', card.sub);
        rowsOf(card).forEach((r, j) => {
          y += 14; const zz = k.zoom[i], rt = j < card.rows.length ? zz.rows[j] : zz.flow.t1, rk = E.out3(seg(t, T(rt), T(rt) + 0.3)), rh = cardRowH(r);
          xf(ctx, { o: rk * g.z, x: 20 * (1 - rk), left: 36, top: y }, () => { box(ctx, 0, 0, L.CARD.w - 72, rh, 16, P.panel2); box(ctx, 0.75, 0.75, L.CARD.w - 73.5, rh - 1.5, 16, null, { stroke: [1.5, `rgba(${C.line},0.35)`] }); textAt(ctx, TY, r, 21.5, 13.5, TY.cardRow, 400, P.text); });
          y += rh;
        });
        ctx.restore();
        box(ctx, 1, 1, L.CARD.w - 2, g.h - 2, 27, null, { stroke: [2, `rgba(${C.line},0.55)`] });
      }));
      const ex = g.x * (1 - fk) + L.SPINE_X * fk, ey = g.y + (g.h * g.s) / 2;
      const sy = strandY(i);
      const draw = TG ? 1 : E.io2(seg(t, T(k.fork) + i * 0.5 * B, T(k.land[i])));
      const tipX = lerp(L.SPINE_X, ex, draw);
      const pts = []; for (let j = 0; j <= 30; j++) { const f = j / 30, x = lerp(L.SPINE_X, tipX, f); const yy = lerp(sy, ey, E.io2(clamp(((x - L.SPINE_X) / Math.max(1, ex - L.SPINE_X)) * 1.4 - 0.4))); pts.push([x, yy]); }
      thread(mid, C, pts, (0.95 - 0.5 * (1 - g.a)) * (1 - seg(fk, 0.9, 1)), 0.75);
      glow(mid, L.SPINE_X, sy, 18, C.glow, 0.6 * draw * (1 - fk));
      const fl = k.zoom[i].flow; // the line that flows along the strand into the card
      if (fl) { const qq = seg(t, T(fl.t0), T(fl.t1)); if (qq > 0 && qq < 1) { const p = pts[Math.round(E.io2(qq) * 30)]; glow(top, p[0], p[1], 26, C.glow, 0.85); glow(top, p[0], p[1], 7, C.core, 1); const pw = textW(M, TY, card.flow, TY.rowSub, 500) + 32; q('texts', 9, (ctx) => xf(ctx, { o: seg(qq, 0, 0.15) * (1 - seg(qq, 0.85, 1)), left: p[0] - pw / 2, top: p[1] - pillH - 18 }, () => pill(ctx, TY, P, 0, 0, card.flow, { bg: P.paper, color: P.ink }))); } }
    });
    q('texts', 8, (ctx) => runAt(ctx, TY, capsub, L.CAP[0], capTop2, P.text2, t, T(k.cap2), sc.days ? sc.days.start + 0.2 : sc.close.start + 0.6 * B, lang));
    if (daysub) q('texts', 8, (ctx) => runAt(ctx, TY, daysub, L.CAP[0], capTop2, P.text2, t, sc.days.start + sc.days.k.cap + 0.3, sc.close.start + 0.6 * B, lang));
  };

  const renderClose = (t) => {
    const c = sc.close, k = c.k, T = (x) => c.start + x;
    if (t >= S8.gA && t < T(k.lay)) {
      const pts = GATHER.line(t);
      thread(mid, C, pts, 1, 1.05);
      if (t < S8.flowA) { const h = pts[pts.length - 1]; glow(mid, h[0], h[1], 46, C.line, 0.7); glow(mid, h[0], h[1], 11, C.core, 1); }
      const sd = seg(t, S8.flowB - 0.3, S8.unfold + 0.2) * (1 - seg(t, S8.unfold + 0.3, S8.unfold + 1.3));
      if (sd > 0) { glow(top, S8.SEED[0], S8.SEED[1], 140, C.line, 0.6 * sd); glow(top, S8.SEED[0], S8.SEED[1], 24, C.core, sd); }
    }
    const FLAT = (f) => { const x0 = L.SPINE_X, y0 = L.SPINE_TOP; if (f < 0.18) { const qq = f / 0.18; return [lerp(x0, 430, E.io2(qq)), lerp(y0, L.FLAT_Y, E.io2(qq))]; } return [lerp(430, 1640, (f - 0.18) / 0.82), L.FLAT_Y]; };
    if (t >= T(k.lay) - 0.001 && t < T(k.con1) + 0.05) {
      const m = E.io3(seg(t, T(k.lay), T(k.lay) + 0.9 * B));
      const back = E.io3(seg(t, T(k.con0), T(k.con1)));
      const n = 120, pts = [];
      for (let j = 0; j <= n; j++) { const f = (j / n) * (1 - back); const a = GATHER.SL(f), b = FLAT(f); pts.push([lerp(a[0], b[0], m), lerp(a[1], b[1], m)]); }
      thread(mid, C, pts, 1, 1.05);
      c.s.words.forEach((_, i) => { const x = [700, 1060, 1420][i], qq = seg(t, T(k.words[i]), T(k.words[i]) + 0.2) * (1 - back); if (qq > 0 && x < pts[pts.length - 1][0] + 1) { glow(mid, x, L.FLAT_Y, 30, C.glow, 0.8 * qq); glow(mid, x, L.FLAT_Y, 7, C.core, qq); } });
    }
    const pIn = E.outExpo(seg(t, S8.unfold, S8.unfold + 0.5)), pOut = E.in3(seg(t, T(k.recede), T(k.recede) + 0.45));
    if (pIn > 0 && pOut < 1) {
      const nk = seg(t, T(k.need), T(k.need) + 0.15) * (1 - seg(t, T(k.need) + 0.25, T(k.need) + 0.7));
      q('blocks', 6, (ctx) => xf(ctx, { o: Math.min(1, pIn * 2) * (1 - seg(pOut, 0.7, 1)), left: L.PANEL.x, top: L.PANEL.y, oy: S8.SEED[1] - L.PANEL.y, sx: lerp(0.05, 1, pIn) * (1 - pOut), sy: lerp(0.3, 1, pIn) * (1 - 0.7 * pOut) }, () => drawPanel(ctx, nk, WARN_AT ? seg(t, T(k.need) - 0.05, T(k.need) + 0.15) : 1, WARN_AT ? seg(t, T(k.need), T(k.need) + 0.8) : 0)));
    }
    const np = GATHER.SL(0.44);
    const nIn = E.outExpo(seg(t, T(k.nudge), T(k.nudge) + 0.35));
    if (nIn > 0 && pOut < 1) {
      q('blocks', 7, (ctx) => xf(ctx, { o: nIn * (1 - seg(pOut, 0.4, 1)), left: np[0] - 20, top: np[1] + 26, s: lerp(0.8, 1, nIn) * (1 - 0.8 * pOut), b: 6 * (1 - nIn) }, () => {
        box(ctx, 0, 0, geo.nudge.w, geo.nudge.h, 22, P.paper, { shadow: shadowOf(0.42) });
        box(ctx, 26, (geo.nudge.h - 16) / 2, 16, 16, 8, P.warn);
        textAt(ctx, TY, cl.nudge, 26 + 16 + 14, 18, TY.row, 600, P.ink);
      }));
      glow(mid, np[0], np[1], 20, C.glow, 0.8 * nIn * (1 - pOut));
    }
    q('texts', 5, (ctx) => runAt(ctx, TY, claimR, W / 2, L.FLAT_Y - 230, P.text, t, T(k.claim), T(k.con0) + 0.25, lang));
    c.s.words.forEach((wd, i) => {
      const x = [700, 1060, 1420][i], g = geo.words[i];
      const qq = E.outExpo(seg(t, T(k.words[i]), T(k.words[i]) + 0.35)), out = E.in3(seg(t, T(k.con0) - 0.05, T(k.con0) + 0.2));
      q('texts', 6, (ctx) => xf(ctx, { o: qq * (1 - out), left: x - g.w / 2, top: L.FLAT_Y - g.h - 22 - 26 * (1 - qq), b: 8 * (1 - qq) + 10 * out }, () => textAt(ctx, TY, wd, 0, 0, TY.word, 600, P.text)));
    });
  };
  // `panel.warnAtNeed`: the "needs you" (its filter, its row's dot and word) stays grey until the alert, then turns warn
  // with the pill's pulse and a ring off the row's dot; wk is how far it has turned, rq the ring's run
  const WARN_AT = !!cl.panel.warnAtNeed;
  const HEX6 = /^#([0-9a-f]{6})$/i;
  const tint = (a, b, k) => {
    if (k <= 0) return a; if (k >= 1) return b;
    const A = HEX6.exec(a), Bx = HEX6.exec(b); if (!A || !Bx) return k < 0.5 ? a : b;
    const ch = (h, i) => parseInt(h.slice(i, i + 2), 16), c = [0, 2, 4].map((i) => Math.round(lerp(ch(A[1], i), ch(Bx[1], i), k)));
    return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  };
  const drawPanel = (ctx, nk, wk = 1, rq = 0) => {
    // done: every star the film sent; a card's new task (its star) is the one row that needs you, so it is not done
    const w = L.PANEL.w, nDone = STARS.filter((x) => x.task == null).length;
    box(ctx, 0, 0, w, geo.panelH, 30, P.paper, { shadow: shadowOf(0.42) });
    let y = 30;
    if (cl.panel.head) spaceChip(ctx, 20, y + (lineH(TY.row + 2, 'normal', cl.panel.title) - chipH) / 2, cl.panel.title); // the title as a space chip (`head`)
    else textAt(ctx, TY, cl.panel.title, 34, y, TY.row + 2, 600, P.ink);
    if (cl.panel.tabs) { // tabs on the title line, right: a segmented control, the first one current
      const th = lineH(TY.row + 2, 'normal', cl.panel.title), tw = cl.panel.tabs.map((s2) => textW(ctx, TY, s2, TY.rowSub, 600) + 32), H2 = pillH + 8;
      let tx = w - 34 - tw.reduce((a, b) => a + b, 0) - 8; box(ctx, tx, y + (th - H2) / 2, w - 34 - tx, H2, H2 / 2, P.bubble); tx += 4;
      cl.panel.tabs.forEach((s2, i) => { if (!i) box(ctx, tx, y + (th - H2) / 2 + 4, tw[i], H2 - 8, (H2 - 8) / 2, P.paper, { shadow: shadowOf(0.12, 2, 6) }); textAt(ctx, TY, s2, tx + 16, y + (th - lineH(TY.rowSub, 'normal', s2)) / 2, TY.rowSub, 600, i ? P.ink2 : P.ink); tx += tw[i]; });
    }
    y += lineH(TY.row + 2, 'normal', cl.panel.title) + 18;
    let x = 34;
    x += pill(ctx, TY, P, x, y, FL.all, { bg: P.ink, color: P.paper }) + 12;
    x += pill(ctx, TY, P, x, y, `${FL.needsYou} 1`, { bg: tint(P.bubble, P.warn, wk), color: tint(P.ink2, P.paper, wk), w: 600, scale: 1 + 0.14 * nk, glow: nk, glowRgb: C.line }) + 12;
    x += pill(ctx, TY, P, x, y, `${FL.running} 0`) + 12;
    x += pill(ctx, TY, P, x, y, `${FL.done} ${nDone}`) + 12;
    const qS = `${FL.queued} 0`; // with `head`, the queued filter too, where it fits
    if (cl.panel.head && x + textW(ctx, TY, qS, TY.rowSub, 500) + 32 <= w - 20) pill(ctx, TY, P, x, y, qS);
    y += pillH + 10;
    cl.panel.rows.forEach((r, ri) => {
      if (panelGroups[ri]) { textAt(ctx, TY, r.group, 34, y + 10, TY.rowSub, 600, P.ink2); y += groupH(r); }
      const rh = panelRowH(r), st = rh - 32, needs = r.status === 'needs';
      if (needs) box(ctx, 16, y, w - 32, rh, 18, P.bubble);
      if (r.time) textAt(ctx, TY, r.time, w - 34, y + 16 + (lineH(TY.row, 'normal', r.title) - lineH(TY.rowSub, 'normal', r.time)) / 2, TY.rowSub, 400, P.ink2, { align: 'right' });
      const iy = y + 16 + (st - 30) / 2;
      if (needs) {
        box(ctx, 34, iy, 30, 30, 15, tint(P.ink2, P.warn, wk));
        if (rq > 0 && rq < 1) { ctx.save(); ctx.strokeStyle = P.warn; ctx.globalAlpha *= 0.8 * (1 - rq); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(49, iy + 15, lerp(15, 44, E.out3(rq)), 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      } else tick(ctx, P, 34, iy);
      const th = lineH(TY.row, 'normal', r.title);
      textAt(ctx, TY, r.title, 82, y + 16, TY.row, 600, P.ink);
      if (needs) { const lead = UI.needsYou; textAt(ctx, TY, lead, 82, y + 16 + th, TY.rowSub, 600, tint(P.ink2, P.warn, wk)); textAt(ctx, TY, ` · ${r.detail}`, 82 + textW(ctx, TY, lead, TY.rowSub, 600), y + 16 + th, TY.rowSub, 400, P.ink2); }
      else textAt(ctx, TY, `${UI.done} · ${r.detail}`, 82, y + 16 + th, TY.rowSub, 400, P.ink2);
      y += rh;
    });
  };

  const renderCaptions = (t) => caps.forEach((c) => q('texts', 7, (ctx) => runAt(ctx, TY, c.R, L.CAP[0], L.CAP[1], P.text, t, c.t0, c.t1, lang)));

  const renderLock = (t) => {
    const lk = sc.lockup;
    if (!lk || t < lk.start) return;
    const k = lk.k, T = (x) => lk.start + x;
    const g = geo.name, cx = W / 2, cy = 470;
    const open = E.io3(seg(t, T(k.open), T(k.open) + 0.6));
    const nameX = LOCK === 'mascot' ? cx - g.w / 2 - 50 : cx - g.w / 2;
    q('lock', 0, (ctx) => {
      if (open > 0) {
        ctx.save(); const ins = g.w * 0.5 * (1 - open); ctx.beginPath(); ctx.rect(nameX + ins, cy - g.h / 2 - 40, g.w - 2 * ins, g.h + 80); ctx.clip();
        textAt(ctx, TY, content.product.name, nameX, cy - g.h / 2, TY.name, TY.weight.name, P.text, { track: -0.02 }); ctx.restore();
      }
      runAt(ctx, TY, tagR, W / 2, 650, P.text2, t, T(k.tag), Infinity, lang);
    });
    if (LOCK === 'name') {
      const mv = E.io3(seg(t, T(k.move), T(k.open)));
      const x = lerp(L.MASCOT[0], cx, mv), y = lerp(L.MASCOT[1], cy, mv);
      mascot(top, C, x, y, lerp(1, 0.6, mv) * (1 - E.in3(seg(t, T(k.open) - 0.15, T(k.open) + 0.1))) * KB, 1, 0, opt.mascot || null);
      const pt = seg(t, T(k.open) - 0.15, T(k.open)) * (1 - seg(t, T(k.open) + 0.3, T(k.open) + 0.9));
      if (pt > 0) { glow(top, cx, cy, 160, C.line, 0.6 * pt); glow(top, cx, cy, 18, C.core, pt); }
      const half = (g.w / 2 + 60) * open;
      if (open > 0) thread(mid, C, straight([cx - half, cy + g.h / 2 + 18], [cx + half, cy + g.h / 2 + 18], 20), lerp(1, 0.55, seg(t, T(k.open) + 0.6, T(k.open) + 1.4)), lerp(1.2, 0.5, open));
    } else {
      const hop = E.io2(seg(t, T(k.hop) - 0.4, T(k.hop) + 0.5));
      const tx = nameX + g.w + 70, ty = cy + g.h * 0.12;
      const x = lerp(L.MASCOT[0], tx, hop), y = lerp(L.MASCOT[1], ty, hop) - Math.sin(Math.PI * hop) * 260;
      const b = seg(t, T(k.hop) + 0.5, T(k.hop) + 0.75), sq = 0.2 * Math.sin(Math.PI * b) * (1 - b);
      mascot(top, C, x, y, lerp(1, 1.5, hop) * KB, 1, sq, opt.mascot || null);
      const open2 = seg(t, T(k.open), T(k.open) + 0.6);
      if (open2 > 0) thread(mid, C, straight([nameX - 20, cy + g.h / 2 + 18], [lerp(nameX - 20, tx - 30, open2), cy + g.h / 2 + 18], 20), 0.6, 0.5);
    }
  };

  // the film's frame at time t (s)
  const frame = (ctx, t) => {
    Q = { blocks: [], texts: [], veil: [], lock: [] };
    for (const c of [mid, top]) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.filter = 'none'; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); c.globalCompositeOperation = 'lighter'; }
    ctx.save();
    renderBG(ctx, t);
    renderOpen(ctx, t);
    renderSpine(t); renderChat(t); renderAsk(t); renderImage(t); renderChoice(t); renderEvening(t); renderFollowUp(t); renderConst(t); renderModal(t); renderVerify(t); renderGraph(t); renderTangle(t); renderCards(t); renderCardTask(t); renderDays(t); renderClose(t); renderCaptions(t); renderLock(t);
    for (const c of [mid, top]) c.globalCompositeOperation = 'source-over';
    const flush = (name) => Q[name].sort((a, b) => a.z - b.z || a.n - b.n).forEach((x) => { ctx.save(); x.fn(ctx); ctx.restore(); });
    ctx.drawImage(mid.canvas, 0, 0);
    flush('blocks');
    ctx.drawImage(top.canvas, 0, 0);
    flush('texts'); flush('veil'); flush('lock');
    ctx.restore();
  };
  return { plan: PLAN, duration, problems, frame, palette: P, type: TY };
};
