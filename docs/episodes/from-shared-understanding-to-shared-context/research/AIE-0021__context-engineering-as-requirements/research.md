---
type: research
title: 'Why does context engineering for agents work like requirements engineering?'
description: 'Both decide what an agent is told before it works, and prompt-requirements research shows input quality drives output quality, but context is also dynamic, finite and unfixed by a signed-off document.'
generated:
  by: claude-code/sonnet-5.5
  at: 1970-01-01T00:00:00Z
stale_after: 2027-05-11T00:00:00Z
sources:
  - id: 1
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic, Effective context engineering for AI agents'
  - id: 2
    resource: https://arxiv.org/abs/2409.08775
    title: 'Ma, Peng, Yang, Shen, Koedinger, Wu, What Should We Engineer in Prompts? Training Humans in Requirement-Driven LLM Use'
  - id: 3
    resource: https://arxiv.org/abs/2503.02400
    title: 'Chen, Wang, Sun, Liu, Zhang, Liu, Promptware Engineering: Software Engineering for Prompt-Enabled Systems'
  - id: 4
    resource: https://arxiv.org/abs/2601.04556
    title: 'Yu, Zhao, 4D-ARE: Bridging the Attribution Gap in LLM Agent Requirements Engineering'
  - id: 5
    resource: https://arxiv.org/abs/2601.16507
    title: 'Shi, Sun, Chen, Wu, Chen, Jin, Liu, REprompt: Prompt Generation for Intelligent Software Development Guided by Requirements Engineering'
  - id: 6
    resource: docs/llm-wiki/research/AIE/AIE-0004__context-and-brief-improve-ai-output/research.md
    title: 'Why does richer context and a clearer brief measurably improve AI output? (earlier research file)'
  - id: 7
    resource: docs/llm-wiki/research/AIE/AIE-0008__written-requirements-reduce-variance/research.md
    title: 'Why do explicit written requirements reduce the variation in LLM output? (earlier research file)'
---

# Why does context engineering for agents work like requirements engineering?

## Context

Asked to support the claim that "context engineering is requirements engineering for agents": what goes into the context window decides whether the agent has what it needs to work towards the goal. The question is whether researchers and practitioners draw this parallel, what evidence backs it, and where the analogy stops.

## Answer

The parallel holds on the core job: both disciplines decide, before the work starts, which information the worker is given. Anthropic frames it as finding "the smallest possible set of high-signal tokens", and requirements-oriented prompt research finds that the quality of the stated requirements tracks the quality of the output. The parallel is drawn explicitly by researchers, but as a proposal; no source found states "context engineering is requirements engineering" as a finding. It breaks in three places: context is a finite budget that degrades as it fills, it changes during a run instead of being signed off once, and stating more is not safer, because piling on requirements lowered compliance.

## Findings

1. Anthropic defines context engineering as "the set of strategies for curating and maintaining the optimal set of tokens (information) during LLM inference", with the guiding principle of "the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome" [1].
2. Anthropic asks for system prompts at the right altitude, "specific enough to guide behavior effectively, yet flexible enough to provide the model with strong heuristics", between rigid hardcoded logic and vague guidance. This mirrors the requirements trade-off between over-constraining and under-specifying [1].
3. In a randomized experiment with 30 novices, training in Requirement-Oriented Prompt Engineering outperformed conventional prompt-engineering training (20% vs 1% gains), and the authors report a direct correlation between the quality of input requirements and LLM outputs. The paper argues that humans should spend effort on clear, complete requirements, not prompt tricks [2].
4. The Promptware Engineering roadmap treats natural-language prompts as "first-class software artifacts" and lists "prompt requirements engineering" as the first stage of an engineering lifecycle, because prompt development otherwise stays trial-and-error [3].
5. 4D-ARE adapts requirements engineering to LLM agents. Its motivating case: an agent with full data access gave metrics instead of causes, "we had not specified what to reason about". It argues design-time specification of what domain knowledge an agent needs is under-explored, and that its output translates into system prompts. It is a preliminary method with an industrial pilot and no rigorous evaluation yet [4].
6. REprompt posits that prompts "serve as carriers of user requirements" and builds a multi-agent prompt optimiser from requirements-engineering principles; the abstract reports effective optimisation of system and user prompts without numbers [5].
7. Measured effect of the requirements side: models guess an unstated requirement correctly about 41% of the time, and underspecified prompts are about twice as likely to regress across model or prompt changes [6][7]. Stating a requirement made its satisfaction more than 2x steadier across prompt variations [7].
8. Where the parallel breaks, first: context is a finite resource. Anthropic says recall decreases as tokens increase, so context has "diminishing marginal returns" and an "attention budget". A requirements document gains from completeness; a context window can lose from it. Irrelevant context also lowered accuracy in earlier research [1][6].
9. Second: context is dynamic. Agents hold lightweight identifiers such as file paths and links and "dynamically load data into context at runtime using tools", and compaction summarises a conversation into a new window, where "overly aggressive compaction can result in the loss of subtle but critical context". Requirements engineering has no equivalent of a window that is rewritten mid-project [1].
10. Third: more is not safer. Stating all requirements at once lowered compliance (98.7% for one requirement alone, 85.0% for gpt-4o with 19), and repository context files that restated discoverable information did not generally improve coding-agent success [6][7].

## Caveats

No source measures the analogy itself: the Answer's sentence that the two disciplines share a job is an inference from Anthropic's definition and from papers that import requirements engineering into prompting. Findings 4 to 6 are proposals or roadmaps; 4D-ARE and REprompt are early arXiv preprints, and 4D-ARE says empirical evaluation is future work. The ROPE result is on 30 novices in a trip-advisor chatbot setting, not on coding agents. The breaks in Findings 8 to 10 rest on Anthropic's guidance and the neighbouring files, not on a study comparing the two disciplines. Only the abstracts of the sources in Findings 3 to 6 were read, not the full papers.

[1]: <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents> "Anthropic, Effective context engineering for AI agents"
[2]: <https://arxiv.org/abs/2409.08775> "Ma, Peng, Yang, Shen, Koedinger, Wu, What Should We Engineer in Prompts? Training Humans in Requirement-Driven LLM Use"
[3]: <https://arxiv.org/abs/2503.02400> "Chen, Wang, Sun, Liu, Zhang, Liu, Promptware Engineering: Software Engineering for Prompt-Enabled Systems"
[4]: <https://arxiv.org/abs/2601.04556> "Yu, Zhao, 4D-ARE: Bridging the Attribution Gap in LLM Agent Requirements Engineering"
[5]: <https://arxiv.org/abs/2601.16507> "Shi, Sun, Chen, Wu, Chen, Jin, Liu, REprompt: Prompt Generation for Intelligent Software Development Guided by Requirements Engineering"
[6]: <docs/llm-wiki/research/AIE/AIE-0004__context-and-brief-improve-ai-output/research.md> "Why does richer context and a clearer brief measurably improve AI output? (earlier research file)"
[7]: <docs/llm-wiki/research/AIE/AIE-0008__written-requirements-reduce-variance/research.md> "Why do explicit written requirements reduce the variation in LLM output? (earlier research file)"
