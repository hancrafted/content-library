---
type: research
title: 'Why does an agent eval need repeated trials, frozen inputs and replayed tool calls before two variants can be compared?'
description: 'One agent run is one draw and the world it calls drifts, so a score
  difference means something only with several trials per task on frozen tasks
  and replayed calls, paired by task with error bars.'
generated:
  by: copilot-cli/claude-opus-5
  at: 2026-10-30T23:55:00+01:00
stale_after: 2027-04-30T00:00:00+01:00
sources:
  - id: 1
    resource: docs/llm-wiki/research/LLM/LLM-0001__llm-output-nondeterminism/research.md
    title: 'Why do large language models give different answers to the same prompt?
      (earlier research file)'
  - id: 2
    resource: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
    title: 'Anthropic, Demystifying evals for AI agents'
  - id: 3
    resource: https://arxiv.org/abs/2602.07150
    title: 'Bjarnason, Silva, Monperrus, On Randomness in Agentic Evals'
  - id: 4
    resource: https://arxiv.org/abs/2406.12045
    title: 'Yao, Shinn, Razavi, Narasimhan, τ-bench: A Benchmark for Tool-Agent-User
      Interaction in Real-World Domains'
  - id: 5
    resource: https://arxiv.org/abs/2411.00640
    title: 'Miller, Adding Error Bars to Evals: A Statistical Approach to Language
      Model Evaluations'
  - id: 6
    resource: https://inspect.aisi.org.uk/metrics.html
    title: 'UK AI Security Institute, Inspect AI documentation: Scoring Metrics'
  - id: 7
    resource: https://www.anthropic.com/engineering/infrastructure-noise
    title: 'Anthropic, Quantifying infrastructure noise in agentic coding evals'
  - id: 8
    resource: https://arxiv.org/abs/2307.13854
    title: 'Zhou et al., WebArena: A Realistic Web Environment for Building Autonomous
      Agents'
  - id: 9
    resource: https://arxiv.org/abs/2403.07714
    title: 'Guo et al., StableToolBench: Towards Stable Large-Scale Benchmarking on
      Tool Learning of Large Language Models'
  - id: 10
    resource: https://inspect.aisi.org.uk/caching.html
    title: 'UK AI Security Institute, Inspect AI documentation: Caching'
---

# Why does an agent eval need repeated trials, frozen inputs and replayed tool calls before two variants can be compared?

## Context

Asked to ground the design of an eval harness in which each job's output is graded offline and two variants of a job (for example, with and without one context item) are compared by their score distributions. The question covers what makes two such scores comparable: how much one run varies, how many trials are needed, how inputs are frozen, and how tool calls and other live context are recorded and replayed. Why a model's output varies at all is covered by an earlier research file [1] and not repeated here.

## Answer

A single agent run is one draw from a distribution: the same task passes on one run and fails on the next, and on a coding benchmark single-run scores of one setup spread by several percentage points, as much as the differences people report as progress. So each variant needs several trials per task, scored as a per-task mean, and two variants are compared task by task on the same tasks, with a standard error on the difference; how many trials and tasks follows from the smallest difference worth detecting. Pass@k and pass^k answer different questions: the chance of at least one success in k trials, against success on all k. The comparison is fair only if everything except the variant holds still. The tasks, the environment's starting state and its resources are fixed, each trial starts clean, and anything live the agent consults, such as an API, a website or a search, either runs as a self-hosted copy or is served from a recording keyed on the exact request. A recording stays valid only while its key matches, and a call the recording lacks needs an explicit rule, because falling back to the live service lets the world's drift leak into the score.

## Findings

1. Anthropic defines a trial as one attempt at a task and runs several per task "because model outputs vary between runs"; each task has its own success rate, and a task that passed on one eval run can fail on the next [2].
2. Across 60,000 trajectories on SWE-bench Verified, three models and two scaffolds, single-run pass@1 estimates varied by 2.2 to 6.0 percentage points depending on which run was picked, with standard deviations above 1.5 points even at temperature 0, so reported gains of 2 to 3 points may be noise [3].
3. In that study, trajectories diverged early, often within the first few percent of tokens, and the small differences cascaded into different solution strategies [3].
4. The same authors recommend estimating pass@1 from several independent runs per task, choosing the number of runs by statistical power analysis, and reporting pass@k and pass^k as optimistic and pessimistic bounds [3].
5. τ-bench defines pass^k as the chance that all k independent trials of a task succeed, averaged over tasks, and gives unbiased estimates from n trials with c successes: pass^k = E[C(c,k)/C(n,k)] and pass@k = 1 − E[C(n−c,k)/C(n,k)] [4].
6. On τ-bench's retail domain, gpt-4o succeeded on under 50% of tasks, and its pass^8 fell below 25% [4]. Anthropic's example: at 75% per-trial success, three trials all pass about 42% of the time [2].
7. Anthropic recommends pass@k where one success is enough and pass^k where an agent must behave the same way every time [2].
8. Treating eval questions as a sample from a larger population of questions, the standard error of the mean score is √(Var(s)/n), and for pass/fail scores √(p(1−p)/n); a 95% interval is the mean ± 1.96 standard errors [5].
9. Running each question K times and scoring it by the mean of the K answers divides the question's own run-to-run variance by K; once that term is small next to the spread in difficulty between questions, more trials barely help. Pooling all K×n answers as if independent gives an inconsistent standard error [5].
10. When questions come in related groups, the standard error must be clustered; on real evals clustered errors were up to three times the naive ones [5].
11. Comparing two models on the same questions, the standard error of the per-question differences (a paired analysis) is smaller than combining two separate standard errors, whenever the models agree on which questions are hard [5].
12. The number of questions needed to detect a difference δ is n = (z_α/2 + z_β)² (ω² + σ²_A/K_A + σ²_B/K_B) / δ²; in a worked example, detecting 3 points with 80% power needed about 1,000 questions [5].
13. The same paper advises against lowering sampling temperature to reduce variance unless that temperature is what is being studied, because it can move variance into a form more trials cannot reduce, or bias the score [5].
14. Anthropic notes that early in an agent's development a change often has a large effect, so 20 to 50 tasks drawn from real failures are enough; a mature agent needs more tasks to detect smaller effects [2].
15. Inspect AI runs each sample for a set number of epochs and, by default, reduces each sample's epoch scores to their mean before computing metrics; other reducers include mode, majority and at-least-n. Its built-in metrics include a standard error, confidence intervals that accept clusters, and a Wilson interval for pass/fail scores [6].
16. Anthropic asks for an eval agent that works like the production agent, in an environment that adds no noise of its own: each trial starts from a clean environment, because shared state such as leftover files, cached data or exhausted resources causes correlated failures, and in one case an agent gained an unfair advantage by reading the git history of earlier trials [2].
17. Anthropic recommends tracking latency, token use and cost on "a static bank of tasks", and warns that for research agents "ground truth shifts as reference content changes constantly" [2].
18. On Terminal-Bench 2.0, with the same model, harness and tasks, changing only the container's resource limits moved the success rate by 6 percentage points (p < 0.01); on SWE-bench the effect was 1.54 points between 1x and 5x the RAM [7].
19. Those authors report anecdotally that pass rates vary with time of day as API latency changes, treat the resource configuration as an experimental variable to document and control, and suggest treating leaderboard gaps under 3 points with suspicion until the configurations match [7].
20. WebArena makes web-agent evaluation reproducible by self-hosting fully functional websites rather than using the live web [8].
21. In ToolBench, only 44.4% of real API calls succeeded when re-run later, the rest mostly unavailable or unauthorised, which made scores irreproducible over time [9].
22. StableToolBench replaces the live APIs with a virtual API server: each call is looked up in a cache by endpoint and arguments; on a hit the stored response is returned, on a miss the real API is tried, and when that fails an LLM simulates the API from its documentation and cached examples; every response is written back to the cache [9].
23. With half the APIs made unavailable, scores on the virtual server stayed within run-to-run variance, but the simulator itself runs on a model that may change under the same version name [9].
24. Inspect AI's model-output cache serves a response only when the model name, message history, epoch number, generation settings and active tools all match; a model alias rather than a dated model version keeps serving old entries after the model behind the alias changes, and each epoch gets its own cache entry by default so trials stay distinct [10].
25. The same documentation recommends the cache when iterating on a scorer, so the graded outputs stay fixed while the grading changes [10].

## Caveats

No source here studies record-and-replay of an agent's tool calls as an eval practice in general; Findings 22 to 25 describe one benchmark's API server and one framework's model-output cache, so the Answer's rule that a replay miss needs an explicit policy is an inference from them. StableToolBench's fallback to the live API and then a simulator trades strict replay for coverage, which suits a benchmark but would let an unrecorded call change a variant comparison. The variance figures come from coding and customer-service benchmarks; other kinds of agent tasks may vary more or less. The power formula and the 1,000-question example in [5] rest on stated assumptions about question difficulty and model correlation, not on measured agent data. Inspect AI's documentation describes a framework that changes often, and the On Randomness paper [3] is a 2026 preprint.

[1]: docs/llm-wiki/research/LLM/LLM-0001__llm-output-nondeterminism/research.md 'Why do large language models give different answers to the same prompt? (earlier research file)'
[2]: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents 'Anthropic, Demystifying evals for AI agents'
[3]: https://arxiv.org/abs/2602.07150 'Bjarnason, Silva, Monperrus, On Randomness in Agentic Evals'
[4]: https://arxiv.org/abs/2406.12045 'Yao, Shinn, Razavi, Narasimhan, τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains'
[5]: https://arxiv.org/abs/2411.00640 'Miller, Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations'
[6]: https://inspect.aisi.org.uk/metrics.html 'UK AI Security Institute, Inspect AI documentation: Scoring Metrics'
[7]: https://www.anthropic.com/engineering/infrastructure-noise 'Anthropic, Quantifying infrastructure noise in agentic coding evals'
[8]: https://arxiv.org/abs/2307.13854 'Zhou et al., WebArena: A Realistic Web Environment for Building Autonomous Agents'
[9]: https://arxiv.org/abs/2403.07714 'Guo et al., StableToolBench: Towards Stable Large-Scale Benchmarking on Tool Learning of Large Language Models'
[10]: https://inspect.aisi.org.uk/caching.html 'UK AI Security Institute, Inspect AI documentation: Caching'
