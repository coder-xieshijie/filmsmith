// hung-block — an interface block hung on the stream thread: a small warm off-white paper block (a chat with bubbles, a
// task row with its running ring, the closing panel with one "needs you") or a glass card on the night, hung off the spine
// by a hook (a point lit on the spine, a short light to the block's left edge). It unfolds from that edge along the hook,
// sits in the night with sky around it (never the whole frame), and turns done (the ring becomes a neutral tick).
// blocks.js is the kit every stream brick draws its blocks and sets its type with.
// From the stream template: film.js css() (.paper, .chat, .bub, .row, .ring, .tick, .glass, .pill), renderChat (the hook),
// renderAsk, renderCards, the closing panel; plan.js cardAt (the block's unfold).
import { palOf, thread, glow, E, lerp } from '../glow-thread/draw.js';
import { night, spine, SPINE, lighter } from '../glow-thread/demo.js';
import { typeOf } from '../glow-thread/text.js';
import { box, textAt, textW, ring, tick, pill, bubbleOf, drawBubble, lineH, shadowOf } from './blocks.js';

const SIZE = { chat: [560, 520], row: [760, 130], card: [640, 300], panel: [700, 420] };
const DEFAULT = {
  en: { form: 'chat', title: 'Sketch → app icon', detail: 'Running · reading the sketch', done: 'Done · 3 icons, middle recommended', lines: ["Hand me your tasks. I'll come back with results.", 'Turn this sketch into an app icon'], rows: ['Goal · a video editor', 'Decision · framework A'], needs: 'Needs you', others: 'Done' },
  zh: { form: 'chat', title: '草图 → 应用图标', detail: '进行中 · 正在读草图', done: '已完成 · 推荐中间那版', lines: ['把事交给我，做完带着结果回来找你。', '把草图做成应用图标'], rows: ['目标 · 剪辑工具', '决定 · 框架 A'], needs: '需要你', others: '已完成' },
};
export default {
  id: 'hung-block', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // open: the unfold from the hook (0 folded into the thread, 1 open); done: running → done. Listed open → done → folded:
  // the sample walks a finished block back into the thread, and the size stills show it open
  states: { open: { open: 1, done: 0 }, done: { open: 1, done: 1 }, folded: { open: 0, done: 1 } },
  parts: ['hook (point and reach)', 'paper (or glass) body', 'bubbles', 'ring / tick', 'rows', 'pills'],
  swap: {
    title: { type: 'text', tier: 'primary', limits: { en: { chars: 30 }, zh: { chars: 15 } } },
    detail: { type: 'text', tier: 'glance', limits: { en: { chars: 34 }, zh: { chars: 17 } } },
    done: { type: 'text', tier: 'primary', limits: { en: { chars: 34 }, zh: { chars: 17 } } },
    lines: { type: 'list', count: [1, 3], of: { type: 'text', tier: 'primary', limits: { en: { chars: 86 }, zh: { chars: 40 } } } },
    rows: { type: 'list', count: [1, 3], of: { type: 'text', tier: 'primary', limits: { en: { chars: 34 }, zh: { chars: 17 } } } },
    // panel, optional: tabs on the title line (the first current), a group header over the rows, a time at each row's end
    tabs: { type: 'list', count: [2, 3], optional: true, sample: 'default', of: { type: 'text', tier: 'glance', limits: { en: { chars: 12 }, zh: { chars: 6 } } } },
    group: { type: 'text', tier: 'glance', optional: true, sample: 'default', limits: { en: { chars: 34 }, zh: { chars: 17 } } },
    times: { type: 'list', count: [1, 3], optional: true, sample: 'default', of: { type: 'text', tier: 'glance', limits: { en: { chars: 8 }, zh: { chars: 5 } } } },
  },
  roles: ['ground', 'accent', 'glow', 'paper', 'onPaper', 'onPaper2', 'bubble', 'user', 'onUser', 'rule', 'accentInk', 'warn', 'panel', 'panel2', 'ink', 'dim'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], palette: 'night' }),
  prepare: (P) => ({ ...palOf(P.colors, P.palette), TY: typeOf(P.lang) }),
  draw(ctx, st, P, D) {
    const k = (P.w || 1920) / 1920, { P: Pal, C, TY } = D, lang = P.lang === 'zh' ? 'zh' : 'en';
    ctx.save(); ctx.scale(k, k);
    night(ctx, Pal, 2);
    spine(ctx, C);
    const [w0, h0] = SIZE[P.form] || SIZE.chat, x0 = 420, y0 = 540 - h0 / 2, hy = P.form === 'row' ? 540 : y0 + 64, o = E.io3(st.open), w = w0 * o;
    lighter(ctx, () => { thread(ctx, C, [[SPINE.x, hy], [lerp(SPINE.x, x0 + 6, Math.min(1, st.open * 1.6)), hy]], 0.9, 0.7); glow(ctx, SPINE.x, hy, 22, C.glow, 0.7); glow(ctx, SPINE.x, hy, 6, C.core, 1); });
    if (w > 1) {
      const glass = P.form === 'card';
      box(ctx, x0, y0, w, h0, glass ? 28 : 30, glass ? Pal.panel : Pal.paper, { shadow: shadowOf(0.42) });
      ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, w, h0, Math.min(30, w / 2)); ctx.clip();
      if (P.form === 'chat') {
        let y = y0 + 34;
        (P.lines || []).forEach((s, i) => { const B = bubbleOf(ctx, TY, s, lang, 470), user = i % 2 === 1; drawBubble(ctx, TY, Pal, B, user ? 'user' : 'bot', user ? x0 + w0 - 30 - B.w : x0 + 30, y); y += B.h + 18; });
        box(ctx, x0 + 26.75, y0 + h0 - 24 - 66 + 0.75, w0 - 53.5, 64.5, 22, Pal.paper, { stroke: [1.5, Pal.rule] });
      } else if (P.form === 'row') {
        const th = lineH(TY.row, 'normal', P.title), sh = lineH(TY.rowSub, 'normal', P.detail), ry = y0 + (h0 - th - sh) / 2;
        if (st.done > 0.5) tick(ctx, Pal, x0 + 32, y0 + h0 / 2 - 15); else ring(ctx, Pal, x0 + 47, y0 + h0 / 2, 0);
        textAt(ctx, TY, P.title, x0 + 80, ry, TY.row, 600, Pal.ink);
        textAt(ctx, TY, P.detail, x0 + 80, ry + th, TY.rowSub, 400, Pal.ink2, { alpha: 1 - st.done });
        textAt(ctx, TY, P.done, x0 + 80, ry + th, TY.rowSub, 400, Pal.ink2, { alpha: st.done });
      } else if (P.form === 'card') {
        textAt(ctx, TY, P.title, x0 + 36, y0 + 28, TY.cardTitle, 600, Pal.text);
        let y = y0 + 28 + lineH(TY.cardTitle, 'normal', P.title) + 4 + lineH(TY.cardSub, 'normal');
        (P.rows || []).forEach((r) => { y += 14; const rh = 27 + lineH(TY.cardRow, 'normal', r); box(ctx, x0 + 36, y, w0 - 72, rh, 16, Pal.panel2, { stroke: [1.5, `rgba(${C.line},0.35)`] }); textAt(ctx, TY, r, x0 + 57.5, y + 13.5, TY.cardRow, 400, Pal.text); y += rh; });
      } else {
        textAt(ctx, TY, P.title, x0 + 34, y0 + 30, TY.row + 2, 600, Pal.ink);
        if (Array.isArray(P.tabs) && P.tabs.length) { // a segmented control on the title line, right
          const th = lineH(TY.row + 2, 'normal', P.title), ph = lineH(TY.rowSub, 'normal') + 16, tw = P.tabs.map((s2) => textW(ctx, TY, s2, TY.rowSub, 600) + 32);
          let tx = x0 + w0 - 34 - tw.reduce((a, b) => a + b, 0) - 8; const ty = y0 + 30 + (th - ph) / 2;
          box(ctx, tx, ty, x0 + w0 - 34 - tx, ph, ph / 2, Pal.bubble); tx += 4;
          P.tabs.forEach((s2, i) => { if (!i) box(ctx, tx, ty + 4, tw[i], ph - 8, (ph - 8) / 2, Pal.paper, { shadow: shadowOf(0.12, 2, 6) }); textAt(ctx, TY, s2, tx + 16, ty + (ph - lineH(TY.rowSub, 'normal', s2)) / 2, TY.rowSub, 600, i ? Pal.ink2 : Pal.ink); tx += tw[i]; });
        }
        let y = y0 + 30 + lineH(TY.row + 2, 'normal', P.title) + 18, x = x0 + 34;
        x += pill(ctx, TY, Pal, x, y, P.needs, { bg: Pal.warn, color: Pal.paper, w: 600 }) + 12; pill(ctx, TY, Pal, x, y, P.others);
        y += lineH(TY.rowSub, 'normal') + 18;
        if (P.group) { textAt(ctx, TY, P.group, x0 + 34, y, TY.rowSub, 600, Pal.ink2); y += lineH(TY.rowSub, 'normal', P.group) + 8; }
        (P.rows || []).forEach((r, i) => {
          const rh = 32 + lineH(TY.row, 'normal', r); if (!i) box(ctx, x0 + 16, y, w0 - 32, rh, 18, Pal.bubble); if (!i) box(ctx, x0 + 34, y + rh / 2 - 15, 30, 30, 15, Pal.warn); else tick(ctx, Pal, x0 + 34, y + rh / 2 - 15); textAt(ctx, TY, r, x0 + 82, y + 16, TY.row, 600, Pal.ink);
          const tm = Array.isArray(P.times) ? P.times[i] : null; if (tm) textAt(ctx, TY, tm, x0 + w0 - 34, y + 16 + (lineH(TY.row, 'normal', r) - lineH(TY.rowSub, 'normal', tm)) / 2, TY.rowSub, 400, Pal.ink2, { align: 'right' });
          y += rh;
        });
      }
      ctx.restore();
      if (P.form === 'card') box(ctx, x0 + 1, y0 + 1, w - 2, h0 - 2, 27, null, { stroke: [2, `rgba(${C.line},0.55)`] });
    }
    ctx.restore();
  },
};
