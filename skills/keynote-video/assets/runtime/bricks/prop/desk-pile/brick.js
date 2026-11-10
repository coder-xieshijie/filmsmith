// desk-pile — the pile a stream film opens on: three session windows (a title bar, the user's ask, a status with its
// running ring, one window asking for approval with its buttons), four alerts, a sticky note with two questions and
// fourteen dialog copies cascading, on a daytime desktop (`desk`: accent-tinted wallpaper, a taskbar with the sessions'
// names, an unread badge) or as dark cards scattered over the night (`night`). Its states: piled (every item in),
// pierced (every item lit where the thread passes), empty. The pile is texture (read as "too many", not line by line).
// From the stream template: plan.js openItems; film.js css() and buildDOM() (the opening); pile.js draws them on canvas.
import { palOf } from '../glow-thread/draw.js';
import { typeOf } from '../glow-thread/text.js';
import { openItems, wall, item } from './pile.js';
import { sky } from '../../look/night-sky/texture.js';
import EX from '../glow-thread/examples.js';

const own = (lang) => { const s = EX[lang === 'zh' ? 'zh' : 'en'].scenes[0]; return { sessions: s.sessions, alerts: s.alerts, note: s.note }; };
export default {
  id: 'desk-pile', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // n: the share of the pile shown (in its order: windows, alerts, note, copies); lit: every item lit by the thread
  states: { piled: { n: 1, lit: 0 }, pierced: { n: 1, lit: 1 }, empty: { n: 0, lit: 1 } },
  parts: ['wallpaper', 'taskbar', 'badge', 'window ×3', 'alert ×4', 'note', 'copy ×14', 'cursor'],
  swap: {
    sessions: { type: 'list', count: [3, 3], of: { title: { type: 'text', tier: 'glance', limits: { en: { chars: 24 }, zh: { chars: 12 } } }, ask: { type: 'text', tier: 'glance', limits: { en: { chars: 26 }, zh: { chars: 13 } } }, status: { type: 'text', tier: 'glance', limits: { en: { chars: 26 }, zh: { chars: 13 } } } } },
    alerts: { type: 'list', count: [1, 6], of: { title: { type: 'text', tier: 'glance', limits: { en: { chars: 26 }, zh: { chars: 13 } } }, yes: { type: 'text', tier: 'glance', limits: { en: { chars: 10 }, zh: { chars: 4 } } }, no: { type: 'text', tier: 'glance', limits: { en: { chars: 10 }, zh: { chars: 4 } } } } },
    note: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', limits: { en: { chars: 36 }, zh: { chars: 16 } } } },
    // how many dialog copies cascade (default 14)
    copies: { type: 'number', min: 4, max: 30, optional: true, sample: 'default' },
  },
  roles: ['paper', 'onPaper', 'onPaper2', 'bubble', 'user', 'onUser', 'rule', 'desk1', 'desk2', 'desk3', 'deskBar', 'panel', 'panel2', 'ink', 'dim', 'accent'],
  defaults: (ctx = {}) => ({ ...own(ctx.lang), opening: 'desk', palette: 'night', seed: 7 }),
  prepare: (P) => { const s = { sessions: P.sessions, alerts: P.alerts, note: P.note, ...(P.copies != null ? { copies: P.copies } : {}) }; return { ...palOf(P.colors, P.palette), TY: typeOf(P.lang), s, items: openItems(P.opening === 'night' ? 'night' : 'desk', s, P.seed ?? 7) }; },
  draw(ctx, st, P, D) {
    const k = (P.w || 1920) / 1920, v = P.opening === 'night' ? 'night' : 'desk';
    ctx.save(); ctx.scale(k, k);
    if (v === 'desk') wall(ctx, D.TY, D.P, D.s.sessions, st.n > 0.2 ? Math.round(30 * st.n) : null); else sky(ctx, D.P, 1, { seed: P.seed ?? 7 });
    const n = Math.round(st.n * D.items.length);
    D.items.slice(0, n).forEach((it) => { ctx.save(); ctx.translate(it.x + it.w / 2, it.y + it.h / 2); ctx.rotate(((it.rot || 0) * Math.PI) / 180); ctx.translate(-it.w / 2, -it.h / 2); item(ctx, D.TY, D.P, v, it, D.s, 0, st.lit); ctx.restore(); });
    ctx.restore();
  },
};
