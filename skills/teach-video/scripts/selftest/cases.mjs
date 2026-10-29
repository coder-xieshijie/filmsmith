// Sample projects for the geo-check self-test: each a few seconds long and making exactly one mistake on purpose
// ('clean' makes none). run.mjs writes each case as a minimal HyperFrames project (index.html + gsap +
// hyperframes.json) and runs geo-check on it.
// Fields: name; what (one-line description); body, the elements inside the root composition; script, animation
//   added to tl (a paused GSAP timeline registered as __timelines.main); dur, length in seconds; args, extra
//   geo-check arguments; expect, the issue kinds that must be reported (the set must match exactly; [] means no
//   issues); same, reuse another case's project with different args.
// Paper #f4f1e8, text 40px. ANCHOR is a dark block that gives the frame enough ink, so other cases are not
// reported as empty frames. On-screen strings stay Chinese: they are film content.

const ANCHOR = '<div class="abs" style="left:100px;top:100px;width:400px;height:200px;background:#333"></div>';
const svg = (inner) => `<svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">${inner}</svg>`;
const curve = (i) => `<path data-hand="mark${i + 1}" d="M ${620 + i * 220} 700 q 60 -80 120 0 t 80 20" fill="none" stroke="#c0392b" stroke-width="4"/>`;

export const CASES = [
  {
    name: 'clean', what: 'control: no mistakes (two hand marks, one card held long enough, lines clear of text)',
    body: `${ANCHOR}
      <div class="abs" style="left:700px;top:200px">一句正常的字</div>
      <div class="abs" id="card" data-read="2" style="left:700px;top:400px;opacity:0">要读完的一句话</div>
      ${svg(`<line x1="600" y1="600" x2="1300" y2="600" stroke="#222" stroke-width="3"/>${curve(0)}${curve(1)}`)}`,
    script: `tl.to('#card', { opacity: 1, duration: 0.1 }, 0.3);`,
    dur: 3, expect: [],
  },
  {
    name: 'text-on-stroke', what: 'text on a stroke: a horizontal line runs through the text',
    body: `${ANCHOR}<div class="abs" style="left:700px;top:400px">压线的字</div>
      ${svg('<line x1="600" y1="425" x2="1200" y2="425" stroke="#222" stroke-width="3"/>')}`,
    dur: 3, expect: ['text_on_stroke'],
  },
  {
    name: 'text-overlap', what: 'text overlap: two lines of text on top of each other',
    body: `${ANCHOR}<div class="abs" style="left:700px;top:400px">重合的字甲</div><div class="abs" style="left:730px;top:412px">重合的字乙</div>`,
    dur: 3, expect: ['text_overlap'],
  },
  {
    name: 'out-of-frame', what: 'out of frame: the right half of a sentence is outside the frame',
    body: `${ANCHOR}<div class="abs" style="left:1700px;top:400px;white-space:nowrap">出画的一句很长的字</div>`,
    dur: 3, expect: ['out_of_frame'],
  },
  {
    name: 'caption-zone', what: 'caption band: text placed at y >= 880',
    body: `${ANCHOR}<div class="abs" style="left:700px;top:920px">字幕区里的字</div>`,
    dur: 3, expect: ['caption_zone'],
  },
  {
    name: 'avatar-zone', what: 'presenter box: everything on screen is inside the box (1580-1880 x 560-860), which is not ink, so the frame is reported empty',
    body: `<div class="abs" style="left:1600px;top:600px;width:240px;height:200px;background:#333"></div>`,
    dur: 3, expect: ['empty'],
  },
  {
    name: 'empty', what: 'empty frame: a transition wipes to empty paper from 1.0 to 2.2 s',
    body: `<div id="all">${ANCHOR}<div class="abs" style="left:700px;top:400px">一句正常的字</div></div>`,
    script: `tl.to('#all', { opacity: 0, duration: 0.05 }, 1.0); tl.to('#all', { opacity: 1, duration: 0.05 }, 2.2);`,
    dur: 3.2, expect: ['empty'],
  },
  {
    name: 'hand-over', what: 'too many hand marks: 5 data-hand, max 4',
    body: `${ANCHOR}${svg([0, 1, 2, 3, 4].map(curve).join(''))}`,
    dur: 3, expect: ['hand_over'],
  },
  {
    name: 'read-short', what: 'read hold too short: a data-read="3" card is fully shown for only 1 s',
    body: `${ANCHOR}<div class="abs" id="card" data-read="3" style="left:700px;top:400px;opacity:0">要读完的一句话</div>`,
    script: `tl.to('#card', { opacity: 1, duration: 0.05 }, 0.5); tl.to('#card', { opacity: 0, duration: 0.05 }, 1.5);`,
    dur: 3, expect: ['read_short'],
  },
  {
    name: 'read-out-of-range', what: 'regression: --from 0 --to 2 checks the first 2 s only; the data-read card appears at 2.5 s, so nothing is reported',
    body: `${ANCHOR}<div class="abs" id="card" data-read="3" style="left:700px;top:400px;opacity:0">后面才出现的卡</div>`,
    script: `tl.to('#card', { opacity: 1, duration: 0.05 }, 2.5);`,
    dur: 4.5, args: ['--from', '0', '--to', '2'], expect: [],
  },
  {
    name: 'read-out-of-range-full', what: 'same project, whole film: the card holds 2 s of the required 3 s and is reported (shows the previous zero comes from the range)',
    same: 'read-out-of-range', args: [], expect: ['read_short'],
  },
  {
    name: 'read-cross-range', what: 'regression: the card is fully readable 1.0-4.5 s, needs 3 s; checking only 0-2 s (the kit\'s npm run check works per segment) reports nothing',
    body: `${ANCHOR}<div class="abs" id="card" data-read="3" style="left:700px;top:400px;opacity:0">跨段的卡</div>`,
    script: `tl.to('#card', { opacity: 1, duration: 0.05 }, 1.0); tl.to('#card', { opacity: 0, duration: 0.05 }, 4.5);`,
    dur: 5, args: ['--from', '0', '--to', '2'], expect: [],
  },
  { name: 'read-cross-range-2', what: 'same, checking only 2-5 s: nothing reported', same: 'read-cross-range', args: ['--from', '2', '--to', '5'], expect: [] },
  {
    name: 'read-cross-short', what: 'crosses the range and is really too short: card 1.0-2.8 s, needs 3 s, checking 0-2 s is reported (measuring continues past the range edge instead of passing anything that touches it)',
    body: `${ANCHOR}<div class="abs" id="card" data-read="3" style="left:700px;top:400px;opacity:0">跨段的卡</div>`,
    script: `tl.to('#card', { opacity: 1, duration: 0.05 }, 1.0); tl.to('#card', { opacity: 0, duration: 0.05 }, 2.8);`,
    dur: 5, args: ['--from', '0', '--to', '2'], expect: ['read_short'],
  },
];

// Page-check cases for the kit's build/page-checks.cjs. Each copies the kit-demo project, replaces handoff.json with one segment "cov"
// (0–3 s, no presenter windows) whose last.items are a window and a strip of cells, writes segments/cov.js from `seg`, adds `persist`
// (handoff.json "persist", built by main.js) and runs the page checks; the set of issue kinds must equal `expect`.
const WIN = `const w = F.term(L, { title: '模型', x: 400, y: 200, w: 800, h: 400 });`;
const STRIP = `const g = F.grid(L, { x: 500, y: 400, cols: 10, rows: 1, cell: 48, gap: 8, visible: true }); g.fill(10, 'agent', 0.2, 0.8);`;
const GIVE = `ctx.give('win', w); ctx.give('strip', g);`;
export const PAGE_ITEMS = {
  win: { kind: 'term', box: [400, 200, 800, 400], title: '模型' },
  strip: { kind: 'grid', box: [500, 400, 552, 48], cols: 10, rows: 1, cell: 48, gap: 8, shape: 'sq', runs: [['agent', 0, 9]] },
};
export const PAGE_CASES = [
  {
    name: 'page-stacked', what: 'control: the window, then the strip inside it, both handed over; a film-wide 示意 note (persist) from 0.5 s',
    seg: WIN + STRIP + GIVE, persist: { note: { kind: 'labels', layer: 'scr', list: [{ type: 'tag', text: '示意', x: 120, y: 814 }], from: 0.5, to: 'end' } },
    expect: [],
  },
  {
    name: 'page-covered', what: 'the strip is created first, so the window created after it covers it completely at the handoff',
    seg: STRIP + WIN + GIVE, expect: ['handoff_covered'],
  },
  {
    name: 'page-reserve', what: 'no presenter windows; a persist label sits in the presenter reserve from 1 to 2 s',
    seg: WIN + STRIP + GIVE, persist: { inReserve: { kind: 'labels', list: [{ type: 'lbl', text: '占位', x: 1640, y: 680, size: 28 }], from: 1, to: 2 } },
    expect: ['avatar_zone'],
  },
];
