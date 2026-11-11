// Style tokens: colours, fonts, type sizes, spacing, diagram geometry and no-go zones are set here and nowhere else.
// Written into CSS variables on load: col.paper → --paper, fs.chap → --fs-chap, sp.edge → --sp-edge; scripts use F.COL / F.TK.
// Look: warm paper, one overview diagram of equal-width layers; only the nodes are hand-drawn (Rough.js outlines and hachure),
// layer frames, connectors and the loop shape are clean; all text is LXGW WenKai, terminals included.
// Stage (window.STAGE, written by assemble from film.json): a normal film is 1920×1080; a web loop unit ("web": true) lays out on a
// 1200×675 logical canvas and #world is scaled 1.6× to 1920×1080. Segment coordinates are logical canvas coordinates (TOKENS.zone.W × H).
(function () {
  const S = window.STAGE || { web: false, w: 1920, h: 1080, k: 1 };
  const col = {
    // paper as #rrggbb only: build/page-checks.cjs reads it to compare the presenter reserve and falls back to #f6f1e7 for other forms
    paper: '#f6f1e7', ink: '#2b2824', mute: '#6a645a', body: '#fffdf8',
    stroke: '#8a8478',   // neutral connectors, a stopped loop
    rule: '#d8d1c2', faint: '#b9b2a6', grey: '#ebe6dc', chapInk: '#3b3732', chapUl: '#e8b93a',
    me: '#c4432a', meSoft: '#f6dcd2', ok: '#2e7d4f',
    dotR: '#eeab9b', dotY: '#f6d673', dotG: '#b9dfb0',   // the three dots of a terminal title bar
    // Layer palettes, one per layer of the overview: stroke (S), hachure (H), node background (B), band tint (T).
    // Pass the name as `c` to bands, nodes and loops; one layer, one palette, for the whole film.
    blueS: '#3f6f9f', blueH: '#9dbbd9', blueB: '#eef3f8', blueT: '#f1f4f6',
    violetS: '#6f55a0', violetH: '#bba8dc', violetB: '#f3eff9', violetT: '#f4f1f5',
    ochreS: '#a86d1e', ochreH: '#e2b874', ochreB: '#fbf3e6', ochreT: '#f8f1e4',
    tealS: '#1f6f78', tealH: '#86c3c4', tealB: '#ecf6f5', tealT: '#eef4f0',
    stoneS: '#6f6a61', stoneH: '#bdb6aa', stoneB: '#f3f0ea', stoneT: '#f2eee6',
    redS: '#a83c32', redH: '#e0968b', redB: '#faece8',   // the outside part the focused layer talks to (a box right of the layers)
    // Messages on lines (F.bp.chip kinds): msg yellow = a request from a person or the outside; call red = a command one part writes
    // for another to carry out; res green = a result coming back; txt grey = plain text, nothing to carry out
    msgS: '#b58714', msgB: '#fbf0cf', callS: '#a83c32', callB: '#f8e1dc', resS: '#2e7d4f', resB: '#e3f1e6', txtS: '#6a645a', txtB: '#fffdf8',
  };
  // Type scale (px): chapter 34 / node titles 36 / layer names 30 / body, cells and status 28 / secondary 26 / floor 24
  const fs = { chap: 34, node: 36, layer: 30, body: 28, note: 26, log: 26, min: 24, numM: 46, numL: 66, quote: 42, head: 40 };
  const sp = { edge: 56, top: 28, howX: 120, howY: 104, noteY: 814 };
  // The overview: layers are equal-width bands x 60–1540 with the name column at the left and cells from x 320 to 1516; one box may sit
  // right of the layers (x 1600, 240 wide, above y 560). Rough.js settings for nodes; push = how far the other layers scale away on a zoom.
  const bp = { x: 60, w: 1480, cellX: 320, cellW: 1196, gap: 24, sideX: 1600, sideW: 240, roughness: 1.05, bowing: 0.9, hachureGap: 8, hachureAngle: -41, push: 1.55, zoomD: 1.3 };
  // No-go zones: the presenter reserve stays plain paper for the whole film (this look has no presenter windows), the caption zone y ≥ 880;
  // bandEnd: layers end at x 1540, so nothing but the side box sits right of them
  const zone = { avatar: [1580, 560, 1880, 860], subtitleY: 880, bandEnd: 1540, W: 1920, H: 1080, K: 1, web: false };
  // Web loop units: no presenter window, no caption zone; tighter margins and a narrower overview on the 1200×675 canvas
  if (S.web) {
    Object.assign(zone, { avatar: null, subtitleY: S.h, bandEnd: S.w - 40, W: S.w, H: S.h, K: S.k, web: true });
    Object.assign(sp, { edge: 40, top: 22, howX: 64, howY: 72, noteY: S.h - 64 });
    Object.assign(bp, { x: 40, w: S.w - 80, cellX: 240, cellW: S.w - 40 - 24 - 240, sideX: null, sideW: 0 });
  }
  const font = { text: '"WK", serif', mono: '"WK", serif' };
  const kebab = (k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  const r = document.documentElement.style;
  for (const k in col) r.setProperty('--' + kebab(k), col[k]);
  for (const k in fs) r.setProperty('--fs-' + kebab(k), fs[k] + 'px');
  for (const k in sp) r.setProperty('--sp-' + kebab(k), sp[k] + 'px');
  r.setProperty('--stage-w', zone.W + 'px'); r.setProperty('--stage-h', zone.H + 'px'); r.setProperty('--stage-k', String(zone.K));
  window.TOKENS = { col, fs, sp, bp, zone, font };
})();
