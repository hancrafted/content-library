---
type: research
title: 'Why does AI-assisted execution shift work to specifying and reviewing in software roles: engineering, documentation, operations, billing and support?'
description: 'AI speeds up writing code, text and replies, but the saved effort reappears as review, specification and stability work downstream, because the hard part of software was always deciding what to build.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-10T00:00:00Z
stale_after: 2027-05-10T00:00:00Z
sources:
  - id: 1
    resource: https://worrydream.com/refs/Brooks_1986_-_No_Silver_Bullet.pdf
    title: 'Brooks, No Silver Bullet: Essence and Accident in Software Engineering'
  - id: 2
    resource: https://243608892.fs1.hubspotusercontent-na2.net/hubfs/243608892/AI_Engineering_Impact_Report_July_2025_Faros_AI.pdf
    title: 'Faros AI, What data from 10,000 developers reveals about impact, barriers, and the path forward'
  - id: 3
    resource: https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf
    title: 'DORA (Google Cloud), State of AI-assisted Software Development 2025'
  - id: 4
    resource: https://dora.dev/research/2024/dora-report/2024-dora-accelerate-state-of-devops-report.pdf
    title: 'DORA (Google Cloud), 2024 Accelerate State of DevOps Report'
  - id: 5
    resource: https://arxiv.org/abs/2507.09089
    title: 'Becker, Rush, Barnes and Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity'
  - id: 6
    resource: https://www.nber.org/papers/w31161
    title: 'Brynjolfsson, Li and Raymond, Generative AI at Work'
---

# Why does AI-assisted execution shift work to specifying and reviewing in software roles: engineering, documentation, operations, billing and support?

## Context

Asked to support the claim that AI pressure in a software organization moves from producing artefacts to specifying them and reviewing them, role by role. The question covers the roles on the software side of a product lifecycle. Evidence is strongest for engineering, thinner for documentation, operations and support, and absent for billing.

## Answer

Where AI takes over execution (code, text, replies), the volume of change grows, and the work reappears downstream as review and stability problems. Engineering shows it most clearly, but the evidence is disputed: vendor telemetry from Faros AI finds more and larger pull requests and about 91% longer review with no company-level gain [2], while the DORA 2024 survey finds AI adoption associated with 3.1% faster code review and 1.5% lower delivery throughput [4], and DORA 2025 finds throughput now rising with instability still rising [3]. DORA names the common cause as organizational: AI amplifies the clarity of workflows and alignment of teams that already exist [3]. That the saved effort moves into specifying work, because specifying was always the hard part [1], is an inference from Brooks and these studies; no Finding measures specification effort rising. For documentation, operations and support the evidence is partial, and for billing there is none.

## Findings

1. The hard part of building software is the specification, design and testing of the conceptual construct, not the labour of representing it; "deciding precisely what to build" is the hardest single part [1].
2. On teams with high AI adoption, developers completed 21% more tasks and merged 98% more pull requests, while pull request review time rose by about 91% [2].
3. On the same teams, average pull request size grew by 154% and bugs per developer by 9% [2].
4. Despite these team-level changes, no significant correlation appeared between AI adoption and company-level delivery measures (the four DORA metrics) [2].
5. AI adoption has a positive relationship with software delivery throughput in 2025, yet continues to have a negative relationship with delivery stability [3].
6. DORA reads this as systems not yet evolved to manage AI-accelerated development safely: "AI-assisted coding can increase the volume and velocity of changes, which can also lead to more instability" [3].
7. DORA calls AI "an amplifier" that magnifies the strengths of high-performing organizations and the dysfunctions of struggling ones, and says the greatest returns come from the clarity of workflows and the alignment of teams; without that foundation, AI creates "localized pockets of productivity that are often lost to downstream chaos" [3].
8. For documentation, a 25% rise in AI adoption was associated with a 7.5% rise in documentation quality, and with a 3.1% rise in code review speed, in the 2024 survey [4].
9. The same 2024 report associated AI adoption with a 1.5% fall in delivery throughput and a 7.2% fall in delivery stability, and hypothesized, without testing it, that larger changelists explain the drop; it concluded that improving development does not automatically improve delivery without small batch sizes and robust testing [4].
10. In a randomized trial of 16 experienced open-source developers on 246 tasks, allowing AI increased completion time by 19%, while the developers believed it saved 20% [5].
11. In customer support, an AI assistant raised issues resolved per hour by 14% on average across 5,179 agents, and by 34% for the least experienced, with minimal impact on the most experienced [6].

## Caveats

- The shift toward specifying is an inference. Brooks [1] predates AI, and no Finding shows specification effort rising in engineering or any other role; the Answer's link from more output to more specification and review rests on findings 1 to 3. "Rework" is likewise not measured: DORA 2024 only hypothesizes larger changes [4].
- Faros [2] and DORA 2024 [4] disagree on review and throughput; findings 2 and 8 are both reported, and neither study settles the sign.
- Billing has no source. Nothing found measures AI's effect on billing or invoicing work; any card text for billing is an inference from the general pattern (findings 5 and 6) and needs a human or a further research job.
- Documentation and operations rest on survey associations (DORA), not controlled trials; the DORA relationships are associative, not causal. The 2024 and 2025 reports disagree on throughput, so the throughput sign is unstable.
- Faros AI is a vendor reporting its own telemetry, and its correlations are weak (ρ = 0.08 for review time); read it as direction, not magnitude.
- The trial in finding 10 covers 16 developers on mature projects with early-2025 tools; its slowdown does not generalise to all engineers. It conflicts with the throughput gains in findings 2 and 5.
- Support evidence shows execution gains accruing to novices; it does not measure review or specification load in support. That the work shifts there is an inference from findings 1 and 2.
- Findings about named tool generations age fast, hence the six-month `stale_after`.

[1]: <https://worrydream.com/refs/Brooks_1986_-_No_Silver_Bullet.pdf> "Brooks, No Silver Bullet: Essence and Accident in Software Engineering"
[2]: <https://243608892.fs1.hubspotusercontent-na2.net/hubfs/243608892/AI_Engineering_Impact_Report_July_2025_Faros_AI.pdf> "Faros AI, What data from 10,000 developers reveals about impact, barriers, and the path forward"
[3]: <https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf> "DORA (Google Cloud), State of AI-assisted Software Development 2025"
[4]: <https://dora.dev/research/2024/dora-report/2024-dora-accelerate-state-of-devops-report.pdf> "DORA (Google Cloud), 2024 Accelerate State of DevOps Report"
[5]: <https://arxiv.org/abs/2507.09089> "Becker, Rush, Barnes and Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity"
[6]: <https://www.nber.org/papers/w31161> "Brynjolfsson, Li and Raymond, Generative AI at Work"
