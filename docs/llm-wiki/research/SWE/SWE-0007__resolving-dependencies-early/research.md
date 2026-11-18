---
type: research
title: 'Why does finding the dependencies between tasks before dividing the work
  help, and is fixing them early cheaper?'
description: 'Dependencies decide what can run in parallel, and agents split
  across dependent work duplicate or miss it; but the claim that late fixes cost
  far more was not found in 171 projects.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-18T00:58:00+01:00
stale_after: 2027-05-18T00:00:00+01:00
sources:
  - id: 1
    resource: https://www.anthropic.com/engineering/multi-agent-research-system
    title: 'Anthropic, How we built our multi-agent research system'
  - id: 2
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents'
  - id: 3
    resource: https://arxiv.org/abs/1609.04886
    title: 'Menzies et al., Are Delayed Issues Harder to Resolve? Revisiting
      Cost-to-Fix of Defects throughout the Lifecycle'
  - id: 4
    resource: docs/episodes/what-agentic-workflows-require/research/PLAN-0002__critical-path-backward-pass/research.md
    title: 'content-library research, Why is planning back from the goal a
      well-known project-management principle, as in the backward pass of the
      Critical Path Method?'
---

# Why does finding the dependencies between tasks before dividing the work help, and is fixing them early cheaper?

## Context

Asked to support "Resolve dependencies early", the second principle of an agentic workflow: learn which task needs which result before work is handed out. Two claims hide in it: that dependencies decide how work can be divided, and that resolving them early costs less than resolving them late. The question treats them separately, because the evidence differs.

## Answer

The first claim is supported by agent builders' own experience and by project scheduling: which tasks depend on which decides what can run in parallel. Anthropic found that multi-agent systems suit work that parallelizes and are a poor fit where many dependencies run between agents, and that vague delegation made subagents duplicate or miss work [1]. The second claim, that a late fix costs far more, is contested: a study of 171 projects found no consistent or substantial extra effort for issues resolved in a later phase [3]. "Early" is therefore supported as "before dividing the work", and not as a cost law.

## Findings

1. Anthropic's multi-agent research system gained most on breadth-first queries with independent directions; its authors write that domains where all agents share one context or have many dependencies between agents "are not a good fit for multi-agent systems today", and that most coding tasks have fewer parallelizable parts than research [1].
2. Without detailed task descriptions its subagents "duplicate work, leave gaps, or fail to find necessary information"; in one example, one subagent explored the 2021 chip crisis while two others duplicated work on 2025 supply chains [1].
3. Anthropic notes that agents are stateful and "errors compound", so a minor failure can be catastrophic without mitigations such as checkpoints and resuming from where the agent was [1][2].
4. The Critical Path Method works on jobs and their dependencies given as a diagram; it computes timing from them and, per the earlier research file, does not discover missing tasks [4].
5. A study of 171 software projects (2006 to 2014) "found no evidence for the delayed issue effect": the effort to resolve an issue in a later phase was not consistently or substantially greater than resolving it soon after it was introduced [3].
6. The same study reports that the belief is widely held, that Basili and Boehm called it a "major driver" of early verification, up-front prototyping and requirements analysis, and that some earlier data show a flatter cost curve in small projects or where architecture risk is removed early. The authors conclude the effect depends on the project and process, and may be a historical relic [3].

## Caveats

- The agent evidence is the builders' own report from one research feature, not a controlled comparison; the dependency-fit statement is a design judgement, not a measurement [1].
- The study in [3] is of human software projects. Whether delayed fixes cost more in agent workflows is untested; an agent that builds on a wrong early result may behave differently from a team.
- The study tests the cost of fixing defects across lifecycle phases. It does not test whether mapping dependencies before dividing work helps; that follows from [1] and [4] and is an inference.
- [1] and [2] describe named vendor products at a point in time, hence the six-month freshness.
- The file cites an earlier research file held in an Episode's staging; its own Caveats apply.

[1]: https://www.anthropic.com/engineering/multi-agent-research-system 'Anthropic, How we built our multi-agent research system'
[2]: https://www.anthropic.com/engineering/building-effective-agents 'Anthropic, Building effective agents'
[3]: https://arxiv.org/abs/1609.04886 'Menzies et al., Are Delayed Issues Harder to Resolve? Revisiting Cost-to-Fix of Defects throughout the Lifecycle'
[4]: docs/episodes/what-agentic-workflows-require/research/PLAN-0002__critical-path-backward-pass/research.md 'content-library research, Why is planning back from the goal a well-known project-management principle, as in the backward pass of the Critical Path Method?'
