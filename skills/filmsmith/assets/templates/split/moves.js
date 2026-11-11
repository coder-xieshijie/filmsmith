// moves.js — Split's six pluggable moves. Each role is filled by an adapter over a hand-off module of the film's shared
// library, found by name (lib/handoffs/: split-open, louvre, wipe-line, split-branch, diff-slider; seam.js draws the
// seam, solid or stitched, from colors.stitch). The choreography (choreo.js)
// reads only an adapter's `device` and `beats` (moveOf), so a swapped move keeps every timing check; film.js calls
// createMove() once per use in ready() and then only draw(ctx, p) and speed(p).
//
//   open     the caret runs to the seam and stands up; the first result slides out of it      split-open (T3 hook)
//   change   the first change of result: slats slide out of the seam behind copies of it       louvre (T2)
//   push     an ordinary change of result: one slat                                            louvre, n = 1 (T1)
//   wipe     a copy of the seam crosses the frame and changes input and result at once        wipe-line (T2)
//   branch   the seam moves and a branch opens a second result pane                           split-branch (T2)
//   slide    the before/after: the seam slides across two renders of one instant              diff-slider (T3 climax)
//
// content.moves = { role: id } picks another adapter for a role. Adding a transition (TEMPLATE.md, Moves): put the module
// in lib/handoffs/ (registered in its index.js), then add an entry to ADAPTERS[role] with its device name, beats and fixed
// params. At p = 0 and p = 1 a module must paint exactly what the template paints on either side, or the move pops.
import { merge } from './lib/handoffs/util.js';
import { list, createHandoff } from './lib/handoffs/index.js';

export const ADAPTERS = {
  open: { 'split-open': { device: 'split-open', beats: 1.75, params: {} } },
  change: { louvre: { device: 'louvre', beats: 2, params: { n: 9, stagger: 0.07 } } },
  push: { 'seam-push': { device: 'louvre', beats: 0.75, params: { n: 1, stagger: 0 } } },
  wipe: { 'wipe-line': { device: 'wipe-line', beats: 2, params: {} } },
  branch: { 'split-branch': { device: 'split-branch', beats: 2, params: { stage: 0.5 } } },
  slide: { 'diff-slider': { device: 'diff-slider', beats: 2, params: {} } },
};
export const DEFAULTS = { open: 'split-open', change: 'louvre', push: 'seam-push', wipe: 'wipe-line', branch: 'split-branch', slide: 'diff-slider' };

// moveOf(content, role) → { id, device, beats, params } for the adapter content.moves picks, or the default (Node-safe)
export const moveOf = (content, role) => {
  const id = content?.moves?.[role] ?? DEFAULTS[role];
  const a = ADAPTERS[role]?.[id];
  if (!a) throw new Error(`moves.${role}: '${id}' is not in moves.js ADAPTERS.${role} (${Object.keys(ADAPTERS[role] ?? {}).join(', ')})`);
  return { id, ...a };
};

// the T2 devices the adapters declare (timing.rules.js lists them, so lib/fit.mjs knows the template's own)
export const DEVICES = [...new Set(Object.values(ADAPTERS).flatMap((r) => Object.values(r).map((a) => a.device)))];

// createMove(content, role, params) → { device, beats, draw(ctx, p), speed(p) } over the runtime's createHandoff.
// Painters in params may read the film's current time (film.js sets it before each frame); the move never keeps state.
export const createMove = async (content, role, params) => {
  const a = moveOf(content, role), P = merge(a.params, params);
  if (!list.some((x) => x.name === a.device)) throw new Error(`moves.${role}: no hand-off "${a.device}" in lib/handoffs/ (update the film's lib from the skill's runtime)`);
  const h = await createHandoff(a.device, P);
  return { device: a.device, beats: a.beats, draw: (ctx, p) => h.draw(ctx, p, { blur: false }), speed: (p) => h.speed(p) };
};
