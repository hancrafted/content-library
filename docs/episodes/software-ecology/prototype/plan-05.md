# Plan, prototype round 5: a queueing-network engine

Inputs: `feedback-05.md` (Han's notes, verbatim), `grill-05.md` (Q46–Q66 settled), design-ADR `docs/adr/0024-software-ecology-flow-model-and-use-case-files.md`, current prototype `flow.html` built from `proto3/src/*.js` (scratchpad, `node build.mjs`).

Goal: a model whose behaviour a viewer can predict from queueing intuition (the bottleneck has a growing backlog; relieve it and the backlog drains and the bottleneck moves), presented without queueing vocabulary up front, at 60 fps under every dial setting.

## 1. Engine (`30-model.js` rewritten; pure, no DOM)

**Structure: an open Jackson-style network, time-stepped.**

- **Nodes.** Two sources (orders customer, support customer), work centers, one sink (the dock). A work center has one server per person (shared people keep the current `person:` clusters), a capacity μ in jobs/week, and a backlog.
- **Arrivals per source.** Rate λ in jobs/week from the customer's dial. Steady: one job every 1/λ. Random: Poisson, inter-arrival ~ Exp(λ). Ideal defaults to Steady, Realistic to Random.
- **Service.** Service time per job = size / (μ · eff · AI). Sampled as Normal(mean, CV·mean), truncated at 0.1·mean, CV 0.3 by default, or Exp(mean) where the YAML says `service: exponential`. Ideal uses deterministic service. Size: 1, ×1.2 for AI-made inputs, ×(1+extra) for bad inputs (extra work).
- **Routing: spawn rules (replaces belt shares).** A finished job emits `spawns: [{ to, n } | { to, p }]`. `n` is a fixed count and `p` a Bernoulli chance. Each spawned document is multiplied by fan-out (AI raises it) and, when the input was bad and kept, by churn. `to: dock` ships. Quality per document: worse of input and a roll against effectiveness.
- **Rework.** A bad input is sent back to the sender's backlog front with probability `rework` (an inspection's chance falls as its backlog fills: passing unread, as now). The rework job carries a fresh roll.
- **Complaints.** A bad shipment becomes a support job with probability `complaints` (from the dock to Support).
- **Backlog.** Unlimited by default. Optional `buffer: n` blocks the sender after service (BAS): the finished job stays parked on the sender, which then cannot start the next. Backlog storage is **run-length**: a deque of `{ q, ai, flags, count, enqT }`, so 10⁵ waiting jobs cost a few runs, not 10⁵ objects. A rework job pushes a run on the front.
- **Clock.** Fixed DT = 1/60 sim-second, seeded mulberry32. One week = 8 sim-seconds (5 working days). Speeds 1×, 2×, 5×, 10× run 1, 2, 5, 10 steps per 60 Hz frame (1× = 16 real seconds a week as now; reconsider if too slow). Clear rebuilds the state with the same seed at week 0 with no warm-up; presets warm up 30 weeks.

**Sizing (the stability contract).** At load, solve the traffic equations λᵢ = γᵢ + Σⱼ λⱼ·E[spawnsⱼ→ᵢ] for Ideal (effectiveness 100, so no rework, churn or complaints), by fixed-point iteration. Set μᵢ = λᵢ / ρ_ideal with ρ_ideal = 0.7. Then:

- **Loop gain check.** The spectral radius of the expected-spawn matrix, including rework, churn and complaint paths at the use case's Realistic dials, must be < 1. If it is not, the YAML is refused with the loop named. This is the guarantee that Realistic settles.
- **Preset tuning.** Realistic messy dials are tuned per use case so one named center sits at ρ ≈ 0.9 and every other center at ≤ 0.85, checked by a node test that runs the model 200 weeks and asserts bounded backlogs.
- **Drain.** From any state, Ideal drains a backlog B at centre i at rate μᵢ(1-ρᵢ) = 0.3μᵢ per week. The target "~10 weeks" holds for B ≤ 3μᵢ; larger piles take longer, and the clock shows it.

**Efficiency dial** 10–1000 %, log slider. **AI** ×2.5 speed and ×role aiFan fan-out, quality unchanged (`aiq` setting kept).

**Readouts** from decayed rates (τ = 2 weeks): throughput X, utilisation split busy/starved/blocked, backlog L, lead time W = L/X (Little). Traffic light from ρ̂ = arrivals/capacity and the trend of L.

## 2. Transit and rendering (60 fps under any dials)

- Belts carry only documents in transit, with travel time = belt length / V. Nothing queues on a belt, except a BAS-parked job, which sits in its sender.
- **Visual cap per belt.** At most `floor(L / GAP)` sprites. When more documents enter a belt than fit, consecutive documents with the same marks merge into one sprite with a "×n" badge (aggregation), so the drawn count is bounded by geometry (~600 sprites for the whole floor) whatever the throughput. The model counts every document exactly; only the drawing aggregates.
- **Backlog at a station:** a stack of ≤ 5 sprites + "+n" chip, amber past 2 weeks of work (L/μ), red past 4.
- **Canvas:** document icons pre-rendered once per variant (good/bad/warning × AI × size) into an offscreen sprite sheet; per frame only `drawImage`. One canvas, cleared once per frame; paused when off-screen or tab hidden.
- **DOM:** station cards, chips, the clock and the toolbar update through a diff (write only when the text or class changes), readouts at 4 Hz, charts at 2 Hz. Fixes the per-frame `aria-pressed` writes and the return-belt toggle (hysteresis: a return belt shows while its rate > 0.3/week and hides below 0.1/week).
- **Budget,** checked at 10× with every efficiency at 1000 % and AI everywhere: model steps ≤ 3 ms per frame, draw ≤ 6 ms, no layout in the frame loop (no reads of `getBoundingClientRect` after writes).
- **Processing animation Options** (⋮ menu): A filling document (default), B bar that fades, C dice (A at ≥ 2×), D fill + stamp. A step of progress is a continuous value from the model; nothing restarts within a job.

## 3. UI changes

Stage ~80vh below a sticky toolbar, three rows, cards ~20 % larger, scaled below ~1100 px. Rename Balance→Ideal, Messy→Realistic. Clear after Pause; clock "Week n · Day d". Customer dashboards with rate dial and Steady/Random. Dashboard keeps light, signals, three charts; collapsed "How it flows" with utilisation, throughput, backlog, lead time in plain words. Swing/Roles five per row with panels and artefacts. Last preset "AI, balanced". Document icon Option A only.

## 4. Use-case files

`schema: software-ecology-factory/3`: `sources` (two customers, rate, arrivals), `centers[].spawns`, `centers[].service`, optional `buffer`, `bottleneck:` for Realistic. Belts are derived from spawns (one belt per from→to pair) with optional route hints. Tire swing spawns per Q50. Download/Upload round-trip kept.

## 5. Checks (node, headless, on the pure model)

1. Ideal, 200 weeks: every backlog ≤ 3, output = λ.
2. Realistic, 200 weeks: backlogs bounded (max of the last 50 weeks ≤ 1.5 × max of weeks 100–150), the named bottleneck has the largest.
3. AI upstream: the downstream backlog grows roughly linearly; upstream throughput up, dock output flat.
4. The congestion case: Realistic + upstream 200 % + AI for 15 weeks, then Ideal: backlogs ≤ 3 within 20 weeks.
5. Bottleneck shift: efficiency of the Realistic bottleneck → 1000 %; the largest backlog moves to its downstream neighbour.
6. Determinism: same seed and inputs give the same state hash after 100 weeks.
7. Loop-gain refusal: a YAML with gain ≥ 1 is refused naming the loop.
8. Perf, in Chrome: 10×, all 1000 %, AI all, 60 s: p95 frame time < 16.7 ms; MutationObserver: no attribute flips on idle elements.

## Revision after the adversarial review (plan-05-review.md, Q67–Q72)

Overrides the sections above where they differ.

1. **Stability contract.** Drop the spectral-radius check. At load, solve the traffic equations over (center, quality) at the Realistic dials, including rework, churn and complaint flows, once at nominal pass-through and once with every inspection passing 100 % unread. Refuse a use-case file unless every ρᵢ < 1 (a person cluster: Σρ < 1) in the nominal case; warn in the worst case. Node test over all four use cases. Retune Realistic dials so the named bottleneck sits at ρ ≈ 0.9, the rest ≤ 0.85.
2. **Realistic is "busy but coping"** (Q68 A). Backlog chip amber at ≥ 1 week of work (L/μ_eff), red at ≥ 2.
3. **Presets** (Q72): Swing, Roles, Ideal, Realistic, AI unbalanced (AI at engineering only, Realistic dials: dock output 0.9–1.2× ideal, Operations the bottleneck with ρ > 1), AI compare (same, opened in the compare stream), AI balanced (AI on where needed, effectiveness at ideal, capacities matched: dock 2–3× ideal at 95 % ± 5 satisfied, every ρ < 0.85). Per-role AI fan-out (`aiFan`) tuned so these bands hold; tests pin them.
4. **Time base.** Real-dt accumulator; speed in weeks per real second (1× = 1/16, 2×, 5× default, 10×); steps per frame capped at 40, excess sim time dropped and flagged. Job completion is event-time: `completeAt` is a float, a step completes every job with `completeAt ≤ t` and starts the next with the remainder.
5. **Backlog storage.** Ring-buffer deque of runs keyed by `{ q, ai, flags, week }` (enqueue time bucketed per week); rework pushes to the front. No `queue.filter` per frame.
6. **Transit and drawing.** Pooled transit objects; ≤ 4000 transit tokens (beyond that, counted only); ≤ 200 emitted documents per center per step, the rest carried as a count; drawn sprites ≤ 600, merged by mark key with a "×n" badge. `warm()` runs in chunks of ≤ 2000 steps across frames behind a "warming up" state.
7. **Randomness.** Separate seeded streams for arrivals, service and routing per node, so toggling AI or Steady/Random leaves the other streams unchanged.
8. **Routing.** `spawns` takes `{ to, n }`, `{ to, p }` and `choose: [{ to, w }]` (exactly one, weighted). A shared person serves the center with the most waiting work (L/μ).
9. **Readouts.** Primary: "weeks of work waiting" = L/μ_eff. Little's W only in "How it flows", shown only when the backlog trend is flat.
10. **Speed and drain.** Default 5×, presets warm up 60 weeks. The hint text says the honest drain time and names raising the bottleneck's efficiency as the fast remedy.
11. **Checks** (replace section 5's 2, 4 and 7): Realistic stable by batch means (5 batches of 40 weeks, the last batch mean within the 95 % band of the first four, over 20 seeds); congestion case drains to ≤ 1 week of work within 30 weeks after Ideal; ρᵢ < 1 for all four use cases; conservation (in = out + backlog + in transit) across a mid-run dial change; Clear starts empty at week 0; preset bands of point 3.
12. **Design-ADR.** Supersede decisions 4 (bounded queues), 5 (return belts as the rework sign), 7 (bands relative to balance), 8 (belts in the file) and 10 (preset names).
