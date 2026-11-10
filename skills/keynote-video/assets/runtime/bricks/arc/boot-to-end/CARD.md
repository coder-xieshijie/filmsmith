---
id: boot-to-end
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### boot-to-end

- **Tells**: one terminal session: the failure, the claim, the tool at work, how to start, the promise, the prompt again
- **Intent**: One terminal session from the failing command to the URL, the cursor opening and closing it.
- **Fits / does not fit**: CLI, agent, CI and infrastructure launches of 30–75 s. Not: Products without a command line; films under 25 s (use boot → end, a 10 s sting).
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 5–9 | 1 | prompt-boot | hook | intro |
  | `claim` | 3–6 | 1 | horizon-hero | claim | build |
  | `turn` | 1.5–3 | 1–4 | chapter-card | – | build |
  | `demo` | 3–8 | 1–4 | qa-pick, decide-confirm, hub-flow, party-count | – | drop |
  | `proof` | 3–7 | 0–2 | you-ends, party-count | – | drop |
  | `rest` | 4–7 | 1 (optional) | install-cards | – | break |
  | `climax` | 4–6 | 1 | slit-tagline | claim | drop |
  | `lockup` | 4–6 | 1 | cursor-lockup | – | outro |

- **Length**: 30–75 s; peaks 2–3; sound bed `phosphor-bed`.
- **Climax**: the tagline's slit (80–90 % of the film).
- **Example films**: the phosphor template's example (the phosphor demo film); a recomposed segment in the phosphor recipe.
- **Source**: own (`assets/templates/phosphor/content.js; the phosphor demo film; references/modes/phosphor.md (use cases)`), split from the phosphor style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Chinese pages read longer: the 43 s reseed demo runs about 55 s in Chinese.
