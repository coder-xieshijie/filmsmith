// blueprint-build — a page builds itself on a blueprint board: the board starts as a grid with a dashed slot for every
// block (tagged with its name and size), one line crosses it at a constant speed turning the blueprint into the page's
// surface behind it, and as the line passes each slot's foot its block flies in from off the frame along its own
// direction, overshoots into the slot and is bitten by four corners; once all are in, the blueprint fades, the picture
// lights up and the status row stops its clock.
// Variant `type` (mode: 'type'): no line; the blocks dock first as text-free shells (frame, buttons, panels), a half
// beat of rest, then every character tumbles in through depth to its place, headline first and small labels last; the
// call to action powers up and the picture is graded from a flat grey to colour by a wipe.
// Adapted from video-shotcraft demos/effects/scanline-assemble-flyin/ScanlineAssembleFlyin.tsx (card
// references/shots/effects/scanline-assemble-flyin.md) and, for the variant, demos/effects/assemble-then-type-flyin/
// AssembleThenTypeFlyin.tsx (card references/shots/effects/assemble-then-type-flyin.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); brand, demo landing page and every word on it
// removed: the headline, body, badge, buttons, nav, stats, the slots' tags and the status words are slots with English
// and Chinese defaults from the sample copy; the picture is a slot (`media`) with a neutral procedural night sky in the
// page's roles (stars, a band of light, a ridge) when the film has none; the snap corners are reticle-lock's painted in
// place; colours by role (the board's blueprint is the accent mixed toward paper, the done state its lighter tone);
// the variant keeps this board's layout (the upstream's own page and its colour wheels are not carried over); its
// per-character 3D tumble (perspective 900, ±260/±200 px, depth −200 to −760, three rotations) is drawn here by
// projecting each glyph (type-enter has no 3D tumble yet: see batches/8.json variants).
import { clamp, lerp, mix, rgba, rrect, measure, text, scratch, canvasOf } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, graphemes, readTime, units, wrap, caseOf } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';
import RETICLE from '../../motion/reticle-lock/brick.js';
import { drawMark } from '../mark-lockup/brick.js';

const B = { x: 140, y: 150, w: 1640, h: 860 }, PUSH0 = [960, 0.52 * 1080], PUSH1 = [960, 540];
const SCAN = [8, 92], SY = [-20, 880], FLIGHT = 14;
const frameAtY = (y) => SCAN[0] + ((y - SY[0]) / (SY[1] - SY[0])) * (SCAN[1] - SCAN[0]);
const PLAN = [
  { key: 'nav', box: [0, 0, 1640, 96], from: [0, -260], rot: 0, shell: 6 },
  { key: 'badge', box: [72, 150, 372, 56], from: [-620, -60], rot: -7, shell: 15 },
  { key: 'h1', box: [72, 228, 820, 250], from: [-980, 90], rot: -4, shell: null },
  { key: 'body', box: [72, 508, 760, 96], from: [-860, 220], rot: -2, shell: null },
  { key: 'media', box: [940, 140, 628, 560], from: [900, 80], rot: 6, shell: 10 },
  { key: 'cta', box: [72, 640, 560, 76], from: [-120, 460], rot: 3, shell: 27 },
  { key: 'stats', box: [72, 752, 1496, 80], from: [140, 420], rot: -2, shell: 35 },
];
const LANDS = (() => { const out = {}; let prev = -99; for (const p of [...PLAN].sort((a, b) => a.box[1] + a.box[3] - (b.box[1] + b.box[3]))) { out[p.key] = Math.max(frameAtY(p.box[1] + p.box[3]), prev + 4); prev = out[p.key]; } return out; })();
const LAST = Math.max(...Object.values(LANDS));
// the variant: shells fly 16 frames on the overshoot from 120–420 px; text blocks start at these frames and every
// character lands by frame 128; the call to action powers up at 118, the picture is graded 124–146
const TYPE = { shellDur: 16, from: { nav: [0, -180], media: [420, 40], badge: [-220, -80], cta: [-160, 200], stats: [0, 300] }, rot: { nav: 0, media: 6, badge: -7, cta: -5, stats: 3 },
  starts: { h1: [58, 66], nav: 76, badge: 86, body: 88, cta: [92, 95], stats: [96, 104], media: 110 }, end: 128, charDur: 16, ctaOn: 118, wipe: [124, 22], frames: 168 };
const TAGS = { en: ['NAV', 'BADGE', 'H1', 'BODY', 'MEDIA', 'CTA', 'STATS'], zh: ['导航', '徽章', '标题', '正文', '画面', '按钮', '数据'] };
const LIM = { headline: { en: { words: 6, chars: 24 }, zh: { chars: 10 } }, body: { en: { words: 12, chars: 70 }, zh: { chars: 26 } }, short: { en: { words: 3, chars: 16 }, zh: { chars: 6 } }, tag: { en: { words: 1, chars: 6 }, zh: { chars: 2 } }, status: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } };

const timing = (s, lang) => {
  if (s.mode === 'type') { const end = Math.max(TYPE.frames, Math.round(TYPE.end + 8 + readTime(s.headline, lang) * 30)); return { last: TYPE.end, end, beats: Math.ceil(end / 15) }; }
  const end = Math.max(156, Math.round(LAST + 16 + (readTime(s.headline, lang) + 1) * 30));
  return { last: LAST, end, beats: Math.ceil(end / 15) };
};

// The neutral picture: a night sky in the page's roles (gradient, a tilted band of light, stars, a ridge with a rim).
const sky = (x, w, h, C, lit = 1) => {
  const deep = mix(C.ink, '#000000', 0.88), g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, mix(deep, C.accent, 0.05)); g.addColorStop(0.48, mix(deep, C.accent, 0.3)); g.addColorStop(0.74, mix(deep, C.accent, 0.18)); g.addColorStop(1, mix(deep, '#000000', 0.4));
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  const band = (cx, cy, rw, rh, col, a) => { x.save(); x.translate(cx, cy); x.rotate((-32 * Math.PI) / 180); x.scale(rw, rh); const r = x.createRadialGradient(0, 0, 0, 0, 0, 1); r.addColorStop(0, rgba(col, a)); r.addColorStop(0.45, rgba(col, a * 0.38)); r.addColorStop(1, rgba(col, 0)); x.fillStyle = r; x.fillRect(-1, -1, 2, 2); x.restore(); };
  const pale = mix(C.accent, C.paper, 0.7);
  band(w * 0.51, 180, 440, 150, pale, 0.32 + 0.22 * lit); band(w * 0.52, 225, 190, 75, mix(C.paper, C.warn || C.accent, 0.3), 0.28 + 0.25 * lit);
  for (let i = 0; i < 320; i++) {
    const u = hash(i * 4 + 17, 3) * 900 - 140, off = (hash(i * 3 + 1, 4) + hash(i * 5 + 2, 4) + hash(i * 7 + 3, 4) - 1.5) * 70, a = (-32 * Math.PI) / 180;
    x.beginPath(); x.arc(w * 0.535 + (u - 380) * Math.cos(a) - off * Math.sin(a), 222 + (u - 380) * Math.sin(a) + off * Math.cos(a), 0.5 + hash(i, 5) * 1.1, 0, Math.PI * 2); x.fillStyle = rgba(C.paper, (0.25 + hash(i, 6) * 0.55) * (0.7 + 0.3 * lit)); x.fill();
  }
  for (let i = 0; i < 150; i++) { x.beginPath(); x.arc(hash(i, 7) * w, hash(i, 8) * 430, 0.8 + Math.pow(hash(i, 9), 3) * 3.2, 0, Math.PI * 2); x.fillStyle = rgba(C.paper, (0.35 + hash(i, 10) * 0.65) * (0.75 + 0.25 * lit)); x.fill(); }
  const ridge = [[0, 470], [70, 430], [120, 446], [190, 392], [250, 428], [320, 380], [380, 420], [440, 398], [520, 440], [580, 418], [628, 436]].map(([px, py]) => [(px / 628) * w, py]);
  x.beginPath(); ridge.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fillStyle = mix(deep, '#000000', 0.5); x.fill();
  x.beginPath(); ridge.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.strokeStyle = rgba(pale, 0.35); x.lineWidth = 1.5; x.stroke();
};

export default {
  id: 'blueprint-build', kind: 'scene',
  fits: ['demo', 'hero', 'proof'],
  surface: ['canvas'],
  beats: { min: 11, max: 13 },
  beatsFor: (P) => (P.mode === 'type' ? TYPE.frames : 156) / 15,
  needs: { motions: ['reticle-lock'], props: [], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent', 'paper'], type: ['display', 'text', 'mono'] },
  slots: {
    headline: { type: 'text', tier: 'primary', claim: true, sample: 'claim', limits: LIM.headline },
    body: { type: 'text', tier: 'glance', sample: 'titleLong', limits: LIM.body },
    badge: { type: 'text', tier: 'glance', sample: 'label', limits: LIM.short }, badgeTag: { type: 'text', tier: 'word', limits: LIM.tag },
    nav: { type: 'list', count: [3, 3], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } } },
    navAction: { type: 'text', tier: 'glance', limits: LIM.short }, cta: { type: 'text', tier: 'glance', limits: LIM.short }, cta2: { type: 'text', tier: 'glance', sample: 'detailTitle', limits: LIM.short },
    stats: { type: 'list', count: [3, 3], of: { value: { type: 'text', tier: 'word', limits: { en: { chars: 6 }, zh: { chars: 6 } } }, label: { type: 'text', tier: 'glance', limits: LIM.short } } },
    tags: { type: 'list', count: [7, 7], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 2 } } } },
    building: { type: 'text', tier: 'glance', limits: LIM.status }, built: { type: 'text', tier: 'glance', limits: LIM.status }, blocks: { type: 'text', tier: 'glance', limits: LIM.status },
    url: { type: 'code' }, media: { type: 'image', crop: true, optional: true }, mark: { type: 'image', optional: true },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent', 'paper'],
  summary: 'A page builds itself on a blueprint board: a line crosses it and each block flies in and snaps into its slot as the line passes; variant type docks bare shells first, then every character tumbles in through depth.',
  defaults: (ctx = {}) => {
    const L = ctx.lang === 'zh' ? 'zh' : 'en', zh = L === 'zh', nav = copy('nav', L), k = copy('kpis', L);
    return { mode: 'scan', headline: copy('claim', L), body: copy('titleLong', L), badge: copy('label', L), badgeTag: zh ? '新' : 'NEW', nav: nav.slice(0, 3), navAction: nav[3],
      cta: zh ? '开始渲染' : 'Start a render', cta2: copy('detailTitle', L), stats: k.map((x) => ({ value: x.value, label: x.label })), tags: TAGS[L],
      building: zh ? '搭建中' : 'BUILDING', built: zh ? '搭好了' : 'BUILT', blocks: zh ? '区块' : 'BLOCKS', url: copy('path', L), media: null, mark: null };
  },
  plan(s, ctx) {
    const T = timing(s, ctx.lang), type = s.mode === 'type';
    return { beats: T.beats, reads: [{ text: s.headline, lang: ctx.lang }, { text: s.body, lang: ctx.lang }],
      cues: type ? [{ beat: 6 / 15, kind: 'turn' }, { beat: 58 / 15, kind: 'accent' }, { beat: TYPE.ctaOn / 15, kind: 'land' }] : [{ beat: SCAN[0] / 15, kind: 'turn' }, ...PLAN.map((p) => ({ beat: LANDS[p.key] / 15, kind: 'land' }))],
      motion: type ? 'shells dock; characters tumble in through depth' : 'a line crosses the board; blocks fly in and snap as it passes', settled: (T.last + 8) / 15, peakAt: (type ? 66 : LANDS.media) / 15, pause: (T.end - T.last - 8) / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en', over = (v, lim) => v && units(v, L) > (L === 'zh' ? lim.zh.chars : lim.en.words);
    if (!['scan', 'type'].includes(s.mode || 'scan')) err.push('mode: scan | type');
    for (const [k, lim] of [['headline', LIM.headline], ['body', LIM.body], ['badge', LIM.short], ['badgeTag', LIM.tag], ['navAction', LIM.short], ['cta', LIM.short], ['cta2', LIM.short], ['building', LIM.status], ['built', LIM.status], ['blocks', LIM.status]]) if (over(s[k], lim)) err.push(`${k} too long`);
    if ((s.nav || []).length !== 3) err.push('nav: three items'); if ((s.stats || []).length !== 3) err.push('stats: three'); if ((s.tags || []).length !== 7) err.push('tags: seven, one per block');
    return err;
  },
  prepare(s, ctx) {
    const L = ctx.lang, C = s.colors, g = scratch(), F = (role, size, w, kind) => fontFor(NEUTRAL, role, L, size, w, kind);
    // the headline in at most two lines of up to 120 px in 820 px
    let hf = F('display', 120, 820, 'display'), lines = wrap(g, s.headline, hf, 820, L);
    while ((lines.length > 2 || lines.some((l) => measure(g, l, hf).width > 820)) && hf.size > 64) { hf = { ...hf, size: hf.size - 4 }; lines = wrap(g, s.headline, hf, 820, L); }
    const bf = F('text', 34, 450), bl = wrap(g, s.body, bf, 760, L).slice(0, 2);
    const nf = F('text', 26, 550), pf = F('text', 24, 650), wf = F('display', 32, 700), tf = F('text', 26, 600), tgf = F('mono', 20, 750), cf = F('text', 30, 700), c2f = F('text', 30, 600), vf = F('display', 52, 780, 'display'), lf = F('text', 26, 500), mf = F('mono', 22, 600);
    const pale = mix(C.accent, C.paper, 0.55), done = mix(C.accent, C.paper, 0.35);
    // every block: a shell painter (no words) and its words, both in the block's own px
    const W = (str, f) => measure(g, str, f).width;
    const nav = (() => {
      const pw = W(s.navAction, pf) + 52, xs = []; let x = 1640 - 72 - pw - 48; for (let i = 2; i >= 0; i--) { x -= W(s.nav[i], nf); xs[i] = x; x -= 44; }
      return { shell(x2) { x2.fillStyle = C.line; x2.fillRect(0, 95, 1640, 1); rrect(x2, 1640 - 72 - pw, 22, pw, 52, 26); x2.fillStyle = rgba(C.ink, 0.08); x2.fill(); x2.strokeStyle = rgba(C.ink, 0.16); x2.lineWidth = 1; x2.stroke(); drawMark(x2, 72 + 21, 48, 56, { ...s, colors: C }); },
        texts: [{ s: copy('product', L), x: 72 + 56 + 3, y: 48 + 11, font: wf, color: C.ink }, ...s.nav.map((n, i) => ({ s: n, x: xs[i], y: 48 + 9, font: nf, color: C.dim })), { s: s.navAction, x: 1640 - 72 - pw + 26, y: 48 + 8, font: pf, color: C.ink }] };
    })();
    const tg = caseOf(s.badgeTag, NEUTRAL, 'label', L), tw = W(tg.text, tgf) + 20, bw = 18 + tw + 14 + W(s.badge, tf) + 24;
    const badge = { shell(x2) { rrect(x2, 0, 0, bw, 56, 28); x2.fillStyle = rgba(pale, 0.1); x2.fill(); x2.strokeStyle = rgba(pale, 0.35); x2.lineWidth = 1; x2.stroke(); rrect(x2, 18, 12, tw, 32, 8); x2.fillStyle = pale; x2.fill(); },
      texts: [{ s: tg.text, x: 28, y: 28 + 7, font: { ...tgf, spacing: L === 'zh' ? 0 : 1.2 }, color: mix(C.ink, '#000000', 0.8) }, { s: s.badge, x: 18 + tw + 14, y: 28 + 9, font: tf, color: C.ink }] };
    const h1 = { shell: null, texts: lines.map((l, i) => ({ s: l, x: -4, y: hf.size * 0.82 + i * hf.size * 1.02, font: hf, color: i === lines.length - 1 && lines.length > 1 ? C.accent : C.ink, grad: i === lines.length - 1 && lines.length > 1 })) };
    const body = { shell: null, texts: bl.map((l, i) => ({ s: l, x: 0, y: 34 + i * 46, font: bf, color: C.dim })) };
    const cw = W(s.cta, cf) + 76;
    const cta = { cw, shell(x2, on = 1) {
        rrect(x2, 0, 0, cw, 76, 38); const gg = x2.createLinearGradient(0, 0, 0, 76); gg.addColorStop(0, rgba(mix(C.accent, C.paper, 0.3), on)); gg.addColorStop(1, rgba(C.accent, on)); x2.fillStyle = gg; x2.fill();
        x2.strokeStyle = rgba(C.accent, 0.5 + 0.5 * on); x2.lineWidth = 1.5; x2.stroke();
        x2.beginPath(); x2.arc(cw + 34 + 15, 38, 13.5, 0, Math.PI * 2); x2.strokeStyle = C.dim; x2.lineWidth = 2; x2.stroke(); x2.beginPath(); x2.moveTo(cw + 34 + 12, 38 - 5.5); x2.lineTo(cw + 34 + 20.5, 38); x2.lineTo(cw + 34 + 12, 38 + 5.5); x2.closePath(); x2.fillStyle = C.ink; x2.fill(); },
      texts: [{ s: s.cta, x: 38, y: 38 + 11, font: cf, color: C.onAccent, cta: true }, { s: s.cta2, x: cw + 34 + 42, y: 38 + 11, font: c2f, color: C.ink }] };
    const statX = (() => { const ws = s.stats.map((k) => W(k.value, vf) + 16 + W(k.label, lf)), gap = (1496 - 24 - ws.reduce((a, b) => a + b, 0)) / 2; let x = 0; return ws.map((w) => { const at = x; x += w + gap; return at; }); })();
    const stats = { shell(x2) { x2.fillStyle = C.line; x2.fillRect(0, 0, 1496, 1); },
      texts: s.stats.flatMap((k, i) => [{ s: k.value, x: statX[i], y: 74, font: vf, color: i === 0 ? C.accent : C.ink, stat: i }, { s: k.label, x: statX[i] + W(k.value, vf) + 16, y: 74, font: lf, color: C.dim, stat: i, label: true }]) };
    const art = canvasOf(628, 560), ax = art.getContext('2d');
    if (s.media && (s.media.width || s.media.naturalWidth)) { const iw = s.media.naturalWidth || s.media.width, ih = s.media.naturalHeight || s.media.height, k = Math.max(628 / iw, 560 / ih); ax.drawImage(s.media, (628 - iw * k) / 2, (560 - ih * k) / 2, iw * k, ih * k); } else sky(ax, 628, 560, C);
    const capW = W(s.url, mf) + 28;
    const media = { art, shell(x2, lit = 0, wipe = 1, grey = false) {
        x2.save(); x2.shadowColor = rgba(mix(C.ground, '#000000', 0.8), 0.95); x2.shadowBlur = 80; x2.shadowOffsetY = 30; rrect(x2, 20, 20, 588, 520, 26); x2.fillStyle = rgba('#000000', 0.5); x2.fill(); x2.restore();
        if (lit > 0) { x2.save(); x2.shadowColor = rgba(C.accent, 0.22 * lit); x2.shadowBlur = 60 * lit; rrect(x2, 0, 0, 628, 560, 26); x2.fillStyle = rgba(C.accent, 0.01); x2.fill(); x2.restore(); }
        x2.save(); rrect(x2, 0, 0, 628, 560, 26); x2.clip();
        if (grey && wipe < 1) { x2.save(); x2.filter = 'grayscale(1) contrast(0.7) brightness(1.15)'; x2.drawImage(art, 0, 0); x2.restore(); }
        if (wipe > 0) { x2.save(); x2.beginPath(); x2.rect(0, 0, 628 * wipe, 560); x2.clip(); x2.filter = `brightness(${(1 + 0.15 * lit).toFixed(3)})`; x2.drawImage(art, 0, 0); x2.restore(); }
        if (grey && 0 < wipe && wipe < 1) { x2.save(); x2.shadowColor = rgba(C.accent, 0.9); x2.shadowBlur = 18; x2.fillStyle = C.accent; x2.fillRect(628 * wipe - 1, 0, 2, 560); x2.restore(); }
        x2.restore();
        rrect(x2, 0.5, 0.5, 627, 559, 26); x2.strokeStyle = rgba(pale, 0.14); x2.lineWidth = 1; x2.stroke();
        rrect(x2, 26, 560 - 24 - 42, capW, 42, 10); x2.fillStyle = rgba(mix(C.ground, '#000000', 0.5), 0.7); x2.fill(); x2.strokeStyle = C.line; x2.stroke(); },
      texts: [{ s: s.url, x: 40, y: 560 - 24 - 21 + 8, font: mf, color: C.dim }] };
    const parts = { nav, badge, h1, body, media, cta, stats };
    // every glyph of every block, with its own tumble (variant type): start frame, position, seeded offsets
    const glyphs = [];
    if (s.mode === 'type') {
      let seed = 0;
      const blocks = [['h1', 0, TYPE.starts.h1[0]], ['h1', 1, TYPE.starts.h1[1]], ...nav.texts.map((_, i) => ['nav', i, TYPE.starts.nav + (i === 0 ? 0 : 2 + i)]), ['badge', 0, TYPE.starts.badge], ['badge', 1, TYPE.starts.badge], ['body', 0, TYPE.starts.body], ['body', 1, TYPE.starts.body + 2],
        ['cta', 0, TYPE.starts.cta[0]], ['cta', 1, TYPE.starts.cta[1]], ...stats.texts.map((t, i) => ['stats', i, (t.label ? TYPE.starts.stats[1] : TYPE.starts.stats[0]) + t.stat * 2 + (t.label ? 0 : t.stat)]), ['media', 0, TYPE.starts.media]];
      for (const [k, i, start] of blocks) {
        const t = parts[k].texts[i]; if (!t) continue;
        const gs = graphemes(t.s), n = gs.length, step = Math.min(1.6, Math.max(0.35, (TYPE.end - start - TYPE.charDur) / Math.max(1, n)));
        gs.forEach((ch, j) => { const x0 = W(gs.slice(0, j).join(''), t.font) + j * (t.font.spacing || 0), w = W(ch, t.font), q = seed++;
          glyphs.push({ part: k, t, ch, cx: t.x + x0 + w / 2, ft: start + j * step, dx: (hash(q, 21) - 0.5) * 520, dy: (hash(q, 22) - 0.5) * 400, dz: -200 - hash(q, 23) * 560, rx: (hash(q, 24) - 0.5) * 340, ry: (hash(q, 25) - 0.5) * 380, rz: (hash(q, 26) - 0.5) * 240 }); });
      }
    }
    return { parts, glyphs, hf, sf: F('mono', 30, 600), sl: F('mono', 30, 500), tagf: F('mono', 18, 600), dimf: F('mono', 20, 500), pale, done, T: timing(s, L) };
  },
  pose(key, f) { const p = PLAN.find((q) => q.key === key), a = ramp(f, LANDS[key] - FLIGHT, FLIGHT, EASE.overshoot); return { a, x: lerp(p.from[0], 0, a), y: lerp(p.from[1], 0, a), r: lerp(p.rot, 0, a) }; },
  shellPose(key, f) { const a = ramp(f, PLAN.find((q) => q.key === key).shell, TYPE.shellDur, EASE.overshoot), r = (1 - ramp(f, PLAN.find((q) => q.key === key).shell, TYPE.shellDur + 4, EASE.snappy)) * TYPE.rot[key]; return { a, x: (1 - a) * TYPE.from[key][0], y: (1 - a) * TYPE.from[key][1], r }; },
  push(f, s) { return s.mode === 'type' ? 1 + 0.015 * ramp(f, 120, 48, EASE.smooth) : 1 + 0.03 * ramp(f, 0, 156, EASE.swift); },
  paint(ctx, u, s, c, D) {
    const C = s.colors, f = u * 15, type = s.mode === 'type', k = this.push(f, s), O = type ? PUSH1 : PUSH0, L = c.lang;
    const ly = SY[0] + (SY[1] - SY[0]) * clamp((f - SCAN[0]) / (SCAN[1] - SCAN[0])), lineOn = type ? 0 : ramp(f, SCAN[0] - 5, 6, EASE.out) * (1 - ramp(f, SCAN[1], 10, EASE.exit));
    const done = type ? ramp(f, TYPE.end, 12, EASE.out) : ramp(f, LAST + 4, 12, EASE.out), lit = type ? 0 : ramp(f, LAST + 2, 20, EASE.out), blueprint = lerp(1, 0.3, done);
    const placed = type ? PLAN.filter((p) => f >= (p.shell != null ? p.shell : p.key === 'h1' ? TYPE.starts.h1[1] : TYPE.starts.body) + TYPE.shellDur).length : PLAN.filter((p) => f >= LANDS[p.key]).length;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    let g = ctx.createRadialGradient(1190, 0, 0, 1190, 0, 1400); g.addColorStop(0, rgba(mix(C.accent, C.paper, 0.4), 0.12)); g.addColorStop(1, rgba(C.accent, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(O[0], O[1]); ctx.scale(k, k); ctx.translate(-O[0], -O[1]);
    // the blueprint grid (24 px fine, 120 px major) or, for the variant, twelve column guides; the lit band behind the line
    const grid = (a1, a2) => { ctx.fillStyle = rgba(D.pale, a1); for (let x = -20; x < 1960; x += 24) ctx.fillRect(x, -40, 1, 1160); for (let y = -10; y < 1120; y += 24) ctx.fillRect(-40, y, 2000, 1); ctx.fillStyle = rgba(D.pale, a2); for (let x = -20; x < 1960; x += 120) ctx.fillRect(x, -40, 1.5, 1160); for (let y = -10; y < 1120; y += 120) ctx.fillRect(-40, y, 2000, 1.5); };
    if (!type) {
      ctx.save(); ctx.globalAlpha = blueprint; grid(0.045, 0.085); ctx.restore();
      if (lineOn > 0.01) { const yF = B.y + ly; ctx.save(); ctx.beginPath(); ctx.rect(-40, yF - 140, 2000, 142); ctx.clip(); ctx.globalAlpha = lineOn; const m = ctx.createLinearGradient(0, yF - 140, 0, yF); m.addColorStop(0, rgba('#000000', 0)); m.addColorStop(1, rgba('#000000', 1)); grid(0.22, 0.4); ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = m; ctx.fillRect(-40, yF - 140, 2000, 142); ctx.restore(); }
    } else { const gd = 1 - 0.75 * ramp(f, 48, 14, EASE.out); ctx.fillStyle = rgba(C.paper, 0.045 * gd); for (let i = 0; i < 13; i++) ctx.fillRect(120 + i * 140, 0, 1, 1080); for (const y of [64, 220, 600, 840, 990]) ctx.fillRect(0, y, 1920, 1); }
    // the status row: state, path, blocks placed, the clock (stopped when the last block is in)
    ctx.save(); ctx.globalAlpha = ramp(f, 0, 10, EASE.out);
    const sy = 66 + 24 + 11, st = done > 0.5 ? `✓ ${s.built}` : `▸ ${s.building}`, stw = measure(ctx, st, D.sf).width;
    text(ctx, st, B.x, sy, { ...D.sf, spacing: L === 'zh' ? 0 : 1.8 }, { color: done > 0.5 ? D.done : C.accent });
    text(ctx, s.url, B.x + stw + 18 + (L === 'zh' ? 0 : 1.8 * graphemes(st).length), sy, D.sl, { color: C.dim });
    const n2 = (v) => String(v).padStart(2, '0'), clock = `${(Math.min(f, D.T.last + 4) / 30).toFixed(1)} s`, R = B.x + B.w;
    const wc = measure(ctx, clock, D.sl).width, tot = ` / ${n2(PLAN.length)}`, wt = measure(ctx, tot, D.sl).width, wn = measure(ctx, n2(placed), D.sf).width;
    text(ctx, clock, R, sy, D.sl, { color: C.dim, align: 'right' }); text(ctx, tot, R - wc - 34, sy, D.sl, { color: C.dim, align: 'right' });
    text(ctx, n2(placed), R - wc - 34 - wt, sy, D.sf, { color: placed === PLAN.length ? D.done : C.ink, align: 'right' }); text(ctx, `${s.blocks} `, R - wc - 34 - wt - wn, sy, D.sl, { color: C.dim, align: 'right' });
    ctx.restore();
    ctx.save(); ctx.translate(B.x, B.y);
    // the board: the page's surface, brushed in above the line (all of it for the variant); its dashed outline and width
    const surf = () => { rrect(ctx, 0, 0, B.w, B.h, 28); const sg = ctx.createLinearGradient(0, 0, 0, B.h); sg.addColorStop(0, rgba(mix(C.panel, C.accent, 0.12), 0.96)); sg.addColorStop(1, rgba(mix(C.panel, C.ground, 0.4), 0.96)); ctx.fillStyle = sg; ctx.fill(); };
    if (type) { ctx.save(); ctx.globalAlpha = ramp(f, 0, 8, EASE.out); ctx.shadowColor = rgba('#000000', 0.6); ctx.shadowBlur = 120; ctx.shadowOffsetY = 40; surf(); ctx.restore(); }
    else if (ly > -30) { ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, B.w + 600, ly + 302); ctx.clip(); ctx.shadowColor = rgba('#000000', 0.6); ctx.shadowBlur = 120; ctx.shadowOffsetY = 40; surf(); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = blueprint * (type ? 0.6 : 1); ctx.setLineDash([8, 6]); ctx.strokeStyle = rgba(D.pale, 0.3); ctx.lineWidth = 1.5; rrect(ctx, 0.75, 0.75, B.w - 1.5, B.h - 1.5, 28); ctx.stroke(); ctx.setLineDash([]);
    if (!type) { const dw = measure(ctx, '1640', D.dimf).width; ctx.globalAlpha = blueprint * 0.9; ctx.fillStyle = rgba(D.pale, 0.3); ctx.fillRect(0, -30, B.w / 2 - dw / 2 - 14, 1); ctx.fillRect(B.w / 2 + dw / 2 + 14, -30, B.w / 2 - dw / 2 - 14, 1); text(ctx, '1640', B.w / 2, -30 + 7, D.dimf, { color: rgba(D.pale, 0.55), align: 'center' }); }
    ctx.restore();
    // the slots: dashed boxes with their tags, gone as their block lands (scan only)
    if (!type) PLAN.forEach((p, i) => {
      const o = (1 - ramp(f, LANDS[p.key] - 2, 4, EASE.out)) * blueprint; if (o <= 0.01) return;
      const [bx, by, bw, bh] = p.box; ctx.save(); ctx.globalAlpha = o;
      rrect(ctx, bx, by, bw, bh, 12); ctx.fillStyle = rgba(C.accent, 0.06); ctx.fill(); ctx.setLineDash([8, 6]); ctx.strokeStyle = rgba(D.pale, 0.5); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
      const tg = s.tags[i], tw = measure(ctx, tg, D.tagf).width; text(ctx, tg, bx + 14, by + 10 + 15, { ...D.tagf, spacing: L === 'zh' ? 0 : 1.4 }, { color: rgba(D.pale, 0.75) });
      text(ctx, `${bw}×${bh}`, bx + 14 + tw + 10 + (L === 'zh' ? 0 : 1.4 * tg.length), by + 10 + 15, D.tagf, { color: rgba(D.pale, 0.45) });
      ctx.restore();
    });
    // the blocks
    const drawPart = (key, P, words) => {
      const part = D.parts[key], [bx, by, bw, bh] = PLAN.find((q) => q.key === key).box;
      ctx.save(); ctx.translate(bx + P.x, by + P.y); ctx.translate(bw / 2, bh / 2); ctx.rotate((P.r * Math.PI) / 180); ctx.translate(-bw / 2, -bh / 2);
      if (part.shell) key === 'media' ? part.shell(ctx, lit, type ? ramp(f, TYPE.wipe[0], TYPE.wipe[1], EASE.swift) : 1, type) : key === 'cta' ? part.shell(ctx, type ? ramp(f, TYPE.ctaOn, 14, EASE.out) : 1) : part.shell(ctx);
      if (words) for (const t of part.texts) this.word(ctx, t, C, D);
      ctx.restore();
    };
    for (const p of PLAN) {
      if (type) {
        if (p.shell == null || f < p.shell) continue;
        const P = this.shellPose(p.key, f), P0 = this.shellPose(p.key, f - 0.5), sp = Math.hypot(P.x - P0.x, P.y - P0.y) * 2, n = sp > 6 ? Math.min(4, Math.ceil(sp / 25)) : 1;
        for (let q = 0; q < n; q++) { const Q = n === 1 ? P : this.shellPose(p.key, f - (0.5 * q) / (n - 1)); ctx.save(); ctx.globalAlpha = Math.min(1, ramp(f, p.shell, 6, EASE.out) * 1.2) / (n > 1 ? n * 0.7 : 1); drawPart(p.key, Q, false); ctx.restore(); }
        continue;
      }
      const start = LANDS[p.key] - FLIGHT; if (f < start) continue;
      const P = this.pose(p.key, f), P0 = this.pose(p.key, f - 0.5), moving = f < LANDS[p.key] + 4, sp = moving ? Math.hypot(P.x - P0.x, P.y - P0.y) * 2 : 0, n = sp > 6 ? Math.min(5, Math.ceil(sp / 22)) : 1;
      for (let q = 0; q < n; q++) { const Q = n === 1 ? P : this.pose(p.key, f - (0.5 * q) / (n - 1)); ctx.save(); ctx.globalAlpha = ramp(f, start, 4, EASE.out) / (n > 1 ? n * 0.7 : 1); drawPart(p.key, Q, true); ctx.restore(); }
      // the snap: reticle-lock's corners closing from 20 to 10 px outside the slot, flashing out
      if (p.key !== 'nav') {
        const tick = ramp(f, LANDS[p.key] + 1, 3, EASE.out) * (1 - ramp(f, LANDS[p.key] + 5, 9, EASE.out)), gap = 10 + 10 * (1 - ramp(f, LANDS[p.key] + 1, 6, EASE.snappy));
        if (tick > 0.01) RETICLE.paint(ctx, { show: true, own: true, lock: 1, alpha: tick, fly: [0, 0], shrink: 1, grow: gap, bite: 0, focus: 0, locked: false, label: 0 }, { rect: p.box, pad: 0, arm: 23.5, thick: 3, radius: 12, colors: { ...C, accent: D.pale } }, { scene() {} });
      }
    }
    // the variant's words: every glyph tumbling in through depth (perspective 900) to its place
    if (type) {
      const on = ramp(f, TYPE.ctaOn, 14, EASE.out);
      for (const G of D.glyphs) {
        const a = ramp(f, G.ft, TYPE.charDur, EASE.snappy); if (a <= 0) continue;
        const [bx, by] = PLAN.find((q) => q.key === G.part).box, o = 1 - a, dz = o * G.dz, kk = 900 / (900 - dz), far = o * o, blur = far * (1 + (-G.dz / 760) * 7);
        const col = G.t.cta ? (on > 0.5 ? C.onAccent : D.pale) : G.t.color;
        ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.8); if (a < 1 && blur > 0.1) ctx.filter = `blur(${blur.toFixed(2)}px)`;
        ctx.translate(bx + G.cx + o * G.dx * kk, by + G.t.y + o * G.dy * kk); ctx.rotate((o * G.rz * Math.PI) / 180); ctx.scale(kk * Math.cos((o * G.ry * Math.PI) / 180), kk * Math.cos((o * G.rx * Math.PI) / 180));
        text(ctx, G.ch, 0, 0, G.t.font, { color: col, align: 'center' });
        ctx.restore();
      }
    }
    // the line: a white core with the accent's glow, 60 px past the board each side
    if (lineOn > 0.01) {
      ctx.save(); ctx.globalAlpha = lineOn; const lg = ctx.createLinearGradient(-60, 0, B.w + 60, 0); lg.addColorStop(0, rgba(C.paper, 0)); lg.addColorStop(0.08, mix(C.paper, C.accent, 0.12)); lg.addColorStop(0.5, C.paper); lg.addColorStop(0.92, mix(C.paper, C.accent, 0.12)); lg.addColorStop(1, rgba(C.paper, 0));
      for (const [b, a] of [[90, 0.35], [36, 0.6], [12, 0.95]]) { ctx.shadowColor = rgba(C.accent, a); ctx.shadowBlur = b; ctx.fillStyle = lg; ctx.fillRect(-60, ly - 2, B.w + 120, 4); }
      ctx.restore();
    }
    ctx.restore(); ctx.restore();
  },
  // one word of a block, in place (the headline's last line in the accent leaning to paper)
  word(ctx, t, C, D) {
    if (t.grad) { const w = measure(ctx, t.s, t.font).width, g = ctx.createLinearGradient(t.x, 0, t.x + w, 0); g.addColorStop(0, C.accent); g.addColorStop(0.55, mix(C.accent, C.paper, 0.45)); g.addColorStop(1, D.done); text(ctx, t.s, t.x, t.y, t.font, { color: g }); }
    else text(ctx, t.s, t.x, t.y, t.font, { color: t.color });
  },
  // the headline block's and the picture's top-left on screen (compare pairs them with the upstream's)
  track(u, s) {
    const f = u * 15, k = this.push(f, s), O = s.mode === 'type' ? PUSH1 : PUSH0;
    const at = (key) => { const p = PLAN.find((q) => q.key === key), P = s.mode === 'type' ? (p.shell == null ? { x: 0, y: 0 } : this.shellPose(key, f)) : this.pose(key, f); return [O[0] + (B.x + p.box[0] + P.x - O[0]) * k, O[1] + (B.y + p.box[1] + P.y - O[1]) * k]; };
    return [at('h1'), at('media')];
  },
  blur() { return false; },
};
