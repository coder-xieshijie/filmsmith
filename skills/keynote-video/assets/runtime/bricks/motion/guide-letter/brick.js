// guide-letter — lettering drafted, not placed: two thin construction lines run across the sheet just before the
// word (0.55 s, the second 0.08 s later), then the letters are traced in left to right under a widening clip
// (power2.inOut, 0.6 s, 15 % longer past 12 characters). The construction lines stay. Latin guides are the baseline
// and the cap line (cap height 0.698 em, IBM Plex); Chinese has no cap line, so its guides are the em box the
// characters are drawn in: the ideographic bottom (0.12 em under the baseline) and top (0.88 em over it).
// From the blueprint template (assets/templates/blueprint/fx.js pen.guides, drawText 'wipe'; sheets/common.js header).
import { E, SW, SH, palOf, makePen, drawWorld, drawLight, texturesOf, canvasOf, setLang, clamp, up } from '../../prop/sheet-hud/kit.js';

const DEFAULT = { en: { label: 'Detail 02 — the owner’s review', lines: ['Drawn first,', 'shipped in stages.'] }, zh: { label: '详图 02 — 负责人评审', lines: ['先画图，', '再分批上线。'] } };
export default {
  id: 'guide-letter', kind: 'motion',
  tier: 'T0', family: 'mask-type', beats: 3,
  surface: ['canvas'],
  roles: ['paper', 'ink', 'line'],
  from: 'a blank stretch of the sheet', to: 'the lettered title on its construction lines',
  interpolates: ['guide lines 0 → full width', 'clip right edge x0 → x0 + width (left to right)'],
  summary: 'Two construction lines run across the sheet, then the title is traced in left to right over them; Chinese uses the em box as its guides.',
  theory: 'Drafting practice: letter between light guide lines (ISO 3098; Giesecke, Technical Drawing); a left-to-right reveal follows the reading order, so the word is read as it appears.',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], seed: 7 }),
  prepare(P) {
    setLang(P.lang || 'en');
    const Pal = palOf(P.colors, P.palette), mctx = canvasOf(8, 8).getContext('2d'), pen = makePen(Pal, mctx, { lang: P.lang });
    pen.text(up(P.label), 150, 180, { fam: 'mono', w: 400, size: 25, track: 0.14 }, 0.05, 0.45, { col: 'line' });
    const f = { fam: 'cond', w: 700, size: 140, track: -0.02 };
    P.lines.forEach((l, i) => { const t = 0.4 + i * 0.45; pen.guides(325 + 172 * i, f.size, t - (i ? 0.15 : 0.38), 80, 1840, l); pen.text(l, 142, 325 + 172 * i, f, t, 0.6 * (l.length > 12 ? 1.15 : 1)); });
    return { Pal, pen, T: texturesOf(Pal, P.seed || 7) };
  },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { t: p * 1.8 }; },
  paint(ctx, S, P, D) { drawWorld(ctx, D.Pal, { x: 960, y: 540, s: 1, dx: 0, dy: 0 }, D.pen.items, S.t); drawLight(ctx, D.Pal, D.T, 0); },
  track(S) { return [[142 + 1200 * clamp((S.t - 0.4) / 1), 300]]; },
};
