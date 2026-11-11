---
type: research
title: 'Why do unclear requirements lead to rework and failed projects?'
description: 'Practitioners name incomplete requirements their top problem and
  report rework and overruns, but the famous failure rates and the 100x late-fix
  cost are disputed.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-10T16:54:59Z
stale_after: 2027-11-10T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/1611.10288
    title: 'Méndez Fernández et al., Naming the Pain in Requirements Engineering:
      Contemporary Problems, Causes, and Effects in Practice'
  - id: 2
    resource: https://www.cs.umd.edu/projects/SoftEng/ESEG/papers/82.78.pdf
    title: 'Boehm, Basili, Software Defect Reduction Top 10 List'
  - id: 3
    resource: https://arxiv.org/abs/1609.04886
    title: 'Menzies, Nichols, Shull, Layman, Are Delayed Issues Harder to Resolve?
      Revisiting Cost-to-Fix of Defects throughout the Lifecycle'
  - id: 4
    resource: https://www.cs.vu.nl/~x/the_rise_and_fall_of_the_chaos_report_figures.pdf
    title: 'Eveleens, Verhoef, The Rise and Fall of the Chaos Report Figures'
  - id: 5
    resource: docs/llm-wiki/research/AIE/AIE-0008__written-requirements-reduce-variance/research.md
    title: 'Why do explicit written requirements reduce the variation in LLM output?
      (earlier research file)'
---

# Why do unclear requirements lead to rework and failed projects?

## Context

Asked to support the claim that a vague requirement is paid for later, as rework, delay and sometimes a failed project, so that writing it clearly comes first. The question is about human software projects. How an AI treats an unclear requirement is a neighbouring question [5].

## Answer

Unclear requirements lead to rework because requirements specified in haste, then accommodated late, break the architecture, design and code already built on them [2]. Practitioners name incomplete or hidden requirements their most frequent requirements problem and report time overrun, rework after implementation and poor quality as its effects [1]. Avoidable rework is large: one often-cited estimate puts it at 40 to 50 percent of project effort [2]. The numbers that made requirements famous are disputed, though. The Standish CHAOS success and challenged rates are criticised as misleading measures [4], and the rule that a late fix costs 100 times more did not show up in a 171-project dataset [3].

## Findings

1. In a survey of 228 companies in 10 countries, incomplete and/or hidden requirements was the most cited requirements problem, named by 109 respondents (48%); communication flaws between team and customer followed at 41%, and moving targets and too-abstract requirements at 33% each [1].
2. Respondents asked about causes and effects of incomplete or hidden requirements most often cited time overrun (about 10% of reported effects), post-implementation rework (about 9%) and poor product quality (about 9%) [1].
3. Communication flaws with the customer were rated as leading to project failure more often than incomplete requirements, even though incomplete requirements occurred more often [1].
4. Boehm and Basili state that current software projects spend about 40 to 50 percent of their effort on avoidable rework, meaning effort spent fixing problems that could have been found earlier and fixed more cheaply, or avoided altogether [2].
5. The same list says a problem found after delivery is often 100 times more expensive to fix than one found in the requirements and design phase, and names hastily specified requirements as a major source of avoidable rework, because accommodating them late breaks architecture, design and code [2].
6. The 100x rule is contested: an analysis of 171 projects from 2006 to 2014 found no evidence for the delayed issue effect, fixes in later phases not being consistently or substantially costlier. The authors call it possibly "an historical relic" that holds only in certain kinds of projects [3].
7. The Standish CHAOS report of 1994 put project success at 16%, challenged at 53% and failed at 31% [4]. Eveleens and Verhoef applied Standish's definitions to 5,457 forecasts from 1,211 projects and found the definitions misleading, one-sided, harmful to estimation practice and the resulting figures meaningless for benchmarking, because success is defined only by on-time, on-budget, as-specified delivery [4].

## Caveats

- Finding 1 to 3 rest on self-reported survey answers coded by researchers; the authors name coding subjectivity as the main threat and could not check answers with the anonymous respondents. Frequency of a problem is not measured cost [1].
- The 40 to 50 percent figure in Boehm and Basili is a summary claim in a list article, not a new measurement, and it does not separate rework caused by requirements from rework caused by other defects [2].
- The late-fix dispute is not settled: [3] finds no uniform effect, not that early fixes are never cheaper. Both [2] and [3] concern defects in general, not requirements alone.
- [4] shows the CHAOS figures cannot be used as evidence; it does not show that requirements are not a major cause of failure. This file therefore does not use CHAOS percentages as support.
- Nothing here measures what a requirement written for AI saves. Applying the findings to AI-assisted work is an inference, partly supported by [5].

[1]: https://arxiv.org/abs/1611.10288 'Méndez Fernández et al., Naming the Pain in Requirements Engineering: Contemporary Problems, Causes, and Effects in Practice'
[2]: https://www.cs.umd.edu/projects/SoftEng/ESEG/papers/82.78.pdf 'Boehm, Basili, Software Defect Reduction Top 10 List'
[3]: https://arxiv.org/abs/1609.04886 'Menzies, Nichols, Shull, Layman, Are Delayed Issues Harder to Resolve? Revisiting Cost-to-Fix of Defects throughout the Lifecycle'
[4]: https://www.cs.vu.nl/~x/the_rise_and_fall_of_the_chaos_report_figures.pdf 'Eveleens, Verhoef, The Rise and Fall of the Chaos Report Figures'
[5]: docs/llm-wiki/research/AIE/AIE-0008__written-requirements-reduce-variance/research.md 'Why do explicit written requirements reduce the variation in LLM output? (earlier research file)'
