// release-block — the end card as a title block: a kicker, the product name dimensioned at 200 px, tags as framed chips, the
// URL in a framed field (held ≥ 3 s), a key plan of the sheets, a foot line; RELEASED lettered in a framed field
// on the last downbeat (the closing second move).
// From the blueprint template's `release` sheet (assets/templates/blueprint/sheets/release.js; choreography.js CUES.release): the
// planner and its cue table are copied unchanged (capitals go through caseOf, Chinese takes the library floors and
// em-box construction lines in the pen, sheet-hud/kit.js); the brick adds the arrival (its first beat, plan lead 1),
// the sheet's two-beat hold, its reading time, its push-in on the stamp and the frame.
import { E, X0, X1, CW, F, MIN, ISO, up, header, sz, union, fitStamp, solveStamp, box, spans, rgba, fontStr, partial, polyLen, pointAt, strokePts, crit, clamp, CHECK_TABLE, checkRows, scanRowBeats, lampPass, SCAN_B, STAMP_B, STAMP_N0, ISSUE_N0, FLOOD_AFTER_B, FLOOD_B, PUSH_BACK_B, prepareSheet, makeHud, hudDefaults, drawWorld, drawLight, drawHud, foldOf, camOf, ARRIVE_B, readTime, zf, hasCJK, canvasOf, makeStamp, stampBox, drawStamp } from '../../prop/sheet-hud/kit.js';

const CUES = (s) => {
    const c = { kicker: 0, name: 0.2, urlBox: 1.5, url: 1.6, key: 1.2, foot: 2.4 };
    s.tags.forEach((_, i) => (c['tag' + i] = 1.0 + i * 0.25));
    // 'status' (the RELEASED lettering) is timed from the scene's end in timeline.js: the film's last downbeat.
    // N0 = 4: the last part (the key plan's end dot, the foot line) has landed by beat ~3.5 anywhere in the
    // tempo range, so a 2-bar release can still letter its status on the last downbeat
    return { N0: 4, c, sounds: [['name', 'pen'], ['urlBox', 'box'], ['foot', 'pen'], ['status', 'box']] };
  };


const sheetPlan = (pen, env, s) => {
  const { c, layout } = env;
  env.lim('hud', s.hud, 24);
  env.lim('label', s.label, 36);
  pen.text(up(s.label || 'Release'), X0, 180, F.label, c('kicker') - 0.42, 0.4, { col: 'line' });

  // key plan (top right): one cell per sheet, the serpentine route through them
  const kw = 90, kh = 58, kg = 14, cols = layout.cols, rows = layout.rows;
  const keyW = cols * kw + (cols - 1) * kg, keyH = rows * kh + (rows - 1) * kg;
  const kx = X1 - keyW, ky = 326;
  const cellXY = (k) => { const { col, row } = layout.cellOf(k); return [kx + col * (kw + kg), ky + row * (kh + kg)]; };
  const fk = { fam: 'mono', w: 400, size: 25 };
  for (let k = 0; k < layout.n; k++) {
    const [x, y] = cellXY(k), t = c('key') + k * 0.05;
    pen.rect(x, y, kw, kh, t, 0.2, 'sf');
    pen.text(String(k + 1), x + 10, y + 27, fk, t + 0.1, 0.1, { col: 'line', mode: 'fade' }); // above the route
  }
  const route = [...Array(layout.n).keys()].map((k) => { const [x, y] = cellXY(k); return [x + kw / 2, y + 42]; });
  pen.line(route, c('key') + 0.3, 0.7, 's2', { width: 3 });
  pen.dot(route[route.length - 1][0], route[route.length - 1][1], 6, c('key') + 1.0, 'ink', { pop: true });
  pen.text(up((s.keyLabel || 'Key · sheets 1–{n}').replace('{n}', layout.n)), kx, ky - 16, sz(F.tag, 25, { track: 0.08 }), c('key') + 0.3, 0.4, { col: 'line' });

  // name
  env.lim('name', s.name, 14);
  const fn = { fam: 'cond', w: 700, size: 200, track: -0.035 };
  const nameMax = kx - 50 - X0;
  const f = env.fit(s.name, fn, nameMax, 140, 'name');
  const nw = pen.measure(s.name, f);
  const base = 464;
  env.lim('kicker', s.kicker, 40);
  pen.dim(X0, X0 + Math.max(nw, 300), 222, c('kicker') - 0.3, 0.45, 16);
  pen.text(up(s.kicker), X0, 262, sz(F.small, 25, { track: 0.12 }), c('kicker') + 0.3, 0.5, { col: 'line' });
  pen.guides(base, f.size, c('name') - 0.35);
  const title = pen.text(s.name, X0 - 14, base, f, c('name'), 0.65).rect;

  // tags
  const tags = s.tags || [];
  if (tags.length < 2 || tags.length > 5) env.err('tags needs 2–5 entries');
  tags.forEach((x, i) => env.lim(`tags[${i}]`, x, 14));
  const ft = { fam: 'mono', w: 600, size: 25, track: 0.06 };
  let x = X0;
  tags.forEach((tg, i) => {
    const w = pen.measure(up(tg), ft) + 40, t = c('tag' + i);
    pen.rect(x, 548, w, 58, t, 0.25, 's1');
    pen.text(up(tg), x + w / 2, 586, ft, t + 0.15, 0.2, { align: 'center', mode: 'fade' });
    x += w + 24;
  });
  if (x - 24 > X1) env.err('tags do not fit on one row');

  // URL field
  env.lim('url', s.url, 44);
  const fu = env.fit(s.url, { fam: 'mono', w: 500, size: 50 }, CW - 64, 35, 'url');
  const uw = pen.measure(s.url, fu) + 64, uy = 640, uh = 104;
  pen.rect(X0, uy, uw, uh, c('urlBox'), 0.5, 's2');
  [[X0, uy, 1, 1], [X0 + uw, uy, -1, 1], [X0, uy + uh, 1, -1], [X0 + uw, uy + uh, -1, -1]].forEach(([px, py, sx, sy]) =>
    pen.line([[px + sx * 10, py + sy * 38], [px + sx * 10, py + sy * 10], [px + sx * 38, py + sy * 10]], c('urlBox') + 0.3, 0.2, 's1'));
  pen.text(s.url, X0 + 32, uy + uh / 2 + fu.size * 0.36, fu, c('url'), 0.6);

  if (s.foot) {
    const { text, spans: sp } = spans(s.foot);
    env.lim('foot', text, 44);
    pen.text(text, X0, 828, env.fit(text, sz(F.sub, 25), CW - 300, MIN, 'foot'), c('foot'), 0.5, { col: 'muted', spans: sp });
  }

  // issued: the second move, on the last downbeat (timeline.js cue 'status')
  const word = up(s.status || 'Released');
  env.lim('status', s.status, 12);
  const fst = { fam: 'mono', w: 600, size: 25, track: 0.16 }, ts = c('status');
  const sw = pen.measure(word, fst) + 48, sx = X1 - sw, sy = 782;
  pen.seg(sx - 30, 828, X1 + 20, 828, ts - 0.15, 0.3, 'sg');
  pen.seg(sx - 30, 828 - fst.size * 0.698, X1 + 20, 828 - fst.size * 0.698, ts - 0.1, 0.3, 'sg');
  pen.rect(sx, sy, sw, 64, ts, 0.3, 's2');
  pen.text(word, sx + 24, 828, fst, ts + 0.08, 0.4);
  return { title, focus: null };
};

const DEFAULT = {
 "en": {
  "hud": "Release",
  "label": "Release",
  "kicker": "Rollouts signed before they ship",
  "name": "lintel",
  "tags": [
   "plan",
   "sign",
   "stage",
   "canary"
  ],
  "url": "github.com/example/lintel",
  "foot": [
   [
    "MIT",
    "ink"
   ],
   [
    " · works with any flag store",
    "muted"
   ]
  ],
  "status": "Released",
  "keyLabel": "Key · sheets 1–{n}",
  "frame": {
   "title": "lintel",
   "subtitle": "Rollouts signed, then staged",
   "corner": "MIT · Open source",
   "total": 7
  }
 },
 "zh": {
  "hud": "发布",
  "label": "发布",
  "kicker": "发布前先签字的开关上线",
  "name": "lintel",
  "tags": [
   "计划",
   "签字",
   "分阶段",
   "金丝雀"
  ],
  "url": "github.com/example/lintel",
  "foot": [
   [
    "MIT",
    "ink"
   ],
   [
    " · 支持任何开关服务",
    "muted"
   ]
  ],
  "status": "已发布",
  "keyLabel": "索引 · 第 1–{n} 张",
  "frame": {
   "title": "lintel",
   "subtitle": "先签字，再分阶段发布",
   "corner": "MIT · 开源",
   "total": 7
  }
 }
};
// the strings read in draw order: [cue, text, glance]
const READS = (s) => [['kicker', s.kicker, true], ['name', s.name], ['tag0', (s.tags || []).join(' '), true], ['url', s.url], ['url', s.url, 3], ['foot', Array.isArray(s.foot) ? s.foot.map((p) => p[0]).join('') : s.foot, true]];
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
  id: 'release-block', kind: 'scene',
  fits: ["lockup"],
  surface: ['canvas'],
  beats: { min: 7, max: 16 },
  needs: { motions: ["guide-letter"], props: ["sheet-hud"], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: { hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } }, kicker: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 40 }, zh: { chars: 16 } } }, name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 7 } } }, tags: { type: 'list', count: [2, 5], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 5 } } } }, url: { type: 'code', tier: 'primary', limits: { en: { chars: 44 }, zh: { chars: 44 } } }, foot: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 8, chars: 44 }, zh: { chars: 18 } } }, status: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 12 }, zh: { chars: 4 } } }, keyLabel: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 24 }, zh: { chars: 12 } } } },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], sheetNo: 7, from: 'left', approved: null, seed: 7, linework: 'ink' }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), c = P.def.c;
    const cues = (P.def.sounds || []).map(([k, kind]) => ({ beat: ARRIVE_B + (c[k] ?? 0), kind: { pen: 'land', box: 'tick', mark: 'accent', tick: 'tick', clack: 'hit', scan: 'turn', flood: 'turn', reinterpret: 'turn', unfold: 'turn', slot: 'tick' }[kind] || 'tick' }));
    if (P.def.stamp != null) cues.push({ beat: ARRIVE_B + P.def.stamp, kind: 'stamp' });
    return { beats: P.beats, lead: ARRIVE_B, reads: READS(s).filter((r) => r[1] && !r[2]).map((r) => ({ text: String(r[1]), lang: ctx.lang })), cues,
      motion: 'the camera arrives drawing; lines and lettering draft themselves; the name letters in and is dimensioned; tags, URL field, key plan; RELEASED on the last downbeat', settled: ARRIVE_B + P.def.N0, shots: P.def.stamp != null ? [{ beat: ARRIVE_B + P.def.stamp - 1.5, kind: "push-in" }] : [] };
  },
  async prepare(s, c) {
    const P = tplan(s, c.bpm, c.lang), def = P.def;
    def.c.status = Math.max(P.beats - ARRIVE_B - 4, Math.ceil(def.N0 - 1e-9));
    const D = prepareSheet(sheetPlan, def.c, s, c, { N0: def.N0, stampB: def.stamp ?? null, issue: s.issue === true });
    const F0 = { ...hudDefaults[c.lang === 'zh' ? 'zh' : 'en'], ...(s.frame || {}), sheet: s.sheetNo, name: s.hud };
    D.H = makeHud(D.P, null, F0, c.lang);
    D.cam = camOf({ beat: D.beat, from: s.from, push: D.push, holdStart: (ARRIVE_B + def.N0) * D.beat, impacts: D.stampT != null ? [D.stampT] : [] });
    // the overview's approval carried over: the stamp already landed in the title block's APPROVED BY cell
    if (s.approved) { const mctx = canvasOf(8, 8).getContext('2d'); for (let size = 36; size >= 28; size -= 2) { D.ap = makeStamp(D.P, mctx, s.approved, size, (s.seed || 7) + 999); if (stampBox(D.ap, -3)[1] <= 112) break; } }
    D.beats = P.beats;
    return D;
  },
  paint(ctx, u, s, c, D) {
    const t = u * D.beat, cam = D.cam(t);
    drawWorld(ctx, D.P, cam, D.pen.items, t);
    
    drawLight(ctx, D.P, D.T, t, s.lampT || 0);
    drawHud(ctx, D.P, D.H, cam, foldOf(D.push, t));
    if (D.ap) { const a = D.H.approve; drawStamp(ctx, D.ap, a[0] + a[2] / 2 + cam.dx * 0.3, a[1] + a[3] / 2, -3, -1, t); }
  },
  track() { return [[960, 540]]; },
};
