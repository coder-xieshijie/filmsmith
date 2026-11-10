// sheet-overview — sheets → system, the film's claim: the camera pulls out from the last sheet to the whole drawing
// (its first 1.5 beats, plan lead), one heavy ink route draws through every sheet centre with a dot per sheet, then a
// claim panel rises over the drawing (blurred 5 px and dimmed under it), a label and two claim lines letter in at
// 200 px with their construction lines, and the amber APPROVED stamp lands in the title block's APPROVED BY cell on
// beat 3 with a thud. The panel leaves half a beat before the end (the release follows under the parallel rule,
// runtime transition occluder-pass).
// From the blueprint template: film.js (world route, final overview overlay, hudStamp; PANEL_FADE_OUT 0.18 s,
// PANEL_BLUR_PX 5, HUD_ROT −3), choreography.js CUES.overview (final: route 0, panel 1.25, line1 1.5, line2 2,
// stamp 3, N0 3.5; ROUTE_B 1.5, MOVE_OV_B 1.5). The sheets under it are the film's own sheets when `pages` names
// them (`pages[k] = { scene, params }`: that blueprint scene brick is prepared and drawn in its last settled state,
// without its HUD, as the template's overview draws them); a sheet without a page is drawn as its frame, number, title
// and a little line work; `pages[k] === false` leaves its cell empty (a sheet not drafted yet: the layout keeps it,
// the route skips it). The panel covers them within 1.25 beats.
import { E, F, up, rgba, clamp, lerp, readTime, canvasOf, makePen, drawList, drawItem, makeStamp, drawStamp, stampBox, palOf, makeHud, hudDefaults, drawHud, drawLight, texturesOf, setLang, SW, SH } from '../../prop/sheet-hud/kit.js';

const DEFAULT = {
  en: { label: 'System overview — all sheets', lines: ['Signed first,', 'then shipped.'], stamp: { word: 'Approved', small: 'by the owner' },
    sheets: ['Problem statement', 'General arrangement', 'Console', 'Review', 'Stages', 'Canary'], hud: 'System overview' },
  zh: { label: '系统总览 — 全部图纸', lines: ['先签字，', '再上线。'], stamp: { word: '批准', small: '负责人' },
    sheets: ['问题说明', '总体布置', '控制台', '评审', '分阶段', '金丝雀'], hud: '系统总览' },
};
const M = 120, G = 120, MOVE = 1.5, ROUTE = 1.5, C = { route: 0, panel: 1.25, line1: 1.5, line2: 2.0, stamp: 3, N0: 3.5 };
const cellXY = (k) => { const r = Math.floor(k / 3), c = r % 2 === 0 ? k % 3 : 2 - (k % 3); return { x: M + c * (SW + G), y: M + r * (SH + G) }; };
const tplan = (s, bpm, L) => {
  const beat = 60 / bpm, at = (b) => (MOVE + b) * beat + 0.3;
  let prim = Math.max(at(C.line1), 0) + readTime(s.lines[0], L); prim = Math.max(prim, at(C.line2)) + readTime(s.lines[1] || '', L);
  prim = Math.max(prim, at(C.stamp)) + readTime(s.stamp?.word || '', L);
  const beats = Math.max(s.minBeats || 0, Math.ceil(Math.max(MOVE + C.N0 + 2, prim / beat + 0.5) - 1e-9));
  return { beats };
};
export default {
  id: 'sheet-overview', kind: 'scene',
  fits: ['claim', 'climax'],
  surface: ['canvas'],
  beats: { min: 7, max: 14 },
  needs: { motions: ['guide-letter'], props: ['sheet-hud', 'drafting-stamp'], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: {
    hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } },
    lines: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 4, chars: 18 }, zh: { chars: 7 } } } },
    stamp: { type: 'group', of: { word: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } }, small: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } } } },
    sheets: { type: 'list', count: [3, 8], of: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 24 }, zh: { chars: 8 } } } },
  },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], fromSheet: null, pages: null, seed: 7, frame: ctx.lang === 'zh' ? { title: 'lintel', subtitle: '先签字，再分阶段发布', corner: 'MIT · 开源', total: 7 } : { title: 'lintel', subtitle: 'Rollouts signed, then staged', corner: 'MIT · Open source', total: 7 } }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: P.beats, lead: MOVE, reads: s.lines.map((text) => ({ text, lang: ctx.lang, claim: true })),
      cues: [{ beat: MOVE + C.route, kind: 'turn' }, { beat: MOVE + C.line1, kind: 'claim' }, { beat: MOVE + C.line2, kind: 'land' }, { beat: MOVE + C.stamp, kind: 'stamp' }],
      motion: 'pull out to the whole drawing; the route through every sheet; the claim panel; the approval stamp in the title block', settled: MOVE + C.N0, peakAt: MOVE + C.stamp, pause: [MOVE + C.line2, P.beats], shots: [{ beat: 0, kind: 'pull-out' }, { beat: MOVE + C.panel, kind: 'panel' }] };
  },
  async prepare(s, c) {
    const L = c.lang || 'en', beat = 60 / c.bpm, P = palOf(s.colors, s.palette), mctx = canvasOf(8, 8).getContext('2d'), pl = tplan(s, c.bpm, L);
    setLang(L);
    const n = s.sheets.length, rows = Math.ceil(n / 3), W = 2 * M + 3 * SW + 2 * G, H = 2 * M + rows * SH + (rows - 1) * G, full = Math.min(SW / W, SH / H) * 0.985;
    const T = (b) => (MOVE + b) * beat, out = (pl.beats - 0.5) * beat;
    // the sheets: frame, crop marks, outlined number, title and a schematic box or two, all drawn already
    const world = makePen(P, mctx, { lang: L }), pages = [];
    for (const [k, pg] of (s.pages || []).entries()) {
      if (!pg || !pg.scene || k >= n) continue;
      const m = (await import(`../${pg.scene}/brick.js`)).default;
      const ps = { ...m.defaults({ lang: L }), ...(pg.params || {}), colors: s.colors, palette: s.palette, sheetNo: k + 1, frame: { ...(s.frame || {}), total: n }, from: 'none', lamp: 'host' };
      const pk = m.plan(ps, { lang: L, bpm: c.bpm }), Dk = await m.prepare(ps, c);
      pages[k] = { items: Dk.pen.items, t: (pk.beats - 0.6) * Dk.beat };
    }
    setLang(L);
    s.sheets.forEach((name, k) => {
      if (pages[k] || (s.pages || [])[k] === false) return;
      const { x, y } = cellXY(k);
      world.rect(x, y, SW, SH, -9, 0.1, 'sf');
      world.text(String(k + 1).padStart(2, '0'), x + 1790, y + 250, { fam: 'cond', w: 700, size: 140, outline: 2 }, -9, 0.1, { align: 'right', col: rgba(P.line, 0.42) });
      world.text(up(name), x + 150, y + 180, { fam: 'mono', w: 400, size: 25, track: 0.14 }, -9, 0.1, { col: 'line' });
      world.text(name, x + 142, y + 325, { fam: 'cond', w: 700, size: 140, track: -0.02 }, -9, 0.1);
      const bw = 420 + 90 * (k % 3);
      world.rect(x + 150, y + 520, bw, 240, -9, 0.1, 's1'); world.rect(x + 250 + bw, y + 520, 1540 - bw - 100, 240, -9, 0.1, 's1');
      world.seg(x + 150 + bw, y + 640, x + 250 + bw, y + 640, -9, 0.1, 's2');
    });
    const pts = s.sheets.map((_, k) => k).filter((k) => (s.pages || [])[k] !== false).map((k) => { const q = cellXY(k); return [q.x + SW / 2, q.y + SH / 2]; });
    const ln = world.line(pts, T(C.route), ROUTE * beat, 'route', { ease: E.cubicInOut }); ln.fadeOut = out; ln.fadeDur = 0.18;
    pts.forEach(([x, y], k) => { const d = world.dot(x, y, 34, T(C.route) + (ROUTE * beat * k) / Math.max(1, pts.length - 1), 'ink', { pop: true }); d.fadeOut = out; d.fadeDur = 0.18; });
    // the claim panel
    const over = makePen(P, mctx, { lang: L });
    over.text(up(s.label), 150, 290, { fam: 'mono', w: 400, size: 25, track: 0.14 }, T(C.panel) + 0.1, 0.4, { col: 'line' });
    s.lines.forEach((l, i) => {
      let f = { fam: 'cond', w: 700, size: 200, track: -0.02 };
      if (over.measure(l, f) > 1640) f = { ...f, size: 140 };
      const base = 476 + i * 212, tl = T(i ? C.line2 : C.line1);
      over.guides(base, f.size, tl - 0.15, 80, 1840, l);
      over.text(l, 142, base, f, tl, 0.6);
    });
    over.items.forEach((it) => { it.fadeOut = out; it.fadeDur = 0.18; });
    const Hd = makeHud(P, null, { ...hudDefaults[L === 'zh' ? 'zh' : 'en'], ...(s.frame || {}), sheet: 'all', name: s.hud }, L);
    let st = null;
    for (let size = 36; size >= 28; size -= 2) { st = makeStamp(P, mctx, s.stamp, size, (s.seed || 7) + 999); if (stampBox(st, -3)[1] <= 112) break; }
    const ap = Hd.approve, stampT = T(C.stamp);
    const from = s.fromSheet ?? n - 1, f0 = cellXY(from);
    const cam = (t) => {
      const e = E.quartInOut(clamp(t / (MOVE * beat))), d = E.sineInOut(clamp((t - MOVE * beat) / (4 * beat)));
      const x = lerp(f0.x + SW / 2, W / 2, e), y = lerp(f0.y + SH / 2, H / 2, e), sc = Math.exp(lerp(0, Math.log(full), e)) * (1 + 0.008 * d);
      const dt = t - stampT, amp = dt >= 0 && dt < 0.25 ? 3 * Math.exp(-dt * 18) : 0;
      return { x, y, s: sc, dx: amp * Math.sin(dt * 95), dy: amp * 0.7 * Math.cos(dt * 73) };
    };
    const panelA = (t) => clamp((t - T(C.panel)) / 0.3) * (1 - E.quadIn((t - out) / 0.18));
    return { P, beat, world, pages, over, Hd, st, ap, stampT, cam, panelA, W, H, T: texturesOf(P, s.seed || 7), scratch: canvasOf(1920, 1080) };
  },
  paint(ctx, u, s, c, D) {
    const t = u * D.beat, cam = D.cam(t), P = D.P;
    ctx.save();
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, SW, SH);
    const ox = 960 - cam.x * cam.s + cam.dx, oy = 540 - cam.y * cam.s + cam.dy;
    ctx.setTransform(cam.s, 0, 0, cam.s, ox, oy);
    ctx.fillStyle = P.paper; ctx.fillRect(0, 0, D.W, D.H);
    const fineA = P.grid[0] * clamp((cam.s - 0.42) / 0.4);
    const grid = (step, off, w, a) => { if (a <= 0.001) return; ctx.beginPath(); for (let x = off; x <= D.W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, D.H); } for (let y = off; y <= D.H; y += step) { ctx.moveTo(0, y); ctx.lineTo(D.W, y); } ctx.strokeStyle = rgba(P.line, a); ctx.lineWidth = w; ctx.stroke(); };
    grid(40, 0, 1, fineA); grid(200, 120, 2, P.grid[1]);
    drawList(ctx, P, D.world.items, t);
    D.pages.forEach((pg, k) => { if (!pg) return; const q = cellXY(k); ctx.save(); ctx.translate(q.x, q.y); drawList(ctx, P, pg.items, pg.t); ctx.restore(); });
    ctx.restore();
    const pa = D.panelA(t);
    if (pa > 0) {
      const g = D.scratch.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'copy'; g.drawImage(ctx.canvas, 0, 0);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `blur(${(5 * pa).toFixed(2)}px)`; ctx.drawImage(D.scratch, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, 1920, 1080); ctx.restore();
    }
    drawLight(ctx, P, D.T, t, s.lampT || 0);
    if (pa > 0) { ctx.save(); ctx.globalAlpha = pa * 0.84; ctx.fillStyle = P.paper; ctx.fillRect(0, 0, SW, SH); ctx.restore(); }
    drawList(ctx, P, D.over.items, t);
    drawHud(ctx, P, D.Hd, cam, 0);
    drawStamp(ctx, D.st, D.ap[0] + D.ap[2] / 2 + cam.dx * 0.3, D.ap[1] + D.ap[3] / 2, -3, D.stampT, t);
  },
  track() { return [[960, 540]]; },
};
