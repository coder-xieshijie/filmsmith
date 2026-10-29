// Entry point (do not edit): mounts the segments in handoff.json order, one segments/<id>.js each, all on one main timeline.
// A segment file: defineSegment('<id>', function build(ctx) { … }). ctx:
//   ctx.id, ctx.t0, ctx.t1         this segment's start and end (seconds, film time); schedule content only inside [t0, t1]
//   ctx.layer                      the segment's own layer (moves with the camera #cam); ctx.scr its screen layer (fixed); ctx.ov the top SVG (stamp); ctx.imps the imprint layer
//   ctx.T                          anchor times from cues.js; ctx.film is film.json
//   ctx.take(id)                   receive an object handed over by the previous segment (this segment's first.items[id] in handoff.json);
//                                  when the previous segment is not built, a stand-in is placed from the description
//   ctx.give(id, obj)              hand an object to the next segment (this segment's last.items[id]); obj is an element or an object with .el
//   ctx.hit(f, t, v)               sound cue tick / paper / stamp / scratch / whoosh: t is the moment the picture lands; the sound peaks one frame later
//   ctx.in / ctx.out               this segment's first / last from handoff.json; ctx.seg is its entry (lines, goal)
// A segment that throws does not stop the others (errors go to window.__segErrors; npm run check reports them).
// handoff.json "persist": small objects no segment animates that stay on screen across segments (a 示意 note, a legend). main builds each
// from F.standIn.<kind> on its own layer above every segment and shows it from `from` to `to` (seconds, an anchor name from cues.js, or
// "end"); segments never take, give or retire them, and the segment-end leftover check does not see them.
// Web loop units (film.json "web": true): coordinates are the logical canvas TOKENS.zone.W × H (1200×675); no narration, reading ctx.T throws
// (write seconds); silent, ctx.hit does nothing; no presenter window.
(function () {
  const FILM = window.FILM, HO = window.HANDOFF || { segments: [] };
  const SEGS = (HO.segments || []).slice().sort((a, b) => a.start - b.start);
  FILM.timeline = SEGS.length ? SEGS.map((s) => ({ id: s.id, t0: s.start, t1: s.end, hands: s.hands })) : [{ id: 'main', t0: 0, t1: FILM.duration }];
  const { tl, $ } = F;
  const WEB = TOKENS.zone.web;
  const noCues = new Proxy({}, { get(_, k) { if (typeof k === 'symbol' || k === 'toJSON' || k === 'then') return undefined; throw new Error(`web loop units have no narration anchors: replace ctx.T.${String(k)} with seconds`); } });
  const PEAK = { tick: 0.001, paper: 0.054, stamp: 0.008, scratch: 0.038, whoosh: 0.356 };
  window.__sfx = []; window.__segErrors = []; window.__given = []; window.__hand = {};

  function build() {
    const cam = $('cam'), scr = $('scr');
    const built = FILM.timeline.filter((s) => window.SEGMENTS[s.id]);
    const layers = {}, scrs = {};
    for (const s of FILM.timeline) { const d = F.div(cam, 'seg', ''); d.id = 'seg-' + s.id; layers[s.id] = d; const e = F.div(scr, 'seg', ''); e.id = 'scr-' + s.id; scrs[s.id] = e; }
    const ov = F.fullSvg(cam, { id: 'ov' }); const imps = F.svgEl('g', { id: 'imps' }, ov);
    F.init(cam, { x: 0, y: 0, scale: 1 });
    const prevOf = (id) => { const i = FILM.timeline.findIndex((s) => s.id === id); return i > 0 ? FILM.timeline[i - 1].id : null; };
    for (const s of FILM.timeline) {
      const build = window.SEGMENTS[s.id];
      if (!build) continue;
      const H = SEGS.find((x) => x.id === s.id) || {};
      const bin = H.first || { items: {} }, bout = H.last || { items: {} };
      const prev = prevOf(s.id), prevBuilt = prev && window.SEGMENTS[prev] && !window.__segErrors.some((e) => e.seg === prev);
      // Previous segment not built (or failed): put the chapter label and the counter in place from the contract
      if (!prevBuilt) {
        if (bin.chapter) F.chapterNow(bin.chapter);
        if (bin.counter) F.cntNow(bin.counter.value, 'ho-' + s.id, bin.counter.unit, s.t0, s.t1, bin.counter.approx);
      }
      const ctx = {
        id: s.id, t0: s.t0, t1: s.t1, layer: layers[s.id], scr: scrs[s.id], ov, imps, cam, T: WEB ? noCues : (window.CUES || {}).T || {}, film: FILM, seg: H, in: bin, out: bout,
        take(id) {
          if (window.__hand[id]) return window.__hand[id];
          const spec = (bin.items || {})[id];
          if (!spec) throw new Error(`handoff.json: segment ${s.id} first.items has no "${id}"`);
          const mk = (F.standIn || {})[spec.kind];
          if (!mk) throw new Error(`no stand-in for kind ${spec.kind} (F.standIn.${spec.kind} in components/*.js)`);
          const o = mk(spec, spec.layer === 'scr' ? scrs[s.id] : layers[s.id]); if (o && typeof o === 'object') o._standIn = true;
          window.__hand[id] = o; return o;
        },
        give(id, obj) { window.__hand[id] = obj; window.__given.push({ seg: s.id, id, el: obj && obj.nodeType ? obj : obj && obj.el }); },
        hit(f, t, v = 0.45) { if (WEB) return; window.__sfx.push({ f, t: Math.round((t + 1 / 30 - (PEAK[f] || 0)) * 1000) / 1000, v, seg: s.id }); },
      };
      try { build(ctx); } catch (e) { console.error(`[segment ${s.id}]`, e); window.__segErrors.push({ seg: s.id, msg: String(e && e.stack || e) }); }
    }
    // Film-wide objects (handoff.json "persist"), above every segment
    const P = HO.persist || {}, at = (v) => (v === 'end' || v == null ? FILM.duration : typeof v === 'number' ? v : (window.CUES || {}).T[v]);
    if (Object.keys(P).length) {
      const pl = { cam: F.div(cam, 'seg', ''), scr: F.div(scr, 'seg', '') }; pl.cam.id = 'seg-persist'; pl.scr.id = 'scr-persist';
      for (const [id, spec] of Object.entries(P)) {
        try {
          const mk = (F.standIn || {})[spec.kind]; if (!mk) throw new Error(`no stand-in for kind ${spec.kind}`);
          const a = at(spec.from ?? 0), b = at(spec.to);
          if (a == null || b == null) throw new Error(`from / to must be seconds, an anchor name in cues.js or "end" (got ${spec.from}, ${spec.to})`);
          const o = mk(spec, spec.layer === 'scr' ? pl.scr : pl.cam), e = o && o.nodeType ? o : o && o.el;
          if (a > 0) { F.init(e, { opacity: 0 }); F.show(e, a); } else F.init(e, { opacity: 1 });
          if (b < FILM.duration - 1e-3) F.hide(e, b - 0.25);
        } catch (err) { console.error(`[handoff.json persist.${id}] ${err.message}`); }
      }
    }
    F.avatars(WEB ? [] : FILM.avatar || []);
    tl.eventCallback('onUpdate', F.cntRender);
    window.addEventListener('hf-seek', F.cntRender);
    tl.set({}, {}, FILM.duration);
    window.__timelines.main = tl;
    tl.seek(0); F.cntRender();
    window.__built = built.map((s) => s.id);
  }

  Promise.all([document.fonts.load('40px WK', '我'), document.fonts.load('40px Mono', '0')]).then(() => document.fonts.ready).then(() => {
    build();
    if (window.__hf && window.__hf.buildHold && window.__hf.buildHold.main) window.__hf.buildHold.main();
  });
})();
