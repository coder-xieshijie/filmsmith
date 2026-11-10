// row-band — the light hops row to row on a still capture: a full-width band (the spotlight veil's hole) lights one row
// of a table, a list or a paragraph; each row brings its own value, line and note into the margin and is ringed; then
// the band hops to the next row in one beat (spotlight-band's curve) and the margin's block rides level with it
// (level-rail). Two to four rows; each row's copy leaves as the next hop starts.
// From the handset template's `band` (assets/templates/handset/choreo.js TYPES.band, film.js light and blockY;
// moves.js spotlight-band): timings are the template's (a row every four beats).
import { clamp } from '../../../handoffs/util.js';
import { viewOf, asView, drawCapture, paintLit, paintFrame, prepareScene, group, needBeats, timed, blockLevel, levelOf, hopAt, regionPoly, MOVE_BEATS, RING_DRAW } from '../../prop/device-shell/device.js';
import { railAt } from '../../motion/level-rail/brick.js';

const ROW = { value: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 10 }, zh: { chars: 5 } } }, line: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 18 }, zh: { chars: 14 } } }, note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 22 } } } };
const DEFAULT = {
  en: [{ region: 'r1', value: '62.8', line: 'first benchmark', note: 'first of seven' }, { region: 'r2', value: '76.2', line: 'second benchmark', note: 'tied first of six' }],
  zh: [{ region: 'r1', value: '62.8', line: '第一项基准', note: '七家中第一' }, { region: 'r2', value: '76.2', line: '第二项基准', note: '六家中并列第一' }],
};
const timeline = (s, ctx) => {
  // a row every `step` beats (the template's 4: value +1, line and note +2, ring +3); a shorter step (3, as film-v2)
  // tightens the group as that film does: the value +1, the line +1.25, the note and the ring +1.5.
  // `quick: true`: the first row's band and value land together on beat 0 (after a move that lands on the boundary,
  // as film-v2's scroll does at 14.0 s), so every row comes a beat sooner
  let t = s.quick ? -1 : 0;
  const step = Math.max(3, s.step ?? 4);
  const rows = (s.rows || []).map((r, k) => {
    const g = group(t + 1, r, { ring: true }), tight = step < 4;
    g.items.forEach((i) => { if (i.role === 'line') i.in = tight ? t + 1.25 : t + 2; if (i.role === 'note') i.in = tight ? t + 1.5 : t + 2; });
    g.ringAt = tight ? t + 1.5 : t + 3;
    const row = { k, region: r.region, on: t, hop: k > 0 || !!s.from?.region, g, ringAt: g.ringAt };
    t += step;
    return row;
  });
  const items = rows.flatMap((r, k) => r.g.items.map((i) => ({ ...i, out: rows[k + 1] ? rows[k + 1].on : null })));
  const last = rows[rows.length - 1];
  const need = needBeats(last ? last.g.items : [], last ? last.ringAt : 1, ctx.bpm, ctx.lang, 0.45);
  return { rows, items, beats: Math.min(20, Math.max(4, Math.ceil(Math.max(need, s.beats || 0) - 1e-9))) };
};

export default {
  id: 'row-band', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 4, max: 20 },
  needs: { motions: ['spotlight-band', 'level-rail'], props: ['device-shell', 'margin-notes', 'region-light'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: { rows: { type: 'list', count: [2, 4], of: ROW }, screen: { type: 'image', crop: true, optional: true } },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'muted', 'glass'],
  defaults: (ctx = {}) => ({ rows: DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], device: 'laptop', screen: null, view: 'rest', from: null, step: 4, quick: false, veil: 0.52, grain: 0.04, seed: 3, leave: true, chin: 'example.dev/benchmarks' }),
  plan(s, ctx) {
    const T = timeline(s, ctx);
    return { beats: T.beats, reads: T.items.filter((i) => i.role !== 'note').map((i) => ({ text: i.text, lang: ctx.lang })), cues: T.rows.flatMap((r) => [{ beat: r.on + 1, kind: r.hop ? 'accent' : 'land' }, { beat: r.ringAt, kind: 'accent' }]), motion: 'spotlight-band', settled: T.rows[0] ? Math.max(0, T.rows[0].on + 1) : 0, peakAt: null, pause: 0 };
  },
  validate(s) { return (s.rows || []).length >= 2 && (s.rows || []).length <= 4 ? [] : ['rows: 2 to 4']; },
  async prepare(s, ctx) {
    const T = timeline(s, ctx);
    const D = await prepareScene(s, ctx, timed(T.items, T.beats, 60 / ctx.bpm, s.leave === false));
    D.T = T;
    D.v = asView(viewOf(D.A, !s.view || s.view === 'rest' ? 'rest' : s.view, D.D));
    const bandOf = (name) => { const R = D.A.regions[name]; return R?.band || (R ? [R.box[1] - 14, R.box[3] + 28] : [0, 0]); };
    D.bands = T.rows.map((r) => bandOf(r.region));
    D.fromBand = s.from?.region ? bandOf(s.from.region) : null;
    D.levels = T.rows.map((r) => blockLevel(levelOf(D.A, D.v, D.D, r.region)));
    D.fromLevel = s.from?.region ? blockLevel(levelOf(D.A, D.v, D.D, s.from.region)) : D.levels[0];
    return D;
  },
  // which row is lit at t (s), the band [y, h] (hopping), the block level, the ring
  state(t, B, Dd) {
    const R = Dd.T.rows;
    let k = 0; for (let i = 0; i < R.length; i++) if (t >= R[i].on * B) k = i;
    const r = R[k], prevBand = k > 0 ? Dd.bands[k - 1] : Dd.fromBand, prevLevel = k > 0 ? Dd.levels[k - 1] : Dd.fromLevel;
    const hp = clamp((t - r.on * B) / (MOVE_BEATS.hop * B));
    const band = r.hop && prevBand ? hopAt(hp, prevBand, Dd.bands[k]) : Dd.bands[k];
    const level = r.hop ? railAt(hp, prevLevel, Dd.levels[k]) : Dd.levels[k];
    const alpha = r.hop && prevBand ? 1 : clamp((t - r.on * B) / 0.2);
    return { k, r, band, level, alpha, ring: clamp((t - r.ringAt * B) / RING_DRAW) };
  },
  paint(g, u, s, c, Dd) {
    const C = s.colors, B = 60 / c.bpm, t = u * B, st = this.state(t, B, Dd);
    const lit = { alpha: st.alpha, region: st.r.region, band: st.band, ring: st.ring };
    paintFrame(g, s, C, Dd, {
      t, by: st.level, lang: c.lang, chin: Dd.A.chin || s.chin,
      screenFn: (q) => { drawCapture(q, Dd.A, Dd.v, Dd.D); paintLit(q, Dd.A, Dd.v, Dd.D, C, lit, s.veil); },
      tickAt: st.ring > 0 ? { A: Dd.A, v: Dd.v, region: st.r.region, alpha: clamp(st.ring * 3) } : null,
    });
  },
  track(u, s, c, Dd) { const B = 60 / c.bpm, st = this.state(u * B, B, Dd), S = Dd.D.screen; return [[S.x + 20, S.y + Dd.v.by + st.band[0] * Dd.v.a], [1376, st.level]]; },
};
