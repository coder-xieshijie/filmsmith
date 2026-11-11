// hex-solid — a plane becomes a solid: the card's outline morphs at equal arc length into a flat hexagon (the card's
// content leaves first), three accent lines from its centre re-read it as a cube (stroke-reinterpret), the faces take
// three tones of the ink, the caption rises at the left and three counted face labels hang off the cube on leader
// lines; on the last beat the front face takes the accent (the hinge of the unfold that may follow). `from: 'none'`
// opens on the hexagon (a film's short cut), a beat earlier.
// From the morph template's `solid` scene (assets/templates/morph/film.js drawSolid, solidState, faceLabels; choreo.js
// solid): the 480-point morph, the cube's projection and light, label places and beats are the template's.
import { drawHandoff } from '../../../handoffs/index.js';
import { CARD, HX, HY, HR, HV, CAP1, M, SZ, secs, prog, spr, colorsOf, groundOf, loadFonts, outlineOf, hexOutline, morphPath, cube, hexagon, caption, capFont,
  productOf, facts, fill, mono, tw, txt, riseText, lerp, mix, cubicOut, cubicInOut, clipShape, jsonLines, readTime, clamp } from '../../motion/outline-morph/ink.js';

const DEFAULT = {
  en: { caption: 'One spec in.', faces: ['{endpoints} endpoints', '{schemas} schemas', '{sdks} SDKs'] },
  zh: { caption: '一份规格进。', faces: ['{endpoints} 个接口', '{schemas} 个模型', '{sdks} 种 SDK'] },
};
const FACE = [
  { anchor: HV[0], to: [HV[0][0], HV[0][1] - 44], at: [HV[0][0], HV[0][1] - 62] },
  { anchor: HV[4], to: [HV[4][0], HV[4][1] + 64], at: [HV[4][0], HV[4][1] + 116] },
  { anchor: HV[2], to: [HV[2][0], HV[2][1] + 64], at: [HV[2][0], HV[2][1] + 116] },
];
const timesOf = (s, bpm, beats) => {
  const first = s.from === 'none', b = (x) => secs(x, bpm);
  return { morph: first ? null : 0, lines: b(first ? 1 : 2), tones: b(first ? 1.6 : 2.6), caption: b(first ? 1.5 : 3), faces: [0, 1, 2].map((k) => b((first ? 2.5 : 4) + k * 0.5)), arm: b(beats - 1) };
};
const solidAt = (ctx, t, T, s, C, L, { labels = true, captions = true, out = 0 } = {}) => {
  const toneK = cubicOut(prog(t, T.tones, 0.2)), armK = cubicOut(prog(t, T.arm, 0.2));
  if (toneK <= 0) hexagon(ctx, C); else cube(ctx, 0, toneK, armK, C);
  if (toneK < 1 && t >= T.lines) // three lines from the centre re-read the hexagon as a cube; they become its edges
    drawHandoff(ctx, 'stroke-reinterpret', prog(t, T.lines, T.beat), { ground: false, center: [HX, HY], r: HR, lineWidth: 4, hidden: false, colors: { ground: C.ground, ink: C.ink, accent: mix(C.accent, C.ink, toneK) } });
  if (captions) caption(ctx, s.caption, CAP1, spr(t - T.caption, 22), C, L);
  if (!labels) return;
  const F = facts(productOf(s));
  (s.faces || []).slice(0, 3).forEach((lab, k) => {
    const t0 = T.faces[k];
    if (t < t0 || out >= 1) return;
    const kl = cubicOut(prog(t, t0, 0.2)), kt = spr(t - t0 - 0.04, 22), Lb = FACE[k], dir = Math.sign(Lb.to[1] - Lb.anchor[1]);
    const ax = Lb.anchor[0], ay = Lb.anchor[1] + dir * 12;
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, lerp(ay, Lb.to[1], kl)); ctx.stroke(); ctx.restore();
    riseText(ctx, fill(lab, F), Lb.at[0], Lb.at[1], mono(SZ.body, 500, L), C.ink, kt, { align: 'center', out, dy: 50 });
  });
};

export default {
  id: 'hex-solid', kind: 'scene',
  fits: ['turn', 'demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 10 },
  needs: { motions: ['outline-morph', 'stroke-reinterpret'], props: [], roles: ['ground', 'ink', 'line', 'paper', 'accent'], type: ['display', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 4, chars: 15 }, zh: { chars: 7 } } },
    faces: { type: 'list', count: [0, 3], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 15 }, zh: { chars: 8 } } } },
  },
  roles: ['ground', 'ink', 'line', 'paper', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], from: 'card', corners: 'round' }),
  plan(s, ctx) {
    const first = s.from === 'none', read = (readTime(s.caption, ctx.lang) * ctx.bpm) / 60, lastFace = (first ? 2.5 : 4) + 0.5 * Math.max(0, (s.faces || []).length - 1);
    const beats = clamp(Math.ceil(Math.max(lastFace + 1.5, (first ? 1.5 : 3) + read + 1) + 1), 6, 10);
    return { beats, reads: [{ text: s.caption, lang: ctx.lang }, ...(s.faces || []).map((f) => ({ text: f, lang: ctx.lang, tier: 'glance' }))],
      cues: [...(first ? [] : [{ beat: 0, kind: 'turn' }]), { beat: first ? 1 : 2, kind: 'accent' }, { beat: first ? 1.5 : 3, kind: 'land' }, { beat: beats - 1, kind: 'accent' }],
      motion: 'outline → hexagon → cube', settled: lastFace + 0.5, peakAt: first ? 1 : 2, pause: beats - lastFace - 0.5 };
  },
  validate(s) { return (s.faces || []).length > 3 ? ['faces: three at most (one per visible face)'] : []; },
  async prepare(s, c) { await loadFonts(c.lang); return { A: outlineOf(CARD, s.corners), Hx: hexOutline() }; },
  paint(ctx, u, s, c, D) {
    const C = colorsOf(s), L = c.lang, t = secs(u, c.bpm), beats = D.beats || (D.beats = this.plan(s, c).beats);
    const T = { ...timesOf(s, c.bpm, beats), beat: secs(1, c.bpm) };
    groundOf(ctx, s, C);
    if (T.morph != null && t < T.morph + 0.48) { // the card's outline becomes the hexagon; its content leaves first
      const out = prog(t, 0, 0.1), e = cubicInOut(prog(t, 0.1, 0.38));
      morphPath(ctx, D.A, D.Hx, e); ctx.fillStyle = C.ink; ctx.fill();
      if (e > 0) { ctx.lineJoin = 'round'; ctx.lineWidth = 4 * e; ctx.strokeStyle = C.ink; ctx.stroke(); }
      if (out < 1) {
        ctx.save(); clipShape(ctx, CARD, s.corners); ctx.globalAlpha = 1 - out; ctx.filter = `blur(${(12 * out).toFixed(2)}px)`;
        jsonLines(productOf(s)).forEach((ln, i) => txt(ctx, ln, CARD[0] + 64, CARD[1] + 196 + i * 60, mono(SZ.main), C.ground));
        ctx.restore();
      }
      caption(ctx, s.caption, CAP1, spr(t - T.caption, 22), C, L);
      return;
    }
    solidAt(ctx, t, T, s, C, L);
  },
  track() { return [[HX, HY]]; },
};
