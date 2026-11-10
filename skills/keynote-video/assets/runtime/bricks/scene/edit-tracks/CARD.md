---
id: edit-tracks
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### edit-tracks

- **Purpose**: The tracks link: the ground floods out of the line, four named track rows land, clips slide in where this film's links, shots and stages really sit, and the playhead sweeps to the centre and grows to full height.
- **Intent**: Show the film as its own timeline, with the playhead that becomes the next line.
- **Content**: Four track names (≤ 12 characters each).
- **Fits**: `demo`; A reel's edit step: picture and sound on one clock. **Not for**: Tracks that are not the film's own; more than four rows.
- **Layout and camera**: rows x 300–1620 from y 360, 110 apart, 56 high; names 26 px mono above each row.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `tracks` | list of text | glance | 4–4 | 2 words, 12 chars | 4 chars | ["SHOTS","GL PASSES","MUSIC","TITLES"] / ["镜头","GL 通道","音乐","字幕"] |
  | `stage` | group | – (optional) | 1 | – | – | {"name":"Cut","note":"sound and picture … / {"name":"剪辑","note":"声画共用一个时钟"} |

- **Length**: 4–8 beats (2–4 s at 120 BPM); about 1.5 bars.; the sample plans 8 beats in English, 8 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: ground floods out 0–0.3 u; rows from 0.2 u; clips from 0.45 u (ω 20); playhead sweeps over the last 1.0 u and grows to full height over the last 0.3 u.
- **Needs**: motions none; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: plucks on the clips, a whoosh on the sweep.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js tracks, clips, TR`), split from the thread style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: The sound row is the beat grid, not the mix's real envelope. Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).
