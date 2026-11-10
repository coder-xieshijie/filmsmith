// card-squash — a card squashes into the line it made: a 900 × 506 card in the text colour flattens to a 1100 × 6 line
// in the line colour (an exact landing, settle ω 10), its corners going square; in the 'swell' profile it swells over the
// second half of the flattening, so it lands on a swelled rule. The thread's sheet → card → line, the line the close
// opens from; the card's title fades out over the first 30 %.
// From the thread template: film.js review (the card, CARD.squash 0.35 u), swellPath with s. Chinese: the title is the
// card's file type and stays Latin; a Chinese title takes Noto Sans SC after the grotesque.
import { palOf, lineBox } from '../../prop/thread-line/kit.js';
import { setLang, setFont, fitSize, rr } from '../../prop/thread-line/fx.js';
import { settle } from '../../../handoffs/util.js';
import { clamp, lerp } from '../../../motion.js';

const DEFAULT = { en: { title: 'MP4' }, zh: { title: 'MP4' } };
const boxAt = (p) => { const sq = settle(clamp(p), 10); return { sq, w: lerp(900, 1100, sq), h: lerp(506, 6, sq) }; };
export default {
  id: 'card-squash', kind: 'motion',
  tier: 'T0', family: 'shape', beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a 900 × 506 card in the text colour with its title', to: 'a 1100 × 6 line in the line colour at the frame\'s centre',
  interpolates: ['width 900 → 1100, height 506 → 6, radius 10 → 0 (settle ω 10, exact)', 'fill text → line colour at half way', 'title opacity 1 → 0 over the first 30 %', 'swell: rule → swelled outline over the second half'],
  summary: 'A card squashes into the line it made, landing exactly on the line the next shot starts from.',
  theory: 'Squash keeps volume legible as a change of form, not a cut (Thomas & Johnston, squash and stretch); landing exactly on the next shot\'s first shape makes the hand-off pixel-continuous (the thread\'s mode principle 2).',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], palette: 'cobalt-vermilion', thread: 'rule' }),
  prepare(P) { setLang(P.lang); return { Pal: palOf(P.colors, P.palette), size: Math.min(230, fitSize('disp', 800, -0.03, P.title, 720, 230)) }; },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: clamp(p) }; },
  paint(ctx, S, P, D) {
    setLang(P.lang);
    const { sq, w, h } = boxAt(S.p), Pal = D.Pal;
    ctx.fillStyle = Pal.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.fillStyle = sq > 0.5 ? Pal.line : Pal.text;
    if (P.thread !== 'swell' || sq <= 0.5) rr(ctx, 960 - w / 2, 540 - h / 2, w, h, lerp(10, 0, sq));
    else lineBox(ctx, 960 - w / 2, 540 - h / 2, w, h, 'swell', (sq - 0.5) / 0.5);
    ctx.fill();
    if (sq < 0.3) { ctx.save(); ctx.globalAlpha = 1 - sq / 0.3; ctx.fillStyle = Pal.ground; setFont(ctx, 'disp', 800, D.size, -0.03); ctx.textAlign = 'center'; ctx.fillText(P.title, 960, 590); ctx.restore(); }
  },
  track(S) { const { w, h } = boxAt(S.p); return [[960 - w / 2, 540 - h / 2], [960 + w / 2, 540 + h / 2]]; },
};
