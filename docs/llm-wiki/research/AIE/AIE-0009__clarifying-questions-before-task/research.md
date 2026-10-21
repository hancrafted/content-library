---
type: research
title: 'Why does letting an LLM ask clarifying questions before a task improve
  the result?'
description: "Clarifying questions improve results because they replace the
  model's guesses about missing requirements with the user's answers, but only
  for underspecified tasks."
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T14:08:32Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2212.07769
    title: 'Kuhn et al., CLAM: Selective Clarification for Ambiguous Questions with
      Generative Language Models'
  - id: 2
    resource: https://arxiv.org/abs/2502.13069
    title: 'Vijayvargiya et al., Ambig-SWE: Interactive Agents to Overcome
      Underspecificity in Software Engineering'
  - id: 3
    resource: https://arxiv.org/abs/2505.06120
    title: 'Laban et al., LLMs Get Lost In Multi-Turn Conversation'
  - id: 4
    resource: https://arxiv.org/abs/2310.11589
    title: 'Li et al., Eliciting Human Preferences with Language Models'
  - id: 5
    resource: https://arxiv.org/abs/2410.13788
    title: 'Zhang et al., Modeling Future Conversation Turns to Teach LLMs to Ask
      Clarifying Questions'
  - id: 6
    resource: https://arxiv.org/abs/2402.09205
    title: 'Qian et al., Tell Me More! Towards Implicit User Intention Understanding
      of Language Model Driven Agents'
---

# Why does letting an LLM ask clarifying questions before a task improve the result?

## Context

Asked to support the claim that a model should gather missing requirements before it starts, not after its first attempt. The claim is about what happens to underspecified instructions, and whether a question beats a guess.

## Answer

Instructions are often underspecified, and by default a model fills the gaps with assumptions instead of asking, so it answers a different task than the user meant. A clarifying question exchanges the guess for the user's actual answer before work starts, which measurably raises accuracy on ambiguous tasks. Models are poor at telling which tasks need a question, so the gain comes from asking on underspecified tasks and not from asking always.

## Findings

1. Current language models rarely ask users to clarify an ambiguous question and give an incorrect answer instead; prompting them to detect ambiguity, ask, and answer after the reply improves accuracy on mixed ambiguous and unambiguous questions [1].
2. On an underspecified variant of SWE-Bench Verified, agents that interacted with the user to fill missing information improved performance by up to 74% over the non-interactive setting [2].
3. In the same study, models struggled to distinguish well-specified from underspecified instructions, so knowing when to ask is a separate weakness from asking well [2].
4. Across six generation tasks, top models scored on average 39% lower when the instruction was spread over several turns than when given in full at once. Models made assumptions in early turns and prematurely attempted final solutions, on which they then over-relied, and did not recover from a wrong turn [3].
5. When a model elicits preferences through open-ended questions, the user's responses are often more informative than prompts the user wrote unaided, and users report this takes less effort than writing the prompt and surfaces considerations they had not anticipated [4].
6. Models trained to judge when a clarifying question is warranted, and to answer directly otherwise, were 3% more accurate at that judgment than models trained on standard preference labels [5].
7. A model trained to assess task vagueness and ask about intent before executing recovered critical missing information and reduced redundant tool usage in an agent system [6].

## Caveats

Most evidence comes from simulated users who hold the answer, from question-answering and code benchmarks, and from specific model versions that will change. Whether a person's real answers are as good, or how much asking costs in the person's time, is not measured here. Finding 4 measures the cost of underspecified instructions delivered in pieces, not clarifying questions themselves; reading it as the cost of leaving the gap unasked is an inference. The effect size in Finding 2 is a maximum, not a typical gain.

[1]: https://arxiv.org/abs/2212.07769 'Kuhn et al., CLAM: Selective Clarification for Ambiguous Questions with Generative Language Models'
[2]: https://arxiv.org/abs/2502.13069 'Vijayvargiya et al., Ambig-SWE: Interactive Agents to Overcome Underspecificity in Software Engineering'
[3]: https://arxiv.org/abs/2505.06120 'Laban et al., LLMs Get Lost In Multi-Turn Conversation'
[4]: https://arxiv.org/abs/2310.11589 'Li et al., Eliciting Human Preferences with Language Models'
[5]: https://arxiv.org/abs/2410.13788 'Zhang et al., Modeling Future Conversation Turns to Teach LLMs to Ask Clarifying Questions'
[6]: https://arxiv.org/abs/2402.09205 'Qian et al., Tell Me More! Towards Implicit User Intention Understanding of Language Model Driven Agents'
