#!/usr/bin/env node
// geo-check: seeks the main timeline frame by frame and checks two families of problems in one pass.
//
// 1. Geometry (complements `hyperframes check`, which only finds text overlapping or hiding other text):
//    - text_on_stroke: a drawn line or shape outline runs through a text box
//    - text_overlap:   two texts overlap by more than 15% of the smaller box
//    - out_of_frame:   text partly outside the 1920x1080 frame
//    - caption_zone:   anything (text or stroke) inside the caption band, y >= 880 by default
// 2. Brief rules that can be measured:
//    - empty (no markup needed): every frame gets an "ink" value (share of the content area covered by
//      content; the algorithm is described above extras()). Two levels: sparse, ink < 0.8% for >= 0.5 s
//      (only one or two small objects left); blank, ink < 0.3% for >= 0.2 s (almost nothing on screen).
//      Thresholds were calibrated on the terminal-ledger kit (light paper background); re-calibrate for dark
//      backgrounds or full-frame footage.
//    - hand_over (needs markup): the outer element of each hand-drawn annotation carries data-hand (value: a
//      name for it, may be empty). Distinct elements that become visible are counted; more than --hand-max is
//      reported.
//    - read_short (needs markup): a card or sentence that must be read carries data-read (value: seconds;
//      empty means --read, default 4). Measures the longest continuous stretch in which all of its text is
//      shown, every character has opacity >= 0.9 and the block is inside the frame. "All of its text" means the
//      longest version seen anywhere in the film, so text typed out letter by letter (one span per character,
//      or textContent growing) does not count until it is complete.
//
// Usage: node geo-check.cjs <project dir> [--out report.json] [options]
//   Geometry:      [--step 0.25] [--hold 1] [--from 0] [--to <duration>] [--zone y0=880] [--jobs 1] [--wait 120]
//   Empty frames:  [--empty 0.008] [--empty-hold 0.5] [--blank 0.003] [--blank-hold 0.2]
//                  [--avatar 1580,560,1880,860|none] [--chrome 10] [--chrome-y 120]
//   Hand and read: [--hand-max 4] [--read 4] [--read-alpha 0.9]
//   Tuning:        --why <seconds> lists which elements make up the ink of that frame and exits;
//                  --dump adds the ink of every sample to the report.
//   --step   sampling interval in seconds; --hold  geometry findings other than caption_zone must last this
//            long (seconds) to be reported, and every geometry finding needs at least two consecutive samples;
//   --zone   top of the caption band; --avatar  presenter box (x0,y0,x1,y1) whose contents do not count as ink;
//   --chrome / --chrome-y  text that stays in place within the top --chrome-y px for --chrome seconds is a
//            running header and does not count as ink; --jobs  pages in parallel (1 is usually fastest);
//   --wait   seconds to wait for window.__timelines.main to register.
//
// Output: the report (JSON) goes to <project>/.geo-check.json unless --out says otherwise (a project tracked in
// Git will show it as a change; point --out elsewhere to only look). Stdout, in this order:
//   geo-check: <N> samples in <S> s, <K> issues (report <path>)
//   hand marks <n> (max <m>)        then one indented line per mark: <from>–<to>  <name>
//   read holds <n>                  then one indented line per hold: <from>–<to>  <s> s / need <n> s  "<text>"
//   <m:ss.s>–<m:ss.s>  <kind>  ...  one line per issue
// Exit codes: 0 no issues, 1 issues found, 2 the script failed.
// Speed: a 5-minute film at --step 0.25 takes about 20 s (3 minutes about 12 s). Empty and read spans are refined
// to the frame (1/30 s).
//
// Requirements: the project is a HyperFrames composition whose main timeline is GSAP, registered as
// window.__timelines.main. The browser comes from the kit helper build/browser.cjs (the project's own, else the
// terminal-ledger kit's): Chrome and puppeteer-core from the pinned HyperFrames engine; CHROME_PATH overrides
// Chrome. The page is served from a local static server, because fetch() is blocked on file:// pages.
//
// Known limits: sub-compositions mounted with data-composition-src (an opening hook, say) are not loaded in this
//   directly opened page; run the check on the sub-composition separately. What is drawn inside canvas, video
//   or rendered clips is invisible (the whole box counts as ink). Text revealed by clip-path or masks is treated
//   as already complete by the read check. Empty spans are found from samples, so a flash shorter than --step
//   can fall between two samples. data-hand only counts marked elements; unmarked ones are missed.
// Exemptions: an element or ancestor with data-geo-allow (a deliberate strike-through, say) is never reported
//   for geometry; elements with data-bg and their descendants do not count as ink (custom textures, watermarks).
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dir = path.resolve(args[0] || '.');
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const STEP = Number(opt('step', '0.25'));
const ZONE_Y = Number((opt('zone', 'y0=880').split('=')[1]));
const OUT = opt('out', path.join(dir, '.geo-check.json'));
const HOLD = Number(opt('hold', '1')); // geometry findings except caption_zone must last this long (camera pushes and moving nodes overlap briefly)
const EMPTY = Number(opt('empty', '0.008')); // sparse: ink (share of the content area covered by content) below this...
const EMPTY_HOLD = Number(opt('empty-hold', '0.5')); // ...for this many seconds is reported
const BLANK = Number(opt('blank', '0.003')); // blank: ink below this (almost nothing on screen)...
const BLANK_HOLD = Number(opt('blank-hold', '0.2')); // ...for this long is reported
const HAND_MAX = Number(opt('hand-max', '4')); // most data-hand marks allowed in the film
const READ = Number(opt('read', '4')); // seconds required when data-read has no value
const READ_ALPHA = Number(opt('read-alpha', '0.9')); // opacity each character needs to count as fully shown
const AVATAR = opt('avatar', '1580,560,1880,860') === 'none' ? null : opt('avatar', '1580,560,1880,860').split(',').map(Number); // presenter box: anything fully inside it is not ink
const CHROME_S = Number(opt('chrome', '10')); // running header: anything fully within the top CHROME_Y px that stays in place this many seconds is not ink
const CHROME_Y = Number(opt('chrome-y', '120'));
const DUMP = args.includes('--dump'); // add per-sample ink to the report (for calibrating thresholds)
const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

// Runs in the page: measures the text boxes and strokes of the current frame.
function measure(zoneY) {
  const W = 1920, H = 1080;
  const allowed = (el) => !!el.closest('[data-geo-allow]');
  const opacity = (el) => {
    let o = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      o *= Number(cs.opacity);
      if (o < 0.15) return 0;
    }
    return o;
  };
  const name = (el) => {
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && parts.length < 4; e = e.parentElement) {
      parts.unshift(e.id ? '#' + e.id : e.tagName.toLowerCase());
      if (e.id) break;
    }
    return parts.join(' > ');
  };
  // Text position inside its own SVG: a camera move (applied outside) leaves it unchanged; it only changes when the element itself moves
  const svgAnchor = (el) => {
    const g = el.closest('svg') && (el instanceof SVGGraphicsElement ? el : el.closest('foreignObject'));
    if (!g || !g.getCTM) return null;
    const m = g.getCTM(), b = g.getBBox();
    return m ? [m.a * b.x + m.c * b.y + m.e, m.b * b.x + m.d * b.y + m.f] : null;
  };
  // Text: one box per SVG <text>; one tight box per HTML text node
  const texts = [];
  for (const el of document.querySelectorAll('text')) {
    const s = el.textContent.trim();
    if (!s || allowed(el) || opacity(el) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 1 && r.height > 1) texts.push({ el, s, r, a: svgAnchor(el) || [r.left, r.top] });
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const s = n.textContent.trim();
    const el = n.parentElement;
    if (!s || !el || el.closest('svg text, script, style, title') || allowed(el) || opacity(el) === 0) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width > 1 && r.height > 1) texts.push({ el, s, r, a: svgAnchor(el) || [r.left, r.top] });
  }
  // Strokes: sample points along the outline, mapped to screen coordinates
  const shapes = [];
  for (const el of document.querySelectorAll('circle, ellipse, rect, path, line, polyline, polygon')) {
    if (allowed(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.stroke === 'none' || Number(cs.strokeWidth) === 0 || Number(cs.strokeOpacity) < 0.15) continue;
    // Hand-drawn hatch fills (Rough.js hachure: many short segments in one path) are texture, not lines
    if (el.tagName === 'path' && ((el.getAttribute('d') || '').match(/M/gi) || []).length > 6) continue;
    // Prefilter: skip strokes whose box meets no text box and not the caption band, to avoid sampling them
    const bb = el.getBoundingClientRect();
    if (!texts.some((t) => bb.right > t.r.left && bb.left < t.r.right && bb.bottom > t.r.top && bb.top < t.r.bottom) && !(bb.bottom > zoneY && bb.top < H)) continue;
    const o = opacity(el);
    if (o === 0 || !el.getTotalLength) continue;
    let len; try { len = el.getTotalLength(); } catch (_) { continue; }
    if (!(len > 4)) continue;
    const m = el.getScreenCTM(); if (!m) continue;
    // Lines drawn on progressively (DrawSVG style, dasharray/dashoffset): only the part drawn so far
    let vis = [0, len];
    const da = cs.strokeDasharray.split(/[ ,]+/).map(parseFloat).filter((v) => !isNaN(v));
    if (da.length === 2 && da[1] >= len * 0.5) {
      const off = -parseFloat(cs.strokeDashoffset || '0') || 0;
      vis = [Math.max(0, off), Math.min(len, off + da[0])];
      if (vis[1] - vis[0] < 2) continue;
    }
    const pts = [];
    const n = Math.min(600, Math.ceil((vis[1] - vis[0]) / 6));
    for (let i = 0; i <= n; i++) {
      const p = el.getPointAtLength(vis[0] + ((vis[1] - vis[0]) * i) / n);
      pts.push([m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f]);
    }
    let x0 = Infinity, y0 = Infinity;
    for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[1] < y0) y0 = p[1]; }
    shapes.push({ el, pts, x0, y0 });
  }
  const out = [];
  const inside = (p, r, pad) => p[0] > r.left + pad && p[0] < r.right - pad && p[1] > r.top + pad && p[1] < r.bottom - pad;
  const related = (a, b) => a.contains(b) || b.contains(a);
  for (const t of texts) {
    const r = t.r;
    // Out of frame and caption band
    if (r.bottom > zoneY + 1 && r.top < H) out.push({ kind: 'caption_zone', text: t.s.slice(0, 30), who: name(t.el), box: [r.left, r.top, r.right, r.bottom].map(Math.round) });
    if (r.left < -1 || r.right > W + 1 || r.top < -1) {
      if (r.right > 0 && r.left < W && r.bottom > 0) out.push({ kind: 'out_of_frame', text: t.s.slice(0, 30), who: name(t.el), box: [r.left, r.top, r.right, r.bottom].map(Math.round) });
    }
    // Text on a stroke: at least 3 stroke samples inside the text box (shrunk by 2 px on each side)
    for (const sh of shapes) {
      if (related(sh.el, t.el)) continue;
      // A node's own outline and hatch do not count: same diagram node, subgraph, or data-geo-group group
      const owner = sh.el.closest('.node, .rough-node, .cluster, [data-geo-group]');
      if (owner && owner.contains(t.el)) continue;
      let hit = 0;
      for (const p of sh.pts) if (inside(p, r, 2) && ++hit >= 3) break;
      // rel: text position inside its SVG (screen position for HTML text); changes only when the text itself moves (a message along a line, a card sliding in)
      if (hit >= 3) out.push({ kind: 'text_on_stroke', text: t.s.slice(0, 30), who: name(t.el), other: name(sh.el), box: [r.left, r.top, r.right, r.bottom].map(Math.round), rel: t.a.map(Math.round) });
    }
  }
  // Text on text: overlap area above 15% of the smaller box
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i].r, b = texts[j].r;
    if (related(texts[i].el, texts[j].el)) continue;
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (w <= 0 || h <= 0) continue;
    if (w * h > 0.15 * Math.min(a.width * a.height, b.width * b.height)) out.push({ kind: 'text_overlap', text: texts[i].s.slice(0, 30), other: texts[j].s.slice(0, 30), who: name(texts[i].el), box: [a.left, a.top, a.right, a.bottom].map(Math.round) });
  }
  // Non-text strokes in the caption band
  for (const sh of shapes) {
    if (sh.pts.some((p) => p[1] > zoneY + 1 && p[1] < H && p[0] > 0 && p[0] < W)) out.push({ kind: 'caption_zone', text: '', who: name(sh.el), box: [] });
  }
  return out;
}


// Runs in the page: the frame's ink (for empty frames), which data-hand marks are visible, and the visible text
// inside each data-read. No geometry, so it is cheap to call on its own.
// Ink = share of the content area (y < top of the caption band) covered by content, accumulated on a 40 px grid,
// each cell capped at full. Counts as content: text boxes; fills clearly different from the paper colour (dots,
// blocks, tags, solid circles); strokes (length x width: arrows, connectors, hand marks); small shapes and cells
// up to 48 px (whole box); images, video, canvas.
// Does not count: borders and near-paper backgrounds of containers such as windows and cards (an empty window or
// card is not content); backgrounds covering more than half the content area (paper, paper texture, page frame);
// anything fully inside the presenter box; elements with data-bg and their descendants; opacity < 0.05.
function extras(cfg) {
  const W = 1920, H = cfg.zoneY, CELL = 40, CX = Math.ceil(W / CELL), CY = Math.ceil(H / CELL);
  const cells = new Float32Array(CX * CY);
  const oc = new Map();
  const op = (el) => {
    if (!el || el.nodeType !== 1) return 1;
    if (oc.has(el)) return oc.get(el);
    const cs = getComputedStyle(el);
    const o = cs.display === 'none' ? 0 : Number(cs.opacity) * op(el.parentElement);
    oc.set(el, o); return o;
  };
  const alpha = (el) => { if (getComputedStyle(el).visibility === 'hidden') return 0; return op(el); };
  const rgba = (c) => { const m = (c || '').match(/[\d.]+/g); if (!m) return [0, 0, 0, 0]; return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]]; };
  const rootEl = document.querySelector('[data-composition-id]') || document.body;
  let bg = rgba(getComputedStyle(rootEl).backgroundColor);
  if (bg[3] < 0.5) bg = rgba(getComputedStyle(document.body).backgroundColor);
  if (bg[3] < 0.5) bg = [255, 255, 255, 1];
  // Fill contrast against the paper (max RGB difference / 255): below 0.1 is paper (white cards, light windows), 0.3 and above is full ink
  const contrast = (c) => Math.min(1, Math.max(0, Math.max(Math.abs(c[0] - bg[0]), Math.abs(c[1] - bg[1]), Math.abs(c[2] - bg[2])) / 255 - 0.1) / 0.2) * c[3];
  const AV = cfg.avatar;
  const inAvatar = (r) => AV && r.left >= AV[0] - 2 && r.right <= AV[2] + 2 && r.top >= AV[1] - 2 && r.bottom <= AV[3] + 2;
  const skip = (el) => !!el.closest('[data-bg]');
  const handEls = [...document.querySelectorAll('[data-hand]')];
  const handSeen = new Set();
  const handOf = (el) => { const h = el.closest('[data-hand]'); return h ? handEls.indexOf(h) : -1; };
  // Add area x weight to the grid, split by overlap with each cell
  const add = (x0, y0, x1, y1, w) => {
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(W, x1); y1 = Math.min(H, y1);
    if (x1 <= x0 || y1 <= y0 || w <= 0) return 0;
    for (let cy = Math.floor(y0 / CELL); cy <= Math.min(CY - 1, Math.floor((y1 - 1e-6) / CELL)); cy++) {
      const a0 = Math.max(y0, cy * CELL), a1 = Math.min(y1, cy * CELL + CELL);
      for (let cx = Math.floor(x0 / CELL); cx <= Math.min(CX - 1, Math.floor((x1 - 1e-6) / CELL)); cx++) {
        const b0 = Math.max(x0, cx * CELL), b1 = Math.min(x1, cx * CELL + CELL);
        cells[cy * CX + cx] += ((a1 - a0) * (b1 - b0) * w) / (CELL * CELL);
      }
    }
    return (x1 - x0) * (y1 - y0) * w;
  };
  // A hand mark is visible when it or a descendant puts down ink (container borders count: a hand-drawn box may be a border)
  const why = cfg.why ? [] : null;
  const label = (el) => { const parts = []; for (let e = el; e && e.nodeType === 1 && parts.length < 3; e = e.parentElement) { parts.unshift(e.id ? '#' + e.id : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : '')); if (e.id) break; } return parts.join(' > '); };
  const seen = (el, ink) => { if (headKey && ink > 4) tx.push([headKey, ink]); headKey = null; if (ink > 4) { const h = handOf(el); if (h >= 0) handSeen.add(h); if (why) why.push([label(el) + (el.childElementCount ? '' : ' "' + (el.textContent || '').trim().slice(0, 12) + '"'), Math.round(ink)]); } };
  // Header candidates: anything fully within the top chromeY px records a key (text + position); after the whole run the caller decides which are running headers; known headers are skipped
  const chrome = new Set(cfg.chrome || []), tx = [];
  let headKey = null;
  const head = (el, r, s) => {
    headKey = null;
    if (r.bottom > cfg.chromeY) return false;
    const key = (typeof s === 'function' ? s() : s).trim().slice(0, 40) + '@' + [r.left, r.top, r.width, r.height].map((v) => Math.round(v / 2)).join(',');
    if (chrome.has(key)) return true;
    headKey = key; return false;
  };
  const SMALL = 48, BOXW = 0.5; // container outlines (window and card borders, stroke-only closed shapes) count as lines at half weight
  // 1 Text: the whole text box
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!el || !n.textContent.trim() || el.closest('script, style, title') || skip(el)) continue;
    const o = alpha(el); if (o < 0.05) continue;
    let r;
    if (el.closest('svg')) r = el.getBoundingClientRect();
    else { const range = document.createRange(); range.selectNodeContents(n); r = range.getBoundingClientRect(); }
    if (r.width < 1 || r.height < 1 || inAvatar(r)) continue;
    if (head(el, r, n.textContent)) continue;
    seen(el, add(r.left, r.top, r.right, r.bottom, o));
  }
  // 2 SVG shapes
  for (const el of document.querySelectorAll('circle, ellipse, rect, path, line, polyline, polygon, image, use')) {
    if (skip(el)) continue;
    const o = alpha(el); if (o < 0.05) continue;
    const r = el.getBoundingClientRect();
    if ((r.width < 0.5 && r.height < 0.5) || inAvatar(r) || head(el, r, () => label(el))) continue;
    const big = r.width * r.height > 0.5 * W * H;
    if (el.tagName === 'image' || el.tagName === 'use') { if (!big) seen(el, add(r.left, r.top, r.right, r.bottom, o)); continue; }
    const cs = getComputedStyle(el);
    const fc = rgba(cs.fill); fc[3] *= Number(cs.fillOpacity);
    const fw = cs.fill !== 'none' && fc[3] > 0.05 ? contrast(fc) : 0;
    const sw = parseFloat(cs.strokeWidth) || 0, sc = rgba(cs.stroke); sc[3] *= Number(cs.strokeOpacity);
    const sOn = cs.stroke !== 'none' && sw > 0 && sc[3] > 0.05;
    // Small shapes (dots, small icons) count as a whole box, without sampling (hundreds of dots would be too slow)
    if (Math.max(r.width, r.height) <= SMALL) { seen(el, add(r.left, r.top, r.right, r.bottom, o * Math.max(fw, sOn ? 0.6 : 0))); continue; }
    if (big) continue;
    let ink = fw > 0 ? add(r.left, r.top, r.right, r.bottom, o * fw) : 0;
    // Stroke-only closed shapes (rect, circle, ellipse, polygon, path ending in Z) are container outlines at half weight; open lines count fully
    const closed = /^(rect|circle|ellipse|polygon)$/.test(el.tagName) || (el.tagName === 'path' && /z\s*$/i.test(el.getAttribute('d') || ''));
    if (sOn && el.getTotalLength) {
      let len; try { len = el.getTotalLength(); } catch (_) { len = 0; }
      const m = el.getScreenCTM();
      if (len > 0 && m) {
        let vis = [0, len];
        const da = cs.strokeDasharray.split(/[ ,]+/).map(parseFloat).filter((v) => !isNaN(v));
        if (da.length === 2 && da[1] >= len * 0.5) { const off = -parseFloat(cs.strokeDashoffset || '0') || 0; vis = [Math.max(0, off), Math.min(len, off + da[0])]; }
        const span = vis[1] - vis[0];
        if (span > 0.5) {
          const k2 = Math.hypot(m.a, m.b), wpx = Math.max(1, sw * k2), cw = o * Math.min(1, sc[3] * 1.2);
          const k = Math.min(200, Math.ceil(span / 8)), seg = (span / k) * k2, lw = closed ? cw * BOXW : cw;
          for (let i = 0; i < k; i++) {
            const p = el.getPointAtLength(vis[0] + span * (i + 0.5) / k);
            const x = m.a * p.x + m.c * p.y + m.e, y = m.b * p.x + m.d * p.y + m.f;
            ink += add(x - seg / 2, y - wpx / 2, x + seg / 2, y + wpx / 2, lw);
          }
        }
      }
    }
    seen(el, ink);
  }
  // 3 HTML boxes: background by area x contrast; borders are container outlines at half weight (small cells and tags count fully)
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest('svg') || /^(SCRIPT|STYLE|AUDIO|LINK|META|BR)$/.test(el.tagName) || skip(el)) continue;
    const o = alpha(el); if (o < 0.05) continue;
    const cs = getComputedStyle(el);
    const media = /^(IMG|VIDEO|CANVAS)$/.test(el.tagName);
    const bc = rgba(cs.backgroundColor), hasImg = cs.backgroundImage !== 'none';
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map((k) => (cs['border' + k + 'Style'] !== 'none' && rgba(cs['border' + k + 'Color'])[3] > 0.05 ? parseFloat(cs['border' + k + 'Width']) || 0 : 0));
    const brd = bw.some((v) => v > 0) ? rgba(cs.borderTopColor) : null;
    if (!media && bc[3] < 0.05 && !hasImg && !(brd && brd[3] > 0.05)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || inAvatar(r) || r.width * r.height > 0.5 * W * H || head(el, r, () => label(el))) continue;
    const fw = bc[3] >= 0.05 ? contrast(bc) : 0;
    let w = media || hasImg ? 1 : fw;
    if (Math.max(r.width, r.height) <= SMALL && brd) w = Math.max(w, 0.6);
    let ink = add(r.left, r.top, r.right, r.bottom, o * w);
    if (brd && !(Math.max(r.width, r.height) <= SMALL)) {
      const bwt = o * BOXW * Math.min(1, brd[3] * 1.2);
      ink += add(r.left, r.top, r.right, r.top + bw[0], bwt) + add(r.left, r.bottom - bw[2], r.right, r.bottom, bwt) + add(r.left, r.top + bw[0], r.left + bw[3], r.bottom - bw[2], bwt) + add(r.right - bw[1], r.top + bw[0], r.right, r.bottom - bw[2], bwt);
    }
    seen(el, ink);
  }
  let ink = 0;
  for (const v of cells) ink += Math.min(1, v);
  // data-read: visible text (opacity >= 0.15, non-zero size, in frame), and whether any of it is translucent or cut off
  const reads = [...document.querySelectorAll('[data-read]')].map((root) => {
    let s = '', solid = true;
    const w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w2.nextNode(); n; n = w2.nextNode()) {
      const t = n.textContent.replace(/\s+/g, ''); if (!t) continue;
      const el = n.parentElement; const o = alpha(el);
      if (o < 0.15) continue;
      let r;
      if (el.closest('svg')) r = el.getBoundingClientRect();
      else { const range = document.createRange(); range.selectNodeContents(n); r = range.getBoundingClientRect(); }
      if (r.width < 1 || r.height < 1 || r.right <= 0 || r.left >= 1920 || r.bottom <= 0 || r.top >= 1080) continue;
      if (r.left < -1 || r.right > 1921 || r.top < -1 || r.bottom > 1081) solid = false;
      if (o < cfg.readAlpha) solid = false;
      s += t;
    }
    return { s, solid };
  });
  return { why: why && why.sort((p, q) => q[1] - p[1]).slice(0, 25), ink: ink / cells.length, area: cells.length * CELL * CELL, tx, hands: [...handSeen], reads };
}

// Markup inventory of the page: the name of each data-hand, and each data-read with its required seconds
function marks() {
  const name = (el) => {
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && parts.length < 3; e = e.parentElement) { parts.unshift(e.id ? '#' + e.id : e.tagName.toLowerCase()); if (e.id) break; }
    return parts.join(' > ');
  };
  return {
    hands: [...document.querySelectorAll('[data-hand]')].map((el) => el.getAttribute('data-hand') || name(el)),
    reads: [...document.querySelectorAll('[data-read]')].map((el) => ({ who: name(el), need: parseFloat(el.getAttribute('data-read')) || null })),
  };
}

(async () => {
  // Browser from the kit helper: the project's build/browser.cjs, else the terminal-ledger kit's
  const B = [path.join(dir, 'build/browser.cjs'), path.join(__dirname, '../assets/kits/terminal-ledger/starter/build/browser.cjs')].find((p) => fs.existsSync(p));
  if (!B) throw new Error('build/browser.cjs not found in the project or in assets/kits/terminal-ledger/starter/');
  const browser = await require(B).launch({ from: dir, args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
  // Local static server: fetch() inside a file:// page is blocked
  const http = require('http');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webm': 'video/webm', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
  const server = http.createServer((req, res) => {
    const f = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { if (!req.url.includes('favicon')) console.error('[404]', req.url); res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const openPage = async () => {
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.error('[page error]', e.message));
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'load', timeout: 120000 });
    // Wait for the main timeline to register (waitForFunction does not fire on these pages, so poll)
    const deadline = Date.now() + Number(opt('wait', '120')) * 1000;
    while (!(await page.evaluate(() => !!(window.__timelines && window.__timelines.main)))) {
      if (Date.now() > deadline) throw new Error('main timeline never registered: window.__timelines.main is missing');
      await new Promise((r) => setTimeout(r, 500));
    }
    await page.evaluate(() => document.fonts.ready);
    // No HyperFrames runtime in a directly opened page: size the root composition from data-width/height (the runtime would)
    await page.evaluate(() => {
      const r = document.querySelector('[data-composition-id]');
      if (r) { r.style.width = (r.dataset.width || 1920) + 'px'; r.style.height = (r.dataset.height || 1080) + 'px'; }
      window.__timelines.main.pause();
    });
    return page;
  };
  const JOBS = Number(opt('jobs', '1')); // several pages were measured slower (they compete on one machine), so 1
  const first = await openPage();
  const dur = await first.evaluate(() => window.__timelines.main.duration());
  const from = Number(opt('from', '0')), to = Number(opt('to', String(dur)));
  const times = [];
  for (let t = from; t <= to + 1e-9; t += STEP) times.push(Math.round(t * 1000) / 1000);
  const pages = [first, ...(await Promise.all(Array.from({ length: Math.max(0, JOBS - 1) }, openPage)))];
  const frames = [];
  const t0 = Date.now();
  const chunk = Math.ceil(times.length / pages.length);
  const CFG = { zoneY: ZONE_Y, avatar: AVATAR, readAlpha: READ_ALPHA, chromeY: CHROME_Y };
  // One sample: seek, then measure geometry (when geo is false, only ink, hand marks and read text)
  const probe = (page, t, geo, why) => page.evaluate(async (tt, cfg, fnG, fnX, g) => {
    window.__timelines.main.seek(tt, false);
    await new Promise((r) => setTimeout(r, 0));
    const ev = (0, eval);
    return { found: g ? ev('(' + fnG + ')')(cfg.zoneY) : [], x: ev('(' + fnX + ')')(cfg) };
  }, t, why ? { ...CFG, why: true } : CFG, measure.toString(), extras.toString(), geo);
  await Promise.all(pages.map(async (page, k) => {
    for (const t of times.slice(k * chunk, (k + 1) * chunk)) {
      const r = await probe(page, t, true);
      frames.push({ t, found: r.found, x: r.x });
    }
  }));
  frames.sort((a, b) => a.t - b.t);
  // Running headers (chapter labels and the like) are not ink: text fully within the top CHROME_Y px, same text in the same place for >= CHROME_S seconds
  const chromeKeys = new Set();
  { const run = new Map();
    frames.forEach((f, i) => {
      for (const [k] of f.x.tx) {
        const v = run.get(k);
        if (v && v.i === i - 1) { v.i = i; v.to = f.t; } else run.set(k, { i, from: f.t, to: f.t });
        const w = run.get(k); if (w.to - w.from + STEP >= CHROME_S) chromeKeys.add(k);
      }
    });
    for (const f of frames) for (const [k, v] of f.x.tx) if (chromeKeys.has(k)) f.x.ink -= v / f.x.area;
  }
  CFG.chrome = [...chromeKeys];
  if (opt('why')) {
    const r = await probe(first, Number(opt('why')), false, true);
    console.log(`${opt('why')} s: ink ${(r.x.ink * 100).toFixed(2)}% (share of the 1920x${ZONE_Y} content area; ${chromeKeys.size} running headers excluded). Largest items (pixel area x weight):`);
    for (const [k, v] of r.x.why) console.log(`  ${String(v).padStart(7)}  ${k}`);
    await browser.close(); server.close(); return;
  }
  const mk = await first.evaluate((fn) => (0, eval)('(' + fn + ')')(), marks.toString());
  // Refine span edges to the frame: bisect between a sample where the predicate fails and one where it holds (ink, hand and read only, cheap)
  const FR = 1 / 30;
  const snap = (t) => Math.round(t * 30) / 30;
  const edge = async (lo, hi, pred) => { // pred(lo) differs from pred(hi); returns the frame nearest lo where pred equals pred(hi)
    const want = pred((await probe(first, hi, false)).x);
    while (Math.abs(hi - lo) > FR + 1e-6) {
      const mid = snap((lo + hi) / 2);
      if (mid === snap(lo) || mid === snap(hi)) break;
      if (pred((await probe(first, mid, false)).x) === want) hi = mid; else lo = mid;
    }
    return snap(hi);
  };
  // Spans where pred holds: merge samples, then refine both ends to the frame
  const spans = async (pred) => {
    const out = [];
    for (let i = 0; i < frames.length; i++) {
      if (!pred(frames[i].x)) continue;
      let j = i; while (j + 1 < frames.length && pred(frames[j + 1].x)) j++;
      const a = i > 0 ? await edge(frames[i - 1].t, frames[i].t, pred) : frames[i].t;
      const b = j + 1 < frames.length ? await edge(frames[j + 1].t, frames[j].t, pred) : frames[j].t;
      out.push([a, b, b - a + FR]);
      i = j;
    }
    return out;
  };
  const issues = [];
  // 1 Empty frames: sparse (ink < EMPTY) for >= EMPTY_HOLD, or blank (ink < BLANK) for >= BLANK_HOLD
  const emptyIssue = async (a, b, d, what0, th) => {
    const mid = snap((a + b) / 2), w = await probe(first, mid, false, true);
    const what = [...new Set(w.x.why.map(([k]) => k))].slice(0, 3).join('; ') || '(nothing)';
    issues.push({ kind: 'empty', from: a, to: b, text: `${what0} for ${d.toFixed(2)} s; ink at ${fmt(mid)} is ${(w.x.ink * 100).toFixed(2)}% (threshold ${(th * 100).toFixed(1)}%); on screen mostly: ${what}`, who: '' });
  };
  const sparse = (await spans((x) => x.ink < EMPTY)).filter(([, , d]) => d + 1e-6 >= EMPTY_HOLD);
  for (const [a, b, d] of sparse) await emptyIssue(a, b, d, 'sparse', EMPTY);
  for (const [a, b, d] of await spans((x) => x.ink < BLANK)) {
    if (d + 1e-6 < BLANK_HOLD || sparse.some(([p, q]) => a >= p - 1e-6 && b <= q + 1e-6)) continue;
    await emptyIssue(a, b, d, 'blank', BLANK);
  }
  // 2 Hand marks: distinct data-hand elements that became visible
  const handFirst = new Map();
  for (const f of frames) for (const h of f.x.hands) { const v = handFirst.get(h); if (!v) handFirst.set(h, [f.t, f.t]); else v[1] = f.t; }
  const handList = [...handFirst.entries()].sort((p, q) => p[1][0] - q[1][0]).map(([h, [a, b]]) => ({ who: mk.hands[h], from: a, to: b }));
  if (handList.length > HAND_MAX) issues.push({ kind: 'hand_over', from: handList[0].from, to: handList[handList.length - 1].to, text: `${handList.length} hand marks, max ${HAND_MAX}: ` + handList.map((h) => `${fmt(h.from)} ${h.who}`).join('; '), who: '' });
  // 3 Read holds: longest continuous stretch in which the data-read text is complete (equal to its longest version in the film) and opaque
  const readList = [];
  for (let i = 0; i < mk.reads.length; i++) {
    let full = '';
    for (const f of frames) { const s = f.x.reads[i].s; if (s.length > full.length) full = s; }
    if (!full.length) continue;   // never shown in this range (it belongs outside --from/--to): checked when its own range is checked
    const need = mk.reads[i].need || READ;
    const pred = (x) => x.reads[i].solid && x.reads[i].s === full && full.length > 0;
    const sp = (await spans(pred)).sort((p, q) => q[2] - p[2]);
    // With --from/--to, a span touching the range edge may continue outside it: keep measuring outward until it is long enough, so a card crossing ranges is not reported on both sides
    const tEnd = frames[frames.length - 1].t;
    for (const s of sp) {
      if (s[2] + 1e-6 >= need) break;
      let [a, b] = s;
      if (a <= from + 1e-6 && from > 1e-6) {
        let t = a, prev = a;
        while (t > 0 && b - t + FR < need) { prev = t; t = Math.max(0, snap(t - STEP)); if (!pred((await probe(first, t, false)).x)) { a = await edge(t, prev, pred); break; } a = t; }
      }
      if (b >= tEnd - 1e-6 && tEnd < dur - 1e-6) {
        let t = b, prev = b;
        while (t < dur && t - a + FR < need) { prev = t; t = Math.min(dur, snap(t + STEP)); if (!pred((await probe(first, t, false)).x)) { b = await edge(t, prev, pred); break; } b = t; }
      }
      s[0] = a; s[1] = b; s[2] = b - a + FR;
    }
    sp.sort((p, q) => q[2] - p[2]);
    const best = sp[0] || [null, null, 0];
    const r = { who: mk.reads[i].who, text: full.slice(0, 30), need, from: best[0], to: best[1], seconds: Math.round(best[2] * 100) / 100 };
    readList.push(r);
    if (best[2] + 1e-6 < need) issues.push({ kind: 'read_short', from: best[0] ?? 0, to: best[1] ?? 0, text: `"${r.text}" fully readable for ${best[2].toFixed(2)} s, needs ${need} s`, who: r.who });
  }
  // Merge geometry findings into continuous runs; a single sample is a transition and is not reported; caption band needs only two samples
  const runs = new Map(); // key -> [{...x, from, to, n}]
  for (const f of frames) for (const x of f.found) {
    const key = [x.kind, x.who, x.other || '', x.text].join('|');
    if (f.seen && f.seen.has(key)) continue;
    (f.seen = f.seen || new Set()).add(key);
    const list = runs.get(key) || [];
    const last = list[list.length - 1];
    if (last && f.t - last.to <= STEP * 1.5) {
      last.to = f.t; last.n++;
      if (x.rel && last.lastRel && x.rel.some((v, k) => Math.abs(v - last.lastRel[k]) > 4)) last.moving = true;
      last.lastRel = x.rel;
    } else list.push({ ...x, from: f.t, to: f.t, n: 1, lastRel: x.rel, moving: false });
    runs.set(key, list);
  }
  // Labels moving along a line (messages, tokens) cross strokes by design: text_on_stroke is only reported while static; other kinds also while moving
  for (const list of runs.values()) for (const r of list) {
    if (r.n < 2 || (r.moving && r.kind === 'text_on_stroke')) continue;
    if (r.kind !== 'caption_zone' && r.to - r.from + STEP < HOLD) continue;
    delete r.lastRel; delete r.rel; issues.push(r);
  }
  await browser.close();
  server.close();
  issues.sort((a, b) => a.from - b.from);
  const report = { dir, step: STEP, from, to, samples: frames.length, seconds: (Date.now() - t0) / 1000, params: { hold: HOLD, empty: EMPTY, emptyHold: EMPTY_HOLD, blank: BLANK, blankHold: BLANK_HOLD, chrome: CHROME_S, handMax: HAND_MAX, read: READ }, hands: handList, reads: readList, issues };
  if (DUMP) report.frames = frames.map((f) => ({ t: f.t, ink: Math.round(f.x.ink * 10000) / 10000 }));
  fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
  console.log(`geo-check: ${frames.length} samples in ${((Date.now() - t0) / 1000).toFixed(0)} s, ${issues.length} issues (report ${OUT})`);
  console.log(`hand marks ${handList.length} (max ${HAND_MAX})` + handList.map((h) => `\n  ${fmt(h.from)}–${fmt(h.to)}  ${h.who}`).join(''));
  console.log(`read holds ${readList.length}` + readList.map((r) => `\n  ${r.from == null ? 'never complete' : fmt(r.from) + '–' + fmt(r.to)}  ${r.seconds} s / need ${r.need} s  "${r.text}"`).join(''));
  for (const x of issues) {
    if (/^(empty|hand_over|read_short)$/.test(x.kind)) console.log(`${fmt(x.from)}–${fmt(x.to)}  ${x.kind}  ${x.text}  ${x.who}`);
    else console.log(`${fmt(x.from)}–${fmt(x.to)}  ${x.kind}  "${x.text}"${x.other ? ' × ' + x.other : ''}  ${x.who}`);
  }
  process.exitCode = issues.length ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(2); });
