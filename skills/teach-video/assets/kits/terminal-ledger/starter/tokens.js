// Style tokens: colours, fonts, type sizes, spacing and no-go zones are set here and nowhere else.
// Written into CSS variables on load: col.paper → --paper, fs.chap → --fs-chap, sp.edge → --sp-edge; scripts use F.COL / F.TK.
// Stage (window.STAGE, written by assemble from film.json): a normal film is 1920×1080; a web loop unit ("web": true) lays out on a
// 1200×675 logical canvas and #world is scaled 1.6× to 1920×1080. The type tokens serve both: the 24 px floor on the 1200-wide canvas
// reads about 13.6 px in a 680 px article column (a 1920-wide canvas would need ≥ 37 px for 13 px, so web units always use the small canvas).
// Segment coordinates are logical canvas coordinates (TOKENS.zone.W × H).
(function () {
  const S = window.STAGE || { web: false, w: 1920, h: 1080, k: 1 };
  const col = {
    paper: '#f6f1e7', ink: '#2b2824', mute: '#6a645a', body: '#fffdf8',
    stroke: '#8a8478',   // structural lines, dashed note boxes
    rule: '#d8d1c2',     // faint frames, the rule under a 'how' label
    faint: '#b9b2a6',    // empty card frames, unlit text
    grey: '#ebe6dc', chapInk: '#3b3732', chapUl: '#e8b93a',
    me: '#c4432a', meSoft: '#f6dcd2', meDeep: '#8a2a14', meRing: '#f3cfc4',   // vermilion: the narrator / viewer, a decision only a person makes, irreversible, hand marks
    agent: '#1f6f78', agentSoft: '#dcefef', ok: '#2e7d4f',
    base: '#62717d', baseS: '#3f4b55',     // neutral dots (not sorted yet)
    cont: '#e9b440', contS: '#9a6a1c',     // yellow: waiting / routine, no thought needed
    lamp: '#f2c14e', lampS: '#a8701a',
    judge: '#d4472d', judgeS: '#8f2716',   // red dots: needs a judgement
    rest: '#d3cbbd', restS: '#aaa194',     // grey dots: the rest, unlabelled
    rel: '#4f8a5b', relS: '#2f5c3a',       // green: allowed / passes
    sA: '#1f6f78', sB: '#7a5ea8', sC: '#b07d1a', sD: '#4f7d3a',   // window identity squares, title bars only
    dotR: '#eeab9b', dotY: '#f6d673', dotG: '#b9dfb0',             // the three dots of a terminal title bar
  };
  // Type scale (px): chapter 34 / body and labels 28 / secondary notes 26 / terminal log 26 (Mono) / floor 24 / mid numbers 46–66 / big counter 112
  const fs = { chap: 34, body: 28, note: 26, log: 26, min: 24, numM: 46, numL: 66, count: 112, countPre: 44, unit: 30, quote: 42, head: 40 };
  const sp = { edge: 56, top: 28, counterR: 60, howX: 120, howY: 104, noteY: 814 };
  // No-go zones: presenter reserve (plain paper outside presenter windows), caption zone y ≥ 880, right end of the ledger rules
  const zone = { avatar: [1580, 560, 1880, 860], subtitleY: 880, ruleEnd: 1540, W: 1920, H: 1080, K: 1, web: false };
  // Web loop units: no presenter window (avatar = null), no caption zone (subtitleY = H); tighter margins; illustrative-note tags default to 64 px above the bottom
  if (S.web) {
    Object.assign(zone, { avatar: null, subtitleY: S.h, ruleEnd: S.w - 40, W: S.w, H: S.h, K: S.k, web: true });
    Object.assign(sp, { edge: 40, top: 22, counterR: 40, howX: 64, howY: 72, noteY: S.h - 64 });
  }
  const font = { text: '"WK", serif', mono: '"Mono", "WK", monospace' };
  const kebab = (k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  const r = document.documentElement.style;
  for (const k in col) r.setProperty('--' + kebab(k), col[k]);
  for (const k in fs) r.setProperty('--fs-' + kebab(k), fs[k] + 'px');
  for (const k in sp) r.setProperty('--sp-' + kebab(k), sp[k] + 'px');
  r.setProperty('--stage-w', zone.W + 'px'); r.setProperty('--stage-h', zone.H + 'px'); r.setProperty('--stage-k', String(zone.K)); r.setProperty('--rule-end', zone.ruleEnd + 'px');
  window.TOKENS = { col, fs, sp, zone, font };
})();
