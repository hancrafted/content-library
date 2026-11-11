# Grill, round 5 (2026-11-11): Q46–Q66, Han's answers

Facts found in Chrome before the grill: Messy is unstable (support arrivals 20.7/wk vs 16.2/wk done; support→pm and dock→support belts grow without bound); belts are unbounded hidden buffers; capacity is sized for balance at 78 % utilisation, so recovery from congestion takes ~150 simulated weeks (~40 min at 1×); efficiency tops at 200 %; the return belt `ret` toggles 80×/4 s in balance; toolbar aria-pressed re-renders every frame.

- Q46 Engine: keep seeded time-stepped; rebuild as an open queueing network with stochastic service. — "ok, keep 60fps performance in mind"
- Q47 Queues: unlimited backlog per work center by default, optional `buffer:` (BAS) in YAML; belts carry only documents in transit. — ok
- Q48 Stability targets: Ideal ρ≈0.7; Realistic ρ≈0.9–0.95 at one bottleneck, all loop gains <1; AI upstream drives downstream ρ>1; back to Ideal drains in ~10 weeks. — "ok, if time passing is a think, show a counter like 1d, 2d, 3, ..."
- Q49 Efficiency 10–1000 %, log slider. — ok
- Q50 Belts become spawn rules: `spawns: [{ to, n | p }]` per work center (eng → 1 release; ops → ship + p0.5 doc task; doc → ship; support → answer + p0.1 bug to PM + p0.2 billing). ops→support and doc→support belts go. — ok
- Q51 Both customer nodes get a dial: orders/week (left), support requests/week (right) plus complaints on top. — "yes, but i want a mode which inputs linear and one which is model by queuing system as entry probablity? like a laplac distriubtion? so that work enters "randomly" faster or slower"
- Q52 Stage 30 % taller, three rows, cards ~20 % larger. — "ok, check the browser yourself. if could be full 80vh, only the tool bar should be visible"
- Q53 Replace the restarting ring. — "i like seeing the progress of a file until it moves out, it's just the blinking ui i don't want. give me a few options. one i just fancied was the doc move in, a dice "rolles" and the result of the dice is the result icon that the doc received, could be too much motion..."
- Q54 Last preset per use case "AI, balanced": AI everywhere, effectiveness ideal, downstream capacity matched, ~2.5× output, 100 % satisfied. — ok
- Q55 Swing/Roles: five cards per row, tire-swing panel per card, artefacts shown, tasks and "with AI" hidden. — ok
- Q56 Rename Balance → Ideal, Messy → Realistic, slider Ideal…Realistic, dock "relative to ideal". — ok
- Q57 Clear (empty factory, week 0, current settings) after Pause; speeds 1×, 2×, 5×, 10×. — ok
- Q58 Queueing metrics (utilisation busy/starved/blocked, backlog, throughput, lead time by Little's law). — "in progressive disclosure or settings, not directly as not everyone knows queing theory"
- Q59 Clock "Week n · Day d" (working days) beside the speed buttons; Clear resets it. — ok
- Q60 Arrivals per customer: Steady (every 1/λ) or Random (Poisson); Random default in Realistic, Steady in Ideal. — ok
- Q61 Service time per center in YAML: normal CV 0.3 default, exponential option; Ideal uses steady service. — ok
- Q62 Processing animation options A filling doc (default), B bar that fades, C dice (falls back to A at ≥2×), D fill + stamp. — ok
- Q63 Backlog: stack of ≤5 docs + "+n" chip, amber > ~2 weeks of work, red > 4, lead time on hover. — ok
- Q64 Dashboard unchanged on top; collapsed "How it flows" holds the queueing metrics with plain-word lines. — ok
- Q65 Floor fills the viewport below a sticky toolbar (~80vh); scales below ~1100 px. — ok
- Q66 Record in design-ADR and guide, designer round 5, I check in Chrome (layout 1440/1100, MutationObserver blink count, the four model cases), report. — ok, "before we start, create a plan and let a adversiral agent review it"

## After the adversarial review (plan-05-review.md)

- Q67 AI fan-out per hop vs "AI, balanced" ~2.5×. — "AI, balanced, should basically result in output 2 or 3x at the end and all nodes upstream adjusted (e.g. engineering AI turned on) so we still have >95% +-5 satisfactory"
- Q68 Realistic: A busy but coping (stable ρ≈0.9, amber at 1 week of work, red at 2) vs B slowly sinking. — explained in plain words, then "ok" (A)
- Q69 Default speed 5×, warm-up 60 weeks, honest drain times, hint to raise the bottleneck's efficiency. — ok
- Q70 `choose: [{ to, w }]` exclusive split; a shared person serves the center with the most waiting work. — ok
- Q71 Update plan and design-ADR (supersede 4, 5, 7, 8), commit, designer round 5, verify in Chrome. — ok
- Q72 — "AI everywhere => AI, unbalanced the use case where for example only engineers use it to produce code, which does not increase overall output but causes bottlenecks"
  Read as: the preset row becomes Swing, Roles, Ideal, Realistic, AI unbalanced (AI at engineering only: dock output ≈1×, Operations becomes the bottleneck), AI compare (same, in the compare stream), AI balanced (AI on wherever needed, capacities matched: dock 2–3× at 95 % ± 5 satisfied). "AI everywhere" as its own preset goes; per-role AI fan-out is tuned so these bands hold, pinned by tests.
