// Presenter placeholder window and its reserve: centre 1730,710, diameter 280; reserve x 1580–1880, y 560–860.
// The windows are film.json "avatar" ([[start, end], …], written by npm run init from contract.json); main places the placeholder
// (fades in 0.35 s, out 0.4 s before the end). Segment files do nothing.
// Rule: outside the windows the reserve is plain paper in every frame (npm run check verifies frame by frame); keep content out of it inside the windows too.
// Use: F.avatarZone → [x0, y0, x1, y1]; F.inAvatar(t) → whether t is inside a presenter window
(function () {
  const { init, to } = F;
  F.avatarZone = TOKENS.zone.avatar;
  F.avatars = (wins) => {
    F.inAvatar = (t) => wins.some(([a, b]) => t >= a && t < b);
    wins.forEach(([a, b], i) => {
      const e = F.$('avi' + i); if (!e) return;
      if (a <= 0) init(e, { opacity: 1, scale: 1 });
      else { init(e, { opacity: 0, scale: 0.92 }); to(e, { opacity: 1, scale: 1 }, a + 0.02, 0.35, 'power2.out'); }
      to(e, { opacity: 0, scale: 0.92 }, b - 0.4, 0.35, 'power2.in');
    });
  };
})();
