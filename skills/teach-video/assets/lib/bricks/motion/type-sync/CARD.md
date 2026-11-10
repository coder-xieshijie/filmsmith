---
id: type-sync
category: motion
tier: T0
family: mask-type
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### type-sync

- **Looks**: a line bound to a time track. `fill` (default): the line sits dim; word after word fills with the accent from left to right as it is read, a soft front leading, a short reading bar running under the word, and each word settles to ink after it is read. `pump`: a short word in a thin weight swells to black on every beat and springs back thin (the middle characters first), the downbeat wider and in the accent; the last hit lands bold in the accent.
- **Tier**: T0. **Family**: mask-type. **Surface**: canvas.
- **Use**: `fill` a line said by a voice-over or sung, read at its pace (teach films, lyric moments); `pump` one short word on the music's beat before a drop. **Not for**: silent passages (`fill` then reads as a random colour change, `pump` as a twitch); `fill` on more than two rows or six words a screen; `pump` on words over about 8 characters (4 Chinese), or more than one `pump` passage a film.
- **Intent**: The text keeps time with the sound: fill leads the eye word by word with the voice, pump makes the beat visible in the strokes.
- **Content**: fill: a line of up to six words (two rows at most) and its reading times, or a voice-over track to time it from; pump: one short word (≤ 8 chars) and the beats.
- **Parameters**: `from` the line unread (`fill`) or thin (`pump`), `to` the line read in ink or landed bold. `how` `'fill'` | `'pump'`; `text` (default the sample claim), `times` (reading windows per unit `[[start, end], …]` in beats; null = from the words: en 3.6 f per letter, zh 6 f per character, at least 12 f, 4 f gaps, 10 f between lines), `hits` 4 and `downbeats` [0] (`pump`, in beats of 15 f), `size` (en 120, zh 112), `weight` 750, `x` 960, `y` 520, `maxW` 1500, `bar` true, `probe` (a unit index added to `track()`, for the comparison). Roles read: `ink`, `dim` (unread), `accent` (fill, bar, downbeat).
- **Theory**: audio-visual synchrony binds what is seen to what is heard; the fill moves at the speed of the voice so the eye follows it (karaoke reading); a visual onset on each beat makes the beat visible (Lee, Forlizzi & Hudson 2002 on kinetic type).
- **Styles**: any; `pump` suits pulse and plakat.
- **Length and easing**: `fill` from the words (6 beats for the sample), range 3–10; front linear within each window, read-to-ink 10 f `EASE.out`, bar out 6 f. `pump` 4 + 15 × hits + 18 f; weight 250 → 900 decaying over 9 f (+1.6 f per character from the centre), last hit 780 after a 13 f decay.
- **Sound**: `tick` per word start (`fill`, quiet); `hit` per beat and `land` on the last (`pump`).
- **Merged from**: `font-weight-pump` (`pump`).
- **Source**: adapted from video-shotcraft `demos/typography/type-rhythm-sync/KaraokeFillSync.tsx` (card `references/shots/typography/type-rhythm-sync.md`) and `demos/typography/type-rhythm-sync/FontWeightPump.tsx` (card `references/shots/typography/type-rhythm-sync.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: Chinese fills phrase by phrase at Chinese reading speed (about 6 characters a second); `pump` changes the weight of each character of the variable Chinese face, pinned in the slot it takes at the peak weight so the line never reflows.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: one accent (upstream a two-hue gradient on the drop); no echo rows, sequencer cells, waveform or brand slogan; the reading times come from the words or from `times`, not fixed frames. Compare (`fill`, against `karaoke-fill-sync`, with upstream's word times passed as `times`): waived on `eventFrames` only: the fill is linear, so the peak-speed frame is any frame of the plateau (upstream 58, brick 49 at the same 9.1 px/f); track 2.4 px, progress RMSE 0.003. `pump` is not compared.
- **Pitfalls**: Both ways depend on sound: pump hits must land on the drum frame, fill windows must follow the voice's word boundaries. pump needs a variable font; without one the weight jumps in steps. One pump passage a film; it steals every scene it is in.
