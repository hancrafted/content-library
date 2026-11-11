# Adversarial review of plan-05 (queueing-network engine)

Verdict: sound with fixes. The direction (stochastic open network, unbounded backlog, spawn rules) is right. The stability contract, the time base and the run-length queue are wrong as written. Experiments: `/private/tmp/claude-501/-Users-han-Developer-content-library/5d29bb73-a311-444f-aeda-75218d59632b/scratchpad/adversary/q.mjs` (single-server sim, 1000 seeds) and `tr.mjs` (mean-field traffic solve of tire at Realistic).

## Findings, by severity

1. **The "spectral radius < 1" guarantee is the wrong check (A).** Fan-out and churn are feed-forward multipliers, and a feed-forward chain has spectral radius 0 however much it amplifies. Overload is per station: ρᵢ = λᵢ/(μᵢ·eff) must be < 1, where λᵢ comes from the traffic equations at the Realistic dials. Only the complaint cycle (dock to support to pm to dock) is a true loop. Quality is also a persistent type (`min(qIn, roll)`), so the matrix must be over (center, quality), not per center.
   Evidence from `tr.mjs`, tire with the YAML's Realistic dials, rework .6, churn 1.8:
   - Sized at ρ_ideal .7, ρ at Realistic is pm 1.2, ba 1.7, eng 2.7, ops 2.6, doc 3.5. Realistic never settles, while the plan's gate (loop gain only) would pass it.
   - Even with churn removed, the YAML's efficiencies (eng 62 %, doc 60 %) give ρ = .7/.62 = 1.13 and 1.17. The efficiencies alone break it.
   Fix: replace check 7 with "every ρᵢ < 1 (person clusters: Σρ < 1) at Realistic, solved on the (center, quality) mean-field system". Make the target in section 1 a node test over all four YAMLs. Retune the YAMLs: churn and `messy` efficiency need ≥ ~.78 per center for ρ ≤ .9, or ρ_ideal must drop to ~.6.

2. **State-dependent rework destabilises (A).** An inspection's rework probability falls as its backlog grows. Backlog up means more bad work forwarded, which means more churn downstream. That is positive feedback, and a fixed-dial check cannot see it. Fix: evaluate the stability check at the worst case (pass-through 100 %, rework 0 at that center) as well as at nominal. Document that Jackson product-form results do not apply (batch fan-out, BAS, priority rework, non-exponential service). Little's law still holds. Kingman is a heuristic only.

3. **The AI preset contradicts the fan-out rule (E).** Q54 promises "~2.5× output". With `aiFan` sales/pm/ba/eng = 2 and ops 1.5, the chain multiplies by 24. In `tr.mjs`, Ideal + AI-all gives dock 456/week against 18, a 25× increase, and ρ of eng 3.6, ops 5.6, doc 9.3. "Downstream capacity matched" then needs the efficiency dial at roughly 1000 % everywhere. Fix: decide whether AI fan-out multiplies per hop (a flood, which is the lesson) or not. State the intended dock multiple and test it in section 5.

4. **The time base is inconsistent (C).** The plan says "1 week = 8 sim-seconds, DT = 1/60, 1×/2×/5×/10× = 1/2/5/10 steps per frame" and also "1× = 16 real seconds a week". 1 step per frame is 8 s/week (480 steps/week). The current code gets 16 s via `acc += dt·speed·SPEED_1X` (`50-ui.js frame()`). Fixed steps per frame also tie simulated time to refresh rate: a 120 Hz display runs 2× fast. Fix: keep the accumulator with real dt and define speed as weeks per real second (1× = 0.0625, 10× = 0.625). Cap steps per frame, and drop the sim to a lower rate rather than spiral when late.

5. **Service times quantised to steps break the 1000 % dial (C).** At 1000 % with AI, mean service is ~2 steps. Rounding to whole steps gives ±20 % capacity error and ρ_actual ≠ ρ_nominal. Fix: event-time engine. A server finishes whenever `completeAt ≤ t`, looping within a step with the remainder carried. Do not quantise.

6. **Run-length backlog does not compress (C).** The run key `{q, ai, flags, count, enqT}` includes `enqT`, which is distinct for each Poisson arrival, so runs never merge and 10⁵ jobs cost 10⁵ runs. Fix: bucket `enqT` per week (or store only the oldest `enqT` per run). Use a real ring-buffer deque. The current `queue.shift()` and `unshift()` in `serve()` and `arriveBack()` are O(n) in V8, and `step()`'s `queue.filter(d => d.edge === e)` is O(n) per belt per step and must be deleted.

7. **Check 2 is flaky, and Realistic hides the pile-up (B, D).** In `q.mjs`, 1000 seeds, 200 weeks, check-2's rule (max of weeks 150–200 ≤ 1.5 × max of weeks 100–150) passes for only 79 % of seeds at ρ .7, 82 % at ρ .9 and 80 % at ρ .95. It passes for one seed and fails for the next; a stable system fails it a fifth of the time. Fix: compare batch means or time-averages with a tolerance, and never use a max statistic.
   Stationary backlog at ρ .9 (Lq ≈ ρ²/(1−ρ)·(ca²+cs²)/2 ≈ 4.4): p50 3, p95 14, p99 22 jobs. The amber threshold is 2 weeks of work (L/μ ≈ 13 jobs): reached 6 % of the time. Red (4 weeks, ~27 jobs): essentially never at .9, 5 % at .95. So a settled Realistic shows a stack of 3–4 documents, and the pile-up Han liked appears only when ρ > 1 (AI, upstream dials). That is correct teaching, but the plan's goal line ("the bottleneck has a growing backlog") and the thresholds must say so. Consider amber at 1 week and red at 2.

8. **Time scale (B).**
   - From empty at ρ .9, the mean wait is 2.6 jobs at week 5, 3.6 at week 15, 4.0 at week 30 and 4.3 at week 60. At ρ .95 it is 3.2, 4.9, 6.7 and 8.1, against a stationary ~9.8, so 30 weeks of warm-up covers ~68 % and the preset picture is still transient.
   - At 1× (16 s/week), one to two minutes is 4–7 weeks. A viewer sees arrivals and a 2–3 job stack, not "settling".
   - "Ideal drains in ~10 weeks" holds only for B ≤ 3μ (drain 0.3μ per week). Check 4 is marginal: Realistic with upstream 200 % and AI for 15 weeks gives ρ ≥ 1.4 downstream, so B ≈ 6μ, which is 20 weeks at best. With AI fan-out (finding 3) it is ≥ 100 weeks. Han's original complaint therefore remains true for AI-all.
   - Fix: default to 5×, show the weeks counter prominently, warm-up ≥ 60 weeks (or analytic initial backlog), and say the honest drain time. Also say that raising the bottleneck's efficiency is the fast remedy: drain at (eff·μ − λ).

9. **Little's-law lead time is noisy and invalid in transients (D).** The decayed rate estimator has relative standard deviation 1/√(2λτ), about 20 % at λ=6 and τ=2 weeks, and about 50 % for support at 1–2 per week. W = L/X also lies whenever L is changing, which is exactly the congestion case. Fix: show "weeks of work waiting" = L/μ_eff, which the plan already computes for the colours, as the primary number. Show Little's W only when stationary.

10. **Aggregation (D, C).** The plan merges only consecutive documents with the same marks, but with 50 % bad and AI mixed in, runs are short and nothing merges. Merge by a mark-key bucket, and say the belt shows saturated density plus a "×n" badge so the flood is visible. Count at the worst dials: ~6,400 docs/s of real time at 10× AI-all and 1000 %, so ~100 per frame, and ~2,500 in flight before aggregation, which is only ~25k updates/frame. CPU is fine; the cost is garbage from per-document objects. Caps: pool transit objects, at most ~600 drawn sprites, at most 4,000 transit tokens (above that, count only), and at most 200 emitted docs per center per step with the remainder carried as a count. `warm()` at 30 weeks is 14,400 steps and should be chunked off the main frame.

11. **Spawn rules cannot express exclusive splits (E).** `teams.yaml` has pm to anA and engB with `share: 0.5` each (a split). `spawns: [{to,p}]` is independent Bernoulli per target, which can send to both or neither. Add `choose: [{to, w}]`. Also note that shared-person selection uses `qDocs/buffer`, which is undefined with unlimited buffers. State the policy (oldest first, or longest work-backlog).

12. **Determinism (D).** Use separate seeded streams for arrivals, service and routing. Otherwise toggling Steady/Random or AI reshuffles everything and the compare view is not common-random-numbers. Say that check 6 holds only for an identical dial sequence.

13. **ADR and test gaps (E).**
   - ADR-0024 items 4, 5 (bounded queues, return belts), 7 (bands) and 8 (belts file format) are contradicted by the plan, and the plan has no "supersede ADR" item (Q66 asks for one).
   - Check 8 (Chrome p95) does not run in `npm run verify`, which is fine, but name the node cases as the fast suite.
   - Add a test for ρᵢ < 1 over all four YAMLs.
   - Add a test for a mid-run dial change leaving state conserved (jobs in = out + backlog).
   - Add a test that "Clear" has no warm-up.
