// inspection-record — verification as an inspection record: a table of 3–8 checks, a computed count k / n at 280 px, a note and a
// footer; the probe run crosses the record at a machine's steady feed and each row's result is drafted as it passes;
// the inspection stamp in the line colour lands on beat 5 beside the count. The lamp itself is the host's
// transition (blueprint-expose, develop: false); `lamp: 'line'` draws a stand-in feed line for the sample.
// From the blueprint template's `checklist` sheet (assets/templates/blueprint/sheets/checklist.js; choreography.js CUES.checklist): the
// planner and its cue table are copied unchanged (capitals go through caseOf, Chinese takes the library floors and
// em-box construction lines in the pen, sheet-hud/kit.js); the brick adds the arrival (its first beat, plan lead 1),
// the sheet's two-beat hold, its reading time, its push-in on the stamp and the frame.
import { E, X0, X1, CW, F, MIN, ISO, up, header, sz, union, fitStamp, solveStamp, box, spans, rgba, fontStr, partial, polyLen, pointAt, strokePts, crit, clamp, CHECK_TABLE, checkRows, scanRowBeats, lampPass, SCAN_B, STAMP_B, STAMP_N0, ISSUE_N0, FLOOD_AFTER_B, FLOOD_B, PUSH_BACK_B, prepareSheet, makeHud, hudDefaults, drawWorld, drawLight, drawHud, foldOf, camOf, ARRIVE_B, readTime, zf, hasCJK } from '../../prop/sheet-hud/kit.js';

const CUES = () => ({
    N0: STAMP_N0, stamp: STAMP_B,
    c: { title: 0, sub: 0.5, table: 0.8, count: 1.4, label: 1.6, scan: 2.0, note: 3.0, footer: 3.3 },
    sounds: [['title', 'pen'], ['table', 'pen'], ['scan', 'scan'], ['note', 'pen'], ['footer', 'pen']],
  });


const sheetPlan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 90);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.8, { col: 'muted' });

  const items = s.items || [];
  const n = items.length;
  if (n < 3 || n > 8) env.err('items needs 3–8 entries');
  const pass = items.filter((x) => x.ok).length;
  const { rh, yc: rowY } = checkRows(n);
  const tx = X0, ty = CHECK_TABLE.y, tw = 760, hh = CHECK_TABLE.head, th = hh + n * rh + 12;
  const tt = c('table');
  pen.rect(tx, ty, tw, th, tt, 0.5, 's1');
  pen.seg(tx, ty + hh, tx + tw, ty + hh, tt + 0.1, 0.3, 's1');
  pen.seg(600, ty, 600, ty + th, tt + 0.1, 0.3, 'sf');
  const head = s.head || ['Req', 'Result'];
  head.forEach((h, i) => env.lim(`head[${i}]`, h, 16));
  pen.text(up(head[0]), 176, ty + 34, F.tag, tt + 0.1, 0.3, { col: 'line' });
  pen.text(up(head[1] || ''), 630, ty + 34, F.tag, tt + 0.15, 0.3, { col: 'line' });
  const fid = { fam: 'mono', w: 400, size: 35 };
  // each row's result is drafted as the probe run's lamp passes it (timeline.js s.scan.rows, from choreography.js)
  const chk = items.map((_, i) => s.scan?.rows?.[i] ?? c('scan'));
  items.forEach((it, i) => {
    env.lim(`items[${i}].id`, it.id, 8);
    const yc = rowY[i];
    pen.text(it.id, 176, yc + 9, fid, tt + 0.15 + i * 0.05, 0.25);
    if (i < n - 1) pen.seg(tx, ty + hh + rh * (i + 1) + 6, tx + tw, ty + hh + rh * (i + 1) + 6, tt + 0.15 + i * 0.05, 0.25, 'sg');
    if (it.ok) pen.line([[642, yc], [652, yc + 11], [674, yc - 11]], chk[i], 0.14, 's2', { ease: E.quadOut, width: 4 });
    else { pen.seg(644, yc - 10, 664, yc + 10, chk[i], 0.1, 's2'); pen.seg(664, yc - 10, 644, yc + 10, chk[i] + 0.06, 0.1, 's2'); }
  });

  // the count: k/n where k = rows ticked so far (computed, so it can never disagree with the table)
  const fc = { fam: 'cond', w: 700, size: 280, track: -0.03 };
  const cxL = 1030, cBase = 650;
  const cw = pen.measure(`${n}/${n}`, fc);
  pen.custom(c('count'), (ctx, t) => {
    let k = 0;
    items.forEach((it, i) => { if (it.ok && t >= chk[i] + 0.08) k++; });
    const v = Math.min(1, (t - c('count')) / 0.25);
    ctx.save();
    ctx.globalAlpha *= v;
    ctx.font = fontStr(fc);
    ctx.letterSpacing = `${(fc.track * fc.size).toFixed(1)}px`;
    ctx.fillStyle = P.ink;
    ctx.fillText(`${k}/${n}`, cxL, cBase);
    ctx.restore();
  });
  env.lim('countLabel', s.countLabel, 26);
  pen.text(s.countLabel || '', cxL + 10, cBase + 68, F.body, c('label'), 0.5, { col: 'muted' }); // below the slash's descent
  if (s.note) {
    env.lim('note', s.note, 30);
    const fnote = sz(F.body, 35), nw = pen.measure(s.note, fnote) + 40;
    if (cxL + 16 + nw > X1) env.err('note is too wide');
    pen.rect(cxL + 16, cBase + 96, nw, 60, c('note'), 0.5, 's1', { dash: 'dash' });
    pen.text(s.note, cxL + 36, cBase + 136, fnote, c('note') + 0.1, 0.5);
  }
  if (s.footer) {
    env.lim('footer', s.footer, 48);
    const oc = [168, 862], r = 16, pts = [];
    for (let k = 0; k <= 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; pts.push([oc[0] + r * Math.cos(a), oc[1] + r * Math.sin(a)]); }
    pen.line(pts, c('footer') - 0.1, 0.3, 's1');
    pen.seg(oc[0] - 8, oc[1], oc[0] + 8, oc[1], c('footer') + 0.15, 0.1, 's1');
    pen.text(s.footer, 198, 876, env.fit(s.footer, { fam: 'cond', w: 600, size: 35 }, X1 - 198, 30, 'footer'), c('footer'), 0.6);
  }

  let stamp = null;
  if (s.stamp) {
    env.lim('stamp.word', s.stamp.word, 10);
    const count = [cxL, cBase - fc.size * 0.72, cw, fc.size * 0.8]; // the count is custom-drawn: not a pen text item
    const p = fitStamp(pen, env, { word: s.stamp.word, small: s.stamp.small || `${pass} / ${n}` }, { sizes: [70, 50], rot: -6, role: 'line', prefer: [cxL + cw + 190, cBase - 120], region: [tx + tw + 20, ty - 20, X1 + 40, 900], avoid: [count], where: 'checklist stamp' });
    env.placeStamp(p.st, p.cx, p.cy, -6);
    stamp = p.rect;
  }
  return { title, focus: union([cxL, cBase - 210, cw, 290], stamp), stamp };
};

const DEFAULT = {
 "en": {
  "hud": "Detail 04 · Canary",
  "label": "Detail 04 — canary probes",
  "title": "CANARY",
  "sub": "Every stage, checked by machine.",
  "head": [
   "Probe",
   "In limit"
  ],
  "items": [
   {
    "id": "errors",
    "ok": true
   },
   {
    "id": "p95",
    "ok": true
   },
   {
    "id": "cpu",
    "ok": true
   },
   {
    "id": "memory",
    "ok": true
   },
   {
    "id": "restarts",
    "ok": true
   },
   {
    "id": "alerts",
    "ok": true
   }
  ],
  "countLabel": "probes within limits",
  "note": "Over limit → rolls back",
  "footer": "A rollback pages the owner.",
  "stamp": {
   "word": "Verified"
  },
  "frame": {
   "title": "lintel",
   "subtitle": "Rollouts signed, then staged",
   "corner": "MIT · Open source",
   "total": 7
  }
 },
 "zh": {
  "hud": "详图 04 · 金丝雀",
  "label": "详图 04 — 金丝雀探针",
  "title": "金丝雀",
  "sub": "每个阶段都由机器检查。",
  "head": [
   "探针",
   "未超限"
  ],
  "items": [
   {
    "id": "errors",
    "ok": true
   },
   {
    "id": "p95",
    "ok": true
   },
   {
    "id": "cpu",
    "ok": true
   },
   {
    "id": "memory",
    "ok": true
   },
   {
    "id": "restarts",
    "ok": true
   },
   {
    "id": "alerts",
    "ok": true
   }
  ],
  "countLabel": "个探针在限内",
  "note": "超限 → 自动回滚",
  "footer": "一旦回滚，通知负责人。",
  "stamp": {
   "word": "已验证"
  },
  "frame": {
   "title": "lintel",
   "subtitle": "先签字，再分阶段发布",
   "corner": "MIT · 开源",
   "total": 7
  }
 }
};
// the strings read in draw order: [cue, text, glance]
const READS = (s) => [['title', s.label, true], ['title', s.title], ['sub', s.sub, true], ['table', (s.items || []).map((x) => x.id).join(' '), true], ['label', s.countLabel], ['note', s.note], ['footer', s.footer]];
const tplan = (s, bpm, L) => {
  const def = CUES(s), beat = 60 / bpm, cue = def.c;
  let prim = 0, gl = 0;
  for (const [k, x, g] of READS(s).filter((r) => r[1]).sort((a, b) => (cue[a[0]] ?? 0) - (cue[b[0]] ?? 0))) {
    const at = (ARRIVE_B + (cue[k] ?? 0)) * beat + 0.3;
    if (g) gl = Math.max(gl, at + (g === true ? 1 : g)); else prim = Math.max(prim, at) + readTime(String(x), L);
  }
  const build = ARRIVE_B + (def.stamp != null ? Math.max(def.N0, def.stamp + 1) : def.N0) + 2;
  const beats = Math.max(s.minBeats || 0, Math.ceil(Math.max(build, Math.max(prim, gl) / beat + 1) - 1e-9));
  return { def, beats };
};
export default {
  id: 'inspection-record', kind: 'scene',
  fits: ["proof"],
  surface: ['canvas'],
  beats: { min: 10, max: 18 },
  needs: { motions: ["guide-letter"], props: ["sheet-hud"], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: { hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } }, title: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } }, sub: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 90 }, zh: { chars: 20 } } }, head: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 16 }, zh: { chars: 6 } } } }, items: { type: 'list', count: [3, 8], of: { id: { type: 'code', tier: 'glance', limits: { en: { chars: 8 }, zh: { chars: 8 } } }, ok: { type: 'flag', default: true } } }, countLabel: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 26 }, zh: { chars: 10 } } }, note: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 5, chars: 30 }, zh: { chars: 12 } } }, footer: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 8, chars: 48 }, zh: { chars: 18 } } }, stamp: { type: 'group', of: { word: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } } } } },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], sheetNo: 6, from: 'left', seed: 7, linework: 'ink' }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), c = P.def.c;
    const cues = (P.def.sounds || []).map(([k, kind]) => ({ beat: ARRIVE_B + (c[k] ?? 0), kind: { pen: 'land', box: 'tick', mark: 'accent', tick: 'tick', clack: 'hit', scan: 'turn', flood: 'turn', reinterpret: 'turn', unfold: 'turn', slot: 'tick' }[kind] || 'tick' }));
    if (P.def.stamp != null) cues.push({ beat: ARRIVE_B + P.def.stamp, kind: 'stamp' });
    return { beats: P.beats, lead: ARRIVE_B, reads: READS(s).filter((r) => r[1] && !r[2]).map((r) => ({ text: String(r[1]), lang: ctx.lang })), cues,
      motion: 'the camera arrives drawing; lines and lettering draft themselves; the probe run crosses the record and ticks each row; the count climbs; the line-colour stamp drops on beat 5', settled: ARRIVE_B + P.def.N0, peakAt: ARRIVE_B + P.def.stamp, shots: P.def.stamp != null ? [{ beat: ARRIVE_B + P.def.stamp - 1.5, kind: "push-in" }] : [] };
  },
  async prepare(s, c) {
    const P = tplan(s, c.bpm, c.lang), def = P.def;
    s = { ...s, scan: { rows: scanRowBeats((s.items || []).length, s.scanDir || 'down').map((b) => (ARRIVE_B + def.c.scan + b) * 60 / c.bpm) } };
    const D = prepareSheet(sheetPlan, def.c, s, c, { N0: def.N0, stampB: def.stamp ?? null, issue: s.issue === true });
    const F0 = { ...hudDefaults[c.lang === 'zh' ? 'zh' : 'en'], ...(s.frame || {}), sheet: s.sheetNo, name: s.hud };
    D.H = makeHud(D.P, null, F0, c.lang);
    D.cam = camOf({ beat: D.beat, from: s.from, push: D.push, holdStart: (ARRIVE_B + def.N0) * D.beat, impacts: D.stampT != null ? [D.stampT] : [] });
    D.beats = P.beats;
    return D;
  },
  paint(ctx, u, s, c, D) {
    const t = u * D.beat, cam = D.cam(t);
    drawWorld(ctx, D.P, cam, D.pen.items, t);
    if (s.lamp !== 'host' && D.cues.scan !== undefined) { const p = clamp((t - D.cues.scan) / (SCAN_B * D.beat)); if (p > 0 && p < 1) { const cio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2), e = p * 0.55 + cio(p) * 0.45, y = -210 + (1080 + 420) * e; ctx.save(); const g = ctx.createLinearGradient(0, y - 90, 0, y + 90); g.addColorStop(0, rgba(D.P.line, 0)); g.addColorStop(0.5, rgba(D.P.line, 0.22)); g.addColorStop(1, rgba(D.P.line, 0)); ctx.globalCompositeOperation = D.P.dark ? 'screen' : 'multiply'; ctx.fillStyle = g; ctx.fillRect(0, y - 90, 1920, 180); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = rgba(D.P.ink, 0.7); ctx.fillRect(0, y - 1, 1920, 2); ctx.restore(); } }
    drawLight(ctx, D.P, D.T, t, s.lampT || 0);
    drawHud(ctx, D.P, D.H, cam, foldOf(D.push, t));
  },
  track() { return [[960, 540]]; },
};
