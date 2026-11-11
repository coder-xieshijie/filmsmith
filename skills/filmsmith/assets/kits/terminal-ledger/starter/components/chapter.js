// Chapter label (top left, fixed to the screen): on a chapter change the old label blurs out, the new one lands sharp and the yellow underline
// follows its length. One for the whole film, shared by all segments.
// Use:
//   F.chapter('一周的邮件', t)      first call: text blurs in, underline draws; later calls: swap
//   F.chapterHide(t) / F.chapterShow(t)
//   F.chapterNow(text)              for handoffs: no animation, this chapter is already on screen (main calls it when the previous segment is not built)
(function () {
  const { init, to, el, div } = F;
  let chap, cul, cur = null;
  const mk = () => { if (chap) return; chap = div(F.$('world'), '', ''); chap.id = 'chap'; cul = div(chap, 'ul', ''); cul.id = 'cul'; init(cul, { width: 10, scaleX: 0 }); };
  F.chapter = (text, t) => {
    mk();
    const c = el('div', 'ct', chap); c.textContent = text;
    init(c, { opacity: 0, filter: 'blur(6px)' });
    const w = c.offsetWidth + 12;
    if (!cur) { to(c, { opacity: 1, filter: 'blur(0px)' }, t, 0.4, 'power2.out'); init(cul, { width: w }); to(cul, { scaleX: 1 }, t + 0.1, 0.5, 'power3.out'); }
    else { to(cur, { opacity: 0, filter: 'blur(6px)' }, t, 0.18, 'power1.in'); to(c, { opacity: 1, filter: 'blur(0px)' }, t + 0.18, 0.2, 'power2.out'); to(cul, { width: w }, t + 0.05, 0.35, 'power2.inOut'); }
    cur = c; c._text = text; return c;
  };
  F.chapterNow = (text) => {
    mk();
    const c = el('div', 'ct', chap); c.textContent = text;
    init(c, { opacity: 1, filter: 'blur(0px)' }); init(cul, { width: c.offsetWidth + 12, scaleX: 1 });
    cur = c; c._text = text; return c;
  };
  F.chapterText = () => (cur ? cur._text : null);
  F.chapterHide = (t) => { to(cur, { opacity: 0, filter: 'blur(6px)' }, t, 0.2, 'power1.in'); to(cul, { scaleX: 0 }, t, 0.25, 'power2.in'); };
  F.chapterShow = (t) => { to(cur, { opacity: 1, filter: 'blur(0px)' }, t, 0.25, 'power2.out'); to(cul, { scaleX: 1 }, t, 0.35, 'power3.out'); };
})();
