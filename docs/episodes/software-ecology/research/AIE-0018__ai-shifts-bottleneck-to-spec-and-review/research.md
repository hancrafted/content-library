---
type: research
title: 'Why does AI-assisted execution move the bottleneck to specification and review?'
description: 'AI speeds up execution but the saved time is re-spent on verification, and review load rises with no company-level gain; the specification half is inferred, not measured.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-10T00:00:00Z
stale_after: 2027-05-10T00:00:00Z
sources:
  - id: 1
    resource: https://dora.dev/insights/balancing-ai-tensions/
    title: 'DORA, Balancing AI tensions'
  - id: 2
    resource: https://www.faros.ai/blog/ai-software-engineering
    title: 'Faros AI, The AI Productivity Paradox Report 2025 (23 July 2025)'
  - id: 3
    resource: https://dora.dev/research/2025/dora-report/
    title: 'DORA, State of AI-assisted Software Development 2025 (overview page)'
  - id: 4
    resource: docs/llm-wiki/research/LLM/LLM-0019__ai-productivity-ceiling-per-level/research.md
    title: 'content-library research, Why do measured AI productivity gains fall short of the ceilings claimed for prompting, agents, workflows and a factory?'
  - id: 5
    resource: docs/episodes/ai-gives-you-more-work/research/AIE-0015__ai-users-execute-instead-of-manage/research.md
    title: 'content-library research, Why do people working with AI keep executing the work themselves instead of managing it?'
---

# Why does AI-assisted execution move the bottleneck to specification and review?

## Context

Asked to support the claim that when AI makes the doing of a task faster, the limit on an organization's output moves to the steps around it: stating what is wanted, and checking what came back. The question covers software delivery, where the studies are, and is scoped to what field data and surveys show about where the time goes.

## Answer

When AI speeds up the execution step, the saved time is re-spent on verification, and the work moves from authors to reviewers: Google engineers report that checking AI output is a harder task than creating it, and a telemetry study of over 10,000 developers found 91% longer review time and 154% larger pull requests on high-adoption teams, with no significant company-level delivery gain. The review half is therefore supported. The specification half is not measured: no source read shows that unclear specifications are what limits the AI-sped execution, so it rests on the inference that the author who hands over a task is the one who must say what is wanted. Both studies are associations, not trials.

## Findings

1. Google engineers (1,110 open-ended answers, Q3 2025) report that "the time saved in creation is frequently re-allocated to auditing and verification", and that "verification is a fundamentally different cognitive task than creation" [1].
2. DORA's analysis says the work moves from authors to reviewers: "velocity gains for an individual author frequently translate into a significantly increased cognitive load" on the reviewer, and AI tools raise "the rate at which people can churn out code that needs to be reviewed" [1].
3. The same analysis reports that higher AI adoption is associated with higher delivery throughput and higher delivery instability, and suggests the verification burden may help explain the pattern; it names code review turnaround, failed deployment recovery time and deployment rework rates as the downstream signals to watch [1].
4. Faros AI (telemetry from over 10,000 developers on 1,255 teams): on teams with high AI adoption, developers completed 21% more tasks and merged 98% more pull requests, while pull request review time rose 91% and average pull request size grew 154%. The report calls human approval the "critical bottleneck" [2].
5. The same report found "no significant correlation between AI adoption and improvements at the company level" for throughput, DORA metrics or quality, and attributes it to downstream bottlenecks absorbing individual gains [2].
6. DORA's 2025 report overview states that "AI's primary role is as an amplifier, magnifying an organization's existing strengths and weaknesses", and that the greatest returns come from "a strategic focus on the underlying organizational system" rather than the tools [3].
7. Controlled studies of AI use measure about 1.1 to 1.6x on suited tasks and about 1.03x over whole occupations, and randomised trials of experienced developers using agentic tools measure 0.84x to 1.22x with intervals that include no change. The per-person speedup is small next to the claims, so the limit is not only the speed of the execution step [4].
8. Usage data show many users skip the steps that make delegation work: in one Claude.ai sample about half state their goal, 15.8% question the AI's reasoning and 8.7% check facts, so specifying and checking are the steps users under-do [5].

## Caveats

Findings 3 to 5 are correlations from observational data, so they do not show that review causes the missing company-level gain. Source [2] is a vendor's telemetry report; its sample is its own customers and its method standardises metrics within each company. Source [1] is self-reported by engineers of one company, and [3] is an overview page: the report's own throughput and instability text was not read. The Answer's specification claim is an inference: the sources show review load rising and say nothing about unclear specifications limiting output. Findings 7 and 8 are taken from earlier research files [4][5], whose own caveats apply, including that [5] draws on Claude users only. Amdahl's 1967 paper, the classic argument that speeding up one step of a system is capped by the share of time it takes, is not cited: its ACM page returned 403 and no primary copy was read. Evidence outside software delivery is not covered.

[1]: <https://dora.dev/insights/balancing-ai-tensions/> "DORA, Balancing AI tensions"
[2]: <https://www.faros.ai/blog/ai-software-engineering> "Faros AI, The AI Productivity Paradox Report 2025 (23 July 2025)"
[3]: <https://dora.dev/research/2025/dora-report/> "DORA, State of AI-assisted Software Development 2025 (overview page)"
[4]: <docs/llm-wiki/research/LLM/LLM-0019__ai-productivity-ceiling-per-level/research.md> "content-library research, Why do measured AI productivity gains fall short of the ceilings claimed for prompting, agents, workflows and a factory?"
[5]: <docs/episodes/ai-gives-you-more-work/research/AIE-0015__ai-users-execute-instead-of-manage/research.md> "content-library research, Why do people working with AI keep executing the work themselves instead of managing it?"
