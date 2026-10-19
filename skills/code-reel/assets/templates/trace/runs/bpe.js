// runs/bpe.js — byte-pair encoding, run for real. Count every adjacent pair weighted by its word's frequency,
// merge the most frequent pair everywhere, repeat; then split an unseen word by replaying the merges in order.
// Default corpus: Sennrich, Haddow & Birch (2016), "Neural Machine Translation of Rare Words with Subword
// Units", no end-of-word marker. Ties go to the pair seen first in the corpus.

const tok = (t) => ({ t, k: t.length > 1 ? 'learned' : 'base' });

const pairCounts = (words) => {
  const counts = new Map(), order = [], from = new Map();
  words.forEach(({ f, s }, row) => {
    for (let i = 0; i < s.length - 1; i++) {
      const key = s[i] + '\u0000' + s[i + 1];
      if (!counts.has(key)) { counts.set(key, 0); order.push(key); from.set(key, []); }
      counts.set(key, counts.get(key) + f);
      const fr = from.get(key), last = fr[fr.length - 1];
      if (last && last.row === row) last.n += 1; else fr.push({ row, w: f, n: 1 });
    }
  });
  const ranked = order.slice().sort((x, y) => counts.get(y) - counts.get(x) || order.indexOf(x) - order.indexOf(y));
  return ranked.map((k) => { const [a, b] = k.split('\u0000'); return { a, b, count: counts.get(k), from: from.get(k) }; });
};

const applyMerge = (seq, a, b) => {
  const out = [], map = [], hi = [];
  for (let i = 0; i < seq.length; i++) {
    if (i < seq.length - 1 && seq[i] === a && seq[i + 1] === b) { out.push(a + b); map.push([i, i + 1]); hi.push(i); i++; }
    else { out.push(seq[i]); map.push([i]); }
  }
  return { out, map, hi };
};

const tokens = (words) => words.reduce((n, w) => n + w.f * w.s.length, 0);
const vocab = (words) => new Set(words.flatMap((w) => w.s)).size;

export const steps = ({ corpus = [['low', 5], ['lower', 2], ['newest', 6], ['widest', 3]], merges = 7, probe = 'lowest', top = 5 } = {}) => {
  let words = corpus.map(([w, f]) => ({ w, f, s: w.split('') }));
  const rows = words.map((w) => ({ label: `×${w.f}`, weight: w.f, tokens: w.s.map(tok) }));
  const hud0 = { a: vocab(words), b: tokens(words) };
  const out = [];
  const learned = [];
  for (let k = 0; k < merges; k++) {
    const ranked = pairCounts(words);
    if (!ranked.length || ranked[0].count < 2) break;
    const { a, b, count } = ranked[0];
    const hi = [];
    const after = words.map((wd, r) => {
      const m = applyMerge(wd.s, a, b);
      m.hi.forEach((i) => hi.push([r, i, 2]));
      return { wd: { ...wd, s: m.out }, map: m.map };
    });
    words = after.map((x) => x.wd);
    learned.push({ a, b, token: a + b, count });
    const shown = ranked.slice(0, top);
    out.push({
      counts: {
        title: 'pair counts',
        items: shown.map((p) => ({ parts: [tok(p.a), tok(p.b)], value: p.count, from: p.from })),
        pick: 0,
        note: shown[1] && shown[1].count === shown[0].count ? 'tie: the pair seen first wins' : null,
      },
      hi,
      rows: after.map((x) => ({ tokens: x.wd.s.map(tok), map: x.map })),
      rule: { parts: [tok(a), { t: '+', k: 'op' }, tok(b), { t: '→', k: 'op' }, { t: a + b, k: 'learned' }], value: `×${count}` },
      hud: { a: hud0.a + learned.length, b: tokens(words) },
    });
  }
  // replay the learned merges on an unseen word
  let s = probe.split('');
  const pSteps = [];
  learned.forEach((m, k) => {
    const r = applyMerge(s, m.a, m.b);
    if (r.out.length !== s.length) { s = r.out; pSteps.push({ rule: k, tokens: s.map((x) => (x.length > 1 ? { t: x, k: 'learned' } : { t: x, k: 'unseen' })), map: r.map }); }
  });
  const T0 = hud0.b, TN = out[out.length - 1].hud.b;
  const fills = {
    W: corpus.length, OCC: corpus.reduce((n, [, f]) => n + f, 0), N: out.length,
    A1: learned[0].a, B1: learned[0].b, T1: learned[0].token, C1: learned[0].count,
    A2: learned[1]?.a ?? '', B2: learned[1]?.b ?? '', T2: learned[1]?.token ?? '', C2: learned[1]?.count ?? '',
    T0, TN, V0: hud0.a, VN: hud0.a + out.length, PROBE: probe, ENC: s.join(' + '), PN: s.length,
    PCT: Math.round((100 * (T0 - TN)) / T0),
  };
  return {
    rows, steps: out, hud0, fills,
    probe: { label: 'new', tokens: probe.split('').map((t) => ({ t, k: 'unseen' })), steps: pSteps, used: pSteps.map((p) => p.rule) },
  };
};
