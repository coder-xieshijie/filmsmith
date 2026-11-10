// scenes.js — the six strip scenes on one light box: their timelines (the template's choreo.js `local`, in beats
// from the scene's start, read with lang.js times) and the shared scene body the scene bricks reel-titles,
// gate-frames, frame-punch, length-sheet, pick-run and reel-lockup are made of. A scene that opens with a landing in
// the gate (titles, frames, a lock-up with a source) declares `lead: 0.25`: its first pull-down plays under the
// scene before, so the first frame registers on the boundary (SPEC 3.2); its own clock starts at the pull.
import {
  C, GATE, GATE_RECT, CAP_Y, CAP_Y_SHEET, fonts, caption, cellOf, cellsOf, sampleEnv, stripParams, paintReel, trackReel, gateCorners, reelAt, trackState,
  rowsOf, cellRect, paintRows, sheetState, punchOf, pickOf, lockupText, readBeats, q4, ceil1, pIn, lightbox, pencilLoop, FULL, drawCrop, cellFrame,
  clamp, lerp, cubicInOut,
} from './reel.js';
import { placeholderFrame } from '../../../handoffs/stage.js';

const lineOf = (l) => (typeof l === 'string' ? { text: l } : { ...l });

// ── timelines (beats from the scene's start, its lead included) ─────────────────────────────────────────────────────
export const timeline = (type, s, ctx) => {
  const B = 60 / ctx.bpm, lang = ctx.lang, T = { type, B, landings: [], captions: [], items: [] };
  if (type === 'titles') {
    const lines = (s.lines || []).map(lineOf), run = !!s.run;
    T.lead = run ? 0 : C.pull;
    const L0 = run ? C.runIn : T.lead;
    const slot = lines.map((l) => Math.max(1, q4(readBeats(l.text, lang, B) + C.pull)));
    const cap = lines.map((l, k) => Math.max(0, C.holdMax - (slot[k] - C.pull - (l.track ? C.track[1] : 0))));
    T.need = L0 + slot.reduce((a, b) => a + b, 0) - C.pull;
    T.beats = Math.max(s.beats || 0, ceil1(T.need));
    let extra = T.beats - T.need;
    const totalCap = cap.reduce((a, b) => a + b, 0) || 1;
    const add = cap.map((c) => Math.floor(Math.min(c, (extra * c) / totalCap) * 4 + 1e-9) / 4);
    extra -= add.reduce((a, b) => a + b, 0);
    for (let k = 0; extra > 1e-6 && k < 4 * lines.length; k++) { const j = k % lines.length; if (add[j] + 0.25 <= cap[j] + 1e-9) { add[j] += 0.25; extra -= 0.25; } }
    let L = L0;
    lines.forEach((l, k) => {
      T.landings.push({ at: L, line: k, text: l.text });
      T.items.push({ text: l.text });
      if (l.track) T.track = [L + C.track[0], L + C.track[1]];
      L += slot[k] + add[k];
    });
    if (run) T.run = [0, C.runIn];
  }
  if (type === 'frames') {
    const n = (s.frames || []).length;
    T.lead = C.pull; T.need = T.lead + n; T.beats = Math.max(s.beats || 0, ceil1(T.need));
    (s.frames || []).forEach((f, k) => {
      const at = T.lead + k;
      T.landings.push({ at });
      if (f.name) { T.captions.push({ from: at, to: k === n - 1 ? T.beats : at + 1 - C.pull, text: f.name }); T.items.push({ text: f.name }); }
    });
  }
  if (type === 'punch') {
    T.lead = 0; T.punch = [0, C.punch]; T.full = [C.punch, C.punch + C.full]; T.out = [C.punch + C.full, C.punch + C.full + C.back];
    T.need = T.out[1]; T.beats = Math.max(s.beats || 0, ceil1(T.need));
  }
  if (type === 'sheet') {
    const lines = (s.lines || []).map(lineOf), rows = s.rows || [];
    const short = Math.min(...rows.map((r) => r.duration)), longer = rows.filter((r) => r.duration > short + 1e-3).length;
    const l1 = 1, r1 = readBeats(lines[0]?.text, lang, B);
    T.lead = 0;
    T.extend = longer ? [2, 2.75 + C.rowStep * (longer - 1)] : null;
    const extEnd = T.extend ? T.extend[1] : 2;
    if (lines[0]) { T.captions.push({ from: l1, text: lines[0].text }); T.items.push({ text: lines[0].text }); }
    let L2 = null, lenAt;
    if (lines[1]) {
      L2 = ceil1(Math.max(l1 + r1, extEnd + 0.25));
      // a scene given more beats than it needs holds the pulled-out strips up to a beat longer before they are measured
      const need0 = ceil1(Math.max(L2 + readBeats(lines[1].text, lang, B), L2 + 0.25 + C.rowStep * rows.length + 0.25));
      L2 += Math.max(0, Math.min(1, (s.beats || 0) - need0));
      T.captions[0].to = L2; T.captions.push({ from: L2, text: lines[1].text }); T.items.push({ text: lines[1].text });
      lenAt = L2 + 0.25; T.L2 = L2;
    } else lenAt = Math.max(extEnd + 0.25, ceil1(l1 + r1));
    T.lengths = [lenAt, lenAt + C.rowStep * rows.length];
    const readEnd = L2 != null ? L2 + readBeats(lines[1].text, lang, B) : l1 + r1;
    T.need = ceil1(Math.max(readEnd, T.lengths[1] + 0.25)); T.beats = Math.max(s.beats || 0, T.need);
    if (T.captions.length) T.captions.at(-1).to = T.beats;
  }
  if (type === 'pick') {
    const run = s.run, runBeats = run?.frames?.length > 1 ? (run.frames.length - 1) / (run.fps || 30) / B : C.full;
    T.lead = 0; T.loop = [0, C.loop]; T.stepBack = [C.loop, C.loop + C.step]; T.pick = [C.loop + 1, C.loop + 1 + C.pick];
    T.run = [T.pick[1], T.pick[1] + runBeats]; T.back = [T.run[1], T.run[1] + C.back];
    T.need = ceil1(T.back[1]); T.beats = Math.max(s.beats || 0, T.need);
    if (s.caption) { T.captions.push({ from: 0, to: T.pick[0] + 0.5, text: s.caption }); T.items.push({ text: s.caption }); }
  }
  if (type === 'lockup') {
    T.lead = s.source ? C.pull : 0;
    const src = s.source ? T.lead : null, lineAt = src ?? 0.5, r = readBeats(s.line, lang, B);
    const runOut = ceil1(Math.max(lineAt + r, lineAt + 1)), nameAt = runOut + 2, urlAt = nameAt + 1;
    const urlBeats = Math.max(0.5, String(s.url || '').length / C.urlCps / B);
    T.source = src; T.runOut = [runOut, runOut + C.runOut]; T.name = [nameAt, nameAt + 0.4]; T.url = [urlAt, urlAt + urlBeats];
    T.need = urlAt + urlBeats + C.urlHold / B; T.beats = Math.max(s.beats || 0, ceil1(T.need));
    const u0 = Math.max(urlAt + urlBeats + 0.5, T.beats - 4); T.underline = [u0, u0 + 0.75];
    if (s.line) { T.captions.push({ from: lineAt, to: runOut, text: s.line }); T.items.push({ text: s.line }); }
    T.items.push({ text: s.name }, { text: s.url });
  }
  return T;
};

// ── the body ─────────────────────────────────────────────────────────────────────────────────────────────────────
const MOTION = { titles: 'strip-advance', frames: 'strip-advance', punch: 'gate-punch', sheet: 'row-pull', pick: 'sheet-pick', lockup: 'strip-advance' };
export const sceneBody = (type) => {
  // the sheet at beat b (the pick's: rows stepped back, the loop drawn)
  const sheetAt = (g, s, D, b, loop = true) => {
    const T = D.T, pickRow = type === 'pick' ? s.cell.row : -1;
    lightbox(g, D.Cl);
    const st = type === 'sheet' ? sheetState(b, D.rows, { extend: T.extend, lengths: T.lengths[0] }) : sheetState(b, D.rows, { pickRow, back: type === 'pick' ? cubicInOut(pIn(b, T.stepBack)) : 0 });
    paintRows(g, D.Cl, D.F, D.rows, st);
    if (loop && type === 'pick') pencilLoop(g, D.Cl, D.rect, cubicInOut(pIn(b, T.loop)), { seed: s.seed ?? 3 });
  };
  const captionAt = (b, D) => { const c = D.T.captions.find((x) => b >= x.from - 1e-9 && b < (x.to ?? Infinity) - 1e-9); return c?.text ?? null; };
  return {
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'muted', 'glow', 'base', 'hole', 'title', 'titleInk', 'trackDim', 'trackLit'],
  plan(s, ctx) {
    const T = timeline(type, s, ctx), cues = [];
    for (const L of T.landings) cues.push({ beat: L.at, kind: 'land' });
    if (type === 'titles' && s.hook && T.landings.length) cues.push({ beat: T.landings.at(-1).at, kind: 'hook' });
    if (type === 'punch') cues.push({ beat: 0, kind: 'accent' }, { beat: T.punch[1], kind: 'land' });
    if (type === 'sheet') { cues.push({ beat: 0, kind: 'land' }); if (T.L2 != null) cues.push({ beat: T.L2, kind: 'accent' }); }
    if (type === 'pick') cues.push({ beat: T.loop[1], kind: 'accent' }, { beat: T.pick[1], kind: 'claim' });
    if (type === 'lockup') cues.push({ beat: T.name[0], kind: 'lockup' }, { beat: T.underline[0], kind: 'end' });
    const settled = T.landings[0]?.at ?? (type === 'punch' ? T.punch[1] : type === 'pick' ? T.pick[1] : type === 'lockup' ? T.name[0] : 1);
    return { beats: T.beats, lead: T.lead, reads: T.items.filter((i) => i.text).map((i) => ({ text: i.text, lang: ctx.lang })), cues, motion: MOTION[type], settled: Math.ceil(settled), peakAt: type === 'pick' ? T.pick[1] : type === 'lockup' ? T.name[0] : null, pause: 0 };
  },
  validate(s) {
    const e = [];
    if (type === 'titles' && !((s.lines || []).length >= 1 && s.lines.length <= 4)) e.push('lines: 1 to 4');
    if (type === 'frames' && !((s.frames || []).length >= 1)) e.push('frames: at least one');
    if (['punch', 'sheet', 'pick'].includes(type) && !((s.rows || []).length >= 1 && s.rows.length <= 10)) e.push('rows: 1 to 10');
    if (['punch', 'pick'].includes(type) && !(s.cell && s.rows?.[s.cell.row])) e.push('cell: { row, cell } on the sheet');
    if (type === 'lockup' && !(s.name && s.url)) e.push('name and url');
    return e;
  },
  async prepare(s, ctx) {
    const T = timeline(type, s, ctx), Cl = s.colors, F = fonts(ctx.lang), D = { T, Cl, F };
    if (type === 'titles') {
      const lines = (s.lines || []).map(lineOf), fill = s.run ? await cellsOf(s.fill?.length ? s.fill : Array.from({ length: C.fill }, () => ({})), 0) : [await cellOf(s.before, 5)];
      // `after`: the cells that follow on the same reel (the next scene's frames), so the strip runs on past the gate
      D.cells = [...fill, ...(await cellsOf(lines.map((l) => ({ text: l.text, env: l.env ?? (l.track ? sampleEnv(3) : null) })))), ...(await cellsOf(s.after || [], 6))];
      D.stops = T.landings.map((L, k) => [L.at, fill.length + k]);
      D.from = s.run ? null : 0;
    }
    if (type === 'frames') {
      D.cells = [await cellOf(s.before, 5), ...(await cellsOf(s.frames, 0)), ...(await cellsOf(s.after || [], 6))];
      D.stops = T.landings.map((L, k) => [L.at, 1 + k]); D.from = 0;
    }
    if (type === 'lockup') {
      D.cells = [await cellOf(s.before, 7), ...(s.source ? [await cellOf(s.source, 8)] : [])];
      D.stops = s.source ? [[T.source, 1]] : [[0, 0]]; D.from = 0;
    }
    if (D.cells) D.P = stripParams(Cl, F, D.cells);
    if (['punch', 'sheet', 'pick'].includes(type)) D.rows = await rowsOf(s.rows);
    if (type === 'punch') {
      const f = await cellOf(s.frame, 9), before = await cellOf(s.before, 8), r = cellRect(D.rows.length, s.cell.row, s.cell.cell), small = D.rows[s.cell.row].cells[s.cell.cell];
      const gate = stripParams(Cl, F, [before, f]);
      D.in = punchOf(Cl, { rect: GATE_RECT, direction: 'in', ease: 'out', image: f.img, crop: f.crop, under: (g) => { lightbox(g, Cl); paintReel(g, gate, 1); gateCorners(g, Cl); } });
      D.outM = punchOf(Cl, { rect: r, direction: 'out', ease: 'inOut', image: f.img, crop: f.crop, small, under: (g) => { lightbox(g, Cl); paintRows(g, Cl, F, D.rows, sheetState(0, D.rows, { extend: [Infinity, Infinity], lengths: Infinity })); } });
      D.f = f;
    }
    if (type === 'pick') {
      const frames = await cellsOf(s.run?.frames?.length ? s.run.frames : [{ n: 2 }], 2), first = frames[0], last = frames.at(-1);
      const r = cellRect(D.rows.length, s.cell.row, s.cell.cell), small = D.rows[s.cell.row].cells[s.cell.cell];
      D.frames = frames; D.fps = s.run?.fps || 30; D.rect = r;
      D.pickM = pickOf(Cl, { rect: r, image: first.img, crop: first.crop, small, seed: s.seed ?? 3, under: (g) => sheetAt(g, s, D, T.pick[0], false) });
      const close = stripParams(Cl, F, [frames[Math.floor((frames.length - 1) / 2)], last]);
      D.backM = punchOf(Cl, { rect: GATE_RECT, direction: 'out', ease: 'inOut', image: last.img, crop: last.crop, under: (g) => { lightbox(g, Cl); paintReel(g, close, 1); gateCorners(g, Cl); } });
    }
    return D;
  },
  paint(g, u, s, c, D) {
    const T = D.T, b = u, Cl = D.Cl, F = D.F;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    if (D.cells) {
      lightbox(g, Cl);
      let sPos = reelAt(b, D.stops, { from: D.from, run: T.run || null }), corners = 1;
      if (type === 'lockup') { if (b >= T.runOut[0]) sPos = lerp(sPos, D.cells.length + 0.75, cubicInOut(pIn(b, T.runOut))); corners = 1 - clamp((b - T.runOut[0]) / 0.5); }
      if (!(type === 'lockup' && b > T.runOut[1] + 0.01)) paintReel(g, D.P, sPos, { track: trackState(b, T.track) });
      gateCorners(g, Cl, corners);
      caption(g, captionAt(b, D), CAP_Y, Cl, F);
      if (type === 'lockup') lockupText(g, s, b, T, Cl, F, T.B);
      return;
    }
    if (type === 'punch') {
      if (b < T.punch[1]) return D.in.paint(g, pIn(b, T.punch));
      if (b < T.out[0]) return drawCrop(g, D.f.img, D.f.crop, FULL);
      return D.outM.paint(g, pIn(b, T.out));
    }
    if (type === 'sheet') { sheetAt(g, s, D, b); caption(g, captionAt(b, D), CAP_Y_SHEET, Cl, F); return; }
    if (type === 'pick') {
      if (b < T.pick[0]) { sheetAt(g, s, D, b); caption(g, captionAt(b, D), CAP_Y_SHEET, Cl, F); return; }
      if (b < T.pick[1]) return D.pickM.paint(g, pIn(b, T.pick));
      if (b < T.back[0]) { const k = Math.min(D.frames.length - 1, Math.max(0, Math.floor((b - T.run[0]) * T.B * D.fps + 1e-6))); return drawCrop(g, D.frames[k].img, D.frames[k].crop, FULL); }
      return D.backM.paint(g, pIn(b, T.back));
    }
  },
  track(u, s, c, D) {
    const T = D.T, b = u;
    if (D.cells) return [[cellFrame(0, reelAt(b, D.stops, { from: D.from, run: T.run || null }), GATE.cx, GATE.top, 1).x, 0]];
    if (type === 'punch') return b < T.punch[1] ? D.in.track(pIn(b, T.punch)) : b < T.out[0] ? [[0, 0]] : D.outM.track(pIn(b, T.out));
    if (type === 'pick') return b >= T.pick[0] && b < T.pick[1] ? D.pickM.track(pIn(b, T.pick)) : b >= T.back[0] ? D.backM.track(pIn(b, T.back)) : [[0, 0]];
    return [[0, 0]];
  },
  };
};

// ── sample content ───────────────────────────────────────────────────────────────────────────────────────────────
export const SAMPLE_ROWS = [['Thread', 40], ['Ink', 34.867], ['Plakat', 46], ['Blueprint', 43.2], ['Phosphor', 42.6], ['Tally', 32], ['Trace', 36], ['Morph', 32]].map(([name, duration]) => ({ name, duration, image: null }));
export const SAMPLE_FRAMES = ['Thread', 'Ink', 'Plakat', 'Blueprint', 'Phosphor'].map((name, n) => ({ name, n, env: sampleEnv(n + 1) }));
export { placeholderFrame };
