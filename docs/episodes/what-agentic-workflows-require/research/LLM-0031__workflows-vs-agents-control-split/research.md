---
type: research
title: 'Why does Anthropic separate workflows, which follow paths fixed in
  advance, from agents, which steer their own process?'
description: 'Anthropic separates them by who controls the process, code or the
  model, because that choice trades predictability and low cost against
  flexibility and model-driven decisions.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T11:48:50Z
stale_after: 2027-05-14T00:00:00Z
sources:
  - id: 1
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents'
  - id: 2
    resource: docs/llm-wiki/research/LLM/LLM-0018__ai-layers-model-to-factory/research.md
    title: 'Research file LLM-0018, Why are a model, prompting, an agent, a workflow
      and a factory distinct layers of working with AI?'
---

# Why does Anthropic separate workflows, which follow paths fixed in advance, from agents, which steer their own process?

## Context

Supports the claim that an AI system can be built on two levels of control: a person or code fixes the path of steps, and a model decides how to carry out a step. It asks what reason the vendor that coined the split gives for drawing it.

## Answer

Anthropic draws the line at who controls the process: in a workflow, predefined code paths orchestrate the model and tools; in an agent, the model directs its own process and tool use. The reason is a trade-off. Workflows give predictability and consistency for well-defined tasks; agents give flexibility and model-driven decisions for open-ended problems, at the price of higher cost, latency and compounding errors. Anthropic therefore recommends the simplest solution that works and adding agent autonomy only when it demonstrably improves outcomes.

## Findings

1. Anthropic (19 Dec 2024) groups all variants as "agentic systems" but draws "an important architectural distinction": workflows are "systems where LLMs and tools are orchestrated through predefined code paths", agents are "systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks" [1]. Research file LLM-0018 records the same two definitions in its finding 7 [2].
2. The stated reason for choosing between them: "workflows offer predictability and consistency for well-defined tasks, whereas agents are the better option when flexibility and model-driven decision-making are needed at scale" [1].
3. Agentic systems "often trade latency and cost for better task performance", so the post recommends "the simplest solution possible, and only increasing complexity when needed", which "might mean not building agentic systems at all" [1].
4. Workflows fit a task that "can be easily and cleanly decomposed into fixed subtasks" (prompt chaining), or distinct input categories that can be classified accurately (routing); each pattern is described by the fixed structure code gives it, with optional programmatic checks ("gates") on intermediate steps [1].
5. Agents fit "open-ended problems where it's difficult or impossible to predict the required number of steps, and where you can't hardcode a fixed path"; the model "will potentially operate for many turns, and you must have some level of trust in its decision-making" [1].
6. Agent autonomy "means higher costs, and the potential for compounding errors"; Anthropic recommends extensive testing in sandboxed environments with guardrails, and stopping conditions such as a maximum number of iterations "to maintain control" [1].
7. An agent starts from a command or discussion with a person, then plans and operates independently, "potentially returning to the human for further information or judgement", and can pause "for human feedback at checkpoints or when encountering blockers" [1].
8. The line is not a hard wall: in the orchestrator-workers workflow a central LLM "dynamically breaks down tasks" and delegates, with subtasks "determined by the orchestrator based on the specific input", yet Anthropic still files it as a workflow [1]. The patterns are described as not prescriptive: "common patterns that developers can shape and combine" [1].

## Caveats

Findings 1 to 8 were read on the owning page [1]. The page carries a 2026 note that "much of the tooling landscape described in this post has changed since December 2024", so the vocabulary is dated; the distinction itself is not retracted on the page. The source describes software systems built by developers, not human organisations; applying "you design the path, the agent steers inside its task" to a team's process is an inference from findings 1, 2 and 8, not something the post says. The post gives no measurements of cost or error rates; the trade-offs are stated as experience from customer work. Finding 8 means the workflow and agent labels can both apply inside one system, so the split describes who controls each step, not a property of a whole product.

[1]: <https://www.anthropic.com/engineering/building-effective-agents> "Anthropic, Building effective agents"
[2]: <docs/llm-wiki/research/LLM/LLM-0018__ai-layers-model-to-factory/research.md> "Research file LLM-0018, Why are a model, prompting, an agent, a workflow and a factory distinct layers of working with AI?"
