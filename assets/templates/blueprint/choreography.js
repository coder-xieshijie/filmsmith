// choreography.js — what each sheet type draws, and when, in beats from the camera's arrival.
// Shared by timeline.js (the schedule) and timing.rules.js (how long each type needs). Nothing here
// depends on the scene's length: a longer scene lands everything at the same beats and holds longer.
//
// Brisk (owner 2026-10-18: "the waits between sheets are far too long"; principle 5, 2026-10-18): parts draw
// close behind each other, a stamp lands on beat 5, every build is over by beat 7 at the latest, and a sheet
// holds still two beats before the camera leaves. Batch 1 ran the same parts over 9 beats and held 1.2 s plus
// whatever its half-bar grid added (often 4–5 s still per sheet).

// Sheet types. stamp: the type lands a stamp (the camera pushes in on it).
export const TYPES = {
  problem: { sheet: true },
  arrangement: { sheet: true },
  detail: { sheet: true, stamp: true },
  section: { sheet: true, stamp: true },
  loop: { sheet: true },
  checklist: { sheet: true, stamp: true },
  assembly: { sheet: true },
  parts: { sheet: true },
  interface: { sheet: true },
  stages: { sheet: true },
  release: { sheet: true },
  overview: { sheet: false },
};

export const SHEETS_MIN = 6, SHEETS_MAX = 9;
// An excerpt (content.excerpt: true) is a cut-down for a reel or a demo: 2–9 sheets, no release required, and
// it ends on its last sheet (TEMPLATE.md "Excerpts"). Two is the least that still shows the route between sheets
// (mode principle 1). A film without the flag keeps the 6–9 sheets and the release card.
export const EXCERPT_MIN = 2;
// An excerpt's drawing frame is pre-printed (ISO 5457 sheets come with border and title block printed): the
// HUD is drawn as if this many seconds had passed, so the first frame already shows the drawing, not bare paper.
export const EXCERPT_HUD_PRE = 1.2;
// ... and its first sheet has no half-beat lead: its frame starts drawing this many seconds before the film does,
// so the first frame shows the sheet already being drawn (a cut into a drawing in progress)
export const EXCERPT_SHEET_PRE = 0.45;
// Every sheet ends with two beats of complete stillness before the camera leaves: HOLD_S rounded up to the
// beat, 1.11–1.30 s across 92–108 BPM (≥ 1 s, the glance minimum, so the finished sheet can be taken in at
// once). Was 1.2 s, which rounded up to three beats above 100 BPM.
export const HOLD_S = 1.0;
export const URL_HOLD_S = 3; // the release URL stays readable at least this long

// A stamp sheet: the camera pushes in over [STAMP_B − 1.5, STAMP_B − 0.5], the stamp lands on STAMP_B, the push
// holds at least one beat and returns in PUSH_BACK_B, landing on the build's end, the next whole beat (N0). The
// return lands there rather than earlier, so the sheet's two-beat hold starts where the camera settles: a return
// landing 0.4 beat before N0 left the picture still 0.1–0.24 s before the declared hold, and check-film measured
// the hold 1–2 frames over two beats (2026-10-19 test film t4). timing.rules.js pushBeats() times it.
export const STAMP_B = 5;
export const PUSH_BACK_B = 0.6; // a stamp push-in returns in 0.6 of its 1-beat entrance
const STAMP_N0 = Math.ceil(STAMP_B + 1 + PUSH_BACK_B); // 7

// The issue (2026-10-19, timing API 3): a film may be drafted as a pencil original (content.original, default
// 'vellum', in pencil line work) until a person signs its plan. The `detail` sheet marked issue: true is that
// signature: one beat after its amber stamp lands, the stamp's own outline floods the frame (lib/transitions
// shape-flood, FLOOD_B beat) and inside it is the same drawing as the print (content.palette, content.linework).
// The camera stays pushed in until the flood has closed, then returns (landing on N0), so the build ends a beat later.
export const FLOOD_AFTER_B = 1, FLOOD_B = 1;
const ISSUE_N0 = Math.ceil(STAMP_B + FLOOD_AFTER_B + FLOOD_B + PUSH_BACK_B); // 8
// The release entered from the final overview under a parallel rule (lib/transitions occluder-pass): the rule
// crosses the lens in RULE_B beats while the camera cuts from the whole drawing to the release sheet under it.
export const RULE_B = 1;
// The interface sheet (X04 + X05): the outline is drafted, three lines make it a cube (stroke-reinterpret,
// REINTERPRET_B), it holds, then opens into the console's panels (net-unfold, UNFOLD_B).
export const REINTERPRET_B = 1, UNFOLD_B = 2;
// The stages sheet (X02): one word a beat through a slot between two dimension lines (slot-rails, SLOT_B each).
export const SLOT_B = 1;
// The checklist's probe run (2026-10-19, phase 3): the machine's inspection is a lamp crossing the record at a
// machine's steady feed (lib/transitions blueprint-expose, develop: false: a reading, not an exposure, so the print
// is still issued once, by a person). Each row's result is drafted as the lamp passes it; the count is the rows
// passed. SCAN_B beats from the `scan` cue; the lamp has left the frame by 0.83 of it, before the push-in starts.
export const SCAN_B = 1.5;
// The inspection table's row centres (sheet px, y), shared with sheets/checklist.js so the picture, the sound and the
// key events time each row from the same geometry.
export const CHECK_TABLE = { y: 430, head: 48, rows: 315, rowMax: 45, tickX: 658 };
export const checkRows = (n) => {
  const rh = Math.min(CHECK_TABLE.rowMax, Math.floor(CHECK_TABLE.rows / Math.max(n, 1)));
  return { rh, yc: [...Array(n).keys()].map((i) => CHECK_TABLE.y + CHECK_TABLE.head + rh * (i + 0.5) + 6) };
};
// blueprint-expose's lamp (lib/transitions/blueprint.js, develop: false): X = mix(−210, len + 210, e), e = mix(p,
// cubicInOut(p), 0.45); a film pixel at coordinate a along the travel is passed when X reaches it. Returns that p.
const cubicInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const lampPass = (a, len) => {
  const want = (a + 210) / (len + 420);
  let lo = 0, hi = 1;
  for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; ((0.55 * m + 0.45 * cubicInOut(m)) < want ? (lo = m) : (hi = m)); }
  return (lo + hi) / 2;
};
// The k-th probe run of a film crosses down the rows, the next across the columns, so two in a row are never the
// same (api 3: one device twice in a row unchanged is an error). Beats after the scan cue at which each row is passed:
// the sheet sits centred at rest, so a row's sheet y is its screen y (the drift's 1 % moves it < 2 px, a frame's
// travel of the lamp).
export const SCAN_DIRS = ['down', 'right'];
export const scanRowBeats = (n, dir) => {
  const { yc } = checkRows(n);
  return yc.map((y) => SCAN_B * (dir === 'right' ? lampPass(CHECK_TABLE.tickX - 16, 1920) : lampPass(y - 11, 1080)));
};

// Choreography per type: cue name → beat after the camera arrives; N0 = beats until the last element
// has landed (the build); stamp = the beat a stamp lands on (stamp types and the final overview).
// sounds: [cue, kind]; kinds are mapped to voices in score.mjs.
export const CUES = {
  problem: (s) => {
    const n = s.items.length, c = { title: 0, title2: 0.75, mark: 1.5, bus: 1.5, note: 1.5 + 0.5 * n };
    s.items.forEach((_, i) => (c['item' + i] = 1.75 + 0.5 * i));
    // the last box's value and triangle land ~1.2 beats after its cue and the note ~0.8 after its own: ≤ 4.4 with four items
    return { N0: 4.5, c, sounds: [['title', 'pen'], ['title2', 'pen'], ['mark', 'mark'], ...s.items.map((_, i) => ['item' + i, 'box']), ['note', 'mark']] };
  },
  arrangement: () => ({
    N0: 4.5,
    c: { title: 0, title2: 0.7, input: 1.3, arrow1: 1.8, system: 2.0, arrow2: 2.5, output: 2.7, sub: 3.0, dim: 3.3 },
    sounds: [['title', 'pen'], ['title2', 'pen'], ['input', 'box'], ['system', 'box'], ['output', 'box'], ['dim', 'pen']],
  }),
  detail: (s) => {
    const n = s.rows.length, c = { title: 0, sub: 0.5, summary: 3.0, note: 3.25 };
    const step = n > 1 ? 1.2 / (n - 1) : 0;
    s.rows.forEach((_, i) => { c['row' + i] = 0.9 + i * step; c['ans' + i] = 1.5 + i * step; });
    // issue: the flood starts FLOOD_AFTER_B after the stamp and closes FLOOD_B later, on a beat
    if (s.issue === true) c.flood = STAMP_B + FLOOD_AFTER_B;
    return { N0: s.issue === true ? ISSUE_N0 : STAMP_N0, stamp: STAMP_B, c, sounds: [['title', 'pen'], ...s.rows.map((_, i) => ['ans' + i, 'box']), ['summary', 'pen'], ...(s.issue === true ? [['flood', 'flood']] : [])] };
  },
  section: () => ({
    N0: STAMP_N0, stamp: STAMP_B,
    c: { title: 0, sub: 0.5, box1: 0.9, box2: 1.4, cut: 2.2, notes: 2.6, output: 2.9, dim: 3.2 },
    sounds: [['title', 'pen'], ['box1', 'box'], ['box2', 'box'], ['cut', 'pen'], ['dim', 'pen'], ['output', 'box']],
  }),
  loop: (s) => {
    const n = s.milestones.length, c = { title: 0, sub: 0.5, loop: 0.7, axis: 1.0, laps: 1.6, gate: 2.2, aside: 2.6 };
    // one lap per milestone; the last lap ends on beat 4.0 so the trace's run-out (0.5 beat) and the token's fade
    // (0.4 beat) are over by N0 = 4.5, where the sheet's hold starts (07 C6: land, then hold still)
    s.milestones.forEach((_, i) => (c['lap' + i] = 1.6 + (2.4 * (i + 1)) / n));
    return { N0: 4.5, c, sounds: [['title', 'pen'], ['loop', 'pen'], ['gate', 'box'], ['aside', 'pen'], ...s.milestones.map((_, i) => ['lap' + i, 'tick'])] };
  },
  // the record is drawn, the count stands at 0 / n, then the probe run's lamp crosses it (SCAN_B from `scan`) and each
  // row's result is drafted as the lamp passes (scanRowBeats; timeline.js adds a tick sound per row at those times)
  checklist: () => ({
    N0: STAMP_N0, stamp: STAMP_B,
    c: { title: 0, sub: 0.5, table: 0.8, count: 1.4, label: 1.6, scan: 2.0, note: 3.0, footer: 3.3 },
    sounds: [['title', 'pen'], ['table', 'pen'], ['scan', 'scan'], ['note', 'pen'], ['footer', 'pen']],
  }),
  assembly: () => ({
    N0: 4.5,
    c: { title: 0, axis: 0.5, ends: 0.7, nodes: 0.9, assemble: 2.25, brackets: 2.6, loop: 2.9, claim: 3.2, claimSub: 3.6 },
    sounds: [['title', 'pen'], ['ends', 'box'], ['assemble', 'clack'], ['brackets', 'mark'], ['claim', 'pen']],
  }),
  parts: (s) => {
    const c = { title: 0, table: 0.5, then: 1.8, note: 3.2 };
    s.rows.forEach((_, i) => (c['row' + i] = 0.8 + i * (0.8 / Math.max(1, s.rows.length - 1))));
    s.chips.forEach((_, i) => (c['chip' + i] = 2.0 + i * (1.0 / Math.max(1, s.chips.length - 1))));
    return { N0: 4.5, c, sounds: [['title', 'pen'], ...s.rows.map((_, i) => ['row' + i, 'pen']), ...s.chips.map((_, i) => ['chip' + i, 'box'])] };
  },
  // the console: outline drafted, made solid, opened into its panels, the regions lettered one by one
  interface: (s) => {
    const c = { title: 0, sub: 0.5, hex: 0.75, view: 0.9, reinterpret: 1.75, solid: 1.75 + REINTERPRET_B, unfold: 1.75 + REINTERPRET_B + 0.5 };
    const land = c.unfold + UNFOLD_B;
    for (let k = 0; k < 6; k++) c['region' + k] = land + 0.2 * k;
    // the regions' lettering (0.3 s) and the panel furniture have landed by N0
    return { N0: land + 1.5, c, sounds: [['title', 'pen'], ['hex', 'pen'], ['reinterpret', 'reinterpret'], ['unfold', 'unfold'], ...[0, 1, 2, 3, 4, 5].map((k) => ['region' + k, k % 2 ? 'tick' : 'pen'])] };
  },
  // a sequence of stages through one slot: the rails draft, then one word a beat (each hand-off lands on its beat).
  // The build ends as the last word lands (N0 = 1 + n): the hand-off settles there and the counter steps on that beat,
  // so the hold starts where the picture is still (a quarter beat more held the sheet still before its declared hold,
  // 2026-10-19 test film t4). The note wipes in (0.5 s, under a beat at 92–108 BPM) with the last hand-off, so it has
  // landed by N0 too.
  stages: (s) => {
    const n = (s.stages || []).length, c = { title: 0, sub: 0.4, rails: 0.5 };
    for (let k = 0; k < n; k++) c['stage' + k] = 1 + k * SLOT_B; // hand-off k starts here, its word lands SLOT_B later
    c.note = 1 + Math.max(0, n - 1) * SLOT_B;
    return { N0: 1 + n * SLOT_B, c, sounds: [['title', 'pen'], ['rails', 'pen'], ...[...Array(n).keys()].map((k) => ['stage' + k, 'slot']), ['note', 'mark']] };
  },
  release: (s) => {
    const c = { kicker: 0, name: 0.2, urlBox: 1.5, url: 1.6, key: 1.2, foot: 2.4 };
    s.tags.forEach((_, i) => (c['tag' + i] = 1.0 + i * 0.25));
    // 'status' (the RELEASED lettering) is timed from the scene's end in timeline.js: the film's last downbeat.
    // N0 = 4: the last part (the key plan's end dot, the foot line) has landed by beat ~3.5 anywhere in the
    // tempo range, so a 2-bar release can still letter its status on the last downbeat
    return { N0: 4, c, sounds: [['name', 'pen'], ['urlBox', 'box'], ['foot', 'pen'], ['status', 'box']] };
  },
  // final: the route draws over ROUTE_B beats, the claim panel rises as it ends, the approval stamp lands on beat 3;
  // the panel's exit (panelOut) is timed from the scene's end, in timeline.js
  overview: (s) => s.final
    ? { N0: 3.5, stamp: 3, c: { route: 0, panel: 1.25, line1: 1.5, line2: 2.0 }, sounds: [['route', 'route'], ['line1', 'pen'], ['line2', 'pen']] }
    : { N0: 2.5, c: {}, sounds: [] },
};

// Beat (after arrival) on which a type's stamp lands, or null. Fixed in beats, so the push-in and the thud do
// not move when a scene holds longer.
export const stampBeat = (s) => {
  if (s.type === 'overview' && !s.final) return null;
  if (s.type !== 'overview' && !TYPES[s.type]?.stamp) return null;
  return CUES[s.type](s).stamp ?? null;
};

// How a scene with nothing after it ends (only an excerpt can end on a sheet other than the release; a full
// film's schedule rejects it). A stamp sheet ends pushed in on its stamp: the camera does not return, the
// thud settles, and the frame holds still (the excerpt's last word is the stamp). Any other sheet ends on its
// two-beat hold. Returns the beat (after arrival, without the lead) from which the frame holds still, or null
// for the release and overviews, which keep their own endings.
export const END_STAMP_SETTLE_B = 1; // beats after the stamp's beat: the thud (0.25 s) and the push's settle are over
export const endBuild = (s) => {
  if (s.type === 'release' || s.type === 'overview' || !TYPES[s.type]) return null;
  const sb = stampBeat(s);
  return sb === null ? CUES[s.type](s).N0 : sb + END_STAMP_SETTLE_B;
};

// Camera travel into scene i, in beats (it happens at the end of the scene before): 1.5 to or from an
// overview, 1 between sheets.
export const MOVE_B = 1, MOVE_OV_B = 1.5;
export const LEAD_B = 0.5; // the first sheet waits half a beat for the drawing frame
// final overview: the claim panel leaves (0.18 s, under a third of a beat) this many beats before the camera
// moves, so the release sheet's first strokes start while the panel is still going (was 1 beat)
export const PANEL_OUT_B = 0.5;
export const ROUTE_B = 1.5; // final overview: the heavy route through every sheet centre draws over this many beats (was 2)
export const STATUS_DUR_B = 1; // the release status lettering: construction lines and wipe, in beats
