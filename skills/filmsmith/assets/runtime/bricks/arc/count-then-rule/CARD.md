---
id: count-then-rule
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### count-then-rule

- **Tells**: a question asked in a terminal → the work read and counted → sorted into the answer (repeat per question) → the count reverses a belief → a figure proves it → the rule, marked by hand and by the stamp → the recap of the figures.
- **Intent**: Earn a rule by counting first.
- **Fits / does not fit**: narrated explainers of 1–4 minutes that argue from a count. Not: music films, mechanisms.
- **Slots**: hook 6–12 s term-count · problem 5–10 s wall-ledger · demo 10–30 s × 1–3 pile-split · turn 4–10 s session-queue · proof 8–25 s (peak) · claim 6–20 s hand-mark and seal-stamp (peak) · rest 2–6 s optional · lockup 6–15 s; 60–240 s, 2–4 peaks; the bed narration-pad throughout (pad-only, outro on the lock-up).
- **Role mapping**: the explainer's question → hook, its count → problem, the sort → demo, the reversal (who waits for whom) → turn, its figure → proof, the rule → claim, the recap → lockup. "Mechanism" and "recap" have no role of their own in SPEC 3.6.
- **Example films**: the terminal-ledger sample (the source film, 191.9 s): question 0–9.7, count 9.7–15.8, sort 15.8–28, who waits 28–54, then the second count, the rule and the recap.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (the source film, de.js, ez.js; the source film), split from terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: The rule comes after the count.
