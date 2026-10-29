#!/usr/bin/env node
// Page checks (npm run check calls this): what geo-check and the engine's check cannot see, measured by seeking the directly opened page.
// 0. Handoff contract is consistent: each segment's last.items equals the next segment's first.items.
// 1. Presenter reserve: outside the presenter windows (film.json "avatar"), the reserve x 1580–1880, y 560–860 must be plain paper in
//    every frame. Each sampled frame first lists the visible painted elements whose box (grown by 40 px for shadows, blur and stroke width)
//    reaches into the reserve; only frames with such an element are screenshotted and compared pixel by pixel with the paper colour.
//    Painted means own text, a background, a border, a shadow, an SVG shape or an image; a kit that paints with ::before / ::after
//    must add that here.
// 2. Handoffs: for each built segment, at its last frame (end − 1/30) every item of handoff.json last.items was given, is visible and
//    within 6 px of its box; the chapter label and the counter match the description; the camera is back home (unless "cam" is written).
//    Visible means opacity ≥ 0.5 and not covered: the item's box is hit-tested at 35 points, and when at least half of the points where
//    a verdict show an opaque element above it that spans at least half of its box (a window created after the strip inside it), it is
//    reported as handoff_covered. Elements created later sit on top of earlier ones in the same layer.
// 3. Segment-end leftovers: things still visible in the segment's layers at its last frame that belong to no handed-over object (the next
//    segment's first frame would lose them abruptly).
// Usage: node build/page-checks.cjs --from a --to b [--zone-step 0.0667] [--out report.json]; exit 0 pass, 1 issues, 2 error
'use strict';
const fs = require('fs'), path = require('path');
const { dir, film, handoff, seams, args, range, open, fmt } = require('./common.cjs');
const o = args(), FM = film(), HO = handoff();
const [A, B] = range(o, FM);
const STEP = Number(o['zone-step'] || 1 / 15), TOL = 6;
const Z = [1580, 560, 1880, 860];
const S = FM.stage;   // web loop units: no presenter reserve; handoff boxes compared in logical canvas units (screen px ÷ k)
const PAPER = [246, 241, 231];
(async () => {
  const { page, seek, close, errors } = await open();
  const issues = [], notes = [];
  const segErr = await page.evaluate(() => window.__segErrors);
  const built = await page.evaluate(() => window.__built);
  for (const e of segErr) { const s = FM.timeline.find((x) => x.id === e.seg); if (s && s.t1 > A && s.t0 < B) issues.push({ kind: 'segment_error', text: `segment ${e.seg} failed to build: ${e.msg.split('\n')[0]}` }); }
  // ---------- 0. contract consistency: last.items of one segment equals first.items of the next ----------
  const segBy = Object.fromEntries((HO.segments || []).map((x) => [x.id, x]));
  for (const sm of seams(HO)) {
    if (sm.at < A - 1e-6 || sm.at > B + 1e-6) continue;
    const L = ((segBy[sm.from] || {}).last || {}), R = ((segBy[sm.to] || {}).first || {});
    for (const id of sm.objects) {
      const a = (L.items || {})[id], b = (R.items || {})[id];
      if (!b) issues.push({ kind: 'handoff_contract', text: `seam ${sm.from}→${sm.to}: "${id}" is in ${sm.from}.last.items but not in ${sm.to}.first.items` });
      else if (a && JSON.stringify(a) !== JSON.stringify(b)) issues.push({ kind: 'handoff_contract', text: `seam ${sm.from}→${sm.to}: "${id}" is described differently on the two sides (last and first must be identical)` });
    }
    for (const k of ['chapter', 'counter']) if (k in L && k in R && JSON.stringify(L[k]) !== JSON.stringify(R[k])) issues.push({ kind: 'handoff_contract', text: `seam ${sm.from}→${sm.to}: ${k} differs between the two sides` });
  }
  // ---------- 1. presenter reserve ----------
  const wins = FM.avatar || [];
  if (!S.web) {
  const inAv = (t) => wins.some(([a, b]) => t >= a && t < b);
  const busy = [];
  const helper = await page.browser().newPage();
  const stat = (b64) => helper.evaluate(async (s, P) => {
    const blob = await (await fetch('data:image/png;base64,' + s)).blob(); const bm = await createImageBitmap(blob);
    const c = new OffscreenCanvas(bm.width, bm.height), g = c.getContext('2d'); g.drawImage(bm, 0, 0);
    const d = g.getImageData(0, 0, bm.width, bm.height).data; let n = 0;
    for (let i = 0; i < d.length; i += 4) { const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2], yp = 0.299 * P[0] + 0.587 * P[1] + 0.114 * P[2]; if (Math.abs(y - yp) > 6) n++; }
    return n;
  }, b64, PAPER);
  // Candidate frames: in one pass inside the page, seek each sample and keep the times where a visible painted element reaches into the reserve
  const times = [];
  for (let t = A; t <= B + 1e-9; t += STEP) { const tt = Math.round(t * 1000) / 1000; if (!inAv(tt)) times.push(tt); }
  const near = await page.evaluate((times, Z, M) => {
    const out = [];
    const clear = 'rgba(0, 0, 0, 0)';
    for (const tt of times) {
      window.__timelines.main.seek(tt, false);
      document.querySelectorAll('.clip[data-start]').forEach((c) => { const a = +c.dataset.start, d = +c.dataset.duration; if (c.id !== 'world') c.style.visibility = tt >= a && tt < a + d ? 'visible' : 'hidden'; });
      for (const e of document.querySelectorAll('#root *')) {
        const r = e.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (r.right + M <= Z[0] || r.left - M >= Z[2] || r.bottom + M <= Z[1] || r.top - M >= Z[3]) continue;
        const cs = getComputedStyle(e);
        const shape = e instanceof SVGGraphicsElement && !(e instanceof SVGSVGElement) && !(e instanceof SVGGElement);
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        const painted = shape || own || /^(IMG|CANVAS|VIDEO)$/.test(e.tagName) || cs.backgroundImage !== 'none' || (cs.backgroundColor !== clear && cs.backgroundColor !== 'transparent') || cs.boxShadow !== 'none'
          || ['Top', 'Right', 'Bottom', 'Left'].some((k) => parseFloat(cs['border' + k + 'Width']) > 0 && cs['border' + k + 'Style'] !== 'none');
        if (!painted || cs.visibility === 'hidden' || cs.display === 'none') continue;
        let op = 1, shown = true; for (let p = e; p && p.nodeType === 1; p = p.parentElement) { const c = p === e ? cs : getComputedStyle(p); op *= +c.opacity; if (c.display === 'none') shown = false; }
        if (shown && op >= 0.02) { out.push(tt); break; }
      }
    }
    return out;
  }, times, Z, 40);
  const frames = times.length;
  for (const tt of near) {
    await seek(tt);
    const b64 = await page.screenshot({ encoding: 'base64', clip: { x: Z[0], y: Z[1], width: Z[2] - Z[0], height: Z[3] - Z[1] } });
    const n = await stat(b64); if (n > 0) busy.push([tt, n]);
  }
  const spans = []; for (const [t, n] of busy) { const l = spans[spans.length - 1]; if (l && t - l[1] <= STEP * 1.5) { l[1] = t; l[2] = Math.max(l[2], n); } else spans.push([t, t, n]); }
  for (const [a, b, n] of spans) {
    await seek(a);
    const who = await page.evaluate((Z) => { const out = []; for (const e of document.querySelectorAll('#cam *, #scr *')) { if (e.children.length && !(e instanceof SVGElement)) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.right <= Z[0] || r.left >= Z[2] || r.bottom <= Z[1] || r.top >= Z[3]) continue; let op = 1; for (let p = e; p && p.nodeType === 1; p = p.parentElement) op *= +getComputedStyle(p).opacity; if (op < 0.02) continue; out.push((e.id ? '#' + e.id : e.getAttribute('class') || e.tagName.toLowerCase()) + (e.textContent ? '「' + e.textContent.slice(0, 12) + '」' : '')); if (out.length > 3) break; } return out.join('、'); }, Z);
    issues.push({ kind: 'avatar_zone', from: a, to: b, text: `presenter reserve not empty (up to ${n} px)${who ? ': ' + who : ''}` });
  }
  notes.push(`presenter reserve: ${frames} frames (every ${STEP.toFixed(3)} s, presenter windows skipped), ${near.length} with something near it compared pixel by pixel`);
  } else notes.push(`web loop unit: logical canvas ${S.w}×${S.h}, scaled ${S.k}×; presenter reserve not checked`);
  // ---------- 2. handoffs and 3. segment-end leftovers ----------
  // Hit-test a handed-over item at 7 × 5 points of its box: going down from the top, the first painted element either belongs to the item
  // (seen) or is an opaque element above it that spans at least half of its box (hidden); reaching the item's box first gives no verdict. Returns null when no point does.
  const covered = (seg, id) => page.evaluate((seg, id) => {
    const g = window.__given.find((x) => x.seg === seg && x.id === id), e = g && g.el; if (!e) return null;
    const css = document.createElement('style'); css.textContent = '#root, #root * { pointer-events: auto !important; }'; document.head.appendChild(css);
    const opacity = (x) => { let op = 1; for (let p = x; p && p.nodeType === 1; p = p.parentElement) op *= +getComputedStyle(p).opacity; return op; };
    const alpha = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 0; const v = m[1].split(',').map(Number); return v.length > 3 ? v[3] : 1; };
    const shape = (x) => x instanceof SVGGraphicsElement && !(x instanceof SVGSVGElement) && !(x instanceof SVGGElement);
    const paints = (x) => { const cs = getComputedStyle(x); return shape(x) || [...x.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || /^(IMG|CANVAS|VIDEO)$/.test(x.tagName) || cs.backgroundImage !== 'none' || alpha(cs.backgroundColor) > 0 || parseFloat(cs.borderTopWidth) > 0; };
    const opaque = (x) => { const cs = getComputedStyle(x); return (/^(IMG|CANVAS|VIDEO)$/.test(x.tagName) || alpha(cs.backgroundColor) >= 0.9 || (shape(x) && cs.fill !== 'none' && alpha(cs.fill) >= 0.9)) && opacity(x) >= 0.9; };
    const b = e.getBoundingClientRect(), by = {};
    if (b.width < 2 || b.height < 2) return null;                                     // a zero-size wrapper (F.group): no box to test
    // A cover spans at least half of the item's box; smaller opaque things on top (cells inside a window) are its content, not a cover
    const spans = (h) => { const r = h.getBoundingClientRect(), w = Math.min(r.right, b.right) - Math.max(r.left, b.left), v = Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top); return w > 0 && v > 0 && w * v >= 0.5 * b.width * b.height; };
    let seen = 0, hidden = 0;
    for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) {
      const x = b.left + b.width * (i + 0.5) / 7, y = b.top + b.height * (j + 0.5) / 5;
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const list = document.elementsFromPoint(x, y);
      if (!list.some((h) => h === e || e.contains(h) || h.contains(e))) continue;   // the item's box is not under this point
      for (const h of list) {
        if (h === e || e.contains(h)) { if (paints(h) && opacity(h) >= 0.5) { seen++; break; } if (h === e) break; continue; }
        if (h.contains(e)) break;                                                     // reached what lies under the item
        if (opaque(h) && spans(h)) { hidden++; const n = h.id ? '#' + h.id : (h.getAttribute('class') || h.tagName.toLowerCase()); by[n] = (by[n] || 0) + 1; break; }
      }
    }
    css.remove();
    if (!seen && !hidden) return null;
    return { seen, hidden, by: Object.entries(by).sort((p, q) => q[1] - p[1]).map(([n]) => n).slice(0, 2).join(', ') };
  }, seg, id);
  const given = (seg) => page.evaluate((seg) => window.__given.filter((g) => g.seg === seg).map((g) => g.id), seg);
  for (const s of FM.timeline) {
    if (!built.includes(s.id) || s.t1 < A - 1e-6 || s.t1 > B + 1e-6) continue;
    const H = (HO.segments || []).find((x) => x.id === s.id) || {};
    const isLast = s.id === FM.timeline[FM.timeline.length - 1].id;
    const bo = H.last && (Object.keys(H.last.items || {}).length || 'chapter' in H.last || 'counter' in H.last) ? H.last : null;
    const nextId = (seams(HO).find((x) => x.from === s.id) || {}).to;
    const tEnd = s.t1 - 1 / 30;
    await seek(tEnd);
    const gids = await given(s.id);
    if (bo) {
      for (const [id, spec] of Object.entries(bo.items || {})) {
        if (!gids.includes(id)) { issues.push({ kind: 'handoff_missing', text: `segment ${s.id} never gave "${id}" (its last.items in handoff.json lists it${nextId ? ', for ' + nextId : ''})` }); continue; }
        const r = await page.evaluate((seg, id) => { const g = window.__given.find((x) => x.seg === seg && x.id === id); const e = g && g.el; if (!e) return null; const b = e.getBoundingClientRect(), k = window.TOKENS.zone.K || 1; let op = 1; for (let p = e; p && p.nodeType === 1; p = p.parentElement) op *= +getComputedStyle(p).opacity; return { box: [b.left, b.top, b.width, b.height].map((v) => Math.round(v / k)), op: Math.round(op * 100) / 100 }; }, s.id, id);
        if (!r) { issues.push({ kind: 'handoff_missing', text: `segment ${s.id} gave "${id}" without an element (give an element or an object with .el)` }); continue; }
        if (spec.box) { const d = Math.max(...r.box.map((v, k) => Math.abs(v - spec.box[k]))); if (d > TOL) issues.push({ kind: 'handoff_box', from: tEnd, to: tEnd, text: `segment ${s.id} last frame: "${id}" box ${r.box.join(',')}, the contract says ${spec.box.join(',')} (off by ${d} px)` }); }
        if (r.op < 0.5 && spec.visible !== false) issues.push({ kind: 'handoff_hidden', from: tEnd, to: tEnd, text: `segment ${s.id} last frame: "${id}" opacity ${r.op}, the next segment would receive it invisible` });
        else if (spec.visible !== false) { const c = await covered(s.id, id); if (c && c.hidden * 2 >= c.hidden + c.seen) issues.push({ kind: 'handoff_covered', from: tEnd, to: tEnd, text: `segment ${s.id} last frame: "${id}" is covered by ${c.by} at ${c.hidden} of ${c.hidden + c.seen} points (an element created later sits on top: create or take the container first)` }); }
      }
      const st = await page.evaluate(() => { const c = document.querySelector('#chap .ct:last-of-type'); let chap = null; document.querySelectorAll('#chap .ct').forEach((e) => { if (+getComputedStyle(e).opacity > 0.5) chap = e.textContent; }); const w = document.getElementById('c-num-wrap'); const cnt = w && +getComputedStyle(w).opacity > 0.5 ? document.getElementById('c-num').textContent : null; const cam = document.getElementById('cam').style.transform || ''; return { chap, cnt, cam }; });
      if ('chapter' in bo && bo.chapter !== st.chap) issues.push({ kind: 'handoff_state', from: tEnd, to: tEnd, text: `segment ${s.id} last frame: chapter label "${st.chap}", the contract says "${bo.chapter}"` });
      if ('counter' in bo) { const want = bo.counter ? String(bo.counter.value) : null; if (want !== st.cnt) issues.push({ kind: 'handoff_state', from: tEnd, to: tEnd, text: `segment ${s.id} last frame: counter "${st.cnt}", the contract says "${want}"` }); }
      if (!bo.cam && st.cam && !/^(translate\(0px, 0px\)|translate3d\(0px, 0px, 0px\))?\s*(scale\(1(, 1)?\))?$/.test(st.cam.trim()) && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(st.cam)) issues.push({ kind: 'handoff_state', from: tEnd, to: tEnd, text: `segment ${s.id} last frame: camera not back home (${st.cam}) and the contract has no cam` });
    }
    // Segment-end leftovers: visible content in this segment's layers that belongs to no given object (not checked for the film's last segment)
    const left = isLast ? [] : await page.evaluate((seg) => {
      const keep = window.__given.filter((g) => g.seg === seg && g.el).map((g) => g.el);
      const out = [];
      const all = [...document.getElementById('seg-' + seg).querySelectorAll('*'), ...document.getElementById('scr-' + seg).querySelectorAll('*')];
      for (const e of all) {
        if (keep.some((k) => k === e || k.contains(e))) continue;
        const svgShape = e instanceof SVGGraphicsElement && !(e instanceof SVGSVGElement) && !(e instanceof SVGGElement);
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        const cs = getComputedStyle(e);
        const painted = svgShape || own || (cs.backgroundImage !== 'none') || (!/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) || parseFloat(cs.borderTopWidth) > 0;
        if (!painted) continue;
        const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.right < 0 || r.left > 1920 || r.bottom < 0 || r.top > 1080) continue;
        let op = 1, vis = true; for (let p = e; p && p.nodeType === 1; p = p.parentElement) { const c = getComputedStyle(p); op *= +c.opacity; if (c.visibility === 'hidden' || c.display === 'none') vis = false; }
        if (!vis || op < 0.05) continue;
        out.push((e.id ? '#' + e.id : (e.getAttribute('class') || e.tagName.toLowerCase())) + (own ? '「' + e.textContent.trim().slice(0, 10) + '」' : ''));
      }
      return out;
    }, s.id);
    if (left.length) issues.push({ kind: 'segment_residue', from: tEnd, to: tEnd, text: `segment ${s.id} last frame: ${left.length} visible elements were not handed over: ${[...new Set(left)].slice(0, 6).join(', ')}` });
    notes.push(`segment ${s.id} last frame ${fmt(tEnd)}: gave ${gids.length ? gids.join(', ') : '(nothing)'}${bo ? `, last.items has ${Object.keys(bo.items || {}).length}` : ', handoff has no last'}`);
  }
  // Receiving segments: stand-ins used where the previous segment is not built
  const stand = await page.evaluate(() => Object.entries(window.__hand).filter(([, v]) => v && v._standIn).map(([k]) => k));
  if (stand.length) notes.push('stand-ins (previous segment not built, placed from the contract): ' + stand.join(', '));
  const pageErr = errors.filter((e) => !/favicon/.test(e));
  if (pageErr.length) issues.push({ kind: 'page_error', text: 'page errors: ' + pageErr.slice(0, 3).join(' | ') });
  await close();
  const rep = { range: [A, B], issues, notes };
  const out = o.out || path.join(dir, `build/reports/page-${A}-${B}.json`);
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(rep, null, 1));
  console.log(`page checks ${fmt(A)}–${fmt(B)}: ${issues.length} issues`);
  for (const n of notes) console.log('  ' + n);
  for (const x of issues) console.log(`${x.from != null ? fmt(x.from) + (x.to !== x.from ? '–' + fmt(x.to) : '') + '  ' : ''}${x.kind}  ${x.text}`);
  process.exit(issues.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
