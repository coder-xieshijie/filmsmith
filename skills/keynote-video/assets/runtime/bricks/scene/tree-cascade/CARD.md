---
id: tree-cascade
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### tree-cascade

- **Purpose**: shows a structure growing out of one sentence: the prompt is typed and sent, and a tree is generated level by level, each link pulling its node out.
- **Intent**: Show a structure being born from one sentence: links pull nodes out level by level, so the viewer reads 'it builds the whole structure from what I asked', with the order of growth carrying the sense of structure.
- **Content**: One prompt (en ≤ 40 chars, zh ≤ 16) and 3–7 nodes in up to three levels (root, children, grandchildren), each a title (en ≤ 13, zh ≤ 5) and a meta line (en ≤ 16, zh ≤ 7); an optional status line.
- **Fits**: `demo`. **Not for**: more than seven nodes or three levels; trees whose shape matters in detail (it is a picture of "it builds the structure", not a diagram to study); an existing chart coming alive (this is a structure being born).
- **Layout and camera**: a prompt bar (1120 × 100) at the top; the tree below: root at y 372, two children at 608, up to four grandchildren at 852 (two to a parent); links are rounded elbows from port to port. The camera starts at 1.3 × on the bar (the prompt readable) and pulls back to 1 over 72 frames after sending; the tree breathes once (1.03) when complete. Not a screen recording: no window or sidebar, the camera moves with the cause (close on the words, back for the result), and links lead nodes with a glowing head, so growth reads as caused, not as a page loading.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `prompt` | text (typed) | primary | 1 | 8 words / 40 chars | 16 chars | Map how a film gets made / 画出一支片的制作流程 |
  | `nodes` | list of `{ title, meta }` (root first, then children, then grandchildren) | glance | 3–7 | title 2 words / 13 chars, meta 3 words / 16 chars | 5 / 7 chars | Film, Drafts, Renders, … |
  | `status` | text (optional; null: "N nodes · N−1 links") | glance | 1 | 5 words / 22 chars | 10 chars | counted |

- **Length**: about 12 beats (180 frames with a 32-character prompt); 10–14, longer with a longer prompt.
- **Steps and events**: the bar drops in 0–14; typing from 8 at an uneven human hand (a word gap holds longer, Chinese a character in about two); the rim turns accent when done and the send key presses 4 frames later; a dotted line drips to the root (submit + 6), root at submit + 14, each level 22 frames later, siblings 5 apart, links 10 frames ahead of their nodes (16 frames, ease out, a glowing head), nodes pop on a spring (14, 190) from their top port; the status replaces the send key 12 frames after the last node; breath 10 frames later.
- **Needs**: helper `springAt`; prop family `input-field` (the bar is drawn here, same structure); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `text`, `mono`.
- **Sound**: `accent` on send, `turn` as the root appears, small ticks per level, `stamp` on the status, `accent` on the breath.
- **Styles**: dark grounds suit it best; any. **Source**: adapted from video-shotcraft `demos/interaction/canvas-materialize-moves/DiagramCascadeBuild.tsx` (card `references/shots/interaction/canvas-materialize-moves.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (neutral-dark, the finished tree).
- **Differs from upstream**: the data-model table names, fields and key tags are node slots (a title and a meta line over a neutral skeleton row); the pink second accent is a lighter mix of the accent; the dust particles are dropped. Compare against `diagram-cascade`: pass (root and last node, 0 px, events ±0).
- **Pitfalls**: Grow level by level; all nodes at once loses the sense of structure, which comes from the order. Centre the final breath on the tree's visual weight, not the frame centre, or it reads as a whole-screen zoom. Do not use it to animate an existing chart; it means generation, not a diagram that is alive.
- **Sample**: `poster.jpg`, an English still 480 px wide.
