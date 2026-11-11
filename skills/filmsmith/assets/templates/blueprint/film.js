// film.js — builds the drawing from content.js once (measured), then paints any frame from render(t).
import content from './content.js';
import palettes from './palettes.js';
import { boot } from './lib/boot.js';
import { fontsReady } from './lib/text.js';
import { grainTile, drawGrain, subframes } from './lib/canvas.js';
import { createTransitions } from './lib/transitions/index.js'; // shape-flood (the issue), blueprint-expose (the probe run), occluder-pass (the rule)
import { createHandoff } from './lib/handoffs/index.js'; // stroke-reinterpret, net-unfold, slot-rails (sheets)
import { schedule } from './timeline.js';
import { ROUTE_B, EXCERPT_HUD_PRE, EXCERPT_SHEET_PRE } from './choreography.js';
import { E, makePen, drawItem, makeStamp, drawStamp, stampBox, paperTile, rgba, clearMeasure, LINEWORK } from './fx.js';
import { makeHud, FOLDED } from './hud.js';
import { solvePush, makeCamAt, cameraKeys } from './camera.js';
import { up, ISO } from './sheets/common.js';
import * as problem from './sheets/problem.js';
import * as arrangement from './sheets/arrangement.js';
import * as detail from './sheets/detail.js';
import * as section from './sheets/section.js';
import * as loop from './sheets/loop.js';
import * as checklist from './sheets/checklist.js';
import * as assembly from './sheets/assembly.js';
import * as parts from './sheets/parts.js';
import * as release from './sheets/release.js';
import * as iface from './sheets/interface.js';
import * as stages from './sheets/stages.js';

const rectsMeet = (a, b) => !(a[0] + a[2] <= b[0] || b[0] + b[2] <= a[0] || a[1] + a[3] <= b[1] || b[1] + b[3] <= a[1]);
const PLANS = { problem, arrangement, detail, section, loop, checklist, assembly, parts, release, interface: iface, stages };
const SW = 1920, SH = 1080, M = 120, GX = 120, GY = 120, COLS = 3;

const FONTS = [['cond', 500], ['cond', 600], ['cond', 700], ['mono', 400], ['mono', 500], ['mono', 600]];
const FAMILY = { cond: 'Plex Condensed', mono: 'Plex Mono' };
const HOLD_SCALE = 1.012; // camera scale while a sheet holds (camera.js): the HUD at rest, mapped onto a sheet
const PANEL_FADE_OUT = 0.18; // the claim panel leaves in 0.6 × its 0.3 s entrance
const PANEL_BLUR_PX = 5; // blur of the drawing under the claim panel (4–6 px; clarity P-22)

// Blur what has been drawn so far (the drawing, before the screen-space texture and the HUD).
const blurScratch = { c: null };
const panelBlur = (c2, px) => {
  const W = c2.canvas.width, H = c2.canvas.height;
  if (!blurScratch.c) { blurScratch.c = document.createElement('canvas'); blurScratch.c.width = W; blurScratch.c.height = H; }
  const s = blurScratch.c.getContext('2d');
  s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'copy'; s.drawImage(c2.canvas, 0, 0);
  c2.save(); c2.setTransform(1, 0, 0, 1, 0, 0); c2.filter = `blur(${px.toFixed(2)}px)`; c2.drawImage(blurScratch.c, 0, 0); c2.restore();
};

export const start = () => {
  const canvas = document.getElementById('film');
  canvas.width = SW; canvas.height = SH;
  const ctx = canvas.getContext('2d');
  // lib/text.js fontsReady checks every face really loaded (a silent fallback would shift every measured
  // layout) and paints a red banner if one did not
  const ready = async () => {
    await fontsReady(FONTS.map(([fam, weight]) => ({ family: FAMILY[fam], weight })));
    clearMeasure();
  };
  let render = () => {};
  boot({ id: 'main', duration: schedule(content).duration, ready: async () => { await ready(); render = await compose(); }, render: (t) => render(t) });
  // compose() builds one world (the print) or two (a pencil original, then the print) and returns render(t)
  const compose = async () => {
    const S = schedule(content);
    const print = await build({ S, palId: content.palette, linework: content.linework ?? 'ink', primary: true });
    const issueSc = S.scenes.find((sc) => sc.flood), ruleSc = S.scenes.find((sc) => sc.rule);
    // the pencil original: the same drawing on the original's paper, drawn in pencil, until the issue's flood
    let orig = null;
    if (issueSc) {
      const oid = content.original ?? 'vellum';
      if (!palettes[oid]) print.errs.push(`unknown original "${oid}"; presets: ${Object.keys(palettes).join(', ')}`);
      else orig = await build({ S, palId: oid, linework: 'pencil', primary: false });
    }
    // the checklists' probe runs: the lamp over the frame; the rows are drafted on their own as it passes them
    const scans = S.scenes.filter((sc) => sc.scan).map((sc) => sc.scan);
    const glNeeded = issueSc || ruleSc || scans.length;
    const tx = glNeeded ? createTransitions(null, { width: SW, height: SH }) : null;
    if (glNeeded && !tx) console.warn('[blueprint] no WebGL: the flood and the rule cut at their midpoint, the probe run has no lamp');
    tx?.warm();
    const off = () => { const c = document.createElement('canvas'); c.width = SW; c.height = SH; return [c, c.getContext('2d')]; };
    const [cA, gA] = off(), [cB, gB] = off();
    // the flood grows out of the stamp's own outline, where it sits on screen when the flood starts
    let flood = null;
    if (issueSc && orig) {
      const f = issueSc.flood, st = print.stampOf(issueSc.index), cam = print.camAt(f.t0);
      const cx = (st.cx - cam.x) * cam.s + 960 + cam.dx, cy = (st.cy - cam.y) * cam.s + 540 + cam.dy;
      flood = { ...f, opts: { origin: [cx, cy], shape: 'rect', aspect: st.w / st.h, corner: 0.12, r0: (st.h / 2) * cam.s, dur: f.dur, fps: 30 } };
    }
    const rule = ruleSc ? { ...ruleSc.rule, start: ruleSc.start } : null;
    const RP = print.P;
    // px per frame of the camera at t (pan, plus zoom measured at the frame's corner)
    const speedAt = (W) => (t) => {
      if (rule && t >= rule.start && t < rule.start + 2 / 30) return 0; // the cut under the rule is not a move
      const a = W.camAt(t), b = W.camAt(t - 1 / 30);
      return Math.hypot((a.x - b.x) * a.s, (a.y - b.y) * a.s) + Math.abs(Math.log(a.s / b.s)) * 1100;
    };
    return (t) => {
      if (flood && t >= flood.t0 && t < flood.t0 + flood.dur) {
        orig.drawFrame(gA, t); print.drawFrame(gB, t);
        const p = (t - flood.t0) / flood.dur;
        if (tx) ctx.drawImage(tx.draw('shape-flood', cA, cB, p, flood.opts), 0, 0);
        else ctx.drawImage(p < 0.5 ? cA : cB, 0, 0);
        return;
      }
      const W = flood && t < flood.t0 ? orig : print;
      if (rule && t >= rule.t0 && t < rule.t0 + rule.dur) {
        W.drawFrame(gA, t, W.camAt(rule.t0)); W.drawFrame(gB, t, W.camAt(rule.start));
        const p = (t - rule.t0) / rule.dur;
        if (tx) ctx.drawImage(tx.draw('occluder-pass', cA, cB, p, { dur: rule.dur, fps: 30, colors: { ground: RP.bg, ink: RP.line } }), 0, 0);
        else ctx.drawImage(p < 0.5 ? cA : cB, 0, 0);
        return;
      }
      // the probe run: one frame of the drawing (its rows are drafted at the lamp's pass times, sheets/checklist.js)
      // under the lamp of blueprint-expose without development, so A and B are the same frame: a reading, not an
      // exposure (the print is issued once, by a person). Light paper takes the line colour as the lamp's (a UV lamp)
      const scan = scans.find((x) => t >= x.t0 && t < x.t0 + x.dur);
      if (scan && tx) {
        W.drawFrame(gA, t);
        const P = W.P;
        ctx.drawImage(tx.draw('blueprint-expose', cA, cA, (t - scan.t0) / scan.dur, { direction: scan.dir, develop: false, lamp: 'glow', colors: { ground: P.bg, ink: P.line, paper: P.dark ? P.ink : P.line } }), 0, 0);
        return;
      }
      // motion blur only while the camera travels fast (lib/canvas.js subframes: exact sum, sub-frames ≤ 2 px apart)
      subframes(ctx, (c, tt) => W.drawFrame(c, tt), t, { speed: speedAt(W), threshold: 4, maxN: 24, shutter: 0.5, fps: 30 });
    };
  };
};

// One world: the whole drawing in one palette and one line work, built once (measured) and painted at any t by
// drawFrame(c2, t, cam). The film is one world (the print) or two with the same geometry (the pencil original,
// then the print after the issue's flood). Only the primary world reports errors and fills window.__film.
const build = async ({ S, palId, linework, primary }) => {
  const P = palettes[palId];
  const errs = primary ? [...S.errors] : []; // fit() errors and scene-list errors; painted as the red banner below
  if (primary && S.warnings.length) console.warn('[blueprint] timing:\n' + S.warnings.join('\n'));
  if (!P) errs.push(`unknown palette "${palId}"; presets: ${Object.keys(palettes).join(', ')}`);
  const Pal = P || Object.values(palettes)[0];
  const mctx = document.createElement('canvas').getContext('2d');
  const seed = content.seed | 0;
  // the drafting instrument (mode card, Variants): 'ink' (default) or 'pencil'; the sheets and the route arrows
  // take it, the pre-printed frame (HUD), lettering and stamps do not
  if (!LINEWORK.includes(linework)) errs.push(`unknown linework "${linework}"; one of: ${LINEWORK.join(', ')}`);
  const penOpts = linework === 'pencil' ? { linework } : {};
  // hand-offs of lib/handoffs drawn inside a sheet (env.handoff): created after the plans, once fonts are ready
  const pending = [];

  // ---------- layout: sheets in a serpentine, 3 columns ----------
  const sheets = S.scenes.filter((s) => s.sheetNo);
  const n = sheets.length, rows = Math.ceil(n / COLS);
  const cellOf = (k) => { const row = Math.floor(k / COLS), c = k % COLS; return { row, col: row % 2 ? COLS - 1 - c : c }; };
  const cellXY = (k) => { const { row, col } = cellOf(k); return { x: M + col * (SW + GX), y: M + row * (SH + GY) }; };
  const W = 2 * M + COLS * SW + (COLS - 1) * GX, H = 2 * M + rows * SH + (rows - 1) * GY;
  const full = Math.min(SW / W, SH / H) * 0.985;
  const layout = { cols: COLS, rows, n, cellOf };

  // ---------- HUD (screen space), built first: stamps at rest keep clear of it ----------
  const labels = S.scenes.map((sc, i) => {
    const prior = S.scenes.slice(0, i + 1).filter((s) => s.sheetNo).length;
    const ov = sc.type === 'overview';
    return {
      t: i === 0 ? 0 : sc.start - sc.moveIn / 2,
      top: ov ? `1–${prior}` : String(sc.sheetNo),
      total: n,
      label: ov ? `SHEETS 1–${prior} · ${up(sc.hud || (sc.final ? 'System overview' : 'As drawn'))}` : `SHEET ${sc.sheetNo} · ${up(sc.hud || sc.type)}`,
      sheet: ov ? 'ALL' : `${sc.sheetNo} / ${n}`,
    };
  });
  const finalOv = S.scenes.find((s) => s.type === 'overview' && s.final);
  // the approval stamp lands in the title block's APPROVED BY cell: the largest size (36 → 28) whose rotated
  // box fits the cell's empty part (hud.js); its lettering stays ≥ 25 px
  const HUD_ROT = -3;
  let hudSt = null;
  if (finalOv?.stamp) {
    for (let size = 36; size >= 28; size -= 2) {
      hudSt = makeStamp(Pal, mctx, finalOv.stamp, size, seed + 999);
      if (stampBox(hudSt, HUD_ROT)[1] <= 112) break;
    }
  }
  const folds = S.scenes.filter((sc) => sc.push).map((sc) => ({ from: sc.push.from, back: sc.push.back }));
  const hud = makeHud({ P: Pal, mctx, meta: content.meta || {}, labels, errs, folds, approveBox: hudSt ? stampBox(hudSt, HUD_ROT) : null, pre: content.excerpt === true ? EXCERPT_HUD_PRE : 0 });
  const toSheet = (r) => { const k = 1 / HOLD_SCALE; return [(r[0] - 960) * k + 960, (r[1] - 540) * k + 540, r[2] * k, r[3] * k]; };
  const hudRects = [hud.panel, hud.block, ...(hud.corner ? [hud.corner] : [])];
  const hudInSheet = hudRects.map(toSheet);

  // ---------- plan every sheet ----------
  const plans = new Map(); // scene index → { cell, items, title, focus, stamp }
  const impacts = [];
  for (const sc of sheets) {
    const k = sc.sheetNo - 1, cell = cellXY(k);
    const pen = makePen(Pal, mctx, penOpts);
    const where = `sheet ${sc.sheetNo} (${sc.type})`;
    const env = {
      P: Pal, b: S.g.beat, layout, hud: hudInSheet,
      c: (name) => { const v = sc.cue[name]; if (v === undefined) errs.push(`${where}: missing cue "${name}"`); return v ?? sc.start; },
      err: (m) => errs.push(`${where}: ${m}`),
      lim: (slot, v, max) => { if (v !== undefined && v !== null && String(v).length > max) errs.push(`${where}: ${slot} "${v}" has ${String(v).length} chars; limit ${max}`); },
      fit: (str, f, maxW, min, slot) => {
        // step down the ISO 3098 series (sheets/common.js), never below the series step at or under the slot's minimum
        let g = { ...f };
        const lo = Math.max(...ISO.filter((v) => v <= Math.max(min, ISO[0])));
        const steps = ISO.filter((v) => v < g.size && v >= lo).reverse();
        while (pen.measure(str || '', g) > maxW && steps.length) g = { ...g, size: steps.shift() };
        if (pen.measure(str || '', g) > maxW + 0.5) errs.push(`${where}: ${slot || 'text'} "${str}" overflows ${Math.round(maxW)} px at the minimum size ${g.size}; rewrite it shorter`);
        return g;
      },
      stamp: (spec, size, role = 'accent') => makeStamp(Pal, mctx, spec, size, seed + sc.sheetNo * 31, role),
      placeStamp: (st, cx, cy, rot) => { const tl = sc.stampT; pen.custom(tl - 0.2, (c2, t) => drawStamp(c2, st, cx, cy, rot, tl, t)); },
      // a hand-off of lib/handoffs as a layer of this sheet (sheet coordinates, ground: false); ref.h is set
      // before the first frame is drawn
      handoff: (name, params) => { const ref = { h: null }; pending.push(createHandoff(name, { ...params, ground: false }).then((h) => (ref.h = h))); return ref; },
    };
    // sheet frame, crop marks and the big outlined sheet number, drawn as the camera arrives
    const tf = sc.index === 0 ? (content.excerpt === true ? -EXCERPT_SHEET_PRE : 0.05) : sc.start - sc.moveIn * 0.45;
    pen.rect(0, 0, SW, SH, tf, 0.8, 'sf', { ease: E.cubicInOut });
    [[0, 0, -1, -1], [SW, 0, 1, -1], [0, SH, -1, 1], [SW, SH, 1, 1]].forEach(([px, py, sx, sy]) => {
      pen.seg(px + sx * 16, py, px + sx * 70, py, tf + 0.2, 0.3, 's1');
      pen.seg(px, py + sy * 16, px, py + sy * 70, tf + 0.2, 0.3, 's1');
    });
    pen.text(String(sc.sheetNo).padStart(2, '0'), 1790, 250, { fam: 'cond', w: 700, size: 140, outline: 2 }, tf + 0.1, 0.6, { align: 'right', col: rgba(Pal.line, 0.42) });
    const plan = PLANS[sc.type].plan(pen, env, sc);
    plans.set(sc.index, { cell, items: pen.items, ...plan, t0: tf });
    if (sc.stampT !== null) impacts.push(sc.stampT);
  }
  try { await Promise.all(pending); } catch (e) { errs.push(`hand-off: ${e?.message ?? e}`); }

  // ---------- world: route arrows in the gutters, drawn with each camera move; final route ----------
  const world = makePen(Pal, mctx, penOpts);
  const centre = (k) => { const c = cellXY(k); return { x: c.x + SW / 2, y: c.y + SH / 2 }; };
  for (let i = 1; i < sheets.length; i++) {
    const a = cellXY(i - 1), b = cellXY(i), sc = sheets[i];
    const t0 = sc.start - sc.moveIn, dur = sc.moveIn;
    let p;
    if (a.y === b.y) { const dir = Math.sign(b.x - a.x), y = a.y + SH / 2; p = dir > 0 ? [a.x + SW - 80, y, b.x + 72, y] : [a.x + 80, y, b.x + SW - 72, y]; }
    else { const x = a.x + SW / 2; p = [x, a.y + SH - 80, x, b.y + 72]; }
    world.line([[p[0], p[1]], [p[2], p[3]]], t0, dur, 's2', { ease: E.quartInOut, width: 3 });
    world.head(p[2], p[3], Math.atan2(p[3] - p[1], p[2] - p[0]), sc.start - 0.02, 'ink', 26);
  }
  if (finalOv) {
    const pts = sheets.map((_, k) => { const c = centre(k); return [c.x, c.y]; });
    const t0 = finalOv.cue.route, dur = ROUTE_B * S.g.beat, out = finalOv.cue.panelOut;
    const ln = world.line(pts, t0, dur, 'route', { ease: E.cubicInOut });
    ln.fadeOut = out; ln.fadeDur = PANEL_FADE_OUT;
    pts.forEach(([x, y], k) => { const d = world.dot(x, y, 34, t0 + (dur * k) / Math.max(1, pts.length - 1), 'ink', { pop: true }); d.fadeOut = out; d.fadeDur = PANEL_FADE_OUT; });
  }

  // ---------- final overview: claim panel + approval stamp in the title block's APPROVED BY cell ----------
  // The panel fades in over 0.3 s and out over 0.6 × that, accelerating (exits faster; flow F15). While it is
  // up, the drawing under it is blurred (panelBlur), so the old sheet titles cannot be read alongside the claim
  // (clarity P-22: one protagonist per frame).
  const overlay = makePen(Pal, mctx);
  let hudStamp = null, panelA = () => 0;
  if (finalOv) {
    const c = finalOv.cue;
    panelA = (t) => Math.min(1, Math.max(0, (t - c.panel) / 0.3)) * (1 - E.quadIn((t - c.panelOut) / PANEL_FADE_OUT));
    overlay.custom(c.panel, (cx, t) => {
      const a = panelA(t);
      if (a <= 0) return;
      cx.save(); cx.globalAlpha *= a * 0.84; cx.fillStyle = Pal.paper; cx.fillRect(0, 0, SW, SH); cx.restore();
    });
    const lines = finalOv.lines || [];
    if (lines.length !== 2) errs.push('final overview: lines needs exactly 2 entries');
    const flab = { fam: 'mono', w: 400, size: 25, track: 0.14 };
    if (finalOv.label && finalOv.label.length > 36) errs.push(`final overview: label has ${finalOv.label.length} chars; limit 36`);
    overlay.text(up(finalOv.label || 'System overview'), 150, 290, flab, c.panel + 0.1, 0.4, { col: 'line' });
    lines.forEach((l, i) => {
      if (l.length > 18) errs.push(`final overview: lines[${i}] "${l}" has ${l.length} chars; limit 18`);
      let f = { fam: 'cond', w: 700, size: 200, track: -0.02 };
      if (overlay.measure(l, f) > 1640) f = { ...f, size: 140 }; // the next step down the ISO series
      if (overlay.measure(l, f) > 1640) errs.push(`final overview: lines[${i}] overflows`);
      const base = 476 + i * 212, tl = i ? c.line2 : c.line1;
      overlay.guides(base, f.size, tl - 0.15);
      overlay.text(l, 142, base, f, tl, 0.6);
    });
    overlay.items.slice(1).forEach((it) => { it.fadeOut = c.panelOut; it.fadeDur = PANEL_FADE_OUT; }); // [0] is the panel, which fades itself
    if (hudSt) {
      const ap = hud.approve;
      hudStamp = { st: hudSt, cx: ap[0] + ap[2] / 2, cy: ap[1] + ap[3] / 2, t: finalOv.stampT };
      impacts.push(finalOv.stampT);
    }
  }

  // ---------- camera ----------
  const sceneSheetK = (i) => S.scenes[i].sheetNo - 1;
  const pos = (i) => (S.scenes[i].sheetNo ? centre(sceneSheetK(i)) : { x: W / 2, y: H / 2 });
  const adjacent = (i) => S.scenes[i].sheetNo && S.scenes[i - 1].sheetNo;
  const pushes = new Map();
  for (const sc of sheets) {
    const pl = plans.get(sc.index);
    if (!sc.push || !pl.focus) continue;
    const off = (r) => r && [r[0] + pl.cell.x, r[1] + pl.cell.y, r[2], r[3]];
    const texts = pl.items.filter((it) => it.k === 'text' && !it.f.outline).map((it) => off(it.rect));
    const p = solvePush({ focus: off(pl.focus), title: off(pl.title), stamp: off(pl.stamp), panel: FOLDED, block: hud.block, sheet: [pl.cell.x, pl.cell.y, SW, SH], texts }, errs, `sheet ${sc.sheetNo} push-in`);
    pushes.set(sc.index, p);
    if (p.cuts) console.warn(`[blueprint] sheet ${sc.sheetNo} push-in: ${p.cuts} label(s) cut by the frame at ${p.s.toFixed(2)}×`);
  }
  // at rest (the hold framing), no stamp and no lettering of a sheet may sit under the HUD
  for (const sc of sheets) {
    const pl = plans.get(sc.index);
    if (pl.stamp && hudInSheet.some((r) => rectsMeet(pl.stamp, r))) errs.push(`sheet ${sc.sheetNo}: the stamp overlaps the HUD`);
    for (const it of pl.items) {
      if (it.k !== 'text' || it.f.outline) continue;
      if (hudInSheet.some((r) => rectsMeet(it.rect, r))) errs.push(`sheet ${sc.sheetNo}: "${it.str.slice(0, 24)}" sits under the HUD at rest; shorten it`);
    }
    // a stamp never covers lettering (legibility #3: the key number and its caption stay readable)
    if (pl.stamp) for (const it of pl.items) if (it.k === 'text' && !it.f.outline && rectsMeet(pl.stamp, it.rect)) errs.push(`sheet ${sc.sheetNo}: the stamp covers "${it.str.slice(0, 24)}"`);
  }
  const keys = cameraKeys({ scenes: S.scenes, pos, full, push: (i) => pushes.get(i) || null, adjacent, beat: S.g.beat });
  const camAt = makeCamAt(keys, impacts);

  // ---------- textures ----------
  const paper = paperTile(seed);
  const paperPat = mctx.createPattern(paper, 'repeat');
  const grain = grainTile(seed + 3, 256, 26);
  const vig = mctx.createRadialGradient(960, 518, 0, 960, 518, 1180);
  vig.addColorStop(0.58, rgba(Pal.vignette.color, 0));
  vig.addColorStop(1, rgba(Pal.vignette.color, Pal.vignette.alpha));

  if (primary) { if (errs.length) console.error('[blueprint] content errors:\n' + errs.join('\n')); window.__filmErrors = errs; }
  if (primary) window.__film = {
    schedule: S, keys, errors: errs, pushes: [...pushes.entries()], hud: { panel: hud.panel, block: hud.block, approve: hud.approve, corner: hud.corner },
    plans: [...plans.entries()].map(([i, p]) => ({ i, cell: p.cell, title: p.title, focus: p.focus, stamp: p.stamp, texts: p.items.filter((it) => it.k === 'text').map((it) => ({ str: it.str, size: it.f.size, outline: !!it.f.outline, rect: it.rect })) })),
    overlayTexts: overlay.items.filter((it) => it.k === 'text').map((it) => ({ str: it.str, size: it.f.size, rect: it.rect })),
  };

  // fadeOut: an exit time; fadeDur: its length (default 0.45 s, linear; the claim panel's items use 0.18 s, accelerating)
  const fadeA = (it, t) => {
    if (it.fadeOut === undefined) return 1;
    if (it.fadeDur !== undefined) return 1 - E.quadIn((t - it.fadeOut) / it.fadeDur);
    return 1 - Math.min(1, Math.max(0, (t - it.fadeOut) / 0.45));
  };
  const drawList = (c2, items, t) => {
    for (const it of items) {
      const a = fadeA(it, t);
      if (a <= 0) continue;
      if (a < 1) { c2.save(); c2.globalAlpha *= a; drawItem(c2, Pal, it, t); c2.restore(); } else drawItem(c2, Pal, it, t);
    }
  };

  const drawGrid = (c2, cam, view) => {
    const fineA = Pal.grid[0] * Math.max(0, Math.min(1, (cam.s - 0.42) / 0.4));
    const [vx, vy, vw, vh] = view;
    const x0 = Math.max(0, vx), y0 = Math.max(0, vy), x1 = Math.min(W, vx + vw), y1 = Math.min(H, vy + vh);
    const lines = (step, off, w, a) => {
      if (a <= 0.001) return;
      c2.beginPath();
      for (let x = Math.ceil((x0 - off) / step) * step + off; x <= x1; x += step) { c2.moveTo(x, y0); c2.lineTo(x, y1); }
      for (let y = Math.ceil((y0 - off) / step) * step + off; y <= y1; y += step) { c2.moveTo(x0, y); c2.lineTo(x1, y); }
      c2.strokeStyle = rgba(Pal.line, a); c2.lineWidth = w; c2.stroke();
    };
    lines(40, 0, 1, fineA);
    lines(200, 120, 2, Pal.grid[1]);
  };

  const drawFrame = (c2, t, camOverride) => {
    const cam = camOverride ?? camAt(t);
    c2.setTransform(1, 0, 0, 1, 0, 0);
    c2.globalAlpha = 1; c2.globalCompositeOperation = 'source-over';
    c2.fillStyle = Pal.bg; c2.fillRect(0, 0, SW, SH);
    const ox = 960 - cam.x * cam.s + cam.dx, oy = 540 - cam.y * cam.s + cam.dy;
    c2.setTransform(cam.s, 0, 0, cam.s, ox, oy);
    c2.fillStyle = Pal.paper; c2.fillRect(0, 0, W, H);
    const view = [-ox / cam.s, -oy / cam.s, SW / cam.s, SH / cam.s];
    drawGrid(c2, cam, view);
    for (const [, pl] of plans) {
      if (t < pl.t0) continue;
      const { x, y } = pl.cell;
      if (x > view[0] + view[2] || x + SW < view[0] || y > view[1] + view[3] || y + SH < view[1]) continue;
      c2.save(); c2.translate(x, y); drawList(c2, pl.items, t); c2.restore();
    }
    drawList(c2, world.items, t);
    // screen space: lamp, paper texture, grain, vignette
    c2.setTransform(1, 0, 0, 1, 0, 0);
    const pa = panelA(t);
    if (pa > 0) panelBlur(c2, PANEL_BLUR_PX * pa);
    const lx = 650 + t * 14, ly = 390 + Math.sin(t * 0.21) * 60;
    const lamp = c2.createRadialGradient(lx, ly, 0, lx, ly, 820);
    lamp.addColorStop(0, rgba(Pal.lamp.color, Pal.lamp.alpha)); lamp.addColorStop(1, rgba(Pal.lamp.color, 0));
    c2.save();
    c2.globalCompositeOperation = Pal.lamp.mode; c2.fillStyle = lamp; c2.fillRect(0, 0, SW, SH);
    c2.globalCompositeOperation = Pal.texture.mode; c2.globalAlpha = Pal.texture.alpha * 0.35; c2.fillStyle = paperPat; c2.fillRect(0, 0, SW, SH);
    c2.restore();
    drawGrain(c2, grain, t, { alpha: Pal.dark ? 0.05 : 0.035, mode: 'overlay' });
    c2.fillStyle = vig; c2.fillRect(0, 0, SW, SH);
    drawList(c2, overlay.items, t);
    hud.draw(c2, t, cam);
    if (hudStamp) drawStamp(c2, hudStamp.st, hudStamp.cx + cam.dx * 0.3, hudStamp.cy, HUD_ROT, hudStamp.t, t);
    if (errs.length) {
      c2.save(); c2.fillStyle = 'rgba(200,0,0,0.85)'; c2.fillRect(60, 160, 1800, 40 + 30 * Math.min(errs.length, 20));
      c2.fillStyle = '#fff'; c2.font = '500 22px "Plex Mono", monospace';
      errs.slice(0, 20).forEach((e, i) => c2.fillText(e.slice(0, 140), 80, 196 + i * 30));
      c2.restore();
    }
  };

  // where a sheet's stamp sits in the world (its centre and unrotated size): the issue's flood grows out of it
  const stampOf = (i) => {
    const pl = plans.get(i);
    if (!pl?.stamp) return { cx: 0, cy: 0, w: 100, h: 60 };
    const [w, h] = pl.stampSize ?? [pl.stamp[2], pl.stamp[3]];
    return { cx: pl.cell.x + pl.stamp[0] + pl.stamp[2] / 2, cy: pl.cell.y + pl.stamp[1] + pl.stamp[3] / 2, w, h };
  };
  return { drawFrame, camAt, errs, P: Pal, stampOf };
};
