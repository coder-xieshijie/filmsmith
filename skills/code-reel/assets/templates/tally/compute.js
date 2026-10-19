// compute.js — turns content.data into one unit per item and answers every number the film shows.
// Shared by index.html (browser) and score.mjs / tools (Node). No number on screen is typed by hand:
// copy carries {placeholders} that are filled from the units here.
import { mulberry32 } from './lib/rng.js';

// ---------- units ----------
// data.items: rows as [categoryIndex, periodIndex, flagBits] or { c: 'cat-id', t: 'period', f: ['flag-id', ...] },
// optionally with id, label and note (strings from the data: a `list` scene shows them, one line per item)
// data.counts: aggregated rows { c: 'cat-id', t?: 'period', n: 120, f?: { 'flag-id': 80 } }, expanded here.
export const buildUnits = (data, seed = 1) => {
  const cats = data.categories.map((c, i) => ({ ...c, i }));
  const flags = (data.flags || []).map((f, i) => ({ ...f, i, bit: 1 << i }));
  const periods = data.periods || [];
  if (flags.length > 30) throw new Error('at most 30 flags');
  const ci = (c) => (typeof c === 'number' ? c : cats.findIndex((x) => x.id === c));
  const ti = (t) => (t == null ? -1 : typeof t === 'number' ? t : periods.indexOf(t));
  const fb = (id) => {
    const f = flags.find((x) => x.id === id);
    if (!f) throw new Error(`unknown flag ${id}`);
    return f.bit;
  };
  const units = [];
  if (data.items) {
    for (const row of data.items) {
      if (Array.isArray(row)) units.push({ c: row[0], t: row[1] ?? -1, f: row[2] | 0 });
      else units.push({ c: ci(row.c), t: ti(row.t), f: (row.f || []).reduce((b, id) => b | fb(id), 0), ...(row.id != null ? { id: String(row.id) } : {}), ...(row.label != null ? { label: String(row.label) } : {}), ...(row.note != null ? { note: String(row.note) } : {}) });
    }
  } else if (data.counts) {
    // Flags inside one count row go to a seeded random subset of its units; flags in different rows are independent.
    const r = mulberry32(seed * 7919 + 17);
    for (const row of data.counts) {
      const first = units.length;
      for (let j = 0; j < row.n; j++) units.push({ c: ci(row.c), t: ti(row.t), f: 0 });
      for (const [id, k] of Object.entries(row.f || {})) {
        if (k > row.n) throw new Error(`flag ${id} count ${k} > row n ${row.n}`);
        const idx = [...Array(row.n).keys()];
        for (let j = idx.length - 1; j > 0; j--) {
          const s = Math.floor(r() * (j + 1));
          [idx[j], idx[s]] = [idx[s], idx[j]];
        }
        for (let j = 0; j < k; j++) units[first + idx[j]].f |= fb(id);
      }
    }
    // Interleave rows so dataset order is not grouped by category (a seeded shuffle).
    for (let j = units.length - 1; j > 0; j--) {
      const s = Math.floor(r() * (j + 1));
      [units[j], units[s]] = [units[s], units[j]];
    }
  } else throw new Error('content.data needs items or counts');
  units.forEach((u, k) => {
    if (u.c < 0 || u.c >= cats.length) throw new Error(`unit ${k}: unknown category`);
    u.k = k;
  });
  return { cats, flags, periods, units };
};

// ---------- selectors ----------
// 'all' | atoms joined by '&'. Atom: [!]kind:value[|value...], kind c (category), f (flag), t (period).
// Examples: 'f:stated', 'c:product-launch', 'f:stated&!f:videomodel', 'f:three|remotion|browser|hyperframes'.
export const selector = (model, sel) => {
  if (!sel || sel === 'all' || sel === 'n') return () => true;
  const atoms = sel.split('&').map((a) => {
    a = a.trim();
    const neg = a.startsWith('!');
    if (neg) a = a.slice(1);
    const [kind, vals] = [a.slice(0, a.indexOf(':')), a.slice(a.indexOf(':') + 1).split('|')];
    let test;
    if (kind === 'c') {
      const set = new Set(vals.map((v) => model.cats.findIndex((c) => c.id === v)));
      if (set.has(-1)) throw new Error(`unknown category in ${sel}`);
      test = (u) => set.has(u.c);
    } else if (kind === 'f') {
      const mask = vals.reduce((m, v) => {
        const f = model.flags.find((x) => x.id === v);
        if (!f) throw new Error(`unknown flag in ${sel}`);
        return m | f.bit;
      }, 0);
      test = (u) => (u.f & mask) !== 0;
    } else if (kind === 't') {
      const set = new Set(vals.map((v) => model.periods.indexOf(v)));
      test = (u) => set.has(u.t);
    } else throw new Error(`bad selector ${sel}`);
    return neg ? (u) => !test(u) : test;
  });
  return (u) => atoms.every((f) => f(u));
};

export const fmt = (n) => Math.round(n).toLocaleString('en-US');
export const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

// ---------- the model ----------
export const model = (content) => {
  const m = buildUnits(content.data, content.seed || 1);
  const cache = new Map();
  m.count = (sel) => {
    if (!cache.has(sel)) cache.set(sel, m.units.filter(selector(m, sel)).length);
    return cache.get(sel);
  };
  m.match = (sel) => selector(m, sel);
  m.n = m.units.length;
  m.content = content;
  // categories ranked by count (ties keep data order); top k plus one folded "rest" group
  m.ranked = () =>
    m.cats
      .map((c) => ({ ...c, n: m.units.filter((u) => u.c === c.i).length }))
      .filter((c) => c.n > 0)
      .sort((a, b) => b.n - a.n || a.i - b.i);
  m.groups = (top, restName = '{rest} other kinds') => {
    const r = m.ranked();
    if (!top || r.length <= top + 1) return r.map((c) => ({ name: c.name, n: c.n, ids: [c.i], key: c.id }));
    const head = r.slice(0, top).map((c) => ({ name: c.name, n: c.n, ids: [c.i], key: c.id }));
    const tail = r.slice(top);
    const rest = { name: m.fill(restName, { rest: tail.length }), n: tail.reduce((s, c) => s + c.n, 0), ids: tail.map((c) => c.i), key: '__rest' };
    return [...head, rest];
  };
  // {placeholder} filling. Accent markup *like this* is left for the renderer.
  m.fill = (s, extra = {}) =>
    String(s ?? '').replace(/\{([^{}]+)\}/g, (_, key) => {
      if (key in extra) return String(extra[key]);
      if (key === 'n' || key === 'all') return fmt(m.n);
      if (key === 'kinds') return String(m.ranked().length);
      if (key === 'periods') return String(m.periods.length);
      if (key === 'first') return String(m.periods[0] ?? '');
      if (key === 'last') return String(m.periods[m.periods.length - 1] ?? '');
      if (key === 'unit') return content.data.unit || 'item';
      if (key === 'units') return content.data.units || 'items';
      if (key.startsWith('pct:')) {
        const [a, b] = key.slice(4).split('/');
        return String(pct(m.count(a), m.count(b || 'all')));
      }
      return fmt(m.count(key));
    });
  return m;
};

// What the accent marks in a scene, for the "highlighted: …" key: the scene's `highlight` slot, else the name
// of the accent's category or flag (a single atom such as 'c:bug' or 'f:stated'), the accent series' name or
// the accent number's label. null: nothing to key (no accent, or a selector too complex to name).
export const highlightOf = (ch, m) => {
  if (ch.highlight) return m.fill(ch.highlight);
  const name = (sel) => {
    const a = /^([cf]):([^&|!]+)$/.exec(String(sel ?? '').trim());
    if (!a) return null;
    const list = a[1] === 'c' ? m.cats : m.flags;
    return list.find((x) => x.id === a[2])?.name ?? null;
  };
  switch (ch.type) {
    case 'columns': case 'share': case 'timeline': return ch.accent ? name(ch.accent) : null;
    case 'split': return name(ch.by);
    case 'axis': return (ch.series || []).find((s) => s.sel === ch.accent)?.name ?? null;
    case 'close': { const h = (ch.numbers || []).find((x) => x.accent); return h ? m.fill(h.label) : null; }
    case 'trend': return 'trend';
    case 'list': {
      const units = m.units.filter(selector(m, ch.sel || 'all'));
      const u = !ch.key || ch.key === 'last' ? units[units.length - 1] : ch.key === 'first' ? units[0] : units.find(selector(m, ch.key));
      return u?.id ? `${m.content?.data?.unit ?? ''} ${u.id}`.trim() : null;
    }
    default: return null;
  }
};
