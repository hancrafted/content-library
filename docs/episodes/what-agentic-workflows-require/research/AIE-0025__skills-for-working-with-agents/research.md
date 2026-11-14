---
type: research
title: 'Why are breaking work down, writing handoffs and reviewing results the
  skills people need to work with agents?'
description: "Agents move people's work to splitting goals, specifying tasks and
  checking results; sources show each task, but none tests the three as a set."
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T11:57:39Z
stale_after: 2027-05-14T00:00:00Z
sources:
  - id: 1
    resource: https://www.anthropic.com/engineering/multi-agent-research-system
    title: 'Anthropic, How we built our multi-agent research system'
  - id: 2
    resource: https://arxiv.org/abs/2602.11865
    title: 'Tomašev, Franklin, Osindero (Google DeepMind), Intelligent AI Delegation'
  - id: 3
    resource: https://www.microsoft.com/en-us/research/wp-content/uploads/2025/01/lee_2025_ai_critical_thinking_survey.pdf
    title: 'Lee et al. (Carnegie Mellon, Microsoft Research), The Impact of
      Generative AI on Critical Thinking (CHI 2025)'
  - id: 4
    resource: https://www.oneusefulthing.org/p/management-as-ai-superpower
    title: 'Mollick, Management as AI Superpower (One Useful Thing, 27 January 2026)'
  - id: 5
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents'
  - id: 6
    resource: docs/llm-wiki/research/AIE/AIE-0007__task-decomposition-improves-llm/research.md
    title: 'content-library research, Why does decomposing a complex task into
      smaller subtasks improve LLM results?'
  - id: 7
    resource: docs/llm-wiki/research/AIE/AIE-0006__ai-delegation-as-management-skill/research.md
    title: 'content-library research, Why is effective AI delegation a management
      discipline rather than a skill of seniority, given that AI boosts novices
      more on simple tasks?'
  - id: 8
    resource: docs/llm-wiki/research/AIE/AIE-0018__ai-shifts-bottleneck-to-spec-and-review/research.md
    title: 'content-library research, Why does AI-assisted execution move the
      bottleneck to specification and review?'
---

# Why are breaking work down, writing handoffs and reviewing results the skills people need to work with agents?

## Context

Asked to support the claim that people who work with agents spend their effort on three tasks instead of on doing the work: splitting a goal into tasks, stating for each task what the agent receives and must deliver, and checking what comes back. The question covers what agent builders, delegation theory and surveys of workers say about these three tasks. It does not cover whether a given training makes people better at them.

## Answer

When an agent does the work, the person's job becomes the three tasks around it: decomposing the goal, describing each task so it can be done, and verifying the result. Agent builders report that a lead agent given vague task descriptions produced duplicated work and gaps until each task carried an objective, an output format, tool guidance and boundaries [1]. A delegation framework from Google DeepMind makes decomposition depend on verification, so a task is split further until its result can be checked precisely [2]. A survey of 319 knowledge workers found their effort moving from doing tasks to steering the AI and judging its output [3], and independent measurements show review load rising with AI use [8]. The evidence for each task is real but indirect: none of these sources trains or tests the three skills as a set, and the claim that they are the skills to build is an inference.

## Findings

1. Decomposition and description are the delegator's work. Anthropic's lead agent "decomposes queries into subtasks and describes them to subagents" [1]. Its first instructions, such as "research the semiconductor shortage", were "vague enough that subagents misinterpreted the task or performed the exact same searches as other agents"; one subagent explored the 2021 automotive chip crisis while two others duplicated work on 2025 supply chains [1].
2. The fix Anthropic reports is a better handoff, not a better worker: "Each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries", because "Without detailed task descriptions, agents duplicate work, leave gaps, or fail to find necessary information" [1]. This is one team's account of its own system, not a controlled comparison.
3. Which subtasks exist is a decision made per input: in the orchestrator-workers pattern, "subtasks aren't pre-defined, but determined by the orchestrator based on the specific input" [5]. When a person plays the orchestrator, that decision is theirs.
4. Decomposition has measured value for language models. Earlier research in this repository, drawn from benchmark studies, finds that models often solve each sub-problem yet fail to compose them, and that separately prompted simpler subtasks close much of the gap, with errors in early steps still carrying forward [6].
5. Delegation is more than decomposition. Google DeepMind's framework says delegation "is more than just task decomposition into manageable sub-units of action" and requires assigning responsibility and authority, which "implicates accountability for outcomes" [2]. It lists verifiability among the task properties a delegator weighs: tasks with low verifiability, such as open-ended research, "require high-trust delegatees or expensive, labor-intensive oversight" [2].
6. The same framework ties the three skills together. Its "contract-first decomposition" is "a binding constraint, wherein task delegation is contingent upon the outcome having precise verification", and a subtask whose output is "too subjective, costly, or complex to verify" is to be decomposed further [2]. It adds that "effective verification is not an afterthought but a constraint on design" [2].
7. Workers describe this shift themselves. In a CHI 2025 survey of 319 knowledge workers sharing 936 examples, critical thinking moves "toward information verification, response integration, and task stewardship" [3]. Participants reported more effort on stewardship, defined by the authors as "translating intentions into queries, steering AI responses, and assessing if the AI response meets their quality standards for work, while retaining accountability for the work" [3].
8. The survey also finds that "higher confidence in GenAI is associated with less critical thinking, while higher self-confidence is associated with more critical thinking" [3]. Checking results is therefore a practice people can skip, not a given.
9. Review is where the extra load lands. Earlier research in this repository reports that Google engineers say "verification is a fundamentally different cognitive task than creation", and that a telemetry study of over 10,000 developers found 91% longer review time on high-adoption teams [8]. The same file records that users under-do specifying and checking: in one Claude.ai sample about half state their goal and 8.7% check facts [8].
10. Skipping the check has a measured cost. In the BCG experiment summarised earlier, consultants using AI on a task outside the model's frontier were 19 percentage points less likely to be correct, and the working paper says weaker performers "tended to blindly adopt its output and interrogate it less" [7].
11. Mollick calls these "management 101 skills": "If you can explain what you need, give effective feedback, and design ways of evaluating work, you are going to be able to work with agents" [4]. He argues the scarce skill is specification: "What's scarce is knowing what to ask for" [4].
12. For the handoff itself, Mollick lists the questions that good delegation documents answer: "What are we trying to accomplish, and why? Where are the limits of the delegated authority? What does "done" look like?" and "What interim outputs do I need to follow your progress?" [4]. He frames the delegation decision as a trade of the time to do the task yourself against "how long it takes you to request, wait for, and evaluate an AI output" [4].
13. Checking is not only a one-time gate. Anthropic's agent guidance has agents "pause for human feedback at checkpoints or when encountering blockers" [5], and its research system team found that "People testing agents find edge cases that evals miss", for example early agents that "consistently chose SEO-optimized content farms" over authoritative sources [1].
14. The skills are not obviously gained by doing the work. DeepMind's authors warn that the repetitive, narrow tasks through which junior staff build expertise "are precisely the ones that are most likely to be offloaded to AI agents", which would deprive them of the experience that builds the judgement oversight needs [2].

## Caveats

- No source tests the triad. Each source supports one or two of the three tasks, and the Answer's claim that these three together are the skills to build is a synthesis, not a finding.
- Source [2] is a conceptual framework, not an empirical study, and [4] is an expert's essay whose evidence is a class of MBA students and his own experience; both state a position the evidence does not test. Source [1] is a vendor describing its own system, and its examples are anecdotes.
- The worker survey [3] measures self-reported perceptions of effort on a Prolific sample of people who use GenAI at work at least weekly. It shows what workers say shifts, not that they delegate better or worse.
- The experiments cited through earlier files [6], [7], [8] use different tools, tasks and model generations, and their own caveats apply: the BCG result rests on one outside-the-frontier task, the decomposition benchmarks use GPT-3-era models and tasks with a known correct split, and the review-load studies are correlational.
- Evidence on skill gaps is thin. The sources show that people skip checking [3][8] and that experience may erode [2], but none measures how many people can currently break work down, write a handoff or review an agent's result.

[1]: <https://www.anthropic.com/engineering/multi-agent-research-system> "Anthropic, How we built our multi-agent research system"
[2]: <https://arxiv.org/abs/2602.11865> "Tomašev, Franklin, Osindero (Google DeepMind), Intelligent AI Delegation"
[3]: <https://www.microsoft.com/en-us/research/wp-content/uploads/2025/01/lee_2025_ai_critical_thinking_survey.pdf> "Lee et al. (Carnegie Mellon, Microsoft Research), The Impact of Generative AI on Critical Thinking (CHI 2025)"
[4]: <https://www.oneusefulthing.org/p/management-as-ai-superpower> "Mollick, Management as AI Superpower (One Useful Thing, 27 January 2026)"
[5]: <https://www.anthropic.com/engineering/building-effective-agents> "Anthropic, Building effective agents"
[6]: <docs/llm-wiki/research/AIE/AIE-0007__task-decomposition-improves-llm/research.md> "content-library research, Why does decomposing a complex task into smaller subtasks improve LLM results?"
[7]: <docs/llm-wiki/research/AIE/AIE-0006__ai-delegation-as-management-skill/research.md> "content-library research, Why is effective AI delegation a management discipline rather than a skill of seniority, given that AI boosts novices more on simple tasks?"
[8]: <docs/llm-wiki/research/AIE/AIE-0018__ai-shifts-bottleneck-to-spec-and-review/research.md> "content-library research, Why does AI-assisted execution move the bottleneck to specification and review?"
